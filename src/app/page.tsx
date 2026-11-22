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
          Browser gardening contracts — clean the yard, earn credits, unlock
          better tools.
        </p>
        <JobBoard />
      </div>
    </AppShell>
  );
}
