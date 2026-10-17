// audits/templates/tmp-prune.test.ts — the tmp/ prune script bkit ships as a copy-and-own
// template, exercised by bkit's own suite before a consumer adopts it.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve(".bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs");

interface PruneResult {
  files: number;
  dirs: number;
  failed: string[];
}
const { pruneTmp, parseDays, main, DEFAULT_DAYS } = (await import(pathToFileURL(SCRIPT).href)) as {
  pruneTmp: (dir: string, opts?: { days?: number; now?: number }) => PruneResult;
  parseDays: (argv: string[]) => number | null;
  main: (
    argv: string[],
    io?: { cwd?: string; log?: (s: string) => void; err?: (s: string) => void },
  ) => number;
  DEFAULT_DAYS: number;
};

const DAY_S = 24 * 60 * 60;
const nowS = () => Date.now() / 1000;

let root: string;
let tmpDir: string;

beforeEach(() => {
  root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tmp-prune-")));
  tmpDir = path.join(root, "tmp");
  fs.mkdirSync(tmpDir);
});
afterEach(() => {
  const locked = path.join(tmpDir, "locked");
  if (fs.existsSync(locked)) fs.chmodSync(locked, 0o755);
  fs.rmSync(root, { recursive: true, force: true });
});

/** Write `rel` under `base` and set its mtime `ageDays` days back. */
function file(rel: string, ageDays: number, base = tmpDir): string {
  const abs = path.join(base, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, "x");
  const t = nowS() - ageDays * DAY_S;
  fs.utimesSync(abs, t, t);
  return abs;
}

/** Set a folder's own mtime `ageDays` days back (after its contents are in place). */
function age(abs: string, ageDays: number): void {
  const t = nowS() - ageDays * DAY_S;
  fs.utimesSync(abs, t, t);
}

describe("pruneTmp", () => {
  it("deletes files older than the cutoff and keeps newer ones", () => {
    const old = file("old.log", 8);
    const fresh = file("fresh.log", 6);
    expect(pruneTmp(tmpDir)).toEqual({ files: 1, dirs: 0, failed: [] });
    expect(fs.existsSync(old)).toBe(false);
    expect(fs.existsSync(fresh)).toBe(true);
  });

  it("honours a custom day count", () => {
    const f = file("a.log", 3);
    expect(pruneTmp(tmpDir, { days: 4 }).files).toBe(0);
    expect(pruneTmp(tmpDir, { days: 2 }).files).toBe(1);
    expect(fs.existsSync(f)).toBe(false);
  });

  it("removes folders the sweep empties, nested ones included", () => {
    file("a/b/old.log", 10);
    expect(pruneTmp(tmpDir)).toEqual({ files: 1, dirs: 2, failed: [] });
    expect(fs.readdirSync(tmpDir)).toEqual([]);
  });

  it("pluralises the summary line", () => {
    file("x/old1.log", 10);
    file("x/old2.log", 10);
    const out: string[] = [];
    main(["--days=1"], { cwd: root, log: (s) => out.push(s), err: () => {} });
    expect(out).toEqual(["[tmp-prune] removed 2 files and 1 folder older than 1 day from tmp/"]);
    expect(fs.readdirSync(tmpDir)).toEqual([]);
  });

  it("keeps a folder that still holds a fresh file", () => {
    file("mixed/old.log", 10);
    const fresh = file("mixed/fresh.log", 1);
    expect(pruneTmp(tmpDir)).toEqual({ files: 1, dirs: 0, failed: [] });
    expect(fs.existsSync(fresh)).toBe(true);
  });

  it("keeps a fresh empty folder and removes a stale empty one", () => {
    fs.mkdirSync(path.join(tmpDir, "fresh-empty"));
    fs.mkdirSync(path.join(tmpDir, "stale-empty"));
    age(path.join(tmpDir, "stale-empty"), 9);
    expect(pruneTmp(tmpDir)).toEqual({ files: 0, dirs: 1, failed: [] });
    expect(fs.readdirSync(tmpDir)).toEqual(["fresh-empty"]);
  });

  it("never removes tmp/ itself", () => {
    file("old.log", 10);
    age(tmpDir, 10);
    pruneTmp(tmpDir);
    expect(fs.statSync(tmpDir).isDirectory()).toBe(true);
  });

  it("leaves a symlinked tmp/ and its target alone", () => {
    const outside = file("keep.log", 30, path.join(root, "outside"));
    fs.rmSync(tmpDir, { recursive: true });
    fs.symlinkSync(path.join(root, "outside"), tmpDir);
    expect(pruneTmp(tmpDir)).toEqual({ files: 0, dirs: 0, failed: [] });
    expect(fs.existsSync(outside)).toBe(true);
  });

  it("removes an old symlink inside tmp/ without touching what it points at", () => {
    const outside = file("keep.log", 30, path.join(root, "outside"));
    const link = path.join(tmpDir, "link");
    fs.symlinkSync(path.join(root, "outside"), link);
    const t = nowS() - 10 * DAY_S;
    fs.lutimesSync(link, t, t);
    expect(pruneTmp(tmpDir)).toEqual({ files: 1, dirs: 0, failed: [] });
    expect(fs.existsSync(link)).toBe(false);
    expect(fs.existsSync(outside)).toBe(true);
  });

  it("returns zero counts when tmp/ does not exist", () => {
    fs.rmSync(tmpDir, { recursive: true });
    expect(pruneTmp(tmpDir)).toEqual({ files: 0, dirs: 0, failed: [] });
  });

  it("records an entry it cannot remove and keeps sweeping", () => {
    const locked = file("locked/old.log", 10);
    const other = file("other.log", 10);
    fs.chmodSync(path.dirname(locked), 0o555);
    const r = pruneTmp(tmpDir);
    expect(r.failed).toEqual([`${locked}: EACCES`]);
    expect(fs.existsSync(locked)).toBe(true);
    expect(fs.existsSync(other)).toBe(false);
  });
});

describe("parseDays", () => {
  it("defaults to 7", () => {
    expect(DEFAULT_DAYS).toBe(7);
    expect(parseDays([])).toBe(7);
  });

  it("reads --days=<n> for n >= 1", () => {
    expect(parseDays(["--days=14"])).toBe(14);
  });

  it("rejects zero, non-numbers and unknown arguments", () => {
    expect(parseDays(["--days=0"])).toBeNull();
    expect(parseDays(["--days=abc"])).toBeNull();
    expect(parseDays(["--days=-3"])).toBeNull();
    expect(parseDays(["--dry-run"])).toBeNull();
  });
});

describe("main", () => {
  const run = (argv: string[], cwd: string) => {
    const out: string[] = [];
    const err: string[] = [];
    const code = main(argv, { cwd, log: (s) => out.push(s), err: (s) => err.push(s) });
    return { code, out, err };
  };

  it("prunes tmp/ at the checkout top when run from a subfolder", () => {
    spawnSync("git", ["init", "-q"], { cwd: root });
    const sub = path.join(root, "pkg", "src");
    fs.mkdirSync(sub, { recursive: true });
    const old = file("old.log", 10);
    const r = run([], sub);
    expect(r.code).toBe(0);
    expect(fs.existsSync(old)).toBe(false);
    expect(r.out).toEqual(["[tmp-prune] removed 1 file and 0 folders older than 7 days from tmp/"]);
  });

  it("prints nothing when nothing is old enough", () => {
    file("fresh.log", 1);
    expect(run([], root)).toEqual({ code: 0, out: [], err: [] });
  });

  it("exits 2 with usage on bad arguments, deleting nothing", () => {
    const old = file("old.log", 10);
    const r = run(["--days=0"], root);
    expect(r.code).toBe(2);
    expect(r.err[0]).toContain("usage:");
    expect(fs.existsSync(old)).toBe(true);
  });

  it("exits 1 and names each entry it could not remove", () => {
    const locked = file("locked/old.log", 10);
    fs.chmodSync(path.dirname(locked), 0o555);
    const r = run([], root);
    expect(r.code).toBe(1);
    expect(r.err).toEqual([`[tmp-prune] could not remove ${locked}: EACCES`]);
  });

  it("runs as a script", () => {
    const old = file("old.log", 10);
    const r = spawnSync(process.execPath, [SCRIPT, "--days=3"], { cwd: root, encoding: "utf8" });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("removed 1 file and 0 folders older than 3 days");
    expect(fs.existsSync(old)).toBe(false);
  });
});
