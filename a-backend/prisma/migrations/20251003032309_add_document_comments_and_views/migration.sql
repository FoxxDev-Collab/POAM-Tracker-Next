-- CreateTable
CREATE TABLE "public"."document_comments" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "version_number" INTEGER,
    "parent_id" INTEGER,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_views" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_comments_document_id_idx" ON "public"."document_comments"("document_id");

-- CreateIndex
CREATE INDEX "document_comments_author_id_idx" ON "public"."document_comments"("author_id");

-- CreateIndex
CREATE INDEX "document_comments_parent_id_idx" ON "public"."document_comments"("parent_id");

-- CreateIndex
CREATE INDEX "document_views_document_id_idx" ON "public"."document_views"("document_id");

-- CreateIndex
CREATE INDEX "document_views_user_id_idx" ON "public"."document_views"("user_id");

-- CreateIndex
CREATE INDEX "document_views_viewed_at_idx" ON "public"."document_views"("viewed_at");

-- AddForeignKey
ALTER TABLE "public"."document_comments" ADD CONSTRAINT "document_comments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."control_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_comments" ADD CONSTRAINT "document_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_comments" ADD CONSTRAINT "document_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."document_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_views" ADD CONSTRAINT "document_views_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."control_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_views" ADD CONSTRAINT "document_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
