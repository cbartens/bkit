// audits/repo/vitest-process-group.integration.test.ts — `stopGroup` ends a child's own
// background children too.
//
// The child starts a background writer that waits for the child to die and then writes a file,
// the way a machine-lock holder's perl process writes its history after its caller is killed.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { afterEach, expect, it } from "vitest";

import { spawnGroup, stopGroup } from "../../../../../vitest.process-group";

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

async function appears(file: string): Promise<boolean> {
  const until = Date.now() + 5_000;
  while (!fs.existsSync(file) && Date.now() < until) await delay(20);
  return fs.existsSync(file);
}

it("stopGroup kills a background writer that outlives its parent", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-process-group-"));
  temps.push(dir);
  const ready = path.join(dir, "ready");
  const late = path.join(dir, "late");
  const child = spawnGroup(
    "bash",
    [
      "-c",
      'p=$$; (while kill -0 "$p" 2>/dev/null; do sleep 0.02; done; echo late >"$LATE") & echo ready >"$READY"; exec sleep 30',
    ],
    { env: { ...process.env, READY: ready, LATE: late }, stdio: "ignore" },
  );
  expect(await appears(ready)).toBe(true);

  await stopGroup(child);
  await delay(300);

  expect(fs.existsSync(late)).toBe(false);
});
