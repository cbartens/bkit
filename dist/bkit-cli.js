// bkit-cli.ts — parseArgs + printUsage for the v4-3 module-flag CLI surface.
// Exported and consumed by bkit-install.ts main().
import { ISSUE_TRACKERS, parseIssueTracker, RENOVATE_RUNNERS, parseRenovateRunner, } from "./bkit-manifest.js";
/** Cloud-agent variant chosen via `--auto=<variant>`. */
export const CLOUD_VARIANTS = ["claude", "cursor", "opencode"];
/**
 * Providers bkit supports for the opencode host. `--opencode=<provider>` accepts
 * ONLY these — anything else is rejected (no generic/arbitrary-endpoint fallback).
 * Keep in sync with OPENCODE_PROVIDER_DEFAULTS (bkit-modules.ts) and
 * OPENCODE_PROVIDER_COLUMN (bkit-install.ts § Models lookup).
 */
export const OPENCODE_PROVIDERS = [
    "ollama-local",
    "nvidia",
    "groq",
    "cerebras",
    "openrouter",
    "ollama",
    // opencode-native gateways — two DISTINCT models.dev providers with separate catalogs.
    // CLI: opencode-zen / opencode-go. Agent model pins: opencode/<id> (Zen built-in id) and
    // opencode-go/<id>. Both auth via OPENCODE_API_KEY. See providers.md § Models.
    "opencode-zen",
    "opencode-go",
];
/**
 * Hidden backward-compat aliases for `--opencode=<provider>` values (not exposed in
 * help text). Normalises legacy provider keys stored in package.json or passed on the
 * CLI to the current canonical key before allowlist validation.
 */
export const OPENCODE_PROVIDER_ALIASES = {
    // Legacy bare `opencode` (pre-split) resolved to the Zen gateway → map to opencode-zen.
    opencode: "opencode-zen",
    zen: "opencode-zen",
    go: "opencode-go",
};
/** Normalise an `--opencode=` value through OPENCODE_PROVIDER_ALIASES (identity if no alias). */
export function normalizeOpencodeProvider(value) {
    return OPENCODE_PROVIDER_ALIASES[value] ?? value;
}
/** Narrow an unknown string to `CloudVariant` or return `null` if invalid. */
export function parseCloudVariant(value) {
    return typeof value === "string" && CLOUD_VARIANTS.includes(value)
        ? value
        : null;
}
// ---------------------------------------------------------------------------
// telemetry — sub-verb for bkit telemetry <subverb>
// ---------------------------------------------------------------------------
/** Valid sub-verbs accepted by `bkit telemetry <subverb>`. */
export const TELEMETRY_SUBVERBS = ["migrate", "summary", "validate", "normalise"];
/** Narrow an unknown string to `TelemetrySubverb` or return null if invalid. */
export function parseTelemetrySubverb(value) {
    return typeof value === "string" && TELEMETRY_SUBVERBS.includes(value)
        ? value
        : null;
}
// ---------------------------------------------------------------------------
// comply — compliance grader phases
// ---------------------------------------------------------------------------
/** Valid workflow phases accepted by `bkit comply --phase <phase>`. */
export const COMPLY_PHASES = ["design", "plan", "build", "debug", "ship"];
/** Narrow an unknown string to `ComplyPhase` or return null if invalid. */
export function parseComplyPhase(value) {
    return typeof value === "string" && COMPLY_PHASES.includes(value)
        ? value
        : null;
}
// Bare module-flag tokens accepted on the CLI. `opencode` (value-bearing), `tooling`,
// `ci`, and `typescript` are intercepted by dedicated branches in parseArgs before this
// set is consulted; the generic check only ever validates claude/cursor. `full`, `core`,
// `lint`, `git-hooks`, `renovate`, `dependabot` and `cloud` are NOT accepted as bare flags
// (#252/#265): use `--ci`/`--typescript`/`--tooling`, `--dependency=<renovate|dependabot>`,
// and `--auto=<claude|cursor>`; core is implicit.
const MODULE_FLAGS = new Set([
    "claude",
    "cursor",
    "opencode",
    "tooling",
    "ci",
    "typescript",
]);
// ALL_MODULES — every non-opt-in module, core first. Used to expand a bare/full
// uninstall (which additionally pulls in the opt-in add-ons below for zero footprint).
const ALL_MODULES = ["core", "claude", "cursor", "ci", "lint", "git-hooks"];
/**
 * Opt-in modules: never installed implicitly; each requires an explicit flag
 * (`--dependency=`, `--auto=`, `--opencode=`). A bare/full `uninstall` DOES remove
 * them (zero footprint). Rationale: renovate's App scans the default branch first;
 * renovate+dependabot open competing PRs; cloud auto-dispatches agents and is inert
 * without secrets; opencode is a provider-pluggable additive host. See issue #119.
 */
export const OPTIN_MODULES = new Set(["renovate", "dependabot", "cloud", "opencode"]);
/**
 * Resolve the explicit module-flag set into the concrete module set to dispatch.
 * `flags` holds the internal module names the user explicitly named — core is NOT
 * among them (it is implicit) and `tooling` is already expanded to ci/lint/git-hooks
 * by parseArgs. The install "≥1 flag required" rule is enforced by the caller
 * (bkit-install.ts main), not here.
 *
 *   install / check / upgrade / doctor / status → core implicit + the named modules.
 *   uninstall (bare)     → every module incl. opt-in add-ons + core (zero footprint).
 *   uninstall (targeted) → the named modules ONLY (core is removed only by a bare
 *                          uninstall — a targeted uninstall must not strip the shared
 *                          foundation, e.g. `uninstall --tooling` keeps AGENTS.md).
 */
export function resolveModules(flags, verb) {
    if (verb === "uninstall") {
        if (flags.size === 0) {
            const out = new Set(ALL_MODULES);
            for (const m of OPTIN_MODULES)
                out.add(m);
            return out;
        }
        return new Set(flags);
    }
    const out = new Set(flags);
    out.add("core");
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
    return { nonInteractive: false, dryRun: false, toVersion: null, latest: false };
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
        firstArg === "status" ||
        firstArg === "uninstall" ||
        firstArg === "upgrade") {
        verb = firstArg;
        args.shift();
    }
    else if (firstArg === "comply") {
        verb = "comply";
        args.shift();
    }
    else if (firstArg === "harvest") {
        verb = "harvest";
        args.shift();
        // harvest takes no flags — reject any remaining args
        if (args.length > 0 && !args[0]?.startsWith("-")) {
            console.error(`[bkit] \`bkit harvest\` takes no positional args. Run \`bkit help\` for usage.`);
            process.exit(1);
        }
    }
    else if (firstArg === "analysis") {
        verb = "analysis";
        args.shift();
        // analysis takes no flags — reject any remaining positional args
        if (args.length > 0 && !args[0]?.startsWith("-")) {
            console.error(`[bkit] \`bkit analysis\` takes no positional args. Run \`bkit help\` for usage.`);
            process.exit(1);
        }
    }
    else if (firstArg === "telemetry") {
        verb = "telemetry";
        args.shift();
    }
    else if (firstArg === "cursor" || firstArg === "opencode") {
        verb = firstArg;
        args.shift();
        // Launcher verbs take no flags — reject any remaining args up-front.
        if (args.length > 0) {
            console.error(`[bkit] \`bkit ${firstArg}\` takes no flags. Run \`bkit help\` for usage.`);
            process.exit(1);
        }
    }
    else if (firstArg === "help" || firstArg === "--help" || firstArg === "-h") {
        verb = "help";
        args.shift();
    }
    else if (firstArg !== undefined && !firstArg.startsWith("-")) {
        // Unknown verb (`init` removed in v0.2.0 — name modules explicitly, e.g.
        // `install --claude --tooling`).
        console.error(`[bkit] Unknown verb: ${firstArg}. Run \`bkit help\` for usage.`);
        process.exit(1);
    }
    // Accumulates the internal module names the user explicitly named (no core;
    // `--tooling` expanded to ci/lint/git-hooks). resolveModules turns this into the
    // dispatch set; main() reads it for the install/check/upgrade flag guards.
    const moduleFlags = new Set();
    const uninstallFlags = defaultUninstallFlags();
    const upgradeFlags = defaultUpgradeFlags();
    let tracker = null;
    let cloudVariant = null;
    let opencodeProvider = null;
    let renovateRunner = null;
    let complyPhase = null;
    let telemetrySubverb = null;
    const telemetryMigrateFlags = { dryRun: false };
    // For `telemetry` verb: extract the sub-verb from the first remaining positional arg
    if (verb === "telemetry") {
        const subVerbArg = args[0];
        if (subVerbArg !== undefined && !subVerbArg.startsWith("-")) {
            const parsed = parseTelemetrySubverb(subVerbArg);
            if (parsed === null) {
                console.error(`[bkit] Unknown telemetry sub-verb: "${subVerbArg}". Valid values: ${TELEMETRY_SUBVERBS.join(", ")}`);
                process.exit(1);
            }
            telemetrySubverb = parsed;
            args.shift();
        }
        else if (subVerbArg === undefined) {
            console.error(`[bkit] \`bkit telemetry\` requires a sub-verb. Valid values: ${TELEMETRY_SUBVERBS.join(", ")}`);
            process.exit(1);
        }
    }
    for (const arg of args) {
        // `--help` / `-h` after a verb (e.g. `bkit install --help`) prints usage instead of
        // erroring with "Unknown flag: --help" — many users expect subcommand help. (#255 P3)
        if (arg === "--help" || arg === "-h") {
            verb = "help";
            break;
        }
        if (arg.startsWith("--")) {
            const flag = arg.slice(2);
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
            // Value-bearing flag: --phase=<design|plan|build|debug|ship>
            // `bkit comply` — the workflow phase being graded.
            // `bkit telemetry summary` — the workflow to report a chain rollup for.
            // Rejected for all other verbs.
            if (flag.startsWith("phase=")) {
                if (verb !== "comply" && verb !== "telemetry") {
                    console.error(`[bkit] --phase is only valid with the \`comply\` and \`telemetry\` verbs. Run \`bkit help\` for usage.`);
                    process.exit(1);
                }
                const value = flag.slice("phase=".length);
                const parsed = parseComplyPhase(value);
                if (parsed === null) {
                    console.error(`[bkit] Unknown phase: "${value}". Valid values: ${COMPLY_PHASES.join(", ")}`);
                    process.exit(1);
                }
                complyPhase = parsed;
                continue;
            }
            if (flag === "phase") {
                console.error(`[bkit] --phase requires a value: --phase=<${COMPLY_PHASES.join("|")}>. Run \`bkit help\` for usage.`);
                process.exit(1);
            }
            // Value-bearing flag: --auto=<claude|cursor> — cloud-agent (auto-dispatch) lane;
            // sets the internal `cloud` module. Bare `--auto` (no variant) is accepted only on
            // uninstall (variant read from package.json). The old `--cloud` / `--cloud=<v>`
            // spelling was dropped (#252) — it now falls through to the generic "Unknown flag".
            if (flag === "auto") {
                if (verb !== "uninstall") {
                    console.error(`[bkit] --auto requires an explicit variant: --auto=claude, --auto=cursor, or --auto=opencode. Run \`bkit help\` for usage.`);
                    process.exit(1);
                }
                // uninstall --auto: add the module flag without setting a cloudVariant.
                moduleFlags.add("cloud");
                continue;
            }
            if (flag.startsWith("auto=")) {
                const value = flag.slice("auto=".length);
                const parsed = parseCloudVariant(value);
                if (parsed === null) {
                    console.error(`[bkit] Unknown cloud variant: "${value}". Valid values: ${CLOUD_VARIANTS.join(", ")}`);
                    process.exit(1);
                }
                cloudVariant = parsed;
                moduleFlags.add("cloud");
                continue;
            }
            // Value-bearing flag: --opencode=<provider>
            // Additive opencode host opt-in. Supported providers: ollama-local, nvidia, groq,
            // cerebras, openrouter, ollama (cloud), opencode-zen + opencode-go (opencode-native
            // gateways) (strict allowlist).
            // A value is required (provider identifies which API key + base URL to configure).
            if (flag === "opencode") {
                if (verb !== "uninstall") {
                    console.error(`[bkit] --opencode requires an explicit provider: --opencode=<provider> (e.g. --opencode=opencode-zen). Run \`bkit help\` for usage.`);
                    process.exit(1);
                }
                // uninstall --opencode: add the module flag without requiring a provider value.
                moduleFlags.add("opencode");
                continue;
            }
            if (flag.startsWith("opencode=")) {
                const rawValue = flag.slice("opencode=".length);
                if (!rawValue) {
                    console.error(`[bkit] --opencode= requires a provider value (e.g. --opencode=opencode-zen). Run \`bkit help\` for usage.`);
                    process.exit(1);
                }
                // Normalise legacy aliases before the allowlist check so both spellings
                // resolve to the canonical provider key recorded in package.json.
                const value = normalizeOpencodeProvider(rawValue);
                if (!OPENCODE_PROVIDERS.includes(value)) {
                    console.error(`[bkit] --opencode= unsupported provider ${JSON.stringify(rawValue)}. Supported: ${OPENCODE_PROVIDERS.join(", ")}.`);
                    process.exit(1);
                }
                opencodeProvider = value;
                moduleFlags.add("opencode");
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
            // Value-bearing flag: --renovate=<mend|self> (#325) — selects the renovate
            // module AND its runner in ONE flag (mirrors --auto=/--opencode=/--dependency=).
            // `self` ships a `.github/workflows/renovate.yml` (self-hosted GitHub Actions,
            // ~16 GB); `mend` (default) uses the hosted App and reclaims a stale workflow.
            // Auto-adds the renovate module, so it stands alone — like `--typescript` auto-adds
            // `--ci`. `--dependency=renovate` remains an equivalent way to select renovate (mend).
            if (flag.startsWith("renovate=")) {
                const value = flag.slice("renovate=".length);
                const parsed = parseRenovateRunner(value);
                if (parsed === null) {
                    console.error(`[bkit] Unknown renovate runner: "${value}". Valid values: ${RENOVATE_RUNNERS.join(", ")}`);
                    process.exit(1);
                }
                renovateRunner = parsed;
                moduleFlags.add("renovate");
                continue;
            }
            // Uninstall-specific flags (accepted for all verbs that use them)
            if (flag === "dry-run") {
                uninstallFlags.dryRun = true;
                upgradeFlags.dryRun = true;
                telemetryMigrateFlags.dryRun = true;
                continue;
            }
            if (flag === "force") {
                // Uninstall-only (#252): force-delete Tier-3 files even if consumer-modified.
                // The install-side tracker-switch override was dropped — tracker switching is
                // now free, so `--force` no longer affects install.
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
            // Upgrade-specific flag: --auto-apply (renamed from --non-interactive, #252) —
            // auto-apply non-conflicting changes, emit the conflict list, exit non-zero on
            // any conflict (CI-safe). The internal field stays `nonInteractive`.
            if (flag === "auto-apply") {
                upgradeFlags.nonInteractive = true;
                continue;
            }
            // Upgrade-specific atomic self-bump (see runSelfBump). `--to=<version>` pins a
            // target @cbartens/bkit version; `--latest` resolves the newest published one.
            // Either makes the package bump atomic with the re-render so a bumped package
            // can never drift from its rendered mirrors. Verb/mutual-exclusion guards below.
            if (flag.startsWith("to=")) {
                upgradeFlags.toVersion = flag.slice("to=".length);
                continue;
            }
            if (flag === "latest") {
                upgradeFlags.latest = true;
                continue;
            }
            // --tooling (#252): back-compat alias = --ci --typescript. Expands to the
            // interdependent ci+lint+git-hooks bundle (husky hooks run vale/slop; CI runs
            // lint+check). Symmetric install↔uninstall (removes all three).
            if (flag === "tooling") {
                moduleFlags.add("ci");
                moduleFlags.add("lint");
                moduleFlags.add("git-hooks");
                continue;
            }
            // --ci (#265): the stack-agnostic CI/quality foundation — ci.yml skeleton + vale
            // prose-lint. No Node/TS footprint. Maps to the internal `ci` module only.
            if (flag === "ci") {
                moduleFlags.add("ci");
                continue;
            }
            // --typescript (#265): the Node/TS toolchain — slop-scan (+ type-suppression rule),
            // prettier, tsc typecheck, husky + lint-staged, and the WIRED ci.yml step bodies.
            // Depends-on --ci: on install we auto-add `ci` so the wired ci.yml is seeded. On
            // uninstall we DROP only the TS bits (lint + git-hooks), leaving the agnostic ci
            // foundation in place (a downgrade to --ci, not a full teardown). `--tooling`
            // remains the symmetric remove-all-three alias for legacy consumers.
            if (flag === "typescript") {
                moduleFlags.add("lint");
                moduleFlags.add("git-hooks");
                if (verb !== "uninstall")
                    moduleFlags.add("ci");
                continue;
            }
            // Bare module flags. opencode/tooling are intercepted above; only claude/cursor
            // reach here. Everything else (incl. the dropped --full/--core/--ci/--lint/
            // --git-hooks/--renovate/--dependabot/--cloud) hits the generic unknown-flag error.
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
    // Self-bump flags (`--to=`/`--latest`) only apply to the `upgrade` verb, and the
    // two are mutually exclusive (pin a version OR resolve the latest, not both).
    if ((upgradeFlags.toVersion !== null || upgradeFlags.latest) && verb !== "upgrade") {
        console.error("[bkit] `--to=<version>` / `--latest` are only valid for `bkit upgrade` (they atomically bump @cbartens/bkit, then re-render).");
        process.exit(1);
    }
    if (upgradeFlags.toVersion !== null && upgradeFlags.latest) {
        console.error("[bkit] `--to=<version>` and `--latest` are mutually exclusive — pin a version or resolve the latest, not both.");
        process.exit(1);
    }
    if (upgradeFlags.toVersion !== null && upgradeFlags.toVersion.trim() === "") {
        console.error("[bkit] `--to=` requires a version value, e.g. `--to=4.1.5`.");
        process.exit(1);
    }
    // resolveModules is verb-aware: a bare uninstall expands to all modules + opt-ins +
    // core (zero footprint); every other verb keeps core implicit + the named modules.
    const modules = resolveModules(moduleFlags, verb);
    return {
        verb,
        modules,
        moduleFlags,
        uninstallFlags,
        upgradeFlags,
        tracker,
        cloudVariant,
        opencodeProvider,
        renovateRunner,
        complyPhase,
        telemetrySubverb,
        telemetryMigrateFlags,
    };
}
export function printUsage() {
    console.log(`bkit — agent-stack consolidation CLI

Usage:
  bkit install <module-flags>   Install (or re-sync) the named modules + the implicit
                                 core foundation. At least one module flag is REQUIRED —
                                 a bare \`bkit install\` errors (name the modules below).
                                 Hosts compose: --claude --cursor --opencode=<provider>.
  bkit check                     Dry-run — drift-check everything already installed (no
                                 module flags). Exits 1 when a managed file needs
                                 re-rendering; Tier-3 (seed-or-print, e.g. ci.yml) drift
                                 is an advisory (non-blocking). The CI gate.
  bkit upgrade [--to=<version>|--latest] [--auto-apply] [--dry-run]
                                 Upgrade everything installed (no module flags). Diffs old
                                 vs new templates; conflict list emitted to stderr. Use
                                 --auto-apply for CI (apply non-conflicting; exit non-zero
                                 on any conflict).
                                 --to=<version> / --latest atomically BUMP @cbartens/bkit
                                 (pnpm add), then re-render + re-pin in one step — so a
                                 version bump can never drift from its rendered mirrors.
                                 This is the supported way to move bkit versions; a bare
                                 \`pnpm add @cbartens/bkit\` alone leaves mirrors stale.
  bkit uninstall [module-flags] Remove bkit-managed files + strip managed blocks.
                                 No flags = full removal — ALL modules incl. opt-in add-ons
                                 (renovate/dependabot/cloud/opencode) + core. Consumer-modified
                                 files, the docs/ payload, and generated artefacts
                                 (.bkit/advisories.md, .bkit/friction.jsonl) are preserved (use
                                 --nuke to force-remove manifest-listed files). Target with the
                                 same module flags as install (e.g. uninstall --tooling); a
                                 targeted uninstall leaves core untouched.
  bkit doctor                   Read-only preflight + post-install advisory replay.
                                 Diagnose token surfaces and config drift. Exits 0.
  bkit status                   Read-only host/provider status. Reports current host+provider
                                 (sampled from .opencode/opencode.json, .claude/, .cursor/).
                                 Writes nothing. Exits 0.
  bkit cursor                   Launch Cursor with .bkit/.env loaded into its environment.
                                 macOS GUI apps launched from the Dock/Finder do not inherit
                                 the login shell env (direnv stays shell-only), so MCP token
                                 placeholders resolve empty. This verb execs the app binary
                                 directly with the per-repo .bkit/.env merged in. Quit Cursor
                                 before running — a running instance ignores the new env.
                                 Override binary path via BKIT_CURSOR_BIN=<path>.
  bkit opencode                 Same as \`bkit cursor\` but for the opencode desktop app.
                                 Override binary path via BKIT_OPENCODE_BIN=<path>.
  bkit comply --phase=<phase>   Run the compliance grader advisory step.
                                 Checks the diff since parentSha for violations
                                 (no-mirror-edit, skip-ci-not-head). Advisory only —
                                 never gates a workflow. Appends kind:"compliance"
                                 rows to .bkit/stats.jsonl. Fail-open: always exits 0.
                                 Valid phases: design, plan, build, debug, ship.
  bkit harvest                  Cross-repo harvest — COPIES consumer .bkit/stats.jsonl
                                 and MOVES .bkit/friction.jsonl into harvest/ (COUNT-ONLY
                                 for docs/deferrals.jsonl and docs/failures.jsonl).
                                 Reads consumer paths from .bkit/consumers.md.
                                 DESTRUCTIVE: harvested friction rows are REMOVED from
                                 the consumer, but only after they are fsync'd and read
                                 back from harvest/. stats.jsonl is never modified.
                                 harvest/ accumulates and is never cleared — commit it,
                                 as it is the only record of pruned rows. Never commits
                                 in any repo. Deduplicates by per-kind composite
                                 identity. Advisory + fail-open: exits 0.
  bkit telemetry migrate [--dry-run]
                                 Migrate docs/knowledge.md + docs/decisions.md to
                                 docs/knowledge.jsonl + docs/decisions.jsonl (kind:"knowledge"
                                 and kind:"decision" rows). Parity-gated + destructive: ports
                                 each entry with its KN-N/DE-N id + legacy Related:
                                 graph in references[], its Severity and its
                                 Description prose, verifies
                                 row-count parity against a transient .md.bak, then DELETES
                                 the .md ONLY after parity is confirmed (idempotent: re-run
                                 is a no-op if migration already completed). A parity mismatch
                                 or absent .md.bak ABORTS with ZERO .md deleted. NEVER called
                                 from bkit upgrade — only via this explicit invocation.
                                 --dry-run: show what would be migrated without writing.
  bkit telemetry summary [--phase=<workflow>]
                                 Per-workflow telemetry report: THIS run's metrics
                                 (duration, size, friction/deferrals/failures added,
                                 compliance) against med·5 — the median of the previous 5
                                 same-workflow runs. The close step of every /bkit-*
                                 workflow calls this and posts it to the tracker comment.
                                 --phase=<workflow>: the workflow to report
                                 (design|plan|build|debug|ship). Without it, prints the
                                 ledger-health line only. Read-only: exits 0.
  bkit telemetry validate        Scan docs/decisions.jsonl + docs/knowledge.jsonl for
                                 DE-<n>/KN-<n> alias collisions — one number claimed by
                                 more than one row, which a bare citation resolves to
                                 ambiguously. Read-only. Exits 1 on a collision (the loud
                                 signal the merge=union append never surfaces); also WARNs
                                 on sequential keys minted outside the one-shot migration.
  bkit telemetry normalise [--dry-run]
                                 Normalise those ledgers off the retired sequential-alias
                                 scheme: drop the deprecated aliases[] field into
                                 references[], keep ts as the id, and re-key only the
                                 colliding rows (strip the shared number, preserve it as a
                                 references[] pointer). Parity-gated + idempotent: a re-run
                                 changes nothing. --dry-run: report without writing.
  bkit analysis                 Cross-repo analysis — reports counts/rates/elapsed-time,
                                 #183 size↔outcome regression, dispatch-size threshold,
                                 counterSource trust labelling, and per-rule compliance
                                 rate over kind:"compliance" rows. Reads from
                                 harvest/ and .bkit/stats.jsonl. Advisory +
                                 inform-only: exits 0.
  bkit help                     Print this message.

Core (implicit — no flag; installed/upgraded on every install):
  AGENTS.md (cross-host dispatch router), .agents/rules.md + payload, .gitignore +
  .gitattributes managed blocks, docs/, .bkit/*.md + .bkit/.env.example, .bkit/version.

Module flags (composable; symmetric install ↔ uninstall):
  --claude        .claude/agents/ + .claude/commands/ (byte-identical mirror) + CLAUDE.md
                  (root redirect to .agents/rules.md) + .claude settings/hooks.
  --cursor        .cursor/agents/ + .cursor/commands/ (T1/T2/T3 transforms) +
                  .cursor/rules/00-shared-rules.mdc + .cursor settings.
  --opencode=<provider>
                  Additive opencode host. Each install ADDS a provider block to
                  opencode.json; agent defaults track the last-installed (active) provider.
                  Provider value is REQUIRED. Supported: ollama-local, nvidia, groq,
                  cerebras, openrouter, ollama (cloud), opencode (opencode-native gateway;
                  auth via OPENCODE_API_KEY). Ships .opencode/** (agents, commands,
                  opencode.json, gateguard). Configure your provider key; verify with
                  \`bkit doctor\`. All installed providers tracked in bkit.opencodeProviders.
  --ci            Stack-agnostic CI/quality foundation: the ci.yml SKELETON (gate graph +
                  capstone contract + branch-protection, with Node/TS build/test steps as
                  commented examples) + Vale prose-lint. No Node/TS footprint — runs green
                  on any repo. Tier-3 seed-or-print.
  --typescript    Node/TS toolchain (implies --ci): tsc typecheck, slop-scan (+ the
                  boundary/type-suppression rule), prettier, husky + lint-staged, and the
                  WIRED ci.yml step bodies. Most of it is plain Node; name is colloquial.
  --tooling       Back-compat alias for \`--ci --typescript\` (the full ci+lint+git-hooks
                  bundle). Symmetric install↔uninstall (removes all three).
  --dependency=<renovate|dependabot>
                  Dependency updater (opt-in, mutually exclusive — both open PRs against
                  the same packages). renovate is phase-gated against the default branch;
                  dependabot is a first-party GitHub feature (no App / phase gate).
  --renovate=<mend|self>
                  Install Renovate + choose WHERE it runs (one flag; auto-selects the
                  renovate module). mend (default) = the hosted Mend GitHub App. self =
                  a bkit-managed GitHub Actions workflow on ubuntu-latest (~16 GB) — the
                  escape hatch for large monorepos that OOM on Mend's 3 GB hosted runner.
                  Switchable by re-install. (--dependency=renovate also works = mend.)
  --auto=<claude|cursor|opencode>
                  Cloud-agent (auto-dispatch) integration (opt-in). --auto=claude needs
                  tracker=github + ANTHROPIC_API_KEY + the Claude GitHub App; --auto=cursor
                  needs tracker=linear; --auto=opencode needs tracker=github + a remote
                  opencode provider (OPENCODE_PROVIDER_KEY). Bare --auto is accepted on
                  uninstall only.

Cross-cutting / modifiers:
  --tracker=<name>      Wire issue tracker integration. Values: github, linear, none
                        (default). Records bkit.issueTracker in package.json and substitutes
                        tracker snippets into command mirrors. Switching is free (re-run with
                        a new value). Does NOT own AGENTS.md (which is tracker-agnostic).

Install flags:
  --auto-revert         On a Phase 3 blocker, automatically run uninstall and exit 1.

Upgrade flags:
  --auto-apply          Apply non-conflicting changes; emit conflict list to stderr; exit
                        non-zero when any conflict is detected (CI-safe).
  --dry-run             Show what would change without writing.

Uninstall flags:
  --dry-run       Print decision table (FILE / DECISION / REASON) without writing.
  --opencode=<provider>
                  Surgical provider removal: removes that provider's block from
                  opencode.json + drops it from bkit.opencodeProviders. Does NOT remove
                  agents/commands/gateguard. If the removed provider was active, re-render
                  agents by running bkit install --opencode=<remaining> or bkit upgrade.
                  Bare --opencode (no value) tears down the entire opencode host.
  --force         Force-delete Tier-3 files even if consumer modified them.
  --nuke          Delete ALL bkit-managed files regardless of tier/hash (requires confirm).
  --yes           Skip interactive confirm for --nuke.
  --package       Also strip managed package.json scripts/devDependencies.
  --keep-npmrc    Preserve .npmrc (default: .npmrc is not bkit-managed, always preserved).
  --keep-tooling  Preserve tooling devDependencies (prettier/slop-scan/husky).

Examples:
  bkit install --claude                       .claude/** + CLAUDE.md + core.
  bkit install --claude --ci                  Claude host + stack-agnostic CI skeleton + core.
  bkit install --claude --cursor --typescript Both hosts + full Node/TS toolchain (implies --ci).
  bkit install --claude --cursor --tooling    Same as --ci --typescript (back-compat alias).
  bkit install --opencode=opencode-zen          opencode host (Zen built-in gateway, additive).
  bkit install --opencode=opencode-go           opencode host (Go built-in gateway, additive).
  bkit install --opencode=nvidia                add nvidia alongside an opencode gateway.
  bkit uninstall --opencode=nvidia              remove nvidia block only; keep the gateway.
  bkit install --claude --dependency=renovate Claude host + Renovate config (opt-in).
  bkit install --renovate=self
                                              Renovate via self-hosted GitHub Actions (16 GB;
                                              for repos that OOM on Mend's hosted runner).
  bkit install --tracker=github --auto=claude Claude cloud integration (GitHub tracker).
  bkit check                                  Drift-check everything installed (CI gate).
  bkit upgrade --auto-apply                   Upgrade installed files; CI-safe.
  bkit uninstall                              Full uninstall (all modules; artefacts kept, --nuke to purge).
  bkit uninstall --typescript                 Remove Node/TS toolchain only (keep --ci + core).
  bkit uninstall --tooling                    Remove ci/lint/git-hooks only (core kept).
  bkit cursor                                 Launch Cursor with .bkit/.env (MCP tokens).
  bkit opencode                               Launch opencode with .bkit/.env (API key).

macOS GUI-isolation note (launchctl fallback):
  If you prefer launching via the Dock/Spotlight instead of \`bkit cursor\` / \`bkit opencode\`,
  make the tokens visible to launchd-launched GUI apps with a one-shot setenv (does NOT
  survive reboot — must re-run after each restart):
    launchctl setenv GH_BKIT_TOKEN "$GH_BKIT_TOKEN"
    launchctl setenv NVIDIA_API_KEY "$NVIDIA_API_KEY"   # etc.
  For a persistent approach, add a RunAtLoad LaunchAgent plist under
  ~/Library/LaunchAgents/ that calls setenv for each key. This requires manual rotation
  whenever tokens change — prefer \`bkit cursor\` / \`bkit opencode\` for the dynamic model.

Consumer CI auth:
  Set GH_BKIT_TOKEN_INSTALL in GitHub Actions secrets (classic PAT with read:packages scope —
  fine-grained PATs are not currently supported by GitHub Packages npm registry).
  See README.md ## Consumer CI auth for setup steps.

Docs: https://github.com/cbartens/bkit/blob/main/README.md`);
}
