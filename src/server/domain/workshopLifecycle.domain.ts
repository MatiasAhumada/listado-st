import { PLATFORM_ADMIN_LIFECYCLE } from "@/constants/platformAdmin.constant";
import { WorkshopLifecycleUpdate } from "@/interfaces/platformAdmin.interface";
import { SubscriptionStatusCode, WorkshopStatusCode } from "@/types/platformAdmin.types";

export function buildWorkshopLifecycleUpdate(
  targetStatus: WorkshopStatusCode,
  currentSubscriptionStatus: SubscriptionStatusCode,
  resumeStatus: SubscriptionStatusCode | null
): WorkshopLifecycleUpdate {
  if (targetStatus === "SUSPENDED") {
    let nextResumeStatus = resumeStatus;
    if (currentSubscriptionStatus === "TRIAL" || currentSubscriptionStatus === "ACTIVE") {
      nextResumeStatus = currentSubscriptionStatus;
    }
    return {
      ...PLATFORM_ADMIN_LIFECYCLE.suspended,
      resumeStatus: nextResumeStatus ?? PLATFORM_ADMIN_LIFECYCLE.active.subscriptionStatus,
    };
  }

  return {
    ...PLATFORM_ADMIN_LIFECYCLE.active,
    subscriptionStatus: resumeStatus ?? PLATFORM_ADMIN_LIFECYCLE.active.subscriptionStatus,
    resumeStatus: null,
  };
}
