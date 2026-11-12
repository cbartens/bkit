Verdict: CONCERNS
Strategy: FINAL
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: scheme-less / uppercase / ftp:// URLs and query strings — remote-name downloads now record a name only for a plain lowercase http(s) URL with no query or fragment; everything else (also dynamic URLs, directory URLs) reports unresolved-target (.bkit/core/hooks/guardrails-shell.js evalCommand curl/wget)
DONE — Gap 2: curl -J/-OJ/--remote-header-name, wget --content-disposition/--trust-server-names — readFetchOptions sets serverName, download reports unresolved-target (.bkit/core/hooks/guardrails-shell.js)
DONE — Gap 3: wget -x/--force-directories/-r/--recursive/-m/--mirror (with or without -nH) — readFetchOptions sets layout, reports unresolved-target; also bundled (-mnH). Side effect: wget -r -nd now unresolved too (.bkit/core/hooks/guardrails-shell.js)
DONE — Gap 4: curl -O mixed with -o or --remote-name-all with -o — reports unresolved-target (.bkit/core/hooks/guardrails-shell.js)
DONE — Probe: 50 mixed commands run in-process against shellEditTargets (scratchpad probe.cjs): 31 loud (all four gap shapes plus dynamic URL, directory URL, file://, -P with ftp) all PASS flagged; 15 quiet (curl|jq, -o -, -o /dev/null, wget -qO- |jq, --spider, -I, -sI -O, --version, plain api reads, ls, git status) PASS quiet except 'wget -O - URL | sh' (unknown-stdin from the pre-existing pipe-to-sh rule, not a download effect) and 'curl -O - URL' (probe error: -O writes the URL name, so unresolved is correct); 4 exact (curl -O URL, wget URL, curl -o out.json URL, wget -r -nd URL) PASS except wget -r -nd now unresolved by design. Net: 47 pass, 3 explained non-defects
DONE — pnpm bkit:generate: exit 0; four bkit-guardrails.cjs copies refreshed
DONE — guardrails-cursor.integration.test.ts: 72 passed
DONE — Local tests: guardrails-cursor.integration.test.ts 72 passed after the change. The wider 'bkit tests changed' run exited 81 four times: the machine-wide tests lock was held by .worktrees/922-pre-push-load (pid 62913, since 10:15:28, still held at 10:55). Not run: the other 10 hooks tests and the install tests; rerun when the lock frees
