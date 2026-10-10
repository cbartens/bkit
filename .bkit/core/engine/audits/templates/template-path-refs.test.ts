// audits/templates/template-path-refs.test.ts — no workflow or prompt names a template file.
//
// Templates are the consumer's once installed: they rename, delete or rewrite
// them (a CI workflow, a hook, a lint config, a helper script). A workflow step
// that reads or runs one by path breaks the day the consumer does, so the
// mechanics a workflow needs live in `bkit <noun> <verb>` commands instead, and
// settings come from `package.json` `bkit`. The forbidden names come from every
// file in the templates folder, so a new template is covered without editing this
// test. Names a written payload file also carries (settings.json, hooks.json) stay
// ordinary prose.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { listFilesRecursive, remapTemplateDest } from "../../install/template-copies";
import { getCoreRoot, getSharedRoot, getTemplatesRoot } from "../../shared/package-roots";

const repo = path.resolve(__dirname, "../../../../..");

const listDir = (dir: string) => (fs.existsSync(dir) ? fs.readdirSync(dir) : []);

/** Every file the templates folder ships, at its consumer path, `/`-separated. */
function shippedPaths(): string[] {
  const root = getTemplatesRoot();
  return listFilesRecursive(root).map((abs) =>
    remapTemplateDest(path.relative(root, abs)).split(path.sep).join("/"),
  );
}

/** Package-only subtrees under `core/` that never land in a consumer repo. */
const CORE_PACKAGE_ONLY = new Set(["engine", "workflows", "prompts", ".bkit", "hooks"]);

/** Every payload file install can write, at its consumer path, `/`-separated. */
function payloadPaths(): string[] {
  const out: string[] = [];
  for (const [root, skipTop] of [
    [getSharedRoot(), new Set<string>()],
    [getCoreRoot(), CORE_PACKAGE_ONLY],
  ] as const) {
    if (!fs.existsSync(root)) continue;
    for (const abs of listFilesRecursive(root)) {
      const rel = path.relative(root, abs);
      const top = rel.split(path.sep)[0]!;
      if (rel.split(path.sep).length > 1 && skipTop.has(top)) continue;
      if (path.basename(rel) === "LICENSE.md") continue;
      out.push(remapTemplateDest(rel).split(path.sep).join("/"));
    }
  }
  return out;
}

/**
 * Literal strings that name a template path:
 * - every template's full path (`.github/workflows/bkit-ci.yml`, `docs/capabilities.md`);
 * - every top-level folder holding only templates, with its slash (`.husky/`, `scripts/`);
 * - every template file name with an extension that no owned file shares (`bkit-ci.yml`);
 *   a bare word like `pre-commit` is ordinary prose, and `settings.json` is also an owned file.
 */
function forbiddenNames(): string[] {
  const templates = shippedPaths();
  const owned = payloadPaths();
  const topFolders = [
    ...new Set(templates.filter((rel) => rel.includes("/")).map((rel) => rel.split("/")[0]!)),
  ].filter((top) => !owned.some((rel) => rel.startsWith(`${top}/`)));
  const ownedNames = new Set(owned.map((rel) => path.posix.basename(rel)));
  const fileNames = templates
    .map((rel) => path.posix.basename(rel))
    .filter((name) => name.slice(1).includes(".") && !ownedNames.has(name));
  return [...new Set([...templates, ...topFolders.map((top) => `${top}/`), ...fileNames])];
}

/**
 * Lines allowed to name a template path, per file. Each needs a reason, and stays narrow:
 * `text` is an excerpt of the line, and it clears only the template names inside `text`.
 */
const ALLOWED: Array<{ file: string; text: string; why: string }> = [
  {
    file: ".bkit/core/prompts/bkit-design-review-1.md",
    text: "`docs/capabilities.md` when present",
    why: "an optional read: the prior-art search uses the capability map only when the consumer adopted the graphify template, and treats an empty result as inconclusive",
  },
];

function corpus(): Array<{ file: string; text: string }> {
  const dirs = [
    path.join(repo, ".bkit", "core", "workflows"),
    path.join(repo, ".bkit", "core", "prompts"),
  ];
  const files = dirs.flatMap((d) =>
    listDir(d)
      .filter((f) => f.endsWith(".md"))
      .map((f) => path.join(d, f)),
  );
  files.push(path.join(repo, ".bkit", "wording.md"));
  return files.map((f) => ({ file: path.relative(repo, f), text: fs.readFileSync(f, "utf-8") }));
}

describe("no workflow or prompt names a template path", () => {
  it("derives the forbidden list from every template file", () => {
    const names = forbiddenNames();
    const templates = shippedPaths();
    expect(templates.length).toBeGreaterThan(0);
    for (const rel of templates) expect(names, rel).toContain(rel);
    for (const rel of [
      ".prettierignore",
      ".cursor/Dockerfile",
      ".serena/project.yml",
      ".graphifyignore",
      "docs/capabilities.md",
      ".github/renovate.json5",
      ".github/dependabot.yml",
      "context/bkit-vercel.md",
      "scripts/slop/bkit-slop-type-suppression.mjs",
    ]) {
      expect(names, rel).toContain(rel);
    }
    expect(names).toContain("bkit-ci.yml");
    expect(names).toContain("bkit-renovate.yml");
    expect(names).toContain(".husky/");
    expect(names).toContain("scripts/");
    expect(names).not.toContain("settings.json");
    expect(names).not.toContain("pre-commit");
  });

  it("every allowance still matches a line in its file", () => {
    for (const { file, text } of ALLOWED) {
      expect(fs.readFileSync(path.join(repo, file), "utf-8"), file).toContain(text);
    }
  });

  it("reads every workflow and prompt", () => {
    const files = corpus().map((c) => c.file);
    expect(
      files.filter((f) => f.startsWith(path.join(".bkit", "core", "workflows"))).length,
    ).toBeGreaterThanOrEqual(6);
    expect(
      files.filter((f) => f.startsWith(path.join(".bkit", "core", "prompts"))).length,
    ).toBeGreaterThan(10);
  });

  it.each(corpus())("$file names no template path", ({ file, text }) => {
    const allowed = ALLOWED.filter((a) => a.file === file).map((a) => a.text);
    const hits = forbiddenNames().flatMap((name) =>
      text
        .split("\n")
        .map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => line.includes(name))
        .filter(({ line }) => !allowed.some((a) => a.includes(name) && line.includes(a)))
        .map(({ line, n }) => `${n}: ${name} — ${line.trim().slice(0, 120)}`),
    );
    expect(hits).toEqual([]);
  });
});
