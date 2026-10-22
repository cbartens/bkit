> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/templates/env-backup.integration.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts (48 tests | 3 failed) 17017ms
✓ sops contract (14)
✓ reports a plain version with the network check off and supports set --value-stdin 35ms
✓ takes --config as a global flag before the subcommand 24ms
✓ needs the dotenv type flags on a *.enc file 35ms
✓ set --value-stdin changes only that variable's line plus sops_lastmodified and sops_mac 937ms
✓ set of a new variable adds one line plus the two bookkeeping lines; unset removes one 2001ms
✓ a whole-file re-encrypt rewrites every variable line 34ms
✓ round-trips CRLF, quotes, equals, hash, spaces, a literal backslash-n and empty values 45ms
✓ encrypts comments and keeps an empty value in the clear 24ms
✓ decrypt with no age key exits 128 24ms
✓ a conflicted or tampered file fails to decrypt 35ms
✓ key probe: a fixed line round-trips from a temp dir outside the repo under --config 34ms
✓ encrypt of a file no creation rule matches exits 1 14ms
✓ rekey: rotate then updatekeys --yes moves the file to the new key 57ms
✓ reads the age key from SOPS_AGE_KEY, SOPS_AGE_KEY_CMD and the default key file 58ms
✓ env backup: discovery (3)
✓ discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files 162ms
✓ skip-list globs: * stays in one folder, ** crosses folders, patterns match at any depth, a leading slash anchors 138ms
✓ nested repo and submodule env files are never candidates 272ms
✓ env backup: .gitignore gate (2)
✓ stops when gitignore hides an enc copy and names the line to add 137ms
✓ a negated pattern counts as not ignored, and only the missing exception is named 135ms
✓ env backup: key probe and tool preconditions (9)
✓ no age key warns and writes nothing 240ms
✓ no age key with a gitignore gap warns and exits 0 132ms
✓ no sops on PATH warns and exits 0 76ms
✓ sops below the minimum version warns and exits 0 225ms
✓ no sops on PATH with an age key file present stops and names the install 233ms
✓ stops on a missing or unfilled sops config 138ms
✓ rejects an unknown config key and an unknown flag 167ms
✓ linked worktree notes and writes nothing 93ms
✓ dry run writes and stages nothing 148ms
✓ env backup: encrypt (12)
✓ one changed value changes only its line and the two bookkeeping lines 480ms
✓ added and removed variables show as one line each 2031ms
✓ unchanged plain file leaves the enc copy byte-identical and unstaged 1002ms
✓ first encrypt creates a verified and staged enc copy 175ms
✓ absent plain file leaves its enc copy untouched 295ms
✓ invalid line and duplicate key warn with file and line only and skip that file 486ms
✓ values round-trip with CRLF quotes equals hashes spaces newlines and empties 346ms
✓ a failing sops set restores the original enc bytes 686ms
✓ dry run names a changed file as would update 318ms
✓ merge conflict in an enc copy stops with the take-one-side fix 1787ms
✓ a failing first encrypt leaves no enc copy and no temp file 519ms
✓ no age key with an invalid line warns and exits 0 123ms
✓ env backup: incoming enc changes (2)
✓ incoming enc change from another clone warns with both fixes and skips that file 639ms
✓ clean merge of another clone's enc change is skipped with a warning until the plain file is touched 721ms
✓ env backup: restore (3)
✓ restore rebuilds every env file on a fresh clone and keeps existing ones 337ms
✓ restore refuses a target git would not ignore and exits 1 without a key 366ms
✓ restore without sops or below the minimum version exits 1 413ms
❯ env backup: rekey (3)
× rekey moves every enc copy to the new key and keeps the values 219ms
× a failing rotate restores that enc copy and exits 1 221ms
× rekey without sops or below the minimum version exits 1 201ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: rekey > rekey moves every enc copy to the new key and keeps the values
AssertionError: expected '' to contain 'rekeyed apps/web/.env.preview.enc'

- Expected

* Received

- rekeyed apps/web/.env.preview.enc

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1254:22
1252| const r = script(fx, ["rekey"], { env: both });
1253| expect(r.status).toBe(0);
1254| expect(r.stdout).toContain(`rekeyed ${PREVIEW_ENC}`);
| ^
1255| expect(r.stdout + r.stderr).not.toContain("sentinel");
1256| expect(stagedFiles(fx)).toEqual([".bkit/.env.enc", PREVIEW_ENC]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: rekey > a failing rotate restores that enc copy and exits 1
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1282:22
1280| env: { ...faultEnv(fx, "fail-rotate-2"), SOPS_AGE_KEY: both.SOPS…
1281| });
1282| expect(r.status).toBe(1);
| ^
1283| expect(r.stderr).toContain(PREVIEW_ENC);
1284| expect(r.stdout + r.stderr).not.toContain("sentinel");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: rekey > rekey without sops or below the minimum version exits 1
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1296:25
1294|
1295| const none = script(fx, ["rekey"], { env: { ...both, PATH: binDir(…
1296| expect(none.status).toBe(1);
| ^
1297| expect(none.stderr).toContain("install or upgrade sops");
1298|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

Test Files 1 failed (1)
Tests 3 failed | 45 passed (48)
Start at 13:56:59
Duration 17.11s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Ye6NMm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
