import * as fs from "node:fs";
import * as path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { Writable } from "node:stream";
import { fileURLToPath } from "node:url";

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

/** The lock script beside this file, so a run started from a subfolder finds it too. */
const LOCK_SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "scripts/ci/bkit-machine-lock.sh",
);

/** Run the lock script's `slots` subcommand under `env` and return what it prints. */
function readLockSlots(env: NodeJS.ProcessEnv): string {
  const result = spawnSync("bash", [LOCK_SCRIPT, "slots"], { env, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${LOCK_SCRIPT} slots exited ${result.status ?? result.signal}: ${result.stderr}`,
    );
  return result.stdout;
}

function wholeNumber(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return value !== undefined &&
    /^[0-9]+$/.test(value) &&
    Number.isSafeInteger(parsed) &&
    parsed >= 1
    ? parsed
    : undefined;
}

/**
 * Size Vitest's worker pool: an inherited BKIT_TEST_WORKERS (set by a tests-lock holder) wins,
 * CI=true / CI=1 sets no limit, and otherwise the lock script's `slots` output decides, so a
 * plain run takes the same share as the slot its global setup then asks for.
 */
export function testWorkers(
  env: NodeJS.ProcessEnv = process.env,
  readSlots: (env: NodeJS.ProcessEnv) => string = readLockSlots,
): { maxWorkers?: number } {
  const inherited = wholeNumber(env.BKIT_TEST_WORKERS);
  if (inherited !== undefined) return { maxWorkers: inherited };
  if (env.CI === "true" || env.CI === "1") return {};
  const output = readSlots(env);
  const workers = wholeNumber(/^slots=[0-9]+ workers=([0-9]+)$/m.exec(output)?.[1]);
  if (workers === undefined)
    throw new Error(`${LOCK_SCRIPT} slots printed no worker count: ${JSON.stringify(output)}`);
  return { maxWorkers: workers };
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
      LOCK_SCRIPT,
      "run",
      `vitest ${filters.length > 0 ? filters.join(" ") : "all"}`,
      "--lock",
      "tests",
      "--",
      "sh",
      "-c",
      'printf "locked %s\\n" "$LOCAL_STACK_LOCK_OWNER_tests"; exec cat <&3 >/dev/null',
    ],
    {
      // The child inherits this environment, so it asks for the slot count that testWorkers
      // read from the same script when Vitest sized its pool: either free slot fits that pool.
      stdio: ["inherit", "pipe", "pipe", "pipe"],
    },
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
  let tearingDown = false;
  // `exit` fires when the wrapper itself ends (its hold limit, or a kill); `close` would also wait
  // for any process still holding its stderr pipe.
  child.once("exit", (code, signal) => {
    if (tearingDown) return;
    process.stderr.write(
      `\nVitest tests lock holder exited before the run finished (${code ?? signal}); the tests lock is free, so the run stops here: ${stderr}\n`,
    );
    process.exit(1);
  });
  const previousOwner = process.env.LOCAL_STACK_LOCK_OWNER_tests;
  process.env.LOCAL_STACK_LOCK_OWNER_tests = owner;
  return async () => {
    tearingDown = true;
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
