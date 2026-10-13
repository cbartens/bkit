# Design Revision Notes — 504-example-project (human, binding)

These notes are **binding new requirements** from the human, added after review-2 returned `FAIL`.
They override the v1-draft where they disagree, and they authorise scope that the reviews did
not: fold them in, do not treat them as agent-invented scope expansion.

## 1. Framing correction — this benchmark is not a CI gate

The example project is **not** wired into bkit's CI. Runs are ad hoc, by the maintainer. So the
reviewer's premise ("the pass/fail signal must be trustworthy") is the wrong frame.

The **only** binary signal is: **did the run finish end-to-end** — the pipeline runs
design → plan → build → ship, and the example repo's own CI (`bkit-tests-check`) is green at the
merged PR. That is the `PASS`. It is a **liveness** signal, not a quality verdict.

**Everything else is recorded and analysed, never gating**: whether the logic tests actually
executed, whether review caught the planted traps, blank-page / double-click risk, retries and
loops, divergence from ideal, wall time, and the screenshot. In practice most runs will complete;
the interesting output is the analysis, not a pass/fail.

This demotes review-2's CRITICAL 2 (vacuous zero-test green) and CRITICAL 4 (off-disk blank page)
from "fails the run" to **recorded observations**. It does **not** excuse them: a green run whose
tests never ran corrupts the data the analysis reads, so both still get a signal — but a
_recorded_ one, not a gate.

## 2. The CRITICALs that still have to be fixed

- **Broken test invocation (review-2 #1).** `node --test example` is invalid — a bare directory
  positional makes Node load it as a module and exit 1 (`MODULE_NOT_FOUND`, reproduced on
  v24.16.0). Use a glob (`node --test "example/**/*.test.js"`) or run `node --test` from inside
  the example dir. Fix the draft's inverted rationale too: bare root `node --test` is recursive
  and does discover subfolder tests. This one matters even under the new framing: a CI that is
  _always red_ means no run ever completes → zero data.
- **Vacuous green (review-2 #2).** Assert an executed-test count ≥ 1 (or that the fixed test file
  exists) so "green" means "validated". Keep trap-catching itself measured, never gated.
- **Privacy window (review-2 #3).** The scan must cover **every push**, not just the reset diff —
  the artefacts that leak (`docs/` logs, `status.jsonl`, screenshots) are pushed by the workflows.
  Public repo = irreversible. State the guarantee honestly.
- **Blank-page signal (review-2 #4).** Fold a deterministic classic-script assertion
  (`<script src>` present, no `type="module"`) into the PR-time step that already reads the built
  `index.html`. Recorded, never gating.
- **Run-scope anchor (review-1 #1).** `outcome.parentSha` is per-workflow, and `repo` is constant
  across runs in the persistent repo. Anchor a run by the **reset commit** (or the issue id), not
  by `parentSha`.
- **bkit gate blast radius (review-1 #2).** `examples/**` and `scripts/example/**` are not
  excluded from bkit's own `prettier --check` / `slop:delta`, so landing the fixture can red
  bkit's CI. Exclude them (or add the matching ignore entries).

## 3. New requirement — screenshot in CI

The example repo's CI must capture a **screenshot of whatever the run produced** (the built
`index.html` rendered) and upload it as a build artefact. It is **non-gating**: a failed capture
must never fail the run (per #232). It is a CI-only dependency (headless browser), never an app
dependency — the app still has "no packages, no secrets".

## 4. New requirement — AI run analysis (score + report)

An **AI analysis prompt** that runs **after the run stops** — whether it aborted or went all the
way through — must be in scope. It reads the run's artefacts (status.jsonl, `.bkit/stats.jsonl`,
the PR, CI results, the screenshot, the built page) and produces a **scored report** of how the
run went and how close to ideal the result is. Non-gating; it is the analysis half of the model
in §1. Define where the prompt lives, what it reads, what it scores, and where the report lands.

## 5. Keep everything else

Fixture shape and the four planted traps, the capstone CI, the gate-chain assertion, the docs
contract table, the deferral rows, the persistent public repo model, the per-run folder reset,
always-latest + recorded version, and version grouping — all stay as in v3/v1.
