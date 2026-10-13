# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

Load-bearing contracts for the revised model, verified against the installed payload (v5.0.2) and the run-1 spike, cited so the premortems stay honest:

- **Worktree mint** (spike C1, SETTLED): with `main` default + pushed `dev`, `bkit worktrees setup` mints `feat/{FID}` off `origin/dev` — the runner never needs to cut the feat branch; the pipeline does. Behaviour when `feat/{FID}` **pre-exists** is UNVERIFIED.
- **Merge gate** (spike C2, SETTLED): a single-job `bkit-ci.yml` with job `bkit-tests-check` green at PR head satisfies `bkit runs gate`; 0-executed-tests fails the gate **only when a count is reported** — the 40-line CI reports none.
- **Tracker default is `none`** (`DEFAULT_ISSUE_TRACKER`): install without `--tracker=github` silently guts every tracker step — v3's highest-severity silent failure; the read-back assertion carries over unchanged.
- **Install needs a module flag** (spike C5, DISPROVEN): `bkit install --tracker=github` exits 1 mid-sequence; always `--claude --tracker=github`.
- **Gate-chain growth advisory is asymmetric**: `gate-missing-called-scripts` fires on _missing_ names, never on a chain that _grew_ — under always-latest every run exercises the upgrade path, so the setup-time chain assertion is more load-bearing than it was under the pin.
- **Public repo ⇒ zero Actions minutes** (spike method note): the model change deletes v3's Actions-quota risk outright.
- **Worktree setup copies `.env` / `.env.local`** into worktrees (C1 evidence: `copyMissing` listed them) — any `.env*` at the run-repo root can reach a PR; the privacy scan must cover it.
- **KN-9**: read `.bkit-version` via its JSON schema (`pinnedVersion`), never raw-trim — the runner's version record depends on it.
- **KN-11**: `[skip ci]` at HEAD empties `statusCheckRollup` — the reset commit and every pipeline commit must carry no skip markers.
- **Ledger envelope** (`.bkit/jsonl.md`): rows already carry `bkitVersion` per row — "record the version with each run" needs no schema change for pipeline rows, only a run-marker for runs that die before their first pipeline row.
- **Hard stops**: design and plan end awaiting a human; a run is never fully unattended under any approach.
- **Headless page capture precedent**: spike C3 used Chrome `--headless=new --dump-dom file://…` — the same mechanism captures the screenshot artefact with no new dependency.

## Approach A — Single Writer, Linear History (runner-owned reset on dev) ⭐ Recommended

One sentence: one bats-tested runner owns all mechanics — idempotent `--bootstrap`, then per run: sync `dev` → delete + re-create the dedicated folder from the fixture → `pnpm up @cbartens/bkit --latest` + `bkit install --claude --tracker=github` → read-backs (tracker, gate chain, version) → append a run-marker row → push ONE reset commit direct to `dev` → file the issue; the pipeline mints `feat/{FID}` off `dev` (C1-verified path) and merges back; sentinel and privacy scans run as **PR-only** CI steps; the benchmark reads repo-root `.bkit/stats.jsonl` on `dev` grouped by `bkitVersion`.

### Premortems

**10x scale (10-run sweep before a release, repeated per release):**

- _What breaks:_ (1) Wall-clock reality: hard stops after design and plan make a 10-run sweep ~10 human sessions, not an overnight — any schedule assuming unattended parallel runs fails on arrival. (2) The parallel temptation: two concurrent runs both append `.bkit/stats.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl` on feat branches cut from the same `dev` base — append-at-EOF on the same hunk means the second PR conflicts on **every** ledger file and ship's conflict-resolve path engages per run. (3) A mid-sweep bkit release splits the sweep into two version cohorts; comparability survives only because grouping by `bkitVersion` is the stated rule. (4) Repo growth: each run adds a payload-upgrade diff + the `docs/plans` paper trail + a screenshot (~0.5–1 MB/run) — real but boring; git absorbs it. (5) GitHub API secondary rate limits on issue/PR creation are the only fan-out ceiling, and the serial cadence sits far below it; Actions minutes are free (public).
- _Observability:_ run-marker rows make attempted-vs-completed countable per version (a run dying before design writes no pipeline rows — without the marker, failed runs are invisible in the benchmark); reset commit messages carry `reset run N (bkit x.y.z)`, so `git log` alone reconstructs the sweep.
- _Recovery:_ re-invoke the runner — the reset is idempotent from any `dev` state (delete + re-create converges); the failed run's PR and branch stay as evidence; the sweep's median rule excludes failed runs by rule, never by judgement.

**6 months later:**

- _What breaks:_ (1) Always-latest turns every reset into an upgrade-path canary: a bkit release that breaks `bkit install` on an existing install (tier migrations, marker moves) blocks the benchmark **at reset** — the pinned model never exercised this path; the assertion battery (tracker read-back, gate-chain resolution) fires loudly, but the sweep is down until bkit ships a fix. (2) Sentinel rot: someone "improves" the placeholder copy in the fixture and the sentinel string drifts between fixture and assertion — every run then fails the placeholder check, or worse, the built page legitimately quotes the sentinel word in prose and false-fails. (3) The 40-line CI at the run-repo root is **never refreshed by resets** (it lives outside the folder) — it drifts from the merge-gate contract it satisfies; the magic string `bkit-tests-check` lives in two places (fixture `bkit.capstoneJob` + the yaml). (4) `docs/plans` accumulation turns the run repo's `docs/` into a junk drawer; a future "tidy up" deletes old runs' paper trails and silently destroys benchmark evidence. (5) `examples/README.md` and the runner become two sources of truth for the reset procedure.
- _Observability:_ version cohorts via marker rows; drift surfaces as runner setup failures (loud, good) or as green-runs-meaning-less (silent, bad — the honest-stub discipline is the only guard).
- _Recovery:_ fixture and CI are sourced in bkit's repo — fix at source, re-run `--bootstrap` in verify mode against the existing repo to report and repair root-harness drift; the folder and payload heal on the next reset.

**On-call at 3am (release-eve sweep, run 7 of 10 red):**

- _Page shape:_ no pager exists; the surfaces are the maintainer's terminal (runner) and the PR (pipeline). Runner failures land at setup — pre-mutation, named, loud (preflight → fixture-integrity → install → read-backs → commit, in that order). Pipeline failures land as a red PR with CI logs plus the full `docs/plans` agent paper trail on the branch.
- _Diagnosability:_ the persistent repo is the structural fix for v3's "evidence loss on teardown" edge case — branch, PR, Actions runs and logs all persist; nothing needs harvesting before a delete because there is no delete.
- _Recovery path:_ fix the cause, re-run the runner, file a **new** issue (runId = issue# stays a clean 1:1 run counter); close the failed PR unmerged. The README must state the exclusion rule so nobody hand-merges a red PR "to keep the sweep moving" and poisons the median set.

**Author leaves:**

- _Knowledge concentration:_ the reset procedure, sentinel semantics and "why dev, not main" live in the runner + `examples/README.md`; the run repo's own README (written by bootstrap) explains `main` = canonical fixture / `dev` = integration / reset commits / stats read path to strangers.
- _Load-bearing tribal knowledge_ (each one sentence, each a violation waiting for a successor): feat branches come from `dev` because ledger appends need linear history; the sentinel step is PR-only so reset pushes don't red `dev`; branch protection on `dev` must stay off (the runner direct-pushes); analysis groups by `bkitVersion` or the sweep is incomparable.
- _Bus factor / recovery:_ `--bootstrap` is re-runnable and idempotent (exists → verify mode), so a successor repairs drift without tribal knowledge; worst case is delete-and-re-bootstrap — the benchmark loses paper-trail continuity, never its fixture.

### Risk-mitigation guidance (folded-in changes to layer onto this approach)

- **Pre-mutation assertions in the runner:** fixture dir exists AND the sentinel is present in the fixture `index.html` (a renamed fixture otherwise commits a pure deletion of the app); `git status --porcelain` empty and `dev == origin/dev` (a stale clone reintroduces the stats-conflict mode); `gh auth` scope reduced to `repo` + `workflow` — `delete_repo` drops out with the teardown.
- **Post-install assertions (carried from v3, more load-bearing now):** tracker read-back == `github`; every script the seeded `bkit:gate:*` chain calls resolves; version read from `.bkit-version` via JSON parse (KN-9), never raw-trim.
- **Improve candidate resolution 2's last clause:** land the reset commit on `dev`, not on the run's `feat/*` branch — the feat branch does not exist until design's worktree setup mints it (C1-verified), and pre-cutting it couples the reset to unverified worktree-adoption behaviour plus issue-number sequencing. History still shows the reset; the reproducible start is the reset commit, not the branch base.
- **Sentinel + privacy as PR-only CI steps** (`if: github.event_name == 'pull_request'`): on push-to-`dev` the capstone runs tests only, so reset pushes keep `dev`'s badge green; at PR head the built page exists and the diff is the reviewable surface — the only correct interposition point.
- **Privacy step, kept small (candidate 3 verbatim: state it, don't over-build):** a ~15-line grep over the PR diff for `ghp_`, `github_pat_`, `sk-`, `BEGIN [A-Z ]*PRIVATE KEY`, and absolute home paths (`/Users/`, `/home/`) — run logs and `status.jsonl` leak home paths even with zero secrets; fixture `.gitignore` covers `.env*` (worktree setup copies them, C1 evidence); a documented manual review runs before the first publish.
- **Run-marker row:** the runner appends one envelope-valid row (`kind:"run"`, runId = issue#, `bkitVersion`, ts) inside the reset commit so failed runs are countable; WS-8 defines exact fields per `.bkit/jsonl.md`.
- **Serial topology documented as an invariant**, with the conflict mechanics named (append-at-EOF ledgers), so a future contributor doesn't "speed up the sweep" with parallel runs.
- **Screenshot (candidate: WS-7):** headless page-only capture (spike C3's Chrome mechanism) committed under the run's `docs/plans/…/logs/` dir as `screenshot-run{N}.png`, captured post-merge from `dev` tip, never gating (#232); note the accumulation cost (~0.3 MB/run) explicitly.
- **Reset commit message** `chore(example): reset run {N} (bkit {x.y.z})` — no skip markers (KN-11); history stays greppable as the experiment index.
- **Sentinel hygiene:** an unguessable string (e.g. `BKIT-EXAMPLE-SENTINEL-7f3a9c`), and the feature request forbids quoting it in the built page (a "how this was built" panel quoting the fixture false-fails the check).

## Approach B — Repo as Its Own Machine (CI-mediated reset)

One sentence: the example repo's own Actions own the mechanics — a `workflow_dispatch` "reset" workflow checks out `dev`, deletes + re-creates the folder, bumps `@cbartens/bkit` to latest, runs `bkit install --claude --tracker=github`, records the version and commits the reset to `dev` with `GITHUB_TOKEN`; PR CI carries the same PR-only sentinel and privacy steps; the local runner shrinks to `gh workflow run` + outcome verification.

### Premortems

**10x scale:**

- _What breaks:_ dispatches queue on a `concurrency` group — natural serialisation that matches the human-in-loop cadence anyway; a stuck or queued dispatch stalls the sweep with no local signal until the runner's poll times out. Fan-out is one API call per run; nothing else scales. Repo growth identical to A.
- _Observability:_ every mechanic step is an Actions log with a shareable URL — the best diagnosability of the three; reset commit atomicity is **better** than A (checkout → mutate → one commit → one ref update: a killed workflow leaves `dev` either untouched or fully reset, never half).
- _Recovery:_ re-dispatch; idempotence identical to A. A workflow failing before push leaves `dev` untouched by construction.

**6 months later:**

- _What breaks:_ the reset workflow yaml is code that rots **in the repo it mutates** and is never refreshed by its own resets (it lives outside the folder, same as A's root CI); `GITHUB_TOKEN` semantics shift under repo settings changes (workflow permissions flipped to read-only → opaque 403 on push); Actions runner image moves change the `node --test` version underneath the capstone (shared with A — see Cross-Approach Risks). The dispatch workflow gains a second maintainer audience: debugging it needs Actions fluency, not just shell fluency.
- _Observability:_ workflow runs history is the audit trail; drift between the fixture-sourced yaml and the repo copy is invisible until bootstrap-verify.
- _Recovery:_ bootstrap verify-mode rewrites the workflow file from source; worst case, a human runs A's commands by hand — the model degrades gracefully to Approach C.

**On-call at 3am:**

- _Page shape:_ a failed dispatch conclusion in the Actions tab; diagnosis is log-reading over a URL — better than a dead terminal, worse when the failure class is "workflow didn't fire at all" (dispatch filtered to the wrong branch, workflow file syntax error → the run list shows **nothing**, and nothing is the hardest page shape).
- _Recovery:_ re-dispatch after fixing the yaml on `main`... but the workflow file is read from the **default branch** (`main`) while it mutates `dev` — a broken workflow fix needs a `main` commit, which bootstrap owns; two-branch reasoning at 3am is the real cost.

**Author leaves:**

- _Best handover of the three:_ all mechanics in-repo, versioned, logged, zero local clone state; a successor re-runs a dispatch with no setup. The workflow file is its own runbook.
- _Load-bearing tribal knowledge:_ why the reset workflow must never gain a `push` trigger (a push-triggered reset wipes the just-merged app after **every** ship merge — the single most dangerous misconfiguration available); why `GITHUB_TOKEN` reset commits show no checks (token pushes don't retrigger workflows — desired here, confusing if unexplained).

### Risk-mitigation guidance (folded-in changes to layer onto this approach)

- `on: workflow_dispatch` **only**, stated as a never-rule with the push-trigger footgun named in a comment in the yaml itself.
- `concurrency: example-reset` (no cancel-in-progress) so sweeps serialise and a rerun queues instead of overlapping.
- The runner, though thin, verifies the dispatch outcome (run conclusion == success AND `dev` tip advanced to the reset commit) before printing the start command — a green dispatch against a stale `dev` is the quiet failure.
- Same PR-only sentinel + privacy placement as A; same pre-mutation fixture-integrity assertion, implemented as a workflow step that fails before any commit.
- Bootstrap seeds the reset workflow from the fixture and bootstrap-verify repairs it; the workflow file joins the contract table's magic-string inventory.

## Approach C — Human as the Assertion Engine (documented runbook)

One sentence: keep only `--bootstrap`; each run is a documented sequence of git/gh/pnpm commands with a VERIFY line (command + expected output) after every mutation — assertions live in the checklist, not in code, and WS-4's bats surface is deleted.

### Premortems

**10x scale:**

- _What breaks:_ human error compounds per run exactly where v3 found the silent failures: one forgotten `--tracker=github` and a run narrates a pipeline that never touched the tracker — no error, no gate; one forgotten `pnpm up --latest` and the sweep straddles versions **unrecorded** (the marker row is a manual `echo` — forgotten once, version grouping is silently wrong and the benchmark compares across a release without knowing); one wrong base and the ledger conflicts return. No preflight means failures land mid-pipeline instead of pre-mutation.
- _Observability:_ git history shows what was committed, never what was intended; a missed step is often only detectable downstream, attributed to the wrong cause.
- _Recovery:_ same repo persistence as A — but the diagnosis starts one step further back ("which checklist line was skipped?") with shell history as the only log.

**6 months later:**

- _What breaks:_ the runbook drifts from bkit's CLI surface (flags rename; the checklist rots) and from `examples/README.md` (two prose sources of truth, no code to fail loudly); but with no automation there is nothing to rot mechanically — each step stays verifiable by eye.
- _Observability:_ none beyond the checklist itself.
- _Recovery:_ update the prose; nothing else to fix.

**On-call at 3am:**

- _Page shape:_ the operator's memory of which steps ran. The persistent repo still shows every git-visible consequence — the model's core win survives — but intent is gone.
- _Recovery:_ re-derive from the checklist; the VERIFY lines are the entire safety net.

**Author leaves:**

- _Best-case handover if the runbook is current_ — the knowledge is all prose, no tooling to reverse-engineer; _worst-case protection for the silent failures_ — tracker-`none` and gate-chain drift become human-caught, and v3 ranked tracker-`none` the highest-severity silent failure precisely because humans don't catch it.
- _Load-bearing tribal knowledge:_ none by construction — that is the approach's entire wager, and its cost is re-deriving five commands per run forever.

### Risk-mitigation guidance (folded-in changes to layer onto this approach)

- Every mutating step pairs a paste-ready block with a VERIFY line and exact expected output (`node -p "require('./package.json').bkit.issueTracker"` → must print `github`; `git rev-parse HEAD` == `origin/dev` before reset).
- A final pre-pipeline checklist block (tracker == github; gate-chain scripts resolve; version row appended; sentinel present in fixture copy) — the human performs the assertions the runner encodes in A.
- State the trade honestly in the design: C deletes WS-4, saves one script, and re-opens the two silent failures v3 paid the most to close; it survives only because runs are serial and rare.

## Decisions

| Decided                                                                                                                    | Alternatives                                                                                                                                                                                                 | Why                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reset lands as ONE commit direct on `dev` before the pipeline starts; feat branches minted by bkit off `dev` (C1-verified) | Reset on the run's `feat/*` branch (candidate 2's literal wording); feat-from-`main`; `.gitattributes` union-merge driver; per-run stats shards                                                              | The feat branch does not exist until design's worktree setup mints it — pre-cutting couples the reset to unverified adoption behaviour and issue sequencing. Feat-from-`main` makes `.bkit/stats.jsonl` + ledgers conflict from run 2 (append-at-EOF, same hunk). Union-merge is magic that ship's conflict-resolve path trips on anyway. Shards don't cover bkit's own ledger appends. Linear `dev` history removes the class. |
| Sentinel + privacy scan as PR-only CI steps                                                                                | Runner post-merge (privacy is already public by then; sentinel failure discovered after the merge it should have blocked); every-push steps (red `dev` on every reset push — sentinel present by definition) | PR head is the only point where the built page exists pre-merge and the diff is the reviewable surface.                                                                                                                                                                                                                                                                                                                         |
| `--bootstrap` as an idempotent runner mode (exists → verify + repair drift)                                                | Documented one-liner                                                                                                                                                                                         | Bootstrap is the once-per-repo-life step executed by exactly the person with least context (a successor); verify-mode doubles as the drift-repair path for the root harness files that resets never refresh.                                                                                                                                                                                                                    |
| Mechanics in one bats-tested runner (A)                                                                                    | CI-dispatch (B); runbook (C)                                                                                                                                                                                 | Runs are human-in-loop regardless (hard stops), so B's automation buys nothing per run and adds token/trigger semantics; C re-opens the tracker-`none` silent failure v3 ranked highest. One tested script keeps assertions at setup time, pre-mutation, where failures are loud.                                                                                                                                               |
| Runner appends a run-marker row in the reset commit; WS-8 defines fields against `.bkit/jsonl.md`                          | Rely on pipeline rows only                                                                                                                                                                                   | A run dying before design writes no pipeline rows — without the marker, failed runs vanish from the benchmark and per-version failure rates are uncomputable.                                                                                                                                                                                                                                                                   |
| Runner preflight drops `delete_repo`, keeps gh auth / Node ≥ 20 / pnpm, adds fixture-integrity + dev-sync assertions       | Keep v3's preflight unchanged                                                                                                                                                                                | The destructive path (repo delete) is gone; the new destructive step (folder delete) needs the sentinel-present guard or a renamed fixture commits a pure deletion.                                                                                                                                                                                                                                                             |
| Version recorded from `.bkit-version` via JSON-schema read (KN-9)                                                          | `npm ls`; raw `readFileSync().trim()`                                                                                                                                                                        | KN-9: raw reads break on the v0.7+ JSON envelope; `npm ls` depends on `node_modules` state and is slow.                                                                                                                                                                                                                                                                                                                         |
| Serial-run topology documented as an invariant in `examples/README.md`                                                     | Parallel benchmark runs                                                                                                                                                                                      | Append-at-EOF ledgers conflict; provider rate limits; hard stops already serialise by human. The README names the mechanics so nobody "optimises" into the failure.                                                                                                                                                                                                                                                             |
| Pin `node-version` in the 40-line capstone CI and record it per run                                                        | Runner-image default                                                                                                                                                                                         | GH-hosted images move; the Node version under `node --test` is an unrecorded benchmark variable in every approach.                                                                                                                                                                                                                                                                                                              |

## Cross-Approach Risks

Risks that apply regardless of which approach is picked — for the final design's `Risks & Open Questions`:

- **Public makes the privacy check load-bearing, not optional** (#504 discussion). Run artefacts (`status.jsonl`, `docs/plans` logs) leak absolute home paths (`/Users/<name>`) even with zero secrets — the scan must include path shapes, not just secret shapes; the pre-first-publish manual review is the backstop, not the check.
- **GH-hosted runner Node version is an unrecorded benchmark variable.** The image moves; `node --test` semantics shift under the same bkit version. Pin and/or record it, or a cohort difference can be an image change in disguise.
- **Always-latest puts bkit's upgrade path on the benchmark's critical path.** A breaking release blocks the sweep at reset (loud — the assertion battery is the mitigation) and splits cohorts (grouping saves comparability); the pinned model never exercised upgrade, so this failure class is newly admitted by the model change itself.
- **The demo's audience shifted with the model.** Under a persistent `cbartens/bkit-example`, an external new user cannot "run it once" — the honest demo paths are watching the public history/paper trail or self-bootstrapping a copy. The docs contract must pick one and say so, or the first external demo fails at a permission error.
- **Append-only repo rule.** `docs/plans` + ledgers + screenshots accumulate per run by design (history = experiment history); a future tidy-up deleting old runs' artifacts destroys benchmark evidence — state "never prune" as a rule, or the paper trail dies by housekeeping.
- **Sentinel false-fail shape.** The placeholder assertion is deterministic only if the sentinel is unguessable AND the built page never quotes it; the feature request must forbid quoting (later-idea 6's "how this was built" panel would false-fail it).
- **Hard stops bound automation under every approach.** N runs = N human sessions; schedules and cost claims must price human time; this caps what any runner, CI, or runbook can ever automate, and no approach removes it.
- **AI non-determinism stays measured-never-gated (#232).** The deterministic signal is `node --test` green + sentinel gone + PR merged; "reviewer caught the trap" is a metric. The demo narrative must not promise the catch.
- **KN-11 in the run repo.** No skip markers in reset or pipeline commits; the 40-line CI keeps `if: ${{ !cancelled() }}` (silences the warning-only `ci-yml-capstone-contract-drift` advisory) and literal `[main, dev]` triggers.
- **Branch protection on `dev` blocks the reset.** The runner (or dispatch workflow) writes `dev` directly; bootstrap must not enable protection on `dev` (or must wire an explicit bypass), or the reset 403s on the very first run.
- **Failed runs leave clutter that must not be "helpfully" merged.** Unmerged red PRs and stale feat branches accumulate; the exclusion rule (medians over completed runs only) must be written down, or someone merges a red PR to tidy up and poisons the dataset.
