Verdict: PASS

<!-- verdict:end -->

# Build Challenge Tests

## C9f Fix Verification

### Fix correctness

The remediation replaced the original `.not.toContain("MAX_DEBUG_ATTEMPT")` assertion with two regex assertions in `.agents/scripts/release-workflow.test.ts` lines 417-418:

```ts
expect(routerContent).not.toMatch(/\$\{?MAX_DEBUG_ATTEMPT\}?/);
expect(routerContent).not.toMatch(/MAX_DEBUG_ATTEMPT\s*[<>=!-]/);
```

The router orchestrator at `.agents/workflows/bkit-ci-router.md` contains `MAX_DEBUG_ATTEMPT` in exactly three places (lines 31, 294, 314), all in documentation prose:

- Line 31: blockquote constraint note
- Line 294: bold-text constraint
- Line 314: gate checklist item

None of these three occurrences match either regex. Verified by running both regexes against the actual file content: both return `false`. The assertions will pass correctly.

The fix is logically correct: it distinguishes between documentation references (prose naming the constant to explain why it must NOT be used) and actual shell code usage (variable expansion `$MAX_DEBUG_ATTEMPT` or arithmetic/comparison expressions). The orchestrator has only documentation references, so both new assertions pass.

### Additional tests needed

No additional tests are needed. The C9f describe block already has two `it` blocks:

1. "router step skeleton has NO MAX_DEBUG_ATTEMPT pre-check" — the fixed assertion (lines 417-418)
2. "router documents dispatch of /bkit-debug unconditionally" — positive assertion that `/bkit-debug` appears in content (line 422)

These two assertions together cover the full intent of matrix row 17: the router does not pre-empt by reading `MAX_DEBUG_ATTEMPT`, and it does dispatch `/bkit-debug`. No further test cases are required.

### KN-16 assessment

The KN-16 entry appended to `docs/knowledge.md` at line 214 is appropriate and not a duplicate:

- KN-15 (line 203) covers the stale-CI-run dispatch hazard — a separate, unrelated topic.
- KN-16 covers the pattern-level gotcha that negative `.not.toContain()` assertions fail when the forbidden token appears in documentation prose. This is a reusable testing lesson applicable beyond this single test case.
- The entry appears exactly once in the file (confirmed by grep count = 1).
- Content is complete: symptom, root cause, fix, type, confidence, severity, source, and related fields are all present.
- The entry does not duplicate KN-15 or any prior entry.

## Blockers

None
