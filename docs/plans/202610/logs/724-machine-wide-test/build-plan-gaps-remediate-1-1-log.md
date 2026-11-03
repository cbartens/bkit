Verdict: FAIL
Strategy: STANDARD
Fixed: 3

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
BLOCKED — Gap 1: planned machine-wide test expects firstRepo.root without setting child cwd; source correctly reports caller checkout. Frozen planned test needs the tests-step/owner route.
DONE — Gap 2: active copy, run and source instructions name bkit-machine-lock.sh; the frozen compatibility fixture stays unchanged (.bkit/core/.bkit/templates.md).
DONE — Gap 3: escaped punctuation gives distinct normalized lock names separate owner/PID state; regression failed before the fix and passed after it (tmp/724-remediate-red.log, tmp/724-remediate-green.log).
DONE — Gap 4: unset-safe indirect owner/PID reads support bash -eu take/release for unnamed, tests and punctuated names; all three regressions failed before and passed after (tmp/724-remediate-red.log, tmp/724-remediate-green.log).
DONE — Validation: bkit:generate passed; fresh built CLI install --codex --tracker=none passed with byte-identical new template and no old template, and real bash -eu distinct-lock acquire/release passed (tmp/724-remediate-generate.log, tmp/724-remediate-consumer-install.log).
BLOCKED — Local tests: tests changed exited 1; the related lock suite passed 29/30 and the named lane passed 6147/6149. Remaining failures are the frozen caller-cwd assertion and existing workflow-shape comment-number check. Lint, formatting and both typechecks passed (tmp/724-remediate-changed.log).
