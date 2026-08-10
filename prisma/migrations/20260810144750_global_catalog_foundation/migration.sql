-- CreateEnum
CREATE TYPE "public"."CatalogImportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PlatformAuditAction" ADD VALUE 'CATALOG_IMPORTED';
ALTER TYPE "public"."PlatformAuditAction" ADD VALUE 'CATALOG_PUBLISHED';
ALTER TYPE "public"."PlatformAuditAction" ADD VALUE 'CATALOG_PRICING_UPDATED';

-- CreateTable
CREATE TABLE "public"."catalog_pricing_rules" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "maximumCost" DECIMAL(12,2),
    "markupPercentage" DECIMAL(7,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."catalog_import_batches" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileHash" VARCHAR(64) NOT NULL,
    "status" "public"."CatalogImportStatus" NOT NULL DEFAULT 'DRAFT',
    "totalRows" INTEGER NOT NULL,
    "availableItems" INTEGER NOT NULL,
    "excludedUnavailable" INTEGER NOT NULL,
    "excludedIncoming" INTEGER NOT NULL,
    "skippedRows" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "importedByAdminId" TEXT NOT NULL,

    CONSTRAINT "catalog_import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."catalog_items" (
    "id" TEXT NOT NULL,
    "sourceRow" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "brand" TEXT,
    "cost" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batchId" TEXT NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalog_pricing_rules_position_key" ON "public"."catalog_pricing_rules"("position");

-- CreateIndex
CREATE INDEX "catalog_import_batches_status_importedAt_idx" ON "public"."catalog_import_batches"("status", "importedAt");

-- CreateIndex
CREATE INDEX "catalog_import_batches_fileHash_idx" ON "public"."catalog_import_batches"("fileHash");

-- CreateIndex
CREATE INDEX "catalog_items_batchId_normalizedName_idx" ON "public"."catalog_items"("batchId", "normalizedName");

-- CreateIndex
CREATE INDEX "catalog_items_batchId_brand_idx" ON "public"."catalog_items"("batchId", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_items_batchId_sourceRow_key" ON "public"."catalog_items"("batchId", "sourceRow");

-- AddForeignKey
ALTER TABLE "public"."catalog_import_batches" ADD CONSTRAINT "catalog_import_batches_importedByAdminId_fkey" FOREIGN KEY ("importedByAdminId") REFERENCES "public"."platform_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."catalog_items" ADD CONSTRAINT "catalog_items_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."catalog_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
