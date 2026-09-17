"use client";

import { FormEvent, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { RoleGate } from "@/components/RoleGate";
import { CATEGORIES, PRIORITIES } from "@/lib/constants";
import { useIssues } from "@/lib/issues-context";
import type { IssueCategory, IssuePriority } from "@/lib/types";

const fieldClass =
  "w-full rounded-2xl border-2 border-ink/15 bg-[#fffdf6] px-3 py-3 text-sm font-bold outline-none focus:border-ink";

export default function ReportPage() {
  return (
    <RequireAuth>
      <main>
        <Navbar />
        <RoleGate allow={["student"]}>
          <ReportForm />
        </RoleGate>
      </main>
    </RequireAuth>
  );
}

function ReportForm() {
  const router = useRouter();
  const { addIssue } = useIssues();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("Electrical");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("high");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const issue = await addIssue({
        title,
        description,
        category,
        building,
        room,
        priority,
        photoUrl,
      });
      router.push(`/issue/${issue.$id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl font-bold">Stick an Issue on the Board</h1>
      <p className="mt-2 font-semibold text-ink/65">
        Volunteers can report issues. Assigning/escalating is admin-only.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-3xl bg-white p-6 brutal">
        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            placeholder="Short, clear problem title"
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${fieldClass} min-h-28`}
            placeholder="What happened, where, and impact"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className={fieldClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              className={fieldClass}
            >
              {PRIORITIES.filter((p) => p.value !== "all").map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Building / Area">
            <input
              required
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className={fieldClass}
              placeholder="Block B - Academic Wing"
            />
          </Field>
          <Field label="Room / Area">
            <input
              required
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className={fieldClass}
              placeholder="Lab 301"
            />
          </Field>
        </div>
        <Field label="Photo URL (optional)">
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className={fieldClass}
            placeholder="https://..."
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-yellow py-3 text-base font-black brutal disabled:opacity-60"
        >
          {saving ? "Pinning..." : "Pin to Doodle Board"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-extrabold">{label}</span>
      {children}
    </label>
  );
}
