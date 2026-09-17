import Link from "next/link";
import { Flame, Plus } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-6 pt-10 text-center lg:px-6">
      <div className="pointer-events-none absolute left-8 top-8 hidden text-3xl opacity-70 lg:block">
        🎓
      </div>
      <div className="pointer-events-none absolute right-16 top-12 hidden text-3xl opacity-70 lg:block">
        📚
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/4 hidden text-2xl opacity-60 lg:block">
        🔔
      </div>
      <div className="pointer-events-none absolute bottom-8 right-1/4 hidden text-2xl opacity-60 lg:block">
        ✏️
      </div>

      <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold brutal-sm">
        <span>Digital Campus Issue Notice Board</span>
        <span className="rounded-full bg-yellow px-2 py-0.5 text-xs font-black">
          ● Live Sync
        </span>
      </div>

      <h1 className="font-display text-5xl font-bold leading-tight text-ink md:text-7xl">
        See a Problem? Put It on the{" "}
        <span className="squiggle">Board</span>.
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-base font-semibold text-ink/70 md:text-lg">
        Report campus facilities issues, upvote community tickets, and collaborate
        with staff technicians to get repairs done fast.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/report"
          className="inline-flex items-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-base font-black brutal"
        >
          <Plus className="h-5 w-5" />
          Stick an Issue on the Board
        </Link>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-base font-black brutal"
        >
          <Flame className="h-5 w-5 text-orange-500" />
          View Leaderboard
        </Link>
      </div>

      <p className="font-display mt-4 text-xl text-ink/70">
        👇 explore live complaints pinned below
      </p>
    </section>
  );
}
