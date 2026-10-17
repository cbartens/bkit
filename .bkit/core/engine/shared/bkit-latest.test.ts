import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TIMEOUTS } from "./timeouts";
import {
  BKIT_LATEST_CACHE,
  bkitVersionStatus,
  compareSemver,
  lookupLatestPublished,
} from "./bkit-latest";

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

let root: string;
let gitDir: string;
beforeEach(() => {
  root = tmp("bkit-latest-");
  gitDir = path.join(root, ".git");
  fs.mkdirSync(gitDir);
  vi.stubEnv("BKIT_NO_UPDATE_CHECK", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const pin = (version: string) => {
  fs.mkdirSync(path.join(root, ".bkit"), { recursive: true });
  fs.writeFileSync(
    path.join(root, ".bkit", "version"),
    JSON.stringify({ pinnedVersion: version, canonicalHashes: {} }),
  );
};

describe("compareSemver", () => {
  it.each([
    ["5.9.0", "5.10.0", -1],
    ["5.10.0", "5.9.0", 1],
    ["5.2.4", "5.2.4", 0],
    ["v5.2.4", "5.2.4", 0],
    ["6.0.0", "5.99.99", 1],
    ["5.3.0-rc.1", "5.3.0", -1],
    ["5.3.0", "5.3.0-rc.1", 1],
    ["5.3.0-rc.2", "5.3.0-rc.10", -1],
    ["5.3.0-1", "5.3.0-rc", -1],
    ["5.3.0-rc", "5.3.0-rc.1", -1],
  ] as const)("%s vs %s -> %d", (a, b, expected) => {
    expect(compareSemver(a, b)).toBe(expected);
  });

  it("is null when either side is not a semver", () => {
    expect(compareSemver("5.2", "5.2.0")).toBeNull();
    expect(compareSemver("5.2.0", "latest")).toBeNull();
  });
});

describe("bkitVersionStatus", () => {
  it("unpinned: nothing to compare, the registry is not asked", () => {
    const lookup = vi.fn(() => "9.9.9");
    expect(bkitVersionStatus(root, gitDir, { lookup })).toEqual({
      version: null,
      latest: null,
      outdated: null,
      advisory: null,
    });
    expect(lookup).not.toHaveBeenCalled();
  });

  it("BKIT_NO_UPDATE_CHECK skips the registry; 0 does not", () => {
    pin("5.0.0");
    const lookup = vi.fn(() => "5.1.0");
    vi.stubEnv("BKIT_NO_UPDATE_CHECK", "1");
    expect(bkitVersionStatus(root, gitDir, { lookup })).toMatchObject({
      version: "5.0.0",
      latest: null,
    });
    expect(lookup).not.toHaveBeenCalled();
    vi.stubEnv("BKIT_NO_UPDATE_CHECK", "0");
    expect(bkitVersionStatus(root, gitDir, { lookup }).outdated).toBe(true);
  });

  it("asks once, then reuses the answer for a day", () => {
    pin("5.0.0");
    const lookup = vi.fn(() => "5.1.0");
    const t0 = 1_000_000_000_000;
    expect(bkitVersionStatus(root, gitDir, { lookup, now: () => t0 })).toEqual({
      version: "5.0.0",
      latest: "5.1.0",
      outdated: true,
      advisory: "running bkit 5.0.0; 5.1.0 is out. Upgrade: pnpm bkit upgrade --latest",
    });
    const day = TIMEOUTS.BKIT_LATEST_CACHE_S * 1000;
    bkitVersionStatus(root, gitDir, { lookup, now: () => t0 + day - 1 });
    expect(lookup).toHaveBeenCalledTimes(1);
    bkitVersionStatus(root, gitDir, { lookup, now: () => t0 + day });
    expect(lookup).toHaveBeenCalledTimes(2);
  });

  it("remembers a failed lookup for an hour, so an offline run does not wait every call", () => {
    pin("5.0.0");
    const lookup = vi.fn((): string | null => null);
    const t0 = 1_000_000_000_000;
    expect(bkitVersionStatus(root, gitDir, { lookup, now: () => t0 }).latest).toBeNull();
    bkitVersionStatus(root, gitDir, { lookup, now: () => t0 + 1000 });
    expect(lookup).toHaveBeenCalledTimes(1);
    bkitVersionStatus(root, gitDir, {
      lookup,
      now: () => t0 + TIMEOUTS.BKIT_LATEST_RETRY_S * 1000,
    });
    expect(lookup).toHaveBeenCalledTimes(2);
  });

  it("a corrupt or future-dated cache is ignored and rewritten", () => {
    pin("5.0.0");
    const cache = path.join(gitDir, BKIT_LATEST_CACHE);
    const lookup = vi.fn(() => "5.0.0");
    fs.writeFileSync(cache, "not json");
    expect(bkitVersionStatus(root, gitDir, { lookup, now: () => 5000 }).outdated).toBe(false);
    fs.writeFileSync(cache, JSON.stringify({ latest: "9.9.9", checkedAt: 10_000 }));
    expect(bkitVersionStatus(root, gitDir, { lookup, now: () => 5000 }).latest).toBe("5.0.0");
    expect(lookup).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fs.readFileSync(cache, "utf-8"))).toEqual({
      latest: "5.0.0",
      checkedAt: 5000,
    });
  });

  it("no git dir: no cache, the check still runs", () => {
    pin("5.0.0");
    const lookup = vi.fn(() => "5.0.1");
    expect(bkitVersionStatus(root, null, { lookup }).outdated).toBe(true);
    expect(bkitVersionStatus(root, null, { lookup }).outdated).toBe(true);
    expect(lookup).toHaveBeenCalledTimes(2);
  });
});

describe("lookupLatestPublished", () => {
  const fakePnpm = (body: string) => {
    const bin = tmp("bkit-latest-bin-");
    fs.writeFileSync(path.join(bin, "pnpm"), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
    vi.stubEnv("PATH", `${bin}:${process.env.PATH}`);
  };

  it("returns the registry's version", () => {
    fakePnpm('[ "$1 $2 $3" = "view @cbartens/bkit version" ] && echo 5.3.0');
    expect(lookupLatestPublished(root)).toBe("5.3.0");
  });

  it("is null when pnpm fails or prints something that is not a version", () => {
    fakePnpm("echo 'ERR_PNPM_FETCH_404' >&2; exit 1");
    expect(lookupLatestPublished(root)).toBeNull();
    fakePnpm("echo 'WARN something'");
    expect(lookupLatestPublished(root)).toBeNull();
  });

  it("is null when pnpm is not on PATH", () => {
    vi.stubEnv("PATH", tmp("bkit-latest-empty-"));
    expect(lookupLatestPublished(root)).toBeNull();
  });
});
