# Plan input — 651-sops-env-backup (run 1)

## Session prompt

/bkit-plan #651

## Issue #651 — Env files: SOPS-encrypted backup in git, .env.example both ways

https://github.com/cbartens/bkit/issues/651

### Problem

Env files with real values are gitignored, so the only readable copy of each value lives on one machine. Losing the machine means hunting down or rotating every value. What happens instead is hand-made copies (`.env.*.backup` files beside the originals, seen in a consumer), which are just as unbacked-up.

`.env.example` is maintained by hand. `bkit-secrets.mjs check` flags a key the example lists but an env file lacks. It never flags the reverse, so a key added to an env file and not to the example goes unnoticed.

### Outcome

1. A new copy-and-own template, adopted by bkit: every env file in the repo gets an SOPS-encrypted copy beside it, committed to git and kept current by a pre-commit hook. Git is the backup; its history shows which variable changed in which commit.
2. `bkit-secrets.mjs` compares its source env files with `.env.example` in both directions, as warnings only.

### Success criteria

- Fresh clone + the one decryption key → every env file restored with one command.
- Changing one value changes only that variable's line in its encrypted file, plus SOPS's two bookkeeping lines (`sops_lastmodified`, `sops_mac`). Unchanged variables stay byte-identical. An added or removed variable shows as one added or removed line.
- A commit on a machine holding the key updates and stages every `.enc` copy whose plain file changed.
- A new env file anywhere in the repo is picked up with no setup, unless it matches the skip list.
- `bkit-secrets.mjs sync` and `check` warn on a key in an env file missing from `.env.example`, a key in the example missing from an env file, or no example file; they never fail on these and the sync still runs.
- bkit adopts the template on its own env files; the root copy stays byte-identical to the template.

### Decisions already made

<!-- prettier-ignore -->
| Topic | Decision |
| --- | --- |
| Tool | SOPS with one `age` key; `.sops.yaml` holds the public key. |
| Why not dotenvx | Names each private key after its env file (`.env.preview` → `DOTENV_PRIVATE_KEY_PREVIEW`) and keeps a `.env.keys` per folder, so env files across `apps/web/`, `apps/mobile/` and `.bkit/` mean several keys to store. Built to encrypt the env file in place, not write a copy beside it. 2.x bundles hosted and keychain features (Armor, OS keychain, 1Password, Bitwarden) that would need switching off. SOPS: one key and one `.sops.yaml` cover every folder; 23.5k GitHub stars vs 5.8k. |
| Why not git-crypt | Encrypts whole files: GitHub and PR review show one unreadable blob, not which variable changed. |
| Encryption scope | Encrypts what is there; no `.env.example` check, no push to any store, no CI decryption. |
| Which files | Auto-discovered: every gitignored file named `.env` or `.env.*` (`.bkit/.env`, every app and package folder, every name). A skip list in config covers generated files and worktrees; defaults `.vercel/**`, `supabase/.temp/**`, `.worktrees/**`, `.claude/worktrees/**`, `node_modules/**`. |
| Layout | Encrypted copy beside the plain file as `{file}.enc` (e.g. `apps/web/.env.preview.enc`, `.bkit/.env.enc`). Plain gitignored, `.enc` tracked. |
| Updates | Per variable (`sops set` / `sops unset`) after decrypting and comparing, never a whole-file re-encrypt (rewrites every line, tested below). Needs the private key on the machine running it. |
| When it runs | Pre-commit hook runs the encrypt command and stages changed `.enc` files. No key on the machine → skip with a warning, commit proceeds (cloud agents). Plain file absent → its `.enc` left untouched, never emptied. |
| `.gitignore` | Template docs give the exception lines (`!.env.enc`, `!.env.*.enc`). Encrypt stops with the exact line to add when git would ignore an `.enc` file. bkit's managed `.gitignore` block is not changed. |
| `.env.example` check | Stays in `bkit-secrets.mjs`, on its configured sources only (overlays such as `.bkit/.env` not compared). Both directions; missing example file included. Warnings only in `sync` and `check`; never changes the exit code. `--allow-missing` removed. Existing copies unaffected (copy-and-own); release note, no migration. |
| Secrets sync | `bkit-secrets.mjs` otherwise unchanged: pushing secrets to stores. |
| Key storage | User's choice, entered by hand; docs recommend a password manager. The key never enters the repo. |
| Docs | Document all of it: install (`sops`, `age`), key creation, first encrypt, hook setup, restore on a new machine, key rotation, skip list, `.gitignore` lines, where to keep the key, the new warnings in sync. `.bkit/templates.md` section + table rows (new template; Secrets sync § updated), `docs/security.md` § Secrets Management. |

### Constraints and non-goals

- Stack-agnostic; script byte-identical across repos, per-repo choices in config.
- Values never printed.
- Non-goals: store sync from the new template, CI decryption, hosted secret managers, automating key storage.

### Tested (SOPS 3.13.3, age 1.3.2, fake values, scratch repo)

<!-- prettier-ignore -->
| Action on a 3-variable file | Lines changed in the encrypted file |
| --- | --- |
| Whole-file `sops encrypt` after changing one value | Every variable line, plus age header and `sops_mac` |
| `sops set` one existing variable | That variable + `sops_lastmodified` + `sops_mac` |
| `sops set` a new variable | One added line + the same two |
| `sops unset` a variable | One removed line + the same two |

- Files named `*.enc` need `--input-type dotenv --output-type dotenv`; SOPS picks the format from the file name.
- dotenvx 2.38.2 facts above come from its installed source, not from running it.

### References

- `.bkit/templates.md` § Secrets sync — one source, every store
- `.bkit/templates/scripts/secrets/bkit-secrets.mjs` `check` command (one-way example compare, exit 2 today)
- `docs/security.md` § Secrets Management
- #497 — Secrets sync template and config audit that checks secret values match — https://github.com/cbartens/bkit/issues/497
- #529 — secrets: pluggable store adapters (custom modules) + built-in Cursor/agent-host cloud stores — https://github.com/cbartens/bkit/issues/529

Body rewritten with the decisions from review: SOPS with one age key, encrypted copy beside each plain file as `{file}.enc`, every env file in the repo covered, `.env.example` checked both ways, `bkit-secrets.mjs` kept for store pushes only, key kept by hand (password manager recommended), everything documented.

Why SOPS: tested both tools in a scratch repo with fake values. dotenvx keys each private key to its env file name and keeps a key file per folder, and is built to encrypt in place rather than write a copy beside the plain file; SOPS covers every folder with one key. Test result that shapes the build: re-encrypting a whole file rewrites every line and hides what changed, so updates must go one variable at a time (`sops set` / `sops unset`), which changes only that variable's line plus two SOPS bookkeeping lines. Table in the body.

Open questions settled in review, design step skipped (label now `next:plan`). Body updated:

- Files are found automatically, with a skip list for generated files and worktrees.
- The pre-commit hook keeps the `.enc` copies current. With no key on the machine it skips with a warning; with a plain file missing it leaves that file's `.enc` copy alone.
- The `.env.example` check stays in `bkit-secrets.mjs`, both directions, and only warns: it never fails, and the sync still runs.
- The encrypt command does no example checking. It only stops when `.gitignore` would hide an `.enc` file.
