// bkit fids check|parse|resolve|plans|design|find — feature-id format per tracker,
// the issue and FID a session prompt names, recovering a FID from a branch name or a
// PR-body marker, the one FID chain Step 1 resolves, a feature's plan files and its
// plan inputs, and finding the feature already logged for an issue.
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
//
// Minting (`fids resolve`): `{issue}-{slug}` with an issue (Linear / Jira key lowercased),
// `{branch-suffix}-{slug}` without one. The slug is the first three words of the issue
// title (the prompt when the title has none, the workflow name when neither has any),
// ASCII-folded and lowercased, with `STOPWORDS` and all-digit words dropped. The branch
// suffix is the last `/` segment of the current branch, all-digit words dropped; it does
// not count toward the three words.

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
import { originOwnerRepo } from "./repo.js";
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
 * `ISSUE_LESS_FID` by `fids resolve`). The `none` tracker has no issue-id shape, so `issue`
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
/** Exit code (resolve): the minted name and every suffix of it are used. */
export const EXIT_NO_FREE = 5;
/** Exit code: a file a flag names is missing. */
export const EXIT_NO_FILE = 7;
/** Exit code (parse --prompt-file): the prompt names more than one issue. */
export const EXIT_AMBIGUOUS = 8;
/** Exit code (resolve): the prompt holds only a bare number, so the FID would mint from the workflow name. */
export const EXIT_BARE_NUMBER = 9;

/** The stop message for a prompt that does not say which issue it means. */
const NAME_THE_ISSUE = "name the issue as #N, its key or its URL";

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

/** A file a flag names, or exit 7 when it is missing. */
function readNamed(file: string, flag: string): string {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile())
    throw new CommandError(EXIT_NO_FILE, `--${flag}: no file at ${file}`);
  return fs.readFileSync(file, "utf-8");
}

/** The issue title a `--title-file` holds: a JSON object's `title`, else the text itself. */
export function titleOf(text: string): string {
  const parsed = parseJson(text);
  if (parsed.ok && typeof parsed.value === "object" && parsed.value !== null) {
    const title = (parsed.value as Record<string, unknown>).title;
    if (typeof title === "string") return title;
  }
  return text.trim();
}

/** English words a minted slug drops. */
export const STOPWORDS: ReadonlySet<string> = new Set(
  (
    "a about after all also an and any are as at be been before being but by can could " +
    "did do does doing for from had has have he her his how i if in into is it its just " +
    "let me more most my no nor not now of off on once only or other our out over per " +
    "please same she should so some such than that the their them then there these they " +
    "this those through to too under until up us very via was we were what when where " +
    "which while who why will with would you your"
  ).split(" "),
);

/**
 * The slug words of free text in order: URLs, `<tags>` and `/commands` removed, letters
 * folded to ASCII, lowercased, split on anything else; stopwords and all-digit words dropped.
 */
export function slugWords(text: string): string[] {
  return text
    .replace(/\S+:\/\/\S+/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/(^|\s)\/\S+/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w !== "" && !STOPWORDS.has(w) && !/^[0-9]+$/.test(w));
}

/** The FID a run mints; see the header comment for the rules. */
export function mintFid(o: {
  issue: string;
  title?: string;
  prompt: string;
  branch?: string | null;
  workflow?: string;
}): string {
  const fromTitle = slugWords(o.title ?? "");
  const words = (fromTitle.length > 0 ? fromTitle : slugWords(o.prompt)).slice(0, 3);
  const slug = (words.length > 0 ? words : [o.workflow ?? "feature"]).join("-");
  if (o.issue !== "") return `${o.issue.replace(/^#/, "").toLowerCase()}-${slug}`;
  const suffix = (o.branch ?? "")
    .split("/")
    .at(-1)!
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w !== "" && !/^[0-9]+$/.test(w));
  return [...suffix, slug].join("-");
}

const MONTH = /^[0-9]{6}$/;

/** Every `docs/plans/{YYYYMM}/logs/{name}` folder name under the roots. */
function loggedNames(roots: string[]): Set<string> {
  const names = new Set<string>();
  for (const root of roots) {
    const plans = path.join(root, "docs", "plans");
    if (!fs.existsSync(plans)) continue;
    for (const month of fs.readdirSync(plans).filter((m) => MONTH.test(m))) {
      const logs = path.join(plans, month, "logs");
      if (!fs.existsSync(logs)) continue;
      for (const name of fs.readdirSync(logs)) {
        if (fs.statSync(path.join(logs, name)).isDirectory()) names.add(name);
      }
    }
  }
  return names;
}

/** Features logged for an issue on `origin/dev` (else local `dev`), read from git, not the working tree. */
export function loggedOnDev(cwd: string, issue: string): string[] {
  const ref = git(cwd, ["rev-parse", "--verify", "-q", "origin/dev"]) ? "origin/dev" : "dev";
  const out = git(cwd, ["ls-tree", "-r", "-d", "--name-only", ref, "--", "docs/plans"]);
  if (!out) return [];
  const key = `${issue.replace(/^#/, "").toLowerCase()}-`;
  const found = new Set<string>();
  for (const line of out.split("\n")) {
    const m = /^docs\/plans\/[0-9]{6}\/logs\/([^/]+)$/.exec(line.trim());
    if (m && m[1]!.startsWith(key)) found.add(m[1]!);
  }
  return [...found].sort();
}

type Hit = { value: string; at: number };

function hits(text: string, re: RegExp, map: (m: RegExpExecArray) => string | null): Hit[] {
  const out: Hit[] = [];
  for (const m of text.matchAll(re)) {
    const value = map(m);
    if (value !== null) out.push({ value, at: m.index });
  }
  return out;
}

/** The line text before a `#N` ends in a CSS colour property (`color: `, `background-color: `). */
const CSS_COLOUR_LEAD = /(?:colou?r|background|border|fill|stroke|outline|shadow)[\w-]*\s*:\s*$/i;

/** A `#N` hit that is a 3- or 6-digit CSS colour (`color: #123456`), not an issue. */
function cssColour(text: string, h: Hit): boolean {
  if (h.value.length !== 3 && h.value.length !== 6) return false;
  return CSS_COLOUR_LEAD.test(text.slice(text.lastIndexOf("\n", h.at) + 1, h.at));
}

const byPosition = (a: Hit, b: Hit) => a.at - b.at;

/** Where this repo's issues live: what a tracker URL and a bare key must match to count. */
export interface IssueScope {
  /** `bkit.tracker.linear.team` / `bkit.tracker.jira.project`: the prefix a key must carry. null = unset. */
  key?: string | null;
  /** `owner/repo` from the `origin` remote (github). null = no origin. */
  ownerRepo?: string | null;
  /** `bkit.tracker.jira.site` (jira). null = unset. */
  site?: string | null;
}

/** Start and end of every match of `re` in `text`. */
const spans = (text: string, re: RegExp): [number, number][] =>
  [...text.matchAll(re)].map((m) => [m.index, m.index + m[0].length]);

/** The host of a URL or bare host, lowercased: `https://Acme.atlassian.net/` -> `acme.atlassian.net`. */
const hostOf = (site: string) =>
  site
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .split("/")[0]!
    .toLowerCase();

/** A URL in prose: a bare key or `#N` inside one is part of the URL, not a mention. */
const ANY_URL = /\b[a-z][a-z0-9+.-]*:\/\/\S+/gi;

/**
 * Every issue reference the prompt makes for the tracker, in text order (ids may repeat),
 * split by form. `explicit`: an `<id>` / `<{tracker}_issue>` tag, a labelled form
 * (`GitHub issue: #N`, `issue #N`, `issue ABC-12`, `ISSUE-N`), or a tracker issue URL /
 * `owner/repo#N` pointing at this repo / team / site (`scope`). `bare`: a `#N` (a CSS
 * colour after `color:` and the like dropped), `owner/repo#N` with no origin to compare,
 * or a bare Linear / Jira key carrying the `scope.key` prefix; with no prefix configured a
 * bare key never counts and lands in `skipped` instead. A tracker URL or `owner/repo#N`
 * pointing elsewhere counts as neither, and a key or `#N` inside any URL is never bare.
 */
export function issueRefs(
  text: string,
  tracker: IssueTracker,
  scope: IssueScope = {},
): { explicit: Hit[]; bare: Hit[]; skipped: Hit[] } {
  const id = (m: RegExpExecArray) => m[1]!;
  const upper = (m: RegExpExecArray) => {
    const k = m[1]!.toUpperCase();
    return k.startsWith("ISSUE-") && !/^ISSUE-[0-9]+$/.test(k) ? null : k;
  };
  const prefix = scope.key ? `${scope.key.toUpperCase()}-` : null;
  let explicit: Hit[];
  let bare: Hit[];
  let skipped: Hit[] = [];
  let urlForm: RegExp;
  if (tracker === "github") {
    // With no origin to compare against, a URL to any repo counts and `owner/repo#N` stays bare.
    const ours = scope.ownerRepo?.toLowerCase() ?? null;
    const isOurs = (m: RegExpExecArray) => m[1]!.toLowerCase() === ours;
    urlForm = /https?:\/\/[^\s/]+\/([^\s/]+\/[^\s/]+)\/issues\/([0-9]+)(?![\w])/g;
    const shortRef = /(?<![\w&#/])([\w.-]+\/[\w.-]+)#([0-9]+)(?![\w-])/g;
    const inShortRef = spans(text, shortRef);
    explicit = [
      ...hits(text, /<id>\s*#?([0-9]+)\s*<\/id>/gi, id),
      ...hits(text, /<github_issue>\s*#?([0-9]+)\s*<\/github_issue>/gi, id),
      ...hits(text, /GitHub issue:\s*#?([0-9]+)\b/gi, id),
      ...hits(text, /\bissue:?\s*#([0-9]+)\b/gi, id),
      ...hits(text, /\bISSUE-([0-9]+)\b/g, id),
      ...hits(text, urlForm, (m) => (ours === null || isOurs(m) ? m[2]! : null)),
      ...hits(text, shortRef, (m) => (ours !== null && isOurs(m) ? m[2]! : null)),
    ];
    bare = [
      ...hits(text, /(?<![\w&#/])#([0-9]+)(?![\w-])/g, id).filter(
        (h) => !cssColour(text, h) && !inShortRef.some(([from, to]) => h.at >= from && h.at < to),
      ),
      ...hits(text, shortRef, (m) => (ours === null ? m[2]! : null)),
    ];
  } else if (tracker === "linear" || tracker === "jira") {
    const k = tracker === "linear" ? "[A-Za-z]+-[0-9]+" : "[A-Za-z][A-Za-z0-9]+-[0-9]+";
    const plain = tracker === "linear" ? "[A-Z]+-[0-9]+" : "[A-Z][A-Z0-9]+-[0-9]+";
    // bkit has no Linear workspace setting, so a Linear URL is matched on the team key alone.
    // With no team / project / site configured, that part of the URL is not compared.
    const site = tracker === "jira" && scope.site ? hostOf(scope.site) : null;
    urlForm =
      tracker === "linear"
        ? new RegExp(`()linear\\.app\\/[^\\s/]+\\/issue\\/(${k})`, "gi")
        : new RegExp(
            `(?:[a-z][a-z0-9+.-]*:\\/\\/)?([^\\s/]+)(?:\\/\\S*?)?\\/browse\\/(${k})`,
            "gi",
          );
    const ourUrl = (m: RegExpExecArray) => {
      const key = m[2]!.toUpperCase();
      if (prefix !== null && !key.startsWith(prefix)) return null;
      if (site !== null && m[1]!.toLowerCase() !== site) return null;
      return key;
    };
    explicit = [
      ...hits(text, new RegExp(`<id>\\s*(${k})\\s*<\\/id>`, "gi"), upper),
      ...hits(
        text,
        new RegExp(`<${tracker}_issue>\\s*(${k})\\s*<\\/${tracker}_issue>`, "gi"),
        upper,
      ),
      ...hits(text, new RegExp(`${tracker} issue:\\s*(${k})\\b`, "gi"), upper),
      ...hits(text, new RegExp(`\\b[Ii]ssue:?\\s+(${plain})\\b`, "g"), upper),
      ...hits(text, new RegExp(`\\bISSUE-(${plain})\\b`, "g"), upper),
      ...hits(text, urlForm, ourUrl),
    ];
    bare = hits(text, new RegExp(`(?<![\\w-])(${plain})(?![\\w-])`, "g"), upper);
    if (prefix === null) {
      skipped = bare;
      bare = [];
    } else {
      bare = bare.filter((h) => h.value.startsWith(prefix));
    }
  } else {
    return { explicit: [], bare: [], skipped: [] };
  }
  const urls = [...spans(text, ANY_URL), ...spans(text, urlForm)];
  const outsideUrls = (h: Hit) => !urls.some(([from, to]) => h.at >= from && h.at < to);
  const shape = ISSUE_ID_PATTERNS[tracker];
  const keep = (list: Hit[]) => list.filter((h) => shape.test(h.value)).sort(byPosition);
  return {
    explicit: keep(explicit),
    bare: keep(bare.filter(outsideUrls)),
    skipped: keep(skipped.filter(outsideUrls)),
  };
}

/** The issues a prompt names: the distinct explicit ids, else the distinct bare ones, in text order. */
export function issueCandidates(refs: { explicit: Hit[]; bare: Hit[] }): string[] {
  const pool = refs.explicit.length > 0 ? refs.explicit : refs.bare;
  return [...new Set(pool.map((h) => h.value))];
}

/** All-digit words a prompt holds outside URLs, tags, `/commands` and `#N`: an issue typed without its `#`. */
export function bareNumbers(text: string): string[] {
  const plain = text
    .replace(/\S+:\/\/\S+/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/(^|\s)\/\S+/g, " ");
  return [...plain.matchAll(/(?<![\w#/.-])([0-9]+)(?![\w/.-])/g)].map((m) => m[1]!);
}

/** The stderr hint for a bare number: how to write it so it names the issue. */
function bareNumberHint(n: string, tracker: IssueTracker, key: string | null): string {
  const write = tracker === "github" ? `#${n}` : `its issue key (${key ?? "KEY"}-${n})`;
  return `${n} reads as a bare number; write ${write}`;
}

/** The FID a prompt names explicitly: `feat/` and `docs/plans/` paths always, a bare word only when `logs/{word}/` exists. */
export function namedFid(text: string, roots: string[]): string | null {
  const fid = (m: RegExpExecArray) => {
    const f = m[1]!.replace(/-+$/, "");
    return SLUG.test(f) ? f : null;
  };
  const logged = loggedNames(roots);
  const found = [
    ...hits(text, /\bfeat\/([a-z0-9][a-z0-9-]*)/g, fid),
    ...hits(text, /docs\/plans\/[0-9]{6}\/logs\/([a-z0-9][a-z0-9-]*)/g, fid),
    ...hits(
      text,
      /docs\/plans\/[0-9]{6}\/([a-z0-9][a-z0-9-]*?)-(?:design|plan)(?:-[0-9]+)?\.md/g,
      fid,
    ),
    ...hits(text, /(?<![\w/-])([a-z0-9][a-z0-9-]*[a-z0-9])(?![\w/-])/g, (m) =>
      logged.has(m[1]!) ? m[1]! : null,
    ),
  ].sort((a, b) => a.at - b.at);
  return found[0]?.value ?? null;
}

/** `#N` for GitHub, the key itself for Linear and Jira, "" with no issue. */
export const issueRef = (issue: string, tracker: IssueTracker) =>
  issue === "" ? "" : tracker === "github" ? `#${issue}` : issue;

/** A feature's plan in a month bucket, as ship reads it: `{FID}-plan.md`, or none. */
export function planFiles(
  root: string,
  fid: string,
  month: string,
): { source: "single" | "none"; plan: string | null } {
  const name = `${fid}-plan.md`;
  return fs.existsSync(path.join(root, "docs", "plans", month, name))
    ? { source: "single", plan: `docs/plans/${month}/${name}` }
    : { source: "none", plan: null };
}

/** The `**Parent design:**` link target's FID and month in the text, or null. */
export function parentDesignLink(text: string): { fid: string; month: string } | null {
  const m =
    /\*\*Parent design:\*\*[^\n]*?docs\/plans\/([0-9]{6})\/([a-z0-9][a-z0-9-]*)-design\.md/.exec(
      text,
    );
  return m ? { month: m[1]!, fid: m[2]! } : null;
}

/** The `WS-{N}` ids on the first `**Workstreams:**` line in the texts; [] when none. */
export function workstreamIds(...texts: string[]): string[] {
  for (const text of texts) {
    const line = /\*\*Workstreams:\*\*([^\n]*)/.exec(text)?.[1];
    if (line !== undefined) return [...new Set(line.match(/WS-\d+/g) ?? [])];
  }
  return [];
}

/** Every `docs/audits/{YYYYMM}/*.md` path in the texts, first mention order, unique. */
export function auditPaths(...texts: string[]): string[] {
  const seen = new Set<string>();
  for (const text of texts) {
    for (const m of text.matchAll(/docs\/audits\/[0-9]{6}\/[A-Za-z0-9._-]+\.md/g)) seen.add(m[0]);
  }
  return [...seen];
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

/** `package.json` `bkit` config at the main checkout (cwd outside git). */
function mainConfig(cwd: string) {
  const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  return readBkitConfig(common ? path.dirname(common) : cwd);
}

/** `package.json` `bkit.tracker.default` at the main checkout (cwd outside git); default `none`. */
export function readIssueTracker(cwd: string): IssueTracker {
  return mainConfig(cwd).issueTracker;
}

/**
 * Where this repo's issues live, per tracker: github the `origin` owner/repo (read from the
 * remote, not gh, so a prompt parse makes no network call); linear `bkit.tracker.linear.team`; jira
 * `bkit.tracker.jira.project` and `bkit.tracker.jira.site`. Each is null when unset.
 */
function issueScope(cwd: string, tracker: IssueTracker): IssueScope {
  if (tracker === "github") return { key: null, ownerRepo: originOwnerRepo(cwd), site: null };
  if (tracker !== "linear" && tracker !== "jira") return { key: null };
  const cfg = mainConfig(cwd);
  return tracker === "linear"
    ? { key: cfg.linear.team }
    : { key: cfg.jira.project, site: cfg.jira.site };
}

/** The setting that names the issue-key prefix of a keyed tracker. */
const KEY_SETTING = {
  linear: "bkit.tracker.linear.team",
  jira: "bkit.tracker.jira.project",
} as const;

/** The stderr hint for bare keys skipped because no key prefix is configured. */
function skippedKeyHint(skipped: string[], tracker: "linear" | "jira"): string {
  return `${skipped.join(", ")} not read as an issue: bare keys count only once ${KEY_SETTING[tracker]} is set in package.json; or name the issue as "issue KEY-N"`;
}

/** The current tree and the main checkout: where log folders are looked for. */
function fidRoots(cwd: string): string[] {
  const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
  return [...new Set([top, repoRoot(cwd)])];
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
  help: "github | linear | jira | none (default: package.json bkit.tracker.default, else none)",
};

export const fidsCommand: CommandSpec = {
  noun: "fids",
  summary:
    "Feature-id format per tracker; the issue, FID, plan files and plan inputs Step 1 resolves; FID recovery from a branch or PR-body marker.",
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
        const issue = str(ctx.flags.issue)?.replace(/^#/, "");
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
        "--prompt-file: the issue and the FID a session prompt names. --marker / --branch: recover FID and issue id, the PR-body marker first, then a feat/{FID} branch (any slug; its issue id counts only when .bkit/issues.jsonl has a feature row for it, else the run is issue-less).",
      flags: [
        {
          name: "prompt-file",
          type: "string",
          help: "the session prompt, written verbatim (Step 1: {SESSION_DIR}/prompt.md); not with --marker / --branch",
        },
        {
          name: "marker",
          type: "string",
          help: "text holding the bkit:fid marker (e.g. the PR body)",
        },
        { name: "branch", type: "string", help: "branch name, feat/{FID}" },
        TRACKER_FLAG,
      ],
      output: {
        source:
          "--prompt-file: github | linear | jira — the wired tracker, when the prompt names one of its issues; none otherwise (a bare number, another tracker's form, tracker none). --marker / --branch: marker | branch",
        issue:
          '--prompt-file: the issue named (github: the number, linear / jira: the key): an explicit form (<id> tag, "GitHub issue: #N", "issue #N" / "issue KEY", owner/repo#N or a tracker URL into the origin repo / bkit.tracker.linear.team / bkit.tracker.jira.site + bkit.tracker.jira.project; a URL elsewhere is ignored) over a bare #N / key; a bare Linear / Jira key only with the bkit.tracker.linear.team / bkit.tracker.jira.project prefix set; else ""',
        ambiguous:
          "--prompt-file, exit 8 only: the issues named, as a person types them (then no other key prints)",
        ref: '--prompt-file: the issue as a person types it (github: #N, linear / jira: the key), else ""',
        fidNamed:
          "--prompt-file: the first FID the prompt names (feat/{FID}, a docs/plans/{YYYYMM}/ path, or a bare word with a logs/{word}/ folder), else null",
        fid: "--marker / --branch: the recovered FID",
        issueId:
          "--marker / --branch: tracker issue id; null under none, for a marker with none, and for a branch whose embedded issue id has no feature row (an issue-less run)",
        tracker: "--marker / --branch: tracker the shapes came from",
      },
      exitCodes: {
        [EXIT_NO_FID]:
          "neither the marker nor the branch yielded a FID (a branch that is not feat/ or whose suffix is not a slug)",
        [EXIT_NO_FILE]: "the --prompt-file is missing",
        [EXIT_AMBIGUOUS]: `--prompt-file names more than one issue (explicit forms first) — ${NAME_THE_ISSUE}`,
      },
      run: (ctx) => {
        const marker = str(ctx.flags.marker);
        const branch = str(ctx.flags.branch);
        const promptFile = str(ctx.flags.promptFile);
        if (promptFile !== undefined) {
          if (marker !== undefined || branch !== undefined)
            throw new CommandError(
              EXIT.USAGE,
              "--prompt-file goes alone, without --marker / --branch",
            );
          const text = readNamed(path.resolve(ctx.cwd, promptFile), "prompt-file");
          const tracker = trackerFlag(str(ctx.flags.tracker), ctx.cwd, false) as IssueTracker;
          const scope = issueScope(ctx.cwd, tracker);
          const key = scope.key ?? null;
          const refs = issueRefs(text, tracker, scope);
          const candidates = issueCandidates(refs);
          if (candidates.length > 1) {
            const named = candidates.map((c) => issueRef(c, tracker));
            ctx.log(
              `the prompt names more than one issue (${named.join(", ")}); ${NAME_THE_ISSUE}`,
            );
            ctx.emit({ ambiguous: named });
            return EXIT_AMBIGUOUS;
          }
          const issue = candidates[0] ?? "";
          const others = [...new Set([...refs.explicit, ...refs.bare].map((r) => r.value))].filter(
            (v) => v !== issue,
          );
          if (others.length > 0)
            ctx.log(
              `taking ${issueRef(issue, tracker)}, named explicitly; not the bare mention ${others.map((o) => issueRef(o, tracker)).join(", ")}`,
            );
          const bareNumber = bareNumbers(text)[0];
          if (issue === "" && tracker !== "none" && bareNumber !== undefined)
            ctx.log(bareNumberHint(bareNumber, tracker, key));
          if (
            issue === "" &&
            refs.skipped.length > 0 &&
            (tracker === "linear" || tracker === "jira")
          )
            ctx.log(skippedKeyHint([...new Set(refs.skipped.map((h) => h.value))], tracker));
          ctx.emit({
            source: issue === "" ? "none" : tracker,
            issue,
            ref: issueRef(issue, tracker),
            fidNamed: namedFid(text, fidRoots(ctx.cwd)),
          });
          return EXIT.OK;
        }
        if (marker === undefined && branch === undefined) {
          throw new CommandError(EXIT.USAGE, "give --prompt-file, or --marker, --branch, or both");
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
    resolve: {
      summary:
        "The run's FID, first hit wins: a FID the prompt names, the feat/{FID} branch, a FID logged for the issue on dev, a mint from the title (or prompt), a free -b, -c, ... suffix when a finished run used the mint; then the format check (exit 0 resolved, exit 1 fails the check).",
      flags: [
        {
          name: "prompt-file",
          type: "string",
          required: true,
          help: "the session prompt, written verbatim ({SESSION_DIR}/prompt.md)",
        },
        {
          name: "issue",
          type: "string",
          help: 'the run\'s issue id (github: 123; linear / jira: ABC-123), or "" / absent for a run with no issue',
        },
        {
          name: "title-file",
          type: "string",
          help: "the issue title: a JSON object with a title key, else the file's text; drop it for a run with no issue",
        },
        {
          ...WORKFLOW_FLAG,
          help: "the workflow starting; an in-progress run of it continues a used mint instead of suffixing",
        },
        TRACKER_FLAG,
      ],
      output: {
        fid: "the FID to use",
        source:
          "prompt | branch | logged | minted | suffixed — the link of the chain that gave fid",
        month: "the newest bucket holding logs/{fid}/, else null",
        existing: "true when logs/{fid}/ exists in some bucket",
        fids: "every FID logged for the issue (working tree and dev) when the chain reached that link, else []",
      },
      exitCodes: {
        [EXIT_SEVERAL]: "several features are logged for the issue — name one in the prompt",
        [EXIT_NO_FREE]: "the mint and every -b … -z suffix of it are used by finished runs",
        [EXIT_BARE_NUMBER]: `a wired tracker, no issue, and the prompt holds only a bare number (the mint would be the workflow name) — ${NAME_THE_ISSUE}`,
        [EXIT_NO_FILE]: "the --prompt-file or --title-file is missing",
      },
      run: (ctx) => {
        const tracker = trackerFlag(str(ctx.flags.tracker), ctx.cwd, false) as IssueTracker;
        const issue = (str(ctx.flags.issue) ?? "").replace(/^#/, "");
        const prompt = readNamed(
          path.resolve(ctx.cwd, String(ctx.flags.promptFile)),
          "prompt-file",
        );
        const titleFile = str(ctx.flags.titleFile);
        const title =
          titleFile === undefined
            ? ""
            : titleOf(readNamed(path.resolve(ctx.cwd, titleFile), "title-file"));
        const workflow = String(ctx.flags.workflow);
        const roots = fidRoots(ctx.cwd);
        const branch = git(ctx.cwd, ["branch", "--show-current"]) || null;
        const prefix = KEYED.has(tracker) ? `${issue.toLowerCase()}-` : `${issue}-`;

        let fids: string[] = [];
        let pick: { fid: string; source: string } | null = null;
        const named = namedFid(prompt, roots);
        if (named !== null) pick = { fid: named, source: "prompt" };
        const onBranch = branch?.startsWith("feat/") ? branch.slice("feat/".length) : null;
        if (pick === null && onBranch !== null && SLUG.test(onBranch)) {
          if (issue === "" || onBranch.startsWith(prefix))
            pick = { fid: onBranch, source: "branch" };
        }
        if (pick === null && issue !== "") {
          fids = [
            ...new Set([...roots.flatMap((r) => logged(r, issue)), ...loggedOnDev(ctx.cwd, issue)]),
          ].sort();
          if (fids.length > 1) {
            ctx.log(`several features logged for ${issue}: ${fids.join(", ")}`);
            ctx.emit({ fid: null, source: null, month: null, existing: false, fids });
            return EXIT_SEVERAL;
          }
          if (fids.length === 1) pick = { fid: fids[0]!, source: "logged" };
        }
        const bareNumber = bareNumbers(prompt)[0];
        if (
          pick === null &&
          issue === "" &&
          tracker !== "none" &&
          bareNumber !== undefined &&
          slugWords(title).length === 0 &&
          slugWords(prompt).length === 0
        ) {
          ctx.log(
            `${bareNumberHint(bareNumber, tracker, issueScope(ctx.cwd, tracker).key ?? null)} — refusing to mint a FID from the workflow name alone`,
          );
          return EXIT_BARE_NUMBER;
        }
        if (pick === null) {
          const minted = normaliseFid(mintFid({ issue, title, prompt, branch, workflow }), tracker);
          const free = freeFid(roots, minted, workflow);
          if (free === null) {
            ctx.log(`"${minted}" and every -b … -z suffix of it are used by finished runs`);
            return EXIT_NO_FREE;
          }
          pick = { fid: free, source: free === minted ? "minted" : "suffixed" };
        }
        const fid = normaliseFid(pick.fid, tracker);
        const problem = fidProblem(fid, tracker, issue);
        if (problem !== undefined) {
          ctx.log(`${pick.source} FID: ${problem}`);
          return EXIT.NO;
        }
        const month =
          roots
            .flatMap((r) => monthBuckets(r, fid))
            .sort()
            .at(-1) ?? null;
        ctx.emit({ fid, source: pick.source, month, existing: month !== null, fids });
        return EXIT.OK;
      },
    },
    plans: {
      summary: "A feature's plan in a month bucket: docs/plans/{YYYYMM}/{FID}-plan.md, or none.",
      flags: [
        { name: "fid", type: "string", required: true, help: "feature id" },
        { name: "month", type: "string", required: true, help: "YYYYMM bucket" },
      ],
      output: {
        source: "single ({FID}-plan.md exists) | none (no plan file)",
        plan: "the repo-relative plan file, or null",
      },
      run: (ctx) => {
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        ctx.emit(planFiles(top, String(ctx.flags.fid), String(ctx.flags.month)));
        return EXIT.OK;
      },
    },
    design: {
      summary:
        "The plan's parent design: the **Parent design:** link in the description or prompt, else the feature's own docs/plans/{YYYYMM}/{FID}-design.md; plus the audit reports and the **Workstreams:** ids they name (exit 0 a parent, exit 1 none).",
      flags: [
        { name: "fid", type: "string", required: true, help: "feature id" },
        {
          name: "month",
          type: "string",
          help: "YYYYMM bucket checked first; else the newest bucket holding the doc",
        },
        {
          name: "description-file",
          type: "string",
          help: "the issue description; drop it for a run with no issue",
        },
        {
          name: "prompt-file",
          type: "string",
          help: "the session prompt ({SESSION_DIR}/prompt.md)",
        },
      ],
      output: {
        fid: "the FID when its own design doc exists, else null",
        month: "the bucket holding it, else null",
        path: "repo-relative path, else null",
        parentFid: "the parent design's FID (the link's, else the feature's own), else null",
        parentMonth: "its bucket, else null",
        parentPath: "its repo-relative path, else null",
        parentSource: "link | fid | null",
        auditPaths:
          "every docs/audits/{YYYYMM}/*.md path the description, then the prompt, names, first mention order",
        workstreams:
          "the WS-{N} ids the first **Workstreams:** line (description, then prompt) names: the plan covers only those; [] = the whole design",
      },
      exitCodes: {
        [EXIT_NO_FILE]:
          "a --description-file / --prompt-file is missing, or a linked design or named audit path is not a file",
      },
      run: (ctx) => {
        const fid = String(ctx.flags.fid);
        const root = repoRoot(ctx.cwd);
        const texts = (["descriptionFile", "promptFile"] as const).flatMap((k) => {
          const file = str(ctx.flags[k]);
          return file === undefined
            ? []
            : [
                readNamed(
                  path.resolve(ctx.cwd, file),
                  k === "promptFile" ? "prompt-file" : "description-file",
                ),
              ];
        });
        const own = designDoc(root, fid, str(ctx.flags.month));
        const link = texts.map(parentDesignLink).find((l) => l !== null) ?? null;
        const parent = link
          ? {
              fid: link.fid,
              month: link.month,
              path: `docs/plans/${link.month}/${link.fid}-design.md`,
              source: "link",
            }
          : own
            ? { fid, month: own.month, path: own.path, source: "fid" }
            : null;
        const audits = auditPaths(...texts);
        for (const rel of [...(link && parent ? [parent.path] : []), ...audits]) {
          if (!fs.statSync(path.join(root, rel), { throwIfNoEntry: false })?.isFile())
            throw new CommandError(EXIT_NO_FILE, `${rel} is named but is not a file`);
        }
        ctx.emit({
          ...(own
            ? { fid, month: own.month, path: own.path }
            : { fid: null, month: null, path: null }),
          parentFid: parent?.fid ?? null,
          parentMonth: parent?.month ?? null,
          parentPath: parent?.path ?? null,
          parentSource: parent?.source ?? null,
          auditPaths: audits,
          workstreams: workstreamIds(...texts),
        });
        return parent ? EXIT.OK : EXIT.NO;
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
