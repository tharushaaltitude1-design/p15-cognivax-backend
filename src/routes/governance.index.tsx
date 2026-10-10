import { createFileRoute } from "@tanstack/react-router";
import { GovernancePage } from "@/features/workspace/GovernancePages";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/governance/")({
  head: () =>
    pageHead("Governance", "Governance for the Cognivax enterprise intelligence workspace."),
  component: GovernancePage,
});
