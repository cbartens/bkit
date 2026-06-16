Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing

Three regression-test describe blocks were added to
`.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` (18 new `it` assertions on top of 25 existing),
all targeting the two remediation fixes (FIX A and FIX B) applied after the build challenge.

## Assertions added

### describe 7 — No post-gate verdict-commit push (KN-11 regression guard — FIX B lock-in)

Uses `extractPostVerdictSlices()`, a new helper that extracts the text slice from
`# ciDispatch verdict is ALWAYS written` down to the nearest
`case "$CI_OUTCOME" in unresolved)` closing line for each gate site. Assertions:

- `bkit-build.md`: post-verdict slice present (vacuous-match guard, >= 1 site).
- `bkit-debug.md`: post-verdict slices present (vacuous-match guard, >= 2 sites).
- `bkit-build.md`: no `git push` in the post-verdict slice.
- `bkit-debug.md`: no `git push` in any post-verdict slice (both PR-mode + LOCAL-mode).
- `bkit-build.md`: no `ci-dispatch-verdict` commit message token after the ciDispatch jq write.
- `bkit-debug.md`: no `ci-dispatch-verdict` commit message token at either gate site.

These 6 assertions fail immediately if someone adds the harmful post-gate commit+push. The
self-heal re-trigger push (which is the only legitimate post-kernel push) happens inside the
self-heal branch BEFORE the verdict write, so it is outside the extracted slice and does not
produce a false positive.

### describe 8 — Intentional-non-push NOTE present (FIX B documentation lock-in)

Asserts that each of the three gate jq-write sites carries the NOTE comment explaining the
local-only ledger write and the KN-11/second-run rationale, and that `workflows.md`
§ CI-Dispatch Gate carries the corresponding doctrine paragraph. Assertions:

- `bkit-build.md`: NOTE anchor phrase `written to the LOCAL status.jsonl ledger only and is deliberately` present >= 1.
- `bkit-debug.md`: NOTE anchor phrase present >= 2 (both gate sites).
- `bkit-build.md`: NOTE mentions `KN-11`.
- `bkit-debug.md`: NOTE mentions `KN-11`.
- `bkit-build.md`: NOTE mentions `NOT committed/pushed`.
- `bkit-debug.md`: `NOT committed/pushed` present >= 2.
- `workflows.md`: carries `LOCAL-only (intentional non-push)`, `KN-11`, and the explicit
  `Do NOT "fix" this by adding a post-gate commit+push` guard phrase.

### describe 9 — All-kernels equality count guards are non-vacuous (FIX A lock-in)

Locks in exact kernel counts (1 for build, 2 for debug) so dropping either debug site or the
single build site causes an immediate count failure rather than silently passing on a vacuous
empty set. Assertions:

- `bkit-build.md`: `extractAllSharedKernelBlocks` returns EXACTLY 1 block.
- `bkit-debug.md`: `extractAllSharedKernelBlocks` returns EXACTLY 2 blocks.
- `bkit-build.md`: the single kernel block has >= 10 lines (non-trivial content guard).
- `bkit-debug.md`: both kernel blocks have >= 10 lines.
- Cross-file: build kernel and both debug kernels byte-equal (trimmed), with explicit per-block
  failure messages identifying which kernel diverged (PR-mode block 0 vs LOCAL-mode block 1).

## Test run result

`pnpm vitest run bkit-ci-dispatch-gate-alignment` — **43 passed** (25 existing + 18 new),
1 test file, 286ms.

## Blockers

None

## Bugs Discovered

LOG: pnpm vitest run bkit-ci-dispatch-gate-alignment → 43 passed (25 existing + 18 new), 1 test file, 286ms — PASS
