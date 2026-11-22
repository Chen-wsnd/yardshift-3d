import { AppShell } from "@/components/layout/AppShell";
import { JobBoard } from "@/features/jobs";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-[family-name:var(--font-display)] text-4xl text-emerald-950 sm:text-5xl">
          YardShift
        </p>
        <p className="mb-6 max-w-prose text-stone-600">
          v0.2 garden work sim — inspect zones, work with real coverage, live with
          the consequences.
        </p>
        <JobBoard />
      </div>
    </AppShell>
  );
}
