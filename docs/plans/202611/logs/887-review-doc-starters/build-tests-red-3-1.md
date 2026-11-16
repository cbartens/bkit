Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/887-review-doc-starters-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: security" | red | failure: expected { shape: [ …(20) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 6 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: observability" | red | failure: expected { shape: [ …(20) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 7 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: testing" | red | failure: expected { shape: [ …(24) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 7 | `.bkit/core/engine/install/project-docs.test.ts` "testing marks every section slot or practice and has no box-drawing diagram" | red | failure: expected [ '## Project facts to record', …(10) ] to deeply equal [] |
| 8 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: data-schema" | red | failure: expected { shape: [ …(15) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 8 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: deployments" | red | failure: expected { shape: [ …(23) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 8 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: noise" | red | failure: expected { shape: [ …(12) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 8 | `.bkit/core/engine/install/project-docs.test.ts` "deployments marks every section slot or practice" | red | failure: expected [ '## Project facts to record', …(11) ] to deeply equal [] |
| 9 | `.bkit/core/engine/install/project-docs.test.ts` "capabilities names rollup and refresh and when to run each" | red | failure: expected '`pnpm bkit:graph:rollup` rewrites eve…' to match /working tree/ |
| 9 | `.bkit/core/engine/install/project-docs.test.ts` "capabilities starter has the Generated document opener, Fill these first, register row and completion checks" | red | failure: expected false to be true // Object.is equality |

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

[test-timeout-budget] load average 9.8 on 10 cores: unit limits 9400ms per test, 18800ms per hook (x1.88)

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

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ❯ .bkit/core/engine/install/project-docs.test.ts (32 tests | 10 failed) 50ms
   ✓ stripManagedWrapper (4)
     ✓ removes the wrapper and keeps every other byte 2ms
     ✓ keeps CRLF line endings 0ms
     ✓ returns unmarked content as it is 0ms
     ✓ reports one lone marker, reversed markers and fenced markers as ambiguous 0ms
   ✓ legacy starter digests (2)
     ✓ has a digest for every topic 0ms
     ✓ recognises the real legacy text of a topic at the recorded revision 2ms
   ✓ syncProjectDocs (8)
     ✓ migrates the wrapper and registers a row, then repeats as a no-op 4ms
     ✓ writes nothing on a dry run 1ms
     ✓ keeps an ambiguous wrapper and reports it 2ms
     ✓ adds no row when an indexed equivalent covers the topic 2ms
     ✓ reports instead of throwing when docs is a regular file 5ms
     ✓ registers a present default doc when its only equivalent row points at a missing file 2ms
     ✓ does not add a second row for a default doc indexed through a markdown link 2ms
     ✓ adds no row and reports a problem when the index has a row it cannot read 2ms
   ❯ starter docs (18)
     ✓ starter shape: components 3ms
     ✓ components register row Scope equals its Purpose line 0ms
     ✓ components Fill these first matches the adoption order 1ms
     ✓ starter shape: technology 1ms
     ✓ starter shape: design 1ms
     ✓ starter shape: architecture 1ms
     ✓ starter shape: setup 1ms
     ✓ setup index row marks Build and Debug as read when relevant 0ms
     × starter shape: security 6ms
     × starter shape: observability 1ms
     × starter shape: testing 3ms
     × testing marks every section slot or practice and has no box-drawing diagram 1ms
     × starter shape: data-schema 1ms
     × starter shape: deployments 2ms
     × deployments marks every section slot or practice 1ms
     × starter shape: noise 1ms
     × capabilities names rollup and refresh and when to run each 1ms
     × capabilities starter has the Generated document opener, Fill these first, register row and completion checks 0ms

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: security
AssertionError: expected { shape: [ …(20) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/architecture.md",
+     "Finish against: got , want docs/data-schema.md",
+   ],
+   "row": [
+     "register row is not projectDocRow(security): ",
+     "register row Scope differs from the Purpose line",
+   ],
+   "shape": [
+     "opener line 'Starter document.'",
+     "intro label Fill these first",
+     "intro label Finish against",
+     "intro label Where the facts come from",
+     "intro label If it does not apply",
+     "intro label Completion checks",
+     "numbered fill steps",
+     "rules box Not here",
+     "rules box Update when",
+     "## Open questions",
+     "heading ## Trust boundaries",
+     "heading ## Authentication",
+     "heading ## Authorization",
+     "heading ## Input validation",
+     "heading ## Rate limiting",
+     "heading ## Secrets",
+     "heading ## PII",
+     "heading ## Open questions",
+     "no ## Project facts to record",
+     "bracketed fields in the skeleton",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:518:7
    516|         "## Open questions",
    517|       ]),
    518|     ).toEqual(CONFORMS);
       |       ^
    519|   });
    520|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: observability
AssertionError: expected { shape: [ …(20) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/architecture.md",
+     "Finish against: got , want docs/security.md",
+   ],
+   "row": [
+     "register row is not projectDocRow(observability): ",
+     "register row Scope differs from the Purpose line",
+   ],
+   "shape": [
+     "opener line 'Starter document.'",
+     "intro label Fill these first",
+     "intro label Finish against",
+     "intro label Where the facts come from",
+     "intro label If it does not apply",
+     "intro label Completion checks",
+     "numbered fill steps",
+     "rules box Not here",
+     "rules box Update when",
+     "## Open questions",
+     "heading ## Signal pipeline",
+     "heading ## Log format",
+     "heading ## Signals",
+     "heading ## Correlation",
+     "heading ## Error tracking",
+     "heading ## Alerts",
+     "heading ## Where to look",
+     "heading ## Open questions",
+     "no ## Project facts to record",
+     "bracketed fields in the skeleton",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:533:7
    531|         "## Open questions",
    532|       ]),
    533|     ).toEqual(CONFORMS);
       |       ^
    534|   });
    535|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: testing
AssertionError: expected { shape: [ …(24) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/architecture.md",
+     "Finish against: got , want docs/data-schema.md",
+   ],
+   "row": [
+     "register row is not projectDocRow(testing): ",
+     "register row Scope differs from the Purpose line",
+   ],
+   "shape": [
+     "opener line 'Starter document.'",
+     "intro label Fill these first",
+     "intro label Finish against",
+     "intro label Where the facts come from",
+     "intro label If it does not apply",
+     "intro label Completion checks",
+     "numbered fill steps",
+     "rules box Not here",
+     "rules box Update when",
+     "## Open questions",
+     "heading ## Stack",
+     "heading ## Tiers this project has",
+     "heading ## Where tests live",
+     "heading ## Test data",
+     "heading ## CI lanes",
+     "heading ## Test reports",
+     "heading ## Running locally",
+     "heading ## Open questions",
+     "no ## Project facts to record",
+     "## CI test tiers (the bkit scaffold): a [e.g., row in every table",
+     "## CI test tiers (the bkit scaffold): a [e.g., row in every table",
+     "## CI test tiers (the bkit scaffold): a [e.g., row in every table",
+     "## Which tier does a behaviour need?: a [e.g., row in every table",
+     "## Design assertions are a dimension, not a lane: a [e.g., row in every table",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:548:7
    546|         "## Open questions",
    547|       ]),
    548|     ).toEqual(CONFORMS);
       |       ^
    549|   });
    550|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > testing marks every section slot or practice and has no box-drawing diagram
AssertionError: expected [ '## Project facts to record', …(10) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "## Project facts to record",
+   "## CI test tiers (the bkit scaffold)",
+   "## Which tier does a behaviour need?",
+   "## What each tier must do",
+   "## Test first",
+   "## Design assertions are a dimension, not a lane",
+   "## Schema-invariant DB checks (e.g. RLS coverage)",
+   "## Provision backing services fresh",
+   "## Optional hardening (adopt when the cost is justified)",
+   "## Coverage on PRs",
+   "## CI verbosity (`[verbose ci]`)",
+ ]

 ❯ .bkit/core/engine/install/project-docs.test.ts:552:41
    550|
    551|   it("testing marks every section slot or practice and has no box-draw…
    552|     expect(unmarkedSections("testing")).toEqual([]);
       |                                         ^
    553|     expect(boxDrawingLines(starterText("testing"))).toEqual([]);
    554|     expect([...sectionMarks(starterText("testing")).values()]).toConta…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: data-schema
AssertionError: expected { shape: [ …(15) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/security.md",
+     "Finish against: says none",
+   ],
+   "row": [
+     "register row is not projectDocRow(data-schema): ",
+     "register row Scope differs from the Purpose line",
+   ],
+   "shape": [
+     "opener line 'Starter document.'",
+     "intro label Fill these first",
+     "intro label Finish against",
+     "intro label Where the facts come from",
+     "intro label If it does not apply",
+     "intro label Completion checks",
+     "numbered fill steps",
+     "rules box Not here",
+     "rules box Update when",
+     "## Open questions",
+     "heading ## Overview",
+     "heading ## Functions",
+     "heading ## Open questions",
+     "no ## Project facts to record",
+     "bracketed fields in the skeleton",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:561:7
    559|     expect(
    560|       starterShape("data-schema", ["## Overview", "## Functions", "## …
    561|     ).toEqual(CONFORMS);
       |       ^
    562|   });
    563|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: deployments
AssertionError: expected { shape: [ …(23) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/observability.md, docs/testing.md",
+     "Finish against: got , want docs/data-schema.md",
+   ],
+   "row": [
+     "register row is not projectDocRow(deployments): ",
+     "register row Scope differs from the Purpose line",
+   ],
+   "shape": [
+     "opener line 'Starter document.'",
+     "intro label Fill these first",
+     "intro label Finish against",
+     "intro label Where the facts come from",
+     "intro label If it does not apply",
+     "intro label Completion checks",
+     "numbered fill steps",
+     "rules box Not here",
+     "rules box Update when",
+     "## Open questions",
+     "heading ## Environments",
+     "heading ## Release path",
+     "heading ## Secrets and env config",
+     "heading ## Branch protection",
+     "heading ## Open questions",
+     "no ## Project facts to record",
+     "## Run-level decision matrix: a [e.g., row in every table",
+     "## One run per branch or pull request: a [e.g., row in every table",
+     "## GitHub Actions pinning: a [e.g., row in every table",
+     "## GitHub Actions pinning: a [e.g., row in every table",
+     "## GitHub Actions pinning: a [e.g., row in every table",
+     "## GitHub Actions pinning: a [e.g., row in every table",
+     "## GitHub Actions pinning: a [e.g., row in every table",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:573:7
    571|         "## Open questions",
    572|       ]),
    573|     ).toEqual(CONFORMS);
       |       ^
    574|   });
    575|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > deployments marks every section slot or practice
AssertionError: expected [ '## Project facts to record', …(11) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "## Project facts to record",
+   "## Production rollback runbook",
+   "## Dev rollback runbook",
+   "## Run-level decision matrix",
+   "## One run per branch or pull request",
+   "## Workflow-file limits GitHub does not enforce visibly",
+   "## Smoke trigger plumbing",
+   "## Applying migrations at deploy time",
+   "## Build-vs-migration race",
+   "## Promote before the lanes (`bkit-tests-deploy`)",
+   "## Disable GitHub Code Quality billing",
+   "## GitHub Actions pinning",
+ ]

 ❯ .bkit/core/engine/install/project-docs.test.ts:577:45
    575|
    576|   it("deployments marks every section slot or practice", () => {
    577|     expect(unmarkedSections("deployments")).toEqual([]);
       |                                             ^
    578|     expect(sectionMarks(starterText("deployments")).get("## Production…
    579|       "slot",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: noise
AssertionError: expected { shape: [ …(12) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/observability.md",
+     "Finish against: says none",
+   ],
+   "row": [
+     "register row is not projectDocRow(noise): ",
+     "register row Scope differs from the Purpose line",
+   ],
+   "shape": [
+     "opener line 'Starter document.'",
+     "intro label Fill these first",
+     "intro label Finish against",
+     "intro label Where the facts come from",
+     "intro label If it does not apply",
+     "intro label Completion checks",
+     "numbered fill steps",
+     "rules box Not here",
+     "rules box Update when",
+     "## Open questions",
+     "heading ## Open questions",
+     "bracketed fields in the skeleton",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:585:58
    583|
    584|   it("starter shape: noise", () => {
    585|     expect(starterShape("noise", ["## Open questions"])).toEqual(CONFO…
       |                                                          ^
    586|     expect(starterText("noise")).toContain(
    587|       "| Date | Signal | Where | Change | Trigger | Why it is safe | R…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > capabilities names rollup and refresh and when to run each
AssertionError: expected '`pnpm bkit:graph:rollup` rewrites eve…' to match /working tree/

- Expected:
/working tree/

+ Received:
"`pnpm bkit:graph:rollup` rewrites everything outside the Overrides block, so do not edit the generated body. To add a capability, add it in `scripts/graphify/bkit-graph-drift-rules.json`. How to run the tools is in `.bkit/templates.md`."

 ❯ .bkit/core/engine/install/project-docs.test.ts:595:20
    593|     const rollup = intro.filter((l) => l.includes("pnpm bkit:graph:rol…
    594|     const refresh = intro.filter((l) => l.includes("pnpm bkit:graph:re…
    595|     expect(rollup).toMatch(/working tree/);
       |                    ^
    596|     expect(refresh).toMatch(/staged/);
    597|     expect(refresh).toMatch(/throwaway checkout/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > capabilities starter has the Generated document opener, Fill these first, register row and completion checks
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/install/project-docs.test.ts:604:68
    602|     const lines = starterLines("capabilities");
    603|     const intro = lines.slice(0, titleIndex(lines));
    604|     expect(intro.some((l) => l.startsWith("Generated document."))).toB…
       |                                                                    ^
    605|     expect(intro.some((l) => l.startsWith("Example output."))).toBe(fa…
    606|     expect(adoptionArrows().solid.get("docs/capabilities.md")).toEqual…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯


 Test Files  1 failed (1)
      Tests  10 failed | 22 passed (32)
   Start at  17:36:14
   Duration  237ms (tests 49%, setup 29%, transform 10%, import 9%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8uc6S3/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
