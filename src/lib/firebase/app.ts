import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

import { getFirebaseConfig, isBrowser } from "./config";

let app: FirebaseApp | undefined;

/**
 * Returns the singleton Firebase app for the browser. Firebase Auth reads from
 * `window` internals, so this throws when called during SSR rather than
 * initialising an app that can never service requests.
 */
export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  if (!isBrowser) {
    throw new Error("[firebase] Firebase can only be initialised in the browser.");
  }
  app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
  return app;
}
