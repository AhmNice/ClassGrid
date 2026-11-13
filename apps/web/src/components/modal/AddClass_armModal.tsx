import { useForm } from "react-hook-form";
import type {
  ClassStage,
  IClassLevel,
  IClassLevelCreate,
} from "../../interface/class.interface";
import type { IClassArmCreate } from "../../interface/classArm.interface";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Field } from "../../utils/formHelper";

/** The few fields the arm form needs from a class level. */
interface ClassLevelOption {
  id: string;
  name: string;
}

/** What is sent when editing a class level: only the fields that changed. */
export type ClassLevelUpdate = Partial<IClassLevelCreate>;

type ModalProps =
  | {
      type: "CLASS";
      /** Pass a class level to edit it; leave out to create one. */
      classLevel?: IClassLevel;
      onClose: () => void;
      onSubmit?: (
        values: IClassLevelCreate | ClassLevelUpdate,
      ) => void | Promise<void>;
    }
  | {
      type: "ARM";
      /** The class levels an arm can belong to. */
      classLevels: ClassLevelOption[];
      onClose: () => void;
      onSubmit?: (values: IClassArmCreate) => void | Promise<void>;
    };

/**
 * One form shape for both modes. Only the fields that are on screen are
 * registered, so the others are never validated or sent. (A union of two
 * shapes made `errors.rank` and `errors.classLevelId` a type error.)
 */
interface FormValues {
  name: string;
  isActive: boolean;
  classLevelId: string;
  rank: number;
  stage: ClassStage;
}

const CLASS_STAGES: ClassStage[] = ["JSS", "SS"];

/** Only the fields whose value differs from the saved class level. */
const getClassLevelChanges = (
  next: IClassLevelCreate,
  original: IClassLevel,
): ClassLevelUpdate => {
  const changes: ClassLevelUpdate = {};
  if (next.name !== original.name) changes.name = next.name;
  if (next.rank !== original.rank) changes.rank = next.rank;
  if (next.stage !== original.stage) changes.stage = next.stage;
  if (next.isActive !== original.isActive) changes.isActive = next.isActive;
  return changes;
};

const inputClass =
  "w-full rounded-sm border border-outline-variant/40 bg-surface-container px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const AddClass_armModal = (props: ModalProps) => {
  const { type, onClose } = props;
  const dialogRef = useRef<HTMLDivElement>(null);

  const isArm = type === "ARM";
  const editing = props.type === "CLASS" ? props.classLevel : undefined;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: editing?.name ?? "",
      isActive: editing?.isActive ?? true,
      classLevelId: "",
      rank: editing?.rank ?? 1,
      stage: editing?.stage ?? "JSS",
    },
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const close = () => {
    if (!isSubmitting) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), select:not([disabled])",
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

  const submit = handleSubmit(async (values) => {
    const name = values.name.trim();

    try {
      // Checking `props.type` (not `isArm`) lets TypeScript pick the right
      // onSubmit, so no casts are needed.
      if (props.type === "ARM") {
        await props.onSubmit?.({
          classLevelId: values.classLevelId,
          name,
          isActive: values.isActive,
        });
      } else {
        const payload: IClassLevelCreate = {
          name,
          rank: values.rank,
          isActive: values.isActive,
          stage: values.stage,
        };

        if (editing) {
          const changes = getClassLevelChanges(payload, editing);
          // Nothing changed, so there is nothing to save.
          if (Object.keys(changes).length === 0) {
            close();
            return;
          }
          await props.onSubmit?.(changes);
        } else {
          await props.onSubmit?.(payload);
        }
      }
      close();
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error ? err.message : "Something went wrong. Try again.",
      });
    }
  });

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay-bg) p-space-lg"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-class-arm-title"
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-md border border-outline-variant/40 bg-surface p-6 shadow-lg"
      >
        <h2
          id="add-class-arm-title"
          className="mb-4 text-lg font-semibold text-on-surface"
        >
          {isArm ? "Add Class Arm" : editing ? "Edit Class Level" : "Add Class Level"}
        </h2>

        <form onSubmit={submit} className="space-y-4" noValidate>
          {props.type === "ARM" ? (
            <>
              <Field
                label="Class Level"
                htmlFor="arm-classLevelId"
                error={errors.classLevelId?.message}
                hint="The parent class level this arm belongs to."
              >
                <select
                  id="arm-classLevelId"
                  className={inputClass}
                  aria-invalid={!!errors.classLevelId}
                  aria-describedby={
                    errors.classLevelId
                      ? "arm-classLevelId-error"
                      : "arm-classLevelId-hint"
                  }
                  {...register("classLevelId", {
                    required: "Class level is required",
                  })}
                >
                  <option value="">Select a class level</option>
                  {props.classLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Arm Name"
                htmlFor="arm-name"
                error={errors.name?.message}
                hint="e.g. A, B, Blue, Gold"
              >
                <input
                  id="arm-name"
                  type="text"
                  placeholder="Enter arm name"
                  autoComplete="off"
                  className={inputClass}
                  aria-invalid={!!errors.name}
                  aria-describedby={
                    errors.name ? "arm-name-error" : "arm-name-hint"
                  }
                  {...register("name", {
                    validate: (value) =>
                      value.trim().length > 0 || "Arm name is required",
                  })}
                />
              </Field>
            </>
          ) : (
            <>
              <Field
                label="Class Name"
                htmlFor="class-name"
                error={errors.name?.message}
                hint="e.g. JSS 1, SS 2"
              >
                <input
                  id="class-name"
                  type="text"
                  placeholder="Enter class name"
                  autoComplete="off"
                  className={inputClass}
                  aria-invalid={!!errors.name}
                  aria-describedby={
                    errors.name ? "class-name-error" : "class-name-hint"
                  }
                  {...register("name", {
                    validate: (value) =>
                      value.trim().length > 0 || "Class name is required",
                  })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Stage"
                  htmlFor="class-stage"
                  error={errors.stage?.message}
                >
                  <select
                    id="class-stage"
                    className={inputClass}
                    aria-invalid={!!errors.stage}
                    aria-describedby={
                      errors.stage ? "class-stage-error" : undefined
                    }
                    {...register("stage", {
                      required: "Stage is required",
                    })}
                  >
                    {CLASS_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Rank"
                  htmlFor="class-rank"
                  error={errors.rank?.message}
                  hint="Order within the stage"
                >
                  <input
                    id="class-rank"
                    type="number"
                    min={1}
                    className={inputClass}
                    aria-invalid={!!errors.rank}
                    aria-describedby={
                      errors.rank ? "class-rank-error" : "class-rank-hint"
                    }
                    {...register("rank", {
                      required: "Rank is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Rank must be at least 1" },
                    })}
                  />
                </Field>
              </div>
            </>
          )}

          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              className="h-4 w-4 rounded-sm border-outline-variant text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("isActive")}
            />
            Active
          </label>

          {errors.root?.server && (
            <p role="alert" className="text-xs text-error">
              {errors.root.server.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              disabled={isSubmitting}
              className="cursor-pointer rounded-sm px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="cursor-pointer rounded-sm bg-primary px-3 py-2 text-sm font-medium text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isSubmitting ? "Saving..." : editing ? "Save changes" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default AddClass_armModal;