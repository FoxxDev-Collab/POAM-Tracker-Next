import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    
    // Get vulnerability counts by severity
    const criticalCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM stig_findings 
      WHERE severity = 'high' AND status IN ('Open', 'NotAFinding', 'Not_Reviewed')
    `).get() as { count: number };
    
    const highCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM stig_findings 
      WHERE severity = 'medium' AND status IN ('Open', 'NotAFinding', 'Not_Reviewed')
    `).get() as { count: number };
    
    // Get resolved count (today)
    const resolvedToday = db.prepare(`
      SELECT COUNT(*) as count 
      FROM stig_findings 
      WHERE status = 'NotAFinding' 
      AND DATE(last_seen) = DATE('now')
    `).get() as { count: number };
    
    // Get pending reviews (findings that need review)
    const pendingReviews = db.prepare(`
      SELECT COUNT(*) as count 
      FROM stig_findings 
      WHERE status = 'Not_Reviewed'
    `).get() as { count: number };
    
    // Get recent activity (last 10 findings)
    const recentFindings = db.prepare(`
      SELECT 
        sf.rule_title,
        sf.severity,
        sf.status,
        sf.last_seen,
        s.name as system_name,
        sf.rule_id
      FROM stig_findings sf
      JOIN systems s ON sf.system_id = s.id
      ORDER BY sf.last_seen DESC
      LIMIT 10
    `).all() as Array<{
      rule_title: string | null;
      severity: string | null;
      status: string | null;
      last_seen: string;
      system_name: string;
      rule_id: string;
    }>;
    
    // Get total systems and packages count
    const systemCount = db.prepare("SELECT COUNT(*) as count FROM systems").get() as { count: number };
    const packageCount = db.prepare("SELECT COUNT(*) as count FROM packages").get() as { count: number };
    
    return NextResponse.json({
      stats: {
        critical: criticalCount.count,
        high: highCount.count,
        resolvedToday: resolvedToday.count,
        pendingReviews: pendingReviews.count,
        totalSystems: systemCount.count,
        totalPackages: packageCount.count
      },
      recentActivity: recentFindings
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get dashboard stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
