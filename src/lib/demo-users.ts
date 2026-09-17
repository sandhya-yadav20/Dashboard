import type { Profile } from "./types";

export const DEMO_WORKERS: Profile[] = [
  {
    $id: "user_worker",
    userId: "user_worker",
    name: "Ravi Facilities",
    email: "worker@campusfix.app",
    role: "worker",
    reportsCreated: 0,
    upvotesReceived: 0,
    issuesFixed: 18,
    issuesSupported: 0,
  },
  {
    $id: "demo-worker-2",
    userId: "demo-worker-2",
    name: "Sneha Maintenance",
    email: "sneha.staff@campus.edu",
    role: "worker",
    reportsCreated: 0,
    upvotesReceived: 0,
    issuesFixed: 9,
    issuesSupported: 0,
  },
];

export const DEMO_STUDENTS: Profile[] = [
  {
    $id: "user_volunteer",
    userId: "user_volunteer",
    name: "Aarav Sharma",
    email: "volunteer@campusfix.app",
    role: "student",
    reportsCreated: 12,
    upvotesReceived: 340,
    issuesFixed: 5,
    issuesSupported: 28,
  },
  {
    $id: "demo-meera",
    userId: "demo-meera",
    name: "Meera Patel",
    email: "meera@campus.edu",
    role: "student",
    reportsCreated: 4,
    upvotesReceived: 90,
    issuesFixed: 1,
    issuesSupported: 11,
  },
  {
    $id: "demo-rahul",
    userId: "demo-rahul",
    name: "Rahul Verma",
    email: "rahul@campus.edu",
    role: "student",
    reportsCreated: 3,
    upvotesReceived: 40,
    issuesFixed: 0,
    issuesSupported: 7,
  },
];

export const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const;

export function homeForRole(role: Profile["role"] | undefined) {
  if (role === "admin") return "/admin";
  if (role === "worker") return "/worker";
  return "/dashboard";
}
