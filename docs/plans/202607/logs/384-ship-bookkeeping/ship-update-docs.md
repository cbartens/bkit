# Ship Update Docs — 384-ship-bookkeeping

Generated: 2026-07-29
Subagent: `bkit-ship-update-docs`

---

## Scope

Sync project docs with state shipped this cycle (PR #395, squash merge `80660ac0` → `dev` on 2026-07-29). FID `384-ship-bookkeeping` — restructure of `.bkit/workflows/bkit-ship.md` into Path A/B with tiered quality carriers.

Inputs read once: canonical plan `384-ship-bookkeeping-plan.md` (+ 3 sub-plans), `ship-input.md`, `build-summary.md`, `git show 80660ac0`, `docs/deferrals.jsonl`, `docs/decisions.jsonl`, `docs/knowledge.jsonl`, `.agents/docs.md`.

---

## Files Modified

- `docs/completed.md` — appended the FID entry `## Ship bookkeeping Path A/B with tiered quality carriers — #384 (2026-07-29)` at EOF (append-only register).

## Drift Resolved

### `docs/completed.md` (all four passes)

- **Sync:** the cycle delivered a shipped plan (PR #395 merged) but no `384-ship-bookkeeping` row existed in the ledger — the canonical "what shipped" register was missing the entry the Step 10 gate greps for (`docs/plans/[0-9]{6}/.*384-ship-bookkeeping`). Added the entry following the in-file `Format` block (Category / Artifacts / Summary / Related), matching the density of the preceding #341 entry.
- **Reorganize:** single append at EOF — no duplication or misplaced content.
- **Compress:** dense prose — one Artifacts line (parent index + 3 sub-plans + logs dir + PR + SHA), one Summary paragraph (Path A/B shape, merge gate, bookkeeping relocation, 3 tiered carriers, hardened Failure Path, dropped steps, config keys, test counts, challenge outcome), one Related line (issues absorbed, sequencing decision, 3 decision keys, 6 knowledge keys, docs synced, new files, open mode-3 verification).
- **Cross-Reference:** entry cites ledger keys (`384-341-serialisation`, `384-ci-capstone-chain`, `384-tier3-promotion`, the 6 knowledge keys), the dependent deferral `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`, and the upstream `341-live-run-verification-mode-1-and-mode-3`.

### Gate verification

```
$ grep -nE 'docs/plans/[0-9]{6}/.*384-ship-bookkeeping' docs/completed.md
181:- **Artifacts:** `docs/plans/202607/384-ship-bookkeeping-plan.md` (split parent index) ...
---GATE PATTERN: HIT---
```

---

## Docs NOT Modified (intentional)

- **`CHANGELOG.md`** — the repo convention is version-keyed (`## [version] — YYYY-MM-DD`) and written at release / tag-cut time, NOT at ship-to-`dev` time. Precedent: #341 (shipped to `dev` 2026-07-28, the cycle immediately before this one) has NO CHANGELOG entry and the `[Unreleased]` section is empty. Adding a #384 entry now would break the convention. No CHANGELOG update this cycle.
- **`docs/knowledge.jsonl` / `docs/decisions.jsonl`** — out of scope per contract (these were written by the build cycle: 6 knowledge rows + 3 decision rows landed in `80660ac0`).
- **`docs/deferrals.jsonl`** — append-only ledger; this agent does NOT write it. New `384-*` keys surfaced below for human review.
- **Plan / workflow / source files** — not modified (docs-only scope).

---

## Pending Items

`docs/deferrals.jsonl` `384-*` matches for human review (not written by this agent):

- `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (severity medium) — mode-3 (cloud, `RUNTIME_DEVPUSHES=false`) `BOOK_ROOT` live verification deferred to first mode-3 ship run; depends on `341-live-run-verification-mode-1-and-mode-3` (still OPEN). Surfaced in the completed.md "Open (HUMAN, post-merge)" line.
- `384-extract-ship-git-ci-mechanics-into-a-tested-kernel` (LOW) — promote remaining ship git/CI mechanics (base classify, integrate, re-validate, bookkeeping commit) from prose into `.bkit/scripts` alongside the merge gate, after 1–2 ship cycles against the new shape.
- `384-promote-status-hole-detector-from-advisory-to-gate` (LOW) — flip the Tier-3 status-hole detector from fail-open advisory to a blocking gate once the delta baseline stays clean for a release.
- `384-required-status-checks-on-dev-via-bkit-protect-main` (MEDIUM) — extend `bkit-protect-main.sh` required-status-checks enforcement to `dev` (closes the UI hand-merge path); plan-tier-gated on private repos.
- `384-ship-without-a-writable-branch-checkout-outside-b2` (LOW) — make "bookkeeping never moves the head" structural by removing ship's writable `feat/{FID}` checkout outside the B2 conflict window.
- `384-merge-queue-unavailable-private-non-enterprise` (LOW) — out-of-scope mirror; GitHub merge queue unavailable to bkit consumers (private + non-Enterprise).
- `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` (MEDIUM) — cross-cutting gap surfaced by the 384 risk premortem: no per-workflow revert for consumers who receive workflow changes on `bkit upgrade`.

Note: `384-ship-redesign-sequence-after-341` (MEDIUM, OPEN) is now RESOLVED by this ship — 384 landed after #341 with the `RUNTIME_DEVPUSHES`-conditioned `BOOK_ROOT` rule available, exactly as its remediation specified. A human may flip its status to CLOSED.

## Blockers

None.
