import {
  BillingPeriod,
  PlatformAuditAction,
  Prisma,
  SubscriptionStatus,
  TechnicianStatus,
  WorkshopStatus,
} from "@prisma/client";

export interface CreatePlatformSessionPersistence {
  adminId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface CreateWorkshopPersistence {
  adminId: string;
  workshopName: string;
  workshopSlug: string;
  ownerName: string;
  ownerUsername: string;
  ownerPasswordHash: string;
  planId: string;
  agreedPrice: Prisma.Decimal;
  currency: string;
  billingPeriod: BillingPeriod;
  subscriptionStatus: SubscriptionStatus;
}

export interface UpdateWorkshopLifecyclePersistence {
  workshopId: string;
  adminId: string;
  workshopStatus: WorkshopStatus;
  technicianStatus: TechnicianStatus;
  subscriptionStatus: SubscriptionStatus;
  auditAction: PlatformAuditAction;
  revokeTechnicianSessions: boolean;
  resumeStatus: SubscriptionStatus | null;
}

export interface UpdateWorkshopPlanPersistence {
  workshopId: string;
  adminId: string;
  previousPlanId: string;
  planId: string;
  agreedPrice: Prisma.Decimal;
  currency: string;
  billingPeriod: BillingPeriod;
}
