<!-- bkit:anchor
baseSha: 37b4c707a65a6819236a0ae834ef988af9e93f73
baseRef: origin/dev
designPath: docs/plans/202610/504-example-project-design.md
designBaseSha: 778cd47bfb7f2941e6e812ccb69c9308cb6bb971
-->

Verdict: PASS
<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is also stamped with a `bkit:anchor` block recording its base commit; never hand-author or edit it. `@bkit-plan-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.0.3 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# bkit Example Project — Interactive Pipeline Explainer Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.
>
> **Rules:**
>
> - Any tools mentioned below are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Source of truth: literal `[x]` vs `[ ]` checkboxes in this document; `[ ]` means not DONE regardless of context.

## Context & Goals

Build the **bkit-side tooling for the example project** (#504): an immutable fixture, a durable run-repo harness, a hand-written capstone workflow, a maintainer runner, a bats verification suite, and two bkit-side contract docs (a contract table + an AI run-analysis prompt). This cycle does **not** build the interactive explainer app itself — that is produced by a _run_ of the bkit pipeline in the separate public run repo. Scope is WS-1…WS-9 of the parent design.

Why: give bkit a single, re-runnable benchmark/demo — one persistent public repo whose history is the run history. Each run resets only the app folder (`example/`) from the fixture, installs the latest bkit, runs design → plan → build → ship, and its numbers accumulate in the repo's tracked `.bkit/stats.jsonl`. The only binary is **run completion** (outcome-based); everything else is recorded and analysed (trajectory-based). Fixture lives in **bkit** (`examples/bkit-explainer/`); runs and their evidence live in the run repo (`cbartens/bkit-example`).

> Success criteria once in `Acceptance Scenario → Success Criteria`; each runbook task has own `Done when`. Do not restate success list here.

**Related Issues:**

- #43 — eval tiers this slots into; measurement-vs-pass/fail (Ponytail findings) (open)
- #45 — per-host evidence this would supply (open)
- #232 — the shipped online compliance checks; flaky/AI graders must never fail CI (open)
- #505 — Root README sells bkit for the public launch (closed)
- #528 — ci: reuse the dev push run for promotion PRs (closed)
- #408 — Publish @cbartens/bkit publicly on npmjs (closed)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Spec

> [!IMPORTANT]
> What good looks like; canonical for the plan phase. Subagents (plan generate, plan review, plan summary) must follow this spec. No plan subagent restates rules; this section = single source of truth for the plan.

- **Narrative:** 1–2 sentences, user POV (not system POV). User action + what they get back. Design → verbatim. Audits only (`docs/audits/`) → user/operator impact from in-scope findings. Neither, or design lacks `## Acceptance Scenario` → both fields = `⚠️ MISSING: no design doc and no audit report — human must provide before plan proceeds`; never fabricate; Gate 1 blocked until human fills.
- **Success Criteria:** <=5 bullets, measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), not steps (e.g. "call API, render component"). Design count ≠ 5 → smallest set proving feature. Design → verbatim. Audits only → one bullet per in-scope finding id from `Expected`; no 5-bullet cap.
- **Process Sketch:** Design → plan inherits/refines. same happy-path (`Concrete Example`) + branches (`Edge Cases`) as `WHEN X → THEN Y` (3–7 lines); reuse exact examples, do not invent. Outcomes, not steps.
- **Key Edge Cases:** Design → plan inherits. Concurrency, conflicts, failures, cross-feature — not trivial validation (plan adds that).
- **Edge Cases:** Plan phase — design Key Edge Cases verbatim + validation / error / boundary cases.
- **Concrete Example:** Plan phase only. Role, starting state, numbered steps, observable outcome. One scenario, not a list.
- **Derived Test Matrix:** Plan phase only. One row per testable behaviour → exactly one `Agent Execution Runbook` task. No row without a target file. In-scope audit behaviour → one row.

### Narrative

> Inherited from design; do not rewrite.

A maintainer runs the repo tooling once in bootstrap mode to create the persistent public example repo, then runs it per experiment: it resets the example app folder on `dev` to the canonical fixture, installs the latest bkit, files the fixed feature request as an issue and prints the start command. They start the pipeline, sign off after design and after plan, and bkit builds an interactive page that explains bkit's own phases and loops inside that folder, then merges it — the repo always shows the same example folder, its git history is the run history, and the accumulated `.bkit/stats.jsonl` holds every run's numbers. They repeat the run a few times and read the middle wall time and counters, grouped by the recorded bkit version, to tell whether a change made bkit faster, cheaper or more reliable; CI captures a screenshot of the built page as a per-run build artefact (never gating), and an AI analysis prompt run after the run stops produces a scored report of how the run went and how near the ideal it landed; a visitor to the public repo sees the same folder, the same history and the same evidence.

### Success Criteria

> Inherited from design; do not rewrite.

1. `node scripts/example/new-run.mjs --bootstrap` creates the public repo `cbartens/bkit-example` **once** — canonical fixture on `main`, a pushed `dev` — and is idempotent (re-run verifies and repairs drift, never creates or deletes the repo); a half-seeded state (create succeeded, seeding failed) is repaired by re-running it. The canonical fixture lives in **bkit** at `examples/bkit-explainer/`, versioned with bkit; the run repo holds only produced output and run evidence, and the pipeline never runs inside bkit.
2. A run resets **only** the app folder (`example/`) from the fixture as one commit on `dev`, runs `pnpm install` against the committed `pnpm-lock.yaml`, installs the latest `@cbartens/bkit` with `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github`, reads the `github` tracker back, and reaches a merged PR with the portable test invocation (`cd example && node --test`) green and the placeholder sentinel gone from the built page.
3. The repo's own capstone `bkit-tests-check` is present and green at PR head, so `/bkit-ship`'s merge gate is satisfied; the gating steps are the tests step (`cd example && node --test`) and the every-push privacy scan, while the PR-only sentinel check is scoped to pull requests, so a reset push to `dev` never reds.
4. Results live in the repo's tracked `.bkit/stats.jsonl`, which accumulates across runs because the reset never touches it; reading it directly and grouping `outcome` rows by `bkitVersion`, then run-scoping each cycle by the **run marker** (the reset commit / filed issue #) — never by `parentSha`, which is per-workflow-step and forensic (`ledgers/status.ts:14-16`) — yields one comparable result per run: no separate aggregate store, no new format, no report code.
5. Nothing measured can fail a run: pass/fail is **run completion** alone (design → plan → build → ship, capstone green at the merged PR); executed-test count, trap-catching, the blank-page / classic-script result, retries and loops, divergence from ideal, wall time, counters, the screenshot and cost are recorded and analysed, never gated (#232).
6. CI captures a screenshot of the built page at PR head with `continue-on-error: true` — never gating, a CI-only dependency (headless browser), never an app dependency (the app keeps no packages, no secrets); a failed capture warns loudly and never fails the run. CI stays **read-only** (no `contents: write`, no bot commit, no write-back): an uploaded artefact is at most a transfer/staging step, **never** the record.
7. An AI analysis prompt (`examples/analysis-prompt.md`, bkit-side, **never published** into the run repo) runs after the run stops — completed or aborted — reads the run's artefacts, and commits the **scored report** plus the run's screenshot into the run repo as the permanent evidence record (report beside the run's `status.jsonl`, screenshot beside the report; the run repo is the single evidence store — produced app, screenshot, report, `.bkit/stats.jsonl` numbers); the report records the run's **merge SHA** and `bkitVersion`, so two runs are compared as a diff of their merge SHAs; non-gating, and grouped by `bkitVersion` with the run so scores stay comparable.

> **Plan-scope note:** Success Criteria 1–3, 6, 7 describe run-repo behaviour exercised by a _run_; **this cycle** delivers the bkit-side artefacts that make those criteria achievable (fixture, harness, workflow, runner, docs) and the bats suite that verifies the runner's local halves. Criteria 4–5 describe the read/measurement model this cycle documents (WS-5/WS-7) but does not compute.

### Process Sketch

> Inherited from design; plan may refine. `Concrete Example` (happy path) + `Edge Cases` (branches) as `WHEN X → THEN Y`, not prose — same examples. Do not invent new examples. Sense-check top-level process HERE without prose below. Outcomes, not implementation steps.

- **WHEN** the maintainer runs `new-run.mjs --bootstrap` **→ THEN** create (or, if it exists, verify and repair) the public repo with the canonical fixture on `main` and a pushed `dev`; normal runs never create or delete it.
- **WHEN** the maintainer runs the runner for a run **→ THEN** preflight (fixture present with its sentinel, `main` still carries the fixture, `git status` clean and `dev == origin/dev`, `gh auth`, Node ≥ the pinned LTS, pnpm) → reset **only** `example/` from the fixture as one commit on `dev` (post-delete check that every removed path resolved inside `example/`) → `pnpm install` → `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github` → read tracker/version/gate-chain back → push → file the issue → print the start command; one `[bkit-example]` line per transition.
- **WHEN** the maintainer starts the pipeline **→ THEN** design → hard stop → plan → hard stop → build (agents write `index.html`, the logic file and its `node --test` tests) → PR opened.
- **WHEN** CI runs **→ THEN** on **every push** the tests step runs `cd example && node --test` and the privacy scan reads the diff → at PR head the sentinel must be gone, and the executed-count and classic-script assertions are recorded (non-gating), with the screenshot captured and uploaded (non-gating) → **THEN** `/bkit-ship` merges into `dev`; a reset push to `dev` runs the tests and privacy steps only.
- **WHEN** a planted trap is missed **→ THEN** `node --test` fails → the debug loop diagnoses, fixes and retries within its attempt budget.
- **WHEN** the run stops (completed or aborted) **→ THEN** run the analysis prompt against the run's artefacts → a scored report lands beside the run's `status.jsonl` → read the middle wall time, counters and scores from the repo's `.bkit/stats.jsonl` and the reports, grouped by `bkitVersion`.

### Concrete Example

> Plan expands from design.

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

> Plan expands from design's Key Edge Cases.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Reset scope widened (bug deletes at root or `.bkit/`) | Delete scoped to `example/` only; resolved path asserted before delete AND every removed path verified after; never touches `.bkit/`, `docs/`, root harness |
| Reset on `main` / pre-cut `feat/*` | Reset lands **direct on `dev`** via one commit; `feat/{FID}` is minted later by `bkit worktrees setup` off `origin/dev` (spike C1) |
| Two concurrent runs append ledgers at EOF | Serial topology is the invariant; preflight refuses when `origin/dev` carries an unmerged reset commit (explicit `--force-run` override) |
| `bkit install` recorded `issueTracker: none` | Runner reads `bkit.issueTracker` back after install and stops unless `github` |
| `bkit install --tracker=github` alone | Runner always passes `--claude` (spike C5, DISPROVEN: bare `--tracker` exits 1 mid-sequence) |
| A bkit release adds/renames a `bkit:gate:*` script | Runner asserts every seeded `bkit:gate:*` script resolves; growth is loud, not silent |
| Always-latest upgrade path blocked by a breaking bkit release | Sweep stops at reset loudly (assertion battery); cohorts split by recorded `bkitVersion` |
| `node --test example` (bare dir) on Node ≥ 22 | Rejected; portable invocation is `cd example && node --test`, stated with the Node pin as one coupled pair (spike C1/C2) |
| `out=$(…)` under `bash -e` discards TAP capture | Tests step writes TAP to a file and parses the count from it (spike C4 cautionary run) |
| Reset state has zero tests by construction | Executed-count assertion is **PR-only**; unconditional assertion would red every reset push (spike C4/C7) |
| Vacuous green (`node --test` over zero tests) | Recorded observation, never a verdict; analysis report reads the count (#232) |
| Sentinel false-fail / drift | Sentinel string defined **once** (single source, referenced by placeholder + CI step); feature request forbids quoting it |
| Public-privacy leak (home paths / secrets) | Every-push diff scan (secret + `/Users/`, `/home/` shapes); fixture `.gitignore` covers `.env`/`.env.local`; manual review before first publish |
| `[skip ci]` at HEAD empties the check rollup (KN-11) | Reset commit and every pipeline commit carry no skip markers |
| Branch protection vs the direct reset push | `dev` ruleset blocks force-push/deletion only; required `bkit-tests-check` on the **PR path** into `dev`; never require a PR before merging on `dev` (would 403) |
| Bootstrap half-state (create ok, seed failed) | Re-running `--bootstrap` enters verify-mode and repairs; failure output names the half-state |
| Verify-mode does not prune | Re-publishes changed/missing files but does not remove a stale extra file absent from source truth (spike limitation) |
| Ledger unbounded growth (5000-row warn, no rollup) | Accepted; serial runs keep appends single-writer |
| `feat/{FID}` already exists | Out of scope this cycle (each run files a new issue); documented assumption |
| **Plan-added:** fixture dir renamed / sentinel absent at preflight | Runner aborts before mutating; `[bkit-example]` line names the missing fixture/sentinel |
| **Plan-added:** `main` mirror drift from `examples/bkit-explainer/` | Run preflight asserts `main` still carries the fixture (sentinel included) → drift caught at the next run |
| **Plan-added:** fixture `index.html` written so it does not trip `comments.placeholder-comments` | Fixture authored to avoid the slop placeholder pattern; `pnpm bkit:gate:static` stays green |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign tier(s) via **tier-selection rubric** in `docs/testing.md` (behaviour may need more than one). Boundary rows use that doc's rigor — reach real boundary, assert ground-truth signal, `@live` for external / deployed boundaries; do not restate those rules here.
>
> **Discrimination (no false-green):** assertion MUST hit the **affected** surface and FAIL if behaviour broken — not transport status (200/201), not proxy surfaces, never mock away the boundary under test.

**Tier Key** — use these exact tier names in the `Type` column (they must match `docs/testing.md`); pick the **lowest tier that actually exercises** the behaviour (a behaviour may need several):

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift (global gate, not a per-feature row) | `tsc`, lint, and `bkit check` pass on the changed files |
| **Unit** | pure function / single module, no I/O | service parses a payload correctly |
| **Integration** | crosses a LOCAL stateful boundary (own DB / API), no mocks at the boundary, fresh instance | API endpoint enforces tenant isolation against a fresh local instance |
| **@live (golden)** | crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model, payment, deployed schema, RLS) — reach it, assert a ground-truth signal | a real 3rd-party API returns content and a boundary-only identity |
| **E2E** | user-visible UI flow / DOM state | user creates an event and sees it in the list |
| **fresh-DB replay** | new / changed migration or seed (`bkit-tests-migration`) | migration replays from empty and the seed loads |
| **Smoke** | post-deploy health of a deployed surface (global observability gate) | deployed health route returns 200 |

One row per behaviour (copy the tier name from the key above verbatim into `Type`):

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Runner reset deletes/re-creates only paths under `example/`; a path escaping `example/` is refused (pre-delete assertion + post-delete verification over a real temp git repo) | Integration | `tests/example-run.bats` |
| Runner preflight refuses when the fixture is absent / the sentinel is missing / `main` no longer carries the fixture / `dev != origin/dev`, naming the failing check | Integration | `tests/example-run.bats` |
| Runner refuses a second run while `origin/dev` carries an unmerged reset commit; `--force-run` overrides | Integration | `tests/example-run.bats` |
| Runner gate-chain assertion fails loudly when a seeded `bkit:gate:*` script name does not resolve | Integration | `tests/example-run.bats` |
| Runner install read-back stop aborts the run unless `bkit.issueTracker` reads back `github` (installed version read via the `.bkit-version` JSON schema), naming the failing read-back | Integration | `tests/example-run.bats` |
| `gh` stub answers `gh auth status` (preflight case) and still exits non-zero on `gh repo create` / `gh repo view` (non-`api` argv) | Integration | `tests/example-run.bats`, `tests/fixtures/gh/bin/gh` |

> Bootstrap create-half and verify-and-repair idempotence are **not** matrix rows — the `gh` stub exits 1 on non-`api` argv, so bootstrap-verify stays on the live canary (design WS-8); its boundary assertion is Manual Verification Step 2 (live `gh api repos/cbartens/bkit-example/rulesets`). `examples/bkit-explainer/harness/bkit-ci.yml` has no per-feature test row; Task 3 lints it directly with `actionlint`, and WS-9 folds that path into bkit's own `bkit:lint:workflows` coverage **while retaining** the existing `.github/workflows/*` scan (a positional-arg invocation replaces the default scan — the retention assertion is Task 8's prove-it-can-fail pair).

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

**No breaking changes.** All artefacts are net-new (nothing existing is renamed, removed, or contract-changed). Two existing files gain additive entries:

- `.agents/docs.md` — two new rows (`examples/README.md`, `examples/analysis-prompt.md`); additive, mirrors existing index pattern.
- `slop-scan.config.json` — one new `ignores` entry (`examples/bkit-explainer/**`); additive, confines the deliberately near-empty fixture data. **Config decision** — surfaced per `.agents/rules.md` § Major changes.
- `package.json` `bkit:lint:workflows` + `lint:prose` scripts and bkit's own `.github/workflows/bkit-ci.yml` actionlint step — extended to lint the fixture workflow path (`examples/bkit-explainer/harness/bkit-ci.yml`, outside `.github/workflows/`) **without dropping the existing `.github/workflows/*` scan**, and to cover `examples/*.md` with the prose gate (WS-9).
- `.prettierignore` — adjust only if `prettier --check .` needs the fixture excluded; prefer **formatting the fixture** over ignoring it.

> [!WARNING]
> **CI edit:** the WS-9 actionlint-coverage change touches bkit's own `.github/workflows/bkit-ci.yml`. Per `.agents/rules.md` § CI edits this requires human confirmation — the design authorises it (WS-9); treat this section's confirmation as that sign-off.

**Names introduced (all new):** `examples/bkit-explainer/` (`index.html`, `data.js`, `FEATURE-REQUEST.md`, `harness/`), `scripts/example/new-run.mjs`, `tests/example-run.bats`, `examples/README.md`, `examples/analysis-prompt.md`, `slop-scan.config.json` ignore `examples/bkit-explainer/**`, run-repo paths (`example/`, `FEATURE-REQUEST.md`, `.github/workflows/bkit-ci.yml`, `docs/plans/{YYYYMM}/logs/{FID}/analysis-run{N}.md`, `screenshot-run{N}.png`), reset commit message `chore(example): reset run {N} (bkit {x.y.z})`, and the run repo `cbartens/bkit-example`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".
> **Never a bare question.** Each carries 2-3 options, a recommendation, and default if unanswered — human must decide from the page alone. Canonical plan shape.
> Design → carry its options / recommendation forward where already answered.

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
  - **Recommended:** A — cheap, reuses state preflight already reads, override keeps a stuck run recoverable.
  - **Default if unanswered:** A.
- **Open Question:** **What happens when `feat/{FID}` already exists?** (design open Q)
  - **Options:** A — out of scope; each run files a new issue; document the assumption · B — probe next spike · C — runner refuses.
  - **Recommended:** A now; B if a same-issue re-run is ever wanted.
  - **Default if unanswered:** A.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## Alternative Approaches & Recommendations

Adopted: design **Approach A** across all lenses (folder-scoped reset over a durable root; results accumulate beside it; read raw grouped by `bkitVersion`; no benchmark tooling; one repo for demo and benchmark). Rejected paths and why (design § Approaches Considered):

- **Reset implicit by cutting from `main`; union carries results** — `REJECTED`. Trades a guardable delete for an unenforced "`main` stays pristine" invariant; every tracked file `main`/`dev` diverged on silently reverts on merge.
- **Reset in a scratch clone** — `REJECTED`. Duplicates the worktree isolation the workflows already have; adds a clone lifecycle and a second fixture home (YAGNI).
- **Evidence on its own append-only `results` branch** — `REJECTED`. A second ref to bootstrap/protect; a force-push or stray reset destroys everything at once; reads as the "separate aggregate store" the binding rejects.
- **CI-mediated `workflow_dispatch` reset** — `REJECTED`. Runs are human-in-loop regardless; adds token/trigger semantics and two-branch reasoning at 3am.
- **Human as the assertion engine (documented runbook)** — `REJECTED`. Re-opens the tracker-`none` silent failure v3 ranked highest.
- **Build-vs-buy (external suites / eval frameworks / sandboxes / durable execution)** — rejected wholesale on **scope mismatch** (design § Reuse & Prior Art "existing tools considered and rejected"); cross-field comparability deferred to `504-external-suite-comparison`.
- **Adopt the ~1065-line copy-and-own `bkit-ci.yml` template** — rejected; own a hand-written single-job file to avoid the worst drift surface.
- **A CI job that calls an AI for analysis; a new `analyze-run.mjs`** — rejected; a CI job cannot run after an **aborted** run and would put an AI in the merge path (#232); a script adds tooling only a host agent can do.

**Selection Rule:** pick the approach with the best quality-of-end-state, not the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

**Future phase recommendations:** run the first real run as the C10 end-to-end de-risking (no smoke job, no dry-run repo — the report is the record); promote `504-second-example-extending-existing-code` when the extend-own-code blind spot matters; revisit WS-6's recorded-vs-gating count question only if the recorded signal is ignored.

## Out of Scope

Features / fixes excluded to prevent scope creep. Every exclusion is `Exempt` per the rule below, with a reason and a home.

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The interactive explainer app itself (agents build `index.html` logic + tests during a run) | Not bkit-side tooling; produced by a pipeline *run* in the run repo | Run repo (produced output); design § Component inventory |
| Run replay viewer (`504-run-replay-viewer`) | Genuinely-additive later idea; declared out of scope this cycle before work started | `docs/deferrals.jsonl` (exists) |
| "Your repo" report (`504-your-repo-report`) | Genuinely-additive later idea; needs a Linear path + recorded snapshot | `docs/deferrals.jsonl` (exists) |
| Before vs after bkit (`504-before-vs-after-bkit`) | Genuinely-additive later idea; needs recorded runs first | `docs/deferrals.jsonl` (exists) |
| Local diff input (`504-local-diff-input`) | Genuinely-additive later idea; estimate half blocked on measured costs | `docs/deferrals.jsonl` (exists) |
| Time-saved calculator (`504-time-saved-calculator`) | Rejected for now; numbers would be assumptions shown as results | `docs/deferrals.jsonl` (exists) |
| "How this was built" panel (`504-how-this-was-built-panel`) | Genuinely-additive later idea | `docs/deferrals.jsonl` (exists) |
| Publish benchmark-built demo (`504-publish-benchmark-built-demo`) | Needs a public demo repo + private-content sweep | `docs/deferrals.jsonl` (exists) |
| `504-second-example-extending-existing-code` | The planned answer to the extend-own-code blind spot; a second feature on the first | `docs/deferrals.jsonl` (exists; design references it) |
| `504-additional-example-apps` | Each is a new fixture folder + the same runner | `docs/deferrals.jsonl` (exists) |
| `504-install-advisory-when-tracker-is-none` | A bkit-wide install/doctor advisory; not this example's cycle | `docs/deferrals.jsonl` (exists) |
| `504-external-suite-comparison` | Legitimately different heavy exercise (industry-comparable numbers) | `docs/deferrals.jsonl` (exists; design references it) |
| bkit CI smoke job for the example | Binding: ad hoc runs only; do not add a smoke job now | Design decision (WS-6 dropped) |
| Tracker-`none` install/doctor warning | Out of scope per human decision | Design decisions table |
| Sandbox/durable-execution/eval-framework adoption | Scope mismatch (build-vs-buy rejected) | Design § Reuse & Prior Art |

> [!CAUTION]
> **Default = in-scope.** `Exempt` only if genuinely-additive — not required by `Success Criteria`, `Acceptance Scenario` / `Derived Test Matrix` row, or design (non-goals excepted). Required items → runbook task, never deferral; parking here = `Blocking` deferral → plan review / scope-check pulls back. Mirror each `Exempt` row in `docs/deferrals.jsonl`. Audit `LOW` → `Exempt` rows here.

> **Deferral mirror note:** every row above is already recorded in `docs/deferrals.jsonl` (keys `504-*`), per the design's binding decisions; **this cycle adds no new deferral rows**. No new rows are appended at plan time.

## Suggested Scope Expansion

> [!CAUTION]
> **Candidates, not scope.** Human review only — not runbook tasks, must not expand scope. Fold in only on design scope or explicit human decision → becomes task, leaves list.

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `bkit runs gate --repo <other-repo> --pr N` ignores `--repo` and resolves the PR from the checkout (`severity: HIGH`) | `docs/failures.jsonl` (`runs-gate-repo-flag-ignored-pr-resolved-from-checkout`, OPEN) | WS-4/WS-8 constraint — the runner and bats must never use that pair; `/bkit-ship` unaffected | Keep deferred to its own fix; this cycle only encodes the constraint (WS-7 contract table + WS-8 non-scope) |
| `504-install-advisory-when-tracker-is-none` | `docs/deferrals.jsonl` (OPEN) | WS-4 tracker read-back (`issueTracker == github`) | Keep deferred; the example works around it with the explicit flag + preflight |
| `504-second-example-extending-existing-code` | `docs/deferrals.jsonl` (OPEN) | Reset-to-fixture model's extend-own-code blind spot | Keep deferred; design references it as the planned answer |
| `504-external-suite-comparison` | `docs/deferrals.jsonl` (OPEN) | Cross-field comparability of the benchmark | Keep deferred; design references it as the path to comparability |
| `github-mcp-search-issues-silently-returns-zero-private-repo` (`MEDIUM`, TRIAGED) | `docs/failures.jsonl` | Plan/design related-issues search over the private bkit repo | Out of this plan's surfaces; not folded |
| `504-run-replay-viewer`, `504-your-repo-report`, other later ideas | `docs/deferrals.jsonl` (OPEN) | Run's `status.jsonl` read path (WS-5/WS-6) | Keep deferred (see `Out of Scope`) |

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **New API Route** — N/A (no server, no route).
- [ ] **New DB Table/Column** — N/A (no database; bkit is a build-time/DX tool, `docs/architecture.md` § What bkit Is).
- [ ] **Role-Gated Mutation** — N/A (no auth surface).
- [ ] **User Input** — N/A (no user-input handler).
- [ ] **PII** — bkit logs no PII. The **applicable** control is the _public run repo's_ every-push privacy scan for secret + absolute home-path shapes (`/Users/<name>`, `/home/`), implemented by WS-3 (`harness/bkit-ci.yml`), plus the fixture `.gitignore` covering `.env`/`.env.local`, plus a documented manual review before the first publish. Public repo = irreversible; the guarantee is stated honestly in `examples/README.md` (WS-7).
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [ ] **New Secret/Env Var** — None. No new secrets; the run repo is public and holds none.

_If none apply: "None — no new routes, DB writes, secrets, or user input."_ → The single applicable control is the public-repo privacy scan (PII row), a **product** behaviour of the fixture, not a change to bkit's own security posture.

## Pre-Flight / Dependencies

**CRITICAL:** Check off all core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core

Always verify.

- [ ] **Package Management:** Required packages declared; dependency manifest + lockfile in sync (e.g. `package.json` + `pnpm-lock.yaml`, `pyproject.toml` + `uv.lock`). New code is `.mjs` (Node stdlib) + bats; the fixture's `harness/package.json` + `harness/pnpm-lock.yaml` are committed fixtures, not bkit devDeps. bkit's own `package.json`/`pnpm-lock.yaml` unchanged except the `bkit:lint:workflows` script (WS-9).
- [ ] **Dependency Versions:** Run `pnpm bkit:deps:outdated`; spot-check toolchain + stack CLI versions (`node --version` ≥ 20, `pnpm --version`, `gh --version`, `bats --version`, `actionlint` present-or-skipped). Flag outdated deps that may silently block implementation — infra errors often = CLI vs backend version mismatch.
- [ ] **Existing-Solution Search (reuse over duplicate):** per capability, three sweeps → `Reuse Inventory`: in-repo (text search for names / strings / near-miss helpers / sibling modules; symbol references via language server when configured; `docs/capabilities.md` when present), dependency (`{framework} {capability} built-in`), ecosystem (`{problem} best practice {current year}`). Empty language-server / capability-map result = inconclusive — absence needs text search. Unrecorded = unsearched. Drives `[MODIFY]` vs `[NEW]`.
- [ ] **User Context:** Verify read / write access to required files. Request missing user information up front: maintainer's `gh` auth for the run repo (bootstrap only, WS-4), `node`/`pnpm`/`bats` locally.
- [ ] **Project Context:** Fold `docs/knowledge.jsonl` and `docs/decisions.jsonl` each by `key`, highest `ts` wins → read only winning rows where `status` is `ACTIVE` or absent; never read any other rows. Check for relevant patterns, decisions, gotchas. (KN-9: read version via `.bkit-version` JSON schema; KN-11: no `[skip ci]` at HEAD.)
- [ ] **Testing & Quality:** Ensure testing strategy aligns with `docs/testing.md` — the runner's only automated verification is bats over the `gh` stub (WS-8); bootstrap-verify stays on the live canary.
- [ ] **Prerequisite Plans:** List `docs/plans/...` plans that must be fully executed and verified before this one. None — this is the first plan for #504; the design (`docs/plans/202610/504-example-project-design.md`, Verdict PASS) is its input.

### Conditional

Verify only when applicable.

- [ ] **Secrets & Env Vars:** New API keys or third-party credentials → **None.** No secrets introduced; the run repo is public and holds none. Verify-secrets probe skipped as N/A.
- [ ] **Schema State:** Any DB reads or writes → **None.** No database. (See `Data Schema Integration`.)
- [ ] **Architecture & UI:** New files / routes / UI → `docs/architecture.md` topology consulted (bkit is CLI + payload; `examples/` is a new non-shipped fixture tree). No UI/mobile in this cycle.
- [ ] **Observability:** New logs / audit tables / traces → the runner emits one `[bkit-example]` line per transition (plain stdout, matching the `scripts/*/*.mjs` idiom). Align with `docs/observability.md` for the new `[bkit-example]` label if it graduates; no structured-logger change in bkit's engine.
- [ ] **Notifications:** Alerts / toasts → **None.**

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all applicable boxes above. **do not stop for user permission.** Proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Reuse Inventory complete:** every capability has a row with non-empty `Search performed` + `Decision`; every `NEW` cites an allowed reason.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

**No database.** bkit is a build-time / DX tool (`docs/architecture.md` § What bkit Is). This feature introduces no tables, columns, migrations, access policies, RLS, or privileged writes. `Invariant Conformance` (multi-store privileged writes) → **N/A**.

The schema-equivalent surfaces this feature defines are **file/row shapes**, documented in the design § Data Model and realised by the runbook:

- **Run-repo root `package.json`** (durable harness) — `name`, `private`, absent `type`, `packageManager` + committed lockfile, `engines.node`, always-latest `devDependencies["@cbartens/bkit"]`, `scripts.test` (`cd example && node --test`) + gate stubs, `bkit` block (`issueTracker`/`capstoneJob`/`ciWorkflow`). Built by WS-2.
- **`example/data.js`** — fixed content data (`phases`, `nodes` incl. `parallelGroup`, `edges` incl. review-back/failure-to-debug, `counters.derivesFrom`, `handover`) under one fixed global. Built by WS-1.
- **Existing ledger rows read by the benchmark** — `outcome` / `counter` (`.bkit/stats.jsonl`) and `status.jsonl` step rows. **No schema change**; the reader contract (per-workflow `outcome`, run-scope by marker, never `parentSha`) is documented by WS-5/WS-7.

### Data Schema Usage

**Input (Read):** existing `.bkit/stats.jsonl` rows (`outcome.durationSeconds`, `taskCount`, `reviewIterations`, `bkitVersion`, `prNumber`; `counter.counterName`, `counterValue`) and `status.jsonl` step rows (`workflow`/`step`/`status`/`at`). `docs/schema.md`/`docs/data-schema.md`: **none** — no production DB. Reading is documentation-only this cycle (WS-5); no reader code is built.

**Output (Write):** none at plan/build time. At _run_ time the pipeline appends the existing ledger rows (unchanged contract) and the analysis step commits `analysis-run{N}.md` + `screenshot-run{N}.png` under `docs/plans/{YYYYMM}/logs/{FID}/` in the **run repo** (not bkit).

### Data Schema Changes

**None.** No `docs/data-schema.md` change. `docs/data-schema.md` documents the active production database; there is none. (Nothing to add / modify.)

## Reuse Inventory

One row per capability plan introduces, including those search cleared as absent. Author before `Architecture & Component Changes`. No capability → no rows; "None" never substitutes for searching. Design `Reuse & Prior Art` verdicts = starting point; every row still records its own `Search performed`.

<!-- prettier-ignore -->
| Capability | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- |
| Versioned example fixture under `examples/` | `ls examples/`; `grep -rn "bkit-explainer" .`; `grep -rn "examples/" docs/architecture.md` | None — no `examples/` tree exists | new | (a) no candidate; searched repo root, `.bkit/`, `scripts/`, `tests/` |
| Maintainer runner `.mjs` | `ls scripts/*/*.mjs`; `grep -rln "process.argv" scripts/` | `scripts/readme/readme-art.mjs` — same `scripts/<area>/*.mjs` idiom, not a repo-lifecycle runner | new | (a) no candidate runner exists; the `scripts/<area>/*.mjs` pattern is reused (not a `Reuse Inventory` artifact) |
| Persistent repo creation + `main`/`dev` seeding | `grep -rn "repo create" scripts/ tests/`; `ls tests/fixtures/gh/` | `gh repo create`; `tests/fixtures/gh/bin/gh` shims **four** `gh api` URL shapes | new | (a) no runner artifact; reuse `gh` directly, no wrapper |
| Installing / upgrading bkit in the run repo | `.bkit/core/engine/commands/install/upgrade.ts`; `grep -rn "upgrade --latest" .bkit/core/` | `bkit install --claude --tracker=github`; `bkit upgrade --latest` (atomic self-bump) | USE-AS-IS | Reuse the real installer + upgrade path through the pinned devDependency (`pnpm exec bkit …`); never reimplement |
| Minting the run branch off `dev` | `.bkit/core/workflows/bkit-design.md`; spike C1 | `bkit worktrees setup` mints `feat/{FID}` off `origin/dev` | USE-AS-IS | The runner does not cut `feat/*`; the reset must already be on `dev` |
| Accumulating results across runs | `grep -n "stats.jsonl" .gitattributes .bkit/jsonl.md` | `.bkit/stats.jsonl` (`merge=union`; rows carry `bkitVersion`) | USE-AS-IS | Reuse the tracked file + row shape + union merge; no new format, no aggregate store |
| Satisfying the local gate chain (`bkit:gate:static-unit`) | `.bkit/core/engine/install/manifest.ts` `BKIT_GATE_SCRIPTS`; `grep -rn "bkit:gate:" .bkit/core/engine/install/` | Seeded add-if-missing scripts (`install/modules/core.ts`) | new | (a) no fixture stub set exists; pre-declare Node-stdlib no-op stubs using the repo's own "skip if tool absent" idiom; never weaken a gate |
| Satisfying ship's merge gate (capstone green at head) | `sed -n '505,535p' .github/workflows/bkit-ci.yml`; `grep -n "capstoneJob" package.json` | `.bkit/templates/.github/workflows/bkit-ci.yml` (~1065-line copy-and-own); `bkit.capstoneJob` default `bkit-tests-check` | new | (a) own a hand-written single-job file rather than adopting the full template (worst drift surface) |
| Test runner for the built app | `grep -n "node --test" docs/plan…/…-design.md`; spike C1/C2 | Node built-in `node --test` (`engines.node >= 20`) | USE-AS-IS | Already the intended runner and the issue's only CI check; adds zero dependencies. Invocation form `cd example && node --test` chosen in the design |
| Deterministic placeholder (sentinel) check | `grep -rn "sentinel" .`; `grep -rn "placeholder" scripts/ tests/` | None — no artifact asserts "the placeholder was replaced" | new | (a) no candidate; new unguessable single-sourced string + a PR-only check |
| Screenshot artefact (never gating) | `grep -rn "headless" scripts/`; `sed -n '1,40p' scripts/readme/readme-art.mjs` | `scripts/readme/readme-art.mjs` — headless-Chrome detect+invoke block (script, not a module) | new | (b) the mechanism is a script, not a reusable module; copy the detect+invoke block into the workflow. `actions/upload-artifact@v4` reused (USE-AS-IS, staging-only) |
| Content data the built page reads | `grep -rn "phaseId\|parallelGroup\|derivesFrom" .` | None — no artifact encodes bkit's phase/loop skeleton | new | (a) no candidate; `data.js` is new data, not code |
| Benchmark measurement inputs | `grep -rn "kind:\"outcome\"\|counterName" .bkit/jsonl.md` | `.bkit/stats.jsonl` `outcome`/`counter` rows; `status.jsonl` step rows | USE-AS-IS | Rows already exist and carry `bkitVersion`; the benchmark is a reader only |
| Contract documentation for the example (`examples/README.md`) | `ls examples/`; `ls docs/*.md` | None — no `examples/` doc exists | new | (a) no candidate; follows the `docs/templates/*` contract-table shape |
| Registering the example docs in `.agents/docs.md` | `sed -n '1,75p' .agents/docs.md` | `.agents/docs.md` doc index (Project Documents) | EXTEND-EXISTING | Add two rows (`examples/README.md`, `examples/analysis-prompt.md`) following the existing docs-index pattern |
| Reading the installed version | `.bkit/core/engine/install/version-file.ts`; KN-9 | `.bkit-version` JSON schema (`pinnedVersion`) | USE-AS-IS | Read through the JSON schema; never raw `readFileSync().trim()` |
| Runner verification over a `gh` stub | `sed -n '1,52p' tests/fixtures/gh/bin/gh`; `ls tests/*.bats` | `tests/fixtures/gh/bin/gh`; `tests/gh-stub-smoke.bats`, `tests/bkit-cloud-bootstrap-preflight.bats` | EXTEND-EXISTING | Extend the stub with a `gh auth status` shape (keep the four `gh api` shapes and the non-`api` exit-1 behaviour) |
| Runner-verification suite (`tests/example-run.bats`) | `ls tests/*.bats`; `grep -rn "new-run" tests/` | None — no suite exercises the runner | new | (b) the stub's existing shapes were not designed for these assertions; author `tests/example-run.bats` narrowed to preflight / reset-scope / gate-chain / install read-back (bootstrap-verify stays on the live canary) |
| Registering the new paths in bkit's own gates | `cat slop-scan.config.json`; `cat .prettierignore`; `grep -n "actionlint" package.json .github/workflows/bkit-ci.yml` | `.prettierignore`; `slop-scan.config.json` (`ignores`); `bkit:lint:workflows` (actionlint) | EXTEND-EXISTING | Format the fixture, add one `slop-scan` ignore for the near-empty fixture data, and register the fixture workflow path in actionlint coverage (it sits outside `.github/workflows/`) |
| AI run-analysis prompt (score + report) | `ls docs/templates/bkit-audit-*.md`; `grep -rn "audit-generate" .bkit/prompts.md` | `docs/templates/bkit-audit-*.md` + `@bkit-audit-generate` (template-run-to-report idiom) | new | (b) extending the audit template breaks its destination contract — `@bkit-audit-generate` writes into bkit's repo (`docs/audits/`); this prompt must land its report in the **run** repo and score against a fixed ideal, so a new doc reusing only the report-as-artefact shape |
| Enforcing never-prune + merge-gate invariants natively | `.bkit/core/engine/commands/setup/setup.ts` (`protectionPayload`); `grep -rn "protect-main" .bkit/` | GitHub rulesets / branch protection (platform API); `bkit setup protect-main` protects **`main`** only | new | (b) bkit's command covers `main` only and deliberately leaves `dev` unprotected; bootstrap writes the `dev` rule itself (force-push/deletion blocked, **no** required PR, required `bkit-tests-check` on the PR path) |
| Presenting recorded observations on the run page | `grep -rn "GITHUB_STEP_SUMMARY\|::warning::" .github/workflows/ .bkit/` | `$GITHUB_STEP_SUMMARY` + `::warning::` (used in `bkit-ci.yml`, `bkit-cloud.yml`) | USE-AS-IS | Built into Actions, zero deps, non-gating; a failed capture emits a loud `::warning::` |
| Linting the hand-written workflow | `grep -n "actionlint" package.json .github/workflows/bkit-ci.yml` | `actionlint` via `bkit:lint:workflows` (`ci.yml`; `.github/workflows/bkit-ci.yml`) | EXTEND-EXISTING | An existing bkit pattern; register the fixture workflow path explicitly **while retaining** the default `.github/workflows/*` scan (positional args replace it), and extend `lint:prose` with `examples/*.md` (WS-9) |

> [!CAUTION]
> **Default = `EXTEND`.** `NEW` only allowed for: (a) no candidate — `Search performed` shows the commands establishing absence; (b) extending breaks the candidate's contract or callers — name both; (c) candidate is a `Supersession Inventory` `DELETE` — replacement, not duplicate. Never accept cleaner-fresh / messy-existing / close-but-different as a `NEW` reason. Each `EXTEND` row lands as `[MODIFY]` in `Architecture & Component Changes`; each `NEW` row as `[NEW]` carrying the same reason.

## Architecture & Component Changes

Grouped by the design's own architectural seams (fixture · durable root · gate · runner · verification · docs · own-gate registration). One home per file. All paths authored under **bkit's** repo unless marked run-repo.

### Fixture — `examples/bkit-explainer/` (bkit-side; [new])

#### [new] `examples/bkit-explainer/index.html`

- **Reuse Check:** `Reuse Inventory` row "Versioned example fixture" — reason (a) no candidate.
- Near-empty placeholder carrying the sentinel string `BKIT-EXAMPLE-SENTINEL-<unguessable>`, defined **once** here and referenced by the CI step (WS-3) — no second copy can drift. Written so it does not trip `slop-scan.config.json` `comments.placeholder-comments`.

#### [new] `examples/bkit-explainer/data.js`

- **Reuse Check:** reason (a) no candidate.
- Fixed content data under one fixed global (e.g. `__BKIT_EXPLAINER_DATA__`): `phases`, `nodes` (incl. `parallelGroup`), `edges` (kinds forward / review-back / failure-to-debug), `counters` (`derivesFrom`), `handover`. Classic-script-loadable plain JS, never `.json` (a page opened off disk cannot `fetch`). Data only — no logic.

#### [new] `examples/bkit-explainer/FEATURE-REQUEST.md`

- **Reuse Check:** reason (a) no candidate.
- The fixed request the runner files as the issue: content requirements, the four planted traps as plain requirements, fixed filenames, plain-`<script src>` / one-pure-function rules; forbids quoting the sentinel.

#### [new] `examples/bkit-explainer/harness/` (non-workflow durable-root sources)

- **Reuse Check:** `Reuse Inventory` row "Versioned example fixture" — reason (a) no candidate.
- `package.json` — durable harness: `name: "bkit-example"`, `private: true`, **absent** `type` (CommonJS dual-load), `packageManager` + committed `pnpm-lock.yaml`, `engines.node: ">=20"`, always-latest `devDependencies["@cbartens/bkit"]`, `scripts.test: "cd example && node --test"`, gate stubs (`typecheck` = `node --check example/data.js example/logic.js`; `lint`/`format:check`/`lint:prose`/`slop:delta`/`lint-staged` = honest no-ops echoing what they skip; `build` = no-op), and the `bkit` block (`issueTracker: "github"`, `capstoneJob: "bkit-tests-check"`, `ciWorkflow: "bkit-ci.yml"`).
- `pnpm-lock.yaml` — committed lockfile (`bkit upgrade`/`install` fail without one).
- `README.md` — main = fixture, dev = integration, reset, a pointer to the stats read path, never-prune rule.
- `gitignore` — covers `.env` / `.env.local` (published to `.gitignore`).

#### [new] `examples/bkit-explainer/harness/bkit-ci.yml`

- **Reuse Check:** `Reuse Inventory` row "Satisfying ship's merge gate" — reason (a) no candidate; the template is deliberately not adopted.
- Hand-written single-job workflow exposing `bkit-tests-check` present **and** green at PR head. Every-push steps: tests (`cd example && node --test`, TAP written to a file, count parsed from it) + privacy scan (diff range per event; secret **and** home-path shapes; no built-page dependency). PR-only steps: sentinel-gone (gating), executed-count (recorded, `continue-on-error`), classic-script form (recorded, `continue-on-error`), screenshot capture + optional `actions/upload-artifact@v4` (non-gating, staging-only; `::warning::` on failure). Literal `[main, dev]` triggers; `if: ${{ !cancelled() }}`; Node pinned **and** recorded; read-only perms (no `contents: write`); Actions Job Summary (`$GITHUB_STEP_SUMMARY`) renders the recorded observations. Published to `.github/workflows/bkit-ci.yml` on the run repo by bootstrap.

### Runner — `scripts/example/new-run.mjs` (bkit-side; [new])

#### [new] `scripts/example/new-run.mjs`

- **Reuse Check:** `Reuse Inventory` row "Maintainer runner" — reason (a) no candidate runner; `scripts/<area>/*.mjs` idiom reused.
- **Bootstrap (`--bootstrap`, idempotent):** create `cbartens/bkit-example` public and seed `main` + push `dev`, or verify-and-repair when it exists (re-render `bkit-ci.yml`, re-publish the fixture; half-seeded state repaired; never create/delete; no pruning). Also configures the run repo's **ruleset once**: block force-push + branch deletion on `dev` **and** `main`; require `bkit-tests-check` on PRs into `dev`; **never** require a PR before merging on `dev`.
- **Per-run preflight:** fixture present with its sentinel; `main` still carries the fixture; `git status --porcelain` empty and `dev == origin/dev`; run-in-flight guard (`--force-run` override); `gh auth` / Node ≥ pinned / pnpm.
- **Reset:** delete + re-create files under `example/` from the fixture as **one** commit on `dev`; pre-delete path assertion (resolved path inside `example/`) + post-delete verification (every removed path resolved inside `example/`). The only destructive op.
- **Install + read-backs:** `pnpm install` → `pnpm exec bkit upgrade --latest` + `pnpm exec bkit install --claude --tracker=github`; read `bkit.issueTracker` (stop unless `github`), version via `.bkit-version` JSON schema (`pinnedVersion`), every seeded `bkit:gate:*` script resolves; commit install churn.
- **Finish:** push the reset commit; file `FEATURE-REQUEST.md` as the issue; print the start command; one `[bkit-example]` line per transition; a failure names exactly the `dev` state left behind. Reset commit message `chore(example): reset run {N} (bkit {x.y.z})`, no skip markers. Never gates; never touches `.bkit/`, `docs/`, or the root harness; never captures the screenshot.

### Verification — `tests/` (bkit-side; [MODIFY] + [new])

#### [MODIFY] `tests/fixtures/gh/bin/gh`

- **Existence Check:** exists (8134 bytes). Add a `gh auth status` shape for the preflight case. Keep the four `gh api` shapes and the non-`api`-argv exit-1 behaviour intact (bootstrap-verify stays on the live canary).

#### [new] `tests/example-run.bats`

- **Reuse Check:** `Reuse Inventory` row "Runner verification over a `gh` stub" — reason (b) the stub's existing shapes fit but were not designed for these assertions; extend the stub, add a suite following `tests/gh-stub-smoke.bats` / `tests/bkit-cloud-bootstrap-preflight.bats`.
- Covers the runner's **preflight**, **reset-scope** and **gate-chain assertion** paths over the extended stub. Explicit non-scope: never exercise `gh repo create` / `gh repo view` (stub exits 1 on non-`api` argv) or `bkit runs gate --repo … --pr …` (mis-resolves the PR).

### Docs — `examples/` (bkit-side; [new])

#### [new] `examples/README.md`

- **Reuse Check:** reason (a) no candidate; follows the `docs/templates/*` + `.agents/docs.md` index pattern (EXTEND for registration).
- The contract table: gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, sentinel, reset procedure, run-marker, harvest/median read path, version-grouping rule, serial invariant, never-prune rule, ruleset constraint (no required PR on `dev`; required check on the PR path into `dev`), privacy, CI-passive contract (read-only, no bot commit, artefact as staging), run-page presentation (Job Summary + `::warning::`), `actionlint` coverage of the fixture workflow, committed-evidence paths, run merge SHA, trajectory rubric dimension names, `[skip ci]` recovery line, breaking-release runbook. **Never published** into the run repo. Includes the WS-5 read-path rules and the README median-table shape.

#### [new] `examples/analysis-prompt.md`

- **Reuse Check:** `Reuse Inventory` row "AI run-analysis prompt" — reason (b): extending `docs/templates/bkit-audit-*.md` / `@bkit-audit-generate` breaks its destination contract (writes into bkit's repo); this prompt writes into the run repo.
- The prompt: what it reads (that run's `status.jsonl`; `.bkit/stats.jsonl` rows in the run's window; issue + PR; `bkit-tests-check` conclusions incl. executed count, sentinel, classic-script, privacy, screenshot; the run's screenshot; built page + logic + tests). Fixed score rubric: the **outcome** dimension (`completion` — the only binary, code-assessed) plus the three **trajectory** dimensions — **tool efficiency**, **cost & latency**, **code quality**; trap detection (0-4 caught) as a distinct **correctness observation**, never a score input that can fail a run. Commits the report + screenshot (records the run's **merge SHA**, `bkitVersion`, and the **prompt revision**) with a docs-only commit (no `[skip ci]`); names the screenshot fetch path (`gh run download -n <artefact name>` or the committed copy — KN-27). **Never published**.

### Own-gate registration — bkit's repo (bkit-side; [MODIFY])

#### [MODIFY] `slop-scan.config.json`

- **Existence Check:** exists. Add `examples/bkit-explainer/**` to `ignores` (confined to the deliberately near-empty fixture data; the runner stays scanned and slop-clean).

#### [MODIFY] `.agents/docs.md`

- **Existence Check:** exists. Register `examples/README.md` and `examples/analysis-prompt.md` (two rows) via the `.agents/docs.md` doc-index pattern.

#### [MODIFY] `package.json` (`bkit:lint:workflows`, `lint:prose`) and `.github/workflows/bkit-ci.yml` (actionlint step)

- **Existence Check:** both exist. Add the fixture path to the actionlint invocation **in both sites without dropping the default `.github/workflows/*` scan** — `actionlint` with positional file args replaces its default scan, so use two invocations (bare + fixture path) or one invocation naming both the workflows globs and the fixture path; add `--glob='examples/*.md'` (top-level only, **not** `examples/**/*.md`) to the `lint:prose` script so the two new contract docs enter the prose gate. **CI edit** — requires human confirmation (see `Breaking Changes & Naming Review`).

#### [MODIFY] `.prettierignore`

- **Existence Check:** exists. Adjust **only if** `prettier --check .` rejects the fixture; prefer formatting the fixture over ignoring it.

### Database Migrations

None — no database (see `Data Schema Changes`). Not applicable.

### Cron Jobs & Scheduled Tasks

None. No scheduled tasks; runs are maintainer-triggered (ad hoc, human-in-loop). Not applicable.

## Supersession Inventory

None. All artefacts are net-new; nothing existing is replaced, deprecated, or removed. The design supersedes the v3 throwaway-private-repo **model** (documented in the design's Decisions table), not a codebase artifact — no `[DELETE]` row.

## Documentation Updates

> Docs this change touches only; delete rest. Core below; others via `.agents/docs.md`. Code-change treatment — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | No bkit-engine gotcha this cycle; the run-repo gotchas live in `examples/README.md`. Add a row **only** if an implementation gotcha is discovered (e.g. a `node --test` invocation trap reproduced). Otherwise None. |
| `docs/decisions.jsonl` | All ADR rows for this cycle (authored by WS-7, sole writer): fixture-vs-run split; persistent public repo; reset scope; reset direct on `dev`; always-latest + version grouping; outcome-based liveness framing; gate shape; every-push privacy; PR-only sentinel + recorded observations; CI screenshot + read-only CI; GitHub rulesets / branch protection; Actions Job Summary + annotations; actionlint coverage; committed evidence + run merge SHA; bootstrap; runner; serial invariant; never-prune incl. ruleset enforcement; docs; AI analysis prompt; lockfile; gate registration incl. the WS-9 config change; the cycle's scope exclusions (nine later ideas + no smoke job). |
| `docs/architecture.md` | Add the `examples/` fixture tree + `scripts/example/` to the package/consumer topology (new non-shipped tree; `files` excludes it). |
| `docs/technology.md` | Note reuse: Node `node --test`, `gh` CLI, `bats`, `actionlint`, `actions/upload-artifact@v4`, headless-Chrome detect+invoke pattern; no new dependency. |
| `docs/data-schema.md` | None — no DB. |
| `docs/design.md` | None — no UI/palette change in bkit. |
| `docs/testing.md` | Add the `tests/example-run.bats` suite + the extended `gh` stub to the bats inventory; note the runner sits outside vitest/tsc. |
| `docs/deployments.md` | Note the actionlint coverage now includes the fixture workflow path (`examples/bkit-explainer/harness/bkit-ci.yml`) alongside `.github/workflows/*`; `docs/technology.md` actionlint row refreshed. |
| `docs/observability.md` | Add the `[bkit-example]` runner line label (one per transition) if it graduates to a documented label. |
| `.agents/docs.md` | Register `examples/README.md` + `examples/analysis-prompt.md`. |
| `examples/README.md` | New — the contract table incl. the `data.js` owner-check cadence (per-release canary owner), the WS-5 attempted-vs-completed counting, and the `[skip ci]` recovery procedure (see Architecture). |
| `examples/analysis-prompt.md` | New — the analysis prompt + rubric (see Architecture). |
| `slop-scan.config.json` | New `ignores` entry `examples/bkit-explainer/**`. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database. | "Code-only — `git revert` sufficient." |
| **Code** | `git revert {COMMIT}` on the bkit-side landing commits (fixture, runner, bats, docs, `slop-scan.config.json`, the `package.json` / `bkit-ci.yml` actionlint change). All additive; a revert restores the pre-cycle tree. | No feature flag needed. |
| **Run repo** | Out of band — the run repo `cbartens/bkit-example` is a separate public repo; reverting bkit-side code leaves it untouched. Its ruleset blocks force-push/deletion (never-prune), so cleanup of a bad run is **not** a force-push. | Bootstrap verify-mode re-repairs the root harness drift if the fixture source changed. |
| **Risk window** | None for bkit's own CI beyond the WS-9 actionlint edit; the fixture workflow only runs when published into a run repo. | Any bkit CI red from the new paths is caught by `pnpm bkit:gate:static` before landing (WS-9). |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Run runbook autonomously; no user permission at Gates; `[x]` as you go.
> **Step Isolation:** Finish task (verify + checkbox) before next.
> **Integration Shape:** may suggest PR / commit / sequencing — advisory, never a gate; one PR for all tasks always OK. Do not specify merge method.

**Implementation Tasks:**

> Every task MUST include `**Done when:**` — terse, testable, codebase-verifiable. Test ship with their task.

- [ ] **Task 1 (WS-1): Author the fixture app start state.** Create `examples/bkit-explainer/index.html` (near-empty placeholder + single-sourced sentinel), `examples/bkit-explainer/data.js` (fixed content data), `examples/bkit-explainer/FEATURE-REQUEST.md` (fixed request, four traps as plain requirements, plain-`<script src>` / one-pure-function rules, forbids quoting the sentinel). **Done when:** all three files exist; `data.js` loads under `node -e "require('./examples/bkit-explainer/data.js')"`-style evaluation (or `node --check`) exposing `phases`/`nodes`/`edges`/`counters`/`handover`; the sentinel literal is authored in **exactly one** fixture file (`index.html`) and nowhere else in bkit (no second copy) — the CI step (Task 3) reads it from there at run time rather than embedding a copy; `FEATURE-REQUEST.md` content carries the four traps as plain requirements, the plain-`<script src>` / one-pure-function rules, and the sentinel-quoting prohibition; the placeholder does not trip `comments.placeholder-comments`.
- [ ] **Task 2 (WS-2): Author the durable harness sources.** Create `examples/bkit-explainer/harness/package.json` (fields per Architecture), `harness/pnpm-lock.yaml`, `harness/README.md`, `harness/gitignore`. **Done when:** `package.json` parses; `scripts.test` is exactly `cd example && node --test`; the `bkit` block sets `issueTracker:"github"`/`capstoneJob:"bkit-tests-check"`/`ciWorkflow:"bkit-ci.yml"`; gate stubs are honest no-ops echoing what they skip; `gitignore` covers `.env`/`.env.local`; `README.md` states the main=fixture / dev=integration / reset / stats-read-path / never-prune contract.
- [ ] **Task 3 (WS-3): Author the capstone workflow `examples/bkit-explainer/harness/bkit-ci.yml`.** Every-push tests (`cd example && node --test`, TAP to a file, count parsed from it) + privacy scan (diff range per event; secret + home-path shapes; portable BRE/ERE grep — no `grep -oP` lookbehind — with the no-match exit-1 guarded under `set -euo pipefail`); PR-only sentinel-gone (gating; reads the sentinel from `main:example/index.html`, the single source, never an embedded copy), executed-count (recorded, `continue-on-error`), classic-script form (recorded), screenshot capture + optional upload (non-gating, `::warning::` on failure); literal `[main, dev]` triggers; `if: ${{ !cancelled() }}`; Node pinned + recorded; read-only perms; Job Summary renders observations. **Done when:** `actionlint examples/bkit-explainer/harness/bkit-ci.yml` runs clean **directly on the file** (WS-9 folds the path into bkit's own coverage later — Task 8, so this task does not consume Task 8's artefact); PR-only steps carry `if: github.event_name == 'pull_request'`; the privacy step carries no built-page dependency and does not abort red on a clean no-match; no `contents: write`; no `[skip ci]`; the job name `bkit-tests-check` and published filename `bkit-ci.yml` equal `harness/package.json` `bkit.capstoneJob`/`ciWorkflow` (cross-file no-drift guard).
- [ ] **Task 4 (WS-4): Implement runner bootstrap + rulesets in `scripts/example/new-run.mjs`.** `--bootstrap` create-or-verify-repair (incl. half-seeded state; never create/delete; no pruning); configure the run-repo ruleset once (block force-push/deletion on `dev`+`main`; require `bkit-tests-check` on PRs into `dev`; **no** required PR on `dev`). **Done when:** `node --check scripts/example/new-run.mjs` passes; bootstrap idempotence path is implemented and prints the half-state name on seeding failure; verify-mode re-applies the ruleset when it has drifted (repairs, not only creates); the ruleset payload never sets `required_pull_request_reviews` on `dev`; its boundary assertion is Manual Verification Step 2's live `gh api repos/cbartens/bkit-example/rulesets` check (the `gh` stub exits 1 on non-`api` argv, so no bats covers bootstrap).
- [ ] **Task 5 (WS-4): Implement the per-run path in `scripts/example/new-run.mjs`.** Preflight (fixture+sentinel, `main` carries fixture, clean/synced `dev`, run-in-flight guard with `--force-run`, `gh auth`/Node/pnpm); reset `example/` as one commit with pre-delete assertion + post-delete verification; `pnpm install`; latest-bkit install with read-backs; push; file the issue; print start command; `[bkit-example]` lines. **Done when:** `node --check` passes; the reset commit message matches `chore(example): reset run {N} (bkit {x.y.z})` with no skip markers; no code path deletes outside `example/`; the failure message names the `dev` state left behind; after `pnpm exec bkit install --claude --tracker=github` the runner reads `bkit.issueTracker` back and stops (non-zero, naming the failing read-back) unless it equals `github`, and reads the installed version via the `.bkit-version` JSON schema (`pinnedVersion`).
- [ ] **Task 6 (WS-8): Extend the `gh` stub and author `tests/example-run.bats`.** Add a `gh auth status` shape to `tests/fixtures/gh/bin/gh`; author `tests/example-run.bats` covering preflight / reset-scope / gate-chain / install read-back over the stub (Derived Test Matrix rows). **Done when:** `bats tests/example-run.bats` passes; the stub still exits 1 on non-`api` argv; the suite never invokes `gh repo create`/`gh repo view` or `bkit runs gate --repo … --pr …`; each Derived Test Matrix row is individually evidenced and fails if its behaviour is broken — (i) reset-scope (paths escaping `example/` refused; pre-delete assertion + post-delete verification), (ii) preflight (missing fixture / sentinel / `main` drift / `dev != origin/dev`, naming the failing check), (iii) run-in-flight guard (`--force-run` override), (iv) gate-chain assertion (`bkit:gate:*` unresolved), (v) install read-back stop (`bkit.issueTracker` != `github`, or version unreadable via `.bkit-version`, aborts with no push and no issue filed), (vi) `gh` stub `auth status` shape + non-`api` exit 1.
- [ ] **Task 7 (WS-6): Author `examples/analysis-prompt.md`.** Content per Architecture: what it reads; the outcome + three trajectory dimensions; trap detection as a distinct correctness observation; records the run's merge SHA + `bkitVersion` + the **prompt revision** alongside the score; commits report + screenshot; names the screenshot fetch path (`gh run download -n <artefact name>` or the committed copy — KN-27); docs-only commit (no `[skip ci]`); abort handling; never published. **Done when:** the file exists; it names the report path `docs/plans/{YYYYMM}/logs/{FID}/analysis-run{N}.md` and screenshot path; it records the prompt revision with the score; it names the screenshot fetch mechanism; it never gates.
- [ ] **Task 8 (WS-9): Register the new paths in bkit's own gates.** Requires Task 3 (the `bkit-ci.yml` to lint) and Tasks 4–5 (the `new-run.mjs` kept scanned). Add `examples/bkit-explainer/**` to `slop-scan.config.json` `ignores`; add the fixture path to the `bkit:lint:workflows` script **and** the bkit CI actionlint step **without dropping the existing `.github/workflows/*` scan** — `actionlint` positional file args **replace** the default scan, so use two invocations (bare + fixture path) or one invocation naming both `.github/workflows/*.yml` and the fixture path, in **both** sites; add `--glob='examples/*.md'` (top-level only — **not** `examples/**/*.md`, which would pull the slop-ignored fixture prose under the prose gate) to the `lint:prose` script; format the fixture; keep `scripts/example/new-run.mjs` scanned and slop-clean; adjust `.prettierignore` only if needed. **Done when:** `pnpm bkit:gate:static` is green over the new paths; the fixture workflow is linted **and** the pre-existing `.github/workflows/*` scan is retained — prove-it-can-fail pair: break any `.github/workflows/*` file → red, break `examples/bkit-explainer/harness/bkit-ci.yml` → red; `lint:prose` covers `examples/README.md` + `examples/analysis-prompt.md`; `new-run.mjs` is not ignored; the prove-it-can-fail transient break is reverted within the task so it cannot weaken CI.
- [ ] **Task 9 (WS-7 + WS-5): Author `examples/README.md` and register the docs.** The contract table (incl. the WS-5 read path — attempted-vs-completed counting (`git log --grep` reset commits vs `outcome` rows) and per-version failure rates — median-table shape, run-marker, version-grouping, rulesets constraint, privacy, run merge SHA, trajectory rubric names, the explicit `[skip ci]` recovery procedure (KN-11), breaking-release runbook, and the `data.js` **owner-check cadence** — per-release canary owner, the WS-1 open question); register `examples/README.md` + `examples/analysis-prompt.md` in `.agents/docs.md` **Project Documents** (below `bkit:end`, never inside the managed block); write all `docs/decisions.jsonl` ADR rows for the cycle; update `docs/architecture.md`, `docs/technology.md`, `docs/testing.md`, `docs/deployments.md` (stale actionlint-scope row) (and `docs/observability.md` if the label graduates). **Done when:** the two docs exist and are registered in `.agents/docs.md` under **Project Documents**; the contract table names the `data.js` owner-check cadence, the WS-5 attempted-vs-completed counting, and the `[skip ci]` recovery procedure; the ADR rows are appended in `.bkit/jsonl.md` format; the affected docs read as ground truth (no lazy bullet appends).

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row and its search still holds; every `EXTEND` landed as a modification of the named artifact, not a parallel file. No type-system escapes, linter disables, test skips, deleted assertions, empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Backend / pipeline logic** — test at the unit/integration tier, not through a browser. Mock HTTP and assert against the real datastore natively.
> - **End-to-end integration** — core data paths need at least 1 integration test firing the real API against a local DB _without_ ORM/DB mocking.
> - **UI E2E (browser or device) for UI only** — don't drive a UI for non-visual logic.
>
> **This cycle has no DB and no UI.** The runner's automated verification is `bats` over the `gh` stub (WS-8); bootstrap-verify stays on the live canary; `node --test` is the _built app's_ runner (a run-time concern), not this cycle's.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each `Acceptance Scenario → Derived Test Matrix` row → one runbook task whose `Done when` carries its test; gaps → add to that task, not here.
- [ ] **Sweep existing tests:** Each task fixed the tests it broke; full suite green per `docs/testing.md` (`pnpm vitest run`, `bats tests/*.bats`). Fix only what tasks missed.
- [ ] **Sweep new tests:** Each task's `Done when` tests exist and pass per Testing Strategy; add only what tasks missed.
- [ ] **Verify observability:** the runner's `[bkit-example]` line per transition; no bkit-engine logger change.
- [ ] **Update documentation:** Integrate into affected docs — `docs/architecture.md`, `docs/technology.md`, `docs/testing.md`, `docs/decisions.jsonl`, `.agents/docs.md`; rewrite ground-truth prose.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, not merge gates.** Only `Agent Execution Runbook` `Done when` lines gate merge; nothing here does.

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit` (typecheck · lint · `format:check` · `format:tables:check` · `lint:prose` · `slop:delta` · `vitest run` · bats) + `bkit check`. Do not weaken gates.
- [ ] **Test Synchronization:** No existing E2E tests to update; ensure `tests/gh-stub-smoke.bats` and `tests/bkit-cloud-bootstrap-preflight.bats` still pass after the stub is extended.
- [ ] **Build Configuration:** No build-config change; `scripts/example/new-run.mjs` sits outside `tsconfig`/vitest include by design; keep it out of the production build.
- [ ] **Bats (`tests/example-run.bats`):** the matrix rows — reset-scope, preflight, run-in-flight guard, gate-chain assertion, install read-back stop (`issueTracker` != `github`), `gh` stub `auth status`.
- [ ] **Fixture static checks:** `pnpm bkit:gate:static` over `examples/**` (format + slop ignore confined to fixture data); `actionlint` over `examples/bkit-explainer/harness/bkit-ci.yml` via the registered coverage.
- [ ] **Apply local migrations:** N/A — no migrations.
- [ ] **Run all tests:** `pnpm vitest run` + `bats tests/*.bats`; fix failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** Build / compiler / test errors during verification → never hot-fix or anti-pattern; follow `docs/architecture.md` + named reference repos. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results) gathered.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (`gh`, `node`, `pnpm`) to verify instead of asking users to check dashboards.

- [ ] **Step 1:** From a bkit checkout, run `node --check` on the runner; run `bats tests/example-run.bats`. Confirm all pass.
- [ ] **Step 2 (live canary, maintainer-only):** Run `node scripts/example/new-run.mjs --bootstrap` once against `cbartens/bkit-example` → confirm the repo is created/seeded or verified-repaired, the ruleset exists (`gh api repos/cbartens/bkit-example/rulesets`), and `main` carries the fixture. This is the C10 de-risking path — binding: no smoke job, no dry-run repo.
- [ ] **Step 3 (live canary, maintainer-only):** Run one full run (`new-run.mjs` no flag → start pipeline → sign off → ship) → confirm the reset commit marker, the merged PR, `bkit-tests-check` green at head, and the committed `analysis-run{N}.md` + `screenshot-run{N}.png`.
- [ ] **Step 4:** Read `dev:.bkit/stats.jsonl`, group `outcome` rows by `bkitVersion`, run-scope by the reset marker, and record the median in `examples/README.md` — confirms the WS-5 read path is usable as written.
