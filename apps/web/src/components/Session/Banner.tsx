import { CalendarDays, CalendarRange, Layers } from "lucide-react";
import React from "react";

interface BannerProps {
  /** Defaults match the current mock data so the banner renders on its own. */
  sessionName?: string;
  dateRange?: string;
  instructionalWeeks?: number;
  termCount?: number;
  termLabel?: string;
  currentWeek?: number;
  totalWeeks?: number;
  clashes?: number;
  locked?: boolean;
}

const Banner = ({
  sessionName = "2026/2027 academic session",
  dateRange = "Sept 15, 2026 – July 24, 2027",
  instructionalWeeks = 39,
  termCount = 3,
  termLabel = "Term 1",
  currentWeek = 6,
  totalWeeks = 13,
  clashes = 0,
  locked = true,
}: BannerProps) => {
  const percent =
    totalWeeks > 0
      ? Math.min(100, Math.max(0, Math.round((currentWeek / totalWeeks) * 100)))
      : 0;

  return (
    <section
      aria-labelledby="banner-title"
      className="flex flex-col gap-space-lg rounded-sm bg-linear-to-br from-[#00236f] via-[#1e3a8a] to-[#316bf3] p-space-lg text-white lg:flex-row lg:items-center lg:justify-between"
    >
      {/* Current session */}
      <div className="min-w-0 space-y-space-sm">
        <div className="flex flex-wrap items-center gap-space-sm text-xs">
          <span className="rounded-full font-mono bg-white/15 px-space-sm py-space-xs font-medium">
            Current live cycle
          </span>
          <span className="inline-flex font-mono items-center gap-space-xs text-white/90">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-white motion-safe:animate-pulse"
            />
            Synced with master timetable
          </span>
        </div>

        <h2
          id="banner-title"
          className="font-heading text-2xl font-bold text-white"
        >
          {sessionName}
        </h2>

        <ul className="flex flex-wrap items-center gap-x-space-lg gap-y-space-xs text-sm text-white/90">
          <li className="inline-flex font-mono items-center gap-space-xs">
            <CalendarDays size={16} aria-hidden="true" />
            {dateRange}
          </li>
          <li className="inline-flex font-mono items-center gap-space-xs">
            <CalendarRange size={16} aria-hidden="true" />
            {instructionalWeeks} instructional weeks
          </li>
          <li className="inline-flex font-mono items-center gap-space-xs">
            <Layers size={16} aria-hidden="true" />
            {termCount} terms
          </li>
        </ul>
      </div>

      {/* Progress and clashes */}
      <div className="flex shrink-0 flex-row gap-space-md sm:flex-row ">
        <div className="rounded-sm bg-secondary-container/20 p-space-md sm:min-w-60 w-90">
          <div className="mb-space-sm flex items-center justify-between gap-space-md text-sm">
            <span className="text-white/90 font-mono">{termLabel} progress</span>
            <span className="font-semibold font-mono">
              Week {currentWeek} of {totalWeeks}
            </span>
          </div>

          <div
            role="progressbar"
            aria-label={`${termLabel} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mb-space-sm h-2 overflow-hidden rounded-full bg-white/25"
          >
            <div
              className="h-full rounded-full bg-orange-400 transition-all duration-300 motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="text-xs text-white/90 font-mono">{percent}% of term elapsed</p>
        </div>

        <div className="flex flex-col justify-center rounded-sm bg-secondary-container/20 p-space-md sm:min-w-32">
          <span className="text-sm text-white/90 font-mono">Timetable clashes</span>
          <span className="font-heading text-2xl font-bold ">{clashes}</span>
          <span className="text-xs text-white/90 font-mono">
            {locked ? "Timetable locked" : "Timetable unlocked"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Banner;

