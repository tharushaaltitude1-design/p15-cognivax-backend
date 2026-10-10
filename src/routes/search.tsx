import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/features/workspace/FeedPages";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/search")({
  head: () => pageHead("Search", "Search for the Cognivax enterprise intelligence workspace."),
  component: SearchPage,
});
