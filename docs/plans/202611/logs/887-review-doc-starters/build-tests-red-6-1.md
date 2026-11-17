Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 6, attempt 1

Plan: `docs/plans/202611/887-review-doc-starters-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 16 | `.bkit/core/engine/install/project-docs.test.ts` "adoptionArrows reads labelled, chained and grouped edges" | red | failure: expected [ 'docs/testing.md', …(1) ] to deeply equal [ 'docs/data-schema.md' ] |
| 16 | `.bkit/core/engine/install/project-docs.test.ts` "docPaths ignores template paths and longer suffixes" | red | failure: expected [ 'docs/noise.md', …(1) ] to deeply equal [] |

## Gaps

None.

## Lint output — `.bkit/core/engine/install/project-docs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/project-docs.test.ts

```

## Runner output — `.bkit/core/engine/install/project-docs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/project-docs.test.ts

[test-timeout-budget] load average 12.4 on 10 cores: unit limits 10700ms per test, 21400ms per hook (x2.14)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > keeps an ambiguous wrapper and reports it
[bkit-install] docs/noise.md: left as it is — one of `bkit:start` / `bkit:end` is missing, so bkit cannot tell its wrapper from your text. Delete any `bkit:start` / `bkit:end` / `bkit:managed` lines by hand; the file is yours.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row when an indexed equivalent covers the topic
[bkit-install] skip: docs/noise.md — .agents/docs.md already lists docs/other/noise.md for this topic, so no row was added. Add a row by hand if both documents matter.

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > reports instead of throwing when docs is a regular file
[bkit-install] docs/architecture.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/technology.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/security.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/data-schema.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/testing.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/deployments.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/observability.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/design.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/noise.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/setup.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > registers a present default doc when its only equivalent row points at a missing file
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ❯ .bkit/core/engine/install/project-docs.test.ts (36 tests | 2 failed) 89ms
   ✓ stripManagedWrapper (4)
     ✓ removes the wrapper and keeps every other byte 3ms
     ✓ keeps CRLF line endings 0ms
     ✓ returns unmarked content as it is 0ms
     ✓ reports one lone marker, reversed markers and fenced markers as ambiguous 0ms
   ✓ legacy starter digests (2)
     ✓ has a digest for every topic 0ms
     ✓ recognises the real legacy text of a topic at the recorded revision 4ms
   ✓ syncProjectDocs (9)
     ✓ migrates the wrapper and registers a row, then repeats as a no-op 6ms
     ✓ writes nothing on a dry run 2ms
     ✓ keeps an ambiguous wrapper and reports it 2ms
     ✓ adds no row when an indexed equivalent covers the topic 5ms
     ✓ reports instead of throwing when docs is a regular file 6ms
     ✓ registers a present default doc when its only equivalent row points at a missing file 4ms
     ✓ does not add a second row for a default doc indexed through a markdown link 3ms
     ✓ syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row 4ms
     ✓ adds no row and reports a problem when the index has a row it cannot read 3ms
   ✓ adoptedProjectDocPath (1)
     ✓ adoptedProjectDocPath returns the recommended path, an indexed equivalent or null 7ms
   ✓ starter docs (18)
     ✓ starter shape: components 4ms
     ✓ components register row Scope equals its Purpose line 1ms
     ✓ components Fill these first matches the adoption order 1ms
     ✓ starter shape: technology 1ms
     ✓ starter shape: design 1ms
     ✓ starter shape: architecture 1ms
     ✓ starter shape: setup 1ms
     ✓ setup index row marks Build and Debug as read when relevant 0ms
     ✓ starter shape: security 1ms
     ✓ starter shape: observability 1ms
     ✓ starter shape: testing 3ms
     ✓ testing marks every section slot or practice and has no box-drawing diagram 3ms
     ✓ starter shape: data-schema 2ms
     ✓ starter shape: deployments 2ms
     ✓ deployments marks every section slot or practice 1ms
     ✓ starter shape: noise 1ms
     ✓ capabilities names rollup and refresh and when to run each 1ms
     ✓ capabilities starter has the Generated document opener, Fill these first, register row and completion checks 1ms
   ❯ adoption chart helpers (2)
     × adoptionArrows reads labelled, chained and grouped edges 8ms
     × docPaths ignores template paths and longer suffixes 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > adoption chart helpers > adoptionArrows reads labelled, chained and grouped edges
AssertionError: expected [ 'docs/testing.md', …(1) ] to deeply equal [ 'docs/data-schema.md' ]

- Expected
+ Received

  [
-   "docs/data-schema.md",
+   "docs/testing.md",
+   "docs/observability.md",
  ]

 ❯ .bkit/core/engine/install/project-docs.test.ts:693:46
    691|       chart,
    692|     );
    693|     expect(solid.get("docs/deployments.md")).toEqual(["docs/data-schem…
       |                                              ^
    694|     expect(solid.get("docs/security.md")).toEqual(["docs/architecture.…
    695|     expect(solid.get("docs/testing.md")).toEqual(["docs/security.md"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > adoption chart helpers > docPaths ignores template paths and longer suffixes
AssertionError: expected [ 'docs/noise.md', …(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "docs/noise.md",
+   "docs/technology.md",
+ ]

 ❯ .bkit/core/engine/install/project-docs.test.ts:703:83
    701|
    702|   it("docPaths ignores template paths and longer suffixes", () => {
    703|     expect(docPaths("see .bkit/templates/docs/technology.md and docs/n…
       |                                                                                   ^
    704|     expect(docPaths("read docs/technology.md, then (docs/noise.md)."))…
    705|       "docs/noise.md",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 34 passed (36)
   Start at  23:36:39
   Duration  502ms (transform 33%, setup 31%, tests 29%, import 5%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-i4VhOz/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
