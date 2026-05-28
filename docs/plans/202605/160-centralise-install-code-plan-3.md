<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Centralise install code into `.bkit/` — Sub-Plan 3: Two-axis byte-identical verification (install AND upgrade) (WS-4 / #164)

**Parent Plan:** [`160-centralise-install-code-plan.md`](./160-centralise-install-code-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `160-centralise-install-code-plan-3.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!CAUTION]
> **DEPENDENCY — Sub-Plan 2 AND Sub-Plan 1's baseline are required.** This sub-plan diffs the POST-MOVE packed tarball against the PRE-MOVE baseline. It MUST NOT begin until [`160-centralise-install-code-plan-2.md`](./160-centralise-install-code-plan-2.md) Gate WS-3 (move complete, build + tests green) is `[x]` and committed, AND the four baseline artifacts from [`160-centralise-install-code-plan-1.md`](./160-centralise-install-code-plan-1.md) (`baseline/bkit-version-hashes.json`, `baseline/agents-tree.txt`, `baseline/pack-filelist.txt`, `baseline/stale-consumer-setup.md`) are present. The hash/tree diff is meaningless before the move is done and the baseline is captured.

## Context & Goals

Issue #160 centralises bkit's install machinery into a single `.bkit/` root as a **structural refactor, not a behaviour change**. This sub-plan is the **byte-identical oracle**: it proves that a consumer who installs OR upgrades across this release receives byte-identical content vs the pre-refactor baseline, on BOTH axes (axis-1 `.bkit-version` hashes; axis-2 recursive `.agents/` tree that covers the untracked `copyAdditive` payload), for BOTH engines (install AND upgrade), and confirms the D1 orphan `.agents/templates/` is actively removed on upgrade.

**This sub-plan covers WS-4 (two-axis verification gate).**

**Success Criteria (this sub-plan):**

- Post-move packed-tarball install → `.bkit-version` hashes AND recursive `.agents/` tree == baseline (fresh consumer never receives `.agents/templates/` — D1).
- Post-move packed-tarball upgrade over a pre-move stale consumer → baseline-identical AND orphan `.agents/templates/` GONE.
- `npm pack --dry-run` removals are ONLY `.agents/scripts/**` + `.agents/templates/**` (now under `.bkit/`); `.bkit/templates/gitignore` ships; `.agents/` runtime reads still ship.
- The moved `bkit-dry-run-parity.integration.test.ts` re-verifies green.

## Binding Decisions (apply in this sub-plan)

- **D1 — drop + upgrade auto-clean:** WS4-T2 asserts the fresh consumer never receives `.agents/templates/`; WS4-T4 asserts the orphan is GONE after upgrade on a consumer that HAD it pre-move (using the `baseline/stale-consumer-setup.md` construction from Sub-Plan 1).
- **D2 — `dist/` stays at root:** WS4-T1/WS4-T3 confirm `.bkit-version` keys are destination-relative; no migration runs. `bin`/`dist/` unchanged is confirmed by Sub-Plan 2's `check:dist`.
- **D3 — `rules.md` block-scoped gate:** not exercised here (Sub-Plan 4).

## Acceptance Scenario slice (relevant to this sub-plan)

> The full Acceptance Scenario + Human Confirmation live in the root sub-plan ([`160-centralise-install-code-plan-1.md`](./160-centralise-install-code-plan-1.md)). The slice this sub-plan asserts:

- Concrete Example step 1 — `npm pack --dry-run` removals-only diff (WS4-T5).
- Concrete Example step 2 — fresh-dir install: `.bkit-version` hashes + recursive `.agents/` tree match baseline; no `.agents/templates/` (WS4-T1 axis-1, WS4-T2 axis-2).
- Concrete Example step 3 — install over stale-2.7.0 consumer + upgrade: baseline-identical tracked output AND orphan `.agents/templates/` actively removed (WS4-T3 axis-1, WS4-T4 axis-2).
- Edge cases asserted: existing-consumer stale `.agents/templates/` removed (WS4-T4); `.bkit/templates/gitignore` ships dot-less (WS4-T5); the `renovate.json5` flag-parity invariant (WS4-T1/WS4-T3).

> [!IMPORTANT]
> **Flag-parity invariant (carried from baseline).** Use the SAME install flags in baseline (Sub-Plan 1 WS2-T1) and verify here — the default (non-`--renovate`) flow. The hash set is keyed by consumer-relative DESTINATION path and populated ONLY from files actually written in the run (`bkit-modules.ts:434-454`); the WS-6 `renovate.json5` `ignorePaths` edit changes the SOURCE template, which is opt-in (`bkit install --renovate`) and NOT written by the default flow — so it never enters the hashed set on the default-flow axis and the empty-diff gate stays satisfiable.

## Edge Cases (relevant slice)

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Existing consumer has stale `.agents/templates/` from a pre-move release (D1) | Upgrade actively removes the orphan dir; recursive `.agents/` diff asserts it is GONE after upgrade. (WS4-T4.) |
| `.bkit/templates/gitignore` not actually shipped (npm strips `.gitignore` by basename) | Tarball-content assertion confirms `.bkit/templates/gitignore` ships dot-less. (WS4-T5.) |
| In-flight consumer upgrades across the boundary | `.bkit-version` keys are destination paths (unaffected); no migration runs; `tplRoot` source change is transparent. (WS4-T1/T3.) |
| WS-6 `renovate.json5` `ignorePaths` source edit vs WS-4 "hash-set diff is empty" | Hashes populate only from `ws.writes`; `.github/renovate.json5` is opt-in, absent from the default-flow writes — the source edit never perturbs the default-flow hashed set. Baseline + verify use identical (default) flags. If `--renovate` IS exercised, the lone permitted delta is `.github/renovate.json5` reflecting `ignorePaths: [".bkit/templates/**"]`. |

## Derived Test Matrix (rows owned by this sub-plan)

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Post-move packed-tarball install → `.bkit-version` hashes + recursive `.agents/` tree == baseline | Integration (harness/script) | `.bkit/src/bkit-modules.integration.test.ts` + WS-4 verify script (WS4-T1, WS4-T2) |
| Post-move packed-tarball upgrade → baseline-identical AND orphan `.agents/templates/` removed | Integration (harness/script) | `.bkit/src/bkit-modules.upgrade.integration.test.ts` + WS-4 verify script (WS4-T3, WS4-T4) |
| `npm pack --dry-run` removals-only diff (only `.agents/scripts/**` + `.agents/templates/**`) | Integration (script/test) | WS-4 verify script (documented command) (WS4-T5) |
| `bkit install --dry-run` diff empty on a clean consumer clone before/after | Integration (Vitest) | `.bkit/src/bkit-dry-run-parity.integration.test.ts` (EXISTING — moved by Sub-Plan 2 WS3-T1, re-pointed by WS3-T10; this sub-plan re-verifies) (WS4-T6) |

## Out of Scope

- Capturing the baseline + authoring the seam (Sub-Plan 1).
- The physical move + re-point + doctor + the WS-3-local orphan smoke test (Sub-Plan 2).
- Docs/prose + rules.md CI gate (Sub-Plan 4).

## Merge Method

**Merge method: always squash.** This verification ships in the SAME atomic PR as the move and docs. No `rebase`/`merge-commit`.

## Security & Privacy

None — verification only; no new routes, DB writes, secrets, or user input.

## Hand-off artifacts

**CONSUMED from Sub-Plan 1:** `baseline/bkit-version-hashes.json` (axis-1 oracle), `baseline/agents-tree.txt` (axis-2 oracle), `baseline/pack-filelist.txt` (pack oracle), `baseline/stale-consumer-setup.md` (deterministic stale-consumer construction for the D1 upgrade assertion).

**CONSUMED from Sub-Plan 2:** the completed move (`.bkit/src/` + `.bkit/templates/`), the D1 upgrade orphan-removal behaviour, and a green build/test state.

**PRODUCED:** the confirmed byte-identical guarantee on both axes for both engines (Gate WS-4). This sub-plan writes no source — it runs `pnpm pack`, clean-dir installs/upgrades, and diffs.

## Documentation Updates

None in this sub-plan.

## Rollback Strategy

Code-only — `git revert {squash-merge SHA}`. This sub-plan adds no shipped behaviour; it only verifies.

## Verification Plan

### Automated Tests (carried from umbrella Gate 4 — assert here)

- [x] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`), `pnpm lint:no-tier-terms`, `pnpm lint:prose`, `pnpm lint:slop` green.
- [x] **Build freshness:** `pnpm build` + `pnpm check:dist` green (dist/ flat at root, bin unchanged).
- [x] **Test discovery:** `pnpm test` reports a NON-ZERO test count from `.bkit/src/**` (guards against the green-but-empty vitest-glob failure).
- [x] **Run all tests:** `pnpm test` green including the NEW dogfood-noop (WS1-T6) and getPkgRoot 3-context (WS1-T7) and WS-7 rules-sync tests, the WS3-T5 orphan-removal smoke test, and the EXISTING (re-pointed) dry-run-parity and doctor tests.

> [!IMPORTANT]
> **No Architectural Downgrades:** resolve build/test failures via the design's mechanisms (single seam, fail-loud guard), never silent skips or path hacks. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [x] **Gate 4 - Verified:** All Automated Tests checked with explicit proof (test counts, CLI output).

## Agent Execution Runbook — WS-4 Two-Axis Verification Gate (#164; requires Sub-Plan 1 baseline + Sub-Plan 2 move)

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, DO NOT fail silently. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification) before starting the next.

> [!WARNING]
> **Dashboard Ban:** use local CLIs (`pnpm pack`, `npm pack --dry-run`, `diff`, `gh`) — do not ask the user to check dashboards. **Dogfood via a packed tarball in a clean dir, not the repo** (MEMORY): repo `node_modules` masks runtime-dep mis-classification.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable.

- [x] **WS4-T1 (install, axis 1):** `pnpm pack` post-move → install into clean dir → `bkit install` → diff `.bkit-version` `canonicalHashes`/`tier3Hashes` vs `baseline/bkit-version-hashes.json`. **Use the SAME install flags in baseline (WS2-T1) and verify** — the default (non-`--renovate`) flow. The hash set is keyed by consumer-relative DESTINATION path and populated ONLY from files actually written in the run (`bkit-modules.ts:434-454`); the WS-6 `renovate.json5` `ignorePaths` edit changes the SOURCE template `.agents/templates/.github/renovate.json5`, which is opt-in (`bkit install --renovate`) and is NOT written by the default flow — so it never enters the hashed set on the default-flow axis and the empty-diff gate stays satisfiable.
  - **Done when:** hash-set diff is empty for install on the default (non-`--renovate`) flow. **If `--renovate` is exercised** (optional), the ONLY permitted non-empty entry is `.github/renovate.json5` whose recorded hash reflects the rendered consumer-tree content with `ignorePaths: [".bkit/templates/**", …]` (the intended WS-6 delta) — any OTHER hash delta fails the gate.
- [x] **WS4-T2 (install, axis 2):** recursive `.agents/` consumer-tree listing of the clean install vs `baseline/agents-tree.txt`.
  - **Done when:** tree diff shows ONLY the intended removal of `.agents/templates/` (fresh consumer never receives it — D1); all other paths identical.
- [x] **WS4-T3 (upgrade, axis 1):** install tarball over a consumer that had pre-move state → `bkit upgrade` → diff hashes vs baseline. Same flag-parity rule as WS4-T1 (default, non-`--renovate` flow; `renovate.json5` is opt-in and out of the hashed set on this axis).
  - **Done when:** hash-set diff is empty for upgrade on the default (non-`--renovate`) flow; if `--renovate` is exercised, the only permitted delta is the intended `.github/renovate.json5` `ignorePaths` change (`.bkit/templates/**`), any other delta fails.
- [x] **WS4-T4 (upgrade, axis 2 + D1 orphan assertion):** recursive `.agents/` tree of the upgraded consumer vs baseline. Construct the stale consumer per `baseline/stale-consumer-setup.md` (from Sub-Plan 1 WS2-T5) so the input deterministically HAS `.agents/templates/` pre-move.
  - **Done when:** tree diff confirms the orphaned `.agents/templates/` is GONE after upgrade on a consumer that HAD it pre-move; all tracked paths identical.
- [x] **WS4-T5 (pack-filelist):** `npm pack --dry-run` file-list diff vs `baseline/pack-filelist.txt`.
  - **Done when:** the ONLY removals are `.agents/scripts/**` + `.agents/templates/**` (now under `.bkit/`); `.bkit/templates/gitignore` ships; `.agents/` runtime reads (`trackers.md`, `IDEs.md`, `cloud.md`, `prompts.md`, `workflows.md`, `skills/**`, `workflows/bkit-*.md`, `prompts/bkit-*.md`) still ship.
- [x] **WS4-T6 (dry-run-parity gate):** `bkit install --dry-run` diff empty on a clean consumer clone before/after. This is a re-point + re-verify of the EXISTING `bkit-dry-run-parity.integration.test.ts` (present today under `.agents/scripts/`, moved by Sub-Plan 2 WS3-T1 `git mv`, embedded literals re-pointed by WS3-T10) — NOT a new authoring task.
  - **Done when:** the moved test file at `.bkit/src/bkit-dry-run-parity.integration.test.ts` (re-pointed) passes; dry-run produces no spurious writes; no copy remains under `.agents/scripts/`.

### 🔒 Gate WS-4: byte-identical confirmed on BOTH engines

- [x] **Gate WS-4 - Verified:** Both install AND upgrade produce baseline-identical hashes AND recursive `.agents/` trees on a packed tarball in a clean dir, using the SAME (default, non-`--renovate`) flags in baseline and verify so the WS-6 `renovate.json5` source edit does not perturb the hashed set (renovate is opt-in and absent from the default-flow `ws.writes`); orphan `.agents/templates/` removed on upgrade; pack-filelist removals-only diff confirmed.

> [!IMPORTANT]
> **Hand-off:** Gate WS-4 green is the byte-identical quality gate. It and Sub-Plan 4's Gate WS-6 / Gate 2 / Gate 3 must ALL pass before the single squash PR merges.
