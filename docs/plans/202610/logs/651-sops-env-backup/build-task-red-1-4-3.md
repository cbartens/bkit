> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/templates/env-backup.integration.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts (45 tests | 3 failed) 16669ms
✓ sops contract (14)
✓ reports a plain version with the network check off and supports set --value-stdin 38ms
✓ takes --config as a global flag before the subcommand 26ms
✓ needs the dotenv type flags on a *.enc file 40ms
✓ set --value-stdin changes only that variable's line plus sops_lastmodified and sops_mac 519ms
✓ set of a new variable adds one line plus the two bookkeeping lines; unset removes one 1996ms
✓ a whole-file re-encrypt rewrites every variable line 24ms
✓ round-trips CRLF, quotes, equals, hash, spaces, a literal backslash-n and empty values 44ms
✓ encrypts comments and keeps an empty value in the clear 24ms
✓ decrypt with no age key exits 128 23ms
✓ a conflicted or tampered file fails to decrypt 37ms
✓ key probe: a fixed line round-trips from a temp dir outside the repo under --config 35ms
✓ encrypt of a file no creation rule matches exits 1 14ms
✓ rekey: rotate then updatekeys --yes moves the file to the new key 61ms
✓ reads the age key from SOPS_AGE_KEY, SOPS_AGE_KEY_CMD and the default key file 61ms
✓ env backup: discovery (3)
✓ discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files 164ms
✓ skip-list globs: * stays in one folder, ** crosses folders, patterns match at any depth, a leading slash anchors 141ms
✓ nested repo and submodule env files are never candidates 292ms
✓ env backup: .gitignore gate (2)
✓ stops when gitignore hides an enc copy and names the line to add 140ms
✓ a negated pattern counts as not ignored, and only the missing exception is named 139ms
✓ env backup: key probe and tool preconditions (9)
✓ no age key warns and writes nothing 252ms
✓ no age key with a gitignore gap warns and exits 0 155ms
✓ no sops on PATH warns and exits 0 79ms
✓ sops below the minimum version warns and exits 0 341ms
✓ no sops on PATH with an age key file present stops and names the install 410ms
✓ stops on a missing or unfilled sops config 146ms
✓ rejects an unknown config key and an unknown flag 180ms
✓ linked worktree notes and writes nothing 97ms
✓ dry run writes and stages nothing 153ms
✓ env backup: encrypt (12)
✓ one changed value changes only its line and the two bookkeeping lines 1113ms
✓ added and removed variables show as one line each 1995ms
✓ unchanged plain file leaves the enc copy byte-identical and unstaged 1001ms
✓ first encrypt creates a verified and staged enc copy 180ms
✓ absent plain file leaves its enc copy untouched 285ms
✓ invalid line and duplicate key warn with file and line only and skip that file 536ms
✓ values round-trip with CRLF quotes equals hashes spaces newlines and empties 347ms
✓ a failing sops set restores the original enc bytes 757ms
✓ dry run names a changed file as would update 317ms
✓ merge conflict in an enc copy stops with the take-one-side fix 1677ms
✓ a failing first encrypt leaves no enc copy and no temp file 549ms
✓ no age key with an invalid line warns and exits 0 125ms
✓ env backup: incoming enc changes (2)
✓ incoming enc change from another clone warns with both fixes and skips that file 663ms
✓ clean merge of another clone's enc change is skipped with a warning until the plain file is touched 750ms
❯ env backup: restore (3)
× restore rebuilds every env file on a fresh clone and keeps existing ones 259ms
× restore refuses a target git would not ignore and exits 1 without a key 254ms
× restore without sops or below the minimum version exits 1 229ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: restore > restore rebuilds every env file on a fresh clone and keeps existing ones
AssertionError: expected '' to contain 'restored apps/web/.env.preview'

- Expected

* Received

- restored apps/web/.env.preview

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1175:22
1173| const r = script(clone, ["restore"]);
1174| expect(r.status).toBe(0);
1175| expect(r.stdout).toContain(`restored ${PREVIEW}`);
| ^
1176| expect(r.stdout).toContain("kept .bkit/.env");
1177| expect(envMap(fs.readFileSync(path.join(clone.dir, PREVIEW), "utf8…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: restore > restore refuses a target git would not ignore and exits 1 without a key
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1196:28
1194| put(open, ".gitignore", ".env\n!.env.enc\n!.env.*.enc\n");
1195| const refused = script(open, ["restore"]);
1196| expect(refused.status).toBe(1);
| ^
1197| expect(refused.stderr).toContain(PREVIEW);
1198| expect(fs.existsSync(path.join(open.dir, PREVIEW))).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: restore > restore without sops or below the minimum version exits 1
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1214:25
1212| const clone = freshClone(fx);
1213| const none = script(clone, ["restore"], { env: withEnv(fx, { PATH:…
1214| expect(none.status).toBe(1);
| ^
1215| expect(none.stderr).toContain("install or upgrade sops");
1216|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

Test Files 1 failed (1)
Tests 3 failed | 42 passed (45)
Start at 13:54:41
Duration 16.78s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-1fZVjr/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
