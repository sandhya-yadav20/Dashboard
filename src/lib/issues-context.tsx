"use client";

import { formatDistanceToNow } from "date-fns";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  appwriteIds,
  client,
  createIssue,
  listIssues,
  nextTicketId,
  updateIssue,
} from "./appwrite";
import { DEMO_ISSUES, isAppwriteConfigured } from "./constants";
import { DEMO_STUDENTS, DEMO_WORKERS, PRIORITY_RANK } from "./demo-users";
import type {
  CommentDoc,
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  NotificationDoc,
  Profile,
  SortOption,
} from "./types";
import { useAuth } from "./auth-context";

const REPORTER_EMAILS: Record<string, string> = {
  "demo-aarav": "aarav@campus.edu",
  "demo-meera": "meera@campus.edu",
  "demo-rahul": "rahul@campus.edu",
};

type IssuesContextValue = {
  issues: Issue[];
  workers: Profile[];
  students: Profile[];
  comments: CommentDoc[];
  notifications: NotificationDoc[];
  supportedIds: string[];
  loading: boolean;
  usingDemo: boolean;
  refresh: () => Promise<void>;
  addIssue: (input: {
    title: string;
    description: string;
    category: IssueCategory;
    building: string;
    room: string;
    priority: IssuePriority;
    photoUrl: string;
  }) => Promise<Issue>;
  upvote: (issueId: string) => Promise<void>;
  setStatus: (issueId: string, status: IssueStatus) => Promise<void>;
  assignIssue: (issueId: string, worker: Profile) => Promise<void>;
  addFixNote: (issueId: string, note: string) => Promise<void>;
  addComment: (issueId: string, body: string) => Promise<void>;
  addWorker: (name: string, email: string) => void;
  removeWorker: (userId: string) => void;
  filterIssues: (opts: {
    search: string;
    status: IssueStatus | "all";
    priority: IssuePriority | "all";
    category: IssueCategory | "all";
    sort: SortOption;
  }) => Issue[];
  stats: {
    total: number;
    active: number;
    resolved: number;
    upvotes: number;
  };
};

const IssuesContext = createContext<IssuesContextValue | null>(null);

function enrich(row: Omit<Issue, "$id" | "$createdAt" | "$updatedAt"> & Partial<Pick<Issue, "$id" | "$createdAt" | "$updatedAt">>, index = 0): Issue {
  const created =
    row.$createdAt ??
    new Date(Date.now() - (index + 1) * 2 * 24 * 60 * 60 * 1000).toISOString();

  let assigneeId = row.assigneeId;
  let assigneeName = row.assigneeName;
  let reporterId = row.reporterId;

  // Map legacy demo ids → fixed role accounts
  if (assigneeId === "demo-worker") {
    assigneeId = "user_worker";
    assigneeName = "Ravi Facilities";
  } else if (assigneeId === "demo-worker-2") {
    assigneeName = "Sneha Maintenance";
  }
  if (reporterId === "demo-aarav") reporterId = "user_volunteer";

  return {
    ...row,
    $id: row.$id ?? `demo-${row.ticketId}`,
    $createdAt: created,
    $updatedAt: row.$updatedAt ?? created,
    reporterId,
    reporterEmail:
      row.reporterEmail ??
      REPORTER_EMAILS[row.reporterId] ??
      (reporterId === "user_volunteer" ? "volunteer@campusfix.app" : ""),
    fixNote: row.fixNote ?? "",
    assigneeId,
    assigneeName:
      assigneeId === "user_worker"
        ? "Ravi Facilities"
        : assigneeId === "demo-worker-2"
          ? "Sneha Maintenance"
          : assigneeName,
  };
}

function withDemoTimestamps(
  rows: Omit<Issue, "$id" | "$createdAt" | "$updatedAt">[],
): Issue[] {
  const base = rows.map((row, i) => enrich(row, i));
  // Give worker-2 a couple of jobs for admin workload view
  return base.map((issue) => {
    if (issue.ticketId === "CF-1004" || issue.ticketId === "CF-1015") {
      return {
        ...issue,
        assigneeId: "demo-worker-2",
        assigneeName: "Sneha Maintenance",
      };
    }
    return issue;
  });
}

export function IssuesProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const configured = isAppwriteConfigured();
  const [issues, setIssues] = useState<Issue[]>(() => withDemoTimestamps(DEMO_ISSUES));
  const [workers, setWorkers] = useState<Profile[]>(DEMO_WORKERS);
  const [students] = useState<Profile[]>(DEMO_STUDENTS);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [supportedIds, setSupportedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingDemo, setUsingDemo] = useState(true);

  const refresh = useCallback(async () => {
    if (!configured) {
      setUsingDemo(true);
      setIssues(withDemoTimestamps(DEMO_ISSUES));
      return;
    }
    setLoading(true);
    try {
      const rows = await listIssues();
      if (rows.length === 0) {
        setUsingDemo(true);
        setIssues(withDemoTimestamps(DEMO_ISSUES));
      } else {
        setUsingDemo(false);
        setIssues(rows.map((r, i) => enrich(r, i)));
      }
    } catch {
      setUsingDemo(true);
      setIssues(withDemoTimestamps(DEMO_ISSUES));
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    // Only connect Realtime when Appwrite DB is actually in use.
    // Wrong region endpoint causes endless "Server Error" reconnect spam.
    if (!configured || usingDemo) return;

    let unsubscribe: (() => void) | undefined;
    try {
      const channel = `databases.${appwriteIds.database}.collections.${appwriteIds.issues}.documents`;
      unsubscribe = client.subscribe(channel, () => {
        void refresh();
      });
    } catch {
      /* ignore realtime setup errors in demo/fallback */
    }

    return () => {
      try {
        unsubscribe?.();
      } catch {
        /* ignore */
      }
    };
  }, [configured, usingDemo, refresh]);

  useEffect(() => {
    if (!profile || profile.role !== "student") return;
    const mine = issues.filter((i) => i.reporterId === profile.userId);
    const notes: NotificationDoc[] = mine.slice(0, 4).map((i, idx) => ({
      $id: `notif-${i.$id}`,
      userId: profile.userId,
      issueId: i.$id,
      title: `Status: ${i.status}`,
      message: `${i.ticketId} is now marked ${i.status.replaceAll("_", " ")}.`,
      read: idx > 1,
      $createdAt: i.$updatedAt,
    }));
    if (mine.some((i) => i.upvoteCount >= 200)) {
      const hot = mine.find((i) => i.upvoteCount >= 200)!;
      notes.unshift({
        $id: `notif-milestone-${hot.$id}`,
        userId: profile.userId,
        issueId: hot.$id,
        title: "Upvote milestone",
        message: `${hot.ticketId} crossed 200 community upvotes.`,
        read: false,
        $createdAt: new Date().toISOString(),
      });
    }
    setNotifications(notes);
  }, [profile, issues]);

  const pushNotification = (userId: string, issueId: string, title: string, message: string) => {
    setNotifications((prev) => [
      {
        $id: `notif-${Date.now()}`,
        userId,
        issueId,
        title,
        message,
        read: false,
        $createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addIssue: IssuesContextValue["addIssue"] = async (input) => {
    const payload = {
      ...input,
      ticketId: nextTicketId(issues),
      status: "new" as const,
      reporterId: profile?.userId ?? "guest",
      reporterName: profile?.name ?? "Guest",
      reporterEmail: profile?.email ?? "",
      assigneeId: "",
      assigneeName: "",
      upvoteCount: 0,
      commentCount: 0,
      fixNote: "",
    };

    if (!configured || usingDemo) {
      const created = enrich({ ...payload, $id: `local-${Date.now()}` });
      setIssues((prev) => [created, ...prev]);
      return created;
    }

    const created = enrich(await createIssue(payload));
    setIssues((prev) => [created, ...prev]);
    return created;
  };

  const upvote = async (issueId: string) => {
    const target = issues.find((i) => i.$id === issueId);
    if (!target) return;
    const next = target.upvoteCount + 1;
    setIssues((prev) =>
      prev.map((i) => (i.$id === issueId ? { ...i, upvoteCount: next } : i)),
    );
    setSupportedIds((prev) => (prev.includes(issueId) ? prev : [...prev, issueId]));
    if (configured && !usingDemo && !issueId.startsWith("demo-") && !issueId.startsWith("local-")) {
      await updateIssue(issueId, { upvoteCount: next });
    }
  };

  const setStatus = async (issueId: string, status: IssueStatus) => {
    const target = issues.find((i) => i.$id === issueId);
    setIssues((prev) =>
      prev.map((i) => (i.$id === issueId ? { ...i, status } : i)),
    );
    if (target) {
      pushNotification(
        target.reporterId,
        issueId,
        "Ticket status updated",
        `${target.ticketId} is now ${status.replaceAll("_", " ")}.`,
      );
    }
    if (configured && !usingDemo && !issueId.startsWith("demo-") && !issueId.startsWith("local-")) {
      await updateIssue(issueId, { status });
    }
  };

  const assignIssue = async (issueId: string, worker: Profile) => {
    const target = issues.find((i) => i.$id === issueId);
    setIssues((prev) =>
      prev.map((i) =>
        i.$id === issueId
          ? {
              ...i,
              status: i.status === "new" || i.status === "escalated" ? "assigned" : i.status,
              assigneeId: worker.userId,
              assigneeName: worker.name,
            }
          : i,
      ),
    );
    if (target) {
      pushNotification(
        target.reporterId,
        issueId,
        "Ticket assigned",
        `${target.ticketId} was assigned to facilities staff.`,
      );
    }
    if (configured && !usingDemo && !issueId.startsWith("demo-") && !issueId.startsWith("local-")) {
      await updateIssue(issueId, {
        assigneeId: worker.userId,
        assigneeName: worker.name,
        status: "assigned",
      });
    }
  };

  const addFixNote = async (issueId: string, note: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.$id === issueId ? { ...i, fixNote: note } : i)),
    );
    if (configured && !usingDemo && !issueId.startsWith("demo-") && !issueId.startsWith("local-")) {
      await updateIssue(issueId, { fixNote: note });
    }
  };

  const addComment = async (issueId: string, body: string) => {
    if (!profile || !body.trim()) return;
    const doc: CommentDoc = {
      $id: `c-${Date.now()}`,
      issueId,
      authorId: profile.userId,
      authorName: profile.name,
      body: body.trim(),
      $createdAt: new Date().toISOString(),
    };
    setComments((prev) => [doc, ...prev]);
    setIssues((prev) =>
      prev.map((i) =>
        i.$id === issueId ? { ...i, commentCount: i.commentCount + 1 } : i,
      ),
    );
  };

  const addWorker = (name: string, email: string) => {
    const userId = `worker-${Date.now()}`;
    setWorkers((prev) => [
      ...prev,
      {
        $id: userId,
        userId,
        name,
        email,
        role: "worker",
        reportsCreated: 0,
        upvotesReceived: 0,
        issuesFixed: 0,
        issuesSupported: 0,
      },
    ]);
  };

  const removeWorker = (userId: string) => {
    setWorkers((prev) => prev.filter((w) => w.userId !== userId));
  };

  const filterIssues: IssuesContextValue["filterIssues"] = ({
    search,
    status,
    priority,
    category,
    sort,
  }) => {
    let rows = [...issues];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.room.toLowerCase().includes(q) ||
          i.building.toLowerCase().includes(q) ||
          i.ticketId.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    if (status !== "all") rows = rows.filter((i) => i.status === status);
    if (priority !== "all") rows = rows.filter((i) => i.priority === priority);
    if (category !== "all") rows = rows.filter((i) => i.category === category);

    rows.sort((a, b) => {
      if (sort === "most_upvoted") return b.upvoteCount - a.upvoteCount;
      if (sort === "newest")
        return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
      return new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime();
    });
    return rows;
  };

  const stats = useMemo(() => {
    const active = issues.filter(
      (i) => !["resolved", "closed"].includes(i.status),
    ).length;
    const resolved = issues.filter((i) =>
      ["resolved", "closed"].includes(i.status),
    ).length;
    const upvotes = issues.reduce((sum, i) => sum + i.upvoteCount, 0);
    return { total: issues.length, active, resolved, upvotes };
  }, [issues]);

  const value = useMemo(
    () => ({
      issues,
      workers,
      students,
      comments,
      notifications,
      supportedIds,
      loading,
      usingDemo,
      refresh,
      addIssue,
      upvote,
      setStatus,
      assignIssue,
      addFixNote,
      addComment,
      addWorker,
      removeWorker,
      filterIssues,
      stats,
    }),
    [
      issues,
      workers,
      students,
      comments,
      notifications,
      supportedIds,
      loading,
      usingDemo,
      refresh,
      stats,
      profile,
    ],
  );

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>;
}

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error("useIssues must be used within IssuesProvider");
  return ctx;
}

export function timeAgo(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "recently";
  }
}

export function sortByPriority(a: Issue, b: Issue) {
  return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
}
