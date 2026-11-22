import { AppShell } from "@/components/layout/AppShell";
import { JobBoard } from "@/features/jobs";

/** Hidden v0.2 task board / economy path — retained for compatibility. */
export default function LegacyBoardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-[family-name:var(--font-display)] text-4xl text-emerald-950 sm:text-5xl">
          YardShift
        </p>
        <p className="mb-6 max-w-prose text-stone-600">
          Legacy v0.2 task board (hidden from the primary garden path). Use the
          garden overview at home for the v0.3 lawn slice.
        </p>
        <JobBoard />
      </div>
    </AppShell>
  );
}
