# CampusFix v2.0

Next.js doodle-board campus repairs app (UI matched to your AI Studio reference) with **Appwrite** for auth + database.

## Quick start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000 — works with **demo data** until Appwrite is connected.

---

## Appwrite — what to check for a **new project**

Do these in order in the [Appwrite Console](https://cloud.appwrite.io):

### 1. Create project
- Create a new project (e.g. `CampusFix`)
- Copy **Project ID** → `NEXT_PUBLIC_APPWRITE_PROJECT_ID`

### 2. API endpoint
- Cloud default: `https://cloud.appwrite.io/v1`
- Self-hosted: your server `/v1` URL  
→ `NEXT_PUBLIC_APPWRITE_ENDPOINT`

### 3. API key (server only)
- **Overview / Settings → API keys → Create**
- Scopes needed: `databases.*`, `users.read` (optional), preferably full DB write for setup
- Copy key → `APPWRITE_API_KEY` in `.env.local`  
  **Never** put this in `NEXT_PUBLIC_*` or commit it

### 4. Web platform (Auth will fail without this)
- **Auth → Settings → Platforms → Add Web**
- Hostname: `localhost` (and your deploy domain later)

### 5. Auth method
- **Auth → Settings** → enable **Email/Password**

### 6. Database + collections
Either:
- Run: `npm run setup:appwrite` (creates DB + collections + attributes), **or**
- Create manually:

| Collection ID     | Purpose                          |
|-------------------|----------------------------------|
| `profiles`        | name, email, role, stats         |
| `issues`          | sticky-note tickets              |
| `comments`        | discussion on issues             |
| `upvotes`         | one vote per user per issue      |
| `notifications`   | status change alerts             |

Database ID default: `campusfix`

**`issues` attributes (required):**  
`ticketId`, `title`, `description`, `category`, `building`, `room`, `priority`, `status`, `photoUrl`, `reporterId`, `reporterName`, `assigneeId`, `assigneeName`, `upvoteCount` (int), `commentCount` (int)

**`profiles` attributes:**  
`userId`, `name`, `email`, `role`, `reportsCreated`, `upvotesReceived`, `issuesFixed`, `issuesSupported`

### 7. Collection permissions
For MVP, each collection:
- **Read:** Any (or Users)
- **Create / Update / Delete:** Users  

Tighten later for production.

### 8. Env file checklist
Put all of this in `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_APPWRITE_DATABASE_ID=campusfix
NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES=profiles
NEXT_PUBLIC_APPWRITE_COLLECTION_ISSUES=issues
NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS=comments
NEXT_PUBLIC_APPWRITE_COLLECTION_UPVOTES=upvotes
NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS=notifications
APPWRITE_API_KEY=your_api_key_here
```

Then:

```bash
npm run setup:appwrite
npm run dev
```

When Project ID is real (not `your_project_id`), the app loads issues from Appwrite instead of demo data.

---

## Routes

| Path | Screen |
|------|--------|
| `/` | Doodle Board (hero, stats, sticky notes) |
| `/report` | Stick an Issue |
| `/leaderboard` | Upvote ranking |
| `/heatmap` | Building severity zones |
| `/dashboard` | My Complaints |
| `/login` | Auth + demo roles |
| `/admin` | Triage portal |
| `/worker` | Staff repairs |
| `/issue/[id]` | Details + status |

Paste your **Project ID** and **API key** into `.env.local` when ready and tell me — I can verify the connection.
