import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      stp_id, 
      title, 
      description, 
      test_procedure, 
      expected_result,
      assigned_user_id 
    } = body

    // Validate required fields
    if (!stp_id || !title) {
      return NextResponse.json(
        { error: 'STP ID and title are required' },
        { status: 400 }
      )
    }

    const db = getDb()
    
    // Insert new test case
    const result = db.prepare(`
      INSERT INTO stp_test_cases (
        stp_id, 
        title, 
        description, 
        test_procedure, 
        expected_result,
        assigned_user_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      stp_id, 
      title, 
      description || '', 
      test_procedure || '', 
      expected_result || '',
      assigned_user_id || null
    )

    // Get the created test case
    const newTestCase = db.prepare(`
      SELECT * FROM stp_test_cases WHERE id = ?
    `).get(result.lastInsertRowid)

    return NextResponse.json({ testCase: newTestCase }, { status: 201 })
  } catch (error) {
    console.error('Error creating test case:', error)
    return NextResponse.json(
      { error: 'Failed to create test case' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stpId = searchParams.get('stp_id')
    
    if (!stpId) {
      return NextResponse.json(
        { error: 'STP ID is required' },
        { status: 400 }
      )
    }

    const db = getDb()
    
    const testCases = db.prepare(`
      SELECT * FROM stp_test_cases 
      WHERE stp_id = ? 
      ORDER BY created_at DESC
    `).all(stpId)

    return NextResponse.json({ testCases })
  } catch (error) {
    console.error('Error fetching test cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test cases' },
      { status: 500 }
    )
  }
}