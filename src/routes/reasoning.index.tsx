import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/reasoning/")({
  head: () => pageHead("Reasoning", "Manage enterprise reasoning in Cognivax."),
  component: Page,
});
function Page() {
  return <ModulePage module="reasoning" mode="list" />;
}
