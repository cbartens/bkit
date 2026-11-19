Verdict: PASS
Failures: 0
Fingerprint: 952295583d3d6bbdf4c8edd26d3ff1f8cb84b69ebec647405a27e2531bd6e8b7
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Full diff read (`tmp/bkit-diff-1061-takeover-unbuilt-planned.md`; its first line is no `partial diff coverage` line): `.bkit/core/engine/commands/workflow/tests.ts` (the `lockBaselines` move loop, `fromOf` in `bkit tests red`, the `RedTest.from` comment), `.bkit/core/engine/commands/workflow/tests.test.ts`, `dist/commands/workflow/tests.js`, `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md`, `.bkit/version` and `docs/testing.md`.
- Context read: `lockBaselines`, `touchedTests`, `redEntries`, `planTakeovers`, `sameTestName`, `takenOverEntry` and the `tests red` / `tests green` verbs in `tests.ts`; both `touchedTests` callers in `.bkit/core/engine/commands/workflow/steps.ts` (the code-step lock at line 1357, the tests-step lock at line 1535); the Step 7 order in `.bkit/core/workflows/bkit-build.md` (the tests-step `steps finish` at line 717 runs before `tests red` at line 729); decision `1002-planned-test-lock-no-escape` in `docs/decisions.jsonl`.
- Docs: `.agents/docs.md` read, and `docs/security.md` read in full. The other Build-phase docs (`docs/data-schema.md`, `docs/architecture.md`, `docs/observability.md`, `docs/capabilities.md`, `.agents/skills.md`) were searched for the lock, red rows and takeovers: none covers them, and the diff touches no schema, log line, skill or capability.
- Warning: `docs/security.md` has no section on the planned-test lock. The cross-reference therefore uses its § Trust boundaries (status logs are CLI input) and § Input validation, plus the takeover rules in `.bkit/workflows.md` and `docs/testing.md`.

## Notes

- No surface in the diff for these vectors: authentication, authorization, sessions, tenancy and data-access policies (bkit has no database, `docs/security.md` § RLS); secrets (the only new value in `.bkit/version` is the SHA-256 of `.bkit/workflows.md`, and it matches the file); PII and data exposure (no new log line, output field or tracker text); injection and path traversal (the new `path.posix.normalize` calls only compare paths, and nothing new opens a file or starts a process); supply chain (no dependency change). The new tests write only under an `fs.mkdtempSync` folder in `os.tmpdir()` and remove it in `finally`.
- The lock as a pipeline-integrity control (OWASP A08) is not weaker against a code step. A baseline now moves onto any later red entry of another task naming the same file and name. `bkit tests red` records entries only for open tasks of the group it runs, and it runs after `steps finish --step=build-plan-tests` has refused any change to a test no open task of the group names, using the same file equality and `sameTestName` match as the move. So every set of lines the lock can move to is one the tests step was already allowed to write under the plan's takeover, which decision `1002-planned-test-lock-no-escape` names as the only way a planned test changes. The new `touchedTests` test also proves that a file holding the earlier lines is still reported.
- `fromOf` accepts an earlier owner whatever the state of its baseline (`missing`, `lint` and `vacuous` included). The old code did the same for the nearest owner; the diff extends it to owners further back. This is not a new weakness: a passing takeover is listed under `takenOver` with its diff, as designed.
- Out of scope, proposed separately because the diff does not introduce it: `bkit tests red` has no guard against a call made during a code step, and `bkit-build-plan-tasks` holds `Bash` (`.claude/agents/bkit-build-plan-tasks.md:6-13`). A code step that rewrites its own group's planned test and then runs `bkit tests red --group={GROUP}` re-records the test at the rewritten lines, so its own `steps finish` passes the lock; a `--writer-log` it writes with a `PASSES` line turns the pass into `passed-accepted`. The diff widens this only slightly: a red run for an open group earlier in plan order, whose task is the test's first owner (so its entry has no `from`), now also moves a later task's key. The fix is an engine guard (for example, `tests red` refusing a group whose code step has started), which belongs in its own issue.
