import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/decisions/$id/edit")({
  head: () => pageHead("Edit Decisions", "Manage enterprise decisions in Cognivax."),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ModulePage module="decisions" mode="edit" id={id} />;
}
