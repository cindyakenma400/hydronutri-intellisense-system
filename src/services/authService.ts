import { apiPostJson } from "@/lib/api";

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export function login(email: string, password: string) {
  return apiPostJson<AuthResponse>("/auth/login", {
    email,
    password,
  });
}

export function register(
  fullName: string,
  email: string,
  phone: string,
  password: string
) {
  return apiPostJson<AuthResponse>("/auth/register", {
    full_name: fullName,
    email,
    phone,
    password,
  });
}

export function saveSession(response: AuthResponse) {
  localStorage.setItem("token", response.access_token);
  localStorage.setItem("user", JSON.stringify(response.user));
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("user");

  try {
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("token"));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}