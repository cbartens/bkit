Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

PASS

- No unresolved finding, failing check, open task, accepted limitation or open deferral.

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/864-move-project-docs/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/864-move-project-docs/plan-v1-draft.md`, `docs/plans/202611/logs/864-move-project-docs/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/864-move-project-docs/related-deferrals.md`, `docs/plans/202611/logs/864-move-project-docs/related-failures.md`, `docs/plans/202611/logs/864-move-project-docs/related-issues.md` |
| plan-review | CONCERNS | 4 | 1 | `docs/plans/202611/logs/864-move-project-docs/plan-review-1.md`, `docs/plans/202611/logs/864-move-project-docs/plan-review-2.md`, `docs/plans/202611/logs/864-move-project-docs/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/864-move-project-docs/plan-v2-reviewed.md`, `docs/plans/202611/logs/864-move-project-docs/plan-update-check.md` |

## Resolved Findings

- plan-review CONCERNS, resolved by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/864-move-project-docs/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/864-move-project-docs/plan-v1-draft.md`, `docs/plans/202611/logs/864-move-project-docs/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/864-move-project-docs/related-deferrals.md`, `docs/plans/202611/logs/864-move-project-docs/related-failures.md`, `docs/plans/202611/logs/864-move-project-docs/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/864-move-project-docs/plan-review-1.md`, `docs/plans/202611/logs/864-move-project-docs/plan-review-2.md`, `docs/plans/202611/logs/864-move-project-docs/plan-scope-check.md` |
| plan-apply-review | PASS | 1 | `docs/plans/202611/logs/864-move-project-docs/plan-v2-reviewed.md`, `docs/plans/202611/logs/864-move-project-docs/plan-update-check.md` |

## Acceptance Scenario

### Narrative

Move project documentation from bkit-managed content to copy-and-own templates while actively encouraging consumers to adopt and populate it. Keep explicit, task-relevant document references in rules, prompts and the plan template. Missing or unpopulated documentation must produce visible, non-blocking warnings rather than broken workflows or silent skips.

### Success Criteria

- [ ] Move all ten current `.bkit/shared/docs/` files to `.bkit/templates/docs/`: architecture, technology, security, data-schema, testing, deployments, observability, design, noise and setup. Install/upgrade refresh template copies; adopted project docs are consumer-owned and preserved. Keep essential bkit operating instructions current in managed guides/rules so they do not depend on optional adoption.
- [ ] Complete a responsibility-by-responsibility review of all shared rules, workflows, prompts and the plan template, including those with no existing doc references. Determine which `docs/*.md` files each should consult, add missing named references and correct inappropriate ones, with explicit applicability and warning-and-continue behavior. Record the reviewed responsibility, recommended doc paths and reason or not-applicable outcome so completeness can be checked. Merely adjusting existing mentions does not satisfy this criterion. Support design, audits and debug without a plan, build's issue-to-plan conversion and generated plans.
- [ ] Ship `.agents/docs.md` with only absolute core operational references inside `bkit:start/end`. Register adopted project docs in the consumer-owned Project Documents section when starters are copied into `docs/`, without duplicates or overwriting existing entries. An indexed but untouched starter still generates warnings.
- [ ] Add actionable, non-blocking adoption/population advisories through the existing advisory system. Accept indexed equivalent documents and distinguish missing, empty/template-only and populated documents. Use agent assessment for substantive coverage; do not claim semantic completeness from a mechanical check.
- [ ] Update documentation maintenance utility prompts, ship documentation updates and documentation audit templates to check presence, index accuracy and project content explicitly. Report absence and incomplete coverage; populate within authorized scope and evidence. Missing files cannot be silently skipped or yield a false clean/completion report.

### Process Sketch

- **WHEN** a fresh project installs bkit **→ THEN** it gets starters in `.bkit/templates/docs/` and can run a workflow before adopting them.
- **WHEN** a maintainer adopts and indexes an untouched starter **→ THEN** a relevant workflow warns that it still needs project content.
- **WHEN** the index names a populated equivalent at a different path **→ THEN** the workflow consults it and records its actual path and section.
- **WHEN** several agents find the same gap **→ THEN** their reports retain the evidence and the workflow shows one warning for that gap.
- **WHEN** a legacy project upgrades **→ THEN** existing project text and index entries survive and only valid ownership wrappers are removed from the ten migrated docs.
- **WHEN** an applicable topic remains unclear after consulting available sources **→ THEN** the agent records the uncertainty and applies existing safeguards.

### Concrete Example

**Setup:** A maintainer has a fresh bkit installation and an existing architecture note at `engineering/system.md`.

**Steps:**

1. The maintainer copies the security starter into `docs/security.md` using the documented adoption flow.
2. The maintainer registers the architecture note as the architecture topic in Project Documents and starts planning a CLI change.
3. The planner cites the architecture note and the section it used. It reports that the security starter lacks project information and names the repository evidence it checked.
4. Reviewers also identify that security gap. Their reports retain it and the plan summary shows it once.

**Outcome:** The maintainer can see what evidence the plan used and how to populate the security document. The documentation gap does not prevent planning.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Fresh consumer adopts no docs | Templates available; relevant warnings/advisories; workflows remain usable. |
| Missing document index | Warn, discover available project evidence, continue without inventing an index or facts. |
| Starter exists and is indexed but contains only template instructions/placeholders | Warn that it is unpopulated, even if the file is nonempty. |
| Indexed equivalent uses a different path | Consult it; do not emit a false missing-default-path warning. |
| Populated document lacks information needed for this change | Agent reports the specific coverage gap and alternative evidence/uncertainty. |
| Topic does not apply | Mark not applicable; no adoption warning for that task. |
| Multiple agents find the same gap | Preserve reports and consolidate the workflow's visible warning list. |
| Design/debug/audit runs without a plan | Use the same direct references, project index and warning contract. |
| Existing consumer upgrades | Remove ownership delimiters and generated managed notices only from the ten migrated docs; preserve all substantive content and index entries; retire managed bookkeeping. |
| Migration runs again, a document is absent, or its markers are malformed | Repeated runs are idempotent; absent files are not created; ambiguous content is preserved and the cleanup gap is reported. |
| Missing documentation hides an unresolved requirement or unsafe uncertainty | Warning does not override existing clarification/safety gates. |
| Index has duplicate or out-of-tree entries | Keep user text, prefer safe in-repo sources and report the ambiguity when it matters. |
| Copied starter differs only in whitespace or the former ownership lines | Classify it as starter-only. |
| A write to the adopted path would overwrite a file or follow a symlink outside the repository | Preserve the existing file and surface the specific failure. |

## Open Questions

**Open Questions:** None.

- **Assumption:** The current copy-and-own adoption procedure can pair the copy and index update. A raw copy outside that procedure can be reconciled on the next install or upgrade. If a project never runs either, its maintainer must add the row explicitly.
- **Assumption:** Repository evidence can establish some constraints when relevant guidance is missing. If available evidence cannot settle a requirement or a safety decision, the existing clarification or failure route applies.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #864
```
