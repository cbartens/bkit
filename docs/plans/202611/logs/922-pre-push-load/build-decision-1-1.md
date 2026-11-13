Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/922-pre-push-load-plan.md

**Q1 — Task 4 (.bkit/templates/.husky/pre-push:39):** When a workflow's worktree has an .envrc that direnv does not trust, the new hook stops its first push. Should worktree setup warn about that up front, or is a block at push time acceptable? Setup only trusts a worktree .envrc that is byte-identical to the main checkout's (allowDirenv in .bkit/core/engine/commands/workflow/worktrees.ts). So this only happens when the branch itself edits .envrc, the main checkout's copy changed since, or direnv allow failed. Today setup already prints 'not allowed; read it, then run direnv allow' and carries on, and .bkit/workflows.md calls that 'never fatal'. With #922 the run does all its work, commits it, then the push blocks in about a second with the direnv allow . fix. Nothing is lost: the commits stay, and you allow and push again. Accept = keep it as built, and record that a block at push time is fine. Fix now = setup also says the push will block, and .bkit/workflows.md § Worktree Setup is reworded to match (a new task with a test, then a second challenge round). Stop = hold the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — This is a contract choice: #922 deliberately makes an untrusted .envrc block the push, while .bkit/workflows.md promises an untrusted worktree .envrc is never fatal. Only you can say which promise wins.
Decision: Fix now — fix now for both

**Q2 — Task 5 (.bkit/templates/.husky/pre-push:40):** Should the push gate get bkit's tooling secrets? bkit's .envrc runs dotenv_if_exists .bkit/.env, so going through direnv exec hands everything the gate runs (tests, lint plugins, dependency code) BKIT_GH_TOKEN, a GitHub token that can write, plus the other BKIT_* keys. That output lands in tmp/pre-push.log, which agents can read. The facts: when you push from your own terminal, direnv has already loaded .envrc, so the gate gets those keys today. The new part is that agent pushes now get them too. Agents are blocked from reading .bkit/.env directly (.claude/settings.json), but nothing stops one running direnv exec itself. docs/security.md says to give each job the narrowest token. Accept = the gate gets the full .envrc, the same as a terminal push; record it as an accepted risk in docs/decisions.jsonl. Fix now = the hook unsets the BKIT_* keys before the inner run, or loads a separate env file for the gate; say which (a new task with a test, then a second challenge round). Stop = hold the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — #922's goal (the gate runs with the repo's whole .envrc) conflicts with docs/security.md's narrowest-token rule. Which one wins is a security-policy call for you.
Decision: Fix now — fix now for both

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
