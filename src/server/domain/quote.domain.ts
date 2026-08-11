import { QuoteStatus } from "@prisma/client";
import { QuoteDisplayStatusCode } from "@/types/workshopOperations.types";

export function calculateQuoteValidUntil(sentAt: Date, validityDays: number): Date {
  const validUntil = new Date(sentAt);
  validUntil.setUTCDate(validUntil.getUTCDate() + validityDays);
  return validUntil;
}

export function getQuoteDisplayStatus(
  status: QuoteStatus,
  validUntil: Date | undefined,
  currentDate: Date = new Date()
): QuoteDisplayStatusCode {
  if (status === QuoteStatus.SENT && validUntil && validUntil.getTime() < currentDate.getTime()) {
    return "EXPIRED";
  }
  return status;
}

export function canPrepareQuoteRevision(status: QuoteStatus): boolean {
  return status === QuoteStatus.SENT;
}

export function canAcceptQuoteRevision(status: QuoteStatus, validUntil: Date, currentDate: Date = new Date()): boolean {
  return status === QuoteStatus.SENT && validUntil.getTime() >= currentDate.getTime();
}
