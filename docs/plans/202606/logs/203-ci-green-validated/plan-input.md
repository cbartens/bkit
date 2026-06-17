# Plan Input — #203 (FID 203-ci-green-validated)

Backport the gether #403 "CI simplification" 4-job scaffold into bkit so future consumers
get the same CI scaffold + the `bkit-tests-check` enforcement model. Full Layers 1-3.

> **PRIMARY STEER (2026-06-02, user):** The main goal is to **copy as much of the gether
> `.github/workflows/ci.yml` as makes sense** into the bkit consumer template — fidelity over
> abstraction. Bias toward copying gether's proven structure + logic VERBATIM into
> `.bkit/templates/.github/workflows/ci.yml`:
>
> - **Copy as CANONICAL (not stubbed):** the whole `bkit-decide` job (turbo affected-graph,
>   base-ref resolution, marker reading, two-layer whether/how-much precedence, liveness + E2E
>   gates, auto-escalate via `commits/{sha}/pulls`, plan-table-v1 JSON assembly + schema
>   validation + `$GITHUB_STEP_SUMMARY` table + cancellation notice), the `bkit-tests-check`
>   capstone, and the verbose-ci wiring. These generalize and should be near-verbatim.
> - **Parameterize, don't delete:** consumer-specific VALUES (branch names ->
>   `{{DEFAULT_BRANCH}}`, action SHAs/Node version -> existing placeholders, project/preview URLs,
>   secret names) become placeholders or clearly-marked single-line stubs — NOT whole commented-out
>   tiers.
> - **Stub ONLY the genuinely-not-universal tiers** (e.g. Supabase migrate) and keep them present
>   and minimal. Prefer "present + parameterized" over "commented-out `bkit-stub:` block."
> - The bkit template already targets the Next.js / Vercel / Supabase / turbo archetype (its
>   current stubs prove it), so high-fidelity copy of gether's ci.yml is appropriate.
> - bkit's OWN `.github/workflows/ci.yml` still degenerates (single-package, no turbo/Vercel/E2E/
>   live) — the high-fidelity copy applies to the TEMPLATE, not bkit-self.
>
> Net: minimize stubbing/abstraction in the template; the closer the template tracks gether's
> battle-tested ci.yml, the better. The plan's template task(s) must reflect "copy + parameterize,"
> not "generalize + stub."

---

## Session prompt (orchestrator → plan)

Target: bkit issue #203 (CI verdicts confuse "green" with "validated"). Generate a full
implementation plan covering all 3 layers of #203, backporting the gether #403 "CI
simplification" scaffold into bkit so future consumers get it.

**Canonical reference (already proven in production in the gether consumer repo — READ THESE):**

- Design doc: `/Users/christian/Documents/GitHub/app-gether-life/docs/plans/202605/403-ci-simplification-design.md`
- Live implementation: `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml`
  (4-job scaffold: `bkit-decide` -> `bkit-tests` -> `bkit-tests-live` -> `bkit-tests-check`)

Standardize the capstone name as `bkit-tests-check` (NOT #203's original "bkit-gate" — gether
#403 renamed it into the `bkit-tests*` family).

### Scope / surfaces (already mapped + agreed with the user)

1. **`.bkit/templates/.github/workflows/ci.yml`** — rewrite the single `bkit-tests` job into the
   4-job scaffold by **copying gether's ci.yml as faithfully as makes sense** (see PRIMARY STEER
   above — this supersedes any "keep as stubs" framing). `bkit-decide` (incl. turbo affected-graph),
   `bkit-tests` (incl. Vercel-await + E2E + integration), `bkit-tests-live`, and `bkit-tests-check`
   are copied near-verbatim; consumer-specific VALUES are parameterized (`{{DEFAULT_BRANCH}}`,
   URLs, secret names); only genuinely-not-universal tiers (e.g. Supabase migrate) stay minimal
   stubs. Bias: copy + parameterize, NOT generalize + comment-out.
2. **`.github/workflows/ci.yml`** (bkit's OWN) — adopt the scaffold in degenerate form for
   dogfooding: `bkit-decide` (markers + `run_level` + merged-PR escalation, NO affected-graph since
   bkit is single-package), `bkit-tests`, NO `bkit-tests-live` (bkit has no deploy — matches
   plan-143 ":live absent by design"), `bkit-tests-check` asserting decide+tests.
3. **`scripts/ci/bkit-set-protection.sh` -> RENAME to `bkit-protect-main.sh`**; change
   `REQUIRED_JOB` from "bkit-tests" to "bkit-tests-check" (403 design D8 revised 2026-06-01:
   `bkit-tests-check` is the SOLE branch-protection required check). Also rename/update the
   `.bkit/templates/scripts/ci/` copy.
4. **`.bkit/src/bkit-postinstall.ts`** (+ regenerate `dist/bkit-postinstall.js`) — update the
   protection-script name references and the "Quick path" advisory text to require
   `bkit-tests-check`.
5. **Layer 2:** `.agents/workflows/bkit-ship.md` + `bkit-debug.md` (+ `.claude/commands/*` and
   `.cursor/commands/*` mirrors) — simplify the CI-green gate to "assert `bkit-tests-check ==
success` on the PR's full run"; treat skipped/neutral/cancelled/missing as non-green; keep
   generic (no consumer-specific job names).
6. **Layer 3:** `.agents/rules.md` + `.bkit/templates/.agents/rules.md` — add the "Green != ran
   != validated" norm under Git/CI/Merges.
7. **`docs/deployments.md` + `.bkit/templates/docs/deployments.md`** — run-level matrix the rule
   points to.
8. **Tests/fixtures:** `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` + any
   install/check/render tests asserting ci.yml shape or the protection script name;
   `CHANGELOG.md` entry; `docs/pending.md` protection quick-path (`bkit-tests` ->
   `bkit-tests-check`).

### Constraints

- ASCII operators (`!=`, `>=`, `<=`) in `.agents/workflows/*.md` and `.agents/rules.md`.
- Workflows are MCP-only for GitHub (no `gh api`, no `gh` CLI, no raw HTTP).
- Regenerate `.claude/commands/*` and `.cursor/commands/*` mirrors after editing
  `.agents/workflows/*`; batch mirror/dist regeneration at END of session (not per-edit).
- Path reality: templates live under `.bkit/templates/` (NOT the older `.agents/templates/` that
  #203's body references). `.agents/workflows/` and `.agents/rules.md` are still under `.agents/`.
- The two plumbing defects (status.jsonl conflicts, `[skip ci]` tip guard) are OUT of scope —
  they belong to #209.
- bkit's own repo has no E2E/Vercel/live tier; the scaffold degenerates accordingly but still
  SHIPS the full-shape template to consumers.

---

## Issue #203 body (DESCRIPTION)

### Problem

Agents (and the ship/debug gates) declare CI green when a run concludes `success`. But a
**partial CI run is green-by-construction** for the expensive tiers — they are deliberately
skipped, not failed — so "success" carries no validation signal. The agent reports "shipped /
validated / done"; the change was never actually exercised.

Two tiers skip together on a partial run, not one:

- **E2E** (Playwright) — gated on `run_level == full` (or a force-tag)
- **Await Vercel Deployment** — the push-event gate job only runs the ~4s run-level decision; it
  never awaits the real preview deploy, so a broken `next build` is invisible.

The real defect is **run-type unawareness**: the gate inspects check _conclusions_ but never asks
_"is this run type even capable of validating this change?"_

### Worked example — the gether `uuid` incident (2026-05)

1. Work pushed directly to `dev`. CI green -> agent reported "dev is green, issue stays closed."
2. An integration test flaked -> agent re-ran the **partial** job -> green again -> "flake
   confirmed, nothing to fix."
3. Only after a human said "CI is pass because E2E was skipped only — do it again, see
   deployments.md" did the agent force a full run (`workflow_dispatch`).
4. The full run went red — not a test failure: **Await Vercel Deployment failed**, which then
   skipped E2E.
5. Root cause: `uuid` was a **phantom dependency** in `packages/services` — declared in no
   `package.json`, resolved only via hoisted `node_modules`. `tsc` + unit + integration all
   passed; only a clean webpack `next build` fails. The dev preview had been **broken for ~11h
   with green CI the whole time**, because partial CI on `dev` pushes never awaits Vercel and
   never runs E2E.

Lessons:

- **Green != ran != validated.** A partial run's checks legitimately _are_ all `success`.
- **The validating run is the PR's full CI.** A direct `dev` push is post-merge sanity, never
  validation.
- **"Rerun-until-green" tunnel vision.**
- **Phantom/undeclared deps** are a class that `tsc` + unit + partial CI cannot catch; only a real
  build catches them.
- The run-level matrix already lived in `docs/deployments.md` — the agent didn't consult it.

### Where the green/red decision is made today (the holes)

<!-- prettier-ignore -->
| Site | Current logic | Hole |
| --- | --- | --- |
| `bkit-ship.md` Gate 2 | `gh pr view --json statusCheckRollup` -> "if any failures -> Failure Path" | `skipped` is not a failure; partial run is all-`success` -> green |
| `bkit-ship.md` Gate 3 (Regression Guard) | re-asserts only previously-failing steps | skipped-by-design tiers invisible |
| `bkit-debug.md` | `RUN_CONCLUSION == success` -> healthy | a run with E2E/Vercel-await skipped still concludes `success` |
| consumer `ci.yml` | partial-on-dev emits a `::warning::` | trivially ignored — not a hard signal |

Also: E2E is a _step_ inside `bkit-tests`, not its own check — so `statusCheckRollup` (check-level)
physically cannot see a skipped E2E. The assertion must come from CI itself.

### Fix — three layers (canonical model: gether #403)

**Convergence:** `bkit-decide` (front: computes plan, emits plan-table-v1 JSON, writes step
summary) + `bkit-tests-check` (back: `needs:` all tiers, `if: always()` — actually `!cancelled()`
in the live impl; reads plan JSON + tier results; asserts every expected tier ran+passed; `exit 1`
on mismatch). Plan JSON is the shared contract.

- **Layer 1** — `bkit-decide` + `bkit-tests-check` in the template ci.yml. Single source of truth
  for "what should run" (turbo affected-graph + globalDependencies -> plan JSON). Two-layer
  precedence (whether / how-much). Auto-escalate via `GET /commits/{sha}/pulls` (direct `dev`
  push with no merged PR -> full). plan-table-v1 JSON + `$GITHUB_STEP_SUMMARY` table.
  **`bkit-tests-check` is the SOLE branch-protection required check.**
- **Layer 2** — run-type-aware bkit gate: simplify `bkit-ship.md` (Gate 2/3) + `bkit-debug.md` to
  "assert `bkit-tests-check == success` on the PR's full run." Treat skipped/neutral/cancelled/
  missing as non-green. Keep generic. (403's auto-escalate makes L2 the backstop.)
- **Layer 3** — one bullet in `.agents/rules.md` + template under "Git, CI & Merges": "Green !=
  ran != validated. Classify the CI run type before reporting any verdict. NEVER report
  validated/done off a partial CI run. Match the validation tier to the change surface."

### Scope / constraints (from issue)

- Regenerate `.claude/commands/*` and `.cursor/commands/*` mirrors after editing
  `.agents/workflows/*`.
- Workflows are MCP-only for GitHub.
- ASCII operators in workflow/rules `.md` edits.
- bkit's own repo has no E2E/Vercel tier; `bkit-tests-check` there degenerates to "assert
  `bkit-tests` succeeded," but the job still ships to consumers via the template.
- Keep L2 generic — no consumer-specific job names.

---

## Key comments (COMMENTS)

### Comment 1 — gether #403 is the canonical worked design (backflow 403 -> 203)

203 kicked off the gether work (#403 "CI simplification"), but 403 went deeper and is now the
more complete architecture. 203 and 403 independently reached "one always-on required check that
makes green == validated," from opposite ends of the pipeline. `bkit-decide` (403, front) +
`bkit-tests-check` (203's `bkit-gate`, back) are two halves. 203's capstone is exactly the
structural enforcement 403's own operability review (C1) flagged as missing (403 had only a
`::warning::`). What 403 adds as canonical: turbo affected-graph + globalDependencies as SoT;
two-layer precedence; auto-escalate via `GET /commits/{sha}/pulls`; plan-table-v1 JSON +
`$GITHUB_STEP_SUMMARY`. Two orthogonal plumbing defects (status.json conflicts; `[skip ci]` tip
guard) split OUT to #209.

### Comment 2 — the capstone is `bkit-tests-check` (not `bkit-gate`)

Renamed `bkit-gate` -> `bkit-tests-check` to sit in the `bkit-tests*` family. Gether-proven shape:

- `bkit-tests-check` — `needs: [bkit-decide, bkit-tests, bkit-tests-live]`, `if: always()`
  (live impl uses `!cancelled()`), no checkout/install (seconds). Reads
  `fromJSON(needs.bkit-decide.outputs.plan)` + `needs.*.result` + tier outcomes; asserts each
  expected tier ran+passed (`run_level != none` => tests success; `web_affected` => integration
  success; `should_run_e2e && web_affected` => E2E success not skipped; `live_should_run` => live
  success); `exit 1` on mismatch.
- **Sole branch-protection required check = `bkit-tests-check`**; `bkit-decide` demoted to plan
  producer (non-required; the gate `needs:` it). Closes a hole 403's review missed:
  `bkit-decide`-as-sole-required-check is always green, so a `bkit-tests` failure didn't block
  merge. The capstone fixes both classes — skip-when-expected AND front-gate-always-green.
- `bkit-tests` exports tier outcomes as job outputs (`integration_outcome`, `e2e_outcome`) because
  E2E/integration are steps, not jobs.

### Comment 3 — Decision (2026-06-02): proceed with FULL Layers 1-3 via /bkit-plan

Confirmed scope = all three layers. Why L2+L3 are NOT redundant with the `bkit-tests-check`
required check:

1. **`dev` is intentionally unprotected** (bkit guards `main` only via `bkit-protect-main.sh`).
   For `feat/* -> dev`, nothing blocks the merge on a red `bkit-tests-check`. The only thing that
   can refuse a partial-green merge into `dev` is the ship agent's own gate (today reads
   `statusCheckRollup` "any failures" -> treats skipped as green = the L2 bug). So L2 is
   load-bearing on the unprotected-dev path. On `main`, the required check IS the enforcement.
2. **A green capstone on a partial run is correct, but is not validation.** On a direct `dev` push
   with `run_level=light`, nothing was expected to run -> capstone green correctly. An agent
   reading "capstone green -> validated -> done" is STILL fooled. L2 = assert `bkit-tests-check ==
success` on the PR's FULL run (run-type awareness the capstone cannot encode).
3. **L3** covers the no-workflow path (interactive agent / human verdict). One-bullet norm.

403's auto-escalate kills most exposure at the source -> L2 backstop, L3 norm, L1 + auto-escalate
the structural fix. All retained.

Also folds in: rename `bkit-set-protection.sh` -> `bkit-protect-main.sh` + `REQUIRED_JOB`
`bkit-tests` -> `bkit-tests-check`; update `bkit-postinstall.ts` + advisory + `dist/`;
`docs/pending.md` quick-path; fixtures/tests; CHANGELOG.
