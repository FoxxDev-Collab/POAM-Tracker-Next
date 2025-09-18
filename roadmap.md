# 🛣️ POAM Tracker Next - Complete Development Roadmap

*Based on real-world DOD cybersecurity experience and comprehensive system analysis*

---

## 🎯 **VISION STATEMENT**
Create a professional, comprehensive cybersecurity management platform that transforms the traditional siloed approach to RMF compliance, vulnerability management, and security testing into an integrated, efficient workflow that cybersecurity teams actually want to use.

---

## ✅ **PHASE 1: FOUNDATION & CORE INFRASTRUCTURE** *(COMPLETED)*

### 🏗️ System Architecture
- [x] Next.js 15 application with App Router
- [x] TypeScript throughout for type safety  
- [x] Tailwind CSS + shadcn/ui component system
- [x] Theme system with dark/light mode support
- [x] Responsive design patterns established
- [x] NestJS backend with PostgreSQL + Prisma
- [x] Redis + BullMQ for background processing

### 🔐 Authentication & Authorization
- [x] User authentication system (/login, /profile)
- [x] CSRF protection implementation
- [x] Admin user management interface
- [x] Role-based access control structure

### 👥 User & Team Management
- [x] User administration interface
- [x] Team organization and management
- [x] Profile management system

---

## 🔄 **PHASE 2: RMF CENTER** *(STEP 1 COMPLETE, STEPS 2-6 NEEDED)*

### ✅ **Step 1: CATEGORIZE** *(COMPLETED)*
- [x] Package creation and basic management
- [x] System type classification (Major App, GSS, Minor App, Subsystem)
- [x] Impact level determination (Low/Moderate/High)
- [x] Data classification (Unclassified → Top Secret)
- [x] Mission criticality assessment
- [x] System boundary definition
- [x] Groups and Systems hierarchical structure

### 🎯 **Step 2: SELECT** *(HIGH PRIORITY - Q1 2025)*
- [ ] **NIST Control Catalog Implementation**
  - [ ] Import complete NIST 800-53 Rev 5 control catalog
  - [ ] Control family organization (AC, AU, CA, CM, etc.)
  - [ ] Control enhancement management
  - [ ] Baseline selection (Low/Moderate/High)
  - [ ] Tailoring capabilities (add/remove controls)
- [ ] **Control Selection Interface**
  - [ ] Baseline auto-population based on impact levels
  - [ ] Manual control addition/removal
  - [ ] Control inheritance tracking
  - [ ] Shared control identification
  - [ ] Control summary and statistics dashboard

### 🎯 **Step 3: IMPLEMENT** *(Q2 2025)*
- [ ] **Security Test Plans (STPs) Enhancement**
  - [ ] Per-control STP generation
  - [ ] Test case templates based on control requirements
  - [ ] Implementation evidence collection
  - [ ] Control implementation status tracking
- [ ] **Documentation Management**
  - [ ] System Security Plan (SSP) generation
  - [ ] Control implementation descriptions
  - [ ] Version control with e-signatures
  - [ ] Template management for common implementations
- [ ] **Implementation Tracking**
  - [ ] Control implementation progress dashboard
  - [ ] Implementation milestone tracking
  - [ ] Resource allocation and timeline management

### 🎯 **Step 4: ASSESS** *(Q3 2025)*
- [ ] **Assessment Planning**
  - [ ] Security Assessment Plan (SAP) generation
  - [ ] Assessment procedure templates
  - [ ] Assessor assignment and scheduling
- [ ] **Assessment Execution**
  - [ ] Assessment results capture interface
  - [ ] Finding documentation system
  - [ ] Evidence review and validation
  - [ ] Assessment report generation
- [ ] **Finding Management**
  - [ ] Security Assessment Report (SAR) generation
  - [ ] Finding severity classification
  - [ ] Remediation requirement tracking

### 🎯 **Step 5: AUTHORIZE** *(Q4 2025)*
- [ ] **Authorization Package Assembly**
  - [ ] Automated package compilation (SSP, SAP, SAR, POA&M)
  - [ ] Package completeness validation
  - [ ] Digital signature integration
- [ ] **Risk Assessment Integration**
  - [ ] Risk calculation based on findings
  - [ ] Residual risk determination
  - [ ] Risk acceptance documentation
- [ ] **ATO Decision Support**
  - [ ] Authorization recommendation engine
  - [ ] ATO decision documentation
  - [ ] Authorization letter generation

### 🎯 **Step 6: MONITOR** *(Q1 2026)*
- [ ] **Continuous Monitoring Framework**
  - [ ] Automated control monitoring setup
  - [ ] Change management integration
  - [ ] Impact analysis for changes
- [ ] **Ongoing Assessment**
  - [ ] Scheduled reassessment management
  - [ ] Continuous monitoring reporting
  - [ ] Authorization maintenance tracking

---

## 📊 **PHASE 3: VULNERABILITY CENTER** *(SUBSTANTIALLY COMPLETE, ENHANCEMENTS NEEDED)*

### ✅ **Current Capabilities** *(COMPLETED)*
- [x] Vulnerability Center dashboard with real-time metrics
- [x] POAM lifecycle management
- [x] Nessus scan integration
- [x] Basic STIG finding management
- [x] File management system

### 🎯 **Enhancements** *(Q1-Q2 2025)*
- [ ] **STIG Scan Processing**
  - [ ] CKL file import and parsing
  - [ ] CKLB file support
  - [ ] JSON format support (future)
  - [ ] Automated STIG-to-POAM generation
- [ ] **Advanced Vulnerability Analysis**
  - [ ] Cross-system vulnerability correlation
  - [ ] Trend analysis and reporting
  - [ ] Risk-based prioritization
  - [ ] Automated remediation suggestions
- [ ] **Enhanced STP Integration**
  - [ ] Direct vulnerability-to-STP linking
  - [ ] Automated test case generation from findings
  - [ ] Evidence requirement mapping
- [ ] **Compliance Reporting**
  - [ ] Automated compliance scoring
  - [ ] Executive dashboard views
  - [ ] Regulatory reporting templates

---

## 📚 **PHASE 4: KNOWLEDGE CENTER** *(FOUNDATION COMPLETE, FEATURES NEEDED)*

### ✅ **Foundation** *(COMPLETED)*
- [x] Space-based organization (Personal, Team, Global)
- [x] Access control (Public, Restricted, Private)
- [x] Basic page management structure

### 🎯 **Full Implementation** *(Q2-Q3 2025)*
- [ ] **Content Management**
  - [ ] Rich text editor with markdown support
  - [ ] File attachments and media support
  - [ ] Page templates for common documents
  - [ ] Content versioning and history
- [ ] **Collaboration Features**
  - [ ] Real-time collaborative editing
  - [ ] Comment and review system
  - [ ] Page approval workflows
  - [ ] Change notifications
- [ ] **Knowledge Organization**
  - [ ] Advanced search capabilities
  - [ ] Tagging and categorization
  - [ ] Content relationships and linking
  - [ ] Knowledge base analytics
- [ ] **RMF Integration**
  - [ ] Control implementation templates
  - [ ] Procedure documentation linking
  - [ ] Best practices repository

---

## 💬 **PHASE 5: FORUM SYSTEM** *(NOT STARTED)*

### 🎯 **Implementation** *(Q3-Q4 2025)*
- [ ] **Chat Infrastructure**
  - [ ] Real-time messaging with Socket.IO
  - [ ] Channel/room creation and management
  - [ ] Direct messaging capabilities
- [ ] **Team Communication**
  - [ ] Team-specific channels
  - [ ] Project-based discussions
  - [ ] Integration with POAM/STP workflows
- [ ] **File Sharing**
  - [ ] In-chat file sharing
  - [ ] Document collaboration
  - [ ] Screen sharing for remote assessments
- [ ] **Notification System**
  - [ ] Real-time notifications
  - [ ] Email digest options
  - [ ] Mobile push notifications

---

## 🔍 **PHASE 6: SCA TEAM INTERFACE** *(FUTURE IMPLEMENTATION)*

### 🎯 **Advanced Assessment Capabilities** *(Q1-Q2 2026)*
- [ ] **Multi-Package Management**
  - [ ] Area of responsibility dashboard
  - [ ] Cross-package analytics
  - [ ] Resource allocation across packages
- [ ] **Assessment Workflow**
  - [ ] Standardized assessment procedures
  - [ ] Assessment team coordination
  - [ ] Quality assurance workflows
- [ ] **Reporting & Analytics**
  - [ ] Assessment performance metrics
  - [ ] Trend analysis across packages
  - [ ] Executive reporting capabilities
- [ ] **Integration Features**
  - [ ] CAC/PIV card integration
  - [ ] GRC system connectivity
  - [ ] External audit tool integration

---

## 🚀 **IMPLEMENTATION PRIORITIES**

### **IMMEDIATE (Next 3 Months)**
1. Complete NIST Control Catalog implementation
2. Enhance STIG scan processing (CKL/CKLB)
3. Improve STP-to-control mapping

### **SHORT TERM (3-6 Months)**
1. RMF Step 2 (SELECT) completion
2. Knowledge Center content management
3. Enhanced vulnerability analytics

### **MEDIUM TERM (6-12 Months)**
1. RMF Steps 3-4 (IMPLEMENT/ASSESS)
2. Forum system implementation
3. Advanced collaboration features

### **LONG TERM (12+ Months)**
1. RMF Steps 5-6 (AUTHORIZE/MONITOR)
2. SCA team interface
3. Enterprise integrations

---

## 📈 **SUCCESS METRICS**

### **Technical Metrics**
- Reduction in ATO package preparation time (target: 50% reduction)
- Increase in vulnerability remediation speed
- Improvement in compliance scoring accuracy

### **User Experience Metrics**
- User adoption rate across cybersecurity teams
- Time saved in daily workflows
- Reduction in manual documentation effort

### **Business Impact**
- Faster time to ATO
- Improved audit readiness
- Enhanced security posture visibility

---

## 🎯 **KEY DIFFERENTIATORS**

1. **Real-World Experience**: Built by practicing cybersecurity professionals
2. **Integrated Workflow**: Seamless connection between vulnerability management and RMF compliance
3. **Professional Interface**: Modern, intuitive design that professionals want to use
4. **Comprehensive Coverage**: End-to-end solution from scan import to ATO
5. **Scalable Architecture**: Designed for enterprise-level deployment

---

*This roadmap reflects real-world cybersecurity team needs and provides a clear path to a comprehensive security management platform.*


# CCI Mapping + NIST Coupling:
Help me refine the STP workflow in the application, we have recently just completed the NIST RMF catalog, with separate pages for control families and control status, but have not wired it up to the VC yet.

Here is my initial flow of thought, all performed in the Vulnerability Center (VC):
1. System, import STIG scans.
2. The import will generate and produce a table in the page that presents the data in the same format as the STIG Viewer.
3. Status badges, "Open = Red", "Not Reviewed" = Orange, "Not a Finding" = Green, "Not Applicable" = Black.
   1. The focus is on NIST controls, so we will have a mapper tool that takes CCI xml file to map CCI's from the scan to NIST Controls.
4. Then we navigate to the STIG STP page, this is where the user will use the wizard to create the STP for that system, the user will be able to select controls that are "Open" and "Not Reviewed".
5. Once the STP is created, test cases are generated per Vulnerability ID/STIG ID.
6. After this, the System page with STIG data displays a new status badge "STP Active" = Blue.
7. Once the STP goes through completion, all test cases are passed with evidence, there is a new status badge "STP Passed" = Green.

This essentially is how users will accomplish manual checks for STIGs, most scan tools/remediation tools cannot do the manual checks.

The idea is to then is to wire the NIST Catalog with this data on a per Group basis.

The way we shall score groups is by taking the Highest score system and the Lowest score system.

Then the control will take the highest scoring group and the lowest score group to determine compliance.

When the user uploads a new scan into the system, the system scan record shall check the database for previous controls that were completed through an STP and shall carry that status back over. 

Although we might overwrite scan data, we will actually keep records of scan data to provide a version history so to speak.

This is a well-thought-out workflow that creates a clear path from vulnerability identification to remediation validation. Let me help you refine this approach and identify the key integration points.

Refined STP Workflow
Core Flow Refinements
1. STIG Import & Processing

STIG Scan → CCI Mapping → NIST Control Mapping → Status Dashboard
Key Enhancement: Create a CCI-to-NIST control mapping service that runs during import to immediately establish the connection between findings and controls.

2. Status Hierarchy & Logic Your status progression makes sense, but consider this refinement:

Open (Red) → STP Active (Blue) → STP Passed (Green)
Not Reviewed (Orange) → STP Active (Blue) → STP Passed (Green)
Not a Finding (Green) - remains static
Not Applicable (Black) - remains static
3. STP Creation Wizard Instead of just selecting "Open" and "Not Reviewed" findings, consider:

Group findings by NIST control
Allow users to see all findings under each control
Enable bulk selection by control family (AC, AU, etc.)
Show estimated effort/complexity per control
Database Schema Enhancements
You'll need these additions to your existing schema:

sql
-- CCI to NIST Control mapping
model CciControlMapping {
  id         Int    @id @default(autoincrement())
  cci        String @unique
  controlId  String // e.g., "AC-2"
  controlTitle String
  @@map("cci_control_mappings")
}

-- Enhanced StigFinding with control mapping
// Add to existing StigFinding model:
  controlId        String? @map("control_id") // Mapped during import
  stpStatus        String? @default("None") @map("stp_status") // None, Active, Passed
  lastStpId        Int?    @map("last_stp_id") // Reference to most recent STP
Scoring Algorithm Implementation
Group-Level Scoring:

typescript
interface GroupScore {
  groupId: number;
  highestSystemScore: number;
  lowestSystemScore: number;
  overallScore: number;
  controlsAffected: string[];
}
Control-Level Scoring:

typescript
interface ControlCompliance {
  controlId: string;
  highestGroupScore: number;
  lowestGroupScore: number;
  overallCompliance: 'Compliant' | 'Partially Compliant' | 'Non-Compliant';
  affectedSystems: number[];
}
Version History & Scan Continuity
Approach: Create scan versions while maintaining STP status continuity:

sql
model StigScanVersion {
  id          Int      @id @default(autoincrement())
  scanId      Int      @map("scan_id")
  version     Int
  importedAt  DateTime @default(now()) @map("imported_at")
  findingCount Int     @map("finding_count")
  
  scan StigScan @relation(fields: [scanId], references: [id])
  @@unique([scanId, version])
}
Logic: When importing a new scan:

Archive current findings as a version
Import new findings
Query previous STP completions by systemId + ruleId
Apply stpStatus = "Passed" where previous STPs were completed
Maintain audit trail of what was preserved vs. newly identified
Integration Points with NIST Catalog
Control Status Dashboard should show:

Total findings mapped to this control across all systems
Number of active STPs for this control
Completion percentage
Systems still requiring attention
Suggested UI Flow:

NIST Catalog → Control Detail → Systems Affected → STIG Findings → Create STP
Wizard Enhancements
STP Creation Wizard Steps:

Control Selection: Show controls with open findings, grouped by family
Finding Review: Display specific STIG findings per selected control
Test Case Generation: Auto-generate test cases based on STIG check content
Assignment: Assign test cases to team members
Timeline: Set target completion dates
Status Badge Logic
typescript
function getStpStatus(findings: StigFinding[]): string {
  const openFindings = findings.filter(f => ['Open', 'Not_Reviewed'].includes(f.status));
  const activeStp = findings.some(f => f.stpStatus === 'Active');
  const allPassed = findings.every(f => 
    f.status === 'Not_a_Finding' || 
    f.status === 'Not_Applicable' || 
    f.stpStatus === 'Passed'
  );
  
  if (allPassed) return 'STP Passed';
  if (activeStp) return 'STP Active';
  if (openFindings.length > 0) return 'Open';
  return 'Complete';
}
Implementation Priority
Immediate: CCI-to-NIST mapping service and database schema updates
Next: Enhanced STP wizard with control-based grouping
Following: Scan versioning and status preservation logic
Final: Full integration with NIST Catalog pages
This approach maintains your core concept while adding the structural support needed for enterprise-level tracking and compliance reporting. The key insight is treating NIST controls as the primary organizing principle rather than individual STIG findings.

Now, how should we develop the system level score? We need a way to account for the "Not Reviewed" STIGs, since they cannot actually exist, all STIGs need to be evaluated and if necessary, marked as "Not Applicable".

You're absolutely right - "Not Reviewed" represents an incomplete assessment state that shouldn't persist in a mature system. Here's a comprehensive scoring approach that accounts for this:

System-Level Scoring Framework
STIG Finding States & Scoring Impact
typescript
enum StigStatus {
  Open = "Open",                    // Requires remediation
  Not_a_Finding = "Not_a_Finding", // Compliant
  Not_Applicable = "Not_Applicable", // Doesn't apply to this system
  Not_Reviewed = "Not_Reviewed"    // Incomplete assessment (temporary state)
}

interface StigScoring {
  status: StigStatus;
  scoreImpact: number;
  requiresAction: boolean;
  isCompleteAssessment: boolean;
}
Scoring Algorithm
Base Scoring Logic:

typescript
function calculateSystemScore(findings: StigFinding[]): SystemScore {
  const totalFindings = findings.length;
  const compliantFindings = findings.filter(f => 
    f.status === 'Not_a_Finding' || f.status === 'Not_Applicable'
  ).length;
  const openFindings = findings.filter(f => f.status === 'Open').length;
  const notReviewedFindings = findings.filter(f => f.status === 'Not_Reviewed').length;
  
  // Assessment Completeness Score (0-100%)
  const assessmentCompleteness = ((totalFindings - notReviewedFindings) / totalFindings) * 100;
  
  // Compliance Score (only for reviewed findings)
  const reviewedFindings = totalFindings - notReviewedFindings;
  const complianceScore = reviewedFindings > 0 ? 
    (compliantFindings / reviewedFindings) * 100 : 0;
  
  // Overall System Score (penalized for incomplete assessment)
  const overallScore = (complianceScore * assessmentCompleteness) / 100;
  
  return {
    overallScore,
    complianceScore,
    assessmentCompleteness,
    totalFindings,
    openFindings,
    compliantFindings,
    notReviewedFindings,
    status: determineSystemStatus(overallScore, assessmentCompleteness, openFindings)
  };
}
System Status Categories
typescript
enum SystemAssessmentStatus {
  Complete_Compliant = "Complete & Compliant",      // 95-100% overall score
  Complete_NonCompliant = "Complete & Non-Compliant", // <95% but assessment complete
  Incomplete_Assessment = "Assessment Incomplete",   // Has Not_Reviewed findings
  Critical_Findings = "Critical Findings Present"    // Has high/critical open findings
}

function determineSystemStatus(
  overallScore: number, 
  assessmentCompleteness: number, 
  openFindings: number,
  criticalFindings: number
): SystemAssessmentStatus {
  if (assessmentCompleteness < 100) {
    return SystemAssessmentStatus.Incomplete_Assessment;
  }
  
  if (criticalFindings > 0) {
    return SystemAssessmentStatus.Critical_Findings;
  }
  
  if (overallScore >= 95) {
    return SystemAssessmentStatus.Complete_Compliant;
  }
  
  return SystemAssessmentStatus.Complete_NonCompliant;
}
Enhanced Database Schema
sql
-- Add to StigFinding model
model StigFinding {
  // ... existing fields
  severity              String?  // CAT I, CAT II, CAT III
  reviewedAt            DateTime? @map("reviewed_at")
  reviewedBy            Int?     @map("reviewed_by")
  justification         String?  // For Not_Applicable findings
  lastAssessmentScore   Float?   @map("last_assessment_score")
  
  reviewer User? @relation("StigFindingReviewer", fields: [reviewedBy], references: [id])
}

-- System scoring cache table
model SystemScore {
  id                    Int      @id @default(autoincrement())
  systemId              Int      @map("system_id")
  scanId                Int      @map("scan_id")
  overallScore          Float    @map("overall_score")
  complianceScore       Float    @map("compliance_score")
  assessmentCompleteness Float   @map("assessment_completeness")
  totalFindings         Int      @map("total_findings")
  openFindings          Int      @map("open_findings")
  compliantFindings     Int      @map("compliant_findings")
  notReviewedFindings   Int      @map("not_reviewed_findings")
  criticalFindings      Int      @map("critical_findings")
  status                SystemAssessmentStatus
  calculatedAt          DateTime @default(now()) @map("calculated_at")
  
  system System @relation(fields: [systemId], references: [id])
  scan   StigScan @relation(fields: [scanId], references: [id])
  
  @@unique([systemId, scanId])
}
Scoring Weights by Severity
typescript
const SEVERITY_WEIGHTS = {
  'CAT I': 3.0,    // Critical - heavily weighted
  'CAT II': 2.0,   // High - moderate weight
  'CAT III': 1.0   // Medium - baseline weight
};

function calculateWeightedScore(findings: StigFinding[]): number {
  const totalWeight = findings.reduce((sum, finding) => {
    const weight = SEVERITY_WEIGHTS[finding.severity] || 1.0;
    return sum + weight;
  }, 0);
  
  const compliantWeight = findings
    .filter(f => f.status === 'Not_a_Finding' || f.status === 'Not_Applicable')
    .reduce((sum, finding) => {
      const weight = SEVERITY_WEIGHTS[finding.severity] || 1.0;
      return sum + weight;
    }, 0);
  
  return totalWeight > 0 ? (compliantWeight / totalWeight) * 100 : 0;
}
Assessment Completion Workflow
UI Indicators:

typescript
interface AssessmentProgress {
  systemId: number;
  totalFindings: number;
  reviewedFindings: number;
  completionPercentage: number;
  blockers: {
    notReviewedCount: number;
    requiresJustification: number; // Not_Applicable without justification
    pendingEvidence: number;       // Open findings without STP evidence
  };
}
Dashboard Alerts:

⚠️ Assessment Incomplete: X findings still marked "Not Reviewed"
📋 Justification Required: X "Not Applicable" findings need documentation
🔍 Review Required: New scan imported, previous assessments may need update
Group & Package Scoring Logic
Group Score Calculation:

typescript
function calculateGroupScore(systemScores: SystemScore[]): GroupScore {
  const completeSystems = systemScores.filter(s => s.assessmentCompleteness === 100);
  
  if (completeSystems.length === 0) {
    return {
      status: 'Assessment Incomplete',
      score: 0,
      systemsComplete: 0,
      totalSystems: systemScores.length
    };
  }
  
  const highestScore = Math.max(...completeSystems.map(s => s.overallScore));
  const lowestScore = Math.min(...completeSystems.map(s => s.overallScore));
  
  // Use the lowest score as the group score (weakest link approach)
  return {
    score: lowestScore,
    highestSystemScore: highestScore,
    lowestSystemScore: lowestScore,
    systemsComplete: completeSystems.length,
    totalSystems: systemScores.length,
    status: determineGroupStatus(lowestScore, completeSystems.length, systemScores.length)
  };
}
Implementation Workflow
1. Import Processing:

New scans automatically marked as "Not_Reviewed"
Previous assessments preserved where rule IDs match
Assessment completion percentage tracked
2. Review Workflow:

Bulk review interface for efficient processing
Required justification for "Not_Applicable" selections
Auto-save progress to prevent data loss
3. Scoring Updates:

Recalculate scores on any status change
Cache scores for performance
Trigger notifications when thresholds crossed
4. Reporting:

Executive dashboard shows assessment completeness
Drill-down capability to specific findings
Trend analysis over time
This approach ensures that incomplete assessments are clearly identified and penalized in scoring, while providing a clear path to completion and accurate compliance measurement.

I am not sure about the weight for CAT scores. I would almost rather keep those separate in the scoring system.

Or is this too much information to pass to the RMF Center?

You're right to question the weighting - it could overcomplicate things and potentially obscure important information. Let me suggest a cleaner approach that keeps CAT scores separate and considers the RMF Center integration.

Simplified Scoring Approach
Separate CAT Scoring
typescript
interface SystemScore {
  systemId: number;
  scanId: number;
  
  // Overall Assessment Health
  assessmentCompleteness: number; // 0-100%
  overallCompliance: number;      // 0-100% (of reviewed findings)
  
  // Category-specific scores (keep separate)
  catScores: {
    CAT_I: CategoryScore;
    CAT_II: CategoryScore; 
    CAT_III: CategoryScore;
  };
  
  // Raw counts for transparency
  findings: {
    total: number;
    notReviewed: number;
    open: number;
    compliant: number; // Not_a_Finding + Not_Applicable
  };
  
  status: SystemAssessmentStatus;
  calculatedAt: Date;
}

interface CategoryScore {
  total: number;
  open: number;
  compliant: number;
  notReviewed: number;
  complianceRate: number; // 0-100% (excluding not reviewed)
}
Benefits of Separate CAT Tracking
Transparency: Users see exactly what's happening at each severity level
Risk Focus: CAT I findings get appropriate visibility without mathematical obscuring
Flexibility: Different stakeholders can prioritize different categories
Audit Trail: Clear compliance story for each severity level
RMF Center Integration - Keep It Simple
What to Pass to RMF Center:

typescript
interface ControlComplianceData {
  controlId: string; // e.g., "AC-2"
  
  // Simple aggregate data
  systemsAffected: number;
  totalFindings: number;
  openFindings: number;
  assessmentComplete: boolean; // All systems fully reviewed
  
  // Highest concern level (not weighted scores)
  highestSeverityOpen: 'CAT_I' | 'CAT_II' | 'CAT_III' | null;
  
  // Simple status for control
  status: 'Compliant' | 'Non_Compliant' | 'Assessment_Incomplete';
  
  // Reference back to detailed data
  systemDetails: ControlSystemDetail[];
}

interface ControlSystemDetail {
  systemId: number;
  systemName: string;
  openFindings: number;
  catIOpen: number;
  catIIOpen: number;
  catIIIOpen: number;
  assessmentComplete: boolean;
}
Dashboard Presentation
System Level Dashboard:

┌─ System: Web Server Alpha ─────────────────┐
│ Assessment: 85% Complete (12 not reviewed) │
│                                            │
│ CAT I:   ✅ 5/5 Complete   (0 Open)       │
│ CAT II:  ⚠️  8/10 Complete (2 Open)       │
│ CAT III: 📝 15/25 Complete (3 Open)       │
│                                            │
│ Overall: 🟡 Needs Attention                │
└────────────────────────────────────────────┘
RMF Control Level:

┌─ AC-2: Account Management ─────────────────┐
│ Status: ⚠️ Non-Compliant                   │
│                                            │
│ 3 systems affected:                        │
│ • Web Server: 2 CAT II open               │
│ • Database:   1 CAT I open ⚠️             │  
│ • App Server: Assessment incomplete        │
│                                            │
│ [View Details] [Create STP]                │
└────────────────────────────────────────────┘
Simplified Database Schema
sql
model SystemScore {
  id                    Int      @id @default(autoincrement())
  systemId              Int      @map("system_id")
  scanId                Int      @map("scan_id")
  
  -- Overall metrics
  assessmentCompleteness Float   @map("assessment_completeness")
  overallCompliance      Float   @map("overall_compliance")
  
  -- Raw counts (no weighting)
  totalFindings         Int      @map("total_findings")
  openFindings          Int      @map("open_findings")
  compliantFindings     Int      @map("compliant_findings")
  notReviewedFindings   Int      @map("not_reviewed_findings")
  
  -- Category breakdowns
  catITotal            Int      @map("cat_i_total")
  catIOpen             Int      @map("cat_i_open")
  catICompliant        Int      @map("cat_i_compliant")
  catINotReviewed      Int      @map("cat_i_not_reviewed")
  
  catIITotal           Int      @map("cat_ii_total")
  catIIOpen            Int      @map("cat_ii_open")
  catIICompliant       Int      @map("cat_ii_compliant")
  catIINotReviewed     Int      @map("cat_ii_not_reviewed")
  
  catIIITotal          Int      @map("cat_iii_total")
  catIIIOpen           Int      @map("cat_iii_open")
  catIIICompliant      Int      @map("cat_iii_compliant")
  catIIINotReviewed    Int      @map("cat_iii_not_reviewed")
  
  status               SystemAssessmentStatus
  calculatedAt         DateTime @default(now()) @map("calculated_at")
  
  @@unique([systemId, scanId])
}
Decision Rules Without Weights
typescript
function determineControlStatus(systemDetails: ControlSystemDetail[]): ControlStatus {
  // Any system with incomplete assessment = incomplete
  if (systemDetails.some(s => !s.assessmentComplete)) {
    return 'Assessment_Incomplete';
  }
  
  // Any CAT I findings = non-compliant (highest priority)
  if (systemDetails.some(s => s.catIOpen > 0)) {
    return 'Non_Compliant';
  }
  
  // Any open findings = non-compliant
  if (systemDetails.some(s => s.openFindings > 0)) {
    return 'Non_Compliant';
  }
  
  return 'Compliant';
}
RMF Integration Strategy
Keep It Focused:

RMF Center gets simple compliance status per control
Detailed STIG analysis stays in Vulnerability Center
Clear drill-down path from RMF → VC for details
Information Flow:

RMF Control → "Non-Compliant (2 CAT I, 5 CAT II)" → Click → VC System Details
This approach avoids mathematical complexity while preserving the important security categorization. The RMF Center gets actionable compliance information without being overwhelmed by STIG-specific details.