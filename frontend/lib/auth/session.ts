import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
} from "@/types/auth";

export type { AuthSession, AuthUser, LoginCredentials, LoginResponse, RegisterCredentials };

const AUTH_STORAGE_KEY = "forgetrack:auth";

export function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function loadAuthSession(): AuthSession | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return undefined;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}