// bkit repo info — the repo facts every phase workflow's Step 1 derives.
//
// `owner/repo` comes from `gh repo view`; when gh is missing, unauthed, or
// answers nothing, from the `origin` remote URL instead (the MCP fallback the
// workflows already describe: "parse git remote"). The current branch, how far it
// trails `origin/dev`, the main checkout, and the bkit binary every later block
// calls ride along so Step 1 is one call.
import * as fs from "node:fs";
import * as path from "node:path";
import { parseRemoteUrlToSlug } from "../../ledgers/telemetry.js";
import { EXIT, git, repoRoot, runGit, runTool } from "../lib.js";
/** Exit code: neither gh nor the origin remote named an owner/repo. */
export const EXIT_NO_REPO = 3;
/** Exit code: HEAD is detached, so there is no current branch (and --allow-detached was not given). */
export const EXIT_DETACHED = 4;
/** `owner/repo` split once, or null unless both halves are non-empty and there is exactly one slash. */
export function splitSlug(slug) {
    const m = /^([^/\s]+)\/([^/\s]+)$/.exec(slug.trim());
    return m ? { owner: m[1], repo: m[2] } : null;
}
/** `owner/repo` from gh, else the origin remote. */
export function resolveOwnerRepo(cwd) {
    const gh = runTool("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"], cwd);
    if (gh.status === 0 && splitSlug(gh.stdout))
        return { ownerRepo: gh.stdout.trim(), source: "gh" };
    const url = git(cwd, ["remote", "get-url", "origin"]);
    const slug = url ? parseRemoteUrlToSlug(url) : "";
    return splitSlug(slug) ? { ownerRepo: slug, source: "remote" } : null;
}
/**
 * How far HEAD trails `origin/dev`, from whatever was last fetched. null when
 * `origin/dev` is not known locally: "0 behind" there would be a false claim.
 */
export function behindDev(cwd) {
    const behind = git(cwd, ["rev-list", "--count", "HEAD..origin/dev"]);
    if (behind === null)
        return { behindDev: null, divergedAgo: null };
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
export function resolveBkitBinary(root) {
    const pinned = path.join(root, "node_modules", ".bin", "bkit");
    if (fs.existsSync(pinned))
        return pinned;
    for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
        if (dir === "")
            continue;
        const candidate = path.join(dir, "bkit");
        try {
            fs.accessSync(candidate, fs.constants.X_OK);
            return candidate;
        }
        catch {
            // keep looking
        }
    }
    return pinned;
}
export const repoCommand = {
    noun: "repo",
    summary: "Repo facts for Step 1: owner/repo, current branch, and how far it trails dev.",
    verbs: {
        info: {
            summary: "owner/repo (gh, else the origin remote), the current branch, and commits behind origin/dev.",
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
            },
            exitCodes: {
                [EXIT_NO_REPO]: "neither gh nor the origin remote named an owner/repo",
                [EXIT_DETACHED]: "detached HEAD and no --allow-detached: there is no branch to work on",
            },
            run: (ctx) => {
                if (ctx.flags.fetch === true) {
                    const res = runGit(ctx.cwd, ["fetch", "origin", "dev"]);
                    if (!res.ok)
                        ctx.log(`git fetch origin dev failed — behindDev is as of the last fetch: ${res.stderr}`);
                }
                const resolved = resolveOwnerRepo(ctx.cwd);
                if (!resolved) {
                    ctx.log("could not resolve owner/repo: gh repo view failed and the origin remote is missing or unparseable");
                    return EXIT_NO_REPO;
                }
                if (resolved.source === "remote")
                    ctx.log("gh unavailable — owner/repo parsed from the origin remote");
                const { owner, repo } = splitSlug(resolved.ownerRepo);
                const branch = git(ctx.cwd, ["branch", "--show-current"]) || null;
                const behind = behindDev(ctx.cwd);
                if (behind.behindDev === null) {
                    ctx.log("origin/dev not found locally — cannot say how far this branch trails dev");
                }
                else {
                    ctx.log(`branch is ${behind.behindDev} commits behind dev / ${behind.divergedAgo ?? "unknown"} since divergence`);
                }
                const root = repoRoot(ctx.cwd);
                const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
                ctx.emit({
                    ...resolved,
                    owner,
                    repo,
                    branch,
                    ...behind,
                    repoRoot: root,
                    bkit: resolveBkitBinary(root),
                    outboxRoot: path.join(common ?? path.join(root, ".git"), "bkit-outbox"),
                });
                if (branch === null && ctx.flags.allowDetached !== true) {
                    ctx.log("HEAD is detached — no current branch");
                    return EXIT_DETACHED;
                }
                return EXIT.OK;
            },
        },
    },
};
