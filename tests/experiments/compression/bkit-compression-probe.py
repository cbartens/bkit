#!/usr/bin/env python3
"""Send one chat request whose latest tool result is a real payload, three ways, and compare.

    bkit-compression-probe.py <payload-file> [--model <openrouter-model>] [--host <openrouter-host>]

Routes: direct OpenRouter, caveman proxy (127.0.0.1:8787, compat mount `openrouter`),
Headroom proxy (127.0.0.1:8788, OPENAI_TARGET_API_URL=https://openrouter.ai/api/v1).
Prints the prompt_tokens the provider reports for each. Streams, like opencode and Claude Code.
Needs BKIT_OPENROUTER_API_KEY. Costs a few cents per run at the default model.

--host pins one OpenRouter host (default deepinfra): unpinned, OpenRouter routes each request to
a different host and some report prompt_tokens inconsistently (one doubled them).
The caveman request carries caveman's retrieve tool: without it caveman leaves a streamed
request uncompressed (see bkit-caveman-headroom-compression-proxy-comparison.md).
"""
import json
import os
import sys
import urllib.request

ROUTES = {
    "direct": "https://openrouter.ai/api/v1",
    "caveman": "http://127.0.0.1:8787/w/opencode/compat/openrouter/v1",
    "headroom": "http://127.0.0.1:8788/v1",
}
CAVEMAN_RETRIEVE = {"type": "function", "function": {
    "name": "caveman_caveman_retrieve", "description": "Retrieve original bytes for a caveman recovery handle",
    "parameters": {"type": "object", "properties": {"handle": {"type": "string"}}, "required": ["handle"]}}}


def body(payload, model, host, route):
    data = {
        "model": model,
        "max_tokens": 40,
        "provider": {"only": [host], "allow_fallbacks": False},
        "stream": True,
        "stream_options": {"include_usage": True},
        "tools": [{"type": "function", "function": {
            "name": "bash", "description": "Run a shell command",
            "parameters": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}}}],
        "messages": [
            {"role": "user", "content": "Summarise the output below in one line."},
            {"role": "assistant", "content": None, "tool_calls": [{"id": "call_1", "type": "function",
                "function": {"name": "bash", "arguments": json.dumps({"command": "cat payload"})}}]},
            {"role": "tool", "tool_call_id": "call_1", "content": payload},
        ],
    }
    if route == "caveman":
        data["tools"].append(CAVEMAN_RETRIEVE)
    return data


def prompt_tokens(base, data):
    req = urllib.request.Request(base + "/chat/completions", data=json.dumps(data).encode(), headers={
        "Authorization": "Bearer " + os.environ["BKIT_OPENROUTER_API_KEY"], "Content-Type": "application/json"})
    usage = None
    with urllib.request.urlopen(req, timeout=180) as resp:
        for raw in resp:
            line = raw.decode().strip()
            if line.startswith("data:") and line != "data: [DONE]":
                usage = json.loads(line[5:]).get("usage") or usage
    return usage["prompt_tokens"] if usage else None


def main():
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        sys.exit(__doc__)
    if "BKIT_OPENROUTER_API_KEY" not in os.environ:
        sys.exit("BKIT_OPENROUTER_API_KEY is not set")
    model = args[args.index("--model") + 1] if "--model" in args else "deepseek/deepseek-v4.1-flash"
    host = args[args.index("--host") + 1] if "--host" in args else "deepinfra"
    payload = open(args[0], errors="replace").read()
    direct = None
    for name, base in ROUTES.items():
        try:
            n = prompt_tokens(base, body(payload, model, host, name))
        except Exception as e:  # report and keep going so one dead proxy does not hide the others
            print(f"{name:<9} FAILED: {e}")
            continue
        direct = n if name == "direct" else direct
        saved = f"  ({1 - n / direct:.0%} smaller than direct)" if direct and name != "direct" else ""
        print(f"{name:<9} prompt_tokens={n:>8,}{saved}")


if __name__ == "__main__":
    main()
