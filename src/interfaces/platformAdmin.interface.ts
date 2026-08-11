import {
  BillingPeriodCode,
  InitialSubscriptionStatusCode,
  PlatformAuditActionCode,
  SubscriptionStatusCode,
  TechnicianStatusCode,
  WorkshopStatusCode,
} from "@/types/platformAdmin.types";
import { SaasPlanReference } from "@/interfaces/saasPlan.interface";

export interface PlatformAdminIdentity {
  id: string;
  username: string;
  displayName: string;
}

export interface PlatformAdminLoginPayload {
  username: string;
  password: string;
}

export interface PlatformAdminSessionResult {
  token: string;
  expiresAt: Date;
  admin: PlatformAdminIdentity;
}

export interface WorkshopOwnerSummary {
  id: string;
  displayName: string;
  username: string;
  status: TechnicianStatusCode;
}

export interface WorkshopSummary {
  id: string;
  name: string;
  slug: string;
  status: WorkshopStatusCode;
  plan: SaasPlanReference;
  subscriptionStatus: SubscriptionStatusCode;
  agreedPrice: string;
  currency: string;
  billingPeriod: BillingPeriodCode;
  createdAt: string;
  owner: WorkshopOwnerSummary;
}

export interface CreateWorkshopPayload {
  workshopName: string;
  ownerName: string;
  ownerUsername: string;
  ownerPassword: string;
  planId: string;
  agreedPrice: string;
  subscriptionStatus: InitialSubscriptionStatusCode;
}

export interface UpdateWorkshopStatusPayload {
  status: WorkshopStatusCode;
}

export interface UpdateWorkshopPlanPayload {
  planId: string;
  agreedPrice: string;
}

export interface WorkshopLifecycleUpdate {
  workshopStatus: WorkshopStatusCode;
  technicianStatus: TechnicianStatusCode;
  subscriptionStatus: SubscriptionStatusCode;
  auditAction: PlatformAuditActionCode;
  revokeTechnicianSessions: boolean;
  resumeStatus: SubscriptionStatusCode | null;
}

export interface CreatedWorkshopCredentials {
  workshopName: string;
  ownerUsername: string;
  ownerPassword: string;
}

export interface PlatformApiMessage {
  message: string;
}
