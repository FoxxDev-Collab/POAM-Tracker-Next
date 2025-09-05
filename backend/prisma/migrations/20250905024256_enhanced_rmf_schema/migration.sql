-- CreateEnum
CREATE TYPE "public"."SystemType" AS ENUM ('Major_Application', 'General_Support_System', 'Minor_Application', 'Subsystem');

-- CreateEnum
CREATE TYPE "public"."ImpactLevel" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "public"."AuthorizationStatus" AS ENUM ('Not_Started', 'In_Progress', 'Authorized', 'Reauthorization_Required', 'Expired', 'Denied');

-- CreateEnum
CREATE TYPE "public"."ResidualRiskLevel" AS ENUM ('Very_Low', 'Low', 'Moderate', 'High', 'Very_High');

-- CreateEnum
CREATE TYPE "public"."MissionCriticality" AS ENUM ('Mission_Critical', 'Mission_Essential', 'Mission_Support');

-- CreateEnum
CREATE TYPE "public"."DataClassification" AS ENUM ('Unclassified', 'CUI', 'Confidential', 'Secret', 'Top_Secret', 'TS_SCI');

-- CreateEnum
CREATE TYPE "public"."SecurityControlBaseline" AS ENUM ('Low', 'Moderate', 'High', 'Tailored');

-- CreateEnum
CREATE TYPE "public"."PoamStatus" AS ENUM ('Draft', 'Open', 'In_Progress', 'Completed', 'Closed', 'Cancelled');

-- CreateEnum
CREATE TYPE "public"."ContinuousMonitoringStatus" AS ENUM ('Fully_Implemented', 'Partially_Implemented', 'Not_Implemented');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('Admin', 'ISSM', 'ISSO', 'SysAdmin', 'ISSE', 'Auditor');

-- CreateEnum
CREATE TYPE "public"."TeamMembershipRole" AS ENUM ('Lead', 'Member');

-- CreateEnum
CREATE TYPE "public"."StpStatus" AS ENUM ('Draft', 'In_Progress', 'Under_Review', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."StpPriority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "public"."StpTestCaseStatus" AS ENUM ('Not_Started', 'In_Progress', 'Passed', 'Failed', 'Blocked');

-- CreateEnum
CREATE TYPE "public"."KcSpaceType" AS ENUM ('personal', 'team', 'global');

-- CreateEnum
CREATE TYPE "public"."KcVisibility" AS ENUM ('public', 'restricted', 'private');

-- CreateEnum
CREATE TYPE "public"."KcContentType" AS ENUM ('markdown', 'html', 'rich_text');

-- CreateEnum
CREATE TYPE "public"."KcPageStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "public"."KcPermissionLevel" AS ENUM ('read', 'write', 'admin');

-- CreateEnum
CREATE TYPE "public"."PoamSeverity" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "public"."PoamPriority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "public"."PoamMilestoneStatus" AS ENUM ('Pending', 'In_Progress', 'Completed', 'Delayed', 'Cancelled');

-- CreateEnum
CREATE TYPE "public"."PoamMilestoneType" AS ENUM ('Planning', 'Design', 'Implementation', 'Testing', 'Documentation', 'Review', 'Deployment');

-- CreateEnum
CREATE TYPE "public"."PoamCommentType" AS ENUM ('General', 'Status_Update', 'Risk_Assessment', 'Technical_Note', 'Management_Decision');

-- CreateEnum
CREATE TYPE "public"."RmfStep" AS ENUM ('Categorize', 'Select', 'Implement', 'Assess', 'Authorize', 'Monitor');

-- CreateEnum
CREATE TYPE "public"."SystemOperatingSystem" AS ENUM ('Windows_Server_2022', 'Windows_Server_2019', 'Windows_Server_2016', 'Windows_Server_2012_R2', 'Windows_Server_2012', 'Windows_11', 'Windows_10', 'Windows_8_1', 'Windows_7', 'RHEL_9', 'RHEL_8', 'RHEL_7', 'CentOS_9', 'CentOS_8', 'CentOS_7', 'Ubuntu_22_04_LTS', 'Ubuntu_20_04_LTS', 'Ubuntu_18_04_LTS', 'SUSE_Linux_Enterprise_15', 'SUSE_Linux_Enterprise_12', 'Oracle_Linux_9', 'Oracle_Linux_8', 'Amazon_Linux_2', 'Rocky_Linux_9', 'Rocky_Linux_8', 'AlmaLinux_9', 'AlmaLinux_8', 'Ubuntu_Desktop', 'Fedora_Workstation', 'CentOS_Desktop', 'RHEL_Workstation', 'AIX_7_3', 'AIX_7_2', 'Solaris_11_4', 'HP_UX_11_31', 'Cisco_IOS', 'Cisco_IOS_XE', 'Cisco_NX_OS', 'Juniper_Junos', 'VMware_vSphere_8', 'VMware_vSphere_7', 'VMware_vSphere_6_7', 'Citrix_XenServer', 'Microsoft_Hyper_V', 'Docker_Engine', 'Kubernetes', 'OpenShift_4', 'Rancher', 'Amazon_Linux', 'Google_Container_Optimized_OS', 'Azure_Linux', 'Oracle_Database_19c', 'Oracle_Database_12c', 'SQL_Server_2022', 'SQL_Server_2019', 'MySQL_8_0', 'PostgreSQL_15', 'MongoDB_6_0', 'Other', 'Unknown');

-- CreateEnum
CREATE TYPE "public"."SystemArchitecture" AS ENUM ('x86_64', 'x86_32', 'ARM64', 'ARM32', 'PowerPC', 'SPARC', 'IA_64', 'MIPS', 'Other');

-- CreateEnum
CREATE TYPE "public"."EncryptionStatus" AS ENUM ('Fully_Encrypted', 'Partially_Encrypted', 'Not_Encrypted', 'Unknown');

-- CreateEnum
CREATE TYPE "public"."AntivirusStatus" AS ENUM ('Installed_Current', 'Installed_Outdated', 'Not_Installed', 'Not_Applicable', 'Unknown');

-- CreateEnum
CREATE TYPE "public"."LifecycleStatus" AS ENUM ('Planning', 'Development', 'Testing', 'Active', 'Maintenance_Mode', 'End_of_Life', 'Decommissioned', 'Retired');

-- CreateEnum
CREATE TYPE "public"."EnvironmentType" AS ENUM ('Production', 'Staging', 'Development', 'Testing', 'Training', 'Backup', 'Disaster_Recovery', 'Sandbox');

-- CreateEnum
CREATE TYPE "public"."SystemCriticality" AS ENUM ('Critical', 'High', 'Medium', 'Low', 'Non_Essential');

-- CreateTable
CREATE TABLE "public"."packages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rmf_step" "public"."RmfStep" NOT NULL DEFAULT 'Categorize',
    "categorize_complete" BOOLEAN NOT NULL DEFAULT false,
    "select_complete" BOOLEAN NOT NULL DEFAULT false,
    "implement_complete" BOOLEAN NOT NULL DEFAULT false,
    "assess_complete" BOOLEAN NOT NULL DEFAULT false,
    "authorize_complete" BOOLEAN NOT NULL DEFAULT false,
    "monitor_complete" BOOLEAN NOT NULL DEFAULT false,
    "team_id" INTEGER,
    "system_owner" TEXT,
    "authorizing_official" TEXT,
    "isso_name" TEXT,
    "issm_name" TEXT,
    "system_administrator" TEXT,
    "network_administrator" TEXT,
    "database_administrator" TEXT,
    "application_administrator" TEXT,
    "security_control_assessor" TEXT,
    "system_type" "public"."SystemType",
    "confidentiality_impact" "public"."ImpactLevel",
    "integrity_impact" "public"."ImpactLevel",
    "availability_impact" "public"."ImpactLevel",
    "overall_categorization" "public"."ImpactLevel",
    "mission_criticality" "public"."MissionCriticality",
    "data_classification" "public"."DataClassification",
    "security_control_baseline" "public"."SecurityControlBaseline",
    "control_selection_rationale" TEXT,
    "tailoring_decisions" TEXT,
    "authorization_status" "public"."AuthorizationStatus",
    "authorization_date" TEXT,
    "authorization_expiry" TEXT,
    "risk_assessment_date" TEXT,
    "residual_risk_level" "public"."ResidualRiskLevel",
    "poam_status" "public"."PoamStatus",
    "continuous_monitoring_status" "public"."ContinuousMonitoringStatus",
    "last_assessment_date" TEXT,
    "next_assessment_date" TEXT,
    "business_owner" TEXT,
    "business_purpose" TEXT,
    "organizational_unit" TEXT,
    "physical_location" TEXT,
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed_at" TIMESTAMP(3),
    "onboarding_completed_by" TEXT,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."systems" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "group_id" INTEGER,
    "name" TEXT NOT NULL,
    "hostname" TEXT,
    "description" TEXT DEFAULT '',
    "ip_address" TEXT,
    "mac_address" TEXT,
    "subnet_mask" TEXT,
    "default_gateway" TEXT,
    "dns_servers" TEXT,
    "operating_system" "public"."SystemOperatingSystem",
    "os_version" TEXT,
    "architecture" "public"."SystemArchitecture" DEFAULT 'x86_64',
    "cpu_cores" INTEGER,
    "ram_gb" INTEGER,
    "storage_gb" INTEGER,
    "classification" "public"."DataClassification",
    "encryption_status" "public"."EncryptionStatus" DEFAULT 'Unknown',
    "patch_level" TEXT,
    "antivirus_status" "public"."AntivirusStatus" DEFAULT 'Unknown',
    "asset_tag" TEXT,
    "serial_number" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "purchase_date" TEXT,
    "warranty_expiry" TEXT,
    "lifecycle_status" "public"."LifecycleStatus" DEFAULT 'Active',
    "eol_date" TEXT,
    "replacement_date" TEXT,
    "primary_contact" TEXT,
    "backup_contact" TEXT,
    "vendor" TEXT,
    "support_contract" TEXT,
    "support_expiry" TEXT,
    "physical_location" TEXT,
    "rack_location" TEXT,
    "datacenter" TEXT,
    "environment_type" "public"."EnvironmentType" DEFAULT 'Production',
    "business_function" TEXT,
    "criticality" "public"."SystemCriticality" DEFAULT 'Medium',
    "backup_schedule" TEXT,
    "maintenance_window" TEXT,
    "last_inventory_date" TEXT,
    "compliance_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "password_hash" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lead_user_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_memberships" (
    "user_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "role" "public"."TeamMembershipRole" NOT NULL DEFAULT 'Member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("user_id","team_id")
);

-- CreateTable
CREATE TABLE "public"."stig_scans" (
    "id" SERIAL NOT NULL,
    "system_id" INTEGER NOT NULL,
    "title" TEXT,
    "checklist_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stig_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stig_findings" (
    "id" SERIAL NOT NULL,
    "system_id" INTEGER NOT NULL,
    "scan_id" INTEGER NOT NULL,
    "group_id" TEXT,
    "rule_id" TEXT NOT NULL,
    "rule_version" TEXT,
    "rule_title" TEXT,
    "severity" TEXT,
    "status" TEXT,
    "finding_details" TEXT,
    "check_content" TEXT,
    "fix_text" TEXT,
    "cci" TEXT,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stig_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stps" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "system_id" INTEGER NOT NULL,
    "package_id" INTEGER NOT NULL,
    "status" "public"."StpStatus" NOT NULL DEFAULT 'Draft',
    "priority" "public"."StpPriority" NOT NULL DEFAULT 'Medium',
    "assigned_team_id" INTEGER,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "due_date" TEXT,

    CONSTRAINT "stps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stp_test_cases" (
    "id" SERIAL NOT NULL,
    "stp_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "test_procedure" TEXT DEFAULT '',
    "expected_result" TEXT DEFAULT '',
    "actual_result" TEXT DEFAULT '',
    "status" "public"."StpTestCaseStatus" NOT NULL DEFAULT 'Not_Started',
    "assigned_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stp_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stp_evidence" (
    "id" SERIAL NOT NULL,
    "stp_id" INTEGER NOT NULL,
    "test_case_id" INTEGER,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT,
    "description" TEXT DEFAULT '',
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stp_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."poams" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "group_id" INTEGER,
    "poam_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weakness_description" TEXT,
    "nist_control_id" TEXT,
    "severity" "public"."PoamSeverity" NOT NULL DEFAULT 'Medium',
    "status" "public"."PoamStatus" NOT NULL DEFAULT 'Draft',
    "priority" "public"."PoamPriority" NOT NULL DEFAULT 'Medium',
    "residual_risk_level" "public"."ResidualRiskLevel",
    "target_completion_date" TEXT,
    "actual_completion_date" TEXT,
    "estimated_cost" DOUBLE PRECISION,
    "actual_cost" DOUBLE PRECISION,
    "poc_name" TEXT,
    "poc_email" TEXT,
    "poc_phone" TEXT,
    "assigned_team_id" INTEGER,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."poam_stps" (
    "id" SERIAL NOT NULL,
    "poam_id" INTEGER NOT NULL,
    "stp_id" INTEGER NOT NULL,
    "contribution_percentage" DOUBLE PRECISION DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poam_stps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."poam_milestones" (
    "id" SERIAL NOT NULL,
    "poam_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "target_date" TEXT,
    "actual_date" TEXT,
    "status" "public"."PoamMilestoneStatus" NOT NULL DEFAULT 'Pending',
    "milestone_type" "public"."PoamMilestoneType" DEFAULT 'Implementation',
    "deliverables" TEXT DEFAULT '',
    "success_criteria" TEXT DEFAULT '',
    "assigned_user_id" INTEGER,
    "completion_percentage" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poam_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."poam_comments" (
    "id" SERIAL NOT NULL,
    "poam_id" INTEGER NOT NULL,
    "milestone_id" INTEGER,
    "comment" TEXT NOT NULL,
    "comment_type" "public"."PoamCommentType" NOT NULL DEFAULT 'General',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poam_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" SERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "userId" INTEGER,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kc_spaces" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "type" "public"."KcSpaceType" NOT NULL DEFAULT 'team',
    "visibility" "public"."KcVisibility" NOT NULL DEFAULT 'public',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kc_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kc_pages" (
    "id" SERIAL NOT NULL,
    "space_id" INTEGER NOT NULL,
    "parentId" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT DEFAULT '',
    "content_type" "public"."KcContentType" NOT NULL DEFAULT 'markdown',
    "status" "public"."KcPageStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "kc_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kc_page_versions" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT DEFAULT '',
    "content_type" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT DEFAULT '',

    CONSTRAINT "kc_page_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kc_comments" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "parentId" INTEGER,
    "content" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kc_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kc_attachments" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER,
    "space_id" INTEGER,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT,
    "description" TEXT DEFAULT '',
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kc_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kc_space_permissions" (
    "id" SERIAL NOT NULL,
    "space_id" INTEGER NOT NULL,
    "userId" INTEGER,
    "teamId" INTEGER,
    "permission" "public"."KcPermissionLevel" NOT NULL DEFAULT 'read',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kc_space_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nessus_reports" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER,
    "system_id" INTEGER,
    "filename" TEXT NOT NULL,
    "scan_name" TEXT NOT NULL,
    "scan_date" TEXT NOT NULL,
    "total_hosts" INTEGER NOT NULL,
    "total_vulnerabilities" INTEGER NOT NULL,
    "scan_metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nessus_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nessus_hosts" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "hostname" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "mac_address" TEXT,
    "os_info" TEXT,
    "total_vulnerabilities" INTEGER NOT NULL,
    "critical_count" INTEGER NOT NULL DEFAULT 0,
    "high_count" INTEGER NOT NULL DEFAULT 0,
    "medium_count" INTEGER NOT NULL DEFAULT 0,
    "low_count" INTEGER NOT NULL DEFAULT 0,
    "info_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "nessus_hosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nessus_vulnerabilities" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "host_id" INTEGER NOT NULL,
    "plugin_id" INTEGER NOT NULL,
    "plugin_name" TEXT NOT NULL,
    "plugin_family" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "port" TEXT,
    "protocol" TEXT,
    "service" TEXT,
    "description" TEXT,
    "solution" TEXT,
    "synopsis" TEXT,
    "cve" TEXT,
    "cvss_score" DOUBLE PRECISION,
    "cvss3_score" DOUBLE PRECISION,
    "plugin_output" TEXT,
    "risk_factor" TEXT,
    "exploit_available" BOOLEAN DEFAULT false,
    "patch_publication_date" TEXT,
    "vuln_publication_date" TEXT,

    CONSTRAINT "nessus_vulnerabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "packages_name_key" ON "public"."packages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "groups_package_id_name_key" ON "public"."groups"("package_id", "name");

-- CreateIndex
CREATE INDEX "systems_package_id_idx" ON "public"."systems"("package_id");

-- CreateIndex
CREATE INDEX "systems_group_id_idx" ON "public"."systems"("group_id");

-- CreateIndex
CREATE INDEX "systems_ip_address_idx" ON "public"."systems"("ip_address");

-- CreateIndex
CREATE INDEX "systems_hostname_idx" ON "public"."systems"("hostname");

-- CreateIndex
CREATE INDEX "systems_asset_tag_idx" ON "public"."systems"("asset_tag");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "public"."teams"("name");

-- CreateIndex
CREATE INDEX "stig_findings_system_id_idx" ON "public"."stig_findings"("system_id");

-- CreateIndex
CREATE INDEX "stig_findings_severity_idx" ON "public"."stig_findings"("severity");

-- CreateIndex
CREATE INDEX "stig_findings_status_idx" ON "public"."stig_findings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "stig_findings_system_id_rule_id_key" ON "public"."stig_findings"("system_id", "rule_id");

-- CreateIndex
CREATE INDEX "stps_system_id_idx" ON "public"."stps"("system_id");

-- CreateIndex
CREATE INDEX "stps_package_id_idx" ON "public"."stps"("package_id");

-- CreateIndex
CREATE INDEX "stps_status_idx" ON "public"."stps"("status");

-- CreateIndex
CREATE INDEX "stps_assigned_team_id_idx" ON "public"."stps"("assigned_team_id");

-- CreateIndex
CREATE INDEX "stp_test_cases_stp_id_idx" ON "public"."stp_test_cases"("stp_id");

-- CreateIndex
CREATE INDEX "stp_test_cases_status_idx" ON "public"."stp_test_cases"("status");

-- CreateIndex
CREATE INDEX "stp_evidence_stp_id_idx" ON "public"."stp_evidence"("stp_id");

-- CreateIndex
CREATE INDEX "stp_evidence_test_case_id_idx" ON "public"."stp_evidence"("test_case_id");

-- CreateIndex
CREATE UNIQUE INDEX "poams_poam_number_key" ON "public"."poams"("poam_number");

-- CreateIndex
CREATE INDEX "poams_package_id_idx" ON "public"."poams"("package_id");

-- CreateIndex
CREATE INDEX "poams_group_id_idx" ON "public"."poams"("group_id");

-- CreateIndex
CREATE INDEX "poams_status_idx" ON "public"."poams"("status");

-- CreateIndex
CREATE INDEX "poams_severity_idx" ON "public"."poams"("severity");

-- CreateIndex
CREATE INDEX "poams_assigned_team_id_idx" ON "public"."poams"("assigned_team_id");

-- CreateIndex
CREATE INDEX "poams_poam_number_idx" ON "public"."poams"("poam_number");

-- CreateIndex
CREATE INDEX "poam_stps_poam_id_idx" ON "public"."poam_stps"("poam_id");

-- CreateIndex
CREATE INDEX "poam_stps_stp_id_idx" ON "public"."poam_stps"("stp_id");

-- CreateIndex
CREATE UNIQUE INDEX "poam_stps_poam_id_stp_id_key" ON "public"."poam_stps"("poam_id", "stp_id");

-- CreateIndex
CREATE INDEX "poam_milestones_poam_id_idx" ON "public"."poam_milestones"("poam_id");

-- CreateIndex
CREATE INDEX "poam_milestones_status_idx" ON "public"."poam_milestones"("status");

-- CreateIndex
CREATE INDEX "poam_milestones_assigned_user_id_idx" ON "public"."poam_milestones"("assigned_user_id");

-- CreateIndex
CREATE INDEX "poam_milestones_target_date_idx" ON "public"."poam_milestones"("target_date");

-- CreateIndex
CREATE INDEX "poam_comments_poam_id_idx" ON "public"."poam_comments"("poam_id");

-- CreateIndex
CREATE INDEX "poam_comments_milestone_id_idx" ON "public"."poam_comments"("milestone_id");

-- CreateIndex
CREATE INDEX "poam_comments_created_by_idx" ON "public"."poam_comments"("created_by");

-- CreateIndex
CREATE INDEX "audit_logs_event_idx" ON "public"."audit_logs"("event");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kc_spaces_key_key" ON "public"."kc_spaces"("key");

-- CreateIndex
CREATE INDEX "kc_spaces_key_idx" ON "public"."kc_spaces"("key");

-- CreateIndex
CREATE INDEX "kc_spaces_type_idx" ON "public"."kc_spaces"("type");

-- CreateIndex
CREATE INDEX "kc_spaces_visibility_idx" ON "public"."kc_spaces"("visibility");

-- CreateIndex
CREATE INDEX "kc_spaces_created_by_idx" ON "public"."kc_spaces"("created_by");

-- CreateIndex
CREATE INDEX "kc_pages_space_id_idx" ON "public"."kc_pages"("space_id");

-- CreateIndex
CREATE INDEX "kc_pages_parentId_idx" ON "public"."kc_pages"("parentId");

-- CreateIndex
CREATE INDEX "kc_pages_slug_idx" ON "public"."kc_pages"("slug");

-- CreateIndex
CREATE INDEX "kc_pages_status_idx" ON "public"."kc_pages"("status");

-- CreateIndex
CREATE INDEX "kc_pages_created_by_idx" ON "public"."kc_pages"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "kc_pages_space_id_slug_key" ON "public"."kc_pages"("space_id", "slug");

-- CreateIndex
CREATE INDEX "kc_page_versions_page_id_idx" ON "public"."kc_page_versions"("page_id");

-- CreateIndex
CREATE INDEX "kc_page_versions_version_idx" ON "public"."kc_page_versions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "kc_page_versions_page_id_version_key" ON "public"."kc_page_versions"("page_id", "version");

-- CreateIndex
CREATE INDEX "kc_comments_page_id_idx" ON "public"."kc_comments"("page_id");

-- CreateIndex
CREATE INDEX "kc_comments_parentId_idx" ON "public"."kc_comments"("parentId");

-- CreateIndex
CREATE INDEX "kc_comments_created_by_idx" ON "public"."kc_comments"("created_by");

-- CreateIndex
CREATE INDEX "kc_attachments_page_id_idx" ON "public"."kc_attachments"("page_id");

-- CreateIndex
CREATE INDEX "kc_attachments_space_id_idx" ON "public"."kc_attachments"("space_id");

-- CreateIndex
CREATE INDEX "kc_attachments_uploaded_by_idx" ON "public"."kc_attachments"("uploaded_by");

-- CreateIndex
CREATE INDEX "kc_space_permissions_space_id_idx" ON "public"."kc_space_permissions"("space_id");

-- CreateIndex
CREATE INDEX "kc_space_permissions_userId_idx" ON "public"."kc_space_permissions"("userId");

-- CreateIndex
CREATE INDEX "kc_space_permissions_teamId_idx" ON "public"."kc_space_permissions"("teamId");

-- CreateIndex
CREATE INDEX "nessus_reports_package_id_idx" ON "public"."nessus_reports"("package_id");

-- CreateIndex
CREATE INDEX "nessus_reports_system_id_idx" ON "public"."nessus_reports"("system_id");

-- CreateIndex
CREATE INDEX "nessus_reports_scan_date_idx" ON "public"."nessus_reports"("scan_date");

-- CreateIndex
CREATE INDEX "nessus_hosts_report_id_idx" ON "public"."nessus_hosts"("report_id");

-- CreateIndex
CREATE INDEX "nessus_hosts_ip_address_idx" ON "public"."nessus_hosts"("ip_address");

-- CreateIndex
CREATE INDEX "nessus_vulnerabilities_report_id_idx" ON "public"."nessus_vulnerabilities"("report_id");

-- CreateIndex
CREATE INDEX "nessus_vulnerabilities_host_id_idx" ON "public"."nessus_vulnerabilities"("host_id");

-- CreateIndex
CREATE INDEX "nessus_vulnerabilities_plugin_id_idx" ON "public"."nessus_vulnerabilities"("plugin_id");

-- CreateIndex
CREATE INDEX "nessus_vulnerabilities_severity_idx" ON "public"."nessus_vulnerabilities"("severity");

-- CreateIndex
CREATE INDEX "nessus_vulnerabilities_plugin_family_idx" ON "public"."nessus_vulnerabilities"("plugin_family");

-- AddForeignKey
ALTER TABLE "public"."packages" ADD CONSTRAINT "packages_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."systems" ADD CONSTRAINT "systems_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."systems" ADD CONSTRAINT "systems_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_lead_user_id_fkey" FOREIGN KEY ("lead_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_memberships" ADD CONSTRAINT "team_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stig_scans" ADD CONSTRAINT "stig_scans_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stig_findings" ADD CONSTRAINT "stig_findings_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stig_findings" ADD CONSTRAINT "stig_findings_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "public"."stig_scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stps" ADD CONSTRAINT "stps_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stps" ADD CONSTRAINT "stps_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stps" ADD CONSTRAINT "stps_assigned_team_id_fkey" FOREIGN KEY ("assigned_team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stps" ADD CONSTRAINT "stps_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stp_test_cases" ADD CONSTRAINT "stp_test_cases_stp_id_fkey" FOREIGN KEY ("stp_id") REFERENCES "public"."stps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stp_test_cases" ADD CONSTRAINT "stp_test_cases_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stp_evidence" ADD CONSTRAINT "stp_evidence_stp_id_fkey" FOREIGN KEY ("stp_id") REFERENCES "public"."stps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stp_evidence" ADD CONSTRAINT "stp_evidence_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "public"."stp_test_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stp_evidence" ADD CONSTRAINT "stp_evidence_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poams" ADD CONSTRAINT "poams_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poams" ADD CONSTRAINT "poams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poams" ADD CONSTRAINT "poams_assigned_team_id_fkey" FOREIGN KEY ("assigned_team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poams" ADD CONSTRAINT "poams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_stps" ADD CONSTRAINT "poam_stps_poam_id_fkey" FOREIGN KEY ("poam_id") REFERENCES "public"."poams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_stps" ADD CONSTRAINT "poam_stps_stp_id_fkey" FOREIGN KEY ("stp_id") REFERENCES "public"."stps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_milestones" ADD CONSTRAINT "poam_milestones_poam_id_fkey" FOREIGN KEY ("poam_id") REFERENCES "public"."poams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_milestones" ADD CONSTRAINT "poam_milestones_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_comments" ADD CONSTRAINT "poam_comments_poam_id_fkey" FOREIGN KEY ("poam_id") REFERENCES "public"."poams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_comments" ADD CONSTRAINT "poam_comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_spaces" ADD CONSTRAINT "kc_spaces_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_pages" ADD CONSTRAINT "kc_pages_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."kc_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_pages" ADD CONSTRAINT "kc_pages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."kc_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_pages" ADD CONSTRAINT "kc_pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_pages" ADD CONSTRAINT "kc_pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_page_versions" ADD CONSTRAINT "kc_page_versions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."kc_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_page_versions" ADD CONSTRAINT "kc_page_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_comments" ADD CONSTRAINT "kc_comments_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."kc_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_comments" ADD CONSTRAINT "kc_comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_comments" ADD CONSTRAINT "kc_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."kc_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_attachments" ADD CONSTRAINT "kc_attachments_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."kc_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_attachments" ADD CONSTRAINT "kc_attachments_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."kc_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_attachments" ADD CONSTRAINT "kc_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_space_permissions" ADD CONSTRAINT "kc_space_permissions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."kc_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_space_permissions" ADD CONSTRAINT "kc_space_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kc_space_permissions" ADD CONSTRAINT "kc_space_permissions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nessus_reports" ADD CONSTRAINT "nessus_reports_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nessus_reports" ADD CONSTRAINT "nessus_reports_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nessus_hosts" ADD CONSTRAINT "nessus_hosts_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."nessus_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nessus_vulnerabilities" ADD CONSTRAINT "nessus_vulnerabilities_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."nessus_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nessus_vulnerabilities" ADD CONSTRAINT "nessus_vulnerabilities_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."nessus_hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
