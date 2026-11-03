## Session Prompt — this run's, newer than everything below

[$bkit-design](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-design/SKILL.md) #803

## Issue description — oldest

### Problem

Six deferrals on the host guards are still open, and the blockers on two of them have lifted.

- **Codex key reads (blocker lifted):** the shell path classifies `*.pem`, `*.p12` and `id_rsa` as `key` (`.bkit/core/hooks/guardrails-tiers.js:193-197`), but `decideShell` answers the `secret` tier with `ask`, which is advisory on Codex (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:74-77`). A `cat id_rsa` therefore runs with only a note. The old blocker, "the Codex file-read tool name is unverified", is gone: `.bkit/core/.codex/hooks/bkit-readguard.cjs:5` records that every Codex read arrives as a shell command.
- **OpenCode curl/wget allowlist (blocker lifted):** the shell allows are substring globs (`.bkit/core/engine/install/modules/opencode.ts:352-360`, e.g. `` bash[`curl *${base}*`] = "allow" ``; rendered in `.opencode/opencode.json:180-183`), so any command that contains an allowed host passes. The row waited for an OpenCode pre-tool hook. That hook exists, and bkit already refuses calls through it (`.bkit/core/.opencode/plugin/bkit-gateguard.js:173`, `:270` registers `"tool.execute.before"`).
- **OpenCode has no guardrails plugin:** `.bkit/core/.opencode/plugin/` holds `bkit-gateguard.js`, `bkit-readguard.js` and `bkit-rules.js` only, so two gates cannot be expressed there.
- **OpenCode bash grants are never revoked:** the reconcile at `opencode.ts:383-450` deep-merges existing keys, so a dropped grant survives.
- **WebFetch grants survive uninstall:** `.bkit/core/engine/commands/install/uninstall.ts:739` recomputes `resolveClaudeDerivedAllows(ctx.cwd)` after the seed is emptied.
- **Cloud allowlist staleness:** the paste block carries a fingerprint (`.bkit/core/engine/install/cloud-env.ts:634,685`), but `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` never echoes one, so a stale cloud allowlist goes unnoticed.

### Outcome

Codex refuses private-key reads, OpenCode parses curl/wget targets instead of substring-matching them, dropped grants are revoked on reconcile and uninstall, and a cloud session can tell when its allowlist is stale.

### Success criteria

- On Codex, `cat id_rsa` (and the other `key` kinds) is denied; `.env` reads stay advisory.
- On OpenCode, `curl https://evil.example/?agents.md` is refused while an allowed host still passes.
- Removing a grant from the seed removes it from `.opencode/opencode.json` on the next `bkit upgrade`, and `bkit uninstall` leaves no derived WebFetch grant.
- The cloud bootstrap prints the allowlist fingerprint, and a mismatch is visible.
- The host-parity matrix (`.agents/rules.md` § Provider parity) covers each change.

### Constraints and non-goals

- Keep the guard tiers shared in `.bkit/core/hooks/guardrails-tiers.js`; host adapters stay thin.
- Stack-agnostic: no grant names an app stack.

### Decisions already made

- Deny is real on Codex (row `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` remediation).

### Open questions

- OpenCode: does host-side curl/wget parsing live in a new guardrails plugin or in `bkit-gateguard.js`? A) A new `bkit-guardrails.js` plugin that mirrors the Claude/Codex guardrails hook. B) Extend `bkit-gateguard.js`. Recommended: A, so each plugin keeps one job.

### References

- **Audit reports:** docs/audits/202611/deferrals.md (findings deferrals-1, deferrals-3, deferrals-11)
- Audit parent: #344 — Deferrals triage
- `docs/deferrals.jsonl` key `381-opencode-curl-glob-substring-bypass`
- `docs/deferrals.jsonl` key `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`
- `docs/deferrals.jsonl` key `381-cloud-allowlist-staleness-detector`
- `docs/deferrals.jsonl` key `381-webfetch-grants-survive-uninstall-after-seed-emptied`
- `docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked`
- `docs/deferrals.jsonl` key `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`

## Grill decisions — the owner's answers in this run, the newest text
Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled
- Q1 OpenCode guard location: A) Dedicated bkit-guardrails.js plugin sharing the existing guard logic. Owner: "q1 - a)".
- Q2 Stale cloud allowlist: A) Warn and provide refresh instructions; continue. Owner: "q2 - a)".
- Q3 Uncertain download targets: A) Refuse and explain the unresolved or unapproved target. Owner: "yes".
- Q4 User-authored permissions: A) Preserve unrelated user-authored permissions. Owner: "yes".
- Q5 Missing fingerprint: A) Warn and continue with refresh instructions. Owner: "yes".
- Q6 Draft acceptance scenario: A) yes. Owner: "yes".

### Assumed, not confirmed
None.

### Open
None.

### Draft Acceptance Scenario
> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative
As a bkit user, I want private-key reads and unapproved download targets blocked consistently. When I remove a grant, it should disappear from the generated permissions; when my cloud allowlist is stale, I want a clear warning and refresh instructions.

#### Success Criteria
1. Codex denies reads classified as private keys; .env reads remain advisory.
2. OpenCode checks actual curl/wget targets: approved hosts pass, and an approved name inside an unapproved URL does not bypass protection.
3. Removing a seed grant removes its generated OpenCode permission on upgrade; uninstall removes derived WebFetch grants.
4. Cloud bootstrap prints the allowlist fingerprint and warns on a mismatch, provides refresh instructions, and continues.
5. The host-parity matrix documents each change across supported hosts.

#### Key Edge Cases
- An approved name appears only in an unapproved URL's path or query.
- A command contains multiple targets or a target that cannot be determined safely.
- Generated permissions coexist with user-authored permissions.
- The cloud fingerprint is missing or differs from the expected value.

#### Process Sketch
- WHEN Codex reads id_rsa → THEN the read is denied.
- WHEN Codex reads .env → THEN the existing advisory remains.
- WHEN OpenCode downloads from an approved host → THEN it passes the target check.
- WHEN OpenCode downloads from evil.example/?agents.md → THEN the unapproved target is refused.
- WHEN a seed grant is removed and upgrade runs → THEN its generated permission disappears.
- WHEN uninstall runs → THEN derived WebFetch grants disappear.
- WHEN the cloud fingerprint differs → THEN bootstrap warns, explains the refresh, and continues.

