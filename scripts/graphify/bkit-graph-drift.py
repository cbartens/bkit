# Example. Copy into the repo and own it.
# bkit install does not write this file and does not overwrite a copy.
# Adapt app roots, the workspace package scope, and the rules JSON to this repo.

#!/usr/bin/env python3
"""Compute per-capability drift status by literal-pattern scan, for the generated diagram.

Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Reads
bkit-graph-drift-rules.json, walks the source tree once, and writes an overlay JSON
that bkit-graphify-rollup.py paints onto the Mermaid nodes.

    bkit-graph-drift.py <rules.json> <overlay-out.json> [--quiet]

Scans source text for a duplicated MECHANISM (a second `new Client()`, a fourth
hand-rolled send) by literal substring match, not via the code graph. Patterns are
LITERAL, never regex.

TWO SURFACES. A rule's optional "surface" key picks which one it scans:
"product" (the default), "tests", or "all". See sources().

BUDGETED. A rule may declare "budgets": the EXACT number of non-owner sites allowed
per scope prefix. A row whose measured count matches its declared budget everywhere
gets the status `budgeted` instead of the amber warning. See budget_state().
"""

import argparse
import json
import os
import sys

# .js/.mjs/.cjs count too: a script under scripts/ci can carry the same marker,
# and a .ts-only scan never sees it.
SRC = (".ts", ".tsx", ".js", ".mjs", ".cjs")
# dist-plugins/ is compiled output of plugins/*.ts; scanning both counts each site twice.
SKIP_DIR = {"node_modules", "dist", "dist-plugins", ".next", ".turbo", "coverage", "build", ".git"}
# *.config.ts is build configuration, not application code.
SKIP_FILE = (".d.ts", ".config.")
# What puts a file on the TEST surface rather than the product one. Everything
# else about the walk is identical, so the two surfaces are a PARTITION of the
# same file set — see sources().
TEST_FILE = (".test.", ".spec.")
# Roots walked; a budget guard reads the same roots. scripts/ is included.
ROOTS = (".bkit/core/engine", ".bkit/scripts", "scripts")
SURFACES = ("product", "tests", "all")

ap = argparse.ArgumentParser()
ap.add_argument("rules_json")
ap.add_argument("overlay_out")
ap.add_argument("--quiet", action="store_true")
args = ap.parse_args()

rules = json.load(open(args.rules_json))["rules"]


def is_test_path(path):
    """Test surface membership, for one path. Same two clauses as sources()."""
    parts = path.split("/")
    return "e2e" in parts or any(x in parts[-1] for x in TEST_FILE)


def sources():
    """Yield (path, surface) for every scannable file, on ONE walk.

    Two surfaces, and they PARTITION the file set — no file is on both, none is
    on neither:

      product  application code.
      tests    anything under an `e2e` directory, plus any `.test.` / `.spec.`
               file anywhere — exactly what the product surface skips.

    A test HELPER that is neither under `e2e` nor named `.test.`/`.spec.` —
    `packages/utils/src/testing/**`, `packages/api/tests/setup.ts` — is scanned
    as product code.
    """
    for root in ROOTS:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR]
            in_e2e = "/e2e/" in dirpath + "/" or dirpath.endswith("/e2e")
            for f in filenames:
                if not f.endswith(SRC) or any(x in f for x in SKIP_FILE):
                    continue
                is_test = in_e2e or any(x in f for x in TEST_FILE)
                yield os.path.join(dirpath, f), ("tests" if is_test else "product")


# One read of the tree, all rules matched against it. A rule's optional "scope"
# (path prefixes) narrows the files it matches.
hits = {r["pattern"]: [] for r in rules}
scoped = {r["pattern"]: tuple(r["scope"]) for r in rules if r.get("scope")}
# Which surface each rule is asking about. Absent = "product".
wants = {r["pattern"]: r.get("surface", "product") for r in rules}
for pat, want in wants.items():
    if want not in SURFACES:
        raise SystemExit(f'[drift] pattern {pat!r}: "surface" is {want!r}, '
                         f"expected one of {', '.join(SURFACES)}")
seen = {"product": 0, "tests": 0}
for path, surface in sources():
    seen[surface] += 1
    try:
        text = open(path, encoding="utf-8", errors="ignore").read()
    except OSError:
        continue
    for pat in hits:
        if wants[pat] not in (surface, "all"):
            continue
        if pat in text and (pat not in scoped or path.startswith(scoped[pat])):
            hits[pat].append(path)

# A surface that matched 0 files fails the run: every rule on it would pass vacuously.
for surface, n in seen.items():
    if n == 0:
        raise SystemExit(f"[drift] the {surface} surface matched 0 files. Every rule scoped to "
                         f"it would pass vacuously — fix the walk before trusting any count.")


def budget_state(rule, outside):
    """Measured sites vs the rule's DECLARED per-prefix budgets.

    Returns (declared_total, verdict). verdict is None when the rule declares no
    budget at all — the register's default, and the one that stays amber.

      "at"     every prefix holds exactly the number it declared. Settled.
      "over"   a prefix holds more than it declared, or a site landed outside
               every declared prefix. A new copy appeared.
      "stale"  a prefix holds fewer than it declared. The budget is a ceiling
               nobody lowered.

    A budget is an exact number with its reason in the rule's `note`; a CI test
    counting the same prefixes fails when the count moves in either direction. A
    site outside every declared prefix reads as "over" here, which that test,
    counting only inside its prefixes, does not see.
    """
    budgets = rule.get("budgets")
    if not budgets:
        return None, None
    declared = sum(budgets.values())
    counted = dict.fromkeys(budgets, 0)
    unbudgeted = 0
    for path in outside:
        owning = max((b for b in budgets if path.startswith(b)), key=len, default=None)
        if owning is None:
            unbudgeted += 1
        else:
            counted[owning] += 1
    if unbudgeted or any(counted[b] > budgets[b] for b in budgets):
        return declared, "over"
    if any(counted[b] < budgets[b] for b in budgets):
        return declared, "stale"
    return declared, "at"


overlay, summary, rows = {}, [], []
for r in rules:
    owner, users = r.get("owner"), sorted(hits[r["pattern"]])
    outside = [u for u in users if u != owner]
    if owner is None:
        status = "split"
        detail = f"NO OWNER · {len(users)} sites"
    elif not os.path.exists(owner):
        status = "gap"
        detail = "owner declared, file does not exist"
    elif outside:
        status = "bypassed"
        detail = f"{len(outside)} of {len(users)} sites skip the owner"
    else:
        status = "one"
        detail = f"{len(users)} site{'' if len(users) == 1 else 's'}, all via the owner"
    # At budget, `split` / `bypassed` become `budgeted`. `one` and `gap` never do.
    declared, verdict = budget_state(r, outside)
    if verdict == "at" and status in ("split", "bypassed"):
        status = "budgeted"
        detail += f" · at budget {declared}"
    elif verdict == "over":
        detail += f" · OVER BUDGET, {len(outside)} > {declared}"
    elif verdict == "stale":
        detail += f" · BUDGET STALE, {len(outside)} < {declared}"
    if r.get("issue"):
        detail += f" · #{r['issue']}"
    # Keyed on the owner path when there is one, on the busiest bypass otherwise. A
    # row keyed on a TEST path is registered but never painted (bkit-graphify-rollup.py's
    # is_test_code skips it too). The test is on the key PATH, not the rule's surface:
    # an "all" rule paints when its busiest hit is product code.
    key = owner or (outside[0] if outside else None)
    if key and status != "one" and not is_test_path(key):
        overlay[key] = [status, f"{r['capability']} · {detail}"]
    summary.append((status, r["capability"], detail, outside))
    rows.append({"lane": r.get("lane", ""), "capability": r["capability"],
                 "owner": owner, "pattern": r["pattern"], "status": status,
                 "sites": len(users), "bypasses": len(outside),
                 "surface": r.get("surface", "product"),
                 "budget": declared, "budget_state": verdict,
                 "issue": r.get("issue"), "detail": detail})

json.dump({"generated_from": args.rules_json, "overlay": overlay, "rows": rows},
          open(args.overlay_out, "w"), indent=1)

if not args.quiet:
    order = {"split": 0, "gap": 1, "bypassed": 2, "budgeted": 3, "one": 4}
    for status, cap, detail, outside in sorted(summary, key=lambda s: order[s[0]]):
        print(f"[drift] {status:9} {cap:34} {detail}")
        for u in outside[:4]:
            print(f"[drift]           ↳ {u}")
counts = {}
for s, *_ in summary:
    counts[s] = counts.get(s, 0) + 1
print(f"[drift] {len(rules)} rules → " + " · ".join(f"{v} {k}" for k, v in sorted(counts.items()))
      + f" (scanned {seen['product']} product + {seen['tests']} test files)")
print(f"[drift] wrote {args.overlay_out}", file=sys.stderr)
