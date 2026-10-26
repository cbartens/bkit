Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Tightness, dependency correctness, design-coverage.

## CRITICAL

- **Every test this change turns red is owned by no task.** Three existing assertions encode today's behaviour or today's exact hook sets; Tasks 1-3 invalidate them, and no task names the fix (Task 1's `DONE WHEN` covers only "the existing preflight guard assertions", and every `TEST FIRST` item in Tasks 1-3 is a brand-new test):
  - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` — `exits 0 silently when LINEAR_ISSUE_ID is empty (existing IDE-skip preserved)` (`stdout === ""`), `a Jira session (token set, no LINEAR_ISSUE_ID) exits 0 silently` (`stdout === ""`, `stderr === ""`), and Cursor's `exits 0 silently when the session is not a background agent` (`stdout === ""`). Task 1 puts the advisory on stdout in all three paths.
  - `.bkit/core/engine/render/parts.test.ts` — `the hook templates that splice parts are the sixteen host hooks` asserts an exact 16-name array; the plan adds three part-splicing templates (`.opencode/plugin/bkit-rules.js`, `.codex/hooks/bkit-rules.cjs`, `.agents/plugins/bkit/hooks/bkit-rules.cjs`), so 19.
  - `.bkit/core/engine/commands/install/check.integration.test.ts` — `requires the hook files of each installed host, and only those` asserts exact per-host lists; `findMissingOwnedHooks` (`.bkit/core/engine/checks/after/managed.ts:215`) derives its set from the manifest, so the new manifest entries make codex 4 names and opencode 3.
    Fix: Task 1 updates the three preflight assertions (advisory on stdout, exit 0 kept); Task 2 updates the opencode expectation and the parts list; Task 3 updates the codex expectation; each task's `DONE WHEN` says so. A task that changes logic fixes the tests it breaks, in that task.
- **`.bkit/core/hooks/session-rules-advisory.js` is given an export surface a spliced hook part cannot have.** The plan calls it a part (spliced by `// {{BKIT_PART session-rules-advisory.js}}`) that "Exports `RULES_READ_ADVISORY` … and `rulesReadAdviceOnce(sessionId)`". `renderParts` (`.bkit/core/engine/render/parts.ts:25`) copies a part's bytes into each host template, and every existing part (`gateguard-engine.js`, `readguard-engine.js`, `antigravity-hook.js`, `readguard-payload.js`) is plain `const` / `function` with no `export` and no `import`, taking `fs` / `os` / `path` from the host's own scope. An `export` inside the part makes the rendered `.codex/hooks/bkit-rules.cjs` and `.agents/plugins/bkit/hooks/bkit-rules.cjs` invalid CJS, and `parts.test.ts` `every generated hook parses: node --check for JS, bash -n for shell` fails. Restate Task 2's CREATE as plain declarations (`const RULES_READ_ADVISORY = …`, `function rulesReadAdviceOnce(sessionId) {…}`) plus the module-scope line the part assumes, as the existing parts do.

## OPTIONAL

- **Mirror refresh + close-out has no task of its own.** The only place the runbook mentions `bkit install` is inside Task 4's `DONE WHEN`; the repo's own installed mirrors are generated (`readTemplate`), so the two edited `bkit-preflight.sh` mirrors and the three new hook mirrors need a run. Precedent in this repo is an explicit close-out task (`docs/plans/202610/651-sops-env-backup-plan.md` Task 12: `bkit upgrade`, `bkit check`, full suite, packed-tarball dogfood). Make it a task, or add the action to Task 4's fields.
- **`.bkit/instructions.md` § Hook Text is not updated.** The advisory is a hook message, and the store is the one home for hook text, checked both ways against `HOOK_SOURCES` (`.bkit/core/engine/tools/instructions-sources.ts:302`, `checkHooks`). The plan ships the same sentence twice (shell part + JS part), which is the copy-drift case the store exists for. Add `session-rules-advisory.js` to `HOOK_SOURCES` and a `## Hook Text` entry, so the two copies cannot drift. No test forces this today, so it is a doctrine gap, not a red suite.
- **`slop-scan.config.json` is not in the plan.** `slop:delta` sits in `bkit:gate:min` and `bkit:gate:static`, and its `overrides` disable `defensive.empty-catch` / `structure.duplicate-function-signatures` per hook family. Three new fail-open hook files and their mirrors have no such entry, so the pre-push gate may refuse; and adding entries without the paired `dogfood-templates.test.ts` `slop-scan.config.json` edit entries breaks that test.
- **Codex matcher `apply_patch|Bash` is a guess worth pinning before it is written.** Both names already appear in `.bkit/shared/.codex/hooks.json`, so alternation is plausible, but the open deferral `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` records that a hook on an unconfirmed Codex surface installs, exits 0 and silently never fires — and Task 3's unit test renders the hook, so it cannot detect a dead registration. Confirm against the Codex hooks docs while writing the config; Manual Verification Step 2 already covers the live check.
- **The `python3`-free writer is specified for Cursor only.** With `emit_context` accumulating into an `EXIT` trap, a python3-less Claude IDE session loses the advisory (Claude cannot block, so nothing errors). The advisory string is quote- and backslash-free, so the same `printf` writer works in both hooks.
- **`Out of Scope` rows 2 and 3 carry no `docs/deferrals.jsonl` key.** Row 1 names three deferral keys; `Any change to .agents/rules.md content` and `Blocking behaviour of any kind` name none. Add keys, or fold both into row 1's statement. Bookkeeping only — neither blocks anything.
- **`Context & Goals` over-claims.** It says the issue's `Tasks` are "kept word for word"; the runbook is a new 4-task expansion of the issue's 3-task sketch (5 hosts, three new hook files, install wiring). Reword to "the issue's `Tasks` are the spec, expanded into the runbook below" so a later audit does not read it as drift. Also give Task 4's `docs/knowledge.jsonl` row its `key` per `.bkit/jsonl.md`.

## OUT OF SCOPE

- None. The plan's `Out of Scope` table holds the issue's three declared exclusions (ideas 2-4; `.agents/rules.md` content; blocking behaviour) and no runbook work is parked there. Two bookkeeping notes on that table are in `OPTIONAL` above. No plan-expansion work is proposed for the runbook: ideas 2-4 stay deferred to `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement` and `700-provider-auto-load-rules`.

## SUGGESTED SCOPE EXPANSION

- `docs/deferrals.jsonl` key `650-preflight-linear-issue-less` (OPEN, LOW) — reads `.bkit/core/hooks/preflight-linear.sh`, the file Task 1 declares `READ`; keep deferred (a Linear cloud agent is always launched from an issue).
- `docs/deferrals.jsonl` key `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` (OPEN, MEDIUM) — the Codex `PreToolUse` surface Task 3 registers a new hook on; keep deferred (read-tier gates, a different concern), but it is the source of the matcher risk noted in `OPTIONAL`.
- `bkit upgrade` silently replacing a drifted managed block (`related-issues.md` § Re-check of `aea3c813`, final residual) — this plan rewrites the managed block of both `bkit-preflight.sh` hooks and adds three markered-text hooks; keep as its own issue, nothing in `#700`'s criteria needs it.
- `docs/deferrals.jsonl` key `504-install-advisory-when-tracker-is-none` (OPEN, MEDIUM) — install-advisory surface; keep deferred, no criterion here needs it.
