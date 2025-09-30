-- AlterTable
ALTER TABLE "public"."systems" ADD COLUMN     "host_system" TEXT,
ADD COLUMN     "hypervisor" TEXT,
ADD COLUMN     "is_virtual" BOOLEAN DEFAULT false;
