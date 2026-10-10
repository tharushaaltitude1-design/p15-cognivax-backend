import { getFirestore, type Firestore } from "firebase/firestore";

import { getFirebaseApp } from "./app";
import { isBrowser } from "./config";

let firestore: Firestore | undefined;

/**
 * Returns the singleton Cloud Firestore instance for the browser. Firestore
 * relies on browser APIs, so this throws during SSR instead of creating an
 * instance that can never service requests.
 */
export function getFirebaseFirestore(): Firestore {
  if (firestore) return firestore;
  if (!isBrowser) {
    throw new Error("[firebase] Firestore can only be initialised in the browser.");
  }
  firestore = getFirestore(getFirebaseApp());
  return firestore;
}
