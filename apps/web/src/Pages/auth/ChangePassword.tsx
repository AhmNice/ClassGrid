import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { FormError, PasswordInput, SubmitButton } from "./AuthForm";
import { showServerFailure, wait, type ActionResult } from "./authUi";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordProps {
  /** Replace with your real "change password" call. */
  onSubmit?: (values: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<ActionResult>;
}

// For previewing the design only.
//  - current password "wrong-password" -> error under that field
//  - anything else                     -> success
const mockChange = async (values: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> => {
  await wait(600);

  if (values.currentPassword === "wrong-password") {
    return {
      success: false,
      message: "Check your details",
      data: [
        { field: "currentPassword", message: "Your current password is incorrect" },
      ],
    };
  }
  return { success: true };
};

const FALLBACK_ERROR = "Could not change your password. Try again.";

const ChangePassword = ({ onSubmit = mockChange }: ChangePasswordProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const submit = async ({
    currentPassword,
    newPassword,
  }: ChangePasswordFormValues) => {
    try {
      const result = await onSubmit({ currentPassword, newPassword });

      if (result.success) {
        toast.success("Password updated");
        reset();
        return;
      }
      showServerFailure(
        setError,
        result,
        ["currentPassword", "newPassword"],
        FALLBACK_ERROR,
      );
    } catch {
      setError("root.server", { message: FALLBACK_ERROR });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-space-lg">
      <header className="space-y-space-xs">
        <h1 className="font-heading text-2xl font-bold text-on-surface">
          Change password
        </h1>
        <p className="text-sm text-on-surface-variant">
          Enter your current password, then choose a new one.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="space-y-space-lg rounded-sm border border-outline-variant/40 bg-surface p-space-lg"
      >
        <FormError message={errors.root?.server?.message} />

        <PasswordInput
          label="Current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword", {
            required: "Enter your current password",
          })}
        />

        <PasswordInput
          label="New password"
          autoComplete="new-password"
          hint="Use at least 8 characters."
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: "Enter a new password",
            minLength: { value: 8, message: "Use at least 8 characters" },
            validate: (value) =>
              value !== getValues("currentPassword") ||
              "Choose a password different from your current one",
            // Re-check the confirmation once one has been typed.
            onChange: () => {
              if (getValues("confirmPassword")) trigger("confirmPassword");
            },
          })}
        />

        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Confirm your new password",
            validate: (value) =>
              value === getValues("newPassword") || "Passwords don’t match",
          })}
        />

        <div className="flex justify-end">
          <SubmitButton loading={isSubmitting} loadingLabel="Saving…" fullWidth={false}>
            Change password
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
