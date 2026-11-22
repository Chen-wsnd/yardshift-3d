"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Preview = dynamic(
  () =>
    import("@/features/garden/Gate0PreviewCanvas").then(
      (m) => m.Gate0PreviewCanvas,
    ),
  { ssr: false },
);

/** Isolated Gate 0 resource-fit preview of the full garden GLB. */
export default function Gate0PreviewPage() {
  return (
    <div className="flex h-screen flex-col bg-stone-900 text-stone-100">
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <span>Gate 0 — Saturday morning back garden (raw + hide list)</span>
        <Link href="/" className="underline">
          Back to garden
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <Preview />
      </div>
    </div>
  );
}
