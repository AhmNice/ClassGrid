import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmailInput, FormError, PasswordInput, SubmitButton } from "./AuthForm";
import AuthLayout from "./AuthLayout";
import {
  AUTH_ROUTES,
  FOCUS_RING,
  cx,
  showServerFailure,
  type ActionResult,
} from "./authUi";
import { useAuthStore } from "../../store/auth.store";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginProps {
  schoolName?: string;
  onSubmit?: (values: LoginFormValues) => Promise<ActionResult>;
}

const FALLBACK_ERROR = "Could not sign you in. Try again.";

const Login = ({ schoolName, onSubmit }: LoginProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const storedLocation = sessionStorage.getItem("redirect_to");
  const from =
    (location.state as { from?: string } | null)?.from || storedLocation || AUTH_ROUTES.home;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const submit = async (values: LoginFormValues) => {
    try {
      const payload = { ...values, email: values.email.trim() };
      const result = onSubmit
        ? await onSubmit(payload)
        : await login(payload);

      if (result.success) {
        navigate(from, { replace: true });
        return;
      }
      showServerFailure(setError, result, ["email", "password"], FALLBACK_ERROR);
    } catch {
      setError("root.server", { message: FALLBACK_ERROR });
    }
  };

  return (
    <AuthLayout
      schoolName={schoolName}
      title="Sign in"
      description="Use the account your school set up for you."
      footer={
        <p>Don’t have an account? Ask your school admin to invite you.</p>
      }
    >
      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="space-y-space-lg"
      >
        <FormError message={errors.root?.server?.message} />

        <EmailInput
          autoFocus
          placeholder="you@school.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Enter your email",
            validate: (value) =>
              /^\S+@\S+\.\S+$/.test(value.trim()) ||
              "Enter a valid email address",
          })}
        />

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          labelAction={
            <Link
              to={AUTH_ROUTES.forgotPassword}
              className={cx(
                "rounded-sm text-sm text-primary hover:underline",
                FOCUS_RING
              )}
            >
              Forgot password?
            </Link>
          }
          {...register("password", {
            required: "Enter your password",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
        />

        <SubmitButton loading={isSubmitting} loadingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default Login;