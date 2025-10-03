import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  return token ? {
    'Authorization': `Bearer ${token.value}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
}

export async function GET(req: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';

    const response = await fetch(`${BACKEND_URL}/poams${queryString}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch POAMs';
      try {
        const errorText = await response.text();
        if (errorText.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please try again later.';
        } else {
          try {
            const error = JSON.parse(errorText);
            errorMessage = error.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch {
        // If we can't read the error, use the default message
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('POAMs fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch POAMs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const body = await req.json();

    // If no createdBy provided or invalid ID, get the first available user from backend
    let createdBy = body.created_by;
    if (!createdBy || createdBy === 1) { // User ID 1 doesn't exist in seed data
      try {
        const usersResponse = await fetch(`${BACKEND_URL}/users`, {
          method: 'GET',
          headers,
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const users = usersData.items || usersData || [];
          if (users.length > 0) {
            createdBy = users[0].id;
          }
        }
      } catch {
        // Failed to fetch users
      }

      // If still no createdBy or still invalid, use admin user as fallback
      if (!createdBy || createdBy === 1) {
        createdBy = 2; // Admin user ID from seed
      }
    }

    // Transform frontend field names to match backend expectations
    const transformedBody = {
      packageId: body.package_id,
      groupId: body.group_id,
      poamNumber: body.poamNumber || `POAM-${Date.now()}`, // Generate if not provided
      title: body.title,
      weaknessDescription: body.weakness_description,
      nistControlId: body.nist_control_id,
      severity: body.severity,
      status: body.status,
      priority: body.priority,
      residualRiskLevel: body.residual_risk_level,
      targetCompletionDate: body.target_completion_date,
      actualCompletionDate: body.actual_completion_date,
      scheduledReviewDate: body.scheduled_review_date,
      pocName: body.poc_name,
      pocEmail: body.poc_email,
      pocPhone: body.poc_phone,
      altPocName: body.alt_poc_name,
      altPocEmail: body.alt_poc_email,
      altPocPhone: body.alt_poc_phone,
      assignedTeamId: body.assigned_team_id,
      createdBy: createdBy,
      // Risk fields
      inherentRiskScore: body.inherent_risk_score,
      residualRiskScore: body.residual_risk_score,
      threatLevel: body.threat_level,
      likelihood: body.likelihood,
      impact: body.impact,
      riskStatement: body.risk_statement,
      mitigationStrategy: body.mitigation_strategy,
      riskAcceptance: body.risk_acceptance,
      riskAcceptanceRationale: body.risk_acceptance_rationale,
    };

    const response = await fetch(`${BACKEND_URL}/poams`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transformedBody)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create POAM';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = `Failed to create POAM: ${response.status} ${response.statusText}`;
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    // Wrap response to match frontend expectations
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('POAM creation error:', error);
    return NextResponse.json({ error: "Failed to create POAM" }, { status: 500 });
  }
}