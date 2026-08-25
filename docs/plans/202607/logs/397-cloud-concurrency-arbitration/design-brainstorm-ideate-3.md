# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover. Primary angle: SEQUENCING / systems-coupling (trigger x branch x conclusion matrix, #363 landing order, shipped-surface survival).

---

## Grounding — verified vs inferred

**Verified against real files in this worktree:**

<!-- prettier-ignore -->
| # | Claim | Evidence |
| --- | --- | --- |
| V1 | Today's group is a single line, `cancel-in-progress: true` | `.github/workflows/bkit-cloud.yml:73-74` |
| V2 | #363's plan v4 widens to `['feat/**', 'fix/**', 'dev']` and **deliberately EXCLUDES `main`** (deferral row + tracker note = Task 14) | `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md:303, :81, :206-208, :851, :943` |
| V3 | #363 lands `cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}` — a _denylist_ expression, group expression unchanged | same plan `:306-317`, Open Question 3 `:168` |
| V4 | **Both arbitration locks are gitignored** — `docs/plans/*/logs/**/.lock` and `.bkit/.dev.lock` | `.gitignore:48, :50-51` |
| V5 | Locks are local-filesystem `set -C` noclobber files under `$REPO_ROOT` | `.bkit/workflows/bkit-ship.md:83-87, :873-878`; `.bkit/workflows/bkit-plan.md:100-103, :839-843` |
| V6 | `bkit-cloud.yml` is Tier-1 `byte-equal-text` — force-overwritten by install AND upgrade; consumer edits are destroyed, not merged | `.bkit/src/bkit-manifest.ts:344, :350`; comment `:399` |
| V7 | The `bkit:start/end` markers inside it (`auto-route-gate`, `shared-deriv`) are **not** preservation markers — they are asserted by tests, and duplicated verbatim across the two jobs | `.bkit/src/bkit-modules.integration.test.ts:1215-1232`; template `:89/96/190/214/254/261/325/344` |
| V8 | A test asserts the committed `.github/workflows/bkit-cloud.yml` is **byte-equal** to `renderCloudWorkflow(template)` with `{{CLOUD_RUNNER}}` -> `ubuntu-latest` | `.bkit/src/bkit-modules.integration.test.ts:1133-1146` |
| V9 | Two tests find the group by `line.includes("group: bkit-auto-")` and assert that ONE line contains both `inputs.issue` and `head_branch`, and no `replace(` | same file `:1092-1116` |
| V10 | Both jobs (`run`/claude and `opencode`) fire on the SAME event when both secrets are present — additive by design | `.github/workflows/bkit-cloud.yml:8-13, :83, :252` |
| V11 | Ship merges with `--match-head-commit` and re-asserts the gate at current head; "stale green" (code 14) routes back to re-validate | `.bkit/workflows/bkit-ship.md:620, :676, :678-684` |
| V12 | In GHA the runtime resolves to `GITHUB_ACTION` (`GITHUB_ACTIONS=true`) -> `RUNTIME_WORKTREES=true`, `RUNTIME_DEVPUSHES=true`, so ship's dev-sync `.dev.lock` block DOES execute on the runner | `.bkit/scripts/bkit-runtime.sh:167-183`; `bkit-ship.md:870-878` |
| V13 | GHA expressions have `startsWith()`; the "cannot normalise the two tokens" comment is about `replace`/regex/split, not about branch-prefix tests | `.github/workflows/bkit-cloud.yml:62-72`; test rationale `:1066-1082` |

**Inferred / needs confirmation in the design pass (flagged, not assumed):**

- **I1 — depth-1 queue.** With `cancel-in-progress: false`, GHA holds at most ONE pending run per group; a newly-arriving run **cancels the older pending one**. #363's plan asserts exactly this (`:91`, `:168`, `:905`) but cites no doc link. Load-bearing for every approach below — verify against GitHub docs before the design is written.
- **I2 — job-level `concurrency` can read the `needs` context.** If true, a cheap resolver job can normalise the FID and the heavy jobs can key on it. This is the single fact that decides whether Gap 2 is solvable inside GHA. Verify.
- **I3 — a run whose jobs are all skipped by the job-level `if:` still enters (and briefly holds) the concurrency group**, and therefore still evicts a pending run. Consistent with "group is evaluated from trigger payload before any step runs" (V13), but not directly observed.
- **I4** — a queued ship that eventually starts will find its PR behind `dev`, `update-branch`, and then poll for a fresh CI (`bkit-ship.md:676` code 11). Duration inference, not measured.

**Two premises of the issue body are FALSE in the cloud runtime (V4 + V5).** `.bkit/.dev.lock` and `docs/plans/*/logs/{FID}/.lock` are gitignored local files, and every cloud run is a fresh runner with a fresh `actions/checkout` (`bkit-cloud.yml:123-135`). Therefore:

- Gap 1's "they serialise via the in-workflow `.dev.lock`... burn minutes waiting up to the 600s deadline" — **no.** Each runner creates its own lock instantly and both proceed. Two concurrent cloud ships are not a runner-minute waste problem, they are an unserialised concurrent-merge problem. The only thing standing between them is `--match-head-commit` (V11).
- Gap 2's "one acquires the lock, the other hits the Failure Path with `lock held by ...`" — **no.** Two cloud runs for the same FID never see each other's `.lock`. The described spurious-`bkit:failed` symptom is the LOCAL two-workflows-one-clone failure, not the cloud one. In the cloud there is currently **no** cross-surface arbiter at all.

This reframes requirement 4 ("locks become the corruption-backstop"): in the cloud there is no backstop. GHA concurrency is the ONLY serialiser, which raises the correctness bar on whichever group expression ships.

---

## The matrix — post-#363

Routed phase per cell, and the group each cell should map to. `main` is not a trigger after #363 (V2) but is shown because #363's own D-final settled it and the deferral is explicitly revisitable.

<!-- prettier-ignore -->
| # | event | head_branch | conclusion | inputs.phase | routed phase | correct group |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `workflow_dispatch` | n/a | n/a | `ship` | ship | `bkit-ship-global` |
| 2 | `workflow_dispatch` | n/a | n/a | `debug`/`design`/`plan`/`build` | that phase | `bkit-auto-{inputs.issue}` |
| 3 | `workflow_run` | `feat/**` | `success` | — | ship | `bkit-ship-global` |
| 4 | `workflow_run` | `feat/**` | `failure` | — | debug | `bkit-auto-feat/{FID-slug}` |
| 5 | `workflow_run` | `fix/**` | `success` | — | ship (newly folded, #363 P2) | `bkit-ship-global` |
| 6 | `workflow_run` | `fix/**` | `failure` | — | debug (dispatch-capped) | `bkit-auto-fix/{FID-slug}` |
| 7 | `workflow_run` | `dev` | `success` | — | **no-op** | `bkit-auto-dev` |
| 8 | `workflow_run` | `dev` | `failure` | — | debug (dispatch-capped) | `bkit-auto-dev` |
| 9 | `workflow_run` | `main` | any | — | not triggered (deferred; would be no-op / debug) | `bkit-auto-main` |
| 10 | `workflow_run` | any | `cancelled`/`skipped`/`neutral`/`timed_out` | — | no-op | per-branch group |

**Cell 7 is the one the issue's proposed expression gets wrong.** `github.event.workflow_run.conclusion == 'success'` is true for cell 7, so every green `dev` CI — i.e. _every successful merge_, the single most frequent event in an active repo — would be admitted to `bkit-ship-global`. Two consequences, the second much worse than the first:

1. The dev-success run boots, occupies the ship slot, and no-ops at the ctx step (`:50` of the #363 plan). Wasteful.
2. Under I1, that arriving run **cancels whatever ship was pending**. Green-dev-CI events become ship-queue poison. Since a ship _causes_ a dev CI run, this is self-inflicted: ship A merges -> dev CI starts -> ship B (green PR) queues behind A -> dev CI for A goes green -> the dev-success run evicts pending ship B -> B never runs and there is no retry. Silent ship loss, correlated with normal operation.

Cell 10 has the same shape at lower frequency (a cancelled CI is a `completed` event; the ctx step no-ops it at `:180`, but the run still enters the group).

**Correct discriminator (allowlist, not denylist):**

```
ship-cell := (inputs.phase == 'ship')
          || ( github.event_name == 'workflow_run'
               && github.event.workflow_run.conclusion == 'success'
               && ( startsWith(github.event.workflow_run.head_branch, 'feat/')
                 || startsWith(github.event.workflow_run.head_branch, 'fix/') ) )
```

Allowlist, deliberately. A denylist (`conclusion == 'success' && head_branch != 'dev'`) passes today's test matrix and silently mis-routes the moment `main` is re-added (cell 9), which #363 has explicitly parked as revisitable (V2). The allowlist form is the only one that is correct _by construction_ against a filter that is known to be still moving.

---

## Approach A — Two-tier: allowlist ship discriminator (workflow) + resolver-fed FID group (job) ⭐ Recommended

**Summary.** Keep one workflow-level group that implements the matrix above via the allowlist discriminator with `cancel-in-progress: false`, and add a cheap `resolve` job whose output (a canonical FID normalised from EITHER payload shape) becomes the job-level `concurrency` group of the two heavy agent jobs — closing Gap 2 inside GHA, without a new state surface, contingent on I2.

Shape:

```yaml
concurrency:
  group: >-
    ${{ (inputs.phase == 'ship' || (github.event_name == 'workflow_run' && ...allowlist...))
        && 'bkit-ship-global'
        || format('bkit-auto-{0}', inputs.issue || github.event.workflow_run.head_branch) }}
  cancel-in-progress: false

jobs:
  resolve: # ~1 runner-minute, no checkout, gh api only; emits outputs.fid
  run: # needs: resolve
    concurrency:
      group: bkit-fid-${{ needs.resolve.outputs.fid }}
      cancel-in-progress: false
  opencode: # needs: resolve — SAME job-level group as `run`
```

Why the resolver works where the workflow-level expression cannot: the "no expression normalises `{ISSUE}` and `feat/{FID-slug}`" analysis (V13, `bkit-cloud.yml:62-72`) is true for _workflow-level_ groups, which see only the trigger payload. A job-level group is evaluated later and — per I2 — can read `needs.*.outputs`, i.e. a value computed by real shell. The existing `shared-deriv` block already computes exactly that FID; the resolver is a re-siting of code that exists, not new logic.

Bonus property: it is also the only approach that serialises the two jobs _within one run_ (V10). Today, a consumer with both `ANTHROPIC_API_KEY` and `OPENCODE_PROVIDER_KEY` set gets two agents shipping the same PR simultaneously — workflow-level concurrency cannot separate them because they are the same run. A shared job-level group does.

### Premortems

**10x scale (10 active FIDs, ~30 cloud events/day).** `bkit-ship-global` becomes a hard capacity-1 bottleneck for the whole repo, and a ship is long (merge + dev-sync + close). Fan-out is fine (per-FID debug stays parallel), blast radius is the ship lane only. The real bottleneck is I1: at depth 1, ships 3..N are _cancelled pendings_, not a queue. At 10x this is not an edge case, it is the steady state. What breaks: shipping silently stops for PRs that lost the pending slot; the tracker shows `bkit:ship` labels that never progress. Observability: cancelled runs appear in the Actions UI with no reason string attached to the _cause_. Recovery: manual `/bkit-ship` re-dispatch — but nobody knows which PR to re-dispatch. **This is the approach's dominant risk and must be mitigated, not accepted** (see guidance).

**6 months later.** Three magic strings become load-bearing and undocumented: `'bkit-ship-global'`, the `feat/`+`fix/` prefix pair, and the resolver's FID normalisation. When someone adds a new branch prefix (say `hotfix/**`) or re-enables `main` (cell 9, already parked as revisitable), the allowlist silently declines to treat it as a ship and the cell falls into `bkit-auto-hotfix/...` — a _plausible-looking_ group, so the bug looks like correct behaviour. The undocumented invariant is "the allowlist must equal the set of ship-routing cells in the ctx-step `case`" — two places, no gate binding them. The resolver duplicates `shared-deriv` logic that already exists twice (both jobs) — that becomes three copies drifting.

**On-call at 3am.** Page shape: "why did nothing ship?" or "why are two ships fighting?". Diagnosability is the weak point — a concurrency-cancelled run has no bkit-authored log line, no tracker comment, no label. Nothing in `status.jsonl` records "I was evicted", because the run never reached a step. Recovery path is a manual dispatch. The resolver job at least gives a cheap, always-present log line naming the resolved FID and the group it will contend for — that is the diagnostic anchor to design in deliberately.

**Author leaves.** Highest knowledge concentration of the three approaches: I1's eviction semantics, I2's `needs`-in-`concurrency` capability, why the discriminator is an allowlist not a denylist, and why the resolver exists at all (the `62-72` comment says it is impossible — a reader will "simplify" the resolver away and reintroduce Gap 2). Bus-factor mitigation must be a comment block plus a test that fails on removal, not a doc.

### Risk-mitigation guidance (layer onto this approach)

- **Make the discriminator single-sourced with the routing.** Derive the allowlist branch-prefix set and the ctx-step `case` from one place, or add a test that parses both out of the YAML and asserts set-equality. Otherwise the matrix drifts on the next branch-filter change — and the branch filter _is_ moving (#363 already moved it twice, and `main` is parked).
- **Make cancelled-pending observable.** Add a step at the very top of the heavy job that appends a `cloud-admitted` row to `status.jsonl` with the group name and `github.run_id`; and pair it with the reconciler idea from Approach C so eviction is recoverable rather than merely visible. At minimum, name the eviction risk in `docs/cloud.md` so 3am has a hypothesis to test.
- **Do not put `dev`-success in any shared group.** Cell 7 no-ops; keeping it in `bkit-auto-dev` (not ship-global) is correct, but note it will evict a pending dev-debug. That eviction is arguably desirable (a later green dev supersedes an earlier red one) — write that down as an intentional property, otherwise it reads as a bug and gets "fixed".
- **Guard the tests you will break.** V9's two tests locate the group by a single line containing `group: bkit-auto-`; a folded `>-` group expression makes that line disappear and both tests fail on a _correct_ change. Update them to parse YAML (the repo already has `yq` in #363's plan) rather than string-match, so they assert the mapping, not the formatting.
- **Regenerate the canonical mirror in the same commit.** V8's byte-equality test fails otherwise; V6 means consumers get the change only via `bkit install`/`upgrade`, and a consumer who hand-edited `bkit-cloud.yml` loses it silently. Add an advisory (the repo already ships `detectBkitCloudYmlAlwaysTrueGate` as precedent at `.bkit/src/bkit-postinstall.ts:371`) if the installed file's concurrency block does not match the shipped contract.
- **Verify I2 before committing to the shape.** If job-level `concurrency` cannot read `needs`, Approach A collapses to Approach B and the design must say so up front rather than mid-build.
- **Budget the resolver.** GitHub-hosted jobs bill a per-job minimum; one shared resolver for both heavy jobs, no `actions/checkout`, `gh api` only.

---

## Approach B — Minimal: corrected workflow-level expression only, Gap 2 accepted and made quiet

**Summary.** Ship only the corrected allowlist discriminator + global `cancel-in-progress: false` (Gap 1), and close Gap 2 by making the loser cheap and non-alarming rather than preventing it — the issue's own option (a), but re-derived against V4/V5 rather than against the lock story the issue assumed.

The critical correction: because the locks are gitignored (V4), option (a) as written in the issue does not work in the cloud. There is nothing to "detect held" — the second runner's checkout has no lock file. To make (a) real, the arbiter has to be something both runners can see: an open-run query (`gh run list --workflow bkit-cloud.yml --status in_progress`, filtered by resolved FID via `run-name`, which already encodes phase+issue at `bkit-cloud.yml:53-56`), or a committed sentinel. That is a materially bigger change than "add an early exit", and the design should not describe it as the small option without pricing it.

### Premortems

**10x scale.** Same ship-lane bottleneck and same I1 eviction risk as A, minus the resolver cost. Gap 2 gets worse with scale, not better: same-FID cross-surface collisions scale with dispatch frequency, and each collision is now two full agent sessions doing conflicting work on one FID (not one failing cleanly, because the lock that was supposed to stop it does not exist across runners). Blast radius: concurrent writes to the same `status.jsonl` and the same `feat/{FID}` branch from two runners. NDJSON `merge=union` protects the file; nothing protects the branch.

**6 months later.** The documented rationale ("the per-FID `.lock` arbitrates cross-surface, boot-then-fail is the rare-path cost") will be in `docs/cloud.md` and will be **wrong** — it describes the local runtime while the text sits in the cloud section. Someone will trust it during an incident. This is the worst drift shape: a plausible, specific, false invariant. If B is chosen, the doc must say "no cross-surface arbiter exists in the cloud runtime" in those words.

**On-call at 3am.** Best page shape of the three when it works (one group expression, one YAML block, `yq` tells you the whole model), worst when Gap 2 fires: two agent sessions on one FID, interleaved comments on one issue, and no single log line saying which one is authoritative. Recovery is manual and requires reading both runs' transcripts.

**Author leaves.** Lowest concentration — one expression, one flag, one doc paragraph. The residual tribal knowledge is exactly the falsehood above, which is why the doc wording is the deliverable, not a nicety.

### Risk-mitigation guidance (layer onto this approach)

- **Replace the lock story with an in-flight-run query** before claiming Gap 2 is "arbitrated". If that is out of scope, state plainly that Gap 2 is **unmitigated** in the cloud — requirement 2 is then not met, and the issue should say so rather than record a false close.
- **Emit `bkit:queued`, never `bkit:failed`, on the loser** — and only after an explicit check, so the label means something.
- **Add the same discriminator/routing set-equality test** as Approach A (the drift risk is identical; only the fix cost differs).
- **Take the doc debt seriously:** one paragraph in `docs/cloud.md` stating that cloud runs share no filesystem, so `.dev.lock` / `.lock` are per-runner and provide zero cross-run arbitration. This single fact is what both gaps in #397 are actually about.

---

## Approach C — Reject GHA concurrency as the queue: admission control + idempotent reconciler

**Summary.** Treat the concurrency group as a **mutex only, never a queue**: a second ship does not queue and does not cancel — it exits 0 immediately having recorded "deferred", and a separate re-scan trigger later re-dispatches deferred work. This is the only approach that survives I1 honestly, and it is the shape #260 already asked for (idempotent dispatch + single-flight + reconciliation, per `related-issues.md`).

Concretely: keep per-surface groups roughly as today; add an admission-control step at the head of the heavy job that asks "is another cloud run in flight for this lane / this FID?" and, if so, writes a `cloud-deferred` row and exits 0. The re-scan is not new machinery in the ideal case — #363 is already adding a post-merge `dev` CI trigger (V2), which fires precisely when a ship completes, i.e. exactly when the ship lane frees. That event can sweep for `bkit:auto` PRs that are green with no in-flight ship, and re-dispatch.

### Premortems

**10x scale.** Scales best: no queue to lose entries from, no head-of-line blocking, work is idempotently re-derived from repo state rather than held in GHA's ephemeral pending slot. New bottleneck is the sweeper — a fan-out risk if the re-scan dispatches N ships at once (it must re-apply the same mutex, or it becomes an amplifier). Blast radius on a sweeper bug is repo-wide: a mis-scoped scan could dispatch ships for every open green PR simultaneously. That is the one failure in this design that is _worse_ than anything in A or B.

**6 months later.** Most moving parts, so most drift surface: the deferred-row schema, the sweep predicate ("green + `bkit:auto` + no in-flight ship + not already merged"), and the mutex probe. The predicate is the fragile part — it encodes assumptions about labels and CI names that #363 has already shown to be consumer-editable (`--workflow ci.yml` vs `--workflow CI`, plan `:184`). Undocumented invariant: "the sweeper's notion of in-flight must match the mutex's notion of in-flight" — two probes, one truth.

**On-call at 3am.** Best diagnosability by construction: every decision writes a row (`cloud-deferred`, `cloud-admitted`, `cloud-swept`) and every exit is a normal exit with a `::notice::`. There are no invisible cancellations. The 3am question becomes "read the rows", which is answerable. The bad page is the opposite one: a runaway sweeper dispatching repeatedly. That needs a hard cap — and #363 has already built one (`MAX_DEV_DISPATCH_ATTEMPTS`, plan `:164`), so reuse rather than invent.

**Author leaves.** Highest total surface but the most _self-describing_ — the rows are the documentation. Main tribal knowledge is the sweep predicate's rationale. Bus factor is better than A because nothing depends on a subtle platform behaviour (I1/I2); it depends on ordinary shell and a ledger.

### Risk-mitigation guidance (layer onto this approach)

- **Cap the sweeper before writing it.** Reuse `MAX_DEV_DISPATCH_ATTEMPTS`-style bounding and a max-dispatches-per-sweep of 1. A sweeper without a cap is a spend incident waiting to happen (#363 already argues this at plan `:230`).
- **One probe, one truth.** The admission-control mutex and the sweep predicate must call the same function/script, not two similar `gh run list` invocations.
- **Do not build the sweeper in the same cycle as the mutex.** Ship admission control + deferred rows first (immediate benefit: no more double ships, no invisible cancels); add the sweep behind the #363 dev-CI trigger afterwards. This also keeps #397 from growing into #260's scope.
- **Keep the shipped surface stack-agnostic.** The probe must not assume a CI workflow display name (consumer-editable) — use the filename form, matching #363's own correction (plan `:184`).

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Ship discriminator = **allowlist** `inputs.phase == 'ship' \|\| (workflow_run && success && startsWith(feat/\|fix/))` | Issue's `conclusion == 'success'`; denylist `success && head_branch != 'dev'` | `conclusion == 'success'` alone admits cell 7 (green `dev`), the most frequent event in the repo, into the ship lane where it evicts pending ships (I1). A denylist passes today and breaks the moment `main` returns (cell 9) — and `main` is explicitly parked as revisitable (V2). Allowlist is correct by construction against a filter that is still moving. |
| Land **#397 strictly after #363** | Concurrently; fold the flip into #363 | Both edit `bkit-cloud.yml` lines 73-74 plus the duplicated `shared-deriv` block in two jobs, in a Tier-1 byte-equal file that must also stay byte-identical to the committed mirror (V6/V8). Concurrent branches guarantee a conflict in a file where "take one side" is not safe. #363 is already at `bkit:build`. |
| Do **not** fold `cancel-in-progress: false` into #363 | Fold it (issue's "single shared change" hypothesis) | The flips are not the same change. #363 needs it _for `dev` only_ and ships a denylist expression (V3); #397 needs it _globally_ and replaces that expression with a constant. Folding means #363 ships #397's semantics for `feat/**`/`fix/**` without #397's ship-global group — the worst intermediate state (queued ships with no ship lane). Instead: record #363's expression as explicitly **transitional**, superseded by #397, so nobody defends it later. |
| Gap 2 solved at **job level via a resolver output** (Approach A), contingent on I2 | Issue option (a) accept+document; option (b) external state (cache / lock branch) | (a) is built on a false premise (V4/V5) — the locks are gitignored, so there is nothing to detect and no arbiter in the cloud today. (b) invents a state surface. The resolver is the same `shared-deriv` code, re-sited, and additionally fixes the same-run two-job race (V10) that neither (a) nor (b) touches. |
| Group expression must be **`main`-tolerant** | Encode only today's three branches | #363 defers `main` with a deferral row and an unresolved precondition (V2, plan `:206-208`) — i.e. it is a scheduled future change to the exact input this expression reads. |
| Locks are **documented as non-arbiters in the cloud**, in the same change | Leave `docs/cloud.md` as-is | Requirement 4's framing ("locks become the corruption-backstop") is false for cloud runs (V4/V5). Shipping the concurrency change while leaving the false invariant in the docs is the highest-value-per-line risk in this issue. |

---

## Cross-Approach Risks

For the final design's `Risks & Open Questions`:

1. **The GHA queue is depth 1 and lossy (I1).** Every approach that relies on `cancel-in-progress: false` to mean "queue" satisfies requirement 1 only for N=2. At N>=3 the middle ship is cancelled with no bkit-visible signal and no retry. Requirement 1 as written ("second ship queues") is unachievable for N>2 with GHA concurrency alone. Either restate the requirement as "at most one pending" or add a reconciler (Approach C).
2. **Both locks are gitignored (V4/V5) — there is no cross-run backstop in the cloud.** Requirement 4 needs rewriting. Any doc text implying the locks arbitrate cloud runs is actively harmful during an incident.
3. **Concurrency is evaluated before the free-tier gate (I3).** The `bkit [auto route]` marker gate is job-level (`bkit-cloud.yml:89-96`); the group is workflow-level. Gate-skipped runs still enter the group and can evict a pending run. The gate protects runner minutes, not the queue.
4. **Two jobs, one run (V10).** With both secrets set, claude and opencode both dispatch `/bkit-auto` for the same event. Workflow-level concurrency cannot separate them by construction. Whatever ships must state whether this is intended (additive-by-design per the header) or a same-FID collision — it is currently both.
5. **Shipped-surface blast radius (V6).** `bkit-cloud.yml` is Tier-1 byte-equal, force-overwritten by install and upgrade. Consumers on older versions keep the old concurrency model until they upgrade, and consumers who hand-edited lose their edit with no merge and no prompt. Consider a postinstall advisory (precedent: `.bkit/src/bkit-postinstall.ts:371`) rather than silent replacement.
6. **Test coupling (V8/V9).** A folded multi-line `group:` breaks two string-matching tests on a correct change; the byte-equality test fails unless the canonical mirror is regenerated in the same commit. Both are cheap if anticipated and confusing if not.
7. **Downstream consumers of this primitive.** #324 adds a third dispatch producer (audit findings) on the same `workflow_run` substrate, and #260 needs idempotent dispatch that GHA concurrency does not provide — a queued duplicate is still a duplicate when it runs. Whatever ships should be expressible as a _policy_ (phase -> lane) that a third producer can slot into, not a hand-tuned two-surface expression.
8. **Ship-lane throughput.** Capacity 1 globally for ship is the stated target, but a ship that queues will later need `update-branch` plus a fresh CI cycle before its gate passes (I4, V11). Serialising ships converts a merge race into a serial CI-cycle chain; at 10x that is the practical throughput limit of the whole pipeline. Worth an explicit "this is accepted" in the design rather than a discovery in production.
9. **`main` is deferred, not decided (V2).** The parent brief for this design pass stated #363 widens to `dev` **and** `main`; the current plan v4 ships `['feat/**','fix/**','dev']` with `main` excluded and recorded as a reversal (Task 14). Any design written against the "dev + main" assumption is wrong today and possibly right in three months — hence the `main`-tolerant expression decision above.
