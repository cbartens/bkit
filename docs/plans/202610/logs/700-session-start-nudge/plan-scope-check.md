Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

Plan: `docs/plans/202610/logs/700-session-start-nudge/plan-v1-draft.md`. Inputs read: `plan-input-1.md` (`#700`, `change` shape), `related-issues.md`, `related-deferrals.md`, `related-failures.md`, `status.jsonl`.

## CRITICAL

**C1 — Three new hook templates break `.bkit/core/engine/render/parts.test.ts`, and no task owns the fix.**

Tasks 2 and 3 create `.bkit/core/.opencode/plugin/bkit-rules.js`, `.bkit/core/.codex/hooks/bkit-rules.cjs` and `.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs`, each splicing `{{BKIT_PART session-rules-advisory.js}}` (Architecture § Shared Hook Parts, § opencode / Codex / Antigravity Host; Reuse Inventory rows 4-6). `.bkit/core/engine/render/parts.test.ts` `the hook templates that splice parts are the sixteen host hooks` asserts that splicer set as an exact 16-item list — a new template carrying a part line fails it until the list gains the entry. The same file's `every part line sits inside the bkit-managed block` and `every generated hook parses` also bind the three new files, and the managed-version marker guard (`.bkit/core/engine/commands/install/upgrade.test.ts`, per `docs/testing.md` § Key test files) requires each new hook to carry `{{BKIT_MANAGED_MARKER}}` inside `// bkit:start` … `// bkit:end`.

The plan never names `parts.test.ts` (no task, no `DONE WHEN`, no `Derived Test Matrix` row; `Verification Plan` § Test Synchronization lists only `preflight-sh.integration.test.ts`, `gateguard-parity.integration.test.ts`, `readguard-parity.integration.test.ts`), so this is a test the plan's own tasks break with no owning task — Runbook rule "A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one".

Fix: add to Task 2 and Task 3's `UPDATE:` a line for `.bkit/core/engine/render/parts.test.ts` (add each new template to the splicer list), and state in each `DONE WHEN` that the new file carries its `bkit:start` / `{{BKIT_MANAGED_MARKER}}` / `bkit:end` block with the part line inside it.

**C2 — The new hook family needs the slop opt-outs and the dogfood edit entry; no task names either.**

Each new hook is a template plus a byte-identical installed mirror and carries a fail-open catch. `slop-scan.config.json` overrides every sibling hook family for exactly those two conditions: `defensive.empty-catch` (the `.opencode/plugin/bkit-gateguard.js` / `bkit-readguard.js` pair) and `structure.duplicate-function-signatures` (the gateguard / readguard / guardrails template+mirror file lists, `**/.opencode/plugin/…`, `**/.codex/hooks/…`, `**/.agents/plugins/bkit/hooks/…` globs included). No group names `bkit-rules`, and no `ignores` entry covers it (`**/.opencode/**` is not ignored). `bkit ci slop` fails the run on added findings (`FAIL — change adds/worsens slop on net.`), and `slop:delta` sits inside `pnpm bkit:gate:static` and `bkit:gate:static-unit-integration` — the gate the plan's `Verification Plan` § Automated Tests requires to pass. `slop-scan.config.json` is an adopted template copy, so each edit also needs its `bkit-only` entry in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` (the existing `what: "the core hook sources share their mirrors' opt-outs"` entries), or that test fails too.

No task, `DONE WHEN` or `Derived Test Matrix` row covers this. Fix: add the `bkit-rules` family to the two override groups, update the `dogfood-templates.test.ts` entry, and name both in Task 2 / Task 3's `UPDATE:` plus their `DONE WHEN` (e.g. `pnpm slop:delta` clean).

**C3 — `Derived Test Matrix` ↔ runbook mapping is not bidirectional.**

Task 2's fourth `TEST FIRST` test, `the shared advisory names .agents/rules.md and not AGENTS.md`, has no row in the matrix: row 2 (`Advisory text never names AGENTS.md as required reading`) is mapped to Task 1, row 11 (`Every rendered advisory hook names .agents/rules.md and never AGENTS.md`) to Task 3, and row 7 / 8 are the opencode delivery rows. Runbook rule: "Behaviour tests come only from `Derived Test Matrix` rows". Every row does reach its mapped task (rows 1, 2, 4, 5, 6 → Task 1; 7, 8 → Task 2; 3, 9, 10, 11 → Task 3), so the gap is one-directional.

Fix: add a row (`the shared advisory constant names .agents/rules.md and not AGENTS.md`, Type `Integration` (see OPTIONAL — tier labels), `Target file` `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`, Task 2) or drop the test from Task 2.

## OPTIONAL

**O1 — The Codex matcher `apply_patch|Bash` is asserted, not verified, and no assumption covers it.** Architecture § Codex Host calls `apply_patch|Bash` "the broadest matchers bkit already uses", and Task 3 registers it so. The shipped `.bkit/shared/.codex/hooks.json` uses single-value matchers only (`apply_patch`, `Bash`, `Bash`) — bkit's alternation precedent is Claude's settings and Antigravity's hooks.json. `docs/failures.jsonl` `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` (OPEN) records that only `Bash` is a confirmed Codex `tool_name`. If Codex matches the tool name literally, the hook installs, exits 0 and never fires; every planned Codex test spawns the rendered file directly and would still pass. Add an `Open Questions & Assumptions` line (name what breaks: the Codex half of Success Criterion 4, undetectable by the matrix), and register two single-value entries or probe the host.

**O2 — `Out of Scope` rows 2 and 3 carry no matching `docs/deferrals.jsonl` row.** Row 1 (ideas 2-4) names its three keys; "Any change to `.agents/rules.md` content" and "Blocking behaviour of any kind" point only at `#700` § Out of Scope. Either mint a key each (`scope-declared`, `references` to `#700` § Out of Scope) or say in the row that they are non-goals with nothing to remediate, so the "each `Exempt` row has a matching deferral row" line holds.

**O3 — Test-tier labels contradict the target files.** Matrix rows 4-11 are typed `unit`, and Pre-Flight § Testing & Quality says "hook behaviour is tested as unit-tier … no integration / `@live` / E2E row", yet the targets are `preflight-sh.integration.test.ts` and the new `session-rules-advisory.integration.test.ts`, and `docs/testing.md` § Key test files records the sibling hook files as Integration (they spawn real processes). Retag the added rows `Integration` and reword that Pre-Flight line, so the matrix matches `docs/testing.md` ("Type = lowest tier that exercises it, named per `docs/testing.md`").

**O4 — `Documentation Updates` omits `docs/testing.md`.** The change adds a key test file (`session-rules-advisory.integration.test.ts`) and rewrites the IDE-skip scope of `preflight-sh.integration.test.ts`; the template's own row list carries a `docs/testing.md` entry for "new test files / patterns". Add the row and name it in Task 4.

**O5 — Two new canonical copies of one advisory string, with no drift guard.** `.bkit/core/hooks/preflight-rules.sh` and `.bkit/core/hooks/session-rules-advisory.js` each hold "the same string" (Architecture § Shared Hook Parts, Reuse Inventory rows 1 and 3), and the only guard is the naming check in matrix rows 1 / 2 / 11. The repo's doctrine is one master wording per instruction (`.bkit/instructions.md`, `pnpm instructions:sync`, § Hook Text for hook messages; `HOOK_SOURCES` in `.bkit/core/engine/tools/instructions-sources.ts` currently lists only the gateguard, readguard and guardrails files — the new family would be outside it). Single-source the string (the JS part reading the shell part, or one part spliced into both hosts' syntax) or add a matrix row + `TEST FIRST` test asserting the two copies are byte-identical, and record the choice.

**O6 — Task 4's doc targets need correcting and its checks widening.** `docs/architecture.md` has no `Installed layout` heading (headings: What bkit Is, Package Boundaries, Install Lifecycle, Consumer Integration Model, Compliance Grader Subsystem, Knowledge / Decisions JSONL Ledgers, Roadmap Ledger & Board, Distribution); the hook-list paragraph the plan means is in § Consumer Integration Model (~line 172). `.bkit/core/.bkit/providers.md` is a shipped doc — `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` scans it at its package source and rejects tracker numbers, ledger keys and finding ids — so Task 4 should name that next to the provider `§ Hooks` parts table (`preflight-rules.sh`, `session-rules-advisory.js` need rows) and add it to `DONE WHEN`.

**O7 — Existing tests the plan breaks at Task 1 are owned only by Gate 4.** Moving the advisory above the IDE bail changes three assertions in `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`: `exits 0 silently when LINEAR_ISSUE_ID is empty (existing IDE-skip preserved)`, `a Jira session (token set, no LINEAR_ISSUE_ID) exits 0 silently` and `exits 0 silently when the session is not a background agent` — all three expect empty stdout. `Verification Plan` § Test Synchronization names the file, but no task does; name them in Task 1's `UPDATE:` / `DONE WHEN` so the changing task closes them.

**O8 — The issue's per-host dogfood check now sits only in the non-blocking manual section.** `#700` Task 2's `DONE WHEN` ("each host's dogfood shows the advisory on a fresh session") is replaced in the runbook by rendered-file assertions; the live proof is `Manual Verification` Steps 1-2, which the plan itself marks "An unticked box blocks nothing". If live delivery must gate, add a dogfood line to Task 2 / Task 3's `DONE WHEN` (or a `@live`-tier row); otherwise say in the task that live proof is owner-run by design.

## OUT OF SCOPE

Suggestions only — not applied to this plan.

**Fold the Codex read-tier gate into this plan's Codex hook work.** The plan already touches the Codex hook family, matcher and `hooks.json`, and the deferred work (`docs/deferrals.jsonl` `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`, OPEN) is blocked on precisely the Codex matcher / tool-name knowledge this plan depends on (O1) — one probe would settle both. Recommendation: keep out of this plan; it is a security-tier change (deny on `*.pem`, ask on `.env`) of its own size and belongs with the read-gate parity rows in `.bkit/core/engine/install/modules/index.integration.test.ts`.

**Give ReadGuard the same first-tool session advisory.** The new `bkit-rules` hook is the first per-session (not per-file, per-read) nudge bkit ships, and the deferred ReadGuard nudge (`docs/decisions.jsonl` `668-readguard-nudge-out-of-scope`) asks for the same channel. Recommendation: keep out of this plan; the owner ruled it out of `#668`, and folding it in would couple two advisory surfaces before the first one ships.
