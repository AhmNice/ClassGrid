import { Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useId, useState } from "react";
import { FOCUS_RING, INPUT, borderFor, cx } from "./authUi";

/* ------------------------------ password input ----------------------------- */

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  /** Helper text, hidden while there is an error. */
  hint?: string;
  /** Sits opposite the label, for example a "Forgot password?" link. */
  labelAction?: React.ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { label, error, hint, labelAction, id, className, ...props },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const [visible, setVisible] = useState(false);

    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className="space-y-space-xs">
        <div className="flex items-center justify-between gap-space-md">
          <label htmlFor={inputId} className="text-sm font-medium text-on-surface">
            {label}
          </label>
          {labelAction}
        </div>

        <div className="relative">
          <input
            {...props}
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cx(INPUT, "pr-11", borderFor(!!error), className)}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className={cx(
              "absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-sm text-on-surface-variant transition-colors hover:text-on-surface motion-reduce:transition-none",
              FOCUS_RING,
            )}
          >
            {visible ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-xs text-error">
            {error}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="text-xs text-on-surface-variant">
              {hint}
            </p>
          )
        )}
      </div>
    );
  },
);

/* -------------------------------- email input ------------------------------ */

interface EmailInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  function EmailInput({ label = "Email", error, id, className, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-space-xs">
        <label htmlFor={inputId} className="text-sm font-medium text-on-surface">
          {label}
        </label>
        <input
          {...props}
          ref={ref}
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cx(INPUT, borderFor(!!error), className)}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

/* ---------------------------- banner and button ---------------------------- */

export const FormError = ({ message }: { message?: string }) =>
  message ? (
    <p
      role="alert"
      className="rounded-sm bg-error-container px-space-md py-space-sm text-sm text-on-error-container"
    >
      {message}
    </p>
  ) : null;

interface SubmitButtonProps {
  loading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const SubmitButton = ({
  loading,
  loadingLabel,
  children,
  fullWidth = true,
}: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={loading}
    className={cx(
      "cursor-pointer rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
      fullWidth && "w-full",
      FOCUS_RING,
    )}
  >
    {loading ? loadingLabel : children}
  </button>
);
