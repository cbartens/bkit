# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.

#!/usr/bin/env python3
"""Collapse the whole-symbol code graph into two readable views.

Called by `pnpm graph:rollup` and `pnpm graph:graphml` (scripts/graphify/
bkit-graphify.sh) through GRAPHIFY'S OWN interpreter, not the system python — it
imports networkx, which is a graphify dependency and is not installed repo-wide.

    bkit-graphify-rollup.py <graph.json> [--build-dir DIR]
                                    [--packages-graphml P] [--modules-graphml M]

Both outputs are opt-in, and the two commands ask for different ones:

  --build-dir       a graphify-format graph.json per level, which the caller
                    renders to interactive HTML via `graphify cluster-only`,
                    then moves and deletes. This is `pnpm graph:rollup`.
  --*-graphml       the same two views as GraphML for Gephi. Only `pnpm
                    graph:graphml` asks for these — GraphML is not produced by
                    default.

Node attrs: symbols, files, internal_edges. Edge attrs: weight (number of
underlying symbol edges) and relations (top three kinds, e.g.
`calls:115,imports_from:107`).
"""

import argparse
import collections
import hashlib
import json
import os
import re

ap = argparse.ArgumentParser()
ap.add_argument("graph_json")
ap.add_argument("--build-dir")
ap.add_argument("--packages-graphml")
ap.add_argument("--modules-graphml")
ap.add_argument("--packages-mermaid")
ap.add_argument("--modules-mermaid")
ap.add_argument("--capabilities-doc")
ap.add_argument("--surface")
ap.add_argument("--eager")
ap.add_argument("--reachability")
ap.add_argument("--min-weight", type=int, default=0,
                help="drop cross-group edges lighter than this (0 = keep all)")
ap.add_argument("--overlay",
                help="JSON {path_prefix: [class, note]} painting drift status onto "
                     "matching nodes. class is one of split|bypassed|gap.")
args = ap.parse_args()

raw = json.load(open(args.graph_json))
ns = {n["id"]: n for n in raw["nodes"]}
_REPAIRED_EDGES = None  # set after graph_imports is importable, below
SRC = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql")

# graphify misses two whole classes of import: a `.js` specifier is never
# resolved to a `.tsx` file, and workspace subpaths through an `exports` map are
# not resolved at all. bkit-graph-repair.py writes them into graph.json during
# `pnpm graph`, so this reads them like any other edge and does NOT add them on
# read. A graph lacking any of them gets a warning, and the numbers below are
# understated.
# bkit-graph-imports.py is hyphenated, which `import` cannot spell, so it is loaded
# by path.
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location(
    "graph_imports",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "bkit-graph-imports.py"))
graph_imports = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(graph_imports)

_REPAIRED_EDGES = graph_imports.warn_if_unrepaired(raw, "graph")


def sf(i):
    return str(ns.get(i, {}).get("source_file") or "")


# Manifest/config endpoints are dropped: package.json stays in the CORPUS for
# resolution, but package.json -> package.json edges are not drawn.
def is_src(p):
    return p.endswith(SRC)


# Test code is IN the graph (.graphifyignore keeps it, so `graphify affected` sees test
# callers, and graph.json, GraphML and the HTML views all carry it) and OUT of the Mermaid
# pictures. Wider than bkit-graph-drift.py's test SURFACE, which partitions the register's
# counts; this one only decides what a picture draws.
TEST_DIRS = {"e2e", "__tests__", "__mocks__", "__fixtures__", "__snapshots__", "fixtures",
             "test", "tests", "testing", "test-utils"}
TEST_FILE = re.compile(r"\.(?:test|spec)\.[^/]+$|(?:^|/)(?:vitest|jest|playwright)\.(?:config|setup|workspace)[^/]*$")


def is_test_code(p):
    """True for a test file, test-runner config, or any path under a test folder.

    Takes a file path or a folder key (`apps/web/e2e/helpers`), so the same check
    filters graph nodes, drift rows and the route chain's caller modules."""
    return any(seg in TEST_DIRS for seg in p.split("/")) or bool(TEST_FILE.search(p))


def by_package(p):
    m = re.match(r"(\.bkit/[^/]+|scripts/[^/]+)/", p)
    return m.group(1) if m else None


def by_module(p):
    # .bkit/core/engine: one module per file.
    if p.startswith(".bkit/core/engine/"):
        return re.sub(r"\.[^./]+$", "", p)
    return "/".join(p.split("/")[:-1][:4]) or p.split("/")[0]


def collapse(keyfn, include_tests=True):
    """Group every source symbol by keyfn(path), and sum the edges between groups.

    One pass, three consumers (GraphML, graphify-JSON, Mermaid) — they differ only
    in how they serialise the same counters. Mermaid passes include_tests=False:
    a test file's symbols and edges then count toward no box, so a folder holding
    `x.ts` and `x.test.ts` is drawn with `x.ts` alone.
    """
    keep = (lambda p: is_src(p)) if include_tests else (lambda p: is_src(p) and not is_test_code(p))
    symbols, files, internal = collections.Counter(), collections.defaultdict(set), collections.Counter()
    for n in raw["nodes"]:
        p = str(n.get("source_file") or "")
        if not keep(p):
            continue
        k = keyfn(p)
        if k:
            symbols[k] += 1
            files[k].add(p)
    edges, rels = collections.Counter(), collections.defaultdict(collections.Counter)
    for l in raw["links"]:
        a, b = sf(l["source"]), sf(l["target"])
        if not (keep(a) and keep(b)):
            continue
        ka, kb = keyfn(a), keyfn(b)
        if not (ka and kb):
            continue
        if ka == kb:
            internal[ka] += 1
        else:
            edges[(ka, kb)] += 1
            rels[(ka, kb)][l.get("relation")] += 1
    return symbols, files, internal, edges, rels


def rollup(keyfn, out, level):
    # Only the GraphML path needs networkx; --mermaid runs under system python.
    import networkx as nx

    symbols, files, internal, edges, rels = collapse(keyfn)
    G = nx.DiGraph()
    for k in symbols:
        G.add_node(k, label=k, level=level, symbols=symbols[k],
                   files=len(files[k]), internal_edges=internal[k])
    for (a, b), w in edges.items():
        G.add_edge(a, b, weight=w,
                   relations=",".join(f"{r}:{c}" for r, c in rels[(a, b)].most_common(3)))
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    nx.write_graphml(G, out)
    print(f"[graph] {out}: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")


def as_graphify_json(keyfn, out_dir):
    """Write the rollup in graphify's own node-link format.

    `graphify cluster-only` then renders it with the SAME interactive viz as the
    full graph — click a node, its neighbours highlight and everything else dims.
    """
    sym, files = collections.Counter(), collections.defaultdict(set)
    for n in raw["nodes"]:
        p = str(n.get("source_file") or "")
        k = keyfn(p) if is_src(p) else None
        if k:
            sym[k] += 1
            files[k].add(p)
    ew, er = collections.Counter(), collections.defaultdict(collections.Counter)
    for l in raw["links"]:
        a, b = sf(l["source"]), sf(l["target"])
        if not (is_src(a) and is_src(b)):
            continue
        ka, kb = keyfn(a), keyfn(b)
        if ka and kb and ka != kb:
            ew[(ka, kb)] += 1
            er[(ka, kb)][l.get("relation")] += 1
    groups = sorted(sym)
    payload = {
        "directed": True, "multigraph": False, "graph": {}, "hyperedges": [],
        "nodes": [{"id": g, "label": g, "community": i,
                   "community_name": g.split("/")[0], "source_file": g,
                   "source_location": f"{len(files[g])} files, {sym[g]} symbols",
                   "file_type": "code", "norm_label": g,
                   "_callable": False, "_origin": "rollup"}
                  for i, g in enumerate(groups)],
        "links": [{"source": a, "target": b, "relation": "imports",
                   "weight": float(w), "confidence": "EXTRACTED",
                   "confidence_score": 1.0, "source_file": a,
                   "source_location": f"weight {w}",
                   "context": ",".join(f"{r}:{c}" for r, c in er[(a, b)].most_common(3))}
                  for (a, b), w in ew.items()],
    }
    # cluster-only reads <dir>/graphify-out/graph.json; the caller runs it with
    # GRAPHIFY_OUT pinned to that default so this layout holds wherever the real
    # output dir points.
    os.makedirs(f"{out_dir}/graphify-out", exist_ok=True)
    json.dump(payload, open(f"{out_dir}/graphify-out/graph.json", "w"))
    return len(payload["nodes"]), len(payload["links"])


# Two visual channels, one meaning each:
#   colour      = the CALLED capability. A node that is called owns a hue, and
#                 every edge INTO it takes that hue, so all the callers of one
#                 capability are one colour and can be followed back at a glance.
#                 A node nothing calls has no hue and stays grey — web and mobile
#                 routes only ever call, so the whole UI column is grey.
#   dash + fill = drift status.
# Hues are mid-tone, legible on both the light and dark Mermaid themes. An undrifted
# node sets no fill, so it keeps the theme's background and text colour.
PALETTE = [
    "#d73a4a", "#0969da", "#1a7f37", "#9a6700", "#8250df", "#bf3989",
    "#0e7490", "#a0522d", "#5b8c00", "#b45309", "#6d28d9", "#be123c",
    "#0f766e", "#4d7c0f", "#a21caf", "#1d4ed8", "#c2410c", "#15803d",
    "#7c3aed", "#b91c1c", "#0891b2", "#65a30d", "#c026d3", "#2563eb",
]
# Drift = a dashed border plus a tinted box; no tint and a solid border means no
# drift. Each drift status has its own dash pattern. The status colours the BOX;
# the label carries no emoji (GitHub renders Mermaid at securityLevel strict).
# Every fill pins its own `color` (INK), so text stays dark on any theme.
INK, PAPER = "#1f2328", "#ffffff"
# ONE colour (amber) for every drift status; the status word and the dash pattern
# tell them apart.
WARN = "#ffcc80"
# `budgeted` is the one marked state that is NOT a warning: solid border, blue tint.
# It still gets a box. Blue, not green: green reads as `one`.
SETTLED = "#cfe2f3"
DRIFT_STYLE = {"split": f"stroke-width:4px,stroke-dasharray:2 3,fill:{WARN},color:{INK}",
               "bypassed": f"stroke-width:4px,stroke-dasharray:8 4,fill:{WARN},color:{INK}",
               "gap": f"stroke-width:3px,stroke-dasharray:1 5,fill:{WARN},color:{INK}",
               "dead": f"stroke-width:4px,stroke-dasharray:3 3,fill:{WARN},color:{INK}",
               "budgeted": f"stroke-width:3px,fill:{SETTLED},color:{INK}",
               "ok": "stroke-width:2px"}


def hue(key):
    """Stable per-node colour. Hashed, not enumerated, so adding a node upstream
    does not recolour every node after it and churn the whole diff."""
    return PALETTE[int(hashlib.md5(key.encode()).hexdigest(), 16) % len(PALETTE)]


GREY = "#8b949e"


def style_lines(nodes, edge_target_keys):
    """`style` per node and `linkStyle` per edge.

    Pass the TARGET key of each edge, in emission order — linkStyle indexes are
    that order, and the colour belongs to the capability being called, not the
    caller. A node that is never a target keeps the grey default.
    """
    called = set(edge_target_keys)
    out = [f"  style {nid} stroke:{hue(key) if key in called else GREY},{DRIFT_STYLE[cls]}"
           for nid, key, cls in nodes]
    for i, tgt_key in enumerate(edge_target_keys):
        out.append(f"  linkStyle {i} stroke:{hue(tgt_key)},stroke-width:2px")
    return out


OV_START, OV_END = "<!-- overrides:start -->", "<!-- overrides:end -->"
# Pasting the whole fenced block (or past its end) into an online editor fails to parse.
VIEW_ONLINE = ("To view online, paste only the lines inside the block below — not the "
               "fence lines — into [mermaid.live](https://mermaid.live/).")
OV_DEFAULT = """{
  "rename": {},
  "note": {},
  "hide_nodes": [],
  "hide_edges": [],
  "group": {}
}"""


def read_overrides(doc_path):
    """Recover the hand-maintained overrides block from the generated doc.

    The doc is otherwise rewritten wholesale, so this one region round-trips:
    read before writing, re-emitted verbatim. It is the only part of
    capabilities.md a human is meant to touch.

    An overrides block with no ```json fence, or with invalid JSON, RAISES; the
    file is never rewritten without its overrides.
    """
    if not doc_path or not os.path.exists(doc_path):
        return json.loads(OV_DEFAULT), OV_DEFAULT
    text = open(doc_path, encoding="utf-8").read()
    if OV_START not in text:
        return json.loads(OV_DEFAULT), OV_DEFAULT
    body = text.split(OV_START, 1)[1].split(OV_END, 1)[0]
    m = re.search(r"```json\n(.*?)```", body, re.S)
    if not m:
        raise SystemExit(f"[graph] {doc_path}: overrides block present but has no ```json fence. "
                         "Refusing to overwrite it; fix or delete the block.")
    try:
        return json.loads(m.group(1)), m.group(1).rstrip()
    except json.JSONDecodeError as e:
        raise SystemExit(f"[graph] {doc_path}: overrides block is not valid JSON ({e}). "
                         "Refusing to overwrite it.")


def resolve_paint(overlay, keys):
    """Map each drift row to exactly ONE node — the most specific one present.

    The overlay keys a row by the owner FILE; a diagram's nodes are directories at
    whatever depth that view uses. Longest matching key wins; ties cannot occur
    because one key is a prefix of the other.
    """
    # Rows landing on one node merge: worst status wins the border, every note is
    # kept, sorted by this rank (worst first). `budgeted` ranks below every warning.
    rank = {"split": 3, "bypassed": 2, "gap": 1, "budgeted": 0}
    acc = collections.defaultdict(list)
    for okey, val in overlay.items():
        best = None
        for k in keys:
            if k == okey or okey.startswith(k.rstrip("/") + "/"):
                if best is None or len(k) > len(best):
                    best = k
        if best is not None:
            acc[best].append(val)
    out = {}
    for k, vals in acc.items():
        cls = max((v[0] for v in vals), key=lambda c: rank.get(c, 0))
        out[k] = (cls, " · ".join(v[1] for v in sorted(vals, key=lambda v: -rank.get(v[0], 0))))
    return out


def as_mermaid(keyfn, out, level, min_weight, overlay):
    """Emit the rollup as a Mermaid flowchart, nested by folder.

    Grouping is the directory tree, not a clustering algorithm — `apps/web` is a
    subgraph, its subfolders are the nodes inside it. Nothing is inferred, so the
    picture cannot disagree with the repo layout.

    GOTCHA, and it costs an afternoon: a subgraph id must never equal a node id.
    by_module("apps/web/x.ts") is "apps/web", which is also its by_package group,
    and Mermaid then fails with "Setting napps_web as parent of napps_web would
    create a cycle" (dagre) or "Referenced shape does not exist" (ELK) — neither
    of which names the collision. Group ids therefore carry a `g` prefix.
    """
    symbols, files, _internal, edges, _rels = collapse(keyfn, include_tests=False)
    overlay = {k: v for k, v in overlay.items() if not is_test_code(k)}
    hidden = set(OVERRIDES.get("hide_nodes", []))
    hidden_edges = {tuple(e) for e in OVERRIDES.get("hide_edges", [])}
    renames = OVERRIDES.get("rename", {})
    extra_notes = OVERRIDES.get("note", {})
    forced = {n: g for g, members in OVERRIDES.get("group", {}).items() for n in members}
    edges = {k: v for k, v in edges.items()
             if v >= min_weight and k not in hidden_edges
             and k[0] not in hidden and k[1] not in hidden}
    keep = ({x for e in edges for x in e} | {k for k in overlay if k in symbols}) - hidden
    sid = lambda k: "n" + re.sub(r"[^a-z0-9]", "_", k.lower())

    resolved = resolve_paint(overlay, keep)

    def paint(k):
        if k in resolved:
            cls, note = resolved[k]
            return cls, "<br/>" + note
        return "ok", ""

    L = ["---", "config:", "  layout: elk", "  flowchart:", "    useMaxWidth: false", "---",
         "flowchart LR",
         f"  %% Generated by bkit-graphify-rollup.py from {raw.get('built_at_commit', '?')} — do not edit"]
    NODES, ELIST = [], []
    def node(k, label, indent):
        cls, note = paint(k)
        label = renames.get(k, label)
        if k in extra_notes:
            note += "<br/>" + extra_notes[k]
        NODES.append((sid(k), k, cls))
        L.append(f'{indent}{sid(k)}["{label}<br/>'
                 f'{symbols[k]} symbols · {len(files[k])} files{note}"]')

    if level == "package":
        # The group IS the node at this level; no subgraph per group.
        for k in sorted(keep):
            node(k, k, "  ")
    else:
        # The folder tree, drawn as nested subgraphs — Mermaid nests them to any
        # depth. A chain of single-child directories (apps > apps/web > .../src)
        # is collapsed into one box titled with the joined path.
        grouped = collections.defaultdict(list)
        for k in sorted(keep):
            if k in forced:
                grouped[forced[k]].append(k)
        for g, members in sorted(grouped.items()):
            L.append(f'  subgraph g{sid("custom-" + g)}["{g}"]')
            for k in members:
                node(k, k, "    ")
            L.append("  end")

        tree = {}
        for k in sorted(keep):
            if k in forced:
                continue
            cur = tree
            for seg in k.split("/"):
                cur = cur.setdefault(seg, {})
            cur["__leaf__"] = k

        def emit(subtree, path, depth, root=False):
            dirs = {k: v for k, v in subtree.items() if k != "__leaf__"}
            leaf = subtree.get("__leaf__")
            pad = "  " * (depth + 1)
            if leaf and not dirs:
                # At the top level the short name has lost its folder, so carry the path.
                node(leaf, path if root else path.split("/")[-1], pad)
                return
            title, inner = path, subtree
            while not inner.get("__leaf__") and len(
                {k: v for k, v in inner.items() if k != "__leaf__"}) == 1:
                only = next(k for k in inner if k != "__leaf__")
                title, inner = f"{title}/{only}", inner[only]
            inner_dirs = {k: v for k, v in inner.items() if k != "__leaf__"}
            if inner.get("__leaf__") and not inner_dirs:
                # A box around exactly one node is the node, drawn twice. Emit the
                # node carrying the full path instead, so it keeps its context.
                node(inner["__leaf__"], title, pad)
                return
            L.append(f'{pad}subgraph g{sid(title)}["{title}"]')
            if inner.get("__leaf__"):
                node(inner["__leaf__"], title.split("/")[-1], pad + "  ")
            for seg, sub in sorted((k, v) for k, v in inner.items() if k != "__leaf__"):
                emit(sub, f"{title}/{seg}", depth + 1)
            L.append(f"{pad}end")

        # The root segment is dropped: an `apps` box around apps/web and apps/mobile
        # only says they are both apps, which their own titles already carry. Every
        # level below it groups things whose short labels do NOT say where they live.
        for seg, sub in sorted(tree.items()):
            if sub.get("__leaf__"):
                node(sub["__leaf__"], seg, "  ")
            for child, sub2 in sorted((k, v) for k, v in sub.items() if k != "__leaf__"):
                emit(sub2, f"{seg}/{child}", 0, root=True)

    for (a, b), w in sorted(edges.items(), key=lambda x: -x[1]):
        ELIST.append(b)
        L.append(f"  {sid(a)} -->|{w}| {sid(b)}")
    L += style_lines(NODES, ELIST)
    # The YAML front matter must be the FIRST thing in the file. A leading %%
    # provenance comment makes Mermaid fail with a bare "Parse error on line 1"
    # that names nothing, so the marker goes inside the graph instead.
    text = "\n".join(L) + "\n"
    if out:
        with open(out, "w") as fh:
            fh.write(text)
    print(f"[graph] {out or 'inline'}: {len(keep)} nodes, {len(edges)} edges "
          f"(level={level}, min-weight={min_weight}, {len(overlay)} drift markers)")
    return text


def chain_block(surface, overlay, reach):
    """UI -> api -> backend -> external, left to right, in one graph.

    Five columns, each a real artifact: the route file, the /api/v1 segment, the
    Hono router that serves it, the service module the router imports, and the
    external provider that module talks to. Drift status is painted on the backend
    column, so a `split` capability is visible in the same picture as the routes
    that depend on it.

    hide_nodes from the doc's overrides block applies here too — a node id is the
    route path, the endpoint segment, the module key, the provider name, or a
    `METHOD /path` string from the reachability scan.
    """
    if not surface:
        return None, 0
    routes, eps = surface.get("routes", {}), surface.get("endpoints", {})
    ext = surface.get("external", {})
    hidden = set(OVERRIDES.get("hide_nodes", []))
    renames = OVERRIDES.get("rename", {})
    sid = lambda pre, k: pre + re.sub(r"[^a-z0-9]", "_", k.lower())

    def paint(k):
        if k in RESOLVED:
            cls, note = RESOLVED[k]
            return cls, "<br/>" + note
        return "ok", ""

    used_eps = sorted({e for r, d in routes.items() if r not in hidden for e in d["endpoints"]}
                      - hidden)
    routers = {seg: eps.get(seg, {}).get("routers", []) for seg in used_eps}
    svc_of = {seg: eps.get(seg, {}).get("services", []) for seg in used_eps}
    # Three sources, all normalised to the SAME module key, or the node cannot
    # take an edge and floats:
    #   1. routers' service imports — the spine of the chain
    #   2. drift owners — kept even when no router reaches them, else 6 of 7 drift
    #      rows vanish and the chain reads clean. The overlay keys them by FILE
    #      (packages/storage/src/admin.ts) while edges join on MODULE, so they get
    #      folded up here; without that they are guaranteed orphans.
    #   3. external callers — a provider whose caller is absent has nothing to
    #      attach to, which is what stranded Upstash, Resend and OpenRouter.
    to_mod = lambda p: "/".join(p.split("/")[:-1][:4]) or p
    reached = {f"packages/services/src/{s}" for v in svc_of.values() for s in v}
    drifted = {to_mod(k) if k.endswith((".ts", ".tsx")) else k
               for k in overlay if k.startswith(("packages/", "apps/"))}
    # Only callers of a SHOWN provider. Pulling in callers of hidden ones adds a
    # module whose only edge was to the thing just hidden — apps/web/src/app and
    # packages/constants/src arrived this way, reaching nothing but the social
    # links in the footer.
    ext_callers = {c for pv in ext if pv not in hidden for c in ext[pv]["callers"]
                   if not is_test_code(c)}
    mods = sorted(m for m in (reached | drifted | ext_callers) - hidden if not is_test_code(m))
    RESOLVED = resolve_paint(overlay, mods)
    # A provider only test code calls is not drawn.
    provs = sorted(p for p in ext if p not in hidden
                   and any(not is_test_code(c) for c in ext[p]["callers"]))

    L = ["---", "config:", "  layout: elk", "  flowchart:", "    useMaxWidth: false", "---",
         "flowchart LR"]
    NODES, ELIST = [], []

    def decl(nid, key, label, cls="ok", indent="    "):
        NODES.append((nid, key, cls))
        L.append(f'{indent}{nid}["{label}"]')

    for platform, title in (("web", "apps/web routes"), ("native", "apps/mobile routes")):
        members = [r for r, d in sorted(routes.items())
                   if d["platform"] == platform and r not in hidden]
        if members:
            L.append(f'  subgraph gp_{platform}["UI — {title}"]')
            for r in members:
                decl(sid("r_", r), r, renames.get(r, r))
            L.append("  end")

    L.append('  subgraph gp_ep["API — /api/v1 endpoints"]')
    for seg in used_eps:
        decl(sid("e_", seg), seg, f"/{seg}")
    L.append("  end")

    # The one class of drift the edges can never show. A request URL is a string
    # inside a template literal, so a call to a route that does not exist has no
    # edge to be missing — it is simply absent, and absence is invisible. Giving
    # it its own column is what makes it visible AS an absence, in the same
    # picture as the endpoints that do resolve.
    dead = [(k, d["sites"], d["refusedBy"])
            for k, d in sorted((reach or {}).get("unreachable", {}).items()) if k not in hidden]
    # A stranded route that is also a dead fetch is drawn once, from the dead list
    # (Mermaid keeps only the second label of a duplicate node id).
    dead_keys = {k for k, _, _ in dead}
    stranded = [r for r in (reach or {}).get("strandedHonoRoutes", [])
                if r not in hidden and r not in dead_keys]
    if dead or stranded:
        L.append('  subgraph gp_dead["UNREACHABLE — 404 at runtime"]')
        for key, sites, refused in dead:
            where = "<br/>".join(sites[:3]) + ("<br/>…" if len(sites) > 3 else "")
            decl(sid("d_", key), key, f"{key}<br/>{refused}<br/>{where}", "dead")
        for r in stranded:
            decl(sid("d_", r), r, f"{r}<br/>registered in Hono, nothing forwards it", "dead")
        L.append("  end")

    all_routers = sorted({rf for v in routers.values() for rf in v} - hidden)
    L.append('  subgraph gp_rt["API — Hono routers"]')
    for rf in all_routers:
        decl(sid("t_", rf), rf, f"routes/{rf}.ts")
    L.append("  end")

    L.append('  subgraph gp_svc["BACKEND — modules"]')
    for m in mods:
        cls, note = paint(m)
        decl(sid("s_", m), m, f"{renames.get(m, m)}{note}", cls)
    L.append("  end")

    if provs:
        L.append('  subgraph gp_ext["EXTERNAL — third-party APIs"]')
        for pv in provs:
            d = ext[pv]
            # Reached by BOTH a client library and a hand-rolled fetch = two
            # mechanisms for one capability. env+sdk is one mechanism (an SDK
            # reading its DSN from env).
            two_ways = "sdk" in d["via"] and "url" in d["via"]
            detail = f"{len(d['endpoints'])} endpoint{'' if len(d['endpoints']) == 1 else 's'}" \
                if d["endpoints"] else "SDK"
            if two_ways:
                detail += " · SDK *and* raw fetch"
            outside = [c for c in d["callers"] if f"packages/services/src/{c.split('/')[-1]}" not in mods
                       and c not in mods]
            extra = f"<br/>also: {', '.join(outside[:2])}" if outside else ""
            decl(sid("x_", pv), pv, f'{pv}<br/>{detail} · via {"+".join(d["via"])}{extra}',
                 "split" if two_ways else "ok")
        L.append("  end")

    drawn = set()

    def edge(a, b, tgt_key):
        if (a, b) not in drawn:
            drawn.add((a, b))
            ELIST.append(tgt_key)
            L.append(f"  {a} --> {b}")

    for r, d in sorted(routes.items()):
        if r in hidden:
            continue
        for seg in d["endpoints"]:
            if seg in used_eps:
                edge(sid("r_", r), sid("e_", seg), seg)
    for seg in used_eps:
        for rf in routers[seg]:
            if rf not in hidden:
                edge(sid("e_", seg), sid("t_", rf), rf)
                for sv in svc_of[seg]:
                    m = f"packages/services/src/{sv}"
                    if m in mods:
                        edge(sid("t_", rf), sid("s_", m), m)
    for pv in provs:
        for c in ext[pv]["callers"]:
            if c in mods:
                edge(sid("s_", c), sid("x_", pv), pv)
    # Only when the call sits in the route file itself. Any other dead call stands
    # alone; the call site in its label says where to look.
    route_of_file = {d["file"]: r for r, d in routes.items() if r not in hidden}
    for key, sites, _ in dead:
        for site in sites:
            r = route_of_file.get(site.rsplit(":", 1)[0])
            if r:
                edge(sid("r_", r), sid("d_", key), key)
    L += style_lines(NODES, ELIST)
    return "\n".join(L), len(routes)


def eager_block(eager):
    """Render bkit-graph-eager.py's findings as the import-time side-effect table.

    Its own section, per file; NOT painted onto the diagrams.
    """
    if not eager:
        return ["_No import-time scan; run with `--eager`._"]
    shown = [r for r in eager["files"] if r["downstream"] >= eager["min_downstream"]]
    hidden = len(eager["files"]) - len(shown)
    sites = sum(len(r["sites"]) for r in eager["files"])
    L = [
        f"{sites} module-scope side effects in {len(eager['files'])} of {eager['scanned']} "
        f"source files. A call here runs on **import**, not on first use, so every file "
        f"downstream pays for it, because under Jest that is a mandatory stub in tests that never "
        f"touch the thing. Sorted by reach.",
        "",
        "<!-- prettier-ignore -->",
        "| File | Evaluates at import | Downstream files | of which tests |",
        "| --- | --- | --- | --- |",
    ]
    L += [f"| `{r['file']}` | {', '.join(f'`{c}`' for c in r['callees'])} | "
          f"{r['downstream']} | {r['downstream_tests']} |" for r in shown]
    if hidden:
        L += ["", f"{hidden} further file{'' if hidden == 1 else 's'} nothing imports, though an "
                  "entrypoint is supposed to do work when it loads. In the JSON report only."]
    if eager.get("not_in_graph"):
        L += ["", f"> [!WARNING]", f"> {eager['not_in_graph']} scanned files are absent from "
              "`graph.json`, so only the column-0 filter applied to them and their downstream "
              "counts are 0. Run `pnpm graph:update` and re-run the rollup."]
    return L


def reachability_block(reach):
    """The register's rows for client calls no route serves.

    Separate from the capability table: one row per dead URL and call site, no owner.
    """
    if reach is None:
        return ["Not scanned; run the rollup with `--reachability`."]
    unreachable = reach.get("unreachable", {})
    stranded = reach.get("strandedHonoRoutes", [])
    n_sites = sum(len(d["sites"]) for d in unreachable.values())
    L = [
        "A request URL is a string inside a template literal, so nothing that reads types can",
        "see that it has no server-side counterpart, because `lint`, `check:type`, `knip` and",
        "`slop:delta` all pass on a path that 404s. This is the one drift class no graph query",
        "finds either: a string is not an edge. Scanned every run by",
        "`scripts/ci/guards/assert-routes-reachable.mjs`; run it alone for the full served-route inventory.",
        "",
        "Two layers have to agree, and a path can fail at either. Next.js decides whether any",
        "handler runs at all, from the directory tree under `apps/web/src/app/api/`. A catch-all",
        "(`[...route]`) forwards its whole subtree into Hono; a static file that calls",
        "`handle(v1ApiRouter)` forwards exactly its own path and nothing below it (`/api/health`,",
        "`/api/config`); a static file with its own handler (`/api/export/file`) never reaches",
        "Hono at all. Hono then routes within what it was handed.",
        "`no Next entry point` means the request never reached Hono, so no mount in `v1.ts` can",
        "fix it; `no handler` means it arrived and Hono had nothing matching.",
        "",
    ]
    if not unreachable:
        L.append("**None.** Every path the clients fetch is served.")
    else:
        L += [
            f"**{len(unreachable)} path{'' if len(unreachable) == 1 else 's'} fetched but not served**"
            f", across {n_sites} call site{'' if n_sites == 1 else 's'}. Each 404s at runtime, though which",
            "may be deliberate. Read this as a list to check, not a list of defects: a stub, a path",
            "served by something outside this repo, or a call behind a flag that never runs all look",
            "identical to the scan.",
            "",
            "<!-- prettier-ignore -->",
            "| Method | Path | Refused by | Call site |",
            "| --- | --- | --- | --- |",
        ]
        for key, d in sorted(unreachable.items()):
            method, path = key.split(" ", 1)
            for site in d["sites"]:
                L.append(f"| `{method}` | `{path}` | `{d['refusedBy']}` | `{site}` |")
    if stranded:
        L += [
            "",
            f"{len(stranded)} Hono route{'' if len(stranded) == 1 else 's'} mounted correctly in "
            "`packages/api/src/v1.ts` and unreachable anyway, because no Next entry point forwards "
            "the path: " + " · ".join(f"`{r}`" for r in stranded)
            + ". Reading either layer on its own says these are fine.",
        ]
    return L


def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_text, eager,
                        reach):
    """Write docs/capabilities.md — the tracked register, wholly generated.

    Source of truth is bkit-graph-drift-rules.json (which capability, which owner,
    which literal marker); every status in the table is derived from live source
    by bkit-graph-drift.py, never typed in. Editing this file by hand loses the edit
    on the next `pnpm graph:rollup`.
    """
    GRAPH_COMMIT = str(raw.get("built_at_commit") or "unknown")
    ROUTES_MMD, n_routes = chain_block(surface, overlay, reach)
    ROUTES_PROSE = (
        f"{n_routes} routes across web and native, each linked to the service domains it reaches. "
        "The static import graph does not cross the HTTP boundary — a page imports `ui` and "
        "`validators`, never `services` — so the link is the endpoint literal at the calling "
        "symbol, followed through `v1.ts` to the router file and its service imports. Attribution "
        "is per symbol, not per file, so a domain named only in a shared helper's comment is not "
        "credited to every page that imports the helper."
    ) if ROUTES_MMD else "No route layer; run with `--surface`."
    order = {"split": 0, "gap": 1, "bypassed": 2, "budgeted": 3, "one": 4, "unchecked": 5}
    rows = sorted(rows, key=lambda r: (order.get(r["status"], 9), r["lane"], r["capability"]))
    counts = collections.Counter(r["status"] for r in rows)
    tally = " · ".join(f"{counts[k]} `{k}`" for k in order if counts.get(k))

    def cell(r):
        owner = f"`{r['owner']}`" if r["owner"] else "—"
        issue = f"#{r['issue']}" if r["issue"] else ""
        sites = f"{r['bypasses']} of {r['sites']}" if r["sites"] else "—"
        # The declared number, next to the measured one. A `budgeted` status is a
        # claim that these two agree, and a reader should not have to take the word
        # for it — nor open the rules file to find out what was promised.
        budget = "—" if r.get("budget") is None else f"`{r['budget']}`"
        if r.get("budget_state") in ("over", "stale"):
            budget += f" {r['budget_state']}"
        # The surface column names the file set a row's counts were taken over.
        return (f"| {r['lane']} | {r['capability']} | {owner} | `{r['pattern']}` | "
                f"`{r.get('surface', 'product')}` | `{r['status']}` | {sites} | {budget} | "
                f"{issue} |")

    D = [
        "# Capabilities",
        "",
        "> [!CAUTION]",
        "> **Purpose:** One row per app capability — owner module, the literal marker that finds",
        "> every use of it, whether anything bypasses the owner. The drift register.",
        ">",
        "> **Rules:**",
        ">",
        "> - Generated — do not edit. `pnpm graph:refresh` rewrites this file.",
        f"> - Source of truth: `{rules_path}`. Every status derived from live source, never typed.",
        "> - Add a capability = add a rule there: capability · lane · owner module · one literal marker.",
        "> - Markers literal, never regex, because `new Ratelimit(` as a regex is an unclosed group matching nothing.",
        "> - Match the mechanism, not the name, because `createClient(` misses an owner that aliases its import.",
        "> - Optional `scope` narrows the tree scanned when a marker means different things per package.",
        "> - Optional `surface`: `product` (default) · `tests` (any `e2e/` dir + every `.test.` / `.spec.` file) · `all`. The two surfaces partition the tree.",
        "> - Optional `budgets`: the exact non-owner site count allowed per scope prefix. Measured == declared everywhere ⇒ `budgeted`, which is not a warning.",
        "> - A budget is not a shrug, because `owned-query-shape-guard.test.ts` reds CI when the count moves either way, and a site landing outside every declared prefix reads as over budget.",
        "> - Test code is in `graph.json` on purpose (`.graphifyignore`) and out of every diagram here by rule (`is_test_code` in `bkit-graphify-rollup.py`): test folders, `.test.` / `.spec.` files, test-runner config. `hide_nodes` below is diagram-only too, for whatever else a picture should not draw.",
        "> - Status computed: no owner → `split`; owner absent → `gap`; owner present, others use marker → `bypassed`; else `one`. A `split|bypassed` at budget → `budgeted`.",
        "> - Externals: `scripts/graphify/bkit-graph-external-rules.json` — `sdk` · `hosts` · `env`. SDK and url = `split`.",
        "> - Import-time scan: `scripts/graphify/bkit-graph-eager-rules.json` lists only what is pure. Unclassified = reported.",
        "> - That scan reads source, not the graph, because module-level initialiser calls are the one construct graphify drops.",
        "> - Nothing discovers an SDK itself; find gaps by listing non-workspace deps.",
        "> - Only the Overrides block is hand-maintained. It round-trips; malformed aborts the run.",
        "> - Colour = called capability, shared by its inbound edges. Grey = never called.",
        "> - Drift = dashed border + one amber box for all four. No ranking: each scan proves a shape, never an intent.",
        "> - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.",
        "> - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.",
        "> - A fetched URL is a STRING, never an edge, because `assert-routes-reachable.mjs` is the only check that sees it.",
        f"> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `{GRAPH_COMMIT[:9]}`; when that differs from HEAD ⇒ run `pnpm graph:update` first.",
        "> - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.",
        "",
        "## Status Vocabulary",
        "",
        "The first four are warnings, not verdicts, and they share one amber in the diagrams. Any",
        "of them can turn out to be deliberate, because the scans prove a shape, never an intent.",
        "",
        "`budgeted` is what one of those four becomes once somebody has decided. The rule declares",
        "the exact number of non-owner sites allowed per scope prefix, its `note` says why that",
        "number is not zero, and `tooling/eslint/tests/owned-query-shape-guard.test.ts` reds CI the",
        "moment the count moves in either direction — too many (a copy appeared) or too few (the",
        "budget is stale). That guard is why the status can be quieter without being a place to",
        "hide work, and it is the half the register itself cannot do: `graphify` is a per-developer",
        "install, absent in CI, so nothing here can turn a build red.",
        "",
        "It still gets a box in the diagrams, drawn solid and blue rather than dashed and amber. A",
        "budgeted bypass is still a bypass; the different drawing stops the picture asking the",
        "same question of it every sweep. Drawn identically, an unbounded marker (18 of 19) and a",
        "marker that is exactly at its declared count — whose note says the copies are probes and",
        "the budget is not meant to reach zero — would make each pass rediscover the settled rows",
        "and re-read the notes to dismiss them.",
        "",
        "<!-- prettier-ignore -->",
        "| Status | Meaning | Action |",
        "| --- | --- | --- |",
        "| `split` | Two or more competing implementations, no single owner | Centralise; file an issue. Or budget it, with the reason in `note` |",
        "| `bypassed` | Owner exists, some callers skip it | Repoint the bypasses. Or budget them, with the reason in `note` |",
        "| `dead` | A client fetches a path nothing serves. A WARNING, though some are deliberate | Check the call site, then delete the call or serve the path |",
        "| `gap` | Designed, not built. No owner yet | Name the owner BEFORE the first caller |",
        "| `budgeted` | A `split` or `bypassed` whose site count is declared, guarded and currently met | None — the CI guard owns it. Lower the budget when a site goes |",
        "| `one` | One implementation, every caller routes through it | None — keep it that way |",
        "",
        "## Register",
        "",
        f"{len(rows)} capabilities: {tally}.",
        "",
        "<!-- prettier-ignore -->",
        "| Lane | Capability | Owner | Marker | Surface | Status | Bypasses | Budget | Issue |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    D += [cell(r) for r in rows]
    D += [
        "",
        "## Unreachable API calls",
        "",
    ] + reachability_block(reach) + [
        "",
        "## Import-time side effects",
        "",
    ] + eager_block(eager) + [
        "",
        "## Overrides",
        "",
        "The one hand-maintained region of this file. Everything else is rewritten on each run;",
        "this block is read back first and re-emitted verbatim. Rename a node, hide a node or an",
        "edge, pin a note, or force nodes into a named group. A malformed block aborts the run",
        "rather than being silently dropped. Every `hide_nodes` entry needs a one-line reason in",
        "`hide_nodes_why`; `tooling/eslint/tests/hide-nodes-registry.test.ts` fails CI otherwise.",
        "",
        OV_START,
        "",
        "```json",
        ov_text,
        "```",
        "",
        OV_END,
        "",
        "## User-facing routes → backend capabilities",
        "",
        ROUTES_PROSE,
        "",
        VIEW_ONLINE,
        "",
        "```mermaid",
        ROUTES_MMD,
        "```",
        "",
        "## Architecture — packages",
        "",
        "Grouped by the folder tree, not by a clustering algorithm. Edge labels are the number of",
        "underlying symbol edges. Drift status is painted onto the owning module.",
        "",
        VIEW_ONLINE,
        "",
        "```mermaid",
        as_mermaid(by_package, None, "package", min_weight, overlay).rstrip(),
        "```",
        "",
        "## Architecture — modules",
        "",
        f"The same graph one level down: `apps/web` is a box, its subfolders are the nodes inside it.",
        f"Cross-group edges lighter than {min_weight} are dropped — see `MMD_MIN_WEIGHT` in",
        "`scripts/graphify/bkit-graphify.sh`.",
        "",
        VIEW_ONLINE,
        "",
        "```mermaid",
        as_mermaid(by_module, None, "module", min_weight, overlay).rstrip(),
        "```",
        "",
    ]
    with open(out, "w") as fh:
        fh.write("\n".join(D))
    print(f"[graph] {out}: {len(rows)} capabilities, {tally}")


OVERRIDES, OV_TEXT = read_overrides(args.capabilities_doc)
OVERLAY, ROWS = {}, []
if args.overlay and os.path.exists(args.overlay):
    _o = json.load(open(args.overlay))
    OVERLAY = {k: tuple(v) for k, v in _o["overlay"].items()}
    ROWS = _o.get("rows", [])

SURFACE = {}
if args.surface and os.path.exists(args.surface):
    SURFACE = json.load(open(args.surface))

EAGER = {}
if args.eager and os.path.exists(args.eager):
    EAGER = json.load(open(args.eager))

REACH = None
if args.reachability and os.path.exists(args.reachability):
    REACH = json.load(open(args.reachability))

if args.capabilities_doc:
    as_capabilities_doc(args.capabilities_doc, max(args.min_weight, 1), OVERLAY, ROWS,
                        _o.get("generated_from", "scripts/graphify/bkit-graph-drift-rules.json"),
                        SURFACE, OV_TEXT, EAGER, REACH)

if args.packages_mermaid:
    as_mermaid(by_package, args.packages_mermaid, "package", max(args.min_weight, 1), OVERLAY)
if args.modules_mermaid:
    as_mermaid(by_module, args.modules_mermaid, "module", max(args.min_weight, 1), OVERLAY)
if args.packages_graphml:
    rollup(by_package, args.packages_graphml, "package")
if args.modules_graphml:
    rollup(by_module, args.modules_graphml, "module")
if args.build_dir:
    n, e = as_graphify_json(by_package, f"{args.build_dir}/packages")
    print(f"[graph] package view: {n} nodes, {e} edges")
    n, e = as_graphify_json(by_module, f"{args.build_dir}/modules")
    print(f"[graph] module view: {n} nodes, {e} edges")
