import { getFirebaseApp } from "./app";
import { isBrowser } from "./config";

type SupportedEventParams = Record<string, string | number | boolean>;

let analyticsPromise: Promise<import("firebase/analytics").Analytics | undefined> | undefined;

/**
 * Initialises Firebase Analytics lazily, and only in browsers where the SDK
 * reports `isSupported()`. Any failure is swallowed so analytics can never
 * crash the application.
 */
function getAnalyticsInstance(): Promise<import("firebase/analytics").Analytics | undefined> {
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      try {
        if (!isBrowser) return undefined;
        const mod = await import("firebase/analytics");
        if (!(await mod.isSupported())) return undefined;
        return mod.getAnalytics(getFirebaseApp());
      } catch (error) {
        console.warn("[firebase] Analytics unavailable:", error);
        return undefined;
      }
    })();
  }
  return analyticsPromise;
}

/** Fire-and-forget analytics helper. Never throws. */
export function logEvent(name: string, params?: SupportedEventParams): void {
  void (async () => {
    try {
      const analytics = await getAnalyticsInstance();
      if (!analytics) return;
      const mod = await import("firebase/analytics");
      mod.logEvent(analytics, name, params);
    } catch (error) {
      console.warn("[firebase] Failed to log analytics event:", error);
    }
  })();
}
