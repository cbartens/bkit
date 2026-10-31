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
// .husky/pre-push log — the hook re-runs itself once with everything it prints copied to
// `tmp/pre-push.log`. Stub `pnpm` reports no skip-CI token and no min push, prints a line
// for every other call and fails it with exit 3.
// ---------------------------------------------------------------------------

describe(".husky/pre-push log", () => {
  const ZERO = "0".repeat(40);
  const SHA = "a".repeat(40);
  const REPO = process.cwd();
  const LOG_LINE = "[pre-push] log: tmp/pre-push.log";
  let tmp: string;

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-log-")));
    fs.mkdirSync(path.join(tmp, "bin"));
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      `#!/bin/sh\ncase "$*" in *skip-token*|*"ci min-push"*) exit 1 ;; esac\necho "gate: $*"\nexit 3\n`,
      { mode: 0o755 },
    );
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  /** This process's env without the logged-run marker: run inside a real push, the outer hook sets it and the hook under test would skip its log. */
  const outsideHookEnv = (): NodeJS.ProcessEnv => {
    const env = { ...process.env };
    delete env.BKIT_PRE_PUSH_LOGGED;
    return env;
  };

  const runHook = (hook: string, stdin: string) => {
    const result = spawnSync("sh", [path.join(REPO, hook)], {
      cwd: tmp,
      input: stdin,
      encoding: "utf-8",
      timeout: 10_000,
      env: { ...outsideHookEnv(), PATH: `${path.join(tmp, "bin")}:${process.env.PATH}` },
    });
    const log = path.join(tmp, "tmp", "pre-push.log");
    return {
      status: result.status,
      stderr: result.stderr,
      log: fs.existsSync(log) ? fs.readFileSync(log, "utf-8") : null,
    };
  };

  for (const hook of [".bkit/templates/.husky/pre-push", ".husky/pre-push"]) {
    it(`${hook}: failing gate → tmp/pre-push.log holds its output, exit code kept`, () => {
      const r = runHook(hook, `refs/heads/dev ${SHA} refs/heads/dev ${ZERO}\n`);
      expect(r.status).toBe(3);
      expect(r.log).toContain("gate: bkit check");
      expect(r.log).toContain("exit 3");
    });

    it(`${hook}: delete-only push → the early exit is logged, exit 0`, () => {
      const r = runHook(hook, `(delete) ${ZERO} refs/heads/a ${SHA}\n`);
      expect(r.status).toBe(0);
      expect(r.log).toContain("delete-only push");
    });

    it(`${hook}: first and last lines name the log`, () => {
      const lines = runHook(hook, `refs/heads/dev ${SHA} refs/heads/dev ${ZERO}\n`)
        .stderr.trim()
        .split("\n");
      expect(lines[0]).toBe(LOG_LINE);
      expect(lines.at(-1)).toContain(LOG_LINE);
    });

    it(`${hook}: the hook body runs once`, () => {
      const r = runHook(hook, `refs/heads/dev ${SHA} refs/heads/dev ${ZERO}\n`);
      expect(r.stderr.split("gate: bkit check").length - 1).toBe(1);
      expect(r.stderr.split(LOG_LINE).length - 1).toBe(2);
    });
  }
});

// ---------------------------------------------------------------------------
// .husky/pre-push already-tested skip — bkit's own hook only. A real repo holds commit A on
// `refs/remotes/origin/main` and `origin/dev`, commit B (same files as A) on no remote branch,
// and commit C (one more file) on no remote branch; stub `pnpm` records each gate.
// ---------------------------------------------------------------------------

describe(".husky/pre-push already-tested push (bkit repo only)", () => {
  const ZERO = "0".repeat(40);
  const REPO = process.cwd();
  let tmp: string;
  let onOrigin: string;
  let localOnly: string;
  let changed: string;

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
    gitIn("update-ref", "refs/remotes/origin/dev", onOrigin);
    gitIn("tag", "-a", "v1.0.0", "-m", "release", onOrigin);
    gitIn("commit", "-q", "--allow-empty", "-m", "b");
    localOnly = gitIn("rev-parse", "HEAD");
    fs.writeFileSync(path.join(tmp, "new.txt"), "new\n");
    gitIn("add", "new.txt");
    gitIn("commit", "-q", "-m", "c");
    changed = gitIn("rev-parse", "HEAD");
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

  it("release branch with the files of origin/dev → exits 0 without running a gate", () => {
    const stdin = `refs/heads/release/1.0.0 ${localOnly} refs/heads/release/1.0.0 ${ZERO}\n`;
    expect(runHook(".husky/pre-push", stdin)).toEqual({ status: 0, gated: false });
  });

  it("release branch and a tag, both already tested → still skipped", () => {
    const stdin =
      `refs/heads/release/1.0.0 ${localOnly} refs/heads/release/1.0.0 ${ZERO}\n` +
      `refs/tags/v1.0.0 ${tagObject()} refs/tags/v1.0.0 ${ZERO}\n`;
    expect(runHook(".husky/pre-push", stdin)).toEqual({ status: 0, gated: false });
  });

  it("branch with files no origin dev / main tip has → gates run", () => {
    const r = runHook(".husky/pre-push", `refs/heads/feat ${changed} refs/heads/feat ${ZERO}\n`);
    expect(r.gated).toBe(true);
    expect(r.status).not.toBe(0);
  });

  it("dev push with the files origin/dev already has → gates run", () => {
    const r = runHook(
      ".husky/pre-push",
      `refs/heads/dev ${localOnly} refs/heads/dev ${onOrigin}\n`,
    );
    expect(r.gated).toBe(true);
    expect(r.status).not.toBe(0);
  });

  it("main push with the files origin/main already has → gates run", () => {
    const r = runHook(
      ".husky/pre-push",
      `refs/heads/main ${localOnly} refs/heads/main ${onOrigin}\n`,
    );
    expect(r.gated).toBe(true);
    expect(r.status).not.toBe(0);
  });

  it("no origin dev / main ref fetched → a branch push gates", () => {
    gitIn("update-ref", "-d", "refs/remotes/origin/dev");
    gitIn("update-ref", "-d", "refs/remotes/origin/main");
    const stdin = `refs/heads/release/1.0.0 ${localOnly} refs/heads/release/1.0.0 ${ZERO}\n`;
    expect(runHook(".husky/pre-push", stdin).gated).toBe(true);
  });

  it(".bkit/templates/.husky/pre-push: the shipped hook gates a release branch push", () => {
    const stdin = `refs/heads/release/1.0.0 ${localOnly} refs/heads/release/1.0.0 ${ZERO}\n`;
    expect(runHook(".bkit/templates/.husky/pre-push", stdin).gated).toBe(true);
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
        'case "$*" in *"ci min-push"*) exit 1 ;; esac',
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

    it(`${hook}: no integration gate declared → the unit gate runs`, () => {
      fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ scripts: {} }));
      const gates = pushWithHead(hook, "feat(1): change").gates.split("\n");
      expect(gates).toContain("bkit:gate:static-unit");
      expect(gates).not.toContain("bkit:gate:static-unit-integration");
    });

    it(`${hook}: integration gate declared → it runs in place of the unit gate`, () => {
      const scripts = {
        "bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration",
      };
      fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ scripts }, null, 2));
      const gates = pushWithHead(hook, "feat(1): change").gates.split("\n");
      expect(gates).toContain("bkit:gate:static-unit-integration");
      expect(gates).not.toContain("bkit:gate:static-unit");
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
      `#!/bin/sh\ncase "$*" in *skip-token*|*"ci min-push"*) exit 1 ;; esac\necho "$*" >> "${tmp}/pnpm.log"\nexit 0\n`,
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
      `#!/bin/sh\ncase "$*" in *"ci min-push"*) exit 1 ;; esac\necho "$*" >> "${tmp}/pnpm.log"\ncase "$*" in ${fail}) exit 1 ;; esac\nexit 0\n`,
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
// .husky/pre-push template fast checks — `bkit check` and the capability register run BEFORE
// the gates, so a stale register or drifted install stops the push in seconds. Stub
// `scripts/graphify/bkit-graph-pre-push.sh` logs its env and exits as asked.
// ---------------------------------------------------------------------------

describe(".husky/pre-push template fast checks", () => {
  const REPO = process.cwd();
  const HOOK = ".bkit/templates/.husky/pre-push";
  const SHA = "c".repeat(40);
  const UPDATE = `refs/heads/dev ${SHA} refs/heads/dev ${"0".repeat(40)}\n`;
  let tmp: string;

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-fast-")));
    fs.mkdirSync(path.join(tmp, "bin"));
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  /** Run the template; `register` = the stub register script's exit, or null for no script. */
  const runHook = (register: number | null, fail = "*skip-token*") => {
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      `#!/bin/sh\ncase "$*" in *"ci min-push"*) exit 1 ;; esac\necho "$*" >> "${tmp}/calls.log"\ncase "$*" in ${fail}) exit 1 ;; esac\nexit 0\n`,
      { mode: 0o755 },
    );
    if (register !== null) {
      fs.mkdirSync(path.join(tmp, "scripts", "graphify"), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, "scripts", "graphify", "bkit-graph-pre-push.sh"),
        `echo "register $PUSH_DEV_SHA $IS_REVERT" >> "${tmp}/calls.log"\nexit ${register}\n`,
      );
    }
    const result = spawnSync("sh", [path.join(REPO, HOOK)], {
      cwd: tmp,
      input: UPDATE,
      encoding: "utf-8",
      timeout: 20_000,
      env: { ...process.env, PATH: `${path.join(tmp, "bin")}:${process.env.PATH}` },
    });
    const log = path.join(tmp, "calls.log");
    const calls = fs.existsSync(log) ? fs.readFileSync(log, "utf-8").trim().split("\n") : [];
    return { status: result.status, calls };
  };
  const gateAt = (calls: string[]) => calls.findIndex((c) => c.startsWith("bkit:gate"));

  it("the register runs before any gate, with the pushed dev commit", () => {
    const r = runHook(0);
    expect(r.status).toBe(0);
    const at = r.calls.indexOf(`register ${SHA} 0`);
    expect(at).toBeGreaterThanOrEqual(0);
    expect(gateAt(r.calls)).toBeGreaterThan(at);
  });

  it("a stale register stops the push before any gate runs", () => {
    const r = runHook(1);
    expect(r.status).not.toBe(0);
    expect(r.calls).toContain(`register ${SHA} 0`);
    expect(gateAt(r.calls)).toBe(-1);
  });

  it("bkit check fails → the push stops before any gate runs", () => {
    const r = runHook(0, '*skip-token*|"bkit check"');
    expect(r.status).not.toBe(0);
    expect(gateAt(r.calls)).toBe(-1);
  });

  it("the dependency audit runs before any gate, when its script is present", () => {
    fs.mkdirSync(path.join(tmp, "scripts", "ci"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "scripts", "ci", "bkit-check-dependency-audit.mjs"),
      `import { appendFileSync } from "node:fs";\nappendFileSync(${JSON.stringify(path.join(tmp, "calls.log"))}, "audit\\n");\n`,
    );
    const r = runHook(0);
    expect(r.status).toBe(0);
    const at = r.calls.indexOf("audit");
    expect(at).toBeGreaterThanOrEqual(0);
    expect(gateAt(r.calls)).toBeGreaterThan(at);
  });

  it("no dependency-audit script → skipped, the gates still run", () => {
    const r = runHook(0);
    expect(r.calls).not.toContain("audit");
    expect(gateAt(r.calls)).toBeGreaterThanOrEqual(0);
  });

  it("no register script → skipped, the gates still run", () => {
    const r = runHook(null);
    expect(r.status).toBe(0);
    expect(r.calls.some((c) => c.startsWith("register"))).toBe(false);
    expect(gateAt(r.calls)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// .husky/pre-push slop base — on a dev push the hook asks scripts/ci/lanes/
// bkit-resolve-push-base.mjs (local mode) for CI's base and hands it to the gates as
// SLOP_BASE_REF. Stub resolver logs its argv and answers a fixed base + source; stub `pnpm`
// logs each gate with the SLOP_BASE_REF it sees.
// ---------------------------------------------------------------------------

describe(".husky/pre-push slop base", () => {
  const REPO = process.cwd();
  const SHA = "c".repeat(40);
  const BASE = "a".repeat(40);
  const ORIGIN = "d".repeat(40);
  const devPush = `refs/heads/dev ${SHA} refs/heads/dev ${"0".repeat(40)}\n`;
  const featurePush = `refs/heads/feat/1-x ${SHA} refs/heads/feat/1-x ${"0".repeat(40)}\n`;
  let tmp: string;

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-slopbase-")));
    fs.mkdirSync(path.join(tmp, "bin"));
    fs.writeFileSync(
      path.join(tmp, "bin", "pnpm"),
      [
        "#!/bin/sh",
        'case "$*" in *"ci min-push"*|*"ci skip-token"*) exit 1 ;; esac',
        `echo "$* SLOP_BASE_REF=\${SLOP_BASE_REF:-}" >> "${tmp}/calls.log"`,
        "exit 0",
        "",
      ].join("\n"),
      { mode: 0o755 },
    );
    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: tmp });
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const adoptResolver = (base: string, source: string) => {
    fs.mkdirSync(path.join(tmp, "scripts", "ci", "lanes"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "scripts", "ci", "lanes", "bkit-resolve-push-base.mjs"),
      [
        'import fs from "node:fs";',
        `fs.appendFileSync(${JSON.stringify(`${tmp}/calls.log`)}, \`resolver \${process.argv.slice(2).join(" ")}\\n\`);`,
        `if (process.env.SOURCE_FILE) fs.writeFileSync(process.env.SOURCE_FILE, ${JSON.stringify(`${source}\n`)});`,
        `process.stdout.write(${JSON.stringify(`${base}\n`)});`,
        "",
      ].join("\n"),
    );
  };

  const runHook = (hook: string, stdin: string) => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PATH: `${path.join(tmp, "bin")}:${process.env.PATH}`,
    };
    delete env.SLOP_BASE_REF;
    const result = spawnSync("sh", [path.join(REPO, hook)], {
      cwd: tmp,
      input: stdin,
      encoding: "utf-8",
      timeout: 20_000,
      env,
    });
    const log = path.join(tmp, "calls.log");
    const calls = fs.existsSync(log) ? fs.readFileSync(log, "utf-8").trim().split("\n") : [];
    const gate = calls.find((c) => c.startsWith("bkit:gate")) ?? "";
    return { status: result.status, stderr: result.stderr, calls, gate };
  };

  for (const hook of [".bkit/templates/.husky/pre-push", ".husky/pre-push"]) {
    it(`${hook}: dev push → resolver in local mode on the pushed commit; the gate gets its base`, () => {
      adoptResolver(BASE, "last-green-run");
      const r = runHook(hook, devPush);
      expect(r.status).toBe(0);
      const at = r.calls.indexOf(`resolver --local --branch=dev --head=${SHA}`);
      expect(at).toBeGreaterThanOrEqual(0);
      expect(r.calls.findIndex((c) => c.startsWith("bkit:gate"))).toBeGreaterThan(at);
      expect(r.gate).toMatch(/^bkit:gate:static-unit /);
      expect(r.gate).toContain(`SLOP_BASE_REF=${BASE}`);
      expect(r.stderr).toContain(`slop base: ${BASE} (last-green-run)`);
    });

    it(`${hook}: non-dev push → no resolver call, the gate keeps the default base`, () => {
      adoptResolver(BASE, "last-green-run");
      const r = runHook(hook, featurePush);
      expect(r.status).toBe(0);
      expect(r.calls.some((c) => c.startsWith("resolver"))).toBe(false);
      expect(r.gate).toMatch(/SLOP_BASE_REF=$/);
    });

    it(`${hook}: failed run lookup → loud warning, origin/dev as the base, push goes on`, () => {
      adoptResolver(ORIGIN, "origin/dev (run lookup failed)");
      const r = runHook(hook, devPush);
      expect(r.status).toBe(0);
      expect(r.stderr).toContain("WARNING: could not read CI's last green run on dev");
      expect(r.gate).toContain(`SLOP_BASE_REF=${ORIGIN}`);
    });

    it(`${hook}: no resolver adopted → the gate keeps the default base`, () => {
      const r = runHook(hook, devPush);
      expect(r.status).toBe(0);
      expect(r.gate).toMatch(/^bkit:gate:static-unit .*SLOP_BASE_REF=$/);
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
      `#!/bin/sh\ncase "$*" in *skip-token*|*"ci min-push"*) exit 1 ;; esac\nexit 0\n`,
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

// ---------------------------------------------------------------------------
// .husky/pre-push min push — a real repo whose first commit is `origin/dev`. Stub
// `pnpm` routes `-s bkit ci …` to the built CLI and records every other call; stub `gh`
// reports no open PR.
// ---------------------------------------------------------------------------

describe(".husky/pre-push min push", () => {
  const REPO = process.cwd();
  const ZERO = "0".repeat(40);
  let tmp: string;

  const gitIn = (...args: string[]) =>
    spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
      cwd: tmp,
      encoding: "utf-8",
    }).stdout.trim();

  /** Write `files`, commit them with `message`, return the commit. */
  const commitFiles = (files: Record<string, string>, message: string) => {
    for (const [rel, body] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true });
      fs.writeFileSync(path.join(tmp, rel), body);
    }
    gitIn("add", "-A");
    gitIn("commit", "-q", "--allow-empty", "-m", message);
    return gitIn("rev-parse", "HEAD");
  };

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prepush-book-")));
    const bin = path.join(tmp, "bin");
    fs.mkdirSync(bin);
    fs.writeFileSync(
      path.join(bin, "pnpm"),
      [
        "#!/bin/sh",
        'if [ "$1" = "-s" ] && [ "$2" = "bkit" ] && [ "$3" = "ci" ]; then',
        "  shift 2",
        `  exec node ${JSON.stringify(path.join(REPO, "dist", "cli.js"))} "$@"`,
        "fi",
        `echo "$*" >> "${tmp}/pnpm.log"`,
        "exit 0",
        "",
      ].join("\n"),
      { mode: 0o755 },
    );
    fs.writeFileSync(path.join(bin, "gh"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    gitIn("init", "-q", "-b", "feat/1-x");
    gitIn("update-ref", "refs/remotes/origin/dev", commitFiles({ "src/a.ts": "a\n" }, "base"));
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const push = (hook: string, sha: string, remoteRef = "refs/heads/feat/1-x") => {
    const result = spawnSync("sh", [path.join(REPO, hook)], {
      cwd: tmp,
      input: `refs/heads/feat/1-x ${sha} ${remoteRef} ${ZERO}\n`,
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env, PATH: `${path.join(tmp, "bin")}:${process.env.PATH}` },
    });
    const log = path.join(tmp, "pnpm.log");
    const calls = fs.existsSync(log) ? fs.readFileSync(log, "utf-8").trim().split("\n") : [];
    return { status: result.status, stderr: result.stderr, calls };
  };

  const PLAN = {
    "docs/plans/202610/logs/1-x/status.jsonl": "{}\n",
    "docs/decisions.jsonl": "{}\n",
  };

  for (const hook of [".bkit/templates/.husky/pre-push", ".husky/pre-push"]) {
    it(`${hook}: plan logs and ledgers only → bkit:gate:min, not the full gate`, () => {
      const r = push(hook, commitFiles(PLAN, "docs(1): plan bkit [skip ci]"));
      expect(r.status).toBe(0);
      expect(r.stderr).toContain("min push");
      expect(r.calls).toContain("bkit:gate:min");
      expect(r.calls).not.toContain("bkit:gate:static-unit");
      expect(r.calls).toContain("bkit check");
    });

    it(`${hook}: a code file in the push → the full gate`, () => {
      commitFiles({ "src/a.ts": "b\n" }, "feat(1): a");
      const r = push(hook, commitFiles(PLAN, "docs(1): status bkit [skip ci]"));
      expect(r.status).toBe(0);
      expect(r.calls).toContain("bkit:gate:static-unit");
      expect(r.calls).not.toContain("bkit:gate:min");
    });

    it(`${hook}: code to dev under a [skip ci] head → blocked before any gate`, () => {
      commitFiles({ "src/a.ts": "b\n" }, "feat(1): a");
      const head = commitFiles(PLAN, "docs(1): status bkit [skip ci]");
      const r = push(hook, head, "refs/heads/dev");
      expect(r.status).toBe(1);
      expect(r.stderr).toContain(`BLOCKED: ${head} carries a CI-suppressing token`);
      expect(r.calls).toEqual([]);
    });

    it(`${hook}: min push to dev under a [skip ci] head → allowed, light gate`, () => {
      const r = push(hook, commitFiles(PLAN, "docs(1): plan bkit [skip ci]"), "refs/heads/dev");
      expect(r.status).toBe(0);
      expect(r.calls).toContain("bkit:gate:min");
    });

    it(`${hook}: code to dev with a clean head → not blocked, full gate`, () => {
      const r = push(hook, commitFiles({ "src/a.ts": "b\n" }, "feat(1): a"), "refs/heads/dev");
      expect(r.status).toBe(0);
      expect(r.calls).toContain("bkit:gate:static-unit");
    });
  }

  it(".husky/pre-push: a min push skips bkit's dist and actionlint checks", () => {
    const r = push(".husky/pre-push", commitFiles(PLAN, "docs(1): plan bkit [skip ci]"));
    expect(r.calls).not.toContain("bkit:check:dist");
    expect(r.calls).not.toContain("bkit:lint:workflows");
  });

  it(".husky/pre-push: a code push still runs them", () => {
    const r = push(".husky/pre-push", commitFiles({ "src/a.ts": "b\n" }, "feat(1): a"));
    expect(r.calls).toContain("bkit:check:dist");
    expect(r.calls).toContain("bkit:lint:workflows");
  });
});
