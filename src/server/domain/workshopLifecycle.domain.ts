import { PLATFORM_ADMIN_LIFECYCLE } from "@/constants/platformAdmin.constant";
import { WorkshopLifecycleUpdate } from "@/interfaces/platformAdmin.interface";
import { WorkshopStatusCode } from "@/types/platformAdmin.types";

export function buildWorkshopLifecycleUpdate(targetStatus: WorkshopStatusCode): WorkshopLifecycleUpdate {
  if (targetStatus === "SUSPENDED") {
    return PLATFORM_ADMIN_LIFECYCLE.suspended;
  }

  return PLATFORM_ADMIN_LIFECYCLE.active;
}
