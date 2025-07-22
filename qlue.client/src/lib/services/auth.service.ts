import { config } from "../../../client.config";
import type { User } from "@/lib/types/user";

export const signInWithGoogle = async (): Promise<void> => {
  window.location.href = `${config.serverUrl}/api/auth/google`;
};

export const getUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${config.serverUrl}/api/user`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await fetch(`${config.serverUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Sign out error:", error);
  }
};

export const updateUser = async (data: Partial<User>): Promise<User | null> => {
  try {
    const response = await fetch(`${config.serverUrl}/api/user`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error("Update user error:", error);
    return null;
  }
};
