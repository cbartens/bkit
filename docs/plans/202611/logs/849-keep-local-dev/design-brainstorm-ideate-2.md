# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — One shared "classify, then maybe fast-forward" core, called by the landing routine itself ⭐ Recommended

Put a single function `classifyDev` (fetch once, compare, return one typed result: equal / fast-forwarded / ahead / divergent / blocked(reason) / unavailable / landing-pending) in the engine, and call it from the one place every `dev` push already passes through (the shared landing routine in `land.ts`), instead of from each workflow's close step. `workflows close`, `branches land`, `branches push --mode=dev`, `handover --push` and roadmap mirrors all inherit it, and the result rides on the landing result so each close summary prints the same plain line. `branches sync-dev` becomes a thin wrapper over the same function, `bkit branches dev-status` is the read-only view of it, and the recovery flow (patch-id, then file-content check, replay in a throwaway checkout, gate, approval, backup branch) builds on the classification.

- Complexity: MEDIUM.
- Extensibility: a new push path gets local sync for free because it cannot land without going through the routine. A new state is one enum member plus one summary sentence.
- Risk: the landing routine is shared and sensitive (#639 isolation). Sync logic added inside it could fail or slow a landing. Mitigation: run sync strictly after the push succeeds, wrap it so it can only return a status and never throw, and keep it out of the throwaway checkout.
- Maintenance: lowest of the three. One classifier, one result shape, one test matrix.
- Friction vs ideal: ship Step 13 is deleted from `.bkit/core/workflows/bkit-ship.md`, `shipClose` in `workflows.ts` stops calling sync separately, and `syncDevVerb` is rewritten to delegate. Close summaries in design/plan/build/debug/ship prompts gain one line. Mirrors and installed copies need regenerating. The close-PR fallback must return "landing pending" from the routine (nothing landed yet, so nothing to sync).

## Approach B — Explicit sync call at the end of each close command

Keep `land.ts` untouched. Add a `syncLocalDev()` helper (same classifier) and call it explicitly at the end of `workflows close`, `branches land`, `branches push`, and `handover`, each appending the result to its own output.

- Complexity: LOW to MEDIUM.
- Extensibility: weaker. Each new or forgotten push path silently misses the check, which is the same class of bug as the current ship Step 13 ordering mistake.
- Risk: drift between call sites (one path forgets the final landing, one formats the line differently). Roadmap mirror pushes are the easiest to miss.
- Maintenance: moderate. N call sites need N tests, plus a guard test that lists every `dev` push path.
- Friction vs ideal: least invasive to the sensitive landing code, and it is the smallest first diff. Same prompt and workflow edits as A, but the "every push" success criterion rests on discipline rather than structure.

## Approach C — Local `dev` as a derived, never-hand-committed branch (mirror model)

Treat local `dev` as a read-only mirror of `origin/dev`: all work lives on feature branches, and a background sync (post-push hook or a `bkit sync` step) force-aligns `dev` after backing up anything extra. The recovery utility only handles one-time migration of existing divergence.

- Complexity: HIGH.
- Extensibility: removes the whole problem class if the discipline holds.
- Risk: it contradicts the stated constraints (no reset, no silent history rewriting, local commits and the active branch preserved), and people do commit on `dev`. Hooks also run unevenly across worktrees and hosts.
- Maintenance: high, because it needs a policy plus enforcement on every host.
- Friction vs ideal: rewrites the workflow doctrine, so it is not viable under #849's non-goals. Listed to show the structural alternative, not as a candidate.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Hook the sync into the shared landing routine, after a successful push, returning a status only | Call sync at the end of each close command (B); mirror model (C) | Every path that pushes to `dev` is covered by construction, which is the owner's Q1 answer. Per-command calls repeat the Step 13 ordering mistake whenever a path is added. |
| One typed result with seven states, including "landing pending" for the unmerged close PR | Booleans or exit codes per path | The close must stay a success while still telling the truth about local state (Q2, Q3, Q10). A typed result lets every summary print one consistent line. |
| `sync-dev`, `dev-status` and recovery share one classifier; the prompt stays thin | Separate recovery logic in the prompt | Matches "reuse engine commands" and gives behaviour that is the same on every host. |
| Sync runs after the push succeeds and cannot throw into the landing | Sync before landing, or let sync failures fail the close | A blocked local sync must never turn a landed push into a failure (Q3). |
| Recovery proof order: patch-id, then identical file content on `origin/dev`, else unpublished | Trust commit messages or subjects | Matches Q6. Anything unproven is kept, so nothing is lost. |
| Reject the mirror/force-align model | Adopt it to eliminate divergence | Violates the no-reset and no-silent-rewrite constraints. |
