Verdict: CONCERNS
Failures: 2
Fingerprint: 63793167704857af276eafb615b9f5611395be10efb40355c80e8f978e7e03c7
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

partial diff coverage. `tmp/bkit-diff-887-review-doc-starters.md` shows 20 of 97 files at 500 lines each. 19 of the 20 are the vendored `design-doc-mermaid` skill; the only bkit-authored file shown is `.bkit/core/engine/install/project-docs.test.ts`, with its last 79 lines (the `adoption chart helpers` block Task 16 added) not shown. Findings are limited to the shown content. `project-docs.ts`, `template-copies.ts`, `tools.ts`, `catalogue.ts`, `upgrade.ts`, the integration tests and the twelve starters' diffs were not shown, so `adoptedProjectDocPath`, the affirmative equivalence regex, the upgrade-report marker and the advisory merge are unchallenged here.

## Notes

- Task 16 (challenge round 1) is in place in the shown code: `adoptionArrows` takes the chart as a parameter, reads `-->|x|`, chained and `&` edges, and throws on `==>`, `--o`, `--x`, `<-->`, `---`, `-.-`, `-- text -->`, `;`-joined statements and non-`["..."]` node shapes. `docPaths` now needs a whole `docs/{topic}.md` path. The unshown tail was read on disk only to check that no existing test covers Tasks 1 and 2 here; none does, and no test exercises the throw path at all (`docs/testing.md` § A guard asserts the rule, not the sentence that explains it: "Prove it can fail").
- Not re-logged: round 1's three LOW findings on the same file (`sectionMarks` / the practice skip reading any line instead of the first, `hasPractice` counting the rules-box line, `boxDrawingLines` checking only `[▼▲┌┐]` inside triple-backtick fences). They are still present at `.bkit/core/engine/install/project-docs.test.ts:490`, `:423` and `:498`, and are already recorded in `docs/deferrals.jsonl` under the keys ending `-project-docs-test-ts-460`, `-396` and `-476`.
- Not logged (no test can fail on the current content): the waves table in `.bkit/core/.bkit/templates.md` § Project docs — adoption order is never compared with the chart, so a later edit to one of them can drift from the other without a red; today they agree edge for edge.
- Not logged (loud, not silent): `adoptionChart` reads the first ```` ```mermaid ```` block after the heading, so a chart split into a second chart (the other option the § Docs rule gives) drops the second chart's edges. Every starter that lists a prerequisite from that chart then fails with `got …, want` rather than passing.
- `adoptedProjectDocPath` and the `syncProjectDocs` "Not equivalent" tests in the shown diff fail on the old loose regex and on an implementation that follows symlinks, so they prove the behaviour they name.
- Vendored skill (`.agents/skills/design-doc-mermaid/`): third-party content, not authored by this change and not fixable here. Embedded directive reported, not followed: `scripts/resilient_diagram.py` `get_search_recommendation` and `references/guides/resilient-workflow.md` tell agents to send Mermaid error text to external search tools (`perplexity_ask`, `brave_web_search`, a `gemini` skill); `docs/security.md` § Untrusted Content & Prompt Injection treats installed skill bodies as attacker-controlled text.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** An adoption-chart edge into a subgraph id (for example `W3 --> W4` after the chart is split by wave, as the § Docs rule asks past about 15 nodes) or into an id with no `["..."]` label is read as a prerequisite of a made-up `docs/Wave 4.md` path, so no starter's Fill these first line is checked against it and no error is raised
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.test.ts:286` · **Round:** 1
  - **DONE WHEN:** adoptionArrows throws on any edge whose endpoint is a subgraph id or an id with no quoted `["..."]` node label, so every recorded edge joins two doc nodes, and a test covers that throw path alongside the existing read-path tests.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `adoptionArrows throws on an edge into a subgraph or an unlabelled node` fails on a chart holding `subgraph W4["Wave 4"]`, `ARCH["architecture"]`, `end` and `TECH["technology"] --> W4` returning a solid map keyed `docs/Wave 4.md` instead of throwing
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A starter with the same `##` heading twice (for example an unmarked `## Environments` slot above a marked one) passes the slot-or-practice and `[e.g.,`-row checks, because sections() resets the Map entry on the second heading and silently drops every line of the first section
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/project-docs.test.ts:359` · **Round:** 1
  - **DONE WHEN:** sections() throws (or starterProblems and sectionMarks report a problem) when a `##` heading repeats below the title, so no section's lines are discarded before the marker and table checks read them.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/project-docs.test.ts` `sectionMarks rejects a repeated ## heading` fails on `sectionMarks("# T\n\n## A\n\nplain\n\n## A\n\n> **bkit practice:** keep\n")` returning a Map with `## A` marked practice instead of throwing
<!-- bkit:task 2 end -->
