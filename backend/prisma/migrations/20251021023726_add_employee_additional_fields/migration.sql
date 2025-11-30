-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "address" TEXT,
ADD COLUMN     "benefitsPackage" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "emergencyContact" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "payFrequency" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT;
