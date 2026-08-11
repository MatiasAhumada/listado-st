import { RepairStatusCode } from "@/types/repairOperations.types";

const allowedTransitions: Record<RepairStatusCode, RepairStatusCode[]> = {
  RECEIVED: ["DIAGNOSING", "WAITING_PART", "IN_REPAIR", "CANCELLED"],
  DIAGNOSING: ["WAITING_PART", "IN_REPAIR", "READY_FOR_PICKUP", "CANCELLED"],
  WAITING_PART: ["IN_REPAIR", "CANCELLED"],
  IN_REPAIR: ["WAITING_PART", "READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["IN_REPAIR", "DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function getAllowedRepairStatusTransitions(status: RepairStatusCode): RepairStatusCode[] {
  return allowedTransitions[status];
}

export function canChangeRepairStatus(currentStatus: RepairStatusCode, nextStatus: RepairStatusCode): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function calculateRepairAlertDueAt(lastStatusChangedAt: Date, afterHours: number): Date {
  return new Date(lastStatusChangedAt.getTime() + afterHours * 60 * 60 * 1000);
}

export function calculateOverdueHours(dueAt: Date, now: Date): number {
  if (dueAt.getTime() >= now.getTime()) return 0;
  return Math.floor((now.getTime() - dueAt.getTime()) / (60 * 60 * 1000));
}
