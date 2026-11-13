# Brief: group 6 — Challenge round 2 findings (tests)

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
- Group 4: Challenge round 1 findings — done
  - TASK 14: An agent writes a temp script with a heredoc and runs it in the same command (`cat > /tmp/w.py <<'PY' … PY` then `python3 /tmp/w.py`), and the script's `docs/testing.md` write gets no advice at all — done
  - TASK 15: `bash fix.sh`, `./fix.sh` or `bash <<'SH' … SH` runs `sed -i` on an agent-read file, and the shell check reports nothing, not even uncertainty — done
  - TASK 16: Wrapper options and `find -exec` hide an in-place edit: `xargs -I{} sed -i …`, `sudo -u me sed -i … docs/testing.md`, `timeout 5 sed -i …` and `find docs -name '*.md' -exec sed -i … {} +` all report nothing — done
  - TASK 17: `echo x &> docs/testing.md` and `echo x 1> docs/testing.md` overwrite the file, but the lexer files both under ignored fd redirects — done
  - TASK 18: bkit retires a list entry it once shipped (a broad `permissions.allow` rule, an `opencode.json` `plugin` path, a hook group for a removed hook file), and every upgraded consumer keeps it forever, because `mergeManagedJson` cannot tell a retired bkit entry from a consumer addition — accepted by owner — done
- Group 5: Challenge round 1 findings — done
  - TASK 19: An untrusted script or patch file the agent runs or applies plants forged `[bkit GateGuard]` instructions in the hook's trusted context — done
  - TASK 20: A patch file with a long whitespace `rename from` line stalls every shell hook call that names it for about 10 seconds (ReDoS) — done
- Group 6: Challenge round 2 findings — this group
  - TASK 21: A consumer adds their own hook (`node scripts/my-check.js`) inside bkit's `PreToolUse` edit group, and this release's matcher change makes the upgrade merge silently delete it — open
  - TASK 22: On Cursor, a `Write` to `docs/a.md` records the file as warned through the unverified `additional_context` route, so a later `sed -i … docs/a.md` gets no per-file checklist even if the first reminder never reached the model — accepted by owner — done
  - TASK 23: An agent commits with the usual `git commit -m "$(cat <<'EOF' … don't … EOF)"` form and then runs `&& sed -i … docs/x.md` in the same command, and the shell check reports nothing at all — open
  - TASK 24: An agent copies or downloads a script and runs it in the same command (`cp template.py /tmp/run.py && python3 /tmp/run.py`, `curl -o /tmp/s.py URL && python3 /tmp/s.py`), and the script's `docs/x.md` write gets no advice and no uncertainty — open
  - TASK 25: An agent runs `npx tsx scripts/gen.ts`, `ruby fix.rb` or `perl fix.pl` that rewrites an agent-read file, and the shell check stays silent instead of warning that the script's targets cannot be determined — open
- Group 7: Challenge round 2 findings — next
  - TASK 26: On Cursor, `curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ docs/x.md` asks the user about the fetch, and the edit of `docs/x.md` gets no shell notice and no per-file checklist — open
  - TASK 27: A dense script source (a planted or minified 64 KiB `.js` / `.py` file the agent runs, or a 250 KiB inline `node -e` / heredoc script) stalls every shell hook call for seconds, because the script analyzers are quadratic and never check the 200 ms deadline — open

## The work

<!-- bkit:task 21 start -->

- [ ] **TASK 21:** A consumer adds their own hook (`node scripts/my-check.js`) inside bkit's `PreToolUse` edit group, and this release's matcher change makes the upgrade merge silently delete it
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/write.ts:243` · **Round:** 2
  - **DONE WHEN:** `mergeManagedList` no longer drops a whole consumer group because one of its hooks shares a bkit `command` or `bkit-*.cjs` file with a template group. The template group still replaces bkit's own hook entries and matcher, and every hook entry in that consumer group whose command is not a template command or bkit hook file is carried into the matching template group's `hooks` list (order kept, no duplicates, second run a no-op). Probe on the current `dist/install/write.js`: `mergeManagedJson({hooks:{PreToolUse:[{matcher:"Edit|Write|MultiEdit",hooks:[{type:"command",command:"node .claude/hooks/bkit-gateguard.cjs"},{type:"command",command:"node scripts/my-check.js"}]}]}}, <same group with matcher "Edit|Write|MultiEdit|NotebookEdit" and only the bkit hook>)` returns the template group alone; `my-check.js` is gone. The shipped Claude matcher change in this release (`NotebookEdit`) makes every consumer's `settings.json` drift, so this merge runs on every upgrade. The existing upgrade case at `.bkit/core/engine/install/modules/core.integration.test.ts:2568` only adds separate consumer groups, so it passes today.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `keeps a consumer hook placed inside a bkit hook group` fails on `mergeManagedJson` returning the template group without the consumer's `node scripts/my-check.js` hook entry.
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades a shipped Claude edit group without dropping a consumer hook inside it` fails on the upgraded `.claude/settings.json` (from the shipped `da97be38` layout plus a consumer hook appended to the gateguard group's `hooks`) no longer holding that consumer hook.

<!-- bkit:task 21 end -->

<!-- bkit:task 23 start -->

- [ ] **TASK 23:** An agent commits with the usual `git commit -m "$(cat <<'EOF' … don't … EOF)"` form and then runs `&& sed -i … docs/x.md` in the same command, and the shell check reports nothing at all
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:265` · **Round:** 2
  - **DONE WHEN:** `matchParen` skips heredoc bodies the way the lexer does, so an apostrophe inside a heredoc body within `$( … )` no longer opens a quote that runs to the end of the text. Or, when no matching `)` is found, the remainder is reported as `unknown-script-effect` instead of being swallowed. Probe today: `git commit -m "$(cat <<'EOF'\nFix: don't break\nEOF\n)" && sed -i s/a/b/ docs/x.md` returns `{"targets":[],"uncertain":[],"limit":null}`, while the same command with `do not` returns `["docs/x.md"]`. The unclosed quote makes `matchParen` return `text.length`. The rest of the line is then lexed as the substitution body, where `)"` opens a double quote that never closes and absorbs `sed`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `keeps commands after a heredoc substitution that holds an apostrophe` fails on `advise("git commit -m \"$(cat <<'EOF'\nFix: don't break\nEOF\n)\" && sed -i s/a/b/ src/after-commit.ts", dir).text` not naming `src/after-commit.ts` and not matching `UNCERTAIN`.

<!-- bkit:task 23 end -->

<!-- bkit:task 24 start -->

- [ ] **TASK 24:** An agent copies or downloads a script and runs it in the same command (`cp template.py /tmp/run.py && python3 /tmp/run.py`, `curl -o /tmp/s.py URL && python3 /tmp/s.py`), and the script's `docs/x.md` write gets no advice and no uncertainty
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:924` · **Round:** 2
  - **DONE WHEN:** A script file that an earlier command of the same line creates through `cp` / `mv` destinations, `curl -o` / `--output`, `wget -O` or another non-redirect writer is recorded in `st.produced`. A `cp` / `mv` from a readable literal source carries that source's body, and anything else carries `null`, which gives `unknown-script-effect`. The `ENOENT && st.commands > 0` quiet branch then covers only files no earlier command named. Probe today: `cp template.py /tmp/run.py && python3 /tmp/run.py` (where `template.py` writes `docs/x.md`) and `curl -o /tmp/s.py https://x.example/s.py && python3 /tmp/s.py` both return empty evidence. `cp template.py run.py && python3 run.py` names only `run.py`, with no uncertainty for what the script writes. Plan task 14 covers redirect, `tee` and heredoc producers only.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `flags a script an earlier copy or move produced` fails on `cp tpl.py /tmp/bkit-run.py && python3 /tmp/bkit-run.py` and `mv tpl.py /tmp/bkit-mv.py && python3 /tmp/bkit-mv.py` (fixture `tpl.py` holds `open('src/copied.py','w').write('x')`) returning text that neither names `src/copied.py` nor matches `UNCERTAIN` (the `cp` form returns `""`; the `mv` form names only `tpl.py`). The download form is left out of this Cursor-driven test because Cursor's `fetch` tier drops edit evidence (task 6).

<!-- bkit:task 24 end -->

<!-- bkit:task 25 start -->

- [ ] **TASK 25:** An agent runs `npx tsx scripts/gen.ts`, `ruby fix.rb` or `perl fix.pl` that rewrites an agent-read file, and the shell check stays silent instead of warning that the script's targets cannot be determined
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:846` · **Round:** 2
  - **DONE WHEN:** A directly named script file run by an interpreter the detector does not analyse reports `unknown-script-effect`, as decision `787-design-choice-02` requires ("warn for possible writes with unknown targets"). This covers `ruby` / `perl` with a script operand and no `-e` / `-i`, `tsx` / `ts-node` / `bun` / `deno run`, the same runners behind `npx` / `pnpm` / `pnpm exec` / `yarn`, and `./x.ts`-style programs in the default branch. Probe today: `ruby fix.rb`, `perl fix.pl` and `npx tsx scripts/gen.ts` each return `{"targets":[],"uncertain":[],"limit":null}`. Only `python*` / `node*` and `./*.sh|py|js|mjs|cjs` reach `evalInterpreter` or the shell lexer.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `marks scripts run by unanalysed interpreters as uncertain` fails on `ruby fix.rb`, `perl fix.pl` and `npx tsx gen.ts` each returning `text === ""` instead of matching `UNCERTAIN`.

<!-- bkit:task 25 end -->

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
| `installs and upgrades shared hook behavior without replacing owned drivers`: fresh/default/customized footprint | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 11 |
| `merges managed lists while keeping consumer-added entries`: plain-value lists, hook-group lists, duplicates and order | Unit | `.bkit/core/engine/install/write.test.ts` | 13 |
| `upgrades shipped registrations without dropping consumer hook groups or permissions`: Claude, Cursor and Antigravity from the shipped layout | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 13 |
| flags a script the same command writes before running it | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 14 |
| marks shell scripts run by name or on stdin | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 15 |
| follows wrapper options and find -exec to the edit they run | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 16 |
| treats stdout-carrying fd redirects as edits | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 17 |
| drops an entry the previous template shipped and the current one retired | Unit | `.bkit/core/engine/install/write.test.ts` | 18 |
| never echoes inspected source text as hook instructions | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 19 |
| parses hostile patch lines in linear time | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 20 |
| keeps a consumer hook placed inside a bkit hook group | Unit | `.bkit/core/engine/install/write.test.ts` | 21 |
| upgrades a shipped Claude edit group without dropping a consumer hook inside it | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 21 |
| keeps commands after a heredoc substitution that holds an apostrophe | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 23 |
| flags a script an earlier copy or move produced | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 24 |
| marks scripts run by unanalysed interpreters as uncertain | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 25 |
| keeps edit advice beside an off-list fetch | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 26 |
| analyses dense script sources in linear time | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 27 |
