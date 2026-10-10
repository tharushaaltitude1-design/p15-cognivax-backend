import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/knowledge/new")({
  head: () => pageHead("New Knowledge", "Manage enterprise knowledge in Cognivax."),
  component: Page,
});
function Page() {
  return <ModulePage module="knowledge" mode="new" />;
}
