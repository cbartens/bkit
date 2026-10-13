Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Overview

Builds the bkit-side tooling for the example project (#504) — WS-1…WS-9 of the parent design: an immutable fixture (`examples/bkit-explainer/`: sentinel placeholder `index.html`, classic-script `data.js`, fixed `FEATURE-REQUEST.md`, durable harness incl. a hand-written single-job `bkit-ci.yml` capstone), a maintainer runner (`scripts/example/new-run.mjs`: idempotent `--bootstrap` with ruleset config; per-run preflight → folder-scoped reset → latest-bkit install with read-backs → push → issue), a bats suite over an extended `gh` stub, two contract docs (`examples/README.md`, `examples/analysis-prompt.md`) and own-gate registrations (slop-scan ignore, actionlint + prose coverage, prettier). Nine tasks; the interactive explainer app itself is not built this cycle — it is produced by a pipeline run in the separate public run repo (`cbartens/bkit-example`). Gates: Gate 1 prerequisites (three human confirmations), Gates 2–4 agent checkpoints, plus four owner-run manual verification steps — the first live bootstrap + one full run double as the C10 de-risking path.

## Plan Quality

Well-scoped: every task carries `Done when` criteria tracing to a Derived Test Matrix row or an explicit non-scope note; the DAG is explicit (Task 8 requires Tasks 3–5; docs the only sink). The Reuse Inventory records its searches; every `NEW` row cites an allowed reason. Gates are correct: Gate 1 awaits the three unchecked human-confirmation checkboxes (expected on a new plan; do not downgrade for this alone); Gates 2–4 are agent checkpoints; manual verification is owner-run and advisory, so unticked boxes block nothing. Honest about verification limits: bootstrap-verify stays on the live canary because the `gh` stub exits 1 on non-`api` argv. Workflow history shows review concerns applied: plan-review (CONCERNS, 4) → plan-apply-review → plan-scope-check (CONCERNS, 1) → plan-apply-scope → PASS (v3), complexity check SINGLE (0 failures).

## Completeness

Plan-level scope is covered: all nine design workstreams map to runbook tasks; DB and UI are correctly N/A; the bats suite covers all six matrix rows plus Task 8's prove-it-can-fail pairs; Gate 4 runs the full local gate suite (`pnpm bkit:gate:static-unit` + `bkit check`). Documentation is planned via a complete table (`docs/decisions.jsonl` ADR rows, architecture/technology/testing/deployments/observability updates, `.agents/docs.md` registration). Every Out-of-Scope row is mirrored in `docs/deferrals.jsonl` (keys verified present; this cycle adds no new rows).

## Acceptance Scenario

### Narrative

A maintainer runs the repo tooling once in bootstrap mode to create the persistent public example repo, then runs it per experiment: it resets the example app folder on `dev` to the canonical fixture, installs the latest bkit, files the fixed feature request as an issue and prints the start command. They start the pipeline, sign off after design and after plan, and bkit builds an interactive page that explains bkit's own phases and loops inside that folder, then merges it — the repo always shows the same example folder, its git history is the run history, and the accumulated `.bkit/stats.jsonl` holds every run's numbers. They repeat the run a few times and read the middle wall time and counters, grouped by the recorded bkit version, to tell whether a change made bkit faster, cheaper or more reliable; CI captures a screenshot of the built page as a per-run build artefact (never gating), and an AI analysis prompt run after the run stops produces a scored report of how the run went and how near the ideal it landed; a visitor to the public repo sees the same folder, the same history and the same evidence.

### Success Criteria

1. `node scripts/example/new-run.mjs --bootstrap` creates the public repo `cbartens/bkit-example` **once** — canonical fixture on `main`, a pushed `dev` — and is idempotent (re-run verifies and repairs drift, never creates or deletes the repo); a half-seeded state (create succeeded, seeding failed) is repaired by re-running it. The canonical fixture lives in **bkit** at `examples/bkit-explainer/`, versioned with bkit; the run repo holds only produced output and run evidence, and the pipeline never runs inside bkit.
2. A run resets **only** the app folder (`example/`) from the fixture as one commit on `dev`, runs `pnpm install` against the committed `pnpm-lock.yaml`, installs the latest `@cbartens/bkit` with `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github`, reads the `github` tracker back, and reaches a merged PR with the portable test invocation (`cd example && node --test`) green and the placeholder sentinel gone from the built page.
3. The repo's own capstone `bkit-tests-check` is present and green at PR head, so `/bkit-ship`'s merge gate is satisfied; the gating steps are the tests step (`cd example && node --test`) and the every-push privacy scan, while the PR-only sentinel check is scoped to pull requests, so a reset push to `dev` never reds.
4. Results live in the repo's tracked `.bkit/stats.jsonl`, which accumulates across runs because the reset never touches it; reading it directly and grouping `outcome` rows by `bkitVersion`, then run-scoping each cycle by the **run marker** (the reset commit / filed issue #) — never by `parentSha`, which is per-workflow-step and forensic (`ledgers/status.ts:14-16`) — yields one comparable result per run: no separate aggregate store, no new format, no report code.
5. Nothing measured can fail a run: pass/fail is **run completion** alone (design → plan → build → ship, capstone green at the merged PR); executed-test count, trap-catching, the blank-page / classic-script result, retries and loops, divergence from ideal, wall time, counters, the screenshot and cost are recorded and analysed, never gated (#232).
6. CI captures a screenshot of the built page at PR head with `continue-on-error: true` — never gating, a CI-only dependency (headless browser), never an app dependency (the app keeps no packages, no secrets); a failed capture warns loudly and never fails the run. CI stays **read-only** (no `contents: write`, no bot commit, no write-back): an uploaded artefact is at most a transfer/staging step, **never** the record.
7. An AI analysis prompt (`examples/analysis-prompt.md`, bkit-side, **never published** into the run repo) runs after the run stops — completed or aborted — reads the run's artefacts, and commits the **scored report** plus the run's screenshot into the run repo as the permanent evidence record (report beside the run's `status.jsonl`, screenshot beside the report; the run repo is the single evidence store — produced app, screenshot, report, `.bkit/stats.jsonl` numbers); the report records the run's **merge SHA** and `bkitVersion`, so two runs are compared as a diff of their merge SHAs; non-gating, and grouped by `bkitVersion` with the run so scores stay comparable.

> **Plan-scope note:** Success Criteria 1–3, 6, 7 describe run-repo behaviour exercised by a _run_; **this cycle** delivers the bkit-side artefacts that make those criteria achievable (fixture, harness, workflow, runner, docs) and the bats suite that verifies the runner's local halves. Criteria 4–5 describe the read/measurement model this cycle documents (WS-5/WS-7) but does not compute.

### Process Sketch

- **WHEN** the maintainer runs `new-run.mjs --bootstrap` **→ THEN** create (or, if it exists, verify and repair) the public repo with the canonical fixture on `main` and a pushed `dev`; normal runs never create or delete it.
- **WHEN** the maintainer runs the runner for a run **→ THEN** preflight (fixture present with its sentinel, `main` still carries the fixture, `git status` clean and `dev == origin/dev`, `gh auth`, Node ≥ the pinned LTS, pnpm) → reset **only** `example/` from the fixture as one commit on `dev` (post-delete check that every removed path resolved inside `example/`) → `pnpm install` → `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github` → read tracker/version/gate-chain back → push → file the issue → print the start command; one `[bkit-example]` line per transition.
- **WHEN** the maintainer starts the pipeline **→ THEN** design → hard stop → plan → hard stop → build (agents write `index.html`, the logic file and its `node --test` tests) → PR opened.
- **WHEN** CI runs **→ THEN** on **every push** the tests step runs `cd example && node --test` and the privacy scan reads the diff → at PR head the sentinel must be gone, and the executed-count and classic-script assertions are recorded (non-gating), with the screenshot captured and uploaded (non-gating) → **THEN** `/bkit-ship` merges into `dev`; a reset push to `dev` runs the tests and privacy steps only.
- **WHEN** a planted trap is missed **→ THEN** `node --test` fails → the debug loop diagnoses, fixes and retries within its attempt budget.
- **WHEN** the run stops (completed or aborted) **→ THEN** run the analysis prompt against the run's artefacts → a scored report lands beside the run's `status.jsonl` → read the middle wall time, counters and scores from the repo's `.bkit/stats.jsonl` and the reports, grouped by `bkitVersion`.

### Concrete Example

**Setup:** Maintainer; the public repo `cbartens/bkit-example` already exists (bootstrap done once), `main` carries the canonical fixture, `dev` is in sync with `origin/dev`, `gh` authenticated, pnpm + Node 24 available. This is run #7, immediately after bkit `5.1.0` shipped.

**Steps:**

1. Maintainer runs `node scripts/example/new-run.mjs` → runner prints one `[bkit-example]` line per transition and ends with the pipeline start command.
2. Runner resets `example/` from the fixture on `dev` as one commit `chore(example): reset run 7 (bkit 5.1.0)`, installs latest bkit, reads back tracker `github` + version `5.1.0` + every seeded `bkit:gate:*` script, pushes, and files `FEATURE-REQUEST.md` as a new issue → Maintainer sees the printed start command.
3. Maintainer starts the pipeline on the filed issue → design runs, hard-stops for sign-off; plan runs, hard-stops for sign-off; build writes `example/index.html` + `example/logic.js` + its `node --test` tests; ship opens a PR into `dev`.
4. CI runs on every push (tests + privacy); at PR head the sentinel is gone, executed count and classic-script form are recorded, and a screenshot of the built page is captured and uploaded (non-gating).
5. Maintainer runs `/bkit-ship` → capstone `bkit-tests-check` is green at head → squash-merge into `dev` → Maintainer sees the merge.
6. Maintainer runs `examples/analysis-prompt.md` in an agent session against a checkout of the run repo → report `analysis-run7.md` + `screenshot-run7.png` are committed beside the run's `status.jsonl`.

**Outcome:** `dev` history shows the reset commit, the built app, and the merge; `.bkit/stats.jsonl` gained run 7's `outcome`/`counter` rows with `bkitVersion: 5.1.0`; the run repo now carries the scored report and screenshot as permanent evidence; the maintainer can compute the median across the 5.1.0 cohort.

### Edge Cases

| Scenario                                                                                         | Expected Behavior                                                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reset scope widened (bug deletes at root or `.bkit/`)                                            | Delete scoped to `example/` only; resolved path asserted before delete AND every removed path verified after; never touches `.bkit/`, `docs/`, root harness      |
| Reset on `main` / pre-cut `feat/*`                                                               | Reset lands **direct on `dev`** via one commit; `feat/{FID}` is minted later by `bkit worktrees setup` off `origin/dev` (spike C1)                               |
| Two concurrent runs append ledgers at EOF                                                        | Serial topology is the invariant; preflight refuses when `origin/dev` carries an unmerged reset commit (explicit `--force-run` override)                         |
| `bkit install` recorded `issueTracker: none`                                                     | Runner reads `bkit.issueTracker` back after install and stops unless `github`                                                                                    |
| `bkit install --tracker=github` alone                                                            | Runner always passes `--claude` (spike C5, DISPROVEN: bare `--tracker` exits 1 mid-sequence)                                                                     |
| A bkit release adds/renames a `bkit:gate:*` script                                               | Runner asserts every seeded `bkit:gate:*` script resolves; growth is loud, not silent                                                                            |
| Always-latest upgrade path blocked by a breaking bkit release                                    | Sweep stops at reset loudly (assertion battery); cohorts split by recorded `bkitVersion`                                                                         |
| `node --test example` (bare dir) on Node ≥ 22                                                    | Rejected; portable invocation is `cd example && node --test`, stated with the Node pin as one coupled pair (spike C1/C2)                                         |
| `out=$(…)` under `bash -e` discards TAP capture                                                  | Tests step writes TAP to a file and parses the count from it (spike C4 cautionary run)                                                                           |
| Reset state has zero tests by construction                                                       | Executed-count assertion is **PR-only**; unconditional assertion would red every reset push (spike C4/C7)                                                        |
| Vacuous green (`node --test` over zero tests)                                                    | Recorded observation, never a verdict; analysis report reads the count (#232)                                                                                    |
| Sentinel false-fail / drift                                                                      | Sentinel string defined **once** (single source, referenced by placeholder + CI step); feature request forbids quoting it                                        |
| Public-privacy leak (home paths / secrets)                                                       | Every-push diff scan (secret + `/Users/`, `/home/` shapes); fixture `.gitignore` covers `.env`/`.env.local`; manual review before first publish                  |
| `[skip ci]` at HEAD empties the check rollup (KN-11)                                             | Reset commit and every pipeline commit carry no skip markers                                                                                                     |
| Branch protection vs the direct reset push                                                       | `dev` ruleset blocks force-push/deletion only; required `bkit-tests-check` on the **PR path** into `dev`; never require a PR before merging on `dev` (would 403) |
| Bootstrap half-state (create ok, seed failed)                                                    | Re-running `--bootstrap` enters verify-mode and repairs; failure output names the half-state                                                                     |
| Verify-mode does not prune                                                                       | Re-publishes changed/missing files but does not remove a stale extra file absent from source truth (spike limitation)                                            |
| Ledger unbounded growth (5000-row warn, no rollup)                                               | Accepted; serial runs keep appends single-writer                                                                                                                 |
| `feat/{FID}` already exists                                                                      | Out of scope this cycle (each run files a new issue); documented assumption                                                                                      |
| **Plan-added:** fixture dir renamed / sentinel absent at preflight                               | Runner aborts before mutating; `[bkit-example]` line names the missing fixture/sentinel                                                                          |
| **Plan-added:** `main` mirror drift from `examples/bkit-explainer/`                              | Run preflight asserts `main` still carries the fixture (sentinel included) → drift caught at the next run                                                        |
| **Plan-added:** fixture `index.html` written so it does not trip `comments.placeholder-comments` | Fixture authored to avoid the slop placeholder pattern; `pnpm bkit:gate:static` stays green                                                                      |

Adherence to `docs/templates/bkit-plan.md` § `Spec`: **conforming** — the Narrative and Success Criteria are inherited verbatim from the design (its 7-criterion set carried in full per the Spec's design-count override), the Process Sketch stays within the 3–7 `WHEN X → THEN Y` bound reusing the design's examples without inventing new ones, the Concrete Example is a single scenario with role, starting state, numbered steps and an observable outcome, the Edge Cases carry the design's Key Edge Cases verbatim plus plan-added validation rows, and the Derived Test Matrix assigns exactly one runbook task row per testable behaviour with a named target file.

## Breaking Changes

None declared — all artefacts are net-new (nothing existing is renamed, removed, or contract-changed). Additive items:

- **`.agents/docs.md`** — two new rows (`examples/README.md`, `examples/analysis-prompt.md`); additive, mirrors the existing doc-index pattern.
- **`slop-scan.config.json`** — one new `ignores` entry (`examples/bkit-explainer/**`); additive, confines the deliberately near-empty fixture data; config decision surfaced per `.agents/rules.md` § Major changes.
- **`package.json` scripts + bkit's own `.github/workflows/bkit-ci.yml`** — `bkit:lint:workflows` and `lint:prose` and the actionlint step extended to lint the fixture workflow path (`examples/bkit-explainer/harness/bkit-ci.yml`, outside `.github/workflows/`) **without dropping** the existing `.github/workflows/*` scan, and to cover `examples/*.md` with the prose gate (WS-9). **CI edit** — per rules § CI edits this requires human confirmation; the plan treats this section's confirmation as that sign-off.
- **`.prettierignore`** — adjust only if `prettier --check .` rejects the fixture; prefer formatting the fixture over ignoring it.

**Names introduced (all new):** `examples/bkit-explainer/` (`index.html`, `data.js`, `FEATURE-REQUEST.md`, `harness/`), `scripts/example/new-run.mjs`, `tests/example-run.bats`, `examples/README.md`, `examples/analysis-prompt.md`, `slop-scan.config.json` ignore `examples/bkit-explainer/**`, run-repo paths (`example/`, `FEATURE-REQUEST.md`, `.github/workflows/bkit-ci.yml`, `docs/plans/{YYYYMM}/logs/{FID}/analysis-run{N}.md`, `screenshot-run{N}.png`), reset commit message `chore(example): reset run {N} (bkit {x.y.z})`, and the run repo `cbartens/bkit-example`.

## Design Alignment

The plan's Narrative and Success Criteria match the design doc (`docs/plans/202610/504-example-project-design.md`, Verdict PASS) verbatim — both sections are marked inherited; side-by-side read of the parent design in the plan input confirms the 7 criteria and the Narrative text match. Plan scope sits within design scope: Task 1–9 map to all nine design workstreams (WS-1 → Task 1; WS-2 → Task 2; WS-3 → Task 3; WS-4 → Tasks 4–5; WS-8 → Task 6; WS-6 analysis → Task 7; WS-9 → Task 8; WS-7 + WS-5 → Task 9), the dropped WS-6 smoke job stays out per the binding decision, and the plan-scope note correctly re-frames criteria 1–3/6/7 as run-repo behaviour delivered as bkit-side artefacts this cycle. Prior review concerns (review failures 4, scope-check failure 1) are resolved in v3 (apply-scope verdict PASS, failures 0).

## Deferred & Out-of-Scope

All `Exempt` — none `Blocking`:

| Excluded item                                         | What is excluded / why                                                                         | Where it belongs                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| The interactive explainer app itself                  | Not bkit-side tooling; produced by a pipeline _run_ in the run repo — `Exempt`                 | Run repo (produced output); design § Component inventory |
| `504-run-replay-viewer`                               | Genuinely-additive later idea, declared out before work started — `Exempt`                     | `docs/deferrals.jsonl` (exists)                          |
| `504-your-repo-report`                                | Genuinely-additive later idea; needs a Linear path + recorded snapshot — `Exempt`              | `docs/deferrals.jsonl` (exists)                          |
| `504-before-vs-after-bkit`                            | Genuinely-additive later idea; needs recorded runs first — `Exempt`                            | `docs/deferrals.jsonl` (exists)                          |
| `504-local-diff-input`                                | Genuinely-additive later idea; estimate half blocked on measured costs — `Exempt`              | `docs/deferrals.jsonl` (exists)                          |
| `504-time-saved-calculator`                           | Rejected for now; numbers would be assumptions shown as results — `Exempt`                     | `docs/deferrals.jsonl` (exists)                          |
| `504-how-this-was-built-panel`                        | Genuinely-additive later idea — `Exempt`                                                       | `docs/deferrals.jsonl` (exists)                          |
| `504-publish-benchmark-built-demo`                    | Needs a public demo repo + private-content sweep — `Exempt`                                    | `docs/deferrals.jsonl` (exists)                          |
| `504-second-example-extending-existing-code`          | The planned answer to the extend-own-code blind spot; a second feature on the first — `Exempt` | `docs/deferrals.jsonl` (exists; design references it)    |
| `504-additional-example-apps`                         | Each is a new fixture folder + the same runner — `Exempt`                                      | `docs/deferrals.jsonl` (exists)                          |
| `504-install-advisory-when-tracker-is-none`           | A bkit-wide install/doctor advisory; not this example's cycle — `Exempt`                       | `docs/deferrals.jsonl` (exists)                          |
| `504-external-suite-comparison`                       | Legitimately different heavy exercise (industry-comparable numbers) — `Exempt`                 | `docs/deferrals.jsonl` (exists; design references it)    |
| bkit CI smoke job for the example                     | Binding: ad hoc runs only; no smoke job now — `Exempt`                                         | Design decision (WS-6 dropped)                           |
| Tracker-`none` install/doctor warning                 | Out of scope per human decision — `Exempt`                                                     | Design decisions table                                   |
| Sandbox / durable-execution / eval-framework adoption | Scope mismatch (build-vs-buy rejected wholesale) — `Exempt`                                    | Design § Reuse & Prior Art                               |

Deferral mirror note: every row is already recorded in `docs/deferrals.jsonl` (keys `504-*`, verified present); **this cycle adds no new deferral rows**.

## Suggested Scope Expansion

Advisory candidates only — none folded, none gate the verdict:

| Candidate                                                                                                         | Source                                                                          | Recommendation                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `bkit runs gate --repo <other-repo> --pr N` ignores `--repo` and resolves the PR from the checkout (`HIGH`, OPEN) | `docs/failures.jsonl` (`runs-gate-repo-flag-ignored-pr-resolved-from-checkout`) | Keep deferred to its own fix; this cycle only encodes the constraint (WS-7 contract table + WS-8 non-scope); `/bkit-ship` unaffected |
| `504-install-advisory-when-tracker-is-none`                                                                       | `docs/deferrals.jsonl` (OPEN)                                                   | Keep deferred; the example works around it via the explicit `--tracker=github` flag + preflight read-back                            |
| `504-second-example-extending-existing-code`                                                                      | `docs/deferrals.jsonl` (OPEN)                                                   | Keep deferred; design references it as the planned answer to the reset-to-fixture blind spot                                         |
| `504-external-suite-comparison`                                                                                   | `docs/deferrals.jsonl` (OPEN)                                                   | Keep deferred; design references it as the path to cross-field comparability                                                         |
| `github-mcp-search-issues-silently-returns-zero-private-repo` (`MEDIUM`, TRIAGED)                                 | `docs/failures.jsonl`                                                           | Out of this plan's surfaces; not folded                                                                                              |
| `504-run-replay-viewer`, `504-your-repo-report` and other later ideas                                             | `docs/deferrals.jsonl` (OPEN)                                                   | Keep deferred (see Deferred & Out-of-Scope)                                                                                          |

## Risks

Unknowns and assumptions to track, no action this cycle: the end-to-end path is the largest untested assumption (spike C10 — de-risked by the first live run, Manual Verification Steps 2–3, binding: no smoke job, no dry-run repo); an always-latest upgrade can be blocked by a breaking bkit release (sweep stops loudly at reset; cohorts split by recorded `bkitVersion`); fixture/sentinel integrity and `main`-mirror drift are caught only at the next run's preflight (by design, abort-before-mutate); concurrency relies on the serial-run invariant enforced by the preflight run-in-flight guard with `--force-run` override; N runs = N human sessions (hard stops price human time); cost remains unmeasured until #526 provides a source (wall time + counters recorded only); `.bkit/stats.jsonl` grows unbounded (bkit warns at 5000 rows, no rollup; serial runs keep appends single-writer); the `gh` stub's exit-1 on non-`api` argv means bootstrap-verify has no automated coverage (stays on the live canary); AI non-determinism means runs may miss planted traps — scored and reported, never gated (#232).

## Action Items

1. **Human-confirmation gates (expected on a new plan):** the three Gate-1 checkboxes — Acceptance Scenario, Breaking Changes (which is also the sign-off for the WS-9 edit of bkit's own `.github/workflows/bkit-ci.yml`), and Open Questions & Assumptions — are unchecked; a human must confirm them before `/bkit-build` passes Gate 1.
2. No content-level revisions required: plan-apply-scope resolved the last scope-check failure (verdict PASS, failures 0) and the complexity check returned SINGLE — no partition needed.

## Outstanding Questions

Every `Open Questions & Assumptions` item from the plan, verbatim (options / Recommended / Default carried as written):

- **Assumption:** The fixture is authored in **bkit** (`examples/bkit-explainer/`) and published to the run repo by bootstrap; the pipeline never runs inside bkit. → If wrong, ship would merge the app into bkit's own history and the next run would reset it; also a nested project cannot carry its own root `.github/workflows/` CI.
- **Assumption:** `examples/` is not in the published `files` list (verified: `package.json` `files` excludes it) → fixture tooling never ships to npm. If wrong, the example leaks into the tarball.
- **Assumption:** `gh` is authenticated with `repo` scope sufficient to create/push a public repo and configure its ruleset; bootstrap is run once by the maintainer. → If unavailable, bootstrap stops loudly before mutating anything.
- **Assumption:** The Node pin (Node 24 LTS, recorded per run) and the test form `cd example && node --test` move together. → Changing one without the other silently reds every run (spike C1).
- **Assumption:** The two comparison/blind-spot deferral keys already exist in `docs/deferrals.jsonl` (`504-second-example-extending-existing-code`, `504-external-suite-comparison`) and the nine later-idea keys exist; this cycle adds none. → Verified present; if missing, the design's rejection block dangles.
- **Assumption:** Editing bkit's own `.github/workflows/bkit-ci.yml` actionlint step for WS-9 is covered by this plan's CI-edit confirmation (above). → If withheld, WS-9's registration cannot land and the fixture workflow stays unlinted.
- **Assumption (design open Q, answered A):** Run-marker location — a run is scoped by the reset-commit marker / filed issue #, **never** `parentSha` (per-workflow-step, forensic; `ledgers/status.ts:14-16`).
- **Assumption (design open Q, answered A):** `main` holds the canonical fixture; `dev` is integration; the reset lands as one direct commit on `dev`.
- **Assumption (design open Q, answered A):** The executed-test count is recorded, never gating; gating is the tests step + the every-push privacy scan + the PR-only sentinel check.
- **Assumption (design open Q, answered A):** C10 de-risking = the first real run against the live canary (bootstrap + one full run; Manual Verification Steps 2–3); no smoke job, no dry-run repo.
- **Assumption (design WS-7 / WS-1 open Q):** `data.js` owner-check cadence — a per-release canary owner; documented in `examples/README.md`.

- **Open Question:** **Where do results live and how are they read?** → maintainer; answered by design (WS-5).
  - **Options:** A — read `dev:.bkit/stats.jsonl` raw, group by `bkitVersion`, run-scope by the reset-commit marker; no aggregate store · B — a `results` branch / aggregate store · C — a `benchmark.mjs` folding script.
  - **Recommended:** A — binding "reuse `.bkit/stats.jsonl`; no new format"; `parentSha` is forensic (`ledgers/status.ts:14-16`) and cannot scope a cycle.
  - **Default if unanswered:** A.
- **Open Question:** **Persistent-repo branch semantics?** → maintainer.
  - **Options:** A — `main` = canonical fixture; `dev` = integration; reset is one direct commit on `dev` · B — single-branch · C — reset on the run's `feat/*` branch.
  - **Recommended:** A — `feat/{FID}` does not exist until design's worktree setup mints it off `origin/dev` (spike C1); reset-on-`main` reintroduces the append-at-EOF ledger conflict.
  - **Default if unanswered:** A.
- **Open Question:** **Public-privacy check — what, when, by what?** → maintainer.
  - **Options:** A — every-push CI step scanning that push's diff for secret + home-path shapes, plus a pre-first-publish manual review · B — PR-only CI step · C — rely on GitHub push protection alone.
  - **Recommended:** A — a public repo is public the moment it is pushed; the leak-prone artefacts are pushed by the workflows (review-2 CRITICAL 3).
  - **Default if unanswered:** A.
- **Open Question:** **Placeholder-check specifics?** → maintainer.
  - **Options:** A — sentinel string in the fixture placeholder; PR-only step asserts the sentinel is gone from the built page (deterministic, no AI) · B — whole-file hash compare · C — a fixture-shipped sentinel test inside `node --test`.
  - **Recommended:** A — the fixture ships no test subject (binding); a hash would false-fail on formatter churn.
  - **Default if unanswered:** A.
- **Open Question:** **Demo vs benchmark — same repo/folder, or separate?** → maintainer.
  - **Options:** A — same repo and folder; demo = 1 run, benchmark = N runs · B — separate.
  - **Recommended:** A — history is the run history either way; separate duplicates the lifecycle.
  - **Default if unanswered:** A.
- **Open Question:** **Repo bootstrap — name/owner and how created?** → maintainer.
  - **Options:** A — `cbartens/bkit-example`, created once by `new-run.mjs --bootstrap` (create, or verify-and-repair) · B — a documented `gh repo create` one-liner.
  - **Recommended:** A — bootstrap is the once-per-repo-life step executed by the person with least context; verify-mode is the drift-repair path.
  - **Default if unanswered:** A.
- **Open Question:** **What does one full run cost?** (design open Q) → maintainer; source is #526.
  - **Options:** A — record wall time + counters only, report cost as unmeasured · B — host-specific session-transcript reader now · C — generic `cost` field behind new instrumentation.
  - **Recommended:** A — no token/cost source exists today; B/C build substrate for an unsettled spec.
  - **Default if unanswered:** A.
- **Open Question:** **Does the benchmark ship any tooling?** (design open Q)
  - **Options:** A — none; documented manual N-run + raw rows + README median table · B — `--runs N` flag on the runner · C — a separate median-folding harness.
  - **Recommended:** A — a run is human-in-loop regardless; tooling only adds a system to maintain.
  - **Default if unanswered:** A.
- **Open Question:** **Which Node LTS is pinned, and how recorded?** (design open Q)
  - **Options:** A — Node 24 LTS in the capstone, `cd example && node --test`, recorded per run · B — Node 22 LTS (behaviour-identical; preference) · C — Node 20 + the v1 form (couples to oldest LTS).
  - **Recommended:** A — the image moves; an image change must not masquerade as a cohort difference.
  - **Default if unanswered:** A.
- **Open Question:** **How far does the anti-concurrency guard go?** (design open Q)
  - **Options:** A — preflight refuses when `origin/dev` carries an unmerged reset commit, with `--force-run` · B — lock file / dedicated ref · C — remote lock label/issue check.
  - **Recommended:** A — cheap, reuses state preflight already reads; the override keeps a stuck run recoverable.
  - **Default if unanswered:** A.
- **Open Question:** **What happens when `feat/{FID}` already exists?** (design open Q)
  - **Options:** A — out of scope; each run files a new issue; document the assumption · B — probe next spike · C — runner refuses.
  - **Recommended:** A now; B if a same-issue re-run is ever wanted.
  - **Default if unanswered:** A.

Which option is right is advisory and does not influence the verdict — the design already answers every question (each carries its resolution: option A adopted, recorded in `docs/decisions.jsonl` this cycle); the three 👤 confirmation checkboxes remain for the human.

## Recommended Next Step

```text
/bkit-build #504
Brief: Build the bkit-side example tooling per docs/plans/202610/logs/504-example-project/plan-v3-checked.md —
the immutable fixture (sentinel placeholder + data.js + FEATURE-REQUEST.md), the durable harness and hand-written
capstone workflow, the maintainer runner (bootstrap + rulesets, per-run preflight/reset/install read-backs), the
bats suite over the extended gh stub, the analysis prompt, the contract docs and own-gate registrations.
Caveat: Gate 1 requires the three human confirmations (Acceptance Scenario; Breaking Changes incl. the CI-edit
sign-off for .github/workflows/bkit-ci.yml; Open Questions) before tasks run.
```
