import { Account, Client, Databases, ID, Query, RealtimeResponseEvent } from "appwrite";
import { isAppwriteConfigured } from "./constants";
import type { Issue, NotificationDoc, Profile, UserRole } from "./types";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

export const appwriteIds = {
  database: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "campusfix",
  profiles: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES ?? "profiles",
  issues: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ISSUES ?? "issues",
  comments: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS ?? "comments",
  upvotes: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_UPVOTES ?? "upvotes",
  notifications:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS ?? "notifications",
};

export const client = new Client().setEndpoint(endpoint).setProject(projectId);
export const account = new Account(client);
export const databases = new Databases(client);

export { ID, Query };
export type { RealtimeResponseEvent };

export async function getCurrentAccount() {
  if (!isAppwriteConfigured()) return null;
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  if (!isAppwriteConfigured()) return null;
  const res = await databases.listDocuments(appwriteIds.database, appwriteIds.profiles, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  return (res.documents[0] as unknown as Profile) ?? null;
}

export async function ensureProfile(input: {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}): Promise<Profile> {
  const existing = await getProfileByUserId(input.userId);
  if (existing) return existing;

  const doc = await databases.createDocument(
    appwriteIds.database,
    appwriteIds.profiles,
    ID.unique(),
    {
      userId: input.userId,
      name: input.name,
      email: input.email,
      role: input.role,
      reportsCreated: 0,
      upvotesReceived: 0,
      issuesFixed: 0,
      issuesSupported: 0,
    },
  );
  return doc as unknown as Profile;
}

export async function listIssues(): Promise<Issue[]> {
  const res = await databases.listDocuments(appwriteIds.database, appwriteIds.issues, [
    Query.orderDesc("upvoteCount"),
    Query.limit(100),
  ]);
  return res.documents as unknown as Issue[];
}

export async function createIssue(
  data: Omit<Issue, "$id" | "$createdAt" | "$updatedAt">,
): Promise<Issue> {
  const doc = await databases.createDocument(
    appwriteIds.database,
    appwriteIds.issues,
    ID.unique(),
    data,
  );
  return doc as unknown as Issue;
}

export async function updateIssue(
  id: string,
  data: Partial<Omit<Issue, "$id" | "$createdAt" | "$updatedAt">>,
): Promise<Issue> {
  const doc = await databases.updateDocument(
    appwriteIds.database,
    appwriteIds.issues,
    id,
    data,
  );
  return doc as unknown as Issue;
}

export async function listNotifications(userId: string): Promise<NotificationDoc[]> {
  const res = await databases.listDocuments(
    appwriteIds.database,
    appwriteIds.notifications,
    [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(20)],
  );
  return res.documents as unknown as NotificationDoc[];
}

export function nextTicketId(existing: Issue[]) {
  const nums = existing
    .map((i) => Number(i.ticketId.replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `CF-${next}`;
}
