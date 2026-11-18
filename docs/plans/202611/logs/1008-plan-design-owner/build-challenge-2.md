Verdict: CONCERNS
Failures: 2
Fingerprint: d3de2bae05b5124525127d24a9319185ac73564054822153c06563e8a0693594
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

The whole diff in `tmp/bkit-diff-1008-plan-design-owner.md` (full coverage; its first line is not `partial diff coverage`), read against the plan `docs/plans/202611/1008-plan-design-owner-plan.md`. Surfaces challenged: `newSessionDir` (`repo.ts`), `sessionPublication`, `progressBinding`, `commentRunProof`, `runActionKey` / `commentKey` (`tracker.ts`), the `workflows start` row and `failVerb` key (`workflows.ts`), the `issues comment` key (`issues.ts`), `fold` (`status.ts`), the Owner Answers lines in `bkit-plan.md` / `bkit-design.md` and their mirrors, the rebuilt `dist/` files, the new `.bkit/friction.jsonl` row, and the doc edits in `docs/security.md`, `docs/architecture.md`, `.bkit/core/.bkit/trackers.md` and `.bkit/core/.bkit/workflows.md`.

## Notes

Vectors checked and cleared:

- **Run proof (authorisation of a post):** `commentRunProof` swaps `endedRunActionKey` for `runActionKey`, which now uses the same rule (the count of runs of the workflow, refused at 0), so the three proofs and the no-proof refusal are unchanged. The existing no-proof test and the new `a --file post whose status file holds no run of the workflow exits 2` guard cover it.
- **Session id read:** `sessionPublication` still realpaths the folder and requires it to sit directly under the Git-common `sessions/` root before it reads `progress-id`. `newSessionDir` makes the folder with a non-recursive `mkdirSync` (fails if it exists), then writes 16 random bytes as hex with mode `0600`, so no file can be planted ahead of it.
- **Path traversal from `status.jsonl`:** the `progress` value reaches file paths only after hashing (`actionHash(target\0invocation)` for the progress cache, sha256 for the publication lock in `locks.ts:168-171`), so a crafted value cannot steer a write. Its one raw sink is the comment marker line (Task 1).
- **Comment ownership:** the `bkit:progress` marker is only written, never parsed. Editing a comment still needs the private cache's comment id, author id, fingerprint and timestamps to match the newest remote comment, so knowing or guessing a run's link (the FID-based fallback is computable from committed data) grants no edit right, and a tracker only lets the author edit its comment.
- **Data exposure:** the committed `progress` is a sha256 of a random id and the workflow name; the same value already appears in the posted marker. The new `workflows start` diagnostic prints a fixed line with no error text, and its friction row carries no body, path or personal data (`docs/observability.md` § Tracker reporting diagnostics). The new `.bkit/friction.jsonl` row names no consumer, path or person.
- **Secrets and supply chain:** no dependency, env var or credential is added; the test fixtures use dummy hex ids.
- **Shell input:** the new `--file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` argument is double-quoted like the `--session-dir` it replaces, and `{FID}` passes the slug allowlist upstream.
- **Tenancy / RLS:** not applicable; bkit has no database (`docs/security.md` § RLS). The cross-issue guard in `progressBinding` (the status file's FID must name `--issue`) is unchanged.

Not recorded as findings:

- `sessionPublication` follows a symlinked `progress-id` and reads it without a size bound. The content is only hashed, and only a party that already holds the user's file access can plant the link.
- The `--file` proof accepts any status-shaped file anywhere on disk. This predates the diff, and `docs/security.md` § Workflow comment ownership already says the proof is a check against accidental posts, not a boundary.

Docs cross-reference:

- Task 1 against `docs/security.md` § Input validation, row "Paths and identities for a comment update": identities are resolved against private progress state. After this diff the run's identity comes from committed, union-merged state (`.gitattributes` `docs/plans/**/status.jsonl merge=union`), so a shape check is what keeps it an identity and not free text.
- Task 2 against `docs/security.md:142` and § Shell-Edit Inspection, whose Known limit records a folder that is not `0700` instead of calling it private. If the owner prefers no code change, the other fix is to reword the sentence so it claims private permissions only for the `0600` files (progress cache, `progress-id`); the task picks the `0700` folder because that end state can be tested.

Docs loaded: `.agents/docs.md`, `docs/security.md` (present), `docs/observability.md` § Tracker reporting diagnostics. No listed doc was missing or empty.

No tests were run; this step does not build or run code.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A hand-written or union-merged `workflow-started` row with `"progress":"0\n@team see https://evil.example"` makes bkit post those lines, under its tracker token, into every progress comment of that run
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tracker.ts:1449` · **Round:** 1
  - **DONE WHEN:** `progressBinding` uses `run.progress` only when it matches `/^[0-9a-f]{64}$/` (the shape `actionHash` writes) and otherwise falls back to the FID, workflow, run number and `startedAt` hash, so the `###### bkit:progress v1 {id} 1 1` line `progressSection` writes at `tracker.ts:1559` always holds one sha256 hex and no text from `status.jsonl` reaches a posted body through it.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `posts only a sha256 progress link from the status file's start row` fails on the posted comment containing the injected `@team` line and no `^###### bkit:progress v1 [0-9a-f]{64} 1 1$` line, after `workflows start --workflow=build` with no session, a rewrite of the start row adding `progress` = `"0\n@team injected"`, and one `report` with `--file`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Another local user on a shared machine reads a run's `issue-description.md` and `prompt.md` from its `0755` session folder, while the rewritten `docs/security.md` sentence now tells reviewers the session folders have private file permissions
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/repo.ts:128` · **Round:** 1
  - **DONE WHEN:** `newSessionDir` creates each session folder with mode `0700`, so the files agents write into it (issue bodies, prompts, `progress-id`) are owner-only and the claim at `docs/security.md:142` ("the session folders ... with private file permissions") is true; the same sentence also stops calling the folder names "random session ids", because the names are `<utc-time>-<8 hex>` and the random id is the `progress-id` content.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/repo.test.ts` `creates each new session folder owner-only` fails on `fs.statSync(sessionDir).mode & 0o777` being `0o755` instead of `0o700`
<!-- bkit:task 2 end -->
