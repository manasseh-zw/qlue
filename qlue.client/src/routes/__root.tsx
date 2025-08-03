import { Outlet, createRootRoute } from "@tanstack/react-router";
import { getUser } from "../lib/services/auth.service";
import { authState } from "../lib/state/auth.state";

export const Route = createRootRoute({
  component: RootComponent,
  loader: async () => {
    const { isLoading } = authState.state;

    if (isLoading) {
      try {
        const user = await getUser();

        if (user) {
          authState.setState(() => ({
            user,
            isAuthenticated: true,
            isLoading: false,
            tasteProfile: null,
            tasteProfileLoading: false,
          }));
        } else {
          authState.setState(() => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            tasteProfile: null,
            tasteProfileLoading: false,
          }));
        }
      } catch (error) {
        console.error("Not authenticated:", error);
        authState.setState(() => ({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          tasteProfile: null,
          tasteProfileLoading: false,
        }));
      }
    }
    return null;
  },
});

function RootComponent() {
  return (
    <main className="font-geist min-h-screen w-full">
      <Outlet />
    </main>
  );
}
