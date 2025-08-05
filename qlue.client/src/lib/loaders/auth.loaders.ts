import { redirect } from "@tanstack/react-router";
import { authState } from "../state/auth.state";

const AUTH_CHECK_TIMEOUT = 10000; // 10 seconds timeout

async function waitForAuthState(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Auth state check timed out"));
    }, AUTH_CHECK_TIMEOUT);

    // Check immediately first
    if (!authState.state.isLoading) {
      clearTimeout(timeout);
      resolve();
      return;
    }

    const unsubscribe = authState.subscribe((state) => {
      if (!state.currentVal.isLoading) {
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  });
}

// Loader for unauthenticated users only (signin/signup pages)
export const unauthenticatedOnlyLoader = async () => {
  try {
    await waitForAuthState();

    const { isAuthenticated } = authState.state;
    if (isAuthenticated) {
      throw redirect({ to: "/chat" });
    }

    return null;
  } catch (error) {
    // If timeout or other error, allow access to auth pages
    return null;
  }
};

// Loader for authenticated users only (protected routes)
export const authenticatedOnlyLoader = async () => {
  try {
    await waitForAuthState();

    const { isAuthenticated } = authState.state;
    if (!isAuthenticated) {
      throw redirect({ to: "/auth/signin" });
    }

    return null;
  } catch (error) {
    // If timeout or other error, redirect to sign-in as a fallback
    throw redirect({ to: "/auth/signin" });
  }
};

// Loader for users who need to complete onboarding
export const onboardingRequiredLoader = async () => {
  try {
    await waitForAuthState();

    const { isAuthenticated, user } = authState.state;

    if (!isAuthenticated) {
      throw redirect({ to: "/auth/signin" });
    }

    if (user?.onboarding === "COMPLETE") {
      // User has completed onboarding, they can stay on this route
      return null;
    }

    throw redirect({ to: "/chat" });
  } catch (error) {
    // If timeout or other error, redirect to sign-in as a fallback
    throw redirect({ to: "/auth/signin" });
  }
};

// Loader for the landing page - allows both authenticated and unauthenticated
export const publicOnlyLoader = async () => {
  try {
    await waitForAuthState();

    const { isAuthenticated } = authState.state;
    if (isAuthenticated) {
      throw redirect({ to: "/chat" });
    }

    return null;
  } catch (error) {
    // If timeout or other error, allow access to public route
    return null;
  }
};

// Legacy loader for backward compatibility
export const protectedLoader = async () => {
  return authenticatedOnlyLoader();
};
