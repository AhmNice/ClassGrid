import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { EmailInput, FormError, SubmitButton } from "./AuthForm";
import AuthLayout from "./AuthLayout";
import {
  AUTH_ROUTES,
  FOCUS_RING,
  cx,
  showServerFailure,
  wait,
  type ActionResult,
} from "./authUi";

interface ForgotPasswordFormValues {
  email: string;
}

interface ForgotPasswordProps {
  schoolName?: string;
  /** Replace with your real "send reset link" call. */
  onSubmit?: (email: string) => Promise<ActionResult>;
}

// For previewing the design only: always succeeds.
const mockSendLink = async (): Promise<ActionResult> => {
  await wait(600);
  return { success: true };
};

const FALLBACK_ERROR = "Could not send the reset link. Try again.";

const BackToSignIn = () => (
  <Link
    to={AUTH_ROUTES.login}
    className={cx(
      "inline-flex items-center gap-space-xs rounded-sm text-sm text-on-surface-variant transition-colors hover:text-on-surface motion-reduce:transition-none",
      FOCUS_RING,
    )}
  >
    <ArrowLeft size={16} aria-hidden="true" />
    Back to sign in
  </Link>
);

const ForgotPassword = ({ schoolName, onSubmit = mockSendLink }: ForgotPasswordProps) => {
  // Set once the link has been requested.
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ defaultValues: { email: "" } });

  const submit = async ({ email }: ForgotPasswordFormValues) => {
    const address = email.trim();
    try {
      const result = await onSubmit(address);
      if (result.success) {
        setSentTo(address);
        return;
      }
      showServerFailure(setError, result, ["email"], FALLBACK_ERROR);
    } catch {
      setError("root.server", { message: FALLBACK_ERROR });
    }
  };

  if (sentTo) {
    return (
      <AuthLayout
        schoolName={schoolName}
        title="Check your email"
        description="If your email matches an account, a link to reset your password is on its way."
      >
        <div className="space-y-space-lg">
          <div className="flex items-start gap-space-md rounded-sm bg-surface-container p-space-md">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-container text-on-primary-container">
              <MailCheck size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 text-sm">
              <p className="text-on-surface-variant">We sent it to</p>
              <p className="truncate font-medium text-on-surface">{sentTo}</p>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant">
            It can take a minute to arrive. Check your spam folder if you don’t
            see it.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <BackToSignIn />
            <button
              type="button"
              onClick={() => {
                reset();
                setSentTo(null);
              }}
              className={cx(
                "cursor-pointer rounded-sm text-sm text-primary hover:underline",
                FOCUS_RING,
              )}
            >
              Use a different email
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      schoolName={schoolName}
      title="Forgot your password?"
      description="Enter the email you sign in with and we’ll send you a link to reset it."
      footer={<BackToSignIn />}
    >
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-space-lg">
        <FormError message={errors.root?.server?.message} />

        <EmailInput
          autoFocus
          placeholder="you@school.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Enter your email",
            validate: (value) =>
              /^\S+@\S+\.\S+$/.test(value.trim()) || "Enter a valid email address",
          })}
        />

        <SubmitButton loading={isSubmitting} loadingLabel="Sending…">
          Send reset link
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;