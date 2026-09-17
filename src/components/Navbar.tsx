"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  FileText,
  Map,
  Plus,
  Trophy,
  Pin,
  Shield,
  Wrench,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useIssues } from "@/lib/issues-context";
import { homeForRole } from "@/lib/demo-users";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const { notifications } = useIssues();

  // Minimal brand bar on login (no fake volunteer session)
  if (!profile) {
    return (
      <header className="shrink-0 border-b-2 border-ink/10 bg-[#fff9e8]/95">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-2.5 lg:px-6">
          <Link href="/login" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow text-sm font-black brutal-sm">
              CF
            </span>
            <span>
              <span className="block text-lg font-black leading-none text-ink">
                CampusFix <span className="text-xs font-bold text-ink/50">v2.0</span>
              </span>
              <span className="text-[11px] font-semibold text-ink/55">
                Doodle Board • Real-Time Campus Repairs
              </span>
            </span>
          </Link>
        </div>
      </header>
    );
  }

  const role = profile.role;
  const unread = notifications.filter((n) => !n.read && n.userId === profile.userId).length;

  const links =
    role === "admin"
      ? [
          { href: "/admin", label: "Admin", icon: Shield },
          { href: "/", label: "Board", icon: Pin },
        ]
      : role === "worker"
        ? [
            { href: "/worker", label: "My Jobs", icon: Wrench },
            { href: "/", label: "Board", icon: Pin },
          ]
        : [
            { href: "/", label: "Doodle Board", icon: Pin },
            { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
            { href: "/heatmap", label: "Heatmap", icon: Map },
            { href: "/dashboard", label: "My Complaints", icon: FileText },
          ];

  const roleLabel =
    role === "admin" ? "ADMIN" : role === "worker" ? "STAFF" : "VOLUNTEER";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink/10 bg-[#fff9e8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 lg:gap-4 lg:px-6">
        <Link href={homeForRole(role)} className="flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow text-sm font-black brutal-sm">
            CF
          </span>
          <span className="hidden min-[400px]:block">
            <span className="block text-base font-black leading-none text-ink sm:text-lg">
              CampusFix <span className="text-xs font-bold text-ink/50">v2.0</span>
            </span>
            <span className="hidden text-[11px] font-semibold text-ink/55 lg:block">
              Doodle Board • Campus Repairs
            </span>
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center">
          <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-white p-1 brutal-sm">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href + label}
                  href={href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-extrabold transition sm:px-3 sm:text-sm ${
                    active
                      ? "bg-[#1f2a44] text-white shadow-sm"
                      : "text-[#1a2744]/80 hover:bg-yellow/40"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                      active ? "text-white stroke-white" : "text-current"
                    }`}
                    strokeWidth={2.5}
                  />
                  <span className={active ? "text-white" : undefined}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {role === "student" && (
            <>
              <Link
                href="/dashboard"
                className="relative rounded-full bg-white p-2 brutal-sm"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center gap-1 rounded-xl bg-yellow px-2.5 py-2 text-xs font-extrabold brutal-sm sm:px-3 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden xl:inline">Stick an Issue</span>
              </Link>
            </>
          )}

          <div className="flex items-center gap-1.5 rounded-2xl bg-white py-1 pl-1 pr-1.5 brutal-sm sm:gap-2 sm:pr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-black text-white sm:h-9 sm:w-9 sm:text-sm">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="max-w-[9rem] truncate text-sm font-extrabold">{profile.name}</div>
              <span className="inline-block rounded-full bg-mint px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide">
                {roleLabel}
              </span>
            </div>
            <button
              type="button"
              title="Log out"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="rounded-lg p-1.5 hover:bg-[#fff8e8]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
