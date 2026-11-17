#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file.
// Usage: node scripts/ci/bkit-test-awake.mjs command [args...]
// Chains: node scripts/ci/bkit-test-awake.mjs --shell 'first && second'
// Hold limit: node scripts/ci/bkit-test-awake.mjs --hold-s N [--grace-s G] [--stopped-file P] [--pass-fds 3,4] -- command [args...]

import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync, statSync, writeFile } from "node:fs";
import { constants } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

/** The first executable `ps` on PATH, else /bin/ps. */
function psBinary() {
  for (const dir of (process.env.PATH ?? "").split(":")) {
    const candidate = join(dir || ".", "ps");
    const stat = statSync(candidate, { throwIfNoEntry: false });
    if (stat?.isFile() && (stat.mode & 0o111) !== 0) return candidate;
  }
  return "/bin/ps";
}

function processTable() {
  const result = spawnSync(
    psBinary(),
    ["-A", "-o", "pid=", "-o", "ppid=", "-o", "stat=", "-o", "lstart="],
    {
      encoding: "utf8",
      timeout: 1000,
      env: { ...process.env, LC_ALL: "C" },
    },
  );
  if (result.error || result.status !== 0) return null;
  const processes = new Map();
  for (const row of result.stdout.split("\n")) {
    const match = row.trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(.+)$/);
    if (!match || match[3].startsWith("Z")) continue;
    processes.set(Number(match[1]), { parent: Number(match[2]), started: match[4] });
  }
  return processes;
}

function collectDescendants(processes, tracked) {
  let added;
  do {
    added = false;
    for (const [pid, entry] of processes) {
      if (!tracked.has(pid) && tracked.has(entry.parent) && pid !== process.pid) {
        tracked.set(pid, entry);
        added = true;
      }
    }
  } while (added);
}

/** Whether `pid` still runs; a signal it cannot receive from us counts as running. */
function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code !== "ESRCH";
  }
}

/** Signal `pid`; a process that already exited is not an error. */
function signalPid(pid, signal) {
  try {
    process.kill(pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH")
      console.error(`bkit-test-awake: could not signal command ${pid}: ${error.message}`);
  }
}

/**
 * True when this process is in its terminal's foreground group: a Ctrl-C there already reached
 * the command, so passing INT on would deliver it twice.
 */
function inTerminalForeground() {
  const result = spawnSync(psBinary(), ["-o", "tpgid=", "-o", "pgid=", "-p", String(process.pid)], {
    encoding: "utf8",
    timeout: 1000,
  });
  const [tpgid, pgid] = (result.stdout ?? "").trim().split(/\s+/).map(Number);
  return result.status === 0 && tpgid > 0 && tpgid === pgid;
}

/** Send `signal` through a shell chain and wait for its descendants; a null signal only waits. */
async function cancelShell(child, signal) {
  let processes = processTable();
  const root = processes?.get(child.pid);
  if (!root) {
    if (!processes)
      console.error("bkit-test-awake: could not inspect shell commands; waiting for completion");
    if (signal) child.kill(signal);
    return;
  }
  const tracked = new Map([[child.pid, root]]);
  collectDescendants(processes, tracked);
  const signalled = new Set();
  const signalProcess = (pid, entry) => {
    const identity = `${pid}:${entry.started}`;
    if (signalled.has(identity)) return;
    signalled.add(identity);
    if (signal) signalPid(pid, signal);
  };
  // Live command owners retain responsibility for their descendants and locks.
  for (const [pid, entry] of tracked) {
    if (pid === child.pid || entry.parent === child.pid) signalProcess(pid, entry);
  }
  let inspectionReported = false;
  while (tracked.size > 0) {
    await delay(50);
    processes = processTable();
    if (!processes) {
      if (!inspectionReported)
        console.error(
          "bkit-test-awake: waiting to inspect cancelled commands before releasing the assertion",
        );
      inspectionReported = true;
      continue;
    }
    for (const [pid, entry] of tracked) {
      const current = processes.get(pid);
      if (current?.started !== entry.started) tracked.delete(pid);
      else tracked.set(pid, current);
    }
    collectDescendants(processes, tracked);
    // An exited intermediary can leave a worker behind; cancel that orphan root.
    for (const [pid, entry] of tracked) {
      if (entry.parent === child.pid || !tracked.has(entry.parent)) signalProcess(pid, entry);
    }
  }
}

/**
 * Stop `child` and every process started under it once `holdS` seconds pass: one TERM to each,
 * then KILL to those left after `graceS`. The tree is recorded every second, so a process whose
 * parent exited is still stopped; each is recorded with its start time, so a reused pid is never
 * signalled. Without a ps that lists start times, only the command itself can be stopped.
 * `stoppedFile`, when set, is created as the stop starts. Resolves true when it stopped the
 * command, false when the command finished first.
 */
async function holdLimit(child, closing, { holdS, graceS, stoppedFile }, state) {
  let closed = false;
  closing.then(() => (closed = true));
  const pause = (ms) => Promise.race([delay(ms, undefined, { ref: false }), closing]);
  const first = processTable();
  const tree = first !== null;
  if (!tree)
    console.error(
      "bkit-test-awake: ps with lstart is not available (procps on Linux), so the --hold-s limit can stop only the command itself, not the processes started under it",
    );
  // The command's start time is null when it was already gone from the first table.
  const tracked = new Map([[child.pid, first?.get(child.pid) ?? null]]);
  const refresh = () => {
    if (!tree) {
      for (const pid of tracked.keys()) if (!alive(pid)) tracked.delete(pid);
      return;
    }
    const processes = processTable();
    if (!processes) return;
    for (const [pid, entry] of tracked) {
      const current = processes.get(pid);
      if (!current || (entry && current.started !== entry.started)) tracked.delete(pid);
      else tracked.set(pid, current);
    }
    collectDescendants(processes, tracked);
  };
  const end = Date.now() + holdS * 1000;
  while (!closed && Date.now() < end) {
    refresh();
    await pause(Math.min(1000, Math.max(0, end - Date.now())));
  }
  if (closed) return false;
  refresh();
  if (!tracked.has(child.pid) || !alive(child.pid)) return false;
  state.stopping = true;
  // The stop goes ahead without the file; the caller then reads the 124 as the command's own.
  if (stoppedFile)
    writeFile(stoppedFile, "", (error) => {
      if (error) console.error(`bkit-test-awake: could not write ${stoppedFile}: ${error.message}`);
    });
  // Each process gets one TERM, so a second one never cuts short its own shutdown.
  const termed = new Set();
  const term = () => {
    for (const [pid, entry] of tracked) {
      const identity = `${pid}:${entry?.started}`;
      if (termed.has(identity)) continue;
      termed.add(identity);
      signalPid(pid, "SIGTERM");
    }
  };
  term();
  const killAt = Date.now() + graceS * 1000;
  while (tracked.size > 0 && Date.now() < killAt) {
    await delay(100);
    refresh();
    term();
  }
  for (let round = 0; round < 20 && tracked.size > 0; round++) {
    for (const pid of tracked.keys()) signalPid(pid, "SIGKILL");
    await delay(100);
    refresh();
  }
  return true;
}

/**
 * Run a command with a macOS sleep assertion owned by this process. With `hold`, the command is
 * stopped once `hold.holdS` seconds pass (see `holdLimit`) and the result is 124, and the
 * descriptors in `hold.fds` are handed to the command too. `foreground` says whether this process
 * is in its terminal's foreground group.
 */
export async function runAwake(
  command,
  args,
  platform = process.platform,
  hold = null,
  foreground = inTerminalForeground,
) {
  const shell = command === "--shell" && platform !== "win32";
  if (command === "--shell") {
    command = shell ? "/bin/sh" : process.env.ComSpec || "cmd.exe";
    args = shell
      ? ["-c", `trap 'exit 130' INT\ntrap 'exit 143' TERM\ntrap 'exit 129' HUP\n${args[0]}`]
      : ["/d", "/s", "/c", args[0]];
  }
  let assertion;
  if (platform === "darwin") {
    assertion = spawn("/usr/bin/caffeinate", ["-is", "-w", String(process.pid)], {
      stdio: "ignore",
      detached: true,
    });
    try {
      await once(assertion, "spawn");
    } catch (error) {
      console.error(`bkit-test-awake: caffeinate could not run: ${error.message}`);
      return 127;
    }
  }

  // cross-spawn handles Windows command shims and argument escaping; elsewhere it is spawn.
  const spawnCommand = platform === "win32" ? (await import("cross-spawn")).default : spawn;
  // Descriptors above 2 reach the command only when listed in `hold.fds`, each at its own number.
  const fds = hold?.fds ?? [];
  const extra = Array.from({ length: Math.max(2, ...fds) - 2 }, (_, i) =>
    fds.includes(i + 3) ? i + 3 : "ignore",
  );
  let handlers = [];
  try {
    const child = spawnCommand(command, args, {
      stdio: ["inherit", "inherit", "inherit", ...extra],
    });
    const state = { stopping: false };
    const held =
      hold && child.pid
        ? holdLimit(child, new Promise((resolve) => child.on("close", resolve)), hold, state)
        : Promise.resolve(false);
    let cleanup;
    const forward = (signal) => {
      if (!child.pid || state.stopping) return;
      // A Ctrl-C at the terminal already reached the command, so it is not sent again; a shell
      // chain is still waited for.
      const resend = !(signal === "SIGINT" && platform !== "win32" && foreground());
      if (shell) {
        cleanup ??= cancelShell(child, resend ? signal : null);
        return;
      }
      if (!resend) return;
      try {
        child.kill(signal);
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    };
    handlers = ["SIGINT", "SIGTERM", "SIGHUP"].map((signal) => {
      const handler = () => forward(signal);
      process.on(signal, handler);
      return [signal, handler];
    });
    const [code, signal] = await once(child, "close");
    await cleanup;
    if (await held) return 124;
    return code ?? 128 + (constants.signals[signal] ?? 1);
  } catch (error) {
    const reason = error.code === "ENOENT" ? "not found on PATH" : "could not run";
    console.error(`bkit-test-awake: ${command} ${reason}: ${error.message}`);
    return error.code === "EACCES" ? 126 : 127;
  } finally {
    for (const [signal, handler] of handlers) process.off(signal, handler);
    if (assertion && assertion.exitCode === null && assertion.signalCode === null) {
      const closed = once(assertion, "close");
      assertion.kill();
      await closed;
    }
  }
}

/**
 * `--hold-s N [--grace-s G] [--stopped-file P] [--pass-fds A,B] [--]` off the front of argv: the
 * limits, the file to create when the limit stops the command, the open descriptors above 2 to
 * hand the command, and the rest; null when a value is invalid.
 */
function holdOptions(argv) {
  const whole = (value, min) =>
    /^\d+$/.test(value ?? "") && Number(value) >= min ? Number(value) : null;
  const holdS = whole(argv[1], 1);
  let rest = argv.slice(2);
  let graceS = 10;
  if (rest[0] === "--grace-s") {
    graceS = whole(rest[1], 0);
    rest = rest.slice(2);
  }
  let stoppedFile = null;
  if (rest[0] === "--stopped-file") {
    stoppedFile = rest[1] || null;
    if (!stoppedFile) return null;
    rest = rest.slice(2);
  }
  let fds = [];
  if (rest[0] === "--pass-fds") {
    fds = (rest[1] ?? "")
      .split(",")
      .filter(Boolean)
      .map((fd) => whole(fd, 3));
    rest = rest.slice(2);
  }
  if (rest[0] === "--") rest = rest.slice(1);
  if (holdS === null || graceS === null) return null;
  if (fds.some((fd) => fd === null || !existsSync(`/dev/fd/${fd}`))) return null;
  return { hold: { holdS, graceS, stoppedFile, fds }, rest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let argv = process.argv.slice(2);
  let hold = null;
  if (argv[0] === "--hold-s") {
    const options = holdOptions(argv);
    if (!options) {
      console.error(
        "bkit-test-awake: --hold-s needs a whole number of seconds of at least 1, --grace-s one of at least 0, --stopped-file a path, and --pass-fds open descriptor numbers of at least 3",
      );
      process.exit(2);
    }
    ({ hold, rest: argv } = options);
  }
  const [command, ...args] = argv;
  if (!command || (command === "--shell" && args.length !== 1)) {
    console.error("bkit-test-awake: name a command, or --shell followed by one command string");
    process.exitCode = 2;
  } else {
    process.exitCode = await runAwake(command, args, process.platform, hold);
  }
}
