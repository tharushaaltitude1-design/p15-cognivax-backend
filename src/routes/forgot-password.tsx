import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/forgot-password")({
  head: () => pageHead("Reset password", "Reset your Cognivax password."),
  component: ForgotPasswordPage,
});
