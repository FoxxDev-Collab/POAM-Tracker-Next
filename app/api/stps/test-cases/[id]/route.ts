import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, actual_result, assigned_user_id } = body
    
    const db = getDb()
    
    // Build update query dynamically
    const updates: string[] = []
    const values: unknown[] = []
    
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }
    
    if (actual_result !== undefined) {
      updates.push('actual_result = ?')
      values.push(actual_result)
    }
    
    if (assigned_user_id !== undefined) {
      updates.push('assigned_user_id = ?')
      values.push(assigned_user_id)
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }
    
    // Add updated_at
    updates.push('updated_at = datetime("now")')
    
    // Add test case ID to values array
    values.push(Number(id))
    
    // Update the test case
    const result = db.prepare(`
      UPDATE stp_test_cases 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values)
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      )
    }
    
    // Get the updated test case
    const updatedTestCase = db.prepare(`
      SELECT * FROM stp_test_cases WHERE id = ?
    `).get(Number(id))
    
    return NextResponse.json({ testCase: updatedTestCase })
  } catch (error) {
    console.error('Error updating test case:', error)
    return NextResponse.json(
      { error: 'Failed to update test case' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()
    
    const result = db.prepare(`
      DELETE FROM stp_test_cases WHERE id = ?
    `).run(Number(id))
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting test case:', error)
    return NextResponse.json(
      { error: 'Failed to delete test case' },
      { status: 500 }
    )
  }
}