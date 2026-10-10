import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/workspace/ProfileSettings";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/settings")({
  head: () => pageHead("Settings", "Settings for the Cognivax enterprise intelligence workspace."),
  component: SettingsPage,
});
