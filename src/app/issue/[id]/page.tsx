"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { StickyNote } from "@/components/StickyNote";
import { STATUS_LABELS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useIssues } from "@/lib/issues-context";
import type { IssueStatus, Profile } from "@/lib/types";

export default function IssueDetailPage() {
  return (
    <RequireAuth>
      <IssueDetailInner />
    </RequireAuth>
  );
}

function IssueDetailInner() {
  const params = useParams<{ id: string }>();
  const { issues, workers, setStatus, assignIssue, addFixNote, addComment, comments } =
    useIssues();
  const { profile } = useAuth();
  const issue = issues.find((i) => i.$id === params.id);
  const [comment, setComment] = useState("");
  const [fixNote, setFixNote] = useState("");

  const thread = useMemo(
    () => comments.filter((c) => c.issueId === params.id),
    [comments, params.id],
  );

  if (!issue) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="font-display text-4xl font-bold">Sticky note not found</h1>
          <Link href="/" className="mt-4 inline-block font-bold underline">
            Back to board
          </Link>
        </div>
      </main>
    );
  }

  const isAdmin = profile?.role === "admin";
  const isWorker = profile?.role === "worker";
  const isAssignee = isWorker && issue.assigneeId === profile?.userId;
  const isStudent = !profile || profile.role === "student";

  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (isWorker && !isAssignee) return;
    await addComment(issue!.$id, comment);
    setComment("");
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
        <StickyNote issue={issue} />
        <div className="rounded-3xl bg-white p-5 brutal">
          <h2 className="text-xl font-black">Progress & discussion</h2>
          <p className="mt-2 text-sm font-semibold text-ink/65">
            Reported by {issue.reporterName}
            {isAdmin && issue.reporterEmail ? ` · ${issue.reporterEmail}` : ""}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink/65">
            Status: <strong>{STATUS_LABELS[issue.status]}</strong>
            {issue.assigneeName ? ` · Assigned to ${issue.assigneeName}` : ""}
          </p>
          {issue.fixNote && (
            <p className="mt-2 rounded-xl bg-mint/50 px-3 py-2 text-sm font-semibold">
              Fix note: {issue.fixNote}
            </p>
          )}

          {isAdmin && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-extrabold">Assign worker</label>
              <select
                className="w-full rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2.5 font-bold"
                value={issue.assigneeId || ""}
                onChange={(e) => {
                  const w = workers.find((x) => x.userId === e.target.value);
                  if (w) void assignIssue(issue.$id, w);
                }}
              >
                <option value="">Select worker…</option>
                {workers.map((w: Profile) => (
                  <option key={w.userId} value={w.userId}>
                    {w.name}
                  </option>
                ))}
              </select>
              <label className="text-sm font-extrabold">Change status</label>
              <select
                className="w-full rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2.5 font-bold"
                value={issue.status}
                onChange={(e) => void setStatus(issue.$id, e.target.value as IssueStatus)}
              >
                {(
                  [
                    "new",
                    "assigned",
                    "in_progress",
                    "escalated",
                    "awaiting_confirmation",
                    "resolved",
                    "closed",
                  ] as IssueStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isAssignee && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-extrabold">
                Update status (Assigned → In Progress → Resolved)
              </label>
              <select
                className="w-full rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2.5 font-bold"
                value={issue.status}
                onChange={(e) => void setStatus(issue.$id, e.target.value as IssueStatus)}
              >
                {(["assigned", "in_progress", "resolved"] as IssueStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <label className="text-sm font-extrabold">Add fix note</label>
              <div className="flex gap-2">
                <input
                  value={fixNote || issue.fixNote || ""}
                  onChange={(e) => setFixNote(e.target.value)}
                  className="flex-1 rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2 font-bold"
                  placeholder="What was fixed…"
                />
                <button
                  type="button"
                  className="rounded-xl bg-mint px-3 py-2 font-black brutal-sm"
                  onClick={() => void addFixNote(issue.$id, fixNote || issue.fixNote || "")}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {isWorker && !isAssignee && (
            <p className="mt-4 rounded-xl bg-[#fff3c4] px-3 py-2 text-sm font-semibold">
              Read-only: this ticket is not assigned to you. Manage jobs from Worker Portal.
            </p>
          )}

          {isStudent && (
            <p className="mt-4 text-xs font-bold text-ink/50">
              Students can upvote & comment. Assign / escalate is admin-only.
            </p>
          )}

          {(!isWorker || isAssignee) && (
          <form onSubmit={onComment} className="mt-6 space-y-2">
            <label className="text-sm font-extrabold">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-20 w-full rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2 font-semibold"
              placeholder="Add a public comment…"
            />
            <button type="submit" className="rounded-xl bg-yellow px-4 py-2 text-sm font-black brutal-sm">
              Post comment
            </button>
          </form>
          )}

          <div className="mt-4 space-y-2">
            {thread.map((c) => (
              <div key={c.$id} className="rounded-xl bg-[#fff8e8] px-3 py-2 text-sm">
                <div className="font-extrabold">{c.authorName}</div>
                <div className="font-semibold text-ink/70">{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
