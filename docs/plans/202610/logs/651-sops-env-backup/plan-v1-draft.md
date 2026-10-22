<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh -->

# Env Files SOPS-Encrypted Backup + Two-Way `.env.example` Check Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.
>
> **Rules:**
>
> - Any tools mentioned below are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Source of truth: literal `[x]` vs `[ ]` checkboxes in this document; `[ ]` means not DONE regardless of context.

## Context & Goals

**Problem (issue #651).** Gitignored env files hold the only readable copy of each value on one machine; machine loss = hunt down or rotate every value. Hand-made `.env.*.backup` copies (seen in a consumer) are equally unbacked. `bkit-secrets.mjs check` compares `.env.example` → env file only, so a key added to an env file and never to the example goes unnoticed.

**Goals.**

1. New copy-and-own template **env backup**, adopted by bkit: every gitignored `.env` / `.env.*` gets a SOPS (one `age` key) encrypted sibling `{file}.enc`, tracked in git, updated one variable at a time (`sops set` / `sops unset`) by the pre-commit hook. Git = the backup; its history shows which variable changed in which commit. One command restores every env file on a fresh clone holding the key.
2. `bkit-secrets.mjs` (template + bkit's root copy) compares its configured sources (`preview`, `production`; overlays excluded) with `.env.example` in both directions, plus missing example file, as warnings in `check`, `sync`, `sync --dry-run`; these findings never change the exit code; `--allow-missing` removed.

**Inputs.** `docs/plans/202610/logs/651-sops-env-backup/plan-input-1.md` (issue body + review comments; decisions table and SOPS 3.13.3 / age 1.3.2 test results). No design doc — design step skipped by review (label `next:plan`). Superseded plan `docs/plans/202610/651-sops-env-backup-plan.md` absent.

**Constraints carried from the issue.** Stack-agnostic; script byte-identical across repos, per-repo choices in config; values never printed; bkit's managed `.gitignore` block unchanged; copy-and-own consumers unaffected until they re-copy (release note, no migration).

> Success criteria once in `Acceptance Scenario → Success Criteria`; each runbook task has own `Done when`. Do not restate success list here.

**Related Issues:**

- #651 — Env files: SOPS-encrypted backup in git, .env.example both ways (open; this plan)
- #497 — Secrets sync template and config audit that checks secret values match (state not in plan input)
- #529 — secrets: pluggable store adapters (custom modules) + built-in Cursor/agent-host cloud stores (state not in plan input)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Spec

> [!IMPORTANT]
> What good looks like; canonical for the plan phase. Subagents (plan generate, plan review, plan summary) must follow this spec. No plan subagent restates rules; this section = single source of truth for the plan.

- **Narrative:** 1–2 sentences, user POV (not system POV). User action + what they get back. Source, first that carries it wins: design `## Acceptance Scenario` → verbatim; issue `Narrative` (change shape, `.bkit/trackers.md` § Issue shapes) → verbatim; audits only (`docs/audits/`) → user/operator impact from in-scope findings. None → both fields = `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never fabricate; Gate 1 blocked until human fills.
- **Success Criteria:** <=5 bullets, measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), not steps (e.g. "call API, render component"). Design count ≠ 5 → smallest set proving feature. Design → verbatim. No design → issue `Success Criteria` verbatim. Audits only → one bullet per in-scope finding id from `Expected`; no 5-bullet cap.
- **Process Sketch:** Design → plan inherits/refines. same happy-path (`Concrete Example`) + branches (`Edge Cases`) as `WHEN X → THEN Y` (3–7 lines); reuse exact examples, do not invent. Outcomes, not steps.
- **Key Edge Cases:** Design → plan inherits. Concurrency, conflicts, failures, cross-feature — not trivial validation (plan adds that).
- **Edge Cases:** Plan phase — design Key Edge Cases verbatim (no design → issue `Edge Cases` rows verbatim) + validation / error / boundary cases.
- **Concrete Example:** Plan phase only. Role, starting state, numbered steps, observable outcome. One scenario, not a list.
- **Derived Test Matrix:** Plan phase only. One row per testable behaviour → exactly one `Agent Execution Runbook` task. No row without a target file. In-scope audit behaviour → one row. Issue `Derived Test Matrix` rows → kept verbatim; add missing rows.

### Narrative

> Inherited from design, else the issue; do not rewrite.

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

> Suggestion for the human — NOT adopted, never treated as the Narrative until a human writes it in: "As a developer, I commit my env file changes as usual and git keeps an encrypted copy of every env file beside it; on a new machine I run one command with my key and get every env file back, and the secrets sync tells me when an env file and `.env.example` disagree." (derived from issue § Outcome 1–2)

### Success Criteria

> Inherited from design, else the issue; do not rewrite.

- Fresh clone + the one decryption key → every env file restored with one command.
- Changing one value changes only that variable's line in its encrypted file, plus SOPS's two bookkeeping lines (`sops_lastmodified`, `sops_mac`). Unchanged variables stay byte-identical. An added or removed variable shows as one added or removed line.
- A commit on a machine holding the key updates and stages every `.enc` copy whose plain file changed.
- A new env file anywhere in the repo is picked up with no setup, unless it matches the skip list.
- `bkit-secrets.mjs sync` and `check` warn on a key in an env file missing from `.env.example`, a key in the example missing from an env file, or no example file; they never fail on these and the sync still runs.
- bkit adopts the template on its own env files; the root copy stays byte-identical to the template.

> Issue § Success criteria verbatim (6 bullets; Spec: no design → issue verbatim, which overrides the 5-bullet cap).

### Process Sketch

> Inherited from design; plan may refine. `Concrete Example` (happy path) + `Edge Cases` (branches) as `WHEN X → THEN Y`, not prose — same examples. Do not invent new examples. Sense-check top-level process HERE without prose below. Outcomes, not implementation steps.

- **WHEN** a developer holding the age key changes one value and adds one variable in `apps/web/.env.preview`, then commits **→ THEN** the commit carries `apps/web/.env.preview.enc` with exactly that variable's line changed, one added line, plus `sops_lastmodified` + `sops_mac`; every other line byte-identical.
- **WHEN** a new env file appears in any folder not on the skip list **→ THEN** the next commit creates and stages its `.enc` with no setup.
- **WHEN** a fresh clone with the key runs `node scripts/env-backup/bkit-env-backup.mjs restore` **→ THEN** every env file with a tracked `.enc` is back (mode 0600); env files already present are kept.
- **WHEN** `node scripts/secrets/bkit-secrets.mjs check` / `sync` runs and an env file and `.env.example` disagree in either direction, or the example is absent **→ THEN** each gap prints as a warning, the exit code is unchanged, the sync still writes.
- **IF** the machine has no key (cloud agent) **→ THEN** one warning, nothing written, the commit proceeds.
- **IF** `.gitignore` would hide an `.enc` **→ THEN** the commit stops, printing the ignoring `source:line:pattern` and the exact line (`!.env.enc` / `!.env.*.enc`) to add after it.
- **IF** a plain file is absent **→ THEN** its tracked `.enc` stays untouched, never emptied.

### Concrete Example

> Plan expands from design.

**Setup:** Developer in a repo that adopted the template (`scripts/env-backup/`, `.sops.yaml` holding the age public key, `.husky/pre-commit` block, `.husky/post-commit`, `.gitignore` lines `!.env.enc` / `!.env.*.enc`). `sops` + `age` installed; age private key in the SOPS default key file (or `SOPS_AGE_KEY_FILE`). Tracked `.bkit/.env.enc` and `apps/web/.env.preview.enc` exist; `apps/web/.env.example` lists the old keys.

**Steps:**

1. Developer changes one value and adds one variable in `apps/web/.env.preview`, runs `git commit -m "…"` → pre-commit `encrypt` decrypts `apps/web/.env.preview.enc` in memory, compares per key, runs `sops set` for the changed and the added key, verifies the decrypted map equals the plain file, stages the `.enc`; `.bkit/.env.enc` (plain file unchanged) stays byte-identical and unstaged.
2. Developer runs `git show HEAD -- apps/web/.env.preview.enc` → diff shows one changed variable line, one added line, `sops_lastmodified`, `sops_mac`; nothing else.
3. Developer runs `node scripts/secrets/bkit-secrets.mjs check` → warning names the added variable as missing from `apps/web/.env.example`; exit 0.
4. Laptop lost. On a new machine: `git clone`, key pasted from the password manager into the key file, `node scripts/env-backup/bkit-env-backup.mjs restore` → `.bkit/.env` and `apps/web/.env.preview` written (mode 0600), one line per restored file naming the path only.

**Outcome:** Every env file is back with the same keys and values; git history shows which variable changed in which commit; the example gap is visible without failing anything; no value appeared in any output.

### Edge Cases

> Plan expands from design's Key Edge Cases.

Issue-decided rows (from issue § Decisions already made) first, then plan-added.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| No key on the machine (cloud agent) | `encrypt` prints one warning, writes nothing, exits 0; commit proceeds |
| Plain file absent, its `.enc` tracked | `.enc` left untouched, never emptied |
| `.gitignore` would hide an `.enc` | exit 1 → commit stops; prints `source:line:pattern` from `git check-ignore --no-index -v` and the exact line (`!.env.enc` / `!.env.*.enc`) to add after it |
| Env file matches skip list (defaults `.vercel/**`, `supabase/.temp/**`, `.worktrees/**`, `.claude/worktrees/**`, `node_modules/**`, `tmp/**` per Q10) | never a candidate |
| Whole-file re-encrypt would rewrite every line | never used for an existing `.enc`; per variable `sops set` / `sops unset` only |
| Plain file unchanged | `.enc` byte-identical, not staged |
| `sops` missing or below the script's minimum version | one warning, exit 0; commit proceeds |
| Env file inside a gitignored folder | never a candidate (Q5) |
| Symlinked env file; tracked `.env*`; `.envrc`; `.env.example`; `*.enc` | never candidates |
| Nested git repo / submodule | not descended |
| Line with no `=` (not blank, not `#`) | exit 1 naming `file:line`; no line content printed |
| Duplicate key | exit 1 naming `file:line` + key; no value printed |
| `.sops.yaml` missing or still holding `{{AGE_PUBLIC_KEY}}` | exit 1 naming the fix |
| Config unknown key (typo) | exit 1 naming the key |
| Bad CLI arguments | exit 2 + usage |
| Value with CRLF, quotes, `=`, `#`, spaces, literal `\n`, empty | decrypts to the same raw text after the first `=` |
| `sops set` / `unset` fails mid-update | original `.enc` bytes restored; exit 1 naming the file |
| Pathspec commit `git commit -- paths` (agents' default) | `.enc` lands in the commit; post-commit `restage` leaves the real index == HEAD (Q1) |
| Linked worktree | one-line note, nothing written, exit 0 (Q2) |
| Merge conflict in an `.enc` (`sops_mac` / `sops_lastmodified` lines) | decrypt fails → exit 1 with the fix: take one side whole, rerun `encrypt` |
| `encrypt --dry-run` | lists file names that would change; writes and stages nothing |
| `restore`, plain file already present | kept, reported `kept`; never overwritten (`wx`) |
| `restore`, no key | exit 1 |
| `restore` target git would not ignore | refused, exit 1 — a restore never creates a committable plain file |
| `rekey` after `.sops.yaml` gets a new public key | new key decrypts every `.enc`; old key fails; values unchanged; every line changes once (new data key) |
| `check` / `sync` / `sync --dry-run`: env key missing from example; example key missing from env file; empty value (Q3); no example file | warning each; exit code unchanged; sync still writes |
| `protected` key | exempt both directions |
| `optional` key | exempt from example → env file (missing / empty) only |
| `check <file>` naming a file that does not exist | exit 2 (unchanged) |
| `--allow-missing` passed | unknown option, exit 1 |
| `list` | no example warnings (its output feeds repo tooling) |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign tier(s) via **tier-selection rubric** in `docs/testing.md` (behaviour may need more than one). Boundary rows use that doc's rigor — reach real boundary, assert ground-truth signal, `@live` for external / deployed boundaries; do not restate those rules here.
>
> **Discrimination (no false-green):** assertion MUST hit the **affected** surface and FAIL if behaviour broken — not transport status (200/201), not proxy surfaces, never mock away the boundary under test.

**Tier Key** — use these exact tier names in the `Type` column (they must match `docs/testing.md`); pick the **lowest tier that actually exercises** the behaviour (a behaviour may need several):

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift (global gate, not a per-feature row) | `tsc`, lint, and `bkit check` pass on the changed files |
| **Unit** | pure function / single module, no I/O | service parses a payload correctly |
| **Integration** | crosses a LOCAL stateful boundary (own DB / API), no mocks at the boundary, fresh instance | API endpoint enforces tenant isolation against a fresh local instance |
| **@live (golden)** | crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model, payment, deployed schema, RLS) — reach it, assert a ground-truth signal | a real 3rd-party API returns content and a boundary-only identity |
| **E2E** | user-visible UI flow / DOM state | user creates an event and sees it in the list |
| **fresh-DB replay** | new / changed migration or seed (`bkit-tests-migration`) | migration replays from empty and the seed loads |
| **Smoke** | post-deploy health of a deployed surface (global observability gate) | deployed health route returns 200 |

Boundary = real `sops`, `age-keygen`, `git` binaries in a fresh temp repo (`docs/testing.md` tier rubric: local stateful boundary → Integration). Fault injection only via a PATH wrapper that delegates to the real `sops`; a stub `pnpm` on PATH stands in for the format gate only (not the boundary under test). Abbreviations: **EB** = `.bkit/core/engine/audits/templates/env-backup.integration.test.ts`; **SS** = `.bkit/core/engine/audits/templates/secrets-sync.integration.test.ts`.

<!-- prettier-ignore -->
| # | Test description | Type | Target file | Task |
| --- | --- | --- | --- | --- |
| 1 | SOPS contract the script relies on: `set --value-stdin` (JSON) / `unset` / `decrypt` on `*.enc` with `--input-type dotenv --output-type dotenv`; `set` / `unset` change only the variable line + `sops_lastmodified` + `sops_mac`; decrypt without key exits 128; dotenv parse of CRLF, quotes, `=`, `#`, spaces, literal `\n`, empty values, `#` comments | Integration | EB | 1 |
| 2 | Tool helper: `false` locally when a tool is absent from PATH; throws naming the tool when `CI` is set | Unit | `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts` | 1 |
| 3 | Discovery: env file in a new nested untracked folder picked up with no setup; skip-list globs (`*` one folder, `**` any depth, any-depth match, leading `/` anchors), file in an ignored folder, `*.enc`, symlink, tracked `.env`, `.envrc`, `.env.example` all excluded | Integration | EB | 2 |
| 4 | `.gitignore` hides an `.enc` → exit 1; output names `source:line:pattern` and the exact `!` line; a negated pattern counts as not ignored | Integration | EB | 2 |
| 5 | No age key → warning, exit 0; no `.enc` created or changed (first-encrypt probe file deleted) | Integration | EB | 2 |
| 6 | No `sops` on PATH, or below minimum version → warning, exit 0 | Integration | EB | 2 |
| 7 | `.sops.yaml` missing / still `{{AGE_PUBLIC_KEY}}` → exit 1 | Integration | EB | 2 |
| 8 | Config unknown key → exit 1 naming it; unknown verb / flag → exit 2 | Integration | EB | 2 |
| 9 | Linked worktree → one-line note, exit 0, nothing written | Integration | EB | 2 |
| 10 | One changed value → `git diff` of the `.enc` = that variable's line + `sops_lastmodified` + `sops_mac`; every other variable line byte-identical | Integration | EB | 3 |
| 11 | Added / removed variable → exactly one added / removed line + the two bookkeeping lines | Integration | EB | 3 |
| 12 | Unchanged plain file → `.enc` byte-identical and not staged | Integration | EB | 3 |
| 13 | First encrypt → new `.enc` decrypts to the plain file's key/value map; staged | Integration | EB | 3 |
| 14 | Plain file absent → tracked `.enc` byte-identical | Integration | EB | 3 |
| 15 | Line with no `=` / duplicate key → exit 1 naming `file:line` (+ key); output lacks the line's text | Integration | EB | 3 |
| 16 | Round-trip fidelity: CRLF, quotes, `=`, `#`, spaces, literal `\n`, empty value → decrypted raw values equal the plain file's | Integration | EB | 3 |
| 17 | `sops set` failure mid-update (PATH wrapper fails the 2nd `set`) → original `.enc` bytes restored, exit 1 | Integration | EB | 3 |
| 18 | `encrypt --dry-run` → names files that would change; worktree and index unchanged | Integration | EB | 2 |
| 19 | Restore: fresh clone + key → every tracked `.env.enc` / `.env.*.enc` restored, mode 0600; present plain file kept; target git would not ignore refused; no key → exit 1 | Integration | EB | 4 |
| 20 | Rekey: after `.sops.yaml` switches to a new public key, new key decrypts every `.enc`, old key fails, values unchanged; `.enc` files staged | Integration | EB | 5 |
| 21 | Pre-commit end-to-end: template `.husky/pre-commit` wired via `core.hooksPath` (stub `pnpm`), commit with key → changed `.enc` in the commit; `.enc` of an unchanged plain file not in it | Integration | EB | 6 |
| 22 | Pathspec commit `git commit -- other.txt` with a changed env file → `.enc` in HEAD; after the template `.husky/post-commit` runs, `git diff --cached --name-only` lists no `.enc` | Integration | EB | 6 |
| 23 | Sentinel value never printed: stdout + stderr of every verb (`encrypt`, `--dry-run`, `restore`, `rekey`, `restage`) and every error path lack the sentinel | Integration | EB | 6 |
| 24 | `.husky/post-commit` template carries no bkit markers; `.husky/pre-commit` template env-backup block sits after `pnpm bkit:gate:format` and before the disk-prune block | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 6 |
| 25 | Dogfood parity (scripts): root `scripts/env-backup/*` identical to the template; `.sops.yaml` = template + public-key placeholder fill | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 2 |
| 26 | `check`: env key missing from example, example key missing from env file, empty value, no example file → one warning each; exit 0 | Integration | SS | 8 |
| 27 | `sync` and `sync --dry-run` print the same warnings before the store loop and still write / plan | Integration | SS | 8 |
| 28 | `--allow-missing` → exit 1 unknown option; usage text lacks it | Integration | SS | 8 |
| 29 | `protected` exempt both directions; `optional` exempt from example → env file only | Integration | SS | 8 |
| 30 | `check <file>` naming a file that does not exist → exit 2 | Integration | SS | 8 |
| 31 | Tip `env-backup` fires when `.bkit/.env` exists and `scripts/env-backup` is absent; silent on cloud / CI and once adopted | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 9 |
| 32 | Dogfood parity (hooks): root `.husky/post-commit` identical; root `.husky/pre-commit` = template + the bkit-only dist region (re-anchored after the env-backup block) | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 6 |
| 33 | bkit's root `.gitignore` leaves `.bkit/.env.enc` and a nested `.env.preview.enc` trackable (`git check-ignore --no-index` against the repo) | Integration | EB | 7 |

Success Criteria → rows: SC1 → 19 · SC2 → 10, 11 · SC3 → 21, 22 · SC4 → 3 · SC5 → 26, 27 · SC6 → 25, 32, 33.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

> [!WARNING]
> **Breaking (template `bkit-secrets.mjs`, copy-and-own):** `check --allow-missing` → now `unknown option` exit 1. `check` no longer exits 2 on a missing or empty example key (warning instead). A CI step or script relying on either breaks when the consumer re-copies. bkit's own repo: no caller (`grep -rn "allow-missing"` → script copies only). Release note under CHANGELOG `[Unreleased]` → Changed; no migration (issue decision, A7).

> [!IMPORTANT]
> **Behaviour change in bkit's repo:** every commit in the main checkout with the age key now runs `encrypt` and may stage `.enc` files the committer did not name; a `.gitignore` gap, malformed env line or duplicate key stops the commit (Q4). Shipped rule `.agents/rules.md` § Secrets gains the `*.enc` exception (Q7).

**Proposed names**

<!-- prettier-ignore -->
| Kind | Name | Notes |
| --- | --- | --- |
| Template folder | `.bkit/templates/scripts/env-backup/` → `scripts/env-backup/` | sibling of `scripts/secrets/` |
| Script | `bkit-env-backup.mjs` | `bkit-` prefix like every template script |
| Config | `bkit-env-backup.config.mjs` | `{ skip: string[] }`; unknown keys rejected |
| Verbs | `encrypt [--dry-run]`, `restore`, `rekey`, `restage` | `restage` is hook-only |
| SOPS config | `.sops.yaml` (repo root) | SOPS's own discovery name |
| Placeholder | `{{AGE_PUBLIC_KEY}}` | new row in templates.md § Placeholders |
| Hook | `.husky/post-commit` (template + root) | first post-commit template |
| Encrypted copy | `{file}.enc` (e.g. `.bkit/.env.enc`, `apps/web/.env.preview.enc`) | issue layout |
| `.gitignore` lines | `!.env.enc`, `!.env.*.enc` | issue |
| Function | `compareExample` in `bkit-secrets.mjs` | shared by `check` / `sync` |
| Test helper | `hasTool(bin)` in `vitest.tsx-bin.ts` | beside `requireTsx` |
| Setup tip id | `env-backup` | `catalogue.ts` |
| templates.md section | `## Env backup — an encrypted copy of every env file` | table row name `Env backup` |
| Test file | `.bkit/core/engine/audits/templates/env-backup.integration.test.ts` | sibling of `secrets-sync.integration.test.ts` |
| Output prefix | `[env-backup]` | stderr warnings / errors |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".
> **Never a bare question.** Each carries 2-3 options, a recommendation, and default if unanswered — human must decide from the page alone. Canonical plan shape.
> Design → carry its options / recommendation forward where already answered.

> [!WARNING]
> **Narrative MISSING** (see `### Narrative`) blocks Gate 1 until a human writes it in. Q6 (CI workflow edit) and Q7 (shipped rule) need explicit human confirmation per `.agents/rules.md`. Q9 needs Christian to supply the age public key.

**Open Questions**

- **Open Question Q1 — pathspec commits.** `git commit -- paths` (the agents' default, `.agents/rules.md` § Commits) runs pre-commit against a temporary index (git `builtin/commit.c` partial-commit flow): the hook's `git add` reaches the commit but not the real index, which keeps the old `.enc` staged → a later plain `git commit` reverts it. → human decides.
  - **Options:** A — stateless post-commit `restage` (`git add` an `.enc` only when worktree == HEAD and index ≠ HEAD) + new `.husky/post-commit` template + `encrypt` also stages any managed `.enc` whose worktree copy differs from the index · B — stage-when-differs only; real index shows a stale staged `.enc` until the next full commit · C — nothing; revert risk stays
  - **Recommended:** A — closes the revert with no state file; test-first reproduces the bug (row 22); if it does not reproduce, drop post-commit (A9).
  - **Default if unanswered:** A
- **Open Question Q2 — linked worktrees.** Each worktree holds stale plain copies (or none); parallel branches would rewrite the same `.enc`. → human decides.
  - **Options:** A — skip with a one-line note; the main checkout is the only writer · B — use the worktree's own plain copies (stale snapshots roll values back; parallel branches conflict on `sops_lastmodified`) · C — read the main checkout's plain files (still conflicts across parallel branches)
  - **Recommended:** A — no rollback, no cross-branch conflicts; bkit's own worktree commits run no husky hooks anyway.
  - **Default if unanswered:** A
- **Open Question Q3 — empty value in an env file for a key the example lists.** Today ❌ + exit 2. → human decides.
  - **Options:** A — warning · B — keep ❌ / exit 2
  - **Recommended:** A — issue: example findings "never change the exit code".
  - **Default if unanswered:** A
- **Open Question Q4 — setup and per-file errors** (`.sops.yaml` missing / placeholder, line with no `=`, duplicate key, config typo, any other sops failure). → human decides.
  - **Options:** A — stop the commit (exit 1) naming `file:line` · B — warn and skip that file
  - **Recommended:** A — a silent skip leaves a stale backup that looks current; the issue's warn-and-proceed covers only "no key" and "plain file absent".
  - **Default if unanswered:** A
- **Open Question Q5 — env files inside gitignored folders.** → human decides.
  - **Options:** A — never candidates (`git ls-files --directory` collapses them; `!` lines cannot re-include a file under an ignored folder) · B — candidates; stop with "add to skip list"
  - **Recommended:** A — `.enc` there could never be tracked; documented in templates.md.
  - **Default if unanswered:** A
- **Open Question Q6 — CI install of `sops` + `age` in `bkit-tests-integration`** (`.github/workflows/bkit-ci.yml:631`), SHA-pinned like Vale (`bkit-ci.yml:441-447`). CI edits need human confirmation. → Christian.
  - **Options:** A — install (VERSION + SHA256 env, renovate comment, `curl --retry`, `sha256sum -c -`) for `getsops/sops` and `FiloSottile/age` linux-amd64 · B — fake `sops` stub (mocks the boundary under test; rejected by `docs/testing.md`)
  - **Recommended:** A — `docs/testing.md:143`: a self-skipping suite must not skip on CI.
  - **Default if unanswered:** A, but Task 1's CI step waits for the confirmation box.
- **Open Question Q7 — `.agents/rules.md` § Secrets carve-out.** `.bkit/core/.agents/rules.md:93` "NEVER stage `.env*`" covers `.env.enc`; the hook stages them. Shipped rule. → Christian.
  - **Options:** A — amend: SOPS-encrypted `*.enc` copies are the exception · B — leave; agents may never stage an `.enc` by hand and reviewers read the hook's staging as a rule breach
  - **Recommended:** A — rule and template agree.
  - **Default if unanswered:** A, applied only after the confirmation box.
- **Open Question Q8 — setup tip `env-backup`** in `.bkit/core/engine/checks/tips/catalogue.ts`. → human decides.
  - **Options:** A — add (fires on `.bkit/.env` present, `scripts/env-backup` absent, not cloud / CI) · B — templates.md section only
  - **Recommended:** A — adoptable templates are surfaced through setup tips (e.g. `secrets-sync`, `catalogue.ts:262-271`); without one the template is found only by reading templates.md.
  - **Default if unanswered:** A
- **Open Question Q9 — bkit's own age key.** → Christian.
  - **Options:** A — Christian runs `age-keygen`, stores the private key in his password manager, supplies the public key (`age1…`) · B — the agent generates it (agents must not handle secrets)
  - **Recommended:** A
  - **Default if unanswered:** Task 2 blocks at the root `.sops.yaml` public-key fill.
- **Open Question Q10 — `tmp/**` in the template default skip list.** bkit's root `.gitignore:34` ignores `tmp/**`, so an agent's scratch `.env` copy under `tmp/` would stop every commit (its `.enc` is ignored). → human decides.
  - **Options:** A — template default · B — bkit's own config only (root config then needs a dogfood `adapt` edit instead of `identical`)
  - **Recommended:** A — `tmp/` scratch is common in consumers too; keeps root config identical.
  - **Default if unanswered:** A
- **Open Question Q11 — public-repo exposure.** Committing `.bkit/.env.enc` to the public repo publishes key names, value lengths (ciphertext length) and, per A1, possibly comments. A leaked private key exposes every value in history → rotate every value. → Christian.
  - **Options:** A — accept (issue design) · B — bkit does not adopt on `.bkit/.env` (contradicts SC6)
  - **Recommended:** A — names are already public via `.env.example` and docs; values stay encrypted.
  - **Default if unanswered:** A (A3).

**Assumptions**

- **Assumption A1:** SOPS facts not in the issue's test table — `set --value-stdin` JSON input, decrypt-without-key exit 128, minimum version with `unset` + `--value-stdin`, `updatekeys --yes` / `rotate` flags on dotenv, `--output`, dotenv parse / emit of CRLF, quotes, `\n`, comments, `sops --version` network check — hold as Task 1's characterisation tests (row 1) pin them → wrong fact changes the script's call shape, not the design; Task 1 fixes it before Task 2.
- **Assumption A2:** restore rebuilds keys + values (+ comments if SOPS keeps them, A1) in SOPS's order as of the first encrypt, not a byte-identical file → a user expecting identical bytes sees reordered lines; docs state it.
- **Assumption A3:** Q11 exposure accepted → if not, bkit's adoption drops `.bkit/.env` and SC6 needs a human rewrite.
- **Assumption A4:** Trivy secret scan and GitHub push protection do not flag SOPS ciphertext or an age public key → if they do, CI or push fails on adoption; fix = scanner allowlist entry, human-confirmed.
- **Assumption A5:** `.bkit/.env.enc` is created by the owner's first commit in the main checkout after merge (the build agent never touches the private key or plain env files) → SC6 is met by the template copy + config + hooks at merge; the `.enc` follows.
- **Assumption A6:** Christian supplies the public key (Q9) before Task 2 → else Task 2 stops at the root `.sops.yaml`.
- **Assumption A7:** copy-and-own consumers keep their old `bkit-secrets.mjs` until they re-copy → release note only, no migration (issue).
- **Assumption A8:** one decrypt per tracked `.enc` per commit keeps the hook within a few seconds (pre-commit header rule: nothing over a few seconds) → if not, cache by plain-file mtime is a follow-up, not scope.
- **Assumption A9:** the pathspec index behaviour reproduces (row 22 red first) → if not, post-commit and `restage` are dropped and Q1 is moot.
- **Assumption A10:** `git ls-files --others --ignored --exclude-standard --directory` collapses only folders that are themselves ignored → if it also collapses an untracked folder whose only content is an ignored `.env`, discovery re-lists each collapsed folder that `git check-ignore -q` does not match (row 3 pins it).

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| SOPS + one age key, `{file}.enc` beside each plain file, per-variable `sops set` / `unset` | **Chosen** (issue) | One key + one `.sops.yaml` cover every folder; diff = changed variable line + 2 bookkeeping lines |
| dotenvx | Rejected (issue) | Per-file private keys + `.env.keys` per folder; in-place encryption; 2.x hosted / keychain features to switch off |
| git-crypt | Rejected (issue) | Whole-file blob; review cannot see which variable changed |
| Whole-file `sops encrypt` on every change | Rejected (issue test) | Rewrites every variable line + age header |
| Env backup as a new verb inside `bkit-secrets.mjs` | Rejected | Issue keeps `bkit-secrets.mjs` to store pushes over configured sources; env backup covers every env file, adoptable alone |
| Import `parseEnv` / `run` from `scripts/secrets/bkit-secrets.mjs` | Rejected | Couples two independently adoptable templates; `parseEnv` strips quotes, drops `\r`, keeps first duplicate silently (`bkit-secrets.mjs:40-48`) — wrong semantics for byte-faithful backup |
| Keyless machines still create new `.enc` files (public key suffices to encrypt) | Rejected | Issue: no key → skip with warning; a keyless writer cannot verify the round-trip |
| Pathspec-commit fix via state file (pre-commit records, post-commit replays) | Rejected for Q1-A | Stateless rule (worktree == HEAD, index ≠ HEAD) needs no file and survives aborted commits |
| Glob matching via Node `path.matchesGlob` | Rejected | Experimental (prints `ExperimentalWarning`); copy `globToRegExp` semantics from `.bkit/core/engine/commands/ci/ci.ts:289-302` instead (templates cannot import engine code) |
| Fake `sops` in tests | Rejected | Mocks the boundary under test (`docs/testing.md`); real binaries + CI install (Q6) |

**Future phase (not scope):** CI decryption, store sync from env backup, hosted secret managers, key-storage automation (issue non-goals → `Out of Scope`); per-commit decrypt cache if A8 fails.

**Selection Rule:** pick the approach with the best quality-of-end-state, not the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Store sync from the env-backup template | Issue non-goal; `bkit-secrets.mjs` keeps store pushes | issue #651 § Constraints and non-goals |
| CI decryption of `.enc` files | Issue non-goal; no Success Criterion needs a key in CI | issue #651 § Constraints and non-goals |
| Hosted secret managers | Issue non-goal | issue #651 § Constraints and non-goals |
| Automating key storage (password-manager integration) | Issue non-goal; key entered by hand | issue #651 § Constraints and non-goals |

**Deferral rows (`docs/deferrals.jsonl`)** — checked: no existing `651-*` / `sops` / `env-backup` row. Append via `.bkit/jsonl.md` § Write Idiom (`ts` minted by `jq`), `kind:"deferral"`, `repo:"cbartens/bkit"`, `bkitVersion:"5.5.0"`, `workflow:"plan"`, `step:"plan-generate"`, `subagent:"bkit-plan-generate"`, `model:"claude-opus-5-5"`, `type:"feature"`, `severity:"LOW"`, `reason:"scope-declared"`, `status:"OPEN"`, `references:["651","#651 § Constraints and non-goals","docs/plans/202610/651-sops-env-backup-plan.md"]`:

<!-- prettier-ignore -->
| key | category | summary | description |
| --- | --- | --- | --- |
| `651-env-backup-store-sync` | `tooling` | Env backup does not push secrets to stores | Store pushes stay in `bkit-secrets.mjs`; the env-backup template only encrypts env files into `.enc` copies |
| `651-env-backup-ci-decryption` | `security` | CI never decrypts `.enc` copies | No age key in CI; restoring env files is a local, key-holder step |
| `651-env-backup-hosted-secret-managers` | `security` | No hosted secret manager backend for env backup | Git + SOPS + one age key is the only backend |
| `651-env-backup-key-storage-automation` | `security` | Key storage is not automated | The age private key is stored by hand; docs recommend a password manager |

> [!CAUTION]
> **Default = in-scope.** `Exempt` only if genuinely-additive — not required by `Success Criteria`, `Acceptance Scenario` / `Derived Test Matrix` row, or design (non-goals excepted). Required items → runbook task, never deferral; parking here = `Blocking` deferral → plan review / scope-check pulls back. Mirror each `Exempt` row in `docs/deferrals.jsonl`. Audit `LOW` → `Exempt` rows here.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Guardrails classify `.env.enc` / `.env.*.enc` as secret env files (`/^\.env[.*]/`), blocking agent reads of ciphertext | `.bkit/core/hooks/guardrails-tiers.js:192` | Task 3-7 verification by agents; shipped hook | needs design decision (ciphertext readable vs key names exposed to agents) |
| README "Templates ready to adopt" row for Env backup | `README.md:256-268` | Task 11 docs | fold in (one table row, plain language) |
| Agents audit Step 8 "env file not ignored" would flag tracked `.env*.enc` | `.bkit/core/docs/templates/bkit-audit-agents.md:113` | Shipped audit template | fold in (one clause exempting SOPS `.enc` copies) |
| Setup-tip lines missing from `.bkit/wording.md` fail `wording.test.ts` | `docs/failures.jsonl` `wording-test-setup-tips-lines-not-in-wording-file` (OPEN) | Task 9 tip; baseline red | keep separate; baseline it in Pre-Flight |
| `bkit:check:dist` pre-commit block stalls parallel agents | `docs/failures.jsonl` `precommit-check-dist-blocks-parallel-agents` (OPEN) | `.husky/pre-commit` (Task 6-7), Task 9 dist | keep deferred |
| Secrets-sync config audit that checks values match | #497 | `bkit-secrets.mjs` (Task 8) — merge conflicts likely | keep separate |
| Pluggable store adapters + agent-host stores | #529 | `bkit-secrets.mjs` (Task 8) | keep separate |

> [!CAUTION]
> **Candidates, not scope.** Human review only — not runbook tasks, must not expand scope. Fold in only on design scope or explicit human decision → becomes task, leaves list.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

Inapplicable (skipped): New API Route, New DB Table/Column, Role-Gated Mutation, Redirect URL, Webhook — no routes, DB, roles, redirects or webhooks.

- [ ] **User Input** — CLI args parsed strictly (unknown verb / flag → exit 2; `bkit-secrets.mjs` unknown option → exit 1); config keys validated (unknown → exit 1); env-file lines validated (no `=` / duplicate → exit 1). Paths come from `git ls-files` only; every subprocess `spawnSync` with an argv array, never a shell string (knowledge `kn-6-…`).
- [ ] **PII / secret values absent from output** — no value in stdout / stderr / argv / temp files: values passed to `sops set` on stdin; sops stderr allowlisted; validation errors print `file:line` + key only; sentinel test across every verb (row 23); `bkit-secrets.mjs` warnings print key names only (rows 26-29).
- [ ] **New Secret** — bkit's age private key (Q9): generated by Christian, kept in his password manager + SOPS key file, never in the repo, `.bkit/.env`, CI or any agent context. `.sops.yaml` holds the public key only. No CI decryption (non-goal).
- [ ] **Committed ciphertext in a public repo** (`docs/security.md` § Public repo content, line 123-131) — `.bkit/.env.enc` publishes key names + value lengths (+ comments per A1); accepted per Q11 / A3; a leaked private key → rotate every value (Rollback). Secret scanners must not flag ciphertext (A4).
- [ ] **No committable plaintext** — `restore` refuses a target git would not ignore; `encrypt` writes no plaintext temp file; `.gitignore` gate refuses an ignored `.enc`, never adds a broad `!` itself.
- [ ] **Supply chain** — CI binaries SHA-256-verified before use, versions pinned with renovate comments (Q6, `docs/security.md` § Supply-Chain).
- [ ] **Agent rule** — `.agents/rules.md` § Secrets carve-out limited to SOPS-encrypted `*.enc` copies (Q7); `.env*` plain files stay never-stage.

## Pre-Flight / Dependencies

**CRITICAL:** Check off all core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core

Always verify.

- [ ] **Package Management:** No new npm dependency — template script uses Node built-ins only (`node:child_process`, `node:fs`, `node:path`, `node:crypto`, `node:os`). `package.json` + `pnpm-lock.yaml` unchanged; `pnpm install --frozen-lockfile` clean.
- [ ] **Dependency Versions:** Run `pnpm bkit:deps:outdated`; `node --version` vs `.nvmrc`; `sops --version --disable-version-check` (issue tested 3.13.3) and `age --version` (1.3.2) locally; latest `getsops/sops` / `FiloSottile/age` releases + their `checksums` assets for the Q6 pin (`gh release view -R getsops/sops`, `gh release view -R FiloSottile/age`).
- [ ] **Existing-Solution Search (reuse over duplicate):** done at plan time → `Reuse Inventory` (in-repo: `sops`, `check-ignore`, `--ignored`, `post-commit`, `globToRegExp`, `parseEnv`, `requireTsx`, `hooksPath`; dependency: Node `path.matchesGlob` (experimental — rejected); ecosystem: SOPS dotenv store, dotenvx, git-crypt per issue). Re-run the in-repo greps at build start; a new hit → add a row.
- [ ] **User Context:** Write access to the worktree. Needs from Christian before Task 7: age public key (Q9). Never read, print or copy any `.env*` plain file or private key (`.agents/rules.md` § Secrets in output).
- [ ] **Project Context:** Winning ACTIVE rows applied — `489-templates-carry-no-bkit-blocks` (decision: post-commit template plain, no markers); `kn-6-use-execfilesync-over-execsync-when-the-argument-comes-from` (spawn with an argv array, never a shell string); `586-spawnsync-enobufs-can-report-exit-0` (explicit `maxBuffer` + check `r.error`); `subprocess-integration-tests-time-out-at-5000ms-under-high-load` (failure: subprocess tests live in `*.integration.test.ts`, 30s budget, `vitest.timeout-budget.ts`).
- [ ] **Testing & Quality:** Tiers per `docs/testing.md` rubric; missing-tool rule `docs/testing.md:143` (one shared helper, no early `return`, no skip on CI); `requireTsx()` pattern `docs/testing.md:682`; subprocess tests → `*.integration.test.ts` (`vitest.config.ts:7`). Baseline before Task 1: `pnpm bkit:gate:static-unit-integration` green except known OPEN `wording-test-setup-tips-lines-not-in-wording-file` (record its pre-existing red, do not fix here).
- [ ] **Prerequisite Plans:** None.

### Conditional

Verify only when applicable.

- [ ] **Secrets & Env Vars:** New secret = bkit's age private key (Q9) — lives in Christian's password manager + the SOPS key file on his machine, never in the repo, `.bkit/.env`, CI or any store. No new env var in any store; `SOPS_AGE_KEY_FILE` / `SOPS_AGE_KEY` are optional machine-local overrides SOPS reads itself. `.sops.yaml` holds the public key only.
- [ ] **Architecture & UI:** New files only under template roots (`.bkit/templates/scripts/env-backup/`, `.bkit/templates/.sops.yaml`, `.bkit/templates/.husky/post-commit`) + their adopted root copies — same topology as `scripts/secrets/` (`.bkit/core/.bkit/templates.md` § Contract). No UI.
- [ ] **Observability:** Script output prefix `[env-backup]` on stderr for warnings / errors, names and `file:line` only; no value, no sops stderr outside the allowlist. No new log drain, span or audit table.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all applicable boxes above. **do not stop for user permission.** Proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Reuse Inventory complete:** every capability has a row with non-empty `Search performed` + `Decision`; every `NEW` cites an allowed reason.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. The stores this feature writes are files and the git index:

<!-- prettier-ignore -->
| Write path | Stores touched | Failure surfaces as |
| --- | --- | --- |
| `encrypt` (existing `.enc`) | worktree `.enc` (via `sops set` / `unset`), git index (`git add`) | any non-zero `sops` / `git` status or `r.error` → original `.enc` bytes restored, exit 1 naming the file; commit stops |
| `encrypt` (new `.enc`) | temp path beside the target → verified → `rename` into place; index | verify mismatch / sops error → temp deleted, exit 1 |
| `restore` | plain env file (`wx`, mode 0600) | open `EEXIST` → `kept`; any other error → exit 1 naming the path |
| `rekey` | every tracked `.enc` (`updatekeys`, `rotate`), index | per-file failure → original bytes restored, exit 1 |
| `restage` (post-commit) | index only | `git add` failure → warning (commit already made), exit 0 per husky post-commit semantics |
| `bkit-secrets.mjs` example compare | none (read-only) | unreadable example → warning, never exit change |

**Invariant Conformance:** Multi-store or privileged writes → every mutation path maintains every store a read surface depends on, under a compatible privilege, with the returned error actually checked (never swallowed). If a write can fail on privilege/constraint, the plan says how that failure surfaces — not a silent 200.

### Data Schema Usage

None — no `docs/data-schema.md` tables or fields read or written.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- |
| Encrypt / decrypt env files per variable, restore, rekey (`bkit-env-backup.mjs`) | `grep -rn "sops"` over `.bkit/templates`, `.bkit/core/engine`, `scripts` → none; `ls .bkit/templates/scripts/` → no env-backup; SOPS dotenv store + dotenvx + git-crypt compared in issue | `.bkit/templates/scripts/secrets/bkit-secrets.mjs` — reads env files, pushes to stores; no encryption, configured sources only | NEW | (b) — issue fixes `bkit-secrets.mjs` to store pushes over configured sources ("otherwise unchanged") and makes env backup a separately adoptable template; folding in breaks that contract and its callers (`scripts/secrets/bkit-secrets.mjs`, `secrets-sync.integration.test.ts`) |
| Raw env-file parse (split `\n`, keep `\r`, reject no-`=` lines and duplicates) | `grep -n "function parseEnv"` → `bkit-secrets.mjs:40` | `parseEnv` — strips quotes, splits `\r?\n`, keeps first duplicate silently | NEW (inside the env-backup script) | (b) — changing `parseEnv` semantics breaks secrets value resolution (`readEnvFile` → `check` / `sync` / `drift`); cross-template import breaks standalone adoption |
| Config load rejecting unknown keys | `grep -n "unknown key"` → `bkit-secrets.mjs:542` | `loadConfig` idiom | EXTEND (pattern copy) | Same `CONFIG_KEYS` + throw-on-unknown idiom in `bkit-env-backup.config.mjs` loading; templates are single-file, no import |
| Subprocess wrapper (argv array, `maxBuffer`, `r.error`) | `grep -n "function run"` → `bkit-secrets.mjs:61`; knowledge `kn-6-…`, `586-spawnsync-enobufs-can-report-exit-0` | `run()` in `bkit-secrets.mjs` | EXTEND (pattern copy) | Same shape; adds stderr allowlist so sops errors never echo values |
| Skip-list glob match | `grep -rn "globToRegExp"` → `.bkit/core/engine/commands/ci/ci.ts:289`, `.bkit/core/engine/commands/workflow/branches.ts:150`; `grep -rn "glob" .bkit/templates/scripts/*.mjs` → none usable; Node `path.matchesGlob` (experimental) | engine `globToRegExp` — `*` / `?` one folder, `**/` zero-or-more | EXTEND (semantics copy) | Templates cannot import engine TS; copy the algorithm + add any-depth prefix and leading-`/` anchor |
| Discover gitignored env files | `grep -rn -- "--ignored"` → none; `grep -rn -- "--others"` → `ledgers.ts:324,447`, `workflows.ts:389` (tracked/untracked listing, no ignored mode) | None for ignored files | NEW (inside the script) | (a) — no ignored-file discovery anywhere |
| `.gitignore` hides an `.enc` → exact fix line | `grep -rn "check-ignore"` → none in templates / engine | None | NEW (inside the script) | (a) |
| Pre-commit wiring | `ls .bkit/templates/.husky/` → `pre-commit`, `pre-push` | `.bkit/templates/.husky/pre-commit` (+ root `.husky/pre-commit`) | EXTEND | Guarded block after `pnpm bkit:gate:format`, before disk prune |
| Post-commit restage | `ls .bkit/templates/.husky/` → no `post-commit`; `grep -rn "post-commit"` over templates / engine → none | None | NEW `.bkit/templates/.husky/post-commit` | (a) |
| SOPS creation rules | `grep -rn "sops.yaml\|creation_rules"` → none | None | NEW `.bkit/templates/.sops.yaml` | (a) |
| Two-way `.env.example` compare + warnings in `sync` | `grep -n "exampleRel\|allow-missing" bkit-secrets.mjs` → `check()` `:722-778`, `main()` `:794-822` | `check()` one-way compare | EXTEND | Extract shared compare; both directions + empty + missing example as warnings; called from `check` and `sync` |
| Setup tip | `grep -n "id: \"secrets-sync\"" catalogue.ts` → `:263-271` | `SETUP_TIPS` | EXTEND | Add `env-backup` entry |
| Tool presence for tests (`sops`, `age`, `age-keygen`) | `grep -rn "requireTsx\|vitest.tsx-bin"` → `vitest.tsx-bin.ts` + 12 importers; `docs/testing.md:143` | `vitest.tsx-bin.ts` `requireTsx()` | EXTEND | Add `hasTool(bin)` beside `requireTsx` — the one shared helper `docs/testing.md:143` asks for |
| CI install of pinned binaries | `grep -n "VALE_SHA256\|sha256sum -c" bkit-ci.yml` → `:441-447` | Vale install step | EXTEND (pattern copy into `bkit-tests-integration`, `:631`) | Same VERSION + SHA256 + renovate + `--retry` + `sha256sum -c -` shape |
| Temp git repo test setup | `grep -rln "git init\|\[\"init\"" .bkit/core/engine --include=*.test.ts` → 15+ files, each inline; no shared export (`grep "export function (make\|mk\|create\|init)\w*(Repo\|Git)"` → none) | Inline per test file (repo convention) | EXTEND (convention) | Inline `mkdtemp` + `git init` in `env-backup.integration.test.ts` like `secrets-sync.integration.test.ts` |
| Integration tests for env backup | `ls .bkit/core/engine/audits/templates/` → `secrets-sync.integration.test.ts` covers `bkit-secrets.mjs` only | None for env backup | NEW `env-backup.integration.test.ts` | (a) — no tests of a script that does not exist; sibling of `secrets-sync.integration.test.ts` |
| Dogfood parity | `grep -n "scripts/secrets/bkit-secrets.mjs\|\".husky/pre-commit\"" dogfood-templates.test.ts` → `:554`, `:251-263` | `dogfood-templates.test.ts` entries | EXTEND | New entries + re-anchored pre-commit region |

> [!CAUTION]
> **Default = `EXTEND`.** `NEW` only allowed for:
> (a) no candidate — `Search performed` shows the commands establishing absence;
> (b) extending breaks the candidate's contract or callers — name both;
> (c) candidate is a `Supersession Inventory` `DELETE` — replacement, not duplicate.
>
> never accept cleaner-fresh / messy-existing / close-but-different as a `NEW` reason — messy candidate → extend and clean it, in scope. Empty `Search performed` = UNSEARCHED, not `NEW`-eligible.
>
> Each `EXTEND` row must land as `[MODIFY] path/to/existing` in `Architecture & Component Changes` and a task in `Agent Execution Runbook`; each `NEW` row as `[NEW]` carrying the same reason. `[NEW]` with no row = unjustified.

## Architecture & Component Changes

**CRITICAL:** Justify new file locations per `docs/architecture.md` topology.
**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. Every `[NEW]` must trace to a `Reuse Inventory` `NEW` row and carry its reason — no parallel reimplementation. Superseded → `Supersession Inventory` as `DELETE`.
**CRITICAL:** Verify `[MODIFY]` files exist (else `[NEW]`). Before changing exported symbol/signature/contract: find callers/importers/schemas/consumers (language-server references when configured + text search), list blast radius.
**CRITICAL:** NEVER weaken gate to pass: no type-system escapes, linter disables, test skips, deleted assertions, empty `catch` / error-swallowing, mocking-away unit under test. Fix root causes; per-file opt-out needs explicit human sign-off.

Locations: new template files sit under `.bkit/templates/` with their adopted copies at the same repo-relative path (`.bkit/core/.bkit/templates.md` § Contract, `scripts/secrets/` precedent). Every new non-JSON template carries `Example` + `does not write this file` (`templates-content.test.ts:620-629`) and no bkit markers (decision `489-templates-carry-no-bkit-blocks`). File modes match the sibling template (`git ls-files -s .bkit/templates/scripts/secrets/bkit-secrets.mjs .bkit/templates/.husky/pre-commit`).

### Database Migrations

None.

### Template — env backup (new copy-and-own)

#### [NEW] `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs`

- **Reuse Check:** Reuse Inventory rows "Encrypt / decrypt …" (b), "Raw env-file parse" (b), "Discover gitignored env files" (a), "`.gitignore` hides an `.enc`" (a); config / `run()` / glob semantics copied as patterns (EXTEND rows).
- Self-contained Node ≥ 20 ESM, built-ins only. Header: copy-and-own lines, `See .bkit/templates.md § Env backup`, usage block, "Values are never printed", exit legend.
- **Verbs:**

<!-- prettier-ignore -->
| Verb | Does | Exit |
| --- | --- | --- |
| `encrypt [--dry-run]` | discover → validate → per-variable update / first encrypt → verify → stage | 0 done / skipped with warning · 1 stop · 2 bad args |
| `restore` | every tracked `.env.enc` / `.env.*.enc` (`git ls-files -z`, basename `^\.env(\..+)?\.enc$`) → plain beside it, `wx`, mode 0600; present → `kept`; target `git check-ignore -q` fails → refused | 0 · 1 no key / refused / sops error |
| `rekey` | per tracked `.enc`: `sops updatekeys --yes`, then `sops rotate` in place (new data key: every line changes once), verify map unchanged, stage | 0 · 1 |
| `restage` | post-commit: per tracked `.enc`, `git add` when worktree blob == `HEAD` blob and index blob ≠ `HEAD` blob | 0 always; failures warn |
| `help` / none | usage | 0 / 2 on unknown verb or flag |

- **Preconditions (all verbs):** top = `git rev-parse --show-toplevel`. `encrypt` / `restage` in a linked worktree (`--git-dir` ≠ `--git-common-dir`) → `[env-backup] linked worktree — the main checkout keeps the .enc copies` + exit 0 (Q2). `sops --version --disable-version-check` absent or below `MIN_SOPS` (constant = lowest release Task 1 shows supporting `unset` + `set --value-stdin`) → warning, exit 0 (`encrypt` / `restage`) or exit 1 (`restore` / `rekey`). Config load: `bkit-env-backup.config.mjs` default export, keys ⊆ `{skip}`, `skip` = string array, else exit 1 naming the key (Q4). `.sops.yaml` at top, absent or containing `{{AGE_PUBLIC_KEY}}` → exit 1 naming the fix; passed as `--config` on every create.
- **Discovery:** `git ls-files -z --others --ignored --exclude-standard --directory` at top. Entries ending `/` never candidates (Q5) — except a collapsed folder `git check-ignore -q` does not match, which is re-listed without `--directory` (A10). Keep basename `^\.env(\..+)?$`, not ending `.enc`, regular file per `lstat` (symlinks out), not matching any skip glob. Glob: `*` / `?` within one folder, `**/` zero or more folders (semantics of `.bkit/core/engine/commands/ci/ci.ts:289-302`), unanchored patterns match at any depth (`(?:.*/)?` prefix), leading `/` anchors to top. Tracked env files, `.envrc`, `.env.example` (tracked) fall out naturally; nested repos / submodules not descended by git.
- **`.gitignore` gate (before any write):** per candidate's `{file}.enc`: `git check-ignore --no-index -v -z` → a match whose pattern does not start with `!` = ignored. Any ignored → exit 1 listing each `source:line:pattern` + the line to add after it: `!.env.enc` (basename `.env.enc`) or `!.env.*.enc`.
- **Validation:** per candidate plain file split on `\n` only (`\r` kept in the value). Non-blank line not starting `#` without `=` → exit 1 `file:line`; duplicate key → exit 1 `file:line` + key. Never the line text.
- **Key probe:** decrypt the first existing tracked `.enc` (`sops decrypt --input-type dotenv --output-type dotenv`). Exit 128 → `[env-backup] no age key on this machine — .enc copies not updated` + exit 0, nothing written (`restore` / `rekey`: exit 1). No `.enc` yet → probe = the first create below; exit 128 on its verify → delete the temp file, same warning.
- **Encrypt — existing `.enc`:** decrypt to memory, parse with the same splitter; diff by key on raw text after the first `=`. Changed / added → `sops set --input-type dotenv --output-type dotenv --value-stdin P.enc '["KEY"]'`, stdin = `JSON.stringify(value)` (value never in argv). Removed → `sops unset … P.enc '["KEY"]'`. Original bytes held in memory; any failure → write them back, exit 1. After the last op: decrypt and compare the full map; mismatch → restore bytes, exit 1. No diff → file untouched.
- **Encrypt — new `.enc`:** `sops encrypt --config <top>/.sops.yaml --input-type dotenv --output-type dotenv --output <P.enc.tmp-PID> P` → decrypt + compare map → `rename` to `P.enc`. Temp holds ciphertext only.
- **Plain absent, `.enc` tracked:** untouched.
- **Staging:** `git add -- <enc>` for each changed / created `.enc`, plus each candidate's `.enc` whose worktree copy differs from the index (`git diff --quiet -- <enc>` exit 1) (Q1-A). `--dry-run`: print `would update` / `would create` + path; no write, no `git add`.
- **Merge conflict:** decrypt of an `.enc` with conflict markers / MAC mismatch → exit 1: `resolve {file}: take one side whole (git checkout --ours|--theirs -- {file}), then rerun encrypt`.
- **Safety:** every subprocess via `spawnSync(cmd, argvArray, { maxBuffer: 64 MiB, encoding })`, check `r.error` then `r.status` (knowledge `kn-6-…`, `586-spawnsync-enobufs-can-report-exit-0`). sops stderr printed only for allowlisted fixed patterns (MAC mismatch, no matching creation rule, no key); else `sops failed (exit N) on {file}`. Output = paths, key names (duplicates / dry-run never print values), counts.

#### [NEW] `.bkit/templates/scripts/env-backup/bkit-env-backup.config.mjs`

- **Reuse Check:** config twin of the script (same NEW row (b)); shape follows `bkit-secrets.config.mjs`.
- `export default { skip: [".vercel/**", "supabase/.temp/**", ".worktrees/**", ".claude/worktrees/**", "node_modules/**", "tmp/**"] }` with copy-and-own header and a two-line glob-syntax comment (`tmp/**` per Q10).

#### [NEW] `.bkit/templates/.sops.yaml`

- **Reuse Check:** row "SOPS creation rules" (a).
- Copy-and-own `#` header, then `creation_rules: [ { path_regex: (^|/)\.env(\.[^/]+)?$, age: "{{AGE_PUBLIC_KEY}}" } ]` (block YAML). Prettier-clean. Not in `NPM_STRIP_REMAP` (`.bkit/core/engine/shared/package-roots.ts:94-97` strips only `gitignore` / `npmignore`) → ships as-is.

#### [MODIFY] `.bkit/templates/.husky/pre-commit`

- **Existence Check:** exists (`.bkit/templates/.husky/` holds `pre-commit`, `pre-push`).
- Insert after `pnpm bkit:gate:format`, before `# disk prune` (disk prune stays last, `disk-prune.test.ts:92-113`; `pnpm bkit:gate:format` kept, `local-gate-audit.test.ts:103`):

```sh
# env backup — an encrypted .enc copy beside each env file (.bkit/templates.md § Env backup).
# No key or no sops on this machine: warns, the commit goes on. A setup error stops it.
if [ -f scripts/env-backup/bkit-env-backup.mjs ]; then
  node scripts/env-backup/bkit-env-backup.mjs encrypt < /dev/null
fi
```

- `set -e` (line 15) makes exit 1 stop the commit.

#### [NEW] `.bkit/templates/.husky/post-commit`

- **Reuse Check:** row "Post-commit restage" (a).
- `#!/usr/bin/env sh` + copy-and-own header + 2-line why (a `git commit -- paths` commit leaves the real index holding the old `.enc`) + guarded `node scripts/env-backup/bkit-env-backup.mjs restage < /dev/null || echo "[post-commit] WARN: env backup restage failed" >&2`. No `set -e`, no markers. Husky 9 wrappers in `.husky/_/` already dispatch `post-commit`. Dropped with `restage` if A9 fails.

### Template — secrets sync (two-way example check)

#### [MODIFY] `.bkit/templates/scripts/secrets/bkit-secrets.mjs`

- **Existence Check:** exists. Callers: `scripts/secrets/bkit-secrets.mjs` (identical copy), `secrets-sync.integration.test.ts`, `catalogue.ts:268` (ask text), `.bkit/core/.bkit/templates.md` § Secrets sync. `--allow-missing` referenced nowhere else (`grep -rn "allow-missing"` → the two script copies only).
- Header: line 9 → `check [file]     local only: env files vs example both ways (warnings), copy inventory`; line 10 deleted; line 17 → `Exit: 0 clean (example findings only warn) · 1 a store failed or could not be read · 2 drift, or \`check <file>\` names a file that does not exist`.
- New `compareExample({ cfg, root, targets, log })` from `check()` `:734-762`: example path rule unchanged (`:734-735`); targets = `preview`, `production` (overlays never); no example → `⚠️  no {exampleRel} — env files not compared`; per present target: example → env missing / empty → `⚠️` (skip `optional`, `protected`); env → example missing → `⚠️ {k} — not in {exampleRel}` (skip `protected`); returns nothing that alters exit.
- `check()`: calls it; `problems` only from `check <file>` naming a missing file → exit 2.
- `main()`: delete `allowMissing` (`:794`), its filters (`:795`, `:798`), its pass-through (`:822`); `sync` (dry and real) calls `compareExample` after the source-presence checks (`:834-840`) and before the store loop; `drift` / `list` never. Usage `slice(3, 12)` → `slice(3, 11)` (`:811`).

#### [MODIFY] `scripts/secrets/bkit-secrets.mjs`

- Byte-identical copy of the template (`dogfood-templates.test.ts:554` `identical`).

#### [DELETE] `--allow-missing` + exit-2 example semantics in `.bkit/templates/scripts/secrets/bkit-secrets.mjs` and `scripts/secrets/bkit-secrets.mjs`

- In-file removal per `Supersession Inventory` rows 1-3 (files stay); old test expectation `secrets-sync.integration.test.ts:408-415` rewritten (row 4).

### bkit adoption (root copies)

#### [NEW] `scripts/env-backup/bkit-env-backup.mjs`, `scripts/env-backup/bkit-env-backup.config.mjs`, `.husky/post-commit`

- **Reuse Check:** adopted copies of the NEW template rows; byte-identical (SC6).

#### [NEW] `.sops.yaml`

- Template with `{{AGE_PUBLIC_KEY}}` → Christian's public key (Q9 / A6).

#### [MODIFY] `.husky/pre-commit`

- Same env-backup block after `pnpm bkit:gate:format` (line 16), before the bkit-only dist block (lines 18-23).

#### [MODIFY] `.gitignore`

- Line 21 comment → `# Env / secrets (force-allow .env.example and the encrypted .enc copies)`; after line 24 add `!.env.enc` and `!.env.*.enc`. Managed block (lines 45-106) untouched. Note `tmp/**` (line 34) keeps `tmp/` `.enc` ignored → skip list (Q10).

#### [MODIFY] `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`

- Add `"scripts/env-backup/bkit-env-backup.mjs": identical`, `"scripts/env-backup/bkit-env-backup.config.mjs": identical`, `".husky/post-commit": identical`, `".sops.yaml": { status: "adopted", edits: [{ kind: "placeholder", what: "age public key", fill: "{{AGE_PUBLIC_KEY}}", with: "age1…" }] }`.
- `.husky/pre-commit` (`:251-263`): region anchors → `["node scripts/env-backup/bkit-env-backup.mjs encrypt < /dev/null\nfi\n", "\n# disk prune"]` on both sides, so the env-backup block is compared, the dist block stays the only bkit-only text.

### Tests & tooling

#### [MODIFY] `vitest.tsx-bin.ts`

- Add `export function hasTool(bin: string): boolean` — PATH lookup; absent + `CI` (`"true"` / `"1"`) → throw `${bin} not found on PATH; the CI lane must install it`. Header rewritten: one place for test tools; local self-skip allowed only through this helper (`docs/testing.md:143`).

#### [NEW] `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts`

- **Reuse Check:** unit test of the EXTEND row "Tool presence"; no test of `vitest.tsx-bin.ts` exists (`grep -rln "vitest.tsx-bin"` → importers only).

#### [NEW] `.bkit/core/engine/audits/templates/env-backup.integration.test.ts`

- **Reuse Check:** row "Integration tests for env backup" (a). Real `sops`, `age-keygen`, `git` in `mkdtemp` repos; `describe.skipIf(!hasTool("sops") || !hasTool("age-keygen"))` (throws on CI). Key isolation: `SOPS_AGE_KEY_FILE` → temp key; no-key cases point it at a missing file and set `HOME` / `XDG_CONFIG_HOME` to the temp dir. Hooks via `git config core.hooksPath <tmp>/.husky` with template copies + a stub `pnpm` on PATH. Values are generated sentinels, never real secrets. Rows 1, 3-23.

#### [MODIFY] `.bkit/core/engine/audits/templates/secrets-sync.integration.test.ts`

- `:408-415` "check flags a required example key …" → expects exit 0 + `⚠️` line; new tests rows 26-30.

#### [MODIFY] `.bkit/core/engine/audits/templates/templates.test.ts`

- `:343-364` describe: add `.husky/post-commit contains NO bkit:start/bkit:end markers`, and pre-commit block order (row 24).

### CI

#### [MODIFY] `.github/workflows/bkit-ci.yml` (human-confirmed, Q6)

- `bkit-tests-integration` (`:631`): step `Install sops and age` before the test run — `SOPS_VERSION` / `SOPS_SHA256` / `AGE_VERSION` / `AGE_SHA256` env with renovate `datasource=github-releases` comments, `curl -fsSL --retry 3 --retry-all-errors` from `getsops/sops` (`sops-v${SOPS_VERSION}.linux.amd64`) and `FiloSottile/age` (`age-v${AGE_VERSION}-linux-amd64.tar.gz`), `echo "<sha>  <file>" | sha256sum -c -`, install to `$RUNNER_TEMP/bin` → `$GITHUB_PATH` (pattern `bkit-ci.yml:441-447`). Inside the existing `adapt` region (`dogfood-templates.test.ts:128-135`) → no dogfood edit. `actionlint` clean.

### Setup tip

#### [MODIFY] `.bkit/core/engine/checks/tips/catalogue.ts`

- New `SETUP_TIPS` entry after `secrets-sync` (`:262-271`): `id: "env-backup"`, no `workflows` (shown after every context's own tips), `title: "Back up your env files"`, `line` / `why` / `ask` in plain language (env files exist only on this machine → encrypted copy in git, one key in a password manager), `steps: "\`.bkit/templates.md\` § Env backup."`, `fires: (cwd) => !isCloudOrCi() && exists(cwd, ".bkit/.env") && !exists(cwd, "scripts/env-backup")`. Then `pnpm build`→ commit`dist/` (`bkit:check:dist`).

#### [MODIFY] `.bkit/core/engine/checks/tips/catalogue.test.ts`

- Row 31.

### Shipped rule (human-confirmed, Q7)

#### [MODIFY] `.bkit/core/.agents/rules.md`

- `:93` → `- **Secrets:** NEVER stage \`.env*\`, credentials, tokens, API keys; SOPS-encrypted \`*.enc\` copies are the exception. \`git status\` review before every commit.`Mirror`.agents/rules.md`via the end-of-run`upgrade`.

### Cron Jobs & Scheduled Tasks

None.

### Decision Ledger Rows (`docs/decisions.jsonl`)

Checked: no existing `651-*` / `sops` / `env-backup` row (`grep` over `docs/decisions.jsonl`). Append via `.bkit/jsonl.md` § Write Idiom (`ts` minted by `jq`), `kind:"decision"`, `repo:"cbartens/bkit"`, `bkitVersion:"5.5.0"`, `workflow:"plan"`, `step:"plan-generate"`, `subagent:"bkit-plan-generate"`, `model:"claude-opus-5-5"`, `status:"ACTIVE"`, `references:["651","docs/plans/202610/651-sops-env-backup-plan.md"]`:

<!-- prettier-ignore -->
| key | summary | rationale | alternatives |
| --- | --- | --- | --- |
| `651-env-backup-sops-copies-beside-plain-files` | Env files are backed up as SOPS (one age key) encrypted `{file}.enc` copies tracked beside each gitignored plain file, updated per variable (`sops set` / `sops unset`) by the pre-commit hook; discovery is automatic with a config skip list; no key or no sops → warn and skip | Per-variable diffs show which variable changed; one key + one `.sops.yaml` cover every folder | dotenvx (per-file keys, in place); git-crypt (whole-file blob); whole-file `sops encrypt` (rewrites every line) |
| `651-env-backup-post-commit-restage` | A post-commit hook re-stages each `.enc` whose worktree copy equals HEAD but whose index entry differs | `git commit -- paths` runs pre-commit on a temporary index; the real index keeps the old `.enc` and a later plain commit reverts it | stage-when-differs only; state file; nothing |
| `651-secrets-check-example-two-way-warn-only` | `bkit-secrets.mjs` compares configured sources (preview, production) with `.env.example` both ways plus empty values and a missing example, as warnings in `check`, `sync`, `sync --dry-run`; these never change the exit code; `--allow-missing` removed | A key added to an env file but not the example went unnoticed; a warn-only check never blocks a sync | keep exit 2 for missing; check inside env backup |

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `--allow-missing` flag in `.bkit/templates/scripts/secrets/bkit-secrets.mjs` (header `:10`, comment `:753`, `:754-755` branch, `:794`, `:795`, `:798` filters, `:822` pass-through) | warn-only `compareExample` | DELETE | Issue: removed; every example finding warns, so the flag has no meaning |
| ❌ / exit-2 semantics for missing or empty example keys in `check()` (`:752-761`, `:777`) | `compareExample` warnings; exit 2 only for `check <file>` naming a missing file | DELETE | Issue: example findings never change the exit code |
| Same two in `scripts/secrets/bkit-secrets.mjs` | byte-identical template copy | DELETE | Dogfood `identical` |
| `secrets-sync.integration.test.ts:408-415` exit-2 expectation | exit-0 + warning expectation | DELETE (rewrite) | Encodes the removed behaviour |

In-file removals: mirrored as the `[DELETE]` entry under `Template — secrets sync` in `Architecture & Component Changes` (files stay) and as explicit removal steps in Task 8.

> [!CAUTION]
> **Default = `DELETE`.** `RETAIN-WITH-REASON` only allowed for:
> (a) external contract — atomic migration impossible (third-party callers, public API);
> (b) staged rollout with kill-date and follow-up issue link.
>
> never accept `@deprecated` and still exported as a resolution. Each `DELETE` row must be mirrored as `[DELETE] path/to/file` in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`.

## Documentation Updates

> Docs this change touches only. Code-change treatment — rewrite prose, no lazy bullet appends. Docs describe current state only, no history.

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/templates.md` (source; mirror `.bkit/templates.md` via `upgrade`) | § What each template is for: `Env backup` row after `Secrets sync` (`:33`). § Contract: row `Env backup` → `.bkit/templates/scripts/env-backup/` + `.sops.yaml` + `.husky/post-commit` → `scripts/env-backup/`, `.sops.yaml`, `.husky/post-commit`; never plain env files (`:69` neighbour). § Placeholders: `{{AGE_PUBLIC_KEY}}` → `.sops.yaml` → your age public key (`age1…`) → none (`:82-86`). § Git hooks — Husky (`:202`): pre-commit env-backup block, new post-commit. New `## Env backup — an encrypted copy of every env file` after § Secrets sync (before `:593`): install (`brew install sops age` / release binaries), key creation (`age-keygen`; key file path per OS, `SOPS_AGE_KEY_FILE`), where to keep the key (password manager; never the repo), `.sops.yaml` fill, `.gitignore` lines `!.env.enc` / `!.env.*.enc` (after the line that ignores env files; folders ignored whole are never backed up), first encrypt (`encrypt --dry-run`, then commit), hook setup (pre-commit block, post-commit), skip list syntax + defaults, restore on a new machine, key rotation (`rekey` flow; every line changes once), merge conflicts, linked worktrees, cloud agents (no key → skip), what the `.enc` reveals (names, lengths). § Secrets sync (`:552`): `check` row + new warnings in `check` / `sync` (both directions, empty, missing example, `protected` / `optional` exemptions), exit legend, `--allow-missing` gone. |
| `docs/security.md` | § Secrets Management: new `### Env file backup — SOPS` (one age key, `.enc` beside plain, key custody, public-repo exposure Q11, rotate-everything on key leak). § Public repo content `:127`: `.bkit/.env.enc` is the one committed form of `.bkit/.env`. |
| `docs/testing.md` | § Key test files (`:550`): rows for `env-backup.integration.test.ts`, `vitest-tsx-bin.test.ts`. § CI execution (`:722`): `bkit-tests-integration` installs pinned `sops` + `age`. Missing-tool helper `hasTool` beside `requireTsx` (`:682` paragraph). |
| `docs/setup.md` | § Required tools (`:45`): `sops` (≥ `MIN_SOPS`) + `age` for the env backup and its integration tests; key file location. |
| `docs/technology.md` | § Testing (`:64`): real `sops` / `age` in integration tests. § Git Hooks (`:88`): pre-commit env-backup block, post-commit `restage`. |
| `docs/decisions.jsonl` | 3 rows (`Architecture` § Decision Ledger Rows). |
| `docs/deferrals.jsonl` | 4 rows (`Out of Scope`). |
| `.bkit/core/.agents/rules.md` | § Secrets carve-out (Q7); mirror via `upgrade`. |
| `CHANGELOG.md` | `[Unreleased]` → Added: env backup template (+ `.husky/post-commit`, `.sops.yaml`, setup tip). Changed: `bkit-secrets.mjs` two-way example warnings; `check` no longer exits 2 on example gaps; `--allow-missing` removed (re-copy note). |
| `docs/knowledge.jsonl` | None at plan time; build adds a row if the pathspec-index gotcha (A9) or a SOPS fact (A1) surprises. |

`docs/architecture.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`: no change (no topology, schema, UI or log-drain change). `.agents/docs.md`: still accurate (no new doc).

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No DB |
| **Code** | `git revert {COMMIT}` of the build commits | Code-only — `git revert` sufficient; hooks guard on `scripts/env-backup/` presence, so reverting the script disables both hooks |
| **Committed ciphertext** | Revert does not remove `.bkit/.env.enc` from public history | Rollback for a security reason (key leak) → rotate every value in `.bkit/.env` (`docs/deployments.md` § Security incident runbook); history rewrite does not un-publish |
| **Consumers** | None needed | Copy-and-own: nobody receives the change until they re-copy |
| **Risk window** | Between merge and the owner's first main-checkout commit (A5) | No `.enc` yet → backup absent, nothing broken |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Run runbook autonomously; no user permission at Gates; `[x]` as you go.
> **Step Isolation:** Finish task (verify + checkbox) before next.
> **Integration Shape:** may suggest PR / commit / sequencing — advisory, never a gate; one PR for all tasks always OK. Do not specify merge method.

> [!WARNING]
> **Build-agent constraints.** Never read, print, copy or stage a plain `.env*` file or any private key; test values are generated sentinels in temp repos only. Guardrails classify `.env*.enc` names as secret files (`.bkit/core/hooks/guardrails-tiers.js:192`) — verify through tests and the script's own output, not by naming env paths in shell reads. Edits to `.github/workflows/*` (Task 1) and `.bkit/core/.agents/rules.md` (Task 10) wait for their `Open Questions` confirmation (Q6, Q7). Task 2's root `.sops.yaml` key fill waits for Q9 / A6. Root hooks adopted in Task 6 never run in a linked worktree (Q2 skip; worktree commits run no husky hooks), so the build commits are unaffected. Advisory shape: one PR; commit per task with `{type}(651-sops-env-backup): …`.

**Implementation Tasks:**

- [ ] **Task 1: Test-tool helper, CI install, SOPS contract.** Add `hasTool` to `vitest.tsx-bin.ts` + `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts`; create `.bkit/core/engine/audits/templates/env-backup.integration.test.ts` with `describe("sops contract")` (row 1) pinning A1 facts and fixing `MIN_SOPS`; add the pinned `sops` + `age` install step to `bkit-tests-integration` in `.github/workflows/bkit-ci.yml` (Q6). **Done when:** `hasTool` exported; rows 1-2 pass (`pnpm vitest run .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts`, `pnpm vitest run .bkit/core/engine/audits/templates/env-backup.integration.test.ts`); A1 facts each confirmed or the plan's call shape corrected in the test file header; workflow step present with VERSION + SHA256 + `sha256sum -c -`; `actionlint .github/workflows/bkit-ci.yml` clean; `dogfood-templates.test.ts` green. **Test first:** `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts` `hasTool returns false for a missing tool outside CI` fails on the returned boolean — stub returns true; `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts` `hasTool throws naming the tool when CI is set` fails on the thrown message — stub never throws; sops-contract tests n/a — characterisation of the external `sops` binary, no repo code under test.
- [ ] **Task 2: Script skeleton — preconditions, config, discovery, `.gitignore` gate, key probe, `--dry-run`.** Create `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs` (verbs parsed; `encrypt` plans only), `bkit-env-backup.config.mjs`, `.bkit/templates/.sops.yaml` per Architecture; adopt them at once (dogfood requires an entry per template file): root `scripts/env-backup/*` byte-identical, root `.sops.yaml` with Christian's public key (Q9 / A6), `dogfood-templates.test.ts` entries. **Done when:** rows 3-9, 18 and 25 pass; new templates carry `Example` + `does not write this file` (`templates-content.test.ts` green); `.sops.yaml` prettier-clean; `grep -c "{{AGE_PUBLIC_KEY}}" .sops.yaml` = 0; file modes match `bkit-secrets.mjs` (`git ls-files -s` after staging). **Test first:** EB `discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files` fails on the dry-run path list — stub lists nothing; EB `stops when gitignore hides an enc copy and names the line to add` fails on exit 1 and the `!.env.*.enc` text — stub exits 0; EB `no age key warns and writes nothing` fails on the warning line — stub silent; EB `no sops on PATH warns and exits 0` fails on the warning line; EB `stops on a missing or unfilled sops config` fails on exit 1; EB `rejects an unknown config key and an unknown flag` fails on exit 1 and exit 2; EB `linked worktree notes and writes nothing` fails on the note line; EB `dry run writes and stages nothing` fails on the printed would-create path — stub prints nothing; `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` fails on the new template files having no entry before the entries are added.
- [ ] **Task 3: `encrypt` — per-variable update, first encrypt, verify, stage.** **Done when:** rows 10-17 pass in EB; one changed value → `.enc` diff = exactly 3 changed lines (variable, `sops_lastmodified`, `sops_mac`); failure path restores the original bytes; root copy re-synced (`cmp .bkit/templates/scripts/env-backup/bkit-env-backup.mjs scripts/env-backup/bkit-env-backup.mjs` silent — same in Tasks 4-6). **Test first:** EB `one changed value changes only its line and the two bookkeeping lines` fails on the diff line set — stub writes nothing; EB `added and removed variables show as one line each` fails on added and removed counts; EB `unchanged plain file leaves the enc copy byte-identical and unstaged` fails on the staged list once staging lands — stub stages everything; EB `first encrypt creates a verified and staged enc copy` fails on the missing file; EB `absent plain file leaves its enc copy untouched` fails on the bytes compare — stub empties it; EB `invalid line and duplicate key stop with file and line only` fails on exit 1; EB `values round-trip with CRLF quotes equals hashes spaces newlines and empties` fails on the decrypted map; EB `a failing sops set restores the original enc bytes` fails on the bytes compare.
- [ ] **Task 4: `restore`.** **Done when:** row 19 passes in EB (fresh `git clone` of the temp repo + key → every env file back, mode `0600`, present file kept, non-ignored target refused, no key → exit 1). **Test first:** EB `restore rebuilds every env file on a fresh clone and keeps existing ones` fails on the missing restored file — stub exits 0 writing nothing; EB `restore refuses a target git would not ignore and exits 1 without a key` fails on exit 1.
- [ ] **Task 5: `rekey`.** **Done when:** row 20 passes in EB. **Test first:** EB `rekey moves every enc copy to the new key and keeps the values` fails on decrypt with the new key — stub leaves the old recipients.
- [ ] **Task 6: `restage` + hooks.** Add the env-backup block to `.bkit/templates/.husky/pre-commit`; create `.bkit/templates/.husky/post-commit`; implement `restage`; extend `templates.test.ts` (`:343-364`); adopt both hooks at the root (block before the dist block in `.husky/pre-commit`; `.husky/post-commit` identical) and re-anchor the dogfood pre-commit region. **Done when:** rows 21-24 and 32 pass; `disk-prune.test.ts`, `local-gate-audit.test.ts`, `templates.test.ts`, `templates-content.test.ts` green. If row 22 shows the real index already == HEAD without post-commit (A9), drop `restage` + post-commit, record that in `docs/knowledge.jsonl` via the build's writer, and mark row 22 as asserting the plain pre-commit result. **Test first:** EB `pre-commit commits the changed enc copy and only that one` fails on the commit's file list — template block absent; EB `pathspec commit leaves no staged enc copy after post-commit` fails on `git diff --cached --name-only` — no post-commit; EB `no verb prints a value` fails on the sentinel found in output — stub `restage` echoes the decrypted text; `.bkit/core/engine/audits/templates/templates.test.ts` `.husky/post-commit contains NO bkit:start/bkit:end markers` fails on the missing template file; `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` fails on the root pre-commit missing the template's env-backup block.
- [ ] **Task 7: bkit's `.gitignore` lets the `.enc` copies be tracked.** Root `.gitignore`: comment `:21` + `!.env.enc` and `!.env.*.enc` after `:24`. **Done when:** row 33 passes; `pnpm vitest run .bkit/core/engine/audits/repo/dogfood-templates.test.ts` green (whole adoption: rows 25, 32); `.bkit/.env.enc` creation left to the owner (A5). **Test first:** EB `bkit's gitignore leaves the enc copies trackable` fails on `git check-ignore` reporting `.env.*` at `.gitignore:23`.
- [ ] **Task 8: `bkit-secrets.mjs` two-way example warnings.** Extract `compareExample`; call from `check` and `sync`; delete `--allow-missing` and exit-2 example semantics (Supersession rows 1-4); new header + `slice(3, 11)`; copy byte-identical to `scripts/secrets/bkit-secrets.mjs`. **Done when:** rows 26-30 pass in SS; `grep -rn "allow-missing" .bkit/templates scripts` → no match; `cmp .bkit/templates/scripts/secrets/bkit-secrets.mjs scripts/secrets/bkit-secrets.mjs` silent; `node scripts/secrets/bkit-secrets.mjs help` prints the header without `--allow-missing`. **Test first:** SS `check warns both ways and on a missing example without failing` fails on exit 0 — current exit 2; SS `sync and sync dry run print the example warnings and still write` fails on the warning line; SS `allow-missing is an unknown option` fails on exit 1 — current exit 2 path; SS `protected keys are exempt both ways and optional keys only from example to env` fails on the warning set; SS `check on a missing named file exits 2` passes today — regression guard, n/a red.
- [ ] **Task 9: Setup tip `env-backup`** (Q8) in `catalogue.ts` + `catalogue.test.ts`; `pnpm build`; commit `dist/`. **Done when:** row 31 passes; `catalogue.test.ts` ordering / shape tests green; `pnpm bkit:check:dist` clean. **Test first:** `.bkit/core/engine/checks/tips/catalogue.test.ts` `env-backup fires with a bkit env file and no env-backup script, not on cloud or CI` fails on the missing tip id.
- [ ] **Task 10: Shipped rule carve-out** (Q7) in `.bkit/core/.agents/rules.md:93`. **Done when:** line reads per Architecture; `pnpm vitest run .bkit/core/engine/audits` green (rule-text consumers). **Test first:** n/a — doc rule text, no behaviour change.
- [ ] **Task 11: Documentation** per `Documentation Updates` (templates.md source sections + new § Env backup, `docs/security.md`, `docs/testing.md`, `docs/setup.md`, `docs/technology.md`, README row if folded in). **Done when:** every row in `Documentation Updates` applied; `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts` green (Contract row covered; no new template name in workflows / prompts / `wording.md`); `pnpm bkit:gate:static-unit` prose + format clean. **Test first:** n/a — docs.
- [ ] **Task 12: CHANGELOG, mirror refresh, final check.** `CHANGELOG.md` `[Unreleased]` Added / Changed; `pnpm tsx .bkit/core/engine/cli.ts upgrade`; `git config core.bare false`; `pnpm bkit check`. **Done when:** `.bkit/templates.md` and `.agents/rules.md` mirrors match their sources; `pnpm bkit check` exit 0; `git config core.bare` → `false`. **Test first:** n/a — release notes and generated mirrors.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row and its search still holds — reusable artifact found mid-build → add a row, fold code into it; every `EXTEND` landed as a modification of the named artifact, not a parallel file. No type-system escapes (e.g. TS `as any` / `as unknown as` / `@ts-ignore`, Python `# type: ignore`), linter disables (e.g. `eslint-disable`, `//nolint`), test skips (e.g. `.skip`, `xfail`), empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Test first:** every task naming `Test first` tests recorded a red per test before its code; tests unchanged since except added tests / formatting.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Backend / pipeline logic** — test at the unit/integration tier (Vitest), not through a browser.
> - **End-to-end integration** — real `sops` / `age` / `git` binaries against a scratch repo, no mocking of the boundary.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each `Acceptance Scenario → Derived Test Matrix` row (1-33) → its runbook task's `Done when` carries the test; gaps → add to that task, not here.
- [ ] **Sweep existing tests:** Each task fixed the tests it broke (`secrets-sync.integration.test.ts:408-415`, `dogfood-templates.test.ts`, `templates.test.ts`, `templates-content.test.ts`, `catalogue.test.ts`); full suite green per `docs/testing.md` except the baselined `wording-test-setup-tips-lines-not-in-wording-file`.
- [ ] **Sweep new tests:** `env-backup.integration.test.ts` and `vitest-tsx-bin.test.ts` exist and pass; EB runs (not skipped) wherever `sops` + `age-keygen` are on PATH, and throws under `CI` when they are not.
- [ ] **Verify observability:** `[env-backup]` warnings / errors on stderr name paths, `file:line` and keys only; sentinel test (row 23) green. No new log drain, span or audit table.
- [ ] **Update documentation:** every `Documentation Updates` row applied; `docs/decisions.jsonl` rows present (appended at plan time — see handback note if pending); ground-truth prose rewritten, no lazy bullet appends.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, not merge gates.** Only `Agent Execution Runbook` `Done when` lines gate merge; nothing here does. Do not write "before merge" on untickable boxes — CI/human-only preconditions (lane RUN, deployed state, operator step) unenforceable. Work that MUST block merge → runbook task + codebase-verifiable `Done when`; lane that must run → CI config, not plan prose.

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (typecheck, lint, `format:check`, prose, `slop:delta`, unit, integration) + `pnpm bkit check`, with `sops` + `age` installed so EB executes. Do not weaken gates.
- [ ] **Test Synchronization:** `secrets-sync.integration.test.ts:408-415` rewritten to the warn-only contract; `dogfood-templates.test.ts` `.husky/pre-commit` region re-anchored; no E2E suite in this repo.
- [ ] **Build Configuration:** `pnpm build` emits no test file into `dist/` (existing `*.test.ts` exclusion); `pnpm bkit:check:dist` clean; `.bkit/templates/**` ships via the existing package `files` (`.sops.yaml` not in `NPM_STRIP_REMAP`) — `pnpm pack --dry-run` lists `.bkit/templates/.sops.yaml`, `.bkit/templates/.husky/post-commit`, `.bkit/templates/scripts/env-backup/*`.
- [ ] **Integration (`.bkit/core/engine/audits/templates/env-backup.integration.test.ts`):** rows 1, 3-23, 33 against real `sops` / `age-keygen` / `git` in temp repos; data hygiene = generated sentinel values + temp age keys, temp dirs removed in `afterEach`.
- [ ] **Integration (`.bkit/core/engine/audits/templates/secrets-sync.integration.test.ts`):** rows 26-30.
- [ ] **Unit (`dogfood-templates.test.ts`, `templates.test.ts`, `catalogue.test.ts`, `vitest-tsx-bin.test.ts`):** rows 2, 24, 25, 31, 32.
- [ ] **Apply local migrations:** n/a — no DB.
- [ ] **Run all tests:** `pnpm test` (unit + integration, `vitest.config.ts`) and `pnpm test:integration`; `pnpm bkit:test:bats` unaffected but run by the gate; fix failures before Gate 4.
- [ ] **CI lane executed:** on the PR, `bkit-tests-integration` installs `sops` + `age` and its executed-test count rises by the EB + SS additions (`gh run view {id} --log | grep -c "env-backup.integration"`), not skipped (`docs/testing.md:139`).

> [!IMPORTANT]
> **No Architectural Downgrades:** Build / compiler / test errors during verification → never hot-fix or anti-pattern; follow `docs/architecture.md` + named reference repos. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, API responses) gathered.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can (Dashboard Ban below). An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (e.g. `gh`, `jq`, `sops`) to verify CI/CD pipelines instead of asking users to check dashboards.

Owner steps (Christian; the agent never handles the private key or plain env files):

- [ ] **Step 1 — key:** `age-keygen -o "<SOPS key file>"` (macOS default `~/Library/Application Support/sops/age/keys.txt`, or `SOPS_AGE_KEY_FILE`); store the private key in the password manager; give the `age1…` public key to the build (Task 2).
- [ ] **Step 2 — first backup:** after merge, in the main checkout, commit anything → `git show --stat HEAD` lists `.bkit/.env.enc`; `git status --short` shows no staged `.enc` left behind.
- [ ] **Step 3 — one-value diff:** change one value in `.bkit/.env`, commit → `git show HEAD -- .bkit/.env.enc | grep -c '^[-+][^-+]'` = 6 (3 removed, 3 added: the variable, `sops_lastmodified`, `sops_mac`); no value printed (ciphertext only).
- [ ] **Step 4 — restore:** `git clone` the repo into a temp dir, run `node scripts/env-backup/bkit-env-backup.mjs restore` there → `cmp -s .bkit/.env <temp>/.bkit/.env && echo same` (prints `same` or nothing; never the file); `stat -f %Lp <temp>/.bkit/.env` = `600`.
- [ ] **Step 5 — no key:** `SOPS_AGE_KEY_FILE=/nonexistent node scripts/env-backup/bkit-env-backup.mjs encrypt` → one `[env-backup] no age key` warning, exit 0.
- [ ] **Step 6 — secrets warnings:** `node scripts/secrets/bkit-secrets.mjs check; echo "exit $?"` → example warnings (if any) with `exit 0`; `node scripts/secrets/bkit-secrets.mjs check --allow-missing; echo "exit $?"` → unknown option, `exit 1`.
- [ ] **Step 7 — CI:** `gh run list --workflow bkit-ci.yml --branch {branch} --limit 1` → `bkit-tests-integration` success with the env-backup suite executed (see Automated Tests, CI lane executed).

<!-- bkit:end -->
