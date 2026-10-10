import { useEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { workspaceService } from "@/services/repository";
import { isAuthPagePath } from "../constants";
import { useAuth } from "../useAuth";

/**
 * Global session watcher. If an authenticated session becomes null while the
 * user is on a protected route, notify them and send them to the login page.
 * It also mirrors the authenticated identity into the local workspace profile
 * so greetings, ownership defaults and audit entries reflect the real user.
 */
export function SessionWatcher() {
  const { isAuthenticated, loading, user } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const wasAuthenticated = useRef(false);
  const syncedIdentity = useRef<string | null>(null);

  useEffect(() => {
    // Identity changed: drop cached workspace/records so they reload for this user.
    void queryClient.resetQueries();
  }, [user?.uid, queryClient]);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      wasAuthenticated.current = true;
      return;
    }
    if (wasAuthenticated.current && !isAuthPagePath(pathname)) {
      wasAuthenticated.current = false;
      toast.error("Your session ended. Please sign in again.");
      void navigate({ to: "/login", replace: true });
    }
  }, [isAuthenticated, loading, pathname, navigate]);

  useEffect(() => {
    if (!user) {
      syncedIdentity.current = null;
      return;
    }
    const name = user.displayName || user.email?.split("@")[0] || "Team member";
    const email = user.email ?? "";
    const avatar = user.photoURL ?? "";
    const identity = `${name}|${email}|${avatar}`;
    if (syncedIdentity.current === identity) return;
    syncedIdentity.current = identity;
    void workspaceService.updateProfile({ name, email, avatar }).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["workspace"] });
    });
  }, [user, queryClient]);

  return null;
}
