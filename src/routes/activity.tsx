import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "@/features/workspace/FeedPages";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/activity")({
  head: () => pageHead("Activity", "Activity for the Cognivax enterprise intelligence workspace."),
  component: ActivityPage,
});
