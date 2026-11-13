import React from "react";
import { useAuthStore } from "../store/auth.store";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FancyLoader } from "../loader/Loader1";

type ProtectedProps = {
  children?: React.ReactNode;
};

const FullScreenLoader = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center h-screen gap-3 bg-background">
    {/* <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" /> */}
    <FancyLoader label={label} />
    <p className="font-body text-body-sm text-on-surface-variant" role="status">
      {label}
    </p>
  </div>
);

const ProtectedRoute = ({ children }: ProtectedProps) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  // const loadingUser = useAuthStore((s) => s.loading);
  const location = useLocation();

  // Either flag means we don't yet know if there's a valid session -
  // never render protected content (or redirect) until both resolve.
  if (isAuthenticating) {
    return (
      <FullScreenLoader
        label={isAuthenticating ? "Signing you in…" : "Loading your account…"}
      />
    );
  }

  if (!user) {
    sessionStorage.setItem("redirect_to", location.pathname + location.search);
    return (
      <Navigate
        to="/auth/login"
        state={{
          from: location,
          message: "You must be logged in to access this page.",
        }}
        replace
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
