import { createFileRoute } from "@tanstack/react-router";

import { AuthActionErrorPage } from "@/features/auth/pages/AuthActionErrorPage";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/auth/action-error")({
  validateSearch: (search: Record<string, unknown>): { message?: string } => {
    const message = typeof search["message"] === "string" ? search["message"] : undefined;
    return message ? { message } : {};
  },
  head: () => pageHead("Authentication link", "There was a problem with this authentication link."),
  component: AuthActionErrorRoute,
});

function AuthActionErrorRoute() {
  const { message } = Route.useSearch();
  return <AuthActionErrorPage message={message} />;
}
