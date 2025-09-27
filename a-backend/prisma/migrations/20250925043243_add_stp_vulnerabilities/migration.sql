-- CreateTable
CREATE TABLE "public"."stp_vulnerabilities" (
    "id" SERIAL NOT NULL,
    "stp_id" INTEGER NOT NULL,
    "system_id" INTEGER NOT NULL,
    "vuln_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stp_vulnerabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stp_vulnerabilities_stp_id_idx" ON "public"."stp_vulnerabilities"("stp_id");

-- CreateIndex
CREATE INDEX "stp_vulnerabilities_system_id_idx" ON "public"."stp_vulnerabilities"("system_id");

-- CreateIndex
CREATE INDEX "stp_vulnerabilities_vuln_id_idx" ON "public"."stp_vulnerabilities"("vuln_id");

-- CreateIndex
CREATE UNIQUE INDEX "stp_vulnerabilities_stp_id_system_id_vuln_id_key" ON "public"."stp_vulnerabilities"("stp_id", "system_id", "vuln_id");

-- AddForeignKey
ALTER TABLE "public"."stp_vulnerabilities" ADD CONSTRAINT "stp_vulnerabilities_stp_id_fkey" FOREIGN KEY ("stp_id") REFERENCES "public"."stps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stp_vulnerabilities" ADD CONSTRAINT "stp_vulnerabilities_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stp_vulnerabilities" ADD CONSTRAINT "stp_vulnerabilities_system_id_rule_id_fkey" FOREIGN KEY ("system_id", "rule_id") REFERENCES "public"."stig_findings"("system_id", "rule_id") ON DELETE CASCADE ON UPDATE CASCADE;
