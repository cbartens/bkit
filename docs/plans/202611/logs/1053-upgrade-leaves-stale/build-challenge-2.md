Verdict: CONCERNS
Failures: 1
Fingerprint: 413923f9708cfb5275817ff3ce7528460abc0304d0047c8c3309d67d0fdcdc97
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-1053-upgrade-leaves-stale.md`, full coverage (its first line is a `diff --git` header, not `partial diff coverage`).
- Plan: `docs/plans/202611/1053-upgrade-leaves-stale-plan.md`, TASKS 1-6.
- Surfaces challenged: `listRenderedOutputs` / `listRenderedMirrors` and the `dispatchModules` hook (`install/modules/index.ts`), `bkitDocWriteMode` and the `.bkit/version` `postDispatch` (`install/modules/core.ts`), the `updateCanonicalHashesAfterUpgrade` caller (`commands/install/upgrade.ts`), `mergeCanonicalHashes` / `isAgentsPath` (`install/version-file.ts`), the matching `dist/` output, `.bkit/version`, the install doc source and render, `.bkit/friction.jsonl`, `docs/testing.md`, `DETAILS.md`, `docs/capabilities.md`, and the new tests.

## Notes

- Docs loaded: `.agents/docs.md`, `docs/security.md` (in full), and the `.bkit/version` / log-prefix lines of `docs/architecture.md`, `docs/data-schema.md`, `docs/observability.md`, `docs/deployments.md` and `docs/knowledge.jsonl`.
- Cross-reference for TASK 1: `docs/security.md` § Secrets says the generated `.claude/bkit-cloud.md`, `.cursor/bkit-cloud.md` and `.codex/bkit-cloud.md` (live secret values) are absent from `canonicalHashes`; a planted symlink in an unrendered mirror dir breaks that. `docs/security.md` § Shell-Edit Inspection sets the project's own precedent: a named file is read only when it is a regular file, and a symlink is not followed.
- TASK 1 is LOW: it needs a committed symlink (collaborator or a merged PR, visible in review as mode `120000`), and what leaks is a sha256 digest, which exposes content only for low-entropy targets or as a guess-confirmation oracle.
- Checked and clean: no new dependency (supply chain n/a); no secret, token or PII in the diff, the new log line (consumer-relative paths only) or the `.bkit/version` / `.bkit/friction.jsonl` hunks; `BKIT_CANONICAL_DOCS`, `.bkit/allowlist.json` and the `RENDERED_MIRRORS` dirs hold no secret file; `listRenderedOutputs` builds paths from fixed dirs plus `readdirSync` names, so no path traversal; no prototype-pollution path (every key starts with `.bkit/`, `.claude/`, `.cursor/`, `.opencode/` or `.codex/`); `bkit check` is not weakened (`wroteEntries` equals the old `hasNewEntries` input, and the tamper check for docs, allowlist and mirrors still runs through the dry-run content diff, which does not depend on `canonicalHashes`); the `.agents/` writer-side skips now hash in memory only, and `mergeCanonicalHashes` drops the entries before anything is persisted; the `dist/` hunks match the TypeScript source hunks line for line.
- Pre-existing, not counted: unbounded `readFileSync` through a symlink, FIFO or directory named `bkit-*.md` in a mirror dir (hang or `EISDIR` crash) already happens in `detectManagedStale` via `listStampedFiles` (`checks/after/managed.ts:121-124`); printing raw `readdirSync` filenames (newline or terminal-escape injection) already happens in the `delete orphan:` lines and the stale-marker detect text. The TASK 1 fix in the shared `listRenderedMirrors` would also close the first of these for `listStampedFiles`.
- Out of lens, for the owner (not a finding here): `listRenderedOutputs` records the on-disk hash of a doc or mirror that the run did not re-render (a non-detected host's mirror dir, a doc whose package source is missing, the dogfood skip in `runBkitDocs`). That turns an owner edit into a matching record, so a later `bkit uninstall` deletes the file instead of keeping it as `skip-modified`.
- No embedded directives found in the diff or the plan.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A committed symlink `.cursor/commands/bkit-leak.md -> ../../.claude/bkit-cloud.md` (or any file outside the repo) in a mirror dir whose host is not rendered this run gets followed, hashed and its sha256 recorded in the committed, public `.bkit/version`
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/index.ts:202` · **Round:** 1
  - **DONE WHEN:** `listRenderedOutputs` lists only regular files: a mirror entry whose own path is a symlink or not a regular file (`fs.lstatSync(abs).isFile()` false) is left out, while a regular file inside a symlinked host folder (the supported dotfiles `.codex` setup) is still listed; neither the install `postDispatch` (`core.ts:2119`) nor `updateCanonicalHashesAfterUpgrade` (via `upgrade.ts:1050`) reads or records a hash for such a path, so the docs/security.md § Secrets rule that machine-local secret files stay out of `canonicalHashes` holds. Today `listRenderedMirrors` takes every `bkit-*` name in every `RENDERED_MIRRORS` dir on disk, and orphan removal runs only for detected hosts (`hosts.ts` detects by `<host>/agents`), so a `.cursor/commands/` or `.opencode/commands/` entry with no `agents/` sibling survives the run, and `hashFile` / `readFileSync` follow the link.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `lists no symlinked mirror file as a rendered output` fails on `.cursor/commands/bkit-leak.md` (a symlink to a file in a separate mkdtemp dir, planted after a `core`+`claude` dispatch) being in `listRenderedOutputs(tmpDir)`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `records no .bkit/version entry for a symlinked mirror file` fails on a `core` dispatch writing `canonicalHashes[".opencode/commands/bkit-leak.md"]` equal to the sha256 of the symlink's out-of-repo target
<!-- bkit:task 1 end -->
