import { createFileRoute } from "@tanstack/react-router";
import { protectedLoader } from "@/lib/loaders/auth.loaders";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
  loader: protectedLoader,
});

function RouteComponent() {
  return <div>Hello "/app/"!</div>;
}
