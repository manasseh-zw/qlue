import { config } from "../../../client.config";
import type { User } from "@/lib/types/user";
import { authActions } from "@/lib/state/auth.state";
import type { ApiResponse } from "@/lib/utils/api";

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(`${config.serverUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data: ApiResponse<User> = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      errors: ["An unexpected error occurred."],
    };
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name?: string
): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(`${config.serverUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });

    const data: ApiResponse<User> = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      errors: ["An unexpected error occurred."],
    };
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${config.serverUrl}/api/auth/me`, {
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
    if (data.success && data.data) {
      return data.data;
    }
    return null;
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
    authActions.clearUser();
  } catch (error) {
    console.error("Sign out error:", error);
  }
};

export const updateUser = async (data: Partial<User>): Promise<User | null> => {
  try {
    const response = await fetch(`${config.serverUrl}/api/auth/me/update`, {
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
    const updatedUser = result.user;
    authActions.updateUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Update user error:", error);
    return null;
  }
};
