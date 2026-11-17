Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh:267`
  - **DONE WHEN:** The Perl helper's scan (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:255` `$first_line`, `:267` ticket open, `:311` held-place lookup) and `.bkit/core/engine/commands/workflow/tests-jump.ts:24` `firstLine` read only regular, non-symlink files (an `lstat` / `-f` check before the open, or a non-blocking open), so a FIFO or other special file whose name matches `^\d+\.\d{6}-\d+$`, `.held` or `.jump` is ignored and never unlinked; a waiter with such an entry in `tests.queue/` still runs its command when the lock is free and still exits 75 at its limit; `scripts/ci/bkit-machine-lock.sh` stays byte-identical to the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a fifo named like a ticket, held place or jump marker neither hangs a waiter nor blocks the line` fails on the waiter's helper blocking forever in `open(my $t, "<", ...)` on the FIFO `tests.queue/1.000001-11` (no writer), so with `LOCAL_STACK_LOCK_WAIT_S=2` and a free lock it neither runs its command nor gives up within the test's deadline
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump skips a fifo named like a ticket instead of blocking` fails on `fs.readFileSync` blocking on the FIFO `tests.queue/1.000001-11`, so the spawned `bkit tests jump build-1` is killed at the `execute` spawn timeout with a null status instead of exiting 1

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The skill install step blanked the integrity hash of the permanent `find-skills` skill, so a later change to that agent-instruction content can no longer be told apart from what was reviewed
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `skills-lock.json:35`
  - **DONE WHEN:** `skills-lock.json` `skills["find-skills"].computedHash` holds the nonempty hash the skills CLI records for the installed `.agents/skills/find-skills/SKILL.md` (reinstalled with `npx skills add vercel-labs/skills@find-skills -y`, or the base entry restored), so every entry meets `.agents/skills.md` § Install / Update step 2 ("a nonempty `computedHash`").
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/skills-lock.test.ts` `every skills-lock.json entry records a nonempty computedHash` fails on `skills["find-skills"].computedHash` being `""`

<!-- bkit:task 2 end -->
