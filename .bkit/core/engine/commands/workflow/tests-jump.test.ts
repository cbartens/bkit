import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { testsCommand } from "./tests";

let cache: string;
let queue: string;
const saved = process.env.XDG_CACHE_HOME;

beforeEach(() => {
  cache = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-jump-")));
  queue = path.join(cache, "bkit", "machine-lock", "tests.queue");
  process.env.XDG_CACHE_HOME = cache;
});

afterEach(() => {
  if (saved === undefined) delete process.env.XDG_CACHE_HOME;
  else process.env.XDG_CACHE_HOME = saved;
  fs.rmSync(cache, { recursive: true, force: true });
});

async function jump(
  args: string[],
): Promise<{ code: number; err: string; json: Record<string, unknown> | undefined }> {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["tests", "jump", ...args, "--json"], [testsCommand], {
    classicVerbs: new Set<string>(),
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  if (code === null) throw new Error("tests jump was not handled as a registered verb");
  return {
    code,
    err: err.join(""),
    json: out.length ? (JSON.parse(out.join("")) as Record<string, unknown>) : undefined,
  };
}

const markers = () =>
  fs.existsSync(queue) ? fs.readdirSync(queue).filter((n) => n.endsWith(".jump")) : [];

/** A held place: the lock script counts it as live for 120 s with no process behind it. */
const held = (name: string, line: string) => {
  fs.mkdirSync(queue, { recursive: true });
  fs.writeFileSync(path.join(queue, `${name}.held`), `${line}\n`);
};

describe("bkit tests jump", () => {
  it("tests jump reads the queue and jumps through the template's script", async () => {
    held("1.000001-11", "build-1 — /co/a");
    // A ticket no live process locks is stale: the script drops it, so it never matches.
    fs.writeFileSync(path.join(queue, "1.000002-12"), "build-2 — /co/b\n");
    const res = await jump(["build-1"]);
    expect(res.code, res.err).toBe(0);
    expect(res.json).toEqual({ run: "build-1", checkout: "/co/a" });
    const [marker] = markers();
    expect(fs.readFileSync(path.join(queue, marker!), "utf-8")).toBe("build-1 — /co/a\n");
    const stale = await jump(["build-2"]);
    expect(stale.code).toBe(1);
    expect(fs.existsSync(path.join(queue, "1.000002-12"))).toBe(false);
  });

  it("tests jump reports no match in the EXIT.NO style when the script finds none", async () => {
    const none = await jump(["build-1"]);
    expect(none.code).toBe(1);
    expect(none.err).toContain("no run named build-1 waits for tests");
    expect(fs.existsSync(queue)).toBe(false);
    held("1.000001-11", "build-2 — /co/b");
    const other = await jump(["build-1"]);
    expect(other.code).toBe(1);
    expect(other.err).toContain(
      "no run named build-1 waits for tests\nwaiting now:\n  build-2 — /co/b",
    );
    expect(markers()).toEqual([]);
  });

  it("asks for --checkout when two checkouts share the name, then picks one", async () => {
    held("1.000001-11", "build-1 — /co/a");
    held("1.000002-12", "build-1 — /co/b");
    const refused = await jump(["build-1"]);
    expect(refused.code).toBe(1);
    expect(refused.err).toContain(
      "several runs named build-1 wait for tests:\n  build-1 — /co/a\n  build-1 — /co/b\npass --checkout <path> to pick one",
    );
    expect(markers()).toEqual([]);
    expect((await jump(["build-1", "--checkout", "/co/b"])).code).toBe(0);
    expect(fs.readFileSync(path.join(queue, markers()[0]!), "utf-8")).toBe("build-1 — /co/b\n");
  });

  it("exits 3 with the script's reason when the marker cannot be written", async () => {
    held("1.000001-11", "build-1 — /co/a");
    fs.chmodSync(queue, 0o500);
    try {
      const res = await jump(["build-1"]);
      expect(res.code).toBe(3);
      expect(res.err).toContain("cannot write a jump marker");
    } finally {
      fs.chmodSync(queue, 0o700);
    }
  });
});
