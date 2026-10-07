# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.

#!/usr/bin/env python3
"""Export the full symbol graph to GraphML for Gephi / yEd.

Called by `pnpm graph:graphml` (scripts/graphify/bkit-graphify.sh) through GRAPHIFY'S
OWN interpreter — it imports graphify itself.

    bkit-graphify-graphml.py <graph.json> <out.graphml>

The graphify CLI has no --graphml flag; that exists only on the /graphify skill,
which this repo deliberately does not install (see docs/setup.md § Code Graph,
"Never run"). Calling to_graphml() directly is the supported way to get the same
file. Community IDs are carried through so Gephi can partition on them.
"""

import collections
import sys
from pathlib import Path

from graphify.affected import load_graph
from graphify.export import to_graphml

GRAPH_JSON, OUT_GRAPHML = sys.argv[1:3]

G = load_graph(Path(GRAPH_JSON))
comms = collections.defaultdict(list)
for nid, attrs in G.nodes(data=True):
    c = attrs.get("community")
    if c is not None:
        comms[c].append(nid)
Path(OUT_GRAPHML).parent.mkdir(parents=True, exist_ok=True)
to_graphml(G, dict(comms), OUT_GRAPHML)
print(f"[graph] {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(comms)} communities")
