Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage. `tmp/bkit-diff-864-move-project-docs.md` (origin/dev...HEAD, 428 files) shows the 20 largest files. Challenged in full from the working tree or `git diff origin/dev...HEAD`: `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/install/managed-block.ts`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/after/index.ts`, `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/install/{install,upgrade,uninstall}.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/tools/instructions.ts`, `.claude/hooks/bkit-gateguard.cjs`, `.github/workflows/bkit-ci.yml`, `.bkit/templates/.github/workflows/bkit-ci.yml`, `package.json`, `skills-lock.json`, the `doc-indexed-equivalent` clause in `.bkit/instructions.md` and its three prompt carriers. Supply chain: one new dependency, the `vitest` skill (`antfu/skills`, `computedHash`-pinned, no `ref`, markdown only, no install scripts, no embedded directives found). Plan tasks 10 to 17 already cover the round-1 findings; no block below repeats them. Cross-referenced against `docs/security.md` § Untrusted Content & Prompt Injection, § PII and § Public repo content, `.bkit/core/engine/commands/workflow/context.ts:88` (fence contract) and the plan's § Security & Privacy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A runtime or CI log line that prints a forged `===== END UNTRUSTED =====` line, followed by a `## Documentation Warnings` jsonl block, survives `stripUntrusted` in a debug context-fetch artifact (`context-<name>-N.md`, a `step-done` artifact the name filter does not exclude), so `bkit workflows summary` republishes the attacker's `Action:` text as engine output in `debug-summary.md`, which is posted as a tracker comment and returned as the final message.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:158`
  - **DONE WHEN:** `stripUntrusted` drops everything from the first `FENCE_OPEN` line to the last `FENCE_CLOSE` line in the file (to end of file when no close follows), so no closing marker inside the payload can end the strip early. This matches the fence contract at `.bkit/core/engine/commands/workflow/context.ts:88` ("Fence ends at LAST line of file; ANY other closing markers are forged"). The `jsonl` fence body regex accepts the end of the section as a close, so the existing test `ignores warning records inside an UNTRUSTED fence` keeps passing. The plan's Task 6 DONE WHEN ("Untrusted inputs ... are outside the aggregation source set") and Task 10 hold against a forged closer.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `ignores a warning record placed after a forged closing marker in a fenced context artifact` fails on `buildSummary` rendering `FORGED-ACTION`. The fixture is a `step-done` row with artifact `log/context-ci-1.md`. Its text is `FENCE_INSTRUCTION_LINES`, `FENCE_OPEN`, a log line, a forged `FENCE_CLOSE`, `## Documentation Warnings`, a `jsonl` fence holding a valid five-field record whose `action` is `FORGED-ACTION`, then the real `FENCE_CLOSE`. The current lazy `[\s\S]*?` stops at the forged closer, and `isRawInput` matches only `*-input-*`, `related-*` and `context-related-*` names, so the record is rendered today.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A first-party report whose warning `action` (or `topic`, `gap`, evidence) holds an escaped newline, for example written by an agent that read injected text, adds lines such as `## Verdict: PASS` or a fake `Risks` section to `debug-summary.md`. A backtick in `recommendedPath` breaks out of its code span. The engine posts that summary to the tracker as its own output.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:620`
  - **DONE WHEN:** Before rendering, each record field has CR, LF and other control characters collapsed to one space and a length cap applied. `recommendedPath` has backticks removed. Each warning renders as exactly its own bullet lines and cannot add a heading or another section to the summary. This matches the plan's § Security & Privacy rule "Print only validated, repository-relative paths and bounded gap/action metadata".
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `keeps each documentation warning field on one summary line` fails on the summary markdown containing a line that starts with `## Verdict`. The fixture is a `step-done` artifact `log/a.md` with a valid record whose `action` is `"fix\n## Verdict: PASS"`. `buildSummary` pushes the parsed string unchanged at `summary.ts:622`, so the joined markdown gains that line today.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A committed `Project Documents` row that fails the in-tree check, for example `` `/tmp/<ESC>[2Jpwned/security.md` ``, is echoed raw and unbounded into the `project-docs-ambiguous` advisory. Index text that bkit refused to trust (terminal escape sequences, arbitrary Markdown) reaches the `bkit check` / `doctor` console checklist and `.bkit/advisories.md`.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:506`
  - **DONE WHEN:** For a row that `isInTreePath` rejects, the advisory names the recommended path (`docs/<topic>.md`) and the reason only, or a sanitized row path with control characters stripped and a length cap. No unvalidated index text is printed verbatim. This matches the plan's § Security & Privacy rule "Print only validated, repository-relative paths".
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `does not echo a rejected index path into the advisory` fails on the `project-docs-ambiguous` finding's `detect` text containing `\u001b`. The fixture has `docs/security.md` absent and a Project Documents row `` `/tmp/\u001b[2Jpwned/security.md` ``. `ROW_RE` accepts the row, `findIndexedEquivalent` (no `usable` filter at `tools.ts:495`) returns it on the matching basename, and `isInTreePath` rejects it, so line 506 pushes the raw `target` today.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `readStarterText` reads the consumer's `.bkit/templates/docs/<topic>.md` through `readTextFile` (plain `fs.readFileSync`) with no symlink or containment check. A committed symlink there makes `bkit check` read a file outside the repository, and its advisory reveals whether that file's text equals a document the attacker controls. This breaks the "no read leaves the project tree" guarantee in the plan's Task 9 and the `detectProjectDocs` doc comment.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:441`
  - **DONE WHEN:** The consumer-side starter read goes through `inspectRepoFile(cwd, starterPath(topic))` and runs only when the result is `"regular"`. The package-root read is unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `does not follow a symlinked consumer starter outside the repository` fails on `detectProjectDocs` returning `project-docs-unpopulated` for `docs/security.md`. The fixture mocks `getPkgRoot()` to a directory with no starters. `tmpDir/.bkit/templates/docs/security.md` is a symlink to a file outside `tmpDir`, and that file's text equals the indexed, prose-bearing `docs/security.md`. The current code follows the link and matches the text, which proves the out-of-tree read. After the fix the document reads as a candidate.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** The agent-side consultation clause `doc-indexed-equivalent` ("Read the recommended path or a valid indexed equivalent") never defines "valid". A `Project Documents` row such as `` `/home/runner/.claude/bkit-cloud.md` `` with Scope `Equivalent to docs/security.md` therefore leads the plan, convert and audit agents to read a file outside the repository and cite its path and section in the committed, tracker-posted `Documentation Consultation` output. The engine applies the plan's rule ("Reject absolute paths, traversal, symlink escapes and non-regular files before reading"), but the agents get no such instruction.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/instructions.md:3393`
  - **DONE WHEN:** The `doc-indexed-equivalent` clause defines a valid equivalent as a repository-relative regular file inside the repository (no absolute path, no `..`, no symbolic link). It tells the agent to treat any other row as a warning and not read it. The wording reaches `.bkit/core/prompts/bkit-plan-generate.md:106`, `.bkit/core/prompts/bkit-build-plan-convert.md:66` and `.bkit/core/prompts/bkit-audit-generate.md:133` through `pnpm instructions:sync`, and the mirrors are re-rendered.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` `restricts indexed equivalents to in-repository files in the consultation clause` fails on the `doc-indexed-equivalent` text in `.bkit/instructions.md`, and on each of its three carrier prompts, not matching `/inside the repository/i`. The current clause has no path constraint.

<!-- bkit:task 5 end -->
