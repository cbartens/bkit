// bkit workstreams parse|comment — design Step 11: read the organised design's
// `## Suggested Workstreams` and build the advisory comment for the feature's
// own issue.
//
// Advisory only. Workflows never create tracker issues, comment on another
// issue, or set blockers, so nothing here matches workstreams to issues
// or builds blocked-by bodies. The tracker write itself stays an MCP call in the
// workflow; this prepares its body.
import * as fs from "node:fs";
import * as path from "node:path";
import { CommandError, EXIT } from "../lib.js";
import { COMMENT_FILE_OUTPUT, GENERATED_MARKER, commentFileOf, stampMarker } from "./tracker.js";
/** Exit code: no workstream parsed — the workflow's Failure Path. */
export const EXIT_NONE = 3;
const HEADING = /^(#{1,6})\s+(.*?)\s*$/;
const WS_HEADING = /^###\s+WS-(\d+):\s*(.*?)\s*$/;
/**
 * Every `### WS-{N}: {NAME}` block under the LAST `## Suggested Workstreams`
 * heading (the organise step appends it after a verbatim copy of the design),
 * with its `#### Requires` value. An inline `Requires: [...]` line is read too.
 */
export function parseWorkstreams(md) {
    const lines = md.split("\n");
    let start = -1;
    lines.forEach((l, i) => {
        if (/^##\s+Suggested Workstreams\s*$/.test(l))
            start = i;
    });
    if (start === -1)
        return [];
    const section = [];
    for (const line of lines.slice(start + 1)) {
        const h = HEADING.exec(line);
        if (h && h[1].length <= 2)
            break;
        section.push(line);
    }
    const out = [];
    let current;
    /** The `####` subsection the line sits in; undefined directly under the WS heading. */
    let sub;
    for (const line of section) {
        const ws = WS_HEADING.exec(line);
        if (ws) {
            current = {
                id: `WS-${ws[1]}`,
                n: Number(ws[1]),
                name: ws[2],
                requires: [],
                requiresText: "",
            };
            sub = undefined;
            out.push(current);
            continue;
        }
        if (!current)
            continue;
        const h = HEADING.exec(line);
        if (h) {
            sub = h[2].toLowerCase();
            continue;
        }
        const inline = sub === undefined ? /^\W*Requires\W*:\**\s*(.*)$/i.exec(line)?.[1] : undefined;
        const value = (sub === "requires" ? line : inline)?.trim();
        if (value && current.requiresText === "") {
            current.requiresText = value;
            current.requires = value.match(/WS-\d+/g) ?? [];
        }
    }
    return out;
}
/** `[]` or `[WS-1, WS-2]`. */
export const requiresList = (w) => `[${w.requires.join(", ")}]`;
/** The Step 11 comment: one line per workstream, the issue-body line, then the design doc link. */
export function commentBody(ws, opts) {
    const doc = `docs/plans/${opts.month}/${opts.fid}-design.md`;
    const url = `https://github.com/${opts.ownerRepo}/blob/dev/${doc}`;
    const lines = [
        GENERATED_MARKER,
        "### Step 11 — Suggested Workstreams",
        "Advisory only. NEVER auto-trigger.",
        ...ws.map((w) => `- ${w.id}: ${w.name}. Requires: ${requiresList(w)}`),
        `Filing one issue per workstream: put \`**Parent design:** [${opts.fid}-design.md](${url})\` in its body, and list the issues it requires in a blocked-by block (.bkit/trackers.md § Issue shapes).`,
        `[${doc}](${url})`,
    ];
    return stampMarker(lines.join("\n"));
}
const ARTIFACT_FLAG = {
    name: "artifact",
    type: "string",
    required: true,
    help: "the organised design, docs/plans/{YYYYMM}/logs/{FID}/design-v3-organised.md",
};
function read(ctx) {
    const file = path.resolve(ctx.cwd, String(ctx.flags.artifact));
    if (!fs.existsSync(file))
        throw new CommandError(EXIT.USAGE, `--artifact ${file} does not exist`);
    const ws = parseWorkstreams(fs.readFileSync(file, "utf-8"));
    if (ws.length === 0) {
        throw new CommandError(EXIT_NONE, `no "### WS-{N}: {NAME}" block under "## Suggested Workstreams" in ${file}`);
    }
    return ws;
}
export const workstreamsCommand = {
    noun: "workstreams",
    summary: "Parse the organised design's suggested workstreams and build the advisory comment.",
    verbs: {
        parse: {
            summary: "List each WS-{N} with its name and Requires.",
            flags: [ARTIFACT_FLAG],
            output: { workstreams: "[{id, n, name, requires, requiresText}] in file order" },
            exitCodes: { [EXIT_NONE]: "no workstream parsed (Failure Path)" },
            run: (ctx) => {
                ctx.emit({ workstreams: read(ctx) });
                return EXIT.OK;
            },
        },
        comment: {
            summary: "The Step 11 comment body for the feature's own issue (posted via MCP by the workflow).",
            flags: [
                ARTIFACT_FLAG,
                { name: "fid", type: "string", required: true, help: "feature id" },
                { name: "month", type: "string", required: true, help: "YYYYMM bucket of the design doc" },
                {
                    name: "owner-repo",
                    type: "string",
                    required: true,
                    help: "owner/repo for the design doc link",
                },
            ],
            output: {
                comment: "the comment body",
                commentFile: COMMENT_FILE_OUTPUT,
                workstreams: "the parsed workstreams",
            },
            exitCodes: { [EXIT_NONE]: "no workstream parsed (Failure Path)" },
            run: (ctx) => {
                const workstreams = read(ctx);
                const body = commentBody(workstreams, {
                    ownerRepo: String(ctx.flags.ownerRepo),
                    month: String(ctx.flags.month),
                    fid: String(ctx.flags.fid),
                });
                ctx.emit({ comment: body, commentFile: commentFileOf(ctx.cwd, body), workstreams });
                return EXIT.OK;
            },
        },
    },
};
