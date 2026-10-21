// bkit issues text|labels|comment — tracker payloads, prepared but never sent.
//
// The tracker calls stay in the workflows, through MCP: a workflow touches only
// its own issue, and only through the tracker's MCP server. These verbs do the
// arithmetic the workflows stated as prose — which comments count as human input,
// which labels a transition adds and drops, the board update, and the exact text
// of every `###### bkit:generated` comment — so no step re-derives it by hand.
import * as fs from "node:fs";
import * as path from "node:path";
import { CommandError, EXIT, parseJson, repoRoot, } from "../lib.js";
import { readBkitConfig } from "../../shared/settings.js";
import { str } from "./status.js";
/** Exit code: an input file is missing or not in the expected shape. */
export const EXIT_BAD_INPUT = 3;
function readInput(cwd, file, flag) {
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
export const isGenerated = (body) => (body.replace(/^\s+/, "").split(/\r?\n/, 1)[0] ?? "").trim() === GENERATED_MARKER;
/** Keep only what follows the LAST whole-line cut marker; the marker itself goes too. */
export function cutEarlier(text) {
    const lines = text.split("\n");
    let last = -1;
    lines.forEach((line, i) => {
        if (CUT_LINE.test(line))
            last = i;
    });
    if (last === -1)
        return { text, cut: false };
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
export function parseComments(raw) {
    const wrapped = raw;
    const list = Array.isArray(raw)
        ? raw
        : Array.isArray(wrapped?.comments)
            ? wrapped.comments
            : Array.isArray(wrapped?.nodes)
                ? wrapped.nodes
                : null;
    if (list === null)
        return null;
    const out = [];
    for (const item of list) {
        if (typeof item === "string") {
            out.push({ body: item });
            continue;
        }
        const obj = (item ?? {});
        if (typeof obj.body !== "string")
            return null;
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
export function sortOldestFirst(comments) {
    const times = comments.map((c) => (c.createdAt === undefined ? NaN : Date.parse(c.createdAt)));
    if (times.some((t) => Number.isNaN(t)))
        return { comments, sorted: false };
    const order = comments.map((c, i) => ({ c, t: times[i], i }));
    order.sort((a, b) => a.t - b.t || a.i - b.i);
    return { comments: order.map((o) => o.c), sorted: true };
}
export function issueText(description, comments) {
    const human = comments.filter((c) => !isGenerated(c.body));
    const joined = [description, ...human.map((c) => c.body)]
        .map((s) => s.trim())
        .filter((s) => s !== "")
        .join("\n\n");
    const { text, cut } = cutEarlier(joined);
    return { text, kept: human.length, dropped: comments.length - human.length, cut };
}
function textVerb(ctx) {
    const descFile = str(ctx.flags.descriptionFile);
    const commentsFile = str(ctx.flags.commentsFile);
    if (descFile === undefined && commentsFile === undefined) {
        throw new CommandError(EXIT.USAGE, "give --description-file, --comments-file, or both");
    }
    const description = descFile === undefined ? "" : readInput(ctx.cwd, descFile, "description-file");
    let comments = [];
    if (commentsFile !== undefined) {
        const parsed = parseJson(readInput(ctx.cwd, commentsFile, "comments-file"));
        const list = parsed.ok ? parseComments(parsed.value) : null;
        if (list === null) {
            throw new CommandError(EXIT_BAD_INPUT, `--comments-file ${commentsFile} is not a JSON list of comments with a string body`);
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
export function transitionLabels(current, t) {
    const have = [...new Set(current)];
    const remove = new Set();
    const add = [];
    const want = (label, on) => {
        if (on && !have.includes(label))
            add.push(label);
        if (!on && have.includes(label))
            remove.add(label);
    };
    if (t.phase !== undefined) {
        const label = `bkit:${t.phase}`;
        for (const l of have)
            if (PHASE_LABELS.includes(l) && l !== label)
                remove.add(l);
        for (const l of have)
            if (l.startsWith(NEXT_LABEL_PREFIX))
                remove.add(l);
        want(label, true);
    }
    // A phase starting supersedes any earlier Failure Path.
    const failed = t.failed ?? (t.phase !== undefined ? false : undefined);
    if (failed !== undefined)
        want("bkit:failed", failed);
    return {
        add,
        remove: [...remove],
        labels: [...have.filter((l) => !remove.has(l)), ...add],
    };
}
/**
 * The issue state the workflows set for the same transition, on a tracker whose
 * board status is the issue state: `bkit.linear` or `bkit.jira`. A shipped
 * or failed issue waits on a human (`review`); a phase starting is `progress`.
 * The workflows write it alone, so a name the team or project lacks leaves the
 * labels landed. Null under github (the Projects v2 board moves instead) and
 * none, or when the transition sets no state.
 */
export function trackerState(t, board, cfg) {
    const states = cfg.issueTracker === "linear" ? cfg.linear : cfg.issueTracker === "jira" ? cfg.jira : null;
    if (states === null)
        return null;
    if (t.phase === "merged" || t.failed === true)
        return states.review;
    if (t.phase !== undefined)
        return states.progress;
    if (board === "review")
        return states.review;
    if (board === "progress")
        return states.progress;
    return null;
}
const ON_OFF = { on: true, off: false };
function onOff(v, flag) {
    if (v === undefined)
        return undefined;
    const b = ON_OFF[String(v)];
    if (b === undefined)
        throw new CommandError(EXIT.USAGE, `--${flag} must be on or off`);
    return b;
}
const BOARD_OPTION = {
    progress: "progressOptionId",
    review: "reviewOptionId",
};
/**
 * The three `projects_write` / `projects_list` payloads that move an issue on the
 * Projects v2 board, from `bkit.githubProject`. Payload keys are the MCP tools'
 * own argument names. The workflow fills `item_id` on `updateItem` from the
 * `listItems` entry whose issue number matches.
 */
function boardPayload(ctx, status) {
    const root = repoRoot(ctx.cwd);
    const tracker = readBkitConfig(root).issueTracker;
    if (tracker !== "github") {
        if (tracker === "linear" || tracker === "jira")
            ctx.log("Board status carried by issue state — no separate update.");
        return { board: null, boardSkipped: `tracker-${tracker}` };
    }
    const gp = readBkitConfig(root).githubProject;
    if (gp === false)
        return { board: null, boardSkipped: "opted-out" };
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
    const option = cfg[BOARD_OPTION[status]];
    if (typeof option !== "string" || option === "") {
        ctx.log(`bkit.githubProject.${BOARD_OPTION[status]} is not set`);
        return { board: null, boardSkipped: "option-id-missing" };
    }
    const issue = String(ctx.flags.issue ?? "").replace(/^#/, "");
    const ownerRepo = String(ctx.flags.ownerRepo ?? "");
    const [itemOwner, itemRepo, extra] = ownerRepo.split("/");
    if (!/^[0-9]+$/.test(issue) || !itemOwner || !itemRepo || extra !== undefined) {
        throw new CommandError(EXIT.USAGE, "--board needs --issue=<number> and --owner-repo=<owner>/<repo>");
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
function labelsVerb(ctx) {
    const phase = str(ctx.flags.phase);
    if (phase !== undefined && !PHASE_LABELS.includes(`bkit:${phase}`)) {
        throw new CommandError(EXIT.USAGE, "--phase must be design, plan, build, debug, ship, or merged");
    }
    const failed = onOff(ctx.flags.failed, "failed");
    if (phase !== undefined && failed === true)
        throw new CommandError(EXIT.USAGE, "--phase clears bkit:failed; drop --failed=on");
    const board = str(ctx.flags.board);
    if (board !== undefined && BOARD_OPTION[board] === undefined) {
        throw new CommandError(EXIT.USAGE, "--board must be progress or review");
    }
    const t = { phase, failed };
    const { add, remove, labels } = transitionLabels(ctx.flags.label ?? [], t);
    const { board: payload, boardSkipped } = board === undefined ? { board: null, boardSkipped: null } : boardPayload(ctx, board);
    ctx.emit({
        add,
        remove,
        labels,
        changed: add.length + remove.length > 0,
        autoRouteSuffix: labels.includes(AUTO_LABEL) ? AUTO_ROUTE_SUFFIX : "",
        trackerState: trackerState(t, board, readBkitConfig(repoRoot(ctx.cwd))),
        board: payload,
        boardSkipped,
    });
    return EXIT.OK;
}
// ---------------------------------------------------------------------------
// comment
// ---------------------------------------------------------------------------
const WORKFLOW_HEADINGS = {
    design: "Design Workflow",
    plan: "Plan Workflow",
    build: "Build Workflow",
    debug: "Debug Workflow",
    ship: "Ship Workflow",
    auto: "bkit Auto",
};
/** Named header fields and their label; any other goes through `--field=Name=value`. */
const FIELD_LABELS = {
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
function headerFields(ctx) {
    const out = [];
    for (const key of Object.keys(ctx.flags)) {
        if (key === "field") {
            for (const f of ctx.flags.field) {
                const eq = f.indexOf("=");
                if (eq <= 0)
                    throw new CommandError(EXIT.USAGE, `--field "${f}" must be Name=value`);
                out.push([f.slice(0, eq), f.slice(eq + 1)]);
            }
        }
        else if (key === "subPlan") {
            const count = str(ctx.flags.subPlanCount);
            out.push([
                "Sub-plan",
                `${String(ctx.flags.subPlan)}${count === undefined ? "" : `/${count}`}`,
            ]);
        }
        else if (FIELD_LABELS[key] !== undefined) {
            out.push([FIELD_LABELS[key], String(ctx.flags[key])]);
        }
    }
    return out;
}
const tail = (text, n) => text.replace(/\n+$/, "").split("\n").slice(-n).join("\n");
/** A fence longer than any backtick run inside, so captured output cannot close it. */
function fenced(text) {
    const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((m) => m.length));
    const fence = "`".repeat(Math.max(3, longest + 1));
    return `${fence}text\n${text}\n${fence}`;
}
function links(o) {
    const artifacts = o.artifacts ?? [];
    const wantsLinks = o.tree ?? o.prNumber ?? o.runId ?? artifacts[0];
    if (wantsLinks === undefined)
        return [];
    const ownerRepo = o.ownerRepo;
    if (ownerRepo === undefined || !/^[^/\s]+\/[^/\s]+$/.test(ownerRepo)) {
        throw new CommandError(EXIT.USAGE, "links need --owner-repo=<owner>/<repo>");
    }
    const gh = `https://github.com/${ownerRepo}`;
    const out = [];
    if (o.tree !== undefined)
        out.push(`[${ownerRepo}/tree/${o.tree}](${gh}/tree/${o.tree})`);
    if (o.prNumber !== undefined) {
        out.push(`[${ownerRepo}/pull/${o.prNumber}](${o.prUrl ?? `${gh}/pull/${o.prNumber}`})`);
    }
    if (o.runId !== undefined)
        out.push(`[${ownerRepo}/actions/run/${o.runId}](${gh}/actions/runs/${o.runId})`);
    if (artifacts.length) {
        const ref = o.ref ?? o.tree;
        if (ref === undefined)
            throw new CommandError(EXIT.USAGE, "--artifact needs --ref (or --tree)");
        for (const a of artifacts) {
            const hash = a.indexOf("#");
            const file = (hash < 0 ? a : a.slice(0, hash)).replace(/^\/+/, "");
            const heading = hash < 0 ? undefined : a.slice(hash + 1).trim();
            if (heading === "")
                throw new CommandError(EXIT.USAGE, `--artifact "${a}" has an empty #Heading`);
            const url = `${gh}/blob/${ref}/${file}`;
            out.push(heading === undefined
                ? `[${path.basename(file)}](${url})`
                : `[${path.basename(file)} § ${heading}](${url}#${headingAnchor(heading)})`);
        }
    }
    return out;
}
/**
 * GitHub's anchor for a markdown heading: lowercased, punctuation dropped,
 * spaces to hyphens. A repeated heading's later copies take `-1`, `-2`; this
 * names the first.
 */
export function headingAnchor(heading) {
    return heading
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
        .replace(/ /g, "-");
}
const KINDS = ["step", "failure", "handover", "audit"];
/** The exact comment body; files (`bodyFile`, `sections`, `stderrFile`, `errorFile`) resolve against `cwd`. */
export function buildComment(cwd, o) {
    const kind = o.kind ?? "step";
    if (!KINDS.includes(kind))
        throw new CommandError(EXIT.USAGE, `--kind must be ${KINDS.join(", ")}`);
    const lines = [GENERATED_MARKER];
    if (o.workflowHeading === true) {
        const heading = WORKFLOW_HEADINGS[o.workflow ?? ""];
        if (heading === undefined) {
            throw new CommandError(EXIT.USAGE, `--workflow-heading needs --workflow=${Object.keys(WORKFLOW_HEADINGS).join("|")}`);
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
        lines.push([`### Step ${number} — ${title}`, ...(o.fields ?? []).map(([k, v]) => `${k}: ${v}`)].join(" - "));
    }
    else if (kind === "failure") {
        const error = o.errorFile !== undefined
            ? readInput(cwd, o.errorFile, "error-file").replace(/\n+$/, "")
            : o.error;
        if (number === undefined || title === undefined || error === undefined) {
            throw new CommandError(EXIT.USAGE, "--kind=failure needs --step-number, --step-title and --error (or --error-file)");
        }
        lines.push("### Workflow Failure");
        lines.push(`Step: ${number} — ${title}${o.subStep === undefined ? "" : `; Sub-step: ${o.subStep}`}`);
        lines.push(`Error: ${error}`);
        if (o.stderrFile !== undefined) {
            const captured = tail(readInput(cwd, o.stderrFile, "stderr-file"), 20);
            if (captured.trim() !== "")
                lines.push("Stderr:", fenced(captured));
        }
    }
    else if (kind === "audit") {
        const slug = o.auditSlug;
        if (slug === undefined || !/^[a-z0-9-]+$/.test(slug)) {
            throw new CommandError(EXIT.USAGE, "--kind=audit needs --audit-slug=<template slug>");
        }
        lines.push([`### Audit Summary: ${slug}`, ...(o.fields ?? []).map(([k, v]) => `${k}: ${v}`)].join(" - "));
    }
    else {
        lines.push("### Workflow Handover");
    }
    lines.push(...links(o));
    lines.push(...(o.lines ?? []));
    if (o.bodyFile !== undefined)
        lines.push(readInput(cwd, o.bodyFile, "body-file").replace(/\n+$/, ""));
    for (const s of o.sections ?? []) {
        const eq = s.indexOf("=");
        if (eq <= 0)
            throw new CommandError(EXIT.USAGE, `--section "${s}" must be Title=path`);
        lines.push(`#### ${s.slice(0, eq)}`);
        lines.push(readInput(cwd, s.slice(eq + 1), "section").replace(/\n+$/, ""));
    }
    // A whole-line cut marker copied in from an artifact would fire on the next
    // run's issue text; inline, it is only a mention.
    return lines
        .join("\n")
        .split("\n")
        .map((l) => (CUT_LINE.test(l) ? `\`${CUT_MARKER}\`` : l))
        .join("\n");
}
/** `bkit issues comment`'s flags as a `CommentInput`. */
export function commentBody(ctx) {
    const kind = str(ctx.flags.kind) ?? "step";
    if (ctx.flags.subPlanCount !== undefined && ctx.flags.subPlan === undefined) {
        throw new CommandError(EXIT.USAGE, "--sub-plan-count needs --sub-plan");
    }
    return buildComment(ctx.cwd, {
        kind: kind,
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
        artifacts: ctx.flags.artifact ?? [],
        ref: str(ctx.flags.ref),
        lines: ctx.flags.line ?? [],
        bodyFile: str(ctx.flags.bodyFile),
        sections: ctx.flags.section ?? [],
    });
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
export const issuesCommand = {
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
                    help: "set this phase: design | plan | build | debug | ship | merged (drops next:* and bkit:failed)",
                },
                { name: "failed", type: "string", help: "bkit:failed on | off (a phase implies off)" },
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
                trackerState: "Linear or Jira issue state for this transition, from package.json; null under github, none, or no state move",
                board: "projects payloads {addItem, listItems, updateItem}, or null",
                boardSkipped: "why board is null with --board: opted-out | not-configured | tracker-<name> | …",
            },
            run: labelsVerb,
        },
        comment: {
            summary: "The exact body of a ###### bkit:generated step, failure, handover, or audit comment.",
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
            ],
            output: { comment: "the comment body" },
            exitCodes: {
                [EXIT_BAD_INPUT]: "a --body-file / --section / --stderr-file / --error-file file is missing",
            },
            run: (ctx) => {
                ctx.emit({ comment: commentBody(ctx) });
                return EXIT.OK;
            },
        },
    },
};
