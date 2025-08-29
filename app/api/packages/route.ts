import { NextRequest, NextResponse } from "next/server";
import { Packages } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { validateCSRF } from "@/lib/csrf";
import { SecureErrors, withSecureErrorHandling } from "@/lib/secure-error";
import { z } from "zod";

// Force Node.js runtime to use filesystem and database operations
export const runtime = 'nodejs';

const createPackageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  system_type: z.enum(["Major Application", "General Support System", "Minor Application", "Subsystem"]).optional(),
  confidentiality_impact: z.enum(["Low", "Moderate", "High"]).optional(),
  integrity_impact: z.enum(["Low", "Moderate", "High"]).optional(),
  availability_impact: z.enum(["Low", "Moderate", "High"]).optional(),
  overall_categorization: z.enum(["Low", "Moderate", "High"]).optional(),
  authorization_status: z.enum(["Not Started", "In Progress", "Authorized", "Reauthorization Required", "Expired", "Denied"]).optional(),
  authorization_date: z.string().optional(),
  authorization_expiry: z.string().optional(),
  risk_assessment_date: z.string().optional(),
  residual_risk_level: z.enum(["Very Low", "Low", "Moderate", "High", "Very High"]).optional(),
  mission_criticality: z.enum(["Mission Critical", "Mission Essential", "Mission Support"]).optional(),
  data_classification: z.enum(["Unclassified", "CUI", "Secret", "Top Secret"]).optional(),
  system_owner: z.string().optional(),
  authorizing_official: z.string().optional(),
  isso_name: z.string().optional(),
  security_control_baseline: z.enum(["Low", "Moderate", "High", "Tailored"]).optional(),
  poam_status: z.enum(["Green", "Yellow", "Red"]).optional(),
  continuous_monitoring_status: z.enum(["Fully Implemented", "Partially Implemented", "Not Implemented"]).optional(),
  team_id: z.number().optional(),
  csrfToken: z.string().optional(),
});

export const GET = withSecureErrorHandling(async () => {
  await requireAuth();
  const items = Packages.all();
  return NextResponse.json({ items });
});

export const POST = withSecureErrorHandling(async (req: NextRequest) => {
  // Require authentication
  await requireAuth();
  
  // Validate CSRF token
  const csrfValidation = await validateCSRF(req);
  if (!csrfValidation.isValid) {
    return SecureErrors.CSRFError();
  }
  
  // Parse and validate request body
  const body = await req.json();
  const validation = createPackageSchema.safeParse(body);
  
  if (!validation.success) {
    return SecureErrors.ValidationError();
  }
  
  const { csrfToken: _token, ...packageData } = validation.data;
  void _token; // Acknowledge token was validated but not used
  
  // Create package
  const created = Packages.create(packageData);
  return NextResponse.json({ item: created }, { status: 201 });
});
