<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Centralise install code into `.bkit/` — Sub-Plan 1: Resolver seam + Baseline capture (WS-1, WS-2 / #161, #162)

**Parent Plan:** [`160-centralise-install-code-plan.md`](./160-centralise-install-code-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `160-centralise-install-code-plan-1.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is the ROOT sub-plan (no dependencies).** It produces the resolver seam (still pointing at OLD `.agents/` paths) and the pre-move baseline artifacts. Sub-Plan 2 ([`160-centralise-install-code-plan-2.md`](./160-centralise-install-code-plan-2.md)) and Sub-Plan 3 ([`160-centralise-install-code-plan-3.md`](./160-centralise-install-code-plan-3.md)) consume these. **No `git mv` happens in this sub-plan** — the physical move is Sub-Plan 2 and MUST NOT start until this sub-plan's Gate WS-1 and Gate WS-2 are green and committed (mid-state self-overwrite hazard).

## Context & Goals

Issue #160 centralises bkit's install **machinery** (engine source `.agents/scripts/bkit-*.ts` + install payload `.agents/templates/**`) into a single `.bkit/` root, while bkit's **own dogfooded runtime** (`.agents/` rules/docs/skills/workflows/prompts) stays in `.agents/` so the repo's `.agents/` keeps looking exactly like an installed consumer's. This is a **structural refactor, not a behaviour change**: a consumer who installs OR upgrades across this release must receive byte-identical content.

This sub-plan covers **WS-1 (resolver-seam consolidation + dogfood safety scaffolding, pre-move)** and **WS-2 (pre-refactor baseline capture)**. WS-1 adds the single resolver seam (`getTemplatesRoot()`, `isDogfood()`, `BKIT_SRC_SUBPATH`) — still pointing at the OLD `.agents/` paths — plus the fail-loud guard and the dogfood/3-context tests. WS-2 captures the byte-identical oracle (hashes + recursive tree + pack file-list + stale-consumer setup) from a packed tarball of the post-scaffolding, pre-move state.

**Success Criteria (this sub-plan):**

- `bkit-paths.ts` exports `BKIT_SRC_SUBPATH`, `getTemplatesRoot()` (→ `.agents/templates` for now), `isDogfood()`; header comment enumerates the three run-contexts.
- Fail-loud guard (path-agnostic), dogfood-noop integration test, and `getPkgRoot()` 3-context unit test all green with the tree STILL at `.agents/`.
- Four baseline artifacts committed under `baseline/`, captured from a packed tarball (NOT the source tree); no `git mv` has run.

## Binding Decisions (apply in this sub-plan)

- **D1 — drop + upgrade auto-clean:** This sub-plan captures the **stale-consumer baseline** (WS2-T5) that Sub-Plan 3 uses to prove the orphan `.agents/templates/` is actively removed on upgrade.
- **D2 — `dist/` stays at root:** `dist/`, `bin`, `tsconfig outDir`, `.bkit-version` schema all unchanged. WS-1 keeps the `dist/` arm of `getPkgRoot()` untouched.
- **D3 — `rules.md` block-scoped gate:** not exercised in this sub-plan (Sub-Plan 4).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong. This confirmation gates the ENTIRE #160 workstream (all four sub-plans), not just this one.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative _(inherited from design — do not rewrite)_

A bkit maintainer opens the repo and finds all install machinery and payload under one obvious `.bkit/` root, while the repo's own `.agents/` looks exactly like an installed consumer's. A consumer who upgrades across this release sees no change at all — their `.agents/`, `.claude/`, `.cursor/`, `.github/`, `.husky/` and root dotfiles are written with byte-identical content to before.

### Success Criteria _(inherited from design — do not rewrite)_

- Install/upgrade engine lives under `.bkit/src/`; the full install payload (including `.claude`/`.cursor`/`.github`/`.husky` and root dotfiles) lives under `.bkit/templates/`; `.agents/` no longer contains any install **source** but DOES retain bkit's runtime content (rules/docs/skills + the `bkit-*` workflows/prompts + the `copyAdditive` canonical docs the engine ships), which continues to be packed in the tarball.
- A packed-tarball install AND upgrade into a clean consumer dir produce (a) `.bkit-version` `canonicalHashes`/`tier3Hashes` AND (b) a recursive `.agents/` consumer-tree listing identical to a pre-refactor baseline (the second axis covers the untracked `copyAdditive` payload the hash set omits).
- Running `bkit install` inside the bkit repo is a zero-write no-op for `.agents/` (dogfood preserved).
- `bin` stays `./dist/bkit-install.js` and `dist/` stays flat at repo root — no consumer re-config, `check:dist` still green.
- `.bkit-version` schema is unchanged and no consumer migration runs.

### Concrete Example _(plan expands from design)_

**Setup:** A bkit maintainer on a clean checkout of the post-refactor `dev` branch, plus an existing downstream consumer repo that installed bkit 2.7.0 and therefore has a stale `.agents/templates/` directory on disk (D1).

**Steps:**

1. Maintainer runs `pnpm pack` → builds `@cbartens-bkit-x.y.z.tgz`. They `npm pack --dry-run` and diff the file list against the WS-2 baseline → System shows the ONLY removals are `.agents/scripts/**` and `.agents/templates/**`, now present under `.bkit/src/**` and `.bkit/templates/**`; `.bkit/templates/gitignore` and all `.agents/` runtime reads (`trackers.md`, `IDEs.md`, `cloud.md`, `prompts.md`, `workflows.md`, `skills/**`, `workflows/bkit-*.md`, `prompts/bkit-*.md`) still ship.
2. Maintainer installs the tarball into a fresh empty dir and runs `bkit install` → System writes `.agents/`, `.claude/`, `.cursor/`, `.github/`, `.husky/` and root dotfiles; the resulting `.bkit-version` hashes AND recursive `.agents/` tree match the baseline. Fresh consumer has NO `.agents/templates/` (intended — D1).
3. Maintainer installs the tarball over the stale-2.7.0 consumer and runs `bkit upgrade` → System produces baseline-identical tracked output AND actively removes the orphaned `.agents/templates/` directory left from 2.7.0 (D1 auto-clean).
4. Maintainer runs `bkit install` inside the bkit repo itself → System reports a zero-write no-op for `.agents/` (dogfood); `git status` shows no changes under `.agents/`.
5. Maintainer runs `bkit doctor` → System prints `[bkit-doctor] Templates root: <resolved path>` pointing at `.bkit/templates`.

**Outcome:** Both engines produce byte-identical consumer output vs the baseline; the orphan `.agents/templates/` is gone after upgrade; in-repo install writes nothing; the tarball ships the relocated trees and keeps the `.agents/` runtime.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Dogfood self-overwrite (in-repo install after templates move) | `isDogfood()` short-circuits any payload copy into `.agents/`; integration test asserts zero writes. |
| Dual run-context divergence (`dist/` vs `tsx`-from-`.bkit/src` vs packed tarball) | `getPkgRoot()` suffix derived from shared `BKIT_SRC_SUBPATH`; `tsx`-context dogfood integration test runs (not `dist/`-only); `check:dist` covers the `dist/` arm. |
| Missed / mis-resolved source path resolves to non-existent dir | Fail-loud guard: `[bkit-modules] Templates root not found at <path> — package corrupt?` + `process.exit(1)` instead of silent `if (!fs.existsSync) return`. |
| `.bkit/templates/gitignore` not actually shipped (npm strips `.gitignore` by basename) | `NPM_STRIP_REMAP` unchanged; tarball-content assertion confirms `.bkit/templates/gitignore` ships dot-less. |
| In-flight consumer upgrades across the boundary | `.bkit-version` keys are destination paths (unaffected); no migration runs; `tplRoot` source change is transparent. |
| Existing consumer has stale `.agents/templates/` from a pre-move release (D1) | Upgrade actively removes the orphan dir; recursive `.agents/` diff asserts it is GONE after upgrade. |
| vitest discovers zero tests post-move (glob still points at `.agents/scripts`) | `vitest.config.ts` `include` globs re-targeted to `.bkit/src/**`; CI must run the byte-identical oracle, not pass green-but-empty. |
| `rules.md` `### bkit Repo Authoring` section (outside `bkit:start/end`) ships to consumers or trips the WS-7 gate | WS-7 gate compares the managed `bkit:start`→`bkit:end` block ONLY; the bkit-repo-only section at `rules.md:98` is never shipped, never compared (D3). |
| WS-6 `renovate.json5` `ignorePaths` source edit vs WS-4 "hash-set diff is empty" | Hashes key on consumer DESTINATION path and populate only from `ws.writes` (`bkit-modules.ts:434-454`); `.github/renovate.json5` is opt-in (`bkit install --renovate`), absent from the default-flow writes — so the source-template edit never perturbs the default-flow hashed set. WS-4 baseline + verify use identical (default) flags; gate stays satisfiable. If `--renovate` IS exercised, the lone permitted delta is `.github/renovate.json5` reflecting `ignorePaths: [".bkit/templates/**"]`. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. **Rows owned by this sub-plan are marked ✦; others are completed in the named downstream sub-plan.**

<!-- prettier-ignore -->
| Test description | Type | Target file | Owner |
| --- | --- | --- | --- |
| In-repo `bkit install` writes nothing to `.agents/` when `isDogfood()`, in `tsx`-from-source context | Integration (Vitest) | `.bkit/src/bkit-dogfood-noop.integration.test.ts` (NEW; lands pre-move under `.agents/scripts/`, moves with WS-3) | ✦ WS1-T6 |
| A non-existent (injected, path-agnostic) templates root triggers the fail-loud guard `process.exit(1)` — re-verified post-flip in WS3-T2 | Unit (Vitest) | `.bkit/src/bkit-modules.test.ts` (guard lives in `bkit-modules.ts`; authored by WS1-T5) | ✦ WS1-T5 |
| `getPkgRoot()` resolves correctly under dist, tsx-from-source, packed-tarball contexts (dist arm explicitly asserted — what consumers run) | Unit (Vitest) | `.bkit/src/bkit-paths.test.ts` (NEW; authored by WS1-T7, re-verified post-flip in WS3-T2; lands pre-move under `.agents/scripts/`, moves with WS-3) | ✦ WS1-T7 |
| Post-move packed-tarball install → `.bkit-version` hashes + recursive `.agents/` tree == baseline | Integration (harness/script) | `.bkit/src/bkit-modules.integration.test.ts` + WS-4 verify script | Sub-Plan 3 (WS4-T1/T2) |
| Post-move packed-tarball upgrade → baseline-identical AND orphan `.agents/templates/` removed | Integration (harness/script) | `.bkit/src/bkit-modules.upgrade.integration.test.ts` + WS-4 verify script | Sub-Plan 3 (WS4-T3/T4) |
| `bkit install --dry-run` diff empty on a clean consumer clone before/after | Integration (Vitest) | `.bkit/src/bkit-dry-run-parity.integration.test.ts` (EXISTING; moves with WS-3 `git mv`, re-pointed by WS3-T10, re-verified by WS4-T6) | Sub-Plan 2/3 |
| `npm pack --dry-run` removals-only diff (only `.agents/scripts/**` + `.agents/templates/**`) | Integration (script/test) | WS-4 verify script (documented command) | Sub-Plan 3 (WS4-T5); baseline ✦ WS2-T4 |
| `bkit doctor` prints resolved templates root | Integration (Vitest) | `.bkit/src/bkit-doctor.integration.test.ts` | Sub-Plan 2 (WS5-T1) |
| Template content snapshot regenerated under `.bkit/templates/...` describe label | Snapshot (Vitest) | `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` | Sub-Plan 2 (WS3-T10) |
| (WS-7) bkit's own `.agents/rules.md` managed block byte-equals `.bkit/templates/.agents/rules.md` block | Unit (Vitest) or CI lint | `.bkit/src/bkit-rules-sync.test.ts` (NEW) | Sub-Plan 4 (WS7-T1) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention. This confirmation gates the ENTIRE #160 workstream.

**New folder / file names introduced:**

- `.bkit/` — new root folder; single source of truth for install machinery.
- `.bkit/src/` — relocated engine (was `.agents/scripts/`); becomes the `tsconfig` `rootDir`.
- `.bkit/templates/` — relocated install payload (was `.agents/templates/`).
- New seam functions in `.bkit/src/bkit-paths.ts`: `getTemplatesRoot()`, `isDogfood()`, plus a shared `BKIT_SRC_SUBPATH` constant.

> [!WARNING]
> **Consumer-visible behaviour change (intended, per D1):** Fresh consumers stop receiving an `.agents/templates/` directory (bkit's internal source tree was never meant to land in consumer repos). Existing consumers that already have a stale `.agents/templates/` from a pre-move release will have it **actively removed** on `bkit upgrade` (auto-clean). This is an _untracked-output_ change (not part of `canonicalHashes`/`tier3Hashes`), surfaced and asserted by the recursive `.agents/`-tree axis of the verification gate.

> [!WARNING]
> **Consumer-facing operational change (ships same release):** the shipped `renovate.json5` template's `ignorePaths` glob changes from `.agents/templates/**` → `.bkit/templates/**`. Without this, consumer Renovate would scan the relocated tree and emit onboarding-PR noise.

> [!IMPORTANT]
> **Explicitly NOT changed (D2):** `dist/` stays flat at repo root; `bin` stays `./dist/bkit-install.js`; `tsconfig` `outDir: dist` unchanged; `.bkit-version` schema unchanged (no migration). `.agents/` STAYS in `files[]` (its runtime is hard-read by the engine — `loadTrackers` throws if `trackers.md` is absent).

> [!IMPORTANT]
> **WS-7 gate scope (D3):** the rules.md byte-equality gate compares the managed `bkit:start`→`bkit:end` block ONLY. The `### bkit Repo Authoring` section (`.agents/rules.md:98`, after `bkit:end`) is intentionally bkit-repo-only — it must never ship to consumers and must never trip the gate. There is nothing to "reconcile."

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Out of Scope

- Relocating `dist/` to `.bkit/dist/` (D2 — explicitly out of scope this release).
- Any `.bkit-version` schema migration (keys are destination-relative; nothing changes).
- Auto-registration of installed skills into `.agents/skills.md` (curated manually by design).
- The physical `git mv` and resolver re-point (Sub-Plan 2); the two-axis verify (Sub-Plan 3); docs/prose + rules.md gate (Sub-Plan 4).

## Merge Method

**Merge method: always squash.** The core move (WS-1→WS-6) MUST land as a single atomic PR. WS-2 baseline artifacts produced here may be a separate commit within the same PR. No `rebase`/`merge-commit`.

## Supersession Inventory (rows relevant to this sub-plan)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `runPayload()` inline PKG_ROOT suffix walk (`bkit-install.ts:627-630`) | single `getPkgRoot()` call | DELETE | Duplicate of `getPkgRoot()`; collapsing into one seam prevents a missed-literal break under `tsx`-from-`.bkit/src`. (WS1-T4.) |

> The remaining Supersession rows (`.agents/scripts/**`, `.agents/templates/**`, dead `runPayload` templates arm, the ~19 inline literals, the consumer orphan dir) are executed in Sub-Plan 2 (move/re-point/dead-arm) and Sub-Plan 3 (orphan removal verification). This sub-plan only collapses the duplicate suffix walk.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. Structural refactor of internal package layout.

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing. _(This Pre-Flight gates the entire #160 workstream and lives in this root sub-plan.)_

### Core (always verify)

- [x] **Package Management:** `package.json` `files[]`/`bin`/scripts and `pnpm-lock.yaml` sync cleanly; no new runtime deps (the move adds none — `picomatch` stays the only `dependencies` entry).
- [x] **Dependency Versions:** Spot-check `pnpm --version`, `npx tsc --version`, `tsx`/`vitest` versions; confirm `tsc` build still emits to flat `dist/` with `bin` unchanged.
- [x] **User Context:** Read/write access to `.agents/scripts/**`, `.agents/templates/**`, `tsconfig.json`, `vitest.config.ts`, `package.json`, `docs/**`, `.agents/rules.md`.
- [x] **Pending Blockers:** No open `blocker`-labelled issues on #160–#167.
- [x] **Project Context:** Re-read `docs/decisions.md`, `docs/knowledge.md` for prior bkit-install/dogfood gotchas (tarball dogfood, install↔upgrade divergence, `.npmrc` var substitution, ASCII operators in workflow/prompt files).
- [x] **Testing & Quality:** Confirm `vitest` discovery glob and `docs/testing.md` tier boundaries (`*.test.ts` unit, `*.integration.test.ts` integration); plan re-targets the glob in WS-3 (Sub-Plan 2).
- [x] **Prerequisite Plans:** None — this is the root sub-plan for #160; WS dependency edges are internal to the split (Sub-Plan 1 → Sub-Plan 2 → Sub-Plan 3; Sub-Plan 2 → Sub-Plan 4).

### Conditional (verify only when applicable)

- [x] **Architecture & UI** _(new files)_: New seam in `bkit-paths.ts` adheres to `docs/architecture.md` topology (which WS-6 / Sub-Plan 4 updates to describe `.bkit/`).
- [x] **Observability** _(new log points)_: fail-loud guard emits `[bkit-modules] Templates root not found at <path> — package corrupt?` following the `[Context] Message` convention. (`bkit doctor` line is Sub-Plan 2.)

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to the Agent Execution Runbook.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [x] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

None — no application database. The relevant data contract is the consumer's `.agents/.bkit-version` (`pinnedVersion`, `canonicalHashes`, `tier3Hashes`), whose keys are consumer-relative **destination** paths. This refactor changes only the package-internal source location, leaving every destination key identical. `.bkit-version` schema is unchanged and **no migration runs**.

## Architecture & Component Changes (this sub-plan)

> All paths grounded against the live tree. Today the dual PKG_ROOT suffix walk lives in BOTH `getPkgRoot()` (`bkit-paths.ts:17-22`) and inline in `runPayload()` (`bkit-install.ts:627-630`).

### Engine / Resolver Seam (WS-1, pre-move)

#### [MODIFY] `.agents/scripts/bkit-paths.ts`

- **Existence Check:** Exists (`getPkgRoot()` at lines 17-22; header comment at 9-15 names only two run-contexts).
- Add `BKIT_SRC_SUBPATH` shared constant (currently the suffix is the inline literal `${path.sep}.agents${path.sep}scripts`); WS-1 keeps it pointing at `.agents/scripts` (string flip happens in WS-3 / Sub-Plan 2).
- Add `getTemplatesRoot()` — `path.join(getPkgRoot(), ".agents", "templates")` in WS-1 (becomes `.bkit/templates` in WS-3). The ONLY encoding of the templates sub-path.
- Add `isDogfood()` — `getPkgRoot() === process.cwd()`.
- Expand the header comment block to enumerate **three** run-contexts (dist; `tsx`-from-source; packed tarball) and which arm each hits (bus-factor mitigation).

#### [MODIFY] `.agents/scripts/bkit-install.ts` (WS-1 scope only)

- **Existence Check:** Exists.
- WS-1: refactor `runPayload()` (627-630) to derive `PKG_ROOT` via `getPkgRoot()` instead of the inline suffix walk — collapsing the duplicate into the single seam. The workflows/prompts arm (639-658) keeps its `src === dst` skip unchanged. (Upgrade `tplRoot` re-point, dead-arm deletion, and D1 orphan removal are Sub-Plan 2.)

#### [MODIFY] `.agents/scripts/bkit-modules.ts` (WS-1 scope only)

- **Existence Check:** Exists.
- WS-1: replace the silent `if (!fs.existsSync(...)) return;` semantics for templates-derived paths with a fail-loud guard mirroring the existing `bkit-modules.ts:359` hard-exit (`[bkit-modules] Templates root not found at <resolved path> — package corrupt?` + `process.exit(1)`). (The ~11 inline `path.join` literal re-points and string/comment re-points are Sub-Plan 2.)

### Hand-off artifacts PRODUCED by this sub-plan (consumed downstream)

- `bkit-paths.ts` seam (`BKIT_SRC_SUBPATH`, `getTemplatesRoot()`, `isDogfood()`) in OLD `.agents` form → flipped by Sub-Plan 2 (WS3-T2).
- Fail-loud guard + path-agnostic test → re-verified by Sub-Plan 2 (WS3-T2).
- `bkit-paths.test.ts` (3-context) + `bkit-dogfood-noop.integration.test.ts` (authored under `.agents/scripts/`, move with WS3-T1) → re-verified by Sub-Plan 2 (WS3-T2).
- `baseline/bkit-version-hashes.json`, `baseline/agents-tree.txt`, `baseline/pack-filelist.txt`, `baseline/stale-consumer-setup.md` → consumed by Sub-Plan 3 (WS4-T1..T5).

## Documentation Updates

None in this sub-plan — all doc/prose updates are merge-gated with the move in Sub-Plan 4 (WS-6).

## Rollback Strategy

Code-only — `git revert` of the squash merge is sufficient. This sub-plan adds no behaviour change (seam still points at old paths) and writes only `baseline/` artifacts + new tests.

## Agent Execution Runbook

[Chronological. Ordering is LOAD-BEARING. WS-1 + WS-2 MUST complete (Gate WS-1 + Gate WS-2 green and committed) before any `git mv` in Sub-Plan 2, else the migration mid-state self-overwrites the live `.agents/`.]

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, DO NOT fail silently. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification) before starting the next.
> **No per-edit `bkit install`:** Do NOT run `pnpm bkit install`/mirror-regen after every edit. Defer mirror regeneration to end-of-session (per MEMORY).

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable.

### Phase WS-1 — Resolver-seam consolidation & dogfood safety scaffolding (pre-move; #161)

- [x] **WS1-T1:** Add `BKIT_SRC_SUBPATH` shared constant to `bkit-paths.ts` (value still `.agents/scripts` form) and derive `getPkgRoot()`'s suffix check from it.
  - **Done when:** `bkit-paths.ts` exports/declares `BKIT_SRC_SUBPATH`; `getPkgRoot()` uses it; `pnpm test` + `pnpm build` green; no behaviour change.
- [x] **WS1-T2:** Add `getTemplatesRoot()` (`path.join(getPkgRoot(), ".agents", "templates")`) and `isDogfood()` (`getPkgRoot() === process.cwd()`) to `bkit-paths.ts`.
  - **Done when:** both functions exported; a unit test asserts `getTemplatesRoot()` ends with `.agents/templates` and `isDogfood()` returns true when cwd === pkgRoot.
- [x] **WS1-T3:** Expand the `bkit-paths.ts` header comment to enumerate the THREE `getPkgRoot()` run-contexts (dist / tsx-from-source / packed tarball) and which arm each hits.
  - **Done when:** header comment lists all three contexts; no two-context-only wording remains.
- [x] **WS1-T4:** Refactor `runPayload()` (`bkit-install.ts:627-630`) to obtain `PKG_ROOT` from `getPkgRoot()`, deleting the inline suffix walk; workflows/prompts arm `src === dst` skip unchanged.
  - **Done when:** no second copy of `scriptDir.endsWith(...scripts)` exists in `bkit-install.ts`; `runPayload` calls `getPkgRoot()`; payload tests green.
- [x] **WS1-T5:** Add the fail-loud templates-root-not-found guard in `bkit-modules.ts` (mirroring `:359`) replacing silent `if (!fs.existsSync) return` for templates-derived paths. The guard's unit test MUST be **path-agnostic** (inject/resolve the templates root via a non-existent path rather than hard-coding `.agents/templates`), so it stays valid after the WS3-T2 templates-root flip and the WS3-T1 `git mv` — i.e. it asserts the guard fires for ANY non-existent resolved root, not specifically `.agents/templates`.
  - **Done when:** unit test asserts that a non-existent (injected) templates root triggers the `[bkit-modules] Templates root not found at <path> — package corrupt?` message + `process.exit(1)`; the test contains NO hard-coded `.agents/templates` literal that would silently keep passing if the guard regressed post-move.
- [x] **WS1-T6:** Add the zero-write in-repo dogfood integration test (asserts `bkit install` writes nothing to `.agents/` when `isDogfood()`), running in the `tsx`-from-source context (not `dist/`-only). Author under `.agents/scripts/` now (moves with WS-3).
  - **Done when:** `bkit-dogfood-noop.integration.test.ts` exists and passes in `tsx` context; asserts zero writes under `.agents/`.
- [x] **WS1-T7:** Author the dedicated `bkit-paths.test.ts` unit test asserting `getPkgRoot()` resolves to repo root under EACH of the three run-contexts named in the matrix and the `bkit-paths.ts` header — dist (`__dirname` under `dist/` → one level up), tsx-from-source (`__dirname` under `.agents/scripts` pre-move / `.bkit/src` post-move → two levels up), and packed-tarball (`node_modules/@cbartens/bkit/dist` layout). The **dist arm — what consumers actually run — MUST be explicitly asserted**, since WS3-T2 deliberately leaves the `dist/` arm untouched and only `check:dist` exercises it indirectly. Author under `.agents/scripts/` now (moves with WS-3). Owns Derived Test Matrix row 3 (1:1).
  - **Done when:** `bkit-paths.test.ts` exists and passes with three named assertions — one per run-context (dist, tsx-from-source, packed-tarball) — each asserting `getPkgRoot()` resolves to the expected repo/package root; the dist arm is asserted explicitly (not only via `check:dist`).

### 🔒 Gate WS-1: scaffolding green pre-move

- [x] **Gate WS-1 - Verified:** `pnpm test` + `pnpm build` + `check:dist` green with the tree STILL at `.agents/`; no file relocation has occurred yet.

### Phase WS-2 — Pre-refactor baseline capture (#162)

- [x] **WS2-T1:** Build a pre-refactor packed tarball (`pnpm pack`) from the WS-1 (post-scaffolding, pre-move) state and install it into a clean temp dir; run `bkit install`. **Use the default (non-`--renovate`) install flags** — Sub-Plan 3's WS4-T1/WS4-T3 verification MUST use identical flags so the WS-6 `renovate.json5` source edit never perturbs the default-flow hashed set.
  - **Done when:** a clean-dir install from the tarball exists; capture dir under `docs/plans/202605/logs/160-centralise-install-code/baseline/`.
- [x] **WS2-T2:** Capture the `.bkit-version` hash-set baseline (`canonicalHashes` + `tier3Hashes`) as a serialised JSON artifact.
  - **Done when:** `baseline/bkit-version-hashes.json` committed.
- [x] **WS2-T3:** Capture the recursive `.agents/` consumer-tree listing baseline (covers untracked `copyAdditive` payload — `workflows/`, `prompts/`, `IDEs.md`, `cloud.md`, `trackers.md`).
  - **Done when:** `baseline/agents-tree.txt` committed (deterministic sorted listing).
- [x] **WS2-T4:** Capture the pre-refactor `npm pack --dry-run` tarball file list.
  - **Done when:** `baseline/pack-filelist.txt` committed.
- [x] **WS2-T5:** Capture a pre-move baseline on a consumer that HAS `.agents/templates/` (for the D1 orphan-removal upgrade assertion in WS-4 / Sub-Plan 3).
  - **Done when:** `baseline/stale-consumer-setup.md` (single committed artifact — no disjunction) exists and names the EXACT construction step that establishes the stale consumer (install the pre-move WS-1-state tarball from WS2-T1 into a clean dir and run `bkit install`, which writes `.agents/templates/`), so WS4-T4 has a deterministic, named, reproducible input whose `.agents/templates/` is present pre-move.

### 🔒 Gate WS-2: baseline captured before any move

- [x] **Gate WS-2 - Verified:** All four baseline artifacts committed; captured from a packed tarball (NOT the source tree); no `git mv` has run.

> [!IMPORTANT]
> **Hand-off to Sub-Plan 2:** Once Gate WS-1 AND Gate WS-2 are green and committed, Sub-Plan 2 ([`160-centralise-install-code-plan-2.md`](./160-centralise-install-code-plan-2.md)) may begin the physical `git mv`. Do NOT start the move before both gates pass — the live `.agents/` would self-overwrite mid-state and destroy the baseline oracle.
