// install/payload-links.test.ts — payload view link unit tests (#525).
//
// Coverage targets:
//   createPayloadLink() relative-first, junction fallback
//   syncPayloadLinks() create / keep / repair / no-clobber / dry-run / dogfood
//   formatPayloadLinkChanges() report shape

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCoreRoot, getPkgRoot, getSharedRoot } from "../shared/package-roots";
import { createPayloadLink, formatPayloadLinkChanges, syncPayloadLinks } from "./payload-links";

let tmpDir: string;

const CORE_LINK = path.join(".bkit", "core");
const SHARED_LINK = path.join(".bkit", "shared");

type SymlinkCall = { target: string; link: string; type?: string };

/** A symlink double that records each call and refuses `dir` links, as a platform without the privilege does. */
function refusingDirSymlink(calls: SymlinkCall[]) {
  return (target: string, link: string, type?: "dir" | "junction"): void => {
    calls.push({ target, link, type });
    if (type === "dir") throw new Error("EPERM: operation not permitted, symlink");
  };
}

beforeEach(() => {
  // realpath: process.cwd() reports /private/var on macOS, and link resolution compares against it.
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-payload-links-")));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("createPayloadLink", () => {
  it("creates a relative symlink that resolves to the payload", () => {
    const linkAbs = path.join(tmpDir, CORE_LINK);
    fs.mkdirSync(path.dirname(linkAbs), { recursive: true });
    expect(createPayloadLink(getCoreRoot(), linkAbs)).toBe("relative");
    expect(fs.lstatSync(linkAbs).isSymbolicLink()).toBe(true);
    expect(path.isAbsolute(fs.readlinkSync(linkAbs))).toBe(false);
    expect(fs.realpathSync(linkAbs)).toBe(fs.realpathSync(getCoreRoot()));
  });

  it("falls back to an absolute junction when the platform refuses a dir symlink", () => {
    const calls: SymlinkCall[] = [];
    const fake = refusingDirSymlink(calls);
    const kind = createPayloadLink("/pkg/.bkit/core", "/consumer/.bkit/core", fake);
    expect(kind).toBe("junction");
    expect(calls).toEqual([
      {
        target: path.join("..", "..", "pkg", ".bkit", "core"),
        link: path.join("/consumer", ".bkit", "core"),
        type: "dir",
      },
      {
        target: path.join("/pkg", ".bkit", "core"),
        link: path.join("/consumer", ".bkit", "core"),
        type: "junction",
      },
    ]);
  });
});

describe("syncPayloadLinks", () => {
  it("creates both view links, relative, resolving to the package payload", () => {
    const changes = syncPayloadLinks(tmpDir, { dryRun: false });
    expect(changes.created.sort()).toEqual([CORE_LINK, SHARED_LINK].sort());
    for (const [rel, root] of [
      [CORE_LINK, getCoreRoot()],
      [SHARED_LINK, getSharedRoot()],
    ] as const) {
      const linkAbs = path.join(tmpDir, rel);
      expect(fs.lstatSync(linkAbs).isSymbolicLink()).toBe(true);
      expect(path.isAbsolute(fs.readlinkSync(linkAbs))).toBe(false);
      expect(fs.realpathSync(linkAbs)).toBe(fs.realpathSync(root));
    }
  });

  it("is idempotent: a second run keeps correct links", () => {
    syncPayloadLinks(tmpDir, { dryRun: false });
    const again = syncPayloadLinks(tmpDir, { dryRun: false });
    expect(again.kept.sort()).toEqual([CORE_LINK, SHARED_LINK].sort());
    expect(again.created).toEqual([]);
    expect(again.repaired).toEqual([]);
  });

  it("re-points a symlink that resolves somewhere else", () => {
    const linkAbs = path.join(tmpDir, CORE_LINK);
    fs.mkdirSync(path.dirname(linkAbs), { recursive: true });
    fs.symlinkSync(tmpDir, linkAbs, "dir");
    const changes = syncPayloadLinks(tmpDir, { dryRun: false });
    expect(changes.repaired).toEqual([CORE_LINK]);
    expect(fs.realpathSync(linkAbs)).toBe(fs.realpathSync(getCoreRoot()));
  });

  it("re-points a dangling symlink", () => {
    const linkAbs = path.join(tmpDir, SHARED_LINK);
    fs.mkdirSync(path.dirname(linkAbs), { recursive: true });
    fs.symlinkSync(path.join(tmpDir, "gone"), linkAbs, "dir");
    const changes = syncPayloadLinks(tmpDir, { dryRun: false });
    expect(changes.repaired).toEqual([SHARED_LINK]);
    expect(fs.realpathSync(linkAbs)).toBe(fs.realpathSync(getSharedRoot()));
  });

  it("never clobbers a real directory — skipped, contents intact", () => {
    const dirAbs = path.join(tmpDir, CORE_LINK);
    fs.mkdirSync(dirAbs, { recursive: true });
    fs.writeFileSync(path.join(dirAbs, "mine.txt"), "consumer content\n", "utf-8");
    const changes = syncPayloadLinks(tmpDir, { dryRun: false });
    expect(changes.skippedRealDir).toEqual([CORE_LINK]);
    expect(fs.lstatSync(dirAbs).isSymbolicLink()).toBe(false);
    expect(fs.readFileSync(path.join(dirAbs, "mine.txt"), "utf-8")).toBe("consumer content\n");
    expect(changes.created).toEqual([SHARED_LINK]);
  });

  it("never clobbers a real file either", () => {
    fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });
    const fileAbs = path.join(tmpDir, SHARED_LINK);
    fs.writeFileSync(fileAbs, "consumer file\n", "utf-8");
    const changes = syncPayloadLinks(tmpDir, { dryRun: false });
    expect(changes.skippedRealDir).toEqual([SHARED_LINK]);
    expect(fs.readFileSync(fileAbs, "utf-8")).toBe("consumer file\n");
  });

  it("dry-run reports the creates but touches nothing", () => {
    const changes = syncPayloadLinks(tmpDir, { dryRun: true });
    expect(changes.created.sort()).toEqual([CORE_LINK, SHARED_LINK].sort());
    expect(fs.existsSync(path.join(tmpDir, CORE_LINK))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, SHARED_LINK))).toBe(false);
  });

  it("dry-run reports a repair without re-pointing the link", () => {
    const linkAbs = path.join(tmpDir, CORE_LINK);
    fs.mkdirSync(path.dirname(linkAbs), { recursive: true });
    fs.symlinkSync(tmpDir, linkAbs, "dir");
    syncPayloadLinks(tmpDir, { dryRun: true });
    expect(fs.realpathSync(linkAbs)).toBe(fs.realpathSync(tmpDir));
  });

  it("does nothing in dogfood, where .bkit/core is the package source", () => {
    expect(syncPayloadLinks(getPkgRoot(), { dryRun: false })).toEqual({
      created: [],
      repaired: [],
      kept: [],
      skippedRealDir: [],
      failed: [],
    });
  });
});

describe("formatPayloadLinkChanges", () => {
  it("is empty when every link was already correct", () => {
    expect(
      formatPayloadLinkChanges({
        created: [],
        repaired: [],
        kept: [CORE_LINK, SHARED_LINK],
        skippedRealDir: [],
        failed: [],
      }),
    ).toBe("");
  });

  it("names each created, repaired, skipped and failed link", () => {
    const text = formatPayloadLinkChanges({
      created: [CORE_LINK],
      repaired: [SHARED_LINK],
      kept: [],
      skippedRealDir: [path.join(".bkit", "other")],
      failed: [path.join(".bkit", "blocked")],
    });
    expect(text).toContain(`linked:   ${CORE_LINK}`);
    expect(text).toContain(`repaired: ${SHARED_LINK}`);
    expect(text).toContain("never overwritten");
    expect(text).toContain("platform refused");
  });
});
