import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/evidence/")({
  head: () => pageHead("Evidence", "Manage enterprise evidence in Cognivax."),
  component: Page,
});
function Page() {
  return <ModulePage module="evidence" mode="list" />;
}
