import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { AuthLoadingScreen } from "./AuthLoadingScreen";
import { useAuth } from "../useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const search = useRouterState({ select: (state) => state.location.searchStr });
  const navigate = useNavigate();
  const redirect = search ? `${pathname}${search}` : pathname;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      void navigate({ to: "/login", search: { redirect }, replace: true });
    }
  }, [loading, isAuthenticated, redirect, navigate]);

  if (loading || !isAuthenticated) return <AuthLoadingScreen />;

  return <>{children}</>;
}
