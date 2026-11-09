Verdict: PASS
Strategy: STANDARD

<!-- verdict:end -->

# Debug Failure

## Remediation Log
DONE — Step 1: Preserve partial FIFO replies — Deterministic fragmented reply failed with k/ETIMEDOUT before repair and passes after accumulating bytes through newline, including the dead-holder drain (.bkit/templates/scripts/ci/bkit-machine-lock.sh)
DONE — Step 2: Stop and reap rejected holders — Deterministic malformed acquired-holder reply timed out before repair and now returns promptly, with no surviving holder and successful subsequent acquisition (.bkit/templates/scripts/ci/bkit-machine-lock.sh)
DONE — Step 3: Synchronise adopted script — Copied canonical template through the documented template-copy command (scripts/ci/bkit-machine-lock.sh)
DONE — Step 4: Add deterministic regressions — Both red-before-green probes pass; signal and error.code diagnostics retained without changing prior assertions or timeouts (.bkit/core/engine/audits/templates/machine-lock.integration.test.ts)
DONE — Step 5: Record confirmed incident evidence — Updated the existing failure key; current FIFO corruption/wait cycle is repaired, while the earlier exit-73/75 cause remains unconfirmed (docs/failures.jsonl)
DONE — Step 6: Verify complete repair — Full machine-lock suite 45/45 and dogfood-template parity 68/68 passed; build and fresh five-host install/upgrade/check passed; installed template is byte-identical and a real consumer releases/reacquires the lock (tmp/build-prepush-remediate-suite.log, tmp/build-prepush-remediate-dogfood.log)
DONE — Step 7: Verify final regression harness and changed gate — Final probes assert numeric PID, ESRCH after reap, exact outputs and subsequent acquisition; final changed gate passed 45 related plus 286 named tests, shell checks, lint, formatting and types after harness fixes (tmp/build-prepush-remediate-changed-final.log)
DONE — Step 8: Record verified gotchas — Appended timed-read partial-byte and literal Perl PID replacement lessons; no architecture decision required (docs/knowledge.jsonl)
