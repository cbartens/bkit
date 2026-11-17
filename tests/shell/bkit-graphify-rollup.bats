#!/usr/bin/env bats
# tests/shell/bkit-graphify-rollup.bats — scripts/graphify/bkit-graphify-rollup.py writes
# docs/capabilities.md between its two marker lines and nowhere else.
#
# Each test runs the real script on an empty graph with a one-row register, in a scratch
# folder that holds the shipped capabilities starter at its installed path.
# Run: bats tests/shell/bkit-graphify-rollup.bats

ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
ROLLUP="$ROOT/scripts/graphify/bkit-graphify-rollup.py"
STARTER="$ROOT/.bkit/templates/docs/capabilities.md"

setup() {
  WORK="$(mktemp -d)"
  cd "$WORK"
  mkdir -p .bkit/templates/docs docs
  cp "$STARTER" .bkit/templates/docs/capabilities.md
  echo '{"nodes":[],"links":[]}' > graph.json
  cat > overlay.json <<'JSON'
{"overlay":{},"rows":[{"lane":"data","capability":"Example","owner":"src/a.ts","pattern":"x(","status":"one","bypasses":0,"sites":1,"issue":""}]}
JSON
}

teardown() {
  cd /
  rm -rf "$WORK"
}

rollup() {
  python3 "$ROLLUP" graph.json --capabilities-doc docs/capabilities.md --min-weight 12 --overlay overlay.json
}

# The doc with every line between the two marker lines dropped.
outside_markers() {
  awk '/^<!-- graphify:start -->$/ {print; skip=1; next} /^<!-- graphify:end -->$/ {skip=0} !skip' "$1"
}

@test "a run replaces the text between the markers and leaves the text outside them unchanged" {
  cp "$STARTER" docs/capabilities.md
  printf '\nA note the project wrote.\n' >> docs/capabilities.md
  outside_markers docs/capabilities.md > before.txt
  run rollup
  [ "$status" -eq 0 ]
  outside_markers docs/capabilities.md > after.txt
  diff before.txt after.txt
  grep -q '^> Generated document\.' docs/capabilities.md
  grep -q '^| data | Example | `src/a.ts` |' docs/capabilities.md
  run grep -q '^Not built\.' docs/capabilities.md
  [ "$status" -ne 0 ]
  cp docs/capabilities.md first.md
  run rollup
  [ "$status" -eq 0 ]
  diff first.md docs/capabilities.md
}

@test "a doc without markers that the script wrote whole is rewritten into the new layout with its overrides kept" {
  cat > docs/capabilities.md <<'DOC'
# Capabilities

> [!CAUTION]
> **Purpose:** One row per app capability.
>
> **Rules:**
>
> - Generated — do not edit. `pnpm bkit:graph:refresh` rewrites this file.

## Register

Old rows.

## Overrides

<!-- overrides:start -->

```json
{
  "rename": { "src/a": "Alpha" },
  "note": {},
  "hide_nodes": [],
  "hide_nodes_why": {},
  "hide_edges": [],
  "group": {}
}
```

<!-- overrides:end -->
DOC
  run rollup
  [ "$status" -eq 0 ]
  grep -q '"rename": { "src/a": "Alpha" }' docs/capabilities.md
  run grep -q 'Old rows\.' docs/capabilities.md
  [ "$status" -ne 0 ]
  run grep -q '^> Generated document\.' docs/capabilities.md
  [ "$status" -ne 0 ]
  [ "$(head -1 docs/capabilities.md)" = "# Capabilities" ]
  # Outside the markers the doc is the starter from its title on, bar the overrides.
  outside_markers docs/capabilities.md | grep -v '"rename"' > got.txt
  sed -n '/^# Capabilities$/,$p' "$STARTER" > starter-body.md
  outside_markers starter-body.md | grep -v '"rename"' > want.txt
  diff want.txt got.txt
}

@test "an absent doc is built from the starter" {
  run rollup
  [ "$status" -eq 0 ]
  [ "$(head -1 docs/capabilities.md)" = "# Capabilities" ]
  grep -q '^## Open questions$' docs/capabilities.md
  grep -q '^| data | Example | `src/a.ts` |' docs/capabilities.md
}

@test "a doc with one marker stops the run and is not written" {
  grep -v '^<!-- graphify:end -->$' "$STARTER" > docs/capabilities.md
  cp docs/capabilities.md before.md
  run rollup
  [ "$status" -ne 0 ]
  [[ "$output" == *"Refusing to overwrite"* ]]
  diff before.md docs/capabilities.md
}

@test "a doc with the markers out of order stops the run and is not written" {
  sed -e 's/^<!-- graphify:start -->$/@@end@@/' -e 's/^<!-- graphify:end -->$/<!-- graphify:start -->/' \
    -e 's/^@@end@@$/<!-- graphify:end -->/' "$STARTER" > docs/capabilities.md
  cp docs/capabilities.md before.md
  run rollup
  [ "$status" -ne 0 ]
  [[ "$output" == *"Refusing to overwrite"* ]]
  diff before.md docs/capabilities.md
}

@test "a hand-written doc without markers stops the run and is not written" {
  printf '# Capabilities\n\nNotes the project wrote.\n' > docs/capabilities.md
  cp docs/capabilities.md before.md
  run rollup
  [ "$status" -ne 0 ]
  [[ "$output" == *"Refusing to overwrite"* ]]
  diff before.md docs/capabilities.md
}

@test "a marker named inside a sentence is not taken for a marker line" {
  cp "$STARTER" docs/capabilities.md
  printf '\nKeep the `<!-- graphify:start -->` line where it is.\n' >> docs/capabilities.md
  run rollup
  [ "$status" -eq 0 ]
  tail -1 docs/capabilities.md | grep -q 'Keep the `<!-- graphify:start -->` line where it is\.'
}
