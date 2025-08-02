import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppSidebar from "@/components/layout/app-sidebar";
import { onboardingRequiredLoader } from "@/lib/loaders/auth.loaders";

export const Route = createFileRoute("/__app")({
  component: RouteComponent,
  loader: onboardingRequiredLoader,
});

function RouteComponent() {
  return (
    <main className="h-screen w-full overflow-hidden flex flex-row bg-primary">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto rounded-2xl shadow-sm bg-content1 border-1 border-content3 m-1">
        <Outlet />
      </div>
    </main>
  );
}
