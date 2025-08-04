import { Outlet, createRootRoute } from "@tanstack/react-router";
import { getUser } from "../lib/services/auth.service";
import { authState } from "../lib/state/auth.state";

export const Route = createRootRoute({
  component: RootComponent,
  loader: async () => {
    const { isLoading } = authState.state;

    if (isLoading) {
      try {
        console.log("Checking authentication...");
        const user = await getUser();
        console.log("User from API:", user);

        if (user) {
          console.log("User authenticated:", user);
          authState.setState(() => ({
            user,
            isAuthenticated: true,
            isLoading: false,
            tasteProfile: null,
            tasteProfileLoading: false,
          }));
        } else {
          console.log("No user found");
          authState.setState(() => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            tasteProfile: null,
            tasteProfileLoading: false,
          }));
        }
      } catch (error) {
        console.error("Authentication error:", error);
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
