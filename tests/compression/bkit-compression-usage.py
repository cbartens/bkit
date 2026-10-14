#!/usr/bin/env python3
"""Attribute Claude Code token cost to tool results, from real session transcripts.

    bkit-compression-usage.py <projects-glob> [--by-command] [--context] [--dump <dir>]

<projects-glob>  Claude Code project folders, e.g.
                 "$HOME/.claude/projects/-Users-me-src-my-app*" (quote it; the glob is expanded here).
--by-command     break the Bash tool's cost down by command (sed, grep, gh issue view, ...).
--context        context size per request, orchestrator vs subagent cost, repeat file reads.
--dump <dir>     write every tool result >= 2 KB to <dir>/<tool>/<n>.txt for
                 bkit-compression-replay.py. The files hold raw tool output: keep <dir> under
                 the repo's gitignored tmp/ and delete it afterwards.

Cost model, in input-price units (Anthropic list ratios): uncached input 1, 1h cache write 2,
5m cache write 1.25, cache read 0.1, output 5. A tool result enters a transcript once (a cache
write) and is re-read from cache by every later request in that transcript, so its weighted cost
is tokens * (2 + 0.1 * later_requests). A proxy that shrinks it by r saves r of that amount.
Tool-result tokens are estimated as characters / 4; request totals are the provider's own usage.
"""
import glob
import json
import os
import re
import sys
from collections import Counter, defaultdict

WRITE_1H, WRITE_5M, READ, OUT = 2.0, 1.25, 0.1, 5.0
FILE_READ = re.compile(
    r"(?:sed -n ['\"]?[0-9,]+p['\"]? |cat |head [^|;]*|tail [^|;]*)"
    r"([\w./@-]+\.(?:ts|tsx|js|mjs|md|json|sql|yml|yaml|py|sh))")


def transcripts(pattern):
    found = []
    for proj in glob.glob(pattern):
        found += [(f, "main") for f in glob.glob(os.path.join(proj, "*.jsonl"))]
        found += [(f, "subagent") for f in glob.glob(os.path.join(proj, "*", "subagents", "*.jsonl"))]
    return found


def tool_key(name):
    return "mcp:" + name.split("__")[1] if name.startswith("mcp__") else name


def command_key(cmd):
    c = re.sub(r"^(cd [^&;]+(&&|;)\s*)+", "", cmd.strip())
    c = re.sub(r"^([A-Z_]+=\S+\s+)+", "", c)
    toks = c.split()
    if not toks:
        return "?"
    t0 = os.path.basename(toks[0])
    if t0 in ("bkit", "gh", "git") and len(toks) > 2 and not toks[2].startswith("-"):
        return f"{t0} {toks[1]} {toks[2]}"[:40]
    if t0 in ("bkit", "npx", "pnpm", "npm", "gh", "git", "node", "python3", "bash", "sh") and len(toks) > 1:
        return f"{t0} {toks[1]}"[:40]
    return t0[:40]


def text_of(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text")
    return ""


def request_cost(u):
    cc = u.get("cache_creation") or {}
    w1h = cc.get("ephemeral_1h_input_tokens", 0)
    w5m = u.get("cache_creation_input_tokens", 0) - w1h
    cr = u.get("cache_read_input_tokens", 0)
    return {
        "input": u.get("input_tokens", 0), "write": w1h + w5m, "read": cr, "output": u.get("output_tokens", 0),
        "weighted": u.get("input_tokens", 0) + WRITE_1H * w1h + WRITE_5M * w5m + READ * cr + OUT * u.get("output_tokens", 0),
        "weighted_read": READ * cr, "context": u.get("input_tokens", 0) + w1h + w5m + cr,
    }


def walk(path):
    """Ordered events for one transcript: ("req", cost) and ("tool", tool, command_key, text)."""
    uses, events, seen, reads = {}, [], set(), Counter()
    with open(path, errors="replace") as fh:
        for line in fh:
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            msg = row.get("message") or {}
            if row.get("type") == "assistant":
                for b in msg.get("content") or []:
                    if not (isinstance(b, dict) and b.get("type") == "tool_use"):
                        continue
                    inp = b.get("input") or {}
                    uses[b["id"]] = (tool_key(b.get("name", "?")), command_key(inp.get("command", "")) if b.get("name") == "Bash" else "")
                    if b.get("name") == "Read":
                        reads[inp.get("file_path")] += 1
                    elif b.get("name") == "Bash":
                        for p in FILE_READ.findall(inp.get("command", "")):
                            reads[p] += 1
                usage = msg.get("usage")
                if usage and msg.get("id") not in seen:
                    seen.add(msg.get("id"))
                    events.append(("req", request_cost(usage)))
            elif row.get("type") == "user" and isinstance(msg.get("content"), list):
                for b in msg["content"]:
                    if isinstance(b, dict) and b.get("type") == "tool_result":
                        tool, cmd = uses.get(b.get("tool_use_id"), ("?", ""))
                        events.append(("tool", tool, cmd, text_of(b.get("content"))))
    return events, reads


def main():
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        sys.exit(__doc__)
    dump = args[args.index("--dump") + 1] if "--dump" in args else None
    files = transcripts(args[0])
    if not files:
        sys.exit(f"no transcripts match {args[0]}")
    totals, by_kind = defaultdict(float), defaultdict(lambda: defaultdict(float))
    by_tool, by_cmd = defaultdict(lambda: defaultdict(float)), defaultdict(lambda: defaultdict(float))
    contexts, dumped, repeat, all_reads, reqs_per = [], Counter(), Counter(), 0, defaultdict(list)
    for path, kind in files:
        events, reads = walk(path)
        all_reads += sum(reads.values())
        repeat[kind] += sum(c - 1 for c in reads.values() if c > 1)
        later = sum(1 for e in events if e[0] == "req")
        reqs_per[kind].append(later)
        for e in events:
            if e[0] == "req":
                later -= 1
                for k, v in e[1].items():
                    totals[k] += v
                    by_kind[kind][k] += v
                totals["requests"] += 1
                contexts.append(e[1]["context"])
                continue
            _, tool, cmd, text = e
            tok = len(text) / 4
            cost = tok * (WRITE_1H + READ * later)
            for bucket in (by_tool[tool], by_cmd[cmd] if tool == "Bash" else None):
                if bucket is not None:
                    bucket["n"] += 1
                    bucket["tokens"] += tok
                    bucket["weighted"] += cost
            if len(text) >= 2048:
                by_tool[tool]["weighted_2k"] += cost
                if dump:
                    d = os.path.join(dump, tool.replace(":", "_"))
                    os.makedirs(d, exist_ok=True)
                    dumped[tool] += 1
                    with open(os.path.join(d, f"{dumped[tool]:05d}.txt"), "w") as out:
                        out.write(f"#later={later}\n{text}")
    W = totals["weighted"]
    print(f"transcripts {len(files)}  requests {int(totals['requests']):,}")
    for k in ("input", "write", "read", "output"):
        print(f"  {k:<7}{totals[k]:>18,.0f}")
    print(f"  weighted cost (input-price units) {W:,.0f}; output is {OUT * totals['output'] / W:.1%} of it")
    tool_w = sum(t["weighted"] for t in by_tool.values())
    big_w = sum(t["weighted_2k"] for t in by_tool.values())
    print(f"  tool results: {tool_w / W:.1%} of cost; results >= 2 KB (the compressible pool): {big_w / W:.1%}\n")
    print(f"{'tool':<26}{'results':>9}{'tokens':>14}{'share of cost':>15}{'>=2KB share':>13}")
    for tool, t in sorted(by_tool.items(), key=lambda kv: -kv[1]["weighted"])[:20]:
        print(f"{tool:<26}{int(t['n']):>9}{t['tokens']:>14,.0f}{t['weighted'] / W:>15.1%}{t['weighted_2k'] / W:>13.1%}")
    if "--by-command" in args:
        bash_w = by_tool["Bash"]["weighted"] or 1
        print(f"\n{'Bash command':<40}{'runs':>8}{'tokens':>14}{'share of Bash cost':>20}")
        for cmd, t in sorted(by_cmd.items(), key=lambda kv: -kv[1]["weighted"])[:25]:
            print(f"{cmd:<40}{int(t['n']):>8}{t['tokens']:>14,.0f}{t['weighted'] / bash_w:>20.1%}")
    if "--context" in args:
        contexts.sort()
        median, p90 = contexts[len(contexts) // 2], contexts[min(int(len(contexts) * 0.9), len(contexts) - 1)]
        print(f"\ncontext per request: median {median:,}  p90 {p90:,}  max {contexts[-1]:,}")
        for kind, k in by_kind.items():
            n = sorted(reqs_per[kind])
            print(f"{kind:<9} transcripts {len(n):>4}  requests {sum(n):>7,}  share of cost {k['weighted'] / W:6.1%}"
                  f"  of which cache re-reads {k['weighted_read'] / k['weighted']:6.1%}  median requests/transcript {n[len(n) // 2]}")
        print(f"file reads (Read + sed/cat/head/tail of a path): {all_reads:,}; re-reads of a file already read in the same "
              f"transcript: {sum(repeat.values()):,} ({sum(repeat.values()) / max(all_reads, 1):.0%})")


if __name__ == "__main__":
    main()
