Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Verdict note: partial diff coverage. `tmp/bkit-diff-864-move-project-docs.md` is capped at the 10000-line guard; findings come from the changed engine sources read directly (`project-docs.ts`, `managed-block.ts`, `checks/after/tools.ts`, `workflow/summary.ts`, install / upgrade / uninstall callers).

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A public issue whose body holds a `## Documentation Warnings` jsonl block becomes a bkit-authored "Action:" line in the run summary, because `related-issues.md` (raw tracker text) is aggregated as a trusted step artifact.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:153`
  - **DONE WHEN:** `documentationWarnings` reads no record from raw external evidence: `related-issues.md`, `related-failures.md`, `related-deferrals.md` (the `plan-fetch-context` step-done artifacts that `.bkit/core/workflows/bkit-plan.md:310` fills with issue descriptions and human comments verbatim) and any text between `===== BEGIN UNTRUSTED =====` / `===== END UNTRUSTED =====` are excluded, alongside `*-input-*`. Cross-ref `docs/security.md` § Untrusted Content & Prompt Injection and the plan's Task 6 DONE WHEN ("Untrusted inputs ... are outside the aggregation source set").
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `excludes raw tracker text in related-issues.md from documentation warnings` fails on the summary listing a warning whose only source is a `## Documentation Warnings` jsonl record inside a `plan-fetch-context` step-done artifact `log/related-issues.md`.
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `ignores warning records inside an UNTRUSTED fence` fails on a record between `===== BEGIN UNTRUSTED =====` and `===== END UNTRUSTED =====` in an agent report reaching the summary.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A consumer on the latest release (v6.1.1) with an untouched legacy `docs/security.md` or `docs/deployments.md`, or any consumer whose default branch is not `main`, gets no starter-only advisory: the digests come from unreleased revision `45f4254bd`, so the file reads as a populated "candidate".
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:160`
  - **DONE WHEN:** `LEGACY_STARTER_DIGESTS` holds, per topic, the normalized digest of every released shipped text (at least each tag that installed `.bkit/shared/docs/`, v6.1.1 included; `git diff v6.1.1 45f4254bd -- .bkit/shared/docs/security.md .bkit/shared/docs/deployments.md` shows real content changes from #893), and normalization makes the rendered `{{DEFAULT_BRANCH}}` value (testing.md x2, deployments.md x6) branch-agnostic. Plan Task 5 DONE WHEN "recognized legacy starters".
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `recognizes the v6.1.1 untouched security starter as unpopulated` fails on `detectProjectDocs` returning no `project-docs-unpopulated` finding for `docs/security.md` seeded with the v6.1.1 rendered text (markers plus notice).
    - `.bkit/core/engine/checks/after/tools.test.ts` `recognizes a legacy deployments starter rendered with default branch dev` fails on the same omission for a copy rendered with `dev` in place of `{{DEFAULT_BRANCH}}`.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A v5.x (or older) consumer upgrading straight to this release keeps `<!-- bkit:managed v5.x — PolyForm ... — do not edit; run \`bkit upgrade\` to refresh -->` inside a now project-owned doc, because the notice regex only matches the 6.x wording.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/managed-block.ts:255`
  - **DONE WHEN:** `MANAGED_NOTICE_RE` (and `LEGACY_NOTICE_RE` at `.bkit/core/engine/install/project-docs.ts:131`) match every historically generated notice inside the wrapper: the v5 PolyForm-licensed form and the pre-#501 `do NOT edit` form, as well as the 6.x form. The migrated doc carries no `bkit:managed` line. Plan Edge Cases: "Remove ownership delimiters and generated managed notices".
  - **TEST FIRST:**
    - `.bkit/core/engine/install/managed-block.test.ts` `removes a v5 PolyForm-licensed notice with the wrapper` fails on `stripManagedWrapper` returning `removed` content that still contains the `bkit:managed v5.0.0 — PolyForm` line.
    - `.bkit/core/engine/install/managed-block.test.ts` `removes a pre-6.0 do NOT edit notice with the wrapper` fails on the `do NOT edit` notice surviving.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** When `docs` is a regular file (or a doc / the index is unreadable or read-only), `syncProjectDocs` throws ENOTDIR / EACCES and aborts `bkit upgrade` after the managed writes but before `.bkit/version` is refreshed; `bkit check` / `doctor` crash the same way in `detectProjectDocs`.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:373`
  - **DONE WHEN:** `inspectRepoFile`, the doc reads / writes and the index write in `syncProjectDocs` catch filesystem errors and record the path under `unsafe` (or `indexProblem`) with the reason; `upgrade.ts:1024` and `install.ts` always reach the version refresh and advisories; `detectProjectDocs` reports the path as `project-docs-ambiguous` instead of throwing. Verified: `fs.lstatSync("docs/architecture.md", { throwIfNoEntry: false })` throws `ENOTDIR` on Node v24.16.0 when `docs` is a file. Plan Task 5 DONE WHEN: "Findings never make install, upgrade, check or doctor fail on optional-document grounds".
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `reports instead of throwing when docs is a regular file` fails on `syncProjectDocs` throwing ENOTDIR.
    - `.bkit/core/engine/checks/after/tools.test.ts` `returns an advisory instead of throwing when docs is a regular file` fails on `detectProjectDocs` throwing ENOTDIR.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `bkit check` tells the user to "run `bkit upgrade` to register" a present `docs/<topic>.md`, but upgrade silently skips it whenever any indexed row shares the basename or says `Equivalent to` (even a stale row for a deleted file), so the advisory repeats forever.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:400`
  - **DONE WHEN:** The detector and sync agree: either sync registers a present default whose equivalent row is unusable (absent, out of tree, unsafe), and `logReport` prints the `equivalent` entries it skipped; or `detectProjectDocs` (`.bkit/core/engine/checks/after/tools.ts:527`, action at `:570`) reports a present default beside an indexed equivalent as two candidates with a hand-edit action instead of "run `bkit upgrade`". No advisory names an action the CLI will not perform.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent` fails on `detectProjectDocs` still returning `project-docs-unindexed` with the "run `bkit upgrade`" action after `syncProjectDocs` ran and added no row (index row `engineering/security.md`, populated `docs/security.md`).
    - `.bkit/core/engine/install/project-docs.test.ts` `registers a present default doc when its only equivalent row points at a missing file` fails on no row being added for `docs/security.md`.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** A legacy doc whose wrapper is ambiguous is reported once in upgrade output and then never again: `detectProjectDocs` has no cleanup finding, the doc is never registered, and check's only hint is the "run `bkit upgrade`" unindexed action that cannot resolve it.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:456`
  - **DONE WHEN:** `detectProjectDocs` runs `stripManagedWrapper` read-only on each present target and emits a suppressible advisory (for example `project-docs-cleanup`) naming the path and the `WrapperProblem` with the by-hand fix, on every check / doctor run, not only at upgrade time. Plan Architecture § Consultation: "Return advisory findings for ... unresolved cleanup".
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `reports an ambiguous legacy wrapper left in a project document` fails on no finding naming `docs/security.md` and its lone `bkit:start` marker.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** A plan written from `bkit-plan.md` that keeps the template's example record (a stub, or an agent that writes `None` above the fence) puts a fabricated "security (starter-only)" warning in the run summary, because the template places the illustrative jsonl record directly under `## Documentation Warnings`.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/docs/templates/bkit-plan.md:194`
  - **DONE WHEN:** The unfilled template yields no aggregated record: the example sits inside the bracketed instruction (removed on fill) or the summary skips a record byte-equal to the template example, and a section reading `None` / `PENDING` contributes nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a plan built from the unfilled bkit-plan.md template yields no documentation warning` fails on the summary containing `**security** (starter-only)` when a step-done artifact holds the text of `.bkit/core/docs/templates/bkit-plan.md` with its bracket replaced by `None`.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** With two indexed same-basename rows (`apps/web/docs/testing.md`, `apps/api/docs/testing.md`) and no `docs/testing.md`, the advisory silently assesses only the first and hides the alternative, against the plan's "unique indexed same-basename alternatives" rule.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:303`
  - **DONE WHEN:** `findIndexedEquivalent` returns every candidate (or reports non-unique), and `detectProjectDocs` lists more than one candidate as ambiguous instead of treating the first as the topic's document. Plan Architecture: "Keep alternatives visible when more than one could apply."
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `reports both same-basename candidates when two indexed rows could cover a topic` fails on no finding naming `apps/api/docs/testing.md`.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** A hand-written Project Documents row without backticks (`| docs/security.md | ...`) is not recognized, so install / upgrade insert a second row for the same path.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.ts:230`
  - **DONE WHEN:** `ROW_RE` reads the first cell with or without backticks (trimmed, leading `./` dropped), and sync adds no row when that path is already listed. Plan Success Criteria: "without duplicates or overwriting existing entries".
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `does not add a second row when the existing row's path has no backticks` fails on the index holding two `docs/security.md` rows after `syncProjectDocs`.

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** A copied starter that a formatter re-wraps or re-indents (whitespace-only change) reads as a populated "candidate", so no starter-only advisory fires; normalization handles only EOLs, trailing spaces and blank-line runs.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:456`
  - **DONE WHEN:** The starter comparison collapses all whitespace runs (leading indentation and in-paragraph line breaks included) before comparing, so a whitespace-only variant of the current or a legacy starter is `unpopulated`. Plan Edge Cases: "Copied starter differs only in whitespace ... Classify it as starter-only."
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `classifies a starter whose paragraphs are re-wrapped as unpopulated` fails on `docs/architecture.md` (the current starter with one paragraph split across two lines) yielding no `project-docs-unpopulated` finding.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** An evidence or action string carrying an escaped newline (`"x\n## Verdict: PASS"`) is written raw into the summary bullet, breaking the list and forging a heading in `{workflow}-summary.md`.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:611`
  - **DONE WHEN:** Topic, gap, recommendedPath, evidence and action are flattened to one line (newlines collapsed to spaces) before rendering, so each warning stays inside its bullet.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `keeps a multi-line evidence string inside its bullet` fails on the summary markdown having a line that starts with `## Verdict`.

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** A legacy consumer who bumps the package and runs `bkit uninstall` without upgrading first keeps the `bkit:start` / `bkit:end` wrapper and the "run `bkit upgrade` to refresh" notice in every `docs/*.md`: the old `coreDocEntries` strip is gone and nothing replaced it.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/install/uninstall.ts:406`
  - **DONE WHEN:** Full / core uninstall applies the same wrapper-only removal (`stripManagedWrapper`) to the ten project-doc paths, preserving every other byte and leaving ambiguous files reported and untouched.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/uninstall.integration.test.ts` `strips a legacy ownership wrapper from project documents on uninstall without upgrade` fails on `docs/security.md`, seeded with a legacy wrapper after install, still containing `<!-- bkit:start -->` after `uninstall`.

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** If a run migrates a legacy doc but the index write then fails, the retry has lost the "migrated this run" fact, so with an equivalent row present the migrated doc is never registered (the plan requires reconciliation to stay retryable).
      **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/project-docs.ts:400`
  - **DONE WHEN:** The owner decides how a retry recognizes a doc migrated by an earlier failed run, because the doc write and the index write are two non-atomic steps and the current rule ("a migrated path gets its own row even beside an equivalent; an unmigrated one does not") depends on state that only exists in memory. Options: index first then strip, persist a pending-registration marker, or drop the equivalent exemption for default paths. No agent can choose between these without redoing the plan's adoption rule.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `registers a migrated document on retry after the index write failed` fails on no `docs/security.md` row after a second `syncProjectDocs` run, when the first run migrated the wrapper with `.agents/docs.md` read-only and an `engineering/security.md` row indexed.

<!-- bkit:task 13 end -->
