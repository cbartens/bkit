// commands/workflow/tests-changed.ts — `bkit tests changed`: check only what a step changed.
//
// An agent step runs its gate after every change. This verb computes the files the step
// changed and hands them to the consumer's `bkit:gate:changed`, which runs the tests that
// import them, the tests that name their paths and static checks on them. Undeclared →
// the --fallback whole gate runs, exactly as before the script existed.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { BKIT_GATE_CHANGED_SCRIPT } from "../../install/manifest.js";
import {
  classifyLockExit,
  CommandError,
  EXIT,
  git,
  testsLockHolder,
  wholeNumber,
  type VerbSpec,
} from "../lib.js";
import { readPackageJson } from "../../shared/package-json.js";
import {
  COULD_NOT_RUN_EXIT_CODES,
  scriptCommand,
  testCommand,
} from "../../shared/package-manager.js";

/** Exit code: neither `bkit:gate:changed` nor the --fallback gate is declared. */
const EXIT_NO_GATE = 3;
/** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
const EXIT_COULD_NOT_RUN = 4;

/**
 * Files changed since `base`, repo-relative and sorted: uncommitted (staged or not),
 * untracked and not ignored, plus every file a commit after `base` touched. A file
 * missing from the working tree (deleted) is left out: there is nothing to check.
 */
export function changedFiles(top: string, base: string): string[] {
  const list = (args: string[]) => (git(top, args) ?? "").split("\0").filter(Boolean);
  const all = new Set([
    ...list(["diff", "--name-only", "--no-renames", "-z", "HEAD"]),
    ...list(["ls-files", "--others", "--exclude-standard", "-z"]),
    ...list(["diff", "--name-only", "--no-renames", "-z", `${base}...HEAD`]),
  ]);
  return [...all].filter((f) => fs.existsSync(path.join(top, f))).sort();
}

/** Whether `dir/package.json` declares `name` as a non-empty script. */
function declares(dir: string, name: string): boolean {
  const read = readPackageJson(dir);
  const scripts = read.ok ? read.pkg.scripts : undefined;
  if (typeof scripts !== "object" || scripts === null) return false;
  const body = (scripts as Record<string, unknown>)[name];
  return typeof body === "string" && body.trim() !== "";
}

/**
 * Run argv in `cwd` with stdout and stderr interleaved, each output line passed to `log`.
 * Exit 127 when the binary is missing; 128 + n when killed by signal n.
 */
function runLogged(
  argv: string[],
  cwd: string,
  log: (line: string) => void,
  env: Record<string, string>,
): number {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-changed-"));
  const file = path.join(dir, "out.log");
  try {
    const fd = fs.openSync(file, "w");
    const protectedArgv = testCommand(argv);
    const res = spawnSync(protectedArgv[0]!, protectedArgv.slice(1), {
      cwd,
      stdio: ["ignore", fd, fd],
      env: { ...process.env, ...env },
    });
    fs.closeSync(fd);
    for (const line of fs
      .readFileSync(file, "utf-8")
      .replace(/\r?\n$/, "")
      .split(/\r?\n/))
      if (line !== "") log(line);
    if (res.error) {
      log(`${argv[0]}: not found on PATH (${res.error.message})`);
      return 127;
    }
    if (res.status !== null) return res.status;
    return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export const testsChangedVerb: VerbSpec = {
  summary: `Check only the files changed since --base: run \`${BKIT_GATE_CHANGED_SCRIPT}\` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held.`,
  use: "by-hand",
  flags: [
    {
      name: "lock-wait-s",
      type: "string",
      help: "whole-number lock wait >= 0, passed as LOCAL_STACK_LOCK_WAIT_S (default BKIT_LOCK_WAIT_S, else 60)",
    },
    {
      name: "base",
      type: "string",
      help: "commit the step began on; files committed after it count as changed (default HEAD: uncommitted files only)",
    },
    {
      name: "fallback",
      type: "string",
      help: `gate script run, with no file arguments and whatever changed, when package.json does not declare \`${BKIT_GATE_CHANGED_SCRIPT}\``,
    },
  ],
  output: {
    files: "the changed files, repo-relative and sorted (deleted files left out)",
    gate: `the script that ran (\`${BKIT_GATE_CHANGED_SCRIPT}\` or the --fallback gate), or null when nothing ran`,
    scope: "the command that ran, without the file arguments, or null",
    exitCode: "the gate's exit code, or null when nothing ran",
    verdict: "PASS / FAIL, or null when nothing ran or the gate could not run",
    lockHolder: "tests-lock holder when the wait gave up, else null",
  },
  exitCodes: {
    [EXIT_NO_GATE]: `neither \`${BKIT_GATE_CHANGED_SCRIPT}\` nor the --fallback gate is declared in package.json`,
    [EXIT_COULD_NOT_RUN]: "the gate could not run (exit 126 / 127): not a test failure",
  },
  run: (ctx) => {
    const waitSource = ctx.flags.lockWaitS ?? process.env.BKIT_LOCK_WAIT_S;
    const waitS = wholeNumber(
      waitSource,
      ctx.flags.lockWaitS === undefined && process.env.BKIT_LOCK_WAIT_S !== undefined
        ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
        : "lock-wait-s",
      60,
    );
    const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
    const base = typeof ctx.flags.base === "string" ? ctx.flags.base : "HEAD";
    if (git(top, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
      throw new CommandError(EXIT.USAGE, `--base ${base} names no commit`);
    const fallback = typeof ctx.flags.fallback === "string" ? ctx.flags.fallback : undefined;
    const files = changedFiles(top, base);
    ctx.log(
      files.length === 0
        ? "no changed files"
        : `${files.length} changed file(s): ${files.join(" ")}`,
    );
    let gate: string;
    let argv: string[];
    if (declares(top, BKIT_GATE_CHANGED_SCRIPT)) {
      if (files.length === 0) {
        ctx.emit({
          files,
          gate: null,
          scope: null,
          exitCode: null,
          verdict: null,
          lockHolder: null,
        });
        return EXIT.OK;
      }
      gate = BKIT_GATE_CHANGED_SCRIPT;
      argv = [...scriptCommand(gate), ...files];
    } else if (fallback !== undefined && declares(top, fallback)) {
      ctx.log(`${BKIT_GATE_CHANGED_SCRIPT} is not declared — running the whole ${fallback} gate`);
      gate = fallback;
      argv = scriptCommand(gate);
    } else {
      ctx.log(
        `neither ${BKIT_GATE_CHANGED_SCRIPT} nor ${fallback ?? "a --fallback gate"} is declared in package.json (.bkit/workflows.md § Local gate scripts)`,
      );
      return EXIT_NO_GATE;
    }
    const scope = scriptCommand(gate).join(" ");
    ctx.log(`running ${scope}`);
    const who = `bkit tests changed ${gate}`;
    const lines: string[] = [];
    const exitCode = runLogged(
      argv,
      top,
      (line) => {
        lines.push(line);
        ctx.log(line);
      },
      {
        LOCAL_STACK_LOCK_WAIT_S: String(waitS),
        LOCAL_STACK_LOCK_WHO: who,
      },
    );
    const log = lines.join("\n");
    const lockExit = classifyLockExit({ exitCode, log, who });
    const couldNotRun = lockExit === "could-not-run" || COULD_NOT_RUN_EXIT_CODES.has(exitCode);
    const lockWait = lockExit === "lock-wait";
    const verdict = couldNotRun || lockWait ? null : exitCode === 0 ? "PASS" : "FAIL";
    const lockHolder = lockWait ? testsLockHolder(log, who) : null;
    ctx.emit({ files, gate, scope, exitCode, verdict, lockHolder });
    if (lockWait) return EXIT.AGENT_WAIT;
    if (couldNotRun) return EXIT_COULD_NOT_RUN;
    return exitCode === 0 ? EXIT.OK : EXIT.NO;
  },
};
