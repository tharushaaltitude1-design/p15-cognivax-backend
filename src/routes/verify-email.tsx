import { createFileRoute } from "@tanstack/react-router";

import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/verify-email")({
  head: () => pageHead("Verify email", "Verify your Cognivax email address."),
  component: VerifyEmailPage,
});
