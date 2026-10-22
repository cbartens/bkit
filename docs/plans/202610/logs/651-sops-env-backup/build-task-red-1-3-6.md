> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/templates/env-backup.integration.test.ts

[test-timeout-budget] load average 14.6 on 10 cores: unit limits 7280ms per test, 14560ms per hook (x1.46)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts (42 tests | 13 failed) 19778ms
✓ sops contract (14)
✓ reports a plain version with the network check off and supports set --value-stdin 162ms
✓ takes --config as a global flag before the subcommand 111ms
✓ needs the dotenv type flags on a *.enc file 162ms
✓ set --value-stdin changes only that variable's line plus sops_lastmodified and sops_mac 800ms
✓ set of a new variable adds one line plus the two bookkeeping lines; unset removes one 2002ms
✓ a whole-file re-encrypt rewrites every variable line 110ms
✓ round-trips CRLF, quotes, equals, hash, spaces, a literal backslash-n and empty values 222ms
✓ encrypts comments and keeps an empty value in the clear 98ms
✓ decrypt with no age key exits 128 138ms
✓ a conflicted or tampered file fails to decrypt 117ms
✓ key probe: a fixed line round-trips from a temp dir outside the repo under --config 122ms
✓ encrypt of a file no creation rule matches exits 1 56ms
✓ rekey: rotate then updatekeys --yes moves the file to the new key 193ms
✓ reads the age key from SOPS_AGE_KEY, SOPS_AGE_KEY_CMD and the default key file 209ms
✓ env backup: discovery (3)
✓ discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files 708ms
✓ skip-list globs: * stays in one folder, ** crosses folders, patterns match at any depth, a leading slash anchors 449ms
✓ nested repo and submodule env files are never candidates 1011ms
✓ env backup: .gitignore gate (2)
✓ stops when gitignore hides an enc copy and names the line to add 509ms
✓ a negated pattern counts as not ignored, and only the missing exception is named 512ms
✓ env backup: key probe and tool preconditions (9)
✓ no age key warns and writes nothing 869ms
✓ no age key with a gitignore gap warns and exits 0 477ms
✓ no sops on PATH warns and exits 0 257ms
✓ sops below the minimum version warns and exits 0 531ms
✓ no sops on PATH with an age key file present stops and names the install 587ms
✓ stops on a missing or unfilled sops config 525ms
✓ rejects an unknown config key and an unknown flag 539ms
✓ linked worktree notes and writes nothing 411ms
✓ dry run writes and stages nothing 539ms
❯ env backup: encrypt (12)
× one changed value changes only its line and the two bookkeeping lines 895ms
× added and removed variables show as one line each 951ms
× unchanged plain file leaves the enc copy byte-identical and unstaged 155ms
× first encrypt creates a verified and staged enc copy 148ms
× absent plain file leaves its enc copy untouched 195ms
× invalid line and duplicate key warn with file and line only and skip that file 204ms
× values round-trip with CRLF quotes equals hashes spaces newlines and empties 210ms
× a failing sops set restores the original enc bytes 206ms
× dry run names a changed file as would update 201ms
× merge conflict in an enc copy stops with the take-one-side fix 1754ms
× a failing first encrypt leaves no enc copy and no temp file 379ms
✓ no age key with an invalid line warns and exits 0 219ms
❯ env backup: incoming enc changes (2)
× incoming enc change from another clone warns with both fixes and skips that file 979ms
× clean merge of another clone's enc change is skipped with a warning until the plain file is touched 856ms

⎯⎯⎯⎯⎯⎯ Failed Tests 13 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > one changed value changes only its line and the two bookkeeping lines
AssertionError: expected '' to contain 'updated apps/web/.env.preview.enc'

- Expected

* Received

- updated apps/web/.env.preview.enc

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:881:22
879| const r = script(fx, ["encrypt"]);
880| expect(r.status).toBe(0);
881| expect(r.stdout).toContain(`updated ${PREVIEW_ENC}`);
| ^
882| const { removed, added } = stagedDiffNames(fx, PREVIEW_ENC);
883| expect(removed).toEqual(["BRAVO", "sops_lastmodified", "sops_mac"]…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > added and removed variables show as one line each
AssertionError: expected [] to deeply equal [ 'sops_lastmodified', 'sops_mac' ]

- Expected

* Received

- [
- "sops_lastmodified",
- "sops_mac",
- ]

* []

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:896:25
894| expect(script(fx, ["encrypt"]).status).toBe(0);
895| const add = stagedDiffNames(fx, PREVIEW_ENC);
896| expect(add.removed).toEqual(["sops_lastmodified", "sops_mac"]);
| ^
897| expect(add.added).toEqual(["DELTA", "sops_lastmodified", "sops_mac…
898| commit(fx, "added");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > unchanged plain file leaves the enc copy byte-identical and unstaged
AssertionError: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:912:59
910| const fx = makeFx();
911| bootstrap(fx, { [PREVIEW]: THREE, ".bkit/.env": "TOKEN=token-senti…
912| expect(fs.existsSync(path.join(fx.dir, PREVIEW_ENC))).toBe(true);
| ^
913| const before = fs.readFileSync(path.join(fx.dir, PREVIEW_ENC));
914| untilNextSecond();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > first encrypt creates a verified and staged enc copy
AssertionError: expected '' to contain 'created apps/web/.env.preview.enc'

- Expected

* Received

- created apps/web/.env.preview.enc

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:927:22
925| const r = script(fx, ["encrypt"]);
926| expect(r.status).toBe(0);
927| expect(r.stdout).toContain(`created ${PREVIEW_ENC}`);
| ^
928| expect(decryptedMap(fx, PREVIEW_ENC)).toEqual(envMap(THREE));
929| expect(stagedFiles(fx)).toEqual([PREVIEW_ENC]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > absent plain file leaves its enc copy untouched
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-env-backup-FrZiQ9/repo/apps/web/.env.preview.enc'
❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:936:23
934| const fx = makeFx();
935| bootstrap(fx, { [PREVIEW]: THREE });
936| const before = fs.readFileSync(path.join(fx.dir, PREVIEW_ENC));
| ^
937| fs.rmSync(path.join(fx.dir, PREVIEW));
938| put(fx, ".bkit/.env", "TOKEN=token-sentinel\n");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > invalid line and duplicate key warn with file and line only and skip that file
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-env-backup-xMzQ7w/repo/.bkit/.env.enc'
❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:952:20
950| [PREVIEW]: THREE,
951| });
952| const bad = fs.readFileSync(path.join(fx.dir, ".bkit/.env.enc"));
| ^
953| const dup = fs.readFileSync(path.join(fx.dir, "apps/api/.env.enc")…
954| untilNextSecond();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > values round-trip with CRLF quotes equals hashes spaces newlines and empties
AssertionError: expected 100 to be +0 // Object.is equality

- Expected

* Received

- 0

* 100

❯ decryptedMap .bkit/core/engine/audits/templates/env-backup.integration.test.ts:811:20
809| function decryptedMap(fx: Fx, rel: string): Map<string, string> {
810| const r = run("sops", ["decrypt", ...DOTENV, rel], { cwd: fx.dir, en…
811| expect(r.status).toBe(0);
| ^
812| return envMap(r.stdout);
813| }
❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:986:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > a failing sops set restores the original enc bytes
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-env-backup-3FFI99/repo/apps/web/.env.preview.enc'
❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:998:23
996| const fx = makeFx();
997| bootstrap(fx, { [PREVIEW]: THREE });
998| const before = fs.readFileSync(path.join(fx.dir, PREVIEW_ENC));
| ^
999| put(fx, PREVIEW, "ALPHA=a-CHANGED\nBRAVO=b-CHANGED\nCHARLIE=c-CHAN…
1000| const r = script(fx, ["encrypt"], { env: faultEnv(fx, "fail-set-2"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > dry run names a changed file as would update
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-env-backup-uJeZA4/repo/apps/web/.env.preview.enc'
❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1012:20
1010| bootstrap(fx, { [PREVIEW]: THREE, ".bkit/.env": "TOKEN=token-senti…
1011| put(fx, PREVIEW, "ALPHA=alpha-CHANGED\nBRAVO=bravo-sentinel\nCHARL…
1012| const enc = fs.readFileSync(path.join(fx.dir, PREVIEW_ENC));
| ^
1013| const status = gitOk(fx, ["status", "--porcelain"]);
1014| const r = script(fx, ["encrypt", "--dry-run"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > merge conflict in an enc copy stops with the take-one-side fix
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1035:61
1033| expect(script(fx, ["encrypt"]).status).toBe(0);
1034| commit(fx, "main");
1035| expect(git(fx, ["merge", "--no-edit", "other"]).status).toBe(1);
| ^
1036|
1037| const r = script(fx, ["encrypt"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: encrypt > a failing first encrypt leaves no enc copy and no temp file
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1049:27
1047| put(fx, PREVIEW, THREE);
1048| const failed = script(fx, ["encrypt"], { env: faultEnv(fx, "fail-e…
1049| expect(failed.status).toBe(1);
| ^
1050| expect(failed.stderr).toContain(PREVIEW);
1051| expect(failed.stdout + failed.stderr).not.toContain("sentinel");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: incoming enc changes > incoming enc change from another clone warns with both fixes and skips that file
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-env-backup-vq7xNR/repo/apps/web/.env.preview.enc'
❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1108:25
1106| gitOk(fx, ["pull", "-q", "--ff-only", "origin", "main"]);
1107| put(fx, ".bkit/.env", "TOKEN=token-CHANGED\n");
1108| const incoming = fs.readFileSync(path.join(fx.dir, PREVIEW_ENC));
| ^
1109|
1110| const r = script(fx, ["encrypt"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/13]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: incoming enc changes > clean merge of another clone's enc change is skipped with a warning until the plain file is touched
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-env-backup-0k9G0u/repo/apps/web/.env.preview.enc'
❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:1131:23
1129| commit(fx, "local");
1130| gitOk(fx, ["pull", "-q", "--no-rebase", "--no-edit", "origin", "ma…
1131| const merged = fs.readFileSync(path.join(fx.dir, PREVIEW_ENC));
| ^
1132|
1133| const skipped = script(fx, ["encrypt"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/13]⎯

Test Files 1 failed (1)
Tests 13 failed | 29 passed (42)
Start at 13:48:20
Duration 20.16s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9AriNp/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
