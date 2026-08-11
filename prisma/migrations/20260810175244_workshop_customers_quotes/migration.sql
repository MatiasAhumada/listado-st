-- CreateEnum
CREATE TYPE "public"."QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."workshop_customers" (
    "id" TEXT NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "email" VARCHAR(160),
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,

    CONSTRAINT "workshop_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mobile_devices" (
    "id" TEXT NOT NULL,
    "brand" VARCHAR(80) NOT NULL,
    "model" VARCHAR(120) NOT NULL,
    "imei" VARCHAR(30),
    "color" VARCHAR(60),
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "mobile_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quotes" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "public"."QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "reportedIssue" VARCHAR(500) NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "acceptedRevisionAlternativeId" TEXT,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quote_alternatives" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "supplier" VARCHAR(160) NOT NULL,
    "referenceCost" DECIMAL(12,2),
    "selectedCost" DECIMAL(12,2) NOT NULL,
    "suggestedPrice" DECIMAL(12,2),
    "finalPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "catalogItemId" TEXT,

    CONSTRAINT "quote_alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quote_revisions" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workshopId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,

    CONSTRAINT "quote_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quote_revision_alternatives" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "supplier" VARCHAR(160) NOT NULL,
    "referenceCost" DECIMAL(12,2),
    "selectedCost" DECIMAL(12,2) NOT NULL,
    "suggestedPrice" DECIMAL(12,2),
    "finalPrice" DECIMAL(12,2) NOT NULL,
    "catalogItemId" TEXT,
    "workshopId" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "sourceAlternativeId" TEXT,

    CONSTRAINT "quote_revision_alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workshop_customers_workshopId_fullName_idx" ON "public"."workshop_customers"("workshopId", "fullName");

-- CreateIndex
CREATE INDEX "workshop_customers_workshopId_phone_idx" ON "public"."workshop_customers"("workshopId", "phone");

-- CreateIndex
CREATE INDEX "mobile_devices_workshopId_customerId_idx" ON "public"."mobile_devices"("workshopId", "customerId");

-- CreateIndex
CREATE INDEX "mobile_devices_workshopId_brand_model_idx" ON "public"."mobile_devices"("workshopId", "brand", "model");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_devices_workshopId_imei_key" ON "public"."mobile_devices"("workshopId", "imei");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_acceptedRevisionAlternativeId_key" ON "public"."quotes"("acceptedRevisionAlternativeId");

-- CreateIndex
CREATE INDEX "quotes_workshopId_status_updatedAt_idx" ON "public"."quotes"("workshopId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "quotes_workshopId_customerId_idx" ON "public"."quotes"("workshopId", "customerId");

-- CreateIndex
CREATE INDEX "quotes_workshopId_deviceId_idx" ON "public"."quotes"("workshopId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_workshopId_number_key" ON "public"."quotes"("workshopId", "number");

-- CreateIndex
CREATE INDEX "quote_alternatives_workshopId_quoteId_idx" ON "public"."quote_alternatives"("workshopId", "quoteId");

-- CreateIndex
CREATE INDEX "quote_alternatives_catalogItemId_idx" ON "public"."quote_alternatives"("catalogItemId");

-- CreateIndex
CREATE UNIQUE INDEX "quote_alternatives_quoteId_position_key" ON "public"."quote_alternatives"("quoteId", "position");

-- CreateIndex
CREATE INDEX "quote_revisions_workshopId_quoteId_sentAt_idx" ON "public"."quote_revisions"("workshopId", "quoteId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "quote_revisions_quoteId_number_key" ON "public"."quote_revisions"("quoteId", "number");

-- CreateIndex
CREATE INDEX "quote_revision_alternatives_workshopId_revisionId_idx" ON "public"."quote_revision_alternatives"("workshopId", "revisionId");

-- CreateIndex
CREATE INDEX "quote_revision_alternatives_sourceAlternativeId_idx" ON "public"."quote_revision_alternatives"("sourceAlternativeId");

-- CreateIndex
CREATE UNIQUE INDEX "quote_revision_alternatives_revisionId_position_key" ON "public"."quote_revision_alternatives"("revisionId", "position");

-- AddForeignKey
ALTER TABLE "public"."workshop_customers" ADD CONSTRAINT "workshop_customers_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mobile_devices" ADD CONSTRAINT "mobile_devices_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mobile_devices" ADD CONSTRAINT "mobile_devices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."workshop_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."workshop_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."mobile_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_acceptedRevisionAlternativeId_fkey" FOREIGN KEY ("acceptedRevisionAlternativeId") REFERENCES "public"."quote_revision_alternatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_alternatives" ADD CONSTRAINT "quote_alternatives_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_alternatives" ADD CONSTRAINT "quote_alternatives_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_alternatives" ADD CONSTRAINT "quote_alternatives_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "public"."catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_revisions" ADD CONSTRAINT "quote_revisions_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_revisions" ADD CONSTRAINT "quote_revisions_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_revision_alternatives" ADD CONSTRAINT "quote_revision_alternatives_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_revision_alternatives" ADD CONSTRAINT "quote_revision_alternatives_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "public"."quote_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_revision_alternatives" ADD CONSTRAINT "quote_revision_alternatives_sourceAlternativeId_fkey" FOREIGN KEY ("sourceAlternativeId") REFERENCES "public"."quote_alternatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
