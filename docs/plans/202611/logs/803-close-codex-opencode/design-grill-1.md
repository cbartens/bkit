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

