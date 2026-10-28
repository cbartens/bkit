import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PreflightFinding } from "../before/index";
import type { SuppressionNote } from "../after/suppression";
import type { SetupTip } from "./catalogue";
import {
  STAR_TIP,
  STAR_TIP_ID,
  STAR_TIP_PARAGRAPH,
  STAR_TIP_OLD_ID,
  TIPS_CAP,
  TIPS_DETAILS_POINTER,
  collectTips,
  dropTipSilencedAdvisories,
  formatTips,
  isTipSilenced,
  matchesAdvisory,
  orderForWorkflow,
  setupTipsChecklistLines,
  setupTipsMarkdownLines,
  silenceLine,
  tipsBase,
  tipsIntro,
} from "./index";

const fake = (id: string, fires: boolean, extra: Partial<SetupTip> = {}): SetupTip => ({
  id,
  title: `Title ${id}`,
  line: `Line ${id}.`,
  why: `Why ${id}.`,
  ask: `Ask ${id}.`,
  steps: `Steps ${id}.`,
  fires: () => fires,
  ...extra,
});

let cwd: string;
const ignore = (ids: string[]) =>
  fs.writeFileSync(
    path.join(cwd, "package.json"),
    JSON.stringify({ bkit: { advisories: { ignore: ids } } }),
  );

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tips-"));
  fs.writeFileSync(path.join(cwd, "package.json"), "{}");
});
afterEach(() => {
  fs.rmSync(cwd, { recursive: true, force: true });
});

describe("tipsBase", () => {
  it("is null for a directory that is not a checkout and holds no manifest", () => {
    fs.rmSync(path.join(cwd, "package.json"));
    expect(tipsBase(cwd)).toBeNull();
  });

  it("returns the repo root from a nested directory, not the directory itself", () => {
    expect(spawnSync("git", ["init", "-q"], { cwd }).status).toBe(0);
    const nested = path.join(cwd, "docs", "plans");
    fs.mkdirSync(nested, { recursive: true });
    expect(tipsBase(nested)).toBe(fs.realpathSync(cwd));
  });

  it("returns the main checkout from a worktree, not the worktree", () => {
    const g = (...args: string[]) =>
      spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], { cwd });
    expect(g("init", "-q").status).toBe(0);
    g("add", "package.json");
    expect(g("commit", "-q", "-m", "init").status).toBe(0);
    const wt = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tips-wt-"));
    try {
      expect(g("worktree", "add", "-q", wt).status).toBe(0);
      expect(tipsBase(wt)).toBe(fs.realpathSync(cwd));
    } finally {
      fs.rmSync(wt, { recursive: true, force: true });
    }
  });

  it("returns the worktree's top level when the main repo is bare, never the bare repo's parent", () => {
    // `cwd` (the bare repo's parent folder) holds an unrelated package.json.
    const g = (dir: string, ...args: string[]) =>
      spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], { cwd: dir });
    const seed = path.join(cwd, "seed");
    expect(g(cwd, "init", "-q", seed).status).toBe(0);
    expect(g(seed, "commit", "-q", "--allow-empty", "-m", "init").status).toBe(0);
    expect(g(cwd, "clone", "-q", "--bare", seed, "repo.git").status).toBe(0);
    const wt = path.join(cwd, "wt");
    expect(g(path.join(cwd, "repo.git"), "worktree", "add", "-q", wt).status).toBe(0);
    const nested = path.join(wt, "docs");
    fs.mkdirSync(nested);
    expect(tipsBase(nested)).toBe(fs.realpathSync(wt));
  });
});

describe("matchesAdvisory / isTipSilenced", () => {
  it("matches exact ids and trailing-* prefixes", () => {
    expect(matchesAdvisory("a-b", "a-b")).toBe(true);
    expect(matchesAdvisory("a-b", "a-bc")).toBe(false);
    expect(matchesAdvisory("key-*", "key-x")).toBe(true);
  });

  it("silences by the tip id or a reused advisory id", () => {
    const t = fake("t", true, { advisories: ["adv-x", "blank-*"] });
    expect(isTipSilenced(t, new Set(["t"]))).toBe(true);
    expect(isTipSilenced(t, new Set(["adv-x"]))).toBe(true);
    expect(isTipSilenced(t, new Set(["blank-key-1"]))).toBe(true);
    expect(isTipSilenced(t, new Set(["other"]))).toBe(false);
  });
});

describe("collectTips", () => {
  const catalogue = [fake("a", true), fake("b", false), fake("c", true, { advisories: ["adv-c"] })];

  it("keeps firing tips in catalogue order", () => {
    expect(collectTips(cwd, catalogue).tips.map((t) => t.id)).toEqual(["a", "c"]);
  });

  it("fires nothing and hides the star when there is no checkout to check", () => {
    fs.rmSync(path.join(cwd, "package.json"));
    expect(collectTips(cwd, [fake("a", true)])).toEqual({
      tips: [],
      suppressed: [],
      star: false,
    });
  });

  it("keeps the star line until its id is ignored", () => {
    expect(collectTips(cwd, catalogue).star).toBe(true);
    ignore([STAR_TIP_ID]);
    expect(collectTips(cwd, catalogue).star).toBe(false);
  });

  it("drops the star line for its older id too", () => {
    ignore([STAR_TIP_OLD_ID]);
    expect(collectTips(cwd, catalogue).star).toBe(false);
  });

  it("moves silenced tips to suppressed", () => {
    ignore(["a", "adv-c"]);
    const { tips, suppressed } = collectTips(cwd, catalogue);
    expect(tips).toEqual([]);
    expect(suppressed).toEqual([
      { id: "a", scope: "." },
      { id: "c", scope: "." },
    ]);
  });
});

describe("dropTipSilencedAdvisories", () => {
  const catalogue = [fake("env", true, { advisories: ["mcp-env-missing", "blank-*"] })];
  const finding = (
    id: string,
    severity: "advisory" | "blocker" = "advisory",
  ): PreflightFinding => ({
    id,
    severity,
    detect: "d",
    action: "a",
  });

  it("is a no-op when nothing is ignored", () => {
    const findings = [finding("mcp-env-missing")];
    expect(dropTipSilencedAdvisories(findings, cwd, undefined, catalogue)).toEqual(findings);
  });

  it("drops the advisories of a silenced tip, never a blocker", () => {
    ignore(["env"]);
    const notes: SuppressionNote[] = [];
    const kept = dropTipSilencedAdvisories(
      [finding("mcp-env-missing"), finding("blank-a"), finding("blank-b", "blocker"), finding("x")],
      cwd,
      (n) => notes.push(n),
      catalogue,
    );
    expect(kept.map((f) => f.id)).toEqual(["blank-b", "x"]);
    expect(notes.map((n) => n.id)).toEqual(["mcp-env-missing", "blank-a"]);
  });
});

describe("formatTips", () => {
  const tips = [fake("a", true), fake("b", true), fake("c", true, { caution: "Careful." })];

  it("prints nothing when no tip fires", () => {
    expect(formatTips([])).toBe("");
  });

  it("caps at TIPS_CAP and points at the rest", () => {
    const out = formatTips([...tips, fake("d", true)]);
    expect(out.startsWith(tipsIntro(3))).toBe(true);
    expect(out).toContain(`${TIPS_CAP}. Title c`);
    expect(out).toContain("Caution: Careful.");
    expect(out).not.toContain("Title d");
    expect(out).toContain("1 more: `bkit tips --all`.");
    expect(out.endsWith(TIPS_DETAILS_POINTER)).toBe(true);
  });

  it("--all prints every tip and no 'more' line", () => {
    const out = formatTips([...tips, fake("d", true)], { all: true });
    expect(out).toContain("4. Title d");
    expect(out).not.toContain("more:");
  });

  it("--workflow prints the one tip that matters most there", () => {
    const tagged = [
      fake("comms", true, { workflows: ["design", "debug"] }),
      fake("quality", true, { workflows: ["build"] }),
      fake("logs", true, { workflows: ["debug"] }),
    ];
    const build = formatTips(tagged, { workflow: "build" });
    expect(build).toBe(
      [
        '**Title quality.** Line quality. Ask your agent: "Ask quality."',
        "",
        '**Want to silence this tip?** Ask your agent to "add `quality` to `bkit.advisories.ignore` in package.json".',
      ].join("\n"),
    );
    expect(build).not.toContain(tipsIntro(1));
    expect(formatTips(tagged, { workflow: "debug" }).startsWith("**Title comms.**")).toBe(true);
    expect(formatTips(tagged, { workflow: "debug", all: true })).toContain("1. Title comms");
  });
});

describe("formatTips — star line", () => {
  const tips = [fake("a", true), fake("b", true)];

  it("closes bare and --all output, after the details pointer", () => {
    for (const opts of [{}, { all: true }]) {
      const out = formatTips(tips, { ...opts, star: true });
      expect(out.endsWith(`${TIPS_DETAILS_POINTER}\n\n${STAR_TIP}`)).toBe(true);
    }
  });

  it("follows a workflow's tip, and the silence line names both", () => {
    expect(formatTips(tips, { workflow: "build", star: true })).toBe(
      [
        '**Title a.** Line a. Ask your agent: "Ask a."',
        "",
        "**Do you like bkit?** Then give it a star at [https://github.com/cbartens/bkit](https://github.com/cbartens/bkit)!",
        "",
        '**Want to silence these tips?** Ask your agent to "add `a` and `bkit-star` to `bkit.advisories.ignore` in package.json".',
      ].join("\n"),
    );
    expect(formatTips([], { workflow: "ship", star: true })).toBe(
      `${STAR_TIP_PARAGRAPH}\n\n${silenceLine([STAR_TIP_ID])}`,
    );
  });

  it("is absent when silenced", () => {
    expect(formatTips(tips, { star: false })).not.toContain(STAR_TIP);
    expect(formatTips([], { star: false })).toBe("");
    expect(formatTips([], { workflow: "ship", star: false })).toBe("");
  });

  it("is left out of audit and utility output, which often run back to back", () => {
    for (const workflow of ["audit", "utility"] as const) {
      const out = formatTips(tips, { workflow, star: true });
      expect(out, workflow).not.toContain("Do you like bkit?");
      expect(out.endsWith(silenceLine(["a"])), workflow).toBe(true);
      expect(formatTips([], { workflow, star: true }), workflow).toBe("");
    }
  });

  it("never counts toward the cap", () => {
    const out = formatTips(tips, { workflow: "build", star: true });
    expect(out).toContain("**Title a.**");
    expect(out).not.toContain("**Title b.**");
  });
});

describe("orderForWorkflow", () => {
  const tagged = [
    fake("comms", true, { workflows: ["design", "plan", "build", "debug", "ship"] }),
    fake("untagged", true),
    fake("ship-only", true, { workflows: ["ship"] }),
    fake("debug-only", true, { workflows: ["debug"] }),
  ];

  it("puts the workflow's own tips first, each group in catalogue order", () => {
    expect(orderForWorkflow(tagged, "debug").map((t) => t.id)).toEqual([
      "comms",
      "debug-only",
      "untagged",
      "ship-only",
    ]);
  });

  it("keeps catalogue order when the workflow has no own tips but comms", () => {
    expect(orderForWorkflow(tagged, "plan").map((t) => t.id)).toEqual([
      "comms",
      "untagged",
      "ship-only",
      "debug-only",
    ]);
  });
});

describe("Setup tips sections", () => {
  const tips = [fake("a", true, { caution: "Careful." })];

  it("render the same fields in the checklist and the markdown", () => {
    const text = setupTipsChecklistLines(tips).join("\n");
    const md = setupTipsMarkdownLines(tips).join("\n");
    for (const s of ["Title a", "(", "Line a.", "Why a.", "Careful.", "Ask a.", "Steps a."]) {
      expect(text).toContain(s);
      expect(md).toContain(s);
    }
    expect(md).toContain("## Setup tips");
    expect(md).toContain("### 1. Title a (`a`)");
  });

  it("render nothing when no tip fires", () => {
    expect(setupTipsChecklistLines([])).toEqual([]);
    expect(setupTipsMarkdownLines([])).toEqual([]);
  });
});
