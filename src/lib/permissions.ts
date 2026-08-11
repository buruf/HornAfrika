import type { Role, ArticleStatus } from "@prisma/client";

/**
 * Editorial permissions and the workflow graph (spec §24).
 *
 * Kept apart from auth.ts deliberately: this file is the policy, and it has
 * no runtime dependencies at all — no session, no database, no next/headers.
 * That is what lets the whole role matrix and transition graph be tested
 * directly, which matters because a permissions bug fails silently.
 */

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  EDITOR: "Editor",
  JOURNALIST: "Journalist",
  CONTRIBUTOR: "Contributor",
  MODERATOR: "Moderator",
};

export const ROLE_SUMMARY: Record<Role, string> = {
  SUPER_ADMIN: "Full access, including users and site settings.",
  EDITOR: "Create, edit and publish any article; control the homepage.",
  JOURNALIST: "Create and edit own articles; submit for review.",
  CONTRIBUTOR: "Create own drafts and submit them for review.",
  MODERATOR: "Review community content. No article editing.",
};

export function can(role: Role | undefined, action: string): boolean {
  if (!role) return false;
  switch (action) {
    case "article.create":
      return ["SUPER_ADMIN", "EDITOR", "JOURNALIST", "CONTRIBUTOR"].includes(role);
    case "article.editAny":
      return ["SUPER_ADMIN", "EDITOR"].includes(role);
    case "article.publish":
      return ["SUPER_ADMIN", "EDITOR"].includes(role);
    case "article.delete":
      return ["SUPER_ADMIN", "EDITOR"].includes(role);
    case "homepage.manage":
      return ["SUPER_ADMIN", "EDITOR"].includes(role);
    case "taxonomy.manage":
      return ["SUPER_ADMIN", "EDITOR"].includes(role);
    case "video.manage":
      return ["SUPER_ADMIN", "EDITOR"].includes(role);
    case "users.manage":
      return role === "SUPER_ADMIN";
    case "ads.manage":
      return role === "SUPER_ADMIN";
    case "subscribers.view":
      return ["SUPER_ADMIN", "EDITOR"].includes(role);
    case "moderation":
      return ["SUPER_ADMIN", "EDITOR", "MODERATOR"].includes(role);
    default:
      return false;
  }
}

/**
 * Anything carrying a role. Structural rather than the full Session type, so
 * the policy does not depend on the session plumbing.
 */
export type RoleBearer = { role: Role };

/** Can this user edit this specific article? */
export function canEditArticle(
  session: RoleBearer | null,
  article: { authorId: string; status: ArticleStatus },
  authorIdOfUser: string | null,
): boolean {
  if (!session) return false;
  if (can(session.role, "article.editAny")) return true;
  const isOwn = authorIdOfUser !== null && article.authorId === authorIdOfUser;
  if (!isOwn) return false;
  if (session.role === "JOURNALIST") {
    // A journalist keeps control until an editor takes it into review.
    return ["DRAFT", "REVIEW"].includes(article.status);
  }
  if (session.role === "CONTRIBUTOR") return article.status === "DRAFT";
  return false;
}

/**
 * The workflow graph (spec §24). Each role may only make the transitions
 * listed for it, which is what stops a contributor self-publishing.
 */
const TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  DRAFT: ["REVIEW", "ARCHIVED"],
  REVIEW: ["APPROVED", "DRAFT", "ARCHIVED"],
  APPROVED: ["PUBLISHED", "REVIEW", "ARCHIVED"],
  PUBLISHED: ["UPDATED", "ARCHIVED"],
  UPDATED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

/** Which target statuses a role may move an article *to*. */
const ROLE_TRANSITIONS: Record<Role, ArticleStatus[]> = {
  SUPER_ADMIN: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "UPDATED", "ARCHIVED"],
  EDITOR: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "UPDATED", "ARCHIVED"],
  JOURNALIST: ["DRAFT", "REVIEW"],
  CONTRIBUTOR: ["REVIEW"],
  MODERATOR: [],
};

/**
 * Which stages a role may act *from*.
 *
 * Filtering only on the destination is not enough. Without this, a contributor
 * could take an article an editor had already APPROVED and knock it back to
 * REVIEW — because REVIEW is a legal destination for them — even though they
 * have no business touching an approved piece at all. These stages mirror
 * canEditArticle() exactly, so the workflow and the edit rule agree.
 */
const ROLE_FROM_STAGES: Record<Role, ArticleStatus[]> = {
  SUPER_ADMIN: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "UPDATED", "ARCHIVED"],
  EDITOR: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "UPDATED", "ARCHIVED"],
  JOURNALIST: ["DRAFT", "REVIEW"],
  CONTRIBUTOR: ["DRAFT"],
  MODERATOR: [],
};

export function allowedTransitions(
  role: Role | undefined,
  from: ArticleStatus,
): ArticleStatus[] {
  if (!role) return [];
  if (!ROLE_FROM_STAGES[role].includes(from)) return [];
  return TRANSITIONS[from].filter((to) => ROLE_TRANSITIONS[role].includes(to));
}

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "In review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  UPDATED: "Updated",
  ARCHIVED: "Archived",
};

export const STATUS_COLOR: Record<ArticleStatus, string> = {
  DRAFT: "#6b7c8c",
  REVIEW: "#a8730f",
  APPROVED: "#1b5fa8",
  PUBLISHED: "#2f7a3f",
  UPDATED: "#0f7b7b",
  ARCHIVED: "#8a3d3d",
};
