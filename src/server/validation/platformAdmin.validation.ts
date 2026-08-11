import { z } from "zod";
import {
  INITIAL_SUBSCRIPTION_STATUS_OPTIONS,
  PLATFORM_ADMIN_SECURITY,
  PLATFORM_ADMIN_TEXT,
  WORKSHOP_STATUS_OPTIONS,
} from "@/constants/platformAdmin.constant";
import {
  createAuthUsernameSchema,
  createAuthPasswordSchema,
} from "@/server/validation/auth.validation";
import { SAAS_PLAN_TEXT } from "@/constants/saasPlan.constant";
import { commercialPriceSchema } from "@/server/validation/saasPlan.validation";

const usernameSchema = createAuthUsernameSchema(PLATFORM_ADMIN_TEXT.usernameInvalid);
const passwordSchema = createAuthPasswordSchema({
  passwordTooShort: PLATFORM_ADMIN_TEXT.passwordTooShort,
  passwordTooLong: PLATFORM_ADMIN_TEXT.passwordTooLong,
});

const requiredNameSchema = (message: string) =>
  z.string().trim().min(1, message).max(PLATFORM_ADMIN_SECURITY.maximumNameLength, message);

export const platformAdminLoginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const createWorkshopSchema = z.object({
  workshopName: requiredNameSchema(PLATFORM_ADMIN_TEXT.workshopNameRequired),
  ownerName: requiredNameSchema(PLATFORM_ADMIN_TEXT.ownerNameRequired),
  ownerUsername: usernameSchema,
  ownerPassword: passwordSchema,
  planId: z.string().trim().min(1, SAAS_PLAN_TEXT.planRequired).max(64),
  agreedPrice: commercialPriceSchema,
  subscriptionStatus: z.enum(INITIAL_SUBSCRIPTION_STATUS_OPTIONS),
});

export const updateWorkshopStatusSchema = z.object({
  status: z.enum(WORKSHOP_STATUS_OPTIONS),
});

export const updateWorkshopPlanSchema = z.object({
  planId: z.string().trim().min(1, SAAS_PLAN_TEXT.planRequired).max(64),
  agreedPrice: commercialPriceSchema,
});
