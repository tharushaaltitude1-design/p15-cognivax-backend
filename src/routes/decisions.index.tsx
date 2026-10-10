import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/decisions/")({
  head: () => pageHead("Decisions", "Manage enterprise decisions in Cognivax."),
  component: Page,
});
function Page() {
  return <ModulePage module="decisions" mode="list" />;
}
