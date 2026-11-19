#!/bin/sh
# Print the ancestor chain of a pid (default: this shell) with start times.
p=${1:-$$}
while [ -n "$p" ] && [ "$p" -gt 0 ]; do
  ps -o pid=,ppid=,lstart=,command= -p "$p" | cut -c1-230
  p=$(ps -o ppid= -p "$p" | tr -d ' ')
  [ "$p" = "0" ] && break
done
