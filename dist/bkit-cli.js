// bkit-cli.ts — parseArgs + printUsage for the v4-3 module-flag CLI surface.
// Exported and consumed by bkit-install.ts main().
const MODULE_FLAGS = new Set([
    "core",
    "claude",
    "cursor",
    "ci",
    "lint",
    "git-hooks",
    "full",
]);
// ALL_MODULES (ordered dispatch sequence): core always first, full = all non-core
const ALL_MODULES = ["core", "claude", "cursor", "ci", "lint", "git-hooks"];
export function resolveModules(flags) {
    // --full or empty flags → all modules
    if (flags.has("full") || flags.size === 0) {
        return new Set(ALL_MODULES);
    }
    // core is always implicit
    const out = new Set(flags);
    out.add("core");
    out.delete("full");
    return out;
}
/**
 * Parse argv (process.argv.slice(2)) into a ParsedArgs object.
 * Rejects unknown verbs and flags with process.exit(1).
 */
export function parseArgs(argv) {
    const args = [...argv];
    let verb = "help";
    // Verb extraction
    const firstArg = args[0];
    if (firstArg === "install" || firstArg === "check") {
        verb = firstArg;
        args.shift();
    }
    else if (firstArg === "help" || firstArg === "--help" || firstArg === "-h") {
        verb = "help";
        args.shift();
    }
    else if (firstArg !== undefined && !firstArg.startsWith("-")) {
        // Unknown verb (`init` removed in v0.2.0 — use `install --full`)
        console.error(`[bkit] Unknown verb: ${firstArg}. Run \`bkit help\` for usage.`);
        process.exit(1);
    }
    const moduleFlags = new Set();
    for (const arg of args) {
        // Module flags: --<flag>
        // `--host=` removed in v0.2.0 — use `--claude` / `--cursor` directly.
        if (arg.startsWith("--")) {
            const flag = arg.slice(2);
            if (!MODULE_FLAGS.has(flag)) {
                console.error(`[bkit] Unknown flag: ${arg}. Run \`bkit help\` for usage.`);
                process.exit(1);
            }
            moduleFlags.add(flag);
            continue;
        }
        // Any other positional after verb
        console.error(`[bkit] Unexpected argument: ${arg}. Run \`bkit help\` for usage.`);
        process.exit(1);
    }
    const modules = resolveModules(moduleFlags);
    return { verb, modules };
}
export function printUsage() {
    console.log(`bkit — agent-stack consolidation CLI

Usage:
  bkit install [module-flags]   Install (or re-sync) agent + CI + lint stack.
                                 No flags = --full (all modules).
  bkit check [module-flags]     Dry-run — report drift without writing. Exits 1 on drift.
  bkit help                     Print this message.

Module flags (composable):
  --full          All modules (default when no flags given).
  --core          .agents/ payload pass + .gitignore block + rules.md block + .bkit-version.
  --claude        .claude/commands/ + .claude/agents/ (byte-identical mirror).
  --cursor        .cursor/commands/ + .cursor/agents/ (T1/T2/T3 transforms).
  --ci            .github/workflows/ci.yml (Tier 2 managed-block, tokens substituted).
  --lint          .vale.ini + .vale/styles/House/ + slop-scan.config.json + .prettierignore.
  --git-hooks     .husky/pre-commit + .husky/pre-push (Tier 2 managed-block).

Examples:
  bkit install                  Full stack install (all modules).
  bkit install --claude         Only .claude/** + core.
  bkit install --ci --lint      CI + lint stack + core; nothing else.
  bkit install --full           Explicit full stack (equivalent to no flags).
  bkit check --full             Drift detection across full stack (CI gate).

Consumer CI auth:
  Set GH_BKIT_TOKEN in GitHub Actions secrets (classic PAT with read:packages scope —
  fine-grained PATs are not currently supported by GitHub Packages npm registry).
  See README.md ## Consumer CI auth for setup steps.

Docs: https://github.com/cbartens/bkit/blob/main/README.md`);
}
