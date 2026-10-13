Verdict: CONCERNS
<!-- verdict:end -->

# Design: bkit Example Project — Interactive Pipeline Explainer

## Related Issues

- #505 — Root README sells bkit for the public launch (closed)
- #528 — ci: reuse the dev push run for promotion PRs (adopt release-PR mirror mode in bkit's own CI) (closed)
- #408 — Publish @cbartens/bkit publicly on npmjs; no consumer auth (closed)

Cited by #504 and load-bearing here: #43 (the eval tiers this slots into; measurement-vs-pass/fail), #45 (per-host evidence this would supply), #232 (flaky/AI graders must never fail CI).

Binding inputs folded into this revision: `design-review-1.md` (buildability — 2 CRITICAL, 6 OPTIONAL), `design-review-2.md` (operability — 4 CRITICAL, 10 OPTIONAL), `design-spike.md` (C1 `DISPROVEN`, C2-C9 `SETTLED`, C10 `BLOCKED`), and `design-revision-notes.md` (human, binding: the liveness-only framing, the still-to-fix CRITICALs, the CI screenshot, and the AI run analysis).

## Acceptance Scenario

Initial draft — expanded by later review; no Test Matrix yet.

### Narrative

A maintainer runs the repo tooling once in bootstrap mode to create the persistent public example repo, then runs it per experiment: it resets the example app folder on `dev` to the canonical fixture, installs the latest bkit, files the fixed feature request as an issue and prints the start command. They start the pipeline, sign off after design and after plan, and bkit builds an interactive page that explains bkit's own phases and loops inside that folder, then merges it — the repo always shows the same example folder, its git history is the run history, and the accumulated `.bkit/stats.jsonl` holds every run's numbers. They repeat the run a few times and read the middle wall time and counters, grouped by the recorded bkit version, to tell whether a change made bkit faster, cheaper or more reliable; CI captures a screenshot of the built page as a per-run build artefact (never gating), and an AI analysis prompt run after the run stops produces a scored report of how the run went and how near the ideal it landed; a visitor to the public repo sees the same folder, the same history and the same evidence.

### Framing — the only binary is run completion

This example is **not** a CI gate on bkit. Runs are ad hoc, by the maintainer (rev-notes §1).

- **`PASS` = liveness only:** the pipeline ran design → plan → build → ship on the example repo and its own CI (`bkit-tests-check`) is present and green at the merged PR. A run liveness signal, not a quality verdict.
- **Everything else is recorded and analysed, never gating:** whether the logic tests actually executed, whether review caught the planted traps, the blank-page / double-click result, retries and loops, divergence from ideal, wall time, counters, the screenshot and cost.
- **What still reds a run is only what stops it being a completed run:** a genuinely failed test (the pipeline could not converge), the privacy scan (a leak cannot be merged into a public repo), and the sentinel surviving (the build produced no deliverable). `always-red CI ⇒ no run ever completes ⇒ zero data` is the failure this framing still forbids (rev-notes §2).
- The AI report (§ Success Criterion 7) is the analysis half of this model; trap-catching and the blank-page signal live there, not in the gate (#232).

### Success Criteria

1. `node scripts/example/new-run.mjs --bootstrap` creates the public repo `cbartens/bkit-example` **once** — canonical fixture on `main`, a pushed `dev` — and is idempotent (re-run verifies and repairs drift, never creates or deletes the repo); a half-seeded state (create succeeded, seeding failed) is repaired by re-running it.
2. A run resets **only** the app folder (`example/`) from the fixture as one commit on `dev`, runs `pnpm install` against the committed `pnpm-lock.yaml`, installs the latest `@cbartens/bkit` with `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github`, reads the `github` tracker back, and reaches a merged PR with the portable test invocation (`cd example && node --test`) green and the placeholder sentinel gone from the built page.
3. The repo's own capstone `bkit-tests-check` is present and green at PR head, so `/bkit-ship`'s merge gate is satisfied; the gating steps are the tests step (`cd example && node --test`) and the every-push privacy scan, while the PR-only sentinel check is scoped to pull requests, so a reset push to `dev` never reds.
4. Results live in the repo's tracked `.bkit/stats.jsonl`, which accumulates across runs because the reset never touches it; reading it directly and grouping `outcome` rows by `bkitVersion`, then run-scoping each cycle by the **run marker** (the reset commit / filed issue #) — never by `parentSha`, which is per-workflow-step and forensic (`ledgers/status.ts:14-16`) — yields one comparable result per run: no separate aggregate store, no new format, no report code.
5. Nothing measured can fail a run: pass/fail is **run completion** alone (design → plan → build → ship, capstone green at the merged PR); executed-test count, trap-catching, the blank-page / classic-script result, retries and loops, divergence from ideal, wall time, counters, the screenshot and cost are recorded and analysed, never gated (#232).
6. CI captures a screenshot of the built page at PR head and uploads it as a per-run build artefact with `continue-on-error: true` — never gating, a CI-only dependency (headless browser), never an app dependency (the app keeps no packages, no secrets); a failed capture warns loudly and never fails the run.
7. An AI analysis prompt (`examples/analysis-prompt.md`, bkit-side, **never published** into the run repo) runs after the run stops — completed or aborted — reads the run's artefacts, and produces a **scored report** committed beside the run's `status.jsonl`; non-gating, and grouped by `bkitVersion` with the run so scores stay comparable.

### Key Edge Cases

- **Reset scope (destructive failure mode):** the folder delete is the one destructive filesystem op; a bug that widens the path (`rm` at root or `.bkit/`) destroys the accumulated benchmark history. The delete is scoped to the app folder and the resolved path is asserted before deleting.
- **Reset lands on `dev`, not the feat branch (blocking first step):** `feat/{FID}` does not exist until design's worktree setup mints it off `origin/dev` (spike C1). Pre-cutting it couples the reset to unverified worktree-adoption behaviour; a reset on `main` makes the ledgers conflict from run 2 (append-at-EOF, same hunk).
- **Overlapping runs (concurrency):** two concurrent runs append `.bkit/stats.jsonl` / `docs/deferrals.jsonl` / `docs/failures.jsonl` at EOF; the second PR conflicts on every ledger file. Serial topology is the invariant.
- **Tracker default (silent failure):** `bkit install` without `--tracker=github` records `issueTracker: "none"`, and every workflow renders `_No tracker connected, skip step._` with no error and no gate. The runner reads the value back and stops unless it is `github`.
- **Install needs a module flag (spike C5, DISPROVEN):** `bkit install --tracker=github` alone exits 1 mid-sequence; the runner always passes `--claude`.
- **Gate-chain growth (drift):** a bkit release adds or renames a script in the seeded `bkit:gate:*` chain, so the fixture's pre-declared scripts stop satisfying it — silently, because the advisory fires only on _missing_ names, never on a chain that grew.
- **Always-latest upgrade path (new failure class):** a breaking bkit release blocks the sweep at reset. Grouping by `bkitVersion` keeps a sweep straddling a release comparable; the assertion battery makes the block loud.
- **Test invocation × Node pin are ONE coupled decision (spike C1 `DISPROVEN`, C2 `SETTLED`):** `node --test example` is invalid on Node ≥ 22 (a bare directory positional is loaded as a module → `MODULE_NOT_FOUND`, exit 1), while the bound glob `node --test "example/**/*.test.js"` is invalid on Node 20 (passed through as a literal path → `Could not find …`, exit 1, with or without tests). The portable form is `cd example && node --test` (`rc=0` on Node 20, 22 and 24, with tests present **and** with zero tests; `rc=1` on a failing test), so the pin stays a free choice — but the pin and the form must be stated and carried as one pair by the fixture `scripts.test`, the capstone `tests` step and the contract table. The v1 premise was inverted: bare root `node --test` is recursive and **does** discover subfolder tests (probed on 22/24; never run on 20, so it does not qualify as portable).
- **Vacuous green (recorded, never a verdict):** `node --test` exits 0 over zero discovered tests, so a green capstone can be vacuous. The PR-only executed-count step records the count (spike C4) and the AI report reads it, but it never fails a run (rev-notes §1).
- **The reset state has zero tests by construction:** the fixture ships no test file, so an executed-count assertion applied unconditionally reds every reset push to `dev`; it is PR-only (spike C4, confirmed live in `38213206402` vs `38212731480`).
- **`out=$(…)` under `bash -e` discards the capture:** the shell aborts on the substitution's non-zero status and the captured TAP output never reaches the log (spike C4 cautionary run `38212731480`); the tests step writes TAP to a file and parses the count from it.
- **bkit's own gate blast radius (review-1 CRITICAL 2):** `examples/**` and `scripts/example/**` are inside bkit's own `prettier --check .` and `bkit ci slop` scope, so landing the fixture can red bkit's CI; the fixture is committed prettier-formatted and `examples/bkit-explainer/**` is added to `slop-scan.config.json` `ignores` (deliberate near-empty fixture data), while the runner stays scanned and slop-clean.
- **`bkit runs gate --repo <other-repo> --pr N` reads the current checkout (spike-discovered, outside the claim set):** it resolves the PR via `gh pr view N` **without** `--repo`, so from outside the run repo it silently gates an unrelated PR (exit 10). `/bkit-ship` runs inside the run repo and is unaffected; the runner and bats suite must never use that pair.
- **Bootstrap half-state (review-2 OPTIONAL):** `gh repo create` succeeding while seeding fails leaves a half-seeded **public** repo; re-running `--bootstrap` enters verify-mode and repairs it, and the failure output names the half-state. The **create** half is unexercised (no `delete_repo` scope, spike § Create half); **verify-and-repair** is proven idempotent (spike C9).
- **Repair does not prune (spike limitation):** verify-mode re-publishes changed and missing files but does not remove a stale extra file present in the repo and absent from the source of truth.
- **Sentinel false-fail / drift (determinism):** the built page legitimately quoting the sentinel string would false-fail; the feature request forbids quoting it, the sentinel is unguessable, and the string is defined **once** (single source, referenced by the fixture placeholder and the CI step) so an edit to the placeholder copy cannot drift the fixture from the check.
- **Public privacy (load-bearing, not optional; the one irreversible path):** run artefacts leak absolute home paths (`/Users/<name>`) even with zero secrets; worktree setup copies `.env` / `.env.local` into worktrees (C1 evidence), so the fixture `.gitignore` covers them and the scan reads the diff for secret **and** path shapes. The leak-prone artefacts (`docs/` logs, `status.jsonl`, the analysis report, the screenshot) are pushed by the **workflows** and by the report commit, not by the runner — so the scanner runs on **every push**, not only over the reset diff, and must not depend on the built page so the reset push stays green.
- **`[skip ci]` at HEAD (KN-11):** empties `statusCheckRollup`, so the merge gate sees no capstone. The reset commit and every pipeline commit carry no skip markers.
- **Branch protection on `dev` (403 on the very first run):** the runner writes `dev` directly; bootstrap must not enable protection on `dev`.
- **Ledger growth / single writer (accepted):** `.bkit/stats.jsonl` grows unbounded (bkit warns at 5000 rows, no rollup); serial runs keep appends single-writer.
- **AI non-determinism (#232):** a run may not catch a planted trap, and the analysis score is AI-produced; both are recorded and scored, never gated, and neither the demo narrative nor the score may be read as a verdict on bkit.
- **Human hard stops:** design and plan end awaiting a human, so N runs = N human sessions; benchmark scheduling and cost claims must price human time.

### Process Sketch

- WHEN the maintainer runs `new-run.mjs --bootstrap` → THEN create (or, if it exists, verify and repair) the public repo with the canonical fixture on `main` and a pushed `dev`; normal runs never create or delete it.
- WHEN the maintainer runs the runner for a run → THEN preflight (fixture present with its sentinel, `main` still carries the fixture, `git status` clean and `dev == origin/dev`, `gh auth`, Node ≥ the pinned LTS, pnpm) → reset **only** `example/` from the fixture as one commit on `dev` (post-delete check that every removed path resolved inside `example/`) → `pnpm install` → `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github` → read tracker/version/gate-chain back → push → file the issue → print the start command; one `[bkit-example]` line per transition.
- WHEN the maintainer starts the pipeline → THEN design → hard stop → plan → hard stop → build (agents write `index.html`, the logic file and its `node --test` tests) → PR opened.
- WHEN CI runs → THEN on **every push** the tests step runs `cd example && node --test` and the privacy scan reads the diff → at PR head the sentinel must be gone, and the executed-count and classic-script assertions are recorded (non-gating), with the screenshot captured and uploaded (non-gating) → THEN `/bkit-ship` merges into `dev`; a reset push to `dev` runs the tests and privacy steps only.
- WHEN a planted trap is missed → THEN `node --test` fails → the debug loop diagnoses, fixes and retries within its attempt budget.
- WHEN the run stops (completed or aborted) → THEN run the analysis prompt against the run's artefacts → a scored report lands beside the run's `status.jsonl` → read the middle wall time, counters and scores from the repo's `.bkit/stats.jsonl` and the reports, grouped by `bkitVersion`.

## Reuse & Prior Art

| Capability                                                  | Prior art                                                                                                                         | Verdict           | Why                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A versioned example fixture under `examples/`               | `None` — searched repo root, `.bkit/`, `scripts/`, `tests/`; no `examples/` exists today                                          | `BUILD-CUSTOM`    | No existing artifact covers a runnable example; the issue prescribes `examples/` as its home and this fixture is versioned with bkit.                                                                                                                  |
| Repo-side maintainer runner                                 | `scripts/readme/readme-art.mjs`, `scripts/ci/lanes/*.mjs`, `scripts/slop/*.mjs`                                                   | `EXTEND-EXISTING` | Same `scripts/<area>/*.mjs` pattern: add `scripts/example/new-run.mjs`, matching the closest equivalent.                                                                                                                                               |
| Persistent public-repo creation + `main`/`dev` seeding      | `gh repo create --public`; `tests/fixtures/gh/bin/gh` stub shows the `gh api` shape                                               | `EXTEND-EXISTING` | Reuse `gh` directly; no wrapper. The stub shims **four** `gh api` URL shapes only and exits non-zero on non-`api` argv (test-harness precedent, not runner reuse).                                                                                     |
| Installing and upgrading bkit in the repo                   | `bkit install --claude --tracker=github` (`install/install.ts`); `bkit upgrade --latest` (atomic self-bump, `install/upgrade.ts`) | `USE-AS-IS`       | Reuse the real installer and upgrade path through the pinned devDependency (`pnpm exec bkit …`); never reimplement. Install needs ≥1 module flag (spike C5).                                                                                           |
| Minting the run branch off `dev`                            | `bkit worktrees setup` (spike C1: mints `feat/{FID}` off `origin/dev` with `main` default)                                        | `USE-AS-IS`       | The runner does not cut `feat/*`; the pipeline mints it off `origin/dev`, so the reset must already be on `dev`.                                                                                                                                       |
| Accumulating results across runs                            | `.bkit/stats.jsonl` (`merge=union` in `.gitattributes`; rows carry `bkitVersion`; `.bkit/jsonl.md` envelope)                      | `USE-AS-IS`       | Reuse the existing tracked file, row shape and union merge; no new format, no separate aggregate store.                                                                                                                                                |
| Satisfying the local gate chain (`bkit:gate:static-unit`)   | Seeded add-if-missing scripts — `install/modules/core.ts`, `BKIT_GATE_SCRIPTS` in `install/manifest.ts:215`                       | `EXTEND-EXISTING` | Pre-declare the tool-script names the seeded chain calls (`typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta`, `test`, `build`), using the repo's own "skip if tool absent" idiom. Never weaken a gate.                                    |
| Satisfying the ship merge gate (capstone job green at head) | `.bkit/templates/.github/workflows/bkit-ci.yml` (copy-and-own, ~1065 lines); `bkit.capstoneJob` default `bkit-tests-check`        | `BUILD-CUSTOM`    | The template is copy-and-own and permits owning a reduced copy; own a hand-written single-job file instead of adopting the full template (drift surface).                                                                                              |
| Test runner for the built app                               | Node built-in `node --test` (`engines.node >= 20`)                                                                                | `USE-AS-IS`       | Already the intended runner and the issue's only CI check; adds zero dependencies. The **invocation form** is the design's own choice (spike C1/C2: `cd example && node --test`).                                                                      |
| Deterministic placeholder (sentinel) check                  | `None` — no existing artifact asserts "the placeholder was replaced"                                                              | `BUILD-CUSTOM`    | New data (an unguessable sentinel string, single-sourced) plus a PR-only check; the fixture ships no test, so this is the only code-checked signal that a run actually built the page.                                                                 |
| Screenshot artefact (never gating)                          | Headless Chrome — `--headless=new` (spike C8); auto-detected binary in `scripts/readme/readme-art.mjs`                            | `ADAPT`           | The mechanism is a **script**, not a reusable module, so the detect+invoke block is copied into the workflow (spike C8 source); `actions/upload-artifact@v4` is `EXTEND-EXISTING`.                                                                     |
| Content data the built page reads                           | Fixed fixture `data.js`, loadable by a classic `<script src>` off `file://`                                                       | `BUILD-CUSTOM`    | No existing content artifact encodes bkit's phase/loop skeleton; `data.js` is new data, not code.                                                                                                                                                      |
| Benchmark measurement inputs                                | `.bkit/stats.jsonl` `outcome`/`counter` rows; `status.jsonl` step rows                                                            | `USE-AS-IS`       | The rows already exist and carry `bkitVersion`; the benchmark is a reader, so no new artifact or record schema is added.                                                                                                                               |
| Contract documentation for the example                      | `docs/templates/*`; `.agents/docs.md` doc index                                                                                   | `EXTEND-EXISTING` | Add `examples/README.md` contract table and register it in `.agents/docs.md`, following the existing docs-index pattern.                                                                                                                               |
| Reading the installed version                               | `.bkit-version` JSON schema (`pinnedVersion`) — KN-9                                                                              | `USE-AS-IS`       | Read the version through the JSON schema; never raw `readFileSync().trim()`.                                                                                                                                                                           |
| Runner verification over a `gh` stub                        | `tests/fixtures/gh/bin/gh` shim; `tests/gh-stub-smoke.bats`, `tests/bkit-cloud-bootstrap-preflight.bats`                          | `ADAPT`           | The stub must gain a `gh auth status` shape for the preflight case, and the suite is **narrowed** to preflight / reset-scope / gate-chain; bootstrap-verify stays on the live canary — the runner sits outside vitest's include and outside `tsc`.     |
| Registering the new paths in bkit's own gates               | `.prettierignore`; `slop-scan.config.json` (`ignores` / `overrides`); `pnpm bkit:gate:static`                                     | `EXTEND-EXISTING` | The fixture and runner land inside bkit's own `prettier --check .` and `bkit ci slop`; format the fixture and add one `slop-scan` ignore entry, following the existing non-source-tree ignore idiom.                                                   |
| AI run-analysis prompt (score + report)                     | `docs/templates/bkit-audit-*.md` + `@bkit-audit-generate` (the repo's template-run-to-report idiom)                               | `BUILD-CUSTOM`    | The audit idiom writes its report into **bkit's** repo; this report must land with the run's evidence in the **run** repo, read run-specific artefacts, and score against a fixed ideal — a new prompt doc, reusing the report-as-artefact shape only. |
| Screenshot upload                                           | `actions/upload-artifact@v4`                                                                                                      | `USE-AS-IS`       | Proven in spike C8 (artefact `screenshot`, 3378 bytes, non-gating).                                                                                                                                                                                    |

## Architecture

Five separable parts, each small: an immutable **fixture**, a durable bootstrap-installed **root harness**, one **runner**, an independent **gate**, and a non-gating **analysis prompt**. The layering is what turns "measurement never fails a run" and "the reset never destroys evidence" from conventions into boundaries.

**1. Fixture (immutable; knows nothing about the harness) — `examples/bkit-explainer/` in bkit's repo**

The versioned start state. Data/inputs only — no app logic, no tests beyond the placeholder:

- `index.html` — a **near-empty placeholder** carrying the sentinel string (`BKIT-EXAMPLE-SENTINEL-<unguessable>`); if it survives a run, the build produced nothing → that run failed. Written so it does not trip bkit's own `comments.placeholder-comments` pattern.
- `data.js` — the fixed content data (phases, loops, counters, transitions) as a classic-script-loadable plain JS file, never `.json` (a page opened off disk cannot `fetch`).
- `FEATURE-REQUEST.md` — the fixed, pre-written request the runner files as the issue (content requirements, the four traps as plain requirements, the fixed filenames, the plain-`<script src>` / one-pure-function rules; forbids quoting the sentinel).
- The repo-root harness sources the bootstrap installs, under `harness/` in the fixture: `package.json`, `pnpm-lock.yaml`, `bkit-ci.yml` (published to `.github/workflows/`), `README.md`, `gitignore` (published to `.gitignore`) — see part 2 and the source→destination mapping in Data Model.

The sentinel string is defined **once** in the fixture and referenced by the CI step, so no copy can drift.

**2. Durable root harness (bootstrap-installed; outside the reset surface)**

The persistent repo's root: `package.json` (consumer harness, gate stubs, `bkit` block), `pnpm-lock.yaml` (committed; `bkit upgrade`/`install` fail without one), `.github/workflows/bkit-ci.yml` (capstone + every-push + PR-only steps), `.bkit/` (installed payload + the accumulating `stats.jsonl` / `status.jsonl`), `docs/` (accumulating plans, logs, analysis reports), `README.md`. The reset **never** touches these; only `example/` is re-created.

**3. Runner (bkit-side maintainer tooling) — `scripts/example/new-run.mjs`**

Owns the persistent repo's lifecycle and the run's setup: idempotent `--bootstrap` (create, or verify-and-repair, including a half-seeded state); per run: preflight → reset `example/` on `dev` from the fixture as one commit (pre-delete path assertion **and** post-delete verification) → `pnpm install` → `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github` → read-backs (tracker = `github`, version from `.bkit-version` via its JSON schema, every seeded `bkit:gate:*` script resolves) → push → file the issue → print the start command. One `[bkit-example]` line per transition, and a failure names exactly what state `dev` was left in. It owns the measurement **inputs** only and never gates; it does **not** capture the screenshot (CI owns that). The reset is the only destructive filesystem op and is scoped to `example/`.

**4. Gate (independent of the runner) — the repo's own `bkit-ci.yml`, `node --test`, and the merged PR**

The only thing that fails a run. The capstone `bkit-tests-check` runs the app tests on every push with the portable invocation (`cd example && node --test`, TAP written to a file so the executed count is parseable) and privacy-scans the diff of **every** push; on `pull_request` it additionally asserts the sentinel is gone, records the executed-test count and the classic-script assertion (non-gating observations), and captures + uploads the screenshot (non-gating). `/bkit-ship` refuses to merge unless the capstone is present and green at PR head. The runner never gates; the gate never measures.

**5. Analysis prompt (bkit-side; never published) — `examples/analysis-prompt.md`**

The scored report of how a run went and how close to ideal the result is. Run by the maintainer in an agent session after the run stops — completed or aborted — against a checkout of the run repo. It reads the run's artefacts and writes its report into the run repo; it gates nothing and owns no measurement of its own (see Components / Flows — analysis).

**Boundaries**

- Fixture ↮ harness: the app never learns the harness exists; the harness never learns what the app does.
- Gate ↮ measurement: the only binary is run completion (design → plan → build → ship, capstone present and green at the merged PR); executed-test count, trap-catching, the classic-script result, wall time, counters, the screenshot, the analysis score and cost are recorded and never fail a run.
- Reset surface ↮ durable root: `example/` is disposable and re-created every run; the root harness, the ledgers and the run logs accumulate and are never reset.
- Runner ↮ repository semantics: the runner owns bootstrap and the reset; the run itself, once seeded, is ordinary bkit-in-a-consumer-repo.
- Gate ↮ analysis: nothing the analysis reads can influence a merge; nothing the gate emits is a quality verdict.

**Integration points**

`gh` CLI (repo create, push, PR view, issue create) · pnpm / Corepack (`packageManager` pin + committed `pnpm-lock.yaml`) · `pnpm exec bkit upgrade --latest` · `pnpm exec bkit install --claude --tracker=github` · seeded `bkit:gate:*` chain · `bkit.capstoneJob` / `bkit.ciWorkflow` merge-gate contract (invoked from inside the run repo — `bkit runs gate --repo … --pr` mis-resolves the PR, spike § discovered defect) · GitHub Actions (the repo's own CI on literal `main`/`dev` triggers and PRs to `dev`) · `actions/upload-artifact@v4` · GitHub Issues tracker · bkit ledgers (`status.jsonl`, `.bkit/stats.jsonl`) · headless Chrome **in CI** (screenshot; CI-only dependency, never an app dependency) · the maintainer's agent host (analysis prompt).

**Deliberately outside the boundary**

No hosting, no deploy, no packages, no secrets, no private-registry auth (`@cbartens/bkit` is public on npmjs today). No repo teardown or retention sweep (the repo is persistent). No second harness, no record schema, no separate aggregate store. No smoke job in bkit's own CI (ad hoc runs only). No browser or headless dependency inside the app; no CI-side AI job (the analysis is host-invoked, non-gating).

## Data Model

No database. Three schemas are load-bearing: the durable root `package.json`, the fixed content data, and the ledger rows the benchmark reads.

**Persistent repo layout — `cbartens/bkit-example` (public)**

```
cbartens/bkit-example/
├── package.json                 # durable harness (table below)
├── pnpm-lock.yaml               # durable: committed lockfile — upgrade/install fail without one
├── FEATURE-REQUEST.md           # durable: the fixed request, filed as the issue
├── .github/workflows/bkit-ci.yml# durable single-job capstone: every-push + PR-only steps
├── .bkit/                       # installed payload + accumulating stats.jsonl / status.jsonl — NEVER reset
├── docs/                        # accumulating design/plan/build logs + analysis reports — NEVER reset
├── README.md                    # written by bootstrap: main = fixture, dev = integration, reset, stats read path, never-prune rule
├── example/                     # RESET per run — re-created from the fixture
│   ├── index.html               # near-empty placeholder + sentinel (fixture)
│   ├── data.js                  # fixed content data (fixture)
│   └── … (agents add logic.js and its node --test tests here)
```

`main` holds the canonical fixture (the reproducible start); `dev` is integration (each run's PR merges here); the reset restores **only** `example/` from the fixture, so the reset set and the fixture set are the same set.

**Fixture → run-repo mapping (pinned; one home per file)**

| Fixture source (`examples/bkit-explainer/…`) | Run-repo path                   | Reset per run? | Published by |
| -------------------------------------------- | ------------------------------- | -------------- | ------------ |
| `index.html`                                 | `example/index.html`            | yes            | every run    |
| `data.js`                                    | `example/data.js`               | yes            | every run    |
| `FEATURE-REQUEST.md`                         | `FEATURE-REQUEST.md`            | no (durable)   | bootstrap    |
| `harness/package.json`                       | `package.json`                  | no             | bootstrap    |
| `harness/pnpm-lock.yaml`                     | `pnpm-lock.yaml`                | no             | bootstrap    |
| `harness/bkit-ci.yml`                        | `.github/workflows/bkit-ci.yml` | no             | bootstrap    |
| `harness/README.md`                          | `README.md`                     | no             | bootstrap    |
| `harness/gitignore`                          | `.gitignore`                    | no             | bootstrap    |
| `../README.md` (contract table)              | — never published               | n/a            | never        |
| `../analysis-prompt.md`                      | — never published               | n/a            | never        |

`FEATURE-REQUEST.md` is **authored** in the fixture and **published** to the run-repo root — one home per file, never two. The reset set is exactly the two app files (plus whatever a run added under `example/`).

**Root `package.json` (durable harness)**

| Field                                                                         | Value / shape                                                                                                       | Why it exists                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                                                                        | `"bkit-example"`                                                                                                    | `bkit install` blocks without a parseable `package.json` (`no-package-json`) and `resolveTokens` hard-throws when `name` is absent (`install/placeholders.ts:71-75`).                                              |
| `private`                                                                     | `true`                                                                                                              | Prevents accidental publish from the public repo.                                                                                                                                                                  |
| `type`                                                                        | _(absent)_                                                                                                          | Absent ⇒ `.js` is CommonJS, so a logic file satisfies both `require` under `node --test` and a classic `<script src>` (dual-load guard, spike C3).                                                                 |
| `packageManager`                                                              | `pnpm@<pinned>` + a committed `pnpm-lock.yaml`                                                                      | Corepack resolves the same pnpm in the worktree installs the workflows trigger; `bkit upgrade`/`install` fail without a committed lockfile (spike C1, prior cycle) → the runner runs `pnpm install` first.         |
| `engines.node`                                                                | `">=20"`                                                                                                            | Connects the repo to the capstone's pinned `node-version` (24 LTS), which is the recorded benchmark variable; the chosen invocation form is portable across 20/22/24, so the pin stays a free choice (spike C2).   |
| `devDependencies["@cbartens/bkit"]`                                           | kept at **latest** by the runner (`pnpm exec bkit upgrade --latest`); the version is recorded per run, never pinned | Always-latest is the binding decision; the recorded `bkitVersion` keeps a release-straddling sweep comparable.                                                                                                     |
| `scripts.test`                                                                | `cd example && node --test`                                                                                         | The portable invocation (spike C2: `rc=0` on Node 20/22/24, tests present or absent; `rc=1` on a failing test). `node --test example` is invalid on Node ≥ 22 and the bound glob is invalid on Node 20 (spike C1). |
| `scripts.typecheck`                                                           | `node --check example/data.js example/logic.js` (logic built by the run)                                            | Pre-declared so the seeded chain's `pnpm typecheck` resolves; the feature request fixes the filenames, so the check never depends on a name an agent chose.                                                        |
| `scripts.lint` / `format:check` / `lint:prose` / `slop:delta` / `lint-staged` | documented no-ops that echo what they skip to stderr (the repo's own `lint` idiom)                                  | The seeded chain calls them; the feature request must not claim they check more than they do.                                                                                                                      |
| `scripts.build`                                                               | no-op                                                                                                               | `bkit:gate:install-static-unit-build` (ship's conflict-resolve path) calls `pnpm build`.                                                                                                                           |
| `bkit.issueTracker`                                                           | `"github"`                                                                                                          | Belt-and-braces alongside `--tracker=github`; the default `none` silently guts the demo. The runner reads this value back after install and stops unless it is `github`.                                           |
| `bkit.capstoneJob`                                                            | `"bkit-tests-check"`                                                                                                | Names the merge-gate check ship requires.                                                                                                                                                                          |
| `bkit.ciWorkflow`                                                             | `"bkit-ci.yml"`                                                                                                     | Names the workflow file ship reads.                                                                                                                                                                                |

Seeded `bkit:gate:*` names are add-if-missing and are **not** pre-declared — `bkit install` writes them and never overwrites a consumer's version.

**`example/data.js` — fixed content data (new, no existing equivalent)**

| Field       | Shape                                                | Meaning                                                                                            |
| ----------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| global name | one fixed identifier, e.g. `__BKIT_EXPLAINER_DATA__` | The page and the tests read the same object; no fetch, no module.                                  |
| `phases`    | `[{ id, label, order }]`                             | The stable skeleton: design, plan, build, debug, ship.                                             |
| `nodes`     | `[{ id, kind, phaseId, parallelGroup? }]`            | Boxes. `parallelGroup` marks reviewers that run at the same time (trap 2).                         |
| `edges`     | `[{ id, from, to, kind }]`                           | Arrows. `kind` distinguishes forward, review-back (trap 1) and failure-to-debug.                   |
| `counters`  | `[{ id, label, derivesFrom }]`                       | Counters, each declared as derived from the position in the run (trap 1: a rewind must recompute). |
| `handover`  | `{ nodeId, condition }`                              | The too-many-failures handover node.                                                               |

Content is data only: the agents build the interactive part and never invent how bkit works.

**Ledger rows the benchmark reads (existing; no schema change)**

| Row kind  | Fields consumed                                                                                                              | Where                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `outcome` | `durationSeconds`, `taskCount`, `reviewIterations`, `deferrals`, `failures`, `bkitVersion`, `ts`, `prNumber` (ship row only) | `.bkit/stats.jsonl` (tracked, `merge=union`) |
| `counter` | `counterName`, `counterValue` (attempt counters, incl. debug retries)                                                        | `.bkit/stats.jsonl`                          |
| step rows | `workflow` / `step` / `status` / `at` — the phase timeline                                                                   | `status.jsonl`                               |

Reader contract: `outcome` is **one row per workflow run**, so a design→plan→build→ship cycle = four `outcome` rows, each with its **own** `parentSha`, and `repo` is constant across every run in the persistent repo. `parentSha` is captured per workflow step at step start and is explicitly **forensic** (`ledgers/status.ts:14-16`), so it can never scope a cycle. Group by `bkitVersion`, then **run-scope by the run marker** (the reset commit / filed issue #, Success Criterion 4): the ship row's `prNumber` names the run's PR, and the other three rows fall inside the window between that run's reset commit and its merge — unambiguous because runs are serial (the invariant below). `status.jsonl` rows discriminate on `type` (not `kind`); `outcome.reviewIterations` is optional and absent from some rows — absence is never failure.

**Run marker (no new ledger kind).** A run that dies before its first pipeline row would be invisible in the benchmark. The marker is the **reset commit itself** — message `chore(example): reset run {N} (bkit {x.y.z})` — not a ledger row: `kind` is a closed enum (`.bkit/jsonl.md`) with no `run` member, and the writers table allows no runner-written kind. `git log --grep` on `dev` counts attempted runs per version; `outcome` rows count completed ones. The same marker is the run-scope anchor the reader uses.

**Report artefact (no ledger row).** The analysis report is a committed markdown file, not a ledger row: `docs/plans/{YYYYMM}/logs/{FID}/analysis-run{N}.md`, beside that run's `status.jsonl`. It records the score, the rubric breakdown, the prompt revision and the observed signals (executed count, trap-catching, classic-script result) that the framing demotes from gates to observations. No new `kind`, no schema change.

**Relationships**

`package.json` declares the gate/merge contract → the seeded chain and `bkit-ci.yml` consume those names → CI emits the `bkit-tests-check` check → ship's merge gate reads that check. Independently, the run writes ledger rows → the benchmark's read path consumes them, and the analysis prompt reads them without writing any. The two chains must never meet: no ledger row and no report may influence the gate.

## Components / Flows

**Component inventory**

| Component                            | Type                    | Owns                                                                                                                                                                                                                                                                                                              | Must never                                                                                                                                   |
| ------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `examples/bkit-explainer/`           | immutable fixture       | the versioned start state (placeholder `index.html` + sentinel, `data.js`, feature request, harness sources incl. the lockfile)                                                                                                                                                                                   | contain app logic, tests, or any harness knowledge beyond the placeholder                                                                    |
| `examples/README.md`                 | docs (bkit-side)        | the contract table: gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, sentinel, reset procedure, run-marker, harvest/median read path, version-grouping rule, serial invariant, never-prune rule, privacy, `[skip ci]` recovery, breaking-release runbook                               | be copied into the run repo (it would leak the traps)                                                                                        |
| `examples/analysis-prompt.md`        | docs (bkit-side)        | the analysis prompt: what it reads, the fixed score rubric, the ideal baseline, its non-gating status, the report path                                                                                                                                                                                            | be copied into the run repo (it names the ideal and the traps)                                                                               |
| `scripts/example/new-run.mjs`        | runner (bkit-side)      | idempotent bootstrap (incl. half-seeded repair); per-run reset of `example/` with pre-delete assertion + post-delete verification; `pnpm install`; always-latest install + `--claude --tracker=github`; read-backs; push; issue; per-transition `[bkit-example]` lines; the only path that deletes the app folder | gate anything; widen the reset path beyond `example/`; touch `.bkit/`, `docs/` or the root harness; capture the screenshot                   |
| root `package.json`                  | durable harness         | the gate/merge contract names, the gate stubs, the `bkit` block, the version read, the pinned Node form pair                                                                                                                                                                                                      | be reset                                                                                                                                     |
| `.github/workflows/bkit-ci.yml`      | durable gate            | exposing `bkit-tests-check` present + green at PR head; every-push tests (`cd example && node --test`) + privacy scan; PR-only sentinel, executed-count (recorded), classic-script (recorded) and screenshot steps; literal `main`/`dev` triggers; pinned + recorded Node version                                 | adopt the full copy-and-own template; reintroduce `[skip ci]`; run the PR-only steps on a push; gate on the recorded observations            |
| the built app's pure function        | fixture output (agents) | "which boxes are lit, which arrows are active, what each counter reads"                                                                                                                                                                                                                                           | touch the DOM                                                                                                                                |
| the built app's painter              | fixture output (agents) | paints the pure function's return only                                                                                                                                                                                                                                                                            | hold logic                                                                                                                                   |
| `.bkit/stats.jsonl` / `status.jsonl` | measurement             | wall time, counters, per-run deltas; accumulate across runs via union merge                                                                                                                                                                                                                                       | be consulted by any gate; be reset                                                                                                           |
| run analysis report                  | measurement (analysis)  | the score, rubric breakdown, prompt revision and recorded observations for one run; accumulates under `docs/`                                                                                                                                                                                                     | be consulted by any gate; be read as a quality verdict on bkit (#232)                                                                        |
| `tests/example-run.bats`             | verification            | the runner's preflight, reset-scope and gate-chain assertion paths, over the `tests/fixtures/gh/bin/gh` stub (extended for `gh auth status`); bootstrap-verify stays on the live canary                                                                                                                           | exercise `gh repo create` / `gh repo view` (the stub exits 1 on non-`api` argv) or `bkit runs gate --repo … --pr …` (it mis-resolves the PR) |

**Flow — bootstrap (once, idempotent)**

1. WHEN run → preflight `gh auth status` / Node ≥ the pinned LTS / pnpm; any failure stops before mutating anything, named under `[bkit-example]`.
2. WHEN the repo does **not** exist → create `cbartens/bkit-example` public; seed `main` with the canonical fixture; create and push `dev` with the root harness (incl. `pnpm-lock.yaml`) + the fixture in `example/`; one `[bkit-example]` line per transition (repo-created, fixture-copied, dev-pushed); print the URL.
3. WHEN it **exists** → verify mode: assert `main` still holds the fixture (sentinel included) and the root harness matches source; report and repair drift (re-render `bkit-ci.yml`, re-publish the fixture); never create or delete the repo.
4. WHEN `gh repo create` succeeded but seeding failed → THEN re-running `--bootstrap` enters verify-mode and finishes the seed; the failure output names the half-seeded repo so the state is attributable to a step.

**Flow — run start (the runner, per run)**

1. WHEN run → preflight: fixture directory exists **and** the sentinel is present in the fixture `index.html` (a renamed fixture otherwise commits a pure deletion of the app); `main` still carries the fixture (the run reads its start state from `main`); `git status --porcelain` empty and `dev == origin/dev` (a stale clone reintroduces the ledger-conflict mode); `gh auth` / Node ≥ pinned / pnpm.
2. THEN fetch latest; on `dev`, delete the tracked files under `example/` and re-create them from the fixture, **asserting the resolved path is inside `example/`** before deleting and **asserting every removed path resolved inside `example/`** after — one commit, no `[skip ci]` (KN-11).
3. THEN `pnpm install` (committed lockfile) → `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github`; read `bkit.issueTracker` back and stop unless it is `github`; read the version from `.bkit-version` via its JSON schema (`pinnedVersion`, KN-9); assert every script the seeded `bkit:gate:*` chain calls resolves; commit any install churn.
4. THEN push the reset commit; file `FEATURE-REQUEST.md` as the issue (runId = issue #); print the start command.
5. WHEN any step after 2 fails → THEN the failure output names exactly what state `dev` was left in, so recovery is mechanical (re-run: the reset is idempotent from any `dev` state).

**Flow — demo (one run)**

1. WHEN the maintainer starts the pipeline with the filed issue → design's worktree setup mints `feat/{FID}` off `origin/dev` → design (agents) → **hard stop for sign-off**.
2. THEN plan → **hard stop for sign-off**.
3. THEN build: agents write `example/index.html`, the logic file and its `node --test` tests inside `example/`; the four traps are caught only if review actually catches them (recorded by the analysis, never gated).
4. THEN build Step 14 runs the seeded `bkit:gate:static-unit` chain; the PR opens; CI runs `cd example && node --test` on every push and privacy-scans the diff; `bkit-tests-check` goes green, and on the PR the sentinel-gone step must pass while the executed-count and classic-script steps record their observations.
5. WHEN the maintainer runs `/bkit-ship` → merge gate checks the capstone at head (invoked from inside the run repo) → squash-merge into `dev`. A reset push to `dev` runs the tests and privacy steps only. Production stays their call.
6. WHEN a trap is missed → `node --test` fails → the debug loop diagnoses, fixes and retries within its attempt budget.

**Flow — benchmark (N runs, no new tooling)**

1. WHEN the maintainer repeats the run N times → N reset commits on `dev`, each starting from the same fixture; the ledgers accumulate at the root, untouched by any reset.
2. WHEN each run ends → CI has captured and uploaded the screenshot at PR head as a per-run build artefact (`continue-on-error`; a failed capture warns loudly); no harvest step exists because there is no teardown.
3. THEN read the middle wall time and counters directly from `dev:.bkit/stats.jsonl`, grouped by `bkitVersion` and run-scoped by the run marker (never `parentSha`), plus each run's report score, and record them in the README's median table. No in-harness folding, no record schema; the raw rows stay the source of truth.
4. THEN count attempted runs from the reset commits and completed runs from `outcome` rows (a run dying before design is visible), so per-version failure rates are computable.

**Flow — analysis (after every run stops, completed or aborted)**

1. WHEN the run stops → THEN the maintainer runs `examples/analysis-prompt.md` in an agent session against a checkout of the run repo, parameterised by the run's issue # / PR #.
2. THEN the prompt reads: that run's `docs/plans/…/logs/{FID}/status.jsonl` (phase timeline, steps, attempts), `.bkit/stats.jsonl` rows in the run's window (`outcome` / `counter` / `compliance`), the filed issue and its PR (body, diff, review comments), the `bkit-tests-check` step conclusions (tests, executed count, sentinel, classic-script, privacy, screenshot), the screenshot artefact and the built `example/index.html` + logic + tests.
3. THEN it scores against the rubric in the prompt: `completion` (the only binary), `test validation` (executed count ≥ 1 and green), `trap detection` (0-4 caught), `loop economy` (debug attempts, review iterations, corrective commits), `divergence from ideal` (phase sequence, added deferrals/failures, `planSource`), `deliverable integrity` (sentinel gone, classic-script form, screenshot shows the page), and `cost proxy` (wall time + counters vs the version cohort) — each dimension plus an overall score against the fixed ideal baseline.
4. THEN the report lands at `docs/plans/{YYYYMM}/logs/{FID}/analysis-run{N}.md` in the **run repo**, carrying the score, the per-dimension breakdown, the prompt revision and the raw observations; it is committed with a docs-only commit (no `[skip ci]`, so the every-push privacy scan covers it).
5. WHEN the run aborted → THEN the same prompt runs against whatever artefacts exist and says so in the report; the report is never a gate and never blocks a re-run.

**Flow — the built app (what the agents produce)**

1. `data.js` supplies the fixed skeleton; the pure function maps "position in the run" → `{ litBoxes, activeArrows, counters }`.
2. `index.html` holds the page and loads the logic and data with ordinary `<script src>` tags (never `type="module"`), so double-clicking it works off `file://`.
3. The painter renders that return, and honours reduced motion with a step-by-step static view and full keyboard operability.
4. `cd example && node --test` requires the logic file directly, using the environment guard (export when `module` exists, attach a global otherwise), so one file serves the browser and the test runner.

## Decisions

| Decided                                                                                                                                                                                                                                                                                                                                                                                                         | Alternatives                                                                                                                                                                      | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One **persistent public** repo, the app in a constant subfolder, per-run folder reset (supersedes the throwaway-private-repo model of v3)                                                                                                                                                                                                                                                                       | Fresh private throwaway repo per run (v3)                                                                                                                                         | Binding decision: the repo always shows the same example, history is the experiment history. Deletes the retention sweep, the per-repo Actions-minutes risk and the `gh repo delete` scope. A public repo also buys zero Actions minutes and makes the evidence public at the same time.                                                                                                                                                                                                                                                                                                                                                |
| Reset scope = **`example/` only**; root harness + `.bkit/` + `docs/` are durable and never reset; the reset set and the fixture set are the same set                                                                                                                                                                                                                                                            | Reset the whole run workspace (root minus `.bkit/`)                                                                                                                               | The delete is the one destructive op; scoping it to a real directory (not "root content minus `.bkit/`") makes the boundary explicit and guardable. The durable root is what lets results accumulate where the reset can never reach them.                                                                                                                                                                                                                                                                                                                                                                                              |
| Reset lands as **ONE commit direct on `dev`** before the pipeline starts; `feat/{FID}` is minted by bkit off `origin/dev` (spike C1)                                                                                                                                                                                                                                                                            | Reset on the run's `feat/*` branch (first brainstorm's literal wording); cut from `main`                                                                                          | The feat branch does not exist until design's worktree setup mints it — pre-cutting couples the reset to unverified worktree-adoption behaviour and to issue-number sequencing. Feat-from-`main` makes `.bkit/stats.jsonl` and the ledgers conflict from run 2 (append-at-EOF, same hunk); union merge is magic the ship conflict-resolve path trips on anyway. Linear `dev` history removes the class.                                                                                                                                                                                                                                 |
| `main` = canonical fixture (the reproducible start); `dev` = integration (PR base); reset is its own commit                                                                                                                                                                                                                                                                                                     | Single-branch; reset on `dev` without a fixture branch                                                                                                                            | Ship requires `PR_BASE == dev` and mints `feat/{FID}`; the fixture on `main` is the browsable "what a run starts from". `main` holds only the app fixture so `main` and the reset source coincide, avoiding the "fixture set ≠ reset set" split.                                                                                                                                                                                                                                                                                                                                                                                        |
| Results = the repo's own **tracked `.bkit/stats.jsonl`**, accumulating across runs (union merge); read raw, grouped by `bkitVersion` and run-scoped by the **run marker** (reset commit / filed issue #), **never** by `parentSha`; **no** separate store, **no** report code                                                                                                                                   | A `results` branch; a per-run `runs/<id>/` folder; a `benchmark.mjs`; a CI summary job                                                                                            | The rows already exist and carry `bkitVersion`; union merge is already installed. `parentSha` is captured per workflow step at step start and is forensic (`ledgers/status.ts:14-16`), so it cannot scope a cycle — the reset commit can and is already written (review-1 CRITICAL 1). A new store or a report script is the record-schema drift surface the risk lens warns about (YAGNI), and contradicts the binding "reuse `.bkit/stats.jsonl`; no new format".                                                                                                                                                                     |
| Run marker = the **reset commit message** (`reset run {N} (bkit {x.y.z})`), not a ledger row, and the same marker is the run-scope anchor                                                                                                                                                                                                                                                                       | A `kind:"run"` row; a `counter` row from the runner                                                                                                                               | `kind` is a closed enum (`.bkit/jsonl.md`) with no `run` member, and the writers table allows no runner-written kind; a fabricated kind fails the envelope gate. `git log --grep` over the reset commits counts attempted runs per version and needs no schema change, and the ship row's `prNumber` + the serial run window make the four `outcome` rows of one cycle scopable.                                                                                                                                                                                                                                                        |
| The only binary is **run completion**: design → plan → build → ship with the capstone present and green at the merged PR. Capstone **gating** steps = the tests step (`cd example && node --test`) on every push and the privacy scan on every push; the sentinel-gone check is **PR-only and gating** (the deliverable exists); executed count and classic-script form are **recorded, never gating**          | A quality-verdict gate (the v1 framing); gating on the executed count or the classic-script form; a fixture-shipped sentinel test inside `node --test`; a whole-file hash compare | Rev-notes §1: the example is not wired into bkit's CI, so pass/fail is liveness, not a quality verdict — review-2 CRITICAL 2 and 4 are thereby demoted to recorded observations. The sentinel stays gating because it is the completion criterion for the deliverable (a page that was never built), whereas the executed count and the script form are quality observations. Binding: "no test subject pre-written beyond the placeholder", so the fixture cannot ship a sentinel test; a sentinel survives path/formatter churn a whole-file hash would false-fail.                                                                   |
| Privacy = a CI step on **every push** scanning that push's diff for secret **and** absolute-path shapes, plus the runner's pre-push scan of the reset diff, plus a documented manual review before the first publish                                                                                                                                                                                            | A PR-only CI step (v1); a dedicated job after push; rely on GitHub push protection alone                                                                                          | A public repo is public the moment it is pushed. The v1 guarantee did not hold: the leak-prone artefacts (`docs/` logs, `status.jsonl`, the analysis report) are pushed by the **workflows** and by the report commit, not by the runner, so a PR-only scan fires after exposure (review-2 CRITICAL 3). The every-push step must not depend on the built page, so the reset push stays green. The scan covers `/Users/`, `/home/` and other home-path shapes — run logs and `status.jsonl` leak them even with zero secrets — and the worktree copy of `.env` / `.env.local` (C1 evidence), which the fixture `.gitignore` also covers. |
| **Sentinel is PR-only** (`if: github.event_name == 'pull_request'`); **privacy runs on every push**; a reset push to `dev` runs the tests + privacy steps only                                                                                                                                                                                                                                                  | Runner post-merge (privacy already public then); every step PR-only                                                                                                               | PR head is the only point where the built page exists pre-merge and the sentinel is meaningful; an unconditional sentinel step would red `dev` on every run (the sentinel is present by definition at reset). Privacy is the opposite: exposure can happen on any push and the scan needs no built page, so it is unconditional — spike C7 shows the all-PR-only shape staying green on a reset push, and spike C6 the single job staying green at PR head.                                                                                                                                                                             |
| Always install the **latest** bkit (`pnpm exec bkit upgrade --latest`) and **record the version with each run**; analysis groups by version (supersedes v3's exact pin + canary bump)                                                                                                                                                                                                                           | Pin an exact version and bump after a canary                                                                                                                                      | Binding override. Grouping by `bkitVersion` is what keeps a sweep straddling a release comparable; always-latest also turns every run into an upgrade-path canary, which the setup-time assertion battery makes loud rather than silent. The operator runbook for a release that blocks the sweep lives in `examples/README.md` (review-2 OPTIONAL).                                                                                                                                                                                                                                                                                    |
| Screenshot = captured by the **run repo's CI** at PR head and uploaded as a per-run build artefact (`continue-on-error`), **never** gating; a failed capture warns loudly                                                                                                                                                                                                                                       | A runner-captured post-merge file committed under `docs/` (v1); a browser gate                                                                                                    | Rev-notes §3 requires CI capture as a build artefact, and it removes both the leak-prone committed artefact and the duplicate mechanism (the runner no longer captures). Graders must never fail a run (#232): the capture is non-gating and logs loudly when it fails. CI-only browser dependency — the app still keeps no packages.                                                                                                                                                                                                                                                                                                   |
| Bootstrap = an idempotent `--bootstrap` mode of the same runner (create once; exists → verify and repair, including a half-seeded state)                                                                                                                                                                                                                                                                        | A documented `gh repo create` one-liner                                                                                                                                           | Bootstrap is the once-per-repo-life step executed by the person with the least context; verify-mode doubles as the drift-repair path for the root harness that resets never refresh, and as the repair path for a half-seeded public repo. A README one-liner is the fallback if bootstrap is genuinely one-off.                                                                                                                                                                                                                                                                                                                        |
| Capstone CI = a hand-written single-job `.github/workflows/bkit-ci.yml`: tests + privacy on **every push**, PR-only sentinel (gating), executed-count + classic-script (recorded, `continue-on-error`), screenshot + upload (non-gating); literal `[main, dev]` triggers; `if: ${{ !cancelled() }}`; Node pinned **and recorded**                                                                               | Adopt the ~1065-line copy-and-own template; rename the capstone via `bkit.capstoneJob`; a multi-job workflow                                                                      | Ship's merge gate needs only the capstone present and green at head. The template is copy-and-own and its gate semantics evolve with bkit — the worst drift surface. One job avoids `needs:`-wiring the recorded observations to the capstone, and the recorded steps are `continue-on-error` so a record can never gate. Pinning/recording Node closes an unrecorded benchmark variable.                                                                                                                                                                                                                                               |
| Test invocation = `cd example && node --test`, and the **Node pin is stated with it** (Node 24 LTS, recorded per run); both `node --test example` and the bound glob are rejected                                                                                                                                                                                                                               | `node --test example` (v1); the glob `node --test "example/**/*.test.js"`; bare root `node --test`                                                                                | Spike C1 `DISPROVEN`: the directory positional is `MODULE_NOT_FOUND` on Node ≥ 22 and the glob is passed through as a literal path on Node 20, so the form and the pin are **one coupled decision** — which neither document stated. `cd example && node --test` is `rc=0` on 20/22/24 with tests present and with zero tests, and `rc=1` on a failing test (spike C2), so the pin stays a free choice. Bare root `node --test` is recursive (the v1 rationale was inverted) but was not probed on 20, so it is not portable.                                                                                                           |
| Executed-test count and classic-script form are **PR-only recorded observations** (`continue-on-error`), never gating; `node --test` exits 0 over zero tests and the fixture ships none, so an unconditional count assertion would red every reset push                                                                                                                                                         | Gate on the executed count (review-2 CRITICAL 2 read literally); assert a file hash                                                                                               | Rev-notes §1 demotes both from "fails the run" to recorded signals; the spike adds that the reset state has zero tests by construction, so the assertion must be PR-only (spike C4, C7). The TAP count is written to a file because `out=$(…)` under `bash -e` discards the capture. Both signals feed the analysis, which is where a vacuous green and a blank page are caught.                                                                                                                                                                                                                                                        |
| Gate chain satisfied by pre-declared Node-stdlib one-liner stubs (honest no-ops echoing what they skip)                                                                                                                                                                                                                                                                                                         | Full real toolchain (prettier, vale, slop-scan, actionlint, husky); weaken or skip gates                                                                                          | Weakening gates is prohibited and would misrepresent the pipeline; the real toolchain multiplies flake and cost against a benchmark that must usually pass. Seeded chains are add-if-missing, so pre-declared names survive install.                                                                                                                                                                                                                                                                                                                                                                                                    |
| Runner = repo-side `scripts/example/new-run.mjs`, bats-tested over the `gh` stub (**narrowed** to preflight / reset-scope / gate-chain); preflight drops `delete_repo`, adds fixture-integrity + `main`-drift + `dev`-sync assertions; pre-delete path assertion **and** post-delete verification; `pnpm install`; `pnpm exec bkit …`; one `[bkit-example]` line per transition                                 | CI-mediated reset (a `workflow_dispatch`); a documented runbook                                                                                                                   | Runs are human-in-loop regardless (hard stops), so CI automation buys nothing per run and adds token/trigger semantics and two-branch reasoning at 3am; the runbook re-opens the tracker-`none` silent failure v3 ranked highest. One tested script keeps assertions at setup time, pre-mutation; post-delete verification covers the one destructive op from the other side (review-2 OPTIONAL). The stub covers four `gh api` shapes and exits non-zero on non-`api` argv, so bootstrap-verify stays on the live canary (review-1 OPTIONAL; spike C9).                                                                                |
| Serial-run topology is an invariant: documented in `examples/README.md` **and** guarded at run preflight (the runner refuses when `origin/dev` carries a reset commit whose PR has not merged, with an explicit `--force-run` override)                                                                                                                                                                         | Parallel benchmark runs; a documented invariant only; a lock file or a remote lock                                                                                                | Append-at-EOF ledgers conflict on every file; provider rate limits; hard stops already serialise by human. Naming the mechanics stops a future contributor "speeding up the sweep" into the failure, and the cheap guard turns the convention into a boundary using state the preflight already reads (review-2 OPTIONAL).                                                                                                                                                                                                                                                                                                              |
| Append-only / **never-prune** rule for the ledgers, `docs/plans` and the analysis reports (history = experiment history)                                                                                                                                                                                                                                                                                        | A periodic tidy-up                                                                                                                                                                | A housekeeping delete of old runs' artefacts destroys benchmark evidence; stated as a rule so it does not die by kindness. The screenshot is a CI build artefact, so it sits outside this surface and expires with GitHub artefact retention — the run URL and the report are the durable references.                                                                                                                                                                                                                                                                                                                                   |
| `examples/README.md` contract table (gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, sentinel, reset procedure, run-marker, harvest/median read path, version-grouping rule, serial invariant, never-prune rule, privacy, `[skip ci]` recovery line, breaking-release runbook) plus `examples/analysis-prompt.md`, both registered in `.agents/docs.md`, plus architecture ADR rows | No docs; rely on the feature-request prose                                                                                                                                        | Non-obvious contracts would otherwise live in one head, and a well-meaning "simplify the example" edit would remove the benchmark's teeth with nothing failing loudly. Both docs must stay **outside** the run repo (copying them leaks the traps and the ideal). Architecture calls get `docs/decisions.jsonl` rows per `.agents/rules.md` § Major changes.                                                                                                                                                                                                                                                                            |
| AI analysis = a **bkit-side prompt** (`examples/analysis-prompt.md`, never published) run by the maintainer after the run stops, against a checkout of the run repo; it reads the run's artefacts and writes a **scored report** committed beside that run's `status.jsonl`; non-gating, prompt revision recorded with the score                                                                                | A CI job that calls an AI; a new `analyze-run.mjs`; a `counter` row for the score                                                                                                 | Rev-notes §4 puts the scored report in scope. A CI job cannot run reliably after an **aborted** run and would put an AI in the merge path (#232); a script would add tooling for something only a host agent can do. The report is the record — no new ledger kind, no schema change — and the prompt revision travels with the score so cohorts stay comparable.                                                                                                                                                                                                                                                                       |
| Root harness ships a committed **`pnpm-lock.yaml`**, published by bootstrap from the fixture's `harness/`, and the runner runs `pnpm install` before upgrading                                                                                                                                                                                                                                                  | Install nothing; let `bkit install` resolve                                                                                                                                       | `bkit install` fails without a committed lockfile (spike C1, prior cycle); naming the install step keeps the always-latest upgrade reproducible (review-1 OPTIONAL).                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| The fixture and runner are registered in bkit's **own** gates: fixture prettier-formatted, `examples/bkit-explainer/**` added to `slop-scan.config.json` `ignores`, runner left scanned and slop-clean, the two `examples/*.md` docs written to the prose rules, `pnpm bkit:gate:static` green before landing                                                                                                   | Let bkit's own CI red on the new paths; add a blanket ignore for both paths; register only a per-rule opt-out                                                                     | `examples/**` and `scripts/example/**` land inside `prettier --check .` and `bkit ci slop`, so the new files can red bkit's own CI (review-1 CRITICAL 2). The ignore is confined to the deliberately near-empty fixture data; the runner is real code and stays under the gate, and the docs are prose. The config change is surfaced here and in `docs/decisions.jsonl`, per § Major changes.                                                                                                                                                                                                                                          |
| The nine "later ideas" from #504 and the tracker-`none` install-advisory idea are **out of scope for this cycle**, already recorded as deferral rows (`504-run-replay-viewer` … `504-install-advisory-when-tracker-is-none`); **this cycle adds none**                                                                                                                                                          | Fold any of them into this cycle                                                                                                                                                  | The issue keeps one simple feature on purpose: every addition makes a run longer and more expensive, the benchmark needs something that usually passes, and the demo must be affordable for a new user.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Drop WS-6 and bkit's CI smoke job entirely (no source-side guard)                                                                                                                                                                                                                                                                                                                                               | Keep a smoke job in bkit's own CI                                                                                                                                                 | Binding: ad hoc runs only, do not add a smoke job now; the pass/fail signal stays usable if it is wired in later. The CI-edit human-confirmation gate goes with it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Approaches Considered

| Approach                                                                                                                                                                                     | Lens             | Verdict    | Why                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Folder-scoped reset; results accumulate beside it** (`example/` reset from the fixture on a run branch; `.bkit/stats.jsonl` at root; read raw grouped by version; no benchmark script) | Pragmatic        | `MERGED`   | Adopted wholesale: folder-scoped reset, results outside the reset surface, reuse of `.bkit/stats.jsonl`, raw-row read grouped by `bkitVersion`, no report script, one repo for demo and benchmark. Its reset-on-`feat/*` is dropped for the risk lens's reset-on-`dev`. |
| **B — Reset implicit by cutting from `main`; union carries results**                                                                                                                         | Pragmatic        | `REJECTED` | Trades a guardable delete for an unenforced "`main` stays pristine" invariant; every tracked file `main` and `dev` diverged on silently reverts on merge; the reset is only as good as `main` staying clean, which nothing enforces.                                    |
| **C — Reset in a scratch clone**                                                                                                                                                             | Pragmatic        | `REJECTED` | Duplicates the worktree isolation the workflows already have, adds a clone lifecycle and a second home for the fixture, and invites split-brain edits; YAGNI unless checkout contention is observed.                                                                    |
| **A — Fixture on `main`, evidence in `dev` history (tightened)**                                                                                                                             | Optimal-tradeoff | `KEPT`     | The base: lowest complexity, near-zero migration from v3, and the read path and format already exist. Folded in the risk lens's reset-on-`dev` correction.                                                                                                              |
| **B — Evidence on its own append-only `results` branch**                                                                                                                                     | Optimal-tradeoff | `REJECTED` | A second ref to bootstrap and protect; a force-push or stray reset destroys everything at once; and it reads as the "separate aggregate store" the binding rejects (same rows, different ref).                                                                          |
| **C — App in a dedicated folder, root as durable substrate**                                                                                                                                 | Optimal-tradeoff | `MERGED`   | Its folder boundary is adopted — it makes "the dedicated folder" a real directory, not a description of root content. Its own "fixture set ≠ reset set" risk is neutralised by making `main` hold only the app fixture, so the two sets coincide.                       |
| **A — Single writer, linear history (runner-owned reset direct on `dev`)**                                                                                                                   | Risk premortem   | `KEPT`     | The only lens grounded in the installed payload's verified contracts (worktree mint off `origin/dev`, single-job CI satisfies the merge gate, tracker default `none`, `bkit install` needs a module flag).                                                              |
| **B — Repo as its own machine (CI-mediated `workflow_dispatch` reset)**                                                                                                                      | Risk premortem   | `REJECTED` | Runs are human-in-loop regardless, so per-run automation buys nothing; adds `GITHUB_TOKEN`/trigger semantics and a two-branch (fix the workflow on `main`, it mutates `dev`) reasoning cost at 3am.                                                                     |
| **C — Human as the assertion engine (documented runbook)**                                                                                                                                   | Risk premortem   | `REJECTED` | Re-opens the tracker-`none` silent failure v3 ranked highest (one forgotten `--tracker=github` narrates a pipeline that never touched the tracker); survives only because runs are serial and rare, which is not a design property.                                     |

**Conflicts resolved across lenses (pick stronger, justify):**

- **Where the reset lands:** first brainstorm said the run's `feat/*` branch; the risk lens said `dev`. **`dev` wins** — `feat/{FID}` does not exist until design's worktree setup mints it off `origin/dev` (spike C1), so pre-cutting couples the reset to unverified worktree-adoption behaviour; a reset on the feat branch starting from `main` also reintroduces the append-at-EOF ledger conflict.
- **What "the dedicated folder" is:** the optimal-tradeoff lens offered "root minus `.bkit/`" and "app in a subfolder". **Subfolder wins** — a real directory is a guardable reset boundary, and it keeps the durable root (and the accumulating ledgers) out of the delete's reach.
- **Where the reset reads the fixture from:** bkit's `examples/` (working tree) vs the repo's `main`. **`main` wins** — reading the pushed fixture keeps runs deterministic and free of uncommitted local edits; `examples/bkit-explainer/` is the authoring source bootstrap publishes.
- **Run marker:** a `kind:"run"` ledger row vs the reset commit. **The commit wins** — `kind` is a closed enum and the writers table allows no runner-written kind, so the marker is `git log --grep` over reset commits.

**Settled by spike evidence (v2):**

- **Test invocation + Node pin are one decision, not two (spike C1 `DISPROVEN`, C2 `SETTLED`).** The corrected glob the revision notes bind does not run on Node 20 LTS, and the v1 form does not run on Node ≥ 22; the portable form `cd example && node --test` holds on 20/22/24. Adopted: state the pin and the form as one pair in the fixture `scripts.test`, the capstone `tests` step and the contract table.
- **Executed-count assertion is PR-only (spike C4), and recorded rather than gating (rev-notes §1).** The reset state has zero tests by construction, so an unconditional assertion reds `dev` on every run.
- **The privacy scan is every-push, not PR-only (review-2 CRITICAL 3).** The probed shape (spike C6/C7) had privacy inside the PR-only set; moving it to every push is a small, bounded delta on the probed workflow, re-verified on the first live PR.

**Risk-premortem mitigations layered onto the kept approach (additive, not a separate approach):** pre-mutation assertions (fixture present with its sentinel; `main` still carries the fixture; `git status --porcelain` empty and `dev == origin/dev`; `gh auth` / Node ≥ the pinned LTS / pnpm); post-delete verification that every removed path resolved under `example/`; post-install read-backs (tracker == `github`; version via `.bkit-version` JSON schema, KN-9; every seeded `bkit:gate:*` script resolves); `pnpm install` before the upgrade; `--bootstrap` verify-and-repair of a half-seeded repo; the reset commit message as the run marker (no skip markers, KN-11); the PR-only gating sentinel with recorded executed-count and classic-script observations; the every-push privacy scan (secret **and** home-path shapes); serial topology documented as an invariant plus the preflight run-in-flight guard (with `--force-run`); the never-prune rule; the `examples/README.md` contract table; one `[bkit-example]` line per transition; the runner's bats test; the non-gating analysis report.

## Trade-offs Accepted

**Folder-scoped reset over a durable root — chosen over resetting the whole workspace.**

- Gain: the destructive op cannot reach the accumulated history or the harness; the reset set equals the fixture set; the boundary is a directory, not a description.
- Sacrifice: the run workspace now spans the root (harness, ledgers) and the folder (app), so two seams must stay honest. Accepted because that is exactly the boundary the issue's "keep it simple" and the risk lens's "boundaries over remembered seams" both ask for.

**Persistent public repo — chosen over per-run private throwaway repos.**

- Gain: history is the experiment history, evidence is public and durable, the retention sweep and the `delete_repo` scope disappear, and a public repo buys zero Actions minutes.
- Sacrifice: the demo audience shifts (an external user cannot "run it once" — the honest paths are watching the public history or self-bootstrapping a copy), and every run artefact is public, so privacy is load-bearing rather than optional. Accepted as an explicit risk with the diff scan plus the pre-first-publish manual review.

**Reset direct on `dev`, linear history — chosen over resetting on the run branch.**

- Gain: the reset happens before the pipeline mints `feat/{FID}`, on the C1-verified path; `dev` history reads as the experiment index; ledger appends stay linear so no conflict path engages.
- Sacrifice: the runner writes `dev` directly, so `dev` must not be branch-protected (or must carry an explicit bypass), and `dev`'s badge goes green on every reset push rather than showing the run. Accepted; the PR-only sentinel keeps the reset push green while the PR head still carries the real checks.

**Always-latest + version grouping — chosen over an exact pin.**

- Gain: every run exercises bkit's upgrade path (a canary the pinned model never had), and grouping by the recorded `bkitVersion` keeps a release-straddling sweep comparable.
- Sacrifice: a breaking release blocks the sweep at reset, and "one sweep" is never one cohort across a release. Accepted because the assertion battery makes the block loud and the version column makes the split honest.

**Results in the repo's own ledger, read raw at report time — chosen over an aggregate store or benchmark tooling.**

- Gain: zero new tooling, raw rows stay the source of truth, and a ledger-shape change is contained to report time; no separate ref or store to protect.
- Sacrifice: running N times and computing a median is human labour, and the median/attempt accounting lives in prose; `.bkit/stats.jsonl` grows unbounded (bkit warns at 5000 rows, no rollup). Accepted because a run is human-in-loop regardless, so tooling cannot remove the human cost, only add a system to maintain.

**Sentinel gating at PR head, observations recorded there too — chosen over post-merge or all-PR-only checks.**

- Gain: the built page exists and the diff is reviewable at exactly the point the sentinel and the observations run; reset pushes keep `dev` green; the privacy scan sits before the merge it should block and, being every-push, catches a leaky pipeline commit at the push that creates it rather than after exposure.
- Sacrifice: the merge gate depends on a PR-time step inside the capstone job, so the capstone stays a single job — `needs:`-wiring extra jobs would put recorded observations on the merge path — and the every-push privacy step must compute the diff range per event, a small delta on the probed workflow shape. Accepted because one job keeps pass/fail legible and every recorded step is `continue-on-error`.

**Screenshot captured and uploaded by CI; cost unmeasured — chosen over a browser gate and a usage-tracking source.**

- Gain: an artefact of the built page every run, produced by CI (rev-notes §3) with no committed binary, no runner-side browser and no second mechanism; no flaky grader in the pass/fail path; no substrate built against a cost spec that does not exist.
- Sacrifice: a broken painter can still ship green — the screenshot is ungraded, so the watching user and the analysis report are the check — the artefact expires with GitHub retention instead of joining the never-pruned public evidence, and "cheaper" cannot be claimed today: only wall time, counters and the analysis score are comparable. Accepted per #232 and the absence of any token/cost source.

**Liveness-only pass/fail — chosen over v1's quality-verdict gate.**

- Gain: matches how the example is actually used (ad hoc, human-in-loop, not wired into bkit's CI); a completed run produces data even when the agents performed poorly, and the interesting output — the analysis score — is never traded away by a red gate.
- Sacrifice: a green run can still be a bad run (zero tests executed, a blank page), so "green" must never be read as "validated"; the recorded observations and the report carry that burden. Accepted per rev-notes §1, with both demoted signals **kept as recorded observations** rather than dropped.

**Analysis by a host-invoked prompt — chosen over an in-CI AI job or new tooling.**

- Gain: it runs after any stop, including an abort; no AI sits in the merge path (#232); the report lands as durable public evidence beside the run's own logs; the prompt revision travels with the score, so cohorts stay comparable.
- Sacrifice: the analysis is human-triggered and AI-scored, so it is non-deterministic and its cadence depends on the maintainer — N runs mean N analysis invocations. Accepted because a run is human-in-loop regardless and no deterministic scorer exists.

## Risks & Open Questions

**Risks**

- **Reset scope is the one destructive op.** A widened path (`rm` at root or `.bkit/`) destroys the accumulated benchmark history; a renamed fixture commits a pure deletion of the app. Mitigated by scoping the delete to `example/`, asserting the resolved path before deleting **and** verifying every removed path after, plus asserting the fixture (sentinel present) before mutating.
- **Always-latest puts bkit's upgrade path on the benchmark's critical path.** A breaking release blocks the sweep **at reset** — loud (the assertion battery fires), but the sweep is down until bkit ships a fix, and cohorts split across the release. Grouping saves comparability; the pin model never exercised this path. The operator runbook for "a release blocked me" lives in the contract table (review-2 OPTIONAL).
- **Public makes privacy load-bearing — and the window is every push.** Run artefacts leak absolute home paths even with zero secrets; worktree setup copies `.env` / `.env.local` into worktrees. The every-push diff scan (secret + path shapes) and the pre-first-publish manual review are the floor; the runner's pre-push scan covers the reset diff only, so the workflow-side scan is what actually covers the leak-prone commits. GitHub push protection catches only known secret shapes.
- **The double-click demo depends on a contract one edit from silence, and the signal is recorded, not gating.** Adding `"type": "module"` (fixture `package.json`) or a `type="module"` script tag blanks the off-disk page while `node --test` stays green. The plain-script rule is stated in the feature request, the fixture and the contract table; the PR-only classic-script assertion (spike C5) records the result and the analysis report reads it — it never fails the run (rev-notes §1).
- **The root harness is never refreshed by resets.** `bkit-ci.yml`, the gate stubs and the capstone name drift from source; the magic string `bkit-tests-check` lives in both the harness `package.json` and the yaml. `--bootstrap` verify-mode is the repair path, and the run preflight checks `main` still carries the fixture.
- **Sentinel rot.** Editing the placeholder copy can drift the sentinel between fixture and check; the built page quoting the sentinel false-fails. Mitigated by a single definition of the string, a feature request that forbids quoting, and an unguessable value.
- **bkit's own gates over the new paths (review-1 CRITICAL 2).** `examples/**` and `scripts/example/**` fall inside `prettier --check .` and `bkit ci slop`; unregistered, landing the fixture reds bkit's CI. Mitigated by formatting the fixture, one `slop-scan` ignore entry for the fixture data, and `pnpm bkit:gate:static` green before landing. Residual: the ignore entry is a config decision that must be re-checked if the fixture later gains real code.
- **The probed workflow shape differs from the shipped one (spike).** The spike's final workflow had privacy inside the PR-only set; the design moves privacy to every push and adds an executed-count recorded step. Both are bounded (`continue-on-error`, no built-page dependency), but the first live PR is what re-confirms capstone presence and green (spike C6/C7 cover the neighbouring shapes).
- **Ledger growth and single-writer appends.** `.bkit/stats.jsonl` grows unbounded (5000-row warning, no rollup); overlapping runs conflict on every append-at-EOF ledger. Mitigated by a preflight run-in-flight guard plus the documented serial invariant; growth is accepted and stated.
- **Human hard stops bound automation.** Design and plan end awaiting a human, so N runs = N human sessions under every approach; scheduling and cost claims must price human time.
- **AI non-determinism (#232).** Run completion (the binary) is robust; "the reviewer caught the planted trap" and the analysis score are AI-influenced, recorded and never gated, and the demo must not promise a catch.
- **Failed runs leave clutter that must not be "helpfully" merged.** Unmerged red PRs and stale feat branches accumulate; the exclusion rule (medians over completed runs only) is written down so nobody merges a red PR to tidy up and poisons the dataset.
- **Node version is a recorded benchmark variable, now coupled to the invocation.** The GH image moves and `node --test` semantics shifted across 20/22/24 (spike C1); the capstone pins the version, records it per run, and uses the form that is portable across those three (`cd example && node --test`). The coupling is the risk: changing one without the other silently reds every run.
- **The end-to-end path is the largest untested assumption (spike C10 `BLOCKED`).** Every settled claim rests on a hand-built approximation of the run repo; whether the agents produce a `node --test`-green page, whether `/bkit-ship` merges under the real gate path, and whether the reset commit marker correlates with the `outcome` rows are all unverified by probes.
- **`bkit runs gate --repo <other-repo> --pr N` mis-resolves the PR (spike-discovered defect).** It reads the PR from the current checkout; from outside the run repo it gates an unrelated PR. The design's own paths are unaffected (`/bkit-ship` runs inside the run repo); the constraint is written into the bats scope so no future runner use adopts the pair. Handed to `docs/failures.jsonl` by the spike caller.
- **`main` mirror drift.** `main`'s fixture and bkit's `examples/bkit-explainer/` are two copies; only bootstrap re-syncs them. A stale `main` silently runs the wrong start state. Mitigated by the run preflight now asserting `main` still carries the fixture (sentinel included), so drift is caught at the next run rather than only at the next bootstrap (review-2 OPTIONAL).
- **Skeleton stability is real but not frozen.** Phase names, loop caps and hard-stop placement are the explainer's content; `data.js` slowly lies without a documented owner-check per release.

**Open Questions**

- **What does one full run cost?** No token/cost source exists today (`.bkit/stats.jsonl` has only `compliance`/`counter`/`outcome` rows); the likely source is #526 (per-workflow thread cost into `stats.jsonl`).
  - A: Defer entirely — record wall time and counters only, report cost as unmeasured.
  - B: Build a host-specific session-transcript reader now (one method per host).
  - C: Read host transcripts generically behind one new `cost` field.
  - **Recommended:** A — the source does not exist yet, and B/C build substrate for a spec that is not settled.
  - **Default if unanswered:** A.
- **Does the benchmark ship any tooling?**
  - A: No tooling — documented manual N-run + read raw rows + a README median table.
  - B: A `--runs N` flag on the existing runner.
  - C: A separate harness that loops runs and folds medians.
  - **Recommended:** A — a run is human-in-loop regardless, so tooling cannot remove the human cost and only adds a system to maintain.
  - **Default if unanswered:** A.
- **Where does the run marker live?** (The design picks the reset commit; confirming the alternative is worth reopening if benchmark tooling arrives.)
  - A: The reset commit message (`git log --grep`), no ledger row — envelope-clean.
  - B: A `counter` row written by the runner (`EXAMPLE_RUN_START`) — needs a writers-table exception.
  - C: A new `kind` in the envelope — needs a `.bkit/jsonl.md` enum change.
  - **Recommended:** A — no schema change, and the marker rides a commit the reset already writes.
  - **Default if unanswered:** A.
- **What does `main` hold — the app fixture only, or the full runnable start?**
  - A: The app fixture only (`example/` tree) — makes `main` and the reset source coincide.
  - B: The full start (root harness + `example/`) — most literally "the reproducible start", but re-introduces the fixture-set ≠ reset-set split.
  - **Recommended:** A — the reset set and the fixture set must be the same set, or the boundary is easy to get wrong.
  - **Default if unanswered:** A.
- **Which Node LTS is pinned, and how is the pin recorded?** (The form is portable across 20/22/24 — spike C2 — so this is now a free choice, not a constraint.)
  - A: Pin Node 24 (the LTS matching the local default) in the capstone, use `cd example && node --test`, and record it with each run (applied).
  - B: Pin Node 22 LTS instead — identical behaviour, so this is a preference, not a risk.
  - C: Pin Node 20 and keep the v1 `node --test example` form — works on 20 only and couples the design to the oldest LTS.
  - **Recommended:** A — the image moves, and an image change must not masquerade as a cohort difference; the pin and the form must move together (spike C1).
  - **Default if unanswered:** A.
- **Does the executed-count observation stay recorded, or become a gate once the demo is stable?** (Rev-notes §1 demotes it to a recorded signal; §2 asks that "green" mean "validated".)
  - A: Recorded forever (`continue-on-error`, PR-only), read by the analysis report — the only binary stays run completion (applied).
  - B: Flip it to a gating PR-only step once a few runs show the build reliably writes tests, so "green" means "validated" inside the run repo without changing the bkit-wide model.
  - C: Gate it now — contradicts rev-notes §1 and makes the first runs red until the agents reliably write tests.
  - **Recommended:** A now; B is the cheap upgrade if the recorded signal is ever ignored.
  - **Default if unanswered:** A.
- **How is the untested end-to-end path (spike C10 `BLOCKED`) de-risked before the first sweep?**
  - A: The first real run **is** the de-risking — the runner, the capstone and the read-back assertions are spike-tested in isolation, the run is cheap and loud, and its report is the record (binding: ad hoc runs only, no smoke job) (applied).
  - B: One throwaway dry run on a second repo (`cbartens/bkit-example-dry`) before the first real reset, accepting a second repo lifecycle and a `delete_repo`-free cleanup.
  - C: Wire a smoke job into bkit's own CI on every bkit change — prohibited by the binding decision.
  - **Recommended:** A — a dry run duplicates the whole boundary for one run's worth of information, and the framing makes a failed first run cheap to discard.
  - **Default if unanswered:** A.
- **How far does the anti-concurrency guard go?** (The serial invariant is documented; its cheap mechanical half is applied as a preflight refusal.)
  - A: Preflight refuses when `origin/dev` carries a reset commit whose PR has not merged, plus the documented serial invariant and an explicit `--force-run` override for a genuinely stuck run (applied).
  - B: A lock file or a dedicated git ref in the run repo instead — fails harder, but needs its own cleanup path when a run is abandoned.
  - C: A remote lock label/issue check — works across machines, most machinery.
  - **Recommended:** A — cheap, reuses state the preflight already reads, and the override keeps a stuck run recoverable.
  - **Default if unanswered:** A.
- **What happens when `feat/{FID}` already exists?** (Worktree-adoption behaviour when the branch pre-exists is UNVERIFIED.)
  - A: Treat as out of scope for this cycle — each run files a new issue, so `{FID}` is new; document the assumption.
  - B: Probe it in the next spike and harden the runner against it.
  - C: Have the runner refuse a run when `feat/{FID}` exists.
  - **Recommended:** A now, with B if a re-run of the same issue is ever wanted.
  - **Default if unanswered:** A.
- **Who re-checks `data.js` against the current skeleton, and when?**
  - A: The per-release canary run owner checks the phase list, loop caps and hard-stop placement.
  - B: A dedicated audit template per release.
  - C: Nobody; the pass/fail check covers code drift only.
  - **Recommended:** A — it rides a human-in-loop step that already exists, so it adds no new ceremony.
  - **Default if unanswered:** A.

## Suggested Workstreams

Nine workstreams at the design's own architectural seams (fixture · durable root · gate · runner · read path · analysis · docs · verification · own-gate registration). One home per file: `index.html`/`data.js`/`FEATURE-REQUEST.md` → WS-1; the non-workflow `harness/` sources → WS-2; `harness/bkit-ci.yml` → WS-3. Dependency shape is a DAG; WS-7 (contract docs) is the only sink.

### WS-1: Immutable fixture — `examples/bkit-explainer/` app start state

#### Scope

- `examples/bkit-explainer/index.html`: near-empty placeholder carrying the sentinel string (`BKIT-EXAMPLE-SENTINEL-<unguessable>`), defined **once**, written so it does not trip bkit's own `comments.placeholder-comments` pattern.
- `examples/bkit-explainer/data.js`: fixed content data (`phases`, `nodes` incl. `parallelGroup`, `edges` incl. review-back/failure-to-debug kinds, `counters.derivesFrom`, `handover`) under one fixed global, classic-script-loadable, never `.json`.
- `examples/bkit-explainer/FEATURE-REQUEST.md`: fixed pre-written request (content requirements, the four traps as plain requirements, fixed filenames, plain-`<script src>` / one-pure-function rules; forbids quoting the sentinel).
- The built-app contract the run's agents build against: pure function (`position → {litBoxes, activeArrows, counters}`), painter that only renders, `type`-absent dual-load environment guard, plain-script rule.
- The fixture → run-repo mapping and the "one home per file" rule; the app files (`index.html`, `data.js`) are exactly the reset set.
- Answer the two fixture-side open questions: `main` holds the app fixture only (applied); `data.js` skeleton stability is owner-checked per release (documented in WS-7).

#### Requires

[]

#### Rationale

The versioned start state is the DAG root — nothing can be verified until the fixture and its single-sourced sentinel exist. Data/inputs only; the traps and the sentinel are the fixture's exclusive concern, and the throwaway `data.js` skeleton is not buildable elsewhere.

### WS-2: Durable root harness sources — `examples/bkit-explainer/harness/` (non-workflow)

#### Scope

- `harness/package.json`: durable harness — `name`, `private`, absent `type`, `packageManager` + committed lockfile, `engines.node`, always-latest `devDependencies["@cbartens/bkit"]`, `scripts.test` (`cd example && node --test`), `typecheck`/`lint`/`format:check`/`lint:prose`/`slop:delta`/`build` stubs, and the `bkit` block (`issueTracker`/`capstoneJob`/`ciWorkflow`).
- Pre-declared Node-stdlib no-op gate stubs satisfying the seeded `bkit:gate:*` chain (honest no-ops echoing what they skip).
- `harness/pnpm-lock.yaml`; `harness/README.md` (main = fixture, dev = integration, reset, a pointer to the stats read path, never-prune); `harness/gitignore` (covers `.env`/`.env.local`).
- The gate/merge contract names the seeded chain and WS-3's workflow consume; the version read path (`.bkit-version` JSON schema, `pinnedVersion`).
- The `scripts.test` half of the coupled test-invocation × Node-pin decision.

#### Requires

[WS-1]

#### Rationale

The run repo's durable substrate — never reset; refreshed only by bootstrap verify-mode. It owns the contract names and the gate stubs, and its `scripts.test` must match the fixture layout WS-1 fixes. Kept distinct from the gate because "what the repo declares" and "what CI enforces" are separately verifiable (this is the seam the architecture separates as parts 2 and 4).

### WS-3: Capstone gate workflow — `harness/bkit-ci.yml` → `.github/workflows/bkit-ci.yml`

#### Scope

- Hand-written single-job workflow exposing `bkit-tests-check` present **and** green at PR head.
- Every-push steps: tests (`cd example && node --test`, TAP written to a file and the count parsed from it) and privacy scan (diff range computed per event; secret **and** home-path shapes; no built-page dependency, so a reset push stays green).
- PR-only steps: sentinel-gone (gating), executed-count (recorded, `continue-on-error`), classic-script form (recorded, `continue-on-error`), screenshot capture + `actions/upload-artifact@v4` (non-gating, warns loudly on failure).
- Literal `[main, dev]` triggers; `if: ${{ !cancelled() }}`; Node pinned **and recorded**; the `tests` step half of the invocation × pin pair.
- Publication mapping `harness/bkit-ci.yml` → `.github/workflows/bkit-ci.yml`; never adopt the full copy-and-own template; never `[skip ci]`; never run PR-only steps on a push; never gate a recorded observation.
- Answers the executed-count open question: recorded (`continue-on-error`, PR-only), never a gate (applied).

#### Requires

[WS-1, WS-2]

#### Rationale

The only thing that fails a run and the highest-risk artefact (event conditionals, diff-range computation, the observed-vs-gating split). It consumes the fixture path and sentinel single-definition (WS-1) and the capstone-name contract (WS-2). Its concerns are the gate, not the repo's declarations, so it is its own unit.

### WS-4: Maintainer runner — `scripts/example/new-run.mjs`

#### Scope

- Idempotent `--bootstrap`: create the public repo and seed `main` + push `dev`, or verify-and-repair (incl. half-seeded state; re-render `bkit-ci.yml`, re-publish the fixture; never create/delete the repo; no pruning); the create half stays on the live canary (WS-8 note).
- Per-run preflight: fixture present with its sentinel; `main` still carries the fixture; `git status --porcelain` empty and `dev == origin/dev`; run-in-flight guard with `--force-run`; `gh auth` / Node ≥ pinned / pnpm.
- Reset: delete + re-create files under `example/` from the fixture as **one** commit on `dev`, pre-delete path assertion and post-delete verification; the only destructive op, scoped to `example/`.
- `pnpm install` → `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github`; read-backs (`issueTracker == github`, version via `.bkit-version` JSON schema, every seeded `bkit:gate:*` script resolves); commit install churn.
- Push; file `FEATURE-REQUEST.md` as the issue (runId = issue #); print the start command; one `[bkit-example]` line per transition; a failure names exactly the `dev` state left behind.
- Write the run marker (reset commit message `chore(example): reset run {N} (bkit {x.y.z})`, no skip markers) — the format WS-5 reads.
- Never gate; never touch `.bkit/`, `docs/` or the root harness; never capture the screenshot.
- Answers the open questions: marker = reset commit (applied); preflight anti-concurrency guard (applied); `feat/{FID}` pre-existence treated as out of scope (documented assumption); first real run is the C10 de-risking (applied).

#### Requires

[WS-1, WS-2]

#### Rationale

The single writer that owns the persistent repo's lifecycle and the reset. It needs the fixture set (WS-1) and the harness contract names it reads back (WS-2). It defines the run-marker format that WS-5 consumes.

### WS-5: Benchmark read path & median reporting

#### Scope

- Define the read path exactly once: group `outcome` rows by `bkitVersion`; run-scope by the run marker (never `parentSha`); the four-`outcome`-rows-per-cycle contract; `status.jsonl` step rows (`type`, not `kind`).
- Count-attempted (reset commits via `git log --grep`) vs count-completed (`outcome` rows) so a run dying before design is visible; per-version failure rates.
- README median-table shape: middle wall time, counters, report scores, a version column, completed-runs-only exclusion.
- Envelope constraints: no new `kind`, no runner-written ledger kind, no report code, no aggregate store; the never-prune / append-only rule text.
- Answers the open questions: cost unmeasured (wall time + counters only); no benchmark tooling (applied).

#### Requires

[WS-4]

#### Rationale

"No new tooling" is still a designed contract — the grouping/scoping rules are load-bearing and must be stated once. It consumes the marker WS-4 writes and the rows a run produces. It builds no code; it defines the rules WS-2's README points at and WS-7's contract table renders.

### WS-6: AI run-analysis prompt — `examples/analysis-prompt.md`

#### Scope

- Author the prompt (bkit-side, **never published** into the run repo): what it reads (that run's `status.jsonl`; `.bkit/stats.jsonl` rows in the run's window; issue + PR; the `bkit-tests-check` step conclusions incl. executed count, sentinel, classic-script, privacy, screenshot; the screenshot artefact; the built page + logic + tests).
- The fixed score rubric and ideal baseline: `completion` (the only binary), `test validation`, `trap detection` (0-4), `loop economy`, `divergence from ideal`, `deliverable integrity`, `cost proxy`.
- Output contract: scored report at `docs/plans/{YYYYMM}/logs/{FID}/analysis-run{N}.md` beside the run's `status.jsonl`, committed with a docs-only commit (no `[skip ci]`); prompt revision recorded; abort handling; non-gating status.
- Answers the open question: recorded forever, read by the report (the only binary stays run completion) (applied).

#### Requires

[WS-1, WS-3]

#### Rationale

A separate artefact with its own content (rubric, ideal) and run mode (host-invoked, post-stop, abort-capable). It scores against the traps WS-1 defines and consumes the recorded observations WS-3 emits. Never published, so it cannot be folded into the fixture or gate.

### WS-7: bkit-side contract documentation & registrations

#### Scope

- `examples/README.md` contract table: gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, sentinel, reset procedure, run-marker, harvest/median read path, version-grouping rule, serial invariant, never-prune rule, privacy, `[skip ci]` recovery line, breaking-release runbook — **never published**.
- Register `examples/README.md` and `examples/analysis-prompt.md` in `.agents/docs.md`.
- All `docs/decisions.jsonl` ADR rows for this cycle (persistent public repo; reset scope; reset direct on `dev`; always-latest + version grouping; liveness-only framing; gate shape; every-push privacy; PR-only sentinel + recorded observations; CI screenshot; bootstrap; runner; serial invariant; never-prune; docs; AI analysis prompt; lockfile; gate registration incl. the WS-9 config change; the cycle's scope exclusions — the nine later ideas and no smoke job).
- Write the two `examples/*.md` docs to the prose rules (`.bkit/core/prompts/bkit-utility-compress-markdown.md`).
- Note the `data.js` owner-check cadence (per-release canary owner) per the WS-1 open question.

#### Requires

[WS-1, WS-2, WS-3, WS-4, WS-5, WS-6, WS-8, WS-9]

#### Rationale

The contract table is the single non-obvious-contract home; it documents what every other workstream produces, so it lands last. The docs-index registration and ADR rows are the repo's own housekeeping. Sole writer of `decisions.jsonl` keeps that append-only ledger single-writer.

### WS-8: Runner verification — `tests/example-run.bats` + `gh` stub extension

#### Scope

- `tests/example-run.bats` covering the runner's preflight, reset-scope and gate-chain assertion paths.
- Extend `tests/fixtures/gh/bin/gh` with a `gh auth status` shape.
- Explicit non-scope: never exercise `gh repo create` / `gh repo view` (the stub exits 1 on non-`api` argv) or `bkit runs gate --repo … --pr …` (it mis-resolves the PR); bootstrap-verify stays on the live canary.

#### Requires

[WS-2, WS-4]

#### Rationale

The runner sits outside vitest's include and outside `tsc`, so bats over the stub is its only automated verification. It needs the runner (WS-4) and the harness contract whose assertions it exercises (WS-2).

### WS-9: Register the new paths in bkit's own gates

#### Scope

- Commit the fixture prettier-formatted; add `examples/bkit-explainer/**` to `slop-scan.config.json` `ignores`; keep the runner scanned and slop-clean; align `.prettierignore` if needed; `pnpm bkit:gate:static` green before landing.
- Confine the ignore to the deliberately near-empty fixture data (the runner stays under the gate).

#### Requires

[WS-1, WS-4]

#### Rationale

`examples/**` and `scripts/example/**` land inside bkit's own `prettier --check .` and `bkit ci slop`; unregistered they red bkit's CI. It needs the fixture paths (WS-1) and the runner path (WS-4) to exist before registering and formatting them. The ADR row for this config change is authored in WS-7 (single `decisions.jsonl` writer).
