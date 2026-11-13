Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/787-show-authoring-rules-plan.md

**Q1 — TASK 22 [.bkit/core/hooks/gateguard-edit-payload.js:20]:** On Cursor, when the agent edits a file with its Write tool, bkit writes down 'this file has been warned about' right away. But Cursor's way of delivering that warning to the model (the additional_context field) is documented as unverified, so we do not know the warning ever arrived. If the agent then edits the same file through the shell (for example sed -i), bkit sees the file as already warned and stays silent, so the model may never see the per-file checklist at all. The plan says an unverified route should leave the file unwarned. Fixing it is not a small patch: the Cursor and Claude hook blocks must stay byte-identical (a test enforces it), and only the Cursor driver knows which host it is running on. Accept the gap as it stands (you give a reason, and it is logged), fix it now (a new task will be added; the approach has to be chosen in that task), or stop the run?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether the Cursor driver may diverge from the shared hook block, or whether the unverified Cursor route is acceptable until Cursor documents how additional_context is delivered; no agent can settle that without breaking one of the two.
Decision: Accept — owner chose Accept: answered "A)" with no reason given.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
