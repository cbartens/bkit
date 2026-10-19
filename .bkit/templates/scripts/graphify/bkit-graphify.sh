#!/usr/bin/env bash
# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.
# Code graph (graphify) — always local, never an LLM call. See .bkit/templates.md.
#
# graphify has no persistent "no LLM" setting (.graphifyrc accepts only
# viz_node_limit; there is no GRAPHIFY_CODE_ONLY env var), so LLM-off is set per
# invocation here.
#
# Two independent guards:
#   1. --code-only / --no-label — the two flags that reach a model at all
#      (docs/PDFs/images on extract, community naming on cluster).
#   2. Unsetting every key graphify auto-detects a backend from, so a key in
#      the caller's shell cannot silently pick one anyway.
set -euo pipefail

# Output directory. graphify defaults to graphify-out/ at the repo root; this
# wrapper puts it under docs/.
# GRAPHIFY_OUT (graphify/paths.py:26) is the supported override and takes a
# relative path, not just a name. Every command honours it — extract,
# cluster-only, update, tree AND the read commands, because their `--graph`
# default is paths.default_graph_json(). .envrc exports the same value so a
# bare `graphify affected "<symbol>"` typed by hand finds the graph too.
#
# $OUT holds RAW graph data only — graph.json, manifest.json, cache/ and
# graphify's own dotfile sidecars. graphify writes that layout and owns it.
# Everything DERIVED lands in $REPORTS. graphify has no flag for that split:
# cluster-only always writes GRAPH_REPORT.md (and graph.html) next to
# graph.json, so those two are moved after the run. The rest is written
# straight into $REPORTS.
OUT="${GRAPHIFY_OUT:-docs/graphify-out}"
REPORTS="$OUT/reports"

# Report filenames — RENAME HERE AND NOWHERE ELSE. Each is referenced once
# below, so a new name takes effect on the next run with no other edit. These
# are all derived artifacts: renaming one never invalidates the graph, and the
# old file is not cleaned up automatically — delete it or run `pnpm graph:clean`.
R_REPORT="graph-report.md"                # cluster-only's own report, moved here
R_TREE="graph-tree.html"                  # collapsible folder tree
R_FULL_GRAPHML="graph.graphml"            # whole graph for Gephi
R_PACKAGES_HTML="graph-packages.html"     # ~24-node architecture view
R_MODULES_HTML="graph-modules.html"       # ~134-node subsystem view
R_PACKAGES_GRAPHML="graph-packages.graphml"
R_MODULES_GRAPHML="graph-modules.graphml"
R_PACKAGES_MMD="graph-packages.mmd"       # ~15-node Mermaid architecture view
R_MODULES_MMD="graph-modules.mmd"         # ~51-node Mermaid subsystem view
R_OVERLAY="graph-drift.json"              # computed capability status, feeds the .mmd
# The one TRACKED output. Everything else under $REPORTS is gitignored scratch;
# this is the register the repo reads, so it lives in docs/ and is committed.
CAPABILITIES_DOC="docs/capabilities.md"
R_SCOPED_PREFIX="scoped-"                 # + the subtree path, slashes to dashes

# Cross-group edges below this weight are dropped from the Mermaid views only —
# the HTML and GraphML views stay complete.
MMD_MIN_WEIGHT="${MMD_MIN_WEIGHT:-12}"

# The two derived-view programs. They import networkx / graphify, so they run
# under graphify's bundled interpreter (see graphify_python below), never the
# system python.
ROLLUP_PY="scripts/graphify/bkit-graphify-rollup.py"
GRAPHML_PY="scripts/graphify/bkit-graphify-graphml.py"
# Drift status: a LITERAL-pattern scan, not a graph query. Runs on system python
# (stdlib only) and writes the overlay the Mermaid views paint from.
DRIFT_PY="scripts/graphify/bkit-graph-drift.py"
DRIFT_RULES="scripts/graphify/bkit-graph-drift-rules.json"
# Route -> endpoint -> service join. Needs the graph (symbol-level attribution) AND
# the source tree (the endpoint literal), so it runs after the graph is built.
SURFACE_PY="scripts/graphify/bkit-graph-surface.py"
R_SURFACE="graph-surface.json"
# Writes the imports graphify cannot resolve back INTO graph.json, so the read
# commands (affected/god-nodes/explain/path/query) see them too, not just our
# own checks. Resolver lives in graph_imports.py; this is its only writer.
REPAIR_PY="scripts/graphify/bkit-graph-repair.py"
# Modules that do work when imported. Detection is a SOURCE scan; the blast radius
# is graph.json's transitive inbound imports.
EAGER_PY="scripts/graphify/bkit-graph-eager.py"
EAGER_RULES="scripts/graphify/bkit-graph-eager-rules.json"
R_EAGER="graph-eager.json"
# Client fetches matched against the routes the app serves. A SOURCE scan: a request
# URL is a STRING inside a template literal, never an edge in graph.json. The
# register carries its findings.
REACH_MJS="scripts/ci/guards/assert-routes-reachable.mjs"
R_REACH="graph-reachability.json"

usage() {
  cat <<'EOF'
Usage: pnpm graph[:clean|:update|:rollup|:refresh|:check|:graphml|:tree|:scoped]

  graph           Full repo: extract + cluster. ~2 min, 0 tokens.
  graph:clean     Same, but deletes the output dir first. REQUIRED after any
                  tsconfig `paths` change — `--force` re-reads source files but
                  NOT the module-resolution cache, so a graph built after an
                  alias edit will silently keep the old, unresolved edges.
  graph:update    Re-extract changed files only, then recluster.
  graph:check     Rebuild from THIS tree and fail if the tracked register
                  docs/capabilities.md is not what a rebuild produces. Writes
                  nothing tracked. Reads uncommitted edits too — `check-at`
                  below does not.
  graph:refresh   Rebuild the register from a clean checkout of HEAD and copy
                  it over docs/capabilities.md. The fix for a red gate. Commit it.
  check-at <rev>  `check` in a throwaway checkout of <rev>. The pre-push gate
                  runs it for every push to dev; CI runs `check` on every push
                  to dev.
  spec            Print the pinned graphify release (pip spec).
  graph:rollup    Collapse the symbol graph into a package view (~24 nodes, the
                  architecture) and a module view (~133 nodes, the subsystems),
                  as interactive HTML. Edge weight is the number of underlying
                  symbol edges. Open these INSTEAD of the full graph; 9.8K nodes
                  is a database, not a picture.
  graph:graphml   OPT-IN, for Gephi / yEd only — nothing else produces GraphML.
                  Writes all three views: the whole graph plus the two rollups.
                  The CLI has no --graphml flag (it exists only on the /graphify
                  skill, which this repo does not install), so the whole-graph
                  export calls graphify's own to_graphml() through its bundled
                  interpreter.
  graph:tree      Collapsible folder tree with search and an outbound-edge
                  inspector.
  graph:scoped    One subtree with a browsable graph.html.
                  Path defaults to apps/web/src; pass another as $2.

Two directories, both gitignored and both rebuilt from source:

  <out>/          RAW graph data — graph.json, manifest.json, cache/. graphify
                  owns this layout; the read commands (affected, god-nodes,
                  explain, path, query) all resolve <out>/graph.json.
  <out>/reports/  Every DERIVED view. Safe to delete wholesale; `pnpm graph`
                  plus the view command that made it rebuilds any of it.

A whole-repo graph.html is never kept — 8.3 MB rendering ~9.8k nodes as a
hairball. Every run deletes it. Use the rollup HTMLs to click around, and Gephi
on the GraphML only for metrics.
EOF
  echo "  <out> = $OUT/   (override with GRAPHIFY_OUT)"
  echo
}

# Every credential graphify probes for backend auto-detect.
NOKEYS=(env -u ANTHROPIC_API_KEY -u AZURE_OPENAI_API_KEY -u DEEPSEEK_API_KEY
        -u GEMINI_API_KEY -u GOOGLE_API_KEY -u GRAPHIFY_API_KEY
        -u MOONSHOT_API_KEY -u OLLAMA_API_KEY -u OPENAI_API_KEY
        -u AWS_ACCESS_KEY_ID -u AWS_PROFILE)

run_local() { "${NOKEYS[@]}" GRAPHIFY_OUT="$OUT" graphify "$@"; }

# Rollup and scoped runs render into a throwaway directory and move the finished
# artifact into $REPORTS. Those sub-runs keep graphify's DEFAULT output name, so
# the scratch layout is always <scratch>/graphify-out/ no matter where $OUT
# points.
run_scratch() { "${NOKEYS[@]}" GRAPHIFY_OUT=graphify-out graphify "$@"; }

# graphify ships its own interpreter next to the CLI; that is the only python
# with networkx and graphify importable.
# Returns the path on stdout. `exit` here would only kill the command
# substitution's subshell and expand to an empty command, so it returns non-zero
# instead and every caller uses `gpy=$(graphify_python) || exit 1`.
graphify_python() {
  local p
  p=$(command -v graphify)
  p="$(dirname "$(readlink -f "$p" 2>/dev/null || echo "$p")")/python"
  if [ ! -x "$p" ]; then
    echo "[graph] cannot find graphify's interpreter next to the CLI" >&2
    return 1
  fi
  printf '%s\n' "$p"
}

require_graph() {
  [ -f "$OUT/graph.json" ] || { echo "[graph] no $OUT/graph.json — run 'pnpm graph' first" >&2; exit 1; }
}

# The ONE graphify release the register is built and judged with — here, in the pre-push
# gate and in CI, which installs `$(bash scripts/graphify/bkit-graphify.sh spec)`. Another
# release can draw different edges, and a register built on it is drift no one else can
# reproduce. PyPI distribution is `graphifyy`; the CLI it exposes is `graphify`.
# renovate: datasource=pypi depName=graphifyy
GRAPHIFY_SPEC="graphifyy[sql]==0.9.50"
if [ "${1:-}" = "spec" ]; then
  printf '%s\n' "$GRAPHIFY_SPEC"
  exit 0
fi

if ! command -v graphify >/dev/null 2>&1; then
  echo "[graph] graphify not found. Install: brew install uv && uv tool install '$GRAPHIFY_SPEC'" >&2
  echo "[graph] If it is installed, ~/.local/bin is not on PATH — run: uv tool update-shell" >&2
  exit 1
fi
case "${1:-build}" in
  check | check-at | rollup | register | refresh)
    have=$(graphify --version 2>/dev/null | awk '{print $2}')
    if [ "$have" != "${GRAPHIFY_SPEC##*==}" ]; then
      echo "[graph] graphify ${have:-?} is installed; the register is built with ${GRAPHIFY_SPEC##*==}." >&2
      echo "[graph] Install that release: uv tool install --force '$GRAPHIFY_SPEC'" >&2
      exit 1
    fi
    ;;
esac

# cluster-only writes GRAPH_REPORT.md next to graph.json with no flag to
# redirect it, so move it into $REPORTS afterwards under $R_REPORT.
#
# The whole-repo graph.html is DELETED, never kept. --no-viz below stops
# cluster-only writing one, but `graphify update` regenerates it on its own
# ("regenerated missing or stale graph.html") before this function reclusters, so
# the rm removes it. Use graph:rollup for something clickable, or Gephi on the
# GraphML for metrics.
cluster() {
  run_local cluster-only . --no-label --no-viz
  mkdir -p "$REPORTS"
  if [ -f "$OUT/GRAPH_REPORT.md" ]; then mv "$OUT/GRAPH_REPORT.md" "$REPORTS/$R_REPORT"; fi
  rm -f "$OUT/graph.html" "$REPORTS/graph.html"
}

# Put back the imports graphify cannot resolve — a `.js` specifier never reaches
# a `.tsx` file, and workspace subpaths through an `exports` map resolve to
# nothing. ~540 edges here, 16% of relative imports. Upstream Graphify-Labs/
# graphify#3486 and #3487, open on v8.
#
# Runs BEFORE cluster, so communities, the god-node ranking and the cycle list in
# graph-report.md are computed from the repaired graph. Runs on every command that
# WRITES graph.json (`graphify update` rewrites the file without the injection).
# Idempotent — it strips its own previous edges before re-adding.
repair() {
  python3 "$REPAIR_PY" "$OUT/graph.json"
}

# The derived-view pipeline that ends in the capability register. $1 is the doc
# to write: `rollup` passes the TRACKED docs/capabilities.md, `check` passes a
# throwaway copy. Everything else written here ($REPORTS/*.json, the two .mmd)
# is gitignored scratch in both modes, so one code path serves both.
#
# `check`'s copy must be SEEDED from the tracked doc. bkit-graphify-rollup.py reads
# the hand-maintained Overrides block back out of the very file it is about to
# overwrite (read_overrides(args.capabilities_doc)), so writing into an empty
# path silently drops every override and reports the loss as drift.
capabilities() {
  local doc="$1"
  require_graph
  mkdir -p "$REPORTS"
  local rpy
  rpy=$(graphify_python) || exit 1
  python3 "$DRIFT_PY" "$DRIFT_RULES" "$REPORTS/$R_OVERLAY"
  python3 "$SURFACE_PY" "$OUT/graph.json" "$REPORTS/$R_SURFACE" \
    --external-rules scripts/graphify/bkit-graph-external-rules.json --quiet
  python3 "$EAGER_PY" "$OUT/graph.json" "$REPORTS/$R_EAGER" --rules "$EAGER_RULES"
  # Exit 1 means "found unreachable paths", which is the normal state while any
  # are open — it must not abort the register that reports them. Anything above 1
  # is the scan itself failing (an unfollowable router variable, a missing v1.ts)
  # and MUST stop the run, or the register silently loses the whole section.
  # Pinned by assert-routes-reachable.test.mjs.
  # Skip the section when scripts/ci/guards/assert-routes-reachable.mjs is absent.
  REACH_ARGS=()
  if [ -f "$REACH_MJS" ]; then
    set +e
    node "$REACH_MJS" --json > "$REPORTS/$R_REACH"
    local reach_rc=$?
    set -e
    if [ "$reach_rc" -gt 1 ]; then
      echo "[graph] $REACH_MJS failed (exit $reach_rc) — see the error above" >&2
      exit 1
    fi
    REACH_ARGS=(--reachability "$REPORTS/$R_REACH")
  else
    echo "[graph] $REACH_MJS absent — route-reachability section skipped" >&2
  fi
  "$rpy" "$ROLLUP_PY" "$OUT/graph.json" --build-dir "$REPORTS/.build" \
    --packages-mermaid "$REPORTS/$R_PACKAGES_MMD" \
    --modules-mermaid "$REPORTS/$R_MODULES_MMD" \
    --capabilities-doc "$doc" --surface "$REPORTS/$R_SURFACE" \
    --eager "$REPORTS/$R_EAGER" "${REACH_ARGS[@]}" \
    --min-weight "$MMD_MIN_WEIGHT" --overlay "$REPORTS/$R_OVERLAY"
}

# Strip the three provenance stamps (one header line, two `%% Generated ... from
# <sha>` comments) so `check` compares CONTENT: the graph is built at HEAD, a
# committed register at the PARENT of the commit carrying it. Stamp staleness is
# the freshness warning in .husky/pre-push.
strip_stamps() {
  sed -E -e 's/(Diagrams from `graph\.json` @ `)[0-9a-f]+(`)/\1<sha>\2/' \
         -e 's/(Generated by bkit-graphify-rollup\.py from )[0-9a-f]+/\1<sha>/' "$1"
}

# Run this script's own subcommands in a throwaway checkout of ONE commit, so what they
# build belongs to that commit, not to whatever is uncommitted here — graphify reads the
# working tree. The repo's root node_modules is linked in for the route scan.
# $1 = the commit; the rest are subcommands run in order. $AT_DIR is the checkout.
at_commit() {
  local rev="$1" sha tmp sub
  shift
  sha=$(git rev-parse --verify --quiet "$rev^{commit}") || { echo "[graph] not a commit: $rev" >&2; exit 2; }
  tmp=$(mktemp -d "${TMPDIR:-/tmp}/graph-at-XXXXXX")
  AT_DIR="$tmp/checkout"
  # shellcheck disable=SC2064 # expand now: $tmp is local and gone by the time EXIT fires
  trap "git worktree remove --force '$AT_DIR' >/dev/null 2>&1; rm -rf '$tmp'" EXIT
  git -c core.hooksPath=/dev/null worktree add --detach --quiet "$AT_DIR" "$sha"
  ln -s "$(git rev-parse --show-toplevel)/node_modules" "$AT_DIR/node_modules"
  for sub in "$@"; do
    (cd "$AT_DIR" && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE \
      GRAPHIFY_OUT=docs/graphify-out bash scripts/graphify/bkit-graphify.sh "$sub")
  done
}

case "${1:-build}" in
  build)  run_local extract . --code-only && repair && cluster ;;
  clean)  rm -rf "$OUT" && run_local extract . --code-only && repair && cluster ;;
  rollup)
    capabilities "$CAPABILITIES_DOC"
    for lvl in packages modules; do
      run_scratch cluster-only "$REPORTS/.build/$lvl" --no-label >/dev/null 2>&1 || true
    done
    if [ -f "$REPORTS/.build/packages/graphify-out/graph.html" ]; then
      mv "$REPORTS/.build/packages/graphify-out/graph.html" "$REPORTS/$R_PACKAGES_HTML"
    fi
    if [ -f "$REPORTS/.build/modules/graphify-out/graph.html" ]; then
      mv "$REPORTS/.build/modules/graphify-out/graph.html" "$REPORTS/$R_MODULES_HTML"
    fi
    rm -rf "$REPORTS/.build"
    echo "[graph] interactive (click a node, neighbours highlight):"
    echo "         $REPORTS/$R_PACKAGES_HTML"
    echo "         $REPORTS/$R_MODULES_HTML"
    echo "[graph] capability register (TRACKED — commit it): $CAPABILITIES_DOC"
    echo "[graph] import-time side effects, full list incl. per-site lines: $REPORTS/$R_EAGER"
    echo "[graph] mermaid (paste into mermaid.live, or render per docs/setup.md):"
    echo "         $REPORTS/$R_PACKAGES_MMD"
    echo "         $REPORTS/$R_MODULES_MMD"
    echo "[graph] GraphML for Gephi is opt-in: pnpm graph:graphml"
    ;;
  tree)
    require_graph
    mkdir -p "$REPORTS"
    run_local tree --graph "$OUT/graph.json" \
      --output "$REPORTS/$R_TREE" --root . --label "repo"
    ;;
  graphml)
    require_graph
    mkdir -p "$REPORTS"
    gpy=$(graphify_python) || exit 1
    "$gpy" "$GRAPHML_PY" "$OUT/graph.json" "$REPORTS/$R_FULL_GRAPHML"
    "$gpy" "$ROLLUP_PY" "$OUT/graph.json" \
      --packages-graphml "$REPORTS/$R_PACKAGES_GRAPHML" \
      --modules-graphml "$REPORTS/$R_MODULES_GRAPHML"
    echo "[graph] wrote $REPORTS/$R_FULL_GRAPHML — File > Open in Gephi"
    echo "[graph] rollup views too: $R_PACKAGES_GRAPHML, $R_MODULES_GRAPHML (open these first)"
    ;;
  update) run_local update . && repair && cluster ;;
  check)
    # The gate on every push to dev: `check-at` runs this in a clean checkout of
    # the pushed commit (pre-push), and CI runs it on its own clean checkout.
    # Rebuild the graph from this tree, regenerate the register into a
    # throwaway copy, and fail if it differs from the tracked file. Nothing
    # tracked is written; fix a red with `pnpm graph:refresh` plus a commit.
    #
    # Run by hand, it reads the working tree, not the commit, so uncommitted
    # edits surface here as drift that nobody else can reproduce. After a
    # tsconfig `paths` change run `pnpm graph:clean` first: `update` keeps the
    # stale module-resolution cache and the drift this reports would then be the
    # cache, not the register.
    if [ -n "$(git status --porcelain -- '*.ts' '*.tsx' 2>/dev/null)" ]; then
      echo "[graph] WARNING: uncommitted .ts/.tsx edits — graphify reads the WORKING TREE," >&2
      echo "[graph]          so any diff below may be your own unstaged work, not committed drift." >&2
    fi
    if [ -f "$OUT/graph.json" ]; then run_local update .; else run_local extract . --code-only; fi
    repair
    cluster
    scratch_dir=$(mktemp -d)
    trap 'rm -rf "$scratch_dir"' EXIT
    fresh="$scratch_dir/capabilities.md"
    cp "$CAPABILITIES_DOC" "$fresh"
    capabilities "$fresh" >/dev/null
    rm -rf "$REPORTS/.build"
    if diff -u <(strip_stamps "$CAPABILITIES_DOC") <(strip_stamps "$fresh") \
         --label "$CAPABILITIES_DOC (committed)" --label "rebuilt from $(git rev-parse --short HEAD)"; then
      echo "[graph] $CAPABILITIES_DOC matches a rebuild at $(git rev-parse --short HEAD)."
    else
      echo "[graph] DRIFT: $CAPABILITIES_DOC is not what this tree produces (diff above)." >&2
      echo "[graph] Fix:   pnpm graph:refresh && git add $CAPABILITIES_DOC && git commit" >&2
      exit 1
    fi
    ;;
  register)
    # The tracked register alone — `rollup` without its HTML views (minutes of rendering
    # `refresh` does not need). Needs a built graph.
    capabilities "$CAPABILITIES_DOC"
    ;;
  check-at)
    # `check` for one commit, from a clean checkout of it — what the pre-push gate runs for
    # every push to dev. Default HEAD.
    at_commit "${2:-HEAD}" check
    ;;
  refresh)
    # Rebuild the register from a clean checkout of HEAD and copy it over the tracked file
    # here. The fix for a `check` / `check-at` red when this tree has uncommitted edits that
    # `graph:update && graph:rollup` would bake in. Commit the result.
    at_commit HEAD build register
    cp "$AT_DIR/$CAPABILITIES_DOC" "$CAPABILITIES_DOC"
    echo "[graph] $CAPABILITIES_DOC rebuilt from $(git rev-parse --short HEAD) — commit it"
    ;;
  scoped)
    target="${2:-apps/web/src}"
    [ -d "$target" ] || { echo "[graph] no such directory: $target" >&2; exit 1; }
    name="${target//\//-}"
    scratch="$REPORTS/.build/scoped-$name"
    rm -rf "$scratch"
    run_scratch extract "./$target" --code-only --out "$scratch"
    # graph.html is written by the clustering pass, NOT by extract — without this
    # the scoped run produces only graph.json and the promised HTML never exists.
    # No --no-viz here: a subtree renders.
    run_scratch cluster-only "$scratch" --no-label
    mkdir -p "$REPORTS/$R_SCOPED_PREFIX$name"
    mv "$scratch"/graphify-out/* "$REPORTS/$R_SCOPED_PREFIX$name/" 2>/dev/null || true
    rm -rf "$REPORTS/.build"
    echo "[graph] open $REPORTS/$R_SCOPED_PREFIX$name/graph.html"
    ;;
  -h | --help | help) usage ;;
  *) usage >&2; exit 1 ;;
esac
