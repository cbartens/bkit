/**
 * bkit-prs-parity.test.ts — `bkit prs scan-body|cross-check|transport-row|guard-checkout`
 * answer as the `bkit-runtime.sh` close-guard functions they replace, while both exist.
 *
 * The workflows still source `bkit-runtime.sh` for `bkit_close_guard_*` and the two
 * row emitters until they are rewritten onto `bkit prs`. Exit codes differ by design
 * where the shell used 2 for both "bad argument" and "could not read": the command
 * splits those into 2 (usage) and 3 (unreadable), so parity is 0 = 0, 1 = 1, and
 * shell 2 = command 2 or 3. Retire this file together with those functions.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { runCommand } from "./commands/lib";
import { prsCommand } from "./commands/workflow/prs";

const RUNTIME_SH = path.resolve(__dirname, "../templates/.bkit/scripts/bkit-runtime.sh");
const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prs-parity-")));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

/** Every shell query in ONE process; each prints `<id>\t<exit>\t<stdout>`. */
function shellAll(cwd: string, queries: Record<string, string>) {
  const body = Object.entries(queries)
    .map(
      ([id, q]) =>
        `o=$(${q} 2>/dev/null); printf '%s\\t%s\\t%s\\n' "${id}" "$?" "$(printf '%s' "$o" | tr '\\n' ' ')"`,
    )
    .join("\n");
  const res = spawnSync("sh", ["-c", `. "${RUNTIME_SH}"\n${body}`], { cwd, encoding: "utf-8" });
  const out: Record<string, { code: number; out: string }> = {};
  for (const line of res.stdout.split("\n").filter(Boolean)) {
    const [id, code, text] = line.split("\t");
    out[id!] = { code: Number(code), out: (text ?? "").trim() };
  }
  return out;
}

async function command(cwd: string, argv: string[]) {
  const out: string[] = [];
  const code = (await runCommand(argv, [prsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: () => undefined },
  }))!;
  return {
    code,
    json: out.length ? (JSON.parse(out.join("")) as Record<string, unknown>) : undefined,
  };
}

const sameOutcome = (shell: number, cmd: number) =>
  shell === 2 ? [2, 3].includes(cmd) : cmd === shell;

// ---------------------------------------------------------------------------

const repo = path.join(dir, "repo");
fs.mkdirSync(repo);
git(repo, "init", "-q", "-b", "main");
const commits: Record<string, string> = {};
for (const [id, msgs] of Object.entries({
  bodyToken: ["docs(x): close", "* chore(y): setup bkit [skip ci]"],
  bodyTokenUpper: ["docs(x): close", "* chore(y): setup bkit [ACTIONS SKIP]"],
  clean: ["docs(x): close DONE", "plain body"],
  subjectToken: ["docs(x): design DONE bkit [skip ci]"],
})) {
  git(repo, "commit", "-q", "--allow-empty", ...msgs.flatMap((m) => ["-m", m]));
  commits[id] = git(repo, "rev-parse", "HEAD");
}
commits.unreadable = "0".repeat(40);

describe("scan-body matches bkit_close_guard_scan_body", () => {
  const shell = shellAll(
    repo,
    Object.fromEntries(
      Object.entries(commits).map(([id, sha]) => [id, `bkit_close_guard_scan_body '${sha}'`]),
    ),
  );
  for (const [id, sha] of Object.entries(commits)) {
    it(id, async () => {
      const cmd = await command(repo, ["prs", "scan-body", `--sha=${sha}`]);
      expect(
        sameOutcome(shell[id]!.code, cmd.code),
        `shell ${shell[id]!.code} vs command ${cmd.code}`,
      ).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------

const resolved = (githubCli: unknown) => ({
  type: "runtime-resolved",
  workflow: "design",
  at: "2026-07-24T00:00:00Z",
  runtimeWorktrees: true,
  runtimeDevPushes: true,
  runtimeGithubCli: githubCli,
  runtimeGithubCliErr: 'x509: C:\\Users "q"',
});
const fallback = {
  type: "transport-fallback",
  from: "gh pr merge",
  to: "m",
  reason: "r",
  assertedBy: "a",
  at: "t",
};

const LOGS: Record<string, object[] | string> = {
  ghDown: [resolved(false)],
  ghDownWithFallback: [resolved(false), fallback],
  ghUp: [resolved(true)],
  latestWins: [resolved(true), resolved(false)],
  noRuntimeRow: [],
  malformed: "{not json\n",
};
const logFile = (id: string) => path.join(dir, `${id}.jsonl`);
for (const [id, rows] of Object.entries(LOGS)) {
  fs.writeFileSync(
    logFile(id),
    typeof rows === "string" ? rows : rows.map((r) => `${JSON.stringify(r)}\n`).join(""),
  );
}

describe("cross-check matches bkit_close_guard_cross_check", () => {
  const cases = Object.keys(LOGS).flatMap((id) =>
    ["mcp", "gh", "git"].map((t) => [id, t] as const),
  );
  cases.push(["missing", "mcp"]);
  const shell = shellAll(
    dir,
    Object.fromEntries(
      cases.map(([id, t]) => [`${id}-${t}`, `bkit_close_guard_cross_check '${logFile(id)}' ${t}`]),
    ),
  );
  for (const [id, t] of cases) {
    it(`${id} / ${t}`, async () => {
      const cmd = await command(dir, [
        "prs",
        "cross-check",
        `--file=${logFile(id)}`,
        `--transport=${t}`,
      ]);
      const sh = shell[`${id}-${t}`]!.code;
      expect(sameOutcome(sh, cmd.code), `shell ${sh} vs command ${cmd.code}`).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------

describe("transport-row writes the rows the shell emitters print", () => {
  const AT = "2026-07-24T00:00:00Z";
  const shell = shellAll(dir, {
    fallback: `bkit_transport_fallback_row 'gh pr merge --squash' 'merge_pull_request' 'C:\\temp\\new "x"' 'pull_request_read' '${AT}'`,
    close: `bkit_close_transport_row push deadbeef skip-token-found '${AT}'`,
  });
  const strip = (row: Record<string, unknown>) => {
    const { at: _at, ...rest } = row;
    return rest;
  };

  it("fallback", async () => {
    const file = path.join(dir, "rows-fallback.jsonl");
    fs.writeFileSync(file, "");
    const cmd = await command(dir, [
      "prs",
      "transport-row",
      `--file=${file}`,
      "--kind=fallback",
      "--from=gh pr merge --squash",
      "--to=merge_pull_request",
      '--reason=C:\\temp\\new "x"',
      "--asserted-by=pull_request_read",
    ]);
    const sh = JSON.parse(shell.fallback!.out) as Record<string, unknown>;
    expect(strip(cmd.json!.row as Record<string, unknown>)).toEqual(strip(sh));
    expect(Object.keys(cmd.json!.row as object)).toEqual(Object.keys(sh));
  });

  it("close", async () => {
    const file = path.join(dir, "rows-close.jsonl");
    fs.writeFileSync(file, "");
    const cmd = await command(dir, [
      "prs",
      "transport-row",
      `--file=${file}`,
      "--kind=close",
      "--shape=push",
      "--sha=deadbeef",
      "--scan-result=skip-token-found",
    ]);
    const sh = JSON.parse(shell.close!.out) as Record<string, unknown>;
    expect(strip(cmd.json!.row as Record<string, unknown>)).toEqual(strip(sh));
    expect(Object.keys(cmd.json!.row as object)).toEqual(Object.keys(sh));
  });
});

// ---------------------------------------------------------------------------

describe("guard-checkout matches bkit_close_guard_checkout", () => {
  for (const [worktrees, devPushes] of [
    [true, true],
    [false, true],
    [true, false],
  ] as const) {
    it(`worktrees=${worktrees} devPushes=${devPushes}`, async () => {
      const r = fs.realpathSync(fs.mkdtempSync(path.join(dir, "guard-")));
      git(r, "init", "-q", "-b", "main");
      git(r, "commit", "-q", "--allow-empty", "-m", "init");
      git(r, "branch", "dev");
      const sh = spawnSync(
        "sh",
        [
          "-c",
          `. "${RUNTIME_SH}" && bkit_close_guard_checkout dev && git branch --show-current > seen-shell`,
        ],
        {
          cwd: r,
          encoding: "utf-8",
          env: {
            ...process.env,
            RUNTIME_WORKTREES: String(worktrees),
            RUNTIME_DEVPUSHES: String(devPushes),
          },
        },
      );
      const afterShell = git(r, "branch", "--show-current");
      const file = path.join(r, "status.jsonl");
      fs.writeFileSync(
        file,
        `${JSON.stringify({ type: "runtime-resolved", workflow: "build", at: "t", runtimeWorktrees: worktrees, runtimeDevPushes: devPushes })}\n`,
      );
      const cmd = await command(r, [
        "prs",
        "guard-checkout",
        `--file=${file}`,
        "--target=dev",
        "--run=git branch --show-current > seen-command",
      ]);

      expect(sh.status === 0, "shell allowed").toBe(cmd.code === 0);
      expect(afterShell).toBe("main");
      expect(git(r, "branch", "--show-current")).toBe("main");
      const seen = (f: string) =>
        fs.existsSync(path.join(r, f)) ? fs.readFileSync(path.join(r, f), "utf-8").trim() : null;
      expect(seen("seen-command")).toBe(seen("seen-shell"));
    });
  }
});
