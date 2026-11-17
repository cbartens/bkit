Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202610/719-cloud-variants-add-plan.md

**Q1 — TASK 23 [.bkit/templates/.github/workflows/bkit-cloud.yml:172]:** Should the bkit:auto off-switch be decided by a copy of bkit that the feature branch itself cannot change? Today, for a feat/** run, the router installs bkit from the feature branch's own lockfile and runs that copy to read the bkit:auto label. A codex or opencode agent pushing to that branch cannot edit workflow files, but it can edit package.json and the lockfile, so it could keep itself running after you remove the label. Accept keeps that behaviour and records the risk in docs/security.md § CI Auto-Route Trust. Fix now makes the router install and run bkit from a dev checkout and read only data (marker, branch name, .bkit/issues.jsonl) from the feature branch, which reverses the plan's 'context job checks out the PR head' row. Stop ends the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — It reverses an owner-confirmed plan row (the feat/** context job checks out the PR head) and the test that pins it, so only the owner can choose between the security fix and the confirmed design.
Decision: Fix now — "agree", answering the proposal "Q1: B (Fix now)": install and run bkit from a dev checkout; read only data (marker, branch name, `.bkit/issues.jsonl`, `bkit.cloud.agent` / `bkit.tracker.default`) from the feat/** head.

**Q2 — TASK 24 [.bkit/shared/.bkit/.env.example:88]:** Should the OpenAI key stay out of the cloud agent setup blocks? If a consumer fills in BKIT_OPENAI_API_KEY in .bkit/.env, bkit install pastes it into every generated cloud env block (.claude/bkit-cloud.md, .cursor/bkit-cloud.md, .codex/bkit-cloud.md), so every cloud agent session that reads untrusted issue and PR text holds a paid OpenAI key. The key is only needed by the codex router job, as a GitHub repo secret. Accept keeps the paste and records why in docs/security.md § Credential surfaces. Fix now stops the paste: either add the key to the drop list in cloud-env.ts (with its test and docs/security.md § Secrets Management updated), or remove the row from .env.example so the key lives only in repo secrets. Stop ends the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The plan left this as an open owner security decision, and the current drop list is pinned by cloud-env.test.ts and docs/security.md § Secrets Management, so changing it is the owner's call.
Decision: Fix now — "agree", answering the proposal "Q2: B (Fix now, using the drop list)": add `BKIT_OPENAI_API_KEY` to the keys dropped from the paste block (keep the `.env.example` row), and update `cloud-env.test.ts` and `docs/security.md` § Secrets Management.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
