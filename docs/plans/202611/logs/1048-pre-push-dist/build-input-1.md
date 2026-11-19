## Session Prompt — this run's, newer than everything below

#1048 publish=false

## Issue description — oldest

### What happened

`.husky/pre-push` (bkit repo only block) runs `pnpm bkit:check:dist` on every push except a min push. Since "Build the pre-commit dist freshness check from the staged tree" (https://github.com/cbartens/bkit/issues/819), that check compiles the staged tree (the index) and compares it with the staged `dist/`.

At push time the thing that matters is the commits being pushed, not the index. The two differ whenever something is staged but not committed:

- Commit A has a stale `dist/`. The fix for it is staged but not committed. The check reads the index, passes, and the push sends commit A with its stale `dist/`.
- Commit A is correct. An unrelated half-finished engine edit is staged. The check fails and blocks a correct push.

### What should happen

The pre-push check judges the commit being pushed.

### How bad

Low. CI's `bkit-tests-static` step "Assert Dist Freshness" runs `pnpm bkit:check:dist` on a clean checkout, where the index equals the commit, so a stale `dist/` is still caught after the push. The release gate (`.github/workflows/release.yml`, "Verify dist/ is fresh") runs on a clean checkout too.

### Possible fix

`scripts/gate/bkit-check-dist.mjs` takes an optional tree to read (`--ref=<commit>`), and the pre-push hook passes the pushed commit it already resolves (`PUSH_DEV_SHA`). With no `--ref` it reads the index, as the pre-commit hook needs.

### Removes

Nothing. One check gains one option.
