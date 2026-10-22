> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/templates/env-backup.integration.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts (28 tests | 14 failed) 3535ms
✓ sops contract (14)
✓ reports a plain version with the network check off and supports set --value-stdin 36ms
✓ takes --config as a global flag before the subcommand 42ms
✓ needs the dotenv type flags on a *.enc file 43ms
✓ set --value-stdin changes only that variable's line plus sops_lastmodified and sops_mac 46ms
✓ set of a new variable adds one line plus the two bookkeeping lines; unset removes one 2040ms
✓ a whole-file re-encrypt rewrites every variable line 35ms
✓ round-trips CRLF, quotes, equals, hash, spaces, a literal backslash-n and empty values 47ms
✓ encrypts comments and keeps an empty value in the clear 26ms
✓ decrypt with no age key exits 128 25ms
✓ a conflicted or tampered file fails to decrypt 35ms
✓ key probe: a fixed line round-trips from a temp dir outside the repo under --config 35ms
✓ encrypt of a file no creation rule matches exits 1 14ms
✓ rekey: rotate then updatekeys --yes moves the file to the new key 60ms
✓ reads the age key from SOPS_AGE_KEY, SOPS_AGE_KEY_CMD and the default key file 60ms
❯ env backup: discovery (3)
× discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files 80ms
× skip-list globs: * stays in one folder, ** crosses folders, patterns match at any depth, a leading slash anchors 58ms
× nested repo and submodule env files are never candidates 197ms
❯ env backup: .gitignore gate (2)
× stops when gitignore hides an enc copy and names the line to add 55ms
× a negated pattern counts as not ignored, and only the missing exception is named 57ms
❯ env backup: key probe and tool preconditions (9)
× no age key warns and writes nothing 56ms
× no age key with a gitignore gap warns and exits 0 57ms
× no sops on PATH warns and exits 0 60ms
× sops below the minimum version warns and exits 0 66ms
× no sops on PATH with an age key file present stops and names the install 60ms
× stops on a missing or unfilled sops config 57ms
× rejects an unknown config key and an unknown flag 55ms
× linked worktree notes and writes nothing 72ms
× dry run writes and stages nothing 57ms

⎯⎯⎯⎯⎯⎯ Failed Tests 14 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: discovery > discovery picks up an env file in a new untracked folder and leaves out skipped, ignored-folder, symlinked and tracked files
AssertionError: expected [] to deeply equal [ 'would create .bkit/.env.enc', …(3) ]

- Expected

* Received

- [
- "would create .bkit/.env.enc",
- "would create apps/web/.env.preview.enc",
- "would create brand/new/nested/.env.local.enc",
- "would create real/.env.target.enc",
- ]

* []

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:575:24
573| const r = script(fx, ["encrypt", "--dry-run"]);
574| expect(r.status).toBe(0);
575| expect(planned(r)).toEqual([
| ^
576| "would create .bkit/.env.enc",
577| "would create apps/web/.env.preview.enc",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: discovery > skip-list globs: * stays in one folder, ** crosses folders, patterns match at any depth, a leading slash anchors
AssertionError: expected [] to deeply equal [ …(3) ]

- Expected

* Received

- [
- "would create a/one/two/.env.enc",
- "would create apps/root-only/.env.enc",
- "would create xyz/.env.enc",
- ]

* []

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:600:24
598| const r = script(fx, ["encrypt", "--dry-run"]);
599| expect(r.status).toBe(0);
600| expect(planned(r)).toEqual([
| ^
601| "would create a/one/two/.env.enc",
602| "would create apps/root-only/.env.enc",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: discovery > nested repo and submodule env files are never candidates
AssertionError: expected [] to deeply equal [ …(2) ]

- Expected

* Received

- [
- "would create newdir/.env.local.enc",
- "would create top/.env.enc",
- ]

* []

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:630:24
628| const r = script(fx, ["encrypt", "--dry-run"]);
629| expect(r.status).toBe(0);
630| expect(planned(r)).toEqual(["would create newdir/.env.local.enc", …
| ^
631| });
632| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: .gitignore gate > stops when gitignore hides an enc copy and names the line to add
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:640:22
638| put(fx, "apps/web/.env.preview", "K=sentinel-value\n");
639| const r = script(fx, ["encrypt"]);
640| expect(r.status).toBe(1);
| ^
641| expect(r.stderr).toContain(".gitignore:2:.env.*");
642| expect(r.stderr).toContain("!.env.enc");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: .gitignore gate > a negated pattern counts as not ignored, and only the missing exception is named
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:653:22
651| put(fx, "apps/web/.env.preview", "K=sentinel-value\n");
652| const r = script(fx, ["encrypt"]);
653| expect(r.status).toBe(1);
| ^
654| expect(r.stderr).toContain("!.env.enc");
655| expect(r.stderr).not.toContain("apps/web/.env.preview.enc");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > no age key warns and writes nothing
AssertionError: expected '' to contain 'no age key on this machine'

- Expected

* Received

- no age key on this machine

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:667:25
665| const none = script(fx, ["encrypt"], { env: withEnv(fx, { ...noKey…
666| expect(none.status).toBe(0);
667| expect(none.stderr).toContain("no age key on this machine");
| ^
668| expect(encFiles(fx)).toEqual([]);
669| expect(fs.readdirSync(tmp)).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > no age key with a gitignore gap warns and exits 0
AssertionError: expected '' to contain 'no age key on this machine'

- Expected

* Received

- no age key on this machine

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:696:22
694| const r = script(fx, ["encrypt"], { env: noKeyEnv(fx) });
695| expect(r.status).toBe(0);
696| expect(r.stderr).toContain("no age key on this machine");
| ^
697| expect(r.stderr).not.toContain("!.env.enc");
698| expect(encFiles(fx)).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > no sops on PATH warns and exits 0
AssertionError: expected '' to contain 'sops is missing or older than 3.11.0'

- Expected

* Received

- sops is missing or older than 3.11.0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:707:22
705| const r = script(fx, ["encrypt"], { env });
706| expect(r.status).toBe(0);
707| expect(r.stderr).toContain("sops is missing or older than 3.11.0");
| ^
708| expect(encFiles(fx)).toEqual([]);
709| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > sops below the minimum version warns and exits 0
AssertionError: expected '' to contain 'sops is missing or older than 3.11.0'

- Expected

* Received

- sops is missing or older than 3.11.0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:720:22
718| const r = script(fx, ["encrypt"], { env });
719| expect(r.status).toBe(0);
720| expect(r.stderr).toContain("sops is missing or older than 3.11.0");
| ^
721| expect(encFiles(fx)).toEqual([]);
722| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > no sops on PATH with an age key file present stops and names the install
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:729:22
727| const env = withEnv(fx, { PATH: binDir(fx, "none") });
728| const r = script(fx, ["encrypt"], { env });
729| expect(r.status).toBe(1);
| ^
730| expect(r.stderr).toContain("install or upgrade sops");
731| expect(encFiles(fx)).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > stops on a missing or unfilled sops config
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:745:23
743| put(missing, "apps/web/.env.preview", "K=sentinel-value\n");
744| const r1 = script(missing, ["encrypt"]);
745| expect(r1.status).toBe(1);
| ^
746| expect(r1.stderr).toContain(".sops.yaml");
747|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > rejects an unknown config key and an unknown flag
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:759:24
757| const fx = makeFx({ config: "export default { skip: [], skipp: [] …
758| const bad = script(fx, ["encrypt"]);
759| expect(bad.status).toBe(1);
| ^
760| expect(bad.stderr).toContain("skipp");
761|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > linked worktree notes and writes nothing
AssertionError: expected '' to contain 'linked worktree'

- Expected

* Received

- linked worktree

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:777:22
775| const r = script(fx, ["encrypt"], { cwd: wt });
776| expect(r.status).toBe(0);
777| expect(r.stderr).toContain("linked worktree");
| ^
778| expect(fs.existsSync(path.join(wt, "apps", "web", ".env.preview.en…
779| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/14]⎯

FAIL .bkit/core/engine/audits/templates/env-backup.integration.test.ts > env backup: key probe and tool preconditions > dry run writes and stages nothing
AssertionError: expected '' to contain 'would create apps/web/.env.preview.enc'

- Expected

* Received

- would create apps/web/.env.preview.enc

❯ .bkit/core/engine/audits/templates/env-backup.integration.test.ts:787:22
785| const r = script(fx, ["encrypt", "--dry-run"]);
786| expect(r.status).toBe(0);
787| expect(r.stdout).toContain("would create apps/web/.env.preview.enc…
| ^
788| expect(encFiles(fx)).toEqual([]);
789| expect(stagedFiles(fx)).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/14]⎯

Test Files 1 failed (1)
Tests 14 failed | 14 passed (28)
Start at 13:38:10
Duration 3.62s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-1eKJJ3/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
