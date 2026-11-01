import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

/** `after` runs once, right after `readFileSync` of `file` returns: a second writer between read and write. */
const readHook = vi.hoisted(() => ({
  file: "",
  after: undefined as (() => void) | undefined,
}));
vi.mock("node:fs", async (importOriginal) => {
  const real = await importOriginal<typeof import("node:fs")>();
  const readFileSync = ((...args: Parameters<typeof real.readFileSync>) => {
    const out = real.readFileSync(...args);
    if (String(args[0]) === readHook.file) {
      const after = readHook.after;
      readHook.after = undefined;
      after?.();
    }
    return out;
  }) as typeof real.readFileSync;
  return { ...real, default: { ...real, readFileSync }, readFileSync };
});

import {
  appendFrictionRow,
  appendJournalRow,
  engineCallRow,
  frictionKey,
  frictionRow,
  journalEnabled,
  launchedByGit,
  pauseFrictionRow,
  shouldRecordFriction,
} from "./journal";
import { foldFrom, validate, writerProblem } from "./telemetry";

const dirs: string[] = [];
const tmp = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-journal-"));
  dirs.push(d);
  return d;
};
afterEach(() => {
  readHook.file = "";
  readHook.after = undefined;
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

describe("pauseFrictionRow", () => {
  it("pauseFrictionRow builds a valid human-confirm row keyed owner-pause/{workflow}.{reason}", () => {
    const root = tmp();
    const row = pauseFrictionRow({
      workflow: "build",
      reason: "decision",
      bookRoot: root,
      parentSha: "a".repeat(40),
    });
    expect(row).toMatchObject({
      kind: "friction",
      key: "owner-pause/build.decision",
      by: { workflow: "build", step: "owner-pause" },
      category: "human-confirm",
      scope: "bkit-repo",
      severity: "LOW",
      source: "orchestrator",
      status: "OPEN",
      run: { parentSha: "a".repeat(40) },
    });
    expect(validate(row)).toEqual({ ok: true });
    expect(writerProblem(row)).toBeUndefined();
    expect(appendFrictionRow(root, row)).toEqual({ ok: true });
    const line = fs.readFileSync(path.join(root, ".bkit", "friction.jsonl"), "utf-8");
    expect(JSON.parse(line)).toMatchObject({
      key: "owner-pause/build.decision",
      recurrenceCount: 1,
    });
  });

  it("pauseFrictionRow keys a reasonless pause owner-pause/{workflow} and clips long keys", () => {
    const root = tmp();
    for (const reason of [undefined, ""]) {
      const row = pauseFrictionRow({ workflow: "ship", reason, bookRoot: root });
      expect(row["key"]).toBe("owner-pause/ship");
      expect(row).not.toHaveProperty("run");
      expect(validate(row)).toEqual({ ok: true });
    }
    const long = pauseFrictionRow({ workflow: "design", reason: "r".repeat(200), bookRoot: root });
    expect(long["key"]).toBe(`owner-pause/design.${"r".repeat(60 - "owner-pause/design.".length)}`);
    expect(validate(long)).toEqual({ ok: true });
  });
});

describe("appendFrictionRow", () => {
  const ledger = (root: string) => path.join(root, ".bkit", "friction.jsonl");
  const lines = (root: string) => fs.readFileSync(ledger(root), "utf-8").trim().split("\n");

  it("records a recurrence as an appended same-key row, and folds to the raised count", () => {
    const root = tmp();
    const first = own(root);
    expect(appendFrictionRow(root, first)).toEqual({ ok: true });
    const written = lines(root)[0];
    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
    expect(appendFrictionRow(root, own(root, { step: "build-other" }))).toEqual({ ok: true });

    const raw = lines(root);
    expect(raw).toHaveLength(4);
    expect(raw[0]).toBe(written);
    const rows = raw.map((l) => JSON.parse(l) as Record<string, unknown>);
    const same = rows.filter((r) => r["key"] === first["key"]);
    expect(same.map((r) => r["recurrenceCount"])).toEqual([1, 2, 3]);
    expect(same[0]).not.toHaveProperty("lastConfirmed");
    for (const r of same.slice(1)) expect(r["lastConfirmed"]).toBe(r["ts"]);
    for (const r of rows) expect(validate(r)).toEqual({ ok: true });

    const { state } = foldFrom([ledger(root)]);
    expect(state.size).toBe(2);
    const winner = [...state.values()].find((e) => e.key === first["key"]);
    expect(winner).toMatchObject({ recurrenceCount: 3, lastConfirmed: same[2]!["ts"] });
  });

  it("reopens a CLOSED row that recurs, and keeps a TRIAGED one triaged", () => {
    for (const [triaged, reopened] of [
      ["CLOSED", "OPEN"],
      ["TRIAGED", "TRIAGED"],
    ] as const) {
      const root = tmp();
      const first = own(root);
      expect(appendFrictionRow(root, first)).toEqual({ ok: true });
      const winner = JSON.parse(lines(root)[0]!) as Record<string, unknown>;
      const ts = (winner["ts"] as number) + 1;
      fs.appendFileSync(ledger(root), `${JSON.stringify({ ...winner, ts, status: triaged })}\n`);
      expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
      const last = JSON.parse(lines(root).at(-1)!) as Record<string, unknown>;
      expect(last).toMatchObject({ key: first["key"], status: reopened, recurrenceCount: 2 });
    }
  });

  it("finds the same-key row whatever the spacing of its key field", () => {
    const root = tmp();
    const first = own(root);
    fs.mkdirSync(path.dirname(ledger(root)), { recursive: true });
    fs.writeFileSync(
      ledger(root),
      `${JSON.stringify({ ...first, recurrenceCount: 4 }, null, 1).replace(/\n\s*/g, " ")}\n`,
    );
    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
    expect(JSON.parse(lines(root).at(-1)!)).toMatchObject({ recurrenceCount: 5 });
  });

  it("keeps a row another writer appends while a recurrence is recorded", () => {
    const root = tmp();
    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
    const foreign = JSON.stringify(own(root, { step: "build-foreign" }));
    readHook.file = ledger(root);
    readHook.after = () => fs.appendFileSync(ledger(root), `${foreign}\n`);
    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
    expect(readHook.after).toBeUndefined();
    const raw = lines(root);
    expect(raw).toContain(foreign);
    expect(raw).toHaveLength(3);
    expect(JSON.parse(raw[2]!)).toMatchObject({ recurrenceCount: 2 });
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

describe("launchedByGit", () => {
  it("is true only when git exported GIT_EXEC_PATH", () => {
    expect(launchedByGit({ GIT_EXEC_PATH: "/opt/homebrew/opt/git/libexec/git-core" })).toBe(true);
    expect(launchedByGit({ GIT_EXEC_PATH: "" })).toBe(false);
    expect(launchedByGit({ GIT_EDITOR: "vi" })).toBe(false);
    expect(launchedByGit({})).toBe(false);
  });
});
