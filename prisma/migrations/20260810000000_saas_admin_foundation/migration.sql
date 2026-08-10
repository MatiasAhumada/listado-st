CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "public"."WorkshopStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "public"."TechnicianStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "public"."TechnicianRole" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "public"."PlanCode" AS ENUM ('SOLO_TECHNICIAN');
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE "public"."PlatformAuditAction" AS ENUM ('WORKSHOP_CREATED', 'WORKSHOP_ACTIVATED', 'WORKSHOP_SUSPENDED');

CREATE TABLE "public"."platform_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."platform_admin_sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    CONSTRAINT "platform_admin_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."workshops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "public"."WorkshopStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByAdminId" TEXT NOT NULL,
    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."technician_users" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "public"."TechnicianRole" NOT NULL DEFAULT 'OWNER',
    "status" "public"."TechnicianStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "technician_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."workshop_subscriptions" (
    "id" TEXT NOT NULL,
    "planCode" "public"."PlanCode" NOT NULL DEFAULT 'SOLO_TECHNICIAN',
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,
    CONSTRAINT "workshop_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."platform_audit_events" (
    "id" TEXT NOT NULL,
    "action" "public"."PlatformAuditAction" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,
    "workshopId" TEXT,
    CONSTRAINT "platform_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_admins_email_key" ON "public"."platform_admins"("email");
CREATE UNIQUE INDEX "platform_admin_sessions_tokenHash_key" ON "public"."platform_admin_sessions"("tokenHash");
CREATE INDEX "platform_admin_sessions_adminId_expiresAt_idx" ON "public"."platform_admin_sessions"("adminId", "expiresAt");
CREATE UNIQUE INDEX "workshops_slug_key" ON "public"."workshops"("slug");
CREATE INDEX "workshops_status_idx" ON "public"."workshops"("status");
CREATE UNIQUE INDEX "technician_users_email_key" ON "public"."technician_users"("email");
CREATE INDEX "technician_users_workshopId_status_idx" ON "public"."technician_users"("workshopId", "status");
CREATE UNIQUE INDEX "workshop_subscriptions_workshopId_key" ON "public"."workshop_subscriptions"("workshopId");
CREATE INDEX "workshop_subscriptions_status_idx" ON "public"."workshop_subscriptions"("status");
CREATE INDEX "platform_audit_events_adminId_createdAt_idx" ON "public"."platform_audit_events"("adminId", "createdAt");
CREATE INDEX "platform_audit_events_workshopId_createdAt_idx" ON "public"."platform_audit_events"("workshopId", "createdAt");

ALTER TABLE "public"."platform_admin_sessions" ADD CONSTRAINT "platform_admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."platform_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."workshops" ADD CONSTRAINT "workshops_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "public"."platform_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."technician_users" ADD CONSTRAINT "technician_users_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."workshop_subscriptions" ADD CONSTRAINT "workshop_subscriptions_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."platform_audit_events" ADD CONSTRAINT "platform_audit_events_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."platform_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."platform_audit_events" ADD CONSTRAINT "platform_audit_events_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
