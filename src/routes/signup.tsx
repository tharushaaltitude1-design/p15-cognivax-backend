import { createFileRoute } from "@tanstack/react-router";

import { SignupPage } from "@/features/auth/pages/SignupPage";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/signup")({
  head: () => pageHead("Create account", "Create your Cognivax account."),
  component: SignupPage,
});
