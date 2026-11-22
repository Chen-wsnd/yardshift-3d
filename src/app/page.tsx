import { AppShell } from "@/components/layout/AppShell";
import { JobBoard } from "@/features/jobs";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-sm uppercase tracking-[0.2em] text-emerald-800/70">
          Sundai Club hackathon prototype
        </p>
        <JobBoard />
      </div>
    </AppShell>
  );
}
