import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { toast } from "sonner";

import { isBrowser } from "@/lib/firebase/config";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { setWorkspaceUser } from "@/services/repository";
import { completeGoogleRedirect } from "./authService";
import { getAuthErrorMessage } from "./authErrors";
import { AuthLoadingScreen } from "./components/AuthLoadingScreen";
import { AuthContext, type AuthContextValue } from "./useAuth";

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, forceRefresh] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    if (!isBrowser) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const start = async () => {
      try {
        const auth = getFirebaseAuth();
        try {
          await completeGoogleRedirect();
        } catch (error) {
          toast.error(getAuthErrorMessage(error));
        }
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          if (!active) return;
          setWorkspaceUser(nextUser?.uid ?? null);
          setUser(nextUser);
          setLoading(false);
        });
      } catch (error) {
        console.error("[auth] Failed to initialise authentication:", error);
        if (active) setLoading(false);
      }
    };

    void start();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) return;
    await current.reload();
    forceRefresh();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    void tick;
    const providerIds = user?.providerData.map((provider) => provider.providerId) ?? [];
    return {
      user,
      loading,
      isAuthenticated: user !== null,
      emailVerified: user?.emailVerified ?? false,
      providerIds,
      lastSignInAt: toDate(user?.metadata.lastSignInTime),
      createdAt: toDate(user?.metadata.creationTime),
      refreshUser,
    };
  }, [user, loading, refreshUser, tick]);

  if (loading) return <AuthLoadingScreen />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
