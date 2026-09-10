// Prune of the retired `Bash(curl:*)` / `Bash(wget:*)` ask rules.
//
// A template edit does NOT reach existing consumers: `.claude/settings.json` is Tier 2
// JSON deep-containment and the merge is additive — it never prunes. Without this
// one-shot migration a row bkit stopped shipping survives in every installed repo
// forever, and shell curl keeps prompting in cloud sessions that cannot answer.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { pruneRetiredClaudeAskRules } from "./bkit-modules";
import type { WriteSet } from "./bkit-tiers";

let tmpDir: string;
let settings: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-prune-ask-test-"));
  settings = path.join(tmpDir, "settings.json");
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(ask: string[], extra: Record<string, unknown> = {}): void {
  fs.writeFileSync(
    settings,
    JSON.stringify({
      permissions: { allow: ["Bash(*)"], ask, deny: ["Bash(rm -rf /*)"] },
      ...extra,
    }),
    "utf-8",
  );
}

function read(): { permissions: { allow: string[]; ask: string[]; deny: string[] } } {
  return JSON.parse(fs.readFileSync(settings, "utf-8"));
}

function ws(): WriteSet {
  return { writes: [] };
}

describe("pruneRetiredClaudeAskRules", () => {
  it("removes both retired rules and reports them", () => {
    write(["Bash(curl:*)", "Bash(wget:*)", "Bash(sudo:*)"]);
    const line = pruneRetiredClaudeAskRules(settings, false, ws());
    expect(line).toContain("Bash(curl:*)");
    expect(line).toContain("Bash(wget:*)");
    expect(read().permissions.ask).toEqual(["Bash(sudo:*)"]);
  });

  it("leaves every other ask rule untouched, in order", () => {
    const keep = ["Bash(sudo:*)", "Bash(git reset --hard:*)", "Read(./.env)", "Read(./**/.env.*)"];
    write(["Bash(curl:*)", ...keep, "Bash(wget:*)"]);
    pruneRetiredClaudeAskRules(settings, false, ws());
    expect(read().permissions.ask).toEqual(keep);
  });

  it("never touches allow or deny", () => {
    write(["Bash(curl:*)"]);
    pruneRetiredClaudeAskRules(settings, false, ws());
    const d = read();
    expect(d.permissions.allow).toEqual(["Bash(*)"]);
    expect(d.permissions.deny).toEqual(["Bash(rm -rf /*)"]);
  });

  it("preserves unrelated top-level keys (hooks, $schema)", () => {
    write(["Bash(curl:*)"], {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      hooks: { SessionStart: [{ hooks: [{ type: "command", command: "x" }] }] },
    });
    pruneRetiredClaudeAskRules(settings, false, ws());
    const d = JSON.parse(fs.readFileSync(settings, "utf-8"));
    expect(d.$schema).toBe("https://json.schemastore.org/claude-code-settings.json");
    expect(d.hooks.SessionStart[0].hooks[0].command).toBe("x");
  });

  it("is idempotent — second run is a no-op returning null", () => {
    write(["Bash(curl:*)", "Bash(sudo:*)"]);
    expect(pruneRetiredClaudeAskRules(settings, false, ws())).not.toBeNull();
    const after = fs.readFileSync(settings, "utf-8");
    expect(pruneRetiredClaudeAskRules(settings, false, ws())).toBeNull();
    expect(fs.readFileSync(settings, "utf-8")).toBe(after);
  });

  it("does NOT match a consumer's own curl rule written another way", () => {
    const consumer = ["Bash(curl https://example.com/:*)", "Bash(curl)", "Bash(curl *)"];
    write([...consumer]);
    expect(pruneRetiredClaudeAskRules(settings, false, ws())).toBeNull();
    expect(read().permissions.ask).toEqual(consumer);
  });

  it("dry-run reports without writing", () => {
    write(["Bash(curl:*)", "Bash(sudo:*)"]);
    const before = fs.readFileSync(settings, "utf-8");
    const w = ws();
    expect(pruneRetiredClaudeAskRules(settings, true, w)).not.toBeNull();
    expect(fs.readFileSync(settings, "utf-8")).toBe(before);
    // Dry-run still records the write so it computes the same writeset as a real run.
    expect(w.writes.map((x) => x.path)).toEqual([settings]);
  });

  it("no-ops on an absent file, an absent ask array, and malformed JSON", () => {
    expect(pruneRetiredClaudeAskRules(path.join(tmpDir, "nope.json"), false, ws())).toBeNull();

    fs.writeFileSync(settings, JSON.stringify({ permissions: { allow: [] } }), "utf-8");
    expect(pruneRetiredClaudeAskRules(settings, false, ws())).toBeNull();

    fs.writeFileSync(settings, "{ not json", "utf-8");
    expect(pruneRetiredClaudeAskRules(settings, false, ws())).toBeNull();
    // Malformed consumer JSON is left byte-identical, never rewritten.
    expect(fs.readFileSync(settings, "utf-8")).toBe("{ not json");
  });
});

describe("shipped settings no longer carry the retired rules", () => {
  const pkgRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");

  for (const rel of [".claude/settings.json", ".bkit/templates/.claude/settings.json"]) {
    it(`${rel} has no curl/wget ask row (guards against a re-add)`, () => {
      const doc = JSON.parse(fs.readFileSync(path.join(pkgRoot, rel), "utf-8")) as {
        permissions: { ask: string[] };
      };
      expect(doc.permissions.ask).not.toContain("Bash(curl:*)");
      expect(doc.permissions.ask).not.toContain("Bash(wget:*)");
      // The rest of the ask surface must survive — this is a targeted prune, not a purge.
      expect(doc.permissions.ask).toContain("Bash(sudo:*)");
      expect(doc.permissions.ask).toContain("Read(./.bkit/.env)");
    });
  }
});
