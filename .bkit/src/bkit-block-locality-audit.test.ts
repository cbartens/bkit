/**
 * bkit-block-locality-audit.test.ts — #440
 *
 * Audits every fenced shell block in `.bkit/workflows/**` and `.bkit/prompts/**`
 * for BLOCK LOCALITY:
 *
 *   Every `$VAR` referenced inside a fenced shell block must be assigned
 *   inside THAT SAME block.
 *
 * Why: each fenced block is run as a separate Bash tool call, and shell state
 * (env vars, functions) does not persist between calls. A `$VAR` that no line
 * in the block assigns is therefore an unset variable at run time — it expands
 * to the empty string, silently. `jq --arg v "$SUMMARY_VERDICT"` with an unset
 * SUMMARY_VERDICT writes `"verdict": ""` into status.jsonl: the row lands, the
 * command exits 0, and the run looks healthy.
 *
 * This never fired in practice — all 244 committed verdict rows across
 * `docs/plans/**` carry a real value — because the orchestrator substituted the
 * value it was holding rather than deferring to bash. That is exactly what this
 * gate exists to pin down: correctness rested on undocumented model inference,
 * with nothing to detect the day it stopped holding. Under the #440 rule a
 * model-held value crosses into bash through one explicit assignment at the top
 * of the block:
 *
 *     SUMMARY_VERDICT="{SUMMARY_VERDICT}"
 *
 * after which `$SUMMARY_VERDICT` is locally assigned and this audit passes.
 *
 * SHAPE: ratchet, currently at zero. The #440 sweep assigned all 161
 * pre-existing references at their block boundary, so `KNOWN` is empty and any
 * unassigned reference fails immediately. `KNOWN` stays in place as the escape
 * hatch for a deliberate, argued exception: add the file/name/count and say why
 * in the commit. Counts are exact in both directions — dropping below an entry
 * also fails, so the inventory can never drift out of step with the corpus.
 *
 * NOT audited: standalone prose mentions of a variable. Per #440 the sigil is
 * optional there and both forms are correct, so there is nothing to check.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");

// ---------------------------------------------------------------------------
// Corpus
// ---------------------------------------------------------------------------

const SHELL_LANGS = new Set(["bash", "sh", "shell", "zsh"]);

function auditedFiles(): string[] {
  const out: string[] = [];
  for (const dir of [".bkit/workflows", ".bkit/prompts"]) {
    const abs = path.join(REPO_ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs).sort()) {
      if (f.endsWith(".md")) out.push(`${dir}/${f}`);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Values that legitimately arrive from outside the block
// ---------------------------------------------------------------------------

/** Real environment variables and shell builtins. */
const ENV = new Set([
  "HOME",
  "PATH",
  "PWD",
  "USER",
  "SHELL",
  "OLDPWD",
  "TMPDIR",
  "IFS",
  "PS1",
  "EDITOR",
  "LANG",
  "LC_ALL",
  "RANDOM",
  "SECONDS",
  "LINENO",
  "FUNCNAME",
  "BASH_SOURCE",
  "BASH_REMATCH",
  "PIPESTATUS",
  "REPLY",
  "OSTYPE",
  "HOSTNAME",
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "BKIT_LINEAR_API_KEY",
  "BKIT_GH_TOKEN",
  "CI",
  "GITHUB_REPOSITORY",
  "GITHUB_RUN_ID",
  "GITHUB_SHA",
  "GITHUB_REF",
  "GITHUB_ACTOR",
  "GITHUB_OUTPUT",
  "GITHUB_ENV",
  "GITHUB_WORKSPACE",
  "GITHUB_EVENT_NAME",
  "GITHUB_STEP_SUMMARY",
  "RUNNER_OS",
  "NODE_ENV",
  "npm_config_user_agent",
  "BKIT_CI_OUTCOME",
  "BKIT_CI_ATTEMPTS",
  "BKIT_CI_ALL_ERRORED",
]);

/**
 * Variables a sourced `.bkit/scripts/*.sh` library sets in the CALLER's shell.
 *
 * Only libraries the block actually sources count, and only if sourced (`.` /
 * `source`). `bkit-workflow-telemetry.sh` and `bkit-ship-gate.sh` are invoked
 * as `bash "..."` — a subprocess — so their variables correctly do NOT count.
 */
const PROVIDES: Record<string, string[]> = {
  "bkit-counter-bus-config.sh": [
    "MAX_CHALLENGE_REMEDIATE_ATTEMPT",
    "MAX_DEBUG_ATTEMPT",
    "MAX_DEV_DISPATCH_ATTEMPTS",
    "MAX_MERGE_ATTEMPT",
    "MAX_NORMAL_ATTEMPT",
    "MAX_REVALIDATE_ATTEMPT",
    "MAX_SOAK_ATTEMPT",
    "MAX_TEST_ATTEMPT",
    "MAX_VERIFY_ATTEMPT",
  ],
  // sources bkit-counter-bus-config.sh itself
  "bkit-counter-bus.sh": [
    "MAX_CHALLENGE_REMEDIATE_ATTEMPT",
    "MAX_DEBUG_ATTEMPT",
    "MAX_DEV_DISPATCH_ATTEMPTS",
    "MAX_MERGE_ATTEMPT",
    "MAX_NORMAL_ATTEMPT",
    "MAX_REVALIDATE_ATTEMPT",
    "MAX_SOAK_ATTEMPT",
    "MAX_TEST_ATTEMPT",
    "MAX_VERIFY_ATTEMPT",
  ],
  "bkit-ship-timeouts.sh": [
    "SHIP_CI_WAIT_TIMEOUT_S",
    "SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S",
    "SHIP_DEV_LOCK_STALE_S",
    "SHIP_POLL_INTERVAL_S",
  ],
  "bkit-status-fold.sh": ["BKIT_STATUS_FOLD"],
  "bkit-rebase-resolve.sh": ["BKIT_REBASE_LEDGERS"],
  "bkit-status-route.sh": [],
  "bkit-runtime.sh": [
    "RUNTIME",
    "RUNTIME_WORKTREES",
    "RUNTIME_DEVPUSHES",
    "RUNTIME_GITHUBCLI",
    "RUNTIME_GITHUBCLI_EXIT",
    "RUNTIME_GITHUBCLI_ERR",
    "WORKTREE_PATH",
    "BKIT_CLOSE_GUARD_ORIG_BRANCH",
    "CI_WAIT_RESULT",
    "CI_WAIT_ATTEMPTS",
    "CI_WAIT_ELAPSED",
    "CI_WAIT_ALL_ERRORED",
    "CI_WAIT_BLOCKED",
    "TEST_SCOPE",
    "CI_DECLARED_WORKFLOW",
  ],
};

// ---------------------------------------------------------------------------
// Fence parsing
// ---------------------------------------------------------------------------

export interface ShellBlock {
  /** 1-indexed line of the first line INSIDE the block. */
  start: number;
  lang: string;
  /** [1-indexed line number, text] for each line inside the block. */
  body: Array<[number, string]>;
}

/**
 * Split markdown into fenced blocks, honouring nested fences.
 *
 * A fence opened with N backticks closes only on a line of N or more backticks
 * with no info string. `bkit-debug.md` nests literal ``` example blocks inside
 * a ```` outer fence and depends on exactly this.
 */
export function fencedBlocks(content: string): ShellBlock[] {
  const lines = content.split("\n");
  const out: ShellBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const open = /^(\s*)(`{3,})\s*([A-Za-z0-9_+-]*)\s*$/.exec(lines[i]);
    if (!open) {
      i += 1;
      continue;
    }
    const ticks = open[2];
    const lang = (open[3] || "plain").toLowerCase();
    const body: Array<[number, string]> = [];
    let j = i + 1;
    while (j < lines.length) {
      const close = /^\s*(`{3,})\s*$/.exec(lines[j]);
      if (close && close[1].length >= ticks.length) break;
      body.push([j + 1, lines[j]]);
      j += 1;
    }
    out.push({ start: i + 2, lang, body });
    i = j + 1;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Masking regions where `$NAME` is not a shell parameter expansion
// ---------------------------------------------------------------------------

/** Replace a span with spaces, preserving newlines so line offsets stay valid. */
function blank(s: string): string {
  let out = "";
  for (const c of s) out += c === "\n" ? "\n" : " ";
  return out;
}

/**
 * Blank out quoted heredoc bodies and single-quoted strings.
 *
 * Both are places where `$x` is literal text, not an expansion: a `<<'EOF'`
 * heredoc suppresses expansion entirely, and single-quoted jq/awk programs bind
 * their own `$w` / `$wf` variables that have nothing to do with the shell.
 */
export function maskNonExpansions(text: string): string {
  let out = text;

  // <<'TAG' ... TAG  — quoted heredoc, body is literal
  const heredoc = /<<-?\s*'([A-Za-z_][A-Za-z0-9_]*)'/g;
  let hm: RegExpExecArray | null;
  const spans: Array<[number, number]> = [];
  while ((hm = heredoc.exec(out)) !== null) {
    const tag = hm[1];
    const rest = out.slice(hm.index + hm[0].length);
    const end = new RegExp(`^[ \\t]*${tag}[ \\t]*$`, "m").exec(rest);
    if (end) {
      const from = hm.index + hm[0].length;
      spans.push([from, from + end.index]);
    }
  }
  for (const [from, to] of spans.reverse()) {
    out = out.slice(0, from) + blank(out.slice(from, to)) + out.slice(to);
  }

  // '...' — single-quoted, multiline
  out = out.replace(/'[^']*'/g, (m) => blank(m));
  return out;
}

// ---------------------------------------------------------------------------
// Assignment / reference detection
// ---------------------------------------------------------------------------

const ASSIGN =
  /(?:^|[;&|()]\s*|\bthen\s+|\bdo\s+|\belse\s+|\bfi\s+|\bdone\s+|\{\s*)\s*(?:export\s+|local\s+|readonly\s+|declare\s+(?:-\w+\s+)?|typeset\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\+?=/gm;
const FORVAR = /\bfor\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\b/g;
const CFORVAR = /\bfor\s*\(\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/g;
const READVAR = /\bread\s+(?:-r\s+)?(?:-a\s+)?([A-Za-z_][A-Za-z0-9_ ]*)/g;
const ARITH = /\(\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*[-+*/]?=/g;
const SOURCED = /(?:^|[;&|]|\bthen\b|\belse\b)\s*(?:\.|source)\s+"?[^"\s;]*?\/([a-z-]+\.sh)/gm;
const JQARG = /--arg(?:json)?\s+([A-Za-z_][A-Za-z0-9_]*)/g;
const JQBIND = /\bas\s+\$([A-Za-z_][A-Za-z0-9_]*)/g;
const REF = /\$\{?([A-Za-z_][A-Za-z0-9_]*)/g;

function allMatches(re: RegExp, s: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(s)) !== null) out.push(m[1]);
  return out;
}

export interface Finding {
  file: string;
  line: number;
  name: string;
  text: string;
  blockStart: number;
}

/** Names assigned, sourced, or otherwise legitimately in scope for a block. */
function inScope(masked: string, raw: string): Set<string> {
  const declared = new Set<string>();
  for (const n of allMatches(ASSIGN, masked)) declared.add(n);
  for (const n of allMatches(ARITH, masked)) declared.add(n);
  for (const n of allMatches(FORVAR, masked)) declared.add(n);
  for (const n of allMatches(CFORVAR, masked)) declared.add(n);
  for (const group of allMatches(READVAR, masked)) {
    for (const n of group.trim().split(/\s+/)) if (n) declared.add(n);
  }
  for (const lib of allMatches(SOURCED, masked)) {
    for (const n of PROVIDES[lib] ?? []) declared.add(n);
  }
  // jq-internal names are not shell variables
  for (const n of allMatches(JQARG, raw)) declared.add(n);
  for (const n of allMatches(JQBIND, raw)) declared.add(n);
  return declared;
}

/** Find every `$VAR` in a shell block that the block itself never assigns. */
export function auditContent(file: string, content: string): Finding[] {
  const findings: Finding[] = [];
  for (const block of fencedBlocks(content)) {
    if (!SHELL_LANGS.has(block.lang)) continue;
    const raw = block.body.map(([, t]) => t).join("\n");
    const masked = maskNonExpansions(raw);
    const declared = inScope(masked, raw);
    const maskedLines = masked.split("\n");
    block.body.forEach(([lineNo, text], idx) => {
      const clean = maskedLines[idx] ?? "";
      for (const name of allMatches(REF, clean)) {
        if (declared.has(name) || ENV.has(name) || /^\d+$/.test(name)) continue;
        findings.push({ file, line: lineNo, name, text: text.trim(), blockStart: block.start });
      }
    });
  }
  return findings;
}

function auditRepo(): Finding[] {
  const out: Finding[] = [];
  for (const rel of auditedFiles()) {
    const abs = path.join(REPO_ROOT, rel);
    out.push(...auditContent(rel, fs.readFileSync(abs, "utf-8")));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Ratchet inventory — references that predate #440
// ---------------------------------------------------------------------------

/**
 * Per-file, per-name counts of unassigned `$VAR` references as of #440.
 *
 * Counts are EXACT in both directions. Fixing a reference fails the test until
 * this inventory is lowered in the same commit — that is deliberate, so the
 * inventory cannot drift out of step with the corpus.
 *
 * Line numbers are intentionally NOT part of the key: they shift on every edit
 * and would make the inventory churn without adding signal.
 */
const KNOWN: Record<string, Record<string, number>> = {};

function tally(findings: Finding[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const f of findings) {
    (out[f.file] ??= {})[f.name] = ((out[f.file] ?? {})[f.name] ?? 0) + 1;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

/**
 * Scope: the bkit SOURCE of truth only — `.bkit/workflows/` and `.bkit/prompts/`.
 *
 * The host-render mirrors (`.claude/commands/`, `.cursor/commands/`,
 * `.opencode/commands/`) are force-overwritten output of `bkit install`, not
 * hand-edited source. Auditing them would double-report every finding and,
 * worse, hold CI red until someone re-ran `bkit install` — turning a
 * regenerable artifact into a merge blocker. Fix the source; the mirror follows.
 *
 * `.bkit/templates/` is out of scope for a different reason: its files are
 * consumer-facing config and cloud-env templates using `{{TOKEN}}` install-time
 * substitution, not orchestrator step files, so the prose-to-bash handoff this
 * audit guards does not occur there.
 */
describe("#440: audit scope is bkit source, never the rendered mirrors", () => {
  const MIRRORS = [".claude/commands", ".cursor/commands", ".opencode/commands", ".bkit/templates"];

  it("audits only .bkit/workflows and .bkit/prompts", () => {
    const stray = auditedFiles().filter(
      (f) => !f.startsWith(".bkit/workflows/") && !f.startsWith(".bkit/prompts/"),
    );
    expect(stray).toEqual([]);
  });

  it("never reaches a host-render mirror or a template", () => {
    const reached = auditedFiles().filter((f) => MIRRORS.some((m) => f.startsWith(`${m}/`)));
    expect(reached).toEqual([]);
  });

  it("does cover the whole source corpus", () => {
    const files = auditedFiles();
    expect(files.filter((f) => f.startsWith(".bkit/workflows/")).length).toBeGreaterThan(5);
    expect(files.filter((f) => f.startsWith(".bkit/prompts/")).length).toBeGreaterThan(40);
  });
});

describe("#440: the detector itself works", () => {
  it("flags a $VAR that the block never assigns", () => {
    const md = ["text", "```bash", 'echo "$UNSET_THING"', "```"].join("\n");
    const hits = auditContent("t.md", md);
    expect(hits.map((h) => h.name)).toEqual(["UNSET_THING"]);
  });

  it("accepts a $VAR assigned earlier in the SAME block", () => {
    const md = ["```bash", "X=$(git rev-parse HEAD)", 'echo "$X"', "```"].join("\n");
    expect(auditContent("t.md", md)).toEqual([]);
  });

  it("flags a $VAR assigned only in a DIFFERENT block", () => {
    const md = [
      "```bash",
      "X=1",
      "```",
      "prose between the two Bash calls",
      "```bash",
      'echo "$X"',
      "```",
    ].join("\n");
    expect(auditContent("t.md", md).map((h) => h.name)).toEqual(["X"]);
  });

  it("accepts a case-arm assignment", () => {
    const md = [
      "```bash",
      "B=main",
      'case "$B" in',
      "  main) TARGET=prod ;;",
      "esac",
      'echo "$TARGET"',
      "```",
    ].join("\n");
    expect(auditContent("t.md", md)).toEqual([]);
  });

  it("ignores jq-internal bindings and --arg names", () => {
    const md = [
      "```bash",
      "F=x.json",
      `jq -c '.[] as $w | {wf: $w.workflow}' "$F"`,
      `jq -nc --arg t "now" '{at:$t}'`,
      "```",
    ].join("\n");
    expect(auditContent("t.md", md)).toEqual([]);
  });

  it("ignores $vars inside a quoted heredoc body", () => {
    const md = ["```bash", "cat <<'EOF'", "literal $NOT_A_VAR here", "EOF", "```"].join("\n");
    expect(auditContent("t.md", md)).toEqual([]);
  });

  it("counts a sourced library's exported vars as in scope", () => {
    const md = [
      "```bash",
      "REPO_ROOT=/tmp",
      '. "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh"',
      `jq -s "$BKIT_STATUS_FOLD"' fold' f.jsonl`,
      "```",
    ].join("\n");
    expect(auditContent("t.md", md)).toEqual([]);
  });

  it("does NOT count vars from a library that is executed, not sourced", () => {
    const md = [
      "```bash",
      "WT=/tmp",
      'bash "$WT/.bkit/scripts/bkit-workflow-telemetry.sh"',
      'echo "$FID"',
      "```",
    ].join("\n");
    expect(auditContent("t.md", md).map((h) => h.name)).toEqual(["FID"]);
  });

  it("does not treat a nested ``` fence as closing a ```` block", () => {
    const md = ["````bash", "X=1", "```", 'echo "$X"', "```", 'echo "$X"', "````"].join("\n");
    expect(auditContent("t.md", md)).toEqual([]);
  });

  it("ignores non-shell fences", () => {
    const md = ["```json", '{ "a": "$NOPE" }', "```"].join("\n");
    expect(auditContent("t.md", md)).toEqual([]);
  });

  /**
   * Anti-vacuity, in two parts.
   *
   * A clean corpus means "no findings" is the correct answer, so the audit
   * passing proves nothing on its own — the shipped patterns in
   * `bkit-counter-prose-audit.test.ts` matched NOTHING in the real corpus and
   * still went green for months. These two tests keep that from recurring:
   * the machinery must reach real shipped shell, and it must still fire when
   * that shell is broken.
   */
  it("reaches real shipped shell blocks", () => {
    let shell = 0;
    let refs = 0;
    for (const rel of auditedFiles()) {
      const content = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
      for (const b of fencedBlocks(content)) {
        if (!SHELL_LANGS.has(b.lang)) continue;
        shell += 1;
        refs += (
          b.body
            .map(([, t]) => t)
            .join("\n")
            .match(/\$\{?[A-Za-z_]/g) ?? []
        ).length;
      }
    }
    expect(shell).toBeGreaterThan(100);
    expect(refs).toBeGreaterThan(500);
  });

  it("still fires when a real shipped block loses its assignment", () => {
    const rel = ".bkit/workflows/bkit-ship.md";
    const content = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
    expect(auditContent(rel, content)).toEqual([]);

    // Drop one real in-block assignment; the reference below it must now fail.
    const broken = content.replace(/^(\s*)BOOK_ROOT="\{BOOK_ROOT\}"\n/m, "");
    expect(broken).not.toBe(content);
    expect(auditContent(rel, broken).map((h) => h.name)).toContain("BOOK_ROOT");
  });
});

describe("#440: block locality ratchet", () => {
  const actual = tally(auditRepo());
  const files = new Set([...auditedFiles(), ...Object.keys(actual), ...Object.keys(KNOWN)]);

  for (const file of [...files].sort()) {
    it(`${file}: no new unassigned $VAR in a fenced shell block`, () => {
      const got = actual[file] ?? {};
      const want = KNOWN[file] ?? {};
      const names = [...new Set([...Object.keys(got), ...Object.keys(want)])].sort();
      const drift: string[] = [];
      for (const n of names) {
        const g = got[n] ?? 0;
        const w = want[n] ?? 0;
        if (g > w) {
          drift.push(
            `  $${n}: ${g} unassigned reference(s), inventory allows ${w}.\n` +
              `      Assign it at the top of the block — ${n}="{${n}}" — or derive it there.`,
          );
        } else if (g < w) {
          drift.push(`  $${n}: down to ${g} from ${w} — lower the KNOWN inventory in this commit.`);
        }
      }
      expect(drift.join("\n"), `${file}\n${drift.join("\n")}`).toBe("");
    });
  }
});
