import * as fs from "node:fs";
import { spawn } from "node:child_process";
import { Writable } from "node:stream";

interface TestLockInput {
  filters: readonly string[];
  env: NodeJS.ProcessEnv;
  exists: (file: string) => boolean;
  alive: (pid: number) => boolean;
  watch: boolean;
}

/** Decide whether this invocation needs a run-wide tests lock. */
export function testLockDecision({ filters, env, exists, alive, watch }: TestLockInput): {
  take: boolean;
  reason: "ci" | "nested" | "watch" | "files" | "heavy";
} {
  if (env.CI === "true" || env.CI === "1") return { take: false, reason: "ci" };
  const owner = env.LOCAL_STACK_LOCK_OWNER_tests ?? "";
  const pid = Number(owner);
  if (/^[1-9][0-9]*$/.test(owner) && Number.isSafeInteger(pid) && alive(pid))
    return { take: false, reason: "nested" };
  if (watch) return { take: false, reason: "watch" };
  if (filters.length > 0 && filters.every((file) => exists(file.replace(/:\d+$/, ""))))
    return { take: false, reason: "files" };
  return { take: true, reason: "heavy" };
}

/** Apply the worker budget supplied by a tests-lock holder. */
export function testWorkers(env: NodeJS.ProcessEnv = process.env): { maxWorkers?: number } {
  const value = env.BKIT_TEST_WORKERS ?? "";
  const workers = Number(value);
  return /^[0-9]+$/.test(value) && Number.isSafeInteger(workers) && workers >= 1
    ? { maxWorkers: workers }
    : {};
}

interface LockProject {
  vitest: {
    config: { filters?: readonly string[]; watch?: boolean };
    filenamePattern?: readonly string[];
  };
}

/** Hold the machine-wide tests lock until Vitest finishes its run. */
export default async function setup(
  project: LockProject,
): Promise<(() => Promise<void>) | undefined> {
  // Vitest 5 stores CLI filters on the runner rather than its resolved config.
  const filters = project.vitest.config.filters ?? project.vitest.filenamePattern ?? [];
  const decision = testLockDecision({
    filters,
    env: process.env,
    watch: project.vitest.config.watch === true,
    exists: (file) => fs.statSync(file, { throwIfNoEntry: false })?.isFile() === true,
    alive: (pid) => {
      try {
        process.kill(pid, 0);
        return true;
      } catch (error) {
        if (error instanceof Error && "code" in error) {
          if (error.code === "EPERM") return true;
          if (error.code === "ESRCH") return false;
        }
        throw error;
      }
    },
  });
  if (!decision.take) return;

  const child = spawn(
    "bash",
    [
      "scripts/ci/bkit-machine-lock.sh",
      "run",
      `vitest ${filters.length > 0 ? filters.join(" ") : "all"}`,
      "--lock",
      "tests",
      "--",
      "sh",
      "-c",
      'printf "locked %s\\n" "$LOCAL_STACK_LOCK_OWNER_tests"; exec cat <&3 >/dev/null',
    ],
    { stdio: ["inherit", "pipe", "pipe", "pipe"] },
  );
  let stderr = "";
  const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null; error?: Error }>(
    (resolve) => {
      child.once("error", (error) => resolve({ code: null, signal: null, error }));
      child.once("close", (code, signal) => resolve({ code, signal }));
    },
  );
  const stdout = child.stdout;
  const stderrStream = child.stderr;
  const keepalive = child.stdio[3];
  if (!stdout || !stderrStream || !(keepalive instanceof Writable)) {
    child.kill();
    await exited;
    throw new Error("Vitest tests lock did not open its readiness and keepalive pipes");
  }
  stderrStream.setEncoding("utf8");
  stderrStream.on("data", (chunk: string) => {
    stderr += chunk;
    process.stderr.write(chunk);
  });
  const ready = new Promise<string>((resolve) => {
    let output = "";
    stdout.setEncoding("utf8");
    stdout.on("data", (chunk: string) => {
      output += chunk;
      const match = /^locked ([1-9][0-9]*)$/m.exec(output);
      if (match) resolve(match[1]);
    });
  });
  const owner = await Promise.race([
    ready,
    exited.then(({ code, signal, error }) => {
      throw new Error(
        `Vitest tests lock exited before readiness (${code ?? signal ?? error?.message}): ${stderr}`,
      );
    }),
  ]);
  const previousOwner = process.env.LOCAL_STACK_LOCK_OWNER_tests;
  process.env.LOCAL_STACK_LOCK_OWNER_tests = owner;
  return async () => {
    keepalive.end();
    const { code, signal, error } = await exited;
    if (process.env.LOCAL_STACK_LOCK_OWNER_tests === owner) {
      if (previousOwner === undefined) delete process.env.LOCAL_STACK_LOCK_OWNER_tests;
      else process.env.LOCAL_STACK_LOCK_OWNER_tests = previousOwner;
    }
    if (code !== 0 || error)
      throw new Error(`Vitest tests lock exited (${code ?? signal ?? error?.message}): ${stderr}`);
  };
}
