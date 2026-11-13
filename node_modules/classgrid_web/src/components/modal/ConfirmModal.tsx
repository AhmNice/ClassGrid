import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const ConfirmModal = ({
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  const uid = useId();
  const titleId = `${uid}-title`;
  const messageId = `${uid}-message`;

  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock scroll, focus the cancel button, restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current
      ?.querySelector<HTMLElement>("[data-autofocus]")
      ?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  // Escape closes; Tab stays inside the dialog.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
      ) ?? [],
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay-bg) p-space-lg"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={handleKeyDown}
        className="w-full max-w-md overflow-hidden rounded-xl bg-surface shadow-xl"
      >
        <div className="space-y-space-sm p-space-lg">
          <h2
            id={titleId}
            className="font-heading text-lg font-semibold text-on-surface"
          >
            {title}
          </h2>
          <p id={messageId} className="text-sm text-on-surface-variant">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-space-sm border-t border-outline-variant/30 p-space-lg">
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className={`rounded-sm px-space-lg py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container motion-reduce:transition-none ${FOCUS_RING}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-sm px-space-lg py-space-sm text-sm font-medium transition-colors motion-reduce:transition-none ${FOCUS_RING} ${
              destructive
                ? "bg-error text-on-error hover:bg-error/90"
                : "bg-primary text-on-primary hover:bg-primary-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;