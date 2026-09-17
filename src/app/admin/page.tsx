"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Pin,
  ThumbsUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { RoleGate } from "@/components/RoleGate";
import { STATUS_LABELS } from "@/lib/constants";
import { useIssues } from "@/lib/issues-context";
import type { IssueStatus, Profile } from "@/lib/types";

export default function AdminPage() {
  return (
    <RequireAuth>
      <main>
        <Navbar />
        <RoleGate allow={["admin"]}>
          <AdminDashboard />
        </RoleGate>
      </main>
    </RequireAuth>
  );
}

function AdminDashboard() {
  const {
    issues,
    workers,
    students,
    stats,
    assignIssue,
    setStatus,
    addWorker,
    removeWorker,
  } = useIssues();

  const waiting = issues.filter((i) => i.status === "new");
  const escalated = issues.filter((i) => i.status === "escalated");

  const byBuilding = useMemo(() => groupCount(issues.map((i) => i.building)), [issues]);
  const byCategory = useMemo(() => groupCount(issues.map((i) => i.category)), [issues]);

  const workerLoad = workers.map((w) => ({
    worker: w,
    count: issues.filter(
      (i) => i.assigneeId === w.userId && !["resolved", "closed"].includes(i.status),
    ).length,
  }));

  const [workerName, setWorkerName] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");

  function onAddWorker(e: FormEvent) {
    e.preventDefault();
    if (!workerName.trim() || !workerEmail.trim()) return;
    addWorker(workerName.trim(), workerEmail.trim());
    setWorkerName("");
    setWorkerEmail("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl font-bold">Admin Portal</h1>
      <p className="mt-2 font-semibold text-ink/65">
        Full campus view — assign, triage, manage workers & student contacts
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={FileText} label="Total tickets" value={stats.total} className="bg-white" />
        <Stat icon={Pin} label="Active tickets" value={stats.active} className="bg-yellow" />
        <Stat icon={CheckCircle2} label="Resolved" value={stats.resolved} className="bg-mint" />
        <Stat icon={ThumbsUp} label="Total upvotes" value={stats.upvotes} className="bg-[#e8dcff]" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title={`New — waiting assignment (${waiting.length})`}>
          {waiting.length === 0 && <Empty>No unassigned new tickets.</Empty>}
          {waiting.map((issue) => (
            <TicketRow
              key={issue.$id}
              issueId={issue.$id}
              title={issue.title}
              meta={`${issue.ticketId} · ${issue.building} · ${issue.reporterName} · ${issue.reporterEmail || "no email"}`}
            >
              <AssignSelect
                workers={workers}
                onAssign={(w) => void assignIssue(issue.$id, w)}
              />
            </TicketRow>
          ))}
        </Panel>

        <Panel title={`Escalated / overdue (${escalated.length})`}>
          {escalated.length === 0 && <Empty>No escalated tickets.</Empty>}
          {escalated.map((issue) => (
            <TicketRow
              key={issue.$id}
              issueId={issue.$id}
              title={issue.title}
              meta={`${issue.ticketId} · ${STATUS_LABELS[issue.status]} · ${issue.reporterEmail || ""}`}
              danger
            >
              <AssignSelect
                workers={workers}
                onAssign={(w) => void assignIssue(issue.$id, w)}
              />
              <StatusSelect
                value={issue.status}
                onChange={(s) => void setStatus(issue.$id, s)}
                admin
              />
            </TicketRow>
          ))}
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Tickets by building">
          {byBuilding.map(([name, count]) => (
            <Bar key={name} label={name} count={count} icon={<Building2 className="h-4 w-4" />} />
          ))}
        </Panel>
        <Panel title="Tickets by category">
          {byCategory.map(([name, count]) => (
            <Bar key={name} label={name} count={count} />
          ))}
        </Panel>
      </div>

      <Panel title="Worker workload" className="mt-6">
        <div className="grid gap-2 sm:grid-cols-2">
          {workerLoad.map(({ worker, count }) => (
            <div key={worker.userId} className="rounded-2xl bg-[#fff8e8] p-3 brutal-sm">
              <div className="font-extrabold">{worker.name}</div>
              <div className="text-xs font-bold text-ink/55">{worker.email}</div>
              <div className="mt-2 text-sm font-black">{count} active tickets</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="All tickets — change status / assign">
          {issues.map((issue) => (
            <TicketRow
              key={issue.$id}
              issueId={issue.$id}
              title={issue.title}
              meta={`${issue.ticketId} · ${issue.assigneeName || "Unassigned"} · ${issue.reporterName}`}
            >
              <AssignSelect
                workers={workers}
                value={issue.assigneeId}
                onAssign={(w) => void assignIssue(issue.$id, w)}
              />
              <StatusSelect
                value={issue.status}
                onChange={(s) => void setStatus(issue.$id, s)}
                admin
              />
            </TicketRow>
          ))}
        </Panel>

        <div className="space-y-4">
          <Panel title="Student directory (admin only)">
            {students.map((s) => (
              <div key={s.userId} className="rounded-2xl bg-white p-3 brutal-sm">
                <div className="font-extrabold">{s.name}</div>
                <div className="text-xs font-bold text-ink/55">{s.email}</div>
                <div className="mt-1 text-xs font-semibold text-ink/50">
                  Reports {s.reportsCreated} · Upvotes {s.upvotesReceived}
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Worker accounts">
            <form onSubmit={onAddWorker} className="mb-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                placeholder="Worker name"
                className="rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2 text-sm font-bold"
              />
              <input
                value={workerEmail}
                onChange={(e) => setWorkerEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2 text-sm font-bold"
              />
              <button type="submit" className="inline-flex items-center justify-center gap-1 rounded-xl bg-yellow px-3 py-2 text-sm font-black brutal-sm">
                <UserPlus className="h-4 w-4" /> Add
              </button>
            </form>
            {workers.map((w) => (
              <div key={w.userId} className="mb-2 flex items-center justify-between gap-2 rounded-2xl bg-[#e8dcff]/40 p-3 brutal-sm">
                <div>
                  <div className="flex items-center gap-1 font-extrabold">
                    <Users className="h-4 w-4" /> {w.name}
                  </div>
                  <div className="text-xs font-bold text-ink/55">{w.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeWorker(w.userId)}
                  className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-black text-rose-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-2xl p-4 brutal ${className}`}>
      <Icon className="mb-2 h-5 w-5" />
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs font-extrabold uppercase text-ink/55">{label}</div>
    </div>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-white p-4 brutal ${className}`}>
      <h2 className="mb-3 text-lg font-black">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold text-ink/45">{children}</p>;
}

function TicketRow({
  issueId,
  title,
  meta,
  children,
  danger,
}: {
  issueId: string;
  title: string;
  meta: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-3 brutal-sm ${danger ? "bg-rose-50" : "bg-[#fffdf6]"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link href={`/issue/${issueId}`} className="font-extrabold hover:underline">
            {danger && <AlertTriangle className="mr-1 inline h-4 w-4 text-rose-600" />}
            {title}
          </Link>
          <div className="text-xs font-bold text-ink/55">{meta}</div>
        </div>
        <div className="flex flex-wrap gap-2">{children}</div>
      </div>
    </div>
  );
}

function AssignSelect({
  workers,
  onAssign,
  value,
}: {
  workers: Profile[];
  onAssign: (w: Profile) => void;
  value?: string;
}) {
  return (
    <select
      className="rounded-xl border-2 border-ink/15 bg-white px-2 py-1.5 text-xs font-bold"
      value={value || ""}
      onChange={(e) => {
        const w = workers.find((x) => x.userId === e.target.value);
        if (w) onAssign(w);
      }}
    >
      <option value="">Assign worker…</option>
      {workers.map((w) => (
        <option key={w.userId} value={w.userId}>
          {w.name}
        </option>
      ))}
    </select>
  );
}

function StatusSelect({
  value,
  onChange,
  admin,
}: {
  value: IssueStatus;
  onChange: (s: IssueStatus) => void;
  admin?: boolean;
}) {
  const opts: IssueStatus[] = admin
    ? ["new", "assigned", "in_progress", "escalated", "awaiting_confirmation", "resolved", "closed"]
    : ["assigned", "in_progress", "resolved"];
  return (
    <select
      className="rounded-xl border-2 border-ink/15 bg-white px-2 py-1.5 text-xs font-bold"
      value={value}
      onChange={(e) => onChange(e.target.value as IssueStatus)}
    >
      {opts.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

function Bar({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-[#fff8e8] px-3 py-2">
      <span className="inline-flex items-center gap-1 text-sm font-bold">
        {icon}
        {label}
      </span>
      <span className="font-black">{count}</span>
    </div>
  );
}

function groupCount(values: string[]) {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
