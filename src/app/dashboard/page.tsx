"use client";

import Link from "next/link";
import { Bell, Flame, Map, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { RoleGate } from "@/components/RoleGate";
import { STATUS_LABELS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useIssues } from "@/lib/issues-context";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <main>
        <Navbar />
        <RoleGate allow={["student"]} fallbackHref="/login">
          <StudentDashboard />
        </RoleGate>
      </main>
    </RequireAuth>
  );
}

function StudentDashboard() {
  const { profile } = useAuth();
  const { issues, supportedIds, notifications, stats } = useIssues();

  const mine = issues.filter((i) => i.reporterId === profile?.userId);
  const fixed = mine.filter((i) => ["resolved", "closed"].includes(i.status)).length;
  const upvotesGot = mine.reduce((sum, i) => sum + i.upvoteCount, 0);
  const supported = issues.filter((i) => supportedIds.includes(i.$id));
  const unread = notifications.filter((n) => !n.read && n.userId === profile?.userId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl font-bold">My Complaints</h1>
      <p className="mt-2 font-semibold text-ink/65">
        Volunteer dashboard · public board stays open for everyone
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Tickets reported", mine.length],
          ["Upvotes received", upvotesGot],
          ["Tickets fixed", fixed],
          ["Tickets supported", supported.length || profile?.issuesSupported || 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl bg-white p-4 brutal">
            <div className="text-3xl font-black">{value}</div>
            <div className="text-xs font-extrabold uppercase text-ink/55">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/report" className="inline-flex items-center gap-1 rounded-xl bg-yellow px-3 py-2 text-sm font-black brutal-sm">
          <Plus className="h-4 w-4" /> Report issue
        </Link>
        <Link href="/" className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-black brutal-sm">
          Public board ({stats.total})
        </Link>
        <Link href="/leaderboard" className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-black brutal-sm">
          <Flame className="h-4 w-4 text-orange-500" /> Leaderboard
        </Link>
        <Link href="/heatmap" className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-black brutal-sm">
          <Map className="h-4 w-4" /> Campus map
        </Link>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-4 brutal">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <Bell className="h-5 w-5" /> Notifications
          {unread.length > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
              {unread.length}
            </span>
          )}
        </h2>
        <div className="mt-3 space-y-2">
          {notifications.length === 0 && (
            <p className="text-sm font-semibold text-ink/45">No notifications yet.</p>
          )}
          {notifications.map((n) => (
            <Link
              key={n.$id}
              href={`/issue/${n.issueId}`}
              className={`block rounded-2xl px-3 py-2 text-sm font-semibold ${
                n.read ? "bg-[#fff8e8]" : "bg-[#e8dcff]"
              }`}
            >
              <div className="font-extrabold">{n.title}</div>
              <div className="text-ink/60">{n.message}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black">My Reports</h2>
        <div className="mt-3 space-y-2">
          {mine.length === 0 && (
            <p className="rounded-2xl bg-white p-4 font-semibold text-ink/50 brutal-sm">
              No reports yet.{" "}
              <Link href="/report" className="underline">
                Stick an issue
              </Link>
              .
            </p>
          )}
          {mine.map((i) => (
            <Link
              key={i.$id}
              href={`/issue/${i.$id}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 brutal-sm"
            >
              <div>
                <div className="font-extrabold">{i.title}</div>
                <div className="text-xs font-bold text-ink/55">
                  {i.ticketId} · {STATUS_LABELS[i.status]}
                </div>
              </div>
              <span className="text-sm font-black">{i.upvoteCount} ▲</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black">Supported (upvoted by you)</h2>
        <div className="mt-3 space-y-2">
          {supported.length === 0 && (
            <p className="rounded-2xl bg-[#e8dcff]/40 p-4 text-sm font-semibold text-ink/55 brutal-sm">
              Upvote tickets on the public board to track them here.
            </p>
          )}
          {supported.map((i) => (
            <Link
              key={i.$id}
              href={`/issue/${i.$id}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-[#e8dcff]/50 p-4 brutal-sm"
            >
              <div>
                <div className="font-extrabold">{i.title}</div>
                <div className="text-xs font-bold text-ink/55">{i.ticketId}</div>
              </div>
              <span className="text-sm font-black">{i.upvoteCount} ▲</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
