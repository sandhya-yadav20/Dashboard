"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { RoleGate } from "@/components/RoleGate";
import { STATUS_LABELS } from "@/lib/constants";
import { sortByPriority, useIssues } from "@/lib/issues-context";
import { useAuth } from "@/lib/auth-context";
import type { IssueStatus } from "@/lib/types";

const WORKER_STATUSES: IssueStatus[] = ["assigned", "in_progress", "resolved"];

export default function WorkerPage() {
  return (
    <RequireAuth>
      <main>
        <Navbar />
        <RoleGate allow={["worker"]}>
          <WorkerDashboard />
        </RoleGate>
      </main>
    </RequireAuth>
  );
}

function WorkerDashboard() {
  const { profile } = useAuth();
  const { issues, setStatus, addFixNote } = useIssues();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const mine = useMemo(
    () =>
      issues
        .filter((i) => i.assigneeId === profile?.userId)
        .filter((i) => i.status !== "closed")
        .sort(sortByPriority),
    [issues, profile?.userId],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl font-bold">Worker Portal</h1>
      <p className="mt-2 font-semibold text-ink/65">
        Only your assigned jobs · high priority first · no student personal info
      </p>

      <div className="mt-6 space-y-3">
        {mine.length === 0 && (
          <p className="rounded-2xl bg-white p-6 font-semibold text-ink/50 brutal">
            No tickets assigned to you yet.
          </p>
        )}

        {mine.map((issue) => (
          <article key={issue.$id} className="rounded-3xl bg-white p-4 brutal">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-wide text-rose-600">
                  {issue.priority} priority
                </div>
                <Link href={`/issue/${issue.$id}`} className="text-lg font-black hover:underline">
                  {issue.title}
                </Link>
                <div className="mt-1 text-xs font-bold text-ink/55">
                  {issue.ticketId} · {STATUS_LABELS[issue.status]}
                </div>
                <div className="mt-2 inline-flex items-start gap-1 text-sm font-extrabold">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {issue.building}
                    <span className="block text-xs font-semibold text-ink/55">
                      Room/Area: {issue.room}
                    </span>
                  </span>
                </div>
              </div>

              <select
                className="rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2 text-sm font-bold"
                value={WORKER_STATUSES.includes(issue.status) ? issue.status : "assigned"}
                onChange={(e) => void setStatus(issue.$id, e.target.value as IssueStatus)}
              >
                {WORKER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label className="text-xs font-extrabold">Fix note (when resolved)</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={notes[issue.$id] ?? issue.fixNote ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [issue.$id]: e.target.value }))
                  }
                  placeholder="What was fixed / parts used…"
                  className="flex-1 rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2 text-sm font-bold"
                />
                <button
                  type="button"
                  className="rounded-xl bg-mint px-3 py-2 text-sm font-black brutal-sm"
                  onClick={() =>
                    void addFixNote(issue.$id, notes[issue.$id] ?? issue.fixNote ?? "")
                  }
                >
                  Save note
                </button>
              </div>
              {issue.fixNote ? (
                <p className="mt-2 rounded-xl bg-[#fff8e8] px-3 py-2 text-xs font-semibold">
                  Saved: {issue.fixNote}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
