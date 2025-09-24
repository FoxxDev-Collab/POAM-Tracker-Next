-- AlterTable
ALTER TABLE "public"."users" 
ADD COLUMN     "first_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "last_name" TEXT NOT NULL DEFAULT '';

-- Update existing records to split name into first_name and last_name
UPDATE "public"."users" 
SET 
  "first_name" = CASE 
    WHEN "name" IS NOT NULL AND POSITION(' ' IN "name") > 0 
    THEN SUBSTRING("name" FROM 1 FOR POSITION(' ' IN "name") - 1)
    ELSE COALESCE("name", '')
  END,
  "last_name" = CASE 
    WHEN "name" IS NOT NULL AND POSITION(' ' IN "name") > 0 
    THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
    ELSE ''
  END
WHERE "first_name" = '';

-- Make name column nullable
ALTER TABLE "public"."users" ALTER COLUMN "name" DROP NOT NULL;
