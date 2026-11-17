# Brief: group 8 — Challenge round 2 findings

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
- Group 6: Challenge round 2 findings — done
  - TASK 21: A consumer adds their own hook (`node scripts/my-check.js`) inside bkit's `PreToolUse` edit group, and this release's matcher change makes the upgrade merge silently delete it — done
  - TASK 22: On Cursor, a `Write` to `docs/a.md` records the file as warned through the unverified `additional_context` route, so a later `sed -i … docs/a.md` gets no per-file checklist even if the first reminder never reached the model — accepted by owner — done
  - TASK 23: An agent commits with the usual `git commit -m "$(cat <<'EOF' … don't … EOF)"` form and then runs `&& sed -i … docs/x.md` in the same command, and the shell check reports nothing at all — done
  - TASK 24: An agent copies or downloads a script and runs it in the same command (`cp template.py /tmp/run.py && python3 /tmp/run.py`, `curl -o /tmp/s.py URL && python3 /tmp/s.py`), and the script's `docs/x.md` write gets no advice and no uncertainty — done
  - TASK 25: An agent runs `npx tsx scripts/gen.ts`, `ruby fix.rb` or `perl fix.pl` that rewrites an agent-read file, and the shell check stays silent instead of warning that the script's targets cannot be determined — done
- Group 7: Group 6 verify findings — done
  - TASK 28: An agent makes a directory and copies a script into it in the same command (`mkdir -p /tmp/d && cp tpl.sh /tmp/d && bash /tmp/d/tpl.sh`), or copies a glob into a directory (`cp t*.py sub/ && python3 sub/tpl.py`), and the script's `docs/x.md` write gets no advice and no uncertainty — done
  - TASK 29: The four installed copies of the shell hook (`.claude/hooks/`, `.cursor/hooks/`, `.codex/hooks/`, `.agents/plugins/bkit/hooks/` `bkit-guardrails.cjs`) are one formatting change behind `.bkit/core/hooks/guardrails-shell.js`, so the mirror tests fail and the hooks suite is red — done
- Group 8: Challenge round 2 findings — this group
  - TASK 26: On Cursor, `curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ docs/x.md` asks the user about the fetch, and the edit of `docs/x.md` gets no shell notice and no per-file checklist — open
  - TASK 27: A dense script source (a planted or minified 64 KiB `.js` / `.py` file the agent runs, or a 250 KiB inline `node -e` / heredoc script) stalls every shell hook call for seconds, because the script analyzers are quadratic and never check the 200 ms deadline — open

## The work

<!-- bkit:task 26 start -->

- [ ] **TASK 26:** On Cursor, `curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ docs/x.md` asks the user about the fetch, and the edit of `docs/x.md` gets no shell notice and no per-file checklist
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.cursor/hooks/bkit-guardrails.cjs:84` · **Round:** 2
  - **DONE WHEN:** Cursor's `decideShell` `fetch` case composes `v.edits` the way the Claude, Codex and Antigravity bridges do. The `ask` keeps its `user_message`, and its `agent_message` carries the fetch line plus `shellEditContext(shellEditAdvisory(v.edits), v.edits, ctx, session, undefined, ADVICE_BUDGETS.cursor, <fetch line>)` when `v.edits` is present. Today `classifyShell` returns `{ tier: "fetch", edits }` ("an allowed fetch never hides an edit", `.bkit/core/hooks/guardrails-tiers.js:273`), but the Cursor `fetch` case returns only `Command requires confirmation: …` and drops the evidence. No Cursor test runs a fetch together with an edit.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `keeps edit advice beside an off-list fetch` fails on `advise("curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ src/fetch-edit.ts", dir)` returning `permission === "ask"` with text that does not contain `edits files through the shell`.

<!-- bkit:task 26 end -->

<!-- bkit:task 27 start -->

- [ ] **TASK 27:** A dense script source (a planted or minified 64 KiB `.js` / `.py` file the agent runs, or a 250 KiB inline `node -e` / heredoc script) stalls every shell hook call for seconds, because the script analyzers are quadratic and never check the 200 ms deadline
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:1634` · **Round:** 2
  - **DONE WHEN:** `analyzeJs` and `analyzePython` find a token's position in constant time (for example the tokenizer records each token's index, or `recognized` holds token objects), with no `tokens.indexOf(t)` inside the per-token loops at lines 1436, 1441 and 1634, and the analyzers stop at `evidenceExpired(st)` and report `analysis-limit` like the lexer does. Measured on the current code: a 64 KiB `a;` file run as `node scripts/min.js` takes 593 ms of CPU in the analyzer (3x the 200 ms deadline, 1.5 s wall under load), and the rendered Cursor hook takes 8.2 s of CPU (8.9 s wall) on `node -e '<250 KiB of a;>'` and 4.4 s on `python3 -c '<250 KiB of a.b\n>'`. The cost grows with the square of the source size. `evalItems` checks the deadline only between commands, so one analysis runs unbounded inside the 256 KiB command bound. The deny, ask and secret tiers in `classifyShell` return before the detector runs, so this is a hang on every host, not a bypass. The plan's Security & Privacy section and task 3 promise a cooperative 200 ms deadline.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` fails on `advise("node -e '" + "a;".repeat(125 * 1024) + "'", dir)` taking longer than 1,000 ms to return its advise() result (8.9 s measured), with `permission` `allow`.

<!-- bkit:task 27 end -->
