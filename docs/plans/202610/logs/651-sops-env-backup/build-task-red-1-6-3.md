> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/templates/env-backup.integration.test.ts

[test-timeout-budget] load average 24.1 on 10 cores: unit limits 12042ms per test, 24084ms per hook (x2.41)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts (53 tests | 4 failed) 31039ms
✓ sops contract (14)
✓ reports a plain version with the network check off and supports set --value-stdin 44ms
✓ takes --config as a global flag before the subcommand 29ms
✓ needs the dotenv type flags on a *.enc file 40ms
✓ set --value-stdin changes only that variable's line plus sops_lastmodified and sops_mac 597ms
✓ set of a new variable adds one line plus the two bookkeeping lines; unset removes one 2037ms
✓ a whole-file re-encrypt rewrites every variable line 34ms
✓ round-trips CRLF, quotes, equals, hash, spaces, a literal backslash-n and empty values 48ms
✓ encrypts comments and keeps an empty value in the clear 25ms
✓ decrypt with no age key exits 128 26ms
✓ a conflicted or tampered file fails to decrypt 37ms
✓ key probe: a fixed line round-trips from a temp dir outside the repo under --config 36ms
✓ encrypt of a file no creation rule matches exits 1 15ms
✓ rekey: rotate then updatekeys --yes moves the file to the new key 61ms
✓ reads the age key from SOPS_AGE_KEY, SOPS_AGE_KEY_CMD and the default key file 64ms
✓ env backup: discovery (3)
✓ discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files 196ms
✓ skip-list globs: * stays in one folder, ** crosses folders, patterns match at any depth, a leading slash anchors 184ms
✓ nested repo and submodule env files are never candidates 514ms
✓ env backup: .gitignore gate (2)
✓ stops when gitignore hides an enc copy and names the line to add 254ms
✓ a negated pattern counts as not ignored, and only the missing exception is named 238ms
✓ env backup: key probe and tool preconditions (9)
✓ no age key warns and writes nothing 385ms
✓ no age key with a gitignore gap warns and exits 0 195ms
✓ no sops on PATH warns and exits 0 121ms
✓ sops below the minimum version warns and exits 0 512ms
✓ no sops on PATH with an age key file present stops and names the install 441ms
✓ stops on a missing or unfilled sops config 182ms
✓ rejects an unknown config key and an unknown flag 223ms
✓ linked worktree notes and writes nothing 113ms
✓ dry run writes and stages nothing 167ms
✓ env backup: encrypt (12)
✓ one changed value changes only its line and the two bookkeeping lines 1119ms
✓ added and removed variables show as one line each 1919ms
✓ unchanged plain file leaves the enc copy byte-identical and unstaged 1017ms
✓ first encrypt creates a verified and staged enc copy 254ms
✓ absent plain file leaves its enc copy untouched 455ms
✓ invalid line and duplicate key warn with file and line only and skip that file 1274ms
✓ values round-trip with CRLF quotes equals hashes spaces newlines and empties 369ms
✓ a failing sops set restores the original enc bytes 1090ms
✓ dry run names a changed file as would update 303ms
✓ merge conflict in an enc copy stops with the take-one-side fix 2328ms
✓ a failing first encrypt leaves no enc copy and no temp file 1599ms
✓ no age key with an invalid line warns and exits 0 136ms
✓ env backup: incoming enc changes (2)
✓ incoming enc change from another clone warns with both fixes and skips that file 767ms
✓ clean merge of another clone's enc change is skipped with a warning until the plain file is touched 931ms
✓ env backup: restore (3)
✓ restore rebuilds every env file on a fresh clone and keeps existing ones 464ms
✓ restore refuses a target git would not ignore and exits 1 without a key 526ms
✓ restore without sops or below the minimum version exits 1 724ms
✓ env backup: rekey (3)
✓ rekey moves every enc copy to the new key and keeps the values 416ms
✓ a failing rotate restores that enc copy and exits 1 740ms
✓ rekey without sops or below the minimum version exits 1 699ms
❯ env backup: hooks and restage (5)
× pre-commit commits the changed enc copy and only that one 1329ms
× pathspec commit leaves no staged enc copy after post-commit 994ms
✓ rebase and cherry-pick leave no staged enc copy 943ms
× restage warns and exits 0 when git add fails 837ms
× no verb prints a value 2987ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: hooks and restage > pre-commit commits the changed enc copy and only that one
AssertionError: expected [ 'notes.txt' ] to deeply equal [ 'apps/web/.env.preview.enc', …(1) ]

- Expected

* Received

  [

- "apps/web/.env.preview.enc",
  "notes.txt",
  ]

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1352:32
1350| const r = git(fx, ["commit", "-q", "-m", "work"], { env });
1351| expect(r.status).toBe(0);
1352| expect(committedFiles(fx)).toEqual([PREVIEW_ENC, "notes.txt"]);
| ^
1353| expect(stagedFiles(fx)).toEqual([]);
1354| expect(decryptedMap(fx, PREVIEW_ENC).get("ALPHA")).toBe("alpha-CHA…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: hooks and restage > pathspec commit leaves no staged enc copy after post-commit
AssertionError: expected [ 'notes.txt' ] to deeply equal [ 'apps/web/.env.preview.enc', …(1) ]

- Expected

* Received

  [

- "apps/web/.env.preview.enc",
  "notes.txt",
  ]

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1371:32
1369| expect(r.status).toBe(0);
1370| expect(stagedFiles(fx)).toEqual([]);
1371| expect(committedFiles(fx)).toEqual([PREVIEW_ENC, "notes.txt"]);
| ^
1372| expect(gitOk(fx, ["status", "--porcelain"])).toBe("");
1373| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: hooks and restage > restage warns and exits 0 when git add fails
AssertionError: expected '' to contain 'apps/web/.env.preview.enc'

- Expected

* Received

- apps/web/.env.preview.enc

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1423:22
1421| const r = script(fx, ["restage"]);
1422| expect(r.status).toBe(0);
1423| expect(r.stderr).toContain(PREVIEW_ENC);
| ^
1424| expect(r.stdout + r.stderr).not.toContain("sentinel");
1425| expect(gitOk(fx, ["rev-parse", "HEAD"])).toBe(head);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: hooks and restage > no verb prints a value
AssertionError: expected 'ALPHA=alpha-sentinel-2\nBRAVO=bravo-s…' not to match /sentinel/

- Expected:
  /sentinel/

* Received:
  "ALPHA=alpha-sentinel-2
  BRAVO=bravo-sentinel
  GAMMA=gamma-sentinel

"

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1457:62
1455| );
1456|
1457| for (const r of outputs) expect(r.stdout + r.stderr).not.toMatch(/…
| ^
1458| expect(outputs.map((r) => r.status)).toContain(0);
1459| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

Test Files 1 failed (1)
Tests 4 failed | 49 passed (53)
Start at 14:02:50
Duration 31.20s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-wKVoxM/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
