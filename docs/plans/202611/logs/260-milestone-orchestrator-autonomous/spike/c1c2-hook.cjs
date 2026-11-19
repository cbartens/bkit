// C1 / C2 probe hook. One driver for Stop and SessionStart, wrapped in settings the way bkit wraps
// its hooks (`test -f … && node … || true`), so a block can come only from JSON on stdout.
// Logs every call to hook-log.jsonl beside this file.
const fs = require("node:fs");
const path = require("node:path");
const dir = __dirname;
let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  const ev = JSON.parse(input || "{}");
  fs.appendFileSync(
    path.join(dir, "hook-log.jsonl"),
    JSON.stringify({
      at: new Date().toISOString(),
      event: ev.hook_event_name,
      source: ev.source,
      stdinSession: ev.session_id,
      envSession: process.env.CLAUDE_CODE_SESSION_ID ?? null,
      stopHookActive: ev.stop_hook_active,
      entrypoint: process.env.CLAUDE_CODE_ENTRYPOINT ?? null,
    }) + "\n",
  );
  if (ev.hook_event_name === "Stop") {
    const live = fs.existsSync(path.join(dir, "watch.pid"));
    if (live && !ev.stop_hook_active) {
      process.stdout.write(
        JSON.stringify({
          decision: "block",
          reason: "PROBE: work is in flight and no watcher runs. Reply with exactly the word WATCHED and end your turn.",
        }),
      );
    }
    return;
  }
  if (ev.hook_event_name === "SessionStart" && (ev.source === "compact" || ev.source === "resume")) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "SessionStart",
          additionalContext: `PROBE-${ev.source.toUpperCase()}-LINE 7741`,
        },
      }),
    );
  }
});
