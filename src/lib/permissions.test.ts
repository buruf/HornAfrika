import { describe, expect, it } from "vitest";
import type { ArticleStatus, Role } from "@prisma/client";
import { allowedTransitions, can, canEditArticle } from "@/lib/permissions";

const ROLES: Role[] = [
  "SUPER_ADMIN",
  "EDITOR",
  "JOURNALIST",
  "CONTRIBUTOR",
  "MODERATOR",
];

const STATUSES: ArticleStatus[] = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PUBLISHED",
  "UPDATED",
  "ARCHIVED",
];

describe("can() — the role matrix", () => {
  // The full table from the spec, asserted exhaustively. Written out rather
  // than derived, so that a change to the implementation cannot silently
  // change the expectation with it.
  const MATRIX: Record<string, Role[]> = {
    "article.create": ["SUPER_ADMIN", "EDITOR", "JOURNALIST", "CONTRIBUTOR"],
    "article.editAny": ["SUPER_ADMIN", "EDITOR"],
    "article.publish": ["SUPER_ADMIN", "EDITOR"],
    "article.delete": ["SUPER_ADMIN", "EDITOR"],
    "homepage.manage": ["SUPER_ADMIN", "EDITOR"],
    "taxonomy.manage": ["SUPER_ADMIN", "EDITOR"],
    "video.manage": ["SUPER_ADMIN", "EDITOR"],
    "subscribers.view": ["SUPER_ADMIN", "EDITOR"],
    "moderation": ["SUPER_ADMIN", "EDITOR", "MODERATOR"],
    "users.manage": ["SUPER_ADMIN"],
    "ads.manage": ["SUPER_ADMIN"],
  };

  for (const [action, allowed] of Object.entries(MATRIX)) {
    for (const role of ROLES) {
      const should = allowed.includes(role);
      it(`${role} ${should ? "can" : "cannot"} ${action}`, () => {
        expect(can(role, action)).toBe(should);
      });
    }
  }

  it("denies an unknown action to every role", () => {
    for (const role of ROLES) {
      expect(can(role, "articles.nuke-everything")).toBe(false);
    }
  });

  it("denies everything when there is no role", () => {
    for (const action of Object.keys(MATRIX)) {
      expect(can(undefined, action)).toBe(false);
    }
  });

  it("gates the wire admin the way the pages actually gate it", () => {
    // /admin/sources guards the page and its edits with taxonomy.manage, and
    // hiding an individual wire item with moderation. Asserted here so the
    // matrix stays honest about what the CMS really checks.
    expect(can("EDITOR", "taxonomy.manage")).toBe(true);
    expect(can("MODERATOR", "taxonomy.manage")).toBe(false);
    expect(can("MODERATOR", "moderation")).toBe(true);
    expect(can("JOURNALIST", "moderation")).toBe(false);
  });

  it("never lets a moderator touch articles", () => {
    // Moderators handle community content. If this ever passes, the CMS is
    // handing article control to an account that was not meant to have it.
    for (const action of [
      "article.create",
      "article.editAny",
      "article.publish",
      "article.delete",
    ]) {
      expect(can("MODERATOR", action)).toBe(false);
    }
  });
});

describe("allowedTransitions() — the workflow graph", () => {
  it("lets a contributor submit a draft for review and nothing else", () => {
    expect(allowedTransitions("CONTRIBUTOR", "DRAFT")).toEqual(["REVIEW"]);
    for (const status of STATUSES.filter((s) => s !== "DRAFT")) {
      expect(allowedTransitions("CONTRIBUTOR", status)).toEqual([]);
    }
  });

  it("stops a contributor knocking an approved article back to review", () => {
    // Regression: filtering only on the destination let a contributor act on
    // an article an editor had already approved, because REVIEW happened to
    // be a legal destination for them.
    expect(allowedTransitions("CONTRIBUTOR", "APPROVED")).toEqual([]);
    expect(allowedTransitions("JOURNALIST", "APPROVED")).toEqual([]);
  });

  it("keeps the workflow graph consistent with the edit rule", () => {
    // If a role cannot edit an article at a stage, it should not be able to
    // move it from that stage either. These two rules drifting apart is what
    // produced the bug above.
    for (const role of ["CONTRIBUTOR", "JOURNALIST"] as Role[]) {
      for (const status of STATUSES) {
        const mayEdit = canEditArticle(
          { role },
          { authorId: "a", status },
          "a",
        );
        if (!mayEdit) {
          expect(allowedTransitions(role, status)).toEqual([]);
        }
      }
    }
  });

  it("never lets a contributor or journalist publish", () => {
    // The single most important rule in the CMS.
    for (const role of ["CONTRIBUTOR", "JOURNALIST"] as Role[]) {
      for (const status of STATUSES) {
        expect(allowedTransitions(role, status)).not.toContain("PUBLISHED");
        expect(allowedTransitions(role, status)).not.toContain("APPROVED");
      }
    }
  });

  it("lets a journalist move between draft and review only", () => {
    expect(allowedTransitions("JOURNALIST", "DRAFT")).toEqual(["REVIEW"]);
    expect(allowedTransitions("JOURNALIST", "REVIEW")).toEqual(["DRAFT"]);
    expect(allowedTransitions("JOURNALIST", "PUBLISHED")).toEqual([]);
  });

  it("gives an editor the full path from draft to published", () => {
    expect(allowedTransitions("EDITOR", "DRAFT")).toContain("REVIEW");
    expect(allowedTransitions("EDITOR", "REVIEW")).toContain("APPROVED");
    expect(allowedTransitions("EDITOR", "APPROVED")).toContain("PUBLISHED");
    expect(allowedTransitions("EDITOR", "PUBLISHED")).toContain("UPDATED");
  });

  it("allows a moderator no transitions at all", () => {
    for (const status of STATUSES) {
      expect(allowedTransitions("MODERATOR", status)).toEqual([]);
    }
  });

  it("never offers a transition to the status already held", () => {
    for (const role of ROLES) {
      for (const status of STATUSES) {
        expect(allowedTransitions(role, status)).not.toContain(status);
      }
    }
  });

  it("only ever returns real statuses", () => {
    for (const role of ROLES) {
      for (const status of STATUSES) {
        for (const to of allowedTransitions(role, status)) {
          expect(STATUSES).toContain(to);
        }
      }
    }
  });

  it("can always reach archived from a live article as an editor", () => {
    // An editor must be able to pull a story down without a developer.
    expect(allowedTransitions("EDITOR", "PUBLISHED")).toContain("ARCHIVED");
    expect(allowedTransitions("EDITOR", "UPDATED")).toContain("ARCHIVED");
  });

  it("returns nothing for an absent role", () => {
    expect(allowedTransitions(undefined, "DRAFT")).toEqual([]);
  });
});

describe("canEditArticle() — ownership and stage", () => {
  const draft = { authorId: "author-1", status: "DRAFT" as ArticleStatus };
  const published = { authorId: "author-1", status: "PUBLISHED" as ArticleStatus };

  it("refuses when signed out", () => {
    expect(canEditArticle(null, draft, "author-1")).toBe(false);
  });

  it("lets an editor edit anyone's work at any stage", () => {
    for (const status of STATUSES) {
      expect(
        canEditArticle({ role: "EDITOR" }, { authorId: "someone-else", status }, "author-1"),
      ).toBe(true);
    }
  });

  it("lets a journalist edit their own draft but not once it is live", () => {
    expect(canEditArticle({ role: "JOURNALIST" }, draft, "author-1")).toBe(true);
    expect(canEditArticle({ role: "JOURNALIST" }, published, "author-1")).toBe(false);
  });

  it("stops a journalist editing someone else's article", () => {
    expect(canEditArticle({ role: "JOURNALIST" }, draft, "author-2")).toBe(false);
  });

  it("limits a contributor to their own drafts", () => {
    expect(canEditArticle({ role: "CONTRIBUTOR" }, draft, "author-1")).toBe(true);
    expect(
      canEditArticle(
        { role: "CONTRIBUTOR" },
        { authorId: "author-1", status: "REVIEW" },
        "author-1",
      ),
    ).toBe(false);
  });

  it("refuses a user with no author profile", () => {
    // Every article carries a byline, so an account with no author record must
    // not be able to edit one into existence.
    expect(canEditArticle({ role: "JOURNALIST" }, draft, null)).toBe(false);
    expect(canEditArticle({ role: "CONTRIBUTOR" }, draft, null)).toBe(false);
  });

  it("gives a moderator no article editing at all", () => {
    for (const status of STATUSES) {
      expect(
        canEditArticle({ role: "MODERATOR" }, { authorId: "author-1", status }, "author-1"),
      ).toBe(false);
    }
  });
});
