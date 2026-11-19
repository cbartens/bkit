#!/bin/sh
# C3 probe, orphan half. Run from a foreground Bash call while a watcher stub
# started by a *background* Bash call is running. It finds that background
# call's own shell (the zsh whose child is MATCH), SIGKILLs only that shell,
# then reports what the watcher's chain looks like afterwards and whether the
# watcher keeps running. It touches no process other than that one shell.
# Usage: sh c3-orphan.sh <match-substring-of-direct-child-of-shell> <log>
MATCH=$1; LOG=$2
child=$(ps -ww -A -o pid=,command= | grep -F -- "$MATCH" | grep -v grep | grep -v 'c3-orphan.sh' | grep -v '/bin/zsh -c' | awk 'NR==1{print $1}')
[ -z "$child" ] && { echo "no process matching $MATCH"; exit 2; }
shell=$(ps -o ppid= -p "$child" | tr -d ' ')
echo "before: child=$child its parent shell=$shell"
ps -o pid=,ppid=,lstart=,command= -p "$shell" | cut -c1-120
case "$(ps -o command= -p "$shell")" in
  */bin/zsh\ -c*) ;;
  *) echo "refusing: parent $shell is not a Bash-tool zsh"; exit 3 ;;
esac
kill -KILL "$shell"; echo "kill -KILL $shell exit=$?"
sleep 7
echo "after 7s: child=$child"
ps -o pid=,ppid=,lstart=,command= -p "$child" | cut -c1-150 || echo "child $child gone"
echo "log tail:"; tail -n 12 "$LOG"
