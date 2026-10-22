// bkit repo info|preflight — the repo facts every phase workflow's Step 1 derives,
// and the advisory dispatch-permission preflight ship's Step 1 runs.
//
// `owner/repo` comes from `gh repo view`; when gh is missing, unauthed, or
// answers nothing, from the `origin` remote URL instead (the MCP fallback the
// workflows already describe: "parse git remote"). The current branch, how far it
// trails `origin/dev`, the main checkout, the bkit binary every later block calls,
// and whether that bkit is behind the newest release ride along so Step 1 is one call.

import * as fs from "node:fs";
import * as path from "node:path";

import { parseRemoteUrlToSlug } from "../../ledgers/telemetry.js";
import { DEV, EXIT, git, repoRoot, runGit, runTool, type CommandSpec } from "../lib.js";
import { bkitVersionStatus } from "../../shared/bkit-latest.js";
import { readBkitConfig, trackerScope } from "../../shared/settings.js";

/** Exit code: neither gh nor the origin remote named an owner/repo. */
export const EXIT_NO_REPO = 3;
/** Exit code: HEAD is detached, so there is no current branch (and --allow-detached was not given). */
export const EXIT_DETACHED = 4;

/** `owner/repo` split once, or null unless both halves are non-empty and there is exactly one slash. */
export function splitSlug(slug: string): { owner: string; repo: string } | null {
  const m = /^([^/\s]+)\/([^/\s]+)$/.exec(slug.trim());
  return m ? { owner: m[1]!, repo: m[2]! } : null;
}

/** `owner/repo` from gh, else the origin remote. */
export function resolveOwnerRepo(
  cwd: string,
): { ownerRepo: string; source: "gh" | "remote" } | null {
  const gh = runTool(
    "gh",
    ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"],
    cwd,
  );
  if (gh.status === 0 && splitSlug(gh.stdout)) return { ownerRepo: gh.stdout.trim(), source: "gh" };
  const url = git(cwd, ["remote", "get-url", "origin"]);
  const slug = url ? parseRemoteUrlToSlug(url) : "";
  return splitSlug(slug) ? { ownerRepo: slug, source: "remote" } : null;
}

/**
 * How far HEAD trails `origin/dev`, from whatever was last fetched. null when
 * `origin/dev` is not known locally: "0 behind" there would be a false claim.
 */
export function behindDev(cwd: string): { behindDev: number | null; divergedAgo: string | null } {
  const behind = git(cwd, ["rev-list", "--count", "HEAD..origin/dev"]);
  if (behind === null) return { behindDev: null, divergedAgo: null };
  const mb = git(cwd, ["merge-base", "HEAD", "origin/dev"]);
  const ago = mb ? git(cwd, ["show", "-s", "--format=%ar", mb]) : null;
  return { behindDev: Number(behind), divergedAgo: ago || null };
}

/**
 * The bkit binary every later block calls: the repo-pinned one first — it matches
 * the version this repo installed — else `bkit` on PATH (a checkout whose
 * node_modules was pruned, or a globally installed bkit). The pinned path is
 * returned even when nothing exists, so the failure names the expected location.
 */
export function resolveBkitBinary(root: string): string {
  const pinned = path.join(root, "node_modules", ".bin", "bkit");
  if (fs.existsSync(pinned)) return pinned;
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    if (dir === "") continue;
    const candidate = path.join(dir, "bkit");
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // keep looking
    }
  }
  return pinned;
}

/**
 * The Step 1 dispatch-permission preflight: can `gh` read this repo's Actions
 * permissions? Advisory only — a false just warns that `gh workflow run` may 403;
 * it never stops the run. gh missing or unauthed is not an error (the runtime row
 * already recorded `runtimeGithubCli`, and the workflow falls back to MCP).
 */
export function actionsPermissionsReadable(
  cwd: string,
  ownerRepo: string,
): { readable: boolean; status: number; detail: string } {
  const res = runTool("gh", ["api", `repos/${ownerRepo}/actions/permissions`], cwd);
  const detail =
    res.stderr
      .split("\n")
      .filter((l) => l.trim() !== "")
      .at(-1) ?? "";
  return { readable: res.found && res.status === 0, status: res.status, detail };
}

export const repoCommand: CommandSpec = {
  noun: "repo",
  summary: "Repo facts for Step 1: owner/repo, current branch, and how far it trails dev.",
  verbs: {
    info: {
      summary:
        "owner/repo (gh, else the origin remote), the current branch, and commits behind origin/dev.",
      flags: [
        {
          name: "fetch",
          type: "boolean",
          help: "git fetch origin dev first, so behindDev is current (a failed fetch is logged, not fatal)",
        },
        {
          name: "allow-detached",
          type: "boolean",
          help: "a detached HEAD is not an error: branch is null (CI checkouts)",
        },
      ],
      output: {
        ownerRepo: "owner/repo",
        owner: "owner half",
        repo: "repo half",
        source: "gh | remote — where ownerRepo came from",
        branch: "current branch (null on a detached HEAD)",
        behindDev: "commits on origin/dev not in HEAD (null when origin/dev is unknown locally)",
        divergedAgo: "age of the merge-base with origin/dev, e.g. '3 days ago' (null when unknown)",
        repoRoot: "the main checkout (the same from any worktree)",
        bkit: "the bkit binary the workflow blocks call: <repoRoot>/node_modules/.bin/bkit, else `bkit` on PATH",
        outboxRoot: "<git common dir>/bkit-outbox: per-run scratch files, never committed",
        bkitVersion:
          ".bkit/version pinnedVersion: the release this repo's bkit files came from (null when unpinned)",
        bkitLatest:
          "newest published @cbartens/bkit, asked at most once a day (null when offline, opted out via BKIT_NO_UPDATE_CHECK, or unpinned)",
        bkitOutdated:
          "true when bkitVersion is older than bkitLatest (null when either is unknown)",
        bkitAdvisory: "one line to show the user when bkitOutdated, else null",
        trackerTeam: "package.json bkit.linear.team under linear, else null",
        trackerProject:
          "package.json bkit.linear.project under linear, bkit.jira.project under jira, else null",
        trackerSite: "package.json bkit.jira.site under jira (the MCP cloudId), else null",
        trackerBoard:
          "{ownerType, owner, number} read from package.json bkit.github.project under github, else null",
      },
      exitCodes: {
        [EXIT_NO_REPO]: "neither gh nor the origin remote named an owner/repo",
        [EXIT_DETACHED]: "detached HEAD and no --allow-detached: there is no branch to work on",
      },
      run: (ctx) => {
        if (ctx.flags.fetch === true) {
          const res = runGit(ctx.cwd, ["fetch", "origin", DEV]);
          if (!res.ok)
            ctx.log(
              `git fetch origin dev failed — behindDev is as of the last fetch: ${res.stderr}`,
            );
        }
        const resolved = resolveOwnerRepo(ctx.cwd);
        if (!resolved) {
          ctx.log(
            "could not resolve owner/repo: gh repo view failed and the origin remote is missing or unparseable",
          );
          return EXIT_NO_REPO;
        }
        if (resolved.source === "remote")
          ctx.log("gh unavailable — owner/repo parsed from the origin remote");
        const { owner, repo } = splitSlug(resolved.ownerRepo)!;
        const branch = git(ctx.cwd, ["branch", "--show-current"]) || null;
        const behind = behindDev(ctx.cwd);
        if (behind.behindDev === null) {
          ctx.log("origin/dev not found locally — cannot say how far this branch trails dev");
        } else {
          ctx.log(
            `branch is ${behind.behindDev} commits behind dev / ${behind.divergedAgo ?? "unknown"} since divergence`,
          );
        }
        const root = repoRoot(ctx.cwd);
        const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
        const latest = bkitVersionStatus(root, common);
        if (latest.advisory !== null) ctx.log(latest.advisory);
        ctx.emit({
          ...resolved,
          owner,
          repo,
          branch,
          ...behind,
          repoRoot: root,
          bkit: resolveBkitBinary(root),
          outboxRoot: path.join(common ?? path.join(root, ".git"), "bkit-outbox"),
          bkitVersion: latest.version,
          bkitLatest: latest.latest,
          bkitOutdated: latest.outdated,
          bkitAdvisory: latest.advisory,
          ...trackerScope(readBkitConfig(root)),
        });
        if (branch === null && ctx.flags.allowDetached !== true) {
          ctx.log("HEAD is detached — no current branch");
          return EXIT_DETACHED;
        }
        return EXIT.OK;
      },
    },
    preflight: {
      summary:
        "Advisory: whether gh can read the repo's Actions permissions (dispatch may 403 without them).",
      flags: [
        {
          name: "owner-repo",
          type: "string",
          help: "owner/repo to check (default: resolved from gh, else the origin remote)",
        },
      ],
      output: {
        ownerRepo: "owner/repo checked",
        actionsPermissionsReadable: "gh could read repos/<owner>/<repo>/actions/permissions",
        status: "the gh api exit code (127 when gh is not on PATH)",
        warning: "an advisory line when the read failed, else null",
      },
      exitCodes: {
        [EXIT_NO_REPO]: "neither --owner-repo, gh, nor the origin remote named an owner/repo",
      },
      run: (ctx) => {
        const given = typeof ctx.flags.ownerRepo === "string" ? ctx.flags.ownerRepo.trim() : "";
        const resolved = given !== "" ? splitSlug(given) : null;
        const ownerRepo =
          given !== "" ? (resolved ? given : null) : (resolveOwnerRepo(ctx.cwd)?.ownerRepo ?? null);
        if (ownerRepo === null) {
          ctx.log("could not resolve owner/repo for the dispatch preflight");
          return EXIT_NO_REPO;
        }
        const r = actionsPermissionsReadable(ctx.cwd, ownerRepo);
        const detail = r.detail ? `: ${r.detail}` : "";
        const warning = r.readable
          ? null
          : `actions:write preflight — gh could not read repos/${ownerRepo}/actions/permissions (exit ${String(r.status)}${detail}); gh workflow run may 403`;
        if (warning) ctx.log(warning);
        ctx.emit({
          ownerRepo,
          actionsPermissionsReadable: r.readable,
          status: r.status,
          warning,
        });
        return EXIT.OK;
      },
    },
  },
};
