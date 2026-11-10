Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **(plan edit) Plan-check finding, TASK 1 test name already in use.** Location: `docs/plans/202611/logs/803-close-codex-opencode/plan-v1-draft.md:568` TASK 1. Message: "`.bkit/core/engine/install/modules/opencode.integration.test.ts` already holds a test named "permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated" — name the update to it in TEST FIRST, or give the new test a new name". The bullet at `:570` already calls itself "an update to this existing test", but `bkit tests plan-check` still flags it. Restate it in the form the checker recognises as an update to an existing test, or give the test a new name.
2. **(plan edit) An `EXTEND` row has no `[MODIFY]` entry.** The `Reuse Inventory` row "Manual recipe for the Codex real-host run" (`File` = `docs/testing.md`, `EXTEND`) has a runbook task (Task 5, and Task 10 for the coverage rows), but `Architecture & Component Changes` has no `[MODIFY] docs/testing.md`. § Docs (`:493-495`) only points at `Documentation Updates`. Under **Reuse Inventory**, `EXTEND` needs a `[MODIFY]` of the named file as well as a task, so this row is untraced. Add `#### [MODIFY] docs/testing.md` with its Existence Check (§ Manual recipe — OpenCode E2E at `:857` and § OpenCode host test coverage at `:844` both sit below `bkit:end` at `:553`, so the edit is outside the managed block), and list the new § Manual recipe — Codex key-read deny and the coverage rows.

## OPTIONAL

1. **The `bkit doctor` assumption is factually wrong.** The assumption at `:246` and the Context & Goals answer at `:27` both say `runPreflight` feeds only install, upgrade and `bkit check`. In fact `.bkit/core/engine/commands/install/doctor.ts:13,167` imports and calls `runPreflight`, so both new detectors also appear in `bkit doctor` without any extra work. Success criterion 2 names doctor. Fix the assumption and the Context answer. Optionally, add one assertion to `.bkit/core/engine/commands/install/doctor.integration.test.ts` so the doctor surface the criterion names is actually tested.
2. **Uninstall review lines are not redacted.** Task 3 prints one review line per legacy OpenCode substring key, using the Task 2 matcher. But `redactUrlParts` is private to `files.ts`, and the redaction `Reuse Inventory` row justifies keeping it private because it has one caller. A key such as `curl *https://user:tok@host/?k=v*` would therefore print unredacted in uninstall output, which breaks the issue constraint "no ... URL credentials, query strings". Export the redaction alongside the matcher, use it in Task 3, update the reuse row's justification, and add a credential-bearing key to Task 3's fourth test.
3. **No test covers the upgrade path writing the new keys.** `reconcileOpencodeJson` also calls `injectOpencodeDerivedAllows`, but the Task 1 tests cover `renderOpencodeJson` only. Task 2's upgrade test fails only when the advisory id is missing. Concrete Example step 1 promises that upgrade writes `https://github.com/*`. Make the Task 2 upgrade test also assert the exact-origin `webfetch` keys and that no new `curl *…*` key appears.
4. **Process Sketch line 1 contradicts itself.** "`permission.webfetch` carries exact `https://{host}` origins only" cannot hold while the same line keeps legacy `*{domain}*` entries in the file. Reword it to "bkit writes only exact `https://{host}` origins".
5. **Task 5 has one outcome for two different situations.** `outcome: "not-shown"` covers both "the run was not possible" and "Codex ignored the deny". They lead to the same doc phrase but are different evidence. A separate value such as `not-run`, or a required `reason` field, would keep the result file honest for whoever reads it next.
6. **Two allow rows have no test.** The Codex allow rows from Edge Cases (`cat ~/.ssh/id_rsa.pub`, `cat .env.example` → allow) appear only in Task 4's `DONE WHEN`, not in a Derived Test Matrix row or a TEST FIRST test. A key-first rewrite of `shellSecretRead` could regress them. Name the existing `SHELL_SECRET_READS` rows that cover them, or add one matrix row.
7. **Two cross-references are wrong.** Pre-Flight Core (`:314`) says "Task 6 records the version it runs", but Task 5 records `cliVersion`. The `Documentation Updates` row for `.bkit/core/.bkit/providers.md` (`:528`) names "Tasks 1, 4 and 6", but Tasks 2 and 3 also edit that file and Task 4 does not.
8. **One `Exempt` row points at a step, not a destination.** Out of Scope row 2 gives "Plan review: the owner's answer to Open Question 2" as `Where it belongs`. That is a decision point, not a place the work goes. Name the follow-up issue or cycle that carries option B if the owner picks it. Also note that under option A the Cursor and Codex paste notes keep a stamp that ignores consumer `allowed-domains`, so their "fingerprint" does not describe the full list those dashboards hold. Task 7's `cloud.md` edit should say this.
9. **Supersession `DELETE` rows have no `[DELETE]` mirror.** The five code-path removals are carried inside `[MODIFY]` entries, and `Architecture` has no `[DELETE]`. That is defensible for in-file removals. Even so, adding one sentence to each relevant `[MODIFY]` that names the Supersession row it removes would make the trace explicit.

## OUT OF SCOPE

- `bkit-cloud-opencode-job-never-installs-repo-deps` (`docs/failures.jsonl`, HIGH). It affects the same `opencode run` job that now meets `curl *: ask`. Fix it on its own failure row, as the plan's Suggested Scope Expansion recommends.
- Widening `secretFileKind` to `id_ed25519`, `id_ecdsa` and `*.key` for every script host. This is a shared-tier change that needs its own issue, as the plan's future-phase recommendation says.
- One live-verification issue (audit `deferrals-9`) that could carry the Task 5 Codex run as one more recorded run.
