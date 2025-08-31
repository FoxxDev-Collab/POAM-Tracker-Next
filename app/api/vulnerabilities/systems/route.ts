import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const systemIds = searchParams.get('ids') // e.g., "1,2,3"
    const status = searchParams.get('status') // e.g., "open"
    
    if (!systemIds) {
      return NextResponse.json(
        { error: 'System IDs are required' },
        { status: 400 }
      )
    }
    
    const db = getDb()
    const ids = systemIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    
    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Valid system IDs are required' },
        { status: 400 }
      )
    }
    
    // Build system filter
    const systemPlaceholders = ids.map(() => '?').join(',')
    
    // Build status filter - only show open findings
    let statusFilter = ''
    if (status === 'open') {
      statusFilter = `AND LOWER(f.status) IN ('open', 'not_reviewed', 'ongoing')`
    }

    // Get vulnerabilities for the specified systems
    const vulnerabilities = db.prepare(`
      SELECT 
        f.group_id as vuln_id,
        f.rule_id,
        f.rule_title,
        f.severity,
        f.status,
        f.finding_details,
        f.check_content,
        f.fix_text,
        GROUP_CONCAT(s.name) as affected_systems,
        GROUP_CONCAT(s.id) as system_ids,
        COUNT(DISTINCT s.id) as system_count
      FROM stig_findings f
      JOIN systems s ON s.id = f.system_id
      WHERE s.id IN (${systemPlaceholders}) ${statusFilter}
      GROUP BY f.group_id, f.rule_id, f.rule_title, f.severity, f.status
      ORDER BY 
        CASE 
          WHEN LOWER(f.severity) LIKE '%cat i%' OR LOWER(f.severity) = 'high' THEN 1
          WHEN LOWER(f.severity) LIKE '%cat ii%' OR LOWER(f.severity) = 'medium' THEN 2
          WHEN LOWER(f.severity) LIKE '%cat iii%' OR LOWER(f.severity) = 'low' THEN 3
          ELSE 4
        END,
        f.rule_id
    `).all(...ids) as Array<{
      vuln_id: string | null;
      rule_id: string;
      rule_title: string | null;
      severity: string | null;
      status: string | null;
      finding_details: string | null;
      check_content: string | null;
      fix_text: string | null;
      affected_systems: string | null;
      system_ids: string | null;
      system_count: number;
    }>

    // Process the results to parse the concatenated strings and categorize findings
    const totalSystems = ids.length
    const processedVulns = vulnerabilities.map((vuln) => ({
      vuln_id: vuln.vuln_id || vuln.rule_id,
      rule_id: vuln.rule_id,
      rule_title: vuln.rule_title || '',
      severity: vuln.severity || 'Unknown',
      status: vuln.status || 'Unknown',
      finding_details: vuln.finding_details || '',
      check_content: vuln.check_content || '',
      fix_text: vuln.fix_text || '',
      affected_systems: vuln.affected_systems ? vuln.affected_systems.split(',') : [],
      system_ids: vuln.system_ids ? vuln.system_ids.split(',').map((id: string) => parseInt(id)) : [],
      system_count: vuln.system_count,
      is_shared: vuln.system_count === totalSystems, // True if affects all selected systems
      is_cat_i: vuln.severity ? (vuln.severity.toLowerCase().includes('cat i') || vuln.severity.toLowerCase() === 'high') : false
    }))

    // Separate shared and unique findings
    const sharedFindings = processedVulns.filter(v => v.is_shared)
    const uniqueFindings = processedVulns.filter(v => !v.is_shared)
    
    // Auto-select CAT I findings
    const catIFindings = processedVulns.filter(v => v.is_cat_i)

    return NextResponse.json({ 
      vulnerabilities: processedVulns,
      sharedFindings,
      uniqueFindings,
      catIFindings,
      total: processedVulns.length,
      totalSystems
    })
  } catch (error) {
    console.error('Error fetching system vulnerabilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vulnerabilities' },
      { status: 500 }
    )
  }
}