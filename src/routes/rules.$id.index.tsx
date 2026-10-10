import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/features/modules/ModulePage";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/rules/$id/")({
  head: () => pageHead("Detail Business Rules", "Manage enterprise business rules in Cognivax."),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ModulePage module="rules" mode="detail" id={id} />;
}
