/*
  Warnings:

  - The `target_date` column on the `poam_milestones` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `actual_date` column on the `poam_milestones` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `actual_cost` on the `poams` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_cost` on the `poams` table. All the data in the column will be lost.
  - The `target_completion_date` column on the `poams` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `actual_completion_date` column on the `poams` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ThreatLevel" AS ENUM ('Very_Low', 'Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "public"."RiskLikelihood" AS ENUM ('Very_Unlikely', 'Unlikely', 'Possible', 'Likely', 'Very_Likely');

-- CreateEnum
CREATE TYPE "public"."RiskImpact" AS ENUM ('Negligible', 'Minor', 'Moderate', 'Major', 'Severe');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('Pending', 'Under_Review', 'Approved', 'Rejected', 'Returned_For_Revision');

-- CreateEnum
CREATE TYPE "public"."EvidenceType" AS ENUM ('Screenshot', 'Document', 'Test_Result', 'Scan_Report', 'Configuration_File', 'Log_File', 'Other');

-- CreateEnum
CREATE TYPE "public"."FileAssociationType" AS ENUM ('STP_EVIDENCE', 'TEST_CASE_EVIDENCE', 'POAM_EVIDENCE', 'SYSTEM_EVIDENCE', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."FileAuditAction" AS ENUM ('UPLOADED', 'DOWNLOADED', 'UPDATED', 'DELETED', 'VERSION_CREATED', 'ASSOCIATED', 'DISASSOCIATED');

-- AlterTable
ALTER TABLE "public"."poam_milestones" ADD COLUMN     "blockers" TEXT,
ADD COLUMN     "dependencies" TEXT,
DROP COLUMN "target_date",
ADD COLUMN     "target_date" TIMESTAMP(3),
DROP COLUMN "actual_date",
ADD COLUMN     "actual_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."poams" DROP COLUMN "actual_cost",
DROP COLUMN "estimated_cost",
ADD COLUMN     "alt_poc_email" TEXT,
ADD COLUMN     "alt_poc_name" TEXT,
ADD COLUMN     "alt_poc_phone" TEXT,
ADD COLUMN     "approval_comments" TEXT,
ADD COLUMN     "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" INTEGER,
ADD COLUMN     "impact" "public"."RiskImpact" DEFAULT 'Moderate',
ADD COLUMN     "inherent_risk_score" DOUBLE PRECISION,
ADD COLUMN     "last_reviewed_date" TIMESTAMP(3),
ADD COLUMN     "likelihood" "public"."RiskLikelihood" DEFAULT 'Possible',
ADD COLUMN     "mitigation_strategy" TEXT,
ADD COLUMN     "residual_risk_score" DOUBLE PRECISION,
ADD COLUMN     "risk_acceptance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "risk_acceptance_rationale" TEXT,
ADD COLUMN     "risk_accepted_by" INTEGER,
ADD COLUMN     "risk_accepted_date" TIMESTAMP(3),
ADD COLUMN     "risk_statement" TEXT,
ADD COLUMN     "scheduled_review_date" TIMESTAMP(3),
ADD COLUMN     "submitted_for_approval_at" TIMESTAMP(3),
ADD COLUMN     "threat_level" "public"."ThreatLevel" DEFAULT 'Medium',
DROP COLUMN "target_completion_date",
ADD COLUMN     "target_completion_date" TIMESTAMP(3),
DROP COLUMN "actual_completion_date",
ADD COLUMN     "actual_completion_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."poam_evidences" (
    "id" SERIAL NOT NULL,
    "poam_id" INTEGER NOT NULL,
    "milestone_id" INTEGER,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "evidence_type" "public"."EvidenceType" NOT NULL DEFAULT 'Document',
    "description" TEXT,
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poam_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."poam_reviews" (
    "id" SERIAL NOT NULL,
    "poam_id" INTEGER NOT NULL,
    "review_type" TEXT NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL,
    "reviewed_by" INTEGER NOT NULL,
    "findings" TEXT,
    "recommendations" TEXT,
    "next_review_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poam_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."files" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT,
    "file_path" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_versions" (
    "id" SERIAL NOT NULL,
    "file_id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT,
    "file_path" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT DEFAULT '',

    CONSTRAINT "file_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_associations" (
    "id" SERIAL NOT NULL,
    "file_id" INTEGER NOT NULL,
    "association_type" "public"."FileAssociationType" NOT NULL,
    "stp_id" INTEGER,
    "test_case_id" INTEGER,
    "poam_id" INTEGER,
    "system_id" INTEGER,
    "description" TEXT DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_audit_logs" (
    "id" SERIAL NOT NULL,
    "file_id" INTEGER NOT NULL,
    "action" "public"."FileAuditAction" NOT NULL,
    "user_id" INTEGER,
    "details" TEXT DEFAULT '',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,

    CONSTRAINT "file_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poam_evidences_poam_id_idx" ON "public"."poam_evidences"("poam_id");

-- CreateIndex
CREATE INDEX "poam_evidences_milestone_id_idx" ON "public"."poam_evidences"("milestone_id");

-- CreateIndex
CREATE INDEX "poam_evidences_uploaded_by_idx" ON "public"."poam_evidences"("uploaded_by");

-- CreateIndex
CREATE INDEX "poam_reviews_poam_id_idx" ON "public"."poam_reviews"("poam_id");

-- CreateIndex
CREATE INDEX "poam_reviews_reviewed_by_idx" ON "public"."poam_reviews"("reviewed_by");

-- CreateIndex
CREATE INDEX "poam_reviews_review_date_idx" ON "public"."poam_reviews"("review_date");

-- CreateIndex
CREATE INDEX "files_uploaded_by_idx" ON "public"."files"("uploaded_by");

-- CreateIndex
CREATE INDEX "file_versions_file_id_idx" ON "public"."file_versions"("file_id");

-- CreateIndex
CREATE INDEX "file_versions_version_idx" ON "public"."file_versions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "file_versions_file_id_version_key" ON "public"."file_versions"("file_id", "version");

-- CreateIndex
CREATE INDEX "file_associations_file_id_idx" ON "public"."file_associations"("file_id");

-- CreateIndex
CREATE INDEX "file_associations_association_type_idx" ON "public"."file_associations"("association_type");

-- CreateIndex
CREATE INDEX "file_associations_stp_id_idx" ON "public"."file_associations"("stp_id");

-- CreateIndex
CREATE INDEX "file_associations_test_case_id_idx" ON "public"."file_associations"("test_case_id");

-- CreateIndex
CREATE INDEX "file_associations_poam_id_idx" ON "public"."file_associations"("poam_id");

-- CreateIndex
CREATE INDEX "file_associations_system_id_idx" ON "public"."file_associations"("system_id");

-- CreateIndex
CREATE INDEX "file_audit_logs_file_id_idx" ON "public"."file_audit_logs"("file_id");

-- CreateIndex
CREATE INDEX "file_audit_logs_action_idx" ON "public"."file_audit_logs"("action");

-- CreateIndex
CREATE INDEX "file_audit_logs_user_id_idx" ON "public"."file_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "file_audit_logs_timestamp_idx" ON "public"."file_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "poam_milestones_target_date_idx" ON "public"."poam_milestones"("target_date");

-- AddForeignKey
ALTER TABLE "public"."poams" ADD CONSTRAINT "poams_risk_accepted_by_fkey" FOREIGN KEY ("risk_accepted_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poams" ADD CONSTRAINT "poams_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_evidences" ADD CONSTRAINT "poam_evidences_poam_id_fkey" FOREIGN KEY ("poam_id") REFERENCES "public"."poams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_evidences" ADD CONSTRAINT "poam_evidences_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."poam_milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_evidences" ADD CONSTRAINT "poam_evidences_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_reviews" ADD CONSTRAINT "poam_reviews_poam_id_fkey" FOREIGN KEY ("poam_id") REFERENCES "public"."poams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."poam_reviews" ADD CONSTRAINT "poam_reviews_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_versions" ADD CONSTRAINT "file_versions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_versions" ADD CONSTRAINT "file_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_associations" ADD CONSTRAINT "file_associations_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_associations" ADD CONSTRAINT "file_associations_stp_id_fkey" FOREIGN KEY ("stp_id") REFERENCES "public"."stps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_associations" ADD CONSTRAINT "file_associations_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "public"."stp_test_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_associations" ADD CONSTRAINT "file_associations_poam_id_fkey" FOREIGN KEY ("poam_id") REFERENCES "public"."poams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_associations" ADD CONSTRAINT "file_associations_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_audit_logs" ADD CONSTRAINT "file_audit_logs_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_audit_logs" ADD CONSTRAINT "file_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
