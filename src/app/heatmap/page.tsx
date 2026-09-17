"use client";

import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { useIssues } from "@/lib/issues-context";

export default function HeatmapPage() {
  return (
    <RequireAuth>
      <HeatmapInner />
    </RequireAuth>
  );
}

function HeatmapInner() {
  const { issues } = useIssues();
  const byBuilding = Object.entries(
    issues.reduce<Record<string, { total: number; active: number; resolved: number }>>(
      (acc, issue) => {
        const key = issue.building;
        if (!acc[key]) acc[key] = { total: 0, active: 0, resolved: 0 };
        acc[key].total += 1;
        if (["resolved", "closed"].includes(issue.status)) acc[key].resolved += 1;
        else acc[key].active += 1;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b[1].active - a[1].active);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
        <h1 className="font-display text-5xl font-bold">Campus Heatmap</h1>
        <p className="mt-2 font-semibold text-ink/65">
          Zones colored by active complaint severity
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {byBuilding.map(([building, stats]) => {
            const tone =
              stats.active >= 3
                ? "bg-rose-200"
                : stats.active >= 1
                  ? "bg-yellow"
                  : "bg-mint";
            const label =
              stats.active >= 3 ? "Critical/High" : stats.active >= 1 ? "Moderate" : "Optimal";
            return (
              <div key={building} className={`rounded-3xl p-4 brutal ${tone}`}>
                <div className="text-lg font-black">{building}</div>
                <div className="mt-1 text-xs font-extrabold uppercase tracking-wide">
                  {label}
                </div>
                <div className="mt-3 text-sm font-bold">
                  Active {stats.active} · Resolved {stats.resolved} · Total {stats.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
