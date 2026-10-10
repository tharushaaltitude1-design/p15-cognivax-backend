import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/evidence/$id/edit")({
  head: () => pageHead("Edit Evidence", "Manage enterprise evidence in Cognivax."),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ModulePage module="evidence" mode="edit" id={id} />;
}
