diff --git a/.claude/hooks/bkit-preflight.sh b/.claude/hooks/bkit-preflight.sh
index dac12161c..eeea42ac4 100755
--- a/.claude/hooks/bkit-preflight.sh
+++ b/.claude/hooks/bkit-preflight.sh
@@ -1,12 +1,12 @@
 #!/usr/bin/env bash
 # bkit-preflight.sh — Claude Code SessionStart hook
 #
-# Validates Linear issue state before any background/cloud session does bkit
+# Validates tracker issue state before any issue-carrying session does bkit
 # work. Refuses the session if the issue isn't approved for automation.
 #
-# Trigger:  LINEAR_ISSUE_ID env var present (proxy for non-IDE session).
-# Guards:   `bkit:auto` label present; issue state not in {Cancelled, Done}.
-# Setup:    See `.bkit/README.md` § Linear setup.
+# Trigger:  LINEAR_ISSUE_ID or GITHUB_ISSUE_ID env var present.
+# Guards:   `bkit:auto` label present; issue state not terminal by category.
+# Setup:    See `.bkit/README.md` for the configured tracker.
 #
 # IMPORTANT — Claude Code SessionStart hooks CANNOT block the session: any
 # non-zero exit is treated as non-blocking (docs.claude.com/docs/en/hooks.md).
@@ -14,9 +14,10 @@
 # HARD STOP instruction) AND `stderr` (visible to the user). Exit code is
 # informational only.
 #
-# bkit generates the managed block at install: the Linear guard is shared with the
-# Cursor hook (bkit's `hooks/preflight-linear.sh`); the trigger, the brew check
-# and the output shape below are Claude's own.
+# bkit generates the managed block at install: the tracker guard and the rules-read
+# advisory are shared with the Cursor hook (bkit's `hooks/preflight-tracker.sh` and
+# `hooks/preflight-rules.sh`); the trigger, the brew check and the output shape below
+# are Claude's own.
 
 # <!-- bkit:start -->
 
diff --git a/.cursor/hooks/bkit-preflight.sh b/.cursor/hooks/bkit-preflight.sh
index 643fe3be0..5f14c3cb3 100755
--- a/.cursor/hooks/bkit-preflight.sh
+++ b/.cursor/hooks/bkit-preflight.sh
@@ -1,20 +1,21 @@
 #!/usr/bin/env bash
 # bkit-preflight.sh — Cursor Cloud sessionStart hook (failClosed: true)
 #
-# Validates Linear issue state before any background/cloud session does bkit
+# Validates tracker issue state before any background/cloud session does bkit
 # work. Refuses the session if the issue isn't approved for automation.
 #
 # Trigger:  is_background_agent === true (received via stdin JSON).
-# Guards:   `bkit:auto` label present; issue state not in {Cancelled, Done}.
-# Setup:    See `.bkit/README.md` § Linear setup.
+# Guards:   `bkit:auto` label present; issue state not terminal by category.
+# Setup:    See `.bkit/README.md` for the configured tracker.
 #
 # Cursor honours non-zero exit as a hard stop (failClosed: true) — non-zero
 # blocks the session before the agent starts. Failures are also surfaced via
 # `additional_context` so the user sees the reason.
 #
-# bkit generates the managed block at install: the Linear guard is shared with the
-# Claude hook (bkit's `hooks/preflight-linear.sh`); the trigger, the runtime
-# marker and the output shape below are Cursor's own.
+# bkit generates the managed block at install: the tracker guard and the rules-read
+# advisory are shared with the Claude hook (bkit's `hooks/preflight-tracker.sh` and
+# `hooks/preflight-rules.sh`); the trigger, the runtime marker and the output shape
+# below are Cursor's own.
 
 # <!-- bkit:start -->
 
