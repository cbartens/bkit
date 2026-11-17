Verdict: CONCERNS
Failures: 2
Fingerprint: 33bafb35ed0fe94e441caa39f099a7a65ba216a0d2042944ab8067e4d5fd1c34
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-914-build-planned-test.md` (3062 lines, full coverage; its first line is a `diff --git` header, not `partial diff coverage`).
- Read in full: the engine hunks (`steps.ts`, `tests.ts`) and their `dist/` counterparts (the `blockedTests` regex and the `removes` gate were checked line for line), the prompt and workflow source hunks, the ledger, `docs/testing.md` and template hunks. Host mirrors, `.bkit/instructions.md`, `.bkit/version` and the render snapshot were scanned for secrets, embedded directives and risky commands, not line-reviewed, because `bkit check` gates them as renders of the sources.
- Code read outside the diff: `testBlock` / `testSpan` / `lineDiff` (`tests.ts:530-628`) and the decision-file parser (`decisions.ts:1-130`).
- Docs loaded: `.agents/docs.md` and `docs/security.md` (§ Untrusted Content & Prompt Injection, § Shell Injection, § PII, § RLS). The other Build-phase docs bear on this lens only through the diff (`.bkit/workflows.md`, `.bkit/prompts.md`, `docs/testing.md`), and the ledgers were checked through the diff. `docs/architecture.md`, `docs/data-schema.md`, `docs/observability.md` and `.agents/skills.md` were not opened: no route, schema, log name or skill changes, and `docs/security.md` § RLS says bkit has no database.

## Notes

- **Finding 1 against the docs:** `docs/security.md` § Untrusted Content & Prompt Injection says prose is defence-in-depth and the load-bearing control must be structural. Task 11's add-only check is that structural control, but `additive` (no line removed) is weaker than "not loosened", which the refusal text, the prompts and `docs/testing.md:314` promise. The code already knows the difference: `lineDiff`'s comment and the verify prompt's `Updated tests` rule both say an added line can disable an expectation.
- **Finding 2:** in a JavaScript regex `\s` matches a newline, so `blockedTests` can match across lines. The agent writes its own log either way, so this grants no new power. It breaks the plan's no-reason edge case and can show the owner a reason taken from an unrelated line, hence LOW.
- **Not raised, already deferred:** a `changedTests` value passed through `--field`, or found on any step's row (`914-build-planned-test-challenge-low-...-tests-ts-354`); a whitespace-only reason (`...-tests-ts-1485`); a change to an unproven red recorded as `red` (`...-tests-ts-365`).
- **Checked, no finding:** diff lines in the `CHANGED_TESTS` item and the green report always start with ` `, `+` or `-` (and are indented two spaces in the report). So agent-written test lines cannot forge a line-anchored `Decision:`, `Question:` or `**Q{n} — ` key (`decisions.ts:51-53`). Every new subprocess call uses an argument array (`git hash-object -w -- {path}`). A refused step writes nothing, `changedTests` included. `dist/` holds the same regex and `removes` gate as the source. No dependency changes (`package.json` and `pnpm-lock.yaml` are not in the diff), and no secret or PII.
- **Noted, not counted:** `removes = diff === null ? c.text !== null : ...` lets any change through when the baseline text is unknown. That happens for a red recorded `missing`, which Task 8 deliberately lets through under a `BLOCKED` line and which `unproven` also surfaces. It also happens for a `changedTests` record with no `after` field, which only a forged or pre-Task-11 row carries, so it is the deferred `--field` case. Test paths from the plan's `TEST FIRST` fields are joined to the repo root without a containment check. That read predates this diff, and the new `hash-object -w` and `baselineDiff` reads only run on a test that a `BLOCKED` line names.
- **Tests not run:** this agent's mandate forbids building or running code. Whether each `TEST FIRST` fails was judged by reading the code the diff leaves. Finding 1: an inserted deeper-indented `return;` stays inside `testSpan`'s block and gives `removed === 0`, so `finish` exits 0. Finding 2: `\s*` after the second backtick consumes the `\n`, `[—–-]+` takes the bullet's `-`, and `(.+)` takes `next item`.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A code agent adds one `return;` line before a planned test's assertions, logs a `BLOCKED` reason, and the engine lets the disabled test through as "additive", while verify only notes it
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1333` · **Round:** 1
  - **DONE WHEN:** No agent can settle this alone, because it reopens the owner's Q2 choice that verify raises no gap for a changed test. The let-through gate is `removes = diff === null ? c.text !== null : !diff.additive` (`steps.ts:1333`), and `additive` means only `lineDiff(...).removed === 0` (`baselineDiff`, `tests.ts:491`). A pure insertion such as `return;`, an `if (true) return;`, a `/*` and `*/` pair around the assertions, `expect.assertions(0)` or a reassignment of the value under test removes no line, so it passes. `lineDiff`'s own comment (`tests.ts:590-592`) says such a change "can still have disabled one, which only a read of the added lines tells". The verify prompt reads the added lines for exactly this case on the `Updated tests` path (`bkit-build-plan-verify.md:99`), but its `Changed by a code step` rule (`bkit-build-plan-verify.md:96-97`) only notes the test. That leaves the owner's read of the diff as the only check, and a headless run assumes Accept; a reject at ship still merges (Q3 A). Meanwhile the refusal text (`steps.ts:1377`), both code prompts and `docs/testing.md:314` say a `BLOCKED` line "cannot remove or loosen" a planned test. The owner must pick one: (a) verify judges each `changed` diff the way it judges `updated` ones, and the gap that a disabling line raises goes either to the tests step to restore or to the owner as a hard blocker; or (b) the engine refuses added lines that end or skip the test early; or (c) the wording drops "or loosen" and the diff shown to the owner is the only control. The fix is done when the chosen control is in place and the refusal text, prompts and `docs/testing.md` say what it really guarantees. The first test applies to (b), the second to (a).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step whose BLOCKED-named change adds an early return before a planned test's assertions, exit 11` fails on exit 0 and a `changedTests` record when the execute step inserts a deeper-indented `return;` line right after the planned test's opening line and its log names the test in a `BLOCKED` test line
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment` fails on a `Changed by a code step` rule that only lists the test and its reason in `Notes` and raises no gap
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A `BLOCKED` test line with no `— {why}` is read as naming the test, with the next log line's text as its reason, when that next line starts with a dash
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:1537` · **Round:** 1
  - **DONE WHEN:** `blockedTests` matches only within one line: every `\s` in its pattern (`tests.ts:1537`, and `dist/commands/workflow/tests.js:1120` after `pnpm build`) becomes `[ \t]`. So the `\s*[—–-]+\s*(.+)$` tail can no longer step over a newline, take a following `- item` bullet or `---` rule as the separator and reason, and let the change through. The plan's edge case "A `BLOCKED` line has no `— {why}` reason after the test → it names no test, so the change is refused" then holds whatever line follows.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `blockedTests > reads no reason from the line after a BLOCKED test line` fails on `blockedTests` returning `{test: "src/a.test.ts", name: "adds a row", reason: "next item"}` for the log ``BLOCKED — TASK 2: test `src/a.test.ts` `adds a row` `` followed by the line `- next item`, where it should return `[]`
<!-- bkit:task 2 end -->
