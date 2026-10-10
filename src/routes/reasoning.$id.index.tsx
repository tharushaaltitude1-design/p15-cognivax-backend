import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/reasoning/$id/")({
  head: () => pageHead("Detail Reasoning", "Manage enterprise reasoning in Cognivax."),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ModulePage module="reasoning" mode="detail" id={id} />;
}
