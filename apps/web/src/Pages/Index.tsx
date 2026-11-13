import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const RootIndex = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return <Navigate to={isAuthenticated ? "/overview" : "/auth/login"} replace />;
};
export default RootIndex;