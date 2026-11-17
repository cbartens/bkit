Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202610/719-cloud-variants-add-plan.md

**Q1 — TASK 26 [.bkit/templates/.github/workflows/bkit-cloud.yml:225]:** When a feature branch and dev disagree about which cloud agent to start (and which tracker to use), which one should win? Today the router reads that setting only from the feature branch. So a branch cut before you ran bkit install --auto=codex on dev never starts an agent, and its notice tells you to run the install you already ran; turning the agent off on dev also does not stop branches already in flight. Options: Accept keeps the branch-only read as it is. Fix now runs TASK 26 as written; say which way: (a) read the agent and tracker settings from dev, and only the marker, branch name and .bkit/issues.jsonl from the branch; (b) read the branch first and fall back to dev when it has no setting, with the notice naming which copy decided; (c) keep the branch-only read and change the notice to say the branch predates the setting and needs dev merged in. Stop ends the run here. Separately, the security reviewer found at this same line that a branch can put a multi-line value in this setting and make the router start every agent job at once; the merge folded that finding into this task and dropped its fix (only accept claude, opencode, codex, cursor or none). Option (a) closes it as a side effect; with (b), (c) or Accept it stays open unless you also ask for that check.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — It changes owner decision build-decision-4-1.md Q1, which named bkit.cloud.agent and bkit.tracker.default as data read from the feature branch, so only the owner can choose which copy wins.
Decision: Fix now — "Q1: B (a)": read `bkit.cloud.agent` and `bkit.tracker.default` from the `dev` checkout (workspace root); read only the marker, branch name and `.bkit/issues.jsonl` from the feat/** head (`pr-head/`).

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
