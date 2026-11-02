Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: the CI failure is pinned to four named test helpers by a verbatim git error on 19 assertions, and the fix (byte-exact fixtures) can be checked locally by removing the tag from reach.

## CI Run

[Run #41537770077](https://github.com/cbartens/bkit/actions/runs/41537770077) (`bkit-ci`, head 16a630e29, failure: `bkit-tests-integration` and `bkit-tests-check`). Same failure in [Run #41405235221](https://github.com/cbartens/bkit/actions/runs/41405235221) on 9630471bf. `context-ci-github-1.md` named [Run #41537770079](https://github.com/cbartens/bkit/actions/runs/41537770079) as "concluded success", but that run is the `Trivy` workflow (only job `bkit-trivy`), not `bkit-ci`.

## Prior Attempts Reviewed

None

## Prior Knowledge

- `spawn-heavy-unit-suite-needs-its-own-budget-under-load`: the load-scaled budget's factor is `loadAverage / cores` floored at 1, so a box at capacity scales nothing — applied as the explanation for the local `instructions.test.ts` timeout (Failure 2), which is not this branch's defect.
- `local-pnpm-test-full-parallelism-integration-timeouts-flake`: re-run a timed-out file alone before treating it as a regression — applied: the case passed alone in 10.82s.
- `instructions-corpus-store-timeout-under-full-gate` (`docs/failures.jsonl`, TRIAGED): same test, same symptom — applied as confirmation that Failure 2 is a known, pre-existing row.
- Reverted commits touching the candidate files (`instructions.ts`, `instructions.test.ts`, `vitest.timeout-budget.ts`, `vitest.config.ts`, the two integration tests): none found (the same `git log -i --grep=revert` query returns hits repo-wide, so the read works).
- External signal: `context-web-tavily-1.md` covers only the vitest timeout (e.g. https://github.com/vitest-dev/vitest/discussions/9683, "Vitest may be spawning too many workers"); for the tag symptom, https://raw.githubusercontent.com/actions/checkout/main/README.md: "Only a single commit is fetched by default, for the ref/SHA that triggered the workflow." and `fetch-tags` "Default: false".

## Related Issues

- #814 — Give load-sensitive tests a budget that holds under the full gate (OPEN)
- #345 — Failures triage (OPEN)

## Failures

1. **CI, blocking, deterministic.** `bkit-tests-integration` in run 41537770077: `Tests  19 failed | 1712 passed (1731)`, every one `AssertionError: fatal: invalid object name 'v6.0.0'.`, in `.bkit/core/engine/commands/install/upgrade.integration.test.ts` and `.bkit/core/engine/install/modules/core.integration.test.ts` (suites `#255 — upgrade does not force-create uninstalled host/tooling modules`, `migrateBrandedTemplateFiles`, `migrateBrandedCheckNames`, `migrateValeHouseStyle`). `bkit-tests-check` fails only as a consequence: `##[error]plan.run_level=full but bkit-tests-integration result=failure`. `bkit-tests-static` and `bkit-tests-unit` passed.
2. **Local, intermittent, load-only, not caused by this branch.** `context-tests-local-1.md` (`pnpm bkit:gate:static-unit-integration`): `FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings`, `Error: Test timed out in 63463ms.` The case ran 112356ms under the full gate and 10.82s alone; CI's unit lane passed it (`UNIT_RAN: 6976`). Because the unit stage failed, the local gate never reached `pnpm test:integration`; locally that stage would pass anyway, since this checkout has the `v6.0.0` tag.
3. **Diagnosis input defect.** `context-ci-github-1.md` reported the CI as green because the fetch block picked the Trivy run. Failure 1 was found only by listing runs by hand.

Relationship: Failure 1 is the only thing keeping the PR red. Failure 2 is unrelated noise from the known #814 class. Failure 3 hid Failure 1 from this step's inputs.

## Root Cause

**Failure 1.**

- Proximate cause: four test helpers build "exactly as bkit 6.0.0 shipped" consumer files by running `git show v6.0.0:.bkit/templates/<path>`: `shippedOldCiScript` (`upgrade.integration.test.ts:1083-1094`), `shippedAtV6` (`upgrade.integration.test.ts:1158-1169`), `shippedOld` (`core.integration.test.ts:1782-1793`) and `shippedAtV6` (`core.integration.test.ts:1953-1964`). The `bkit-tests-integration` job checks out with `actions/checkout` defaults (`.github/workflows/bkit-ci.yml:672`, no `with:`), which fetches one commit and no tags, so `git show` exits non-zero and `expect(r.status, r.stderr).toBe(0)` fails.
- Design fragility: the test data lives in git history, not in the repo tree, so whether a test can run depends on how the repo was cloned. This affects CI, cloud agents, forks and any `--depth` clone. The main checkout and its worktrees share one `.git` that holds the tag, so local runs always hide the problem.
- Contributing factors: the shipped engine itself is safe, because it identifies old content by embedded sha256 tables (`SHIPPED_CI_SCRIPT_HASHES` at `core.ts:995`, `SHIPPED_HOUSE_RULE_HASHES` at `core.ts:1235`), so consumers are unaffected. The other lanes that need history (`bkit-tests-scope`, `bkit-tests-static`) set `fetch-depth: 0`, so nothing else in CI had reached for a tag before.

**Failure 2.**

- Proximate cause: `instructions.test.ts:55` `const CORPUS_CASE = { timeout: Math.ceil(60_000 * loadFactor()) };` is computed once when the file is imported. At that moment the factor was about 1.06; by the time the case ran, the full parallel gate (with v8 coverage) had slowed it to 112s.
- Design fragility: `loadFactor()` (`vitest.timeout-budget.ts`) is `loadAverage / cores`, floored at 1, and it is read before the gate's load builds up.
- Contributing factor: tracked by open #814 and the TRIAGED `docs/failures.jsonl` row.

**Failure 3.**

- Proximate cause: `.agents/context.md:171` `gh run list --branch "$(git branch --show-current)" --limit 1` has no `--workflow` filter. Two workflows started in the same second on the PR, and the Trivy run came first.

## Rot Signals

tests, observability, reliability, debt

- tests: `upgrade.integration.test.ts:1087,1162` and `core.integration.test.ts:1786,1957` read their data from the `v6.0.0` tag, which a default CI checkout does not contain.
- observability: `.agents/context.md:171` takes the newest run on the branch from any workflow, and so reported `run 41537770079 concluded success` while `bkit-ci` run 41537770077 on the same commit had failed.
- reliability: `instructions.test.ts:55` sets its load-scaled timeout once at import (63463ms), but the case ran 112356ms under the loaded gate.
- debt: the same tag-reading helper is copied four times across the two integration test files (`shippedOldCiScript`, `shippedAtV6` twice, `shippedOld`).

## Recommended Remediation

1. **Commit the 6.0.0 inputs as byte-exact fixtures (fixes Failure 1).**
   - Create `.bkit/core/engine/install/modules/__fixtures__/v6.0.0/`, mirroring the `.bkit/templates/` relative paths.
   - Give every file a `.fixture` suffix so prettier, oxlint, actionlint, Vale and the branding guard skip it.
   - Write each one from the tag in a script, never by hand, so the bytes stay exact. Example: `git show v6.0.0:.bkit/templates/.github/workflows/bkit-ci.yml > .bkit/core/engine/install/modules/__fixtures__/v6.0.0/.github/workflows/bkit-ci.yml.fixture`.
   - The 13 files the tests read:
     - `scripts/ci/check-capstone.mjs`, `scripts/ci/check-capstone.test.mjs`, `scripts/ci/check-dependency-audit.mjs`, `scripts/ci/check-dependency-audit.test.mjs`
     - `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-renovate.yml`, `.github/workflows/bkit-trivy.yml`
     - `.vale/styles/House/Filler.yml`, `.vale/styles/House/Hedging.yml`, `.vale/styles/House/LLMSlop.yml`, `.vale/styles/House/Verbose.yml`
     - `.vale.ini`
2. **Point the four helpers at the fixtures.**
   - `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1082-1094` (`shippedOldCiScript`) and `:1157-1169` (`shippedAtV6`).
   - `.bkit/core/engine/install/modules/core.integration.test.ts:1781-1793` (`shippedOld`) and `:1952-1964` (`shippedAtV6`).
   - Each one becomes `fs.readFileSync(path.join(<repo root>, ".bkit/core/engine/install/modules/__fixtures__/v6.0.0", rel + ".fixture"), "utf-8")`.
   - Drop the `spawnSync("git", ...)`, `GIT_DIR` and `GIT_WORK_TREE` handling from them.
   - Keep the call sites and the "shipped pre-#748 content" doc comments, reworded to name the fixture directory instead of the tag.
3. **Keep the fixtures out of the npm tarball.** Add `__fixtures__` to `.bkit/core/engine/.npmignore`, beside `*.test.ts` and `__snapshots__`. `package.json` `files` ships all of `.bkit/core`. This file is not named in the inputs, but step 1 needs it.

Do not fix this in CI by adding `fetch-tags` or `fetch-depth: 0` to `bkit-tests-integration`. That edits `.github/workflows/` (owner sign-off), and the tests would still fail in any tagless clone (Hypothesis 5).

## Out-of-Scope Recommendations

- `.bkit/core/engine/tools/instructions.test.ts:55` / `vitest.timeout-budget.ts`: the corpus case's budget is computed once at import and under-scales under a loaded gate; this belongs to #814, not #748.
- `.agents/context.md:171` (and its shipped source block, if `bkit install` renders it): add `--workflow bkit-ci.yml`, or pick the newest non-success run for the head SHA. As written, a sibling workflow's success hides a red CI run from `/bkit-debug`.
- `.github/workflows/bkit-ci.yml:672`: the `bkit-tests-integration` checkout fetches no history. Nothing needs it once the fixtures land; record it only if a future integration test needs git history.

## Blast Radius

- npm tarball (`package.json` `files` includes `.bkit/core`): the new `__fixtures__/` would ship unless `.bkit/core/engine/.npmignore` lists it. **Compatible once remediation step 3 lands**; check with `pnpm pack --dry-run`.
- `prettier --check .` (`format:check`): files ending `.fixture` have no inferred parser, so prettier's directory walk skips them. **Compatible**; check with the static gate.
- oxlint on `.bkit/core/engine`, `tsc`, vitest `include` (`.bkit/core/engine/**/*.integration.test.ts`): none of them pick up `.fixture` files. **Compatible.**
- `.bkit/core/engine/audits/templates/branding.test.ts`: scans `.bkit/templates/`, not the engine tree. **Compatible.**
- The instructions corpus and Vale prose lint read markdown only. **Compatible.**
- Engine hash tables `SHIPPED_CI_SCRIPT_HASHES` / `SHIPPED_HOUSE_RULE_HASHES`: the fixtures must hash into them, or the migration tests would take the "edited copy" path. **Compatible** if each file is written with `git show` and the bytes are left alone (no EOL rules in `.gitattributes`). Pin this with the hash test below.
- `bkit:graph:check` (graphify register): unverified whether graphify indexes non-code files under `.bkit/core/engine`. **Verify** with `pnpm bkit:graph:check` after staging (graph refresh reads staged files).
- Consumers: no shipped engine code changes. **Localised.**

## Suggested Tests

- Unit (new, e.g. `.bkit/core/engine/install/modules/v6-fixtures.test.ts`): sha256 of each `scripts/ci/*.mjs.fixture` is in `SHIPPED_CI_SCRIPT_HASHES[<old path>]`, and each `.vale/styles/House/*.yml.fixture` is in `SHIPPED_HOUSE_RULE_HASHES[<rule>]`. This proves the fixtures are genuine shipped bytes.
- Same file: every fixture equals `git show v6.0.0:.bkit/templates/<rel>` when the tag exists, using `it.skipIf(!tagPresent)`. It is a freshness check only; the migration tests never need the tag.
- Regression: run the two integration files with git unable to see the tag (`GIT_DIR=/nonexistent`, or from a `git clone --depth 1 file://…` scratch copy); all 19 previously failing cases must pass.

## Verification Commands

```bash
cd "/Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer"
# No test reads a release tag any more
git grep -n -E '"show", `v[0-9]' -- '.bkit/core/engine/**/*.test.ts'   # expect no output
# The 19 cases pass from a clone without tags (clones the committed HEAD, so commit the fix first)
rm -rf /private/tmp/claude-501/bkit-748-shallow && git clone -q --depth 1 --no-tags "file://$PWD" /private/tmp/claude-501/bkit-748-shallow
git -C /private/tmp/claude-501/bkit-748-shallow tag -l v6.0.0   # expect no output
(cd /private/tmp/claude-501/bkit-748-shallow && pnpm install --frozen-lockfile && pnpm exec vitest run .bkit/core/engine/commands/install/upgrade.integration.test.ts .bkit/core/engine/install/modules/core.integration.test.ts)
# Fixtures stay out of the tarball
pnpm pack --dry-run 2>&1 | grep -c __fixtures__   # expect 0
# Static gate and graph register
pnpm bkit:gate:static && pnpm bkit:graph:check
# Full local gate (if instructions.test.ts times out again, re-run that file alone: #814)
pnpm bkit:gate:static-unit-integration
# After push: the bkit-ci run for the new head SHA, not the newest run on the branch
gh run list --branch feat/748-brand-every-consumer --workflow bkit-ci.yml --limit 1 --json databaseId,headSha,conclusion
```

## Hypotheses

### Hypothesis 1: The 19 `bkit-tests-integration` failures come from test helpers that read the `v6.0.0` git tag, which the CI job's checkout never fetches

#### Reason

Every CI failure carries the same git error, and the four helpers that build "old 6.0.0" consumer files call `git show v6.0.0:<path>`. The local checkout has the tag and passes.

#### Act

`gh run list --branch feat/748-brand-every-consumer`; `gh run view 41537770077 --job 125594009318 --log-failed`; read `.github/workflows/bkit-ci.yml:656-700` (the `bkit-tests-integration` checkout step); read `.bkit/core/engine/commands/install/upgrade.integration.test.ts:1082-1170`; fetched `https://raw.githubusercontent.com/actions/checkout/main/README.md`.

#### Observe

- `41537770077	bkit-ci	16a630e29	completed	failure	pull_request	2026-11-02T22:30:01Z`
- `AssertionError: fatal: invalid object name 'v6.0.0'.` (19 times), `Tests  19 failed | 1712 passed (1731)`, `Test Files  2 failed | 48 passed (50)`
- Failing files: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` (`#255 — upgrade does not force-create uninstalled host/tooling modules`) and `.bkit/core/engine/install/modules/core.integration.test.ts` (`migrateBrandedTemplateFiles`, `migrateBrandedCheckNames`, `migrateValeHouseStyle`).
- `bkit-ci.yml:672`: `- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` with no `with:` block, while `bkit-tests-scope` (`:47`) and `bkit-tests-static` (`:352`) set `fetch-depth: 0`.
- Helper: ``const r = spawnSync("git", ["show", `v6.0.0:.bkit/templates/${templateRel}`], {`` then `expect(r.status, r.stderr).toBe(0);`
- actions/checkout README: "Only a single commit is fetched by default, for the ref/SHA that triggered the workflow." and `fetch-tags`: "Whether to fetch tags, even if fetch-depth > 0." "Default: false".
- Capstone: `##[error]plan.run_level=full but bkit-tests-integration result=failure`.

#### Result

CONFIRMED — the same error fails the same 19 tests on both 9630471bf (run 41405235221) and 16a630e29 (run 41537770077), and the integration job's checkout fetches no tags.

### Hypothesis 2: Shipped engine code (not just tests) depends on the `v6.0.0` tag, so consumers are affected too

#### Reason

If the migration itself read the tag, consumers installing from the npm tarball (no git history) would hit the same error.

#### Act

``git grep -n -E 'v6\.0\.0:|"show", `v' -- '.bkit/core/engine/**' ':!*.test.ts'``; known-hit check `git grep -c 'v6.0.0' -- '.bkit/core/engine/**/*.test.ts'`; read `SHIPPED_CI_SCRIPT_HASHES` / `SHIPPED_HOUSE_RULE_HASHES` locations in `.bkit/core/engine/install/modules/core.ts`.

#### Observe

- Non-test grep: no output.
- Known-hit grep: `.bkit/core/engine/commands/install/upgrade.integration.test.ts:4`, `.bkit/core/engine/install/modules/core.integration.test.ts:4`, `.bkit/core/engine/install/template-notes.test.ts:1` (the last is a `bkit:managed v6.0.0` string, not a tag read).
- `core.ts:995`: `export const SHIPPED_CI_SCRIPT_HASHES: Readonly<Record<string, readonly string[]>> = {`; `core.ts:1235`: `export const SHIPPED_HOUSE_RULE_HASHES: Readonly<Record<string, readonly string[]>> = {`

#### Result

REFUTED — the engine matches old content by embedded sha256 tables; only the two integration test files read the tag.

### Hypothesis 3: CI is already green on the current tip, as `context-ci-github-1.md` reports

#### Reason

`context-ci-github-1.md` says `[context-fetch:github] skipped — run 41537770079 concluded success (nothing failing to fetch)`, which would mean the tag problem went away after the rebase.

#### Act

`gh run view 41537770079 --json jobs`; `gh run list --branch feat/748-brand-every-consumer --limit 10`; read the CI fetch block at `.agents/context.md:164-182`.

#### Observe

- Run 41537770079 jobs: `bkit-trivy	success` (only job).
- `41537770079	Trivy	16a630e29	completed	success	pull_request	2026-11-02T22:30:01Z` and `41537770077	bkit-ci	16a630e29	completed	failure	pull_request	2026-11-02T22:30:01Z`
- `.agents/context.md:171`: `RUN_JSON=$(gh run list --branch "$(git branch --show-current)" --limit 1 \` with no `--workflow` filter.

#### Result

REFUTED — the fetch block took the newest run on the branch, which was the Trivy run created in the same second; the `bkit-ci` run on the same commit failed.

### Hypothesis 4: The local `instructions.test.ts` timeout is a regression from this branch

#### Reason

The local gate (`context-tests-local-1.md`) failed on one unit test, and the branch rewrites many agent-read files that the instructions corpus walks.

#### Act

`git log --oneline HEAD --not origin/dev -- .bkit/core/engine/tools/instructions.ts .bkit/core/engine/tools/instructions.test.ts vitest.timeout-budget.ts` (known-hit check on `branding.test.ts` returned commits); timed the case alone: `pnpm exec vitest run .bkit/core/engine/tools/instructions.test.ts -t "has no findings"`; read `instructions.test.ts:55` and `vitest.timeout-budget.ts:20-60`; compared with CI job `bkit-tests-unit`.

#### Observe

- Local gate: `FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings`, `Error: Test timed out in 63463ms.`, case duration `× has no findings 112356ms`, `Tests  1 failed | 6979 passed | 2 skipped (6982)`, `Duration  284.47s`.
- Branch log for those three files: no commits (known-hit query returned `6dafddea3`, `f76f586cc`).
- Alone, at `load averages: 5.19 12.19 16.72` on 10 cores: `Tests  1 passed | 95 skipped (96)`, `Duration  10.82s`.
- `instructions.test.ts:55`: `const CORPUS_CASE = { timeout: Math.ceil(60_000 * loadFactor()) };` (evaluated once at import; 63463 / 60000 is a factor of about 1.06).
- CI run 41537770077: `UNIT_RESULT: success`, `UNIT_RAN: 6976`.
- `docs/failures.jsonl` row `instructions-corpus-store-timeout-under-full-gate` (TRIAGED), open issue #814.

#### Result

REFUTED — the case takes about 11s alone against a 60s budget and passes in CI; it failed only under the loaded local gate, the known #814 timeout class. It is not the CI failure and not caused by this branch.

### Hypothesis 5: Fetching tags in the CI integration job is the better fix than committing the old 6.0.0 files as test fixtures

#### Reason

One `fetch-tags: true` (or `fetch-depth: 0`) line on the `bkit-tests-integration` checkout would make `git show v6.0.0:` succeed.

#### Act

Read `.github/workflows/bkit-ci.yml:656-700`, `package.json` `files`, `.bkit/core/engine/.npmignore`; the 2026-11-02T07:36:15Z issue comment in `debug-input-1.md`.

#### Observe

- `package.json` `files`: `[".bkit/core",".bkit/shared",".bkit/templates","dist","README.md","CHANGELOG.md"]`.
- `.bkit/core/engine/.npmignore`: `*.test.ts` and `__snapshots__` only.
- Issue comment: "The other route is making CI download tags, but that means editing `.github/workflows/`, which needs your sign-off, and it would still leave the tests depending on how the repo was cloned."

#### Result

REFUTED — the CI-side fix needs owner sign-off on `.github/workflows/`, and the tests would still fail in any tagless or shallow clone (cloud agents, forks, `--depth` clones). Byte-exact fixtures remove the dependency everywhere; they need one `.npmignore` line so they do not ship.
