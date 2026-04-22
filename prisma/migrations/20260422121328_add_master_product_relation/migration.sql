-- AlterTable
ALTER TABLE "public"."productos" ADD COLUMN     "masterProductId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."productos" ADD CONSTRAINT "productos_masterProductId_fkey" FOREIGN KEY ("masterProductId") REFERENCES "public"."productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
