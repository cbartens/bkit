// bkit-launch.ts — `bkit cursor` / `bkit opencode` launcher verbs.
//
// Resolves .bkit/.env in the current repo root, merges it over process.env,
// and exec's the GUI app binary directly so it inherits the per-repo token set.
//
// Why not `open -a`? `open` routes through launchd which drops the inherited
// env (#279/#280). We exec the raw binary instead.

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { parseDotenv } from "./bkit-cloud-env.js";

export type LaunchApp = "cursor" | "opencode";

/**
 * Default binary paths. Override via BKIT_CURSOR_BIN / BKIT_OPENCODE_BIN env vars.
 */
const DEFAULT_BINARY: Record<LaunchApp, string> = {
  cursor: "/Applications/Cursor.app/Contents/MacOS/Cursor",
  opencode: "/Applications/opencode.app/Contents/MacOS/opencode",
};

const BINARY_OVERRIDE_ENV: Record<LaunchApp, string> = {
  cursor: "BKIT_CURSOR_BIN",
  opencode: "BKIT_OPENCODE_BIN",
};

/**
 * Load .bkit/.env from `repoRoot`, merge into `baseEnv`, return merged env.
 * baseEnv wins over file values for keys already set (process.env takes priority;
 * .bkit/.env only fills gaps).
 */
export function loadBkitEnv(repoRoot: string, baseEnv: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const envPath = path.join(repoRoot, ".bkit", ".env");
  if (!fs.existsSync(envPath)) return { ...baseEnv };

  const content = fs.readFileSync(envPath, "utf-8");
  const fileVars = parseDotenv(content);

  const merged: NodeJS.ProcessEnv = { ...baseEnv };
  for (const [key, value] of fileVars) {
    // process.env wins — only inject if key absent or empty in current env
    const existing = baseEnv[key];
    if (!existing || existing.trim() === "") {
      merged[key] = value;
    }
  }
  return merged;
}

/**
 * Resolve the binary path for `app`:
 *   1. Override env var (BKIT_CURSOR_BIN / BKIT_OPENCODE_BIN)
 *   2. Default path
 * Returns the path string if found, or null with a user-visible error message.
 */
export function resolveBinaryPath(
  app: LaunchApp,
  env: NodeJS.ProcessEnv,
): { binPath: string } | { error: string } {
  const overrideKey = BINARY_OVERRIDE_ENV[app];
  const override = env[overrideKey]?.trim();
  const candidate = override || DEFAULT_BINARY[app];

  if (!fs.existsSync(candidate)) {
    const hint = override
      ? `(override via ${overrideKey}=${candidate})`
      : `(default path — set ${overrideKey}=/path/to/binary to override)`;
    return {
      error: `[bkit] ${app} binary not found at ${candidate} ${hint}. Install ${app} first, then re-run.`,
    };
  }
  return { binPath: candidate };
}

/**
 * Return true if a process matching `binaryPath` is already running.
 * Uses `pgrep -f` which matches against the full command line.
 * Returns false on non-POSIX systems (result.error set when pgrep is absent).
 */
export function isAlreadyRunning(binaryPath: string): boolean {
  const result = spawnSync("pgrep", ["-f", binaryPath], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return !result.error && result.status === 0 && result.stdout.trim().length > 0;
}

/**
 * Launch `app` with .bkit/.env merged into its environment.
 *
 * - Loads `.bkit/.env` from `cwd` and merges into process.env (process.env wins).
 * - Detects an already-running instance via pgrep; warns + exits non-zero if found
 *   (the running process will not inherit the new env even if the binary hands off).
 * - For Cursor: passes `cwd` as a positional arg so it opens the repo folder.
 * - Spawns detached so the terminal is not blocked by the GUI app.
 */
export async function launchApp(app: LaunchApp, cwd: string): Promise<void> {
  const env = loadBkitEnv(cwd, process.env);

  const resolved = resolveBinaryPath(app, env);
  if ("error" in resolved) {
    console.error(resolved.error);
    process.exit(1);
  }
  const { binPath } = resolved;

  if (isAlreadyRunning(binPath)) {
    console.warn(
      `[bkit] ${app} is already running — opening folder in a new window, but the\n` +
        `environment from .bkit/.env will NOT take effect (the running process keeps\n` +
        `its original env). If you need per-repo tokens, quit ${app} fully (Cmd+Q)\n` +
        `and re-run: pnpm bkit ${app}`,
    );
  }

  // Cursor: pass repo dir so it opens the folder. opencode: no positional needed
  // (it reads opencode.json from cwd, and cwd is inherited via { cwd } spawn option).
  const args = app === "cursor" ? [cwd] : [];

  const child = spawn(binPath, args, {
    env,
    cwd,
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  console.log(`[bkit] Launched ${app} with environment from .bkit/.env`);
}
