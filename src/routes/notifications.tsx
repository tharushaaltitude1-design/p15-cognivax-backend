import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/features/workspace/FeedPages";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/notifications")({
  head: () =>
    pageHead("Notifications", "Notifications for the Cognivax enterprise intelligence workspace."),
  component: NotificationsPage,
});
