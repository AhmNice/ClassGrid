import { LogOut, Menu as MenuIcon, Settings, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import Notification from "./Notification";
import SearchButton from "./SearchButton";
import ThemeToggle from "./ThemeToggle";

/* --------------------------------- helpers -------------------------------- */

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const SETTINGS_PATH = "/settings";

const FOCUS_RING = cx(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background"
);

const MENU_ITEM = cx(
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-on-surface",
  "transition-colors hover:bg-surface-container focus:bg-surface-container focus:outline-none",
  "motion-reduce:transition-none"
);

/* -------------------------------- user menu ------------------------------- */

interface UserMenuProps {
  onLogout?: () => void;
}

const UserMenu = ({ onLogout }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  const getItems = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );

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

  useEffect(() => {
    setTimeout(() => {
      setOpen(false)
    },100);
  }, [pathname]);

  useEffect(() => {
    if (open) getItems()[0]?.focus();
  }, [open]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = getItems();
    const index = items.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        items[(index + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        e.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case "Tab":
        requestAnimationFrame(() => setOpen(false));
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cx(
          "grid h-9 w-9 place-items-center rounded-md bg-primary text-on-primary",
          "transition-colors hover:bg-primary-container/80 motion-reduce:transition-none",
          FOCUS_RING
        )}
      >
        <User size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-outline-variant/30 bg-surface p-1 shadow-lg"
        >
          <NavLink
            to={SETTINGS_PATH}
            role="menuitem"
            className={({ isActive }) =>
              cx(MENU_ITEM, isActive && "bg-surface-container text-primary")
            }
          >
            <Settings size={16} strokeWidth={1.75} aria-hidden="true" />
            Settings
          </NavLink>

          <div aria-hidden="true" className="my-1 h-px bg-outline-variant/30" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className={MENU_ITEM}
          >
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

/* --------------------------------- header --------------------------------- */

interface HeaderProps {
  onLogout?: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const { isMobile, isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-outline-variant/20 bg-background/80 px-4 backdrop-blur lg:px-6">
      {isMobile && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open navigation"
          aria-expanded={isSidebarOpen}
          className={cx(
            "-ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-on-surface-variant",
            "transition-colors hover:bg-surface-container hover:text-on-surface motion-reduce:transition-none",
            FOCUS_RING
          )}
        >
          <MenuIcon size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <SearchButton/>
      </div>
      
      <ThemeToggle/>
      <Notification />
      <UserMenu onLogout={onLogout} />
    </header>
  );
};

export default Header;