// bkit fids check|parse|find — feature-id format per tracker, recovering a FID
// from a branch name or a PR-body marker, and finding the feature already logged
// for an issue.
//
// A FID names the branch (`feat/{FID}`), the log folder and every artifact, so
// it is checked before first use. Its shape follows the tracker that minted it:
//   github  {N}-{slug}           ^[0-9]+-[a-z0-9-]+$
//   linear  {team}-{N}-{slug}    ^[a-z]+-[0-9]+-[a-z0-9-]+$  (issue id lowercased first)
//   jira    {project}-{N}-{slug} ^[a-z][a-z0-9]+-[0-9]+-[a-z0-9-]+$  (issue key lowercased first)
//   none    any slug             ^[a-z0-9][a-z0-9-]*$        (no tracker shape; still path-safe)
//   any     any tracker's shape  ^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$  (auto's CI_DEV allowlist)
// A run with no issue carries an issue-less FID under every tracker. One minted from a
// prompt is a slug with no all-digit word (`dev-ci-failures`), so it can never parse as an
// issue id; one taken verbatim from the branch (`feat/upgrade-react-19`) or the prompt is
// any slug.

import * as fs from "node:fs";
import * as path from "node:path";

import { parseIssueTracker, type IssueTracker } from "../../install/manifest.js";
import {
  CommandError,
  EXIT,
  git,
  parseJson,
  repoRoot,
  statusRelPath,
  type CommandSpec,
  type FlagSpec,
} from "../lib.js";
import { readBkitConfig } from "../../shared/settings.js";
import { lastRun } from "../../ledgers/status.js";
import { monthBuckets, readRunsLenient } from "./locks.js";
import { WORKFLOW_FLAG, str } from "./status.js";

export type FidTracker = IssueTracker | "any";

export const FID_PATTERNS: Readonly<Record<FidTracker, RegExp>> = {
  github: /^[0-9]+-[a-z0-9-]+$/,
  linear: /^[a-z]+-[0-9]+-[a-z0-9-]+$/,
  jira: /^[a-z][a-z0-9]+-[0-9]+-[a-z0-9-]+$/,
  none: /^[a-z0-9][a-z0-9-]*$/,
  any: /^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$/,
};

/** Trackers whose issue id is a `{KEY}-{N}` key, carried lowercased in the FID. */
const KEYED: ReadonlySet<FidTracker> = new Set(["linear", "jira"]);
/** The uppercase issue key each keyed tracker mints. */
const ISSUE_KEY = { linear: /^[A-Z]+-[0-9]+$/, jira: /^[A-Z][A-Z0-9]+-[0-9]+$/ } as const;

/** The slug every recovered FID must pass before it touches a path (auto's branch fallback). */
const SLUG = FID_PATTERNS.none;

/** An issue-less FID: a slug with no all-digit `-`-separated word, so it never parses as an issue id. */
export const ISSUE_LESS_FID = /^(?!.*(?:^|-)[0-9]+(?:-|$))[a-z0-9][a-z0-9-]*$/;

/** The issue id each wired tracker mints (`#` stripped; linear and jira keys are uppercase). */
export const ISSUE_ID_PATTERNS: Readonly<Record<Exclude<IssueTracker, "none">, RegExp>> = {
  github: /^[0-9]+$/,
  linear: /^[A-Z]+-[0-9]+$/,
  jira: /^[A-Z][A-Z0-9]+-[0-9]+$/,
};

/**
 * The problem with a FID for the tracker and the run's issue, or undefined when it is valid.
 * `issue` absent: the tracker's FID shape alone. A non-empty `issue`: the issue id and the
 * FID both match the tracker, and the issue id the FID embeds is that issue. An empty
 * `issue` (a run with no issue): the FID is any slug (a minted one is held to
 * `ISSUE_LESS_FID` by `fids free`). The `none` tracker has no issue-id shape, so `issue`
 * is ignored.
 */
export function fidProblem(fid: string, tracker: FidTracker, issue?: string): string | undefined {
  const shape = FID_PATTERNS[tracker];
  const shapeProblem = shape.test(fid)
    ? undefined
    : `FID "${fid}" does not match the ${tracker} shape ${shape.source}`;
  if (issue === undefined || tracker === "none") return shapeProblem;
  if (issue === "") {
    return SLUG.test(fid)
      ? undefined
      : `FID "${fid}" is not a slug (${SLUG.source}): a run with no issue needs a lowercase slug`;
  }
  const idShapes =
    tracker === "any" ? Object.values(ISSUE_ID_PATTERNS) : [ISSUE_ID_PATTERNS[tracker]];
  if (!idShapes.some((re) => re.test(issue))) {
    return `issue "${issue}" is not a ${tracker} issue id`;
  }
  if (shapeProblem !== undefined) return shapeProblem;
  const embedded = issueIdOf(fid, tracker);
  return embedded === issue
    ? undefined
    : `FID "${fid}" embeds issue ${embedded ?? "none"}, not the run's issue ${issue}`;
}

/** Exit code: no FID could be recovered from the marker or the branch. */
export const EXIT_NO_FID = 3;
/** Exit code (find): more than one feature is logged for the issue. */
export const EXIT_SEVERAL = 4;
/** Exit code (free): the minted name and every suffix of it are used. */
export const EXIT_NO_FREE = 5;

/**
 * Features already logged for an issue: every `docs/plans/{YYYYMM}/logs/{issue}-*`
 * folder, the issue id lowercased (a Linear or Jira FID carries it lowercased). Sorted, unique.
 */
export function logged(root: string, issue: string): string[] {
  const key = `${issue.replace(/^#/, "").toLowerCase()}-`;
  const plans = path.join(root, "docs", "plans");
  if (!fs.existsSync(plans)) return [];
  const found = new Set<string>();
  for (const month of fs.readdirSync(plans).filter((m) => /^[0-9]{6}$/.test(m))) {
    const logs = path.join(plans, month, "logs");
    if (!fs.existsSync(logs)) continue;
    for (const fid of fs.readdirSync(logs)) {
      if (fid.startsWith(key) && fs.statSync(path.join(logs, fid)).isDirectory()) found.add(fid);
    }
  }
  return [...found].sort();
}

/** Suffixes tried after a minted name that an earlier run used: `-b` … `-z`. */
const MINT_SUFFIXES = [..."bcdefghijklmnopqrstuvwxyz"];

/**
 * The FID a minted issue-less run takes: `fid` itself, or the first of `fid-b`, `fid-c`, ...
 * that no earlier run used. A name is used when it has a log folder (any month bucket) in
 * one of `roots` whose last `workflow` run is not IN_PROGRESS; an in-progress one is
 * continued. null when every name is used.
 */
export function freeFid(roots: string[], fid: string, workflow: string): string | null {
  for (const name of [fid, ...MINT_SUFFIXES.map((x) => `${fid}-${x}`)]) {
    let used = false;
    for (const root of roots) {
      for (const month of monthBuckets(root, name)) {
        const run = lastRun(readRunsLenient(path.join(root, statusRelPath(month, name))), workflow);
        if (run?.status === "IN_PROGRESS") return name;
        used = true;
      }
    }
    if (!used) return name;
  }
  return null;
}

/**
 * The canonical design doc for a feature, `docs/plans/{YYYYMM}/{fid}-design.md`: the
 * `month` bucket first, else the newest bucket holding one. null when none exists.
 */
export function designDoc(
  root: string,
  fid: string,
  month?: string,
): { month: string; path: string } | null {
  const plans = path.join(root, "docs", "plans");
  if (!fs.existsSync(plans)) return null;
  const at = (m: string) => fs.existsSync(path.join(plans, m, `${fid}-design.md`));
  const months = fs
    .readdirSync(plans)
    .filter((m) => /^[0-9]{6}$/.test(m))
    .sort()
    .reverse();
  const hit = month !== undefined && months.includes(month) && at(month) ? month : months.find(at);
  return hit === undefined ? null : { month: hit, path: `docs/plans/${hit}/${fid}-design.md` };
}

/** `package.json` `bkit.issueTracker` at the main checkout (cwd outside git); default `none`. */
export function readIssueTracker(cwd: string): IssueTracker {
  const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  return readBkitConfig(common ? path.dirname(common) : cwd).issueTracker;
}

function trackerFlag(value: string | undefined, cwd: string, allowAny: boolean): FidTracker {
  if (value === undefined) return readIssueTracker(cwd);
  if (value === "any" && allowAny) return "any";
  const t = parseIssueTracker(value);
  if (!t) {
    throw new CommandError(
      EXIT.USAGE,
      `--tracker must be github, linear, jira, none${allowAny ? ", any" : ""}; got "${value}"`,
    );
  }
  return t;
}

/** Linear and Jira issue ids arrive uppercase (`ABC-123`); the FID carries them lowercased. */
export const normaliseFid = (fid: string, tracker: FidTracker) =>
  KEYED.has(tracker) ? fid.toLowerCase() : fid;

/**
 * The tracker issue id a FID embeds, or null when it embeds none:
 * github the leading numeric segment, linear and jira the first two segments uppercased.
 */
export function issueIdOf(fid: string, tracker: FidTracker): string | null {
  const [first = "", second = ""] = fid.split("-");
  if (tracker === "github") return /^[0-9]+$/.test(first) ? first : null;
  if (KEYED.has(tracker)) {
    const id = `${first}-${second}`.toUpperCase();
    return ISSUE_KEY[tracker as "linear" | "jira"].test(id) ? id : null;
  }
  if (tracker === "any") {
    const m = /^([0-9]+|[a-z][a-z0-9]*-[0-9]+)(?=-)/.exec(fid);
    return m ? m[1]!.toUpperCase() : null;
  }
  return null;
}

/** The PR-body marker build and ship write, per tracker. Group 1 = issue id (absent for none), last = FID. */
const MARKERS: Readonly<Record<IssueTracker, RegExp>> = {
  github: /<!-- bkit:issue=#([0-9]+) bkit:fid=(\S+) -->/,
  linear: /<!-- bkit:issue=([A-Za-z]+-[0-9]+) bkit:fid=(\S+) -->/,
  jira: /<!-- bkit:issue=([A-Za-z][A-Za-z0-9]+-[0-9]+) bkit:fid=(\S+) -->/,
  none: /<!-- bkit:fid=(\S+) -->/,
};

export interface ParsedFid {
  fid: string;
  issueId: string | null;
  source: "marker" | "branch";
}

/**
 * FID from the marker, when present and well-formed for the tracker. A wired tracker also
 * accepts the FID-only marker of an issue-less run: its FID must be issue-less, and it
 * resolves to `issueId: null`.
 */
export function fromMarker(text: string, tracker: IssueTracker): ParsedFid | null {
  const m = MARKERS[tracker].exec(text);
  if (!m) {
    if (tracker === "none") return null;
    const bare = MARKERS.none.exec(text);
    const fid = bare?.[1];
    return fid !== undefined && ISSUE_LESS_FID.test(fid)
      ? { fid, issueId: null, source: "marker" }
      : null;
  }
  const fid = normaliseFid(m[m.length - 1]!, tracker);
  if (!FID_PATTERNS[tracker].test(fid)) return null;
  const issueId = tracker === "none" ? null : KEYED.has(tracker) ? m[1]!.toUpperCase() : m[1]!;
  return { fid, issueId, source: "marker" };
}

/**
 * The issue ids a repo's feature rows in `.bkit/issues.jsonl` carry in their FID keys,
 * per the tracker's FID shape (`650-x` -> `650`; linear and jira keys uppercased).
 */
export function featureIssueIds(root: string, tracker: IssueTracker): ReadonlySet<string> {
  const file = path.join(root, ".bkit", "issues.jsonl");
  const ids = new Set<string>();
  if (tracker === "none" || !fs.existsSync(file) || !fs.statSync(file).isFile()) return ids;
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    if (line.trim() === "") continue;
    const row = parseJson(line);
    if (!row.ok || typeof row.value !== "object" || row.value === null) continue;
    const { kind, key } = row.value as Record<string, unknown>;
    if (kind !== "feature" || typeof key !== "string") continue;
    const id = issueIdOf(key, tracker);
    if (id !== null) ids.add(id);
  }
  return ids;
}

/**
 * FID from `feat/{FID}`; the slug check, then the issue id the tracker needs. A wired
 * tracker also accepts an issue-less FID (no issue id embedded, no all-digit word) as `issueId: null`.
 * With `known` (the issue ids the repo's feature rows carry), the FID is the suffix verbatim
 * for any slug: the issue id its shape embeds counts only when `known` holds it, else the
 * run is issue-less (`issueId: null`).
 */
export function fromBranch(
  branch: string,
  tracker: IssueTracker,
  known?: ReadonlySet<string>,
): { ok: true; parsed: ParsedFid } | { ok: false; why: string } {
  if (!branch.startsWith("feat/"))
    return { ok: false, why: `branch "${branch}" is not feat/{FID}` };
  const fid = branch.slice("feat/".length);
  if (!SLUG.test(fid)) return { ok: false, why: `"${fid}" is not a slug (${SLUG.source})` };
  const issueId = issueIdOf(fid, tracker);
  if (known !== undefined) {
    const linked = issueId !== null && known.has(issueId) ? issueId : null;
    return { ok: true, parsed: { fid, issueId: linked, source: "branch" } };
  }
  if (tracker !== "none" && issueId === null && !ISSUE_LESS_FID.test(fid)) {
    return { ok: false, why: `"${fid}" embeds no ${tracker} issue id` };
  }
  return { ok: true, parsed: { fid, issueId, source: "branch" } };
}

const TRACKER_FLAG: FlagSpec = {
  name: "tracker",
  type: "string",
  help: "github | linear | jira | none (default: package.json bkit.issueTracker, else none)",
};

export const fidsCommand: CommandSpec = {
  noun: "fids",
  summary: "Feature-id format per tracker, and FID recovery from a branch or PR-body marker.",
  verbs: {
    check: {
      summary: "Validate a FID for the tracker: exit 0 valid, exit 1 not.",
      flags: [
        { name: "fid", type: "string", required: true, help: "feature id to check" },
        { ...TRACKER_FLAG, help: `${TRACKER_FLAG.help}; any = any tracker's shape (CI_DEV)` },
        {
          name: "issue",
          type: "string",
          help: 'the run\'s issue id (the FID must embed it), or "" for a run with no issue (then the FID must be a slug); absent = the tracker shape alone',
        },
      ],
      output: {
        fid: "the FID as checked (linear, jira: lowercased)",
        tracker: "tracker the shape came from",
        valid: "true when the FID matches",
        pattern: "the regex checked (the slug rule when --issue is empty)",
        issueId: "issue id the FID embeds (null under none, or when invalid)",
      },
      run: (ctx) => {
        const tracker = trackerFlag(str(ctx.flags.tracker), ctx.cwd, true);
        const fid = normaliseFid(String(ctx.flags.fid), tracker);
        const issue = str(ctx.flags.issue);
        const pattern = issue === "" && tracker !== "none" ? SLUG : FID_PATTERNS[tracker];
        const problem = fidProblem(fid, tracker, issue);
        const valid = problem === undefined;
        if (!valid) ctx.log(problem);
        ctx.emit({
          fid,
          tracker,
          valid,
          pattern: pattern.source,
          issueId: valid ? issueIdOf(fid, tracker) : null,
        });
        return valid ? EXIT.OK : EXIT.NO;
      },
    },
    parse: {
      summary:
        "Recover FID and issue id: the PR-body marker first, then a feat/{FID} branch (any slug; its issue id counts only when .bkit/issues.jsonl has a feature row for it, else the run is issue-less).",
      flags: [
        {
          name: "marker",
          type: "string",
          help: "text holding the bkit:fid marker (e.g. the PR body)",
        },
        { name: "branch", type: "string", help: "branch name, feat/{FID}" },
        TRACKER_FLAG,
      ],
      output: {
        fid: "the recovered FID",
        issueId:
          "tracker issue id; null under none, for a marker with none, and for a branch whose embedded issue id has no feature row (an issue-less run)",
        source: "marker | branch",
        tracker: "tracker the shapes came from",
      },
      exitCodes: {
        [EXIT_NO_FID]:
          "neither the marker nor the branch yielded a FID (a branch that is not feat/ or whose suffix is not a slug)",
      },
      run: (ctx) => {
        const marker = str(ctx.flags.marker);
        const branch = str(ctx.flags.branch);
        if (marker === undefined && branch === undefined) {
          throw new CommandError(EXIT.USAGE, "give --marker, --branch, or both");
        }
        const tracker = trackerFlag(str(ctx.flags.tracker), ctx.cwd, false) as IssueTracker;
        const viaMarker = marker === undefined ? null : fromMarker(marker, tracker);
        if (viaMarker) {
          ctx.emit({ ...viaMarker, tracker });
          return EXIT.OK;
        }
        if (marker !== undefined)
          ctx.log(`no well-formed ${tracker} bkit:fid marker — trying the branch`);
        if (branch === undefined) return EXIT_NO_FID;
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        const viaBranch = fromBranch(branch, tracker, featureIssueIds(top, tracker));
        if (!viaBranch.ok) {
          ctx.log(viaBranch.why);
          return EXIT_NO_FID;
        }
        ctx.emit({ ...viaBranch.parsed, tracker });
        return EXIT.OK;
      },
    },
    free: {
      summary:
        "The FID a minted issue-less run takes: the minted name, or the first free -b, -c, ... suffix when an earlier finished run used it (exit 0 free, exit 1 not an issue-less FID, exit 5 every name used).",
      flags: [
        {
          name: "fid",
          type: "string",
          required: true,
          help: "the minted issue-less FID: a lowercase slug with no all-digit word",
        },
        {
          ...WORKFLOW_FLAG,
          help: "the workflow starting; its last run in an existing log folder decides",
        },
      ],
      output: {
        fid: "the FID to use: the minted name, or the first free suffixed one",
        requested: "the minted name that was asked about",
        suffixed: "true when an earlier run used the minted name",
      },
      exitCodes: {
        [EXIT_NO_FREE]: "the minted name and every -b … -z suffix of it are used by finished runs",
      },
      run: (ctx) => {
        const requested = normaliseFid(String(ctx.flags.fid), "none");
        if (!ISSUE_LESS_FID.test(requested)) {
          ctx.log(
            `FID "${requested}" is not an issue-less FID (${ISSUE_LESS_FID.source}): a minted FID for a run with no issue needs a lowercase slug with no all-digit word — re-mint with every all-digit word dropped`,
          );
          return EXIT.NO;
        }
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        const roots = [...new Set([top, repoRoot(ctx.cwd)])];
        const fid = freeFid(roots, requested, String(ctx.flags.workflow));
        if (fid === null) {
          ctx.log(`"${requested}" and every -b … -z suffix of it are used by finished runs`);
          return EXIT_NO_FREE;
        }
        ctx.emit({ fid, requested, suffixed: fid !== requested });
        return EXIT.OK;
      },
    },
    design: {
      summary:
        "The feature's own design doc, docs/plans/{YYYYMM}/{FID}-design.md: exit 0 found, exit 1 none.",
      flags: [
        { name: "fid", type: "string", required: true, help: "feature id" },
        {
          name: "month",
          type: "string",
          help: "YYYYMM bucket checked first; else the newest bucket holding the doc",
        },
      ],
      output: {
        fid: "the FID when its design doc exists, else null",
        month: "the bucket holding it, else null",
        path: "repo-relative path, else null",
      },
      run: (ctx) => {
        const fid = String(ctx.flags.fid);
        const hit = designDoc(repoRoot(ctx.cwd), fid, str(ctx.flags.month));
        ctx.emit(
          hit ? { fid, month: hit.month, path: hit.path } : { fid: null, month: null, path: null },
        );
        return hit ? EXIT.OK : EXIT.NO;
      },
    },
    find: {
      summary: "The feature already logged for an issue: exit 0 one, exit 1 none, exit 4 several.",
      flags: [
        {
          name: "issue",
          type: "string",
          required: true,
          help: "tracker issue id (github: 123 or #123; linear / jira: ABC-123)",
        },
      ],
      output: {
        fid: "the one FID logged for the issue, or null",
        fids: "every FID logged for the issue (docs/plans/*/logs/{issue}-*)",
      },
      exitCodes: { [EXIT_SEVERAL]: "several features are logged for the issue — name one" },
      run: (ctx) => {
        const fids = logged(repoRoot(ctx.cwd), String(ctx.flags.issue));
        ctx.emit({ fid: fids.length === 1 ? fids[0] : null, fids });
        if (fids.length > 1) {
          ctx.log(`several features logged for ${String(ctx.flags.issue)}: ${fids.join(", ")}`);
          return EXIT_SEVERAL;
        }
        return fids.length === 1 ? EXIT.OK : EXIT.NO;
      },
    },
  },
};
