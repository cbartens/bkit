#!/usr/bin/env python3
"""
Wrap every markdown table with `<!-- prettier-ignore -->` and strip
fixed-width padding from cells/separators. Idempotent — safe to re-run.

Per KN-161, prettier auto-aligns markdown tables with no config toggle.
The per-table escape hatch is the chosen workaround: the comment must
sit directly above the table head with no blank line between them.

Usage:
  python3 tooling/prettier/insert-prettier-ignore.py [path ...]

Defaults to `.agents`, `docs`, and `README.md` if no paths are supplied.
Skips tables inside fenced code blocks (``` / ~~~). Skips tables already
wrapped.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SEPARATOR_CELL = re.compile(r"^:?-{1,}:?$")
# Split a table row's inner body on column-delimiter pipes only. A pipe
# escaped as `\|` is literal cell content (GFM) and must NOT split the row —
# prettier preserves it, so we must too, else `a\|b` corrupts to `a\ | b`.
UNESCAPED_PIPE = re.compile(r"(?<!\\)\|")
INLINE_CODE = re.compile(r"`[^`\n]*`")


def escape_code_span_pipes(line: str) -> str:
    """Escape every unescaped `|` inside this row's inline-code spans."""

    def repl(m: re.Match[str]) -> str:
        return UNESCAPED_PIPE.sub(r"\\|", m.group(0))

    return INLINE_CODE.sub(repl, line)


def maybe_escape(line: str, ncols: int) -> str:
    """Escape code-span pipes only when doing so restores the column count.

    Per GFM a pipe delimits a cell even inside a code span — `|| echo` in a
    cell is already TWO cells. Splitting and rejoining it verbatim rewrites
    it as ` |  | echo` and destroys the content, so it must be escaped to
    `\\|` first.

    But a row whose span pipe is ALREADY a live column delimiter (damage
    that predates this script, or a deliberately split cell) must be left
    alone — escaping it would merge two real cells. The separator row is the
    arbiter: escape only if the escaped row lands exactly on the table's
    column count. Comparing against the separator rather than against
    whitespace makes the decision stable across repeat runs.
    """
    if not is_pipe_row(line) or "`" not in line:
        return line
    escaped = escape_code_span_pipes(line)
    if escaped == line:
        return line
    if len(split_cells(escaped.rstrip("\n").strip()[1:-1])) == ncols:
        return escaped
    return line


def split_cells(inner: str) -> list[str]:
    return [c.strip() for c in UNESCAPED_PIPE.split(inner)]


def is_separator_row(line: str) -> bool:
    s = line.strip()
    if not s.startswith("|") or not s.endswith("|"):
        return False
    cells = split_cells(s[1:-1])
    if not cells:
        return False
    return all(SEPARATOR_CELL.match(c) for c in cells if c != "")


def is_pipe_row(line: str) -> bool:
    s = line.strip()
    return s.startswith("|") and s.endswith("|") and s.count("|") >= 2


def strip_cell_padding(line: str) -> str:
    if not is_pipe_row(line):
        return line
    nl = "\n" if line.endswith("\n") else ""
    body = line.rstrip("\n").rstrip()
    leading_ws = line[: len(line) - len(line.lstrip(" "))]
    cells = split_cells(body.strip()[1:-1])
    return leading_ws + "| " + " | ".join(cells) + " |" + nl


def normalize_separator(line: str) -> str:
    if not is_pipe_row(line):
        return line
    nl = "\n" if line.endswith("\n") else ""
    body = line.rstrip("\n").strip()
    leading_ws = line[: len(line) - len(line.lstrip(" "))]
    cells = split_cells(body[1:-1])
    out = []
    for c in cells:
        left = c.startswith(":")
        right = c.endswith(":")
        if left and right:
            out.append(":---:")
        elif right:
            out.append("---:")
        elif left:
            out.append(":---")
        else:
            out.append("---")
    return leading_ws + "| " + " | ".join(out) + " |" + nl


def process_text(src: str) -> str:
    lines = src.splitlines(keepends=True)
    out: list[str] = []
    in_fence = False
    fence_marker = ""
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.lstrip()
        # Track fenced code blocks (``` or ~~~)
        if not in_fence and (stripped.startswith("```") or stripped.startswith("~~~")):
            in_fence = True
            fence_marker = "```" if stripped.startswith("```") else "~~~"
            out.append(line)
            i += 1
            continue
        if in_fence:
            if stripped.startswith(fence_marker):
                in_fence = False
                fence_marker = ""
            out.append(line)
            i += 1
            continue
        # Detect table head (header row followed by separator row)
        is_table_head = (
            is_pipe_row(line)
            and i + 1 < len(lines)
            and is_separator_row(lines[i + 1])
        )
        if is_table_head:
            # Look back through any trailing blank lines for an existing prettier-ignore
            already_wrapped = False
            scan = len(out) - 1
            while scan >= 0 and out[scan].strip() == "":
                scan -= 1
            if scan >= 0 and "<!-- prettier-ignore" in out[scan]:
                already_wrapped = True
            if not already_wrapped:
                # Drop trailing blank lines so the comment sits directly above the head
                while out and out[-1].strip() == "":
                    out.pop()
                # Preserve a blank line above the comment when there is content above
                if out and out[-1].rstrip("\n").strip() != "":
                    out.append("\n")
                out.append("<!-- prettier-ignore -->\n")
            else:
                # Already wrapped — preserve any blank lines we walked over
                # (they were already appended; nothing to undo)
                pass
            # Column count comes from the separator — the one row that
            # cannot contain a code span, so it is never itself ambiguous.
            sep = lines[i + 1]
            ncols = len(split_cells(sep.rstrip("\n").strip()[1:-1]))
            out.append(strip_cell_padding(maybe_escape(line, ncols)))
            out.append(normalize_separator(sep))
            j = i + 2
            while j < len(lines) and is_pipe_row(lines[j]):
                out.append(strip_cell_padding(maybe_escape(lines[j], ncols)))
                j += 1
            i = j
            continue
        out.append(line)
        i += 1
    return "".join(out)


def process_file(path: Path) -> bool:
    src = path.read_text(encoding="utf-8")
    new = process_text(src)
    if new != src:
        path.write_text(new, encoding="utf-8")
        return True
    return False


# Generated boards prettier never formats (they are in `.prettierignore`) and
# whose marker blocks a fold FULLY regenerates on every workflow close. A
# marker injected here is wiped by the next fold — pure churn — so these are
# excluded even when passed as an explicit file arg.
GENERATED_BOARDS = {Path("docs/roadmap.md")}


def is_generated_board(path: Path) -> bool:
    try:
        rel = path.resolve().relative_to(Path.cwd().resolve())
    except ValueError:
        rel = path
    return rel in GENERATED_BOARDS or path in GENERATED_BOARDS


def collect_targets(args: list[str]) -> list[Path]:
    if args:
        roots = [Path(a) for a in args]
    else:
        roots = [Path(".agents"), Path("docs"), Path("README.md")]
    files: list[Path] = []
    for root in roots:
        if root.is_file() and root.suffix == ".md":
            files.append(root)
        elif root.is_dir():
            files.extend(root.rglob("*.md"))
    files = [f for f in files if not is_generated_board(f)]
    # Exclude vendored skill docs — any file inside a `skills/` DIRECTORY
    # (.agents/skills/**, etc.); third-party content we must not reformat.
    # Checks parent dirs only (f.parent.parts), so a file merely named
    # "skills.md" or "my-skills-guide.md" is NOT excluded — only /skills/ trees.
    # An explicit file arg under skills/ is still honoured (walk results only).
    return [f for f in files if "skills" not in f.parent.parts]


def main() -> int:
    targets = collect_targets(sys.argv[1:])
    changed = 0
    for p in sorted(targets):
        if process_file(p):
            changed += 1
            print(f"updated: {p}")
    print(f"\n{changed}/{len(targets)} files updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
