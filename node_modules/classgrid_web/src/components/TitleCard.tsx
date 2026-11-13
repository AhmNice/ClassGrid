import { History, Plus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface SecondaryAction {
  label: string;
  /** A path to go to, or a function to run when the button is clicked. */
  to: string | (() => void);
  icon?: ReactNode;
}

interface TitleCardProps {
  showActionButton?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onButtonClick?: () => void;
  /** Quiet link next to the main button. Pass `null` to hide it. */
  secondaryAction?: SecondaryAction | null;
  PrimaryIcon?: LucideIcon;
}

const FOCUS_RING = [
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-primary-container",
].join(" ");

// Shared by the secondary link and the secondary button.
const SECONDARY_CLASS = [
  "inline-flex cursor-pointer items-center justify-center gap-space-sm rounded-sm border border-on-primary-container/40 px-space-lg py-space-sm",
  "text-sm font-medium text-on-primary-container transition-colors hover:bg-on-primary-container/10",
  "motion-reduce:transition-none",
  FOCUS_RING,
].join(" ");

const TitleCard = ({
  showActionButton = true,
  title = "Academic sessions & terms",
  description = "Manage school academic calendars, term date boundaries, working week definitions, and active cycle states for timetable compilation.",
  actionLabel = "Add new session",
  onButtonClick,
  secondaryAction = { label: "Past sessions", to: "/sessions/past" },
  PrimaryIcon = Plus,
}: TitleCardProps) => {
  // The icon and label are the same for a link and a button.
  const secondaryContent = secondaryAction && (
    <>
      <span aria-hidden="true" className="inline-flex">
        {secondaryAction.icon ?? <History size={16} strokeWidth={2} />}
      </span>
      {secondaryAction.label}
    </>
  );

  return (
    <section className="flex w-full flex-col gap-space-md rounded-sm bg-primary-container p-space-lg sm:flex-row sm:items-center sm:justify-between sm:gap-space-lg">
      <div className="min-w-0 max-w-2xl">
        <h1 className="font-heading text-2xl font-bold text-on-primary-container">
          {title}
        </h1>
        <p className="mt-space-xs text-sm leading-relaxed text-on-primary-container">
          {description}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-space-sm self-start sm:self-center">
        {secondaryAction &&
          (typeof secondaryAction.to === "string" ? (
            <Link to={secondaryAction.to} className={SECONDARY_CLASS}>
              {secondaryContent}
            </Link>
          ) : (
            <button
              type="button"
              onClick={secondaryAction.to}
              className={SECONDARY_CLASS}
            >
              {secondaryContent}
            </button>
          ))}

        {showActionButton && (
          <button
            type="button"
            onClick={onButtonClick}
            className={[
              "inline-flex cursor-pointer items-center justify-center gap-space-sm rounded-sm bg-primary px-space-lg py-space-sm",
              "text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover",
              "motion-reduce:transition-none",
              FOCUS_RING,
            ].join(" ")}
          >
            <PrimaryIcon size={16} strokeWidth={2} aria-hidden="true" />
            {actionLabel}
          </button>
        )}
      </div>
    </section>
  );
};

export default TitleCard;
