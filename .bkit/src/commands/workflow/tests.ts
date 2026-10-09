// bkit tests run — run the deepest declared local gate, save its full output,
// and report the verdict.
//
// Candidates come in priority order, deepest first: the first one `package.json`
// declares is run, so a shallower gate never wins while a deeper one exists (the
// order is the contract). Nothing declared is its own exit code, never an empty
// command that exits 0 and reads as a clean run. A gate that exits 126 / 127 never
// ran (not executable / not found), so it is not a failing test either: recording
// it as FAIL sends a debug loop chasing tests that never executed.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { CommandError, EXIT, git, type CommandSpec } from "../lib.js";
import { readPackageJson } from "../shared/package-json.js";
import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../shared/package-manager.js";
import { str } from "./status.js";

/** Exit code: no candidate gate is declared in package.json. */
export const EXIT_NO_GATE = 3;
/** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
export const EXIT_COULD_NOT_RUN = 4;

const DEFAULT_TAIL = 40;

const NO_GATE_HINT =
  "declare a bkit:gate:* script in package.json that runs your stack's checks " +
  "(.bkit/workflows.md § Local gate scripts lists the names and what each covers)";

/**
 * The first candidate `package.json` declares as a non-empty script, or null.
 * An empty script runs nothing and exits 0, which is the false green this guards.
 */
export function resolveGate(dir: string, candidates: readonly string[]): string | null {
  const read = readPackageJson(dir);
  const scripts = read.ok ? read.pkg.scripts : undefined;
  if (typeof scripts !== "object" || scripts === null) return null;
  const declared = scripts as Record<string, unknown>;
  return (
    candidates.find((g) => {
      const body = declared[g];
      return typeof body === "string" && body.trim() !== "";
    }) ?? null
  );
}

/** The scope string the status rows record: the package runner plus the script name. */
export const gateScope = (gate: string) => scriptCommand(gate).join(" ");

/**
 * Run argv with stdout and stderr interleaved into `log` (like `> log 2>&1`).
 * Exit 127 when the binary is missing; 128 + n when killed by signal n.
 */
export function runToLog(argv: string[], cwd: string, log: string): number {
  fs.mkdirSync(path.dirname(log), { recursive: true });
  const fd = fs.openSync(log, "w");
  const res = spawnSync(argv[0]!, argv.slice(1), { cwd, stdio: ["ignore", fd, fd] });
  fs.closeSync(fd);
  if (res.error) {
    fs.appendFileSync(log, `${argv[0]}: not found on PATH (${res.error.message})\n`);
    return 127;
  }
  if (res.status !== null) return res.status;
  return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
}

const tailLines = (file: string, n: number) =>
  fs.readFileSync(file, "utf-8").replace(/\n$/, "").split("\n").slice(-n);

export const testsCommand: CommandSpec = {
  noun: "tests",
  summary: "Run the deepest declared local gate, save its full output, and report the verdict.",
  verbs: {
    run: {
      summary: "Run the first declared --gate; exit 0 PASS, 1 FAIL, 4 could not run.",
      flags: [
        {
          name: "gate",
          type: "string",
          required: true,
          repeatable: true,
          help: "candidate package.json script, deepest first; the first declared one runs",
        },
        {
          name: "log",
          type: "string",
          required: true,
          help: "file the full test output is saved to (directories are created)",
        },
        {
          name: "tail",
          type: "string",
          help: `lines of the log echoed to stderr afterwards (default ${DEFAULT_TAIL}; 0 for none)`,
        },
      ],
      output: {
        verdict: "PASS | FAIL (null when the gate could not run)",
        exitCode: "the gate's exit code",
        gate: "the script that ran",
        scope: "the command that ran, as status rows record it",
        failures: "0 on PASS; null otherwise — count failing suites from the log",
        log: "where the full output was saved (as given)",
        logBytes: "size of the saved output",
      },
      exitCodes: {
        [EXIT_NO_GATE]: "no candidate gate is declared in package.json",
        [EXIT_COULD_NOT_RUN]: "the gate could not run (exit 126 / 127): not a test failure",
      },
      run: (ctx) => {
        const candidates = ctx.flags.gate as string[];
        const logArg = String(ctx.flags.log);
        if (logArg === "") throw new CommandError(EXIT.USAGE, "--log must be non-empty");
        const tailRaw = str(ctx.flags.tail) ?? String(DEFAULT_TAIL);
        if (!/^[0-9]+$/.test(tailRaw)) {
          throw new CommandError(
            EXIT.USAGE,
            `--tail must be a non-negative integer, got "${tailRaw}"`,
          );
        }
        // Gates are declared and run at the top of the checkout being tested (the
        // feature worktree), wherever in it the caller happens to stand.
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        const gate = resolveGate(top, candidates);
        if (gate === null) {
          const read = readPackageJson(top);
          if (!read.ok) ctx.log(`package.json at ${top} is ${read.reason}`);
          ctx.log(
            `no bkit:gate:* script declared (looked for ${candidates.join(", ")}) — ${NO_GATE_HINT}`,
          );
          return EXIT_NO_GATE;
        }
        const scope = gateScope(gate);
        const log = path.resolve(ctx.cwd, logArg);
        ctx.log(`running ${scope} — full output in ${logArg}`);
        const exitCode = runToLog(scriptCommand(gate), top, log);
        for (const line of Number(tailRaw) > 0 ? tailLines(log, Number(tailRaw)) : [])
          ctx.log(line);
        const couldNotRun = COULD_NOT_RUN_EXIT_CODES.has(exitCode);
        const verdict = couldNotRun ? null : exitCode === 0 ? "PASS" : "FAIL";
        ctx.emit({
          verdict,
          exitCode,
          gate,
          scope,
          failures: verdict === "PASS" ? 0 : null,
          log: logArg,
          logBytes: fs.statSync(log).size,
        });
        if (couldNotRun) {
          ctx.log(
            `${scope} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`,
          );
          return EXIT_COULD_NOT_RUN;
        }
        ctx.log(`verdict ${verdict} (exit ${exitCode})`);
        return verdict === "PASS" ? EXIT.OK : EXIT.NO;
      },
    },
  },
};
