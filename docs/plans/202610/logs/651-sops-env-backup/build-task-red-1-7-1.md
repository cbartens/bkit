> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/templates/env-backup.integration.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts (54 tests | 1 failed) 27807ms
✓ sops contract (14)
✓ reports a plain version with the network check off and supports set --value-stdin 56ms
✓ takes --config as a global flag before the subcommand 35ms
✓ needs the dotenv type flags on a *.enc file 38ms
✓ set --value-stdin changes only that variable's line plus sops_lastmodified and sops_mac 441ms
✓ set of a new variable adds one line plus the two bookkeeping lines; unset removes one 2001ms
✓ a whole-file re-encrypt rewrites every variable line 30ms
✓ round-trips CRLF, quotes, equals, hash, spaces, a literal backslash-n and empty values 55ms
✓ encrypts comments and keeps an empty value in the clear 30ms
✓ decrypt with no age key exits 128 32ms
✓ a conflicted or tampered file fails to decrypt 43ms
✓ key probe: a fixed line round-trips from a temp dir outside the repo under --config 44ms
✓ encrypt of a file no creation rule matches exits 1 18ms
✓ rekey: rotate then updatekeys --yes moves the file to the new key 74ms
✓ reads the age key from SOPS_AGE_KEY, SOPS_AGE_KEY_CMD and the default key file 74ms
✓ env backup: discovery (3)
✓ discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files 204ms
✓ skip-list globs: * stays in one folder, ** crosses folders, patterns match at any depth, a leading slash anchors 174ms
✓ nested repo and submodule env files are never candidates 359ms
✓ env backup: .gitignore gate (2)
✓ stops when gitignore hides an enc copy and names the line to add 169ms
✓ a negated pattern counts as not ignored, and only the missing exception is named 201ms
✓ env backup: key probe and tool preconditions (9)
✓ no age key warns and writes nothing 380ms
✓ no age key with a gitignore gap warns and exits 0 209ms
✓ no sops on PATH warns and exits 0 120ms
✓ sops below the minimum version warns and exits 0 310ms
✓ no sops on PATH with an age key file present stops and names the install 349ms
✓ stops on a missing or unfilled sops config 218ms
✓ rejects an unknown config key and an unknown flag 418ms
✓ linked worktree notes and writes nothing 142ms
✓ dry run writes and stages nothing 209ms
✓ env backup: encrypt (12)
✓ one changed value changes only its line and the two bookkeeping lines 1260ms
✓ added and removed variables show as one line each 2003ms
✓ unchanged plain file leaves the enc copy byte-identical and unstaged 1010ms
✓ first encrypt creates a verified and staged enc copy 202ms
✓ absent plain file leaves its enc copy untouched 346ms
✓ invalid line and duplicate key warn with file and line only and skip that file 471ms
✓ values round-trip with CRLF quotes equals hashes spaces newlines and empties 427ms
✓ a failing sops set restores the original enc bytes 719ms
✓ dry run names a changed file as would update 376ms
✓ merge conflict in an enc copy stops with the take-one-side fix 1548ms
✓ a failing first encrypt leaves no enc copy and no temp file 755ms
✓ no age key with an invalid line warns and exits 0 135ms
✓ env backup: incoming enc changes (2)
✓ incoming enc change from another clone warns with both fixes and skips that file 766ms
✓ clean merge of another clone's enc change is skipped with a warning until the plain file is touched 1007ms
✓ env backup: restore (3)
✓ restore rebuilds every env file on a fresh clone and keeps existing ones 424ms
✓ restore refuses a target git would not ignore and exits 1 without a key 481ms
✓ restore without sops or below the minimum version exits 1 481ms
✓ env backup: rekey (3)
✓ rekey moves every enc copy to the new key and keeps the values 463ms
✓ a failing rotate restores that enc copy and exits 1 730ms
✓ rekey without sops or below the minimum version exits 1 417ms
✓ env backup: hooks and restage (5)
✓ pre-commit commits the changed enc copy and only that one 1682ms
✓ pathspec commit leaves no staged enc copy after post-commit 1017ms
✓ rebase and cherry-pick leave no staged enc copy 1518ms
✓ restage warns and exits 0 when git add fails 1277ms
✓ no verb prints a value 1848ms
❯ env backup: bkit's own gitignore (1)
× bkit's gitignore leaves the enc copies trackable 10ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: bkit's own gitignore > bkit's gitignore leaves the enc copies trackable
AssertionError: expected [ '.env._', '.env._' ] to deeply equal []

- Expected

* Received

- []

* [
* ".env.*",
* ".env.*",
* ]

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1477:68
1475| .filter(Boolean)
1476| .map((line) => line.split("\t")[0].split(":")[2]);
1477| expect(patterns.filter((pattern) => !pattern.startsWith("!"))).toE…
| ^
1478| });
1479| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 53 passed (54)
Start at 14:08:58
Duration 27.91s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-U4v8Gf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
