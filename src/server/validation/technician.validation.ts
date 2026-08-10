import { z } from "zod";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import {
  createAuthEmailSchema,
  createAuthPasswordSchema,
} from "@/server/validation/auth.validation";

const technicianEmailSchema = createAuthEmailSchema(TECHNICIAN_TEXT.emailInvalid);
const technicianPasswordSchema = createAuthPasswordSchema({
  passwordTooShort: TECHNICIAN_TEXT.passwordTooShort,
  passwordTooLong: TECHNICIAN_TEXT.passwordTooLong,
});

export const technicianLoginSchema = z.object({
  email: technicianEmailSchema,
  password: technicianPasswordSchema,
});
