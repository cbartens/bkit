#!/usr/bin/env python3
"""Replay real tool results through caveman and Headroom offline. No model calls, no cost.

    <headroom-python> bkit-compression-replay.py <dump-dir> <samples-per-tool> <out.jsonl> [--no-kompress]

<headroom-python>   the interpreter Headroom is installed in, e.g.
                    ~/.local/share/uv/tools/headroom-ai/bin/python
<dump-dir>          from bkit-compression-usage.py --dump: <tool>/<n>.txt, first line "#" + JSON
                    (later requests, real tool name and input, latest user message)
--no-kompress       measure only Headroom with its ML text compressor (Kompress) off, writing hr_*
                    fields; run it on the same dump and sample size, then pass the output to
                    bkit-compression-summary.py --no-kompress.

Each sample is compressed the way a proxy sees it: as the latest tool result of the turn
(Headroom protect_recent=0), after the real user message and the real tool call, so Headroom's
per-tool rules (e.g. Claude Code's Read kept verbatim, grep output folded losslessly) and its
relevance scoring apply. caveman runs as `caveman tools compress` (must be on PATH); it takes
the text only.
Sampling is seeded, so two runs over the same dump pick the same files.
"""
import json
import os
import random
import subprocess
import sys

os.environ.setdefault("HEADROOM_BEACON", "off")
os.environ.setdefault("DO_NOT_TRACK", "1")
from headroom import compress  # noqa: E402
from headroom.transforms.kompress_compressor import warm_kompress_model  # noqa: E402

WRITE, READ = 2.0, 0.1


def caveman(text):
    r = subprocess.run(["caveman", "tools", "compress"], input=text, capture_output=True, text=True, timeout=120)
    meta = json.loads(r.stderr.strip().splitlines()[-1])
    before = meta.get("tokens_before") or 0
    after = meta.get("tokens_after") or before
    return before, after, meta.get("content_type"), meta.get("method")


def headroom(text, call, **opts):
    messages = [
        {"role": "user", "content": call.get("query") or "Continue."},
        {"role": "assistant", "content": [{"type": "tool_use", "id": "t1", "name": call["tool"], "input": call["input"]}]},
        {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "t1", "content": text}]},
    ]
    res = compress(messages, model="claude-opus-4-20250514", protect_recent=0, **opts)
    return res.tokens_before, res.tokens_after


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    dump, per_tool, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    no_kompress = "--no-kompress" in sys.argv
    # The live proxy warms Kompress at startup; without this, text passes through uncompressed.
    if not no_kompress and not warm_kompress_model():
        sys.exit("Kompress model failed to load; Headroom numbers would be understated")
    random.seed(545)
    with open(out, "w") as fh:
        for tool in sorted(os.listdir(dump)):
            files = sorted(os.listdir(os.path.join(dump, tool)))
            for name in random.sample(files, min(per_tool, len(files))):
                head, _, text = open(os.path.join(dump, tool, name), errors="replace").read().partition("\n")
                call = json.loads(head[1:])
                later = call["later"]
                row = {"tool": tool, "file": name, "later": later, "weight": WRITE + READ * later}
                if not no_kompress:
                    try:
                        row["cv_before"], row["cv_after"], row["cv_type"], row["cv_method"] = caveman(text)
                    except Exception as e:  # record and continue: one bad sample must not end a long run
                        row["cv_error"] = str(e)[:200]
                try:
                    row["hr_before"], row["hr_after"] = headroom(text, call, **({"kompress_model": "disabled"} if no_kompress else {}))
                except Exception as e:  # record and continue: one bad sample must not end a long run
                    row["hr_error"] = str(e)[:200]
                fh.write(json.dumps(row) + "\n")
                fh.flush()


if __name__ == "__main__":
    main()
