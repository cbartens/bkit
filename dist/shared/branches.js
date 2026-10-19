// shared/branches.ts — which branches are shared, so nobody works on them directly.
//
// `dev` is the integration branch; `dev` and `main` are the shared branches. The workflow
// commands (`commands/lib.ts` re-exports these) and the managed-version check both read
// this one list.
/** The integration branch feature work lands on. */
export const DEV = "dev";
/** Branches no feature work happens on, and no force-push touches. */
export const SHARED_BRANCHES = new Set([DEV, "main"]);
/** True when `branch` is `dev` or `main`. */
export function isSharedBranch(branch) {
    return SHARED_BRANCHES.has(branch);
}
