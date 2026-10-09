import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { SKILLS_CLI, installedSkills, listedIn, skillsCommand } from "./skills";

const dirs: string[] = [];
let calls = "";
const savedPath = process.env.PATH;

/**
 * The skills CLI, stubbed: records each call, deletes the skill folder like the
 * real `remove` does, and exits with $STUB_EXIT (or fails for $STUB_FAIL's skill).
 */
beforeEach(() => {
  const stub = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-skills-stub-")));
  dirs.push(stub);
  calls = path.join(stub, "calls.log");
  const bin = path.join(stub, SKILLS_CLI[0]!);
  fs.writeFileSync(
    bin,
    [
      "#!/bin/sh",
      `echo "$*" >> "${calls}"`,
      '[ -n "$STUB_EXIT" ] && exit "$STUB_EXIT"',
      '[ "$3" = "$STUB_FAIL" ] && { echo "boom" >&2; exit 1; }',
      'rm -rf ".agents/skills/$3"',
      "exit 0",
      "",
    ].join("\n"),
  );
  fs.chmodSync(bin, 0o755);
  process.env.PATH = `${stub}${path.delimiter}${savedPath}`;
});
afterEach(() => {
  process.env.PATH = savedPath;
  delete process.env.STUB_EXIT;
  delete process.env.STUB_FAIL;
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const called = () =>
  fs.existsSync(calls) ? fs.readFileSync(calls, "utf-8").trim().split("\n") : [];

/** A checkout with skill folders, a lock file, and a registry listing some of them. */
function checkout(opts: {
  folders?: string[];
  lock?: string[] | string;
  registry?: string | null;
}) {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-skills-")));
  dirs.push(cwd);
  for (const s of opts.folders ?? [])
    fs.mkdirSync(path.join(cwd, ".agents/skills", s), { recursive: true });
  if (opts.lock !== undefined) {
    const body =
      typeof opts.lock === "string"
        ? opts.lock
        : JSON.stringify({ version: 1, skills: Object.fromEntries(opts.lock.map((k) => [k, {}])) });
    fs.writeFileSync(path.join(cwd, "skills-lock.json"), body);
  }
  if (opts.registry !== null) {
    fs.mkdirSync(path.join(cwd, ".agents"), { recursive: true });
    fs.writeFileSync(path.join(cwd, ".agents/skills.md"), opts.registry ?? "# Skills\n");
  }
  return cwd;
}

async function prune(cwd: string) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["skills", "prune"], [skillsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

describe("bkit skills prune", () => {
  it("uninstalls unlisted skills from the union of folders and lock keys, never bkit-*", async () => {
    const cwd = checkout({
      folders: ["bkit-build", "find-skills", "react-forms"],
      lock: ["find-skills", "stale-lock-only"],
      registry: "# Skills\n\nbkit-build\nfind-skills\n",
    });
    const r = await prune(cwd);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      removed: ["react-forms", "stale-lock-only"],
      kept: ["bkit-build", "find-skills"],
      failed: [],
    });
    expect(called()).toEqual(["skills remove react-forms -y", "skills remove stale-lock-only -y"]);
    expect(fs.existsSync(path.join(cwd, ".agents/skills/react-forms"))).toBe(false);
  });

  it("matches whole names only: a listed name inside a longer one does not keep it", async () => {
    const cwd = checkout({
      folders: ["forms", "react-forms", "forms-v2"],
      registry: "| react-forms | `forms-v2` |\n",
    });
    expect((await prune(cwd)).json.removed).toEqual(["forms"]);
  });

  it("treats regex characters in a skill name literally", async () => {
    const cwd = checkout({ folders: ["a.b"], registry: "axb\n" });
    expect((await prune(cwd)).json.removed).toEqual(["a.b"]);
  });

  it("refuses to run without .agents/skills.md rather than uninstall everything", async () => {
    const cwd = checkout({ folders: ["find-skills"], registry: null });
    const r = await prune(cwd);
    expect(r.code).toBe(2);
    expect(r.err).toContain("refusing to prune every skill");
    expect(called()).toEqual([]);
  });

  it("prunes by folders alone when skills-lock.json is unreadable, and says so", async () => {
    const cwd = checkout({ folders: ["x-skill"], lock: "{not json" });
    const r = await prune(cwd);
    expect(r.code).toBe(0);
    expect(r.json.removed).toEqual(["x-skill"]);
    expect(r.err).toContain("not valid JSON");
  });

  it("reports a skill the CLI failed to uninstall and carries on with the rest", async () => {
    const cwd = checkout({ folders: ["a-skill", "b-skill"] });
    process.env.STUB_FAIL = "a-skill";
    const r = await prune(cwd);
    expect(r.code).toBe(3);
    expect(r.json).toMatchObject({ removed: ["b-skill"], failed: ["a-skill"] });
    expect(r.err).toContain("boom");
  });

  it("stops calling a CLI that could not run (127) and lists what is left installed", async () => {
    const cwd = checkout({ folders: ["a-skill", "b-skill"] });
    process.env.STUB_EXIT = "127";
    const r = await prune(cwd);
    expect(r.code).toBe(4);
    expect(r.json).toMatchObject({ removed: [], failed: ["a-skill", "b-skill"] });
    expect(called()).toHaveLength(1);
  });

  it("runs from the checkout top even when called from a subfolder", async () => {
    const cwd = checkout({ folders: ["x-skill"] });
    spawnSync("git", ["init", "-q"], { cwd });
    fs.mkdirSync(path.join(cwd, "sub"));
    expect((await prune(path.join(cwd, "sub"))).json.removed).toEqual(["x-skill"]);
    expect(fs.existsSync(path.join(cwd, ".agents/skills/x-skill"))).toBe(false);
  });

  it("does nothing when no skills are installed", async () => {
    const r = await prune(checkout({}));
    expect(r.json).toEqual({ removed: [], kept: [], failed: [] });
  });
});

describe("helpers", () => {
  it("listedIn treats - as part of a name", () => {
    expect(listedIn("- find-skills\n", "find-skills")).toBe(true);
    expect(listedIn("find-skills-pro\n", "find-skills")).toBe(false);
    expect(listedIn("x/find-skills.md", "find-skills")).toBe(true);
  });

  it("installedSkills ignores files beside the folders", () => {
    const cwd = checkout({ folders: ["one"] });
    fs.writeFileSync(path.join(cwd, ".agents/skills/README.md"), "");
    expect(installedSkills(cwd, () => undefined)).toEqual(["one"]);
  });
});
