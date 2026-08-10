import { z } from "zod";
import httpStatus from "http-status";
import { PLATFORM_ADMIN_TEXT } from "@/constants/platformAdmin.constant";
import { ApiError } from "@/utils/handlers/apiError.handler";

export function parseRequestPayload<Payload>(
  schema: z.ZodType<Payload>,
  payload: unknown,
  invalidMessage: string = PLATFORM_ADMIN_TEXT.invalidRequest
): Payload {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ApiError({
      status: httpStatus.BAD_REQUEST,
      message: invalidMessage,
      details: { fieldErrors: result.error.flatten().fieldErrors },
    });
  }

  return result.data;
}
