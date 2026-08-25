Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

## Ecosystem Search

Five capabilities the design requires, each checked against what GitHub and the repo already provide.

### 1. "Merge exactly the SHA that was validated"

**What exists:** `gh pr merge --match-head-commit <SHA>` — a first-class flag on the GitHub CLI (`gh pr merge` manual, current): _"Commit SHA that the pull request head must match to allow merge."_ The server rejects the merge when the head has moved, atomically, inside the merge call itself.

**Fit:** exact. The design's gate is a separate process step (`bkit-ship-gate.sh assert --head <sha>`) followed by `gh pr merge --squash`. Those are two API calls with a window between them; a concurrent push, a UI "Update branch" click, or a `bkit-cloud` dispatch landing in that window merges a head the gate never saw. Success criterion 1 says "immediately preceded by a passing assertion", which is the strongest property a two-call sequence can have, and it is strictly weaker than the property the design actually wants.

**Recommendation: USE-AS-IS.** Pass `--match-head-commit "$GATE_HEAD"` on the merge. One flag closes the window at zero cost, and it makes criterion 1 mechanically true rather than approximately true.

### 2. "Never merge on a stale green" / "never merge a stale base"

**What exists:** branch protection with required status checks. GitHub evaluates required checks per-SHA, so a green run at a superseded SHA does not satisfy protection at the current head — the exact failure this issue is built around, solved server-side and for every merge path including the browser UI. "Require branches to be up to date before merging" is the server-side form of the `merge-base --is-ancestor` fork. The repo already ships `.bkit/scripts/bkit-protect-main.sh`, which sets required-check protection and (`:22`) verifies a job by that name exists before requiring it.

**Fit:** partial. It does not replace the gate — ship needs a synchronous, scriptable verdict with reasons, and `--auto` (queue-and-wait) does not fit a workflow that continues to Steps 7+ after the merge. But as defence-in-depth it dominates the design's chosen mitigation for the human-override risk: Flow 5 argues at length that printing both SHAs makes a green-looking PR self-refuting on screen, which relies on the 3am operator reading carefully. Protection on `dev` makes the UI merge button unavailable instead.

**Recommendation: ADAPT.** Keep the gate as designed; extend the existing `bkit-protect-main.sh` to `dev` as a separate, additive lever. Verify the plan tier first — branch protection on private repos is plan-gated, though all three evidence repos already run protection on `main`, which is suggestive.

### 3. "Integrate, re-test, then merge" (the whole Path B loop)

**What exists:** GitHub merge queue — rebases onto the base, runs CI on the resulting `merge_group`, merges only if green, all server-side. It is a superset of Path B.

**Fit:** blocked. Merge queue is available on GitHub Enterprise Cloud/Server and on public org-owned repos only; private repos outside Enterprise cannot enable it (GitHub changelog, GA announcement, still current in the ruleset docs). bkit's consumer repos are private and not Enterprise. It also requires a `merge_group` trigger in every consumer `ci.yml`.

**Recommendation: BUILD-CUSTOM** — but record the rejection with its mechanism, in the design's own house style. "Why not merge queue" is the first question any reviewer with GitHub-platform background will ask, and "not available on our plan" is a durable answer where silence is not.

### 4. Workflow-markdown structural invariants (Tier 2)

**What exists:** `bkit-counter-prose-audit.test.ts` (fenced-block stripping via a backreferenced fence-width regex), `bkit-ci-dispatch-gate-alignment.test.ts` (cross-file byte-identity of delimited kernel blocks), `bkit-comply-gate-wiring.test.ts`, `bkit-telemetry-workflow-writers.test.ts`.

**Recommendation: USE-AS-IS.** Verified: the design's correction of the issue text is right. `bkit-ship-invariants.test.ts` is one file modelled on files that already exist, and `stripFencedBlocks` is directly reusable — the prose-vs-fenced distinction is exactly what "no `git add -A` anywhere in `bkit-ship.md`" needs.

### 5. Shell-tier testing with mocked `gh` (Tier 1)

**What exists:** bats via `npx --yes bats`, wired at `ci.yml:500-502` as `npx --yes bats tests/*.bats` — a glob, so `tests/ship-gate.bats` is picked up with no CI edit. Five bats files exist.

**Fit: weaker than the design states.** Verified by inspection: no bats file in `tests/` stubs an external command — no PATH shim, no `function gh`, no fixture harness. `tests/fixtures/` holds consumer scaffold directories, not API JSON. And the one script in `.bkit/scripts/` that calls `gh` (`bkit-protect-main.sh`) is among the three with no bats coverage at all. The design's "eight helper scripts … each with `.bats` coverage" is not accurate — five bats files cover counter-bus, status-route and workflow-telemetry; protect-main, slop-delta and slop-type-suppression have none, and status-fold is covered from vitest.

**Recommendation: BUILD-CUSTOM (small).** A PATH-shim `gh` stub plus a `tests/fixtures/gh/` JSON corpus is standard bats practice and half a day's work. Flagged only because the design uses "the harness already exists" to argue Tier 1 is cheap, and a plan written from that sentence will under-scope the one genuinely new piece of test infrastructure in the change.

## Stack Feasibility

Buildable with the approved stack, with no new dependency of any kind.

<!-- prettier-ignore -->
| Requirement | Status |
| --- | --- |
| `bash` + `jq` in a shipped script | Precedent: 5 of 8 scripts already use `jq` |
| `gh api` from a shipped script | Precedent: `bkit-protect-main.sh` |
| bats lane for a new script | `ci.yml:502` globs `tests/*.bats`; no CI edit |
| vitest markdown invariant | Four sibling suites; `REPO_ROOT` via `__dirname` is the house pattern |
| New npm dependency | None required — `picomatch` stays the only runtime dep |
| Coverage gate | Unaffected — `test:coverage:unit` enumerates specific `.bkit/src/*.ts`; a test-only addition adds no covered source |

Confirmed against the tree, since the whole Tier-1 argument rests on them:

- `ci.yml:111-112` — `pull_request` and `workflow_dispatch` both force `run_level=full`. Correct as cited.
- `ci.yml:~119-137` — merged-PR dev push resolves to `light`; a direct dev push escalates to `full`. Correct as cited.
- `ci.yml:19-21` — `cancel-in-progress` scoped to `pull_request`. Correct as cited.
- `ci.yml:614-677` — the capstone `needs` all three lanes with `if: ${{ !cancelled() }}` **and** asserts the plan was honoured, including a per-lane non-hollow `assert_ran` guard. The design under-sells this: the capstone is stronger than "all lanes green".
- `.bkit/workflows/bkit-ship.md` is 1244 lines. Correct as cited.

Three distribution constraints the design should carry into planning, all satisfiable:

1. `.bkit/scripts` is excluded from the published npm `files` list. Consumers receive scripts from `.bkit/templates/.bkit/scripts/`; the root copy is the dogfood mirror. A new gate script is therefore **two** files that must stay byte-identical, enforced by the templates snapshot and `bkit-dogfood-noop.integration.test.ts`.
2. `.bkit/scripts/*` is Tier 1 — bkit-owned, force-overwritten on upgrade. Nothing a consumer may tune can live there. This makes the design's choice of `package.json` → `bkit.capstoneJob` correct rather than merely convenient, and it is worth saying so in the design, because the adjacent sentence ("every timeout and limit goes in one config file, matching the `bkit-counter-bus-config.sh` precedent") points the opposite way. The rule is: bkit-owned defaults → managed config script; consumer-tunable → `package.json`.
3. `bkit.capstoneJob` needs no install-side plumbing. `stripManagedKeys` only touches `scripts` and `devDependencies`, so a read-only key written by hand and read by `jq` survives install, upgrade and uninstall untouched.

## Library / API Evaluation

No libraries. The evaluation surface is the GitHub REST/CLI API.

<!-- prettier-ignore -->
| Surface | Assessment |
| --- | --- |
| `GET /repos/{o}/{r}/actions/runs?head_sha=` | Stable, documented, supports the filter. **But repo-wide** — see CRITICAL-2 |
| `GET /repos/{o}/{r}/actions/workflows/{id}/runs?head_sha=` | Same filter, scoped to one workflow. This is the endpoint the gate wants |
| `GET /actions/runs/{id}/jobs` | Needed for capstone **presence**. Paginates at 30 — needs `--paginate`; bkit has 4 jobs, a matrix-heavy consumer will exceed one page and silently read "capstone absent" (exit 13) |
| `gh pr merge --match-head-commit` | Available; closes the design's merge race |
| `gh pr merge --admin` | Relevant to the override discussion — a supported, server-logged bypass |
| `gh workflow run` | Requires `actions: write`. A read-scoped PAT makes Path B's unconditional dispatch unexecutable, surfacing as exit 20 forever |
| `gh api rate_limit` | Unmeasured, as the design says. Path B adds one poll loop per ship |

License, bundle size and type coverage are not applicable — no package is added, and the new artifacts are one `.sh` and one `.test.ts`.

## Integration Risk

Blast radius is moderate and well-fenced. Single package, no turbo, no affected graph.

**Additive, low risk:** `.bkit/scripts/bkit-ship-gate.sh` + templates mirror, `tests/ship-gate.bats` + `tests/fixtures/gh/`, `.bkit/src/bkit-ship-invariants.test.ts`, `package.json` → `bkit.capstoneJob`.

**Rewrite, higher risk:** `bkit-ship.md` (1244 lines) plus `.claude/commands/bkit-ship.md` (byte-identical), `.cursor/commands/bkit-ship.md` (transformed), the opencode surface, `.bkit/workflows.md`, and the `bkit-templates-content.test.ts` snapshot. All four render surfaces are regenerated by `bkit install`, and the dogfood-noop and templates-content suites fail loudly on drift — the coupling is real but it is mechanically detected, not silent.

**Cross-consumer coupling:** step-key stability. `bkit-status-fold.sh`, `bkit-status-route.sh` and the counter-bus all key on step names, and consumer repos carry in-flight runs. The design's decision to publish and freeze the canonical `ship-*` set is the right call and is the highest-value non-obvious constraint in the document.

**Sequencing:** #341 also rewrites this file. Named in the design as open question 1; a governance call, not a buildability one.

**Version skew:** acknowledged by the design. Worth noting the concrete failure: a consumer on an older `bkit-ship.md` calling a newer `bkit-ship-gate.sh` gets the exit-code table wrong. Since `.bkit/scripts/*` is force-overwritten and the commands are re-rendered by the same `bkit upgrade`, they cannot skew _within_ a release — only a partially-applied upgrade skews, which `bkit check` reports.

**One CI subtlety worth knowing before writing fixtures:** `ci.yml:270-295` short-circuits every lane when a prior green run exists at the identical `headSha` within 7 days. So a capstone can conclude `success` in a run that executed zero tests. This is sound (the cache key is the exact commit SHA) but it means `--explain` will sometimes report a 40-second green, and a fixture set that omits the cache-skip shape will not represent real traffic.

## PoC Approach

Do not touch `bkit-ship.md`.

Capture six `gh` JSON payloads from the three repos into `tests/fixtures/gh/`: green capstone at head; run at head with the capstone absent; failed run; in-progress run; green run at a superseded SHA; and PR #720's `total_count 0`. Add a cache-skipped green as a seventh.

Write `bkit-ship-gate.sh assert --head <sha> [--capstone <job>]` against the **workflow-scoped** runs endpoint, resolving the job name from `package.json`, emitting the exit-code table.

Write `tests/ship-gate.bats` with a PATH-shimmed `gh` stub that dispatches on argv to a fixture file — this stub is the reusable piece and is what makes Tier 1 affordable later.

Prove: seven fixtures map to seven exit codes; the stale-green fixture prints both SHAs and the run URL.

Then run `--explain` read-only against one live PR in each of the three repos and diff the verdict against `gh pr checks`.

Success is the exit-code table holding on real payloads and `--explain` agreeing with reality in all three repos. Roughly a day. If the stub or the run-selection rule cannot be settled in that time, the Tier-1 carrier is more expensive than the design assumes and the tiering should be revisited before any prose is rewritten.

## Unknowns & Blockers

1. **Run selection at one SHA is undefined.** Needs a decided rule before the script can be written (CRITICAL-2).
2. **`gh` stub ergonomics in bats** — no in-repo precedent; resolved by the PoC above.
3. **`actions: write` on the operator PAT** — unverified across the three repos; determines whether Path B works at all. One `gh api` call to check.
4. **Rate-limit behaviour** — as the design states, unmeasured. The PoC's `--explain` runs are a cheap first sample.
5. **Branch-protection plan tier on `dev`** for the ecosystem recommendation above. Only affects the optional defence-in-depth lever.
6. **Whether `run_level` can be asserted from outside the run.** The design leaves this open. Buildability answer: not cheaply — job-level outputs are not exposed on the runs API, so the gate would have to parse the capstone's step summary. Recommend the documented-consumer-contract option, and note the sharper mechanism: the capstone's own guards are all conditioned on `plan_run_level != "none"`, so `run_level=none` is precisely the state that makes it vacuous.

## Verdict Reasoning

CONCERNS.

The design is buildable as specified, with no new dependency, no new framework, and no capability the stack lacks. Every load-bearing claim I could check against the tree held: the `ci.yml` line references, the 1244-line file, the vitest markdown-invariant precedent, the bats CI wiring, and the correction of the issue's "nothing parses workflow markdown". The tiered-carrier argument is sound and the carriers exist.

It is not PASS because two findings would produce a gate that does not deliver its stated property. The assert-then-merge sequence has a race the design does not name, and GitHub provides the one-flag fix. The SHA-keyed query, as written, selects across every workflow in the repo — and since `bkit-cloud.yml` and `release.yml` can both produce runs at the same head SHA, the design's own rule that an absent capstone must FAIL inverts into a gate that always fails. Both are cheap to fix and neither disturbs the architecture, which is why this is CONCERNS and not FAIL.

The third and fourth findings are smaller but belong in the design rather than in a plan's discovery: the bats `gh`-stub harness does not exist yet and the design says it does, and `cancelled` — the conclusion produced by the `cancel-in-progress` behaviour that is one of this issue's two headline justifications — has no exit code in a table whose whole thesis is one code per condition.

## CRITICAL

1. **The gate and the merge are two API calls; the design needs them to be one decision.** `bkit-ship-gate.sh assert --head X` followed by `gh pr merge --squash` merges whatever the head is at merge time, not X. The window is small but this workflow is run by concurrent agents against branches that other phases push to, and the design elsewhere treats exactly this class of race as load-bearing. Fix: `gh pr merge --squash --match-head-commit "$GATE_HEAD"`, and restate success criterion 1 as "the merge call itself refuses a head other than the validated one".

2. **Define run selection before the exit-code table can be implemented.** `GET /actions/runs?head_sha=` is repo-wide. At a single feature-branch head there can legitimately be a `ci.yml` run from `pull_request`, a second `ci.yml` run from Path B's unconditional dispatch, and a `bkit-cloud.yml` run from `workflow_run`. Applied per-run, "capstone absent ⇒ exit 13" fires on the cloud run every time. Applied as "any run has a green capstone", a stale-config dispatch can satisfy the gate. Decide: scope the query to the CI workflow (`/actions/workflows/{id}/runs?head_sha=`), then pick the most recent **completed** run of that workflow, and say so in the design. This also introduces a second consumer-specific literal — the CI workflow filename — which should be resolved alongside `bkit.capstoneJob` rather than hard-coded as `ci.yml`.

3. **Correct the Tier-1 cost claim.** `.bkit/scripts/` does **not** have per-script bats coverage — five bats files cover three scripts, and the only `gh`-calling script is one of the uncovered three. No bats file in the repo stubs an external command, and `tests/fixtures/` contains no API JSON. The carrier choice is still right, but the design's stated basis for it is wrong, and a plan written from it will omit the `gh`-stub harness — the one piece of genuinely new infrastructure in the change.

4. **Add an exit code for `cancelled`.** `ci.yml:19-21` cancels superseded PR runs, and a cancelled run at the current head is neither absent (10), nor in progress (11), nor concluded failure (12), nor a superseded green (14). Given that a docs-only push cancelling run 29454200201 is one of the two justifications for the frozen head, "the run at your head was cancelled — push nothing and dispatch" is a message this gate will emit often, and collapsing it into 12 reproduces in miniature the two-string collapse the design is replacing.

## OPTIONAL

- **Paginate the jobs query.** Capstone-presence detection reads `/actions/runs/{id}/jobs`, which pages at 30. bkit has four jobs; a matrix-heavy consumer does not, and the failure mode is a silent exit 13 — a refusal to merge a genuinely green PR, which is the fastest possible route to the operator override the design is trying to prevent.
- **Move the override record inside the gate.** `BKIT_SHIP_GATE_OVERRIDE=<sha>` is set in the same shell the agent controls, and if the workflow prose is what writes the `status.jsonl` row, the row is as skippable as the gate. Have the gate write its own override row and require the value to equal the head it just refused. Consider `gh pr merge --admin` as the visible alternative — it is server-logged rather than self-reported.
- **Record the merge-queue rejection with its mechanism.** Not available for private non-Enterprise repos, and it requires a `merge_group` trigger in every consumer `ci.yml`. The design names its rejected alternatives with mechanisms everywhere else; this is the most prominent missing one.
- **Extend `bkit-protect-main.sh` to `dev` as defence-in-depth.** Server-side required checks close the UI hand-merge that Flow 5 mitigates by printing SHAs, and the script already verifies the job exists before requiring it. Additive and separable from this design.
- **State the config-home rule.** `.bkit/scripts/*` is Tier 1 force-overwritten, so consumer-tunable values must live in `package.json` and only bkit-owned defaults may live in a managed config script. The design makes the right call for `capstoneJob` and the adjacent `bkit-counter-bus-config.sh` sentence points the other way.
- **Preflight `actions: write` once.** Path B's unconditional dispatch is unexecutable on a read-scoped PAT and will present as a permanent exit 20 — the same class of durable misdiagnosis as today's `403 = PAT scope` message.
- **Name the outbox's real durability boundary.** `$GIT_COMMON_DIR/bkit-outbox/{FID}/` survives `worktree remove`, which is the Finding 6 loss mechanism, but it does not survive a fresh clone or a cross-machine resume, and it is invisible to both `git status` and `bkit check`. Say that the flush must complete within the run that wrote it.
- **Include a cache-skipped green in the fixture set.** `ci.yml:270-295` skips every lane when a prior green exists at the identical SHA, so a real green can execute zero tests. Sound, but `--explain` should say so rather than let a reader conclude the run was hollow.
- **Consider adding `test:bats` to pre-push.** The hook runs typecheck, vitest and `bkit check` but not bats, so the gate's own tests only run in CI — a slow loop for the one artifact whose failure is unrecoverable.
- **The capstone is stronger than the design credits.** It also asserts the plan was honoured and that each non-cached lane executed more than zero tests (`assert_ran`). That is worth a sentence in Flow 5, since it is additional load the single assertion is already carrying.

## OUT OF SCOPE

- #341 versus 384 landing order — a sequencing decision for the issue owner, already named as open question 1.
- Mandating `dev` branch protection across consumer repos — a separate, additive change with its own rollout.
- Validating the Tier-3 detector against consumer corpora, which live outside this repo's CI.
- The buried-`[skip ci]` commits that build and debug write to `feat/{FID}`. The design correctly notes ship inherits poisoned branches and that unconditional dispatch works around it; removing the source belongs to those workflows.
