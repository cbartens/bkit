## Owner answers

### Open Question 1

The issue is a bug-shape issue, so it has no `Narrative` or `Success Criteria`, and the Acceptance Scenario carries the `⚠️ MISSING` marker. → The owner resolves it by choosing wording below, or writing their own, before ticking the Acceptance Scenario box.

**Answer:** A

Decision: none

### Open Question 2

The advisory hole detector (`checks/status-holes.ts`) lists any recorded step the current workflow lacks as `unexpected (invented names)`, so a pre-change run holding `ship-failure-*` rows gets two `unexpected` entries. → The owner decides.

**Answer:** A

Decision: 911-status-holes-retired-ship-rows-unexpected

### Open Question 3

The owner's scope says that when ship stops on a red CI run, the stop message names `/bkit-debug {FID}`. Three places stop on a red run before the merge or after it: the Step 2 CI wait on a PR ship opened itself (`prs checks` with a failed check), the Step 10 merge gate (`runs gate` exit 12, including an owner's Stop at the Merge Question on a used-up regenerable red run), and the post-merge squash capstone in Close Workflow (Step 12 after the renumber, `runs gate --capstone-only` exit 12). The first two are pre-merge red-CI stops on the feature branch and are covered by the scope sentence; the post-merge capstone runs on `dev`. → The owner decides whether the post-merge capstone is covered.

**Answer:** A

Decision: 911-ship-red-ci-next-step-flag
