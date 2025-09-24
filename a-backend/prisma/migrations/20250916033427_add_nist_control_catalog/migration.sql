-- CreateTable
CREATE TABLE "public"."nist_controls" (
    "id" SERIAL NOT NULL,
    "control_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "control_text" TEXT NOT NULL,
    "discussion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nist_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nist_control_relations" (
    "id" SERIAL NOT NULL,
    "source_control_id" INTEGER NOT NULL,
    "related_control_id" TEXT NOT NULL,

    CONSTRAINT "nist_control_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nist_control_ccis" (
    "id" SERIAL NOT NULL,
    "control_id" INTEGER NOT NULL,
    "cci" TEXT NOT NULL,
    "definition" TEXT NOT NULL,

    CONSTRAINT "nist_control_ccis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nist_controls_control_id_key" ON "public"."nist_controls"("control_id");

-- CreateIndex
CREATE INDEX "nist_controls_control_id_idx" ON "public"."nist_controls"("control_id");

-- CreateIndex
CREATE INDEX "nist_control_relations_source_control_id_idx" ON "public"."nist_control_relations"("source_control_id");

-- CreateIndex
CREATE INDEX "nist_control_relations_related_control_id_idx" ON "public"."nist_control_relations"("related_control_id");

-- CreateIndex
CREATE UNIQUE INDEX "nist_control_relations_source_control_id_related_control_id_key" ON "public"."nist_control_relations"("source_control_id", "related_control_id");

-- CreateIndex
CREATE INDEX "nist_control_ccis_control_id_idx" ON "public"."nist_control_ccis"("control_id");

-- CreateIndex
CREATE INDEX "nist_control_ccis_cci_idx" ON "public"."nist_control_ccis"("cci");

-- CreateIndex
CREATE UNIQUE INDEX "nist_control_ccis_control_id_cci_key" ON "public"."nist_control_ccis"("control_id", "cci");

-- AddForeignKey
ALTER TABLE "public"."nist_control_relations" ADD CONSTRAINT "nist_control_relations_source_control_id_fkey" FOREIGN KEY ("source_control_id") REFERENCES "public"."nist_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nist_control_ccis" ADD CONSTRAINT "nist_control_ccis_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "public"."nist_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
