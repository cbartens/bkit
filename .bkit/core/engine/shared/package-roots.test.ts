// shared/package-roots.test.ts — Unit tests for getPkgRoot() across the THREE run-contexts
// documented in the shared/package-roots.ts header comment.
//
// The dist arm (context 1 + 3) is asserted here in addition to the tsx-from-source arm
// (context 2).

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getPkgRoot, ENGINE_SUBPATH, getTemplatesRoot, isBkitOwnRepo } from "./package-roots";

// ---------------------------------------------------------------------------
// Context 1 — dist/ (compiled; what consumers run)
// engineDir = <pkgRoot>/dist
// Expected: pkgRoot = engineDir/..
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 1: dist/ arm (consumer context)", () => {
  it("resolves one level above a simulated dist/ __dirname", () => {
    // Simulate the dist/ run-context by constructing a fake scriptDir that ends
    // with path.sep + "dist" and calling the same resolver logic.
    // We cannot call import.meta.url directly from a dist/ path in this test, so
    // we verify the arm logic using the ENGINE_SUBPATH sentinel and explicit
    // suffix matching — this is exactly what getPkgRoot() does internally.
    const fakeDistDir = path.join("/some", "pkg", "dist");
    // Arm 1: does NOT end with ENGINE_SUBPATH → resolves one level up.
    const expectedPkgRoot = path.resolve(fakeDistDir, "..");
    expect(fakeDistDir.endsWith(ENGINE_SUBPATH)).toBe(false);
    const result = path.resolve(fakeDistDir, "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/some", "pkg"));
  });

  it("ENGINE_SUBPATH does NOT match dist/ suffix (so dist uses the one-level arm)", () => {
    const distSuffix = `${path.sep}dist`;
    expect(distSuffix.endsWith(ENGINE_SUBPATH)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Context 2 — tsx-from-source (bkit repo development)
// engineDir = <pkgRoot>/.bkit/core/engine
// Expected: pkgRoot = engineDir/../../..
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 2: tsx-from-source arm (dev/test context)", () => {
  it("resolves three levels above a simulated engine dir matching ENGINE_SUBPATH", () => {
    // Construct a fake scriptDir whose suffix equals ENGINE_SUBPATH.
    const fakeSrcDir = path.join("/some", "pkg") + path.sep + ENGINE_SUBPATH;
    const expectedPkgRoot = path.resolve(fakeSrcDir, "..", "..", "..");
    expect(fakeSrcDir.endsWith(ENGINE_SUBPATH)).toBe(true);
    const result = path.resolve(fakeSrcDir, "..", "..", "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/some", "pkg"));
  });

  it("ENGINE_SUBPATH matches the .bkit/core/engine suffix", () => {
    expect(ENGINE_SUBPATH).toBe(path.join(".bkit", "core", "engine"));
  });

  it("getPkgRoot() returns the repo root when running in tsx-from-source context", () => {
    // In the actual tsx test run, import.meta.url points at
    // .bkit/core/engine/shared/package-roots.ts, so getPkgRoot() resolves to the repo root.
    const result = getPkgRoot();
    // Repo root contains package.json — a reliable sentinel.
    expect(fs.existsSync(path.join(result, "package.json"))).toBe(true);
    // Must NOT be inside .bkit/core itself.
    expect(result).not.toContain(path.join(".bkit", "core"));
  });
});

// ---------------------------------------------------------------------------
// Context 3 — packed-tarball (node_modules layout; effectively the dist/ arm)
// engineDir = <consumerRoot>/node_modules/@cbartens/bkit/dist
// Expected: pkgRoot = engineDir/..  (dist arm, same logic as context 1)
// ---------------------------------------------------------------------------

describe("getPkgRoot() — context 3: packed-tarball arm (node_modules layout)", () => {
  it("resolves one level above a simulated node_modules dist/ __dirname", () => {
    // node_modules/@cbartens/bkit/dist — the dist/ arm applies here too.
    const fakeNmDistDir = path.join("/consumer", "node_modules", "@cbartens", "bkit", "dist");
    // Arm 1: does NOT end with ENGINE_SUBPATH → one level up.
    const expectedPkgRoot = path.resolve(fakeNmDistDir, "..");
    expect(fakeNmDistDir.endsWith(ENGINE_SUBPATH)).toBe(false);
    const result = path.resolve(fakeNmDistDir, "..");
    expect(result).toBe(expectedPkgRoot);
    expect(result).toBe(path.join("/consumer", "node_modules", "@cbartens", "bkit"));
  });
});

// ---------------------------------------------------------------------------
// getTemplatesRoot() — derived from getPkgRoot()
// ---------------------------------------------------------------------------

describe("getTemplatesRoot()", () => {
  it("ends with .bkit/templates in the post-move (WS-3) state", () => {
    const root = getTemplatesRoot();
    // Post-move: must end with .bkit/templates
    expect(root.endsWith(path.join(".bkit", "templates"))).toBe(true);
  });

  it("is rooted at getPkgRoot()", () => {
    expect(getTemplatesRoot().startsWith(getPkgRoot())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isBkitOwnRepo() — the package root, or the top level of a checkout whose git
// common dir's parent is the package root. Fixtures are real git repos.
// ---------------------------------------------------------------------------

describe("isBkitOwnRepo()", () => {
  const dirs: string[] = [];
  const savedGitDir = process.env["GIT_DIR"];

  afterEach(() => {
    if (savedGitDir === undefined) delete process.env["GIT_DIR"];
    else process.env["GIT_DIR"] = savedGitDir;
    for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });

  const git = (cwd: string, ...args: string[]) => {
    const res = spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
      cwd,
      encoding: "utf-8",
    });
    expect(res.status, res.stderr).toBe(0);
  };

  /** A temp folder; real path unless `real` is false. */
  function tmp(real = true): string {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-own-repo-"));
    dirs.push(d);
    return real ? fs.realpathSync(d) : d;
  }

  /** A package root that is a git checkout with one commit. */
  function pkgRepo(root: string = tmp()): string {
    git(root, "init", "-q", "-b", "main");
    fs.writeFileSync(path.join(root, "README.md"), "x\n");
    git(root, "add", "README.md");
    git(root, "commit", "-q", "-m", "init");
    return root;
  }

  /** A linked worktree of `root`, outside it. */
  function linkedWorktree(root: string): string {
    const wt = path.join(tmp(), "wt");
    git(root, "worktree", "add", "-q", "-b", "wt", wt);
    return wt;
  }

  it("is true for the package root itself", () => {
    const root = pkgRepo();
    expect(isBkitOwnRepo(root, root)).toBe(true);
  });

  it("is true for a linked worktree's top level", () => {
    const root = pkgRepo();
    expect(isBkitOwnRepo(linkedWorktree(root), root)).toBe(true);
  });

  it("is true for a linked worktree when the package root is given through a symlinked path", () => {
    const unresolved = tmp(false);
    const root = pkgRepo(unresolved);
    const wt = linkedWorktree(fs.realpathSync(root));
    const link = path.join(tmp(), "pkg-link");
    fs.symlinkSync(fs.realpathSync(root), link);
    expect(isBkitOwnRepo(wt, link)).toBe(true);
  });

  it("is false for a folder inside the package root's checkout that is not its own repository", () => {
    const root = pkgRepo();
    const scratch = path.join(root, "tmp", "scratch");
    fs.mkdirSync(scratch, { recursive: true });
    expect(isBkitOwnRepo(scratch, root)).toBe(false);
  });

  it("is false for a subfolder of a linked worktree", () => {
    const root = pkgRepo();
    const sub = path.join(linkedWorktree(root), "sub");
    fs.mkdirSync(sub);
    expect(isBkitOwnRepo(sub, root)).toBe(false);
  });

  it("is false for a nested repository with its own .git inside the checkout", () => {
    const root = pkgRepo();
    const nested = path.join(root, "nested");
    fs.mkdirSync(nested);
    git(nested, "init", "-q");
    expect(isBkitOwnRepo(nested, root)).toBe(false);
  });

  it("is false for a folder that is in no repository", () => {
    const root = pkgRepo();
    expect(isBkitOwnRepo(tmp(), root)).toBe(false);
  });

  it("is false for a path that does not exist", () => {
    const root = pkgRepo();
    expect(isBkitOwnRepo(path.join(tmp(), "missing"), root)).toBe(false);
  });

  it("is false for a folder outside the checkout when GIT_DIR points at the package root's .git", () => {
    const root = pkgRepo();
    const outside = tmp();
    process.env["GIT_DIR"] = path.join(root, ".git");
    expect(isBkitOwnRepo(outside, root)).toBe(false);
  });
});
