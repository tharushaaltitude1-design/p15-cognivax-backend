import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = typeof search["redirect"] === "string" ? search["redirect"] : undefined;
    return redirect ? { redirect } : {};
  },
  head: () => pageHead("Sign in", "Sign in to your Cognivax enterprise intelligence workspace."),
  component: LoginRoute,
});

function LoginRoute() {
  const { redirect } = Route.useSearch();
  return <LoginPage redirect={redirect} />;
}
