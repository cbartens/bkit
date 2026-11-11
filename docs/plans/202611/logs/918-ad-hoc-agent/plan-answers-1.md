## Owner answers

- **Open Question:** The Acceptance Scenario has no Narrative or Success Criteria: there is no design, #918 is bug-shaped with no change-shape fields, and the plan may not invent them → the owner writes them.
  - **Answer:** you write as best as possible for each based on issue content
  - Apply: option A, written from the issue's "What goes wrong" section and "Suggested fix" points 1 to 3, shaped by the plan's run-proof design:
    - **Narrative:** An agent working outside a `/bkit-*` workflow posts its work comments as plain markdown, so the next design, plan or build run on that issue still reads them.
    - **Success Criteria:**
      1. `bkit issues comment` refuses with a usage error that points at plain markdown through the tracker MCP when the call carries no proof that a workflow or audit run is making it.
      2. Every workflow and audit call that posts today still posts.
      3. `.agents/rules.md` § Tracker work comments says work comments go as plain markdown through the tracker MCP, never through `bkit issues comment`, and never start with a `bkit:generated` line.
      4. The `comment` row of `.bkit/cli.md` says workflow steps only, never for ad-hoc comments.
  - Decision: none
- **The other six Open Questions** (what proves a workflow run is calling; must the session folder still exist; what proves an audit summary; the § Tracker MCPs exception; the already-posted marked comments; no migration for stale mirrors): not asked. The owner said to ask only questions that really need an answer from them. Each keeps its stated default (A), which the plan is already written for, and each stays listed as unanswered.
  - Decision: none
