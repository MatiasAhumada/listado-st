export type UserRole = "EMPRESA" | "VENDEDOR" | "TECNICO";

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  token: string;
}
