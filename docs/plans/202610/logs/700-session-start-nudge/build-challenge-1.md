Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** The advisory every host actually delivers is not the sentence the owner confirmed — `.bkit/core/hooks/preflight-rules.sh:6` and its JS twin ship `[bkit] Required reading before any other action: read \`.agents/rules.md\` and follow every rule in it.`, while the owner answered Open Question 1 with option A (`[bkit] Read .agents/rules.md before any other action and follow all its rules.`) and the plan's human-confirmed Concrete Example step 1 pins that exact `additionalContext`text — so the first prompt on all five hosts carries a sentence the confirmed acceptance example does not match, and no test notices, because the two shipped assertions only check`toContain(".agents/rules.md")`plus part byte-identity
**Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:**`.bkit/core/hooks/preflight-rules.sh:6`(twin`.bkit/core/hooks/session-rules-advisory.js:8`)
  - **DONE WHEN:** both parts declare the owner-confirmed option A sentence (`[bkit] Read .agents/rules.md before any other action and follow all its rules.` — the source of truth is `docs/decisions.jsonl` key `700-session-start-rules-read-advisory` line 721 ("answered by owner: yes (recommended option A) … advisory wording A") and the plan's § Open Questions + § Concrete Example step 1), the shell/JS byte-identity assertion stays green, and `bkit install` has re-rendered the five host files (`.claude/hooks/bkit-preflight.sh`, `.cursor/hooks/bkit-preflight.sh`, `.opencode/plugin/bkit-rules.js`, `.codex/hooks/bkit-rules.cjs`, `.agents/plugins/bkit/hooks/bkit-rules.cjs`) with `bkit check` drift-clean. If the owner prefers the shipped sentence instead, the same end state is reached the other way: amend the plan's Open Questions and Concrete Example and re-append the decision row with the shipped text, and the code stands as is.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `the shared advisory is the owner-confirmed sentence` fails on the finding — today `shellAdvisory()` and `jsAdvisory()` both return `[bkit] Required reading before any other action: …`, so an equality assertion on the decision row's option A sentence fails.
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `the delivered advisory sentence matches the owner-confirmed wording` fails on the finding — `emittedContext(result.stdout)` from a Claude IDE session is the shipped sentence, so `toBe` on the confirmed text fails.

<!-- bkit:task 1 end -->
