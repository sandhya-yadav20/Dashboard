/**
 * Creates CampusFix database + collections in a new Appwrite project.
 * Usage: copy .env.local.example → .env.local, fill values, then:
 *   npm run setup:appwrite
 */
const { Client, Databases, Permission, Role, DatabasesIndexType } = require("node-appwrite");
const IndexType = DatabasesIndexType;

async function main() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "campusfix";

  if (!endpoint || !projectId || !apiKey || apiKey === "your_api_key_here") {
    console.error("Missing Appwrite env. Fill .env.local first.");
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  const any = [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ];

  async function ensureDatabase() {
    try {
      await databases.get(databaseId);
      console.log("Database exists:", databaseId);
    } catch {
      await databases.create(databaseId, "CampusFix");
      console.log("Created database:", databaseId);
    }
  }

  async function ensureCollection(id, name, attributes, indexes = []) {
    try {
      await databases.getCollection(databaseId, id);
      console.log("Collection exists:", id);
    } catch {
      await databases.createCollection(databaseId, id, name, any);
      console.log("Created collection:", id);
      for (const attr of attributes) {
        const { type, key, size, required = false, array = false, default: def } = attr;
        if (type === "string") {
          await databases.createStringAttribute(databaseId, id, key, size, required, def, array);
        } else if (type === "integer") {
          await databases.createIntegerAttribute(databaseId, id, key, required, undefined, undefined, def);
        } else if (type === "boolean") {
          await databases.createBooleanAttribute(databaseId, id, key, required, def);
        }
        await sleep(400);
      }
      for (const idx of indexes) {
        await sleep(600);
        await databases.createIndex(databaseId, id, idx.key, idx.type, idx.attributes);
      }
    }
  }

  await ensureDatabase();

  await ensureCollection(
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || "profiles",
    "Profiles",
    [
      { type: "string", key: "userId", size: 64, required: true },
      { type: "string", key: "name", size: 128, required: true },
      { type: "string", key: "email", size: 256, required: true },
      { type: "string", key: "role", size: 32, required: true },
      { type: "integer", key: "reportsCreated", required: true, default: 0 },
      { type: "integer", key: "upvotesReceived", required: true, default: 0 },
      { type: "integer", key: "issuesFixed", required: true, default: 0 },
      { type: "integer", key: "issuesSupported", required: true, default: 0 },
    ],
    [{ key: "userId_idx", type: IndexType.Unique, attributes: ["userId"] }],
  );

  await ensureCollection(
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ISSUES || "issues",
    "Issues",
    [
      { type: "string", key: "ticketId", size: 32, required: true },
      { type: "string", key: "title", size: 256, required: true },
      { type: "string", key: "description", size: 5000, required: true },
      { type: "string", key: "category", size: 64, required: true },
      { type: "string", key: "building", size: 128, required: true },
      { type: "string", key: "room", size: 128, required: true },
      { type: "string", key: "priority", size: 32, required: true },
      { type: "string", key: "status", size: 64, required: true },
      { type: "string", key: "photoUrl", size: 1024, required: false, default: "" },
      { type: "string", key: "reporterId", size: 64, required: true },
      { type: "string", key: "reporterName", size: 128, required: true },
      { type: "string", key: "reporterEmail", size: 256, required: false, default: "" },
      { type: "string", key: "assigneeId", size: 64, required: false, default: "" },
      { type: "string", key: "assigneeName", size: 128, required: false, default: "" },
      { type: "integer", key: "upvoteCount", required: true, default: 0 },
      { type: "integer", key: "commentCount", required: true, default: 0 },
      { type: "string", key: "fixNote", size: 2000, required: false, default: "" },
    ],
    [
      { key: "ticket_idx", type: IndexType.Key, attributes: ["ticketId"] },
      { key: "upvotes_idx", type: IndexType.Key, attributes: ["upvoteCount"] },
    ],
  );

  await ensureCollection(
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || "comments",
    "Comments",
    [
      { type: "string", key: "issueId", size: 64, required: true },
      { type: "string", key: "authorId", size: 64, required: true },
      { type: "string", key: "authorName", size: 128, required: true },
      { type: "string", key: "body", size: 2000, required: true },
    ],
  );

  await ensureCollection(
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_UPVOTES || "upvotes",
    "Upvotes",
    [
      { type: "string", key: "issueId", size: 64, required: true },
      { type: "string", key: "userId", size: 64, required: true },
    ],
  );

  await ensureCollection(
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS || "notifications",
    "Notifications",
    [
      { type: "string", key: "userId", size: 64, required: true },
      { type: "string", key: "issueId", size: 64, required: true },
      { type: "string", key: "title", size: 128, required: true },
      { type: "string", key: "message", size: 500, required: true },
      { type: "boolean", key: "read", required: true, default: false },
    ],
  );

  console.log("\nDone. Add localhost platforms in Appwrite Auth settings, then npm run dev");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
