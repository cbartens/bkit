// bkit plans parse|comment — design Step 11: read the organised design's
// `## Suggested Workstreams` and `## Suggested Plans` and build the advisory comment
// for the feature's own issue.
//
// A workstream is a logical unit of the design; a plan is the filed unit (one issue,
// one plan doc, one branch / PR) covering one or more workstreams. Advisory only.
// Workflows never create tracker issues, comment on another issue, or set blockers,
// so nothing here matches plans to issues or builds blocked-by bodies. The tracker
// write itself stays an MCP call in the workflow; this prepares its body.

import * as fs from "node:fs";
import * as path from "node:path";

import { CommandError, EXIT, type CommandSpec, type FlagSpec, type RunContext } from "../lib.js";
import { COMMENT_FILE_OUTPUT, GENERATED_MARKER, commentFileOf, stampMarker } from "./tracker.js";

/** Exit code: no workstream parsed — the workflow's Failure Path. */
export const EXIT_NONE = 3;

export interface Workstream {
  /** `WS-{N}`. */
  id: string;
  n: number;
  name: string;
  /** Workstream ids this one requires; [] for a root workstream. */
  requires: string[];
  /** The Requires value as written. */
  requiresText: string;
}

export interface Plan {
  /** `P-{N}`. */
  id: string;
  n: number;
  name: string;
  /** Workstream ids this plan covers. */
  covers: string[];
  /** Plan ids this one requires; [] for a root plan. */
  requires: string[];
  /** The Requires value as written. */
  requiresText: string;
}

const HEADING = /^(#{1,6})\s+(.*?)\s*$/;
const INLINE = /^\W*(Requires|Covers)\W*:\**\s*(.*)$/i;

interface Block {
  n: number;
  name: string;
  /** Lowercased `####` subsection (or inline `Requires:` / `Covers:` label) → its first value line. */
  fields: Record<string, string>;
}

/**
 * Every `### {PREFIX}-{N}: {NAME}` block under the LAST `## {title}` heading (the
 * organise step appends it after a verbatim copy of the design), with the first
 * value line of each `####` subsection. An inline `Requires: [...]` or `Covers: [...]`
 * line directly under the block heading is read too.
 */
function sectionBlocks(md: string, title: string, prefix: string): Block[] {
  const lines = md.split("\n");
  let start = -1;
  lines.forEach((l, i) => {
    if (new RegExp(`^##\\s+${title}\\s*$`).test(l)) start = i;
  });
  if (start === -1) return [];
  const blockHeading = new RegExp(`^###\\s+${prefix}-(\\d+):\\s*(.*?)\\s*$`);
  const out: Block[] = [];
  let current: Block | undefined;
  /** The `####` subsection the line sits in; undefined directly under the block heading. */
  let sub: string | undefined;
  for (const line of lines.slice(start + 1)) {
    const h = HEADING.exec(line);
    if (h && h[1]!.length <= 2) break;
    const b = blockHeading.exec(line);
    if (b) {
      current = { n: Number(b[1]), name: b[2]!, fields: {} };
      sub = undefined;
      out.push(current);
      continue;
    }
    if (!current) continue;
    if (h) {
      sub = h[2]!.toLowerCase();
      continue;
    }
    const inline = sub === undefined ? INLINE.exec(line) : null;
    const key = sub ?? inline?.[1]!.toLowerCase();
    const value = (sub === undefined ? inline?.[2] : line)?.trim();
    if (key !== undefined && value && current.fields[key] === undefined)
      current.fields[key] = value;
  }
  return out;
}

const ids = (text: string, prefix: string) => text.match(new RegExp(`${prefix}-\\d+`, "g")) ?? [];

/** Every `### WS-{N}: {NAME}` block under the last `## Suggested Workstreams`, with its `Requires`. */
export function parseWorkstreams(md: string): Workstream[] {
  return sectionBlocks(md, "Suggested Workstreams", "WS").map((b) => {
    const requiresText = b.fields.requires ?? "";
    return {
      id: `WS-${b.n}`,
      n: b.n,
      name: b.name,
      requires: ids(requiresText, "WS"),
      requiresText,
    };
  });
}

/**
 * Every `### P-{N}: {NAME}` block under the last `## Suggested Plans`, with its
 * `Covers` and `Requires`. A design with no plan block yields one plan per
 * workstream: `P-{N}` covers `WS-{N}`, its `Requires` mapped to plan ids.
 */
export function parsePlans(md: string): Plan[] {
  const plans = sectionBlocks(md, "Suggested Plans", "P").map((b) => {
    const requiresText = b.fields.requires ?? "";
    return {
      id: `P-${b.n}`,
      n: b.n,
      name: b.name,
      covers: ids(b.fields.covers ?? "", "WS"),
      requires: ids(requiresText, "P"),
      requiresText,
    };
  });
  if (plans.length > 0) return plans;
  return parseWorkstreams(md).map((w) => ({
    id: `P-${w.n}`,
    n: w.n,
    name: w.name,
    covers: [w.id],
    requires: w.requires.map((r) => r.replace("WS-", "P-")),
    requiresText: w.requiresText.replace(/WS-(\d+)/g, "P-$1"),
  }));
}

/** `[]` or `[P-1, P-2]`. */
export const requiresList = (p: Plan) => `[${p.requires.join(", ")}]`;

/** `WS-1 (Data model), WS-2 (API)`: a plan's covered workstreams with their names. */
export function coversList(p: Plan, ws: Workstream[]): string {
  return p.covers
    .map((id) => {
      const name = ws.find((w) => w.id === id)?.name;
      return name === undefined ? id : `${id} (${name})`;
    })
    .join(", ");
}

/**
 * The Step 11 comment: one line per plan with its covered workstreams, the filing
 * line (one issue per plan; a single plan is planned on this issue), then the design
 * doc link.
 */
export function commentBody(
  plans: Plan[],
  ws: Workstream[],
  opts: { ownerRepo: string; month: string; fid: string },
): string {
  const doc = `docs/plans/${opts.month}/${opts.fid}-design.md`;
  const url = `https://github.com/${opts.ownerRepo}/blob/dev/${doc}`;
  const filing =
    plans.length === 1
      ? "One plan covers every workstream: plan it on this issue, no new issue."
      : `Filing one issue per plan: put \`**Parent design:** [${opts.fid}-design.md](${url})\` and \`**Workstreams:** {its Covers ids}\` in its body, and list the plan issues it requires in a blocked-by block (.bkit/trackers.md § Issue shapes).`;
  const lines = [
    GENERATED_MARKER,
    "### Step 11 — Suggested Plans",
    "Advisory only. NEVER auto-trigger.",
    ...plans.map(
      (p) => `- ${p.id}: ${p.name}. Covers: ${coversList(p, ws)}. Requires: ${requiresList(p)}`,
    ),
    filing,
    `[${doc}](${url})`,
  ];
  return stampMarker(lines.join("\n"));
}

const ARTIFACT_FLAG: FlagSpec = {
  name: "artifact",
  type: "string",
  required: true,
  help: "the organised design, docs/plans/{YYYYMM}/logs/{FID}/design-v3-organised.md",
};

function read(ctx: RunContext): { workstreams: Workstream[]; plans: Plan[] } {
  const file = path.resolve(ctx.cwd, String(ctx.flags.artifact));
  if (!fs.existsSync(file)) throw new CommandError(EXIT.USAGE, `--artifact ${file} does not exist`);
  const md = fs.readFileSync(file, "utf-8");
  const workstreams = parseWorkstreams(md);
  if (workstreams.length === 0) {
    throw new CommandError(
      EXIT_NONE,
      `no "### WS-{N}: {NAME}" block under "## Suggested Workstreams" in ${file}`,
    );
  }
  return { workstreams, plans: parsePlans(md) };
}

export const plansCommand: CommandSpec = {
  noun: "plans",
  summary:
    "Parse the organised design's suggested plans and workstreams and build the advisory comment.",
  verbs: {
    parse: {
      summary:
        "List each P-{N} with its name, Covers and Requires; one plan per workstream when the design has no Suggested Plans.",
      use: "by-hand",
      flags: [ARTIFACT_FLAG],
      output: {
        plans: "[{id, n, name, covers, requires, requiresText}] in file order",
        workstreams: "[{id, n, name, requires, requiresText}] in file order",
      },
      exitCodes: { [EXIT_NONE]: "no workstream parsed (Failure Path)" },
      run: (ctx) => {
        const { workstreams, plans } = read(ctx);
        ctx.emit({ plans, workstreams });
        return EXIT.OK;
      },
    },
    comment: {
      summary:
        "The Step 11 comment body for the feature's own issue (posted via MCP by the workflow).",
      use: "workflow",
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
        plans: "the parsed plans",
      },
      exitCodes: { [EXIT_NONE]: "no workstream parsed (Failure Path)" },
      run: (ctx) => {
        const { workstreams, plans } = read(ctx);
        const body = commentBody(plans, workstreams, {
          ownerRepo: String(ctx.flags.ownerRepo),
          month: String(ctx.flags.month),
          fid: String(ctx.flags.fid),
        });
        ctx.emit({ comment: body, commentFile: commentFileOf(ctx.cwd, body), plans });
        return EXIT.OK;
      },
    },
  },
};
