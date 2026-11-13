Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-spike: unsettled claims remain
- design-organise CONCERNS

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-grill-1.md`, `docs/plans/202611/logs/924-every-workflow-land/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/924-every-workflow-land/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/924-every-workflow-land/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-review-1.md`, `docs/plans/202611/logs/924-every-workflow-land/design-review-2.md` |
| design-spike | FAIL | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-v2-reviewed.md` |
| design-organise | CONCERNS | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-v3-organised.md` |

## Resolved Findings

- design-review CONCERNS, resolved by design-apply-review

## Reassessed Findings

- design-spike: design impact addressed by design-apply-review; unsettled claims remain

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| design-start-workflow | - | - | - |
| design-worktree-setup | - | - | `docs/plans/202611/logs/924-every-workflow-land/design-input-1.md` |
| design-grill | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-grill-1.md`, `docs/plans/202611/logs/924-every-workflow-land/design-input-1.md` |
| design-brainstorm-ideate | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/924-every-workflow-land/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/924-every-workflow-land/design-brainstorm-ideate-3.md` |
| design-generate | - | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-v1-draft.md` |
| design-review | CONCERNS | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-review-1.md`, `docs/plans/202611/logs/924-every-workflow-land/design-review-2.md` |
| design-spike | FAIL | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-spike.md` |
| design-apply-review | PASS | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-v2-reviewed.md` |
| design-organise | CONCERNS | 1 | `docs/plans/202611/logs/924-every-workflow-land/design-v3-organised.md` |

## Suggested Plans

### P-1: Publish mode and local start base

Covers: WS-1 (Publish mode resolution and frozen mode), WS-2 (`landingRef` and the local start base), WS-3 (Start-phase workflow wiring and `/bkit-auto` pass-through)
Requires: []

### P-2: Local landing target with design / plan local close

Covers: WS-4 (Landing lock and wait bounds), WS-5 (In-process pre-land checks and exit classes), WS-6 (`advanceLocalDev` compare-and-swap advance), WS-7 (Local landing target in `pushToDev`), WS-8 (Design / plan local close and the ancillary local callers)
Requires: [P-1]

### P-3: Ship and debug in local mode

Covers: WS-9 (Ship in local mode), WS-10 (Debug in local mode)
Requires: [P-1, P-2]

### P-4: Batch push support

Covers: WS-11 (Batch push guard, advisories and FID range parse), WS-12 (`bkit-cloud.yml` range read and batch dispatch)
Requires: [P-1]


## Open Questions

- **Owner to confirm the departure from Settled Q1 (D-Q1):** debug in place on local `dev` commits its fix there (Settled Q3), which is several commits, not the one squashed commit Q1 asks for. Options: A) Exempt that path and keep its commits — no reset on `dev`, matches Q3's wording, one path lands more than one commit · B) Route debug-on-`dev` through a scratch branch and the landing seam as one squash — Q1 holds everywhere, but debug no longer runs "in place" and Q3 changes · C) Squash after the fact — needs a reset of `dev`, which the constraints forbid. Recommended: A, because it is the only option that keeps both the constraints and Q3. Default if unanswered: A.
- **Owner to confirm the reading of answer 6 for ship's landing commit:** the one ship commit carries code, so the design gives it the PR-squash style subject with no skip token, while design, plan and Failure Path landings keep `[skip ci]`. Options: A) No skip token on the ship commit — a batch ending on a ship pushes without a trigger commit · B) Keep `[skip ci]` on it — every batch that ends on a ship is refused by the pre-push hook until the owner adds an empty commit · C) Two commits (code, then a `[skip ci]` close record) — breaks Settled Q1. Recommended: A, because the code commit's marker today is the PR squash subject, which has none. Default if unanswered: A.
- **How many debug runs a red batch starts:** one red `dev` run maps to several code-carrying FIDs, and most of them did not cause it. Options: A) One `/bkit-debug` per code-carrying FID, under a cap — every candidate gets looked at, but several cloud sessions try to fix the same failure in parallel and can push conflicting fixes · B) One `/bkit-debug` for the newest code-carrying FID, with the full FID list in its prompt and a short comment on each other issue — one session, one fix, the debug run diagnoses the failure itself whichever feature caused it · C) No dispatch; comment on every mapped issue — no cloud cost, but nothing fixes the red until the owner acts. Recommended: B, because one failure needs one fixer and the list keeps the other features visible. Default if unanswered: B.
- **What the docs tell the owner when `origin/dev` moved before the batch push:** the push is rejected, and bkit itself never rebases `dev`. Options: A) Document `git pull --rebase origin dev` — linear history, as bkit's own squash landings keep it; the local landing shas change, which matters only for log lines and comments that cite them · B) Document `git pull --no-rebase origin dev` — keeps the shas, adds a merge commit with no FID at the batch head (the range read still finds the FIDs) · C) Document both and leave it to the owner — no default, more for a reader to weigh. Recommended: A, because `dev` history is linear today and the run telemetry joins on worktree shas, not on the landing shas. Default if unanswered: A.
- **CI sign-off:** the `bkit-cloud.yml` range read edits a CI workflow file, so P4's YAML part waits for the owner's explicit confirmation (`.agents/rules.md` § CI edits). The rest of P4 does not.
- **The trigger commit carries no FID:** the hook's suggested `chore: trigger CI` commit becomes the batch head, and today's head-only parse then no-ops ("Cannot derive FID"). The range read is therefore required for the follow-up to work at all after a batch.
- **Concurrency group in `bkit-cloud.yml`:** the `dev` arm shares one `bkit-auto-${{ ... head_branch }}` group, which cancels older runs; any dispatch fan-out must happen inside one run, not across several triggered runs.
- **Commit subjects are untrusted input in CI:** keep the FID allow-list on every parsed scope, deduplicate, and cap the FIDs acted on per run (`docs/security.md` § Untrusted Content).
- **"Merged" before GitHub has it:** `bkit:merged` and `In review` on a local-only landing invite a human to close an issue whose code sits unpushed on one machine. The ahead count printed at every local Step 1 is the mitigation; the risk of a lost laptop holding unpushed features is accepted by the owner's workflow choice.
- **A later call site naming `origin/dev`:** about 150 engine lines across 16 files name it. Mitigation: `landingRef`, a Tier-2 audit failing on a new literal in `.bkit/core/engine/commands/workflow/` outside an allow-list of published-only paths, and a `runGit` spy asserting no `push` argv on the local target, plus a dogfood run with `origin` pointed at an unreachable URL.
- **Integration tiers move to batch time:** the landing runs affected checks only; an integration break shows up at the owner's pre-push, after several more features landed on top. Accepted by owner answer 2.
- **Dependencies:** #911 then #849 must be built first; this design names ship steps by name because both renumber them. #849's sync outcome vocabulary (equal, fast-forwarded, ahead, divergent, blocked) should gain the local landing's line rather than a parallel one.
- **Whether #849's landed code can carry the strict advance and an `unpushed` report (spike C15, BLOCKED):** `local-dev.ts` does not exist until #849 is built, so the `syncLocalDev` result type, its `localDev` line and its "every verb reachable from a `dev` push emits `localDev`" test could not be read or probed. Options: A) Extend #849's types in place: add `state: "unpushed"` to `LocalDevSync` and teach the reachability test that local-target verbs emit it — one report shape for every landing, but P2 edits #849's freshly landed module and test · B) Give the local target its own `LocalLand` report and exempt local-target verbs from the reachability test by name — no edits to #849's types, but two report shapes for the owner to read and an exemption list to keep current · C) Hold P2's plan until #849 lands and decide then — no guess, but the plan cannot be written ahead of #849. Recommended: A, because #849's decision makes `localDev` the one place every landing reports and a second shape would drift. Default if unanswered: A, re-checked by reading #849's landed `local-dev.ts` and running the C1-C5 probes against `advanceLocalDev` before P2's tasks are fixed.
- **Lock order for the landing lock and the machine-wide `tests` lock:** a landing holds the landing lock while its check queues for the `tests` lock, so a queued second landing waits through both (spike C11: 1413 s and 1809 s holds). Options: A) Keep the order and derive `LAND_LOCK_WAIT` from `LAND_TESTS_LOCK_WAIT` plus a check budget (proposed 30 + 20 = 50 minutes) — needs nothing unverified, but a queued landing can wait close to an hour · B) Take the `tests` lock before the landing lock and hand it to the check, so the landing lock is held only while checks run (about 12 minutes measured) — shorter waits, but it needs the tests lock to pass into the in-process check, which no probe has shown, and a consistent lock order everywhere to avoid a deadlock · C) Make both waits a `package.json` setting with A's values as defaults — owner can tune per repo, at the cost of one more setting to document. Recommended: A, because it is the only option the evidence already supports; B can follow once a probe shows the hand-off works. Default if unanswered: A, with both values re-measured on a landing in the plan.

## Documentation Warnings

- **data-schema** (docs/data-schema.md holds only the managed starter header; bkit has no database, so the design records its data model (settings, run rows, lock file) in the design itself) — `docs/data-schema.md`
  - Evidence: .bkit/jsonl.md § Per-Kind Fields; .bkit/workflows.md § status.jsonl — workflow state SoT
  - Action: none — the doc does not apply to a repo with no database
- **landing-topology** (docs/architecture.md does not describe how workflow closes land on dev (scratch checkout, push, local fast-forward); the contract lives only in .bkit/workflows.md and land.ts) — `docs/architecture.md`
  - Evidence: .bkit/workflows.md § Common Workflow Anatomy; .bkit/core/engine/commands/land.ts pushToDev; #639
  - Action: add a short landing-topology pointer to docs/architecture.md in the build that adds the local target

## Risks and Action Items

None

## Recommended Next Step

```text
File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>
```

Or, to address the reasons first: `/bkit-design #924`
