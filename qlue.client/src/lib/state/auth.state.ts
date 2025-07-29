import { Store } from "@tanstack/react-store";
import type { User } from "../types/user";
import type { AuthState } from "../types/auth";

export const authState = new Store({
  user: null as User | null,
  isAuthenticated: false,
  isLoading: true,
} as AuthState);

export const authActions = {
  setUser: (user: User) => {
    authState.setState(() => ({
      user,
      isAuthenticated: true,
      isLoading: false,
    }));
  },

  clearUser: () => {
    authState.setState(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }));
  },

  setLoading: (isLoading: boolean) => {
    authState.setState((state) => ({
      ...state,
      isLoading,
    }));
  },

  updateUser: (data: Partial<User>) => {
    authState.setState((state) => ({
      ...state,
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}; 