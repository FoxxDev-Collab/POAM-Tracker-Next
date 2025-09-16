-- CreateEnum
CREATE TYPE "public"."ComplianceStatus" AS ENUM ('NOT_ASSESSED', 'NC_U', 'NC_O', 'CU', 'CO', 'NA_U', 'NA_O');

-- AlterTable
ALTER TABLE "public"."nist_control_ccis" ADD COLUMN     "assessed_at" TIMESTAMP(3),
ADD COLUMN     "assessed_by" INTEGER,
ADD COLUMN     "compliance_notes" TEXT,
ADD COLUMN     "compliance_status" "public"."ComplianceStatus" DEFAULT 'NOT_ASSESSED';

-- AlterTable
ALTER TABLE "public"."nist_controls" ADD COLUMN     "assessed_at" TIMESTAMP(3),
ADD COLUMN     "assessed_by" INTEGER,
ADD COLUMN     "compliance_notes" TEXT,
ADD COLUMN     "compliance_status" "public"."ComplianceStatus" DEFAULT 'NOT_ASSESSED';

-- CreateIndex
CREATE INDEX "nist_control_ccis_compliance_status_idx" ON "public"."nist_control_ccis"("compliance_status");

-- CreateIndex
CREATE INDEX "nist_controls_compliance_status_idx" ON "public"."nist_controls"("compliance_status");

-- AddForeignKey
ALTER TABLE "public"."nist_controls" ADD CONSTRAINT "nist_controls_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nist_control_ccis" ADD CONSTRAINT "nist_control_ccis_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
