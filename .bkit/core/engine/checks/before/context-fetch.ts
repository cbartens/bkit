// checks/before/context-fetch.ts — the context-fetch blocks in `.agents/context.md`: present,
// covering each context, sources enabled, provision blocks in place, output bounded.

import * as fs from "node:fs";
import * as path from "node:path";
import { getTemplatesRoot } from "../../shared/package-roots.js";
import { readDependencyNames } from "../../shared/package-json.js";
import type { PreflightFinding } from "./index.js";

/**
 * Line-anchored consumer opt-out marker for the context-fetch advisories. A repo
 * that legitimately enables no runtime-log source places this below
 * `<!-- bkit:end -->` to dismiss both `context-fetch-missing` and
 * `context-fetch-source-not-enabled`.
 */
const CONTEXT_FETCH_NONE_RE = /^<!-- context-fetch:none(?: [^>]*)? -->$/m;

/**
 * Every `context=` a `context-fetch` block may declare, in the order coverage is
 * narrated. `runtime` is the default when the attribute is absent. The one list: the
 * `bkit context` runner (commands/workflow/context.ts) and these advisories both read it.
 */
export const CONTEXT_FETCH_CONTEXTS: readonly string[] = ["runtime", "ci", "diff", "e2e", "web"];

/**
 * Contexts whose absence means an entire class of failure evidence is never fetched,
 * each with the evidence it carries.
 *
 * A subset of {@link CONTEXT_FETCH_CONTEXTS}: `web` is valid-but-not-required (its
 * self-skip names the host's built-in web tools as the fallback). `runtime` is covered
 * by `context-fetch-missing` instead.
 */
const CONTEXT_FETCH_EVIDENCE_CONTEXTS: Record<string, string> = {
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
function contextFetchNoneContexts(consumer: string): Set<string> {
  const m = /^<!-- context-fetch:none((?: [\w.-]+)*) -->$/m.exec(consumer);
  if (!m) return new Set();
  return new Set(m[1]!.split(/\s+/).filter((t) => CONTEXT_FETCH_CONTEXTS.includes(t)));
}

/**
 * True ONLY for the blanket opt-out: a `context-fetch:none` marker naming no known
 * context. A context-scoped marker (`context-fetch:none e2e`) dismisses that context's
 * coverage advisory and nothing else — it must never silence the advisories that
 * catch a repo with no blocks or an unenabled source.
 */
function contextFetchDismissesAll(consumer: string): boolean {
  return CONTEXT_FETCH_NONE_RE.test(consumer) && contextFetchNoneContexts(consumer).size === 0;
}

/**
 * Parse a `<!-- context-fetch:start [name] [context=<context>] -->` line. Attribute order
 * is free and both parts are optional: a bare `context-fetch:start` is an unnamed
 * `runtime` block. Runs of spaces and tabs separate tokens; the last name token wins.
 * Returns `null` for non-matching lines. The one parser: the `bkit context` runner
 * (commands/workflow/context.ts) and these advisories both read it.
 */
export function parseContextFetchStart(line: string): { name: string; context: string } | null {
  const m = /^<!-- context-fetch:start((?:[ \t]+[\w.=-]+)*)[ \t]*-->$/.exec(line);
  if (!m) return null;
  let name = "";
  let context = "runtime";
  for (const token of m[1]!.split(/[ \t]+/).filter(Boolean)) {
    if (token.startsWith("context=")) context = token.slice("context=".length);
    else name = token;
  }
  return { name, context };
}

/** Every `context-fetch:start` block declared in a section, in document order. */
function parseContextFetchStarts(section: string): { name: string; context: string }[] {
  const out: { name: string; context: string }[] = [];
  for (const line of section.split("\n")) {
    const parsed = parseContextFetchStart(line);
    if (parsed) out.push(parsed);
  }
  return out;
}

/**
 * A `context-fetch` marker block with its fenced bash body, in document order. `context` is
 * `""` for a provision block, which carries no `context=` attribute.
 */
type ContextFetchBlock = {
  kind: "start" | "provision";
  name: string;
  context: string;
  body: string[];
};

/**
 * Parse a consumer section into its `context-fetch` blocks, each with its fenced body. Only
 * NAMED start blocks can be matched to a provision sibling (keyed by name), so an unnamed
 * block is parked under `""`. The `bkit context` runner (commands/workflow/context.ts) and
 * these advisories read the same markers.
 */
function parseContextFetchBlocks(consumer: string): ContextFetchBlock[] {
  const blocks: ContextFetchBlock[] = [];
  let cur: ContextFetchBlock | null = null;
  let inFence = false;
  for (const line of consumer.split("\n")) {
    const startM = parseContextFetchStart(line);
    const provM = /^<!-- context-fetch:provision ([\w.-]+) -->$/.exec(line);
    if (startM) {
      cur = { kind: "start", name: startM.name, context: startM.context, body: [] };
      inFence = false;
      blocks.push(cur);
      continue;
    }
    if (provM) {
      cur = { kind: "provision", name: provM[1]!, context: "", body: [] };
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
    if (cur && inFence) cur.body.push(line);
  }
  return blocks;
}

/**
 * Drop shell comments from a block body before matching bound markers, so a bound named
 * only in the block's mandated `# Customise:` comment never makes an unbounded block look
 * bounded. A full-line comment is always a comment; a `#` that starts a word outside quotes
 * begins one too (the shell rule). A `#` inside quotes (a `jq` regex, a banner) is data and
 * stays, or `printf "===== # ====="` would read as a comment and truncate the line. Quote
 * state persists across lines because a quoted `jq` program may span several.
 */
function stripShellComments(text: string): string {
  const out: string[] = [];
  let quote: "'" | '"' | null = null;
  let escaped = false;
  for (const line of text.split("\n")) {
    let end = line.length;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (quote === "'") {
        if (ch === "'") quote = null;
        continue;
      }
      if (quote === '"') {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') quote = null;
        continue;
      }
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "'" || ch === '"') {
        quote = ch;
        continue;
      }
      if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]!))) {
        end = i;
        break;
      }
    }
    out.push(line.slice(0, end));
  }
  return out.join("\n");
}

/**
 * Markers proving a `context-fetch` block bounds its own stdout at the source, matched
 * against the block body with its shell comments removed. One entry maps to a real bound in
 * a shipped block: a row / line cap (`--limit`, an API or SQL `limit`, `per_page`, `head` /
 * `tail` / `--tail`, `--stat-count`, `--max-rows`, `max_results`, `grep -m` / `--max-count`,
 * a jq / Python slice `[0:N]`, a `sed -n 'A,Bp'` range, an `awk 'NR<=N'` guard, a `size`
 * field), a page / count cap (`*_MAX_*`, `*_MAX_PAGES`, a `*_N` knob, a shell loop `-lt`
 * guard), or a window / severity filter (`--since` / `--until` / `--freshness`, `SINCE` /
 * `UNTIL`, `statsPeriod`, a `severity` filter). The tavily block counts as bounded on its
 * `max_results:5` and `head -c` alone. A body is unbounded only when it matches none.
 */
const CONTEXT_FETCH_BOUND_RES: readonly RegExp[] = [
  // Row / line caps.
  /--limit\b/,
  /\blimit\b["']?[ \t]*[=:]?[ \t]*["'$]?\d/i,
  /(^|[\s|;(])head[ \t]+-/,
  /(^|[\s|;(])tail[ \t]+-/,
  /--tail[= ]/,
  /--stat-count/,
  /--max-rows\b/,
  /max_results/,
  /\bper_page\b["']?[ \t]*[=:][ \t]*["'$]?\d/i,
  /(^|[\s|;(])-m[ \t]+["'$]?\d/,
  /--max-count\b/,
  /[\[(][ \t]*\d*[ \t]*:[ \t]*\d+/, // jq / Python slice: .[0:10], [:10], [0:10]
  /\bsed\b[^\n]*[ \t]-n[ \t]*['"]?[0-9]+[ \t]*,[ \t]*[0-9]+p/, // sed -n '1,200p'
  /\bNR[ \t]*<=?[ \t]*[0-9$]/, // awk 'NR<=500'
  /\bsize["']?[ \t]*[=:][ \t]*["']?\d/i, // request / option body field
  // Page / count caps.
  /_MAX_/,
  /[A-Z][A-Z0-9]*_N\b/,
  /(^|[\s|;(])-l[et][ \t]+["'$]?\d/, // shell loop guard: [ "$N" -lt 20 ]
  // Window / severity filters.
  /--since\b/,
  /--until\b/,
  /--freshness\b/,
  /SINCE/,
  /UNTIL/,
  /statsPeriod/,
  /--severity\b/,
  /\bseverity[ \t]*([=:]|[<>]=?)/i,
  /--level\b/,
  /\blevel[ \t]*([=:]|[<>]=?)/i,
];

/** True when a `context-fetch` block body carries at least one output bound (see the list). */
export function blockBoundsOutput(body: readonly string[]): boolean {
  const text = stripShellComments(body.join("\n"));
  return CONTEXT_FETCH_BOUND_RES.some((re) => re.test(text));
}

/**
 * Map of context-fetch source name -> predicate proving THIS repo actually runs
 * that backend. Evidence-gates `context-fetch-source-not-enabled`
 * so a single-backend consumer (e.g. Vercel-only) is never nagged about a
 * backend it does not use (e.g. Supabase). A shipped template whose name has no
 * entry here is never flagged (cannot prove use => stay quiet).
 */
const CONTEXT_FETCH_BACKEND_EVIDENCE: Record<string, (cwd: string) => boolean> = {
  supabase: (cwd) =>
    fs.existsSync(path.join(cwd, "supabase", "config.toml")) ||
    readDependencyNames(cwd).some((d) => d.startsWith("@supabase/")),
  vercel: (cwd) =>
    fs.existsSync(path.join(cwd, "vercel.json")) ||
    fs.existsSync(path.join(cwd, ".vercel")) ||
    readDependencyNames(cwd).includes("vercel"),
};

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
export function detectContextFetchMissing(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, ".agents", "context.md");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  // Require the bkit-managed block (line-anchored `<!-- bkit:end -->`).
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return null;
  const afterBkitEnd = content.slice(endIdx);
  // Consumer opt-out: dismiss when a `<!-- context-fetch:none ... -->` marker is
  // present below `<!-- bkit:end -->` (repo legitimately enables no source).
  if (contextFetchDismissesAll(afterBkitEnd)) return null;
  // Consumer-section markers must be line-anchored to mirror the workflow's
  // `sed`/`awk` extraction (`.bkit/workflows/bkit-debug.md` Step 5). The start
  // marker carries an optional block name (`context-fetch:start vercel`).
  const hasStart = parseContextFetchStarts(afterBkitEnd).length > 0;
  const hasEnd = /^<!-- context-fetch:end -->$/m.test(afterBkitEnd);
  if (hasStart && hasEnd) return null;
  return {
    id: "context-fetch-missing",
    severity: "advisory",
    detect:
      "`.agents/context.md` has the bkit-managed block but no `<!-- context-fetch:start [name] --> ... <!-- context-fetch:end -->` block after `<!-- bkit:end -->`. `/bkit-debug` runs every block in that consumer section — with none, no runtime-log artifact is produced.",
    action:
      "Copy the blocks of a provider file in `.bkit/templates/context/` (e.g. `bkit-vercel.md`, `bkit-supabase.md`; index in `.bkit/templates.md` § Context-fetch blocks) and paste them after `<!-- bkit:end -->`, then set its env vars. REQUIRED: set the block's non-secret selector (e.g. `VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) by uncommenting the assignment line at the top of the copied block — committing it there is what makes the block run in headless cloud agents, which never read `.bkit/.env`. For cloud `/bkit-debug`, also set the secret tokens (`VERCEL_TOKEN` / `SUPABASE_ACCESS_TOKEN`) in your Claude/Cursor dashboard (or GitHub Actions secrets) and authenticate non-interactively (env tokens, never `vercel login`). Each block self-gates (missing CLI / token => a `[context-fetch:<name>] skipped — …` stderr breadcrumb, not an error), so enable only the sources you use; add your own block for any other log backend (`gcloud` / `aws` / `datadog`). Keep blocks read-only and idempotent — the agent customises severity / freshness / limit / target environment (e.g. Vercel preview vs production) at run-time.",
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
export function detectContextFetchContextMissing(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, ".agents", "context.md");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return null;
  const consumer = content.slice(endIdx);

  const enabled = parseContextFetchStarts(consumer);
  // No blocks at all => `context-fetch-missing` owns it (no double-fire).
  if (enabled.length === 0) return null;

  const dismissed = contextFetchNoneContexts(consumer);
  // A bare `context-fetch:none` names no context and dismisses every advisory.
  if (contextFetchDismissesAll(consumer)) return null;

  const contexts = new Set(enabled.map((b) => b.context));
  const missing = Object.keys(CONTEXT_FETCH_EVIDENCE_CONTEXTS).filter(
    (r) => !contexts.has(r) && !dismissed.has(r),
  );
  if (missing.length === 0) return null;

  const list = missing
    .map((r) => `\`context=${r}\` (${CONTEXT_FETCH_EVIDENCE_CONTEXTS[r]})`)
    .join(", ");
  const plural = missing.length > 1;
  return {
    id: "context-fetch-context-missing",
    severity: "advisory",
    detect: `\`.agents/context.md\` enables context-fetch blocks below \`<!-- bkit:end -->\` but none for ${list}. \`/bkit-debug\` fetches ALL failure evidence from these blocks — it hardcodes no CI host, workflow filename, branch name or e2e framework — so ${plural ? "those classes" : "that class"} of evidence ${plural ? "are" : "is"} never fetched on any debug run. Every attempt reports \`context=<context> NOT CONFIGURED\`, and diagnosis must treat the gap as unchecked rather than clean.`,
    action: `Copy the matching \`<!-- context-fetch:start <name> context=<context> --> ... <!-- context-fetch:end -->\` block(s) from \`.bkit/templates/context/\` (\`bkit-github.md\` for \`ci\` and \`diff\`, \`bkit-playwright.md\`, …; index in \`.bkit/templates.md\` § Context-fetch blocks) to below \`<!-- bkit:end -->\`, one per missing context: ${list}. The templates assume GitHub Actions and Playwright because that is the common case — they are examples, NOT the contract. Edit them to your setup: \`BASELINE_BRANCH\` / \`BASELINE_WORKFLOW\` must name YOUR trunk branch and workflow file, and \`E2E_ARTIFACT\` / \`E2E_JOB_RE\` must name YOUR upload-artifact and match ONLY the lane that block covers. On another CI host (GitLab, Bitbucket, Buildkite) replace the \`gh\` calls with that host's API — the context contract is just "write the evidence to stdout". A test lane whose evidence never reaches your CI host (a native lane whose reports stay on Expo EAS, Bitrise or Firebase Test Lab) needs its OWN \`context=e2e\` block fetching from that service (Expo EAS: \`bkit-maestro.md\`, the \`expo-workflows\` block in \`bkit-expo.md\`): widening another block's job regex to cover it makes that block download the WRONG lane's report and file it under the failing lane's name, which is worse than fetching nothing. Blocks are self-contained — each discovers the run it needs itself, so there is no ordering between them and none share variables. Give each block a name unique within its context; a repeated \`context\` + name pair writes both blocks to one artifact path. No such lane in this repo → name the context on the opt-out marker below \`<!-- bkit:end -->\`, space-separated for several: \`<!-- context-fetch:none ${missing.join(" ")} -->\`. That dismisses those contexts ONLY; a bare \`<!-- context-fetch:none intentional -->\` dismisses every context-fetch advisory.`,
  };
}

/**
 * Named fetch blocks bkit ships as templates, keyed by block name → the template file
 * (`.bkit/templates/context/<file>`) that holds it. Read from the package, so the set
 * follows the shipped templates without a hand-kept list.
 */
function shippedContextFetchTemplates(): Map<string, string> {
  const dir = path.join(getTemplatesRoot(), "context");
  const out = new Map<string, string>();
  if (!fs.existsSync(dir)) return out;
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith(".md")) continue;
    for (const { name } of parseContextFetchStarts(
      fs.readFileSync(path.join(dir, file), "utf-8"),
    )) {
      if (name && !out.has(name)) out.set(name, file);
    }
  }
  return out;
}

/**
 * Advisory: bkit ships a NAMED context-fetch template (e.g. `supabase` in
 * `.bkit/templates/context/bkit-supabase.md`), this repo demonstrably runs that backend,
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
export function detectContextFetchSourceNotEnabled(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, ".agents", "context.md");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return null;
  const consumer = content.slice(endIdx);
  // Consumer opt-out marker dismisses the advisory.
  if (contextFetchDismissesAll(consumer)) return null;
  // Only PARTIAL enablement: when the consumer section has no block at all,
  // `context-fetch-missing` owns that case (avoid double-firing).
  const hasStart = parseContextFetchStarts(consumer).length > 0;
  const hasEnd = /^<!-- context-fetch:end -->$/m.test(consumer);
  if (!(hasStart && hasEnd)) return null;
  const shipped = shippedContextFetchTemplates();
  const consumerLower = consumer.toLowerCase();
  const missing = [...shipped.keys()].filter((name) => {
    const evidence = CONTEXT_FETCH_BACKEND_EVIDENCE[name];
    if (!evidence || !evidence(cwd)) return false; // no proof the repo runs it
    return !consumerLower.includes(name.toLowerCase()); // name absent below bkit:end
  });
  if (missing.length === 0) return null;
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
const CONTEXT_FETCH_BASE_TOOLS = new Set<string>([
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
 * Both the `.claude/bkit-cloud.md` web setup-script snapshot and
 * `.claude/hooks/bkit-cloud-bootstrap.sh` provision from the SAME `context-fetch:provision`
 * recipes.
 *
 * Keyed on the block's OWN `command -v <cli>` self-guard, so a curl/jq/API block (no
 * stack-CLI guard) never fires; base tools
 * (`CONTEXT_FETCH_BASE_TOOLS`) are ignored. Only NAMED start blocks are checked (a
 * provision block is matched by name). Dismissable via `<!-- context-fetch:none ...
 * -->` below `<!-- bkit:end -->`.
 */
export function detectContextFetchProvisionMissing(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, ".agents", "context.md");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return null;
  const consumer = content.slice(endIdx);
  if (contextFetchDismissesAll(consumer)) return null;

  // Parse the consumer section into named start / provision blocks with fenced bodies.
  const blocks = parseContextFetchBlocks(consumer);

  const provisionNames = new Set(blocks.filter((b) => b.kind === "provision").map((b) => b.name));
  const provisionBody = blocks
    .filter((b) => b.kind === "provision")
    .map((b) => b.body.join("\n"))
    .join("\n");

  // For each enabled named start block, collect the stack CLIs it self-guards on
  // that have no provisioner (matched by same-name block OR a provision body that
  // installs that CLI). First-seen order; one entry per block name.
  const seen = new Set<string>();
  const items: string[] = [];
  let firstName = "";
  let firstCli = "";
  for (const b of blocks) {
    // Unnamed blocks are skipped: a provision sibling is matched by name.
    if (b.kind !== "start" || !b.name || seen.has(b.name)) continue;
    const body = b.body.join("\n");
    for (const m of body.matchAll(/command -v ([\w.-]+)/g)) {
      const cli = m[1]!;
      if (CONTEXT_FETCH_BASE_TOOLS.has(cli)) continue;
      if (provisionNames.has(b.name) || provisionBody.includes(cli)) continue;
      seen.add(b.name);
      items.push(`${b.name} (\`${cli}\`)`);
      if (!firstName) {
        firstName = b.name;
        firstCli = cli;
      }
      break;
    }
  }
  if (items.length === 0) return null;

  const list = items.join(", ");
  const plural = items.length > 1;
  return {
    id: "context-fetch-provision-missing",
    severity: "advisory",
    detect: `\`.agents/context.md\` enable${plural ? "" : "s"} context-fetch block${plural ? "s" : ""} that self-guard${plural ? "" : "s"} on a stack CLI but ship${plural ? "" : "s"} no matching \`<!-- context-fetch:provision <name> -->\` block below \`<!-- bkit:end -->\`: ${list}. bkit installs no stack CLIs itself, so in cloud the CLI is absent, the block's own \`command -v\` guard trips, and it self-skips (silent \`exit 0\`) — \`/bkit-debug\` fetches no runtime logs for ${plural ? "those sources" : "that source"} (reads as "clean", not "not wired up").`,
    action: `For each flagged block, add a sibling \`<!-- context-fetch:provision <name> -->\` block below \`<!-- bkit:end -->\` — SAME name as the fetch block — whose bash body installs the CLI, self-guarded and install-only: \`command -v ${firstCli} >/dev/null 2>&1 || <install ${firstCli}>\` (e.g. \`pnpm add -g ${firstCli}\` for an npm-published CLI). If \`.bkit/templates/context/\` ships a ready-made \`context-fetch:provision ${firstName}\` recipe, copy that. Then re-run \`bkit install\` so the recipe bakes into \`.claude/bkit-cloud.md\`'s setup script; \`.claude/hooks/bkit-cloud-bootstrap.sh\` runs the same recipe on gh-runner / resumed sessions. A block that fetches via an MCP tool or only universal tools (curl/jq/date) needs no provision.`,
  };
}

/**
 * Advisory: the consumer section enables a `context-fetch` block whose bash body bounds no
 * output — no row / line cap, page cap or window filter. `/bkit-debug` runs every enabled
 * block and writes its stdout straight into that context's artifact, so an unbounded block
 * downloads a whole-run dump; only the post-hoc 3000-line / 400 KB clamp catches it, and
 * the failure lines a diagnosis needs can fall outside the kept head 500 + tail 1000.
 *
 * Distinct from `context-fetch-missing` (which owns the no-blocks case): this only runs
 * once at least one block exists. The blanket opt-out (`<!-- context-fetch:none intentional -->`)
 * dismisses it; a context-scoped marker (`context-fetch:none e2e`) does not, because the
 * runner still runs a block that is present.
 */
export function detectContextFetchUnbounded(cwd: string): PreflightFinding | null {
  const filePath = path.join(cwd, ".agents", "context.md");
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  const endIdx = content.search(/^<!-- bkit:end -->$/m);
  if (endIdx === -1) return null;
  const consumer = content.slice(endIdx);
  if (contextFetchDismissesAll(consumer)) return null;

  const starts = parseContextFetchBlocks(consumer).filter((b) => b.kind === "start");
  // No blocks at all => `context-fetch-missing` owns it (no double-fire).
  if (starts.length === 0) return null;

  const unbounded = starts.filter((b) => !blockBoundsOutput(b.body));
  if (unbounded.length === 0) return null;

  const items = unbounded.map((b) => `${b.name || "(unnamed)"} (\`context=${b.context}\`)`);
  const list = items.join(", ");
  const plural = items.length > 1;
  return {
    id: "context-fetch-unbounded",
    severity: "advisory",
    detect: `\`.agents/context.md\` enables context-fetch block${plural ? "s" : ""} below \`<!-- bkit:end -->\` that bound no output: ${list}. \`/bkit-debug\` runs every enabled block and writes its stdout straight into that context's artifact, so ${plural ? "these blocks" : "this block"} download${plural ? "" : "s"} a whole-run dump — only the post-hoc 3000-line / 400 KB clamp catches it, and the failure lines a diagnosis needs can fall outside the kept head 500 + tail 1000.`,
    action: `Bound each flagged block at the source: add a row / line cap (\`--limit N\`, \`head -n N\`, \`tail -n N\` / \`--tail N\`, \`--stat-count N\`, \`grep -m N\` / \`--max-count N\`, \`--max-rows N\`, a jq / SQL slice (\`.[0:N]\`, \`limit N\`), a \`sed -n 'A,Bp'\` / \`awk 'NR<=N'\` range, the API's \`max_results\` / \`per_page\` / \`limit\` param, or a request-body \`size\` field), a page cap (\`<NAME>_MAX_PAGES\`, a \`*_N\` count variable, or a shell loop guard \`[ "$N" -lt M ]\`), or a window / severity filter (\`--since\` / \`--until\` / \`--freshness\` / \`SINCE\` / \`UNTIL\`, \`statsPeriod\`, or a \`severity\` / \`level\` filter) in the block body — not only in its \`# Customise:\` comment. Raise the cap only when the cause sits outside the kept window: \`/bkit-debug\` clamps the artifact post hoc at 3000 lines / 400 KB (head 500 + tail 1000 + every error-matching line), so an unbounded dump can drop the very failure lines a diagnosis needs.`,
  };
}
