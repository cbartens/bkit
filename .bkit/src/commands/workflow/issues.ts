// bkit issues text|labels|comment — tracker payloads, prepared but never sent.
//
// The tracker calls stay in the workflows, through MCP: a workflow touches only
// its own issue, and only through the tracker's MCP server. These verbs do the
// arithmetic the workflows stated as prose — which comments count as human input,
// which labels a transition adds and drops, the board update, and the exact text
// of every `###### bkit:generated` comment — so no step re-derives it by hand.

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
import { readBkitConfig } from "../shared/config.js";
import { str } from "./status.js";

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

/** First line of every comment bkit posts; such comments are never workflow input. */
export const GENERATED_MARKER = "###### bkit:generated";
/** A human writes this as a whole line to discard everything above it. */
export const CUT_MARKER = "###### bkit:ignore-earlier";
// Whole line only: naming the token inline is prose, not a live marker.
const CUT_LINE = /^[ \t]*###### bkit:ignore-earlier[ \t]*\r?$/;

export interface IssueComment {
  body: string;
  createdAt?: string;
}

export const isGenerated = (body: string): boolean =>
  (body.replace(/^\s+/, "").split(/\r?\n/, 1)[0] ?? "").trim() === GENERATED_MARKER;

/** Keep only what follows the LAST whole-line cut marker; the marker itself goes too. */
export function cutEarlier(text: string): { text: string; cut: boolean } {
  const lines = text.split("\n");
  let last = -1;
  lines.forEach((line, i) => {
    if (CUT_LINE.test(line)) last = i;
  });
  if (last === -1) return { text, cut: false };
  return {
    text: lines
      .slice(last + 1)
      .join("\n")
      .replace(/^\s*\n/, ""),
    cut: true,
  };
}

/**
 * Comments as an MCP read returns them: a bare array, or one wrapped under
 * `comments` / `nodes`; each a string or an object with `body` and an optional
 * `created_at` (GitHub) / `createdAt` (Linear).
 */
export function parseComments(raw: unknown): IssueComment[] | null {
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
    const at = obj.created_at ?? obj.createdAt;
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
export const PHASE_LABELS = ["bkit:design", "bkit:plan", "bkit:build", "bkit:ship", "bkit:merged"];

/** The issue label that opts a feature into CI auto-routing. */
export const AUTO_LABEL = "bkit:auto";
/** Commit-subject suffix the CI auto-route gate matches; carried only while the issue has `AUTO_LABEL`. */
export const AUTO_ROUTE_SUFFIX = " bkit [auto route]";

export interface LabelTransition {
  phase?: string;
  failed?: boolean;
  debug?: boolean;
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
    want(label, true);
  }
  if (t.failed !== undefined) want("bkit:failed", t.failed);
  if (t.debug !== undefined) want("bkit:debug", t.debug);
  return {
    add,
    remove: [...remove],
    labels: [...have.filter((l) => !remove.has(l)), ...add],
  };
}

/**
 * Linear's issue state for the same transition, as the workflows set it: a
 * shipped, failed or debugged issue waits on a human ("In Review"); a phase
 * starting is "In Progress". Null when the transition sets no state.
 */
export function linearState(t: LabelTransition, board: string | undefined): string | null {
  if (t.phase === "merged" || t.failed === true || t.debug === true) return "In Review";
  if (t.phase !== undefined) return "In Progress";
  if (board === "review") return "In Review";
  if (board === "progress") return "In Progress";
  return null;
}

const ON_OFF: Record<string, boolean> = { on: true, off: false };

function onOff(v: unknown, flag: string): boolean | undefined {
  if (v === undefined) return undefined;
  const b = ON_OFF[String(v)];
  if (b === undefined) throw new CommandError(EXIT.USAGE, `--${flag} must be on or off`);
  return b;
}

const BOARD_OPTION: Record<string, string> = {
  progress: "progressOptionId",
  review: "reviewOptionId",
};

/**
 * The three `projects_write` / `projects_list` payloads that move an issue on the
 * Projects v2 board, from `bkit.githubProject`. Payload keys are the MCP tools'
 * own argument names. The workflow fills `item_id` on `updateItem` from the
 * `listItems` entry whose issue number matches.
 */
function boardPayload(
  ctx: RunContext,
  status: string,
): { board: Record<string, unknown> | null; boardSkipped: string | null } {
  const root = repoRoot(ctx.cwd);
  const tracker = readBkitConfig(root).issueTracker;
  if (tracker !== "github") {
    if (tracker === "linear") ctx.log("Board status carried by issue state — no separate update.");
    return { board: null, boardSkipped: `tracker-${tracker}` };
  }
  const gp = readBkitConfig(root).githubProject;
  if (gp === false) return { board: null, boardSkipped: "opted-out" };
  const cfg = gp ?? {};
  const owner = cfg.owner;
  const number = Number(cfg.number);
  if (typeof owner !== "string" || owner === "" || !Number.isInteger(number) || number <= 0) {
    ctx.log("GitHub project not configured in package.json");
    return { board: null, boardSkipped: "not-configured" };
  }
  // projects_write rejects anything but the numeric field id (a `PVTSSF_…` node id
  // included), so a wrong value is a skip with a reason, not a silent no-op.
  const raw = cfg.statusFieldId;
  const fieldId = typeof raw === "number" ? raw : /^[0-9]+$/.test(String(raw)) ? Number(raw) : NaN;
  if (!Number.isInteger(fieldId)) {
    ctx.log(`bkit.githubProject.statusFieldId "${String(raw)}" is not the numeric Status field id`);
    return { board: null, boardSkipped: "status-field-id-not-number" };
  }
  const option = cfg[BOARD_OPTION[status]!];
  if (typeof option !== "string" || option === "") {
    ctx.log(`bkit.githubProject.${BOARD_OPTION[status]!} is not set`);
    return { board: null, boardSkipped: "option-id-missing" };
  }
  const issue = String(ctx.flags.issue ?? "").replace(/^#/, "");
  const ownerRepo = String(ctx.flags.ownerRepo ?? "");
  const [itemOwner, itemRepo, extra] = ownerRepo.split("/");
  if (!/^[0-9]+$/.test(issue) || !itemOwner || !itemRepo || extra !== undefined) {
    throw new CommandError(
      EXIT.USAGE,
      "--board needs --issue=<number> and --owner-repo=<owner>/<repo>",
    );
  }
  const project = { owner, owner_type: "org", project_number: number };
  return {
    board: {
      addItem: {
        method: "add_project_item",
        ...project,
        item_type: "issue",
        item_owner: itemOwner,
        item_repo: itemRepo,
        issue_number: Number(issue),
      },
      listItems: { method: "list_project_items", ...project, query: issue },
      updateItem: {
        method: "update_project_item",
        ...project,
        updated_field: { id: fieldId, value: option },
      },
    },
    boardSkipped: null,
  };
}

function labelsVerb(ctx: RunContext): number {
  const phase = str(ctx.flags.phase);
  if (phase !== undefined && !PHASE_LABELS.includes(`bkit:${phase}`)) {
    throw new CommandError(EXIT.USAGE, "--phase must be design, plan, build, ship, or merged");
  }
  let failed = onOff(ctx.flags.failed, "failed");
  const debug = onOff(ctx.flags.debug, "debug");
  // A merged issue must not keep a stale Failure Path marker.
  if (phase === "merged") {
    if (failed === true)
      throw new CommandError(EXIT.USAGE, "--phase=merged clears bkit:failed; drop --failed=on");
    failed = false;
  }
  const board = str(ctx.flags.board);
  if (board !== undefined && BOARD_OPTION[board] === undefined) {
    throw new CommandError(EXIT.USAGE, "--board must be progress or review");
  }
  const t: LabelTransition = { phase, failed, debug };
  const { add, remove, labels } = transitionLabels(
    (ctx.flags.label as string[] | undefined) ?? [],
    t,
  );
  const { board: payload, boardSkipped } =
    board === undefined ? { board: null, boardSkipped: null } : boardPayload(ctx, board);
  ctx.emit({
    add,
    remove,
    labels,
    changed: add.length + remove.length > 0,
    autoRouteSuffix: labels.includes(AUTO_LABEL) ? AUTO_ROUTE_SUFFIX : "",
    linearState: linearState(t, board),
    board: payload,
    boardSkipped,
  });
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
  subPlan: "Sub-plan",
  attempt: "Attempt",
  strategy: "Strategy",
};

/**
 * ` - Name: value` fields in the order the flags were given — the templates order
 * them differently step to step (Strategy before or after Attempt), and each
 * template's order is kept. Relies on parseFlags filling its result in argv order.
 */
function headerFields(ctx: RunContext): string[] {
  const out: string[] = [];
  for (const key of Object.keys(ctx.flags)) {
    if (key === "field") {
      for (const f of ctx.flags.field as string[]) {
        const eq = f.indexOf("=");
        if (eq <= 0) throw new CommandError(EXIT.USAGE, `--field "${f}" must be Name=value`);
        out.push(`${f.slice(0, eq)}: ${f.slice(eq + 1)}`);
      }
    } else if (key === "subPlan") {
      const count = str(ctx.flags.subPlanCount);
      out.push(`Sub-plan: ${String(ctx.flags.subPlan)}${count === undefined ? "" : `/${count}`}`);
    } else if (FIELD_LABELS[key] !== undefined) {
      out.push(`${FIELD_LABELS[key]}: ${String(ctx.flags[key])}`);
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

function links(ctx: RunContext): string[] {
  const ownerRepo = str(ctx.flags.ownerRepo);
  const tree = str(ctx.flags.tree);
  const prNumber = str(ctx.flags.prNumber);
  const runId = str(ctx.flags.runId);
  const artifacts = (ctx.flags.artifact as string[] | undefined) ?? [];
  const wantsLinks = tree ?? prNumber ?? runId ?? artifacts[0];
  if (wantsLinks === undefined) return [];
  if (ownerRepo === undefined || !/^[^/\s]+\/[^/\s]+$/.test(ownerRepo)) {
    throw new CommandError(EXIT.USAGE, "links need --owner-repo=<owner>/<repo>");
  }
  const gh = `https://github.com/${ownerRepo}`;
  const out: string[] = [];
  if (tree !== undefined) out.push(`[${ownerRepo}/tree/${tree}](${gh}/tree/${tree})`);
  if (prNumber !== undefined) {
    out.push(
      `[${ownerRepo}/pull/${prNumber}](${str(ctx.flags.prUrl) ?? `${gh}/pull/${prNumber}`})`,
    );
  }
  if (runId !== undefined)
    out.push(`[${ownerRepo}/actions/run/${runId}](${gh}/actions/runs/${runId})`);
  if (artifacts.length) {
    const ref = str(ctx.flags.ref) ?? tree;
    if (ref === undefined) throw new CommandError(EXIT.USAGE, "--artifact needs --ref (or --tree)");
    for (const a of artifacts)
      out.push(`[${path.basename(a)}](${gh}/blob/${ref}/${a.replace(/^\/+/, "")})`);
  }
  return out;
}

const KINDS = ["step", "failure", "handover"];

export function commentBody(ctx: RunContext): string {
  const kind = str(ctx.flags.kind) ?? "step";
  if (!KINDS.includes(kind))
    throw new CommandError(EXIT.USAGE, `--kind must be ${KINDS.join(", ")}`);
  const lines = [GENERATED_MARKER];

  if (ctx.flags.workflowHeading === true) {
    const heading = WORKFLOW_HEADINGS[String(ctx.flags.workflow ?? "")];
    if (heading === undefined) {
      throw new CommandError(
        EXIT.USAGE,
        `--workflow-heading needs --workflow=${Object.keys(WORKFLOW_HEADINGS).join("|")}`,
      );
    }
    lines.push(`## ${heading}`);
  }

  const number = str(ctx.flags.stepNumber);
  const title = str(ctx.flags.stepTitle);
  if (number !== undefined && !/^[0-9]+[a-z]?$/.test(number)) {
    throw new CommandError(EXIT.USAGE, `--step-number "${number}" is not a step number`);
  }
  if (ctx.flags.subPlanCount !== undefined && ctx.flags.subPlan === undefined) {
    throw new CommandError(EXIT.USAGE, "--sub-plan-count needs --sub-plan");
  }

  if (kind === "step") {
    if (number === undefined || title === undefined) {
      throw new CommandError(EXIT.USAGE, "--kind=step needs --step-number and --step-title");
    }
    lines.push([`### Step ${number} — ${title}`, ...headerFields(ctx)].join(" - "));
  } else if (kind === "failure") {
    const error = str(ctx.flags.error);
    if (number === undefined || title === undefined || error === undefined) {
      throw new CommandError(
        EXIT.USAGE,
        "--kind=failure needs --step-number, --step-title and --error",
      );
    }
    const subStep = str(ctx.flags.subStep);
    lines.push("### Workflow Failure");
    lines.push(
      `Step: ${number} — ${title}${subStep === undefined ? "" : `; Sub-step: ${subStep}`}`,
    );
    lines.push(`Error: ${error}`);
    const stderrFile = str(ctx.flags.stderrFile);
    if (stderrFile !== undefined) {
      const captured = tail(readInput(ctx.cwd, stderrFile, "stderr-file"), 20);
      if (captured.trim() !== "") lines.push("Stderr:", fenced(captured));
    }
  } else {
    lines.push("### Workflow Handover");
  }

  lines.push(...links(ctx));
  lines.push(...((ctx.flags.line as string[] | undefined) ?? []));
  const bodyFile = str(ctx.flags.bodyFile);
  if (bodyFile !== undefined)
    lines.push(readInput(ctx.cwd, bodyFile, "body-file").replace(/\n+$/, ""));
  for (const s of (ctx.flags.section as string[] | undefined) ?? []) {
    const eq = s.indexOf("=");
    if (eq <= 0) throw new CommandError(EXIT.USAGE, `--section "${s}" must be Title=path`);
    lines.push(`#### ${s.slice(0, eq)}`);
    lines.push(readInput(ctx.cwd, s.slice(eq + 1), "section").replace(/\n+$/, ""));
  }

  // A whole-line cut marker copied in from an artifact would fire on the next
  // run's issue text; inline, it is only a mention.
  return lines
    .join("\n")
    .split("\n")
    .map((l) => (CUT_LINE.test(l) ? `\`${CUT_MARKER}\`` : l))
    .join("\n");
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export const issuesCommand: CommandSpec = {
  noun: "issues",
  summary: "Prepare tracker payloads (issue text, label transitions, comments); MCP sends them.",
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
    labels: {
      summary: "Label arithmetic for a transition, the Linear state, and the board payload.",
      flags: [
        { name: "label", type: "string", repeatable: true, help: "a label the issue carries now" },
        {
          name: "phase",
          type: "string",
          help: "set this phase: design | plan | build | ship | merged",
        },
        { name: "failed", type: "string", help: "bkit:failed on | off (merged implies off)" },
        { name: "debug", type: "string", help: "bkit:debug on | off" },
        {
          name: "board",
          type: "string",
          help: "also move the Projects v2 item: progress | review",
        },
        { name: "issue", type: "string", help: "issue number (with --board)" },
        { name: "owner-repo", type: "string", help: "<owner>/<repo> of the issue (with --board)" },
      ],
      output: {
        add: "labels to add",
        remove: "labels to remove",
        labels: "the full label set to write",
        changed: "whether add or remove is non-empty",
        autoRouteSuffix: `"${AUTO_ROUTE_SUFFIX}" when the label set carries ${AUTO_LABEL}, else ""`,
        linearState: "Linear issue state for this transition, or null",
        board: "projects payloads {addItem, listItems, updateItem}, or null",
        boardSkipped:
          "why board is null with --board: opted-out | not-configured | tracker-<name> | …",
      },
      run: labelsVerb,
    },
    comment: {
      summary: "The exact body of a ###### bkit:generated step, failure, or handover comment.",
      flags: [
        { name: "kind", type: "string", help: "step (default) | failure | handover" },
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
        { name: "sub-plan", type: "string", help: "header field Sub-plan (x of x/y)" },
        { name: "sub-plan-count", type: "string", help: "y of Sub-plan x/y" },
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
          help: "link this repo path at --ref",
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
          name: "stderr-file",
          type: "string",
          help: "failure: captured stderr (last 20 lines kept)",
        },
      ],
      output: { body: "the comment body" },
      exitCodes: { [EXIT_BAD_INPUT]: "a --body-file / --section / --stderr-file file is missing" },
      run: (ctx) => {
        ctx.emit({ body: commentBody(ctx) });
        return EXIT.OK;
      },
    },
  },
};
