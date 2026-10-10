import { createFileRoute } from "@tanstack/react-router";
import { ExceptionsPage } from "@/features/workspace/GovernancePages";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/governance/exceptions")({
  head: () =>
    pageHead("Exceptions", "Exceptions for the Cognivax enterprise intelligence workspace."),
  component: ExceptionsPage,
});
