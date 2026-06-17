// bkit-cli.ts — parseArgs + printUsage for the v4-3 module-flag CLI surface.
// Exported and consumed by bkit-install.ts main().

import { ISSUE_TRACKERS, type IssueTracker, parseIssueTracker } from "./bkit-manifest.js";

export type ModuleFlag =
  | "core"
  | "claude"
  | "cursor"
  | "opencode"
  | "ci"
  | "lint"
  | "git-hooks"
  | "renovate"
  | "dependabot"
  | "cloud"
  // `tooling` and `typescript` are accepted CLI tokens only — parseArgs expands them
  // (tooling → ci/lint/git-hooks; typescript → ci+lint+git-hooks on install, lint/git-hooks
  // on uninstall), so they never appear in a resolved module set or the dispatch registry.
  // `ci` IS a real internal module (the stack-agnostic CI/vale foundation) and is accepted
  // bare; `lint`/`git-hooks` are reachable only via --typescript/--tooling, never bare.
  | "tooling"
  | "typescript";
export type { IssueTracker };

/** Cloud-agent variant chosen via `--auto=<variant>`. */
export const CLOUD_VARIANTS = ["claude", "cursor", "opencode"] as const;
export type CloudVariant = (typeof CLOUD_VARIANTS)[number];

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
  // opencode-native gateway. Auth via OPENCODE_API_KEY; models prefixed opencode/<id>.
  "opencode",
] as const;

/**
 * Hidden backward-compat aliases for `--opencode=<provider>` values (not exposed in
 * help text). Normalises legacy provider keys stored in package.json or passed on the
 * CLI to the current canonical key before allowlist validation.
 */
export const OPENCODE_PROVIDER_ALIASES: Record<string, string> = {
  // Legacy names kept only for existing installs reading stored "zen"/"go" from package.json.
  zen: "opencode",
  go: "opencode",
};

/** Normalise an `--opencode=` value through OPENCODE_PROVIDER_ALIASES (identity if no alias). */
export function normalizeOpencodeProvider(value: string): string {
  return OPENCODE_PROVIDER_ALIASES[value] ?? value;
}

/** Narrow an unknown string to `CloudVariant` or return `null` if invalid. */
export function parseCloudVariant(value: unknown): CloudVariant | null {
  return typeof value === "string" && (CLOUD_VARIANTS as readonly string[]).includes(value)
    ? (value as CloudVariant)
    : null;
}

export type Verb =
  | "install"
  | "check"
  | "doctor"
  | "status"
  | "uninstall"
  | "upgrade"
  | "cursor"
  | "opencode"
  | "help";

export interface ParsedArgs {
  verb: Verb;
  /**
   * Resolved module set to dispatch (core implicit; opt-ins + core on a bare uninstall).
   * See resolveModules.
   */
  modules: Set<ModuleFlag>;
  /**
   * The module flags the user EXPLICITLY named, as internal module names (core is
   * never here — it is implicit; `--tooling` is expanded to ci/lint/git-hooks). Drives
   * the install "≥1 flag required" guard and the check/upgrade "no module flags" guard
   * in main(). `--tracker` / `--auto-revert` are modifiers and are NOT counted here.
   */
  moduleFlags: Set<ModuleFlag>;
  /** Uninstall-specific flags (only populated when verb === "uninstall"). */
  uninstallFlags: UninstallFlags;
  /** Upgrade-specific flags (only populated when verb === "upgrade"). */
  upgradeFlags: UpgradeFlags;
  /** Issue tracker selected via `--tracker=<name>`. null = not specified (use manifest field or default). */
  tracker: IssueTracker | null;
  /** Cloud variant selected via `--auto=claude|cursor`. null = not specified. */
  cloudVariant: CloudVariant | null;
  /**
   * opencode provider selected via `--opencode=<provider>`. null = not specified.
   * Supported: see OPENCODE_PROVIDERS — strict allowlist (ollama-local, nvidia, groq,
   * cerebras, openrouter, ollama, opencode).
   * Required when installing the opencode module (additive host, opt-in).
   */
  opencodeProvider: string | null;
}

export interface UninstallFlags {
  dryRun: boolean;
  force: boolean;
  nuke: boolean;
  yes: boolean;
  stripPackage: boolean;
  keepNpmrc: boolean;
  keepTooling: boolean;
  autoRevert: boolean;
}

/** Flags for the `upgrade` verb (P4.T5/P4.T6). */
export interface UpgradeFlags {
  /** Non-interactive mode: auto-apply non-conflicting changes; emit conflict list to stderr; exit non-zero on conflicts. */
  nonInteractive: boolean;
  /** Dry-run: show what would change without writing. */
  dryRun: boolean;
}

// Bare module-flag tokens accepted on the CLI. `opencode` (value-bearing), `tooling`,
// `ci`, and `typescript` are intercepted by dedicated branches in parseArgs before this
// set is consulted; the generic check only ever validates claude/cursor. `full`, `core`,
// `lint`, `git-hooks`, `renovate`, `dependabot` and `cloud` are NOT accepted as bare flags
// (#252/#265): use `--ci`/`--typescript`/`--tooling`, `--dependency=<renovate|dependabot>`,
// and `--auto=<claude|cursor>`; core is implicit.
const MODULE_FLAGS = new Set<ModuleFlag>([
  "claude",
  "cursor",
  "opencode",
  "tooling",
  "ci",
  "typescript",
]);

// ALL_MODULES — every non-opt-in module, core first. Used to expand a bare/full
// uninstall (which additionally pulls in the opt-in add-ons below for zero footprint).
const ALL_MODULES: ModuleFlag[] = ["core", "claude", "cursor", "ci", "lint", "git-hooks"];

/**
 * Opt-in modules: never installed implicitly; each requires an explicit flag
 * (`--dependency=`, `--auto=`, `--opencode=`). A bare/full `uninstall` DOES remove
 * them (zero footprint). Rationale: renovate's App scans the default branch first;
 * renovate+dependabot open competing PRs; cloud auto-dispatches agents and is inert
 * without secrets; opencode is a provider-pluggable additive host. See issue #119.
 */
export const OPTIN_MODULES = new Set<ModuleFlag>(["renovate", "dependabot", "cloud", "opencode"]);

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
export function resolveModules(flags: Set<ModuleFlag>, verb: Verb): Set<ModuleFlag> {
  if (verb === "uninstall") {
    if (flags.size === 0) {
      const out = new Set<ModuleFlag>(ALL_MODULES);
      for (const m of OPTIN_MODULES) out.add(m);
      return out;
    }
    return new Set(flags);
  }
  const out = new Set(flags);
  out.add("core");
  return out;
}

function defaultUninstallFlags(): UninstallFlags {
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

function defaultUpgradeFlags(): UpgradeFlags {
  return { nonInteractive: false, dryRun: false };
}

/**
 * Parse argv (process.argv.slice(2)) into a ParsedArgs object.
 * Rejects unknown verbs and flags with process.exit(1).
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const args = [...argv];
  let verb: Verb = "help";

  // Verb extraction
  const firstArg = args[0];
  if (
    firstArg === "install" ||
    firstArg === "check" ||
    firstArg === "doctor" ||
    firstArg === "status" ||
    firstArg === "uninstall" ||
    firstArg === "upgrade"
  ) {
    verb = firstArg as Verb;
    args.shift();
  } else if (firstArg === "cursor" || firstArg === "opencode") {
    verb = firstArg as Verb;
    args.shift();
    // Launcher verbs take no flags — reject any remaining args up-front.
    if (args.length > 0) {
      console.error(`[bkit] \`bkit ${firstArg}\` takes no flags. Run \`bkit help\` for usage.`);
      process.exit(1);
    }
  } else if (firstArg === "help" || firstArg === "--help" || firstArg === "-h") {
    verb = "help";
    args.shift();
  } else if (firstArg !== undefined && !firstArg.startsWith("-")) {
    // Unknown verb (`init` removed in v0.2.0 — name modules explicitly, e.g.
    // `install --claude --tooling`).
    console.error(`[bkit] Unknown verb: ${firstArg}. Run \`bkit help\` for usage.`);
    process.exit(1);
  }

  // Accumulates the internal module names the user explicitly named (no core;
  // `--tooling` expanded to ci/lint/git-hooks). resolveModules turns this into the
  // dispatch set; main() reads it for the install/check/upgrade flag guards.
  const moduleFlags = new Set<ModuleFlag>();
  const uninstallFlags = defaultUninstallFlags();
  const upgradeFlags = defaultUpgradeFlags();
  let tracker: IssueTracker | null = null;
  let cloudVariant: CloudVariant | null = null;
  let opencodeProvider: string | null = null;

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
          console.error(
            `[bkit] Unknown tracker: "${value}". Valid values: ${ISSUE_TRACKERS.join(", ")}`,
          );
          process.exit(1);
        }
        tracker = parsed;
        continue;
      }

      // Value-bearing flag: --auto=<claude|cursor> — cloud-agent (auto-dispatch) lane;
      // sets the internal `cloud` module. Bare `--auto` (no variant) is accepted only on
      // uninstall (variant read from package.json). The old `--cloud` / `--cloud=<v>`
      // spelling was dropped (#252) — it now falls through to the generic "Unknown flag".
      if (flag === "auto") {
        if (verb !== "uninstall") {
          console.error(
            `[bkit] --auto requires an explicit variant: --auto=claude, --auto=cursor, or --auto=opencode. Run \`bkit help\` for usage.`,
          );
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
          console.error(
            `[bkit] Unknown cloud variant: "${value}". Valid values: ${CLOUD_VARIANTS.join(", ")}`,
          );
          process.exit(1);
        }
        cloudVariant = parsed;
        moduleFlags.add("cloud");
        continue;
      }

      // Value-bearing flag: --opencode=<provider>
      // Additive opencode host opt-in. Supported providers: ollama-local, nvidia, groq,
      // cerebras, openrouter, ollama (cloud), opencode (opencode-native gateway) (strict allowlist).
      // A value is required (provider identifies which API key + base URL to configure).
      if (flag === "opencode") {
        if (verb !== "uninstall") {
          console.error(
            `[bkit] --opencode requires an explicit provider: --opencode=<provider> (e.g. --opencode=opencode). Run \`bkit help\` for usage.`,
          );
          process.exit(1);
        }
        // uninstall --opencode: add the module flag without requiring a provider value.
        moduleFlags.add("opencode");
        continue;
      }
      if (flag.startsWith("opencode=")) {
        const rawValue = flag.slice("opencode=".length);
        if (!rawValue) {
          console.error(
            `[bkit] --opencode= requires a provider value (e.g. --opencode=opencode). Run \`bkit help\` for usage.`,
          );
          process.exit(1);
        }
        // Normalise legacy aliases before the allowlist check so both spellings
        // resolve to the canonical provider key recorded in package.json.
        const value = normalizeOpencodeProvider(rawValue);
        if (!(OPENCODE_PROVIDERS as readonly string[]).includes(value)) {
          console.error(
            `[bkit] --opencode= unsupported provider ${JSON.stringify(rawValue)}. Supported: ${OPENCODE_PROVIDERS.join(", ")}.`,
          );
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
          console.error(
            `[bkit] Unknown dependency updater: "${value}". Valid values: renovate, dependabot`,
          );
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
        if (verb !== "uninstall") moduleFlags.add("ci");
        continue;
      }

      // Bare module flags. opencode/tooling are intercepted above; only claude/cursor
      // reach here. Everything else (incl. the dropped --full/--core/--ci/--lint/
      // --git-hooks/--renovate/--dependabot/--cloud) hits the generic unknown-flag error.
      const moduleFlag = flag as ModuleFlag;
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
    console.error(
      "[bkit] `--renovate` and `--dependabot` are mutually exclusive (running both opens competing PRs against the same packages). Pick one.",
    );
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
  };
}

export function printUsage(): void {
  console.log(`bkit — agent-stack consolidation CLI

Usage:
  bkit install <module-flags>   Install (or re-sync) the named modules + the implicit
                                 core foundation. At least one module flag is REQUIRED —
                                 a bare \`bkit install\` errors (name the modules below).
                                 Hosts compose: --claude --cursor --opencode=<provider>.
  bkit check                     Dry-run — drift-check everything already installed (no
                                 module flags). Exits 1 on drift. This is the CI gate.
  bkit upgrade [--auto-apply] [--dry-run]
                                 Upgrade everything installed (no module flags). Diffs old
                                 vs new templates; conflict list emitted to stderr. Use
                                 --auto-apply for CI (apply non-conflicting; exit non-zero
                                 on any conflict).
  bkit uninstall [module-flags] Remove bkit-managed files + strip managed blocks.
                                 No flags = full removal — ALL modules incl. opt-in add-ons
                                 (renovate/dependabot/cloud/opencode) + core. Consumer-modified
                                 files, the docs/ payload, and generated artefacts
                                 (.bkit/advisories.md, .bkit/friction.md) are preserved (use
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
  bkit install --opencode=opencode            opencode host (opencode-native gateway, additive).
  bkit install --opencode=nvidia              add nvidia alongside opencode gateway.
  bkit uninstall --opencode=nvidia            remove nvidia block only; keep opencode.
  bkit install --claude --dependency=renovate Claude host + Renovate config (opt-in).
  bkit install --tracker=github --auto=claude Claude cloud integration (GitHub tracker).
  bkit check                                  Drift-check everything installed (CI gate).
  bkit upgrade --auto-apply                   Upgrade installed files; CI-safe.
  bkit uninstall                              Full uninstall (all modules, zero footprint).
  bkit uninstall --typescript                 Remove Node/TS toolchain only (keep --ci + core).
  bkit uninstall --tooling                    Remove ci/lint/git-hooks only (core kept).
  bkit cursor                                 Launch Cursor with .bkit/.env (MCP tokens).
  bkit opencode                               Launch opencode with .bkit/.env (API key).

macOS GUI-isolation note (launchctl fallback):
  If you prefer launching via the Dock/Spotlight instead of \`bkit cursor\` / \`bkit opencode\`,
  make the tokens visible to launchd-launched GUI apps with a one-shot setenv (does NOT
  survive reboot — must re-run after each restart):
    launchctl setenv GH_TOKEN "$GH_TOKEN"
    launchctl setenv NVIDIA_API_KEY "$NVIDIA_API_KEY"   # etc.
  For a persistent approach, add a RunAtLoad LaunchAgent plist under
  ~/Library/LaunchAgents/ that calls setenv for each key. This requires manual rotation
  whenever tokens change — prefer \`bkit cursor\` / \`bkit opencode\` for the dynamic model.

Consumer CI auth:
  Set GH_BKIT_TOKEN in GitHub Actions secrets (classic PAT with read:packages scope —
  fine-grained PATs are not currently supported by GitHub Packages npm registry).
  See README.md ## Consumer CI auth for setup steps.

Docs: https://github.com/cbartens/bkit/blob/main/README.md`);
}
