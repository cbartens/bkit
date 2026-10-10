// audits/templates/husky-pre-push.integration.test.ts — the shipped `.husky/pre-push` hook, run for real.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// .husky/pre-push delete-only skip — runs the real hook with a stub `pnpm` on PATH
// that records each gate call, feeding git's pre-push stdin shape.
// ---------------------------------------------------------------------------

describe(".husky/pre-push delete-only push", () => {
  const ZERO = "0".repeat(40);
  const SHA = "a".repeat(40);
  const REPO = process.cwd();
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-"));
    fs.mkdirSync(path.join(tmp, "bin"));
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      `#!/bin/sh\necho "$*" >> "${tmp}/pnpm.log"\nexit 1\n`,
      { mode: 0o755 },
    );
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const runHook = (hook: string, stdin: string) => {
    const result = spawnSync("sh", [path.join(REPO, hook)], {
      cwd: tmp,
      input: stdin,
      encoding: "utf-8",
      timeout: 10_000,
      env: { ...process.env, PATH: `${path.join(tmp, "bin")}:${process.env.PATH}` },
    });
    const log = path.join(tmp, "pnpm.log");
    return { status: result.status, gated: fs.existsSync(log) };
  };

  for (const hook of [".bkit/templates/.husky/pre-push", ".husky/pre-push"]) {
    it(`${hook}: every ref deleted → exits 0 without running a gate`, () => {
      const stdin =
        `(delete) ${ZERO} refs/heads/a ${SHA}\n` + `(delete) ${ZERO} refs/heads/b ${SHA}\n`;
      expect(runHook(hook, stdin)).toEqual({ status: 0, gated: false });
    });

    it(`${hook}: a delete mixed with an update → gates still run`, () => {
      const stdin =
        `(delete) ${ZERO} refs/heads/a ${SHA}\n` + `refs/heads/dev ${SHA} refs/heads/dev ${ZERO}\n`;
      const r = runHook(hook, stdin);
      expect(r.gated).toBe(true);
      expect(r.status).not.toBe(0);
    });

    it(`${hook}: empty stdin → gates still run`, () => {
      expect(runHook(hook, "").gated).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// .husky/pre-push CI-suppressor guard — the skip-CI token comes from `bkit ci
// skip-token` (the built CLI), not a regex in the hook. Stub `pnpm` routes that one
// call to dist/cli.js and records every other call; stub `gh` reports PR #7 open.
// ---------------------------------------------------------------------------

describe(".husky/pre-push CI-suppressor guard", () => {
  const REPO = process.cwd();
  const SHA = "a".repeat(40);
  let tmp: string;

  const gitIn = (cwd: string, ...args: string[]) =>
    spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
      cwd,
      encoding: "utf-8",
    });

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-skip-")));
    const bin = path.join(tmp, "bin");
    fs.mkdirSync(bin);
    fs.writeFileSync(
      path.join(bin, "pnpm"),
      [
        "#!/bin/sh",
        'if [ "$*" = "-s bkit ci skip-token" ]; then',
        `  exec node ${JSON.stringify(path.join(REPO, "dist", "cli.js"))} ci skip-token`,
        "fi",
        `echo "$*" >> "${tmp}/pnpm.log"`,
        "exit 0",
        "",
      ].join("\n"),
      { mode: 0o755 },
    );
    fs.writeFileSync(path.join(bin, "gh"), "#!/bin/sh\necho 7\n", { mode: 0o755 });
    gitIn(tmp, "init", "-q", "-b", "feat/1-x");
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const pushWithHead = (hook: string, message: string) => {
    gitIn(tmp, "commit", "-q", "--allow-empty", "-m", message);
    const result = spawnSync("sh", [path.join(REPO, hook)], {
      cwd: tmp,
      input: `refs/heads/feat/1-x ${SHA} refs/heads/feat/1-x ${"0".repeat(40)}\n`,
      encoding: "utf-8",
      timeout: 20_000,
      env: { ...process.env, PATH: `${path.join(tmp, "bin")}:${process.env.PATH}` },
    });
    const log = path.join(tmp, "pnpm.log");
    return {
      status: result.status,
      stderr: result.stderr,
      gates: fs.existsSync(log) ? fs.readFileSync(log, "utf-8") : "",
    };
  };

  for (const hook of [".bkit/templates/.husky/pre-push", ".husky/pre-push"]) {
    it(`${hook}: HEAD carrying [skip ci] with an open PR → blocked before any gate`, () => {
      const r = pushWithHead(hook, "docs(1): status bkit [skip ci]");
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("PR #7 is open");
      expect(r.gates).toBe("");
    });

    it(`${hook}: HEAD without a token → the gates run`, () => {
      const r = pushWithHead(hook, "feat(1): change");
      expect(r.stderr).not.toContain("BLOCKED");
      expect(r.gates).toContain("bkit:gate:static-unit");
    });
  }
});
