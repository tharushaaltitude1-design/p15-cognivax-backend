import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/knowledge/$id/edit")({
  head: () => pageHead("Edit Knowledge", "Manage enterprise knowledge in Cognivax."),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ModulePage module="knowledge" mode="edit" id={id} />;
}
