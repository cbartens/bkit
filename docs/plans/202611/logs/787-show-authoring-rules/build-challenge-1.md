Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

Verdict basis: partial diff coverage. The supplied diff showed the 20 largest of 383 files, at most 500 lines each. The changed sources in this lens were read directly with `git diff 38102970a...HEAD -- <file>` or from the worktree: `.bkit/core/hooks/guardrails-shell.js`, `gateguard-engine.js`, `gateguard-edit-payload.js`, `antigravity-hook.js` and `guardrails-tiers.js`; the Claude, Cursor, Codex, Antigravity and OpenCode bridges; and `.bkit/core/engine/install/write.ts`. Detector, engine and merge findings were confirmed with scratch probes. Each probe loaded the shared hook parts, or the built `dist/install/write.js`, against temporary directories; nothing was written to the repo. Plan tasks 14 to 20 were already in the plan, so they are not repeated here. Rendered mirrors and prompt or template text were not challenged, because they are outside this lens.

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A consumer adds their own hook (`node scripts/my-check.js`) inside bkit's `PreToolUse` edit group, and this release's matcher change makes the upgrade merge silently delete it
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/write.ts:243`
  - **DONE WHEN:** `mergeManagedList` no longer drops a whole consumer group because one of its hooks shares a bkit `command` or `bkit-*.cjs` file with a template group. The template group still replaces bkit's own hook entries and matcher, and every hook entry in that consumer group whose command is not a template command or bkit hook file is carried into the matching template group's `hooks` list (order kept, no duplicates, second run a no-op). Probe on the current `dist/install/write.js`: `mergeManagedJson({hooks:{PreToolUse:[{matcher:"Edit|Write|MultiEdit",hooks:[{type:"command",command:"node .claude/hooks/bkit-gateguard.cjs"},{type:"command",command:"node scripts/my-check.js"}]}]}}, <same group with matcher "Edit|Write|MultiEdit|NotebookEdit" and only the bkit hook>)` returns the template group alone; `my-check.js` is gone. The shipped Claude matcher change in this release (`NotebookEdit`) makes every consumer's `settings.json` drift, so this merge runs on every upgrade. The existing upgrade case at `.bkit/core/engine/install/modules/core.integration.test.ts:2568` only adds separate consumer groups, so it passes today.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `keeps a consumer hook placed inside a bkit hook group` fails on `mergeManagedJson` returning the template group without the consumer's `node scripts/my-check.js` hook entry.
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades a shipped Claude edit group without dropping a consumer hook inside it` fails on the upgraded `.claude/settings.json` (from the shipped `da97be38` layout plus a consumer hook appended to the gateguard group's `hooks`) no longer holding that consumer hook.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** On Cursor, a `Write` to `docs/a.md` records the file as warned through the unverified `additional_context` route, so a later `sed -i … docs/a.md` gets no per-file checklist even if the first reminder never reached the model
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/hooks/gateguard-edit-payload.js:20`
  - **DONE WHEN:** No agent can settle this alone. The shared edit payload still calls `firstTouchAdvice`, which records the touch at once, and the Cursor driver's `additional_context` envelope is documented as unverified (`.bkit/core/.bkit/providers.md:413` and `:420`, decision `787-design-choice-16`). Because both channels now share one normalized identity, that unverified acknowledgement also suppresses the Cursor shell route's `agent_message` block. This contradicts the plan's Process Sketch ("an unverified route leaves it unacknowledged") and its Edge Case row ("share sequential acknowledgement on verified routes"). Probe: `firstTouchAdvice(<ws>/docs/a.md, sid, true)` then `shellTargetBlocks(["docs/a.md"], {root: ws}, sid)` returns 0 blocks. The fix cannot be surgical, because the Cursor and Claude managed blocks must stay byte-identical (`gateguard-cursor.integration.test.ts:176`) and the outer driver, which knows the host, is consumer-owned. The owner decides between: a host signal the shared block can read without breaking that parity, letting the Cursor edit route prepare without acknowledging (Cursor edits then repeat their reminder), or accepting the suppression and recording it in `.bkit/core/.bkit/providers.md` § host table.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `keeps a shell target eligible after an unverified Cursor edit reminder` fails on `runShell("sed -i s/a/b/ docs/a.md", session)` after `run(writePayload("docs/a.md", session))` returning an `agent_message` without `First edit to`.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** An agent commits with the usual `git commit -m "$(cat <<'EOF' … don't … EOF)"` form and then runs `&& sed -i … docs/x.md` in the same command, and the shell check reports nothing at all
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:265`
  - **DONE WHEN:** `matchParen` skips heredoc bodies the way the lexer does, so an apostrophe inside a heredoc body within `$( … )` no longer opens a quote that runs to the end of the text. Or, when no matching `)` is found, the remainder is reported as `unknown-script-effect` instead of being swallowed. Probe today: `git commit -m "$(cat <<'EOF'\nFix: don't break\nEOF\n)" && sed -i s/a/b/ docs/x.md` returns `{"targets":[],"uncertain":[],"limit":null}`, while the same command with `do not` returns `["docs/x.md"]`. The unclosed quote makes `matchParen` return `text.length`. The rest of the line is then lexed as the substitution body, where `)"` opens a double quote that never closes and absorbs `sed`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `keeps commands after a heredoc substitution that holds an apostrophe` fails on `advise("git commit -m \"$(cat <<'EOF'\nFix: don't break\nEOF\n)\" && sed -i s/a/b/ src/after-commit.ts", dir).text` not naming `src/after-commit.ts` and not matching `UNCERTAIN`.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** An agent copies or downloads a script and runs it in the same command (`cp template.py /tmp/run.py && python3 /tmp/run.py`, `curl -o /tmp/s.py URL && python3 /tmp/s.py`), and the script's `docs/x.md` write gets no advice and no uncertainty
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:924`
  - **DONE WHEN:** A script file that an earlier command of the same line creates through `cp` / `mv` destinations, `curl -o` / `--output`, `wget -O` or another non-redirect writer is recorded in `st.produced`. A `cp` / `mv` from a readable literal source carries that source's body, and anything else carries `null`, which gives `unknown-script-effect`. The `ENOENT && st.commands > 0` quiet branch then covers only files no earlier command named. Probe today: `cp template.py /tmp/run.py && python3 /tmp/run.py` (where `template.py` writes `docs/x.md`) and `curl -o /tmp/s.py https://x.example/s.py && python3 /tmp/s.py` both return empty evidence. `cp template.py run.py && python3 run.py` names only `run.py`, with no uncertainty for what the script writes. Plan task 14 covers redirect, `tee` and heredoc producers only.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `flags a script an earlier copy or move produced` fails on `cp tpl.py /tmp/bkit-run.py && python3 /tmp/bkit-run.py` and `mv tpl.py /tmp/bkit-mv.py && python3 /tmp/bkit-mv.py` (fixture `tpl.py` holds `open('src/copied.py','w').write('x')`) returning text that neither names `src/copied.py` nor matches `UNCERTAIN` (the `cp` form returns `""`; the `mv` form names only `tpl.py`). The download form is left out of this Cursor-driven test because Cursor's `fetch` tier drops edit evidence (task 6).

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** An agent runs `npx tsx scripts/gen.ts`, `ruby fix.rb` or `perl fix.pl` that rewrites an agent-read file, and the shell check stays silent instead of warning that the script's targets cannot be determined
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:846`
  - **DONE WHEN:** A directly named script file run by an interpreter the detector does not analyse reports `unknown-script-effect`, as decision `787-design-choice-02` requires ("warn for possible writes with unknown targets"). This covers `ruby` / `perl` with a script operand and no `-e` / `-i`, `tsx` / `ts-node` / `bun` / `deno run`, the same runners behind `npx` / `pnpm` / `pnpm exec` / `yarn`, and `./x.ts`-style programs in the default branch. Probe today: `ruby fix.rb`, `perl fix.pl` and `npx tsx scripts/gen.ts` each return `{"targets":[],"uncertain":[],"limit":null}`. Only `python*` / `node*` and `./*.sh|py|js|mjs|cjs` reach `evalInterpreter` or the shell lexer.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `marks scripts run by unanalysed interpreters as uncertain` fails on `ruby fix.rb`, `perl fix.pl` and `npx tsx gen.ts` each returning `text === ""` instead of matching `UNCERTAIN`.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** On Cursor, `curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ docs/x.md` asks the user about the fetch, and the edit of `docs/x.md` gets no shell notice and no per-file checklist
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.cursor/hooks/bkit-guardrails.cjs:84`
  - **DONE WHEN:** Cursor's `decideShell` `fetch` case composes `v.edits` the way the Claude, Codex and Antigravity bridges do. The `ask` keeps its `user_message`, and its `agent_message` carries the fetch line plus `shellEditContext(shellEditAdvisory(v.edits), v.edits, ctx, session, undefined, ADVICE_BUDGETS.cursor, <fetch line>)` when `v.edits` is present. Today `classifyShell` returns `{ tier: "fetch", edits }` ("an allowed fetch never hides an edit", `.bkit/core/hooks/guardrails-tiers.js:273`), but the Cursor `fetch` case returns only `Command requires confirmation: …` and drops the evidence. No Cursor test runs a fetch together with an edit.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `keeps edit advice beside an off-list fetch` fails on `advise("curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ src/fetch-edit.ts", dir)` returning `permission === "ask"` with text that does not contain `edits files through the shell`.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Every file under a source folder named `docs` (`app/docs/page.tsx`, `src/docs/api.ts`) gets the agent-read authoring reminder, and a checkout that sits under a `docs/plans/` folder never gets it
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/gateguard-engine.js:115`
  - **DONE WHEN:** `isAgentReadPath` matches `docs/`, `.agents/` and `.bkit/` as the first segment of the path relative to the call's project directory (the `cwd` / evidence root that `prepareAdvice` already receives), not as any `/docs/` segment of the absolute key that `normalizeIdentity` now returns. The `docs/plans/` exclusion is anchored the same way, and the root files `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` keep their basename rule. Probe today: `isAgentReadPath("/home/u/web/app/docs/page.tsx")` and `isAgentReadPath("/r/src/docs/api.ts")` both return `true`. Before this change the reminder did not exist, and `isDocsPath` was limited to `.md`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `limits the agent-read reminder to root-level agent-read folders` fails on the OpenCode `edit` advisory for `app/docs/page.tsx` in a fresh session containing `Which Sections Apply`.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** On Codex and Antigravity, an off-list `curl` with a long URL plus a redirect into a source file produces a composed response of 3,695 bytes against the 2,000-byte budget, so the edit notice and the omitted-target notice sit past the budget the design calls safe
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs:83`
  - **DONE WHEN:** The fetch line that Codex (`fetchNote`) and Antigravity (`fetchLine`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs:126`) put before the shell edit context echoes the command only up to a fixed cap, with a marker such as `…`. The full composed response for a fetch plus edit then stays within `ADVICE_BUDGETS.codex` / `.antigravity`. Today `selectAdvice` correctly selects zero blocks and acknowledges nothing, but `fixedCost` alone exceeds the limit. Probe: a 3,000-character `curl` URL with `> docs/b.md` gives a Codex response of 3,695 bytes. The plan's task 5 and task 12 DONE WHEN require "a complete response exceeding its budget" to fail.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `keeps composed fetch and edit advice inside the Codex budget` fails on the rendered Codex guardrails response for `curl https://off-list.example/?<3,000 x "a"> > src/b.ts` carrying more than 2,000 UTF-8 bytes of context.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** `git -C sub apply ../x.patch` (or `git -c core.x=y apply x.patch`) rewrites the patch's files, and the shell check reports nothing
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:841`
  - **DONE WHEN:** The `git` case skips git's global options (`-C <dir>`, `-c <k=v>`, `--git-dir=…`, `--work-tree=…`, `--no-pager`) before testing for `apply`. A literal `-C` directory becomes the base directory for the source file and the patch paths, through `resolveCwd`, and a dynamic one gives `unresolved-directory`. Probe today: `git -C docs apply ../x.patch` returns `{"targets":[],"uncertain":[],"limit":null}`, because only `args[0] === "apply"` is checked.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `follows git global options to apply` fails on `git -C sub apply ../c.patch` (fixture `c.patch` with `--- a/src/gc.ts` / `+++ b/src/gc.ts`, directory `sub/` present) returning `text === ""` instead of naming `sub/src/gc.ts`.

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** A 256 KiB command bound measured in bytes is cut in UTF-16 characters, so a long non-ASCII command keeps and analyses up to three times the stated limit, and a target past the byte limit is still reported
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:1682`
  - **DONE WHEN:** `shellEditTargets` cuts the text at 256 KiB of UTF-8 bytes (for example `Buffer.from(text, "utf8").subarray(0, limit).toString("utf8")`, which drops a split trailing character) rather than `text.slice(0, 262144)`. A target that starts after the byte limit is no longer analysed, and `limit` stays `command-size`. Today `Buffer.byteLength(text) > 256 KiB` is tested, then `text.slice(0, EVIDENCE_LIMITS.commandBytes)` keeps 262,144 UTF-16 units, so a command of 140,000 `é` (280,000 bytes) is kept whole.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `cuts the command bound in bytes` fails on `advise("echo " + "é".repeat(140_000) + " > src/late.ts", dir).text` naming `src/late.ts`, which begins past 256 KiB of UTF-8.

<!-- bkit:task 10 end -->
