import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FormError, PasswordInput, SubmitButton } from "./AuthForm";
import AuthLayout from "./AuthLayout";
import {
  AUTH_ROUTES,
  FOCUS_RING,
  cx,
  showServerFailure,
  wait,
  type ActionResult,
} from "./authUi";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordProps {
  schoolName?: string;
  /** Copy can be changed so the same page also works for first-time invites. */
  title?: string;
  description?: string;
  submitLabel?: string;
  /** Replace with your real "set new password" call. */
  onSubmit?: (values: { token: string; password: string }) => Promise<ActionResult>;
}

// For previewing the design only: always succeeds.
const mockReset = async (): Promise<ActionResult> => {
  await wait(600);
  return { success: true };
};

const FALLBACK_ERROR = "Could not update your password. Try again.";

const linkClass = cx("rounded-sm text-primary hover:underline", FOCUS_RING);

const ResetPassword = ({
  schoolName,
  title = "Set a new password",
  description = "Choose a password you haven’t used before.",
  submitLabel = "Update password",
  onSubmit = mockReset,
}: ResetPasswordProps) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  // A link with no token can't work, so say so instead of showing a form.
  if (!token) {
    return (
      <AuthLayout
        schoolName={schoolName}
        title="This link isn’t valid"
        description="The reset link is missing or incomplete. Request a new one to continue."
      >
        <Link
          to={AUTH_ROUTES.forgotPassword}
          className={cx(
            "inline-flex w-full items-center justify-center rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover motion-reduce:transition-none",
            FOCUS_RING,
          )}
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const submit = async ({ password }: ResetPasswordFormValues) => {
    try {
      const result = await onSubmit({ token, password });

      if (result.success) {
        toast.success("Password updated. Sign in with your new password.");
        navigate(AUTH_ROUTES.login, { replace: true });
        return;
      }
      showServerFailure(setError, result, ["password"], FALLBACK_ERROR);
    } catch {
      setError("root.server", { message: FALLBACK_ERROR });
    }
  };

  return (
    <AuthLayout
      schoolName={schoolName}
      title={title}
      description={description}
      footer={
        <p>
          Link not working?{" "}
          <Link to={AUTH_ROUTES.forgotPassword} className={linkClass}>
            Request a new one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-space-lg">
        <FormError message={errors.root?.server?.message} />

        <PasswordInput
          label="New password"
          autoComplete="new-password"
          autoFocus
          hint="Use at least 8 characters."
          error={errors.password?.message}
          {...register("password", {
            required: "Enter a new password",
            minLength: { value: 8, message: "Use at least 8 characters" },
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
              value === getValues("password") || "Passwords don’t match",
          })}
        />

        <SubmitButton loading={isSubmitting} loadingLabel="Updating…">
          {submitLabel}
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;