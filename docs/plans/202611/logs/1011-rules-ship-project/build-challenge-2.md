Verdict: PASS
Failures: 0
Fingerprint: b9bb65749aed03224874bf3511bac26a163464fc01d878e87bed16924d6ba65c
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

Full diff coverage: the diff's first line is a plain `diff --git` header, so `partial diff coverage` does not apply. The diff has 255 files. Surfaces challenged:

- `rulesBelowEnd`, `hasProjectGoalsHeading` and `hasNoProjectGoals` in `.bkit/core/engine/checks/tips/detect.ts:235-257`, and their build in `dist/checks/tips/detect.js`. This is the only new code that reads input.
- The `project-goals` entry of `SETUP_TIPS`, with its `resolve` hook, in `.bkit/core/engine/checks/tips/catalogue.ts:416-431`, and its build in `dist/checks/tips/catalogue.js`. Also checked: how `collectTips` in `.bkit/core/engine/checks/tips/index.ts:118-131` runs `fires` and `resolve` for `bkit tips`, `bkit install`, `bkit doctor` and the workflow `## bkit Tips` section.
- Clause `rules-leaf` in `.bkit/instructions.md:2563-2580` and its `retired` block, its 40 prompt sources in `.bkit/core/prompts/` and the 200 installed copies. Every changed line in those 240 files is one of exactly two distinct lines (240 removals of the old sentence, 240 additions of the new one), counted mechanically.
- The header box line and the `## Project Goals` starter in `.bkit/core/.agents/rules.md`, and the header box line in `.agents/rules.md`.
- The `Central agent rules` row in `.bkit/core/.bkit/prompts.md` and `.bkit/prompts.md`, and entry `central-agent-rules-rules-bullet` in `.bkit/instructions.md`.
- `.bkit/version`: every changed line is a `"path": "sha256"` manifest entry, checked by pattern.
- `.bkit/friction.jsonl` (three new orchestrator rows) and `docs/deferrals.jsonl` (two new LOW deferral rows from challenge round 1). Both are committed to a public repo.
- Tests: `.bkit/core/engine/audits/repo/rules-sync.test.ts`, `.bkit/core/engine/checks/tips/catalogue.test.ts`, `.bkit/core/engine/tools/instructions.test.ts`.

## Notes

Vectors checked with no finding:

- **Authentication, authorisation, sessions, tokens:** no change touches them. The leaf / orchestrator split is intact: the new sentence still ends "skip its `Orchestrator Rules`", and `## Project Goals` sits after `### Orchestrator Rules` at `##` level, so a leaf that skips that subsection does not skip the goals, and the goals add nothing to what a leaf may do.
- **Data access and tenancy:** bkit has no database (`docs/security.md` § RLS, § Scope). `docs/data-schema.md` is the 10-line starter with no schema in it, which matches; warned and continued.
- **Input handling:** the three new detectors read `.agents/rules.md` through the existing `readText` helper (`detect.ts:28-31`) and return only booleans. `resolve` picks between two fixed `ask` strings, so no file content reaches tip output, the terminal or the workflow summary. A symlinked rules file exposes at most one bit. The comment strip (`/<!--[\s\S]*?-->/g`) and the list-item test (`/^\s*(?:[-*+]|\d+[.)])\s/m`) can turn quadratic on a crafted file (many unclosed `<!--`, or a long run of blank lines). Not measured. Not logged, because no trust boundary is crossed: the file is repo content, every leaf already reads it as instructions, and anyone who can plant it can already plant hooks or `package.json` scripts that run on the same commands.
- **Prompt injection:** `.agents/rules.md` below `bkit:end` is owner-written first-party text. It is not on the attacker-controlled list in `docs/security.md` § Untrusted Content & Prompt Injection. Leaves already read the whole file from `bkit:end` on before this diff, so the clause change makes no agent take in new text. It only says how to weigh one section. The starter's commented examples hold tie-break guidance only, and no directive.
- **Secrets and data exposure:** no secret, token or key is added. The new `.bkit/friction.jsonl` rows name repo-relative paths, bkit's own repo and a host-generated worktree name, and no person or consumer. The new `docs/deferrals.jsonl` rows describe correctness and design concerns in unreleased branch code, not an exploitable flaw in a published version (`docs/security.md` § Public repo content).
- **Supply chain:** no new dependency. `package.json` and the lockfile are not in the diff.
- **Build integrity:** `dist/checks/tips/catalogue.js` and `dist/checks/tips/detect.js` match their TypeScript sources hunk for hunk.

Already tracked, so not logged again:

- The round 1 LOW finding about whether a goal may tip a gate agent's severity or verdict call (clause `rules-leaf`, `.bkit/instructions.md:2573`) is still open as deferral `1011-rules-ship-project-challenge-low-bkit-instructions-md-2573` in `docs/deferrals.jsonl`. The clause text it points at has not changed since. No new task block is written for it: `challenge merge` would only update the same deferral row. It still needs the owner's decision.

Outside this lens, or older than this diff, and proposed separately:

- `.bkit/prompts.md:478` and `docs/security.md:49` say "Subagents spawn self-contained and never read `.agents/rules.md`". That contradicts clause `rules-leaf` and the `Central agent rules` row this diff edits (`.bkit/prompts.md:449`), under which leaves read the file from `bkit:end` on. The security conclusion there still holds for bkit's own rules, which leaves skip, so this is a doc fix and not a vulnerability.
- `rules-sync.test.ts` now strips HTML comments before it checks that the shipped template holds no project rules. A bullet inside a comment would ship to every fresh install and be read by leaves, and the check would not catch it. Exploiting that needs commit rights to bkit itself, which is the owner only (`docs/security.md` § Repository controls). That is test strength rather than a trust boundary.

Cross-reference (step 8): `docs/security.md` § Untrusted Content & Prompt Injection, § Scope, § PII, § RLS and § Public repo content, and `.bkit/prompts.md` § Untrusted Content & Prompt Injection (threat model), were read against every surface above. `docs/knowledge.jsonl` and `docs/decisions.jsonl` hold no `Project Goals` entry.

No tests were run and no code was executed: this agent's mandate is to challenge the diff without building or running code.
