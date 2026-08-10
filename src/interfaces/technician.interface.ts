import {
  PlanCode,
  SubscriptionStatusCode,
  TechnicianStatusCode,
  WorkshopStatusCode,
} from "@/types/platformAdmin.types";

export interface TechnicianIdentity {
  id: string;
  workshopId: string;
  email: string;
  displayName: string;
  workshopName: string;
  workshopSlug: string;
  planCode: PlanCode;
  subscriptionStatus: SubscriptionStatusCode;
}

export interface TechnicianLoginPayload {
  email: string;
  password: string;
}

export interface TechnicianSessionResult {
  token: string;
  expiresAt: Date;
  technician: TechnicianIdentity;
}

export interface TechnicianWorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  status: WorkshopStatusCode;
  planCode: PlanCode;
  subscriptionStatus: SubscriptionStatusCode;
  technician: {
    id: string;
    displayName: string;
    email: string;
    status: TechnicianStatusCode;
  };
}

export interface TechnicianApiMessage {
  message: string;
}
