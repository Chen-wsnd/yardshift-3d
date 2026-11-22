import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

interface AppShellProps {
  children: ReactNode;
  showBalance?: boolean;
}

export function AppShell({ children, showBalance = true }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showBalance={showBalance} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
