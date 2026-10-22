Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

Inputs read: `plan-v1-draft.md` (830 lines, full), `plan-input-1.md`, `related-issues.md` (`None.`), `related-deferrals.md`, `related-failures.md` (TRUNCATED by its writer: 1 of 4 lines kept; the dropped 3 rows are unread, not clean). Template `docs/templates/bkit-plan.md`: all mandated sections present, in order; `Conditional` drops `Schema State` / `Notifications` (allowed: "drop inapplicable"). Design artifact: none (`docs/plans/202610/651-sops-env-backup*` → no match; issue label `next:plan`, design skipped) → design-coverage check n/a; issue § Decisions, § Success criteria, § Constraints and non-goals, § Docs all map to tasks or `Out of Scope`.

## CRITICAL

1. **When the age public key is needed: the plan gives two different tasks.** `Pre-Flight / Core → User Context` says "Needs from Christian before Task 7: age public key (Q9)". But Q9 default ("Task 2 blocks at the root `.sops.yaml` public-key fill"), A6 ("before Task 2"), the runbook `Build-agent constraints` ("Task 2's root `.sops.yaml` key fill waits for Q9 / A6") and Task 2 itself (`grep -c "{{AGE_PUBLIC_KEY}}" .sops.yaml` = 0) all need it at Task 2. Pre-Flight is the checklist the build agent ticks before Gate 1, so it would start without the key and stall at Task 2. Fix: pick one point and make all five places say the same. Better option: move the root `.sops.yaml` fill + its dogfood entry to Task 7 (bkit's adoption task). Tasks 2-6 test in temp repos with their own temp keys and never need bkit's real key. Pre-Flight "before Task 7" is then true and the build does not block mid-run.
2. **Task 2's `Done when` names matrix rows whose code is only built in Task 3.** Task 2 says "`encrypt` plans only". But:
   - Row 5 requires "no `.enc` created or changed (first-encrypt probe file deleted)". Architecture `Key probe` says that with no `.enc` yet, the probe _is_ the first create (`sops encrypt --output <P.enc.tmp-PID>` → verify → delete on exit 128). The create path is Task 3 (`Encrypt — new .enc`).
   - Row 18 ("`encrypt --dry-run` → names files that would change") needs `would update` for an existing `.enc`. Knowing that needs Task 3's decrypt + per-key diff; Task 2's test-first only asserts `would create`.

   As written, Task 2 cannot reach `Done when` without pulling Task 3 code forward, which breaks `Step Isolation`. Fix: either reassign row 5's first-encrypt sub-case and row 18's `would update` half to Task 3 (split the rows), or state that Task 2 builds the create-and-verify probe and the dry-run diff.

3. **SC1's proof row does not say what "restored" means, and the plan contradicts itself on it.**
   - Row 19 asserts "every tracked `.env.enc` / `.env.*.enc` restored, mode 0600" but names no ground-truth signal. By the matrix's own `Discrimination (no false-green)` rule, a test that only checks the file exists would pass.
   - A2 says restore rebuilds keys + values in SOPS order, "not a byte-identical file".
   - `Manual Verification → Step 4` checks restore with `cmp -s .bkit/.env <temp>/.bkit/.env && echo same`, which is a byte-identical check. A2 predicts it fails on any file whose line order or comments SOPS changes.
   - `Concrete Example → Outcome` says "same keys and values".

   Fix: define restore's contract once, as key/value map equality with the original plain file (raw text after the first `=`), per A2. Make row 19 assert it, e.g. "parsed key→value map of each restored file equals the original's; mode 0600". Replace Manual Step 4's `cmp` with a check that compares the maps without printing them.

## OPTIONAL

- **Narrative is MISSING (blocks Gate 1).** It is marked correctly per Spec: the issue has no `Narrative` field, only `Outcome`. The plan's suggested sentence is clearly fenced off as not adopted. Human action, not a plan defect.
- **Open Questions shape: some options lack the template's "option, trade-off" part.** Missing trade-off text: Q3 A and B; Q4 A and B (the trade-off sits in `Recommended` only); Q5 B; Q7 A; Q8 A and B; Q9 A; Q10 A; Q11 A.
- **Assumptions shape: two lack "what breaks if wrong".** A5 explains what the assumption means rather than what breaks. A7 ("release note only, no migration") states a consequence, not a failure mode.
- **An Edge Cases row is mislabelled as issue-decided.** The `Edge Cases` preamble says issue-decided rows come first. The skip-list row in that block adds `tmp/**` "per Q10", which is plan-added: the issue's decided defaults are `.vercel/**`, `supabase/.temp/**`, `.worktrees/**`, `.claude/worktrees/**`, `node_modules/**`. Split the row, or mark `tmp/**` as plan-added pending Q10.
- **A crash can leave a temp file that discovery then backs up.** The new-`.enc` temp file `P.enc.tmp-PID` (e.g. `.env.preview.enc.tmp-4242`) matches the discovery basename regex `^\.env(\..+)?$` and does not end in `.enc`. It is gitignored by `.env.*`, so it is a candidate. A crash or SIGKILL between `sops encrypt --output` and `rename` leaves it behind. Every later commit would then encrypt ciphertext (`KEY=ENC[...]` lines pass validation) into `.env.preview.enc.tmp-4242.enc`. Fix: exclude `*.enc.tmp-*` in discovery, or pick a temp name that does not match `.env*`. Add an Edge Cases / matrix row.
- **Git's hook environment variables are not addressed.** Engine git spawns scrub `GIT_DIR` / `GIT_WORK_TREE` / `GIT_INDEX_FILE` / `GIT_OBJECT_DIRECTORY` through `gitEnv()` (`.bkit/core/engine/ledgers/telemetry.ts:62-69`; earlier bug `audit-duplication-git-spawn-without-git-env` in `docs/failures.jsonl`). This plan needs opposite handling in two places:
  - The script must _keep_ the inherited `GIT_INDEX_FILE`. In a `git commit -- paths` run, that is how its `git add` reaches the temporary index (Q1).
  - EB tests run inside bkit's own `.husky/pre-push` (integration tier) and must _scrub_ hook vars when spawning `git` in temp repos, or they operate on bkit's real repo/index.

  Add a Reuse Inventory row for `gitEnv` (pattern copy for tests; deliberately not used in the script) and a line in the Architecture `Safety` bullet.

- **Row 33 should not depend on `sops` being installed.** It needs only `git`, but lives in EB under `describe.skipIf(!hasTool("sops") || !hasTool("age-keygen"))`. Put it in a describe without the sops gate, so bkit's `.gitignore` check runs on machines without sops.
- **Row 30 is not quite "unchanged" today.** In current `check()` (`bkit-secrets.mjs:740-746`), a `check <file>` naming a missing file only counts as a problem inside `if (example)`. With no example file, today it exits 0. Say whether `compareExample` keeps that gap or makes exit 2 hold with no example too, and add that case to row 30.
- **Concrete Example step 3 assumes an unstated config.** The `check` warning for `apps/web/.env.preview` only fires if that file is a configured `sources.preview` / `production` in `scripts/secrets/bkit-secrets.config.mjs` (issue: "configured sources only"). Add that to `Setup`. Same wording slip in Process Sketch line 4: "an env file" should be "a configured source env file".
- **Setup tip wording must match two other places, in one commit.** `catalogue.ts:15-17` says a template's benefit reads the same in the tip, its `.bkit/templates.md` section opener and its README row, changed "in the same commit". Task 9 (tip) and Task 11 (section opener) are separate tasks with commit-per-task advice. Either merge the opener edit into Task 9, or have Task 11's `Done when` check the tip `why` against the section opener. Also say the tip's `ask` names the whole adoption set: `scripts/env-backup/`, `.sops.yaml` fill, pre-commit block, `.husky/post-commit`, `.gitignore` lines. The `husky` tip `ask` (`catalogue.ts:177`) copies only `pre-commit` and `pre-push`.
- **`.husky/post-commit` guard does not match pre-commit.** The pre-commit block is guarded by `[ -f scripts/env-backup/bkit-env-backup.mjs ]`. The post-commit template uses `restage … || echo WARN`, so a consumer who removes the script but keeps the hook gets a warning on every commit. Use the same `[ -f ]` guard. This also makes the Rollback claim ("reverting the script disables both hooks") true for consumers.
- **The A9 fallback in Task 6 rewrites a test mid-build.** If row 22 does not reproduce, the plan rewrites row 22's meaning and drops `restage` / post-commit. That conflicts with Gate 2 "tests unchanged since except added tests". It would also leave decision row `651-env-backup-post-commit-restage` and Q1 (human-decided) stale. Route the fallback through a plan update with a superseding decision row, not only a `docs/knowledge.jsonl` note.
- **No step owns the ledger appends.** `Decision Ledger Rows` (3) and the `Out of Scope` deferral rows (4) say "Append via…". `grep '"key":\s*"651'` over `docs/*.jsonl` → 0 matches, corroborated by a positive hit on `489-templates-carry-no-bkit-blocks`. They are not appended yet. Gate 3 says "appended at plan time — see handback note if pending", and Task 11 covers them only through "every row in `Documentation Updates`". Name one owner (plan step or Task 11) so they are not dropped.
- **A8 deferral has no `Out of Scope` row.** A8 / `Future phase` defer a per-commit decrypt cache "if A8 fails", with no row and no `docs/deferrals.jsonl` mirror. Either add a conditional row or say the build files one if A8 fails.
- **Alternative not recorded for key rotation.** The issue § Docs asks to document "key rotation"; the plan builds a `rekey` verb (Task 5, row 20). A docs-only procedure (`sops updatekeys --yes` + `sops rotate` per file with the dotenv flags, then `git add`) is not listed in `Alternative Approaches`. Add the row with why a verb wins (dotenv flags per file, verify map, staging), so the expansion is visibly justified.
- **Minor citation.** `local-gate-audit.test.ts:103` is cited without its path (`.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`).

## OUT OF SCOPE

- Commits that only rebase or cherry-pick (sequencer) also fire `post-commit`. `restage`'s stateless rule probably holds there, but no row pins it. Candidate for a later hardening issue, not this plan.
- Hand-made `.env.*.backup` files (issue § Problem) match `.env.*` and would get their own `.enc` copies. The issue's "every name" decision covers it; a docs note on deleting them after adoption could follow.

## SUGGESTED SCOPE EXPANSION

- `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` (`docs/deferrals.jsonl`, OPEN, via `related-deferrals.md`): on Codex, agent reads of `.env*` files (now including `.env*.enc` and restored plaintext) have no read gate. Overlaps the plan's guardrails candidate (`guardrails-tiers.js:192`) → keep deferred (hard-blocked on an unverified Codex tool name).
- `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there` (`docs/deferrals.jsonl`, OPEN, via `related-deferrals.md`): only touches the guardrails surface, nothing this plan changes → keep deferred.
- `related-failures.md`: unavailable. Truncated to 1 of 4 rows; the visible row (`audit-security-operator-gh-pat-classic-no-expiry-overscoped`) is CLOSED, and the dropped 3 rows were not read. Not reported as clean.
- `related-issues.md`: `None.`
