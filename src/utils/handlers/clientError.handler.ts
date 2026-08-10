import { AxiosError } from "axios";
import { toast } from "sonner";
import { PLATFORM_ADMIN_TEXT } from "@/constants/platformAdmin.constant";

interface ApiErrorPayload {
  error?: {
    message?: string;
  };
}

export function getClientErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responsePayload = error.response?.data as ApiErrorPayload | undefined;
    return responsePayload?.error?.message ?? PLATFORM_ADMIN_TEXT.unknownError;
  }
  if (error instanceof Error) return error.message;
  return PLATFORM_ADMIN_TEXT.unknownError;
}

export function clientErrorHandler(error: unknown): void {
  toast.error(getClientErrorMessage(error));
}

export function clientSuccessHandler(message: string): void {
  toast.success(message);
}
