"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";

export function RoleGate({
  allow,
  children,
  fallbackHref = "/login",
}: {
  allow: UserRole[];
  children: ReactNode;
  fallbackHref?: string;
}) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="px-4 py-16 text-center font-bold text-ink/50">Loading…</div>
    );
  }

  if (!profile || !allow.includes(profile.role)) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-bold">Access restricted</h1>
        <p className="mt-2 font-semibold text-ink/60">
          This area is for {allow.join(" / ")} only.
        </p>
        <Link href={fallbackHref} className="mt-4 inline-block font-black underline">
          Switch role / login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
