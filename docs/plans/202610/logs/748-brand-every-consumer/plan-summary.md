Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS
- plan-apply-review CONCERNS
- 2 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202610/logs/748-brand-every-consumer/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202610/logs/748-brand-every-consumer/plan-v1-draft.md`, `docs/plans/202610/logs/748-brand-every-consumer/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202610/logs/748-brand-every-consumer/related-deferrals.md`, `docs/plans/202610/logs/748-brand-every-consumer/related-failures.md`, `docs/plans/202610/logs/748-brand-every-consumer/related-issues.md` |
| plan-review | CONCERNS | 25 | 1 | `docs/plans/202610/logs/748-brand-every-consumer/plan-review-1.md`, `docs/plans/202610/logs/748-brand-every-consumer/plan-review-2.md`, `docs/plans/202610/logs/748-brand-every-consumer/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202610/logs/748-brand-every-consumer/plan-v2-reviewed.md`, `docs/plans/202610/logs/748-brand-every-consumer/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

Branding: every name a consumer or their agent runs or sees in a consumer repo carries `bkit-` (package.json script names `bkit:`), so bkit's value shows wherever it works. An upgrade migration (`docs/migrations.md`) brings them current, so `bkit upgrade` alone is enough.

### Success Criteria

- Every package.json script name `.bkit/templates.md` seeds or lists whose command runs bkit code starts with `bkit:`; `typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare` keep their names.
- Every workflow `name:` and job display name in `.bkit/templates/.github/workflows/*.yml` (smoke stub included) starts with `bkit-`, and the smoke stub listens on `bkit-ci`.
- The shipped Vale style is `Bkit`; `.vale.ini` and every doc reference name `Bkit.*`.
- `bkit upgrade` on a consumer with the old names renames them in package.json, `.husky/pre-commit`, `.husky/pre-push`, the `bkit.testing.ciWorkflow` file and bkit's shipped workflow / Vale copies; a second run changes nothing.
- A branding guard test fails when a new consumer-facing script, check or style name lacks the prefix; `.agents/rules.md` § Naming Conventions states the rule and `docs/decisions.jsonl` records why.

### Process Sketch

- WHEN a consumer on the old names runs `bkit upgrade` → THEN package.json keys `lint:prose`, `slop:delta` and bkit-valued `graph*` become `bkit:lint:prose`, `bkit:slop:delta`, `bkit:graph*` with values kept, every whole `pnpm [flags] [run] <old>` token in script values, `.husky/pre-commit`, `.husky/pre-push` and the CI workflow file names the new script, and an old name the rewrite cannot reach is logged with file and line.
- WHEN `scripts/ci/` holds shipped-content copies of the renamed CI scripts → THEN each script moves with its `.test.mjs` and data file to its `bkit-` name and every `scripts/ci/<old>` path in the CI workflow, `.husky/*`, `bkit-trivy.yml` and package.json values names the new file; an edited copy stays and is logged.
- WHEN a shipped workflow still carries the exact old `name:` line (`Trivy`, `Renovate`, `context (…)`, `claude (…)`, `opencode (…)`, the smoke stub) → THEN it reads `bkit-*`, the upgrade log names each renamed check, and a customised line stays.
- WHEN `.vale/styles/House/` holds the four shipped rules plus the consumer's own → THEN only rules matching a shipped release hash move to `.vale/styles/Bkit/`; own and edited rules stay in `House` (edited ones logged) and `.vale.ini` lists both styles.
- WHEN the consumer already has both an old and a new key, a foreign `graph*` script, or no `.husky/`, CI workflow, `scripts/ci/` or `.vale/` → THEN that pair or file is left alone (both-keys pair logged once, missing files silent).
- WHEN `bkit upgrade --dry-run` runs, or `bkit upgrade` runs a second time → THEN the first computes the same writeset and writes nothing; the second writes nothing.
- WHEN a contributor adds a template script, workflow or job display name, Vale style or template file without the prefix → THEN `.bkit/core/engine/audits/templates/branding.test.ts` fails.

### Concrete Example

Role: maintainer of a consumer repo installed on bkit 6.0.0.

Starting state: `package.json` holds `"lint:prose": "bkit ci prose"`, `"slop:delta": "bkit ci slop"`, `"graph:update": "bash scripts/graphify/bkit-graphify.sh update"`, `"docs:check": "pnpm lint:prose && pnpm graph:update"` and the old default `bkit:gate:static`; `.husky/pre-push` runs `pnpm slop:delta "$BASE"`; `.github/workflows/bkit-trivy.yml` is the shipped copy (`name: Trivy`, job `trivy:` with no `name:`); `scripts/ci/check-capstone.mjs` and `check-capstone.test.mjs` are the shipped copies and the CI workflow's capstone step runs `node scripts/ci/check-capstone.mjs`; `.vale/styles/House/` holds the four shipped rules plus their own `Acronyms.yml`.

1. Maintainer runs `bkit upgrade --dry-run`; the log lists the package.json, `.husky/pre-push`, CI workflow, `scripts/ci/` move, `bkit-trivy.yml`, Vale and `.vale.ini` writes; no file changes.
2. Maintainer runs `bkit upgrade`.
3. Maintainer runs `bkit upgrade` again.

Observable outcome: after step 2 `package.json` holds `bkit:lint:prose`, `bkit:slop:delta`, `bkit:graph:update` (same values), `"docs:check": "pnpm bkit:lint:prose && pnpm bkit:graph:update"` and the new default `bkit:gate:static`; `.husky/pre-push` runs `pnpm bkit:slop:delta "$BASE"`; `bkit-trivy.yml` reads `name: bkit-trivy` for the workflow and the job, and the log line says the check `Trivy / trivy` is now `bkit-trivy / bkit-trivy` and names the branch-protection fix; `scripts/ci/bkit-check-capstone.mjs` and `bkit-check-capstone.test.mjs` replace the old pair and the capstone step runs `node scripts/ci/bkit-check-capstone.mjs`; `.vale/styles/Bkit/` holds the four shipped rules, `House/` holds `Acronyms.yml`, `.vale.ini` `BasedOnStyles` lists `Bkit, House`; `pnpm bkit:lint:prose` prints findings as `Bkit.LLMSlop`. Step 3 writes nothing.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer has `lint:prose` with a customised value | Key renamed to `bkit:lint:prose`, value kept |
| Consumer already has both `lint:prose` and `bkit:lint:prose` | Nothing renamed; old key left; logged once |
| Consumer script value calls `pnpm graph:update` or `pnpm run lint:prose` | Token rewritten to the new name; rest of the value untouched |
| `bkit:gate:static` holds the old default chain | Rewritten to the new default chain |
| Consumer's `.vale/styles/House/` holds the four shipped rules plus their own | Only files matching a shipped release hash move to `Bkit/`; own rules stay in `House`; `.vale.ini` `BasedOnStyles` lists both |
| Consumer edited a shipped Vale rule | File left in `House`; logged |
| Consumer's workflow `name:` line was customised | Left alone; only the exact shipped old line is rewritten |
| Consumer has no `.husky/`, no CI workflow or no `.vale/` | Skipped silently |
| `--dry-run` | Same writeset computed, nothing written |
| Consumer marked `Trivy / trivy` or a cloud job as a required branch-protection check | Not touched by the migration (only `bkit-tests-check` is the documented required check); see Open Questions |
| Token is a prefix of a longer name (`pnpm graph:update-all`, `pnpm lint:prose2`) or not a pnpm call (`npm run lint:prose`, `echo lint:prose`) | Left untouched; only a whole `pnpm [flags] [run] [flags] <old>` token followed by a character outside `[\w:-]` or end of text is rewritten |
| `pnpm` flag forms (`pnpm -s lint:prose`, `pnpm run --silent slop:delta`) | Rewritten to the new name; flags kept |
| An option taking a separate value (`pnpm --filter web lint:prose`) or another runner leaves an old name in a migrated file | Left; one `console.warn` naming the file, line and old name |
| Consumer's `graph*` script runs something else (`"graph": "nx graph"`) | Key, value and `pnpm graph` tokens left; only values running `scripts/graphify/bkit-` count as bkit's |
| `bkit:gate:*` value wraps the chain (`bash scripts/ci/bkit-machine-lock.sh run --lock tests -- pnpm lint:prose`) | Tokens inside the wrapper rewritten; wrapper kept |
| `scripts/ci/check-capstone.mjs` and its `.test.mjs` hold shipped content | Both replaced by the shipped `bkit-check-capstone.mjs` / `.test.mjs`; `scripts/ci/check-capstone.mjs` paths in the CI workflow, `.husky/*` and package.json values rewritten |
| Consumer edited a CI script copy or its `.test.mjs`, or the `bkit-` target exists | That unit (script, `.test.mjs`, data file) left at the old name; one `console.warn` naming the manual move |
| `accepted-advisories.json` / `accepted-divergences.json` present | Moved byte-identical with its reader script; left when the reader stays |
| `~/Library/LaunchAgents/ai.bkit.launchd.plist` or `~/.config/bkit/launchd.env` installed from the old template | Not touched (machine-local); the Label and destination paths stay |
| A contributor adds a template script, workflow or job display name, Vale style or template file without the prefix | `branding.test.ts` fails |
| `bkit.testing.ciWorkflow` names a custom file (`ci.yml`) | That file gets the token rewrite and the smoke-stub rewrite; `.github/workflows/bkit-ci.yml` is not looked for |
| Shipped `renovate:` / `trivy:` job already carries a `name:` line | No `name:` inserted; an exact old line is rewritten, any other kept |
| Consumer copied the smoke stub to `.github/workflows/smoke.yml` | Stub lines rewritten, `workflows:` set to the CI workflow's own `name:` (fallback `bkit-ci`), file moved to `bkit-smoke.yml`; an existing `bkit-smoke.yml` keeps the file in place and logs |
| Every `House` rule moved | `House/` removed; `BasedOnStyles` names `Bkit` alone; `House.<rule>` toggles read `Bkit.<rule>` |
| `.vale/` present, `.vale.ini` absent | Rules move; no `.vale.ini` write |
| `package.json` is not valid JSON | Existing `parseJson` error path; no migration write, error reaches the upgrade output |
| Smoke or health stub copied into the CI workflow file | Stub comment lines rewritten in place: `bkit-smoke.yml` / `name: bkit-smoke` / job `name: bkit-smoke` / `workflows: [bkit-ci]`; `health.yml` → `bkit-health.yml` |

## Open Questions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question 1:** A consumer who made a cloud, Renovate or Trivy check a required branch-protection check gets a stuck PR after the rename. What does bkit do? → owner decides at plan review.
  - **Options:** A) Release notes only — no code; a consumer who misses the note learns from a stuck PR · B) Detect-only `bkit check` advisory reading branch protection via `gh api` — catches it before the PR, but needs a token with admin read scope that most installs lack and adds a network call to `bkit check` · C) One upgrade log line per renamed check, naming old → new check and the branch-protection setting to change — shown exactly when the rename lands, no token or network, but not repeated after that run
  - **Recommended:** C) — the message reaches the person at the moment the name changes, with no new credential (Task 9 lands it; `CHANGELOG.md` carries the same note in Task 12)
  - **Default if unanswered:** C
- **Open Question 2:** Twelve copy-and-own template files lack `bkit-` (`.bkit/templates/scripts/ci/check-capstone.mjs`, `check-capstone.test.mjs`, `check-dependency-audit.mjs`, `check-dependency-audit.test.mjs`, `check-accepted-divergences.mjs`, `check-accepted-divergences.test.mjs`, `accepted-advisories.json`, `accepted-divergences.json`, `lanes/resolve-push-base.mjs`, `lanes/resolve-push-base.test.mjs`, `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist`, `launchd.env.example`); the issue assumed none did, and its guard spec (issue Task 7) covers every file under `.bkit/templates/scripts/` and `.bkit/templates/context/` with no exception list. → owner decides at plan review.
  - **Options:** A) Rename all in this plan (Task 2 templates and bkit's copies, Task 8 upgrade migration): a consumer's shipped-content copies move as units (script, `.test.mjs`, data file) and their `scripts/ci/` paths in the CI workflow, `.husky/*`, `bkit-trivy.yml` and package.json values are rewritten in the same upgrade — meets the Narrative; changes the script path behind the required `bkit-tests-check` in every consumer, and an edited copy stays on the old name until moved by hand · B) Owner narrows #748's Narrative to exclude these files; the guard keeps them as a named exception list and a separate plan renames them — smaller change now, but the twelve keep unbranded names consumers run in CI, and only the owner can amend the Narrative
  - **Recommended:** A) — the Narrative (word for word from #748) covers names a consumer runs in CI, so the plan cannot exempt them itself; deferral `748-rename-unprefixed-template-script-files` is triaged to Tasks 2 and 8
  - **Default if unanswered:** A
- **Open Question 3:** A consumer copied the smoke stub to `.github/workflows/smoke.yml` (it never fired: `workflows: ["CI"]`). What does the migration do? → owner decides at plan review.
  - **Options:** A) Rewrite the stub lines, set `workflows:` to the CI workflow's own `name:` (fallback `bkit-ci`) and move the file to `bkit-smoke.yml` unless that file exists — the copy starts firing under the branded name · B) Rewrite in place, keep `smoke.yml` — fires, but the file name stays unbranded · C) Advisory only — no write; the copy keeps never firing until a human acts
  - **Recommended:** A) — matches the shipped stub exactly; the existing-file guard keeps it from clobbering
  - **Default if unanswered:** A
- **Open Question 4:** A consumer's `scripts/graphify/*` copies keep hints naming `pnpm graph:*`, and the rollup writes those names into `docs/capabilities.md`. Rewrite them? → owner decides at plan review.
  - **Options:** A) Leave them; the `syncTemplateCopies` report lists the changed template copies for the consumer to adopt — no surprise rewrite of copy-and-own scripts · B) Token-rewrite `pnpm graph*` in the copies — hints match at once, but the rollup's `docs/capabilities.md` header changes on the next run and a consumer's `bkit:graph:check` goes red until they refresh
  - **Recommended:** A) — hints are text only (no script invokes another through them) and Success Criterion 4 names no graphify copy
  - **Default if unanswered:** A
- **Assumption:** Only scripts whose command runs bkit code are renamed; `lint:slop` (third-party `slop-scan`, report-only) keeps its name → if wrong, `lint:slop` needs the same rename, migration entry and guard row.
- **Assumption:** Only display names change in workflows; job ids (`context`, `run`, `opencode`, `renovate`, `trivy`) stay → if wrong, `needs:` references and consumer edits keyed on ids break and the migration must rewrite them.
- **Assumption:** A consumer's own scripts that wrap bkit tools (`db:reset` → `bkit-local-stack-lock.sh`) are the consumer's names and stay; so does `./scripts/ci/smoke-test.sh`, which the smoke stub calls and the consumer writes (bkit ships none) → if wrong, the guard and migration need a list of wrapper names bkit does not ship, and the stub names `bkit-smoke-test.sh`.
- **Assumption:** The migration rewrites only whole `pnpm [flags] [run] [flags] <old>` tokens (flags without a separate value); `npm run`, `yarn`, value-taking options (`--filter web`) and bare words stay, and each surviving old name in a migrated file logs one warning with file and line → if wrong, consumers calling the scripts through another runner keep old names and their gates fail with a missing script after the warning.
- **Assumption:** `graph*` keys are renamed only when their value runs `scripts/graphify/bkit-`; `lint:prose` / `slop:delta` are renamed whatever their value (issue Edge Case "customised value") → if wrong, a consumer's own `lint:prose` moves under the bkit name, or a bkit graphify script wired through a wrapper keeps `graph*`.
- **Assumption:** The LaunchAgent Label `ai.bkit.launchd` and the machine-local destinations (`~/Library/LaunchAgents/ai.bkit.launchd.plist`, `~/.config/bkit/launchd.env`) keep their names: launchd names the agent by its reverse-DNS Label, which already carries bkit, and bkit never writes outside the repo → if wrong, the Label and destinations rename too and every loaded agent needs `launchctl bootout` / `bootstrap` by hand.
- **Assumption:** #724 wraps bkit's own `bkit:gate:*` values (`bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate>`) and edits `.bkit/core/.bkit/templates.md` § Gate tool scripts; whichever lands second rebases, and `renameScriptTokens` rewrites tokens inside a wrapped chain (Task 4 test) → if wrong (the wrapper quotes the chain as one argument), wrapped chains keep old names and the residual warning names them.
- **Assumption:** `.bkit/core/engine/checks/after/runs.ts:144-149` `pr-present` probe matches any check whose name includes `checkNamespace(capstone)`; only a single-dash custom capstone (`bkit-check` → namespace `bkit`) now also matches `bkit-renovate`, `bkit-trivy`, `bkit-smoke` → if such a consumer exists, the probe reports a PR from those checks and needs an exact-prefix match.
- **Assumption:** bkit-repo-only scripts (`format:tables*`, `harvest`, `instructions:*`, `grammar:density`, `cli:sync`) are not consumer-facing and keep their names → if wrong, bkit's own `package.json`, `.agents/rules.md` and `docs/*` need a second rename pass.
- **Assumption:** #719 adds a `codex` job to `bkit-cloud.yml` after this lands and names it `bkit-cloud-codex (…)` → if #719 lands first, Task 5 brands its job too and the branding guard fails #719 if it ships an unprefixed name.
- **Assumption:** The four shipped Vale rules and the eight CI scripts have a small set of distinct release contents reachable from `git tag -l 'v*'` at every path each file has had (`git log --all --follow --name-only -- <current path>` lists them) → if a release shipped a content no tag holds, a consumer's unedited copy stays on the old name and is logged as edited.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #748
```

Or, to address the reasons first: `/bkit-plan #748`
