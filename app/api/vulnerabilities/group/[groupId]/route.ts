import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') // e.g., "cat_i,high"
    
    const db = getDb()
    
    let severityFilter = ''
    if (severity) {
      const severityList = severity.split(',').map(s => `'${s.trim()}'`).join(',')
      severityFilter = `AND LOWER(f.severity) IN (${severityList})`
    }

    // Get vulnerabilities for all systems in the group
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
        GROUP_CONCAT(s.id) as system_ids
      FROM stig_findings f
      JOIN systems s ON s.id = f.system_id
      WHERE s.group_id = ? ${severityFilter}
      GROUP BY f.group_id, f.rule_id, f.rule_title, f.severity, f.status
      ORDER BY 
        CASE 
          WHEN LOWER(f.severity) LIKE '%cat i%' OR LOWER(f.severity) LIKE '%high%' THEN 1
          WHEN LOWER(f.severity) LIKE '%cat ii%' OR LOWER(f.severity) LIKE '%medium%' THEN 2
          WHEN LOWER(f.severity) LIKE '%cat iii%' OR LOWER(f.severity) LIKE '%low%' THEN 3
          ELSE 4
        END,
        f.rule_id
    `).all(groupId) as Array<{
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
    }>

    // Process the results to parse the concatenated strings
    const processedVulns = vulnerabilities.map((vuln) => ({
      vuln_id: vuln.vuln_id || vuln.rule_id, // Use group_id (V-xxxxx) if available, fallback to rule_id
      rule_id: vuln.rule_id,
      rule_title: vuln.rule_title || '',
      severity: vuln.severity || 'Unknown',
      status: vuln.status || 'Unknown',
      finding_details: vuln.finding_details || '',
      check_content: vuln.check_content || '',
      fix_text: vuln.fix_text || '',
      affected_systems: vuln.affected_systems ? vuln.affected_systems.split(',') : [],
      system_ids: vuln.system_ids ? vuln.system_ids.split(',').map((id: string) => parseInt(id)) : []
    }))

    return NextResponse.json({ 
      vulnerabilities: processedVulns,
      total: processedVulns.length 
    })
  } catch (error) {
    console.error('Error fetching group vulnerabilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vulnerabilities' },
      { status: 500 }
    )
  }
}