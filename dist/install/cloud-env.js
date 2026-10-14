// install/cloud-env.ts — resolve a copy-paste-ready Claude Code on the web env-var block
// by *following the consumer's `.envrc`*.
//
// The generated `.claude/bkit-cloud.md` (see runClaudeModule) inlines REAL SECRET
// VALUES so it is gitignored + chmod 600 and never committed. This module owns the
// stack-agnostic resolution: it reads whatever dotenv files the repo's `.envrc`
// sources, honours the `.envrc` `unset` lines, and drops session-hijack keys.
// bkit hardcodes NO stack-specific key lists — the stack knowledge lives in the
// consumer's `.envrc`, keeping bkit's shipped surface stack-independent.
//
// Excluded keys are exactly the vars `.envrc` unsets, and the review key is
// BKIT_ANTHROPIC_API_KEY — both derived here without a bespoke key list.
import * as fs from "node:fs";
import * as path from "node:path";
import { getSharedRoot } from "../shared/package-roots.js";
import { applyTokens } from "./placeholders.js";
import { BKIT_EGRESS_SOURCES } from "../shared/egress.js";
import { sha256 } from "./version-file.js";
// Consumer-relative paths of the generated docs. Shared so the upgrade template walk
// (commands/install/install.ts) can exclude them — they are generated OUTPUT files, never
// templates to reconcile. One per cloud host (Claude Code on the web / Cursor
// Background Agents); both inline resolved secrets, both gitignored + chmod 600.
export const CLAUDE_CLOUD_RELPATH = path.join(".claude", "bkit-cloud.md");
export const CURSOR_CLOUD_RELPATH = path.join(".cursor", "bkit-cloud.md");
// Session-hijack keys: exporting these into a cloud env redirects Claude Code's
// OWN model calls onto API-key billing instead of the user's subscription
// (`.bkit/cloud.md` § Environment variables). Always dropped from the paste block.
export const SESSION_HIJACK_KEYS = [
    "ANTHROPIC_API_KEY",
    "BKIT_ANTHROPIC_API_KEY",
    "ANTHROPIC_AUTH_TOKEN",
];
// bkit baseline env-var NAMES every Claude-on-web environment needs. Emitted as a
// placeholder ONLY when absent from the resolved `.envrc` set — a present value
// (e.g. BKIT_GH_TOKEN already in `.bkit/.env`) keeps its real resolved value.
const BASELINE_TOKEN_PLACEHOLDERS = [
    [
        "BKIT_GH_TOKEN",
        "<PAT — fine-grained one owner / classic across owners; see .bkit/cloud.md § BKIT_GH_TOKEN token permissions>",
    ],
];
// Claude Code on the web: GitHub tracker.
export const CLAUDE_CLOUD_POLICY = {
    baseline: BASELINE_TOKEN_PLACEHOLDERS,
};
// Cursor Background Agents: `BKIT_LINEAR_API_KEY` prepended for the Linear tracker
// (bkit-preflight.sh calls the Linear GraphQL API and hard-fails without it); GitHub
// tracker uses the same GH baseline as Claude.
const CURSOR_LINEAR_PLACEHOLDER = [
    "BKIT_LINEAR_API_KEY",
    "<Linear personal API key — https://linear.app/settings/api>",
];
export function cursorCloudPolicy(tracker) {
    return {
        baseline: tracker === "linear"
            ? [CURSOR_LINEAR_PLACEHOLDER, ...BASELINE_TOKEN_PLACEHOLDERS]
            : BASELINE_TOKEN_PLACEHOLDERS,
    };
}
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
export function resolveCloudEnvVars(cwd, policy = CLAUDE_CLOUD_POLICY) {
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
    for (const [name] of policy.baseline) {
        if (!present.has(name))
            res.placeholders.push(name);
    }
    return res;
}
/**
 * Render the `.env`-format paste block: resolved KEY=value lines, then placeholder
 * lines for any absent baseline token.
 */
export function renderCloudEnvBlock(res, policy = CLAUDE_CLOUD_POLICY) {
    const lines = [];
    for (const [k, v] of res.included)
        lines.push(`${k}=${v}`);
    for (const [name, placeholder] of policy.baseline) {
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
            "placeholders. Add your `.envrc` (`bkit install` seeds one) and re-run to inline real values._");
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
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
        const pm = typeof pkg["packageManager"] === "string" ? pkg["packageManager"] : "";
        const m = pm.match(/^pnpm@(\d+\.\d+\.\d+)/);
        return m?.[1] ?? "";
    }
    catch {
        return "";
    }
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
 * the same list as `provision`, which `.claude/hooks/bkit-cloud-bootstrap.sh` runs, so the web
 * setup-script snapshot and the per-session hook provision the same CLIs. Returns one
 * string per block (bash body).
 */
export function extractContextFetchProvisionRecipes(cwd) {
    const filePath = path.join(cwd, ".agents", "context.md");
    if (!fs.existsSync(filePath))
        return [];
    const content = fs.readFileSync(filePath, "utf-8");
    const endIdx = content.search(/^<!-- bkit:end -->$/m);
    if (endIdx === -1)
        return [];
    const consumer = content.slice(endIdx);
    const recipes = [];
    let cur = null;
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
            if (inProv && cur && cur.length > 0)
                recipes.push(cur.join("\n"));
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
export function renderCloudContextFetchProvision(cwd) {
    const recipes = extractContextFetchProvisionRecipes(cwd);
    if (recipes.length === 0)
        return "";
    return ("# context-fetch CLIs (from .agents/context.md provision blocks) — self-guarded, best-effort.\n" +
        CLOUD_PNPM_GLOBAL_PATH_SETUP +
        "\n" +
        "(\n" +
        "  set +e\n" +
        recipes.join("\n") +
        "\n" +
        ') || echo "[cloud-setup] a context-fetch provision recipe failed (non-blocking); its CLI will be absent" >&2');
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
/** Cursor-relative path of the install-written curl/wget allowlist (guardrails). */
export const NETWORK_ALLOWLIST_RELPATH = path.join(".cursor", "allowlist.json");
/**
 * Write `.cursor/allowlist.json` for Cursor `bkit-guardrails.cjs` (runtime curl/wget host
 * checks). Claude/OpenCode bake the same domain set into their own configs at
 * install/upgrade — they do not read this file. Call only when the cursor module
 * is installed (do not create `.cursor/` for claude-only consumers).
 */
export function writeNetworkAllowlistArtifact(cwd, dryRun) {
    const domains = resolveNetworkAllowlist(cwd);
    const rel = NETWORK_ALLOWLIST_RELPATH;
    return { path: rel, domains, wrote: writeGeneratedJson(cwd, rel, { domains }, dryRun) };
}
/** Cursor-relative path of the install-written Cursor CLI permissions (MCP allows). */
export const CURSOR_CLI_PERMISSIONS_RELPATH = path.join(".cursor", "cli.json");
/**
 * Write `.cursor/cli.json` — the project-level Cursor CLI / cloud-agent permissions —
 * with one `Mcp(<server>:*)` allow per {@link extractMcpServers} entry. bkit-owned and
 * regenerated whole, like `.cursor/allowlist.json`: hand edits do not survive, the
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
 * Render the `@@CLOUD_NETWORK_ALLOWLIST@@` region — the whole `## Network access`
 * body. Always emits a **Custom** paste block: the list is the derived shipped bases
 * union whatever the consumer declared, so it is never empty and there is no
 * zero-declaration branch. Declaring nothing narrows the list, it does not change the
 * instruction.
 */
export function renderCloudNetworkAllowlist(cwd) {
    const declared = extractAllowedDomains(cwd);
    const domains = resolveNetworkAllowlist(cwd);
    const derivedCount = BKIT_SHIPPED_NETWORK_DOMAINS.length;
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
        `_${domains.length} entries — ${derivedCount} derived from bkit's shipped egress registry ` +
        `and ${declared.length} declared in \`allowed-domains\` in \`.agents/context.md\`, ` +
        "each as apex + `*.` wildcard. Derived set fingerprint `" +
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
 * `context-fetch:provision` recipes formatted for the Cursor mechanic, or "" when none
 * are enabled. On Claude these CLIs are baked into the pasted setup script (see
 * renderCloudContextFetchProvision); Cursor has no setup script, so — to keep the two
 * cloud environments aligned — the same recipes are surfaced as a copy-paste block for
 * the per-snapshot `install` command in `.cursor/environment.json`. The recipes are
 * already idempotent (`command -v X || pnpm add -g X`), so they are safe to re-run on
 * every snapshot build. Reuses the SAME extractor as the Claude path so the two clouds
 * never diverge on which CLIs they provision.
 */
export function renderCursorContextFetchProvision(cwd) {
    const recipes = extractContextFetchProvisionRecipes(cwd);
    // Empty → "" and the template's sentinel line collapses to a single blank between
    // sections; non-empty → a self-contained section with its own leading/trailing blank.
    if (recipes.length === 0)
        return "";
    return ("\n## Context-fetch CLIs (parity with the Claude setup script)\n\n" +
        "Your `.agents/context.md` declares these context-fetch CLIs. The Claude setup script\n" +
        "bakes them into its snapshot; for the SAME tools on Cursor, chain them into the\n" +
        "`install` command in `.cursor/environment.json` (idempotent — safe every rebuild):\n\n" +
        "```bash\n" +
        recipes.join("\n") +
        "\n```\n");
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
export function renderCursorNetworkAllowlist(cwd) {
    const declared = extractAllowedDomains(cwd);
    // Exact hosts, never apex + `*.`: Cursor's own docs warn a broad wildcard opens
    // egress far wider than intended, so the shipped set contributes its HOSTS here
    // while the Claude side takes the wildcard-expanded bases.
    const entries = [...new Set([...BKIT_SHIPPED_NETWORK_HOSTS, ...declared])].sort();
    return ("If your org runs Cloud Agents in **Allowlist only** / **Default + allowlist** mode\n" +
        "(dashboard → **Security**), add these hosts so cloud `/bkit-debug` + e2e can reach\n" +
        "bkit's own tooling and your app and log backends:\n\n" +
        "```text\n" +
        entries.join("\n") +
        "\n```\n\n" +
        `_${entries.length} host(s) — ${BKIT_SHIPPED_NETWORK_HOSTS.length} derived from bkit's shipped ` +
        `egress registry and ${declared.length} declared in \`allowed-domains\` in ` +
        "`.agents/context.md`. Derived set fingerprint `" +
        egressFingerprint() +
        "`._ Add only the\n" +
        "specific subdomains you need (e.g. `api.example.com`) — Cursor warns that a broad `*.`\n" +
        "wildcard opens egress far wider than intended. (The Claude side auto-expands to apex + `*.`;\n" +
        "Cursor's allowlist is deliberately narrower.)");
}
/**
 * Generate `.cursor/bkit-cloud.md` — the Cursor Cloud Agents analogue of
 * `.claude/bkit-cloud.md`. Both describe the SAME bkit cloud environment; only the
 * mechanics differ. On Claude the doc carries a pasted setup script + network
 * selector; on Cursor the toolchain lives in `.cursor/Dockerfile` + the per-snapshot
 * `.cursor/environment.json` `install` (both committed, nothing to paste), so this doc
 * is narrower: it resolves the **dashboard environment variables** to real values from
 * the consumer's `.envrc` (Cursor policy — Linear tracker adds `BKIT_LINEAR_API_KEY`, no
 * autocompact knob) and surfaces any context-fetch CLIs for parity.
 *
 * Like `.claude/bkit-cloud.md` it is gitignored + chmod 600 and UNTRACKED (never pushed to
 * any WriteSet / manifest / canonicalHashes) — its values are machine-local and
 * expected to differ, so it never enters `bkit check` drift or the upgrade template
 * walk. Shared by install (runCursorModule) and upgrade. Callers MUST guard on
 * `!dryRun` (never write secrets during `bkit check` / `--dry-run`) and on the cursor
 * host being installed. Returns true when a file was written (false when the template
 * is absent). Never logs the resolved values.
 */
export function writeCursorCloudDoc(cwd, tokens, tracker) {
    const src = path.join(getSharedRoot(), ".cursor", "bkit-cloud.md");
    if (!fs.existsSync(src))
        return false;
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
