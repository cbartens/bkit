# Design Input — 143-real-world-testing

## Session prompt

`/bkit-design issue 143`

Design a better real-world testing approach for the bkit plan/debug workflows so that
runtime-only defects can no longer ship green behind mocked tests.

## Issue #143 — Improved real world testing approach for plan debug workflows

**State:** open · **Labels:** enhancement, bkit:design · **Milestone:** Workflow Agent Optimisation

### Why the previous debugging missed it

All three bugs are **runtime-only** — none is visible by reading code or running mocked tests:

| Bug                                     | Only visible when you…                             |
| --------------------------------------- | -------------------------------------------------- |
| typmod strips `vector(1536)` → seq scan | run `EXPLAIN ANALYZE` against the real 132k corpus |
| model injects nil-UUID `partnerId`      | watch the real model make a real tool call         |
| reasoning tokens eat `maxOutputTokens`  | run the real reasoning model to completion         |

Both debug rounds were **static analysis + MSW mocks**. The round-1 summary literally says
"no integration test for the tool loop; MSW fabricates the stream." The mocks asserted the world
the code _assumed_ — `searchCorpus` returns rows, the model behaves, 600 tokens is enough. And the
#72 migration was **written but never executed against the real corpus**, so its own typmod defect
shipped green.

**So yes — the build delivered something that never functioned end-to-end, and CI was green because
every test was mocked.** That's the upstream root cause. The debug loop then inherited the same
mocked worldview and kept diagnosing inside it.

### What actually worked

The thing that cracked it wasn't cleverness — it was **refusing to theorize**. Every step was:
_run the real thing, look at ground truth, let the result pick the next move._

- `EXPLAIN ANALYZE` told me the index wasn't used (not my guess).
- Logging tool args showed the nil UUID (I'd assumed "model skips the tool" — wrong).
- Dumping the raw stream showed `finishReason: "length"` with zero text.

And critically: **each fix revealed the next bug.** You cannot see bug #2 until bug #1 is fixed and
you re-run. A one-shot diagnose→remediate can't do that by construction.

### Honest take on the three options

1. **"Build more tests first, then debug?"** — Yes, but: **more _real_ tests, fewer mocks at the
   integration boundary.** More mocked tests would've re-encoded the same false assumptions. One
   failing end-to-end test against the live stack is worth fifty green mocked ones. Make "a real e2e
   smoke test exists" a **build** gate, not just debug.
2. **"Too stringent with diagnose→remediate?"** — For _this class_ of bug, yes. Two failure modes:
   (a) the diagnose agent reasons from code/defaults and writes a plausible-but-unverified root
   cause; (b) the remediate agent applies it faithfully _and nobody closes the loop empirically_.
   #72 is the example — correct diagnosis, reasonable fix, but never _run_, so a second defect in
   the fix itself sailed through.
3. **"Let one agent just keep at it?"** — For "feature is non-functional, cause unknown," **yes,
   decisively.** A single agent with accumulating context that loops reproduce→instrument→fix→
   re-verify is the right tool, because the bug chain is only discoverable iteratively.

### Concrete suggestion for bkit-debug — two gates and one mode

- **Reproduce-first gate:** no diagnosis until there's an executable repro that _fails against the
  real stack_. If external deps are involved, the repro hits them — no mocks.
- **Empirical-verify gate:** a remediation is "done" only when that real repro _passes_. This single
  gate would have caught all three.
- **A "soak" mode** for unknown-cause/non-functional bugs: one agent, one context, iterate until the
  e2e test is green — instead of the diagnose→remediate handoff. Keep the structured handoff for
  known-shape, localized fixes where it shines.

The meta-lesson, now in KN-62: **green mocked tests are not evidence a feature works.**

### Still open (from earlier triage, issue 68 stays open)

- `data-*` stream parts (citations/follow-up pills still won't render in the UI even though grounding
  now works).
- threshold/recall validation against the live corpus.

## Comments

### Comment 1 (owner, 2026-05-24)

> Mandate more non mock tests as part of plan?

## Notes for design exploration

- **Crux to resolve:** bkit is consumer-agnostic. "The real stack — no mocks" must be defined in a
  way that works across consumer repos that may lack a runnable real stack, or where hitting real
  deps (LLMs, DBs) costs money or needs credentials unavailable in CI. The gates need a config-driven
  definition of "real stack repro" plus an explicit, auditable escape hatch — otherwise the gate
  becomes unsatisfiable and gets disabled.
- **Existing surface to reconcile:** bkit-debug already has an `OBSERVE_MODE` (instrument → analyse →
  revert) that is the closest existing analogue to the proposed "soak" mode. Design should decide
  whether soak extends/replaces OBSERVE_MODE or is a third mode.
- **Scope spans three workflows:** debug (reproduce-first + empirical-verify gates + soak mode),
  build (real e2e smoke test exists as a gate), and plan (mandate non-mock tests as plan tasks).
- **bkit repo vs consumer repo:** scope gates so bkit-repo-only concerns stay outside consumer-facing
  markers; consumer-facing advisory text must not cite internal KN-/BAR- refs.
