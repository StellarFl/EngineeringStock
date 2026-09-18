import type { AccessState } from "@/store/slices/access.slice";
import type { FiltersState } from "@/store/slices/filters.slice";
import type { UiState } from "@/store/slices/ui.slice";

export const PERSIST_KEY = "forgetrack:state:v1";

/**
 * Only these fields survive a reload. `mobileNavOpen` is intentionally excluded —
 * restoring an open drawer on load would be a bug, not a feature.
 *
 * Every member is optional on read: a payload written by an older build must not
 * be able to hand a slice `undefined` where it expects a value.
 */
export interface PersistedState {
  ui?: Pick<UiState, "sidebarCollapsed">;
  filters?: FiltersState;
  access?: AccessState;
}

export function loadPersistedState(): PersistedState | undefined {
  // Guard for the server render, where `window` does not exist.
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as PersistedState;
  } catch {
    // Corrupt or unreadable (private mode, quota) — fall back to defaults.
    return undefined;
  }
}

export function savePersistedState(state: PersistedState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — persistence is a nicety, never fail the app for it.
  }
}