-- CreateTable
CREATE TABLE "public"."group_scores" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "assessment_completeness" DOUBLE PRECISION NOT NULL,
    "overall_compliance" DOUBLE PRECISION NOT NULL,
    "total_systems" INTEGER NOT NULL,
    "complete_assessments" INTEGER NOT NULL,
    "highest_system_score" DOUBLE PRECISION NOT NULL,
    "lowest_system_score" DOUBLE PRECISION NOT NULL,
    "worst_system_id" INTEGER,
    "worst_system_name" TEXT,
    "total_findings" INTEGER NOT NULL,
    "open_findings" INTEGER NOT NULL,
    "not_reviewed_findings" INTEGER NOT NULL,
    "cat_i_total" INTEGER NOT NULL,
    "cat_i_open" INTEGER NOT NULL,
    "cat_ii_total" INTEGER NOT NULL,
    "cat_ii_open" INTEGER NOT NULL,
    "cat_iii_total" INTEGER NOT NULL,
    "cat_iii_open" INTEGER NOT NULL,
    "controls_affected" INTEGER NOT NULL,
    "controls_compliant" INTEGER NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."package_scores" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "assessment_completeness" DOUBLE PRECISION NOT NULL,
    "overall_compliance" DOUBLE PRECISION NOT NULL,
    "total_groups" INTEGER NOT NULL,
    "complete_groups" INTEGER NOT NULL,
    "highest_group_score" DOUBLE PRECISION NOT NULL,
    "lowest_group_score" DOUBLE PRECISION NOT NULL,
    "worst_group_id" INTEGER,
    "worst_group_name" TEXT,
    "total_systems" INTEGER NOT NULL,
    "complete_assessments" INTEGER NOT NULL,
    "worst_system_id" INTEGER,
    "worst_system_name" TEXT,
    "total_findings" INTEGER NOT NULL,
    "open_findings" INTEGER NOT NULL,
    "not_reviewed_findings" INTEGER NOT NULL,
    "cat_i_total" INTEGER NOT NULL,
    "cat_i_open" INTEGER NOT NULL,
    "cat_ii_total" INTEGER NOT NULL,
    "cat_ii_open" INTEGER NOT NULL,
    "cat_iii_total" INTEGER NOT NULL,
    "cat_iii_open" INTEGER NOT NULL,
    "controls_affected" INTEGER NOT NULL,
    "controls_compliant" INTEGER NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."control_group_status" (
    "id" SERIAL NOT NULL,
    "control_id" TEXT NOT NULL,
    "group_id" INTEGER NOT NULL,
    "systems_affected" INTEGER NOT NULL,
    "systems_compliant" INTEGER NOT NULL,
    "assessment_complete" BOOLEAN NOT NULL,
    "total_findings" INTEGER NOT NULL,
    "open_findings" INTEGER NOT NULL,
    "cat_i_open" INTEGER NOT NULL,
    "cat_ii_open" INTEGER NOT NULL,
    "cat_iii_open" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "last_assessed" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_group_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."control_package_status" (
    "id" SERIAL NOT NULL,
    "control_id" TEXT NOT NULL,
    "package_id" INTEGER NOT NULL,
    "groups_affected" INTEGER NOT NULL,
    "groups_compliant" INTEGER NOT NULL,
    "systems_affected" INTEGER NOT NULL,
    "systems_compliant" INTEGER NOT NULL,
    "assessment_complete" BOOLEAN NOT NULL,
    "total_findings" INTEGER NOT NULL,
    "open_findings" INTEGER NOT NULL,
    "cat_i_open" INTEGER NOT NULL,
    "cat_ii_open" INTEGER NOT NULL,
    "cat_iii_open" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "last_assessed" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_package_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "control_group_status_control_id_group_id_key" ON "public"."control_group_status"("control_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_package_status_control_id_package_id_key" ON "public"."control_package_status"("control_id", "package_id");

-- AddForeignKey
ALTER TABLE "public"."group_scores" ADD CONSTRAINT "group_scores_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_scores" ADD CONSTRAINT "group_scores_worst_system_id_fkey" FOREIGN KEY ("worst_system_id") REFERENCES "public"."systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."package_scores" ADD CONSTRAINT "package_scores_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."package_scores" ADD CONSTRAINT "package_scores_worst_group_id_fkey" FOREIGN KEY ("worst_group_id") REFERENCES "public"."groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."package_scores" ADD CONSTRAINT "package_scores_worst_system_id_fkey" FOREIGN KEY ("worst_system_id") REFERENCES "public"."systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."control_group_status" ADD CONSTRAINT "control_group_status_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."control_package_status" ADD CONSTRAINT "control_package_status_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
