Verdict: PASS

<!-- verdict:end -->

# Ship — Docs Update

FID `363-widen-bkit-cloud-trigger`, squash `fbd46ad0` (PR #407).

## Files Modified

- `docs/completed.md` — cycle entry appended.
- `docs/deployments.md` + `.bkit/templates/docs/deployments.md` — § Post-merge dev CI auto-routing re-synced (identical edit in both; the section sits inside the tier-2 managed block, so template and rendered copy must match byte-for-byte).
- `docs/security.md` — § CI Auto-Route Trust: same-repo trigger gate stated as a control (consumer-owned region, no template mirror).

## Drift Resolved

**`docs/deployments.md` (Sync + Compress + Cross-Reference)**

- Stale: the `dev`-success cell claimed a `skip=true` + `::notice::` no-op inside the job. Shipped code excludes `head_branch == 'dev' && conclusion == 'success'` at the job `if:` (`auto-route-gate`), so the job never boots and no annotation is emitted — now stated as "zero runner minutes", with the ctx-step skip no longer described as the observable behaviour.
- Missing: the same-repo trigger gate (`head_repository.full_name == github.repository`) shipped this cycle and gates every CI-driven run.
- Missing: the section's own lead claimed the trigger covers `fix/**` but documented only `dev`, leaving a reader to infer that green `fix/**` CI auto-ships. Shipped behaviour is a deliberate no-op (ship has no `fix/{FID}` arm) with failures sharing the per-FID cap. Both facts added.
- Corrected FID fallback wording: the linked-PR fallback filters to merged same-repo PRs, not any associated PR.
- Dedup: the one-row routing table was removed in favour of a pointer to `.bkit/cloud.md` § Branch-aware routing, which already carries the canonical per-branch matrix for all four branch classes. Section is now shorter and no longer a second home for the same matrix.
- Cross-reference: § Auto-route contract now links `docs/security.md` § CI Auto-Route Trust for the trust surface, kill switch and cap-tamper caveat (the reverse link already existed).

**`docs/security.md` (Sync)**

- The fork-origin trigger gate existed only as a parenthetical inside the PR-body-trust paragraph ("the job-level `head_repository` guard does not cover…"), which referenced a control the doc never defined. Now stated as its own control, including why it matters (`workflow_run` runs in the base repo with the workflow's `permissions:`, and the `dev` / `fix/**` arms `git push origin dev` the counter row before any agent boots).

**`docs/completed.md` (Sync)**

- Cycle entry appended per the ledger format: what shipped (trigger widen, gate reuse and the inert-marker fix, `dev`/`fix/**` arms, fail-closed cap, concurrency, `CI_DEV` mode, same-repo gate, shipped-docs doctrine sweep, version-bump revert), plus decision / knowledge / failure / deferral keys, the docs synced this cycle, and the human-only open item (loop is consumer-repo-exercisable only; verify Vercel-CANCELED neutralisation per consumer).

**Not touched (out of scope for this agent's catalog):** `.bkit/cloud.md`, `.bkit/workflows.md`, `.bkit/jsonl.md` and the other `.bkit/*.md` surfaces were already re-synced inside the shipped commit and were spot-checked as accurate against `bkit-cloud.yml` (`fix/**` no-op row, shared cap, `dev-dispatch-dropped` warning, concurrency caveat). `docs/knowledge.jsonl` / `docs/decisions.jsonl` / `docs/deferrals.jsonl` are excluded by contract.

## Verification

- `npx prettier --check` on all four edited files — clean (`docs/completed.md` written once by prettier).
- `vale` on all four — 0 errors, 0 warnings, 0 suggestions.
- `bkit-shipped-docs-refs.test.ts` + `bkit-counter-prose-audit.test.ts` — 156 passed (no tracker numbers or retired ledger keys introduced into the shipped corpus).
- `bkit-auto-fid-guard` / `bkit-postinstall` / `bkit-release-workflow` / `bkit-ship-invariants` / `bkit-modules.integration` — 517 passed, 2 skipped.
- `docs/deployments.md` vs `.bkit/templates/docs/deployments.md` diff over the managed block is unchanged from pre-edit: only the placeholder substitutions (`{{BKIT_MANAGED_MARKER}}`, `{{DEFAULT_BRANCH}}`, `{{REPO_SLUG}}`) differ.

## Pending Items

`docs/deferrals.jsonl` rows matching this FID (human review; not written by this agent):

- `363-main-branch-trigger-excluded-reversal` — OPEN, MEDIUM. `main` shipped excluded; revisit if a bkit-authored `dev`→`main` promotion commit ever exists to carry the gate marker.
- `363-dev-dispatch-cap-self-resettable-by-controlled-principal` — OPEN, LOW. Challenge finding L2, logged architectural: the cap is derived from a file the dispatched session can rewrite. Documented as advisory in `docs/security.md`.
- `363-plan-t12-still-instructs-the-version-bump` — OPEN, LOW. The plan still lists the 4.10.0 → 4.11.0 bump; a plan re-run would re-apply what this cycle reverted.
- `archived-plan-artifacts-still-carry-internal-labels` — OPEN, LOW. References this FID's log dir; archived plan artifacts are deliberately outside the shipped-docs guard.
- `397-ship-lane-reconciler-for-depth-1-queue-eviction` — OPEN, MEDIUM. Cross-references #363; depth-1 GHA queue eviction under the shared `bkit-auto-dev` group is #397's surface, not this cycle's.

## Blockers

None.
