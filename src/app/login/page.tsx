"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { homeForRole } from "@/lib/demo-users";
import type { UserRole } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, configured, profile, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && profile) {
      router.replace(homeForRole(profile.role));
    }
  }, [loading, profile, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") {
        const p = await login(email, password);
        router.replace(homeForRole(p?.role ?? "student"));
      } else {
        const p = await register(name, email, password, role);
        router.replace(homeForRole(p.role));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading || profile) {
    return (
      <main>
        <Navbar />
        <div className="flex min-h-[40vh] items-center justify-center font-bold text-ink/50">
          {profile ? "Opening your portal…" : "Loading…"}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-4 sm:py-6">
        <div className="w-full max-w-md">
          <h1 className="font-display text-center text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Sign in to CampusFix
          </h1>
          <p className="mt-1 text-center text-sm font-semibold text-ink/65 sm:mt-2">
            Enter your email and password to continue.
          </p>

          <section className="mt-4 rounded-2xl bg-white p-4 brutal sm:mt-5 sm:rounded-[1.75rem] sm:p-6">
            <h2 className="text-xl font-black sm:text-2xl">
              {mode === "login" ? "Login" : "Register"}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-ink/55 sm:text-sm">
              {configured ? "Connected to Appwrite Auth." : "Use your assigned test account."}
            </p>

            <form onSubmit={onSubmit} className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {mode === "register" && (
                <>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2.5 font-bold"
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2.5 font-bold"
                  >
                    <option value="student">Volunteer / Student</option>
                    <option value="worker">Worker / Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </>
              )}
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="username"
                className="w-full rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2.5 font-bold"
              />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full rounded-xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-2.5 font-bold"
              />
              {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
              <button
                disabled={busy}
                className="w-full rounded-xl bg-yellow py-3 text-base font-black brutal-sm disabled:opacity-50 sm:rounded-2xl sm:py-3.5"
              >
                {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="mt-2.5 w-full text-sm font-bold text-ink/60"
            >
              {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
