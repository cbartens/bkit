#!/usr/bin/env python3
"""Summarise bkit-compression-replay.py output.

    bkit-compression-summary.py <replay.jsonl> [--no-kompress <replay-no-kompress.jsonl>] [--by-type] [--rows]

Per tool: share of cache-weighted tokens each compressor removes, and how many samples it touched.
--no-kompress  add a column for Headroom with Kompress off (same files, joined by tool + file).
--by-type      Bash samples by content type (caveman's classifier label) instead of by tool.
--rows         one line per sample.
"""
import json
import sys
from collections import defaultdict


def pct(before, after):
    return 1 - after / before if before else 0.0


def load(path):
    return {(r["tool"], r["file"]): r for r in map(json.loads, open(path))}


def main():
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        sys.exit(__doc__)
    rows = load(args[0])
    extra = load(args[args.index("--no-kompress") + 1]) if "--no-kompress" in args else {}
    for key, r in rows.items():
        s = extra.get(key)
        if s and "hr_before" in s:
            r["hn_before"], r["hn_after"] = s["hr_before"], s["hr_after"]
    arms = [("cv", "caveman"), ("hr", "headroom")] + ([("hn", "hr-no-kompress")] if extra else [])
    if "--rows" in args:
        for r in rows.values():
            cells = "   ".join(f"{name} {pct(r.get(k + '_before', 0), r.get(k + '_after', 0)):>5.0%}" for k, name in arms)
            print(f"{r['tool']:<22}{r['file']:<12}{r.get('cv_type') or '-':<15}{cells}")
        return
    by_type = "--by-type" in args
    agg = defaultdict(lambda: defaultdict(float))
    for r in rows.values():
        if any(k + "_before" not in r for k, _ in arms) or (by_type and r["tool"] != "Bash"):
            continue
        a, w = agg[r.get("cv_type") or "?"] if by_type else agg[r["tool"]], r["weight"]
        a["n"] += 1
        a["weighted"] += r["cv_before"] * w
        for k, _ in arms:
            a[k + "_b"] += r[k + "_before"] * w
            a[k + "_a"] += r[k + "_after"] * w
            a[k + "_hit"] += r[k + "_after"] < r[k + "_before"]
    # Within one tool, sample weights stand in for that tool's cost; across tools they do not.
    total = sum(a["weighted"] for a in agg.values()) or 1
    label = "Bash content type" if by_type else "tool"
    print(f"{label:<24}{'samples':>8}{'share' if by_type else '':>7}" + "".join(f"{name + ' saves':>22}{'(hit)':>7}" for _, name in arms))
    for key, a in sorted(agg.items(), key=lambda kv: -kv[1]["weighted"]):
        share = f"{a['weighted'] / total:.0%}" if by_type else ""
        print(f"{key:<24}{int(a['n']):>8}{share:>7}" + "".join(
            f"{pct(a[k + '_b'], a[k + '_a']):>22.1%}{int(a[k + '_hit']):>7}" for k, _ in arms))


if __name__ == "__main__":
    main()
