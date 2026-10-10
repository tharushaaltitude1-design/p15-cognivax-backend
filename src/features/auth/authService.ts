import {
  EmailAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  getRedirectResult,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from "firebase/auth";

import { logEvent } from "@/lib/firebase/analytics";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase/auth";
import { isAuthErrorCode } from "./authErrors";

const POPUP_FALLBACK_CODES = [
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/cancelled-popup-request",
];

async function applyPersistence(remember: boolean): Promise<void> {
  try {
    await setPersistence(
      getFirebaseAuth(),
      remember ? browserLocalPersistence : browserSessionPersistence,
    );
  } catch {
    // Persistence is a preference, not a requirement — continue with defaults.
  }
}

function requireCurrentUser(): User {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("[firebase] No signed-in user for this action.");
  return user;
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const displayName = name.trim();
  if (displayName) await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  logEvent("sign_up", { method: "password" });
  return credential.user;
}

export async function signInWithEmail(
  email: string,
  password: string,
  remember = true,
): Promise<User> {
  await applyPersistence(remember);
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  logEvent("login", { method: "password" });
  return credential.user;
}

export async function signInWithGoogle(remember = true): Promise<User | undefined> {
  const auth = getFirebaseAuth();
  await applyPersistence(remember);
  try {
    const credential = await signInWithPopup(auth, getGoogleProvider());
    logEvent("login", { method: "google" });
    return credential.user;
  } catch (error) {
    if (isAuthErrorCode(error, ...POPUP_FALLBACK_CODES)) {
      await signInWithRedirect(auth, getGoogleProvider());
      return undefined;
    }
    throw error;
  }
}

/** Completes a pending redirect sign-in (used on app load). */
export async function completeGoogleRedirect(): Promise<User | undefined> {
  const credential = await getRedirectResult(getFirebaseAuth());
  if (credential?.user) logEvent("login", { method: "google" });
  return credential?.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
  logEvent("logout");
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}

export async function sendVerificationEmail(): Promise<void> {
  await sendEmailVerification(requireCurrentUser());
}

export interface ProfileUpdate {
  displayName?: string;
  photoURL?: string | null;
}

export async function updateUserProfile(input: ProfileUpdate): Promise<void> {
  const user = requireCurrentUser();
  const update: { displayName?: string; photoURL?: string | null } = {};
  if (input.displayName !== undefined) update.displayName = input.displayName.trim();
  if (input.photoURL !== undefined) update.photoURL = input.photoURL;
  await updateProfile(user, update);
}

export async function reauthenticate(currentPassword: string): Promise<void> {
  const user = requireCurrentUser();
  const email = user.email;
  if (!email) throw new Error("[firebase] This account has no password credential.");
  const credential = EmailAuthProvider.credential(email, currentPassword);
  await reauthenticateWithCredential(user, credential);
}

export async function reauthenticateWithGoogle(): Promise<void> {
  await reauthenticateWithPopup(requireCurrentUser(), getGoogleProvider());
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await reauthenticate(currentPassword);
  await updatePassword(requireCurrentUser(), newPassword);
}

export async function deleteAccount(currentPassword?: string): Promise<void> {
  const user = requireCurrentUser();
  if (user.providerData.some((provider) => provider.providerId === "password")) {
    if (!currentPassword)
      throw new Error("[firebase] A password is required to delete this account.");
    await reauthenticate(currentPassword);
  } else {
    await reauthenticateWithGoogle();
  }
  await deleteUser(requireCurrentUser());
}

export async function reloadCurrentUser(): Promise<User | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  await user.reload();
  return getFirebaseAuth().currentUser;
}
