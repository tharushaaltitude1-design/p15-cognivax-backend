/**
 * Friendly, human-readable messages for every Firebase Authentication error
 * code we can realistically surface. Raw SDK strings are never shown to users.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match. Please check and try again.",
  "auth/invalid-login-credentials":
    "That email and password don't match. Please check and try again.",
  "auth/user-not-found": "We couldn't find an account with that email address.",
  "auth/wrong-password": "The password you entered is incorrect.",
  "auth/invalid-password": "That password doesn't look right. Please try again.",
  "auth/email-already-in-use": "An account with that email already exists. Try signing in instead.",
  "auth/weak-password": "Please choose a stronger password (at least 8 characters).",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-email": "Please enter your email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-closed-by-user": "The sign-in window was closed before finishing. Please try again.",
  "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in pop-up. We'll redirect you instead — or allow pop-ups to continue.",
  "auth/redirect-cancelled-by-user": "The sign-in redirect was cancelled. Please try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method. Sign in with that provider first, then link Google from your profile.",
  "auth/credential-already-in-use": "Those credentials are already linked to another account.",
  "auth/provider-already-linked": "This sign-in method is already linked to your account.",
  "auth/no-such-provider": "This sign-in method isn't linked to your account.",
  "auth/requires-recent-login":
    "For your security, please sign in again before making this change.",
  "auth/user-disabled": "This account has been disabled. Please contact your administrator.",
  "auth/user-mismatch": "The credentials belong to a different account.",
  "auth/operation-not-allowed":
    "This sign-in method isn't enabled for the project. Please contact your administrator.",
  "auth/operation-not-supported-in-this-environment":
    "This sign-in method isn't supported in this browser. Try opening Cognivax in a standard browser.",
  "auth/unauthorized-domain":
    "This domain isn't authorised for Firebase sign-in. Add it in the Firebase console.",
  "auth/web-storage-unsupported":
    "Your browser has storage disabled. Enable cookies or local storage and try again.",
  "auth/unsupported-persistence-type": "This browser doesn't support staying signed in.",
  "auth/invalid-verification-code": "That verification code is invalid or has expired.",
  "auth/expired-action-code": "This link has expired. Please request a new one.",
  "auth/invalid-action-code": "This link is invalid or has already been used.",
  "auth/internal-error": "Something went wrong on our end. Please try again.",
  "auth/timeout": "The request timed out. Please try again.",
};

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

export function getAuthErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

/** Maps any thrown value to a friendly message. Never returns a raw SDK string. */
export function getAuthErrorMessage(error: unknown, fallback = GENERIC_MESSAGE): string {
  const code = getAuthErrorCode(error);
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (error instanceof Error && error.message.startsWith("[firebase]")) return error.message;
  return fallback;
}

export function isAuthErrorCode(error: unknown, ...codes: string[]): boolean {
  const code = getAuthErrorCode(error);
  return code !== undefined && codes.includes(code);
}

export { AUTH_ERROR_MESSAGES, GENERIC_MESSAGE };
