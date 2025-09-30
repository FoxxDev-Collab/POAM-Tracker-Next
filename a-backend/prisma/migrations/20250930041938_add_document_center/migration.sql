-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('Policy', 'Procedure', 'Plan');

-- CreateEnum
CREATE TYPE "public"."PPSMDirection" AS ENUM ('Inbound', 'Outbound', 'Bidirectional');

-- CreateTable
CREATE TABLE "public"."document_categories" (
    "id" SERIAL NOT NULL,
    "control_family" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."control_documents" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "document_type" "public"."DocumentType" NOT NULL,
    "document_sub_type" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "current_version_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_versions" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "version_number" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "checksum" TEXT,
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change_notes" TEXT,
    "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_ppsm" (
    "id" SERIAL NOT NULL,
    "system_id" INTEGER NOT NULL,
    "port" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "direction" "public"."PPSMDirection" NOT NULL,
    "source_ip" TEXT,
    "destination_ip" TEXT,
    "justification" TEXT NOT NULL,
    "risk_assessment" TEXT,
    "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "last_reviewed" TIMESTAMP(3),
    "reviewed_by" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expiration_date" TIMESTAMP(3),
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_ppsm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_categories_control_family_idx" ON "public"."document_categories"("control_family");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_control_family_key" ON "public"."document_categories"("control_family");

-- CreateIndex
CREATE UNIQUE INDEX "control_documents_current_version_id_key" ON "public"."control_documents"("current_version_id");

-- CreateIndex
CREATE INDEX "control_documents_package_id_idx" ON "public"."control_documents"("package_id");

-- CreateIndex
CREATE INDEX "control_documents_category_id_idx" ON "public"."control_documents"("category_id");

-- CreateIndex
CREATE INDEX "control_documents_document_type_idx" ON "public"."control_documents"("document_type");

-- CreateIndex
CREATE UNIQUE INDEX "control_documents_package_id_category_id_document_type_docu_key" ON "public"."control_documents"("package_id", "category_id", "document_type", "document_sub_type");

-- CreateIndex
CREATE INDEX "document_versions_document_id_idx" ON "public"."document_versions"("document_id");

-- CreateIndex
CREATE INDEX "document_versions_uploaded_by_idx" ON "public"."document_versions"("uploaded_by");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_document_id_version_number_key" ON "public"."document_versions"("document_id", "version_number");

-- CreateIndex
CREATE INDEX "system_ppsm_system_id_idx" ON "public"."system_ppsm"("system_id");

-- CreateIndex
CREATE INDEX "system_ppsm_port_idx" ON "public"."system_ppsm"("port");

-- CreateIndex
CREATE INDEX "system_ppsm_protocol_idx" ON "public"."system_ppsm"("protocol");

-- CreateIndex
CREATE INDEX "system_ppsm_approval_status_idx" ON "public"."system_ppsm"("approval_status");

-- AddForeignKey
ALTER TABLE "public"."control_documents" ADD CONSTRAINT "control_documents_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."control_documents" ADD CONSTRAINT "control_documents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."document_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."control_documents" ADD CONSTRAINT "control_documents_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "public"."document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."control_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_versions" ADD CONSTRAINT "document_versions_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_versions" ADD CONSTRAINT "document_versions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_ppsm" ADD CONSTRAINT "system_ppsm_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_ppsm" ADD CONSTRAINT "system_ppsm_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_ppsm" ADD CONSTRAINT "system_ppsm_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_ppsm" ADD CONSTRAINT "system_ppsm_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
