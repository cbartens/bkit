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

async function jump(args: string[]): Promise<{ code: number; err: string }> {
  const err: string[] = [];
  const code = await runCommand(["tests", "jump", ...args], [testsCommand], {
    classicVerbs: new Set<string>(),
    io: { stdout: () => undefined, stderr: (t) => err.push(t) },
  });
  if (code === null) throw new Error("tests jump was not handled as a registered verb");
  return { code, err: err.join("") };
}

const markers = () =>
  fs.existsSync(queue) ? fs.readdirSync(queue).filter((n) => n.endsWith(".jump")) : [];

describe("bkit tests jump", () => {
  it("refuses without a queue folder, and creates none", async () => {
    const res = await jump(["build-1"]);
    expect(res.code).toBe(1);
    expect(res.err).toContain("no run named build-1 waits for tests");
    expect(fs.existsSync(queue)).toBe(false);
  });

  it("writes one marker holding the run's line, from a ticket or a held place", async () => {
    fs.mkdirSync(queue, { recursive: true });
    fs.writeFileSync(path.join(queue, "1.000001-11.held"), "build-1 — /co/a\n");
    const res = await jump(["build-1"]);
    expect(res.code).toBe(0);
    const [marker] = markers();
    expect(fs.readFileSync(path.join(queue, marker!), "utf-8")).toBe("build-1 — /co/a\n");
  });

  it("asks for --checkout when two checkouts share the name, then picks one", async () => {
    fs.mkdirSync(queue, { recursive: true });
    fs.writeFileSync(path.join(queue, "1.000001-11"), "build-1 — /co/a\n");
    fs.writeFileSync(path.join(queue, "1.000002-12"), "build-1 — /co/b\n");
    const refused = await jump(["build-1"]);
    expect(refused.code).toBe(1);
    expect(refused.err).toContain("pass --checkout");
    expect(markers()).toEqual([]);
    expect((await jump(["build-1", "--checkout", "/co/b"])).code).toBe(0);
    expect(fs.readFileSync(path.join(queue, markers()[0]!), "utf-8")).toBe("build-1 — /co/b\n");
  });
});
