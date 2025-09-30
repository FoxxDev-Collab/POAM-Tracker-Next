-- CreateTable
CREATE TABLE "public"."package_documents" (
    "id" TEXT NOT NULL,
    "package_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "document_type" TEXT NOT NULL,
    "rmf_step" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "package_documents_package_id_document_type_is_active_idx" ON "public"."package_documents"("package_id", "document_type", "is_active");

-- AddForeignKey
ALTER TABLE "public"."package_documents" ADD CONSTRAINT "package_documents_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
