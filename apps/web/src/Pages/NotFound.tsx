// src/pages/NotFound.tsx
import { ArrowLeft, Compass, Home } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
      {/* Soft background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary-accent/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-xl text-center">
        {/* Eyebrow badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1">
          <Compass size={14} className="text-primary" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-on-surface-variant">
            Error 404
          </span>
        </div>

        {/* Big number */}
        <h1
          aria-hidden="true"
          className="select-none bg-gradient-to-b from-primary to-primary-accent bg-clip-text text-[7rem] font-bold leading-none tracking-tight text-transparent sm:text-[9rem]"
        >
          404
        </h1>

        {/* Headline */}
        <h2 className="mt-2 text-2xl font-semibold text-on-surface sm:text-3xl">
          This page wandered off the timetable.
        </h2>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
          The page you're looking for doesn't exist, was moved, or is
          temporarily unavailable. Let's get you back on schedule.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/40 bg-surface px-5 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container sm:w-auto"
          >
            <ArrowLeft size={16} />
            Go back
          </button>

          <Link
            to="/overview"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-hover sm:w-auto"
          >
            <Home size={16} />
            Back to dashboard
          </Link>
        </div>

        {/* Helper links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-on-surface-variant/70">
          <Link to="/timetables" className="transition-colors hover:text-primary">
            Timetables
          </Link>
          <span className="h-1 w-1 rounded-full bg-outline-variant/60" />
          <Link to="/classes" className="transition-colors hover:text-primary">
            Classes
          </Link>
          <span className="h-1 w-1 rounded-full bg-outline-variant/60" />
          <Link to="/teachers" className="transition-colors hover:text-primary">
            Teachers
          </Link>
          <span className="h-1 w-1 rounded-full bg-outline-variant/60" />
          <Link to="/generate" className="transition-colors hover:text-primary">
            Generate
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;