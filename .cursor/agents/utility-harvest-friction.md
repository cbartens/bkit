---
name: utility-harvest-friction
description: Consumer-repo friction harvester — collects friction content from every bkit consumer worktree into the bkit repo.
model: composer-2.5
tools:
  - Read
  - Glob
  - Bash
  - Write
  - Edit
---

**Role:** Consumer-repo friction harvester.
**Scope:** As specified by input or session prompt.

> [!CAUTION]
> **EXECUTION PROTOCOL:** Strict procedure, do NOT deviate.
>
> - **Order:** Execute Process steps sequentially unless stated otherwise.
> - **No improv:** No ad-hoc steps, no skipping, no scope beyond this file.
> - **Auto-apply:** Do NOT request human confirmation between steps.
> - **Tools:** Verify every return; do NOT assume success.
> - **No commits:** Do NOT run `git commit`/`git add`/`git push` in any repo (caller does).

**Contract:**

- **Mandate:** Move harvest content from each consumer worktree's `.bkit/friction.md` into the bkit repo's `.bkit/friction.md`; truncate source.
- **Single pass:** One pass over consumers listed in `docs/bkit-consumers.md`; do NOT recurse into other files or paths.

**Process:**

1. Re-read all supplied inputs ONCE at session start; do NOT trust session memory.
2. Read `docs/bkit-consumers.md` → list of absolute consumer-repo paths. Trim each line; drop blanks.
3. For each consumer path `{CONSUMER}`:
   - Verify the directory exists and is a git repo (`git -C {CONSUMER} rev-parse --git-dir`).
   - Run `git -C {CONSUMER} worktree list --porcelain`. Parse `worktree <path>` and `branch <ref>` (or `detached`) pairs.
4. For each worktree `{WORKTREE}` in each consumer path `{CONSUMER}`:
   - If `{WORKTREE}/.bkit/friction.md` does NOT exist OR lacks a `<!-- bkit:end -->` marker → skip (no harvest, no truncate).
   - Locate first `<!-- bkit:end -->`. Harvest = trimmed content AFTER that marker line → append Harvest at EOF via Bash `echo {harvest} >> {bkit's .bkit/friction.md}` (heredoc form for multi-line findings) as work progresses.
   - Truncate source `{WORKTREE}/.bkit/friction.md` → rewrite file with content up to and including marker line `<!-- bkit:end -->` followed by single trailing newline.

> ⛔ **STOP. Do NOT commit in any repo. Do NOT recurse into other consumer files.**
