import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NAV_SECTIONS } from "../config/navigation";

interface Crumb {
  label: string;
  /** Omitted for the current page and for the section crumb, which has no page. */
  to?: string;
}

const ROOT_PATH = "/overview";
const ROOT_LABEL = "Dashboard";

/** Custom labels for specific nested routes. Keys use ":id" for dynamic segments. */
const BREADCRUMB_OVERRIDES: Record<string, { label: string; hide?: boolean }> =
  {
    "/timetables/:id": { label: "View Timetable" },
    "/timetables/:id/edit": { label: "Edit Timetable" },
  };

/** UUIDs (36 chars) and Mongo-style 24-char hex ids. */
const isId = (segment: string) =>
  /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment) ||
  /^[0-9a-f]{24}$/i.test(segment);

/** "term-2" -> "Term 2". Used for dynamic segments like ids or "new". */
const humanize = (segment: string) => {
  let text = segment;
  try {
    text = decodeURIComponent(segment);
  } catch {
    // Malformed escape sequence: fall back to the raw segment.
  }
  text = text.replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Builds: Dashboard > Section > Page > (any deeper segments).
 * Matches nested routes too, so /teachers/new gives
 * Dashboard > Curriculum > Teachers > New.
 */
const buildCrumbs = (rawPathname: string): Crumb[] => {
  // Normalize trailing slashes ("/overview/" -> "/overview").
  const pathname =
    rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;

  if (pathname === ROOT_PATH) {
    return [{ label: ROOT_LABEL }];
  }

  for (const section of NAV_SECTIONS) {
    for (const item of section.links) {
      if (!item.path) continue;

      const isMatch =
        pathname === item.path || pathname.startsWith(`${item.path}/`);

      if (!isMatch) continue;

      const extra = pathname.slice(item.path.length).split("/").filter(Boolean);

      // e.g. "/timetables/:id/edit" (note the "/" between path and segments).
      const routePattern = [
        item.path,
        ...extra.map((segment) => (isId(segment) ? ":id" : segment)),
      ].join("/");

      const override = BREADCRUMB_OVERRIDES[routePattern];

      const crumbs: Crumb[] = [
        { label: ROOT_LABEL, to: ROOT_PATH },
        { label: section.title },
        {
          label: item.label,
          to: extra.length > 0 ? item.path : undefined,
        },
      ];

      if (override) {
        if (!override.hide) {
          crumbs.push({ label: override.label });
        }
      } else {
        extra.forEach((segment, i) => {
          // Never display ID-like segments.
          if (isId(segment)) return;

          crumbs.push({
            label: humanize(segment),
            to: `${item.path}/${extra.slice(0, i + 1).join("/")}`,
          });
        });
      }

      // The last crumb is always the current page, so it is never a link.
      crumbs[crumbs.length - 1] = {
        ...crumbs[crumbs.length - 1],
        to: undefined,
      };

      return crumbs;
    }
  }

  return [];
};

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5 px-8 py-2 text-sm text-on-surface-variant">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;

          return (
            <li
              key={`${crumb.label}-${i}`}
              className={
                isLast
                  ? "flex min-w-0 items-center gap-1.5"
                  : "flex shrink-0 items-center gap-1.5"
              }
            >
              {i > 0 && (
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  className="shrink-0 text-on-surface-variant/60"
                />
              )}

              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="rounded transition-colors hover:text-on-surface hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={
                    isLast ? "truncate font-medium text-on-surface" : undefined
                  }
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;