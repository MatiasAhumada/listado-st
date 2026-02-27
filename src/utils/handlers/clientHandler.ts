"use client";

import { AxiosError } from "axios";
import { toast, ExternalToast } from "sonner";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

interface HandlerOptions {
  logToConsole?: boolean;
  showToast?: boolean;
  messagePrefix?: string;
  defaultMessage?: string;
  toastOptions?: ExternalToast;
}

function normalizeError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const isNetworkError = !error.response;
    return {
      name: "AxiosError",
      message: isNetworkError
        ? "Error de conexión"
        : error.response?.data?.error?.message || error.message,
      stack: error.response?.data?.error?.stack || error.stack,
    };
  }

  if (error && typeof error === "object" && !(error instanceof Error)) {
    return new Error(ERROR_MESSAGES.FORM_VALIDATION);
  }

  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return new Error(error.message);
    }
    return new Error(JSON.stringify(error));
  }

  return new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
}

export function clientErrorHandler(
  error: unknown,
  callback = () => {},
  {
    logToConsole = true,
    showToast = true,
    messagePrefix = "",
    defaultMessage = "Error desconocido",
    toastOptions = {},
  }: HandlerOptions = {}
): void {
  const normalizedError = normalizeError(error);

  if (logToConsole) console.error(normalizedError);
  if (showToast) {
    const displayMessage = normalizedError.message || defaultMessage;
    toast.error(`${messagePrefix}${displayMessage}`, toastOptions);
  }

  callback();
}

export function clientSuccessHandler(
  message: string,
  callback = () => {},
  {
    logToConsole = false,
    showToast = true,
    messagePrefix = "",
    toastOptions = {},
  }: Omit<HandlerOptions, "defaultMessage"> = {}
): void {
  if (logToConsole) console.log(message);
  if (showToast) {
    toast.success(`${messagePrefix}${message}`, toastOptions);
  }

  callback();
}

export function clientWarningHandler(
  message: string,
  callback = () => {},
  {
    logToConsole = true,
    showToast = true,
    messagePrefix = "",
    toastOptions = {},
  }: Omit<HandlerOptions, "defaultMessage"> = {}
): void {
  if (logToConsole) console.warn(message);
  if (showToast) {
    toast.warning(`${messagePrefix}${message}`, toastOptions);
  }

  callback();
}

export function clientInfoHandler(
  message: string,
  callback = () => {},
  {
    logToConsole = false,
    showToast = true,
    messagePrefix = "",
    toastOptions = {},
  }: Omit<HandlerOptions, "defaultMessage"> = {}
): void {
  if (logToConsole) console.info(message);
  if (showToast) {
    toast.info(`${messagePrefix}${message}`, toastOptions);
  }

  callback();
}

export default clientErrorHandler;
