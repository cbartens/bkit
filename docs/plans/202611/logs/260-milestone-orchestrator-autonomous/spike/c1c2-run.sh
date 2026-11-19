#!/bin/sh
# C1 / C2 runner: drives the desktop app's bundled Claude Code binary headless with
# c1c2-settings.json, from the scratch consumer so bkit's own project hooks do not load.
# Inherited desktop-session variables are dropped so the child reports its own identity.
# Usage: run from a desktop Code-tab Bash tool (CLAUDE_CODE_EXECPATH set), after setup-consumer.sh.
S="$(cd "$(dirname "$0")" && pwd)"
cd "$S/consumer" || exit 2
CL() {
  env -u CLAUDECODE -u CLAUDE_CODE_SESSION_ID -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_CHILD_SESSION \
    -u CLAUDE_CODE_MESSAGING_SOCKET -u CLAUDE_CODE_MESSAGING_TOKEN -u CLAUDE_CODE_HOST_SESSION_ID \
    -u CLAUDE_PID -u CLAUDE_CODE_SESSION_ATTENDED \
    "$CLAUDE_CODE_EXECPATH" -p --model haiku --setting-sources project \
    --settings "$S/c1c2-settings.json" --output-format json "$@"
}
P='const o=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(JSON.stringify({result:o.result,session_id:o.session_id,num_turns:o.num_turns,is_error:o.is_error}))'
rm -f "$S/hook-log.jsonl"
echo "=== C1 block (watch.pid present)"; echo 12345 > "$S/watch.pid"
CL "Reply with exactly the word READY." | node -e "$P"; echo "exit=$?"
rm -f "$S/watch.pid"
echo "=== C1 control (no watch.pid)"
CL "Reply with exactly the word READY." | node -e "$P"; echo "exit=$?"
echo "=== C2 run1 startup"
R1=$(CL "Remember the codeword PLUM. Reply OK."); echo "$R1" | node -e "$P"
SID=$(echo "$R1" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0,"utf8")).session_id)')
echo "=== C2 run2 resume + /compact"
CL --resume "$SID" "/compact" | node -e "$P"; echo "exit=$?"
echo "=== C2 run3 resume, ask for probe lines"
CL --resume "$SID" "Quote verbatim every line in your context that starts with PROBE-, one per line. If there is none, reply NONE." | node -e "$P"; echo "exit=$?"
echo "--- hook log"; cat "$S/hook-log.jsonl"
