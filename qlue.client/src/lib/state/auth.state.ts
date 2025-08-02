import { Store } from "@tanstack/react-store";
import type { User } from "../types/user";
import type { AuthState, TasteProfile } from "../types/auth";

export const authState = new Store({
  user: null as User | null,
  isAuthenticated: false,
  isLoading: true,
  tasteProfile: null as TasteProfile | null,
  tasteProfileLoading: false,
} as AuthState);

export const authActions = {
  setUser: (user: User) => {
    authState.setState(() => ({
      user,
      isAuthenticated: true,
      isLoading: false,
      tasteProfile: null,
      tasteProfileLoading: false,
    }));
  },

  clearUser: () => {
    authState.setState(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      tasteProfile: null,
      tasteProfileLoading: false,
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

  setTasteProfile: (tasteProfile: TasteProfile) => {
    authState.setState((state) => ({
      ...state,
      tasteProfile,
      tasteProfileLoading: false,
    }));
  },

  setTasteProfileLoading: (loading: boolean) => {
    authState.setState((state) => ({
      ...state,
      tasteProfileLoading: loading,
    }));
  },

  clearTasteProfile: () => {
    authState.setState((state) => ({
      ...state,
      tasteProfile: null,
      tasteProfileLoading: false,
    }));
  },
}; 