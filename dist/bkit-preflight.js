// bkit-preflight.ts — Phase 1: read-only detection BEFORE any writes.
// No imports from bkit-modules.ts — this file is upstream of module dispatch.
//
// Allow-list for cross-module imports (BAR-167 Phase 1+2):
//   readBkitVersion       — from bkit-version.ts (version pin reader)
//   deepContains          — from bkit-tiers.ts (JSON containment primitive)
//   extractManagedBlock   — from bkit-install.ts (marker block extraction)
//   getPkgRoot            — from bkit-paths.ts (package root resolver, no cycle)
//   parseIssueTracker     — from bkit-manifest.ts (pure data, no cycle)
//   LINT_PROSE_SCRIPT     — from bkit-manifest.ts (pure data, no cycle) — the F9
//                           remedy text must quote the SAME string install seeds
import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { readBkitVersion } from "./bkit-version.js";
import { deepContains } from "./bkit-tiers.js";
import { detectRetiredOwnedFiles } from "./bkit-retire.js";
import { extractNamedBlocks, stripManagedBlock } from "./bkit-markers.js";
import { getPkgRoot, getTemplatesRoot } from "./bkit-paths.js";
import { parseIssueTracker, DEFAULT_ISSUE_TRACKER, LINT_PROSE_SCRIPT, } from "./bkit-manifest.js";
// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------
// Deduplicate an array of findings by `id`, first occurrence wins.
export function dedupeById(findings) {
    const seen = new Set();
    return findings.filter((f) => {
        if (seen.has(f.id))
            return false;
        seen.add(f.id);
        return true;
    });
}
/**
 * Strip out content inside bkit-managed block markers (HTML, hash, and slash style).
 * Used by detectors that need to inspect only consumer-owned content.
 *
 * Uses line-anchored marker detection (via stripManagedBlock from bkit-tiers.ts; KN-8).
 * Applies all marker styles sequentially: `<!-- bkit:start -->`, `# bkit:start`, and
 * `// bkit:start`.
 */
export function stripBkitBlock(content) {
    // Strip html-comment markers first, then hash-comment, then slash-comment
    // (line-anchored, KN-8 safe).
    return stripManagedBlock(stripManagedBlock(stripManagedBlock(content, "html-comment"), "hash-comment"), "slash-comment");
}
// ---------------------------------------------------------------------------
// Blocker detectors
// ---------------------------------------------------------------------------
export function detectNoPackageJson(cwd) {
    if (fs.existsSync(path.join(cwd, "package.json")))
        return null;
    return {
        id: "no-package-json",
        severity: "blocker",
        detect: "package.json not found in the current directory.",
        action: "Run `npm init -y` to create a minimal package.json, or copy one from an existing project, then re-run `pnpm bkit install`.",
    };
}
export function detectMalformedPackageJson(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return null;
    try {
        JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        return null;
    }
    catch {
        return {
            id: "malformed-package-json",
            severity: "blocker",
            detect: "package.json exists but contains invalid JSON.",
            action: "Fix the JSON syntax error in package.json (run `node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8'))\"` to locate the error), then re-run `pnpm bkit install`.",
        };
    }
}
export function detectNotGitRepo(cwd, modules) {
    if (!modules.has("core"))
        return null;
    if (fs.existsSync(path.join(cwd, ".git")))
        return null;
    return {
        id: "not-git-repo",
        severity: "blocker",
        detect: "core install requested but .git/ directory not found — this is not a git repository.",
        action: "Run `git init` to initialise a git repo, then re-run. bkit installs into a git repository — its managed .gitignore/.gitattributes blocks require one (core is implicit; there is no --core flag to omit).",
    };
}
// ---------------------------------------------------------------------------
// Advisory detectors
// ---------------------------------------------------------------------------
/**
 * Advisory: `docs/completed.md` still present — the consumer has not yet run
 * `bkit telemetry migrate` (which ports it to `.bkit/issues.jsonl` as
 * `kind:"feature"` rows and performs the bootstrap seed). Advisory only, never a
 * blocker (DE-39: the migrator is never wired to `bkit upgrade`); an unmigrated repo
 * gets an empty `docs/roadmap.md` board.
 */
export function detectCompletedMdUnmigrated(cwd) {
    const filePath = path.join(cwd, "docs", "completed.md");
    if (!fs.existsSync(filePath))
        return null;
    return {
        id: "completed-md-unmigrated",
        severity: "advisory",
        detect: "docs/completed.md still present — not yet migrated to .bkit/issues.jsonl (#380).",
        action: 'Run `bkit telemetry migrate` to port docs/completed.md entries to .bkit/issues.jsonl (kind:"feature", status:"SHIPPED") and seed in-flight FIDs from docs/plans/**. Until then docs/roadmap.md\'s board is empty, not wrong.',
    };
}
export function detectLintProseF9Vulnerable(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return null;
    let pkg;
    try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    }
    catch {
        return null;
    }
    const scripts = pkg.scripts;
    if (!scripts || !scripts["lint:prose"])
        return null;
    const scriptVal = scripts["lint:prose"];
    if (scriptVal.includes("[ -d .vale/styles/write-good ]"))
        return null;
    return {
        id: "lint-prose-f9-vulnerable",
        severity: "advisory",
        detect: "package.json#scripts.lint:prose exists but lacks the `[ -d .vale/styles/write-good ]` guard (F9 — BAR-138).",
        action: `Update lint:prose to the guarded form: ${LINT_PROSE_SCRIPT}`,
    };
}
export function detectBkitVersionMajorDowngrade(cwd, installingVersion) {
    const versionFile = path.join(cwd, ".bkit", "version");
    if (!fs.existsSync(versionFile))
        return null;
    const onDisk = fs.readFileSync(versionFile, "utf-8").trim();
    if (!onDisk)
        return null; // empty/whitespace file — guard against parseInt("") = NaN
    const onDiskMajor = parseInt(onDisk.split(".")[0] ?? "0", 10);
    const installingMajor = parseInt(installingVersion.split(".")[0] ?? "0", 10);
    if (Number.isNaN(onDiskMajor) || Number.isNaN(installingMajor))
        return null; // malformed version strings — no false advisory
    if (onDiskMajor <= installingMajor)
        return null;
    return {
        id: "bkit-version-major-downgrade",
        severity: "advisory",
        detect: `On-disk .bkit-version major (${onDiskMajor}) is greater than the installing version major (${installingMajor}). This is a major-version downgrade.`,
        action: `If this is intentional, proceed. Otherwise, check your @cbartens/bkit version pin in package.json and ensure you're installing the intended version. Current on-disk: ${onDisk}, installing: ${installingVersion}.`,
    };
}
export function detectBkitVersionPinStale(cwd) {
    const installedPkgPath = path.join(cwd, "node_modules", "@cbartens", "bkit", "package.json");
    const versionFile = path.join(cwd, ".bkit", "version");
    if (!fs.existsSync(installedPkgPath) || !fs.existsSync(versionFile))
        return null;
    let installedVersion;
    try {
        const pkg = JSON.parse(fs.readFileSync(installedPkgPath, "utf-8"));
        installedVersion = pkg.version ?? "";
    }
    catch {
        return null;
    }
    const onDiskVersion = fs.readFileSync(versionFile, "utf-8").trim();
    if (!installedVersion || !onDiskVersion)
        return null;
    // Compare semver: installed > onDisk → pin is stale
    if (!semverGt(installedVersion, onDiskVersion))
        return null;
    return {
        id: "bkit-version-pin-stale",
        severity: "advisory",
        detect: `node_modules/@cbartens/bkit version (${installedVersion}) is newer than .bkit/version (${onDiskVersion}). Consumer ran \`pnpm add -D @cbartens/bkit@${installedVersion}\` but did not re-run the bkit installer.`,
        action: "Run `pnpm bkit upgrade` to resync the .agents payload + version pin across everything you have installed, then commit the result. `pnpm add` does not run the bkit installer — bkit's payload must be re-synced after every `@cbartens/bkit` version bump.",
    };
}
/**
 * Detect when a line bkit's .gitignore managed block contributes is already
 * present elsewhere in the file. Benign (git ignores duplicates) but worth
 * surfacing — the bkit-managed block should be the single source of truth.
 */
const BKIT_GITIGNORE_LINES = [
    ".worktrees/",
    "docs/plans/*/logs/**/raw/",
    "docs/plans/*/logs/**/.lock",
    ".husky/_",
    ".bkit/advisories.md",
    ".bkit/.env",
];
export function detectGitignoreBlockDuplicates(cwd) {
    const gitignorePath = path.join(cwd, ".gitignore");
    if (!fs.existsSync(gitignorePath))
        return null;
    const content = fs.readFileSync(gitignorePath, "utf-8");
    const outsideBkit = stripBkitBlock(content);
    const outsideLines = outsideBkit
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    const dupes = BKIT_GITIGNORE_LINES.filter((bl) => outsideLines.includes(bl));
    if (dupes.length === 0)
        return null;
    return {
        id: "gitignore-block-duplicates",
        severity: "advisory",
        detect: `.gitignore lists [${dupes.join(", ")}] both inside the bkit-managed block and outside it (consumer-owned region).`,
        action: `Git ignores duplicates harmlessly, but cleaner to remove the consumer-side line(s) so the bkit-managed block is the single source of truth. Affected lines: ${dupes.join(", ")}.`,
    };
}
// ---------------------------------------------------------------------------
// Phase 1 JSON advisories / blockers (BAR-167)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// [verbose ci] marker advisories (BAR-224)
// ---------------------------------------------------------------------------
// No presence detector for the ci.yml `verbose-ci-env` block: ci.yml is the consumer's copy
// of a template, so bkit never checks its blocks.
/**
 * Advisory: consumer's Playwright invocation passes `--reporter=line`, which
 * overrides the configured reporter chain in `playwright.config.ts`. Under
 * `[verbose ci]` with `--trace=on`, this writes trace artifacts that no reporter
 * surfaces — pure cost (artifact upload + storage) with zero diagnostic payoff.
 *
 * "Hostile" gap per the BAR-224 signal-vs-noise classification. Reads the consumer's
 * own ci.yml, active lines only: YAML comment lines are dropped first, so a commented
 * template stub or a commented-out example never fires.
 */
export function detectPlaywrightReporterHostile(cwd) {
    const ciPath = path.join(cwd, ".github", "workflows", "ci.yml");
    if (!fs.existsSync(ciPath))
        return null;
    const content = fs.readFileSync(ciPath, "utf-8");
    // Filter out YAML comment lines (those starting with optional whitespace + `#`) before
    // matching: bkit-shipped commented stubs and commented-out consumer examples never fire.
    // Not `stripBkitBlock`: its strict line-anchored marker detection misses indented YAML
    // markers.
    const activeContent = content
        .split("\n")
        .filter((line) => !/^\s*#/.test(line))
        .join("\n");
    // Match a literal `playwright test` invocation followed (anywhere) by `--reporter=line`.
    // Both substrings must appear in active (non-comment) content. Heuristic but conservative.
    if (!/playwright\s+test/.test(activeContent))
        return null;
    if (!/--reporter[= ]line\b/.test(activeContent))
        return null;
    return {
        id: "playwright-reporter-line-override-hostile",
        severity: "advisory",
        detect: ".github/workflows/ci.yml has a `playwright test` invocation that passes `--reporter=line`. Under `[verbose ci]` with `--trace=on`, trace artifacts are written but no reporter surfaces them — pure cost.",
        action: 'Drop the `--reporter=line` flag so `playwright.config.ts`\'s configured reporter chain runs (typically `[list, html, github, json]`). Verbose-aware pattern: have `test:e2e` read `VERBOSE_CI` and append `--trace=on` to its own `playwright test` call (e.g. `TRACE=; [ "$VERBOSE_CI" = "1" ] && TRACE=--trace=on; playwright test $TRACE`), then run it plainly as `pnpm test:e2e` — do NOT pass `--trace=on` through a turbo / pnpm `-- --trace=on` passthrough, which appends to the script string and breaks any test:e2e ending in a bash construct (fi / done / esac). Never pass `--reporter`. Note that `--video` and `--screenshot` are NOT Playwright CLI flags (they\'re `use:` keys in playwright.config.ts); the trace.zip already captures snapshots / network / console / source. Default-mode output stays clean via the config\'s `list` reporter.',
    };
}
/**
 * Line-anchored consumer opt-out marker for the context-fetch advisories. A repo
 * that legitimately enables no runtime-log source places this below
 * `<!-- bkit:end -->` to dismiss both `context-fetch-missing` and
 * `context-fetch-source-not-enabled`.
 */
const CONTEXT_FETCH_NONE_RE = /^<!-- context-fetch:none(?: [^>]*)? -->$/m;
/**
 * Every `context=` a `context-fetch` block may declare. `runtime` is the default when
 * the attribute is absent. Mirrors the `case "$CONTEXT"` arms in `.bkit/workflows/bkit-debug.md`
 * Step 4; `bkit-context-fetchs.test.ts` fails when the two drift.
 */
export const CONTEXT_FETCH_CONTEXTS = ["runtime", "ci", "diff", "e2e", "web"];
/**
 * Contexts whose absence means an entire class of failure evidence is never fetched,
 * each with the evidence it carries.
 *
 * A subset of {@link CONTEXT_FETCH_CONTEXTS}: `web` is valid-but-not-required (its
 * self-skip names the host's built-in web tools as the fallback). `runtime` is covered
 * by `context-fetch-missing` instead.
 */
const CONTEXT_FETCH_EVIDENCE_CONTEXTS = {
    ci: "CI job/step failures and logs",
    diff: "diff vs the last commit that passed CI",
    e2e: "e2e reports / traces / device evidence",
};
/**
 * Contexts named on a `<!-- context-fetch:none ... -->` marker, which dismisses the
 * context-coverage advisory for those contexts ONLY — a repo with no e2e lane says
 * so without also silencing the advisories that catch a genuinely unwired repo.
 * A bare marker names none and keeps its whole-file meaning.
 */
function contextFetchNoneContexts(consumer) {
    const m = /^<!-- context-fetch:none((?: [\w.-]+)*) -->$/m.exec(consumer);
    if (!m)
        return new Set();
    return new Set(m[1].split(/\s+/).filter((t) => CONTEXT_FETCH_CONTEXTS.includes(t)));
}
/**
 * True ONLY for the blanket opt-out: a `context-fetch:none` marker naming no known
 * context. A context-scoped marker (`context-fetch:none e2e`) dismisses that context's
 * coverage advisory and nothing else — it must never silence the advisories that
 * catch a repo with no blocks or an unenabled source.
 */
function contextFetchDismissesAll(consumer) {
    return CONTEXT_FETCH_NONE_RE.test(consumer) && contextFetchNoneContexts(consumer).size === 0;
}
/**
 * Parse a `<!-- context-fetch:start [name] [context=<context>] -->` line. Attribute order
 * is free and both parts are optional: a bare `context-fetch:start` is an unnamed
 * `runtime` block (the pre-context form). Returns `null` for non-matching lines.
 *
 * Kept in step with the awk parser in `.bkit/workflows/bkit-debug.md` Step 4, which
 * executes the blocks this function reports. That parser strips `[ \t]*` and splits on
 * `[ \t]+`, so this one accepts runs of spaces and tabs too.
 */
export function parseContextFetchStart(line) {
    const m = /^<!-- context-fetch:start((?:[ \t]+[\w.=-]+)*)[ \t]*-->$/.exec(line);
    if (!m)
        return null;
    let name = "";
    let context = "runtime";
    for (const token of m[1].split(/[ \t]+/).filter(Boolean)) {
        if (token.startsWith("context="))
            context = token.slice("context=".length);
        else
            name = token;
    }
    return { name, context };
}
/** Every `context-fetch:start` block declared in a section, in document order. */
function parseContextFetchStarts(section) {
    const out = [];
    for (const line of section.split("\n")) {
        const parsed = parseContextFetchStart(line);
        if (parsed)
            out.push(parsed);
    }
    return out;
}
/**
 * Map of context-fetch source name -> predicate proving THIS repo actually runs
 * that backend. Evidence-gates `context-fetch-source-not-enabled`
 * so a single-backend consumer (e.g. Vercel-only) is never nagged about a
 * backend it does not use (e.g. Supabase). A shipped template whose name has no
 * entry here is never flagged (cannot prove use => stay quiet).
 */
const CONTEXT_FETCH_BACKEND_EVIDENCE = {
    supabase: (cwd) => fs.existsSync(path.join(cwd, "supabase", "config.toml")) ||
        readDependencyNames(cwd).some((d) => d.startsWith("@supabase/")),
    vercel: (cwd) => fs.existsSync(path.join(cwd, "vercel.json")) ||
        fs.existsSync(path.join(cwd, ".vercel")) ||
        readDependencyNames(cwd).includes("vercel"),
};
/** Every dependency name across the four package.json dependency fields. */
function readDependencyNames(cwd) {
    let pkg;
    try {
        pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
    }
    catch {
        return [];
    }
    const names = [];
    for (const field of [
        "dependencies",
        "devDependencies",
        "optionalDependencies",
        "peerDependencies",
    ]) {
        const deps = pkg[field];
        if (deps && typeof deps === "object") {
            names.push(...Object.keys(deps));
        }
    }
    return names;
}
/**
 * Advisory: consumer's `.agents/context.md` has the bkit-managed block but no
 * `<!-- context-fetch:start <name> --> ... <!-- context-fetch:end -->` block AFTER
 * `<!-- bkit:end -->`.
 *
 * `/bkit-debug`'s runtime sub-fetch runs every `context-fetch` block occurring
 * after `<!-- bkit:end -->` (consumer section). With no consumer-section block, no
 * runtime-log artifact (`context-runtime-<name>-{ATTEMPT}.md`) is produced
 * on any debug run. Ready-made blocks ship in `.bkit/templates/context/`.
 *
 * Markers may be named (`context-fetch:start vercel`) or unnamed. Only
 * fires when the consumer has the bkit-managed block at all; consumers who fully
 * own `.agents/context.md` (no markers) are not nagged. Dismissable with a
 * `<!-- context-fetch:none ... -->` marker below `<!-- bkit:end -->`.
 */
export function detectContextFetchMissing(cwd) {
    const filePath = path.join(cwd, ".agents", "context.md");
    if (!fs.existsSync(filePath))
        return null;
    const content = fs.readFileSync(filePath, "utf-8");
    // Require the bkit-managed block (line-anchored `<!-- bkit:end -->`).
    const endIdx = content.search(/^<!-- bkit:end -->$/m);
    if (endIdx === -1)
        return null;
    const afterBkitEnd = content.slice(endIdx);
    // Consumer opt-out: dismiss when a `<!-- context-fetch:none ... -->` marker is
    // present below `<!-- bkit:end -->` (repo legitimately enables no source).
    if (contextFetchDismissesAll(afterBkitEnd))
        return null;
    // Consumer-section markers must be line-anchored to mirror the workflow's
    // `sed`/`awk` extraction (`.bkit/workflows/bkit-debug.md` Step 5). The start
    // marker carries an optional block name (`context-fetch:start vercel`).
    const hasStart = parseContextFetchStarts(afterBkitEnd).length > 0;
    const hasEnd = /^<!-- context-fetch:end -->$/m.test(afterBkitEnd);
    if (hasStart && hasEnd)
        return null;
    return {
        id: "context-fetch-missing",
        severity: "advisory",
        detect: "`.agents/context.md` has the bkit-managed block but no `<!-- context-fetch:start [name] --> ... <!-- context-fetch:end -->` block after `<!-- bkit:end -->`. `/bkit-debug` runs every block in that consumer section — with none, no runtime-log artifact is produced.",
        action: "Copy the blocks of a provider file in `.bkit/templates/context/` (e.g. `vercel.md`, `supabase.md`; index in `.bkit/templates.md` § Context-fetch blocks) and paste them after `<!-- bkit:end -->`, then set its env vars. REQUIRED: set the block's non-secret selector (e.g. `VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) by uncommenting the assignment line at the top of the copied block — committing it there is what makes the block run in headless cloud agents, which never read `.bkit/.env`. For cloud `/bkit-debug`, also set the secret tokens (`VERCEL_TOKEN` / `SUPABASE_ACCESS_TOKEN`) in your Claude/Cursor dashboard (or GitHub Actions secrets) and authenticate non-interactively (env tokens, never `vercel login`). Each block self-gates (missing CLI / token => a `[context-fetch:<name>] skipped — …` stderr breadcrumb, not an error), so enable only the sources you use; add your own block for any other log backend (`gcloud` / `aws` / `datadog`). Keep blocks read-only and idempotent — the agent customises severity / freshness / limit / target environment (e.g. Vercel preview vs production) at run-time.",
    };
}
/**
 * Advisory: the consumer section enables context-fetch blocks, but not for every
 * evidence context — so `/bkit-debug` fetches an entire class of failure evidence
 * for no run, ever.
 *
 * `/bkit-debug` Step 4 is fully block-driven: CI logs, the last-passing diff and
 * e2e artifacts each come from a `context=`-tagged block, exactly as runtime logs
 * do. bkit hardcodes no CI host, workflow filename, branch name or e2e framework.
 *
 * Distinct from `context-fetch-missing`, which owns the no-blocks-at-all case; this
 * one only fires once at least one block exists. Dismissable per context —
 * `<!-- context-fetch:none e2e -->` below `<!-- bkit:end -->`. A bare marker dismisses all.
 */
export function detectContextFetchContextMissing(cwd) {
    const filePath = path.join(cwd, ".agents", "context.md");
    if (!fs.existsSync(filePath))
        return null;
    const content = fs.readFileSync(filePath, "utf-8");
    const endIdx = content.search(/^<!-- bkit:end -->$/m);
    if (endIdx === -1)
        return null;
    const consumer = content.slice(endIdx);
    const enabled = parseContextFetchStarts(consumer);
    // No blocks at all => `context-fetch-missing` owns it (no double-fire).
    if (enabled.length === 0)
        return null;
    const dismissed = contextFetchNoneContexts(consumer);
    // A bare `context-fetch:none` names no context and dismisses every advisory.
    if (contextFetchDismissesAll(consumer))
        return null;
    const contexts = new Set(enabled.map((b) => b.context));
    const missing = Object.keys(CONTEXT_FETCH_EVIDENCE_CONTEXTS).filter((r) => !contexts.has(r) && !dismissed.has(r));
    if (missing.length === 0)
        return null;
    const list = missing
        .map((r) => `\`context=${r}\` (${CONTEXT_FETCH_EVIDENCE_CONTEXTS[r]})`)
        .join(", ");
    const plural = missing.length > 1;
    return {
        id: "context-fetch-context-missing",
        severity: "advisory",
        detect: `\`.agents/context.md\` enables context-fetch blocks below \`<!-- bkit:end -->\` but none for ${list}. \`/bkit-debug\` fetches ALL failure evidence from these blocks — it hardcodes no CI host, workflow filename, branch name or e2e framework — so ${plural ? "those classes" : "that class"} of evidence ${plural ? "are" : "is"} never fetched on any debug run. Every attempt reports \`context=<context> NOT CONFIGURED\`, and diagnosis must treat the gap as unchecked rather than clean.`,
        action: `Copy the matching \`<!-- context-fetch:start <name> context=<context> --> ... <!-- context-fetch:end -->\` block(s) from \`.bkit/templates/context/\` (\`github-ci.md\`, \`github-diff.md\`, \`playwright.md\`, …; index in \`.bkit/templates.md\` § Context-fetch blocks) to below \`<!-- bkit:end -->\`, one per missing context: ${list}. The templates assume GitHub Actions and Playwright because that is the common case — they are examples, NOT the contract. Edit them to your setup: \`BASELINE_BRANCH\` / \`BASELINE_WORKFLOW\` must name YOUR trunk branch and workflow file, and \`E2E_ARTIFACT\` / \`E2E_JOB_RE\` must name YOUR upload-artifact and match ONLY the lane that block covers. On another CI host (GitLab, Bitbucket, Buildkite) replace the \`gh\` calls with that host's API — the context contract is just "write the evidence to stdout". A test lane whose evidence never reaches your CI host (a native lane whose reports stay on Expo EAS, Bitrise or Firebase Test Lab) needs its OWN \`context=e2e\` block fetching from that service (Expo EAS: \`maestro-ios.md\`, \`expo-workflows.md\`): widening another block's job regex to cover it makes that block download the WRONG lane's report and file it under the failing lane's name, which is worse than fetching nothing. Blocks are self-contained — each discovers the run it needs itself, so there is no ordering between them and none share variables. Give each block a name unique within its context; a repeated \`context\` + name pair writes both blocks to one artifact path. No such lane in this repo → name the context on the opt-out marker below \`<!-- bkit:end -->\`, space-separated for several: \`<!-- context-fetch:none ${missing.join(" ")} -->\`. That dismisses those contexts ONLY; a bare \`<!-- context-fetch:none intentional -->\` dismisses every context-fetch advisory.`,
    };
}
/**
 * Named fetch blocks bkit ships as templates, keyed by block name → the template file
 * (`.bkit/templates/context/<file>`) that holds it. Read from the package, so the set
 * follows the shipped templates without a hand-kept list.
 */
function shippedContextFetchTemplates() {
    const dir = path.join(getTemplatesRoot(), "context");
    const out = new Map();
    if (!fs.existsSync(dir))
        return out;
    for (const file of fs.readdirSync(dir).sort()) {
        if (!file.endsWith(".md"))
            continue;
        for (const { name } of parseContextFetchStarts(fs.readFileSync(path.join(dir, file), "utf-8"))) {
            if (name && !out.has(name))
                out.set(name, file);
        }
    }
    return out;
}
/**
 * Advisory: bkit ships a NAMED context-fetch template (e.g. `supabase` in
 * `.bkit/templates/context/supabase.md`), this repo demonstrably runs that backend,
 * yet the consumer section after `<!-- bkit:end -->` enables no block for it — so
 * `/bkit-debug` fetches no runtime logs for a source the repo uses.
 *
 * Distinct from `context-fetch-missing` (consumer section has NO block at all): this
 * targets PARTIAL enablement — a consumer section holding a `vercel` block while the
 * repo also runs Supabase. The two are mutually exclusive: this one only runs once the
 * consumer section already has at least one block.
 *
 * Evidence-gated: a source is flagged only when `CONTEXT_FETCH_BACKEND_EVIDENCE[name]`
 * proves the repo runs it. A source counts as enabled when its name appears anywhere
 * in the consumer section — a named marker (`context-fetch:start supabase`) OR an
 * unnamed block body (`vercel logs`, `api.supabase.com`). Dismissable via
 * `<!-- context-fetch:none ... -->` below
 * `<!-- bkit:end -->`.
 */
export function detectContextFetchSourceNotEnabled(cwd) {
    const filePath = path.join(cwd, ".agents", "context.md");
    if (!fs.existsSync(filePath))
        return null;
    const content = fs.readFileSync(filePath, "utf-8");
    const endIdx = content.search(/^<!-- bkit:end -->$/m);
    if (endIdx === -1)
        return null;
    const consumer = content.slice(endIdx);
    // Consumer opt-out marker dismisses the advisory.
    if (contextFetchDismissesAll(consumer))
        return null;
    // Only PARTIAL enablement: when the consumer section has no block at all,
    // `context-fetch-missing` owns that case (avoid double-firing).
    const hasStart = parseContextFetchStarts(consumer).length > 0;
    const hasEnd = /^<!-- context-fetch:end -->$/m.test(consumer);
    if (!(hasStart && hasEnd))
        return null;
    const shipped = shippedContextFetchTemplates();
    const consumerLower = consumer.toLowerCase();
    const missing = [...shipped.keys()].filter((name) => {
        const evidence = CONTEXT_FETCH_BACKEND_EVIDENCE[name];
        if (!evidence || !evidence(cwd))
            return false; // no proof the repo runs it
        return !consumerLower.includes(name.toLowerCase()); // name absent below bkit:end
    });
    if (missing.length === 0)
        return null;
    const names = missing.join(", ");
    const slash = missing.join("/");
    const files = missing.map((n) => `\`.bkit/templates/context/${shipped.get(n)}\``).join(", ");
    const plural = missing.length > 1;
    return {
        id: "context-fetch-source-not-enabled",
        severity: "advisory",
        detect: `bkit ships context-fetch template${plural ? "s" : ""} for ${names} and this repo uses ${plural ? "those backends" : "that backend"}, but \`.agents/context.md\` enables no ${slash} block after \`<!-- bkit:end -->\`. \`/bkit-debug\` will fetch no ${slash} runtime logs.`,
        action: `Copy the blocks of ${files} to after \`<!-- bkit:end -->\` in \`.agents/context.md\`, then set each block's env vars — including committing each block's non-secret selector (e.g. \`VERCEL_SCOPE\` / \`SUPABASE_PROJECT_ID\`) by uncommenting the assignment line at the top of the block, so it runs in headless cloud agents too (they never read \`.bkit/.env\`). Each block self-gates (missing CLI / token => a \`[context-fetch:<name>] skipped — …\` stderr breadcrumb, not an error). If you do not use ${slash} for runtime logs, add \`<!-- context-fetch:none intentional -->\` below \`<!-- bkit:end -->\` to dismiss. Do not edit above \`<!-- bkit:end -->\` (install rewrites it).`,
    };
}
/**
 * Non-stack base tools assumed present in every cloud/CI environment: POSIX
 * utilities plus the binaries bkit's own cloud setup installs (vale, gh, jq,
 * pnpm/corepack, node, git, python3). A context-fetch block that self-guards on one
 * of these needs NO `context-fetch:provision` block — only a STACK CLI (vercel,
 * supabase, gcloud, aws, wrangler, …) does; bkit installs no stack CLIs itself. `jq`
 * is here: the cloud setup script provisions it as a base tool, not per-block.
 */
const CONTEXT_FETCH_BASE_TOOLS = new Set([
    "curl",
    "jq",
    "date",
    "sed",
    "awk",
    "grep",
    "egrep",
    "fgrep",
    "bash",
    "sh",
    "cat",
    "printf",
    "echo",
    "tr",
    "cut",
    "head",
    "tail",
    "sort",
    "uniq",
    "wc",
    "xargs",
    "tee",
    "node",
    "npm",
    "npx",
    "pnpm",
    "corepack",
    "git",
    "python3",
    "gh",
    "vale",
]);
/**
 * Advisory: an enabled `<!-- context-fetch:start <name> -->` block self-guards on a
 * stack CLI (`command -v <cli>`) but ships no matching `<!-- context-fetch:provision
 * <name> -->` block below `<!-- bkit:end -->`. bkit installs no stack CLIs itself,
 * so in cloud that CLI is absent, the block's own guard trips, and it self-skips
 * with a silent `exit 0` — `/bkit-debug` fetches NO runtime logs for that source.
 * Both the `.claude/cloud.md` web setup-script snapshot and
 * `.claude/hooks/cloud-bootstrap.sh` provision from the SAME `context-fetch:provision`
 * recipes.
 *
 * Keyed on the block's OWN `command -v <cli>` self-guard, so a curl/jq/API block (no
 * stack-CLI guard) never fires; base tools
 * (`CONTEXT_FETCH_BASE_TOOLS`) are ignored. Only NAMED start blocks are checked (a
 * provision block is matched by name). Dismissable via `<!-- context-fetch:none ...
 * -->` below `<!-- bkit:end -->`.
 */
export function detectContextFetchProvisionMissing(cwd) {
    const filePath = path.join(cwd, ".agents", "context.md");
    if (!fs.existsSync(filePath))
        return null;
    const content = fs.readFileSync(filePath, "utf-8");
    const endIdx = content.search(/^<!-- bkit:end -->$/m);
    if (endIdx === -1)
        return null;
    const consumer = content.slice(endIdx);
    if (contextFetchDismissesAll(consumer))
        return null;
    const blocks = [];
    let cur = null;
    let inFence = false;
    for (const line of consumer.split("\n")) {
        const startM = parseContextFetchStart(line);
        const provM = /^<!-- context-fetch:provision ([\w.-]+) -->$/.exec(line);
        if (startM) {
            // Unnamed blocks cannot be matched to a provision sibling (which is keyed
            // by name), so they are parked under "" and filtered out downstream.
            cur = { kind: "start", name: startM.name, body: [] };
            inFence = false;
            blocks.push(cur);
            continue;
        }
        if (provM) {
            cur = { kind: "provision", name: provM[1], body: [] };
            inFence = false;
            blocks.push(cur);
            continue;
        }
        if (/^<!-- context-fetch:(end|none|start|provision)/.test(line)) {
            cur = null;
            inFence = false;
            continue;
        }
        if (cur && /^```/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (cur && inFence)
            cur.body.push(line);
    }
    const provisionNames = new Set(blocks.filter((b) => b.kind === "provision").map((b) => b.name));
    const provisionBody = blocks
        .filter((b) => b.kind === "provision")
        .map((b) => b.body.join("\n"))
        .join("\n");
    // For each enabled named start block, collect the stack CLIs it self-guards on
    // that have no provisioner (matched by same-name block OR a provision body that
    // installs that CLI). First-seen order; one entry per block name.
    const seen = new Set();
    const items = [];
    let firstName = "";
    let firstCli = "";
    for (const b of blocks) {
        // Unnamed blocks are skipped: a provision sibling is matched by name.
        if (b.kind !== "start" || !b.name || seen.has(b.name))
            continue;
        const body = b.body.join("\n");
        for (const m of body.matchAll(/command -v ([\w.-]+)/g)) {
            const cli = m[1];
            if (CONTEXT_FETCH_BASE_TOOLS.has(cli))
                continue;
            if (provisionNames.has(b.name) || provisionBody.includes(cli))
                continue;
            seen.add(b.name);
            items.push(`${b.name} (\`${cli}\`)`);
            if (!firstName) {
                firstName = b.name;
                firstCli = cli;
            }
            break;
        }
    }
    if (items.length === 0)
        return null;
    const list = items.join(", ");
    const plural = items.length > 1;
    return {
        id: "context-fetch-provision-missing",
        severity: "advisory",
        detect: `\`.agents/context.md\` enable${plural ? "" : "s"} context-fetch block${plural ? "s" : ""} that self-guard${plural ? "" : "s"} on a stack CLI but ship${plural ? "" : "s"} no matching \`<!-- context-fetch:provision <name> -->\` block below \`<!-- bkit:end -->\`: ${list}. bkit installs no stack CLIs itself, so in cloud the CLI is absent, the block's own \`command -v\` guard trips, and it self-skips (silent \`exit 0\`) — \`/bkit-debug\` fetches no runtime logs for ${plural ? "those sources" : "that source"} (reads as "clean", not "not wired up").`,
        action: `For each flagged block, add a sibling \`<!-- context-fetch:provision <name> -->\` block below \`<!-- bkit:end -->\` — SAME name as the fetch block — whose bash body installs the CLI, self-guarded and install-only: \`command -v ${firstCli} >/dev/null 2>&1 || <install ${firstCli}>\` (e.g. \`pnpm add -g ${firstCli}\` for an npm-published CLI). If \`.bkit/templates/context/\` ships a ready-made \`context-fetch:provision ${firstName}\` recipe, copy that. Then re-run \`bkit install\` so the recipe bakes into \`.claude/cloud.md\`'s setup script; \`.claude/hooks/cloud-bootstrap.sh\` runs the same recipe on gh-runner / resumed sessions. A block that fetches via an MCP tool or only universal tools (curl/jq/date) needs no provision.`,
    };
}
/**
 * Advisory: detect __bkit__ envelope at top-level of a JSON file.
 * Fires when consumer has not yet run `bkit upgrade` to v2.0.0.
 * Action: run `pnpm bkit upgrade`.
 */
export function detectLegacyBkitEnvelope(cwd, relPath) {
    const absPath = path.join(cwd, relPath);
    if (!fs.existsSync(absPath))
        return null;
    let doc;
    try {
        doc = JSON.parse(fs.readFileSync(absPath, "utf-8"));
    }
    catch {
        return null; // malformed JSON — separate advisory
    }
    if (!("__bkit__" in doc))
        return null;
    return {
        id: "legacy-bkit-envelope-detected",
        severity: "advisory",
        detect: `${relPath} contains a __bkit__ envelope from bkit <= v1.1.1.`,
        action: "Run `pnpm bkit upgrade` to strip the __bkit__ envelope and migrate to v2.0.0 deep-containment schema. The upgrade is idempotent and preserves all consumer-owned keys.",
    };
}
/**
 * Advisory: detect when a JSON file is missing content the template owns.
 * Runs deepContains(template, consumerFile) — fires when ok=false.
 * Severity: advisory.
 */
export function detectTier2JsonDrift(cwd, relPath, pkgRoot) {
    const absPath = path.join(cwd, relPath);
    const templatePath = path.join(getTemplatesRoot(), relPath);
    if (!fs.existsSync(absPath) || !fs.existsSync(templatePath))
        return null;
    let consumerDoc;
    let templateDoc;
    try {
        consumerDoc = JSON.parse(fs.readFileSync(absPath, "utf-8"));
        templateDoc = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
    }
    catch {
        return null; // malformed JSON — handled elsewhere
    }
    const result = deepContains(templateDoc, consumerDoc);
    if (result.ok)
        return null;
    const details = [
        ...result.missing.map((p) => `missing: ${p}`),
        ...result.mismatched.map((p) => `mismatched: ${p}`),
    ]
        .slice(0, 5)
        .join("; ");
    return {
        id: `tier2-json-drift`,
        severity: "advisory",
        detect: `${relPath} is missing bkit-owned content: ${details}.`,
        action: "Run `pnpm bkit install` to restore the bkit-owned scope. Consumer-only keys outside the template tree will be preserved.",
    };
}
/**
 * Advisory: detect when a markered-text file's bkit-managed block differs from the
 * template's marker block (Phase 2 — tier2-text-drift advisory, BAR-167).
 *
 * Fires when:
 *   - Consumer file exists AND has bkit markers
 *   - Template file exists AND has a bkit marker block
 *   - The extracted consumer block != extracted template block (byte-equal check)
 *
 * Does NOT fire when markers are absent from consumer (the `markers-missing` case).
 *
 * Follows `[Context] Message` advisory format.
 */
export function detectTier2TextDrift(cwd, relPath, pkgRoot) {
    void pkgRoot; // signature kept for call-site compatibility; templates resolve via getTemplatesRoot
    const absPath = path.join(cwd, relPath);
    const templatePath = path.join(getTemplatesRoot(), relPath);
    if (!fs.existsSync(absPath) || !fs.existsSync(templatePath))
        return null;
    const consumerContent = fs.readFileSync(absPath, "utf-8");
    const templateContent = fs.readFileSync(templatePath, "utf-8");
    // Every named (and the default unnamed) bkit-managed block in the TEMPLATE is the
    // authoritative scope. Compare each against the consumer's same-named block:
    //   - consumer lacks it  → "missing"  (unless the template marks the block `optional`)
    //   - consumer has it but content differs → "drifted"
    // Content OUTSIDE bkit:start/bkit:end is consumer-owned and never compared, so a
    // freely-edited file only trips on its bkit-owned regions — no false positives.
    const templateBlocks = extractNamedBlocks(templateContent);
    if (templateBlocks.size === 0)
        return null; // template owns no marked region in this file
    const consumerBlocks = extractNamedBlocks(consumerContent);
    // Consumer carries no bkit markers at all → fully consumer-owned (markers-missing case),
    // or has only the bare wrapper of a different file shape. Never flag a file the consumer
    // wrote without bkit markers.
    if (consumerBlocks.size === 0)
        return null;
    // Significant lines = load-bearing block content: non-blank, non-comment, trimmed (indentation
    // is not semantic). Comment lines never trip drift.
    const significantLines = (body) => body
        .split("\n")
        .map((l) => l.trim())
        .filter((t) => t !== "" && !t.startsWith("#") && !t.startsWith("//") && !t.startsWith("<!--"));
    // A required line is real bkit content the consumer must retain. A bare YAML mapping key (`env:`)
    // is structural scaffolding — a consumer with the child assignments has the structure wherever
    // it placed the marker. A `{{TOKEN}}` line renders per-consumer, so it can never be matched
    // literally. Neither counts as content for drift. (`${{ … }}` is a GitHub Actions expression,
    // NOT a bkit token — the negative lookbehind keeps those enforced.)
    const isStructural = (line) => /^[A-Za-z0-9_.-]+:$/.test(line);
    const hasBkitToken = (line) => /(?<!\$)\{\{[^}]+\}\}/.test(line);
    const requiredLines = (body) => significantLines(body).filter((l) => !isStructural(l) && !hasBkitToken(l));
    const missing = [];
    const drifted = [];
    for (const [name, tBlock] of templateBlocks) {
        const label = name || "(default block)";
        // An `optional` block is fully consumer-owned: bkit seeds it but never flags missing OR drift.
        // A consumer that dropped the block is opted out, not broken.
        if (tBlock.optional)
            continue;
        const cBlock = consumerBlocks.get(name);
        if (!cBlock) {
            missing.push(label);
            continue;
        }
        // Subset / presence: the block drifts only if the consumer is MISSING a required bkit line.
        // Extras, reordering, re-indentation, comments, and marker placement (`env:` inside vs outside
        // the marker) are all fine — a consumer that has all the bkit content "and more" stays quiet;
        // a genuinely dropped or edited required line still gates.
        const consumerLines = new Set(significantLines(cBlock.body));
        if (requiredLines(tBlock.body).some((l) => !consumerLines.has(l)))
            drifted.push(label);
    }
    if (missing.length === 0 && drifted.length === 0)
        return null;
    const parts = [...missing.map((n) => `missing: ${n}`), ...drifted.map((n) => `drifted: ${n}`)];
    const details = parts.slice(0, 6).join("; ");
    const more = parts.length > 6 ? ` (+${parts.length - 6} more)` : "";
    return {
        id: "tier2-text-drift",
        severity: "advisory",
        detect: `${relPath} has bkit-managed block(s) that differ from the shipped template — ${details}${more}.`,
        action: `Re-sync the bkit-managed block(s) in ${relPath} from .bkit/templates/${relPath} ` +
            "(run `pnpm bkit install`, or copy the block between its `bkit:start`/`bkit:end` markers). " +
            "Content outside the markers is preserved. A block marked `bkit:start <name> optional` may be " +
            "deleted (markers included) without this warning.",
    };
}
/**
 * Consumer files whose bkit-managed blocks `detectTier2TextDrift` compares (partial
 * ownership: bkit's block, the consumer's rest). Templates are the consumer's files and
 * are never compared. Exported so tests can reference it without duplication.
 */
export const MARKERED_TEXT_DRIFT_PATHS = [
    "AGENTS.md",
    "CLAUDE.md",
    ".gitignore",
];
/**
 * Blocker: consumer's .bkit-version pinnedVersion < 0.8.0 AND no __bkit__ envelope.
 * This means the consumer is on a pre-envelope Tier-1 install and must route
 * through bkit v1.x before upgrading directly to v2.0.0.
 */
export function detectPreEnvelopeBkitVersion(cwd) {
    const versionFilePath = path.join(cwd, ".bkit", "version");
    const bkitVer = readBkitVersion(versionFilePath);
    if (!bkitVer?.pinnedVersion)
        return null;
    const pinnedVersion = bkitVer.pinnedVersion;
    // semverLt: pinnedVersion < 0.8.0
    if (!semverLt(pinnedVersion, "0.8.0"))
        return null;
    // Check that neither JSON file has __bkit__ (confirms pre-envelope install)
    const jsonFiles = [".claude/settings.json", ".cursor/hooks.json"];
    const hasEnvelope = jsonFiles.some((relPath) => {
        const absPath = path.join(cwd, relPath);
        if (!fs.existsSync(absPath))
            return false;
        try {
            const doc = JSON.parse(fs.readFileSync(absPath, "utf-8"));
            return "__bkit__" in doc;
        }
        catch {
            return false;
        }
    });
    if (hasEnvelope)
        return null; // consumer already has envelope — not a pre-envelope install
    return {
        id: "pre-envelope-bkit-version-detected",
        severity: "blocker",
        detect: `On-disk pinnedVersion (${pinnedVersion}) is < 0.8.0 and no __bkit__ envelope found. Direct upgrade to v2.0.0 is not supported from pre-v0.8.0.`,
        action: "Route through bkit v1.x first: bump `@cbartens/bkit` to `^1.1.1`, run `pnpm install && pnpm bkit upgrade`, then bump to `^2.0.0` and run again.",
    };
}
/** Returns true if semver versionA < versionB (basic semver, no pre-release). */
function semverLt(a, b) {
    const pa = a.replace(/^v/, "").split(".").map(Number);
    const pb = b.replace(/^v/, "").split(".").map(Number);
    for (let i = 0; i < 3; i++) {
        const av = pa[i] ?? 0;
        const bv = pb[i] ?? 0;
        if (av < bv)
            return true;
        if (av > bv)
            return false;
    }
    return false;
}
// ---------------------------------------------------------------------------
// Internal semver comparison helper
// ---------------------------------------------------------------------------
/** Returns true if versionA > versionB (basic semver, no pre-release). */
function semverGt(a, b) {
    const pa = a.replace(/^v/, "").split(".").map(Number);
    const pb = b.replace(/^v/, "").split(".").map(Number);
    for (let i = 0; i < 3; i++) {
        const av = pa[i] ?? 0;
        const bv = pb[i] ?? 0;
        if (av > bv)
            return true;
        if (av < bv)
            return false;
    }
    return false;
}
// ---------------------------------------------------------------------------
// Advisory: missing MCP server entries in .mcp.json / .cursor/mcp.json
// ---------------------------------------------------------------------------
/**
 * The set of MCP server keys that bkit considers required in any mcpServers object.
 * Exported so tests can reference it without duplication.
 *
 * For tracker-aware checks use `requiredMcpServersForTracker(tracker)` instead.
 */
export const REQUIRED_MCP_SERVERS = ["linear", "github"];
/**
 * Return the MCP server keys required for a given issue tracker.
 *
 * - `github`  → only `github` MCP server required (Linear gate is a no-op on GitHub tracker).
 * - `linear`  → both `linear` and `github` required (Linear tracker still dispatches via GitHub PR).
 * - `none`    → `github` only (tracker calls are no-ops; GitHub surface still needed for PR ops).
 */
export function requiredMcpServersForTracker(tracker) {
    if (tracker === "github")
        return ["github"];
    if (tracker === "linear")
        return ["linear", "github"];
    return ["github"]; // none — only GitHub for PR surface
}
/**
 * Advisory: one finding per missing required MCP server key in a given mcp.json file.
 *
 * Semantics:
 *   - File absent      → return [] (the next install writes it)
 *   - File malformed   → return [] (parse-failure is a different advisory class)
 *   - File present, mcpServers missing a required key → one advisory per missing key
 *   - File present, all required keys present → return []
 *
 * Pass `issueTracker` to narrow which MCP servers are required. Defaults to checking
 * `REQUIRED_MCP_SERVERS` (all servers) for backward compatibility.
 *
 * Follows `[context] Message` advisory format.
 */
export function detectMissingMcpServers(cwd, relPath, issueTracker) {
    const absPath = path.join(cwd, relPath);
    if (!fs.existsSync(absPath))
        return [];
    let doc;
    try {
        doc = JSON.parse(fs.readFileSync(absPath, "utf-8"));
    }
    catch {
        return []; // malformed JSON — skip silently
    }
    const mcpServers = doc.mcpServers !== null && typeof doc.mcpServers === "object" && !Array.isArray(doc.mcpServers)
        ? doc.mcpServers
        : null;
    const requiredServers = issueTracker !== undefined ? requiredMcpServersForTracker(issueTracker) : REQUIRED_MCP_SERVERS;
    const findings = [];
    for (const key of requiredServers) {
        if (mcpServers && Object.prototype.hasOwnProperty.call(mcpServers, key))
            continue;
        const urlHint = key === "linear"
            ? `"url": "https://mcp.linear.app/mcp"`
            : key === "github"
                ? `"url": "https://api.githubcopilot.com/mcp/"`
                : `"url": "<server-url>"`;
        findings.push({
            id: `mcp-missing-server-${key}-${relPath.replace(/[^a-z0-9]/gi, "-")}`,
            severity: "advisory",
            detect: `${relPath} is missing the ${key} MCP server in mcpServers.`,
            action: `[mcp] ${relPath} is missing the ${key} MCP server. Add it to mcpServers: {"${key}": {${urlHint}}}`,
        });
    }
    return findings;
}
/**
 * Advisory: one finding per bkit-managed MCP server that is present in the file
 * but NOT required by the resolved tracker (the symmetric counterpart to
 * `detectMissingMcpServers`). Catches the stale-leftover case — e.g. a repo
 * switched to `--tracker=github` but still carries the `linear` entry.
 *
 * Only flags servers bkit itself manages (`REQUIRED_MCP_SERVERS`). Consumer-added
 * MCP servers (custom tooling, other providers) are never flagged for removal.
 *
 * Semantics:
 *   - File absent / malformed / no mcpServers → return []
 *   - `issueTracker` undefined → return [] (cannot know what's allowed → no false positives)
 *   - bkit-managed server present but not in `requiredMcpServersForTracker(tracker)` → one advisory
 *
 * Follows `[context] Message` advisory format.
 */
export function detectExtraMcpServers(cwd, relPath, issueTracker) {
    if (issueTracker === undefined)
        return [];
    const absPath = path.join(cwd, relPath);
    if (!fs.existsSync(absPath))
        return [];
    let doc;
    try {
        doc = JSON.parse(fs.readFileSync(absPath, "utf-8"));
    }
    catch {
        return []; // malformed JSON — skip silently
    }
    const mcpServers = doc.mcpServers !== null && typeof doc.mcpServers === "object" && !Array.isArray(doc.mcpServers)
        ? doc.mcpServers
        : null;
    if (!mcpServers)
        return [];
    const allowed = requiredMcpServersForTracker(issueTracker);
    const findings = [];
    // Only consider servers bkit manages — never flag consumer-added MCP servers.
    for (const key of REQUIRED_MCP_SERVERS) {
        if (allowed.includes(key))
            continue;
        if (!Object.prototype.hasOwnProperty.call(mcpServers, key))
            continue;
        findings.push({
            id: `mcp-extra-server-${key}-${relPath.replace(/[^a-z0-9]/gi, "-")}`,
            severity: "advisory",
            detect: `${relPath} has the ${key} MCP server but the ${issueTracker} tracker does not use it.`,
            action: `[mcp] ${relPath} carries the ${key} MCP server, which is not used by the ${issueTracker} tracker. Remove the "${key}" entry from mcpServers.`,
        });
    }
    return findings;
}
// ---------------------------------------------------------------------------
// [mcp-env] advisories — direnv + .bkit/.env setup (BAR-260)
// ---------------------------------------------------------------------------
/**
 * Advisory: .bkit/.env.example exists but .bkit/.env does not.
 * Consumer ran `bkit install` (which seeds .env.example) but has not yet
 * copied it to .bkit/.env and filled in their tokens.
 */
// `tracker` controls whether `BKIT_LINEAR_API_KEY` appears in the token prose (Linear
// tracker only). Defaults to `linear` (the superset: every token); the real Phase-3
// caller passes the consumer's resolved `bkit.issueTracker`.
export function detectMissingDotenv(cwd, tracker = "linear") {
    const examplePath = path.join(cwd, ".bkit", ".env.example");
    const envPath = path.join(cwd, ".bkit", ".env");
    if (!fs.existsSync(examplePath))
        return null;
    if (fs.existsSync(envPath))
        return null;
    const tokens = tracker === "linear"
        ? "BKIT_GH_TOKEN, BKIT_GH_TOKEN_INSTALL, BKIT_LINEAR_API_KEY"
        : "BKIT_GH_TOKEN, BKIT_GH_TOKEN_INSTALL";
    return {
        id: "mcp-env-missing-dotenv",
        severity: "advisory",
        detect: `.bkit/.env.example exists but .bkit/.env does not. MCP servers and agent tooling will not have access to ${tokens}.`,
        action: `[mcp-env] Copy .bkit/.env.example to .bkit/.env and fill in your tokens (${tokens}). Then run \`direnv allow\` to auto-export them into your shell. .bkit/.env is gitignored and safe to commit-skip.`,
    };
}
/**
 * Advisory: .bkit/.env exists but one or more required keys are blank or absent.
 * Returns one finding per missing/blank key.
 */
export function detectBlankDotenvKeys(cwd, tracker = "linear") {
    const envPath = path.join(cwd, ".bkit", ".env");
    if (!fs.existsSync(envPath))
        return [];
    const content = fs.readFileSync(envPath, "utf-8");
    const lines = content.split("\n");
    // Build a map of key → value from the .env file (ignore comments and blank lines)
    const kvMap = new Map();
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#"))
            continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1)
            continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        kvMap.set(key, value);
    }
    const REQUIRED_KEYS = [
        {
            key: "BKIT_GH_TOKEN",
            description: "fine-grained PAT for the GitHub MCP server (Contents, Pull requests, Issues, Actions, Workflows, Metadata — read/write)",
        },
        {
            key: "BKIT_GH_TOKEN_INSTALL",
            description: "classic PAT with read:packages scope for authenticating to the GitHub Packages npm registry (@cbartens/* packages)",
        },
        // BKIT_LINEAR_API_KEY is required only under the Linear tracker.
        ...(tracker === "linear"
            ? [
                {
                    key: "BKIT_LINEAR_API_KEY",
                    description: "Linear personal API key for the Linear MCP server and the Linear preflight hook (generate at https://linear.app/settings/api)",
                },
            ]
            : []),
    ];
    const findings = [];
    for (const { key, description } of REQUIRED_KEYS) {
        const value = kvMap.get(key);
        if (value !== undefined && value !== "")
            continue;
        const reason = value === undefined
            ? `${key} is absent from .bkit/.env`
            : `${key} is set but has an empty value in .bkit/.env`;
        findings.push({
            id: `mcp-env-blank-key-${key.toLowerCase()}`,
            severity: "advisory",
            detect: `${reason}. The associated service will not authenticate.`,
            action: `[mcp-env] Set ${key} in .bkit/.env — ${description}. After editing, run \`direnv allow\` (or re-enter the directory) to reload the env.`,
        });
    }
    return findings;
}
/**
 * Advisory: `bkit` is not on PATH.
 * bkit is a devDependency — without a shell alias, every invocation requires
 * `pnpm bkit <verb>` or `pnpm exec bkit <verb>`. Suggest the one-line alias.
 * Short-circuits in CI / cloud environments where the alias is irrelevant.
 */
export function detectBkitNotOnPath() {
    if (isCloudOrCi())
        return null;
    const result = spawnSync("which", ["bkit"], { encoding: "utf-8" });
    if (result.status === 0 && result.stdout.trim())
        return null;
    return {
        id: "bkit-not-on-path",
        severity: "advisory",
        detect: "`bkit` is not on PATH — commands must be run as `pnpm bkit <verb>` or `pnpm exec bkit <verb>`.",
        action: "[bkit] Add a shell alias so you can type `bkit <verb>` directly. Add to ~/.zshrc (or ~/.bashrc), then reload:\n\n" +
            "    alias bkit='pnpm bkit'\n" +
            "    source ~/.zshrc\n\n" +
            "For `bkit cursor` / `bkit opencode` (GUI app launchers), run from the repo root in\n" +
            "an external terminal (Terminal.app / iTerm2) — not from inside the running app.",
    };
}
/**
 * Returns true when running in a cloud/CI environment where direnv is not
 * applicable (agent reads env vars from the platform dashboard instead).
 */
function isCloudOrCi() {
    return !!(process.env.CI || process.env.CLAUDE_CODE_REMOTE || process.env.CURSOR_REMOTE_AGENT);
}
/**
 * Advisory: direnv is not installed.
 * Short-circuits in CI / cloud environments where direnv is irrelevant.
 */
export function detectDirenvMissing(cwd, tracker = "linear") {
    if (isCloudOrCi())
        return null;
    // Only meaningful when .envrc exists (the consumer's copy of bkit's template)
    const envrcPath = path.join(cwd, ".envrc");
    if (!fs.existsSync(envrcPath))
        return null;
    const result = spawnSync("which", ["direnv"], { encoding: "utf-8" });
    if (result.status === 0 && result.stdout.trim())
        return null;
    // BKIT_LINEAR_API_KEY is required only under the Linear tracker.
    const editKeys = tracker === "linear"
        ? "BKIT_GH_TOKEN_INSTALL, BKIT_GH_TOKEN, BKIT_LINEAR_API_KEY"
        : "BKIT_GH_TOKEN_INSTALL, BKIT_GH_TOKEN";
    const exportKeys = tracker === "linear"
        ? "BKIT_GH_TOKEN_INSTALL / BKIT_GH_TOKEN / BKIT_LINEAR_API_KEY"
        : "BKIT_GH_TOKEN_INSTALL / BKIT_GH_TOKEN";
    return {
        id: "mcp-env-direnv-missing",
        severity: "advisory",
        detect: ".envrc exists but direnv is not installed. .bkit/.env will not be auto-loaded into your shell.",
        action: "[mcp-env] direnv auto-loads .bkit/.env into your shell on cd, so tokens stay scoped to the repo. Set it up:\n\n" +
            "    # 1. One-time per machine — install direnv\n" +
            "    brew install direnv                                              # macOS\n" +
            "    # Linux / other: https://direnv.net/docs/installation.html\n\n" +
            "    # 2. One-time per machine — add the shell hook, then reload\n" +
            "    echo 'eval \"$(direnv hook zsh)\"' >> ~/.zshrc && source ~/.zshrc\n" +
            "    # bash: echo 'eval \"$(direnv hook bash)\"' >> ~/.bashrc && source ~/.bashrc\n\n" +
            "    # 3. One-time per repo — copy the example, fill in tokens, allow\n" +
            "    cp .bkit/.env.example .bkit/.env                             # if not already done\n" +
            `    # edit .bkit/.env: set ${editKeys}\n` +
            "    direnv allow\n\n" +
            `After step 3, restart Claude Code / Cursor sessions in this repo so the new env reaches their MCP servers. Alternative if you do not want direnv: export ${exportKeys} in ~/.zshrc or ~/.bashrc directly — works but leaks tokens into every shell on this machine.`,
    };
}
/**
 * Advisory: direnv is installed but the .envrc is blocked (not allowed).
 * Short-circuits in CI / cloud environments.
 */
export function detectDirenvNotAllowed(cwd, tracker = "linear") {
    if (isCloudOrCi())
        return null;
    // Only meaningful when .envrc exists
    const envrcPath = path.join(cwd, ".envrc");
    if (!fs.existsSync(envrcPath))
        return null;
    // Check direnv is installed first
    const whichResult = spawnSync("which", ["direnv"], { encoding: "utf-8" });
    if (whichResult.status !== 0 || !whichResult.stdout.trim())
        return null;
    // Run `direnv status` and check whether the .envrc is allowed
    const statusResult = spawnSync("direnv", ["status"], {
        cwd,
        encoding: "utf-8",
        timeout: 5000,
    });
    const statusOutput = (statusResult.stdout ?? "") + (statusResult.stderr ?? "");
    // direnv status reports "Found RC allowed false" or "Found RC path ... Blocked" when not allowed
    if (/Found RC\s+allowed\s+false/i.test(statusOutput) ||
        /state:\s*blocked/i.test(statusOutput) ||
        /not allowed/i.test(statusOutput)) {
        return {
            id: "mcp-env-direnv-not-allowed",
            severity: "advisory",
            detect: "direnv is installed but the .envrc in this repo is blocked. .bkit/.env is not being auto-loaded.",
            action: `[mcp-env] Run \`direnv allow\` in this repo to trust the .envrc and enable auto-load of .bkit/.env. direnv will then export ${tracker === "linear" ? "BKIT_GH_TOKEN, BKIT_GH_TOKEN_INSTALL, and BKIT_LINEAR_API_KEY" : "BKIT_GH_TOKEN and BKIT_GH_TOKEN_INSTALL"} into your shell whenever you cd into the repo.`,
        };
    }
    return null;
}
// ---------------------------------------------------------------------------
// runPreflight — main Phase 1 entry point
// ---------------------------------------------------------------------------
/**
 * Read `bkit.issueTracker` from the consumer's package.json.
 * Returns the tracker value or the default ("none") when absent / unreadable.
 * Internal helper — not exported; use runPreflight's `issueTracker` param.
 */
function readConsumerIssueTrackerForPreflight(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath))
        return DEFAULT_ISSUE_TRACKER;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const bkitField = pkg.bkit;
        const parsed = parseIssueTracker(bkitField?.issueTracker);
        return parsed ?? DEFAULT_ISSUE_TRACKER;
    }
    catch {
        return DEFAULT_ISSUE_TRACKER;
    }
}
/**
 * Run all Phase 1 (read-only) detectors.
 * Returns deduplicated { blockers, advisories } — intra-phase dedup by id,
 * first occurrence wins.
 *
 * cwd defaults to process.cwd(). Pass explicitly in tests.
 * installingVersion: used by detectBkitVersionMajorDowngrade; defaults to the
 * package's own version read from its package.json at runtime.
 * issueTracker: when provided, narrows tracker-specific checks (e.g. MCP server
 * requirements). When omitted, read from consumer's `bkit.issueTracker` in package.json.
 *
 * GitHub tracker gate: when `issueTracker === "github"`, the Linear preflight
 * gate is a no-op — the GitHub gate is enforced by workflow Step 1 via MCP.
 */
export function runPreflight(modules, cwd = process.cwd(), installingVersion, issueTracker) {
    // Resolve installing version if not provided
    let version = installingVersion;
    if (!version) {
        try {
            // Walk up from this script's location to find the package.json
            const scriptDir = new URL(".", import.meta.url).pathname;
            const pkgJsonPath = path.resolve(scriptDir, "..", "..", "package.json");
            if (fs.existsSync(pkgJsonPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
                version = pkg.version ?? "0.0.0";
            }
            else {
                version = "0.0.0";
            }
        }
        catch {
            version = "0.0.0";
        }
    }
    // Resolve issueTracker: use provided value or read from consumer package.json.
    // GitHub tracker gate: when issueTracker === "github", Linear preflight is a no-op
    // (the GitHub gate is enforced by workflow Step 1 via MCP — hook is no-op).
    const resolvedTracker = issueTracker ?? readConsumerIssueTrackerForPreflight(cwd);
    const blockers = [];
    const advisories = [];
    // --- Blocker detectors ---
    const noPackageJson = detectNoPackageJson(cwd);
    if (noPackageJson)
        blockers.push(noPackageJson);
    const malformedPackageJson = detectMalformedPackageJson(cwd);
    if (malformedPackageJson)
        blockers.push(malformedPackageJson);
    const notGitRepo = detectNotGitRepo(cwd, modules);
    if (notGitRepo)
        blockers.push(notGitRepo);
    // Phase 1: pre-envelope blocker (must upgrade through v1.x first)
    const preEnvelope = detectPreEnvelopeBkitVersion(cwd);
    if (preEnvelope)
        blockers.push(preEnvelope);
    // --- Advisory detectors ---
    // Phase 1: legacy envelope advisory (fires before JSON drift)
    const pkgRoot = getPkgRoot();
    for (const relPath of [".claude/settings.json", ".cursor/hooks.json"]) {
        const envelopeAdvisory = detectLegacyBkitEnvelope(cwd, relPath);
        if (envelopeAdvisory)
            advisories.push(envelopeAdvisory);
    }
    // Phase 1: JSON containment drift advisory
    for (const relPath of [".claude/settings.json", ".cursor/hooks.json"]) {
        const driftAdvisory = detectTier2JsonDrift(cwd, relPath, pkgRoot);
        if (driftAdvisory)
            advisories.push(driftAdvisory);
    }
    // Phase 2: markered-text block drift advisory (BAR-167)
    for (const relPath of MARKERED_TEXT_DRIFT_PATHS) {
        const textDriftAdvisory = detectTier2TextDrift(cwd, relPath, pkgRoot);
        if (textDriftAdvisory)
            advisories.push(textDriftAdvisory);
    }
    const gitignoreDup = detectGitignoreBlockDuplicates(cwd);
    if (gitignoreDup)
        advisories.push(gitignoreDup);
    advisories.push(...detectRetiredOwnedFiles(cwd));
    // docs/completed.md still present -> not yet migrated
    const completedMdUnmigrated = detectCompletedMdUnmigrated(cwd);
    if (completedMdUnmigrated)
        advisories.push(completedMdUnmigrated);
    const lintProse = detectLintProseF9Vulnerable(cwd);
    if (lintProse)
        advisories.push(lintProse);
    const versionMajorDowngrade = detectBkitVersionMajorDowngrade(cwd, version);
    if (versionMajorDowngrade)
        advisories.push(versionMajorDowngrade);
    const versionPinStale = detectBkitVersionPinStale(cwd);
    if (versionPinStale)
        advisories.push(versionPinStale);
    // BAR-224: [verbose ci] marker advisories
    const playwrightReporterHostile = detectPlaywrightReporterHostile(cwd);
    if (playwrightReporterHostile)
        advisories.push(playwrightReporterHostile);
    const contextFetch = detectContextFetchMissing(cwd);
    if (contextFetch)
        advisories.push(contextFetch);
    const contextFetchContext = detectContextFetchContextMissing(cwd);
    if (contextFetchContext)
        advisories.push(contextFetchContext);
    const contextFetchSource = detectContextFetchSourceNotEnabled(cwd);
    if (contextFetchSource)
        advisories.push(contextFetchSource);
    const contextFetchProvision = detectContextFetchProvisionMissing(cwd);
    if (contextFetchProvision)
        advisories.push(contextFetchProvision);
    // bkit-not-on-path advisory — suggest the shell alias for local development.
    const bkitNotOnPath = detectBkitNotOnPath();
    if (bkitNotOnPath)
        advisories.push(bkitNotOnPath);
    // Missing MCP server advisory — one finding per missing required key, per file.
    // Tracker-aware: when issueTracker === "github", only github MCP server is required
    // (the Linear gate is a no-op on the GitHub tracker; the gate runs in workflow Step 1 via MCP).
    // Extra MCP server advisory — one finding per bkit-managed server that the
    // resolved tracker does not use (e.g. a stale `linear` entry under `github`).
    for (const relPath of [".mcp.json", ".cursor/mcp.json"]) {
        advisories.push(...detectMissingMcpServers(cwd, relPath, resolvedTracker));
        advisories.push(...detectExtraMcpServers(cwd, relPath, resolvedTracker));
    }
    // [mcp-env] detectors run in Phase 3 (runPostInstallCheck in bkit-postinstall.ts),
    // not here: the .bkit/.env.example scaffold exists only after writes. Detectors are
    // exported from this file for the postinstall module.
    return {
        blockers: dedupeById(blockers),
        advisories: dedupeById(advisories),
    };
}
