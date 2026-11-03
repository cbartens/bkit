## Session Prompt — this run's, newer than everything below

[$bkit-design](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-design/SKILL.md) #764

Retry bkit-design. If a sandbox restriction is resolved by an approved retry, continue the workflow instead of treating it as a failure.

## Issue description — oldest

### Problem

`.bkit/authoring.md` keeps capital letters (NEVER, ALWAYS, MUST, ONLY, PROHIBITED) for five harms: destroying data, leaking a secret, publishing or pushing, skipping the owner's approval, and breaking a field a program parses. Capitals only tell the model that a rule is a hard limit. The model still decides each time whether the line applies. Anthropic's Claude Code guide says a rule with no exceptions belongs in a hook or a deny rule for that reason. Nobody has checked which of these hard limits a hook or deny rule actually enforces, and which rely only on capitals in the rules.

Split out of #747 — Prompting practice: align authoring.md with tier-1 makers' guides (https://github.com/cbartens/bkit/issues/747), finding 7. #462 — Review and adopt Krohn patterns (https://github.com/cbartens/bkit/issues/462, closed) made the same point.

### Outcome

Every hard limit in `.bkit/core/.agents/rules.md` is either enforced on all five hosts, or is recorded as prose-only with the reason. The places where a missing hook is worth building are decided, and each becomes its own change issue.

### Current map (from the source, 2026-10-30)

Where it says Claude settings below, the same policy reaches Cursor, Codex and Antigravity through `.bkit/core/hooks/guardrails-tiers.js`, and OpenCode through its bash permission map. "Ask" means the host stops and asks the human before running the command. "Deny" means it never runs.

<!-- prettier-ignore -->
| Harm | Hard limit in `rules.md` | What enforces it today | Gap |
| --- | --- | --- | --- |
| Destroy data | **Destructive git**: never `git reset` (any flavour), `git checkout -- .`, `git restore .`, `git clean`, `git rebase -i`, `git stash drop` / `clear`, force push | Ask: `git reset --hard`, `git clean -f*`, `git checkout -- .`, `git restore .`, `git rebase -i`, `git stash drop` / `clear`, `git filter-branch`, `gh repo delete`, `gh release delete`, `gh pr close`. Deny: `rm -rf` on `/`, `~` or `$HOME` itself, `chmod -R 777 /` | The rule says never, but the hosts only ask, so a human click lets the command run. `git reset` without `--hard` is not covered. `rm -rf` on anything below the home folder, `git branch -D`, `git push --delete` and `git tag -d` are not covered |
| Leak a secret | **Secrets**: never stage `.env*`, credentials, tokens or keys. **Secrets in output**: never print secret values. **PII**: never log raw PII | Deny: reading `*.pem`, `*.p12`, `id_rsa`. Ask: reading `.env`, `.env.*`, `.bkit/.env`, including shell reads such as `cat .env`. `.gitignore` keeps `.env` and `.env.*` out of commits. Off-allowlist `curl` / `wget` gets a warning only | Nothing stops a secret value reaching a reply, a tracker comment, a commit message or a log once it has been read. PII logging has no check |
| Publish or push | **Pushes**: always ask before a push. **Force push**: never force-push `dev` / `main` | Deny: every form of force push. Ask: `npm` / `pnpm` / `bun publish` | A plain `git push` runs with no prompt, so this rests on the capitals alone. `gh pr create`, `gh pr merge`, `gh release create` and tracker writes (comments, issue edits) have no gate |
| Skip the owner's approval | **Tracker issue creation**: create only after confirmation. **Migrations**: build only after the owner confirms. GateGuard's gate-config note: always get sign-off for a quality-gate config change | Ask: `--no-verify` and `git commit -n`. GateGuard shows the gate-config note once per file, as advice only | Every approval rule apart from `--no-verify` is prose-only. GateGuard's config note does not block |
| Break a parsed field | Verdicts, field labels and headings that workflows parse | Tests run at pre-commit and in CI: `prompt-notation.test.ts`, `workflow-shape.test.ts`, the `instructions.ts` check, `bkit tests plan-check` | Enforced, but only after the edit, at commit time. That is enough, because the commit fails before the change lands |

### Success criteria

- Each row above has a decision: build a hook or deny rule, keep ask, or record it as prose-only with the reason.
- Any rule whose wording says "never" but whose host setting is "ask" either has its wording or its setting changed so the two agree.
- Each guard chosen for building has its own change issue, covering all five hosts.

### Constraints and non-goals

- Every new guard needs its nearest equivalent on Claude Code, Cursor, Codex, OpenCode and Antigravity, or a sourced note that a host has none.
- Shipped settings stay stack-agnostic.
- Blanket-denying every git command the workflows forbid is out of scope. A deny in settings applies everywhere, while some of those prohibitions only apply inside a workflow.
- Building the hooks is out of scope for this issue. It decides which hooks to build.

### Open questions

1. Should a plain `git push` outside a `/bkit-*` workflow become an ask on every host? Workflow pushes are pre-approved, so the hook would need to tell the two apart.
2. Should "never" rules that are only ask-tier be raised to deny, or reworded to "ask first"?
3. Is a hook that scans outgoing text (replies, comments, commit messages) for secret-shaped strings worth what it costs?

### References

- `.bkit/core/.bkit/authoring.md` § All Agent-Read Files (the capitals rule and its five harms)
- `.bkit/core/.agents/rules.md` § Git, CI & Merges, § Security & Data
- `.bkit/core/hooks/guardrails-tiers.js`, `.bkit/core/hooks/guardrails-read.js`, `.bkit/core/hooks/gateguard-engine.js`
- `.claude/settings.json` `permissions.deny` / `permissions.ask`
- #747 findings comment, row 7: https://github.com/cbartens/bkit/issues/747#issuecomment-6511413767

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Push approval: Recommend a guard that asks before ordinary pushes while preserving pre-approved workflow pushes, subject to reliably distinguishing authorized workflow pushes. Owner: "Yes to all. Continue with the recommended options."
- Q2 “Never” versus “ask first”: Resolve mismatches individually; deny unconditional prohibitions and clarify intended approval or workflow exceptions. Owner: "Yes to all. Continue with the recommended options."
- Q3 Secret scanning: Evaluate targeted checks on outgoing content bkit can actually inspect, prioritize reliable checks, and explicitly record uncovered surfaces and limitations. Owner: "Yes to all. Continue with the recommended options."
- Q4 Draft acceptance scenario: Accepted. Owner: "Yes, accept the draft. Continue with the design."
- Sandbox recovery: If an approved retry resolves a sandbox restriction, continue the workflow instead of treating it as a failure.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

As bkit’s owner, I can see which hard limits are enforced across all five hosts and which depend on written instructions. I can decide which protections to build without losing legitimate, pre-approved workflow operations.

#### Success Criteria

1. Every hard limit in `.bkit/core/.agents/rules.md` has an evidence-backed enforcement classification for each host.
2. Each gap has a decision: build a guard, retain approval, or retain written instructions with a reason.
3. Every “never” versus “ask first” mismatch has a proposed resolution that preserves intended exceptions.
4. Push protection distinguishes pre-approved workflow pushes; proposed secret checks identify exactly which outgoing content they cover.
5. Each recommended guard has a separate follow-up proposal covering all five hosts or documenting a sourced limitation.

#### Key Edge Cases

- A push’s workflow authorization cannot be reliably established.
- A host cannot intercept an action or inspect outgoing content.
- Secret detection misses a value or flags harmless text.
- A command is prohibited in one context but legitimately approved in another.

#### Process Sketch

- WHEN I inspect a hard limit → THEN I see its enforcement and evidence for each host.
- WHEN wording and enforcement disagree → THEN I see a proposed correction and its exceptions.
- WHEN push protection is proposed → THEN ordinary pushes require approval and authorized workflow pushes remain supported.
- WHEN secret scanning is proposed → THEN its coverage and limitations are explicit.
- WHEN a guard is recommended → THEN it has a separate follow-up proposal; this design phase does not build it.
