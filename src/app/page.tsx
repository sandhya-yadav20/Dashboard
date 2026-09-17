"use client";

import { useMemo, useState } from "react";
import { Pin } from "lucide-react";
import { BoardFilters } from "@/components/BoardFilters";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { StatsRow } from "@/components/StatsRow";
import { StickyNote } from "@/components/StickyNote";
import { useIssues } from "@/lib/issues-context";
import type { IssueCategory, IssuePriority, IssueStatus, SortOption } from "@/lib/types";

export default function HomePage() {
  return (
    <RequireAuth>
      <BoardPage />
    </RequireAuth>
  );
}

function BoardPage() {
  const { issues, filterIssues, usingDemo } = useIssues();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IssueStatus | "all">("all");
  const [priority, setPriority] = useState<IssuePriority | "all">("all");
  const [category, setCategory] = useState<IssueCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>("most_upvoted");

  const filtered = useMemo(
    () => filterIssues({ search, status, priority, category, sort }),
    [filterIssues, search, status, priority, category, sort],
  );

  return (
    <main>
      <Navbar />
      <Hero />
      <StatsRow />

      {usingDemo && (
        <div className="mx-auto mt-4 max-w-7xl px-4 lg:px-6">
          <div className="rounded-2xl bg-[#fff3c4] px-4 py-3 text-sm font-bold brutal-sm">
            Using demo ticket data until Appwrite region endpoint is connected.
          </div>
        </div>
      )}

      <BoardFilters
        search={search}
        status={status}
        priority={priority}
        category={category}
        sort={sort}
        issues={issues}
        onSearch={setSearch}
        onStatus={setStatus}
        onPriority={setPriority}
        onCategory={setCategory}
        onSort={setSort}
      />

      <section className="mx-auto mt-6 max-w-7xl px-4 pb-16 lg:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display flex items-center gap-2 text-4xl font-bold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-yellow">
                <Pin className="h-5 w-5" />
              </span>
              Campus Sticky Board
            </h2>
            <p className="mt-1 text-sm font-semibold text-ink/60">
              Showing {filtered.length} of {issues.length} pinned issues
            </p>
          </div>
          <p className="text-sm font-semibold text-ink/55">
            Click any sticky note to view progress & discussion
          </p>
        </div>

        <div className="rounded-[2rem] bg-board/70 p-4 brutal md:p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((issue, index) => (
              <StickyNote key={issue.$id} issue={issue} index={index} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-16 text-center text-lg font-bold text-ink/50">
              No sticky notes match these filters.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
