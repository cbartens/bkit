Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

Verdict basis: partial diff coverage. The supplied diff showed the 20 largest of 381 files, 500 lines each. The real sources were read directly through `git diff 38102970a...HEAD -- <file>` or in full: `.bkit/core/hooks/guardrails-shell.js`, `gateguard-engine.js`, `gateguard-edit-payload.js`, `antigravity-hook.js`, `guardrails-tiers.js`, the Claude / Cursor / Codex / Antigravity shell and edit bridges, the OpenCode plugin, the three shared registration files and `.bkit/core/engine/install/write.ts` (`mergeManagedJson`). Detector findings were confirmed by running `shellEditTargets` from the source file in an isolated scratch probe against a temporary workspace (no repo writes). Rendered mirrors and prompt / template text were not challenged (outside this lens).

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** An agent writes a temp script with a heredoc and runs it in the same command (`cat > /tmp/w.py <<'PY' … PY` then `python3 /tmp/w.py`), and the script's `docs/testing.md` write gets no advice at all
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:821`
  - **DONE WHEN:** `readBoundedSource` no longer treats every `ENOENT` after an earlier command (`st.commands > 0`) as harmless build output. A named script that an earlier command of the same line wrote (a redirect, `tee` or heredoc target, including quiet `/tmp` paths) is either analysed from the literal body that produced it or reports `unknown-script-effect`; a missing file no earlier command named stays covered by the existing `pnpm build && node dist/x.js` quiet case. Probe today: `{"targets":[],"uncertain":[],"limit":null}` for the heredoc-to-`/tmp` form, and only the script itself (`gen.py`) for `printf … > gen.py && python3 gen.py`, with no uncertainty for its effects.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `flags a script the same command writes before running it` fails on `advise("cat > /tmp/bkit-w.py <<'PY'\nopen('src/tmp-script.py','w').write('x')\nPY\npython3 /tmp/bkit-w.py", dir).text` being `""` (neither `src/tmp-script.py` nor `cannot be determined`), and on `printf x > gen.py && python3 gen.py` naming `gen.py` without matching `UNCERTAIN`.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** `bash fix.sh`, `./fix.sh` or `bash <<'SH' … SH` runs `sed -i` on an agent-read file, and the shell check reports nothing, not even uncertainty
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:742`
  - **DONE WHEN:** The `bash`/`sh`/`zsh`/`dash`/`ksh` case handles more than `-c`: a literal heredoc, here-string or stdin file is lexed like a `-c` script (depth-limited), and a directly named shell script (`bash fix.sh`, `sh ./x.sh`) and a `./x.sh` / `*.sh` program in the default branch are read through `readBoundedSource` and lexed, or report `unknown-script-effect`. A piped shell (`cat x | bash`) reports `unknown-stdin`. Probe today: all three forms return empty evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `marks shell scripts run by name or on stdin` fails on `bash fix.sh`, `./fix.sh` (fixture `sed -i s/a/b/ src/sh-named.ts`) and `bash <<'SH'\nsed -i s/a/b/ src/sh-heredoc.ts\nSH` each returning `text === ""` instead of naming the target or matching `UNCERTAIN`.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Wrapper options and `find -exec` hide an in-place edit: `xargs -I{} sed -i …`, `sudo -u me sed -i … docs/testing.md`, `timeout 5 sed -i …` and `find docs -name '*.md' -exec sed -i … {} +` all report nothing
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:527`
  - **DONE WHEN:** `stripCommandPrefix` skips the options (and option arguments) of the wrappers it already strips (`xargs -I/-0/-n/-P`, `sudo -u/-g`, `nice -n`, `env -u`), treats `timeout DURATION` and `find … -exec/-execdir/-ok … ;|+` as wrappers of the command they run, and the wrapped in-place editor yields its literal target or `unresolved-target` / `unknown-stdin`. Probe today: all four forms return `{"targets":[],"uncertain":[],"limit":null}`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `follows wrapper options and find -exec to the edit they run` fails on `sudo -u me sed -i s/a/b/ src/sudo-u.ts` and `timeout 5 sed -i s/a/b/ src/timeout.ts` not naming their targets, and on `xargs -I{} sed -i s/a/b/ {} < list.txt` and `find src -name '*.ts' -exec sed -i s/a/b/ {} +` returning `""` instead of matching `UNCERTAIN`.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `echo x &> docs/testing.md` and `echo x 1> docs/testing.md` overwrite the file, but the lexer files both under ignored fd redirects
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:440`
  - **DONE WHEN:** `&>file`, `&>>file`, `>&file` with a non-numeric word, and `1>` / `1>>` redirect into a file are recorded as redirect targets (filtered by the existing source-extension / agent-read rules); `2>file`, `>&2` and `2>&1` stay ignored. Probe today: both forms return empty evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `treats stdout-carrying fd redirects as edits` fails on `echo x &> src/amp.ts`, `echo x &>> src/amp-append.ts` and `echo x 1> src/fd1.ts` not naming their targets, while `echo x 2> src/err.ts` must stay silent.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** bkit retires a list entry it once shipped (a broad `permissions.allow` rule, an `opencode.json` `plugin` path, a hook group for a removed hook file), and every upgraded consumer keeps it forever, because `mergeManagedJson` cannot tell a retired bkit entry from a consumer addition
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/write.ts:231`
  - **DONE WHEN:** No agent can settle this alone: `mergeManagedList` keeps every base entry the current template lacks, and the upgrade path also routes `.mcp.json`, `.cursor/mcp.json` and `.opencode/opencode.json` through it (`.bkit/core/engine/commands/install/upgrade.ts:371`), so a narrowed allow rule or a renamed plugin path survives where `deepMergeJson`'s list replacement used to retract it, and a future plain-value `args` list would gain the old value beside the new one. The owner decides between recording previously shipped entries (an ownership ledger the merge subtracts), limiting list merging to named keys (`permissions.*`, hook-event groups) and keeping replacement elsewhere, or accepting the drift and shipping a migration for each retraction (`docs/migrations.md`). `.bkit/core/.bkit/install.md` § JSON ownership states the chosen rule.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `drops an entry the previous template shipped and the current one retired` fails on `mergeManagedJson({ plugin: ["./plugin/bkit-old.js", "./plugin/bkit-gateguard.js"] }, { plugin: ["./plugin/bkit-gateguard.js"] })` keeping `./plugin/bkit-old.js` when the previous shipped template held it.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** `cp new.md docs/` or `mv draft.md .agents/` writes a new agent-read file into a directory, and the detector reports nothing or names the directory instead of the file
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:730`
  - **DONE WHEN:** A `cp` / `mv` destination that ends in `/` or is an existing directory resolves to `dest/basename(source)` for each literal source (or reports `unresolved-target` when a source is dynamic), and the directory itself is never a target. Probe today: `cp new.md docs/` returns empty evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `resolves a copy or move into a directory to the file it creates` fails on `cp new.md docs/` returning `""` instead of naming `docs/new.md`, and on `mv draft.md src/` not naming `src/draft.md`.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `node -e "const {writeFileSync: w} = require('fs'); w('docs/testing.md','x')"` is classified as a safe reader: the destructured alias is bound as a known name and the write is never seen
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:1514`
  - **DONE WHEN:** In `analyzeJs`, a destructuring binding from a safe module that renames a writer (`{ writeFileSync: w }`, `{ rmSync: r }`) either maps the alias to the writer so a literal call is a target, or marks the program `unknown`; a plain read-only destructure (`{ readFileSync }`) stays quiet. Probe today: empty evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `does not read a renamed fs writer as read-only` fails on `node -e "const {writeFileSync: w} = require('fs'); w('src/alias.js','x')"` returning `""` instead of naming `src/alias.js` or matching `UNCERTAIN`.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** `perl -lpi -e … docs/testing.md` (or `-0pi`) edits in place, but `perlRubyFiles` stops scanning the flag cluster at `l` / `0` before it reaches `i`
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:637`
  - **DONE WHEN:** `-l` and `-0` consume only their optional octal digits and the scan continues through the rest of the cluster, so `-lpi`, `-0pi` and `-0777pi` set in-place; `-Mmodule`, `-Idir` and `-F` patterns still end the cluster. Probe today: `perl -lpi -e 's/a/b/' docs/testing.md` returns empty evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `recognizes perl in-place flags after -l and -0` fails on `perl -lpi -e s/a/b/ src/perl-l.js` and `perl -0pi -e s/a/b/ src/perl-0.js` not naming their targets.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** On Cursor, `curl https://off-list.example/x && sed -i … docs/testing.md` asks about the fetch and drops the edit evidence `classifyShell` now returns, so the approved command runs with no authoring advice
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.cursor/hooks/bkit-guardrails.cjs:84`
  - **DONE WHEN:** Cursor's `fetch` branch composes `shellEditContext(shellEditAdvisory(v.edits), …, ADVICE_BUDGETS.cursor, fetchText)` into the ask's `agent_message` when `v.edits` is present, as the Codex branch already does (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:85`), without changing the `ask` permission.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `keeps edit advice beside an off-allowlist fetch` fails on `advise("curl -s https://evil.example.com/x && sed -i s/a/b/ src/fetch-edit.ts").text` lacking `edits files through the shell` (it carries only `Command requires confirmation: …`).

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** A long fetch-plus-edit command (a 3 KB URL) on Codex or Antigravity echoes the full command in the fetch note, so `fixedCost` exceeds the 2,000-byte budget, every per-file block is omitted and the response still overruns the budget
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs:83`
  - **DONE WHEN:** The composed fetch-plus-edit response on Codex (`fetchNote`) and Antigravity (`fetchLine`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs:126`) stays within its budget whatever the command length: the echoed command is capped (or dropped) before `fixedCost` is computed, and `selectAdvice` never receives a `fixedCost` larger than the budget.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `keeps a long fetch-plus-edit command inside the byte budget` fails on `Buffer.byteLength(codex.text)` exceeding 2000 for `curl -s https://evil.example.com/${"a".repeat(3000)} && sed -i s/a/b/ docs/testing.md`.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** A consumer whose checkout sits under a `docs/` folder (`/home/u/docs/app`) gets the agent-read reminder, and on `.md` files the docs advisory, for every file, because the new absolute identity key is matched for `/docs/` anywhere in the path
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/gateguard-engine.js:115`
  - **DONE WHEN:** `isAgentReadPath`, `isDocsPath` and `isGateConfig` classify the path relative to the call's workspace (`cwd` / root passed to `prepareAdvice`), not the absolute `key`, so directories above the workspace never match; the normalized absolute `key` stays the warning identity. Probe today: `isAgentReadPath("/home/u/docs/app/src/index.ts")` and `isDocsPath("/home/u/docs/app/README.md")` both return `true`. Codex and OpenCode, which used to pass relative spellings, are the hosts this newly reaches.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` `ignores agent-read segments above the workspace` fails on a payload with `cwd` = `<tmp>/docs/app` and `file_path` = `<tmp>/docs/app/src/index.ts` whose advice contains `Agent-read file`.

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** A command over 256 KiB of multi-byte text is cut with `text.slice(0, 262144)`, which counts UTF-16 units, so up to about 768 KiB is still analysed and a target past the byte bound is reported as found before the limit
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/guardrails-shell.js:1577`
  - **DONE WHEN:** The command is cut at the last whole character within 256 KiB of UTF-8 bytes (no split surrogate pair), so analysis covers exactly the bytes `LIMIT_REASONS["command-size"]` names.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `cuts the command at 256 KiB of bytes` fails on `echo ${"é".repeat(200000)}; echo x > src/past-bound.ts` (about 400 KB) still naming `src/past-bound.ts`.

<!-- bkit:task 12 end -->
