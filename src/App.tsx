import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { Outlet, useLocation, Link, Routes, Route, useSearchParams } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { IdleTimeoutDialog } from "@/features/auth/components/IdleTimeoutDialog";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import { SessionWatcher } from "@/features/auth/components/SessionWatcher";
import { isAuthPagePath, isPublicOnlyPath } from "@/features/auth/constants";
import { reportLovableError } from "@/lib/lovable-error-reporting";

import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { AuthActionErrorPage } from "@/features/auth/pages/AuthActionErrorPage";
import { ActivityPage, NotificationsPage, SearchPage } from "@/features/workspace/FeedPages";
import { SettingsPage, ProfilePage } from "@/features/workspace/ProfileSettings";
import {
  GovernancePage,
  ChangesPage,
  ExceptionsPage,
  TeamPage,
} from "@/features/workspace/GovernancePages";
import { ModulePage } from "@/features/modules/ModulePage";

const queryClient = new QueryClient();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent() {
  useEffect(() => {
    reportLovableError(new Error("Route error"), { route: window.location.pathname });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function RootLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const authPage = isAuthPagePath(pathname);
  const publicOnly = isPublicOnlyPath(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionWatcher />
        <IdleTimeoutDialog />
        {authPage ? (
          publicOnly ? (
            <PublicOnlyRoute>
              <Outlet />
            </PublicOnlyRoute>
          ) : (
            <Outlet />
          )
        ) : (
          <ProtectedRoute>
            <AppShell>
              <Outlet />
            </AppShell>
          </ProtectedRoute>
        )}
        <Toaster theme="dark" position="bottom-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function ModuleLayout() {
  return <Outlet />;
}
function LoginRouteWrapper() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? undefined;
  return <LoginPage redirect={redirect} />;
}

function AuthActionErrorRouteWrapper() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") ?? undefined;
  return <AuthActionErrorPage message={message} />;
}

function ModuleListRoute({ module }: { module: string }) {
  return <ModulePage module={module as any} mode="list" />;
}

function ModuleNewRoute({ module }: { module: string }) {
  return <ModulePage module={module as any} mode="new" />;
}

function ModuleDetailRoute({ module }: { module: string }) {
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);
  const id = parts[2] ?? "";
  return <ModulePage module={module as any} mode="detail" id={id} />;
}

function ModuleEditRoute({ module }: { module: string }) {
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);
  const id = parts[2] ?? "";
  return <ModulePage module={module as any} mode="edit" id={id} />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="login" element={<LoginRouteWrapper />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="auth/action-error" element={<AuthActionErrorRouteWrapper />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        <Route path="knowledge" element={<ModuleLayout />}>
          <Route index element={<ModuleListRoute module="knowledge" />} />
          <Route path="new" element={<ModuleNewRoute module="knowledge" />} />
          <Route path=":id" element={<ModuleLayout />}>
            <Route index element={<ModuleDetailRoute module="knowledge" />} />
            <Route path="edit" element={<ModuleEditRoute module="knowledge" />} />
          </Route>
        </Route>

        <Route path="reasoning" element={<ModuleLayout />}>
          <Route index element={<ModuleListRoute module="reasoning" />} />
          <Route path="new" element={<ModuleNewRoute module="reasoning" />} />
          <Route path=":id" element={<ModuleLayout />}>
            <Route index element={<ModuleDetailRoute module="reasoning" />} />
            <Route path="edit" element={<ModuleEditRoute module="reasoning" />} />
          </Route>
        </Route>

        <Route path="evidence" element={<ModuleLayout />}>
          <Route index element={<ModuleListRoute module="evidence" />} />
          <Route path="new" element={<ModuleNewRoute module="evidence" />} />
          <Route path=":id" element={<ModuleLayout />}>
            <Route index element={<ModuleDetailRoute module="evidence" />} />
            <Route path="edit" element={<ModuleEditRoute module="evidence" />} />
          </Route>
        </Route>

        <Route path="decisions" element={<ModuleLayout />}>
          <Route index element={<ModuleListRoute module="decisions" />} />
          <Route path="new" element={<ModuleNewRoute module="decisions" />} />
          <Route path=":id" element={<ModuleLayout />}>
            <Route index element={<ModuleDetailRoute module="decisions" />} />
            <Route path="edit" element={<ModuleEditRoute module="decisions" />} />
          </Route>
        </Route>

        <Route path="rules" element={<ModuleLayout />}>
          <Route index element={<ModuleListRoute module="rules" />} />
          <Route path="new" element={<ModuleNewRoute module="rules" />} />
          <Route path=":id" element={<ModuleLayout />}>
            <Route index element={<ModuleDetailRoute module="rules" />} />
            <Route path="edit" element={<ModuleEditRoute module="rules" />} />
          </Route>
        </Route>

        <Route path="governance" element={<ModuleLayout />}>
          <Route index element={<GovernancePage />} />
          <Route path="changes" element={<ChangesPage />} />
          <Route path="exceptions" element={<ExceptionsPage />} />
          <Route path="team" element={<TeamPage />} />
        </Route>

        <Route path="*" element={<NotFoundComponent />} />
      </Route>
    </Routes>
  );
}
