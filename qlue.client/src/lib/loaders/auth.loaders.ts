import { authState } from "@/lib/state/auth.state";
import { redirect } from "@tanstack/react-router";

const AUTH_CHECK_TIMEOUT = 10000;

export async function waitForAuthState(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Auth state check timed out"));
    }, AUTH_CHECK_TIMEOUT);

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

export const publicOnlyLoader = async () => {
  try {
    await waitForAuthState();

    const { isAuthenticated } = authState.state;
    if (isAuthenticated) {
      throw redirect({
        to: "/me",
      });
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const protectedLoader = async () => {
  try {
    await waitForAuthState();

    const { isAuthenticated } = authState.state;
    if (!isAuthenticated) {
      throw redirect({
        to: "/",
      });
    }

    return null;
  } catch (error) {
    throw redirect({
      to: "/",
    });
  }
}; 