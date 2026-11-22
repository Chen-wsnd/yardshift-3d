import Link from "next/link";
import { BalanceDisplay } from "@/features/economy/BalanceDisplay";

interface AppHeaderProps {
  showBalance?: boolean;
}

export function AppHeader({ showBalance = true }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-stone-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="group">
          <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-emerald-900 group-hover:text-emerald-700 sm:text-2xl">
            YardShift 3D
          </span>
        </Link>
        <nav className="flex gap-3 text-sm text-stone-600">
          <Link href="/" className="hover:text-emerald-800">
            Task Board
          </Link>
          <Link href="/yard" className="hover:text-emerald-800">
            Yard
          </Link>
        </nav>
      </div>
      {showBalance ? <BalanceDisplay /> : null}
    </header>
  );
}
