import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export const INPUT =
  "w-full rounded-sm border bg-(--input-bg) px-space-md py-space-sm text-sm text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const borderFor = (hasError: boolean) =>
  hasError ? "border-error" : "border-(--input-border)";

/* ------------------------------ server results ----------------------------- */

export type ServerFieldError = { field: string; message: string };

/** What every auth call should resolve to. */
export interface ActionResult {
  success: boolean;
  message?: string;
  /** On failure this can be a list of { field, message } errors. */
  data?: unknown;
}

export const isErrorList = (value: unknown): value is ServerFieldError[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.field === "string" &&
      typeof item.message === "string",
  );

export const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Shows a failed result on the form: errors for known fields go under their
 * input (the first one gets focus), everything else goes in the banner.
 */
export function showServerFailure<T extends FieldValues>(
  setError: UseFormSetError<T>,
  result: ActionResult,
  knownFields: readonly string[],
  fallback: string,
): void {
  const message = result.message || fallback;

  if (!isErrorList(result.data)) {
    setError("root.server", { message });
    return;
  }

  const banner: string[] = [];
  let focused = false;

  result.data.forEach(({ field, message: text }) => {
    if (knownFields.includes(field)) {
      setError(
        field as Path<T>,
        { type: "server", message: text },
        { shouldFocus: !focused },
      );
      focused = true;
    } else {
      banner.push(text);
    }
  });

  if (banner.length > 0) {
    setError("root.server", { message: banner.join(" ") });
  } else if (!focused) {
    setError("root.server", { message });
  }
}

/** Where the auth pages live. Keep in sync with the routes in App.tsx. */
export const AUTH_ROUTES = {
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  /** Where to go after signing in, when there is no page to return to. */
  home: "/overview",
} as const;