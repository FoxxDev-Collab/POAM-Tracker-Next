import { type NextRequest } from "next/server";
import { Users, type UserRow } from "./db";

export type RequestUser = Pick<UserRow, "id" | "email" | "name" | "role" | "active"> | null;

// Very simple request-based user resolution.
// In absence of a proper auth system, we read an X-User-Email header and
// resolve the user from the database. If missing, we fallback to the first Admin.
// DO NOT use this in production; replace with a real auth provider.
export function getRequestUser(req: NextRequest): RequestUser {
  try {
    const headerEmail = req.headers.get("x-user-email");
    if (headerEmail) {
      const u = Users.getByEmail(headerEmail);
      if (u && u.active === 1) {
        const { id, email, name, role, active } = u;
        return { id, email, name, role, active };
      }
    }
    // Fallback to any Admin for local dev to avoid blocking UI
    const admin = Users.all().find((u) => u.role === "Admin" && u.active === 1);
    return admin ? { id: admin.id, email: admin.email, name: admin.name, role: admin.role, active: admin.active } : null;
  } catch {
    return null;
  }
}

export function requireAdmin(user: RequestUser): void {
  if (!user || user.role !== "Admin") {
    throw new Error("Forbidden");
  }
}

export function isReadOnly(user: RequestUser): boolean {
  return !user || user.role === "Auditor";
}
