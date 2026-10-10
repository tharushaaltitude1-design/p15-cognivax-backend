import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

import { getFirebaseApp } from "./app";

let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  }
  return googleProvider;
}
