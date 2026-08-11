import { z } from "zod";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import {
  createAuthUsernameSchema,
  createAuthPasswordSchema,
} from "@/server/validation/auth.validation";

const technicianUsernameSchema = createAuthUsernameSchema(TECHNICIAN_TEXT.usernameInvalid);
const technicianPasswordSchema = createAuthPasswordSchema({
  passwordTooShort: TECHNICIAN_TEXT.passwordTooShort,
  passwordTooLong: TECHNICIAN_TEXT.passwordTooLong,
});

export const technicianLoginSchema = z.object({
  username: technicianUsernameSchema,
  password: technicianPasswordSchema,
});
