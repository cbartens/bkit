# Stale Consumer Setup — D1 Orphan-Removal Baseline

> **WS2-T5 artifact.** Consumed by WS4-T4 (Sub-Plan 3) to assert that the D1 orphan-removal
> upgrade pass actively removes `.agents/templates/` from a pre-move consumer.

## Purpose

This document specifies the exact construction steps for a **stale consumer** — one that has
`.agents/templates/` present on disk from a pre-move release (bkit ≤ 2.8.4, the WS-1-state
tarball captured in WS2-T1).

The stale consumer is the _input_ to the WS4-T4 upgrade assertion. After running `bkit upgrade`
against the post-move tarball, the WS4-T4 test asserts that `.agents/templates/` is GONE.

## Construction Steps (deterministic, reproducible)

These steps produce a consumer directory with `.agents/templates/` present, matching the
pre-move state captured in this baseline session.

1. **Install the WS-1-state tarball** (the pre-move packed tarball from WS2-T1, at
   `tmp/cbartens-bkit-2.8.4.tgz` relative to the repo root):

   ```sh
   mkdir -p tmp/ws2-stale-consumer
   cd tmp/ws2-stale-consumer
   echo '{"name":"stale-consumer","version":"1.0.0","packageManager":"pnpm@10.4.1"}' > package.json
   echo "22" > .nvmrc
   git init
   pnpm add /path/to/cbartens-bkit-2.8.4.tgz
   node_modules/.bin/bkit install
   ```

2. **Verify `.agents/templates/` is present** (it will be — the pre-move tarball ships
   `.agents/templates/**` and the payload pass mirrors it to the consumer):

   ```sh
   ls .agents/templates/
   ```

   Expected: directory exists and contains the full template tree.

3. **Record the pre-upgrade state** for comparison:

   ```sh
   find .agents -type f | sort > /tmp/stale-agents-tree-before.txt
   ```

## Expected Pre-Upgrade State

- `.agents/templates/` directory EXISTS (this is the orphan D1 targets for removal)
- `.agents/.bkit-version` contains `pinnedVersion: "2.8.4"` (or earlier pre-move version)
- Full install output is present: `.claude/`, `.cursor/`, `.github/`, etc.

## WS4-T4 Assertion Contract

After running `bkit upgrade` against the **post-move** tarball (Sub-Plan 2 output):

1. Run upgrade: `node_modules/.bin/bkit upgrade` (using updated tarball)
2. Assert `.agents/templates/` does NOT exist:
   ```sh
   test ! -d .agents/templates && echo "PASS: orphan removed" || echo "FAIL: orphan still present"
   ```
3. Assert the recursive `.agents/` tree matches `baseline/agents-tree.txt` (minus `.agents/templates/`
   which the post-move consumer never has).

## Why This Works

The pre-move tarball ships `.agents/templates/` as part of the payload. The `runPayload()` function
mirrors `<pkgRoot>/.agents/templates/` → `<cwd>/.agents/templates/` when `src !== dst` (non-dogfood).

After the move (Sub-Plan 2), `<pkgRoot>/.agents/templates/` no longer exists. The D1 upgrade
auto-clean (WS3-T5) actively removes the orphaned `.agents/templates/` directory from any consumer
that has it from a pre-move install.
