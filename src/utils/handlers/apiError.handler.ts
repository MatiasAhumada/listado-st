import httpStatus from "http-status";
import { NextRequest, NextResponse } from "next/server";

interface ApiErrorOptions {
  status?: number;
  message?: string;
  isOperational?: boolean;
  stack?: string;
  internalCode?: string;
  details?: Record<string, unknown> | null;
}

export class ApiError extends Error {
  public readonly stack?: string;
  public readonly status: number;
  public readonly isOperational: boolean;
  public readonly internalCode?: string;
  public readonly details?: Record<string, unknown> | null;

  constructor({
    status = httpStatus.INTERNAL_SERVER_ERROR,
    message = "",
    isOperational = true,
    stack,
    internalCode,
    details = null,
  }: ApiErrorOptions) {
    super(message);

    this.status = status;
    this.isOperational = isOperational;
    this.internalCode = internalCode;
    this.details = details;

    if (stack) this.stack = stack;
    else Error.captureStackTrace(this);
  }
}

type ResponseError = {
  message: string;
  status: number;
  instance: string;
  method: string;
  stack?: string;
  internalCode?: string;
  details?: Record<string, unknown> | null;
};

export default function apiErrorHandler({
  error,
  request,
  fallbackMessage,
}: {
  error: unknown;
  request: NextRequest;
  fallbackMessage?: string;
}) {
  const normalizedError =
    error instanceof ApiError
      ? error
      : new ApiError({ message: fallbackMessage, isOperational: false });
  let { status, message } = normalizedError;
  if (!normalizedError.isOperational) {
    status = httpStatus.INTERNAL_SERVER_ERROR;
    message = fallbackMessage ?? String(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
  }
  if (!message) message = fallbackMessage ?? String(httpStatus.INTERNAL_SERVER_ERROR);

  const errorResponse: ResponseError = {
    message,
    status: status,
    instance: request?.nextUrl?.pathname,
    method: request?.method,
  };

  if (normalizedError.internalCode) errorResponse.internalCode = normalizedError.internalCode;
  if (normalizedError.details) errorResponse.details = normalizedError.details;
  if (normalizedError.stack && process.env.NODE_ENV === "development") {
    errorResponse.stack = normalizedError.stack;
  }

  console.error({ ...errorResponse });
  return NextResponse.json({ error: errorResponse }, { status });
}
