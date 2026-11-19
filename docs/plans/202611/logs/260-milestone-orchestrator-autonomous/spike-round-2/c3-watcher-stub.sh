#!/bin/sh
# C3 probe: a watcher stub. Every N seconds it logs its own ancestor chain
# (pid, ppid, start time, command) and the signals it receives, to LOG.
# Usage: sh c3-watcher-stub.sh <log> <interval-s> <rounds>
LOG=$1; INT=${2:-5}; ROUNDS=${3:-6}
trap 'echo "$(date +%T) watcher $$ got SIGHUP" >> "$LOG"' HUP
trap 'echo "$(date +%T) watcher $$ got SIGTERM" >> "$LOG"; exit 143' TERM
trap 'echo "$(date +%T) watcher $$ got SIGINT" >> "$LOG"; exit 130' INT
i=0
while [ "$i" -lt "$ROUNDS" ]; do
  echo "--- $(date +%T) round $i watcher pid $$ ---" >> "$LOG"
  p=$$
  while [ -n "$p" ] && [ "$p" -gt 0 ]; do
    ps -o pid=,ppid=,lstart=,command= -p "$p" | cut -c1-150 >> "$LOG"
    p=$(ps -o ppid= -p "$p" | tr -d ' ')
  done
  i=$((i + 1))
  sleep "$INT"
done
echo "$(date +%T) watcher $$ finished normally" >> "$LOG"
