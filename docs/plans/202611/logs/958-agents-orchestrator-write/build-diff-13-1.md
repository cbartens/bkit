diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index a3f322664..4430ec653 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -76,7 +76,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 **Single-write contract:** Every step before the flush creates no git object. Never route back to the **Failure Path**: log the error and continue to the flush.
 
-1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, only the last 20 lines of the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
+1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, the failed command's last 20 stderr lines — drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, `--stderr-file` also for a non-shell failure; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
    "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md" --stderr-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-stderr.md" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 38a7517df..314af5a46 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -76,7 +76,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 **Single-write contract:** Every step before the flush creates no git object. Never route back to the **Failure Path**: log the error and continue to the flush.
 
-1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, only the last 20 lines of the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
+1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, the failed command's last 20 stderr lines — drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, `--stderr-file` also for a non-shell failure; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
    "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md" --stderr-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-stderr.md" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index d4648f7bc..433af77f6 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -67,7 +67,7 @@ _No tracker connected, skip step._
 
 **Single-write contract:** Every step before the flush creates no git object. Never route back to the **Failure Path**: log the error and continue to the flush.
 
-1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, only the last 20 lines of the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
+1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, the failed command's last 20 stderr lines — drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, `--stderr-file` also for a non-shell failure; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
    "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md" --stderr-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-stderr.md" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 9abd8402b..c0f755f33 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -92,7 +92,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 **Single-write contract:** Every step before the flush creates no git object. Never route back to the **Failure Path**: log the error and continue to the flush.
 
-1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, only the last 20 lines of the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
+1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, the failed command's last 20 stderr lines — drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, `--stderr-file` also for a non-shell failure; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
    "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md" --stderr-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-stderr.md" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
diff --git a/.bkit/version b/.bkit/version
index 379b0c600..203b3ad08 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -12,11 +12,11 @@
     ".bkit/.env.example": "6bf0e90fae894711f951811a122424eb8eaec00bcc0c0bfdafcc2750927b4daf",
     ".opencode/opencode.json": "37a299e11dd7e9d28fd3a212fdf3ac990ba656998263d47731285d30192f0397",
     ".claude/commands/bkit-auto.md": "023c394a82a09e02bd7cc28affba340720bfc193807366b1d560e189d542b560",
-    ".claude/commands/bkit-build.md": "2f46d9ed67da6e7f9ed28cc0aa995789364d434606fa190d7ab3aef7891a59cd",
-    ".claude/commands/bkit-debug.md": "245b3e60b21862d8828343982e9df5e750a40f7af874028376572ba0de202ffd",
-    ".claude/commands/bkit-design.md": "9409a240a035b4a67d88bd02aa70f46be99d71220612bbfcb625402797dc98de",
-    ".claude/commands/bkit-plan.md": "bd37681227433dc27e8c7c9edc61fcb7c35f4bd071eb222b79bfc5faf32bed09",
-    ".claude/commands/bkit-ship.md": "94820c1fffe4e9f40a0404acf6e6b85022f111ac99282a078da40671e05c6de4",
+    ".claude/commands/bkit-build.md": "0f2475b3179bc91501428f733d5d9b96af2d01bbba2f78bb5863e8f86f2c55b9",
+    ".claude/commands/bkit-debug.md": "ea72f4f278b8fb6f5fd2e3c9d1690b34bb2b0300660de9e937486da577cbe4a8",
+    ".claude/commands/bkit-design.md": "d36819717e2f43d284ea7a46901c2a60a93436e64b3b9d5507035ceee9af923e",
+    ".claude/commands/bkit-plan.md": "54feeb864bfcf27b93c286130445b601cd26eb3862f8b9ec9626972468b7b243",
+    ".claude/commands/bkit-ship.md": "201e76812d6cdb1a39393b7427bf0bb9d867dacc213bd6c6c918ad0198b3adc7",
     ".claude/agents/bkit-build-challenge-1.md": "4eab91762fe2fb690892ae75af9e0439a4a4520c5a4071d3839bee1829a2b173",
     ".claude/agents/bkit-build-challenge-2.md": "6f7b896b717f2cc234ea47ede17e985c75b0b8e95e2c96a9e34913c9384a82ca",
     ".claude/agents/bkit-build-install-skills.md": "6d65634076820e9c41d3764e27c8fe495f7fc496e893af83835af7781b529a7e",
@@ -44,11 +44,11 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "73709aceb5e80f5715a0dcba275f07ed3edb84fe02950230b6632fcfc18c4890",
     ".claude/agents/bkit-utility-update-documentation.md": "5006f0bf8be7ca10d048fa6050e2f71dc9b82c445c150b0bd64e8884d4bf6897",
     ".cursor/commands/bkit-auto.md": "215bd415eed342587ed2af5c15de381cf58831f461ff8d7bcea76cb0dfd88728",
-    ".cursor/commands/bkit-build.md": "25f999115ed14675e072b0ad21e84af5b4e9a3a2810f788f2942b03272bac455",
-    ".cursor/commands/bkit-debug.md": "85c5632293be488e4480cecdc27f2f54dc96a344d0f6f07ed3bbc16c9d7389ee",
-    ".cursor/commands/bkit-design.md": "10c7377729d9527f482006ed1bfa0d9334a8df133d30d8e101efa6be718b0289",
-    ".cursor/commands/bkit-plan.md": "9d1f9f49ddc4f93428543756f34e5bef438126ae51111d9f14af7486704f29fe",
-    ".cursor/commands/bkit-ship.md": "cdb0128999be1145ad35d88cc47c16327e0298050c058d13b1c14a8b857f81a1",
+    ".cursor/commands/bkit-build.md": "9a6cc248091397ae9aeb0c2fc09daf0737afcac318f303233cfe296215a054b2",
+    ".cursor/commands/bkit-debug.md": "86d58c29f72164a2c07b43b1ce42571831fabf3f5db180b49d6d876b4d6ac89f",
+    ".cursor/commands/bkit-design.md": "cc4014c6420fcf13776201cdbbd34170e7e14bb4afe92491972a9301999ab029",
+    ".cursor/commands/bkit-plan.md": "a776004546f184073b52f28090a2bf9fd785e49f838261e76e71996a3e4fe68a",
+    ".cursor/commands/bkit-ship.md": "09bec2a491adda4749d448b06e8e00705d0aaba35e063db38d638f6c9a1866c0",
     ".cursor/agents/bkit-build-challenge-1.md": "c52a20530920be2bd1abb117ab5063070fe08302be6993a9bd28013ed55384ab",
     ".cursor/agents/bkit-build-challenge-2.md": "838c3337198af1a4186323a314af61569a2828eee625e1a0ce65a964b2e3a04a",
     ".cursor/agents/bkit-build-install-skills.md": "86c9dac72b0840286f969ec6220a3728445b58de76b1f760c4fdd34a9b8b7e03",
@@ -102,11 +102,11 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "7429e7ff947702372741829224dd41d3725dd715414c1205cb8c7b1f1366f743",
     ".opencode/agents/bkit-utility-update-documentation.md": "25176686d7b31c9e340500d769dcfbeac72f5c53e92c873803d9bca502c63780",
     ".opencode/commands/bkit-auto.md": "a4cc36d6b9e87eb9c9f54d7d8cc98ed5ca0ca2d1ccf77d4747b33dd165dc472e",
-    ".opencode/commands/bkit-build.md": "93001fd635cbb2632ae66a6c435f604c5eaec0e79c6a5e8a387400edab723099",
-    ".opencode/commands/bkit-debug.md": "9263ea7b1703183a798bb31f55b82c300e242e9c7b7dd4c0ab264d40585ca332",
-    ".opencode/commands/bkit-design.md": "3fc1de0a6d95124921f59561434e2697af073d260bf359230f4614c124310b9c",
-    ".opencode/commands/bkit-plan.md": "10b0cd877bf505bd2fcfbd5ac3d52713d01ccf1eae1d1aba23ce897301756426",
-    ".opencode/commands/bkit-ship.md": "91b8f374697f1c12e48476df4fa632bb8fba8a1aa2b1ca9effac3c3b50f47658",
+    ".opencode/commands/bkit-build.md": "3353b5e5f138c61aaf6250900eb018a2aaefc292537d1f6d8abb488798a03dc1",
+    ".opencode/commands/bkit-debug.md": "493bfcc2b60c0d1db29b12d0b1f8f2326b133bfeb907abd61e3ba7f3bdec6c4e",
+    ".opencode/commands/bkit-design.md": "d9c726540b50caea071bd134104d101efadb66bace6d2afc2aee1197a42d52f7",
+    ".opencode/commands/bkit-plan.md": "0bb9ffa7b1ed957b7a311522e9859427a9a8fefe91cedd826af5b9603da832be",
+    ".opencode/commands/bkit-ship.md": "447d584636066e1b014e28e66d4515a789cb83adce4b867a2a395ad5b71a9b80",
     ".claude/agents/bkit-design-spike.md": "47fede25ba25470d49ba009832523698afe28740e4f18ec2772338054ab7cb92",
     ".cursor/agents/bkit-design-spike.md": "7808bfdb02322b6ea2f73f9a6fc6fdc7ad6f08fc662deb7a3f41a3e678f97532",
     ".opencode/agents/bkit-design-spike.md": "c8933f415cd3cadeb5721e47f5e900cebfa01a664a783fdfd2414bcbb363cfcb",
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 6e2ef9975..f3e1b2624 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -75,7 +75,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 **Single-write contract:** Every step before the flush creates no git object. Never route back to the **Failure Path**: log the error and continue to the flush.
 
-1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, only the last 20 lines of the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
+1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, the failed command's last 20 stderr lines — drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, `--stderr-file` also for a non-shell failure; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
    "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md" --stderr-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-stderr.md" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index ed123666b..6ecc9a124 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -74,7 +74,7 @@ Ship Feature — Autonomous merge and archive
 
 **Single-write contract:** Every step before the flush creates no git object. Never route back to the **Failure Path**: log the error and continue to the flush.
 
-1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, only the last 20 lines of the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
+1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, the failed command's last 20 stderr lines — drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, `--stderr-file` also for a non-shell failure; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
    "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md" --stderr-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-stderr.md" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 4c0e0a03f..4e6750940 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -78,7 +78,7 @@ $ARGUMENTS
 
 **Single-write contract:** Every step before the flush creates no git object. Never route back to the **Failure Path**: log the error and continue to the flush.
 
-1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, only the last 20 lines of the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
+1. Write the error text with the file tool to `{LOG_DIR}/{workflow}-error.md` (ship: `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md`). `{STDERR_FILE}` = `{LOG_DIR}/{workflow}-stderr.md`, the failed command's last 20 stderr lines — drop `--error-file` and `--stderr-file` while `{WORKTREE_PATH}` is not held, `--stderr-file` also for a non-shell failure; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
    "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md" --stderr-file="{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-stderr.md" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
