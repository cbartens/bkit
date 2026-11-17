// vitest.process-group.ts — starts a test's long-running child in its own process group and
// stops the whole group in cleanup.
//
// bkit-only (not shipped). Killing only the direct child leaves its own children running: a
// machine-lock holder's background perl process notices its caller died and then writes into
// the test's cache folder, so an `afterEach` that removes that folder fails with ENOTEMPTY.
import {
  type ChildProcess,
  type ChildProcessByStdio,
  spawn,
  type SpawnOptions,
  type SpawnOptionsWithStdioTuple,
  type StdioNull,
  type StdioPipe,
} from "node:child_process";
import type { Readable } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";

/** `spawn` with `detached: true`, so the child leads a process group that `stopGroup` can end. */
export function spawnGroup(
  command: string,
  args: string[],
  opts: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>,
): ChildProcessByStdio<null, Readable, Readable>;
export function spawnGroup(command: string, args: string[], opts: SpawnOptions): ChildProcess;
export function spawnGroup(command: string, args: string[], opts: SpawnOptions): ChildProcess {
  return spawn(command, args, { ...opts, detached: true });
}

/** Sends `signal` to the group; false when no running process is left in it. */
function signalGroup(pgid: number, signal: NodeJS.Signals | 0): boolean {
  try {
    process.kill(-pgid, signal);
    return true;
  } catch (err) {
    // ESRCH: the group is gone. EPERM on macOS: only zombies are left.
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ESRCH" || code === "EPERM") return false;
    throw err;
  }
}

/** SIGKILLs the child's whole process group, then waits for the child and the group to be gone. */
export async function stopGroup(child: ChildProcess): Promise<void> {
  const exited =
    child.exitCode !== null || child.signalCode !== null
      ? Promise.resolve()
      : new Promise<void>((resolve) => child.once("exit", () => resolve()));
  const pgid = child.pid!;
  signalGroup(pgid, "SIGKILL");
  await exited;
  const until = Date.now() + 5_000;
  while (signalGroup(pgid, 0)) {
    if (Date.now() >= until) throw new Error(`process group ${pgid} survived SIGKILL for 5s`);
    await delay(10);
  }
}
