"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { useIssues } from "@/lib/issues-context";

export default function LeaderboardPage() {
  return (
    <RequireAuth>
      <LeaderboardInner />
    </RequireAuth>
  );
}

function LeaderboardInner() {
  const { issues } = useIssues();
  const ranked = [...issues].sort((a, b) => b.upvoteCount - a.upvoteCount);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
        <h1 className="font-display flex items-center gap-2 text-5xl font-bold">
          <Trophy className="h-10 w-10 text-yellow-deep" />
          Leaderboard
        </h1>
        <p className="mt-2 font-semibold text-ink/65">
          Issues ranked by community upvotes
        </p>
        <div className="mt-6 space-y-2">
          {ranked.map((issue, idx) => (
            <Link
              key={issue.$id}
              href={`/issue/${issue.$id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 brutal-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow text-sm font-black">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-extrabold">{issue.title}</div>
                <div className="text-xs font-bold text-ink/55">
                  {issue.ticketId} · {issue.category}
                </div>
              </div>
              <span className="text-sm font-black">{issue.upvoteCount} ▲</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
