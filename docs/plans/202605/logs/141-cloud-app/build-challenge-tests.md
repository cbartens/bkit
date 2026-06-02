Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing

18 new regression tests added across two existing integration test files to lock in the build challenge remediations.

## Tests Added

### Finding 1 — SHARED-DERIV portability and pipefail safety

Added 6 tests in the new `describe("Challenge Finding 1 — SHARED-DERIV portability and pipefail safety regression")` block in `.agents/scripts/bkit-modules.integration.test.ts`:

- **(1a) canonical bkit-cloud.yml contains NO `grep -oP`** — asserts the PCRE lookbehind is absent from the canonical workflow. A silent re-introduction of `-oP` would pass on ubuntu-latest GNU grep but fail on BSD/macOS runner images.
- **(1a) template bkit-cloud.yml contains NO `grep -oP`** — same assertion on the template (which must stay byte-identical to the canonical).
- **(1b) ISSUE assignment has `|| true` guard in canonical** — regex-asserts the ISSUE=$(...grep -oE...) line ends with `|| true`, so a no-match PR body exits 0 instead of aborting the step under `set -euo pipefail`.
- **(1b) FID assignment has `|| true` guard in canonical** — same for the FID line.
- **(1b) ISSUE assignment has `|| true` guard in template** — mirrors the canonical check on the template.
- **(1b) FID assignment has `|| true` guard in template** — mirrors the canonical check on the template.
- **(1c) SHARED-DERIV exits 0 under `set -euo pipefail` with empty PR body (real-tool validation)** — extracts the actual ISSUE/FID assignment lines from the canonical workflow and executes them via `bash -c` under strict mode with `PR_BODY=""`. Asserts `exit 0` and both variables are empty (no abort, no partial output). This is the real-tool validation the reviewers requested.
- **(1c) SHARED-DERIV correctly parses a well-formed PR body (positive case)** — executes the same lines with a PR body containing `bkit:issue=#141 bkit:fid=141-cloud-app` and asserts `ISSUE=141` and `FID=141-cloud-app`. Locks in the functional parse path alongside the failure-guard path.

### Finding 2 — `claude.yml` author_association gate

Added 5 tests in the new `describe("Challenge Finding 2 — claude.yml author_association allow-list regression")` block in `.agents/scripts/bkit-modules.integration.test.ts`:

- **issue_comment path has author_association gate** — asserts `github.event.comment.author_association` is referenced in the `if:`.
- **pull_request_review_comment path has author_association gate** — asserts the same field is referenced (both comment events share the field).
- **pull_request_review path has author_association gate** — asserts `github.event.review.author_association` is referenced.
- **issues path has author_association gate** — asserts `github.event.issue.user.author_association` is referenced.
- **allow-list contains exactly OWNER, MEMBER, COLLABORATOR** — asserts the literal `["OWNER","MEMBER","COLLABORATOR"]` JSON array is present in the file.
- **allow-list checked via `fromJSON` on all 4 event paths** — counts `fromJSON(...)` occurrences and asserts there are at least 4 (one per event path), so removing the check on any single path is caught.
- **`if:` uses `contains(fromJSON(...), author_association)`** — regex-asserts the check is a proper array membership test, not a string equality `== 'OWNER'` that would miss other associations.

### Finding 3 — `bkit-install.ts` constraint-before-write

Added 3 tests in the new `describe("Challenge Finding 3 — cloud/tracker constraint-before-write regression")` block in `.agents/scripts/bkit-install.integration.test.ts`:

- **`--tracker=github --cloud=cursor` exits non-zero (mismatch)** — real subprocess invocation via `spawnSync`; asserts the process exits with a non-zero code and the error output mentions the tracker/cloud mismatch.
- **`--tracker=github --cloud=cursor` does NOT write `bkit.issueTracker` to package.json** — after the failed install, reads `package.json` and asserts `bkit.issueTracker` is `undefined`. This is the direct regression test for the "no partial write" invariant. The pre-remediation code wrote the tracker BEFORE the constraint check, so this test would have failed against the original code.
- **`--tracker=linear --cloud=cursor` exits 0 and writes `bkit.issueTracker=linear`** — complementary positive case proving the matching pair succeeds and state is persisted correctly.

### Finding 4 — Byte-identity

The byte-identity assertion at line 919 of `bkit-modules.integration.test.ts` already existed (`"canonical .github/workflows/bkit-cloud.yml and template are byte-identical (T3.1 + T2.7 invariant)"`). The Finding 1 tests augment it by additionally asserting the specific grep commands and `|| true` guards are present in both files, covering the remediated lines.

## Blockers

None

## Bugs Discovered

LOG: pnpm test passed — 1082 passed | 2 skipped | 1 todo (was 1064+18=1082). typecheck clean. format:check clean.
