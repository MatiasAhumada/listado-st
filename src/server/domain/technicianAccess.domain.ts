import { TECHNICIAN_ACCESS } from "@/constants/technician.constant";
import { TechnicianIdentity } from "@/interfaces/technician.interface";
import { TechnicianWorkspacePersistence } from "@/interfaces/technicianPersistence.interface";
import {
  SubscriptionStatusCode,
  TechnicianStatusCode,
  WorkshopStatusCode,
} from "@/types/platformAdmin.types";

interface TechnicianAccessState {
  technicianStatus: TechnicianStatusCode;
  workshopStatus: WorkshopStatusCode;
  subscriptionStatus?: SubscriptionStatusCode;
}

export function hasTechnicianAccess(state: TechnicianAccessState): boolean {
  const hasAllowedSubscription = TECHNICIAN_ACCESS.allowedSubscriptionStatuses.some(
    (allowedStatus) => allowedStatus === state.subscriptionStatus
  );

  return (
    state.technicianStatus === TECHNICIAN_ACCESS.activeTechnicianStatus &&
    state.workshopStatus === TECHNICIAN_ACCESS.activeWorkshopStatus &&
    hasAllowedSubscription
  );
}

export function ownsTechnicianWorkspace(
  identity: TechnicianIdentity,
  workspace: TechnicianWorkspacePersistence
): boolean {
  const includesTechnician = workspace.technicians.some(
    (technician) => technician.id === identity.id
  );
  return workspace.id === identity.workshopId && includesTechnician;
}
