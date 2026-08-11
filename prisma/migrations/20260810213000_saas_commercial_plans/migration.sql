CREATE TYPE "public"."BillingPeriod" AS ENUM ('MONTHLY', 'YEARLY');

ALTER TYPE "public"."PlatformAuditAction" ADD VALUE 'PLAN_CREATED';
ALTER TYPE "public"."PlatformAuditAction" ADD VALUE 'PLAN_UPDATED';
ALTER TYPE "public"."PlatformAuditAction" ADD VALUE 'SUBSCRIPTION_PLAN_CHANGED';

CREATE TABLE "public"."saas_plans" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(240),
    "billingPrice" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "billingPeriod" "public"."BillingPeriod" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByAdminId" TEXT NOT NULL,
    CONSTRAINT "saas_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saas_plans_code_key" ON "public"."saas_plans"("code");
CREATE UNIQUE INDEX "saas_plans_name_key" ON "public"."saas_plans"("name");
CREATE INDEX "saas_plans_isActive_createdAt_idx" ON "public"."saas_plans"("isActive", "createdAt");

ALTER TABLE "public"."saas_plans"
ADD CONSTRAINT "saas_plans_createdByAdminId_fkey"
FOREIGN KEY ("createdByAdminId") REFERENCES "public"."platform_admins"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."workshop_subscriptions"
ADD COLUMN "agreedPrice" DECIMAL(12,2),
ADD COLUMN "currency" VARCHAR(3),
ADD COLUMN "billingPeriod" "public"."BillingPeriod",
ADD COLUMN "planId" TEXT;

INSERT INTO "public"."saas_plans" (
    "id",
    "code",
    "name",
    "description",
    "billingPrice",
    "currency",
    "billingPeriod",
    "isActive",
    "createdAt",
    "updatedAt",
    "createdByAdminId"
)
SELECT
    'migrated-solo-technician-plan',
    'SOLO_TECHNICIAN',
    'Técnico independiente migrado',
    'Requiere configurar un precio comercial antes de nuevas ventas.',
    0,
    'ARS',
    'MONTHLY'::"public"."BillingPeriod",
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    "workshops"."createdByAdminId"
FROM "public"."workshop_subscriptions"
INNER JOIN "public"."workshops"
    ON "workshops"."id" = "workshop_subscriptions"."workshopId"
LIMIT 1;

UPDATE "public"."workshop_subscriptions"
SET
    "agreedPrice" = 0,
    "currency" = 'ARS',
    "billingPeriod" = 'MONTHLY'::"public"."BillingPeriod",
    "planId" = 'migrated-solo-technician-plan';

ALTER TABLE "public"."workshop_subscriptions"
ALTER COLUMN "agreedPrice" SET NOT NULL,
ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "billingPeriod" SET NOT NULL,
ALTER COLUMN "planId" SET NOT NULL,
DROP COLUMN "planCode";

DROP TYPE "public"."PlanCode";

CREATE INDEX "workshop_subscriptions_planId_status_idx"
ON "public"."workshop_subscriptions"("planId", "status");

ALTER TABLE "public"."workshop_subscriptions"
ADD CONSTRAINT "workshop_subscriptions_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "public"."saas_plans"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
