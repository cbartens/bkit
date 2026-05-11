Verdict: CONCERNS

<!-- verdict:end -->

# BAR-167 Sub-plan B — v2.0.0-beta (Phase 2: Markers + manifest dispatch refactor)

**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)
**Master record (historical):** [plan-v3-checked.md](./plan-v3-checked.md)
**Hard prerequisites:**

- Sub-plan A ([plan-v4-1.md](./plan-v4-1.md)) MUST be merged. Specifically:
  - **Task 1** of sub-plan A (`deepContains` defined) — required by Task 21 of this sub-plan (`tier2-text-drift` advisory dispatch).
  - **Task 4b** of sub-plan A (`stripTier2JsonScope` defined) — required by Task 20 of this sub-plan (`format: "json"` uninstall branch).
  - **Task 6** of sub-plan A (preflight allow-list extended) — required by Task 21 (drift detection chain via `bkit-preflight.ts`).
  - Task-0d / Task-0e fixtures from sub-plan A — required by Tasks 23a / 23b of this sub-plan.
    **Hard downstream consumers:** sub-plan C ([plan-v4-3.md](./plan-v4-3.md)) hard-deps on Task 19 of this sub-plan (manifest `format` field on `ManifestEntry`).
    **Ship target:** `bkit v2.0.0-beta` (or second incremental landing of three-step `2.0.0` if the index chooses single-tag mode).

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `plan-v4-2.md` natively via `read_file` before executing any step.
> 2. NEVER trust system-generated session summaries.
> 3. Source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this document.

---

## Context & Goals (sub-plan-scoped)

Sub-plan A dropped the `__bkit__` envelope and built JSON containment primitives. **Sub-plan B (Phase 2) scope:**

1. Add `<!-- bkit:start --> ... <!-- bkit:end -->` (or `# bkit:start ... # bkit:end` for YAML) markers to 12 Group A full-ownership template files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`).
2. Add partial-ownership marker blocks to 3 Group B template files (`.github/workflows/ci.yml`, `.vale.ini`, `.husky/pre-push` (verify only) and verify required JSON containment for `slop-scan.config.json`).
3. Simplify `bkit-manifest.ts` schema: `{ path, tier: 1|2|3, ... }` → `{ path, format: "json"|"markered-text"|"byte-equal-text", ... }`.
4. Refactor install/check/uninstall to single dispatch on `entry.format`.
5. Add Phase 2 advisory `tier2-text-drift`. Add Phase 2 marker tests + Tier-3 drift regression test.

This is the regression class that broke `app-gether-life` silently on v1.1.1 (`pnpm bkit check` step lost from `ci.yml`) — Phase 2 makes it caught.

**Sub-plan B success criteria (subset of master):**

1. `pnpm bkit check` on a clean v2.0.0(-beta) install reports zero drift advisories on **all** surfaces (Group A full-ownership markers, Group B partial-ownership markers, Group C JSON deep-containment).
2. Phase 2 markers added to all listed files; `bkit check` against each consumer surface enforces block byte-equal.
3. `bkit-manifest.ts` schema simplified to `{ path, format, module }` (`format` ∈ `{"json", "markered-text", "byte-equal-text"}`); `tier: 1|2|3` integer is removed entirely. Callers (`bkit-uninstall.ts`, `bkit-install.ts`, `bkit-modules.ts`) updated.
4. Tier-3 drift gate fires: a consumer who removes `pnpm bkit check` step from `ci.yml` post-Phase-2 will see `bkit check` flag the missing block.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.** This is the testable contract for Phase 2.

### Narrative _(plan-defined — no parent design)_

Markered text files (`AGENTS.md`, `CLAUDE.md`, `.vale.ini` partial, `.github/workflows/ci.yml` partial) are validated by block byte-equal — consumer content outside the markers stays untouched, and a consumer who has accidentally removed bkit's marker block (e.g. the `pnpm bkit check` step from `ci.yml`) is now flagged at `bkit check` time instead of silently skipped. The `bkit-manifest.ts` schema flips from `tier: 1|2|3` to `format: "json"|"markered-text"|"byte-equal-text"` and all dispatchers refactor to switch on `format`.

### Concrete Example

**Setup:** Sub-plan A merged. Consumer on bkit v2.0.0-alpha; `.github/workflows/ci.yml` is a heavily customised v3+ workflow.

**Steps:**

1. Consumer bumps `@cbartens/bkit` to `^2.0.0-beta`; runs `pnpm install && pnpm bkit upgrade`. bkit:
   - Wraps existing bkit content in `AGENTS.md`, `CLAUDE.md`, etc. with `<!-- bkit:start --> ... <!-- bkit:end -->` markers (preserving consumer-added sections above/below).
   - Inserts `Install Dependencies` (auth-bearing) + `Run Bkit Check` marker block into `.github/workflows/ci.yml`, restoring the missing `bkit check` step that v1.1.1 silently dropped.
   - Inserts marker blocks for required portions of `.vale.ini` and required keys for `slop-scan.config.json`.
2. Consumer runs `pnpm bkit check` → exits 0; zero drift advisories on Group A (full-marker), Group B (partial-marker), Group C (JSON containment).
3. Six months later, a teammate edits `.github/workflows/ci.yml` and inadvertently deletes the `pnpm bkit check` line inside the marker block. Next CI run, `pnpm bkit check` flags `tier2-text-drift` for `.github/workflows/ci.yml` — the regression that previously stayed silent is now caught.

### Edge Cases (Phase 2 only)

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer file (e.g. `AGENTS.md`) has consumer content above + below the template content; no markers exist yet on first upgrade | `bkit upgrade` wraps the existing template content in markers in-place; consumer content above and below is preserved byte-identical. |
| Consumer file has the marker block but content inside the markers is byte-different from template | `bkit check` flags `tier2-text-drift`. `bkit upgrade` restores the marker block to template content (block-level overwrite); content outside the markers is preserved. |
| Consumer file has markers but the entire bkit content was deleted from inside the markers (e.g. `pnpm bkit check` step removed from `ci.yml`) | `bkit check` flags `tier2-text-drift` (block byte-equal fails). `bkit upgrade` restores the marker block. |
| Consumer file removed the markers entirely (e.g. consumer deleted the `<!-- bkit:start -->` line by accident) | `bkit check` flags `markers-missing` advisory; `bkit upgrade` re-inserts markers + content above the closest reasonable insertion point. Edge case: if no insertion anchor exists, fallback is "append at EOF" with a one-time advisory log. |
| `.husky/pre-push` already has markers today; existing block expands or stays as-is | Existing marker block remains; bkit verifies byte-equal of content between markers. Consumer's `bkit-repo only` lines below markers unchanged. |

### Derived Test Matrix (Phase 2 rows only)

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **Phase 2 — Marker enforcement & dispatch** | | |
| Marker presence enforcement: every newly-markered template file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`) has its bkit content within `bkit:start..bkit:end` markers | Unit (Vitest) | `.agents/scripts/bkit-templates.test.ts` (NEW) |
| Marker presence enforcement (partial-ownership): `.github/workflows/ci.yml` markers wrap exactly the `Install Dependencies` step + `Run Bkit Check` step; `.vale.ini` markers wrap `StylesPath` + `Packages` + `MinAlertLevel` + House style enable | Unit (Vitest) | `.agents/scripts/bkit-templates.test.ts` (NEW) |
| `slop-scan.config.json` deep-containment: each of the ten required rule keys is present in the consumer file with `enabled: true` — JSON deep-containment, NOT markers | Unit (Vitest) | `.agents/scripts/bkit-templates.test.ts` (NEW) |
| Tier-3 drift regression: consumer `ci.yml` fixture with the `pnpm bkit check` step manually removed from inside marker block → `bkit check` flags `tier2-text-drift` for that file | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| Heavy-customised `ci.yml` survival: consumer's surrounding job structure (other steps, custom env, custom matrix) is preserved byte-identical across `bkit upgrade`; only the marker block is enforced | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| `bkit check` single-dispatch by `format`: `format: "json"` runs `deepContains`; `format: "markered-text"` runs marker block extraction + byte-equal; `format: "byte-equal-text"` runs whole-file byte-equal | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` |
| `.husky/pre-push` marker block survives consumer customisation (existing markers retained; consumer's `bkit-repo only` lines below markers preserved) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Phase 2 narrative, success criteria, edge cases, and test matrix correctly describe what "done" looks like for sub-plan B.
- [ ] **Breaking Changes confirmed:** Phase 2 breaking changes (12 marker additions Group A, 3 partial-marker additions Group B, manifest schema flip, dispatch refactor) reviewed.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until both checkboxes above are `[x]`.

---

## Breaking Changes (Phase 2 only)

7. **Phase 2 marker addition** — bkit's templates for `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md` now include `<!-- bkit:start -->` / `<!-- bkit:end -->` (md/mdc) or `# bkit:start` / `# bkit:end` (YAML). `.github/workflows/ci.yml`, `.vale.ini`, `slop-scan.config.json` get small marker blocks around required portions only.
8. **`bkit-manifest.ts` schema simplified** — entries flip from `{ path, tier, module, packageJsonKeys? }` to `{ path, format, module, packageJsonKeys? }`. The `tier: 1|2|3` integer is removed entirely. All callers (`bkit-uninstall.ts`, `bkit-install.ts`, `bkit-modules.ts`) updated to dispatch on `format`.

### Naming decisions

- New manifest field shape: **`{ path, format, module, packageJsonKeys? }`** with `format ∈ {"json", "markered-text", "byte-equal-text"}`. Tier integer deleted.
- Advisory `tier2-text-drift` for Phase 2 marker drift. (Renaming to `markered-block-drift` deferred to sub-plan C if desired; backward-compat key string retained.)

### Schema migrations

- None for sub-plan B itself; sub-plan C narrows `tier3Hashes` writer.

---

## Out of Scope (sub-plan B)

- Phase 1 (envelope drop, JSON primitives) — completed in sub-plan A.
- Phase 3 (terminology sweep, schema cleanup, lint script) — see [plan-v4-3.md](./plan-v4-3.md).

## Merge Method

**Merge method: always squash.**

## Supersession Inventory (Phase 2 only)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.agents/scripts/bkit-manifest.ts` `tier: 1|2|3` integer field | `format: "json"|"markered-text"|"byte-equal-text"` field | DELETE | Phase 2 collapses Tier numbering into format-aware dispatch. |
| `.agents/scripts/bkit-uninstall.ts` `case 1`/`case 2`/`case 3` switch | Single dispatch on `entry.format` | DELETE | Phase 2 unifies uninstall semantics with install/check semantics. |
| `.agents/templates/.husky/pre-push` marker block (already exists today) | Same markers; verified scope | RETAIN-WITH-REASON | File already conforms; Phase 2 only verifies block scope. |

## Security & Privacy

N/A.

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Sub-plan A merged:** confirm Tasks 1, 4b, 6 of sub-plan A are merged into the working branch.
- [ ] **Package Management:** no new runtime deps; `pnpm-lock.yaml` syncs cleanly.
- [ ] **User Context:** read/write to `.agents/scripts/`, `.agents/templates/{,.cursor,.vale,.agents,.github,.husky}/...`, `docs/plans/template.md`.
- [ ] **Pending Blockers:** query Linear for `blocker` issues touching markers / manifest dispatch.
- [ ] **Project Context:** confirm sub-plan A's docs (DE-16, KN-15, architecture rewrite) are present.
- [ ] **Testing & Quality:** new test file `.agents/scripts/bkit-templates.test.ts`.

### Conditional (verify only when applicable)

- [ ] **Observability:** Phase 2 advisory `tier2-text-drift` follows `[Context] Message` regex.

### 🔒 Gate 1: Prerequisites Check (sub-plan B)

- [ ] **Acceptance Scenario confirmed:** human checkbox above `[x]`.
- [ ] **Breaking Changes confirmed:** human checkbox above `[x]`.
- [ ] **Sub-plan A predecessor:** Tasks 1, 4b, 6 merged.
- [ ] **Gate 1 — Verified.**

## Data Schema Integration

None.

## Architecture & Component Changes

### Phase 2 — Templates: Group A — full-ownership markers

**Comment syntax:** `<!-- bkit:start -->` / `<!-- bkit:end -->` for `.md` and `.mdc`; `# bkit:start` / `# bkit:end` for YAML.

**Anchor convention:** `bkit:start` immediately AFTER any pre-existing top-of-file frontmatter / shebang / license header (else line 1 col 0); `bkit:end` immediately BEFORE EOF on a new line. Markers at column 0. **Verification per file:** `grep -c '^<!-- bkit:start -->' <file>` returns `1` for `.md`/`.mdc`; `grep -c '^# bkit:start' <file>` returns `1` for `.yml`. Same for matching `bkit:end`. Byte content BETWEEN markers must equal the pre-Task-17 file content byte-for-byte.

**Group A files (12):**

- `.agents/templates/AGENTS.md` — wrap entire bkit-owned content; line 1 → EOF.
- `.agents/templates/CLAUDE.md` — wrap entire bkit-owned content.
- `.agents/templates/.cursor/rules/00-shared-rules.mdc` — wrap entire bkit-owned content.
- `.agents/templates/.vale/styles/House/Filler.yml` — wrap entire content (YAML markers).
- `.agents/templates/.vale/styles/House/Hedging.yml` — wrap entire content.
- `.agents/templates/.vale/styles/House/LLMSlop.yml` — wrap entire content.
- `.agents/templates/.vale/styles/House/Verbose.yml` — wrap entire content.
- `.agents/templates/.agents/rules.md` — already has markers; **scope expansion check** — confirm existing markers wrap entire bkit-owned content (line 1 → EOF). If narrower, relocate closing marker to EOF. Verify with `grep -n '^<!-- bkit:start -->\|^<!-- bkit:end -->' .agents/templates/.agents/rules.md`.
- `.agents/templates/.agents/docs.md` — wrap entire bkit-owned content.
- `.agents/templates/.agents/friction.md` — wrap entire bkit-owned content.
- `.agents/templates/.agents/skills.md` — wrap entire bkit-owned content.
- `.agents/templates/docs/plans/template.md` — wrap entire bkit-owned content.

### Phase 2 — Templates: Group B — partial-ownership markers

#### [MODIFY] `.agents/templates/.github/workflows/ci.yml`

- Wrap **exactly** the existing `Install Dependencies` step (carries `GH_BKIT_TOKEN` env block — bkit's auth surface) AND the existing `Run Bkit Check` step in `# bkit:start` / `# bkit:end` (YAML comment syntax). Consumer's surrounding job structure is untouched.
- **Note:** template currently has no `setup-auth` step — `Install Dependencies` IS the auth surface (sets `GH_BKIT_TOKEN` in `env`). Marker covers `Install Dependencies` + `Run Bkit Check`. Intervening consumer steps (typecheck/test/format/vale/slop) are NOT inside the marker block.
- **Marker location precise spec:**
  - `# bkit:start` immediately above `- name: Install Dependencies` line (currently line 23). Indent: 6 spaces (same as `- name:`).
  - **Open-block intent:** marker block opens at `Install Dependencies` and closes at `Run Bkit Check` — meaning the consumer steps `Run Typecheck`, `Run Vitest Tests`, `Run Prettier Format Check`, `Run Vale Prose Lint`, `Run Slop Scan` (lines 33–46) end up INSIDE the marker block. **This is acceptable** — those steps are part of bkit's "run all checks" CI contract; if a consumer customises them they trigger `tier2-text-drift`. v2.0.0 ships with one block covering `Install Dependencies` through `Run Bkit Check` inclusive.
  - `# bkit:end` immediately below `- name: Run Bkit Check` step's `run:` line (currently line 49).
- **Exact YAML to insert:**

  ```yaml
  # bkit:start
  - name: Install Dependencies
    # ... (existing body)
    run: pnpm install --frozen-lockfile
    env:
      GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}

  - name: Run Typecheck
    # ... (existing body)

  # ... (existing Vitest, Prettier, Vale, Slop steps)

  - name: Run Bkit Check
    run: pnpm bkit check
  # bkit:end
  ```

#### [MODIFY] `.agents/templates/.vale.ini`

- Wrap **exactly** these keys in `# bkit:start` / `# bkit:end`: `StylesPath`, `Packages`, `MinAlertLevel`, the House-style enable line. Markers at column 0 (no indentation — Vale parser).

#### [MODIFY] `.agents/templates/slop-scan.config.json`

- **JSON file — uses deep-containment, not markers.**
- **Required core rules — INLINED (10 keys):**
  1. `comments.placeholder-comments` (`enabled: true`, `weight: 1.5`)
  2. `structure.over-fragmentation` (`enabled: true`)
  3. `structure.directory-fanout-hotspot` (`enabled: true`)
  4. `structure.duplicate-function-signatures` (`enabled: true`)
  5. `structure.barrel-density` (`enabled: true`)
  6. `structure.pass-through-wrappers` (`enabled: true`)
  7. `defensive.empty-catch` (`enabled: true`)
  8. `defensive.error-swallowing` (`enabled: true`)
  9. `defensive.error-obscuring` (`enabled: true`)
  10. `defensive.async-noise` (`enabled: true`)
- **Containment invariant:** every key in template `rules` is bkit-mandated. `bkit check` runs `deepContains(template.rules, consumer.rules)` and reports missing keys under `tier2-json-drift`. Consumers may add additional rule entries; may NOT remove or set `enabled: false` on the listed ten.

#### [MODIFY] `.agents/templates/.husky/pre-push`

- Verified — already has `# bkit:start` / `# bkit:end` block (lines 3–7). Verify scope is correct for v2.0.0; expand if needed. Plan-Phase Decision 4: pre-push duplicate-work in `app-gether-life` is resolved naturally on next `bkit upgrade` after Phase 2 markers ship.

### Code

#### [MODIFY] `.agents/scripts/bkit-manifest.ts`

- Existing shape: `{ path, tier: 1|2|3, module, packageJsonKeys? }` (lines 12–34).
- **Change:** simplify to `{ path, format, module, packageJsonKeys? }` where `format ∈ {"json", "markered-text", "byte-equal-text"}`.
- **Tier-to-format mapping:**
  - Old `tier: 1` JSON files (`.claude/settings.json`, `.cursor/hooks.json`) → `format: "json"`.
  - Old `tier: 1` text files → `format: "markered-text"`:
    - `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh` — markers already present (lines 17/124 and 15/115). Verification only (Task 17a).
    - `.cursor/rules/00-shared-rules.mdc` — markers added in Task 17 (Group A).
  - Old `tier: 2` files → `format: "markered-text"`:
    - `.agents/templates/gitignore` — markers present (35/48). Verification only.
    - `.agents/templates/.prettierignore` — markers present (1/20). Verification only.
    - `.agents/templates/.husky/pre-commit` — markers present (2/6). Verification only.
    - `.agents/templates/.husky/pre-push` — markers present (3–7); covered by Task 18a.
    - `AGENTS.md`, `CLAUDE.md` — markers added in Task 17.
  - Old `tier: 3` text files (`.github/workflows/ci.yml`, `.vale.ini`) → `format: "markered-text"` (Group B partial markers — Task 18).
  - Old `tier: 3` JSON files (`slop-scan.config.json`, `.cursor/settings.json`, `.cursor/environment.json`) → `format: "json"`.
  - `.cursor/Dockerfile` → `format: "byte-equal-text"`.
  - `package.json` (in CI/LINT/GIT_HOOKS manifests) → retain via `packageJsonKeys` mechanism; `format: "byte-equal-text"` is unused for it.
- Existing tier integer field: delete entirely from `ManifestEntry`. Test imports updated.

#### [MODIFY] `.agents/scripts/bkit-install.ts` and `.agents/scripts/bkit-modules.ts`

- **Single dispatch on `entry.format`:**
  - `format: "json"` → `writeTier2JsonContained` (install) / `deepContains` (check) / `stripTier2JsonScope` (uninstall).
  - `format: "markered-text"` → marker block extraction + byte-equal (check) / marker block insert-or-replace (install) / marker block strip (uninstall).
  - `format: "byte-equal-text"` → whole-file byte-equal (check) / overwrite (install) / hash-or-byte-equal delete (uninstall — preserve if consumer modified).
- Replace existing `entry.tier` switches with `entry.format` switches throughout `bkit-install.ts`, `bkit-modules.ts`, `bkit-uninstall.ts`.

#### [MODIFY] `.agents/scripts/bkit-uninstall.ts`

- **Single dispatch on `entry.format`:**
  - `format: "json"` → `stripTier2JsonScope`.
  - `format: "markered-text"` → marker block strip via existing `detectMarkerStyle` + block extraction.
  - `format: "byte-equal-text"` → existing hash-or-byte-equal delete (preserve if consumer modified).
- Old `case 1`/`case 2`/`case 3` switch deleted.

#### [MODIFY] `.agents/scripts/bkit-preflight.ts`

- Drift detection extends to all `format: "markered-text"` files: read consumer file, extract marker block, byte-equal vs template marker block. Surface `tier2-text-drift` advisory.

### Tests

#### [NEW] `.agents/scripts/bkit-templates.test.ts`

- **Tests:**
  - Marker presence: every Group A template file contains exactly one `bkit:start` and one matching `bkit:end`.
  - Marker presence: every Group B template file (`.github/workflows/ci.yml`, `.vale.ini`) contains the marker block wrapping expected key sentences.
  - `slop-scan.config.json` deep-tree contains the enumerated 10 bkit core rules.

#### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts`

- ADD: Tier-3 drift regression — fixture with consumer `ci.yml` missing `pnpm bkit check` step inside marker block → `bkit check` flags `tier2-text-drift`.
- ADD: heavy-customised `ci.yml` survival — surrounding job structure preserved byte-identical across `bkit upgrade`; only marker block enforced.
- ADD: `.husky/pre-push` marker block survives consumer customisation (consumer's `bkit-repo only` lines below markers preserved).

#### [MODIFY] `.agents/scripts/bkit-modules.test.ts`

- ADD: `bkit check` single-dispatch on `entry.format` runs the correct mechanism per format.

## Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Phase 2 docs are minimal — sub-plan A's DE-16/KN-15/architecture rewrite already captures the format-aware model. Sub-plan B simply implements it. No additional doc rows; sub-plan C handles the residual `Tier [123]` sweep.

- `package.json` — version bump to `2.0.0-beta` if shipping incrementally; otherwise no change (single-tag mode handled by sub-plan C).

## Rollback Strategy

| Axis        | Action                      | Notes                                                                                                                                                                |
| ----------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code        | `git revert {MERGE_COMMIT}` | Restores Tier integers + Phase 2 marker absence. Markered consumer files keep marker blocks intact (markers are valid YAML/markdown comments — no syntactic impact). |
| Risk window | One `bkit upgrade` cycle    | Brief schema-pollution + redundant-marker window.                                                                                                                    |

## Agent Execution Runbook (sub-plan B — Phase 2)

> Chronological. Sub-gate 2A is the boundary marker between sub-plan A's Task 4b and this sub-plan's Task 19.

### Phase 2 — Markers + manifest dispatch (sequential)

- [ ] **Task 17 — Add Group A full-ownership markers.** Edit each of: `.agents/templates/AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`. Wrap entire bkit-owned content with the format-appropriate marker pair. Verify: each file has exactly one `bkit:start` and one matching `bkit:end`.

- [ ] **Task 17a — Verify markers already present on reclassified `markered-text` files.** No marker-addition; assertion-only. Run `grep -l 'bkit:start' .agents/templates/.claude/hooks/preflight.sh .agents/templates/.cursor/hooks/preflight.sh .agents/templates/gitignore .agents/templates/.prettierignore .agents/templates/.husky/pre-commit` and confirm all five paths print. `grep -c 'bkit:start' <path>` for each = `1`. If any file is missing markers, Task 19 reclassification MUST exclude it OR Task 17 must be extended; do not silently add markers as part of this task.

- [ ] **Task 18 — Add Group B partial-ownership markers.** Edit `.agents/templates/.github/workflows/ci.yml`: insert `# bkit:start` immediately above the existing `- name: Install Dependencies` step (line 23) and `# bkit:end` immediately below the existing `- name: Run Bkit Check` step's `run:` line (line 49). Marker block covers `Install Dependencies` → `Run Bkit Check` inclusive. See exact YAML in Architecture & Component Changes → Group B → ci.yml. Edit `.agents/templates/.vale.ini`: wrap `StylesPath`/`Packages`/`MinAlertLevel`/House style enable. Markers at column 0. Verify (ci.yml): `grep -c '^        # bkit:start' .agents/templates/.github/workflows/ci.yml` returns `1`. Verify (.vale.ini four required keys inside marker block): `awk '/^# bkit:start/,/^# bkit:end/' .agents/templates/.vale.ini | grep -cE '^(StylesPath|Packages|MinAlertLevel|\[.*\][[:space:]]*$|House[[:space:]]*=)'` ≥ 4. `grep -c '^# bkit:start' .agents/templates/.vale.ini` returns `1` and `grep -c '^# bkit:end'` returns `1`.

- [ ] **Task 18a — Verify `.husky/pre-push` markers.** Inspect existing markers (lines 3–7). If new bkit content needs wrapping, expand block; otherwise no change. Verify: `pnpm bkit check` against worktree itself reports zero drift on `.husky/pre-push`.

- [ ] **Task 18b — Verify `slop-scan.config.json` required core rules.** JSON file uses deep-containment (no markers). Plan inlines the ten required rule keys (see Architecture & Component Changes → Group B → slop-scan.config.json). Reconcile: open `.agents/templates/slop-scan.config.json` and confirm the ten keys match byte-for-byte. If template differs, update Task 22's fixture assertions AND record delta in DE-16. Verify: `deepContains(template, consumer)` ok=true on a fresh install.

### 🔒 Sub-gate 2A: Manifest reclassification readiness (between Task 18b and Task 19)

> **PURPOSE:** Tasks 4b (in sub-plan A), 20, and 25 (in sub-plan C) `format: "json"`/`format: "markered-text"`/`format: "byte-equal-text"` dispatch is **dormant** until the manifest carries the new `format` field. Running sub-plan A's Task 4b integration tests (`bkit uninstall --claude/--cursor strips template scope`) BEFORE Task 19 reclassifies the JSON files passes silently through legacy `case 1` (full-delete) — false green.

- [ ] **Sub-gate 2A — Verified:** Task 18b complete (template ten-key audit reconciled). Block any execution of integration tests `bkit uninstall --claude strips template scope` and `bkit uninstall --cursor strips template scope` (and any test marked `// PREREQ: Task 19 reclassification` — including the `slop-scan.config.json` drift row from sub-plan A Task 10) until Task 19 has been merged. This sub-gate is the boundary marker between sub-plan A's Task 4b and sub-plan B's Task 19.

- [ ] **Task 19 — Simplify `bkit-manifest.ts` schema.** Edit `.agents/scripts/bkit-manifest.ts`: change `ManifestEntry` from `{ path, tier: 1|2|3, module, packageJsonKeys? }` to `{ path, format: "json"|"markered-text"|"byte-equal-text", module, packageJsonKeys? }`. Apply tier-to-format mapping per Architecture & Component Changes. Verify: `pnpm tsc --noEmit` clean. **Post-Task-19 unblock:** integration tests gated by Sub-gate 2A (`bkit uninstall --claude/--cursor strips template scope`) now route through `format: "json"` → `stripTier2JsonScope`; re-run and confirm green. Also re-run the `.cursor/Dockerfile` safe-delete row from sub-plan A Task 10 to confirm `format: "byte-equal-text"` dispatch is correct.

- [ ] **Task 20 — Single dispatch on `entry.format` in install/check/uninstall.** Edit `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-uninstall.ts`: replace `entry.tier` switches with `entry.format` switches. Verify: `pnpm vitest run bkit-modules.test.ts -t "single-dispatch"` green; `pnpm bkit check` against worktree reports zero drift.

- [ ] **Task 21 — Phase 2 advisory `tier2-text-drift`.** Edit `.agents/scripts/bkit-preflight.ts`: extend drift detection to `format: "markered-text"` files (read consumer, extract marker block, byte-equal vs template marker block). Surface advisory. Verify: `pnpm vitest run bkit-preflight.test.ts` green.

- [ ] **Task 22 — `bkit-templates.test.ts` (NEW).** Create `.agents/scripts/bkit-templates.test.ts` with marker-presence enforcement tests for Group A + Group B templates and `slop-scan.config.json` required-rules enumeration. Verify: `pnpm vitest run bkit-templates.test.ts` green.

- [ ] **Task 23 — Tier-3 drift regression test.** Add to `.agents/scripts/bkit-modules.integration.test.ts`: fixture with consumer `ci.yml` missing `pnpm bkit check` step inside marker block → `bkit check` flags `tier2-text-drift`. Verify green.

- [ ] **Task 23a — Heavy-customised `ci.yml` survival test.** **PREREQ:** Sub-plan A Task 0e fixture (`tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`) committed. Add to `.agents/scripts/bkit-modules.upgrade.integration.test.ts`: TWO sub-rows — (i) **outside-marker survival:** consumer's surrounding job structure (additional steps, custom env, custom matrix) OUTSIDE the marker block is preserved byte-identical across `bkit upgrade`; (ii) **inside-marker drift detection:** consumer-added env vars on `Install Dependencies` step INSIDE marker block (e.g. `NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}` per Task 0e fixture) cause `bkit check` to flag `tier2-text-drift`. Both sub-rows MUST be green. Verify: `pnpm vitest run bkit-modules.upgrade.integration.test.ts -t "heavy-customised ci.yml"` shows both rows passing.

- [ ] **Task 23b — `.husky/pre-push` marker survival test.** **PREREQ:** Sub-plan A Task 0d fixture (`tests/fixtures/heavy-customised-prepush/.husky/pre-push`) committed. Add to `.agents/scripts/bkit-modules.integration.test.ts`: load Task-0d fixture; run `bkit upgrade`; assert marker block content byte-identical to template AND consumer's `# bkit-repo only` lines below closing marker preserved byte-identical. Verify green.

- [ ] **Task 24 — Phase 2 verification: `pnpm bkit check` zero-drift on all surfaces.** Run `pnpm bkit install` against worktree; run `pnpm bkit check`; assert `Done. 0 write(s).` and zero advisories.

### 🔒 Gate 2: Code Implementation Check (Phase 2 + cumulative)

- [ ] **Gate 2 (sub-plan B) — Verified:** Tasks 17–24 (Phase 2) complete; every checkbox above checked off. `pnpm turbo lint typecheck format:check test` clean. Sub-plan A's Phase 1 net LOC delta still ≥ 200 across the path-scoped diff (re-verify path-scoped command from sub-plan A Task 7). Phase 2 marker additions in `.github/workflows/ci.yml`, `.vale.ini`, AGENTS.md, etc. are explicitly excluded from the Phase 1 net-deletion check.

### Mandatory Tasks (Testing & Documentation — sub-plan B subset)

- [ ] **Verify test coverage against Phase 2 Test Matrix:** confirm each Phase 2 row has corresponding green test.
- [ ] **Write new tests:** Phase 2 marker presence + Tier-3 drift regression + `.husky/pre-push` survival + single-dispatch on `entry.format`.
- [ ] **Verify observability:** `tier2-text-drift` advisory follows `[Context] Message` regex.

### 🔒 Gate 3: Testing & Documentation Check (sub-plan B scope)

- [ ] **Phase 2 docs unchanged note:** confirm sub-plan A's docs (DE-16/KN-15/architecture) accurately describe Phase 2 markers; if not, append/extend in sub-plan C Task 27 sweep.
- [ ] **Gate 3 (sub-plan B) — Verified.**

## Verification Plan (sub-plan B scope)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm turbo typecheck lint format:check` clean.
- [ ] **Unit (`bkit-templates.test.ts`):** marker presence enforced for Group A + Group B; `slop-scan.config.json` required rules enumerated.
- [ ] **Integration (`bkit-modules.integration.test.ts`):** Tier-3 drift regression + `.husky/pre-push` survival green; the `bkit uninstall --claude/--cursor` and `slop-scan.config.json` drift rows from sub-plan A Task 10 — now unblocked by Task 19 — re-run green.
- [ ] **Integration (`bkit-modules.upgrade.integration.test.ts`):** heavy-customised `ci.yml` survival (both sub-rows) green.
- [ ] **CLI smoke:** in temp dir, run `pnpm bkit install --core --claude --cursor --ci --lint --git-hooks` followed by `pnpm bkit check`. Expect `Done. 0 write(s).` and zero advisories.
- [ ] **Run all tests:** `pnpm turbo lint typecheck format:check test`.

### 🔒 Gate 4: Automated Verification Confirmed (sub-plan B scope)

- [ ] **Gate 4 (sub-plan B) — Verified:** all Automated Tests boxes checked.

### Manual Verification

- [ ] **Step 1 (extends sub-plan A Step 1):** clone `app-gether-life` to scratch path; bump `@cbartens/bkit` to v2.0.0-beta candidate; `pnpm install && pnpm bkit upgrade`. Confirm:
  - `.github/workflows/ci.yml` now contains the bkit marker block wrapping `Install Dependencies` (auth-bearing) through `Run Bkit Check` step inclusive (the regression that broke v1.1.1 silently is now enforced).
  - Markers in `AGENTS.md`, `CLAUDE.md`, `.vale.ini`, etc. wrap bkit-owned content; consumer-only content above/below markers preserved byte-identical.
  - `pnpm bkit check` exits 0 with zero drift advisories on all surfaces (JSON + markered-text).
- [ ] **Step 2:** repeat against `visitfrasercoast-com`. Confirm same outcome.

---

## Open-Question Disposition (sub-plan B scope)

| Question                                             | Disposition                                             | Where tracked |
| ---------------------------------------------------- | ------------------------------------------------------- | ------------- |
| `ci.yml` heavy-customisation marker survival fixture | **IN-SCOPE** (Task 23a uses sub-plan A Task 0e fixture) | Runbook       |
| Pre-push duplicate-work in `app-gether-life`         | **RESOLVED** by Task 18a per Plan-Phase Decision 4      | Runbook       |

---

## Reviewer notes

> Inherited CONCERNS verdict from `plan-v3-checked.md`. Reviewers — focus on:
>
> - Phase 2 manifest-dispatch refactor correctness (no regression of Phase 1 JSON behaviour).
> - Phase 2 marker scope correctness for partial-ownership files (`.github/workflows/ci.yml`, `.vale.ini`).
> - Sub-gate 2A correctness (PREREQ tests blocked until Task 19 lands).
