/**
 * tools/instructions-sources.test.ts — the copied sections of `.bkit/instructions.md`
 * equal their masters: rule text in `.agents/rules.md`, hook text in the hook engines,
 * permissions in the shipped settings, Special Behaviors and Authoring Rules in
 * `.bkit/core/.bkit/prompts.md` / `workflows.md`.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CATALOG_SOURCES,
  HOOK_SOURCES,
  catalogSection,
  checkCatalogs,
  checkHooks,
  checkPermissions,
  checkRules,
  hookMessages,
  parseRuleEntries,
  refExists,
  ruleBullets,
  syncCatalogs,
  syncRules,
  type RuleMasters,
} from "./instructions-sources";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
const STORE = read(".bkit/instructions.md");
const MASTERS: RuleMasters = {
  bkit: read(".bkit/core/.agents/rules.md"),
  project: read(".agents/rules.md"),
};
const exists = (ref: string, section?: string) => refExists(REPO_ROOT, ref, section);

const RULES_MD = [
  "<!-- bkit:start -->",
  "# Agent Rules",
  "> - `Universal Rules` apply to all agents.",
  "## bkit Rules",
  "### Universal Rules",
  "- **One:** first rule.",
  "- **Two:** second rule.",
  "<!-- bkit:end -->",
  "## Project Rules",
  "### Universal Rules",
  "- **Mine:** a project rule.",
  "## Project Settings",
  "- not a rule",
].join("\n");

const STORE_MD = [
  "# Agent Instructions",
  "## Rules",
  "### one",
  "- rule: R01 · Universal Rules",
  "- refs:",
  "  - `.agents/rules.md` § Project Rules",
  "",
  "```text",
  "**One:** first rule.",
  "```",
  "",
  "### two",
  "- rule: R02 · Universal Rules",
  "",
  "```text",
  "**Two:** second rule.",
  "```",
  "",
  "## Project Rules",
  "### mine",
  "- rule: P01 · Project Rules",
  "",
  "```text",
  "**Mine:** a project rule.",
  "```",
  "",
  "## Clauses",
].join("\n");

const FIXTURE: RuleMasters = { bkit: RULES_MD, project: RULES_MD };
const yes = () => true;

describe("rules and Project Rules", () => {
  it("ruleBullets reads the bkit block and the Project Rules section, in file order", () => {
    expect(ruleBullets(RULES_MD, "bkit")).toEqual([
      "**One:** first rule.",
      "**Two:** second rule.",
    ]);
    expect(ruleBullets(RULES_MD, "project")).toEqual(["**Mine:** a project rule."]);
  });

  it("parseRuleEntries reads id, text, retired and refs", () => {
    const [one] = parseRuleEntries(STORE_MD, "Rules");
    expect(one).toMatchObject({
      name: "one",
      id: "R01",
      text: "**One:** first rule.",
      retired: [],
      refs: [{ path: ".agents/rules.md", section: "Project Rules" }],
    });
  });

  it("the fixture passes", () => {
    expect(checkRules(STORE_MD, FIXTURE, yes)).toEqual([]);
  });

  it("rule IDs match rules.md one to one", () => {
    const deleted = { ...FIXTURE, bkit: RULES_MD.replace("- **Two:** second rule.\n", "") };
    const findings = checkRules(STORE_MD, deleted, yes);
    expect(findings.join("\n")).toMatch(/R02/);
  });

  it("a reworded rules.md bullet fails until sync retires the old text", () => {
    const reworded = { ...FIXTURE, bkit: RULES_MD.replace("second rule.", "the second rule.") };
    expect(checkRules(STORE_MD, reworded, yes).join("\n")).toMatch(/R02 `two`: text differs/);
    const synced = syncRules(STORE_MD, reworded);
    expect(checkRules(synced, reworded, yes)).toEqual([]);
    const two = parseRuleEntries(synced, "Rules")[1]!;
    expect(two.text).toBe("**Two:** the second rule.");
    expect(two.retired).toEqual(["**Two:** second rule."]);
    expect(syncRules(synced, reworded)).toBe(synced);
  });

  it("a refs section that does not exist fails", () => {
    const missing = (_ref: string, section?: string) => section !== "Project Rules";
    expect(checkRules(STORE_MD, FIXTURE, missing).join("\n")).toMatch(
      /R01 `one`: ref `.agents\/rules.md` § Project Rules does not exist/,
    );
  });

  it("refExists finds files, globs and headings in the repo", () => {
    expect(exists(".bkit/jsonl.md", "Deferral Reason")).toBe(true);
    expect(exists("docs/templates/bkit-audit-*.md")).toBe(true);
    expect(exists(".bkit/jsonl.md", "No Such Heading")).toBe(false);
    expect(exists("docs/no-such-file.md")).toBe(false);
  });

  it("the repo store matches rules.md", () => {
    expect(checkRules(STORE, MASTERS, exists)).toEqual([]);
  });
});

describe("Hook Text", () => {
  const JS = [
    "function advise(base) {",
    "  // `[bkit GateGuard] in a comment` is not a message",
    "  const re = /[\"'`]/;",
    "  return (",
    "    `[bkit GateGuard] First edit to \\`${base}\\`:\\n` +",
    '    "- Confirm one."',
    "  );",
    "}",
    "function tiers() {",
    '  return { what: "git force-push", fix: "Do not force-push." };',
    "}",
    "function ask(v) {",
    "  return `bkit Codex guardrails: confirm (${v.what}).`;",
    "}",
    "const label = `- \\`${x}\\` lines`;",
  ].join("\n");

  it("hookMessages joins concatenated literals and keeps ${…} holes", () => {
    const msgs = hookMessages(JS, "hook.js");
    expect(msgs.map((m) => [m.fn, m.text])).toEqual([
      ["advise", "[bkit GateGuard] First edit to `${base}`:\n- Confirm one."],
      ["tiers", "Do not force-push."],
      ["ask", "bkit Codex guardrails: confirm (${v.what})."],
    ]);
  });

  const STORE_HOOKS = [
    "## Hook Text",
    "### first-edit",
    "- source: `hook.js` `advise`",
    "",
    "```text",
    "[bkit GateGuard] First edit to `${base}`:",
    "- Confirm one.",
    "```",
    "",
    "### force-push",
    "- source: `hook.js` `tiers`",
    "",
    "```text",
    "Do not force-push.",
    "```",
    "",
    "### codex-ask",
    "- source: `hook.js` `ask`",
    "",
    "```text",
    "bkit Codex guardrails: confirm (${v.what}).",
    "```",
    "",
    "## Permissions",
  ].join("\n");
  const one = new Map([["hook.js", JS]]);

  it("the fixture passes", () => {
    expect(checkHooks(STORE_HOOKS, one)).toEqual([]);
  });

  it("a message without an entry and an entry no longer emitted both fail", () => {
    const changed = new Map([["hook.js", JS.replace("Do not force-push.", "Never force-push.")]]);
    const findings = checkHooks(STORE_HOOKS, changed).join("\n");
    expect(findings).toMatch(/hook\.js `tiers`: no `## Hook Text` entry for "Never force-push\."/);
    expect(findings).toMatch(/`force-push`: no longer emitted by `hook\.js` `tiers`/);
  });

  it("every hook message has an entry and every entry is still emitted", () => {
    const sources = new Map(HOOK_SOURCES.map((f) => [f, read(f)]));
    expect(checkHooks(STORE, sources)).toEqual([]);
  });
});

describe("Permissions", () => {
  const SETTINGS = { permissions: { deny: ["A", "B"], ask: ["C"], allow: [] as string[] } };
  const OPENCODE = { permission: { bash: { "*": "allow" } } };
  const STORE_PERMS = [
    "## Permissions",
    "### deny-ab",
    "- tier: deny",
    "- count: 2",
    "",
    "```text",
    "A",
    "B",
    "```",
    "",
    "### ask-c",
    "- tier: ask",
    "- count: 1",
    "",
    "```text",
    "C",
    "```",
    "",
    "### opencode-permission",
    "- tier: opencode `permission`",
    "",
    "```json",
    '{ "bash": { "*": "allow" } }',
    "```",
    "",
    "## Special Behaviors",
  ].join("\n");

  it("the fixture passes", () => {
    expect(checkPermissions(STORE_PERMS, SETTINGS, OPENCODE)).toEqual([]);
  });

  it("a pattern missing, extra, doubled or miscounted fails", () => {
    const settings = { permissions: { deny: ["A", "D"], ask: ["C"], allow: [] as string[] } };
    const doubled = STORE_PERMS.replace("C\n```", "C\nA\n```");
    const findings = checkPermissions(doubled, settings, OPENCODE).join("\n");
    expect(findings).toMatch(/deny: `D` is shipped but in no group/);
    expect(findings).toMatch(/deny: `B` is in `deny-ab` but not shipped/);
    expect(findings).toMatch(/`A` is in 2 groups/);
    expect(findings).toMatch(/`ask-c`: count 1, holds 2/);
  });

  it("an opencode permission block that differs fails", () => {
    const findings = checkPermissions(STORE_PERMS, SETTINGS, { permission: { bash: {} } });
    expect(findings.join("\n")).toMatch(/opencode-permission/);
  });

  it("shipped permission patterns and store groups match exactly", () => {
    const settings = JSON.parse(read(".bkit/shared/.claude/settings.json"));
    const opencode = JSON.parse(read(".bkit/shared/.opencode/opencode.json"));
    expect(checkPermissions(STORE, settings, opencode)).toEqual([]);
  });
});

describe("Special Behaviors and Authoring Rules", () => {
  const PROMPTS = [
    "# Prompts",
    "## Authoring",
    "",
    "- **One:** first.",
    "",
    "### Notation",
    "",
    "```text",
    "# not a heading",
    "```",
    "",
    "## Special Behaviors",
    "",
    "| Behavior | Agents | Notes |",
    "| --- | --- | --- |",
    "| **Guard** | `a`, `b` | Notes with `x|y` inside. |",
    "",
    "## Next",
  ].join("\n");
  const CATALOGS = new Map([[".bkit/core/.bkit/prompts.md", PROMPTS]]);
  const STORE_CAT = [
    "## Special Behaviors",
    "",
    "### guard",
    "",
    "- behavior: **Guard**",
    "- agents: `a`, `b`",
    "- source: `.bkit/core/.bkit/prompts.md` § Special Behaviors",
    "",
    "```text",
    "Notes with `x|y` inside.",
    "```",
    "",
    "## Authoring Rules",
    "",
    "### authoring",
    "",
    "- source: `.bkit/core/.bkit/prompts.md` § Authoring",
    "",
    "````text",
    "- **One:** first.",
    "",
    "### Notation",
    "",
    "```text",
    "# not a heading",
    "```",
    "````",
    "",
    "## Template Instructions",
  ].join("\n");

  it("catalogSection runs to the next heading of the same or a higher level, fences skipped", () => {
    expect(catalogSection(PROMPTS, "Authoring")).toBe(
      ["- **One:** first.", "", "### Notation", "", "```text", "# not a heading", "```"].join("\n"),
    );
    expect(catalogSection(PROMPTS, "Notation")).toBe(
      ["```text", "# not a heading", "```"].join("\n"),
    );
  });

  it("the fixture passes", () => {
    expect(checkCatalogs(STORE_CAT, CATALOGS)).toEqual([]);
  });

  it("an edited row or section fails until sync copies it", () => {
    const edited = PROMPTS.replace("Notes with", "Notes now with").replace("first.", "the first.");
    const cats = new Map([[".bkit/core/.bkit/prompts.md", edited]]);
    const findings = checkCatalogs(STORE_CAT, cats).join("\n");
    expect(findings).toMatch(/`guard`: notes differ/);
    expect(findings).toMatch(/`authoring`: text differs/);
    const synced = syncCatalogs(STORE_CAT, cats);
    expect(checkCatalogs(synced, cats)).toEqual([]);
    expect(syncCatalogs(synced, cats)).toBe(synced);
  });

  it("a row with no entry fails", () => {
    const added = PROMPTS.replace("\n\n## Next", "\n| **New** | `c` | More. |\n\n## Next");
    const cats = new Map([[".bkit/core/.bkit/prompts.md", added]]);
    expect(checkCatalogs(STORE_CAT, cats).join("\n")).toMatch(
      /\*\*New\*\*: no `## Special Behaviors` entry/,
    );
  });

  it("each Special Behaviors row and authoring section has one equal entry", () => {
    const cats = new Map(CATALOG_SOURCES.map((f) => [f, read(f)]));
    expect(checkCatalogs(STORE, cats)).toEqual([]);
  });
});
