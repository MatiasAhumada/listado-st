import { z } from "zod";
import { ACCESS_TEXT } from "@/constants/access.constant";
import {
  createAuthPasswordSchema,
  createAuthUsernameSchema,
} from "@/server/validation/auth.validation";

export const accessLoginSchema = z.object({
  username: createAuthUsernameSchema(ACCESS_TEXT.usernameInvalid),
  password: createAuthPasswordSchema({
    passwordTooShort: ACCESS_TEXT.passwordTooShort,
    passwordTooLong: ACCESS_TEXT.passwordTooLong,
  }),
});
