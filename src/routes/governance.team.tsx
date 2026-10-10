import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "@/features/workspace/GovernancePages";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/governance/team")({
  head: () =>
    pageHead(
      "Team Directory",
      "Team Directory for the Cognivax enterprise intelligence workspace.",
    ),
  component: TeamPage,
});
