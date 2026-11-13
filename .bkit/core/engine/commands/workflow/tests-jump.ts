// commands/workflow/tests-jump.ts — `bkit tests jump <run>`: move one waiting run to the front
// of the tests line.
//
// The verb writes a `<ms>.jump` marker into `tests.queue` beside the lock file, holding the
// `<who> — <checkout>` line of the run. The lock's waiting helpers sort a ticket carrying that
// line first and delete the marker once the run has the lock. The verb never touches the lock,
// the holder file or a slot file, so the current holder keeps the lock.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { CommandError, EXIT, type VerbSpec } from "../lib.js";

/** The `tests` lock's queue folder: `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/tests.queue`. */
function testsQueueDir(): string {
  const cache = process.env.XDG_CACHE_HOME || path.join(process.env.HOME || os.homedir(), ".cache");
  return path.join(cache, "bkit", "machine-lock", "tests.queue");
}

/** First line of a file, or null when it cannot be read or is empty. */
function firstLine(file: string): string | null {
  if (!fs.existsSync(file)) return null;
  const line = fs.readFileSync(file, "utf-8").split("\n")[0]!;
  return line === "" ? null : line;
}

/** The distinct lines of tickets and held places in `queue` whose run name is `run`. */
function linesFor(queue: string, run: string): string[] {
  if (!fs.existsSync(queue)) return [];
  const names = fs.readdirSync(queue);
  const lines = new Set<string>();
  for (const name of names) {
    if (!/^\d+\.\d{6}-\d+(\.held)?$/.test(name)) continue;
    const line = firstLine(path.join(queue, name));
    if (line?.startsWith(`${run} — `)) lines.add(line);
  }
  return [...lines].sort();
}

export const testsJumpVerb: VerbSpec = {
  summary:
    "Move the waiting run named <run> to the front of the tests line; the holder keeps the lock. Every use needs the human's approval, so ask them to approve it; exit 0 moved, 1 no single run matched.",
  use: "by-hand",
  flags: [
    {
      name: "run",
      type: "string",
      positional: true,
      required: true,
      help: "the waiting run's name, as the waiting note prints it",
    },
    {
      name: "checkout",
      type: "string",
      help: "the waiting run's checkout path, to pick one when several runs share the name",
    },
  ],
  output: {
    run: "the run name moved to the front",
    checkout: "the checkout path of the run moved",
    marker: "the jump marker file written",
  },
  run: (ctx) => {
    const run = String(ctx.flags.run);
    const wanted = typeof ctx.flags.checkout === "string" ? ctx.flags.checkout : undefined;
    const queue = testsQueueDir();
    let matches = linesFor(queue, run);
    if (wanted !== undefined) matches = matches.filter((line) => line === `${run} — ${wanted}`);
    if (matches.length === 0) {
      throw new CommandError(EXIT.NO, `no run named ${run} waits for tests`);
    }
    if (matches.length > 1) {
      throw new CommandError(
        EXIT.NO,
        `several runs named ${run} wait for tests:\n${matches.map((line) => `  ${line}`).join("\n")}\npass --checkout <path> to pick one`,
      );
    }
    const line = matches[0]!;
    const marker = path.join(queue, `${Date.now()}.jump`);
    const temp = path.join(queue, `.jump.${process.pid}.tmp`);
    fs.writeFileSync(temp, `${line}\n`);
    fs.renameSync(temp, marker);
    ctx.log(`${run} moves to the front of the tests line`);
    ctx.emit({ run, checkout: line.slice(`${run} — `.length), marker });
    return EXIT.OK;
  },
};
