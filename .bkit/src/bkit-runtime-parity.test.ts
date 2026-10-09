/**
 * bkit-runtime-parity.test.ts — `bkit runtime`, `bkit tests`, `bkit fids` and
 * `bkit repo` answer as the shell they replace, while both exist.
 *
 * The workflows still source `bkit-runtime.sh` (`bkit_runtime_detect`,
 * `bkit_runtime_row`, `bkit_resolve_gate`) and carry the FID regexes and the
 * remote-URL sed inline until they are rewritten onto the commands. Every shell
 * answer comes from one batched bash run. Retire this file with those blocks.
 *
 * Deliberate differences are excluded from the fixtures and pinned by the
 * command tests instead: an empty gate script (the shell runs it), and the
 * shell's "0 behind" when origin/dev is unknown.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { parseRemoteUrlToSlug } from "./bkit-telemetry";
import { runCommand, type CommandSpec } from "./commands/lib";
import { FID_PATTERNS, issueIdOf } from "./commands/workflow/fids";
import { runtimeCommand } from "./commands/workflow/runtime";
import { gateScope, resolveGate } from "./commands/workflow/tests";

const RUNTIME_SH = path.resolve(__dirname, "../templates/.bkit/scripts/bkit-runtime.sh");
const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-runtime-parity-")));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));
afterEach(() => vi.unstubAllEnvs());

const bin = path.join(dir, "bin");
fs.mkdirSync(bin);
fs.writeFileSync(
  path.join(bin, "gh"),
  '#!/bin/sh\nif [ "$1 $2" = "auth status" ]; then\n  [ "${FAKE_GH_AUTH_OK:-1}" = 1 ] && exit 0\n  printf \'%s\\n\' "${FAKE_GH_ERR:-not logged in}" >&2; exit 1\nfi\nexit 1\n',
  { mode: 0o755 },
);

/** A git repo, optionally carrying the Cursor marker. */
function repo(name: string, cursor = false): string {
  const root = path.join(dir, name);
  fs.mkdirSync(root);
  spawnSync("git", ["init", "-q", root]);
  if (cursor) {
    fs.mkdirSync(path.join(root, ".bkit"));
    fs.writeFileSync(path.join(root, ".bkit", ".runtime-cursor"), "");
  }
  return root;
}

const q = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

/** Run each snippet in its own subshell of ONE bash process; each prints `<id>\t<exit>\t<stdout>`. */
function bashAll(snippets: Record<string, string>): Record<string, { code: number; out: string }> {
  const body = Object.entries(snippets)
    .map(([id, s]) => `o=$( ( ${s} ) 2>/dev/null ); printf '%s\\t%s\\t%s\\n' ${q(id)} "$?" "$o"`)
    .join("\n");
  const res = spawnSync("bash", ["-c", `. ${q(RUNTIME_SH)}\n${body}`], {
    encoding: "utf-8",
    env: { PATH: `${bin}:${process.env.PATH}`, HOME: dir },
    maxBuffer: 1 << 26,
  });
  const out: Record<string, { code: number; out: string }> = {};
  for (const line of res.stdout.split("\n").filter(Boolean)) {
    const [id, code, ...text] = line.split("\t");
    out[id!] = { code: Number(code), out: text.join("\t") };
  }
  return out;
}

async function command(cmd: CommandSpec, argv: string[], cwd: string) {
  const out: string[] = [];
  const code = (await runCommand(argv, [cmd], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: () => undefined },
  }))!;
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
}

const PRIMITIVES = [
  "BKIT_RUNTIME",
  "CLAUDE_CODE_REMOTE",
  "GITHUB_ACTIONS",
  "CI",
  "FAKE_GH_AUTH_OK",
  "FAKE_GH_ERR",
];

describe("bkit runtime detect / row = bkit_runtime_detect / bkit_runtime_row", () => {
  const plain = repo("plain");
  const cursor = repo("cursor", true);
  const CASES: Array<{ id: string; root: string; env: Record<string, string> }> = [
    { id: "local", root: plain, env: {} },
    { id: "gha", root: plain, env: { GITHUB_ACTIONS: "true" } },
    { id: "ci", root: plain, env: { CI: "1" } },
    { id: "falsy", root: plain, env: { CI: "false", GITHUB_ACTIONS: "NO" } },
    { id: "cloud", root: plain, env: { CLAUDE_CODE_REMOTE: "true", FAKE_GH_AUTH_OK: "0" } },
    { id: "ambiguous", root: plain, env: { CI: "banana" } },
    { id: "cursor", root: cursor, env: { CLAUDE_CODE_REMOTE: "true" } },
    { id: "override", root: cursor, env: { BKIT_RUNTIME: "CLOUD_CLAUDE" } },
    { id: "bad-override", root: plain, env: { BKIT_RUNTIME: "nonsense" } },
    { id: "gh-err", root: plain, env: { FAKE_GH_AUTH_OK: "0", FAKE_GH_ERR: 'C:\\Users\\x "q"' } },
  ];
  const exports = (env: Record<string, string>) =>
    Object.entries(env)
      .map(([k, v]) => `export ${k}=${q(v)};`)
      .join(" ");
  const shell = bashAll(
    Object.fromEntries(
      CASES.flatMap(({ id, root, env }) => [
        [
          `detect:${id}`,
          `${exports(env)} bkit_runtime_detect ${q(root)} 42-x && printf '%s|%s|%s|%s|%s|%s|%s' "$RUNTIME" "$RUNTIME_WORKTREES" "$RUNTIME_DEVPUSHES" "$RUNTIME_GITHUBCLI" "$RUNTIME_GITHUBCLI_EXIT" "$RUNTIME_GITHUBCLI_ERR" "$WORKTREE_PATH"`,
        ],
        [
          `row:${id}`,
          `${exports(env)} export RUNTIME_BASESHA=abc123; bkit_runtime_detect ${q(root)} 42-x && bkit_runtime_row build 2026-07-24T00:00:00Z`,
        ],
      ]),
    ),
  );

  for (const { id, root, env } of CASES) {
    it(`${id}: same table, worktree path, and row`, async () => {
      for (const k of PRIMITIVES) vi.stubEnv(k, env[k] ?? "");
      vi.stubEnv("PATH", `${bin}:${process.env.PATH}`);
      const d = await command(runtimeCommand, ["runtime", "detect", "--fid=42-x"], root);
      const j = d.json;
      expect(shell[`detect:${id}`]).toEqual({
        code: d.code,
        out: [
          j.runtime,
          j.runtimeWorktrees,
          j.runtimeDevPushes,
          j.runtimeGithubCli,
          j.runtimeGithubCliExit,
          j.runtimeGithubCliErr,
          j.worktreePath,
        ].join("|"),
      });
      const r = await command(
        runtimeCommand,
        ["runtime", "row", "--workflow=build", "--at=2026-07-24T00:00:00Z", "--base-sha=abc123"],
        root,
      );
      expect(JSON.parse(shell[`row:${id}`]!.out)).toEqual(r.json.row);
    });
  }
});

describe("resolveGate = bkit_resolve_gate", () => {
  const FIXTURES: Record<string, { pkg: string | null; gates: string[] }> = {
    deepest: {
      pkg: '{"scripts":{"bkit:gate:static-unit":"x","bkit:gate:static-unit-integration":"y"}}',
      gates: ["bkit:gate:static-unit-integration", "bkit:gate:static-unit"],
    },
    fallback: {
      pkg: '{"scripts":{"bkit:gate:static-unit":"x"}}',
      gates: ["bkit:gate:static-unit-integration", "bkit:gate:static-unit"],
    },
    none: { pkg: '{"scripts":{"test":"x"}}', gates: ["bkit:gate:static-unit"] },
    "no-scripts": { pkg: "{}", gates: ["bkit:gate:static-unit"] },
    "no-package-json": { pkg: null, gates: ["bkit:gate:static-unit"] },
    "debug-chain": {
      pkg: '{"scripts":{"bkit:gate:static-unit":"x","bkit:gate:static-unit-integration-e2e":"e"}}',
      gates: [
        "bkit:gate:static-unit-integration-e2e-live",
        "bkit:gate:static-unit-integration-e2e",
        "bkit:gate:static-unit",
      ],
    },
  };
  const roots: Record<string, string> = {};
  for (const [id, { pkg }] of Object.entries(FIXTURES)) {
    roots[id] = path.join(dir, `gate-${id}`);
    fs.mkdirSync(roots[id]!);
    if (pkg !== null) fs.writeFileSync(path.join(roots[id]!, "package.json"), pkg);
  }
  const shell = bashAll(
    Object.fromEntries(
      Object.entries(FIXTURES).map(([id, { gates }]) => [
        id,
        `cd ${q(roots[id]!)} && bkit_resolve_gate ${gates.map(q).join(" ")} >/dev/null; rc=$?; printf '%s|%s' "$rc" "$TEST_SCOPE"`,
      ]),
    ),
  );

  for (const [id, { gates }] of Object.entries(FIXTURES)) {
    it(`${id}: same scope, and "nothing declared" in both`, () => {
      const gate = resolveGate(roots[id]!, gates);
      expect(shell[id]!.out).toBe(gate === null ? "2|" : `0|${gateScope(gate)}`);
    });
  }
});

describe("FID shapes = the workflows' inline [[ =~ ]] checks", () => {
  const FIDS = [
    "341-three-runtimes",
    "341",
    "abc-123-slug",
    "ABC-123-slug",
    "my-feature",
    "-x",
    "12-34-x",
    "a",
    "has/slash",
    "341-Upper",
    "abc-x",
    "x_y",
  ];
  const BASH: Record<string, string> = {
    github: "^[0-9]+-[a-z0-9-]+$",
    linear: "^[a-z]+-[0-9]+-[a-z0-9-]+$",
    none: "^[a-z0-9][a-z0-9-]*$",
    any: "^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$",
  };
  const snippets: Record<string, string> = {};
  for (const [tracker, re] of Object.entries(BASH)) {
    for (const fid of FIDS) snippets[`${tracker}:${fid}`] = `re=${q(re)}; [[ ${q(fid)} =~ $re ]]`;
  }
  for (const fid of FIDS) {
    snippets[`issue:${fid}`] =
      `printf '%s' ${q(fid)} | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 | tr '[:lower:]' '[:upper:]'`;
  }
  const shell = bashAll(snippets);

  for (const tracker of Object.keys(BASH) as Array<keyof typeof FID_PATTERNS>) {
    it(`${tracker}: same accept / reject on every fixture`, () => {
      for (const fid of FIDS) {
        expect([fid, shell[`${tracker}:${fid}`]!.code === 0]).toEqual([
          fid,
          FID_PATTERNS[tracker].test(fid),
        ]);
      }
    });
  }

  it("auto CI_DEV issue id: same derivation for every FID the allowlist accepts", () => {
    for (const fid of FIDS.filter((f) => FID_PATTERNS.any.test(f))) {
      expect([fid, shell[`issue:${fid}`]!.out]).toEqual([fid, issueIdOf(fid, "any")]);
    }
  });
});

describe("remote slug = the workflows' sed on github remotes", () => {
  const URLS = [
    "https://github.com/cbartens/bkit.git",
    "https://github.com/cbartens/bkit",
    "git@github.com:cbartens/bkit.git",
    "ssh://git@github.com/cbartens/bkit.git",
  ];
  const shell = bashAll(
    Object.fromEntries(
      URLS.map((u) => [u, `printf '%s\\n' ${q(u)} | sed -E 's|.*github\\.com[:/]||; s|\\.git$||'`]),
    ),
  );
  for (const url of URLS) {
    it(url, () => expect(shell[url]!.out).toBe(parseRemoteUrlToSlug(url)));
  }
});
