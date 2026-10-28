// install/cloud-env.ts — resolve a copy-paste-ready cloud env-var block by *following
// the consumer's `.envrc`*.
//
// The generated `.claude/bkit-cloud.md`, `.cursor/bkit-cloud.md` and
// `.codex/bkit-cloud.md` (see the claude / cursor / codex host modules) inline REAL
// SECRET VALUES so they are gitignored + chmod 600 and never committed. All three carry
// the same env block whatever the issue tracker. This module owns the
// stack-agnostic resolution: it reads whatever dotenv files the repo's `.envrc`
// sources, honours the `.envrc` `unset` lines, and drops session-hijack keys.
// bkit hardcodes NO stack-specific key lists — the stack knowledge lives in the
// consumer's `.envrc`, keeping bkit's shipped surface stack-independent.
//
// Excluded keys are exactly the vars `.envrc` unsets, and the review key is
// BKIT_ANTHROPIC_API_KEY — both derived here without a bespoke key list.
import * as fs from "node:fs";
import * as path from "node:path";
import { readJsonFile } from "../shared/json.js";
import { getSharedRoot } from "../shared/package-roots.js";
import { applyTokens } from "./placeholders.js";
import { BKIT_EGRESS_SOURCES, MULTI_TENANT_APEXES } from "../shared/egress.js";
import { sha256 } from "./version-file.js";
// Consumer-relative paths of the generated docs. Shared so the upgrade template walk
// (commands/install/install.ts) can exclude them — they are generated OUTPUT files, never
// templates to reconcile. One per cloud host (Claude Code on the web / Cursor
// Background Agents / Codex Cloud); all inline resolved secrets, all gitignored + chmod 600.
export const CLAUDE_CLOUD_RELPATH = path.join(".claude", "bkit-cloud.md");
export const CURSOR_CLOUD_RELPATH = path.join(".cursor", "bkit-cloud.md");
export const CODEX_CLOUD_RELPATH = path.join(".codex", "bkit-cloud.md");
// Session-hijack keys: exporting these into a cloud env redirects Claude Code's
// OWN model calls onto API-key billing instead of the user's subscription
// (`.bkit/cloud.md` § Environment variables). Always dropped from the paste block.
export const SESSION_HIJACK_KEYS = [
    "ANTHROPIC_API_KEY",
    "BKIT_ANTHROPIC_API_KEY",
    "ANTHROPIC_AUTH_TOKEN",
];
// bkit baseline env-var NAMES every cloud environment needs, whatever the tracker:
// `gh` and the GitHub MCP server read BKIT_GH_TOKEN on every host. Emitted as a
// placeholder ONLY when absent from the resolved `.envrc` set — a present value keeps
// its real resolved value. Tracker keys (BKIT_LINEAR_API_KEY, BKIT_JIRA_API_KEY) are
// never baseline: a consumer on that tracker already sets them in `.envrc`, so they
// arrive with the resolved set. One baseline for every host keeps the generated docs
// describing the SAME cloud environment — just different mechanics.
const BASELINE_TOKEN_PLACEHOLDERS = [
    [
        "BKIT_GH_TOKEN",
        "<PAT — fine-grained one owner / classic across owners; see .bkit/cloud.md § BKIT_GH_TOKEN token permissions>",
    ],
];
/** Strip one layer of matching surrounding single/double quotes. */
function stripQuotes(v) {
    const t = v.trim();
    if (t.length >= 2 &&
        ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
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
export function parseEnvrc(content) {
    const dotenvFiles = [];
    const unsets = [];
    const exports = [];
    for (const raw of content.split("\n")) {
        const line = raw.trim();
        if (line === "" || line.startsWith("#"))
            continue;
        let m;
        if ((m = line.match(/^dotenv(?:_if_exists)?\s+(.+)$/))) {
            dotenvFiles.push(stripQuotes(m[1].trim()));
        }
        else if ((m = line.match(/^unset\s+(.+)$/))) {
            for (const v of m[1].split(/\s+/))
                if (v)
                    unsets.push(v);
        }
        else if ((m = line.match(/^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)$/))) {
            exports.push([m[1], stripQuotes(m[2])]);
        }
    }
    return { dotenvFiles, unsets, exports };
}
/** Parse a dotenv file into ordered KEY/value pairs (values quote-stripped). */
export function parseDotenv(content) {
    const out = [];
    for (const raw of content.split("\n")) {
        const line = raw.trim();
        if (line === "" || line.startsWith("#"))
            continue;
        // `(.*)$` keeps `=` characters inside the value intact.
        const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!m)
            continue;
        out.push([m[1], stripQuotes(m[2])]);
    }
    return out;
}
/**
 * Resolve the cloud env-var set by following the consumer's `.envrc`. Later dotenv
 * sources override earlier (direnv last-wins); direct `export`s win over files.
 * Applies `.envrc` unsets, then drops session-hijack keys. Returns empty when no
 * `.envrc` exists — the caller still emits a usable placeholder doc.
 */
export function resolveCloudEnvVars(cwd) {
    const res = {
        included: [],
        unset: [],
        hijackDropped: [],
        emptySkipped: [],
        placeholders: [],
        sources: [],
        hasEnvrc: false,
    };
    const envrcPath = path.join(cwd, ".envrc");
    let dotenvFiles = [];
    let unsets = [];
    let exports = [];
    if (fs.existsSync(envrcPath)) {
        res.hasEnvrc = true;
        ({ dotenvFiles, unsets, exports } = parseEnvrc(fs.readFileSync(envrcPath, "utf-8")));
    }
    // Accumulate. A Map preserves first-seen insertion order; re-setting an existing
    // key updates its value in place, giving "first-seen order, last-source value".
    const map = new Map();
    for (const rel of dotenvFiles) {
        const p = path.join(cwd, rel);
        if (!fs.existsSync(p))
            continue;
        res.sources.push(rel);
        for (const [k, v] of parseDotenv(fs.readFileSync(p, "utf-8")))
            map.set(k, v);
    }
    for (const [k, v] of exports)
        map.set(k, v);
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
        if (v === "")
            res.emptySkipped.push(k);
        else
            res.included.push([k, v]);
    }
    // Baseline names absent from the resolved set → emitted as placeholders.
    const present = new Set(res.included.map(([k]) => k));
    for (const [name] of BASELINE_TOKEN_PLACEHOLDERS) {
        if (!present.has(name))
            res.placeholders.push(name);
    }
    return res;
}
/**
 * Render the `.env`-format paste block: resolved KEY=value lines, then placeholder
 * lines for any absent baseline token.
 */
export function renderCloudEnvBlock(res) {
    const lines = [];
    for (const [k, v] of res.included)
        lines.push(`${k}=${v}`);
    for (const [name, placeholder] of BASELINE_TOKEN_PLACEHOLDERS) {
        if (res.placeholders.includes(name))
            lines.push(`${name}=${placeholder}`);
    }
    return lines.join("\n");
}
function fmtList(items) {
    return items.map((x) => `\`${x}\``).join(", ");
}
/** Render the markdown notes under the env-var block (transparency for what was dropped). */
export function renderCloudEnvNotes(res) {
    if (!res.hasEnvrc) {
        return ("_No `.envrc` found — the block above lists only the bkit baseline token names as " +
            "placeholders. Copy `.bkit/templates/.envrc` to the repo root, fill the files it sources, " +
            "and re-run to inline real values._");
    }
    const bullets = [];
    if (res.placeholders.length) {
        bullets.push(`- **Fill in (absent from your env files):** ${fmtList(res.placeholders)} — placeholder values above.`);
    }
    if (res.unset.length) {
        bullets.push(`- **Dropped — \`.envrc\` unsets these:** ${fmtList(res.unset)} — kept out of the cloud env by design.`);
    }
    if (res.hijackDropped.length) {
        bullets.push(`- **Dropped — session-billing hijack:** ${fmtList(res.hijackDropped)} — would redirect the agent's own model calls onto API-key billing instead of your subscription.`);
    }
    if (res.emptySkipped.length) {
        bullets.push(`- **Empty in source (skipped):** ${fmtList(res.emptySkipped)}`);
    }
    const header = `_${res.included.length} var${res.included.length === 1 ? "" : "s"} resolved${res.sources.length ? ` from ${fmtList(res.sources)}` : ""}._`;
    return bullets.length ? `${header}\n\n${bullets.join("\n")}` : header;
}
/** Parse the pnpm `X.Y.Z` from `package.json` `packageManager` ("" if absent/non-pnpm). */
export function resolveConsumerPnpm(cwd) {
    const read = readJsonFile(path.join(cwd, "package.json"));
    if (!read.ok || typeof read.value !== "object" || read.value === null)
        return "";
    const pkg = read.value;
    const pm = typeof pkg["packageManager"] === "string" ? pkg["packageManager"] : "";
    const m = pm.match(/^pnpm@(\d+\.\d+\.\d+)/);
    return m?.[1] ?? "";
}
/**
 * Render the setup-script corepack line from the consumer's own `packageManager`
 * pin (NOT bkit's — the pin is a snapshot pre-warm, non-load-bearing: corepack
 * resolves each repo's `packageManager` in-repo). Degrades to bare `corepack
 * enable` when the pin is absent.
 */
export function renderCorepackLine(cwd) {
    const v = resolveConsumerPnpm(cwd);
    return v
        ? `corepack enable && corepack prepare pnpm@${v} --activate`
        : `corepack enable  # pnpm resolved from package.json "packageManager" in-repo`;
}
/**
 * Extract the bash body of every `context-fetch:provision <name>` block the consumer
 * enabled below `<!-- bkit:end -->` in `.agents/context.md`. Stack-agnostic: bkit
 * hardcodes no CLI names — the install recipe lives in the consumer's context.md,
 * co-located with the fetch block that needs the CLI. `bkit context list-blocks` returns
 * the same list as `provision`, so the web setup-script snapshot and the per-session
 * hook provision the same CLIs. Returns one string per block (bash body).
 */
export function extractContextFetchProvisionRecipes(cwd) {
    return extractContextFetchProvisionBlocks(cwd).map((b) => b.body);
}
/**
 * {@link extractContextFetchProvisionRecipes} with each block's name — the word after
 * `context-fetch:provision` in its opening marker, limited to `[A-Za-z0-9._-]` so it is
 * safe inside a quoted shell string; "" when the marker names none.
 * {@link renderCloudContextFetchProvision} reports a failing recipe by this name.
 */
export function extractContextFetchProvisionBlocks(cwd) {
    const filePath = path.join(cwd, ".agents", "context.md");
    if (!fs.existsSync(filePath))
        return [];
    const content = fs.readFileSync(filePath, "utf-8");
    const endIdx = content.search(/^<!-- bkit:end -->$/m);
    if (endIdx === -1)
        return [];
    const consumer = content.slice(endIdx);
    const recipes = [];
    let name = "";
    let cur = null;
    let inProv = false;
    let inFence = false;
    for (const line of consumer.split("\n")) {
        const opening = /^<!-- context-fetch:provision\b\s*([A-Za-z0-9][A-Za-z0-9._-]*)?/.exec(line);
        if (opening) {
            name = opening[1] ?? "";
            inProv = true;
            inFence = false;
            cur = [];
            continue;
        }
        if (/^<!-- context-fetch:(start|end|none)/.test(line)) {
            if (inProv && cur && cur.length > 0)
                recipes.push({ name, body: cur.join("\n") });
            inProv = false;
            inFence = false;
            cur = null;
            continue;
        }
        if (inProv && /^```/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (inProv && inFence && cur)
            cur.push(line);
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
export function renderCloudCacheBust(cwd, today) {
    const dst = path.join(cwd, CLAUDE_CLOUD_RELPATH);
    let counter = 1;
    if (fs.existsSync(dst)) {
        const prev = fs.readFileSync(dst, "utf-8");
        const m = prev.match(/^# cache-bust (\d{4}-\d{2}-\d{2})-(\d+)$/m);
        if (m && m[1] === today)
            counter = Number.parseInt(m[2], 10) + 1;
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
const CLOUD_PNPM_GLOBAL_PATH_SETUP = "# pnpm refuses `add -g` unless its global-bin dir is on PATH (corepack pnpm skips `pnpm setup`).\n" +
    'export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"\n' +
    'export PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"';
/** Where a cloud environment lists the provision recipes that failed in it, from the repo root. */
export const UNAVAILABLE_RELPATH = ".bkit/.unavailable";
/**
 * Runs one provision recipe (a function named in `$2`) in its own `set -e` subshell. Its
 * stdout goes to stderr, so a caller's stdout carries only its own report. A failure is
 * named on stderr with the recipe's last error line, added to `$BKIT_UNAVAILABLE`, and
 * appended to `$BKIT_UNAVAILABLE_FILE` as `<name>: <reason>` when that is set. The
 * subshell is never the left side of `||`: bash ignores `set -e` there, so only the
 * recipe's last command would count.
 */
const CLOUD_PROVISION_RUNNER = "bkit_provision() {\n" +
    "  bkit_err=$(mktemp)\n" +
    '  ( set -e; "$2" ) >&2 2>"$bkit_err"\n' +
    "  bkit_rc=$?\n" +
    '  cat "$bkit_err" >&2\n' +
    '  if [ "$bkit_rc" -ne 0 ]; then\n' +
    "    bkit_why=$(grep -v '^[[:space:]]*$' \"$bkit_err\" | tail -n 1 | cut -c 1-300)\n" +
    '    [ -n "$bkit_why" ] || bkit_why="exit $bkit_rc"\n' +
    "    echo \"[cloud-setup] provision '$1' failed (non-blocking): $bkit_why\" >&2\n" +
    '    BKIT_UNAVAILABLE="${BKIT_UNAVAILABLE:+$BKIT_UNAVAILABLE, }$1"\n' +
    '    [ -z "$BKIT_UNAVAILABLE_FILE" ] || printf \'%s: %s\\n\' "$1" "$bkit_why" >> "$BKIT_UNAVAILABLE_FILE"\n' +
    "  fi\n" +
    '  rm -f "$bkit_err"\n' +
    "}";
/**
 * Render the `@@CLOUD_CONTEXT_FETCH_PROVISION@@` setup-script region: the consumer's
 * `context-fetch:provision` recipes, or "" when none are enabled. Placed AFTER the
 * corepack line in the template so `pnpm add -g …` recipes have pnpm available. `bkit
 * context provision` runs the same region, so every cloud platform runs the recipes one way.
 *
 * The setup script is `set -euo pipefail`, so a bare failing recipe (e.g. a heavy
 * `curl | bash` CLI installer that trips over a missing base-image dep) would abort the
 * whole snapshot build and discard every CLI provisioned before it. So errexit is off
 * around the region and back on after it, and each recipe runs on its own through
 * {@link CLOUD_PROVISION_RUNNER}: a failing command stops only its own recipe.
 *
 * With `$REPO_ROOT` set, the region rewrites {@link UNAVAILABLE_RELPATH} under it
 * (removed when nothing failed) for the cloud agent to read. The Claude setup script runs
 * before the clone, with no `$REPO_ROOT`; there the session hook writes the file. The
 * region leaves `$BKIT_UNAVAILABLE` set for the script's closing line.
 */
export function renderCloudContextFetchProvision(cwd) {
    const recipes = extractContextFetchProvisionBlocks(cwd)
        .map(({ name, body }, i) => ({ label: name === "" ? `#${i + 1}` : name, body }))
        .filter(({ body }) => body.trim() !== "");
    if (recipes.length === 0)
        return "";
    const runs = recipes.map(({ label, body }, i) => `bkit_provision_${i + 1}() {\n${body}\n}\nbkit_provision '${label}' bkit_provision_${i + 1}`);
    return ("# context-fetch provision recipes (from .agents/context.md) — each runs on its own. A\n" +
        "# failing one is named with its last error line and never stops this script.\n" +
        CLOUD_PNPM_GLOBAL_PATH_SETUP +
        "\nset +e\n" +
        'BKIT_UNAVAILABLE=""\n' +
        `BKIT_UNAVAILABLE_FILE="\${REPO_ROOT:+$REPO_ROOT/${UNAVAILABLE_RELPATH}}"\n` +
        '[ -z "$BKIT_UNAVAILABLE_FILE" ] || { mkdir -p "${BKIT_UNAVAILABLE_FILE%/*}"; : > "$BKIT_UNAVAILABLE_FILE"; }\n' +
        CLOUD_PROVISION_RUNNER +
        "\n" +
        runs.join("\n") +
        '\nif [ -n "$BKIT_UNAVAILABLE" ]; then\n' +
        '  echo "[cloud-setup] UNAVAILABLE in this environment: $BKIT_UNAVAILABLE. Their setup failed: treat them as absent and do not retry the install." >&2\n' +
        "else\n" +
        '  [ -z "$BKIT_UNAVAILABLE_FILE" ] || rm -f "$BKIT_UNAVAILABLE_FILE"\n' +
        "fi\n" +
        "set -e");
}
/**
 * Entries of every `<!-- {tag}:start --> … <!-- {tag}:end -->` list block BELOW
 * `<!-- bkit:end -->` in `.agents/context.md` — one entry per line; blank, `#` comment
 * and marker lines ignored. Blocks above the marker are never read. Returns entries
 * verbatim, in order.
 */
function extractConsumerListBlock(cwd, tag) {
    const filePath = path.join(cwd, ".agents", "context.md");
    if (!fs.existsSync(filePath))
        return [];
    const content = fs.readFileSync(filePath, "utf-8");
    const endIdx = content.search(/^<!-- bkit:end -->$/m);
    if (endIdx === -1)
        return [];
    const consumer = content.slice(endIdx);
    const entries = [];
    let inBlock = false;
    for (const line of consumer.split("\n")) {
        if (line.startsWith(`<!-- ${tag}:start`)) {
            inBlock = true;
            continue;
        }
        if (line.startsWith(`<!-- ${tag}:end`) || line.startsWith(`<!-- ${tag}:none`)) {
            inBlock = false;
            continue;
        }
        if (!inBlock)
            continue;
        const t = line.trim();
        if (!t || t.startsWith("#") || t.startsWith("<!--"))
            continue;
        entries.push(t);
    }
    return entries;
}
/**
 * Cloud network-allowlist domains the consumer declared in `allowed-domains` blocks
 * (one registrable domain per line). Stack-agnostic: bkit hardcodes no domains — the
 * consumer declares which log-backend / API / app hosts their cloud sessions must
 * reach. Returns declared entries verbatim (pre-expansion), in order.
 */
export function extractAllowedDomains(cwd) {
    return extractConsumerListBlock(cwd, "allowed-domains");
}
/**
 * MCP server names the consumer declared in `mcp-servers` blocks (one per line,
 * spelled exactly as each host names the server in its tool ids). Every tool on a
 * listed server is pre-approved on every host — see `.bkit/providers.md` § MCP
 * servers. Deduplicated, declaration order kept.
 */
export function extractMcpServers(cwd) {
    return [...new Set(extractConsumerListBlock(cwd, "mcp-servers"))];
}
/**
 * Expand each declared registrable domain to BOTH the apex and a `*.` wildcard so the
 * WHOLE domain is allowlisted — the egress proxy matches apex and subdomains
 * separately, so `inngest.com` alone misses `api.inngest.com` and vice-versa. A
 * consumer entry already written as `*.x` is normalised to its apex `x` first, then
 * both forms are emitted. Grouped apex-then-wildcard per domain, domains sorted.
 */
export function expandAllowedDomains(declared) {
    const bases = [
        ...new Set(declared.map((d) => d.replace(/^\*\./, "").trim()).filter(Boolean)),
    ].sort();
    return bases.flatMap((b) => [b, `*.${b}`]);
}
/** True for a bracketed IPv6 literal or a dotted-quad IPv4 literal. */
export function isIpLiteral(host) {
    return host.startsWith("[") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}
/**
 * Propose the registrable base for a provider `baseURL`, or `""` when the URL
 * contributes no allowlistable host. `URL.canParse` gates the parse, so this never
 * throws and carries no `try` / `catch`; an unparseable value contributes nothing.
 *
 * Contributes nothing for an empty host, `localhost` and its subdomains, an IP
 * literal, and any host of fewer than two labels: none of those is reachable through
 * a cloud egress allowlist. Everything else collapses to its last two labels.
 *
 * The collapse is the naive last-two-labels rule. Multi-label public suffixes and
 * shared-tenant apexes are a DENY at authoring time in the registry gate test, never a
 * base rewrite here.
 */
export function proposeEgressBase(baseURL) {
    if (!URL.canParse(baseURL))
        return "";
    const host = new URL(baseURL).hostname;
    if (host === "" || isIpLiteral(host))
        return "";
    if (host === "localhost" || host.endsWith(".localhost"))
        return "";
    const labels = host.split(".");
    if (labels.length < 2)
        return "";
    return labels.slice(-2).join(".");
}
/**
 * Sorted-unique `hosts` and `bases` across a set of egress sources. Pure: takes the
 * rows rather than reading {@link BKIT_EGRESS_SOURCES}, so a test can inject a fixture
 * set without mocking the module.
 */
export function deriveEgressEntries(rows) {
    return {
        hosts: [...new Set(rows.flatMap((r) => r.hosts))].sort(),
        bases: [...new Set(rows.flatMap((r) => r.bases))].sort(),
    };
}
/**
 * Stack-agnostic tooling bases, derived from {@link BKIT_EGRESS_SOURCES} rather than
 * hand-typed — adding a provider, tracker or shipped tooling host updates this export
 * by editing one registry row. **Never** ship observability / app stacks here (Vercel,
 * Supabase, Sentry, …) — those come solely from the consumer's `.agents/context.md`
 * `allowed-domains` block (after `<!-- bkit:end -->`) via {@link resolveNetworkAllowlist}.
 */
export const BKIT_SHIPPED_NETWORK_DOMAINS = deriveEgressEntries(BKIT_EGRESS_SOURCES).bases;
/**
 * The exact hostnames behind {@link BKIT_SHIPPED_NETWORK_DOMAINS}. Consumers of the
 * base list allowlist a whole domain; this is the narrower set, for surfaces that
 * match a literal host.
 */
export const BKIT_SHIPPED_NETWORK_HOSTS = deriveEgressEntries(BKIT_EGRESS_SOURCES).hosts;
/**
 * Apex-only unique bases from an expanded (apex + `*.`) domain list.
 *
 * Single call site (injectOpencodeDerivedAllows in install/modules/index.ts). Same apex-collapse
 * shape as expandAllowedDomains above.
 */
export function networkAllowlistBases(expanded) {
    return [...new Set(expanded.map((d) => d.replace(/^\*\./, "").trim()).filter(Boolean))].sort();
}
/**
 * Local + cloud network allowlist: stack-agnostic tooling defaults ∪ consumer
 * `allowed-domains` from `.agents/context.md` (after `<!-- bkit:end -->`), each as
 * apex + `*.` wildcard. Empty consumer block ⇒ tooling hosts only — no Vercel/etc.
 */
export function resolveNetworkAllowlist(cwd) {
    return expandAllowedDomains([...BKIT_SHIPPED_NETWORK_DOMAINS, ...extractAllowedDomains(cwd)]);
}
/**
 * Every `permissions.allow` row bkit derives into `.claude/settings.json`: one
 * `WebFetch(domain:…)` per {@link resolveNetworkAllowlist} entry, then two MCP rows per
 * {@link extractMcpServers} entry — `mcp__<s>__*` (`.mcp.json` servers, and claude.ai
 * connectors in cloud sessions) and `mcp__claude_ai_<s>__*` (claude.ai connectors in
 * the local CLI). Single source for install / upgrade enrichment and uninstall strip.
 */
export function resolveClaudeDerivedAllows(cwd) {
    return [
        ...resolveNetworkAllowlist(cwd).map((d) => `WebFetch(domain:${d})`),
        ...extractMcpServers(cwd).flatMap((s) => [`mcp__${s}__*`, `mcp__claude_ai_${s}__*`]),
    ];
}
/** Cursor-relative path of the install-written Cursor CLI permissions (MCP allows). */
export const CURSOR_CLI_PERMISSIONS_RELPATH = path.join(".cursor", "cli.json");
/**
 * Write `.cursor/cli.json` — the project-level Cursor CLI / cloud-agent permissions —
 * with one `Mcp(<server>:*)` allow per {@link extractMcpServers} entry. bkit-owned and
 * regenerated whole, like `.bkit/allowlist.json`: hand edits do not survive, the
 * `mcp-servers` block is the source. Call only when the cursor module is installed.
 */
export function writeCursorCliPermissionsArtifact(cwd, dryRun) {
    const allow = extractMcpServers(cwd).map((s) => `Mcp(${s}:*)`);
    const rel = CURSOR_CLI_PERMISSIONS_RELPATH;
    const doc = { permissions: { allow, deny: [] } };
    return { path: rel, wrote: writeGeneratedJson(cwd, rel, doc, dryRun) };
}
/**
 * Write a whole-file generated JSON artifact. Returns whether the on-disk bytes differ
 * from the rendered body — under `dryRun` that is computed without writing, so dry
 * and real runs report the identical write set (the `bkit check` drift signal).
 */
function writeGeneratedJson(cwd, rel, doc, dryRun) {
    const abs = path.join(cwd, rel);
    const body = JSON.stringify(doc, null, 2) + "\n";
    const prev = fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
    if (prev === body)
        return false;
    if (!dryRun) {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, body, "utf-8");
    }
    return true;
}
/**
 * 8-hex fingerprint of the DERIVED egress set only — bases and hosts, sorted, never
 * the consumer union. Hosts are included (the Cursor paste is hosts-only). Editing
 * `allowed-domains` never moves it; editing a registry row does.
 */
export function egressFingerprint() {
    const derived = [
        ...new Set([...BKIT_SHIPPED_NETWORK_DOMAINS, ...BKIT_SHIPPED_NETWORK_HOSTS]),
    ].sort();
    return sha256(derived.join("\n")).slice(0, 8);
}
/**
 * The "where these came from" clause of a network list's count note. A declared entry
 * bkit already ships adds nothing to the list, so it counts once, as shipped, and the
 * clause names how many declared entries that was. `declared` and `shipped` are in the
 * list's own unit: apex bases for the Claude list, exact hosts for Cursor and Codex.
 */
function networkSourceCounts(declared, shipped) {
    const shippedSet = new Set(shipped);
    const declaredSet = new Set(declared);
    const added = [...declaredSet].filter((d) => !shippedSet.has(d)).length;
    const overlap = declaredSet.size - added;
    return (`${shippedSet.size} from bkit's shipped egress registry and ${added} more from ` +
        "`allowed-domains` in `.agents/context.md`" +
        (overlap > 0 ? ` (${overlap} of its ${declaredSet.size} entries already shipped)` : ""));
}
/**
 * Render the `@@CLOUD_NETWORK_ALLOWLIST@@` region — the whole `## Network access`
 * body. Always emits a **Custom** paste block: the list is the derived shipped bases
 * union whatever the consumer declared, so it is never empty and there is no
 * zero-declaration branch. Declaring nothing narrows the list, it does not change the
 * instruction.
 */
export function renderCloudNetworkAllowlist(cwd) {
    const declared = extractAllowedDomains(cwd);
    const domains = resolveNetworkAllowlist(cwd);
    const declaredNote = declared.length === 0
        ? "\n\n_No `allowed-domains` block is declared in `.agents/context.md`. The list above is\n" +
            "bkit's own shipped hosts. If you run cloud `/bkit-debug` or e2e against a deployment,\n" +
            "declare your log-backend + app domains there (apex per line) and they join this list._"
        : "";
    return ("Set to **Custom** and tick **Also include default list of common package\n" +
        "managers** — this EXTENDS the trusted defaults (package registries, GitHub,\n" +
        "cloud SDKs), it does not replace them. Paste into the **Allowed domains** field\n" +
        "(one per line):\n\n" +
        "```text\n" +
        domains.join("\n") +
        "\n```\n\n" +
        `_${domains.length} entries (${domains.length / 2} domains, each as apex + \`*.\` wildcard): ` +
        networkSourceCounts(networkAllowlistBases(declared), BKIT_SHIPPED_NETWORK_DOMAINS) +
        ". Derived set fingerprint `" +
        egressFingerprint() +
        "`._" +
        declaredNote +
        "\n\nUnder **Trusted**, your app domains and most observability / API hosts are\n" +
        "unreachable, so cloud `/bkit-debug` gets no runtime logs and e2e can't hit your\n" +
        "deployment. **Full** works too but opens all egress.");
}
/**
 * Parent directory Claude Code on the web clones a repo into.
 *
 * Observed on the current image (`/home/user/<repo-name>`, agent running as uid=0
 * with `HOME=/root`) and NOT a documented contract: no environment variable in the
 * container names the repo root. The setup script bakes the resolved path and
 * `bkit-cloud-bootstrap.sh` checks the DISCOVERED one, warning loudly on mismatch.
 */
const CLOUD_REPO_PARENT = "/home/user";
/** The path {@link renderCloudWorkspaceTrust} bakes into the setup script. */
export function cloudRepoPath(cwd) {
    return `${CLOUD_REPO_PARENT}/${path.basename(path.resolve(cwd))}`;
}
/**
 * Render the `@@CLOUD_WORKSPACE_TRUST@@` setup-script region — the workspace-trust flip.
 *
 * `permissions.allow` and `permissions.additionalDirectories` in a project's
 * `.claude/settings.json` GRANT capability, so Claude Code applies them only once the
 * workspace trust dialog has been accepted — and it never shows that dialog in a
 * `claude -p` or SDK session. (`deny` and `ask` are unaffected; they only restrict.)
 *
 * Runs in the setup script: as root, before the clone, before Claude Code starts, with
 * its filesystem snapshotted. Settings resolve before SessionStart, and `.claude/` is a
 * protected path allow rules never pre-approve.
 *
 * Merges into the file (it may or may not exist at snapshot time, and Claude Code
 * stores its own state alongside the key on first run).
 */
export function renderCloudWorkspaceTrust(cwd) {
    const repoPath = cloudRepoPath(cwd);
    return ("# Workspace trust. Without this Claude Code IGNORES every permissions.allow row in\n" +
        "# .claude/settings.json — it only applies them once the trust dialog is accepted, and\n" +
        "# cloud sessions never show that dialog. deny/ask are unaffected. Nothing inside the\n" +
        "# session can set this: settings resolve before SessionStart, and .claude/ is a\n" +
        "# protected path that allow rules never pre-approve.\n" +
        'CLAUDE_JSON="${CLAUDE_CONFIG_DIR:-$HOME}/.claude.json"\n' +
        'mkdir -p "$(dirname "$CLAUDE_JSON")"\n' +
        '[ -f "$CLAUDE_JSON" ] || printf \'{}\' > "$CLAUDE_JSON"\n' +
        `jq --arg p '${repoPath}' '.projects[$p].hasTrustDialogAccepted = true' \\\n` +
        '  "$CLAUDE_JSON" > "$CLAUDE_JSON.tmp" && mv "$CLAUDE_JSON.tmp" "$CLAUDE_JSON"');
}
/**
 * Environment entries seeded into `~/.claude/settings.json` by {@link renderCloudUserSettings}.
 *
 * `"$defaults"` is NOT optional: omitting it replaces the entire built-in list for that
 * section, which for `environment` discards every built-in trust slot (including
 * "Trusted repo"). It is always emitted first, and asserted in the tests.
 *
 * Unconfigured, the classifier trusts only the working repo and its configured remotes,
 * and `Host containment` defaults to "an ordinary developer machine or CI runner with
 * open internet". These entries name the context-fetch hosts, the egress-allowlisted
 * sandbox, and the session's identity.
 */
export function cloudAutoModeEnvironment(cwd) {
    const entries = [
        "$defaults",
        "Host containment: Claude Code runs inside the Claude Code on the web sandbox — a " +
            "single-tenant container with no neighbouring workloads to reach, and egress " +
            "restricted to the allowed-domains list configured on that environment. The cloud " +
            "metadata endpoint is not used and should stay unreachable. The only credentials " +
            "in the session are the environment variables set in the Claude app, so nothing " +
            "should ever request credentials belonging to the host itself.",
    ];
    const bases = networkAllowlistBases(resolveNetworkAllowlist(cwd));
    if (bases.length > 0) {
        entries.push(`Trusted internal domains: ${bases.join(", ")} — all on the egress allowlist for ` +
            "this environment, rendered from declarations in this repository, and the hosts " +
            "context-fetch blocks read logs and diagnostics from during /bkit-debug.");
    }
    // Apostrophes would terminate the single-quoted `--argjson` literal in the generated
    // setup script; keep the seeded prose free of them (asserted in the tests).
    return entries;
}
/**
 * Render the `@@CLOUD_USER_SETTINGS@@` setup-script region — the auto-mode classifier config.
 *
 * Written host-side: the classifier does NOT read `autoMode` from `.claude/settings.json`
 * or `.claude/settings.local.json`.
 *
 * Seeds with `//=`, not `=`: a consumer's own `autoMode.environment` is never stomped by a
 * re-pasted setup script, and later bkit changes to the seeded entries do not reach a
 * container that already has them.
 */
export function renderCloudUserSettings(cwd) {
    const env = JSON.stringify(cloudAutoModeEnvironment(cwd));
    return ("# Auto-mode classifier config. The classifier does NOT read `autoMode` from\n" +
        "# .claude/settings.json or .claude/settings.local.json — deliberately, so a checked-in\n" +
        "# repo cannot inject its own classifier rules — so this cannot be shipped in the repo.\n" +
        "# Seeded with //= so a consumer's existing entries are never overwritten.\n" +
        'CLAUDE_SETTINGS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json"\n' +
        'mkdir -p "$(dirname "$CLAUDE_SETTINGS")"\n' +
        '[ -f "$CLAUDE_SETTINGS" ] || printf \'{}\' > "$CLAUDE_SETTINGS"\n' +
        `jq --argjson e '${env}' '.autoMode.environment //= $e' \\\n` +
        '  "$CLAUDE_SETTINGS" > "$CLAUDE_SETTINGS.tmp" && mv "$CLAUDE_SETTINGS.tmp" "$CLAUDE_SETTINGS"');
}
/** `# bkit-toolchain:start|end` marker lines in the Claude template's setup script. */
const TOOLCHAIN_MARKER_LINE = /^# bkit-toolchain:(?:start|end)\n/gm;
/**
 * The pinned toolchain installs (Node, vale, gh, jq + the PATH lead) from the Claude
 * template's setup script — the region between the `# bkit-toolchain:start` / `:end`
 * markers, markers stripped. The pins live once, in `.bkit/shared/.claude/bkit-cloud.md`
 * (where Renovate's regex manager bumps them); every other pasted install script inlines
 * this slice so the cloud toolchains never diverge. Throws when the markers are absent:
 * a Codex doc without its toolchain is a broken paste, not an empty one.
 */
export function extractCloudToolchainScript() {
    const src = fs.readFileSync(path.join(getSharedRoot(), ".claude", "bkit-cloud.md"), "utf-8");
    const m = /^# bkit-toolchain:start\n([\s\S]*?)^# bkit-toolchain:end$/m.exec(src);
    if (!m)
        throw new Error(".claude/bkit-cloud.md template lacks the bkit-toolchain markers");
    return m[1].trim();
}
/**
 * Generate `.claude/bkit-cloud.md` — a copy-paste-ready Claude Code on the web setup doc
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
export function writeClaudeCloudDoc(cwd, tokens) {
    const src = path.join(getSharedRoot(), ".claude", "bkit-cloud.md");
    if (!fs.existsSync(src))
        return false;
    const res = resolveCloudEnvVars(cwd);
    // UTC day drives the cache-bust; renderCloudCacheBust reads the PRIOR dst below to
    // continue the per-day counter, before dst is overwritten.
    const today = new Date().toISOString().slice(0, 10);
    // Function-form replacers: resolved secret values may contain `$`, which a string
    // replacement would interpret ($&, $1, …).
    const content = applyTokens(fs.readFileSync(src, "utf-8"), tokens)
        .replace(TOOLCHAIN_MARKER_LINE, "")
        .replace(/@@CLOUD_CACHE_BUST@@/g, () => renderCloudCacheBust(cwd, today))
        .replace(/@@CLOUD_NETWORK_ALLOWLIST@@/g, () => renderCloudNetworkAllowlist(cwd))
        .replace(/@@CLOUD_WORKSPACE_TRUST@@/g, () => renderCloudWorkspaceTrust(cwd))
        .replace(/@@CLOUD_USER_SETTINGS@@/g, () => renderCloudUserSettings(cwd))
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
 * Render the `@@CURSOR_CONTEXT_FETCH@@` region of `.cursor/bkit-cloud.md`: the consumer's
 * `context-fetch:provision` recipes by name, or "" when none are enabled. On Claude and
 * Codex they are inlined into the pasted script ({@link renderCloudContextFetchProvision});
 * Cursor has no pasted script, so the `install` command in `.cursor/environment.json` runs
 * `bkit context provision`, which runs that same region. The section names the recipes and
 * the line a copy of `environment.json` without it needs.
 */
export function renderCursorContextFetchProvision(cwd) {
    const blocks = extractContextFetchProvisionBlocks(cwd);
    // Empty → "" and the template's sentinel line collapses to a single blank between
    // sections; non-empty → a self-contained section with its own leading/trailing blank.
    if (blocks.length === 0)
        return "";
    const names = blocks.map(({ name }, i) => `\`${name === "" ? `#${i + 1}` : name}\``);
    return ("\n## Context-fetch CLIs (parity with the Claude setup script)\n\n" +
        `Your \`.agents/context.md\` declares these provision recipes: ${names.join(", ")}. The\n` +
        "`install` command in `.cursor/environment.json` runs them each snapshot build, after\n" +
        "`pnpm install`, by ending with:\n\n" +
        "```bash\n" +
        "&& pnpm exec bkit context provision\n" +
        "```\n\n" +
        "A recipe that fails is named in the install log and listed in `.bkit/.unavailable`\n" +
        "for the agent; the install still succeeds.\n");
}
/**
 * The Cursor and Codex allowlist: the fenced paste block and the notes under it. bkit's
 * shipped HOSTS are listed exactly; each declared `allowed-domains` entry bkit does not
 * already ship is listed as the domain and its `*.` wildcard, like the Claude side, since
 * the CLIs and APIs a consumer declares call subdomains (`api.vercel.com` under
 * `vercel.com`). A declared {@link MULTI_TENANT_APEXES} entry is widened the same way,
 * with a note that its wildcard reaches every tenant on the platform, the exfiltration
 * path Cursor's docs warn about.
 */
function renderWidenedNetworkList(cwd) {
    const declared = extractAllowedDomains(cwd);
    const names = [...new Set([...BKIT_SHIPPED_NETWORK_HOSTS, ...declared])].sort();
    const shipped = new Set(BKIT_SHIPPED_NETWORK_HOSTS);
    const widened = (n) => declared.includes(n) && !shipped.has(n);
    const entries = names.flatMap((n) => (widened(n) ? [n, `*.${n}`] : [n]));
    const shared = [...new Set(declared)].filter((d) => MULTI_TENANT_APEXES.includes(d));
    const sharedNote = shared.length === 0
        ? ""
        : `\n\n${shared.map((d) => `\`${d}\``).join(", ")}: shared by many tenants, so the ` +
            "`*.` wildcard reaches every tenant on it. To narrow it, declare the exact hosts you " +
            `call there instead (e.g. \`<name>.${shared[0]}\`).`;
    return ("```text\n" +
        entries.join("\n") +
        "\n```\n\n" +
        `_${entries.length} entries (${names.length} hosts and domains, each declared domain ` +
        "also as a `*.` wildcard): " +
        networkSourceCounts(declared, BKIT_SHIPPED_NETWORK_HOSTS) +
        ". Derived set fingerprint `" +
        egressFingerprint() +
        "`._" +
        sharedNote);
}
/**
 * Render the `@@CURSOR_NETWORK@@` region — Cursor Cloud Agents' egress allowlist
 * (dashboard → Security: "Allow all" / "Default + allowlist" / "Allowlist only"), which
 * takes `*.` patterns (Cursor's own default list is written that way).
 */
export function renderCursorNetworkAllowlist(cwd) {
    return ("If your org runs Cloud Agents in **Allowlist only** / **Default + allowlist** mode\n" +
        "(dashboard → **Security**), add these hosts so cloud `/bkit-debug` + e2e can reach\n" +
        "bkit's own tooling and your app and log backends:\n\n" +
        renderWidenedNetworkList(cwd));
}
/**
 * Generate `.cursor/bkit-cloud.md` — the Cursor Cloud Agents analogue of
 * `.claude/bkit-cloud.md`. Both describe the SAME bkit cloud environment; only the
 * mechanics differ. On Claude the doc carries a pasted setup script + network
 * selector; on Cursor the toolchain lives in `.cursor/Dockerfile` + the per-snapshot
 * `.cursor/environment.json` `install` (both committed, nothing to paste), so this doc
 * is narrower: it resolves the **dashboard environment variables** to real values from
 * the consumer's `.envrc` (the same tracker-independent set as the Claude doc) and
 * surfaces any context-fetch CLIs for parity.
 *
 * Like `.claude/bkit-cloud.md` it is gitignored + chmod 600 and UNTRACKED (never pushed to
 * any WriteSet / manifest / canonicalHashes) — its values are machine-local and
 * expected to differ, so it never enters `bkit check` drift or the upgrade template
 * walk. Shared by install (runCursorModule) and upgrade. Callers MUST guard on
 * `!dryRun` (never write secrets during `bkit check` / `--dry-run`) and on the cursor
 * host being installed. Returns true when a file was written (false when the template
 * is absent). Never logs the resolved values.
 */
export function writeCursorCloudDoc(cwd, tokens) {
    const src = path.join(getSharedRoot(), ".cursor", "bkit-cloud.md");
    if (!fs.existsSync(src))
        return false;
    const res = resolveCloudEnvVars(cwd);
    // Function-form replacers: resolved secret values may contain `$`, which a string
    // replacement would interpret ($&, $1, …).
    const content = applyTokens(fs.readFileSync(src, "utf-8"), tokens)
        .replace(/@@CLOUD_ENV_VARS@@/g, () => renderCloudEnvBlock(res))
        .replace(/@@CLOUD_ENV_NOTES@@/g, () => renderCloudEnvNotes(res))
        .replace(/@@CURSOR_NETWORK@@/g, () => renderCursorNetworkAllowlist(cwd))
        .replace(/@@CURSOR_CONTEXT_FETCH@@/g, () => renderCursorContextFetchProvision(cwd));
    const dst = path.join(cwd, CURSOR_CLOUD_RELPATH);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, content, "utf-8");
    fs.chmodSync(dst, 0o600);
    return true;
}
/**
 * Render the `@@CODEX_NETWORK@@` region — Codex Cloud's **Internet access** settings
 * for the environment: the same list as the Cursor doc. Codex's docs describe
 * **Additional allowed domains** as exact hosts (a root domain also allows `www.`) and
 * say nothing of `*.`, so the note marks the wildcard entries untested and names the
 * setting that gets past a host they miss.
 */
export function renderCodexNetworkAllowlist(cwd) {
    return ("Under **Internet access**, keep **Enable package manager domains** on and paste these\n" +
        "into **Additional allowed domains** (one per line) so cloud `/bkit-debug` + e2e can\n" +
        "reach bkit's own tooling and your app and log backends:\n\n" +
        renderWidenedNetworkList(cwd) +
        "\n\nThe `*.` entries are untested on Codex: its docs list exact hosts only. If a task\n" +
        "still cannot reach a subdomain, switch to **Enable all public internet access** (opens\n" +
        "all egress) or add that exact host.");
}
/**
 * Generate `.codex/bkit-cloud.md` — the Codex Cloud analogue of `.claude/bkit-cloud.md`:
 * the SAME bkit cloud environment, built by Codex's mechanics. Codex runs a pasted
 * **Install script** (like Claude's setup script) plus the environment's variables, so
 * this doc carries the Claude template's pinned toolchain slice
 * ({@link extractCloudToolchainScript}), the consumer's corepack pnpm and context-fetch
 * provision recipes, the per-snapshot `pnpm install`, the exact-host network list, and
 * the resolved env block.
 *
 * Gitignored + chmod 600 and UNTRACKED like its siblings. Shared by install
 * (runCodexModule) and upgrade. Callers MUST guard on `!dryRun` and on the codex host
 * being installed. Returns true when a file was written (false when the template is
 * absent). Never logs the resolved values.
 */
export function writeCodexCloudDoc(cwd, tokens) {
    const src = path.join(getSharedRoot(), ".codex", "bkit-cloud.md");
    if (!fs.existsSync(src))
        return false;
    const res = resolveCloudEnvVars(cwd);
    // Function-form replacers: resolved secret values may contain `$`, which a string
    // replacement would interpret ($&, $1, …).
    const content = applyTokens(fs.readFileSync(src, "utf-8"), tokens)
        .replace(/@@CODEX_TOOLCHAIN@@/g, () => extractCloudToolchainScript())
        .replace(/@@CODEX_NETWORK@@/g, () => renderCodexNetworkAllowlist(cwd))
        .replace(/@@CLOUD_COREPACK@@/g, () => renderCorepackLine(cwd))
        .replace(/@@CLOUD_CONTEXT_FETCH_PROVISION@@/g, () => renderCloudContextFetchProvision(cwd))
        .replace(/@@CLOUD_ENV_VARS@@/g, () => renderCloudEnvBlock(res))
        .replace(/@@CLOUD_ENV_NOTES@@/g, () => renderCloudEnvNotes(res));
    const dst = path.join(cwd, CODEX_CLOUD_RELPATH);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, content, "utf-8");
    fs.chmodSync(dst, 0o600);
    return true;
}
