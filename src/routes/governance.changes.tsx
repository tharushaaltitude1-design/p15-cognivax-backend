import { createFileRoute } from "@tanstack/react-router";
import { ChangesPage } from "@/features/workspace/GovernancePages";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/governance/changes")({
  head: () =>
    pageHead(
      "Change Records",
      "Change Records for the Cognivax enterprise intelligence workspace.",
    ),
  component: ChangesPage,
});
