import React from "react";
import { useAuthStore } from "../store/auth.store";
import { Navigate, useLocation } from "react-router-dom";
import { FullScreenLoader } from "../loader/Loader1";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  // const loadingUser = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (isAuthenticating ) {
    return (
      <FullScreenLoader
        label={isAuthenticating ? "Signing you in…" : "Loading your account…"}
      />
    );
  }

  if (user) {
    const statePathName = location.state?.from?.pathname || "/";
    const validPath =
      typeof statePathName === "string" && statePathName.startsWith("/")
        ? statePathName
        : null;

    const savedRedirectPath = sessionStorage.getItem("redirect_to");
    if (savedRedirectPath) {
      sessionStorage.removeItem("redirect_to");
    }
    const targetedRoute = validPath || savedRedirectPath || "/overview";

    return <Navigate to={targetedRoute} replace />;
  }
  return <>{children}</>;
};

export default GuestRoute;
