# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

Load-bearing contracts verified against the installed payload (v5.0.2), cited so the premortems stay honest:

- **Gate chain** (`.bkit/core/engine/install/manifest.ts`): `/bkit-build` Step 14, the remediates, and the pre-push hook all run `bkit:gate:static-unit` = `pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm test`. Seeded **add-if-missing** — scripts the example pre-declares are never overwritten. Ship's conflict-resolve path additionally runs `bkit:gate:install-static-unit-build` (needs `build`).
- **Merge gate** (`bkit runs gate`, ship): refuses merge unless the capstone job `bkit.capstoneJob` (default `bkit-tests-check`) is **present and green at PR head** in `bkit.ciWorkflow` (default `bkit-ci.yml`); the capstone fails on 0 executed tests when a count is reported.
- **CI template is copy-and-own** — `bkit install` never writes or refreshes `bkit-ci.yml`; the setup must place a workflow or no CI exists at all.
- **Tracker default is `none`** (`DEFAULT_ISSUE_TRACKER`) — workflows then render `_No tracker connected, skip step._`: a fresh repo runs the whole pipeline with issue reads, labels, and PR comments silently gutted unless `bkit install --tracker=github` (or `package.json` `bkit.issueTracker`) wires it.
- **Registry**: `@cbartens/bkit@5.0.2` is public on npmjs (verified live) — no PAT/registry auth needed in the throwaway repo; the issue's later-ideas item 7 (GitHub Packages, `access: restricted`) is stale.
- **Hard stops**: design and plan end in hard stops awaiting a human; a "run" is never fully unattended, which bounds benchmark automation under every approach.
- **Telemetry**: `.bkit/stats.jsonl` `outcome` rows carry `durationSeconds` per phase; no token/cost source exists (open question in the issue stands).
- **KN-11**: `[skip ci]` at HEAD empties `statusCheckRollup` — bkit's workflows already avoid it; the example's own CI must not reintroduce skip logic.

## Approach A — Zero-Dependency Contract Stub ⭐ Recommended

One sentence: the `examples/` starting state ships a `package.json` pre-declaring every gate-called script (`typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta`, `test`, `build`, `lint-staged`) implemented with Node-stdlib-only one-liners (`node --check`, `node --test`, trivial `scripts/*.mjs`), plus a ~40-line hand-written CI workflow that declares a `bkit-tests-check` capstone job running `node --test` — satisfying bkit's gate and merge contracts at minimum weight, exactly as the issue's "plain page, one logic file" intends.

### Premortems

**10x scale (10-run benchmark, nightly):**

- _What breaks:_ wall-clock. Each run is a full 5-phase pipeline with human hard stops after design and plan; serial runs × 10 do not fit a night, so runs go parallel and hit (a) host-seat limits (one IDE session per run), (b) AI-provider rate limits (each run fans out to dozens of subagent invocations), (c) GitHub API write limits on repo create/delete/push, (d) Actions-minutes quota on the user's own account (private repos consume real minutes). The example app itself never bottlenecks (`node --test` is seconds).
- _Observability:_ per-run `outcome.durationSeconds` rows already land in `.bkit/stats.jsonl`; wall time and counters are measurable today, cost is not.
- _Recovery:_ re-run the failed copy from scratch — setup is the designed reset. A cheap 1-run canary before a 10-run sweep stops a broken prompt change from burning 10x cost.

**6 months later:**

- _What breaks:_ drift against bkit itself. A release adds a script name to `bkit:gate:static` or renames a workflow step; the stub `package.json` and fixed feature request silently rot — `gate-missing-called-scripts` fires only for _missing_ names, never for a chain that _grew_. The executed-test-count contract the capstone consumes (`tests_ran` output) is a magic wire between the CI yaml and a tiny wrapper script — a silent breakage point. Undocumented invariants (capstone job name, plain-`<script src>` rule, tracker wiring) live only in the feature-request prose.
- _Observability:_ none unless built — the example rots in `examples/` while bkit's CI stays green.
- _Recovery:_ pin `@cbartens/bkit` to an exact version in the example; add a smoke job in **bkit's own CI** that runs the example's stub gates + `node --test` fixture, so the commit that breaks the example reds bkit's CI at the source instead of a new user's machine.

**On-call at 3am:**

- _What breaks:_ a benchmark run dies mid-phase; the throwaway repo is the evidence. If teardown already deleted it, diagnosis is over. Failures inside the IDE session (agent loops, abort-handover) never reach the repo at all.
- _Observability:_ the 40-line CI is trivially readable (a point in A's favour over B); pipeline state lives in the throwaway repo's `status.jsonl` + `.bkit/stats.jsonl` + open PR.
- _Recovery:_ harvest `status.jsonl`/`.bkit/stats.jsonl` to a results dir **before** any teardown; keep failed-run repos for N days, delete green ones. Re-running setup from a fresh copy is the always-available recovery.

**Author leaves:**

- _What breaks:_ three non-obvious contracts concentrate in one head — why stub gate scripts exist (build Step 14 executes them), why the capstone job is named `bkit-tests-check` (ship's merge gate refuses without it), why `--tracker=github` is mandatory (default `none` guts the demo silently). A well-meaning "simplify the example" edit removes the benchmark's teeth (the planted traps) or the capstone, and nothing fails loudly until the next benchmark.
- _Observability:_ `examples/README.md` naming the three contracts with pointers to `manifest.ts` / `settings.ts` is the only durable fix.
- _Recovery:_ with the README contract table + the bkit-CI smoke job, a successor rediscovers breakage mechanically instead of by lore.

### Risk-mitigation guidance (fold into A)

- Pin `@cbartens/bkit` to an exact version in the example `package.json`; bump deliberately per release after a canary run.
- `packageManager: pnpm@<pinned>` field so Corepack resolves the same pnpm in the worktree installs bkit workflows trigger (`worktreeInstall: true`).
- Setup script preflights: `gh auth status`, `node --version >= 20`, pnpm resolvable, then `gh repo create --private` → push starting state → copy CI into `.github/workflows/` **before first PR** → `bkit install --tracker=github` → commit → print the start command.
- `examples/README.md` contract table: gate stubs, capstone name, tracker flag, plain-script rule, trap inventory and why each exists.
- Stub scripts honest but scoped: `typecheck: node --check`, `test: node --test`, the rest documented no-ops — the feature request must not claim the gates check more than they do.
- Retention policy in the setup script: harvest ledgers before teardown; delete green repos, keep red ones.

## Approach B — Full-Template Consumer Fidelity

One sentence: adopt `.bkit/templates/.github/workflows/bkit-ci.yml` wholesale with the real toolchain (prettier, vale, slop-scan, actionlint, husky) as devDependencies, demoing a true consumer's gate surface.

### Premortems

**10x scale:**

- _What breaks:_ flake surface multiplies — every run downloads the sha-pinned vale tarball, the actionlint binary, and a pnpm store of devDeps; one CDN blip reds a run that has nothing to do with the change under benchmark, and the benchmark's "usually passes" requirement dies. CI minutes roughly 5-10x A's. An upstream vale/actionlint release breaking the pinned download reds **all** runs until re-pinned — blast radius is total.
- _Observability:_ richer (slop, prose, actionlint signal) but irrelevant to what the benchmark measures.
- _Recovery:_ same fresh-copy reset, but each retry repays the full download surface.

**6 months later:**

- _What breaks:_ worst drift mode of the three — the template is copy-and-own, so bkit never refreshes the example's copy, while `bkit runs gate` and capstone semantics evolve with the installed bkit version: silent merge-gate mismatch, discovered at ship. The committed lockfile rots (`pnpm install --frozen-lockfile` vs registry pruning and pnpm-major drift, KN-CORE-4 class).
- _Observability:_ `bkit check` advisories cover stubs (`# bkit-stub:` headers) but not semantic drift in `runs gate`.
- _Recovery:_ re-copy the template and re-own it — a manual, lore-dependent operation.

**On-call at 3am:**

- _What breaks:_ a 780-line CI file with stub lanes, SHA-cache semantics, force markers, and concurrency groups is genuinely hard to page through; vale E100 (write-good missing) self-heal paths add noise unrelated to the demo's purpose.
- _Observability:_ more jobs = more places to look for the same failure.
- _Recovery:_ slow; mitigable only by deleting every unused stub/lane from the copy (the template permits owning a reduced version) — at which point B has paid A's authoring cost anyway, plus the template's.

**Author leaves:**

- _What breaks:_ largest tribal-knowledge surface (cache semantics, marker taxonomy, stub headers), though it is the _same_ knowledge a real consumer needs and `docs/testing.md` / `docs/deployments.md` document it.
- _Observability:_ existing docs cover the template; nothing covers "why the example owns this much CI".
- _Recovery:_ docs-backed, but the successor reasonably asks why a two-file app needs vale.

### Risk-mitigation guidance (fold into B if chosen)

- Reduce the copied template to static + unit + capstone lanes; delete every stub header and unused job on day one.
- Pin every devDep exactly; commit the lockfile; add the same bkit-CI smoke job as A.
- Same tracker flag, preflight, pinning, retention, and README-contract mitigations as A — they are approach-independent.

## Approach C — Harness-First Benchmark Rig

One sentence: A's repo shape plus a runner script that loops N runs, harvests `status.jsonl`/`.bkit/stats.jsonl` per run into a results dir, reports medians, and enforces repo teardown/retention — repeatability machinery built before the first demo.

### Premortems

**10x scale:**

- _What breaks:_ the harness itself becomes the hotspot and the serialization point — one host seat means N runs are inherently serial (hard stops already force human presence per run, so full automation is impossible regardless); a parallel variant multiplies GitHub create/delete limits and provider rate limits without removing the human gates.
- _Observability:_ best of the three — one results dir with per-run artifacts, **if** teardown preserves failures.
- _Recovery:_ harness death at run 6 of 10 leaves orphaned repos, worktrees, and a half-written results dir; needs idempotent re-entry plus a naming convention (`bkit-example-run-*`) for `gh repo list` sweeps.

**6 months later:**

- _What breaks:_ the scrape/fold logic against `status.jsonl` and `stats.jsonl` shapes — `outcome` rows gained a `coverage` field within the last few versions, proof the shapes move; the median-of-N policy (3 of 10 runs died — report median of 7 or fail?) becomes undocumented law embedded in code.
- _Observability:_ raw-row harvesting with report-time computation contains the drift; in-harness folding amplifies it.
- _Recovery:_ keep raw rows, compute at report time, keep the policy in one README table.

**On-call at 3am:**

- _What breaks:_ when the harness breaks, the benchmark breaks — the manual path (invoke setup N times, read the repos) must be documented or the capability dies with the script.
- _Observability:_ single point of failure is at least a single place to look.
- _Recovery:_ fall back to the documented manual loop; the harness is an accelerator, never the only path.

**Author leaves:**

- _What breaks:_ highest bus factor of the three — setup, loop, harvest, median policy, teardown, and quota handling concentrate in one script only its author has run; every implicit decision (when to delete, when to keep, what counts as a run) is lore.
- _Observability:_ the script's own comments and README carry everything; nothing else exists.
- _Recovery:_ a successor rebuilds the manual loop from the README, then re-grows a harness — the C-specific machinery is disposable by design or it is a liability.

### Risk-mitigation guidance (fold into C if chosen)

- Keep the manual N-times path documented and first-class; the harness only automates what the README specifies.
- Harvest raw ledgers; never fold in-harness; median/policy table in the README, not in code.
- Idempotent re-entry + `bkit-example-run-*` naming for orphaned-resource sweeps.
- All of A's mitigations (pinning, tracker flag, preflight, capstone CI, retention) apply unchanged.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Satisfy the gate chain via pre-declared Node-stdlib stub scripts in the example `package.json` (install is add-if-missing, so they survive) | Full real toolchain (B); weaken/skip gates | Weakening gates is prohibited (fix code not gates) and would misrepresent the pipeline in the demo; the real toolchain multiplies flake and cost surface against a benchmark that must usually pass and a demo that must be affordable. The benchmark measures the pipeline, not the gates. |
| Hand-written ~40-line CI declaring a green `bkit-tests-check` capstone (runs `node --test`, emits executed-test count) | Adopt the 780-line copy-and-own template; rename via `bkit.capstoneJob` | Ship's merge gate requires the capstone present+green at head; the template is the single worst drift surface (copy-and-own, never refreshed, gate semantics evolve). Minimal CI is page-readable at 3am and keeps "CI just runs node --test" true in spirit while satisfying the contract. |
| Setup script wires `bkit install --tracker=github` and preflights `gh auth` / node / pnpm | Rely on defaults; document the flag | `DEFAULT_ISSUE_TRACKER` is `none` — the default silently guts the demo (no issue reads, labels, or PR comments rendered as skip-step stubs). This is the highest-severity silent failure found. |
| Pin `@cbartens/bkit` exact version; bump deliberately after a 1-run canary | `^` range; `latest` | The example IS a version-sensitivity instrument; an uncontrolled version mixes prompt-change effects with version drift in benchmark medians. |
| Smoke-test the example (stub gates + `node --test` fixture) in bkit's own CI | No source-side guard; consumer-side only | The example's breakage modes are invisible from bkit's green CI today; the source-side smoke job is the only mechanism that reds the breaking commit instead of the next demo user. |
| Benchmark = repeated setup-script invocations with harvested ledgers and a small median report; defer the full harness (C) | Build C now; no benchmark story | C's harness concentrates the highest bus factor and cannot remove the human hard stops anyway; the harvested-ledger median gives the Ponytail "middle result" without a second system to maintain. |
| Retention: harvest ledgers pre-teardown; delete green repos, keep red ones N days | Delete all; keep all | Delete-all destroys 3am evidence; keep-all accumulates private repos and Actions-minutes history the user never asked for. |

## Cross-Approach Risks

- **Gate-chain growth breaks every approach:** a new script name in the seeded `bkit:gate:*` chain fails the example regardless of stub or template; only the bkit-CI smoke job catches it at the source. Belongs in the design's Risks & Open Questions with the smoke job as the named mitigation.
- **Tracker-default-`none` is silent:** no error, no gate — workflows render skip-stubs and the demo narrates a pipeline that never touched the tracker. Preflight + explicit flag in the setup script; consider whether `bkit doctor`/install advisories should warn on `none` in a repo created for the pipeline (out of scope here, worth a deferral row).
- **Human hard stops bound automation:** design and plan end awaiting a human, so "run it several times" is human-in-loop per run under every approach; benchmark scheduling, cost estimates, and nightly aspirations must account for this — it also caps how much of C is ever buildable.
- **AI non-determinism vs "usually passes":** pass/fail (logic tests green, PR merged) is robust; "the reviewer caught the planted trap" is not guaranteed per run and must stay measured-never-gated (consistent with #232's flaky-grader rule). The demo narrative must not promise a catch.
- **Cost remains unmeasured:** `outcome.durationSeconds` and counters are the only per-phase data; "cheaper" claims are limited to wall time + counters until a token/cost source (likely host session transcripts) is designed — an open question the design must carry, not solve.
- **Actions-minutes quota on the user's account:** private throwaway repos consume the user's minutes; a 10-run benchmark can stall mid-sweep on free-tier accounts. Surface expected consumption in the demo docs.
- **Skeleton stability is real but not frozen:** phase names, loop caps (`MAX_DEBUG_ATTEMPT`), and hard-stop placement are the explainer's content; they are stable across versions but not immutable — the fixed content data file needs a documented owner-check per release or the explainer slowly lies.
- **Stale premise in the issue:** later-ideas item 7 assumes GitHub Packages restricted access; the package is public on npmjs today. The design must not carry private-registry auth into any publish path.
