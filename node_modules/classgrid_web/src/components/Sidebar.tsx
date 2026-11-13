import {
  ChevronDown,
  Dot,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  School,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  NAV_SECTIONS,
  type NavItem,
  type NavSection,
} from "../config/navigation";
import { useSidebar } from "../context/SidebarContext";

/* --------------------------------- helpers -------------------------------- */

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/* ---------------------------------- types --------------------------------- */

interface SidebarProps {
  /** Name of the school currently being scheduled. */
  schoolName?: string;
}

interface LinkItemProps {
  link: NavItem;
  expanded: boolean;
  onNavigate: () => void;
}

interface SectionProps {
  section: NavSection;
  index: number;
  expanded: boolean;
  onNavigate: () => void;
}

/* ------------------------------ subcomponents ----------------------------- */

const LinkItem = ({ link, expanded, onNavigate }: LinkItemProps) => {
  const Icon = link.icon;
  const hasChildren = Boolean(link.children?.length);

  // Only group items (with children) get local open state.
  const [open, setOpen] = useState(false);

  const baseClasses = cx(
    "group relative flex h-10 w-full items-center rounded-lg text-sm",
    "transition-colors duration-200 motion-reduce:transition-none",
    FOCUS_RING,
    expanded ? "gap-3 px-3" : "justify-center",
  );

  const idleClasses =
    "text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface";

  const activeClasses =
    "bg-primary font-medium text-on-primary hover:bg-primary-hover";

  // Shared row content for link, button, and toggle variants.
  const row = (isActive: boolean, isOpen = false) => (
    <>
      <Icon
        size={20}
        strokeWidth={isActive ? 2.25 : 1.75}
        aria-hidden="true"
        className="shrink-0"
      />
      {expanded && (
        <>
          <span className="truncate whitespace-nowrap flex-1 text-left">
            {link.label}
          </span>
          {hasChildren && (
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={cx(
                "shrink-0 text-on-surface-variant/70 transition-transform duration-200 motion-reduce:transition-none",
                isOpen && "rotate-180",
              )}
            />
          )}
        </>
      )}
    </>
  );

  /* ------------------- Case 1: group with children (dropdown) ---------------- */
  if (hasChildren) {
    const childListId = `sidebar-group-${slug(link.label)}`;

    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={childListId}
          title={expanded ? undefined : link.label}
          aria-label={expanded ? undefined : link.label}
          className={cx(baseClasses, idleClasses)}
        >
          {row(false, open)}
        </button>

        {/* Grid-rows trick animates height without measuring scrollHeight. */}
        <div
          id={childListId}
          className={cx(
            "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
            open && expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
          aria-hidden={!(open && expanded)}
        >
          <div className="overflow-hidden">
            <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-outline-variant/30 pl-2 pb-1">
              {link.children!.map((child) => (
                <LinkItem
                  key={child.label}
                  link={child}
                  expanded={expanded}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        </div>
      </li>
    );
  }

  /* -------------------- Case 2: item without a path (trigger) --------------- */
  if (!link.path) {
    return (
      <li>
        <button
          type="button"
          title={expanded ? undefined : link.label}
          aria-label={expanded ? undefined : link.label}
          className={cx(baseClasses, idleClasses)}
        >
          {row(false)}
        </button>
      </li>
    );
  }

  /* ------------------------- Case 3: regular NavLink ------------------------ */
  return (
    <li>
      <NavLink
        to={link.path}
        onClick={onNavigate}
        title={expanded ? undefined : link.label}
        aria-label={expanded ? undefined : link.label}
        className={({ isActive }) =>
          cx(baseClasses, isActive ? activeClasses : idleClasses)
        }
      >
        {({ isActive }) => row(isActive)}
      </NavLink>
    </li>
  );
};

const Section = ({ section, index, expanded, onNavigate }: SectionProps) => {
  const labelId = `sidebar-section-${slug(section.title)}`;

  return (
    <div>
      {!expanded && index > 0 && (
        <div
          aria-hidden="true"
          className="mx-2 mb-3 h-px bg-outline-variant/30"
        />
      )}

      <h2
        id={labelId}
        className={
          expanded
            ? "mb-1.5 px-3 text-xs font-medium text-on-surface-variant select-none"
            : "sr-only"
        }
      >
        {section.title}
      </h2>

      <ul aria-labelledby={labelId} className="space-y-0.5">
        {section.links.map((link) => (
          <LinkItem
            key={link.label}
            link={link}
            expanded={expanded}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
};

/* ------------------------------- main sidebar ----------------------------- */

const Sidebar = ({ schoolName = "School in use" }: SidebarProps) => {
  const { isSidebarOpen, toggleSidebar, isMobile, closeSidebar } = useSidebar();
  const [session] = useState("2025/2026");
  const [term] = useState("First Term");
  const expanded = isSidebarOpen;
  const showOverlay = isMobile && isSidebarOpen;
  const hiddenOnMobile = isMobile && !isSidebarOpen;
  const ToggleIcon = expanded ? PanelLeftClose : PanelLeftOpen;

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!showOverlay) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showOverlay, closeSidebar]);

  const handleNavigate = () => {
    if (isMobile) closeSidebar();
  };

  return (
    <>
      {showOverlay && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Primary navigation"
        className={cx(
          "fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-outline-variant/20 bg-surface-container-high px-3 py-4 lg:sticky",
          "transition-[width,transform,visibility] duration-300 ease-out motion-reduce:transition-none",
          expanded ? "w-64" : "w-16",
          hiddenOnMobile
            ? "invisible -translate-x-full"
            : "visible translate-x-0",
          showOverlay && "shadow-xl",
        )}
      >
        <header
          className={cx(
            "mb-6 flex items-center",
            expanded ? "justify-between gap-2 px-1" : "flex-col gap-3",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-on-primary">
              <LayoutGrid size={18} aria-hidden="true" />
            </span>

            {expanded && (
              <div className="min-w-0 leading-tight">
                <p className="truncate font-heading text-base font-semibold text-on-surface">
                  ClassGrid
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={expanded}
            className={cx(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-on-surface-variant",
              "transition-colors hover:bg-surface-container/60 hover:text-on-surface motion-reduce:transition-none",
              FOCUS_RING,
            )}
          >
            <ToggleIcon size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </header>
        {/* school  */}
        {/* School + session/term */}
        <div
          className={cx(
            "mb-4 rounded-lg border border-outline-variant/40 bg-surface-container p-3",
            !expanded && "flex justify-center p-2",
          )}
          title={expanded ? undefined : schoolName}
        >
          {expanded ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <School
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-on-surface-variant"
                />
                <p className="truncate text-sm font-medium text-on-surface">
                  {schoolName}
                </p>
              </div>
              <p className="text-xs text-on-surface-variant pl-6 flex items-center">
                {session} <Dot/> {term}
              </p>
            </div>
          ) : (
            <School
              size={16}
              aria-hidden="true"
              className="text-on-surface-variant"
            />
          )}
        </div>
        <nav className="-mx-1 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-1 pb-2">
          {NAV_SECTIONS.map((section, index) => (
            <Section
              key={section.title}
              section={section}
              index={index}
              expanded={expanded}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
