Verdict: CONCERNS
Spike: TRUE

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

Verified by text search across repo root, `scripts/`, `.bkit/`, `docs/`, `.agents/`; no language server configured.

| Capability                        | What exists (path, maturity, adoption)                                                                                                                                                                                                           | Fit (constraints, gaps)                                                                                                                                                                                                                                                                                  | Recommendation                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Example project under `examples/` | Nothing. No `examples/` dir; no demo/benchmark/eval harness anywhere (`docs/consumers.md` is a maintainer-local dogfood-path list; `docs/capabilities.md` has no example entry)                                                                  | Design's `NEW` verdict **confirmed** — no candidate covers any of it                                                                                                                                                                                                                                     | `BUILD-CUSTOM`                           |
| Repo-side maintainer script       | `scripts/readme/readme-art.mjs`, `scripts/ci/lanes/resolve-push-base.mjs` (+`.test.mjs`), `scripts/slop/…`, `scripts/prettier/…`, `scripts/secrets/…`                                                                                            | `scripts/<area>/*.mjs` topology fits; new `scripts/example/` is a new leaf of an existing shape                                                                                                                                                                                                          | `EXTEND-EXISTING` (design says `EXTEND`) |
| Throwaway repo creation           | `gh repo create --private`; `tests/fixtures/gh/bin/gh` stub                                                                                                                                                                                      | Stub shims only 3 `gh api` calls for `bkit runs gate` — precedent for a test harness, **not** reusable by the runner                                                                                                                                                                                     | `USE-AS-IS`                              |
| Install into throwaway repo       | `bkit install --tracker=github` — `.bkit/core/engine/commands/install/install.ts:249`                                                                                                                                                            | Verified: flag overrides `DEFAULT_ISSUE_TRACKER` (`install/manifest.ts:66`)                                                                                                                                                                                                                              | `USE-AS-IS`                              |
| Seeded gate chain                 | `BKIT_GATE_SCRIPTS` `install/manifest.ts:215`; add-if-missing seeding `install/modules/core.ts:316-317`; `detectNoopGates` `:433`                                                                                                                | Fixture's pre-declared names (`lint-staged` `typecheck` `lint` `format:check` `lint:prose` `slop:delta` `test` `build`) exactly cover the seeded `bkit:gate:format`/`static`/`static-unit` values — no `gate-missing-called-scripts` advisory. `gate-noop` cannot fire (reads `bkit:gate:*` values only) | `EXTEND-EXISTING`                        |
| Ship merge gate                   | `bkit runs gate` — `.bkit/core/engine/commands/workflow/runs.ts:9-20,573-735`; capstone default `shared/settings.ts:32`                                                                                                                          | Capstone **absent ⇒ never a vacuous pass** (`:706-711`); probe namespace = capstone minus last segment (`bkit-tests-check` → `bkit-tests`) — a single-job CI satisfies it                                                                                                                                | `USE-AS-IS`                              |
| Fixture CI                        | `.bkit/templates/.github/workflows/bkit-ci.yml` is copy-and-own; `install/modules/index.integration.test.ts:149` proves install writes **no** `.github/workflows/`                                                                               | Design's "hand-write 40 lines instead of adopting 1065" premise holds                                                                                                                                                                                                                                    | `ADAPT`                                  |
| Test runner                       | Node built-in `node --test`, `engines.node >=20`                                                                                                                                                                                                 | Zero deps; already the intended runner                                                                                                                                                                                                                                                                   | `USE-AS-IS`                              |
| Content data (`data.js`)          | No equivalent                                                                                                                                                                                                                                    | Design's `NEW` **confirmed**                                                                                                                                                                                                                                                                             | `BUILD-CUSTOM`                           |
| Benchmark inputs                  | `.bkit/stats.jsonl` kinds `compliance`/`counter`/`outcome`; `counter` has `counterName`/`counterValue`; `outcome` carries `durationSeconds`/`taskCount`/`deferrals`/`failures`; `status.jsonl` rows carry `type`/`workflow`/`step`/`status`/`at` | All verified present. `reviewIterations` is **optional** and absent from this repo's rows                                                                                                                                                                                                                | `EXTEND-EXISTING`                        |
| Docs + index                      | `.agents/docs.md` Project Documents table (below `bkit:end`)                                                                                                                                                                                     | Design's plan to register `examples/README.md` there fits                                                                                                                                                                                                                                                | `EXTEND-EXISTING`                        |
| Guard on bkit's own CI            | `bkit-ci.yml` has `bkit-tests-scope/static/unit/integration/check`; `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` asserts the adopted copy equals the template + declared edits ("any difference not listed here fails")             | Design's smoke-job decision does not account for that test — see CRITICAL                                                                                                                                                                                                                                | `EXTEND-EXISTING`                        |

No candidate covers >80% of any capability, so no design `NEW`/`EXTEND` verdict is misassigned. Only token drift: the design's `Reuse & Prior Art` uses `NEW`/`EXTEND`, not the `EXTEND-EXISTING|USE-AS-IS|ADAPT|BUILD-CUSTOM` enum.

## Stack Feasibility

Buildable with the approved stack. Node ≥20 stdlib (`node --test`, `node --check`, `.mjs`), `gh`, pnpm/Corepack, bkit itself — no new dependency enters the app.

Verified supporting facts:

- `@cbartens/bkit` is `private: false` with `publishConfig.access: "public"` on npmjs → the design's "stale GitHub Packages premise" note is correct.
- `package.json` `files` is an explicit whitelist that excludes `examples/` and `scripts/` → the fixture and `examples/README.md`'s trap inventory **never ship in the npm tarball**. The design's leak concern is already closed by packaging.
- `.github/workflows/bkit-ci.yml` is in the templates root and install writes no `.github/workflows/` → the fixture's own CI survives `bkit install`.
- `resolveTokens` hard-throws when `package.json.name` is absent/empty (`install/placeholders.ts:66-75`), so the `name`-bearing fixture `package.json` is genuinely load-bearing. But the cited line (`checks/before/index.ts:137`) is only the _absence_ blocker: `detectNoPackageJson` (`checks/before/repo.ts:15-24`) does not inspect `name`. Citation is wrong, conclusion is right.
- `worktreeCopy` of a missing `.env` is "narrated, never fatal" (`commands/workflow/worktrees.ts:149-161`) → the fixture needs no `bkit.worktree` override.
- Build Step 14 runs the deepest declared of `bkit:gate:static-unit-integration` / `bkit:gate:static-unit` (`bkit-build.md:561`); the fixture declares only the seeded `static-unit` → `pnpm bkit:gate:static && pnpm test`. Design correct.

**Constraint the design misses:** bkit's workflows hardcode `dev` as the integration branch. `/bkit-design` Step 1 branches `feat/{FID}` off `origin/dev` (`bkit-design.md:171`) and lands on `dev`; `/bkit-ship` fails when `PR_BASE != dev` (`bkit-ship.md:220`) and fetches `origin/dev` (`:226`); closes use `worktree add --detach origin/dev` (`workflows.ts:906`). `gh repo create --private` yields only `main`. The runner flow (preflight → create → copy → `pnpm install` → `bkit install` → commit) never creates or pushes `dev`, so the **first** pipeline step fails. See CRITICAL.

## Library / API Evaluation

| Item                              | Maturity / adoption                                                          | Footprint                                                                     | Types                             | License                                 |
| --------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------- | --------------------------------------- |
| `node --test`, `node --check`     | Node built-in since 18/20; already bkit's documented runner                  | zero bytes added                                                              | n/a                               | Node                                    |
| `gh` CLI                          | Mature; already a preflighted boundary in the runner and in `bkit runs gate` | none in-repo                                                                  | n/a                               | MIT                                     |
| pnpm + Corepack                   | Repo pins `pnpm@10.34.4`; fixture pins its own                               | lockfile committed per throwaway repo                                         | n/a                               | MIT                                     |
| `@cbartens/bkit` (fixture devDep) | Public on npmjs; exact-pin is the design's own instrument                    | one devDep in the throwaway repo, never in bkit's tarball (`files` whitelist) | dist types as published           | PolyForm Noncommercial / Small Business |
| Fixture app                       | Zero dependencies by construction                                            | `index.html` + `logic.js` + `data.js`                                         | plain CJS `.js` (no `"type"` key) | n/a                                     |

No new third-party library is introduced anywhere. The only "stub scripts" are Node-stdlib one-liners; precedent for the "tool absent ⇒ echo + exit 0" idiom already exists in bkit's own `lint` and `bkit:test:bats` scripts, though those **echo what they skip** — the fixture's stubs must do the same to stay honest.

## Integration Risk

Systems touched: new `examples/bkit-explainer/` tree; new `scripts/example/` area; `.agents/docs.md` index row; bkit's own `.github/workflows/bkit-ci.yml` + `audits/repo/dogfood-templates.test.ts`; the deferrals ledger (rows already present — verified, nothing to add).

- **Blast radius is well-contained:** the fixture is copied _out_ of bkit and is outside the npm `files` whitelist, so consumers and the published package are untouched. Only the smoke-job decision reaches bkit's own CI surface — and that surface is test-guarded (see CRITICAL 3).
- **New dirs are gate-covered:** `prettier --check .` and `slop-scan` (with `structure.*` / `defensive.*` rules and a delta gate) both scan `examples/` and `scripts/example/`; the design should budget a formatting/slop pass on the new files.
- **Fixture CI triggers are unstated and load-bearing:** the file is copied verbatim by the runner, so it cannot rely on `{{DEFAULT_BRANCH}}` (only `bkit install` resolves tokens, and it never writes this file) and its `pull_request.branches` must include `dev` or no run is produced for the PR and the capstone is absent at head.
- **One advisory will fire:** `detectCiYmlCapstoneContractDrift` (`checks/after/ci-yml.ts:180-245`, warning-only) triggers on a `bkit-tests-check` job lacking `if: ${{ !cancelled() }}`. Checks 2 and 3 do not fire (no `concurrency:`; `bkit-tests-check` is outside the `bkit-tests-(unit|integration|e2e|live)` lane regex).
- **Benchmark reader tolerance:** `status.jsonl` rows discriminate on `type` (not `kind`), and `outcome.reviewIterations` is optional and absent in this repo's rows — a reader must not treat absence as failure.
- **Runner verification is unplanned:** `scripts/example/new-run.mjs` sits outside vitest's `include` (`.bkit/core/engine/**`) and outside `tsc` typecheck, and the design names no test for it.

## PoC Approach

Not a pipeline run; four narrow probes, all against the live GitHub boundary:

1. `gh repo create --private`, push `main` **and** `dev`, copy the fixture, `pnpm install`, `bkit install --tracker=github`, commit.
2. Open a trivial PR **to `dev`**; confirm a check named exactly `bkit-tests-check` appears, that `bkit runs gate` returns success at that head, and that `pnpm bkit:gate:static-unit` exits 0 with no install advisories.
3. Run only `/bkit-design` Step 1 in the throwaway repo: confirm `feat/{FID}` off `origin/dev` and `bkit worktrees setup` complete.
4. A 5-line dual-load probe: one `.js` with the module-environment guard, required by `node --test`, plus an `index.html` opened by double-click.

Discarded afterwards — no app, no benchmark.

## Unknowns & Blockers

1. Does `bkit runs gate` return green for a repo whose **only** job is `bkit-tests-check` — no lanes, no `needs:`, no `!cancelled()` — with a real run at the exact HEAD and no `[skip ci]`? Runner-selection and dispatch-probe behaviour at a live boundary.
2. Does `/bkit-design` Step 1 worktree setup (branch off `origin/dev`, `pnpm install` inside `.worktrees/`) succeed end-to-end in a repo with `main` as default, a new `dev`, and a hand-written CI?
3. Does the chosen dual-load guard actually satisfy both a classic `<script src>` off `file://` and `require` under `node --test`?
4. Does `bkit install` + the seeded chain leave the fixture gate-clean (no advisories) in practice?

## Verdict Reasoning

`CONCERNS`. Everything the design needs already exists in the approved stack and no capability was misassigned to `NEW`; the layering is sound and the gate/measurement boundary is real. But four load-bearing omissions would break the demo on first contact and are all fixable inside the design's shape: the missing `dev` branch (the very first workflow step depends on `origin/dev`), unstated fixture-CI triggers that must be literal and include `dev`, an unaccounted-for `dogfood-templates.test.ts` guard on the smoke-job decision, and no named verification for the runner. Not `FAIL` — no infeasibility and no scope-stack mismatch. Not `PASS` — the design as written cannot reach success criteria 2–3. `Spike: TRUE` because unknowns 1–3 are settleable only by running code at the GitHub and browser boundaries.

## CRITICAL

1. **`dev` branch is never created or pushed.** bkit's workflows hardcode it: `bkit-design.md:171` creates `feat/{FID}` off `origin/dev`; `bkit-ship.md:220` fails when `PR_BASE != dev`; `bkit-ship.md:226` fetches `origin/dev`; `workflows.ts:906,927` close onto it. `gh repo create --private` gives `main` only. Add an explicit runner step (create `dev`, push it, keep `main` as default) and name `dev` in success criteria 1.
2. **Fixture CI triggers and literals are unstated.** The copy is verbatim, so `{{DEFAULT_BRANCH}}` (a bkit-install-only token) would land unresolved; and `pull_request.branches` must include `dev` or the PR produces no run → capstone absent at head → ship refuses.
3. **The smoke job collides with a bkit-side guard and with the version pin.** `audits/repo/dogfood-templates.test.ts` requires the adopted `bkit-ci.yml` to equal the template plus declared edits, so a new job needs an explicit `bkit-only` entry (or a template change) or bkit's own suite reds. Separately, the fixture's exact `@cbartens/bkit` pin means a smoke job that installs the fixture tests the _published_ version, not the working tree — the design must say which, and keep the pin published. Retain the design's existing human-confirmation requirement.
4. **Name the verification for `scripts/example/new-run.mjs`.** It is outside vitest's `include` globs and outside `tsc`, and the design proposes no test for it. Either specify a bats test using the `tests/fixtures/gh/bin/gh` stub (its documented shape is exactly this) run by `bkit:test:bats`, or record an explicit deferral row with a closed-enum `reason` — silent omission violates `Completeness over shortcuts`.

## OPTIONAL

- Cite-line drift: `BKIT_GATE_SCRIPTS` is `install/manifest.ts:215` (design says 213); the `name` hard-fail is `install/placeholders.ts:71-75` (a throw), not the `checks/before/index.ts:137` absence blocker; the merge gate lives in `commands/workflow/runs.ts`.
- Use the enum tokens in `Reuse & Prior Art` (`EXTEND-EXISTING`, `USE-AS-IS`, `ADAPT`, `BUILD-CUSTOM`); `EXTEND`/`NEW` are outside it.
- Add `if: ${{ !cancelled() }}` to the fixture's `bkit-tests-check` job to silence the one warning-only `ci-yml-capstone-contract-drift` advisory (`checks/after/ci-yml.ts:198`).
- State that the benchmark reader tolerates `reviewIterations` absence and keys `status.jsonl` rows on `type`, not `kind`.
- Reword "byte-identical copy" for criterion 1: the copy is byte-identical _before_ install, after which install adds managed `.gitignore` blocks, `.agents/`, `.bkit/`.
- Budget a prettier/`slop:delta` pass over the new `examples/` and `scripts/example/` files; both gates scan them.
- The `gh` stub shims 3 `gh api` calls only — cite it as test-harness precedent, not as runner reuse.
- The deferral rows the design promises already exist (`504-run-replay-viewer` … `504-install-advisory-when-tracker-is-none`); no new rows are needed.
- Append rows to `docs/decisions.jsonl` for the architecture calls the design makes (three-layer split, stub gates, 40-line CI), per `.agents/rules.md` § Major changes.

## OUT OF SCOPE

- The nine #504 later ideas and the tracker-`none` install advisory — already recorded as deferral rows.
- Cost/token source, `--runs N`, a metrics/report layer, and any browser or DOM-snapshot check of the drawing layer — deferred by the design.
- The stale GitHub Packages / `access: 'restricted'` premise in the issue's later idea 7.
