> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts (24 tests | 7 failed) 2392ms
❯ bkit-secrets.mjs (24)
✓ drift before any sync: missing and extra drift, protected and reserved names do not 271ms
✓ dry run writes nothing and prints no value 237ms
✓ sync writes mapped and derived values, deletes unlisted names, keeps protected; then drift is clean and a re-sync writes nothing 390ms
✓ drift catches a stale write-only copy, an outside write, and differing readable copies, without printing values 327ms
✓ a write-only copy with no recorded push is unverifiable, never ok 139ms
✓ an empty listed key is deleted; nothing resolved deletes nothing 328ms
✓ a Vercel entry shared across environments is split, so each environment keeps its own value 11ms
× check warns on a required example key and lists every copy, including hand-set ones 13ms
× check warns both ways and on a missing example without failing 11ms
× sync and sync dry run print the example warnings and still write 235ms
× allow-missing is an unknown option 11ms
× protected keys are exempt both ways and optional keys only from example to env 18ms
× check on a missing named file exits 2 with or without an example 19ms
× check on an existing named file compares only that file both ways 12ms
✓ list and drift print no example warnings 241ms
✓ list names what each store receives, without env files or store access 25ms
✓ refuses an unknown option rather than ignoring it (no per-environment runs) 9ms
✓ rejects a config typo instead of syncing a partial scope 10ms
✓ custom store adapter: a repo-local module syncs with no engine change 21ms
✓ custom store adapter: a module missing the contract fails at load, naming the member 11ms
✓ custom store adapter: a handle missing the contract fails at run 12ms
✓ cursor: syncs into a Cloud Agents environment and proves write-only parity from state 19ms
✓ cursor: a build_secret name is never written and is surfaced, not silently skipped 12ms
✓ cursor: a name with several versions fails with a clear error, not a raw 409 10ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts > bkit-secrets.mjs > check warns on a required example key and lists every copy, including hand-set ones
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts:411:22
409| write("app/.env.example", "DEPLOY_ID=\nMISSING_KEY=\nOPTIONAL_KEY=…
410| const r = await cli("check");
411| expect(r.status).toBe(0);
| ^
412| expect(r.out).toMatch(/MISSING_KEY — missing/);
413| expect(r.out).not.toMatch(/OPTIONAL_KEY — missing/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

FAIL .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts > bkit-secrets.mjs > check warns both ways and on a missing example without failing
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts:421:22
419| fs.appendFileSync(path.join(root, "app/.env.preview"), "EMPTY_ONE=…
420| const r = await cli("check");
421| expect(r.status).toBe(0);
| ^
422| expect(r.out).toMatch(/app\/\.env\.preview vs app\/\.env\.example/…
423| expect(r.out).toMatch(/⚠️ {2}MISSING_KEY — missing/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

FAIL .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts > bkit-secrets.mjs > sync and sync dry run print the example warnings and still write
AssertionError: expected '🔄 Sync — DRY RUN, nothing written\n\…' to match /MISSING_KEY — missing/

- Expected:
  /MISSING_KEY — missing/

* Received:
  "🔄 Sync — DRY RUN, nothing written

── GitHub Actions secrets → acme/app ──
⬆️ API_KEY — would write (missing: set in source, absent remotely)
⬆️ DEPLOY_ID — would write (missing: set in source, absent remotely)
🗑️ OLD_NAME — would delete (not listed for this store, or empty in source)

── Vercel env vars → prj_1:preview (preview) ──
⚠️ STRIPE_WEBHOOK — empty in source; deleted here if present
⬆️ DATABASE_URL — would write (missing: set in source, absent remotely)

── Vercel env vars → prj_1:production (production) ──
⚠️ STRIPE_WEBHOOK — empty in source; deleted here if present
⬆️ DATABASE_URL — would write (missing: set in source, absent remotely)

── Supabase Edge Function secrets → ref-dev (preview) ──
⬆️ WEBHOOK_URL — would write (missing: set in source, absent remotely)

── Supabase Edge Function secrets → ref-prod (production) ──
⬆️ WEBHOOK_URL — would write (missing: set in source, absent remotely)

── EAS environment variables (preview) ──
⚠️ Skipped — eas CLI missing — npm i -g eas-cli

── EAS environment variables (production) ──
⚠️ Skipped — eas CLI missing — npm i -g eas-cli

── GCP Secret Manager → gcp-dev (preview) ──
⬆️ DATABASE_URL — would write (missing: set in source, absent remotely)

── GCP Secret Manager → gcp-prod (production) ──
⬆️ DATABASE_URL — would write (missing: set in source, absent remotely)

❔ Copies no API reaches — update by hand on every rotation:
❔ STRIPE_WEBHOOK — Stripe Dashboard → Webhooks

github ✅ ok
vercel (preview) ✅ ok
vercel (production) ✅ ok
supabase (preview) ✅ ok
supabase (production) ✅ ok
eas (preview) ⚠️ skipped — not checked
eas (production) ⚠️ skipped — not checked
gcp (preview) ✅ ok
gcp (production) ✅ ok"

❯ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts:439:21
437| const dry = await cli("sync", "--dry-run");
438| expect(dry.status).toBe(0);
439| expect(dry.out).toMatch(/MISSING_KEY — missing/);
| ^
440| expect(dry.out).toMatch(/OLD_NAME — would delete/);
441| expect(dry.out.indexOf("MISSING_KEY — missing")).toBeLessThan(dry.…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

FAIL .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts > bkit-secrets.mjs > allow-missing is an unknown option
AssertionError: expected +0 to be 1 // Object.is equality

- Expected

* Received

- 1

* 0

❯ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts:452:22
450| it("allow-missing is an unknown option", async () => {
451| const r = await cli("check", "--allow-missing");
452| expect(r.status).toBe(1);
| ^
453| expect(r.out).toMatch(/unknown option --allow-missing/);
454| const help = await cli("help");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

FAIL .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts > bkit-secrets.mjs > protected keys are exempt both ways and optional keys only from example to env
AssertionError: expected '── Sources ──\n ✅ overlay: .bkit/.en…' to match /OPTIONAL_KEY — not in a…/\.env\.example

- Expected:
  /OPTIONAL_KEY — not in app\/\.env\.example/

* Received:
  "── Sources ──
  ✅ overlay: .bkit/.env (3 keys)
  ✅ preview: app/.env.preview (9 keys)
  ✅ production: app/.env.production (6 keys)

── app/.env.preview vs app/.env.example ──
✅ every required key set

── app/.env.production vs app/.env.example ──
❌ DEPLOY_ID — missing
1 key(s) need a value

── Copies of each secret ──
✅ API_KEY → github
⚠️ DEPLOY_ID → github · eas (empty in production)
✅ DATABASE_URL → vercel · gcp
✅ WEBHOOK_URL → supabase
⚠️ STRIPE_WEBHOOK → vercel · by hand: Stripe Dashboard → Webhooks (empty in preview, production)"

❯ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts:468:27
466| const toExample = await cli("check");
467| expect(toExample.out).not.toMatch(/HAND_SET/);
468| expect(toExample.out).toMatch(/OPTIONAL_KEY — not in app\/\.env\.e…
| ^
469| });
470|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

FAIL .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts > bkit-secrets.mjs > check on a missing named file exits 2 with or without an example
AssertionError: expected +0 to be 2 // Object.is equality

- Expected

* Received

- 2

* 0

❯ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts:479:28
477| fs.rmSync(path.join(root, "app/.env.example"));
478| const without = await cli("check", "app/.env.nothere");
479| expect(without.status).toBe(2);
| ^
480| expect(without.out).toMatch(/app\/\.env\.nothere not found/);
481| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

FAIL .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts > bkit-secrets.mjs > check on an existing named file compares only that file both ways
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts:487:22
485| write("extra/.env.local", "DEPLOY_ID=\nONLY_HERE=x\n");
486| const r = await cli("check", "extra/.env.local");
487| expect(r.status).toBe(0);
| ^
488| expect(r.out).toMatch(/extra\/\.env\.local vs app\/\.env\.example/…
489| expect(r.out).toMatch(/⚠️ {2}DEPLOY_ID — empty/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯

Test Files 1 failed (1)
Tests 7 failed | 17 passed (24)
Start at 14:11:06
Duration 2.48s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gvKmay/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
