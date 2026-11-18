## Session Prompt — this run's, newer than everything below

#1053 publish=false

## Issue description — oldest

### What happened

`.bkit/version` records a sha256 for each file bkit manages. After `git merge dev` into a build branch, followed by `pnpm -s build` and `pnpm -s tsx .bkit/core/engine/cli.ts upgrade`, some recorded hashes no longer match the file on disk, and `node dist/cli.js check` still exits 0.

Seen twice while landing v6.3 builds by hand:

<!-- prettier-ignore -->
| Branch | Entries that did not match the file on disk |
| --- | --- |
| `feat/1018-subagent-commits-makes` | 5: the three `bkit-build.md` command mirrors, `.bkit/workflows.md`, `.bkit/cli.md` |
| `feat/919-worktree-setup-tries` | 1: `.bkit/workflows.md` |

In both cases `.bkit/version` itself was in conflict in the merge and was taken from `dev`. Each entry was then set to the disk hash by hand.

Separately, on `dev` at `2fa879a63` with a clean tree, 8 of 263 entries do not match the file on disk, and `check` exits 0: `.cursor/mcp.json`, `.agents/context.md`, `.agents/docs.md`, `.agents/skills.md`, `.mcp.json`, `package.json`, `.bkit/templates.md`, `.bkit/allowlist.json`. This may be by design (files the owner edits, where the entry records what bkit shipped). It is not written down which.

Not investigated: why `upgrade` left the entries stale, and what a stale entry does on the next `upgrade` (for example, whether it then treats the file as edited by the owner and skips it).

### What should happen

- After `upgrade`, every entry for a file `upgrade` renders matches the file on disk.
- `check` fails, or says so, when an entry for such a file does not match.
- The doc says which entries are allowed to differ from disk and why.

### How bad

Medium until the effect of a stale entry is known. If `upgrade` skips a file whose entry is stale, a merged branch can carry an old mirror forward with no warning.

### Possible fix

- Reproduce: branch from a commit before a workflow-source change on `dev`, change the same source, merge `dev`, take `dev`'s `.bkit/version`, run build and upgrade, compare entries with disk.
- If `upgrade` skips on a mismatch: have it re-render and re-record files whose source it owns, whatever the old entry says.
- Add the entry-against-disk comparison to `check` for rendered files.

### Removes

The by-hand hash comparison and entry edits when a build branch is merged with `dev`.
