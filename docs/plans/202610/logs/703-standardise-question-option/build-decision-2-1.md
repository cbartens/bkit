Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 10
Plan: docs/plans/202610/703-standardise-question-option-plan.md

**Q1 — 11 [.bkit/core/prompts/bkit-design-review-2.md:76]:** Challenge round 2, TASK 11 (MEDIUM, mechanical, fixable). This change narrowed the design review's open-question criterion: `.bkit/core/prompts/bkit-design-review-2.md:76` no longer names `Default if unanswered`, while `.bkit/core/prompts/bkit-design-generate.md:133` and `.bkit/core/prompts/bkit-design-update.md:65` still require it and the prompts index row `.bkit/core/.bkit/prompts.md:257` still tells a reader the review checks it. A design whose open question carries lettered options and a lettered `Recommended` but no default therefore passes the review. This is the last challenge round, so it is not fixed automatically. Fix it now — the review re-names every part the design prompts require (lettered options, a lettered `Recommended`, `Default if unanswered`) and the index and mirrors follow?
Options: Accept / Fix now
Recommended: Fix now — The narrowing is introduced by this change, so shipping it leaves the review weaker than the generate/update prompts it is meant to check and than its own index row; the fix is a one-line criterion plus the regenerated mirrors, and TEST FIRST is already written.
Decision: Fix now — fix now

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
