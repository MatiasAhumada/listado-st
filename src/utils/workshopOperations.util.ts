import { WORKSHOP_OPERATIONS_TEXT } from "@/constants/workshopOperations.constant";
import { QuoteSummary } from "@/interfaces/workshopOperations.interface";

export function formatWorkshopMoney(amount: string, currency: string): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatWorkshopDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function buildQuoteWhatsappMessage(quote: QuoteSummary): string {
  const revision = quote.revisions[0];
  if (!revision) return "";
  const device = `${quote.device.brand} ${quote.device.model}`;
  const alternatives = revision.alternatives
    .map(
      (alternative, index) =>
        `${index + 1}. ${alternative.description}: ${formatWorkshopMoney(alternative.finalPrice, revision.currency)}`
    )
    .join("\n");
  return [
    `${WORKSHOP_OPERATIONS_TEXT.whatsappGreeting} ${quote.customer.fullName},`,
    `${WORKSHOP_OPERATIONS_TEXT.whatsappIntro} ${device}:`,
    alternatives,
    `${WORKSHOP_OPERATIONS_TEXT.whatsappValidity} ${formatWorkshopDate(revision.validUntil)}.`,
    WORKSHOP_OPERATIONS_TEXT.whatsappClosing,
  ].join("\n\n");
}
