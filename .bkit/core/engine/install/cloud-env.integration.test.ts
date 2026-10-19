// T4 — five-surface egress fan-out parity.
//
// One derived set reaches five places that encode it differently. This asserts the
// single derived union is present in every surface after a REAL install — no mocks at
// the install boundary.
//
// The flag set includes `--opencode=…`: `.opencode/opencode.json` `permission.bash`
// only exists when an opencode provider is installed.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BKIT_SHIPPED_NETWORK_DOMAINS, BKIT_SHIPPED_NETWORK_HOSTS } from "./cloud-env";
import { requireTsx } from "../../../../vitest.tsx-bin";

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-egress-fanout-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const here = path.dirname(new URL(import.meta.url).pathname);
const bkitInstallPath = path.resolve(here, "../cli.ts");
const read = (rel: string) => fs.readFileSync(path.join(tmpDir, rel), "utf-8");

describe("T4 — the derived egress set reaches all five surfaces", () => {
  it("cloud paste, cursor allowlist, claude WebFetch and opencode bash globs all name it", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "fanout", version: "1.0.0", packageManager: "pnpm@10.34.3" }, null, 2),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const result = spawnSync(
      requireTsx(),
      [
        bkitInstallPath,
        "install",
        "--claude",
        "--cursor",
        "--opencode=openrouter",
        "--tracker=github",
      ],
      {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 120_000,
      },
    );
    expect(result.status, `install crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);

    // A base only the registry derives.
    const probe = "models.dev";
    expect(BKIT_SHIPPED_NETWORK_DOMAINS).toContain(probe);

    // 1 — Claude cloud paste fence (apex + wildcard)
    const claudeCloud = read(path.join(".claude", "bkit-cloud.md"));
    expect(claudeCloud).toContain(`\n${probe}\n`);
    expect(claudeCloud).toContain(`\n*.${probe}\n`);

    // 2 — Cursor cloud paste fence (exact hosts, no wildcard)
    const cursorCloud = read(path.join(".cursor", "bkit-cloud.md"));
    expect(cursorCloud).toContain(probe);
    expect(cursorCloud).not.toContain(`*.${probe}`);

    // 3 — .cursor/allowlist.json domains
    const allowlist = JSON.parse(read(path.join(".cursor", "allowlist.json"))) as {
      domains: string[];
    };
    expect(allowlist.domains).toContain(probe);

    // 4 — .claude/settings.json WebFetch grants
    const settings = JSON.parse(read(path.join(".claude", "settings.json"))) as {
      permissions: { allow: string[] };
    };
    expect(settings.permissions.allow).toContain(`WebFetch(domain:${probe})`);

    // 5 — .opencode/opencode.json permission.bash curl globs
    const opencode = read(path.join(".opencode", "opencode.json"));
    expect(opencode).toContain(probe);

    // Absence leg: the installed hook carries no domain array of its own (same as the
    // template assertion).
    const hook = read(path.join(".cursor", "hooks", "bkit-guardrails.cjs"));
    expect(hook).not.toContain("SHIPPED_NETWORK_BASES");

    // Every shipped HOST reaches the Cursor surfaces, not just the one probe.
    for (const host of BKIT_SHIPPED_NETWORK_HOSTS) {
      expect(cursorCloud, `${host} missing from .cursor/bkit-cloud.md`).toContain(host);
    }
  }, 180_000);
});

// Provenance leg — claudeAllowDerived creates no drift: the check write-set is IDENTICAL
// with and without the provenance record.
describe("T14 — the provenance field contributes no bkit check drift", () => {
  it("check reports the same write set with and without claudeAllowDerived present", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "drift", version: "1.0.0", packageManager: "pnpm@10.34.3" }, null, 2),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const run = (args: string[]) =>
      spawnSync(requireTsx(), [bkitInstallPath, ...args], {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 120_000,
      });

    expect(run(["install", "--claude"]).status).toBe(0);

    const writeCount = (out: string) => /(\d+) write\(s\) would occur/.exec(out)?.[1] ?? "unknown";

    const withField = writeCount(run(["check"]).stdout ?? "");
    expect(withField).not.toBe("unknown");

    // strip the record and re-check: the count must not move
    const versionPath = path.join(tmpDir, ".bkit", "version");
    const v = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as Record<string, unknown>;
    expect(Array.isArray(v.claudeAllowDerived)).toBe(true);
    expect((v.claudeAllowDerived as string[]).length).toBeGreaterThan(0);
    delete v.claudeAllowDerived;
    fs.writeFileSync(versionPath, JSON.stringify(v, null, 2) + "\n");

    expect(writeCount(run(["check"]).stdout ?? "")).toBe(withField);
  }, 180_000);
});
