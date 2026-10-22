Verdict: CONCERNS

<!-- verdict:end -->

# Plan Summary

## Overview

- **Build:** SOPS-encrypted `{file}.enc` copy beside every gitignored `.env` / `.env.*` file, updated one variable at a time by the pre-commit hook. New copy-and-own template `scripts/env-backup/` (verbs `encrypt`, `restore`, `rekey`, `restage`), `.sops.yaml`, `.husky/post-commit`, `.gitignore` exception lines, two-way warn-only example check in `bkit-secrets.mjs` (`--allow-missing` removed), pinned `sops` + `age` install in CI, docs, setup tip, shipped rule carve-out for `*.enc`.
- **Size:** 12 tasks, 4 gates, 48 derived test rows, 12 open questions, 4 out-of-scope items. Complexity check: SINGLE.
- **Gates:** Gate 1 blocked by the missing Narrative, three unchecked human confirmations, and the Q9 public key. Q6 (CI edit) gates Task 1; Q7 (shipped rule) gates Task 10.

## Plan Quality

- **Scope:** Well-scoped. One domain (template scripts plus their adopted root copies). No DB, API or UI work.
- **Dependencies:** Explicit. Task 2 needs the Q9 public key. Task 1 CI step waits on Q6. Task 10 waits on Q7. Task 6 has an A9 fallback that rewrites the plan. Tasks 8 and 9 are independent.
- **Gates:** Structure correct. Gate 1 correctly blocked. Every task has `Done when` and `Test first`; n/a entries name their category.
- **Review history:** `plan-review-1..3` (9 failures) and `plan-scope-check-1..2` (5 failures) ran before v3. v3 addresses their CRITICAL items: Q9 timing, row 5 / row 18 split, restore contract, EXTEND-to-NEW relabel, failure-path rows, incoming-change stop (Q12), Edge Case rows 35-38, temp-file rename, Q4 acknowledging the open failure class. v3 header says PASS from its own scope check. This review returns CONCERNS because of the missing Narrative and the SC6 conflict below.

## Completeness

- **Scope coverage:** Every issue decision maps to a task or to Out of Scope. Success criteria map to rows: SC1 to 19; SC2 to 10, 11; SC3 to 21, 22; SC4 to 3; SC5 to 26, 27; SC6 to 25, 32, 33.
- **Matrix to runbook:** 48 rows, each to exactly one task. Edge Cases table (37 rows) maps to matrix rows, except "Whole-file re-encrypt would rewrite every line", which has no explicit assertion (rows 10-11 imply it).
- **Testing:** Adequate and tiered. Real `sops`, `age` and `git` binaries in temp repos, no mocking of the boundary. `hasTool` throws on CI, so the integration suite cannot skip silently there. Task 12 runs the full suite, `pnpm pack`, and a scratch-consumer install. A sentinel test checks that no value is printed.
- **Docs:** Planned. `.bkit/core/.bkit/templates.md`, `docs/security.md`, `docs/testing.md`, `docs/setup.md`, `docs/technology.md`, `CHANGELOG.md`, the `decisions.jsonl` and `deferrals.jsonl` rows (Task 11), and the shipped rule (Task 10).
- **Gaps:** No coverage gap found. Consistency gaps are listed under Action Items.

## Acceptance Scenario

**Narrative** (verbatim from plan-v3 § Narrative)

> Inherited from design, else the issue; do not rewrite.

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

> Suggestion for the human — NOT adopted, never treated as the Narrative until a human writes it in: "As a developer, I commit my env file changes as usual and git keeps an encrypted copy of every env file beside it; on a new machine I run one command with my key and get every env file back, and the secrets sync tells me when an env file and `.env.example` disagree." (derived from issue § Outcome 1–2)

**Success Criteria** (verbatim)

> Issue § Success criteria verbatim (6 bullets; Spec: no design → issue verbatim, which overrides the 5-bullet cap).

- Fresh clone + the one decryption key → every env file restored with one command.
- Changing one value changes only that variable's line in its encrypted file, plus SOPS's two bookkeeping lines (`sops_lastmodified`, `sops_mac`). Unchanged variables stay byte-identical. An added or removed variable shows as one added or removed line.
- A commit on a machine holding the key updates and stages every `.enc` copy whose plain file changed.
- A new env file anywhere in the repo is picked up with no setup, unless it matches the skip list.
- `bkit-secrets.mjs sync` and `check` warn on a key in an env file missing from `.env.example`, a key in the example missing from an env file, or no example file; they never fail on these and the sync still runs.
- bkit adopts the template on its own env files; the root copy stays byte-identical to the template.

**Process Sketch** (verbatim)

- **WHEN** a developer holding the age key changes one value and adds one variable in `apps/web/.env.preview`, then commits **→ THEN** the commit carries `apps/web/.env.preview.enc` with exactly that variable's line changed, one added line, plus `sops_lastmodified` + `sops_mac`; every other line byte-identical.
- **WHEN** a new env file appears in any folder not on the skip list **→ THEN** the next commit creates and stages its `.enc` with no setup.
- **WHEN** a fresh clone with the key runs `node scripts/env-backup/bkit-env-backup.mjs restore` **→ THEN** every env file with a tracked `.enc` is back (mode 0600); env files already present are kept.
- **WHEN** `node scripts/secrets/bkit-secrets.mjs check` / `sync` runs and a configured source env file and `.env.example` disagree in either direction, or the example is absent **→ THEN** each gap prints as a warning, the exit code is unchanged, the sync still writes.
- **IF** the machine has no key (cloud agent) **→ THEN** one warning, nothing written, the commit proceeds.
- **IF** `.gitignore` would hide an `.enc` **→ THEN** the commit stops, printing the ignoring `source:line:pattern` and the exact line (`!.env.enc` / `!.env.*.enc`) to add after it.
- **IF** a plain file is absent **→ THEN** its tracked `.enc` stays untouched, never emptied.

**Concrete Example** (verbatim)

**Setup:** Developer in a repo that adopted the template (`scripts/env-backup/`, `.sops.yaml` holding the age public key, `.husky/pre-commit` block, `.husky/post-commit`, `.gitignore` lines `!.env.enc` / `!.env.*.enc`). `sops` + `age` installed; age private key in the SOPS default key file (or `SOPS_AGE_KEY_FILE`). Tracked `.bkit/.env.enc` and `apps/web/.env.preview.enc` exist; `apps/web/.env.preview` is the configured `sources.preview` in `scripts/secrets/bkit-secrets.config.mjs`; `apps/web/.env.example` lists the old keys.

**Steps:**

1. Developer changes one value and adds one variable in `apps/web/.env.preview`, runs `git commit -m "…"` → pre-commit `encrypt` decrypts `apps/web/.env.preview.enc` in memory, compares per key, runs `sops set` for the changed and the added key, verifies the decrypted map equals the plain file, stages the `.enc`; `.bkit/.env.enc` (plain file unchanged) stays byte-identical and unstaged.
2. Developer runs `git show HEAD -- apps/web/.env.preview.enc` → diff shows one changed variable line, one added line, `sops_lastmodified`, `sops_mac`; nothing else.
3. Developer runs `node scripts/secrets/bkit-secrets.mjs check` → warning names the added variable as missing from `apps/web/.env.example`; exit 0.
4. Laptop lost. On a new machine: `git clone`, key pasted from the password manager into the key file, `node scripts/env-backup/bkit-env-backup.mjs restore` → `.bkit/.env` and `apps/web/.env.preview` written (mode 0600), one line per restored file naming the path only.

**Outcome:** Every env file is back with the same keys and values (key→value map equal to the original; line order may differ, A2); git history shows which variable changed in which commit; the example gap is visible without failing anything; no value appeared in any output.

**Edge Cases** (verbatim; "Issue-decided rows (from issue § Decisions already made) first, then plan-added.")

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| No key on the machine (cloud agent) | `encrypt` prints one warning, writes nothing, exits 0; commit proceeds |
| Plain file absent, its `.enc` tracked | `.enc` left untouched, never emptied |
| `.gitignore` would hide an `.enc` | exit 1 → commit stops; prints `source:line:pattern` from `git check-ignore --no-index -v` and the exact line (`!.env.enc` / `!.env.*.enc`) to add after it |
| Env file matches skip list (issue defaults `.vercel/**`, `supabase/.temp/**`, `.worktrees/**`, `.claude/worktrees/**`, `node_modules/**`; plan-added `tmp/**` pending Q10) | never a candidate |
| Whole-file re-encrypt would rewrite every line | never used for an existing `.enc`; per variable `sops set` / `sops unset` only |
| Plain file unchanged | `.enc` byte-identical, not staged |
| `sops` missing or below the script's minimum version | one warning, exit 0; commit proceeds |
| Env file inside a gitignored folder | never a candidate (Q5) |
| Symlinked env file; tracked `.env*`; `.envrc`; `.env.example`; `*.enc` | never candidates |
| Crash leftover `.env-backup-tmp-{PID}` (new-`.enc` temp file) | never a candidate (basename fails `^\.env(\..+)?$`) |
| Nested git repo / submodule | not descended, also on the A10 re-list path |
| No key + a `.gitignore` gap, line with no `=` or duplicate key | key warning, exit 0, nothing written — key probe runs before the gate and validation |
| Line with no `=` (not blank, not `#`) | exit 1 naming `file:line`; no line content printed |
| Duplicate key | exit 1 naming `file:line` + key; no value printed |
| `.sops.yaml` missing or still holding `{{AGE_PUBLIC_KEY}}` | exit 1 naming the fix |
| Config unknown key (typo) | exit 1 naming the key |
| Bad CLI arguments | exit 2 + usage |
| Value with CRLF, quotes, `=`, `#`, spaces, literal `\n`, empty | decrypts to the same raw text after the first `=` |
| `sops set` / `unset` fails mid-update | original `.enc` bytes restored; exit 1 naming the file |
| Pathspec commit `git commit -- paths` (agents' default) | `.enc` lands in the commit; post-commit `restage` leaves the real index == HEAD (Q1) |
| `git rebase` / `git cherry-pick` (post-commit runs per pick) | `restage` per pick; no `.enc` left staged |
| Clean `git merge` commit (`pre-merge-commit` runs, not `pre-commit`) | `.enc` not refreshed in the merge commit; the next ordinary commit refreshes it from a locally changed plain file; an `.enc` change the merge brought in → incoming-change row (Q12) |
| Another key holder's `.enc` change arrives (`git pull`, clean `git merge`, owner's second machine) while the local plain file holds the old value | (Q12-A) `encrypt` exit 1 naming the file + commit and both fixes (keep theirs: delete the plain file, run `restore`; keep yours: `touch` the plain file, commit again); nothing written; never silently overwritten |
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

**Adherence to `docs/templates/bkit-plan.md` § Spec:** Partial. Narrative is correctly MISSING (issue has no Narrative field). Success Criteria are issue-verbatim with 6 bullets; the Spec's ≤5 cap is exempted only for audits, so the verbatim reading needs human confirmation. Process Sketch has 7 bullets (within 3–7). Concrete Example is one scenario. Edge Cases draw on issue § Decisions because the issue has no Edge Cases rows, as the Spec names them. Derived Test Matrix (48 rows) is excluded from this section per the output format.

## Breaking Changes

- **B1 `check --allow-missing` removed:** now an unknown option, exit 1. A CI step passing it breaks when a consumer re-copies `bkit-secrets.mjs`. Copy-and-own; release note; no migration (A7).
- **B2 `check` example gaps:** a missing or empty example key now warns and exits 0 (was exit 2).
- **B3 `check <file>` naming a missing file:** exits 2 even with no example file (was exit 0).
- **B4 bkit's own repo:** every commit by a key holder runs `encrypt`. It can stop any committer's commit on a `.gitignore` gap, a malformed or duplicate line, or an incoming `.enc` change (Q4, Q12).
- **B5 shipped rule:** `.agents/rules.md` § Secrets gains a `*.enc` exception (Q7). Consumers receive it through `bkit upgrade`.
- **Names (15 proposed, awaiting human confirmation):** template folder, script, config, verbs, `.sops.yaml`, placeholder `{{AGE_PUBLIC_KEY}}`, `.husky/post-commit`, `{file}.enc` layout, `.gitignore` lines, `compareExample`, `hasTool`, tip id `env-backup`, templates.md section, test file, output prefix `[env-backup]`.

## Design Alignment

- **Design:** None. The issue carries `next:plan`; design was skipped. Narrative is therefore MISSING (see Acceptance Scenario). Success Criteria are the issue's, verbatim.
- **Scope vs issue:** Mostly within issue scope. Plan-added build items the issue does not name: `rekey` verb (Task 5; the issue asks only for key-rotation docs); `restage` verb and `.husky/post-commit` (Task 6, Q1); `encrypt --dry-run`; setup tip (Task 9, Q8); `tmp/**` skip entry (Q10); and the Q3 / Q4 / Q12 stops. The Q items are open questions. `rekey` has no open question, so it needs an explicit human confirmation (Action Items).

## Deferred & Out-of-Scope

All four items are `Exempt` (issue non-goals). None is `Blocking`.

- **Store sync from the env-backup template:** excluded; store pushes stay in `bkit-secrets.mjs`. Deferral key `651-env-backup-store-sync`.
- **CI decryption of `.enc` files:** excluded; no success criterion needs a key in CI. Key `651-env-backup-ci-decryption`.
- **Hosted secret managers:** excluded; git plus SOPS plus one age key is the only backend. Key `651-env-backup-hosted-secret-managers`.
- **Automating key storage:** excluded; the key is entered by hand. Key `651-env-backup-key-storage-automation`.

Task 11 appends the four `deferrals.jsonl` rows. They are not yet appended. The `reason:"scope-declared"` value was not checked against the closed enum in `.bkit/jsonl.md`, which this review did not read.

Advisory only. Candidates, not scope.

<!-- prettier-ignore -->
| # | Candidate | Source | Recommendation |
| --- | --- | --- | --- |
| 1 | Guardrails classify `.env.enc` / `.env.*.enc` as secret, blocking agent reads of ciphertext | `.bkit/core/hooks/guardrails-tiers.js:192` | needs design decision |
| 2 | README "Templates ready to adopt" row for Env backup | `README.md:256-268` | fold in |
| 3 | Agents audit Step 8 "env file not ignored" would flag tracked `.env*.enc` | `.bkit/core/docs/templates/bkit-audit-agents.md:113` | fold in |
| 4 | Setup-tip lines missing from `.bkit/wording.md` fail `wording.test.ts` (OPEN failure) | `docs/failures.jsonl` | keep separate; conflicts with Task 9 (Action Items 4) |
| 5 | `bkit:check:dist` pre-commit block stalls parallel agents (OPEN failure) | `docs/failures.jsonl` | keep deferred |
| 6 | Secrets-sync config audit that checks values match (#497) | #497 | keep separate; Task 8 merge conflicts likely |
| 7 | Pluggable store adapters and agent-host stores (#529) | #529 | keep separate |
| 8 | Codex agent reads of `.env*` files have no read gate (OPEN deferral) | `docs/deferrals.jsonl` | keep deferred; hard-blocked on an unverified Codex tool name |
| 9 | opencode has no script hook, so two gates cannot be expressed there (OPEN deferral) | `docs/deferrals.jsonl` | keep deferred |
| 10 | Hand-made `.env.*.backup` files get their own `.enc` copies | issue § Problem; plan review 1 | fold in (one docs sentence: delete them after adoption) |
| 11 | `[mcp-env]` advisory tells a fresh clone to copy `.bkit/.env.example`; could point to `restore` | `.bkit/core/engine/checks/before/env.ts:54` | keep separate |
| 12 | Wire `pre-merge-commit` so clean merge commits refresh `.enc` copies | plan review 3; scope checks 1-2 | needs design decision |

Informational. No action this cycle.

- **Q4 / Q12 stops:** a stop blocks every main-checkout committer on the key-holding machine, parallel agents included. The plan's Q4 default re-enters the OPEN failure class `precommit-check-dist-blocks-parallel-agents` (`docs/failures.jsonl`).
- **Silent aging:** `sops` missing or below minimum on a key-holder machine warns and exits 0. Agents may not read hook stderr, so the backup ages unnoticed. The review-3 proposal to stop or repeat the warning was not adopted and is not an open question.
- **Unmeasured until build:** hook runtime (A8, timed in Task 3); secret scanner on ciphertext (A4, Trivy in Task 3); pathspec index behaviour (A9, row 22, Task 6 fallback rewrites the plan); discovery collapse (A10, row 36); SOPS dotenv flags (A1, Task 1).
- **Public exposure:** `.bkit/.env.enc` publishes key names, value lengths and possibly comments in a public repo (Q11, A3). A leaked private key exposes every value in history.
- **Q12 blind spot:** the author-time check misses a change whose author clock ran behind (documented in the plan).
- **Test shape:** rows 1, 3 and 23 each bundle several behaviours under one row. Each runs real subprocesses, so the 30-second integration budget (`vitest.timeout-budget.ts`) is unmeasured.
- **Duplicated helpers:** `parseEnv`, `run`, `loadConfig` and `globToRegExp` are copied into the new script (reason (b)). Glob semantics now live in two places.
- **Agent reads blocked:** guardrails treat `.env*.enc` names as secret files, so build verification must go through the script's own output.
- **Mirror regeneration mid-run:** Task 9 runs `pnpm build` and commits `dist/`. Task 10 runs `upgrade`, and Task 12 runs it again.
- **Not verified in this review:** `docs/testing.md` tier rubric, `.bkit/jsonl.md` enum, the text of the `docs/failures.jsonl` rows, the state of #497 and #529, and `plan-v1-draft.md` / `plan-v2-reviewed.md` (superseded; their findings reached v3 through the reviews).

Revisions before build, then the unchecked human gates. Gate checkboxes unchecked on a new plan are expected and did not drive the verdict.

1. **Write the Narrative (Gate 1 blocker).** The human writes it. The plan's suggested sentence is not adopted.
2. **Acceptance Scenario confirmed; Breaking Changes confirmed; Open Questions & Assumptions confirmed.** All three boxes are unchecked (expected). Explicit confirmation is also needed for Q6 (before Task 1), Q7 (before Task 10) and Q9 (Christian's age public key, before Task 2 and Gate 1).
3. **SC6 conflicts with the plan.** SC6 says the root copy stays byte-identical to the template. The plan's root `.sops.yaml` carries the public key (dogfood `placeholder` edit; row 25 "template + public-key placeholder fill"). Recommended: amend SC6 to say the script and config are byte-identical and `.sops.yaml` differs only by the public-key line. SC6 is issue-verbatim, so the human decides.
4. **Setup-tip failure row contradicts itself.** Suggested row 4 says setup-tip lines missing from `.bkit/wording.md` fail `wording.test.ts`. Task 9 says the OPEN failure concerns workflow lines, not tip text. Read the `docs/failures.jsonl` row (not read in this review), then make Task 9, Pre-Flight and Suggested row 4 agree. Task 12's "green except baselined" depends on it.
5. **Confirm `rekey` scope.** Task 5 (rows 20, 46, 47) builds a verb. The issue asks only for key-rotation docs. The plan's Alternatives table already rejects a docs-only procedure. If the human chooses docs-only, drop Task 5 and those three rows.
6. **Confirm the Success Criteria count.** Six verbatim bullets against the Spec's 5-bullet cap. The Spec exempts only audits from the cap.
7. **Decide on silent aging.** Either raise the sops-missing case (Risks) as an Open Question or record it as accepted. Currently neither.

Verbatim from plan-v3 § Open Questions & Assumptions. Questions first, then assumptions (assumptions carry no options by design).

**Open Questions**

- **Open Question Q1 — pathspec commits.** `git commit -- paths` (the agents' default, `.agents/rules.md` § Commits) runs pre-commit against a temporary index (git `builtin/commit.c` partial-commit flow): the hook's `git add` reaches the commit but not the real index, which keeps the old `.enc` staged → a later plain `git commit` reverts it. → human decides.
  - **Options:** A — stateless post-commit `restage` (`git add` an `.enc` only when worktree == HEAD and index ≠ HEAD) + new `.husky/post-commit` template + `encrypt` also stages any managed `.enc` whose worktree copy differs from the index · B — stage-when-differs only; real index shows a stale staged `.enc` until the next full commit · C — nothing; revert risk stays
  - **Recommended:** A — closes the revert with no state file; test-first reproduces the bug (row 22); no reproduction → plan update (A9).
  - **Default if unanswered:** A
- **Open Question Q2 — linked worktrees.** Each worktree holds stale plain copies (or none); parallel branches would rewrite the same `.enc`. → human decides.
  - **Options:** A — skip with a one-line note; the main checkout is the only writer · B — use the worktree's own plain copies (stale snapshots roll values back; parallel branches conflict on `sops_lastmodified`) · C — read the main checkout's plain files (still conflicts across parallel branches)
  - **Recommended:** A — no rollback, no cross-branch conflicts; bkit's own worktree commits run no husky hooks anyway.
  - **Default if unanswered:** A
- **Open Question Q3 — empty value in an env file for a key the example lists.** Today ❌ + exit 2. → human decides.
  - **Options:** A — warning; an unfilled key no longer fails `check`, noticed only if the warning is read · B — keep ❌ / exit 2; an unfilled key still fails `check`, but one example finding then changes the exit code
  - **Recommended:** A — issue: example findings "never change the exit code".
  - **Default if unanswered:** A
- **Open Question Q4 — setup and per-file errors** (`.sops.yaml` missing / placeholder, line with no `=`, duplicate key, config typo, any other sops failure) on a machine holding the key. Keyless machines never stop: the key probe runs before the `.gitignore` gate and validation. Stopping re-enters the OPEN failure class `precommit-check-dist-blocks-parallel-agents` (`docs/failures.jsonl`): a pre-commit check fails a commit on working-tree state outside it, so a parallel agent's `git commit -- fileA` stops on another person's env-file typo it cannot inspect (guardrails classify `.env*` reads as secret, `.bkit/core/hooks/guardrails-tiers.js:192`; output is `file:line` only). The issue-decided `.gitignore` stop has the same reach. → human decides.
  - **Options:** A — stop the commit (exit 1) naming `file:line`; the backup never ages silently, but every main-checkout committer is blocked until the owner fixes the file (linked worktrees skip, Q2) · B — warn and skip that file; unrelated commits flow, that file's `.enc` ages while the warning repeats every commit; matches the issue review note "It only stops when `.gitignore` would hide an `.enc` file" (`plan-input-1.md:86`) · C — stop on repo-wide setup errors (`.sops.yaml`, config typo: committed files every committer sees), warn and skip per-file content errors (no-`=` line, duplicate key); unrelated commits flow, a per-file backup ages if agents ignore hook stderr
  - **Recommended:** A — a silent skip leaves a stale backup that looks current; the issue's warn-and-proceed covers only "no key" and "plain file absent"; blocking is limited to main-checkout commits on the key-holding machine.
  - **Default if unanswered:** A
- **Open Question Q5 — env files inside gitignored folders.** → human decides.
  - **Options:** A — never candidates (`git ls-files --directory` collapses them; `!` lines cannot re-include a file under an ignored folder) · B — candidates; stop with "add to skip list"; every env file under an ignored folder (e.g. build output) stops commits until listed
  - **Recommended:** A — `.enc` there could never be tracked; documented in templates.md.
  - **Default if unanswered:** A
- **Open Question Q6 — CI install of `sops` + `age` in `bkit-tests-integration`** (`.github/workflows/bkit-ci.yml:631`), SHA-pinned like Vale (`bkit-ci.yml:441-447`). CI edits need human confirmation. → Christian.
  - **Options:** A — install (VERSION + SHA256 env, renovate comment, `curl --retry`, `sha256sum -c -`) for `getsops/sops` and `FiloSottile/age` linux-amd64 · B — fake `sops` stub (mocks the boundary under test; rejected by `docs/testing.md`)
  - **Recommended:** A — `docs/testing.md:143`: a self-skipping suite must not skip on CI.
  - **Default if unanswered:** A, but Task 1's CI step waits for the confirmation box. Refused → Task 1 stops and the plan is updated: EB's `hasTool` throws on CI, so the integration lane would fail.
- **Open Question Q7 — `.agents/rules.md` § Secrets carve-out.** `.bkit/core/.agents/rules.md:93` "NEVER stage `.env*`" covers `.env.enc`; the hook stages them. Shipped rule. → Christian.
  - **Options:** A — amend: SOPS-encrypted `*.enc` copies are the exception; shipped doctrine change reaches every consumer on `bkit upgrade` · B — leave; agents may never stage an `.enc` by hand and reviewers read the hook's staging as a rule breach
  - **Recommended:** A — rule and template agree.
  - **Default if unanswered:** A, applied only after the confirmation box.
- **Open Question Q8 — setup tip `env-backup`** in `.bkit/core/engine/checks/tips/catalogue.ts`. → human decides.
  - **Options:** A — add (fires on `.bkit/.env` present, `scripts/env-backup` absent, not cloud / CI); shown to nearly every consumer (`.bkit/.env` is standard), each needs `sops` + `age` to adopt · B — templates.md section only; nothing prompts adoption
  - **Recommended:** A — adoptable templates are surfaced through setup tips (e.g. `secrets-sync`, `catalogue.ts:262-271`); without one the template is found only by reading templates.md.
  - **Default if unanswered:** A
- **Open Question Q9 — bkit's own age key.** → Christian.
  - **Options:** A — Christian runs `age-keygen`, stores the private key in his password manager, supplies the public key (`age1…`); the build waits for it at Gate 1 · B — the agent generates it (agents must not handle secrets)
  - **Recommended:** A
  - **Default if unanswered:** Gate 1 waits (Pre-Flight `User Context`): Task 2 fills the root `.sops.yaml` in the same task as the template, since `dogfood-templates.test.ts:685` requires an entry per template file.
- **Open Question Q10 — `tmp/**` in the template default skip list.** bkit's root `.gitignore:34` ignores `tmp/**`, so an agent's scratch `.env` copy under `tmp/` would stop every commit (its `.enc` is ignored). → human decides.
  - **Options:** A — template default; env files under any consumer's `tmp/` are never backed up · B — bkit's own config only (root config then needs a dogfood `adapt` edit instead of `identical`)
  - **Recommended:** A — `tmp/` scratch is common in consumers too; keeps root config identical.
  - **Default if unanswered:** A
- **Open Question Q11 — public-repo exposure.** Committing `.bkit/.env.enc` to the public repo publishes key names, value lengths (ciphertext length) and, per A1, possibly comments. A leaked private key exposes every value in history → rotate every value. → Christian.
  - **Options:** A — accept (issue design); key names and value lengths are public for good, a leaked private key exposes every value in history · B — bkit does not adopt on `.bkit/.env` (contradicts SC6)
  - **Recommended:** A — names are already public via `.env.example` and docs; values stay encrypted.
  - **Default if unanswered:** A (A3).
- **Open Question Q12 — incoming `.enc` changes.** `encrypt` treats the plain file as truth: another key holder's change (`git pull`, clean `git merge`, owner's second machine) lands in the `.enc` while the local plain file keeps the old value, so the next ordinary commit writes the old value back and stages it — the change is rolled back in git with no warning; `restore` never surfaces it (`wx` keeps the present plain file). → human decides.
  - **Options:** A — stop: decrypted map ≠ plain map and the author time of the last commit touching the `.enc` (`git log -1 --format=%at -- {enc}`; survives rebase / cherry-pick) is later than the plain file's mtime → exit 1 naming file + commit, nothing written, both fixes printed (keep theirs: delete the plain file, run `restore`; keep yours: `touch` it, commit again); misses a change whose author clock ran behind; same reach as Q4-A (blocks main-checkout commits on that machine until resolved) · B — warn and skip that file under the same rule; commits flow, the incoming value stays in git, the local plain file stays stale while the warning repeats · C — plain file stays truth; docs state one writer per env file and that other holders delete + `restore` after each pull; the silent rollback remains
  - **Recommended:** A — a silent rollback of another holder's change is data loss in the backup; the stop names two one-command fixes and needs no state file.
  - **Default if unanswered:** A; rows 42-43 assert A — B or C → plan update rewrites rows 42-43 and the Edge Cases row before Task 3.

**Assumptions** (no options by design; consequence if wrong)

- **Assumption A1:** SOPS facts not in the issue's test table — `set --value-stdin` JSON input, decrypt-without-key exit 128, minimum version with `unset` + `--value-stdin`, `updatekeys --yes` / `rotate` flags on dotenv, `--output`, key-probe round-trip of a fixed line from a temp dir outside the repo under `--config` (creation-rule match), dotenv parse / emit of CRLF, quotes, `\n`, comments, `sops --version` network check — hold as Task 1's characterisation tests (row 1) pin them → wrong fact changes the script's call shape, not the design; Task 1 fixes it before Task 2.
- **Assumption A2:** restore rebuilds keys + values (+ comments if SOPS keeps them, A1) in SOPS's order as of the first encrypt, not a byte-identical file; restore's contract = parsed key→value map (raw text after the first `=`) equal to the plain file's (row 19, Manual Step 4) → a user expecting identical bytes sees reordered lines; docs state it.
- **Assumption A3:** Q11 exposure accepted → if not, bkit's adoption drops `.bkit/.env` and SC6 needs a human rewrite.
- **Assumption A4:** Trivy secret scan and GitHub push protection do not flag SOPS ciphertext or an age public key → if they do, CI or push fails on adoption; fix = scanner allowlist entry, human-confirmed.
- **Assumption A5:** SC6 is met at merge by the template copy + config + hooks; `.bkit/.env.enc` follows from the owner's first main-checkout commit with the key (the build agent never touches the private key or plain env files) → if SC6 needs the `.enc` itself at merge, the build cannot meet it and SC6 needs an owner step before merge.
- **Assumption A6:** Christian supplies the public key (Q9) before Gate 1; Task 2 consumes it → else Gate 1 does not pass.
- **Assumption A7:** copy-and-own consumers keep their old `bkit-secrets.mjs` until they re-copy → if an install or upgrade path rewrote their copy, a CI step passing `--allow-missing` would break unannounced and a migration (`docs/migrations.md`) would be required.
- **Assumption A8:** one decrypt per tracked `.enc` per commit keeps the hook within a few seconds (pre-commit header rule: nothing over a few seconds) → if not, the build adds an `Out of Scope` row + `docs/deferrals.jsonl` mirror (`.bkit/jsonl.md`) for a per-commit decrypt cache keyed by plain-file mtime and names it in the handback.
- **Assumption A9:** the pathspec index behaviour reproduces (row 22 red first) → if not, Task 6 stops and the plan is updated: post-commit and `restage` dropped, row 22 rewritten, a decision row superseding `651-env-backup-post-commit-restage`, Q1 back to Christian.
- **Assumption A10:** `git ls-files --others --ignored --exclude-standard --directory` collapses only folders that are themselves ignored → if it also collapses an untracked folder whose only content is an ignored `.env`, discovery re-lists each collapsed folder that `git check-ignore -q` does not match (row 3 pins it).

Advisory only; not auto-triggered. `CONCERNS` route: revise with `/bkit-plan` (chosen), or build now with `/bkit-build` and carry the caveat that Gate 1 stays blocked until the Narrative and the Q9 key exist.

```text
/bkit-plan #651
Brief: Revise docs/plans/202610/logs/651-sops-env-backup/plan-v3-checked.md before build: human writes the Narrative; resolve SC6 vs the root .sops.yaml key line; reconcile the wording.md failure row with Task 9; confirm rekey scope; confirm Q6, Q7, Q9. Gate 1 waits on the Narrative and the Q9 key.
```
