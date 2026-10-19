import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  NETWORK_ALLOWLIST_RELPATH,
  RETIRED_NETWORK_ALLOWLIST_RELPATH,
  renderNetworkAllowlist,
  writeNetworkAllowlist,
} from "./network-allowlist";
import { writeBkitVersion } from "./version-file";
import type { WriteSet } from "./write";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-net-allowlist-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(rel: string, body: string): void {
  fs.mkdirSync(path.dirname(path.join(tmpDir, rel)), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, rel), body, "utf-8");
}

function run(dryRun: boolean): { changed: string[]; ws: WriteSet } {
  const ws: WriteSet = { writes: [] };
  return { changed: writeNetworkAllowlist(tmpDir, dryRun, ws, "[test]"), ws };
}

/** A 5.2.4 install's `.cursor/allowlist.json`, written by the cursor module. */
function seedRetiredCopy(recorded: boolean): void {
  write(RETIRED_NETWORK_ALLOWLIST_RELPATH, renderNetworkAllowlist(tmpDir));
  writeBkitVersion(path.join(tmpDir, ".bkit", "version"), {
    pinnedVersion: "5.2.4",
    canonicalHashes: recorded ? { [RETIRED_NETWORK_ALLOWLIST_RELPATH]: "0".repeat(64) } : {},
    claudeAllowDerived: [],
  });
}

describe("writeNetworkAllowlist — .bkit/allowlist.json", () => {
  it("writes the file when absent and records the write", () => {
    const { changed, ws } = run(false);
    expect(changed).toEqual([NETWORK_ALLOWLIST_RELPATH]);
    expect(ws.writes).toEqual([{ path: NETWORK_ALLOWLIST_RELPATH, action: "write" }]);
    const doc = JSON.parse(fs.readFileSync(path.join(tmpDir, NETWORK_ALLOWLIST_RELPATH), "utf-8"));
    expect(doc.domains).toContain("github.com");
    expect(doc.domains).toContain("*.github.com");
  });

  it("is idempotent — a second run changes nothing", () => {
    run(false);
    const { changed, ws } = run(false);
    expect(changed).toEqual([]);
    expect(ws.writes).toEqual([]);
  });

  it("dry-run writes nothing but records the same write set (the `bkit check` drift signal)", () => {
    const dry = run(true);
    expect(fs.existsSync(path.join(tmpDir, NETWORK_ALLOWLIST_RELPATH))).toBe(false);
    expect(dry.ws.writes).toEqual([{ path: NETWORK_ALLOWLIST_RELPATH, action: "write" }]);
  });

  it("regenerates a hand-edited file whole", () => {
    write(NETWORK_ALLOWLIST_RELPATH, '{ "domains": ["evil.example"] }\n');
    const { ws } = run(false);
    expect(ws.writes).toEqual([{ path: NETWORK_ALLOWLIST_RELPATH, action: "update" }]);
    expect(fs.readFileSync(path.join(tmpDir, NETWORK_ALLOWLIST_RELPATH), "utf-8")).toBe(
      renderNetworkAllowlist(tmpDir),
    );
  });

  it("picks up consumer allowed-domains from .agents/context.md", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nexample.invalid\n<!-- allowed-domains:end -->\n",
    );
    run(false);
    const doc = JSON.parse(fs.readFileSync(path.join(tmpDir, NETWORK_ALLOWLIST_RELPATH), "utf-8"));
    expect(doc.domains).toContain("example.invalid");
    expect(doc.domains).toContain("*.example.invalid");
  });
});

describe("writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4)", () => {
  it("removes the retired copy bkit recorded and records the removal", () => {
    seedRetiredCopy(true);
    const { changed, ws } = run(false);
    expect(fs.existsSync(path.join(tmpDir, RETIRED_NETWORK_ALLOWLIST_RELPATH))).toBe(false);
    expect(changed).toContain(RETIRED_NETWORK_ALLOWLIST_RELPATH);
    expect(ws.writes).toContainEqual({ path: RETIRED_NETWORK_ALLOWLIST_RELPATH, action: "write" });
  });

  it("dry-run keeps the retired copy but reports the removal", () => {
    seedRetiredCopy(true);
    const { ws } = run(true);
    expect(fs.existsSync(path.join(tmpDir, RETIRED_NETWORK_ALLOWLIST_RELPATH))).toBe(true);
    expect(ws.writes).toContainEqual({ path: RETIRED_NETWORK_ALLOWLIST_RELPATH, action: "write" });
  });

  it("leaves a .cursor/allowlist.json bkit never recorded alone", () => {
    seedRetiredCopy(false);
    const { changed } = run(false);
    expect(fs.existsSync(path.join(tmpDir, RETIRED_NETWORK_ALLOWLIST_RELPATH))).toBe(true);
    expect(changed).toEqual([NETWORK_ALLOWLIST_RELPATH]);
  });

  it("is idempotent — a second run finds nothing to migrate", () => {
    seedRetiredCopy(true);
    run(false);
    const { changed, ws } = run(false);
    expect(changed).toEqual([]);
    expect(ws.writes).toEqual([]);
  });
});
