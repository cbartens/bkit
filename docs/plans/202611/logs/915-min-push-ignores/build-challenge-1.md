Verdict: CONCERNS
Failures: 1
Fingerprint: 1f5f8e4ed5a10324a48e199acdacc15a647bc155673cd4c4151fcafe620a0038
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Full diff `tmp/bkit-diff-915-min-push-ignores.md` (1095 lines, no `partial diff coverage` marker), read against `docs/plans/202611/915-min-push-ignores-plan.md`. Code read beyond the diff: `gitRaw` and `changedOutside` (`.bkit/core/engine/commands/workflow/ledgers.ts`), `findLineAnchoredMarkers` / `selectMarkers` (`.bkit/core/engine/install/managed-block.ts`), `minPush` / `minPushUpdates` (`.bkit/core/engine/commands/ci/ci.ts:670-790`), the `push-gate.test.ts`, `land.test.ts` and `husky-pre-push.integration.test.ts` fixtures, `templates.test.ts:226-243`, the `.bkit/templates/.husky/pre-push` min-push call sites, and every test or engine file that names `docs/templates` or `docs/audits`.

## Notes

Checked and clean:

- Fail-closed paths: a blob `git cat-file` cannot read (missing at either end, rename, delete, gitlink, shallow history) leaves the file in `outside`; `gitRaw` maps an exit-0 ENOBUFS to status 1 and a signal kill to `null`, both non-zero, so the plan's untested assumption about unreadable blobs holds in code.
- `managedHead` boundaries: end marker at end of file with no newline returns the whole text, which then differs from any version that gains a trailing newline (stricter, never looser); CRLF and trailing-space marker lines are not line-anchored, so they return null; a second marker anywhere returns null.
- Real shape: `managedHead` from the built `dist/` returns non-null for all 35 installed `docs/templates/bkit-audit-*.md` in this repo, so the feature fires on real templates, not only on the synthetic fixtures.
- Test fixtures prove what they claim: in the new `push-gate.test.ts` case `origin/dev` sits behind the `src/code.ts` commit, so only the receipt path can accept the increment; the hook cases get a fresh repo per test, so moving `origin/dev` leaks nothing.
- Below-marker readers: a grep of every test naming `docs/templates` turned up no installed-copy reader beyond the plan's rows 7, 12 and 13; `docs/audits/**` references are temp-repo fixtures or path parsers, not readers of real reports.
- The hook consumes only the exit status of `bkit ci min-push`, never `paths` or `outside`, so the new `sections` route reaches it whole.

Outside this lens (not counted as findings):

- The newest `docs/decisions.jsonl` row for `915-min-push-audit-template-project-section` still says the two bkit-repo tests are added "pending the owner's answer on #915", while the plan says the owner chose option A; the ledger does not record that answer.
- In a blobless partial clone, the new `git cat-file blob` calls can trigger a lazy fetch from the remote inside the pre-push hook, with no timeout; `git diff --name-only` never needed blobs. A failed fetch fails closed. Speculative, so not logged as a finding.
- When one push carries two refs and a template is accepted in one range but outside in the other, the log prints the "only its project section" line and `outside` lists the same file; the decision is correct (full gate), only the log reads as contradictory.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A push that changes a byte inside an audit template's managed block (for example 0xff to 0xfe) takes the light gate, because both blobs are decoded as UTF-8 and every invalid byte becomes the same U+FFFD, so the two managed heads compare equal
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:651` · **Round:** 1
  - **DONE WHEN:** `minPushOutside` compares the two blobs' bytes through the end-marker line without a lossy decode (for example, read the blob with a byte-preserving encoding such as `latin1`, or compare `Buffer` prefixes at the offset `managedHead` finds), so two blobs whose managed heads differ in any byte never land in `sections`; the plan's and `docs/decisions.jsonl` `915-min-push-audit-template-project-section`'s "byte for byte" claim then holds.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `bkit ci min-push > refuses an audit template whose managed block changes only in bytes that are not valid UTF-8, beside one changed only below its bkit:end` fails on `outside` being `[]` (the template lands in `sections`), reproduced against the built `dist/commands/ci/ci.js` with byte 0xff in the block at the base and byte 0xfe at the head: `{"ok":true,"outside":[],"sections":["docs/templates/bkit-audit-x.md"]}`
<!-- bkit:task 1 end -->
