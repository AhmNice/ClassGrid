import { WifiLow, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNetworkStatus, type NetworkState } from "./useNetworkStatus";

// A slow reading must last this long before we warn, so a brief dip in signal
// doesn't make the banner flicker. Going offline is shown straight away.
const SLOW_DELAY_MS = 3000;

const VIEWS = {
  offline: {
    Icon: WifiOff,
    message: "No internet connection. Your work might not be saved.",
    className: "bg-error-container text-on-error-container",
  },
  slow: {
    Icon: WifiLow,
    message:
      "Your internet connection is slow. Changes may take longer to save.",
    className: "bg-warning-container text-on-warning-container",
  },
} as const;

const NetworkBanner = () => {
  const status = useNetworkStatus();

  // What is actually on screen. It lags `status` only for the slow case.
  const [shown, setShown] = useState<NetworkState>("online");

  useEffect(() => {
    if (status === "online") {
      setTimeout(() => setShown("online"), 0);
      return;
    }

    const timer = setTimeout(
      () => setShown(status),
      status === "slow" ? SLOW_DELAY_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [status]);

  if (shown === "online") return null;

  const { Icon, message, className } = VIEWS[shown];

  return (
    <div
      // Offline interrupts screen readers; slow is announced politely.
      role={shown === "offline" ? "alert" : "status"}
      className={`sticky top-0 z-60 flex items-center justify-center gap-space-sm px-space-lg py-space-sm text-center text-sm font-medium ${className}`}
    >
      <Icon size={16} aria-hidden="true" className="shrink-0" />
      <p>{message}</p>
    </div>
  );
};

export default NetworkBanner;
