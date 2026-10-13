# Design: bkit Example Project — Interactive Pipeline Explainer

## Related Issues

- #505 — Root README sells bkit for the public launch (closed)
- #528 — ci: reuse the dev push run for promotion PRs (adopt release-PR mirror mode in bkit's own CI) (closed)
- #408 — Publish @cbartens/bkit publicly on npmjs; no consumer auth (closed)

Cited by #504 and load-bearing here: #43 (the eval tiers this slots into; measurement-vs-pass/fail), #45 (per-host evidence this would supply), #232 (flaky/AI graders must never fail CI).

## Acceptance Scenario

Initial draft — expanded by later review; no Test Matrix yet.

### Narrative

A maintainer runs the repo tooling once in bootstrap mode to create the persistent public example repo, then runs it per experiment: it resets the example app folder on `dev` to the canonical fixture, installs the latest bkit, files the fixed feature request as an issue and prints the start command. They start the pipeline, sign off after design and after plan, and bkit builds an interactive page that explains bkit's own phases and loops inside that folder, then merges it — the repo always shows the same example folder, its git history is the run history, and the accumulated `.bkit/stats.jsonl` holds every run's numbers. They repeat the run a few times and read the middle wall time and counters, grouped by the recorded bkit version, to tell whether a change made bkit faster, cheaper or more reliable; a visitor to the public repo sees the same folder, the same history and the same evidence.

### Success Criteria

1. `node scripts/example/new-run.mjs --bootstrap` creates the public repo `cbartens/bkit-example` **once** — canonical fixture on `main`, a pushed `dev` — and is idempotent (re-run verifies and repairs drift); normal runs never create or delete the repo.
2. A run resets **only** the app folder (`example/`) from the fixture as one commit on `dev`, installs the latest `@cbartens/bkit` with `--claude --tracker=github`, reads the `github` tracker back, and reaches a merged PR with `node --test` green and the placeholder sentinel gone from the built page.
3. The repo's own capstone `bkit-tests-check` is present and green at PR head, so `/bkit-ship`'s merge gate is satisfied; reset pushes to `dev` run tests only, so the PR-only sentinel and privacy steps never red `dev`.
4. Results live in the repo's tracked `.bkit/stats.jsonl`, which accumulates across runs because the reset never touches it; reading it directly and grouping `outcome` rows by `bkitVersion` (run-scoped by `parentSha`) yields one comparable result per run — no separate aggregate store, no new format, no report code.
5. Nothing measured can fail a run: pass/fail is `node --test` green + sentinel gone + PR merged; wall time, counters, the screenshot and cost are recorded, never gated (#232).

### Key Edge Cases

- **Reset scope (destructive failure mode):** the folder delete is the one destructive filesystem op; a bug that widens the path (`rm` at root or `.bkit/`) destroys the accumulated benchmark history. The delete is scoped to the app folder and the resolved path is asserted before deleting.
- **Reset lands on `dev`, not the feat branch (blocking first step):** `feat/{FID}` does not exist until design's worktree setup mints it off `origin/dev` (spike C1). Pre-cutting it couples the reset to unverified worktree-adoption behaviour; a reset on `main` makes the ledgers conflict from run 2 (append-at-EOF, same hunk).
- **Overlapping runs (concurrency):** two concurrent runs append `.bkit/stats.jsonl` / `docs/deferrals.jsonl` / `docs/failures.jsonl` at EOF; the second PR conflicts on every ledger file. Serial topology is the invariant.
- **Tracker default (silent failure):** `bkit install` without `--tracker=github` records `issueTracker: "none"`, and every workflow renders `_No tracker connected, skip step._` with no error and no gate. The runner reads the value back and stops unless it is `github`.
- **Install needs a module flag (spike C5, DISPROVEN):** `bkit install --tracker=github` alone exits 1 mid-sequence; the runner always passes `--claude`.
- **Gate-chain growth (drift):** a bkit release adds or renames a script in the seeded `bkit:gate:*` chain, so the fixture's pre-declared scripts stop satisfying it — silently, because the advisory fires only on _missing_ names, never on a chain that grew.
- **Always-latest upgrade path (new failure class):** a breaking bkit release blocks the sweep at reset. Grouping by `bkitVersion` keeps a sweep straddling a release comparable; the assertion battery makes the block loud.
- **CI-at-root (silent green):** with the app in a subfolder, root `node --test`/`pnpm test` must target the folder, or the merge gate passes over zero tests.
- **Sentinel false-fail (determinism):** the built page legitimately quoting the sentinel string would false-fail; the feature request forbids quoting it and the sentinel is unguessable.
- **Public privacy (load-bearing, not optional):** run artefacts leak absolute home paths (`/Users/<name>`) even with zero secrets; worktree setup copies `.env` / `.env.local` into worktrees (C1 evidence), so the fixture `.gitignore` covers them and the scan reads the diff for secret **and** path shapes.
- **`[skip ci]` at HEAD (KN-11):** empties `statusCheckRollup`, so the merge gate sees no capstone. The reset commit and every pipeline commit carry no skip markers.
- **Branch protection on `dev` (403 on the very first run):** the runner writes `dev` directly; bootstrap must not enable protection on `dev`.
- **Ledger growth / single writer (accepted):** `.bkit/stats.jsonl` grows unbounded (bkit warns at 5000 rows, no rollup); serial runs keep appends single-writer.
- **AI non-determinism (#232):** a run may not catch a planted trap; the catch is measured, never gated, and the demo narrative must not promise it.
- **Human hard stops:** design and plan end awaiting a human, so N runs = N human sessions; benchmark scheduling and cost claims must price human time.

### Process Sketch

- WHEN the maintainer runs `new-run.mjs --bootstrap` → THEN create (or, if it exists, verify and repair) the public repo with the canonical fixture on `main` and a pushed `dev`; normal runs never create or delete it.
- WHEN the maintainer runs the runner for a run → THEN preflight (fixture present with its sentinel, `git status` clean and `dev == origin/dev`, `gh auth`, Node ≥ 20, pnpm) → reset **only** `example/` from the fixture as one commit on `dev` → `bkit upgrade --latest` + `bkit install --claude --tracker=github` → read tracker/version/gate-chain back → push → file the issue → print the start command.
- WHEN the maintainer starts the pipeline → THEN design → hard stop → plan → hard stop → build (agents write `index.html`, the logic file and its `node --test` tests) → PR opened.
- WHEN CI runs → THEN at PR head `node --test` is green and the sentinel is gone (PR-only steps) → THEN `/bkit-ship` merges into `dev`; a reset push to `dev` runs the tests only.
- WHEN a planted trap is missed → THEN `node --test` fails → the debug loop diagnoses, fixes and retries within its attempt budget.
- WHEN the run ends → THEN capture the screenshot post-merge from `dev` tip as a recorded artefact → read the middle wall time and counters from the repo's `.bkit/stats.jsonl`, grouped by `bkitVersion`.

## Reuse & Prior Art

| Capability                                                  | Prior art                                                                                                                         | Verdict  | Why                                                                                                                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A versioned example fixture under `examples/`               | `None` — searched repo root, `.bkit/`, `scripts/`, `tests/`; no `examples/` exists today                                          | `NEW`    | No existing artifact covers a runnable example; the issue prescribes `examples/` as its home and this fixture is versioned with bkit.                                  |
| Repo-side maintainer runner                                 | `scripts/readme/readme-art.mjs`, `scripts/ci/lanes/*.mjs`, `scripts/slop/*.mjs`                                                   | `EXTEND` | Same `scripts/<area>/*.mjs` pattern: add `scripts/example/new-run.mjs`, matching the closest equivalent.                                                               |
| Persistent public-repo creation + `main`/`dev` seeding      | `gh repo create --public`; `tests/fixtures/gh/bin/gh` stub shows the `gh api` shape                                               | `EXTEND` | Reuse `gh` directly; no wrapper. The stub shims three `gh api` calls only (test-harness precedent, not runner reuse).                                                  |
| Installing and upgrading bkit in the repo                   | `bkit install --claude --tracker=github` (`install/install.ts`); `bkit upgrade --latest` (atomic self-bump, `install/upgrade.ts`) | `EXTEND` | Reuse the real installer and upgrade path; never reimplement. Install needs at least one module flag (spike C5).                                                       |
| Minting the run branch off `dev`                            | `bkit worktrees setup` (spike C1: mints `feat/{FID}` off `origin/dev` with `main` default)                                        | `EXTEND` | The runner does not cut `feat/*`; the pipeline mints it off `origin/dev`, so the reset must already be on `dev`.                                                       |
| Accumulating results across runs                            | `.bkit/stats.jsonl` (`merge=union` in `.gitattributes`; rows carry `bkitVersion`; `.bkit/jsonl.md` envelope)                      | `EXTEND` | Reuse the existing tracked file, row shape and union merge; no new format, no separate aggregate store.                                                                |
| Satisfying the local gate chain (`bkit:gate:static-unit`)   | Seeded add-if-missing scripts — `install/modules/core.ts`, `BKIT_GATE_SCRIPTS` in `install/manifest.ts:215`                       | `EXTEND` | Pre-declare the tool-script names the seeded chain calls, using the repo's own "skip if tool absent" idiom. Never weaken a gate.                                       |
| Satisfying the ship merge gate (capstone job green at head) | `.bkit/templates/.github/workflows/bkit-ci.yml` (copy-and-own, ~1065 lines); `bkit.capstoneJob` default `bkit-tests-check`        | `EXTEND` | The template is copy-and-own and permits owning a reduced copy; own a hand-written ~40-line file with the single required job instead of adopting the full template.   |
| Test runner for the built app                               | Node built-in `node --test` (`engines.node >= 20`)                                                                                | `EXTEND` | Already the intended runner and the issue's only CI check; adds zero dependencies.                                                                                     |
| Deterministic placeholder (sentinel) pass/fail              | `None` — no existing artifact asserts "the placeholder was replaced"                                                              | `NEW`    | New data (an unguessable sentinel string) plus a PR-only check; the fixture ships no test, so this is the only code-checked signal that a run actually built the page. |
| Screenshot artefact (never gating)                          | Headless Chrome — `--headless=new` (spike C3); auto-detected binary in `scripts/readme/readme-art.mjs`                            | `EXTEND` | Reuse the existing headless-Chrome mechanism; no new dependency. Recorded and reviewed, never a gate (#232).                                                           |
| Content data the built page reads                           | Fixed fixture `data.js`, loadable by a classic `<script src>` off `file://`                                                       | `NEW`    | No existing content artifact encodes bkit's phase/loop skeleton; `data.js` is new data, not code.                                                                      |
| Benchmark measurement inputs                                | `.bkit/stats.jsonl` `outcome`/`counter` rows; `status.jsonl` step rows                                                            | `EXTEND` | The rows already exist and carry `bkitVersion`; the benchmark is a reader, so no new artifact or record schema is added.                                               |
| Contract documentation for the example                      | `docs/templates/*`; `.agents/docs.md` doc index                                                                                   | `EXTEND` | Add `examples/README.md` contract table and register it in `.agents/docs.md`, following the existing docs-index pattern.                                               |
| Reading the installed version                               | `.bkit-version` JSON schema (`pinnedVersion`) — KN-9                                                                              | `EXTEND` | Bump the version read to the JSON-schema read; never raw `readFileSync().trim()`.                                                                                      |
| Runner verification over a `gh` stub                        | `tests/fixtures/gh/bin/gh`; `*.bats` suites                                                                                       | `EXTEND` | Add `tests/example-run.bats` over the stub — the runner sits outside vitest's include and outside `tsc`.                                                               |

## Architecture

Four separable parts, each small: an immutable **fixture**, a durable bootstrap-installed **root harness**, one **runner**, and an independent **gate**. The layering is what turns "measurement never fails a run" and "the reset never destroys evidence" from conventions into boundaries.

**1. Fixture (immutable; knows nothing about the harness) — `examples/bkit-explainer/` in bkit's repo**

The versioned start state. Data/inputs only — no app logic, no tests beyond the placeholder:

- `index.html` — a **near-empty placeholder** carrying the sentinel string (`BKIT-EXAMPLE-SENTINEL-<unguessable>`); if it survives a run, the build produced nothing → that run failed.
- `data.js` — the fixed content data (phases, loops, counters, transitions) as a classic-script-loadable plain JS file, never `.json` (a page opened off disk cannot `fetch`).
- `FEATURE-REQUEST.md` — the fixed, pre-written request the runner files as the issue (content requirements, the four traps as plain requirements, the fixed filenames, the plain-`<script src>` / one-pure-function rules; forbids quoting the sentinel).
- The repo-root harness sources the bootstrap installs (a `package.json`, a ~40-line `.github/workflows/bkit-ci.yml`, a `README.md`, `.gitignore`) — see part 2.

**2. Durable root harness (bootstrap-installed; outside the reset surface)**

The persistent repo's root: `package.json` (consumer harness, gate stubs, `bkit` block), `.github/workflows/bkit-ci.yml` (capstone + PR-only steps), `.bkit/` (installed payload + the accumulating `stats.jsonl` / `status.jsonl`), `docs/` (accumulating plans, logs, screenshots), `README.md`. The reset **never** touches these; only `example/` is re-created.

**3. Runner (bkit-side maintainer tooling) — `scripts/example/new-run.mjs`**

Owns the persistent repo's lifecycle and the run's setup: idempotent `--bootstrap` (create, or verify-and-repair); per run: preflight → reset `example/` on `dev` from the fixture as one commit → `bkit upgrade --latest` + `bkit install --claude --tracker=github` → read-backs (tracker = `github`, version from `.bkit-version`, every seeded `bkit:gate:*` script resolves) → push → file the issue → print the start command; plus the post-merge screenshot capture. It owns the measurement **inputs** only and never gates. The reset is the only destructive filesystem op and is scoped to `example/` with a resolved-path assertion.

**4. Gate (independent of the runner) — the repo's own `bkit-ci.yml`, `node --test`, and the merged PR**

The only thing that fails a run. The capstone `bkit-tests-check` runs the app tests (`node --test example`); on `pull_request` it additionally asserts the sentinel is gone and scans the diff for secret/PII/path shapes. `/bkit-ship` refuses to merge unless the capstone is present and green at PR head. The runner never gates; the gate never measures.

**Boundaries**

- Fixture ↮ harness: the app never learns the harness exists; the harness never learns what the app does.
- Gate ↮ measurement: pass/fail is code-checked (`node --test` + sentinel gone + merged PR); wall time, counters, screenshots and cost are recorded and never fail a run.
- Reset surface ↮ durable root: `example/` is disposable and re-created every run; the root harness and the ledgers accumulate and are never reset.
- Runner ↮ repository semantics: the runner owns bootstrap and the reset; the run itself, once seeded, is ordinary bkit-in-a-consumer-repo.

**Integration points**

`gh` CLI (repo create, clone, push, PR view) · pnpm / Corepack (`packageManager` pin) · `bkit upgrade --latest` · `bkit install --claude --tracker=github` · seeded `bkit:gate:*` chain · `bkit.capstoneJob` / `bkit.ciWorkflow` merge-gate contract · GitHub Actions (the repo's own CI on literal `main`/`dev` triggers and PRs to `dev`) · GitHub Issues tracker · bkit ledgers (`status.jsonl`, `.bkit/stats.jsonl`) · headless Chrome (screenshot).

**Deliberately outside the boundary**

No hosting, no deploy, no packages, no secrets, no private-registry auth (`@cbartens/bkit` is public on npmjs today). No repo teardown or retention sweep (the repo is persistent). No second harness, no record schema, no metrics/report layer, no separate aggregate store. No smoke job in bkit's own CI (ad hoc runs only).

## Data Model

No database. Three schemas are load-bearing: the durable root `package.json`, the fixed content data, and the ledger rows the benchmark reads.

**Persistent repo layout — `cbartens/bkit-example` (public)**

```
cbartens/bkit-example/
├── package.json                 # durable harness (table below)
├── FEATURE-REQUEST.md           # durable: the fixed request, filed as the issue
├── .github/workflows/bkit-ci.yml# durable ~40-line capstone + PR-only steps
├── .bkit/                       # installed payload + accumulating stats.jsonl / status.jsonl — NEVER reset
├── docs/                        # accumulating design/plan/build logs + screenshots — NEVER reset
├── README.md                    # written by bootstrap: main = fixture, dev = integration, reset, stats read path, never-prune rule
├── example/                     # RESET per run — re-created from the fixture
│   ├── index.html               # near-empty placeholder + sentinel (fixture)
│   ├── data.js                  # fixed content data (fixture)
│   └── … (agents add logic.js and its node --test tests here)
```

`main` holds the canonical fixture (the reproducible start); `dev` is integration (each run's PR merges here); the reset restores **only** `example/` from the fixture, so the reset set and the fixture set are the same set.

**Root `package.json` (durable harness)**

| Field                                                                         | Value / shape                                                                                             | Why it exists                                                                                                                                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                                                                        | `"bkit-example"`                                                                                          | `bkit install` blocks without a parseable `package.json` (`no-package-json`) and `resolveTokens` hard-throws when `name` is absent (`install/placeholders.ts:71-75`).    |
| `private`                                                                     | `true`                                                                                                    | Prevents accidental publish from the public repo.                                                                                                                        |
| `type`                                                                        | _(absent)_                                                                                                | Absent ⇒ `.js` is CommonJS, so a logic file satisfies both `require` under `node --test` and a classic `<script src>` (dual-load guard, spike C3).                       |
| `packageManager`                                                              | `pnpm@<pinned>`                                                                                           | Corepack resolves the same pnpm in the worktree installs the workflows trigger.                                                                                          |
| `devDependencies["@cbartens/bkit"]`                                           | kept at **latest** by the runner (`bkit upgrade --latest`); the version is recorded per run, never pinned | Always-latest is the binding decision; the recorded `bkitVersion` is what keeps a release-straddling sweep comparable.                                                   |
| `scripts.test`                                                                | `node --test example`                                                                                     | Must target the subfolder, or the merge gate passes over zero tests. The capstone runs the same thing.                                                                   |
| `scripts.typecheck`                                                           | `node --check example/data.js example/logic.js` (logic built by the run)                                  | Pre-declared so the seeded chain's `pnpm typecheck` resolves; the feature request fixes the filenames, so the check never depends on a name an agent chose.              |
| `scripts.lint` / `format:check` / `lint:prose` / `slop:delta` / `lint-staged` | documented no-ops that echo what they skip to stderr (the repo's own `lint` idiom)                        | The seeded chain calls them; the feature request must not claim they check more than they do.                                                                            |
| `scripts.build`                                                               | no-op                                                                                                     | `bkit:gate:install-static-unit-build` (ship's conflict-resolve path) calls `pnpm build`.                                                                                 |
| `bkit.issueTracker`                                                           | `"github"`                                                                                                | Belt-and-braces alongside `--tracker=github`; the default `none` silently guts the demo. The runner reads this value back after install and stops unless it is `github`. |
| `bkit.capstoneJob`                                                            | `"bkit-tests-check"`                                                                                      | Names the merge-gate check ship requires.                                                                                                                                |
| `bkit.ciWorkflow`                                                             | `"bkit-ci.yml"`                                                                                           | Names the workflow file ship reads.                                                                                                                                      |

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

| Row kind  | Fields consumed                                                                                         | Where                                        |
| --------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `outcome` | `durationSeconds`, `taskCount`, `reviewIterations`, `deferrals`, `failures`, `bkitVersion`, `parentSha` | `.bkit/stats.jsonl` (tracked, `merge=union`) |
| `counter` | `counterName`, `counterValue` (attempt counters, incl. debug retries)                                   | `.bkit/stats.jsonl`                          |
| step rows | `workflow` / `step` / `status` / `at` — the phase timeline                                              | `status.jsonl`                               |

Reader contract: `outcome` is **one row per workflow run**, so a design→plan→build→ship run = four `outcome` rows correlated by `parentSha` (and joined by constant `repo`); group by `bkitVersion`, then run-scope by `parentSha`. `status.jsonl` rows discriminate on `type` (not `kind`); `outcome.reviewIterations` is optional and absent from some rows — absence is never failure.

**Run marker (no new ledger kind).** A run that dies before its first pipeline row would be invisible in the benchmark. The marker is the **reset commit itself** — message `chore(example): reset run {N} (bkit {x.y.z})` — not a ledger row: `kind` is a closed enum (`.bkit/jsonl.md`) with no `run` member, and the writers table allows no runner-written kind. `git log --grep` on `dev` counts attempted runs per version; `outcome` rows count completed ones.

**Relationships**

`package.json` declares the gate/merge contract → the seeded chain and `bkit-ci.yml` consume those names → CI emits the `bkit-tests-check` check → ship's merge gate reads that check. Independently, the run writes ledger rows → the benchmark's read path consumes them. The two chains must never meet: no ledger row may influence the gate.

## Components / Flows

**Component inventory**

| Component                            | Type                    | Owns                                                                                                                                                                                                                                | Must never                                                                                         |
| ------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `examples/bkit-explainer/`           | immutable fixture       | the versioned start state (placeholder `index.html` + sentinel, `data.js`, feature request, harness sources)                                                                                                                        | contain app logic, tests, or any harness knowledge beyond the placeholder                          |
| `examples/README.md`                 | docs (bkit-side)        | the contract table: gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, sentinel, reset procedure, run-marker, harvest/median read path, version-grouping rule, serial invariant, never-prune rule, privacy | be copied into the run repo (it would leak the traps)                                              |
| `scripts/example/new-run.mjs`        | runner (bkit-side)      | idempotent bootstrap; per-run reset of `example/`; always-latest install + `--claude --tracker=github`; read-backs; push; issue; screenshot capture; the only path that deletes the app folder                                      | gate anything; widen the reset path beyond `example/`; touch `.bkit/`, `docs/` or the root harness |
| root `package.json`                  | durable harness         | the gate/merge contract names, the gate stubs, the `bkit` block, the version read                                                                                                                                                   | be reset                                                                                           |
| `.github/workflows/bkit-ci.yml`      | durable gate            | exposing `bkit-tests-check` present + green at PR head; PR-only sentinel + privacy steps; literal `main`/`dev` triggers; pinned + recorded Node version                                                                             | adopt the full copy-and-own template; reintroduce `[skip ci]`; run the PR-only steps on a push     |
| the built app's pure function        | fixture output (agents) | "which boxes are lit, which arrows are active, what each counter reads"                                                                                                                                                             | touch the DOM                                                                                      |
| the built app's painter              | fixture output (agents) | paints the pure function's return only                                                                                                                                                                                              | hold logic                                                                                         |
| `.bkit/stats.jsonl` / `status.jsonl` | measurement             | wall time, counters, per-run deltas; accumulate across runs via union merge                                                                                                                                                         | be consulted by any gate; be reset                                                                 |
| `tests/example-run.bats`             | verification            | the runner's preflight, reset-scope, gate-chain assertion and bootstrap-verify paths, over the `tests/fixtures/gh/bin/gh` stub                                                                                                      | exercise `gh repo create` (the stub exits 1 on non-`api` argv; that stays on the manual canary)    |

**Flow — bootstrap (once, idempotent)**

1. WHEN run → preflight `gh auth status` / Node ≥ 20 / pnpm; any failure stops before mutating anything, named under `[bkit-example]`.
2. WHEN the repo does **not** exist → create `cbartens/bkit-example` public; seed `main` with the canonical fixture; create and push `dev` with the root harness + the fixture in `example/`; print the URL.
3. WHEN it **exists** → verify mode: assert `main` still holds the fixture and the root harness matches source; report and repair drift (re-render `bkit-ci.yml`, re-publish the fixture); never create or delete the repo.

**Flow — run start (the runner, per run)**

1. WHEN run → preflight: fixture directory exists **and** the sentinel is present in the fixture `index.html` (a renamed fixture otherwise commits a pure deletion of the app); `git status --porcelain` empty and `dev == origin/dev` (a stale clone reintroduces the ledger-conflict mode); `gh auth` / Node ≥ 20 / pnpm.
2. THEN fetch latest; on `dev`, delete the tracked files under `example/` and re-create them from the fixture, **asserting the resolved path is inside `example/`** before deleting — one commit, no `[skip ci]` (KN-11).
3. THEN `bkit upgrade --latest` + `bkit install --claude --tracker=github`; read `bkit.issueTracker` back and stop unless it is `github`; read the version from `.bkit-version` via its JSON schema (`pinnedVersion`, KN-9); assert every script the seeded `bkit:gate:*` chain calls resolves; commit any install churn.
4. THEN push the reset commit; file `FEATURE-REQUEST.md` as the issue (runId = issue #); print the start command.
5. WHEN any step after 2 fails → THEN the failure output names exactly what state `dev` was left in, so recovery is mechanical (re-run: the reset is idempotent from any `dev` state).

**Flow — demo (one run)**

1. WHEN the maintainer starts the pipeline with the filed issue → design's worktree setup mints `feat/{FID}` off `origin/dev` → design (agents) → **hard stop for sign-off**.
2. THEN plan → **hard stop for sign-off**.
3. THEN build: agents write `example/index.html`, the logic file and its `node --test` tests inside `example/`; the four traps are caught only if review actually catches them.
4. THEN build Step 14 runs the seeded `bkit:gate:static-unit` chain; the PR opens; CI runs `node --test example`; `bkit-tests-check` goes green and, on the PR, the sentinel-gone and privacy steps pass.
5. WHEN the maintainer runs `/bkit-ship` → merge gate checks the capstone at head → squash-merge into `dev`. A reset push to `dev` runs tests only. Production stays their call.
6. WHEN a trap is missed → `node --test` fails → the debug loop diagnoses, fixes and retries within its attempt budget.

**Flow — benchmark (N runs, no new tooling)**

1. WHEN the maintainer repeats the run N times → N reset commits on `dev`, each starting from the same fixture; the ledgers accumulate at the root, untouched by any reset.
2. WHEN each run ends → capture the screenshot post-merge from `dev` tip under that run's `docs/plans/…/logs/` (never gating); no harvest step exists because there is no teardown.
3. THEN read the middle wall time and counters directly from `dev:.bkit/stats.jsonl`, grouped by `bkitVersion` and run-scoped by `parentSha`, and record them in the README's median table. No in-harness folding, no record schema; the raw rows stay the source of truth.
4. THEN count attempted runs from the reset commits and completed runs from `outcome` rows (a run dying before design is visible), so per-version failure rates are computable.

**Flow — the built app (what the agents produce)**

1. `data.js` supplies the fixed skeleton; the pure function maps "position in the run" → `{ litBoxes, activeArrows, counters }`.
2. `index.html` holds the page and loads the logic and data with ordinary `<script src>` tags (never `type="module"`), so double-clicking it works off `file://`.
3. The painter renders that return, and honours reduced motion with a step-by-step static view and full keyboard operability.
4. `node --test example` requires the logic file directly, using the environment guard (export when `module` exists, attach a global otherwise), so one file serves the browser and the test runner.

## Decisions

| Decided                                                                                                                                                                                                                                                                                                            | Alternatives                                                                             | Why                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One **persistent public** repo, the app in a constant subfolder, per-run folder reset (supersedes the throwaway-private-repo model of v3)                                                                                                                                                                          | Fresh private throwaway repo per run (v3)                                                | Binding decision: the repo always shows the same example, history is the experiment history. Deletes the retention sweep, the per-repo Actions-minutes risk and the `gh repo delete` scope. A public repo also buys zero Actions minutes and makes the evidence public at the same time.                                                                                                                |
| Reset scope = **`example/` only**; root harness + `.bkit/` + `docs/` are durable and never reset; the reset set and the fixture set are the same set                                                                                                                                                               | Reset the whole run workspace (root minus `.bkit/`)                                      | The delete is the one destructive op; scoping it to a real directory (not "root content minus `.bkit/`") makes the boundary explicit and guardable. The durable root is what lets results accumulate where the reset can never reach them.                                                                                                                                                              |
| Reset lands as **ONE commit direct on `dev`** before the pipeline starts; `feat/{FID}` is minted by bkit off `origin/dev` (spike C1)                                                                                                                                                                               | Reset on the run's `feat/*` branch (first brainstorm's literal wording); cut from `main` | The feat branch does not exist until design's worktree setup mints it — pre-cutting couples the reset to unverified worktree-adoption behaviour and to issue-number sequencing. Feat-from-`main` makes `.bkit/stats.jsonl` and the ledgers conflict from run 2 (append-at-EOF, same hunk); union merge is magic the ship conflict-resolve path trips on anyway. Linear `dev` history removes the class. |
| `main` = canonical fixture (the reproducible start); `dev` = integration (PR base); reset is its own commit                                                                                                                                                                                                        | Single-branch; reset on `dev` without a fixture branch                                   | Ship requires `PR_BASE == dev` and mints `feat/{FID}`; the fixture on `main` is the browsable "what a run starts from". `main` holds only the app fixture so `main` and the reset source coincide, avoiding the "fixture set ≠ reset set" split.                                                                                                                                                        |
| Results = the repo's own **tracked `.bkit/stats.jsonl`**, accumulating across runs (union merge); read raw, grouped by `bkitVersion` and run-scoped by `parentSha`; **no** separate store, **no** report code                                                                                                      | A `results` branch; a per-run `runs/<id>/` folder; a `benchmark.mjs`; a CI summary job   | The rows already exist and carry `bkitVersion`; union merge is already installed. A new store or a report script is the record-schema drift surface the risk lens warns about (YAGNI), and contradicts the binding "reuse `.bkit/stats.jsonl`; no new format".                                                                                                                                          |
| Run marker = the **reset commit message** (`reset run {N} (bkit {x.y.z})`), not a ledger row                                                                                                                                                                                                                       | A `kind:"run"` row; a `counter` row from the runner                                      | `kind` is a closed enum (`.bkit/jsonl.md`) with no `run` member, and the writers table allows no runner-written kind; a fabricated kind fails the envelope gate. `git log --grep` over the reset commits counts attempted runs per version and needs no schema change.                                                                                                                                  |
| Pass/fail = `node --test` green **+ sentinel gone + PR merged**; the sentinel check is a **PR-only CI step**, and the fixture ships **no test**                                                                                                                                                                    | A fixture-shipped sentinel test inside `node --test`; a whole-file hash compare          | Binding: "no test subject pre-written beyond the placeholder", so the fixture cannot ship a sentinel test. A PR-only CI step checks the built page exactly where the diff is reviewable, is deterministic and AI-free, and a sentinel survives path/formatter churn that a whole-file hash would false-fail.                                                                                            |
| Privacy: the runner scans the run diff for secret **and** absolute-path shapes before any push, plus a PR-only CI step, plus a documented manual review before the first publish                                                                                                                                   | A dedicated CI job after push; rely on GitHub push protection alone                      | A public repo is public the moment it is pushed, so a post-push scan is too late; only the runner sees the diff pre-push. The scan must cover `/Users/`, `/home/` and other home-path shapes — run logs and `status.jsonl` leak them even with zero secrets — and the worktree copy of `.env` / `.env.local` (C1 evidence), which the fixture `.gitignore` also covers.                                 |
| **Sentinel and privacy are PR-only** (`if: github.event_name == 'pull_request'`); reset pushes to `dev` run tests only                                                                                                                                                                                             | Runner post-merge (privacy already public then); every-push steps                        | PR head is the only point where the built page exists pre-merge and the diff is the reviewable surface. Reset pushes would red `dev` on every run (the sentinel is present by definition at reset).                                                                                                                                                                                                     |
| Always install the **latest** bkit (`bkit upgrade --latest`) and **record the version with each run**; analysis groups by version (supersedes v3's exact pin + canary bump)                                                                                                                                        | Pin an exact version and bump after a canary                                             | Binding override. Grouping by `bkitVersion` is what keeps a sweep straddling a release comparable; always-latest also turns every run into an upgrade-path canary, which the setup-time assertion battery makes loud rather than silent.                                                                                                                                                                |
| Screenshot = recorded artefact (headless Chrome, post-merge from `dev` tip), **never** gating                                                                                                                                                                                                                      | A CI/browser gate                                                                        | Graders must never fail a run (#232). It is a human/AI signal only; noted ~0.3 MB/run of accumulation.                                                                                                                                                                                                                                                                                                  |
| Bootstrap = an idempotent `--bootstrap` mode of the same runner (create once; exists → verify and repair)                                                                                                                                                                                                          | A documented `gh repo create` one-liner                                                  | Bootstrap is the once-per-repo-life step executed by the person with the least context; verify-mode doubles as the drift-repair path for the root harness that resets never refresh. A README one-liner is the fallback if bootstrap is genuinely one-off.                                                                                                                                              |
| Capstone CI = a hand-written ~40-line `.github/workflows/bkit-ci.yml`, single `bkit-tests-check` job, PR-only steps, literal `[main, dev]` triggers, `if: ${{ !cancelled() }}`, pinned **and recorded** Node version                                                                                               | Adopt the ~1065-line copy-and-own template; rename the capstone via `bkit.capstoneJob`   | Ship's merge gate needs only the capstone present and green at head. The template is copy-and-own and its gate semantics evolve with bkit — the worst drift surface. One job removes the executed-test-count wire, a silent breakage point. Pinning/recording Node closes an unrecorded benchmark variable (the GH image moves).                                                                        |
| Root `test` targets the subfolder (`node --test example`), not bare `node --test`                                                                                                                                                                                                                                  | Run at repo root and rely on discovery                                                   | With the app in a subfolder, bare `node --test` discovers zero tests and the merge gate is silently green over nothing. This is the one spot the "dedicated folder" move breaks v3's root-copy assumption.                                                                                                                                                                                              |
| Gate chain satisfied by pre-declared Node-stdlib one-liner stubs (honest no-ops echoing what they skip)                                                                                                                                                                                                            | Full real toolchain (prettier, vale, slop-scan, actionlint, husky); weaken or skip gates | Weakening gates is prohibited and would misrepresent the pipeline; the real toolchain multiplies flake and cost against a benchmark that must usually pass. Seeded chains are add-if-missing, so pre-declared names survive install.                                                                                                                                                                    |
| Runner = repo-side `scripts/example/new-run.mjs`, bats-tested over the `gh` stub; preflight drops `delete_repo` and adds fixture-integrity + `dev`-sync assertions; one `[bkit-example]` log line per transition                                                                                                   | CI-mediated reset (a `workflow_dispatch`); a documented runbook                          | Runs are human-in-loop regardless (hard stops), so CI automation buys nothing per run and adds token/trigger semantics and two-branch reasoning at 3am; the runbook re-opens the tracker-`none` silent failure v3 ranked highest. One tested script keeps assertions at setup time, pre-mutation.                                                                                                       |
| Serial-run topology documented as an invariant in `examples/README.md`                                                                                                                                                                                                                                             | Parallel benchmark runs                                                                  | Append-at-EOF ledgers conflict on every file; provider rate limits; hard stops already serialise by human. Naming the mechanics stops a future contributor "speeding up the sweep" into the failure.                                                                                                                                                                                                    |
| Append-only / **never-prune** rule for the ledgers, `docs/plans`, and screenshots (history = experiment history)                                                                                                                                                                                                   | A periodic tidy-up                                                                       | A housekeeping delete of old runs' artefacts destroys benchmark evidence; stated as a rule so it does not die by kindness.                                                                                                                                                                                                                                                                              |
| `examples/README.md` contract table (gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, sentinel, reset procedure, run-marker, harvest/median read path, version-grouping rule, serial invariant, never-prune rule, privacy), registered in `.agents/docs.md`, plus architecture ADR rows | No docs; rely on the feature-request prose                                               | Non-obvious contracts would otherwise live in one head, and a well-meaning "simplify the example" edit would remove the benchmark's teeth with nothing failing loudly. Must stay **outside** the run repo (copying it leaks the traps). Architecture calls get `docs/decisions.jsonl` rows per `.agents/rules.md` § Major changes.                                                                      |
| The nine "later ideas" from #504 and the tracker-`none` install-advisory idea are **out of scope for this cycle**, already recorded as deferral rows (`504-run-replay-viewer` … `504-install-advisory-when-tracker-is-none`); **this cycle adds none**                                                             | Fold any of them into this cycle                                                         | The issue keeps one simple feature on purpose: every addition makes a run longer and more expensive, the benchmark needs something that usually passes, and the demo must be affordable for a new user.                                                                                                                                                                                                 |
| Drop WS-6 and bkit's CI smoke job entirely (no source-side guard)                                                                                                                                                                                                                                                  | Keep a smoke job in bkit's own CI                                                        | Binding: ad hoc runs only, do not add a smoke job now; the pass/fail signal stays usable if it is wired in later. The CI-edit human-confirmation gate goes with it.                                                                                                                                                                                                                                     |

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

**Risk-premortem mitigations layered onto the kept approach (additive, not a separate approach):** pre-mutation assertions (fixture present with its sentinel; `git status --porcelain` empty and `dev == origin/dev`; `gh auth` / Node ≥ 20 / pnpm); post-install read-backs (tracker == `github`; version via `.bkit-version` JSON schema, KN-9; every seeded `bkit:gate:*` script resolves); `--bootstrap` verify-and-repair; the reset commit message as the run marker (no skip markers, KN-11); PR-only sentinel + privacy placement; the ~15-line privacy grep over the PR diff (secret **and** home-path shapes); serial topology documented as an invariant; the never-prune rule; the `examples/README.md` contract table; the runner's bats test.

## Trade-offs Accepted

**Folder-scoped reset over a durable root — chosen over resetting the whole workspace.**

- Gain: the destructive op cannot reach the accumulated history or the harness; the reset set equals the fixture set; the boundary is a directory, not a description.
- Sacrifice: the run workspace now spans the root (harness, ledgers) and the folder (app), so two seams must stay honest. Accepted because that is exactly the boundary the issue's "keep it simple" and the risk lens's "boundaries over remembered seams" both ask for.

**Persistent public repo — chosen over per-run private throwaway repos.**

- Gain: history is the experiment history, evidence is public and durable, the retention sweep and the `delete_repo` scope disappear, and a public repo buys zero Actions minutes.
- Sacrifice: the demo audience shifts (an external user cannot "run it once" — the honest paths are watching the public history or self-bootstrapping a copy), and every run artefact is public, so privacy is load-bearing rather than optional. Accepted as an explicit risk with the diff scan plus the pre-first-publish manual review.

**Reset direct on `dev`, linear history — chosen over resetting on the run branch.**

- Gain: the reset happens before the pipeline mints `feat/{FID}`, on the C1-verified path; `dev` history reads as the experiment index; ledger appends stay linear so no conflict path engages.
- Sacrifice: the runner writes `dev` directly, so `dev` must not be branch-protected (or must carry an explicit bypass), and `dev`'s badge goes green on every reset push rather than showing the run. Accepted; the PR-only step placement keeps the checks meaningful.

**Always-latest + version grouping — chosen over an exact pin.**

- Gain: every run exercises bkit's upgrade path (a canary the pinned model never had), and grouping by the recorded `bkitVersion` keeps a release-straddling sweep comparable.
- Sacrifice: a breaking release blocks the sweep at reset, and "one sweep" is never one cohort across a release. Accepted because the assertion battery makes the block loud and the version column makes the split honest.

**Results in the repo's own ledger, read raw at report time — chosen over an aggregate store or benchmark tooling.**

- Gain: zero new tooling, raw rows stay the source of truth, and a ledger-shape change is contained to report time; no separate ref or store to protect.
- Sacrifice: running N times and computing a median is human labour, and the median/attempt accounting lives in prose; `.bkit/stats.jsonl` grows unbounded (bkit warns at 5000 rows, no rollup). Accepted because a run is human-in-loop regardless, so tooling cannot remove the human cost, only add a system to maintain.

**Sentinel + privacy as PR-only steps — chosen over post-merge or every-push checks.**

- Gain: the built page exists and the diff is reviewable at exactly the point the check runs; reset pushes keep `dev` green; the privacy scan sits before the merge it should block.
- Sacrifice: the merge gate depends on a PR-time step inside the capstone job, so the capstone must stay a single job (or the sentinel/privacy must be `needs:`-wired). Accepted to keep the capstone one job and the pass/fail signal legible.

**Screenshot unchecked by CI; cost unmeasured — chosen over a browser gate and a usage-tracking source.**

- Gain: no browser and no flaky grader in the pass/fail path; no substrate built against a cost spec that does not exist.
- Sacrifice: a broken painter can ship green (the watching user is the check), and "cheaper" cannot be claimed today — only wall time and counters are comparable. Accepted per #232 and the absence of any token/cost source.

## Risks & Open Questions

**Risks**

- **Reset scope is the one destructive op.** A widened path (`rm` at root or `.bkit/`) destroys the accumulated benchmark history; a renamed fixture commits a pure deletion of the app. Mitigated by scoping the delete to `example/`, asserting the resolved path, and asserting the fixture (sentinel present) before mutating.
- **Always-latest puts bkit's upgrade path on the benchmark's critical path.** A breaking release blocks the sweep **at reset** — loud (the assertion battery fires), but the sweep is down until bkit ships a fix, and cohorts split across the release. Grouping saves comparability; the pin model never exercised this path.
- **Public makes privacy load-bearing.** Run artefacts leak absolute home paths even with zero secrets; worktree setup copies `.env` / `.env.local` into worktrees. The diff scan (secret + path shapes) and the pre-first-publish manual review are the floor; GitHub push protection only catches known secret shapes.
- **The double-click demo depends on a contract one edit from silence.** Adding `"type": "module"` (fixture `package.json`) or a `type="module"` script tag blanks the off-disk page while `node --test` may stay green. The plain-script rule is stated in the feature request, the fixture and the contract table; `node --test` covers the dual-load guard (spike C3).
- **The root harness is never refreshed by resets.** `bkit-ci.yml`, the gate stubs and the capstone name drift from source; the magic string `bkit-tests-check` lives in both the harness `package.json` and the yaml. `--bootstrap` verify-mode is the repair path.
- **Sentinel rot.** Editing the placeholder copy can drift the sentinel between fixture and check; the built page quoting the sentinel false-fails. The feature request forbids quoting, and the sentinel is unguessable.
- **Ledger growth and single-writer appends.** `.bkit/stats.jsonl` grows unbounded (5000-row warning, no rollup); overlapping runs conflict on every append-at-EOF ledger. Serial topology is the invariant; growth is accepted and stated.
- **Human hard stops bound automation.** Design and plan end awaiting a human, so N runs = N human sessions under every approach; scheduling and cost claims must price human time.
- **AI non-determinism (#232).** Pass/fail (tests green, sentinel gone, PR merged) is robust; "the reviewer caught the planted trap" is measured, never gated, and the demo must not promise a catch.
- **Failed runs leave clutter that must not be "helpfully" merged.** Unmerged red PRs and stale feat branches accumulate; the exclusion rule (medians over completed runs only) is written down so nobody merges a red PR to tidy up and poisons the dataset.
- **Node version is an unrecorded benchmark variable unless pinned.** The GH image moves; `node --test` semantics can shift under the same bkit version. Pin in the capstone and record per run.
- **`main` mirror drift.** `main`'s fixture and bkit's `examples/bkit-explainer/` are two copies; only bootstrap re-syncs them. A stale `main` silently runs the wrong start state.
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
- **How is the `dev` reset push serialised against concurrent runs?**
  - A: Documented serial invariant only (human cadence) — matches the human hard stops.
  - B: A `concurrency` guard on the runner (a lock file or a git ref check) that refuses a second run.
  - C: A remote lock label/issue check.
  - **Recommended:** A now, with B noted as the mechanical upgrade if a parallel attempt is ever observed.
  - **Default if unanswered:** A.
- **Which Node version is pinned in the capstone, and is it recorded per run?**
  - A: Pin a specific LTS in `bkit-ci.yml` and record it with each run (e.g. in the README median table).
  - B: Let the GH runner image default decide, and record nothing.
  - C: Pin in the workflow but do not record it.
  - **Recommended:** A — the image moves, and an image change must not masquerade as a cohort difference.
  - **Default if unanswered:** A.
- **Where does the screenshot live, and how much accumulation is acceptable?**
  - A: Committed under the run's `docs/plans/…/logs/screenshot-run{N}.png`, post-merge from `dev` tip; never pruned; ~0.3 MB/run stated.
  - B: An untracked artefact outside the repo (no public evidence).
  - C: A branch or release asset.
  - **Recommended:** A — the artefact is a published-evidence signal and the never-prune rule already governs `docs/`.
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
