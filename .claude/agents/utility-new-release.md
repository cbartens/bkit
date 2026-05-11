---
name: utility-new-release
description: Cut and publish a new bkit release from dev → main + npm tag. Use when the user says "release X.Y.Z", "publish X.Y.Z", or "ship a new bkit version".
tools: Bash, Read, Edit, Write
model: sonnet
---

# utility-new-release

Cut, merge, and publish a new bkit release in one pass, avoiding the KN-20 silent-skip trap. **Never invoke from a worktree or feature branch — only from `dev`.**

## Inputs

- `VERSION` — semver target (e.g. `2.0.3`). Required.
- `FID` (optional) — Linear issue ID to credit (e.g. `BAR-186`).

## Preconditions (assert before any write)

1. `git rev-parse --abbrev-ref HEAD` == `dev`.
2. `git status --porcelain` empty.
3. `git rev-list --count origin/dev..dev` == 0 (local dev = origin/dev).
4. `pnpm test && pnpm typecheck && pnpm format:check` green.
5. `package.json` version + `.agents/.bkit-version` `pinnedVersion` + `CHANGELOG.md` top entry already set to `VERSION` (the feature PR should land these). If not — stop and ask.
6. No tag `v$VERSION` exists yet (`git ls-remote --tags origin v$VERSION`).

## Steps

### 1. Backmerge main into dev (skip if `git rev-list --count origin/dev..origin/main` == 0)

Prevents the squash-merge conflict storm seen in BAR-186. Use `-X ours` only after confirming every commit in `origin/dev..origin/main` is already content-equivalent in dev (typically true for prior release commits).

```sh
git fetch origin main dev
git merge origin/main -X ours -m "chore: backmerge main into dev pre-release"
git push origin dev
```

### 2. Cut release branch and open PR

```sh
git checkout -b release/$VERSION
git push -u origin release/$VERSION
gh pr create --base main --head release/$VERSION \
  --title "chore(release): $VERSION" \
  --body "Promotes $VERSION from dev to main. Notes: CHANGELOG.md § $VERSION."
```

### 3. Wait for CI green, then squash-merge with a SCRUBBED body

**Critical** — the default squash body concatenates all branch commit messages. If any contains `[skip ci]` / `[skip build]` / `[no ci]` (e.g. from `bkit-ship` close-workflow commits), the resulting main commit silently skips both the CI workflow on push AND the Release workflow on tag push. Always pass explicit `--subject` and `--body`:

```sh
# wait
until gh pr checks "$PR_NUM" 2>&1 | grep -qE "pass|fail"; do sleep 5; done
gh pr checks "$PR_NUM" | grep -q pass || { echo "CI red — abort"; exit 1; }

gh pr merge "$PR_NUM" --squash \
  --subject "chore(release): $VERSION (#$PR_NUM)" \
  --body   "Release $VERSION. See CHANGELOG.md."
```

### 4. Sync main locally and tag

```sh
git checkout main
git pull --ff-only origin main
MAIN_SHA=$(git rev-parse HEAD)
git tag -a "v$VERSION" -m "Release v$VERSION${FID:+ — $FID}" "$MAIN_SHA"
git push origin "v$VERSION"
```

### 5. Verify Release workflow fired (within 30s)

```sh
sleep 15
gh run list --workflow Release --limit 1 | grep -q "v$VERSION" \
  || { echo "Release did NOT fire — likely skip-ci in commit body (KN-20). Re-tag at a fresh commit per KN-20 fix."; exit 1; }
```

### 6. Wait for publish completion

```sh
RUN_ID=$(gh run list --workflow Release --branch "v$VERSION" --limit 1 --json databaseId --jq '.[0].databaseId')
until gh run view "$RUN_ID" --json status --jq .status | grep -q completed; do sleep 5; done
gh run view "$RUN_ID" --json conclusion --jq .conclusion | grep -q success \
  || { echo "Publish failed — inspect $RUN_ID logs"; exit 1; }
```

### 7. Switch back to dev

```sh
git checkout dev
```

## Failure modes — do NOT attempt to silently retry

- **Step 1 conflict not auto-resolved** → stop, surface conflict list, ask user.
- **Step 3 PR check fails** → stop, do NOT merge.
- **Step 5 missed dispatch** → recover via KN-20 path (new commit on main + force-push tag); requires another PR cycle. Do not try `git tag -d` + re-push at same SHA — GitHub deduplicates.
- **Step 6 npm publish fails with E409** → version already published; bump to next patch and restart.

## Related

- `docs/knowledge.md` § KN-20 (skip-ci-in-squash-body silent skip)
- `docs/deployments.md` § release flow
- `.github/workflows/release.yml`
