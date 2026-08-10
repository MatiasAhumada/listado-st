import { z } from "zod";
import { AUTH_SECURITY } from "@/constants/auth.constant";

interface AuthValidationMessages {
  passwordTooShort: string;
  passwordTooLong: string;
}

export function createAuthEmailSchema(message: string) {
  return z
    .string()
    .email(message)
    .max(AUTH_SECURITY.maximumEmailLength, message)
    .transform((email) => email.trim().toLowerCase());
}

export function createAuthPasswordSchema(messages: AuthValidationMessages) {
  return z
    .string()
    .min(AUTH_SECURITY.minimumPasswordLength, messages.passwordTooShort)
    .max(AUTH_SECURITY.maximumPasswordLength, messages.passwordTooLong);
}
