# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# List the docs to embed into in GRAPH_EMBED_DOCS (bkit-graphify.sh).

#!/usr/bin/env python3
"""Copy the packages diagram from the capability register into other docs.

Called by `pnpm graph:rollup`, `:register` and `:refresh` (write) and by `pnpm
graph:check` (--check), scripts/graphify/bkit-graphify.sh, for every doc in
GRAPH_EMBED_DOCS. Runs on system python (stdlib only).

    bkit-graph-embed.py <capabilities.md> <doc>... [--check]

Each doc holds one block between the two markers below. Write mode replaces what
is between them with the fenced Mermaid block under `## Architecture — packages`
in the register, byte for byte. --check writes nothing and exits 1 when any doc's
block differs. A doc without both markers exits 2: a listed doc that cannot take
the diagram is a setup error, not a clean result.
"""

import argparse
import re
import sys

START, END = "<!-- graph:packages:start -->", "<!-- graph:packages:end -->"
HEADING = "## Architecture — packages"

ap = argparse.ArgumentParser()
ap.add_argument("capabilities_doc")
ap.add_argument("docs", nargs="+")
ap.add_argument("--check", action="store_true")
args = ap.parse_args()

register = open(args.capabilities_doc, encoding="utf-8").read()
if HEADING not in register:
    sys.exit(f"[graph] {args.capabilities_doc}: no `{HEADING}` section — run pnpm graph:rollup first")
m = re.search(r"```mermaid\n.*?\n```", register.split(HEADING, 1)[1], re.S)
if not m:
    sys.exit(f"[graph] {args.capabilities_doc}: `{HEADING}` has no ```mermaid block")
block = f"{START}\n\n{m.group(0)}\n\n{END}"

stale = []
for doc in args.docs:
    text = open(doc, encoding="utf-8").read()
    if text.count(START) != 1 or text.count(END) != 1 or text.index(START) > text.index(END):
        print(f"[graph] {doc}: needs exactly one {START} … {END} pair", file=sys.stderr)
        sys.exit(2)
    head, rest = text.split(START, 1)
    tail = rest.split(END, 1)[1]
    fresh = head + block + tail
    if fresh == text:
        continue
    if args.check:
        stale.append(doc)
    else:
        with open(doc, "w", encoding="utf-8") as fh:
            fh.write(fresh)
        print(f"[graph] {doc}: packages diagram rewritten")

if stale:
    print(f"[graph] DRIFT: the packages diagram in {', '.join(stale)} is not the one in "
          f"{args.capabilities_doc}.", file=sys.stderr)
    sys.exit(1)
