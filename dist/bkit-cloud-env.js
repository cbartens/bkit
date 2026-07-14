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
import { getTemplatesRoot } from "./bkit-paths.js";
import { applyTokens } from "./bkit-tokens.js";
// Consumer-relative path of the generated doc. Shared so the upgrade template walk
// (bkit-install.ts) can exclude it — it is a generated OUTPUT file, never a
// template to reconcile.
export const CLAUDE_CLOUD_RELPATH = path.join(".claude", "cloud.md");
// Session-hijack keys: exporting these into a cloud env redirects Claude Code's
// OWN model calls onto API-key billing instead of the user's subscription
// (`.bkit/cloud.md` § Environment variables). Always dropped from the paste block.
export const SESSION_HIJACK_KEYS = ["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN"];
// bkit baseline env-var NAMES every Claude-on-web environment needs. Emitted as a
// placeholder ONLY when absent from the resolved `.envrc` set — a present value
// (e.g. GH_BKIT_TOKEN already in `.bkit/.env`) keeps its real resolved value.
const BASELINE_TOKEN_PLACEHOLDERS = [
    ["GH_BKIT_TOKEN", "<fine-grained PAT — see .bkit/cloud.md § GH_BKIT_TOKEN permissions>"],
    ["GH_BKIT_TOKEN_INSTALL", "<classic PAT with read:packages>"],
];
// Earlier-compaction override — a bkit constant, not a secret. Appended to the
// block when not already resolved from a source file.
const AUTOCOMPACT_KEY = "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE";
const AUTOCOMPACT_VALUE = "70";
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
 * lines for any absent baseline token, then the autocompact override if unset.
 */
export function renderCloudEnvBlock(res) {
    const lines = [];
    for (const [k, v] of res.included)
        lines.push(`${k}=${v}`);
    for (const [name, placeholder] of BASELINE_TOKEN_PLACEHOLDERS) {
        if (res.placeholders.includes(name))
            lines.push(`${name}=${placeholder}`);
    }
    if (!res.included.some(([k]) => k === AUTOCOMPACT_KEY)) {
        lines.push(`${AUTOCOMPACT_KEY}=${AUTOCOMPACT_VALUE}`);
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
        bullets.push(`- **Dropped — session-billing hijack:** ${fmtList(res.hijackDropped)} — would bill Claude Code's own model calls to your API key instead of your subscription.`);
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
 * Extract the bash body of every `debug-fetch:provision <name>` block the consumer
 * enabled below `<!-- bkit:end -->` in `.agents/config.md`. Stack-agnostic: bkit
 * hardcodes no CLI names — the install recipe lives in the consumer's config.md,
 * co-located with the fetch block that needs the CLI. Mirrors the awk parser in
 * `.claude/hooks/cloud-bootstrap.sh` so the web setup-script snapshot and the
 * per-session hook provision the same CLIs. Returns one string per block (bash body).
 */
export function extractDebugFetchProvisionRecipes(cwd) {
    const filePath = path.join(cwd, ".agents", "config.md");
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
        if (/^<!-- debug-fetch:provision/.test(line)) {
            inProv = true;
            inFence = false;
            cur = [];
            continue;
        }
        if (/^<!-- debug-fetch:(start|end|none)/.test(line)) {
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
 * Render the `@@CLOUD_DEBUG_FETCH_PROVISION@@` setup-script region: the consumer's
 * `debug-fetch:provision` recipes, or "" when none are enabled. Placed AFTER the
 * corepack line in the template so `pnpm add -g …` recipes have pnpm available.
 *
 * Recipes run in a best-effort `( set +e … ) || …` subshell: the setup script is
 * `set -euo pipefail`, so without this a single failing recipe (e.g. a heavy `curl |
 * bash` CLI installer that trips over a missing base-image dep) aborts the whole
 * snapshot build and discards every CLI provisioned before it. `set +e` also lets a
 * later recipe run after an earlier one fails. Mirrors the non-blocking per-session
 * hook (`… | bash || log`), keeping the two cloud provision paths behaviourally equal.
 */
export function renderCloudDebugFetchProvision(cwd) {
    const recipes = extractDebugFetchProvisionRecipes(cwd);
    if (recipes.length === 0)
        return "";
    return ("# debug-fetch CLIs (from .agents/config.md provision blocks) — self-guarded, best-effort.\n" +
        CLOUD_PNPM_GLOBAL_PATH_SETUP +
        "\n" +
        "(\n" +
        "  set +e\n" +
        recipes.join("\n") +
        "\n" +
        ') || echo "[cloud-setup] a debug-fetch provision recipe failed (non-blocking); its CLI will be absent" >&2');
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
export function writeClaudeCloudDoc(cwd, tokens) {
    const src = path.join(getTemplatesRoot(), ".claude", "cloud.md");
    if (!fs.existsSync(src))
        return false;
    const res = resolveCloudEnvVars(cwd);
    // UTC day drives the cache-bust; renderCloudCacheBust reads the PRIOR dst below to
    // continue the per-day counter, which is safe because we overwrite dst afterwards.
    const today = new Date().toISOString().slice(0, 10);
    // Function-form replacers: resolved secret values may contain `$`, which a string
    // replacement would interpret ($&, $1, …).
    const content = applyTokens(fs.readFileSync(src, "utf-8"), tokens)
        .replace(/@@CLOUD_CACHE_BUST@@/g, () => renderCloudCacheBust(cwd, today))
        .replace(/@@CLOUD_COREPACK@@/g, () => renderCorepackLine(cwd))
        .replace(/@@CLOUD_DEBUG_FETCH_PROVISION@@/g, () => renderCloudDebugFetchProvision(cwd))
        .replace(/@@CLOUD_ENV_VARS@@/g, () => renderCloudEnvBlock(res))
        .replace(/@@CLOUD_ENV_NOTES@@/g, () => renderCloudEnvNotes(res));
    const dst = path.join(cwd, CLAUDE_CLOUD_RELPATH);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, content, "utf-8");
    fs.chmodSync(dst, 0o600);
    return true;
}
