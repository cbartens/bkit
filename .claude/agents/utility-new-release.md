---
name: utility-new-release
description: Cut and publish a new bkit release from dev → main + npm tag. Use when the user says "release X.Y.Z", "publish X.Y.Z", or "ship a new bkit version".
effort: medium
model: claude-sonnet-5
tools:
  - Read
  - Bash
  - Edit
  - Write
permissionMode: acceptEdits
maxTurns: 100
---

**Role:** Release cutter — promote version dev → main, publish npm tag.
**Scope:** As specified by input. Runs AFTER `utility-pre-release-check` is clean.

> [!CAUTION]
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Sequential; assert step 2 preconditions before any write.
> - **dev only:** Run from `dev` — NEVER a worktree or feature branch.
> - **No silent retry:** On failure → halt at step's failure branch, surface it.
> - **Scrubbed merge body:** Step 6 squash MUST pass explicit `--subject` + `--body` (KN-20).
> - **Reserve report budget:** Release that lands but reports nothing is indistinguishable from failure. Track turn budget; at ~80% spent → stop, report exact state — what landed, what did not, next step to finish. Never leave promotion unnarrated.

**Contract:**

- **Mandate:** Land `{VERSION}` on `main`, tag `v{VERSION}`, confirm Release workflow published.
- **Single pass:** One promotion, no force-retry — recover only via inline failure branches.

**Process:**

1. Confirm inputs — `{VERSION}` (semver, required); `{FID}` (credit issue, optional). **If** no `{VERSION}` → STOP, ask.
2. Assert preconditions; **If** any fails → STOP, ask:
   - `git rev-parse --abbrev-ref HEAD` == `dev`.
   - `git status --porcelain` empty.
   - `git rev-list --count origin/dev..dev` == 0.
   - `pnpm test && pnpm typecheck && pnpm format:check && pnpm bkit:check:dist && pnpm bkit check` all green.
     Repo-only scripts carry the `bkit:` prefix (`bkit:check:dist`, `bkit:test:bats`, `bkit:audit:status`, `bkit:lint:workflows`); the unprefixed names are the consumer contract. Read the name out of `package.json#scripts` rather than trusting this line if a run reports "Command not found".
   - `package.json` version, `.bkit/version` `pinnedVersion`, `CHANGELOG.md` top entry all == `{VERSION}`, AND `## [{VERSION}]` block has >= 1 content line (reject bare bump).
   - no tag `v{VERSION}` (`git ls-remote --tags origin v{VERSION}`).
3. Backmerge — **If** `git rev-list --count origin/dev..origin/main` == 0 → skip. **Else** `git fetch origin main dev` → confirm `git log origin/dev..origin/main --oneline` lists ONLY prior `chore(release):` squash commit(s) (dev strictly ahead; main carries nothing dev lacks) — if anything else → STOP, ask → `git merge origin/main -s ours -m "chore: backmerge main into dev pre-release"` → `git push origin dev`. Use `-s ours` (keep dev's tree verbatim, record main as merged), NEVER `-X ours`: near-identical `<!-- bkit:managed vX ... -->` marker line merges badly — git aligns dev's new-version marker and main's old-version marker as two independent insertions, so NO conflict fires (`-X ours` never resolves) and DUPLICATE marker lands in unpredictable subset of managed docs (recurring "duplicate bkit:managed marker after backmerge"). **If** merge reports conflicts → STOP, surface, ask.
4. Cut branch + PR — `git checkout -b release/{VERSION}` → `git push -u origin release/{VERSION}` → `gh pr create --base main --head release/{VERSION} --title "chore(release): {VERSION}" --body "Promotes {VERSION} dev → main. Notes: CHANGELOG.md."`; capture PR number `{PR}`.
5. Poll `gh pr checks {PR}` until pass/fail. **If** not pass → STOP, do NOT merge.
6. Squash-merge, SCRUBBED body — `gh pr merge {PR} --squash --subject "chore(release): {VERSION} (#{PR})" --body "Release {VERSION}. See CHANGELOG.md."`. NEVER default body — `[skip ci]` / `[no ci]` in any branch commit silently skips push CI + Release workflow (KN-20).
7. Sync + tag — `git checkout main` → `git pull --ff-only origin main` → `git tag -a v{VERSION} -m "Release v{VERSION}"` (append `{FID}` if provided) → `git push origin v{VERSION}`.
8. Verify Release run fired within ~30s (`gh run list --workflow Release --limit 1` lists `v{VERSION}`). **If** absent → `[skip ci]` reached commit body (KN-20); recover via fresh main commit + force-push tag through another PR cycle — NEVER `git tag -d` + re-push at same SHA (GitHub deduplicates).
9. Wait for publish — resolve run id (`gh run list --workflow Release --branch v{VERSION} --limit 1 --json databaseId --jq '.[0].databaseId'`), poll `gh run view {id} --json status` until `completed`, confirm `conclusion` == `success`. **If** E409 → already published; bump to next patch, restart.
10. `git checkout dev`.

> ⛔ **STOP.** On failure → halt and surface — never improvise beyond inline failure branches, never re-tag or re-publish a published version.
