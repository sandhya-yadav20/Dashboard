"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Clock3,
  MapPin,
  MessageCircle,
  ThumbsUp,
  Wifi,
  Droplets,
  Zap,
  Toilet,
  Monitor,
  BookOpen,
  Sparkles,
  FlaskConical,
  Armchair,
  HelpCircle,
} from "lucide-react";
import { CATEGORY_COLORS, STATUS_LABELS } from "@/lib/constants";
import { timeAgo, useIssues } from "@/lib/issues-context";
import type { Issue, IssueCategory } from "@/lib/types";

const categoryIcons: Record<IssueCategory, typeof Wifi> = {
  "Wi-Fi & Network": Wifi,
  "Plumbing & Water": Droplets,
  Electrical: Zap,
  "Washroom Facilities": Toilet,
  "Classroom & AV": Monitor,
  "Library & Study Hall": BookOpen,
  "Cleanliness & Hygiene": Sparkles,
  "Laboratory Equipment": FlaskConical,
  "Furniture & Fixtures": Armchair,
  Other: HelpCircle,
};

function priorityLabel(p: Issue["priority"]) {
  if (p === "high" || p === "critical") return "High Priority";
  if (p === "medium") return "Medium";
  return "Low";
}

export function StickyNote({ issue, index = 0 }: { issue: Issue; index?: number }) {
  const { upvote } = useIssues();
  const Icon = categoryIcons[issue.category] ?? HelpCircle;
  const bg = CATEGORY_COLORS[issue.category] ?? "#F3F4F6";
  const escalated = issue.status === "escalated";
  const useTape = index % 3 === 1;

  return (
    <article
      className="relative flex h-full flex-col rounded-3xl p-4 pt-5 brutal"
      style={{ background: bg }}
    >
      <div className="absolute left-1/2 top-[-10px] z-10 -translate-x-1/2">
        {useTape ? <div className="tape" /> : <div className="pushpin" />}
      </div>

      {escalated && (
        <div className="stamp flex items-center gap-1">
          <AlertTriangle className="h-4 w-4" />
          ESCALATED
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-ink/70">
          <Icon className="h-3.5 w-3.5" />
          {issue.category}
        </span>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-ink/60">
          {issue.ticketId}
        </span>
        <span className="rounded-full border-2 border-rose-500 bg-white/70 px-2 py-0.5 text-[11px] font-black text-rose-600">
          {priorityLabel(issue.priority)}
        </span>
      </div>

      <h3 className="text-lg font-black leading-snug text-navy">{issue.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm font-semibold text-ink/70">
        {issue.description}
      </p>

      {issue.photoUrl ? (
        <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white/70 px-2 py-1 text-xs font-bold text-ink/60">
          <Camera className="h-3.5 w-3.5" />
          1 Attached Photo
        </div>
      ) : null}

      <div className="mt-3 rounded-xl bg-white/55 p-2.5">
        <div className="flex items-start gap-1.5 text-sm font-extrabold">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{issue.building}</span>
        </div>
        <div className="mt-1 pl-5 text-xs font-semibold text-ink/60">
          Room/Area: {issue.room}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
            escalated
              ? "bg-rose-500 text-white"
              : issue.status === "resolved" || issue.status === "closed"
                ? "bg-emerald-500 text-white"
                : "bg-navy text-white"
          }`}
        >
          {escalated && <AlertTriangle className="h-3 w-3" />}
          {STATUS_LABELS[issue.status]}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-ink/55">
          <Clock3 className="h-3.5 w-3.5" />
          {timeAgo(issue.$createdAt)}
        </span>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <button
          type="button"
          onClick={() => void upvote(issue.$id)}
          className="inline-flex items-center gap-1 rounded-xl bg-[#ffb347] px-3 py-2 text-xs font-black brutal-sm"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          {issue.upvoteCount} Upvoted
        </button>
        <span className="inline-flex items-center gap-1 rounded-xl bg-white/80 px-2.5 py-2 text-xs font-bold">
          <MessageCircle className="h-3.5 w-3.5" />
          {issue.commentCount}
        </span>
        <Link
          href={`/issue/${issue.$id}`}
          className="ml-auto inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black brutal-sm"
        >
          Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
