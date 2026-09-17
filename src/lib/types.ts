export type UserRole = "student" | "worker" | "admin";

export type IssuePriority = "low" | "medium" | "high" | "critical";

export type IssueStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "escalated"
  | "awaiting_confirmation"
  | "resolved"
  | "closed";

export type IssueCategory =
  | "Wi-Fi & Network"
  | "Plumbing & Water"
  | "Electrical"
  | "Washroom Facilities"
  | "Classroom & AV"
  | "Library & Study Hall"
  | "Cleanliness & Hygiene"
  | "Laboratory Equipment"
  | "Furniture & Fixtures"
  | "Other";

export interface Profile {
  $id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  reportsCreated: number;
  upvotesReceived: number;
  issuesFixed: number;
  issuesSupported: number;
}

export interface Issue {
  $id: string;
  ticketId: string;
  title: string;
  description: string;
  category: IssueCategory;
  building: string;
  room: string;
  priority: IssuePriority;
  status: IssueStatus;
  photoUrl: string;
  reporterId: string;
  reporterName: string;
  /** Admin-only; never show to workers */
  reporterEmail?: string;
  assigneeId: string;
  assigneeName: string;
  upvoteCount: number;
  commentCount: number;
  /** Worker note when marking fixed */
  fixNote?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface CommentDoc {
  $id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  body: string;
  $createdAt: string;
}

export interface UpvoteDoc {
  $id: string;
  issueId: string;
  userId: string;
}

export interface NotificationDoc {
  $id: string;
  userId: string;
  issueId: string;
  title: string;
  message: string;
  read: boolean;
  $createdAt: string;
}

export type SortOption = "most_upvoted" | "newest" | "oldest";
