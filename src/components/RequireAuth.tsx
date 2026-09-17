"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/** Redirect guests to /login */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.replace("/login");
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-bold text-ink/50">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center font-bold text-ink/50">
        Redirecting to login…
      </div>
    );
  }

  return <>{children}</>;
}
