Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202611/787-show-authoring-rules-plan.md
Group: 6
Verify attempt: 5

build verify: attempt 5 of 5

## Progress

Problems after each round: 2 → 1 → 1 → 4 → 7
Code changed: yes
Strategy: FINAL → next FINAL (FINAL already used)
Minutes per round: 41
Trend: worse

**Q1 — Verify:** decide the items below instead of another round? More problems than the first round.
Options: A) Try again / B) Decide
Recommended: B) Decide — another round is unlikely to close the remaining items
Decision: Decide — owner answered "Yes, all recommended"

**Q2 — TASK 24 curl URL patterns [.bkit/core/hooks/guardrails-shell.js]:** When a script is downloaded with curl and then run in the same command, the shell check should warn that the script's writes are unknown. curl expands patterns like [1-2] and {a,b} in a URL (and #1 in the output name) into several files with different names, and the check records the pattern text instead, so it stays silent. Example: curl -O "https://x.example/bkp-[1-2].py" && python3 bkp-1.py. The fix reports 'cannot be determined' whenever a pattern is present and curl's -g switch is absent. Accept this gap, or fix it now?
Options: A) Accept / B) Fix now
Recommended: A) Accept — The shape is rare and the check is an advisory reminder, not a block; every verify round has found one more download spelling, so the list does not end.
Decision: Accept — owner answered "Yes, all recommended"

**Q3 — TASK 24 curl write-out to a file [.bkit/core/hooks/guardrails-shell.js]:** curl 8.3 and later can write text to a named file through -w '%output{file}'. The check does not read that option, so a script written this way and then run stays silent. Accept this gap, or fix it now (report 'cannot be determined' when a write-out value contains %output{)?
Options: A) Accept / B) Fix now
Recommended: A) Accept — Very rare spelling; same reasoning as the URL-pattern gap.
Decision: Accept — owner answered "Yes, all recommended"

**Q4 — TASK 24 wget -p and shortened long options [.bkit/core/hooks/guardrails-shell.js]:** Two wget spellings change where files land and are missed: -p / --page-requisites (saves under host/path like -r does), and shortened long options such as --output-doc= or --recur, which wget accepts when the prefix is unique. Accept this gap, or fix it now (read -p as a layout switch and match long names by unique prefix)?
Options: A) Accept / B) Fix now
Recommended: A) Accept — Both need someone to type an unusual wget form; the common forms are already covered.
Decision: Accept — owner answered "Yes, all recommended"

**Q5 — TASK 24 wget -e settings and config-file variables [.bkit/core/hooks/guardrails-shell.js]:** wget -e takes settings whose names ignore dashes, underscores and case (dir-prefix, outputdocument, content_disposition, recursive, mirror and others), and the check matches only three exact spellings. A WGETRC= or CURL_HOME= prefix that points at a config file is also unread, although curl -K already reports 'cannot be determined'. Accept this gap, or fix it now?
Options: A) Accept / B) Fix now
Recommended: A) Accept — Rare spellings; the config-file prefix case is the only one an agent could plausibly write, and it is a one-line extra check if you want it, but the shape list keeps growing.
Decision: Accept — owner answered "Yes, all recommended"

**Q6 — TASK 24 wget percent-encoded file names [.bkit/core/hooks/guardrails-shell.js]:** wget saves a download under the decoded name (bkp%20s.py becomes 'bkp s.py'), and the check records the encoded name. This comes from reading how wget builds names; wget is not installed here, so it was not run live. Accept this gap, or fix it now (report 'cannot be determined' when the URL segment contains %)?
Options: A) Accept / B) Fix now
Recommended: A) Accept — Needs an encoded character in a script name; rare.
Decision: Accept — owner answered "Yes, all recommended"

**Q7 — TASK 24 cp or mv into a directory made earlier in the same command [.bkit/core/hooks/guardrails-shell.js]:** Two shapes stay silent: (1) mkdir -p /tmp/d && cp tpl.sh /tmp/d && bash /tmp/d/tpl.sh, because the directory does not exist yet when the hook looks, so the copy is read as a file name; (2) cp t*.sh /tmp/ && bash /tmp/tpl.sh, where a glob source goes into a directory and no uncertainty is reported. This is the same family as Task 24's own cp/mv example. Accept this gap, or fix it now (track directories made earlier in the line; report 'cannot be determined' for a glob source into a directory)?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — mkdir followed by cp is a natural thing for an agent to write, and it is the exact cp/mv case the task is about.
Decision: Fix now — owner answered "Yes, all recommended"

**Q8 — TASK 24 installed hook copies one line behind the source [.bkit/core/hooks/guardrails-shell.js]:** The last fix round reformatted one line in the hook source but did not regenerate the four installed copies (.claude, .cursor, .codex, .agents/plugins). Behaviour is the same, but three mirror tests in guardrails-cursor.integration.test.ts fail, so the hooks test suite is red (3 failed, 1668 passed). The fix is to run pnpm bkit:generate and refresh .bkit/version. Fix it now?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — A red test suite has to be fixed and the repair is mechanical; the workflow also fixes failing suites without asking.
Decision: Fix now — owner answered "Yes, all recommended"

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
