# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.

#!/usr/bin/env python3
"""Link user-facing routes to the backend capabilities they reach.

Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON the
capabilities doc renders as its route layer.

    bkit-graph-surface.py <graph.json> <surface-out.json> [--quiet]

THE CHAIN:

  apps/web/src/app/[locale]/items/page.tsx   filesystem — one page.tsx per route
    -> api.v1.items  |  "/api/v1/items"   literal at the CALLING SYMBOL
    -> v1.ts .route("/v1/items", itemsRouter) + its import line
    -> routes/items.ts imports @scope/services/items
    -> services/items, already a lane in the register

Replace `apps/web`, `apps/mobile`, `packages/api`, and `@scope` with this repo.

Hop 1 is a literal scan (the static import graph does NOT cross the HTTP
boundary). Both call styles are read — Hono's typed RPC (`api.v1.items.$get`)
and raw URL strings (`/api/v1/items`).

ATTRIBUTION IS SYMBOL-LEVEL, NOT FILE-LEVEL. Whole-line comments are stripped,
and a literal counts for the symbol whose line range contains it. graphify gives
one line per symbol, so a symbol's range runs to the next symbol's line in the
same file.
"""

import argparse
import collections
import json
import os
import re

ap = argparse.ArgumentParser()
ap.add_argument("graph_json")
ap.add_argument("surface_out")
ap.add_argument("--quiet", action="store_true")
ap.add_argument("--max-hops", type=int, default=3)
ap.add_argument("--external-rules")
args = ap.parse_args()

raw = json.load(open(args.graph_json))
ns = {n["id"]: n for n in raw["nodes"]}
WALKABLE = {"calls", "imports_from", "imports", "references", "method", "indirect_call"}

# --- symbol line ranges -----------------------------------------------------
lines_by_file = collections.defaultdict(list)
for n in raw["nodes"]:
    f, loc = str(n.get("source_file") or ""), str(n.get("source_location") or "")
    m = re.fullmatch(r"L(\d+)", loc)
    if f and m:
        lines_by_file[f].append((int(m.group(1)), n["id"]))
ranges = {}
for f, entries in lines_by_file.items():
    entries.sort()
    for i, (ln, nid) in enumerate(entries):
        end = entries[i + 1][0] if i + 1 < len(entries) else 10**9
        ranges[nid] = (ln, end)

# --- endpoint literals, comments stripped -----------------------------------
EP = re.compile(r"/api/v1/([a-z][a-z-]*)|[\"'`]/v1/([a-z][a-z-]*)|\bapi\.v1\.([a-z][a-zA-Z-]*)|\bapi\.v1\[[\"']([a-z][a-z-]*)")
_file_eps = {}


def endpoints_in(path):
    """Endpoint segment -> sorted line numbers, for one file, comments removed."""
    if path not in _file_eps:
        out = collections.defaultdict(list)
        if os.path.exists(path):
            for i, line in enumerate(open(path, encoding="utf-8", errors="ignore"), 1):
                s = line.strip()
                if s.startswith(("//", "*", "/*")):
                    continue
                for m in EP.finditer(line):
                    out[next(g for g in m.groups() if g)].append(i)
        _file_eps[path] = dict(out)
    return _file_eps[path]


# --- hop 1: walk out of each route file, symbol by symbol -------------------
out_edges = collections.defaultdict(list)
for l in raw["links"]:
    if l.get("relation") in WALKABLE:
        out_edges[l["source"]].append(l["target"])

IN_APP = ("apps/web", "apps/mobile", "packages/ui")
ROUTE_GLOBS = (
    (re.compile(r"^apps/web/src/app/(.+)/page\.tsx$"), "web"),
    (re.compile(r"^apps/mobile/app/(.+)\.tsx$"), "native"),
)


def route_label(path):
    for rx, platform in ROUTE_GLOBS:
        m = rx.match(path)
        if m:
            r = "/" + m.group(1)
            r = re.sub(r"^/\[locale\]", "", r) or "/"
            # __tests__/ and *.test.tsx sit inside apps/mobile/app, so the route
            # glob matches them; they are not routes a user can navigate to.
            if (r.endswith(("/_layout", ".test")) or "/+" in r or "__tests__" in r
                    or "/_" in r):
                return None, None
            return r, platform
    return None, None


routes = {}
for path in sorted({str(n.get("source_file") or "") for n in raw["nodes"]}):
    label, platform = route_label(path)
    if label:
        routes[path] = (label, platform)

surface = {}
for path, (label, platform) in routes.items():
    seeds = [nid for nid, (f, _) in
             ((nid, (str(ns[nid].get("source_file") or ""), 0)) for nid in ns)
             if f == path]
    seen, frontier = set(seeds), set(seeds)
    for _ in range(args.max_hops):
        nxt = set()
        for nid in frontier:
            for t in out_edges.get(nid, ()):
                tf = str(ns.get(t, {}).get("source_file") or "")
                if t not in seen and tf.startswith(IN_APP):
                    seen.add(t)
                    nxt.add(t)
        frontier = nxt
    hits = collections.defaultdict(set)
    for nid in seen:
        f = str(ns.get(nid, {}).get("source_file") or "")
        lo, hi = ranges.get(nid, (0, 0))
        for seg, lns in endpoints_in(f).items():
            for ln in lns:
                if lo <= ln < hi:
                    hits[seg].add(f"{f}:{ln}")
    if hits:
        surface[label] = {"platform": platform, "file": path,
                          "endpoints": {k: sorted(v) for k, v in sorted(hits.items())}}

# --- hops 2 and 3: endpoint -> router file -> service domains ---------------
v1 = open("packages/api/src/v1.ts", encoding="utf-8").read() if os.path.exists("packages/api/src/v1.ts") else ""
router_file = dict(re.findall(r'import\s*\{\s*(\w+)\s*\}\s*from\s*"\./routes/([\w-]+)\.js"', v1))
seg_router = collections.defaultdict(set)
for seg, var in re.findall(r'\.route\("/v1/([a-z][a-z-]*)",\s*(\w+)\)', v1):
    if var in router_file:
        seg_router[seg].add(router_file[var])

seg_services = {}
for seg, files in seg_router.items():
    doms = set()
    for rf in files:
        p = f"packages/api/src/routes/{rf}.ts"
        if os.path.exists(p):
            doms |= set(re.findall(r"@cbartens/services/([a-z-]+)", open(p, encoding="utf-8").read()))
    seg_services[seg] = {"routers": sorted(files), "services": sorted(doms)}



# --- hop 4: backend modules -> external providers ---------------------------
# SDK-first, URL-fallback: a provider is matched by SDK import, else discovered from
# a URL hostname even when no rule names it. Test code's callers are dropped by
# bkit-graphify-rollup.py's is_test_code, and social links and example hosts by
# hide_nodes in the doc, not here.
BY_MODULE = lambda p: "/".join(p.split("/")[:-1][:4]) or p.split("/")[0]
SKIP_DIR = {"node_modules", "dist", ".next", ".turbo", "coverage", "build", ".git"}
SKIP_FILE = (".test.", ".spec.", ".d.ts", ".config.")
URL = re.compile(r"https://([a-z0-9.-]+\.[a-z]{2,})(/[A-Za-z0-9/_.:-]*)?")


def scan_external(rules_path):
    providers = json.load(open(rules_path))["providers"] if rules_path and os.path.exists(rules_path) else []
    host_owner, sdk_owner, env_owner = {}, {}, {}
    for r in providers:
        for h in r.get("hosts", []):
            host_owner[h] = r["provider"]
        for m in r.get("sdk", []):
            sdk_owner[m] = r["provider"]
        for e in r.get("env", []):
            env_owner[e] = r["provider"]
    found = collections.defaultdict(lambda: {"endpoints": collections.defaultdict(set),
                                             "callers": set(), "via": set()})
    for root in ("packages", "apps"):
        for dp, dn, fn in os.walk(root):
            dn[:] = [d for d in dn if d not in SKIP_DIR]
            if "/e2e" in dp or "/tests" in dp or "__tests__" in dp or "__fixtures__" in dp:
                continue
            for f in fn:
                if not f.endswith((".ts", ".tsx")) or any(x in f for x in SKIP_FILE):
                    continue
                path = os.path.join(dp, f)
                mod = BY_MODULE(path)
                for i, line in enumerate(open(path, encoding="utf-8", errors="ignore"), 1):
                    if line.strip().startswith(("//", "*", "/*")):
                        continue
                    for spec, prov in sdk_owner.items():
                        if f'from "{spec}"' in line:
                            found[prov]["callers"].add(mod)
                            found[prov]["via"].add("sdk")
                    for var, prov in env_owner.items():
                        if f"env.{var}" in line:
                            found[prov]["callers"].add(mod)
                            found[prov]["via"].add("env")
                    for m in URL.finditer(line):
                        host, sub = m.group(1), (m.group(2) or "/").rstrip("/") or "/"
                        prov = host_owner.get(host, host)
                        found[prov]["endpoints"][sub].add(f"{path}:{i}")
                        found[prov]["callers"].add(mod)
                        found[prov]["via"].add("url")
    return {p: {"endpoints": {k: sorted(v) for k, v in sorted(d["endpoints"].items())},
                "callers": sorted(d["callers"]), "via": sorted(d["via"])}
            for p, d in sorted(found.items())}


EXTERNAL = scan_external(args.external_rules)

json.dump({"routes": surface, "endpoints": seg_services, "external": EXTERNAL},
          open(args.surface_out, "w"), indent=1)

if not args.quiet:
    for label, d in sorted(surface.items()):
        svc = sorted({s for seg in d["endpoints"] for s in seg_services.get(seg, {}).get("services", [])})
        print(f"[surface] {d['platform']:6} {label:32} {','.join(sorted(d['endpoints'])) or '—'}"
              + (f"  ->  {','.join(svc)}" if svc else ""))
print(f"[surface] {len(surface)} routes, {len(seg_services)} endpoints, "
      f"{len(EXTERNAL)} external providers -> {args.surface_out}")
