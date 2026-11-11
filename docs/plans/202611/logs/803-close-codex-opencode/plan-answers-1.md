## Owner answers

- **Open Question 3:** If the real Codex session does not show the deny, does the deny code stay?
  - **Answer:** A) Keep deny, say unverified
  - Decision: 803-codex-key-shell-read-deny
- **Open Question 4:** How narrow are the derived OpenCode `webfetch` allows?
  - **Answer:** C) Keep *host* (551 stands)
  - Apply: the derived OpenCode `webfetch` allows stay `*{base}*`, as decision `551-opencode-unanchored-host-allows-accepted-risk` accepted. The success criterion's review of related generated URL permissions is met by that review: the owner reviewed the shape and kept it as an accepted risk. Remove the exact-origin `webfetch` tasks, tests, matrix rows and edge cases, and the deferral that only exists because of them (`803-opencode-webfetch-exact-origin-never-revoked`). Decision `803-opencode-webfetch-exact-origin` is now `SUPERSEDED`; take its key off the `**Ledger rows:**` line and add `551-opencode-unanchored-host-allows-accepted-risk`.
  - Decision: 551-opencode-unanchored-host-allows-accepted-risk
- **Open Questions 1 and 2:** not asked. The owner said to ask only questions that really need an answer from them. Each keeps its stated default (A), which the plan is already written for, and each stays listed as unanswered.
  - Decision: none
