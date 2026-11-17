Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/921-tests-lock-default-plan.md

**Q1 — Task 6 [.bkit/templates/scripts/ci/bkit-machine-lock.sh:107]:** The slot count is read separately by every process that asks for the tests lock. If you pin BKIT_TEST_SLOTS=1 in one place (say, one host's settings), a run that does not carry the pin, such as a plain terminal, another host, or an older copy of the script, now defaults to 2 slots on a machine with 8 or more cores. It takes the second slot while the pinned run holds the first, so two heavy test runs go at once. The reviewer reproduced this on this 10-core machine: 13 workers on 10 cores. Before this change the unpinned run defaulted to 1 and waited. You decide the design: (A) keep the slot count a per-process setting and have the docs say every host and shell must carry the same value (the 'user-level host settings' advice is then reworded); or (B) make the lock itself enforce one count for the whole machine, for example a value stored in the lock folder or the lowest count among live holders; that is a bigger change to the lock script. 'Accept' keeps today's per-process behaviour and the docs get no change from me beyond what you tell me; 'Fix now' needs your direction on which design.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The two designs trade simplicity against a machine-wide guarantee, and the right one depends on how many hosts and shells you run on one machine; no agent can settle that.

Decision: Fix now — B with that direction (keep BKIT_TEST_SLOTS per process with the core-count default; reword the override advice in .bkit/core/.bkit/templates.md § Machine lock, .bkit/core/.bkit/workflows.md, docs/testing.md § Tests lock and decision 724-tests-lock-fixed-slots-not-live-load to say set it in every place runs start from — shell profile and each host's user settings — or nowhere, because runs with different values can overlap; docs-only, no new test)
Fix task: 6

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
