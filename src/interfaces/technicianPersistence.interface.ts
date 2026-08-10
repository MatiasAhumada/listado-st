import {
  PlanCode,
  SubscriptionStatus,
  TechnicianStatus,
  WorkshopStatus,
} from "@prisma/client";

export interface CreateTechnicianSessionPersistence {
  technicianId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface TechnicianWorkspaceLookup {
  technicianId: string;
  workshopId: string;
}

export interface TechnicianWorkspacePersistence {
  id: string;
  name: string;
  slug: string;
  status: WorkshopStatus;
  subscription: {
    planCode: PlanCode;
    status: SubscriptionStatus;
  } | null;
  technicians: Array<{
    id: string;
    displayName: string;
    email: string;
    status: TechnicianStatus;
  }>;
}

export interface TechnicianWorkspaceReader {
  findForIdentity(
    lookup: TechnicianWorkspaceLookup
  ): Promise<TechnicianWorkspacePersistence | null>;
}
