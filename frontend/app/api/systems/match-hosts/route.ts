import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const { ips } = await request.json()

    if (!Array.isArray(ips) || ips.length === 0) {
      return NextResponse.json(
        { error: 'Invalid IPs array provided' },
        { status: 400 }
      )
    }

    // Forward request to backend API
    const response = await fetch(`${BACKEND_URL}/systems/match-hosts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ips })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Failed to match hosts to systems' },
        { status: response.status }
      )
    }

    const matchedSystems = await response.json()
    console.warn(`Matched ${matchedSystems.length} systems for ${ips.length} IP addresses`)

    return NextResponse.json(matchedSystems)

  } catch (error) {
    console.error('Error matching hosts to systems:', error)
    return NextResponse.json(
      { error: 'Failed to match hosts to systems' },
      { status: 500 }
    )
  }
}