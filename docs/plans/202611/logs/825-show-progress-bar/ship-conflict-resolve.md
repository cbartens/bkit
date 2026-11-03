Verdict: PASS

<!-- verdict:end -->

# Ship Conflict

## Resolution Log
STEP 5 — HEAD 620e929eb, MERGE_HEAD 71951f29 present
STEP 6 — resolver rc=24 HAND_RESOLVE
STEP 8 — sources: identical hunk in 6 workflows; kept HEAD Narrate (progressLine) + dev Failures/Sandbox recovery/Recovery scope
STEP 8 — mirrors: took dev, ran upgrade, vitest -u snapshots, git add
STEP 6-8 — merge committed by resolver (outcome: merged); gate pnpm bkit:gate:install-static-unit-build exit 0

## Account
- Six workflow sources (.bkit/core/workflows/bkit-{auto,build,debug,design,plan,ship}.md): same hunk in each. Kept this branch's Narrate bullet (progressLine) and dev's Failures, Sandbox recovery and Recovery scope bullets.
- Mirrors (.agents/skills, .agents/plugins/bkit/skills, .claude/.cursor/.opencode commands): took dev's copy, regenerated with `pnpm tsx .bkit/core/engine/cli.ts upgrade`, git add.
- Snapshots (render/__snapshots__/bkit-*.none.txt): regenerated with `pnpm vitest run .bkit/core/engine/render -u`, git add.
