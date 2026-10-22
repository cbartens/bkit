Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

## Findings

Inputs: `build-challenge-1.md` (bugs lens), `build-challenge-2.md` (security lens); `agreement` total = 2. Both inputs ran per-file budget mode (diff 74651 lines). Root copy `scripts/env-backup/bkit-env-backup.mjs` byte-identical to `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs` (`cmp`) → every `bkit-env-backup.mjs` line ref applies to both copies. Cited line ranges spot-checked against HEAD `f7f77f93`.

### F1 — HIGH · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:235-250` (`parseEnv`)

- **Lens:** security (challenge-2 F2) + bugs (challenge-1 F2). Merged: same lines (`:238-243` ⊂ `:235-250`), same root cause (`parseEnv` line grammar — any non-empty text before the first `=` is a key; only exact `""` is blank), shared fix point (`createEnc` hands the raw plain file to `sops encrypt`).
- **Severity:** HIGH — max-wins; challenge-2 HIGH, challenge-1 MEDIUM.
- **Class:** mechanical
- **Location:** `bkit-env-backup.mjs:235-250` (`parseEnv`), `:361-366` (problem warnings; duplicate-key text at `:364`), `:416-427` (`updateEnc`: key in `sops set` / `unset` argv), `:436-450` (`createEnc`: raw plain file to `sops encrypt`).
- **Exploit scenario:**
  - (secret published as key name) SOPS dotenv store encrypts values only; keys stay plaintext in the committed `.enc` (challenge-2 probe P1, sops 3.13.3 / age 1.3.2). `parseEnv` key check = `eq <= 0` only. Bare base64 secret on its own line (`dGhpc2lzYXNlY3JldA==`, padding supplies the `=`), webhook URL with a query string, or connection string with `?sslmode=` → becomes a key holding the secret → pre-commit encrypts + stages → published irreversibly in a public repo (`docs/security.md:141`: history rewrite does not un-publish). Key text also lands in `sops set` / `unset` argv (process list) and the duplicate-key warning (`:364`). Sibling `bkit-secrets.mjs` `parseEnv` already rejects non-identifier keys (`/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/`).
  - (CRLF file never backed up) `A=1\r\n\r\nB=2\r\n` splits into `"A=1\r"`, `"\r"`, `"B=2\r"`; `"\r"` != `""`, no `=` → `not a KEY=value line` on a visually blank line → whole file skipped every commit, `.enc` never created / updated. Whitespace-only line same. SOPS's dotenv loader also rejects a `"\r"` line → create path fails even if the parser lets it through. Plan Edge Cases table promises CRLF support; fixtures (`env-backup.integration.test.ts:250-259`, `:978-987`) carry CRLF only on value lines → untested.
- **Suggested fix:** one strict line grammar in `parseEnv`: blank after trim (`/^\s*$/`) → skip; `#` → comment; key MUST match `^[A-Za-z_][A-Za-z0-9_]*$` (sibling's) or `^[A-Za-z_][A-Za-z0-9_.-]*$` → else problem `{ line }` with NO key text → Q4-C skip-file path, so neither `sops set` nor the first `sops encrypt` ever sees it. `createEnc`: never hand SOPS the raw plain file — encrypt a normalised copy built from the parsed map (temp file beside the target, existing `.env-backup-tmp-*` pattern) or create from the first key then `set` the rest. Tests: add `\r\n\r\n` between two keys to EB rows 13 and 16; new EB row with a base64-with-padding line asserting the `.enc` is not created / updated and output lacks the sentinel.
- **agreement:** 2/2

### F2 — HIGH · architectural · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:502-519` (`restore`)

- **Lens:** security (challenge-2 F1).
- **Severity:** HIGH
- **Class:** architectural — fix changes the `.enc` trust model (writer authentication, accept gate, review policy).
- **Location:** `bkit-env-backup.mjs:502-519` (`restore`), `:346-351` (`incomingCommit`: `git log --format=%at`), `:379-383` (`keep theirs: delete ${rel}, run restore` warning); docs `.bkit/core/.bkit/templates.md:626`, `docs/security.md:60-68`.
- **Exploit scenario:** age has no sender authentication; SOPS MAC is keyed by a data key the encryptor picks → anyone holding the public key in the committed `.sops.yaml` (public in a public repo) writes a fully valid `.enc` (challenge-2 probe P2: `SOPS_AGE_KEY_FILE=/nonexistent`, `.enc` carrying `NODE_OPTIONS=…`, owner key decrypts exit 0, no MAC error). Contributor PR changes `.bkit/.env.enc` or adds `apps/web/.env.local.enc`; reviewers see only an opaque `ENC[…]` change + `sops_mac` / `sops_lastmodified` → value swap unreviewable. After merge: (a) pre-commit tells the owner to keep theirs and run `restore`; (b) fresh-machine `restore` writes every tracked copy. `.envrc` runs `dotenv_if_exists .bkit/.env` → forged `NODE_OPTIONS=--require=…` (or `PATH`, `GIT_SSH_COMMAND`) executes attacker code on every `node` / `pnpm` / `git` call; swapped `*_URL` value redirects credentials to an attacker host. `incomingCommit` trusts `%at` (author time, author-set) → future-dated commit always routes the owner to "keep theirs".
- **Suggested fix:** treat `.enc` content as untrusted unless a key holder wrote it: (1) `restore` + incoming-change branch print per file the variable NAMES whose values differ from the last copy this machine wrote (or from `HEAD~` of the last commit by a known committer) and require explicit `--accept` before writing; (2) record the writer — signed commits, or CODEOWNERS + CI check failing any PR touching `**/.env*.enc` not authored by an allow-listed key holder (`.sops.yaml` owner); (3) docs (`.bkit/core/.bkit/templates.md` § Env backup, `docs/security.md` § Env file backup — SOPS) state anyone with the public key can write a valid `.enc` → `.enc` changes from non-key-holders are never merged; (4) committer time from a verified signature, not `%at`. Any `.github/workflows/*` change requires human confirmation (`.agents/rules.md` § CI edits).
- **agreement:** 1/2

### F3 — HIGH · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:453-458` (`stageEnc`)

- **Lens:** bugs (challenge-1 F1).
- **Severity:** HIGH
- **Class:** mechanical
- **Location:** `bkit-env-backup.mjs:453-458` (`stageEnc`); related `:384` (`kind: "same"`), `:346-351` (`incomingCommit`), `restage` (walks `HEAD` entries only).
- **Exploit scenario:** newly created `.enc` that misses its commit is never staged again. `createEnc` writes `apps/web/.env.preview.enc`; `stageEnc` runs `git add` into the commit's index (`GIT_INDEX_FILE` = `.git/index.lock`). Commit aborts — empty message, failing `commit-msg` hook, or a later pre-commit block (bkit root `.husky/pre-commit` runs the dist freshness check after the env-backup block) → git rolls back `index.lock` → hook's `git add` lost → `.enc` stays untracked. Same when `encrypt` stops mid-loop (`Stop` at job N after job 1 was a `create`). Next commit: plain file unchanged → `planEncrypt` marks `kind: "same"`; `stageEnc` stages `same` only when `git diff --quiet -- <enc>` exits 1; `git diff` ignores untracked paths → exit 0 → never staged. `restage` walks `HEAD` only; `incomingCommit` returns null for an untracked path. Result: no git backup until the plain file next changes; fresh-clone `restore` silently lacks it. Exposes plan Assumption A5 (`.bkit/.env.enc` comes from the owner's first main-checkout commit).
- **Suggested fix:** in `stageEnc`, a `same` job also needs staging when the `.enc` is not in the index — `git ls-files --error-unmatch -- <enc>` fails, or `git hash-object -- <enc>` != the `git ls-files -s` blob. Add EB row: first encrypt → abort the commit (empty message) → next commit stages the `.enc`.
- **agreement:** 1/2

### F4 — MEDIUM · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:309-312` (`probeKey`)

- **Lens:** security (challenge-2 F3) + bugs (challenge-1 F5; challenge-1 F3 probe facet). Merged: same `:309-312`, same root cause (`probeKey` judges the whole machine from the first tracked `.enc` in `git ls-files` order). challenge-1 F3 split: probe facet here, missing-SOPS-metadata facet in F5.
- **Severity:** MEDIUM — max-wins; challenge-2 F3 MEDIUM, challenge-1 F3 MEDIUM, challenge-1 F5 LOW.
- **Class:** mechanical
- **Location:** `bkit-env-backup.mjs:309-312` (`probeKey`), `:482-485` (`encrypt` early return), `:373-376` (per-file `noKey` path), `:515-516` (`restore`), `:545-547` (`rekey`).
- **Exploit scenario:**
  - (other-key `.enc`, challenge-2 F3) tracked `.enc` encrypted to another age key (merged PR, stray copy from another repo, planted `a/.env.enc` sorting first) → `probeKey` returns `noKey` on the owner's machine → every commit prints `no age key on this machine — .enc copies not updated`, exits 0 → no `.enc` refreshed again; warning reads like the expected cloud-agent case. `restore` hits the same file mid-loop → `no age key on this machine — nothing restored` after restoring earlier files.
  - (partial rekey, challenge-1 F5) `rekey` failing partway (row 46) leaves `.enc` files split across old / new key; once the owner drops the old key, `probeKey` may pick an old-key `.enc` → same silent `noKey`; warning false (machine holds the key).
  - (non-SOPS `.enc`, challenge-1 F3) probe decrypt of a non-SOPS `.enc` exits != 128 → `decryptEnc` throws `Stop("sops failed (exit N) on .env.enc")` → every commit stops on every machine with `sops`, keyless ones included (breaks plan Q4 / Q15-B: keyless machines never stop). A tracked `.enc` whose plain file is absent here and fails decrypt for a non-key reason also blocks every commit, though per-file logic never touches it. Open failure class `precommit-check-dist-blocks-parallel-agents` (`docs/failures.jsonl:154`).
- **Suggested fix:** machine counts as keyed when any tracked `.enc` opens or the fixed-line probe under `.sops.yaml` round-trips (`probeFixedLine`); prefer an `.enc` whose plain sibling is a candidate; probe decrypt failure other than exit 128 → fall back to `probeFixedLine`, never stop. Per-file `noKey` stays in `planEncrypt`'s `:374-376` warning; run continues. `restore` skips + lists unopenable files instead of aborting with a wrong message. Add EB row: two tracked `.enc`, first in `git ls-files` order encrypted to another age key → commit still updates the other and warns naming the unopenable one.
- **agreement:** 2/2

### F5 — MEDIUM · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:28` (`ENC_NAME`)

- **Lens:** security (challenge-2 F4) + bugs (challenge-1 F3 metadata facet). Merged: same root cause — a file matching `ENC_NAME` (`^\.env(\..+)?\.enc$`) is never checked to be SOPS output.
- **Severity:** MEDIUM — challenge-2 MEDIUM, challenge-1 MEDIUM.
- **Class:** mechanical
- **Location:** `bkit-env-backup.mjs:28` (`ENC_NAME`), `:463-498` (`encrypt` validates only `.enc` files beside a present candidate), `.gitignore:25-26` (`!.env.enc`, `!.env.*.enc`), `.bkit/core/.agents/rules.md:94` (Secrets `*.enc` exception).
- **Exploit scenario:**
  - (plaintext committed, challenge-2 F4) issue records consumers hand-copying env files. `cp .env.local .env.local.enc` (or tool output with that name) is no longer ignored; with `.env.local` later deleted or skipped it is never a candidate → `encrypt` never decrypts it → `git add -A` / an agent following the new `*.enc` rule exception stages + commits plaintext secrets. Blocked only when it happens to be the first tracked `.enc` (F4 probe failure).
  - (foreign format, challenge-1 F3) consumer already committing an OpenSSL / other-tool `.env.enc` adopts the template → `decryptEnc` stops with `sops failed (exit N)`; message never says the file is not a SOPS file. `restore` (`:515`) and `rekey` (`:546`) die the same way.
- **Suggested fix:** one SOPS-output check, no key needed: `sops_mac=ENC[` line (and `sops_version=`) present, every non-`sops_` value matches `^ENC\[AES256_GCM,`. (1) `encrypt` (pre-commit) runs it on every staged path whose basename matches `ENC_NAME` (`git diff --cached --name-only -z --diff-filter=ACM`) ahead of the early returns at `:465-480`, so keyless machines enforce it → stop exit 1, path only. (2) Run it before every `decryptEnc` → stop naming the path: not a SOPS file, rename or remove it. challenge-1 cites plan Q4 / Q15-B (keyless machines never stop); this stop is scoped to the commit's own staged content, not repo state → record the exception in `docs/decisions.jsonl` when applied.
- **agreement:** 2/2

### F6 — MEDIUM · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:162-180` (`listIgnoredFiles`)

- **Lens:** bugs (challenge-1 F4).
- **Severity:** MEDIUM
- **Class:** mechanical
- **Location:** `bkit-env-backup.mjs:162-180` (`listIgnoredFiles`).
- **Exploit scenario:** folder ignored by a contents pattern (`tmp/**`, bkit root `.gitignore:36`, common in consumers) is not itself ignored → `check-ignore` leaves `tmp/` in `open` → second `git ls-files --others --ignored` lists every ignored file under it, every commit; `skip` filter runs only afterwards in `discover`. Runs before the key probe → keyless machines pay too. Large scratch tree (extracted package with `node_modules`, build output) → slow pre-commit, against plan A8 budget (a few seconds). Listing > 64 MiB `maxBuffer` → `ENOBUFS` → `git()` throws `Stop("git: …")` → commit stops on every machine, keyless included (`run()` checks `r.error` before `r.status` per `docs/knowledge.jsonl:299` `586-spawnsync-enobufs-can-report-exit-0`, so it surfaces as `Stop`, not false success). Open failure class `precommit-check-dist-blocks-parallel-agents` (`docs/failures.jsonl:154`).
- **Suggested fix:** limit both listings to env-file names with pathspecs, e.g. `-- ':(glob)**/.env' ':(glob)**/.env.*'`, alongside the collapsed folders on the re-list → git never enumerates unrelated ignored files.
- **agreement:** 1/2

### F7 — LOW · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:63-69` (`parseArgs`)

- **Lens:** bugs (challenge-1 F6).
- **Severity:** LOW
- **Class:** mechanical
- **Location:** `bkit-env-backup.mjs:63-69` (`parseArgs`).
- **Exploit scenario:** `{ encrypt: …, … }[verb]` reads inherited properties. `node scripts/env-backup/bkit-env-backup.mjs toString` (or `constructor`, `__proto__`) gets a function / `Object.prototype`, not `undefined`. No flags → `{ verb: "toString" }`, `dispatch` falls through `default`, exits 0 silently (plan: unknown verb → exit 2 + usage). With a flag → `allowed.includes` `TypeError` → exit 1.
- **Suggested fix:** `const table = { … }; const allowed = Object.hasOwn(table, verb) ? table[verb] : undefined;`, or build the table with `Object.create(null)`.
- **agreement:** 1/2

### F8 — LOW · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:132-136` (`ageKeySourcePresent`)

- **Lens:** bugs (challenge-1 F7).
- **Severity:** LOW
- **Class:** mechanical
- **Location:** `bkit-env-backup.mjs:132-136` (`ageKeySourcePresent`).
- **Exploit scenario:** `fs.statSync(f, { throwIfNoEntry: false })` swallows only `ENOENT`. `SOPS_AGE_KEY_FILE` through a regular file (`ENOTDIR`), into an unreadable folder (`EACCES`) or around a symlink loop (`ELOOP`) throws a plain `Error` → top-level catch exits 1 with a raw Node message → commit stops on a machine without `sops`, message naming neither the key nor `sops`. Plan (Preconditions, Q15-B): key file counts when readable; code checks only `isFile()` → unreadable key file counts as key source → commit stops with `install or upgrade sops`.
- **Suggested fix:** wrap the probe in `try`, any error → not present; check readability with `fs.accessSync(f, fs.constants.R_OK)`.
- **agreement:** 1/2

### F9 — LOW · mechanical · `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:360` (`planEncrypt` UTF-8 read)

- **Lens:** bugs (challenge-1 F8). `:426` overlaps F1's `:416-427` range — distinct defect (value bytes, not key text) → kept separate.
- **Severity:** LOW
- **Class:** mechanical
- **Location:** `bkit-env-backup.mjs:360` (plain read), `:378` (decrypted parse), `:426` (`set` value via `JSON.stringify`).
- **Exploit scenario:** plain + decrypted text both read as `utf8`. Non-UTF-8 value (Latin-1 `ä` from a Windows editor) decodes to U+FFFD both sides → `sameMap` / `verifyEnc` agree. First `sops encrypt` keeps the raw bytes; next `set` of that key (any edit to it) sends `JSON.stringify` of the U+FFFD text → backup holds the replacement character; `verifyEnc` passes (compares decoded strings); `restore` writes the corrupted value, no warning.
- **Suggested fix:** read the plain file as a `Buffer`, check UTF-8 round trip (`Buffer.from(text, "utf8").equals(raw)`); fail → warn `file: not UTF-8 — .enc left as it is`, skip the file (Q4-C treatment).
- **agreement:** 1/2

### F10 — LOW · mechanical · `.github/workflows/bkit-ci.yml:681-682`

- **Lens:** security (challenge-2 F5).
- **Severity:** LOW
- **Class:** mechanical
- **Location:** `.github/workflows/bkit-ci.yml:681-682` (`AGE_SHA256` + comment).
- **Exploit scenario:** pinned `AGE_SHA256` taken from one download (comment: the release publishes no checksums file; hashed from the downloaded asset) → a tampered asset at pin time is pinned as genuine. Release does publish a Sigsum transparency proof per asset (`age-v1.3.2-linux-amd64.tar.gz.proof`, seen via `gh release view v1.3.2 -R FiloSottile/age`). Impact limited to the integration lane (no secrets named in the step).
- **Suggested fix:** verify the pinned hash once against the `.proof` (sigsum-verify with age's published key) and record that in the comment, or verify the proof in the step; correct the comment (release publishes verification material). `.github/workflows/*` edit requires human confirmation (`.agents/rules.md` § CI edits).
- **agreement:** 1/2
