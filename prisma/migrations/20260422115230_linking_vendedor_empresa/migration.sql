-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
