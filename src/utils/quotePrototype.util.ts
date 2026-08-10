import {
  PROTOTYPE_CURRENCY_CODE,
  PROTOTYPE_CURRENCY_LOCALE,
  PROTOTYPE_MARKUP_RATE,
  PROTOTYPE_TEXT,
  PROTOTYPE_ZERO_AMOUNT,
} from "@/constants/quotePrototype.constant";
import { PrototypeQuoteAlternative } from "@/interfaces/quotePrototype.interface";

const currencyFormatter = new Intl.NumberFormat(PROTOTYPE_CURRENCY_LOCALE, {
  style: "currency",
  currency: PROTOTYPE_CURRENCY_CODE,
  maximumFractionDigits: PROTOTYPE_ZERO_AMOUNT,
});

export function calculateSuggestedPrice(referenceCost: number) {
  return referenceCost * (PROTOTYPE_MARKUP_RATE + 1);
}

export function calculateEstimatedProfit(finalPrice: number, selectedCost: number) {
  return finalPrice - selectedCost;
}

export function formatPrototypeMoney(amount: number) {
  return currencyFormatter.format(amount);
}

export function parsePrototypeAmount(value: string) {
  const parsedAmount = Number(value);
  return Number.isFinite(parsedAmount) ? parsedAmount : PROTOTYPE_ZERO_AMOUNT;
}

export function normalizePrototypeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

interface BuildClientMessageInput {
  customerName: string;
  phoneModel: string;
  validityDays: string;
  alternatives: PrototypeQuoteAlternative[];
}

export function buildPrototypeClientMessage({
  customerName,
  phoneModel,
  validityDays,
  alternatives,
}: BuildClientMessageInput) {
  const alternativeLines = alternatives.map(
    (alternative, alternativeIndex) =>
      `${alternativeIndex + 1}. ${alternative.description}: ${formatPrototypeMoney(alternative.finalPrice)}`
  );

  return [
    `${PROTOTYPE_TEXT.whatsappGreeting} ${customerName}, ${PROTOTYPE_TEXT.whatsappIntro} ${phoneModel}:`,
    ...alternativeLines,
    `${PROTOTYPE_TEXT.whatsappValidity} ${validityDays} ${PROTOTYPE_TEXT.daysSuffix}.`,
    PROTOTYPE_TEXT.whatsappClosing,
  ].join("\n");
}
