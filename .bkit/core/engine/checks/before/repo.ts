// checks/before/repo.ts — repo preconditions: package.json present and parseable, a git repo,
// bkit on PATH.

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import type { ModuleFlag } from "../../cli.js";
import { readJsonFile } from "../../shared/json.js";
import type { PreflightFinding } from "./index.js";
import { isCloudOrCi } from "./env.js";

// ---------------------------------------------------------------------------
// Blocker detectors
// ---------------------------------------------------------------------------

export function detectNoPackageJson(cwd: string): PreflightFinding | null {
  if (fs.existsSync(path.join(cwd, "package.json"))) return null;
  return {
    id: "no-package-json",
    severity: "blocker",
    detect: "package.json not found in the current directory.",
    action:
      "Run `npm init -y` to create a minimal package.json, or copy one from an existing project, then re-run `pnpm bkit install`.",
  };
}

export function detectMalformedPackageJson(cwd: string): PreflightFinding | null {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  if (readJsonFile(pkgPath).ok) return null;
  return {
    id: "malformed-package-json",
    severity: "blocker",
    detect: "package.json exists but contains invalid JSON.",
    action:
      "Fix the JSON syntax error in package.json (run `node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8'))\"` to locate the error), then re-run `pnpm bkit install`.",
  };
}

export function detectNotGitRepo(cwd: string, modules: Set<ModuleFlag>): PreflightFinding | null {
  if (!modules.has("core")) return null;
  if (fs.existsSync(path.join(cwd, ".git"))) return null;
  return {
    id: "not-git-repo",
    severity: "blocker",
    detect: "core install requested but .git/ directory not found — this is not a git repository.",
    action:
      "Run `git init` to initialise a git repo, then re-run. bkit installs into a git repository — its managed .gitignore/.gitattributes blocks require one (core is implicit; there is no --core flag to omit).",
  };
}

/**
 * Advisory: `bkit` is not on PATH.
 * bkit is a devDependency — without a shell alias, every invocation requires
 * `pnpm bkit <verb>` or `pnpm exec bkit <verb>`. Suggest the one-line alias.
 * Short-circuits in CI / cloud environments where the alias is irrelevant.
 */
export function detectBkitNotOnPath(): PreflightFinding | null {
  if (isCloudOrCi()) return null;
  const result = spawnSync("which", ["bkit"], { encoding: "utf-8" });
  if (result.status === 0 && result.stdout.trim()) return null;
  return {
    id: "bkit-not-on-path",
    severity: "advisory",
    detect:
      "`bkit` is not on PATH — commands must be run as `pnpm bkit <verb>` or `pnpm exec bkit <verb>`.",
    action:
      "[bkit] Add a shell alias so you can type `bkit <verb>` directly. Add to ~/.zshrc (or ~/.bashrc), then reload:\n\n" +
      "    alias bkit='pnpm bkit'\n" +
      "    source ~/.zshrc\n\n" +
      "For `bkit cursor` / `bkit opencode` (GUI app launchers), run from the repo root in\n" +
      "an external terminal (Terminal.app / iTerm2) — not from inside the running app.",
  };
}
