# Design: bkit Example Project — Interactive Pipeline Explainer

## Related Issues

- #505 — Root README sells bkit for the public launch (closed)

## Acceptance Scenario

Initial draft.

### Narrative

A maintainer runs one command and gets a fresh private repo with bkit installed and a feature request already filed. They start the pipeline and watch bkit design, plan and build an interactive page that explains bkit's own phases and loops, stopping twice for their sign-off and merging the result. They then repeat the run a few times and compare wall time and counters, to see whether a change to the prompts actually made bkit faster, cheaper or more reliable.

### Success Criteria

1. `node scripts/example/new-run.mjs` creates a fresh private GitHub repo whose root is a byte-identical copy of `examples/bkit-explainer/`, with bkit installed, the `github` tracker wired, and the start command printed.
2. A run reaches a merged PR in that repo with `node --test` green, and the built page opens by double-clicking `index.html` with no server.
3. The throwaway repo's `bkit-ci.yml` reports a `bkit-tests-check` job present and green at PR head, so `/bkit-ship`'s merge gate is satisfied.
4. Repeating the setup script N times yields N independent throwaway repos that each start from the same fixture; wall time and counters are readable from the harvested `status.jsonl` and `.bkit/stats.jsonl`.
5. Nothing measured can fail a run: pass/fail is `node --test` green plus merged PR, and nothing else.

### Key Edge Cases

- **Gate-chain growth (drift):** a bkit release adds or renames a script in the seeded `bkit:gate:*` chain, so the fixture's pre-declared scripts stop satisfying it — silently, because the advisory only fires on _missing_ names, never on a chain that grew.
- **Tracker default (silent failure):** `bkit install` without `--tracker=github` records `issueTracker: "none"`, and every workflow renders `_No tracker connected, skip step._` with no error, no gate and a demo that never touched the tracker.
- **AI non-determinism (cross-feature, #232):** a run may not catch a planted trap; the catch is measured, never gated, so the demo narrative must not promise it.
- **Human hard stops (concurrency):** design and plan end awaiting a human, so a run is never unattended and N runs are inherently human-in-loop — benchmark scheduling and cost estimates must account for this.
- **Evidence loss on teardown (failure mode):** deleting a failed throwaway repo destroys the only diagnosis surface; ledgers must be harvested before any teardown.
- **`[skip ci]` at HEAD (KN-11):** empties `statusCheckRollup`, so the merge gate sees no capstone at all and ship refuses.
- **Actions-minutes quota:** private throwaway repos consume the maintainer's own minutes; a ten-run sweep can stall mid-sweep on a free-tier account.
- **Off-disk page (cross-feature):** logic loaded as `type="module"` is blank when `index.html` is opened by double-click — the tests stay green while the demo silently breaks.

### Process Sketch

- WHEN the maintainer runs the setup script → THEN preflight `gh auth` / Node ≥ 20 / pnpm → create a private repo → copy the fixture to its root → `pnpm install` → `bkit install --tracker=github` → commit → print the start command.
- WHEN the maintainer starts the pipeline with the filed issue → THEN design → human sign-off → plan → human sign-off → build → PR opened.
- WHEN CI runs `node --test` → THEN `bkit-tests-check` is green at PR head → THEN ship merges into `dev`.
- WHEN a planted trap is missed → THEN `node --test` fails → THEN the debug loop runs and retries.
- WHEN the run ends → THEN harvest `status.jsonl` + `.bkit/stats.jsonl` before teardown → delete a green repo, keep a red one.
- WHEN the maintainer repeats the run N times → THEN read the middle wall time and counters from the harvested raw rows.

## Reuse & Prior Art

| Capability                                                  | Prior art                                                                                                                         | Verdict  | Why                                                                                                                                                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A versioned example project under `examples/`               | `None` — searched repo root, `.bkit/`, `scripts/`, `tests/`; no `examples/` exists today                                          | `NEW`    | No existing artifact covers a runnable example; the issue prescribes `examples/` as its home.                                                                        |
| Repo-side maintainer helper script                          | `scripts/readme/readme-art.mjs`, `scripts/ci/lanes/*.mjs`, `scripts/slop/*.mjs`                                                   | `EXTEND` | Same `scripts/<area>/*.mjs` pattern: add `scripts/example/new-run.mjs`, matching closest equivalent.                                                                 |
| Throwaway private-repo creation                             | `gh repo create --private` (gh CLI); `tests/fixtures/gh/bin/gh` stub shows the shape                                              | `EXTEND` | Reuse `gh` directly; no new tooling, no wrapper.                                                                                                                     |
| Installing bkit into the throwaway repo                     | `bkit install` / `--tracker` flag — `.bkit/core/engine/commands/install/install.ts:249`                                           | `EXTEND` | Reuse the real installer with an explicit tracker flag; never reimplement install.                                                                                   |
| Satisfying the local gate chain (`bkit:gate:static-unit`)   | Seeded add-if-missing scripts — `.bkit/core/engine/install/modules/core.ts:316`, `BKIT_GATE_SCRIPTS` in `install/manifest.ts:213` | `EXTEND` | Pre-declare the tool-script names the seeded chain calls, using the repo's own "skip if tool absent" idiom (`package.json` `lint` script). Never weaken a gate.      |
| Satisfying the ship merge gate (capstone job green at head) | `.bkit/templates/.github/workflows/bkit-ci.yml` (copy-and-own, ~1065 lines); `bkit.capstoneJob` default `bkit-tests-check`        | `EXTEND` | The template is copy-and-own and permits owning a reduced copy; own a hand-written ~40-line file with the single required job instead of adopting the full template. |
| Test runner for the built app                               | Node built-in `node --test` (`engines.node >= 20`)                                                                                | `EXTEND` | Already the intended runner and the issue's only CI check; adds zero dependencies.                                                                                   |
| Content data the built page reads                           | Fixed fixture data file, loadable by a classic `<script src>` off `file://`                                                       | `NEW`    | No existing content artifact encodes bkit's phase/loop skeleton; `data.js` is new data, not code.                                                                    |
| Benchmark measurement inputs                                | `.bkit/stats.jsonl` `outcome`/`counter` rows (`durationSeconds`, counters); `status.jsonl` steps                                  | `EXTEND` | The rows already exist; the benchmark is a reader, so no new artifact or record schema is added.                                                                     |
| Contract documentation for the example                      | `docs/templates/*`; `.agents/docs.md` doc index                                                                                   | `EXTEND` | Add `examples/README.md` contract table and register it in `.agents/docs.md`, following the existing docs-index pattern.                                             |
| A guard that reds bkit's own CI when the example breaks     | `.github/workflows/bkit-ci.yml` (bkit's own, with `bkit-tests-*` lanes)                                                           | `EXTEND` | Extend the existing workflow with one smoke job; no new workflow file. Requires human confirmation per `.agents/rules.md` § Code Changes.                            |

## Architecture

Three separable layers, each tiny; the layering is the cheap part and it is what turns "measurement never fails a run" from a convention into a boundary.

**1. Fixture (immutable, knows nothing about bkit's harness) — `examples/bkit-explainer/`**

The starting state, copied verbatim into a throwaway repo root. Data only; no app logic, no tests:

- `package.json` — `name`, no `"type"` key (so `.js` stays CommonJS in Node), exact-pinned `@cbartens/bkit` devDependency, `packageManager` pin, the pre-declared gate tool scripts, and a `bkit` block (`issueTracker: "github"`, `capstoneJob: "bkit-tests-check"`, `ciWorkflow: "bkit-ci.yml"`).
- `FEATURE-REQUEST.md` — the fixed, pre-written request the setup script files as the issue. Carries the content requirements, the four traps as plain requirements, the fixed filenames (`index.html` / `logic.js` / `data.js`), and the plain-`<script src>` / one-pure-function rules.
- `data.js` — the fixed content data (phases, loops, counters, transitions) as a classic-script-loadable plain JS file, never `.json` (a page opened off disk cannot `fetch`).
- `.github/workflows/bkit-ci.yml` — ~40 lines, one job named `bkit-tests-check` running `node --test`.
- `.gitignore`.

**2. Runner (bkit-side maintainer tooling) — `scripts/example/new-run.mjs`**

Owns throwaway-repo creation end to end: preflight, `gh repo create --private`, copy the fixture to the repo root (including `.github/`), `pnpm install`, `bkit install --tracker=github`, commit the starting state, print the start command. It also owns the benchmark's _inputs_ only — nothing that decides pass/fail. Never shipped in the fixture; keeps the fixture byte-identical across runs, which is what makes N runs comparable.

**3. Gate (independent of the runner) — the throwaway repo's own `node --test`, plus the merged PR**

The only thing that fails a run. `/bkit-build` Step 14 and the remediates run the seeded `bkit:gate:static-unit` chain; `/bkit-ship` refuses to merge unless the `bkit-tests-check` job is present and green at PR head. The runner never gates; the gate never measures.

**Boundaries**

- Fixture ↮ harness: the app never learns the harness exists; the harness never learns what the app does.
- Gate ↮ measurement: pass/fail is code-checked (`node --test` + merged PR); wall time, counters and cost are recorded and never fail a run.
- Runner ↮ repository semantics: the runner creates and seeds a repo, then stops; everything after is ordinary bkit-in-a-consumer-repo.

**Integration points**

`gh` CLI (repo create, clone, push) · pnpm / Corepack (`packageManager` pin) · `bkit install --tracker=github` · seeded `bkit:gate:*` chain · `bkit.capstoneJob` / `bkit.ciWorkflow` merge-gate contract · GitHub Actions (the throwaway repo's own CI) · GitHub Issues tracker wired into the throwaway repo · bkit ledgers (`status.jsonl`, `.bkit/stats.jsonl`) for measurement.

**Deliberately outside the boundary**

No hosting, no deploy, no packages, no secrets, no private-registry auth (the package is public on npmjs today, which makes the issue's later-idea-7 GitHub Packages premise stale). No second harness, no record schema, no metrics/report layer.

## Data Model

No database. Three schemas are load-bearing: the fixture's `package.json`, the fixed content data, and the ledger rows the benchmark reads.

**`examples/bkit-explainer/package.json`**

| Field                                                                         | Value / shape                                                                         | Why it exists                                                                                                                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                                                                        | `"bkit-explainer"`                                                                    | `bkit install` hard-fails (blocker `no-package-json` / missing `name`) without it.                                                                                                |
| `private`                                                                     | `true`                                                                                | Prevents accidental publish from the throwaway repo.                                                                                                                              |
| `type`                                                                        | _(absent)_                                                                            | Absent ⇒ `.js` is CommonJS, so the one logic file satisfies both `require` under `node --test` and a classic `<script src>`.                                                      |
| `packageManager`                                                              | `pnpm@<pinned>`                                                                       | Corepack resolves the same pnpm in the worktree installs the workflows trigger.                                                                                                   |
| `devDependencies["@cbartens/bkit"]`                                           | exact version (`"5.0.2"`, bumped deliberately after a 1-run canary)                   | The example IS a version-sensitivity instrument; a range mixes version drift into benchmark numbers.                                                                              |
| `scripts.typecheck`                                                           | `node --check logic.js && node --check data.js`                                       | Pre-declared so the seeded chain's `pnpm typecheck` resolves; the feature request fixes both filenames, so the check is deterministic and never depends on a name an agent chose. |
| `scripts.test`                                                                | `node --test`                                                                         | The only real check; the capstone runs the same thing.                                                                                                                            |
| `scripts.lint` / `format:check` / `lint:prose` / `slop:delta` / `lint-staged` | documented no-ops (the repo's own `lint` script shows the "tool absent ⇒ skip" idiom) | The chain calls them; the feature request must not claim they check more than they do.                                                                                            |
| `scripts.build`                                                               | no-op                                                                                 | `bkit:gate:install-static-unit-build` (ship's conflict-resolve path) calls `pnpm build`.                                                                                          |
| `bkit.issueTracker`                                                           | `"github"`                                                                            | Belt-and-braces alongside `--tracker=github`; the default `none` silently guts the demo.                                                                                          |
| `bkit.capstoneJob`                                                            | `"bkit-tests-check"`                                                                  | Names the merge-gate check ship requires.                                                                                                                                         |
| `bkit.ciWorkflow`                                                             | `"bkit-ci.yml"`                                                                       | Names the workflow file ship reads.                                                                                                                                               |

Seeded `bkit:gate:*` names are add-if-missing and are **not** pre-declared — `bkit install` writes them and never overwrites a consumer's version.

**`data.js` — fixed content data (new, no existing equivalent)**

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

| Row kind  | Fields consumed                                                                                   | Where               |
| --------- | ------------------------------------------------------------------------------------------------- | ------------------- |
| `outcome` | `durationSeconds` (per-phase wall time), `taskCount`, `reviewIterations`, `deferrals`, `failures` | `.bkit/stats.jsonl` |
| `counter` | `counterName`, `counterValue` (attempt counters, incl. debug retries)                             | `.bkit/stats.jsonl` |
| step rows | `workflow` / `step` / `status` / `at` — the phase timeline                                        | `status.jsonl`      |

**Relationships**

`package.json` declares the gate/merge contract → the seeded chain and `bkit-ci.yml` consume those names → the throwaway repo's CI emits the `bkit-tests-check` check → ship's merge gate reads that check. Independently, the run writes ledger rows → the benchmark's harvest reads them. The two chains must never meet: no ledger row may influence the gate.

## Components / Flows

**Component inventory**

| Component                      | Type                    | Owns                                                                                                                     | Must never                                                    |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `examples/bkit-explainer/`     | immutable fixture       | the starting state, byte-identical across runs                                                                           | contain app logic, tests, or any harness knowledge            |
| `examples/README.md`           | docs (bkit-side)        | the contract table: gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, harvest/median procedure | be copied into the throwaway repo (it would leak the traps)   |
| `scripts/example/new-run.mjs`  | runner (bkit-side)      | preflight, repo create, fixture copy, install, tracker wiring, commit, print                                             | gate anything; accumulate flags/reports no run needs          |
| throwaway repo's `node --test` | gate                    | pass/fail                                                                                                                | read measurement data                                         |
| throwaway repo's `bkit-ci.yml` | gate                    | exposing `bkit-tests-check` present + green at head                                                                      | adopt the full copy-and-own template; reintroduce `[skip ci]` |
| the built app's pure function  | fixture output (agents) | "which boxes are lit, which arrows are active, what each counter reads"                                                  | touch the DOM                                                 |
| the built app's painter        | fixture output (agents) | paints the pure function's return only                                                                                   | hold logic                                                    |
| bkit ledgers                   | measurement             | wall time, counters                                                                                                      | be consulted by any gate                                      |

**Flow — setup (runner)**

1. WHEN run → preflight `gh auth status`, `node --version >= 20`, pnpm resolvable; any failure stops before creating anything.
2. WHEN preflight passes → `gh repo create --private <name>`; print the URL.
3. THEN copy `examples/bkit-explainer/` verbatim to the repo root, including `.github/workflows/bkit-ci.yml` — the CI must exist before the first PR, because GitHub reads CI only from root `.github/workflows/`.
4. THEN `pnpm install` (materialises the pinned `@cbartens/bkit` and the lockfile so `--frozen-lockfile` works later).
5. THEN `bkit install --tracker=github`; commit the starting state; print the start command.

**Flow — demo (one run)**

1. WHEN the maintainer starts the pipeline with the filed issue → design (agents) → **hard stop for sign-off**.
2. THEN plan → **hard stop for sign-off**.
3. THEN build: agents write `index.html`, the one logic file and its `node --test` tests; four traps are caught only if review actually catches them.
4. THEN build Step 14 runs the seeded `bkit:gate:static-unit` chain; the PR opens; CI runs `node --test`; `bkit-tests-check` goes green.
5. WHEN the maintainer runs `/bkit-ship` → merge gate checks the capstone at head → squash-merge into `dev`. Production stays their call.
6. WHEN a trap is missed → `node --test` fails → the debug loop diagnoses, fixes and retries within its attempt budget.

**Flow — benchmark (N runs, no new tooling)**

1. WHEN the maintainer repeats the setup script N times → N independent throwaway repos, each starting from the same fixture.
2. WHEN each run ends → harvest `status.jsonl` and `.bkit/stats.jsonl` into a results dir **before** any teardown.
3. THEN apply the retention rule: delete green repos, keep red ones for N days.
4. THEN read the middle wall time and counters from the harvested raw rows and record them in the README's median table. No in-harness folding, no record schema; the raw rows stay the source of truth so a shape change is contained to report time.

**Flow — the built app (what the agents produce)**

1. `data.js` supplies the fixed skeleton; the pure function maps "position in the run" → `{ litBoxes, activeArrows, counters }`.
2. `index.html` holds the page and loads logic and data with ordinary `<script src>` tags (never `type="module"`), so double-clicking it works off `file://`.
3. The painter renders that return, and honours reduced motion with a step-by-step static view and full keyboard operability.
4. `node --test` requires the logic file directly, using the environment guard (export when `module` exists, attach a global otherwise), so the same bytes serve the browser and the test runner.

## Decisions

| Decided                                                                                                                                                           | Alternatives                                                                             | Why                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Three separable layers: immutable **fixture** / single bkit-side **runner** / independent **gate**                                                                | Self-contained portable example; run-record-first harness                                | Turns "measurement never fails a run" from a convention into a boundary. Self-contained under-separates gate from runner and duplicates the harness per example; run-record-first builds a substrate for a cost source that does not exist yet (YAGNI).                                                                  |
| The fixture ships **fixed inputs only** — no app skeleton, no pre-placed logic, no stub tests                                                                     | Ship `index.html` + logic stub + a `node --test` skeleton naming the trap cases          | A stub test that hints the expected counter turns a review trap into a given and shrinks what review visibly catches; more pre-built app means the demo shows bkit doing less. The demo's value is bkit building, not bkit finishing.                                                                                    |
| The fixture ships a `package.json` (deliberately, and with no `"type"` key)                                                                                       | No `package.json`, relying on `.js` defaulting to CommonJS                               | `bkit install` preflight **blocks** without a parseable `package.json` with a `name` (`.bkit/core/engine/checks/before/index.ts:137`) and without a git repo (`:143`). The "no package.json" premise was wrong; pinning `"type"` absent keeps `.js` CommonJS.                                                            |
| One logic file serves both the browser and `node --test`, via a one-line environment guard plus a classic `<script src>`                                          | `type="module"`; a build/copy step that strips exports; duplicated browser/node logic    | `file://` blocks modules, so `type="module"` breaks the double-click demo; a build step introduces tooling into a tooling-free project. The guard (export when `module` exists, attach a global otherwise) keeps one file honest under both.                                                                             |
| Content data is a classic-script `.js` file, never `.json`                                                                                                        | `fetch('data.json')`                                                                     | A page opened off disk has no server and cannot `fetch`; the requirement is double-clickable, so the data must arrive via a script tag.                                                                                                                                                                                  |
| Satisfy the gate chain by pre-declaring the tool-script names in the fixture `package.json`, implemented as Node-stdlib one-liners                                | Full real toolchain (prettier, vale, slop-scan, actionlint, husky); weaken or skip gates | Weakening gates is prohibited and would misrepresent the pipeline in the demo; the real toolchain multiplies flake and cost against a benchmark that must usually pass. Seeded `bkit:gate:*` chains are add-if-missing, so pre-declared names survive install.                                                           |
| Hand-write a ~40-line `bkit-ci.yml` with **one** job named `bkit-tests-check` running `node --test`                                                               | Adopt the ~1065-line copy-and-own template; rename the capstone via `bkit.capstoneJob`   | Ship's merge gate only requires the capstone present and green at head. The template is copy-and-own (never refreshed) and its gate semantics evolve with bkit — the single worst drift surface. One job also removes the executed-test-count wire between yaml and a wrapper script, which was a silent breakage point. |
| The setup script wires `--tracker=github` and preflights `gh auth` / Node ≥ 20 / pnpm                                                                             | Rely on `bkit install` defaults; document the flag                                       | `DEFAULT_ISSUE_TRACKER` is `"none"` (`install/manifest.ts:66`), which renders every workflow step as `_No tracker connected, skip step._` — no error, no gate. Highest-severity silent failure found.                                                                                                                    |
| Pin `@cbartens/bkit` to an exact version; set a `packageManager` pin; bump deliberately after a 1-run canary                                                      | `^` range; `latest`                                                                      | The example is a version-sensitivity instrument: an uncontrolled version mixes prompt-change effects with version drift in benchmark medians.                                                                                                                                                                            |
| Pass/fail = `node --test` green **plus** the merged PR; the drawing layer is not checked by CI                                                                    | AI grader; browser/Playwright test; DOM-snapshot test; coverage floor                    | Deterministic, no browser, no flaky grader in the path — matches the issue and #232's rule that flaky graders must never fail CI. In the demo the watching user is the check.                                                                                                                                            |
| Benchmark = documented manual N-run + pre-teardown harvest + a README median table; **no** `--runs N` flag and **no** metrics/report script                       | One runner with `--runs N`; a separate `benchmark.mjs`; a full harness with harvest/fold | The numbers already exist as raw rows; a report script is the drift surface the risk lens itself warns about (ledger shapes move). Keeping raw rows and computing at report time is that lens's own mitigation, satisfied with a README table and zero code.                                                             |
| Cost is recorded, never gating; no cost/token source is built now                                                                                                 | Add usage tracking to `.bkit/src/`                                                       | No token/cost data exists anywhere today (`.bkit/stats.jsonl` has only `compliance`/`counter`/`outcome` rows); the likely source is host session transcripts, one method per host. Building the substrate against a spec that does not exist is an honest YAGNI violation.                                               |
| Retention: harvest ledgers **before** any teardown; delete green repos, keep red ones N days                                                                      | Delete all; keep all                                                                     | Delete-all destroys the 3am diagnosis surface (the throwaway repo is the evidence); keep-all accumulates private repos and Actions-minutes history nobody asked for.                                                                                                                                                     |
| `examples/README.md` carries the contract table: gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, harvest/median procedure             | No docs; rely on the feature-request prose                                               | Three non-obvious contracts would otherwise live in one head; a well-meaning "simplify the example" edit removes the benchmark's teeth and nothing fails loudly.                                                                                                                                                         |
| Traps are stated once in the fixed feature request as plain requirements, with no hint at the mistakes                                                            | Pin the expected behaviour in the fixture                                                | Stating a trap as a requirement is what makes catching it evidence of review quality; pinning the answer converts it into a given.                                                                                                                                                                                       |
| Add a smoke job to **bkit's own CI** that runs the example's stub gates + `node --test` fixture                                                                   | No source-side guard; rely on pinning plus a manual canary                               | The example's breakage modes are invisible from bkit's green CI; the source-side smoke job reds the breaking commit instead of the next demo user. Requires explicit human confirmation (`.agents/rules.md` § Code Changes: CI edits).                                                                                   |
| One pure function answers "which boxes are lit, which arrows are active, what each counter reads"; the painter paints only its return; content lives in `data.js` | Logic inside the render code; DOM-snapshot tests                                         | Keeps all four traps checkable in Node with no browser, and keeps the drawing layer thin by construction.                                                                                                                                                                                                                |
| The runner is a repo-side `scripts/example/*.mjs`, not shipped inside the fixture                                                                                 | Copy the runner into the throwaway repo and run it there                                 | Keeps the throwaway repo = what bkit builds; the runner is maintainer tooling and matches the existing `scripts/readme/readme-art.mjs` pattern.                                                                                                                                                                          |
| The nine "later ideas" from #504 and the tracker-`none` install-advisory idea are **out of scope for this cycle**, recorded in `docs/deferrals.jsonl`             | Fold any of them into this cycle                                                         | The issue keeps one simple feature on purpose: every addition makes a run longer and more expensive, the benchmark needs something that usually passes, and the demo must be affordable for a new user.                                                                                                                  |

## Approaches Considered

| Approach                                                                                                                    | Lens             | Verdict    | Why                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Thin fixture + one flag-driven runner** (`examples/` data-only folder; one `scripts/example/new-run.mjs`; `--runs N`) | Pragmatic        | `MERGED`   | The runner-as-repo-side-tooling call, the fixture-copied-to-repo-root call and the "traps stated once" call are all adopted. Its `--runs N` flag and its "no `package.json`" premise are dropped — see Decisions.                              |
| **B — Scaffolded fixture** (pre-placed page shell, logic stub, test skeleton)                                               | Pragmatic        | `REJECTED` | A stub test that hints the counter turns a review trap into a given; more pre-built app means the demo shows bkit doing less. Its own stated leak risk is decisive.                                                                            |
| **C — Split demo and benchmark tooling** (second `benchmark.mjs`, N-repo teardown)                                          | Pragmatic        | `REJECTED` | Two copy paths drift; over-tooled when the measurement data already exists as raw rows. Rejected by its own YAGNI argument once the report script is dropped.                                                                                  |
| **A — Layered example kit** (fixture knows nothing of the harness; gate independent of the runner)                          | Optimal-tradeoff | `KEPT`     | Encodes the issue's load-bearing constraint as a boundary rather than a convention, and absorbs a second example or per-host comparison without the app learning the harness exists. Its structure is the base.                                |
| **B — Self-contained portable example** (whole harness inside `examples/<name>/`)                                           | Optimal-tradeoff | `REJECTED` | Under-separates gate from runner, duplicates a near-identical seed script per example, and half the harness ends up bkit-side anyway (worst of both).                                                                                          |
| **C — Run-record-first harness** (a machine-readable run record as the primary artifact)                                    | Optimal-tradeoff | `REJECTED` | Builds a record schema and reader for a cost field that ships empty because no source exists; a general harness for a single example fights the issue's "one simple feature" rule.                                                             |
| **A — Zero-Dependency Contract Stub** (pre-declared Node-stdlib gate scripts + ~40-line capstone CI)                        | Risk premortem   | `KEPT`     | The only lens grounded in the installed payload's verified contracts (install blockers, add-if-missing seeding, capstone merge gate, tracker default). Its mitigations are layered on, not treated as a separate approach.                     |
| **B — Full-Template Consumer Fidelity** (adopt the copy-and-own `bkit-ci.yml` with the real toolchain)                      | Risk premortem   | `REJECTED` | Multiplies flake surface (pinned vale/actionlint downloads) against a benchmark that must usually pass, costs 5–10× the CI minutes, and is the worst drift mode: copy-and-own never refreshed while gate semantics evolve.                     |
| **C — Harness-First Benchmark Rig** (loop N runs, fold ledgers, medians, teardown policy in code)                           | Risk premortem   | `REJECTED` | Highest bus factor of the three and cannot remove the human hard stops anyway; in-harness folding amplifies ledger-shape drift. Its mitigations (raw rows, report-time computation, documented manual path) are adopted as the benchmark flow. |

**Risk-premortem mitigations layered onto the kept approach (additive, not a separate approach):** pin `@cbartens/bkit` exact and `packageManager`; preflight `gh auth` / Node ≥ 20 / pnpm; copy CI into root `.github/workflows/` **before** the first PR; `bkit install --tracker=github`; honest stub scripts scoped to what they actually check; `examples/README.md` contract table; harvest-before-teardown retention; and the bkit-CI smoke job.

## Trade-offs Accepted

**Three-layer separation (fixture / runner / gate) — chosen over a self-contained example.**

- Gain: the "measurement never fails a run" constraint is structural, not remembered; the fixture stays byte-identical across runs, which is what makes N runs comparable; a second example is a new fixture folder.
- Sacrifice: two seams must stay honest (gate stays `node --test`-only; runner stays measurement-input-only), and the smallest version of the demo now touches two directories instead of one. Accepted because the seam discipline is exactly what the issue asks for.

**Fixture ships fixed inputs only — chosen over a scaffolded fixture.**

- Gain: catching a planted trap is real evidence of review quality, and the demo shows bkit building, not finishing.
- Sacrifice: run-to-run variance is higher (agents own the page shape and the tests), so a run can mistime a trap. Accepted because the gate does not depend on the catch, and pass/fail stays robust.

**Pre-declared Node-stdlib gate stubs — chosen over the real toolchain and over weakening gates.**

- Gain: the benchmark measures the pipeline, not the gates; the CI stays page-readable at 3am; stub scripts are honest about what they check.
- Sacrifice: the example does not demonstrate bkit's real local gate surface, and the `--frozen-lockfile`/`build` path is satisfied by no-ops. Accepted because the alternative is either flake against a must-usually-pass benchmark or weakening a gate.

**Hand-written 40-line CI — chosen over adopting the copy-and-own template.**

- Gain: one job, no lane graph, no SHA-pinned third-party downloads, no executed-test-count wire to break silently; the merge-gate contract is met at minimum weight.
- Sacrifice: the example is not a reference for a real consumer's CI, and the template's (unexercised) protection against skipped lanes is absent. Accepted because the throwaway repo has one lane and one test command.

**Benchmark as a documented manual procedure — chosen over `--runs N` and over a harness.**

- Gain: zero new tooling, raw rows stay the source of truth, and a ledger-shape change is contained to report time.
- Sacrifice: running N times and computing a median is human labour, and the retention/median policy lives in prose rather than code. Accepted because a run is human-in-loop regardless (hard stops after design and plan), so automation cannot remove the human cost — it can only add a second system to maintain.

**Drawing layer unchecked by CI — chosen over a browser test.**

- Gain: no browser in the pass/fail path, no flaky grader, no new dependency.
- Sacrifice: a broken painter can ship green. Accepted because the layer is thin by construction and, in the demo, the watching user is the check; a single browser test can be added later if the benchmark needs it.

**Cost unmeasured — chosen over building a usage-tracking source now.**

- Gain: no substrate built against a spec that does not exist; no host-specific transcript scraping invented for one example.
- Sacrifice: "cheaper" cannot be claimed; only wall time and counters are comparable today. Accepted as an explicit open question, reported honestly rather than estimated.

## Risks & Open Questions

**Risks**

- **Gate-chain growth breaks every approach.** A new script name in the seeded `bkit:gate:*` chain fails the example regardless of stub or template; `gate-missing-called-scripts` fires only for _missing_ names, never for a chain that grew. The bkit-CI smoke job is the only mechanism that reds the breaking commit at the source.
- **Tracker-default-`none` is silent.** No error, no gate — workflows render skip-stubs and the demo narrates a pipeline that never touched the tracker. Mitigated by preflight plus an explicit `--tracker=github`, not by any gate.
- **Human hard stops bound automation.** Design and plan end awaiting a human, so "run it several times" is human-in-loop per run under every approach. Benchmark scheduling and cost estimates must account for this; it also caps how much of any harness is ever buildable.
- **AI non-determinism vs "usually passes".** Pass/fail (logic tests green, PR merged) is robust; "the reviewer caught the planted trap" is not guaranteed per run and must stay measured-never-gated, consistent with #232's flaky-grader rule. The demo narrative must not promise a catch.
- **Ledger shape drift.** `outcome` rows gained a `coverage` field within recent versions — proof the shapes move. Keeping raw rows and computing at report time contains this; in-harness folding would amplify it.
- **Actions-minutes quota.** Private throwaway repos consume the maintainer's own minutes; a ten-run benchmark can stall mid-sweep on a free-tier account. Surface expected consumption in `examples/README.md`.
- **Skeleton stability is real but not frozen.** Phase names, loop caps (`MAX_DEBUG_ATTEMPT`) and hard-stop placement are the explainer's content; they are stable across versions but not immutable, so `data.js` slowly lies without a documented owner-check per release.
- **Stale premise in the issue.** Later-idea 7 assumes GitHub Packages with `access: 'restricted'`; `@cbartens/bkit` is public on npmjs today. No private-registry auth may enter any publish path.
- **Dual-load contract is one edit away from silence.** Adding `"type": "module"` to the fixture `package.json` (or a `type="module"` script tag) breaks the off-disk page while `node --test` may stay green. The plain-script rule must be stated in the feature request, the fixture, and the README contract table.
- **The contract table must not travel.** `examples/README.md` documents the traps and the capstone contract, so it must stay outside the copied fixture; copying it into the throwaway repo would leak the answer to the agents.

**Open Questions**

- **What does one full run cost?** No token/cost source exists (`.bkit/stats.jsonl` has only `compliance`/`counter`/`outcome` rows).
  - A: Defer entirely — record wall time and counters only, report cost as unmeasured.
  - B: Build a Claude Code session-transcript reader (usage per message) and leave other hosts to their own methods.
  - C: Read host transcripts generically behind one `cost` field in a new record.
  - **Recommended:** A — the source does not exist yet, and B/C build substrate for a spec that is not settled.
  - **Default if unanswered:** A.
- **Does the benchmark ship any tooling?**
  - A: No tooling — documented manual N-run + harvest + a README median table.
  - B: One `--runs N` flag on the existing setup script.
  - C: A separate harness that loops runs, harvests and folds medians.
  - **Recommended:** A — a run is human-in-loop regardless, so tooling cannot remove the human cost and only adds a system to maintain.
  - **Default if unanswered:** A.
- **Should bkit's own CI carry the example smoke job?** (Editing `.github/workflows/*` requires explicit human confirmation.)
  - A: Add one smoke job running the example's stub gates + `node --test` fixture.
  - B: No source-side guard; rely on the version pin plus a manual canary per release.
  - C: Add it but only as a non-blocking report job first.
  - **Recommended:** A — it is the only guard that reds the breaking commit instead of the next demo user; C delays the protection the design exists to buy.
  - **Default if unanswered:** B, with the pin and a documented per-release canary.
- **Which exact bkit version is pinned, and when is it bumped?**
  - A: Pin `5.0.2` and bump per bkit release only after a 1-run canary.
  - B: Pin `^5` and let minor/patch drift in.
  - C: Pin nothing; install latest at run time.
  - **Recommended:** A — the example is a version-sensitivity instrument, so an uncontrolled version contaminates benchmark medians.
  - **Default if unanswered:** A.
- **Is the drawing layer ever checked?**
  - A: No — the watching user is the check; the layer is thin by construction.
  - B: Add a single Playwright/browser test once the benchmark needs it.
  - C: Add a DOM-snapshot test in `node --test`.
  - **Recommended:** A — keeps the pass/fail path browser-free and deterministic, matching the issue and #232.
  - **Default if unanswered:** A.
- **Should `bkit install`/`bkit doctor` warn when the tracker is `none` in a pipeline repo?**
  - A: Out of scope this cycle; recorded as a deferral row.
  - B: Add an install advisory naming `--tracker=github` as the fix.
  - C: Make `none` a hard blocker for install.
  - **Recommended:** A — it is bkit-side behaviour change, not part of the example; the deferral row keeps it visible.
  - **Default if unanswered:** A.
- **How long are failed throwaway repos kept?**
  - A: 7 days, then delete by a documented `bkit-example-run-*` name sweep.
  - B: Indefinitely until a human deletes them.
  - C: Until the next successful run of the same fixture version.
  - **Recommended:** A — bounded evidence retention without unprompted repo accumulation; the sweep name makes it mechanical.
  - **Default if unanswered:** A.
- **Who re-checks `data.js` against the current skeleton, and when?**
  - A: The per-release canary run owner checks the phase list as part of the canary.
  - B: A dedicated audit template run per release.
  - C: Nobody; the smoke job covers code drift only.
  - **Recommended:** A — it rides a human-in-loop step that already exists, so it adds no new ceremony.
  - **Default if unanswered:** C, with the staleness risk recorded here.
