Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

### C1 — The required manual batch recipe has no build or verification coverage

- **Source:** `plan-input-1.md` lines 521-524 explicitly require documenting the manual batch recipe, with the last-FID limitation and the prohibition on batching migrations. Only a batch _command_ is out of scope.
- **Gap:** The plan promises that the manual recipe ships in docs (lines 259 and 269), but Tasks 14 and 15 scope only the manual batch **caveat** and the held handoff (lines 982 and 1001). The Derived Test Matrix checks the caveat and handoff, not the recipe (lines 189-190). Neither existing README contains a batch recipe. An implementer can satisfy every listed test while shipping no instructions for combining and landing held builds manually.
- **Required plan update:** Explicitly assign the manual recipe to Task 15's README update and completion criteria, including the user's responsibility for docs sync, sweep, PR and CI. Add one Derived Test Matrix row and matching Task 15 test verifying that the recipe exists alongside its required limitations. This fits the stated task and group caps; no batch verb or workflow change is needed.

## OPTIONAL

None.

## OUT OF SCOPE

None.
