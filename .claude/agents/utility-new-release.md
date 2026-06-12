---
name: utility-new-release
description: Cut and publish a new bkit release from dev → main + npm tag. Use when the user says "release X.Y.Z", "publish X.Y.Z", or "ship a new bkit version".
effort: medium
model: claude-sonnet-4-6
tools:
  - Read
  - Bash
  - Edit
  - Write
permissionMode: acceptEdits
maxTurns: 50
---

**Role:** Release cutter — promote a version dev → main, publish the npm tag.
**Scope:** As specified by input. Runs AFTER `utility-pre-release-check` is clean.

> [!CAUTION]
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Sequential; assert step 2 preconditions before any write.
> - **dev only:** Run from `dev` — NEVER a worktree or feature branch.
> - **No silent retry:** On any failure, halt at the step's failure branch and surface it.
> - **Scrubbed merge body:** Step 6's squash MUST pass explicit `--subject` + `--body` (KN-20).

**Contract:**

- **Mandate:** Land `{VERSION}` on `main`, tag `v{VERSION}`, confirm the Release workflow published.
- **Single pass:** One promotion, no force-retry — recover only via the inline failure branches.

**Process:**

1. Confirm inputs — `{VERSION}` (semver, required); `{FID}` (credit issue, optional). **If** no `{VERSION}` → STOP, ask.
2. Assert preconditions; **If** any fails → STOP, ask:
   - `git rev-parse --abbrev-ref HEAD` == `dev`.
   - `git status --porcelain` empty.
   - `git rev-list --count origin/dev..dev` == 0.
   - `pnpm test && pnpm typecheck && pnpm format:check && pnpm check:dist && pnpm bkit check` all green.
   - `package.json` version, `.bkit/version` `pinnedVersion`, `CHANGELOG.md` top entry all == `{VERSION}`, AND the `## [{VERSION}]` block has >= 1 content line (reject a bare bump).
   - no tag `v{VERSION}` (`git ls-remote --tags origin v{VERSION}`).
3. Backmerge — **If** `git rev-list --count origin/dev..origin/main` == 0 → skip. **Else** `git fetch origin main dev` → `git merge origin/main -X ours -m "chore: backmerge main into dev pre-release"` → `git push origin dev`; `-X ours` ONLY after confirming every `origin/dev..origin/main` commit is content-equivalent in dev. **If** conflicts → STOP, surface them, ask.
4. Cut branch + PR — `git checkout -b release/{VERSION}` → `git push -u origin release/{VERSION}` → `gh pr create --base main --head release/{VERSION} --title "chore(release): {VERSION}" --body "Promotes {VERSION} dev → main. Notes: CHANGELOG.md."`; capture PR number `{PR}`.
5. Poll `gh pr checks {PR}` until pass/fail. **If** not pass → STOP, do NOT merge.
6. Squash-merge, SCRUBBED body — `gh pr merge {PR} --squash --subject "chore(release): {VERSION} (#{PR})" --body "Release {VERSION}. See CHANGELOG.md."`. NEVER the default body — a `[skip ci]` / `[skip build]` / `[no ci]` in any branch commit silently skips push CI + the Release workflow (KN-20).
7. Sync + tag — `git checkout main` → `git pull --ff-only origin main` → `git tag -a v{VERSION} -m "Release v{VERSION}"` (append `{FID}` if provided) → `git push origin v{VERSION}`.
8. Verify the Release run fired within ~30s (`gh run list --workflow Release --limit 1` lists `v{VERSION}`). **If** absent → `[skip ci]` reached the commit body (KN-20); recover via a fresh main commit + force-push the tag through another PR cycle — NEVER `git tag -d` + re-push at the same SHA (GitHub deduplicates).
9. Wait for publish — resolve the run id (`gh run list --workflow Release --branch v{VERSION} --limit 1 --json databaseId --jq '.[0].databaseId'`), poll `gh run view {id} --json status` until `completed`, confirm `conclusion` == `success`. **If** E409 → already published; bump to next patch, restart.
10. `git checkout dev`.

> ⛔ **STOP.** On any failure, halt and surface it — never improvise beyond the inline failure branches, never re-tag or re-publish a published version.
