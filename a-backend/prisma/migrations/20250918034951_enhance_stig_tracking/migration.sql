-- AlterTable
ALTER TABLE "public"."stig_findings" ADD COLUMN     "control_id" TEXT,
ADD COLUMN     "justification" TEXT,
ADD COLUMN     "last_stp_id" INTEGER,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" INTEGER,
ADD COLUMN     "stp_status" TEXT NOT NULL DEFAULT 'None',
ADD COLUMN     "vuln_id" TEXT;

-- AlterTable
ALTER TABLE "public"."stig_scans" ADD COLUMN     "filename" TEXT,
ADD COLUMN     "finding_count" INTEGER,
ADD COLUMN     "imported_by" INTEGER,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."cci_control_mappings" (
    "id" SERIAL NOT NULL,
    "cci" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "control_title" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cci_control_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_scores" (
    "id" SERIAL NOT NULL,
    "system_id" INTEGER NOT NULL,
    "scan_id" INTEGER NOT NULL,
    "assessment_progress" DOUBLE PRECISION NOT NULL,
    "compliance_score" DOUBLE PRECISION NOT NULL,
    "total_findings" INTEGER NOT NULL,
    "open_findings" INTEGER NOT NULL,
    "not_reviewed_findings" INTEGER NOT NULL,
    "cat_i_open" INTEGER NOT NULL,
    "cat_ii_open" INTEGER NOT NULL,
    "cat_iii_open" INTEGER NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."control_system_status" (
    "id" SERIAL NOT NULL,
    "control_id" TEXT NOT NULL,
    "system_id" INTEGER NOT NULL,
    "has_findings" BOOLEAN NOT NULL,
    "open_count" INTEGER NOT NULL,
    "critical_count" INTEGER NOT NULL,
    "last_assessed" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_system_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cci_control_mappings_cci_key" ON "public"."cci_control_mappings"("cci");

-- CreateIndex
CREATE UNIQUE INDEX "system_scores_system_id_scan_id_key" ON "public"."system_scores"("system_id", "scan_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_system_status_control_id_system_id_key" ON "public"."control_system_status"("control_id", "system_id");

-- CreateIndex
CREATE INDEX "stig_findings_control_id_idx" ON "public"."stig_findings"("control_id");

-- AddForeignKey
ALTER TABLE "public"."stig_scans" ADD CONSTRAINT "stig_scans_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stig_findings" ADD CONSTRAINT "stig_findings_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_scores" ADD CONSTRAINT "system_scores_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_scores" ADD CONSTRAINT "system_scores_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "public"."stig_scans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."control_system_status" ADD CONSTRAINT "control_system_status_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
