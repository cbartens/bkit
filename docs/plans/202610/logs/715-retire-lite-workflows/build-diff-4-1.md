diff --git a/.bkit/core/.agents/docs.md b/.bkit/core/.agents/docs.md
index 1fea73d94..b81547b8a 100644
--- a/.bkit/core/.agents/docs.md
+++ b/.bkit/core/.agents/docs.md
@@ -28,7 +28,6 @@
 | `.bkit/workflows.md` | ● | ● | ● | ● | ● | Workflow catalog — when to run and when not to run each command (§ When to Run). |
 | `.bkit/prompts.md` | ● | ● | ● | ● | ● | Subagent catalog — name, scope, effort, model, `maxTurns`. |
 | `.bkit/router.md` | — | — | — | — | — | `bkit-{command}` workflow router — picks the workflow and each host's command file. |
-| `.bkit/lite.md` | ○ | ○ | ○ | ○ | ○ | Lite workflows (`<phase>:lite`) — copy-paste prompts for small, understood changes. |
 | `.agents/skills.md` | — | — | ● | — | — | Registry of installed agent skills and install / update commands. |
 | `.agents/context.md` | ○ | ○ | ○ | ● | ○ | How to reach information outside repo — deployment logs, CI runs, e2e evidence, web search, cloud egress allowlist, CLI provisioning. |
 | `docs/architecture.md` | ● | ● | ● | ○ | ○ | System design — service boundaries, deployment topology, integration sketch. |
diff --git a/.bkit/core/.bkit/README.md b/.bkit/core/.bkit/README.md
index a36fcdd38..ae6b991d1 100644
--- a/.bkit/core/.bkit/README.md
+++ b/.bkit/core/.bkit/README.md
@@ -241,7 +241,7 @@ bkit owns some files outright, owns one part of others, and ships the rest as te
 <!-- prettier-ignore -->
 | Kind | Semantics | Files |
 | --- | --- | --- |
-| **Tier 1 — Fully managed** | Idempotent rewrite of whole file on every install. A consumer edit is overwritten. Uninstall deletes the file while it still matches the hash bkit recorded. | `.cursor/hooks.json`, `.bkit/*.md` (except `prompts.md` and `lite.md`, Tier 2), `.bkit/.env.example`, `.bkit/allowlist.json`, `.cursor/cli.json` |
+| **Tier 1 — Fully managed** | Idempotent rewrite of whole file on every install. A consumer edit is overwritten. Uninstall deletes the file while it still matches the hash bkit recorded. | `.cursor/hooks.json`, `.bkit/*.md` (except `prompts.md`, Tier 2), `.bkit/.env.example`, `.bkit/allowlist.json`, `.cursor/cli.json` |
 | **Tier 2 — Managed-block** | bkit owns content between `bkit:start`/`bkit:end` markers. Consumer owns everything outside. File absent → write whole file. File present without markers → append block at EOF, unless the markdown file already holds an older unmarked copy of the block (its `# ` title plus 10+ long lines verbatim) → warn + skip. A full uninstall strips the block and deletes a file left with nothing else; `docs/templates/bkit-*.md` are bkit's whole and are deleted. | `docs/*.md`, `docs/templates/bkit-*.md`, `.gitignore`, `.agents/rules.md`, `.agents/context.md`, `.agents/docs.md`, `.agents/skills.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/hooks/bkit-preflight.sh`, `.cursor/hooks/bkit-preflight.sh`, `.claude/hooks/bkit-gateguard.cjs`, `.cursor/hooks/bkit-gateguard.cjs`, `.opencode/plugin/bkit-gateguard.js`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-gateguard.cjs`, `.codex/hooks/bkit-guardrails.cjs` |
 | **Shared JSON** | bkit owns the keys its template sets; every other key is yours. `.mcp.json` / `.cursor/mcp.json`: bkit owns exactly one entry, `mcpServers.<tracker>`, and resets it to the template on every install and upgrade. | `.claude/settings.json`, `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` |
 | **Seeded package.json scripts** | Every install and upgrade adds a missing name with bkit's default; a name already present is never touched, whatever its value. `bkit check` reports a missing name. Uninstall leaves them. | `scripts.bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` / `bkit:deps:outdated` / `bkit:deps:audit` |
@@ -276,7 +276,7 @@ Comment prefixes (`# `, `// `) before markers preserved on block updates.
 | `.gitattributes` | core | `.bkit/shared/.gitattributes` | Tier 2 html-comment (`merge=union` for the append-only ledgers) |
 | `.bkit/templates/**` | — | the whole `.bkit/templates/` root | Raw copies, refreshed on every install and upgrade; never hashed. Upgrade prints the changed paths. |
 | `.bkit/{core,shared}` | core | symlink into `node_modules/@cbartens/bkit/.bkit/{core,shared}` | View link, not a copy — browse the payload in-repo; always the installed version. Gitignored (dangles on a fresh clone / CI; install recreates). A real directory is never clobbered; `bkit uninstall` removes the link. |
-| `.bkit/{authoring,cloud,comparison,install,jsonl,LICENSE,lite,pipeline,providers,prompts,router,trackers,workflows,README}.md` | core | `.bkit/core/.bkit/` | Tier 1 (canonical-overwrite); `prompts.md` and `lite.md` Tier 2 html-comment. The reference docs agents read at runtime (`router.md`: the workflow router `AGENTS.md` sends `bkit-{command}` prompts to), plus `LICENSE.md`: the MIT text and copyright notice that travel with every file bkit writes. |
+| `.bkit/{authoring,cloud,comparison,install,jsonl,LICENSE,pipeline,providers,prompts,router,trackers,workflows,README}.md` | core | `.bkit/core/.bkit/` | Tier 1 (canonical-overwrite); `prompts.md` Tier 2 html-comment. The reference docs agents read at runtime (`router.md`: the workflow router `AGENTS.md` sends `bkit-{command}` prompts to), plus `LICENSE.md`: the MIT text and copyright notice that travel with every file bkit writes. |
 | `.claude/commands/bkit-*.md` | claude | `.bkit/core/workflows/` (byte-identical) | Host pass — always overwrite |
 | `.claude/agents/bkit-*.md` | claude | `.bkit/core/prompts/` (byte-identical) | Host pass — always overwrite |
 | `.claude/settings.json` | claude | `.bkit/shared/.claude/settings.json` | Tier 2 JSON deep-containment. Permission allow/deny/ask + SessionStart / PreToolUse hook wiring. |
diff --git a/.bkit/core/engine/commands/install/uninstall.test.ts b/.bkit/core/engine/commands/install/uninstall.test.ts
index b6520bdb0..c56ab917e 100644
--- a/.bkit/core/engine/commands/install/uninstall.test.ts
+++ b/.bkit/core/engine/commands/install/uninstall.test.ts
@@ -211,6 +211,20 @@ describe("buildDecisionTable — markered-text format", () => {
     }
   });
 
+  it("strips a managed lite.md block and keeps the consumer section", async () => {
+    const consumer = "## Our lite notes\n\nkeep me\n";
+    writeFile(
+      ".bkit/lite.md",
+      `<!-- bkit:start -->\n\nretired lite payload\n\n<!-- bkit:end -->\n${consumer}`,
+    );
+    const table = buildDecisionTable(["core"], makeCtx());
+    await runUninstall(["core"], makeCtx());
+    expect(table.find((r) => r.file === ".bkit/lite.md")?.decision).toBe("strip-block");
+    const after = readFile(".bkit/lite.md");
+    expect(after).not.toContain("retired lite payload");
+    expect(after).toBe(consumer);
+  });
+
   describe("docs/", () => {
     const marker = "<!-- bkit:managed v4.0.0 — do not edit; run `bkit upgrade` to refresh -->";
     const block = `<!-- bkit:start -->\n\n${marker}\n\n# Testing\n\nbkit doctrine\n\n<!-- bkit:end -->\n`;
diff --git a/.bkit/core/engine/commands/install/uninstall.ts b/.bkit/core/engine/commands/install/uninstall.ts
index ea8170f4e..b838c0e92 100644
--- a/.bkit/core/engine/commands/install/uninstall.ts
+++ b/.bkit/core/engine/commands/install/uninstall.ts
@@ -379,8 +379,10 @@ const CORE_TEMPLATE_DOCTRINE: ManifestEntry[] = [
   { path: ".agents/docs.md", format: "markered-text", module: "core" },
   { path: ".agents/rules.md", format: "markered-text", module: "core" },
   { path: ".agents/skills.md", format: "markered-text", module: "core" },
-  // Retired path of `.bkit/lite.md` (5.1.0 – 5.2.4), for an install never upgraded since.
+  // Retired `.agents/shortcuts.md` (5.1.0 – 5.2.4), for an install never upgraded since.
   { path: ".agents/shortcuts.md", format: "markered-text", module: "core" },
+  // Retired `.bkit/lite.md` (5.2.5 – 6.0.0), for an install never upgraded since.
+  { path: ".bkit/lite.md", format: "markered-text", module: "core" },
 ];
 
 /**
diff --git a/dist/commands/install/uninstall.js b/dist/commands/install/uninstall.js
index 9e7759765..5540ca2dd 100644
--- a/dist/commands/install/uninstall.js
+++ b/dist/commands/install/uninstall.js
@@ -258,8 +258,10 @@ const CORE_TEMPLATE_DOCTRINE = [
     { path: ".agents/docs.md", format: "markered-text", module: "core" },
     { path: ".agents/rules.md", format: "markered-text", module: "core" },
     { path: ".agents/skills.md", format: "markered-text", module: "core" },
-    // Retired path of `.bkit/lite.md` (5.1.0 – 5.2.4), for an install never upgraded since.
+    // Retired `.agents/shortcuts.md` (5.1.0 – 5.2.4), for an install never upgraded since.
     { path: ".agents/shortcuts.md", format: "markered-text", module: "core" },
+    // Retired `.bkit/lite.md` (5.2.5 – 6.0.0), for an install never upgraded since.
+    { path: ".bkit/lite.md", format: "markered-text", module: "core" },
 ];
 /**
  * The top-level `docs/*.md` the core payload pass installs: each carries bkit's managed
