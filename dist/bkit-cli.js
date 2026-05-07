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
// Uninstall-specific flags (not module flags)
const UNINSTALL_ONLY_FLAGS = new Set([
    "dry-run",
    "force",
    "nuke",
    "yes",
    "package",
    "keep-npmrc",
    "keep-tooling",
    "auto-revert",
]);
// Install-specific flags (not module flags; not uninstall flags)
const INSTALL_ONLY_FLAGS = new Set(["auto-revert"]);
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
function defaultUninstallFlags() {
    return {
        dryRun: false,
        force: false,
        nuke: false,
        yes: false,
        stripPackage: false,
        keepNpmrc: false,
        keepTooling: false,
        autoRevert: false,
    };
}
function defaultUpgradeFlags() {
    return { nonInteractive: false, dryRun: false };
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
    if (firstArg === "install" ||
        firstArg === "check" ||
        firstArg === "doctor" ||
        firstArg === "uninstall" ||
        firstArg === "upgrade") {
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
    const uninstallFlags = defaultUninstallFlags();
    const upgradeFlags = defaultUpgradeFlags();
    for (const arg of args) {
        if (arg.startsWith("--")) {
            const flag = arg.slice(2);
            // Uninstall-specific flags (accepted for all verbs that use them)
            if (flag === "dry-run") {
                uninstallFlags.dryRun = true;
                upgradeFlags.dryRun = true;
                continue;
            }
            if (flag === "force") {
                uninstallFlags.force = true;
                continue;
            }
            if (flag === "nuke") {
                uninstallFlags.nuke = true;
                continue;
            }
            if (flag === "yes") {
                uninstallFlags.yes = true;
                continue;
            }
            if (flag === "package") {
                uninstallFlags.stripPackage = true;
                continue;
            }
            if (flag === "keep-npmrc") {
                uninstallFlags.keepNpmrc = true;
                continue;
            }
            if (flag === "keep-tooling") {
                uninstallFlags.keepTooling = true;
                continue;
            }
            if (flag === "auto-revert") {
                uninstallFlags.autoRevert = true;
                continue;
            }
            // Upgrade-specific flags (P4.T6)
            if (flag === "non-interactive") {
                upgradeFlags.nonInteractive = true;
                continue;
            }
            // Module flags
            const moduleFlag = flag;
            if (!MODULE_FLAGS.has(moduleFlag)) {
                console.error(`[bkit] Unknown flag: ${arg}. Run \`bkit help\` for usage.`);
                process.exit(1);
            }
            moduleFlags.add(moduleFlag);
            continue;
        }
        // Any other positional after verb
        console.error(`[bkit] Unexpected argument: ${arg}. Run \`bkit help\` for usage.`);
        process.exit(1);
    }
    const modules = resolveModules(moduleFlags);
    return { verb, modules, uninstallFlags, upgradeFlags };
}
export function printUsage() {
    console.log(`bkit — agent-stack consolidation CLI

Usage:
  bkit install [module-flags]   Install (or re-sync) agent + CI + lint stack.
                                 No flags = --full (all modules).
  bkit check [module-flags]     Dry-run — report drift without writing. Exits 1 on drift.
  bkit upgrade [module-flags]   Upgrade installed files. Diffs old vs new templates;
                                 conflict list emitted to stderr. Use --non-interactive
                                 for CI (auto-apply non-conflicting; exit non-zero on conflicts).
  bkit uninstall [module-flags] Remove bkit-managed files + strip managed blocks.
                                 No flags = --full (all modules).
  bkit doctor                   Read-only preflight + post-install advisory replay.
                                 Diagnose token surfaces and config drift. Exits 0.
  bkit help                     Print this message.

Module flags (composable — same for install and uninstall):
  --full          All modules (default when no flags given).
  --core          .agents/ payload pass + .gitignore block + rules.md block + .bkit-version.
  --claude        .claude/commands/ + .claude/agents/ (byte-identical mirror).
  --cursor        .cursor/commands/ + .cursor/agents/ (T1/T2/T3 transforms).
  --ci            .github/workflows/ci.yml (Tier 2 managed-block, tokens substituted).
  --lint          .vale.ini + .vale/styles/House/ + slop-scan.config.json + .prettierignore.
  --git-hooks     .husky/pre-commit + .husky/pre-push (Tier 2 managed-block).

Uninstall flags:
  --dry-run       Print decision table (FILE / DECISION / REASON) without writing.
  --force         Force-delete Tier-3 files even if consumer modified them.
  --nuke          Delete ALL bkit-managed files regardless of tier/hash (requires confirm).
  --yes           Skip interactive confirm for --nuke.
  --package       Also strip managed package.json scripts/devDependencies.
  --keep-npmrc    Preserve .npmrc (default: .npmrc is not bkit-managed, always preserved).
  --keep-tooling  Preserve tooling devDependencies (prettier/slop-scan/husky).

Install flags:
  --auto-revert   On Phase 3 blocker, automatically run uninstall and exit 1.

Upgrade flags:
  --non-interactive  Auto-apply non-conflicting changes; emit conflict list to stderr;
                     exit non-zero when any conflict is detected (CI-safe).
  --dry-run          Show what would change without writing.

Examples:
  bkit install                  Full stack install (all modules).
  bkit install --claude         Only .claude/** + core.
  bkit install --ci --lint      CI + lint stack + core; nothing else.
  bkit install --full           Explicit full stack (equivalent to no flags).
  bkit check --full             Drift detection across full stack (CI gate).
  bkit uninstall                Full stack uninstall (all modules).
  bkit uninstall --dry-run      Preview what would be removed.
  bkit uninstall --ci --lint    Uninstall CI + lint stack only.

Consumer CI auth:
  Set GH_BKIT_TOKEN in GitHub Actions secrets (classic PAT with read:packages scope —
  fine-grained PATs are not currently supported by GitHub Packages npm registry).
  See README.md ## Consumer CI auth for setup steps.

Docs: https://github.com/cbartens/bkit/blob/main/README.md`);
}
