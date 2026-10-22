<!-- bkit:anchor
baseSha: dee808e19e294c3268619a0beaf4d7848ba11436
baseRef: origin/dev
bkitVersion: 5.5.0
bkitLatest: 5.5.0
-->

Verdict: PASS
<!-- verdict:end -->

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

> Human-written (Christian): no design doc, no issue Narrative. Length over the Spec's 1–2 sentences human-confirmed.

As a developer, I keep editing my env files the way I do today. Each time I commit, git saves an encrypted copy of every env file beside it, so the history shows which variable changed and when. If I lose my laptop, I clone the repo, paste my key from my password manager, run one command, and every env file is back. When I run the secrets sync, it warns me about any key that is in my env file but not in `.env.example`, or the other way round, and the sync still runs.

### Success Criteria

> Inherited from design, else the issue; do not rewrite.

- Fresh clone + the one decryption key → every env file restored with one command.
- Changing one value changes only that variable's line in its encrypted file, plus SOPS's two bookkeeping lines (`sops_lastmodified`, `sops_mac`). Unchanged variables stay byte-identical. An added or removed variable shows as one added or removed line.
- A commit on a machine holding the key updates and stages every `.enc` copy whose plain file changed.
- A new env file anywhere in the repo is picked up with no setup, unless it matches the skip list.
- `bkit-secrets.mjs sync` and `check` warn on a key in an env file missing from `.env.example`, a key in the example missing from an env file, or no example file; they never fail on these and the sync still runs.
- bkit adopts the template on its own env files. The root copies of the script and config stay byte-identical to the template. The root `.sops.yaml` differs only by the public-key line.

> Bullets 1–5: issue § Success criteria verbatim. Bullet 6 (SC6): reworded by Christian to name the `.sops.yaml` public-key line. Six bullets over the Spec's 5-bullet cap: human-confirmed (Q14).

### Process Sketch

> Inherited from design; plan may refine. `Concrete Example` (happy path) + `Edge Cases` (branches) as `WHEN X → THEN Y`, not prose — same examples. Do not invent new examples. Sense-check top-level process HERE without prose below. Outcomes, not implementation steps.

- **WHEN** a developer holding the age key changes one value and adds one variable in `apps/web/.env.preview`, then commits **→ THEN** the commit carries `apps/web/.env.preview.enc` with exactly that variable's line changed, one added line, plus `sops_lastmodified` + `sops_mac`; every other line byte-identical.
- **WHEN** a new env file appears in any folder not on the skip list **→ THEN** the next commit creates and stages its `.enc` with no setup.
- **WHEN** a fresh clone with the key runs `node scripts/env-backup/bkit-env-backup.mjs restore` **→ THEN** every env file with a tracked `.enc` is back (mode 0600); env files already present are kept.
- **WHEN** `node scripts/secrets/bkit-secrets.mjs check` / `sync` runs and a configured source env file and `.env.example` disagree in either direction, or the example is absent **→ THEN** each gap prints as a warning, the exit code is unchanged, the sync still writes.
- **IF** the machine has no key (cloud agent) **→ THEN** one warning, nothing written, the commit proceeds.
- **IF** `.gitignore` would hide an `.enc` **→ THEN** the commit stops, printing the ignoring `source:line:pattern` and the exact line (`!.env.enc` / `!.env.*.enc`) to add after it.
- **IF** a plain file is absent **→ THEN** its tracked `.enc` stays untouched, never emptied.

### Concrete Example

> Plan expands from design.

**Setup:** Developer in a repo that adopted the template (`scripts/env-backup/`, `.sops.yaml` holding the age public key, `.husky/pre-commit` block, `.husky/post-commit`, `.gitignore` lines `!.env.enc` / `!.env.*.enc`). `sops` + `age` installed; age private key in the SOPS default key file (or `SOPS_AGE_KEY_FILE`). Tracked `.bkit/.env.enc` and `apps/web/.env.preview.enc` exist; `apps/web/.env.preview` is the configured `sources.preview` in `scripts/secrets/bkit-secrets.config.mjs`; `apps/web/.env.example` lists the old keys.

**Steps:**

1. Developer changes one value and adds one variable in `apps/web/.env.preview`, runs `git commit -m "…"` → pre-commit `encrypt` decrypts `apps/web/.env.preview.enc` in memory, compares per key, runs `sops set` for the changed and the added key, verifies the decrypted map equals the plain file, stages the `.enc`; `.bkit/.env.enc` (plain file unchanged) stays byte-identical and unstaged.
2. Developer runs `git show HEAD -- apps/web/.env.preview.enc` → diff shows one changed variable line, one added line, `sops_lastmodified`, `sops_mac`; nothing else.
3. Developer runs `node scripts/secrets/bkit-secrets.mjs check` → warning names the added variable as missing from `apps/web/.env.example`; exit 0.
4. Laptop lost. On a new machine: `git clone`, key pasted from the password manager into the key file, `node scripts/env-backup/bkit-env-backup.mjs restore` → `.bkit/.env` and `apps/web/.env.preview` written (mode 0600), one line per restored file naming the path only.

**Outcome:** Every env file is back with the same keys and values (key→value map equal to the original; line order may differ, A2); git history shows which variable changed in which commit; the example gap is visible without failing anything; no value appeared in any output.

### Edge Cases

> Plan expands from design's Key Edge Cases.

Issue-decided rows (from issue § Decisions already made) first, then plan-added.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| No key on the machine (cloud agent) | `encrypt` prints one warning, writes nothing, exits 0; commit proceeds |
| Plain file absent, its `.enc` tracked | `.enc` left untouched, never emptied |
| `.gitignore` would hide an `.enc` | exit 1 → commit stops; prints `source:line:pattern` from `git check-ignore --no-index -v` and the exact line (`!.env.enc` / `!.env.*.enc`) to add after it |
| Env file matches skip list (issue defaults `.vercel/**`, `supabase/.temp/**`, `.worktrees/**`, `.claude/worktrees/**`, `node_modules/**`; plan-added `tmp/**`, Q10) | never a candidate |
| Whole-file re-encrypt would rewrite every line | never used for an existing `.enc`; per variable `sops set` / `sops unset` only |
| Plain file unchanged | `.enc` byte-identical, not staged |
| `sops` missing or below the script's minimum version, no age key source on the machine | one warning, exit 0; commit proceeds |
| `sops` missing or below the script's minimum version, an age key source present (`SOPS_AGE_KEY`, `SOPS_AGE_KEY_CMD`, `SOPS_AGE_KEY_FILE` or the SOPS default key file) | (Q15-B) exit 1 → commit stops; `install or upgrade sops (brew install sops)` |
| Env file inside a gitignored folder | never a candidate (Q5) |
| Symlinked env file; tracked `.env*`; `.envrc`; `.env.example`; `*.enc` | never candidates |
| Crash leftover `.env-backup-tmp-{PID}` (new-`.enc` temp file) | never a candidate (basename fails `^\.env(\..+)?$`) |
| Nested git repo / submodule | not descended, also on the A10 re-list path |
| No key + a `.gitignore` gap, line with no `=` or duplicate key | key warning, exit 0, nothing written — key probe runs before the gate and validation |
| Line with no `=` (not blank, not `#`) | (Q4-C) warning naming `file:line`; that file skipped (its `.enc` untouched, not staged); other files processed; exit 0; no line content printed |
| Duplicate key | (Q4-C) warning naming `file:line` + key; that file skipped; other files processed; exit 0; no value printed |
| `.sops.yaml` missing or still holding `{{AGE_PUBLIC_KEY}}` | exit 1 naming the fix |
| Config unknown key (typo) | exit 1 naming the key |
| Bad CLI arguments | exit 2 + usage |
| Value with CRLF, quotes, `=`, `#`, spaces, literal `\n`, empty | decrypts to the same raw text after the first `=` |
| `sops set` / `unset` fails mid-update | original `.enc` bytes restored; exit 1 naming the file |
| Pathspec commit `git commit -- paths` (agents' default) | `.enc` lands in the commit; post-commit `restage` leaves the real index == HEAD (Q1) |
| `git rebase` / `git cherry-pick` (post-commit runs per pick) | `restage` per pick; no `.enc` left staged |
| Clean `git merge` commit (`pre-merge-commit` runs, not `pre-commit`) | `.enc` not refreshed in the merge commit; the next ordinary commit refreshes it from a locally changed plain file; an `.enc` change the merge brought in → incoming-change row (Q12) |
| Another key holder's `.enc` change arrives (`git pull`, clean `git merge`, owner's second machine) while the local plain file holds the old value | (Q12-B) `encrypt` warning naming the file + commit and both fixes (keep theirs: delete the plain file, run `restore`; keep yours: `touch` the plain file, commit again); that file skipped (nothing written, not staged); other files processed; exit 0; never silently overwritten |
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
| `check <file>` naming an existing file | that file only (configured sources not compared) vs the example, both directions; warnings; exit 0 |
| `check <file>` naming a file that does not exist | exit 2, with or without an example file (today exit 0 when the example is absent) |
| `--allow-missing` passed | unknown option, exit 1 |
| `list` / `drift` | no example warnings (`list` output feeds repo tooling) |

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
| 1 | SOPS contract the script relies on: `set --value-stdin` (JSON) / `unset` / `decrypt` on `*.enc` with `--input-type dotenv --output-type dotenv`; `set` / `unset` change only the variable line + `sops_lastmodified` + `sops_mac`; decrypt without key exits 128; key-probe round-trip of a fixed non-secret line under `--config <repo>/.sops.yaml` from a temp dir outside the repo (creation rule matches, exit 128 without key); dotenv parse of CRLF, quotes, `=`, `#`, spaces, literal `\n`, empty values, `#` comments | Integration | EB | 1 |
| 2 | Tool helper: `false` locally when a tool is absent from PATH; throws naming the tool when `CI` is set | Unit | `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts` | 1 |
| 3 | Discovery: env file in a new nested untracked folder picked up with no setup; skip-list globs (`*` one folder, `**` any depth, any-depth match, leading `/` anchors), file in an ignored folder, `*.enc`, symlink, tracked `.env`, `.envrc`, `.env.example`, crash leftover `.env-backup-tmp-4242` all excluded | Integration | EB | 2 |
| 4 | `.gitignore` hides an `.enc` → exit 1; output names `source:line:pattern` and the exact `!` line; a negated pattern counts as not ignored | Integration | EB | 2 |
| 5 | No age key → warning, exit 0; no `.enc` created or changed — with a tracked `.enc` (decrypt probe) and with none yet (fixed-line probe; its temp dir removed) | Integration | EB | 2 |
| 6 | No `sops` on PATH, or below minimum version: no age key source → warning, exit 0; `SOPS_AGE_KEY_FILE` pointing at a present key file → exit 1 naming `install or upgrade sops`, nothing written (Q15-B) | Integration | EB | 2 |
| 7 | `.sops.yaml` missing / still `{{AGE_PUBLIC_KEY}}` → exit 1 | Integration | EB | 2 |
| 8 | Config unknown key → exit 1 naming it; unknown verb / flag → exit 2 | Integration | EB | 2 |
| 9 | Linked worktree → one-line note, exit 0, nothing written | Integration | EB | 2 |
| 10 | One changed value → `git diff` of the `.enc` = that variable's line + `sops_lastmodified` + `sops_mac`; every other variable line byte-identical | Integration | EB | 3 |
| 11 | Added / removed variable → exactly one added / removed line + the two bookkeeping lines | Integration | EB | 3 |
| 12 | Unchanged plain file → `.enc` byte-identical and not staged | Integration | EB | 3 |
| 13 | First encrypt → new `.enc` decrypts to the plain file's key/value map; staged | Integration | EB | 3 |
| 14 | Plain file absent → tracked `.enc` byte-identical | Integration | EB | 3 |
| 15 | Line with no `=` / duplicate key (Q4-C) → warning naming `file:line` (+ key), exit 0; that file's `.enc` byte-identical and unstaged; a second changed env file still updated and staged; output lacks the line's text | Integration | EB | 3 |
| 16 | Round-trip fidelity: CRLF, quotes, `=`, `#`, spaces, literal `\n`, empty value → decrypted raw values equal the plain file's | Integration | EB | 3 |
| 17 | `sops set` failure mid-update (PATH wrapper fails the 2nd `set`) → original `.enc` bytes restored, exit 1 | Integration | EB | 3 |
| 18 | `encrypt --dry-run` with no `.enc` yet → `would create` + path; worktree and index unchanged | Integration | EB | 2 |
| 19 | Restore: fresh clone + key → each tracked `.env.enc` / `.env.*.enc` restored with a parsed key→value map (raw text after the first `=`) equal to the original plain file's, mode 0600; present plain file kept; target git would not ignore refused; no key → exit 1 | Integration | EB | 4 |
| 20 | Rekey: after `.sops.yaml` switches to a new public key, new key decrypts every `.enc`, old key fails, values unchanged; `.enc` files staged | Integration | EB | 5 |
| 21 | Pre-commit end-to-end: template `.husky/pre-commit` dispatched through a husky-9-style wrapper in `core.hooksPath` (`sh -e <template>`, exec bit set; stub `pnpm`), commit with key → changed `.enc` in the commit; `.enc` of an unchanged plain file not in it | Integration | EB | 6 |
| 22 | Pathspec commit `git commit -- other.txt` with a changed env file → `.enc` in HEAD; after the template `.husky/post-commit` runs (same `sh -e` wrapper), `git diff --cached --name-only` lists no `.enc` | Integration | EB | 6 |
| 23 | Sentinel value never printed: stdout + stderr of every verb (`encrypt`, `--dry-run`, `restore`, `rekey`, `restage`) and every error path lack the sentinel | Integration | EB | 6 |
| 24 | `.husky/post-commit` template carries no bkit markers; `.husky/pre-commit` template env-backup block sits after `pnpm bkit:gate:format` and before the disk-prune block | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` | 6 |
| 25 | Dogfood parity (scripts): root `scripts/env-backup/*` identical to the template; `.sops.yaml` = template + public-key placeholder fill | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 2 |
| 26 | `check`: env key missing from example, example key missing from env file, empty value, no example file → one warning each; exit 0 | Integration | SS | 8 |
| 27 | `sync` and `sync --dry-run` print the same warnings before the store loop and still write / plan | Integration | SS | 8 |
| 28 | `--allow-missing` → exit 1 unknown option; usage text lacks it | Integration | SS | 8 |
| 29 | `protected` exempt both directions; `optional` exempt from example → env file only | Integration | SS | 8 |
| 30 | `check <file>` naming a file that does not exist → exit 2, with an example file and without one | Integration | SS | 8 |
| 31 | Tip `env-backup` fires when `.bkit/.env` exists and `scripts/env-backup` is absent; silent on cloud / CI and once adopted | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 9 |
| 32 | Dogfood parity (hooks): root `.husky/post-commit` identical; root `.husky/pre-commit` = template + the bkit-only dist region (re-anchored after the env-backup block) | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 6 |
| 33 | bkit's root `.gitignore` leaves `.bkit/.env.enc` and a nested `.env.preview.enc` trackable (`git check-ignore --no-index` against the repo); `git` only, no `sops` tool gate | Integration | EB | 7 |
| 34 | `encrypt --dry-run` with a changed plain file beside its tracked `.enc` → `would update` + path; an unchanged file not listed; worktree and index unchanged | Integration | EB | 3 |
| 35 | Merge conflict in an `.enc` (two branches each `set` one value, `git merge` conflicts) → `encrypt` exit 1 naming the file and the `take one side whole … rerun encrypt` fix; no value printed | Integration | EB | 3 |
| 36 | Nested git repo and submodule holding an ignored `.env` → never candidates, also on the A10 re-list path; top-level env file still listed | Integration | EB | 2 |
| 37 | `list` and `drift` print no example warnings while an env key is missing from the example | Integration | SS | 8 |
| 38 | `check <file>` naming an existing file → that file compared both ways with the example (warnings only), configured sources not compared; exit 0 | Integration | SS | 8 |
| 39 | No age key + a `.gitignore` gap → key warning, exit 0, nothing written (probe before the gate) | Integration | EB | 2 |
| 40 | No age key + a line with no `=` / a duplicate key → key warning, exit 0, nothing written (probe before validation) | Integration | EB | 3 |
| 41 | `git rebase` and `git cherry-pick` of commits carrying `.enc` changes → post-commit `restage` per pick leaves no `.enc` staged | Integration | EB | 6 |
| 42 | Incoming change (Q12-B): clone B changes one value, commits, pushes; clone A (plain file mtime before B's author time) pulls and commits another file → `encrypt` warning naming the `.enc`, the commit and both fixes, exit 0, commit made; A's `.enc` still decrypts to B's value and is not in the commit; a second changed env file in A still updated; no value printed | Integration | EB | 3 |
| 43 | Clean `git merge` bringing clone B's `.enc` change into clone A's branch → merge commit keeps B's `.enc`; next ordinary commit warns and skips it as in row 42; after `touch` of the plain file the next commit writes A's value and the `.enc` decrypts to it | Integration | EB | 3 |
| 44 | First encrypt failure (PATH wrapper fails `sops encrypt`; separately, alters the verify decrypt's map) → exit 1 naming the file; no `.enc` created; no `.env-backup-tmp-*` left | Integration | EB | 3 |
| 45 | `restore` with no `sops` on PATH, or below `MIN_SOPS` → exit 1; no plain file written | Integration | EB | 4 |
| 46 | `rekey` per-file failure (PATH wrapper fails `sops rotate` on the 2nd `.enc`) → that file's original bytes restored; exit 1 naming it | Integration | EB | 5 |
| 47 | `rekey` with no `sops` on PATH, or below `MIN_SOPS` → exit 1; every `.enc` byte-identical | Integration | EB | 5 |
| 48 | `restage` with `git add` failing (`.git/index.lock` present) → warning naming the file, exit 0; `HEAD` unchanged | Integration | EB | 6 |

Success Criteria → rows: SC1 → 19 · SC2 → 10, 11 · SC3 → 21, 22 · SC4 → 3 · SC5 → 26, 27 · SC6 → 25, 32, 33.

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

> [!WARNING]
> **Breaking (template `bkit-secrets.mjs`, copy-and-own):** `check --allow-missing` → now `unknown option` exit 1. `check` no longer exits 2 on a missing or empty example key (warning instead). `check <file>` naming a file that does not exist now exits 2 also when no example file exists (today exit 0). A CI step or script relying on either breaks when the consumer re-copies. bkit's own repo: no caller (`grep -rn "allow-missing"` → script copies only). Release note under CHANGELOG `[Unreleased]` → Changed; no migration (issue decision, A7).

> [!IMPORTANT]
> **Behaviour change in bkit's repo:** every commit in the main checkout with the age key now runs `encrypt` and may stage `.enc` files the committer did not name; on a machine holding the key, a `.gitignore` gap, a `.sops.yaml` / config setup error or a missing / too-old `sops` stops the commit — any committer's, including a parallel agent's (Q4-C, Q15-B); a malformed env line, duplicate key or an incoming `.enc` change from another key holder warns and skips that file, the commit proceeds (Q4-C, Q12-B). Shipped rule `.agents/rules.md` § Secrets gains the `*.enc` exception (Q7).

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

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".
> **Never a bare question.** Each carries 2-3 options, a recommendation, and default if unanswered — human must decide from the page alone. Canonical plan shape.
> Design → carry its options / recommendation forward where already answered.

> [!NOTE]
> **All answered by Christian.** Narrative written in; Q6 (CI workflow edit) and Q7 (shipped rule) explicitly confirmed; Q9 public key supplied. Each question's `Answer` line is the decision — it overrides `Recommended` / `Default` where they differ (Q4, Q12).

**Open Questions**

- **Open Question Q1 — pathspec commits.** `git commit -- paths` (the agents' default, `.agents/rules.md` § Commits) runs pre-commit against a temporary index (git `builtin/commit.c` partial-commit flow): the hook's `git add` reaches the commit but not the real index, which keeps the old `.enc` staged → a later plain `git commit` reverts it. → human decides.
  - **Options:** A — stateless post-commit `restage` (`git add` an `.enc` only when worktree == HEAD and index ≠ HEAD) + new `.husky/post-commit` template + `encrypt` also stages any managed `.enc` whose worktree copy differs from the index · B — stage-when-differs only; real index shows a stale staged `.enc` until the next full commit · C — nothing; revert risk stays
  - **Recommended:** A — closes the revert with no state file; test-first reproduces the bug (row 22); no reproduction → plan update (A9).
  - **Default if unanswered:** A
  - **Answer (Christian):** A.
- **Open Question Q2 — linked worktrees.** Each worktree holds stale plain copies (or none); parallel branches would rewrite the same `.enc`. → human decides.
  - **Options:** A — skip with a one-line note; the main checkout is the only writer · B — use the worktree's own plain copies (stale snapshots roll values back; parallel branches conflict on `sops_lastmodified`) · C — read the main checkout's plain files (still conflicts across parallel branches)
  - **Recommended:** A — no rollback, no cross-branch conflicts; bkit's own worktree commits run no husky hooks anyway.
  - **Default if unanswered:** A
  - **Answer (Christian):** A — the main checkout only, whatever branch it has checked out (not the `dev` branch only); linked worktrees skipped.
- **Open Question Q3 — empty value in an env file for a key the example lists.** Today ❌ + exit 2. → human decides.
  - **Options:** A — warning; an unfilled key no longer fails `check`, noticed only if the warning is read · B — keep ❌ / exit 2; an unfilled key still fails `check`, but one example finding then changes the exit code
  - **Recommended:** A — issue: example findings "never change the exit code".
  - **Default if unanswered:** A
  - **Answer (Christian):** A.
- **Open Question Q4 — setup and per-file errors** (`.sops.yaml` missing / placeholder, line with no `=`, duplicate key, config typo, any other sops failure) on a machine holding the key. Keyless machines never stop: the key probe runs before the `.gitignore` gate and validation. Stopping re-enters the OPEN failure class `precommit-check-dist-blocks-parallel-agents` (`docs/failures.jsonl`): a pre-commit check fails a commit on working-tree state outside it, so a parallel agent's `git commit -- fileA` stops on another person's env-file typo it cannot inspect (guardrails classify `.env*` reads as secret, `.bkit/core/hooks/guardrails-tiers.js:192`; output is `file:line` only). The issue-decided `.gitignore` stop has the same reach. → human decides.
  - **Options:** A — stop the commit (exit 1) naming `file:line`; the backup never ages silently, but every main-checkout committer is blocked until the owner fixes the file (linked worktrees skip, Q2) · B — warn and skip that file; unrelated commits flow, that file's `.enc` ages while the warning repeats every commit; matches the issue review note "It only stops when `.gitignore` would hide an `.enc` file" (`plan-input-1.md:86`) · C — stop on repo-wide setup errors (`.sops.yaml`, config typo: committed files every committer sees), warn and skip per-file content errors (no-`=` line, duplicate key); unrelated commits flow, a per-file backup ages if agents ignore hook stderr
  - **Recommended:** A — a silent skip leaves a stale backup that looks current; the issue's warn-and-proceed covers only "no key" and "plain file absent"; blocking is limited to main-checkout commits on the key-holding machine.
  - **Default if unanswered:** A
  - **Answer (Christian):** C — overrides `Recommended`. Stop on repo-wide setup errors (`.sops.yaml` missing / placeholder, config typo); warn and skip that file on a line with no `=` or a duplicate key. Other `sops` failures (mid-update `set` / `unset`, first-encrypt verify, merge-conflict decrypt) keep exit 1: tool or git-state faults, not env-file typos.
- **Open Question Q5 — env files inside gitignored folders.** → human decides.
  - **Options:** A — never candidates (`git ls-files --directory` collapses them; `!` lines cannot re-include a file under an ignored folder) · B — candidates; stop with "add to skip list"; every env file under an ignored folder (e.g. build output) stops commits until listed
  - **Recommended:** A — `.enc` there could never be tracked; documented in templates.md.
  - **Default if unanswered:** A
  - **Answer (Christian):** A.
- **Open Question Q6 — CI install of `sops` + `age` in `bkit-tests-integration`** (`.github/workflows/bkit-ci.yml:631`), SHA-pinned like Vale (`bkit-ci.yml:441-447`). CI edits need human confirmation. → Christian.
  - **Options:** A — install (VERSION + SHA256 env, renovate comment, `curl --retry`, `sha256sum -c -`) for `getsops/sops` and `FiloSottile/age` linux-amd64 · B — fake `sops` stub (mocks the boundary under test; rejected by `docs/testing.md`)
  - **Recommended:** A — `docs/testing.md:143`: a self-skipping suite must not skip on CI.
  - **Default if unanswered:** A, but Task 1's CI step waits for the confirmation box. Refused → Task 1 stops and the plan is updated: EB's `hasTool` throws on CI, so the integration lane would fail.
  - **Answer (Christian):** A — CI edit confirmed.
- **Open Question Q7 — `.agents/rules.md` § Secrets carve-out.** `.bkit/core/.agents/rules.md:93` "NEVER stage `.env*`" covers `.env.enc`; the hook stages them. Shipped rule. → Christian.
  - **Options:** A — amend: SOPS-encrypted `*.enc` copies are the exception; shipped doctrine change reaches every consumer on `bkit upgrade` · B — leave; agents may never stage an `.enc` by hand and reviewers read the hook's staging as a rule breach
  - **Recommended:** A — rule and template agree.
  - **Default if unanswered:** A, applied only after the confirmation box.
  - **Answer (Christian):** A — shipped rule change confirmed, worded narrowly: the exception covers only the `*.enc` copies the env-backup script writes; plain `.env*` files stay never-stage (Architecture § Shipped rule).
- **Open Question Q8 — setup tip `env-backup`** in `.bkit/core/engine/checks/tips/catalogue.ts`. → human decides.
  - **Options:** A — add (fires on `.bkit/.env` present, `scripts/env-backup` absent, not cloud / CI); shown to nearly every consumer (`.bkit/.env` is standard), each needs `sops` + `age` to adopt · B — templates.md section only; nothing prompts adoption
  - **Recommended:** A — adoptable templates are surfaced through setup tips (e.g. `secrets-sync`, `catalogue.ts:262-271`); without one the template is found only by reading templates.md.
  - **Default if unanswered:** A
  - **Answer (Christian):** A, and the template is documented in `.bkit/core/.bkit/templates.md` § Env backup, naming the tip and how to silence it (`bkit.ignoreAdvisories`).
- **Open Question Q9 — bkit's own age key.** → Christian.
  - **Options:** A — Christian runs `age-keygen`, stores the private key in his password manager, supplies the public key (`age1…`); the build waits for it at Gate 1 · B — the agent generates it (agents must not handle secrets)
  - **Recommended:** A
  - **Default if unanswered:** Gate 1 waits (Pre-Flight `User Context`): Task 2 fills the root `.sops.yaml` in the same task as the template, since `dogfood-templates.test.ts:685` requires an entry per template file.
  - **Answer (Christian):** A — public key `age1s7ee03f9jnl9amzr0qs5edzne4zqtn9c82dqcq544wgyhauhxa8see2qj4`; private key held by Christian (password manager + SOPS default key file).
- **Open Question Q10 — `tmp/**` in the template default skip list.** bkit's root `.gitignore:34` ignores `tmp/**`, so an agent's scratch `.env` copy under `tmp/` would stop every commit (its `.enc` is ignored). → human decides.
  - **Options:** A — template default; env files under any consumer's `tmp/` are never backed up · B — bkit's own config only (root config then needs a dogfood `adapt` edit instead of `identical`)
  - **Recommended:** A — `tmp/` scratch is common in consumers too; keeps root config identical.
  - **Default if unanswered:** A
  - **Answer (Christian):** A.
- **Open Question Q11 — public-repo exposure.** Committing `.bkit/.env.enc` to the public repo publishes key names, value lengths (ciphertext length) and, per A1, possibly comments. A leaked private key exposes every value in history → rotate every value. → Christian.
  - **Options:** A — accept (issue design); key names and value lengths are public for good, a leaked private key exposes every value in history · B — bkit does not adopt on `.bkit/.env` (contradicts SC6)
  - **Recommended:** A — names are already public via `.env.example` and docs; values stay encrypted.
  - **Default if unanswered:** A (A3).
  - **Answer (Christian):** A, on one condition: if Task 1 shows SOPS keeps dotenv comments readable (A1), `.bkit/.env` carries no comments — the docs say so for every adopter.
- **Open Question Q12 — incoming `.enc` changes.** `encrypt` treats the plain file as truth: another key holder's change (`git pull`, clean `git merge`, owner's second machine) lands in the `.enc` while the local plain file keeps the old value, so the next ordinary commit writes the old value back and stages it — the change is rolled back in git with no warning; `restore` never surfaces it (`wx` keeps the present plain file). → human decides.
  - **Options:** A — stop: decrypted map ≠ plain map and the author time of the last commit touching the `.enc` (`git log -1 --format=%at -- {enc}`; survives rebase / cherry-pick) is later than the plain file's mtime → exit 1 naming file + commit, nothing written, both fixes printed (keep theirs: delete the plain file, run `restore`; keep yours: `touch` it, commit again); misses a change whose author clock ran behind; same reach as Q4-A (blocks main-checkout commits on that machine until resolved) · B — warn and skip that file under the same rule; commits flow, the incoming value stays in git, the local plain file stays stale while the warning repeats · C — plain file stays truth; docs state one writer per env file and that other holders delete + `restore` after each pull; the silent rollback remains
  - **Recommended:** A — a silent rollback of another holder's change is data loss in the backup; the stop names two one-command fixes and needs no state file.
  - **Default if unanswered:** A; rows 42-43 assert A — B or C → plan update rewrites rows 42-43 and the Edge Cases row before Task 3.
  - **Answer (Christian):** B — overrides `Recommended`. Warn and skip that file; rows 42-43 and the Edge Cases row assert B.
- **Open Question Q13 — `rekey` verb scope** (raised by plan summary: the issue asks only for key-rotation docs). → Christian.
  - **Options:** A — keep `rekey` (Task 5, rows 20, 46, 47) · B — docs-only procedure; drop Task 5 and its rows
  - **Recommended:** A — rotation happens under pressure (a leaked key); a per-file hand procedure with dotenv flags leaves files on the old key.
  - **Default if unanswered:** A
  - **Answer (Christian):** A.
- **Open Question Q14 — six Success Criteria vs the Spec's 5-bullet cap** (raised by plan summary). → Christian.
  - **Options:** A — keep six; note it under § Success Criteria · B — merge two (e.g. SC3 into SC2)
  - **Recommended:** A — each bullet is specific and maps to its own rows; merging makes them harder to verify.
  - **Default if unanswered:** A
  - **Answer (Christian):** A.
- **Open Question Q15 — `sops` missing or below `MIN_SOPS` on a machine holding the key** (raised by plan summary: the backup ages behind a hook warning nobody reads). → Christian.
  - **Options:** A — warn, exit 0, commit proceeds · B — stop (exit 1) when an age key source is present (`SOPS_AGE_KEY`, `SOPS_AGE_KEY_CMD`, a readable `SOPS_AGE_KEY_FILE` or SOPS default key file); no key source → warn, exit 0 as today
  - **Recommended:** B — a machine setup error, the same class Q4-C stops on; fix is one install command; keyless machines (cloud agents) never stop.
  - **Default if unanswered:** B
  - **Answer (Christian):** B. Edge Cases rows, row 6 and Task 2 assert it; `restage` (post-commit) still only warns.

**Assumptions**

- **Assumption A1:** SOPS facts not in the issue's test table — `set --value-stdin` JSON input, decrypt-without-key exit 128, minimum version with `unset` + `--value-stdin`, `updatekeys --yes` / `rotate` flags on dotenv, `--output`, key-probe round-trip of a fixed line from a temp dir outside the repo under `--config` (creation-rule match), dotenv parse / emit of CRLF, quotes, `\n`, comments, `sops --version` network check, the age key sources SOPS reads and their default key-file path per OS (Q15-B detects a key source without running `sops`) — hold as Task 1's characterisation tests (row 1) pin them → wrong fact changes the script's call shape, not the design; Task 1 fixes it before Task 2.
- **Assumption A2:** restore rebuilds keys + values (+ comments if SOPS keeps them, A1) in SOPS's order as of the first encrypt, not a byte-identical file; restore's contract = parsed key→value map (raw text after the first `=`) equal to the plain file's (row 19, Manual Step 4) → a user expecting identical bytes sees reordered lines; docs state it.
- **Assumption A3:** Q11 exposure accepted (Christian, Q11-A) → if not, bkit's adoption drops `.bkit/.env` and SC6 needs a human rewrite.
- **Assumption A4:** Trivy secret scan and GitHub push protection do not flag SOPS ciphertext or an age public key → if they do, CI or push fails on adoption; fix = scanner allowlist entry, human-confirmed.
- **Assumption A5:** SC6 is met at merge by the template copy + config + hooks; `.bkit/.env.enc` follows from the owner's first main-checkout commit with the key (the build agent never touches the private key or plain env files) → if SC6 needs the `.enc` itself at merge, the build cannot meet it and SC6 needs an owner step before merge.
- **Assumption A6:** Christian's public key (Q9, supplied: see Q9 `Answer`) is the one Task 2 writes into the root `.sops.yaml` → a typo there makes every `.enc` undecryptable by his private key; Manual Step 2 catches it (the key probe's round-trip fails, no `.enc` is created).
- **Assumption A7:** copy-and-own consumers keep their old `bkit-secrets.mjs` until they re-copy → if an install or upgrade path rewrote their copy, a CI step passing `--allow-missing` would break unannounced and a migration (`docs/migrations.md`) would be required.
- **Assumption A8:** one decrypt per tracked `.enc` per commit keeps the hook within a few seconds (pre-commit header rule: nothing over a few seconds) → if not, the build adds an `Out of Scope` row + `docs/deferrals.jsonl` mirror (`.bkit/jsonl.md`) for a per-commit decrypt cache keyed by plain-file mtime and names it in the handback.
- **Assumption A9:** the pathspec index behaviour reproduces (row 22 red first) → if not, Task 6 stops and the plan is updated: post-commit and `restage` dropped, row 22 rewritten, a decision row superseding `651-env-backup-post-commit-restage`, Q1 back to Christian.
- **Assumption A10:** `git ls-files --others --ignored --exclude-standard --directory` collapses only folders that are themselves ignored → if it also collapses an untracked folder whose only content is an ignored `.env`, discovery re-lists each collapsed folder that `git check-ignore -q` does not match (row 3 pins it).

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

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
| Key rotation as a docs-only procedure (`sops updatekeys --yes` + `sops rotate` per file with the dotenv flags, then `git add`) | Rejected for the `rekey` verb | Issue § Docs asks for key rotation; a hand procedure repeats the dotenv flags per file, skips the post-rotate map verify and staging, and misses `.enc` files; `rekey` (Task 5, row 20) does all three over every tracked `.enc` |
| Key probe = the first new-`.enc` create (no `.enc` yet) | Rejected | Create needs the `.gitignore` gate and validation first, so a keyless machine would stop on a gap or malformed line (contradicts issue: no key → warn, commit proceeds); fixed-line probe runs before both |

**Future phase (not scope):** CI decryption, store sync from env backup, hosted secret managers, key-storage automation (issue non-goals → `Out of Scope`); per-commit decrypt cache if A8 fails (row + deferral mirror filed by the build, A8).

**Selection Rule:** pick the approach with the best quality-of-end-state, not the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Store sync from the env-backup template | Issue non-goal; `bkit-secrets.mjs` keeps store pushes | issue #651 § Constraints and non-goals |
| CI decryption of `.enc` files | Issue non-goal; no Success Criterion needs a key in CI | issue #651 § Constraints and non-goals |
| Hosted secret managers | Issue non-goal | issue #651 § Constraints and non-goals |
| Automating key storage (password-manager integration) | Issue non-goal; key entered by hand | issue #651 § Constraints and non-goals |

**Deferral rows (`docs/deferrals.jsonl`)** — checked: no existing `651-*` / `sops` / `env-backup` row. Owner: Task 11 appends them (re-check `grep '"key":"651-' docs/deferrals.jsonl` first). Append via `.bkit/jsonl.md` § Write Idiom (`ts` minted by `jq`), `kind:"deferral"`, `repo:"cbartens/bkit"`, `bkitVersion:"5.5.0"`, `workflow` / `step` / `subagent` / `model` = the writer's own, `type:"feature"`, `severity:"LOW"`, `reason:"scope-declared"`, `status:"OPEN"`, `references:["651","#651 § Constraints and non-goals","docs/plans/202610/651-sops-env-backup-plan.md"]`:

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
| Guardrails classify `.env.enc` / `.env.*.enc` as secret env files (`/^\.env[.*]/`), blocking agent reads of ciphertext | `.bkit/core/hooks/guardrails-tiers.js:192` | Task 3-7 verification by agents; shipped hook; the merge-conflict fix the script prints (`git checkout --ours\|--theirs -- {file}`) hits the secret tier for agents (`NON_READING_HEADS` omits `git`) | needs design decision (ciphertext readable vs key names exposed to agents) |
| README "Templates ready to adopt" row for Env backup | `README.md:256-268` | Task 11 docs; Task 9 tip `why` must read the same (`catalogue.ts:15-17`) | fold in (one table row, plain language) |
| Agents audit Step 8 "env file not ignored" would flag tracked `.env*.enc` | `.bkit/core/docs/templates/bkit-audit-agents.md:113` | Shipped audit template | fold in (one clause exempting SOPS `.enc` copies) |
| Setup-tip lines missing from `.bkit/wording.md` fail `wording.test.ts` | `docs/failures.jsonl` `wording-test-setup-tips-lines-not-in-wording-file` (OPEN, stale: `wording.test.ts` passes on `dev` `6f8ece15`) | none — the failure concerned workflow lines, not tip text (Task 9) | keep separate; close the stale row via `bkit-utility-update-failures` |
| `bkit:check:dist` pre-commit block stalls parallel agents | `docs/failures.jsonl` `precommit-check-dist-blocks-parallel-agents` (OPEN) | `.husky/pre-commit` (Task 6-7), Task 9 dist; the env-backup block re-enters the same class only on setup errors and a key without `sops` (Q4-C, Q15-B) | keep deferred |
| Secrets-sync config audit that checks values match | #497 | `bkit-secrets.mjs` (Task 8) — merge conflicts likely | keep separate |
| Pluggable store adapters + agent-host stores | #529 | `bkit-secrets.mjs` (Task 8) | keep separate |
| Codex: agent reads of `.env*` files (now `.enc` + restored plaintext) have no read gate | `docs/deferrals.jsonl` `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` (OPEN) | guardrails candidate above (`guardrails-tiers.js:192`) | keep deferred (hard-blocked on an unverified Codex tool name) |
| opencode has no script hook, so two gates cannot be expressed there | `docs/deferrals.jsonl` `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there` (OPEN) | guardrails surface only; nothing this plan changes | keep deferred |
| Hand-made `.env.*.backup` files match `.env.*` and get their own `.enc` copies | issue § Problem; plan review 1 | Task 11 § Env backup docs | fold in (one docs sentence: delete them after adoption) |
| `[mcp-env]` advisory tells a fresh clone to copy `.bkit/.env.example`; with `.bkit/.env.enc` tracked it could point to `restore` | `.bkit/core/engine/checks/before/env.ts:54`; plan review 3 | shipped advisory | keep separate |
| Wire `pre-merge-commit` so clean merge commits refresh `.enc` copies | plan review 3; plan scope checks 1-2 | `.husky/` templates (Task 6); Q12 incoming-change rule would then run at merge time | needs design decision |

`related-failures.md` was truncated by its writer (1 of 4 rows kept); reviews 1 and 3 searched `docs/failures.jsonl` / `docs/knowledge.jsonl` directly instead.

> [!CAUTION]
> **Candidates, not scope.** Human review only — not runbook tasks, must not expand scope. Fold in only on design scope or explicit human decision → becomes task, leaves list.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

Inapplicable (skipped): New API Route, New DB Table/Column, Role-Gated Mutation, Redirect URL, Webhook — no routes, DB, roles, redirects or webhooks.

- [ ] **User Input** — CLI args parsed strictly (unknown verb / flag → exit 2; `bkit-secrets.mjs` unknown option → exit 1); config keys validated (unknown → exit 1); env-file lines validated (no `=` / duplicate → warning, that file skipped, Q4-C). Paths come from `git ls-files` only; every subprocess `spawnSync` with an argv array, never a shell string (knowledge `kn-6-…`).
- [ ] **PII / secret values absent from output** — no value in stdout / stderr / argv / temp files: values passed to `sops set` on stdin; sops stderr allowlisted; validation errors print `file:line` + key only; sentinel test across every verb (row 23); `bkit-secrets.mjs` warnings print key names only (rows 26-29).
- [ ] **New Secret** — bkit's age private key (Q9): generated by Christian, kept in his password manager + SOPS key file, never in the repo, `.bkit/.env`, CI or any agent context. `.sops.yaml` holds the public key only. No CI decryption (non-goal).
- [ ] **Committed ciphertext in a public repo** (`docs/security.md` § Public repo content, line 123-131) — `.bkit/.env.enc` publishes key names + value lengths (+ comments per A1); accepted per Q11 / A3; a leaked private key → rotate every value (Rollback). Secret scanners must not flag ciphertext (A4).
- [ ] **No committable plaintext** — `restore` refuses a target git would not ignore; `encrypt` writes no plaintext temp file holding env values (the key probe's fixed non-secret line sits in a temp dir outside the worktree, removed in `finally`); `.gitignore` gate refuses an ignored `.enc`, never adds a broad `!` itself.
- [ ] **Supply chain** — CI binaries SHA-256-verified before use, versions pinned with renovate comments (Q6, `docs/security.md` § Supply-Chain).
- [ ] **Agent rule** — `.agents/rules.md` § Secrets carve-out limited to SOPS-encrypted `*.enc` copies (Q7); `.env*` plain files stay never-stage.

## Pre-Flight / Dependencies

**CRITICAL:** Check off all core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core

Always verify.

- [ ] **Package Management:** No new npm dependency — template script uses Node built-ins only (`node:child_process`, `node:fs`, `node:path`, `node:crypto`, `node:os`). `package.json` + `pnpm-lock.yaml` unchanged; `pnpm install --frozen-lockfile` clean.
- [ ] **Dependency Versions:** Run `pnpm bkit:deps:outdated`; `node --version` vs `.nvmrc`; `sops --version --disable-version-check` (issue tested 3.13.3) and `age --version` (1.3.2) locally; latest `getsops/sops` / `FiloSottile/age` releases + their `checksums` assets for the Q6 pin (`gh release view -R getsops/sops`, `gh release view -R FiloSottile/age`); `docker --version` for Task 3's A4 secret scan (Trivy image pinned at `.github/workflows/bkit-trivy.yml:63`).
- [ ] **Existing-Solution Search (reuse over duplicate):** done at plan time → `Reuse Inventory` (in-repo: `sops`, `check-ignore`, `--ignored`, `post-commit`, `globToRegExp`, `parseEnv`, `requireTsx`, `hooksPath`; dependency: Node `path.matchesGlob` (experimental — rejected); ecosystem: SOPS dotenv store, dotenvx, git-crypt per issue). Re-run the in-repo greps at build start; a new hit → add a row.
- [ ] **User Context:** Write access to the worktree. Age public key from Christian (Q9 `Answer`): `age1s7ee03f9jnl9amzr0qs5edzne4zqtn9c82dqcq544wgyhauhxa8see2qj4` — Task 2 fills the root `.sops.yaml` (`dogfood-templates.test.ts:685` needs the root copy in the same task as `.bkit/templates/.sops.yaml`). Never read, print or copy any `.env*` plain file or private key (`.agents/rules.md` § Secrets in output).
- [ ] **Project Context:** Winning ACTIVE rows applied — `489-templates-carry-no-bkit-blocks` (decision: post-commit template plain, no markers); `kn-6-use-execfilesync-over-execsync-when-the-argument-comes-from` (spawn with an argv array, never a shell string); `586-spawnsync-enobufs-can-report-exit-0` (explicit `maxBuffer` + check `r.error`); `subprocess-integration-tests-time-out-at-5000ms-under-high-load` (failure: subprocess tests live in `*.integration.test.ts`, 30s budget, `vitest.timeout-budget.ts`).
- [ ] **Testing & Quality:** Tiers per `docs/testing.md` rubric; missing-tool rule `docs/testing.md:143` (one shared helper, no early `return`, no skip on CI); `requireTsx()` pattern `docs/testing.md:682`; subprocess tests → `*.integration.test.ts` (`vitest.config.ts:7`). Baseline before Task 1: run `pnpm bkit:gate:static-unit-integration` and record every pre-existing red (do not fix here). `wording.test.ts` passes on `dev` `6f8ece15` (59/59): the OPEN `docs/failures.jsonl` row `wording-test-setup-tips-lines-not-in-wording-file` is stale, not a baseline red.
- [ ] **Prerequisite Plans:** None. Before Task 8: confirm via the tracker MCP that #497 / #529 are neither open blockers nor in flight on a branch touching `bkit-secrets.mjs` (`git branch -r --list '*497*' '*529*'`).

### Conditional

Verify only when applicable.

- [ ] **Secrets & Env Vars:** New secret = bkit's age private key (Q9) — lives in Christian's password manager + the SOPS key file on his machine, never in the repo, `.bkit/.env`, CI or any store. No new env var in any store; `SOPS_AGE_KEY_FILE` / `SOPS_AGE_KEY` are optional machine-local overrides SOPS reads itself. `.sops.yaml` holds the public key only.
- [ ] **Architecture & UI:** New files only under template roots (`.bkit/templates/scripts/env-backup/`, `.bkit/templates/.sops.yaml`, `.bkit/templates/.husky/post-commit`) + their adopted root copies — same topology as `scripts/secrets/` (`.bkit/core/.bkit/templates.md` § Contract). No UI.
- [ ] **Observability:** Script output prefix `[env-backup]` on stderr for warnings / errors, names and `file:line` only; no value, no sops stderr outside the allowlist. No new log drain, span or audit table.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all applicable boxes above. **do not stop for user permission.** Proceed to `Data Schema Integration`.

- [x] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [x] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [x] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Reuse Inventory complete:** every capability has a row with non-empty `Search performed` + `Decision`; every `NEW` cites an allowed reason.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. The stores this feature writes are files and the git index:

<!-- prettier-ignore -->
| Write path | Stores touched | Failure surfaces as |
| --- | --- | --- |
| `encrypt` (existing `.enc`) | worktree `.enc` (via `sops set` / `unset`), git index (`git add`) | any non-zero `sops` / `git` status or `r.error` → original `.enc` bytes restored, exit 1 naming the file; commit stops. Incoming change (Q12-B) or invalid line / duplicate key (Q4-C) → warning, that file never written or staged |
| key probe (no `.enc` tracked yet) | temp dir outside the worktree (fixed non-secret line + its ciphertext) | removed in `finally`; exit 128 → warning, exit 0; other sops error → exit 1 |
| `encrypt` (new `.enc`) | temp `.env-backup-tmp-{PID}` beside the target → verified → `rename` into place; index | verify mismatch / sops error → temp deleted, exit 1 |
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
| Config load rejecting unknown keys | `grep -n "unknown key"` → `bkit-secrets.mjs:542` | `loadConfig` idiom | NEW (inside the env-backup script) | (b) — `loadConfig` stays unchanged; reusing it means exporting it from `scripts/secrets/bkit-secrets.mjs` and importing it here: breaks the self-contained template contract (Node built-ins only, no import of another template) and its callers — adopters who copy `scripts/env-backup/` without `scripts/secrets/`. Same `CONFIG_KEYS` + throw-on-unknown idiom written in `bkit-env-backup.mjs` |
| Subprocess wrapper (argv array, `maxBuffer`, `r.error`) | `grep -n "function run"` → `bkit-secrets.mjs:61`; knowledge `kn-6-…`, `586-spawnsync-enobufs-can-report-exit-0` | `run()` in `bkit-secrets.mjs` | NEW (inside the env-backup script) | (b) — `run()` stays unchanged; cross-template import breaks standalone adoption (same contract + callers as the row above). Same shape plus a stderr allowlist so sops errors never echo values |
| Skip-list glob match | `grep -rn "globToRegExp"` → `.bkit/core/engine/commands/ci/ci.ts:289`, `.bkit/core/engine/commands/workflow/branches.ts:150`; `grep -rn "glob" .bkit/templates/scripts/*.mjs` → none usable; Node `path.matchesGlob` (experimental) | engine `globToRegExp` — `*` / `?` one folder, `**/` zero-or-more | NEW (inside the env-backup script) | (b) — engine `globToRegExp` stays unchanged: adding any-depth matching + leading-`/` anchors to it changes the semantics its callers (`ci.ts`, `branches.ts:150`) rely on, and a copied template cannot import engine TS. `ci.ts:289-302` semantics written in the script + any-depth prefix and leading-`/` anchor |
| Discover gitignored env files | `grep -rn -- "--ignored"` → none; `grep -rn -- "--others"` → `ledgers.ts:324,447`, `workflows.ts:389` (tracked/untracked listing, no ignored mode) | None for ignored files | NEW (inside the script) | (a) — no ignored-file discovery anywhere |
| `.gitignore` hides an `.enc` → exact fix line | `grep -rn "check-ignore"` → none in templates / engine | None | NEW (inside the script) | (a) |
| Pre-commit wiring | `ls .bkit/templates/.husky/` → `pre-commit`, `pre-push` | `.bkit/templates/.husky/pre-commit` (+ root `.husky/pre-commit`) | EXTEND | Guarded block after `pnpm bkit:gate:format`, before disk prune |
| Post-commit restage | `ls .bkit/templates/.husky/` → no `post-commit`; `grep -rn "post-commit"` over templates / engine → none | None | NEW `.bkit/templates/.husky/post-commit` | (a) |
| SOPS creation rules | `grep -rn "sops.yaml\|creation_rules"` → none | None | NEW `.bkit/templates/.sops.yaml` | (a) |
| Two-way `.env.example` compare + warnings in `sync` | `grep -n "exampleRel\|allow-missing" bkit-secrets.mjs` → `check()` `:722-778`, `main()` `:794-822` | `check()` one-way compare | EXTEND | Extract shared compare; both directions + empty + missing example as warnings; called from `check` and `sync` |
| Setup tip | `grep -n "id: \"secrets-sync\"" catalogue.ts` → `:263-271` | `SETUP_TIPS` | EXTEND | Add `env-backup` entry |
| Tool presence for tests (`sops`, `age`, `age-keygen`) | `grep -rn "requireTsx\|vitest.tsx-bin"` → `vitest.tsx-bin.ts` + 12 importers; `docs/testing.md:143` | `vitest.tsx-bin.ts` `requireTsx()`; `which()` PATH scan in `bkit-secrets.mjs:55-59` | EXTEND | Add `hasTool(bin)` beside `requireTsx` — the one shared helper `docs/testing.md:143` asks for; filesystem PATH scan shaped like `which()`, no subprocess (closed failure `audit-testing-unit-tier-spawns-real-subprocesses`). Its unit test is the `[NEW]` test file `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts` (no test of `vitest.tsx-bin.ts` exists; `grep -rln "vitest.tsx-bin"` → importers only) |
| CI install of pinned binaries | `grep -n "VALE_SHA256\|sha256sum -c" bkit-ci.yml` → `:441-447` | Vale install step | EXTEND (pattern copy into `bkit-tests-integration`, `:631`) | Same VERSION + SHA256 + renovate + `--retry` + `sha256sum -c -` shape |
| Integration tests for env backup | `ls .bkit/core/engine/audits/templates/` → `secrets-sync.integration.test.ts` covers `bkit-secrets.mjs` only | None for env backup | NEW `env-backup.integration.test.ts` | (a) — no tests of a script that does not exist; sibling of `secrets-sync.integration.test.ts` |
| Dogfood parity | `grep -n "scripts/secrets/bkit-secrets.mjs\|\".husky/pre-commit\"" dogfood-templates.test.ts` → `:554`, `:251-263` | `dogfood-templates.test.ts` entries | EXTEND | New entries + re-anchored pre-commit region |

**Conventions reused unchanged** (no capability, no code change, no `[MODIFY]`):

- **Temp git repo test setup** — `grep -rln "git init\|\[\"init\"" .bkit/core/engine --include=*.test.ts` → 15+ files, each inline; no shared export (`grep "export function (make\|mk\|create\|init)\w*(Repo\|Git)"` → none). EB inlines `mkdtemp` + `git init` like `secrets-sync.integration.test.ts`.
- **Git hook env vars** (`GIT_DIR` / `GIT_WORK_TREE` / `GIT_INDEX_FILE` / `GIT_OBJECT_DIRECTORY`) — `grep -n "function gitEnv"` → `.bkit/core/engine/ledgers/telemetry.ts:62-69`; `vitest.setup.ts:14-37` strips every inherited `GIT_*` per worker; closed failure `audit-duplication-git-spawn-without-git-env`. EB inherits the `vitest.setup.ts` scrub unchanged, so temp-repo `git` under `.husky/pre-push` never reaches bkit's repo; the template script deliberately does not scrub — it keeps the hook's `GIT_INDEX_FILE` (the temporary index of `git commit -- paths`, Q1) and cannot import engine code.

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

- **Reuse Check:** Reuse Inventory rows "Encrypt / decrypt …" (b), "Raw env-file parse" (b), "Config load rejecting unknown keys" (b), "Subprocess wrapper" (b), "Skip-list glob match" (b), "Discover gitignored env files" (a), "`.gitignore` hides an `.enc`" (a).
- Self-contained Node ≥ 20 ESM, built-ins only. Header: copy-and-own lines, `See .bkit/templates.md § Env backup`, usage block, "Values are never printed", exit legend.
- **Verbs:**

<!-- prettier-ignore -->
| Verb | Does | Exit |
| --- | --- | --- |
| `encrypt [--dry-run]` | discover → validate → per-variable update / first encrypt → verify → stage | 0 done / skipped with warning · 1 stop · 2 bad args |
| `restore` | every tracked `.env.enc` / `.env.*.enc` (`git ls-files -z`, basename `^\.env(\..+)?\.enc$`) → plain beside it, `wx`, mode 0600; present → `kept`; target `git check-ignore -q` fails → refused. Contract: restored key→value map (raw text after the first `=`) equals the plain file's at its last encrypt; line order / bytes not kept (A2) | 0 · 1 no key / refused / sops error |
| `rekey` | per tracked `.enc`: `sops updatekeys --yes`, then `sops rotate` in place (new data key: every line changes once), verify map unchanged, stage | 0 · 1 |
| `restage` | post-commit: per tracked `.enc`, `git add` when worktree blob == `HEAD` blob and index blob ≠ `HEAD` blob | 0 always; failures warn |
| `help` / none | usage | 0 / 2 on unknown verb or flag |

- **Preconditions (all verbs):** top = `git rev-parse --show-toplevel`. `encrypt` / `restage` in a linked worktree (`--git-dir` ≠ `--git-common-dir`) → `[env-backup] linked worktree — the main checkout keeps the .enc copies` + exit 0 (Q2). `sops --version --disable-version-check` absent or below `MIN_SOPS` (constant = lowest release Task 1 shows supporting `unset` + `set --value-stdin`) → `encrypt`: an age key source present (`SOPS_AGE_KEY` / `SOPS_AGE_KEY_CMD` set, or `SOPS_AGE_KEY_FILE` / the SOPS default key file readable; sources and paths pinned by Task 1, A1) → exit 1 `[env-backup] age key found but sops is missing or older than {MIN_SOPS} — install or upgrade sops (brew install sops)` (Q15-B), else warning, exit 0; `restage`: warning, exit 0; `restore` / `rekey`: exit 1. Config load: `bkit-env-backup.config.mjs` default export, keys ⊆ `{skip}`, `skip` = string array, else exit 1 naming the key (Q4-C setup error). `.sops.yaml` at top, absent or containing `{{AGE_PUBLIC_KEY}}` → exit 1 naming the fix; passed as `--config` on every create.
- **Discovery:** `git ls-files -z --others --ignored --exclude-standard --directory` at top. Entries ending `/` never candidates (Q5) — except a collapsed folder `git check-ignore -q` does not match, which is re-listed without `--directory` (A10). Keep basename `^\.env(\..+)?$`, not ending `.enc`, regular file per `lstat` (symlinks out), not matching any skip glob. Glob: `*` / `?` within one folder, `**/` zero or more folders (semantics of `.bkit/core/engine/commands/ci/ci.ts:289-302`), unanchored patterns match at any depth (`(?:.*/)?` prefix), leading `/` anchors to top. Tracked env files, `.envrc`, `.env.example` (tracked) fall out naturally; nested repos / submodules not descended by git, and the A10 re-list never descends into a folder holding its own `.git` (row 36). Crash leftover `.env-backup-tmp-{PID}` fails the basename regex.
- **Key probe (runs before the `.gitignore` gate and validation):** decrypt the first tracked `.enc` (`sops decrypt --input-type dotenv --output-type dotenv`); none tracked yet → write the fixed non-secret line `BKIT_ENV_BACKUP_PROBE=1` as `.env` in a `mkdtemp` dir outside the worktree, `sops encrypt --config <top>/.sops.yaml` it, decrypt the result (call shape pinned by Task 1, A1); temp dir removed in `finally`. Exit 128 → `[env-backup] no age key on this machine — .enc copies not updated` + exit 0, nothing written, gate and validation not run (`restore` / `rekey`: exit 1). So a keyless machine never stops on a `.gitignore` gap or malformed line (rows 5, 39, 40).
- **`.gitignore` gate (after the key probe, before any write):** per candidate's `{file}.enc`: `git check-ignore --no-index -v -z` → a match whose pattern does not start with `!` = ignored. Any ignored → exit 1 listing each `source:line:pattern` + the line to add after it: `!.env.enc` (basename `.env.enc`) or `!.env.*.enc`.
- **Validation (Q4-C):** per candidate plain file split on `\n` only (`\r` kept in the value). Non-blank line not starting `#` without `=` → warning `file:line`; duplicate key → warning `file:line` + key; that file leaves the candidate set (its `.enc` untouched, not staged), every other candidate proceeds, exit unchanged. Never the line text.
- **Encrypt — existing `.enc`:** decrypt to memory, parse with the same splitter; diff by key on raw text after the first `=`. Changed / added → `sops set --input-type dotenv --output-type dotenv --value-stdin P.enc '["KEY"]'`, stdin = `JSON.stringify(value)` (value never in argv). Removed → `sops unset … P.enc '["KEY"]'`. Original bytes held in memory; any failure → write them back, exit 1. After the last op: decrypt and compare the full map; mismatch → restore bytes, exit 1. No diff → file untouched.
- **Incoming change (Q12-B; after validation, every candidate checked before the first write):** decrypted map ≠ plain map and `git log -1 --format=%at -- P.enc` (author time) > the plain file's mtime → warning `{P.enc} changed in {short sha} after {P} was last edited — keep theirs: delete {P}, run restore · keep yours: touch {P}, commit again`; that file leaves the candidate set (never written or staged), every other candidate proceeds, exit unchanged; no value.
- **Encrypt — new `.enc`:** `sops encrypt --config <top>/.sops.yaml --input-type dotenv --output-type dotenv --output <dir of P>/.env-backup-tmp-{PID} P` → decrypt + compare map → `rename` to `P.enc` (same folder → same filesystem). Temp holds ciphertext only; its basename fails discovery's `^\.env(\..+)?$`, so a crash leftover is never a candidate.
- **Plain absent, `.enc` tracked:** untouched.
- **Staging:** `git add -- <enc>` for each changed / created `.enc`, plus each candidate's `.enc` whose worktree copy differs from the index (`git diff --quiet -- <enc>` exit 1) (Q1-A). `--dry-run`: print `would update` / `would create` + path; no write, no `git add`.
- **Merge conflict:** decrypt of an `.enc` with conflict markers / MAC mismatch → exit 1: `resolve {file}: take one side whole (git checkout --ours|--theirs -- {file}), then rerun encrypt`.
- **Safety:** every subprocess via `spawnSync(cmd, argvArray, { maxBuffer: 64 MiB, encoding })`, check `r.error` then `r.status` (knowledge `kn-6-…`, `586-spawnsync-enobufs-can-report-exit-0`). sops stderr printed only for allowlisted fixed patterns (MAC mismatch, no matching creation rule, no key); else `sops failed (exit N) on {file}`. Output = paths, key names (duplicates / dry-run never print values), counts. `git` spawns inherit the hook's environment unchanged — never scrubbed like engine `gitEnv()` (`.bkit/core/engine/ledgers/telemetry.ts:62-69`): an inherited `GIT_INDEX_FILE` is how `git add` reaches the temporary index of `git commit -- paths` (Q1).

#### [NEW] `.bkit/templates/scripts/env-backup/bkit-env-backup.config.mjs`

- **Reuse Check:** config twin of the script (same NEW row (b)); shape follows `bkit-secrets.config.mjs`.
- `export default { skip: [".vercel/**", "supabase/.temp/**", ".worktrees/**", ".claude/worktrees/**", "node_modules/**", "tmp/**"] }` with copy-and-own header and a two-line glob-syntax comment (`tmp/**` per Q10).

#### [NEW] `.bkit/templates/.sops.yaml`

- **Reuse Check:** row "SOPS creation rules" (a).
- Copy-and-own `#` header, then `creation_rules: [ { path_regex: (^|/)\.env(\.[^/]+)?$, age: "{{AGE_PUBLIC_KEY}}" } ]` (block YAML). Prettier-clean. Not in `NPM_STRIP_REMAP` (`.bkit/core/engine/shared/package-roots.ts:94-97` strips only `gitignore` / `npmignore`) → ships as-is.

#### [MODIFY] `.bkit/templates/.husky/pre-commit`

- **Existence Check:** exists (`.bkit/templates/.husky/` holds `pre-commit`, `pre-push`).
- Insert after `pnpm bkit:gate:format`, before `# disk prune` (disk prune stays last, `disk-prune.test.ts:92-113`; `pnpm bkit:gate:format` kept, `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts:103`):

```sh
# env backup — an encrypted .enc copy beside each env file (.bkit/templates.md § Env backup).
# No key on this machine: warns, the commit goes on. A setup error, or a key without sops, stops it.
if [ -f scripts/env-backup/bkit-env-backup.mjs ]; then
  node scripts/env-backup/bkit-env-backup.mjs encrypt < /dev/null
fi
```

- `set -e` (line 15) makes exit 1 stop the commit.

#### [NEW] `.bkit/templates/.husky/post-commit`

- **Reuse Check:** row "Post-commit restage" (a).
- `#!/usr/bin/env sh` + copy-and-own header + 2-line why (a `git commit -- paths` commit leaves the real index holding the old `.enc`) + the same guard as the pre-commit block: `if [ -f scripts/env-backup/bkit-env-backup.mjs ]; then node scripts/env-backup/bkit-env-backup.mjs restage < /dev/null || echo "[post-commit] WARN: env backup restage failed" >&2; fi`. No `set -e` line, but `-e`-safe: husky 9 runs it as `sh -e "$s"` via `.husky/_/h` (every command guarded by `if` / `||`). No markers. Husky 9 wrappers in `.husky/_/` already dispatch `post-commit`. A9 failing → plan update (A9).

### Template — secrets sync (two-way example check)

#### [MODIFY] `.bkit/templates/scripts/secrets/bkit-secrets.mjs`

- **Existence Check:** exists. Callers: `scripts/secrets/bkit-secrets.mjs` (identical copy), `secrets-sync.integration.test.ts`, `catalogue.ts:268` (ask text), `.bkit/core/.bkit/templates.md` § Secrets sync. `--allow-missing` referenced nowhere else (`grep -rn "allow-missing"` → the two script copies only).
- Header: line 9 → `check [file]     local only: env files vs example both ways (warnings), copy inventory`; line 10 deleted; line 17 → `Exit: 0 clean (example findings only warn) · 1 a store failed or could not be read · 2 drift, or \`check <file>\` names a file that does not exist`.
- New `compareExample({ cfg, root, targets, log })` from `check()` `:734-762`: example path rule unchanged (`:734-735`); targets = `preview`, `production` (overlays never), or the one existing file `check <file>` names (as today, `:737-739`; configured sources then not compared); no example → `⚠️  no {exampleRel} — env files not compared`; per present target: example → env missing / empty → `⚠️` (skip `optional`, `protected`); env → example missing → `⚠️ {k} — not in {exampleRel}` (skip `protected`); returns nothing that alters exit.
- `check()`: calls it; `problems` only from `check <file>` naming a missing file → exit 2, checked before and independent of the example (today counted only inside `if (example)`, `:740-746`).
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

- Add `export function hasTool(bin: string): boolean` — filesystem PATH scan (shape of `which()` in `bkit-secrets.mjs:55-59`), no subprocess, so its test stays unit-tier; absent + `CI` (`"true"` / `"1"`) → throw `${bin} not found on PATH; the CI lane must install it`. Header rewritten: one place for test tools; local self-skip allowed only through this helper (`docs/testing.md:143`).

#### [NEW] `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts`

- **Reuse Check:** unit test of the EXTEND row "Tool presence"; no test of `vitest.tsx-bin.ts` exists (`grep -rln "vitest.tsx-bin"` → importers only). Clears and restores `CI` in-process (`bkit-tests-unit` runs with `CI=true`); temp PATH dirs only, no subprocess.

#### [NEW] `.bkit/core/engine/audits/templates/env-backup.integration.test.ts`

- **Reuse Check:** row "Integration tests for env backup" (a). Real `sops`, `age-keygen`, `git` in `mkdtemp` repos; `describe.skipIf(!hasTool("sops") || !hasTool("age-keygen"))` (throws on CI); row 33 sits in its own `describe` without that gate (needs `git` only). Key isolation: child env drops every inherited `SOPS_*` var (e.g. `SOPS_AGE_KEY`, `SOPS_AGE_KEY_CMD`, `SOPS_AGE_SSH_PRIVATE_KEY_FILE`, `SOPS_AGE_RECIPIENTS`), then sets `SOPS_AGE_KEY_FILE` → temp key; no-key cases point it at a missing file and set `HOME` / `XDG_CONFIG_HOME` to the temp dir. `GIT_*` scrub inherited from `vitest.setup.ts:14-37`. Hooks via `git config core.hooksPath <tmp>/.husky` holding husky-9-style wrappers (`sh -e <template copy>`, as `.husky/_/h` does) + template copies `chmod 0755` + a stub `pnpm` on PATH. Values are generated sentinels, never real secrets. Rows 1, 3-23, 33-36, 39-48.

#### [MODIFY] `.bkit/core/engine/audits/templates/secrets-sync.integration.test.ts`

- `:408-415` "check flags a required example key …" → expects exit 0 + `⚠️` line; new tests rows 26-30, 37, 38.

#### [MODIFY] `.bkit/core/engine/audits/templates/templates.test.ts`

- `:343-364` describe: add `.husky/post-commit contains NO bkit:start/bkit:end markers`, and pre-commit block order (row 24).

### CI

#### [MODIFY] `.github/workflows/bkit-ci.yml` (human-confirmed, Q6)

- `bkit-tests-integration` (`:631`): step `Install sops and age` before the test run — `SOPS_VERSION` / `SOPS_SHA256` / `AGE_VERSION` / `AGE_SHA256` env with renovate `datasource=github-releases` comments, `curl -fsSL --retry 3 --retry-all-errors` from `getsops/sops` (`sops-v${SOPS_VERSION}.linux.amd64`) and `FiloSottile/age` (`age-v${AGE_VERSION}-linux-amd64.tar.gz`), `echo "<sha>  <file>" | sha256sum -c -`, install to `$RUNNER_TEMP/bin` → `$GITHUB_PATH` (pattern `bkit-ci.yml:441-447`). Inside the existing `adapt` region (`dogfood-templates.test.ts:128-135`) → no dogfood edit. `actionlint` clean.

### Setup tip

#### [MODIFY] `.bkit/core/engine/checks/tips/catalogue.ts`

- New `SETUP_TIPS` entry after `secrets-sync` (`:262-271`): `id: "env-backup"`, no `workflows` (shown after every context's own tips), `title: "Back up your env files"`, `line` / `why` / `ask` in plain language (env files exist only on this machine → encrypted copy in git, one key in a password manager), ``steps: "`.bkit/templates.md` § Env backup."``, `fires: (cwd) => !isCloudOrCi() && exists(cwd, ".bkit/.env") && !exists(cwd, "scripts/env-backup")`. `ask` names the whole adoption set: install `sops` + `age`; copy `.bkit/templates/scripts/env-backup/` → `scripts/env-backup/`; copy `.bkit/templates/.sops.yaml` → `.sops.yaml` and fill the public key; add the pre-commit block; copy `.bkit/templates/.husky/post-commit` → `.husky/post-commit` and `chmod +x` it (the `husky` tip, `catalogue.ts:177`, copies only pre-commit / pre-push); add `!.env.enc` / `!.env.*.enc` to `.gitignore`. `why` reads the same as the § Env backup section opener in `.bkit/core/.bkit/templates.md`, written in the same commit (`catalogue.ts:15-17`; README row too if folded in). No `.bkit/wording.md` line: the OPEN `wording-test-setup-tips-lines-not-in-wording-file` concerns workflow lines shared across workflows, not tip text, and `template-path-refs.test.ts:100` forbids template paths there. Then `pnpm build` → commit `dist/` (`bkit:check:dist`).

#### [MODIFY] `.bkit/core/engine/checks/tips/catalogue.test.ts`

- Row 31.

### Shipped rule (human-confirmed, Q7)

#### [MODIFY] `.bkit/core/.agents/rules.md`

- `:93` → `- **Secrets:** NEVER stage \`.env*\`, credentials, tokens, API keys. Exception: the SOPS-encrypted \`_.enc\` copies the env-backup script writes; a plain \`.env_\` file never. \`git status\` review before every commit.`Mirror`.agents/rules.md`via`upgrade`inside Task 10 (`.bkit/core/engine/audits/repo/rules-sync.test.ts:58-69` byte-compares the managed blocks).

### Cron Jobs & Scheduled Tasks

None.

### Decision Ledger Rows (`docs/decisions.jsonl`)

Checked: no existing `651-*` / `sops` / `env-backup` row (`grep` over `docs/decisions.jsonl`). Owner: Task 11 appends them (re-check `grep '"key":"651-' docs/decisions.jsonl` first). Append via `.bkit/jsonl.md` § Write Idiom (`ts` minted by `jq`), `kind:"decision"`, `repo:"cbartens/bkit"`, `bkitVersion:"5.5.0"`, `workflow` / `step` / `subagent` / `model` = the writer's own, `status:"ACTIVE"`, `references:["651","docs/plans/202610/651-sops-env-backup-plan.md"]`:

<!-- prettier-ignore -->
| key | summary | rationale | alternatives |
| --- | --- | --- | --- |
| `651-env-backup-sops-copies-beside-plain-files` | Env files are backed up as SOPS (one age key) encrypted `{file}.enc` copies tracked beside each gitignored plain file, updated per variable (`sops set` / `sops unset`) by the pre-commit hook; discovery is automatic with a config skip list; only the main checkout writes them (linked worktrees skip); no key → warn and skip; a setup error or a key without a usable sops → stop the commit; an invalid line, duplicate key or incoming `.enc` change → warn and skip that file | Per-variable diffs show which variable changed; one key + one `.sops.yaml` cover every folder | dotenvx (per-file keys, in place); git-crypt (whole-file blob); whole-file `sops encrypt` (rewrites every line) |
| `651-env-backup-post-commit-restage` | A post-commit hook re-stages each `.enc` whose worktree copy equals HEAD but whose index entry differs | `git commit -- paths` runs pre-commit on a temporary index; the real index keeps the old `.enc` and a later plain commit reverts it | stage-when-differs only; state file; nothing |
| `651-secrets-check-example-two-way-warn-only` | `bkit-secrets.mjs` compares configured sources (preview, production) with `.env.example` both ways plus empty values and a missing example, as warnings in `check`, `sync`, `sync --dry-run`; these never change the exit code; `--allow-missing` removed; `check <file>` compares only that file, and a named file that does not exist exits 2 with or without an example | A key added to an env file but not the example went unnoticed; a warn-only check never blocks a sync | keep exit 2 for missing; check inside env backup |

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
| `.bkit/core/.bkit/templates.md` (source; mirror `.bkit/templates.md` via `upgrade`) | § What each template is for: `Env backup` row after `Secrets sync` (`:33`). § Contract: row `Env backup` → `.bkit/templates/scripts/env-backup/` + `.sops.yaml` + `.husky/post-commit` → `scripts/env-backup/`, `.sops.yaml`, `.husky/post-commit`; never plain env files (`:69` neighbour). § Placeholders: `{{AGE_PUBLIC_KEY}}` → `.sops.yaml` → your age public key (`age1…`) → none (`:82-86`). § Git hooks — Husky (`:202`): pre-commit env-backup block, new post-commit. New `## Env backup — an encrypted copy of every env file` after § Secrets sync (before `:593`): install (`brew install sops age` / release binaries), key creation (`age-keygen`; key file path per OS, `SOPS_AGE_KEY_FILE`), where to keep the key (password manager; never the repo), `.sops.yaml` fill, `.gitignore` lines `!.env.enc` / `!.env.*.enc` (after the line that ignores env files; folders ignored whole are never backed up), first encrypt (`encrypt --dry-run`, then commit), hook setup (pre-commit block, post-commit), skip list syntax + defaults, restore on a new machine (same keys and values, SOPS line order), key rotation (`rekey` flow; every line changes once), merge conflicts, clean merge commits (`pre-merge-commit` does not run the block; the next commit refreshes the `.enc`), incoming changes from another key holder (Q12-B warning + both fixes; a change whose author clock ran behind is missed), invalid lines / duplicate keys (warning, that file skipped until fixed, Q4-C), rebase / cherry-pick (post-commit `restage` per pick), linked worktrees (only the main checkout writes `.enc` copies, Q2), cloud agents (no key → skip, even with a `.gitignore` gap or malformed line), a key without a usable `sops` (commit stops: install or upgrade sops, Q15-B), the setup tip and how to silence it (`bkit.ignoreAdvisories`, Q8), comments in env files (if SOPS keeps them readable, A1: keep secrets out of comments, Q11), what the `.enc` reveals (names, lengths). Section opener written in Task 9 with the tip. § Secrets sync (`:552`): `check` row + new warnings in `check` / `sync` (both directions, empty, missing example, `protected` / `optional` exemptions), `check <file>` (that file only; missing → exit 2), exit legend, `--allow-missing` gone. |
| `docs/security.md` | § Secrets Management: new `### Env file backup — SOPS` (one age key, `.enc` beside plain, key custody, public-repo exposure Q11, rotate-everything on key leak). § Public repo content `:127`: `.bkit/.env.enc` is the one committed form of `.bkit/.env`. |
| `docs/testing.md` | § Key test files (`:550`): rows for `env-backup.integration.test.ts`, `vitest-tsx-bin.test.ts`. § CI execution (`:722`): `bkit-tests-integration` installs pinned `sops` + `age`. Missing-tool helper `hasTool` beside `requireTsx` (`:682` paragraph). |
| `docs/setup.md` | § Required tools (`:45`): `sops` (≥ `MIN_SOPS`) + `age` for the env backup and its integration tests; key file location. |
| `docs/technology.md` | § Testing (`:64`): real `sops` / `age` in integration tests. § Git Hooks (`:88`): pre-commit env-backup block, post-commit `restage`. |
| `docs/decisions.jsonl` | 3 rows (`Architecture` § Decision Ledger Rows); appended by Task 11. |
| `docs/deferrals.jsonl` | 4 rows (`Out of Scope`); appended by Task 11. |
| `.bkit/core/.agents/rules.md` | § Secrets carve-out (Q7); mirror via `upgrade`. |
| `CHANGELOG.md` | `[Unreleased]` → Added: env backup template (+ `.husky/post-commit`, `.sops.yaml`, setup tip). Changed: `bkit-secrets.mjs` two-way example warnings; `check` no longer exits 2 on example gaps; `--allow-missing` removed (re-copy note). |
| `docs/knowledge.jsonl` | None at plan time; build adds a row if a SOPS fact (A1) surprises. A9 failing goes through a plan update, not only a knowledge row. |

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
> **Build-agent constraints.** Never read, print, copy or stage a plain `.env*` file or any private key; test values are generated sentinels in temp repos only. Guardrails classify `.env*.enc` names as secret files (`.bkit/core/hooks/guardrails-tiers.js:192`) — verify through tests and the script's own output, not by naming env paths in shell reads. Edits to `.github/workflows/*` (Task 1) and `.bkit/core/.agents/rules.md` (Task 10) wait for their `Open Questions` confirmation (Q6, Q7). Task 2's root `.sops.yaml` key fill needs the Q9 public key, in hand before Gate 1 (Pre-Flight `User Context`, A6). Root hooks adopted in Task 6 never run in a linked worktree (Q2 skip; worktree commits run no husky hooks), so the build commits are unaffected — including the Task 6 → 7 window where the root pre-commit block exists before the `.gitignore` lines; one PR lands both. Advisory shape: one PR; commit per task with `{type}(651-sops-env-backup): …`. Tasks 8 and 9 depend on no earlier task: if Q6 or Q7 is refused (Task 1 / Task 10 stop for a plan update), they still run.

**Implementation Tasks:**

- [x] **Task 1: Test-tool helper, CI install, SOPS contract.** Add `hasTool` to `vitest.tsx-bin.ts` + `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts`; create `.bkit/core/engine/audits/templates/env-backup.integration.test.ts` with `describe("sops contract")` (row 1) pinning A1 facts and fixing `MIN_SOPS`; add the pinned `sops` + `age` install step to `bkit-tests-integration` in `.github/workflows/bkit-ci.yml` (Q6). **Done when:** `hasTool` exported; rows 1-2 pass (`pnpm vitest run .bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts`, `pnpm vitest run .bkit/core/engine/audits/templates/env-backup.integration.test.ts`), EB reported executed with 0 skipped (vitest summary; a skip = missing tool, not a pass); A1 facts each confirmed or the plan's call shape corrected in the test file header; workflow step present with VERSION + SHA256 + `sha256sum -c -`; `actionlint .github/workflows/bkit-ci.yml` clean; `dogfood-templates.test.ts` green. **Test first:** `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts` `hasTool returns false for a missing tool outside CI` fails on the returned boolean — stub returns true; `.bkit/core/engine/audits/repo/vitest-tsx-bin.test.ts` `hasTool throws naming the tool when CI is set` fails on the thrown message — stub never throws; sops-contract tests n/a — no behaviour change in this task: characterisation of the external `sops` binary for row 1, no repo code under test.
- [x] **Task 2: Script skeleton — preconditions, config, discovery, key probe, `.gitignore` gate, `--dry-run`.** Create `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs` (verbs parsed; `encrypt` plans only; key probe — both the tracked-`.enc` decrypt and the fixed-line round-trip — runs before the `.gitignore` gate), `bkit-env-backup.config.mjs`, `.bkit/templates/.sops.yaml` per Architecture; adopt them at once (dogfood requires an entry per template file, `dogfood-templates.test.ts:685`): root `scripts/env-backup/*` byte-identical, root `.sops.yaml` with Christian's public key (Q9 / A6), `dogfood-templates.test.ts` entries. **Done when:** rows 3-9, 18, 25, 36 and 39 pass (EB: 0 skipped); new templates carry `Example` + `does not write this file` (`templates-content.test.ts` green); `.sops.yaml` prettier-clean; `grep -c "{{AGE_PUBLIC_KEY}}" .sops.yaml` = 0; file modes match `bkit-secrets.mjs` (`git ls-files -s` after staging). **Test first:** EB `discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files` fails on the dry-run path list — stub lists nothing; EB `stops when gitignore hides an enc copy and names the line to add` fails on exit 1 and the `!.env.*.enc` text — stub exits 0; EB `no age key warns and writes nothing` fails on the warning line — stub silent; EB `no sops on PATH warns and exits 0` fails on the warning line; EB `sops below the minimum version warns and exits 0` fails on the warning line — PATH wrapper reports a version below `MIN_SOPS`, stub silent; EB `no sops on PATH with an age key file present stops and names the install` fails on exit 1 and the `install or upgrade sops` text — stub exits 0; EB `stops on a missing or unfilled sops config` fails on exit 1; EB `rejects an unknown config key and an unknown flag` fails on exit 1 and exit 2; EB `linked worktree notes and writes nothing` fails on the note line; EB `dry run writes and stages nothing` fails on the printed would-create path — stub prints nothing; EB `nested repo and submodule env files are never candidates` fails on the dry-run path list — stub lists nothing, the test also expects the top-level env file; EB `no age key with a gitignore gap warns and exits 0` fails on the key warning line — stub silent; `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` fails on the new template files having no entry before the entries are added.
- [x] **Task 3: `encrypt` — per-variable update, first encrypt, verify, stage, `--dry-run` would-update, merge-conflict stop, invalid-line and incoming-change skip (Q4-C, Q12-B).** **Done when:** rows 10-17, 34, 35, 40, 42, 43 and 44 pass in EB (0 skipped); one changed value → `.enc` diff = exactly 3 changed lines (variable, `sops_lastmodified`, `sops_mac`); failure path restores the original bytes; root copy re-synced (`cmp .bkit/templates/scripts/env-backup/bkit-env-backup.mjs scripts/env-backup/bkit-env-backup.mjs` silent and `pnpm vitest run .bkit/core/engine/audits/repo/dogfood-templates.test.ts` green — same in Tasks 4-6); A4 secret scan: the `.github/workflows/bkit-trivy.yml:63` image with `fs --scanners secret --severity HIGH,CRITICAL --exit-code 1` over a temp dir holding an EB-generated `.enc` (sentinel values) + a filled `.sops.yaml` → exit 0 (a finding → stop; A4 fallback is a human-confirmed scanner allowlist entry); A8 measured: wall time of `encrypt` with no plain-file change over a temp repo holding 10 tracked `.enc` copies recorded in the Task 3 handback — more than a few seconds (`.bkit/templates/.husky/pre-commit:9` rule) → A8 fallback. **Test first:** EB `one changed value changes only its line and the two bookkeeping lines` fails on the diff line set — stub writes nothing; EB `added and removed variables show as one line each` fails on added and removed counts; EB `unchanged plain file leaves the enc copy byte-identical and unstaged` fails on the staged list once staging lands — stub stages everything; EB `first encrypt creates a verified and staged enc copy` fails on the missing file; EB `absent plain file leaves its enc copy untouched` fails on the bytes compare — stub empties it; EB `invalid line and duplicate key warn with file and line only and skip that file` fails on the warning line and the second file's update — stub silent, writes nothing; EB `values round-trip with CRLF quotes equals hashes spaces newlines and empties` fails on the decrypted map; EB `a failing sops set restores the original enc bytes` fails on the bytes compare; EB `dry run names a changed file as would update` fails on the `would update` line — Task 2 prints would-create only; EB `merge conflict in an enc copy stops with the take-one-side fix` fails on exit 1 and the fix text — no conflict handling yet; EB `incoming enc change from another clone warns with both fixes and skips that file` fails on the warning line and fix text — stub silent, writes nothing (test sets the plain file's mtime before clone B's author time via `utimesSync`); EB `clean merge of another clone's enc change is skipped with a warning until the plain file is touched` fails on the warning line — same stub; EB `a failing first encrypt leaves no enc copy and no temp file` fails on exit 1 — stub exits 0 writing nothing; EB `no age key with an invalid line warns and exits 0` n/a — no behaviour change this test can see red: regression guard for row 40 (passes on Task 2's probe-first code).
- [x] **Task 4: `restore`.** **Done when:** rows 19 and 45 pass in EB (0 skipped) (fresh `git clone` of the temp repo + key → every env file back with a key→value map equal to the original's, mode `0600`, present file kept, non-ignored target refused, no key → exit 1; no / old `sops` → exit 1). **Test first:** EB `restore rebuilds every env file on a fresh clone and keeps existing ones` fails on the missing restored file and its key→value map — stub exits 0 writing nothing; EB `restore refuses a target git would not ignore and exits 1 without a key` fails on exit 1; EB `restore without sops or below the minimum version exits 1` fails on exit 1 — Task 2's `restore` stub exits 0.
- [x] **Task 5: `rekey`.** **Done when:** rows 20, 46 and 47 pass in EB (0 skipped). **Test first:** EB `rekey moves every enc copy to the new key and keeps the values` fails on decrypt with the new key — stub leaves the old recipients; EB `a failing rotate restores that enc copy and exits 1` fails on exit 1 — stub exits 0; EB `rekey without sops or below the minimum version exits 1` fails on exit 1 — Task 2's `rekey` stub exits 0.
- [x] **Task 6: `restage` + hooks.** Add the env-backup block to `.bkit/templates/.husky/pre-commit`; create `.bkit/templates/.husky/post-commit`; implement `restage`; extend `templates.test.ts` (`:343-364`); adopt both hooks at the root (block before the dist block in `.husky/pre-commit`; `.husky/post-commit` identical) and re-anchor the dogfood pre-commit region. **Done when:** rows 21-24, 32, 41 and 48 pass (EB: 0 skipped); `git ls-files -s .husky/post-commit .bkit/templates/.husky/post-commit` → mode `100755` for both, matching `.husky/pre-commit`; `disk-prune.test.ts`, `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`, `templates.test.ts`, `templates-content.test.ts` green. If row 22 shows the real index already == HEAD without post-commit (A9), stop Task 6 and return to plan: a plan update drops `restage` + post-commit, rewrites row 22, appends a decision row superseding `651-env-backup-post-commit-restage`, and puts Q1 back to Christian; rows and tests stay unchanged until then. **Test first:** EB `pre-commit commits the changed enc copy and only that one` fails on the commit's file list — template block absent; EB `pathspec commit leaves no staged enc copy after post-commit` fails on `git diff --cached --name-only` — no post-commit; EB `no verb prints a value` fails on the sentinel found in output — stub `restage` echoes the decrypted text; `.bkit/core/engine/audits/templates/templates.test.ts` `.husky/post-commit contains NO bkit:start/bkit:end markers` fails on the missing template file; `.bkit/core/engine/audits/templates/templates.test.ts` `pre-commit env-backup block sits after bkit:gate:format and before disk prune` fails on the missing block; `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` fails on the root pre-commit missing the template's env-backup block; EB `restage warns and exits 0 when git add fails` fails on the warning line — stub `restage` silent; EB `rebase and cherry-pick leave no staged enc copy` n/a — no behaviour change this test can see red: regression guard for row 41 (no stub `restage` state makes a pick leave an `.enc` staged).
- [x] **Task 7: bkit's `.gitignore` lets the `.enc` copies be tracked.** Root `.gitignore`: comment `:21` + `!.env.enc` and `!.env.*.enc` after `:24`. **Done when:** row 33 passes (EB: 0 skipped); `pnpm vitest run .bkit/core/engine/audits/repo/dogfood-templates.test.ts` green (whole adoption: rows 25, 32); `.bkit/.env.enc` creation left to the owner (A5). **Test first:** EB `bkit's gitignore leaves the enc copies trackable` fails on `git check-ignore` reporting `.env.*` at `.gitignore:23`.
- [x] **Task 8: `bkit-secrets.mjs` two-way example warnings.** Extract `compareExample`; call from `check` and `sync`; delete `--allow-missing` and exit-2 example semantics (Supersession rows 1-4); new header + `slice(3, 11)`; copy byte-identical to `scripts/secrets/bkit-secrets.mjs`. **Done when:** rows 26-30, 37 and 38 pass in SS; `grep -rn "allow-missing" .bkit/templates scripts` → no match; `cmp .bkit/templates/scripts/secrets/bkit-secrets.mjs scripts/secrets/bkit-secrets.mjs` silent; `node scripts/secrets/bkit-secrets.mjs help` prints the header without `--allow-missing`. **Test first:** SS `check warns both ways and on a missing example without failing` fails on exit 0 — current exit 2; SS `sync and sync dry run print the example warnings and still write` fails on the warning line; SS `allow-missing is an unknown option` fails on exit 1 — current exit 2 path; SS `protected keys are exempt both ways and optional keys only from example to env` fails on the warning set; SS `check on a missing named file exits 2 with or without an example` fails on exit 2 for the no-example case — current exit 0 (the with-example case passes today, regression guard); SS `check on an existing named file compares only that file both ways` fails on the env → example warning — current one-way compare; SS `list and drift print no example warnings` n/a — no behaviour change this test can see red: regression guard for row 37 (passes today).
- [x] **Task 9: Setup tip `env-backup`** (Q8) in `catalogue.ts` + `catalogue.test.ts`, plus the `## Env backup — an encrypted copy of every env file` heading and section opener in `.bkit/core/.bkit/templates.md` in the same commit (`catalogue.ts:15-17`; Task 11 fills the rest); no `.bkit/wording.md` line; `pnpm build`; commit `dist/`. **Done when:** row 31 passes; `catalogue.test.ts` ordering / shape tests green; `pnpm bkit:check:dist` clean; the tip `why` and the § Env backup opener state the same benefit in one commit; `ask` names every adoption-set path per Architecture (`catalogue.test.ts:107-114` asserts they exist). **Test first:** `.bkit/core/engine/checks/tips/catalogue.test.ts` `env-backup fires with a bkit env file and no env-backup script, not on cloud or CI` fails on the missing tip id.
- [x] **Task 10: Shipped rule carve-out** (Q7) in `.bkit/core/.agents/rules.md:93` — the source of the managed `bkit:start` / `bkit:end` block (`.agents/rules.md` § Repo Authoring → Edit source), not its mirror, so editing inside the block is correct here; then `pnpm tsx .bkit/core/engine/cli.ts upgrade` and `git config core.bare false`, so `.agents/rules.md` mirrors the source (`.bkit/core/engine/audits/repo/rules-sync.test.ts:58-69` byte-compares the managed blocks). **Done when:** line reads per Architecture; `.agents/rules.md` managed block matches the source; `git config core.bare` → `false`; `pnpm vitest run .bkit/core/engine/audits` green (rule-text consumers). **Test first:** n/a — doc rule text, no behaviour change.
- [ ] **Task 11: Documentation + ledger rows** per `Documentation Updates` (templates.md source sections + the rest of § Env backup, `docs/security.md`, `docs/testing.md`, `docs/setup.md`, `docs/technology.md`, README row if folded in); append the 3 `docs/decisions.jsonl` rows (§ Decision Ledger Rows) and the 4 `docs/deferrals.jsonl` rows (§ Out of Scope) via `.bkit/jsonl.md` § Write Idiom after re-checking `grep '"key":"651-'` in each. **Done when:** every row in `Documentation Updates` applied; § Env backup in `.bkit/core/.bkit/templates.md` states the clean-merge behaviour (`pre-merge-commit` does not run the block) and the incoming-change warning (Q12-B) — `grep -n "pre-merge-commit" .bkit/core/.bkit/templates.md` hits § Env backup; `grep -c "{{AGE_PUBLIC_KEY}}" .bkit/core/.bkit/templates.md` ≥ 1 (§ Placeholders row; no test asserts placeholder rows); every key in § Decision Ledger Rows and § Out of Scope present exactly once in its ledger; `pnpm vitest run .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts` green (Contract row covered; no new template name in workflows / prompts / `wording.md`); `pnpm bkit:gate:static-unit` prose + format clean. **Test first:** n/a — docs.
- [ ] **Task 12: CHANGELOG, mirror refresh, full suite, dogfood, final check.** `CHANGELOG.md` `[Unreleased]` Added / Changed; `pnpm tsx .bkit/core/engine/cli.ts upgrade`; `git config core.bare false`; `pnpm bkit check`; full suite; packed-tarball dogfood on a fresh scratch consumer (`.agents/rules.md` § Repo Authoring → Verify before complete). **Done when:** `.bkit/templates.md` and `.agents/rules.md` mirrors match their sources; `pnpm bkit check` exit 0; `git config core.bare` → `false`; `pnpm vitest run` (unscoped) green except reds recorded at the Pre-Flight baseline, EB executed with 0 skipped; `pnpm build` + `pnpm pack` → tarball installed into a fresh scratch consumer outside the repo (`git init`, empty `.bkit/.env` via `touch`, no `scripts/env-backup/`; `docs/testing.md:464` scratch-consumer shape, so the repo's `node_modules` cannot mask the package) → `node node_modules/@cbartens/bkit/dist/cli.js install --claude --cursor` exit 0 → `.bkit/templates/.sops.yaml`, `.bkit/templates/.husky/post-commit`, `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs`, `.bkit/templates/scripts/env-backup/bkit-env-backup.config.mjs` present with modes equal to their bkit-repo sources (`stat`; `post-commit` + script executable); `node node_modules/@cbartens/bkit/dist/cli.js tips --all` with `CI` unset lists `Back up your env files`. **Test first:** n/a — release notes and generated mirrors.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row and its search still holds — reusable artifact found mid-build → add a row, fold code into it; every `EXTEND` landed as a modification of the named artifact, not a parallel file. No type-system escapes (e.g. TS `as any` / `as unknown as` / `@ts-ignore`, Python `# type: ignore`), linter disables (e.g. `eslint-disable`, `//nolint`), test skips (e.g. `.skip`, `xfail`), empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Test first:** every task naming `Test first` tests recorded a red per test before its code (`n/a` entries — characterisation, regression guards for rows 1, 37, 40, 41 — recorded a green run instead); tests unchanged since except added tests / formatting.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Backend / pipeline logic** — test at the unit/integration tier (Vitest), not through a browser.
> - **End-to-end integration** — real `sops` / `age` / `git` binaries against a scratch repo, no mocking of the boundary.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each `Acceptance Scenario → Derived Test Matrix` row (1-48) → its runbook task's `Done when` carries the test; gaps → add to that task, not here.
- [ ] **Sweep existing tests:** Each task fixed the tests it broke (`secrets-sync.integration.test.ts:408-415`, `dogfood-templates.test.ts`, `templates.test.ts`, `templates-content.test.ts`, `catalogue.test.ts`); full suite green per `docs/testing.md` except reds recorded at the Pre-Flight baseline.
- [ ] **Sweep new tests:** `env-backup.integration.test.ts` and `vitest-tsx-bin.test.ts` exist and pass; EB runs (not skipped) wherever `sops` + `age-keygen` are on PATH, and throws under `CI` when they are not.
- [ ] **Verify observability:** `[env-backup]` warnings / errors on stderr name paths, `file:line` and keys only; sentinel test (row 23) green. No new log drain, span or audit table.
- [ ] **Update documentation:** every `Documentation Updates` row applied; `docs/decisions.jsonl` and `docs/deferrals.jsonl` rows present (appended by Task 11); ground-truth prose rewritten, no lazy bullet appends.

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
- [ ] **Integration (`.bkit/core/engine/audits/templates/env-backup.integration.test.ts`):** rows 1, 3-23, 33-36, 39-48 against real `sops` / `age-keygen` / `git` in temp repos; data hygiene = generated sentinel values + temp age keys, temp dirs removed in `afterEach`.
- [ ] **Integration (`.bkit/core/engine/audits/templates/secrets-sync.integration.test.ts`):** rows 26-30, 37, 38.
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

- [x] **Step 1 — key:** `age-keygen -o "<SOPS key file>"` (macOS default `~/Library/Application Support/sops/age/keys.txt`, or `SOPS_AGE_KEY_FILE`); store the private key in the password manager; give the `age1…` public key to the build before Gate 1 (Task 2 fills it).
- [ ] **Step 2 — first backup:** after merge, in the main checkout, first run `node scripts/env-backup/bkit-env-backup.mjs encrypt --dry-run` and review the `would create` path list — every listed env file gets a public, irreversible `.enc` (names + value lengths), not only `.bkit/.env` (Q11 / A3); add any unwanted path to the skip list; then commit anything → `git show --stat HEAD` lists `.bkit/.env.enc`; `git status --short` shows no staged `.enc` left behind.
- [ ] **Step 3 — one-value diff:** change one value in `.bkit/.env`, commit → `git show HEAD -- .bkit/.env.enc | grep -c '^[-+][^-+]'` = 6 (3 removed, 3 added: the variable, `sops_lastmodified`, `sops_mac`); no value printed (ciphertext only).
- [ ] **Step 4 — restore:** `git clone` the repo into a temp dir, run `node scripts/env-backup/bkit-env-backup.mjs restore` there → key→value maps compared without printing them (A2: line order may differ): `diff <(grep -v '^#' .bkit/.env | grep = | sort) <(grep -v '^#' <temp>/.bkit/.env | grep = | sort) > /dev/null && echo same` (prints `same` or nothing; never a value); `stat -f %Lp <temp>/.bkit/.env` = `600`.
- [ ] **Step 5 — no key:** `SOPS_AGE_KEY_FILE=/nonexistent node scripts/env-backup/bkit-env-backup.mjs encrypt` → one `[env-backup] no age key` warning, exit 0.
- [ ] **Step 6 — secrets warnings:** `node scripts/secrets/bkit-secrets.mjs check; echo "exit $?"` → example warnings (if any) with `exit 0`; `node scripts/secrets/bkit-secrets.mjs check --allow-missing; echo "exit $?"` → unknown option, `exit 1`.
- [ ] **Step 7 — CI:** `gh run list --workflow bkit-ci.yml --branch {branch} --limit 1` → `bkit-tests-integration` success with the env-backup suite executed (see Automated Tests, CI lane executed).

<!-- bkit:end -->
