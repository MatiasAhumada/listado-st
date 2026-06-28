import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { ApiError } from "@/utils/handlers/apiError.handler";
import httpStatus from "http-status";
import { SERVICE_ORDER_ERRORS, SERVICE_ORDER_PATCH_ALLOWED_FIELDS } from "@/constants/serviceOrder.constant";

const JWT_SECRET = process.env.JWT_SECRET ?? "super-secret";
const AUTH_COOKIE_NAME = "auth-token";
const AUTH_BEARER_PREFIX = "Bearer ";

export interface AuthContext {
  id: string;
  username: string;
  role: Role;
  companyId: string | null;
  branchId: string | null;
}

type CookieStore = { get: (name: string) => { value: string } | undefined };

export function extractAuthContext(cookieStore: CookieStore, headers?: Headers): AuthContext {
  let token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token && headers) {
    const authHeader = headers.get("authorization") ?? headers.get("Authorization");
    if (authHeader?.startsWith(AUTH_BEARER_PREFIX)) {
      token = authHeader.slice(AUTH_BEARER_PREFIX.length);
    }
  }
  if (!token) {
    throw new ApiError({ status: httpStatus.UNAUTHORIZED, message: SERVICE_ORDER_ERRORS.UNAUTHENTICATED });
  }
  return jwt.verify(token, JWT_SECRET) as AuthContext;
}

export function getEffectiveCompanyId(auth: AuthContext): string | null {
  if (auth.role === Role.TECNICO) return null;
  if (auth.role === Role.EMPRESA) return auth.id;
  return auth.companyId;
}

export function assertWritePermission(auth: AuthContext): void {
  if (auth.role === Role.VENDEDOR) {
    throw new ApiError({ status: httpStatus.FORBIDDEN, message: SERVICE_ORDER_ERRORS.FORBIDDEN });
  }
}

export function assertPatchPermission(auth: AuthContext, bodyKeys: string[]): void {
  if (auth.role !== Role.VENDEDOR) return;
  const allowedSet = new Set<string>(SERVICE_ORDER_PATCH_ALLOWED_FIELDS);
  const hasDisallowedField = bodyKeys.some((key) => !allowedSet.has(key));
  if (hasDisallowedField) {
    throw new ApiError({ status: httpStatus.FORBIDDEN, message: SERVICE_ORDER_ERRORS.VENDEDOR_STATUS_ONLY });
  }
}

export function assertOwnership(orderCompanyId: string, auth: AuthContext): void {
  if (auth.role === Role.TECNICO) return;
  const effectiveCompanyId = getEffectiveCompanyId(auth);
  if (!effectiveCompanyId || orderCompanyId !== effectiveCompanyId) {
    throw new ApiError({ status: httpStatus.FORBIDDEN, message: SERVICE_ORDER_ERRORS.FORBIDDEN_OWNERSHIP });
  }
}
