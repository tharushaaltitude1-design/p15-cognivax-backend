import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { AuthLoadingScreen } from "./AuthLoadingScreen";
import { useAuth } from "../useAuth";

/**
 * Keeps authenticated users out of the auth screens. When a signed-in user
 * lands on /login or /signup, they are sent to the dashboard (or back to the
 * page they originally requested via the `redirect` search param).
 */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const search = useRouterState({ select: (state) => state.location.searchStr });
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    const params = new URLSearchParams(search);
    const redirect = params.get("redirect");
    const target = redirect && redirect.startsWith("/") ? redirect : "/";
    void navigate({ to: target as never, replace: true });
  }, [loading, isAuthenticated, search, navigate]);

  if (loading || isAuthenticated) return <AuthLoadingScreen />;

  return <>{children}</>;
}
