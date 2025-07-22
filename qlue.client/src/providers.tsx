import { HeroUIProvider } from "@heroui/react";
import type { ReactNode } from "react";
import { AuthProvider } from "./lib/providers/auth.provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProvider>
  );
}
