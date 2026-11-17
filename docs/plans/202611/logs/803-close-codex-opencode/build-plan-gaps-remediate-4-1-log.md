Verdict: FAIL
Strategy: STANDARD
Fixed: 1

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: cloud.md:125 wording, all three clouds' dashboard lists named unverified operator assertions — edited and re-rendered with upgrade (.bkit/core/.bkit/cloud.md, .bkit/cloud.md, .bkit/version)
BLOCKED — Gap 2: Task 8 bats jq-absent test — Fixable: false; the test cannot make jq absent on a host with /usr/bin/jq and only a rewrite of the planned test fixes it; left for the owner's decision
DONE — Local tests: bkit tests changed failed on 2 load-sensitive timing tests (guardrails-cursor linear-time 1196ms vs 1000ms; tracker.integration 44s timeout); both passed on rerun with no code change, so they are flakes unrelated to the docs edit
