import { z } from "zod";
import {
  INITIAL_SUBSCRIPTION_STATUS_OPTIONS,
  PLATFORM_ADMIN_SECURITY,
  PLATFORM_ADMIN_TEXT,
  WORKSHOP_STATUS_OPTIONS,
} from "@/constants/platformAdmin.constant";
import {
  createAuthEmailSchema,
  createAuthPasswordSchema,
} from "@/server/validation/auth.validation";

const emailSchema = createAuthEmailSchema(PLATFORM_ADMIN_TEXT.emailInvalid);
const passwordSchema = createAuthPasswordSchema({
  passwordTooShort: PLATFORM_ADMIN_TEXT.passwordTooShort,
  passwordTooLong: PLATFORM_ADMIN_TEXT.passwordTooLong,
});

const requiredNameSchema = (message: string) =>
  z.string().trim().min(1, message).max(PLATFORM_ADMIN_SECURITY.maximumNameLength, message);

export const platformAdminLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const createWorkshopSchema = z.object({
  workshopName: requiredNameSchema(PLATFORM_ADMIN_TEXT.workshopNameRequired),
  ownerName: requiredNameSchema(PLATFORM_ADMIN_TEXT.ownerNameRequired),
  ownerEmail: emailSchema,
  ownerPassword: passwordSchema,
  subscriptionStatus: z.enum(INITIAL_SUBSCRIPTION_STATUS_OPTIONS),
});

export const updateWorkshopStatusSchema = z.object({
  status: z.enum(WORKSHOP_STATUS_OPTIONS),
});
