import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <main className="font-geist min-h-screen w-full">
      <Outlet />
    </main>
  ),
});
