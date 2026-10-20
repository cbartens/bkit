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
// .husky/pre-push tag-only skip — bkit's own hook only. A real repo holds commit A on
// `refs/remotes/origin/main` and commit B on no remote branch; stub `pnpm` records each gate.
// ---------------------------------------------------------------------------

describe(".husky/pre-push tag-only push (bkit repo only)", () => {
  const ZERO = "0".repeat(40);
  const REPO = process.cwd();
  let tmp: string;
  let onOrigin: string;
  let localOnly: string;

  const gitIn = (...args: string[]) =>
    spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
      cwd: tmp,
      encoding: "utf-8",
    }).stdout.trim();

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-tag-")));
    fs.mkdirSync(path.join(tmp, "bin"));
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      `#!/bin/sh\necho "$*" >> "${tmp}/pnpm.log"\nexit 1\n`,
      { mode: 0o755 },
    );
    gitIn("init", "-q", "-b", "dev");
    gitIn("commit", "-q", "--allow-empty", "-m", "a");
    onOrigin = gitIn("rev-parse", "HEAD");
    gitIn("update-ref", "refs/remotes/origin/main", onOrigin);
    gitIn("tag", "-a", "v1.0.0", "-m", "release", onOrigin);
    gitIn("commit", "-q", "--allow-empty", "-m", "b");
    localOnly = gitIn("rev-parse", "HEAD");
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const runHook = (hook: string, stdin: string) => {
    const result = spawnSync("sh", [path.join(REPO, hook), "origin", "git@example:o/r.git"], {
      cwd: tmp,
      input: stdin,
      encoding: "utf-8",
      timeout: 10_000,
      env: { ...process.env, PATH: `${path.join(tmp, "bin")}:${process.env.PATH}` },
    });
    return { status: result.status, gated: fs.existsSync(path.join(tmp, "pnpm.log")) };
  };
  const tagObject = () => gitIn("rev-parse", "refs/tags/v1.0.0");

  it("annotated tag on a commit origin holds → exits 0 without running a gate", () => {
    const stdin = `refs/tags/v1.0.0 ${tagObject()} refs/tags/v1.0.0 ${ZERO}\n`;
    expect(runHook(".husky/pre-push", stdin)).toEqual({ status: 0, gated: false });
  });

  it("tag delete alongside that tag → still skipped", () => {
    const stdin =
      `refs/tags/v1.0.0 ${tagObject()} refs/tags/v1.0.0 ${ZERO}\n` +
      `(delete) ${ZERO} refs/tags/old ${onOrigin}\n`;
    expect(runHook(".husky/pre-push", stdin)).toEqual({ status: 0, gated: false });
  });

  it("tag on a commit no origin branch holds → gates run", () => {
    const r = runHook(".husky/pre-push", `refs/tags/v2 ${localOnly} refs/tags/v2 ${ZERO}\n`);
    expect(r.gated).toBe(true);
    expect(r.status).not.toBe(0);
  });

  it("tag pushed with a branch → gates run", () => {
    const stdin =
      `refs/tags/v1.0.0 ${tagObject()} refs/tags/v1.0.0 ${ZERO}\n` +
      `refs/heads/dev ${localOnly} refs/heads/dev ${onOrigin}\n`;
    const r = runHook(".husky/pre-push", stdin);
    expect(r.gated).toBe(true);
    expect(r.status).not.toBe(0);
  });

  it(".bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push", () => {
    const stdin = `refs/tags/v1.0.0 ${tagObject()} refs/tags/v1.0.0 ${ZERO}\n`;
    expect(runHook(".bkit/templates/.husky/pre-push", stdin).gated).toBe(true);
  });
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

// ---------------------------------------------------------------------------
// .husky/pre-push tmp/ prune — the hook runs scripts/cleanup/bkit-tmp-prune.mjs when the
// copy exists, before any gate, and a failing prune never blocks the push.
// ---------------------------------------------------------------------------

describe(".husky/pre-push tmp/ prune", () => {
  const REPO = process.cwd();
  const SHA = "a".repeat(40);
  const UPDATE = `refs/heads/dev ${SHA} refs/heads/dev ${"0".repeat(40)}\n`;
  let tmp: string;

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-prune-")));
    fs.mkdirSync(path.join(tmp, "bin"));
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      `#!/bin/sh\necho "$*" >> "${tmp}/pnpm.log"\nexit 0\n`,
      { mode: 0o755 },
    );
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const oldFile = (rel: string) => {
    const abs = path.join(tmp, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, "x");
    const t = Date.now() / 1000 - 30 * 24 * 60 * 60;
    fs.utimesSync(abs, t, t);
    return abs;
  };

  const adopt = (script: string) => {
    fs.mkdirSync(path.join(tmp, "scripts", "cleanup"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "scripts", "cleanup", "bkit-tmp-prune.mjs"), script);
  };

  const runHook = (hook: string) => {
    const result = spawnSync("sh", [path.join(REPO, hook)], {
      cwd: tmp,
      input: UPDATE,
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
    it(`${hook}: adopted script → old tmp/ files go, then the gates run`, () => {
      adopt(
        fs.readFileSync(
          path.join(REPO, ".bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs"),
          "utf-8",
        ),
      );
      const old = oldFile("tmp/old.log");
      const r = runHook(hook);
      expect(r.status).toBe(0);
      expect(fs.existsSync(old)).toBe(false);
      expect(r.gates).toContain("bkit:gate:static-unit");
    });

    it(`${hook}: no adopted script → tmp/ untouched, gates still run`, () => {
      const old = oldFile("tmp/old.log");
      const r = runHook(hook);
      expect(r.status).toBe(0);
      expect(fs.existsSync(old)).toBe(true);
      expect(r.gates).toContain("bkit:gate:static-unit");
    });

    it(`${hook}: failing prune → warns, push not blocked`, () => {
      adopt("process.exit(1);\n");
      const r = runHook(hook);
      expect(r.status).toBe(0);
      expect(r.stderr).toContain("tmp/ prune failed; push continues");
      expect(r.gates).toContain("bkit:gate:static-unit");
    });
  }
});

// ---------------------------------------------------------------------------
// .husky/pre-push disk prune — `bkit disk prune --mode=max --auto` is the hook's last
// call, made only once every gate passed, and its failure never blocks the push.
// ---------------------------------------------------------------------------

describe(".husky/pre-push disk prune", () => {
  const REPO = process.cwd();
  const UPDATE = `refs/heads/dev ${"a".repeat(40)} refs/heads/dev ${"0".repeat(40)}\n`;
  const PRUNE = "-s bkit disk prune --mode=max --auto";
  let tmp: string;

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-disk-")));
    fs.mkdirSync(path.join(tmp, "bin"));
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  /** Run `hook` with a stub pnpm that logs each call and fails the calls matching `fail`. */
  const runHook = (hook: string, fail: string) => {
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      `#!/bin/sh\necho "$*" >> "${tmp}/pnpm.log"\ncase "$*" in ${fail}) exit 1 ;; esac\nexit 0\n`,
      { mode: 0o755 },
    );
    const result = spawnSync("sh", [path.join(REPO, hook)], {
      cwd: tmp,
      input: UPDATE,
      encoding: "utf-8",
      timeout: 20_000,
      env: { ...process.env, PATH: `${path.join(tmp, "bin")}:${process.env.PATH}` },
    });
    const log = path.join(tmp, "pnpm.log");
    const calls = fs.existsSync(log) ? fs.readFileSync(log, "utf-8").trim().split("\n") : [];
    return { status: result.status, stderr: result.stderr, calls };
  };

  for (const hook of [".bkit/templates/.husky/pre-push", ".husky/pre-push"]) {
    it(`${hook}: every gate passes → the disk prune is the last call`, () => {
      const r = runHook(hook, "*skip-token*");
      expect(r.status).toBe(0);
      expect(r.calls).toContain("bkit check");
      expect(r.calls.at(-1)).toBe(PRUNE);
    });

    it(`${hook}: a gate fails → no disk prune`, () => {
      const r = runHook(hook, "*skip-token*|bkit:gate:static-unit");
      expect(r.status).not.toBe(0);
      expect(r.calls).not.toContain(PRUNE);
    });

    it(`${hook}: the disk prune fails → warns, push not blocked`, () => {
      const r = runHook(hook, "*skip-token*|*disk*");
      expect(r.status).toBe(0);
      expect(r.stderr).toContain("disk prune failed; push continues");
    });
  }
});

// ---------------------------------------------------------------------------
// graphify register gate — shipped snippet run for real. Stub
// `scripts/graphify/bkit-graphify.sh` logs its args and fails `check-at` on request; stub
// `graphify` on PATH = installed. PATH cut to system dirs so a real graphify cannot answer.
// ---------------------------------------------------------------------------

describe("graphify register pre-push gate", () => {
  const REPO = process.cwd();
  const SNIPPET = ".bkit/templates/scripts/graphify/bkit-graph-pre-push.sh";
  const SHA = "b".repeat(40);
  let tmp: string;

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-graph-")));
    fs.mkdirSync(path.join(tmp, "bin"));
    fs.mkdirSync(path.join(tmp, "docs"));
    fs.writeFileSync(path.join(tmp, "docs", "capabilities.md"), "# Capabilities\n");
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  /** Adopt a stub wrapper; `check-at` exits `checkStatus`, `spec` prints a pin. */
  const adopt = (checkStatus: number) => {
    fs.mkdirSync(path.join(tmp, "scripts", "graphify"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "scripts", "graphify", "bkit-graphify.sh"),
      `echo "$*" >> "${tmp}/graph.log"\n` +
        `[ "$1" = spec ] && { echo 'graphifyy[sql]==9.9.9'; exit 0; }\n` +
        `exit ${checkStatus}\n`,
    );
  };
  const installGraphify = () =>
    fs.writeFileSync(path.join(tmp, "bin", "graphify"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });

  const run = (env: Record<string, string>) => {
    const result = spawnSync("sh", [path.join(REPO, SNIPPET)], {
      cwd: tmp,
      encoding: "utf-8",
      timeout: 10_000,
      env: { PATH: `${path.join(tmp, "bin")}:/usr/bin:/bin`, HOME: tmp, ...env },
    });
    const log = path.join(tmp, "graph.log");
    return {
      status: result.status,
      stderr: result.stderr,
      calls: fs.existsSync(log) ? fs.readFileSync(log, "utf-8") : "",
    };
  };

  it("push to dev, register stale → blocked, check-at ran on the pushed commit", () => {
    adopt(1);
    installGraphify();
    const r = run({ PUSH_DEV_SHA: SHA });
    expect(r.status).toBe(1);
    expect(r.calls).toContain(`check-at ${SHA}`);
    expect(r.stderr).toContain(
      "BLOCKED: docs/capabilities.md is not what the pushed commit builds",
    );
  });

  it("push to dev, register current → push goes on", () => {
    adopt(0);
    installGraphify();
    const r = run({ PUSH_DEV_SHA: SHA });
    expect(r.status).toBe(0);
    expect(r.calls).toContain(`check-at ${SHA}`);
  });

  it("push to dev, graphify not installed → loud NOT-checked warning, push goes on", () => {
    adopt(1);
    const r = run({ PUSH_DEV_SHA: SHA });
    expect(r.status).toBe(0);
    expect(r.calls).not.toContain("check-at");
    expect(r.stderr).toContain("docs/capabilities.md was NOT checked");
    expect(r.stderr).toContain("uv tool install 'graphifyy[sql]==9.9.9'");
  });

  it("push to another branch → no check, push goes on", () => {
    adopt(1);
    installGraphify();
    const r = run({ PUSH_DEV_SHA: "" });
    expect(r.status).toBe(0);
    expect(r.calls).toBe("");
  });

  it("revert push to dev → no check, push goes on", () => {
    adopt(1);
    installGraphify();
    const r = run({ PUSH_DEV_SHA: SHA, IS_REVERT: "1" });
    expect(r.status).toBe(0);
    expect(r.calls).toBe("");
  });

  it("graphify not adopted → nothing runs", () => {
    installGraphify();
    const r = run({ PUSH_DEV_SHA: SHA });
    expect(r.status).toBe(0);
    expect(r.stderr).toBe("");
  });

  // bkit's own hook carries the snippet: git's stdin ref reaches it as PUSH_DEV_SHA only for
  // a push to dev. Stub pnpm passes every gate, reports no skip-CI token.
  const runRepoHook = (stdin: string) => {
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      `#!/bin/sh\ncase "$*" in *skip-token*) exit 1 ;; esac\nexit 0\n`,
      { mode: 0o755 },
    );
    return spawnSync("sh", [path.join(REPO, ".husky/pre-push")], {
      cwd: tmp,
      input: stdin,
      encoding: "utf-8",
      timeout: 20_000,
      env: { PATH: `${path.join(tmp, "bin")}:/usr/bin:/bin`, HOME: tmp },
    });
  };

  it(".husky/pre-push: push to dev → the register gate checks the pushed commit and blocks", () => {
    adopt(1);
    installGraphify();
    const r = runRepoHook(`refs/heads/dev ${SHA} refs/heads/dev ${"0".repeat(40)}\n`);
    expect(r.status).toBe(1);
    expect(fs.readFileSync(path.join(tmp, "graph.log"), "utf-8")).toContain(`check-at ${SHA}`);
  });

  it(".husky/pre-push: push to a feature branch → the register gate does not run", () => {
    adopt(1);
    installGraphify();
    const r = runRepoHook(`refs/heads/x ${SHA} refs/heads/feature ${"0".repeat(40)}\n`);
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(tmp, "graph.log"))).toBe(false);
  });
});
