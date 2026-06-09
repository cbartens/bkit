// bkit-cli.ts — parseArgs + printUsage for the v4-3 module-flag CLI surface.
// Exported and consumed by bkit-install.ts main().
import { ISSUE_TRACKERS, parseIssueTracker } from "./bkit-manifest.js";
/** Cloud-agent variant chosen via `--cloud=<variant>`. */
export const CLOUD_VARIANTS = ["claude", "cursor"];
/** Narrow an unknown string to `CloudVariant` or return `null` if invalid. */
export function parseCloudVariant(value) {
    return typeof value === "string" && CLOUD_VARIANTS.includes(value)
        ? value
        : null;
}
const MODULE_FLAGS = new Set([
    "core",
    "claude",
    "cursor",
    "ci",
    "lint",
    "git-hooks",
    "renovate",
    "dependabot",
    "cloud",
    "full",
]);
// ALL_MODULES (ordered dispatch sequence): core always first, full = all non-core.
// `renovate`, `dependabot` and `cloud` are intentionally excluded — opt-in via
// explicit `--renovate` / `--dependabot` / `--cloud`. Rationale (renovate): the
// Renovate App's first scan reads the default branch, so the config must reach
// `main` BEFORE the App is installed. Rationale (dependabot): consumers who pick
// this path explicitly opt out of bkit's Renovate recommendation; installing both
// opens competing PRs against the same packages. Rationale (cloud): the
// `bkit-auto.yml` workflow is inert without ANTHROPIC_API_KEY + LINEAR_API_KEY
// secrets + GitHub Actions write permissions + (Cursor half) a dashboard trigger,
// and it auto-dispatches cloud agents on CI completion — a deliberate opt-in, not
// a default. See issue #119 ("Managed Cloud Agents").
const ALL_MODULES = ["core", "claude", "cursor", "ci", "lint", "git-hooks"];
/** Opt-in modules: not included in `--full` or default install; require explicit flag. */
export const OPTIN_MODULES = new Set(["renovate", "dependabot", "cloud"]);
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
export function resolveModules(flags, opts = {}) {
    // Single opt-in flag alone (no --full) → core + that module ONLY. Targeted is
    // symmetric across install/uninstall and never pulls in the rest of the stack.
    if (flags.size === 1) {
        for (const m of OPTIN_MODULES) {
            if (flags.has(m))
                return new Set(["core", m]);
        }
    }
    // --full / empty → all non-opt-in modules. Opt-in add-ons are ASYMMETRIC:
    //   install  adds one only when explicitly flagged (they need external setup —
    //            App/secrets/dashboard/choice — so a default install must not auto-wire them);
    //   uninstall adds ALL of them (a full uninstall must leave zero bkit footprint).
    // Safe: runUninstall is manifest-driven + skip-absent, so removing a never-installed
    // opt-in module's files is a harmless no-op.
    if (flags.has("full") || flags.size === 0) {
        const out = new Set(ALL_MODULES);
        for (const m of OPTIN_MODULES) {
            if (opts.optInModulesInFull || flags.has(m))
                out.add(m);
        }
        return out;
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
    let tracker = null;
    let cloudVariant = null;
    let force = false;
    for (const arg of args) {
        if (arg.startsWith("--")) {
            const rawFlag = arg.slice(2);
            // `--auto[=claude|cursor]` is the current name for the cloud-agent lane (issues
            // #243/#244 freed "cloud" for the local/cloud execution-target swap). `--cloud[=…]`
            // is kept as a deprecated alias. Both normalise to the internal `cloud` module.
            const flag = rawFlag === "auto"
                ? "cloud"
                : rawFlag.startsWith("auto=")
                    ? `cloud=${rawFlag.slice("auto=".length)}`
                    : rawFlag;
            // Value-bearing flag: --tracker=<github|linear|none>
            if (flag.startsWith("tracker=")) {
                const value = flag.slice("tracker=".length);
                const parsed = parseIssueTracker(value);
                if (parsed === null) {
                    console.error(`[bkit] Unknown tracker: "${value}". Valid values: ${ISSUE_TRACKERS.join(", ")}`);
                    process.exit(1);
                }
                tracker = parsed;
                continue;
            }
            // Value-bearing flag: --cloud=<claude|cursor>
            // Bare `--cloud` (no value) is accepted for uninstall (variant not needed — reads from
            // package.json). For install/check/upgrade it requires an explicit variant; future
            // improvement: resolve variant from recorded bkit.cloudAgents for check/upgrade too.
            if (flag === "cloud") {
                if (verb !== "uninstall") {
                    console.error(`[bkit] --auto requires an explicit variant: --auto=claude or --auto=cursor. Run \`bkit help\` for usage.`);
                    process.exit(1);
                }
                // uninstall --cloud: add the module flag without setting a cloudVariant.
                moduleFlags.add("cloud");
                continue;
            }
            if (flag.startsWith("cloud=")) {
                const value = flag.slice("cloud=".length);
                const parsed = parseCloudVariant(value);
                if (parsed === null) {
                    console.error(`[bkit] Unknown cloud variant: "${value}". Valid values: ${CLOUD_VARIANTS.join(", ")}`);
                    process.exit(1);
                }
                cloudVariant = parsed;
                moduleFlags.add("cloud");
                continue;
            }
            // Value-bearing flag: --dependency=<renovate|dependabot>
            // The unified form of the `--renovate` / `--dependabot` booleans (kept as
            // deprecated aliases below). Mirrors --tracker= / --auto= grammar.
            if (flag.startsWith("dependency=")) {
                const value = flag.slice("dependency=".length);
                if (value !== "renovate" && value !== "dependabot") {
                    console.error(`[bkit] Unknown dependency updater: "${value}". Valid values: renovate, dependabot`);
                    process.exit(1);
                }
                moduleFlags.add(value);
                continue;
            }
            // Uninstall-specific flags (accepted for all verbs that use them)
            if (flag === "dry-run") {
                uninstallFlags.dryRun = true;
                upgradeFlags.dryRun = true;
                continue;
            }
            if (flag === "force") {
                uninstallFlags.force = true;
                force = true;
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
            // Module flags (bare --cloud handled above; skip it here)
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
    // Mutual exclusion: `--renovate` and `--dependabot` cannot be combined.
    // Both open PRs against the same packages; running both creates competing
    // update PRs (see issue #109 + #123 follow-up for rationale).
    if (moduleFlags.has("renovate") && moduleFlags.has("dependabot")) {
        console.error("[bkit] `--renovate` and `--dependabot` are mutually exclusive (running both opens competing PRs against the same packages). Pick one.");
        process.exit(1);
    }
    // Full uninstall removes opt-in add-ons too (leave zero footprint); full install does not.
    const modules = resolveModules(moduleFlags, { optInModulesInFull: verb === "uninstall" });
    return { verb, modules, uninstallFlags, upgradeFlags, tracker, cloudVariant, force };
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
                                 No flags = --full — ALL modules incl. opt-in add-ons
                                 (renovate/dependabot/cloud), so no bkit footprint remains.
                                 Target one with its flag (e.g. uninstall --cloud).
  bkit doctor                   Read-only preflight + post-install advisory replay.
                                 Diagnose token surfaces and config drift. Exits 0.
  bkit help                     Print this message.

Module flags (composable — same for install and uninstall):
  --full          All modules (default when no flags given).
  --core          .agents/ payload pass + .gitignore block + rules.md block + .bkit-version.
  --claude        .claude/commands/ + .claude/agents/ (byte-identical mirror).
  --cursor        .cursor/commands/ + .cursor/agents/ (T1/T2/T3 transforms).
  --ci            .github/workflows/ci.yml (Tier 3 seed-or-print: byte-equal, tokens
                  substituted; seeded once, never overwritten).
  --lint          .vale.ini + .vale/styles/House/ + slop-scan.config.json + .prettierignore.
  --git-hooks     .husky/pre-commit + .husky/pre-push (Tier 3 seed-or-print, v2.0.4+).
  --dependency=renovate
                  .github/renovate.json5 (opt-in, phase-gated — NOT in install --full;
                  IS removed by uninstall --full).
                  Phase A: file not yet on origin/<default-branch> → writes file, prints
                  prompt to PR → main, then re-run. Phase B: file detected on default
                  branch → prints GitHub App install URL + activation checklist.
  --dependency=dependabot
                  .github/dependabot.yml + scripts/ci/bkit-set-dependabot.sh (opt-in —
                  NOT in install --full; IS removed by uninstall --full). First-party
                  GitHub feature; no App install or phase gate.
                  (renovate and dependabot are mutually exclusive. The bare --renovate /
                  --dependabot flags remain as deprecated aliases.)
  --auto=claude   Install Claude cloud-agent (auto-dispatch) integration (opt-in — NOT in
                  install --full; IS removed by uninstall --full). Requires tracker=github.
                  Ships: .github/workflows/bkit-auto.yml + .claude/hooks/cloud-bootstrap.sh.
                  Requires ANTHROPIC_API_KEY repo secret and the Claude GitHub App
                  (run /install-github-app once). Records bkit.cloudAgents=claude.
  --auto=cursor   Install Cursor cloud-agent integration (opt-in). Requires tracker=linear.
                  Ships: .cursor/Dockerfile + .cursor/environment.json.
                  Records bkit.cloudAgents=cursor.
                  (--cloud=… is kept as a deprecated alias of --auto=….)

Uninstall flags:
  --dry-run       Print decision table (FILE / DECISION / REASON) without writing.
  --force         Force-delete Tier-3 files even if consumer modified them.
  --nuke          Delete ALL bkit-managed files regardless of tier/hash (requires confirm).
  --yes           Skip interactive confirm for --nuke.
  --package       Also strip managed package.json scripts/devDependencies.
  --keep-npmrc    Preserve .npmrc (default: .npmrc is not bkit-managed, always preserved).
  --keep-tooling  Preserve tooling devDependencies (prettier/slop-scan/husky).

Install flags:
  --auto-revert         On Phase 3 blocker, automatically run uninstall and exit 1.
  --tracker=<name>      Wire issue tracker integration. Values: github, linear, none (default).
                        Writes bkit.issueTracker to package.json and substitutes tracker snippets
                        into workflow mirrors (.claude/commands/, .cursor/commands/).
  --force               Allow switching an established issue tracker (first-set is free;
                        subsequent switches require --force to prevent accidental reconfiguration).

Upgrade flags:
  --non-interactive  Auto-apply non-conflicting changes; emit conflict list to stderr;
                     exit non-zero when any conflict is detected (CI-safe).
  --dry-run          Show what would change without writing.

Examples:
  bkit install                  Full stack install (all modules).
  bkit install --claude         Only .claude/** + core.
  bkit install --ci --lint      CI + lint stack + core; nothing else.
  bkit install --renovate       Renovate config only (phase-gated; opt-in).
  bkit install --dependabot     Dependabot config + helper script (opt-in; alternative to --renovate).
  bkit install --cloud=claude   Claude cloud integration (GitHub tracker required; opt-in).
  bkit install --cloud=cursor   Cursor cloud integration (Linear tracker required; opt-in).
  bkit install --full --renovate  Full stack + Renovate opt-in.
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
