// shared/package-manager.ts — the one place that names the package manager.
//
// bkit installs and upgrades itself with pnpm, so a consumer repo is a pnpm repo.
// Every command that runs a package script or an install builds the command here,
// so changing that decision is a change to this file only.

/** The package manager that runs `package.json` scripts and installs. */
export const PACKAGE_RUNNER = "pnpm";

/** argv for running one `package.json` script, e.g. `bkit:gate:static-unit`. */
export const scriptCommand = (script: string): string[] => [PACKAGE_RUNNER, script];

/** argv for installing dependencies; `frozen` refuses to change the lockfile. */
export const installCommand = (opts: { frozen: boolean }): string[] =>
  opts.frozen ? [PACKAGE_RUNNER, "install", "--frozen-lockfile"] : [PACKAGE_RUNNER, "install"];

/**
 * argv that regenerates a lockfile from its manifest, keyed by lockfile name.
 * Covers lockfiles from other ecosystems too: a rebase conflict in `Cargo.lock` is
 * resolved the same way as one in
 * `pnpm-lock.yaml`. A lockfile with no entry is left for a human.
 */
export const LOCKFILE_REGENERATE: Readonly<Record<string, readonly string[]>> = {
  "pnpm-lock.yaml": [PACKAGE_RUNNER, "install", "--lockfile-only"],
  "package-lock.json": ["npm", "install", "--package-lock-only"],
  "yarn.lock": ["yarn", "install", "--mode=update-lockfile"],
  "bun.lock": ["bun", "install", "--lockfile-only"],
  "Cargo.lock": ["cargo", "generate-lockfile"],
  "go.sum": ["go", "mod", "tidy"],
  "uv.lock": ["uv", "lock"],
};

/**
 * Exit codes a shell gives when the command itself could not run: 126 = found but
 * not executable, 127 = not found. A gate that exits with one of these never ran,
 * so it must not be recorded as a failing test.
 */
export const COULD_NOT_RUN_EXIT_CODES: ReadonlySet<number> = new Set([126, 127]);
