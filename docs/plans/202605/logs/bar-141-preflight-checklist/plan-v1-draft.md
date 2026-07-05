<!-- Note: Save draft plans in `docs/plans/drafts/`. Move to `docs/plans/active/` when approved for execution. -->

# BAR-141 — bkit install preflight + post-install AI checklist (Implementation Plan)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

bkit currently emits scattered `printSink.push()` advisory strings during install. v0.4.0 wrapped them in a numbered banner as a down-payment, but there is still no:

- pre-write blocker detection (install can clobber a corrupt repo);
- structured `{id, severity, detect, action}` finding shape (downstream tooling cannot parse);
- post-install re-detection (some checks only become accurate after writes — devDeps, ci.yml env);
- four-surface `GH_BKIT_TOKEN_INSTALL` sustainability sweep (shell / `.npmrc` / GH secret / Vercel env).

This plan replaces the ad-hoc pattern with a three-phase install: **Preflight (read-only) → Install (current) → Post-install (re-detect + unified output)**. The `printSink: string[]` is replaced by a structured `PreflightFinding[]` accumulator; the existing banner-flush block becomes the formatter for the unified post-install output.

**Success Criteria:**

- `bkit install` exits 1 BEFORE any writes when a Phase 1 blocker fires (no half-installed state on a corrupt/missing `package.json` or non-git worktree).
- After a successful install, the consumer (or an AI agent) sees a single numbered checklist with stable `id`s, severity, `DETECT`, and `ACTION` per finding — copy-pasteable into a coding assistant.
- All previously emitted `printSink` strings are migrated to the new structured form with no behavioural regression (same conditions trigger, same messages render).

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

- **Narrative:** 1–2 sentences, user POV (not system POV). Describes what the user does and what they get back.
- **Success Criteria:** ≤5 bullets, each measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), NOT implementation steps (e.g. "call API, render component"). If design doc lists fewer or more, prefer the smallest set that still proves the feature works.
- **Key Edge Cases _(design phase produces; plan phase inherits)_:** Design-shaping only — concurrency, conflict resolution, failure modes, cross-feature interactions. NOT trivial input validation (the plan adds those).
- **Edge Cases _(plan phase)_:** Inherits design's Key Edge Cases verbatim + adds plan-level cases (validation, error paths, boundary conditions).
- **Concrete Example _(plan phase only)_:** Specific user role + starting state + numbered steps + observable outcome. One scenario, not a list.
- **Derived Test Matrix _(plan phase only)_:** One row per testable behaviour. Each row → exactly one task in the Agent Execution Runbook. No row without a target file.

**Design-missing fallback:** If `{FID}-design.md` is absent or has no `## Acceptance Scenario` section, replace the inherited Narrative and Success Criteria fields with `⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds`. Do NOT fabricate either field; gate-1 stays blocked until human fills both.

### Narrative _(inherited from design — do not rewrite)_

⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds

_(BAR-141 was not preceded by a `/bkit-design` phase; per Spec, the human must supply the user-POV narrative before Gate 1 unblocks. Suggested wording from the issue body, for human approval/edit:_ "A bkit consumer runs `pnpm bkit install` in a freshly-cloned repo and gets either (a) a clean blocker exit before any writes, with a single actionable line, or (b) a numbered, AI-pasteable checklist of advisories at the end describing exactly what they still need to do.")

### Success Criteria _(inherited from design — do not rewrite)_

⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds

_(Suggested 5 outcomes from the issue body, for human approval/edit:_

1. _Running `bkit install` against a directory without `package.json` exits 1 with a single `[blocker] no-package-json` finding and zero writes._
2. _Running `bkit install` in a healthy consumer repo with no advisories produces no checklist (only the existing `Done. N write(s).` line)._
3. _Running `bkit install` against a repo missing `GH_BKIT_TOKEN_INSTALL` shell export emits exactly one `gh-bkit-token-missing-shell` advisory in the post-install checklist with the specific export command in `ACTION`._
4. _The post-install checklist deduplicates findings whose `id` matches between Phase 1 (preflight) and Phase 3 (post-install re-detect)._
5. _All findings carry `id`, `severity`, `detect`, `action` and render in the format shown in the issue body — verifiable by snapshot test._)

### Concrete Example _(plan expands from design)_

**Setup:** Consumer is a senior dev on a freshly-cloned repo where:

- `package.json` exists and is valid;
- `.git/` exists;
- `.husky/pre-commit` already exists with custom content but NO bkit markers;
- `package.json#scripts.lint:prose` is the F9-vulnerable form (no `[ -d .vale/styles/write-good ]` guard);
- `GH_BKIT_TOKEN_INSTALL` is exported in shell;
- `.npmrc` is missing the GH Packages registry lines;
- `gh secret list` shows `GH_BKIT_TOKEN_INSTALL` IS set on the GitHub repo;
- `vercel.json` is absent;
- vale is on PATH but `.vale/styles/write-good/` is absent.

**Steps:**

1. User runs `pnpm bkit install` → bkit Phase 1 finds 0 blockers, 2 advisories (`husky-no-markers-precommit`, `lint-prose-f9-vulnerable`) and continues to Phase 2.
2. Phase 2 dispatches all modules → writes occur → `.husky/pre-commit` gets a bkit block appended; lint-prose script preserved (consumer-wins).
3. Phase 3 re-runs detection → adds `npmrc-missing-gh-packages` and `vale-package-not-synced`; deduplicates against Phase 1 advisories; merges into one list.
4. bkit prints `Done. N write(s).` followed by the numbered checklist with 4 advisories.

**Outcome:** User sees one banner with 4 numbered `--- i/4 [advisory] {id} ---` blocks; each block has stable `id`, `DETECT:` line, multi-line `ACTION:` body. Process exit code is 0. Pasting the whole block into Claude Code makes Claude apply each fix in sequence.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `package.json` missing | Phase 1 emits `[blocker] no-package-json`, exits 1, zero writes. |
| `package.json` present but unparseable JSON | Phase 1 emits `[blocker] malformed-package-json`, exits 1, zero writes. |
| `--core` requested but `.git/` absent | Phase 1 emits `[blocker] not-git-repo`, exits 1. |
| `--core` NOT requested and `.git/` absent | `not-git-repo` does NOT fire (no false positive for non-git scratch dirs). |
| `gh` CLI absent / unauthenticated / not a GitHub repo | Token-surface detector returns `unknown` → `gh-bkit-token-secret-unknown` advisory (NOT `missing`). |
| `vercel env ls preview` errors / Vercel CLI absent | Vercel-surface detector returns `unknown` → silent skip (no false positive). |
| Same `id` advisory raised in BOTH Phase 1 and Phase 3 | Deduplicated; appears exactly once in unified output (Phase 3 entry wins on `detect`/`action` text — re-detection is the more accurate signal). |
| Zero advisories overall | No checklist banner printed (only `Done. N write(s).`). |
| Phase 1 blocker fires in `bkit check` (dry-run) | Same exit 1 + blocker line; no writes (`check` is already read-only — preflight stays read-only too). |
| Same finding id appears more than once within a single phase | Deduplicated within phase (defensive — modules may double-report). |
| `bkit-version` on disk shows a higher major than the installing version | Phase 1 emits `[advisory] bkit-version-major-downgrade`; install proceeds (advisory, not blocker). |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `runPreflight` returns blocker `no-package-json` when `package.json` absent | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `runPreflight` returns blocker `malformed-package-json` when JSON invalid | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `runPreflight` returns blocker `not-git-repo` only when `--core` requested AND `.git/` absent | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `runPreflight` returns advisory `husky-no-markers-precommit` when `.husky/pre-commit` exists without markers | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `runPreflight` returns advisory `husky-no-markers-prepush` when `.husky/pre-push` exists without markers | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `runPreflight` returns advisory `prettierignore-no-markers` when `.prettierignore` exists without markers | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `runPreflight` returns advisory `lint-prose-f9-vulnerable` when `package.json#scripts.lint:prose` lacks the write-good guard | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `runPreflight` returns advisory `bkit-version-major-downgrade` when on-disk major > installing major | Unit (Vitest) | `.agents/scripts/bkit-preflight.test.ts` |
| `runPostInstallCheck` returns `gh-bkit-token-missing-shell` when `process.env.GH_BKIT_TOKEN_INSTALL` unset | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `runPostInstallCheck` returns `npmrc-missing-gh-packages` when `.npmrc` lacks both required lines | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `runPostInstallCheck` returns `gh-bkit-token-secret-{missing,present,unknown}` based on `gh secret list` exit | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `runPostInstallCheck` returns `vercel-env-missing-{preview,production}` when `vercel env ls` reports absence; `unknown` if CLI fails | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `runPostInstallCheck` returns `ci-yml-missing-token-env` when ci.yml install step has no `GH_BKIT_TOKEN_INSTALL` env mapping | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `runPostInstallCheck` returns `vale-package-not-synced` when vale on PATH but `.vale/styles/write-good/` absent | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| `runPostInstallCheck` returns `devdeps-need-fetch` when `ws.writes` shows package.json devDeps were added in this run | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| Findings are deduplicated by `id` when both phases emit the same finding | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| Output formatter renders `--- i/N [severity] id ---\nDETECT: ...\nACTION: ...` shape per issue body | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts` |
| Integration: scratch consumer with N advisory-triggering conditions → `pnpm bkit install` exits 0 with exact checklist | Integration (Vitest) | `.agents/scripts/bkit-install.integration.test.ts` |
| Integration: scratch consumer with `package.json` removed → `pnpm bkit install` exits 1 with single blocker line, ZERO writes | Integration (Vitest) | `.agents/scripts/bkit-install.integration.test.ts` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

**Internal-only API changes (no consumer-visible breakage):**

> [!IMPORTANT]
> The bkit-install `ModuleContext.printSink: string[]` field is replaced by `ModuleContext.advisories: PreflightFinding[]`. This is internal — every call site is in `.agents/scripts/bkit-modules.ts` and is migrated in lockstep. No consumer code touches this field.

**New stable identifiers (the `id` strings on findings are the public contract for downstream tooling):**

<!-- prettier-ignore -->
| `id` | Severity | When |
| --- | --- | --- |
| `no-package-json` | blocker | `package.json` absent |
| `malformed-package-json` | blocker | `JSON.parse(package.json)` throws |
| `not-git-repo` | blocker | `--core` requested AND `.git/` absent |
| `husky-no-markers-precommit` | advisory | `.husky/pre-commit` exists without bkit markers |
| `husky-no-markers-prepush` | advisory | `.husky/pre-push` exists without bkit markers |
| `prettierignore-no-markers` | advisory | `.prettierignore` exists without bkit markers |
| `lint-prose-f9-vulnerable` | advisory | `lint:prose` script lacks write-good guard |
| `bkit-version-major-downgrade` | advisory | `.bkit-version` major > installing major |
| `gh-bkit-token-missing-shell` | advisory | `process.env.GH_BKIT_TOKEN_INSTALL` unset |
| `npmrc-missing-gh-packages` | advisory | `.npmrc` missing registry/auth lines |
| `gh-bkit-token-secret-missing` | advisory | `gh secret list` confirms absent |
| `gh-bkit-token-secret-unknown` | advisory | `gh` unavailable / unauthed / not GH repo |
| `vercel-env-missing-preview` | advisory | `vercel env ls preview` lacks token |
| `vercel-env-missing-production` | advisory | `vercel env ls production` lacks token |
| `ci-yml-missing-token-env` | advisory | ci.yml install step has no env mapping |
| `vale-package-not-synced` | advisory | vale on PATH; `.vale/styles/write-good/` absent |
| `devdeps-need-fetch` | advisory | bkit added new devDeps in this run |

**Output format change:** The post-install banner gains `[severity] {id}` markers in each `--- i/N ---` divider. Consumers who grep for the literal `--- 1/3 ---` string will still match (the divider format is `--- i/N [severity] id ---`).

> [!WARNING]
> **`bkit-install.ts main()` exit-code change:** Previously `bkit install` only exited 1 from inside specific modules. Now Phase 1 can exit 1 BEFORE module dispatch on any blocker. Consumer wrappers that always expected `install` to write something will need to inspect stderr for `[blocker]` lines.

**No changes to:** CLI surface (verbs, flags), module registry, write-allowlist, marker syntax, `WriteSet` shape.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Rejected approach | Why rejected |
| --- | --- |
| Keep `printSink: string[]`, add a parallel `findings: PreflightFinding[]` | Two parallel sinks → drift risk; downstream tooling has to merge two shapes. Migration is mechanical (one call site per push). |
| `--strict` flag promoting advisories to blockers | Out of scope per issue body. Consumer can run `bkit check` (already exit-1-on-drift) for the same effect. |
| Auto-apply fixes (e.g. rewrite `lint:prose` in place) | Violates consumer-value-wins. The whole point of advisories is the consumer/AI decides. |
| Vercel env detection via `@vercel/sdk` | Heavy dep for one detector; shell-out to `vercel env ls` matches existing `gh secret list` pattern (return `present`/`missing`/`unknown`). |
| Telemetry / opt-out registry for advisories | Out of scope. May be revisited if advisory fatigue becomes real. |

**Future phase recommendations:**

- BAR-139 (`bkit uninstall`) can re-use the `PreflightFinding` shape for the symmetric removal advisory output (same banner formatter).
- A future `bkit doctor` verb could call `runPreflight` + `runPostInstallCheck` standalone (no install) for on-demand health checks.

## Out of Scope

- Auto-applying any advisory's `ACTION` (consumer-value-wins).
- `vercel env` detection beyond shell-out to `vercel env ls` (no SDK).
- Telemetry, advisory snoozing, or per-finding opt-out.
- A `--strict` mode promoting advisories to blockers.
- Adding new modules. The plan only re-shapes the install lifecycle.

## Merge Method

**Merge method: always squash.** Plans MUST NOT propose `rebase` or `merge-commit` as the integration method into `dev`. `bkit-ship.md` Step 3 is hardcoded to `gh pr merge --squash --delete-branch --body ""`. If a plan needs commit-boundary preservation for ordering reasons, decompose into separate PRs rather than requesting a non-squash merge.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `ModuleContext.printSink: string[]` (string-array advisory channel) in `.agents/scripts/bkit-modules.ts` | `ModuleContext.advisories: PreflightFinding[]` | DELETE | Replacement is structured `{id, severity, detect, action}`; every push site is internal and migrated in this PR. No consumer dependency. |
| `printSink` parameter on `writeTier3` and `ensurePackageJsonScripts` / `ensurePackageJsonDevDeps` consumers in `.agents/scripts/bkit-tiers.ts` (signature `printSink: string[]`) | `advisories: PreflightFinding[]` parameter | DELETE | Internal helper; co-modified. Each existing `printSink.push("[bkit] ...")` becomes `advisories.push({ id, severity: "advisory", detect, action })`. |
| Post-install flush block in `bkit-install.ts main()` (lines 686–697 — banner + `--- i/N ---` formatter) | `formatChecklist(findings)` exported from `.agents/scripts/bkit-postinstall.ts` | DELETE | Inline-block replaced by reusable formatter so BAR-139 (`bkit uninstall`) can call the same renderer. |
| `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` / `GH_BKIT_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS` / `VERCEL_AUTH_INSTRUCTIONS` constants in `.agents/scripts/bkit-modules.ts` (multi-line `printSink` payload strings) | Per-detector `PreflightFinding.action` strings co-located in `.agents/scripts/bkit-postinstall.ts` | DELETE | These constants exist only to be `printSink.push`-ed from `runCiModule`; ownership moves to the post-install detector that emits the matching finding. The CI module no longer pushes auth instructions directly. |

> [!CAUTION]
> **Default = `DELETE`.** `RETAIN-WITH-REASON` only allowed for:
> (a) external contract — atomic migration impossible (third-party callers, public API);
> (b) staged rollout with kill-date + follow-up issue link.
>
> NEVER accept `@deprecated` + still exported as a resolution. Each `DELETE` row MUST be mirrored as `[DELETE] path/to/file` in `Architecture & Component Changes` AND as a removal task in `Agent Execution Runbook`.

## Security & Privacy

- [x] **No new API route** — install is a CLI; no HTTP surface.
- [x] **No new DB table/column** — N/A (bkit has no DB).
- [x] **No role-gated mutation** — N/A.
- [x] **User input** — argv parsing unchanged; no new input surfaces.
- [x] **PII** — token detectors check **presence only** via `process.env.GH_BKIT_TOKEN_INSTALL !== ""`, `gh secret list --json name`, and `vercel env ls`. The token VALUE is never read, logged, or echoed. Snapshot tests assert `ACTION` strings reference `${GH_BKIT_TOKEN_INSTALL}` interpolation form, never a raw value.
- [x] **No redirect URL / webhook / new secret** — N/A.

_Single PII-relevant rule: detectors MUST never include the token value in any log, advisory, or test fixture. Code-review-grep for `process.env.GH_BKIT_TOKEN_INSTALL` usage on read paths in detectors — must be `Boolean(...)` or `?.length` only._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new packages required. `pnpm-lock.yaml` should not change.
- [ ] **Dependency Versions:** Confirm `tsc --version` and `vitest --version` already in repo. No CLI bumps.
- [ ] **User Context:** Read/write access to `.agents/scripts/`, `.agents/scripts/*.test.ts`, `README.md`.
- [ ] **Pending Blockers:** Query Linear `label: blocker` — confirm none reference BAR-141 or `bkit-install.ts`.
- [ ] **Project Context:** Read `docs/knowledge.md` for prior install gotchas (BAR-138 F7/F8/F9 history) and `docs/decisions.md` for the consumer-value-wins decision (referenced multiple times in `bkit-modules.ts`).
- [ ] **Testing & Quality:** Vitest unit per detector; one Vitest integration scaffolding a tmp consumer dir under `tmp/` (per `.agents/rules.md` — never `/tmp`). Conform to `docs/testing.md` naming.
- [ ] **Prerequisite Plans:** None. BAR-138 (v0.4.0 down-payment) already shipped; this is the full feature.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars:** No new secrets. Detectors READ `process.env.GH_BKIT_TOKEN_INSTALL` only to test presence (boolean) — never log the value.
- [ ] **Architecture:** New files live alongside existing peers in `.agents/scripts/` — no new package, no new monorepo topology change. Consistent with `bkit-install.ts` / `bkit-modules.ts` / `bkit-tiers.ts` colocation.
- [ ] **Observability:** Detectors emit structured `console.error("[bkit-install] {Message}", payload)` ONLY on internal errors (e.g. `gh secret list` returning non-zero AND non-empty stderr that isn't `command not found`). Findings themselves are emitted via the checklist formatter, NOT via `console.error`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None. bkit has no database. All "state" is on-disk files in the consumer repo (`package.json`, `.husky/*`, `.npmrc`, `.bkit-version`, `.vale/styles/`, `.github/workflows/ci.yml`).

### Data Schema Changes

None.

## Architecture & Component Changes

### CLI / Install Flow

#### [NEW] `.agents/scripts/bkit-preflight.ts`

- **Purpose:** Phase 1 — read-only detection BEFORE any writes.
- **Exports:**
  - `interface PreflightFinding { id: string; severity: "blocker" | "advisory"; detect: string; action: string; }` — single shape for both phases.
  - `runPreflight(modules: Set<ModuleFlag>, cwd?: string): { blockers: PreflightFinding[]; advisories: PreflightFinding[] }` — pure function (cwd defaults to `process.cwd()`); no writes; no env mutation.
- **Blocker detectors (3):**
  - `detectNoPackageJson(cwd)` — `!fs.existsSync("package.json")`.
  - `detectMalformedPackageJson(cwd)` — try/catch around `JSON.parse(fs.readFileSync("package.json", "utf-8"))`.
  - `detectNotGitRepo(cwd, modules)` — only fires when `modules.has("core")` AND `!fs.existsSync(".git")`.
- **Advisory detectors (4+):**
  - `detectHuskyNoMarkers(cwd, hookName: "pre-commit" | "pre-push")` — file exists; lacks `<!-- bkit:start -->` and `# bkit:start` (both styles).
  - `detectPrettierignoreNoMarkers(cwd)` — same shape on `.prettierignore`.
  - `detectLintProseF9Vulnerable(cwd)` — `package.json#scripts.lint:prose` exists; lacks the literal substring `[ -d .vale/styles/write-good ]`.
  - `detectBkitVersionMajorDowngrade(cwd, installingVersion)` — `.bkit-version` parsed major > installing major.
- **Internal helper:** `hasBkitMarkers(content: string): boolean` — checks both `<!-- bkit:start -->` and `# bkit:start` (uses the same anchored-marker logic as `bkit-install.ts` `findLineAnchoredMarkers`).
- **No imports from `bkit-modules.ts`** — this file is upstream of dispatch. Imports `ModuleFlag` from `bkit-cli.ts`.

#### [NEW] `.agents/scripts/bkit-postinstall.ts`

- **Purpose:** Phase 3 — re-detect AFTER writes; produce the unified output.
- **Exports:**
  - `runPostInstallCheck(preflightAdvisories: PreflightFinding[], ws: WriteSet, modules: Set<ModuleFlag>, cwd?: string): PreflightFinding[]` — re-runs token-surface + ci.yml + vale-sync + devDeps detection, then dedupes against `preflightAdvisories` by `id` (Phase 3 wins on conflict because re-detection is more accurate).
  - `formatChecklist(findings: PreflightFinding[]): string` — pure renderer; returns the multi-line banner string (no `console.log` inside; caller logs). Format matches the issue body verbatim.
- **Token-surface detectors (4):**
  - `detectShellToken()` — returns `present | missing` based on `Boolean(process.env.GH_BKIT_TOKEN_INSTALL)`. Never reads value.
  - `detectNpmrcAuth(cwd)` — greps `.npmrc` for both `@cbartens:registry=` AND `_authToken=${GH_BKIT_TOKEN_INSTALL}`. `unknown` if `.npmrc` absent (covered by Vercel-side already, but distinct id).
  - `detectGhSecret()` — wraps existing `checkBkitTokenSecret()` from `bkit-modules.ts` (move it here). Returns `present | missing | unknown`.
  - `detectVercelEnv(env: "preview" | "production")` — `execSync("vercel env ls " + env)`; greps for `GH_BKIT_TOKEN_INSTALL`. Returns `present | missing | unknown` (unknown if CLI absent / unauthed / no `vercel.json`). Skip both detectors silently if `detectVercelProject(cwd)` is false.
- **Other post-install detectors (3):**
  - `detectCiYmlMissingTokenEnv(cwd)` — read `.github/workflows/ci.yml` if present; YAML-grep for an `Install` step without `env: GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}`. Returns `null` if no ci.yml or step structure unrecognised (no false positives on bespoke layouts).
  - `detectValePackageNotSynced(cwd)` — `vale --version` shells out (5s timeout); if non-zero, return null. If zero, check `fs.existsSync(".vale/styles/write-good")`.
  - `detectDevDepsNeedFetch(ws)` — scan `ws.writes` for any entry whose `path === "package.json"` AND was added as a devDep this run. The `ensurePackageJsonDevDeps` helper already returns `added: string[]`; thread that through `WriteSet` (extend `WriteEntry` with optional `devDepsAdded?: string[]`).
- **Imports from `bkit-modules.ts`:** `detectVercelProject` (move it here too) and the `WriteSet` type from `bkit-tiers.ts`.

#### [MODIFY] `.agents/scripts/bkit-install.ts`

- **Existence Check:** Confirmed at `.agents/scripts/bkit-install.ts` (lines 1–717).
- Replace `printSink: string[]` in the `ctx` constructor (line 653) with `advisories: PreflightFinding[]`.
- Insert Phase 1 between token resolution (line 638) and `dispatchModules` (line 668):
  - `const { blockers, advisories: preflightAdvisories } = runPreflight(modules);`
  - If `blockers.length > 0`, print each blocker via `formatChecklist([...blockers])`, exit 1 BEFORE creating `ws` or calling `dispatchModules`.
  - Otherwise seed `ctx.advisories = [...preflightAdvisories]`.
- Insert Phase 3 between `dispatchModules` (line 668) and the existing checklist flush (line 686):
  - `const postFindings = runPostInstallCheck(ctx.advisories, ws, modules);`
  - In `dryRun` (`bkit check`) mode: skip Phase 3 (preserves "check is read-only" semantics — already documented in code comment at line 911 of `bkit-modules.ts`).
- Replace inline checklist formatter (lines 686–697) with `console.log(formatChecklist(postFindings))`.
- Move `checkBkitTokenSecret` and `detectVercelProject` OUT of `bkit-modules.ts` into `bkit-postinstall.ts`. `runCiModule` no longer pushes auth instructions — Phase 3 owns them.

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** Confirmed at `.agents/scripts/bkit-modules.ts` (lines 1–1190).
- Replace `printSink: string[]` field in `ModuleContext` interface (line 102) with `advisories: PreflightFinding[]` (import type from `bkit-preflight.ts`).
- Migrate every `printSink.push("[bkit] ...")` call site to `ctx.advisories.push({ id, severity: "advisory", detect, action })` — preserve the message text inside `action`, summarise condition in `detect`. Sites:
  - `runCoreModule` first-install message → `id: "first-install-postinstall-steps"`.
  - `runCiModule` package.json missing/malformed messages → `id: "ci-package-json-{missing,malformed}"`.
  - `runCiModule` no test script → `id: "ci-no-test-script"`.
  - `runCiModule` `GH_BKIT_TOKEN_INSTALL_MISSING/UNKNOWN_INSTRUCTIONS` → REMOVE (Phase 3 owns these now).
  - `runCiModule` `VERCEL_AUTH_INSTRUCTIONS` → REMOVE (Phase 3 owns these now).
  - `runLintModule` package.json missing/malformed → `id: "lint-package-json-{missing,malformed}"`.
  - `runLintModule` devDeps added → `id: "devdeps-need-fetch"` (Phase 3 also detects this — dedupe wins).
  - `runLintModule` write-good package hint → `id: "vale-sync-recommended"`.
  - `runGitHooksModule` package.json missing/malformed/preserved-prepare → `id: "git-hooks-package-json-{missing,malformed,preserved-prepare}"`.
  - `runGitHooksModule` husky devDep added → `id: "git-hooks-husky-devdep-added"`.
- DELETE constants no longer pushed: `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS`, `GH_BKIT_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS`, `VERCEL_AUTH_INSTRUCTIONS` (their text moves into Phase 3 detector `action` fields verbatim — same instructions, new owner).
- DELETE `checkBkitTokenSecret` (moved to `bkit-postinstall.ts`).
- DELETE `detectVercelProject` (moved to `bkit-postinstall.ts`).

#### [MODIFY] `.agents/scripts/bkit-tiers.ts`

- **Existence Check:** Confirmed at `.agents/scripts/bkit-tiers.ts`.
- `writeTier3` signature `printSink: string[]` → `advisories: PreflightFinding[]`. Each push becomes a structured finding with `id: "tier3-merge-suggested-{dst-basename}"`.
- `ensurePackageJsonDevDeps` return shape gains nothing (already returns `added: string[]`); caller threads `added` into the `WriteSet` for Phase 3's `devdeps-need-fetch` detector.
- Optional: extend `WriteEntry` with `devDepsAdded?: string[]` for Phase 3's `devdeps-need-fetch` lookup.

### Tests

#### [NEW] `.agents/scripts/bkit-preflight.test.ts`

- Vitest unit suite. One `describe()` per detector. Each describe has a positive case (detector fires) and a negative case (detector silent). Uses `tmp/bkit-preflight-{uuid}/` scratch dirs (never `/tmp`).

#### [NEW] `.agents/scripts/bkit-postinstall.test.ts`

- Vitest unit suite. Mocks `execSync` for `gh secret list` / `vercel env ls` / `vale --version`. Pure-fn tests for `formatChecklist` (snapshot match against the issue body's example).

#### [NEW] `.agents/scripts/bkit-install.integration.test.ts`

- Vitest integration. Spawns `node --import tsx .agents/scripts/bkit-install.ts install --full` against scratch consumer dirs. Two cases: (a) blocker exit 1; (b) full happy-path with N seeded advisory triggers.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `README.md` | Add `## Install lifecycle` section: documents the three phases (preflight blockers → install → post-install advisories), the `PreflightFinding` shape, and the stable `id` registry. Cross-links to existing `## Consumer CI auth` for the four-surface token sweep. |
| `docs/decisions.md` | APPEND ADR: "BAR-141 — structured PreflightFinding replaces printSink" — single-shape advisories, internal-only API, no consumer breakage, dedupe by id with Phase 3 wins. |
| `docs/knowledge.md` | APPEND gotcha: "Phase 3 runs ONLY in install (not check) — `bkit check` stays read-only by design; check exits 1 on drift WITHOUT a checklist banner (the drift IS the actionable signal)." |
| `.agents/docs.md` | No change — no new docs added; only code + tests + README. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit has no DB. |
| **Code** | `git revert {COMMIT}` of the merge SHA. | Single PR / single squash commit per Merge Method. |
| **Risk window** | Zero — install regressions are local to consumers running `pnpm bkit install` after the new version is published. v0.4.x is sticky in lockfiles until a consumer runs `pnpm update @cbartens/bkit`. | A bumped version bump (v0.5.0) lets consumers stay on v0.4.x indefinitely until they choose to upgrade. |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a Linear issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its specific verification and checking its box) before starting the exact next task in the list.
> **Progress Updates:** After checking off each major task, post a structured summary as a Linear comment on the issue per `.claude/workflows/conventions.md`.

### Phase A — Foundation (interface + helpers)

- [ ] **Task A1:** Create `.agents/scripts/bkit-preflight.ts` with `PreflightFinding` interface and a stub `runPreflight` returning `{ blockers: [], advisories: [] }`. Export `hasBkitMarkers(content)` helper. (Verify: `tsc --noEmit` passes.)
- [ ] **Task A2:** Create `.agents/scripts/bkit-postinstall.ts` with `runPostInstallCheck` stub returning `[]` and `formatChecklist(findings)` renderer. (Verify: `tsc --noEmit` passes.)

### Phase B — Migrate `printSink` → `advisories`

- [ ] **Task B1:** In `bkit-modules.ts` `ModuleContext`, replace `printSink: string[]` with `advisories: PreflightFinding[]`. Update `bkit-install.ts` ctx construction.
- [ ] **Task B2:** Migrate every `printSink.push("[bkit] ...")` in `bkit-modules.ts` to `ctx.advisories.push({ id, severity: "advisory", detect, action })`. Use the id table from § Breaking Changes & Naming Review.
- [ ] **Task B3:** In `bkit-tiers.ts`, replace `printSink: string[]` parameter on `writeTier3` (and any helper) with `advisories: PreflightFinding[]`. Update callers in `bkit-modules.ts`.
- [ ] **Task B4:** Replace inline checklist formatter in `bkit-install.ts main()` (lines 686–697) with `console.log(formatChecklist(advisories))`. (Verify: dry-run on bkit dogfood repo prints same banner format.)

### Phase C — Phase 1 Preflight (blockers)

- [ ] **Task C1:** Implement `detectNoPackageJson` in `bkit-preflight.ts` + unit test (positive + negative).
- [ ] **Task C2:** Implement `detectMalformedPackageJson` + unit test.
- [ ] **Task C3:** Implement `detectNotGitRepo` (gated on `--core`) + unit test (3 cases: core+no-git, core+git, no-core+no-git).
- [ ] **Task C4:** Wire `runPreflight` to call all three blocker detectors and accumulate findings.
- [ ] **Task C5:** In `bkit-install.ts main()`, after `parseArgs` and BEFORE `resolveTokens`, call `runPreflight(modules)`. If `blockers.length > 0`, print via `formatChecklist(blockers)` and `process.exit(1)`. (Verify: `package.json`-removed scratch dir produces single-line blocker exit.)

### Phase D — Phase 1 Preflight (advisories)

- [ ] **Task D1:** Implement `detectHuskyNoMarkers("pre-commit")` + unit test. Call also for `pre-push`. (Use `hasBkitMarkers` helper.)
- [ ] **Task D2:** Implement `detectPrettierignoreNoMarkers` + unit test.
- [ ] **Task D3:** Implement `detectLintProseF9Vulnerable` + unit test (positive: F9-vulnerable string; negative: bkit's current guarded form).
- [ ] **Task D4:** Implement `detectBkitVersionMajorDowngrade` + unit test (parse `MAJOR.MINOR.PATCH` from `.bkit-version`; compare majors).
- [ ] **Task D5:** Wire all advisory detectors into `runPreflight`. Seed `ctx.advisories` with `preflightAdvisories` in `bkit-install.ts main()`.

### Phase E — Phase 3 Post-install (token-surface)

- [ ] **Task E1:** Move `checkBkitTokenSecret` from `bkit-modules.ts` to `bkit-postinstall.ts`; rename internal contract to `detectGhSecret` returning `"present" | "missing" | "unknown"` + unit test (mock `execSync`, three cases).
- [ ] **Task E2:** Implement `detectShellToken` (presence-only — never read value) + unit test (set/unset env).
- [ ] **Task E3:** Implement `detectNpmrcAuth` + unit test (positive, missing-one-line, missing-both-lines, file-absent).
- [ ] **Task E4:** Move `detectVercelProject` from `bkit-modules.ts` to `bkit-postinstall.ts`. Implement `detectVercelEnv("preview")` + `detectVercelEnv("production")` (skip if no Vercel project) + unit tests (mock `execSync`, three cases each).

### Phase F — Phase 3 Post-install (other detectors)

- [ ] **Task F1:** Implement `detectCiYmlMissingTokenEnv` + unit test (positive: ci.yml install step has no `env: GH_BKIT_TOKEN_INSTALL`; negative: env present; null: no ci.yml).
- [ ] **Task F2:** Implement `detectValePackageNotSynced` + unit test (mock `execSync`, three cases: vale absent, vale present + write-good present, vale present + write-good absent).
- [ ] **Task F3:** Extend `WriteEntry` with optional `devDepsAdded?: string[]`; update `ensurePackageJsonDevDeps` consumers in `bkit-modules.ts` to pass it through. Implement `detectDevDepsNeedFetch(ws)` + unit test.
- [ ] **Task F4:** Wire all detectors into `runPostInstallCheck`. Implement dedupe-by-id (Phase 3 wins). Implement skip-on-dry-run guard.

### Phase G — Wiring + Integration

- [ ] **Task G1:** In `bkit-install.ts main()`, between `dispatchModules` and the checklist flush, call `runPostInstallCheck(ctx.advisories, ws, modules)`. Replace inline flush with `console.log(formatChecklist(postFindings))`.
- [ ] **Task G2:** DELETE the now-unused `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS`, `GH_BKIT_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS`, `VERCEL_AUTH_INSTRUCTIONS` constants from `bkit-modules.ts`. Re-create them as the `action` text on the matching Phase 3 detectors (verbatim text — same instructions). Confirm the install run on a healthy bkit dogfood repo emits zero advisories.
- [ ] **Task G3:** Write `.agents/scripts/bkit-install.integration.test.ts` — two scenarios per Derived Test Matrix (blocker exit 1; full advisory checklist).

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every task A1–G3 above independently verified and checked off. Every `printSink.push` call site has been migrated. Three deleted constants no longer appear in `bkit-modules.ts` (`grep -n GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS .agents/scripts/bkit-modules.ts` returns nothing).

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):**
>
> - Per detector: Vitest unit, positive + negative case minimum.
> - Cross-detector behaviours (dedupe, skip-on-dry-run, blocker-short-circuit): integration test driving `bkit install` end-to-end against a tmp consumer dir under `tmp/`.
> - Snapshot test for `formatChecklist` against the issue-body example output.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each row matches a Phase C/D/E/F/G subtask above. Re-walk the table; add tasks if any row is uncovered.
- [ ] **Update existing tests:** Search for tests that import `printSink` from `bkit-install.ts` or assert on its shape — none expected (it's runtime-internal), but verify with `grep -r "printSink" .agents/scripts/`.
- [ ] **Write new tests:** All listed in Phase C–G above. Run `pnpm test` locally to confirm green.
- [ ] **Verify observability:** Detectors emit `console.error("[bkit-install] {Message}", payload)` only on internal errors (e.g. `gh secret list` exit > 0 with non-empty stderr that isn't `command not found`). Findings go through `formatChecklist`, never `console.error`.
- [ ] **Update documentation:** Apply the README + `docs/decisions.md` + `docs/knowledge.md` edits per § Documentation Updates. Rewrite prose; do NOT lazy-bullet-append.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `📚 Documentation Updates` completed. `.agents/docs.md` still accurate (no new doc files added).
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm turbo lint typecheck format:check` — must pass green.
- [ ] **Test Synchronization:** No existing tests reference `printSink` directly (verify via `grep`); if any do, migrate them to `advisories`.
- [ ] **Build Configuration:** New test files (`*.test.ts`, `*.integration.test.ts`) follow Vitest discovery — no `tsconfig.json` `exclude` change needed.
- [ ] **Unit (`bkit-preflight.test.ts`):** Every blocker + advisory detector — positive + negative cases.
- [ ] **Unit (`bkit-postinstall.test.ts`):** Every Phase 3 detector + dedupe + `formatChecklist` snapshot.
- [ ] **Integration (`bkit-install.integration.test.ts`):** Scratch consumer scenarios per Derived Test Matrix.
- [ ] **Run all tests:** `pnpm test` — pass green. Integration test should run under default `pnpm test` (no `TEST_REAL_APIS` flag — token detectors mock `execSync`).

> [!IMPORTANT]
> **No Architectural Downgrades**: If you encounter build, compiler, or test errors during verification, NEVER resolve them via hot fixes or anti-patterns. Strictly follow industry best practices as per `docs/architecture.md` (and its reference repos) and `docs/knowledge.md`. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (`gh`, `vercel`, `npx supabase`) to verify CI/CD pipelines instead of asking users to check dashboards.

- [ ] **Step 1 — Dogfood install on bkit repo:** From `bkit/` root run `pnpm bkit install --full` against the bkit repo itself. Expected: zero advisories, exit 0, `Done. N write(s).` line followed by no banner.
- [ ] **Step 2 — Synthetic blocker:** In a `tmp/blocker-{uuid}/` scratch dir, create an empty dir (no `package.json`, no `.git/`), run `node --import tsx <bkit-root>/.agents/scripts/bkit-install.ts install --full`. Expected: exit 1, single `[blocker] no-package-json` line in the formatted output, no files written.
- [ ] **Step 3 — Synthetic advisory matrix:** In a `tmp/advisory-{uuid}/` dir, seed `package.json` (valid), `.husky/pre-commit` (no markers), `.git/` (`git init`), unset `GH_BKIT_TOKEN_INSTALL`. Run `pnpm bkit install --full`. Expected: 4 numbered advisories visible — `husky-no-markers-precommit`, `gh-bkit-token-missing-shell`, `npmrc-missing-gh-packages`, `vale-package-not-synced` (if vale on PATH). Exit 0.
- [ ] **Step 4 — `bkit check` parity:** Run `pnpm bkit check --full` on the same scratch dir. Expected: same blockers fire (Phase 1 runs); Phase 3 SKIPPED (check is read-only); existing drift-detection exit-1 path unchanged.
- [ ] **Step 5 — Snapshot match:** `formatChecklist` output for a 3-finding fixture matches the example in the issue body byte-for-byte (line endings, divider widths, blank-line counts).
