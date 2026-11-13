import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const SessionChecker = () => {
  const lastCheckTimeRef = useRef<number>(0);
  const location = useLocation();
  const isCheckingRef = useRef<boolean>(false);
  const authenticate = useAuthStore((s) => s.authenticate);
  useEffect(() => {
    let isMounted = true;
    const performSessionCheck = async () => {
      const now = Date.now();

      if (isCheckingRef.current || now - lastCheckTimeRef.current < 9000) {
        return;
      }
      if (!isMounted || isCheckingRef.current) return;
      isCheckingRef.current = true;
      lastCheckTimeRef.current = Date.now();

      try {
        await authenticate();
      } catch (error) {
        console.log("Error during session check:", error);
      } finally {
        if (isMounted) {
          isCheckingRef.current = false;
        }
      }
    };
    performSessionCheck();
    const interval = setInterval(() => performSessionCheck(), 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname, authenticate]);
  return null;
};

export default SessionChecker;
