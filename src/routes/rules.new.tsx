import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/rules/new")({
  head: () => pageHead("New Business Rules", "Manage enterprise business rules in Cognivax."),
  component: Page,
});
function Page() {
  return <ModulePage module="rules" mode="new" />;
}
