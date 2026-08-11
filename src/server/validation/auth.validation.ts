import { z } from "zod";
import { AUTH_SECURITY } from "@/constants/auth.constant";

interface AuthPasswordValidationMessages {
  passwordTooShort: string;
  passwordTooLong: string;
}

export function createAuthUsernameSchema(message: string) {
  return z
    .string()
    .trim()
    .toLowerCase()
    .min(AUTH_SECURITY.minimumUsernameLength, message)
    .max(AUTH_SECURITY.maximumUsernameLength, message)
    .regex(AUTH_SECURITY.usernamePattern, message);
}

export function createAuthPasswordSchema(messages: AuthPasswordValidationMessages) {
  return z
    .string()
    .min(AUTH_SECURITY.minimumPasswordLength, messages.passwordTooShort)
    .max(AUTH_SECURITY.maximumPasswordLength, messages.passwordTooLong);
}
