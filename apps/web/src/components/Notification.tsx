// src/components/Notification.tsx
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  time: string;
  read?: boolean;
}

const Notification = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Sample data — replace with real source.
  const items: NotificationItem[] = [];

  const unread = items.filter((n) => !n.read).length;

  // Outside click + Escape, matching UserMenu.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Close on route change.
  useEffect(() => {
    setTimeout(() => {
      setOpen(false);
    }, 100);
  }, [pathname]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cx(
          "relative grid h-9 w-9 place-items-center rounded-lg text-on-surface-variant",
          "transition-colors hover:bg-surface-container hover:text-on-surface motion-reduce:transition-none",
          FOCUS_RING,
        )}
      >
        <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[10px] font-semibold text-on-error">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 flex w-80 flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant/30 px-3 py-2.5">
            <h3 className="text-sm font-semibold text-on-surface">
              Notifications
            </h3>
            {unread > 0 && (
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-surface-container"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-container text-on-surface-variant/60">
                  <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <p className="text-sm font-medium text-on-surface">
                  You're all caught up
                </p>
                <p className="text-xs text-on-surface-variant">
                  New updates will appear here.
                </p>
              </div>
            ) : (
              <ul className="p-1">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={cx(
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left",
                        "transition-colors hover:bg-surface-container motion-reduce:transition-none",
                        FOCUS_RING,
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          n.read ? "bg-transparent" : "bg-primary",
                        )}
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium text-on-surface">
                          {n.title}
                        </span>
                        {n.body && (
                          <span className="line-clamp-2 text-xs text-on-surface-variant">
                            {n.body}
                          </span>
                        )}
                        <span className="text-[11px] text-on-surface-variant/70">
                          {n.time}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-outline-variant/30 px-3 py-2">
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-center text-xs font-medium text-primary transition-colors hover:bg-surface-container"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
