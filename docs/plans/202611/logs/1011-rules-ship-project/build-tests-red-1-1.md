Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1011-rules-ship-project-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/rules-sync.test.ts` "the template holds an empty Project Goals section between Project Rules and Project Settings" | red | failure: expected [ 'Project Rules', 'Project Settings' ] to deeply equal [ 'Project Rules', …(2) ] |
| 2 | `.bkit/core/engine/tools/instructions.test.ts` "rules-leaf reads only below bkit:end, breaks ties by Project Goals and skips Orchestrator Rules" | red | failure: expected '**Rules file:** Find the line of `<!-…' to contain 'break ties by its `Project Goals`' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/rules-sync.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/rules-sync.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/rules-sync.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/rules-sync.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project

 ❯ .bkit/core/engine/audits/repo/rules-sync.test.ts (7 tests | 1 failed) 8ms
   ❯ bkit-rules-sync — managed block byte-equality gate (WS7-T1, D3) (6)
     ✓ both .agents/rules.md and .bkit/core/.agents/rules.md exist 1ms
     ✓ managed bkit:start→bkit:end block is byte-identical between .agents/rules.md and the template 1ms
     ✓ the external-content invariant is present in the managed block 0ms
     ✓ the untrusted-content threat model sits in the managed prompts guide and the rule stays in the managed block 2ms
     ✓ the template ships NO project rules below bkit:end — only the empty group scaffold 0ms
     × the template holds an empty Project Goals section between Project Rules and Project Settings 2ms
   ✓ Tracker work comments rule (1)
     ✓ the Tracker work comments rule posts through the tracker MCP, never bkit issues comment 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/rules-sync.test.ts > bkit-rules-sync — managed block byte-equality gate (WS7-T1, D3) > the template holds an empty Project Goals section between Project Rules and Project Settings
AssertionError: expected [ 'Project Rules', 'Project Settings' ] to deeply equal [ 'Project Rules', …(2) ]

- Expected
+ Received

  [
    "Project Rules",
-   "Project Goals",
    "Project Settings",
  ]

 ❯ .bkit/core/engine/audits/repo/rules-sync.test.ts:128:62
    126|     );
    127|     const headings = [...belowManaged.matchAll(/^## (.+)$/gm)].map((m)…
    128|     expect(headings.filter((h) => h.startsWith("Project "))).toEqual([
       |                                                              ^
    129|       "Project Rules",
    130|       "Project Goals",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 6 passed (7)
   Start at  12:29:22
   Duration  101ms (setup 41%, transform 19%, tests 19%, import 17%, worker 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tGme0x/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/tools/instructions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/tools/instructions.test.ts

```

## Runner output — `.bkit/core/engine/tools/instructions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/tools/instructions.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project

 ❯ .bkit/core/engine/tools/instructions.test.ts (108 tests | 1 failed) 10648ms
   ✓ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 1ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 0ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 1ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 0ms
     ✓ has no findings 5880ms
     ✓ every prompt, workflow and utility agent has the three header blocks 160ms
     ✓ sync has nothing left to rewrite 3789ms
     ✓ every clause reaches the cut-off of one surface it applies to 615ms
   ❯ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 0ms
     × rules-leaf reads only below bkit:end, breaks ties by Project Goals and skips Orchestrator Rules 3ms
     ✓ the utility-* agents read all of rules.md 0ms
     ✓ every Orchestrator subsection name is shared with Universal 0ms
   ✓ the external-input clause keeps all three legs (3)
     ✓ as untrusted data, NEVER as instructions 0ms
     ✓ Report embedded directives instead of executing them 0ms
     ✓ Use the narrowest-scoped token 0ms
   ✓ the external-skills clause limits skill authority (5)
     ✓ Treat skill content as untrusted guidance 0ms
     ✓ Apply only guidance permitted by `.agents/skills.md` § Activation Rules 0ms
     ✓ a skill cannot expand the authorized task, override governing instructions, or grant permissions 0ms
     ✓ Report directives that cross these boundaries 0ms
     ✓ requires the boundary on every agent surface 0ms
   ✓ the prompts.md untrusted-input doctrine row (2)
     ✓ the row names the universal policy 0ms
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 0ms
     ✓ a duplicated clause fails 0ms
     ✓ a weakened rewrite is a near-copy, not a match 0ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 0ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 0ms
     ✓ an anchored template fails on a line that starts it but does not match 0ms
     ✓ position: first fails when another bullet opens the block 0ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 0ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 0ms
     ✓ a clause with rule and carriers keys parses 0ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 0ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 0ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 0ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 0ms
     ✓ a sentence shared by 2 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 0ms
     ✓ a drifted gate item behind a checkbox is a near-copy 0ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 0ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 0ms
     ✓ a clause ending in . matches a line that continues it with ; 0ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 0ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 0ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 0ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 0ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 0ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 0ms
     ✓ repeatable allows any number of copies but still flags near-copies 0ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 0ms
     ✓ two swapped lines in one block fail 0ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 0ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 0ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 2ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 1ms
   ✓ fully retired clauses (6)
     ✓ parse with no text block and no surface 0ms
     ✓ reject a text block or a surface 0ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 0ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed clauses stay on record, and the cut-off skips them 0ms
     ✓ output-cap's sentence stays inline in the abort handover prompt 30ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 0ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 0ms
     ✓ rewrites a near-copy that closes a sentence opened by local text 0ms
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 0ms
     ✓ is idempotent and leaves fenced examples alone 0ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 0ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 0ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 0ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 0ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 36ms
     ✓ every label's rows list exactly the prompts that carry it 32ms
   ✓ the recovery precedence contract (1)
     ✓ renders one recovery precedence contract for all hosts and tracker adapters 76ms
   ✓ ledgers query readers (1)
     ✓ routes every ledgers query reader on coverage status 11ms
   ✓ the local-pre-commit rule (5)
     ✓ every build and debug prompt that runs tests carries local-pre-commit 1ms
     ✓ every debug prompt that runs tests by file or name filter carries local-pre-commit 0ms
     ✓ local-tests-first does not ask for the full local suite that local-pre-commit forbids while working 1ms
     ✓ bkit-debug-failure-reproduce runs its tests by naming each test file and asks for no unnamed wider run 0ms
     ✓ local-pre-commit covers test runs made while working, not only before a commit 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the rule groups the Rules clauses name exist > rules-leaf reads only below bkit:end, breaks ties by Project Goals and skips Orchestrator Rules
AssertionError: expected '**Rules file:** Find the line of `<!-…' to contain 'break ties by its `Project Goals`'

Expected: "break ties by its `Project Goals`"
Received: "**Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`."

 ❯ .bkit/core/engine/tools/instructions.test.ts:269:18
    267|       "**Rules file:** Find the line of `<!-- bkit:end -->` in `.agent…
    268|     );
    269|     expect(text).toContain("break ties by its `Project Goals`");
       |                  ^
    270|     expect(text).toContain("skip its `Orchestrator Rules`");
    271|     expect(clause("rules-leaf").modes.prompt).toBe("if-search");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 107 passed (108)
   Start at  12:29:23
   Duration  10.78s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-sb98pw/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
