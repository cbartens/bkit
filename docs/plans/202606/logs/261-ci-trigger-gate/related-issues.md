# Related Issues — 261-ci-trigger-gate

## #209 — Workflow state model design/plan squash to dev persistent feat branch build→ship (closed)

**State:** closed (completed)

Build/debug fire CI **exactly once**, on the loud `close-workflow` (build) / `create-pr`-or-`close` (debug) commit. Intermediate commits carry `[skip ci]` **specifically** so a mid-build push to a branch with an open PR does NOT fire a `pull_request: synchronize` event that triggers the cloud auto-router **mid-build** (the exact D2 defect that was fixed).

Tuned build shape: `worktree-setup [skip ci]` → `summary` **(clean — the CI-triggering commit at PR-open)** → `create-pr [skip ci]` (buried) → `close-workflow` **(clean — the final loud trigger)**.

Key decisions shipped:

- NDJSON `status.jsonl` with `merge=union` to avoid conflict on `feat` vs `dev`
- `git merge --squash -X ours` for design/plan close-workflow
- `feat/{FID}` persists build → ship; state stays on branch until ship's final merge
- Defect B fix: harden "PR tip != suppressing token" at every mutation point; HEAD-Subject Assertion re-run after any force-push/rebase

---

## #81 — Avoid regression fail /bkit-ship on skipped essential tests (closed)

**State:** closed (completed)

`bkit-debug` declared `Verdict: PASS` on a cycle where the failing CI step (`Run Playwright E2E Tests`) had been **skipped, not passed**, on the post-remediation CI run. Root cause: Vercel "Ignored Build Step" regex (`^chore:`) auto-cancels deploys whose HEAD commit matches → `decide` demotes to `partial` → E2E skipped → CI `success` vacuously.

Changes shipped:

- **Change A** — `bkit-debug` Step 5 commit subject is now `fix({FID}): {description}` (not `chore:`)
- **Change B** — `bkit-ship` Step 2 regression-gate: resolve PR HEAD SHA → assert every previously-failing step is `success` (not `skipped`/`cancelled`/missing) in the current run
- **Change C** — fail explicitly when no CI run exists for HEAD (no silent PASS on empty rollup)

Relation to #261: Change C is the backstop that converts a silent-skip into a ship failure. #261's outcome-gate goes earlier (at the final push), catching suppressed heads before they ever get to ship.
