import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/workspace/ProfileSettings";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/profile")({
  head: () => pageHead("Profile", "Profile for the Cognivax enterprise intelligence workspace."),
  component: ProfilePage,
});
