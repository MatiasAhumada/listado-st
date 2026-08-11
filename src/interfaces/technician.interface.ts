import {
  SubscriptionStatusCode,
  TechnicianStatusCode,
  WorkshopStatusCode,
} from "@/types/platformAdmin.types";
import { SaasPlanReference } from "@/interfaces/saasPlan.interface";

export interface TechnicianIdentity {
  id: string;
  workshopId: string;
  username: string;
  displayName: string;
  workshopName: string;
  workshopSlug: string;
  plan: SaasPlanReference;
  subscriptionStatus: SubscriptionStatusCode;
}

export interface TechnicianLoginPayload {
  username: string;
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
  plan: SaasPlanReference;
  subscriptionStatus: SubscriptionStatusCode;
  technician: {
    id: string;
    displayName: string;
    username: string;
    status: TechnicianStatusCode;
  };
}

export interface TechnicianApiMessage {
  message: string;
}
