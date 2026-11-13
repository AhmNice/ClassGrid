import { useSyncExternalStore } from "react";

export type NetworkState = "online" | "slow" | "offline";

/**
 * The Network Information API. Chrome, Edge and Android browsers have it;
 * Safari and Firefox don't, and there `slow` is never reported.
 */
interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  downlink?: number;
}

const getConnection = (): NetworkInformationLike | undefined =>
  (navigator as Navigator & { connection?: NetworkInformationLike }).connection;

const readState = (): NetworkState => {
  if (!navigator.onLine) return "offline";

  const connection = getConnection();
  if (connection) {
    // "2g" and "slow-2g" are what the browser reports for very poor links.
    if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
      return "slow";
    }
    // Under about 0.4 Mbps is too slow to save much of anything.
    if (
      typeof connection.downlink === "number" &&
      connection.downlink > 0 &&
      connection.downlink < 0.4
    ) {
      return "slow";
    }
  }
  return "online";
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  const connection = getConnection();
  connection?.addEventListener("change", onChange);

  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
    connection?.removeEventListener("change", onChange);
  };
};

/** Live network state: "online", "slow" or "offline". */
export const useNetworkStatus = (): NetworkState =>
  useSyncExternalStore(subscribe, readState, () => "online");