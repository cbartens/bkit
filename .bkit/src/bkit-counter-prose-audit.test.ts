/**
 * bkit-counter-prose-audit.test.ts — WS3-T3 (#58 / #234)
 *
 * Audits workflow files to confirm:
 *   A. No bare `*_ATTEMPT`/`MAX_*` comparisons remain in non-fenced prose
 *      (i.e., the #58 prose→shell migration is complete).
 *   B. All `MAX_*` numeric constant definitions live only in bkit-counter-bus-config.sh,
 *      not inlined as literals in workflow prose.
 *
 * "Non-fenced prose" = lines that are NOT inside a triple-backtick code block.
 * The test strips fenced blocks before grepping, so counter-bus shell blocks
 * (which ARE fenced) do not false-trip.
 *
 * The comparison patterns that must NOT appear in prose (only in fenced shell):
 *   - ATTEMPT <= MAX_   (e.g. VERIFY_ATTEMPT <= MAX_VERIFY_ATTEMPT)
 *   - ATTEMPT > MAX_    (e.g. TEST_ATTEMPT > MAX_TEST_ATTEMPT)
 *   - ATTEMPT >= MAX_   (e.g. DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT)
 *   - ATTEMPT < MAX_    (e.g. SOAK_ATTEMPT < MAX_SOAK_ATTEMPT)
 *
 * MAX_* inline literal assignments that must NOT appear in workflow prose:
 *   - MAX_*_ATTEMPT = N  (where N is a numeric literal)
 *   These must only appear in bkit-counter-bus-config.sh.
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, "../..");

/**
 * Strip all fenced code blocks (``` ... ``` or wider) from a markdown string.
 *
 * bkit-debug.md nests literal ``` example blocks inside an outer fence, which
 * markdown widens to ```` (4 backticks) so the nested ``` markers don't
 * prematurely close it. The prior fixed-3-backtick regex could not match a
 * 4-backtick opener (`[\w]*` cannot consume the 4th backtick, so `\n` never
 * follows), leaving those blocks' real shell — including legitimately-fenced
 * `$DEBUG_ATTEMPT` derives — unstripped and mis-reported as bare prose. The
 * backreference below requires the SAME backtick count on open and close, so
 * a 4-backtick outer fence closes only on another 4-backtick line, correctly
 * skipping over any nested 3-backtick markers in between.
 */
function stripFencedBlocks(content: string): string {
  return content.replace(/^([ \t]*)(`{3,})[\w]*\n[\s\S]*?^[ \t]*\2[ \t]*$/gm, "");
}

/** Read a file relative to REPO_ROOT; return empty string if missing. */
function readWorkflow(rel: string): string {
  const p = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf-8");
}

// ---------------------------------------------------------------------------
// Workflow files to audit
// ---------------------------------------------------------------------------

const WORKFLOW_FILES = [
  ".bkit/workflows/bkit-build.md",
  ".bkit/workflows/bkit-debug.md",
  ".bkit/workflows/bkit-plan.md",
  ".bkit/workflows/bkit-design.md",
  ".bkit/workflows/bkit-ship.md",
];

// ---------------------------------------------------------------------------
// Patterns that must NOT appear in non-fenced prose
// ---------------------------------------------------------------------------

/**
 * #58 T5.1 — widened bare-`*_ATTEMPT`-token audit (sub-plan 2).
 *
 * Supersedes the vacuous ATTEMPT_COMPARISON_PATTERN / MAX_LITERAL_DEFINITION_PATTERN
 * below (deleted): `\bATTEMPT\b` cannot match inside `VERIFY_ATTEMPT` (the
 * preceding `_` is a word character, so there is no word boundary before
 * "ATTEMPT") — the shipped patterns matched NOTHING in the real corpus (#58
 * Breaking Changes item 6). This rule bans ANY bare `*_ATTEMPT` token
 * reference in prose — assignment, increment, reset, comparison, all of
 * them name the counter bare — exempting only:
 *   (a) `{X_ATTEMPT}` brace placeholders NOT preceded by `$` (a substitution
 *       token the orchestrator fills in, never a computation), and
 *   (b) bare `MAX_*_ATTEMPT` constant NAMES (pointing at the config, no
 *       value of their own).
 * `${X_ATTEMPT}` (a `$`-prefixed brace expansion — a VALUE reference) is
 * explicitly NOT exempt: 48 such shell expansions exist in the corpus, and
 * an exemption written as "`{X_ATTEMPT}` is allowed" would silently exempt
 * every one of them (#58 Breaking Changes item 5). The negative-lookbehind
 * on `$` is what keeps the two apart.
 */
function findBareAttemptTokenViolations(content: string): Array<{ line: number; text: string }> {
  const prose = stripFencedBlocks(content);
  const lines = prose.split("\n");
  const hits: Array<{ line: number; text: string }> = [];
  const placeholderExempt = /(?<!\$)\{[A-Z][A-Z0-9_]*_ATTEMPT\}/g;
  const maxNameExempt = /\bMAX_[A-Z0-9_]*_ATTEMPT\b/g;
  const bareToken = /\b[A-Z][A-Z0-9_]*_ATTEMPT\b/;
  lines.forEach((l, i) => {
    const masked = l.replace(placeholderExempt, "").replace(maxNameExempt, "");
    if (bareToken.test(masked)) {
      hits.push({ line: i + 1, text: l.trim() });
    }
  });
  return hits;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("#58 T5.1: no bare *_ATTEMPT token reference in workflow prose (assignment, increment, reset, comparison — all of it)", () => {
  for (const wfFile of WORKFLOW_FILES) {
    it(`${wfFile}: no bare *_ATTEMPT token in non-fenced prose`, () => {
      const content = readWorkflow(wfFile);
      if (!content) {
        // File not found — not a failure here, missing files are caught by other tests.
        return;
      }
      const hits = findBareAttemptTokenViolations(content);
      if (hits.length > 0) {
        const lines = hits.map((h) => `  line ~${h.line}: ${h.text.slice(0, 120)}`).join("\n");
        expect.fail(
          `[bkit-counter-prose-audit] ${wfFile} has bare *_ATTEMPT token references in prose:\n${lines}\n` +
            `→ EXPECTED RED until 58-workflow-counters-plan-3.md's T4.1 removes the substitution ` +
            `prose (Init counters:/Increment X + 1/Set X = 0/Run-only-if headers). Captured to ` +
            `prose-violations.txt as T4.1's removal worklist — do NOT delete prose here (sub-plan 2 ` +
            `is gated on Gate 2b before that is safe).\n→ Move these into fenced shell blocks using ` +
            `bkit-counter-bus.sh.`,
        );
      }
      expect(hits.length).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// #58 T5.1 — negative control. The shipped ATTEMPT_COMPARISON_PATTERN /
// MAX_LITERAL_DEFINITION_PATTERN matched NOTHING in the real corpus (no word
// boundary before "ATTEMPT" inside "X_ATTEMPT" — Breaking Changes item 6).
// This proves the widened rule actually FIRES on known-bad shapes, including
// the two cases the plan's own review added: `${TEST_ATTEMPT}` (a $-prefixed
// value reference) must be CAUGHT, not silently exempted by the placeholder
// rule, and the reversed-operand form ("SOAK_ATTEMPT reset to 0") must be
// caught too.
// ---------------------------------------------------------------------------
describe("#58 T5.1: negative control — the widened pattern fires on known-bad lines and exempts only true placeholders", () => {
  const knownBad = [
    "Init counters: `VERIFY_ATTEMPT` = 0",
    "Increment `TEST_ATTEMPT` + 1",
    "`CHALLENGE_REMEDIATE_ATTEMPT` < 1",
    "`NORMAL_ATTEMPT` > 1",
    "`SOAK_ATTEMPT` reset to 0",
    "cost `${TEST_ATTEMPT}` in prose",
  ];
  for (const line of knownBad) {
    it(`fires on: ${line}`, () => {
      expect(findBareAttemptTokenViolations(line).length).toBeGreaterThan(0);
    });
  }

  it("does NOT fire on a bare {VERIFY_ATTEMPT} placeholder", () => {
    expect(findBareAttemptTokenViolations("Attempt: {VERIFY_ATTEMPT}").length).toBe(0);
  });

  it("does NOT fire on a bare MAX_TEST_ATTEMPT constant name", () => {
    expect(findBareAttemptTokenViolations("Bounded by MAX_TEST_ATTEMPT.").length).toBe(0);
  });
});

// Template-relative by default (#58 T2.0) — see tests/counter-bus.bats for
// why: every code task edits .bkit/templates/.bkit/scripts/, and
// `bkit install` (which produces the installed .bkit/scripts/ mirror) runs
// exactly ONCE, at T8.3. Overrides keep the RED-vs-dev proof working.
const TEMPLATE_SCRIPTS = path.join(REPO_ROOT, ".bkit/templates/.bkit/scripts");

describe("WS3-T3: bkit-counter-bus-config.sh — all MAX_* constants are defined", () => {
  const configPath =
    process.env.BKIT_COUNTER_CONFIG ?? path.join(TEMPLATE_SCRIPTS, "bkit-counter-bus-config.sh");
  const configContent = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";
  // Dynamically enumerated from the config file itself — NOT a hardcoded
  // list. The draft's hardcoded EXPECTED_CONSTANTS listed 6 of the 7 real
  // MAX_* constants, omitting exactly MAX_CHALLENGE_REMEDIATE_ATTEMPT — the
  // one that is dead (#58 Breaking Changes item 6 / constraint 6). A
  // hand-list cannot have a blind spot that happens to be exactly the
  // defect; a rule derived from the config itself can.
  const DISCOVERED_CONSTANTS = Array.from(configContent.matchAll(/^(MAX_\w+)=\d/gm)).map(
    (m) => m[1],
  );

  it("bkit-counter-bus-config.sh exists", () => {
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it("discovers at least one MAX_* constant (enumeration is not vacuous)", () => {
    expect(DISCOVERED_CONSTANTS.length).toBeGreaterThan(0);
  });

  for (const constant of DISCOVERED_CONSTANTS) {
    it(`bkit-counter-bus-config.sh defines ${constant}`, () => {
      expect(configContent).toMatch(new RegExp(`^${constant}=\\d`, "m"));
    });
  }
});

// ---------------------------------------------------------------------------
// #58 T5.2 — no-dead-constant rule
//
// Every MAX_* constant defined in bkit-counter-bus-config.sh must be
// REFERENCED (>=1 time, inside a fenced shell block) somewhere across the
// workflow corpus. Enumerated dynamically from the config file — replaces
// the hardcoded EXPECTED_CONSTANTS list above, which named 6 of the 7 real
// constants and silently omitted MAX_CHALLENGE_REMEDIATE_ATTEMPT (the dead
// one — #58 Breaking Changes item 6).
//
// EXPECTED RED, recorded honestly: MAX_CHALLENGE_REMEDIATE_ATTEMPT is
// referenced NOWHERE in a fenced block today — the real gate at
// bkit-build.md's Step 10/11 is a prose comparison against the hardcoded
// literal `1`, not this constant. That reference is added by sub-plan 2's
// T3.3 (`58-workflow-counters-plan-2.md`), which converts the
// challenge-remediate site to a fenced derive. Until then this rule is
// legitimately RED for exactly that one constant. Sub-plan 2's Gate 2b
// re-runs this rule's full Done-when (including the delete-the-reference
// red-proof) once T3.3 has landed. DO NOT hardcode a list, add an exemption,
// or add the missing reference here to force this test green — that would
// either reproduce the blind spot this task exists to delete, or ship T3.3's
// work early on the wrong side of the KN-26 seam.
// ---------------------------------------------------------------------------

describe("#58 T5.2: no MAX_* constant is left unreferenced (dead) in the workflow corpus", () => {
  const configPath =
    process.env.BKIT_COUNTER_CONFIG ?? path.join(TEMPLATE_SCRIPTS, "bkit-counter-bus-config.sh");
  const configContent = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";
  const constants = Array.from(configContent.matchAll(/^(MAX_\w+)=\d/gm)).map((m) => m[1]);

  /** Count references to `name` inside FENCED blocks only, across all workflow files. */
  function fencedReferenceCount(name: string): number {
    let count = 0;
    for (const wf of WORKFLOW_FILES) {
      const content = readWorkflow(wf);
      if (!content) continue;
      const fencedBlockRe = /(`{3,})[\w]*\n([\s\S]*?)\1/g;
      for (const m of content.matchAll(fencedBlockRe)) {
        const re = new RegExp(`\\b${name}\\b`);
        if (re.test(m[2])) count += (m[2].match(new RegExp(`\\b${name}\\b`, "g")) ?? []).length;
      }
    }
    return count;
  }

  it("enumerates all MAX_* constants dynamically (no hardcoded list)", () => {
    expect(constants.length).toBeGreaterThan(0);
    expect(constants).toContain("MAX_CHALLENGE_REMEDIATE_ATTEMPT");
  });

  for (const constant of constants) {
    it(`${constant} is referenced >=1 time inside a fenced block across the workflow corpus`, () => {
      const count = fencedReferenceCount(constant);
      if (count === 0 && constant === "MAX_CHALLENGE_REMEDIATE_ATTEMPT") {
        // EXPECTED RED until sub-plan 2's T3.3 lands the reference — see the
        // comment above this describe block. Recorded via expect.fail with a
        // clear message rather than silently skipped, so a CI run surfaces
        // the exact reason rather than a bare assertion failure.
        expect.fail(
          "EXPECTED RED (#58 sub-plan 1, carried to sub-plan 2's Gate 2b): " +
            "MAX_CHALLENGE_REMEDIATE_ATTEMPT is not yet referenced in any fenced block. " +
            "The reference is added by sub-plan 2's T3.3 (58-workflow-counters-plan-2.md), " +
            "which converts the challenge-remediate site from a prose comparison against " +
            "the hardcoded literal `1` to a fenced derive. Do not hardcode, exempt, or add " +
            "the reference here to force this green.",
        );
      }
      expect(count).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// #58 T2.6 — Corpus audit of the commit-cadence invariant
//
// For every COUNTED step (a step read by a counter_next/counter_current/
// counter_count derive call somewhere in the corpus), its row-writing block
// must EITHER commit in-block (`git commit --allow-empty`) OR appear on an
// explicit, commented transitive-exemption list. Today that list contains
// exactly `debug-run-tests`, whose `parentSha` advances transitively via
// bkit-debug.md Steps 4/5/6 — KN-26 deliberately removed its own commit so
// a `chore(...)` HEAD does not make the Vercel-ignore regex skip the preview.
//
// The DRAFT's version of this task asserted "git commit --allow-empty
// advances HEAD in a temp repo" — a property of git, which cannot fail and
// cannot detect the one real gap in the corpus. This audit instead inspects
// the CORPUS: does the row-writing block for a counted step actually commit,
// or is it deliberately, explicitly exempted?
//
// Sequencing note (per #58 sub-plan 1): no `counter_next`/`counter_current`/
// `counter_count` call exists in the real corpus until sub-plan 2's WS-3
// converts a call site. Against today's tree the enumeration below is
// therefore legitimately EMPTY and this describe block's corpus test passes
// vacuously — that is expected, not a bug, and is re-run (non-vacuously)
// against the real corpus at sub-plan 2's Gate 2b.
//
// The two red-proofs the Done-when requires ("removing debug-run-tests from
// the exemption list reds it"; "adding a fake counted step with no commit
// and no exemption reds it") are exercised here WITHOUT mutating any file on
// disk: the scanning function is exercised directly against synthetic
// corpus content built from the real `debug-run-tests` block (which today
// genuinely has no in-block commit — KN-26), with a derive call injected in
// memory. This is equivalent in rigor to a temporary file edit + restore,
// without the risk of leaving a real workflow file inconsistent if a test
// run is interrupted.
// ---------------------------------------------------------------------------

interface ExemptionEntry {
  step: string;
  reason: string;
}

// The corpus's only transitive exemption today (constraint #58 Breaking
// Changes item 10c / KN-26): debug-run-tests never commits in-block; its
// parentSha advances via bkit-debug.md Steps 4/5/6 instead.
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

const DERIVE_CALL_PATTERN = /\bcounter_(?:next|current|count)\s+"[^"]+"\s+\S+\s+([A-Za-z][\w-]*)/g;

// Loose presence check — any invocation of the three derive functions at
// all, in any argument shape — used ONLY as a non-vacuity guard (G2, see the
// describe block below). It must NOT be tightened into the extraction
// pattern itself: DERIVE_CALL_PATTERN's job is to name the counted step,
// this one's job is only to notice "a derive call exists somewhere that the
// naming pattern didn't capture".
const DERIVE_CALL_PRESENCE = /\bcounter_(?:next|current|count)\b/;

/** Extract the set of step names read by a derive call anywhere in content. */
function findCountedSteps(content: string): Set<string> {
  const steps = new Set<string>();
  for (const m of content.matchAll(DERIVE_CALL_PATTERN)) {
    steps.add(m[1]);
  }
  return steps;
}

/**
 * For a given step name, find its row-writing fenced block (the block
 * containing a `step:"NAME"` or `step:'NAME'` step-done write) and report
 * whether that same block also runs `git commit --allow-empty`.
 * Returns null if no row-writing block for that step is found in content.
 */
function stepCommitsInBlock(content: string, step: string): boolean | null {
  const fencedBlockRe = /(`{3,})[\w]*\n([\s\S]*?)\1/g;
  const stepWriteRe = new RegExp(`step\\s*:\\s*["']${step}["']`);
  for (const m of content.matchAll(fencedBlockRe)) {
    const block = m[2];
    if (stepWriteRe.test(block)) {
      return /git commit --allow-empty/.test(block);
    }
  }
  return null;
}

interface Violation {
  step: string;
  reason: string;
}

/**
 * Audit every counted step across the given files: it must either commit
 * in-block or be on the exemptions list. Steps found nowhere (no row-write
 * block located) are reported as a distinct violation reason so a typo in a
 * derive call cannot silently pass.
 */
function auditCountedSteps(
  files: Array<{ path: string; content: string }>,
  exemptions: ExemptionEntry[],
): Violation[] {
  const violations: Violation[] = [];
  const exemptSteps = new Set(exemptions.map((e) => e.step));
  const allCounted = new Set<string>();
  for (const f of files) {
    for (const step of findCountedSteps(f.content)) allCounted.add(step);
  }
  for (const step of allCounted) {
    let commits: boolean | null = null;
    for (const f of files) {
      const result = stepCommitsInBlock(f.content, step);
      if (result !== null) {
        commits = result;
        break;
      }
    }
    if (commits === null) {
      violations.push({ step, reason: "no row-writing block found for counted step" });
      continue;
    }
    if (!commits && !exemptSteps.has(step)) {
      violations.push({
        step,
        reason:
          "row-writing block has no in-block commit and is not on the transitive-exemption list",
      });
    }
  }
  return violations;
}

describe("#58 T2.6: corpus audit of the commit-cadence invariant (row-counting depends on parentSha advancing)", () => {
  const realFiles = WORKFLOW_FILES.map((p) => ({ path: p, content: readWorkflow(p) })).filter(
    (f) => f.content !== "",
  );

  it("real corpus: every counted step (enumerated from derive call sites, not a hardcoded list) commits in-block or is exempted", () => {
    const violations = auditCountedSteps(realFiles, TRANSITIVE_EXEMPTIONS);
    if (violations.length > 0) {
      expect.fail(
        `Counted steps with no commit and no exemption:\n${violations
          .map((v) => `  ${v.step}: ${v.reason}`)
          .join("\n")}`,
      );
    }
    // Expected to be vacuously empty until sub-plan 2's WS-3 adds real derive
    // call sites to the corpus — see the sequencing note above this describe.
    expect(violations.length).toBe(0);
  });

  it("(G2) non-vacuity guard: if the corpus contains ANY derive-function call, DERIVE_CALL_PATTERN must have named at least one counted step", () => {
    // Today, correctly, both sides are zero — sub-plan 2's WS-3 has not
    // landed. This guard exists so that once WS-3 does land, a grammar
    // mismatch (e.g. a quoted step argument DERIVE_CALL_PATTERN does not
    // match) reds HERE — loudly and specifically — instead of the audit
    // above staying vacuously green forever with no one told. See the
    // RED-PROOF below for evidence this actually fires on a mismatch.
    const anyPresence = realFiles.some((f) => DERIVE_CALL_PRESENCE.test(f.content));
    const anyNamed = realFiles.some((f) => {
      DERIVE_CALL_PATTERN.lastIndex = 0;
      return DERIVE_CALL_PATTERN.test(f.content);
    });
    if (anyPresence && !anyNamed) {
      expect.fail(
        "The real corpus contains at least one counter_next/counter_current/counter_count " +
          "call, but DERIVE_CALL_PATTERN named zero counted steps from it — the audit above " +
          "is now vacuously green while auditing nothing. Update DERIVE_CALL_PATTERN to match " +
          "the shape sub-plan 2's WS-3 actually shipped (do not just re-widen it blindly — " +
          "confirm what shape landed first), then re-run T2.6's Done-when in full.",
      );
    }
    expect(anyPresence).toBe(anyNamed);
  });

  it("(G2) RED-PROOF: a derive call in a shape DERIVE_CALL_PATTERN does not match trips the non-vacuity guard (synthetic corpus)", () => {
    // A quoted step argument — a plausible shape a future author could pick
    // — that DERIVE_CALL_PATTERN (unquoted \S+ third group) does not match.
    const mismatchedShape = [
      "```bash",
      'counter_next "$STATUS" build "build-run-tests"',
      "```",
    ].join("\n");
    const presence = DERIVE_CALL_PRESENCE.test(mismatchedShape);
    DERIVE_CALL_PATTERN.lastIndex = 0;
    const named = DERIVE_CALL_PATTERN.test(mismatchedShape);
    expect(presence).toBe(true);
    expect(named).toBe(false);
    // This is exactly the (anyPresence && !anyNamed) condition the guard
    // above fails on — proving it is not vacuous itself.
  });

  it("transitive-exemption list names debug-run-tests with a KN-26 comment", () => {
    const entry = TRANSITIVE_EXEMPTIONS.find((e) => e.step === "debug-run-tests");
    expect(entry).toBeDefined();
    expect(entry?.reason).toMatch(/KN-26/);
  });

  it("RED-PROOF: removing debug-run-tests from the exemption list reds the audit (synthetic corpus, no file mutation)", () => {
    const debugContent = readWorkflow(".bkit/workflows/bkit-debug.md");
    expect(debugContent).not.toBe("");
    // Inject a derive call for debug-run-tests into the SAME fenced block
    // that writes its row (which today genuinely has no commit — KN-26).
    const injected = debugContent.replace(
      /(step:\s*"debug-run-tests"[\s\S]*?>>\s*"\$STATUS")/,
      '$1\n   counter_next "$STATUS" debug debug-run-tests',
    );
    expect(injected).not.toBe(debugContent);
    const files = [{ path: ".bkit/workflows/bkit-debug.md", content: injected }];

    // With the real exemption list: no violation (exempted).
    const withExemption = auditCountedSteps(files, TRANSITIVE_EXEMPTIONS);
    expect(withExemption).toEqual([]);

    // Remove debug-run-tests from the exemption list (temporary, in-memory
    // only — nothing on disk is touched, so there is nothing to "restore").
    const withoutExemption = auditCountedSteps(
      files,
      TRANSITIVE_EXEMPTIONS.filter((e) => e.step !== "debug-run-tests"),
    );
    expect(withoutExemption.length).toBeGreaterThan(0);
    expect(withoutExemption.some((v) => v.step === "debug-run-tests")).toBe(true);
  });

  it("RED-PROOF: a fake counted step with no commit and no exemption reds the audit", () => {
    const fakeBlock = [
      "```bash",
      'jq -nc \'{type:"step-done", workflow:"build", step:"fake-counted-step", status:"DONE"}\' >> "$STATUS"',
      'counter_next "$STATUS" build fake-counted-step',
      "```",
    ].join("\n");
    const files = [{ path: "synthetic.md", content: fakeBlock }];
    const violations = auditCountedSteps(files, TRANSITIVE_EXEMPTIONS);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.step === "fake-counted-step")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// #58 T5.3 — completeness rule (sub-plan 2)
//
// The ONLY artifact in this plan that can see inside a fenced block, and
// therefore the only one that can detect an unconverted call site (#58
// Breaking Changes item 10a). A hand-enumerated site list is not authority
// here — this rule is; T3.0's worklist is this rule's captured RED output.
//
// Scope decision (documented, not silent — corrected in gap remediation,
// build-plan-gaps-remediate-2-1): a block "references" a counter when it
// contains ANY `$`-prefixed reference to the counter's name — bare `$NAME`,
// braced `${NAME}`, quoted `"$NAME"`/`"${NAME}"`, in any position (comparison,
// `--argjson` payload, filename interpolation, commit-subject interpolation).
// The PRIOR version of this rule matched only the exact double-quoted bare
// form `"$NAME"` and was empirically proven (build-plan-verify-2-1.md) to
// escape four real shapes, including the literal `--argjson a "${X_ATTEMPT}"`
// defect #58 was filed against. A prior draft of this comment tried to carve
// out an exemption for brace-form filename/comment interpolation citing the
// #58 Edge Cases row ("Orchestrator mis-transcribes a derived value into a
// filename / comment ... routing is unaffected — it re-derives. attempt is
// telemetry-only by contract") — but that same draft's exemption ALSO
// silently covered the JSON-typed `attempt` field shape, which DOES affect
// control-flow-adjacent state and is exactly the escaping class. The
// narrowing was not sound on its own terms and has been removed: `${NAME}`
// is NEVER exempt, in any position, including pure filename interpolation —
// if a block emits a filename containing `${DEBUG_ATTEMPT}`, that block must
// derive `DEBUG_ATTEMPT` itself (shell state does not survive between
// orchestrator Bash calls; a shell variable used without being set in the
// same block is model-authored, which is the #58 defect regardless of what
// the value is used for).
//
// Genuinely exempt, and ONLY these two (per #58 Breaking Changes item 5 /
// T5.1's placeholder criterion, carried over unchanged from the prose rule):
//   (a) a bare `{NAME}` brace placeholder with NO `$` — the orchestrator's
//       own prose-substitution token, never a shell reference at all (these
//       do not match the `$`-anchored regex below, so no special-casing is
//       needed for them here); and
//   (b) a bare `MAX_NAME` constant NAME — never `$`-prefixed as a bare
//       reference to a counter's own value (a `$MAX_NAME` shell expansion of
//       the ceiling is a different identifier than `name` and does not match
//       this regex either, since `$` is not immediately adjacent to `name`).
// ---------------------------------------------------------------------------

const COUNTER_NAMES = [
  "VERIFY_ATTEMPT",
  "TEST_ATTEMPT",
  "CHALLENGE_REMEDIATE_ATTEMPT",
  "DEBUG_ATTEMPT",
  "NORMAL_ATTEMPT",
  "SOAK_ATTEMPT",
  "MERGE_ATTEMPT",
];

/**
 * Bound to `name`, not merely "any derive call exists in this block" — the
 * PRIOR version returned true whenever ANY counter's derive call appeared
 * anywhere in the block, so a block deriving CHALLENGE_REMEDIATE_ATTEMPT
 * could excuse a bare, undived read of VERIFY_ATTEMPT in the same block
 * (empirically proven, build-plan-verify-2-1.md gap 2). The derive/re-derive
 * shape used at every real site is `NAME=$(counter_next|current|count ...)`
 * — an explicit assignment of the counter's OWN shell variable — so binding
 * on the assignment target is precise, not a heuristic.
 */
function blockDerivesCounter(block: string, name: string): boolean {
  if (name === "DEBUG_ATTEMPT") {
    // DEBUG_ATTEMPT is not step-keyed — it is an invocation index derived
    // from the inline cross-run fold (copied, not moved, from :184-185),
    // never a counter_next/current/count call. Two real shapes exist: the
    // two-line `PRIOR_DEBUG_ATTEMPT=$(...); DEBUG_ATTEMPT=$((PRIOR...+1))`
    // form (derive-at-START / marker-write sites) and the one-line
    // `DEBUG_ATTEMPT=$(...last.debugAttempt...)` form (no +1 — the marker
    // already recorded this invocation; :636). Both require an assignment
    // TARGET named DEBUG_ATTEMPT to exist alongside the fold expression in
    // the same block — bound to this counter, not any other block's fold.
    return (
      /\bDEBUG_ATTEMPT\s*=/.test(block) &&
      // `\(?` tolerates the #58 build-challenge-remediate arithmetic-
      // injection fix, which wraps the raw field read in a jq-side
      // `(last.debugAttempt // 0) | (tonumber? // 0)` coercion at the 3
      // PRE-marker sites — the fold expression shape is otherwise unchanged.
      /\.workflow=="debug"\)\s*\]\s*\|\s*\(?\s*last\.debugAttempt/.test(block)
    );
  }
  const deriveAssign = new RegExp(`\\b${name}\\s*=\\s*\\$\\(\\s*counter_(?:next|current|count)\\b`);
  return deriveAssign.test(block);
}

interface CompletenessViolation {
  file: string;
  counter: string;
  snippet: string;
}

function findIncompleteBlocks(
  files: Array<{ path: string; content: string }>,
): CompletenessViolation[] {
  const violations: CompletenessViolation[] = [];
  const fencedBlockRe = /(`{3,})[\w]*\n([\s\S]*?)\1/g;
  for (const f of files) {
    for (const m of f.content.matchAll(fencedBlockRe)) {
      const block = m[2];
      for (const name of COUNTER_NAMES) {
        // Widened: any `$`-prefixed reference to `name`, braced or bare,
        // quoted or not — `$NAME`, `${NAME}`, `"$NAME"`, `"${NAME}"` all
        // match. The `$` (optionally followed by `{`) must be IMMEDIATELY
        // adjacent to `name`, so `$MAX_NAME` / `${MAX_NAME}` never match
        // (there is no `$` directly before the counter's own name in a
        // MAX_-prefixed constant reference — "MAX_" intervenes). See the
        // scope-decision comment above this describe block for the full
        // gap-remediation record of why the prior exact-quoted-bare-form
        // regex escaped four real shapes.
        const references = new RegExp(`\\$\\{?${name}\\}?\\b`).test(block);
        if (references && !blockDerivesCounter(block, name)) {
          violations.push({ file: f.path, counter: name, snippet: block.slice(0, 160) });
        }
      }
    }
  }
  return violations;
}

describe("#58 T5.3: completeness rule — no fenced block reads a bare *_ATTEMPT it does not itself derive", () => {
  const realFiles = WORKFLOW_FILES.map((p) => ({ path: p, content: readWorkflow(p) })).filter(
    (f) => f.content !== "",
  );

  it("real corpus: every fenced block that references a counter also derives it in-block (CI_ATTEMPTS exempt by name — loop-local, assigned and consumed inside one block, never crosses a process boundary)", () => {
    const violations = findIncompleteBlocks(realFiles);
    if (violations.length > 0) {
      const lines = violations
        .map((v) => `  ${v.file} [${v.counter}]:\n    ${v.snippet.split("\n").join("\n    ")}`)
        .join("\n");
      expect.fail(
        `Unconverted sites (bare counter reference with no in-block derive) — this is T3.0's ` +
          `worklist, regenerated:\n${lines}`,
      );
    }
    expect(violations.length).toBe(0);
  });

  it("RED-PROOF: re-introducing a bare $TEST_ATTEMPT read into a converted-shape block reds the rule (synthetic corpus, no file mutation)", () => {
    const regressed = [
      "```bash",
      'decide_next TEST_ATTEMPT "$TEST_ATTEMPT" "$MAX_TEST_ATTEMPT" step-14 failure-path',
      "```",
    ].join("\n");
    const violations = findIncompleteBlocks([{ path: "synthetic.md", content: regressed }]);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.counter === "TEST_ATTEMPT")).toBe(true);
  });

  // ---------------------------------------------------------------------
  // Per-shape RED-PROOFS (gap remediation, build-plan-gaps-remediate-2-1):
  // build-plan-verify-2-1.md empirically proved the PRIOR exact-quoted-
  // bare-form regex (`"\$NAME"` only) escaped four of six injected shapes
  // into a real non-deriving fenced block. Each shape below is reproduced
  // here permanently, as a synthetic-corpus injection (no file mutation),
  // so this rule's fix cannot silently regress to the narrow form. A block
  // with NO derive call at all is used, so each test is a direct proof that
  // the reference regex itself fires on the shape — not an artifact of
  // `blockDerivesCounter` failing to bind.
  // ---------------------------------------------------------------------
  const injectionShapes: Array<{ label: string; line: string }> = [
    {
      label: 'echo "$TEST_ATTEMPT" (quoted bare — the one shape the prior regex caught)',
      line: 'echo "$TEST_ATTEMPT"',
    },
    { label: "echo $TEST_ATTEMPT (unquoted bare)", line: "echo $TEST_ATTEMPT" },
    { label: 'echo "${TEST_ATTEMPT}" (quoted braced)', line: 'echo "${TEST_ATTEMPT}"' },
    {
      label:
        'jq -nc --argjson a "${TEST_ATTEMPT}" >> "$STATUS" (the literal #58 defect, written with braces)',
      line: 'jq -nc --argjson a "${TEST_ATTEMPT}" >> "$STATUS"',
    },
    {
      label: 'jq -nc --argjson a $TEST_ATTEMPT >> "$STATUS" (unquoted braceless argjson payload)',
      line: 'jq -nc --argjson a $TEST_ATTEMPT >> "$STATUS"',
    },
  ];

  for (const { label, line } of injectionShapes) {
    it(`RED-PROOF (shape): ${label} reds the rule in a non-deriving block (synthetic corpus)`, () => {
      const injected = ["```bash", line, "```"].join("\n");
      const violations = findIncompleteBlocks([{ path: "synthetic.md", content: injected }]);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some((v) => v.counter === "TEST_ATTEMPT")).toBe(true);
    });
  }

  it("RED-PROOF (shape): a bare $TEST_ATTEMPT read inside a block that derives a DIFFERENT counter (VERIFY_ATTEMPT) still reds — blockDerivesCounter is bound per-counter, not 'any derive excuses all' (synthetic corpus)", () => {
    const injected = [
      "```bash",
      'VERIFY_ATTEMPT=$(counter_next "$STATUS" build build-plan-verify --sub-plan "$SUB_PLAN") || exit 2',
      'jq -nc --argjson a "$TEST_ATTEMPT" >> "$STATUS"',
      "```",
    ].join("\n");
    const violations = findIncompleteBlocks([{ path: "synthetic.md", content: injected }]);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.counter === "TEST_ATTEMPT")).toBe(true);
    // VERIFY_ATTEMPT itself must NOT be flagged — it genuinely derives.
    expect(violations.some((v) => v.counter === "VERIFY_ATTEMPT")).toBe(false);
  });

  it("does not flag a MAX_TEST_ATTEMPT reference as a TEST_ATTEMPT violation (MAX_ prefix breaks $-adjacency)", () => {
    const block = [
      "```bash",
      'decide_next TEST_ATTEMPT "$TEST_ATTEMPT" "$MAX_TEST_ATTEMPT" step-14 failure-path',
      "```",
    ].join("\n");
    // Only a genuine derive makes this fully green; here we just assert the
    // MAX_ reference itself is never independently counted as a bare
    // TEST_ATTEMPT hit distinct from the real (expected) violation above.
    const violations = findIncompleteBlocks([{ path: "synthetic.md", content: block }]);
    // Exactly one TEST_ATTEMPT violation (from "$TEST_ATTEMPT"), not two
    // (i.e. "$MAX_TEST_ATTEMPT" was not separately matched as TEST_ATTEMPT).
    expect(violations.filter((v) => v.counter === "TEST_ATTEMPT").length).toBe(1);
  });

  it("does not flag a block deriving THEN reading its own counter", () => {
    const ok = [
      "```bash",
      'TEST_ATTEMPT=$(counter_next "$STATUS" build build-run-tests) || exit 2',
      'decide_next TEST_ATTEMPT "$TEST_ATTEMPT" "$MAX_TEST_ATTEMPT" step-14 failure-path',
      "```",
    ].join("\n");
    const violations = findIncompleteBlocks([{ path: "synthetic.md", content: ok }]);
    expect(violations.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// #58 build-plan-verify-2-2 regression — DEBUG_ATTEMPT pre/post-marker
// arithmetic (the off-by-one T5.3/T5.4 cannot see, per plan line 291: "valid
// JSON, wrong number, green T5.3").
//
// `:366` (bkit-debug.md, Step 2 Worktree Setup) writes the `workflow-meta
// debugAttempt` marker carrying THIS invocation's N. Every fenced block that
// re-derives DEBUG_ATTEMPT from the cross-run fold (`last.debugAttempt`)
// must use `+ 1` if it runs BEFORE that marker write (the fold still
// reflects the PRIOR invocation), and must NOT use `+ 1` if it runs AFTER
// (the fold already reflects THIS invocation). T5.3 only checks that a
// derive exists in-block; T5.4's map is step-keyed and DEBUG_ATTEMPT is
// exempt from it by name (see blockDerivesCounter). Neither can catch an
// in-block derive that is present, bound to the right counter, AND still
// arithmetically wrong — which is exactly what build-plan-verify-2-2.md
// found: all 6 newly-converted post-marker sites carried a stray `+ 1`.
//
// This is a REAL-CORPUS positional check (not a synthetic fixture): every
// fold-deriving fenced block in the real bkit-debug.md is classified by
// whether its start offset in the file precedes or follows the marker-write
// line, and its `+ 1` usage is asserted against that classification.
// ---------------------------------------------------------------------------

describe("#58 DEBUG_ATTEMPT off-by-one regression: every cross-run-fold derive site's +1 usage matches its position relative to the :366 marker write", () => {
  const debugContent = readWorkflow(".bkit/workflows/bkit-debug.md");
  const markerRe = /--argjson da "\$DEBUG_ATTEMPT"[\s\S]*?debugAttempt:\$da/;
  const markerMatch = markerRe.exec(debugContent);
  const markerIndex = markerMatch ? markerMatch.index : -1;
  const fencedBlockRe = /(`{3,})[\w]*\n([\s\S]*?)\1/g;
  const foldBlocks: Array<{ start: number; block: string }> = [];
  for (const m of debugContent.matchAll(fencedBlockRe)) {
    if (/last\.debugAttempt/.test(m[2]) && m.index !== undefined) {
      foldBlocks.push({ start: m.index, block: m[2] });
    }
  }
  const plusOneRe = /DEBUG_ATTEMPT\s*=\s*\$\(\(\s*PRIOR_DEBUG_ATTEMPT\s*\+\s*1\s*\)\)/;

  it("sanity: bkit-debug.md found, marker-write line found exactly once, and all 10 real fold-derive sites are located (3 pre-marker + 7 post-marker) — this test cannot silently see zero blocks", () => {
    expect(debugContent.length).toBeGreaterThan(0);
    expect(markerIndex).toBeGreaterThan(-1);
    expect(foldBlocks.length).toBe(10);
  });

  it("every PRE-marker fold-derive block (runs before :366) uses the +1 form — the fold still reflects the PRIOR invocation there", () => {
    const preMarkerBlocks = foldBlocks.filter((f) => f.start < markerIndex);
    expect(preMarkerBlocks.length).toBe(3);
    for (const { start, block } of preMarkerBlocks) {
      if (!plusOneRe.test(block)) {
        expect.fail(
          `Pre-marker fold-derive block at file offset ${start} does not use the '+ 1' form — ` +
            `it runs before the debugAttempt marker write, so the fold returns the PRIOR ` +
            `invocation's value and +1 is required:\n${block.slice(0, 200)}`,
        );
      }
    }
  });

  it("every POST-marker fold-derive block (runs after :366) does NOT use the +1 form — the fold already reflects THIS invocation's value there (the exact off-by-one build-plan-verify-2-2.md found)", () => {
    const postMarkerBlocks = foldBlocks.filter((f) => f.start > markerIndex);
    expect(postMarkerBlocks.length).toBe(7);
    for (const { start, block } of postMarkerBlocks) {
      if (plusOneRe.test(block)) {
        expect.fail(
          `Post-marker fold-derive block at file offset ${start} uses the '+ 1' form — it runs ` +
            `AFTER the debugAttempt marker write, so the fold already reflects THIS invocation's ` +
            `N and +1 overshoots to N+1 (this is the exact regression build-plan-verify-2-2.md ` +
            `found in all 6 newly-converted sites):\n${block.slice(0, 200)}`,
        );
      }
    }
  });
});

// ---------------------------------------------------------------------------
// #58 T5.4 — mapping rule (sub-plan 2, runs LAST of the four, after WS-3)
//
// Makes "derives the RIGHT counter" falsifiable without a per-site fixture
// matrix. For every fenced block that BOTH writes a step-done row AND
// derives a counter, the derive call's step argument(s) must be within
// COUNTER_STEP_MAP[row's step]. A deriving block whose row-step is absent
// from the map reds — so the map cannot be silently short (the one property
// the shipped EXPECTED_CONSTANTS 6-of-7 hand-list lacked).
//
// What this does NOT prove (stated plainly, per the plan): the map is
// authored from T3.0's recorded mapping, so an implementer who mis-maps a
// site AND writes the same mistake into the map gets green. It PINS the
// mapping; it does not PROVE it. Proving the derived NUMBER needs a
// seeded-log fixture per site — out of scope (§ Alternative Approaches).
// ---------------------------------------------------------------------------

const COUNTER_STEP_MAP: Record<string, string[]> = {
  "build-plan-verify": ["build-plan-verify"],
  "build-plan-gaps-remediate": ["build-plan-verify"],
  "build-challenge": ["build-challenge-remediate"],
  "build-challenge-reconcile": ["build-challenge-remediate"],
  "build-challenge-remediate": ["build-challenge-remediate"],
  "build-run-tests": ["build-run-tests"],
  "build-failure-diagnose": ["build-run-tests"],
  "build-failure-remediate": ["build-run-tests"],
  "debug-run-tests": ["debug-run-tests"],
  "debug-failure-diagnose": ["debug-run-tests"],
  "debug-failure-remediate": ["debug-run-tests"],
  "debug-failure-soak": ["debug-run-tests", "debug-failure-soak"],
  "debug-push-remediation": ["debug-run-tests"],
  "ship-merge-pr": ["ship-merge-pr"],
  "ship-failure-diagnose": ["ship-merge-pr"],
  "ship-failure-remediate": ["ship-merge-pr"],
};

const ROW_STEP_PATTERN = /\bstep\s*:\s*["']([\w-]+)["']/;

interface MappingViolation {
  file: string;
  rowStep: string;
  derivedSteps: string[];
  reason: string;
}

function findMappingViolations(
  files: Array<{ path: string; content: string }>,
  map: Record<string, string[]>,
): MappingViolation[] {
  const violations: MappingViolation[] = [];
  const fencedBlockRe = /(`{3,})[\w]*\n([\s\S]*?)\1/g;
  for (const f of files) {
    for (const m of f.content.matchAll(fencedBlockRe)) {
      const block = m[2];
      const rowMatch = ROW_STEP_PATTERN.exec(block);
      if (!rowMatch) continue;
      const rowStep = rowMatch[1];
      DERIVE_CALL_PATTERN.lastIndex = 0;
      const derivedSteps = Array.from(block.matchAll(DERIVE_CALL_PATTERN)).map((dm) => dm[1]);
      if (derivedSteps.length === 0) continue; // this block doesn't derive — T5.3's remit, not T5.4's.
      const allowed = map[rowStep];
      if (!allowed) {
        violations.push({
          file: f.path,
          rowStep,
          derivedSteps,
          reason: "row-step absent from COUNTER_STEP_MAP",
        });
        continue;
      }
      for (const d of derivedSteps) {
        if (!allowed.includes(d)) {
          violations.push({
            file: f.path,
            rowStep,
            derivedSteps,
            reason: `derived step "${d}" not in COUNTER_STEP_MAP["${rowStep}"] = [${allowed.join(", ")}]`,
          });
        }
      }
    }
  }
  return violations;
}

describe("#58 T5.4: mapping rule — each block derives the RIGHT counter, not merely a counter", () => {
  const realFiles = WORKFLOW_FILES.map((p) => ({ path: p, content: readWorkflow(p) })).filter(
    (f) => f.content !== "",
  );

  it("COUNTER_STEP_MAP contains the 11 counter-!=-row entries and 6 counter-==-row entries (17 step-keyed references across 16 row-steps)", () => {
    const keys = Object.keys(COUNTER_STEP_MAP);
    expect(keys.length).toBe(16);
    const totalRefs = Object.values(COUNTER_STEP_MAP).reduce((n, v) => n + v.length, 0);
    expect(totalRefs).toBe(17);
  });

  it("real corpus: green after WS-3 — every deriving+row-writing block maps correctly", () => {
    const violations = findMappingViolations(realFiles, COUNTER_STEP_MAP);
    if (violations.length > 0) {
      expect.fail(violations.map((v) => `  ${v.file} step="${v.rowStep}": ${v.reason}`).join("\n"));
    }
    expect(violations.length).toBe(0);
  });

  it("RED-PROOF (1): a derive pointed at the wrong step reds the rule (synthetic corpus)", () => {
    const misMapped = [
      "```bash",
      'CHALLENGE_REMEDIATE_ATTEMPT=$(counter_count "$STATUS" build build-challenge) || exit 2',
      'jq -nc \'{type:"step-done", workflow:"build", step:"build-challenge", status:"DONE"}\' >> "$STATUS"',
      "```",
    ].join("\n");
    const violations = findMappingViolations(
      [{ path: "synthetic.md", content: misMapped }],
      COUNTER_STEP_MAP,
    );
    expect(violations.length).toBeGreaterThan(0);
  });

  it("RED-PROOF (2): deleting a map entry while its block still derives reds the rule (synthetic corpus)", () => {
    const block = [
      "```bash",
      'CHALLENGE_REMEDIATE_ATTEMPT=$(counter_count "$STATUS" build build-challenge-remediate) || exit 2',
      'jq -nc \'{type:"step-done", workflow:"build", step:"build-challenge", status:"DONE"}\' >> "$STATUS"',
      "```",
    ].join("\n");
    const shortMap = { ...COUNTER_STEP_MAP };
    delete shortMap["build-challenge"];
    const violations = findMappingViolations([{ path: "synthetic.md", content: block }], shortMap);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].reason).toMatch(/absent from COUNTER_STEP_MAP/);
  });

  it("RED-PROOF (3): a deriving block whose row-step is absent from the map reds the rule (synthetic corpus)", () => {
    const block = [
      "```bash",
      'FOO_ATTEMPT=$(counter_next "$STATUS" build some-new-step) || exit 2',
      'jq -nc \'{type:"step-done", workflow:"build", step:"some-new-row", status:"DONE"}\' >> "$STATUS"',
      "```",
    ].join("\n");
    const violations = findMappingViolations(
      [{ path: "synthetic.md", content: block }],
      COUNTER_STEP_MAP,
    );
    expect(violations.length).toBeGreaterThan(0);
  });
});

describe("WS3-T3: bkit-counter-bus.sh — all required helper functions are defined", () => {
  const busPath =
    process.env.BKIT_COUNTER_BUS ?? path.join(TEMPLATE_SCRIPTS, "bkit-counter-bus.sh");
  const EXPECTED_FUNCTIONS = [
    "counter_count",
    "counter_next",
    "counter_current",
    "check_max",
    "decide_next",
  ];

  it("bkit-counter-bus.sh exists", () => {
    expect(fs.existsSync(busPath)).toBe(true);
  });

  for (const fn of EXPECTED_FUNCTIONS) {
    it(`bkit-counter-bus.sh defines function ${fn}`, () => {
      const content = fs.existsSync(busPath) ? fs.readFileSync(busPath, "utf-8") : "";
      expect(content).toMatch(new RegExp(`^${fn}\\(\\)`, "m"));
    });
  }
});

// ---------------------------------------------------------------------------
// #58 T6.2 — the four inert primitives (BKIT_COUNTER_* persistence
// convention) must be ABSENT from the template. Shell state does not
// survive across orchestrator Bash calls, and the primitives write
// BKIT_COUNTER_{NAME} while every call site reads ${NAME} — the two never
// meet (Defect 2). Keeping dead helpers beside a different live convention
// is what let that hide; WS-6 deletes them once every call site derives.
// ---------------------------------------------------------------------------
describe("#58 T6.1/T6.2: the four inert counter-bus primitives are absent from the template", () => {
  const busPath =
    process.env.BKIT_COUNTER_BUS ?? path.join(TEMPLATE_SCRIPTS, "bkit-counter-bus.sh");
  const content = fs.existsSync(busPath) ? fs.readFileSync(busPath, "utf-8") : "";
  const REMOVED_PRIMITIVES = ["counter_init", "counter_inc", "counter_get", "counter_reset"];

  for (const fn of REMOVED_PRIMITIVES) {
    it(`bkit-counter-bus.sh does NOT define ${fn}`, () => {
      expect(content).not.toMatch(new RegExp(`^${fn}\\(\\)`, "m"));
    });
  }

  it("bkit-counter-bus.sh carries no BKIT_COUNTER_{NAME} persistence reference", () => {
    expect(content).not.toMatch(/BKIT_COUNTER_\$\{?_c/);
  });
});

// ---------------------------------------------------------------------------
// #58 T7.1 — every close-workflow counter row must honestly claim a
// non-`model-self-report` provenance. Flipping only `counterSource` while
// leaving `--argjson counterValue 1` hardcoded would swap one dishonest
// label for another — the value must be derived FIRST, from the SAME
// all-runs `workflow-started` count expression, across all 5 emitters.
// ---------------------------------------------------------------------------
describe("#58 T7.1: every counter-row emitter derives counterValue and claims shell-bus provenance", () => {
  const COUNTER_ROW_FILES = [
    ".bkit/workflows/bkit-build.md",
    ".bkit/workflows/bkit-debug.md",
    ".bkit/workflows/bkit-ship.md",
    ".bkit/workflows/bkit-plan.md",
    ".bkit/workflows/bkit-design.md",
  ];
  const ALL_RUNS_EXPR = 'select(.type=="workflow-started" and .workflow==$wf)] | length';

  it("no workflow file still carries a model-self-report literal", () => {
    for (const f of COUNTER_ROW_FILES) {
      expect(readWorkflow(f)).not.toContain("model-self-report");
    }
  });

  for (const f of COUNTER_ROW_FILES) {
    it(`${f}: counterValue is a $(jq ...) capture, not a hardcoded literal`, () => {
      const content = readWorkflow(f);
      expect(content).not.toMatch(/--argjson counterValue 1\b/);
      expect(content).toMatch(/--argjson counterValue "\$COUNTER_VALUE"/);
    });

    it(`${f}: counterSource is shell-bus`, () => {
      expect(readWorkflow(f)).toMatch(/--arg counterSource "shell-bus"/);
    });

    it(`${f}: uses the same all-runs workflow-started expression as the other 4 emitters`, () => {
      expect(readWorkflow(f)).toContain(ALL_RUNS_EXPR);
    });
  }
});

// ---------------------------------------------------------------------------
// Build-challenge remediation (#58 HIGH: arithmetic-injection sink)
//
// PRIOR_DEBUG_ATTEMPT is read from a raw status.jsonl `debugAttempt` field
// via `jq -r` and then fed to `$((PRIOR_DEBUG_ATTEMPT + 1))`. POSIX
// arithmetic re-evaluates a non-numeric operand as an expression, so an
// attacker-planted `debugAttempt:"x[$(cmd)]"` marker EXECUTES `cmd` under
// bash. The fix coerces the jq output to a number (or 0, matching the fold's
// own `// 0` null-case intent) at the derive itself, before it ever reaches
// `$(( ))`. This suite pins that both statically (the coercion text is
// present at all 3 sink sites, nowhere else) and dynamically (the actual jq
// filter extracted from the file is executed under bash against a poisoned
// and a legitimate status.jsonl).
// ---------------------------------------------------------------------------

describe("#58 build-challenge HIGH: PRIOR_DEBUG_ATTEMPT derive is sanitised before $(( )) (arithmetic-injection sink closed)", () => {
  const debugContent = readWorkflow(".bkit/workflows/bkit-debug.md");
  const fencedBlockRe = /(`{3,})[\w]*\n([\s\S]*?)\1/g;
  const priorDeriveBlocks: Array<{ start: number; block: string }> = [];
  for (const m of debugContent.matchAll(fencedBlockRe)) {
    if (/PRIOR_DEBUG_ATTEMPT\s*=\s*\$\(jq/.test(m[2]) && m.index !== undefined) {
      priorDeriveBlocks.push({ start: m.index, block: m[2] });
    }
  }

  // Matches EITHER remediation shape: a jq-side `(tonumber? // 0)` coercion
  // immediately in the same $(jq ...) capture, OR the shipped shell-side
  // `case "$PRIOR_DEBUG_ATTEMPT" in '' | *[!0-9]*) PRIOR_DEBUG_ATTEMPT=0 ;; esac`
  // guard inserted between the derive and the `$(( ))`. Either neutralises
  // the sink; this test does not care which the implementer chose, only
  // that ONE of them guards every site.
  const JQ_COERCION_RE = /PRIOR_DEBUG_ATTEMPT=\$\(jq[^\n]*\(tonumber\?\s*\/\/\s*0\)[^\n]*\)/;
  const SHELL_GUARD_RE =
    /case\s+"\$PRIOR_DEBUG_ATTEMPT"\s+in\s*\n?\s*'{2}\s*\|\s*\*\[!0-9\]\*\)\s*\n?\s*PRIOR_DEBUG_ATTEMPT=0/;

  it("sanity: exactly 3 PRIOR_DEBUG_ATTEMPT derive blocks found (the confirmed sink locations, :189/:219/:364)", () => {
    expect(debugContent.length).toBeGreaterThan(0);
    expect(priorDeriveBlocks.length).toBe(3);
  });

  it("every PRIOR_DEBUG_ATTEMPT derive block sanitises the value before its `$(( ))` (jq tonumber coercion or shell case guard)", () => {
    for (const { start, block } of priorDeriveBlocks) {
      const guarded = JQ_COERCION_RE.test(block) || SHELL_GUARD_RE.test(block);
      if (!guarded) {
        expect.fail(
          `PRIOR_DEBUG_ATTEMPT derive block at file offset ${start} feeds an ` +
            `unsanitised raw jq -r string value straight into ` +
            `$((PRIOR_DEBUG_ATTEMPT + 1)) — POSIX arithmetic re-evaluates a ` +
            `non-numeric operand as code, so a crafted debugAttempt:"x[$(cmd)]" ` +
            `marker in status.jsonl executes cmd under bash. Add the ` +
            `'(tonumber? // 0)' jq coercion or the shipped shell case guard ` +
            `before the arithmetic:\n${block.slice(0, 300)}`,
        );
      }
    }
  });

  // Dynamic acid test: extract the REAL jq filter from each sink block and
  // run the actual derive + arithmetic under real bash against a poisoned
  // and a legitimate status.jsonl row. This is the only check that would
  // catch a coercion that is syntactically present but semantically inert
  // (e.g. a typo'd jq path that never actually runs on the derived value).
  const DERIVE_LINE_RE =
    /PRIOR_DEBUG_ATTEMPT=\$\(jq -s -r "\$BKIT_STATUS_FOLD"'([^']*)' "(\$SRC|\$STATUS)" 2>\/dev\/null \|\| echo 0\)\n\s*DEBUG_ATTEMPT=\$\(\(PRIOR_DEBUG_ATTEMPT \+ 1\)\)/;

  const FOLD_SH_PATH = path.join(REPO_ROOT, ".bkit/scripts/bkit-status-fold.sh");

  it.each(priorDeriveBlocks.map((b, i) => [i, b] as const))(
    "sink site #%i: poisoned debugAttempt does not execute, legitimate debugAttempt still increments",
    (_i, { block }) => {
      const m = DERIVE_LINE_RE.exec(block);
      expect(m, `could not extract jq derive line from block:\n${block.slice(0, 300)}`).not.toBe(
        null,
      );
      if (!m) return;
      const jqProgram = m[1];

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-debugattempt-sink-"));
      const markerFile = path.join(tmpDir, "PWNED_MARKER");
      const poisonSrc = path.join(tmpDir, "poison-status.jsonl");
      const legitSrc = path.join(tmpDir, "legit-status.jsonl");
      // A preceding `workflow-started` row is required: the real fold's
      // `workflow-meta` merge is a no-op unless `lastIdx("debug")` already
      // resolves to a run — i.e. a `workflow-started` row for "debug" must
      // exist first, exactly as the shipped writer always emits one before
      // its `workflow-meta debugAttempt` marker (:368/:374).
      fs.writeFileSync(
        poisonSrc,
        [
          JSON.stringify({
            type: "workflow-started",
            workflow: "debug",
            at: "2026-01-01T00:00:00Z",
          }),
          JSON.stringify({
            type: "workflow-meta",
            workflow: "debug",
            at: "2026-01-01T00:00:01Z",
            debugAttempt: `x[$(touch ${markerFile})]`,
          }),
        ].join("\n") + "\n",
      );
      fs.writeFileSync(
        legitSrc,
        [
          JSON.stringify({
            type: "workflow-started",
            workflow: "debug",
            at: "2026-01-01T00:00:00Z",
          }),
          JSON.stringify({
            type: "workflow-meta",
            workflow: "debug",
            at: "2026-01-01T00:00:01Z",
            debugAttempt: 5,
          }),
        ].join("\n") + "\n",
      );

      try {
        // Poisoned run: the exploit marker file must NOT be created, and
        // DEBUG_ATTEMPT must come out as a clean integer (1 — the coerce-to-0
        // fallback plus the legitimate PRE-marker +1).
        const poisonScript = [
          `. "${FOLD_SH_PATH}"`,
          `SRC="${poisonSrc}"`,
          `STATUS="${poisonSrc}"`,
          `PRIOR_DEBUG_ATTEMPT=$(jq -s -r "$BKIT_STATUS_FOLD"'${jqProgram}' "$SRC" 2>/dev/null || echo 0)`,
          `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))`,
          `printf '%s' "$DEBUG_ATTEMPT"`,
        ].join("\n");
        const poisonOut = execFileSync("bash", ["-c", poisonScript], { encoding: "utf-8" });

        expect(
          fs.existsSync(markerFile),
          "exploit marker file was created — the arithmetic-injection sink is NOT closed",
        ).toBe(false);
        expect(poisonOut.trim()).toMatch(/^\d+$/);

        // Legitimate run: a real integer must still round-trip through the
        // coercion unharmed (5 -> 6, preserving the PRE-marker +1 semantics).
        const legitScript = [
          `. "${FOLD_SH_PATH}"`,
          `SRC="${legitSrc}"`,
          `STATUS="${legitSrc}"`,
          `PRIOR_DEBUG_ATTEMPT=$(jq -s -r "$BKIT_STATUS_FOLD"'${jqProgram}' "$SRC" 2>/dev/null || echo 0)`,
          `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))`,
          `printf '%s' "$DEBUG_ATTEMPT"`,
        ].join("\n");
        const legitOut = execFileSync("bash", ["-c", legitScript], { encoding: "utf-8" });
        expect(legitOut.trim()).toBe("6");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    },
  );
});

// ---------------------------------------------------------------------------
// build-challenge-tests (#58) — QE edge-case pass over the build-challenge
// findings. Does NOT duplicate the permanent regression test above (the 3
// PRIOR_DEBUG_ATTEMPT sink sites, static + dynamic acid-tested) or the
// existing T5.3 completeness / DEBUG_ATTEMPT off-by-one / fail-closed /
// cross-process / subPlan-isolation / SOAK-marker suites, which already
// cover those shapes adequately. This section covers three genuine gaps:
//   1. The injection sink's SIBLINGS — generalise "3 known sites patched"
//      into "corpus-wide rule: no raw jq -r field feeds $(( )) anywhere".
//   2. Provenance integrity — a dynamic (not merely textual) proof that
//      counterValue is genuinely derived, acid-tested against a dishonest
//      revert to a hardcoded literal.
// The two ACCEPTED-LOW characterisations (empty --sub-plan "" and the
// run-boundary interleave reset) are covered in tests/counter-derive.bats
// (T2.4b new; T2.10 pre-existing and adequate) — real-process boundary,
// not duplicated here.
// ---------------------------------------------------------------------------

/**
 * Find every `VAR=$(jq ...)` single-line assignment anywhere in `content`
 * whose jq filter is a RAW field/string extraction — i.e. it does NOT end in
 * a `length` count and does NOT already carry a `tonumber?` coercion — and
 * which is later consumed inside a `$(( ... VAR ... ))` arithmetic expansion
 * anywhere in the same file. This is the GENERALISED shape of the
 * build-challenge HIGH finding ("a raw jq -r field flows into POSIX
 * arithmetic, which recursively re-evaluates a non-numeric operand as
 * code"). `length` counts are always non-negative integers by construction
 * (excluded as safe); `tonumber?` coercion is the shipped fix's own shape
 * (excluded as already-guarded).
 */
function findUnguardedJqIntoArithmetic(
  content: string,
): Array<{ variable: string; assignLine: string; arithSnippet: string }> {
  const ASSIGN_RE = /^\s*([A-Za-z_][A-Za-z0-9_]*)=\$\(jq\b.*\)\s*$/gm;
  const hits: Array<{ variable: string; assignLine: string; arithSnippet: string }> = [];
  for (const m of content.matchAll(ASSIGN_RE)) {
    const varName = m[1];
    const line = m[0];
    const isCount = /\|\s*length\b/.test(line);
    const isCoerced = /tonumber\?/.test(line);
    if (isCount || isCoerced) continue;
    const arithRe = new RegExp(`\\$\\(\\([^)]*\\b${varName}\\b[^)]*\\)\\)`);
    const arithMatch = arithRe.exec(content);
    if (arithMatch) {
      hits.push({ variable: varName, assignLine: line, arithSnippet: arithMatch[0] });
    }
  }
  return hits;
}

describe("#58 build-challenge-tests: corpus-wide guard — the arithmetic-injection sink shape has no OTHER instance across the 5 workflows (generalises the 3-site fix into a rule)", () => {
  it("real corpus: no raw (non-length, non-tonumber-coerced) jq -r extraction anywhere feeds a $(( )) arithmetic expansion, in ANY of the 5 workflows — not just the 3 sites the remediation fixed", () => {
    const findings: string[] = [];
    for (const f of WORKFLOW_FILES) {
      const content = readWorkflow(f);
      if (content === "") continue;
      const hits = findUnguardedJqIntoArithmetic(content);
      for (const h of hits) {
        findings.push(
          `${f}: ${h.variable}\n  assign: ${h.assignLine}\n  arith:  ${h.arithSnippet}`,
        );
      }
    }
    if (findings.length > 0) {
      expect.fail(
        `Found ${findings.length} arithmetic-injection sink(s) that are NOT the 3 ` +
          `already-remediated PRIOR_DEBUG_ATTEMPT sites — this is a NEW instance of the ` +
          `build-challenge HIGH finding shape and must be fixed the same way (jq ` +
          `'(tonumber? // 0)' coercion or a shell 'case ... *[!0-9]*' guard):\n${findings.join("\n")}`,
      );
    }
    expect(findings.length).toBe(0);
  });

  it("RED-PROOF: the checker fires on a synthetic reintroduction of the exact defect shape (raw jq -r field feeding $(( )) with no length/tonumber guard)", () => {
    const synthetic = [
      "```bash",
      'PRIOR_X=$(jq -s -r "$BKIT_STATUS_FOLD"\' fold | [.[] | select(.workflow=="x")] | last.evil // 0\' "$SRC" 2>/dev/null || echo 0)',
      "X=$((PRIOR_X + 1))",
      "```",
    ].join("\n");
    const hits = findUnguardedJqIntoArithmetic(synthetic);
    expect(hits.length).toBe(1);
    expect(hits[0].variable).toBe("PRIOR_X");
  });

  it("negative control: a `| length` derive feeding $(( )) is NOT flagged (safe — length is always a non-negative integer)", () => {
    const synthetic = [
      "```bash",
      'N=$(jq -s --arg wf "build" \'[.[] | select(.type=="workflow-started" and .workflow==$wf)] | length\' "$STATUS" 2>/dev/null)',
      "M=$((N + 1))",
      "```",
    ].join("\n");
    expect(findUnguardedJqIntoArithmetic(synthetic).length).toBe(0);
  });

  it("negative control: a `(tonumber? // 0)`-coerced derive feeding $(( )) is NOT flagged (the shipped fix's own shape)", () => {
    const synthetic = [
      "```bash",
      'PRIOR_DEBUG_ATTEMPT=$(jq -s -r "$BKIT_STATUS_FOLD"\' fold | [.[] | select(.workflow=="debug")] | (last.debugAttempt // 0) | (tonumber? // 0)\' "$SRC" 2>/dev/null || echo 0)',
      "DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))",
      "```",
    ].join("\n");
    expect(findUnguardedJqIntoArithmetic(synthetic).length).toBe(0);
  });
});

describe("#58 build-challenge-tests: provenance integrity — COUNTER_VALUE is a genuine derived count, not a hardcoded literal wearing the shell-bus label", () => {
  const COUNTER_ROW_FILES = [
    { file: ".bkit/workflows/bkit-build.md", workflow: "build" },
    { file: ".bkit/workflows/bkit-debug.md", workflow: "debug" },
    { file: ".bkit/workflows/bkit-ship.md", workflow: "ship" },
    { file: ".bkit/workflows/bkit-plan.md", workflow: "plan" },
    { file: ".bkit/workflows/bkit-design.md", workflow: "design" },
  ];

  /**
   * Extract the REAL `COUNTER_VALUE=$(jq -s --arg wf "<workflow>" ... |
   * length ...)` derive line from file content. Returns null if no such
   * derive shape is present — which is exactly what would happen if a
   * future edit reverted to a hardcoded `COUNTER_VALUE=<N>` literal (of ANY
   * value, not just the specific `1` the pre-existing T7.1 regex bans)
   * while keeping the `--arg counterSource "shell-bus"` label downstream.
   * This is stricter than T7.1's `not.toMatch(/--argjson counterValue 1\b/)`
   * check, which only bans the literal "1" and would miss e.g. a revert to
   * `--argjson counterValue 2`.
   */
  function extractCounterValueDerive(content: string, workflow: string): string | null {
    const re = new RegExp(
      `COUNTER_VALUE=\\$\\(jq -s --arg wf "${workflow}" '\\[\\.\\[\\] \\| select\\(\\.type=="workflow-started" and \\.workflow==\\$wf\\)\\] \\| length' "\\$STATUS" 2>/dev/null\\)`,
    );
    const m = re.exec(content);
    return m ? m[0] : null;
  }

  for (const { file, workflow } of COUNTER_ROW_FILES) {
    it(`${file}: COUNTER_VALUE derive line is present with the genuine all-runs-count shape`, () => {
      const content = readWorkflow(file);
      const derive = extractCounterValueDerive(content, workflow);
      expect(
        derive,
        `no genuine COUNTER_VALUE derive found for workflow="${workflow}" in ${file} — if ` +
          `this file was reverted to a hardcoded literal (e.g. COUNTER_VALUE=1) while still ` +
          `claiming counterSource "shell-bus", THIS is the assertion that catches it`,
      ).not.toBe(null);
    });

    it(`${file}: the REAL extracted derive, run under real bash+jq against a fixture with 4 real workflow-started rows for "${workflow}", yields the correct count 4 (not a hardcoded value)`, () => {
      const content = readWorkflow(file);
      const derive = extractCounterValueDerive(content, workflow);
      expect(derive).not.toBe(null);
      if (!derive) return;

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-countervalue-provenance-"));
      const statusPath = path.join(tmpDir, "status.jsonl");
      try {
        const rows = [1, 2, 3, 4].map((i) =>
          JSON.stringify({
            type: "workflow-started",
            workflow,
            at: `2026-01-0${i}T00:00:00Z`,
          }),
        );
        fs.writeFileSync(statusPath, rows.join("\n") + "\n");

        const script = [`STATUS="${statusPath}"`, derive, `printf '%s' "$COUNTER_VALUE"`].join(
          "\n",
        );
        const out = execFileSync("bash", ["-c", script], { encoding: "utf-8" });
        expect(out.trim()).toBe("4");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  }

  it("RED-PROOF: the extractor returns null against a synthetic dishonest revert (hardcoded COUNTER_VALUE literal, counterSource still claims shell-bus) — proving the sanity assertion above would fire on exactly this regression", () => {
    const dishonestRevert = [
      "```bash",
      "COUNTER_VALUE=1",
      '--argjson counterValue "$COUNTER_VALUE" --arg counterSource "shell-bus" \\',
      "```",
    ].join("\n");
    expect(extractCounterValueDerive(dishonestRevert, "build")).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// #58 follow-up — routing-state completeness (P0)
// Fenced blocks that expand $DEBUG_MODE / $PUSH_MODE must call route_get_*
// (or route_append_* when writing) in the same block.
// ---------------------------------------------------------------------------

function iterBashFences(content: string): string[] {
  const blocks: string[] = [];
  const re = /^(`{3,})bash[^\n]*\n([\s\S]*?)^\1\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) blocks.push(m[2]);
  return blocks;
}

describe("#58 follow-up: fenced $DEBUG_MODE / $PUSH_MODE require route_get_* in-block", () => {
  const files = [
    ".bkit/workflows/bkit-debug.md",
    ".bkit/workflows/bkit-build.md",
    ".bkit/workflows/bkit-ship.md",
  ];

  for (const file of files) {
    it(`${file}: every fence with $DEBUG_MODE calls route_get_debug_mode or route_append_debug_mode`, () => {
      const content = fs.readFileSync(file, "utf8");
      for (const body of iterBashFences(content)) {
        if (!/\$DEBUG_MODE\b/.test(body)) continue;
        // Initial Step-1 decision fences may assign DEBUG_MODE before status exists
        if (/decide_next DEBUG_ATTEMPT/.test(body) && !/route_get_debug_mode/.test(body)) continue;
        if (/SOAK_ROWS=\$\(counter_count/.test(body) && !/route_get_debug_mode/.test(body))
          continue;
        expect(
          /route_get_debug_mode|route_append_debug_mode/.test(body),
          `fence uses $DEBUG_MODE without route_get/append:\n${body.slice(0, 200)}`,
        ).toBe(true);
      }
    });

    it(`${file}: every fence with $PUSH_MODE calls route_get_push_mode or route_append_push_mode`, () => {
      const content = fs.readFileSync(file, "utf8");
      for (const body of iterBashFences(content)) {
        if (!/\$PUSH_MODE\b/.test(body)) continue;
        // worktree-setup writes --arg pm "$PUSH_MODE" from session then appends meta
        if (/debug-worktree-setup/.test(body) && /route_append_push_mode/.test(body)) continue;
        expect(
          /route_get_push_mode|route_append_push_mode/.test(body),
          `fence uses $PUSH_MODE without route_get/append:\n${body.slice(0, 200)}`,
        ).toBe(true);
      }
    });
  }
});
