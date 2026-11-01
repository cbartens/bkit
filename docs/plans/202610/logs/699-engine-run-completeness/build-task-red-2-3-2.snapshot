import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  appendFrictionRow,
  appendJournalRow,
  engineCallRow,
  frictionKey,
  frictionRow,
  journalEnabled,
  shouldRecordFriction,
} from "./journal";
import { validate, writerProblem } from "./telemetry";

const dirs: string[] = [];
const tmp = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-journal-"));
  dirs.push(d);
  return d;
};
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const SHARED = new Set([0, 1, 2, 80, 81, 82]);
const own = (root: string, over: Partial<Parameters<typeof frictionRow>[0]> = {}) =>
  frictionRow({
    workflow: "build",
    step: "build-summary",
    noun: "workflows",
    verb: "summary",
    code: 9,
    bookRoot: root,
    parentSha: "a".repeat(40),
    ...over,
  });

describe("shouldRecordFriction", () => {
  it("writes no friction row for a declared routing exit", () => {
    const excluded = new Set([...SHARED, 3, 4]);
    for (const code of [0, 1, 2, 3, 4, 80, 81, 82]) {
      expect(shouldRecordFriction(code, excluded)).toBe(false);
    }
    expect(shouldRecordFriction(9, excluded)).toBe(true);
    expect(shouldRecordFriction(null, excluded)).toBe(true);
  });
});

describe("frictionRow", () => {
  it("never leaves by.step empty", () => {
    const root = tmp();
    for (const step of [undefined, ""]) {
      const row = own(root, { step });
      expect((row["by"] as { step: string }).step).toBe("workflows-summary");
      expect(row["key"]).toBe("workflows-summary/workflows-summary");
      expect(validate(row)).toEqual({ ok: true });
      expect(writerProblem(row)).toBeUndefined();
    }
    const named = own(root);
    expect((named["by"] as { step: string }).step).toBe("build-summary");
    expect(named["key"]).toBe(frictionKey("workflows", "summary", "build-summary"));
    expect(named["category"]).toBe("tool-failure");
    expect(validate(named)).toEqual({ ok: true });
  });

  it("keeps the key under the identity-gated prune's truncation bound", () => {
    expect(frictionKey("workflows", "summary", "s".repeat(200)).length).toBeLessThanOrEqual(60);
  });

  it("writes a friction row with no run object when parentSha is unresolvable", () => {
    const root = tmp();
    const row = own(root, { parentSha: "" });
    expect(row).not.toHaveProperty("run");
    expect(validate(row)).toEqual({ ok: true });
    expect(appendFrictionRow(root, row)).toEqual({ ok: true });
    const line = fs.readFileSync(path.join(root, ".bkit", "friction.jsonl"), "utf-8");
    expect(JSON.parse(line)).not.toHaveProperty("run");
    expect(own(root)["run"]).toEqual({ parentSha: "a".repeat(40) });
  });
});

describe("appendFrictionRow", () => {
  it("raises recurrenceCount on a same-key row", () => {
    const root = tmp();
    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
    appendFrictionRow(root, own(root, { step: "build-other" }));
    const lines = fs
      .readFileSync(path.join(root, ".bkit", "friction.jsonl"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(lines).toHaveLength(2);
    expect(lines[0]!["recurrenceCount"]).toBe(3);
    expect(lines[1]!["recurrenceCount"]).toBeUndefined();
  });

  it("returns a failed result instead of throwing when the row is refused", () => {
    const root = tmp();
    const result = appendFrictionRow(root, own(root, { workflow: "audit" }));
    expect(result.ok).toBe(false);
    expect(fs.existsSync(path.join(root, ".bkit", "friction.jsonl"))).toBe(false);
  });
});

describe("engineCallRow", () => {
  it("journals flag names only", () => {
    const row = engineCallRow({
      workflow: "build",
      at: "2026-10-29T10:00:00Z",
      noun: "steps",
      verb: "finish",
      flags: ["--step=build-summary", "--token=SECRET", "--file", "/home/me/x", "--json"],
    });
    expect(row).toEqual({
      type: "engine-call",
      workflow: "build",
      at: "2026-10-29T10:00:00Z",
      noun: "steps",
      verb: "finish",
      flags: ["step", "token", "file", "json"],
    });
    expect(JSON.stringify(row)).not.toMatch(/SECRET|\/home\/me|build-summary/);
  });
});

describe("appendJournalRow", () => {
  it("appends one status line and reports a failed write instead of throwing", () => {
    const root = tmp();
    const file = path.join(root, "status.jsonl");
    const row = engineCallRow({ workflow: "build", noun: "a", verb: "b", flags: [] });
    expect(appendJournalRow(file, row)).toEqual({ ok: true });
    expect(fs.readFileSync(file, "utf-8").trim().split("\n")).toHaveLength(1);
    const bad = appendJournalRow(path.join(root, "missing", "status.jsonl"), row);
    expect(bad.ok).toBe(false);
  });
});

describe("journalEnabled", () => {
  it("writes no row when BKIT_ENGINE_JOURNAL is off", () => {
    expect(journalEnabled({ BKIT_ENGINE_JOURNAL: "off" })).toBe(false);
    expect(journalEnabled({ BKIT_ENGINE_JOURNAL: "on" })).toBe(true);
    expect(journalEnabled({})).toBe(true);
  });
});
