// Every fenced shell block in `.bkit/core/workflows/*.md`, as installed, parses under
// `bash -n` and `zsh -n`: the host shell is not guaranteed bash. Tracker blocks are
// resolved first (a wired tracker and `none`), because a block marker may sit inside a
// fenced line; `{PLACEHOLDER}`s are replaced next, as the orchestrator would substitute
// them. The zsh half is skipped where zsh is not installed.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { substituteWorkflow } from "../../render/trackers";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const WORKFLOWS = path.join(REPO_ROOT, ".bkit", "core", "workflows");
const SHELL_FENCES = new Set(["bash", "sh", "zsh", "shell"]);

interface Fence {
  file: string;
  line: number;
  body: string;
  tracker?: string;
}

const TRACKERS = ["github", "none"] as const;

/**
 * The shell fences of one workflow, de-indented, placeholders replaced. A fence opened
 * with N backticks closes only on a line of N or more, so a literal block nested in a
 * longer outer fence is never read as a fence of its own.
 */
function shellFences(file: string, text: string): Fence[] {
  const lines = text.split("\n");
  const fences: Fence[] = [];
  let i = 0;
  while (i < lines.length) {
    const open = /^(\s*)(`{3,})\s*([A-Za-z0-9_+-]*)\s*$/.exec(lines[i]!);
    if (!open) {
      i += 1;
      continue;
    }
    const indent = open[1] ?? "";
    const ticks = open[2] ?? "```";
    const lang = (open[3] ?? "").toLowerCase();
    const body: string[] = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const close = /^\s*(`{3,})\s*$/.exec(lines[j]!);
      if (close && close[1]!.length >= ticks.length) break;
      body.push(lines[j]!);
    }
    if (SHELL_FENCES.has(lang)) {
      const script = body
        .map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l))
        .join("\n")
        .replace(/\{[A-Za-z][A-Za-z0-9_.-]*\}/g, "DUMMY");
      fences.push({ file, line: i + 1, body: `${script}\n` });
    }
    i = j + 1;
  }
  return fences;
}

const hasShell = (shell: string) => spawnSync(shell, ["-c", "exit 0"]).status === 0;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-fence-syntax-"));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

const fences = fs
  .readdirSync(WORKFLOWS)
  .filter((f) => /^bkit-.*\.md$/.test(f))
  .sort()
  .flatMap((f) => {
    const source = fs.readFileSync(path.join(WORKFLOWS, f), "utf-8");
    return TRACKERS.flatMap((tracker) =>
      shellFences(f, substituteWorkflow(source, tracker).output).map((fence) => ({
        ...fence,
        tracker,
      })),
    );
  });

/** `<shell> -n` over every fence; one line per fence that does not parse. */
function syntaxErrors(shell: string): string[] {
  return fences.flatMap((fence) => {
    const script = path.join(dir, `${fence.file}-${fence.tracker}-${fence.line}.sh`);
    fs.writeFileSync(script, fence.body);
    const r = spawnSync(shell, ["-n", script], { encoding: "utf-8" });
    return r.status === 0
      ? []
      : [`${fence.file} (${fence.tracker}):${fence.line}: ${r.stderr.trim()}`];
  });
}

describe("workflow shell fences", () => {
  it("finds the fences: every phase workflow has some", () => {
    const files = new Set(fences.map((f) => f.file));
    for (const w of ["auto", "build", "debug", "design", "plan", "ship"]) {
      expect(files.has(`bkit-${w}.md`), w).toBe(true);
    }
  });

  it("de-indents a list-nested fence and replaces placeholders", () => {
    const [fence] = shellFences("x.md", '1. Run:\n   ```bash\n   echo "{FID}"\n   ```\n');
    expect(fence).toEqual({ file: "x.md", line: 2, body: 'echo "DUMMY"\n' });
  });

  it("every fence parses under bash -n", { timeout: 60_000 }, () => {
    expect(syntaxErrors("bash")).toEqual([]);
  });

  it.skipIf(!hasShell("zsh"))("every fence parses under zsh -n", { timeout: 60_000 }, () => {
    expect(syntaxErrors("zsh")).toEqual([]);
  });
});

// Git, GitHub and file I/O belong to `bkit` verbs: a workflow fence never calls `git` or
// `gh`, pipes into `jq`, or removes / copies files by hand. Each allow-list entry names
// the one line shape it admits and why no verb can replace it.
const RAW_CALL = /(^|[\s;&|($`])(git|gh)\s|\|\s*jq\b|(^|[\s;&|])(rm\s+-f|cp)\s/;
const RAW_CALL_ALLOWED: ReadonlyArray<{ shape: RegExp; reason: string }> = [
  {
    shape:
      /^"\$\(dirname "\$\(git rev-parse --path-format=absolute --git-common-dir\)"\)\/node_modules\/\.bin\/bkit" repo info\b/,
    reason: "the bootstrap line that finds the bkit binary; no verb runs before it",
  },
];

/** `file: text` for each fence line making a raw call no allow-list entry admits, once per file. */
function rawCalls(list: Fence[]): string[] {
  const seen = new Set<string>();
  return list.flatMap((fence) =>
    fence.body.split("\n").flatMap((raw) => {
      const line = raw.trim();
      if (!RAW_CALL.test(line) || RAW_CALL_ALLOWED.some((a) => a.shape.test(line))) return [];
      const hit = `${fence.file}: ${line}`;
      if (seen.has(hit)) return [];
      seen.add(hit);
      return [hit];
    }),
  );
}

describe("workflow shell fences — no raw git, gh, jq or file copies", () => {
  it("every raw call is a bkit verb, bar the named allow-list", () => {
    expect(rawCalls(fences)).toEqual([]);
  });

  it("every allow-list entry still matches a shipped line", () => {
    const lines = fences.flatMap((f) => f.body.split("\n").map((l) => l.trim()));
    for (const a of RAW_CALL_ALLOWED) {
      expect(
        lines.some((l) => a.shape.test(l)),
        a.reason,
      ).toBe(true);
    }
  });

  it.each([
    ['git push origin "DUMMY"'],
    ["gh pr view 1 --json title"],
    ["B=$(git branch --show-current)"],
    ['X=$("DUMMY" counters run | jq -er .run)'],
    ['rm -f "DUMMY/.rebase-failed"'],
    ['cp "a.md" "b.md" || exit 1'],
    ['cd "DUMMY" && git diff --quiet HEAD~1 HEAD'],
  ])("flags %s", (line) => {
    expect(rawCalls([{ file: "x.md", line: 1, body: `${line}\n` }])).toHaveLength(1);
  });

  it.each([['"DUMMY" branches push --mode=plain'], ['echo "digit 1 gh-pages"']])(
    "passes %s",
    (line) => {
      expect(rawCalls([{ file: "x.md", line: 1, body: `${line}\n` }])).toEqual([]);
    },
  );
});
