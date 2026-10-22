Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

Coverage: partial diff coverage — `git diff origin/dev..HEAD` = 74651 lines (> 10000) → per-file budget mode. The two-dot diff is dominated by `origin/dev` moving ahead of the merge base (reverse-diff noise: `docs/templates/**`, `scripts/readme/readme-art.mjs`, `.bkit/version`); feature files taken from `git diff origin/dev...HEAD` (logs, `build-task-red-*` and `.agents/skills/vitest/` excluded). Read in full: `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs` (root copy byte-identical, `cmp`), `.sops.yaml` (both), `.gitignore`, `.husky/pre-commit`, `.husky/post-commit`, `.github/workflows/bkit-ci.yml` hunk, `.agents/rules.md` + `.bkit/core/.agents/rules.md` hunk, `bkit-secrets.mjs` hunk (copies identical), `catalogue.ts` + `template-copies.ts` hunks. `env-backup.integration.test.ts` (1479 lines) inspected for key isolation only (grep), not read in full.

Probes run (scratch dir, fake values, sops 3.13.3 / age 1.3.2): (P1) a dotenv line `https://hooks.example.com/services/FAKESECRETPATH?token=fake2` encrypted with `sops encrypt --input-type dotenv` → the whole text before the first `=` appears as a PLAINTEXT key in the `.enc`. (P2) with only the public key (`SOPS_AGE_KEY_FILE=/nonexistent`), `sops encrypt` produced an `.enc` carrying `NODE_OPTIONS=…`; the owner's private key decrypted it with exit 0 and no MAC error.

### F1 — HIGH — architectural — forged `.enc` copies are accepted as genuine

- **Location:** `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:502-519` (`restore`), `:346-351` + `:379-383` (`incomingCommit` / "keep theirs: delete {P}, run restore"); docs `.bkit/core/.bkit/templates.md:626`, `docs/security.md:60-68`.
- **Exploit scenario:** age encryption has no sender authentication and the SOPS MAC is keyed by a data key the encryptor picks, so anyone holding the public key in the committed `.sops.yaml` (public in a public repo) can write a fully valid `.enc` (probe P2). A contributor's PR changes `.bkit/.env.enc` (or adds `apps/web/.env.local.enc`); reviewers see only an opaque `ENC[…]` line change plus `sops_mac` / `sops_lastmodified`, so a value swap is unreviewable. After merge: (a) the pre-commit warning tells the owner to "keep theirs: delete {P}, run restore"; (b) a fresh-machine `restore` writes every tracked copy. `.envrc` runs `dotenv_if_exists .bkit/.env`, so a forged `NODE_OPTIONS=--require=…` (or `PATH`, `GIT_SSH_COMMAND`) executes attacker code on every `node` / `pnpm` / `git` call; a swapped `*_URL` value redirects credentials to an attacker host. The incoming-change test also trusts `git log %at` (author time), which the commit author sets freely, so a future-dated commit always routes the owner to "keep theirs".
- **Suggested fix:** treat `.enc` content as untrusted unless a key holder wrote it: (1) `restore` and the incoming-change branch print, per file, the variable NAMES whose values differ from the last copy the local machine wrote (or from `HEAD~` of the last commit by a known committer) and require an explicit `--accept` before writing; (2) record the writer — e.g. require signed commits / a CODEOWNERS + CI check that fails any PR touching `**/.env*.enc` not authored by an allow-listed key holder (`.sops.yaml` owner); (3) docs (`templates.md` § Env backup, `docs/security.md` § Env file backup — SOPS) state that anyone with the public key can write a valid `.enc`, so `.enc` changes from non-key-holders are never merged; (4) use committer time from a verified signature, not `%at`.

### F2 — HIGH — mechanical — text before `=` on any line is committed in plaintext as a variable name

- **Location:** `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:235-250` (`parseEnv`: `eq <= 0` is the only key check), `:416-427` (key passed to `sops set` argv), `:436-444` (first encrypt hands the raw plain file to sops).
- **Exploit scenario:** SOPS's dotenv store encrypts values only; keys stay plaintext in the committed `.enc` (probe P1). `parseEnv` accepts any non-empty text before the first `=` as a key. A bare base64 secret pasted on its own line (`dGhpc2lzYXNlY3JldA==`, padding supplies the `=`), a webhook URL with a query string, or a connection string with `?sslmode=` becomes a "key" holding the secret; the pre-commit hook encrypts and stages it, and in a public repo the secret is published irreversibly (`docs/security.md:141`: history rewrite does not un-publish). The same key text also lands in `sops set` / `unset` argv (visible in the process list) and in the duplicate-key warning (`:364`). The sibling `bkit-secrets.mjs` `parseEnv` already rejects such keys with `/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/`.
- **Suggested fix:** in `parseEnv`, treat a key not matching `^[A-Za-z_][A-Za-z0-9_.-]*$` (or the sibling's `^[A-Za-z_][A-Za-z0-9_]*$`) as an invalid line → warn `file:line` only (no key text), skip the file (Q4-C path), so neither `sops set` nor the first `sops encrypt` ever sees it; add an integration row with a base64-with-padding line asserting the `.enc` is not created / updated and the output lacks the sentinel.

### F3 — MEDIUM — mechanical — one undecryptable `.enc` silently switches off every backup

- **Location:** `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:309-312` (`probeKey` decrypts only the first tracked `.enc`), `:482-485`; `restore` `:515-516`.
- **Exploit scenario:** a tracked `.enc` encrypted to some other age key (a merged PR, a stray copy from another repo, or a deliberately planted `a/.env.enc` that sorts first in `git ls-files`) makes `probeKey` return `noKey` on the owner's machine. Every commit then prints "no age key on this machine — .enc copies not updated" and exits 0, so no `.enc` is refreshed again while the warning reads like the expected cloud-agent case. `restore` hits the same file mid-loop and stops with "nothing restored" after having restored earlier files.
- **Suggested fix:** decide "no key" only when no tracked `.enc` opens (try each, or always run the fixed-line round trip under `.sops.yaml`); an `.enc` the key cannot open while others open → per-file warning naming it (the `planEncrypt` `:374-376` path already does this) and the run continues; `restore` skips and lists such files instead of aborting with a wrong message.

### F4 — MEDIUM — mechanical — the `!.env.*.enc` exception lets a plaintext file named `*.enc` be committed

- **Location:** `.gitignore:25-26` (`!.env.enc`, `!.env.*.enc`), `.bkit/core/.agents/rules.md:94`; check missing in `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs:463-498` (`encrypt` validates only `.enc` files beside a present plain candidate).
- **Exploit scenario:** the issue records consumers making hand copies of env files. `cp .env.local .env.local.enc` (or any tool output with that name) is no longer ignored; with `.env.local` later deleted or skipped, it is never a candidate, so `encrypt` never decrypts it, and `git add -A` / an agent following the new `*.enc` rule exception stages and commits plaintext secrets. Only when such a file happens to be the first tracked `.enc` does the probe's decrypt failure block the commit.
- **Suggested fix:** in `encrypt` (pre-commit), check every staged path whose basename matches `ENC_NAME` (`git diff --cached --name-only -z --diff-filter=ACM`) is SOPS output — a `sops_mac=ENC[` line and every non-`sops_` value matching `^ENC\[AES256_GCM,` — and stop (exit 1, path only) otherwise; this runs without the key, so also on keyless machines.

### F5 — LOW — mechanical — CI `age` hash is trust-on-first-download, not checked against the publisher's proof

- **Location:** `.github/workflows/bkit-ci.yml:681-682` (comment: "the release publishes no checksums file; hashed from the downloaded asset").
- **Exploit scenario:** the pinned `AGE_SHA256` was taken from one download, so a tampered asset at pin time would be pinned as genuine. The release does publish a Sigsum transparency proof per asset (`age-v1.3.2-linux-amd64.tar.gz.proof`, seen via `gh release view v1.3.2 -R FiloSottile/age`). Impact is limited to the integration lane (no secrets named in the step).
- **Suggested fix:** verify the pinned hash once against the `.proof` (sigsum-verify with age's published key) and record that in the comment, or verify the proof in the step; correct the comment, which says the release publishes no verification material.

## Cross-reference — `docs/security.md`

- § Shell Injection: met — every subprocess is `spawnSync` with an argv array; values reach `sops set` via `--value-stdin` (`bkit-env-backup.mjs:425-426`), never argv; sops stderr never printed (`:260-266`).
- § Env file backup — SOPS (`docs/security.md:60-68`): "never prints a value" holds for values but not for key text (F2); "The script never stages a plain file" holds for files it writes, but nothing stops a plaintext `*.enc` (F4); no statement that `.enc` authorship is unauthenticated (F1).
- § Public repo content (`docs/security.md:135-141`): the `*.enc` exception assumes every `.enc` is ciphertext and that its key names are harmless — F2 and F4 break both assumptions.
- § Supply-Chain: no new npm dependency; CI binaries pinned + sha256-checked (F5 caveat for age).
- `bkit-secrets.mjs` two-way example check prints key names only, and its `parseEnv` rejects non-identifier keys — no finding.
- Embedded directives in diff / inputs: none found.
