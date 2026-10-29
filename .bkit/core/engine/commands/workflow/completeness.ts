// bkit completeness check — report whether a run recorded every step and journaled every command its workflow requires.

import * as fs from "node:fs";
import * as path from "node:path";

import {
  deriveContract,
  inferWorkflows,
  parseRows,
  readCompleteness,
  type CompletenessVerdict,
  type StatusRow,
} from "../../checks/status-holes.js";
import { getWorkflowsRoot } from "../../shared/package-roots.js";
import { EXIT, type CommandSpec } from "../lib.js";
import { readIssueTracker } from "./fids.js";
import { FILE_FLAG, WORKFLOW_FLAG, statusFile } from "./status.js";

const TAG = "[bkit-status-holes]";

const readText = (file: string, log: (message: string) => void): string | null => {
  try {
    return fs.readFileSync(file, "utf-8");
  } catch (err) {
    log(`${TAG} ${file} not readable: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
};

/** `workflow`'s rows split into runs: each `workflow-started` opens a run that ends at the next one; rows before the first start form their own run. */
function runsOf(rows: StatusRow[], workflow: string): StatusRow[][] {
  const at = (r: StatusRow) => (typeof r["at"] === "string" ? r["at"] : "");
  const own = rows
    .filter((r) => r.workflow === workflow)
    .sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0));
  const runs: StatusRow[][] = [];
  for (const row of own) {
    const current = runs.at(-1);
    if (current === undefined || row.type === "workflow-started") runs.push([row]);
    else current.push(row);
  }
  return runs;
}

function reportLines(v: CompletenessVerdict): string[] {
  const calls = (list: Array<{ noun: string; verb: string }>) =>
    list.map((c) => `${c.noun} ${c.verb}`).join(", ");
  const lines = [
    `${TAG} ADVISORY — ${v.workflow}: ${v.verdict} (${v.observed.steps} step(s), ${v.observed.calls} call(s) observed)`,
  ];
  if (v.preJournal) lines.push("  pre-journal run: command evidence not available");
  if (v.stepHoles.length > 0) lines.push(`  step holes: ${v.stepHoles.join(", ")}`);
  for (const h of v.evidenceHoles)
    lines.push(`  evidence hole: ${h.step} lacks ${calls(h.missing)}`);
  if (v.unexercised.length > 0)
    lines.push(`  unexercised arms: ${v.unexercised.length} (not holes)`);
  return lines;
}

export const completenessCommand: CommandSpec = {
  noun: "completeness",
  summary: "Check a run for missing steps and missing bkit commands.",
  verbs: {
    check: {
      summary:
        "Report the steps and bkit commands a run is missing, from its status.jsonl and the workflow markdown; advisory, always exits 0.",
      use: "by-hand",
      flags: [
        FILE_FLAG,
        {
          ...WORKFLOW_FLAG,
          required: false,
          help: "workflow name: design, plan, build, debug, ship; absent = each workflow the file holds rows of",
        },
      ],
      output: {
        report: "the human-readable report",
        holey: "true when any checked run has an evidence hole or a step hole",
        verdicts: "one completeness verdict per checked workflow; empty when nothing could be read",
      },
      run: (ctx) => {
        const file = statusFile(ctx);
        const text = readText(file, ctx.log);
        if (text === null) {
          ctx.emit({ report: `${TAG} no status.jsonl to check`, holey: false, verdicts: [] });
          return EXIT.OK;
        }
        const rows = parseRows(text);
        const given = typeof ctx.flags.workflow === "string" ? ctx.flags.workflow : undefined;
        const workflows = given === undefined ? inferWorkflows(rows) : [given];
        const tracker = readIssueTracker(ctx.cwd);
        const verdicts: CompletenessVerdict[] = [];
        const lines: string[] = [];
        for (const workflow of workflows) {
          const md = readText(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), ctx.log);
          if (md === null) {
            ctx.log(`${TAG} bkit-${workflow}.md not readable — skipping ${workflow} (advisory)`);
            continue;
          }
          try {
            const contract = deriveContract(md, workflow, tracker);
            for (const run of runsOf(rows, workflow)) {
              const { verdict } = readCompleteness(run, contract);
              verdicts.push(verdict);
              lines.push(...reportLines(verdict));
            }
          } catch (err) {
            ctx.log(
              `${TAG} ${workflow}: ${err instanceof Error ? err.message : String(err)} — no verdict (advisory)`,
            );
          }
        }
        if (lines.length === 0) lines.push(`${TAG} no verdict`);
        ctx.emit({
          report: lines.join("\n"),
          holey: verdicts.some((v) => v.holey),
          verdicts,
        });
        return EXIT.OK;
      },
    },
  },
};
