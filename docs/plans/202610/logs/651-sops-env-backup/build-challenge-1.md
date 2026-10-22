Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Coverage: partial diff coverage — diff origin/dev..HEAD is 74651 lines (per-file budget mode). Feature files read in full: `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs` (root copy byte-identical, `cmp`), `bkit-env-backup.config.mjs`, `.sops.yaml` (template + root), `.husky/pre-commit` + `.husky/post-commit` (template + root), `.gitignore`, `vitest.tsx-bin.ts`, `.bkit/templates/scripts/secrets/bkit-secrets.mjs` diff (root copy byte-identical). Test file `env-backup.integration.test.ts` scanned by case title only. Plan-log artefacts and dev-only drift (merge base 56760f89 behind origin/dev 785f3958: `.bkit/version`, `readme-art.mjs`, `docs/templates/*` reversals) not reviewed.

### F1 — HIGH · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:453-458` (root copy `scripts/env-backup/bkit-env-backup.mjs:453-458`)

- **Scenario:** a newly created `.enc` that misses its commit is never staged again. `createEnc` writes `apps/web/.env.preview.enc`; `stageEnc` runs `git add` into the commit's index (`GIT_INDEX_FILE` = `.git/index.lock` on a normal commit). The commit then aborts — empty message, a failing `commit-msg` hook, or a later pre-commit block failing (bkit's root `.husky/pre-commit` runs the dist freshness check after the env-backup block). Git rolls back `index.lock`, so the hook's `git add` is lost and the `.enc` stays an untracked file in the worktree. The same happens when `encrypt` stops mid-loop (`Stop` from job N after job 1 was a `create`). On the next commit the plain file is unchanged, so `planEncrypt` marks the job `kind: "same"`, and `stageEnc` stages a `same` job only when `git diff --quiet -- <enc>` exits 1. `git diff` compares worktree to index and ignores untracked paths: it exits 0. The `.enc` is never staged. `restage` only walks `HEAD` entries, and `incomingCommit` returns null for an untracked path, so nothing else catches it. Result: no backup in git for that env file until its plain file next changes. A fresh clone's `restore` silently lacks it. Plan Assumption A5 (`.bkit/.env.enc` comes from the owner's first main-checkout commit) is exposed to exactly this.
- **Fix:** in `stageEnc`, treat a `same` job as needing staging when the `.enc` is not in the index as well as when it differs from it. Example: `git ls-files --error-unmatch -- <enc>` failing, or compare `git hash-object -- <enc>` with the `git ls-files -s` blob. Add an EB row: first encrypt → abort the commit (empty message) → next commit stages the `.enc`.

### F2 — MEDIUM · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:238-243` (`parseEnv`)

- **Scenario:** a CRLF env file with a blank line is never backed up. The plan's Edge Cases table promises CRLF support. A Windows-saved file such as `A=1\r\n\r\nB=2\r\n` splits on `\n` into `"A=1\r"`, `"\r"`, `"B=2\r"`. The `"\r"` line is not `""`, does not start with `#` and has no `=`, so it counts as a problem. The whole file is skipped with `not a KEY=value line`, pointing at a line that looks blank to the user. The warning repeats on every commit and the `.enc` never updates or gets created. A line holding only spaces is skipped the same way. SOPS's own dotenv loader also rejects a `"\r"` line, so the create path (`sops encrypt` on the plain file) would fail as well if the parser let it through. The test fixtures (`env-backup.integration.test.ts:250-259`, `:978-987`) use CRLF only on a value line and have no CRLF blank line, so this path is untested.
- **Fix:** in `parseEnv`, treat a line that is empty after trimming (`/^\s*$/`) as blank. For a new `.enc`, do not hand SOPS the raw plain file. Either encrypt a normalised copy with blank lines removed, through a temp file beside the target like the existing `.env-backup-tmp-*`, or create the file from the first key and `set` the rest. Add a fixture with `\r\n\r\n` between two keys to EB rows 13 and 16.

### F3 — MEDIUM · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:309-312` + `:373` (`probeKey`, `planEncrypt`)

- **Scenario:** `ENC_NAME` (`^\.env(\..+)?\.enc$`) claims every tracked `*.env*.enc`, including one this script did not write. A consumer that already commits an OpenSSL- or other-tool `.env.enc` (a common hand-rolled pattern) adopts the template. On every commit on a machine with `sops` installed, `probeKey` decrypts the first tracked `.enc`. SOPS cannot find its metadata and exits with a code other than 128, and `decryptEnc` throws `Stop("sops failed (exit N) on .env.enc")`. That stops every commit, including commits on keyless machines that have `sops` installed, which breaks the rule that keyless machines never stop. The message does not say the file is not a SOPS file. `restore` and `rekey` die the same way, at `:515` and `:543`. A tracked `.enc` whose plain file is absent on this machine but which fails to decrypt for a non-key reason also blocks every commit through the probe, even though the per-file logic would never touch it.
- **Fix:** before decrypting, check for SOPS metadata, for example a `sops_version=` / `sops_mac=` line in the `.enc` text. A file without it should stop with a clear message to rename or remove the non-SOPS `*.enc`. In `probeKey`, prefer an `.enc` whose plain sibling is a candidate, and fall back to `probeFixedLine` when that decrypt fails for any reason other than exit 128.

### F4 — MEDIUM · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:162-180` (`listIgnoredFiles`)

- **Scenario:** a folder ignored by a contents pattern such as `tmp/**` (bkit's own root `.gitignore:36`, and common in consumers) is not itself ignored. `check-ignore` therefore leaves `tmp/` in `open`, and the second `git ls-files --others --ignored` lists every ignored file under it, file by file, on every commit. The `skip` filter runs only afterwards in `discover`. This runs before the key probe, so keyless machines pay the cost too. A large scratch tree under `tmp/` (an extracted package with `node_modules`, build output) makes the pre-commit hook slow, against the plan's A8 budget of a few seconds. A listing above the 64 MiB `maxBuffer` returns `ENOBUFS`, `git()` throws `Stop("git: …")`, and the commit stops on every machine, keyless ones included.
- **Fix:** limit both listings to env-file names with pathspecs, e.g. `-- ':(glob)**/.env' ':(glob)**/.env.*'`, alongside the collapsed folders on the re-list. Git then never enumerates unrelated ignored files.

### F5 — LOW · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:309-312` + `:482-485`

- **Scenario:** a `rekey` that fails partway, at row 46, leaves some `.enc` files on the new key and some on the old one. The individual files are restored, but the earlier ones stay rekeyed. Once the owner drops the old key from the key file, `probeKey` may pick an old-key `.enc` first (`git ls-files` order). It then returns `noKey`, and `encrypt` prints `no age key on this machine — .enc copies not updated` and exits 0. Every commit passes with every backup silently stale, even though the per-file path at `:374-376` already handles one unopenable file by warning and skipping only that file. The warning is wrong: the machine does hold the key.
- **Fix:** count the machine as keyed when any tracked `.enc` opens, or when the fixed-line probe under `.sops.yaml` round-trips. Leave per-file `noKey` to `planEncrypt`'s existing warning.

### F6 — LOW · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:63-69` (`parseArgs`)

- **Scenario:** `{ encrypt: …, … }[verb]` reads inherited properties. `node scripts/env-backup/bkit-env-backup.mjs toString` (or `constructor`, `__proto__`) gets a function or `Object.prototype` back, not `undefined`. With no flags it returns `{ verb: "toString" }`, `dispatch` falls through `default`, and the run exits 0 silently, where the plan's unknown-verb rule says exit 2 plus usage. With a flag, `allowed.includes` throws a `TypeError` and the run exits 1.
- **Fix:** `const table = { … }; const allowed = Object.hasOwn(table, verb) ? table[verb] : undefined;`, or build the table with `Object.create(null)`.

### F7 — LOW · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:132-136` (`ageKeySourcePresent`)

- **Scenario:** `fs.statSync(f, { throwIfNoEntry: false })` swallows only `ENOENT`. A `SOPS_AGE_KEY_FILE` pointing through a regular file (`ENOTDIR`), into an unreadable folder (`EACCES`) or around a symlink loop (`ELOOP`) throws a plain `Error`. The top-level catch exits 1 with a raw Node message, and the commit stops on a machine without `sops` for a reason that names neither the key nor `sops`. The plan (Preconditions, Q15-B) says a key file counts when it is readable, but the code checks only `isFile()`. An unreadable key file therefore counts as a key source, and the commit stops with `install or upgrade sops`.
- **Fix:** wrap the probe in `try`, treat any error as not present, and check readability with `fs.accessSync(f, fs.constants.R_OK)`.

### F8 — LOW · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:360` + `:378` + `:426`

- **Scenario:** plain and decrypted text are both read as `utf8`. A value that is not valid UTF-8, such as a Latin-1 `ä` from a Windows editor, decodes to U+FFFD on both sides, so `sameMap` and `verifyEnc` agree. The first `sops encrypt` keeps the raw bytes. The next `set` of that key, triggered by any edit to it, sends `JSON.stringify` of the U+FFFD text, so the backup now holds the replacement character. `verifyEnc` still passes because it compares decoded strings, and `restore` writes the corrupted value with no warning.
- **Fix:** read the plain file as a `Buffer` and check that it survives a UTF-8 round trip (`Buffer.from(text, "utf8").equals(raw)`). If it does not, warn `file: not UTF-8 — .enc left as it is` and skip the file, the same treatment as Q4-C.

## Cross-reference

- F3, F4: belong to the open failure class `precommit-check-dist-blocks-parallel-agents` (`docs/failures.jsonl:154`). Both stop every committer's commit over working-tree or repo state outside that commit. Both also reach keyless machines, which plan Q4 and Q15-B say must never stop.
- F1: undermines plan Assumption A5. `.bkit/.env.enc` is meant to come from the owner's first main-checkout commit, and bkit's root `.husky/pre-commit` runs the dist freshness check after the env-backup block, so that commit can abort after the `.enc` is created.
- `docs/knowledge.jsonl:299` (`586-spawnsync-enobufs-can-report-exit-0`): `run()` checks `r.error` before `r.status`, as that entry requires. F4's `ENOBUFS` therefore comes out as a `Stop` rather than a false success.
- `docs/security.md:62-68` (Env file backup): no conflict with the findings. Output paths print paths, key names and counts only; no path was found that prints a value.
