// shared/branches.ts — which branches are shared, so nobody works on them directly.
//
// `dev` is the integration branch; `dev` and `main` are the shared branches. The workflow
// commands (`commands/lib.ts` re-exports these) and the managed-version check both read
// this one rule.
/** The integration branch feature work lands on. */
export const DEV = "dev";
/** True for `dev` and `main`: no feature work happens on them, no force-push touches them. */
export function isSharedBranch(branch) {
    return branch === DEV || branch === "main";
}
