/**
 * bkit-counter-prose-audit.test.ts — WS3-T3 (#58 / #234), moved onto `bkit`
 * commands by #467.
 *
 * Attempt counters are derived from status.jsonl by `bkit counters derive|run|rows`
 * and compared to their cap by `bkit counters route`; what those commands
 * compute (positions, de-dupe, run boundaries, a resume keeping its run number,
 * the MAX_* values) is pinned in commands/workflow/counters.test.ts. This audit
 * pins the WIRING the commands cannot see — every rule below is a way a
 * workflow could hand a model-authored number to a router or a status row:
 *
 *   1. No bare `*_ATTEMPT` token and no counter arithmetic in prose: a prose
 *      "increment X" or "X + 1" is the model computing the counter.
 *   2. Every MAX_* threshold is live (named by a routing block or the cloud
 *      router), and every threshold a workflow names exists — `--limit=` /
 *      `--name=` is parsed by the command, and an unknown name exits 2.
 *   3. Commit cadence: a counted step's row-writing block commits in-block (so
 *      its `parentSha` advances and the next attempt counts as distinct), or is
 *      on an explicit exemption list.
 *   4. Completeness: every fenced block that reads `$COUNTER` (to route on it
 *      or write it) derives it in the same block through a command — shell
 *      state does not survive between orchestrator Bash calls, so a variable
 *      used without being set in-block is model-authored. No counter is
 *      derived by raw jq over status.jsonl. Routing and writing
 *      flags never take a held `{COUNTER}` placeholder; display-only uses
 *      (filenames, comment headers) may, since a command printed that value
 *      earlier in the same step.
 *   5. No shell arithmetic on a counter: positions (next / current / count) are
 *      the command's job, and `$((X + 1))` is exactly the off-by-one class #58
 *      found.
 *   6. Mapping: each block derives the RIGHT counter for the row it writes.
 *   7. No raw status.jsonl field feeds `$(( ))` (arithmetic-injection sink).
 *   8. A block routing on `$DEBUG_MODE` / `$PUSH_MODE` reads it from `bkit status route`
 *      in-block.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { THRESHOLDS } from "./commands/workflow/counters";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, "../..");

/**
 * Strip all fenced code blocks (``` ... ``` or wider). The backreference
 * requires the SAME backtick count on open and close, so a 4-backtick outer
 * fence closes only on another 4-backtick line, skipping nested 3-backtick
 * markers in between.
 */
function stripFencedBlocks(content: string): string {
  return content.replace(/^([ \t]*)(`{3,})[\w]*\n[\s\S]*?^[ \t]*\2[ \t]*$/gm, "");
}

/** Every fenced block body, with its offset in the file. */
function fencedBlocks(content: string): Array<{ start: number; block: string }> {
  const out: Array<{ start: number; block: string }> = [];
  for (const m of content.matchAll(/^[ \t]*(`{3,})[\w]*\n([\s\S]*?)^[ \t]*\1[ \t]*$/gm)) {
    out.push({ start: m.index ?? 0, block: m[2]! });
  }
  return out;
}

/** Read a file relative to REPO_ROOT; empty string if missing. */
function readRepo(rel: string): string {
  const p = path.join(REPO_ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";
}

const WORKFLOW_FILES = [
  ".bkit/workflows/bkit-build.md",
  ".bkit/workflows/bkit-debug.md",
  ".bkit/workflows/bkit-plan.md",
  ".bkit/workflows/bkit-design.md",
  ".bkit/workflows/bkit-ship.md",
];

const realFiles = () =>
  WORKFLOW_FILES.map((p) => ({ path: p, content: readRepo(p) })).filter((f) => f.content !== "");

type Corpus = Array<{ path: string; content: string }>;

/** `NAME=$("$BKIT" counters derive|run|rows ...)` — the in-block derive of NAME. */
const deriveAssign = (name: string) =>
  new RegExp(`\\b${name}=\\$\\(\\s*"\\$BKIT" counters (?:derive|run|rows)\\b`);

/** Step names a `bkit counters derive` call reads, in a block or file. */
function derivedSteps(text: string): string[] {
  return [...text.matchAll(/\bcounters derive\b[^\n]*?--step="?([\w-]+)"?/g)].map((m) => m[1]!);
}

/** The `bkit steps done` call lines in a block, each with the step it writes. */
function stepDoneLines(block: string): Array<{ step: string; line: string }> {
  return block
    .split("\n")
    .filter((l) => /\bsteps done\b/.test(l))
    .flatMap((line) => {
      const m = /--step="?([\w-]+)"?/.exec(line);
      return m ? [{ step: m[1]!, line }] : [];
    });
}

// ---------------------------------------------------------------------------
// 1. Prose — no bare counter token, no counter arithmetic
// ---------------------------------------------------------------------------

/**
 * Bans ANY bare `*_ATTEMPT` token in prose — assignment, increment, reset,
 * comparison all name the counter bare — exempting only:
 *   (a) `{X_ATTEMPT}` brace placeholders NOT preceded by `$` (a substitution
 *       token holding a value a command printed, never a computation), and
 *   (b) bare `MAX_*_ATTEMPT` threshold NAMES.
 * `${X_ATTEMPT}` is a `$`-prefixed VALUE reference and is NOT exempt; the
 * negative lookbehind on `$` is what keeps the two apart.
 */
function findBareAttemptTokenViolations(content: string): Array<{ line: number; text: string }> {
  const lines = stripFencedBlocks(content).split("\n");
  const hits: Array<{ line: number; text: string }> = [];
  const placeholderExempt = /(?<!\$)\{[A-Z][A-Z0-9_]*_ATTEMPT\}/g;
  const maxNameExempt = /\bMAX_[A-Z0-9_]*_ATTEMPT\b/g;
  const bareToken = /\b[A-Z][A-Z0-9_]*_ATTEMPT\b/;
  lines.forEach((l, i) => {
    const masked = l.replace(placeholderExempt, "").replace(maxNameExempt, "");
    if (bareToken.test(masked)) hits.push({ line: i + 1, text: l.trim() });
  });
  return hits;
}

/** A prose line doing arithmetic on a held counter placeholder. */
function findProseCounterArithmetic(content: string): string[] {
  return stripFencedBlocks(content)
    .split("\n")
    .filter((l) => /\{[A-Z][A-Z0-9_]*_ATTEMPT\}/.test(l))
    .filter((l) => /\{[A-Z][A-Z0-9_]*_ATTEMPT\}`?\s*[-+]\s*\d|\bincrement|\breset\b/i.test(l))
    .map((l) => l.trim());
}

describe("1. no bare *_ATTEMPT token and no counter arithmetic in workflow prose", () => {
  for (const wfFile of WORKFLOW_FILES) {
    it(`${wfFile}: no bare *_ATTEMPT token in non-fenced prose`, () => {
      const hits = findBareAttemptTokenViolations(readRepo(wfFile));
      expect(
        hits.map((h) => `line ~${h.line}: ${h.text.slice(0, 120)}`),
        "derive the counter with bkit counters derive|run in a fenced block; prose may only hold {X_ATTEMPT}",
      ).toEqual([]);
    });

    it(`${wfFile}: no arithmetic on a {X_ATTEMPT} placeholder in prose`, () => {
      expect(findProseCounterArithmetic(readRepo(wfFile))).toEqual([]);
    });
  }

  describe("negative control — the rules fire on known-bad lines and exempt only true placeholders", () => {
    const knownBad = [
      "Init counters: `VERIFY_ATTEMPT` = 0",
      "Increment `TEST_ATTEMPT` + 1",
      "`CHALLENGE_REMEDIATE_ATTEMPT` < 1",
      "`NORMAL_ATTEMPT` > 1",
      "`SOAK_ATTEMPT` reset to 0",
      "cost `${TEST_ATTEMPT}` in prose",
    ];
    for (const line of knownBad) {
      it(`bare-token rule fires on: ${line}`, () => {
        expect(findBareAttemptTokenViolations(line).length).toBeGreaterThan(0);
      });
    }

    for (const line of ["Next attempt is `{TEST_ATTEMPT}` + 1", "Increment {VERIFY_ATTEMPT}"]) {
      it(`arithmetic rule fires on: ${line}`, () => {
        expect(findProseCounterArithmetic(line).length).toBeGreaterThan(0);
      });
    }

    it("does NOT fire on a bare {VERIFY_ATTEMPT} placeholder or a MAX_TEST_ATTEMPT name", () => {
      expect(findBareAttemptTokenViolations("Attempt: {VERIFY_ATTEMPT}").length).toBe(0);
      expect(findBareAttemptTokenViolations("Bounded by MAX_TEST_ATTEMPT.").length).toBe(0);
      expect(findProseCounterArithmetic("Attempt: {VERIFY_ATTEMPT}").length).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. Thresholds — every MAX_* is live, every named one exists
// ---------------------------------------------------------------------------

describe("2. MAX_* thresholds: none dead, none unknown", () => {
  /**
   * Shell surfaces outside the markdown corpus that enforce a cap directly.
   * `bkit-cloud.yml` gates dev-triggered dispatch in its own `run:` shell
   * (its workflow-level env, whose parity with THRESHOLDS is pinned in
   * counters.test.ts), so a cap consumed only there is live.
   */
  const SHELL_ENFORCEMENT_FILES = [
    ".github/workflows/bkit-cloud.yml",
    ".bkit/templates/.github/workflows/bkit-cloud.yml",
  ];

  /** Drop comment-only lines — a cap named solely in a comment enforces nothing. */
  const executable = (text: string) =>
    text
      .split("\n")
      .filter((l) => !/^\s*#/.test(l))
      .join("\n");

  const executableCorpus = () =>
    [
      ...realFiles().flatMap((f) => fencedBlocks(f.content).map((b) => executable(b.block))),
      ...SHELL_ENFORCEMENT_FILES.map((f) => executable(readRepo(f))),
    ].join("\n");

  const names = Object.keys(THRESHOLDS);

  it("enumerates the thresholds from the command (no hardcoded list)", () => {
    expect(names.length).toBeGreaterThan(5);
    expect(names).toContain("MAX_CHALLENGE_REMEDIATE_ATTEMPT");
  });

  for (const name of names) {
    it(`${name} is referenced in executable shell (a workflow fence or the cloud router)`, () => {
      expect(executableCorpus()).toMatch(new RegExp(`\\b${name}\\b`));
    });
  }

  it("every threshold a workflow passes by name (--limit= / counters max --name=) exists", () => {
    const named = [
      ...executableCorpus().matchAll(
        /--limit=(MAX_\w+)|counters max --name=(MAX_\w+)|--name=(MAX_\w+)/g,
      ),
    ].map((m) => m[1] ?? m[2] ?? m[3]);
    expect(named.length).toBeGreaterThan(0);
    for (const n of named) expect(names, `unknown threshold ${n} exits 2`).toContain(n);
  });
});

// ---------------------------------------------------------------------------
// 3. Commit cadence — row-counting depends on parentSha advancing
// ---------------------------------------------------------------------------

interface ExemptionEntry {
  step: string;
  reason: string;
}

const TRANSITIVE_EXEMPTIONS: ExemptionEntry[] = [
  {
    step: "debug-run-tests",
    reason:
      "KN-26: debug-run-tests deliberately has no in-block commit so a chore(...) HEAD does not make the Vercel-ignore regex skip the preview; parentSha advances transitively via Steps 4/5/6.",
  },
  {
    step: "ship-merge-pr",
    reason:
      "#384: ship-merge-pr integrates via `gh pr merge --squash` (server-side); the squash commit IS the integration. No local `git commit` — the PR merge is the advancement.",
  },
];

/** Steps whose attempts are counted: read by `counters derive`, or written with `--attempt=next`. */
function countedSteps(files: Corpus): Set<string> {
  const steps = new Set<string>();
  for (const f of files) {
    for (const s of derivedSteps(f.content)) steps.add(s);
    for (const { block } of fencedBlocks(f.content)) {
      for (const { step, line } of stepDoneLines(block)) {
        if (/--attempt=next\b/.test(line)) steps.add(step);
      }
    }
  }
  return steps;
}

/**
 * For a step, whether its row-writing block commits: the `steps done` call
 * commits by default unless `--commit=none`, or the block runs `git commit`.
 * null when no row-writing block for the step exists.
 */
function stepCommitsInBlock(content: string, step: string): boolean | null {
  for (const { block } of fencedBlocks(content)) {
    const row = stepDoneLines(block).find((s) => s.step === step);
    if (!row) continue;
    return !/--commit=none\b/.test(row.line) || /\bgit commit\b/.test(block);
  }
  return null;
}

interface Violation {
  step: string;
  reason: string;
}

function auditCountedSteps(files: Corpus, exemptions: ExemptionEntry[]): Violation[] {
  const violations: Violation[] = [];
  const exempt = new Set(exemptions.map((e) => e.step));
  for (const step of countedSteps(files)) {
    let commits: boolean | null = null;
    for (const f of files) {
      commits = stepCommitsInBlock(f.content, step);
      if (commits !== null) break;
    }
    if (commits === null) {
      violations.push({ step, reason: "no row-writing block found for counted step" });
    } else if (!commits && !exempt.has(step)) {
      violations.push({
        step,
        reason: "row-writing block does not commit and is not on the transitive-exemption list",
      });
    }
  }
  return violations;
}

describe("3. commit cadence — every counted step commits in-block or is explicitly exempted", () => {
  it("non-vacuity: the counted steps are enumerated from the corpus, and there are several", () => {
    const steps = countedSteps(realFiles());
    expect(steps.size).toBeGreaterThanOrEqual(5);
    for (const s of ["build-plan-verify", "build-run-tests", "debug-run-tests", "ship-merge-pr"]) {
      expect(steps).toContain(s);
    }
  });

  it("real corpus: every counted step commits in-block or is exempted", () => {
    const violations = auditCountedSteps(realFiles(), TRANSITIVE_EXEMPTIONS);
    expect(violations.map((v) => `${v.step}: ${v.reason}`)).toEqual([]);
  });

  it("the exemption list is current: each entry is a counted step whose row block really does not commit", () => {
    const files = realFiles();
    const counted = countedSteps(files);
    for (const { step } of TRANSITIVE_EXEMPTIONS) {
      expect(counted, `stale exemption ${step}`).toContain(step);
      const commits = files.map((f) => stepCommitsInBlock(f.content, step)).find((c) => c !== null);
      expect(commits, `${step} now commits in-block — drop its exemption`).toBe(false);
    }
  });

  it("RED-PROOF: removing debug-run-tests from the exemption list reds the audit (real corpus)", () => {
    const withoutExemption = auditCountedSteps(
      realFiles(),
      TRANSITIVE_EXEMPTIONS.filter((e) => e.step !== "debug-run-tests"),
    );
    expect(withoutExemption.some((v) => v.step === "debug-run-tests")).toBe(true);
  });

  it("RED-PROOF: a fake counted step with --commit=none and no exemption reds the audit", () => {
    const fakeBlock = [
      "```bash",
      'N=$("$BKIT" counters derive --file="$STATUS" --workflow=build --step=fake-counted-step --position=next | jq -er .value) || exit 2',
      '"$BKIT" steps done --file="$STATUS" --workflow=build --step=fake-counted-step --attempt="$N" --commit=none',
      "```",
    ].join("\n");
    const violations = auditCountedSteps(
      [{ path: "synthetic.md", content: fakeBlock }],
      TRANSITIVE_EXEMPTIONS,
    );
    expect(violations.some((v) => v.step === "fake-counted-step")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Completeness — a block that routes on or writes a counter derives it
// ---------------------------------------------------------------------------

/** Every counter the corpus routes on or derives. */
function counterNames(files: Corpus): string[] {
  const names = new Set<string>();
  for (const f of files) {
    for (const m of f.content.matchAll(/\bcounters route --name=([A-Z][A-Z0-9_]*)/g))
      names.add(m[1]!);
    for (const m of f.content.matchAll(
      /\b([A-Z][A-Z0-9_]*)=\$\(\s*"\$BKIT" counters (?:derive|run|rows)\b/g,
    ))
      names.add(m[1]!);
  }
  return [...names].sort();
}

interface CompletenessViolation {
  file: string;
  counter: string;
  why: string;
  snippet: string;
}

function findIncompleteBlocks(files: Corpus, names: string[]): CompletenessViolation[] {
  const violations: CompletenessViolation[] = [];
  for (const f of files) {
    for (const { block } of fencedBlocks(f.content)) {
      for (const name of names) {
        // Any `$`-prefixed reference — `$NAME`, `${NAME}`, quoted or not. The
        // `$` must be adjacent to the name, so `$MAX_NAME` never matches.
        if (!new RegExp(`\\$\\{?${name}\\b`).test(block)) continue;
        if (!deriveAssign(name).test(block)) {
          violations.push({
            file: f.path,
            counter: name,
            why: "reads the counter without deriving it in-block",
            snippet: block.slice(0, 160),
          });
        }
      }
      // A routing or row-writing flag fed a held placeholder: the model
      // transcribed the value instead of a command deriving it here.
      for (const line of block.split("\n")) {
        if (!/\bcounters route\b|\bsteps (?:done|gate)\b|\bworkflows fail\b/.test(line)) continue;
        const held = /--(?:value|attempt)="?\{([A-Z][A-Z0-9_]*)\}/.exec(line);
        if (held) {
          violations.push({
            file: f.path,
            counter: held[1]!,
            why: "routes on or writes a held {placeholder}",
            snippet: line.trim().slice(0, 160),
          });
        }
      }
    }
  }
  return violations;
}

describe("4. completeness — every block that routes on or writes a counter derives it in-block", () => {
  const files = realFiles();
  const names = counterNames(files);

  it("non-vacuity: counters are discovered from the corpus (route names and derive targets)", () => {
    for (const n of ["VERIFY_ATTEMPT", "TEST_ATTEMPT", "DEBUG_ATTEMPT", "MERGE_ATTEMPT"]) {
      expect(names).toContain(n);
    }
  });

  it("real corpus: no block reads a counter it does not derive, or routes/writes a held placeholder", () => {
    const violations = findIncompleteBlocks(files, names);
    expect(violations.map((v) => `${v.file} [${v.counter}] ${v.why}:\n    ${v.snippet}`)).toEqual(
      [],
    );
  });

  it("REVALIDATE_ATTEMPT (ship-revalidate-dispatch rows, not step-done rows) is derived by `bkit counters rows`", () => {
    expect(names).toContain("REVALIDATE_ATTEMPT");
    const blocks = files.flatMap((f) => fencedBlocks(f.content).map((b) => b.block));
    expect(
      blocks.some((b) =>
        /\bREVALIDATE_ATTEMPT=\$\("\$BKIT" counters rows [^\n]*--type=ship-revalidate-dispatch --position=next \| jq -er \.value\) \|\| exit 2/.test(
          b,
        ),
      ),
    ).toBe(true);
  });

  it("real corpus: no counter is derived by raw jq over status.jsonl", () => {
    const hits = files.flatMap((f) =>
      fencedBlocks(f.content).flatMap(({ block }) =>
        names
          .filter((n) => new RegExp(`\\b${n}=\\$\\(\\s*jq\\b`).test(block))
          .map((n) => `${f.path} [${n}]`),
      ),
    );
    expect(hits).toEqual([]);
  });

  it("RED-PROOF: a counter derived by a raw jq length count reds the completeness rule", () => {
    const injected = [
      "```bash",
      `REVALIDATE_ATTEMPT=$(jq -s '[.[] | select(.type=="ship-revalidate-dispatch")] | length + 1' "$STATUS" 2>/dev/null)`,
      '"$BKIT" counters route --name=REVALIDATE_ATTEMPT --value="$REVALIDATE_ATTEMPT" --limit=MAX_REVALIDATE_ATTEMPT',
      "```",
    ].join("\n");
    const v = findIncompleteBlocks([{ path: "synthetic.md", content: injected }], names);
    expect(v.some((x) => x.counter === "REVALIDATE_ATTEMPT")).toBe(true);
  });

  const injectionShapes = [
    'echo "$TEST_ATTEMPT"',
    "echo $TEST_ATTEMPT",
    'echo "${TEST_ATTEMPT}"',
    '"$BKIT" steps done --step=build-run-tests --attempt="${TEST_ATTEMPT}"',
    '"$BKIT" counters route --name=TEST_ATTEMPT --value=$TEST_ATTEMPT --limit=MAX_TEST_ATTEMPT',
  ];
  for (const line of injectionShapes) {
    it(`RED-PROOF (shape): ${line} reds the rule in a non-deriving block`, () => {
      const injected = ["```bash", line, "```"].join("\n");
      const v = findIncompleteBlocks([{ path: "synthetic.md", content: injected }], names);
      expect(v.some((x) => x.counter === "TEST_ATTEMPT")).toBe(true);
    });
  }

  it("RED-PROOF: a held placeholder on a routing or row-writing flag reds the rule", () => {
    for (const line of [
      '"$BKIT" counters route --name=TEST_ATTEMPT --value="{TEST_ATTEMPT}" --limit=MAX_TEST_ATTEMPT',
      '"$BKIT" steps done --step=build-run-tests --attempt={TEST_ATTEMPT} --commit=none',
    ]) {
      const injected = ["```bash", line, "```"].join("\n");
      const v = findIncompleteBlocks([{ path: "synthetic.md", content: injected }], names);
      expect(v.some((x) => x.why.includes("held"))).toBe(true);
    }
  });

  it("RED-PROOF: deriving a DIFFERENT counter does not excuse a bare read", () => {
    const injected = [
      "```bash",
      'VERIFY_ATTEMPT=$("$BKIT" counters derive --file="$STATUS" --workflow=build --step=build-plan-verify --position=next | jq -er .value) || exit 2',
      '"$BKIT" steps done --step=build-run-tests --attempt="$TEST_ATTEMPT"',
      "```",
    ].join("\n");
    const v = findIncompleteBlocks([{ path: "synthetic.md", content: injected }], names);
    expect(v.some((x) => x.counter === "TEST_ATTEMPT")).toBe(true);
    expect(v.some((x) => x.counter === "VERIFY_ATTEMPT")).toBe(false);
  });

  it("does not flag a block deriving THEN reading its own counter, nor a $MAX_ reference", () => {
    const ok = [
      "```bash",
      'TEST_ATTEMPT=$("$BKIT" counters derive --file="$STATUS" --workflow=build --step=build-run-tests --position=current | jq -er .value) || exit 2',
      '"$BKIT" counters route --name=TEST_ATTEMPT --value="$TEST_ATTEMPT" --max="$MAX_TEST_ATTEMPT"',
      "```",
    ].join("\n");
    expect(findIncompleteBlocks([{ path: "synthetic.md", content: ok }], names)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 5. No shell arithmetic on a counter
// ---------------------------------------------------------------------------

function findCounterArithmetic(files: Corpus, names: string[]): string[] {
  const hits: string[] = [];
  for (const f of files) {
    for (const { block } of fencedBlocks(f.content)) {
      for (const m of block.matchAll(/\$\(\(([^)]*)\)\)/g)) {
        for (const name of names) {
          if (new RegExp(`\\b${name}\\b`).test(m[1]!)) hits.push(`${f.path}: ${m[0]}`);
        }
      }
    }
  }
  return hits;
}

describe("5. no $(( )) arithmetic on a counter — positions are the command's job", () => {
  it("real corpus: no counter appears inside $(( ))", () => {
    const files = realFiles();
    expect(findCounterArithmetic(files, counterNames(files))).toEqual([]);
  });

  it("RED-PROOF: the #58 off-by-one shape reds; arithmetic on a MAX_ threshold does not", () => {
    const bad = ["```bash", "DEBUG_ATTEMPT=$((DEBUG_ATTEMPT + 1))", "```"].join("\n");
    const ok = ["```bash", 'X="$((MAX_DEBUG_ATTEMPT - 1))"', "```"].join("\n");
    expect(findCounterArithmetic([{ path: "s.md", content: bad }], ["DEBUG_ATTEMPT"])).toHaveLength(
      1,
    );
    expect(findCounterArithmetic([{ path: "s.md", content: ok }], ["DEBUG_ATTEMPT"])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 6. Mapping — each block derives the RIGHT counter for its row
//
// For every block that BOTH writes a step-done row AND derives a counter, the
// derive's step must be within COUNTER_STEP_MAP[row's step]. A deriving block
// whose row-step is absent from the map reds, so the map cannot be silently
// short. It PINS the mapping; it does not prove it — the derived NUMBER is
// pinned per position in counters.test.ts.
// ---------------------------------------------------------------------------

const COUNTER_STEP_MAP: Record<string, string[]> = {
  "build-plan-verify": ["build-plan-verify"],
  "build-plan-gaps-remediate": ["build-plan-verify"],
  "build-subplan-gate": ["build-plan-verify"],
  "build-challenge": ["build-challenge-remediate"],
  "build-challenge-reconcile": ["build-challenge-remediate"],
  "build-challenge-remediate": ["build-challenge-remediate"],
  "build-run-tests": ["build-run-tests"],
  "build-failure-diagnose": ["build-run-tests"],
  "build-failure-remediate": ["build-run-tests"],
  "debug-failure-diagnose": ["debug-run-tests"],
  "debug-failure-remediate": ["debug-run-tests"],
  "debug-failure-soak": ["debug-run-tests", "debug-failure-soak"],
  "debug-push-remediation": ["debug-run-tests"],
  "ship-merge-pr": ["ship-merge-pr"],
  "ship-failure-diagnose": ["ship-merge-pr"],
  "ship-failure-remediate": ["ship-merge-pr"],
};

interface MappingViolation {
  file: string;
  rowStep: string;
  reason: string;
}

/** Blocks that write a step-done row and derive a counter: [row step, derived steps]. */
function derivingRowBlocks(files: Corpus) {
  const out: Array<{ file: string; rowStep: string; derived: string[] }> = [];
  for (const f of files) {
    for (const { block } of fencedBlocks(f.content)) {
      const rows = stepDoneLines(block);
      const derived = derivedSteps(block);
      if (rows.length === 0 || derived.length === 0) continue;
      for (const { step } of rows) out.push({ file: f.path, rowStep: step, derived });
    }
  }
  return out;
}

function findMappingViolations(files: Corpus, map: Record<string, string[]>): MappingViolation[] {
  const violations: MappingViolation[] = [];
  for (const { file, rowStep, derived } of derivingRowBlocks(files)) {
    const allowed = map[rowStep];
    if (!allowed) {
      violations.push({ file, rowStep, reason: "row-step absent from COUNTER_STEP_MAP" });
      continue;
    }
    for (const d of derived) {
      if (!allowed.includes(d)) {
        violations.push({
          file,
          rowStep,
          reason: `derived step "${d}" not in COUNTER_STEP_MAP["${rowStep}"] = [${allowed.join(", ")}]`,
        });
      }
    }
  }
  return violations;
}

describe("6. mapping — each block derives the RIGHT counter, not merely a counter", () => {
  it("real corpus: every deriving + row-writing block maps correctly", () => {
    const violations = findMappingViolations(realFiles(), COUNTER_STEP_MAP);
    expect(violations.map((v) => `${v.file} step="${v.rowStep}": ${v.reason}`)).toEqual([]);
  });

  it("the map is current: every entry is a deriving row block in the corpus", () => {
    const live = new Set(derivingRowBlocks(realFiles()).map((b) => b.rowStep));
    for (const key of Object.keys(COUNTER_STEP_MAP)) {
      expect(live, `stale COUNTER_STEP_MAP entry ${key}`).toContain(key);
    }
  });

  it("RED-PROOF: a derive pointed at the wrong step reds the rule", () => {
    const misMapped = [
      "```bash",
      'N=$("$BKIT" counters derive --file="$STATUS" --workflow=build --step=build-plan-verify --position=next | jq -er .value) || exit 2',
      '"$BKIT" steps done --file="$STATUS" --workflow=build --step=build-run-tests --attempt="$N" --message=x',
      "```",
    ].join("\n");
    expect(
      findMappingViolations([{ path: "s.md", content: misMapped }], COUNTER_STEP_MAP).length,
    ).toBeGreaterThan(0);
  });

  it("RED-PROOF: a deriving block whose row-step is absent from the map reds the rule", () => {
    const block = [
      "```bash",
      'N=$("$BKIT" counters derive --file="$STATUS" --workflow=build --step=some-new-step --position=next | jq -er .value) || exit 2',
      '"$BKIT" steps done --file="$STATUS" --workflow=build --step=some-new-row --attempt="$N" --message=x',
      "```",
    ].join("\n");
    const v = findMappingViolations([{ path: "s.md", content: block }], COUNTER_STEP_MAP);
    expect(v[0]?.reason).toMatch(/absent from COUNTER_STEP_MAP/);
  });
});

// ---------------------------------------------------------------------------
// 7. Arithmetic-injection sink — no raw status.jsonl field feeds $(( ))
//
// POSIX arithmetic re-evaluates a non-numeric operand as an expression, so a
// raw `jq -r` field read from status.jsonl (attacker-plantable, e.g.
// `"x[$(cmd)]"`) that reaches `$(( ))` EXECUTES `cmd`. `| length` counts are
// non-negative integers by construction; `tonumber?` coercion neutralises a
// raw read. Values printed by `bkit` commands are validated numbers and are
// not `$(jq` assignments, so they are out of scope here.
// ---------------------------------------------------------------------------

function findUnguardedJqIntoArithmetic(
  content: string,
): Array<{ variable: string; assignLine: string; arithSnippet: string }> {
  const ASSIGN_RE = /^\s*([A-Za-z_][A-Za-z0-9_]*)=\$\(jq\b.*\)\s*$/gm;
  const hits: Array<{ variable: string; assignLine: string; arithSnippet: string }> = [];
  for (const m of content.matchAll(ASSIGN_RE)) {
    const varName = m[1]!;
    const line = m[0];
    if (/\|\s*length\b/.test(line) || /tonumber\?/.test(line)) continue;
    const arithMatch = new RegExp(`\\$\\(\\([^)]*\\b${varName}\\b[^)]*\\)\\)`).exec(content);
    if (arithMatch) hits.push({ variable: varName, assignLine: line, arithSnippet: arithMatch[0] });
  }
  return hits;
}

describe("7. arithmetic-injection sink — no raw jq field reaches $(( ))", () => {
  it("real corpus: no raw (non-length, non-tonumber-coerced) jq extraction feeds $(( ))", () => {
    const findings = realFiles().flatMap((f) =>
      findUnguardedJqIntoArithmetic(f.content).map(
        (h) => `${f.path}: ${h.variable}\n  assign: ${h.assignLine}\n  arith:  ${h.arithSnippet}`,
      ),
    );
    expect(findings).toEqual([]);
  });

  it("RED-PROOF: fires on a raw jq -r field feeding $(( ))", () => {
    const synthetic = [
      "```bash",
      'PRIOR_X=$(jq -s -r \'[.[] | select(.workflow=="x")] | last.evil // 0\' "$SRC" 2>/dev/null || echo 0)',
      "X=$((PRIOR_X + 1))",
      "```",
    ].join("\n");
    const hits = findUnguardedJqIntoArithmetic(synthetic);
    expect(hits.map((h) => h.variable)).toEqual(["PRIOR_X"]);
  });

  it("negative controls: a `| length` count and a `(tonumber? // 0)` coercion are not flagged", () => {
    const length = [
      "```bash",
      'N=$(jq -s \'[.[] | select(.type=="workflow-started")] | length\' "$STATUS" 2>/dev/null)',
      "M=$((N + 1))",
      "```",
    ].join("\n");
    const coerced = [
      "```bash",
      "P=$(jq -s -r '(last.debugAttempt // 0) | (tonumber? // 0)' \"$SRC\" 2>/dev/null || echo 0)",
      "Q=$((P + 1))",
      "```",
    ].join("\n");
    expect(findUnguardedJqIntoArithmetic(length)).toEqual([]);
    expect(findUnguardedJqIntoArithmetic(coerced)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 8. Routing state — $DEBUG_MODE / $PUSH_MODE are read from bkit status route in-block
// ---------------------------------------------------------------------------

describe.each([
  ["DEBUG_MODE", "debugMode"],
  ["PUSH_MODE", "pushMode"],
])("8. every bash block routing on $%s reads it from bkit status route in-block", (name, field) => {
  for (const file of WORKFLOW_FILES) {
    it(`${file}: every fence expanding $${name} assigns it from status route`, () => {
      const uses = new RegExp(`\\$${name}\\b`);
      const assigned = new RegExp(
        `\\b${name}=\\$\\((?:"\\$BKIT" status route|printf '%s' "\\$ROUTE")`,
      );
      const required = new RegExp(`"\\$BKIT" status route\\b[^\\n]*--require=${field}`);
      for (const { block } of fencedBlocks(readRepo(file))) {
        if (!uses.test(block)) continue;
        expect(
          assigned.test(block) && required.test(block),
          `fence uses $${name} without reading it from status route:\n${block.slice(0, 200)}`,
        ).toBe(true);
      }
    });
  }
});
