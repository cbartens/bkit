// bkit-cli.ts — parseArgs + printUsage for the v4-3 module-flag CLI surface.
// Exported and consumed by bkit-install.ts main().

export type ModuleFlag = "core" | "claude" | "cursor" | "ci" | "lint" | "git-hooks" | "full";

export type Verb = "install" | "check" | "help";

export interface ParsedArgs {
  verb: Verb;
  modules: Set<ModuleFlag>;
  /** Deprecation triggers present in the argv. */
  deprecations: {
    /** true when `init` verb was used */
    initVerb: boolean;
    /** "claude" | "cursor" | null when --host=<x> was used */
    hostFlag: "claude" | "cursor" | null;
  };
}

const MODULE_FLAGS = new Set<ModuleFlag>([
  "core",
  "claude",
  "cursor",
  "ci",
  "lint",
  "git-hooks",
  "full",
]);

// ALL_MODULES (ordered dispatch sequence): core always first, full = all non-core
const ALL_MODULES: ModuleFlag[] = ["core", "claude", "cursor", "ci", "lint", "git-hooks"];

export function resolveModules(flags: Set<ModuleFlag>): Set<ModuleFlag> {
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
 * Rejects unknown flags with process.exit(1).
 * Deprecation stubs: `init` verb → install --full; `--host=claude/cursor` → --claude/--cursor.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const args = [...argv];
  let verb: Verb = "help";
  const deprecations: ParsedArgs["deprecations"] = {
    initVerb: false,
    hostFlag: null,
  };

  // Verb extraction
  const firstArg = args[0];
  if (firstArg === "install" || firstArg === "check") {
    verb = firstArg as Verb;
    args.shift();
  } else if (firstArg === "help" || firstArg === "--help" || firstArg === "-h") {
    verb = "help";
    args.shift();
  } else if (firstArg === "init") {
    // Deprecation: init → install --full
    deprecations.initVerb = true;
    verb = "install";
    args.shift();
  } else if (firstArg !== undefined && !firstArg.startsWith("-")) {
    // Unknown verb
    console.error(`[bkit] Unknown verb: ${firstArg}. Run \`bkit help\` for usage.`);
    process.exit(1);
  }

  const moduleFlags = new Set<ModuleFlag>();

  for (const arg of args) {
    // Deprecation: --host=claude | --host=cursor
    if (arg.startsWith("--host=")) {
      const host = arg.slice("--host=".length);
      if (host === "claude" || host === "cursor") {
        deprecations.hostFlag = host;
        moduleFlags.add(host as ModuleFlag);
        continue;
      } else {
        console.error(`[bkit] Unknown --host value: ${host}. Use --claude or --cursor.`);
        process.exit(1);
      }
    }

    // Module flags: --<flag>
    if (arg.startsWith("--")) {
      const flag = arg.slice(2) as ModuleFlag;
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

  // init deprecation → treat as --full
  if (deprecations.initVerb && moduleFlags.size === 0) {
    moduleFlags.add("full");
  }

  const modules = resolveModules(moduleFlags);

  return { verb, modules, deprecations };
}

/** Print deprecation warnings to stderr (called by main() after parseArgs). */
export function printDeprecationWarnings(deprecations: ParsedArgs["deprecations"]): void {
  if (deprecations.initVerb) {
    console.warn(
      "[bkit] DEPRECATED: 'init' verb is replaced by 'install --full'; will be removed in v0.2",
    );
  }
  if (deprecations.hostFlag) {
    console.warn(
      `[bkit] DEPRECATED: --host=${deprecations.hostFlag} is replaced by --${deprecations.hostFlag}; will be removed in v0.2`,
    );
  }
}

export function printUsage(): void {
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

Deprecated (v0.1.x only — removed in v0.2):
  bkit init                     Use \`bkit install --full\` instead.
  bkit install --host=claude    Use \`bkit install --claude\` instead.
  bkit install --host=cursor    Use \`bkit install --cursor\` instead.

Consumer CI auth:
  Set BKIT_READ_TOKEN in GitHub Actions secrets (fine-grained PAT, Contents:read on cbartens/bkit).
  See README.md ## Consumer CI auth for setup steps.

Docs: https://github.com/cbartens/bkit/blob/main/README.md`);
}
