import {
  PlatformAuditAction,
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
  ownerEmail: string;
  ownerPasswordHash: string;
  subscriptionStatus: SubscriptionStatus;
}

export interface UpdateWorkshopLifecyclePersistence {
  workshopId: string;
  adminId: string;
  workshopStatus: WorkshopStatus;
  technicianStatus: TechnicianStatus;
  subscriptionStatus: SubscriptionStatus;
  auditAction: PlatformAuditAction;
}
