// bkit steps done|verdict|gate — write a step's status row, read a subagent's
// verdict header, and check the step left everything the gate requires.
//
// `done` captures `parentSha` before committing, writes the row, then commits,
// in that fixed order: the fold's de-dup key includes `parentSha`, so attempt
// counts stay right only if it moves forward after every step. The gate checks
// what `done` wrote, so a step no longer types its own row and then ticks a box
// saying it did.

import * as fs from "node:fs";
import * as path from "node:path";

import { activeDoneSteps, appendLine, statusTimestamp, type Step } from "../../bkit-status.js";
import { getPromptsRoot } from "../../bkit-paths.js";
import { CommandError, EXIT, parseJson, runGit, type CommandSpec, type FlagSpec } from "../lib.js";
import {
  EXIT_NO_STATUS,
  FILE_FLAG,
  STEP_FLAG,
  SUB_PLAN_FLAG,
  WORKFLOW_FLAG,
  positiveInt,
  readRuns,
  statusFile,
  str,
} from "./status.js";

const VERDICT_END = "<!-- verdict:end -->";
const DEFAULT_VERDICTS = ["PASS", "CONCERNS", "FAIL"];
const STRATEGIES = ["STANDARD", "PIVOT", "FINAL"];

/** Exit codes shared by verdict and done. */
export const EXIT_EMPTY = 4;
export const EXIT_PENDING = 5;
export const EXIT_INVALID = 6;
export const EXIT_ARTIFACT = 7;
export const EXIT_COMMIT = 8;

// ---------------------------------------------------------------------------
// Verdict header
// ---------------------------------------------------------------------------

/** Allowed verdicts from a prompt's own `Verdict: A | B | C [note]` output line. */
export function promptVerdicts(agent: string, promptsRoot = getPromptsRoot()): string[] {
  const file = path.join(promptsRoot, `${agent}.md`);
  if (!fs.existsSync(file)) throw new CommandError(EXIT.USAGE, `no prompt ${agent} at ${file}`);
  const line = fs
    .readFileSync(file, "utf-8")
    .split("\n")
    .find((l) => l.startsWith("Verdict: "));
  if (!line) throw new CommandError(EXIT.USAGE, `${agent} declares no Verdict: line`);
  return line
    .slice("Verdict: ".length)
    .replace(/\[.*\]/, "")
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

export type HeaderResult =
  | { ok: true; verdict: string; fields: Record<string, string> }
  | { ok: false; code: number; problem: string };

const PLACEHOLDER = /^(?:\[?PENDING\]?|.*:\s*\[?PENDING\]?\.?)$/;

/**
 * Read an artifact's header — every line above `<!-- verdict:end -->` — as
 * `Key: value` fields. `require` names fields that must be present.
 */
export function readHeader(file: string, allowed: string[], require: string[] = []): HeaderResult {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    return { ok: false, code: EXIT_EMPTY, problem: `${file} is missing or empty` };
  }
  const lines = fs.readFileSync(file, "utf-8").split("\n");
  const end = lines.indexOf(VERDICT_END);
  if (end === -1)
    return { ok: false, code: EXIT_INVALID, problem: `${file} has no ${VERDICT_END} line` };
  const fields: Record<string, string> = {};
  for (const line of lines.slice(0, end)) {
    const m = /^([A-Z][A-Za-z ]*):\s*(.*)$/.exec(line.trim());
    if (m && !(m[1]! in fields)) fields[m[1]!] = m[2]!.trim();
  }
  const pending = Object.entries(fields).filter(([, v]) => /\bPENDING\b/.test(v));
  if (pending.length > 0) {
    return {
      ok: false,
      code: EXIT_PENDING,
      problem: `${file}: ${pending.map(([k]) => k).join(", ")} still PENDING`,
    };
  }
  const verdict = fields.Verdict;
  if (verdict === undefined || !allowed.includes(verdict)) {
    return {
      ok: false,
      code: EXIT_INVALID,
      problem: `${file}: Verdict "${verdict ?? ""}" is not ${allowed.join("|")}`,
    };
  }
  const missing = require.filter((f) => fields[f] === undefined || fields[f] === "");
  if (missing.length > 0)
    return { ok: false, code: EXIT_INVALID, problem: `${file}: missing ${missing.join(", ")}` };
  if (fields.Failures !== undefined && !/^[0-9]+$/.test(fields.Failures)) {
    return {
      ok: false,
      code: EXIT_INVALID,
      problem: `${file}: Failures "${fields.Failures}" is not a non-negative integer`,
    };
  }
  return { ok: true, verdict, fields };
}

/** Lines left as a stub placeholder: a bare `PENDING`, or a field whose whole value is `PENDING`. */
export function placeholderLines(file: string): number[] {
  return fs
    .readFileSync(file, "utf-8")
    .split("\n")
    .flatMap((l, i) => (PLACEHOLDER.test(l.trim()) ? [i + 1] : []));
}

const ALLOWED_FLAGS: FlagSpec[] = [
  {
    name: "agent",
    type: "string",
    help: "subagent name; its prompt's Verdict: line gives the allowed values",
  },
  {
    name: "allowed",
    type: "string",
    help: "allowed verdicts, comma-separated (default PASS,CONCERNS,FAIL)",
  },
];

function allowedVerdicts(flags: Record<string, unknown>): string[] {
  if (flags.agent !== undefined && flags.allowed !== undefined) {
    throw new CommandError(EXIT.USAGE, "give --agent or --allowed, not both");
  }
  if (flags.agent !== undefined) return promptVerdicts(String(flags.agent));
  if (flags.allowed !== undefined)
    return String(flags.allowed)
      .split(",")
      .map((v) => v.trim());
  return DEFAULT_VERDICTS;
}

// ---------------------------------------------------------------------------
// Artifacts and row rules
// ---------------------------------------------------------------------------

/** Problems with an artifact path: missing, empty, or outside the working directory. */
function artifactProblem(cwd: string, rel: string): string | undefined {
  const abs = path.resolve(cwd, rel);
  const inside = path.relative(cwd, abs);
  if (inside.startsWith("..") || path.isAbsolute(inside)) return `${rel} is outside ${cwd}`;
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return `${rel} does not exist`;
  if (fs.statSync(abs).size === 0) return `${rel} is empty`;
  return undefined;
}

/** `failures` agrees with `verdict`: PASS => 0, FAIL => > 0, CONCERNS => >= 0. */
export function failuresProblem(
  verdict: string | undefined,
  failures: number | undefined,
): string | undefined {
  if (failures === undefined || verdict === undefined) return undefined;
  if (verdict === "PASS" && failures !== 0) return `PASS needs failures=0, got ${failures}`;
  if (verdict === "FAIL" && failures <= 0) return `FAIL needs failures>0, got ${failures}`;
  return undefined;
}

/** `--field key=value`: value parsed as JSON when it parses, else kept as a string. */
function extraField(spec: string): [string, unknown] {
  const eq = spec.indexOf("=");
  if (eq <= 0) throw new CommandError(EXIT.USAGE, `--field ${spec}: expected key=value`);
  const key = spec.slice(0, eq);
  const raw = spec.slice(eq + 1);
  if (!/^[a-z][a-zA-Z0-9]*$/.test(key))
    throw new CommandError(EXIT.USAGE, `--field key ${key} is not camelCase`);
  return [key, parseJsonOrString(raw)];
}

/** Not JSON: a plain-text value, kept as written. */
function parseJsonOrString(raw: string): unknown {
  const parsed = parseJson(raw);
  return parsed.ok ? parsed.value : raw;
}

const CORE_ROW_KEYS = new Set([
  "type",
  "workflow",
  "step",
  "status",
  "at",
  "parentSha",
  "artifacts",
  "verdict",
  "attempt",
  "subPlan",
  "failures",
  "strategy",
]);

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export const stepsCommand: CommandSpec = {
  noun: "steps",
  summary: "Write a step's status row, read a verdict header, check a step's gate.",
  verbs: {
    done: {
      summary: "Append a step-done row and commit it (parentSha captured first).",
      flags: [
        { ...FILE_FLAG, help: "path to status.jsonl (created if absent)" },
        WORKFLOW_FLAG,
        STEP_FLAG,
        { name: "status", type: "string", help: "DONE (default) or FAILED" },
        { name: "verdict", type: "string", help: "PASS|CONCERNS|FAIL" },
        {
          name: "failures",
          type: "string",
          help: "non-negative integer; must agree with --verdict",
        },
        {
          name: "attempt",
          type: "string",
          help: "positive integer, or `next` to derive it from the log",
        },
        SUB_PLAN_FLAG,
        { name: "strategy", type: "string", help: "STANDARD|PIVOT|FINAL" },
        {
          name: "artifact",
          type: "string",
          repeatable: true,
          help: "file the step produced, relative to the working directory",
        },
        {
          name: "field",
          type: "string",
          repeatable: true,
          help: "extra row field key=value (value parsed as JSON when it is JSON)",
        },
        {
          name: "parent-sha",
          type: "string",
          help: "commit the step started from (default: HEAD now, before this commit)",
        },
        { name: "commit", type: "string", help: "auto (default: git add -A + commit) or none" },
        { name: "message", type: "string", help: "commit message (required unless --commit=none)" },
      ],
      output: {
        row: "the appended step-done row",
        commit: "the new commit's sha, or null with --commit=none",
      },
      exitCodes: {
        [EXIT_NO_STATUS]: "--attempt=next could not read status.jsonl",
        [EXIT_ARTIFACT]: "an --artifact is missing, empty, or outside the working directory",
        [EXIT_COMMIT]: "the row was written but the commit failed",
      },
      run: (ctx) => {
        const f = ctx.flags;
        const file = statusFile(ctx);
        const workflow = String(f.workflow);
        const step = String(f.step);
        const status = str(f.status) ?? "DONE";
        if (!["DONE", "FAILED"].includes(status))
          throw new CommandError(EXIT.USAGE, "--status must be DONE or FAILED");
        const verdict = str(f.verdict);
        if (verdict !== undefined && !DEFAULT_VERDICTS.includes(verdict)) {
          throw new CommandError(EXIT.USAGE, "--verdict must be PASS|CONCERNS|FAIL");
        }
        const failures =
          f.failures === undefined ? undefined : Number(nonNegative(String(f.failures)));
        const mismatch = failuresProblem(verdict, failures);
        if (mismatch) throw new CommandError(EXIT.USAGE, mismatch);
        const strategy = str(f.strategy);
        if (strategy !== undefined && !STRATEGIES.includes(strategy)) {
          throw new CommandError(EXIT.USAGE, "--strategy must be STANDARD|PIVOT|FINAL");
        }
        const subPlan = positiveInt(f.subPlan, "sub-plan");
        const commit = str(f.commit) ?? "auto";
        if (!["auto", "none"].includes(commit))
          throw new CommandError(EXIT.USAGE, "--commit must be auto or none");
        const message = str(f.message);
        if (commit === "auto" && !message)
          throw new CommandError(EXIT.USAGE, "--message is required unless --commit=none");

        const artifacts = (f.artifact as string[] | undefined) ?? [];
        const bad = artifacts.map((a) => artifactProblem(ctx.cwd, a)).filter(Boolean);
        if (bad.length > 0) throw new CommandError(EXIT_ARTIFACT, bad.join("; "));

        let attempt: number | undefined;
        if (f.attempt === "next") {
          attempt = fs.existsSync(file)
            ? activeDoneSteps(readRuns(file), workflow, { step, subPlan }).length + 1
            : 1;
        } else {
          attempt = positiveInt(f.attempt, "attempt");
        }

        const extras = Object.fromEntries(
          ((f.field as string[] | undefined) ?? []).map(extraField),
        );
        const clash = Object.keys(extras).filter((k) => CORE_ROW_KEYS.has(k));
        if (clash.length > 0)
          throw new CommandError(
            EXIT.USAGE,
            `--field cannot set ${clash.join(", ")}; use its own flag`,
          );

        const parentSha = str(f.parentSha) ?? runGit(ctx.cwd, ["rev-parse", "HEAD"]).stdout;
        if (!/^[0-9a-f]{40}$/.test(parentSha))
          throw new CommandError(EXIT.USAGE, `parentSha "${parentSha}" is not a commit sha`);

        const row = {
          type: "step-done" as const,
          workflow,
          step,
          status: status as Step["status"],
          at: statusTimestamp(),
          parentSha,
          artifacts,
          ...(verdict === undefined ? {} : { verdict: verdict as Step["verdict"] }),
          ...(attempt === undefined ? {} : { attempt }),
          ...(subPlan === undefined ? {} : { subPlan }),
          ...(failures === undefined ? {} : { failures }),
          ...(strategy === undefined ? {} : { strategy: strategy as Step["strategy"] }),
          ...extras,
        };
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.appendFileSync(file, appendLine(row));

        if (commit === "none") {
          ctx.emit({ row, commit: null });
          return EXIT.OK;
        }
        const add = runGit(ctx.cwd, ["add", "-A"]);
        const made = add.ok ? runGit(ctx.cwd, ["commit", "--allow-empty", "-m", message!]) : add;
        if (!made.ok) {
          ctx.log(`row written to ${file} but the commit failed: ${made.stderr || made.stdout}`);
          ctx.emit({ row, commit: null });
          return EXIT_COMMIT;
        }
        ctx.emit({ row, commit: runGit(ctx.cwd, ["rev-parse", "HEAD"]).stdout });
        return EXIT.OK;
      },
    },
    verdict: {
      summary: "Read an artifact's header down to <!-- verdict:end -->.",
      flags: [
        { name: "file", type: "string", required: true, help: "the subagent's artifact" },
        ...ALLOWED_FLAGS,
        {
          name: "field",
          type: "string",
          repeatable: true,
          help: "header field that must be present, e.g. Failures",
        },
      ],
      output: { verdict: "the Verdict value", fields: "every Key: value header field" },
      exitCodes: {
        [EXIT_EMPTY]: "artifact missing or empty",
        [EXIT_PENDING]: "a header field is still PENDING",
        [EXIT_INVALID]:
          "no verdict:end line, Verdict outside the allowed set, or a required field missing — re-prompt the subagent",
      },
      run: (ctx) => {
        const header = readHeader(
          path.resolve(ctx.cwd, String(ctx.flags.file)),
          allowedVerdicts(ctx.flags),
          (ctx.flags.field as string[] | undefined) ?? [],
        );
        if (!header.ok) {
          ctx.log(header.problem);
          return header.code;
        }
        ctx.emit({ verdict: header.verdict, fields: header.fields });
        return EXIT.OK;
      },
    },
    gate: {
      summary: "Mechanical gate checks for one step: artifacts, placeholders, verdict, status row.",
      flags: [
        FILE_FLAG,
        WORKFLOW_FLAG,
        STEP_FLAG,
        SUB_PLAN_FLAG,
        { name: "attempt", type: "string", help: "the row must carry this attempt" },
        {
          name: "artifact",
          type: "string",
          repeatable: true,
          help: "artifact the step must have produced",
        },
        {
          name: "verdict-required",
          type: "boolean",
          help: "the artifact header and the row must carry a valid verdict",
        },
        ...ALLOWED_FLAGS,
      ],
      output: { pass: "true when every check passed", checks: "[{check, ok, detail}] per check" },
      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
      run: (ctx) => {
        const f = ctx.flags;
        const checks: Array<{ check: string; ok: boolean; detail: string }> = [];
        const add = (check: string, problem: string | undefined, okDetail: string) =>
          checks.push({ check, ok: problem === undefined, detail: problem ?? okDetail });
        const artifacts = (f.artifact as string[] | undefined) ?? [];
        const verdictRequired = f.verdictRequired === true;
        const allowed = allowedVerdicts(f);

        for (const a of artifacts) {
          const problem = artifactProblem(ctx.cwd, a);
          add(`artifact ${a}`, problem, "present and non-empty");
          if (problem) continue;
          const left = placeholderLines(path.resolve(ctx.cwd, a));
          add(
            `placeholders ${a}`,
            left.length ? `PENDING left on line(s) ${left.join(", ")}` : undefined,
            "none left",
          );
        }

        let headerVerdict: string | undefined;
        if (verdictRequired) {
          const verdictFile = artifacts[0];
          if (verdictFile === undefined) {
            add("verdict", "--verdict-required needs an --artifact to read it from", "");
          } else {
            const header = readHeader(path.resolve(ctx.cwd, verdictFile), allowed);
            headerVerdict = header.ok ? header.verdict : undefined;
            add(
              `verdict ${verdictFile}`,
              header.ok ? undefined : header.problem,
              `Verdict: ${header.ok ? header.verdict : ""}`,
            );
          }
        }

        const subPlan = positiveInt(f.subPlan, "sub-plan");
        const attempt = positiveInt(f.attempt, "attempt");
        const rows = activeDoneSteps(readRuns(statusFile(ctx)), String(f.workflow), {
          step: String(f.step),
          subPlan,
        });
        const row = rows.filter((r) => attempt === undefined || r.attempt === attempt).at(-1);
        const rowProblems: string[] = [];
        if (!row) {
          rowProblems.push(
            `no DONE ${String(f.step)} row in the active run${attempt ? ` with attempt ${attempt}` : ""}`,
          );
        } else {
          if (!/^[0-9a-f]{40}$/.test(row.parentSha ?? ""))
            rowProblems.push(`parentSha "${row.parentSha ?? ""}" is not a sha`);
          const recorded = new Set((row.artifacts ?? []).map((a) => path.normalize(a)));
          for (const a of artifacts)
            if (!recorded.has(path.normalize(a))) rowProblems.push(`row does not list ${a}`);
          const mismatch = failuresProblem(row.verdict, row.failures);
          if (mismatch) rowProblems.push(mismatch);
          if (verdictRequired && !allowed.includes(String(row.verdict))) {
            rowProblems.push(
              `row verdict "${String(row.verdict ?? "")}" is not ${allowed.join("|")}`,
            );
          }
          if (verdictRequired && headerVerdict !== undefined && row.verdict !== headerVerdict) {
            rowProblems.push(
              `row verdict ${String(row.verdict)} differs from the artifact's ${headerVerdict}`,
            );
          }
        }
        add(
          "status row",
          rowProblems.length ? rowProblems.join("; ") : undefined,
          `at ${row?.at ?? ""}`,
        );

        const pass = checks.every((c) => c.ok);
        for (const c of checks.filter((x) => !x.ok)) ctx.log(`${c.check}: ${c.detail}`);
        ctx.emit({ pass, checks });
        return pass ? EXIT.OK : EXIT.NO;
      },
    },
  },
};

function nonNegative(s: string): string {
  if (!/^[0-9]+$/.test(s))
    throw new CommandError(EXIT.USAGE, `--failures must be a non-negative integer, got "${s}"`);
  return s;
}
