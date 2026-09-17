import type { Profile, UserRole } from "./types";

export type DemoAccount = {
  userId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

/** Fixed accounts for the 3 roles — use these to sign in */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    userId: "user_admin",
    email: "admin@campusfix.app",
    password: "Admin@123",
    name: "Campus Admin",
    role: "admin",
  },
  {
    userId: "user_worker",
    email: "worker@campusfix.app",
    password: "Worker@123",
    name: "Ravi Facilities",
    role: "worker",
  },
  {
    userId: "user_volunteer",
    email: "volunteer@campusfix.app",
    password: "Volunteer@123",
    name: "Aarav Sharma",
    role: "student",
  },
];

export function profileFromAccount(account: DemoAccount): Profile {
  const base =
    account.role === "student"
      ? { reportsCreated: 12, upvotesReceived: 340, issuesFixed: 5, issuesSupported: 28 }
      : account.role === "worker"
        ? { reportsCreated: 0, upvotesReceived: 0, issuesFixed: 18, issuesSupported: 0 }
        : { reportsCreated: 0, upvotesReceived: 0, issuesFixed: 0, issuesSupported: 0 };

  return {
    $id: account.userId,
    userId: account.userId,
    name: account.name,
    email: account.email,
    role: account.role,
    ...base,
  };
}

export function findDemoAccount(emailOrId: string, password: string) {
  const key = emailOrId.trim().toLowerCase();
  return (
    DEMO_ACCOUNTS.find(
      (a) =>
        (a.email.toLowerCase() === key || a.userId.toLowerCase() === key) &&
        a.password === password,
    ) ?? null
  );
}
