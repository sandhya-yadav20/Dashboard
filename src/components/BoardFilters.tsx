"use client";

import { Search } from "lucide-react";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/constants";
import type { Issue, IssueCategory, IssuePriority, IssueStatus, SortOption } from "@/lib/types";

type Props = {
  search: string;
  status: IssueStatus | "all";
  priority: IssuePriority | "all";
  category: IssueCategory | "all";
  sort: SortOption;
  issues: Issue[];
  onSearch: (v: string) => void;
  onStatus: (v: IssueStatus | "all") => void;
  onPriority: (v: IssuePriority | "all") => void;
  onCategory: (v: IssueCategory | "all") => void;
  onSort: (v: SortOption) => void;
};

export function BoardFilters(props: Props) {
  const counts = CATEGORIES.map((c) => ({
    category: c,
    count: props.issues.filter((i) => i.category === c).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="mx-auto mt-6 max-w-7xl px-4 lg:px-6">
      <div className="rounded-3xl bg-white p-4 brutal md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              value={props.search}
              onChange={(e) => props.onSearch(e.target.value)}
              placeholder="Search by issue title, room (e.g. 204), ticket ID (CF-1001), or building..."
              className="w-full rounded-2xl border-2 border-ink/15 bg-[#fffdf6] py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-ink"
            />
          </label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              value={props.status}
              onChange={(e) => props.onStatus(e.target.value as IssueStatus | "all")}
              className="rounded-2xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-3 text-sm font-bold"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={props.priority}
              onChange={(e) =>
                props.onPriority(e.target.value as IssuePriority | "all")
              }
              className="rounded-2xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-3 text-sm font-bold"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={props.sort}
              onChange={(e) => props.onSort(e.target.value as SortOption)}
              className="rounded-2xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-3 text-sm font-bold"
            >
              <option value="most_upvoted">Most Upvoted</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => props.onCategory("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-extrabold brutal-sm ${
              props.category === "all" ? "bg-navy text-white" : "bg-[#fff8e8]"
            }`}
          >
            All ({props.issues.length})
          </button>
          {counts.map(({ category, count }) => (
            <button
              key={category}
              type="button"
              onClick={() => props.onCategory(category)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-extrabold brutal-sm ${
                props.category === category ? "bg-navy text-white" : "bg-[#fff8e8]"
              }`}
            >
              {category} ({count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
