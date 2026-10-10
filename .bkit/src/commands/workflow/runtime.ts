// bkit runtime detect|assert|row — which runtime this is, and what it may do.
//
// Four runtimes behave differently: a laptop, a GitHub Actions runner, a Cursor
// Cloud Agent, and a claude.ai cloud session. Detection maps env markers to a
// conservative DEFAULT capability table; only `runtimeGithubCli` is probed live
// (`gh auth status`). `runtimeDevPushes` is never probed: `git push --dry-run` sends
// no ref update, so a protected branch's hook never fires.
//
// Each command run is its own process, so nothing survives between workflow
// blocks. The durable record is the `runtime-resolved` row `row` writes once per
// run; later steps read it back with `assert` instead of re-probing.
//
// Detection, first match wins:
//   BKIT_RUNTIME=<enum>                    explicit override (invalid -> UNKNOWN)
//   <repo root>/.bkit/.runtime-cursor      CLOUD_CURSOR
//   any primitive neither truthy nor falsy UNKNOWN, least-capable, loud
//   CLAUDE_CODE_REMOTE truthy              CLOUD_CLAUDE
//   GITHUB_ACTIONS or CI truthy            GITHUB_ACTION
//   otherwise                              LOCAL

import * as fs from "node:fs";
import * as path from "node:path";

import { statusTimestamp } from "../../bkit-status.js";
import { CommandError, EXIT, repoRoot, runTool, type CommandSpec, type FlagSpec } from "../lib.js";
import {
  EXIT_NO_STATUS,
  FILE_FLAG,
  WORKFLOW_FLAG,
  readStatusEvents,
  statusFile,
  str,
} from "./status.js";

export const RUNTIMES = [
  "LOCAL",
  "GITHUB_ACTION",
  "CLOUD_CLAUDE",
  "CLOUD_CURSOR",
  "UNKNOWN",
] as const;
export type Runtime = (typeof RUNTIMES)[number];

/** Exit code: status.jsonl has no `runtime-resolved` row (for --workflow, when given). */
export const EXIT_NO_RUNTIME_ROW = 4;
/** Exit code: the latest `runtime-resolved` row has a field that is not a valid literal. */
export const EXIT_UNRESOLVED = 5;

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/**
 * One detection primitive as true / false / ambiguous. Unset and an explicit
 * falsy literal (e.g. `CI=false`) both mean "not this runtime".
 */
export function normFlag(value: string | undefined): "true" | "false" | "ambiguous" {
  if (["true", "TRUE", "True", "1", "yes", "YES"].includes(value ?? "")) return "true";
  if (["", "false", "FALSE", "False", "0", "no", "NO"].includes(value ?? "")) return "false";
  return "ambiguous";
}

export interface RuntimeTable {
  runtime: Runtime;
  runtimeWorktrees: boolean;
  runtimeDevPushes: boolean;
  runtimeGithubCli: boolean;
  runtimeGithubCliExit: number;
  runtimeGithubCliErr: string;
}

/** Classify the runtime from `env` and the repo root's Cursor marker. */
export function classify(env: NodeJS.ProcessEnv, root: string, log: (m: string) => void): Runtime {
  const override = env.BKIT_RUNTIME ?? "";
  if (override !== "") {
    if ((RUNTIMES as readonly string[]).includes(override)) return override as Runtime;
    log(
      `BKIT_RUNTIME='${override}' is not a valid runtime (${RUNTIMES.join(" | ")}) — defaulting runtime=UNKNOWN, least-capable`,
    );
    return "UNKNOWN";
  }
  // Cursor exposes "background agent" only on its sessionStart hook's stdin, so
  // its preflight hook drops this gitignored marker; a Cursor VM is a fresh clone.
  if (fs.existsSync(path.join(root, ".bkit", ".runtime-cursor"))) return "CLOUD_CURSOR";
  const cloud = normFlag(env.CLAUDE_CODE_REMOTE);
  const gha = normFlag(env.GITHUB_ACTIONS);
  const ci = normFlag(env.CI);
  if ([cloud, gha, ci].includes("ambiguous")) {
    log(
      `ambiguous detection primitives (CLAUDE_CODE_REMOTE='${env.CLAUDE_CODE_REMOTE ?? ""}' GITHUB_ACTIONS='${env.GITHUB_ACTIONS ?? ""}' CI='${env.CI ?? ""}') — defaulting runtime=UNKNOWN, least-capable`,
    );
    return "UNKNOWN";
  }
  if (cloud === "true") return "CLOUD_CLAUDE";
  if (gha === "true" || ci === "true") return "GITHUB_ACTION";
  return "LOCAL";
}

/**
 * Default capabilities per runtime. CLOUD_CURSOR matches GITHUB_ACTION on
 * purpose (isolated VM, real git, mints and pushes its own branch); a claude.ai
 * session's proxy only lets it push the current branch, so it gets neither.
 */
const capable = (runtime: Runtime) =>
  runtime === "LOCAL" || runtime === "GITHUB_ACTION" || runtime === "CLOUD_CURSOR";

/** The full table: classification, default capabilities, and the one live gh probe. */
export function detect(cwd: string, root: string, log: (m: string) => void): RuntimeTable {
  const runtime = classify(process.env, root, log);
  const gh = runTool("gh", ["auth", "status"], cwd);
  const lines = gh.stderr.split("\n").filter((l) => l.trim() !== "");
  const err = gh.found ? (lines[lines.length - 1] ?? "") : gh.stderr;
  const ok = gh.status === 0;
  if (!ok) log(`gh-preflight: runtimeGithubCli=false (exit=${gh.status} err='${err}')`);
  return {
    runtime,
    runtimeWorktrees: capable(runtime),
    runtimeDevPushes: capable(runtime),
    runtimeGithubCli: ok,
    runtimeGithubCliExit: gh.status,
    runtimeGithubCliErr: err,
  };
}

/** Where the feature's work happens: a minted worktree, or the checkout itself (adopt). */
export const worktreePath = (root: string, fid: string, worktrees: boolean) =>
  worktrees ? path.join(root, ".worktrees", fid) : root;

/** The `runtime-resolved` status.jsonl row. */
export function runtimeRow(
  table: RuntimeTable,
  opts: { workflow: string; at: string; baseSha: string },
): Record<string, unknown> {
  return {
    type: "runtime-resolved",
    workflow: opts.workflow,
    at: opts.at,
    runtime: table.runtime,
    runtimeWorktrees: table.runtimeWorktrees,
    runtimeDevPushes: table.runtimeDevPushes,
    runtimeGithubCli: table.runtimeGithubCli,
    runtimeGithubCliExit: table.runtimeGithubCliExit,
    runtimeGithubCliErr: table.runtimeGithubCliErr,
    baseSha: opts.baseSha,
  };
}

/** Every field of a read-back row that is not a valid literal; empty = resolved. */
export function unresolvedFields(row: Record<string, unknown>): string[] {
  const bad: string[] = [];
  if (!(RUNTIMES as readonly unknown[]).includes(row.runtime)) bad.push("runtime");
  for (const key of ["runtimeWorktrees", "runtimeDevPushes", "runtimeGithubCli"]) {
    if (typeof row[key] !== "boolean") bad.push(key);
  }
  return bad;
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

const TABLE_OUTPUT = {
  runtime: RUNTIMES.join(" | "),
  runtimeWorktrees: "may mint git worktrees (default per runtime)",
  runtimeDevPushes: "may push dev (a default, never probed)",
  runtimeGithubCli: "gh auth status succeeded",
  runtimeGithubCliExit: "gh auth status exit code (127 when gh is not on PATH)",
  runtimeGithubCliErr: "last non-empty line of gh auth status stderr",
};

const FID_FLAG: FlagSpec = {
  name: "fid",
  type: "string",
  required: true,
  help: "feature id, for worktreePath",
};

export const runtimeCommand: CommandSpec = {
  noun: "runtime",
  summary:
    "Detect the runtime and its default capabilities; write and read the runtime-resolved row.",
  verbs: {
    detect: {
      summary: "Classify the runtime, its default capabilities, gh auth, and the worktree path.",
      flags: [FID_FLAG],
      output: {
        ...TABLE_OUTPUT,
        worktreePath: "<repo root>/.worktrees/<fid> when worktrees are allowed, else the repo root",
      },
      run: (ctx) => {
        const root = repoRoot(ctx.cwd);
        const table = detect(ctx.cwd, root, ctx.log);
        ctx.emit({
          ...table,
          worktreePath: worktreePath(root, String(ctx.flags.fid), table.runtimeWorktrees),
        });
        return EXIT.OK;
      },
    },
    row: {
      summary: "Detect, then build the runtime-resolved row (and append it with --file).",
      flags: [
        WORKFLOW_FLAG,
        { name: "at", type: "string", help: "row timestamp (default: now, UTC whole seconds)" },
        {
          name: "base-sha",
          type: "string",
          help: "merge-base the design/plan worktree branched from (git merge-base origin/dev HEAD)",
        },
        { ...FILE_FLAG, required: false, help: "status.jsonl to append the row to" },
      ],
      output: {
        row: "the runtime-resolved row",
        file: "where it was appended (null without --file)",
      },
      run: (ctx) => {
        const workflow = String(ctx.flags.workflow);
        const at = str(ctx.flags.at) ?? statusTimestamp();
        if (workflow === "" || at === "") {
          throw new CommandError(EXIT.USAGE, "--workflow and --at must be non-empty");
        }
        const root = repoRoot(ctx.cwd);
        const row = runtimeRow(detect(ctx.cwd, root, ctx.log), {
          workflow,
          at,
          baseSha: str(ctx.flags.baseSha) ?? "",
        });
        let file: string | null = null;
        if (ctx.flags.file !== undefined) {
          file = statusFile(ctx);
          if (!fs.existsSync(path.dirname(file))) {
            throw new CommandError(
              EXIT.USAGE,
              `log directory ${path.dirname(file)} does not exist`,
            );
          }
          fs.appendFileSync(file, `${JSON.stringify(row)}\n`);
        }
        ctx.emit({ row, file });
        return EXIT.OK;
      },
    },
    assert: {
      summary: "Read back the latest runtime-resolved row and fail unless every field is resolved.",
      flags: [
        FILE_FLAG,
        { ...WORKFLOW_FLAG, required: false, help: "only rows written by this workflow" },
      ],
      output: {
        ...TABLE_OUTPUT,
        baseSha: "the row's baseSha (empty when the caller set none)",
        workflow: "workflow that wrote the row",
        at: "when the row was written",
      },
      exitCodes: {
        [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON",
        [EXIT_NO_RUNTIME_ROW]: "no runtime-resolved row (for --workflow, when given)",
        [EXIT_UNRESOLVED]: "the latest row has a field that is not a valid literal",
      },
      run: (ctx) => {
        const workflow = str(ctx.flags.workflow);
        const events: ReadonlyArray<Record<string, unknown>> = readStatusEvents(statusFile(ctx));
        const rows = events
          .filter((r) => r.type === "runtime-resolved")
          .filter((r) => workflow === undefined || r.workflow === workflow);
        const row = rows[rows.length - 1];
        if (!row) {
          ctx.log(
            `no runtime-resolved row${workflow ? ` for ${workflow}` : ""} — Step 1 never recorded the runtime`,
          );
          return EXIT_NO_RUNTIME_ROW;
        }
        const bad = unresolvedFields(row);
        if (bad.length > 0) {
          for (const key of bad) {
            ctx.log(
              `${key} is UNRESOLVED (got ${JSON.stringify(row[key] ?? "")}) — never default it`,
            );
          }
          return EXIT_UNRESOLVED;
        }
        ctx.emit({
          runtime: row.runtime,
          runtimeWorktrees: row.runtimeWorktrees,
          runtimeDevPushes: row.runtimeDevPushes,
          runtimeGithubCli: row.runtimeGithubCli,
          runtimeGithubCliExit:
            typeof row.runtimeGithubCliExit === "number" ? row.runtimeGithubCliExit : null,
          runtimeGithubCliErr:
            typeof row.runtimeGithubCliErr === "string" ? row.runtimeGithubCliErr : "",
          baseSha: typeof row.baseSha === "string" ? row.baseSha : "",
          workflow: row.workflow ?? null,
          at: row.at ?? null,
        });
        return EXIT.OK;
      },
    },
  },
};
