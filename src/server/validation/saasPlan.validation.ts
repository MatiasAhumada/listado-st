import { z } from "zod";
import {
  SAAS_PLAN_BILLING_PERIODS,
  SAAS_PLAN_LIMITS,
  SAAS_PLAN_TEXT,
} from "@/constants/saasPlan.constant";

const priceExpression = new RegExp(
  `^(?!0+(?:\\.0{1,${SAAS_PLAN_LIMITS.maximumPriceDecimalDigits}})?$)\\d{1,${SAAS_PLAN_LIMITS.maximumPriceIntegerDigits}}(?:\\.\\d{1,${SAAS_PLAN_LIMITS.maximumPriceDecimalDigits}})?$`
);

export const commercialPriceSchema = z
  .string()
  .trim()
  .regex(priceExpression, SAAS_PLAN_TEXT.priceInvalid);

export const saveSaasPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, SAAS_PLAN_TEXT.nameRequired)
    .max(SAAS_PLAN_LIMITS.maximumNameLength, SAAS_PLAN_TEXT.nameRequired),
  description: z
    .string()
    .trim()
    .max(SAAS_PLAN_LIMITS.maximumDescriptionLength)
    .nullable(),
  billingPrice: commercialPriceSchema,
  billingPeriod: z.enum(SAAS_PLAN_BILLING_PERIODS),
  isActive: z.boolean(),
});
