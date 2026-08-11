-- CreateEnum
CREATE TYPE "public"."RepairStatus" AS ENUM ('RECEIVED', 'DIAGNOSING', 'WAITING_PART', 'IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RepairPaymentKind" AS ENUM ('DEPOSIT', 'PARTIAL', 'FINAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "public"."RepairExpenseKind" AS ENUM ('PART', 'SUPPLY', 'OUTSOURCED_SERVICE', 'OTHER', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "public"."repairs" (
    "id" TEXT NOT NULL,
    "status" "public"."RepairStatus" NOT NULL DEFAULT 'RECEIVED',
    "agreedPrice" DECIMAL(12,2) NOT NULL,
    "quotedCost" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "physicalReceivedAt" TIMESTAMP(3) NOT NULL,
    "lastStatusChangedAt" TIMESTAMP(3) NOT NULL,
    "internalNotes" VARCHAR(1000),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdByName" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "acceptedRevisionAlternativeId" TEXT NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "repairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."repair_status_history" (
    "id" TEXT NOT NULL,
    "status" "public"."RepairStatus" NOT NULL,
    "note" VARCHAR(500),
    "recordedByName" VARCHAR(120) NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workshopId" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "recordedByUserId" TEXT,

    CONSTRAINT "repair_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."repair_payments" (
    "id" TEXT NOT NULL,
    "kind" "public"."RepairPaymentKind" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" VARCHAR(500),
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "recordedByName" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workshopId" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "recordedByUserId" TEXT,
    "adjustsPaymentId" TEXT,

    CONSTRAINT "repair_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."repair_expenses" (
    "id" TEXT NOT NULL,
    "kind" "public"."RepairExpenseKind" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "supplier" VARCHAR(160),
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "recordedByName" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workshopId" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "recordedByUserId" TEXT,
    "adjustsExpenseId" TEXT,

    CONSTRAINT "repair_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."repair_alert_rules" (
    "id" TEXT NOT NULL,
    "status" "public"."RepairStatus" NOT NULL,
    "afterHours" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByAdminId" TEXT,

    CONSTRAINT "repair_alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repairs_quoteId_key" ON "public"."repairs"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "repairs_acceptedRevisionAlternativeId_key" ON "public"."repairs"("acceptedRevisionAlternativeId");

-- CreateIndex
CREATE INDEX "repairs_workshopId_status_lastStatusChangedAt_idx" ON "public"."repairs"("workshopId", "status", "lastStatusChangedAt");

-- CreateIndex
CREATE INDEX "repairs_workshopId_customerId_idx" ON "public"."repairs"("workshopId", "customerId");

-- CreateIndex
CREATE INDEX "repairs_workshopId_deviceId_idx" ON "public"."repairs"("workshopId", "deviceId");

-- CreateIndex
CREATE INDEX "repair_status_history_workshopId_repairId_changedAt_idx" ON "public"."repair_status_history"("workshopId", "repairId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "repair_payments_adjustsPaymentId_key" ON "public"."repair_payments"("adjustsPaymentId");

-- CreateIndex
CREATE INDEX "repair_payments_workshopId_repairId_occurredAt_idx" ON "public"."repair_payments"("workshopId", "repairId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "repair_expenses_adjustsExpenseId_key" ON "public"."repair_expenses"("adjustsExpenseId");

-- CreateIndex
CREATE INDEX "repair_expenses_workshopId_repairId_occurredAt_idx" ON "public"."repair_expenses"("workshopId", "repairId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "repair_alert_rules_status_key" ON "public"."repair_alert_rules"("status");

-- CreateIndex
CREATE INDEX "repair_alert_rules_isEnabled_status_idx" ON "public"."repair_alert_rules"("isEnabled", "status");

-- AddForeignKey
ALTER TABLE "public"."repairs" ADD CONSTRAINT "repairs_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repairs" ADD CONSTRAINT "repairs_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repairs" ADD CONSTRAINT "repairs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."workshop_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repairs" ADD CONSTRAINT "repairs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."mobile_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repairs" ADD CONSTRAINT "repairs_acceptedRevisionAlternativeId_fkey" FOREIGN KEY ("acceptedRevisionAlternativeId") REFERENCES "public"."quote_revision_alternatives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repairs" ADD CONSTRAINT "repairs_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."technician_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_status_history" ADD CONSTRAINT "repair_status_history_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_status_history" ADD CONSTRAINT "repair_status_history_repairId_fkey" FOREIGN KEY ("repairId") REFERENCES "public"."repairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_status_history" ADD CONSTRAINT "repair_status_history_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "public"."technician_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_payments" ADD CONSTRAINT "repair_payments_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_payments" ADD CONSTRAINT "repair_payments_repairId_fkey" FOREIGN KEY ("repairId") REFERENCES "public"."repairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_payments" ADD CONSTRAINT "repair_payments_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "public"."technician_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_payments" ADD CONSTRAINT "repair_payments_adjustsPaymentId_fkey" FOREIGN KEY ("adjustsPaymentId") REFERENCES "public"."repair_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_expenses" ADD CONSTRAINT "repair_expenses_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_expenses" ADD CONSTRAINT "repair_expenses_repairId_fkey" FOREIGN KEY ("repairId") REFERENCES "public"."repairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_expenses" ADD CONSTRAINT "repair_expenses_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "public"."technician_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_expenses" ADD CONSTRAINT "repair_expenses_adjustsExpenseId_fkey" FOREIGN KEY ("adjustsExpenseId") REFERENCES "public"."repair_expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repair_alert_rules" ADD CONSTRAINT "repair_alert_rules_updatedByAdminId_fkey" FOREIGN KEY ("updatedByAdminId") REFERENCES "public"."platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
