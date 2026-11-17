Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/787-show-authoring-rules-plan.md

**Q1 — TASK 18 [.bkit/core/engine/install/write.ts:231]:** When bkit upgrades a consumer's config file, the new merge keeps every list entry that the current template does not contain. That is what protects a consumer's own hook groups and permissions. The side effect: if a later bkit release removes something it once shipped (a broad permissions.allow rule, an opencode.json plugin path, a hook group for a deleted hook file), every upgraded consumer keeps it forever, because the merge cannot tell a retired bkit entry from a consumer's own. The old merge replaced the whole list and so did retract such entries, but it also threw away consumer additions. Nothing is retired today, so this is a future-release problem. Three ways to settle it: record which entries bkit shipped before so the merge can subtract them; limit list merging to named keys (permissions and hook-event groups) and keep replacement elsewhere; or accept the drift and ship a migration for each retraction. Accept it as it stands, or add a fix task now (the new task would pick one of those three ways from your answer)?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can choose how bkit tells entries it shipped from entries a consumer added; each way costs something different (a new ledger, a narrower merge, or a migration per retraction) and none is a mechanical fix.
Decision: Accept — owner chose Accept: fine leaving it as is and handling retirements when they come up.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
