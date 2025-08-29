import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Simple singleton for better-sqlite3
let db: Database.Database | null = null;

function getDbPath() {
  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "app.sqlite");
}

export function getDb() {
  if (!db) {
    db = new Database(getDbPath());
    db.pragma("journal_mode = WAL");
    init();
  }
  return db!;
}

function init() {
  const d = db!;
  d.exec(`
    -- Enable foreign key constraints
    PRAGMA foreign_keys = ON;

    -- Create packages table first
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Create packages_updated_at trigger
    CREATE TRIGGER IF NOT EXISTS packages_updated_at
    AFTER UPDATE ON packages
    FOR EACH ROW BEGIN
      UPDATE packages SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    -- Create groups table before systems since systems references it
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(package_id, name),
      FOREIGN KEY(package_id) REFERENCES packages(id) ON DELETE CASCADE
    );

    -- Create systems table after groups since it has a foreign key to groups
    CREATE TABLE IF NOT EXISTS systems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL,
      group_id INTEGER,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(package_id) REFERENCES packages(id) ON DELETE CASCADE,
      FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_systems_package_id ON systems(package_id);
    CREATE INDEX IF NOT EXISTS idx_systems_group_id ON systems(group_id);

    -- STIG CKLB imports
    CREATE TABLE IF NOT EXISTS stig_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_id INTEGER NOT NULL,
      title TEXT,
      checklist_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(system_id) REFERENCES systems(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stig_findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_id INTEGER NOT NULL,
      scan_id INTEGER NOT NULL,
      group_id TEXT,
      rule_id TEXT NOT NULL,
      rule_version TEXT,
      rule_title TEXT,
      severity TEXT,
      status TEXT,
      finding_details TEXT,
      check_content TEXT,
      fix_text TEXT,
      cci TEXT,
      first_seen TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(system_id, rule_id),
      FOREIGN KEY(system_id) REFERENCES systems(id) ON DELETE CASCADE,
      FOREIGN KEY(scan_id) REFERENCES stig_scans(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_stig_findings_system ON stig_findings(system_id);
    CREATE INDEX IF NOT EXISTS idx_stig_findings_severity ON stig_findings(severity);
    CREATE INDEX IF NOT EXISTS idx_stig_findings_status ON stig_findings(status);
  `);
  // Users and roles
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('Admin','ISSM','ISSO','SysAdmin','ISSE','Auditor')),
      password_hash TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW BEGIN
      UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);
  // Migration: add groups table and group_id to systems if they don't exist
  try {
    // Check if groups table exists
    const hasGroupsTable = d.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='groups'").get() !== undefined;
    
    if (!hasGroupsTable) {
      // Create groups table if it doesn't exist
      d.exec(`
        CREATE TABLE IF NOT EXISTS groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          package_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(package_id, name),
          FOREIGN KEY(package_id) REFERENCES packages(id) ON DELETE CASCADE
        );
      `);
    }
    
    // Check if systems has group_id column
    const sysCols = d.prepare("PRAGMA table_info('systems')").all() as Array<{ name: string }>;
    const hasGroupId = sysCols.some((r) => r.name === 'group_id');
    
    if (!hasGroupId) {
      // Add group_id column to systems if it doesn't exist
      d.exec(`
        -- Add group_id column with NULL allowed initially
        ALTER TABLE systems ADD COLUMN group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL;
        
        -- Create index for group_id
        CREATE INDEX IF NOT EXISTS idx_systems_group_id ON systems(group_id);
      `);
    }
    
    // For each package, ensure there's a default group
    const packages = d.prepare("SELECT id, name FROM packages").all() as Array<{ id: number; name: string }>;
    for (const pkg of packages) {
      // Ensure default group exists for this package
      let group = d.prepare("SELECT id FROM groups WHERE package_id = ? AND name = 'Default'").get(pkg.id) as {id: number} | undefined;
      if (!group) {
        const result = d.prepare("INSERT INTO groups (package_id, name, description) VALUES (?, ?, ?)")
          .run(pkg.id, 'Default', `Default group for ${pkg.name}`);
        group = { id: Number(result.lastInsertRowid) };
      }
      
      // Update any systems in this package that don't have a group
      d.prepare("UPDATE systems SET group_id = ? WHERE package_id = ? AND (group_id IS NULL OR group_id = 0)")
        .run(group.id, pkg.id);
    }
    
    // Migration for stig_findings (existing migration)
    const findingCols = d.prepare("PRAGMA table_info('stig_findings')").all() as Array<{ name: string }>;
    const hasStigFindingGroup = findingCols.some((r) => r.name === 'group_id');
    if (!hasStigFindingGroup) {
      d.exec("ALTER TABLE stig_findings ADD COLUMN group_id TEXT");
    }
    // Backfill: set group_id to rule_id where currently NULL
    d.exec("UPDATE stig_findings SET group_id = rule_id WHERE group_id IS NULL");

    // Migration: ensure users.password_hash exists
    const userCols = d.prepare("PRAGMA table_info('users')").all() as Array<{ name: string }>;
    const hasPwd = userCols.some((c) => c.name === 'password_hash');
    if (!hasPwd) {
      d.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
    }

    // Teams table
    d.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        lead_user_id INTEGER NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (lead_user_id) REFERENCES users(id)
      );

      CREATE TRIGGER IF NOT EXISTS teams_updated_at
      AFTER UPDATE ON teams
      FOR EACH ROW BEGIN
        UPDATE teams SET updated_at = datetime('now') WHERE id = NEW.id;
      END;
    `);

    // Team memberships table
    d.exec(`
      CREATE TABLE IF NOT EXISTS team_memberships (
        user_id INTEGER NOT NULL,
        team_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('Lead','Member')) DEFAULT 'Member',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, team_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      );
    `);

    // Add team_id to packages
    const packageCols = d.prepare("PRAGMA table_info('packages')").all() as Array<{ name: string }>;
    const hasTeamId = packageCols.some((c) => c.name === 'team_id');
    if (!hasTeamId) {
      d.exec("ALTER TABLE packages ADD COLUMN team_id INTEGER REFERENCES teams(id)");
    }

    // Seed a default Admin user if no users exist
    const userCount = (d.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c as number;
    if (userCount === 0) {
      d.prepare("INSERT INTO users (name, email, role, active) VALUES (?, ?, 'Admin', 1)")
        .run('Administrator', 'admin@dod.gov');
    }
  } catch (error) {
    console.error("Database migration error:", error);
  }
}

export type PackageRow = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type StigScanRow = {
  id: number;
  system_id: number;
  title: string | null;
  checklist_id: string | null;
  created_at: string;
};

export type StigFindingRow = {
  id: number;
  system_id: number;
  scan_id: number;
  group_id: string | null;
  rule_id: string;
  rule_version: string | null;
  rule_title: string | null;
  severity: string | null;
  status: string | null;
  finding_details: string | null;
  check_content: string | null;
  fix_text: string | null;
  cci: string | null;
  first_seen: string;
  last_seen: string;
};

export const STIG = {
  createScan(systemId: number, input: { title?: string; checklist_id?: string }): StigScanRow {
    const info = getDb()
      .prepare("INSERT INTO stig_scans (system_id, title, checklist_id) VALUES (?, ?, ?)")
      .run(systemId, input.title ?? null, input.checklist_id ?? null);
    return getDb().prepare("SELECT * FROM stig_scans WHERE id = ?").get(Number(info.lastInsertRowid)) as StigScanRow;
  },
  upsertFinding(systemId: number, scanId: number, input: {
    group_id?: string;
    rule_id: string;
    rule_version?: string;
    rule_title?: string;
    severity?: string;
    status?: string;
    finding_details?: string;
    check_content?: string;
    fix_text?: string;
    cci?: string;
  }): StigFindingRow {
    const selectStmt = getDb().prepare("SELECT * FROM stig_findings WHERE system_id = ? AND rule_id = ?");
    const existing = selectStmt.get(systemId, input.rule_id) as StigFindingRow | undefined;
    if (!existing) {
      const insert = getDb().prepare(`INSERT INTO stig_findings
        (system_id, scan_id, group_id, rule_id, rule_version, rule_title, severity, status, finding_details, check_content, fix_text, cci)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const info = insert.run(
        systemId,
        scanId,
        input.group_id ?? null,
        input.rule_id,
        input.rule_version ?? null,
        input.rule_title ?? null,
        input.severity ?? null,
        input.status ?? null,
        input.finding_details ?? null,
        input.check_content ?? null,
        input.fix_text ?? null,
        input.cci ?? null,
      );
      return getDb().prepare("SELECT * FROM stig_findings WHERE id = ?").get(Number(info.lastInsertRowid)) as StigFindingRow;
    }
    const update = getDb().prepare(`UPDATE stig_findings SET
      scan_id = ?,
      group_id = COALESCE(?, group_id),
      rule_version = COALESCE(?, rule_version),
      rule_title = COALESCE(?, rule_title),
      severity = COALESCE(?, severity),
      status = COALESCE(?, status),
      finding_details = COALESCE(?, finding_details),
      check_content = COALESCE(?, check_content),
      fix_text = COALESCE(?, fix_text),
      cci = COALESCE(?, cci),
      last_seen = datetime('now')
      WHERE system_id = ? AND rule_id = ?`);
    update.run(
      scanId,
      input.group_id ?? null,
      input.rule_version ?? null,
      input.rule_title ?? null,
      input.severity ?? null,
      input.status ?? null,
      input.finding_details ?? null,
      input.check_content ?? null,
      input.fix_text ?? null,
      input.cci ?? null,
      systemId,
      input.rule_id,
    );
    return selectStmt.get(systemId, input.rule_id) as StigFindingRow;
  },
  listScansBySystem(systemId: number): StigScanRow[] {
    return getDb()
      .prepare("SELECT * FROM stig_scans WHERE system_id = ? ORDER BY created_at DESC, id DESC")
      .all(systemId) as StigScanRow[];
  },
  listFindingsBySystem(systemId: number, opts?: { severity?: string; status?: string; q?: string; page?: number; pageSize?: number }): { items: StigFindingRow[]; total: number } {
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, opts?.pageSize ?? 20));
    const offset = (page - 1) * pageSize;

    const where: string[] = ["system_id = @system_id"];
    const params: Record<string, unknown> = { system_id: systemId };
    if (opts?.severity) { where.push("severity = @severity"); params.severity = opts.severity; }
    if (opts?.status) { where.push("status = @status"); params.status = opts.status; }
    if (opts?.q) { where.push("(group_id LIKE @q OR rule_id LIKE @q OR rule_title LIKE @q)"); params.q = `%${opts.q}%`; }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const total = (getDb().prepare(`SELECT COUNT(*) as c FROM stig_findings ${whereSql}`).get(params) as { c: number }).c as number;
    const items = getDb()
      .prepare(`SELECT * FROM stig_findings ${whereSql} ORDER BY last_seen DESC, id DESC LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit: pageSize, offset }) as StigFindingRow[];
    return { items, total };
  },
};

export type GroupRow = {
  id: number;
  package_id: number;
  name: string;
  description: string;
  created_at: string;
};

export const Groups = {
  all(): GroupRow[] {
    return getDb().prepare("SELECT * FROM groups ORDER BY name").all() as GroupRow[];
  },
  byPackage(packageId: number): GroupRow[] {
    return getDb().prepare("SELECT * FROM groups WHERE package_id = ? ORDER BY name").all(packageId) as GroupRow[];
  },
  get(id: number): GroupRow | undefined {
    return getDb().prepare("SELECT * FROM groups WHERE id = ?").get(id) as GroupRow | undefined;
  },
  create(packageId: number, input: { name: string; description?: string }): GroupRow {
    const info = getDb().prepare("INSERT INTO groups (package_id, name, description) VALUES (?, ?, ?)").run(packageId, input.name, input.description ?? "");
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: { name?: string; description?: string }): GroupRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    const name = input.name ?? current.name;
    const description = input.description ?? current.description;
    getDb().prepare("UPDATE groups SET name = ?, description = ? WHERE id = ?").run(name, description, id);
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM groups WHERE id = ?").run(id);
    return info.changes > 0;
  },
  ensureDefault(packageId: number): number {
    const existing = getDb().prepare("SELECT id FROM groups WHERE package_id = ? AND name = ?").get(packageId, 'Default') as { id: number } | undefined;
    if (existing) return existing.id;
    const info = getDb().prepare("INSERT INTO groups (package_id, name, description) VALUES (?, ?, ?)")
      .run(packageId, 'Default', 'Default group for package');
    return Number(info.lastInsertRowid);
  }
};

export type Role = 'Admin' | 'ISSM' | 'ISSO' | 'SysAdmin' | 'ISSE' | 'Auditor';

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: 0 | 1;
  created_at: string;
  updated_at: string;
};

export const Users = {
  all(): UserRow[] {
    return getDb().prepare("SELECT id, name, email, role, active, created_at, updated_at FROM users ORDER BY name ASC").all() as UserRow[];
  },
  get(id: number): UserRow | undefined {
    return getDb().prepare("SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = ?").get(id) as UserRow | undefined;
  },
  getByEmail(email: string): UserRow | undefined {
    return getDb().prepare("SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE email = ?").get(email) as UserRow | undefined;
  },
  create(input: { name: string; email: string; role: Role; active?: boolean; passwordHash?: string | null }): UserRow {
    const info = getDb()
      .prepare("INSERT INTO users (name, email, role, active, password_hash) VALUES (?, ?, ?, ?, ?)")
      .run(input.name, input.email, input.role, input.active === false ? 0 : 1, input.passwordHash ?? null);
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: { name?: string; email?: string; role?: Role; active?: boolean; passwordHash?: string | null }): UserRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    const name = input.name ?? current.name;
    const email = input.email ?? current.email;
    const role = input.role ?? current.role;
    const active: 0 | 1 = input.active === undefined ? current.active : input.active ? 1 : 0;
    if (input.passwordHash !== undefined) {
      getDb().prepare("UPDATE users SET name = ?, email = ?, role = ?, active = ?, password_hash = ? WHERE id = ?")
        .run(name, email, role, active, input.passwordHash, id);
    } else {
      getDb().prepare("UPDATE users SET name = ?, email = ?, role = ?, active = ? WHERE id = ?")
        .run(name, email, role, active, id);
    }
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
    return info.changes > 0;
  }
};

export type TeamRow = {
  id: number;
  name: string;
  description: string | null;
  lead_user_id: number;
  active: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type TeamMembershipRow = {
  user_id: number;
  team_id: number;
  role: 'Lead' | 'Member';
  created_at: string;
};

export const Teams = {
  all(): TeamRow[] {
    return getDb().prepare("SELECT * FROM teams ORDER BY name ASC").all() as TeamRow[];
  },
  get(id: number): TeamRow | undefined {
    return getDb().prepare("SELECT * FROM teams WHERE id = ?").get(id) as TeamRow | undefined;
  },
  create(input: { name: string; description?: string; lead_user_id: number; active?: boolean }): TeamRow {
    const info = getDb()
      .prepare("INSERT INTO teams (name, description, lead_user_id, active) VALUES (?, ?, ?, ?)")
      .run(input.name, input.description ?? null, input.lead_user_id, input.active === false ? 0 : 1);
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: { name?: string; description?: string; lead_user_id?: number; active?: boolean }): TeamRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    const name = input.name ?? current.name;
    const description = input.description ?? current.description;
    const lead_user_id = input.lead_user_id ?? current.lead_user_id;
    const active: 0 | 1 = input.active === undefined ? current.active : input.active ? 1 : 0;
    getDb().prepare("UPDATE teams SET name = ?, description = ?, lead_user_id = ?, active = ? WHERE id = ?")
      .run(name, description, lead_user_id, active, id);
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM teams WHERE id = ?").run(id);
    return info.changes > 0;
  },
  getMembers(teamId: number): Array<TeamMembershipRow & { user_name: string; user_email: string }> {
    return getDb().prepare(`
      SELECT tm.*, u.name as user_name, u.email as user_email 
      FROM team_memberships tm 
      JOIN users u ON tm.user_id = u.id 
      WHERE tm.team_id = ? 
      ORDER BY tm.role DESC, u.name ASC
    `).all(teamId) as Array<TeamMembershipRow & { user_name: string; user_email: string }>;
  },
  addMember(teamId: number, userId: number, role: 'Lead' | 'Member' = 'Member'): boolean {
    try {
      getDb().prepare("INSERT INTO team_memberships (team_id, user_id, role) VALUES (?, ?, ?)")
        .run(teamId, userId, role);
      return true;
    } catch {
      return false;
    }
  },
  removeMember(teamId: number, userId: number): boolean {
    const info = getDb().prepare("DELETE FROM team_memberships WHERE team_id = ? AND user_id = ?").run(teamId, userId);
    return info.changes > 0;
  },
  updateMemberRole(teamId: number, userId: number, role: 'Lead' | 'Member'): boolean {
    const info = getDb().prepare("UPDATE team_memberships SET role = ? WHERE team_id = ? AND user_id = ?")
      .run(role, teamId, userId);
    return info.changes > 0;
  }
};

export const Packages = {
  all(): PackageRow[] {
    return getDb().prepare("SELECT * FROM packages ORDER BY name").all() as PackageRow[];
  },
  get(id: number): PackageRow | undefined {
    return getDb().prepare("SELECT * FROM packages WHERE id = ?").get(id) as PackageRow | undefined;
  },
  create(input: { name: string; description?: string; team_id?: number }): PackageRow {
    const stmt = getDb().prepare("INSERT INTO packages (name, description, team_id) VALUES (?, ?, ?)");
    const info = stmt.run(input.name, input.description ?? "", input.team_id ?? null);
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: { name?: string; description?: string; team_id?: number }): PackageRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    const name = input.name ?? current.name;
    const description = input.description ?? current.description;
    const team_id = input.team_id !== undefined ? input.team_id : (current as { team_id?: number }).team_id;
    getDb().prepare("UPDATE packages SET name = ?, description = ?, team_id = ? WHERE id = ?").run(name, description, team_id, id);
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM packages WHERE id = ?").run(id);
    return info.changes > 0;
  },
};

export type SystemRow = {
  id: number;
  package_id: number;
  group_id: number | null;
  name: string;
  description: string;
  created_at: string;
};

export const Systems = {
  byPackage(packageId: number): SystemRow[] {
    return getDb()
      .prepare("SELECT * FROM systems WHERE package_id = ? ORDER BY name")
      .all(packageId) as SystemRow[];
  },
  byGroup(groupId: number): SystemRow[] {
    return getDb()
      .prepare("SELECT * FROM systems WHERE group_id = ? ORDER BY name")
      .all(groupId) as SystemRow[];
  },
  get(id: number): SystemRow | undefined {
    return getDb().prepare("SELECT * FROM systems WHERE id = ?").get(id) as SystemRow | undefined;
  },
  create(packageId: number, input: { name: string; description?: string; group_id?: number }): SystemRow {
    // Ensure a default group exists for the package if none provided
    let groupId = input.group_id;
    if (!groupId) {
      groupId = Groups.ensureDefault(packageId);
    }
    
    const stmt = getDb().prepare("INSERT INTO systems (package_id, group_id, name, description) VALUES (?, ?, ?, ?)");
    const info = stmt.run(packageId, groupId, input.name, input.description ?? "");
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: { 
    name?: string; 
    description?: string;
    group_id?: number | null;
  }): SystemRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const name = input.name ?? current.name;
    const description = input.description ?? current.description;
    const groupId = input.group_id !== undefined ? input.group_id : current.group_id;
    
    getDb()
      .prepare("UPDATE systems SET name = ?, description = ?, group_id = ? WHERE id = ?")
      .run(name, description, groupId, id);
      
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM systems WHERE id = ?").run(id);
    return info.changes > 0;
  },
  // Helper to migrate existing systems to have a default group
  ensureGroupsForPackage(packageId: number): void {
    // Check if any systems in this package are missing a group
    const ungrouped = getDb()
      .prepare("SELECT * FROM systems WHERE package_id = ? AND (group_id IS NULL OR group_id = 0)")
      .all(packageId) as SystemRow[];
      
    if (ungrouped.length > 0) {
      const defaultGroupId = Groups.ensureDefault(packageId);
      getDb()
        .prepare("UPDATE systems SET group_id = ? WHERE package_id = ? AND (group_id IS NULL OR group_id = 0)")
        .run(defaultGroupId, packageId);
    }
  }
};
