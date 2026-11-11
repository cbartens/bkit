Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Verdict note: partial diff coverage. `tmp/bkit-diff-864-move-project-docs.md` shows the 20 largest files at 500 lines each; findings are limited to what it shows (`.bkit/core/engine/install/project-docs.ts` lines 1-494, `.bkit/core/engine/checks/after/tools.test.ts`, `.bkit/core/engine/commands/workflow/summary.test.ts`), with callers read only to confirm reach. Each scenario below was reproduced against the committed `dist/` build with a scratch fixture.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A Project Documents table that lists a deleted `old/security.md` above a populated `eng/security.md` gets `bkit check` saying "No project document covers: docs/security.md", because `findIndexedEquivalent` returns the first same-topic row and the detector calls it with the default `usable = () => true`.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:426`
  - **DONE WHEN:** When the default path is absent, the detector (`.bkit/core/engine/checks/after/tools.ts:495`) resolves the topic to the first indexed row that is in-tree and a regular file (the same `usable` predicate sync passes at `project-docs.ts:528`), so a stale or out-of-tree row ahead of a valid one yields neither `project-docs-missing` nor `project-docs-ambiguous` for that topic; when every candidate row is unusable, the advisory names those rows. Plan Edge Cases: "Indexed equivalent uses a different path → Consult it; do not emit a false missing-default-path warning."
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `consults a later valid same-topic row when the first indexed row is stale` fails on `detectProjectDocs` listing `docs/security.md` in `project-docs-missing` for an index with rows `old/security.md` (no file) then `eng/security.md` (populated) and no `docs/security.md`.
    - `.bkit/core/engine/checks/after/tools.test.ts` `consults a later valid equivalent row when the first is out of tree` fails on `detectProjectDocs` returning `project-docs-ambiguous` naming `../shared/security.md` when the next row `eng/security.md` is populated and in-tree.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A maintainer copies the security starter and their editor or formatter indents one line or doubles one space; `bkit check` then raises no starter-only advisory and the file reads as a populated candidate, because `normalizeLegacyText` trims only trailing whitespace and blank-line runs.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:158`
  - **DONE WHEN:** The comparison used for starter recognition (`normalizeLegacyText`, and the digests in `LEGACY_STARTER_DIGEST_HISTORY` recomputed under the same rule) is insensitive to leading whitespace and runs of inner spaces / tabs, so a current or legacy starter copy that differs only in whitespace is reported under `project-docs-unpopulated`. Plan Edge Cases: "Copied starter differs only in whitespace or the former ownership lines → Classify it as starter-only."
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `classifies a starter copy that differs only in whitespace as unpopulated` fails on `detectProjectDocs` returning no finding for an indexed `docs/security.md` holding `.bkit/templates/docs/security.md` with one prose line's first space doubled.
    - `.bkit/core/engine/checks/after/tools.test.ts` `classifies an indented legacy starter copy as unpopulated` fails on the same omission for an indexed `docs/security.md` holding the `45f4254bd` security starter (wrapper lines removed) with its first prose line indented by two spaces.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A consumer whose Project Documents row is `| [docs/security.md](docs/security.md) | ... |` gets a second `docs/security.md` row written into their own table on the next install / upgrade, and a row with no trailing pipe has its `Equivalent to docs/security.md` Scope ignored, because the row parser only sees a backticked first cell and takes Scope as `cells[length - 2]`.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:338`
  - **DONE WHEN:** `readProjectIndex` reads a row's path from a backticked cell, a Markdown link target or a bare path, and takes Scope as the last non-empty cell whether or not the row ends in `|` (escaped `\|` not splitting a cell); a row it cannot parse is reported as ambiguous rather than treated as absent. `syncProjectDocs` adds no row for a path already listed in any of those forms. Plan Success Criteria: "Register adopted project docs ... without duplicates or overwriting existing entries."
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `does not add a second row for a default doc indexed through a markdown link` fails on `syncProjectDocs` returning `registered: ["docs/security.md"]` and appending a backticked row below the existing link row.
    - `.bkit/core/engine/checks/after/tools.test.ts` `reads the Scope of a row without a trailing pipe` fails on `detectProjectDocs` listing `docs/security.md` as missing when the only row is `` | `eng/sec-notes.md` | ○ | ○ | ○ | ○ | ○ | Equivalent to docs/security.md `` with no closing pipe and `eng/sec-notes.md` populated.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A row whose Scope says "Not equivalent to docs/security.md — API tokens only" (or "Equivalent to docs/security.mdx") silences the missing-security advisory and makes upgrade skip registering a present `docs/security.md`, because the equivalence regex has no negation check and no end boundary.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:429`
  - **DONE WHEN:** `findIndexedEquivalent` matches only an affirmative `Equivalent to <recommended path>` whose path ends at a word boundary (backtick, whitespace, punctuation or end of cell), so negated phrasing and longer paths such as `docs/security.mdx` or `docs/security.md.bak` name no equivalent.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `does not treat a Not equivalent to scope as covering the topic` fails on `detectProjectDocs` leaving `docs/security.md` out of `project-docs-missing` when the only row is `eng/api.md` with Scope `Not equivalent to docs/security.md — API tokens only.`
    - `.bkit/core/engine/install/project-docs.test.ts` `does not match a longer path after Equivalent to` fails on `findIndexedEquivalent([{ path: "eng/x.md", scope: "Equivalent to docs/security.mdx" }], "security")` returning `eng/x.md`.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** The out-of-tree half of `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace` cannot fail: its row `../escape/noise.md` resolves to `<tmpdir>/escape/noise.md`, a file that never exists, while the planted secret sits in a different `bkit-outside-*` folder, so removing the `isInTreePath` guard still passes the `fsReads` assertion.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.test.ts:621`
  - **DONE WHEN:** Both out-of-tree fixtures (`tools.test.ts:587` and `:621`) index the planted file through a relative `..` path that really resolves to it (`path.relative(tmpDir, path.join(outside, "noise.md"))`), and assert that file exists, so the `fsReads` and `OUTSIDE-SECRET-CONTENT` assertions fail if the in-tree guard is bypassed. `docs/testing.md` § Validated means executed, not "didn't fail" and § Static (tests that cannot fail).
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `indexes the planted outside file through a relative path that resolves to it` fails on `fs.existsSync(path.resolve(tmpDir, "../escape/noise.md"))` being false for the current fixture row.

<!-- bkit:task 5 end -->
