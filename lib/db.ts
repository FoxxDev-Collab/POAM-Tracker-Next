import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

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

    -- Create users table early since many tables reference it
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

    -- Security Test Plans (STPs)
    CREATE TABLE IF NOT EXISTS stps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      system_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Draft','In_Progress','Under_Review','Approved','Rejected')) DEFAULT 'Draft',
      priority TEXT NOT NULL CHECK (priority IN ('Low','Medium','High','Critical')) DEFAULT 'Medium',
      assigned_team_id INTEGER,
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      due_date TEXT,
      FOREIGN KEY(system_id) REFERENCES systems(id) ON DELETE CASCADE,
      FOREIGN KEY(package_id) REFERENCES packages(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_team_id) REFERENCES teams(id) ON DELETE SET NULL,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_stps_system ON stps(system_id);
    CREATE INDEX IF NOT EXISTS idx_stps_package ON stps(package_id);
    CREATE INDEX IF NOT EXISTS idx_stps_status ON stps(status);
    CREATE INDEX IF NOT EXISTS idx_stps_team ON stps(assigned_team_id);

    CREATE TRIGGER IF NOT EXISTS stps_updated_at
    AFTER UPDATE ON stps
    FOR EACH ROW BEGIN
      UPDATE stps SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    -- STP Test Cases
    CREATE TABLE IF NOT EXISTS stp_test_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stp_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      test_procedure TEXT DEFAULT '',
      expected_result TEXT DEFAULT '',
      actual_result TEXT DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('Not_Started','In_Progress','Passed','Failed','Blocked')) DEFAULT 'Not_Started',
      assigned_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(stp_id) REFERENCES stps(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_stp_test_cases_stp ON stp_test_cases(stp_id);
    CREATE INDEX IF NOT EXISTS idx_stp_test_cases_status ON stp_test_cases(status);

    CREATE TRIGGER IF NOT EXISTS stp_test_cases_updated_at
    AFTER UPDATE ON stp_test_cases
    FOR EACH ROW BEGIN
      UPDATE stp_test_cases SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    -- STP Evidence Files
    CREATE TABLE IF NOT EXISTS stp_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stp_id INTEGER NOT NULL,
      test_case_id INTEGER,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT,
      description TEXT DEFAULT '',
      uploaded_by INTEGER NOT NULL,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(stp_id) REFERENCES stps(id) ON DELETE CASCADE,
      FOREIGN KEY(test_case_id) REFERENCES stp_test_cases(id) ON DELETE CASCADE,
      FOREIGN KEY(uploaded_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_stp_evidence_stp ON stp_evidence(stp_id);
    CREATE INDEX IF NOT EXISTS idx_stp_evidence_test_case ON stp_evidence(test_case_id);

    -- POAM (Plan of Action & Milestones) tables
    CREATE TABLE IF NOT EXISTS poams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL,
      group_id INTEGER,
      poam_number TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      weakness_description TEXT,
      nist_control_id TEXT,
      severity TEXT NOT NULL CHECK (severity IN ('Critical','High','Medium','Low')) DEFAULT 'Medium',
      status TEXT NOT NULL CHECK (status IN ('Draft','Open','In_Progress','Completed','Closed','Cancelled')) DEFAULT 'Draft',
      priority TEXT NOT NULL CHECK (priority IN ('Low','Medium','High','Critical')) DEFAULT 'Medium',
      residual_risk_level TEXT CHECK (residual_risk_level IN ('Very Low','Low','Moderate','High','Very High')),
      target_completion_date TEXT,
      actual_completion_date TEXT,
      estimated_cost REAL,
      actual_cost REAL,
      poc_name TEXT,
      poc_email TEXT,
      poc_phone TEXT,
      assigned_team_id INTEGER,
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(package_id) REFERENCES packages(id) ON DELETE CASCADE,
      FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE SET NULL,
      FOREIGN KEY(assigned_team_id) REFERENCES teams(id) ON DELETE SET NULL,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_poams_package ON poams(package_id);
    CREATE INDEX IF NOT EXISTS idx_poams_group ON poams(group_id);
    CREATE INDEX IF NOT EXISTS idx_poams_status ON poams(status);
    CREATE INDEX IF NOT EXISTS idx_poams_severity ON poams(severity);
    CREATE INDEX IF NOT EXISTS idx_poams_team ON poams(assigned_team_id);
    CREATE INDEX IF NOT EXISTS idx_poams_poam_number ON poams(poam_number);

    CREATE TRIGGER IF NOT EXISTS poams_updated_at
    AFTER UPDATE ON poams
    FOR EACH ROW BEGIN
      UPDATE poams SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    -- POAM-STP associations
    CREATE TABLE IF NOT EXISTS poam_stps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poam_id INTEGER NOT NULL,
      stp_id INTEGER NOT NULL,
      contribution_percentage REAL CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100) DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(poam_id, stp_id),
      FOREIGN KEY(poam_id) REFERENCES poams(id) ON DELETE CASCADE,
      FOREIGN KEY(stp_id) REFERENCES stps(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_poam_stps_poam ON poam_stps(poam_id);
    CREATE INDEX IF NOT EXISTS idx_poam_stps_stp ON poam_stps(stp_id);

    -- POAM Milestones
    CREATE TABLE IF NOT EXISTS poam_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poam_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      target_date TEXT,
      actual_date TEXT,
      status TEXT NOT NULL CHECK (status IN ('Pending','In_Progress','Completed','Delayed','Cancelled')) DEFAULT 'Pending',
      milestone_type TEXT CHECK (milestone_type IN ('Planning','Design','Implementation','Testing','Documentation','Review','Deployment')) DEFAULT 'Implementation',
      deliverables TEXT DEFAULT '',
      success_criteria TEXT DEFAULT '',
      assigned_user_id INTEGER,
      completion_percentage REAL CHECK (completion_percentage >= 0 AND completion_percentage <= 100) DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(poam_id) REFERENCES poams(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_poam_milestones_poam ON poam_milestones(poam_id);
    CREATE INDEX IF NOT EXISTS idx_poam_milestones_status ON poam_milestones(status);
    CREATE INDEX IF NOT EXISTS idx_poam_milestones_assigned_user ON poam_milestones(assigned_user_id);
    CREATE INDEX IF NOT EXISTS idx_poam_milestones_target_date ON poam_milestones(target_date);

    CREATE TRIGGER IF NOT EXISTS poam_milestones_updated_at
    AFTER UPDATE ON poam_milestones
    FOR EACH ROW BEGIN
      UPDATE poam_milestones SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    -- POAM Comments/Notes
    CREATE TABLE IF NOT EXISTS poam_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poam_id INTEGER NOT NULL,
      milestone_id INTEGER,
      comment TEXT NOT NULL,
      comment_type TEXT CHECK (comment_type IN ('General','Status_Update','Risk_Assessment','Technical_Note','Management_Decision')) DEFAULT 'General',
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(poam_id) REFERENCES poams(id) ON DELETE CASCADE,
      FOREIGN KEY(milestone_id) REFERENCES poam_milestones(id) ON DELETE CASCADE,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_poam_comments_poam ON poam_comments(poam_id);
    CREATE INDEX IF NOT EXISTS idx_poam_comments_milestone ON poam_comments(milestone_id);
    CREATE INDEX IF NOT EXISTS idx_poam_comments_created_by ON poam_comments(created_by);

    CREATE TRIGGER IF NOT EXISTS poam_comments_updated_at
    AFTER UPDATE ON poam_comments
    FOR EACH ROW BEGIN
      UPDATE poam_comments SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    -- Audit Logs for security events
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      data TEXT,
      ip_address TEXT,
      user_agent TEXT,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

    -- Knowledge Center: Spaces (like Confluence spaces)
    CREATE TABLE IF NOT EXISTS kc_spaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT NOT NULL CHECK (type IN ('personal', 'team', 'global')) DEFAULT 'team',
      visibility TEXT NOT NULL CHECK (visibility IN ('public', 'restricted', 'private')) DEFAULT 'public',
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_kc_spaces_key ON kc_spaces(key);
    CREATE INDEX IF NOT EXISTS idx_kc_spaces_type ON kc_spaces(type);
    CREATE INDEX IF NOT EXISTS idx_kc_spaces_visibility ON kc_spaces(visibility);
    CREATE INDEX IF NOT EXISTS idx_kc_spaces_created_by ON kc_spaces(created_by);

    CREATE TRIGGER IF NOT EXISTS kc_spaces_updated_at
    AFTER UPDATE ON kc_spaces
    FOR EACH ROW BEGIN
      UPDATE kc_spaces SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    -- Knowledge Center: Pages (hierarchical structure)
    CREATE TABLE IF NOT EXISTS kc_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      space_id INTEGER NOT NULL,
      parent_id INTEGER,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      content TEXT DEFAULT '',
      content_type TEXT NOT NULL CHECK (content_type IN ('markdown', 'html', 'rich_text')) DEFAULT 'markdown',
      status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
      version INTEGER NOT NULL DEFAULT 1,
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_by INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      published_at TEXT,
      UNIQUE(space_id, slug),
      FOREIGN KEY(space_id) REFERENCES kc_spaces(id) ON DELETE CASCADE,
      FOREIGN KEY(parent_id) REFERENCES kc_pages(id) ON DELETE CASCADE,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(updated_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_kc_pages_space ON kc_pages(space_id);
    CREATE INDEX IF NOT EXISTS idx_kc_pages_parent ON kc_pages(parent_id);
    CREATE INDEX IF NOT EXISTS idx_kc_pages_slug ON kc_pages(slug);
    CREATE INDEX IF NOT EXISTS idx_kc_pages_status ON kc_pages(status);
    CREATE INDEX IF NOT EXISTS idx_kc_pages_created_by ON kc_pages(created_by);

    CREATE TRIGGER IF NOT EXISTS kc_pages_updated_at
    AFTER UPDATE ON kc_pages
    FOR EACH ROW BEGIN
      UPDATE kc_pages SET updated_at = datetime('now'), version = version + 1 WHERE id = NEW.id;
    END;

    -- Knowledge Center: Page Versions (for version history)
    CREATE TABLE IF NOT EXISTS kc_page_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      content_type TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      comment TEXT DEFAULT '',
      UNIQUE(page_id, version),
      FOREIGN KEY(page_id) REFERENCES kc_pages(id) ON DELETE CASCADE,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_kc_page_versions_page ON kc_page_versions(page_id);
    CREATE INDEX IF NOT EXISTS idx_kc_page_versions_version ON kc_page_versions(version);

    -- Knowledge Center: Comments
    CREATE TABLE IF NOT EXISTS kc_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL,
      parent_id INTEGER,
      content TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(page_id) REFERENCES kc_pages(id) ON DELETE CASCADE,
      FOREIGN KEY(parent_id) REFERENCES kc_comments(id) ON DELETE CASCADE,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_kc_comments_page ON kc_comments(page_id);
    CREATE INDEX IF NOT EXISTS idx_kc_comments_parent ON kc_comments(parent_id);
    CREATE INDEX IF NOT EXISTS idx_kc_comments_created_by ON kc_comments(created_by);

    CREATE TRIGGER IF NOT EXISTS kc_comments_updated_at
    AFTER UPDATE ON kc_comments
    FOR EACH ROW BEGIN
      UPDATE kc_comments SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    -- Knowledge Center: Attachments/Files
    CREATE TABLE IF NOT EXISTS kc_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER,
      space_id INTEGER,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT,
      description TEXT DEFAULT '',
      uploaded_by INTEGER NOT NULL,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(page_id) REFERENCES kc_pages(id) ON DELETE CASCADE,
      FOREIGN KEY(space_id) REFERENCES kc_spaces(id) ON DELETE CASCADE,
      FOREIGN KEY(uploaded_by) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_kc_attachments_page ON kc_attachments(page_id);
    CREATE INDEX IF NOT EXISTS idx_kc_attachments_space ON kc_attachments(space_id);
    CREATE INDEX IF NOT EXISTS idx_kc_attachments_uploaded_by ON kc_attachments(uploaded_by);

    -- Knowledge Center: Space Permissions
    CREATE TABLE IF NOT EXISTS kc_space_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      space_id INTEGER NOT NULL,
      user_id INTEGER,
      team_id INTEGER,
      permission TEXT NOT NULL CHECK (permission IN ('read', 'write', 'admin')) DEFAULT 'read',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(space_id) REFERENCES kc_spaces(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
      CHECK ((user_id IS NOT NULL AND team_id IS NULL) OR (user_id IS NULL AND team_id IS NOT NULL))
    );

    CREATE INDEX IF NOT EXISTS idx_kc_space_permissions_space ON kc_space_permissions(space_id);
    CREATE INDEX IF NOT EXISTS idx_kc_space_permissions_user ON kc_space_permissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_kc_space_permissions_team ON kc_space_permissions(team_id);
  `);
  // Users table already created earlier
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

    // Add enhanced ATO fields to packages
    const hasSystemType = packageCols.some((c) => c.name === 'system_type');
    if (!hasSystemType) {
      d.exec(`
        ALTER TABLE packages ADD COLUMN system_type TEXT CHECK (system_type IN ('Major Application','General Support System','Minor Application','Subsystem'));
        ALTER TABLE packages ADD COLUMN confidentiality_impact TEXT CHECK (confidentiality_impact IN ('Low','Moderate','High'));
        ALTER TABLE packages ADD COLUMN integrity_impact TEXT CHECK (integrity_impact IN ('Low','Moderate','High'));
        ALTER TABLE packages ADD COLUMN availability_impact TEXT CHECK (availability_impact IN ('Low','Moderate','High'));
        ALTER TABLE packages ADD COLUMN overall_categorization TEXT CHECK (overall_categorization IN ('Low','Moderate','High'));
        ALTER TABLE packages ADD COLUMN authorization_status TEXT CHECK (authorization_status IN ('Not Started','In Progress','Authorized','Reauthorization Required','Expired','Denied'));
        ALTER TABLE packages ADD COLUMN authorization_date TEXT;
        ALTER TABLE packages ADD COLUMN authorization_expiry TEXT;
        ALTER TABLE packages ADD COLUMN risk_assessment_date TEXT;
        ALTER TABLE packages ADD COLUMN residual_risk_level TEXT CHECK (residual_risk_level IN ('Very Low','Low','Moderate','High','Very High'));
        ALTER TABLE packages ADD COLUMN mission_criticality TEXT CHECK (mission_criticality IN ('Mission Critical','Mission Essential','Mission Support'));
        ALTER TABLE packages ADD COLUMN data_classification TEXT CHECK (data_classification IN ('Unclassified','CUI','Secret','Top Secret'));
        ALTER TABLE packages ADD COLUMN system_owner TEXT;
        ALTER TABLE packages ADD COLUMN authorizing_official TEXT;
        ALTER TABLE packages ADD COLUMN isso_name TEXT;
        ALTER TABLE packages ADD COLUMN security_control_baseline TEXT CHECK (security_control_baseline IN ('Low','Moderate','High','Tailored'));
        ALTER TABLE packages ADD COLUMN poam_status TEXT CHECK (poam_status IN ('Green','Yellow','Red'));
        ALTER TABLE packages ADD COLUMN continuous_monitoring_status TEXT CHECK (continuous_monitoring_status IN ('Fully Implemented','Partially Implemented','Not Implemented'));
      `);
    }

    // Seed a default Admin user if no users exist
    const userCount = (d.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c as number;
    if (userCount === 0) {
      // Default password: AdminPass123! (should be changed on first login)
      const defaultPasswordHash = bcrypt.hashSync('AdminPass123!', 12);
      d.prepare("INSERT INTO users (name, email, role, active, password_hash) VALUES (?, ?, 'Admin', 1, ?)")
        .run('Administrator', 'admin@dod.gov', defaultPasswordHash);
      console.log('Created default admin user - Email: admin@dod.gov, Password: AdminPass123!');
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
  team_id?: number | null;
  // Enhanced ATO fields
  system_type?: 'Major Application' | 'General Support System' | 'Minor Application' | 'Subsystem' | null;
  confidentiality_impact?: 'Low' | 'Moderate' | 'High' | null;
  integrity_impact?: 'Low' | 'Moderate' | 'High' | null;
  availability_impact?: 'Low' | 'Moderate' | 'High' | null;
  overall_categorization?: 'Low' | 'Moderate' | 'High' | null;
  authorization_status?: 'Not Started' | 'In Progress' | 'Authorized' | 'Reauthorization Required' | 'Expired' | 'Denied' | null;
  authorization_date?: string | null;
  authorization_expiry?: string | null;
  risk_assessment_date?: string | null;
  residual_risk_level?: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High' | null;
  mission_criticality?: 'Mission Critical' | 'Mission Essential' | 'Mission Support' | null;
  data_classification?: 'Unclassified' | 'CUI' | 'Secret' | 'Top Secret' | null;
  system_owner?: string | null;
  authorizing_official?: string | null;
  isso_name?: string | null;
  security_control_baseline?: 'Low' | 'Moderate' | 'High' | 'Tailored' | null;
  poam_status?: 'Green' | 'Yellow' | 'Red' | null;
  continuous_monitoring_status?: 'Fully Implemented' | 'Partially Implemented' | 'Not Implemented' | null;
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
  create(input: { 
    name: string; 
    description?: string; 
    team_id?: number;
    system_type?: string;
    confidentiality_impact?: string;
    integrity_impact?: string;
    availability_impact?: string;
    overall_categorization?: string;
    authorization_status?: string;
    authorization_date?: string;
    authorization_expiry?: string;
    risk_assessment_date?: string;
    residual_risk_level?: string;
    mission_criticality?: string;
    data_classification?: string;
    system_owner?: string;
    authorizing_official?: string;
    isso_name?: string;
    security_control_baseline?: string;
    poam_status?: string;
    continuous_monitoring_status?: string;
  }): PackageRow {
    const stmt = getDb().prepare(`
      INSERT INTO packages (
        name, description, team_id,
        system_type, confidentiality_impact, integrity_impact, availability_impact,
        overall_categorization, authorization_status, authorization_date, authorization_expiry,
        risk_assessment_date, residual_risk_level, mission_criticality, data_classification,
        system_owner, authorizing_official, isso_name, security_control_baseline,
        poam_status, continuous_monitoring_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.name, 
      input.description ?? "", 
      input.team_id ?? null,
      input.system_type ?? null,
      input.confidentiality_impact ?? null,
      input.integrity_impact ?? null,
      input.availability_impact ?? null,
      input.overall_categorization ?? null,
      input.authorization_status ?? 'Not Started',
      input.authorization_date ?? null,
      input.authorization_expiry ?? null,
      input.risk_assessment_date ?? null,
      input.residual_risk_level ?? null,
      input.mission_criticality ?? null,
      input.data_classification ?? null,
      input.system_owner ?? null,
      input.authorizing_official ?? null,
      input.isso_name ?? null,
      input.security_control_baseline ?? null,
      input.poam_status ?? null,
      input.continuous_monitoring_status ?? null
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: { 
    name?: string; 
    description?: string; 
    team_id?: number;
    system_type?: string;
    confidentiality_impact?: string;
    integrity_impact?: string;
    availability_impact?: string;
    overall_categorization?: string;
    authorization_status?: string;
    authorization_date?: string;
    authorization_expiry?: string;
    risk_assessment_date?: string;
    residual_risk_level?: string;
    mission_criticality?: string;
    data_classification?: string;
    system_owner?: string;
    authorizing_official?: string;
    isso_name?: string;
    security_control_baseline?: string;
    poam_status?: string;
    continuous_monitoring_status?: string;
  }): PackageRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const updates: string[] = [];
    const values: unknown[] = [];
    
    if (input.name !== undefined) { updates.push('name = ?'); values.push(input.name); }
    if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description); }
    if (input.team_id !== undefined) { updates.push('team_id = ?'); values.push(input.team_id); }
    if (input.system_type !== undefined) { updates.push('system_type = ?'); values.push(input.system_type); }
    if (input.confidentiality_impact !== undefined) { updates.push('confidentiality_impact = ?'); values.push(input.confidentiality_impact); }
    if (input.integrity_impact !== undefined) { updates.push('integrity_impact = ?'); values.push(input.integrity_impact); }
    if (input.availability_impact !== undefined) { updates.push('availability_impact = ?'); values.push(input.availability_impact); }
    if (input.overall_categorization !== undefined) { updates.push('overall_categorization = ?'); values.push(input.overall_categorization); }
    if (input.authorization_status !== undefined) { updates.push('authorization_status = ?'); values.push(input.authorization_status); }
    if (input.authorization_date !== undefined) { updates.push('authorization_date = ?'); values.push(input.authorization_date); }
    if (input.authorization_expiry !== undefined) { updates.push('authorization_expiry = ?'); values.push(input.authorization_expiry); }
    if (input.risk_assessment_date !== undefined) { updates.push('risk_assessment_date = ?'); values.push(input.risk_assessment_date); }
    if (input.residual_risk_level !== undefined) { updates.push('residual_risk_level = ?'); values.push(input.residual_risk_level); }
    if (input.mission_criticality !== undefined) { updates.push('mission_criticality = ?'); values.push(input.mission_criticality); }
    if (input.data_classification !== undefined) { updates.push('data_classification = ?'); values.push(input.data_classification); }
    if (input.system_owner !== undefined) { updates.push('system_owner = ?'); values.push(input.system_owner); }
    if (input.authorizing_official !== undefined) { updates.push('authorizing_official = ?'); values.push(input.authorizing_official); }
    if (input.isso_name !== undefined) { updates.push('isso_name = ?'); values.push(input.isso_name); }
    if (input.security_control_baseline !== undefined) { updates.push('security_control_baseline = ?'); values.push(input.security_control_baseline); }
    if (input.poam_status !== undefined) { updates.push('poam_status = ?'); values.push(input.poam_status); }
    if (input.continuous_monitoring_status !== undefined) { updates.push('continuous_monitoring_status = ?'); values.push(input.continuous_monitoring_status); }
    
    if (updates.length > 0) {
      values.push(id);
      getDb().prepare(`UPDATE packages SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    
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

// Security Test Plans (STPs)
export type STPStatus = 'Draft' | 'In_Progress' | 'Under_Review' | 'Approved' | 'Rejected';
export type STPPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TestCaseStatus = 'Not_Started' | 'In_Progress' | 'Passed' | 'Failed' | 'Blocked';

export type STPRow = {
  id: number;
  title: string;
  description: string;
  system_id: number;
  package_id: number;
  status: STPStatus;
  priority: STPPriority;
  assigned_team_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  due_date: string | null;
};

export type STPTestCaseRow = {
  id: number;
  stp_id: number;
  title: string;
  description: string;
  test_procedure: string;
  expected_result: string;
  actual_result: string;
  status: TestCaseStatus;
  assigned_user_id: number | null;
  created_at: string;
  updated_at: string;
};

export type STPEvidenceRow = {
  id: number;
  stp_id: number;
  test_case_id: number | null;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string | null;
  description: string;
  uploaded_by: number;
  uploaded_at: string;
};

export const STPs = {
  all(): STPRow[] {
    return getDb().prepare("SELECT * FROM stps ORDER BY created_at DESC").all() as STPRow[];
  },
  byPackage(packageId: number): STPRow[] {
    return getDb().prepare("SELECT * FROM stps WHERE package_id = ? ORDER BY created_at DESC").all(packageId) as STPRow[];
  },
  bySystem(systemId: number): STPRow[] {
    return getDb().prepare("SELECT * FROM stps WHERE system_id = ? ORDER BY created_at DESC").all(systemId) as STPRow[];
  },
  get(id: number): STPRow | undefined {
    return getDb().prepare("SELECT * FROM stps WHERE id = ?").get(id) as STPRow | undefined;
  },
  create(input: {
    title: string;
    description?: string;
    system_id: number;
    package_id: number;
    priority?: STPPriority;
    assigned_team_id?: number;
    created_by: number;
    due_date?: string;
  }): STPRow {
    const stmt = getDb().prepare(`
      INSERT INTO stps (title, description, system_id, package_id, priority, assigned_team_id, created_by, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.title,
      input.description ?? '',
      input.system_id,
      input.package_id,
      input.priority ?? 'Medium',
      input.assigned_team_id ?? null,
      input.created_by,
      input.due_date ?? null
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: {
    title?: string;
    description?: string;
    status?: STPStatus;
    priority?: STPPriority;
    assigned_team_id?: number | null;
    due_date?: string | null;
  }): STPRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const title = input.title ?? current.title;
    const description = input.description ?? current.description;
    const status = input.status ?? current.status;
    const priority = input.priority ?? current.priority;
    const assigned_team_id = input.assigned_team_id !== undefined ? input.assigned_team_id : current.assigned_team_id;
    const due_date = input.due_date !== undefined ? input.due_date : current.due_date;
    
    getDb().prepare(`
      UPDATE stps SET title = ?, description = ?, status = ?, priority = ?, assigned_team_id = ?, due_date = ?
      WHERE id = ?
    `).run(title, description, status, priority, assigned_team_id, due_date, id);
    
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM stps WHERE id = ?").run(id);
    return info.changes > 0;
  }
};

export const STPTestCases = {
  bySTP(stpId: number): STPTestCaseRow[] {
    return getDb().prepare("SELECT * FROM stp_test_cases WHERE stp_id = ? ORDER BY created_at ASC").all(stpId) as STPTestCaseRow[];
  },
  get(id: number): STPTestCaseRow | undefined {
    return getDb().prepare("SELECT * FROM stp_test_cases WHERE id = ?").get(id) as STPTestCaseRow | undefined;
  },
  create(input: {
    stp_id: number;
    title: string;
    description?: string;
    test_procedure?: string;
    expected_result?: string;
    assigned_user_id?: number;
  }): STPTestCaseRow {
    const stmt = getDb().prepare(`
      INSERT INTO stp_test_cases (stp_id, title, description, test_procedure, expected_result, assigned_user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.stp_id,
      input.title,
      input.description ?? '',
      input.test_procedure ?? '',
      input.expected_result ?? '',
      input.assigned_user_id ?? null
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: {
    title?: string;
    description?: string;
    test_procedure?: string;
    expected_result?: string;
    actual_result?: string;
    status?: TestCaseStatus;
    assigned_user_id?: number | null;
  }): STPTestCaseRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const title = input.title ?? current.title;
    const description = input.description ?? current.description;
    const test_procedure = input.test_procedure ?? current.test_procedure;
    const expected_result = input.expected_result ?? current.expected_result;
    const actual_result = input.actual_result ?? current.actual_result;
    const status = input.status ?? current.status;
    const assigned_user_id = input.assigned_user_id !== undefined ? input.assigned_user_id : current.assigned_user_id;
    
    getDb().prepare(`
      UPDATE stp_test_cases 
      SET title = ?, description = ?, test_procedure = ?, expected_result = ?, actual_result = ?, status = ?, assigned_user_id = ?
      WHERE id = ?
    `).run(title, description, test_procedure, expected_result, actual_result, status, assigned_user_id, id);
    
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM stp_test_cases WHERE id = ?").run(id);
    return info.changes > 0;
  }
};

// Knowledge Center Types and Operations
export type KCSpaceType = 'personal' | 'team' | 'global';
export type KCSpaceVisibility = 'public' | 'restricted' | 'private';
export type KCPageStatus = 'draft' | 'published' | 'archived';
export type KCContentType = 'markdown' | 'html' | 'rich_text';
export type KCPermission = 'read' | 'write' | 'admin';

export type KCSpaceRow = {
  id: number;
  key: string;
  name: string;
  description: string;
  type: KCSpaceType;
  visibility: KCSpaceVisibility;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type KCPageRow = {
  id: number;
  space_id: number;
  parent_id: number | null;
  title: string;
  slug: string;
  content: string;
  content_type: KCContentType;
  status: KCPageStatus;
  version: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  published_at: string | null;
};

export type KCPageVersionRow = {
  id: number;
  page_id: number;
  version: number;
  title: string;
  content: string;
  content_type: KCContentType;
  created_by: number;
  created_at: string;
  comment: string;
};

export type KCCommentRow = {
  id: number;
  page_id: number;
  parent_id: number | null;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type KCAttachmentRow = {
  id: number;
  page_id: number | null;
  space_id: number | null;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string | null;
  description: string;
  uploaded_by: number;
  uploaded_at: string;
};

export type KCSpacePermissionRow = {
  id: number;
  space_id: number;
  user_id: number | null;
  team_id: number | null;
  permission: KCPermission;
  created_at: string;
};

export const KCSpaces = {
  all(): KCSpaceRow[] {
    return getDb().prepare("SELECT * FROM kc_spaces ORDER BY name ASC").all() as KCSpaceRow[];
  },
  get(id: number): KCSpaceRow | undefined {
    return getDb().prepare("SELECT * FROM kc_spaces WHERE id = ?").get(id) as KCSpaceRow | undefined;
  },
  getByKey(key: string): KCSpaceRow | undefined {
    return getDb().prepare("SELECT * FROM kc_spaces WHERE key = ?").get(key) as KCSpaceRow | undefined;
  },
  create(input: {
    key: string;
    name: string;
    description?: string;
    type?: KCSpaceType;
    visibility?: KCSpaceVisibility;
    created_by: number;
  }): KCSpaceRow {
    const stmt = getDb().prepare(`
      INSERT INTO kc_spaces (key, name, description, type, visibility, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.key,
      input.name,
      input.description ?? '',
      input.type ?? 'team',
      input.visibility ?? 'public',
      input.created_by
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: {
    name?: string;
    description?: string;
    type?: KCSpaceType;
    visibility?: KCSpaceVisibility;
  }): KCSpaceRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const updates: string[] = [];
    const values: unknown[] = [];
    
    if (input.name !== undefined) { updates.push('name = ?'); values.push(input.name); }
    if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description); }
    if (input.type !== undefined) { updates.push('type = ?'); values.push(input.type); }
    if (input.visibility !== undefined) { updates.push('visibility = ?'); values.push(input.visibility); }
    
    if (updates.length > 0) {
      values.push(id);
      getDb().prepare(`UPDATE kc_spaces SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM kc_spaces WHERE id = ?").run(id);
    return info.changes > 0;
  },
  getByUser(userId: number): KCSpaceRow[] {
    return getDb().prepare(`
      SELECT DISTINCT s.* FROM kc_spaces s
      LEFT JOIN kc_space_permissions p ON s.id = p.space_id
      WHERE s.visibility = 'public' 
         OR s.created_by = ?
         OR p.user_id = ?
         OR p.team_id IN (SELECT team_id FROM team_memberships WHERE user_id = ?)
      ORDER BY s.name ASC
    `).all(userId, userId, userId) as KCSpaceRow[];
  }
};

export const KCPages = {
  all(): KCPageRow[] {
    return getDb().prepare("SELECT * FROM kc_pages ORDER BY title ASC").all() as KCPageRow[];
  },
  get(id: number): KCPageRow | undefined {
    return getDb().prepare("SELECT * FROM kc_pages WHERE id = ?").get(id) as KCPageRow | undefined;
  },
  getBySpaceAndSlug(spaceId: number, slug: string): KCPageRow | undefined {
    return getDb().prepare("SELECT * FROM kc_pages WHERE space_id = ? AND slug = ?").get(spaceId, slug) as KCPageRow | undefined;
  },
  getBySpace(spaceId: number): KCPageRow[] {
    return getDb().prepare("SELECT * FROM kc_pages WHERE space_id = ? ORDER BY title ASC").all(spaceId) as KCPageRow[];
  },
  getChildren(parentId: number): KCPageRow[] {
    return getDb().prepare("SELECT * FROM kc_pages WHERE parent_id = ? ORDER BY title ASC").all(parentId) as KCPageRow[];
  },
  getRootPages(spaceId: number): KCPageRow[] {
    return getDb().prepare("SELECT * FROM kc_pages WHERE space_id = ? AND parent_id IS NULL ORDER BY title ASC").all(spaceId) as KCPageRow[];
  },
  create(input: {
    space_id: number;
    parent_id?: number;
    title: string;
    slug: string;
    content?: string;
    content_type?: KCContentType;
    status?: KCPageStatus;
    created_by: number;
  }): KCPageRow {
    const stmt = getDb().prepare(`
      INSERT INTO kc_pages (space_id, parent_id, title, slug, content, content_type, status, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.space_id,
      input.parent_id ?? null,
      input.title,
      input.slug,
      input.content ?? '',
      input.content_type ?? 'markdown',
      input.status ?? 'draft',
      input.created_by,
      input.created_by
    );
    
    // Create initial version
    const pageId = Number(info.lastInsertRowid);
    KCPageVersions.create({
      page_id: pageId,
      version: 1,
      title: input.title,
      content: input.content ?? '',
      content_type: input.content_type ?? 'markdown',
      created_by: input.created_by,
      comment: 'Initial version'
    });
    
    return this.get(pageId)!;
  },
  update(id: number, input: {
    title?: string;
    content?: string;
    content_type?: KCContentType;
    status?: KCPageStatus;
    updated_by: number;
    version_comment?: string;
  }): KCPageRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const updates: string[] = [];
    const values: unknown[] = [];
    
    if (input.title !== undefined) { updates.push('title = ?'); values.push(input.title); }
    if (input.content !== undefined) { updates.push('content = ?'); values.push(input.content); }
    if (input.content_type !== undefined) { updates.push('content_type = ?'); values.push(input.content_type); }
    if (input.status !== undefined) { updates.push('status = ?'); values.push(input.status); }
    updates.push('updated_by = ?'); values.push(input.updated_by);
    
    if (input.status === 'published' && current.status !== 'published') {
      updates.push('published_at = datetime(\'now\')');
    }
    
    if (updates.length > 0) {
      values.push(id);
      getDb().prepare(`UPDATE kc_pages SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      
      // Create new version if content changed
      if (input.content !== undefined || input.title !== undefined) {
        const updated = this.get(id)!;
        KCPageVersions.create({
          page_id: id,
          version: updated.version,
          title: updated.title,
          content: updated.content,
          content_type: updated.content_type,
          created_by: input.updated_by,
          comment: input.version_comment ?? 'Updated content'
        });
      }
    }
    
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM kc_pages WHERE id = ?").run(id);
    return info.changes > 0;
  },
  search(query: string, spaceId?: number): KCPageRow[] {
    const sql = spaceId 
      ? "SELECT * FROM kc_pages WHERE (title LIKE ? OR content LIKE ?) AND space_id = ? ORDER BY title ASC"
      : "SELECT * FROM kc_pages WHERE title LIKE ? OR content LIKE ? ORDER BY title ASC";
    const searchTerm = `%${query}%`;
    return spaceId 
      ? getDb().prepare(sql).all(searchTerm, searchTerm, spaceId) as KCPageRow[]
      : getDb().prepare(sql).all(searchTerm, searchTerm) as KCPageRow[];
  }
};

export const KCPageVersions = {
  getByPage(pageId: number): KCPageVersionRow[] {
    return getDb().prepare("SELECT * FROM kc_page_versions WHERE page_id = ? ORDER BY version DESC").all(pageId) as KCPageVersionRow[];
  },
  get(pageId: number, version: number): KCPageVersionRow | undefined {
    return getDb().prepare("SELECT * FROM kc_page_versions WHERE page_id = ? AND version = ?").get(pageId, version) as KCPageVersionRow | undefined;
  },
  create(input: {
    page_id: number;
    version: number;
    title: string;
    content: string;
    content_type: KCContentType;
    created_by: number;
    comment?: string;
  }): KCPageVersionRow {
    const stmt = getDb().prepare(`
      INSERT INTO kc_page_versions (page_id, version, title, content, content_type, created_by, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      input.page_id,
      input.version,
      input.title,
      input.content,
      input.content_type,
      input.created_by,
      input.comment ?? ''
    );
    return this.get(input.page_id, input.version)!;
  }
};

export const KCComments = {
  getByPage(pageId: number): Array<KCCommentRow & { author_name: string; author_email: string }> {
    return getDb().prepare(`
      SELECT c.*, u.name as author_name, u.email as author_email
      FROM kc_comments c
      JOIN users u ON c.created_by = u.id
      WHERE c.page_id = ?
      ORDER BY c.created_at ASC
    `).all(pageId) as Array<KCCommentRow & { author_name: string; author_email: string }>;
  },
  get(id: number): KCCommentRow | undefined {
    return getDb().prepare("SELECT * FROM kc_comments WHERE id = ?").get(id) as KCCommentRow | undefined;
  },
  create(input: {
    page_id: number;
    parent_id?: number;
    content: string;
    created_by: number;
  }): KCCommentRow {
    const stmt = getDb().prepare(`
      INSERT INTO kc_comments (page_id, parent_id, content, created_by)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.page_id,
      input.parent_id ?? null,
      input.content,
      input.created_by
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: { content: string }): KCCommentRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    getDb().prepare("UPDATE kc_comments SET content = ? WHERE id = ?").run(input.content, id);
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM kc_comments WHERE id = ?").run(id);
    return info.changes > 0;
  }
};

export const KCAttachments = {
  getByPage(pageId: number): KCAttachmentRow[] {
    return getDb().prepare("SELECT * FROM kc_attachments WHERE page_id = ? ORDER BY uploaded_at DESC").all(pageId) as KCAttachmentRow[];
  },
  getBySpace(spaceId: number): KCAttachmentRow[] {
    return getDb().prepare("SELECT * FROM kc_attachments WHERE space_id = ? ORDER BY uploaded_at DESC").all(spaceId) as KCAttachmentRow[];
  },
  get(id: number): KCAttachmentRow | undefined {
    return getDb().prepare("SELECT * FROM kc_attachments WHERE id = ?").get(id) as KCAttachmentRow | undefined;
  },
  create(input: {
    page_id?: number;
    space_id?: number;
    filename: string;
    original_filename: string;
    file_size: number;
    mime_type?: string;
    description?: string;
    uploaded_by: number;
  }): KCAttachmentRow {
    const stmt = getDb().prepare(`
      INSERT INTO kc_attachments (page_id, space_id, filename, original_filename, file_size, mime_type, description, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.page_id ?? null,
      input.space_id ?? null,
      input.filename,
      input.original_filename,
      input.file_size,
      input.mime_type ?? null,
      input.description ?? '',
      input.uploaded_by
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM kc_attachments WHERE id = ?").run(id);
    return info.changes > 0;
  }
};

export const KCSpacePermissions = {
  getBySpace(spaceId: number): Array<KCSpacePermissionRow & { user_name?: string; team_name?: string }> {
    return getDb().prepare(`
      SELECT p.*, u.name as user_name, t.name as team_name
      FROM kc_space_permissions p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.space_id = ?
      ORDER BY p.permission DESC, u.name ASC, t.name ASC
    `).all(spaceId) as Array<KCSpacePermissionRow & { user_name?: string; team_name?: string }>;
  },
  create(input: {
    space_id: number;
    user_id?: number;
    team_id?: number;
    permission: KCPermission;
  }): KCSpacePermissionRow {
    const stmt = getDb().prepare(`
      INSERT INTO kc_space_permissions (space_id, user_id, team_id, permission)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.space_id,
      input.user_id ?? null,
      input.team_id ?? null,
      input.permission
    );
    return getDb().prepare("SELECT * FROM kc_space_permissions WHERE id = ?").get(Number(info.lastInsertRowid)) as KCSpacePermissionRow;
  },
  update(id: number, permission: KCPermission): boolean {
    const info = getDb().prepare("UPDATE kc_space_permissions SET permission = ? WHERE id = ?").run(permission, id);
    return info.changes > 0;
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM kc_space_permissions WHERE id = ?").run(id);
    return info.changes > 0;
  },
  checkPermission(spaceId: number, userId: number): KCPermission | null {
    // Check direct user permission
    const userPerm = getDb().prepare(`
      SELECT permission FROM kc_space_permissions 
      WHERE space_id = ? AND user_id = ?
      ORDER BY CASE permission WHEN 'admin' THEN 3 WHEN 'write' THEN 2 WHEN 'read' THEN 1 END DESC
      LIMIT 1
    `).get(spaceId, userId) as { permission: KCPermission } | undefined;
    
    if (userPerm) return userPerm.permission;
    
    // Check team permissions
    const teamPerm = getDb().prepare(`
      SELECT p.permission FROM kc_space_permissions p
      JOIN team_memberships tm ON p.team_id = tm.team_id
      WHERE p.space_id = ? AND tm.user_id = ?
      ORDER BY CASE p.permission WHEN 'admin' THEN 3 WHEN 'write' THEN 2 WHEN 'read' THEN 1 END DESC
      LIMIT 1
    `).get(spaceId, userId) as { permission: KCPermission } | undefined;
    
    if (teamPerm) return teamPerm.permission;
    
    // Check if space is public
    const space = KCSpaces.get(spaceId);
    if (space?.visibility === 'public') return 'read';
    
    return null;
  }
};

// POAM Types and Operations
export type PoamSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type PoamStatus = 'Draft' | 'Open' | 'In_Progress' | 'Completed' | 'Closed' | 'Cancelled';
export type MilestoneStatus = 'Pending' | 'In_Progress' | 'Completed' | 'Delayed' | 'Cancelled';
export type MilestoneType = 'Planning' | 'Design' | 'Implementation' | 'Testing' | 'Documentation' | 'Review' | 'Deployment';
export type CommentType = 'General' | 'Status_Update' | 'Risk_Assessment' | 'Technical_Note' | 'Management_Decision';

export type PoamRow = {
  id: number;
  package_id: number;
  group_id: number | null;
  poam_number: string;
  title: string;
  weakness_description: string | null;
  nist_control_id: string | null;
  severity: PoamSeverity;
  status: PoamStatus;
  priority: STPPriority;
  residual_risk_level: string | null;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  poc_name: string | null;
  poc_email: string | null;
  poc_phone: string | null;
  assigned_team_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type PoamStpRow = {
  id: number;
  poam_id: number;
  stp_id: number;
  contribution_percentage: number;
  created_at: string;
};

export type PoamMilestoneRow = {
  id: number;
  poam_id: number;
  title: string;
  description: string;
  target_date: string | null;
  actual_date: string | null;
  status: MilestoneStatus;
  milestone_type: MilestoneType;
  deliverables: string;
  success_criteria: string;
  assigned_user_id: number | null;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
};

export type PoamCommentRow = {
  id: number;
  poam_id: number;
  milestone_id: number | null;
  comment: string;
  comment_type: CommentType;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export const POAMs = {
  all(): PoamRow[] {
    return getDb().prepare("SELECT * FROM poams ORDER BY created_at DESC").all() as PoamRow[];
  },
  byPackage(packageId: number): PoamRow[] {
    return getDb().prepare("SELECT * FROM poams WHERE package_id = ? ORDER BY created_at DESC").all(packageId) as PoamRow[];
  },
  byGroup(groupId: number): PoamRow[] {
    return getDb().prepare("SELECT * FROM poams WHERE group_id = ? ORDER BY created_at DESC").all(groupId) as PoamRow[];
  },
  get(id: number): PoamRow | undefined {
    return getDb().prepare("SELECT * FROM poams WHERE id = ?").get(id) as PoamRow | undefined;
  },
  getByPoamNumber(poamNumber: string): PoamRow | undefined {
    return getDb().prepare("SELECT * FROM poams WHERE poam_number = ?").get(poamNumber) as PoamRow | undefined;
  },
  create(input: {
    package_id: number;
    group_id?: number;
    poam_number: string;
    title: string;
    weakness_description?: string;
    nist_control_id?: string;
    severity?: PoamSeverity;
    priority?: STPPriority;
    residual_risk_level?: string;
    target_completion_date?: string;
    estimated_cost?: number;
    poc_name?: string;
    poc_email?: string;
    poc_phone?: string;
    assigned_team_id?: number;
    created_by: number;
  }): PoamRow {
    const stmt = getDb().prepare(`
      INSERT INTO poams (
        package_id, group_id, poam_number, title, weakness_description, nist_control_id,
        severity, priority, residual_risk_level, target_completion_date, estimated_cost,
        poc_name, poc_email, poc_phone, assigned_team_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.package_id,
      input.group_id ?? null,
      input.poam_number,
      input.title,
      input.weakness_description ?? null,
      input.nist_control_id ?? null,
      input.severity ?? 'Medium',
      input.priority ?? 'Medium',
      input.residual_risk_level ?? null,
      input.target_completion_date ?? null,
      input.estimated_cost ?? null,
      input.poc_name ?? null,
      input.poc_email ?? null,
      input.poc_phone ?? null,
      input.assigned_team_id ?? null,
      input.created_by
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: {
    title?: string;
    weakness_description?: string;
    nist_control_id?: string;
    severity?: PoamSeverity;
    status?: PoamStatus;
    priority?: STPPriority;
    residual_risk_level?: string;
    target_completion_date?: string;
    actual_completion_date?: string;
    estimated_cost?: number;
    actual_cost?: number;
    poc_name?: string;
    poc_email?: string;
    poc_phone?: string;
    assigned_team_id?: number | null;
  }): PoamRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const updates: string[] = [];
    const values: unknown[] = [];
    
    if (input.title !== undefined) { updates.push('title = ?'); values.push(input.title); }
    if (input.weakness_description !== undefined) { updates.push('weakness_description = ?'); values.push(input.weakness_description); }
    if (input.nist_control_id !== undefined) { updates.push('nist_control_id = ?'); values.push(input.nist_control_id); }
    if (input.severity !== undefined) { updates.push('severity = ?'); values.push(input.severity); }
    if (input.status !== undefined) { updates.push('status = ?'); values.push(input.status); }
    if (input.priority !== undefined) { updates.push('priority = ?'); values.push(input.priority); }
    if (input.residual_risk_level !== undefined) { updates.push('residual_risk_level = ?'); values.push(input.residual_risk_level); }
    if (input.target_completion_date !== undefined) { updates.push('target_completion_date = ?'); values.push(input.target_completion_date); }
    if (input.actual_completion_date !== undefined) { updates.push('actual_completion_date = ?'); values.push(input.actual_completion_date); }
    if (input.estimated_cost !== undefined) { updates.push('estimated_cost = ?'); values.push(input.estimated_cost); }
    if (input.actual_cost !== undefined) { updates.push('actual_cost = ?'); values.push(input.actual_cost); }
    if (input.poc_name !== undefined) { updates.push('poc_name = ?'); values.push(input.poc_name); }
    if (input.poc_email !== undefined) { updates.push('poc_email = ?'); values.push(input.poc_email); }
    if (input.poc_phone !== undefined) { updates.push('poc_phone = ?'); values.push(input.poc_phone); }
    if (input.assigned_team_id !== undefined) { updates.push('assigned_team_id = ?'); values.push(input.assigned_team_id); }
    
    if (updates.length > 0) {
      values.push(id);
      getDb().prepare(`UPDATE poams SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM poams WHERE id = ?").run(id);
    return info.changes > 0;
  },
  generatePoamNumber(packageId: number): string {
    // Get package name for prefix
    const pkg = Packages.get(packageId);
    const prefix = pkg?.name.substring(0, 3).toUpperCase() || 'PKG';
    
    // Get next sequential number for this package
    const count = getDb().prepare("SELECT COUNT(*) as count FROM poams WHERE package_id = ?").get(packageId) as { count: number };
    const nextNumber = (count.count + 1).toString().padStart(3, '0');
    
    return `${prefix}-POAM-${nextNumber}`;
  }
};

export const PoamStps = {
  byPoam(poamId: number): Array<PoamStpRow & { stp_title: string; stp_status: STPStatus }> {
    return getDb().prepare(`
      SELECT ps.*, s.title as stp_title, s.status as stp_status 
      FROM poam_stps ps
      JOIN stps s ON ps.stp_id = s.id
      WHERE ps.poam_id = ?
      ORDER BY ps.created_at ASC
    `).all(poamId) as Array<PoamStpRow & { stp_title: string; stp_status: STPStatus }>;
  },
  byStp(stpId: number): Array<PoamStpRow & { poam_title: string; poam_number: string }> {
    return getDb().prepare(`
      SELECT ps.*, p.title as poam_title, p.poam_number
      FROM poam_stps ps
      JOIN poams p ON ps.poam_id = p.id
      WHERE ps.stp_id = ?
      ORDER BY ps.created_at ASC
    `).all(stpId) as Array<PoamStpRow & { poam_title: string; poam_number: string }>;
  },
  get(poamId: number, stpId: number): PoamStpRow | undefined {
    return getDb().prepare("SELECT * FROM poam_stps WHERE poam_id = ? AND stp_id = ?").get(poamId, stpId) as PoamStpRow | undefined;
  },
  create(input: {
    poam_id: number;
    stp_id: number;
    contribution_percentage?: number;
  }): PoamStpRow {
    const stmt = getDb().prepare(`
      INSERT INTO poam_stps (poam_id, stp_id, contribution_percentage)
      VALUES (?, ?, ?)
    `);
    stmt.run(
      input.poam_id,
      input.stp_id,
      input.contribution_percentage ?? 100
    );
    return this.get(input.poam_id, input.stp_id)!;
  },
  update(poamId: number, stpId: number, contributionPercentage: number): PoamStpRow | undefined {
    const current = this.get(poamId, stpId);
    if (!current) return undefined;
    
    getDb().prepare("UPDATE poam_stps SET contribution_percentage = ? WHERE poam_id = ? AND stp_id = ?")
      .run(contributionPercentage, poamId, stpId);
    
    return this.get(poamId, stpId);
  },
  remove(poamId: number, stpId: number): boolean {
    const info = getDb().prepare("DELETE FROM poam_stps WHERE poam_id = ? AND stp_id = ?").run(poamId, stpId);
    return info.changes > 0;
  }
};

export const PoamMilestones = {
  byPoam(poamId: number): PoamMilestoneRow[] {
    return getDb().prepare("SELECT * FROM poam_milestones WHERE poam_id = ? ORDER BY target_date ASC, created_at ASC").all(poamId) as PoamMilestoneRow[];
  },
  get(id: number): PoamMilestoneRow | undefined {
    return getDb().prepare("SELECT * FROM poam_milestones WHERE id = ?").get(id) as PoamMilestoneRow | undefined;
  },
  create(input: {
    poam_id: number;
    title: string;
    description?: string;
    target_date?: string;
    milestone_type?: MilestoneType;
    deliverables?: string;
    success_criteria?: string;
    assigned_user_id?: number;
  }): PoamMilestoneRow {
    const stmt = getDb().prepare(`
      INSERT INTO poam_milestones (
        poam_id, title, description, target_date, milestone_type,
        deliverables, success_criteria, assigned_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.poam_id,
      input.title,
      input.description ?? '',
      input.target_date ?? null,
      input.milestone_type ?? 'Implementation',
      input.deliverables ?? '',
      input.success_criteria ?? '',
      input.assigned_user_id ?? null
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: {
    title?: string;
    description?: string;
    target_date?: string;
    actual_date?: string;
    status?: MilestoneStatus;
    milestone_type?: MilestoneType;
    deliverables?: string;
    success_criteria?: string;
    assigned_user_id?: number | null;
    completion_percentage?: number;
  }): PoamMilestoneRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const updates: string[] = [];
    const values: unknown[] = [];
    
    if (input.title !== undefined) { updates.push('title = ?'); values.push(input.title); }
    if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description); }
    if (input.target_date !== undefined) { updates.push('target_date = ?'); values.push(input.target_date); }
    if (input.actual_date !== undefined) { updates.push('actual_date = ?'); values.push(input.actual_date); }
    if (input.status !== undefined) { updates.push('status = ?'); values.push(input.status); }
    if (input.milestone_type !== undefined) { updates.push('milestone_type = ?'); values.push(input.milestone_type); }
    if (input.deliverables !== undefined) { updates.push('deliverables = ?'); values.push(input.deliverables); }
    if (input.success_criteria !== undefined) { updates.push('success_criteria = ?'); values.push(input.success_criteria); }
    if (input.assigned_user_id !== undefined) { updates.push('assigned_user_id = ?'); values.push(input.assigned_user_id); }
    if (input.completion_percentage !== undefined) { updates.push('completion_percentage = ?'); values.push(input.completion_percentage); }
    
    if (updates.length > 0) {
      values.push(id);
      getDb().prepare(`UPDATE poam_milestones SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM poam_milestones WHERE id = ?").run(id);
    return info.changes > 0;
  }
};

export const PoamComments = {
  byPoam(poamId: number): Array<PoamCommentRow & { author_name: string; author_email: string }> {
    return getDb().prepare(`
      SELECT pc.*, u.name as author_name, u.email as author_email
      FROM poam_comments pc
      JOIN users u ON pc.created_by = u.id
      WHERE pc.poam_id = ?
      ORDER BY pc.created_at DESC
    `).all(poamId) as Array<PoamCommentRow & { author_name: string; author_email: string }>;
  },
  byMilestone(milestoneId: number): Array<PoamCommentRow & { author_name: string; author_email: string }> {
    return getDb().prepare(`
      SELECT pc.*, u.name as author_name, u.email as author_email
      FROM poam_comments pc
      JOIN users u ON pc.created_by = u.id
      WHERE pc.milestone_id = ?
      ORDER BY pc.created_at DESC
    `).all(milestoneId) as Array<PoamCommentRow & { author_name: string; author_email: string }>;
  },
  get(id: number): PoamCommentRow | undefined {
    return getDb().prepare("SELECT * FROM poam_comments WHERE id = ?").get(id) as PoamCommentRow | undefined;
  },
  create(input: {
    poam_id: number;
    milestone_id?: number;
    comment: string;
    comment_type?: CommentType;
    created_by: number;
  }): PoamCommentRow {
    const stmt = getDb().prepare(`
      INSERT INTO poam_comments (poam_id, milestone_id, comment, comment_type, created_by)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      input.poam_id,
      input.milestone_id ?? null,
      input.comment,
      input.comment_type ?? 'General',
      input.created_by
    );
    return this.get(Number(info.lastInsertRowid))!;
  },
  update(id: number, input: { comment: string; comment_type?: CommentType }): PoamCommentRow | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    
    const updates: string[] = ['comment = ?'];
    const values: unknown[] = [input.comment];
    
    if (input.comment_type !== undefined) {
      updates.push('comment_type = ?');
      values.push(input.comment_type);
    }
    
    values.push(id);
    getDb().prepare(`UPDATE poam_comments SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    
    return this.get(id);
  },
  remove(id: number): boolean {
    const info = getDb().prepare("DELETE FROM poam_comments WHERE id = ?").run(id);
    return info.changes > 0;
  }
};
