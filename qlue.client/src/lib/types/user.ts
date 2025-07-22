export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  age?: number;
  interests?: any;
  onboarding: "SIGNUP" | "CHAT" | "COMPLETE";
  tasteProfileId?: string;
}
