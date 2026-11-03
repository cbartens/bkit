#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file.
// Usage: node scripts/ci/bkit-test-awake.mjs command [args...]
// Chains: node scripts/ci/bkit-test-awake.mjs --shell 'first && second'

import { spawn } from "node:child_process";
import spawnCommand from "cross-spawn";
import { once } from "node:events";
import { constants } from "node:os";
import { pathToFileURL } from "node:url";

/** Run a command with a macOS sleep assertion owned by this process. */
export async function runAwake(command, args, platform = process.platform) {
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
  const forward = (signal) => {
    if (!child.pid) return;
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
  } else if (command === "--shell") {
    const windows = process.platform === "win32";
    process.exitCode = await runAwake(
      windows ? process.env.ComSpec || "cmd.exe" : "/bin/sh",
      windows ? ["/d", "/s", "/c", args[0]] : ["-c", args[0]],
    );
  } else {
    process.exitCode = await runAwake(command, args);
  }
}
