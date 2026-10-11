// install/modules/claude.test.ts — Unit tests for the claude module.

import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as os from "node:os";
import { enrichClaudeSettingsAllows } from "./claude";
import type { WriteSet } from "../write";
import { resolveNetworkAllowlist } from "../cloud-env";
import type { PreflightFinding } from "../../checks/before/index";

describe("enrichClaudeSettingsAllows — recording contract and prune (T8, T15)", () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-webfetch-"));
    fs.mkdirSync(path.join(dir, ".claude"), { recursive: true });
    fs.mkdirSync(path.join(dir, ".bkit"), { recursive: true });
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  const settings = () => path.join(dir, ".claude", "settings.json");
  const writeSettings = (allow: unknown) =>
    fs.writeFileSync(settings(), JSON.stringify({ permissions: { allow } }, null, 2));
  const writeVersion = (claudeAllowDerived: string[]) =>
    fs.writeFileSync(
      path.join(dir, ".bkit", "version"),
      JSON.stringify({
        pinnedVersion: "4.12.0",
        canonicalHashes: {},
        claudeAllowDerived,
      }),
    );
  const derived = () => resolveNetworkAllowlist(dir).map((d) => `WebFetch(domain:${d})`);
  const run = (dryRun = false, ws: WriteSet = { writes: [] }, adv: PreflightFinding[] = []) => ({
    ret: enrichClaudeSettingsAllows(settings(), dir, dryRun, ws, adv),
    ws,
    adv,
  });

  // --- T8: the four "not determined" rows all return null and touch no record ---
  it("returns null when the settings file is absent", () => {
    fs.rmSync(settings(), { force: true });
    expect(run().ret).toBeNull();
  });

  it("returns null on unparseable JSON", () => {
    fs.writeFileSync(settings(), "{ not json");
    expect(run().ret).toBeNull();
  });

  it("returns null when allow is not an array", () => {
    writeSettings({ nope: true });
    expect(run().ret).toBeNull();
  });

  it("returns null under dryRun, and leaves the file untouched", () => {
    writeSettings([]);
    const before = fs.readFileSync(settings(), "utf-8");
    expect(run(true).ret).toBeNull();
    expect(fs.readFileSync(settings(), "utf-8")).toBe(before);
  });

  // --- T8: the determined rows ---
  it("returns the derived set on a steady-state no-op run", () => {
    writeSettings(derived());
    expect(run().ret).toEqual(derived());
  });

  it("removes only grants it recorded writing that the derived set no longer wants", () => {
    const stale = "WebFetch(domain:gone.example)";
    writeSettings([...derived(), stale]);
    writeVersion([...derived(), stale]);
    run();
    const allow = JSON.parse(fs.readFileSync(settings(), "utf-8")).permissions.allow;
    expect(allow).not.toContain(stale);
    expect(allow).toContain("WebFetch(domain:models.dev)");
  });

  it("never removes a hand-added grant bkit did not record", () => {
    const handAdded = "WebFetch(domain:mine.example)";
    writeSettings([...derived(), handAdded]);
    writeVersion(derived()); // bkit never claimed handAdded
    run();
    const allow = JSON.parse(fs.readFileSync(settings(), "utf-8")).permissions.allow;
    expect(allow).toContain(handAdded);
  });

  it("prunes nothing when the record is absent", () => {
    const stale = "WebFetch(domain:gone.example)";
    writeSettings([...derived(), stale]);
    // no .bkit/version at all -> recorded = [] -> bkit claims authorship of nothing
    run();
    const allow = JSON.parse(fs.readFileSync(settings(), "utf-8")).permissions.allow;
    expect(allow).toContain(stale);
  });

  it("emits the derived-grants-pruned advisory on a removal", () => {
    const stale = "WebFetch(domain:gone.example)";
    writeSettings([...derived(), stale]);
    writeVersion([...derived(), stale]);
    const { adv } = run();
    expect(adv.map((a) => a.id)).toContain("derived-grants-pruned");
  });

  // --- T15: the dryRun write-set signal survives, which is the bkit check drift gate ---
  it("T15: dryRun with a missing grant still pushes exactly one write, return still null", () => {
    writeSettings([]); // every derived grant missing
    const { ret, ws } = run(true);
    expect(ret).toBeNull();
    expect(ws.writes.filter((w) => w.path === settings())).toHaveLength(1);
  });

  it("T15: dryRun with a prunable recorded grant still pushes one write", () => {
    const stale = "WebFetch(domain:gone.example)";
    writeSettings([...derived(), stale]);
    writeVersion([...derived(), stale]);
    const { ws } = run(true);
    expect(ws.writes.filter((w) => w.path === settings())).toHaveLength(1);
  });

  it("T15: dryRun against an already-equal file pushes zero writes", () => {
    writeSettings(derived());
    const { ws } = run(true);
    expect(ws.writes).toHaveLength(0);
  });
});
