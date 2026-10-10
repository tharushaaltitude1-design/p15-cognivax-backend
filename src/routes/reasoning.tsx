import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/reasoning")({ component: () => <Outlet /> });
