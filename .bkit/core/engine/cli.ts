#!/usr/bin/env node
// cli.ts — the `bkit` bin: parseArgs + printUsage for the v4-3 module-flag CLI surface, and
// main(), which dispatches each verb to its command and runs when this file is executed.

import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ISSUE_TRACKERS, type IssueTracker, parseIssueTracker } from "./install/manifest.js";
import { COMMANDS } from "./commands/registry.js";
import { LOG_PREFIX, setLogPrefix } from "./shared/log-prefix.js";
import { runCommand } from "./commands/lib.js";
import { launchApp } from "./commands/launch.js";
import { runStatus, runDoctor } from "./commands/install/doctor.js";
import { runComplyCommand } from "./commands/comply.js";
import { runHarvestCommand } from "./commands/harvest.js";
import { runAnalysisCommand } from "./commands/analysis.js";
import { runTelemetryCommand } from "./commands/telemetry.js";
import { runTipsCommand } from "./commands/tips.js";
import { runUpgradeCommand } from "./commands/install/upgrade.js";
import { runUninstallCommand } from "./commands/install/uninstall.js";
import { runInstall } from "./commands/install/install.js";
import { OPTIN_MODULES } from "./install/manifest.js";
import { OPENCODE_PROVIDERS } from "./shared/egress.js";

export type ModuleFlag =
  "core" | "claude" | "cursor" | "opencode" | "codex" | "antigravity" | "cloud";

/** Cloud-agent variant chosen via `--auto=<variant>`. */
export const CLOUD_VARIANTS = ["claude", "cursor", "opencode"] as const;
export type CloudVariant = (typeof CLOUD_VARIANTS)[number];

/** Narrow an unknown string to `CloudVariant` or return `null` if invalid. */
export function parseCloudVariant(value: unknown): CloudVariant | null {
  return typeof value === "string" && (CLOUD_VARIANTS as readonly string[]).includes(value)
    ? (value as CloudVariant)
    : null;
}

/**
 * The first words `parseArgs` treats as a verb. A `bkit <noun> <verb>` command whose
 * noun is also listed here routes only when its second word is one of its verbs.
 */
export const CLASSIC_VERBS: ReadonlySet<string> = new Set([
  "install",
  "check",
  "doctor",
  "status",
  "uninstall",
  "upgrade",
  "comply",
  "harvest",
  "analysis",
  "telemetry",
  "tips",
  "cursor",
  "opencode",
  "help",
]);

export type Verb =
  | "install"
  | "check"
  | "doctor"
  | "status"
  | "uninstall"
  | "upgrade"
  | "cursor"
  | "opencode"
  | "comply"
  | "harvest"
  | "analysis"
  | "telemetry"
  | "tips"
  | "help";

// ---------------------------------------------------------------------------
// telemetry — sub-verb for bkit telemetry <subverb>
// ---------------------------------------------------------------------------

/** Valid sub-verbs accepted by `bkit telemetry <subverb>`. */
export const TELEMETRY_SUBVERBS = ["summary"] as const;
export type TelemetrySubverb = (typeof TELEMETRY_SUBVERBS)[number];

/** Narrow an unknown string to `TelemetrySubverb` or return null if invalid. */
export function parseTelemetrySubverb(value: unknown): TelemetrySubverb | null {
  return typeof value === "string" && (TELEMETRY_SUBVERBS as readonly string[]).includes(value)
    ? (value as TelemetrySubverb)
    : null;
}

// ---------------------------------------------------------------------------
// comply — compliance grader phases
// ---------------------------------------------------------------------------

/** Valid workflow phases accepted by `bkit comply --phase <phase>`. */
export const COMPLY_PHASES = ["design", "plan", "build", "debug", "ship"] as const;
export type ComplyPhase = (typeof COMPLY_PHASES)[number];

/** Narrow an unknown string to `ComplyPhase` or return null if invalid. */
export function parseComplyPhase(value: unknown): ComplyPhase | null {
  return typeof value === "string" && (COMPLY_PHASES as readonly string[]).includes(value)
    ? (value as ComplyPhase)
    : null;
}

/**
 * Where `bkit tips --workflow=<name>` runs: a phase workflow, `audit` (`@bkit-audit-generate`)
 * or `utility` (the ledger and roadmap updaters).
 */
export const TIPS_CONTEXTS = [...COMPLY_PHASES, "audit", "utility"] as const;
export type TipsContext = (typeof TIPS_CONTEXTS)[number];

/** Narrow an unknown string to `TipsContext` or return null if invalid. */
export function parseTipsContext(value: unknown): TipsContext | null {
  return typeof value === "string" && (TIPS_CONTEXTS as readonly string[]).includes(value)
    ? (value as TipsContext)
    : null;
}

export interface ParsedArgs {
  verb: Verb;
  /**
   * Resolved module set to dispatch (core implicit; opt-ins + core on a bare uninstall).
   * See resolveModules.
   */
  modules: Set<ModuleFlag>;
  /**
   * The module flags the user EXPLICITLY named, as internal module names (core is
   * never here — it is implicit). Drives the install "≥1 flag required" guard and the
   * check/upgrade "no module flags" guard in main(). `--tracker` / `--auto-revert` are
   * modifiers and are NOT counted here.
   */
  moduleFlags: Set<ModuleFlag>;
  /** Uninstall-specific flags (only populated when verb === "uninstall"). */
  uninstallFlags: UninstallFlags;
  /** Upgrade-specific flags (only populated when verb === "upgrade"). */
  upgradeFlags: UpgradeFlags;
  /** Issue tracker selected via `--tracker=<name>`. null = not specified (use manifest field or default). */
  tracker: IssueTracker | null;
  /** Cloud variant selected via `--auto=<variant>` (see CLOUD_VARIANTS). null = not specified. */
  cloudVariant: CloudVariant | null;
  /**
   * opencode provider selected via `--opencode=<provider>`. null = not specified.
   * Supported: see OPENCODE_PROVIDERS — strict allowlist (openrouter, ollama,
   * opencode-zen, opencode-go).
   * Required when installing the opencode module (additive host, opt-in).
   */
  opencodeProvider: string | null;
  /**
   * Compliance-grader phase selected via `--phase=<phase>`.
   * Only populated when verb === "comply". null = not specified / not applicable.
   * Valid values: design | plan | build | debug | ship.
   */
  complyPhase: ComplyPhase | null;
  /**
   * Sub-verb for the `telemetry` verb (e.g. "summary").
   * Only populated when verb === "telemetry". null = not specified / not applicable.
   */
  telemetrySubverb: TelemetrySubverb | null;
  /** `bkit tips --all`: print every firing tip, not just the top three. */
  tipsAll: boolean;
  /** `bkit tips --workflow=<name>`: the workflow whose tips go first; it prints one. */
  tipsWorkflow: TipsContext | null;
}

export interface UninstallFlags {
  dryRun: boolean;
  force: boolean;
  nuke: boolean;
  yes: boolean;
  autoRevert: boolean;
}

/** Flags for the `upgrade` verb (P4.T5/P4.T6). */
export interface UpgradeFlags {
  /** Non-interactive mode: auto-apply non-conflicting changes; emit conflict list to stderr; exit non-zero on conflicts. */
  nonInteractive: boolean;
  /** Dry-run: show what would change without writing. */
  dryRun: boolean;
  /**
   * Atomic self-bump target (`--to=<version>`): install this @cbartens/bkit version,
   * then re-render + re-pin in one command so the package bump can never drift from
   * the rendered mirrors. null = no bump (re-render at the installed version).
   */
  toVersion: string | null;
  /** `--latest`: resolve the newest published version from the registry, then self-bump to it. */
  latest: boolean;
}

// Bare module-flag tokens accepted on the CLI. `opencode` (value-bearing) is
// intercepted by a dedicated branch in parseArgs before this set is consulted; the
// generic check only ever validates claude/cursor/codex. `full`, `core` and `cloud`
// are NOT accepted as bare flags: use `--auto=<variant>`; core is implicit.
// There is no dependency-updater flag. Copy an example; CI warns when none is present.
const MODULE_FLAGS = new Set<ModuleFlag>(["claude", "cursor", "opencode", "codex", "antigravity"]);

// ALL_MODULES — every non-opt-in module, core first. Used to expand a bare/full
// uninstall (which additionally pulls in the opt-in add-ons below for zero footprint).
const ALL_MODULES: ModuleFlag[] = ["core", "claude", "cursor"];

/**
 * Resolve the explicit module-flag set into the concrete module set to dispatch.
 * `flags` holds the internal module names the user explicitly named — core is NOT
 * among them (it is implicit). The install "≥1 flag required" rule is enforced by the
 * caller (commands/install/install.ts main), not here.
 *
 *   install / check / upgrade / doctor / status → core implicit + the named modules.
 *   uninstall (bare)     → every module incl. opt-in add-ons + core (zero footprint).
 *   uninstall (targeted) → the named modules ONLY (core is removed only by a bare
 *                          uninstall — a targeted uninstall must not strip the shared
 *                          foundation, e.g. `uninstall --claude` keeps AGENTS.md).
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
    autoRevert: false,
  };
}

function defaultUpgradeFlags(): UpgradeFlags {
  return { nonInteractive: false, dryRun: false, toVersion: null, latest: false };
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
  } else if (firstArg === "comply") {
    verb = "comply";
    args.shift();
  } else if (firstArg === "harvest") {
    verb = "harvest";
    args.shift();
    // harvest takes no flags — reject any remaining args
    if (args.length > 0 && !args[0]?.startsWith("-")) {
      console.error(
        `[bkit] \`bkit harvest\` takes no positional args. Run \`bkit help\` for usage.`,
      );
      process.exit(1);
    }
  } else if (firstArg === "analysis") {
    verb = "analysis";
    args.shift();
    // analysis takes no flags — reject any remaining positional args
    if (args.length > 0 && !args[0]?.startsWith("-")) {
      console.error(
        `[bkit] \`bkit analysis\` takes no positional args. Run \`bkit help\` for usage.`,
      );
      process.exit(1);
    }
  } else if (firstArg === "telemetry") {
    verb = "telemetry";
    args.shift();
  } else if (firstArg === "tips") {
    verb = "tips";
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
    console.error(`[bkit] Unknown verb: ${firstArg}. Run \`bkit help\` for usage.`);
    process.exit(1);
  }

  // Accumulates the internal module names the user explicitly named (no core).
  // resolveModules turns this into the dispatch set; main() reads it for the
  // install/check/upgrade flag guards.
  const moduleFlags = new Set<ModuleFlag>();
  const uninstallFlags = defaultUninstallFlags();
  const upgradeFlags = defaultUpgradeFlags();
  let tracker: IssueTracker | null = null;
  let cloudVariant: CloudVariant | null = null;
  let opencodeProvider: string | null = null;
  let complyPhase: ComplyPhase | null = null;
  let telemetrySubverb: TelemetrySubverb | null = null;
  let tipsAll = false;
  let tipsWorkflow: TipsContext | null = null;

  // For `telemetry` verb: extract the sub-verb from the first remaining positional arg
  if (verb === "telemetry") {
    const subVerbArg = args[0];
    if (subVerbArg !== undefined && !subVerbArg.startsWith("-")) {
      const parsed = parseTelemetrySubverb(subVerbArg);
      if (parsed === null) {
        console.error(
          `[bkit] Unknown telemetry sub-verb: "${subVerbArg}". Valid values: ${TELEMETRY_SUBVERBS.join(", ")}`,
        );
        process.exit(1);
      }
      telemetrySubverb = parsed;
      args.shift();
    } else if (subVerbArg === undefined) {
      console.error(
        `[bkit] \`bkit telemetry\` requires a sub-verb. Valid values: ${TELEMETRY_SUBVERBS.join(", ")}`,
      );
      process.exit(1);
    }
  }

  for (const arg of args) {
    // `--help` / `-h` after a verb (e.g. `bkit install --help`) prints usage.
    if (arg === "--help" || arg === "-h") {
      verb = "help";
      break;
    }
    if (arg.startsWith("--")) {
      const flag = arg.slice(2);

      // Value-bearing flag: --tracker=<github|linear|jira|none>
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

      // Value-bearing flag: --phase=<design|plan|build|debug|ship>
      // `bkit comply` — the workflow phase being graded.
      // `bkit telemetry summary` — the workflow to report a chain rollup for.
      // Rejected for all other verbs.
      if (flag.startsWith("phase=")) {
        if (verb !== "comply" && verb !== "telemetry") {
          console.error(
            `[bkit] --phase is only valid with the \`comply\` and \`telemetry\` verbs. Run \`bkit help\` for usage.`,
          );
          process.exit(1);
        }
        const value = flag.slice("phase=".length);
        const parsed = parseComplyPhase(value);
        if (parsed === null) {
          console.error(
            `[bkit] Unknown phase: "${value}". Valid values: ${COMPLY_PHASES.join(", ")}`,
          );
          process.exit(1);
        }
        complyPhase = parsed;
        continue;
      }
      if (flag === "phase") {
        console.error(
          `[bkit] --phase requires a value: --phase=<${COMPLY_PHASES.join("|")}>. Run \`bkit help\` for usage.`,
        );
        process.exit(1);
      }

      // Value-bearing flag: --auto=<variant> (CLOUD_VARIANTS) — cloud-agent (auto-dispatch) lane;
      // sets the internal `cloud` module. Bare `--auto` (no variant) is accepted only on
      // uninstall (variant read from package.json).
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
      // Additive opencode host opt-in. Supported providers: openrouter, ollama,
      // opencode-zen + opencode-go (opencode-native gateways) (strict allowlist).
      // A value is required (provider identifies which API key + base URL to configure).
      if (flag === "opencode") {
        if (verb !== "uninstall") {
          console.error(
            `[bkit] --opencode requires an explicit provider: --opencode=<provider> (e.g. --opencode=opencode-zen). Run \`bkit help\` for usage.`,
          );
          process.exit(1);
        }
        // uninstall --opencode: add the module flag without requiring a provider value.
        moduleFlags.add("opencode");
        continue;
      }
      if (flag.startsWith("codex=")) {
        console.error(
          `[bkit] --codex takes no value (got ${JSON.stringify("--" + flag)}). Codex CLI runs on one gateway (openai), so the flag is bare: --codex. Only --opencode is provider-pluggable.`,
        );
        process.exit(1);
      }
      if (flag.startsWith("antigravity=")) {
        console.error(
          `[bkit] --antigravity takes no value (got ${JSON.stringify("--" + flag)}). Antigravity runs on one gateway (google), so the flag is bare: --antigravity. Only --opencode is provider-pluggable.`,
        );
        process.exit(1);
      }
      if (flag.startsWith("opencode=")) {
        const rawValue = flag.slice("opencode=".length);
        if (!rawValue) {
          console.error(
            `[bkit] --opencode= requires a provider value (e.g. --opencode=opencode-zen). Run \`bkit help\` for usage.`,
          );
          process.exit(1);
        }
        if (!(OPENCODE_PROVIDERS as readonly string[]).includes(rawValue)) {
          console.error(
            `[bkit] --opencode= unsupported provider ${JSON.stringify(rawValue)}. Supported: ${OPENCODE_PROVIDERS.join(", ")}.`,
          );
          process.exit(1);
        }
        opencodeProvider = rawValue;
        moduleFlags.add("opencode");
        continue;
      }

      // Tips-only flags: --all prints every firing tip; --workflow=<name> puts the tips that
      // matter in that workflow first and prints one.
      if (flag === "all" && verb === "tips") {
        tipsAll = true;
        continue;
      }
      if (flag.startsWith("workflow=") && verb === "tips") {
        const value = flag.slice("workflow=".length);
        tipsWorkflow = parseTipsContext(value);
        if (tipsWorkflow === null) {
          console.error(
            `[bkit] Unknown workflow: "${value}". Valid values: ${TIPS_CONTEXTS.join(", ")}`,
          );
          process.exit(1);
        }
        continue;
      }

      // Uninstall-specific flags (accepted for all verbs that use them)
      if (flag === "dry-run") {
        uninstallFlags.dryRun = true;
        upgradeFlags.dryRun = true;
        continue;
      }
      if (flag === "force") {
        // Uninstall-only: force-delete whole-file owned files even if consumer-modified.
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
      if (flag === "auto-revert") {
        uninstallFlags.autoRevert = true;
        continue;
      }
      // Upgrade-specific flag: --auto-apply —
      // auto-apply non-conflicting changes, emit the conflict list, exit non-zero on
      // any conflict (CI-safe). The internal field is `nonInteractive`.
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

      // Bare module flags. opencode is intercepted above; only claude/cursor/codex
      // reach here. Everything else hits the generic unknown-flag error.
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

  // Self-bump flags (`--to=`/`--latest`) only apply to the `upgrade` verb, and the
  // two are mutually exclusive (pin a version OR resolve the latest, not both).
  if ((upgradeFlags.toVersion !== null || upgradeFlags.latest) && verb !== "upgrade") {
    console.error(
      "[bkit] `--to=<version>` / `--latest` are only valid for `bkit upgrade` (they atomically bump @cbartens/bkit, then re-render).",
    );
    process.exit(1);
  }
  if (upgradeFlags.toVersion !== null && upgradeFlags.latest) {
    console.error(
      "[bkit] `--to=<version>` and `--latest` are mutually exclusive — pin a version or resolve the latest, not both.",
    );
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
    complyPhase,
    telemetrySubverb,
    tipsAll,
    tipsWorkflow,
  };
}

export function printUsage(): void {
  console.log(
    `bkit — agent-stack consolidation CLI

Usage:
  bkit install <module-flags>   Install (or re-sync) the named modules + the implicit
                                 core foundation. At least one module flag is REQUIRED —
                                 a bare \`bkit install\` errors (name the modules below).
                                 Hosts compose: --claude --cursor --codex --antigravity
                                 --opencode=<provider>.
  bkit check                     Dry-run — drift-check everything already installed (no
                                 module flags). Exits 1 when a managed file needs
                                 re-rendering. Copies under .bkit/templates/ are refreshed by
                                 install/upgrade and checked for staleness — adopt one by
                                 copying it elsewhere; that copy is yours. The CI gate.
                                 Changes no managed file; rewrites .bkit/advisories.md.
  bkit upgrade [--to=<version>|--latest] [--auto-apply] [--dry-run]
                                 Upgrade everything installed (no module flags). Diffs old
                                 vs new templates; conflict list emitted to stderr. Use
                                 --auto-apply for CI (apply non-conflicting; exit non-zero
                                 on any conflict). Only a whole file you edited since bkit
                                 wrote it conflicts; rendered files (agents, commands,
                                 skills, .bkit/*.md) are always re-rendered — bkit check
                                 flags an edit to one.
                                 --to=<version> / --latest atomically BUMP @cbartens/bkit
                                 (pnpm add), then re-render + re-pin in one step — so a
                                 version bump can never drift from its rendered mirrors.
                                 This is the supported way to move bkit versions; a bare
                                 \`pnpm add @cbartens/bkit\` alone leaves mirrors stale.
  bkit uninstall [module-flags] Remove bkit-managed files + strip managed blocks.
                                 No flags = full removal — ALL modules incl. opt-in add-ons
                                 (cloud/opencode) + core. Consumer-owned updater configs
                                 (renovate.json5, dependabot.yml, bkit-renovate.yml) are left in place. Consumer-modified
                                 files, your own files under docs/, and generated artefacts
                                 (.bkit/advisories.md, .bkit/friction.jsonl) are preserved (use
                                 --nuke to force-remove manifest-listed files). Target with the
                                 same module flags as install (e.g. uninstall --claude); a
                                 targeted uninstall leaves core untouched.
  bkit doctor                   Preflight + post-install advisory replay (changes no
                                 managed file; rewrites .bkit/advisories.md). Diagnose
                                 token surfaces and config drift. Exits 0.
  bkit tips [--workflow=<name>] [--all]
                                 Setup tips: what this repo has not set up yet, most useful
                                 first, each with a sentence to ask your agent. Top three
                                 by default; --workflow=design|plan|build|debug|ship puts
                                 the tips that matter there first and prints one (each
                                 workflow runs this at its close; audit and utility do the
                                 same for audits and the ledger / roadmap updaters);
                                 --all lists every one. Ends with a star line ("bkit-star"
                                 in bkit.ignoreAdvisories silences it), except under
                                 --workflow=audit|utility. Local checks only. Exits 0.
  bkit status                   Read-only host/provider status. Reports current host+provider
                                 (sampled from .claude/, .cursor/, package.json, and the
                                 opencode agent model pins in .opencode/agents/).
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
                                 Reads consumer paths from harvest/consumers.md.
                                 DESTRUCTIVE: harvested friction rows are REMOVED from
                                 the consumer, but only after they are fsync'd and read
                                 back from harvest/. stats.jsonl is never modified.
                                 harvest/ accumulates and is never cleared; it is
                                 gitignored, so it is the only record of pruned rows —
                                 back it up. Never commits
                                 in any repo. Deduplicates by per-kind composite
                                 identity. Advisory + fail-open: exits 0.
  bkit telemetry summary [--phase=<workflow>]
                                 Per-workflow telemetry report: THIS run's metrics
                                 (duration, size, friction/deferrals/failures added,
                                 compliance) against med·5 — the median of the previous 5
                                 same-workflow runs. The close step of every /bkit-*
                                 workflow calls this and posts it to the tracker comment.
                                 --phase=<workflow>: the workflow to report
                                 (design|plan|build|debug|ship). Without it, prints the
                                 ledger-health line only. Read-only: exits 0.
  bkit analysis                 Cross-repo analysis — reports counts/rates/elapsed-time,
                                 change-size vs outcome regression, dispatch-size threshold,
                                 counterSource trust labelling, per-rule compliance
                                 rate over kind:"compliance" rows, and the
                                 unjustified-deferral rate per (subagent, model)
                                 over kind:"deferral" rows. Reads from harvest/,
                                 .bkit/stats.jsonl and docs/deferrals.jsonl.
                                 Advisory + inform-only: exits 0.
  bkit help                     Print this message.

Core (implicit — no flag; installed/upgraded on every install):
  AGENTS.md (cross-host dispatch router), .agents/rules.md + .agents/context.md +
  .agents/docs.md + .agents/skills.md managed blocks, .gitignore +
  .gitattributes managed blocks, docs/, .bkit/*.md, .bkit/version, the template copies in
  .bkit/templates/, and the bkit:gate:* / bkit:deps:* package.json scripts every workflow
  runs (added when missing, never overwritten, left by uninstall). The tool scripts those
  gates chain (typecheck, lint, format:check, lint:prose, slop:delta) and their devDeps are
  yours to add: see .bkit/templates.md.

Module flags (composable; symmetric install ↔ uninstall):
  --claude        .claude/agents/ + .claude/commands/ (byte-identical mirror) + CLAUDE.md
                  (root redirect to .agents/rules.md) + .claude settings/hooks + the
                  tracker entry in .mcp.json + .bkit/.env.example.
  --cursor        .cursor/agents/ + .cursor/commands/ (T1/T2/T3 transforms) +
                  .cursor/rules/bkit-rules.mdc + .cursor settings.
  --opencode=<provider>
                  Additive opencode host. Each install ADDS a provider block to
                  opencode.json; agent defaults track the last-installed (active) provider.
                  Provider value is REQUIRED. Supported: openrouter, ollama,
                  opencode-zen, opencode-go (opencode-native gateways;
                  auth via BKIT_OPENCODE_API_KEY).
                  Ships .opencode/** (agents, commands, opencode.json, bkit-gateguard.js,
                  bkit-readguard.js).
                  Configure your provider key; verify with \`bkit doctor\`. All installed
                  providers tracked in bkit.opencodeProviders.
  --codex         Codex CLI host. BARE flag — takes no value: Codex runs on one gateway
                  (openai), so only --opencode is provider-pluggable. Ships .codex/agents/*.toml
                  + .codex/hooks.json + .codex/hooks/bkit-{gateguard,guardrails,readguard}.cjs,
                  plus the workflow skills (.agents/skills/bkit-*/). Codex loads project-local
                  hooks ONLY once the .codex/ layer is trusted — until then they never fire.
  --antigravity   Google Antigravity IDE host. BARE flag — takes no value: Antigravity runs
                  on one gateway (google). Installs as a workspace PLUGIN at
                  .agents/plugins/bkit/ — plugin.json + skills/bkit-*/SKILL.md (workflow
                  skills) + agents/bkit-*.md (subagent prompts) + hooks.json + hooks/*.cjs,
                  keeping .agents/ root Codex's. Plus root GEMINI.md. There is no native
                  subagent tool: the orchestrator loads each prompt with view_file and runs
                  it in-session.

Dependency updaters (copy an example and own it):
  .bkit/templates/.github/renovate.json5
  .bkit/templates/.github/workflows/bkit-renovate.yml   (self-hosted runner, optional)
  .bkit/templates/.github/dependabot.yml
  All templates and install steps: .bkit/templates.md

  --auto=<claude|cursor|opencode>
                  Cloud-agent (auto-dispatch) integration (opt-in). --auto=claude needs
                  tracker=github + the ANTHROPIC_API_KEY repo secret (or the
                  ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables
                  for keyless federation) + the Claude GitHub App; --auto=cursor
                  needs tracker=linear; --auto=opencode needs tracker=github + a remote
                  opencode provider (OPENCODE_PROVIDER_KEY). Bare --auto is accepted on
                  uninstall only.

Cross-cutting / modifiers:
  --tracker=<name>      Wire issue tracker integration. Values: github, linear, jira, none
                        (default). Records bkit.issueTracker in package.json and substitutes
                        tracker snippets into command mirrors. Re-renders every installed
                        host, and works alone (bkit install --tracker=github). Switching is
                        free; a switch removes the old linear or jira MCP entry unless you
                        edited it (github always stays). Does NOT own AGENTS.md (tracker-agnostic).

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
                  agents/commands/gateguard. If the removed provider was active, the first
                  remaining provider becomes active and the agents are re-rendered to its
                  model pins.
                  Bare --opencode (no value) tears down the entire opencode host.
  --force         Delete owned whole-file files even if consumer modified them.
  --nuke          Delete ALL bkit-managed files regardless of tier/hash (requires confirm).
  --yes           Skip interactive confirm for --nuke.

Examples:
  bkit install --claude                       .claude/** + CLAUDE.md + core.
  bkit install --claude --cursor              Both hosts + core.
  bkit install --codex                        Codex CLI host (agents + workflow skills + hooks).
  bkit install --antigravity                  Google Antigravity host (workspace plugin under .agents/plugins/bkit/ + GEMINI.md).
  bkit install --opencode=opencode-zen          opencode host (Zen built-in gateway, additive).
  bkit install --opencode=opencode-go           opencode host (Go built-in gateway, additive).
  bkit install --opencode=openrouter            add openrouter alongside an opencode gateway.
  bkit install --opencode=ollama                Ollama cloud endpoint (BKIT_OLLAMA_API_KEY).
  bkit uninstall --opencode=openrouter          remove openrouter block only; keep the gateway.
  bkit install --tracker=github --auto=claude Claude cloud integration (GitHub tracker).
  bkit check                                  Drift-check everything installed (CI gate).
  bkit upgrade --auto-apply                   Upgrade installed files; CI-safe.
  bkit uninstall                              Full uninstall (all modules; artefacts kept, --nuke to purge).
  bkit uninstall --claude                     Remove the claude host only (core kept).
  bkit cursor                                 Launch Cursor with .bkit/.env (MCP tokens).
  bkit opencode                               Launch opencode with .bkit/.env (API key).

macOS GUI-isolation note (launchctl fallback):
  If you prefer launching via the Dock/Spotlight instead of \`bkit cursor\` / \`bkit opencode\`,
  make the tokens visible to launchd-launched GUI apps with a one-shot setenv (does NOT
  survive reboot — must re-run after each restart):
    launchctl setenv BKIT_GH_TOKEN "$BKIT_GH_TOKEN"
    launchctl setenv BKIT_OPENCODE_API_KEY "$BKIT_OPENCODE_API_KEY"   # etc.
  For a persistent approach that re-reads the tokens file on every change, copy the
  launchd template set (see \`.bkit/templates.md\` § Launchd GUI environment). Rotation
  then needs no re-bootstrap — prefer \`bkit cursor\` / \`bkit opencode\` for the dynamic model.

Docs: https://github.com/cbartens/bkit/blob/main/README.md` + commandsUsage(),
  );
}

/** The `bkit <noun> <verb>` section of the usage text; empty while no command is registered. */
function commandsUsage(): string {
  if (COMMANDS.length === 0) return "";
  const width = Math.max(...COMMANDS.map((c) => c.noun.length));
  return [
    "",
    "",
    "Workflow commands (bkit <noun> <verb> --flags; JSON on stdout; bkit <noun> --help):",
    ...COMMANDS.map((c) => `  bkit ${c.noun.padEnd(width)}  ${c.summary}`),
  ].join("\n");
}

/**
 * Validate the verb/module-flag combination before any dispatch
 * work runs. `install` requires >=1 module flag or `--tracker=` (which re-renders
 * every installed host); a bare install errors. `check` / `upgrade` take NO module
 * flags — they operate on everything already installed, so a stray flag is a hard
 * error pointing at the no-flag form. Returns the error message to print, or `null`
 * when the combination is valid.
 */
export function validateModuleFlagsForVerb(
  verb: Verb,
  moduleFlags: Set<ModuleFlag>,
  tracker: IssueTracker | null = null,
): string | null {
  if (verb === "install" && moduleFlags.size === 0 && tracker === null) {
    return (
      "[bkit] `bkit install` requires at least one module flag. Name what to install: " +
      "--claude, --cursor, --codex, --antigravity, --opencode=<provider> (plus opt-in " +
      `--auto=<${CLOUD_VARIANTS.join("|")}>), or --tracker=<name> alone to switch the ` +
      "tracker on what is installed. Run `bkit help` for usage."
    );
  }
  if ((verb === "check" || verb === "upgrade") && moduleFlags.size > 0) {
    return (
      `[bkit] \`bkit ${verb}\` takes no module flags — it operates on everything already ` +
      `installed. Re-run as \`bkit ${verb}\` (no module flags). Run \`bkit help\` for usage.`
    );
  }
  return null;
}

// The CLI entrypoint, run only when this file is executed and driven by real
// argv/fs/process.exit side effects; install.integration.test.ts exercises it through
// spawned processes. Pure decision logic lives in exported functions
// (validateModuleFlagsForVerb above, validateCloudTrackerMatch in commands/install/install.ts)
// for unit coverage.
export async function main() {
  const commandExit = await runCommand(process.argv.slice(2), COMMANDS, {
    classicVerbs: CLASSIC_VERBS,
  });
  if (commandExit !== null) {
    process.exitCode = commandExit;
    return;
  }

  const {
    verb,
    modules,
    moduleFlags,
    uninstallFlags,
    upgradeFlags,
    tracker,
    cloudVariant,
    opencodeProvider,
    complyPhase,
    telemetrySubverb,
    tipsAll,
    tipsWorkflow,
  } = parseArgs(process.argv.slice(2));

  // A bare `bkit` (no arguments) means no command was given: print usage and exit non-zero
  // (2 = usage error), distinct from an explicit `bkit help` / `--help` (verb "help"), which
  // prints the same usage and exits 0. parseArgs still defaults no-args to the "help" verb.
  if (process.argv.slice(2).length === 0) {
    printUsage();
    process.exit(2);
  }

  if (verb === "help") {
    printUsage();
    return;
  }

  if (verb === "comply") {
    runComplyCommand(complyPhase);
    return;
  }

  if (verb === "harvest") {
    runHarvestCommand();
    return;
  }

  if (verb === "analysis") {
    runAnalysisCommand();
    return;
  }

  if (verb === "telemetry") {
    runTelemetryCommand(telemetrySubverb, complyPhase);
    return;
  }

  if (verb === "tips") {
    runTipsCommand(tipsAll, tipsWorkflow);
    return;
  }

  // Launcher verbs — exec the GUI app binary with .bkit/.env merged into the env
  // so that MCP token placeholders (BKIT_GH_TOKEN, BKIT_OPENCODE_API_KEY, …) resolve correctly
  // even when launched from the Dock/Finder (macOS GUI-isolation).
  if (verb === "cursor" || verb === "opencode") {
    await launchApp(verb, process.cwd());
    return;
  }

  // install requires >=1 module flag or --tracker=; check/upgrade take NONE
  // (validateModuleFlagsForVerb).
  const moduleFlagsError = validateModuleFlagsForVerb(verb, moduleFlags, tracker);
  if (moduleFlagsError) {
    console.error(moduleFlagsError);
    process.exit(1);
  }

  if (verb === "doctor") {
    await runDoctor(modules, opencodeProvider);
    return;
  }

  if (verb === "status") {
    setLogPrefix("[bkit-status]");
    runStatus(process.cwd(), LOG_PREFIX);
    return;
  }

  if (verb === "upgrade") {
    await runUpgradeCommand(upgradeFlags);
    return;
  }

  if (verb === "uninstall") {
    await runUninstallCommand(modules, opencodeProvider, uninstallFlags);
    return;
  }

  await runInstall({ verb, modules, tracker, cloudVariant, opencodeProvider, uninstallFlags });
}

function isMainScript(): boolean {
  if (!process.argv[1]) return false;
  try {
    const argvReal = fs.realpathSync(process.argv[1]);
    const metaReal = fs.realpathSync(fileURLToPath(import.meta.url));
    return argvReal === metaReal;
  } catch {
    return false;
  }
}

if (isMainScript()) {
  main().catch((err: unknown) => {
    console.error(`${LOG_PREFIX} Unhandled error: ${(err as Error).message}`);
    process.exit(1);
  });
}
