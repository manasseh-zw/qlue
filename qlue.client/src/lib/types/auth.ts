import type { User } from "./user";

export interface TasteProfile {
  primaryEntities: any[];
  domainExpansions: Record<string, any[]>;
  crossDomainInsights: any[];
  finalAnalysis: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tasteProfile: TasteProfile | null;
  tasteProfileLoading: boolean;
} 