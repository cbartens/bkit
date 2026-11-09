import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { WORKFLOW_LOCK_IDLE_S, locksCommand, monthBuckets } from "./locks";
import * as publicationLocks from "./locks";

// Real git repos and worktrees per test; a busy machine needs more than the default 5s.
vi.setConfig({ testTimeout: 30_000 });

const dirs: string[] = [];
afterEach(() => {
  vi.useRealTimers();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const FID = "68-digital-agent-mvp";
const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

function repo() {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-locks-")));
  dirs.push(cwd);
  git(cwd, "init", "-q", "-b", "dev");
  git(cwd, "commit", "-q", "--allow-empty", "-m", "init");
  return cwd;
}

const logDir = (root: string, month: string, fid = FID) =>
  path.join(root, "docs", "plans", month, "logs", fid);

function writeStatus(root: string, month: string, rows: object[], fid = FID) {
  fs.mkdirSync(logDir(root, month, fid), { recursive: true });
  fs.writeFileSync(
    path.join(logDir(root, month, fid), "status.jsonl"),
    rows.map((r) => `${JSON.stringify(r)}\n`).join(""),
  );
}

function writeLock(root: string, month: string, line: string, ageS = 0) {
  fs.mkdirSync(logDir(root, month), { recursive: true });
  const file = path.join(logDir(root, month), ".lock");
  fs.writeFileSync(file, `${line}\n`);
  const t = (Date.now() - ageS * 1000) / 1000;
  fs.utimesSync(file, t, t);
  return file;
}

const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString().replace(/\.\d{3}Z$/, "Z");
const MIN = 60_000;

interface PublicationLock {
  path: string;
  token: string;
  owner: { host: string; pid: number; startTime: string };
}
interface PublicationLockOptions {
  target: string;
  invocation: string;
  timeoutMs?: number;
}
type AcquirePublication = (
  cwd: string,
  options: PublicationLockOptions,
) => Promise<PublicationLock | null>;
type ReleasePublication = (lock: PublicationLock) => Promise<boolean>;
const isAcquirePublication = (value: unknown): value is AcquirePublication =>
  typeof value === "function";
const isReleasePublication = (value: unknown): value is ReleasePublication =>
  typeof value === "function";
function publicationApi() {
  const exported: Record<string, unknown> = publicationLocks;
  const acquire = exported.acquirePublicationLock;
  const release = exported.releasePublicationLock;
  expect(typeof acquire).toBe("function");
  expect(typeof release).toBe("function");
  if (!isAcquirePublication(acquire) || !isReleasePublication(release))
    throw new Error("publication lock API is unavailable");
  return { acquire, release };
}
function ownedPublication(lock: PublicationLock | null): PublicationLock {
  expect(lock).not.toBeNull();
  if (!lock) throw new Error("expected owned publication lock");
  return lock;
}

describe("publication ownership lock", () => {
  const options = { target: "github/o/r/12", invocation: "build/run-2", timeoutMs: 30 };

  it("serializes publication for one target and invocation", async () => {
    const api = publicationApi();
    const cwd = repo();
    const first = ownedPublication(await api.acquire(cwd, options));
    expect(first).not.toBeNull();
    expect(await api.acquire(cwd, options)).toBeNull();
    const independent = ownedPublication(
      await api.acquire(cwd, { ...options, invocation: "auto/run-2" }),
    );
    expect(independent).not.toBeNull();
    expect(first.path).not.toBe(path.join(logDir(cwd, "202611"), ".lock"));
    expect(await api.release(first)).toBe(true);
    expect(await api.release(independent)).toBe(true);
    const next = ownedPublication(await api.acquire(cwd, options));
    expect(next).not.toBeNull();
    await api.release(next);
  });

  it("bounds acquisition and preserves unverifiable owners", async () => {
    const api = publicationApi();
    const cwd = repo();
    const first = ownedPublication(await api.acquire(cwd, options));
    const foreign = { ...first, owner: { ...first.owner, host: "another-host" } };
    fs.writeFileSync(first.path, JSON.stringify(foreign));
    const old = new Date("2000-01-01T00:00:00Z");
    fs.utimesSync(first.path, old, old);
    const start = performance.now();
    expect(await api.acquire(cwd, options)).toBeNull();
    expect(performance.now() - start).toBeLessThan(1000);
    expect(JSON.parse(fs.readFileSync(first.path, "utf8"))).toEqual(foreign);
    fs.writeFileSync(first.path, "unreadable ownership");
    expect(await api.acquire(cwd, options)).toBeNull();
    expect(fs.readFileSync(first.path, "utf8")).toBe("unreadable ownership");
    const notDirectory = path.join(cwd, "not-directory");
    fs.writeFileSync(notDirectory, "file");
    await expect(api.acquire(notDirectory, options)).resolves.toBeNull();
  });

  it("reclaims only a proven dead matching process identity", async () => {
    const api = publicationApi();
    const cwd = repo();
    const moduleUrl = new URL("./locks.ts", import.meta.url).href;
    const child = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "--input-type=module",
        "-e",
        `import {acquirePublicationLock} from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(await acquirePublicationLock(${JSON.stringify(cwd)},${JSON.stringify(options)})));`,
      ],
      { cwd: process.cwd(), encoding: "utf8", timeout: 3000 },
    );
    expect(child.status).toBe(0);
    const dead: PublicationLock = JSON.parse(child.stdout.trim());
    expect(dead.owner.pid).not.toBe(process.pid);
    const reclaimed = ownedPublication(await api.acquire(cwd, options));
    expect(reclaimed).not.toBeNull();
    expect(reclaimed.token).not.toBe(dead.token);
    const reused = {
      ...reclaimed,
      owner: { ...reclaimed.owner, pid: process.pid, startTime: "different-process-start" },
    };
    fs.writeFileSync(reclaimed.path, JSON.stringify(reused));
    expect(await api.acquire(cwd, options)).toBeNull();
    expect(JSON.parse(fs.readFileSync(reclaimed.path, "utf8"))).toEqual(reused);
  });

  it("releases only its delivery token on every exit", async () => {
    const api = publicationApi();
    const first = ownedPublication(await api.acquire(repo(), options));
    expect(await api.release({ ...first, token: "foreign-token" })).toBe(false);
    expect(fs.existsSync(first.path)).toBe(true);
    expect(await api.release(first)).toBe(true);
    const second = ownedPublication(await api.acquire(repo(), options));
    fs.unlinkSync(second.path);
    fs.mkdirSync(second.path);
    await expect(api.release(second)).resolves.toBe(false);
  });
});
const started = (workflow: string, msAgo: number) => ({
  type: "workflow-started",
  workflow,
  at: iso(msAgo),
});
const step = (workflow: string, msAgo: number) => ({
  type: "step-done",
  workflow,
  step: `${workflow}-x`,
  status: "DONE",
  at: iso(msAgo),
  parentSha: "0".repeat(40),
  artifacts: [],
});

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["locks", ...argv, "--json"], [locksCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const acquire = (...extra: string[]) => [
  "acquire",
  "--kind=workflow",
  "--workflow=build",
  `--fid=${FID}`,
  ...extra,
];

describe("bkit locks acquire --kind=workflow — month bucket", () => {
  it("takes the feature's existing bucket", async () => {
    const cwd = repo();
    fs.mkdirSync(logDir(cwd, "202605"), { recursive: true });
    const r = await run(cwd, acquire());
    expect(r.code).toBe(0);
    expect(r.json.month).toBe("202605");
    expect(r.json.path).toBe(path.join(logDir(cwd, "202605"), ".lock"));
    expect(fs.readFileSync(r.json.path, "utf-8")).toMatch(
      new RegExp(`^\\S+Z build ${FID} ${r.json.token}\\n$`),
    );
  });

  it("ignores other features' buckets, even one sharing the issue digits", async () => {
    const cwd = repo();
    fs.mkdirSync(logDir(cwd, "202605"), { recursive: true });
    fs.mkdirSync(logDir(cwd, "202608", "680-longer-issue"), { recursive: true });
    expect(monthBuckets(cwd, FID)).toEqual(["202605"]);
    expect((await run(cwd, acquire())).json.month).toBe("202605");
  });

  it("refuses a feature split across two buckets and takes no lock", async () => {
    const cwd = repo();
    fs.mkdirSync(logDir(cwd, "202605"), { recursive: true });
    fs.mkdirSync(logDir(cwd, "202608"), { recursive: true });
    const r = await run(cwd, acquire());
    expect(r.code).toBe(7);
    expect(r.err).toContain("202605, 202608");
    expect(fs.existsSync(path.join(logDir(cwd, "202605"), ".lock"))).toBe(false);
    expect(fs.existsSync(path.join(logDir(cwd, "202608"), ".lock"))).toBe(false);
  });

  it("a new feature takes this UTC month, not the local one", async () => {
    // 23:30 on 31 Oct in UTC-5 is already 1 Nov in UTC; design / plan used local `date +%Y%m`.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-31T23:30:00-05:00"));
    const cwd = repo();
    const r = await run(cwd, acquire());
    expect(r.json.month).toBe("202611");
  });

  it("--month is used as given", async () => {
    const cwd = repo();
    expect((await run(cwd, acquire("--month=202601"))).json.month).toBe("202601");
    expect((await run(cwd, acquire("--month=2026-01"))).code).toBe(2);
  });
});

describe("bkit locks acquire --kind=workflow — a lock already there", () => {
  const M = "202610";

  it("refuses while the holder's run stepped in the last 30 minutes", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [started("design", 40 * MIN), step("design", 5 * MIN)]);
    const lock = writeLock(cwd, M, "2026-10-01T00:00:00Z design", 40 * 60);
    const r = await run(cwd, acquire());
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/already running .*workflow=design, idle \d+s/);
    expect(fs.readFileSync(lock, "utf-8")).toBe("2026-10-01T00:00:00Z design\n");
  });

  it("reclaims an IN_PROGRESS run idle 30+ minutes", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [started("design", 90 * MIN), step("design", 31 * MIN)]);
    writeLock(cwd, M, "2026-10-01T00:00:00Z design", WORKFLOW_LOCK_IDLE_S + 60);
    const r = await run(cwd, acquire());
    expect(r.code).toBe(0);
    expect(r.json.reclaimed).toEqual({ holder: "2026-10-01T00:00:00Z design", reason: "stale" });
  });

  it("reclaims a finished (DONE or FAILED) run's old lock", async () => {
    for (const end of ["workflow-done", "workflow-failed"]) {
      const cwd = repo();
      writeStatus(cwd, M, [
        started("design", 90 * MIN),
        step("design", 80 * MIN),
        { type: end, workflow: "design", at: iso(79 * MIN) },
      ]);
      writeLock(cwd, M, "x design", WORKFLOW_LOCK_IDLE_S + 60);
      const r = await run(cwd, acquire());
      expect(r.code, end).toBe(0);
      expect(r.json.reclaimed.reason).toBe("finished");
    }
  });

  it("reclaims a fresh lock over a finished run: the lock file's age is not checked", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [
      started("design", 90 * MIN),
      { type: "workflow-done", workflow: "design", at: iso(80 * MIN) },
    ]);
    writeLock(cwd, M, "x design", 60);
    const r = await run(cwd, acquire());
    expect(r.code).toBe(0);
    expect(r.json.reclaimed).toEqual({ holder: "x design", reason: "finished" });
  });

  it("reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [started("design", 90 * MIN), step("design", 60 * MIN)]);
    writeLock(cwd, M, "x design", 60);
    const r = await run(cwd, acquire());
    expect(r.code).toBe(0);
    expect(r.json.reclaimed.reason).toBe("stale");
  });

  it("with no status log, a lock of any age is reclaimed as orphaned", async () => {
    for (const age of [60, WORKFLOW_LOCK_IDLE_S + 60]) {
      const cwd = repo();
      writeLock(cwd, M, "x design", age);
      const r = await run(cwd, acquire());
      expect(r.code, `age ${age}`).toBe(0);
      expect(r.json.reclaimed.reason).toBe("orphaned");
    }
  });

  it("reads the feature worktree's status copy before the main checkout's", async () => {
    const cwd = repo();
    writeStatus(cwd, M, [
      started("design", 90 * MIN),
      { type: "workflow-done", workflow: "design", at: iso(80 * MIN) },
    ]);
    writeStatus(path.join(cwd, ".worktrees", FID), M, [
      started("design", 90 * MIN),
      step("design", 2 * MIN),
    ]);
    writeLock(cwd, M, "x design", WORKFLOW_LOCK_IDLE_S + 60);
    expect((await run(cwd, acquire())).code).toBe(1);
  });
});

describe("bkit locks acquire --kind=workflow — ship", () => {
  it("takes the lock in the main checkout, from the worktree being shipped too", async () => {
    const cwd = repo();
    const wt = path.join(cwd, ".worktrees", FID);
    git(cwd, "worktree", "add", "-q", wt, "-b", `feat/${FID}`);
    const r = await run(wt, [
      "acquire",
      "--kind=workflow",
      "--workflow=ship",
      `--fid=${FID}`,
      "--month=202610",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.path).toBe(path.join(logDir(cwd, "202610"), ".lock"));
  });
});

describe("bkit locks acquire — kinds", () => {
  it("knows only the workflow kind", async () => {
    const cwd = repo();
    expect(
      (await run(cwd, ["acquire", "--kind=dev", "--workflow=ship", `--fid=${FID}`])).code,
    ).toBe(2);
    expect((await run(cwd, ["acquire", "--kind=other", "--workflow=x", "--fid=y"])).code).toBe(2);
  });
});

describe("bkit locks release", () => {
  const rel = (kind: string, workflow: string, ...extra: string[]) => [
    "release",
    `--kind=${kind}`,
    `--workflow=${workflow}`,
    `--fid=${FID}`,
    "--month=202610",
    ...extra,
  ];

  it("removes its own lock, by token or by workflow and fid", async () => {
    const cwd = repo();
    const a = await run(cwd, acquire("--month=202610"));
    const r = await run(cwd, rel("workflow", "build", `--token=${a.json.token}`));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ existed: true, released: true, heldBy: null });
    expect(fs.existsSync(a.json.path)).toBe(false);
    await run(cwd, acquire("--month=202610"));
    expect((await run(cwd, rel("workflow", "build"))).json.released).toBe(true);
  });

  it("leaves another owner's lock in place: other workflow, or other token", async () => {
    const cwd = repo();
    const a = await run(cwd, acquire("--month=202610"));
    const other = await run(cwd, rel("workflow", "design"));
    expect(other.code).toBe(4);
    expect(other.json).toMatchObject({ existed: true, released: false });
    expect(other.json.heldBy).toContain("build");
    expect((await run(cwd, rel("workflow", "build", "--token=deadbeef"))).code).toBe(4);
    expect(fs.existsSync(a.json.path)).toBe(true);
  });

  it("releases an old-format lock line by workflow name", async () => {
    const cwd = repo();
    const file = writeLock(cwd, "202610", "2026-10-01T00:00:00Z design");
    expect((await run(cwd, rel("workflow", "design"))).json.released).toBe(true);
    expect(fs.existsSync(file)).toBe(false);
  });

  it("a missing lock is already released", async () => {
    const r = await run(repo(), rel("workflow", "build"));
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ existed: false, released: false, heldBy: null });
  });

  it("locks release removes the FID shared-checkout record", async () => {
    const cwd = repo();
    const recordAt = (fid: string) =>
      path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${fid}.json`));
    for (const fid of [FID, "69-other"]) {
      fs.mkdirSync(path.dirname(recordAt(fid)), { recursive: true });
      fs.writeFileSync(
        recordAt(fid),
        JSON.stringify({
          fid,
          branch: "dev",
          startSha: git(cwd, "rev-parse", "HEAD"),
          originSha: null,
          aheadAtStart: 0,
          paths: [],
          commits: [],
        }),
      );
    }
    const a = await run(cwd, acquire("--month=202610"));
    const r = await run(cwd, rel("workflow", "build", `--token=${a.json.token}`));
    expect(r.code).toBe(0);
    expect(r.json.released).toBe(true);
    expect(fs.existsSync(recordAt(FID))).toBe(false);
    expect(fs.existsSync(recordAt("69-other"))).toBe(true);
  });
});
