import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Dashboard",
      "Your enterprise knowledge, reasoning, evidence and decisions at a glance.",
    ),
  component: DashboardPage,
});
