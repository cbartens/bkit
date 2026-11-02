#!/usr/bin/env bats
# tests/graphify-refresh.bats — scripts/graphify/bkit-graphify.sh refresh against a stub `graphify`.
#
# refresh runs the build in a throwaway checkout. The scratch repo stages its own stand-in
# scripts/graphify/bkit-graphify.sh, which that checkout runs: `build` does nothing, and
# `register` writes src.txt into docs/capabilities.md as its packages diagram, so the register
# shows which tree was built. The real bkit-graph-embed.py then copies that diagram into the
# README, the one doc bkit's GRAPH_EMBED_DOCS lists.
# Run: bats tests/graphify-refresh.bats

GRAPHIFY="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/scripts/graphify/bkit-graphify.sh"
EMBED="$(dirname "$GRAPHIFY")/bkit-graph-embed.py"

setup() {
  WORK="$(mktemp -d)"
  REPO="$WORK/repo"
  mkdir -p "$WORK/bin" "$REPO/scripts/graphify" "$REPO/docs"
  local spec
  spec="$(bash "$GRAPHIFY" spec)"
  printf '#!/bin/sh\necho "graphify %s"\n' "${spec##*==}" > "$WORK/bin/graphify"
  chmod +x "$WORK/bin/graphify"
  export PATH="$WORK/bin:$PATH"
  unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
  cd "$REPO"
  git init --quiet
  git config user.name test
  git config user.email test@example.invalid
  cat > scripts/graphify/bkit-graphify.sh <<'STANDIN'
#!/usr/bin/env bash
case "$1" in
  build) ;;
  register)
    body=$(cat src.txt) || exit 1
    printf '## Architecture — packages\n\n```mermaid\n%s\n```\n' "$body" > docs/capabilities.md
    ;;
esac
STANDIN
  cp "$EMBED" scripts/graphify/bkit-graph-embed.py
  printf '# Readme\n\n<!-- graph:packages:start -->\n<!-- graph:packages:end -->\n\nTail\n' > README.md
  echo committed > src.txt
  echo stale > docs/capabilities.md
  git add -A
  git commit --quiet -m init
}

# The diagram body between the README markers, fences and markers dropped.
readme_diagram() {
  sed -n '/^```mermaid$/,/^```$/p' README.md | sed '1d;$d'
}

teardown() {
  cd /
  rm -rf "$WORK"
}

@test "refresh builds the register from the staged files, not HEAD or unstaged edits" {
  echo staged > src.txt
  git add src.txt
  echo unstaged > src.txt
  run bash "$GRAPHIFY" refresh
  [ "$status" -eq 0 ]
  grep -qx staged docs/capabilities.md
}

@test "refresh rewrites the README copy of the packages diagram from the new register" {
  echo staged > src.txt
  git add src.txt
  run bash "$GRAPHIFY" refresh
  [ "$status" -eq 0 ]
  [ "$(readme_diagram)" = "staged" ]
  [ "$(head -1 README.md)" = "# Readme" ]
  [ "$(tail -1 README.md)" = "Tail" ]
}

@test "refresh drops a file deleted in the index from the build" {
  git rm --quiet src.txt
  run bash "$GRAPHIFY" refresh
  [ "$status" -ne 0 ]
  [ "$(cat docs/capabilities.md)" = "stale" ]
  [ -z "$(readme_diagram)" ]
}
