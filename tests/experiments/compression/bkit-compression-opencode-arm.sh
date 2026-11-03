#!/usr/bin/env bash
# Switch the bkit checkout in the current directory between compression-test arms (opencode).
#
#   bkit-compression-opencode-arm.sh baseline   restore .opencode/opencode.json from git (OpenRouter direct)
#   bkit-compression-opencode-arm.sh caveman    route OpenRouter through caveman  (127.0.0.1:8787) + caveman MCP
#   bkit-compression-opencode-arm.sh headroom   route OpenRouter through Headroom (127.0.0.1:8788) + headroom MCP
#   bkit-compression-opencode-arm.sh status     which arm this checkout is on, which proxies are up
#   bkit-compression-opencode-arm.sh stop       stop both proxies
#
# Only .opencode/opencode.json in this checkout changes, and only while an arm is active; never
# commit it in a non-baseline arm. Proxy logs go to ./tmp/compression/ (gitignored).
# Needs: caveman runtime in ~/.caveman/bin, headroom on PATH, BKIT_OPENROUTER_API_KEY.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG=".opencode/opencode.json"
LOGS="$PWD/tmp/compression"
OPENROUTER="https://openrouter.ai/api/v1"
CAVEMAN_URL="http://127.0.0.1:8787/w/opencode/compat/openrouter/v1"
HEADROOM_URL="http://127.0.0.1:8788/v1"
CAVEMAN_BIN="$HOME/.caveman/bin"
HEADROOM="$(command -v headroom || echo "$HOME/.local/bin/headroom")"

listening() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

wait_for() { # port, name
  for _ in $(seq 1 60); do
    listening "$1" && return 0
    sleep 1
  done
  echo "$2 did not start on :$1; see $LOGS/$2.log" >&2
  exit 1
}

start_caveman() {
  listening 8787 && return 0
  mkdir -p "$LOGS"
  # `caveman start` never declares MCP recovery, and opencode 2 hides MCP tools behind its
  # execute tool, so the proxy would leave every streamed request raw. Declare it here.
  DO_NOT_TRACK=1 CAVEMAN_CACHE_WARM=off CAVEMAN_PROXY_OWNER=start CAVEMAN_LISTEN=127.0.0.1:8787 \
    CAVEMAN_MODE=compress CAVEMAN_RECOVERY=mcp CAVEMAN_CONFIG="$HERE/bkit-compression-caveman.yaml" \
    nohup "$CAVEMAN_BIN/caveman-proxy" >>"$LOGS/caveman.log" 2>&1 &
  wait_for 8787 caveman
}

start_headroom() {
  listening 8788 && return 0
  mkdir -p "$LOGS"
  HEADROOM_BEACON=off DO_NOT_TRACK=1 OPENAI_TARGET_API_URL="$OPENROUTER" \
    nohup "$HEADROOM" proxy --port 8788 --mode cache >>"$LOGS/headroom.log" 2>&1 &
  wait_for 8788 headroom
}

require_checkout() {
  [ -f "$CFG" ] || {
    echo "run from a bkit checkout ($CFG not found)" >&2
    exit 1
  }
  # Refuse to overwrite edits this script did not make.
  if ! git diff --quiet HEAD -- "$CFG"; then
    python3 - "$CFG" <<'EOF' || {
import json, sys
url = json.load(open(sys.argv[1]))["provider"]["openrouter"]["options"]["baseURL"]
sys.exit(0 if url.startswith("http://127.0.0.1:") else 1)
EOF
      echo "$CFG has edits not made by this script; commit or revert them first" >&2
      exit 1
    }
  fi
}

set_arm() { # baseURL, mcp-name, mcp-json
  git checkout HEAD -- "$CFG"
  python3 - "$CFG" "$1" "$2" "$3" <<'EOF'
import json, sys
path, url, name, mcp = sys.argv[1:]
cfg = json.load(open(path))
cfg["provider"]["openrouter"]["options"]["baseURL"] = url
cfg.setdefault("mcp", {})[name] = json.loads(mcp)
with open(path, "w") as fh:
    json.dump(cfg, fh, indent=2)
    fh.write("\n")
EOF
}

current_arm() {
  python3 - "$CFG" <<'EOF'
import json, sys
url = json.load(open(sys.argv[1]))["provider"]["openrouter"]["options"]["baseURL"]
print({"http://127.0.0.1:8787": "caveman", "http://127.0.0.1:8788": "headroom"}.get(url[:21], "baseline"))
EOF
}

case "${1:-}" in
  baseline)
    require_checkout
    git checkout HEAD -- "$CFG"
    ;;
  caveman)
    require_checkout
    start_caveman
    set_arm "$CAVEMAN_URL" caveman "{\"type\":\"local\",\"command\":[\"$CAVEMAN_BIN/caveman-mcp\"],\"enabled\":true}"
    ;;
  headroom)
    require_checkout
    start_headroom
    set_arm "$HEADROOM_URL" headroom "{\"type\":\"local\",\"command\":[\"$HEADROOM\",\"mcp\",\"serve\"],\"enabled\":true,\"environment\":{\"HEADROOM_PROXY_URL\":\"http://127.0.0.1:8788\",\"HEADROOM_BEACON\":\"off\"}}"
    ;;
  status)
    [ -f "$CFG" ] && echo "this checkout: $(current_arm)"
    if listening 8787; then echo "caveman proxy:  up (:8787)"; else echo "caveman proxy:  down"; fi
    if listening 8788; then echo "headroom proxy: up (:8788)"; else echo "headroom proxy: down"; fi
    exit 0
    ;;
  stop)
    for port in 8787 8788; do
      pids=$(lsof -tnP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
      if [ -n "$pids" ]; then
        echo "$pids" | xargs kill && echo "stopped :$port"
      fi
    done
    exit 0
    ;;
  *)
    sed -n '2,12p' "$0"
    exit 2
    ;;
esac

echo "arm: $(current_arm); start a NEW opencode with: opencode --standalone"
