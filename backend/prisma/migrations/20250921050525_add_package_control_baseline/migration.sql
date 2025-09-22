-- CreateTable
CREATE TABLE "package_control_baselines" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "control_id" TEXT NOT NULL,
    "include_in_baseline" BOOLEAN NOT NULL DEFAULT false,
    "baseline_source" TEXT,
    "tailoring_action" TEXT,
    "tailoring_rationale" TEXT,
    "implementation_status" TEXT,
    "implementation_notes" TEXT,
    "compliance_status" "ComplianceStatus",
    "compliance_notes" TEXT,
    "stp_required" BOOLEAN NOT NULL DEFAULT false,
    "stp_status" TEXT,
    "added_by" INTEGER,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_control_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "package_control_baselines_package_id_control_id_key" ON "package_control_baselines"("package_id", "control_id");

-- CreateIndex
CREATE INDEX "package_control_baselines_package_id_idx" ON "package_control_baselines"("package_id");

-- CreateIndex
CREATE INDEX "package_control_baselines_control_id_idx" ON "package_control_baselines"("control_id");

-- CreateIndex
CREATE INDEX "package_control_baselines_include_in_baseline_idx" ON "package_control_baselines"("include_in_baseline");

-- CreateIndex
CREATE INDEX "package_control_baselines_compliance_status_idx" ON "package_control_baselines"("compliance_status");

-- AddForeignKey
ALTER TABLE "package_control_baselines" ADD CONSTRAINT "package_control_baselines_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;