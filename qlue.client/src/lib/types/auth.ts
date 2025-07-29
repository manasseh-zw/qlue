import type { User } from "./user";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} 