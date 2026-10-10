# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.

#!/usr/bin/env python3
"""Inject the import edges graphify could not resolve back into graph.json.

Called by `pnpm graph`, `:clean` and `:update` (scripts/graphify/bkit-graphify.sh),
between `extract` and `cluster-only`.

    bkit-graph-repair.py <graph.json> [--rules R] [--quiet]

WHY IN THE FILE AND NOT ONLY ON READ. Repairing on read, inside
bkit-graph-eager.py and bkit-graphify-rollup.py, would fix our own checks and the
generated doc but NOT `graphify affected`, `god-nodes`, `explain`, `path` or
`query` — those read graph.json directly, so every hand-typed blast-radius
question would be answered from a graph missing those edges. `affected` is the
one most likely to be trusted in a hurry, and a missing edge looks like a clean
gap. Repairing the file makes graph.json the single source
of truth: the consumers just read it, and call `warn_if_unrepaired` so a
graph built without this step says so rather than quietly understating.

WHY IT SURVIVES. The obvious objection is that `graphify update` rewrites
graph.json and would drop the injection. It does — which is why this runs as a
step of every wrapper command that writes the file, not once by hand. `pnpm
graph*` is the documented entry point (`.bkit/templates.md`) and each of
build / clean / update re-injects at the end of its own run. A raw `graphify
update .` typed outside the wrapper loses them until the next `pnpm graph:update`;
the step is idempotent, so recovering is just re-running it.

ORDER MATTERS: this runs BEFORE clustering, so communities, the god-node
ranking and the cycle list in graph-report.md are all computed from the repaired
graph rather than from the one missing a sixth of its imports.

WHAT IS WRITTEN. One `imports_from` link per recovered file pair, between the
two files' L1 nodes — that is the shape graphify itself uses for a file-to-file
dependency. Each carries `"_origin": "graph-repair"` so it is greppable and
never passes as graphify's own extraction. Edges already present are skipped, so
running twice changes nothing.
"""

import argparse
import collections
import json
import os
import sys

# bkit-graph-imports.py is hyphenated to match its siblings, which `import` cannot
# spell, so it is loaded by path. Four lines of boilerplate bought consistent
# filenames across scripts/graphify.
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location(
    "graph_imports",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "bkit-graph-imports.py"))
graph_imports = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(graph_imports)

DEP_RELATIONS = {"imports", "imports_from", "re_exports", "dynamic_import"}
ORIGIN = "graph-repair"

ap = argparse.ArgumentParser()
ap.add_argument("graph_json")
ap.add_argument("--rules", default="scripts/graphify/bkit-graph-eager-rules.json")
ap.add_argument("--quiet", action="store_true")
args = ap.parse_args()

graph = json.load(open(args.graph_json, encoding="utf-8"))
nodes = {n["id"]: n for n in graph["nodes"]}

# The file-level node is the one graphify anchors at L1. Six files carry more
# than one; first by id wins, deterministically, so a rerun picks the same node.
file_node = {}
for node in sorted(graph["nodes"], key=lambda n: n["id"]):
    path = str(node.get("source_file") or "")
    if path and node.get("source_location") == "L1" and path not in file_node:
        file_node[path] = node["id"]


def path_of(node_id):
    return str(nodes.get(node_id, {}).get("source_file") or "")


# Strip a previous injection FIRST. Computing `existing` before this would see
# last run's edges, skip every candidate as already present, and then delete
# them — leaving the graph worse than an unrepaired one, and only on the second
# run. Order here is load-bearing.
before = len(graph["links"])
graph["links"] = [l for l in graph["links"] if l.get("_origin") != ORIGIN]
removed = before - len(graph["links"])

existing = {(path_of(l["source"]), path_of(l["target"]))
            for l in graph["links"] if l.get("relation") in DEP_RELATIONS}

wanted = graph_imports.resolved_import_edges()
added, skipped_no_node = [], collections.Counter()
for src, dst in sorted(wanted):
    if (src, dst) in existing:
        continue
    if src not in file_node or dst not in file_node:
        # Only happens for a file outside the corpus (a fresh file the graph has
        # not seen). Counted, never silently dropped.
        skipped_no_node["src" if src not in file_node else "dst"] += 1
        continue
    added.append({
        "source": file_node[src], "target": file_node[dst],
        "relation": "imports_from", "_origin": ORIGIN,
        "confidence": "EXTRACTED", "confidence_score": 1.0,
        "context": "import", "source_file": src, "source_location": "L1",
        "weight": 1.0,
    })

graph["links"].extend(added)

# NO top-level marker: a `graph["import_repair"] = {...}` key does not survive
# `cluster-only`, which rewrites graph.json and keeps only the keys it writes
# itself (`built_at_commit` survives because graphify sets it). Measured, not
# assumed. The per-link `_origin` DOES survive, so that is what consumers check
# — see warn_if_unrepaired / repair_state in bkit-graph-imports.py.

tmp = args.graph_json + ".repair.tmp"
with open(tmp, "w", encoding="utf-8") as fh:
    json.dump(graph, fh)
os.replace(tmp, args.graph_json)

if not args.quiet:
    if removed:
        print(f"[repair] dropped {removed} edges from a previous run")
    print(f"[repair] +{len(added)} import edges into {args.graph_json} "
          f"({len(graph['links'])} links total)")
    if skipped_no_node:
        print(f"[repair] {sum(skipped_no_node.values())} skipped, endpoint absent "
              f"from the graph: {dict(skipped_no_node)}", file=sys.stderr)
