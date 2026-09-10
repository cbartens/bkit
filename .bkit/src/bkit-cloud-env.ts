// bkit-cloud-env — resolve a copy-paste-ready Claude Code on the web env-var block
// by *following the consumer's `.envrc`*.
//
// The generated `.claude/cloud.md` (see runClaudeModule) inlines REAL SECRET
// VALUES so it is gitignored + chmod 600 and never committed. This module owns the
// stack-agnostic resolution: it reads whatever dotenv files the repo's `.envrc`
// sources, honours the `.envrc` `unset` lines, and drops session-hijack keys.
// bkit hardcodes NO stack-specific key lists — the stack knowledge lives in the
// consumer's `.envrc`, keeping bkit's shipped surface stack-independent.
//
// Faithful to app-gether's `scripts/generate-claude-cloud.sh` by construction: its
// EXCLUDE_KEYS are exactly the vars `.envrc` unsets, and its REVIEW_KEYS is
// ANTHROPIC_API_KEY — both reproduced here without a bespoke key list.

import * as fs from "node:fs";
import * as path from "node:path";
import type { IssueTracker } from "./bkit-manifest.js";
import { getTemplatesRoot } from "./bkit-paths.js";
import { applyTokens, type TokenMap } from "./bkit-tokens.js";

// Consumer-relative paths of the generated docs. Shared so the upgrade template walk
// (bkit-install.ts) can exclude them — they are generated OUTPUT files, never
// templates to reconcile. One per cloud host (Claude Code on the web / Cursor
// Background Agents); both inline resolved secrets, both gitignored + chmod 600.
export const CLAUDE_CLOUD_RELPATH = path.join(".claude", "cloud.md");
export const CURSOR_CLOUD_RELPATH = path.join(".cursor", "cloud.md");

// Session-hijack keys: exporting these into a cloud env redirects Claude Code's
// OWN model calls onto API-key billing instead of the user's subscription
// (`.bkit/cloud.md` § Environment variables). Always dropped from the paste block.
export const SESSION_HIJACK_KEYS = ["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN"] as const;

// bkit baseline env-var NAMES every Claude-on-web environment needs. Emitted as a
// placeholder ONLY when absent from the resolved `.envrc` set — a present value
// (e.g. GH_BKIT_TOKEN already in `.bkit/.env`) keeps its real resolved value.
const BASELINE_TOKEN_PLACEHOLDERS: ReadonlyArray<readonly [string, string]> = [
  ["GH_BKIT_TOKEN", "<fine-grained PAT — see .bkit/cloud.md § GH_BKIT_TOKEN permissions>"],
  ["GH_BKIT_TOKEN_INSTALL", "<classic PAT with read:packages>"],
];

// Earlier-compaction override — a bkit constant, not a secret. Appended to the
// block when not already resolved from a source file. Claude-harness-only knob —
// Cursor has no equivalent, so it is NOT in the Cursor policy's constants.
const AUTOCOMPACT_KEY = "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE";
const AUTOCOMPACT_VALUE = "70";

// Per-cloud env-var policy. The `.envrc`-following resolver core is identical for
// both clouds (same dotenv sources, same unset/hijack/empty drops) — only the
// baseline placeholder set and the appended constants differ. Claude pairs with the
// GitHub tracker and wants the autocompact override; Cursor pairs with Linear (and
// so also needs `LINEAR_API_KEY`) and has no autocompact knob. Keeping one resolver
// with a small policy object is what guarantees the two generated docs describe the
// SAME cloud environment — just different mechanics (pasted setup vs. Dockerfile).
export interface CloudEnvPolicy {
  /** Baseline env-var NAMES this cloud always needs; emitted as `NAME=<placeholder>`
   *  when absent from the resolved `.envrc` set. */
  baseline: ReadonlyArray<readonly [string, string]>;
  /** Constant KEY/value pairs appended when not already resolved from a source. */
  constants: ReadonlyArray<readonly [string, string]>;
}

// Claude Code on the web: GitHub tracker, autocompact override.
export const CLAUDE_CLOUD_POLICY: CloudEnvPolicy = {
  baseline: BASELINE_TOKEN_PLACEHOLDERS,
  constants: [[AUTOCOMPACT_KEY, AUTOCOMPACT_VALUE]],
};

// Cursor Background Agents: `LINEAR_API_KEY` prepended for the Linear tracker
// (preflight.sh calls the Linear GraphQL API and hard-fails without it); GitHub
// tracker uses the same GH baseline as Claude, minus the autocompact knob.
const CURSOR_LINEAR_PLACEHOLDER: readonly [string, string] = [
  "LINEAR_API_KEY",
  "<Linear personal API key — https://linear.app/settings/api>",
];
export function cursorCloudPolicy(tracker: IssueTracker): CloudEnvPolicy {
  return {
    baseline:
      tracker === "linear"
        ? [CURSOR_LINEAR_PLACEHOLDER, ...BASELINE_TOKEN_PLACEHOLDERS]
        : BASELINE_TOKEN_PLACEHOLDERS,
    constants: [],
  };
}

export interface CloudEnvResolution {
  /** Resolved KEY/value pairs, non-empty, ordered first-seen with last-source value. */
  included: Array<[string, string]>;
  /** Vars a source file set that `.envrc` then `unset`s (dropped by design). */
  unset: string[];
  /** Session-hijack keys that were present and were dropped. */
  hijackDropped: string[];
  /** Keys whose resolved value was empty (skipped from the paste block). */
  emptySkipped: string[];
  /** Baseline token names absent from sources — emitted as placeholders. */
  placeholders: string[];
  /** `.envrc` dotenv targets that existed and were read (for the Notes line). */
  sources: string[];
  /** Whether an `.envrc` was found at all. */
  hasEnvrc: boolean;
}

/** Strip one layer of matching surrounding single/double quotes. */
function stripQuotes(v: string): string {
  const t = v.trim();
  if (
    t.length >= 2 &&
    ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

/**
 * Parse an `.envrc` for the direnv directives bkit follows: `dotenv` /
 * `dotenv_if_exists <file>` targets (in order), `unset <VAR...>` lines, and direct
 * `export KEY=value` assignments. Arbitrary bash (conditionals, PATH_add, etc.) is
 * ignored — bkit never executes the `.envrc`, it reads these declarative lines.
 */
export function parseEnvrc(content: string): {
  dotenvFiles: string[];
  unsets: string[];
  exports: Array<[string, string]>;
} {
  const dotenvFiles: string[] = [];
  const unsets: string[] = [];
  const exports: Array<[string, string]> = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^dotenv(?:_if_exists)?\s+(.+)$/))) {
      dotenvFiles.push(stripQuotes(m[1]!.trim()));
    } else if ((m = line.match(/^unset\s+(.+)$/))) {
      for (const v of m[1]!.split(/\s+/)) if (v) unsets.push(v);
    } else if ((m = line.match(/^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)$/))) {
      exports.push([m[1]!, stripQuotes(m[2]!)]);
    }
  }
  return { dotenvFiles, unsets, exports };
}

/** Parse a dotenv file into ordered KEY/value pairs (values quote-stripped). */
export function parseDotenv(content: string): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    // `(.*)$` keeps `=` characters inside the value intact.
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out.push([m[1]!, stripQuotes(m[2]!)]);
  }
  return out;
}

/**
 * Resolve the cloud env-var set by following the consumer's `.envrc`. Later dotenv
 * sources override earlier (direnv last-wins); direct `export`s win over files.
 * Applies `.envrc` unsets, then drops session-hijack keys. Returns empty when no
 * `.envrc` exists — the caller still emits a usable placeholder doc.
 */
export function resolveCloudEnvVars(
  cwd: string,
  policy: CloudEnvPolicy = CLAUDE_CLOUD_POLICY,
): CloudEnvResolution {
  const res: CloudEnvResolution = {
    included: [],
    unset: [],
    hijackDropped: [],
    emptySkipped: [],
    placeholders: [],
    sources: [],
    hasEnvrc: false,
  };

  const envrcPath = path.join(cwd, ".envrc");
  let dotenvFiles: string[] = [];
  let unsets: string[] = [];
  let exports: Array<[string, string]> = [];
  if (fs.existsSync(envrcPath)) {
    res.hasEnvrc = true;
    ({ dotenvFiles, unsets, exports } = parseEnvrc(fs.readFileSync(envrcPath, "utf-8")));
  }

  // Accumulate. A Map preserves first-seen insertion order; re-setting an existing
  // key updates its value in place, giving "first-seen order, last-source value".
  const map = new Map<string, string>();
  for (const rel of dotenvFiles) {
    const p = path.join(cwd, rel);
    if (!fs.existsSync(p)) continue;
    res.sources.push(rel);
    for (const [k, v] of parseDotenv(fs.readFileSync(p, "utf-8"))) map.set(k, v);
  }
  for (const [k, v] of exports) map.set(k, v);

  // Honour `.envrc` unsets (record only those a source actually set).
  for (const k of unsets) {
    if (map.has(k)) {
      res.unset.push(k);
      map.delete(k);
    }
  }

  // Drop session-hijack keys.
  for (const k of SESSION_HIJACK_KEYS) {
    if (map.has(k)) {
      res.hijackDropped.push(k);
      map.delete(k);
    }
  }

  // Partition non-empty (included) vs empty (skipped).
  for (const [k, v] of map) {
    if (v === "") res.emptySkipped.push(k);
    else res.included.push([k, v]);
  }

  // Baseline names absent from the resolved set → emitted as placeholders.
  const present = new Set(res.included.map(([k]) => k));
  for (const [name] of policy.baseline) {
    if (!present.has(name)) res.placeholders.push(name);
  }

  return res;
}

/**
 * Render the `.env`-format paste block: resolved KEY=value lines, then placeholder
 * lines for any absent baseline token, then the autocompact override if unset.
 */
export function renderCloudEnvBlock(
  res: CloudEnvResolution,
  policy: CloudEnvPolicy = CLAUDE_CLOUD_POLICY,
): string {
  const lines: string[] = [];
  for (const [k, v] of res.included) lines.push(`${k}=${v}`);
  for (const [name, placeholder] of policy.baseline) {
    if (res.placeholders.includes(name)) lines.push(`${name}=${placeholder}`);
  }
  for (const [key, value] of policy.constants) {
    if (!res.included.some(([k]) => k === key)) lines.push(`${key}=${value}`);
  }
  return lines.join("\n");
}

function fmtList(items: string[]): string {
  return items.map((x) => `\`${x}\``).join(", ");
}

/** Render the markdown notes under the env-var block (transparency for what was dropped). */
export function renderCloudEnvNotes(res: CloudEnvResolution): string {
  if (!res.hasEnvrc) {
    return (
      "_No `.envrc` found — the block above lists only the bkit baseline token names as " +
      "placeholders. Add your `.envrc` (`bkit install` seeds one) and re-run to inline real values._"
    );
  }
  const bullets: string[] = [];
  if (res.placeholders.length) {
    bullets.push(
      `- **Fill in (absent from your env files):** ${fmtList(res.placeholders)} — placeholder values above.`,
    );
  }
  if (res.unset.length) {
    bullets.push(
      `- **Dropped — \`.envrc\` unsets these:** ${fmtList(res.unset)} — kept out of the cloud env by design.`,
    );
  }
  if (res.hijackDropped.length) {
    bullets.push(
      `- **Dropped — session-billing hijack:** ${fmtList(res.hijackDropped)} — would redirect the agent's own model calls onto API-key billing instead of your subscription.`,
    );
  }
  if (res.emptySkipped.length) {
    bullets.push(`- **Empty in source (skipped):** ${fmtList(res.emptySkipped)}`);
  }
  const header = `_${res.included.length} var${res.included.length === 1 ? "" : "s"} resolved${
    res.sources.length ? ` from ${fmtList(res.sources)}` : ""
  }._`;
  return bullets.length ? `${header}\n\n${bullets.join("\n")}` : header;
}

/** Parse the pnpm `X.Y.Z` from `package.json` `packageManager` ("" if absent/non-pnpm). */
export function resolveConsumerPnpm(cwd: string): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")) as Record<
      string,
      unknown
    >;
    const pm = typeof pkg["packageManager"] === "string" ? (pkg["packageManager"] as string) : "";
    const m = pm.match(/^pnpm@(\d+\.\d+\.\d+)/);
    return m?.[1] ?? "";
  } catch {
    return "";
  }
}

/**
 * Render the setup-script corepack line from the consumer's own `packageManager`
 * pin (NOT bkit's — the pin is a snapshot pre-warm, non-load-bearing: corepack
 * resolves each repo's `packageManager` in-repo). Degrades to bare `corepack
 * enable` when the pin is absent.
 */
export function renderCorepackLine(cwd: string): string {
  const v = resolveConsumerPnpm(cwd);
  return v
    ? `corepack enable && corepack prepare pnpm@${v} --activate`
    : `corepack enable  # pnpm resolved from package.json "packageManager" in-repo`;
}

/**
 * Extract the bash body of every `context-fetch:provision <name>` block the consumer
 * enabled below `<!-- bkit:end -->` in `.agents/context.md`. Stack-agnostic: bkit
 * hardcodes no CLI names — the install recipe lives in the consumer's config.md,
 * co-located with the fetch block that needs the CLI. Mirrors the awk parser in
 * `.claude/hooks/cloud-bootstrap.sh` so the web setup-script snapshot and the
 * per-session hook provision the same CLIs. Returns one string per block (bash body).
 */
export function extractContextFetchProvisionRecipes(cwd: string): string[] {
  const filePath = path.join(cwd, ".agents", "context.md");
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return [];
  const consumer = content.slice(endIdx);
  const recipes: string[] = [];
  let cur: string[] | null = null;
  let inProv = false;
  let inFence = false;
  for (const line of consumer.split("\n")) {
    if (/^<!-- context-fetch:provision/.test(line)) {
      inProv = true;
      inFence = false;
      cur = [];
      continue;
    }
    if (/^<!-- context-fetch:(start|end|none)/.test(line)) {
      if (inProv && cur && cur.length > 0) recipes.push(cur.join("\n"));
      inProv = false;
      inFence = false;
      cur = null;
      continue;
    }
    if (inProv && /^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inProv && inFence && cur) cur.push(line);
  }
  return recipes;
}

/**
 * Render the `@@CLOUD_CACHE_BUST@@` line — a `# cache-bust YYYY-MM-DD-N` comment at
 * the top of the setup script. claude.ai/code snapshots the setup script keyed on its
 * exact text and reuses that snapshot; a changing cache-bust line forces a fresh
 * snapshot on the next paste, so "latest"-resolved downloads (gh, gcloud SDK) and
 * base-image drift get re-pulled even when the rest of the script is byte-identical.
 * The counter increments per regeneration WITHIN a day (read back from the prior doc)
 * and resets to 1 on a new date, so every regeneration yields a distinct value —
 * guaranteeing a re-paste always busts. `today` (YYYY-MM-DD) is injected so the caller
 * owns the clock and this stays deterministic under test.
 */
export function renderCloudCacheBust(cwd: string, today: string): string {
  const dst = path.join(cwd, CLAUDE_CLOUD_RELPATH);
  let counter = 1;
  if (fs.existsSync(dst)) {
    const prev = fs.readFileSync(dst, "utf-8");
    const m = prev.match(/^# cache-bust (\d{4}-\d{2}-\d{2})-(\d+)$/m);
    if (m && m[1] === today) counter = Number.parseInt(m[2], 10) + 1;
  }
  return `# cache-bust ${today}-${counter}`;
}

/**
 * `pnpm add -g` aborts ("The configured global bin directory … is not in PATH")
 * unless pnpm's global-bin dir is on PATH. corepack-activated pnpm never runs
 * `pnpm setup`, so under the setup script's `set -euo pipefail` a single `pnpm add
 * -g <cli>` provision block kills the whole snapshot build (observed in cloud with
 * `pnpm@11`). Prepend an explicit `PNPM_HOME` + PATH export so every provision
 * recipe runs in a shell where `pnpm add -g` succeeds. `$PNPM_HOME` and
 * `$PNPM_HOME/bin` are both added — pnpm's global-bin dir has differed by version.
 */
const CLOUD_PNPM_GLOBAL_PATH_SETUP =
  "# pnpm refuses `add -g` unless its global-bin dir is on PATH (corepack pnpm skips `pnpm setup`).\n" +
  'export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"\n' +
  'export PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"';

/**
 * Render the `@@CLOUD_CONTEXT_FETCH_PROVISION@@` setup-script region: the consumer's
 * `context-fetch:provision` recipes, or "" when none are enabled. Placed AFTER the
 * corepack line in the template so `pnpm add -g …` recipes have pnpm available.
 *
 * Recipes run in a best-effort `( set +e … ) || …` subshell: the setup script is
 * `set -euo pipefail`, so without this a single failing recipe (e.g. a heavy `curl |
 * bash` CLI installer that trips over a missing base-image dep) aborts the whole
 * snapshot build and discards every CLI provisioned before it. `set +e` also lets a
 * later recipe run after an earlier one fails. Mirrors the non-blocking per-session
 * hook (`… | bash || log`), keeping the two cloud provision paths behaviourally equal.
 */
export function renderCloudContextFetchProvision(cwd: string): string {
  const recipes = extractContextFetchProvisionRecipes(cwd);
  if (recipes.length === 0) return "";
  return (
    "# context-fetch CLIs (from .agents/context.md provision blocks) — self-guarded, best-effort.\n" +
    CLOUD_PNPM_GLOBAL_PATH_SETUP +
    "\n" +
    "(\n" +
    "  set +e\n" +
    recipes.join("\n") +
    "\n" +
    ') || echo "[cloud-setup] a context-fetch provision recipe failed (non-blocking); its CLI will be absent" >&2'
  );
}

/**
 * Extract the cloud network-allowlist domains the consumer declared in
 * `<!-- allowed-domains:start --> … <!-- allowed-domains:end -->` blocks BELOW
 * `<!-- bkit:end -->` in `.agents/context.md` (one registrable domain per line;
 * blank / `#` comment / marker lines ignored). Stack-agnostic: bkit hardcodes no
 * domains — the consumer declares which log-backend / API / app hosts their cloud
 * sessions must reach. Returns declared entries verbatim (pre-expansion), in order.
 */
export function extractAllowedDomains(cwd: string): string[] {
  const filePath = path.join(cwd, ".agents", "context.md");
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return [];
  const consumer = content.slice(endIdx);
  const domains: string[] = [];
  let inBlock = false;
  for (const line of consumer.split("\n")) {
    if (/^<!-- allowed-domains:start/.test(line)) {
      inBlock = true;
      continue;
    }
    if (/^<!-- allowed-domains:(end|none)/.test(line)) {
      inBlock = false;
      continue;
    }
    if (!inBlock) continue;
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith("<!--")) continue;
    domains.push(t);
  }
  return domains;
}

/**
 * Expand each declared registrable domain to BOTH the apex and a `*.` wildcard so the
 * WHOLE domain is allowlisted — the egress proxy matches apex and subdomains
 * separately, so `inngest.com` alone misses `api.inngest.com` and vice-versa. A
 * consumer entry already written as `*.x` is normalised to its apex `x` first, then
 * both forms are emitted. Grouped apex-then-wildcard per domain, domains sorted.
 */
export function expandAllowedDomains(declared: string[]): string[] {
  const bases = [
    ...new Set(declared.map((d) => d.replace(/^\*\./, "").trim()).filter(Boolean)),
  ].sort();
  return bases.flatMap((b) => [b, `*.${b}`]);
}

/**
 * Stack-agnostic tooling hosts only (tracker, package registry, AI provider docs,
 * IDE/host docs). **Never** ship observability / app stacks here (Vercel, Supabase,
 * Sentry, …) — those come solely from the consumer's `.agents/context.md`
 * `allowed-domains` block (after `<!-- bkit:end -->`) via {@link resolveNetworkAllowlist}.
 */
export const BKIT_SHIPPED_NETWORK_DOMAINS: readonly string[] = [
  "github.com",
  "githubusercontent.com",
  "anthropic.com",
  "claude.com",
  "cursor.com",
  "linear.app",
  "opencode.ai",
  "ollama.com",
  "openrouter.ai",
  "npmjs.com",
];

/**
 * Apex-only unique bases from an expanded (apex + `*.`) domain list.
 *
 * Single call site (injectOpencodeNetworkCurlAllows in bkit-modules.ts), kept as a
 * named export because (a) bkit-modules.ts is covered by the INTEGRATION lane only
 * — inlining here would move these branches out of the unit-lane's measured file
 * (bkit-cloud-env.ts) and silently erode the unit coverage floor, and (b) the
 * apex-collapse is the same shape as expandAllowedDomains above; named for review.
 */
export function networkAllowlistBases(expanded: string[]): string[] {
  return [...new Set(expanded.map((d) => d.replace(/^\*\./, "").trim()).filter(Boolean))].sort();
}

/**
 * Local + cloud network allowlist: stack-agnostic tooling defaults ∪ consumer
 * `allowed-domains` from `.agents/context.md` (after `<!-- bkit:end -->`), each as
 * apex + `*.` wildcard. Empty consumer block ⇒ tooling hosts only — no Vercel/etc.
 */
export function resolveNetworkAllowlist(cwd: string): string[] {
  return expandAllowedDomains([...BKIT_SHIPPED_NETWORK_DOMAINS, ...extractAllowedDomains(cwd)]);
}

/** Cursor-relative path of the install-written curl/wget allowlist (guardrails). */
export const NETWORK_ALLOWLIST_RELPATH = path.join(".cursor", "allowlist.json");

/**
 * Write `.cursor/allowlist.json` for Cursor `guardrails.cjs` (runtime curl/wget host
 * checks). Claude/OpenCode bake the same domain set into their own configs at
 * install/upgrade — they do not read this file. Call only when the cursor module
 * is installed (do not create `.cursor/` for claude-only consumers).
 */
export function writeNetworkAllowlistArtifact(
  cwd: string,
  dryRun: boolean,
): { path: string; domains: string[]; wrote: boolean } {
  const domains = resolveNetworkAllowlist(cwd);
  const rel = NETWORK_ALLOWLIST_RELPATH;
  const abs = path.join(cwd, rel);
  const body = JSON.stringify({ domains }, null, 2) + "\n";
  let wrote = false;
  if (!dryRun) {
    const prev = fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
    if (prev !== body) {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, body, "utf-8");
      wrote = true;
    }
  } else if (!fs.existsSync(abs) || fs.readFileSync(abs, "utf-8") !== body) {
    wrote = true;
  }
  return { path: rel, domains, wrote };
}

/**
 * Render the `@@CLOUD_NETWORK_ALLOWLIST@@` region — the whole `## Network access`
 * body. With declared `allowed-domains`, emits the **Custom** + "also include defaults"
 * (extends, never replaces) instruction plus the expanded paste block. With none,
 * falls back to the **Trusted** default guidance and points at the declaration.
 */
export function renderCloudNetworkAllowlist(cwd: string): string {
  const declared = extractAllowedDomains(cwd);
  if (declared.length === 0) {
    return (
      "Set to **Trusted** (default) — covers package registries, GitHub, and common\n" +
      "cloud SDK hosts. Only raise to **Full** if a task must reach the open internet.\n\n" +
      "_No `allowed-domains` block declared in `.agents/context.md`. If you run cloud\n" +
      "`/bkit-debug` or e2e against a deployment, declare your log-backend + app\n" +
      "domains there (apex per line) and this section will list them for a **Custom** allowlist._"
    );
  }
  const domains = expandAllowedDomains(declared);
  return (
    "Set to **Custom** and tick **Also include default list of common package\n" +
    "managers** — this EXTENDS the trusted defaults (package registries, GitHub,\n" +
    "cloud SDKs), it does not replace them. Paste into the **Allowed domains** field\n" +
    "(one per line):\n\n" +
    "```text\n" +
    domains.join("\n") +
    "\n```\n\n" +
    `_${domains.length} entries — ${domains.length / 2} domain(s) from \`allowed-domains\` ` +
    "in `.agents/context.md`, each as apex + `*.` wildcard._\n\n" +
    "Under **Trusted**, your app domains and most observability / API hosts are\n" +
    "unreachable, so cloud `/bkit-debug` gets no runtime logs and e2e can't hit your\n" +
    "deployment. **Full** works too but opens all egress."
  );
}

/**
 * Generate `.claude/cloud.md` — a copy-paste-ready Claude Code on the web setup doc
 * with the env-var block resolved to REAL VALUES from the consumer's `.envrc`.
 *
 * The file is gitignored + chmod 600 and holds live secrets: it is UNTRACKED (not
 * pushed to any WriteSet / manifest / canonicalHashes) so it never enters `bkit
 * check` drift or the upgrade template walk — its values are machine-local and
 * expected to differ. Shared by install (runClaudeModule) and upgrade so a rotated
 * secret or version bump reaches the doc either way. Callers MUST guard on
 * `!dryRun` (never write secrets during `bkit check` / `--dry-run`) and on the
 * claude host being installed. Returns true when a file was written (false when the
 * template is absent). Never logs the resolved values.
 */
export function writeClaudeCloudDoc(cwd: string, tokens: TokenMap): boolean {
  const src = path.join(getTemplatesRoot(), ".claude", "cloud.md");
  if (!fs.existsSync(src)) return false;
  const res = resolveCloudEnvVars(cwd);
  // UTC day drives the cache-bust; renderCloudCacheBust reads the PRIOR dst below to
  // continue the per-day counter, which is safe because we overwrite dst afterwards.
  const today = new Date().toISOString().slice(0, 10);
  // Function-form replacers: resolved secret values may contain `$`, which a string
  // replacement would interpret ($&, $1, …).
  const content = applyTokens(fs.readFileSync(src, "utf-8"), tokens)
    .replace(/@@CLOUD_CACHE_BUST@@/g, () => renderCloudCacheBust(cwd, today))
    .replace(/@@CLOUD_NETWORK_ALLOWLIST@@/g, () => renderCloudNetworkAllowlist(cwd))
    .replace(/@@CLOUD_COREPACK@@/g, () => renderCorepackLine(cwd))
    .replace(/@@CLOUD_CONTEXT_FETCH_PROVISION@@/g, () => renderCloudContextFetchProvision(cwd))
    .replace(/@@CLOUD_ENV_VARS@@/g, () => renderCloudEnvBlock(res))
    .replace(/@@CLOUD_ENV_NOTES@@/g, () => renderCloudEnvNotes(res));
  const dst = path.join(cwd, CLAUDE_CLOUD_RELPATH);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, content, "utf-8");
  fs.chmodSync(dst, 0o600);
  return true;
}

/**
 * Render the `@@CURSOR_CONTEXT_FETCH@@` region of `.cursor/cloud.md`: the consumer's
 * `context-fetch:provision` recipes formatted for the Cursor mechanic, or "" when none
 * are enabled. On Claude these CLIs are baked into the pasted setup script (see
 * renderCloudContextFetchProvision); Cursor has no setup script, so — to keep the two
 * cloud environments aligned — the same recipes are surfaced as a copy-paste block for
 * the per-snapshot `install` command in `.cursor/environment.json`. The recipes are
 * already idempotent (`command -v X || pnpm add -g X`), so they are safe to re-run on
 * every snapshot build. Reuses the SAME extractor as the Claude path so the two clouds
 * never diverge on which CLIs they provision.
 */
export function renderCursorContextFetchProvision(cwd: string): string {
  const recipes = extractContextFetchProvisionRecipes(cwd);
  // Empty → "" and the template's sentinel line collapses to a single blank between
  // sections; non-empty → a self-contained section with its own leading/trailing blank.
  if (recipes.length === 0) return "";
  return (
    "\n## Debug-fetch CLIs (parity with the Claude setup script)\n\n" +
    "Your `.agents/context.md` declares these context-fetch CLIs. The Claude setup script\n" +
    "bakes them into its snapshot; for the SAME tools on Cursor, chain them into the\n" +
    "`install` command in `.cursor/environment.json` (idempotent — safe every rebuild):\n\n" +
    "```bash\n" +
    recipes.join("\n") +
    "\n```\n"
  );
}

/**
 * Render the `@@CURSOR_NETWORK@@` region — Cursor Cloud Agents DO have an egress
 * allowlist (dashboard → Security: "Allow all" / "Default + allowlist" / "Allowlist
 * only"), unlike the earlier assumption. Reuses the SAME declared `allowed-domains`
 * as the Claude side, but — critically — does NOT apply Claude's apex+`*.`
 * expansion: Cursor's own docs warn that a broad wildcard (`*.s3….amazonaws.com`)
 * opens egress far wider than intended, so the declared apex entries are emitted
 * verbatim with a note to add only the specific subdomains you need.
 */
export function renderCursorNetworkAllowlist(cwd: string): string {
  const declared = extractAllowedDomains(cwd);
  if (declared.length === 0) {
    return (
      "Cloud Agents get network access by default. Egress is configurable in the Cloud\n" +
      "Agents dashboard → **Security** (Allow all / Default + allowlist / Allowlist only),\n" +
      "per user, per environment, or team-locked. No `allowed-domains` block is declared in\n" +
      "`.agents/context.md`, so nothing extra is required here — if your org enforces\n" +
      "**Allowlist only**, declare your app + log-backend hosts there (apex per line) and this\n" +
      "section will list them."
    );
  }
  return (
    "If your org runs Cloud Agents in **Allowlist only** / **Default + allowlist** mode\n" +
    "(dashboard → **Security**), add the domains your `.agents/context.md` declares so cloud\n" +
    "`/bkit-debug` + e2e can reach your app and log backends:\n\n" +
    "```text\n" +
    declared.join("\n") +
    "\n```\n\n" +
    `_${declared.length} domain(s) from \`allowed-domains\` in \`.agents/context.md\`._ Add only the\n` +
    "specific subdomains you need (e.g. `api.example.com`) — Cursor warns that a broad `*.`\n" +
    "wildcard opens egress far wider than intended. (The Claude side auto-expands to apex + `*.`;\n" +
    "Cursor's allowlist is deliberately narrower.)"
  );
}

/**
 * Generate `.cursor/cloud.md` — the Cursor Cloud Agents analogue of
 * `.claude/cloud.md`. Both describe the SAME bkit cloud environment; only the
 * mechanics differ. On Claude the doc carries a pasted setup script + network
 * selector; on Cursor the toolchain lives in `.cursor/Dockerfile` + the per-snapshot
 * `.cursor/environment.json` `install` (both committed, nothing to paste), so this doc
 * is narrower: it resolves the **dashboard environment variables** to real values from
 * the consumer's `.envrc` (Cursor policy — Linear tracker adds `LINEAR_API_KEY`, no
 * autocompact knob) and surfaces any context-fetch CLIs for parity.
 *
 * Like `.claude/cloud.md` it is gitignored + chmod 600 and UNTRACKED (never pushed to
 * any WriteSet / manifest / canonicalHashes) — its values are machine-local and
 * expected to differ, so it never enters `bkit check` drift or the upgrade template
 * walk. Shared by install (runCursorModule) and upgrade. Callers MUST guard on
 * `!dryRun` (never write secrets during `bkit check` / `--dry-run`) and on the cursor
 * host being installed. Returns true when a file was written (false when the template
 * is absent). Never logs the resolved values.
 */
export function writeCursorCloudDoc(cwd: string, tokens: TokenMap, tracker: IssueTracker): boolean {
  const src = path.join(getTemplatesRoot(), ".cursor", "cloud.md");
  if (!fs.existsSync(src)) return false;
  const policy = cursorCloudPolicy(tracker);
  const res = resolveCloudEnvVars(cwd, policy);
  // Function-form replacers: resolved secret values may contain `$`, which a string
  // replacement would interpret ($&, $1, …).
  const content = applyTokens(fs.readFileSync(src, "utf-8"), tokens)
    .replace(/@@CLOUD_ENV_VARS@@/g, () => renderCloudEnvBlock(res, policy))
    .replace(/@@CLOUD_ENV_NOTES@@/g, () => renderCloudEnvNotes(res))
    .replace(/@@CURSOR_NETWORK@@/g, () => renderCursorNetworkAllowlist(cwd))
    .replace(/@@CURSOR_CONTEXT_FETCH@@/g, () => renderCursorContextFetchProvision(cwd));
  const dst = path.join(cwd, CURSOR_CLOUD_RELPATH);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, content, "utf-8");
  fs.chmodSync(dst, 0o600);
  return true;
}
