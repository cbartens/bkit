#!/usr/bin/env python3
"""Measure RTK's Claude Code hook on the same samples bkit-compression-replay.py used.

    bkit-compression-rtk-replay.py <dump-dir> <replay.jsonl> <out.jsonl> --repo <dir> [--rtk <bin>] [--plan]

<dump-dir>      from bkit-compression-usage.py --dump
<replay.jsonl>  from bkit-compression-replay.py; its (tool, file) pairs are the samples, so all
                three tools are measured on exactly the same results
--repo <dir>    checkout the transcripts came from; commands are re-run there
--rtk <bin>     rtk binary (default: rtk on PATH)
--plan          classify only; run nothing

RTK's hook acts before a Bash command runs: it rewrites the command (`git status` becomes
`rtk git status`) and the agent sees the rewritten command's output. A stored result can't be
fed back through that path, so each sample is classified with `rtk rewrite`:

  untouched   rtk rewrite declines (sed, git grep, for loops, heredocs, ...): saves 0
  rewritten   the command and its rewrite both run now, in --repo, and the rewrite's output size
              over the original's is applied to the stored result. Only commands whose every
              segment is on a read-only allowlist run; the rest, and re-runs whose original
              output is now under 2 KB, are "unmeasured"
  not Bash    RTK's hook sees Bash only: saves 0

rk_after for an unmeasured sample is rk_before (saves 0); rk_after_mid applies the measured
rate of the measured rewritten samples instead. bkit-compression-summary.py --rtk reads both.
RTK's tracking and recall stores go to a temp dir; telemetry is off by default.
"""
import json
import os
import shlex
import subprocess
import sys
import tempfile

SEPARATORS = {"&&", "||", ";", "|", "&", "|&"}
SAFE = {"cd", "grep", "rg", "ls", "wc", "head", "tail", "cat", "sort", "uniq", "cut", "tr", "echo", "printf", "true", "jq", "column", "nl"}
SAFE_SUB = {
    "git": {"log", "diff", "show", "status", "branch", "ls-files", "blame", "rev-parse", "shortlog"},
    "gh": {("issue", "view"), ("issue", "list"), ("pr", "view"), ("pr", "list"), ("pr", "checks"), ("pr", "diff"), ("run", "list"), ("run", "view")},
    "find": None,
}
UNSAFE_TOKENS = {">", ">>", ">|", "<<", "<<<", "`", "$(", "-exec", "-execdir", "-delete", "-ok", "-fprint", "--output"}


def segments(cmd):
    lex = shlex.shlex(cmd, posix=True, punctuation_chars=";&|<>()")
    lex.whitespace_split = True
    seg, out = [], []
    for tok in lex:
        if tok in SEPARATORS:
            out.append(seg)
            seg = []
        else:
            seg.append(tok)
    return out + [seg]


def read_only(cmd):
    if "$(" in cmd or "`" in cmd or "\n" in cmd:
        return False
    try:
        segs = segments(cmd)
    except ValueError:
        return False
    for seg in filter(None, segs):
        for tok, nxt in zip(seg, seg[1:] + [""]):
            # the lexer splits `2>&1` into 2 / >& / 1; only redirects to a stream or /dev/null pass
            if tok in (">", ">&") and nxt in ("1", "2", "/dev/null"):
                continue
            if tok in UNSAFE_TOKENS or tok[:1] in ("<", ">", "(", ")"):
                return False
        head = seg[0]
        if head in SAFE:
            continue
        if head == "git" and len(seg) > 1 and seg[1] in SAFE_SUB["git"]:
            continue
        if head == "gh" and len(seg) > 2 and (seg[1], seg[2]) in SAFE_SUB["gh"]:
            continue
        if head == "find":
            continue
        return False
    return True


def run(cmd, repo, env):
    try:
        r = subprocess.run(["bash", "-c", cmd], cwd=repo, env=env, capture_output=True, timeout=60)
    except subprocess.TimeoutExpired:
        return None
    return (r.stdout + r.stderr).decode(errors="replace")


def main():
    args = sys.argv[1:]
    if len(args) < 3 or "--repo" not in args:
        sys.exit(__doc__)
    dump, samples, out = args[:3]
    repo = args[args.index("--repo") + 1]
    rtk = args[args.index("--rtk") + 1] if "--rtk" in args else "rtk"
    plan = "--plan" in args
    state = tempfile.mkdtemp(prefix="rtk-replay-")
    env = {**os.environ, "RTK_DB_PATH": os.path.join(state, "rtk.db"), "RTK_RECALL_DB": os.path.join(state, "recall.db"),
           "PATH": os.path.dirname(os.path.abspath(rtk)) + os.pathsep + os.environ["PATH"]}
    rows = [json.loads(line) for line in open(samples)]
    with open(out, "w") as fh:
        for s in rows:
            head, _, text = open(os.path.join(dump, s["tool"], s["file"]), errors="replace").read().partition("\n")
            call = json.loads(head[1:])
            row = {"tool": s["tool"], "file": s["file"], "later": s["later"], "weight": s["weight"], "rk_before": len(text) / 4}
            row["rk_after"] = row["rk_before"]
            cmd = (call.get("input") or {}).get("command") if s["tool"] == "Bash" else None
            if not cmd:
                row["rk_class"] = "not-bash"
            else:
                rw = subprocess.run([rtk, "rewrite", cmd], env=env, capture_output=True, text=True)
                rewritten = rw.stdout.strip()
                row["rk_cmd"] = cmd.split()[0] if cmd.split() else ""
                if rw.returncode != 0 or not rewritten or rewritten == cmd.strip():
                    row["rk_class"] = "untouched"
                elif not read_only(cmd):
                    row["rk_class"] = "unmeasured-unsafe"
                elif plan:
                    row["rk_class"] = "rewritten"
                else:
                    raw, mine = run(cmd, repo, env), run(rewritten, repo, env)
                    if raw is None or mine is None or len(raw) < 2048:
                        row["rk_class"] = "unmeasured-rerun"
                    else:
                        row["rk_class"] = "measured"
                        row["rk_ratio"] = min(1.0, len(mine) / len(raw))
                        row["rk_after"] = row["rk_before"] * row["rk_ratio"]
                row["rk_rewrite"] = rewritten[:200]
            fh.write(json.dumps(row) + "\n")
            fh.flush()
    measured = [r for r in map(json.loads, open(out)) if r["rk_class"] == "measured"]
    rate = 1 - sum(r["rk_after"] * r["weight"] for r in measured) / (sum(r["rk_before"] * r["weight"] for r in measured) or 1)
    final = []
    for r in map(json.loads, open(out)):
        unmeasured = r["rk_class"].startswith("unmeasured")
        r["rk_after_mid"] = r["rk_before"] * (1 - rate) if unmeasured else r["rk_after"]
        final.append(r)
    with open(out, "w") as fh:
        fh.writelines(json.dumps(r) + "\n" for r in final)


if __name__ == "__main__":
    main()
