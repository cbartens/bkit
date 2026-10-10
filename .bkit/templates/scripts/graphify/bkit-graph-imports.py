# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.

"""Recover the import edges graphify does not resolve.

Importable module, not a CLI — underscored so `import graph_imports` works from
the sibling `graph-*.py` scripts, which are standalone and cannot be imported
themselves.

ONE WRITER. `bkit-graph-repair.py` is the only caller of `resolved_import_edges()`;
it injects the result into graph.json during `pnpm graph`, so `graphify affected` /
`explain` / `path` / `query` see the same edges these scripts do. bkit-graph-eager.py
and bkit-graphify-rollup.py call `warn_if_unrepaired()` and otherwise just read the
graph.

Two independent gaps, ~550 edges on this repo.

── GAP 1: a `.js` specifier never resolves to a `.tsx` file ──────────────────

graphify's `_resolve_js_import_path` (`graphify/extractors/resolution.py:43`)
maps `.js` to `.ts` and stops:

    if candidate.suffix == ".js":
        ts_candidate = candidate.with_suffix(".ts")     # tries .ts, gives up
    elif candidate.suffix == ".jsx":
        tsx_candidate = candidate.with_suffix(".tsx")

TypeScript's order for a `.js` specifier is `.ts` -> `.tsx` -> `.d.ts` -> `.js`.
A `.tsx` file is imported as `.js`, never `.jsx` — `Foo.tsx` emits to `Foo.js`,
so `./Foo.js` is the specifier NodeNext requires. The append-extension fallback
underneath cannot rescue it: it appends to the whole filename, producing
`MessageBubble.js.tsx`. Confirmed on upstream branch `v8` at 0.9.58, so
upgrading does not fix it. Reported as Graphify-Labs/graphify#3486.

On a repo that imports `.tsx` through `.js` specifiers, most resolve and a
minority point at `.tsx`. Those are the recovered edges.

── GAP 2: workspace subpath imports through an `exports` map ─────────────────

`@scope/ui/components/Icon` resolves through that package's `exports`
map, which graphify does not read. The maps carry three conditions and they
are NOT interchangeable:

    "./components/Icon": {
      "types":        "./dist/components/Icon.web.d.ts",   <- build output, SKIP
      "react-native": "./src/components/Icon.native.tsx",  <- what mobile gets
      "default":      "./src/components/Icon.web.tsx"      <- what web gets
    }

`types` always points into `dist/`, which is gitignored and not in the corpus; it
is skipped.

CONDITION CHOICE IS PER IMPORTER, not per package. An importer under apps/mobile
or named `*.native.*` gets `react-native`; one under apps/web or `*.web.*` gets
`default`. Where the importer is shared (anything in packages/), both are
emitted.

── SCOPE ────────────────────────────────────────────────────────────────────

Extensionless relative specifiers are left to graphify's own append-extension
loop. A bare `@scope/services` root import, and a `.js`-suffixed subpath into a
package with no matching `exports` entry, do not resolve; `unresolved_specifiers()`
counts them.
"""

from __future__ import annotations

import json
import os
import re

SRC_EXTS = (".ts", ".tsx")
SKIP_DIR = {"node_modules", "dist", ".next", ".turbo", "coverage", "build", ".git",
            ".worktrees", "docs"}
DEFAULT_ROOTS = ("apps", "packages")
MANIFEST_GLOB_DIRS = ("packages", "apps", "tooling")

# `from "x"`, `import("x")`, `export ... from "x"`, `require("x")`. Group 1 is
# any specifier; relative and bare are told apart by the leading dot.
SPEC = re.compile(r"""(?:from|import|require)\s*\(?\s*["']([^"'\n]+)["']""")

# TypeScript rewrites these output extensions back to source when resolving.
TS_EQUIVALENT = {
    ".js": (".ts", ".tsx", ".d.ts"),
    ".jsx": (".tsx",),
    ".mjs": (".mts", ".mjs"),
    ".cjs": (".cts", ".cjs"),
}
# Tried after the TypeScript candidates, and every match is kept rather than the
# first: a platform split has no single answer.
PLATFORM_SUFFIXES = (".native.tsx", ".web.tsx", ".native.ts", ".web.ts")

# `types` is absent — it points into dist/, which is not in the corpus. Order
# matters only when a single condition is being picked.
NATIVE_CONDITIONS = ("react-native", "default", "node", "import", "require")
WEB_CONDITIONS = ("default", "node", "import", "require")
ALL_CONDITIONS = ("react-native", "default", "node", "import", "require")


REPAIR_ORIGIN = "graph-repair"


def repair_state(graph):
    """(edges injected by bkit-graph-repair.py, was the repair run at all).

    Consumers call this instead of re-deriving the edges themselves.

    There is no top-level marker to check: `cluster-only` rewrites graph.json
    and drops keys it does not own. The per-link `_origin` survives, so that is
    the signal. A genuinely zero-repair graph reads as unrepaired here.
    """
    n = sum(1 for l in graph.get("links", ()) if l.get("_origin") == REPAIR_ORIGIN)
    return n, n > 0


def warn_if_unrepaired(graph, who, stream=None):
    """Print a loud warning when graph.json has not been through bkit-graph-repair.py.

    Warns only; never repairs on read.
    """
    import sys as _sys
    count, ok = repair_state(graph)
    if not ok:
        print(f"[{who}] WARNING: graph.json carries no graph-repair edges. "
              f"graphify misses ~540 imports in this repo, so reachability and "
              f"blast-radius numbers below are UNDERSTATED. Run 'pnpm graph:update'.",
              file=stream or _sys.stderr)
    return count


def _strip_output_ext(path):
    """`foo.js` -> (`foo`, `.js`); anything else -> (path, None)."""
    stem, ext = os.path.splitext(path)
    return (stem, ext) if ext in TS_EQUIVALENT else (path, None)


def _source_files_for(stem, ext):
    """Every real source file a specifier ending `stem + ext` can denote.

    Falls through to the platform suffixes in two situations, so it strips the
    source extension below as well as the output extension the caller stripped:

      ./Icon.js            an output extension, no Icon.ts/.tsx on disk
      ./src/controls/*.tsx an exports map naming a file that does not exist,
                           because the real pair is BottomNav.native.tsx and
                           BottomNav.web.tsx. packages/ui writes every wildcard
                           this way, so without it 8 controls and items read as
                           unimported.
    """
    if ext is not None:
        for candidate_ext in TS_EQUIVALENT[ext]:
            path = stem + candidate_ext
            if os.path.isfile(path):
                return [path]
    elif os.path.isfile(stem):
        return [stem]
    else:
        base, source_ext = os.path.splitext(stem)
        if source_ext in SRC_EXTS:
            stem = base
    return [stem + s for s in PLATFORM_SUFFIXES if os.path.isfile(stem + s)]


def workspace_packages(roots=MANIFEST_GLOB_DIRS):
    """{package name: (package dir, manifest)} for every workspace member."""
    found = {}
    for root in roots:
        if not os.path.isdir(root):
            continue
        for entry in sorted(os.listdir(root)):
            manifest = os.path.join(root, entry, "package.json")
            if not os.path.isfile(manifest):
                continue
            try:
                data = json.load(open(manifest, encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            if data.get("name"):
                found[data["name"]] = (os.path.join(root, entry), data)
    return found


def _conditions_for(importer):
    """Which export conditions this importer actually resolves through."""
    base = os.path.basename(importer)
    if importer.startswith("apps/mobile/") or ".native." in base:
        return NATIVE_CONDITIONS, True
    if importer.startswith("apps/web/") or ".web." in base:
        return WEB_CONDITIONS, True
    return ALL_CONDITIONS, False


def _export_targets(pkg_dir, manifest, subpath, conditions, pick_one):
    """Resolve `subpath` ("." or "./x/y") against a package's exports map."""
    exports = manifest.get("exports")
    if not isinstance(exports, dict):
        # No exports map: only the root specifier is reachable, via main/module.
        if subpath != "." or exports:
            return []
        for key in ("module", "main"):
            if manifest.get(key):
                target = os.path.normpath(os.path.join(pkg_dir, manifest[key]))
                if os.path.isfile(target):
                    return [target]
        return []

    for key, value in exports.items():
        # Exact match first, then a single `*` wildcard, matched the way Node
        # does it: fixed prefix, fixed suffix, `*` takes everything between.
        if key == subpath:
            star = ""
        elif "*" in key:
            prefix, _, suffix = key.partition("*")
            if not (subpath.startswith(prefix) and subpath.endswith(suffix)
                    and len(subpath) >= len(prefix) + len(suffix)):
                continue
            star = subpath[len(prefix):len(subpath) - len(suffix) or None]
        else:
            continue

        if isinstance(value, str):
            values = [value]
        else:
            present = [c for c in conditions if c in value]
            values = [value[present[0]]] if (pick_one and present) else \
                     [value[c] for c in present]

        targets = []
        for raw in values:
            path = os.path.normpath(os.path.join(pkg_dir, raw.replace("*", star)))
            if f"{os.sep}dist{os.sep}" in f"{os.sep}{path}{os.sep}":
                continue
            stem, ext = _strip_output_ext(path)
            targets.extend(f for f in _source_files_for(stem, ext)
                           if f.endswith(SRC_EXTS))
        return targets
    return []


def _source_files(roots):
    for root in roots:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR]
            for name in sorted(filenames):
                if name.endswith(SRC_EXTS):
                    yield os.path.join(dirpath, name)


def resolved_import_edges(roots=DEFAULT_ROOTS, collect_unresolved=None):
    """Every (importer, imported) pair reachable through a static import.

    Returns the FULL set, not only the repairs, so a caller can union it with
    whatever graph.json carried without reasoning about which found a given
    edge. Union is idempotent; a pair in both is one pair.

    Pass a list as `collect_unresolved` to receive (importer, specifier) for
    every workspace import that matched a package but no exports entry.
    """
    packages = workspace_packages()
    edges = set()
    for src in _source_files(roots):
        try:
            text = open(src, encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        conditions, pick_one = _conditions_for(src)
        for spec in SPEC.findall(text):
            targets = []
            if spec.startswith("."):
                path = os.path.normpath(os.path.join(os.path.dirname(src), spec))
                stem, ext = _strip_output_ext(path)
                # Extensionless is graphify's job and it does it correctly.
                if ext is None:
                    continue
                targets = _source_files_for(stem, ext)
            else:
                for name, (pkg_dir, manifest) in packages.items():
                    if spec != name and not spec.startswith(name + "/"):
                        continue
                    subpath = "." if spec == name else "./" + spec[len(name) + 1:]
                    targets = _export_targets(pkg_dir, manifest, subpath,
                                              conditions, pick_one)
                    if not targets and collect_unresolved is not None:
                        collect_unresolved.append((src, spec))
                    break
            for dst in targets:
                if dst != src:
                    edges.add((src, dst))
    return edges
