import { create } from "zustand";

/** What the user picks. "system" follows the device setting. */
export type Theme = "light" | "dark" | "system";

/** What is actually showing right now. */
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "classgrid-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

const readStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
  }
  return "system";
};

const systemPrefersDark = () =>
  window.matchMedia?.(DARK_QUERY).matches ?? false;

const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;

/** The stylesheet switches palettes on a `dark` class on <html>. */
const applyTheme = (resolved: ResolvedTheme) => {
  document.documentElement.classList.toggle("dark", resolved === "dark");
};

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Runs once, the first time the store is used.
  const theme = readStoredTheme();
  const resolvedTheme = resolveTheme(theme);
  applyTheme(resolvedTheme);

  return {
    theme,
    resolvedTheme,
    setTheme: (next) => {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // The choice still applies for this visit.
      }
      const resolved = resolveTheme(next);
      applyTheme(resolved);
      set({ theme: next, resolvedTheme: resolved });
    },
  };
});

/**
 * Keeps the page in step with changes made outside the app. Call it once,
 * near the top of the app, and return its cleanup from the effect:
 *
 *   useEffect(() => initTheme(), []);
 *
 * It handles two things: the device switching between light and dark while
 * "system" is selected, and the theme being changed in another browser tab.
 */
export const initTheme = (): (() => void) => {
  const media = window.matchMedia?.(DARK_QUERY);

  const onSystemChange = () => {
    if (useThemeStore.getState().theme !== "system") return;
    const resolved = resolveTheme("system");
    applyTheme(resolved);
    useThemeStore.setState({ resolvedTheme: resolved });
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !isTheme(event.newValue)) return;
    const resolved = resolveTheme(event.newValue);
    applyTheme(resolved);
    useThemeStore.setState({ theme: event.newValue, resolvedTheme: resolved });
  };

  media?.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);

  return () => {
    media?.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
};