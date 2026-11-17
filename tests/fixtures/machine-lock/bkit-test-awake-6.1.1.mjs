#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file.
// Usage: node scripts/ci/bkit-test-awake.mjs command [args...]
// Chains: node scripts/ci/bkit-test-awake.mjs --shell 'first && second'

import { spawn, spawnSync } from "node:child_process";
import spawnCommand from "cross-spawn";
import { once } from "node:events";
import { constants } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

function processTable() {
  const result = spawnSync(
    "/bin/ps",
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
      if (!tracked.has(pid) && tracked.has(entry.parent)) {
        tracked.set(pid, entry);
        added = true;
      }
    }
  } while (added);
}

async function cancelShell(child, signal) {
  let processes = processTable();
  const root = processes?.get(child.pid);
  if (!root) {
    if (!processes)
      console.error("bkit-test-awake: could not inspect shell commands; waiting for completion");
    child.kill(signal);
    return;
  }
  const tracked = new Map([[child.pid, root]]);
  collectDescendants(processes, tracked);
  const signalled = new Set();
  const signalProcess = (pid, entry) => {
    const identity = `${pid}:${entry.started}`;
    if (signalled.has(identity)) return;
    signalled.add(identity);
    try {
      process.kill(pid, signal);
    } catch (error) {
      if (error.code !== "ESRCH")
        console.error(`bkit-test-awake: could not signal command ${pid}: ${error.message}`);
    }
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

/** Run a command with a macOS sleep assertion owned by this process. */
export async function runAwake(command, args, platform = process.platform) {
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

  const child = spawnCommand(command, args, {
    stdio: "inherit",
  });
  let cleanup;
  const forward = (signal) => {
    if (!child.pid) return;
    if (shell) {
      cleanup ??= cancelShell(child, signal);
      return;
    }
    try {
      child.kill(signal);
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  };
  const handlers = ["SIGINT", "SIGTERM", "SIGHUP"].map((signal) => {
    const handler = () => forward(signal);
    process.on(signal, handler);
    return [signal, handler];
  });
  try {
    const [code, signal] = await once(child, "close");
    await cleanup;
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, ...args] = process.argv.slice(2);
  if (!command || (command === "--shell" && args.length !== 1)) {
    console.error("bkit-test-awake: name a command, or --shell followed by one command string");
    process.exitCode = 2;
  } else {
    process.exitCode = await runAwake(command, args);
  }
}
