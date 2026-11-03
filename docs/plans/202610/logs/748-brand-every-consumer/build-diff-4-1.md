diff --git a/.bkit/README.md b/.bkit/README.md
index 5bd7537a2..d1c7e7ad2 100644
--- a/.bkit/README.md
+++ b/.bkit/README.md
@@ -227,7 +227,7 @@ bkit owns some files outright, owns one part of others, and ships the rest as te
 | **Shared JSON** | bkit owns the keys its template sets; every other key is yours. `.mcp.json` / `.cursor/mcp.json`: bkit owns exactly one entry, `mcpServers.<tracker>`, and resets it to the template on every install and upgrade. | `.claude/settings.json`, `.cursor/hooks.json`, `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` |
 | **Seeded package.json scripts** | Every install and upgrade adds a missing name with bkit's default; a name already present is never touched, whatever its value. `bkit check` reports a missing name. Uninstall leaves them. | `scripts.bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` / `bkit:deps:outdated` / `bkit:deps:audit` |
 | **Seeded bkit settings** | Every install and upgrade writes every `bkit` setting, so each one is visible where you look for it. A missing key gets its default; a choice not made yet (tracker, cloud agents, board, opencode provider) gets `""` or `[]`, which reads the same as absent. A key already present is never touched, whatever its value; nested blocks get their missing keys. `bkit check` reports a missing key. | every key under `bkit`: `SEEDED_BKIT_DEFAULTS` in `.bkit/core/engine/install/modules/core.ts` |
-| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/House/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.oxlintrc.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `lint:prose`, `lint:slop`, `slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |
+| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/Bkit/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.oxlintrc.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `lint:prose`, `lint:slop`, `slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |
 
 **Marker syntax** depends on the file format:
 
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index da4c95dc6..ce5139cbb 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -381,7 +381,7 @@ describe("issue #129 §5 — upgrade does not force-create opt-in module files",
     fs.writeFileSync(path.join(tmpDir, ".github", "renovate.json5"), owned, "utf-8");
     fs.writeFileSync(
       path.join(tmpDir, ".github", "workflows", "bkit-renovate.yml"),
-      "name: Renovate\n",
+      "name: Renovate (ours)\n",
       "utf-8",
     );
 
@@ -390,7 +390,7 @@ describe("issue #129 §5 — upgrade does not force-create opt-in module files",
     expect(fs.readFileSync(path.join(tmpDir, ".github", "renovate.json5"), "utf-8")).toBe(owned);
     expect(
       fs.readFileSync(path.join(tmpDir, ".github", "workflows", "bkit-renovate.yml"), "utf-8"),
-    ).toBe("name: Renovate\n");
+    ).toBe("name: Renovate (ours)\n");
   });
 
   it("preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6)", () => {
@@ -1153,6 +1153,102 @@ describe("#255 — upgrade does not force-create uninstalled host/tooling module
     expect(second.status, combinedOutput(second)).toBe(0);
     expect(snapshotTree()).toEqual(afterFirst);
   });
+
+  /** The shipped pre-#748 content of a template file, read from the v6.0.0 release tag. */
+  function shippedAtV6(templateRel: string): string {
+    const env = { ...process.env };
+    delete env.GIT_DIR;
+    delete env.GIT_WORK_TREE;
+    const r = spawnSync("git", ["show", `v6.0.0:.bkit/templates/${templateRel}`], {
+      cwd: originalCwd,
+      encoding: "utf-8",
+      env,
+    });
+    expect(r.status, r.stderr).toBe(0);
+    return r.stdout;
+  }
+  const WF_FILES = ["bkit-cloud.yml", "bkit-renovate.yml", "bkit-trivy.yml"];
+  function seedOldCheckNames(): void {
+    seedOldShapeConsumer();
+    for (const f of WF_FILES) {
+      fs.writeFileSync(
+        path.join(tmpDir, ".github", "workflows", f),
+        shippedAtV6(`.github/workflows/${f}`),
+        "utf-8",
+      );
+    }
+  }
+
+  it("a second check-name migration writes nothing", () => {
+    seedOldCheckNames();
+    const upgrade = runCli(["upgrade", "--auto-apply"]);
+    expect(upgrade.status, combinedOutput(upgrade)).toBe(0);
+    const trivy = fs.readFileSync(
+      path.join(tmpDir, ".github", "workflows", "bkit-trivy.yml"),
+      "utf-8",
+    );
+    expect(trivy).toMatch(/^name: bkit-trivy$/m);
+    expect(trivy).toMatch(/^ {2}trivy:\n {4}name: bkit-trivy\n/m);
+    const renovate = fs.readFileSync(
+      path.join(tmpDir, ".github", "workflows", "bkit-renovate.yml"),
+      "utf-8",
+    );
+    expect(renovate).toMatch(/^name: bkit-renovate$/m);
+    const hashes = Object.keys(
+      readBkitVersion(path.join(tmpDir, ".bkit", "version"))!.canonicalHashes,
+    );
+    expect(hashes.filter((h) => WF_FILES.some((f) => h.endsWith(f)))).toEqual([]);
+
+    const afterFirst = snapshotTree();
+    const second = runCli(["upgrade", "--auto-apply"]);
+    expect(second.status, combinedOutput(second)).toBe(0);
+    expect(snapshotTree()).toEqual(afterFirst);
+    expect(combinedOutput(second)).not.toContain("Trivy / trivy");
+  });
+
+  it("a dry-run check-name migration writes and moves nothing", () => {
+    seedOldCheckNames();
+    const before = snapshotTree();
+    const dry = runCli(["upgrade", "--dry-run"]);
+    expect(dry.status, combinedOutput(dry)).toBe(0);
+    expect(snapshotTree()).toEqual(before);
+    const trivy = fs.readFileSync(
+      path.join(tmpDir, ".github", "workflows", "bkit-trivy.yml"),
+      "utf-8",
+    );
+    expect(trivy).toMatch(/^name: Trivy$/m);
+    expect(combinedOutput(dry)).toContain("bkit-trivy.yml");
+  });
+
+  it("a second Vale migration and a dry run write nothing", () => {
+    seedOldShapeConsumer();
+    const house = path.join(tmpDir, ".vale", "styles", "House");
+    fs.mkdirSync(house, { recursive: true });
+    for (const r of ["Filler", "Hedging", "LLMSlop", "Verbose"]) {
+      fs.writeFileSync(
+        path.join(house, `${r}.yml`),
+        shippedAtV6(`.vale/styles/House/${r}.yml`),
+        "utf-8",
+      );
+    }
+    fs.writeFileSync(path.join(tmpDir, ".vale.ini"), shippedAtV6(".vale.ini"), "utf-8");
+
+    const before = snapshotTree();
+    const dry = runCli(["upgrade", "--dry-run"]);
+    expect(dry.status, combinedOutput(dry)).toBe(0);
+    expect(snapshotTree()).toEqual(before);
+
+    const upgrade = runCli(["upgrade", "--auto-apply"]);
+    expect(upgrade.status, combinedOutput(upgrade)).toBe(0);
+    expect(fs.existsSync(path.join(tmpDir, ".vale", "styles", "Bkit", "Filler.yml"))).toBe(true);
+    expect(fs.existsSync(path.join(house, "Filler.yml"))).toBe(false);
+    expect(fs.readFileSync(path.join(tmpDir, ".vale.ini"), "utf-8")).toContain("Bkit.Filler = NO");
+
+    const afterFirst = snapshotTree();
+    const second = runCli(["upgrade", "--auto-apply"]);
+    expect(second.status, combinedOutput(second)).toBe(0);
+    expect(snapshotTree()).toEqual(afterFirst);
+  });
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/install/modules/cloud.ts b/.bkit/core/engine/install/modules/cloud.ts
index e68227f22..12cb82805 100644
--- a/.bkit/core/engine/install/modules/cloud.ts
+++ b/.bkit/core/engine/install/modules/cloud.ts
@@ -54,7 +54,7 @@ function setConsumerBkitField(field: string, value: string, dryRun: boolean): vo
 // The cloud workflow is a template (`.bkit/templates.md`). Shared first step of the
 // claude and opencode setup advisories.
 const CLOUD_WORKFLOW_ADOPT_STEP =
-  "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
+  "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
 
 // ---------------------------------------------------------------------------
 // runCloudModule — opt-in cloud-agent integration
@@ -110,7 +110,7 @@ export function runCloudModule(ctx: ModuleContext): void {
         "Cloud env config splits across the repo (`.claude/hooks/bkit-cloud-bootstrap.sh`, a copy-and-own template you adopt) and the Claude app dashboard (setup script + env vars + auth tokens, manual).",
       action:
         "Two locations to touch — full recipe in bkit's `cloud.md`.\n\n" +
-        "IN REPO (copy-and-own; bkit never writes it):\n" +
+        "IN REPO (copy-and-own; bkit never writes it, apart from brand migrations that rewrite exact shipped old names):\n" +
         "  - Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh` and edit it freely — the baseline runs `pnpm install` / `vale sync` and the gh login on each cloud session; add your own repo-specific steps (Supabase start, turbo prebuild, etc. — examples inlined). The `.claude/settings.json` SessionStart entry runs it only when present (`test -f … || true`).\n\n" +
         "IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):\n" +
         "  - Name: the repo name (e.g. `acme-web`) — one environment per repo, since secrets are per-repo.\n" +
@@ -163,7 +163,7 @@ export function runCloudModule(ctx: ModuleContext): void {
         "  - Allowed concurrency: latest-supersedes.\n" +
         "  - Set `BKIT_LINEAR_API_KEY` as a **Runtime Secret** in the Cloud Agents dashboard (https://cursor.com/dashboard/cloud-agents) → your environment → Secrets tab.\n" +
         "  - Label the issue `bkit:auto` in Linear before pushing the build commit.\n\n" +
-        "IN REPO (copy each template and own it; bkit never writes or overwrites these files — see `.bkit/templates.md`):\n" +
+        "IN REPO (copy each template and own it; bkit never writes or overwrites these files, apart from brand migrations that rewrite exact shipped old names — see `.bkit/templates.md`):\n" +
         "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: change Node major if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps.\n" +
         "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: set `install` / `start` / `terminals[]` / `env` for your stack.",
     });
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 875d3395f..f0b1db293 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -1841,3 +1841,233 @@ describe("migrateBrandedTemplateFiles (via runBkitDocs)", () => {
     expect(out).toContain("check-dependency-audit");
   });
 });
+
+/** The shipped pre-#748 content of a template file, read from the v6.0.0 release tag. */
+function shippedAtV6(templateRel: string): string {
+  const env = { ...process.env };
+  delete env.GIT_DIR;
+  delete env.GIT_WORK_TREE;
+  const r = spawnSync("git", ["show", `v6.0.0:.bkit/templates/${templateRel}`], {
+    cwd: originalCwd,
+    encoding: "utf-8",
+    env,
+  });
+  expect(r.status, r.stderr).toBe(0);
+  return r.stdout;
+}
+
+describe("migrateBrandedCheckNames (via runBkitDocs)", () => {
+  const WF = path.join(".github", "workflows");
+  const put = (file: string, text: string): void => {
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.writeFileSync(file, text, "utf-8");
+  };
+  const run = (dryRun = false): ModuleContext => {
+    const ctx = makeCtx({ dryRun });
+    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
+    return ctx;
+  };
+  const captured: string[] = [];
+  const out = (): string => captured.join("\n");
+
+  beforeEach(() => {
+    captured.length = 0;
+    vi.spyOn(console, "log").mockImplementation((m: unknown) => {
+      captured.push(String(m));
+    });
+    vi.spyOn(console, "warn").mockImplementation((m: unknown) => {
+      captured.push(String(m));
+    });
+  });
+  afterEach(() => {
+    vi.restoreAllMocks();
+  });
+
+  it("rewrites shipped old workflow names and leaves customised ones", () => {
+    put(path.join(WF, "bkit-cloud.yml"), shippedAtV6(".github/workflows/bkit-cloud.yml"));
+    put(path.join(WF, "bkit-trivy.yml"), shippedAtV6(".github/workflows/bkit-trivy.yml"));
+    const custom = shippedAtV6(".github/workflows/bkit-renovate.yml").replace(
+      "name: Renovate\n",
+      "name: Renovate (ours)\n",
+    );
+    expect(custom).toContain("name: Renovate (ours)\n");
+    put(path.join(WF, "bkit-renovate.yml"), custom);
+    run();
+
+    const cloud = fs.readFileSync(path.join(WF, "bkit-cloud.yml"), "utf-8");
+    expect(cloud).toContain("name: bkit-cloud-context (${{ github.event_name }})");
+    expect(cloud).toContain("name: bkit-cloud-claude (${{ github.event_name }})");
+    expect(cloud).toContain("name: bkit-cloud-opencode (${{ github.event_name }})");
+    expect(cloud).not.toMatch(/^ {4}name: (context|claude|opencode) \(/m);
+    const trivy = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
+    expect(trivy).toMatch(/^name: bkit-trivy$/m);
+    expect(trivy).toMatch(/^ {2}trivy:\n {4}name: bkit-trivy\n/m);
+    expect(trivy).not.toMatch(/^name: Trivy$/m);
+    const renovate = fs.readFileSync(path.join(WF, "bkit-renovate.yml"), "utf-8");
+    expect(renovate).toContain("name: Renovate (ours)\n");
+    expect(renovate).not.toMatch(/^name: bkit-renovate$/m);
+  });
+
+  it("logs each renamed check name with the branch-protection fix", () => {
+    put(path.join(WF, "bkit-trivy.yml"), shippedAtV6(".github/workflows/bkit-trivy.yml"));
+    put(path.join(WF, "bkit-renovate.yml"), shippedAtV6(".github/workflows/bkit-renovate.yml"));
+    run();
+    const text = out();
+    expect(text).toContain("Trivy / trivy");
+    expect(text).toContain("bkit-trivy / bkit-trivy");
+    expect(text).toContain("Renovate / renovate");
+    expect(text).toContain("bkit-renovate / bkit-renovate");
+    expect(text).toMatch(/branch[- ]protection/i);
+  });
+
+  it("inserts no job name when the renovate or trivy job already has one", () => {
+    const named = (file: string, job: string): string =>
+      shippedAtV6(`.github/workflows/${file}`).replace(
+        `\n  ${job}:\n`,
+        `\n  ${job}:\n    name: our ${job}\n`,
+      );
+    put(path.join(WF, "bkit-renovate.yml"), named("bkit-renovate.yml", "renovate"));
+    put(path.join(WF, "bkit-trivy.yml"), named("bkit-trivy.yml", "trivy"));
+    put(path.join(WF, "bkit-cloud.yml"), shippedAtV6(".github/workflows/bkit-cloud.yml"));
+    run();
+    expect(fs.readFileSync(path.join(WF, "bkit-cloud.yml"), "utf-8")).toContain(
+      "name: bkit-cloud-context (",
+    );
+    const renovate = fs.readFileSync(path.join(WF, "bkit-renovate.yml"), "utf-8");
+    const trivy = fs.readFileSync(path.join(WF, "bkit-trivy.yml"), "utf-8");
+    expect(renovate).toContain("  renovate:\n    name: our renovate\n");
+    expect(trivy).toContain("  trivy:\n    name: our trivy\n");
+    expect(renovate.match(/^ {4}name:/gm)).toHaveLength(1);
+    expect(trivy.match(/^ {4}name:/gm)).toHaveLength(1);
+  });
+
+  it("rewrites the old health stub in a custom bkit.testing.ciWorkflow file", () => {
+    fs.writeFileSync(
+      "package.json",
+      JSON.stringify({ name: "x", bkit: { testing: { ciWorkflow: "ci.yml" } } }, null, 2) + "\n",
+      "utf-8",
+    );
+    const ciOld = shippedAtV6(".github/workflows/bkit-ci.yml");
+    const start = ciOld.indexOf("# bkit-stub:health");
+    const endMarker = "# DROP if you have no deployed health URL.";
+    const end = ciOld.indexOf(endMarker) + endMarker.length;
+    expect(start).toBeGreaterThan(-1);
+    const oldBlock = ciOld.slice(start, end);
+    const wrap = (block: string): string =>
+      `name: CI\njobs:\n  a:\n    steps:\n      - run: true\n# === JOB 6 ===\n${block}\n# tail\n`;
+
+    const edited = oldBlock.replace("Not a required check.", "Not a required check (ours).");
+    expect(edited).not.toBe(oldBlock);
+    put(path.join(WF, "ci.yml"), wrap(edited));
+    run();
+    expect(fs.readFileSync(path.join(WF, "ci.yml"), "utf-8")).toBe(wrap(edited));
+
+    put(path.join(WF, "ci.yml"), wrap(oldBlock));
+    run();
+    const after = fs.readFileSync(path.join(WF, "ci.yml"), "utf-8");
+    expect(after).toContain(".bkit/templates/.github/workflows/bkit-health.yml");
+    expect(after).not.toContain("copy into .github/workflows/health.yml");
+    expect(after).toContain("# tail\n");
+    expect(fs.existsSync(path.join(WF, "bkit-ci.yml"))).toBe(false);
+  });
+});
+
+describe("migrateValeHouseStyle (via runBkitDocs)", () => {
+  const RULES = ["Filler", "Hedging", "LLMSlop", "Verbose"] as const;
+  const HOUSE = path.join(".vale", "styles", "House");
+  const BKIT = path.join(".vale", "styles", "Bkit");
+  const put = (file: string, text: string): void => {
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.writeFileSync(file, text, "utf-8");
+  };
+  const oldRule = (r: string): string => shippedAtV6(`.vale/styles/House/${r}.yml`);
+  const run = (dryRun = false): ModuleContext => {
+    const ctx = makeCtx({ dryRun });
+    runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
+    return ctx;
+  };
+  const seed = (rules: readonly string[], withIni = true): void => {
+    for (const r of rules) put(path.join(HOUSE, `${r}.yml`), oldRule(r));
+    if (withIni) put(".vale.ini", shippedAtV6(".vale.ini"));
+  };
+  const captured: string[] = [];
+
+  beforeEach(() => {
+    captured.length = 0;
+    vi.spyOn(console, "log").mockImplementation((m: unknown) => {
+      captured.push(String(m));
+    });
+    vi.spyOn(console, "warn").mockImplementation((m: unknown) => {
+      captured.push(String(m));
+    });
+  });
+  afterEach(() => {
+    vi.restoreAllMocks();
+  });
+
+  it("moves shipped Vale rules to Bkit and keeps own and edited rules in House", () => {
+    seed(RULES);
+    const edited = oldRule("Hedging") + "\n# consumer edit\n";
+    put(path.join(HOUSE, "Hedging.yml"), edited);
+    put(path.join(HOUSE, "Mine.yml"), "extends: existence\nmessage: own\ntokens: [x]\n");
+    run();
+
+    for (const r of ["Filler", "LLMSlop", "Verbose"]) {
+      expect(fs.existsSync(path.join(HOUSE, `${r}.yml`))).toBe(false);
+      expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).toBe(oldRule(r));
+    }
+    expect(fs.readFileSync(path.join(HOUSE, "Hedging.yml"), "utf-8")).toBe(edited);
+    expect(fs.existsSync(path.join(BKIT, "Hedging.yml"))).toBe(false);
+    expect(fs.existsSync(path.join(HOUSE, "Mine.yml"))).toBe(true);
+    expect(fs.existsSync(path.join(BKIT, "Mine.yml"))).toBe(false);
+    const text = captured.join("\n");
+    expect(text).toContain("Hedging");
+    expect(text).toContain("mv .vale/styles/House/Hedging.yml .vale/styles/Bkit/");
+  });
+
+  it("names Bkit rules in .vale.ini and lists both styles while House keeps files", () => {
+    seed(RULES);
+    put(path.join(HOUSE, "Hedging.yml"), oldRule("Hedging") + "\n# consumer edit\n");
+    run();
+    const ini = fs.readFileSync(".vale.ini", "utf-8");
+    expect(ini).toContain("Bkit.Filler = NO");
+    expect(ini).toContain("Bkit.LLMSlop = NO");
+    expect(ini).toContain("Bkit.Verbose = NO");
+    expect(ini).not.toContain("House.Filler");
+    expect(ini).not.toContain("House.LLMSlop");
+    expect(ini).not.toContain("House.Verbose");
+    expect(ini).toContain("House.Hedging = NO");
+    const based = ini.split("\n").filter((l) => l.startsWith("BasedOnStyles"));
+    expect(based.length).toBeGreaterThan(0);
+    for (const l of based) {
+      expect(l).toMatch(/\bHouse\b/);
+      expect(l).toMatch(/\bBkit\b/);
+    }
+  });
+
+  it("moves every House rule and removes House", () => {
+    seed(RULES);
+    run();
+    for (const r of RULES) {
+      expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).toBe(oldRule(r));
+    }
+    expect(fs.existsSync(HOUSE)).toBe(false);
+    const ini = fs.readFileSync(".vale.ini", "utf-8");
+    expect(ini).not.toMatch(/\bHouse\b/);
+    expect(ini).toContain("BasedOnStyles = Bkit\n");
+    expect(ini).toContain("BasedOnStyles = write-good, Bkit\n");
+    for (const r of RULES) expect(ini).toContain(`Bkit.${r} = NO`);
+  });
+
+  it("moves rules without a .vale.ini", () => {
+    seed(RULES, false);
+    const ctx = run();
+    for (const r of RULES) {
+      expect(fs.existsSync(path.join(HOUSE, `${r}.yml`))).toBe(false);
+      expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).toBe(oldRule(r));
+    }
+    expect(fs.existsSync(".vale.ini")).toBe(false);
+    expect(ctx.ws.writes.map((w) => w.path)).not.toContain(".vale.ini");
+    expect(ctx.ws.writes.some((w) => w.path.endsWith(".vale.ini"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 04a332a74..6c937e37e 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -337,6 +337,8 @@ export function runBkitDocs(
   migrateTemplateNotes(dryRun, ws, logPrefix);
   const renames = migrateBrandedTemplateFiles(dryRun, ws, logPrefix);
   migrateBrandedFileTokens(dryRun, ws, logPrefix, renames);
+  migrateBrandedCheckNames(dryRun, ws, logPrefix, tokens.DEFAULT_BRANCH);
+  migrateValeHouseStyle(dryRun, ws, logPrefix);
 }
 
 // Migration (installs up to 6.0.x, `docs/migrations.md`): agents renamed since. A
@@ -1035,6 +1037,202 @@ export function migrateBrandedTemplateFiles(
   return renames;
 }
 
+// The old `bkit-stub:health` block, as shipped by every release up to 6.0.x.
+const OLD_HEALTH_STUB = [
+  "# bkit-stub:health — copy into .github/workflows/health.yml. workflow_run cannot share a file with",
+  "# push / pull_request. WHEN: you have a live URL to smoke after CI. Trigger on CI completed, default",
+  "# branch only, if the CI run succeeded. Then hit the health URL of the deployment this SHA promoted.",
+  "# e.g. poll the host until that deployment is ready, then GET /health. Not a required check.",
+  "# DROP if you have no deployed health URL.",
+].join("\n");
+
+// Exact old workflow `name:` lines the three shipped example workflows carried, with the
+// branded line and the check each one renames. `job` names the job whose display name the
+// workflow name branded (the job has no `name:` of its own, so its check showed the bare id).
+const BRANDED_WORKFLOWS = [
+  { file: "bkit-renovate.yml", oldName: "Renovate", newName: "bkit-renovate", job: "renovate" },
+  { file: "bkit-trivy.yml", oldName: "Trivy", newName: "bkit-trivy", job: "trivy" },
+] as const;
+const CHECK_RENAME_FIX =
+  "update the branch-protection required checks (and any ruleset) to the new name";
+
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the shipped example workflows and
+// the health stub in the CI workflow carry bkit- check names. Only the exact shipped old
+// lines are rewritten, so a customised `name:` stays; the job `name:` is inserted only when
+// the workflow name was rewritten and the job has none. The health stub block is replaced
+// by the current one when it is byte-identical to the shipped old one. Writes are `unhashed`:
+// the files stay the consumer's. One log line per renamed check names old -> new, because
+// branch protection matches the check name.
+export function migrateBrandedCheckNames(
+  dryRun: boolean,
+  ws: WriteSet,
+  logPrefix: string,
+  defaultBranch = "main",
+): void {
+  const tag = dryRun ? "[dry-run] " : "";
+  const wfDir = path.join(".github", "workflows");
+  const finish = (file: string, text: string, next: string, renamed: string[]): void => {
+    if (next === text) return;
+    if (!dryRun) fs.writeFileSync(file, next, "utf-8");
+    ws.writes.push({ path: file, action: "update", unhashed: true });
+    for (const line of renamed) {
+      console.log(`${logPrefix} ${tag}core: ${file} — check renamed ${line}; ${CHECK_RENAME_FIX}`);
+    }
+  };
+  const readFile = (file: string): string | undefined =>
+    fs.lstatSync(file, { throwIfNoEntry: false })?.isFile()
+      ? fs.readFileSync(file, "utf-8")
+      : undefined;
+
+  const cloud = path.join(wfDir, "bkit-cloud.yml");
+  const cloudText = readFile(cloud);
+  if (cloudText !== undefined) {
+    const renamed: string[] = [];
+    const next = cloudText.replace(
+      /^( {4}name: )(context|claude|opencode)( \(\$\{\{ github\.event_name \}\}\))$/gm,
+      (_m, pre: string, job: string, post: string) => {
+        renamed.push(`bkit-cloud / ${job}${post} -> bkit-cloud / bkit-cloud-${job}${post}`);
+        return `${pre}bkit-cloud-${job}${post}`;
+      },
+    );
+    finish(cloud, cloudText, next, renamed);
+  }
+
+  for (const { file, oldName, newName, job } of BRANDED_WORKFLOWS) {
+    const target = path.join(wfDir, file);
+    const text = readFile(target);
+    if (text === undefined) continue;
+    const nameLine = new RegExp(`^name: ${escapeRegExp(oldName)}$`, "m");
+    if (!nameLine.test(text)) continue;
+    let next = text.replace(nameLine, `name: ${newName}`);
+    next = next.replace(
+      new RegExp(`^( {2}${escapeRegExp(job)}:\\n)(?! {4}name:)`, "m"),
+      `$1    name: ${newName}\n`,
+    );
+    finish(target, text, next, [`${oldName} / ${job} -> ${newName} / ${newName}`]);
+  }
+
+  const ci = ciWorkflowPath(".");
+  const ciText = readFile(ci);
+  if (ciText !== undefined && ciText.includes(OLD_HEALTH_STUB)) {
+    const template = readFile(path.join(getTemplatesRoot(), ".github", "workflows", "bkit-ci.yml"));
+    const current = template?.match(
+      /^# bkit-stub:health[^\n]*\n(?:#[^\n]*\n)*?#[^\n]*DROP if you have no deployed health URL\./m,
+    )?.[0];
+    if (current !== undefined) {
+      const next = ciText.replace(OLD_HEALTH_STUB, () =>
+        current.replace(/\{\{DEFAULT_BRANCH\}\}/g, () => defaultBranch),
+      );
+      if (next !== ciText) {
+        if (!dryRun) fs.writeFileSync(ci, next, "utf-8");
+        ws.writes.push({ path: ci, action: "update", unhashed: true });
+        console.log(
+          `${logPrefix} ${tag}core: ${ci} — old bkit-stub:health text replaced by the current block`,
+        );
+      }
+    }
+  }
+}
+
+// sha256 of every distinct release content of the four shipped `House` Vale rules, from each
+// `v*` tag, across `.agents/templates/.vale/styles/House/` and `.bkit/templates/.vale/styles/House/`.
+// An unedited copy matches one of them. Same shape as `RETIRED_DRIVER_HASHES` (write.ts).
+export const SHIPPED_HOUSE_RULE_HASHES: Readonly<Record<string, readonly string[]>> = {
+  Filler: [
+    "96139df9ffc61835e23014addac887d9465169d62cd1be24c2f272f838166524",
+    "9b10438de3158a1923c51375fcba56de7a8dd2f17de97d62385407eee2a6e377",
+    "e04e9e76a4857de0d13ff106343e25000418c535a983317f5a2e1710fa68cbc7",
+  ],
+  Hedging: [
+    "7289b6bfe98f48803734c016c6ba49661071b5d8ded0f4678509b37c6ab8aff9",
+    "b7425861cb3085cc798379d8e92f01a0420aa2c40f7be1ba1bbfabd908767a37",
+    "c46cda04406629377555d3add75e56edaad40521864743dbbd47781f2c048ef0",
+  ],
+  LLMSlop: [
+    "17a22ab44f0bd37de4d4c972fbb39a71dc256712ba0cfc39320043381f180a8e",
+    "c39313e229249786ba189bb1abe55728f83e325a54777b41b54e0a1dec47b4f7",
+    "e1ce58da6c86d7bc746698fbf17fd3d0075980ca78f2d8b8c927ea3ddc35094e",
+  ],
+  Verbose: [
+    "8278791997cca85a2df63b2c93decac480e685215e0569e8472aa433e7a27ac8",
+    "bcb18beb903e7bd57780905778ea4d1a4f294589cf191375db144ecb11f4c619",
+    "f7939a5be92562803183108581538a1b4ca73c3b8a1b68ceeb2b2149ba1a4357",
+  ],
+};
+
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the shipped Vale style is `Bkit`,
+// it was `House`. A `House/<rule>.yml` byte-identical to a shipped release moves to
+// `Bkit/<rule>.yml` when that is absent; an edited rule or a taken target stays with one
+// warning naming the manual move. In `.vale.ini`, `House.<moved>` becomes `Bkit.<moved>`;
+// `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (the directory goes), else
+// appends `Bkit`. Own rules in `House/` stay. Writes are `unhashed`.
+export function migrateValeHouseStyle(dryRun: boolean, ws: WriteSet, logPrefix: string): void {
+  const tag = dryRun ? "[dry-run] " : "";
+  const stylesDir = path.join(".vale", "styles");
+  const houseDir = path.join(stylesDir, "House");
+  const bkitDir = path.join(stylesDir, "Bkit");
+  if (!fs.lstatSync(houseDir, { throwIfNoEntry: false })?.isDirectory()) return;
+  const moved: string[] = [];
+  for (const [rule, hashes] of Object.entries(SHIPPED_HOUSE_RULE_HASHES)) {
+    const from = path.join(houseDir, `${rule}.yml`);
+    if (!fs.lstatSync(from, { throwIfNoEntry: false })?.isFile()) continue;
+    const to = path.join(bkitDir, `${rule}.yml`);
+    const stays = !hashes.includes(sha256(fs.readFileSync(from)))
+      ? "differs from every shipped release"
+      : fs.existsSync(to)
+        ? `${to} already exists`
+        : undefined;
+    if (stays !== undefined) {
+      console.warn(
+        `${logPrefix} ${tag}core: ${from} not moved to the Bkit style (${stays}); move it by hand: mv .vale/styles/House/${rule}.yml .vale/styles/Bkit/ and rename the House.${rule} toggle in .vale.ini to Bkit.${rule}`,
+      );
+      continue;
+    }
+    if (!dryRun) {
+      fs.mkdirSync(bkitDir, { recursive: true });
+      fs.copyFileSync(from, to);
+      fs.rmSync(from);
+    }
+    ws.writes.push({ path: from, action: "write", unhashed: true });
+    ws.writes.push({ path: to, action: "write", unhashed: true });
+    moved.push(rule);
+    console.log(`${logPrefix} ${tag}core: ${from} moved to ${to}`);
+  }
+  const remaining = fs
+    .readdirSync(houseDir)
+    .filter((f) => !moved.includes(f.replace(/\.yml$/, "")));
+  const houseGone = remaining.length === 0;
+  if (houseGone) {
+    if (!dryRun) fs.rmSync(houseDir, { recursive: true });
+    ws.writes.push({ path: houseDir, action: "write", unhashed: true });
+  }
+  if (moved.length === 0 && !houseGone) return;
+  const ini = ".vale.ini";
+  if (!fs.lstatSync(ini, { throwIfNoEntry: false })?.isFile()) return;
+  const text = fs.readFileSync(ini, "utf-8");
+  let next = text;
+  if (moved.length > 0) {
+    next = next.replace(
+      new RegExp(`^(\\s*)House\\.(${moved.join("|")})\\b`, "gm"),
+      (_m, lead: string, rule: string) => `${lead}Bkit.${rule}`,
+    );
+  }
+  if (houseGone) next = next.replace(/^(#.*)\bHouse rules\b/gm, "$1Bkit rules");
+  next = next.replace(/^(BasedOnStyles\s*=\s*)(.*)$/gm, (line, pre: string, list: string) => {
+    const styles = list.split(",").map((s) => s.trim());
+    if (!styles.includes("House")) return line;
+    if (houseGone) {
+      const swapped = styles.map((s) => (s === "House" ? "Bkit" : s));
+      return pre + [...new Set(swapped)].join(", ");
+    }
+    return styles.includes("Bkit") ? line : `${line}, Bkit`;
+  });
+  if (next === text) return;
+  if (!dryRun) fs.writeFileSync(ini, next, "utf-8");
+  ws.writes.push({ path: ini, action: "update", unhashed: true });
+  console.log(`${logPrefix} ${tag}core: ${ini} — House style names rewritten to Bkit`);
+}
+
 // Status option ids of GitHub's Kanban and Team planning board templates; every board
 // made from one carries the same ids.
 const TEMPLATE_STATUS_OPTIONS: Readonly<Record<string, string>> = {
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 1041b1dc7..11732afc2 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -8,7 +8,7 @@
 > **Rules:**
 >
 > - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
-> - `bkit install` and `bkit upgrade` never write these files and never overwrite a copy.
+> - `bkit install` and `bkit upgrade` never write these files and never overwrite a copy, with one exception: they rewrite an adopted copy where bkit's exact shipped old text matches (the brand migrations, `docs/migrations.md`), never otherwise.
 > - Adapt the app roots, the workspace package scope and the rules JSON. The examples use `apps/web`, `apps/mobile`, `packages/api` and `@scope`.
 
 ## What each template is for
@@ -54,7 +54,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Git hooks (Husky) | `.bkit/templates/.husky/pre-commit`, `.bkit/templates/.husky/pre-push` | `.husky/pre-commit`, `.husky/pre-push` | both files |
 | Prettier ignore list | `.bkit/templates/.prettierignore` | `.prettierignore` | that file |
 | lint-staged | `.bkit/templates/.lintstagedrc.json` | `.lintstagedrc.json` | that file |
-| Vale | `.bkit/templates/.vale.ini`, `.bkit/templates/.vale/styles/House/` | `.vale.ini`, `.vale/styles/House/` | `.vale.ini` + the four House styles |
+| Vale | `.bkit/templates/.vale.ini`, `.bkit/templates/.vale/styles/Bkit/` | `.vale.ini`, `.vale/styles/Bkit/` | `.vale.ini` + the four Bkit styles |
 | slop-scan | `.bkit/templates/slop-scan.config.json`, `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` | `slop-scan.config.json`, `scripts/slop/bkit-slop-type-suppression.mjs` | both files |
 | Oxlint | `.bkit/templates/.oxlintrc.json` | `.oxlintrc.json` | that file |
 | direnv | `.bkit/templates/.envrc` | `.envrc` | that file |
@@ -328,17 +328,17 @@ pnpm add -D lint-staged@^17.0.0 prettier@^3.5.3
 - Globs must not overlap, because lint-staged runs entries concurrently, so two entries that write one file race. The second entry negates the first.
 - Adapt: add per-glob commands (eslint `--fix`, etc.), and keep them seconds-fast.
 
-## Vale — prose lint, with House styles
+## Vale — prose lint, with Bkit styles
 
-`bkit:lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's House styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.
+`bkit:lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's Bkit styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.
 
 ```bash
 brew install vale
 vale sync
 ```
 
-- Copy `.vale.ini` and all four `.vale/styles/House/*.yml`.
-- `.gitignore`: `.vale/styles/write-good`. `vale sync` downloads it, and the House styles stay tracked.
+- Copy `.vale.ini` and all four `.vale/styles/Bkit/*.yml`.
+- `.gitignore`: `.vale/styles/write-good`. `vale sync` downloads it, and the Bkit styles stay tracked.
 - CI: the `bkit-ci.yml` template installs a pinned Vale and runs `vale sync`.
 - Cursor: the `Dockerfile` template installs it.
 - Adapt: add `[glob]` scope blocks for your own docs. Turn rules off per path, not globally.
diff --git a/.bkit/version b/.bkit/version
index 55591d505..757ab2b95 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -215,7 +215,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "ea7081672a0fe44a1d2eaf40958c008a7631d329345d11d6a7ca4439a156bf25",
     "docs/templates/bkit-audit-agents.md": "39f34db396db4e50742d230304ecdeb0ceb367ee99e03aaba740872ff8fdd858",
     "docs/templates/bkit-audit-prompts.md": "3323a98811ad65da0fc30d5e52f2a48cd09872dc490fcac0008adba097c37e0a",
-    ".bkit/templates.md": "b1f503d52880fd309b32f5bac364a4fcd1f2698ba0005f2687b1101ed6fb4900",
+    ".bkit/templates.md": "8d520c844a3d864e5aad1b88d8a7ce830315a664d9e375e4017d0444711827a7",
     "docs/templates/bkit-audit-adoption.md": "09fa8636f0529f95ab7a46f4c74727da85fde7180d43979e74cdbb3ea3557794",
     ".bkit/cloud.md": "7594f46d9003bcf77650cf57c3ff934278690187434e58bc57159ccbd1c52524",
     ".bkit/comparison.md": "1ab7924388e037438a73a87c1826f5846f7ae38a5a41479eb6bb7454ae782d07",
@@ -225,7 +225,7 @@
     ".bkit/prompts.md": "05bef1112ac15f6ffdb8877f132d0b85e2718ca682be4dca0a7dbebdd798ab05",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
     ".bkit/workflows.md": "31b4342e019563120bd4562a4e1a0f2a7156c7f32609d3e8e3f14500f8f255ba",
-    ".bkit/README.md": "6e48425f9c1cef2824d4197e54a355d6c68dde07ba20db8946b153f4ce2e82e6",
+    ".bkit/README.md": "5010dd79947d7eca02eabc1a22fac6b6967f79f4c53049db8f73eeba2f9428ae",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
     ".claude/hooks/bkit-guardrails.cjs": "cf9e03228d75d0746f92fd0f88840e64185bdeec7818a94d7c09037af6156b51",
diff --git a/dist/install/modules/cloud.js b/dist/install/modules/cloud.js
index 3b461dd81..d2b8b33cb 100644
--- a/dist/install/modules/cloud.js
+++ b/dist/install/modules/cloud.js
@@ -53,7 +53,7 @@ function setConsumerBkitField(field, value, dryRun) {
 }
 // The cloud workflow is a template (`.bkit/templates.md`). Shared first step of the
 // claude and opencode setup advisories.
-const CLOUD_WORKFLOW_ADOPT_STEP = "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
+const CLOUD_WORKFLOW_ADOPT_STEP = "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";
 // ---------------------------------------------------------------------------
 // runCloudModule — opt-in cloud-agent integration
 // ---------------------------------------------------------------------------
@@ -99,7 +99,7 @@ export function runCloudModule(ctx) {
             severity: "advisory",
             detect: "Cloud env config splits across the repo (`.claude/hooks/bkit-cloud-bootstrap.sh`, a copy-and-own template you adopt) and the Claude app dashboard (setup script + env vars + auth tokens, manual).",
             action: "Two locations to touch — full recipe in bkit's `cloud.md`.\n\n" +
-                "IN REPO (copy-and-own; bkit never writes it):\n" +
+                "IN REPO (copy-and-own; bkit never writes it, apart from brand migrations that rewrite exact shipped old names):\n" +
                 "  - Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh` and edit it freely — the baseline runs `pnpm install` / `vale sync` and the gh login on each cloud session; add your own repo-specific steps (Supabase start, turbo prebuild, etc. — examples inlined). The `.claude/settings.json` SessionStart entry runs it only when present (`test -f … || true`).\n\n" +
                 "IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):\n" +
                 "  - Name: the repo name (e.g. `acme-web`) — one environment per repo, since secrets are per-repo.\n" +
@@ -146,7 +146,7 @@ export function runCloudModule(ctx) {
                 "  - Allowed concurrency: latest-supersedes.\n" +
                 "  - Set `BKIT_LINEAR_API_KEY` as a **Runtime Secret** in the Cloud Agents dashboard (https://cursor.com/dashboard/cloud-agents) → your environment → Secrets tab.\n" +
                 "  - Label the issue `bkit:auto` in Linear before pushing the build commit.\n\n" +
-                "IN REPO (copy each template and own it; bkit never writes or overwrites these files — see `.bkit/templates.md`):\n" +
+                "IN REPO (copy each template and own it; bkit never writes or overwrites these files, apart from brand migrations that rewrite exact shipped old names — see `.bkit/templates.md`):\n" +
                 "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: change Node major if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps.\n" +
                 "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: set `install` / `start` / `terminals[]` / `env` for your stack.",
         });
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index a2122bf8f..298b6d77e 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -258,6 +258,8 @@ export function runBkitDocs(dryRun, tokens, ws, logPrefix) {
     migrateTemplateNotes(dryRun, ws, logPrefix);
     const renames = migrateBrandedTemplateFiles(dryRun, ws, logPrefix);
     migrateBrandedFileTokens(dryRun, ws, logPrefix, renames);
+    migrateBrandedCheckNames(dryRun, ws, logPrefix, tokens.DEFAULT_BRANCH);
+    migrateValeHouseStyle(dryRun, ws, logPrefix);
 }
 // Migration (installs up to 6.0.x, `docs/migrations.md`): agents renamed since. A
 // consumer's `## Model Overrides` row below `bkit:end` in `.bkit/prompts.md` naming an
@@ -876,6 +878,184 @@ export function migrateBrandedTemplateFiles(dryRun, ws, logPrefix) {
     }
     return renames;
 }
+// The old `bkit-stub:health` block, as shipped by every release up to 6.0.x.
+const OLD_HEALTH_STUB = [
+    "# bkit-stub:health — copy into .github/workflows/health.yml. workflow_run cannot share a file with",
+    "# push / pull_request. WHEN: you have a live URL to smoke after CI. Trigger on CI completed, default",
+    "# branch only, if the CI run succeeded. Then hit the health URL of the deployment this SHA promoted.",
+    "# e.g. poll the host until that deployment is ready, then GET /health. Not a required check.",
+    "# DROP if you have no deployed health URL.",
+].join("\n");
+// Exact old workflow `name:` lines the three shipped example workflows carried, with the
+// branded line and the check each one renames. `job` names the job whose display name the
+// workflow name branded (the job has no `name:` of its own, so its check showed the bare id).
+const BRANDED_WORKFLOWS = [
+    { file: "bkit-renovate.yml", oldName: "Renovate", newName: "bkit-renovate", job: "renovate" },
+    { file: "bkit-trivy.yml", oldName: "Trivy", newName: "bkit-trivy", job: "trivy" },
+];
+const CHECK_RENAME_FIX = "update the branch-protection required checks (and any ruleset) to the new name";
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the shipped example workflows and
+// the health stub in the CI workflow carry bkit- check names. Only the exact shipped old
+// lines are rewritten, so a customised `name:` stays; the job `name:` is inserted only when
+// the workflow name was rewritten and the job has none. The health stub block is replaced
+// by the current one when it is byte-identical to the shipped old one. Writes are `unhashed`:
+// the files stay the consumer's. One log line per renamed check names old -> new, because
+// branch protection matches the check name.
+export function migrateBrandedCheckNames(dryRun, ws, logPrefix, defaultBranch = "main") {
+    const tag = dryRun ? "[dry-run] " : "";
+    const wfDir = path.join(".github", "workflows");
+    const finish = (file, text, next, renamed) => {
+        if (next === text)
+            return;
+        if (!dryRun)
+            fs.writeFileSync(file, next, "utf-8");
+        ws.writes.push({ path: file, action: "update", unhashed: true });
+        for (const line of renamed) {
+            console.log(`${logPrefix} ${tag}core: ${file} — check renamed ${line}; ${CHECK_RENAME_FIX}`);
+        }
+    };
+    const readFile = (file) => fs.lstatSync(file, { throwIfNoEntry: false })?.isFile()
+        ? fs.readFileSync(file, "utf-8")
+        : undefined;
+    const cloud = path.join(wfDir, "bkit-cloud.yml");
+    const cloudText = readFile(cloud);
+    if (cloudText !== undefined) {
+        const renamed = [];
+        const next = cloudText.replace(/^( {4}name: )(context|claude|opencode)( \(\$\{\{ github\.event_name \}\}\))$/gm, (_m, pre, job, post) => {
+            renamed.push(`bkit-cloud / ${job}${post} -> bkit-cloud / bkit-cloud-${job}${post}`);
+            return `${pre}bkit-cloud-${job}${post}`;
+        });
+        finish(cloud, cloudText, next, renamed);
+    }
+    for (const { file, oldName, newName, job } of BRANDED_WORKFLOWS) {
+        const target = path.join(wfDir, file);
+        const text = readFile(target);
+        if (text === undefined)
+            continue;
+        const nameLine = new RegExp(`^name: ${escapeRegExp(oldName)}$`, "m");
+        if (!nameLine.test(text))
+            continue;
+        let next = text.replace(nameLine, `name: ${newName}`);
+        next = next.replace(new RegExp(`^( {2}${escapeRegExp(job)}:\\n)(?! {4}name:)`, "m"), `$1    name: ${newName}\n`);
+        finish(target, text, next, [`${oldName} / ${job} -> ${newName} / ${newName}`]);
+    }
+    const ci = ciWorkflowPath(".");
+    const ciText = readFile(ci);
+    if (ciText !== undefined && ciText.includes(OLD_HEALTH_STUB)) {
+        const template = readFile(path.join(getTemplatesRoot(), ".github", "workflows", "bkit-ci.yml"));
+        const current = template?.match(/^# bkit-stub:health[^\n]*\n(?:#[^\n]*\n)*?#[^\n]*DROP if you have no deployed health URL\./m)?.[0];
+        if (current !== undefined) {
+            const next = ciText.replace(OLD_HEALTH_STUB, () => current.replace(/\{\{DEFAULT_BRANCH\}\}/g, () => defaultBranch));
+            if (next !== ciText) {
+                if (!dryRun)
+                    fs.writeFileSync(ci, next, "utf-8");
+                ws.writes.push({ path: ci, action: "update", unhashed: true });
+                console.log(`${logPrefix} ${tag}core: ${ci} — old bkit-stub:health text replaced by the current block`);
+            }
+        }
+    }
+}
+// sha256 of every distinct release content of the four shipped `House` Vale rules, from each
+// `v*` tag, across `.agents/templates/.vale/styles/House/` and `.bkit/templates/.vale/styles/House/`.
+// An unedited copy matches one of them. Same shape as `RETIRED_DRIVER_HASHES` (write.ts).
+export const SHIPPED_HOUSE_RULE_HASHES = {
+    Filler: [
+        "96139df9ffc61835e23014addac887d9465169d62cd1be24c2f272f838166524",
+        "9b10438de3158a1923c51375fcba56de7a8dd2f17de97d62385407eee2a6e377",
+        "e04e9e76a4857de0d13ff106343e25000418c535a983317f5a2e1710fa68cbc7",
+    ],
+    Hedging: [
+        "7289b6bfe98f48803734c016c6ba49661071b5d8ded0f4678509b37c6ab8aff9",
+        "b7425861cb3085cc798379d8e92f01a0420aa2c40f7be1ba1bbfabd908767a37",
+        "c46cda04406629377555d3add75e56edaad40521864743dbbd47781f2c048ef0",
+    ],
+    LLMSlop: [
+        "17a22ab44f0bd37de4d4c972fbb39a71dc256712ba0cfc39320043381f180a8e",
+        "c39313e229249786ba189bb1abe55728f83e325a54777b41b54e0a1dec47b4f7",
+        "e1ce58da6c86d7bc746698fbf17fd3d0075980ca78f2d8b8c927ea3ddc35094e",
+    ],
+    Verbose: [
+        "8278791997cca85a2df63b2c93decac480e685215e0569e8472aa433e7a27ac8",
+        "bcb18beb903e7bd57780905778ea4d1a4f294589cf191375db144ecb11f4c619",
+        "f7939a5be92562803183108581538a1b4ca73c3b8a1b68ceeb2b2149ba1a4357",
+    ],
+};
+// Migration (up to 6.0.x installs, `docs/migrations.md`): the shipped Vale style is `Bkit`,
+// it was `House`. A `House/<rule>.yml` byte-identical to a shipped release moves to
+// `Bkit/<rule>.yml` when that is absent; an edited rule or a taken target stays with one
+// warning naming the manual move. In `.vale.ini`, `House.<moved>` becomes `Bkit.<moved>`;
+// `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (the directory goes), else
+// appends `Bkit`. Own rules in `House/` stay. Writes are `unhashed`.
+export function migrateValeHouseStyle(dryRun, ws, logPrefix) {
+    const tag = dryRun ? "[dry-run] " : "";
+    const stylesDir = path.join(".vale", "styles");
+    const houseDir = path.join(stylesDir, "House");
+    const bkitDir = path.join(stylesDir, "Bkit");
+    if (!fs.lstatSync(houseDir, { throwIfNoEntry: false })?.isDirectory())
+        return;
+    const moved = [];
+    for (const [rule, hashes] of Object.entries(SHIPPED_HOUSE_RULE_HASHES)) {
+        const from = path.join(houseDir, `${rule}.yml`);
+        if (!fs.lstatSync(from, { throwIfNoEntry: false })?.isFile())
+            continue;
+        const to = path.join(bkitDir, `${rule}.yml`);
+        const stays = !hashes.includes(sha256(fs.readFileSync(from)))
+            ? "differs from every shipped release"
+            : fs.existsSync(to)
+                ? `${to} already exists`
+                : undefined;
+        if (stays !== undefined) {
+            console.warn(`${logPrefix} ${tag}core: ${from} not moved to the Bkit style (${stays}); move it by hand: mv .vale/styles/House/${rule}.yml .vale/styles/Bkit/ and rename the House.${rule} toggle in .vale.ini to Bkit.${rule}`);
+            continue;
+        }
+        if (!dryRun) {
+            fs.mkdirSync(bkitDir, { recursive: true });
+            fs.copyFileSync(from, to);
+            fs.rmSync(from);
+        }
+        ws.writes.push({ path: from, action: "write", unhashed: true });
+        ws.writes.push({ path: to, action: "write", unhashed: true });
+        moved.push(rule);
+        console.log(`${logPrefix} ${tag}core: ${from} moved to ${to}`);
+    }
+    const remaining = fs
+        .readdirSync(houseDir)
+        .filter((f) => !moved.includes(f.replace(/\.yml$/, "")));
+    const houseGone = remaining.length === 0;
+    if (houseGone) {
+        if (!dryRun)
+            fs.rmSync(houseDir, { recursive: true });
+        ws.writes.push({ path: houseDir, action: "write", unhashed: true });
+    }
+    if (moved.length === 0 && !houseGone)
+        return;
+    const ini = ".vale.ini";
+    if (!fs.lstatSync(ini, { throwIfNoEntry: false })?.isFile())
+        return;
+    const text = fs.readFileSync(ini, "utf-8");
+    let next = text;
+    if (moved.length > 0) {
+        next = next.replace(new RegExp(`^(\\s*)House\\.(${moved.join("|")})\\b`, "gm"), (_m, lead, rule) => `${lead}Bkit.${rule}`);
+    }
+    if (houseGone)
+        next = next.replace(/^(#.*)\bHouse rules\b/gm, "$1Bkit rules");
+    next = next.replace(/^(BasedOnStyles\s*=\s*)(.*)$/gm, (line, pre, list) => {
+        const styles = list.split(",").map((s) => s.trim());
+        if (!styles.includes("House"))
+            return line;
+        if (houseGone) {
+            const swapped = styles.map((s) => (s === "House" ? "Bkit" : s));
+            return pre + [...new Set(swapped)].join(", ");
+        }
+        return styles.includes("Bkit") ? line : `${line}, Bkit`;
+    });
+    if (next === text)
+        return;
+    if (!dryRun)
+        fs.writeFileSync(ini, next, "utf-8");
+    ws.writes.push({ path: ini, action: "update", unhashed: true });
+    console.log(`${logPrefix} ${tag}core: ${ini} — House style names rewritten to Bkit`);
+}
 // Status option ids of GitHub's Kanban and Team planning board templates; every board
 // made from one carries the same ids.
 const TEMPLATE_STATUS_OPTIONS = {
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 1b7a8ac7e..5ebb6426b 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -27,7 +27,7 @@
 > - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `741d0c6ea`; when that differs from HEAD ⇒ run `pnpm bkit:graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `eb14b9115`; when that differs from HEAD ⇒ run `pnpm bkit:graph:update` first.
 > - Detail-level module graph → `pnpm bkit:graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -76,12 +76,13 @@ Not scanned; run the rollup with `--reachability`.
 
 ## Import-time side effects
 
-14 module-scope side effects in 5 of 116 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, and a test that never touches the thing still has to stub it. Sorted by reach.
+15 module-scope side effects in 6 of 116 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, and a test that never touches the thing still has to stub it. Sorted by reach.
 
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
 | `.bkit/core/engine/shared/text.ts` | `Symbol` | 188 | 112 |
+| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 177 | 106 |
 | `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 177 | 106 |
 | `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 177 | 106 |
 | `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 177 | 106 |
@@ -155,8 +156,8 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 741d0c6eadd3c3cfdfc2a428d51a92545d9a081a — do not edit
-  n_bkit_core[".bkit/core<br/>2897 symbols · 127 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
+  %% Generated by bkit-graphify-rollup.py from eb14b9115e6c1812b1953151213551695426c440 — do not edit
+  n_bkit_core[".bkit/core<br/>2904 symbols · 127 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   nscripts_harvest -->|21| n_bkit_core
   style n_bkit_core stroke:#65a30d,stroke-width:4px,stroke-dasharray:8 4,fill:#ffcc80,color:#1f2328
@@ -180,7 +181,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 741d0c6eadd3c3cfdfc2a428d51a92545d9a081a — do not edit
+  %% Generated by bkit-graphify-rollup.py from eb14b9115e6c1812b1953151213551695426c440 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -208,7 +209,7 @@ flowchart LR
     subgraph gn_bkit_core_engine_checks[".bkit/core/engine/checks"]
       subgraph gn_bkit_core_engine_checks_after[".bkit/core/engine/checks/after"]
         n_bkit_core_engine_checks_after_auth["auth<br/>10 symbols · 1 files"]
-        n_bkit_core_engine_checks_after_ci_yml["ci-yml<br/>17 symbols · 1 files"]
+        n_bkit_core_engine_checks_after_ci_yml["ci-yml<br/>19 symbols · 1 files"]
         n_bkit_core_engine_checks_after_github["github<br/>11 symbols · 1 files"]
         n_bkit_core_engine_checks_after_managed["managed<br/>11 symbols · 1 files"]
         n_bkit_core_engine_checks_after_suppression["suppression<br/>5 symbols · 1 files"]
@@ -273,7 +274,7 @@ flowchart LR
         n_bkit_core_engine_install_modules_antigravity["antigravity<br/>7 symbols · 1 files"]
         n_bkit_core_engine_install_modules_claude["claude<br/>6 symbols · 1 files"]
         n_bkit_core_engine_install_modules_codex["codex<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_install_modules_core["core<br/>62 symbols · 1 files"]
+        n_bkit_core_engine_install_modules_core["core<br/>67 symbols · 1 files"]
         n_bkit_core_engine_install_modules_cursor["cursor<br/>3 symbols · 1 files"]
         n_bkit_core_engine_install_modules_opencode["opencode<br/>10 symbols · 1 files"]
       end
@@ -369,6 +370,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_repo -->|12| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runtime -->|12| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tests -->|12| n_bkit_core_engine_commands_workflow_status
+  n_bkit_core_engine_install_modules_core -->|12| n_bkit_core_engine_shared_json
   n_bkit_core_engine_checks_after_index -->|11| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_shared_package_roots
@@ -376,7 +378,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_steps -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_tracker -->|11| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_install_modules_core -->|11| n_bkit_core_engine_shared_json
+  n_bkit_core_engine_install_modules_core -->|11| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_render_models
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_shared_settings -->|11| n_bkit_core_engine_install_manifest
@@ -419,8 +421,8 @@ flowchart LR
   n_bkit_core_engine_install_modules_claude -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_codex -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_core -->|9| n_bkit_core_engine_install_managed_block
+  n_bkit_core_engine_install_modules_core -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_core -->|9| n_bkit_core_engine_install_manifest
-  n_bkit_core_engine_install_modules_core -->|9| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_install_modules_cursor -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_install_upgrade -->|8| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_workflow_challenge -->|8| n_bkit_core_engine_commands_workflow_plan_blocks
@@ -461,7 +463,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_ledgers_journal
   n_bkit_core_engine_commands_workflow_tests_changed -->|7| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|7| n_bkit_core_engine_commands_workflow_summary
-  n_bkit_core_engine_install_modules_core -->|7| n_bkit_core_engine_shared_package_roots
+  n_bkit_core_engine_install_modules_core -->|7| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_render_hosts
   n_bkit_core_engine_install_modules_opencode -->|7| n_bkit_core_engine_install_cloud_env
@@ -649,130 +651,131 @@ flowchart LR
   linkStyle 65 stroke:#be123c,stroke-width:2px
   linkStyle 66 stroke:#be123c,stroke-width:2px
   linkStyle 67 stroke:#0891b2,stroke-width:2px
-  linkStyle 68 stroke:#c026d3,stroke-width:2px
-  linkStyle 69 stroke:#65a30d,stroke-width:2px
-  linkStyle 70 stroke:#5b8c00,stroke-width:2px
-  linkStyle 71 stroke:#1a7f37,stroke-width:2px
-  linkStyle 72 stroke:#b45309,stroke-width:2px
+  linkStyle 68 stroke:#d73a4a,stroke-width:2px
+  linkStyle 69 stroke:#c026d3,stroke-width:2px
+  linkStyle 70 stroke:#65a30d,stroke-width:2px
+  linkStyle 71 stroke:#5b8c00,stroke-width:2px
+  linkStyle 72 stroke:#1a7f37,stroke-width:2px
   linkStyle 73 stroke:#b45309,stroke-width:2px
-  linkStyle 74 stroke:#be123c,stroke-width:2px
-  linkStyle 75 stroke:#d73a4a,stroke-width:2px
-  linkStyle 76 stroke:#be123c,stroke-width:2px
-  linkStyle 77 stroke:#5b8c00,stroke-width:2px
-  linkStyle 78 stroke:#b45309,stroke-width:2px
-  linkStyle 79 stroke:#0891b2,stroke-width:2px
-  linkStyle 80 stroke:#a21caf,stroke-width:2px
-  linkStyle 81 stroke:#b45309,stroke-width:2px
-  linkStyle 82 stroke:#be123c,stroke-width:2px
-  linkStyle 83 stroke:#c2410c,stroke-width:2px
-  linkStyle 84 stroke:#0891b2,stroke-width:2px
-  linkStyle 85 stroke:#9a6700,stroke-width:2px
-  linkStyle 86 stroke:#0891b2,stroke-width:2px
-  linkStyle 87 stroke:#d73a4a,stroke-width:2px
+  linkStyle 74 stroke:#b45309,stroke-width:2px
+  linkStyle 75 stroke:#be123c,stroke-width:2px
+  linkStyle 76 stroke:#bf3989,stroke-width:2px
+  linkStyle 77 stroke:#be123c,stroke-width:2px
+  linkStyle 78 stroke:#5b8c00,stroke-width:2px
+  linkStyle 79 stroke:#b45309,stroke-width:2px
+  linkStyle 80 stroke:#0891b2,stroke-width:2px
+  linkStyle 81 stroke:#a21caf,stroke-width:2px
+  linkStyle 82 stroke:#b45309,stroke-width:2px
+  linkStyle 83 stroke:#be123c,stroke-width:2px
+  linkStyle 84 stroke:#c2410c,stroke-width:2px
+  linkStyle 85 stroke:#0891b2,stroke-width:2px
+  linkStyle 86 stroke:#9a6700,stroke-width:2px
+  linkStyle 87 stroke:#0891b2,stroke-width:2px
   linkStyle 88 stroke:#d73a4a,stroke-width:2px
-  linkStyle 89 stroke:#65a30d,stroke-width:2px
-  linkStyle 90 stroke:#b91c1c,stroke-width:2px
-  linkStyle 91 stroke:#c026d3,stroke-width:2px
+  linkStyle 89 stroke:#d73a4a,stroke-width:2px
+  linkStyle 90 stroke:#65a30d,stroke-width:2px
+  linkStyle 91 stroke:#b91c1c,stroke-width:2px
   linkStyle 92 stroke:#c026d3,stroke-width:2px
   linkStyle 93 stroke:#c026d3,stroke-width:2px
-  linkStyle 94 stroke:#1a7f37,stroke-width:2px
-  linkStyle 95 stroke:#c026d3,stroke-width:2px
+  linkStyle 94 stroke:#c026d3,stroke-width:2px
+  linkStyle 95 stroke:#1a7f37,stroke-width:2px
   linkStyle 96 stroke:#c026d3,stroke-width:2px
   linkStyle 97 stroke:#c026d3,stroke-width:2px
-  linkStyle 98 stroke:#9a6700,stroke-width:2px
-  linkStyle 99 stroke:#c026d3,stroke-width:2px
-  linkStyle 100 stroke:#c2410c,stroke-width:2px
-  linkStyle 101 stroke:#b45309,stroke-width:2px
-  linkStyle 102 stroke:#0f766e,stroke-width:2px
-  linkStyle 103 stroke:#0e7490,stroke-width:2px
-  linkStyle 104 stroke:#be123c,stroke-width:2px
-  linkStyle 105 stroke:#c2410c,stroke-width:2px
-  linkStyle 106 stroke:#2563eb,stroke-width:2px
-  linkStyle 107 stroke:#d73a4a,stroke-width:2px
-  linkStyle 108 stroke:#9a6700,stroke-width:2px
-  linkStyle 109 stroke:#0891b2,stroke-width:2px
-  linkStyle 110 stroke:#be123c,stroke-width:2px
-  linkStyle 111 stroke:#c2410c,stroke-width:2px
-  linkStyle 112 stroke:#be123c,stroke-width:2px
-  linkStyle 113 stroke:#2563eb,stroke-width:2px
-  linkStyle 114 stroke:#5b8c00,stroke-width:2px
+  linkStyle 98 stroke:#c026d3,stroke-width:2px
+  linkStyle 99 stroke:#9a6700,stroke-width:2px
+  linkStyle 100 stroke:#c026d3,stroke-width:2px
+  linkStyle 101 stroke:#c2410c,stroke-width:2px
+  linkStyle 102 stroke:#b45309,stroke-width:2px
+  linkStyle 103 stroke:#0f766e,stroke-width:2px
+  linkStyle 104 stroke:#0e7490,stroke-width:2px
+  linkStyle 105 stroke:#be123c,stroke-width:2px
+  linkStyle 106 stroke:#c2410c,stroke-width:2px
+  linkStyle 107 stroke:#2563eb,stroke-width:2px
+  linkStyle 108 stroke:#d73a4a,stroke-width:2px
+  linkStyle 109 stroke:#9a6700,stroke-width:2px
+  linkStyle 110 stroke:#0891b2,stroke-width:2px
+  linkStyle 111 stroke:#be123c,stroke-width:2px
+  linkStyle 112 stroke:#c2410c,stroke-width:2px
+  linkStyle 113 stroke:#be123c,stroke-width:2px
+  linkStyle 114 stroke:#2563eb,stroke-width:2px
   linkStyle 115 stroke:#5b8c00,stroke-width:2px
   linkStyle 116 stroke:#5b8c00,stroke-width:2px
-  linkStyle 117 stroke:#be123c,stroke-width:2px
-  linkStyle 118 stroke:#b45309,stroke-width:2px
-  linkStyle 119 stroke:#bf3989,stroke-width:2px
-  linkStyle 120 stroke:#5b8c00,stroke-width:2px
+  linkStyle 117 stroke:#5b8c00,stroke-width:2px
+  linkStyle 118 stroke:#be123c,stroke-width:2px
+  linkStyle 119 stroke:#5b8c00,stroke-width:2px
+  linkStyle 120 stroke:#b45309,stroke-width:2px
   linkStyle 121 stroke:#5b8c00,stroke-width:2px
-  linkStyle 122 stroke:#c2410c,stroke-width:2px
-  linkStyle 123 stroke:#bf3989,stroke-width:2px
-  linkStyle 124 stroke:#a21caf,stroke-width:2px
-  linkStyle 125 stroke:#1a7f37,stroke-width:2px
+  linkStyle 122 stroke:#5b8c00,stroke-width:2px
+  linkStyle 123 stroke:#c2410c,stroke-width:2px
+  linkStyle 124 stroke:#bf3989,stroke-width:2px
+  linkStyle 125 stroke:#a21caf,stroke-width:2px
   linkStyle 126 stroke:#1a7f37,stroke-width:2px
-  linkStyle 127 stroke:#9a6700,stroke-width:2px
-  linkStyle 128 stroke:#a21caf,stroke-width:2px
-  linkStyle 129 stroke:#0891b2,stroke-width:2px
-  linkStyle 130 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 131 stroke:#0891b2,stroke-width:2px
-  linkStyle 132 stroke:#b45309,stroke-width:2px
-  linkStyle 133 stroke:#be123c,stroke-width:2px
-  linkStyle 134 stroke:#65a30d,stroke-width:2px
-  linkStyle 135 stroke:#5b8c00,stroke-width:2px
-  linkStyle 136 stroke:#0f766e,stroke-width:2px
-  linkStyle 137 stroke:#c026d3,stroke-width:2px
+  linkStyle 127 stroke:#1a7f37,stroke-width:2px
+  linkStyle 128 stroke:#9a6700,stroke-width:2px
+  linkStyle 129 stroke:#a21caf,stroke-width:2px
+  linkStyle 130 stroke:#0891b2,stroke-width:2px
+  linkStyle 131 stroke:#4d7c0f,stroke-width:2px
+  linkStyle 132 stroke:#0891b2,stroke-width:2px
+  linkStyle 133 stroke:#b45309,stroke-width:2px
+  linkStyle 134 stroke:#be123c,stroke-width:2px
+  linkStyle 135 stroke:#65a30d,stroke-width:2px
+  linkStyle 136 stroke:#5b8c00,stroke-width:2px
+  linkStyle 137 stroke:#0f766e,stroke-width:2px
   linkStyle 138 stroke:#c026d3,stroke-width:2px
-  linkStyle 139 stroke:#b45309,stroke-width:2px
+  linkStyle 139 stroke:#c026d3,stroke-width:2px
   linkStyle 140 stroke:#b45309,stroke-width:2px
-  linkStyle 141 stroke:#be123c,stroke-width:2px
-  linkStyle 142 stroke:#5b8c00,stroke-width:2px
-  linkStyle 143 stroke:#c026d3,stroke-width:2px
-  linkStyle 144 stroke:#bf3989,stroke-width:2px
-  linkStyle 145 stroke:#d73a4a,stroke-width:2px
-  linkStyle 146 stroke:#7c3aed,stroke-width:2px
-  linkStyle 147 stroke:#0e7490,stroke-width:2px
-  linkStyle 148 stroke:#be123c,stroke-width:2px
+  linkStyle 141 stroke:#b45309,stroke-width:2px
+  linkStyle 142 stroke:#be123c,stroke-width:2px
+  linkStyle 143 stroke:#5b8c00,stroke-width:2px
+  linkStyle 144 stroke:#c026d3,stroke-width:2px
+  linkStyle 145 stroke:#bf3989,stroke-width:2px
+  linkStyle 146 stroke:#d73a4a,stroke-width:2px
+  linkStyle 147 stroke:#7c3aed,stroke-width:2px
+  linkStyle 148 stroke:#0e7490,stroke-width:2px
   linkStyle 149 stroke:#be123c,stroke-width:2px
-  linkStyle 150 stroke:#0891b2,stroke-width:2px
-  linkStyle 151 stroke:#be123c,stroke-width:2px
-  linkStyle 152 stroke:#b45309,stroke-width:2px
-  linkStyle 153 stroke:#5b8c00,stroke-width:2px
-  linkStyle 154 stroke:#7c3aed,stroke-width:2px
-  linkStyle 155 stroke:#9a6700,stroke-width:2px
-  linkStyle 156 stroke:#0e7490,stroke-width:2px
-  linkStyle 157 stroke:#7c3aed,stroke-width:2px
-  linkStyle 158 stroke:#be123c,stroke-width:2px
-  linkStyle 159 stroke:#2563eb,stroke-width:2px
-  linkStyle 160 stroke:#5b8c00,stroke-width:2px
-  linkStyle 161 stroke:#1a7f37,stroke-width:2px
-  linkStyle 162 stroke:#d73a4a,stroke-width:2px
-  linkStyle 163 stroke:#bf3989,stroke-width:2px
-  linkStyle 164 stroke:#5b8c00,stroke-width:2px
-  linkStyle 165 stroke:#65a30d,stroke-width:2px
-  linkStyle 166 stroke:#0891b2,stroke-width:2px
-  linkStyle 167 stroke:#d73a4a,stroke-width:2px
-  linkStyle 168 stroke:#5b8c00,stroke-width:2px
-  linkStyle 169 stroke:#d73a4a,stroke-width:2px
-  linkStyle 170 stroke:#be123c,stroke-width:2px
-  linkStyle 171 stroke:#d73a4a,stroke-width:2px
-  linkStyle 172 stroke:#be123c,stroke-width:2px
-  linkStyle 173 stroke:#d73a4a,stroke-width:2px
-  linkStyle 174 stroke:#bf3989,stroke-width:2px
-  linkStyle 175 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 176 stroke:#1a7f37,stroke-width:2px
-  linkStyle 177 stroke:#65a30d,stroke-width:2px
+  linkStyle 150 stroke:#be123c,stroke-width:2px
+  linkStyle 151 stroke:#0891b2,stroke-width:2px
+  linkStyle 152 stroke:#be123c,stroke-width:2px
+  linkStyle 153 stroke:#b45309,stroke-width:2px
+  linkStyle 154 stroke:#5b8c00,stroke-width:2px
+  linkStyle 155 stroke:#7c3aed,stroke-width:2px
+  linkStyle 156 stroke:#9a6700,stroke-width:2px
+  linkStyle 157 stroke:#0e7490,stroke-width:2px
+  linkStyle 158 stroke:#7c3aed,stroke-width:2px
+  linkStyle 159 stroke:#be123c,stroke-width:2px
+  linkStyle 160 stroke:#2563eb,stroke-width:2px
+  linkStyle 161 stroke:#9a6700,stroke-width:2px
+  linkStyle 162 stroke:#1a7f37,stroke-width:2px
+  linkStyle 163 stroke:#d73a4a,stroke-width:2px
+  linkStyle 164 stroke:#bf3989,stroke-width:2px
+  linkStyle 165 stroke:#5b8c00,stroke-width:2px
+  linkStyle 166 stroke:#65a30d,stroke-width:2px
+  linkStyle 167 stroke:#0891b2,stroke-width:2px
+  linkStyle 168 stroke:#d73a4a,stroke-width:2px
+  linkStyle 169 stroke:#5b8c00,stroke-width:2px
+  linkStyle 170 stroke:#d73a4a,stroke-width:2px
+  linkStyle 171 stroke:#be123c,stroke-width:2px
+  linkStyle 172 stroke:#d73a4a,stroke-width:2px
+  linkStyle 173 stroke:#be123c,stroke-width:2px
+  linkStyle 174 stroke:#d73a4a,stroke-width:2px
+  linkStyle 175 stroke:#bf3989,stroke-width:2px
+  linkStyle 176 stroke:#4d7c0f,stroke-width:2px
+  linkStyle 177 stroke:#1a7f37,stroke-width:2px
   linkStyle 178 stroke:#65a30d,stroke-width:2px
-  linkStyle 179 stroke:#8250df,stroke-width:2px
+  linkStyle 179 stroke:#65a30d,stroke-width:2px
   linkStyle 180 stroke:#8250df,stroke-width:2px
-  linkStyle 181 stroke:#9a6700,stroke-width:2px
+  linkStyle 181 stroke:#8250df,stroke-width:2px
   linkStyle 182 stroke:#9a6700,stroke-width:2px
-  linkStyle 183 stroke:#0891b2,stroke-width:2px
-  linkStyle 184 stroke:#8250df,stroke-width:2px
-  linkStyle 185 stroke:#2563eb,stroke-width:2px
-  linkStyle 186 stroke:#9a6700,stroke-width:2px
-  linkStyle 187 stroke:#1d4ed8,stroke-width:2px
-  linkStyle 188 stroke:#bf3989,stroke-width:2px
-  linkStyle 189 stroke:#5b8c00,stroke-width:2px
+  linkStyle 183 stroke:#9a6700,stroke-width:2px
+  linkStyle 184 stroke:#0891b2,stroke-width:2px
+  linkStyle 185 stroke:#8250df,stroke-width:2px
+  linkStyle 186 stroke:#2563eb,stroke-width:2px
+  linkStyle 187 stroke:#9a6700,stroke-width:2px
+  linkStyle 188 stroke:#1d4ed8,stroke-width:2px
+  linkStyle 189 stroke:#bf3989,stroke-width:2px
   linkStyle 190 stroke:#5b8c00,stroke-width:2px
-  linkStyle 191 stroke:#d73a4a,stroke-width:2px
+  linkStyle 191 stroke:#5b8c00,stroke-width:2px
   linkStyle 192 stroke:#d73a4a,stroke-width:2px
-  linkStyle 193 stroke:#c026d3,stroke-width:2px
+  linkStyle 193 stroke:#d73a4a,stroke-width:2px
+  linkStyle 194 stroke:#c026d3,stroke-width:2px
 ```
diff --git a/docs/migrations.md b/docs/migrations.md
index a7932b2ee..968d902a9 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -34,6 +34,8 @@
 | Branded script names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedScriptNames`, `BKIT_SCRIPT_RENAMES`, called by `seedCorePackageJsonScripts` before `ensurePackageJsonScripts`) | `package.json` scripts `lint:prose`, `slop:delta`, `graph` and `graph:{check,clean,graphml,refresh,rollup,scoped,tree,update}` → `bkit:` + the same name; the old key is deleted and the old token in other script values and default gate chains is rewritten. A pair whose old and new keys both exist is left as it is with a warning; a `graph*` script whose value is not bkit's (`scripts/graphify/bkit-`) is the consumer's own and stays. Original indent kept. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Branded script tokens in hooks and CI | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedFileTokens`, called by `runBkitDocs`) | `pnpm lint:prose`, `pnpm slop:delta` and `pnpm graph*` tokens in `.husky/pre-commit`, `.husky/pre-push` and the `bkit.testing.ciWorkflow` file → the `bkit:` names, for the pairs the package.json migration acts on. A name it cannot reach (e.g. `pnpm --filter web lint:prose`) is warned with file and line. Files are rewritten in place and recorded as `unhashed` writes, so `canonicalHashes` never holds them. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Branded CI script files | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedTemplateFiles`, `SHIPPED_CI_SCRIPT_HASHES`, called by `runBkitDocs` before `migrateBrandedFileTokens`) | A unit under `scripts/ci/` (`check-capstone`, `check-dependency-audit` + `accepted-advisories.json`, `check-accepted-divergences` + `accepted-divergences.json`, `lanes/resolve-push-base`, with their `.test.mjs`) whose `.mjs` files all match a shipped release and whose `bkit-` targets are absent moves to the `bkit-` names; every `scripts/ci/<old>` path in the hooks, the CI workflow, `bkit-trivy.yml` and package.json scripts is rewritten. An edited unit or an existing target is left with a warning naming the manual move. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Branded check names | `.bkit/core/engine/install/modules/core.ts` (`migrateBrandedCheckNames`, called by `runBkitDocs`) | Exact shipped old `name:` lines in `.github/workflows/bkit-cloud.yml` (`context`, `claude`, `opencode` jobs), `bkit-renovate.yml` (`Renovate`) and `bkit-trivy.yml` (`Trivy`) → `bkit-*`; a job `name:` is inserted under `renovate:` / `trivy:` when the workflow name was rewritten and the job has none; the old `bkit-stub:health` block in the `bkit.testing.ciWorkflow` file → the current block. A customised line stays. One log line per renamed check names old and new and says to update branch protection. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule or a taken target stays with a warning naming the manual move. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay. Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
