-- AlterTable
ALTER TABLE "businesses" ADD COLUMN "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN "password" TEXT;
