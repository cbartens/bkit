Verdict: FAIL
Failures: 1
<!-- verdict:end -->

# Design Summary

## Verdict

FAIL

- design-spike FAIL
- design-apply-review CONCERNS
- design-organise CONCERNS
- 2 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-grill-1.md`, `docs/plans/202611/logs/849-keep-local-dev/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/849-keep-local-dev/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/849-keep-local-dev/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-review-1.md`, `docs/plans/202611/logs/849-keep-local-dev/design-review-2.md` |
| design-spike | FAIL | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-spike.md` |
| design-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-v2-reviewed.md` |
| design-organise | CONCERNS | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-v3-organised.md` |

## Resolved Findings

None

## Reassessed Findings

- design-review CONCERNS, remaining findings assessed by design-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| design-start-workflow | - | - | - |
| design-worktree-setup | - | - | `docs/plans/202611/logs/849-keep-local-dev/design-input-1.md` |
| design-grill | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-grill-1.md`, `docs/plans/202611/logs/849-keep-local-dev/design-input-1.md` |
| design-brainstorm-ideate | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/849-keep-local-dev/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/849-keep-local-dev/design-brainstorm-ideate-3.md` |
| design-generate | - | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-v1-draft.md` |
| design-review | CONCERNS | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-review-1.md`, `docs/plans/202611/logs/849-keep-local-dev/design-review-2.md` |
| design-spike | FAIL | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-spike.md` |
| design-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-v2-reviewed.md` |
| design-organise | CONCERNS | 1 | `docs/plans/202611/logs/849-keep-local-dev/design-v3-organised.md` |

## Suggested Plans

### P-1: Local `dev` Recovery Tool

Covers: WS-1 (Divergence Classifier (`classifyDev`)), WS-2 (Landing Primitive Extensions), WS-3 (Recovery Verbs (`bkit branches dev-status`, `bkit branches dev-reconcile`)), WS-4 (Recovery Utility Prompt (`@bkit-utility-sync-dev`)), WS-5 (Advice Text Repointing)
Requires: []

### P-2: Automatic Local `dev` Sync on Every Landing

Covers: WS-6 (Automatic Sync Core (`syncLocalDev`)), WS-7 (Engine Caller Wiring and Reachability Contract Test), WS-8 (Workflow Display Integration), WS-9 (Ship Step 13 Retirement)
Requires: [P-1]


## Open Questions

- Departure from settled Q6 (third proof "applies empty on replay"). Options: A) Accept the third proof and drop empty replays — no empty commits reach `dev`; a commit counts as published on a third kind of evidence · B) Keep Q6's two proofs and keep empty replays as commits — exactly the settled rule; empty commits can land on `dev` · C) Keep Q6's two proofs but refuse to prepare when any replay applies empty, and list them for the owner — no empty commits and no new proof; more manual decisions. Recommended: A — an empty replay proves `origin/dev` already holds every change the commit makes, which is at least as strong as the file-content proof. Default if unanswered: C.
- Adoption when the main checkout is on `dev`. Options: A) Refuse and print manual steps — safest; the owner's common setup always needs manual steps · B) When the main checkout's tracked tree is clean and nothing is staged: `git switch --detach`, compare-and-swap `update-ref`, `git switch dev` — automatic for the common case; a crash mid-sequence leaves a detached HEAD, and switching disturbs any agent working in that checkout · C) `git reset --keep` — one command; banned by `.agents/rules.md` § Destructive git and the issue's no-reset constraint. Recommended: B — the clean-tree precondition makes the switch lossless and the backup branch covers the rest. Default if unanswered: A.
- Close exit on install failure after a fast-forward (changes ship's current exit 16 → Failure Path). Options: A) Exit 0 with `installed: false` in the line — matches Q3 / Q11; a broken install is only visible in the message · B) Keep exit 16 on ship only — current behaviour; a landed ship reported as failed · C) Exit 0 and also write a `friction` row — visible later in stats; one more write in the close. Recommended: C — Q3 holds, and a broken `node_modules` is not left visible only in one line; `unavailable: internal` already writes a `friction` row the same way. Default if unanswered: C.
- Whether the utility subagent may run `--stage=prepare`, which makes cherry-pick commits in a detached throwaway checkout (never on a branch). Options: A) Utility runs prepare — one hand-off; the engine, not the agent, creates local objects · B) Utility runs `dev-status` only; the calling session runs prepare and push — strict reading of "subagents do not commit"; more steps in the main session. Recommended: A — the commits never reach a branch until the approved push, and `pushOwnCommits` already makes the same kind of throwaway commits from verbs. Default if unanswered: A.
- How the prepared commit survives until the push stage. Objects in a removed throwaway are unreachable, and `git gc` prunes them after `gc.pruneExpire` (two weeks by default). Options: A) `--stage=prepare` writes `refs/bkit/sync-dev/prepared` at the prepared commit; `--stage=adopt` deletes it, and the next prepare replaces it — the commit survives any approval delay; one more ref write, and a hold ref is left behind if the owner never pushes · B) No hold ref; `--stage=push` reports a missing object and the utility re-prepares — no extra ref; a long approval delay ends in a "missing object" failure and a second full gate run. Recommended: A — one ref write is cheaper than a confusing failure and a repeated gate. Default if unanswered: A.
- Leaving merge commits out of the replay. The spike did not test whether a `git pull` merge can carry a change of its own, such as a conflict resolution that matches neither parent. Options: A) Leave merges out; when `git diff-tree --cc <merge>` reports any path, refuse to prepare and list that merge for the owner — nothing is lost silently; needs one more git call per merge, and the `--cc` check is unprobed · B) Leave merges out without a check — simplest; a conflict resolution held only by the merge is dropped from `dev` (the backup branch still holds it) · C) Flatten each merge with `cherry-pick -m 1` — replays everything the merge holds; usually re-applies `origin/dev`'s own changes, which conflicts or applies empty. Recommended: A — it keeps the safe default and stops only in the rare case that needs a person. Default if unanswered: A.
- How GitHub reports a push that branch protection or a ruleset refuses (spike claim 11, blocked: probing it needs a protected GitHub repository and a push). The git client reports a server-side refusal as `[remote rejected]` and a stale push as `[rejected]`, in English and German; GitHub's own status was not captured. Options: A) Build the routing on the porcelain status word and verify it against a protected test repository during the plan or build — the design stays as written; one real push to a throwaway GitHub repository is needed · B) Also treat `[rejected]` as `refused` when a re-fetch shows `<sha>` already descends from `origin/dev` — protects against a misreported refusal without a GitHub probe; one more fetch on every failed push · C) Cap re-prepares after `stale` at one per approval, then stop with the manual route — bounds the loop whatever GitHub reports; the owner may see a manual step for a genuinely stale push. Recommended: A — the routing rests on git's documented status words, and one probe settles it. Default if unanswered: B.
- Risk: two rules have no spike evidence and need named tests: the untracked-path check in `edited-files` (an untracked file at a path the update adds, which `merge --ff-only` also refuses), and unmerged index entries as the way to tell a "now empty" cherry-pick stop from a conflict stop (both leave `CHERRY_PICK_HEAD`).
- Risk: after a `git pull` merge on local `dev`, the fork point becomes the merged `origin/dev` tip, so `contested` covers only `origin/dev` changes made after the pull.
- Risk: renaming `devLocal` → `localDev` is a contract change; the plan must read every hit under `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/` (including `close-squash.integration.test.ts`, `step-table.ts`) and trace resume, no-plan convert, per-group loop and remediation paths.
- Risk: retiring `ship-switch-to-dev` trips `status-holes.ts` (`SHIP_STEP_ORDER`), `status-holes.test.ts`, `ship-invariants.test.ts`, the `bkit-ship.none.txt` render snapshot and resume routes that name Step 13; old status logs must still validate.
- Risk: debug-on-dev replays and failure-record handovers from `dev` will report `divergent` / `blocked: edited-files` routinely. Each gets the short routine wording from Data Model, with tests pinning both, so the owner does not learn to ignore the line.
- Risk: provider parity. The new prompt needs host copies, `.bkit/prompts.md` rows (catalog, model, tools, turn budget) and `.bkit/cli.md` rows, all in the same change; verify on every provider per Project Rules § Provider parity.
- Risk: file-content proof edge cases (mode-only changes, deletions, submodules, LFS pointers, renames) each need a named test, because a wrong "published" verdict drops work from the replay (the backup branch still holds it).
- Dependency: #842 gap E (feature branch cut from an unpushed local `dev`) produces exactly the squashed copies this recovery classifies; the two must not both change `unpushedDevCause`'s advice differently.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-design #849
```
