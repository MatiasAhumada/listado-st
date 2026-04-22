-- DropForeignKey
ALTER TABLE "public"."productos" DROP CONSTRAINT "productos_companyId_fkey";

-- AlterTable
ALTER TABLE "public"."productos" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."productos" ADD CONSTRAINT "productos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
