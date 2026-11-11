import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/summits")({ component: () => <Outlet /> });
