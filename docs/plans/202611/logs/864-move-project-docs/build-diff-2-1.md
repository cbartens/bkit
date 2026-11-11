diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index aba0aa0c7..fb2c274c4 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -485,6 +485,89 @@ When all three are present, an embedded directive executes.
 
 Prose never substitutes for token scope.
 
+## Documentation Consultation Coverage
+
+Every shipped prompt and audit template was reviewed for the project documents it should consult, with the same fields and outcomes as the workflow catalog (`workflows.md` § Documentation Consultation Coverage). Prompts share one load clause: read the `.agents/docs.md` index, load the listed documents, and warn and continue when the index or a document is missing, empty or still the starter. Prompts that produce gap reports write one `jsonl` record per gap under `## Documentation Warnings` with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`; the workflow summary merges them. Audit templates are consulted through `bkit-audit-generate` step 4 unless a row says otherwise.
+
+<!-- prettier-ignore -->
+| Source | Recommended documents | Outcome | Applicability and reason |
+| --- | --- | --- | --- |
+| `.bkit/core/prompts/bkit-audit-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Step 4 loads the surface documents with or without a plan and writes Documentation Warnings. |
+| `.bkit/core/prompts/bkit-build-challenge-1.md` | `docs/architecture.md`, `docs/security.md` | added | Challenge cross-references findings against the architecture and security documents. |
+| `.bkit/core/prompts/bkit-build-challenge-2.md` | `docs/security.md` | retained | Already cites the security document with warn-and-continue; the clause is now shared. |
+| `.bkit/core/prompts/bkit-build-install-skills.md` | n/a | not-applicable | Installs skills from `.agents/skills.md`; it needs no project-document topic. |
+| `.bkit/core/prompts/bkit-build-plan-convert.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Conversion carries consultation, sources, gaps and READ and UPDATE lines into the plan. |
+| `.bkit/core/prompts/bkit-build-plan-current.md` | n/a | not-applicable | Compares plan references with the working tree; project documents add no evidence. |
+| `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | `docs/architecture.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-tasks.md` | `docs/architecture.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-tests.md` | `docs/architecture.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-verify.md` | `docs/observability.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-debug-abort-handover.md` | n/a | not-applicable | Writes the handover from run artifacts and keeps their warnings; it consults no document. |
+| `.bkit/core/prompts/bkit-debug-failure-diagnose.md` | `docs/testing.md`, `docs/noise.md` | added | Diagnosis checks registered signal downgrades and test tiers before judging a failure. |
+| `.bkit/core/prompts/bkit-debug-failure-remediate.md` | `docs/testing.md` | added | Remediation follows the testing document when present. |
+| `.bkit/core/prompts/bkit-debug-failure-reproduce.md` | `docs/testing.md` | retained | Already cites the testing document with warn-and-continue. |
+| `.bkit/core/prompts/bkit-debug-failure-soak.md` | `docs/testing.md` | added | Soak runs follow the tier rules in the testing document when present. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md` | `docs/architecture.md`, `docs/technology.md` | added | Pragmatic lens starts from existing topology and stack choices. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md` | `docs/architecture.md`, `docs/technology.md` | added | Trade-off lens starts from existing topology and stack choices. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md` | `docs/architecture.md`, `docs/security.md` | added | Pre-mortem lens reads boundaries and trust assumptions. |
+| `.bkit/core/prompts/bkit-design-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md` | added | Draft design records the sources it consulted and warns on gaps. |
+| `.bkit/core/prompts/bkit-design-organise.md` | `docs/architecture.md` | added | Workstream grouping respects documented boundaries. |
+| `.bkit/core/prompts/bkit-design-review-1.md` | `docs/architecture.md`, `docs/technology.md` | added | Feasibility review checks the design against documented topology and stack. |
+| `.bkit/core/prompts/bkit-design-review-2.md` | `docs/observability.md`, `docs/deployments.md` | retained | Already cites both documents with warn-and-continue. |
+| `.bkit/core/prompts/bkit-design-spike.md` | n/a | not-applicable | Throwaway probes answer from code and the web; project documents add no evidence. |
+| `.bkit/core/prompts/bkit-design-update.md` | `docs/architecture.md` | added | Applying review items keeps the design consistent with documented boundaries. |
+| `.bkit/core/prompts/bkit-plan-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Fills Documentation Consultation and Documentation Warnings and carries READ and UPDATE lines. |
+| `.bkit/core/prompts/bkit-plan-review-1.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Critique checks that the plan consulted each assessed topic. |
+| `.bkit/core/prompts/bkit-plan-review-2.md` | `docs/testing.md` | retained | Already cites the testing document with warn-and-continue. |
+| `.bkit/core/prompts/bkit-plan-scope-check.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Scope audit checks the consultation table and warnings are complete. |
+| `.bkit/core/prompts/bkit-plan-update.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Preserves source evidence and updates it when a review changes the plan. |
+| `.bkit/core/prompts/bkit-ship-conflict-resolve.md` | n/a | not-applicable | Resolves merge conflicts from git history and both sides; no project-document topic. |
+| `.bkit/core/prompts/bkit-ship-deferred-sweep.md` | n/a | not-applicable | Reads the deferral ledger only; no project-document topic. |
+| `.bkit/core/prompts/bkit-ship-update-docs.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Checks presence, index accuracy and project content for every topic and reports unresolved coverage. |
+| `.bkit/core/prompts/bkit-utility-compress-markdown.md` | n/a | not-applicable | Compresses the one file it is given; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-decisions.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-deferrals.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-documentation.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Reviews every relevant topic including absent ones, populates within scope and reports gaps. |
+| `.bkit/core/prompts/bkit-utility-update-failures.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-knowledge.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-roadmap.md` | n/a | not-applicable | Roadmap upkeep from ledgers and the tracker; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-tracker.md` | n/a | not-applicable | Tracker upkeep per `.bkit/trackers.md`; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-accessibility.md` | `docs/design.md` | retained | Already cites the design document for tokens and components. |
+| `.bkit/core/docs/templates/bkit-audit-adoption.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Step 6 checks presence, index accuracy and content of every project document. |
+| `.bkit/core/docs/templates/bkit-audit-agents.md` | n/a | not-applicable | Reviews instruction files, hosts and hooks that bkit manages; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-aio-seo.md` | n/a | not-applicable | Crawls public pages for search and answer-engine readiness; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-analytics.md` | `docs/observability.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-annotations.md` | n/a | not-applicable | Reviews code annotations against the code; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-app-performance.md` | `docs/architecture.md`, `docs/observability.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-app-store.md` | `docs/deployments.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-architecture.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-ci-performance.md` | `docs/deployments.md`, `docs/testing.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-config.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-cost.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-coverage.md` | `docs/testing.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-database.md` | `docs/data-schema.md`, `docs/setup.md` | corrected | Cited the setup document only; the schema document is now named for the active schema. |
+| `.bkit/core/docs/templates/bkit-audit-dead-code.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-deferrals.md` | n/a | not-applicable | Audits the deferral ledger; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-dependencies.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-documentation.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Step 3 checks presence, index accuracy and project content and writes Documentation Warnings. |
+| `.bkit/core/docs/templates/bkit-audit-duplication.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-failures.md` | n/a | not-applicable | Audits the failure ledger; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-flakes.md` | `docs/testing.md` | retained | Already cites the testing document. |
+| `.bkit/core/docs/templates/bkit-audit-gates.md` | `docs/deployments.md`, `docs/design.md`, `docs/testing.md` | retained | Already cites all three documents. |
+| `.bkit/core/docs/templates/bkit-audit-issues.md` | n/a | not-applicable | Audits tracker issues; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-llm.md` | `docs/technology.md`, `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-logs.md` | `docs/observability.md`, `docs/noise.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-models.md` | `docs/technology.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-privacy.md` | `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-prompts.md` | n/a | not-applicable | Reviews bkit prompts and agent files; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-red-team.md` | `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-reliability.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-repo.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-security.md` | `docs/security.md`, `docs/deployments.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-slop.md` | n/a | not-applicable | Scans code patterns against lint rules; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-testing.md` | `docs/testing.md` | retained | Already cites the testing document. |
+| `.bkit/core/docs/templates/bkit-audit-usability.md` | `docs/design.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+
 ## Model Presets
 
 Two settings for OpenRouter, the overflow column, which covers the days after the week's OpenAI, Anthropic and Google credits run out. Costs are per **2-day gap**, the binding case against the weekly cap (`.bkit/providers.md` § Budget band), at the measured OpenCode profile with each agent carrying an equal 1/40 share. Judges and key gates: § Models Judges note.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d7564dc69..ce07a48b6 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1160,6 +1160,44 @@ It writes only the report and the template's consumer-owned `Project Instruction
 
 **CI-class skip conditions:** one tracker no-op line, then exit 0. Only real failures (missing args, tracker unreachable, malformed state) → Failure Path. Loop bound: `/bkit-debug` enforces `debug.fix` and `debug.soak` `maxAttempts` across every debug run of the feature; cloud counts only `dev` dispatches.
 
+## Documentation Consultation Coverage
+
+Every rule group, workflow step and plan-template section was reviewed for the project documents it should consult. A project document path is a recommendation: read the `.agents/docs.md` index, use the recommended path or an indexed equivalent (`Equivalent to docs/{topic}.md` in the Scope cell), and **if** the index or a document is missing, empty or still the starter, warn and continue from repository evidence. Outcomes: `added` (a named reference or section was added), `retained` (the source already cited it), `corrected` (an inappropriate or silent-skip reference was fixed) and `not-applicable` (no project document applies, with the reason). Each producing prompt writes gaps as `jsonl` records under `## Documentation Warnings`, and `bkit workflows summary` lists the current run's records once per topic and gap without changing the verdict. `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` checks that every source has a record.
+
+<!-- prettier-ignore -->
+| Source | Recommended documents | Outcome | Applicability and reason |
+| --- | --- | --- | --- |
+| `.bkit/core/.agents/rules.md` § New files | `docs/architecture.md` | retained | Places new files per the architecture document when present; a missing or starter-only document warns and the nearest structure applies. |
+| `.bkit/core/.agents/rules.md` § UI design | `docs/design.md` | retained | Applies when the change touches UI; warns and follows existing UI conventions when the document is missing. |
+| `.bkit/core/.agents/rules.md` § Explicit logging | `docs/observability.md` | retained | Applies to logging changes; warns and follows existing logging conventions when the document is missing. |
+| `.bkit/core/.agents/rules.md` § CI and deployments | `docs/deployments.md` | retained | Pushes, tags and CI behaviour point at the deployments document; the managed guides carry the bkit mechanics. |
+| `.bkit/core/.agents/rules.md` § Server-side validation, security and schema | `docs/security.md`, `docs/data-schema.md` | retained | Boundary notes name the security and schema documents; applicability follows the changed surface. |
+| `.bkit/core/.agents/rules.md` § Testing | `docs/testing.md` | retained | Tier rules and file inventory point at the testing document; `Tests discriminate` and `Test-first` stay in force without it. |
+| `.bkit/core/.agents/rules.md` § all other rules | n/a | not-applicable | Ledger, git, tracker, authoring and tool rules govern bkit operations and have no project-document topic. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Pre-Flight / Dependencies | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md`, `docs/deployments.md`, `docs/design.md`, `docs/observability.md`, `docs/data-schema.md` | added | Core and Conditional items name each document, with the warn-and-continue rule. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Consultation | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md` | added | New section records topic, applicability, source used, coverage, gap and action for every plan. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Warnings | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | New section holds the structured warning records that the workflow summary aggregates. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Data Schema Integration | `docs/data-schema.md` | retained | Reads and writes of the schema document stay explicit; absent schema documents warn through the consultation table. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Updates | `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/testing.md`, `docs/observability.md` | retained | Lists the documents a change touches; the runbook carries each as an UPDATE line. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Agent Execution Runbook | `docs/architecture.md`, `docs/testing.md` | added | Tasks that touch an assessed topic carry READ and UPDATE lines for its document. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Verification Plan | `docs/testing.md`, `docs/observability.md` | retained | Gate items verify tests and logging against the named documents. |
+| `.bkit/core/docs/templates/bkit-plan.md` § all other sections | n/a | not-applicable | Context, scenario, matrix, scope and rollback sections describe the change itself and cite no project document. |
+| `.bkit/core/workflows/bkit-design.md` § Step 3 Grill and Step 5 Generate Design | `docs/architecture.md`, `docs/technology.md`, `docs/security.md` | added | A design needs no plan: the generator reads the index, consults the documents and records warnings. |
+| `.bkit/core/workflows/bkit-design.md` § Step 10 Summary | `docs/architecture.md` | added | The summary carries Documentation Warnings from the run unchanged. |
+| `.bkit/core/workflows/bkit-design.md` § all other steps | n/a | not-applicable | Worktree, review, spike, organise and close steps handle files and verdicts, not project facts. |
+| `.bkit/core/workflows/bkit-plan.md` § Step 3 Generate Plan | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Plan generation fills Documentation Consultation and Documentation Warnings. |
+| `.bkit/core/workflows/bkit-plan.md` § Step 7 Summary | `docs/testing.md` | added | Summary shows attributed warnings once per topic and gap, advisory only. |
+| `.bkit/core/workflows/bkit-plan.md` § all other steps | n/a | not-applicable | Start, fetch, review, apply and close steps move artifacts; reviewers consult through their prompts. |
+| `.bkit/core/workflows/bkit-build.md` § Step 4 Plan Convert | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Issue-to-plan conversion carries the same consultation contract as generation. |
+| `.bkit/core/workflows/bkit-build.md` § Step 15 Summary | `docs/testing.md` | added | Summary carries warnings from the applicable tasks without changing the verdict. |
+| `.bkit/core/workflows/bkit-build.md` § all other steps | n/a | not-applicable | Group loop, tests, diagnosis and PR steps follow the plan; task prompts consult their documents. |
+| `.bkit/core/workflows/bkit-debug.md` § Step 5 Failure Reproduce | `docs/testing.md`, `docs/noise.md` | added | A debug run has no plan: subagents consult the testing and noise documents and warn when missing. |
+| `.bkit/core/workflows/bkit-debug.md` § Step 10 Summary | `docs/testing.md` | added | Summary and handover keep unresolved warnings. |
+| `.bkit/core/workflows/bkit-debug.md` § all other steps | n/a | not-applicable | Run-tests, context, push and close steps are mechanical and read no project document. |
+| `.bkit/core/workflows/bkit-ship.md` § Step 6 Update Docs and Summary | `docs/architecture.md`, `docs/deployments.md`, `docs/testing.md` | added | Documentation maintenance findings stay in the ship summary next to the edits. |
+| `.bkit/core/workflows/bkit-ship.md` § all other steps | n/a | not-applicable | Verify, integrate, merge and update steps handle git and CI state, not project facts. |
+| `.bkit/core/workflows/bkit-auto.md` § Step 2 Dispatch | n/a | not-applicable | Dispatch only routes to a phase; it forwards the phase summary and its warnings unchanged. |
+
 ## Test and release mechanics
 
 These mechanics belong to bkit, so they live in this managed guide and do not depend on the project adopting `docs/testing.md` or `docs/deployments.md`. The project's own choices (its tiers, lanes, rollback and deploy decisions) go in those documents, copied from `.bkit/templates/docs/`. Test-first, `bkit:test:file`, `bkit:lint:file` and the JUnit failure count are described in § Local gate scripts and § Test-first above, and the wrapper script is in `.bkit/templates.md` § Local test sleep prevention.
diff --git a/.bkit/core/docs/templates/bkit-audit-adoption.md b/.bkit/core/docs/templates/bkit-audit-adoption.md
index 4becc3db8..c21a8b530 100644
--- a/.bkit/core/docs/templates/bkit-audit-adoption.md
+++ b/.bkit/core/docs/templates/bkit-audit-adoption.md
@@ -28,10 +28,10 @@ bkit ships three folders. A file's path inside its folder is the path it lands a

<!-- prettier-ignore -->
 | Package folder | Install does | Repo gets |
 | --- | --- | --- |
 | `.bkit/core/` | Writes its files and keeps them current. It never writes `engine/`, `workflows/` or `prompts/` as they are: workflows and prompts render to host agent and command copies | Whole files, managed blocks, hooks, reference docs in `.bkit/`, audit and plan templates |
-| `.bkit/shared/` | Writes its files and keeps them current | bkit blocks and keys inside files you also edit (`docs/*.md`, `.gitignore`, settings, tool-server config) |
+| `.bkit/shared/` | Writes its files and keeps them current | bkit blocks and keys inside files you also edit (`.agents/docs.md`, `.gitignore`, settings, tool-server config) |
 | `.bkit/templates/` | Never writes them into the repo. It keeps a raw copy at `.bkit/templates/`, and `bkit upgrade` lists the changed paths | Nothing until you copy one and own it |
 
-`bkit check` proves that the written files match the package. Nothing proves the rest: a template never copied, a copy whose tool never runs, a written doc that holds only bkit's block, or a shipped audit never run. The failure this audit targets is a shipped piece that would have caught something but sits unused or half-wired, while every check stays green. Examples: `.husky/pre-push` was never copied, so tests run only in CI; `.lintstagedrc.json` was copied, but `pre-commit` never calls lint-staged; `{{NODE_VERSION}}` was left raw in `bkit-ci.yml`; `bkit-cloud.yml` waits on a workflow name that no longer exists; `docs/security.md` holds bkit's block and nothing else; `bkit-audit-security` was never run; or the install is three releases behind, with hand edits inside managed blocks.
+`bkit check` proves that the written files match the package. Nothing proves the rest: a template never copied, a copy whose tool never runs, a project document (`docs/*.md`) never copied from its starter or left as the untouched starter, or a shipped audit never run. The failure this audit targets is a shipped piece that would have caught something but sits unused or half-wired, while every check stays green. Examples: `.husky/pre-push` was never copied, so tests run only in CI; `.lintstagedrc.json` was copied, but `pre-commit` never calls lint-staged; `{{NODE_VERSION}}` was left raw in `bkit-ci.yml`; `bkit-cloud.yml` waits on a workflow name that no longer exists; `docs/security.md` is still the starter text, or the document exists but `Project Documents` does not list it; `bkit-audit-security` was never run; or the install is three releases behind, with hand edits inside managed blocks.
 
 **Applies when:** `.bkit/version` is present. **If** it is absent → write one `N/A` row with its evidence, and never report the surface as "clean".
 
@@ -98,7 +98,25 @@ bkit ships three folders. A file's path inside its folder is the path it lands a
 - [ ] **Step 3 — Version:** Compare `pinnedVersion`, the installed package and the registry latest. **If** pinned != installed → the package was bumped without `bkit upgrade`. **If** the repo is behind → record the release count, the release-note changes that touch this repo, and the template paths changed since the pinned version. **Done when:** `Version` names all three versions and every relevant release-note change.
 - [ ] **Step 4 — Check and Doctor:** Run `bkit check`, and record its exit code and the cause of each drift line. Run `bkit doctor`, and mark each advisory adopt, reject (saying why) or not applicable. Carry the previous report's rejects forward, and re-raise one only when the advisory text changed. **Done when:** `Check and Doctor` holds one row per drift line and per advisory.
 - [ ] **Step 5 — Hosts:** Compare the agent hosts in use with the bkit hosts installed. Find the hosts in use from the repo's config directories and from team use. Use the `Hosts` section of the newest `bkit-audit-agents` report as a cross-check, not as the source. For each installed host, check for one agent copy per `core/prompts/` source, one command copy per `core/workflows/` source, and every `core/` hook file present, executable and wired in that host's settings. Record these as findings: a host in use with no bkit install, because agents there run without bkit gates; a missing or extra copy; and a hook file present but unwired, or wired but absent. Whether hooks fire and agree across hosts goes to `bkit-audit-agents`. **Done when:** `Hosts` holds one row per host: in use · installed · agent copies · command copies · hooks wired.
-- [ ] **Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`. **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file: block untouched · your part present · verdict.
+- [ ] **Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`, topic by topic:
+  - **Presence:** a relevant topic with no file (absent or missing) is a finding. An indexed equivalent document counts (`Equivalent to docs/{topic}.md` in its Scope cell).
+  - **Index accuracy:** a file with no row, and a row with no file, are findings.
+  - **Content:** an empty file, or a file that still matches its starter, is a finding; a file that differs is a candidate for assessment, never proof of coverage. A topic that does not apply (no UI, no database) is irrelevant and recorded as not applicable with the reason.
+  - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never mark the surface adopted.
+  - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+
+    ```jsonl
+    {
+      "topic": "testing",
+      "gap": "starter-only",
+      "recommendedPath": "docs/testing.md",
+      "alternativeEvidence": "CI lanes are defined in the bkit CI workflow.",
+      "action": "Populate the testing document with the project's tiers and lanes."
+    }
+    ```
+
+  **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file and per project document topic: block untouched · your part present · state (populated, starter-only, empty, absent or not applicable) · verdict.
+
 - [ ] **Step 7 — Audits:** For each `docs/templates/bkit-audit-*.md`, record whether its `**Applies when:**` is met, yes or no, with evidence; its `**Cadence:**`; and its newest report under `docs/audits/` by commit date. An audit never run is due, by the same rule as `bkit-utility-update-roadmap`. An `N/A` report with evidence counts as a run. Record these as findings: an audit that applies and was never run; an audit overdue by more than one cadence; and `Process Improvements` `Project` edits that a report proposed and that are absent from that template's `Project Instructions`. **Done when:** `Audits` holds one row per template: applies · cadence · last run · overdue by · verdict.
 - [ ] **Step 8 — Adoption:** Join each file in the package's `templates/` to `.bkit/templates.md` § Contract.
   - **If** a file is missing from the Contract → the fix is an upstream bkit doc fix.
@@ -155,6 +173,12 @@ Within a severity, list missing gates first, then unwired copies, then drift.
 
 **If** the run finds nothing → write one row: `None`.
 
+## Documentation Warnings
+
+PENDING
+
+Write `None` when the adoption check found no project-document gap; the records of Step 6 go here otherwise.
+
 ## Report
 
 ### Summary
diff --git a/.bkit/core/docs/templates/bkit-audit-database.md b/.bkit/core/docs/templates/bkit-audit-database.md
index eb784d4f7..3ef39d341 100644
--- a/.bkit/core/docs/templates/bkit-audit-database.md
+++ b/.bkit/core/docs/templates/bkit-audit-database.md
@@ -41,7 +41,7 @@ Migrations and integration tests exercise queries, but neither checks that privi
 - Platform serverless connection guidance.
 - DB routine-maintenance docs, edition = hosted major (e.g., PostgreSQL Routine Database Maintenance Tasks).
 - Safe-migration rule set (e.g., Squawk); record version.
-- bkit block of `docs/setup.md` (bkit version from `.bkit/version`): Rules
+- The project's `docs/setup.md` (local database setup and reset) and `docs/data-schema.md` (documented schema), when present; a missing or starter-only document is a warning, not a stop.
 
 ### Scope
 
diff --git a/.bkit/core/docs/templates/bkit-audit-documentation.md b/.bkit/core/docs/templates/bkit-audit-documentation.md
index 9f28a0aa0..94f973663 100644
--- a/.bkit/core/docs/templates/bkit-audit-documentation.md
+++ b/.bkit/core/docs/templates/bkit-audit-documentation.md
@@ -88,7 +88,26 @@ The failure this audit targets is a claim the code has left behind. Examples: a
 
 - [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
 - [ ] **Step 2 — Scope:** **If** there are no live docs → write one `N/A` row with evidence, then **STOP**. Otherwise take every live doc, and rank them by drift: for each live doc, count the commits to the repo paths it cites since the doc last changed, and add a column for the cited paths that no longer resolve. Record the ranking. Start from an up-to-date default branch with a clean `git status`. Historical records are citers. A pointer in one that leads nowhere is a finding, fixed at the target. A stale fact inside one is history, not a defect. **Done when:** `Scope` holds every live doc and the drift ranking.
-- [ ] **Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. **Done when:** `Catalogue` names every mismatch, and every clean check.
+- [ ] **Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. Then check the project's own documentation, topic by topic, for the ten recommended documents (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) and `docs/components.md` when the project has shared UI components:
+  - **Presence:** a topic the project needs with no file (absent or missing) is a finding. An equivalent document counts when its `Project Documents` row names the recommended path in its Scope cell (`Equivalent to docs/{topic}.md`).
+  - **Index accuracy:** a present file with no `Project Documents` row, and a row whose file is missing, are findings.
+  - **Project content:** compare each file with `.bkit/templates/docs/{topic}.md`. An empty file or one that still matches the starter is a finding. A file that differs is a candidate: read it against the code and name the undercovered topics. Never call a topic covered from a mechanical comparison alone.
+  - **Not applicable:** a topic the project does not need (for example `docs/design.md` for a project with no UI) is irrelevant and recorded as not applicable with the reason. Absence, incomplete coverage and an irrelevant topic are three different outcomes; report each one apart.
+  - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report the surface as clean.
+  - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+
+    ```jsonl
+    {
+      "topic": "security",
+      "gap": "starter-only",
+      "recommendedPath": "docs/security.md",
+      "alternativeEvidence": "The CI configuration defines token permissions.",
+      "action": "Populate the security document with the project's credential and permission boundaries."
+    }
+    ```
+
+  **Done when:** `Catalogue` names every mismatch and every clean check, and `Project Documentation` holds one row per topic: path, state (populated, starter-only, empty, absent or not applicable), index accuracy and evidence.
+
 - [ ] **Step 4 — Mechanical:** Run prose lint, the format check and the managed-block check. Then:
   - Check that every backticked repo path in a live doc exists, and that every `*.md` name in a live doc resolves, backticked or not. The output is candidates. A path named on purpose as removed is not a finding. A path that moved is a finding. Section anchors and `file:line` wait for `Claims`.
   - Check relative links and heading anchors offline across every doc, plans and archive included, because they are citers. Then check external URLs in live docs, with a cache. The anchor builder must match the host (e.g., GitHub). Open a failed fragment before calling it broken. The path check cannot see Markdown links.
@@ -190,6 +209,12 @@ Within a severity, list destructive steps and contradictions first.
 
 **If** the run finds nothing → write one row: `None`.
 
+## Documentation Warnings
+
+PENDING
+
+**If** every topic is covered and indexed → write `None`; Step 3's records belong in this section.
+
 ## Report
 
 ### Summary
@@ -208,6 +233,10 @@ PENDING
 
 PENDING
 
+### Project Documentation
+
+PENDING
+
 ### Mechanical
 
 PENDING
@@ -278,6 +307,7 @@ PENDING
 ### 🔒 Gate 3: Report Check
 
 - [ ] **No placeholders:** no `PENDING` is left.
+- [ ] **Project documents:** `Project Documentation` has a row for every topic, and no absent, starter-only or undercovered topic reads as clean.
 - [ ] **Summary:** `Summary` gives the count per severity.
 - [ ] **Series:** the report shows load size, and setup-walk times when the walk ran, beside the previous report's numbers, or marks the run as baseline.
 - [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
diff --git a/.bkit/core/docs/templates/bkit-plan.md b/.bkit/core/docs/templates/bkit-plan.md
index 947e69523..932240a9c 100644
--- a/.bkit/core/docs/templates/bkit-plan.md
+++ b/.bkit/core/docs/templates/bkit-plan.md
@@ -158,7 +158,7 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
 - [ ] **User Context:** access to the files is confirmed, and missing user information is requested.
 - [ ] **Project Context:** the relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows are read.
-- [ ] **Testing & Quality:** the testing strategy matches `docs/testing.md`.
+- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through the `.agents/docs.md` index (a missing or starter-only document is a warning, not a stop), and the plan's strategy matches `docs/testing.md`. Record each source in `Documentation Consultation`.
 - [ ] **Prerequisite Plans:** [the plans to finish first. **If** none → `None`.]
 
 ### Conditional
@@ -167,6 +167,7 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Schema State:** the database state is confirmed against `docs/data-schema.md`.
 - [ ] **Architecture & UI:** the topology is checked against `docs/architecture.md`, and any UI against `docs/design.md`.
 - [ ] **Observability:** logs, audit tables and traces follow `docs/observability.md`.
+- [ ] **Deployments & Setup:** release, CI and branch behaviour follows `docs/deployments.md`, and local-setup changes follow `docs/setup.md`.
 - [ ] **Notifications:** the alert or toast tier follows the notifications doc.
 
 ### 🔒 Gate 1: Prerequisites Check
@@ -179,6 +180,31 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Reuse reasons:** every `NEW` row cites its reason.
 - [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.
 
+## Documentation Consultation
+
+[Read the `.agents/docs.md` index when it exists, and consult each applicable topic's recommended document or a valid indexed equivalent. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant. A missing index, a missing or empty document, or a starter-only document is a warning: continue from repository evidence, and never stop the plan. Mark an irrelevant topic not applicable with the reason. Initially set to `PENDING`.]
+
+<!-- prettier-ignore -->
+| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
+| --- | --- | --- | --- | --- | --- |
+| [architecture] | `docs/architecture.md` | [yes / no — reason] | [the path and section actually read, or `none`] | [covered / partial / none] | [the gap, the alternative evidence, the action. **If** none → `None`.] |
+
+Carry each required read and each doc update into the runbook task that needs it (`READ:` and `UPDATE:` lines).
+
+## Documentation Warnings
+
+[One JSON object per line in a fenced `jsonl` block, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`, all non-empty (`"None available"` when no alternative evidence exists). **If** every applicable topic is covered → write `None`. A warning never blocks the plan. Initially set to `PENDING`.]
+
+```jsonl
+{
+  "topic": "security",
+  "gap": "starter-only",
+  "recommendedPath": "docs/security.md",
+  "alternativeEvidence": "The CI configuration defines token permissions.",
+  "action": "Populate the security document with the project's credential and permission boundaries."
+}
+```
+
 ## Data Schema Integration
 
 [How this feature uses the existing schema, and what changes. Initially set to `PENDING`.]
diff --git a/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts b/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
index 9932dee4e..d9a34ed12 100644
--- a/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
+++ b/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
@@ -191,3 +191,234 @@ describe("seeded config templates carry no internal identifiers or history prose
     });
   }
 });
+
+// ---------------------------------------------------------------------------
+// Documentation responsibility coverage and warning contracts
+// ---------------------------------------------------------------------------
+
+const TOPICS = [
+  "architecture",
+  "technology",
+  "security",
+  "data-schema",
+  "testing",
+  "deployments",
+  "observability",
+  "design",
+  "noise",
+  "setup",
+] as const;
+const TOPIC_PATH = new RegExp(`docs/(?:${TOPICS.join("|")}|components)\\.md`);
+const OUTCOMES = ["added", "retained", "corrected", "not-applicable"] as const;
+const COVERAGE_HEADING = "## Documentation Consultation Coverage";
+const WARNING_HEADING = "## Documentation Warnings";
+const WARNING_FIELDS = ["topic", "gap", "recommendedPath", "alternativeEvidence", "action"];
+
+const readRepo = (rel: string): string => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
+
+const mdIn = (dir: string, prefix: string): string[] =>
+  fs
+    .readdirSync(path.join(REPO_ROOT, dir))
+    .filter((f) => f.endsWith(".md"))
+    .sort()
+    .map((f) => `${prefix}${f}`);
+
+/** The table rows (cells) under a `## ` heading of `text`, header and divider rows dropped. */
+function tableRowsUnder(text: string, heading: string): string[][] {
+  const lines = text.split("\n");
+  const start = lines.findIndex((l) => l.trim() === heading);
+  if (start < 0) return [];
+  const rows: string[][] = [];
+  for (const line of lines.slice(start + 1)) {
+    if (/^## /.test(line)) break;
+    if (!line.trim().startsWith("|")) continue;
+    const cells = line
+      .trim()
+      .replace(/^\||\|$/g, "")
+      .split("|")
+      .map((c) => c.trim());
+    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue;
+    rows.push(cells);
+  }
+  return rows.slice(1); // header row
+}
+
+/** Responsibility sources and the catalog that records their coverage. */
+const WORKFLOW_SOURCES = [
+  ".bkit/core/.agents/rules.md",
+  ".bkit/core/docs/templates/bkit-plan.md",
+  ...mdIn(".bkit/core/workflows", ".bkit/core/workflows/"),
+];
+const PROMPT_SOURCES = [
+  ...mdIn(".bkit/core/prompts", ".bkit/core/prompts/"),
+  ...mdIn(".bkit/core/docs/templates", ".bkit/core/docs/templates/").filter((f) =>
+    path.posix.basename(f).startsWith("bkit-audit-"),
+  ),
+];
+
+/** Problems with the coverage records of `sources` in `catalog`. */
+function coverageProblems(catalog: string, sources: string[]): string[] {
+  const rows = tableRowsUnder(readRepo(catalog), COVERAGE_HEADING);
+  const problems: string[] = [];
+  if (rows.length === 0) return [`${catalog}: no table under "${COVERAGE_HEADING}"`];
+  for (const source of sources) {
+    const mine = rows.filter((r) => (r[0] ?? "").includes(path.posix.basename(source)));
+    if (mine.length === 0) {
+      problems.push(`${catalog}: no coverage record for ${source}`);
+      continue;
+    }
+    for (const r of mine) {
+      const [, docs = "", outcome = "", reason = ""] = r;
+      if (!(OUTCOMES as readonly string[]).includes(outcome.toLowerCase()))
+        problems.push(
+          `${catalog}: ${source}: outcome "${outcome}" is not one of ${OUTCOMES.join("|")}`,
+        );
+      if (reason.length < 10)
+        problems.push(`${catalog}: ${source}: reason or applicability missing`);
+      if (outcome.toLowerCase() !== "not-applicable" && !TOPIC_PATH.test(docs))
+        problems.push(
+          `${catalog}: ${source}: ${outcome} record names no recommended project doc path`,
+        );
+    }
+  }
+  return problems;
+}
+
+/** Sources that must cite these named docs in their own text. */
+const REQUIRED_NAMED: Record<string, string[]> = {
+  ".bkit/core/prompts/bkit-plan-generate.md": [
+    "docs/architecture.md",
+    "docs/technology.md",
+    "docs/security.md",
+    "docs/testing.md",
+  ],
+  ".bkit/core/prompts/bkit-build-plan-convert.md": [
+    "docs/architecture.md",
+    "docs/technology.md",
+    "docs/security.md",
+    "docs/testing.md",
+  ],
+  ".bkit/core/docs/templates/bkit-plan.md": [
+    "docs/architecture.md",
+    "docs/technology.md",
+    "docs/security.md",
+    "docs/testing.md",
+    "docs/data-schema.md",
+    "docs/design.md",
+    "docs/observability.md",
+    "docs/deployments.md",
+  ],
+  ".bkit/core/workflows/bkit-design.md": ["docs/architecture.md"],
+  ".bkit/core/workflows/bkit-debug.md": ["docs/testing.md", "docs/noise.md"],
+  ".bkit/core/prompts/bkit-audit-generate.md": ["docs/architecture.md"],
+};
+
+function missingNamedRefs(): string[] {
+  return Object.entries(REQUIRED_NAMED).flatMap(([rel, refs]) => {
+    const text = readRepo(rel);
+    return refs.filter((r) => !text.includes(r)).map((r) => `${rel}: no reference to ${r}`);
+  });
+}
+
+describe("documentation responsibility inventory", () => {
+  it("covers the full documentation responsibility inventory", () => {
+    // The inventory itself is not vacuous.
+    expect(WORKFLOW_SOURCES).toContain(".bkit/core/workflows/bkit-debug.md");
+    expect(PROMPT_SOURCES).toContain(".bkit/core/prompts/bkit-plan-generate.md");
+    expect(PROMPT_SOURCES).toContain(".bkit/core/docs/templates/bkit-audit-adoption.md");
+    expect(PROMPT_SOURCES.length).toBeGreaterThan(40);
+
+    // Every starter the records point at ships from the relocated location.
+    const starters = fs.readdirSync(path.join(REPO_ROOT, ".bkit/templates/docs"));
+    expect(TOPICS.filter((t) => !starters.includes(`${t}.md`))).toEqual([]);
+
+    expect(coverageProblems(".bkit/core/.bkit/workflows.md", WORKFLOW_SOURCES)).toEqual([]);
+    expect(coverageProblems(".bkit/core/.bkit/prompts.md", PROMPT_SOURCES)).toEqual([]);
+    expect(missingNamedRefs()).toEqual([]);
+  });
+});
+
+/** Prompts and templates that produce a report with documentation gaps. */
+const WARNING_PRODUCERS = [
+  ".bkit/core/prompts/bkit-plan-generate.md",
+  ".bkit/core/prompts/bkit-build-plan-convert.md",
+  ".bkit/core/prompts/bkit-plan-update.md",
+  ".bkit/core/prompts/bkit-audit-generate.md",
+  ".bkit/core/prompts/bkit-utility-update-documentation.md",
+  ".bkit/core/prompts/bkit-ship-update-docs.md",
+  ".bkit/core/docs/templates/bkit-audit-documentation.md",
+  ".bkit/core/docs/templates/bkit-audit-adoption.md",
+];
+
+/** Workflows that carry the producers' warnings through their summary or return. */
+const WARNING_CARRIERS = [
+  "bkit-design",
+  "bkit-plan",
+  "bkit-build",
+  "bkit-debug",
+  "bkit-ship",
+  "bkit-auto",
+].map((n) => `.bkit/core/workflows/${n}.md`);
+
+/** Maintenance and audit sources that must check presence, the index and project content. */
+const MAINTENANCE = [
+  ".bkit/core/prompts/bkit-utility-update-documentation.md",
+  ".bkit/core/prompts/bkit-ship-update-docs.md",
+  ".bkit/core/docs/templates/bkit-audit-documentation.md",
+  ".bkit/core/docs/templates/bkit-audit-adoption.md",
+];
+
+function contractProblems(): string[] {
+  const problems: string[] = [];
+  for (const rel of WARNING_PRODUCERS) {
+    const text = readRepo(rel);
+    if (!text.includes(WARNING_HEADING)) problems.push(`${rel}: no "${WARNING_HEADING}" section`);
+    if (!text.includes("```jsonl")) problems.push(`${rel}: no jsonl warning record`);
+    for (const f of WARNING_FIELDS)
+      if (!text.includes(f)) problems.push(`${rel}: warning record lacks field ${f}`);
+    if (!/continue/i.test(text) || !/warn/i.test(text))
+      problems.push(`${rel}: no warn-and-continue behaviour`);
+  }
+  const plan = readRepo(".bkit/core/docs/templates/bkit-plan.md");
+  for (const heading of ["## Documentation Consultation", WARNING_HEADING])
+    if (!plan.includes(heading)) problems.push(`bkit-plan.md template: no "${heading}"`);
+  for (const rel of WARNING_CARRIERS)
+    if (!readRepo(rel).includes("Documentation Warnings"))
+      problems.push(`${rel}: does not carry Documentation Warnings`);
+  for (const rel of MAINTENANCE) {
+    const text = readRepo(rel);
+    if (/\.bkit\/shared\/docs/.test(text)) problems.push(`${rel}: probes the old shared docs`);
+    for (const [label, re] of [
+      ["presence (absent or missing documents)", /\b(absent|missing)\b/i],
+      ["index accuracy", /\bindex\b/i],
+      ["starter-only content", /starter/i],
+      ["a topic that does not apply", /not[- ]applicable|irrelevant/i],
+    ] as const)
+      if (!re.test(text)) problems.push(`${rel}: does not check ${label}`);
+  }
+  return problems;
+}
+
+/** Project documents that bkit must not manage: any managed starter, row or manifest entry. */
+function managedStarterProblems(): string[] {
+  const problems: string[] = [];
+  if (fs.existsSync(path.join(REPO_ROOT, ".bkit/shared/docs")))
+    problems.push(".bkit/shared/docs still exists");
+  const manifest = readRepo(".bkit/core/engine/install/manifest.ts");
+  for (const t of TOPICS)
+    if (manifest.includes(`"docs/${t}.md"`) || manifest.includes(`.bkit/shared/docs/${t}.md`))
+      problems.push(`manifest.ts manages docs/${t}.md`);
+  const index = readRepo(".bkit/core/.agents/docs.md");
+  const managed = index.slice(0, index.indexOf("<!-- bkit:end -->"));
+  for (const t of TOPICS)
+    if (managed.includes(`| \`docs/${t}.md\``))
+      problems.push(`.agents/docs.md managed block has a row for docs/${t}.md`);
+  return problems;
+}
+
+describe("documentation warning contracts", () => {
+  it("ships documentation warning contracts for plan and no-plan paths", () => {
+    expect(contractProblems()).toEqual([]);
+    expect(managedStarterProblems()).toEqual([]);
+  });
+});
diff --git a/.bkit/core/engine/audits/templates/template-shape.test.ts b/.bkit/core/engine/audits/templates/template-shape.test.ts
index 5ae3640e0..bb6620cbe 100644
--- a/.bkit/core/engine/audits/templates/template-shape.test.ts
+++ b/.bkit/core/engine/audits/templates/template-shape.test.ts
@@ -75,6 +75,8 @@ const PLAN_HEADINGS = [
   "### Core",
   "### Conditional",
   "### 🔒 Gate 1: Prerequisites Check",
+  "## Documentation Consultation",
+  "## Documentation Warnings",
   "## Data Schema Integration",
   "### Data Schema Usage",
   "### Data Schema Changes",
diff --git a/.bkit/core/engine/checks/after/index.test.ts b/.bkit/core/engine/checks/after/index.test.ts
index a8051cc69..2eea98424 100644
--- a/.bkit/core/engine/checks/after/index.test.ts
+++ b/.bkit/core/engine/checks/after/index.test.ts
@@ -995,3 +995,46 @@ describe("formatChecklist format contract", () => {
     expect(banner).toContain("--- 1/1 [advisory] single ---");
   });
 });
+
+// ---------------------------------------------------------------------------
+// Project documentation advisories through the shared pipeline
+// ---------------------------------------------------------------------------
+
+describe("project documentation advisories", () => {
+  it("reports and suppresses project documentation advisories without a blocker", () => {
+    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "root" }));
+
+    // Reported: an empty repo has no project documents and no index.
+    const reported = runPostInstallCheck([], tmpDir);
+    const docFindings = reported.filter((f) => f.id.startsWith("project-docs-"));
+    expect(docFindings.map((f) => f.id)).toEqual(
+      expect.arrayContaining(["project-docs-index-missing", "project-docs-missing"]),
+    );
+    expect(docFindings.every((f) => f.severity === "advisory")).toBe(true);
+    expect(reported.filter((f) => f.severity === "blocker").map((f) => f.id)).not.toContain(
+      "project-docs-missing",
+    );
+
+    // Rendered through the shared checklist and advisories artifact.
+    const checklist = formatChecklist(reported);
+    expect(checklist).toContain("[advisory] project-docs-missing");
+    expect(checklist).toContain("docs/architecture.md");
+    const md = renderAdvisoriesMarkdown(reported, { mode: "install", version: "2.2.0" });
+    expect(md).toContain("project-docs-missing");
+
+    // Suppressed: the existing bkit.advisories.ignore control drops the id and reports it.
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({
+        name: "root",
+        bkit: { advisories: { ignore: ["project-docs-missing"] } },
+      }),
+    );
+    const suppressed: SuppressionNote[] = [];
+    const after = runPostInstallCheck([], tmpDir, suppressed);
+    expect(after.some((f) => f.id === "project-docs-missing")).toBe(false);
+    expect(after.some((f) => f.id === "project-docs-index-missing")).toBe(true);
+    expect(suppressed).toContainEqual({ id: "project-docs-missing", scope: "." });
+    expect(formatChecklist(after, suppressed)).toContain("- project-docs-missing (.)");
+  });
+});
diff --git a/.bkit/core/engine/checks/after/index.ts b/.bkit/core/engine/checks/after/index.ts
index e637cd292..4779843ea 100644
--- a/.bkit/core/engine/checks/after/index.ts
+++ b/.bkit/core/engine/checks/after/index.ts
@@ -28,6 +28,7 @@ import {
 import {
   buildDepUpdaterSetupAdvisory,
   detectBkitStubs,
+  detectProjectDocs,
   detectValeMissing,
   detectValePackageNotSynced,
   detectWorkflowLintToolsMissing,
@@ -472,6 +473,9 @@ export function runPostInstallCheck(
   // bkit-stub sentinels in shipped templates — one advisory per still-commented stub.
   for (const stub of detectBkitStubs(cwd)) phase3.push(stub);
 
+  // Project documents (docs/*.md): missing, empty, starter-only or unindexed. Advisory only.
+  for (const f of detectProjectDocs(cwd, onSuppressed)) phase3.push(f);
+
   // turbo.json inputs for cache-replay safety (KN-24).
   for (const f of detectTurboIntegrationInputs(cwd)) phase3.push(f);
 
diff --git a/.bkit/core/engine/checks/after/tools.test.ts b/.bkit/core/engine/checks/after/tools.test.ts
index 513c3bab9..0a51c5b2d 100644
--- a/.bkit/core/engine/checks/after/tools.test.ts
+++ b/.bkit/core/engine/checks/after/tools.test.ts
@@ -10,7 +10,9 @@ import {
   detectWorkflowLintToolsMissing,
   detectBkitStubs,
   buildDepUpdaterSetupAdvisory,
+  detectProjectDocs,
 } from "./tools";
+import { LEGACY_STARTER_SOURCE_REVISION } from "../../install/project-docs";
 
 // ---------------------------------------------------------------------------
 // Module-level mock for node:child_process
@@ -413,3 +415,175 @@ describe("detectWorkflowLintToolsMissing", () => {
     expect(f?.detect).toContain("actionlint");
   });
 });
+
+// ---------------------------------------------------------------------------
+// detectProjectDocs — adoption and population advisories for the project documents
+// ---------------------------------------------------------------------------
+
+const STARTER_DIR = path.resolve(__dirname, "../../../../templates/docs");
+
+const INDEX_HEAD =
+  "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n" +
+  "| Doc | Design | Plan | Build | Debug | Ship | Scope |\n| --- | --- | --- | --- | --- | --- | --- |\n";
+
+function writeIndex(rows: Array<{ doc: string; scope?: string }>): void {
+  fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
+  const body = rows
+    .map((r) => `| \`${r.doc}\` | ○ | ○ | ○ | ○ | ○ | ${r.scope ?? "Project doc."} |\n`)
+    .join("");
+  fs.writeFileSync(path.join(tmpDir, ".agents", "docs.md"), INDEX_HEAD + body);
+}
+
+function writeDoc(rel: string, text: string): void {
+  const abs = path.join(tmpDir, rel);
+  fs.mkdirSync(path.dirname(abs), { recursive: true });
+  fs.writeFileSync(abs, text);
+}
+
+const POPULATED =
+  "# Security\n\nAuth uses session cookies issued by the api service; rate limits live in the edge proxy.\n" +
+  "Secrets come from the host secret store and never reach the repo.\n";
+
+function stripLegacyWrapper(text: string): string {
+  return text
+    .split("\n")
+    .filter(
+      (l) =>
+        l !== "<!-- bkit:start -->" &&
+        l !== "<!-- bkit:end -->" &&
+        !l.startsWith("<!-- bkit:managed"),
+    )
+    .join("\n");
+}
+
+function allText(findings: Array<{ detect: string; action: string }>): string {
+  return findings.map((f) => `${f.detect}\n${f.action}`).join("\n");
+}
+
+describe("detectProjectDocs", () => {
+  it("distinguishes missing and empty project documentation from populated candidates", () => {
+    writeDoc("docs/security.md", POPULATED);
+    writeDoc("docs/testing.md", "   \n\n");
+    writeDoc("docs/setup.md", "");
+    writeIndex([{ doc: "docs/security.md" }, { doc: "docs/testing.md" }, { doc: "docs/setup.md" }]);
+
+    const findings = detectProjectDocs(tmpDir);
+
+    // Every finding is an advisory with a detect and an action, never a blocker.
+    expect(findings.length).toBeGreaterThan(0);
+    for (const f of findings) {
+      expect(f.severity).toBe("advisory");
+      expect(f.id).toMatch(/^project-docs-/);
+      expect(f.detect.length).toBeGreaterThan(0);
+      expect(f.action.length).toBeGreaterThan(0);
+    }
+
+    const missing = findings.find((f) => f.id === "project-docs-missing");
+    expect(missing).toBeDefined();
+    expect(missing!.detect).toContain("docs/architecture.md");
+    expect(missing!.detect).toContain("docs/deployments.md");
+    expect(missing!.detect).not.toContain("docs/security.md");
+    expect(missing!.detect).not.toContain("docs/testing.md");
+    expect(missing!.action).toContain(".bkit/templates/docs/");
+    expect(missing!.action).toContain(".agents/docs.md");
+
+    const empty = findings.find((f) => f.id === "project-docs-empty");
+    expect(empty).toBeDefined();
+    expect(empty!.detect).toContain("docs/testing.md");
+    expect(empty!.detect).toContain("docs/setup.md");
+    expect(empty!.detect).not.toContain("docs/security.md");
+
+    // The populated, indexed document is named by no finding.
+    expect(allText(findings)).not.toContain("docs/security.md");
+    // No claim that populated content is semantically complete.
+    expect(allText(findings).toLowerCase()).not.toContain("complete");
+    expect(findings.some((f) => f.id === "project-docs-index-missing")).toBe(false);
+  });
+
+  it("recognizes current and migrated untouched starters", async () => {
+    const starter = fs.readFileSync(path.join(STARTER_DIR, "architecture.md"), "utf-8");
+    // Current starter copied verbatim; a lightly edited placeholder-only copy of another starter.
+    writeDoc("docs/architecture.md", starter);
+    const techStarter = fs.readFileSync(path.join(STARTER_DIR, "technology.md"), "utf-8");
+    writeDoc("docs/technology.md", `${techStarter}\n\n\n`);
+    // A project that really wrote its document.
+    writeDoc("docs/security.md", POPULATED);
+    writeIndex([
+      { doc: "docs/architecture.md" },
+      { doc: "docs/technology.md" },
+      { doc: "docs/security.md" },
+    ]);
+
+    const cp = await vi.importActual<typeof import("node:child_process")>("node:child_process");
+    const legacy = cp.execFileSync(
+      "git",
+      ["show", `${LEGACY_STARTER_SOURCE_REVISION}:.bkit/shared/docs/noise.md`],
+      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], cwd: originalCwd },
+    );
+    // Migrated: the ownership wrapper lines are gone, the text is the shipped legacy text.
+    const migrated = stripLegacyWrapper(legacy);
+    writeDoc("docs/noise.md", migrated);
+    writeIndex([
+      { doc: "docs/architecture.md" },
+      { doc: "docs/technology.md" },
+      { doc: "docs/security.md" },
+      { doc: "docs/noise.md" },
+    ]);
+
+    const findings = detectProjectDocs(tmpDir);
+    const unpopulated = findings.find((f) => f.id === "project-docs-unpopulated");
+    expect(unpopulated).toBeDefined();
+    expect(unpopulated!.severity).toBe("advisory");
+    expect(unpopulated!.detect).toContain("docs/architecture.md");
+    expect(unpopulated!.detect).toContain("docs/technology.md");
+    expect(unpopulated!.detect).toContain("docs/noise.md");
+    expect(unpopulated!.detect).not.toContain("docs/security.md");
+    // The action names the repair and the alternative evidence.
+    expect(unpopulated!.action).toContain("docs/architecture.md");
+    expect(unpopulated!.action.toLowerCase()).toContain("equivalent");
+    // Indexed-but-untouched still warns even though the index lists it.
+    expect(findings.some((f) => f.id === "project-docs-missing")).toBe(true);
+    expect(allText(findings)).not.toContain("docs/security.md");
+  });
+
+  it("resolves an indexed equivalent without a missing default warning", () => {
+    writeDoc("handbook/security.md", POPULATED);
+    writeDoc("handbook/ops-testing.md", POPULATED);
+    writeIndex([
+      { doc: "handbook/security.md" },
+      { doc: "handbook/ops-testing.md", scope: "Equivalent to docs/testing.md" },
+    ]);
+
+    const findings = detectProjectDocs(tmpDir);
+    const missing = findings.find((f) => f.id === "project-docs-missing");
+    expect(missing).toBeDefined();
+    expect(missing!.detect).not.toContain("docs/security.md");
+    expect(missing!.detect).not.toContain("docs/testing.md");
+    expect(missing!.detect).toContain("docs/architecture.md");
+    expect(allText(findings)).not.toContain("handbook/security.md");
+
+    // An out-of-tree target is never read: its content reaches no finding, and the finding
+    // names the unsafe path instead of calling the topic populated.
+    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
+    try {
+      fs.writeFileSync(path.join(outside, "design.md"), "OUTSIDE-SECRET-CONTENT\n".repeat(20));
+      fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
+      fs.symlinkSync(path.join(outside, "design.md"), path.join(tmpDir, "docs", "design.md"));
+      writeIndex([
+        { doc: "docs/design.md" },
+        { doc: "../escape/noise.md", scope: "Equivalent to docs/noise.md" },
+      ]);
+      const readSpy = vi.spyOn(fs, "readFileSync");
+      const again = detectProjectDocs(tmpDir);
+      const reads = readSpy.mock.calls.map((c) => String(c[0]));
+      expect(reads.some((r) => r.startsWith(outside))).toBe(false);
+      expect(allText(again)).not.toContain("OUTSIDE-SECRET-CONTENT");
+      const ambiguous = again.find((f) => f.id === "project-docs-ambiguous");
+      expect(ambiguous).toBeDefined();
+      expect(ambiguous!.detect).toContain("docs/design.md");
+      expect(ambiguous!.severity).toBe("advisory");
+    } finally {
+      fs.rmSync(outside, { recursive: true, force: true });
+    }
+  });
+});
diff --git a/.bkit/core/engine/checks/after/tools.ts b/.bkit/core/engine/checks/after/tools.ts
index 13d869c8b..5d61664a7 100644
--- a/.bkit/core/engine/checks/after/tools.ts
+++ b/.bkit/core/engine/checks/after/tools.ts
@@ -6,6 +6,21 @@ import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import type { PreflightFinding } from "../before/index.js";
 import { readPackageJson } from "../../shared/package-json.js";
+import { readTextFile } from "../../shared/json.js";
+import { getPkgRoot } from "../../shared/package-roots.js";
+import {
+  PROJECT_DOC_TOPICS,
+  PROJECT_INDEX_PATH,
+  type ProjectDocTopic,
+  findIndexedEquivalent,
+  inspectRepoFile,
+  legacyStarterTopic,
+  normalizeLegacyText,
+  projectDocPath,
+  readProjectIndex,
+  starterPath,
+} from "../../install/project-docs.js";
+import { isAdvisorySuppressed, type SuppressionReporter } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import {
   DEP_UPDATER_NAMES,
@@ -415,3 +430,158 @@ export function buildDepUpdaterSetupAdvisory(cwd: string): PreflightFinding | nu
       'Use one updater, not both, and set `bkit.dependencies.updater` to its name (`"renovate"` or `"dependabot"`) in package.json. To silence this advisory, set it to `"none"`. See .bkit/templates.md.',
   };
 }
+
+// ---------------------------------------------------------------------------
+// Project documentation adoption and population
+// ---------------------------------------------------------------------------
+
+/** Text of a topic's current starter: the package copy first, then the consumer's own copy. */
+function readStarterText(cwd: string, topic: ProjectDocTopic): string | null {
+  for (const base of [getPkgRoot(), cwd]) {
+    const read = readTextFile(path.join(base, starterPath(topic)));
+    if (read.ok) return read.text;
+  }
+  return null;
+}
+
+/** True when `rel` is a repo-relative path with no parent or absolute segments. */
+function isInTreePath(rel: string): boolean {
+  if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel)) return false;
+  return !rel.split(/[\\/]/).includes("..");
+}
+
+type DocAssessment = "empty" | "unpopulated" | "candidate";
+
+/** Mechanical read of a project document: empty, an untouched starter, or a candidate. */
+function assessDocText(cwd: string, topic: ProjectDocTopic, text: string): DocAssessment {
+  if (text.trim() === "") return "empty";
+  const normalized = normalizeLegacyText(text);
+  const legacy = legacyStarterTopic(text);
+  if (legacy === topic) return "unpopulated";
+  const starter = readStarterText(cwd, topic);
+  if (starter !== null && normalizeLegacyText(starter) === normalized) return "unpopulated";
+  // Headings, comments and rules only: nothing a project wrote.
+  const meaningful = normalized
+    .split("\n")
+    .map((l) => l.trim())
+    .filter(
+      (l) => l !== "" && !l.startsWith("#") && !/^<!--.*-->$/.test(l) && !/^[-*_|: ]+$/.test(l),
+    );
+  return meaningful.length === 0 ? "unpopulated" : "candidate";
+}
+
+/**
+ * Report the state of the ten project documents (`docs/architecture.md` ... `docs/setup.md`):
+ * the index missing, a document absent, empty, an untouched starter, present but unindexed, or
+ * unreadable. A document the index lists at another path (same basename, or a Scope cell
+ * `Equivalent to docs/<topic>.md`) counts for its topic. Findings are advisories only and read no
+ * file outside the repository. A document that differs from every starter is a candidate for
+ * the agent to assess; the mechanical read makes no claim about what it covers.
+ */
+export function detectProjectDocs(
+  cwd: string,
+  onSuppressed?: SuppressionReporter,
+): PreflightFinding[] {
+  const index = readProjectIndex(cwd);
+  const rows = index.status === "ok" ? index.rows : [];
+  const indexedPaths = new Set(rows.map((r) => r.path));
+  const missing: string[] = [];
+  const empty: string[] = [];
+  const unpopulated: string[] = [];
+  const unindexed: string[] = [];
+  const ambiguous: string[] = [];
+
+  for (const topic of PROJECT_DOC_TOPICS) {
+    const recommended = projectDocPath(topic);
+    const equivalent = findIndexedEquivalent(rows, topic);
+    const defaultState = inspectRepoFile(cwd, recommended);
+    let target = recommended;
+    if (defaultState === "absent") {
+      if (equivalent === null) {
+        missing.push(recommended);
+        continue;
+      }
+      target = equivalent;
+    }
+    if (!isInTreePath(target)) {
+      ambiguous.push(`${target} (${recommended}: it resolves outside the repository)`);
+      continue;
+    }
+    const state = target === recommended ? defaultState : inspectRepoFile(cwd, target);
+    if (state === "absent") {
+      missing.push(recommended);
+      continue;
+    }
+    if (state !== "regular") {
+      ambiguous.push(`${target} (${state.unsafe})`);
+      continue;
+    }
+    const read = readTextFile(path.join(cwd, target));
+    if (!read.ok) {
+      ambiguous.push(`${target} (it could not be read)`);
+      continue;
+    }
+    const assessed = assessDocText(cwd, topic, read.text);
+    if (assessed === "empty") empty.push(target);
+    else if (assessed === "unpopulated") unpopulated.push(target);
+    else if (index.status === "ok" && !indexedPaths.has(target)) unindexed.push(target);
+  }
+
+  const findings: PreflightFinding[] = [];
+  if (index.status === "missing") {
+    findings.push({
+      id: "project-docs-index-missing",
+      severity: "advisory",
+      detect: `${PROJECT_INDEX_PATH} is absent, so agents have no list of the project's own documents to consult.`,
+      action: `Run \`bkit install\` to write ${PROJECT_INDEX_PATH}, then add a row under \`## Project Documents\` for each project document you keep. Until then agents warn and fall back to repository evidence.`,
+    });
+  } else if (index.status === "unreadable") {
+    ambiguous.push(`${PROJECT_INDEX_PATH} (${index.reason})`);
+  }
+  if (missing.length > 0) {
+    findings.push({
+      id: "project-docs-missing",
+      severity: "advisory",
+      detect: `No project document covers: ${missing.join(", ")}.`,
+      action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply.`,
+    });
+  }
+  if (empty.length > 0) {
+    findings.push({
+      id: "project-docs-empty",
+      severity: "advisory",
+      detect: `These project documents are empty: ${empty.join(", ")}.`,
+      action: `Write the project's facts into each file, or delete it and remove its row from ${PROJECT_INDEX_PATH}. Agents cannot use an empty document.`,
+    });
+  }
+  if (unpopulated.length > 0) {
+    findings.push({
+      id: "project-docs-unpopulated",
+      severity: "advisory",
+      detect: `These project documents still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
+      action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes.`,
+    });
+  }
+  if (unindexed.length > 0) {
+    findings.push({
+      id: "project-docs-unindexed",
+      severity: "advisory",
+      detect: `These project documents exist but ${PROJECT_INDEX_PATH} does not list them: ${unindexed.join(", ")}.`,
+      action: `Add a row for each to \`## Project Documents\` in ${PROJECT_INDEX_PATH}, or run \`bkit upgrade\` to register the default paths.`,
+    });
+  }
+  if (ambiguous.length > 0) {
+    findings.push({
+      id: "project-docs-ambiguous",
+      severity: "advisory",
+      detect: `bkit did not read these project documents or the index: ${ambiguous.join("; ")}.`,
+      action: `Replace each with a regular file inside the repository (no symbolic link, no \`..\` path), or repair the \`## Project Documents\` table in ${PROJECT_INDEX_PATH}. bkit changes none of them itself.`,
+    });
+  }
+
+  return findings.filter((f) => {
+    if (!isAdvisorySuppressed(cwd, f.id, f.severity)) return true;
+    onSuppressed?.({ id: f.id, scope: "." });
+    return false;
+  });
+}
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index 2894ae4dd..16a1eb571 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -828,6 +828,96 @@ describe("buildSummary", () => {
     ]);
   });
 
+  it("consolidates documentation warnings from the active run without changing its verdict", () => {
+    const record = (r: Record<string, string>) => JSON.stringify(r);
+    const report = (...records: string[]) =>
+      [
+        "Verdict: PASS",
+        "",
+        "## Documentation Warnings",
+        "",
+        "```jsonl",
+        ...records,
+        "```",
+        "",
+      ].join("\n");
+    const sec = {
+      topic: "security",
+      gap: "starter-only",
+      recommendedPath: "docs/security.md",
+      action: "Populate the security document with credential boundaries.",
+    };
+    const files = {
+      "log/build-plan-tasks-1-log.md": report(
+        record({ ...sec, alternativeEvidence: "EVIDENCE-FROM-TASKS-AGENT" }),
+      ),
+      "log/build-plan-verify-1-1.md": report(
+        record({ ...sec, topic: "Security", alternativeEvidence: "EVIDENCE-FROM-VERIFY-AGENT" }),
+        record({
+          topic: "testing",
+          gap: "missing",
+          recommendedPath: "docs/testing.md",
+          alternativeEvidence: "None available",
+          action: "Copy the testing starter and fill in the CI lanes.",
+        }),
+        "{ this line is not json",
+        record({ topic: "design", gap: "missing" }),
+      ),
+      // Untrusted raw input carrying a warning-shaped section.
+      "log/build-input-1.md": report(
+        record({ ...sec, topic: "deployments", gap: "RAW-INPUT-GAP", alternativeEvidence: "x" }),
+      ),
+      // A file of an earlier run: not one of this run's step artifacts.
+      "log/build-plan-tasks-0-log.md": report(
+        record({ ...sec, topic: "observability", gap: "OLD-RUN-GAP", alternativeEvidence: "y" }),
+      ),
+    };
+    const rows = [
+      {
+        type: "step-done",
+        step: "build-plan-tasks",
+        verdict: "PASS",
+        artifacts: ["log/build-plan-tasks-1-log.md", "log/missing-optional.md"],
+      },
+      {
+        type: "step-done",
+        step: "build-plan-verify",
+        verdict: "PASS",
+        artifacts: ["log/build-plan-verify-1-1.md", "log/build-input-1.md"],
+      },
+    ];
+    const baseline = buildSummary(input({ rows }));
+    const s = buildSummary(input({ rows, read: reader(files) }));
+
+    // Verdict, failures and next step are untouched.
+    expect(s.verdict).toBe(baseline.verdict);
+    expect(s.failures).toBe(baseline.failures);
+    expect(s.reasons).toEqual(baseline.reasons);
+    expect(s.nextStep).toBe(baseline.nextStep);
+    expect(s.markdown.split("\n").slice(0, 3)).toEqual([
+      "Verdict: PASS",
+      "Failures: 0",
+      "<!-- verdict:end -->",
+    ]);
+
+    expect(s.markdown).toContain("## Documentation Warnings");
+    // The same topic and gap from two agents appears once, with both pieces of evidence kept.
+    expect(s.markdown.split("Populate the security document").length - 1).toBe(1);
+    expect(s.markdown).toContain("EVIDENCE-FROM-TASKS-AGENT");
+    expect(s.markdown).toContain("EVIDENCE-FROM-VERIFY-AGENT");
+    // A distinct gap stays visible.
+    expect(s.markdown).toContain("Copy the testing starter and fill in the CI lanes.");
+    expect(s.markdown).toContain("docs/testing.md");
+    // Untrusted input, earlier runs and malformed records never surface as a current gap.
+    expect(s.markdown).not.toContain("RAW-INPUT-GAP");
+    expect(s.markdown).not.toContain("OLD-RUN-GAP");
+    expect(s.markdown).not.toContain("not json");
+    expect(s.markdown).not.toContain("docs/design.md");
+
+    // No warnings in the run: no section.
+    expect(baseline.markdown).not.toContain("## Documentation Warnings");
+  });
+
   it("counts a lettered Accept decision as accepted at the Decision Pause", () => {
     const decision = [
       "Status: ASSUMED",
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index 80267a7ea..d70fd33f6 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -7,6 +7,7 @@ import { coversList, type Plan, type Workstream } from "./plans.js";
 import { issueIdOf, type FidTracker } from "./fids.js";
 import { parseDecisionItems } from "./decisions.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
+import { parseJson } from "../../shared/json.js";
 import { challengeResolution, taskVerified } from "./summary-findings.js";
 
 export const SUMMARY_WORKFLOWS = ["plan", "design", "build", "debug", "ship"] as const;
@@ -132,6 +133,71 @@ const taskGroupOf = (r: Row) => {
   return typeof taskGroup === "number" ? taskGroup : undefined;
 };
 
+/** One consolidated documentation gap: a topic and gap key, with every distinct piece of evidence and action. */
+interface DocWarning {
+  topic: string;
+  gap: string;
+  recommendedPath: string;
+  evidence: string[];
+  actions: string[];
+}
+
+const WARNING_FIELDS = [
+  "topic",
+  "gap",
+  "recommendedPath",
+  "alternativeEvidence",
+  "action",
+] as const;
+/** Raw inputs (`*-input-N.md`) are untrusted: never a source of warnings. */
+const isRawInput = (rel: string) => /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel);
+
+/**
+ * The structured records under `## Documentation Warnings` (one JSON object per line in a
+ * `jsonl` fence) of the run's own step artifacts, merged by normalised topic and gap. A missing
+ * section, a malformed line or a record without all five non-empty fields is skipped.
+ */
+function documentationWarnings(rows: Row[], read: (rel: string) => string | null): DocWarning[] {
+  const merged = new Map<string, DocWarning>();
+  const seenFiles = new Set<string>();
+  for (const row of rows) {
+    if (row.type !== "step-done") continue;
+    for (const rel of artifactsOf(row)) {
+      if (!rel.endsWith(".md") || isRawInput(rel) || seenFiles.has(rel)) continue;
+      seenFiles.add(rel);
+      const text = read(rel);
+      if (text === null) continue;
+      const section = /^## Documentation Warnings[ \t]*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(
+        text,
+      );
+      const fence = section === null ? null : /```jsonl[ \t]*\r?\n([\s\S]*?)```/.exec(section[1]!);
+      if (fence === null) continue;
+      for (const line of fence[1]!.split(/\r?\n/)) {
+        const parsed = parseJson(line);
+        if (!parsed.ok) continue;
+        const value = parsed.value;
+        if (typeof value !== "object" || value === null || Array.isArray(value)) continue;
+        const rec = value as Record<string, unknown>;
+        const fields = WARNING_FIELDS.map((f) => rec[f]);
+        if (!fields.every((f): f is string => typeof f === "string" && f.trim() !== "")) continue;
+        const [topic, gap, recommendedPath, evidence, action] = fields.map((f) => f.trim());
+        const key = `${topic!.toLowerCase()}\u0000${gap!.toLowerCase()}`;
+        const found = merged.get(key) ?? {
+          topic: topic!.toLowerCase(),
+          gap: gap!.toLowerCase(),
+          recommendedPath: recommendedPath!,
+          evidence: [],
+          actions: [],
+        };
+        if (!found.evidence.includes(evidence!)) found.evidence.push(evidence!);
+        if (!found.actions.includes(action!)) found.actions.push(action!);
+        merged.set(key, found);
+      }
+    }
+  }
+  return [...merged.values()];
+}
+
 /** The run's step rows grouped per step (and task group), in first-seen order. */
 function stepGroups(rows: Row[]): StepGroup[] {
   const groups = new Map<string, StepGroup>();
@@ -500,6 +566,17 @@ export function buildSummary(input: SummaryInput): Summary {
       ...unconfirmed.map((u) => `- ${u}`),
     );
 
+  // Documentation warnings: advisory only, never part of the verdict.
+  const docWarnings = documentationWarnings(input.rows, read);
+  if (docWarnings.length > 0) {
+    out.push("", "## Documentation Warnings", "");
+    for (const w of docWarnings) {
+      out.push(`- **${w.topic}** (${w.gap}) — \`${w.recommendedPath}\``);
+      for (const e of w.evidence) out.push(`  - Evidence: ${e}`);
+      for (const a of w.actions) out.push(`  - Action: ${a}`);
+    }
+  }
+
   // Risks and action items.
   const items: string[] = [];
   for (const g of groups) {
diff --git a/.bkit/core/engine/commands/workflow/workflows.integration.test.ts b/.bkit/core/engine/commands/workflow/workflows.integration.test.ts
new file mode 100644
index 000000000..628cc5aca
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/workflows.integration.test.ts
@@ -0,0 +1,195 @@
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
+
+import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
+
+const FID = "864-doc-warnings";
+const MONTH = "202611";
+const LOG = `docs/plans/${MONTH}/logs/${FID}`;
+const STATUS = `${LOG}/status.jsonl`;
+const SUMMARY = `${LOG}/plan-summary.md`;
+const dirs: string[] = [];
+let tick = 0;
+const at = () => new Date(Date.UTC(2026, 10, 1, 0, 0, tick++)).toISOString();
+const jsonl = (rows: object[]) => rows.map((row) => `${JSON.stringify(row)}\n`).join("");
+
+const write = (cwd: string, file: string, body: string) => {
+  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
+  fs.writeFileSync(path.join(cwd, file), body);
+};
+const read = (cwd: string, file: string) => fs.readFileSync(path.join(cwd, file), "utf8");
+
+const warning = (r: Record<string, string>) => JSON.stringify(r);
+const report = (...records: string[]) =>
+  ["Verdict: PASS", "", "## Documentation Warnings", "", "```jsonl", ...records, "```", ""].join(
+    "\n",
+  );
+
+const SECURITY = {
+  topic: "security",
+  gap: "starter-only",
+  recommendedPath: "docs/security.md",
+  action: "Populate the security document with credential boundaries.",
+};
+const TESTING = {
+  topic: "testing",
+  gap: "missing",
+  recommendedPath: "docs/testing.md",
+  alternativeEvidence: "None available",
+  action: "Copy the testing starter and fill in the CI lanes.",
+};
+
+const stepDone = (step: string, artifacts: string[]) => ({
+  type: "step-done",
+  workflow: "plan",
+  step,
+  status: "DONE",
+  verdict: "PASS",
+  at: at(),
+  artifacts,
+});
+const started = () => ({ type: "workflow-started", workflow: "plan", at: at(), limits: {} });
+
+function repo() {
+  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-docwarn-")));
+  dirs.push(cwd);
+  write(
+    cwd,
+    "package.json",
+    JSON.stringify({
+      name: "docwarn-fixture",
+      private: true,
+      bkit: { tracker: { default: "none" } },
+    }),
+  );
+  return cwd;
+}
+
+async function summarize(cwd: string) {
+  const out: string[] = [];
+  const err: string[] = [];
+  const code = await runCommand(
+    ["workflows", "summary", "--workflow=plan", `--file=${STATUS}`, "--json"],
+    COMMANDS,
+    {
+      cwd,
+      classicVerbs: new Set(),
+      io: { stdout: (text) => out.push(text), stderr: (text) => err.push(text) },
+    },
+  );
+  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
+}
+
+const count = (text: string, needle: string) => text.split(needle).length - 1;
+
+afterEach(() => {
+  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
+});
+
+describe("workflows summary documentation warnings", () => {
+  it("reports only attributed documentation warnings for the active run", async () => {
+    const cwd = repo();
+    // Run 1: an earlier run left a gap that this run does not repeat.
+    write(
+      cwd,
+      `${LOG}/plan-generate-1.md`,
+      report(
+        warning({
+          ...SECURITY,
+          topic: "observability",
+          gap: "OLD-RUN-GAP",
+          alternativeEvidence: "o",
+        }),
+      ),
+    );
+    // Run 2 (active): two agents report the same gap, one reports a distinct gap.
+    write(
+      cwd,
+      `${LOG}/plan-review-2.md`,
+      report(warning({ ...SECURITY, alternativeEvidence: "EVIDENCE-FROM-REVIEW" })),
+    );
+    write(
+      cwd,
+      `${LOG}/plan-verify-2.md`,
+      report(
+        warning({ ...SECURITY, alternativeEvidence: "EVIDENCE-FROM-VERIFY" }),
+        warning(TESTING),
+      ),
+    );
+    // Raw input: warning-shaped, but not an attributed artifact of the run.
+    write(
+      cwd,
+      `${LOG}/plan-input-2.md`,
+      report(
+        warning({
+          ...SECURITY,
+          topic: "deployments",
+          gap: "RAW-INPUT-GAP",
+          alternativeEvidence: "r",
+        }),
+      ),
+    );
+    write(
+      cwd,
+      STATUS,
+      jsonl([
+        started(),
+        stepDone("plan-generate", [`${LOG}/plan-generate-1.md`]),
+        { type: "workflow-done", workflow: "plan", at: at() },
+        started(),
+        stepDone("plan-review", [`${LOG}/plan-review-2.md`, `${LOG}/never-written-optional.md`]),
+        stepDone("plan-verify", [`${LOG}/plan-verify-2.md`]),
+      ]),
+    );
+
+    const first = await summarize(cwd);
+    expect(first.err).toBe("");
+    expect(first.code).toBe(0);
+    const markdown = read(cwd, SUMMARY);
+
+    // The verdict is the one the steps decide: warnings change nothing.
+    expect(markdown.split("\n").slice(0, 3)).toEqual([
+      "Verdict: PASS",
+      "Failures: 0",
+      "<!-- verdict:end -->",
+    ]);
+    expect(first.json.verdict).toBe("PASS");
+    expect(first.json.failures).toBe(0);
+
+    expect(markdown).toContain("## Documentation Warnings");
+    expect(count(markdown, "Populate the security document")).toBe(1);
+    expect(markdown).toContain("EVIDENCE-FROM-REVIEW");
+    expect(markdown).toContain("EVIDENCE-FROM-VERIFY");
+    expect(count(markdown, "Copy the testing starter and fill in the CI lanes.")).toBe(1);
+    expect(markdown).not.toContain("OLD-RUN-GAP");
+    expect(markdown).not.toContain("RAW-INPUT-GAP");
+
+    // A later run that still has the unresolved gap reports it again, and only it.
+    write(
+      cwd,
+      `${LOG}/plan-verify-3.md`,
+      report(warning({ ...SECURITY, alternativeEvidence: "LATER-RUN-EVIDENCE" })),
+    );
+    fs.appendFileSync(
+      path.join(cwd, STATUS),
+      jsonl([
+        { type: "workflow-done", workflow: "plan", at: at() },
+        started(),
+        stepDone("plan-verify", [`${LOG}/plan-verify-3.md`]),
+      ]),
+    );
+    const later = await summarize(cwd);
+    expect(later.code).toBe(0);
+    const laterMarkdown = read(cwd, SUMMARY);
+    expect(laterMarkdown).toContain("## Documentation Warnings");
+    expect(count(laterMarkdown, "Populate the security document")).toBe(1);
+    expect(laterMarkdown).toContain("LATER-RUN-EVIDENCE");
+    expect(laterMarkdown).not.toContain("EVIDENCE-FROM-REVIEW");
+    expect(laterMarkdown).not.toContain("Copy the testing starter");
+    expect(laterMarkdown.split("\n")[0]).toBe("Verdict: PASS");
+  });
+});
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index f9a60c90a..f7b0fe775 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -416,6 +416,7 @@ _No tracker connected, skip step._
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1037,6 +1038,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index 1af8b389a..d08d24b1c 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -418,6 +418,7 @@ _No tracker connected, skip step._
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -561,6 +562,7 @@ _No tracker connected, skip step._
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
index ea761e607..c43d42b1c 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
@@ -290,6 +290,7 @@ _No tracker connected, skip step._
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -409,6 +410,7 @@ _No tracker connected, skip step._
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index c7386ceef..7d4ba5913 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -184,6 +184,7 @@ _No tracker connected, skip step._
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -343,6 +344,7 @@ _No tracker connected, skip step._
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 9534fb403..4ca65b917 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -426,6 +426,7 @@ _No tracker connected, skip step._
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -436,6 +437,7 @@ _No tracker connected, skip step._
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/.bkit/core/prompts/bkit-audit-generate.md b/.bkit/core/prompts/bkit-audit-generate.md
index 53d7526da..f5f974519 100644
--- a/.bkit/core/prompts/bkit-audit-generate.md
+++ b/.bkit/core/prompts/bkit-audit-generate.md
@@ -129,7 +129,20 @@ autoCompactWindow: 300000
      - **If** it exits non-zero → **STOP** and report the reason.
      - NEVER hand-write or edit the `bkit:anchor` block or the `bkit:outdated` line the stamp writes under it.
 3. Read every supplied input once at the start, and work from what it says, not from session memory. Do not re-read the template on every loop iteration.
-4. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+4. Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+   - Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "missing",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The CI workflow defines the lanes.",
+       "action": "Copy the testing starter and describe the project's tiers and lanes."
+     }
+     ```
 5. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - **If** a section has no content → `None`.
 6. Populate the template sections in template order, without changing the order. Take each section's shape from the template and every rule from this prompt, and verify every gate before you proceed:
diff --git a/.bkit/core/prompts/bkit-build-challenge-1.md b/.bkit/core/prompts/bkit-build-challenge-1.md
index bd997ada4..b2fb85887 100644
--- a/.bkit/core/prompts/bkit-build-challenge-1.md
+++ b/.bkit/core/prompts/bkit-build-challenge-1.md
@@ -55,7 +55,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.bkit/core/prompts/bkit-build-challenge-2.md b/.bkit/core/prompts/bkit-build-challenge-2.md
index 289e91721..715b9b323 100644
--- a/.bkit/core/prompts/bkit-build-challenge-2.md
+++ b/.bkit/core/prompts/bkit-build-challenge-2.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.bkit/core/prompts/bkit-build-install-skills.md b/.bkit/core/prompts/bkit-build-install-skills.md
index 8a7e884ca..746c27554 100644
--- a/.bkit/core/prompts/bkit-build-install-skills.md
+++ b/.bkit/core/prompts/bkit-build-install-skills.md
@@ -49,7 +49,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Identify the technologies that the feature requires.
 4. List the folder names under `.agents/skills/`, without reading the folders' contents. Each folder name is the identity of one installed skill when you look for gaps.
 5. Identify each skill gap: a required technology that no folder name matches.
diff --git a/.bkit/core/prompts/bkit-build-plan-convert.md b/.bkit/core/prompts/bkit-build-plan-convert.md
index 47fed6152..9bd8596f2 100644
--- a/.bkit/core/prompts/bkit-build-plan-convert.md
+++ b/.bkit/core/prompts/bkit-build-plan-convert.md
@@ -62,10 +62,24 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
+   - Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+     - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+     - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+     - Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+     - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+       ```jsonl
+       {
+         "topic": "security",
+         "gap": "starter-only",
+         "recommendedPath": "docs/security.md",
+         "alternativeEvidence": "The CI configuration defines token permissions.",
+         "action": "Populate the security document with the project's credential and permission boundaries."
+       }
+       ```
 2. Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 3. Set up the plan file:
-   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
+   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
    - In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 4. Split the work into tasks, each one a testable change, and group the tasks in build order:
    - Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
diff --git a/.bkit/core/prompts/bkit-build-plan-current.md b/.bkit/core/prompts/bkit-build-plan-current.md
index 79504e46f..91b635cc0 100644
--- a/.bkit/core/prompts/bkit-build-plan-current.md
+++ b/.bkit/core/prompts/bkit-build-plan-current.md
@@ -54,7 +54,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each affected task: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any task `Broken` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
index fd03eb828..402a7101f 100644
--- a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
+++ b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
@@ -80,7 +80,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the inputs, and find where to resume:
    - **If** Context `Mode` = `Holistic` → read the holistic verify report and every log. Each line of its `Identified Gaps Log` is one gap. Read the plan's task block of each task a gap names; no group gate log is supplied.
    - **Else** → read the group's briefs (their task blocks), the plan gaps, the group gate log when one is supplied, and every log. Each failure in the group gate log is one gap. In the logs, `DONE` = done and `BLOCKED` = blocked.
diff --git a/.bkit/core/prompts/bkit-build-plan-tasks.md b/.bkit/core/prompts/bkit-build-plan-tasks.md
index f62aaf3fa..8581832dd 100644
--- a/.bkit/core/prompts/bkit-build-plan-tasks.md
+++ b/.bkit/core/prompts/bkit-build-plan-tasks.md
@@ -88,7 +88,7 @@ autoCompactWindow: 300000
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-{GROUP}-{n}.md`):
    - Its task blocks are the work, in order.
    - Its earlier tasks are context only.
diff --git a/.bkit/core/prompts/bkit-build-plan-tests.md b/.bkit/core/prompts/bkit-build-plan-tests.md
index 43a69ed1d..71ecb385c 100644
--- a/.bkit/core/prompts/bkit-build-plan-tests.md
+++ b/.bkit/core/prompts/bkit-build-plan-tests.md
@@ -67,7 +67,7 @@ autoCompactWindow: 300000
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-tests-{GROUP}-{n}.md`):
    - Its task blocks' `TEST FIRST` entries are the work, in order; the rest of each block says what the test is for.
    - Its `Derived Test Matrix rows` say what each test asserts.
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index cc7abc654..ebc50ebd7 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - For each gap, append the entry at EOF with Bash `echo {log entry} >> {output}`.
      - **If** the entry spans several lines → append it with a heredoc instead.
diff --git a/.bkit/core/prompts/bkit-debug-abort-handover.md b/.bkit/core/prompts/bkit-debug-abort-handover.md
index b41f01600..c4397a7fb 100644
--- a/.bkit/core/prompts/bkit-debug-abort-handover.md
+++ b/.bkit/core/prompts/bkit-debug-abort-handover.md
@@ -52,7 +52,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Extract `Rot Signals` from the diagnose attempts, and aggregate them into the handover: dedupe the slugs, and keep all the evidence.
 6. Extract `Out-of-Scope Recommendations` from the diagnose attempts, and aggregate them: dedupe the paths, and keep all the rationales.
diff --git a/.bkit/core/prompts/bkit-debug-failure-diagnose.md b/.bkit/core/prompts/bkit-debug-failure-diagnose.md
index 8f20a9043..ebcaa3c9d 100644
--- a/.bkit/core/prompts/bkit-debug-failure-diagnose.md
+++ b/.bkit/core/prompts/bkit-debug-failure-diagnose.md
@@ -62,7 +62,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The CI and runtime logs are the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` and `docs/noise.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → run a targeted diagnosis.
diff --git a/.bkit/core/prompts/bkit-debug-failure-remediate.md b/.bkit/core/prompts/bkit-debug-failure-remediate.md
index d1f446419..c2fd15c77 100644
--- a/.bkit/core/prompts/bkit-debug-failure-remediate.md
+++ b/.bkit/core/prompts/bkit-debug-failure-remediate.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each remediation: append `DONE|BLOCKED` at EOF with Bash `echo {log entry} >> {output}`.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → apply the diagnosis as written.
diff --git a/.bkit/core/prompts/bkit-debug-failure-reproduce.md b/.bkit/core/prompts/bkit-debug-failure-reproduce.md
index 772d1b246..34c28645a 100644
--- a/.bkit/core/prompts/bkit-debug-failure-reproduce.md
+++ b/.bkit/core/prompts/bkit-debug-failure-reproduce.md
@@ -54,7 +54,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The bug report in `debug-input-*.md` is the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Choose where the tests go:
    - Pick the lowest tier that reaches the reported behaviours: unit before integration before e2e.
    - Co-locate them with the tests that cover the affected areas, and match those tests' imports, helpers and naming.
diff --git a/.bkit/core/prompts/bkit-debug-failure-soak.md b/.bkit/core/prompts/bkit-debug-failure-soak.md
index 4acba224e..cfc9fad34 100644
--- a/.bkit/core/prompts/bkit-debug-failure-soak.md
+++ b/.bkit/core/prompts/bkit-debug-failure-soak.md
@@ -63,7 +63,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Decide the single next step from the accumulated context:
    - **If** the cause is unknown → instrument the suspected surface: add `[DEBUG-OBSERVE]` logging, with no behaviour change.
    - **Else**:
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
index b2ba08944..0507c785a 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
@@ -47,7 +47,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from the current constraints: existing code, minimal new infrastructure and the fastest path to ship.
    - Lead with the recommended approach.
    - Keep each approach in the existing stack, with no greenfield build and no hypothetical infrastructure.
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
index a67af1a06..4b5d4cee8 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
@@ -45,7 +45,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from first principles: the best long-term shape if the existing constraints did not matter.
    - Lead with the recommended approach.
    - Ignore "we already have X" as a default.
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
index ef33f3099..9f79dde6c 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
@@ -46,7 +46,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches framed by failure mode, not by happy-path shape.
    - Lead with the recommended approach.
    - For each approach, include additive risk-mitigation guidance to layer onto whichever approach is picked, not separate "safer" approaches.
diff --git a/.bkit/core/prompts/bkit-design-generate.md b/.bkit/core/prompts/bkit-design-generate.md
index 4ea663c30..811ec976b 100644
--- a/.bkit/core/prompts/bkit-design-generate.md
+++ b/.bkit/core/prompts/bkit-design-generate.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Do not `cp` an existing input.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Identify the themes, complementary ideas, conflicts and related issues.
    - Layer the risk-premortem mitigations onto the selected approach. They are additive, not a separate approach.
diff --git a/.bkit/core/prompts/bkit-design-organise.md b/.bkit/core/prompts/bkit-design-organise.md
index 0d7129293..34c9b3ef5 100644
--- a/.bkit/core/prompts/bkit-design-organise.md
+++ b/.bkit/core/prompts/bkit-design-organise.md
@@ -56,7 +56,7 @@ autoCompactWindow: 300000
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" steps stub --from="<Read>" --to="<Create>" --strip-header
    ```
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Identify the decomposition boundaries: domain boundaries, organisational structure and chronological dependencies. Do not use token or context-window size as a factor.
 5. Group the design work into workstreams at the identified boundaries.
 6. For each workstream:
diff --git a/.bkit/core/prompts/bkit-design-review-1.md b/.bkit/core/prompts/bkit-design-review-1.md
index ca740d6e5..8a6479f0d 100644
--- a/.bkit/core/prompts/bkit-design-review-1.md
+++ b/.bkit/core/prompts/bkit-design-review-1.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major capability the design requires, search for prior art:
    - Search the repo: text search for names, strings, near-miss helpers and sibling modules, symbol references through the language server when one is configured, and `docs/capabilities.md` when present.
diff --git a/.bkit/core/prompts/bkit-design-review-2.md b/.bkit/core/prompts/bkit-design-review-2.md
index 4469fe095..c469cc1ab 100644
--- a/.bkit/core/prompts/bkit-design-review-2.md
+++ b/.bkit/core/prompts/bkit-design-review-2.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major component or flow, enumerate its failure modes:
    - What fails: an upstream dependency, internal logic, resource exhaustion, data corruption or partial state.
diff --git a/.bkit/core/prompts/bkit-design-spike.md b/.bkit/core/prompts/bkit-design-spike.md
index 49604045f..0311b4cd4 100644
--- a/.bkit/core/prompts/bkit-design-spike.md
+++ b/.bkit/core/prompts/bkit-design-spike.md
@@ -64,7 +64,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Restate each unknown in the review's `PoC Approach` and `Unknowns & Blockers` as one claim the design depends on and a probe could disprove:
    - Order the claims by blast radius.
diff --git a/.bkit/core/prompts/bkit-design-update.md b/.bkit/core/prompts/bkit-design-update.md
index 1ea15b1a8..2ae16167d 100644
--- a/.bkit/core/prompts/bkit-design-update.md
+++ b/.bkit/core/prompts/bkit-design-update.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Apply every `CRITICAL` item. No consensus is required. **If** findings conflict → prefer the stricter wording.
 6. Apply each `OPTIONAL` item on merit. No consensus is required. **If** it conflicts with an applied `CRITICAL` item or expands scope → skip it.
diff --git a/.bkit/core/prompts/bkit-plan-generate.md b/.bkit/core/prompts/bkit-plan-generate.md
index 89fa9755f..a83ef41f4 100644
--- a/.bkit/core/prompts/bkit-plan-generate.md
+++ b/.bkit/core/prompts/bkit-plan-generate.md
@@ -102,7 +102,21 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Take its sections from `docs/templates/bkit-plan.md`.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+   - Mark an irrelevant topic not applicable, with the reason.
+   - Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - Write each section group below before you read for the next group. Do not leave the writing to a final pass.
    - **If** a section has nothing to hold → `None`.
@@ -116,6 +130,7 @@ autoCompactWindow: 300000
 7. Investigation & prerequisites:
    - `Open Questions & Assumptions`.
    - `Pre-Flight / Dependencies`.
+   - `Documentation Consultation` and `Documentation Warnings`, from step 3.
 8. Design:
    - `Alternative Approaches & Recommendations`.
    - `Data Schema Integration`.
@@ -139,6 +154,7 @@ autoCompactWindow: 300000
       - Keep each group and task within the plan caps your Context names (`bkit.workflows.tasks`: tasks and `TEST FIRST` tests per group, tests and test files per task).
       - Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
       - `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
+      - Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
       - NEVER write `TEST EXCEPTION` of your own; copy each `TEST EXCEPTION` field an input writes into its task, word for word.
     - `Verification Plan` from Test Matrix and Execution Runbook.
 
diff --git a/.bkit/core/prompts/bkit-plan-review-1.md b/.bkit/core/prompts/bkit-plan-review-1.md
index 02b3b6b01..0f3529327 100644
--- a/.bkit/core/prompts/bkit-plan-review-1.md
+++ b/.bkit/core/prompts/bkit-plan-review-1.md
@@ -64,7 +64,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that the plan reflects its source, with no drift, no omissions and no silent expansion:
    - Design-coverage: **If** a design artifact exists (`docs/plans/{YYYYMM}/{FID}-design.md`, or one the input references):
diff --git a/.bkit/core/prompts/bkit-plan-review-2.md b/.bkit/core/prompts/bkit-plan-review-2.md
index a1838c39d..19047b7d4 100644
--- a/.bkit/core/prompts/bkit-plan-review-2.md
+++ b/.bkit/core/prompts/bkit-plan-review-2.md
@@ -58,7 +58,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Trace the surface area of each `Agent Execution Runbook` task:
    - The files and modules it edits directly.
diff --git a/.bkit/core/prompts/bkit-plan-scope-check.md b/.bkit/core/prompts/bkit-plan-scope-check.md
index 239daeb01..586f3204a 100644
--- a/.bkit/core/prompts/bkit-plan-scope-check.md
+++ b/.bkit/core/prompts/bkit-plan-scope-check.md
@@ -64,7 +64,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that every section `docs/templates/bkit-plan.md` mandates is present and filled in. A missing or broken section → `CRITICAL`.
 6. Check the scenario sections and the open questions:
diff --git a/.bkit/core/prompts/bkit-plan-update.md b/.bkit/core/prompts/bkit-plan-update.md
index c90c0fdad..d625c945e 100644
--- a/.bkit/core/prompts/bkit-plan-update.md
+++ b/.bkit/core/prompts/bkit-plan-update.md
@@ -82,7 +82,19 @@ autoCompactWindow: 300000
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+   - **If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
+   - Never drop an earlier warning the review did not resolve.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Keep every `Agent Execution Runbook` task's `DONE WHEN` and `TEST FIRST` intact through the merge:
    - A critique may edit the task text around them.
diff --git a/.bkit/core/prompts/bkit-ship-conflict-resolve.md b/.bkit/core/prompts/bkit-ship-conflict-resolve.md
index d56e1ed43..f90d499d1 100644
--- a/.bkit/core/prompts/bkit-ship-conflict-resolve.md
+++ b/.bkit/core/prompts/bkit-ship-conflict-resolve.md
@@ -53,7 +53,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each substep: append the log entry at EOF with Bash `echo {log entry} >> {output}`.
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
diff --git a/.bkit/core/prompts/bkit-ship-deferred-sweep.md b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
index 780f6029c..93a21eb62 100644
--- a/.bkit/core/prompts/bkit-ship-deferred-sweep.md
+++ b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
@@ -55,7 +55,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Settle which file is the plan, then scan it for declared out-of-scope, future-work or non-goal items:
    - **If** no plan file exists:
diff --git a/.bkit/core/prompts/bkit-ship-update-docs.md b/.bkit/core/prompts/bkit-ship-update-docs.md
index 00e960674..7952572a2 100644
--- a/.bkit/core/prompts/bkit-ship-update-docs.md
+++ b/.bkit/core/prompts/bkit-ship-update-docs.md
@@ -55,8 +55,12 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task.
    - Exclude `knowledge.jsonl` and `decisions.jsonl`.
+   - Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+   - Mark an irrelevant topic not applicable, with the reason.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
+   - Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 3. Read the history shipped this cycle:
    - Run `git rev-parse --is-shallow-repository`.
    - **If** it prints `true` → name the boundary commit in the output, and say that older history is unread.
@@ -67,6 +71,16 @@ autoCompactWindow: 300000
 7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
    - Do not write `docs/deferrals.jsonl`.
 8. Produce the **Create** output.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
 
 **Output format:**
 
@@ -81,6 +95,14 @@ autoCompactWindow: 300000
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Unresolved Coverage
+
+[Each topic that is absent, unindexed, empty, starter-only or undercovered after this run, with the evidence. Report it next to the edits above; it never makes the sync read as clean. **If** every relevant topic is covered → `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 8. **If** no gaps → omit this section.]
+
 ## Pending Items
 
 [The `{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
diff --git a/.bkit/core/prompts/bkit-utility-update-decisions.md b/.bkit/core/prompts/bkit-utility-update-decisions.md
index 3cba0e88c..e549cbad5 100644
--- a/.bkit/core/prompts/bkit-utility-update-decisions.md
+++ b/.bkit/core/prompts/bkit-utility-update-decisions.md
@@ -58,7 +58,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/decisions.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.bkit/core/prompts/bkit-utility-update-deferrals.md b/.bkit/core/prompts/bkit-utility-update-deferrals.md
index 53078d42a..34da33e3e 100644
--- a/.bkit/core/prompts/bkit-utility-update-deferrals.md
+++ b/.bkit/core/prompts/bkit-utility-update-deferrals.md
@@ -55,7 +55,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/deferrals.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - **If** it is done in code → set `status` to `CLOSED`, with `references` naming the evidence.
diff --git a/.bkit/core/prompts/bkit-utility-update-documentation.md b/.bkit/core/prompts/bkit-utility-update-documentation.md
index f25aadf88..a4e8ce7b6 100644
--- a/.bkit/core/prompts/bkit-utility-update-documentation.md
+++ b/.bkit/core/prompts/bkit-utility-update-documentation.md
@@ -53,17 +53,33 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read the `.agents/docs.md` index as the full catalog of docs to check.
+2. Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+   - **Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+   - **Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+   - **Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+   - **Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
 3. Per doc, always follow its `Rules` headers when making edits.
 4. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
-5. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-6. Collect setup tips:
+5. Record the coverage result:
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
+6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
+7. Collect setup tips:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" tips --workflow=utility
    ```
    - Hold stdout as `BKIT_TIPS`. It is plain text, not JSON.
    - **If** it prints nothing or exits non-zero → `BKIT_TIPS` is empty.
-7. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
+8. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
    - Append a `## Suggested Replies` heading.
    - Append `Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.`
    - **If** `BKIT_TIPS` is not empty:
@@ -83,6 +99,14 @@ autoCompactWindow: 300000
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Project Documentation Coverage
+
+[One row per topic: recommended path, state (populated, starter-only, empty, absent or not-applicable), index accuracy, and evidence. A coverage gap here is never `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 5. **If** no gaps → omit this section.]
+
 ## Memories
 
 [Each memory rewrite: memory path, pointer. **If** none → `None`.]
diff --git a/.bkit/core/prompts/bkit-utility-update-failures.md b/.bkit/core/prompts/bkit-utility-update-failures.md
index 2d9df8bd2..b70daf54f 100644
--- a/.bkit/core/prompts/bkit-utility-update-failures.md
+++ b/.bkit/core/prompts/bkit-utility-update-failures.md
@@ -57,7 +57,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/failures.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - For `category` `testing`, the winning row's `updates` is the flake count. Only a landed deterministic fix counts as done, never a recent green run.
diff --git a/.bkit/core/prompts/bkit-utility-update-knowledge.md b/.bkit/core/prompts/bkit-utility-update-knowledge.md
index dcef32e09..faf08ca38 100644
--- a/.bkit/core/prompts/bkit-utility-update-knowledge.md
+++ b/.bkit/core/prompts/bkit-utility-update-knowledge.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.bkit/core/prompts/bkit-utility-update-roadmap.md b/.bkit/core/prompts/bkit-utility-update-roadmap.md
index 8c6509c2d..58f7621f5 100644
--- a/.bkit/core/prompts/bkit-utility-update-roadmap.md
+++ b/.bkit/core/prompts/bkit-utility-update-roadmap.md
@@ -74,7 +74,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Refresh `docs/roadmap.md` with `bkit roadmap fold` (the main checkout's `node_modules/.bin/bkit`):
    - **If** it fails → **STOP**.
    - Read the refreshed file in full. Its `bkit` block is a list of `FID`s.
diff --git a/.bkit/core/prompts/bkit-utility-update-tracker.md b/.bkit/core/prompts/bkit-utility-update-tracker.md
index 9edd39189..91c73fca5 100644
--- a/.bkit/core/prompts/bkit-utility-update-tracker.md
+++ b/.bkit/core/prompts/bkit-utility-update-tracker.md
@@ -86,7 +86,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. <!-- bkit:tracker true start -->
    Read repo facts:
    ```bash
diff --git a/.bkit/core/workflows/bkit-auto.md b/.bkit/core/workflows/bkit-auto.md
index 6e5dec4e8..70da3b44e 100644
--- a/.bkit/core/workflows/bkit-auto.md
+++ b/.bkit/core/workflows/bkit-auto.md
@@ -152,6 +152,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
 3. Invoke the matching phase skill with the `Skill` tool, then exit.
+   The dispatched phase writes its own `## Documentation Warnings` in its summary. Forward that output as it is; do not collect or repeat it here.
    Route:
    - `PHASE` = `ship` → `/bkit-ship {FID} {REF}`
    - `PHASE` = `debug` → `/bkit-debug {FID} {REF} https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID}` when `RUN_ID` is held; otherwise `/bkit-debug {FID} {REF}`.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index d5eebaa6f..6b98bcadb 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -501,6 +501,7 @@ description: "Build Feature — Autonomous implementation"
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1122,6 +1123,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index a990b80e6..955de74e8 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -515,6 +515,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -658,6 +659,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index 633bc8e4d..04f6e994c 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -387,6 +387,7 @@ description: "Design Feature — Autonomous design phase"
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -506,6 +507,7 @@ description: "Design Feature — Autonomous design phase"
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 0195b69c1..23d9109d5 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -265,6 +265,7 @@ description: "Plan Feature — Autonomous plan generation"
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -444,6 +445,7 @@ description: "Plan Feature — Autonomous plan generation"
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 8598da8e5..567c18541 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -506,6 +506,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -516,6 +517,7 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index eefbe260f..4a02ff3c4 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -399,7 +399,7 @@ Clause section lines:
 - hook:
   - partial: `gateguard-docs`
 - drift:
-  - `bkit-utility-update-documentation:56`: "index as the full catalog of docs to check" Reads docs.md as a full catalog to check, not lazy-load by phase matrix (fits a full-sync task)
+  - `bkit-utility-update-documentation:56`: "index as the catalog of docs to check" Reads docs.md as a full catalog to check, not lazy-load by phase matrix (fits a full-sync task)
     - kept: a full docs sync checks every doc the index lists, so it reads the whole catalog
 
 ```text
@@ -886,7 +886,7 @@ Clause section lines:
     - kept: a blocked in-scope plan task is not a deferral; it is reported to the orchestrator, which routes it
   - `bkit-build-plan-gaps-remediate:33`: "NEVER append to `docs/deferrals.jsonl`" Says never append to docs/deferrals.jsonl; consistent with `finish-over-deferrals` (blocked in-scope work is not a deferral) but reads as the inverse of `deferred-work`'s ALWAYS-append
     - kept: a blocked in-scope plan task is not a deferral; it is reported to the orchestrator, which routes it
-  - `bkit-ship-update-docs:68`: "Do not write `docs/deferrals.jsonl`." Forbids writing `docs/deferrals.jsonl`; deferrals are surfaced for human review only
+  - `bkit-ship-update-docs:72`: "Do not write `docs/deferrals.jsonl`." Forbids writing `docs/deferrals.jsonl`; deferrals are surfaced for human review only
     - kept: the rows it surfaces already sit in `docs/deferrals.jsonl`; it reads them for human review and adds no deferral of its own
 
 ```text
@@ -1371,7 +1371,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:584`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:586`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1670,7 +1670,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:584`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:586`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -3339,16 +3339,70 @@ Re-read all supplied inputs ONCE at session start; do NOT trust session memory.
 - prompt: where-used
 - audit: forbidden
 - tags: review-docs-first
-- carriers: prompt all except `bkit-build-plan-convert`, `bkit-utility-compress-markdown`, `bkit-utility-update-documentation`; repo-agent all
+- carriers: prompt `bkit-build-challenge-*`, `bkit-debug-*`, `bkit-design-*`, `bkit-plan-review-*`, `bkit-build-install-skills`, `bkit-build-plan-current`, `bkit-build-plan-gaps-remediate`, `bkit-build-plan-tasks`, `bkit-build-plan-tests`, `bkit-build-plan-verify`, `bkit-plan-scope-check`, `bkit-ship-conflict-resolve`, `bkit-ship-deferred-sweep`, `bkit-utility-update-decisions`, `bkit-utility-update-deferrals`, `bkit-utility-update-failures`, `bkit-utility-update-knowledge`, `bkit-utility-update-roadmap`, `bkit-utility-update-tracker`; repo-agent all
 
 ```text
-Read `.agents/docs.md`, and load the docs it lists for this task{{focus?}}. Skip any listed doc that does not exist
+Read `.agents/docs.md`, and load the docs it lists for this task{{focus?}}. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently
 ```
 
 ```retired
+Read `.agents/docs.md`, and load the docs it lists for this task{{focus?}}. Skip any listed doc that does not exist
 Read `.agents/docs.md` → load docs for workflow / step / task{{focus?}}; skip missing
 ```
 
+### doc-warning-record
+
+- prompt: where-used
+- audit: where-used
+- tags: review-docs-first
+- carriers: prompt `bkit-audit-generate`, `bkit-build-plan-convert`, `bkit-plan-generate`, `bkit-plan-update`, `bkit-ship-update-docs`, `bkit-utility-update-documentation`; audit `bkit-audit-adoption`, `bkit-audit-documentation`
+
+```text
+Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+```
+
+### doc-gap-continue
+
+- prompt: where-used
+- audit: where-used
+- tags: review-docs-first
+- carriers: prompt `bkit-audit-generate`, `bkit-build-plan-convert`, `bkit-plan-generate`, `bkit-plan-update`, `bkit-ship-update-docs`, `bkit-utility-update-documentation`; audit `bkit-audit-adoption`, `bkit-audit-documentation`
+
+```text
+**If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+```
+
+### doc-topic-not-applicable
+
+- prompt: where-used
+- audit: where-used
+- tags: review-docs-first
+- carriers: prompt `bkit-audit-generate`, `bkit-build-plan-convert`, `bkit-plan-generate`, `bkit-ship-update-docs`
+
+```text
+Mark an irrelevant topic not applicable, with the reason.
+```
+
+### doc-indexed-equivalent
+
+- prompt: where-used
+- tags: review-docs-first
+- carriers: prompt `bkit-audit-generate`, `bkit-build-plan-convert`, `bkit-plan-generate`
+
+```text
+Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+```
+
+### doc-warnings-summary
+
+- workflow: where-used
+- tags: review-docs-first
+- carriers: workflow all except `bkit-auto`
+
+```text
+The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
+```
+
 ### replace-pending
 
 - prompt: where-used
@@ -10551,6 +10605,8 @@ Post the comment:
 `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`). **If** the body is over 32,767 characters → post consecutive comments split at line breaks, in order.
 [verify-tools] **If** it still fails → `Issue` = `{ISSUE_ID} failed`.
 **Else** → `Issue` = `{ISSUE_ID} posted`.
+Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
 ```
 
 #### bkit-build-challenge-1
@@ -10632,8 +10688,6 @@ Write the **Create** output in the Output format.
 **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`. Each cell in it names the one runbook task that lands that row's test.
 Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 Set up the plan file:
-**If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-**Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
 In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 Split the work into tasks, each one a testable change, and group the tasks in build order:
 Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
@@ -10643,6 +10697,10 @@ For each `CREATE` file, add one `NEW` row to `Reuse Inventory` that records the
 **If** it exits 0 → stop.
 **If** it exits non-zero on the third run → stop, and leave the plan as it stands. The caller runs the same check and handles the problems that are left.
 **If** it exits non-zero → fix each problem its report lists, and run it again.
+Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+**If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+**Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
 ```
 
 #### bkit-build-plan-current
@@ -11225,6 +11283,10 @@ Keep each group and task within the plan caps your Context names (`bkit.workflow
 Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
 `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
 `Verification Plan` from Test Matrix and Execution Runbook.
+Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+`Documentation Consultation` and `Documentation Warnings`, from step 3.
+Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
 ```
 
 #### bkit-plan-review-1
@@ -11323,6 +11385,9 @@ Add each decision or deferral `key` you wrote to the plan's `**Ledger rows:**` l
 **If** applied findings add or reword questions under `Open Questions & Assumptions` → shape each per **Open questions** above.
 Remove the answered question from `Open Questions & Assumptions`.
 **If** the answer carries `Decision: {key}` → add that `key` to the plan's `**Ledger rows:**` line.
+Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+**If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+Never drop an earlier warning the review did not resolve.
 ```
 
 #### bkit-ship-conflict-resolve
@@ -11444,6 +11509,9 @@ Read the history shipped this cycle:
 Run `git log --oneline --stat origin/dev..HEAD` for the files shipped this cycle.
 [deferred-work] Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
 [deferred-work] Do not write `docs/deferrals.jsonl`.
+Read `.agents/docs.md`, and load the docs it lists for this task.
+Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 ```
 
 #### bkit-utility-compress-markdown
@@ -11535,7 +11603,12 @@ Report to the caller, never into the file: the original vs new line / word count
 
 ```text
 **Role:** Senior tech writer syncing project docs with system state after multiple plans.
-[review-docs-first] Read the `.agents/docs.md` index as the full catalog of docs to check.
+Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+**Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+**Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+**Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+**Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+Record the coverage result:
 ```
 
 #### bkit-utility-update-failures
@@ -11976,7 +12049,6 @@ Check that there is one context-fetch block per context with a lane, and that ea
 **Step 3 — Version:** Compare `pinnedVersion`, the installed package and the registry latest. **If** pinned != installed → the package was bumped without `bkit upgrade`. **If** the repo is behind → record the release count, the release-note changes that touch this repo, and the template paths changed since the pinned version. **Done when:** `Version` names all three versions and every relevant release-note change.
 **Step 4 — Check and Doctor:** Run `bkit check`, and record its exit code and the cause of each drift line. Run `bkit doctor`, and mark each advisory adopt, reject (saying why) or not applicable. Carry the previous report's rejects forward, and re-raise one only when the advisory text changed. **Done when:** `Check and Doctor` holds one row per drift line and per advisory.
 **Step 5 — Hosts:** Compare the agent hosts in use with the bkit hosts installed. Find the hosts in use from the repo's config directories and from team use. Use the `Hosts` section of the newest `bkit-audit-agents` report as a cross-check, not as the source. For each installed host, check for one agent copy per `core/prompts/` source, one command copy per `core/workflows/` source, and every `core/` hook file present, executable and wired in that host's settings. Record these as findings: a host in use with no bkit install, because agents there run without bkit gates; a missing or extra copy; and a hook file present but unwired, or wired but absent. Whether hooks fire and agree across hosts goes to `bkit-audit-agents`. **Done when:** `Hosts` holds one row per host: in use · installed · agent copies · command copies · hooks wired.
-**Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`. **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file: block untouched · your part present · verdict.
 **Step 7 — Audits:** For each `docs/templates/bkit-audit-*.md`, record whether its `**Applies when:**` is met, yes or no, with evidence; its `**Cadence:**`; and its newest report under `docs/audits/` by commit date. An audit never run is due, by the same rule as `bkit-utility-update-roadmap`. An `N/A` report with evidence counts as a run. Record these as findings: an audit that applies and was never run; an audit overdue by more than one cadence; and `Process Improvements` `Project` edits that a report proposed and that are absent from that template's `Project Instructions`. **Done when:** `Audits` holds one row per template: applies · cadence · last run · overdue by · verdict.
 **Step 8 — Adoption:** Join each file in the package's `templates/` to `.bkit/templates.md` § Contract.
 **If** a file is missing from the Contract → the fix is an upstream bkit doc fix.
@@ -12003,6 +12075,11 @@ For each context-fetch block, check that its job regex and artifact name match e
 **Hosts:** `Summary` names the hosts.
 **Template counts:** `Summary` gives the count of templates adopted / `gap` / `covered` / `not applicable`.
 **Throwaways removed:** the throwaway package unpack is removed.
+**Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`, topic by topic:
+**Presence:** a relevant topic with no file (absent or missing) is a finding. An indexed equivalent document counts (`Equivalent to docs/{topic}.md` in its Scope cell).
+**Index accuracy:** a file with no row, and a row with no file, are findings.
+**Content:** an empty file, or a file that still matches its starter, is a finding; a file that differs is a candidate for assessment, never proof of coverage. A topic that does not apply (no UI, no database) is irrelevant and recorded as not applicable with the reason.
+**If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file and per project document topic: block untouched · your part present · state (populated, starter-only, empty, absent or not applicable) · verdict.
 ```
 
 #### bkit-audit-agents
@@ -12811,7 +12888,7 @@ Platform backup / restore docs.
 Platform serverless connection guidance.
 DB routine-maintenance docs, edition = hosted major (e.g., PostgreSQL Routine Database Maintenance Tasks).
 Safe-migration rule set (e.g., Squawk); record version.
-bkit block of `docs/setup.md` (bkit version from `.bkit/version`): Rules
+The project's `docs/setup.md` (local database setup and reset) and `docs/data-schema.md` (documented schema), when present; a missing or starter-only document is a warning, not a stop.
 Check the catalogue privileges on functions, tables and sequences.
 Find the role each write in the code actually runs as.
 Check the row-level access coverage, and the exposure outside the main schema (file storage, change feeds, views, exposed schemas).
@@ -13293,7 +13370,6 @@ Check that each topic has one doc, and label each live doc with its Diátaxis qu
 **API Doc Validator:** **If** the project has shared packages **or** an HTTP API → Step 9 — e.g., TypeDoc `--validation`, `eslint-plugin-jsdoc`. Fallback: read the exports, and mark broken links `Not Checked`.
 [honest-reporting] **Local Memory:** **If** the run is on a maintainer machine → Step 10 — the IDE auto-memory directory. Fallback: a cloud session skips it and records that in `Not Checked`.
 **Step 2 — Scope:** **If** there are no live docs → write one `N/A` row with evidence, then **STOP**. Otherwise take every live doc, and rank them by drift: for each live doc, count the commits to the repo paths it cites since the doc last changed, and add a column for the cited paths that no longer resolve. Record the ranking. Start from an up-to-date default branch with a clean `git status`. Historical records are citers. A pointer in one that leads nowhere is a finding, fixed at the target. A stale fact inside one is history, not a defect. **Done when:** `Scope` holds every live doc and the drift ranking.
-**Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. **Done when:** `Catalogue` names every mismatch, and every clean check.
 **Step 4 — Mechanical:** Run prose lint, the format check and the managed-block check. Then:
 Check that every backticked repo path in a live doc exists, and that every `*.md` name in a live doc resolves, backticked or not. The output is candidates. A path named on purpose as removed is not a finding. A path that moved is a finding. Section anchors and `file:line` wait for `Claims`.
 [empty-is-inconclusive] Check relative links and heading anchors offline across every doc, plans and archive included, because they are citers. Then check external URLs in live docs, with a cache. The anchor builder must match the host (e.g., GitHub). Open a failed fragment before calling it broken. The path check cannot see Markdown links.
@@ -13339,6 +13415,13 @@ Never name a doc that tests parse, or a ledger, as a compress candidate.
 **Docs untouched:** no live doc, memory file or instruction file changed, other than the template's `Project Instructions`.
 **Ledger rows untouched:** no existing ledger row changed.
 [tmp-files] **Scratch in tmp:** scratch files are only under the repo-root `tmp/`.
+**Presence:** a topic the project needs with no file (absent or missing) is a finding. An equivalent document counts when its `Project Documents` row names the recommended path in its Scope cell (`Equivalent to docs/{topic}.md`).
+**Index accuracy:** a present file with no `Project Documents` row, and a row whose file is missing, are findings.
+**Project content:** compare each file with `.bkit/templates/docs/{topic}.md`. An empty file or one that still matches the starter is a finding. A file that differs is a candidate: read it against the code and name the undercovered topics. Never call a topic covered from a mechanical comparison alone.
+**Not applicable:** a topic the project does not need (for example `docs/design.md` for a project with no UI) is irrelevant and recorded as not applicable with the reason. Absence, incomplete coverage and an irrelevant topic are three different outcomes; report each one apart.
+**Done when:** `Catalogue` names every mismatch and every clean check, and `Project Documentation` holds one row per topic: path, state (populated, starter-only, empty, absent or not applicable), index accuracy and evidence.
+**If** every topic is covered and indexed → write `None`; Step 3's records belong in this section.
+**Project documents:** `Project Documentation` has a row for every topic, and no absent, starter-only or undercovered topic reads as clean.
 ```
 
 #### bkit-audit-duplication
@@ -14829,7 +14912,6 @@ These are the unknowns and assumptions this plan relies on. An unresolved questi
 **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
 **User Context:** access to the files is confirmed, and missing user information is requested.
 **Project Context:** the relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows are read.
-**Testing & Quality:** the testing strategy matches `docs/testing.md`.
 **Prerequisite Plans:** [the plans to finish first. **If** none → `None`.]
 **Secrets & Env Vars:** the secret store and the service-account roles are checked.
 **Schema State:** the database state is confirmed against `docs/data-schema.md`.
@@ -14892,6 +14974,9 @@ These are the unknowns and assumptions this plan relies on. An unresolved questi
 **Run all tests:** [The local unit and integration suites (e.g., `pnpm test`, `pnpm test:integration`) pass.]
 **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).
 **Step 1:** [How to verify the feature end to end through the CLI or the database.]
+**Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through the `.agents/docs.md` index (a missing or starter-only document is a warning, not a stop), and the plan's strategy matches `docs/testing.md`. Record each source in `Documentation Consultation`.
+**Deployments & Setup:** release, CI and branch behaviour follows `docs/deployments.md`, and local-setup changes follow `docs/setup.md`.
+[One JSON object per line in a fenced `jsonl` block, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`, all non-empty (`"None available"` when no alternative evidence exists). **If** every applicable topic is covered → write `None`. A warning never blocks the plan. Initially set to `PENDING`.]
 ```
 
 ### Entry file
diff --git a/.claude/agents/utility-new-release.md b/.claude/agents/utility-new-release.md
index bd33ec935..496e0681a 100644
--- a/.claude/agents/utility-new-release.md
+++ b/.claude/agents/utility-new-release.md
@@ -39,7 +39,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Track your turn budget throughout.
    - **If** ~80% of it is spent → **STOP**, and report the exact state in the Output format. Say what landed, what did not, and the next action that finishes the release.
 4. Confirm the inputs: `VERSION` (semver, required) and `FID` (credit issue, optional).
diff --git a/.claude/agents/utility-pre-release-check.md b/.claude/agents/utility-pre-release-check.md
index 3521f8ed4..52413db2b 100644
--- a/.claude/agents/utility-pre-release-check.md
+++ b/.claude/agents/utility-pre-release-check.md
@@ -41,7 +41,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Throughout the audit:
    - Read the file behind every search hit before you record a finding.
    - Track your turn budget.
diff --git a/.codex/agents/utility-new-release.toml b/.codex/agents/utility-new-release.toml
index 1e948d1f6..42536eb53 100644
--- a/.codex/agents/utility-new-release.toml
+++ b/.codex/agents/utility-new-release.toml
@@ -28,7 +28,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Track your turn budget throughout.
    - **If** ~80% of it is spent → **STOP**, and report the exact state in the Output format. Say what landed, what did not, and the next action that finishes the release.
 4. Confirm the inputs: `VERSION` (semver, required) and `FID` (credit issue, optional).
diff --git a/.codex/agents/utility-pre-release-check.toml b/.codex/agents/utility-pre-release-check.toml
index 783356e5e..e18376d27 100644
--- a/.codex/agents/utility-pre-release-check.toml
+++ b/.codex/agents/utility-pre-release-check.toml
@@ -28,7 +28,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Throughout the audit:
    - Read the file behind every search hit before you record a finding.
    - Track your turn budget.
diff --git a/.opencode/agents/utility-new-release.md b/.opencode/agents/utility-new-release.md
index f7076854d..75c06e60c 100644
--- a/.opencode/agents/utility-new-release.md
+++ b/.opencode/agents/utility-new-release.md
@@ -37,7 +37,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Track your turn budget throughout.
    - **If** ~80% of it is spent → **STOP**, and report the exact state in the Output format. Say what landed, what did not, and the next action that finishes the release.
 4. Confirm the inputs: `VERSION` (semver, required) and `FID` (credit issue, optional).
diff --git a/.opencode/agents/utility-pre-release-check.md b/.opencode/agents/utility-pre-release-check.md
index d0326a871..967bec56e 100644
--- a/.opencode/agents/utility-pre-release-check.md
+++ b/.opencode/agents/utility-pre-release-check.md
@@ -39,7 +39,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Throughout the audit:
    - Read the file behind every search hit before you record a finding.
    - Track your turn budget.
diff --git a/DETAILS.md b/DETAILS.md
index 919cf7d4e..ea16b71e1 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -60,7 +60,7 @@ Everything a senior team would otherwise write down over years, in files you can
 | [Writing rules](.bkit/authoring.md) | 50+ | How every prompt, workflow, rule and doc is worded, [matched practice by practice](.bkit/authoring.md#who-says-what) against Anthropic's, OpenAI's and Google's prompting guides, so one text works on every model. |
 | [Guardrails](.bkit/providers.md#guardrails) | 10+ hook files | Block dangerous commands and secret reads, and make agents investigate before they edit, on all five AI tools. |
 | [Audits](.bkit/pipeline.md#audits) | 35 | Security, privacy, accessibility, performance, reliability, database, LLM usage, cost and more. Findings feed straight into a plan. |
-| [Project docs](.bkit/templates/docs/) | 10 + [index](.agents/docs.md) | Architecture, data schema, deployments, testing, security, monitoring, design system, tech stack, setup, and an index telling each agent what to read at each step. |
+| [Project docs](.bkit/templates/docs/) | 10 + [index](.agents/docs.md) | Starters for architecture, data schema, deployments, testing, security, monitoring, design system, tech stack, noise and setup. You copy and own them, and bkit warns without blocking when one is missing or still the starter. An index tells each agent what to read at each step. |
 | [Templates](.bkit/templates.md) | 60+ | A full CI pipeline, cloud agents, git hooks, linters, dependency updates, secrets sync, code search, a map of your code that marks likely problems, and 10+ ready-made connectors for your platforms. |
 
 **These are the files your agents read, so they're written for agents,** to the writing rules above: short, dense, tables over prose. For day-to-day use, start with [`.bkit/README.md`](.bkit/README.md); for every agent in the order it runs, see the [pipeline reference](.bkit/pipeline.md).
diff --git a/README.md b/README.md
index 373e23b48..34bc49483 100644
--- a/README.md
+++ b/README.md
@@ -96,7 +96,7 @@ Each phase has its own command. Start where your work needs it. [Full workflow,
 
 ## What comes with it?
 
-Installation provides the agents, workflows, rules, guardrails, audit checklists and project-document structure. It also supplies [optional templates](DETAILS.md#templates) for CI, code search, quality checks, cloud agents, service connectors and dependency updates. Copy the templates you want and adapt them to your project.
+Installation provides the agents, workflows, rules, guardrails and audit checklists, plus starter templates for ten project documents that you copy, fill in and own. bkit warns, without blocking, when a document your agents need is missing or still the starter. It also supplies [optional templates](DETAILS.md#templates) for CI, code search, quality checks, cloud agents, service connectors and dependency updates. Copy the templates you want and adapt them to your project.
 
 See [other capabilities](DETAILS.md#what-else-you-get) for switching tools, running features in parallel and keeping your tracker organised.
 
diff --git a/dist/checks/after/index.js b/dist/checks/after/index.js
index b5e8244bc..a2d57dbfa 100644
--- a/dist/checks/after/index.js
+++ b/dist/checks/after/index.js
@@ -11,7 +11,7 @@ import { detectOpencodeYmlProviderDrift } from "../../install/modules/opencode.j
 import { detectManagedDuplicate, detectManagedStale } from "./managed.js";
 import { buildCloudDashboardsAdvisory, detectCiRouterSecrets, detectGhMcpToken } from "./auth.js";
 import { buildCloudSetupAdvisory, buildGithubProjectAdvisory, buildGithubProjectTokenScopeAdvisory, buildTrackerSetupAdvisory, buildTrivyProtectionAdvisory, detectActionsWritePermissions, detectMainBranchProtection, } from "./github.js";
-import { buildDepUpdaterSetupAdvisory, detectBkitStubs, detectValeMissing, detectValePackageNotSynced, detectWorkflowLintToolsMissing, } from "./tools.js";
+import { buildDepUpdaterSetupAdvisory, detectBkitStubs, detectProjectDocs, detectValeMissing, detectValePackageNotSynced, detectWorkflowLintToolsMissing, } from "./tools.js";
 import { detectBkitCloudYmlAlwaysTrueGate, detectCiScriptsOldNames, detectCiYmlCapstoneContractDrift, detectCiYmlMissingActionlint, detectCiYmlRunInjection, detectGhaFloatingTags, detectRunLevelsNotComposed, detectTaggedTestsWithoutCiHome, detectTestIntegrationEnv, detectTurboIntegrationInputs, } from "./ci-yml.js";
 import { dropTipSilencedAdvisories, setupTipsChecklistLines, setupTipsMarkdownLines, } from "../tips/index.js";
 // ---------------------------------------------------------------------------
@@ -371,6 +371,9 @@ export function runPostInstallCheck(preflightAdvisories, cwd = process.cwd(), su
     // bkit-stub sentinels in shipped templates — one advisory per still-commented stub.
     for (const stub of detectBkitStubs(cwd))
         phase3.push(stub);
+    // Project documents (docs/*.md): missing, empty, starter-only or unindexed. Advisory only.
+    for (const f of detectProjectDocs(cwd, onSuppressed))
+        phase3.push(f);
     // turbo.json inputs for cache-replay safety (KN-24).
     for (const f of detectTurboIntegrationInputs(cwd))
         phase3.push(f);
diff --git a/dist/checks/after/tools.js b/dist/checks/after/tools.js
index 9284c03cc..ef184d4c1 100644
--- a/dist/checks/after/tools.js
+++ b/dist/checks/after/tools.js
@@ -4,6 +4,10 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import { readPackageJson } from "../../shared/package-json.js";
+import { readTextFile } from "../../shared/json.js";
+import { getPkgRoot } from "../../shared/package-roots.js";
+import { PROJECT_DOC_TOPICS, PROJECT_INDEX_PATH, findIndexedEquivalent, inspectRepoFile, legacyStarterTopic, normalizeLegacyText, projectDocPath, readProjectIndex, starterPath, } from "../../install/project-docs.js";
+import { isAdvisorySuppressed } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import { DEP_UPDATER_NAMES, findDepUpdaterConfigs, } from "../../shared/dep-updater.js";
 /** True when `cmd --version` runs (binary on PATH, exits 0). */
@@ -333,3 +337,153 @@ export function buildDepUpdaterSetupAdvisory(cwd) {
             'Use one updater, not both, and set `bkit.dependencies.updater` to its name (`"renovate"` or `"dependabot"`) in package.json. To silence this advisory, set it to `"none"`. See .bkit/templates.md.',
     };
 }
+// ---------------------------------------------------------------------------
+// Project documentation adoption and population
+// ---------------------------------------------------------------------------
+/** Text of a topic's current starter: the package copy first, then the consumer's own copy. */
+function readStarterText(cwd, topic) {
+    for (const base of [getPkgRoot(), cwd]) {
+        const read = readTextFile(path.join(base, starterPath(topic)));
+        if (read.ok)
+            return read.text;
+    }
+    return null;
+}
+/** True when `rel` is a repo-relative path with no parent or absolute segments. */
+function isInTreePath(rel) {
+    if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel))
+        return false;
+    return !rel.split(/[\\/]/).includes("..");
+}
+/** Mechanical read of a project document: empty, an untouched starter, or a candidate. */
+function assessDocText(cwd, topic, text) {
+    if (text.trim() === "")
+        return "empty";
+    const normalized = normalizeLegacyText(text);
+    const legacy = legacyStarterTopic(text);
+    if (legacy === topic)
+        return "unpopulated";
+    const starter = readStarterText(cwd, topic);
+    if (starter !== null && normalizeLegacyText(starter) === normalized)
+        return "unpopulated";
+    // Headings, comments and rules only: nothing a project wrote.
+    const meaningful = normalized
+        .split("\n")
+        .map((l) => l.trim())
+        .filter((l) => l !== "" && !l.startsWith("#") && !/^<!--.*-->$/.test(l) && !/^[-*_|: ]+$/.test(l));
+    return meaningful.length === 0 ? "unpopulated" : "candidate";
+}
+/**
+ * Report the state of the ten project documents (`docs/architecture.md` ... `docs/setup.md`):
+ * the index missing, a document absent, empty, an untouched starter, present but unindexed, or
+ * unreadable. A document the index lists at another path (same basename, or a Scope cell
+ * `Equivalent to docs/<topic>.md`) counts for its topic. Findings are advisories only and read no
+ * file outside the repository. A document that differs from every starter is a candidate for
+ * the agent to assess; the mechanical read makes no claim about what it covers.
+ */
+export function detectProjectDocs(cwd, onSuppressed) {
+    const index = readProjectIndex(cwd);
+    const rows = index.status === "ok" ? index.rows : [];
+    const indexedPaths = new Set(rows.map((r) => r.path));
+    const missing = [];
+    const empty = [];
+    const unpopulated = [];
+    const unindexed = [];
+    const ambiguous = [];
+    for (const topic of PROJECT_DOC_TOPICS) {
+        const recommended = projectDocPath(topic);
+        const equivalent = findIndexedEquivalent(rows, topic);
+        const defaultState = inspectRepoFile(cwd, recommended);
+        let target = recommended;
+        if (defaultState === "absent") {
+            if (equivalent === null) {
+                missing.push(recommended);
+                continue;
+            }
+            target = equivalent;
+        }
+        if (!isInTreePath(target)) {
+            ambiguous.push(`${target} (${recommended}: it resolves outside the repository)`);
+            continue;
+        }
+        const state = target === recommended ? defaultState : inspectRepoFile(cwd, target);
+        if (state === "absent") {
+            missing.push(recommended);
+            continue;
+        }
+        if (state !== "regular") {
+            ambiguous.push(`${target} (${state.unsafe})`);
+            continue;
+        }
+        const read = readTextFile(path.join(cwd, target));
+        if (!read.ok) {
+            ambiguous.push(`${target} (it could not be read)`);
+            continue;
+        }
+        const assessed = assessDocText(cwd, topic, read.text);
+        if (assessed === "empty")
+            empty.push(target);
+        else if (assessed === "unpopulated")
+            unpopulated.push(target);
+        else if (index.status === "ok" && !indexedPaths.has(target))
+            unindexed.push(target);
+    }
+    const findings = [];
+    if (index.status === "missing") {
+        findings.push({
+            id: "project-docs-index-missing",
+            severity: "advisory",
+            detect: `${PROJECT_INDEX_PATH} is absent, so agents have no list of the project's own documents to consult.`,
+            action: `Run \`bkit install\` to write ${PROJECT_INDEX_PATH}, then add a row under \`## Project Documents\` for each project document you keep. Until then agents warn and fall back to repository evidence.`,
+        });
+    }
+    else if (index.status === "unreadable") {
+        ambiguous.push(`${PROJECT_INDEX_PATH} (${index.reason})`);
+    }
+    if (missing.length > 0) {
+        findings.push({
+            id: "project-docs-missing",
+            severity: "advisory",
+            detect: `No project document covers: ${missing.join(", ")}.`,
+            action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply.`,
+        });
+    }
+    if (empty.length > 0) {
+        findings.push({
+            id: "project-docs-empty",
+            severity: "advisory",
+            detect: `These project documents are empty: ${empty.join(", ")}.`,
+            action: `Write the project's facts into each file, or delete it and remove its row from ${PROJECT_INDEX_PATH}. Agents cannot use an empty document.`,
+        });
+    }
+    if (unpopulated.length > 0) {
+        findings.push({
+            id: "project-docs-unpopulated",
+            severity: "advisory",
+            detect: `These project documents still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
+            action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes.`,
+        });
+    }
+    if (unindexed.length > 0) {
+        findings.push({
+            id: "project-docs-unindexed",
+            severity: "advisory",
+            detect: `These project documents exist but ${PROJECT_INDEX_PATH} does not list them: ${unindexed.join(", ")}.`,
+            action: `Add a row for each to \`## Project Documents\` in ${PROJECT_INDEX_PATH}, or run \`bkit upgrade\` to register the default paths.`,
+        });
+    }
+    if (ambiguous.length > 0) {
+        findings.push({
+            id: "project-docs-ambiguous",
+            severity: "advisory",
+            detect: `bkit did not read these project documents or the index: ${ambiguous.join("; ")}.`,
+            action: `Replace each with a regular file inside the repository (no symbolic link, no \`..\` path), or repair the \`## Project Documents\` table in ${PROJECT_INDEX_PATH}. bkit changes none of them itself.`,
+        });
+    }
+    return findings.filter((f) => {
+        if (!isAdvisorySuppressed(cwd, f.id, f.severity))
+            return true;
+        onSuppressed?.({ id: f.id, scope: "." });
+        return false;
+    });
+}
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index c6784d45a..b90846e2c 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -6,6 +6,7 @@ import { coversList } from "./plans.js";
 import { issueIdOf } from "./fids.js";
 import { parseDecisionItems } from "./decisions.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
+import { parseJson } from "../../shared/json.js";
 import { challengeResolution, taskVerified } from "./summary-findings.js";
 export const SUMMARY_WORKFLOWS = ["plan", "design", "build", "debug", "ship"];
 /** Per workflow and verdict, the next command the summary recommends. */
@@ -67,6 +68,67 @@ const taskGroupOf = (r) => {
     const taskGroup = r.group ?? r.subPlan;
     return typeof taskGroup === "number" ? taskGroup : undefined;
 };
+const WARNING_FIELDS = [
+    "topic",
+    "gap",
+    "recommendedPath",
+    "alternativeEvidence",
+    "action",
+];
+/** Raw inputs (`*-input-N.md`) are untrusted: never a source of warnings. */
+const isRawInput = (rel) => /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel);
+/**
+ * The structured records under `## Documentation Warnings` (one JSON object per line in a
+ * `jsonl` fence) of the run's own step artifacts, merged by normalised topic and gap. A missing
+ * section, a malformed line or a record without all five non-empty fields is skipped.
+ */
+function documentationWarnings(rows, read) {
+    const merged = new Map();
+    const seenFiles = new Set();
+    for (const row of rows) {
+        if (row.type !== "step-done")
+            continue;
+        for (const rel of artifactsOf(row)) {
+            if (!rel.endsWith(".md") || isRawInput(rel) || seenFiles.has(rel))
+                continue;
+            seenFiles.add(rel);
+            const text = read(rel);
+            if (text === null)
+                continue;
+            const section = /^## Documentation Warnings[ \t]*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(text);
+            const fence = section === null ? null : /```jsonl[ \t]*\r?\n([\s\S]*?)```/.exec(section[1]);
+            if (fence === null)
+                continue;
+            for (const line of fence[1].split(/\r?\n/)) {
+                const parsed = parseJson(line);
+                if (!parsed.ok)
+                    continue;
+                const value = parsed.value;
+                if (typeof value !== "object" || value === null || Array.isArray(value))
+                    continue;
+                const rec = value;
+                const fields = WARNING_FIELDS.map((f) => rec[f]);
+                if (!fields.every((f) => typeof f === "string" && f.trim() !== ""))
+                    continue;
+                const [topic, gap, recommendedPath, evidence, action] = fields.map((f) => f.trim());
+                const key = `${topic.toLowerCase()}\u0000${gap.toLowerCase()}`;
+                const found = merged.get(key) ?? {
+                    topic: topic.toLowerCase(),
+                    gap: gap.toLowerCase(),
+                    recommendedPath: recommendedPath,
+                    evidence: [],
+                    actions: [],
+                };
+                if (!found.evidence.includes(evidence))
+                    found.evidence.push(evidence);
+                if (!found.actions.includes(action))
+                    found.actions.push(action);
+                merged.set(key, found);
+            }
+        }
+    }
+    return [...merged.values()];
+}
 /** The run's step rows grouped per step (and task group), in first-seen order. */
 function stepGroups(rows) {
     const groups = new Map();
@@ -341,6 +403,18 @@ export function buildSummary(input) {
     }
     if (unconfirmed.length > 0)
         out.push("", "## Ship Completed with Assumed Items", "", "Accepted without the owner and not confirmed; each is a `needs-decision` deferral.", "", ...unconfirmed.map((u) => `- ${u}`));
+    // Documentation warnings: advisory only, never part of the verdict.
+    const docWarnings = documentationWarnings(input.rows, read);
+    if (docWarnings.length > 0) {
+        out.push("", "## Documentation Warnings", "");
+        for (const w of docWarnings) {
+            out.push(`- **${w.topic}** (${w.gap}) — \`${w.recommendedPath}\``);
+            for (const e of w.evidence)
+                out.push(`  - Evidence: ${e}`);
+            for (const a of w.actions)
+                out.push(`  - Action: ${a}`);
+        }
+    }
     // Risks and action items.
     const items = [];
     for (const g of groups) {
diff --git a/docs/architecture.md b/docs/architecture.md
index 6682179ba..52c5edc00 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -26,6 +26,10 @@ The purpose-based view lives in [Components](components.md): what each major par
 
 Workflow commands pass explicit session or exact-run ownership into the shared tracker helper. Provider adapters own reading, creating and updating comments; workflows consume a common delivery result and an optional fallback file. A Git-common `bkit-outbox` directory holds optional progress source and run associations across linked worktrees. Deleting it starts a fresh progress comment without changing authoritative workflow status. Remote comment text is recognition evidence, never the source for reconstructing a body.
 
+## Project documents boundary
+
+The ten project documents (`docs/architecture.md` ... `docs/setup.md`) are consumer-owned. Their starters ship in `.bkit/templates/docs/`, which `bkit install` and `bkit upgrade` refresh as plain template copies. The installer never creates a project document. `.bkit/core/engine/install/project-docs.ts` holds the one topic catalog, the legacy-starter digests and two surgical edits: remove the ownership wrapper lines of a document an older release installed as a managed block (every other byte stays), and insert a `Project Documents` row in `.agents/docs.md` below the closing `bkit:end`. An ambiguous wrapper, an unsafe path or an unreadable index is left as it is and reported. `bkit check` and `bkit doctor` only detect: `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts` raises advisories through the shared checklist and the `bkit.advisories.ignore` opt-out. Uninstall removes the template folder and keeps every adopted document.
+
 ## Package Boundaries
 
 ```
diff --git a/docs/observability.md b/docs/observability.md
index d603f7544..12c051c03 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -193,6 +193,26 @@ Post-install findings via `formatChecklist(ctx.advisories)` (`.bkit/core/engine/
 - Advisories (Phase 1 + Phase 3) → numbered checklist after install.
 - `bkit check` (dry-run) → Phase 1 + Phase 3 advisories (read-only); exit 1 on Tier-1 / Tier-2 drift. No writes.
 
+## Project documentation advisories
+
+`detectProjectDocs` (`checks/after/tools.ts`) runs in Phase 3 and returns advisories only; none blocks install, upgrade, check or doctor. A document an indexed row covers at another path (same basename, or a Scope cell `Equivalent to docs/{topic}.md`) counts for its topic. The detector never reads a symbolic link or a path outside the repository.
+
+<!-- prettier-ignore -->
+| Finding id | Raised when |
+| --- | --- |
+| `project-docs-index-missing` | `.agents/docs.md` is absent |
+| `project-docs-missing` | A recommended topic has no document and no indexed equivalent |
+| `project-docs-empty` | A covering document is empty |
+| `project-docs-unpopulated` | A covering document is still a current or legacy starter, or only headings |
+| `project-docs-unindexed` | A populated candidate exists but the index does not list it |
+| `project-docs-ambiguous` | An index row or target is unsafe, unreadable or malformed |
+
+A document that differs from every starter is a candidate for agent assessment; the check does not claim it is complete.
+
+## Phase documentation warnings
+
+Agents that consult project documents write gaps as `jsonl` records (`topic`, `gap`, `recommendedPath`, `alternativeEvidence`, `action`) under `## Documentation Warnings`. `bkit workflows summary` (`commands/workflow/summary.ts`) reads those records only from the active run's step artifacts, skips raw `*-input-*` files and malformed lines, merges records by topic and gap, and prints one `## Documentation Warnings` section in the summary. The section is advisory and never changes the verdict or failure count.
+
 ## Phase 3 Credential + Migration Findings
 
 Phase 3 emits credential findings as advisory text. Finding ids = audit trail:
diff --git a/docs/testing.md b/docs/testing.md
index 12ff5a322..5ee530195 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -693,6 +693,13 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | Unit (markdown-invariant) | No `git add -A`; staging only through `bkit ledgers`; every status write targets `{STATUS}`; the merge pinned to the gate's head (`runs gate --pr` before `prs merge --match-head`); canonical 14 step keys; Step 2 runs `status path` after the `cd` into the worktree; pre-merge pushes confined to Steps 2, 3, 4, Commit + Push Bookkeeping, 10 and Failure Remediate, none forced; no fence checks out or pushes `dev` by hand, `branches sync-dev` brings it level; Failure Path = one `workflows fail` + one `workflows handover --flush`; issue-less runs and the main guard — a ship of `dev` / `main` prints the engine refusal, releases the lock and stops, the naming warning fires when the branch lacks `{FID}` and `ISSUE_ID` is empty, the Step 10 label re-read and Step 14 label calls skip when `ISSUE_ID` is empty, and the MCP merge asserts base `dev` |
 | `.bkit/core/engine/checks/status-holes.test.ts` | Unit | Expected steps and commands derived from each of the five workflow mds (no parallel table); step / evidence / unexercised / unexpected classification; no orphan rows in any workflow, build's pause and sub-rows named by the contract; verdict metadata; advisory exit 0 on holey fixture; sweep summary line counting holey runs |
 
+## Project documentation lifecycle coverage
+
+- `install/project-docs.test.ts` and the install and upgrade integration tests cover template refresh, the ownership migration, index registration and uninstall preserving adopted documents.
+- `checks/after/tools.test.ts` and `checks/after/index.test.ts` cover `detectProjectDocs` states, equivalents, unsafe paths, suppression and the advisory-only severity.
+- `commands/workflow/summary.test.ts` and `commands/workflow/workflows.integration.test.ts` cover warning aggregation for the active run through the real `workflows summary` command.
+- `audits/repo/shipped-docs-refs.test.ts` covers the responsibility inventory in the workflow and prompt catalogs, the named references and the warning contracts.
+
 ## Key test files
 
 Workflow progress has focused Unit coverage for position math and command output, Integration coverage for real saved status/plan files and completion producers, and renderer coverage for each supported host. The external Claude app's 375px layout is an owner-run check: `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` records its procedure, screenshots and explicit outcome. A character-count assertion does not verify app typography.
