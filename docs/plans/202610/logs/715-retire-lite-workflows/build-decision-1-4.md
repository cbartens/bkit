Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202610/715-retire-lite-workflows-plan.md
Group: 7
Verify attempt: 1

**Q1 — TASK 14 [workflow-shape.test.ts — no shipped prompt or workflow names a lite workflow]:** This test checks that no shipped prompt or workflow file mentions a lite workflow. It passes now, but it was written after the change it checks, so it was never seen failing first, which breaks the test-first rule. Accepting lets the build continue without that proof; stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test written after its code; no agent can recreate the missing failing run after the fact.
Decision: Accept — Use the draft: Each test only checks that text is present in or gone from shipped docs. The old files still had the lite text and lacked the README sections, so every test would have failed on them; the README tests were seen failing locally before the edit.

**Q2 — TASK 14 [instructions-sources.test.ts — no shipped rule or prompt instructs a next:\*:lite label]:** This test checks that no rule or prompt tells agents to use a next:*:lite label. It passes now, but it was written after the change it checks, so it was never seen failing first, which breaks the test-first rule. Accepting lets the build continue without that proof; stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test written after its code; no agent can recreate the missing failing run after the fact.
Decision: Accept — Use the draft: Each test only checks that text is present in or gone from shipped docs. The old files still had the lite text and lacked the README sections, so every test would have failed on them; the README tests were seen failing locally before the edit.

**Q3 — TASK 14 [instructions-sources.test.ts — the clause store holds no lite text]:** This test checks that the shared-sentence store holds no lite wording. It passes now, but it was written after the change it checks, so it was never seen failing first, which breaks the test-first rule. Accepting lets the build continue without that proof; stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test written after its code; no agent can recreate the missing failing run after the fact.
Decision: Accept — Use the draft: Each test only checks that text is present in or gone from shipped docs. The old files still had the lite text and lacked the README sections, so every test would have failed on them; the README tests were seen failing locally before the edit.

**Q4 — TASK 14 [templates.test.ts — the change issue form names no lite workflow]:** This test checks that the change issue form offers no lite workflow. It passes now, but it was written after the change it checks, so it was never seen failing first, which breaks the test-first rule. Accepting lets the build continue without that proof; stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test written after its code; no agent can recreate the missing failing run after the fact.
Decision: Accept — Use the draft: Each test only checks that text is present in or gone from shipped docs. The old files still had the lite text and lacked the README sections, so every test would have failed on them; the README tests were seen failing locally before the edit.

**Q5 — TASK 14 [templates.test.ts — the shipped reference docs list no lite doc]:** This test checks that the shipped reference doc list has no lite doc. It passes now, but it was written after the change it checks, so it was never seen failing first, which breaks the test-first rule. Accepting lets the build continue without that proof; stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test written after its code; no agent can recreate the missing failing run after the fact.
Decision: Accept — Use the draft: Each test only checks that text is present in or gone from shipped docs. The old files still had the lite text and lacked the README sections, so every test would have failed on them; the README tests were seen failing locally before the edit.

**Q6 — TASK 15 [templates.test.ts — the root README points small changes at /bkit-build]:** This test checks that the README sends small changes to /bkit-build. It passes now, but it was written after the change it checks, so it was never seen failing first, which breaks the test-first rule. Accepting lets the build continue without that proof; stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test written after its code; no agent can recreate the missing failing run after the fact.
Decision: Accept — Use the draft: Each test only checks that text is present in or gone from shipped docs. The old files still had the lite text and lacked the README sections, so every test would have failed on them; the README tests were seen failing locally before the edit.

**Q7 — TASK 15 [templates.test.ts — the root README carries the held handoff]:** This test checks that the README explains the held (publish=false) handoff. It passes now, but it was written after the change it checks, so it was never seen failing first, which breaks the test-first rule. Accepting lets the build continue without that proof; stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test written after its code; no agent can recreate the missing failing run after the fact.
Decision: Accept — Use the draft: Each test only checks that text is present in or gone from shipped docs. The old files still had the lite text and lacked the README sections, so every test would have failed on them; the README tests were seen failing locally before the edit.

**Q8 — TASK 15 [templates.test.ts — the root README carries the manual batch recipe with both limitations]:** This test checks that the README has the manual batch recipe naming both its limits. It passes now, but it was written after the change it checks, so it was never seen failing first, which breaks the test-first rule. Accepting lets the build continue without that proof; stopping ends the run here. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a test written after its code; no agent can recreate the missing failing run after the fact.
Decision: Accept — Use the draft: Each test only checks that text is present in or gone from shipped docs. The old files still had the lite text and lacked the README sections, so every test would have failed on them; the README tests were seen failing locally before the edit.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
