// bkit issues text|labels|comment — tracker payloads, and with --post / --write the call itself.
//
// These verbs do the arithmetic the workflows stated as prose — which comments count
// as human input, which labels a transition adds and drops, the board update, and the
// exact text of every `###### bkit:generated` comment — so no step re-derives it by
// hand. A workflow touches only its own issue. The tracker I/O goes through
// `tracker.ts`; when it fails the verb prints `tracker.done: false` and the workflow
// sends the same payload through the tracker's MCP server.

import * as fs from "node:fs";
import * as path from "node:path";

import {
  CommandError,
  EXIT,
  parseJson,
  repoRoot,
  type CommandSpec,
  type RunContext,
} from "../lib.js";
import { readBkitConfig, type BkitConfig } from "../../shared/settings.js";
import { str } from "./status.js";
import { isCloudOrCi } from "../../checks/before/env.js";
import {
  COMMENT_FILE_OUTPUT,
  GENERATED_MARKER,
  POST_FLAG,
  TRACKER_OUTPUT,
  attempt,
  classifyFailure,
  commentFileOf,
  fetchIssue,
  moveOnBoard,
  postForVerb,
  readBlockers,
  readLabels,
  redact,
  runActionKey,
  skipOf,
  stampMarker,
  trackerTarget,
  writeLabels,
  type TrackerOutcome,
} from "./tracker.js";

/** Exit code: an input file is missing or not in the expected shape. */
export const EXIT_BAD_INPUT = 3;

function readInput(cwd: string, file: string, flag: string): string {
  const abs = path.resolve(cwd, file);
  if (!fs.existsSync(abs))
    throw new CommandError(EXIT_BAD_INPUT, `--${flag} ${file} does not exist`);
  return fs.readFileSync(abs, "utf-8");
}

// ---------------------------------------------------------------------------
// text
// ---------------------------------------------------------------------------

export { GENERATED_MARKER };
/** A human writes this as a whole line to discard everything above it. */
export const CUT_MARKER = "###### bkit:ignore-earlier";
// Whole line only: naming the token inline is prose, not a live marker.
const CUT_LINE = /^[ \t]*###### bkit:ignore-earlier[ \t]*\r?$/;
// The same cut as Jira's HTML comment page renders it: its own `<h6>` element.
const CUT_ANY =
  /^[ \t]*###### bkit:ignore-earlier[ \t]*\r?$|<h6\b[^>]*>\s*bkit:ignore-earlier\s*<\/h6>/gm;
// The marker as a whole first line (bare or stamped with its hash), or as Jira's HTML `<h6>`.
const GENERATED_FIRST =
  /^(?:######[ \t]+bkit:generated(?:[ \t]+[0-9a-f]{12})?[ \t]*$|<h6\b[^>]*>\s*bkit:generated(?:\s+[0-9a-f]{12})?\s*<\/h6>)/;

export interface IssueComment {
  body: string;
  createdAt?: string;
}

export const isGenerated = (body: string): boolean =>
  GENERATED_FIRST.test(body.replace(/^\s+/, "").split(/\r?\n/, 1)[0] ?? "");

/** Keep only what follows the LAST cut marker (whole line, or Jira's HTML `<h6>`); the marker itself goes too. */
export function cutEarlier(text: string): { text: string; cut: boolean } {
  const last = [...text.matchAll(CUT_ANY)].at(-1);
  if (last === undefined) return { text, cut: false };
  return { text: text.slice(last.index + last[0].length).replace(/^\s*\n/, ""), cut: true };
}

/**
 * Comments as an MCP read returns them: a bare array, or one wrapped under
 * `comments` / `nodes` (Jira's adds a `data` envelope); each a string or an object
 * with `body` and an optional `created_at` (GitHub) / `createdAt` (Linear) /
 * `created` (Jira).
 */
export function parseComments(raw: unknown): IssueComment[] | null {
  const outer = raw as { data?: unknown } | null;
  const inner =
    outer !== null && typeof outer === "object" && !Array.isArray(outer) && "data" in outer
      ? outer.data
      : raw;
  if (inner !== raw) return parseComments(inner);
  const wrapped = raw as { comments?: unknown; nodes?: unknown } | null;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(wrapped?.comments)
      ? wrapped.comments
      : Array.isArray(wrapped?.nodes)
        ? wrapped.nodes
        : null;
  if (list === null) return null;
  const out: IssueComment[] = [];
  for (const item of list as unknown[]) {
    if (typeof item === "string") {
      out.push({ body: item });
      continue;
    }
    const obj = (item ?? {}) as Record<string, unknown>;
    if (typeof obj.body !== "string") return null;
    const at = obj.created_at ?? obj.createdAt ?? obj.created;
    out.push({ body: obj.body, createdAt: typeof at === "string" ? at : undefined });
  }
  return out;
}

/**
 * Oldest first. The cut means "drop everything above the last marker", so a
 * newest-first stream would keep the superseded text and drop the current one.
 * Sorted only when every comment has a timestamp; otherwise the given order stands.
 */
export function sortOldestFirst(comments: IssueComment[]): {
  comments: IssueComment[];
  sorted: boolean;
} {
  const times = comments.map((c) => (c.createdAt === undefined ? NaN : Date.parse(c.createdAt)));
  if (times.some((t) => Number.isNaN(t))) return { comments, sorted: false };
  const order = comments.map((c, i) => ({ c, t: times[i]!, i }));
  order.sort((a, b) => a.t - b.t || a.i - b.i);
  return { comments: order.map((o) => o.c), sorted: true };
}

export function issueText(description: string, comments: IssueComment[]) {
  const human = comments.filter((c) => !isGenerated(c.body));
  const joined = [description, ...human.map((c) => c.body)]
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .join("\n\n");
  const { text, cut } = cutEarlier(joined);
  return { text, kept: human.length, dropped: comments.length - human.length, cut };
}

export interface IssuePart {
  kind: "description" | "comment";
  text: string;
  createdAt?: string;
}

/**
 * The issue as separate parts, oldest first: the description, then each human comment.
 * The last cut marker drops every part above it and the text above it in its own part;
 * nothing else is dropped.
 */
export function issueParts(description: string, comments: IssueComment[]): IssuePart[] {
  const parts: IssuePart[] = [
    { kind: "description", text: description },
    ...comments
      .filter((c) => !isGenerated(c.body))
      .map((c): IssuePart => ({ kind: "comment", text: c.body, createdAt: c.createdAt })),
  ];
  const last = parts.map((p) => cutEarlier(p.text).cut).lastIndexOf(true);
  const kept =
    last === -1
      ? parts
      : [{ ...parts[last]!, text: cutEarlier(parts[last]!.text).text }, ...parts.slice(last + 1)];
  return kept.map((p) => ({ ...p, text: p.text.trim() })).filter((p) => p.text !== "");
}

function textVerb(ctx: RunContext): number {
  const descFile = str(ctx.flags.descriptionFile);
  const commentsFile = str(ctx.flags.commentsFile);
  if (descFile === undefined && commentsFile === undefined) {
    throw new CommandError(EXIT.USAGE, "give --description-file, --comments-file, or both");
  }
  const description =
    descFile === undefined ? "" : readInput(ctx.cwd, descFile, "description-file");
  let comments: IssueComment[] = [];
  if (commentsFile !== undefined) {
    const parsed = parseJson(readInput(ctx.cwd, commentsFile, "comments-file"));
    const list = parsed.ok ? parseComments(parsed.value) : null;
    if (list === null) {
      throw new CommandError(
        EXIT_BAD_INPUT,
        `--comments-file ${commentsFile} is not a JSON list of comments with a string body`,
      );
    }
    const sorted = sortOldestFirst(list);
    if (!sorted.sorted && list.length > 1) {
      ctx.log("comments carry no timestamps — keeping the given order (must be oldest first)");
    }
    comments = sorted.comments;
  }
  ctx.emit(issueText(description, comments));
  return EXIT.OK;
}

// ---------------------------------------------------------------------------
// labels
// ---------------------------------------------------------------------------

/** Mutually exclusive: setting one drops the others. */
export const PHASE_LABELS = [
  "bkit:design",
  "bkit:plan",
  "bkit:build",
  "bkit:debug",
  "bkit:ship",
  "bkit:merged",
];

/** Prefix of the labels naming an issue's next best workflow; setting a phase drops them. */
export const NEXT_LABEL_PREFIX = "next:";

/** The issue label that opts a feature into CI auto-routing. */
export const AUTO_LABEL = "bkit:auto";
/** Commit-subject suffix the CI auto-route gate matches; carried only while the issue has `AUTO_LABEL`. */
export const AUTO_ROUTE_SUFFIX = " bkit [auto route]";

export interface LabelTransition {
  phase?: string;
  failed?: boolean;
}

export function transitionLabels(current: string[], t: LabelTransition) {
  const have = [...new Set(current)];
  const remove = new Set<string>();
  const add: string[] = [];
  const want = (label: string, on: boolean) => {
    if (on && !have.includes(label)) add.push(label);
    if (!on && have.includes(label)) remove.add(label);
  };
  if (t.phase !== undefined) {
    const label = `bkit:${t.phase}`;
    for (const l of have) if (PHASE_LABELS.includes(l) && l !== label) remove.add(l);
    for (const l of have) if (l.startsWith(NEXT_LABEL_PREFIX)) remove.add(l);
    want(label, true);
  }
  // A phase starting supersedes any earlier Failure Path.
  const failed = t.failed ?? (t.phase !== undefined ? false : undefined);
  if (failed !== undefined) want("bkit:failed", failed);
  return {
    add,
    remove: [...remove],
    labels: [...have.filter((l) => !remove.has(l)), ...add],
  };
}

/**
 * The issue state the workflows set for the same transition, on a tracker whose
 * board status is the issue state: `bkit.tracker.linear` or `bkit.tracker.jira`. A shipped
 * or failed issue waits on a human (`review`); a phase starting is `progress`.
 * The workflows write it alone, so a name the team or project lacks leaves the
 * labels landed. Null under github (the Projects v2 board moves instead) and
 * none, or when the transition sets no state.
 */
export function trackerState(
  t: LabelTransition,
  board: string | undefined,
  cfg: Pick<BkitConfig, "issueTracker" | "linear" | "jira">,
): string | null {
  const states =
    cfg.issueTracker === "linear" ? cfg.linear : cfg.issueTracker === "jira" ? cfg.jira : null;
  if (states === null) return null;
  if (t.phase === "merged" || t.failed === true) return states.review;
  if (t.phase !== undefined) return states.progress;
  if (board === "review") return states.review;
  if (board === "progress") return states.progress;
  return null;
}

const ON_OFF: Record<string, boolean> = { on: true, off: false };

function onOff(v: unknown, flag: string): boolean | undefined {
  if (v === undefined) return undefined;
  const b = ON_OFF[String(v)];
  if (b === undefined) throw new CommandError(EXIT.USAGE, `--${flag} must be on or off`);
  return b;
}

const BOARD_STATES = new Set(["progress", "review"]);

/**
 * The two `projects_write` payloads that move an issue on the Projects v2 board,
 * from `bkit.tracker.github`. Payload keys are the MCP tool's own argument names: the
 * board item is found by its issue, and Status is set by option name.
 */
function boardPayload(
  ctx: RunContext,
  status: "progress" | "review",
  target?: { issue: string; ownerRepo: string },
): { board: Record<string, unknown> | null; boardSkipped: string | null } {
  const { issueTracker: tracker, github } = readBkitConfig(repoRoot(ctx.cwd));
  if (tracker !== "github") {
    if (tracker === "linear" || tracker === "jira")
      ctx.log("Board status carried by issue state — no separate update.");
    return { board: null, boardSkipped: `tracker-${tracker}` };
  }
  if (github.project === false) return { board: null, boardSkipped: "opted-out" };
  if (github.project === null) {
    if (github.projectUrl === null) {
      ctx.log("GitHub project not configured in package.json");
      return { board: null, boardSkipped: "not-configured" };
    }
    ctx.log(
      `bkit.tracker.github.project "${github.projectUrl}" is not a GitHub Projects board URL`,
    );
    return { board: null, boardSkipped: "project-url-invalid" };
  }
  const issue = (target?.issue ?? String(ctx.flags.issue ?? "")).replace(/^#/, "");
  const ownerRepo = target?.ownerRepo ?? String(ctx.flags.ownerRepo ?? "");
  const [itemOwner, itemRepo, extra] = ownerRepo.split("/");
  if (!/^[0-9]+$/.test(issue) || !itemOwner || !itemRepo || extra !== undefined) {
    throw new CommandError(
      EXIT.USAGE,
      "--board needs --issue=<number> and --owner-repo=<owner>/<repo>",
    );
  }
  const { owner, ownerType, number } = github.project;
  const project = { owner, owner_type: ownerType, project_number: number };
  const item = { item_owner: itemOwner, item_repo: itemRepo, issue_number: Number(issue) };
  return {
    board: {
      addItem: { method: "add_project_item", ...project, item_type: "issue", ...item },
      updateItem: {
        method: "update_project_item",
        ...project,
        ...item,
        updated_field: { name: "Status", value: github[status] },
      },
    },
    boardSkipped: null,
  };
}

/** The flags of a label transition, checked. */
function labelTransition(ctx: RunContext): { t: LabelTransition; board: BoardState | undefined } {
  const phase = str(ctx.flags.phase);
  if (phase !== undefined && !PHASE_LABELS.includes(`bkit:${phase}`)) {
    throw new CommandError(
      EXIT.USAGE,
      "--phase must be design, plan, build, debug, ship, or merged",
    );
  }
  const failed = onOff(ctx.flags.failed, "failed");
  if (phase !== undefined && failed === true)
    throw new CommandError(EXIT.USAGE, "--phase clears bkit:failed; drop --failed=on");
  const board = str(ctx.flags.board);
  if (board !== undefined && !BOARD_STATES.has(board)) {
    throw new CommandError(EXIT.USAGE, "--board must be progress or review");
  }
  return { t: { phase, failed }, board: board as BoardState | undefined };
}

type BoardState = "progress" | "review";

/** The printed transition for `current` labels. */
function transitionOut(ctx: RunContext, current: string[], t: LabelTransition, board?: string) {
  const { add, remove, labels } = transitionLabels(current, t);
  return {
    add,
    remove,
    labels,
    changed: add.length + remove.length > 0,
    autoRouteSuffix: labels.includes(AUTO_LABEL) ? AUTO_ROUTE_SUFFIX : "",
    trackerState: trackerState(t, board, readBkitConfig(repoRoot(ctx.cwd))),
  };
}

function labelsVerb(ctx: RunContext): number | Promise<number> {
  if (ctx.flags.write === true) return labelsWrite(ctx);
  const { t, board } = labelTransition(ctx);
  const out = transitionOut(ctx, (ctx.flags.label as string[] | undefined) ?? [], t, board);
  const { board: payload, boardSkipped } =
    board === undefined ? { board: null, boardSkipped: null } : boardPayload(ctx, board);
  ctx.emit({ ...out, board: payload, boardSkipped });
  return EXIT.OK;
}

/**
 * `--write`: read the issue's labels, write the transition (and the Linear / Jira
 * state), then move the board item. Each write that fails prints `done: false`
 * with its reason; the workflow sends the printed payload through the MCP instead.
 */
async function labelsWrite(ctx: RunContext): Promise<number> {
  const { t, board } = labelTransition(ctx);
  const target = trackerTarget(ctx.cwd, { fid: str(ctx.flags.fid), issue: str(ctx.flags.issue) });
  const skip = skipOf(target);
  const given = (ctx.flags.label as string[] | undefined) ?? [];
  if (skip) {
    ctx.emit({
      ...transitionOut(ctx, given, t, board),
      board: null,
      boardSkipped: null,
      tracker: skip,
    });
    return EXIT.OK;
  }
  // A malformed board target is a usage error: refused before any label is written.
  let { board: payload, boardSkipped } =
    board === undefined
      ? { board: null, boardSkipped: null as string | null }
      : boardPayload(ctx, board, {
          issue: target.issue ?? "",
          ownerRepo: target.ownerRepo || String(ctx.flags.ownerRepo ?? ""),
        });
  let current = given;
  const read = await attempt("labels", ctx.log, async () => {
    current = await readLabels(target);
  });
  const out = transitionOut(ctx, current, t, board);
  const tracker =
    "done" in read && !read.done
      ? read
      : await attempt("labels", ctx.log, () =>
          writeLabels(target, {
            add: out.add,
            remove: out.remove,
            labels: out.labels,
            state: out.trackerState,
          }),
        );
  let boardWrite: TrackerOutcome | null = null;
  const project = readBkitConfig(repoRoot(ctx.cwd)).github;
  if (payload !== null && board !== undefined && project.project) {
    if (isCloudOrCi()) {
      // A cloud run's token can comment and label but never reach a Projects v2 board.
      payload = null;
      boardSkipped = "cloud";
    } else {
      const { owner, number } = project.project;
      boardWrite = await attempt("board", ctx.log, () =>
        moveOnBoard(target, { owner, number, status: project[board] }),
      );
    }
  }
  ctx.emit({ ...out, board: payload, boardSkipped, tracker, boardWrite });
  return EXIT.OK;
}

// ---------------------------------------------------------------------------
// comment
// ---------------------------------------------------------------------------

const WORKFLOW_HEADINGS: Record<string, string> = {
  design: "Design Workflow",
  plan: "Plan Workflow",
  build: "Build Workflow",
  debug: "Debug Workflow",
  ship: "Ship Workflow",
  auto: "bkit Auto",
};

/** Named header fields and their label; any other goes through `--field=Name=value`. */
const FIELD_LABELS: Record<string, string> = {
  verdict: "Verdict",
  failures: "Failures",
  scope: "Scope",
  group: "Group",
  attempt: "Attempt",
  strategy: "Strategy",
};

/**
 * ` - Name: value` fields in the order the flags were given — the templates order
 * them differently step to step (Strategy before or after Attempt), and each
 * template's order is kept. Relies on parseFlags filling its result in argv order.
 */
function headerFields(ctx: RunContext): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const key of Object.keys(ctx.flags)) {
    if (key === "field") {
      for (const f of ctx.flags.field as string[]) {
        const eq = f.indexOf("=");
        if (eq <= 0) throw new CommandError(EXIT.USAGE, `--field "${f}" must be Name=value`);
        out.push([f.slice(0, eq), f.slice(eq + 1)]);
      }
    } else if (key === "group") {
      const count = str(ctx.flags.groupCount);
      out.push(["Group", `${String(ctx.flags.group)}${count === undefined ? "" : `/${count}`}`]);
    } else if (FIELD_LABELS[key] !== undefined) {
      out.push([FIELD_LABELS[key], String(ctx.flags[key])]);
    }
  }
  return out;
}

const tail = (text: string, n: number) => text.replace(/\n+$/, "").split("\n").slice(-n).join("\n");

/** A fence longer than any backtick run inside, so captured output cannot close it. */
function fenced(text: string): string {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((m) => m.length));
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}text\n${text}\n${fence}`;
}

/** Everything one `###### bkit:generated` comment is built from. */
export interface CommentInput {
  kind?: "step" | "failure" | "handover" | "audit";
  /** Audit: the template slug in `### Audit Summary: <slug>`. */
  auditSlug?: string;
  /** With `workflowHeading`: Step 1 puts `## <Workflow>` above the step. */
  workflow?: string;
  workflowHeading?: boolean;
  stepNumber?: string;
  stepTitle?: string;
  /** ` - Name: value` header fields, in order. */
  fields?: Array<[string, string]>;
  subStep?: string;
  /** Failure: the error text, or a file holding it. */
  error?: string;
  errorFile?: string;
  stderrFile?: string;
  ownerRepo?: string;
  tree?: string;
  prNumber?: string;
  prUrl?: string;
  runId?: string;
  /** Repo paths linked at `ref` (default `tree`); `path#Heading` links that section. */
  artifacts?: string[];
  ref?: string;
  lines?: string[];
  bodyFile?: string;
  /** `Title=path`: a `#### Title` heading and the file's content. */
  sections?: string[];
}

function links(o: CommentInput): string[] {
  const artifacts = o.artifacts ?? [];
  const wantsLinks = o.tree ?? o.prNumber ?? o.runId ?? artifacts[0];
  if (wantsLinks === undefined) return [];
  const ownerRepo = o.ownerRepo;
  if (ownerRepo === undefined || !/^[^/\s]+\/[^/\s]+$/.test(ownerRepo)) {
    throw new CommandError(EXIT.USAGE, "links need --owner-repo=<owner>/<repo>");
  }
  const gh = `https://github.com/${ownerRepo}`;
  const out: string[] = [];
  if (o.tree !== undefined) out.push(`[${ownerRepo}/tree/${o.tree}](${gh}/tree/${o.tree})`);
  if (o.prNumber !== undefined) {
    out.push(`[${ownerRepo}/pull/${o.prNumber}](${o.prUrl ?? `${gh}/pull/${o.prNumber}`})`);
  }
  if (o.runId !== undefined)
    out.push(`[${ownerRepo}/actions/run/${o.runId}](${gh}/actions/runs/${o.runId})`);
  if (artifacts.length) {
    const ref = o.ref ?? o.tree;
    if (ref === undefined) throw new CommandError(EXIT.USAGE, "--artifact needs --ref (or --tree)");
    for (const a of artifacts) {
      const hash = a.indexOf("#");
      const file = (hash < 0 ? a : a.slice(0, hash)).replace(/^\/+/, "");
      const heading = hash < 0 ? undefined : a.slice(hash + 1).trim();
      if (heading === "")
        throw new CommandError(EXIT.USAGE, `--artifact "${a}" has an empty #Heading`);
      const url = `${gh}/blob/${ref}/${file}`;
      out.push(
        heading === undefined
          ? `[${path.basename(file)}](${url})`
          : `[${path.basename(file)} § ${heading}](${url}#${headingAnchor(heading)})`,
      );
    }
  }
  return out;
}

/**
 * GitHub's anchor for a markdown heading: lowercased, punctuation dropped,
 * spaces to hyphens. A repeated heading's later copies take `-1`, `-2`; this
 * names the first.
 */
export function headingAnchor(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");
}

const KINDS = ["step", "failure", "handover", "audit"];

/** The exact comment body; files (`bodyFile`, `sections`, `stderrFile`, `errorFile`) resolve against `cwd`. */
export function buildComment(cwd: string, o: CommentInput): string {
  const kind = o.kind ?? "step";
  if (!KINDS.includes(kind))
    throw new CommandError(EXIT.USAGE, `--kind must be ${KINDS.join(", ")}`);
  const lines = [GENERATED_MARKER];

  if (o.workflowHeading === true) {
    const heading = WORKFLOW_HEADINGS[o.workflow ?? ""];
    if (heading === undefined) {
      throw new CommandError(
        EXIT.USAGE,
        `--workflow-heading needs --workflow=${Object.keys(WORKFLOW_HEADINGS).join("|")}`,
      );
    }
    lines.push(`## ${heading}`);
  }

  const number = o.stepNumber;
  const title = o.stepTitle;
  if (number !== undefined && !/^[0-9]+[a-z]?$/.test(number)) {
    throw new CommandError(EXIT.USAGE, `--step-number "${number}" is not a step number`);
  }

  if (kind === "step") {
    if (number === undefined || title === undefined) {
      throw new CommandError(EXIT.USAGE, "--kind=step needs --step-number and --step-title");
    }
    lines.push(
      [`### Step ${number} — ${title}`, ...(o.fields ?? []).map(([k, v]) => `${k}: ${v}`)].join(
        " - ",
      ),
    );
  } else if (kind === "failure") {
    const error =
      o.errorFile !== undefined
        ? readInput(cwd, o.errorFile, "error-file").replace(/\n+$/, "")
        : o.error;
    if (number === undefined || title === undefined || error === undefined) {
      throw new CommandError(
        EXIT.USAGE,
        "--kind=failure needs --step-number, --step-title and --error (or --error-file)",
      );
    }
    lines.push("### Workflow Failure");
    lines.push(
      `Step: ${number} — ${title}${o.subStep === undefined ? "" : `; Sub-step: ${o.subStep}`}`,
    );
    lines.push(`Error: ${error}`);
    if (o.stderrFile !== undefined) {
      const captured = tail(readInput(cwd, o.stderrFile, "stderr-file"), 20);
      if (captured.trim() !== "") lines.push("Stderr:", fenced(captured));
    }
  } else if (kind === "audit") {
    const slug = o.auditSlug;
    if (slug === undefined || !/^[a-z0-9-]+$/.test(slug)) {
      throw new CommandError(EXIT.USAGE, "--kind=audit needs --audit-slug=<template slug>");
    }
    lines.push(
      [`### Audit Summary: ${slug}`, ...(o.fields ?? []).map(([k, v]) => `${k}: ${v}`)].join(" - "),
    );
  } else {
    lines.push("### Workflow Handover");
  }

  lines.push(...links(o));
  lines.push(...(o.lines ?? []));
  if (o.bodyFile !== undefined)
    lines.push(readInput(cwd, o.bodyFile, "body-file").replace(/\n+$/, ""));
  for (const s of o.sections ?? []) {
    const eq = s.indexOf("=");
    if (eq <= 0) throw new CommandError(EXIT.USAGE, `--section "${s}" must be Title=path`);
    lines.push(`#### ${s.slice(0, eq)}`);
    lines.push(readInput(cwd, s.slice(eq + 1), "section").replace(/\n+$/, ""));
  }

  // A whole-line cut marker copied in from an artifact would fire on the next
  // run's issue text; inline, it is only a mention. The marker carries the body's
  // hash, which is how a re-run finds the comment already posted.
  return stampMarker(
    lines
      .join("\n")
      .split("\n")
      .map((l) => (CUT_LINE.test(l) ? `\`${CUT_MARKER}\`` : l))
      .join("\n"),
  );
}

/** `bkit issues comment`'s flags as a `CommentInput`. */
export function commentBody(ctx: RunContext): string {
  const kind = str(ctx.flags.kind) ?? "step";
  if (ctx.flags.groupCount !== undefined && ctx.flags.group === undefined) {
    throw new CommandError(EXIT.USAGE, "--group-count needs --group");
  }
  return buildComment(ctx.cwd, {
    kind: kind as CommentInput["kind"],
    auditSlug: str(ctx.flags.auditSlug),
    workflow: str(ctx.flags.workflow),
    workflowHeading: ctx.flags.workflowHeading === true,
    stepNumber: str(ctx.flags.stepNumber),
    stepTitle: str(ctx.flags.stepTitle),
    fields: kind === "step" || kind === "audit" ? headerFields(ctx) : [],
    subStep: str(ctx.flags.subStep),
    error: str(ctx.flags.error),
    errorFile: str(ctx.flags.errorFile),
    stderrFile: str(ctx.flags.stderrFile),
    ownerRepo: str(ctx.flags.ownerRepo),
    tree: str(ctx.flags.tree),
    prNumber: str(ctx.flags.prNumber),
    prUrl: str(ctx.flags.prUrl),
    runId: str(ctx.flags.runId),
    artifacts: (ctx.flags.artifact as string[] | undefined) ?? [],
    ref: str(ctx.flags.ref),
    lines: (ctx.flags.line as string[] | undefined) ?? [],
    bodyFile: str(ctx.flags.bodyFile),
    sections: (ctx.flags.section as string[] | undefined) ?? [],
  });
}

// ---------------------------------------------------------------------------
// fetch / related — issue text straight to files, never through the orchestrator
// ---------------------------------------------------------------------------

/** Exit code 80 with the failure's reason, for the verbs that only talk to the tracker. */
function useMcp(ctx: RunContext, err: unknown): number {
  const reason = classifyFailure(err);
  ctx.log(redact(`tracker read failed (${reason}): ${(err as Error).message ?? String(err)}`));
  ctx.emit({ reason });
  return EXIT.USE_MCP;
}

async function fetchVerb(ctx: RunContext): Promise<number> {
  const out = str(ctx.flags.sessionDir) || str(ctx.flags.outbox);
  if (!out) throw new CommandError(EXIT.USAGE, "give --session-dir or --outbox");
  const t = trackerTarget(ctx.cwd, { fid: str(ctx.flags.fid), issue: str(ctx.flags.issue) });
  const skip = skipOf(t);
  if (skip) {
    ctx.emit(skip);
    return EXIT.OK;
  }
  let issue;
  try {
    issue = await fetchIssue(t);
  } catch (err) {
    return useMcp(ctx, err);
  }
  const dir = path.resolve(ctx.cwd, out);
  const files = {
    description: path.join(dir, "issue-description.md"),
    comments: path.join(dir, "issue-comments.json"),
    facts: path.join(dir, "issue-facts.json"),
  };
  const facts = { title: issue.title, url: issue.url, state: issue.state, labels: issue.labels };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(files.description, issue.body);
  const comments = sortOldestFirst(issue.comments).comments;
  fs.writeFileSync(files.comments, `${JSON.stringify(comments, null, 2)}\n`);
  fs.writeFileSync(files.facts, `${JSON.stringify(facts, null, 2)}\n`);
  ctx.emit({ ...facts, files });
  return EXIT.OK;
}

/** Hit ids from a search the orchestrator ran: ids, or objects carrying `number` / `identifier` / `key` / `id`. */
function readHits(cwd: string, file: string): string[] {
  const parsed = parseJson(readInput(cwd, file, "hits-file"));
  const bad = () =>
    new CommandError(EXIT_BAD_INPUT, `--hits-file ${file} is not a JSON list of issue ids`);
  if (!parsed.ok || !Array.isArray(parsed.value)) throw bad();
  return parsed.value.map((h: unknown) => {
    const o = (h ?? {}) as Record<string, unknown>;
    const id = typeof h === "object" ? (o.number ?? o.identifier ?? o.key ?? o.id) : h;
    if (typeof id !== "string" && typeof id !== "number") throw bad();
    return String(id).trim().replace(/^#/, "").toUpperCase();
  });
}

async function relatedVerb(ctx: RunContext): Promise<number> {
  const hitsFile = String(ctx.flags.hitsFile);
  const outFile = String(ctx.flags.out);
  const top = ctx.flags.top === undefined ? 10 : Number(ctx.flags.top);
  if (!Number.isInteger(top) || top < 1)
    throw new CommandError(EXIT.USAGE, "--top must be a positive integer");
  const own = trackerTarget(ctx.cwd, { fid: str(ctx.flags.fid), issue: str(ctx.flags.issue) });
  const hits = [...new Set(readHits(ctx.cwd, hitsFile))]
    .filter((id) => id !== own.issue)
    .slice(0, top);
  const sections: string[] = [];
  for (const id of hits) {
    let issue;
    try {
      issue = await fetchIssue({ ...own, issue: id });
    } catch (err) {
      return useMcp(ctx, err);
    }
    const ref = own.tracker === "github" ? `#${id}` : id;
    const { text } = issueText(issue.body, sortOldestFirst(issue.comments).comments);
    sections.push(`## ${ref} — ${issue.title} (${issue.state})${text ? `\n\n${text}` : ""}\n`);
  }
  const body = sections.length === 0 ? "None.\n" : sections.join("\n");
  const abs = path.resolve(ctx.cwd, outFile);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
  ctx.emit({ path: outFile, bytes: Buffer.byteLength(body), hits: hits.length });
  return EXIT.OK;
}

async function blockedByVerb(ctx: RunContext): Promise<number> {
  const t = trackerTarget(ctx.cwd, { fid: str(ctx.flags.fid), issue: str(ctx.flags.issue) });
  const skip = skipOf(t);
  if (skip) {
    ctx.emit(skip);
    return EXIT.OK;
  }
  let blockers;
  try {
    blockers = await readBlockers(t);
  } catch (err) {
    return useMcp(ctx, err);
  }
  ctx.emit({
    blockers: blockers.map(({ id, state }) => ({ id, state })),
    open: blockers.filter((b) => b.open).length,
  });
  return EXIT.OK;
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export const issuesCommand: CommandSpec = {
  noun: "issues",
  summary:
    "Tracker payloads (issue text, label transitions, comments); --post / --write send them.",
  verbs: {
    text: {
      summary: "ISSUE_TEXT: description + human comments, after the bkit:ignore-earlier cut.",
      flags: [
        { name: "description-file", type: "string", help: "file holding the issue description" },
        {
          name: "comments-file",
          type: "string",
          help: "JSON comments as the MCP read returned them (array, or {comments: [...]})",
        },
      ],
      output: {
        text: "the joined, filtered, cut issue text",
        kept: "comments kept",
        dropped: "bkit:generated comments dropped",
        cut: "whether a whole-line bkit:ignore-earlier marker cut the text",
      },
      exitCodes: { [EXIT_BAD_INPUT]: "an input file is missing or not a list of comments" },
      run: textVerb,
    },
    fetch: {
      summary:
        "Read the run's issue into issue-description.md, issue-comments.json and issue-facts.json; prints the facts, never the body.",
      flags: [
        { name: "fid", type: "string", help: "the run's FID (names the issue)" },
        { name: "issue", type: "string", help: "the issue id (instead of --fid)" },
        { name: "session-dir", type: "string", help: "write the three files here" },
        {
          name: "outbox",
          type: "string",
          help: "write the three files here (instead of --session-dir)",
        },
      ],
      output: {
        title: "issue title",
        url: "issue URL",
        state: "tracker state name (GitHub: open | closed)",
        labels: "label names",
        files:
          "{description, comments, facts}: raw description, comments oldest first as JSON, {title, url, state, labels} as JSON",
        skipped: "no-issue | tracker-none: nothing read, nothing written",
        reason:
          "exit 80: network | auth | scope | rate-limit | not-found | http-<n>; read the issue via the tracker MCP",
      },
      exitCodes: {},
      run: fetchVerb,
    },
    related: {
      summary:
        "Fetch each hit of the orchestrator's related-issue search and write the related-issues file.",
      flags: [
        {
          name: "hits-file",
          type: "string",
          required: true,
          help: "JSON list of hit ids (or objects with number / identifier / key) in rank order",
        },
        { name: "out", type: "string", required: true, help: "the related-issues file to write" },
        { name: "top", type: "string", help: "keep the first N hits (default 10)" },
        {
          name: "fid",
          type: "string",
          help: "the run's FID: its own issue is dropped from the hits",
        },
        { name: "issue", type: "string", help: "the run's issue id (instead of --fid)" },
      ],
      output: {
        path: "the file written: one `## {ref} — {title} ({state})` section per hit, else `None.`",
        bytes: "its size in bytes",
        hits: "hits fetched",
        reason: "exit 80: why a hit could not be read; nothing was written",
      },
      exitCodes: { [EXIT_BAD_INPUT]: "--hits-file is missing or not a JSON list of issue ids" },
      run: relatedVerb,
    },
    "blocked-by": {
      summary: "The issues blocking the run's issue, with their states and the ones still open.",
      flags: [
        { name: "fid", type: "string", help: "the run's FID (names the issue)" },
        { name: "issue", type: "string", help: "the issue id (instead of --fid)" },
      ],
      output: {
        blockers:
          "[{id, state}]: GitHub from the body's bkit:blocked-by block, Linear from blocks relations, Jira from is-blocked-by links",
        open: "how many blockers are not closed / done / canceled (0 = unblocked)",
        skipped: "no-issue | tracker-none: nothing read",
        reason:
          "exit 80: network | auth | scope | rate-limit | not-found | http-<n>; read the blockers via the tracker MCP",
      },
      exitCodes: {},
      run: blockedByVerb,
    },
    labels: {
      summary: "Label arithmetic for a transition, the tracker state, and the board payload.",
      flags: [
        { name: "label", type: "string", repeatable: true, help: "a label the issue carries now" },
        {
          name: "phase",
          type: "string",
          help: "set this phase: design | plan | build | debug | ship | merged (drops next:* and bkit:failed)",
        },
        { name: "failed", type: "string", help: "bkit:failed on | off (a phase implies off)" },
        {
          name: "board",
          type: "string",
          help: "also move the Projects v2 item: progress | review",
        },
        {
          name: "issue",
          type: "string",
          help: "issue number (with --board); with --write, the issue to write (instead of --fid)",
        },
        { name: "owner-repo", type: "string", help: "<owner>/<repo> of the issue (with --board)" },
        {
          name: "write",
          type: "boolean",
          help: "read the issue's labels, write the transition and state, move the board; prints `tracker` and `boardWrite`",
        },
        { name: "fid", type: "string", help: "with --write: the run's FID (names the issue)" },
      ],
      output: {
        add: "labels to add",
        remove: "labels to remove",
        labels: "the full label set to write",
        changed: "whether add or remove is non-empty",
        autoRouteSuffix: `"${AUTO_ROUTE_SUFFIX}" when the label set carries ${AUTO_LABEL}, else ""`,
        trackerState:
          "Linear or Jira issue state for this transition, from package.json; null under github, none, or no state move",
        board: "projects_write payloads {addItem, updateItem}, or null",
        boardSkipped:
          "why board is null with --board: opted-out | not-configured | project-url-invalid | tracker-<name> | cloud (--write on a cloud or CI runtime: the next local run moves it)",
        tracker:
          "with --write: the label (and state) write: {done: true, action: labels} | {done: false, action, reason} (write `labels` / `trackerState` via the tracker MCP) | {skipped}",
        boardWrite:
          "with --write and a board payload: {done: true, action: board} | {done: false, action, reason} (send `board` via the MCP); null when nothing to move",
      },
      run: labelsVerb,
    },
    comment: {
      summary:
        "The exact body of a ###### bkit:generated step, failure, handover, or audit comment.",
      flags: [
        { name: "kind", type: "string", help: "step (default) | failure | handover | audit" },
        { name: "audit-slug", type: "string", help: "audit: template slug, e.g. security" },
        { name: "step-number", type: "string", help: "step number in the heading" },
        { name: "step-title", type: "string", help: "step title in the heading, e.g. Plan Verify" },
        { name: "workflow", type: "string", help: "design | plan | build | debug | ship | auto" },
        {
          name: "workflow-heading",
          type: "boolean",
          help: "Step 1: put `## <Workflow>` above the step",
        },
        { name: "verdict", type: "string", help: "header field Verdict" },
        { name: "failures", type: "string", help: "header field Failures" },
        { name: "scope", type: "string", help: "header field Scope" },
        { name: "group", type: "string", help: "header field Group (x of x/y)" },
        { name: "group-count", type: "string", help: "y of Group x/y" },
        { name: "attempt", type: "string", help: "header field Attempt" },
        { name: "strategy", type: "string", help: "header field Strategy" },
        {
          name: "field",
          type: "string",
          repeatable: true,
          help: "any other header field as Name=value; fields render in flag order",
        },
        { name: "owner-repo", type: "string", help: "<owner>/<repo>, for links" },
        { name: "tree", type: "string", help: "link the tree of this ref" },
        { name: "pr-number", type: "string", help: "link this PR" },
        { name: "pr-url", type: "string", help: "PR URL (default: built from --owner-repo)" },
        { name: "run-id", type: "string", help: "link this Actions run" },
        {
          name: "artifact",
          type: "string",
          repeatable: true,
          help: "link this repo path at --ref; path#Heading links that section",
        },
        { name: "ref", type: "string", help: "ref the --artifact links point at (default --tree)" },
        { name: "line", type: "string", repeatable: true, help: "a raw line after the links" },
        { name: "body-file", type: "string", help: "file appended verbatim (summary, handover)" },
        {
          name: "section",
          type: "string",
          repeatable: true,
          help: "Title=path: a `#### Title` heading and the file's content",
        },
        { name: "sub-step", type: "string", help: "failure: the sub-step that failed" },
        { name: "error", type: "string", help: "failure: the error message or tool response" },
        {
          name: "error-file",
          type: "string",
          help: "failure: file holding the error message (instead of --error)",
        },
        {
          name: "stderr-file",
          type: "string",
          help: "failure: captured stderr (last 20 lines kept)",
        },
        POST_FLAG,
        { name: "fid", type: "string", help: "with --post: the run's FID (names the issue)" },
        { name: "issue", type: "string", help: "with --post: the issue id (instead of --fid)" },
        {
          name: "file",
          type: "string",
          help: "with --post: the run's status.jsonl; the post is recorded there and a re-run of the same comment is deduped by that row",
        },
      ],
      output: {
        comment: "the comment body",
        commentFile: COMMENT_FILE_OUTPUT,
        tracker: TRACKER_OUTPUT,
      },
      exitCodes: {
        [EXIT_BAD_INPUT]:
          "a --body-file / --section / --stderr-file / --error-file file is missing",
      },
      run: async (ctx) => {
        const comment = commentBody(ctx);
        const commentFile = commentFileOf(ctx.cwd, comment);
        if (ctx.flags.post !== true) {
          ctx.emit({ comment, commentFile });
          return EXIT.OK;
        }
        const file = str(ctx.flags.file)
          ? path.resolve(ctx.cwd, String(ctx.flags.file))
          : undefined;
        const key = runActionKey(
          file,
          str(ctx.flags.workflow),
          str(ctx.flags.kind) ?? "step",
          str(ctx.flags.stepNumber),
          str(ctx.flags.subStep),
          str(ctx.flags.attempt),
        );
        const tracker = await postForVerb(ctx, comment, {
          fid: str(ctx.flags.fid),
          issue: str(ctx.flags.issue),
          ...(key === undefined ? {} : { file, key }),
        });
        ctx.emit({ comment, commentFile, tracker });
        return EXIT.OK;
      },
    },
  },
};
