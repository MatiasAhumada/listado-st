import {
  InitialSubscriptionStatusCode,
  PlanCode,
  PlatformAuditActionCode,
  SubscriptionStatusCode,
  TechnicianStatusCode,
  WorkshopStatusCode,
} from "@/types/platformAdmin.types";

export interface PlatformAdminIdentity {
  id: string;
  email: string;
  displayName: string;
}

export interface PlatformAdminLoginPayload {
  email: string;
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
  email: string;
  status: TechnicianStatusCode;
}

export interface WorkshopSummary {
  id: string;
  name: string;
  slug: string;
  status: WorkshopStatusCode;
  planCode: PlanCode;
  subscriptionStatus: SubscriptionStatusCode;
  createdAt: string;
  owner: WorkshopOwnerSummary;
}

export interface CreateWorkshopPayload {
  workshopName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  subscriptionStatus: InitialSubscriptionStatusCode;
}

export interface UpdateWorkshopStatusPayload {
  status: WorkshopStatusCode;
}

export interface WorkshopLifecycleUpdate {
  workshopStatus: WorkshopStatusCode;
  technicianStatus: TechnicianStatusCode;
  subscriptionStatus: SubscriptionStatusCode;
  auditAction: PlatformAuditActionCode;
  revokeTechnicianSessions: boolean;
}

export interface CreatedWorkshopCredentials {
  workshopName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface PlatformApiMessage {
  message: string;
}
