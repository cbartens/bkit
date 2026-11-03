#!/usr/bin/env python3
"""Token usage and cost for one opencode session and every subagent session under it.

    bkit-compression-opencode-tokens.py <session-id>
    bkit-compression-opencode-tokens.py --latest <directory>   newest top-level session started there
    bkit-compression-opencode-tokens.py --list <directory>     top-level sessions there, newest first

Reads opencode 2's own database (~/.local/share/opencode/opencode.db, table session_v2), which
records the usage the provider reported, so arms with and without a proxy compare like for like.
"""
import os
import sqlite3
import sys

DB = os.path.expanduser("~/.local/share/opencode/opencode.db")
FIELDS = ("tokens_input", "tokens_cache_read", "tokens_cache_write", "tokens_output", "tokens_reasoning", "cost")


def tree(db, root):
    rows = db.execute(f"""
        WITH RECURSIVE t(id) AS (SELECT ? UNION ALL SELECT s.id FROM session_v2 s JOIN t ON s.parent_id = t.id)
        SELECT s.id, s.title, {", ".join("s." + f for f in FIELDS)}
        FROM session_v2 s JOIN t ON s.id = t.id""", (root,)).fetchall()
    if not rows:
        sys.exit(f"no session {root} in {DB}")
    return rows


def top_level(db, directory):
    return db.execute("""SELECT id, title FROM session_v2
                         WHERE directory = ? AND parent_id IS NULL ORDER BY time_created DESC""",
                      (os.path.realpath(directory),)).fetchall()


def report(rows):
    total = {f: sum(r[2 + i] or 0 for r in rows) for i, f in enumerate(FIELDS)}
    sent = total["tokens_input"] + total["tokens_cache_read"] + total["tokens_cache_write"]
    print(f"session            {rows[0][0]}  ({rows[0][1] or 'untitled'})")
    print(f"sessions           {len(rows)} (1 top-level + {len(rows) - 1} subagent)")
    for f in FIELDS[:-1]:
        print(f"{f[7:]:<18} {total[f]:>14,}")
    print(f"{'input sent (all)':<18} {sent:>14,}")
    print(f"{'cost (USD)':<18} {total['cost']:>14.4f}")


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    db = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    if args[0] == "--list":
        for sid, title in top_level(db, args[1]):
            print(sid, title or "untitled")
        return
    if args[0] == "--latest":
        found = top_level(db, args[1])
        if not found:
            sys.exit(f"no sessions in {args[1]}")
        args = [found[0][0]]
    report(tree(db, args[0]))


if __name__ == "__main__":
    main()
