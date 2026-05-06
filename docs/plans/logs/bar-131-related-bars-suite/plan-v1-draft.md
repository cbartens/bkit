# Plan — bar-131-related-bars-suite (BAR-131 + BAR-139 + BAR-142)

> Single unified plan covering three related Linear issues. Phased rollout to ship value early and limit blast radius. Phase boundaries map to bkit minor versions.

## Goal

Resolve consumer-friction debt across `bkit install`/`check`/`uninstall` by (a) shipping `bkit doctor` + polish + changelog surface (Phase 1, v0.6.x), (b) introducing a surgical `bkit uninstall` recovery primitive that also unblocks Phase 3 blocker exit-1 (Phase 2, v0.7.x), (c) refactoring `.cursor/hooks.json` and `.claude/settings.json` to Tier-2 deep-merge (Phase 3, v0.8.x), and (d) layering transactional install + `bkit upgrade` ergonomics (Phase 4, v0.9.x→v1.0). One plan, four self-contained phases; each phase is independently shippable.

## Scope summary

- **In-scope:** all BAR-142 A1/A3/A4/A5/A6/A7 + B1/B2/B3/B4/B5/B6; full BAR-139 (uninstall core + Phase 3 exit-1 + auto-revert); BAR-131 helper-action stretch (Phase 4 only).
- **Out-of-scope:** npm-registry distribution; new `bkit install` payload structure beyond what each phase requires; new preflight detectors (those are net-new issues per detector).
- **Deferred-to-pending:** factory-reset uninstall mode; `pnpm-lock.yaml` cleanup; consumer-side workflow decisions; per-key drift exclusions in `.bkitignore` if A6 ships per-file only.

## Phase index

| Phase | Title | Closes | Effort | Risk |
| --- | --- | --- | --- | --- |
| 1 | Quick wins + diagnostic (`bkit doctor`, polish batch, changelog) | BAR-142 A3/A7/B1/B2/B4/B5/B6 | M | Low |
| 2 | Recovery primitive (`bkit uninstall` + Phase 3 exit-1 + `.bkitignore`) | BAR-139 full + BAR-142 A6 | L | Med |
| 3 | Tier-2 deep-merge for hooks/settings JSON | BAR-142 A1 + B3 | L | High (schema + merge complexity) |
| 4 | Architectural ergonomics (transactional install, upgrade verb, helper action) | BAR-142 A4/A5 + BAR-131 stretch | L | Med |

## Acceptance Scenario

**Narrative:** A consumer maintainer of a heavily-customized repo upgrades `@cbartens/bkit`, runs the new commands (`doctor`, `uninstall`, `upgrade`), and either keeps their customisations intact across upgrades or recovers cleanly from a partial install — without losing custom hook configuration or hand-edited CI.

**Success Criteria:**

- `pnpm bkit doctor` exits 0 and prints the unified preflight + post-install checklist on a stale-pin scratch repo.
- `pnpm bkit uninstall` on a fresh `bkit install --full` returns `git status` to clean (excluding `node_modules`/`.npmrc`).
- `pnpm bkit uninstall` on a customized consumer leaves consumer-customized files byte-identical to pre-install state (markers-as-SoT for Tier-2; hash-guard for Tier-3).
- Phase 3 blocker fires `process.exit(1)` AND surfaces the `pnpm bkit uninstall <flags> && fix && pnpm bkit install <flags>` recovery line; advisory-only post-install runs still exit 0.
- Consumer-added entries under `hooks.Stop` / `hooks.PostToolUse` in `.claude/settings.json` survive a `bkit install` upgrade across two consecutive bkit versions.
- `pnpm bkit upgrade` from `0.4.x` → `0.5.x` against a customized `.cursor/hooks.json` does NOT silently overwrite consumer drift.

**Concrete Example:**

- Setup: scratch consumer at `bkit@0.5.0`, has customized `.claude/settings.json` (added `hooks.Stop`) and customized `.github/workflows/ci.yml` (added a deploy job).
- Steps: (1) `pnpm add -D @cbartens/bkit@0.6.0` (no `bkit install`); (2) `pnpm bkit doctor` → prints `bkit-version-pin-stale` advisory, exits 0; (3) `pnpm bkit install` → Phase 3 detects token gap → exits 1 with recovery line; (4) `pnpm bkit uninstall --ci` → strips Tier-2 blocks, preserves consumer deploy job in `ci.yml`; (5) consumer fixes `.npmrc`, re-runs `pnpm bkit install` → green.
- Outcome: customized files intact; bkit-owned regions current; CI gate green.

**Edge Cases:**

| Scenario | Expected behaviour |
| --- | --- |
| `bkit uninstall` on file with NO bkit markers | Skip file (100% consumer content); never delete |
| Tier-3 `ci.yml` modified by consumer | Skip unless `--force` |
| `.bkitignore` lists a Tier-3 file | `bkit check` exits 0 even if drift exists |
| Cursor v1 schema differs from bkit's shipped shape | Verification gate in P3.T0 must pass before A1 work |
| Phase 3 blocker on `--auto-revert` install | uninstall in-process, exit 1 |
| Concurrent `bkit install` mid-failure (P4) | Staging dir discarded, consumer files untouched |
| Empty `GH_BKIT_TOKEN=""` vs unset | Action text differentiates (B4) |
| pnpm 10 onlyBuiltDependencies missing | Already advised — no change |

**Derived Test Matrix:** see Test strategy summary section below.

---

## Phase 1 — Quick wins + diagnostic

Target version v0.6.x. Independent, low-risk, batchable. A3 leads (Fraser Coast pattern).

| ID | Task | Effort | Depends |
| --- | --- | --- | --- |
| P1.T1 | Register `doctor` verb (BAR-142 A3) | M | none |
| P1.T2 | Anchor `hasBkitMarkers` (B1) | S | none |
| P1.T3 | Cross-phase dedup position-stable (B2) | S | none |
| P1.T4 | `detectShellToken` empty vs unset (B4) | S | none |
| P1.T5 | LOG_PREFIX on dry-run blocker banner (B5) | S | none |
| P1.T6 | `.npmrc` token noise mitigation (B6) | S | none |
| P1.T7 | Changelog header in post-install (A7) | M | none |
| P1.T8 | README + help-text rollup for Phase 1 | S | T1..T7 |

### P1.T1 — `bkit doctor` CLI verb

- **Scope:** Add `doctor` as a third verb in `bkit-cli.ts`. Thin wrapper over `runPreflight()` + post-install detector replay; pure read-only; always exits 0.
- **Files touched:**
  - `.agents/scripts/bkit-cli.ts` — extend `Verb` union, parse arg, update `printUsage`.
  - `.agents/scripts/bkit-install.ts` — extend `main()` switch on verb to dispatch `doctor`.
  - `.agents/scripts/bkit-postinstall.ts` — expose pure-read replay path for post-install findings (no writes).
  - `.agents/scripts/bkit-cli.test.ts` — verb parsing.
  - `.agents/scripts/bkit-doctor.integration.test.ts` (new) — stale-pin scratch fixture asserts banner contains `bkit-version-pin-stale` and exit 0.
  - `README.md` — usage section.
- **Acceptance criteria:**
  - `pnpm exec bkit doctor` exits 0 and prints unified preflight + post-install advisories.
  - Re-evaluates post-install detectors that drift after install (`gh-bkit-token-secret-unknown`, `vale-package-not-synced`).
  - Help text renders `doctor` row.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-cli.test.ts`; `pnpm vitest run .agents/scripts/bkit-doctor.integration.test.ts`.
- **Closes:** BAR-142 §A3.
- **Effort:** M.
- **Depends on:** none.

### P1.T2 — Anchor `hasBkitMarkers`

- **Scope:** Replace naive `content.includes(...)` substring check with line-anchored regex matching the same form as `findLineAnchoredMarkers`.
- **Files touched:**
  - `.agents/scripts/bkit-preflight.ts` — `hasBkitMarkers` body.
  - `.agents/scripts/bkit-preflight.test.ts` — add fixture: bkit marker text inside fenced prose.
- **Acceptance criteria:** prose-fenced false-positive returns false; real top-of-file marker returns true.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`.
- **Closes:** BAR-142 §B1.
- **Effort:** S. **Depends on:** none.

### P1.T3 — Cross-phase dedup position-stable

- **Scope:** When Phase 3 supersedes a Phase 1 finding by id, retain Phase 1's position in the merged list.
- **Files touched:**
  - `.agents/scripts/bkit-postinstall.ts` — `runPostInstallCheck` cross-phase merge.
  - `.agents/scripts/bkit-postinstall.test.ts` — assert position stability.
- **Acceptance criteria:** test asserts merged-array index of superseded id matches Phase 1 index.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-postinstall.test.ts`.
- **Closes:** BAR-142 §B2.
- **Effort:** S. **Depends on:** none.

### P1.T4 — `detectShellToken` empty vs unset

- **Scope:** Differentiate `unset` (`undefined`) from `empty-string` (`""`). Tweak action text.
- **Files touched:**
  - `.agents/scripts/bkit-preflight.ts` — `detectShellToken`.
  - `.agents/scripts/bkit-preflight.test.ts` — both cases.
- **Acceptance criteria:** action text contains `unset` vs `empty-string` token; banner mentions both equivalently bad.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`.
- **Closes:** BAR-142 §B4.
- **Effort:** S. **Depends on:** none.

### P1.T5 — LOG_PREFIX on dry-run blocker banner

- **Scope:** Prepend `LOG_PREFIX` to blocker-exit banner in `bkit-install.ts` so `[bkit-check]` is visible in dry-run.
- **Files touched:**
  - `.agents/scripts/bkit-install.ts` — blocker banner emit path.
  - `.agents/scripts/bkit-install.test.ts` — assert prefix appears in dry-run output.
- **Acceptance criteria:** dry-run blocker banner lines start with `[bkit-check]`.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-install.test.ts`.
- **Closes:** BAR-142 §B5.
- **Effort:** S. **Depends on:** none.

### P1.T6 — `.npmrc` token noise mitigation

- **Scope:** (a) Update `gh-bkit-token-secret-unknown` advisory action text to instruct `export GH_BKIT_TOKEN=…` for local dev. (b) Investigate POSIX `${VAR:-}` fallback in pnpm; if supported, ship `_authToken=${GH_BKIT_TOKEN:-}` template.
- **Files touched:**
  - `.agents/scripts/bkit-preflight.ts` (or where advisory lives) — action text.
  - `templates/.npmrc` (or equivalent payload `.npmrc` template) — guarded fallback iff supported.
  - `README.md` — local-dev shell-rc note.
  - `.agents/scripts/bkit-preflight.test.ts` — action text snapshot.
- **Acceptance criteria:** advisory action text contains `export GH_BKIT_TOKEN`; if pnpm supports `${VAR:-}`, template uses fallback and a no-warning local-dev test passes.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`; manual `pnpm install` in shell without token (no warning).
- **Closes:** BAR-142 §B6.
- **Effort:** S. **Depends on:** none.

### P1.T7 — Changelog header in post-install banner

- **Scope:** When `.bkit-version` differs from package version, prepend a 3-line `Upgraded X → Y` header sourced from `CHANGELOG.md` keyed on the new version.
- **Files touched:**
  - `.agents/scripts/bkit-postinstall.ts` (or new `bkit-changelog.ts`) — version diff + changelog excerpt.
  - `package.json` payload — ensure `CHANGELOG.md` ships in tarball (`files` array).
  - `.agents/scripts/bkit-postinstall.test.ts` — fixture with stale `.bkit-version` asserts header rendered.
- **Acceptance criteria:** post-install banner shows version-delta header only on upgrade; identical-version run shows no header.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-postinstall.test.ts`.
- **Closes:** BAR-142 §A7.
- **Effort:** M. **Depends on:** none.

### P1.T8 — README + help-text rollup

- **Scope:** Single doc PR pass — README "Doctor" section, help-text additions, ensure CHANGELOG.md exists and includes v0.6.x entry referencing each closed sub-issue.
- **Files touched:**
  - `README.md`, `CHANGELOG.md`.
- **Acceptance criteria:** README renders `doctor` usage; CHANGELOG has v0.6.x section with bullet per closed task.
- **Verification:** `pnpm lint:prose` (Vale); manual review.
- **Closes:** none directly (rollup).
- **Effort:** S. **Depends on:** P1.T1–P1.T7.

🔒 **Phase 1 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm exec bkit doctor` (against repo itself) all pass before merge.

## Phase 2 — Recovery primitive (`bkit uninstall` + Phase 3 wiring + `.bkitignore`)

Target version v0.7.x. Builds the surgical-uninstall primitive, wires Phase 3 blocker exit-1, adds `--auto-revert` opt-in, and ships `.bkitignore` to keep `bkit check` green for intentional drift. Markers-as-SoT for Tier-2; hash-guard via `.bkit-version` for Tier-3; default-value-only removal for managed `package.json` keys.

| ID | Task | Effort | Depends |
| --- | --- | --- | --- |
| P2.T1 | Build install-write manifest from modules | M | none |
| P2.T2 | Tier-2 managed-block strip helper | M | P2.T1 |
| P2.T3 | Tier-3 hash-guard via `.bkit-version` | M | P2.T1 |
| P2.T4 | Managed `package.json` keys default-only stripping | M | P2.T1 |
| P2.T5 | `runUninstallModule` per install module + `WriteSet` deletions | M | P2.T2-T4 |
| P2.T6 | `bkit uninstall` CLI verb + flags | M | P2.T5 |
| P2.T7 | `--dry-run` per-file decision table (DELETE/STRIP-BLOCK/PRESERVE) | S | P2.T6 |
| P2.T8 | Idempotency + `--nuke` confirm prompt | S | P2.T6 |
| P2.T9 | Phase 3 blocker exit-1 wiring + recovery action text | M | P2.T6 |
| P2.T10 | `--auto-revert` install flag (in-process uninstall) | M | P2.T9 |
| P2.T11 | `.bkitignore` parser + `bkit check` / `bkit doctor` integration (A6) | M | P1.T1 |
| P2.T12 | README "Uninstall" + ".bkitignore" + recovery sections | S | P2.T1-T11 |

### P2.T1 — Install-write manifest

- **Scope:** Build a per-module manifest enumerating every Tier-1 path, Tier-2 file, Tier-3 file, and managed `package.json` key written by each install module. Drives uninstall + future upgrade diffing. Source from `bkit-modules.ts` Tier-1/2/3 calls; no behaviour change to install.
- **Files touched:**
  - `.agents/scripts/bkit-modules.ts` — export per-module manifest tables.
  - `.agents/scripts/bkit-manifest.ts` (new) — `getInstallManifest(modules)` returning typed records.
  - `.agents/scripts/bkit-manifest.test.ts` (new) — snapshot.
- **Acceptance criteria:** manifest records every install touch; snapshot matches actual `--full` install file list.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-manifest.test.ts`.
- **Closes:** BAR-139 §Suggested order #1.
- **Effort:** M. **Depends on:** none.

### P2.T2 — Tier-2 managed-block strip helper

- **Scope:** Add `stripManagedBlock(content)` reusing the existing line-anchored regex from `bkit-tiers.ts` — handles both `<!-- bkit:start -->` HTML and `# bkit:start` hash forms. Marker-absent guard: if no markers, return content unchanged. Whitespace-collapse safe (no greedy multi-line eat per BAR-138 lesson).
- **Files touched:**
  - `.agents/scripts/bkit-tiers.ts` — new export `stripManagedBlock`.
  - `.agents/scripts/bkit-tiers.test.ts` — fixtures: HTML markers, hash markers, marker-absent, whitespace-around, multiple non-bkit blocks.
- **Acceptance criteria:** snapshot tests on `AGENTS.md`, `.gitignore`, `.husky/pre-commit` fixtures show only the bkit region removed; consumer content byte-identical outside markers; no markers → unchanged.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`.
- **Closes:** BAR-139 §Suggested order #3, §Surgical Tier 2.
- **Effort:** M. **Depends on:** P2.T1.

### P2.T3 — Tier-3 hash-guard via `.bkit-version`

- **Scope:** When uninstalling a Tier-3 file (e.g. `.github/workflows/ci.yml`), compute current hash and compare against template-hash recorded in `.bkit-version`. Match → delete. Mismatch → preserve (or `--force` overrides). Extends `.bkit-version` schema with `tier3Hashes: Record<path, sha256>` (additive).
- **Files touched:**
  - `.agents/scripts/bkit-version.ts` (new or existing) — read/write extended schema.
  - `.agents/scripts/bkit-tiers.ts` — `writeTier3` records hash on write.
  - `.agents/scripts/bkit-uninstall.ts` (new) — `shouldDeleteTier3(path)` consult.
  - `.agents/scripts/bkit-uninstall.test.ts` (new) — fixture: edited ci.yml preserved; pristine ci.yml deleted; `--force` overrides preservation.
- **Acceptance criteria:** consumer-edited `ci.yml` survives uninstall by default; pristine seeded file removed.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-uninstall.test.ts`.
- **Closes:** BAR-139 §Surgical Tier 3.
- **Effort:** M. **Depends on:** P2.T1.

### P2.T4 — Managed `package.json` keys default-only stripping

- **Scope:** For bkit-managed scripts (`typecheck`, `format:check`, `lint:prose`, `lint:slop`, `prepare`) and `pnpm.onlyBuiltDependencies` entries, only remove if current value matches bkit's emitted default at install time. Source defaults from manifest (P2.T1). Preserves consumer customisations.
- **Files touched:**
  - `.agents/scripts/bkit-package-json.ts` (new helper or extend existing) — `stripManagedKeys(pkgJson, manifest)`.
  - `.agents/scripts/bkit-uninstall.ts` — wire into module path.
  - `.agents/scripts/bkit-package-json.test.ts` (new) — fixtures: default value removed, customised value preserved.
- **Acceptance criteria:** customised `scripts.typecheck` value retained; pristine bkit-default removed.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-package-json.test.ts`.
- **Closes:** BAR-139 §Surgical managed package.json.
- **Effort:** M. **Depends on:** P2.T1.

### P2.T5 — `runUninstallModule` per install module

- **Scope:** Per-module uninstall function mirroring `runModule` shape — additive to `WriteSet` (now tracks `deletes` alongside `writes`). Dry-run-aware. Uses helpers from P2.T2/T3/T4. Tier-1 files: `rm -rf` directories with bkit-prefix filter; preserve non-`bkit-` prefixed `.md` in `.agents/skills/`.
- **Files touched:**
  - `.agents/scripts/bkit-install.ts` — extend `WriteSet` type with `deletes: WriteEntry[]`.
  - `.agents/scripts/bkit-modules.ts` — register `uninstallModule` per module.
  - `.agents/scripts/bkit-uninstall.ts` — `runUninstall(modules, ctx)` orchestrator.
  - `.agents/scripts/bkit-uninstall.test.ts` — round-trip: install → uninstall → `git status` clean.
- **Acceptance criteria:** install-then-uninstall returns `git status` clean (excluding `node_modules`/`.npmrc`); idempotent on re-run.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-uninstall.test.ts`.
- **Closes:** BAR-139 §Suggested order #2, DoD #1, #4.
- **Effort:** M. **Depends on:** P2.T2, P2.T3, P2.T4.

### P2.T6 — `bkit uninstall` CLI verb + flags

- **Scope:** Register `uninstall` verb in `bkit-cli.ts`. Flags: module flags mirror install (`--ci`, `--lint`, `--git-hooks`, `--core`, `--claude`, `--cursor`, `--full`); `--dry-run`, `--force`, `--nuke`, `--package`, `--keep-npmrc`, `--keep-tooling`, `--module <name>`. Dispatch to `runUninstall`.
- **Files touched:**
  - `.agents/scripts/bkit-cli.ts` — extend `Verb`, parse flags, update `printUsage`.
  - `.agents/scripts/bkit-install.ts` — `main()` dispatch arm.
  - `.agents/scripts/bkit-cli.test.ts` — flag parsing.
- **Acceptance criteria:** `pnpm exec bkit uninstall --help` prints all flags; unknown flags error with non-zero.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-cli.test.ts`.
- **Closes:** BAR-139 §Scope #1, #5.
- **Effort:** M. **Depends on:** P2.T5.

### P2.T7 — `--dry-run` per-file decision table

- **Scope:** Render a 3-column table (FILE | DECISION | REASON) where DECISION ∈ {DELETE, STRIP-BLOCK, PRESERVE} with one-line REASON each. No writes when `--dry-run`.
- **Files touched:**
  - `.agents/scripts/bkit-uninstall.ts` — formatter.
  - `.agents/scripts/bkit-uninstall.test.ts` — table snapshot.
- **Acceptance criteria:** snapshot matches expected per-file decisions on the round-trip fixture.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-uninstall.test.ts`.
- **Closes:** BAR-139 §DoD dry-run, §Surgical AC.
- **Effort:** S. **Depends on:** P2.T6.

### P2.T8 — Idempotency + `--nuke` confirm prompt

- **Scope:** Re-running uninstall when files already absent reports cleanly (no errors). `--nuke` mode (blanket delete, test repos only) requires interactive `y/N` confirm OR `--yes` for automation.
- **Files touched:**
  - `.agents/scripts/bkit-uninstall.ts` — idempotent skip + prompt.
  - `.agents/scripts/bkit-uninstall.test.ts` — re-run test, `--nuke --yes` test.
- **Acceptance criteria:** double-run uninstall exits 0 with "already absent" lines; `--nuke` without `--yes` requires TTY confirmation.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-uninstall.test.ts`.
- **Closes:** BAR-139 §DoD idempotent.
- **Effort:** S. **Depends on:** P2.T6.

### P2.T9 — Phase 3 blocker exit-1 wiring

- **Scope:** In `bkit-install.ts` after Phase 3 banner render, inspect `postFindings.some(f => f.severity === "blocker")`; if true, exit 1. Action text on every Phase 3 blocker references partial state and includes `pnpm bkit uninstall <flags-used> && <fix> && pnpm bkit install <flags>`.
- **Files touched:**
  - `.agents/scripts/bkit-install.ts` — Phase 3 exit branch.
  - `.agents/scripts/bkit-postinstall.ts` — action-text recovery line.
  - `.agents/scripts/bkit-install.integration.test.ts` (new or extend) — gap fixture: install completes writes, banner prints, exit 1; subsequent `bkit uninstall` returns repo to pre-install state.
- **Acceptance criteria:** integration asserts exit code 1 + banner content + clean repo after subsequent uninstall; advisory-only run still exits 0.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-install.integration.test.ts`.
- **Closes:** BAR-142 §A2 (now in BAR-139), BAR-139 §6, DoD Phase-3 exit-1.
- **Effort:** M. **Depends on:** P2.T6.

### P2.T10 — `--auto-revert` install flag

- **Scope:** Opt-in flag on `bkit install`. When passed AND a Phase 3 blocker fires, invoke `runUninstall` in-process before exit 1. Off by default.
- **Files touched:**
  - `.agents/scripts/bkit-cli.ts` — flag parse on install.
  - `.agents/scripts/bkit-install.ts` — Phase 3 path.
  - `.agents/scripts/bkit-install.integration.test.ts` — fixture asserts files reverted.
- **Acceptance criteria:** with `--auto-revert`, repo returns to pre-install state on Phase 3 blocker; without flag, files remain (consumer runs uninstall manually).
- **Verification:** `pnpm vitest run .agents/scripts/bkit-install.integration.test.ts`.
- **Closes:** BAR-139 §7, DoD `--auto-revert`.
- **Effort:** M. **Depends on:** P2.T9.

### P2.T11 — `.bkitignore` parser + check/doctor integration

- **Scope:** Gitignore-style globs, one path per line, optional `:json.path` suffix (per-key drift exclusion). `bkit check` and `bkit doctor` consult `.bkitignore` before flagging drift on listed files. Per-file is must-have for this phase; per-key support behind a feature flag if costly (else defer to pending).
- **Files touched:**
  - `.agents/scripts/bkit-bkitignore.ts` (new) — parser + matcher.
  - `.agents/scripts/bkit-tiers.ts` or `bkit-postinstall.ts` — drift detector consults matcher.
  - `.agents/scripts/bkit-bkitignore.test.ts` (new) — glob match, `:json.path` parse.
  - `README.md` — `.bkitignore` doc section.
- **Acceptance criteria:** consumer with customised `.cursor/hooks.json` and `.bkitignore` listing it → `bkit check` exits 0; `bkit doctor` mirrors.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-bkitignore.test.ts`.
- **Closes:** BAR-142 §A6.
- **Effort:** M. **Depends on:** P1.T1 (doctor must exist).

### P2.T12 — README + recovery docs rollup

- **Scope:** README "Uninstall", "`.bkitignore`", and "Recovery from Phase 3 blockers" sections. CHANGELOG.md v0.7.x entry per closed item.
- **Files touched:** `README.md`, `CHANGELOG.md`.
- **Acceptance criteria:** `pnpm lint:prose` clean; manual review confirms 3 new sections.
- **Verification:** `pnpm lint:prose`.
- **Closes:** BAR-139 §DoD README; BAR-142 §A6 doc.
- **Effort:** S. **Depends on:** P2.T1-T11.

🔒 **Phase 2 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop`. Round-trip integration test: `bkit install --full` → `bkit uninstall` → `git status` clean (excluding `node_modules`/`.npmrc`). Surgical-uninstall snapshot test on heavily-customised fixture (custom hooks/scripts/tuned `.vale.ini`) → consumer-customized files byte-identical to pre-install state.

## Phase 3 — Tier-2 deep-merge for `.cursor/hooks.json` + `.claude/settings.json`

Target version v0.8.x. Reclassifies two JSON files from Tier-1 (full overwrite) to Tier-2 (managed-block deep-merge) using `__bkit__` namespace. Biggest semver pressure; ship behind a careful migration path. **HUMAN APPROVAL REQUIRED** for namespace contract + Tier-1→Tier-2 reclass per Major-Changes bar.

| ID | Task | Effort | Depends |
| --- | --- | --- | --- |
| P3.T0 | Verify Cursor v1 hooks schema (research/spike) | S | none |
| P3.T1 | JSON deep-merge primitive in `bkit-tiers.ts` | M | P3.T0 |
| P3.T2 | `__bkit__` namespace contract + extractor | M | P3.T1 |
| P3.T3 | `writeTier2Json()` helper | M | P3.T2 |
| P3.T4 | Reclassify `.claude/settings.json` to Tier-2 | M | P3.T3 |
| P3.T5 | Reclassify `.cursor/hooks.json` to Tier-2 (after schema fix if needed) | M | P3.T0, P3.T3 |
| P3.T6 | Migration: detect old Tier-1 file, auto-extract to `__bkit__` shape | M | P3.T4, P3.T5 |
| P3.T7 | Retire `detectHooksConfigOverwriteRisk` blocker | S | P3.T5 |
| P3.T8 | B3 Vercel CLI hang guard (only if A1 touches preflight code paths) | S | P3.T1 |
| P3.T9 | Upgrade-survival regression test (Gether scenario) | S | P3.T6 |
| P3.T10 | KN-8 update + decisions doc + README | S | P3.T1-T9 |

### P3.T0 — Verify Cursor v1 hooks schema

- **Scope:** Read Cursor's published v1 hooks docs and runtime; confirm whether bkit's currently shipped flat `{ hooks: [{ event, command }] }` form is supported, or whether the actual v1 schema is `{ version: 1, hooks: { sessionStart: [{ command, failClosed }], stop: [{ command, loop_limit }] } }`. Output: short note in `docs/decisions.md` + Linear comment.
- **Files touched:** `docs/decisions.md` — append spike findings.
- **Acceptance criteria:** decision recorded, schema chosen for P3.T5.
- **Verification:** manual research; reviewer signs off on choice in PR body.
- **Closes:** BAR-142 §A1 prerequisite.
- **Effort:** S. **Depends on:** none.

### P3.T1 — JSON deep-merge primitive

- **Scope:** Pure function `deepMergeJson(consumer, bkit, options)` — recursive merge; bkit-owned keys identified by `__bkit__` namespace; arrays under bkit-owned paths are *replaced* (not concatenated) to keep ownership semantics clean; consumer keys outside `__bkit__` untouched. Stable key order preserved.
- **Files touched:**
  - `.agents/scripts/bkit-tiers.ts` — `deepMergeJson` export.
  - `.agents/scripts/bkit-tiers.test.ts` — fixtures: nested objects, arrays-replaced, consumer-key preservation, deep paths.
- **Acceptance criteria:** snapshot tests cover all six concrete `.claude/settings.json` cases (`permissions.*`, `mcpServers`, `hooks.SessionStart` bkit-owned; `hooks.Stop`, `hooks.PostToolUse`, `hooks.UserPromptSubmit` consumer-owned).
- **Verification:** `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`.
- **Closes:** BAR-142 §A1 DoD deep-merge.
- **Effort:** M. **Depends on:** P3.T0.

### P3.T2 — `__bkit__` namespace contract

- **Scope:** Define payload format: bkit's source-of-truth lives in `__bkit__: {...}` top-level key on shipped templates. On install, `extractBkitNamespace(template)` lifts it; merge into consumer file under canonical paths; persist `__bkit__` block back into consumer file as the recoverable record. Document contract in `docs/decisions.md`.
- **Files touched:**
  - `.agents/scripts/bkit-tiers.ts` — `extractBkitNamespace`, `applyBkitNamespace`.
  - `templates/.claude/settings.json` — restructured payload with `__bkit__` envelope.
  - `templates/.cursor/hooks.json` — same.
  - `docs/decisions.md` — append namespace decision.
  - `.agents/scripts/bkit-tiers.test.ts` — extractor tests.
- **Acceptance criteria:** template files parse; extractor returns expected shape; `applyBkitNamespace(consumer, namespaceObj)` produces merged file with `__bkit__` retained.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`.
- **Closes:** BAR-142 §A1 DoD namespace.
- **Effort:** M. **Depends on:** P3.T1.

### P3.T3 — `writeTier2Json()` helper

- **Scope:** Mirror `writeTier1`/`writeTier2`/`writeTier3` API. Reads template, extracts `__bkit__`, reads consumer file (or empty `{}`), deep-merges, writes. WriteSet-tracked. Idempotent (no-op when result equals current).
- **Files touched:**
  - `.agents/scripts/bkit-tiers.ts` — `writeTier2Json`.
  - `.agents/scripts/bkit-tiers.test.ts` — round-trip test.
- **Acceptance criteria:** consecutive `writeTier2Json` calls no-op; consumer keys preserved across runs.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`.
- **Closes:** BAR-142 §A1 DoD `writeTier2Json`.
- **Effort:** M. **Depends on:** P3.T2.

### P3.T4 — Reclassify `.claude/settings.json` to Tier-2

- **Scope:** Update Claude module dispatcher to call `writeTier2Json` instead of `writeTier1` for `.claude/settings.json`. Restructure shipped template into `__bkit__` envelope.
- **Files touched:**
  - `.agents/scripts/bkit-modules.ts` — Claude module call.
  - `templates/.claude/settings.json` — payload.
  - `.agents/scripts/bkit-modules.test.ts` — fixture: consumer with custom `hooks.Stop` survives install.
- **Acceptance criteria:** test asserts `hooks.Stop` byte-identical post-install.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-modules.test.ts`.
- **Closes:** BAR-142 §A1 DoD Tier-2 reclass (settings).
- **Effort:** M. **Depends on:** P3.T3.

### P3.T5 — Reclassify `.cursor/hooks.json` to Tier-2

- **Scope:** Same pattern as P3.T4 for `.cursor/hooks.json`. If P3.T0 found bkit's shipped schema is wrong, fix the schema as part of this task (one breaking change, not two).
- **Files touched:**
  - `.agents/scripts/bkit-modules.ts` — Cursor module call.
  - `templates/.cursor/hooks.json` — payload (corrected if needed).
  - `.agents/scripts/bkit-modules.test.ts` — fixture: consumer with custom `loop_limit`/`failClosed` survives install.
- **Acceptance criteria:** test asserts consumer customisations preserved across install.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-modules.test.ts`.
- **Closes:** BAR-142 §A1 DoD Tier-2 reclass (hooks).
- **Effort:** M. **Depends on:** P3.T0, P3.T3.

### P3.T6 — Migration path for old Tier-1 files

- **Scope:** On install, if existing `.claude/settings.json` or `.cursor/hooks.json` lacks `__bkit__` key, run a one-time auto-extraction: identify keys matching previous bkit defaults, lift into `__bkit__` envelope, leave rest as consumer-owned. Log migration banner.
- **Files touched:**
  - `.agents/scripts/bkit-tiers.ts` — `migrateTier1JsonToTier2`.
  - `.agents/scripts/bkit-tiers.test.ts` — fixture: 0.7.x-shaped file → migrated.
- **Acceptance criteria:** migration is idempotent; subsequent installs skip; consumer keys preserved.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-tiers.test.ts`.
- **Closes:** BAR-142 §A1 migration.
- **Effort:** M. **Depends on:** P3.T4, P3.T5.

### P3.T7 — Retire `detectHooksConfigOverwriteRisk`

- **Scope:** Detector becomes obsolete since Tier-2 makes overwrite impossible. Remove (or repurpose to assert `__bkit__` key present after install).
- **Files touched:**
  - `.agents/scripts/bkit-preflight.ts` — remove detector or repurpose.
  - `.agents/scripts/bkit-preflight.test.ts` — remove obsolete tests.
- **Acceptance criteria:** preflight test suite green; banner no longer surfaces obsolete blocker.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`.
- **Closes:** BAR-142 §A1 DoD obsolete-detector.
- **Effort:** S. **Depends on:** P3.T5.

### P3.T8 — B3 Vercel CLI hang guard (conditional)

- **Scope:** Only execute if Phase 3 work touches `bkit-preflight.ts` `detectVercelEnv`. Either pre-check `.vercel/project.json` and skip `vercel env ls` when absent, OR catch timeout and return `"unknown"` + low-priority advisory.
- **Files touched:**
  - `.agents/scripts/bkit-preflight.ts` — `detectVercelEnv` body.
  - `.agents/scripts/bkit-preflight.test.ts` — timeout fixture.
- **Acceptance criteria:** unlinked-project fixture returns `"unknown"` within 1s, not 10s timeout.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-preflight.test.ts`.
- **Closes:** BAR-142 §B3.
- **Effort:** S. **Depends on:** P3.T1 (only if intersects). If not, defer to pending.

### P3.T9 — Upgrade-survival regression test

- **Scope:** End-to-end test mimicking the gether-life scenario: install bkit@A → consumer adds custom `hooks.Stop` → install bkit@B over top → assert `hooks.Stop` unchanged AND bkit's `SessionStart` updated.
- **Files touched:**
  - `.agents/scripts/bkit-modules.upgrade.integration.test.ts` (new).
- **Acceptance criteria:** test asserts byte-identical consumer key + updated bkit key across two install passes.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-modules.upgrade.integration.test.ts`.
- **Closes:** BAR-142 §A1 DoD regression.
- **Effort:** S. **Depends on:** P3.T6.

### P3.T10 — KN-8 + decisions + README

- **Scope:** Update `docs/knowledge.md` KN-8 to reflect Tier-2 deep-merge as canonical for JSON ownership-mixed files. Append `docs/decisions.md` entry on `__bkit__` namespace. README docs the consumer-visible behaviour ("bkit owns the `__bkit__` block; you own everything else").
- **Files touched:** `docs/knowledge.md`, `docs/decisions.md`, `README.md`, `CHANGELOG.md` v0.8.x.
- **Acceptance criteria:** docs review clean; CHANGELOG entry per closed item.
- **Verification:** `pnpm lint:prose`.
- **Closes:** BAR-142 §A1 cross-link KN-8.
- **Effort:** S. **Depends on:** P3.T1-T9.

🔒 **Phase 3 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose`. Manual smoke against a customised consumer fixture: simulate two-version upgrade → consumer keys byte-identical, bkit keys current. Human-approval checkpoint for namespace contract + reclass per Major-Changes bar.

## Phase 4 — Architectural ergonomics (transactional install + `bkit upgrade` + helper action)

Target version v0.9.x → v1.0. Three structural unlocks: (a) staging-dir transactional install kills mid-failure inconsistency, (b) `bkit upgrade` codifies the heavy-customised upgrade dance, (c) BAR-131 helper-action stretch reduces consumer CI ceremony.

| ID | Task | Effort | Depends |
| --- | --- | --- | --- |
| P4.T1 | `.bkit-staging/<module>/` write path | M | P3.T3 |
| P4.T2 | Validate-then-atomic-rename per module | M | P4.T1 |
| P4.T3 | Mid-failure rollback test fixtures | S | P4.T2 |
| P4.T4 | `.bkit-version` extension: canonical-file hashes | M | P2.T3 |
| P4.T5 | `bkit upgrade` CLI verb + diff engine | L | P4.T4, P3.T6 |
| P4.T6 | `--non-interactive` upgrade auto-apply | M | P4.T5 |
| P4.T7 | Upgrade integration test (0.4.x → 0.5.x customised hooks) | S | P4.T5 |
| P4.T8 | BAR-131 helper-action `setup-auth@v1` | M | none |
| P4.T9 | README + CHANGELOG v0.9.x/v1.0 + decisions | S | P4.T1-T8 |

### P4.T1 — `.bkit-staging/<module>/` write path

- **Scope:** Modify `runModule` (or wrap) to direct `WriteSet` writes into `.bkit-staging/<module>/` mirror tree first. Preserve relative paths.
- **Files touched:**
  - `.agents/scripts/bkit-install.ts` — staging-aware write wrapper.
  - `.agents/scripts/bkit-modules.ts` — pass staging dir to module dispatcher.
  - `.agents/scripts/bkit-install.test.ts` — assert writes land in staging not consumer paths.
- **Acceptance criteria:** during run, consumer paths untouched; staging populated.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-install.test.ts`.
- **Closes:** BAR-142 §A4 DoD staging.
- **Effort:** M. **Depends on:** P3.T3 (Tier-2 JSON helper compatible).

### P4.T2 — Validate-then-atomic-rename

- **Scope:** After module completes successfully, atomic-rename per file (or per directory subtree where safe) from staging to live. On any thrown error: discard staging, leave consumer state untouched.
- **Files touched:**
  - `.agents/scripts/bkit-install.ts` — `commitStaging(module)` + `discardStaging(module)`.
  - `.agents/scripts/bkit-install.test.ts` — error-path test.
- **Acceptance criteria:** simulated mid-module throw → staging cleaned, consumer side byte-identical to pre-install.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-install.test.ts`.
- **Closes:** BAR-142 §A4 DoD atomic.
- **Effort:** M. **Depends on:** P4.T1.

### P4.T3 — Mid-failure rollback test fixtures

- **Scope:** Reproduce 0.5.0 `bkit-design-organise` lookup-miss case in fixture (throw inside Tier-3 transform). Assert no consumer-side files modified and clear error reporting.
- **Files touched:**
  - `.agents/scripts/bkit-install.integration.test.ts` — mid-failure case.
- **Acceptance criteria:** integration green; consumer git-diff empty post-error.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-install.integration.test.ts`.
- **Closes:** BAR-142 §A4 DoD test.
- **Effort:** S. **Depends on:** P4.T2.

### P4.T4 — `.bkit-version` canonical-file hashes

- **Scope:** Extend `.bkit-version` schema (additive) to record sha256 hashes of canonical bkit-owned files at install time. Used by `bkit upgrade` to detect consumer customisations vs. previous-version baseline.
- **Files touched:**
  - `.agents/scripts/bkit-version.ts` — schema extension; backward-compat read for old payloads.
  - `.agents/scripts/bkit-install.ts` — record hashes on write.
  - `.agents/scripts/bkit-version.test.ts` — schema test, backward-compat.
- **Acceptance criteria:** old `.bkit-version` payloads still parse; new installs record hashes; absent hash field treated as "unknown" (skip force-overwrite).
- **Verification:** `pnpm vitest run .agents/scripts/bkit-version.test.ts`.
- **Closes:** BAR-142 §A5 DoD `.bkit-version` extension.
- **Effort:** M. **Depends on:** P2.T3.

### P4.T5 — `bkit upgrade` CLI verb + diff engine

- **Scope:** New verb. Reads previous `.bkit-version`, optionally runs `pnpm add -D @cbartens/bkit@<X>`, then diffs canonical bkit-owned files (current consumer content vs. recorded hash). Per-file decisions: keep-yours / take-new / report-conflict. Tier-2 deep-merge files use `__bkit__` re-merge from P3. Tier-3 files: skip if hash mismatch (consumer-customised), force-merge if hash matches stored.
- **Files touched:**
  - `.agents/scripts/bkit-cli.ts` — `upgrade` verb.
  - `.agents/scripts/bkit-upgrade.ts` (new) — orchestrator.
  - `.agents/scripts/bkit-install.ts` — `main()` dispatch.
  - `.agents/scripts/bkit-upgrade.test.ts` (new) — diff engine, decisions.
  - `README.md` — Upgrade section.
- **Acceptance criteria:** `pnpm exec bkit upgrade --help` registers; diff produces per-file decision rows; non-customised canonical files force-merged on stale-hash; customised files surfaced with conflict line.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-upgrade.test.ts`.
- **Closes:** BAR-142 §A5 DoD verb + diff.
- **Effort:** L. **Depends on:** P4.T4, P3.T6.

### P4.T6 — `--non-interactive` auto-apply

- **Scope:** When passed, auto-apply non-conflicting decisions; abort on any conflict with non-zero exit. Conflict file list printed to stderr.
- **Files touched:**
  - `.agents/scripts/bkit-upgrade.ts` — flag dispatch.
  - `.agents/scripts/bkit-upgrade.test.ts` — auto-apply + abort cases.
- **Acceptance criteria:** test asserts conflict abort; clean upgrade applies and exits 0.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-upgrade.test.ts`.
- **Closes:** BAR-142 §A5 DoD `--non-interactive`.
- **Effort:** M. **Depends on:** P4.T5.

### P4.T7 — Upgrade integration test (customised hooks scenario)

- **Scope:** Fixture: install bkit@0.4.x → consumer customises `.cursor/hooks.json` → run `bkit upgrade` to 0.5.x → assert hooks NOT silently overwritten; bkit-owned `__bkit__` block updated.
- **Files touched:** `.agents/scripts/bkit-upgrade.integration.test.ts` (new).
- **Acceptance criteria:** customised file preserved; bkit block current; finding #10 architecturally impossible.
- **Verification:** `pnpm vitest run .agents/scripts/bkit-upgrade.integration.test.ts`.
- **Closes:** BAR-142 §A5 DoD test.
- **Effort:** S. **Depends on:** P4.T5.

### P4.T8 — BAR-131 helper-action `setup-auth@v1`

- **Scope:** Ship `.github/actions/setup-auth/action.yml` in bkit producer repo. Composite action wraps the `git config --global url.insteadOf` PAT-shim using `BKIT_READ_TOKEN`. Update consumer-seeded `ci.yml` template to use `uses: cbartens/bkit/.github/actions/setup-auth@v1`. Bash-line shim retained as fallback in README for non-Actions CI.
- **Files touched:**
  - `.github/actions/setup-auth/action.yml` (new).
  - `templates/ci.yml` — update step.
  - `README.md` — "Consumer CI auth" section.
  - `.github/workflows/test-action.yml` (new) — meta-test invoking the action.
- **Acceptance criteria:** consumer `ci.yml` snippet shrinks from a multi-line bash block to one `uses:` line; meta-test passes; bash fallback still documented.
- **Verification:** GitHub Actions run on test consumer fork.
- **Closes:** BAR-131 §1 stretch.
- **Effort:** M. **Depends on:** none (independent).

### P4.T9 — Docs + CHANGELOG v0.9/v1.0

- **Scope:** README adds `Upgrade`, `Transactional install`, `Helper action` sections. CHANGELOG v0.9.x and v1.0 entries. `docs/decisions.md` records staging-dir architecture + `.bkit-version` schema extension.
- **Files touched:** `README.md`, `CHANGELOG.md`, `docs/decisions.md`, `docs/knowledge.md`.
- **Acceptance criteria:** `pnpm lint:prose` clean.
- **Verification:** `pnpm lint:prose`.
- **Closes:** none directly (rollup).
- **Effort:** S. **Depends on:** P4.T1-T8.

🔒 **Phase 4 Gate:** `pnpm typecheck && pnpm vitest run && pnpm lint:prose`. Manual smoke: install on test consumer, kill process mid-stream, verify staging cleaned + consumer untouched. End-to-end upgrade test against gether-life-shaped fixture confirms no silent overwrites.

## Risks & cross-cutting concerns

| Risk / coupling | Phase | Mitigation | Approval gate |
| --- | --- | --- | --- |
| Cursor v1 hooks schema unverified — bkit's shipped shape may be wrong | 3 | P3.T0 spike before P3.T5; correct schema as part of reclass | research-only, no human approval needed |
| `__bkit__` namespace becomes a public contract → semver-major | 3 | Document in `docs/decisions.md`; bump to 0.8.0 | **YES — Major-Changes bar** |
| Tier-1 → Tier-2 reclass for hooks/settings is a breaking change | 3 | Migration path P3.T6 auto-extracts; release notes spell out migration | **YES — Major-Changes bar** |
| Phase 3 `process.exit(1)` is a behaviour change for consumers gating on exit-0 | 2 | Default off for advisories; only blockers exit 1; recovery line included | **YES — Major-Changes bar** |
| `.bkit-version` schema extension (hashes) | 4 | Additive field; backward-compat read | No |
| Markers-as-SoT for Tier-2 (BAR-138 lesson) — naive regex risks clobbering | 2 | Reuse existing line-anchored extractor; explicit fixture for whitespace-around case | No |
| Multi-bar plan size — long-running PR risk | All | Each phase ships independently; squash-merge per phase | No |
| Tier-3 hash storage retro-fit on already-installed consumers | 2 | First post-2.x install records hashes; absent → fallback to `--force` prompt | No |
| `bkit upgrade` requires `bkit uninstall` semantics from Phase 2 | 4 | Hard depend; cannot start P4 until P2 lands | No |
| BAR-131 helper-action introduces new bkit-owned surface | 4 | Defer until v0.9.x; opt-in for consumers; bash fallback retained | No |

## Test strategy summary

| Layer | Tooling | Coverage |
| --- | --- | --- |
| Unit | Vitest (`*.test.ts`) | Pure helpers: marker regex (P1.T2), dedup merge (P1.T3), token detection (P1.T4), manifest (P2.T1), strip helper (P2.T2), hash compare (P2.T3), package-json strip (P2.T4), JSON deep-merge (P3.T1), namespace extractor (P3.T2), `.bkitignore` parser (P2.T11), upgrade diff (P4.T5) |
| Integration | Vitest tmp-dir fixtures (`*.integration.test.ts`) | `bkit doctor` exit-0 (P1.T1); `bkit uninstall` round-trip (P2.T5); Phase 3 blocker exit-1 + revert (P2.T9-T10); Tier-2 upgrade survival (P3.T9); transactional rollback (P4.T3); upgrade scenario (P4.T7) |
| E2E / smoke | Manual on test consumer | Phase 2 gate, Phase 3 gate, Phase 4 gate |
| Existing parity | `bkit-dry-run-parity.integration.test.ts` | Re-run unchanged after each phase to ensure no regression |

Derived test matrix per Acceptance Scenario rows maps 1:1 to tasks above (P1.T1, P2.T5+T9, P3.T9, P4.T7).

## Verification gates

| Gate | Phase | Commands | Pass criteria |
| --- | --- | --- | --- |
| G1 | End of Phase 1 | `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm exec bkit doctor` | All Phase 1 tests green; doctor runs clean against repo |
| G2 | End of Phase 2 | `pnpm typecheck && pnpm vitest run && pnpm lint:prose && pnpm lint:slop` + manual round-trip | install→uninstall→`git status` clean; surgical fixture preserves consumer files |
| G3 | End of Phase 3 | `pnpm typecheck && pnpm vitest run && pnpm lint:prose` + manual two-version upgrade | Consumer hooks survive; obsolete detector removed |
| G4 | End of Phase 4 | `pnpm typecheck && pnpm vitest run && pnpm lint:prose` + manual mid-failure smoke | Staging cleaned on error; upgrade non-destructive |

Each gate also requires squash-merge per project Merge-method rule.

## Supersession Inventory

| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `detectHooksConfigOverwriteRisk` blocker in `bkit-preflight.ts` | Tier-2 deep-merge (P3.T1-T5) | DELETE | Detector becomes architecturally impossible once hooks are Tier-2; remove in P3.T7 |
| Tier-1 classification for `.cursor/hooks.json` | `writeTier2Json` (P3.T3) | DELETE | Replaced; migration P3.T6 lifts old shape into `__bkit__` envelope |
| Tier-1 classification for `.claude/settings.json` | `writeTier2Json` (P3.T3) | DELETE | Replaced; migration P3.T6 lifts old shape into `__bkit__` envelope |
| Manual 10-step uninstall recipe (BAR-139 comments) | `pnpm bkit uninstall` (P2.T6) | DELETE | Replaced by CLI verb; recipe deleted from internal docs once verb ships |
| Multi-line bash PAT-shim block in seeded `ci.yml` | `setup-auth@v1` action (P4.T8) | RETAIN-WITH-REASON | External contract — bash fallback retained for non-Actions CI; staged rollout |
| `hasBkitMarkers` substring impl | Anchored regex (P1.T2) | DELETE | Replaced in same file; no callers retain old behaviour |

## Out-of-scope candidates (for `docs/pending.md` per Step 7)

- Per-key drift exclusion in `.bkitignore` (`path:json.path` syntax) — ship per-file in P2.T11; per-key only if implementation cost low.
- Three-way merge UI for `bkit upgrade` conflicts (P4.T5 emits conflict list; user resolves manually).
- bkit npm-registry distribution (out-of-scope per BAR-131).
- Factory-reset uninstall mode (out-of-scope per BAR-139).
- `pnpm-lock.yaml` cleanup automation post-uninstall.
- Pre-install state restoration of incrementally-modified files (impossible without backups).
- Net-new preflight detectors — separate Linear issues per BAR-142 §Out of scope.
- B3 Vercel CLI guard if Phase 3 work doesn't intersect `bkit-preflight.ts`.
- Helper action + bkit `init` scaffolder for consumer CI variants (composite vs. reusable workflow) — P4.T8 ships composite only.

---

Verdict: CONCERNS

Concerns flagged:
1. Cursor v1 hooks schema unverified — P3.T0 spike must complete before P3.T5 starts; if schema differs from bkit's shipped shape, P3.T5 absorbs the breaking-change fix (one semver bump, not two).
2. JSON deep-merge complexity — `__bkit__` namespace contract is a public surface; once shipped, removing breaks consumers. Requires explicit human approval per Major-Changes bar before P3 PR opens.
3. Phase 3 `process.exit(1)` change in P2.T9 is a behaviour change for consumers gating CI on bkit exit codes. Default-off for advisories mitigates; still recommend Major-Changes bar review before P2 PR.
4. Tier-1 → Tier-2 reclass for hooks/settings is a contract change; P3.T6 migration must be exercised on real consumer fixtures (gether-life, fraser-coast) before merging Phase 3.
5. Plan size — 39 tasks across 4 phases. Recommend `/bkit-complexity-check` consider splitting into per-phase plans if execution capacity is tight; phases are independently shippable so split is low-risk.

Plan is buildable. Each task has observable acceptance criteria, file targets, and explicit verification commands. Phase boundaries align with squash-merged PRs and bkit minor-version releases.
<!-- verdict:end -->
