import { AlertTriangle, ArrowLeft, Home, LayoutGrid, Lock, RotateCcw, SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { isRouteErrorResponse, Link, useNavigate, useRouteError } from "react-router-dom";


const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const PRIMARY_BUTTON = `inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover motion-reduce:transition-none ${FOCUS_RING}`;

const SECONDARY_BUTTON = `inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-sm border border-outline-variant px-space-lg py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container motion-reduce:transition-none ${FOCUS_RING}`;

// Same faint grid as the sign-in page, drawn in theme colors and faded out
// towards the edges so it works in light and dark mode.
const GRID_LINE =
  "color-mix(in srgb, var(--color-outline-variant) 40%, transparent)";
const GRID_PATTERN: React.CSSProperties = {
  backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
  backgroundSize: "48px 48px",
  maskImage: "radial-gradient(ellipse at center, black 15%, transparent 70%)",
  WebkitMaskImage:
    "radial-gradient(ellipse at center, black 15%, transparent 70%)",
};

type Action = "reload" | "home" | "signIn";

interface ErrorView {
  status?: number;
  title: string;
  message: string;
  icon: LucideIcon;
  /** A real fault shows in red; "not found" and "no access" don't. */
  isFault: boolean;
  action: Action;
  /** Whether going back is a sensible second option. */
  canGoBack: boolean;
}

const GENERIC_MESSAGE =
  "An unexpected error occurred. Try again, and if it keeps happening, let your school admin know.";

/** Turns whatever was thrown into something safe and helpful to show. */
const describeError = (error: unknown): ErrorView => {
  if (isRouteErrorResponse(error)) {
    const { status } = error;
    // The server's own message is fine to show for client errors only.
    const serverMessage =
      status < 500 && typeof error.data?.message === "string"
        ? error.data.message
        : undefined;

    if (status === 404) {
      return {
        status,
        title: "Page not found",
        message:
          serverMessage ??
          "The page you’re looking for doesn’t exist or has been moved.",
        icon: SearchX,
        isFault: false,
        action: "home",
        canGoBack: true,
      };
    }
    if (status === 401) {
      return {
        status,
        title: "Please sign in",
        message: serverMessage ?? "Your session has ended. Sign in again to continue.",
        icon: Lock,
        isFault: false,
        action: "signIn",
        canGoBack: false,
      };
    }
    if (status === 403) {
      return {
        status,
        title: "You don’t have access",
        message:
          serverMessage ??
          "Your account doesn’t have permission to view this page. If you think that’s a mistake, ask your school admin.",
        icon: Lock,
        isFault: false,
        action: "home",
        canGoBack: true,
      };
    }
    return {
      status,
      title: "Something went wrong",
      message: serverMessage ?? GENERIC_MESSAGE,
      icon: AlertTriangle,
      isFault: true,
      action: "reload",
      canGoBack: false,
    };
  }

  // Anything else was thrown by our own code. Never show its text to users.
  return {
    title: "Something went wrong",
    message: GENERIC_MESSAGE,
    icon: AlertTriangle,
    isFault: true,
    action: "reload",
    canGoBack: false,
  };
};

/* -------------------------------- component ------------------------------- */

const ErrorElement = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const view = describeError(error);
  const Icon = view.icon;

  // Move focus to the heading so screen readers announce the problem.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Technical details are for developers only and never ship to users.
  const details = import.meta.env.DEV
    ? error instanceof Error
      ? (error.stack ?? error.message)
      : error !== undefined
        ? String(error)
        : undefined
    : undefined;

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={GRID_PATTERN} />

      <header className="relative p-space-lg">
        <Link
          to="/"
          className={`inline-flex items-center gap-space-sm rounded-sm ${FOCUS_RING}`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-on-primary">
            <LayoutGrid size={18} aria-hidden="true" />
          </span>
          <span className="font-heading text-base font-semibold text-on-surface">
            ClassGrid
          </span>
        </Link>
      </header>

      <div className="relative flex flex-1 items-center justify-center p-space-lg pb-space-xl">
        <div className="w-full max-w-md space-y-space-lg text-center">
          <span
            className={[
              "mx-auto grid h-14 w-14 place-items-center rounded-full",
              view.isFault
                ? "bg-error-container text-on-error-container"
                : "bg-primary-container text-on-primary-container",
            ].join(" ")}
          >
            <Icon size={28} strokeWidth={1.75} aria-hidden="true" />
          </span>

          <div className="space-y-space-sm">
            {view.status && (
              <p className="font-mono text-sm tracking-wide text-on-surface-variant">
                Error {view.status}
              </p>
            )}
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-heading text-2xl font-bold text-on-surface outline-none"
            >
              {view.title}
            </h1>
            <p className="text-sm text-on-surface-variant">{view.message}</p>
          </div>

          <div className="flex flex-col justify-center gap-space-sm sm:flex-row">
            {view.action === "reload" && (
              <>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={PRIMARY_BUTTON}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  Try again
                </button>
                <Link to="/" className={SECONDARY_BUTTON}>
                  <Home size={16} aria-hidden="true" />
                  Go home
                </Link>
              </>
            )}

            {view.action === "home" && (
              <>
                <Link to="/" className={PRIMARY_BUTTON}>
                  <Home size={16} aria-hidden="true" />
                  Go home
                </Link>
                {view.canGoBack && (
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className={SECONDARY_BUTTON}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Go back
                  </button>
                )}
              </>
            )}

            {view.action === "signIn" && (
              <Link to="/auth/login" className={PRIMARY_BUTTON}>
                Sign in
              </Link>
            )}
          </div>

          {details && (
            <details className="text-left">
              <summary className="cursor-pointer text-xs text-on-surface-variant">
                Technical details (development only)
              </summary>
              <pre className="mt-space-sm max-h-48 overflow-auto rounded-sm border border-outline-variant/40 bg-surface p-space-sm text-xs text-on-surface-variant">
                {details}
              </pre>
            </details>
          )}
        </div>
      </div>
    </main>
  );
};

export default ErrorElement;