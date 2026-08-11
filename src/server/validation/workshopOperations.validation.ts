import { z } from "zod";
import { WORKSHOP_OPERATIONS_LIMITS, WORKSHOP_OPERATIONS_TEXT } from "@/constants/workshopOperations.constant";

const idSchema = z.string().trim().min(1).max(64);
const nullableText = (maximumLength: number) => z.string().trim().max(maximumLength).nullable();
const requiredText = (maximumLength: number, message: string) =>
  z.string().trim().min(1, message).max(maximumLength, message);

const moneyExpression = new RegExp(
  `^\\d{1,${WORKSHOP_OPERATIONS_LIMITS.maximumMoneyIntegerDigits}}(?:\\.\\d{1,${WORKSHOP_OPERATIONS_LIMITS.maximumMoneyDecimalDigits}})?$`
);
const positiveMoneyExpression = new RegExp(
  `^(?!0+(?:\\.0{1,${WORKSHOP_OPERATIONS_LIMITS.maximumMoneyDecimalDigits}})?$)\\d{1,${WORKSHOP_OPERATIONS_LIMITS.maximumMoneyIntegerDigits}}(?:\\.\\d{1,${WORKSHOP_OPERATIONS_LIMITS.maximumMoneyDecimalDigits}})?$`
);

export const mobileDeviceSchema = z.object({
  brand: requiredText(WORKSHOP_OPERATIONS_LIMITS.maximumBrandLength, WORKSHOP_OPERATIONS_TEXT.deviceBrandRequired),
  model: requiredText(WORKSHOP_OPERATIONS_LIMITS.maximumModelLength, WORKSHOP_OPERATIONS_TEXT.deviceModelRequired),
  imei: nullableText(WORKSHOP_OPERATIONS_LIMITS.maximumImeiLength),
  color: nullableText(WORKSHOP_OPERATIONS_LIMITS.maximumColorLength),
  notes: nullableText(WORKSHOP_OPERATIONS_LIMITS.maximumNotesLength),
});

const customerFields = {
  fullName: requiredText(
    WORKSHOP_OPERATIONS_LIMITS.maximumCustomerNameLength,
    WORKSHOP_OPERATIONS_TEXT.customerNameRequired
  ),
  phone: requiredText(WORKSHOP_OPERATIONS_LIMITS.maximumPhoneLength, WORKSHOP_OPERATIONS_TEXT.customerPhoneRequired),
  email: z.string().trim().email().max(WORKSHOP_OPERATIONS_LIMITS.maximumEmailLength).nullable(),
  notes: nullableText(WORKSHOP_OPERATIONS_LIMITS.maximumNotesLength),
};

export const createWorkshopCustomerSchema = z.object({
  ...customerFields,
  device: mobileDeviceSchema,
});

export const updateWorkshopCustomerSchema = z.object(customerFields);

export const quoteAlternativeSchema = z.object({
  id: idSchema.optional(),
  catalogItemId: idSchema.nullable(),
  description: requiredText(
    WORKSHOP_OPERATIONS_LIMITS.maximumAlternativeDescriptionLength,
    WORKSHOP_OPERATIONS_TEXT.alternativeDescriptionRequired
  ),
  supplier: requiredText(WORKSHOP_OPERATIONS_LIMITS.maximumSupplierLength, WORKSHOP_OPERATIONS_TEXT.supplierRequired),
  selectedCost: z.string().trim().regex(moneyExpression, WORKSHOP_OPERATIONS_TEXT.moneyInvalid),
  finalPrice: z.string().trim().regex(positiveMoneyExpression, WORKSHOP_OPERATIONS_TEXT.finalPriceInvalid),
});

export const saveQuoteSchema = z.object({
  customerId: idSchema,
  deviceId: idSchema,
  reportedIssue: requiredText(WORKSHOP_OPERATIONS_LIMITS.maximumIssueLength, WORKSHOP_OPERATIONS_TEXT.issueRequired),
  validityDays: z
    .number()
    .int()
    .min(WORKSHOP_OPERATIONS_LIMITS.minimumValidityDays)
    .max(WORKSHOP_OPERATIONS_LIMITS.maximumValidityDays),
  alternatives: z
    .array(quoteAlternativeSchema)
    .min(WORKSHOP_OPERATIONS_LIMITS.minimumAlternatives, WORKSHOP_OPERATIONS_TEXT.alternativesRequired)
    .max(WORKSHOP_OPERATIONS_LIMITS.maximumAlternatives),
});

export const acceptQuoteSchema = z.object({
  revisionAlternativeId: idSchema,
});
