import { ACCESS_ROLES } from "@/constants/access.constant";

export type AccessRole = (typeof ACCESS_ROLES)[keyof typeof ACCESS_ROLES];

export interface AccessLoginPayload {
  username: string;
  password: string;
}

export interface AccessSessionResponse {
  role: AccessRole;
  destination: string;
}
