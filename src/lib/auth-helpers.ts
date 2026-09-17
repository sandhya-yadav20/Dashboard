import { Account, Client, Databases, ID } from "appwrite";
import { isAppwriteConfigured } from "./constants";
import type { Profile, UserRole } from "./types";

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
export { ID };

export function isAppwriteReady() {
  return isAppwriteConfigured();
}

export async function getCurrentAccount() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const { Query } = await import("appwrite");
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
