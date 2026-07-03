Verdict: CONCERNS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Centralise install code, templates & scripts into `.bkit/` — Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

Issue #160 centralises bkit's install **machinery** (engine source `.agents/scripts/bkit-*.ts` + install payload `.agents/templates/**`) into a single `.bkit/` root, while bkit's **own dogfooded runtime** (`.agents/` rules/docs/skills/workflows/prompts) stays in `.agents/` so the repo's `.agents/` keeps looking exactly like an installed consumer's. This is a **structural refactor, not a behaviour change**: a consumer who installs OR upgrades across this release must receive byte-identical content.

The work routes every source lookup (~19 inline `path.join(PKG_ROOT, ".agents", "templates", …)` call-sites + a duplicated PKG_ROOT suffix walk) through one resolver seam (`getTemplatesRoot()`), makes the dogfood no-op explicit (`isDogfood()`), then physically relocates the trees. The design decomposed it into 7 workstreams (WS-1..WS-7) tracked as #161–#167; this umbrella plan sequences them in the load-bearing order: WS-1 (guards + seam, pre-move) → WS-2 (baseline) → WS-3 (physical move) → WS-4 (two-axis verify), with WS-5 (doctor observability), WS-6 (prose/docs, merge-gated), WS-7 (rules.md CI gate).

**Success Criteria:**

- Install engine lives under `.bkit/src/`; full install payload under `.bkit/templates/`; `.agents/` retains only bkit runtime (still shipped in the tarball); `dist/` and `bin` unchanged.
- Packed-tarball install AND upgrade into a clean consumer dir produce `.bkit-version` hashes AND a recursive `.agents/` consumer-tree listing byte-identical to the pre-refactor baseline.
- In-repo `bkit install` is a zero-write no-op for `.agents/` (dogfood preserved).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like _(canonical; both design and plan phases follow this)_

> [!IMPORTANT]
> Subagents (design synthesise, design summary, plan generate, plan review, plan summary) MUST follow this spec. No subagent restates these rules; this section is the single source of truth.

- **Narrative:** 1–2 sentences, user POV (not system POV).
- **Success Criteria:** ≤5 bullets, each measurable / testable.
- **Edge Cases _(plan phase)_:** inherits design's Key Edge Cases verbatim + plan-level cases.
- **Concrete Example _(plan phase only)_:** specific role + starting state + numbered steps + observable outcome.
- **Derived Test Matrix _(plan phase only)_:** one row per testable behaviour → exactly one runbook task.

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

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| In-repo `bkit install` writes nothing to `.agents/` when `isDogfood()`, in `tsx`-from-source context | Integration (Vitest) | `.bkit/src/bkit-dogfood-noop.integration.test.ts` (NEW; lands pre-move under `.agents/scripts/`, moves with WS-3) |
| `getTemplatesRoot()` resolving to a non-existent dir triggers fail-loud `process.exit(1)` | Unit (Vitest) | `.bkit/src/bkit-paths.test.ts` or existing `bkit-modules.test.ts` |
| `getPkgRoot()` resolves correctly under dist, tsx-from-source, packed-tarball contexts | Unit (Vitest) | `.bkit/src/bkit-paths.test.ts` |
| Post-move packed-tarball install → `.bkit-version` hashes + recursive `.agents/` tree == baseline | Integration (harness/script) | `.bkit/src/bkit-modules.integration.test.ts` + WS-4 verify script |
| Post-move packed-tarball upgrade → baseline-identical AND orphan `.agents/templates/` removed | Integration (harness/script) | `.bkit/src/bkit-modules.upgrade.integration.test.ts` + WS-4 verify script |
| `bkit install --dry-run` diff empty on a clean consumer clone before/after | Integration (Vitest) | `.bkit/src/bkit-dry-run-parity.integration.test.ts` |
| `npm pack --dry-run` removals-only diff (only `.agents/scripts/**` + `.agents/templates/**`) | Integration (script/test) | WS-4 verify script (documented command) |
| `bkit doctor` prints resolved templates root | Integration (Vitest) | `.bkit/src/bkit-doctor.integration.test.ts` |
| Template content snapshot regenerated under `.bkit/templates/...` describe label | Snapshot (Vitest) | `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` |
| (WS-7) bkit's own `.agents/rules.md` managed block byte-equals `.bkit/templates/.agents/rules.md` block | Unit (Vitest) or CI lint | `.bkit/src/bkit-rules-sync.test.ts` (NEW) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

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

## Alternative Approaches & Recommendations

Rejected during design (do not revisit without revisiting the design doc):

- **Two-release staged migration (alias-first then drop).** Rejected — the `.bkit-version` hash baseline gives a deterministic oracle, making the dual-ship fallback redundant; staged adds a permanent fallback resolver fork contradicting the single-source-of-truth goal.
- **Full mirror (move workflows/prompts/rules under `.bkit/templates/` too).** Rejected — breaks the workflow/prompt `src === dst` no-op and turns bkit's own `.agents/workflows` into generated files; threatens byte-identical self-install.
- **Engine-only lift, leave `templates/` in `.agents/`.** Rejected — incomplete-refactor trap; leaves cross-agent/IDE files under `.agents/templates/` and adds a third location.
- **Relocate `dist/` → `.bkit/dist/` + change `bin`.** Rejected (and reaffirmed by D2) — unrelated churn risking consumer tooling and the `check:dist` gate for zero centralisation benefit.
- **Symlink bridge / build-time payload staging.** Rejected — platform-fragile, keeps the mislocation alive, adds generated-artifact pipelines.

## Out of Scope

- Relocating `dist/` to `.bkit/dist/` (D2 — explicitly out of scope this release).
- Any `.bkit-version` schema migration (keys are destination-relative; nothing changes).
- Auto-registration of installed skills into `.agents/skills.md` (curated manually by design).
- Rewriting historic `KN-*` incident narrative or commit-hashed `Related:` refs in `docs/knowledge.md` (only forward-looking rules text is updated).

## Merge Method

**Merge method: always squash.** The core move (WS-1→WS-6) MUST land as a single atomic PR — the prose/docs/shipped-config updates (WS-6) are merge-gated with the code move (stale paths would ENOENT setup commands and silently drift consumer `rules.md`). WS-2 baseline artifacts and WS-7 may be separate commits within the same PR or a follow-up PR, but the move + docs + verification ship together. No `rebase`/`merge-commit`.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.agents/scripts/**` (engine source) | `.bkit/src/**` | DELETE (via `git mv`) | Relocated wholesale; no copy left behind. |
| `.agents/templates/**` (install payload) | `.bkit/templates/**` | DELETE (via `git mv`) | Relocated wholesale; no copy left behind. |
| `runPayload()` templates arm (`bkit-install.ts:660-666`) | none (template content reaches consumers via `runCoreTemplates` reading `getTemplatesRoot()`) | DELETE | Dead after move — templates never copied into a consumer's `.agents/templates/`; net simplification. |
| `runPayload()` inline PKG_ROOT suffix walk (`bkit-install.ts:627-630`) | single `getPkgRoot()` call | DELETE | Duplicate of `getPkgRoot()`; collapsing into one seam prevents a missed-literal break under `tsx`-from-`.bkit/src`. |
| Inline `path.join(PKG_ROOT, ".agents", "templates", …)` literals (~19 call-sites across `bkit-modules.ts`, `bkit-install.ts`, `bkit-uninstall.ts`, `bkit-preflight.ts`) | `getTemplatesRoot()` | DELETE (replace each) | Single seam = one place to change and assert; eliminates scattered missed-literal silent-skip failure mode. |
| Consumer `.agents/templates/` directory (orphaned on existing consumers) | nothing (auto-cleaned on upgrade) | DELETE (D1) | Internal source tree never belonged in consumer repos; upgrade actively removes the orphan. |

> [!CAUTION]
> **Default = `DELETE`.** Each `DELETE` row is mirrored in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. This is a structural refactor of internal package layout; no consumer-facing data contract or auth path changes.

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** `package.json` `files[]`/`bin`/scripts and `pnpm-lock.yaml` sync cleanly; no new runtime deps (the move adds none — `picomatch` stays the only `dependencies` entry).
- [ ] **Dependency Versions:** Spot-check `pnpm --version`, `npx tsc --version`, `tsx`/`vitest` versions; confirm `tsc` build still emits to flat `dist/` with `bin` unchanged.
- [ ] **User Context:** Read/write access to `.agents/scripts/**`, `.agents/templates/**`, `tsconfig.json`, `vitest.config.ts`, `package.json`, `docs/**`, `.agents/rules.md`.
- [ ] **Pending Blockers:** No open `blocker`-labelled issues on #160–#167.
- [ ] **Project Context:** Re-read `docs/decisions.md`, `docs/knowledge.md` for prior bkit-install/dogfood gotchas (tarball dogfood, install↔upgrade divergence, `.npmrc` var substitution, ASCII operators in workflow/prompt files).
- [ ] **Testing & Quality:** Confirm `vitest` discovery glob and `docs/testing.md` tier boundaries (`*.test.ts` unit, `*.integration.test.ts` integration); plan re-targets the glob in WS-3.
- [ ] **Prerequisite Plans:** None — this is the umbrella plan for #160; WS dependency edges are internal to this plan (WS-1,WS-2 → WS-3 → WS-4; WS-1 → WS-5; WS-3 → WS-6 → WS-7).

### Conditional (verify only when applicable)

- [ ] **Architecture & UI** _(new files)_: New files `.bkit/src/*` (relocated) + new seam in `bkit-paths.ts` adhere to `docs/architecture.md` topology (which WS-6 updates to describe `.bkit/`).
- [ ] **Observability** _(new log points)_: `bkit doctor` gains `[bkit-doctor] Templates root: <path>`; fail-loud guard emits `[bkit-modules] Templates root not found at <path> — package corrupt?` — both follow the `[Context] Message` convention.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — no application database. The relevant data contract is the consumer's `.agents/.bkit-version` (`pinnedVersion`, `canonicalHashes`, `tier3Hashes` — `bkit-version.ts:37-60`), whose keys are consumer-relative **destination** paths. This refactor changes only the package-internal source location, leaving every destination key identical.

### Data Schema Changes

None — `.bkit-version` schema is unchanged and **no migration runs** (treating it as a migration would risk corrupting valid pins to solve a non-problem).

## Architecture & Component Changes

> All paths grounded against the live tree. Today the dual PKG_ROOT suffix walk lives in BOTH `getPkgRoot()` (`bkit-paths.ts:17-22`) and inline in `runPayload()` (`bkit-install.ts:627-630`). Template literals confirmed at: `bkit-modules.ts` (188, 558, 620, 645, 670, 749, 1348, 1532, 1725, 1831, 1928), `bkit-install.ts` (660-661, 736), `bkit-uninstall.ts:425`, `bkit-preflight.ts` (469, 516). **Grounding correction vs design:** the design's WS-3 scope enumerated `bkit-modules.ts` (8) + `bkit-install.ts` (2) + upgrade + uninstall, but did NOT list `bkit-preflight.ts:469,516` — these two are additional templates-literal call-sites that MUST also be re-pointed (covered by the design's "~17" total but absent from the WS-3 task list). The bulk-edit task below includes them.

### Engine / Resolver Seam (WS-1, pre-move)

#### [MODIFY] `.agents/scripts/bkit-paths.ts`

- **Existence Check:** Exists (`getPkgRoot()` at lines 17-22; header comment at 9-15 names only two run-contexts).
- Add `BKIT_SRC_SUBPATH` shared constant (currently the suffix is the inline literal `${path.sep}.agents${path.sep}scripts`); WS-1 keeps it pointing at `.agents/scripts` (string flip happens in WS-3).
- Add `getTemplatesRoot()` — `path.join(getPkgRoot(), ".agents", "templates")` in WS-1 (becomes `.bkit/templates` in WS-3). The ONLY encoding of the templates sub-path.
- Add `isDogfood()` — `getPkgRoot() === process.cwd()`.
- Expand the header comment block to enumerate **three** run-contexts (dist; `tsx`-from-source; packed tarball) and which arm each hits (bus-factor mitigation — the single most important doc artifact of the refactor).

#### [MODIFY] `.agents/scripts/bkit-install.ts`

- **Existence Check:** Exists.
- WS-1: refactor `runPayload()` (627-630) to derive `PKG_ROOT` via `getPkgRoot()` instead of the inline suffix walk — collapsing the duplicate into the single seam. The workflows/prompts arm (639-658) keeps its `src === dst` skip unchanged.
- WS-3: re-point upgrade `tplRoot` (736) to `path.join(getPkgRoot(), ".bkit", "templates")` (or `getTemplatesRoot()`); DELETE the dead templates arm (660-666); add D1 orphan-removal of consumer `.agents/templates/` to the upgrade path (see below).

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** Exists.
- WS-1: replace the silent `if (!fs.existsSync(...)) return;` semantics for templates-derived paths with a fail-loud guard mirroring the existing `bkit-modules.ts:359` hard-exit (`[bkit-modules] Templates root not found at <resolved path> — package corrupt?` + `process.exit(1)`).
- WS-3 (`path.join` literals, WS3-T3): replace the 11 inline `path.join(PKG_ROOT, ".agents", "templates", …)` literals (188, 558, 620, 645, 670, 749, 1348, 1532, 1725, 1831, 1928) with `getTemplatesRoot()`-rooted joins. Note `CORE_TEMPLATE_DIRS` (line ~154, `{docs, .agents, scripts}`) are dest-relative dir names INSIDE the template tree — NOT source paths — and are untouched (pre-empt false-positive grep hit). `COPY_EXCLUDE` currently lists `scripts` (no longer present under `.agents/` post-move); decide and record whether the `scripts` entry is dropped or retained (cosmetic — `.agents/scripts` is gone either way), pinned to the WS3-T11 `Done when`.
- WS-3 (engine-source STRINGS + COMMENTS, WS3-T11 — distinct from the `path.join` literals above): re-point the stale `.agents/(templates|scripts)` references that live in this file's STRINGS and COMMENTS. **Load-bearing — prioritise:** the consumer-facing error message at `bkit-modules.ts:1255` (`"… Remove from .agents/templates/.github/workflows/ci.yml …"`) — post-move this instructs consumers to edit a path that no longer ships in the tarball, so it MUST read `.bkit/templates/.github/workflows/ci.yml`. **Comments (cosmetic but inside Gate WS-3's `.bkit/src` regex scope):** lines 272, 286, 300 describe the template tree (`.agents/templates/.agents/`, `.agents/templates/.prettierignore`) — re-point the SOURCE root to `.bkit/templates/...`. Leave the dest-layout-describing `.agents/` segment INSIDE `.bkit/templates/.agents/` untouched (it is the destination layout, not a source path).

#### [MODIFY] `.agents/scripts/bkit-preflight.ts`

- **Existence Check:** Exists (`detectTier2JsonDrift` at 469; `detectTier2TextDrift` at 516).
- WS-3 (WS3-T3): re-point both `path.join(pkgRoot, ".agents", "templates", relPath)` literals to `getTemplatesRoot()`. (Grounding addition — not in design's WS-3 list.)
- WS-3 (WS3-T11): re-point the docstring at `bkit-preflight.ts:266` citing `.agents/templates/.prettierignore` → `.bkit/templates/.prettierignore` (comment-only; inside Gate WS-3 scope).

#### [MODIFY] `.agents/scripts/bkit-uninstall.ts`

- **Existence Check:** Exists (line 425).
- WS-3 (WS3-T3): re-point `path.join(PKG_ROOT, ".agents", "templates", summary.file)` to `getTemplatesRoot()`.

#### [MODIFY] `.agents/scripts/bkit-install.ts` — engine-source comments (WS3-T11)

- **Existence Check:** Exists — comments at lines 568, 623, 734 describe the payload mirror / strip remap / upgrade walk citing `.agents/templates/` (and 624 the dogfood note `running from .agents/scripts/`).
- WS-3 (WS3-T11): re-point these source-root comment references to `.bkit/templates/` and `.bkit/src/` respectively (comment-only; inside Gate WS-3 scope).

#### [MODIFY] `.agents/scripts/bkit-lint-no-tier-terms.ts` — usage comments (WS3-T11)

- **Existence Check:** Exists — comments at lines 3, 18 cite `.agents/scripts/*.ts` / `npx tsx .agents/scripts/bkit-lint-no-tier-terms.ts`. (Note: `SCAN_DIRS = [docs]` only and `SCAN_EXTENSIONS = {.md}`, so the lint never actually scans `.agents/scripts/*.ts` — the line-3 comment is already inaccurate today; comment-only.)
- WS-3 (WS3-T11): re-point both usage comments to `.bkit/src/...` (comment-only; inside Gate WS-3 scope).

### Build / Packaging Boundary (WS-3)

#### [MODIFY] `tsconfig.json`

- **Existence Check:** Exists (`rootDir: .agents/scripts`:13; `include`:18; `exclude` lists `.agents/skills`:19).
- Move `rootDir` + `include` to `.bkit/src`; drop the `.agents/skills` exclude entry (skills stay in `.agents/` but are not TS sources); retain `**/*.test.ts` exclude; keep `outDir: dist` unchanged.

#### [MODIFY] `vitest.config.ts`

- **Existence Check:** Exists — `include` (line 5) hardcodes `.agents/scripts/**/*.test.ts` + `.agents/scripts/**/*.integration.test.ts`.
- Re-target BOTH globs to `.bkit/src/**`. **Required, not optional** — if missed, vitest discovers zero tests and CI passes green-but-empty (the byte-identical oracle never runs).

#### [MODIFY] `package.json`

- **Existence Check:** Exists. `files[]` (10-18) = `dist`, `.agents`, `README.md`, `CHANGELOG.md`, `!.agents/scripts/*.test.ts`, `!.agents/scripts/*.integration.test.ts`, `!.agents/scripts/__snapshots__`.
- `files[]`: add `".bkit"`; KEEP `".agents"`; replace the three `!.agents/scripts/*` exclusions with `!.bkit/src/*.test.ts`, `!.bkit/src/*.integration.test.ts`, `!.bkit/src/__snapshots__`. Net: `dist`, `.bkit`, `.agents`, `README.md`, `CHANGELOG.md` + re-targeted test/snapshot exclusions.
- Scripts: `lint:no-tier-terms` path (line 43) `.agents/scripts/bkit-lint-no-tier-terms.ts` → `.bkit/src/bkit-lint-no-tier-terms.ts`. **Grounding note:** `lint:prose` (line 42) uses `find .agents -maxdepth 1` + `.agents/workflows .agents/prompts` — it does NOT reference `.agents/scripts` (design said "review the `find .agents/scripts` reference"; the live script has no such reference, so no change needed — verify and record).

#### [MODIFY] `.agents/scripts/bkit-install.ts` — `NPM_STRIP_REMAP`

- **Existence Check:** Exists (line 577, `{ gitignore → .gitignore, npmignore → .npmignore }`).
- Unchanged. npm strips `.gitignore`/`.npmignore` by basename anywhere in the tree, so `.bkit/templates/` must continue storing them dot-less. Verification gate confirms `.bkit/templates/gitignore` actually ships.

### Test Path-Constants (WS-3)

#### [MODIFY] test files with embedded `.agents/templates/...` literals

- `bkit-templates.content.test.ts`, `bkit-modules.test.ts`, `bkit-modules.integration.test.ts` (1222, 1334, 1516, 1538, 1568, 1597 + 678, 869, 1151, 1263 per design), `bkit-modules.upgrade.integration.test.ts`, `bkit-tiers.test.ts`, `bkit-release-workflow.test.ts`, `bkit-install.test.ts`, `bkit-install.integration.test.ts` (1021, 1045 — `gitignore` template), `bkit-templates.test.ts` (cwd-relative `path.resolve(".agents/templates")` → `.bkit/templates`), `bkit-dry-run-parity.integration.test.ts:29` (`fs.mkdirSync(tmpDir/.agents/templates)`), `bkit-doctor.integration.test.ts` (191, 192).
- Leave structurally-correct derivations untouched: `path.resolve(SCRIPTS_DIR, "..", "..")` PKG_ROOT (`.bkit/src` is still two levels under repo root, like `.agents/scripts`) and `CORE_TEMPLATE_DIRS`.

#### [MODIFY] `__snapshots__/bkit-templates.content.test.ts.snap`

- Regenerate via `--update-snapshots`; the describe label embeds `.agents/templates/.github/workflows/ci.yml` → `.bkit/templates/...`. Cosmetic; review the diff.

### Observability (WS-5)

#### [MODIFY] `.agents/scripts/bkit-install.ts` (doctor verb, ~697-719) or `bkit-doctor.*`

- Extend `bkit doctor` (read-only) to print `[bkit-doctor] Templates root: <resolved path>` via `getTemplatesRoot()`.

### D1 Orphan Removal (WS-3, upgrade path)

#### [MODIFY] `.agents/scripts/bkit-install.ts` (upgrade flow, ~722+)

- Beyond deleting the dead `runPayload` templates arm, add active removal of the consumer's orphaned `.agents/templates/` during `bkit upgrade` (clean migration). Must be a no-op when the dir is already absent (fresh consumers) and dry-run aware.

## Documentation Updates

> Index: `.agents/docs.md`. These are **merge-gated with the code move** (WS-6) — not follow-ups.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/rules.md` | Re-point two-way sync rule (line 102) → `.agents/rules.md ↔ .bkit/templates/.agents/rules.md`; add central principle ("install source of truth lives in `.bkit/`; bkit's own agent runtime lives in `.agents/` exactly as a consumer's does"); re-point preflight ref (line 106) → `.bkit/src/bkit-preflight.ts`. NOTE: the `### bkit Repo Authoring` section is OUTSIDE `bkit:start/end` (line 98) — edit it directly; it never ships. |
| `docs/setup.md` (53-54) | Dogfood commands → `pnpm tsx .bkit/src/bkit-install.ts install` / `... check`. |
| `docs/architecture.md` (30, 48) | Tree entries `.agents/scripts/` → `.bkit/src/`; `.agents/templates/` → `.bkit/templates/`. |
| `docs/technology.md` (22, 39) | Source-language row + `tsc` compile-target row: `.agents/scripts/*.ts` → `.bkit/src/*.ts`. |
| `docs/testing.md` (37, 51) | Test-colocation rule (37) + CI-parity rule (51): `.agents/scripts/` → `.bkit/src/`. (High-visibility Plan/Build workflow-matrix doc.) |
| `docs/deployments.md` | Build-freshness rule (193) → `.bkit/src/*.ts`; ci.yml/template/husky refs (197, 202, 214, 260) → `.bkit/templates/...`; Renovate `ignorePaths` note (211) → `.bkit/templates/**` AND the shipped `renovate.json5` template glob (line 81) AND its lines 66-70 comment block (which falsely describes `.agents/templates/**` as a consumer-written mirror post-D1) in lockstep. |
| `docs/knowledge.md` | Forward-looking rules text ONLY (e.g. KN-7, line 162 `.agents/scripts/*.ts` build rule). Do NOT rewrite historic KN-* narrative or commit-hashed `Related:` refs. |
| `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore` (header comment), `.github/workflows/ci.yml:82` (+ its template source) | Grep `\.agents/(templates\|scripts)` and re-point any hits. |
| `docs/decisions.md` | Append the WS-7 rules.md byte-equality gate decision (block-scoped) if not already recorded. |
| `docs/completed.md` | (Ship phase) one entry for #160 on merge. |

_`.agents/skills.md` stays curated manually (no auto-registration) — no change._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No database. |
| **Code** | `git revert {squash-merge SHA}` | Single squashed PR → one revert restores `.agents/scripts`/`.agents/templates` and all re-points atomically. |
| **Risk window** | None within a release | Consumers only see the new layout after they `pnpm update`; `.bkit-version` schema unchanged so a downgrade install/upgrade re-reads the same destination keys. The D1 auto-clean is one-directional but harmless on rollback (consumers simply re-receive nothing under `.agents/templates/`). |

_Code-only — `git revert` of the squash merge is sufficient._

## Agent Execution Runbook

[Chronological. Ordering is LOAD-BEARING — see design Build sequence. WS-1 + WS-2 MUST complete before any `git mv` (WS-3), else the migration mid-state self-overwrites the live `.agents/`.]

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, DO NOT fail silently. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification) before starting the next.
> **No per-edit `bkit install`:** Do NOT run `pnpm bkit install`/mirror-regen after every edit. Defer mirror regeneration to end-of-session (per MEMORY).

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable.

### Phase WS-1 — Resolver-seam consolidation & dogfood safety scaffolding (pre-move; #161)

- [ ] **WS1-T1:** Add `BKIT_SRC_SUBPATH` shared constant to `bkit-paths.ts` (value still `.agents/scripts` form) and derive `getPkgRoot()`'s suffix check from it.
  - **Done when:** `bkit-paths.ts` exports/declares `BKIT_SRC_SUBPATH`; `getPkgRoot()` uses it; `pnpm test` + `pnpm build` green; no behaviour change.
- [ ] **WS1-T2:** Add `getTemplatesRoot()` (`path.join(getPkgRoot(), ".agents", "templates")`) and `isDogfood()` (`getPkgRoot() === process.cwd()`) to `bkit-paths.ts`.
  - **Done when:** both functions exported; a unit test asserts `getTemplatesRoot()` ends with `.agents/templates` and `isDogfood()` returns true when cwd === pkgRoot.
- [ ] **WS1-T3:** Expand the `bkit-paths.ts` header comment to enumerate the THREE `getPkgRoot()` run-contexts (dist / tsx-from-source / packed tarball) and which arm each hits.
  - **Done when:** header comment lists all three contexts; no two-context-only wording remains.
- [ ] **WS1-T4:** Refactor `runPayload()` (`bkit-install.ts:627-630`) to obtain `PKG_ROOT` from `getPkgRoot()`, deleting the inline suffix walk; workflows/prompts arm `src === dst` skip unchanged.
  - **Done when:** no second copy of `scriptDir.endsWith(...scripts)` exists in `bkit-install.ts`; `runPayload` calls `getPkgRoot()`; payload tests green.
- [ ] **WS1-T5:** Add the fail-loud templates-root-not-found guard in `bkit-modules.ts` (mirroring `:359`) replacing silent `if (!fs.existsSync) return` for templates-derived paths.
  - **Done when:** unit test asserts a non-existent templates root triggers the `[bkit-modules] Templates root not found at <path> — package corrupt?` message + `process.exit(1)`.
- [ ] **WS1-T6:** Add the zero-write in-repo dogfood integration test (asserts `bkit install` writes nothing to `.agents/` when `isDogfood()`), running in the `tsx`-from-source context (not `dist/`-only). Author under `.agents/scripts/` now (moves with WS-3).
  - **Done when:** `bkit-dogfood-noop.integration.test.ts` exists and passes in `tsx` context; asserts zero writes under `.agents/`.

### 🔒 Gate WS-1: scaffolding green pre-move

- [ ] **Gate WS-1 - Verified:** `pnpm test` + `pnpm build` + `check:dist` green with the tree STILL at `.agents/`; no file relocation has occurred yet.

### Phase WS-2 — Pre-refactor baseline capture (#162)

- [ ] **WS2-T1:** Build a pre-refactor packed tarball (`pnpm pack`) from the WS-1 (post-scaffolding, pre-move) state and install it into a clean temp dir; run `bkit install`.
  - **Done when:** a clean-dir install from the tarball exists; capture dir under `docs/plans/202605/logs/160-centralise-install-code/baseline/`.
- [ ] **WS2-T2:** Capture the `.bkit-version` hash-set baseline (`canonicalHashes` + `tier3Hashes`) as a serialised JSON artifact.
  - **Done when:** `baseline/bkit-version-hashes.json` committed.
- [ ] **WS2-T3:** Capture the recursive `.agents/` consumer-tree listing baseline (covers untracked `copyAdditive` payload — `workflows/`, `prompts/`, `IDEs.md`, `cloud.md`, `trackers.md`).
  - **Done when:** `baseline/agents-tree.txt` committed (deterministic sorted listing).
- [ ] **WS2-T4:** Capture the pre-refactor `npm pack --dry-run` tarball file list.
  - **Done when:** `baseline/pack-filelist.txt` committed.
- [ ] **WS2-T5:** Capture a pre-move baseline on a consumer that HAS `.agents/templates/` (for the D1 orphan-removal upgrade assertion in WS-4).
  - **Done when:** `baseline/stale-consumer-setup.md` (or a committed fixture dir under `baseline/`) exists and reproducibly establishes a stale consumer whose `.agents/templates/` is present pre-move, so WS4-T4 has a deterministic, named input to assert against.

### 🔒 Gate WS-2: baseline captured before any move

- [ ] **Gate WS-2 - Verified:** All four baseline artifacts committed; captured from a packed tarball (NOT the source tree); no `git mv` has run.

### Phase WS-3 — Physical move, resolver re-point, tooling/config & dead-arm deletion (#163; requires WS-1, WS-2)

- [ ] **WS3-T1:** `git mv .agents/scripts .bkit/src` and `git mv .agents/templates .bkit/templates`.
  - **Done when:** `.bkit/src/bkit-install.ts` and `.bkit/templates/.agents/rules.md` exist; `.agents/scripts` and `.agents/templates` no longer exist; git tracks the moves.
- [ ] **WS3-T2:** Flip `BKIT_SRC_SUBPATH` to the `.bkit/src` form and encode `.bkit/templates` only in `getTemplatesRoot()`; leave the `dist/` arm of `getPkgRoot()` untouched.
  - **Done when:** `getTemplatesRoot()` resolves to `.bkit/templates`; `getPkgRoot()` resolves correctly under `tsx`-from-`.bkit/src` (two levels up); dogfood integration test green.
- [ ] **WS3-T3:** Replace every executable inline `path.join(PKG_ROOT, ".agents", "templates", …)` LITERAL with `getTemplatesRoot()` across `bkit-modules.ts` (188, 558, 620, 645, 670, 749, 1348, 1532, 1725, 1831, 1928), `bkit-install.ts` (upgrade `tplRoot` 736), `bkit-uninstall.ts` (425), `bkit-preflight.ts` (469, 516). (Scope: executable `path.join` call-sites ONLY; engine-source STRINGS/COMMENTS are WS3-T11.)
  - **Done when:** `rg '"\.agents",\s*"templates"' .bkit/src` returns zero hits in non-test source; all template `path.join` lookups route through `getTemplatesRoot()`.
- [ ] **WS3-T4:** Delete the dead templates arm of `runPayload` (`bkit-install.ts:660-666`); keep the workflows/prompts arm `src === dst` skip.
  - **Done when:** `runPayload` has no `tplSrc`/`tplDst`/`mirrorDirAlways` templates block; payload tests green.
- [ ] **WS3-T5:** Add D1 upgrade orphan-removal: `bkit upgrade` actively removes consumer `.agents/templates/`.
  - **Done when:** upgrade removes an existing consumer `.agents/templates/` (dry-run aware), no-op when absent; covered by WS-4 upgrade assertion.
- [ ] **WS3-T6:** Update `tsconfig.json` (`rootDir`/`include` → `.bkit/src`; drop `.agents/skills` exclude; keep `outDir: dist`, `**/*.test.ts` exclude).
  - **Done when:** `pnpm build` emits to flat `dist/`; `check:dist` green; `bin` unchanged.
- [ ] **WS3-T7:** Re-target `vitest.config.ts` `include` globs (both) to `.bkit/src/**`.
  - **Done when:** `pnpm test` discovers the relocated test files (non-zero test count); no test runs from `.agents/scripts`.
- [ ] **WS3-T8:** Update `package.json` `files[]` (add `.bkit`, keep `.agents`, re-target exclusions to `.bkit/src`) and `lint:no-tier-terms` path; record `lint:prose` needs no change.
  - **Done when:** `files[]` = `dist`, `.bkit`, `.agents`, `README.md`, `CHANGELOG.md` + `!.bkit/src/*.test.ts`, `!.bkit/src/*.integration.test.ts`, `!.bkit/src/__snapshots__`; `lint:no-tier-terms` points at `.bkit/src/bkit-lint-no-tier-terms.ts`.
- [ ] **WS3-T9:** Confirm `NPM_STRIP_REMAP` unchanged; verify `.bkit/templates/gitignore` stored dot-less.
  - **Done when:** `.bkit/templates/gitignore` exists (no dot); `NPM_STRIP_REMAP` byte-identical to pre-move.
- [ ] **WS3-T10:** Update all test path-constants (re-point embedded `.agents/templates/...` literals across the test files — including `bkit-preflight.test.ts` (536, 858) whose hits are an `it(...)` description string + a comment; leave `path.resolve(SCRIPTS_DIR, "..", "..")` and `CORE_TEMPLATE_DIRS` untouched) and regenerate the `bkit-templates.content.test.ts.snap` snapshot. Also re-point the test-file describe-label and comment strings that PRODUCE the snapshot labels (e.g. `bkit-templates.content.test.ts` describe labels; `bkit-modules.integration.test.ts` comments; `bkit-release-workflow.test.ts` describe label).
  - **Done when:** `pnpm test` green; snapshot diff shows only `.agents/templates/...` → `.bkit/templates/...` describe-label changes; no `.agents/templates` describe-label or comment strings remain in re-pointed test files except dest-layout-describing ones; `bkit-preflight.test.ts` no longer carries the stale `.agents/templates` strings.
- [ ] **WS3-T11:** Re-point stale `.agents/(templates|scripts)` references inside the relocated ENGINE SOURCE that are STRINGS or COMMENTS (not `path.join` literals; those are WS3-T3). **Prioritise the load-bearing consumer-facing error message at `bkit-modules.ts:1255`** (`"… Remove from .agents/templates/.github/workflows/ci.yml …"` → `.bkit/templates/.github/workflows/ci.yml`) — post-move this string ships in the engine and instructs consumers about a path that no longer exists in the tarball. Then the comment/docstring references: `bkit-modules.ts` (272, 286, 300), `bkit-install.ts` (568, 623, 624, 734), `bkit-preflight.ts` (266), `bkit-lint-no-tier-terms.ts` (3, 18). Leave the dest-layout-describing `.agents/` segment INSIDE `.bkit/templates/.agents/` and `CORE_TEMPLATE_DIRS` untouched.
  - **Done when:** `bkit-modules.ts:1255` error string reads `.bkit/templates/.github/workflows/ci.yml`; `rg '\.agents/(scripts|templates)' .bkit/src` (excluding test files / `__snapshots__`) returns only genuinely dest-relative / dest-layout hits (e.g. the `.agents/` segment inside `.bkit/templates/.agents/`, `CORE_TEMPLATE_DIRS`) — no remaining SOURCE-root references in strings or comments; AND `bkit-modules.ts` `COPY_EXCLUDE` `scripts`-entry decision (drop or retain) is recorded inline (cosmetic — `.agents/scripts` is gone either way).

### 🔒 Gate WS-3: move complete, build + tests green

- [ ] **Gate WS-3 - Verified:** `pnpm build`, `check:dist`, `pnpm test` all green post-move; `rg '\.agents/(scripts|templates)' .bkit/src tsconfig.json vitest.config.ts package.json` returns ONLY dest-relative / dest-layout-describing hits (the `.agents/` segment inside `.bkit/templates/.agents/`, `CORE_TEMPLATE_DIRS`) — i.e. WS3-T3 (literals) AND WS3-T11 (strings/comments) BOTH applied so no source-root reference survives; any residual non-dest hit means a WS3-T3/T11 item was missed.

### Phase WS-5 — Doctor observability (#165; requires WS-1; lands within the same PR)

- [ ] **WS5-T1:** Extend `bkit doctor` to print `[bkit-doctor] Templates root: <resolved path>` via `getTemplatesRoot()`.
  - **Done when:** `bkit doctor` stdout contains the line; `bkit-doctor.integration.test.ts` asserts it.

### Phase WS-6 — Authoring-rule, docs & shipped-config drift (#166; requires WS-3; merge-gated, same PR)

- [ ] **WS6-T1:** Update `.agents/rules.md` (sync rule line 102, central principle, preflight ref line 106).
  - **Done when:** line 102 reads `.agents/rules.md ↔ .bkit/templates/.agents/rules.md`; central principle present; line 106 reads `.bkit/src/bkit-preflight.ts`.
- [ ] **WS6-T2:** Update `docs/setup.md`, `docs/architecture.md`, `docs/deployments.md` (incl. Renovate `ignorePaths` note AND shipped `renovate.json5` template — both the `ignorePaths` glob at line 81 AND the comment block at lines 66-70 that falsely describes `.agents/templates/**` as a consumer mirror "written into the consumer working tree by `bkit install`/`bkit upgrade`" — post-D1 consumers no longer receive `.agents/templates/`; leave the `.agents/skills/**` line correct), `docs/testing.md` (37 test-colocation rule, 51 CI-parity rule), `docs/technology.md` (22 source-language row, 39 `tsc` compile target), `docs/knowledge.md` (forward-looking only).
  - **Done when:** no `.agents/scripts`/`.agents/templates` references remain in those docs except historic KN-\* narrative; shipped `renovate.json5` `ignorePaths` reads `.bkit/templates/**` AND its lines 66-70 comment no longer describes `.agents/templates/**` as a consumer-written mirror.
- [ ] **WS6-T3:** Grep `\.agents/(templates|scripts)` across `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore`, `.github/workflows/ci.yml` (+ its template source) and re-point all hits. (Engine-source prose under `.bkit/src/**` is NOT in this task's scope — it is covered by WS3-T11 / Gate WS-3.)
  - **Done when:** `rg '\.agents/(templates|scripts)'` across those paths returns zero non-historic, non-dest-relative hits.

### 🔒 Gate WS-6: docs atomic with move

- [ ] **Gate WS-6 - Verified:** No setup/authoring doc points at a relocated source path; shipped-config (`renovate.json5`) updated in lockstep.

### Phase WS-7 — rules.md byte-equality CI assertion (#167; requires WS-6; bundled per D3)

- [ ] **WS7-T1:** Add a CI gate/test asserting bkit's own `.agents/rules.md` managed `bkit:start`→`bkit:end` block byte-equals `.bkit/templates/.agents/rules.md`'s block. Compare the MANAGED BLOCK ONLY (never the whole file); the `### bkit Repo Authoring` section (line 98, outside markers) must never be compared.
  - **Done when:** `bkit-rules-sync.test.ts` (or CI lint) passes; deliberately mutating the managed block of one file makes it fail; mutating the `### bkit Repo Authoring` section does NOT fail it.
- [ ] **WS7-T2:** Append a NEW `docs/decisions.md` entry for the block-scoped rules.md equality gate (the core move is already DE-19; do NOT rewrite DE-19). Cite the D3 constraint (managed block only; `### bkit Repo Authoring` excluded).
  - **Done when:** a new DE-\* entry exists describing the gate, its block-scoped constraint, and the discarded whole-file-comparison alternative; DE-19 unmodified.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below.

- [ ] **Gate 2 - Verified:** Every WS-1/WS-3/WS-5/WS-6/WS-7 implementation task independently verified and checked off.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every matrix row has a checked-off task (dogfood no-op, fail-loud guard, getPkgRoot contexts, install/upgrade two-axis, dry-run-parity, pack-filelist, doctor line, snapshot, WS-7 block equality).
- [ ] **Update existing tests:** All 12 path-constant test files (the live `.agents/templates` grep set, incl. `bkit-preflight.test.ts`) re-pointed and green.
- [ ] **Engine-source prose re-pointed (WS3-T11):** consumer-facing error message at `bkit-modules.ts:1255` re-points to `.bkit/templates/.github/workflows/ci.yml`; engine-source comment/docstring references re-pointed; Gate WS-3 source-grep returns dest-only.
- [ ] **Write new tests:** dogfood-noop integration test; getPkgRoot 3-context unit test; WS-7 rules-sync test.
- [ ] **Verify observability:** `bkit doctor` templates-root line + fail-loud guard message both follow `[Context] Message`.
- [ ] **Update documentation:** WS-6 doc updates complete; `.agents/docs.md` still accurate (no new doc files added).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every `Documentation Updates` row completed.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`), `pnpm lint:no-tier-terms`, `pnpm lint:prose`, `pnpm lint:slop` green.
- [ ] **Build freshness:** `pnpm build` + `pnpm check:dist` green (dist/ flat at root, bin unchanged).
- [ ] **Test discovery:** `pnpm test` reports a NON-ZERO test count from `.bkit/src/**` (guards against the green-but-empty vitest-glob failure).
- [ ] **Run all tests:** `pnpm test` green including the new dogfood-noop, getPkgRoot-context, dry-run-parity, doctor, and WS-7 tests.

> [!IMPORTANT]
> **No Architectural Downgrades:** resolve build/test failures via the design's mechanisms (single seam, fail-loud guard), never silent skips or path hacks. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** All Automated Tests checked with explicit proof (test counts, CLI output).

### Manual Verification — WS-4 Two-Axis Verification Gate (#164; requires WS-2, WS-3)

> [!WARNING]
> **Dashboard Ban:** use local CLIs (`pnpm pack`, `npm pack --dry-run`, `diff`, `gh`) — do not ask the user to check dashboards. **Dogfood via a packed tarball in a clean dir, not the repo** (MEMORY): repo `node_modules` masks runtime-dep mis-classification.

- [ ] **WS4-T1 (install, axis 1):** `pnpm pack` post-move → install into clean dir → `bkit install` → diff `.bkit-version` `canonicalHashes`/`tier3Hashes` vs `baseline/bkit-version-hashes.json`.
  - **Done when:** hash-set diff is empty for install.
- [ ] **WS4-T2 (install, axis 2):** recursive `.agents/` consumer-tree listing of the clean install vs `baseline/agents-tree.txt`.
  - **Done when:** tree diff shows ONLY the intended removal of `.agents/templates/` (fresh consumer never receives it — D1); all other paths identical.
- [ ] **WS4-T3 (upgrade, axis 1):** install tarball over a consumer that had pre-move state → `bkit upgrade` → diff hashes vs baseline.
  - **Done when:** hash-set diff is empty for upgrade.
- [ ] **WS4-T4 (upgrade, axis 2 + D1 orphan assertion):** recursive `.agents/` tree of the upgraded consumer vs baseline.
  - **Done when:** tree diff confirms the orphaned `.agents/templates/` is GONE after upgrade on a consumer that HAD it pre-move; all tracked paths identical.
- [ ] **WS4-T5 (pack-filelist):** `npm pack --dry-run` file-list diff vs `baseline/pack-filelist.txt`.
  - **Done when:** the ONLY removals are `.agents/scripts/**` + `.agents/templates/**` (now under `.bkit/`); `.bkit/templates/gitignore` ships; `.agents/` runtime reads (`trackers.md`, `IDEs.md`, `cloud.md`, `prompts.md`, `workflows.md`, `skills/**`, `workflows/bkit-*.md`, `prompts/bkit-*.md`) still ship.
- [ ] **WS4-T6 (dry-run-parity gate):** `bkit install --dry-run` diff empty on a clean consumer clone before/after.
  - **Done when:** the `bkit-dry-run-parity.integration.test.ts` (re-pointed) passes; dry-run produces no spurious writes.

### 🔒 Gate WS-4: byte-identical confirmed on BOTH engines

- [ ] **Gate WS-4 - Verified:** Both install AND upgrade produce baseline-identical hashes AND recursive `.agents/` trees on a packed tarball in a clean dir; orphan `.agents/templates/` removed on upgrade; pack-filelist removals-only diff confirmed.
