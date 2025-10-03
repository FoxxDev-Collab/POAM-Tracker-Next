-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "pmo_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."pmos" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pmos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pmos_name_key" ON "public"."pmos"("name");

-- CreateIndex
CREATE INDEX "users_pmo_id_idx" ON "public"."users"("pmo_id");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pmo_id_fkey" FOREIGN KEY ("pmo_id") REFERENCES "public"."pmos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
