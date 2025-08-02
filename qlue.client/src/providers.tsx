import { HeroUIProvider } from "@heroui/react";
import type { ReactNode } from "react";
import { CVIProvider } from "./components/cvi/components/cvi-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      <CVIProvider>{children}</CVIProvider>
    </HeroUIProvider>
  );
}
