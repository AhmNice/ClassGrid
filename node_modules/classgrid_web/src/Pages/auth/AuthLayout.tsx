import { LayoutGrid } from "lucide-react";
import React from "react";

interface AuthLayoutProps {
  /** Shown on the brand panel when the app is set up for one school. */
  schoolName?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Small text under the form, such as a link back to sign in. */
  footer?: React.ReactNode;
}

const GRID_PATTERN: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgb(255 255 255 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.07) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

const AuthLayout = ({
  schoolName,
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) => {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-2">
      {/* Brand panel (large screens only) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#00236f] via-[#1e3a8a] to-[#316bf3] p-space-xl text-white lg:flex">
        {/* The grid lines are their own layer so they sit on the gradient
            instead of replacing it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={GRID_PATTERN}
        />

        <div className="relative flex items-center gap-space-sm">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
            <LayoutGrid size={18} aria-hidden="true" />
          </span>
          <span className="font-heading text-lg font-semibold">ClassGrid</span>
        </div>

        <div className="relative max-w-md space-y-space-md">
          <h2 className="font-heading text-4xl font-bold leading-tight">
            Timetables without the clashes.
          </h2>
          <p className="text-base text-white/90">
            Set up sessions and terms, assign teachers and rooms, and publish a
            timetable your whole school can rely on.
          </p>
        </div>

        <p className="relative text-sm text-white/90">
          {schoolName ? schoolName : "Secondary school timetable scheduler"}
        </p>
      </aside>

      {/* Form column */}
      <section className="flex items-center justify-center p-space-lg">
        <div className="w-full max-w-sm space-y-space-xl">
          {/* Brand row for small screens */}
          <div className="flex items-center gap-space-sm lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-on-primary">
              <LayoutGrid size={18} aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="font-heading text-base font-semibold text-on-surface">
                ClassGrid
              </p>
              {schoolName && (
                <p className="text-xs text-on-surface-variant">{schoolName}</p>
              )}
            </div>
          </div>

          <header className="space-y-space-xs">
            <h1 className="font-heading text-2xl font-bold text-on-surface">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-on-surface-variant">{description}</p>
            )}
          </header>

          {children}

          {footer && <div className="text-sm text-on-surface-variant">{footer}</div>}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
