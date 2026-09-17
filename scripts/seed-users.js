/**
 * Creates the 3 role users in Appwrite Auth + profiles collection.
 * Requires APPWRITE_API_KEY with Auth + Databases scopes.
 *
 *   npm run seed:users
 */
const { Client, Users, Databases, ID, Query } = require("node-appwrite");

const ACCOUNTS = [
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

async function main() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "campusfix";
  const profilesId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || "profiles";

  if (!endpoint || !projectId || !apiKey || projectId === "your_project_id") {
    console.error("Set Project ID + APPWRITE_API_KEY in .env.local first.");
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const users = new Users(client);
  const databases = new Databases(client);

  for (const a of ACCOUNTS) {
    let appwriteUserId = a.userId;
    try {
      await users.create(a.userId, a.email, undefined, a.password, a.name);
      console.log("Created auth user:", a.email);
    } catch (err) {
      const msg = String(err?.message || err);
      if (msg.toLowerCase().includes("already")) {
        console.log("Auth user exists:", a.email);
        try {
          const list = await users.list([Query.equal("email", a.email)]);
          if (list.users[0]) appwriteUserId = list.users[0].$id;
        } catch {
          /* keep custom id */
        }
      } else {
        console.error("Failed", a.email, msg);
        continue;
      }
    }

    try {
      const existing = await databases.listDocuments(databaseId, profilesId, [
        Query.equal("userId", appwriteUserId),
        Query.limit(1),
      ]);
      if (existing.total > 0) {
        console.log("Profile exists:", a.email);
      } else {
        await databases.createDocument(databaseId, profilesId, ID.unique(), {
          userId: appwriteUserId,
          name: a.name,
          email: a.email,
          role: a.role,
          reportsCreated: a.role === "student" ? 12 : 0,
          upvotesReceived: a.role === "student" ? 340 : 0,
          issuesFixed: a.role === "worker" ? 18 : a.role === "student" ? 5 : 0,
          issuesSupported: a.role === "student" ? 28 : 0,
        });
        console.log("Created profile:", a.role, a.email);
      }
    } catch (err) {
      console.error("Profile error", a.email, err?.message || err);
    }
  }

  console.log("\nDone. Sign in with:");
  for (const a of ACCOUNTS) {
    console.log(`  ${a.role.padEnd(10)} ${a.email} / ${a.password}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
