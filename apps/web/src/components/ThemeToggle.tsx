import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useId } from "react";
import { useThemeStore, type Theme } from "../store/theme.store";

const OPTIONS: { value: Theme; label: string; Icon: LucideIcon }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

const ThemeToggle = () => {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Radio inputs give arrow-key navigation and screen reader support for free.
  const name = useId();

  return (
    <fieldset className="inline-flex gap-space-xs rounded-sm border border-outline-variant bg-surface-container p-space-xs">
      <legend className="sr-only">Theme</legend>

      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = theme === value;
        const hint = value === "system" ? `System (currently ${resolvedTheme})` : label;

        return (
          <label key={value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={value}
              checked={isActive}
              onChange={() => setTheme(value)}
              className="peer sr-only"
            />
            <span
              title={hint}
              className={[
                "grid h-8 w-8 place-items-center rounded-sm transition-colors motion-reduce:transition-none",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                isActive
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
              ].join(" ")}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              <span className="sr-only">{hint}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
};

export default ThemeToggle;