export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

function requireEnv(value: string | undefined, key: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `[firebase] Missing required environment variable "${key}". ` +
        `Copy .env.example to .env and fill in your Firebase web app credentials.`,
    );
  }
  return trimmed;
}

/**
 * Reads and validates the Firebase web configuration from Vite environment
 * variables. Throws a descriptive error when a required variable is missing so
 * misconfiguration surfaces immediately instead of as an opaque SDK failure.
 */
export function getFirebaseConfig(): FirebaseConfig {
  const base = {
    apiKey: requireEnv(import.meta.env.VITE_FIREBASE_API_KEY, "VITE_FIREBASE_API_KEY"),
    authDomain: requireEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, "VITE_FIREBASE_PROJECT_ID"),
    storageBucket: requireEnv(
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      "VITE_FIREBASE_STORAGE_BUCKET",
    ),
    messagingSenderId: requireEnv(
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      "VITE_FIREBASE_MESSAGING_SENDER_ID",
    ),
    appId: requireEnv(import.meta.env.VITE_FIREBASE_APP_ID, "VITE_FIREBASE_APP_ID"),
  };
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim();
  return measurementId ? { ...base, measurementId } : base;
}

export const isBrowser = typeof window !== "undefined";
