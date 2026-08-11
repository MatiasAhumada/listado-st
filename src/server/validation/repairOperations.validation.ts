import { z } from "zod";
import { REPAIR_LIMITS, REPAIR_TEXT } from "@/constants/repairOperations.constant";

const repairStatuses = [
  "RECEIVED",
  "DIAGNOSING",
  "WAITING_PART",
  "IN_REPAIR",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED",
] as const;

const paymentKinds = ["DEPOSIT", "PARTIAL", "FINAL"] as const;
const expenseKinds = ["PART", "SUPPLY", "OUTSOURCED_SERVICE", "OTHER"] as const;
const idSchema = z.string().trim().min(1).max(64);
const nullableText = (maximumLength: number) => z.string().trim().max(maximumLength).nullable();
const isoDateTime = z.string().datetime({ offset: true });
const positiveMoneyExpression = new RegExp(
  `^(?!0+(?:\\.0{1,${REPAIR_LIMITS.maximumMoneyDecimalDigits}})?$)\\d{1,${REPAIR_LIMITS.maximumMoneyIntegerDigits}}(?:\\.\\d{1,${REPAIR_LIMITS.maximumMoneyDecimalDigits}})?$`
);
const positiveMoney = z.string().trim().regex(positiveMoneyExpression, REPAIR_TEXT.amountInvalid);

export const createRepairSchema = z.object({
  quoteId: idSchema,
  physicalReceivedAt: isoDateTime,
  internalNotes: nullableText(REPAIR_LIMITS.maximumNotesLength),
});

export const changeRepairStatusSchema = z.object({
  status: z.enum(repairStatuses),
  note: nullableText(REPAIR_LIMITS.maximumStatusNoteLength),
});

export const createRepairPaymentSchema = z.object({
  kind: z.enum(paymentKinds),
  amount: positiveMoney,
  note: nullableText(REPAIR_LIMITS.maximumFinancialNoteLength),
  occurredAt: isoDateTime,
});

export const createRepairExpenseSchema = z.object({
  kind: z.enum(expenseKinds),
  amount: positiveMoney,
  description: z.string().trim().min(1).max(REPAIR_LIMITS.maximumExpenseDescriptionLength),
  supplier: nullableText(REPAIR_LIMITS.maximumSupplierLength),
  occurredAt: isoDateTime,
});

export const reverseFinancialEntrySchema = z.object({
  note: nullableText(REPAIR_LIMITS.maximumFinancialNoteLength),
});

export const updateRepairAlertRulesSchema = z.object({
  rules: z
    .array(
      z.object({
        status: z.enum(repairStatuses),
        afterHours: z.number().int().min(REPAIR_LIMITS.minimumAlertHours).max(REPAIR_LIMITS.maximumAlertHours),
        isEnabled: z.boolean(),
      })
    )
    .length(repairStatuses.length),
});
