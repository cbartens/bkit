// bkit setup protect-main — apply bkit's branch protection policy to `main`.
//
// main only ever moves through a release PR, so it requires a PR, requires the
// capstone check, and allows no force-push, no deletion and no merge commits.
// The policy also binds admins. `dev` is left unprotected — operators choose
// direct-push or feat/PR.
//
// The required check is `bkit.capstoneJob`, the always-on job that asserts every
// expected tier ran and passed, so "required check green" means validated, not
// merely "the tests job did not fail". Before requiring it the command checks a
// job by that name exists in the CI workflow: a required check no job produces
// stays "Expected" forever and wedges every PR.

import * as fs from "node:fs";
import * as path from "node:path";

import { readBkitConfig } from "../shared/config.js";
import {
  CommandError,
  EXIT,
  parseJson,
  repoRoot,
  runGh,
  type CommandSpec,
  type RunContext,
} from "../lib.js";

/** Exit code: `gh repo view` did not name the repository. */
export const EXIT_NO_REPO = 3;
/** Exit code: the CI workflow file named by `bkit.ciWorkflow` does not exist. */
export const EXIT_NO_CI_WORKFLOW = 4;
/** Exit code: the CI workflow has no job named `bkit.capstoneJob`. */
export const EXIT_NO_CAPSTONE_JOB = 5;
/** Exit code: a `gh api` call failed. */
export const EXIT_GH_API_FAILED = 6;

const BRANCH = "main";

/** The protection body `PUT repos/{repo}/branches/main/protection` takes. */
export const protectionPayload = (requiredCheck: string) => ({
  required_status_checks: { strict: true, contexts: [requiredCheck] },
  enforce_admins: true,
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    required_approving_review_count: 0,
  },
  restrictions: null,
  required_linear_history: true,
  allow_force_pushes: false,
  allow_deletions: false,
});

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whether `yaml` has an indented `<job>:` key — the same line test as the shell's grep. */
export const declaresJob = (yaml: string, job: string): boolean =>
  new RegExp(`^[ \\t]+${escapeRegExp(job)}:`, "m").test(yaml);

/** GitHub answers 404 "Branch not protected" for a branch with no rule. */
const isUnprotected = (stderr: string) => /branch not protected|\b404\b/i.test(stderr);

function protectMain(ctx: RunContext): number {
  const dryRun = ctx.flags.dryRun === true;
  if (dryRun && ctx.flags.print === true) {
    throw new CommandError(EXIT.USAGE, "give at most one of --dry-run and --print");
  }
  const root = repoRoot(ctx.cwd);

  const auth = runGh(root, ["auth", "status"]);
  if (auth.missing) throw new CommandError(EXIT.USAGE, "gh CLI not installed");
  if (!auth.ok) {
    ctx.log("gh auth status failed — run 'gh auth login'");
    return EXIT.NEEDS_HUMAN;
  }
  const view = runGh(root, ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  const repo = view.ok ? view.stdout : "";
  if (!repo) {
    ctx.log(
      `could not resolve the repository via 'gh repo view'${view.stderr ? `: ${view.stderr}` : ""}`,
    );
    return EXIT_NO_REPO;
  }
  const endpoint = `repos/${repo}/branches/${BRANCH}/protection`;

  if (ctx.flags.print === true) {
    const current = runGh(root, ["api", endpoint]);
    if (!current.ok && !isUnprotected(current.stderr)) {
      ctx.log(`gh api ${endpoint} failed: ${current.stderr}`);
      return EXIT_GH_API_FAILED;
    }
    if (!current.ok) {
      ctx.log(`${BRANCH} has no protection rule`);
      ctx.emit({ repo, branch: BRANCH, protected: false, protection: null });
      return EXIT.OK;
    }
    const rule = parseJson(current.stdout);
    if (!rule.ok) {
      ctx.log(`gh api ${endpoint} did not return JSON: ${current.stdout.slice(0, 200)}`);
      return EXIT_GH_API_FAILED;
    }
    ctx.emit({ repo, branch: BRANCH, protected: true, protection: rule.value });
    return EXIT.OK;
  }

  const { ciWorkflow, capstoneJob } = readBkitConfig(root);
  const ciRel = path.join(".github", "workflows", ciWorkflow);
  const ciFile = path.join(root, ciRel);
  if (!fs.existsSync(ciFile)) {
    ctx.log(
      `${ciRel} not found — cannot verify the '${capstoneJob}' status check exists. Aborting.`,
    );
    return EXIT_NO_CI_WORKFLOW;
  }
  if (!declaresJob(fs.readFileSync(ciFile, "utf-8"), capstoneJob)) {
    ctx.log(`no job named '${capstoneJob}' found in ${ciRel}.`);
    ctx.log("Requiring a status check that no CI job produces would wedge every PR. Aborting.");
    return EXIT_NO_CAPSTONE_JOB;
  }

  const payload = protectionPayload(capstoneJob);
  ctx.log(`${dryRun ? "Would apply" : "Applying"} protection to ${BRANCH} on ${repo}`);
  const result = {
    repo,
    branch: BRANCH,
    requiredCheck: capstoneJob,
    ciWorkflow,
    dryRun,
    payload,
  };
  if (dryRun) {
    ctx.log(`gh api -X PUT ${endpoint} --input -`);
    ctx.emit({ ...result, applied: false });
    return EXIT.OK;
  }
  const put = runGh(root, ["api", "-X", "PUT", endpoint, "--input", "-"], JSON.stringify(payload));
  if (!put.ok) {
    ctx.log(`gh api -X PUT ${endpoint} failed: ${put.stderr}`);
    return EXIT_GH_API_FAILED;
  }
  ctx.log(`Done. Verify with: gh api ${endpoint} | jq .`);
  ctx.emit({ ...result, applied: true });
  return EXIT.OK;
}

export const setupCommand: CommandSpec = {
  noun: "setup",
  summary: "One-off repository setup an operator runs.",
  verbs: {
    "protect-main": {
      summary: "Apply bkit's branch protection to main, requiring the capstone check.",
      flags: [
        {
          name: "dry-run",
          type: "boolean",
          help: "check and print the policy without applying it",
        },
        {
          name: "print",
          type: "boolean",
          help: "print main's current protection and change nothing",
        },
      ],
      output: {
        repo: "owner/name the policy targets",
        branch: "always main",
        requiredCheck: "the required status check (bkit.capstoneJob)",
        ciWorkflow: "the CI workflow checked for that job (bkit.ciWorkflow)",
        dryRun: "true with --dry-run",
        applied: "true when the policy was written to GitHub",
        payload: "the protection body sent (or that would be sent)",
        protected: "with --print: whether main has a protection rule",
        protection: "with --print: the current rule, or null",
      },
      exitCodes: {
        [EXIT_NO_REPO]: "gh repo view could not name the repository",
        [EXIT_NO_CI_WORKFLOW]: "the CI workflow file (bkit.ciWorkflow) does not exist",
        [EXIT_NO_CAPSTONE_JOB]: "the CI workflow has no job named bkit.capstoneJob",
        [EXIT_GH_API_FAILED]: "a gh api call failed",
      },
      run: protectMain,
    },
  },
};
