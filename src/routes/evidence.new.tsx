import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/evidence/new")({
  head: () => pageHead("New Evidence", "Manage enterprise evidence in Cognivax."),
  component: Page,
});
function Page() {
  return <ModulePage module="evidence" mode="new" />;
}
