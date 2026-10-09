/**
 * bkit-status-commands-parity.test.ts — the status / counter commands answer
 * exactly as the shell helpers they replace, while both exist.
 *
 * The workflows still source `bkit-status-fold.sh`, `bkit-status-route.sh`,
 * `bkit-counter-bus.sh` and `bkit-counter-bus-config.sh` until they are
 * rewritten onto `bkit status`, `bkit counters` and `bkit steps`. Each fixture
 * log is read by both, and any disagreement fails. Retire this file together
 * with the four scripts.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { THRESHOLDS } from "./commands/workflow/counters";
import { runCommand } from "./commands/lib";
import { COMMANDS } from "./commands/registry";

const SCRIPTS = path.resolve(__dirname, "../templates/.bkit/scripts");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-parity-"));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

const SOURCES = ["bkit-status-fold.sh", "bkit-status-route.sh", "bkit-counter-bus.sh"]
  .map((f) => `. "${path.join(SCRIPTS, f)}"`)
  .join("; ");

/**
 * Run every shell query in ONE process (one per query is minutes of spawn time).
 * Each query prints `<id>\t<exit>\t<stdout>`.
 */
function shellAll(queries: Record<string, string>): Record<string, { code: number; out: string }> {
  const body = Object.entries(queries)
    .map(
      ([id, q]) =>
        `o=$(${q} 2>/dev/null); printf '%s\\t%s\\t%s\\n' "${id}" "$?" "$(printf '%s' "$o" | tr '\\n' ' ')"`,
    )
    .join("\n");
  const res = spawnSync("sh", ["-c", `${SOURCES}\n${body}`], {
    encoding: "utf-8",
    maxBuffer: 1 << 26,
  });
  const out: Record<string, { code: number; out: string }> = {};
  for (const line of res.stdout.split("\n").filter(Boolean)) {
    const [id, code, text] = line.split("\t");
    out[id!] = { code: Number(code), out: (text ?? "").trim() };
  }
  return out;
}

const shell = (q: string) => shellAll({ q }).q!;

async function command(
  argv: string[],
): Promise<{ code: number; json: Record<string, unknown> | undefined }> {
  const out: string[] = [];
  const code = (await runCommand(argv, COMMANDS, {
    classicVerbs: new Set(),
    io: { stdout: (t) => out.push(t), stderr: () => undefined },
  }))!;
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
}

const SHA = (n: number) => String(n).padStart(40, "0");
const at = (m: number) => `2026-10-01T00:${String(m).padStart(2, "0")}:00Z`;
const started = (workflow: string, m: number) => ({
  type: "workflow-started",
  workflow,
  at: at(m),
});
const ended = (type: string, workflow: string, m: number) => ({ type, workflow, at: at(m) });
const done = (workflow: string, step: string, m: number, extra: Record<string, unknown> = {}) => ({
  type: "step-done",
  workflow,
  step,
  status: "DONE",
  at: at(m),
  parentSha: SHA(m),
  artifacts: [],
  ...extra,
});

// Step names carry their workflow as a prefix, as every real step does.
const FIXTURES: Record<string, object[]> = {
  "one run, sub-plans, strategies": [
    started("build", 0),
    done("build", "build-verify", 1, {
      subPlan: 1,
      verdict: "FAIL",
      failures: 2,
      strategy: "STANDARD",
    }),
    done("build", "build-verify", 2, {
      subPlan: 1,
      verdict: "PASS",
      failures: 0,
      strategy: "PIVOT",
    }),
    done("build", "build-verify", 3, { subPlan: 2, verdict: "CONCERNS" }),
    { ...done("build", "build-remediate", 4), status: "FAILED" },
  ],
  "finished run then fresh run": [
    started("build", 0),
    done("build", "build-verify", 1, { verdict: "FAIL", failures: 1, strategy: "PIVOT" }),
    ended("workflow-failed", "build", 2),
    started("build", 3),
    done("build", "build-test", 4, { verdict: "PASS", failures: 0 }),
  ],
  "debug modes and soak marker": [
    started("debug", 0),
    done("debug", "debug-soak", 1, { debugMode: "NORMAL", pushMode: "LOCAL" }),
    { type: "workflow-meta", workflow: "debug", at: at(2), debugMode: "SOAK", soakEntryAt: at(2) },
    done("debug", "debug-soak", 3, { verdict: "FAIL", failures: 3 }),
  ],
  "interleaved workflows, replayed row": [
    started("build", 0),
    done("build", "build-verify", 1),
    done("build", "build-verify", 1),
    started("debug", 2),
    ended("workflow-done", "debug", 3),
    done("build", "build-verify", 4),
  ],
  "no start row (ship)": [done("ship", "ship-merge", 1, { verdict: "PASS", failures: 0 })],
  empty: [],
};

const fileFor = (name: string) => {
  const f = path.join(dir, `${name.replace(/\W+/g, "-")}.jsonl`);
  fs.writeFileSync(
    f,
    FIXTURES[name]!.map((r) => JSON.stringify(r)).join("\n") + (FIXTURES[name]!.length ? "\n" : ""),
  );
  return f;
};

const WORKFLOWS = ["build", "debug", "ship"];
const STEPS = [
  "build-verify",
  "build-test",
  "build-remediate",
  "debug-soak",
  "ship-merge",
  "build-never-ran",
];
const FILTERS: Array<{ shell: string; flags: string[] }> = [
  { shell: "", flags: [] },
  { shell: "--sub-plan 1", flags: ["--sub-plan=1"] },
  { shell: "--sub-plan 2", flags: ["--sub-plan=2"] },
  { shell: "--since soakEntryAt", flags: ["--since=soakEntryAt"] },
];
const POSITIONS = [
  ["counter_count", "count"],
  ["counter_next", "next"],
  ["counter_current", "current"],
] as const;

/** Each workflow's own steps plus one foreign step; every query starts a jq. */
const PAIRS = WORKFLOWS.flatMap((w) => [
  ...STEPS.filter((s) => s.startsWith(`${w}-`)).map((s) => [w, s] as const),
  [w, w === "ship" ? "build-verify" : "ship-merge"] as const,
]);
/** next / current are count + 1 / count-refusing-0: checked unfiltered; count under every filter. */
const derivations = () =>
  [...FILTERS.entries()].flatMap(([fi, f]) =>
    POSITIONS.filter(([, p]) => p === "count" || fi === 0).map((pos) => ({ fi, f, pos })),
  );

describe.each(Object.keys(FIXTURES))("%s", (name) => {
  const file = fileFor(name);
  const queries: Record<string, string> = {};
  for (const w of WORKFLOWS) queries[`run ${w}`] = `run_number "${file}" ${w}`;
  for (const [w, s] of PAIRS) {
    for (const {
      fi,
      f,
      pos: [fn],
    } of derivations())
      queries[`${fn} ${w} ${s} ${fi}`] = `${fn} "${file}" ${w} ${s} ${f.shell}`;
    FILTERS.slice(0, 3).forEach((f, fi) => {
      for (const fn of ["route_last_verdict", "route_last_failures", "route_last_strategy"]) {
        queries[`${fn} ${w} ${s} ${fi}`] = `${fn} "${file}" ${w} ${s} ${f.shell}`;
      }
    });
  }
  for (const fn of ["route_get_debug_mode", "route_get_push_mode"]) queries[fn] = `${fn} "${file}"`;
  const sh = shellAll(queries);

  it("counter_count / counter_next / counter_current = counters derive", async () => {
    for (const [w, s] of PAIRS) {
      for (const {
        fi,
        f,
        pos: [fn, position],
      } of derivations()) {
        const want = sh[`${fn} ${w} ${s} ${fi}`]!;
        const ts = await command([
          "counters",
          "derive",
          `--file=${file}`,
          `--workflow=${w}`,
          `--step=${s}`,
          `--position=${position}`,
          ...f.flags,
        ]);
        const where = `${fn} ${w} ${s} ${f.shell}`;
        expect(ts.code === 0, `${where}: exit`).toBe(want.code === 0);
        if (want.code === 0) expect(String(ts.json!.value), where).toBe(want.out);
      }
    }
  });

  it("run_number = counters run", async () => {
    for (const w of WORKFLOWS) {
      const ts = await command(["counters", "run", `--file=${file}`, `--workflow=${w}`]);
      expect(String(ts.json!.run), w).toBe(sh[`run ${w}`]!.out);
    }
  });

  it("route_last_verdict / failures / strategy = status route", async () => {
    for (const [w, s] of PAIRS) {
      for (const [fi, f] of FILTERS.slice(0, 3).entries()) {
        const ts = await command([
          "status",
          "route",
          `--file=${file}`,
          `--workflow=${w}`,
          `--step=${s}`,
          ...f.flags,
        ]);
        const where = `${w} ${s} ${f.shell}`;
        const verdict = sh[`route_last_verdict ${w} ${s} ${fi}`]!;
        expect(ts.json!.verdict ?? "", `verdict ${where}`).toBe(
          verdict.code === 0 ? verdict.out : "",
        );
        const failures = sh[`route_last_failures ${w} ${s} ${fi}`]!;
        expect(
          ts.json!.failures === null ? "" : String(ts.json!.failures),
          `failures ${where}`,
        ).toBe(failures.code === 0 ? failures.out : "");
        // route_last_strategy never filters on its WORKFLOW argument, so it would
        // answer `debug build-verify` from build's rows. The command scopes to the
        // workflow, as the shell's usage line promises; real steps are
        // workflow-prefixed, so only a step of its own workflow is comparable.
        if (!s.startsWith(`${w}-`)) continue;
        const strategy = sh[`route_last_strategy ${w} ${s} ${fi}`]!;
        expect(ts.json!.strategy ?? "", `strategy ${where}`).toBe(strategy.out);
        expect(ts.json!.nextStrategy, `nextStrategy ${where}`).toBe(
          shell(`ladder_next "${strategy.out}"`).out,
        );
      }
    }
  });

  it("route_get_debug_mode / push_mode = status route", async () => {
    const ts = await command(["status", "route", `--file=${file}`, "--workflow=debug"]);
    for (const [fn, key] of [
      ["route_get_debug_mode", "debugMode"],
      ["route_get_push_mode", "pushMode"],
    ]) {
      const want = sh[fn]!;
      expect(ts.json![key] ?? "", fn).toBe(want.code === 0 ? want.out : "");
    }
  });
});

describe("decide_next / check_max = counters route", () => {
  it.each([
    ["0", "0"],
    ["1", "0"],
    ["3", "3"],
    ["4", "3"],
    ["", "3"],
    ["abc", "3"],
    ["1.5", "3"],
    ["1", ""],
  ])("value %j max %j", async (value, max) => {
    const sh = shell(`decide_next X "${value}" "${max}" go stop`);
    const ts = await command([
      "counters",
      "route",
      "--name=X",
      `--value=${value}`,
      `--max=${max}`,
      "--continue=go",
      "--exceeded=stop",
    ]);
    expect(ts.code).toBe(sh.code);
    if (sh.code <= 1) expect(ts.json!.next).toBe(sh.out);
  });
});

describe("bkit-counter-bus-config.sh = counters max", () => {
  it("names the same thresholds with the same values", () => {
    const names = Object.keys(THRESHOLDS);
    const res = spawnSync(
      "sh",
      [
        "-c",
        `. "${path.join(SCRIPTS, "bkit-counter-bus-config.sh")}"; ${names.map((n) => `echo ${n}=$${n}`).join("; ")}; set | grep -c '^MAX_'`,
      ],
      { encoding: "utf-8" },
    );
    const lines = res.stdout.trim().split("\n");
    expect(
      Object.fromEntries(lines.slice(0, -1).map((l) => [l.split("=")[0], Number(l.split("=")[1])])),
    ).toEqual(THRESHOLDS);
    expect(Number(lines.at(-1))).toBe(names.length);
  });
});
