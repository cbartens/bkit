Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Verified against the tree: `examples/` and `scripts/example/` absent (net-new); `tests/fixtures/gh/bin/gh` exists (8134 bytes, non-`api` argv exit-1 guard at line 51, four `gh api` shapes); `package.json` `files` excludes `examples/` ✓; `bats tests/*.bats` glob auto-includes the new suite ✓.

<!-- prettier-ignore -->
| Task | Surfaces touched | Consumers / downstream readers | Risk class |
| --- | --- | --- | --- |
| 1 (WS-1) | NEW `examples/bkit-explainer/{index.html,data.js,FEATURE-REQUEST.md}` | In-repo: prettier `--check .` (covers); `slop:delta` via new ignore (Task 8). Run-time: run-repo CI sentinel step; future built app reads `data.js` contract (`phases`/`nodes`/`edges`/`counters`/`handover`) | New files; sentinel single-source enforced by Task 1 `Done when` ("appears only in `index.html`") |
| 2 (WS-2) | NEW `harness/{package.json,pnpm-lock.yaml,README.md,gitignore}` | Run repo root (bootstrap publish); bkit engine reads `bkit.issueTracker`/`capstoneJob`/`ciWorkflow` at run time; pnpm reads lockfile. **Cross-file contract:** `bkit.capstoneJob`/`ciWorkflow` must equal Task 3's job name / published filename — no author-time assertion (OPTIONAL 3) | New files; magic-string contract (design-named risk) |
| 3 (WS-3) | NEW `harness/bkit-ci.yml` | Run repo Actions (published path `.github/workflows/bkit-ci.yml`); bkit-side actionlint (Task 8); `/bkit-ship` merge gate reads `bkit-tests-check` at run time. `run:` blocks subject to KN-31 (grep exit-1 under `pipefail`) / KN-37 (context expansion — natively caught by actionlint `[expression]`, probed) | New file, highest-content artefact; static-gated via Task 8 (see CRITICAL 1) |
| 4 (WS-4) | NEW `scripts/example/new-run.mjs` (bootstrap + rulesets) | External boundary: GitHub (`gh repo create`, `gh api …/rulesets`). No bats possible (stub exits 1 on non-`api` argv); boundary verification = live canary (Manual Verification Step 2, ground-truth `gh api` asserts) per binding C10 decision (OPTIONAL 5) | External-boundary task, canary-verified by design |
| 5 (WS-4) | Same file (per-run path) | Bats suite (Task 6); destructive delete scoped to `example/` with pre/post assertions; read-backs per KN-9 (`.bkit-version` JSON schema ✓), KN-11 (no skip markers ✓) | Destructive-op surface, bats-covered (matrix rows 1–4) |
| 6 (WS-8) | MODIFY `tests/fixtures/gh/bin/gh`; NEW `tests/example-run.bats` | **Shared-fixture regression surface:** existing consumers `tests/gh-stub-smoke.bats`, `tests/bkit-cloud-bootstrap-preflight.bats` — guarded by matrix row 5 (exit-1 contract preserved) + Verification Plan test-sync ✓ | Shared fixture, covered |
| 7 (WS-6) | NEW `examples/analysis-prompt.md` | Maintainer's agent host only (never published); screenshot fetch idiom per KN-27 (OPTIONAL 4) | New doc; prose-gate hole (CRITICAL 2) |
| 8 (WS-9) | MODIFY `slop-scan.config.json` (consumer: `bkit ci slop`; root-relative ignore correct per KN-32); MODIFY `package.json` `bkit:lint:workflows` (consumers: `.husky/pre-push` source copy, local runs; no test snapshots it); MODIFY `.github/workflows/bkit-ci.yml` actionlint step (consumer: CI static lane; CI-edit confirmation flagged ✓); MODIFY `.prettierignore` (conditional) | **High-risk shared-gate surfaces** — see CRITICAL 1 (actionlint retention) and CRITICAL 2 (`lint:prose` glob hole) | High-risk; two CRITICALs |
| 9 (WS-7+5) | NEW `examples/README.md`; MODIFY `.agents/docs.md`, `docs/architecture.md`, `docs/technology.md`, `docs/testing.md`; APPEND `docs/decisions.jsonl` (sole writer ✓ — no EOF multi-writer conflict) | `.agents/docs.md` rows must land in **Project Documents** below `bkit:end` (managed block is force-overwritten / drift-checked — OPTIONAL 6); `docs/deployments.md` row 8 + `docs/technology.md` actionlint row go stale after WS-9 (OPTIONAL 7) | Docs surfaces; prose-gate hole (CRITICAL 2) |

Schemas / tables / endpoints: none (no DB). File-shape contracts: harness `package.json` `bkit` block ↔ run-time engine readers; fixture workflow job name ↔ ship merge gate. Ledger rows: read-only this cycle, no envelope change ✓.

## CRITICAL

**1. Task 8 — actionlint "extension" silently drops `.github/workflows/*` coverage (probed, silent).** `actionlint` with positional file args **replaces** the default `.github/workflows/` scan — verified locally with actionlint 1.7.12: `actionlint fixture.yml` reported only the fixture file and produced **zero** findings for a deliberately broken `.github/workflows/a.yml` in the same repo. The current invocation sites are bare: `package.json` `bkit:lint:workflows` (`actionlint`) and `.github/workflows/bkit-ci.yml` (`"$RUNNER_TEMP/actionlint" -color`). A naive WS-9 edit — `actionlint examples/bkit-explainer/harness/bkit-ci.yml` — hollows bkit's own static gate and the source-repo pre-push hook: every existing workflow file stops being linted, nothing reds, coverage loss is invisible (the exact "Validated means executed" hollow-green class, `docs/testing.md`). Task 8's `Done when` asserts only "the fixture workflow is covered by the actionlint invocation" — no retention assertion on the pre-existing scan. **Fix:** two invocations (bare + fixture path) or one invocation listing both `.github/workflows/*.yml` and the fixture path, in **both** the script and the CI step; extend `Done when` with a prove-it-can-fail pair: break any `.github/workflows/*` file → red, break the fixture workflow → red.

**2. Tasks 8/9 — `lint:prose` glob list omits `examples/*.md`; the two new contract docs land outside the prose gate.** `package.json` `lint:prose` = `bkit ci prose --glob='.agents/*.md' … --glob='docs/*.md' --glob='*.md'` — single-level `docs/*.md` and root `*.md`; nothing matches `examples/README.md` or `examples/analysis-prompt.md`. The design (WS-7) binds both docs to the prose rules (`.bkit/core/prompts/bkit-utility-compress-markdown.md`), and the Derived Test Matrix assigns every change to the global Static gate — yet the prose tier of that gate never sees these files (KN-29 class: prose outside the lint list stays green while unlinted). Task 8's registration scope covers slop, actionlint and prettier but not `lint:prose`. **Fix:** add `--glob='examples/*.md'` (top-level only — **not** `examples/**/*.md`, which would pull the deliberately-unlinted fixture prose under the slop-ignored `examples/bkit-explainer/**`) to the `lint:prose` script in Task 8's scope and `Done when`.

## OPTIONAL

1. **Task 2×3 cross-file contract guard.** `bkit.capstoneJob`/`bkit.ciWorkflow` in `harness/package.json` must equal the job name / published filename in `harness/bkit-ci.yml`. The design names this magic-string drift risk; bootstrap verify-mode only re-publishes the source faithfully, so an internal inconsistency is caught only live at ship. One cheap static assertion (bats case or `node -e` comparing the two fixture sources) in Task 2/3's `Done when` closes it at author time.
2. **Task 3 — KN-31 idiom for the privacy scan.** Implement the diff scan with portable grep (BRE/ERE; no `grep -oP` lookbehind) and guard the no-match exit-1 under `set -euo pipefail` (`|| true` / `if` guard), or a clean no-match aborts the step red. KN-37 needs no action: actionlint's `[expression]` rule flags untrusted context expansion natively (probed) once the file is linted per WS-9.
3. **Task 7 — name the screenshot fetch path.** `actions/upload-artifact` content is invisible to `gh run view --log-failed` (KN-27); the analysis prompt should name the artefact name and `gh run download -n <name>` (or the committed copy) as the fetch mechanism.
4. **Task 4 — link the boundary assertion explicitly.** Mechanical reading of the mock-only-coverage rule flags bootstrap (external `gh` boundary, no non-mock `Done when` test). Context: the binding C10 decision assigns bootstrap verification to the live canary, and Manual Verification Step 2 does reach the real boundary with ground-truth asserts (`gh api repos/…/rulesets`, `main` carries fixture); the ruleset payload's worst misconfiguration (`required_pull_request_reviews` on `dev`) is statically barred in `Done when`. Recorded here for the merge, not re-litigated. Suggest Task 4's `Done when` cross-reference Manual Verification Step 2 as its boundary assertion so the linkage survives execution.
5. **Task 9 — `.agents/docs.md` placement.** Register the two rows in **Project Documents** (below `bkit:end`), never inside the bkit-managed block (force-overwritten on install / drift-checked by `bkit check`). State the section in `Done when`.
6. **Task 9 — doc drift on actionlint scope.** `docs/deployments.md` row 8 and `docs/technology.md` describe actionlint coverage as `.github/workflows/*`; stale after WS-9. Add both to the Documentation Updates list.
7. **Task 9 — contract-table completeness.** Design WS-7 scope includes the `data.js` owner-check cadence (per-release canary owner); not named in Task 9's row list — confirm it lands in `examples/README.md`.
8. **Fixture workflow floating `@v4` tags (KN-3).** Read-only perms + no secrets + matches consumer-template convention → acceptable; flag consciously because the file is published into a public demo repo visitors may copy. Pin to SHAs only if the demo-audience copy risk is judged material.

## OUT OF SCOPE

1. Fixing `runs-gate-repo-flag-ignored-pr-resolved-from-checkout` (OPEN, HIGH) — correctly kept deferred; the plan encodes the constraint (bats non-scope + contract table) without adopting the broken pair.
2. Promoting the executed-count observation from recorded to gating (design open question B) — a later decision once runs show the build reliably writes tests.
3. A generalised manifest-declared actionlint path list (if more out-of-tree workflow files appear) — today's single explicit registration is sufficient.
4. A remote drift guard asserting the run repo's live ruleset state beyond bootstrap verify-mode.
