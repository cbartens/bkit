<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Centralise install code into `.bkit/` — Sub-Plan 2: Physical move + resolver re-point + Doctor observability (WS-3, WS-5 / #163, #165)

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan-v4-2.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!CAUTION]
> **DEPENDENCY — Sub-Plan 1 MUST be green and committed first.** This sub-plan performs the physical `git mv`. It MUST NOT begin until [`plan-v4-1.md`](./plan-v4-1.md) Gate WS-1 (scaffolding green pre-move) AND Gate WS-2 (baseline captured, no `git mv` run) are both `[x]` and committed. Running the move before the seam is green and the baseline is captured would self-overwrite the live `.agents/` mid-state and destroy the byte-identical oracle.

## Context & Goals

Issue #160 centralises bkit's install machinery into a single `.bkit/` root. Sub-Plan 1 added the resolver seam (`getTemplatesRoot()`, `isDogfood()`, `BKIT_SRC_SUBPATH`) still pointing at the OLD `.agents/` paths, the fail-loud guard, the dogfood/3-context tests, and captured the byte-identical baseline.

**This sub-plan covers WS-3 (physical move, resolver re-point, tooling/config & dead-arm deletion) and WS-5 (doctor observability).** It performs the `git mv` of both trees, flips the seam to the `.bkit/` forms, re-points every executable literal + every engine-source string/comment, deletes the dead `runPayload` templates arm, adds the D1 upgrade orphan-removal, re-targets `tsconfig`/`vitest`/`package.json`, re-points all test path-constants + regenerates the snapshot, and extends `bkit doctor` to print the resolved templates root.

**Success Criteria (this sub-plan):**

- `.bkit/src/` and `.bkit/templates/` exist; `.agents/scripts` and `.agents/templates` no longer exist; git tracks the moves.
- All source-root references re-pointed (executable literals AND strings/comments); `pnpm build` + `check:dist` + `pnpm test` green post-move; source-grep returns only dest-relative hits.
- `bkit doctor` prints `[bkit-doctor] Templates root: <resolved path>`.

## Binding Decisions (apply in this sub-plan)

- **D1 — drop + upgrade auto-clean:** This sub-plan IMPLEMENTS the active removal of the consumer's orphaned `.agents/templates/` during `bkit upgrade` (WS3-T5), plus a WS-3-local smoke test. The end-to-end assertion is Sub-Plan 3 (WS4-T4).
- **D2 — `dist/` stays at root:** `dist/` stays flat at repo root; `bin` stays `./dist/bkit-install.js`; `tsconfig outDir: dist` unchanged. WS3-T2 deliberately leaves the `dist/` arm of `getPkgRoot()` untouched.
- **D3 — `rules.md` block-scoped gate:** not exercised here (Sub-Plan 4) — but note `.bkit/templates/.agents/rules.md` is created by the WS3-T1 `git mv` and is the gate's source-of-truth target.

## Acceptance Scenario slice (relevant to this sub-plan)

> The full Acceptance Scenario + Human Confirmation live in the root sub-plan ([`plan-v4-1.md`](./plan-v4-1.md)) and gate the whole workstream. The slice this sub-plan realises:

- Concrete Example step 1 (the `npm pack --dry-run` removals being only `.agents/scripts/**` + `.agents/templates/**`, now under `.bkit/`) is MADE TRUE here; it is ASSERTED in Sub-Plan 3.
- Concrete Example step 5 (`bkit doctor` prints `[bkit-doctor] Templates root: <resolved path>` pointing at `.bkit/templates`) is implemented by WS5-T1.
- Edge cases realised here: dual run-context divergence (WS3-T2 flips `BKIT_SRC_SUBPATH`, leaves `dist/` arm), vitest-zero-tests guard (WS3-T7 re-targets globs), `.bkit/templates/gitignore` ships dot-less (WS3-T9), D1 orphan removal (WS3-T5), consumer-facing error message re-point (WS3-T11, `bkit-modules.ts:1255`).

## Out of Scope

- Capturing the baseline / the seam authoring (Sub-Plan 1, already done).
- The two-axis byte-identical verification (Sub-Plan 3).
- Docs/prose updates + shipped `renovate.json5` template + rules.md CI gate (Sub-Plan 4) — these are merge-gated with this move in the SAME squash PR but are executed in Sub-Plan 4.

## Merge Method

**Merge method: always squash.** This move (WS-3) is the core of the single atomic PR; WS-6 docs (Sub-Plan 4) ship in the SAME PR. No `rebase`/`merge-commit`.

## Supersession Inventory (rows executed in this sub-plan)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.agents/scripts/**` (engine source) | `.bkit/src/**` | DELETE (via `git mv`) | Relocated wholesale; no copy left behind. (WS3-T1.) |
| `.agents/templates/**` (install payload) | `.bkit/templates/**` | DELETE (via `git mv`) | Relocated wholesale; no copy left behind. (WS3-T1.) |
| `runPayload()` templates arm (`bkit-install.ts:660-666`) | none (template content reaches consumers via `runCoreTemplates` reading `getTemplatesRoot()`) | DELETE | Dead after move — templates never copied into a consumer's `.agents/templates/`; net simplification. (WS3-T4.) |
| Inline `path.join(PKG_ROOT, ".agents", "templates", …)` literals (~19 call-sites across `bkit-modules.ts`, `bkit-install.ts`, `bkit-uninstall.ts`, `bkit-preflight.ts`) | `getTemplatesRoot()` | DELETE (replace each) | Single seam = one place to change and assert; eliminates scattered missed-literal silent-skip failure mode. (WS3-T3.) |
| Consumer `.agents/templates/` directory (orphaned on existing consumers) | nothing (auto-cleaned on upgrade) | DELETE (D1) | Internal source tree never belonged in consumer repos; upgrade actively removes the orphan. (WS3-T5 implements; Sub-Plan 3 WS4-T4 asserts end-to-end.) |

> [!CAUTION]
> **Default = `DELETE`.** Each `DELETE` row is mirrored in `Architecture & Component Changes` below and as a removal task in the runbook.

## Security & Privacy

None — structural refactor; no new routes, DB writes, secrets, or user input.

## Architecture & Component Changes

> All paths grounded against the live tree. Template literals confirmed at: `bkit-modules.ts` (188, 558, 620, 645, 670, 749, 1348, 1532, 1725, 1831, 1928), `bkit-install.ts` (660-661, 736), `bkit-uninstall.ts:425`, `bkit-preflight.ts` (469, 516). **Grounding correction vs design:** the design's WS-3 scope did NOT list `bkit-preflight.ts:469,516` — these two additional templates-literal call-sites MUST also be re-pointed (covered by the design's "~17" total but absent from the WS-3 task list). WS3-T3 includes them.

### Engine source re-points (WS-3)

#### [MODIFY] `.bkit/src/bkit-paths.ts` (post-move path; was `.agents/scripts/bkit-paths.ts`)

- WS3-T2: Flip `BKIT_SRC_SUBPATH` to the `.bkit/src` form and encode `.bkit/templates` only in `getTemplatesRoot()`; leave the `dist/` arm of `getPkgRoot()` untouched.

#### [MODIFY] `.bkit/src/bkit-install.ts`

- WS-3: re-point upgrade `tplRoot` (736) to `getTemplatesRoot()`; DELETE the dead templates arm (660-666); add D1 orphan-removal of consumer `.agents/templates/` to the upgrade path.
- WS3-T11: re-point source-root comment references at lines 568, 623, 624, 734 (citing `.agents/templates/` / `running from .agents/scripts/`) → `.bkit/templates/` / `.bkit/src/`.

#### [MODIFY] `.bkit/src/bkit-modules.ts`

- WS3-T3: replace the 11 inline `path.join(PKG_ROOT, ".agents", "templates", …)` literals (188, 558, 620, 645, 670, 749, 1348, 1532, 1725, 1831, 1928) with `getTemplatesRoot()`-rooted joins. Note `CORE_TEMPLATE_DIRS` (line ~154, `{docs, .agents, scripts}`) are dest-relative dir names INSIDE the template tree — NOT source paths — and are untouched. `COPY_EXCLUDE` currently lists `scripts` (no longer present under `.agents/` post-move); decide and record whether the `scripts` entry is dropped or retained (cosmetic), pinned to the WS3-T11 `Done when`.
- WS3-T11 (STRINGS + COMMENTS, distinct from the `path.join` literals): re-point the stale `.agents/(templates|scripts)` references in STRINGS and COMMENTS. **Load-bearing — prioritise:** the consumer-facing error message at `bkit-modules.ts:1255` (`"… Remove from .agents/templates/.github/workflows/ci.yml …"`) — post-move this instructs consumers to edit a path that no longer ships in the tarball, so it MUST read `.bkit/templates/.github/workflows/ci.yml`. **Comments (cosmetic but inside Gate WS-3's `.bkit/src` regex scope):** lines 272, 286, 300 describe the template tree — re-point the SOURCE root to `.bkit/templates/...`. Leave the dest-layout-describing `.agents/` segment INSIDE `.bkit/templates/.agents/` untouched.

#### [MODIFY] `.bkit/src/bkit-preflight.ts`

- WS3-T3: re-point both `path.join(pkgRoot, ".agents", "templates", relPath)` literals (469, 516) to `getTemplatesRoot()`. (Grounding addition — not in design's WS-3 list.)
- WS3-T11: re-point the docstring at line 266 citing `.agents/templates/.prettierignore` → `.bkit/templates/.prettierignore` (comment-only).

#### [MODIFY] `.bkit/src/bkit-uninstall.ts`

- WS3-T3: re-point `path.join(PKG_ROOT, ".agents", "templates", summary.file)` (425) to `getTemplatesRoot()`.

#### [MODIFY] `.bkit/src/bkit-lint-no-tier-terms.ts`

- WS3-T11: re-point usage comments at lines 3, 18 citing `.agents/scripts/*.ts` / `npx tsx .agents/scripts/bkit-lint-no-tier-terms.ts` → `.bkit/src/...` (comment-only).

### Build / Packaging Boundary (WS-3)

#### [MODIFY] `tsconfig.json`

- **Existence Check:** Exists (`rootDir: .agents/scripts`:13; `include`:18; `exclude` lists `.agents/skills`:19).
- Move `rootDir` + `include` to `.bkit/src`; drop the `.agents/skills` exclude entry (skills stay in `.agents/` but are not TS sources); retain `**/*.test.ts` exclude; keep `outDir: dist` unchanged. (WS3-T6.)

#### [MODIFY] `vitest.config.ts`

- **Existence Check:** Exists — `include` (line 5) hardcodes `.agents/scripts/**/*.test.ts` + `.agents/scripts/**/*.integration.test.ts`.
- Re-target BOTH globs to `.bkit/src/**`. **Required, not optional** — if missed, vitest discovers zero tests and CI passes green-but-empty (the byte-identical oracle never runs). (WS3-T7.)

#### [MODIFY] `package.json`

- **Existence Check:** Exists. `files[]` (10-18) = `dist`, `.agents`, `README.md`, `CHANGELOG.md`, `!.agents/scripts/*.test.ts`, `!.agents/scripts/*.integration.test.ts`, `!.agents/scripts/__snapshots__`.
- `files[]`: add `".bkit"`; KEEP `".agents"`; replace the three `!.agents/scripts/*` exclusions with `!.bkit/src/*.test.ts`, `!.bkit/src/*.integration.test.ts`, `!.bkit/src/__snapshots__`. Net: `dist`, `.bkit`, `.agents`, `README.md`, `CHANGELOG.md` + re-targeted test/snapshot exclusions. (WS3-T8.)
- Scripts: `lint:no-tier-terms` path (line 43) `.agents/scripts/bkit-lint-no-tier-terms.ts` → `.bkit/src/bkit-lint-no-tier-terms.ts`. **Grounding note:** `lint:prose` (line 42) uses `find .agents -maxdepth 1` + `.agents/workflows .agents/prompts` — it does NOT reference `.agents/scripts`, so no change needed — verify and record. (WS3-T8.)

#### [MODIFY] `bkit-install.ts` — `NPM_STRIP_REMAP`

- **Existence Check:** Exists (line 577, `{ gitignore → .gitignore, npmignore → .npmignore }`).
- Unchanged. npm strips `.gitignore`/`.npmignore` by basename anywhere in the tree, so `.bkit/templates/` must continue storing them dot-less. Verification confirms `.bkit/templates/gitignore` actually ships. (WS3-T9.)

### Test Path-Constants (WS-3)

#### [MODIFY] test files with embedded `.agents/templates/...` literals (WS3-T10)

- `bkit-templates.content.test.ts`, `bkit-modules.test.ts`, `bkit-modules.integration.test.ts` (1222, 1334, 1516, 1538, 1568, 1597 + 678, 869, 1151, 1263 per design), `bkit-modules.upgrade.integration.test.ts`, `bkit-tiers.test.ts`, `bkit-release-workflow.test.ts`, `bkit-install.test.ts`, `bkit-install.integration.test.ts` (1021, 1045 — `gitignore` template), `bkit-templates.test.ts` (cwd-relative `path.resolve(".agents/templates")` → `.bkit/templates`), `bkit-dry-run-parity.integration.test.ts:29` (`fs.mkdirSync(tmpDir/.agents/templates)`), `bkit-doctor.integration.test.ts` (191, 192), `bkit-preflight.test.ts` (536, 858).
- Leave structurally-correct derivations untouched: `path.resolve(SCRIPTS_DIR, "..", "..")` PKG_ROOT (`.bkit/src` is still two levels under repo root, like `.agents/scripts`) and `CORE_TEMPLATE_DIRS`.

#### [MODIFY] `__snapshots__/bkit-templates.content.test.ts.snap` (WS3-T10)

- Regenerate via `--update-snapshots`; the describe label embeds `.agents/templates/.github/workflows/ci.yml` → `.bkit/templates/...`. Cosmetic; review the diff.

### Observability (WS-5)

#### [MODIFY] `bkit-install.ts` (doctor verb, ~697-719) or `bkit-doctor.*`

- Extend `bkit doctor` (read-only) to print `[bkit-doctor] Templates root: <resolved path>` via `getTemplatesRoot()`. (WS5-T1.)

### D1 Orphan Removal (WS-3, upgrade path)

#### [MODIFY] `bkit-install.ts` (upgrade flow, ~722+)

- Beyond deleting the dead `runPayload` templates arm, add active removal of the consumer's orphaned `.agents/templates/` during `bkit upgrade` (clean migration). Must be a no-op when the dir is already absent (fresh consumers) and dry-run aware. (WS3-T5.)

### Hand-off artifacts

**CONSUMED from Sub-Plan 1:** the `bkit-paths.ts` seam (flipped here by WS3-T2), the fail-loud guard + path-agnostic test (re-verified by WS3-T2), `bkit-paths.test.ts` + `bkit-dogfood-noop.integration.test.ts` (move with WS3-T1, re-verified by WS3-T2).

**PRODUCED for Sub-Plan 3 + Sub-Plan 4:** the relocated `.bkit/src/` + `.bkit/templates/` trees, the flipped seam, the re-pointed config, the D1 upgrade orphan-removal behaviour, and a green build/test state — all of which Sub-Plan 3 verifies and Sub-Plan 4's prose targets. `.bkit/templates/.agents/rules.md` (created by `git mv`) is Sub-Plan 4's WS7-T1 gate target.

## Documentation Updates

None executed in this sub-plan — all doc/prose updates are Sub-Plan 4 (WS-6), merge-gated with this move in the same PR.

## Rollback Strategy

Code-only — `git revert {squash-merge SHA}` restores `.agents/scripts`/`.agents/templates` and all re-points atomically. The D1 auto-clean is one-directional but harmless on rollback (consumers simply re-receive nothing under `.agents/templates/`).

## Agent Execution Runbook

[Chronological. Ordering is LOAD-BEARING. This sub-plan starts ONLY after Sub-Plan 1 Gate WS-1 + Gate WS-2 are green and committed.]

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, DO NOT fail silently. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification) before starting the next.
> **No per-edit `bkit install`:** Do NOT run `pnpm bkit install`/mirror-regen after every edit. Defer mirror regeneration to end-of-session (per MEMORY).

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable.

### Phase WS-3 — Physical move, resolver re-point, tooling/config & dead-arm deletion (#163; requires Sub-Plan 1)

- [ ] **WS3-T1:** `git mv .agents/scripts .bkit/src` and `git mv .agents/templates .bkit/templates`.
  - **Done when:** `.bkit/src/bkit-install.ts` and `.bkit/templates/.agents/rules.md` exist; `.agents/scripts` and `.agents/templates` no longer exist; git tracks the moves.
- [ ] **WS3-T2:** Flip `BKIT_SRC_SUBPATH` to the `.bkit/src` form and encode `.bkit/templates` only in `getTemplatesRoot()`; leave the `dist/` arm of `getPkgRoot()` untouched. After the flip, RE-RUN the WS1-T5 fail-loud-guard test AND the WS1-T7 `getPkgRoot()` 3-context test against the relocated layout — a guard that regressed to never-firing post-move, or a `getPkgRoot()` arm that broke under the new subpath, MUST be caught here (grep-only Gate WS-3 cannot exercise either).
  - **Done when:** `getTemplatesRoot()` resolves to `.bkit/templates`; `getPkgRoot()` resolves correctly under `tsx`-from-`.bkit/src` (two levels up); dogfood integration test green; AND the WS1-T5 guard test (path-agnostic) is RE-VERIFIED green against the relocated `.bkit/templates` root (confirming the guard still fires); AND the WS1-T7 `bkit-paths.test.ts` 3-context test is RE-VERIFIED green post-flip (all three arms — dist / tsx-from-`.bkit/src` / packed-tarball — still pass).
- [ ] **WS3-T3:** Replace every executable inline `path.join(PKG_ROOT, ".agents", "templates", …)` LITERAL with `getTemplatesRoot()` across `bkit-modules.ts` (188, 558, 620, 645, 670, 749, 1348, 1532, 1725, 1831, 1928), `bkit-install.ts` (upgrade `tplRoot` 736), `bkit-uninstall.ts` (425), `bkit-preflight.ts` (469, 516). (Scope: executable `path.join` call-sites ONLY; engine-source STRINGS/COMMENTS are WS3-T11.)
  - **Done when:** `rg '"\.agents",\s*"templates"' .bkit/src` returns zero hits in non-test source; all template `path.join` lookups route through `getTemplatesRoot()`.
- [ ] **WS3-T4:** Delete the dead templates arm of `runPayload` (`bkit-install.ts:660-666`); keep the workflows/prompts arm `src === dst` skip.
  - **Done when:** `runPayload` has no `tplSrc`/`tplDst`/`mirrorDirAlways` templates block; payload tests green.
- [ ] **WS3-T5:** Add D1 upgrade orphan-removal: `bkit upgrade` actively removes consumer `.agents/templates/`. Add a WS-3-local integration smoke test so the behaviour is independently verifiable within WS-3 (not only via the WS-4 manual gate): seed a temp dir with a `.agents/templates/` dir, run upgrade, assert the dir is removed; assert no-op when the dir is absent; assert dry-run writes nothing.
  - **Done when:** upgrade removes an existing consumer `.agents/templates/` (dry-run aware), no-op when absent; a WS-3-local integration test asserts all three (present→removed, absent→no-op, dry-run→no-write) and is green; end-to-end coverage remains the WS-4 upgrade assertion (Sub-Plan 3 WS4-T4).
- [ ] **WS3-T6:** Update `tsconfig.json` (`rootDir`/`include` → `.bkit/src`; drop `.agents/skills` exclude; keep `outDir: dist`, `**/*.test.ts` exclude).
  - **Done when:** `pnpm build` emits to flat `dist/`; `check:dist` green; `bin` unchanged.
- [ ] **WS3-T7:** Re-target `vitest.config.ts` `include` globs (both) to `.bkit/src/**`.
  - **Done when:** `pnpm test` discovers the relocated test files (non-zero test count); no test runs from `.agents/scripts`.
- [ ] **WS3-T8:** Update `package.json` `files[]` (add `.bkit`, keep `.agents`, re-target exclusions to `.bkit/src`) and `lint:no-tier-terms` path; record `lint:prose` needs no change.
  - **Done when:** `files[]` = `dist`, `.bkit`, `.agents`, `README.md`, `CHANGELOG.md` + `!.bkit/src/*.test.ts`, `!.bkit/src/*.integration.test.ts`, `!.bkit/src/__snapshots__`; `lint:no-tier-terms` points at `.bkit/src/bkit-lint-no-tier-terms.ts`.
- [ ] **WS3-T9:** Confirm `NPM_STRIP_REMAP` unchanged; verify `.bkit/templates/gitignore` stored dot-less.
  - **Done when:** `.bkit/templates/gitignore` exists (no dot); `NPM_STRIP_REMAP` byte-identical to pre-move.
- [ ] **WS3-T10:** Update all test path-constants (re-point embedded `.agents/templates/...` and `path.join(..., ".agents", "templates", …)` separated-segment literals across the test files — the grep set is whatever `rg '\.agents.{0,2}templates' .bkit/src --glob '*.test.ts'` reports post-move; including `bkit-preflight.test.ts` (536, 858) whose hits are an `it(...)` description string + a comment, AND `bkit-dry-run-parity.integration.test.ts:29` whose hit is `fs.mkdirSync(path.join(tmpDir, ".agents", "templates"))` — a tmpDir-relative scratch dir, re-point to `.bkit`/`templates` segments to match the moved layout; leave `path.resolve(SCRIPTS_DIR, "..", "..")` and `CORE_TEMPLATE_DIRS` untouched) and regenerate the `bkit-templates.content.test.ts.snap` snapshot. Also re-point the test-file describe-label and comment strings that PRODUCE the snapshot labels (e.g. `bkit-templates.content.test.ts` describe labels; `bkit-modules.integration.test.ts` comments; `bkit-release-workflow.test.ts` describe label).
  - **Done when:** `pnpm test` green; snapshot diff shows only `.agents/templates/...` → `.bkit/templates/...` describe-label changes; `rg '\.agents.{0,2}templates' .bkit/src --glob '*.test.ts'` returns ONLY dest-layout-describing hits (the `.agents/` segment inside `.bkit/templates/.agents/`, `CORE_TEMPLATE_DIRS`) — no source-root or stale-scratch `.agents`+`templates` literals remain; `bkit-preflight.test.ts` and `bkit-dry-run-parity.integration.test.ts` no longer carry the stale strings.
- [ ] **WS3-T11:** Re-point stale `.agents/(templates|scripts)` references inside the relocated ENGINE SOURCE that are STRINGS or COMMENTS (not `path.join` literals; those are WS3-T3). **Prioritise the load-bearing consumer-facing error message at `bkit-modules.ts:1255`** (`"… Remove from .agents/templates/.github/workflows/ci.yml …"` → `.bkit/templates/.github/workflows/ci.yml`) — post-move this string ships in the engine and instructs consumers about a path that no longer exists in the tarball. Then the comment/docstring references: `bkit-modules.ts` (272, 286, 300), `bkit-install.ts` (568, 623, 624, 734), `bkit-preflight.ts` (266), `bkit-lint-no-tier-terms.ts` (3, 18). Leave the dest-layout-describing `.agents/` segment INSIDE `.bkit/templates/.agents/` and `CORE_TEMPLATE_DIRS` untouched.
  - **Done when:** `bkit-modules.ts:1255` error string reads `.bkit/templates/.github/workflows/ci.yml`; `rg '\.agents/(scripts|templates)' .bkit/src` (excluding test files / `__snapshots__`) returns only genuinely dest-relative / dest-layout hits (e.g. the `.agents/` segment inside `.bkit/templates/.agents/`, `CORE_TEMPLATE_DIRS`) — no remaining SOURCE-root references in strings or comments; AND `bkit-modules.ts` `COPY_EXCLUDE` no longer lists `scripts`, OR it retains it with a one-line inline comment stating why (cosmetic — `.agents/scripts` is gone either way); `pnpm test` green regardless of which is chosen.

### 🔒 Gate WS-3: move complete, build + tests green

- [ ] **Gate WS-3 - Verified:** `pnpm build`, `check:dist`, `pnpm test` all green post-move; `rg '\.agents/(scripts|templates)' .bkit/src tsconfig.json vitest.config.ts package.json` returns ONLY dest-relative / dest-layout-describing hits (the `.agents/` segment inside `.bkit/templates/.agents/`, `CORE_TEMPLATE_DIRS`) — i.e. WS3-T3 (literals) AND WS3-T11 (strings/comments) BOTH applied so no source-root reference survives; any residual non-dest hit means a WS3-T3/T11 item was missed.

### Phase WS-5 — Doctor observability (#165; requires WS-1; lands within the same PR)

- [ ] **WS5-T1:** Extend `bkit doctor` to print `[bkit-doctor] Templates root: <resolved path>` via `getTemplatesRoot()`.
  - **Done when:** `bkit doctor` stdout contains the line; `bkit-doctor.integration.test.ts` asserts it.

> [!IMPORTANT]
> **Hand-off:** With Gate WS-3 green and WS5-T1 done, the relocated trees + flipped seam + green build/test state are ready. Sub-Plan 3 ([`plan-v4-3.md`](./plan-v4-3.md)) now runs the two-axis byte-identical verification, and Sub-Plan 4 ([`plan-v4-4.md`](./plan-v4-4.md)) now applies the merge-gated docs/prose + rules.md gate (SAME squash PR). Sub-Plan 3 and Sub-Plan 4 are independent of each other; both must complete before merge.
