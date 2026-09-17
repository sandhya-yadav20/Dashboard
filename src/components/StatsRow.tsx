"use client";

import { CheckCircle2, FileText, Pin, ThumbsUp } from "lucide-react";
import { useIssues } from "@/lib/issues-context";

export function StatsRow() {
  const { stats } = useIssues();

  const cards = [
    {
      label: "TOTAL TICKETS",
      value: stats.total,
      icon: FileText,
      className: "bg-white",
    },
    {
      label: "ACTIVE ON BOARD",
      value: stats.active,
      icon: Pin,
      className: "bg-yellow",
    },
    {
      label: "ISSUES RESOLVED",
      value: stats.resolved,
      icon: CheckCircle2,
      className: "bg-mint",
    },
    {
      label: "COMMUNITY UPVOTES",
      value: stats.upvotes,
      icon: ThumbsUp,
      className: "bg-[#e8dcff]",
    },
  ];

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 lg:grid-cols-4 lg:px-6">
      {cards.map(({ label, value, icon: Icon, className }) => (
        <div key={label} className={`rounded-2xl p-4 brutal ${className}`}>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-3xl font-black tabular-nums">{value}</div>
          <div className="mt-1 text-xs font-extrabold tracking-wide text-ink/60">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
