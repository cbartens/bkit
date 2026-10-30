<!-- bkit:anchor
baseSha: 91c6d3c6e1a46421747a1f66df3ac54a34bfbacd
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Brand Every Consumer-Facing Name Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

**Workstreams:** none — no parent design; the plan covers issue #748 whole. Required workstream dependencies: None.

Names a consumer types or sees still lack the bkit brand (issue #748 § Narrative lists them). Facts found while planning that correct the issue text:

<!-- prettier-ignore -->
| Issue says | Codebase shows | Plan does |
| --- | --- | --- |
| `GATE_TOOL_SCRIPTS` in `.bkit/core/engine/install/manifest.ts` | No such constant; `manifest.test.ts:397` parses `.bkit/core/.bkit/templates.md` § Gate tool scripts into a test-local `GATE_TOOL_SCRIPTS` | Renames keys in the `templates.md` block; no new constant |
| `bkit-renovate.yml` / `bkit-trivy.yml` show as `Renovate` / `Trivy` | Their jobs (`renovate`, `trivy`) carry no `name:`, so the job half of the check shows the bare id | Adds `name: bkit-renovate` / `name: bkit-trivy` to the workflow and the job |
| File names under `scripts/**` already carry `bkit-` | c491ae133 renamed the ten CI template files under `.bkit/templates/scripts/ci/` and bkit's own copies; the two launchd templates (`ai.bkit.launchd.plist`, `launchd.env.example`) still lack it; consumer copies of the CI scripts keep their old names (only the `ci-scripts-old-names` advisory names them); the `bkit-stub:health` text names `health.yml` | Renames the two launchd templates (Task 2), moves unedited consumer CI-script copies in an upgrade migration (Task 8) and renames the health stub path (Task 5); guard has no exception list (Open Question 2, answered) |
| `House` named in `.bkit/instructions.md`, `bkit-supabase.md` | No `House` style hits; `bkit-supabase.md:18` names `ClickHouse` | Not touched; `House` checks are word-bounded |
| `pnpm graph:*` in `bkit-audit-duplication.md` | No hits in `.bkit/core/docs/templates/bkit-audit-duplication.md`; bkit's own `docs/templates/bkit-audit-duplication.md` project part (lines 242, 246, 249) names `pnpm graph:check`, `pnpm graph:update`, `pnpm graph:rollup` | Renamed in Task 3 |
| Copy-and-own copies are never written by bkit | `.bkit/core/.bkit/templates.md:12`, `.bkit/core/engine/install/modules/cloud.ts:57`, `:113`, `:166`, `.bkit/core/engine/install/version-file.ts:155-157` state it | Restated with the exact-shipped-text brand-migration carve-out (Tasks 7, 9) |
| Migration example: `ci-scripts-old-names` advisory | `detectCiScriptsOldNames` and `CI_SCRIPT_RENAMES` in `.bkit/core/engine/checks/after/ci-yml.ts` (c491ae133); `docs/migrations.md` row `ci-scripts-old-names` advisory | Task 8 reuses `CI_SCRIPT_RENAMES` for the move; the advisory stays for copies the migration leaves; follows the `migrateBkitLayout` / `migrateShortcutsToLite` write patterns |

Goals: rename in templates, engine text, shipped docs and bkit's own adopted copies; upgrade migrations registered in `docs/migrations.md`; a branding guard test; the rule in `.agents/rules.md` § Naming Conventions.

**Related Issues:**

- #748 — Brand every consumer-facing script, check and style name bkit-* (OPEN)
- #719 — Cloud variants: add --auto=codex and allow any tracker (OPEN)
- #745 — Enforce the authoring.md Notation rules on docs automatically (OPEN)
- #724 — Machine-wide test lock: one test run at a time across agents (OPEN; wraps `bkit:gate:*` values, edits `.bkit/core/.bkit/templates.md`)
- #489 — Own only what a workflow runs; ship the rest as templates (CLOSED)

---

## 👤 ⚠️ Acceptance Scenario

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

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Gate chains call `bkit:lint:prose` and `bkit:slop:delta` | Unit | `.bkit/core/engine/install/manifest.test.ts` | 1 |
| Gate tool scripts map `bkit:lint:prose` → `bkit ci prose`, `bkit:slop:delta` → `bkit ci slop` | Unit | `.bkit/core/engine/install/manifest.test.ts` | 1 |
| `bkit-tests-static` steps match the renamed gate parts | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | 1 |
| Upgrade renames old script keys, keeps custom values | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade rewrites `pnpm <old>` tokens in script values and the old default gate chains | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade leaves the old key when the new key exists | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| Upgrade rewrites old tokens in `.husky/*` and the CI workflow file | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 7 |
| Second upgrade and `--dry-run` write nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 4 |
| Upgrade rewrites shipped old workflow / job `name:` lines, leaves customised ones | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| Upgrade moves shipped-hash Vale rules to `Bkit/`, keeps own and edited rules in `House` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| Vale template ships `Bkit` style and `.vale.ini` names it | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 6 |
| Smoke stub is `bkit-smoke` and listens on `bkit-ci` | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | 5 |
| Branding guard: template script names running bkit code, workflow / job display names, Vale style all carry the prefix | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 6 |
| bkit's own adopted copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 6 |
| Gate advisory names the missing tool scripts by their `bkit:` names | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 1 |
| Token rewrite changes whole `pnpm <old>` / `pnpm run <old>` tokens only | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 4 |
| Token rewrite reaches `pnpm` flag forms (`pnpm -s <old>`, `pnpm run --silent <old>`) | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 4 |
| A foreign `graph*` script (value not running `scripts/graphify/bkit-`) keeps its key and its `pnpm graph` tokens | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| An old name the rewrite cannot reach (`pnpm --filter web lint:prose`) logs one warning naming file and line | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| `package.json` that is not valid JSON gets no migration write and the error reaches the upgrade output | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |
| `templates.md` lists the graphify scripts under `bkit:graph*` names | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 3 |
| Branding guard flags a seeded unprefixed script name that runs bkit code | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 3 |
| Branding guard: every file under `.bkit/templates/scripts/` and `.bkit/templates/context/` starts with `bkit-`; a seeded `scripts/foo.sh` fails | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 3 |
| `dogfood-templates.test.ts` `ADOPTED` names the renamed launchd templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 2 |
| The LaunchAgent template ships as `bkit-launchd.plist` with Label `ai.bkit.launchd` | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 2 |
| bkit's own graphify copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 3 |
| Branding guard: workflow and job display names (`name`, else the job id) pass, a seeded unprefixed job display name fails | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 5 |
| bkit's own `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml` copies match the renamed templates | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 5 |
| Branding guard: the shipped Vale style is `Bkit` | Unit | `.bkit/core/engine/audits/templates/branding.test.ts` | 6 |
| Copy-and-own migration writes record no `canonicalHashes` entry; a second upgrade writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |
| A dry-run hook / CI token migration writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 7 |
| Shipped-content CI script units move to `bkit-` names with their data files, and their `scripts/ci/` paths are rewritten | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| An edited CI script unit, or one whose `bkit-` target exists, stays and is logged | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 8 |
| A second template-file migration and a dry run write and move nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 8 |
| A copied `smoke.yml` stub moves to `bkit-smoke.yml` and listens on the CI workflow's `name:` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| The upgrade log names each renamed check with the branch-protection fix | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A copied `smoke.yml` with an existing `bkit-smoke.yml` is rewritten in place and logged | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A `renovate:` / `trivy:` job that already carries a `name:` gets none inserted | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A custom `bkit.testing.ciWorkflow` file gets the smoke- and health-stub rewrite; `bkit-ci.yml` is not looked for | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| A second check-name migration writes nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 9 |
| A dry-run check-name migration writes and moves nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 9 |
| `.vale.ini` names moved rules `Bkit.*` and lists both styles while `House` keeps files | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| A second Vale migration and a dry run write nothing | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 10 |
| Every `House` rule moved → `House/` removed, `BasedOnStyles` names `Bkit` alone, toggles read `Bkit.<rule>` | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |
| `.vale/` present, `.vale.ini` absent → rules move, no `.vale.ini` write | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 10 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

<!-- prettier-ignore -->
| Surface | Old | New | Who breaks until upgraded |
| --- | --- | --- | --- |
| package.json scripts | `lint:prose`, `slop:delta`, `graph`, `graph:<verb>` (`check`, `clean`, `graphml`, `refresh`, `rollup`, `scoped`, `tree`, `update`) | `bkit:lint:prose`, `bkit:slop:delta`, `bkit:graph`, `bkit:graph:<verb>` | Anyone typing the old names (agents, humans, consumer docs); the migration covers bkit-shipped surfaces only |
| Default gate chains (`BKIT_GATE_SCRIPTS`) | `bkit:gate:min` / `bkit:gate:static` call `pnpm lint:prose`, `pnpm slop:delta` | Call `pnpm bkit:lint:prose`, `pnpm bkit:slop:delta` | None — migration rewrites the old default chain |
| Check names (`bkit-cloud.yml`) | `context (…)`, `claude (…)`, `opencode (…)` | `bkit-cloud-context (…)`, `bkit-cloud-claude (…)`, `bkit-cloud-opencode (…)`; job ids `context`, `run`, `opencode` unchanged | A branch-protection rule requiring the old check name waits forever (Open Question 1) |
| Check names (`bkit-renovate.yml`, `bkit-trivy.yml`) | Workflow `Renovate` / `Trivy`, job display = id `renovate` / `trivy` | Workflow and job `name: bkit-renovate` / `bkit-trivy`; job ids unchanged | Same as above |
| Smoke stub (in `bkit-ci.yml` comments) | `smoke.yml`, `name: Smoke`, job `smoke` with no `name:`, `workflows: ["CI"]` | `bkit-smoke.yml`, `name: bkit-smoke`, job `name: bkit-smoke`, `workflows: [bkit-ci]` | None — the old stub never fired |
| Health stub (in `bkit-ci.yml` comments, `tools.ts` advisory) | `.github/workflows/health.yml` | `.github/workflows/bkit-health.yml` | None — stub text only; an adopted `health.yml` keeps working under its old name |
| Consumer CI script copies (`scripts/ci/`; templates already renamed by c491ae133) | `check-capstone.mjs`, `check-capstone.test.mjs`, `check-dependency-audit.mjs`, `check-dependency-audit.test.mjs`, `check-accepted-divergences.mjs`, `check-accepted-divergences.test.mjs`, `accepted-advisories.json`, `accepted-divergences.json`, `lanes/resolve-push-base.mjs`, `lanes/resolve-push-base.test.mjs` | `bkit-<same name>` in the same directory, moved by `bkit upgrade` when unedited | A consumer who edited a copy keeps the old name until moved by hand (the upgrade log and the `ci-scripts-old-names` advisory name it); callers outside the CI workflow, `.husky/*`, `bkit-trivy.yml` and package.json values keep the old path |
| Launchd templates (`.bkit/templates/scripts/launchd/`) | `ai.bkit.launchd.plist`, `launchd.env.example` | `bkit-launchd.plist`, `bkit-launchd.env.example`; Label `ai.bkit.launchd` and destinations `~/Library/LaunchAgents/ai.bkit.launchd.plist`, `~/.config/bkit/launchd.env` unchanged | None — copied by hand to machine-local paths that keep their names |
| Vale style | `.vale/styles/House/`, findings `House.<rule>` | `.vale/styles/Bkit/`, findings `Bkit.<rule>` | `.vale.ini` toggles and docs naming `House.*` |
| Engine type (internal) | `WriteEntry` `{ path, action }` in `.bkit/core/engine/install/write.ts` | Optional `unhashed?: true` added; a migration's removed or moved-away path is pushed `{ action: "write", unhashed: true }` (the `migrateShortcutsToLite` / `migrateRetiredDevLock` shape) | None — optional field, engine-internal |
| Repo rule | — | `.agents/rules.md` § Naming Conventions branding bullet | None |

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question 1:** A consumer who made a cloud, Renovate or Trivy check a required branch-protection check gets a stuck PR after the rename. What does bkit do? → **Answered (owner, 2026-10-30): C**, decision `748-renamed-check-names-warned-in-upgrade-log`.
  - **Options:** A) Release notes only — no code; a consumer who misses the note learns from a stuck PR · B) Detect-only `bkit check` advisory reading branch protection via `gh api` — catches it before the PR, but needs a token with admin read scope that most installs lack and adds a network call to `bkit check` · C) One upgrade log line per renamed check, naming old → new check and the branch-protection setting to change — shown exactly when the rename lands, no token or network, but not repeated after that run
  - **Answer:** C) — Task 9 prints the line; `CHANGELOG.md` carries the same note in Task 12
- **Open Question 2:** Which unprefixed copy-and-own files does #748 rename? c491ae133 already renamed the ten CI template files and bkit's own copies, and added the `ci-scripts-old-names` advisory for consumer copies; the two launchd templates (`ai.bkit.launchd.plist`, `launchd.env.example`) still lack `bkit-`. → **Answered (owner, 2026-10-30): A**, decision `748-upgrade-moves-unedited-ci-script-copies`.
  - **Options:** A) Rename the two launchd templates (Task 2) and move a consumer's unedited CI-script copies in the upgrade (Task 8), rewriting their `scripts/ci/` paths in the CI workflow, `.husky/*`, `bkit-trivy.yml` and package.json values; the advisory stays for edited copies · B) Keep the advisory only and rename the launchd templates — consumer copies keep their old names until someone runs the `git mv` · C) Exempt the launchd templates in the branding guard — they stay unbranded
  - **Answer:** A) — `bkit upgrade` alone carries installs onto the branded names; deferral `748-rename-unprefixed-template-script-files` is triaged to Tasks 2 and 8
- **Open Question 3:** A consumer copied the smoke stub to `.github/workflows/smoke.yml` (it never fired: `workflows: ["CI"]`). What does the migration do? → **Answered (owner, 2026-10-30): A**, decision `748-copied-smoke-stub-fixed-and-moved-to-bkit-smoke`.
  - **Options:** A) Rewrite the stub lines, set `workflows:` to the CI workflow's own `name:` (fallback `bkit-ci`) and move the file to `bkit-smoke.yml` unless that file exists — the copy starts firing under the branded name · B) Rewrite in place, keep `smoke.yml` — fires, but the file name stays unbranded · C) Advisory only — no write; the copy keeps never firing until a human acts
  - **Answer:** A) — Task 9 lands it; the existing-file guard keeps it from clobbering
- **Open Question 4:** A consumer's `scripts/graphify/*` copies keep hints naming `pnpm graph:*`, and the rollup writes those names into `docs/capabilities.md`. Rewrite them? → **Answered (owner, 2026-10-30): A**, decision `748-graphify-copy-hints-left-for-consumer`.
  - **Options:** A) Leave them; the `syncTemplateCopies` report lists the changed template copies for the consumer to adopt — no surprise rewrite of copy-and-own scripts · B) Token-rewrite `pnpm graph*` in the copies — hints match at once, but the rollup's `docs/capabilities.md` header changes on the next run and a consumer's `bkit:graph:check` goes red until they refresh
  - **Answer:** A) — no task rewrites graphify copies
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

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Rename templates only; consumers rename by hand from a detect-only advisory | Rejected | Every existing install keeps the old names until a human acts; contradicts the Narrative's "`bkit upgrade` alone is enough" and `public-installs-get-upgrade-migrations` |
| Keep old script names as aliases (`"lint:prose": "pnpm bkit:lint:prose"`) | Rejected | Two names for one script; the unbranded name stays the one people see and type, and the alias is a supersession left in place |
| Rewrite every occurrence of an old name in consumer files | Rejected | Clobbers customised workflow lines, edited Vale rules and unrelated words (`echo lint:prose`); exact shipped text and whole `pnpm` tokens only |
| Log-only migration writes (the `migrateJiraKeyName` pattern: write the file, record nothing) | Rejected | Dry-run and `bkit check` would not report the pending rename; the `unhashed` flag keeps the write recorded while keeping consumer-owned files out of `canonicalHashes` |
| Record migration writes as ordinary ws writes | Rejected | Install's postDispatch and upgrade's `updateCanonicalHashesAfterUpgrade` would hash `.husky/pre-push` (pruned on the next run by `isTemplateSetPath`, so a second-run write) and a custom-named CI workflow (a false bkit-ownership claim) |
| Rename job ids with the display names | Rejected | Breaks `needs:` chains and consumer edits; GitHub shows the display name |
| Detect required branch-protection checks via `gh api` (Open Question 1 B) | Not recommended | Needs admin read scope most tokens lack; the upgrade log line reaches the person at the moment the name changes |
| One branding guard across every shipped surface (docs prose included) | Future phase | This plan guards template scripts, workflow / job display names, the Vale style and template file names; prose references are covered by the Task 11 / Task 12 grep `DONE WHEN`s |

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Generic stack scripts (`typecheck`, `lint`, `format:check`, `test`, `build`, `lint:slop`, `prepare`), file names a third-party tool fixes (`.oxlintrc.json`, `dependabot.yml`, `.vale.ini`, `.lintstagedrc.json`, `.serena/project.yml`, `slop-scan.config.json`, `.husky/*`), engine-internal names (`.bkit/core/engine/shared/bkit-latest.ts`), job ids | Issue #748 § Out of Scope declares them outside the rule; Success Criterion 1 names the generic scripts as keeping their names; no criterion, scenario or test row needs them renamed | Issue #748 § Out of Scope; deferral `748-names-outside-the-branding-rule` |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `--auto=codex` cloud variant adds a `codex` job to `bkit-cloud.yml` | #719 (OPEN, plan PLANNED) | Task 5 job display names, Task 9 check-name migration, branding guard | Keep separate; whichever lands second names the job `bkit-cloud-codex (…)` and rebases; the guard enforces it |
| Enforce `authoring.md` Notation rules with new Vale rules | #745 (OPEN) | Task 6 style rename; new rules go in `Bkit/`, not `House/` | Keep separate; note on #745 that the style is `Bkit` once this lands |
| Generated `docs/capabilities.md` drifts when engine changes merge without a refresh | `docs/failures.jsonl` `capability-register-drift-shipped-by-pr-708-reds-dev-capstone` (OPEN; its remediation names `pnpm graph:refresh`) | Every engine-touching task refreshes `docs/capabilities.md` | Keep separate; this plan refreshes it for its own engine edits, the CI-side fix and the remediation's script name belong to the failure's owner |
| Machine-wide test lock wraps `bkit:gate:*` values | #724 (OPEN) | `bkit:gate:*` values (Tasks 1, 4), `.bkit/core/.bkit/templates.md` § Gate tool scripts, `.bkit/templates/scripts/ci/` (Task 2) | Keep separate; whichever lands second rebases; Task 4 tests a wrapped chain |
| Gate templates pass test workers | `docs/deferrals.jsonl` `724-gate-templates-pass-test-workers` (OPEN) | Gate-script json block in `.bkit/core/.bkit/templates.md` (Task 1) | Keep separate |
| Pre-push lint / typecheck scope differs from CI's whole-repo run | `docs/deferrals.jsonl` `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo` (OPEN) | `.bkit/templates/.husky/pre-push` (Tasks 1, 2; migrated in Tasks 7, 8) | Keep separate |
| Standalone `resolve-push-base` test times out under the full gate | `docs/failures.jsonl` `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate` (OPEN) | `lanes/resolve-push-base.test.mjs` → `lanes/bkit-resolve-push-base.test.mjs` (Task 2) | Keep separate; the rename moves the file the failure names, so its owner updates the path |

## Security & Privacy

- [ ] **New API Route** — n/a.
- [ ] **New DB Table/Column** — n/a.
- [ ] **Role-Gated Mutation** — n/a.
- [ ] **User Input** — n/a; the migrations read consumer files the install already trusts (`package.json` through `parseJson`, line matches on exact shipped text, sha256 compares); no new input schema.
- [ ] **PII** — n/a; log lines name file paths and script / check names only.
- [ ] **Redirect URL** — n/a.
- [ ] **Webhook** — n/a.
- [ ] **New Secret/Env Var** — n/a.

None — no new routes, DB writes, secrets, or user input. Per `docs/security.md`: no `execSync`; the Vale and CI-script hash tables are computed at build time from release tags and committed as constants, so the migrations run no git or shell command.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no new package; `yaml` (`parseYaml`, already declared) and `node:crypto` cover the tests and the hash table; `package.json` / `pnpm-lock.yaml` in sync after the script-key renames (script keys do not touch the lockfile).
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` shows only dev bumps that do not block the build (`oxlint-tsgolint`, `@types/node`, `vite`). Toolchain: node v24.16.0, pnpm 10.34.7, vale 3.24.0, graphify 0.9.93 (matches the pinned `graphifyy[sql]==0.9.93`), actionlint 1.7.12; `dist/cli.js` present.
- [ ] **Existing-Solution Search (reuse over duplicate):** in-repo searches for package.json key migrations, file-token rewrites, release-hash tables, canonical-hash exclusion and naming guards recorded in `Reuse Inventory`.
- [ ] **User Context:** read access confirmed to every file the runbook names; release tags readable (`git tag -l 'v*'`, `git log --all --follow --name-only`, `git show <tag>:<path>`) for the Vale and CI-script hash tables; no user information missing beyond the four Open Questions.
- [ ] **Project Context:** read `docs/decisions.jsonl` `public-installs-get-upgrade-migrations`, `repo-rule-no-migration-code-unasked`, `489-no-migration-code`, `437-local-gate-scripts`; `docs/knowledge.jsonl` `kn-13-canonicalhashes-vs-tier3hashes-distinct-purposes-shar`, `kn-29-bkit-lints-itself-with-a-narrower-lint-prose-than-it-ships`, `kn-36-tier-3-seed-or-print-upgrade-reach-gap-deleting-bkit-mode`, `dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit` (mirrors regenerate once in Task 12; no push before it); `docs/failures.jsonl` `capability-register-drift-shipped-by-pr-708-reds-dev-capstone` (OPEN — refresh `docs/capabilities.md` in the same change as engine edits).
- [ ] **Testing & Quality:** Unit tier for pure rewrites and template content, Integration tier (real tmpdir, real `bkit` via `requireTsx()`, no fs mocks) for every migration, per `docs/testing.md` tier-selection rubric; no E2E or `@live` row.
- [ ] **Prerequisite Plans:** None. #719 (`docs/plans/202610/719-cloud-variants-add-plan.md`, PLANNED) edits `bkit-cloud.yml`; whichever lands second rebases onto the other's job names.

### Conditional

- [ ] **Secrets & Env Vars:** n/a — no new credential; Open Question 1 option B (needs admin read scope) is not recommended.
- [ ] **Schema State:** n/a — no database.
- [ ] **Architecture & UI:** `docs/architecture.md:83` places template guard tests in `.bkit/core/engine/audits/templates/`; no UI.
- [ ] **Observability:** `docs/observability.md` limits observability to CLI stdout / stderr with one prefix per module; migration lines reuse the caller's `logPrefix` (`[bkit-install]` / `[bkit-upgrade]`) in the `${logPrefix} ${tag}core: …` form of `migrateShortcutsToLite` / `migrateJiraKeyName`; skipped pairs and edited Vale rules go to `console.warn`. No new prefix, log name or span.
- [ ] **Notifications:** n/a — no alerts or toasts.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** applicable rows verified, or `None` justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision`; every `NEW` cites its reason.
- [ ] **Gate 1 - Verified:** Core items and applicable Conditional items checked.

## Data Schema Integration

None — bkit has no database; the plan reads and writes consumer files only.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Rename package.json script keys, keep values | `.bkit/core/engine/install/modules/core.ts` | `grep -n "function migrate" core.ts`; references to `seedCorePackageJsonScripts`; `docs/migrations.md` § Migrations | `migrateBkitLayout` + `BKIT_LAYOUT_MOVES` (old→new key table, existing new key wins, original indent kept via `writePackageJsonLike`) — moves `bkit.*` keys, not `scripts` keys | EXTEND | Add `BKIT_SCRIPT_RENAMES` and `migrateBrandedScriptNames(dryRun, ws, logPrefix): boolean` beside it, same table shape and return contract; `graph*` entries carry a value guard (runs `scripts/graphify/bkit-`); called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts` |
| Rewrite whole `pnpm [flags] [run] <old>` tokens | `.bkit/core/engine/install/modules/core.ts` | `grep -n "pnpm (?:run )" core.ts`; `gateLeafScripts`, `PNPM_NOT_A_SCRIPT` | `gateLeafScripts` regex `\bpnpm (?:run )?([\w:-]+)` reads leaf names, never rewrites | EXTEND | Export a pure `renameScriptTokens(text, renames)` in `core.ts` on the same token grammar widened to value-less `-x` / `--x` flags before and after `run`, plus `findOldScriptNames(text, renames)` for the residual warning; `gateLeafScripts` unchanged |
| Seed new gate chains | `.bkit/core/engine/install/manifest.ts` | references to `BKIT_GATE_SCRIPTS`; `.bkit/core/.bkit/templates.md` § Gate tool scripts | `BKIT_GATE_SCRIPTS` (add-if-missing via `ensurePackageJsonScripts` in `write.ts`) | EXTEND | Chain values and comments name `bkit:lint:prose` / `bkit:slop:delta` |
| Record a migration write without a canonical hash | `.bkit/core/engine/install/write.ts` | references to `WriteEntry`; `grep -n "canonicalHashes" install/modules/core.ts commands/install/upgrade.ts install/version-file.ts`; `migrateJiraKeyName` | `WriteEntry` `{ path, action }`; install postDispatch hash loop in `core.ts`; `updateCanonicalHashesAfterUpgrade` in `upgrade.ts`; `migrateJiraKeyName` writes without recording | EXTEND | Optional `unhashed?: true` on `WriteEntry`; both collectors skip it. The Jira pattern drops the write from dry-run and `bkit check` (decision `748-brand-migration-rewrites-adopted-copies-exact-shipped-text`) |
| Find the consumer's CI workflow file | `.bkit/core/engine/shared/settings.ts` | references to `ciWorkflowPath` | `ciWorkflowPath(root)` → `.github/workflows/${bkit.testing.ciWorkflow}`, default `bkit-ci.yml` | EXTEND (call as-is) | Migrations read the path from it; no new resolver |
| Rewrite husky / CI tokens on install and upgrade | `.bkit/core/engine/install/modules/core.ts` | references to `runBkitDocs`; `migrateShortcutsToLite`, `migrateRetiredDevLock`, `migrateLedgerSchema` call sites | `runBkitDocs` runs on install (`runCoreModule`) and upgrade (`renderManagedOutputs`) and already hosts file migrations | EXTEND | `migrateBrandedFileTokens(dryRun, ws, logPrefix)` called from `runBkitDocs` |
| Rewrite exact shipped workflow `name:` lines and the smoke stub | `.bkit/core/engine/install/modules/core.ts` | `grep -rn -e "name: Trivy" -e "name: Renovate" .bkit/core/engine`; `checks/after/ci-yml.ts` smoke advisory | None rewrites workflow lines; `ci-yml.ts` only reads | EXTEND | `migrateBrandedCheckNames(dryRun, ws, logPrefix)` in `core.ts`, called from `runBkitDocs` |
| Match Vale rules against shipped releases | `.bkit/core/engine/install/modules/core.ts` | `grep -rn "HASHES" .bkit/core/engine/install`; `RETIRED_DRIVER_HASHES` in `write.ts:398` | `RETIRED_DRIVER_HASHES` (sha256 per shipped file, `sha256()` helper) — for hook drivers | EXTEND | `SHIPPED_HOUSE_RULE_HASHES` and `SHIPPED_CI_SCRIPT_HASHES` in the same `Record<string, readonly string[]>` shape, used by `migrateValeHouseStyle` and `migrateBrandedTemplateFiles` in `core.ts` |
| Move a consumer's adopted CI script units to branded names and rewrite their paths | `.bkit/core/engine/install/modules/core.ts` | `grep -n "function migrate" core.ts`; references to `getTemplatesRoot` (`.bkit/core/engine/shared/package-roots.ts:78`); `migrateShortcutsToLite` (`core.ts:360-370`) | `migrateShortcutsToLite` moves a file and records the removed path as `{ action: "write" }`; `getTemplatesRoot()` resolves the shipped templates; `migrateBrandedFileTokens` (Task 7) rewrites tokens in the same files; `CI_SCRIPT_RENAMES` in `.bkit/core/engine/checks/after/ci-yml.ts` lists every old → new CI script path | EXTEND | Export `CI_SCRIPT_RENAMES` and group it into units; `migrateBrandedTemplateFiles(dryRun, ws, logPrefix): PathRename[]` beside the other migrations; its returned renames feed a path pass in `migrateBrandedFileTokens` |
| Template launchd files under branded names | `.bkit/templates/scripts/launchd/bkit-launchd.plist`, `.bkit/templates/scripts/launchd/bkit-launchd.env.example` | `find .bkit/templates/scripts .bkit/templates/context -type f ! -name 'bkit-*'` | The two unprefixed launchd files — same content under old names | NEW | Reason (c): the old files are `Supersession Inventory` `DELETE` rows; content moves byte-identical |
| Rename templates, CI steps, workflow names, Vale style | `.bkit/templates/**`, `.bkit/core/.bkit/templates.md` | `grep -rln -e lint:prose -e slop:delta -e "pnpm graph" -e House .bkit/templates .bkit/core` | The shipped templates themselves | EXTEND | Edit in place; `syncTemplateCopies` reports the changed copies to consumers |
| Engine help, advisory and tip text | `.bkit/core/engine/{cli.ts,commands/ci/ci.ts,checks/after/tools.ts,checks/after/index.ts,checks/after/ci-yml.ts,checks/tips/catalogue.ts}` | `grep -rln -e lint:prose -e slop:delta -e graph: -e House -e Smoke .bkit/core/engine --include='*.ts'` | Existing strings | EXTEND | Rename in place |
| Branding guard over template names | `.bkit/core/engine/audits/templates/branding.test.ts` | `grep -rln -e 'startsWith("bkit-")' -e bkit-tests- .bkit/core/engine/audits`; `docs/capabilities.md` | `ci-scripts.test.ts` strips the `bkit-tests-` prefix to map jobs, asserts nothing about naming; `dogfood-templates.test.ts` asserts copies, not names | NEW | Reason (a): no naming guard exists; placed where `docs/architecture.md:83` puts template audits |
| Shipped Vale style under the branded name | `.bkit/templates/.vale/styles/Bkit/Filler.yml`, `.bkit/templates/.vale/styles/Bkit/Hedging.yml`, `.bkit/templates/.vale/styles/Bkit/LLMSlop.yml`, `.bkit/templates/.vale/styles/Bkit/Verbose.yml` | `ls .bkit/templates/.vale/styles/`; `grep -rn "House" .bkit/templates/.vale` (rule files do not name the style) | `.bkit/templates/.vale/styles/House/*.yml` — same rules under the old style name | NEW | Reason (c): the `House/` files are a `Supersession Inventory` `DELETE`; content moves byte-identical |
| bkit's own adopted Vale style | `.vale/styles/Bkit/Filler.yml`, `.vale/styles/Bkit/Hedging.yml`, `.vale/styles/Bkit/LLMSlop.yml`, `.vale/styles/Bkit/Verbose.yml` | `dogfood-templates.test.ts` `ADOPTED` entries `.vale/styles/House/*` | `.vale/styles/House/*.yml` | NEW | Reason (c): bkit's `House/` copy is a `Supersession Inventory` `DELETE` |
| Template content assertions | `.bkit/core/engine/audits/templates/{templates.test.ts,templates-content.test.ts,template-ci-yml.test.ts}`, `.bkit/core/engine/install/manifest.test.ts` | references to `GATE_TOOL_SCRIPTS`, `gateParts`; `grep -n -e House -e slop:delta *.test.ts` | Existing tests pin the old names | EXTEND | Rename assertions; add the smoke-stub and Vale-style tests |
| Migration tests | `.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `.bkit/core/engine/install/modules/core.test.ts` | `grep -n "describe(" core.integration.test.ts upgrade.integration.test.ts` | Existing migration describes seed old shapes in a tmpdir | EXTEND | Add tests beside them; replace `leaves a superseded bkit slop:delta value in place (add-if-missing; no migration code)` |
| bkit's own adopted copies | root `package.json`, `.husky/*`, `.github/workflows/*`, `scripts/graphify/*`, `.vale/`, `.vale.ini`, `docs/capabilities.md` | `dogfood-templates.test.ts` `ADOPTED` map | The copies themselves | EXTEND | Edit in the same task as each template so `dogfood-templates.test.ts` stays green |

## Architecture & Component Changes

**Ledger rows:** `748-consumer-facing-names-carry-bkit-prefix`, `748-brand-migration-rewrites-adopted-copies-exact-shipped-text`, `748-names-outside-the-branding-rule`, `748-rename-unprefixed-template-script-files`

### Database Migrations

None

### Engine — install write path and upgrade migrations

#### [MODIFY] `.bkit/core/engine/install/manifest.ts`

- **Existence Check:** file exists; `BKIT_GATE_SCRIPTS` at lines ~223-252.
- `bkit:gate:min` → `"pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"`; `bkit:gate:static` → `"pnpm typecheck && pnpm lint && pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"`; deeper chains that embed these follow; comments name the new scripts.

#### [MODIFY] `.bkit/core/engine/install/write.ts`

- **Existence Check:** file exists; `WriteEntry` at line 610.
- `WriteEntry` gains `unhashed?: true` (a consumer-owned file a migration rewrote; recorded for dry-run and `bkit check`, never hashed).

#### [MODIFY] `.bkit/core/engine/install/modules/core.ts`

- **Existence Check:** file exists; `runBkitDocs` (281), `seedCorePackageJsonScripts` (427), `migrateBkitLayout` (680), `detectGateAdvisories` (822), postDispatch hash loop (~1027-1060).
- `BKIT_SCRIPT_RENAMES`: `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta`, `graph` → `bkit:graph`, `graph:<verb>` → `bkit:graph:<verb>` for `check`, `clean`, `graphml`, `refresh`, `rollup`, `scoped`, `tree`, `update`.
- **Active pair** (one definition, used by every token rewrite): `package.json` does not hold both keys, and the old key, when present, is not a foreign `graph*` value (one whose command does not run `scripts/graphify/bkit-`). Active with the old key present → key renamed; active → tokens rewritten; inactive → pair left (both-keys case: one `console.warn`). A pair with neither key is active, so an old default chain is rewritten.
- `renameScriptTokens(text, renames): string` (exported, pure): rewrites `pnpm [flags] [run] [flags] <old>` where each flag is a value-less `-x` / `--x[=v]` token and `<old>` is followed by a character outside `[\w:-]` or end of text; `run` and flags kept. `findOldScriptNames(text, renames): { line, name }[]` (exported, pure) lists old names left after the rewrite (`(^|[^\w:])<old>` not followed by `[\w:-]`).
- `migrateBrandedScriptNames(dryRun, ws, logPrefix): boolean`: reads `package.json` with `parseJson` (invalid JSON → existing error path, no write); per active pair with the old key present → key renamed in place (order kept), value kept; then `renameScriptTokens` over every script value for the active pairs; each surviving old name → one `console.warn` naming `package.json`, the script key and the name; writes through `writePackageJsonLike` (indent kept); called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts`, so the old default `bkit:gate:*` chains become the new defaults and nothing is added twice.
- `migrateBrandedFileTokens(dryRun, ws, logPrefix, pathRenames)`: `.husky/pre-commit`, `.husky/pre-push`, `ciWorkflowPath(".")`, `.github/workflows/bkit-trivy.yml`; absent files skipped silently; script tokens for the active pairs; `scripts/ci/<old>` path tokens (followed by a character outside `[\w.-]` or end of text) for each `pathRenames` entry, also in package.json script values (`writePackageJsonLike`); each surviving old script name → one `console.warn` naming file and line; changed files pushed `{ path, action: "update", unhashed: true }`. Called by `runBkitDocs` after `migrateBrandedTemplateFiles`.
- `CI_SCRIPT_RENAMES` (exported from `.bkit/core/engine/checks/after/ci-yml.ts`, grouped into units: `check-capstone.mjs` + `.test.mjs`; `check-dependency-audit.mjs` + `.test.mjs` + `accepted-advisories.json`; `check-accepted-divergences.mjs` + `.test.mjs` + `accepted-divergences.json`; `lanes/resolve-push-base.mjs` + `.test.mjs`, each → `bkit-<name>` under `scripts/ci/`), `SHIPPED_CI_SCRIPT_HASHES` (sha256 per distinct release content of the eight `.mjs` files at every path they have had) and `migrateBrandedTemplateFiles(dryRun, ws, logPrefix): PathRename[]`: a unit whose present `.mjs` files all match a shipped hash and whose `bkit-` targets are absent → old files removed (`{ action: "write", unhashed: true }`), the `.mjs` targets written from `getTemplatesRoot()` and the data file moved byte-identical (`{ action: "write", unhashed: true }`); an edited file or an existing target → unit left, one `console.warn` naming the manual move; no `scripts/ci/` → silent. Returns the renames applied plus those already applied (old absent, new present), so dry run and the second run compute the same path pass. Called by `runBkitDocs`.
- `migrateBrandedCheckNames(dryRun, ws, logPrefix)`: in `.github/workflows/bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml`, the exact shipped old `name:` lines → branded; a job `name:` inserted after the exact `  renovate:` / `  trivy:` line when the job has none; in `ciWorkflowPath(".")`, the shipped smoke-stub comment lines (`{{DEFAULT_BRANCH}}` matched as any branch) → `bkit-smoke.yml` / `name: bkit-smoke` / job `#     name: bkit-smoke` inserted after `#   smoke:` / `workflows: [bkit-ci]`, and the shipped `bkit-stub:health` line → `.github/workflows/bkit-health.yml`; a copied `.github/workflows/smoke.yml` holding the stub lines → rewritten, `workflows:` set to the CI workflow's own `name:` (fallback `bkit-ci`), job `name: bkit-smoke` inserted, moved to `bkit-smoke.yml` unless that exists (then rewritten in place, logged); the moved-away path pushed `{ action: "write", unhashed: true }`. One log line per renamed check: old check → new check, change the required check in branch protection if set. Writes `unhashed: true`. Called by `runBkitDocs`.
- `SHIPPED_HOUSE_RULE_HASHES` (sha256 per distinct release content of `Filler`, `Hedging`, `LLMSlop`, `Verbose`, from `git tag -l 'v*'` × every path each rule has had, listed by `git log --all --follow --name-only -- .bkit/templates/.vale/styles/House/<rule>.yml`, read with `git show <tag>:<path>`) and `migrateValeHouseStyle(dryRun, ws, logPrefix)`: a matching `.vale/styles/House/<rule>.yml` moves byte-identical to `.vale/styles/Bkit/<rule>.yml` when the target is absent; an edited rule or an existing target → left, `console.warn` naming the manual move (`git mv .vale/styles/House/<rule>.yml .vale/styles/Bkit/` and the `.vale.ini` toggle); `.vale.ini` `House.<moved>` → `Bkit.<moved>`, `BasedOnStyles` `House` → `Bkit` when `House/` is empty (directory removed), else `Bkit` appended; no `.vale.ini` → rules move, no `.vale.ini` write; no `.vale/` → silent. Removed paths pushed `{ action: "write", unhashed: true }`; writes `unhashed: true`. Called by `runBkitDocs`.
- Install postDispatch hash loop skips `unhashed` entries; gate advisory text (line ~1098) names `bkit:lint:prose` / `bkit:slop:delta`.

#### [MODIFY] `.bkit/core/engine/commands/install/upgrade.ts`

- **Existence Check:** file exists; `updateCanonicalHashesAfterUpgrade` at 483, `renderWs.writes` hashing at ~1025-1045.
- `renderWs.writes` entries with `unhashed` are not passed to the hash collector.

#### [MODIFY] `.bkit/core/engine/{cli.ts,commands/ci/ci.ts,checks/after/tools.ts,checks/after/index.ts,checks/after/ci-yml.ts,checks/tips/catalogue.ts,install/modules/cloud.ts,install/version-file.ts}`

- **Existence Check:** files exist (`cli.ts:814`, `ci.ts:3,12`, `tools.ts:41,50,141,234`, `index.ts:175`, `ci-yml.ts:709`, `catalogue.ts:170,200,220,371,375,448`, `cloud.ts:57,113,166`, `version-file.ts:155-157`).
- Help, advisory and tip text name `bkit:lint:prose`, `bkit:slop:delta`, `bkit:graph*`, `Bkit.*`, `bkit-smoke.yml`, `bkit-health.yml` and the `scripts/ci/bkit-*` / `scripts/launchd/bkit-*` templates; `cloud.ts` advisories and the `version-file.ts` comment state the copy-and-own contract with its one exception (the exact-shipped-text brand migrations).

### Templates and shipped docs

#### [MODIFY] `.bkit/templates/.github/workflows/bkit-ci.yml`

- **Existence Check:** file exists.
- `run: pnpm bkit:lint:prose`, `run: pnpm bkit:slop:delta "$BASE_SHA"`; comments; smoke stub → `.github/workflows/bkit-smoke.yml`, `# name: bkit-smoke`, job `#     name: bkit-smoke`, `#     workflows: [bkit-ci]`; health stub → `.github/workflows/bkit-health.yml`.

#### [MODIFY] `.bkit/templates/scripts/launchd/*` → `bkit-*`

- **Existence Check:** two files exist (`find .bkit/templates/scripts .bkit/templates/context -type f ! -name 'bkit-*'` lists `ai.bkit.launchd.plist` and `launchd.env.example`).
- [new] `bkit-launchd.plist`, `bkit-launchd.env.example` (`Reuse Inventory` reason (c)); [DELETE] the old names; plist Label stays `ai.bkit.launchd`.

#### [MODIFY] `.bkit/templates/.github/workflows/{bkit-cloud.yml,bkit-renovate.yml,bkit-trivy.yml}`

- **Existence Check:** files exist.
- `bkit-cloud.yml` job names `bkit-cloud-context (${{ github.event_name }})`, `bkit-cloud-claude (…)`, `bkit-cloud-opencode (…)`; `bkit-renovate.yml` / `bkit-trivy.yml` workflow `name:` and new job `name:` `bkit-renovate` / `bkit-trivy`; job ids unchanged.

#### [MODIFY] `.bkit/templates/{.husky/pre-commit,.husky/pre-push,.cursor/Dockerfile,.github/workflows/bkit-trivy.yml,scripts/graphify/*,docs/capabilities.md}`

- **Existence Check:** files exist.
- Commands and hints name `pnpm bkit:lint:prose`, `pnpm bkit:slop:delta`, `pnpm bkit:graph*` and `scripts/ci/bkit-*`; `bkit-graphify-rollup.py` header lines write `pnpm bkit:graph:refresh`, `pnpm bkit:graph:update`, `pnpm bkit:graph`, and its `slop:delta` hint (line 672) reads `bkit:slop:delta`.

#### [new] `.bkit/templates/.vale/styles/Bkit/{Filler,Hedging,LLMSlop,Verbose}.yml`

- **Reuse Check:** move of the `House/` rules (Supersession row `DELETE`; reason (c)); content byte-identical.

#### [DELETE] `.bkit/templates/.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`

- Replaced by `Bkit/`.

#### [MODIFY] `.bkit/templates/.vale.ini`

- `BasedOnStyles = Bkit` / `write-good, Bkit`; `Bkit.<rule> = NO` toggles.

#### [MODIFY] `.bkit/core/.bkit/{templates.md,README.md,workflows.md,pipeline.md,install.md}`, `.bkit/shared/docs/{testing.md,deployments.md}`, `.bkit/shared/gitignore`, `.bkit/core/.agents/rules.md`, `.bkit/core/docs/templates/bkit-audit-security.md`, `.bkit/instructions.md`

- **Existence Check:** files exist.
- `templates.md` line 12 (copy-and-own contract states the brand-migration exception), § Gate tool scripts block and table, graphify block and table, launchd placeholder rows and § Launchd GUI environment commands, Contract row and § Vale; other docs name the new scripts, file names, check names and `Bkit`; `.bkit/instructions.md` clause `slop-gate` (names `bkit:slop:delta`) moves old wording to `retired`, and `pnpm instructions:sync` regenerates `.bkit/core/.agents/rules.md:131`.

### Tests

#### [new] `.bkit/core/engine/audits/templates/branding.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Branding guard over template names", reason (a).
- Describe `consumer-facing names carry the bkit prefix`: script names in `.bkit/core/.bkit/templates.md` json blocks whose value runs `bkit ` or `scripts/**/bkit-*` start with `bkit:`; every workflow `name:` and every job display name (`name`, else the job id) in `.bkit/templates/.github/workflows/*.yml` starts with `bkit-` (`parseYaml`); the only style under `.bkit/templates/.vale/styles/` is `Bkit`; every file under `.bkit/templates/scripts/` and `.bkit/templates/context/` starts with `bkit-`, no exception list. Each check is a pure function over text, so seeded negatives run on fixture strings.

#### [MODIFY] `.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/audits/templates/{templates.test.ts,templates-content.test.ts,template-ci-yml.test.ts,ci-scripts.test.ts,husky-pre-push.integration.test.ts}`, `.bkit/core/engine/install/template-copies.integration.test.ts`, `.bkit/core/engine/audits/repo/{dogfood-templates.test.ts,release-workflow.test.ts,resolve-push-base.test.ts}`, `.bkit/core/engine/checks/tips/catalogue.test.ts`, `.bkit/core/engine/install/{version-file.test.ts,modules/index.integration.test.ts}`, `.bkit/core/engine/install/modules/{core.test.ts,core.integration.test.ts}`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

- **Existence Check:** files exist.
- New names and paths asserted; new migration tests; superseded add-if-missing test replaced; `upgrade.integration.test.ts` `does not rewrite a consumer-owned .github/renovate.json5` seeds a customised `bkit-renovate.yml` line; copy-and-own comments and the `install never writes or flags an adopted template copy` describe title state the brand-migration exception.

### bkit's own adopted copies and repo docs

#### [MODIFY] root `package.json`, `.husky/{pre-commit,pre-push}`, `.cursor/Dockerfile`, `.github/workflows/{bkit-ci.yml,bkit-cloud.yml,bkit-renovate.yml,bkit-trivy.yml}`, `scripts/graphify/*`, `.vale.ini`, `docs/capabilities.md`

- **Existence Check:** files exist.
- Match the renamed templates (adapted edits kept per `dogfood-templates.test.ts` `ADOPTED`); `docs/capabilities.md` regenerated by `pnpm bkit:graph:refresh`.

#### [new] `.vale/styles/Bkit/{Filler,Hedging,LLMSlop,Verbose}.yml` / [DELETE] `.vale/styles/House/`

- **Reuse Check:** bkit's adopted copy of the template move (reason (c)).

#### [MODIFY] `.agents/rules.md`, `docs/{testing.md,deployments.md,setup.md,technology.md,migrations.md,security.md}`, `docs/templates/{bkit-audit-duplication.md,bkit-audit-dependencies.md,bkit-audit-security.md}` (project parts), `CONTRIBUTING.md`, `.agents/docs.md`, `CHANGELOG.md`

- See `Documentation Updates`.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/templates/.vale/styles/House/Filler.yml`, `.bkit/templates/.vale/styles/House/Hedging.yml`, `.bkit/templates/.vale/styles/House/LLMSlop.yml`, `.bkit/templates/.vale/styles/House/Verbose.yml` | `.bkit/templates/.vale/styles/Bkit/*.yml` | DELETE | Same content under the branded style; consumer copies move via `migrateValeHouseStyle` (Task 6, Task 10) |
| `.vale/styles/House/Filler.yml`, `.vale/styles/House/Hedging.yml`, `.vale/styles/House/LLMSlop.yml`, `.vale/styles/House/Verbose.yml` (bkit's own copy) | `.vale/styles/Bkit/*.yml` | DELETE | Adopted copy of the template (Task 6) |
| `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist`, `.bkit/templates/scripts/launchd/launchd.env.example` | `bkit-launchd.plist`, `bkit-launchd.env.example` in the same directory | DELETE | Same content under branded names; copied by hand to machine-local paths that keep their names (Task 2) |
| A consumer's unedited `scripts/ci/` copies under the old names | `scripts/ci/bkit-<name>` | DELETE | Moved by `migrateBrandedTemplateFiles` (Task 8); edited copies stay and the `ci-scripts-old-names` advisory names them |
| Script keys `lint:prose`, `slop:delta`, `graph`, `graph:<verb>` in `.bkit/core/.bkit/templates.md` and root `package.json` | `bkit:lint:prose`, `bkit:slop:delta`, `bkit:graph`, `bkit:graph:<verb>` | DELETE | Renamed, no alias kept (Task 1, Task 3) |
| `name: Trivy`, `name: Renovate`, `context (…)`, `claude (…)`, `opencode (…)` display names, smoke stub `smoke.yml` / `Smoke` / `["CI"]`, health stub `health.yml` | `bkit-*` names | DELETE | Renamed in templates and bkit's own copies (Task 5) |
| `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a superseded bkit slop:delta value in place (add-if-missing; no migration code)` | `renames old bkit script keys and keeps custom values` and `rewrites old script tokens in values and default gate chains` | DELETE | The test pins the behaviour this plan replaces (Task 4) |
| `.bkit/instructions.md` clause `slop-gate` wording naming `slop:delta` | Same clause naming `bkit:slop:delta` | DELETE | Old wording moves to each clause's `retired` list, which is how the store records superseded wording (Task 11) |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | Superseding same-key rows for ACTIVE rows whose text goes stale — `kn-29-bkit-lints-itself-with-a-narrower-lint-prose-than-it-ships` ("bkit never writes or overwrites a consumer's `.vale.ini`"), `capability-register-drift-reached-dev-through-warn-only-pre-push` (`pnpm graph:refresh`), `kn-lint-prose-gitignored-styles-silently-disable-gate-in-worktrees`, `kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba` — appended by the build's knowledge writers (`@bkit-build-plan-execute` / `@bkit-utility-update-knowledge`) once the names land; ledger rows are not runbook tasks |
| `docs/decisions.jsonl` | Rows `748-consumer-facing-names-carry-bkit-prefix`, `748-brand-migration-rewrites-adopted-copies-exact-shipped-text` (written at plan time; updated at plan review for template file names, the token grammar, the `graph*` value guard and the CI-script move) |
| `docs/architecture.md` | None — `audits/templates/` already places template guard tests |
| `docs/technology.md` | Line ~83: `lint:prose` / `House` → `bkit:lint:prose` / `Bkit` (Task 12) |
| `docs/data-schema.md` | None — no database |
| `docs/design.md` | None — no UI |
| `docs/testing.md` | Managed block via `.bkit/shared/docs/testing.md:17`, `:72`, `:74`, `:155` (Tasks 2, 11); project part line ~763, lines 640-641 (`bkit-check-capstone.test.mjs`) and a § Key test files row for `branding.test.ts` (Task 12) |
| `docs/observability.md` | None — migration lines reuse the caller's prefix |
| `docs/migrations.md` | Five § Migrations rows: branded script names (Task 4), branded husky / CI tokens (Task 7), branded CI script files (Task 8), branded check names (Task 9), Vale `House` → `Bkit` (Task 10) |
| `docs/deployments.md` | Managed block via `.bkit/shared/docs/deployments.md:171`, `:348`, `:380`, `:385`, `:399` (Tasks 2, 11); project part lines ~485-499 (Task 12) |
| `docs/security.md` | Line 143 (project part): `slop:delta` → `bkit:slop:delta` (Task 12) |
| `docs/setup.md` | Lines ~55, ~82 (Task 12) |
| `docs/templates/bkit-audit-duplication.md` | Project part lines 242, 246, 249: `pnpm bkit:graph:check`, `pnpm bkit:graph:update`, `pnpm bkit:graph:rollup` (Task 3) |
| `docs/capabilities.md` | Regenerated by the graphify refresh script after each engine-touching task; header names `bkit:graph*` (Task 3, refreshed again in Task 12) |
| `.bkit/core/.bkit/{templates.md,README.md,workflows.md,pipeline.md,install.md}` | New names (Tasks 1, 2, 3, 5, 6, 11); `templates.md:12` copy-and-own contract states the brand-migration exception (Task 7); mirrored to `.bkit/*.md` by `bkit install` (Task 12) |
| `.bkit/shared/gitignore` | Line ~69 (Task 11) |
| `.bkit/instructions.md`, `.bkit/core/.agents/rules.md`, `.agents/rules.md` managed block | `slop-gate` clause → `bkit:slop:delta`, then `pnpm instructions:sync` (Task 11) |
| `.agents/rules.md` § Naming Conventions (below `bkit:end`) | Branding bullet (Task 11) |
| `.agents/docs.md` | Line ~72 (`.bkit/templates.md` scope: copy-and-own exception) and line ~75 names (Task 12) |
| `CONTRIBUTING.md` | Line ~27 (Task 12) |
| `CHANGELOG.md` `## [Unreleased]` | Breaking-change entry listing every rename and the branch-protection note (Task 12) |
| Cron / scheduled-jobs doc | None — no scheduled task |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — no database | — |
| **Code** | `git revert {COMMIT}`; release a patch | Consumers already upgraded keep the `bkit:*` / `bkit-*` / `Bkit` names: the reverted engine seeds the old gate chains add-if-missing beside them and reports no drift on consumer-owned files; renaming back would need a reverse migration |
| **Risk window** | From release to each consumer's `bkit upgrade` | Consumers on the old names keep working (nothing removes the old keys until upgrade); a required check named `Trivy / trivy` or a cloud job blocks PRs only after upgrade, and the upgrade log names it |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: script names, template file names and the branding guard (Group 1) → script-name migration and check names (Group 2) → Vale style, the unhashed write class, hook / CI token and CI-script file migrations (Group 3) → check-name and Vale migrations (Group 4) → rule, shipped and repo docs, mirrors, build and dogfood (Group 5). Each template task updates bkit's own adopted copy in the same task so `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` stays green; each engine-touching task (1, 3, 4, 7, 8, 9, 10) runs `pnpm build`, stages `dist/` with its source and refreshes `docs/capabilities.md` with the graphify refresh script under its current name (`docs/failures.jsonl` `capability-register-drift-shipped-by-pr-708-reds-dev-capstone`). Host mirrors regenerate once, in Task 12 (`.agents/rules.md` § Install to mirror); until then bkit's `.husky/pre-push:194` `pnpm bkit check` reds on mirror drift (`docs/knowledge.jsonl` `dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit`), so nothing is pushed before Task 12. Integration shape (advice only): one PR for all tasks is fine; a commit per group reads well.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Rename bkit-powered package.json scripts and template files

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Rename `lint:prose` → `bkit:lint:prose`, `slop:delta` → `bkit:slop:delta` everywhere they are wired
  - **UPDATE:** `BKIT_GATE_SCRIPTS` in `.bkit/core/engine/install/manifest.ts`: gate chains call `pnpm bkit:lint:prose` / `pnpm bkit:slop:delta`; comments
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: gate advisory text (line ~1098)
  - **UPDATE:** `.bkit/core/engine/cli.ts`: help text (line ~814)
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: header comments (lines 3, 12)
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.ts`: advisory text (line 50)
  - **UPDATE:** `.bkit/core/engine/checks/after/index.ts`: text (line 175)
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: `lint:prose` / `slop:delta` parts of the CI and slop tip text (lines 170, 200)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Gate tool scripts json block and table keys (lines ~146-178, ~192, ~246-263)
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: gate chains (lines ~1405-1421)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: `run: pnpm bkit:lint:prose`, `run: pnpm bkit:slop:delta "$BASE_SHA"` and comments naming them (lines 61, 194, 216, 228, 813)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: comment `phase's bkit:lint:prose` (line 498)
  - **UPDATE:** `.bkit/templates/.husky/pre-commit`: comments naming `slop:delta` (lines 6, 10)
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: comment naming `slop:delta` (line 195)
  - **UPDATE:** `.bkit/templates/.cursor/Dockerfile`: comment naming `pnpm lint:prose` (line 58)
  - **UPDATE:** `.cursor/Dockerfile`: bkit's own copy (line 58; pinned `identical` by `dogfood-templates.test.ts:429`)
  - **UPDATE:** `package.json`: keys `bkit:lint:prose`, `bkit:slop:delta`; bkit's own `bkit:gate:*` chains call them
  - **UPDATE:** `.github/workflows/bkit-ci.yml`: bkit's own copy (lines 351, 436, 458, 475)
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: bkit's own copy (line 498)
  - **UPDATE:** `.husky/pre-commit`: bkit's own copy (lines 6, 10)
  - **UPDATE:** `.husky/pre-push`: bkit's own copy (line 292)
  - **UPDATE:** `.bkit/core/engine/install/manifest.test.ts`: `gate tool script template values` keys; `this repo's lint:prose calls the same gate` → `this repo's bkit:lint:prose calls the same gate`
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`: `reads the gate as a chain of pnpm scripts` expects `bkit:lint:prose`, `bkit:slop:delta`
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates-content.test.ts`: `lists slop:delta as the bkit ci slop verb` → `lists bkit:slop:delta as the bkit ci slop verb`
  - **UPDATE:** `.bkit/core/engine/audits/repo/release-workflow.test.ts`: line 157 `pnpm bkit:lint:prose`
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `bkit-ci.yml` adapted edits (lines 180, 194) name `pnpm bkit:slop:delta`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: `names the tool scripts a default gate chains that package.json lacks` (line 261) and the `bkit:gate:format` advisory case (lines 290-294) use the new names
  - **UPDATE:** `.bkit/core/engine/checks/after/index.test.ts`: test title naming `lint:prose` (line 181)
  - **READ:** `unresolvedGateCalls` in `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: every default-gate `pnpm` call resolves in the repo's own `package.json`
  - **DONE WHEN:** every `lint:prose` / `slop:delta` in non-test files under `.bkit/core/engine`, `.bkit/templates/.github/`, `.bkit/templates/.husky/` and `.bkit/core/.bkit/templates.md` is preceded by `bkit:`; root `package.json` has no `lint:prose` / `slop:delta` key; `template-ci-yml.test.ts` `runs every part of the local static gate as a step, bar the named exceptions`, `local-gate-audit.test.ts` and `dogfood-templates.test.ts` pass; `pnpm bkit:gate:static` passes on bkit
  - **TEST FIRST:**
    - `.bkit/core/engine/install/manifest.test.ts` `gate chains call bkit:lint:prose and bkit:slop:delta` fails on chains calling the old names
    - `.bkit/core/engine/install/manifest.test.ts` `gate tool script template values > bkit:lint:prose and bkit:slop:delta call their bkit ci gates` fails on the `templates.md` block lacking the new keys
    - `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `template bkit-tests-static job matches the bkit:gate:static local gate > reads the gate as a chain of pnpm scripts` fails on the old gate parts (the issue's `bkit-tests-static steps match the gate parts`)
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `detectGateAdvisories — gate advisories point at .bkit/templates.md > names the tool scripts a default gate chains that package.json lacks` fails on the advisory naming `lint:prose` / `slop:delta`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Rename the two unprefixed launchd template files to `bkit-*`
  - **CREATE:** `.bkit/templates/scripts/launchd/bkit-launchd.plist`: moved byte-identical (Label `ai.bkit.launchd` kept)
  - **CREATE:** `.bkit/templates/scripts/launchd/bkit-launchd.env.example`: moved byte-identical
  - **DELETE:** `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist`: replaced by `bkit-launchd.plist`
  - **DELETE:** `.bkit/templates/scripts/launchd/launchd.env.example`: replaced by `bkit-launchd.env.example`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: placeholder rows (lines 84-85) and § Launchd GUI environment table source column and `cp` commands (lines 324-334) name the `bkit-launchd.*` templates; each `cp` names its destination file (`cp .bkit/templates/scripts/launchd/bkit-launchd.plist ~/Library/LaunchAgents/ai.bkit.launchd.plist`), because copying into the directory would install it as `bkit-launchd.plist`; install destinations `~/Library/LaunchAgents/ai.bkit.launchd.plist`, `~/.config/bkit/launchd.env` and the `launchctl` lines (336-337, 350) unchanged
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: launchd tip `ask` (line 450) names the `bkit-launchd.*` sources and the `ai.bkit.launchd.plist` / `launchd.env` destination files
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `ADOPTED` keys `scripts/launchd/bkit-launchd.plist`, `scripts/launchd/bkit-launchd.env.example` (lines 611, 615)
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates-content.test.ts`: `PLIST` / `ENV_EXAMPLE` paths and describes `bkit-launchd.plist`, `bkit-launchd.env.example` (lines 692-693, 731, 748)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `find .bkit/templates/scripts .bkit/templates/context -type f ! -name 'bkit-*'` is empty; `git grep -nE 'scripts/launchd/(ai\.bkit\.launchd\.plist|launchd\.env\.example)' -- .bkit/core/engine .bkit/templates .bkit/core/.bkit .bkit/shared ':!*.test.ts'` is empty; `templates-content.test.ts`, `catalogue.test.ts` and `dogfood-templates.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > every template has an entry, and every entry is a template` fails on `ADOPTED` keyed by the old launchd file names
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `bkit-launchd.plist > is a LaunchAgent that loads at login and re-runs on env-file writes` fails on the plist still shipping as `ai.bkit.launchd.plist` or its Label changing

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Rename `graph*` → `bkit:graph*` in every template and doc; branding guard for script and file names
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: graphify script block and table (lines ~485-555)
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graphify.sh`: usage and hint strings name `pnpm bkit:graph*`
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graphify-rollup.py`: `docs/capabilities.md` header lines (~763-785) name `pnpm bkit:graph:refresh`, `pnpm bkit:graph:update`, `pnpm bkit:graph`; `slop:delta` hint (line 672) reads `bkit:slop:delta`
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-drift.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-eager.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-imports.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-surface.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graph-repair.py`: hint strings
  - **UPDATE:** `.bkit/templates/scripts/graphify/bkit-graphify-graphml.py`: hint strings
  - **UPDATE:** `.bkit/templates/docs/capabilities.md`: lines 3, 12, 33, 64, 68, 72
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: comments and messages naming `pnpm graph*` (lines 275, 295)
  - **UPDATE:** `.github/workflows/bkit-ci.yml`: bkit's own copy (lines 531, 551)
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: `pnpm graph*` parts of the graphify and slop tip text (lines 170, 200)
  - **UPDATE:** `package.json`: `graph`, `graph:<verb>` keys → `bkit:graph`, `bkit:graph:<verb>`
  - **UPDATE:** `.husky/pre-push`: bkit-only graphify hints (lines 259, 263, 274)
  - **UPDATE:** `docs/templates/bkit-audit-duplication.md`: project part (below `bkit:end`) permissions and capability-register lines name `pnpm bkit:graph:check`, `pnpm bkit:graph:update`, `pnpm bkit:graph:rollup` (lines 242, 246, 249)
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `what: "pnpm bkit:graph:rollup writes it"` (line 459)
  - **UPDATE:** `scripts/graphify/bkit-graphify.sh`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graphify-rollup.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-pre-push.sh`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-drift.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-eager.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-imports.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-surface.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graph-repair.py`: bkit's own copy
  - **UPDATE:** `scripts/graphify/bkit-graphify-graphml.py`: bkit's own copy
  - **UPDATE:** `docs/capabilities.md`: regenerated with `pnpm bkit:graph:refresh`
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates-content.test.ts`: graphify script assertions
  - **CREATE:** `.bkit/core/engine/audits/templates/branding.test.ts`: describe `consumer-facing names carry the bkit prefix` — script names in `.bkit/core/.bkit/templates.md` json blocks whose value runs `bkit ` or `scripts/**/bkit-*` start with `bkit:`; every file under `.bkit/templates/scripts/` and `.bkit/templates/context/` starts with `bkit-`, no exception list; checks are pure functions so seeded negatives run on fixture text
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** no file under `.bkit/templates/`, `.bkit/core/.bkit/`, `.bkit/core/engine/checks/` names `pnpm graph` without `bkit:`; `grep -rnE '(^|[^:])(lint:prose|slop:delta)' .bkit/templates` is empty; `docs/templates/bkit-audit-duplication.md` names no `pnpm graph:` script without `bkit:`; root `package.json` has no `graph*` key; `pnpm bkit:graph:check` passes on bkit; `husky-pre-push.integration.test.ts`, `catalogue.test.ts` and `dogfood-templates.test.ts` pass; `branding.test.ts` passes on the tree and its file-name check fails on a seeded `scripts/foo.sh`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `lists the graphify scripts under bkit:graph names` fails on `graph*` keys
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > template script names that run bkit code` fails on the shipped `graph` script names
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code` fails on a seeded `"graph": "bash scripts/graphify/bkit-graphify.sh"` passing
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > template file names` fails on a seeded unprefixed `scripts/foo.sh` passing or any shipped file under `.bkit/templates/scripts/` / `.bkit/templates/context/` lacking `bkit-`
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > scripts/graphify/bkit-graphify.sh` fails on bkit's own copy still naming `pnpm graph*`
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py` fails on bkit's own copy still writing `pnpm graph*` header lines

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Migrate script names; brand check names

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Upgrade migration for package.json script names
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `BKIT_SCRIPT_RENAMES` — old → new table (`lint:prose`, `slop:delta`, `graph`, `graph:<verb>` for `check`, `clean`, `graphml`, `refresh`, `rollup`, `scoped`, `tree`, `update`); `graph*` entries carry the value guard (value runs `scripts/graphify/bkit-`)
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add the one **active pair** definition every token rewrite uses — `package.json` does not hold both keys, and the old key, when present, is not a foreign `graph*` value; a pair with neither key is active
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `renameScriptTokens(text, renames)` — exported, pure; rewrites `pnpm [flags] [run] [flags] <old>` where each flag is a value-less `-x` / `--x[=v]` token and `<old>` is followed by a character outside `[\w:-]` or end of text; flags and `run` kept
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `findOldScriptNames(text, renames)` — exported, pure; lists `{ line, name }` for each old name left after the rewrite
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateBrandedScriptNames(dryRun, ws, logPrefix): boolean` — `parseJson` read (invalid JSON → existing error path, no write); per active pair with the old key present → key renamed in place, value kept; both keys present → pair skipped, one `console.warn`; `renameScriptTokens` over every script value for active pairs; each surviving old name → one `console.warn` naming `package.json`, the script key and the name; `writePackageJsonLike` write; `ws.writes` push; log line
  - **UPDATE:** `seedCorePackageJsonScripts` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateBrandedScriptNames` before `ensurePackageJsonScripts`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.test.ts`: `renameScriptTokens` cases
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: delete `leaves a superseded bkit slop:delta value in place (add-if-missing; no migration code)`; new describe `migrateBrandedScriptNames (via seedCorePackageJsonScripts)`
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: line 960 also asserts `bkit:slop:delta` undefined; new idempotency test
  - **READ:** `tests/fixtures/heavy-customised-consumer/package.json`: its `"lint:prose": "custom-prose-linter"` is the real-upgrade case for a custom value kept under the new key; the fixture file is unchanged
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Branded script names" (`migrateBrandedScriptNames`, called by `seedCorePackageJsonScripts`; releases up to 6.0.x; tests)
  - **DEPENDS ON:** 1, 3
  - **DONE WHEN:** an old-shape scratch consumer's `package.json` upgrades to the new keys with values kept and a second upgrade writes nothing; a foreign `"graph": "nx graph"` keeps its key; no `lint:prose` / `slop:delta` / `graph*` old name in `.bkit/core/engine` outside `BKIT_SCRIPT_RENAMES` and the migration tests; `core.test.ts`, `core.integration.test.ts`, `upgrade.integration.test.ts` and the heavy-fixture tests (`write.integration.test.ts`, `uninstall.integration.test.ts`) pass
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens rewrites whole pnpm tokens only` fails on `pnpm graph:update-all`, `npm run lint:prose` or `echo lint:prose` being rewritten
    - `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens rewrites tokens after pnpm flags` fails on `pnpm -s lint:prose` or `pnpm run --silent slop:delta` keeping the old name, or a flag dropped
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `renames old bkit script keys and keeps custom values` fails on unrenamed keys
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `rewrites old script tokens in values and default gate chains` fails on old tokens, a `bkit:gate:static` that is not the new default, an old default chain left when `package.json` holds neither `lint:prose` nor `bkit:lint:prose`, or a `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- pnpm lint:prose` wrapper keeping the old token
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves the old key when the new key exists` fails on a clobbered key or a second log line
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves a foreign graph script under its own name` fails on `"graph": "nx graph"` renamed or a `pnpm graph` token in another value rewritten
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `warns on an old script name the rewrite cannot reach` fails on `pnpm --filter web lint:prose` passing with no warning naming `package.json`, the script key and `lint:prose`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `leaves package.json untouched when it is not valid JSON` fails on a migration write or the parse error not reaching the output
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `branded script migration is idempotent and dry-run writes nothing` fails on a second write or a dry-run write

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Brand workflow and job display names; fix the smoke and health stubs
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: job names `bkit-cloud-context (${{ github.event_name }})`, `bkit-cloud-claude (…)`, `bkit-cloud-opencode (…)`; job ids unchanged; comments naming the checks (lines 96, 472, 498, 547)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-renovate.yml`: workflow `name: bkit-renovate`; job `renovate` gets `name: bkit-renovate`
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-trivy.yml`: workflow `name: bkit-trivy`; job `trivy` gets `name: bkit-trivy`
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: smoke stub (lines 665-678) → `.github/workflows/bkit-smoke.yml`, `# name: bkit-smoke`, job `#     name: bkit-smoke` after `#   smoke:`, `#     workflows: [bkit-ci]`; health stub (line 1030) → `.github/workflows/bkit-health.yml`
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.ts`: smoke advisory text names `bkit-smoke.yml` (line 141); health advisory names `.github/workflows/bkit-health.yml` (line 234)
  - **UPDATE:** `.bkit/core/engine/checks/after/ci-yml.ts`: smoke advisory text names `bkit-smoke.yml` (line 709)
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: bkit's own copy
  - **UPDATE:** `.github/workflows/bkit-renovate.yml`: bkit's own copy
  - **UPDATE:** `.github/workflows/bkit-trivy.yml`: bkit's own copy
  - **UPDATE:** `.github/workflows/bkit-ci.yml`: bkit's own smoke stub
  - **UPDATE:** `.bkit/core/engine/audits/templates/branding.test.ts`: workflow / job display-name check (`parseYaml`; a job's display name is its `name`, else its id)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** every workflow `name:` and job display name (`name`, else the job id) in `.bkit/templates/.github/workflows/*.yml` and the smoke stub starts with `bkit-`; the health stub names `bkit-health.yml`; `template-ci-yml.test.ts`, `dogfood-templates.test.ts` and `actionlint` on `.github/workflows/` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `smoke stub is bkit-smoke and listens on bkit-ci` fails on `workflows: ["CI"]`, `name: Smoke`, a stub `smoke` job with no `name: bkit-smoke`, or the health stub naming `health.yml`
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > workflow and job display names` fails on `Trivy`, `renovate` or `context (…)`
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > flags a seeded job whose display name lacks bkit-` fails on a seeded `name: lint` job, or a seeded job with no `name:` and the id `lint`, passing
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-cloud.yml` fails on bkit's own copy keeping `context (…)`, `claude (…)` or `opencode (…)`
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-renovate.yml` fails on bkit's own copy keeping `name: Renovate` or a job with no `name:`
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .github/workflows/bkit-trivy.yml` fails on bkit's own copy keeping `name: Trivy` or a job with no `name:`

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Brand the Vale style; migrate hook and CI tokens and CI script files

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Rename Vale style `House` → `Bkit`
  - **CREATE:** `.bkit/templates/.vale/styles/Bkit/Filler.yml`: byte-identical move of the `House/` rule
  - **CREATE:** `.bkit/templates/.vale/styles/Bkit/Hedging.yml`: byte-identical move
  - **CREATE:** `.bkit/templates/.vale/styles/Bkit/LLMSlop.yml`: byte-identical move
  - **CREATE:** `.bkit/templates/.vale/styles/Bkit/Verbose.yml`: byte-identical move
  - **DELETE:** `.bkit/templates/.vale/styles/House/Filler.yml`: replaced by `Bkit/Filler.yml`
  - **DELETE:** `.bkit/templates/.vale/styles/House/Hedging.yml`: replaced by `Bkit/Hedging.yml`
  - **DELETE:** `.bkit/templates/.vale/styles/House/LLMSlop.yml`: replaced by `Bkit/LLMSlop.yml`
  - **DELETE:** `.bkit/templates/.vale/styles/House/Verbose.yml`: replaced by `Bkit/Verbose.yml`
  - **UPDATE:** `.bkit/templates/.vale.ini`: `BasedOnStyles = Bkit` / `write-good, Bkit`; `Bkit.<rule>` toggles
  - **UPDATE:** `.bkit/core/engine/checks/after/tools.ts`: `Bkit` style text (line 41)
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: `Bkit` style text (line 220)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: Contract row and § Vale name `Bkit`
  - **UPDATE:** `.bkit/core/.bkit/README.md`: Vale path `.vale/styles/Bkit/*` (line 241)
  - **CREATE:** `.vale/styles/Bkit/Filler.yml`: bkit's own adopted copy
  - **CREATE:** `.vale/styles/Bkit/Hedging.yml`: bkit's own adopted copy
  - **CREATE:** `.vale/styles/Bkit/LLMSlop.yml`: bkit's own adopted copy
  - **CREATE:** `.vale/styles/Bkit/Verbose.yml`: bkit's own adopted copy
  - **DELETE:** `.vale/styles/House/Filler.yml`: bkit's own copy, replaced by `Bkit/`
  - **DELETE:** `.vale/styles/House/Hedging.yml`: bkit's own copy, replaced by `Bkit/`
  - **DELETE:** `.vale/styles/House/LLMSlop.yml`: bkit's own copy, replaced by `Bkit/`
  - **DELETE:** `.vale/styles/House/Verbose.yml`: bkit's own copy, replaced by `Bkit/`
  - **UPDATE:** `.vale.ini`: bkit's own copy names `Bkit`
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `ADOPTED` entries `.vale/styles/Bkit/*.yml`
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates.test.ts`: `.vale.ini sets StylesPath, Packages and MinAlertLevel and enables House on .agents/**` → `… enables Bkit on .agents/**`
  - **UPDATE:** `.bkit/core/engine/install/template-copies.integration.test.ts`: fixture path `.vale/styles/Bkit/LLMSlop.yml` (line 85)
  - **UPDATE:** `.bkit/core/engine/audits/templates/branding.test.ts`: Vale style check
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `grep -rnw "House" .bkit/templates .bkit/core/.bkit .bkit/core/engine --exclude='*.test.ts'` is empty (word-bounded, so `ClickHouse` at `.bkit/templates/context/bkit-supabase.md:18` does not match; migration tables arrive in Task 10); `pnpm bkit:lint:prose` on bkit prints `Bkit.*` rule ids; `template-copies.integration.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates.test.ts` `Vale template ships the Bkit style and .vale.ini names it` fails on `House`
    - `.bkit/core/engine/audits/templates/branding.test.ts` `consumer-facing names carry the bkit prefix > the shipped Vale style` fails on a `House` style directory
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .vale/styles/Bkit/Filler.yml` fails on a missing adopted copy
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .vale/styles/Bkit/Hedging.yml` fails on a missing adopted copy
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .vale/styles/Bkit/LLMSlop.yml` fails on a missing adopted copy
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `this repo adopts its own templates > .vale/styles/Bkit/Verbose.yml` fails on a missing adopted copy

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Unhashed write class and the husky / CI token migration
  - **UPDATE:** `WriteEntry` in `.bkit/core/engine/install/write.ts`: optional `unhashed?: true`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: install postDispatch canonical-hash loop (~1027-1060) skips `unhashed` entries
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.ts`: the `renderWs.writes` → `updateCanonicalHashesAfterUpgrade` path (~1025-1045) skips `unhashed` entries
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateBrandedFileTokens(dryRun, ws, logPrefix)` — `renameScriptTokens` over `.husky/pre-commit`, `.husky/pre-push` and `ciWorkflowPath(".")` for the active pairs (the one definition from Task 4: a pair is active unless `package.json` holds both keys or a foreign `graph*` value); each surviving old name (`findOldScriptNames`) → one `console.warn` naming file and line; absent files skipped silently; push `{ path, action: "update", unhashed: true }`; log line per file
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateBrandedFileTokens`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: line 12 states the copy-and-own contract with its one exception — `bkit install` / `bkit upgrade` rewrite an adopted copy only where bkit's exact shipped old text matches (the brand migrations, `docs/migrations.md`), never otherwise
  - **UPDATE:** `.bkit/core/engine/install/version-file.ts`: comment at lines 155-157 states the same exception
  - **UPDATE:** `.bkit/core/engine/install/version-file.test.ts`: comment at lines 250-252 states the same exception
  - **UPDATE:** `.bkit/core/engine/install/modules/index.integration.test.ts`: describe `install never writes or flags an adopted template copy` (line 90) → `install never writes or flags an adopted template copy outside the exact-shipped-text brand migrations`
  - **READ:** `ciWorkflowPath` in `.bkit/core/engine/shared/settings.ts`: CI workflow path
  - **READ:** `mergeCanonicalHashes` in `.bkit/core/engine/install/version-file.ts`: prune behaviour the flag avoids
  - **READ:** `isTemplateSetPath` in `.bkit/core/engine/install/version-file.ts`: template-set paths it prunes
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Branded script tokens in hooks and CI" (`migrateBrandedFileTokens`, called by `runBkitDocs`; unhashed write; releases up to 6.0.x; tests)
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `WriteEntry` has `unhashed?: true`; an old-shape scratch consumer's `.husky/*` and CI workflow name the new scripts after upgrade, `.bkit/version` `canonicalHashes` has no entry for them, a dry run writes nothing, and a second upgrade writes nothing; `.bkit/core/.bkit/templates.md:12` and `version-file.ts` state the brand-migration exception; `upgrade.integration.test.ts` `#459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file` and `index.integration.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > rewrites old script tokens in husky hooks and the CI workflow` fails on old tokens left in `.husky/pre-push` or a custom `bkit.testing.ciWorkflow` file, or a surviving `pnpm --filter web lint:prose` with no warning naming the file and line
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` fails on a `canonicalHashes` entry for `.husky/pre-push` or the CI workflow, or a second-run write
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a dry-run hook and CI token migration writes nothing` fails on `.husky/pre-push` or the CI workflow changing under `--dry-run`, or the dry-run writeset missing them

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Upgrade migration for the renamed CI script files
  - **UPDATE:** `.bkit/core/engine/checks/after/ci-yml.ts`: export `CI_SCRIPT_RENAMES` (old → new path per file, already listing all ten) and group it into units: `check-capstone.mjs` + `.test.mjs`; `check-dependency-audit.mjs` + `.test.mjs` + `accepted-advisories.json`; `check-accepted-divergences.mjs` + `.test.mjs` + `accepted-divergences.json`; `lanes/resolve-push-base.mjs` + `.test.mjs`; `detectCiScriptsOldNames` doc comment states that `bkit upgrade` moves unedited copies and the advisory names the ones it leaves
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `SHIPPED_CI_SCRIPT_HASHES` — sha256 of every distinct release content of the eight `.mjs` files, from `git tag -l 'v*'` × every path each file has had (`git log --all --follow --name-only -- .bkit/templates/scripts/ci/<file>`), committed as constants in the `RETIRED_DRIVER_HASHES` shape
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateBrandedTemplateFiles(dryRun, ws, logPrefix): PathRename[]` — a unit whose present `.mjs` files all match `SHIPPED_CI_SCRIPT_HASHES` and whose `bkit-` targets are absent → old files removed (`{ action: "write", unhashed: true }`), `.mjs` targets written from `getTemplatesRoot()` and the data file moved byte-identical (`{ action: "write", unhashed: true }`); an edited file or an existing target → unit left, one `console.warn` naming the manual move; no `scripts/ci/` → silent; returns the renames applied plus those already applied (old absent, new present)
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: `migrateBrandedFileTokens` (from Task 7) gains a `pathRenames` parameter, takes the returned renames and rewrites `scripts/ci/<old>` path tokens (followed by a character outside `[\w.-]` or end of text) in `.husky/pre-commit`, `.husky/pre-push`, `ciWorkflowPath(".")`, `.github/workflows/bkit-trivy.yml` and package.json script values (`writePackageJsonLike`)
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateBrandedTemplateFiles` before `migrateBrandedFileTokens` and passes its result
  - **READ:** `getTemplatesRoot` in `.bkit/core/engine/shared/package-roots.ts`: shipped templates root
  - **READ:** `migrateShortcutsToLite` in `.bkit/core/engine/install/modules/core.ts`: move and removed-path write shape (lines 360-370)
  - **UPDATE:** `docs/migrations.md`: § Migrations row `ci-scripts-old-names` advisory states that the upgrade moves unedited copies; new row "Branded CI script files" (`migrateBrandedTemplateFiles`, called by `runBkitDocs`; unhashed writes; releases up to 6.0.x; tests)
  - **DEPENDS ON:** 7
  - **DONE WHEN:** `SHIPPED_CI_SCRIPT_HASHES` holds every distinct tagged content of the eight `.mjs` files; an old-shape scratch consumer with shipped `scripts/ci/check-capstone.mjs` + `.test.mjs` and `check-dependency-audit.mjs` + `.test.mjs` + `accepted-advisories.json`, and a CI workflow and `.husky/pre-push` calling them, upgrades to the `bkit-` files with every `scripts/ci/` path rewritten, `canonicalHashes` holds none of them, `node scripts/ci/bkit-check-capstone.test.mjs` exits 0 in the scratch consumer, and a second upgrade writes nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > moves shipped CI script units to bkit- names and rewrites their paths` fails on `scripts/ci/check-capstone.mjs` left in place, a moved `.test.mjs` importing the old name, `accepted-advisories.json` not moved byte-identical with its reader, or the CI workflow still running `node scripts/ci/check-capstone.mjs`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves an edited or already-renamed unit and logs the manual move` fails on an edited `check-capstone.mjs` moved, a `bkit-check-capstone.mjs` target overwritten, or no warning
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second template-file migration and a dry run write and move nothing` fails on a second-run write or a dry-run move or write

<!-- bkit:task 8 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Check-name and Vale migrations

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Upgrade migration for workflow check names and the smoke stub
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateBrandedCheckNames(dryRun, ws, logPrefix)` — exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml` → branded; job `name:` inserted after the exact `  renovate:` / `  trivy:` line when the job has none; smoke-stub comment lines in `ciWorkflowPath(".")` rewritten (`{{DEFAULT_BRANCH}}` matched as any branch), with job `#     name: bkit-smoke` inserted after `#   smoke:`, and the shipped `bkit-stub:health` line → `.github/workflows/bkit-health.yml`; a copied `.github/workflows/smoke.yml` with the stub lines rewritten, `workflows:` set to the CI workflow's own `name:` (fallback `bkit-ci`), job `name: bkit-smoke` inserted, moved to `bkit-smoke.yml` unless that exists (then rewritten in place, `console.warn`), the moved-away path pushed `{ action: "write", unhashed: true }`; one log line per renamed check naming old → new and the branch-protection fix; writes `unhashed: true`
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateBrandedCheckNames`
  - **UPDATE:** `.bkit/core/engine/install/modules/cloud.ts`: advisory strings (lines 57, 113, 166) state the copy-and-own contract with the exact-shipped-text brand-migration exception; tests pinning them updated
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: `does not rewrite a consumer-owned .github/renovate.json5` (lines 369-394) seeds a customised `bkit-renovate.yml` line (`name: Renovate (ours)\n`) and asserts it unchanged
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Branded check names" (releases up to 6.0.x; tests)
  - **DEPENDS ON:** 5, 7
  - **DONE WHEN:** an old-shape scratch consumer's shipped workflows carry the `bkit-*` names after upgrade, customised `name:` lines are unchanged, the log names each renamed check, a dry run writes and moves nothing, and a second upgrade writes nothing; `upgrade.integration.test.ts` `does not rewrite a consumer-owned .github/renovate.json5` passes on its customised seed
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > rewrites shipped old workflow names and leaves customised ones` fails on old names or a rewritten custom line
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > moves a copied smoke stub to bkit-smoke.yml listening on the CI workflow name` fails on `smoke.yml` left in place, `workflows: ["CI"]`, or a `smoke` job with no `name: bkit-smoke`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > logs each renamed check name with the branch-protection fix` fails on a missing log line for `Trivy / trivy`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > rewrites a copied smoke stub in place when bkit-smoke.yml exists and logs it` fails on an overwritten `bkit-smoke.yml`, `smoke.yml` removed, or no warning
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the renovate or trivy job already has one` fails on a second `name:` line under `  renovate:` or `  trivy:`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > rewrites the smoke and health stubs in a custom bkit.testing.ciWorkflow file` fails on old stub lines left in the custom file, `health.yml` kept, or a `bkit-ci.yml` read or write
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second check-name migration writes nothing` fails on a second-run write
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a dry-run check-name migration writes and moves nothing` fails on a workflow file changing or `smoke.yml` moving under `--dry-run`

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Upgrade migration for the Vale style
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `SHIPPED_HOUSE_RULE_HASHES` — sha256 of every distinct release content of `Filler`, `Hedging`, `LLMSlop`, `Verbose`, from `git tag -l 'v*'` × every path each rule has had (`git log --all --follow --name-only -- .bkit/templates/.vale/styles/House/<rule>.yml`), committed as constants in the `RETIRED_DRIVER_HASHES` shape
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: add `migrateValeHouseStyle(dryRun, ws, logPrefix)` — matching `House/<rule>.yml` moved byte-identical to `Bkit/<rule>.yml` when absent; edited rule or existing target → left, one `console.warn` naming the rule and the manual move (`mv .vale/styles/House/<rule>.yml .vale/styles/Bkit/` plus the `.vale.ini` toggle); `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` `House` → `Bkit` once `House/` is empty (directory removed), else `Bkit` appended; no `.vale.ini` → rules move, no `.vale.ini` write; no `.vale/` → silent; moved-away and removed paths pushed `{ action: "write", unhashed: true }`; other writes `unhashed: true`
  - **READ:** `RETIRED_DRIVER_HASHES` in `.bkit/core/engine/install/write.ts`: table shape and `sha256` use
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: calls `migrateValeHouseStyle`
  - **UPDATE:** `docs/migrations.md`: § Migrations row "Vale style `House` → `Bkit`" (releases up to 6.0.x; tests)
  - **DEPENDS ON:** 6, 7
  - **DONE WHEN:** `SHIPPED_HOUSE_RULE_HASHES` holds every distinct tagged content of the four rules across every path each has had; an old-shape scratch consumer upgrades with shipped rules in `Bkit/`, own and edited rules in `House/`, `.vale.ini` naming both styles, the log naming each edited rule's manual move, and a second upgrade writes nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves shipped Vale rules to Bkit and keeps own and edited rules in House` fails on shipped rules left in `House`, an own / edited rule moved, or no manual-move warning for the edited rule
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > names Bkit rules in .vale.ini and lists both styles while House keeps files` fails on `House.<moved>` toggles left or `BasedOnStyles` dropping `House`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves every House rule and removes House` fails on `House/` left, `BasedOnStyles` still naming `House`, or a `House.<rule>` toggle left
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves rules without a .vale.ini` fails on shipped rules left in `House` or a `.vale.ini` written
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second Vale migration and a dry run write nothing` fails on a second-run or dry-run write

<!-- bkit:task 10 end -->

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Rule, docs, mirrors and dogfood

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Write the rule; sweep the shared instruction and remaining shipped docs
  - **READ:** `.bkit/authoring.md`: prose rules for the rule bullet and clause edits
  - **READ:** `.bkit/instructions.md`: current clause text via `pnpm instructions:show --file instructions.md`
  - **UPDATE:** `.agents/rules.md`: § Naming Conventions (below `bkit:end`) branding bullet — consumer-facing file, script, check and style names carry `bkit-` / `bkit:`; engine and hook internals never; tool-fixed names exempt
  - **UPDATE:** `.bkit/instructions.md`: clause `slop-gate` names `bkit:slop:delta`; old wording moved to the clause's `retired` list
  - **UPDATE:** `.bkit/core/.agents/rules.md`: line 131 regenerated by `pnpm instructions:sync` after the plain check (`pnpm exec tsx .bkit/core/engine/tools/instructions.ts`) reports only the edited clauses (`bkit-audit-slop` cites the clause by id, so no text changes there)
  - **UPDATE:** `.bkit/core/.bkit/README.md`: remaining old names (line ~282)
  - **UPDATE:** `.bkit/core/.bkit/pipeline.md`: old names (line 100)
  - **UPDATE:** `.bkit/core/.bkit/install.md`: old names (line 241)
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: prose naming the tool scripts (line 1421)
  - **UPDATE:** `.bkit/shared/docs/testing.md`: new names (line 17); `health.yml` → `bkit-health.yml` (line 72)
  - **UPDATE:** `.bkit/shared/docs/deployments.md`: `pnpm bkit:graph` (line 380); `health.yml` → `bkit-health.yml` (line 348)
  - **UPDATE:** `.bkit/shared/gitignore`: new names (line 69)
  - **DEPENDS ON:** 1, 2, 3, 5, 6
  - **DONE WHEN:** `.agents/rules.md` § Naming Conventions holds the branding bullet; `grep -rnE "(^|[^:])(lint:prose|slop:delta)|pnpm (run )?graph|House\.|styles/House|BasedOnStyles.*House|name: Smoke|[^-]health\.yml|accepted-advisories\.json" .bkit/core/.bkit .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/instructions.md | grep -v 'bkit-accepted-advisories'` hits only the `retired` lists; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0
  - **TEST FIRST:** n/a — docs and shared instruction text, no behaviour change

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Repo docs, mirror regeneration, build and old-shape dogfood
  - **UPDATE:** `docs/testing.md`: project part line ~763 and lines 640-641; § Key test files row for `.bkit/core/engine/audits/templates/branding.test.ts`
  - **UPDATE:** `docs/deployments.md`: project part (lines ~485-499)
  - **UPDATE:** `docs/security.md`: `bkit:slop:delta` (line 143)
  - **UPDATE:** `docs/setup.md`: new names (lines ~55, ~82)
  - **UPDATE:** `docs/technology.md`: new names (line ~83)
  - **UPDATE:** `CONTRIBUTING.md`: new names (line ~27)
  - **UPDATE:** `.agents/docs.md`: `.bkit/templates.md` row (line 72) states the exact-shipped-text brand-migration exception; `pnpm bkit:graph:rollup` (line 75)
  - **UPDATE:** `CHANGELOG.md`: `## [Unreleased]` breaking-change entry listing every rename, the migrations and the branch-protection note
  - **UPDATE:** `.bkit/templates.md`: mirror regenerated by one `bkit install` (with every other `.bkit/*.md`, `docs/*` managed block, the `.agents/rules.md` managed block and host mirror)
  - **UPDATE:** `dist/cli.js`: `pnpm build` (with the rest of `dist/`)
  - **UPDATE:** `docs/capabilities.md`: `pnpm bkit:graph:refresh` after the last engine edit
  - **DEPENDS ON:** 4, 7, 8, 9, 10, 11
  - **DONE WHEN:** no template, tip or doc under `.bkit/` names `pnpm graph`, `pnpm lint:prose` or `pnpm slop:delta` (`grep -rnE "pnpm (run )?(graph|lint:prose|slop:delta)" .bkit --exclude='*.test.ts'` hits only migration old-name tables and `.bkit/instructions.md` `retired` lists); `grep -rnw House .bkit` hits only `SHIPPED_HOUSE_RULE_HASHES` / `migrateValeHouseStyle`, the branding guard's seeded negatives and their tests; `grep -rnE "scripts/ci/(lanes/)?(check-|resolve-push-base|accepted-)" .bkit docs --include='*.md' --include='*.ts' --include='*.yml' --include='*.mjs' --exclude-dir=plans --exclude-dir=audits` hits only `BKIT_TEMPLATE_FILE_RENAMES`, its tests and `docs/migrations.md`; `grep -rnE "(^|[^:])(lint:prose|slop:delta)|pnpm (run )?graph|House\.|name: Smoke" docs CONTRIBUTING.md .agents/*.md README.md --include='*.md' --exclude-dir=plans --exclude-dir=audits` (which reaches `docs/templates/*.md`) hits only `docs/migrations.md` (old-name rows); `CHANGELOG.md` `## [Unreleased]` holds the breaking-change entry; `bkit check` reports 0 writes; `pnpm bkit:graph:check` passes; a packed-tarball scratch consumer seeded with the old shape (old keys, old husky / CI tokens, shipped `bkit-trivy.yml`, shipped `scripts/ci/check-capstone.mjs` + `.test.mjs` with the CI step calling them, `House/` with an own rule) upgrades via `node dist/cli.js upgrade` to the new names and a second upgrade writes nothing; bkit's own pre-push gate passes on the new names
  - **TEST FIRST:** n/a — docs, generated mirrors, build output and a packed-tarball dogfood run; the issue's `dogfood-templates.test.ts` `adopted copies match renamed templates` lands in Tasks 2, 3, 5 and 6 under the runner names `this repo adopts its own templates > {path}`, and Task 1's `.husky/*` and `bkit-ci.yml` copies are gated by its `DONE WHEN` (`dogfood-templates.test.ts` passes)

<!-- bkit:task 12 end -->

<!-- bkit:group 5 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test sits in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green.
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** errors logged and traced per `docs/observability.md`.
- [ ] **Update documentation:** affected docs rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit` (bkit's deepest push gate, now calling `bkit:lint:prose` / `bkit:slop:delta`) and `bkit check` (0 writes) pass.
- [ ] **Test Synchronization:** no E2E suite; existing template and migration tests updated in the task that changes their surface (Tasks 1-10).
- [ ] **Build Configuration:** `branding.test.ts` and the new tests sit under `.bkit/core/engine/**/*.test.ts`, which the `dist/` build excludes; `pnpm build` output has no test file.
- [ ] **Unit (`.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/audits/templates/{template-ci-yml,templates,templates-content,branding,ci-scripts}.test.ts`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/install/modules/core.test.ts`):** gate chains, tool-script keys, CI steps, smoke and health stubs, `scripts/ci/bkit-*` paths, Vale style, graphify list, branding guard (positive and seeded negatives), adopted copies, token rewrite and residual warning.
- [ ] **Integration (`.bkit/core/engine/install/modules/core.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`):** each migration seeds the old shape in a real tmpdir; idempotency, dry-run and no-canonical-hash rows.
- [ ] **Apply local migrations:** n/a — no database.
- [ ] **Run all tests:** `pnpm test` (unit + integration) passes; `pnpm bkit:graph:check` and `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exit 0.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch directory, install the packed tarball of the current release, seed the Concrete Example's starting state (including shipped `scripts/ci/check-capstone.mjs` + `check-capstone.test.mjs` and the CI step calling them), then install the branch's packed tarball and run `bkit upgrade --dry-run`, `bkit upgrade`, `bkit upgrade`; the first lists the writes and changes nothing, the second lands the Concrete Example outcome, the third writes nothing.
- [ ] **Step 2:** In that scratch consumer, run `pnpm bkit:lint:prose` on a file with a filler word; the finding prints as `Bkit.Filler`.
- [ ] **Step 3:** On a PR in bkit, `gh pr checks` lists `bkit-trivy` for the Trivy job and, after a `bkit-ci` run, `bkit-cloud-context (workflow_run)`; after merge to `main`, `gh run list --workflow=bkit-renovate.yml` shows the next scheduled run under `bkit-renovate` (scheduled runs read the default branch's workflow file, knowledge row `kn-core-3-github-apps-ci-integrations-read-config-from-the-default-b`).
