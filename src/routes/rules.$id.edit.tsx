import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/rules/$id/edit")({
  head: () => pageHead("Edit Business Rules", "Manage enterprise business rules in Cognivax."),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ModulePage module="rules" mode="edit" id={id} />;
}
