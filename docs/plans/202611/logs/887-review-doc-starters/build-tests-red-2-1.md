Enforced: true
Red: 8
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/887-review-doc-starters-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: components" | red | failure: expected { shape: [ …(11) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 3 | `.bkit/core/engine/install/project-docs.test.ts` "components register row Scope equals its Purpose line" | red | failure: expected '' not to be '' // Object.is equality |
| 3 | `.bkit/core/engine/install/project-docs.test.ts` "components Fill these first matches the adoption order" | red | failure: expected [] to deeply equal [ 'docs/idea.md' ] |
| 4 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: technology" | red | failure: expected { shape: [ …(16) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 4 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: design" | red | failure: expected { shape: [ …(18) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 5 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: architecture" | red | failure: expected { shape: [ …(18) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 5 | `.bkit/core/engine/install/project-docs.test.ts` "starter shape: setup" | red | failure: expected { shape: [ …(19) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] } |
| 5 | `.bkit/core/engine/install/project-docs.test.ts` "setup index row marks Build and Debug as read when relevant" | red | failure: expected '\| `docs/setup.md` \| — \| — \| — \| — \| —…' to contain '\| — \| — \| ○ \| ○ \| — \|' |

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

[test-timeout-budget] load average 7.0 on 10 cores: unit limits 8000ms per test, 16000ms per hook (x1.60)

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

 ❯ .bkit/core/engine/install/project-docs.test.ts (22 tests | 8 failed) 57ms
   ✓ stripManagedWrapper (4)
     ✓ removes the wrapper and keeps every other byte 3ms
     ✓ keeps CRLF line endings 0ms
     ✓ returns unmarked content as it is 1ms
     ✓ reports one lone marker, reversed markers and fenced markers as ambiguous 0ms
   ✓ legacy starter digests (2)
     ✓ has a digest for every topic 0ms
     ✓ recognises the real legacy text of a topic at the recorded revision 3ms
   ✓ syncProjectDocs (8)
     ✓ migrates the wrapper and registers a row, then repeats as a no-op 4ms
     ✓ writes nothing on a dry run 2ms
     ✓ keeps an ambiguous wrapper and reports it 2ms
     ✓ adds no row when an indexed equivalent covers the topic 5ms
     ✓ reports instead of throwing when docs is a regular file 3ms
     ✓ registers a present default doc when its only equivalent row points at a missing file 2ms
     ✓ does not add a second row for a default doc indexed through a markdown link 2ms
     ✓ adds no row and reports a problem when the index has a row it cannot read 2ms
   ❯ starter docs (8)
     × starter shape: components 13ms
     × components register row Scope equals its Purpose line 1ms
     × components Fill these first matches the adoption order 1ms
     × starter shape: technology 2ms
     × starter shape: design 2ms
     × starter shape: architecture 2ms
     × starter shape: setup 2ms
     × setup index row marks Build and Debug as read when relevant 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: components
AssertionError: expected { shape: [ …(11) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/idea.md",
+     "Finish against: says none",
+   ],
+   "row": [
+     "register row Scope differs from the Purpose line",
+   ],
+   "shape": [
+     "opener line 'Starter document.'",
+     "intro label Fill these first",
+     "intro label Finish against",
+     "intro label Where the facts come from",
+     "intro label If it does not apply",
+     "rules box Not here",
+     "rules box Update when",
+     "## Open questions",
+     "heading ## Constraints",
+     "heading ## Open questions",
+     "## Related views: a [e.g., row in every table",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:397:7
    395|     expect(
    396|       starterShape("components", ["## Repository purpose", "## Constra…
    397|     ).toEqual(CONFORMS);
       |       ^
    398|   });
    399|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > components register row Scope equals its Purpose line
AssertionError: expected '' not to be '' // Object.is equality
 ❯ .bkit/core/engine/install/project-docs.test.ts:403:21
    401|     const lines = starterLines("components");
    402|     const row = givenRow(lines, "components");
    403|     expect(row).not.toBe("");
       |                     ^
    404|     expect(rowScope(row)).toBe(purposeText(lines));
    405|     expect(purposeText(lines)).not.toBe("");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > components Fill these first matches the adoption order
AssertionError: expected [] to deeply equal [ 'docs/idea.md' ]

- Expected
+ Received

- [
-   "docs/idea.md",
- ]
+ []

 ❯ .bkit/core/engine/install/project-docs.test.ts:409:81
    407|
    408|   it("components Fill these first matches the adoption order", () => {
    409|     expect(docPaths(labelLine(starterLines("components"), "Fill these …
       |                                                                                 ^
    410|       "docs/idea.md",
    411|     ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: technology
AssertionError: expected { shape: [ …(16) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/components.md",
+     "Finish against: says none",
+   ],
+   "row": [
+     "register row is not projectDocRow(technology): ",
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
+     "heading ## Conventions",
+     "heading ## Not used",
+     "heading ## Open questions",
+     "no ## Project facts to record",
+     "bracketed fields in the skeleton",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:423:7
    421|         "## Open questions",
    422|       ]),
    423|     ).toEqual(CONFORMS);
       |       ^
    424|   });
    425|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: design
AssertionError: expected { shape: [ …(18) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/components.md",
+     "Finish against: got , want docs/technology.md",
+   ],
+   "row": [
+     "register row is not projectDocRow(design): ",
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
+     "heading ## Tokens",
+     "heading ## Typography",
+     "heading ## Spacing and layout",
+     "heading ## Components",
+     "heading ## Accessibility",
+     "heading ## Open questions",
+     "bracketed fields in the skeleton",
+     "## Machine-checked reference: a [e.g., row in every table",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:436:7
    434|         "## Open questions",
    435|       ]),
    436|     ).toEqual(CONFORMS);
       |       ^
    437|   });
    438|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: architecture
AssertionError: expected { shape: [ …(18) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/technology.md",
+     "Finish against: says none",
+   ],
+   "row": [
+     "register row is not projectDocRow(architecture): ",
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
+     "heading ## System context",
+     "heading ## Containers",
+     "heading ## Package boundaries",
+     "heading ## File placement",
+     "heading ## Environments",
+     "heading ## Open questions",
+     "no ## Project facts to record",
+     "bracketed fields in the skeleton",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:449:7
    447|         "## Open questions",
    448|       ]),
    449|     ).toEqual(CONFORMS);
       |       ^
    450|   });
    451|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > starter shape: setup
AssertionError: expected { shape: [ …(19) ], …(2) } to deeply equal { shape: [], adoption: [], row: [] }

- Expected
+ Received

  {
-   "adoption": [],
-   "row": [],
-   "shape": [],
+   "adoption": [
+     "Fill these first: got , want docs/technology.md",
+     "Finish against: got , want docs/architecture.md, docs/security.md",
+   ],
+   "row": [
+     "register row is not projectDocRow(setup): ",
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
+     "heading ## Prerequisites",
+     "heading ## First-time setup",
+     "heading ## Environment variables",
+     "heading ## Local services",
+     "heading ## Everyday commands",
+     "heading ## Troubleshooting",
+     "heading ## Open questions",
+     "no ## Project facts to record",
+     "bracketed fields in the skeleton",
+   ],
  }

 ❯ .bkit/core/engine/install/project-docs.test.ts:463:7
    461|         "## Open questions",
    462|       ]),
    463|     ).toEqual(CONFORMS);
       |       ^
    464|   });
    465|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > starter docs > setup index row marks Build and Debug as read when relevant
AssertionError: expected '| `docs/setup.md` | — | — | — | — | —…' to contain '| — | — | ○ | ○ | — |'

Expected: "| — | — | ○ | ○ | — |"
Received: "| `docs/setup.md` | — | — | — | — | — | Local dev — CLIs, configuration, secrets, troubleshooting. Humans only. |"

 ❯ .bkit/core/engine/install/project-docs.test.ts:468:17
    466|   it("setup index row marks Build and Debug as read when relevant", ()…
    467|     const row = projectDocRow("setup");
    468|     expect(row).toContain("| — | — | ○ | ○ | — |");
       |                 ^
    469|     expect(row).not.toContain("Humans only");
    470|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 14 passed (22)
   Start at  14:48:36
   Duration  299ms (tests 44%, setup 31%, transform 11%, import 9%, worker 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Rp8orF/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
