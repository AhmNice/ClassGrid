import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";

import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: false,
  speed: 500,
  minimum: 0.2,
});

export default function TopLoader() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();

    const timeout = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [location.pathname]);

  return null;
}