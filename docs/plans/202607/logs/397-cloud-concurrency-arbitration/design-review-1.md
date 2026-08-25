Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

## Ecosystem Search

Capability-by-capability, against the approved stack (GitHub Actions YAML + shell + the `.bkit/src` TypeScript renderer/test harness). No design-supplied line reference was trusted; every claim below was re-derived from source or from primary vendor docs.

### 1. Cross-run mutual exclusion for cloud agent runs

**What exists.** GitHub Actions `concurrency` (workflow-level and `jobs.<job_id>.concurrency`), GA since April 2021, first-party, zero dependency. Extended 2026-05-07 with a `queue` property.

**Fit.** Repo-scoped, evaluated server-side, survives runner death — the only primitive that arbitrates across two ephemeral runners. Verified: the docs state "if another job or workflow using the same concurrency group **in the repository** is in progress, the queued job or workflow will be `pending`" — this closes V-4 (repository-scoped, cross-workflow) as CONFIRMED, not INFERRED.

**Recommendation: USE-AS-IS.** The design's choice of the native primitive over an external CAS lock is correct and well-argued. No ecosystem alternative (no Action, no library) provides cross-runner mutual exclusion without inventing a durable state surface, exactly as the design's rejection of option (b) reasons.

### 2. Deeper-than-one queue (V-2 — the design's load-bearing negative premise)

**What exists.** `concurrency.queue`, announced [2026-05-07](https://github.blog/changelog/2026-05-07-github-actions-concurrency-groups-now-allow-larger-queues/), now in the stable workflow-syntax reference. Verbatim from the docs:

> `single` (default): At most one job or workflow run can be `pending` in the concurrency group. When a new job or workflow run is queued, any existing `pending` job or workflow run in the same group is canceled and replaced.
> `max`: Up to 100 jobs or workflow runs can be `pending` in the concurrency group.

FIFO ordering by wait-start time. Applies at **both** workflow and job level. `queue: max` + `cancel-in-progress: true` is a workflow **validation error**.

**Fit.** The design's uniform `cancel-in-progress: false` makes `queue: max` legal in every cell. This is a direct, first-party answer to R-1 and to #363's own residual-risk paragraph (`363-widen-bkit-cloud-trigger-plan.md:950`, which records the same depth-1 loss). **Gap: tooling.** The repo's pinned validator does not know the key (see Library / API Evaluation).

**Recommendation: ADAPT — but only after resolving the actionlint gap.** The capability is USE-AS-IS-grade; the adaptation cost is entirely in the lint toolchain, not the workflow.

### 3. Cross-payload-shape FID normalisation (V-1 — the design's load-bearing positive premise)

**What exists.** `jobs.<job_id>.concurrency` with the `needs` context.

**Fit.** **CONFIRMED, two independent sources.**

- GitHub's context-availability table, verbatim:
  - `concurrency | github, inputs, vars | None`
  - `jobs.<job_id>.concurrency | github, needs, strategy, matrix, inputs, vars | None`
- The repo's own pinned validator independently implements the same table. Probed with actionlint 1.7.12 (the version CI downloads, `ci.yml:399`) on a scratch workflow shaped exactly like the design's Lane 2:
  - `needs.resolve.outputs.lane` inside `jobs.run.concurrency.group` → **exit 0, clean**.
  - The same expression moved to workflow-level `concurrency.group` → `context "needs" is not allowed here. available contexts are "github", "inputs", "vars"`.
  - A deliberate typo (`needs.resolve.outputs.laneTYPO`) at job level → `property "lanetypo" is not defined in object type {lane: string; skip: string}`.

The third probe is the decisive one: actionlint is not merely tolerating the expression, it is type-resolving the `resolve` job's declared outputs inside the job-level concurrency group. The negative control proves the checker is active for this key.

**Recommendation: USE-AS-IS.** V-1 flips from INFERRED to CONFIRMED. Lane 2 stands; the peer-run-probe contingency is not needed and the scratch-repo spike the design schedules before Build is no longer a gate (though a single live run remains cheap insurance for runtime-vs-lint divergence).

### 4. YAML parsing for the rewritten matrix test

**What exists.** `yaml` (eemeli, ~1.4M weekly, ISC, first-class TS types, comment/anchor preserving) and `js-yaml` (~50M weekly, MIT, `@types/js-yaml` separate). Neither is resolvable in this repo today (`require.resolve` fails for both; `package.json` runtime deps are `picomatch` alone).

**Fit.** `yaml` is the better fit: bundled types (no separate `@types/*` for a repo that already tracks `@types/node` and `@types/picomatch` explicitly), ISC license, and it round-trips comments — relevant because the marker-block tests index on `# bkit:start …` comments. **Note the design's open question 3 has a precedent it does not cite:** #363's plan already validates `bkit-cloud.yml` structure with `yq` (`363-widen-bkit-cloud-trigger-plan.md:793,863`), a CLI, not a JS dependency. A `yq`-based check keeps `.bkit/src` dependency-free and sidesteps the packed-tarball dogfood question entirely, at the cost of not being a vitest assertion.

**Recommendation: ADAPT.** Either `yaml` as a devDependency (test-only, never reaches the packed tarball's `dependencies`, so the ERR_MODULE_NOT_FOUND class the dogfood discipline guards against does not apply) or reuse #363's `yq`. Both are viable; the design should not leave this open past Plan because it determines whether T3.1's rewrite is a vitest test or a CI step.

### 5. Post-install detection of a drifted concurrency block

**What exists.** In-repo precedent, verified: `bkit-postinstall.ts:361-395` ships `bkit-auto-yml-always-true-gate`, a string-based detector for a semantically-wrong `if:` gate in an installed `bkit-cloud.yml`. The design's citation of this precedent is accurate.

**Recommendation: USE-AS-IS (extend the existing detector family).** No new mechanism needed.

## Stack Feasibility

**Buildable with the approved stack: yes.** Nothing in the design requires a new runtime, service, or platform capability that does not exist. The two-lane shape is expressible in the shipped YAML and validated by the shipped linter. Constraints and defects found:

**F-1 — `resolve` job cannot call `gh` without a repo context (hard break).** The design specifies "No `actions/checkout`. The existing ctx logic uses only `gh pr list` / `gh pr view` / `gh issue view` and shell, so it does not need the repo." Verified false as written: `gh pr list` in a non-git directory fails with `failed to run git: fatal: not a git repository`, and `gh` recovers only from a git remote, `-R`, or `GH_REPO`. Confirmed the fix works: `GH_REPO=cbartens/bkit gh pr list` returns results with no checkout. The `resolve` job therefore **must** set `GH_REPO: ${{ github.repository }}` in its `env:` (alongside the existing `GH_TOKEN`). Without it every resolver run fails at its first `gh` call and the whole design is a no-op. The conclusion (no checkout needed) is right; the stated reason is incomplete.

**F-2 — head-of-line blocking of the global ship lane (liveness).** A ship run occupies `bkit-ship-global` at workflow level for its entire duration, and that duration now includes time its agent job spends _pending_ on `bkit-fid-{N}-claude`. If a long-running dispatched build for FID N is in flight, the ship for FID N holds the repo-global ship slot while executing nothing. Under the default `queue: single` at workflow level, every ship arriving in that window evicts the previously pending one. The design's R-2 names "two eviction surfaces per run" and open question 1 asks whether ship-lane runs should skip the FID lane — but neither states the liveness consequence: the FID lane can stall the _global_ lane for an unrelated FID. This is the sharpest interaction between the two lanes and it is not in the routing matrix, the risk narrative, or the trade-off ledger.

**F-3 — the byte-equality constraint is stated inaccurately.** The design says `.github/workflows/bkit-cloud.yml` "must stay byte-identical to `.bkit/templates/.github/workflows/bkit-cloud.yml`". Verified: the two files differ (19523 vs 19529 bytes) at exactly two lines — the template carries `runs-on: {{CLOUD_RUNNER}}`, the canonical carries `runs-on: ubuntu-latest`. The real invariant is _render-then-compare_: `bkit-modules.integration.test.ts:1133-1146` asserts `canonical === renderCloudWorkflow(rawTemplate,"github").replace(/\{\{CLOUD_RUNNER\}\}/g,"ubuntu-latest")`. A builder acting on "byte-identical" would try to make the files equal and break the `{{CLOUD_RUNNER}}` token (#362). Tier classification itself is confirmed correct: `bkit-manifest.ts:344` and `:350` both register `{ path: ".github/workflows/bkit-cloud.yml", format: "byte-equal-text", module: "cloud" }` in `CLOUD_MANIFEST_CLAUDE` and `CLOUD_MANIFEST_OPENCODE`.

**F-4 — expression syntax and precedence: verified valid.** The design's folded Lane 1 group expression was run verbatim through actionlint 1.7.12 inside a workflow carrying `workflow_run` (`branches: ['feat/**','fix/**','dev']`) plus `workflow_dispatch`. Exit 0. The `&&`/`||` ternary parenthesisation is accepted, `startsWith()` is a valid GHA function, and `inputs.phase` is accepted in a `concurrency` block on a workflow whose `inputs` are only populated for one of its two triggers. The empty-`inputs`-on-`workflow_run` behaviour is additionally proven empirically by the shipped file: `run-name` at `.bkit/templates/.github/workflows/bkit-cloud.yml:53-56` already relies on `inputs.phase && … || …` falling through on CI-driven runs, and that has been in production. `github.event.workflow_run.*` being null on dispatch is guarded twice over — the `github.event_name == 'workflow_run'` conjunct short-circuits, and GHA coerces null to `''` for `startsWith`.

**F-5 — no top-level `permissions:` block exists.** The design says "the current `permissions:` block grants `actions: read`, not `write`". Verified: permissions are declared **per job** (`run` job: `contents: write, pull-requests: write, issues: write, actions: read, id-token: write`; `opencode` job: the same minus `id-token`). There is no workflow-level block. The design's conclusion holds (`actions: read` everywhere, the contingency probe fits, any sweeper needs a bump), but the new `resolve` job must declare its own block — it inherits nothing. The design already specifies `contents: read, issues: read, pull-requests: read, actions: read`, which is correct and correctly narrower.

## Library / API Evaluation

<!-- prettier-ignore -->
| Item | Maturity | Size / cost | Types | License | Verdict |
| --- | --- | --- | --- | --- | --- |
| GHA `concurrency` (workflow + job level) | GA since 2021-04 | zero | n/a | first-party | USE-AS-IS |
| GHA `concurrency.queue: max` | Released 2026-05-07, in the stable workflow-syntax reference; no preview flag stated | zero | n/a | first-party | ADAPT — blocked on actionlint, see below |
| `needs` context in `jobs.<job_id>.concurrency` | Documented in the context-availability table; independently type-checked by actionlint | zero | n/a | first-party | USE-AS-IS |
| actionlint 1.7.12 | latest release, **2026-03-30** | binary, CI-downloaded, SHA-pinned (`ci.yml:396-403`) | n/a | MIT | **constraint** |
| `yaml` (eemeli) | ~1.4M/wk | devDep only, test-scope | bundled | ISC | ADAPT (or use #363's `yq`) |
| `js-yaml` | ~50M/wk | devDep only | separate `@types/js-yaml` | MIT | viable, weaker fit |

**The actionlint constraint is concrete and blocking for `queue: max`.** actionlint 1.7.12 predates the `queue` feature by five weeks. Probed directly with the pinned version:

```
.github/workflows/probe.yml:26:3: unexpected key "queue" for "concurrency" section.
  expected one of "cancel-in-progress", "group" [syntax-check]
```

`pnpm lint:workflows` and the CI actionlint step (`ci.yml:388-403`) both fail on a workflow containing `queue: max`. Options, in preference order: (a) wait for / bump to an actionlint release that adds the key and pin its SHA; (b) ship `queue: max` with a targeted `-ignore` regex plus a `docs/failures.jsonl` row and a removal trigger — note repo doctrine prefers targeted per-rule opt-outs over blanket disables, and this qualifies; (c) do not adopt `queue: max` this cycle and keep the design's accepted N>=3 loss, but record the option as a _known available fix_ rather than as a platform impossibility. Option (c) is the cheapest and is compatible with everything else in the design.

## Integration Risk

**Monorepo / shipped-surface fit.** Confirmed Tier-1 `byte-equal-text`, force-overwritten on install and upgrade, present in both the claude and opencode cloud manifests. The design's blast-radius read (consumers on older versions keep the old model; hand-edits destroyed silently; postinstall advisory as mitigation) is accurate and matches `bkit-manifest.ts:325-372`.

**Test blast radius is understated.** The design names only "T3.1 rewritten". Verified against `bkit-modules.integration.test.ts`:

- **T3.1 (line 1084)** — 4 tests. Two (1092, 1104) locate the group via `out.split("\n").find(l => l.includes("group: bkit-auto-"))` **and** `expect(out).toMatch(/group:.*inputs\.issue/)`. A folded `>-` group breaks all four assertions in those two, exactly as the design says. One (1118) is pure string logic, unaffected. One (1133) is the render-compare invariant, survives if the mirror is regenerated in the same commit. Design's account: correct.
- **T2.7 (line 1164) — NOT named by the design, and it breaks.** Line 1180 asserts `expect(out).toContain("steps.ctx.outputs.skip != 'true'")` and line 1183 asserts the literal `prompt: "/bkit-auto ${{ steps.ctx.outputs.phase }} ${{ steps.ctx.outputs.arg }}"`. Moving the ctx step into `resolve` turns both into `needs.resolve.outputs.*`, failing both assertions. This is a second required test rewrite the design does not budget for.
- **T2.7 (c), lines 1195-1232** — survive. They use `indexOf` (first occurrence) on `# bkit:start shared-deriv` / `auto-route-gate`, so a single relocated copy inside `resolve` still satisfies them, provided `resolve` is emitted before the agent jobs and still carries the `auto-route-gate` marker around its `if:`. That ordering becomes an unstated invariant of the new layout and should be asserted, not assumed.
- **Challenge Finding 1 (line 2279), tests at 2321/2326/2331/2383** — survive; they extract the `ISSUE=`/`FID=` lines from the first `shared-deriv` block and execute them under `bash -c` with `set -euo pipefail`. Collapsing the duplicate copy is invisible to them.

**Cross-issue collision with #363 — workable, with two caveats.** Verified state: #363 is `open` with label `bkit:build`; its plan (`docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md`, 118 KB, v4) is already committed to `dev`; branch `feat/363-widen-bkit-cloud-trigger` is 3 commits ahead of `dev` and those commits are worktree-setup / branch-sync / install-skills only — **no workflow edits yet**; there is no open PR for #363 (only two Renovate PRs are open). So:

1. "Strictly after #363" is correct on the merits (both edit `concurrency:` and the `on.workflow_run.branches` filter, and "take one side" is unsafe on a Tier-1 byte-equal file), but the wait is currently unbounded — #363 has not started building. The design should state what #397 does if #363 stalls, rather than leaving the dependency open-ended.
2. **A forward incompatibility the design should record:** #363 ships `cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}` (plan lines 314, 682). If #397 later adopts `queue: max`, that expression form is unusable — `queue: max` with a truthy `cancel-in-progress` is a documented workflow validation error. #397's uniform-`false` supersession already resolves it, which strengthens that decision; naming the incompatibility makes it non-optional rather than stylistic.
3. #363's plan already carries the identical depth-1 residual-risk paragraph (line 950: "GHA keeps at most ONE pending run per group, so if FID-A is in-flight and FID-B then FID-C arrive, FID-B's dispatch is cancelled while pending and never re-fires"). `queue: max` retires that paragraph too. If #397 does not adopt it, #397 should at least hand #363 the pointer.

**Design's corrected premises — independently re-verified, all hold.**

- C1/C3: `.bkit/.dev.lock` (`.gitignore:51`) and `docs/plans/*/logs/**/.lock` (`.gitignore:48`) are both gitignored; the ship workflow acquires them via `set -C` with a 600s deadline (`bkit-ship.md:27,83,873-878`). Runner-local, confirmed.
- C4/C5: the shipped trigger is still `branches: ['feat/**']` only (`bkit-cloud.yml:31`); #363 widens it. The allowlist-vs-denylist argument is sound.
- C6: `bkit-auto.md:84-93` contains PR-state resolution, CI run-id lookup and FID/ISSUE marker extraction — no lock logic, no stale-run guard. The issue's citation is indeed wrong and the design's correction is right (the range is Steps 4-9, slightly wider than the design's "branch-name FID fallback" gloss).
- R-8: verified. `bkit-ship.md:545` runs `gh workflow run ci.yml --ref "feat/{FID}"` and `:228` preflights `actions:write`; the cloud jobs grant only `actions: read`. Correctly scoped out.
- `.bkit/cloud.md:430` carries the exact bullet the design says is falsified, and `:382` carries the Cursor "Concurrency: latest-supersedes" row. Both citations accurate.

## PoC Approach

Already largely executed during this review — the remaining piece is one live run.

In a scratch repo with two workflows (`ci.yml` emitting a trivial success, `probe.yml` mirroring the design): declare the folded Lane 1 group at workflow level, a `resolve` job emitting `lane` and `skip` outputs from a shell step, and two dependent jobs each with `concurrency: { group: "${{ needs.resolve.outputs.lane }}-{agent}", cancel-in-progress: false }` and a 3-minute sleep. Then:

1. Dispatch three runs with the same issue id in quick succession; read the Actions list for one running, one pending, one cancelled-with-zero-started-jobs — this settles V-2's default arm, R-1's detectability claim, and V-5's `display_title` rendering in a single observation.
2. Repeat with `queue: max` added; expect three sequential completions and no cancellation.
3. Dispatch one run whose `auto-route-gate` `if:` is false; check whether the run still transiently occupies the workflow group — this settles V-3.

Static validation is done and needs no repeat: actionlint 1.7.12 already accepts the exact Lane 1 expression and the exact Lane 2 `needs`-keyed group, rejects `needs` at workflow level, rejects a typo'd output property, and rejects `queue: max`.

## Unknowns & Blockers

<!-- prettier-ignore -->
| Ref | Item | Status after this review |
| --- | --- | --- |
| V-1 | `needs` in `jobs.<job_id>.concurrency` | **CONFIRMED.** Docs context-availability table + actionlint's independently-implemented checker (positive, negative, and typo controls all behave). Contingency not required. |
| V-2 | Queue depth 1 | **PARTLY FALSIFIED.** True only for `queue: single` (the default). `queue: max` gives 100, FIFO, at both levels. The design's own "consequence if false" applies. |
| V-3 | Skipped-`if:` job still holds the workflow group | **STILL INFERRED.** Not documented either way; not settled by static probing. The `bkit-noop-{run_id}` lane keeps the design independent of it at job level, as the design argues. Needs the live PoC step 3, or explicit acceptance. |
| V-4 | Groups are repository-scoped | **CONFIRMED.** "another job or workflow using the same concurrency group **in the repository**"; plus "Concurrency group names must be unique across workflows to avoid canceling in-progress jobs or runs from other workflows." |
| V-5 | `head_branch` / `display_title` on the runs API for `workflow_run`-triggered runs | **STILL INFERRED.** Load-bearing only for the contingency, which V-1's confirmation demotes to unused. Downgrade to a note. |
| new | actionlint 1.7.12 rejects `queue:` | **CONFIRMED by direct probe.** Blocks `queue: max` until resolved. |
| new | `gh` needs `GH_REPO` when there is no checkout | **CONFIRMED by direct probe.** Must be in the `resolve` job env. |
| open | Which YAML validator for the matrix test | Unresolved, and now has an in-repo precedent (#363's `yq`) the design does not cite. Must close in Plan. |
| open | #363's landing date | Unresolved. #363 has a plan on `dev` and a branch with no workflow edits; no PR. |

## Verdict Reasoning

**CONCERNS**, not PASS and not FAIL.

Not FAIL: the design is buildable with the approved stack, and its single most load-bearing inference — V-1, on which the whole Gap-2 lane rests — is now **confirmed** by GitHub's context-availability table and, independently, by the exact actionlint version CI runs, which type-resolves `needs.resolve.outputs.*` inside a job-level concurrency group and rejects the same expression at workflow level. The design's contingency is therefore dead weight, which is a strengthening result. The corrected-premises table (C1-C6), the shipped-surface Tier classification, the postinstall precedent, the R-8 adjacent defect and the test-coupling diagnosis all verify against source.

Not PASS: four findings would change what gets built, and three of them are load-bearing.

- The design's second verification gate, V-2, is stated as a platform limit and is not one. `queue: max` exists, is documented, applies at both levels, and is legal with the design's uniform `cancel-in-progress: false`. Requirement 1's restatement to "N=2 only", risk R-1, the deferred sweeper, and the "cell 7 displacement is intentional" decision are all reasoning built on that premise. The design's own consequence column says as much. It also retires the matching residual-risk paragraph in #363's plan. This must be reconciled explicitly — either adopted, or declined with the actionlint constraint named as the reason.
- The `resolve` job as specified fails at its first `gh` call. One missing env var, but it is the load-bearing job of both lanes.
- The FID lane can stall the global ship lane for an unrelated FID, and the design's R-2 and open question 1 circle it without naming the liveness consequence.
- The test blast radius omits a second breaking test.

None of these invalidates the two-lane shape, the allowlist discriminator, the uniform `cancel-in-progress: false`, or the no-new-state-surface stance — all of which survive review intact. They are refinements to a sound design, which is the CONCERNS band.

## CRITICAL

1. **Reconcile V-2 against `concurrency.queue`.** Verbatim from the workflow-syntax reference: `single` (default) cancels-and-replaces the pending run; `max` allows up to 100 pending, FIFO, at workflow and job level; `queue: max` with `cancel-in-progress: true` is a validation error. Rewrite V-2 from "platform limit" to "default behaviour, opt-out available", then decide: adopt `queue: max` (retiring R-1, the N>=3 restatement of requirement 1, the deferred sweeper, and the cell-7 "intentional displacement" decision — and #363's plan line 950), or decline it with the reason recorded. If adopting, the actionlint constraint below is a gate.
2. **actionlint 1.7.12 rejects `queue:`.** Verified by direct probe with the CI-pinned version: `unexpected key "queue" for "concurrency" section. expected one of "cancel-in-progress", "group"`. actionlint 1.7.12 is the latest release (2026-03-30) and predates the feature (2026-05-07). `pnpm lint:workflows` and `ci.yml:388-403` both fail. Resolve before committing to `queue: max`: bump to a supporting release, or a targeted `-ignore` with a removal trigger, or decline the feature this cycle.
3. **`resolve` must set `GH_REPO: ${{ github.repository }}`.** With no `actions/checkout`, `gh pr list` fails: `failed to run git: fatal: not a git repository`. Confirmed the same call succeeds with `GH_REPO` set. Without this the resolver dies on every run and both lanes are inert. The design's "does not need the repo" conclusion is right; the mechanism is incomplete.
4. **Name and resolve the head-of-line blocking of `bkit-ship-global`.** A ship run holds the repo-global workflow-level group while its agent job sits _pending_ on `bkit-fid-{N}-{agent}` behind an unrelated long-running dispatched phase for the same FID. Under the default `queue: single` at workflow level, ships arriving in that window evict each other. Open question 1 asks the right question; the design must answer it (skip the FID lane for ship-lane runs, or accept and document the stall) rather than defer it, because it is the one interaction where the two lanes make each other worse.
5. **Budget the second test rewrite.** T2.7 (b), `bkit-modules.integration.test.ts:1180` and `:1183`, asserts `steps.ctx.outputs.skip != 'true'` and the literal `prompt: "/bkit-auto ${{ steps.ctx.outputs.phase }} ${{ steps.ctx.outputs.arg }}"`. Both break when the ctx step moves into `resolve`. The design names only T3.1.

## OPTIONAL

- **Correct the byte-equality wording.** The two files are not byte-identical (19523 vs 19529 bytes); the template holds `runs-on: {{CLOUD_RUNNER}}` and the canonical holds `runs-on: ubuntu-latest`. The enforced invariant is render-then-compare (`bkit-modules.integration.test.ts:1133-1146`). "Byte-identical" would send a builder to break the #362 token.
- **Downgrade V-1 and V-4 to CONFIRMED and drop the contingency to an appendix.** V-1 is settled by two independent sources; V-4 by the docs' "same concurrency group in the repository". Keeping the peer-run probe as a live branch of the design costs Plan attention for a pivot that will not happen. Keep the probe text as a recorded alternative, not as an active contingency.
- **Downgrade V-5 to a note.** It was load-bearing only for the contingency.
- **Note the `resolve`-must-be-emitted-first invariant.** T2.7 (c) at lines 1215-1232 passes only because `indexOf` finds the _first_ `auto-route-gate` / `shared-deriv` marker pair. After the refactor that first pair lives in `resolve`. Assert the ordering rather than inheriting it by luck.
- **Cite #363's `yq` precedent in open question 3.** #363's plan already validates `bkit-cloud.yml` structure with `yq` (lines 793, 863). A `yq`-based matrix check keeps `.bkit/src` dependency-free; a `yaml` devDependency (ISC, bundled types, test-scope only) is the alternative and does not touch the packed tarball's runtime deps.
- **State what #397 does if #363 stalls.** #363 is at `bkit:build` with its plan on `dev` but only worktree-setup commits on its branch and no open PR. The strict ordering is right; the open-ended wait should have a stated fallback.
- **Record the `queue: max` / conditional-`cancel-in-progress` incompatibility.** #363's `cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}` cannot coexist with `queue: max`. This makes #397's uniform-`false` supersession mandatory rather than preferential — a free argument the decision table should absorb.
- **Add a live PoC step for V-3.** The one gate static probing cannot close; a single scratch dispatch settles it.

## OUT OF SCOPE

- **R-8 — `actions:write` for `gh workflow run ci.yml`.** Verified: `bkit-ship.md:545` runs it and `:228` preflights the scope; cloud jobs grant `actions: read` only. Correctly routed to `docs/failures.jsonl` rather than folded in.
- **R-4 — dual-agent same-run double-ship.** Both agent jobs are additive by design and both dispatch against the same PR. Pre-existing, unchanged by this design, correctly deferred. The per-agent group suffix is the right call for preserving the documented contract.
- **Router / executor split.** The correct long-term dispatch primitive; correctly deferred to when #260 and #324 add the second and third producers.
- **The reconciler / sweeper.** Needs an `actions: write` bump, a dispatch cap and a sweep predicate. Correctly identified as #260's substrate. Note that `queue: max`, if adopted, removes most of its motivation.
- **File-lock semantics.** `.bkit/.dev.lock` and `docs/plans/*/logs/**/.lock` remain correct for same-filesystem sessions and are untouched. Only the documentation claim changes.
