# Brief: group 4 — Challenge round 1 findings (tests)

Plan: Show authoring rules before every edit Implementation Plan

## Why and what

### Context & Goals

Extend the shared shell detector and GateGuard, the hook that presents investigation and authoring reminders, so exact shell-edit targets use the existing advice and warning identity. Keep uncertain script effects explicit. Ship the shared code, tool coverage and authoring pointers to consumers while preserving stronger shell protections and the accepted host-delivery limitations.

**Workstreams:** WS-1 through WS-5, the whole design. Their dependency order is WS-1 → WS-2 → WS-3 → WS-4 → WS-5. No prerequisite feature plan is required.

**Related Issues:**

- [#787 — Show authoring rules before every edit, including shell edits](https://github.com/cbartens/bkit/issues/787) (open).
- [#356 — GateGuard reuse/anti-duplicate advisory for new-file Writes](https://github.com/cbartens/bkit/issues/356) (closed).
- [#628 — Add empty-read, shared-checkout and host-shell rules to audit prompt](https://github.com/cbartens/bkit/issues/628) (closed).
- [#521 — OpenCode 2.0 upgrade: GateGuard plugin, subagent tool calls, and DeepSeek agents](https://github.com/cbartens/bkit/issues/521) (closed).
- [#518 — GateGuard: widen config-file matching to cover non-JS toolchains](https://github.com/cbartens/bkit/issues/518) (closed).
- [#441 — Enforce shell-as-edit rule; settle the curl/wget divergence](https://github.com/cbartens/bkit/issues/441) (closed).
- [#428 — Doc rule headers invisible to agents grepping doc files](https://github.com/cbartens/bkit/issues/428) (closed).
- [#764 — Map each of the five harms to the hook or deny rule that blocks it](https://github.com/cbartens/bkit/issues/764) (open).

### Narrative

When an agent edits an agent-read file, I want the authoring reminder to appear before the edit, including edits made through shell commands or scripts. I want one general advisory across edit methods and supported hosts, keeping this change focused on reliable detection.

### Success Criteria

1. The shell check detects the script and command edit forms listed in the issue before execution, reporting exact targets where established and uncertainty elsewhere.
2. Known targets receive the existing per-file checklist and the same general authoring advisory used by edit tools, sharing the once-per-file warning record.
3. Scripts that might write to unknown targets receive a warning that their targets cannot be determined and authoring reads still apply. Clearly read-only commands are excluded.
4. Every supported host's edit tools are covered where hooks allow it; unavoidable gaps are documented with primary sources and the observed delivery boundary.
5. Consumer installs receive the hook improvements and applicable rules/header pointers. File-type-specific advisories are recorded as future work.

### Out of Scope

These exclusions are design non-goals, not required acceptance work. Existing ledger rows are reused.

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| File-type-specific selection/quotation | The accepted general advisory meets the contract without selecting sections. | `787-file-type-specific-authoring-advisories`; separate owner-approved feature. |
| New shell blocking/confirmation | The accepted shell reminder is advisory; stronger existing safeguards are preserved. | `787-no-new-shell-blocking`; separate authorization policy. |
| New after-edit or diff checks | Detection before execution satisfies the planned mechanism; after-edit analysis is expressly excluded. | `787-no-after-edit-checks`; separate design. |
| Prompt/workflow header pointers | The design limits pointer changes to shared rules and template editor notes. | `787-no-prompt-workflow-header-pointers`; separate authoring policy. |
| Repo-only project rules | Consumer-shipped behavior meets this plan's goals. | `787-no-repo-only-rule-edits`; existing repository ownership. |

Live model receipt, same-pending-edit opportunity and measured visibility thresholds remain unverified technical claims under the accepted decisions, not silently deferred required tests. Adapter output and cold-start timing are verified locally. This plan authorizes no external probe or driver migration.

## Where it fits

- Group 1: Bounded evidence and shared advice — done
  - TASK 1: Replace description-only shell detection with structured lexical evidence — done
  - TASK 2: Recognize bounded patch and script effects — done
  - TASK 3: Bound inspection and preserve enforcement composition — done
  - TASK 4: Prepare one shared general reminder and normalized identity — done
  - TASK 5: Select complete blocks before truthful acknowledgement — done
- Group 2: Managed host integration — done
  - TASK 6: Integrate Claude shell advice and NotebookEdit payloads — done
  - TASK 7: Integrate Cursor Delete and shell advice inside managed ownership — done
  - TASK 8: Integrate Codex initial shell commands and complete patch batches — done
  - TASK 9: Integrate Antigravity multi-replace and preserve OpenCode boundaries — done
- Group 3: Consumer pointers and integrated evidence — done
  - TASK 10: Ship accurate authoring pointers and coverage guidance — done
  - TASK 11: Prove fresh-install and upgrade footprints with preserved drivers — done
  - TASK 12: Prove rendered parity, bounds and fresh-consumer dogfood — done
  - TASK 13: Keep consumer-added list entries when a managed JSON file reconverges — done
- Group 4: Challenge round 1 findings — this group
  - TASK 14: An agent writes a temp script with a heredoc and runs it in the same command (`cat > /tmp/w.py <<'PY' … PY` then `python3 /tmp/w.py`), and the script's `docs/testing.md` write gets no advice at all — open
  - TASK 15: `bash fix.sh`, `./fix.sh` or `bash <<'SH' … SH` runs `sed -i` on an agent-read file, and the shell check reports nothing, not even uncertainty — open
  - TASK 16: Wrapper options and `find -exec` hide an in-place edit: `xargs -I{} sed -i …`, `sudo -u me sed -i … docs/testing.md`, `timeout 5 sed -i …` and `find docs -name '*.md' -exec sed -i … {} +` all report nothing — open
  - TASK 17: `echo x &> docs/testing.md` and `echo x 1> docs/testing.md` overwrite the file, but the lexer files both under ignored fd redirects — open
  - TASK 18: bkit retires a list entry it once shipped (a broad `permissions.allow` rule, an `opencode.json` `plugin` path, a hook group for a removed hook file), and every upgraded consumer keeps it forever, because `mergeManagedJson` cannot tell a retired bkit entry from a consumer addition — accepted by owner — done
- Group 5: Challenge round 1 findings — next
  - TASK 19: An untrusted script or patch file the agent runs or applies plants forged `[bkit GateGuard]` instructions in the hook's trusted context — open
  - TASK 20: A patch file with a long whitespace `rename from` line stalls every shell hook call that names it for about 10 seconds (ReDoS) — open

## The work

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** An agent writes a temp script with a heredoc and runs it in the same command (`cat > /tmp/w.py <<'PY' … PY` then `python3 /tmp/w.py`), and the script's `docs/testing.md` write gets no advice at all
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:821` · **Round:** 1
  - **DONE WHEN:** `readBoundedSource` no longer treats every `ENOENT` after an earlier command (`st.commands > 0`) as harmless build output. A named script that an earlier command of the same line wrote (a redirect, `tee` or heredoc target, including quiet `/tmp` paths) is either analysed from the literal body that produced it or reports `unknown-script-effect`; a missing file no earlier command named stays covered by the existing `pnpm build && node dist/x.js` quiet case. Probe today: `{"targets":[],"uncertain":[],"limit":null}` for the heredoc-to-`/tmp` form, and only the script itself (`gen.py`) for `printf … > gen.py && python3 gen.py`, with no uncertainty for its effects.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `flags a script the same command writes before running it` fails on `advise("cat > /tmp/bkit-w.py <<'PY'\nopen('src/tmp-script.py','w').write('x')\nPY\npython3 /tmp/bkit-w.py", dir).text` being `""` (neither `src/tmp-script.py` nor `cannot be determined`), and on `printf x > gen.py && python3 gen.py` naming `gen.py` without matching `UNCERTAIN`.

<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** `bash fix.sh`, `./fix.sh` or `bash <<'SH' … SH` runs `sed -i` on an agent-read file, and the shell check reports nothing, not even uncertainty
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:742` · **Round:** 1
  - **DONE WHEN:** The `bash`/`sh`/`zsh`/`dash`/`ksh` case handles more than `-c`: a literal heredoc, here-string or stdin file is lexed like a `-c` script (depth-limited), and a directly named shell script (`bash fix.sh`, `sh ./x.sh`) and a `./x.sh` / `*.sh` program in the default branch are read through `readBoundedSource` and lexed, or report `unknown-script-effect`. A piped shell (`cat x | bash`) reports `unknown-stdin`. Probe today: all three forms return empty evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `marks shell scripts run by name or on stdin` fails on `bash fix.sh`, `./fix.sh` (fixture `sed -i s/a/b/ src/sh-named.ts`) and `bash <<'SH'\nsed -i s/a/b/ src/sh-heredoc.ts\nSH` each returning `text === ""` instead of naming the target or matching `UNCERTAIN`.

<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->

- [ ] **TASK 16:** Wrapper options and `find -exec` hide an in-place edit: `xargs -I{} sed -i …`, `sudo -u me sed -i … docs/testing.md`, `timeout 5 sed -i …` and `find docs -name '*.md' -exec sed -i … {} +` all report nothing
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:527` · **Round:** 1
  - **DONE WHEN:** `stripCommandPrefix` skips the options (and option arguments) of the wrappers it already strips (`xargs -I/-0/-n/-P`, `sudo -u/-g`, `nice -n`, `env -u`), treats `timeout DURATION` and `find … -exec/-execdir/-ok … ;|+` as wrappers of the command they run, and the wrapped in-place editor yields its literal target or `unresolved-target` / `unknown-stdin`. Probe today: all four forms return `{"targets":[],"uncertain":[],"limit":null}`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `follows wrapper options and find -exec to the edit they run` fails on `sudo -u me sed -i s/a/b/ src/sudo-u.ts` and `timeout 5 sed -i s/a/b/ src/timeout.ts` not naming their targets, and on `xargs -I{} sed -i s/a/b/ {} < list.txt` and `find src -name '*.ts' -exec sed -i s/a/b/ {} +` returning `""` instead of matching `UNCERTAIN`.

<!-- bkit:task 16 end -->

<!-- bkit:task 17 start -->

- [ ] **TASK 17:** `echo x &> docs/testing.md` and `echo x 1> docs/testing.md` overwrite the file, but the lexer files both under ignored fd redirects
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:440` · **Round:** 1
  - **DONE WHEN:** `&>file`, `&>>file`, `>&file` with a non-numeric word, and `1>` / `1>>` redirect into a file are recorded as redirect targets (filtered by the existing source-extension / agent-read rules); `2>file`, `>&2` and `2>&1` stay ignored. Probe today: both forms return empty evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `treats stdout-carrying fd redirects as edits` fails on `echo x &> src/amp.ts`, `echo x &>> src/amp-append.ts` and `echo x 1> src/fd1.ts` not naming their targets, while `echo x 2> src/err.ts` must stay silent.

<!-- bkit:task 17 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `retains lexical context for nested shell edits`: quotes, escapes, wrappers, substitutions and heredocs | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 1 |
| `recognizes direct edit command families`: redirects, tee, in-place sed/perl/awk/ruby, cp and mv | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 1 |
| `normalizes literal working directories without guessing`: absolute/relative identity, cd and unresolved directories | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 1 |
| `extracts all literal patch effects`: git apply/patch, strip/directory options, add/delete/move and unknown stdin | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 2 |
| `classifies inline and named script effects`: Python/Node literals and directly named scripts | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 2 |
| `requires a positive whole-program reader grammar`: reads/stdout versus imports, dynamic calls and control flow | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 2 |
| `retains exact targets beside uncertain script effects`: safe reasons without command/source/env disclosure | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 2 |
| `bounds direct source inspection without executing it`: descriptors, races and unavailable/special/symlink sources | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 3 |
| `stops analysis at each internal bound`: bytes, depth, target count and cooperative deadline | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 3 |
| flags a script the same command writes before running it | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 14 |
| marks shell scripts run by name or on stdin | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 15 |
| follows wrapper options and find -exec to the edit they run | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 16 |
| treats stdout-carrying fd redirects as edits | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 17 |
| never echoes inspected source text as hook instructions | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 19 |
| parses hostile patch lines in linear time | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 20 |
