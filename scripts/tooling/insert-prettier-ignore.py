#!/usr/bin/env python3
"""
Wrap every markdown table with `<!-- prettier-ignore -->` and strip
fixed-width padding from cells/separators. Idempotent — safe to re-run.

Per KN-161, prettier auto-aligns markdown tables with no config toggle.
The per-table escape hatch is the chosen workaround: the comment must
sit directly above the table head with no blank line between them.

Usage:
  python3 scripts/tooling/insert-prettier-ignore.py [--check] [path ...]

Defaults to `.agents`, `docs`, and `README.md` if no paths are supplied.
Skips tables inside fenced code blocks (``` / ~~~). Skips tables already
wrapped. `--check` writes nothing and exits non-zero if any file would
change — use it as a gate.

Exits non-zero when it finds table damage escaping cannot repair (see
audit_text), whether or not --check was passed.
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


class FenceTracker:
    """Tracks ``` / ~~~ fenced code blocks across a line-by-line walk.

    Shared by process_text and audit_text so the two can never disagree about
    what counts as fenced — a table inside a fence is illustrative text, not a
    table, and must be neither rewritten nor reported.
    """

    def __init__(self) -> None:
        self.in_fence = False
        self.marker = ""

    def feed(self, line: str) -> bool:
        """Return True when `line` opens, sits inside, or closes a fence."""
        stripped = line.lstrip()
        if not self.in_fence:
            if stripped.startswith("```") or stripped.startswith("~~~"):
                self.in_fence = True
                self.marker = "```" if stripped.startswith("```") else "~~~"
                return True
            return False
        if stripped.startswith(self.marker):
            self.in_fence = False
        return True


def process_text(src: str) -> str:
    lines = src.splitlines(keepends=True)
    out: list[str] = []
    fence = FenceTracker()
    i = 0
    while i < len(lines):
        line = lines[i]
        if fence.feed(line):
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


# The damage this script deliberately will NOT touch
# --------------------------------------------------
# Escaping is only safe where we KNOW a pipe is cell content rather than a
# column delimiter, and the one place we know that is inside an inline-code
# span (see maybe_escape). A bare pipe in plain cell prose —
# "boundary=browser | network", "3-way split: REST | Webhooks | Inngest" — is
# indistinguishable from a real delimiter without reading the sentence.
# Escaping the wrong one MERGES two genuine cells, which is worse than the
# defect it set out to fix, so these are reported for a human instead.
#
# Both shapes below are punished silently by GFM, which is why they survive
# for months in a doc nobody notices is broken:
#
#   truncated-row     A body row yields MORE cells than the separator has
#                     columns. GFM drops the overflow, so the tail of the row
#                     simply never renders.
#   unrendered-table  Header cell count != separator cell count. GFM then
#                     refuses to build a table AT ALL and emits the raw pipes
#                     as a paragraph — the whole block is lost, not one row.

Problem = tuple[int, str, str]  # (1-based line, kind, human-readable detail)


def audit_text(src: str) -> list[Problem]:
    """Report table damage that escaping cannot repair.

    Run against the POST-format text so anything this script already fixes by
    escaping is not reported twice.
    """
    lines = src.splitlines()
    fence = FenceTracker()
    problems: list[Problem] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if fence.feed(line):
            i += 1
            continue
        if not (
            is_pipe_row(line)
            and i + 1 < len(lines)
            and is_separator_row(lines[i + 1])
        ):
            i += 1
            continue
        # The separator defines the table's real width; it is the only row that
        # cannot contain a code span, so it is never itself miscounted.
        ncols = len(split_cells(lines[i + 1].strip()[1:-1]))
        nhead = len(split_cells(line.strip()[1:-1]))
        if nhead != ncols:
            problems.append(
                (
                    i + 1,
                    "unrendered-table",
                    f"header has {nhead} columns, separator has {ncols} — GFM "
                    "renders this whole block as raw text, not a table",
                )
            )
        j = i + 2
        while j < len(lines) and is_pipe_row(lines[j]):
            ncells = len(split_cells(lines[j].strip()[1:-1]))
            if ncells > ncols:
                problems.append(
                    (
                        j + 1,
                        "truncated-row",
                        f"{ncells} cells in a {ncols}-column table — GFM drops "
                        f"the last {ncells - ncols}. If a pipe is cell content, "
                        "escape it as \\|; otherwise the row carries more "
                        "values than the header has columns.",
                    )
                )
            j += 1
        i = j
    return problems


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
    # Exclude vendored skill docs — any file inside a `skills/` DIRECTORY
    # (.agents/skills/**, etc.); third-party content we must not reformat.
    # Checks parent dirs only (f.parent.parts), so a file merely named
    # "skills.md" or "my-skills-guide.md" is NOT excluded — only /skills/ trees.
    # An explicit file arg under skills/ is still honoured (walk results only).
    return [f for f in files if "skills" not in f.parent.parts]


def main() -> int:
    argv = sys.argv[1:]
    check_only = "--check" in argv
    targets = collect_targets([a for a in argv if not a.startswith("-")])

    changed = 0
    unformatted: list[Path] = []
    problems: list[tuple[Path, int, str, str]] = []

    for path in sorted(targets):
        src = path.read_text(encoding="utf-8")
        new = process_text(src)
        if new != src:
            if check_only:
                unformatted.append(path)
            else:
                path.write_text(new, encoding="utf-8")
                changed += 1
                print(f"updated: {path}")
        problems.extend((path, *pr) for pr in audit_text(new))

    if check_only:
        for path in unformatted:
            print(f"needs formatting: {path}")
        print(f"\n{len(unformatted)}/{len(targets)} files need formatting")
    else:
        print(f"\n{changed}/{len(targets)} files updated")

    if problems:
        print(
            f"\n{len(problems)} table defect(s) escaping cannot repair — a pipe "
            "in plain cell\nprose is indistinguishable from a column delimiter, "
            "so these need a human:\n"
        )
        for path, line_no, kind, detail in problems:
            print(f"  {path}:{line_no}  [{kind}]")
            print(f"      {detail}")

    return 1 if problems or unformatted else 0


if __name__ == "__main__":
    raise SystemExit(main())
