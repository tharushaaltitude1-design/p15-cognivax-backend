/** Central auth tuning constants. */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const IDLE_WARNING_MS = 60 * 1000;
export const VERIFICATION_RESEND_COOLDOWN_SECONDS = 30;

/** Client-side throttling after repeated failed sign-in attempts. */
export const MAX_FAILED_ATTEMPTS = 5;
export const FAILED_ATTEMPT_COOLDOWN_MS = 30_000;

/** Pages that render without the dashboard shell. */
const AUTH_PAGE_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email",
  "/auth",
] as const;

/** Auth pages an already-authenticated user should be bounced away from. */
const PUBLIC_ONLY_PATHS = ["/login", "/signup", "/forgot-password"] as const;

function matchesAny(pathname: string, bases: readonly string[]): boolean {
  return bases.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

export function isAuthPagePath(pathname: string): boolean {
  return matchesAny(pathname, AUTH_PAGE_PATHS);
}

export function isPublicOnlyPath(pathname: string): boolean {
  return matchesAny(pathname, PUBLIC_ONLY_PATHS);
}
