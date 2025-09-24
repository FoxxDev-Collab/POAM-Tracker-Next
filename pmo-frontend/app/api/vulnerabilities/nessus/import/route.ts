import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Forward the form data to the backend API
    const response = await fetch(`${BACKEND_URL}/vulnerabilities/nessus/import`, {
      method: 'POST',
      body: formData // FormData is passed directly
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Failed to import Nessus file' },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.warn(`Successfully imported Nessus report: ${result.totalVulnerabilities} vulnerabilities from ${result.totalHosts} hosts`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Nessus import error:', error)
    return NextResponse.json(
      { error: 'Failed to process Nessus file' },
      { status: 500 }
    )
  }
}