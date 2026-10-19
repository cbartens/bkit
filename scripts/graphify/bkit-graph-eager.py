# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.

#!/usr/bin/env python3
"""Find modules that do work when they are imported, and count who pays for it.

Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON that
bkit-graphify-rollup.py renders as the import-time side-effect table in
docs/capabilities.md.

    bkit-graph-eager.py <graph.json> <eager-out.json> [--rules R] [--quiet]

THE THING BEING LOOKED FOR. A call that runs at module scope runs on *import*,
not on first use, so every file that transitively imports it pays whatever that
call costs.

DETECTION reads source: graphify emits no node for a call in a module-level
initialiser expression. The DOWNSTREAM count uses graph.json's transitive inbound
imports.

HOW MODULE SCOPE IS DECIDED — a line counts only when both filters hold:

  1. the line is OUTSIDE every callable's line range, taken from graph.json.
     A `_callable` node's range runs from its line to the next symbol's line in
     the same file — the same symbol-attribution trick bkit-graph-surface.py uses.
  2. the line starts at column 0 (Prettier indents anything nested inside a
     callback body, including an anonymous arrow graphify emitted no node for).

A file with no nodes in graph.json at all — newer than the graph, or never
extracted — keeps filter 2 and loses filter 1. Those rows are marked
`in_graph: false` and counted in the summary, never dropped.
"""

import argparse
import collections
import json
import os
import re
import sys

# bkit-graph-imports.py is hyphenated, which `import` cannot spell, so it is loaded
# by path.
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location(
    "graph_imports",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "bkit-graph-imports.py"))
graph_imports = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(graph_imports)

SRC = (".ts", ".tsx")
SKIP_DIR = {"node_modules", "dist", ".next", ".turbo", "coverage", "build", ".git",
            ".worktrees", "docs"}
# *.config.ts and *.setup.ts are harness bootstrap (import-time work is their job).
# `.test-d.` is a type-level test and needs listing separately: it does not
# contain `.test.`, so the ordinary test filter walks straight past it.
# Test files are excluded as sources but kept as downstream consumers: a stub in
# a test is the cost being measured, never a finding in its own right.
SKIP_FILE = (".test.", ".test-d.", ".spec.", ".d.ts", ".config.", ".setup.")
ROOTS = (".bkit/core/engine", "scripts")
IS_TEST = re.compile(r"\.test\.|\.spec\.|/__tests__/|/e2e/")

# Statement keywords and test-harness callables that a bare-call regex would
# otherwise read as a callee. Matched on the FIRST segment, so the modifier
# forms come along for free — `describe.skipIf`, `it.each`, `vi.mock`.
NOT_A_CALLEE = {
    "if", "for", "while", "switch", "catch", "return", "function", "require",
    "import", "export", "typeof", "new", "await", "yield", "delete", "void",
    "describe", "it", "test", "expect", "jest", "vi",
    "beforeAll", "afterAll", "beforeEach", "afterEach",
}

# Either `const x = callee(` / `export const x = new Callee(` or a bare `callee(`
# statement. Anchored at column 0 by the caller, so this never has to model
# indentation itself.
CALL = re.compile(
    r"^(?:export\s+)?(?:const|let|var)\s+[^=;]+=\s*(?:await\s+)?(?:new\s+)?"
    r"([A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*\("
    r"|^(?:await\s+)?(?:new\s+)?([A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*\("
)

# Only these relations are a dependency; `contains` (structural nesting) and
# `indirect_call` (a name-matching heuristic) are not.
DEP_RELATIONS = {"imports", "imports_from", "re_exports", "dynamic_import"}

ap = argparse.ArgumentParser()
ap.add_argument("graph_json")
ap.add_argument("eager_out")
ap.add_argument("--rules", default="scripts/graphify/bkit-graph-eager-rules.json")
ap.add_argument("--quiet", action="store_true")
args = ap.parse_args()

rules = json.load(open(args.rules))
PURE = set(rules.get("pure", []))
PURE_PREFIXES = tuple(rules.get("pure_prefixes", []))
PURE_METHODS = tuple(rules.get("pure_methods", []))
PURE_RECEIVERS = set(rules.get("pure_receivers", []))
MIN_DOWNSTREAM = rules.get("min_downstream", 0)

raw = json.load(open(args.graph_json))
ns = {n["id"]: n for n in raw["nodes"]}


def is_pure(callee):
    return (callee in PURE
            or callee.startswith(PURE_PREFIXES)
            or callee.endswith(PURE_METHODS)
            or callee.rpartition(".")[0] in PURE_RECEIVERS)


# --- module scope, from the graph's symbol table ------------------------------
# Every symbol's line, per file. A callable owns the lines from its own line up
# to the next symbol in that file; the last one owns the rest.
_syms = collections.defaultdict(list)
for n in raw["nodes"]:
    path = str(n.get("source_file") or "")
    m = re.fullmatch(r"L(\d+)", str(n.get("source_location") or ""))
    if path and m:
        _syms[path].append((int(m.group(1)), bool(n.get("_callable"))))

CALLABLE_RANGES = {}
for path, syms in _syms.items():
    syms.sort()
    lines = [ln for ln, _ in syms]
    CALLABLE_RANGES[path] = [
        (ln, lines[i + 1] - 1 if i + 1 < len(lines) else sys.maxsize)
        for i, (ln, callable_) in enumerate(syms) if callable_
    ]


def inside_callable(path, line):
    return any(a <= line <= b for a, b in CALLABLE_RANGES.get(path, ()))


# --- who imports this, transitively -------------------------------------------
# graph.json already carries the imports graphify cannot resolve — a `.js`
# specifier never reaching a `.tsx` file, and workspace subpaths through an
# `exports` map. bkit-graph-repair.py injects them during `pnpm graph`, so they are
# read here like any other edge; warns if graph.json lacks any of them.
INBOUND = collections.defaultdict(set)
for link in raw["links"]:
    if link.get("relation") not in DEP_RELATIONS:
        continue
    src = str(ns.get(link["source"], {}).get("source_file") or "")
    tgt = str(ns.get(link["target"], {}).get("source_file") or "")
    if src and tgt and src != tgt:
        INBOUND[tgt].add(src)

REPAIRED = graph_imports.warn_if_unrepaired(raw, "eager")


def downstream(path):
    """Every file that reaches `path` through imports, at any depth."""
    seen, stack = set(), [path]
    while stack:
        for parent in INBOUND.get(stack.pop(), ()):
            if parent not in seen:
                seen.add(parent)
                stack.append(parent)
    return seen


def sources():
    for root in ROOTS:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR]
            if "/e2e/" in dirpath + "/" or dirpath.endswith("/e2e"):
                continue
            for f in filenames:
                if f.endswith(SRC) and not any(s in f for s in SKIP_FILE):
                    yield os.path.join(dirpath, f)


scanned = ungraphed = 0
files = []
for path in sources():
    scanned += 1
    try:
        text = open(path, encoding="utf-8", errors="ignore").read()
    except OSError:
        continue
    in_graph = path in CALLABLE_RANGES
    ungraphed += not in_graph
    sites = []
    for lineno, line in enumerate(text.split("\n"), 1):
        if not line or line[0] in " \t" or inside_callable(path, lineno):
            continue
        m = CALL.match(line)
        if not m:
            continue
        callee = m.group(1) or m.group(2)
        if callee.partition(".")[0] in NOT_A_CALLEE or is_pure(callee):
            continue
        sites.append({"line": lineno, "callee": callee, "code": line.strip()[:120]})
    if not sites:
        continue
    consumers = downstream(path)
    tests = sorted(c for c in consumers if IS_TEST.search(c))
    files.append({
        "file": path,
        "in_graph": in_graph,
        "callees": sorted({s["callee"] for s in sites}),
        "sites": sites,
        "downstream": len(consumers),
        "downstream_tests": len(tests),
        "tests": tests,
    })

# Worst first: reach is the cost, and the callee count only breaks ties.
files.sort(key=lambda r: (-r["downstream"], -r["downstream_tests"], r["file"]))
total_sites = sum(len(r["sites"]) for r in files)

json.dump({
    "generated_from": args.rules,
    "built_at_commit": raw.get("built_at_commit"),
    "scanned": scanned,
    "not_in_graph": ungraphed,
    "repaired_edges": REPAIRED,
    "min_downstream": MIN_DOWNSTREAM,
    "files": files,
}, open(args.eager_out, "w"), indent=1)

if not args.quiet:
    for r in files[:15]:
        flag = "" if r["in_graph"] else "  (not in graph — weaker filter)"
        print(f"[eager] {r['downstream']:4} downstream ({r['downstream_tests']:3} tests)  "
              f"{r['file']}  {', '.join(r['callees'])}{flag}")
print(f"[eager] {total_sites} module-scope side effects in {len(files)} of {scanned} files "
      f"— {sum(1 for r in files if r['downstream'] >= MIN_DOWNSTREAM)} with "
      f"{MIN_DOWNSTREAM}+ downstream")
print(f"[eager] {REPAIRED} of those edges came from bkit-graph-repair.py — imports "
      f"graphify cannot resolve (.js -> .tsx, workspace exports subpaths)")
if ungraphed:
    print(f"[eager] {ungraphed} scanned files absent from graph.json (column-0 filter only) "
          f"— run 'pnpm graph:update' to close the gap", file=sys.stderr)
print(f"[eager] wrote {args.eager_out}", file=sys.stderr)
