diff --git a/.bkit/core/engine/audits/workflows/close-squash.integration.test.ts b/.bkit/core/engine/audits/workflows/close-squash.integration.test.ts
index 605afa273..0e803ca98 100644
--- a/.bkit/core/engine/audits/workflows/close-squash.integration.test.ts
+++ b/.bkit/core/engine/audits/workflows/close-squash.integration.test.ts
@@ -59,8 +59,8 @@ interface Fixture {
 // A main checkout on dev, a remote, and feat/{FID} checked out in
 // .worktrees/{FID} carrying this run's design or plan doc.
 function initFixture(
-  workflow: "design" | "plan",
-  opts: { docOnDev?: string; fid?: string; tracker?: string } = {},
+  workflow: "design" | "plan" | "build",
+  opts: { docOnDev?: string; fid?: string; tracker?: string; pushFeature?: boolean } = {},
 ): Fixture {
   const FID = opts.fid ?? DEFAULT_FID;
   const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-close-squash-"));
@@ -99,7 +99,7 @@ function initFixture(
   );
   git(wt, "add", "-A");
   git(wt, "commit", "-q", "-m", "feature work");
-  git(wt, "push", "-q", "origin", `feat/${FID}`);
+  if (opts.pushFeature !== false) git(wt, "push", "-q", "origin", `feat/${FID}`);
   // `bkit worktrees setup` marks the worktrees it creates; close removes only those.
   const common = git(repo, "rev-parse", "--path-format=absolute", "--git-common-dir");
   write(path.join(common, "bkit-outbox", FID, ".worktree-owned"), "");
@@ -271,3 +271,169 @@ describe("bkit-design.md close with no issue", () => {
     expect(printed.body).not.toContain("bkit:issue=");
   });
 });
+
+// ---------------------------------------------------------------------------
+// bkit-build.md held close (publish=false): Step 15's summary line, then Step 16's held fence,
+// run as written against a real repo, bare origin and worktree.
+// ---------------------------------------------------------------------------
+
+const BUILD_MD = path.resolve(".bkit/core/workflows/bkit-build.md");
+
+/** The trimmed lines of every `bash` fence in `text` that contains `needle`, in order. */
+function fenceLines(text: string, needle: string): string[] {
+  const out: string[] = [];
+  for (const m of text.matchAll(/```bash\n([\s\S]*?)```/g)) {
+    if (m[1]!.includes(needle))
+      out.push(
+        ...m[1]!
+          .split("\n")
+          .map((l) => l.trim())
+          .filter(Boolean),
+      );
+  }
+  return out;
+}
+
+/** Step 15's `workflows summary` line and Step 16's held close fence, placeholders unfilled. */
+function heldScript(): string[] {
+  const md = fs.readFileSync(BUILD_MD, "utf-8");
+  const step15 = md.slice(md.indexOf("## 🧠 Step 15 — Summary"), md.indexOf("### 🔒 Gate 15"));
+  const step16 = md.slice(md.indexOf("## 🤖 Step 16 — Close Workflow"));
+  const held = step16.slice(step16.indexOf("**Held close**"), step16.indexOf("**Publish close**"));
+  const summary = fenceLines(step15, '"{BKIT}" workflows summary');
+  const close = fenceLines(held, '"{BKIT}" workflows close');
+  expect(summary, "Step 15 summary line not found").toHaveLength(1);
+  expect(close.length, "held close fence not found").toBeGreaterThan(0);
+  return [...summary, ...close];
+}
+
+const refs = (bare: string) => git(bare, "for-each-ref", "--format=%(refname) %(objectname)");
+
+describe("bkit-build.md held close", () => {
+  const BUILD_FID = "999-held-build";
+
+  /** A build run opened the way Steps 1-2 open it: a lock, a `workflow-started` row. */
+  function startBuild(fx: Fixture, sessionDir: string, bin: string) {
+    const wt = path.join(fx.repo, ".worktrees", BUILD_FID);
+    const status = path.join(wt, `docs/plans/${MONTH}/logs/${BUILD_FID}/status.jsonl`);
+    fs.writeFileSync(status, "");
+    git(wt, "add", "-A");
+    git(wt, "commit", "-q", "-m", "reset status");
+    const env = {
+      ...process.env,
+      BKIT_RUNTIME: "LOCAL",
+      GIT_DIR: git(wt, "rev-parse", "--absolute-git-dir"),
+      GIT_WORK_TREE: wt,
+    };
+    const run = (args: string[], cwd: string) =>
+      spawnSync(bin, args, { cwd, encoding: "utf-8", env });
+    const lock = run(
+      ["locks", "acquire", "--kind=workflow", "--workflow=build", `--fid=${BUILD_FID}`],
+      fx.repo,
+    );
+    expect(lock.status, lock.stderr).toBe(0);
+    const token = /token: "?([^"\s]+)"?/.exec(lock.stdout)?.[1];
+    expect(token, lock.stdout).toBeTruthy();
+    const start = run(
+      [
+        "workflows",
+        "start",
+        "--workflow=build",
+        `--fid=${BUILD_FID}`,
+        `--month=${MONTH}`,
+        "--lock-held",
+        `--token=${token}`,
+      ],
+      wt,
+    );
+    expect(start.status, start.stderr).toBe(0);
+    fs.mkdirSync(sessionDir, { recursive: true });
+    fs.writeFileSync(path.join(sessionDir, "prompt.md"), "build it publish=false\n");
+    return { wt, status, token: token!, env };
+  }
+
+  function runHeld(fx: Fixture) {
+    const bin = path.join(fx.repo, "node_modules/.bin/bkit");
+    const sessionDir = path.join(path.dirname(fx.repo), "session");
+    const run = startBuild(fx, sessionDir, bin);
+    const script = heldScript()
+      .join("\n")
+      .replaceAll("{BKIT}", bin)
+      .replaceAll("{STATUS}", run.status)
+      .replaceAll("{WORKTREE_PATH}", run.wt)
+      .replaceAll("{FID}", BUILD_FID)
+      .replaceAll("{YYYYMM}", MONTH)
+      .replaceAll("{OWNER_REPO}", "example/example")
+      .replaceAll("{OUTBOX}", path.join(path.dirname(fx.repo), "outbox"))
+      .replaceAll("{BRANCH}", `feat/${BUILD_FID}`)
+      .replaceAll("{SESSION_DIR}", sessionDir)
+      .replaceAll("{LOCK_TOKEN}", run.token)
+      .replaceAll("{PUBLISH}", "false")
+      .replaceAll("{REF}", BUILD_FID);
+    expect(script).not.toMatch(/\{[A-Z_]+\}/);
+    const res = spawnSync("bash", ["-c", script], { cwd: run.wt, encoding: "utf-8", env: run.env });
+    return { ...run, res };
+  }
+
+  const bareOf = (fx: Fixture) => path.join(path.dirname(fx.repo), "remote.git");
+
+  it("held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock", () => {
+    const fx = initFixture("build", { fid: BUILD_FID, pushFeature: false });
+    const before = refs(bareOf(fx));
+    expect(before).not.toContain(`feat/${BUILD_FID}`);
+
+    const { res } = runHeld(fx);
+
+    expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
+    expect(refs(bareOf(fx))).toBe(before);
+    expect(git(fx.repo, "branch", "--list", `feat/${BUILD_FID}`)).toContain(`feat/${BUILD_FID}`);
+    expect(fs.existsSync(path.join(fx.repo, ".worktrees", BUILD_FID))).toBe(true);
+    expect(fs.existsSync(path.join(fx.repo, `docs/plans/${MONTH}/logs/${BUILD_FID}/.lock`))).toBe(
+      false,
+    );
+    expect(remoteDev(fx.repo)).toBe(fx.devBefore);
+  });
+
+  it("held close records the rows, summary and worktree-only roadmap row", () => {
+    const fx = initFixture("build", { fid: BUILD_FID, pushFeature: false });
+
+    const { res, wt, status } = runHeld(fx);
+
+    expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
+    const rows = fs
+      .readFileSync(status, "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(rows.find((r) => r.type === "workflow-done")).toMatchObject({
+      workflow: "build",
+      ending: "held",
+      publish: false,
+    });
+    const stats = fs
+      .readFileSync(path.join(wt, ".bkit/stats.jsonl"), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(stats.find((r) => r.kind === "outcome")).toMatchObject({
+      ending: "held",
+      publish: false,
+    });
+    const summary = fs.readFileSync(
+      path.join(wt, `docs/plans/${MONTH}/logs/${BUILD_FID}/build-summary.md`),
+      "utf-8",
+    );
+    expect(summary).toContain("Publish: held");
+    expect(summary).toContain("Docs: not synced");
+    expect(res.stdout).toContain("Docs: not synced");
+    const roadmap = fs
+      .readFileSync(path.join(wt, ".bkit/issues.jsonl"), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(roadmap.find((r) => r.kind === "feature")).toMatchObject({ key: BUILD_FID });
+    // dev carries no row: the held close never mirrors.
+    expect(git(fx.repo, "show", "origin/dev:docs/roadmap.md")).not.toContain(BUILD_FID);
+    expect(fs.existsSync(path.join(fx.repo, ".bkit/issues.jsonl"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts b/.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts
index af89d9b21..5749052dc 100644
--- a/.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts
+++ b/.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts
@@ -32,6 +32,21 @@ function extractStep6Line(): string {
   return line!;
 }
 
+/** The first line of `stepHeading`'s step in `file` that starts with `prefix`, trimmed. */
+function extractStepLine(stepHeading: RegExp, prefix: string, file = SHIP_MD): string {
+  const content = fs.readFileSync(file, "utf-8");
+  const start = content.search(stepHeading);
+  expect(start, `${stepHeading} heading not found`).toBeGreaterThan(-1);
+  const end = content.indexOf("\n### ", start);
+  const line = content
+    .slice(start, end === -1 ? undefined : end)
+    .split("\n")
+    .map((l) => l.trim())
+    .find((l) => l.startsWith(prefix));
+  expect(line, `${stepHeading} line starting ${prefix} not found`).toBeDefined();
+  return line!;
+}
+
 let tmpDir: string;
 let worktree: string;
 
@@ -101,3 +116,221 @@ describe("Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row
     expect(runStep6(stub("not json", 1))).not.toBe(0);
   });
 });
+
+const GH_FIXTURE = path.join(REPO_ROOT, "tests", "fixtures", "gh");
+const PR_NUMBER = 7;
+const PR_URL = `https://github.com/example/example/pull/${PR_NUMBER}`;
+
+/**
+ * A `gh` on `tmpDir/bin` that records every argv to `tmpDir/gh-calls.jsonl`, answers `pr list` /
+ * `pr create` / `pr view` / `pr merge` from a small state file and the bare origin's refs, and
+ * hands every `gh api …` call (the CI gate's reads) to `tests/fixtures/gh/bin/gh`.
+ */
+function writeGhShim(): void {
+  const bin = path.join(tmpDir, "bin");
+  fs.mkdirSync(bin, { recursive: true });
+  const script = `#!/usr/bin/env node
+const fs = require("node:fs");
+const cp = require("node:child_process");
+const argv = process.argv.slice(2);
+const dir = process.env.SHIM_DIR;
+fs.appendFileSync(dir + "/gh-calls.jsonl", JSON.stringify({ argv }) + "\\n");
+const stateFile = dir + "/pr-state.json";
+const read = () => (fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf-8")) : null);
+const flag = (name) => { const i = argv.indexOf(name); return i === -1 ? undefined : argv[i + 1]; };
+const headOid = () => cp.spawnSync("git", ["--git-dir=" + process.env.SHIM_BARE, "rev-parse", "refs/heads/" + process.env.SHIM_BRANCH], { encoding: "utf-8" }).stdout.trim();
+const fields = (s) => ({
+  number: ${PR_NUMBER}, url: "${PR_URL}", state: s.state, baseRefName: s.base,
+  headRefName: process.env.SHIM_BRANCH, headRefOid: headOid(), title: s.title,
+  mergeCommit: s.state === "MERGED" ? { oid: s.mergeOid } : null, mergeable: "MERGEABLE",
+});
+const [a, b] = argv;
+if (a === "pr" && b === "list") { const s = read(); console.log(JSON.stringify(s ? [fields(s)] : [])); }
+else if (a === "pr" && b === "create") {
+  fs.writeFileSync(stateFile, JSON.stringify({ state: "OPEN", base: flag("--base"), title: flag("--title") }));
+  console.log("${PR_URL}");
+}
+else if (a === "pr" && b === "view") { const s = read(); if (!s) { console.error("no pull requests found"); process.exit(1); } console.log(JSON.stringify(fields(s))); }
+else if (a === "pr" && b === "merge") {
+  const s = read(); s.state = "MERGED"; s.mergeOid = headOid();
+  fs.writeFileSync(stateFile, JSON.stringify(s));
+}
+else if (a === "run" && b === "list") console.log("[]");
+else if (a === "api") {
+  const res = cp.spawnSync("${path.join(GH_FIXTURE, "bin", "gh")}", argv, { stdio: "inherit", env: { ...process.env, BKIT_FAKE_GH_FIXTURE_ROOT: process.env.SHIM_FIXTURES } });
+  process.exit(res.status ?? 1);
+}
+else { console.error("gh shim: unhandled " + argv.join(" ")); process.exit(1); }
+`;
+  fs.writeFileSync(path.join(bin, "gh"), script, { mode: 0o755 });
+}
+
+/** The argv of each recorded `gh` call, in order. */
+function ghCalls(): string[][] {
+  const file = path.join(tmpDir, "gh-calls.jsonl");
+  if (!fs.existsSync(file)) return [];
+  return fs
+    .readFileSync(file, "utf-8")
+    .trim()
+    .split("\n")
+    .filter(Boolean)
+    .map((l) => (JSON.parse(l) as { argv: string[] }).argv);
+}
+
+/** The first recorded `gh <a> <b> …` argv; fails the test when none was recorded. */
+function ghCall(a: string, b: string): string[] {
+  const call = ghCalls().find((c) => c[0] === a && c[1] === b);
+  expect(call, `gh ${a} ${b} was not called`).toBeDefined();
+  return call!;
+}
+
+/** The value after `flag` in a recorded argv. */
+function flagValue(argv: string[], flag: string): string | undefined {
+  const at = argv.indexOf(flag);
+  expect(at, `${flag} missing from gh ${argv.join(" ")}`).toBeGreaterThan(-1);
+  return argv[at + 1];
+}
+
+/** The URL argument of every recorded `gh api` call. */
+function ghApiUrls(): string[] {
+  return ghCalls()
+    .filter((c) => c[0] === "api")
+    .map((c) => c[1] ?? "");
+}
+
+describe("deferred landing of a held build (ship, matrix: held → landed)", () => {
+  const DEFERRED_FID = "715-held-landing";
+  const MONTH = "202610";
+  const BRANCH = `feat/${DEFERRED_FID}`;
+  let bare: string;
+  let repo: string;
+  let env: NodeJS.ProcessEnv;
+  let bkit: string;
+
+  const sh = (cwd: string, ...args: string[]): string => {
+    const res = spawnSync("git", args, { cwd, encoding: "utf-8", env });
+    if (res.status !== 0) throw new Error(`git ${args.join(" ")}: ${res.stderr}`);
+    return res.stdout.trim();
+  };
+  const bareRefs = () =>
+    spawnSync("git", [`--git-dir=${bare}`, "for-each-ref", "--format=%(refname) %(objectname)"], {
+      encoding: "utf-8",
+    }).stdout.trim();
+
+  /** A held build's leftovers: `dev` on the bare origin, `feat/{FID}` local-only with a commit. */
+  beforeEach(() => {
+    bare = path.join(tmpDir, "origin.git");
+    repo = path.join(tmpDir, "repo");
+    spawnSync("git", ["init", "-q", "--bare", "-b", "dev", bare]);
+    fs.mkdirSync(repo);
+    env = {
+      ...process.env,
+      GIT_DIR: path.join(repo, ".git"),
+      GIT_WORK_TREE: repo,
+      BKIT_RUNTIME: "LOCAL",
+      SHIM_DIR: tmpDir,
+      SHIM_BARE: bare,
+      SHIM_BRANCH: BRANCH,
+      SHIM_FIXTURES: path.join(tmpDir, "gh-fixtures"),
+      PATH: [path.join(tmpDir, "bin"), process.env.PATH].join(path.delimiter),
+    };
+    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: repo, env });
+    sh(repo, "config", "user.email", "t@t.t");
+    sh(repo, "config", "user.name", "t");
+    sh(repo, "remote", "add", "origin", bare);
+    fs.writeFileSync(path.join(repo, "app.ts"), "export {};\n");
+    sh(repo, "add", "-A");
+    sh(repo, "commit", "-q", "-m", "init");
+    sh(repo, "push", "-q", "origin", "dev");
+    sh(repo, "checkout", "-q", "-b", BRANCH);
+    fs.mkdirSync(path.join(repo, "docs", "plans", MONTH, "logs", DEFERRED_FID), {
+      recursive: true,
+    });
+    fs.writeFileSync(
+      path.join(repo, "docs", "plans", MONTH, "logs", DEFERRED_FID, "status.jsonl"),
+      "",
+    );
+    fs.writeFileSync(path.join(repo, "app.ts"), "export const built = 1;\n");
+    sh(repo, "add", "-A");
+    sh(repo, "commit", "-q", "-m", "feat: held build");
+    sh(repo, "fetch", "-q", "origin");
+    bkit = realBkit();
+    writeGhShim();
+    // CI fixtures keyed by the head the PR will carry once pushed.
+    const head = sh(repo, "rev-parse", "HEAD");
+    const root = path.join(tmpDir, "gh-fixtures");
+    for (const d of ["runs", "jobs"]) fs.mkdirSync(path.join(root, d), { recursive: true });
+    const runs = fs
+      .readFileSync(path.join(GH_FIXTURE, "runs", "green-capstone.json"), "utf-8")
+      .replaceAll("green-capstone", head);
+    fs.writeFileSync(path.join(root, "runs", `${head}.json`), runs);
+    fs.copyFileSync(
+      path.join(GH_FIXTURE, "jobs", "1001.json"),
+      path.join(root, "jobs", "1001.json"),
+    );
+  });
+
+  const fill = (line: string, extra: Record<string, string> = {}): string => {
+    const values: Record<string, string> = {
+      BKIT: bkit,
+      FID: DEFERRED_FID,
+      YYYYMM: MONTH,
+      ISSUE_ID: "715",
+      STATUS: path.join(repo, "docs", "plans", MONTH, "logs", DEFERRED_FID, "status.jsonl"),
+      SHIP_BRANCH: BRANCH,
+      PR_NUMBER: String(PR_NUMBER),
+      OWNER_REPO: "example/example",
+      OUTBOX: path.join(tmpDir, "outbox"),
+      LABEL_FLAGS: "",
+      ...extra,
+    };
+    const out = line.replace(/\{([A-Z_]+)\}/g, (m, k: string) => values[k] ?? m);
+    expect(out).not.toMatch(/\{[A-Z_]+\}/);
+    return out;
+  };
+
+  const run = (script: string) =>
+    spawnSync("bash", ["-c", script], { cwd: repo, encoding: "utf-8", env });
+
+  /** Step 2's no-PR route: the probe finds none, then the push and the PR open. */
+  function openPr() {
+    const step2 = /^## .*Step 2 —/m;
+    const probe = extractStepLine(step2, '"{BKIT}" prs probe --head=');
+    const push = extractStepLine(step2, '"{BKIT}" branches push --mode=plain --set-upstream');
+    const open = extractStepLine(step2, '"{BKIT}" prs open ');
+    expect(run(fill(probe)).status, "no PR exists, so the probe exits 1").toBe(1);
+    const res = run(`OPEN_EXIT=0\n${fill(push)}\n${fill(open)}`);
+    expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
+  }
+
+  it("ship pushes the held branch and opens a dev PR", () => {
+    expect(bareRefs()).not.toContain(BRANCH);
+    const head = sh(repo, "rev-parse", "HEAD");
+
+    openPr();
+
+    expect(bareRefs()).toContain(`refs/heads/${BRANCH} ${head}`);
+    const create = ghCall("pr", "create");
+    expect(flagValue(create, "--base")).toBe("dev");
+    expect(flagValue(create, "--head")).toBe(BRANCH);
+  });
+
+  it("ship gates on CI and merges the pinned head", () => {
+    openPr();
+    const head = sh(repo, "rev-parse", "HEAD");
+    const step10 = /^## .*Step 10 —/m;
+    const gate = extractStepLine(step10, '"{BKIT}" runs gate ');
+    const merge = extractStepLine(step10, '"{BKIT}" prs merge ');
+    const values = { VALIDATED_HEAD: head, GATE_HEAD: head };
+
+    const gated = run(fill(gate, values));
+    expect(gated.status, `${gated.stdout}\n${gated.stderr}`).toBe(0);
+    const merged = run(fill(merge, values));
+    expect(merged.status, `${merged.stdout}\n${merged.stderr}`).toBe(0);
+
+    expect(ghApiUrls().some((u) => u.includes(`head_sha=${head}`))).toBe(true);
+    const mergeCall = ghCall("pr", "merge");
+    expect(flagValue(mergeCall, "--match-head-commit")).toBe(head);
+    expect(mergeCall).toContain("--squash");
+  });
+});
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 5c18a3170..302b6f782 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -1195,6 +1195,8 @@ describe("locks", () => {
   });
 });
 
+const FINAL_RETURN_CLOSES = { design: 1, plan: 1, build: 2, debug: 1, ship: 1 } as const;
+
 describe("final return at the close", () => {
   it.each(PHASES)(
     "%s builds its final message in `workflows close` and displays it verbatim",
@@ -1204,8 +1206,9 @@ describe("final return at the close", () => {
       const close = commandLines(text, "workflows close").filter((l) =>
         l.includes("--final-return"),
       );
-      expect(close, name).toHaveLength(1);
-      expect(close[0]).toContain('--session-dir="{SESSION_DIR}"');
+      // Build closes two ways: the publish close and the held close.
+      expect(close, name).toHaveLength(FINAL_RETURN_CLOSES[name]);
+      for (const line of close) expect(line).toContain('--session-dir="{SESSION_DIR}"');
       // Setup tips are appended by the engine, never collected by the workflow.
       expect(commandLines(text, "tips"), name).toEqual([]);
       expect(text).not.toContain("{BKIT_TIPS}");
@@ -1770,3 +1773,115 @@ describe("input files", () => {
     );
   });
 });
+
+// ---------------------------------------------------------------------------
+// Build's ending: `publish` resolved once in Step 2, the held close in Step 16.
+// ---------------------------------------------------------------------------
+
+describe("build publish ending", () => {
+  const build = workflow("build");
+  const step2 = () => section(build, /Step 2 — Worktree Setup/);
+  const step15 = () => section(build, /Step 15 — Summary/);
+  const step16 = () => section(build, /Step 16 — Close Workflow/);
+  /** The held fence and the publish path of Step 16, split at the two path labels. */
+  const paths = () => {
+    const text = step16();
+    const held = text.indexOf("**Held close**");
+    const pub = text.indexOf("**Publish close**");
+    expect(held, "no **Held close** label").toBeGreaterThanOrEqual(0);
+    expect(pub, "no **Publish close** label").toBeGreaterThan(held);
+    return {
+      held: text.slice(held, pub),
+      publish: text.slice(pub, text.indexOf("### 🔒 Gate 16")),
+      gate: text.slice(text.indexOf("### 🔒 Gate 16")),
+    };
+  };
+
+  it("resolves publish through status route", () => {
+    const text = step2();
+    const route = commandLines(text, "status route");
+    expect(route).toHaveLength(1);
+    expect(route[0]).toContain("--workflow=build");
+    expect(route[0]).toContain('--file="{STATUS}"');
+    expect(route[0]).toContain('--prompt-file="{SESSION_DIR}/prompt.md"');
+    expect(text).toContain("`publish` as `{PUBLISH}`");
+    expect(text).toContain("`publishSource` as `{PUBLISH_SOURCE}`");
+    const assert = commandLines(text, "runtime assert");
+    expect(assert).toHaveLength(1);
+    expect(assert[0]).not.toContain("/dev/null");
+  });
+
+  it("re-derives publish on resume", () => {
+    // Steps 1-2 run again on every resume, so the only place `{PUBLISH}` is set is Step 2,
+    // after `runtime row`, and nothing reads it before.
+    const first = build.indexOf("{PUBLISH}");
+    expect(first).toBeGreaterThan(build.indexOf("## 🤖 Step 2 — Worktree Setup"));
+    const text = step2();
+    expect(text.indexOf("status route --workflow=build")).toBeGreaterThan(
+      text.indexOf("runtime row"),
+    );
+    expect(build).toContain("Steps 1-2 always run again");
+  });
+
+  it("warns when a non-LOCAL run resolves publish false", () => {
+    const text = step2();
+    expect(text).toContain("`{PUBLISH_SOURCE}` = `coerced`");
+    expect(text).toMatch(/Warning: publish=false[^\n]*publishes/);
+  });
+
+  it("skips push, PR and CI on a held close", () => {
+    const { held } = paths();
+    for (const verb of [
+      "branches push",
+      "prs probe",
+      "prs open",
+      "runs dispatch",
+      "branches scan-diff",
+      "branches force-build",
+    ])
+      expect(commandLines(held, verb), verb).toEqual([]);
+    const close = commandLines(held, "workflows close");
+    expect(close).toHaveLength(1);
+    expect(close[0]).toContain("--ending=held --publish=false --record-step");
+    expect(commandLines(held, "locks release")).toHaveLength(1);
+    expect(commandLines(held, "issues labels")[0]).toContain("--board=review");
+    expect(held).toContain("built locally, not published");
+  });
+
+  it("keeps the publish=true close path", () => {
+    const { publish } = paths();
+    for (const verb of ["prs probe", "branches scan-diff", "prs open", "runs dispatch"])
+      expect(commandLines(publish, verb).length, verb).toBeGreaterThan(0);
+    expect(commandLines(publish, "branches push").join("\n")).toContain("--require-ci");
+    expect(publish).toContain("Final return: display `{FINAL_RETURN}` verbatim");
+  });
+
+  it("appends the held roadmap row without roadmap mirror", () => {
+    const { held, publish } = paths();
+    const row = commandLines(held, "roadmap feature");
+    expect(row).toHaveLength(1);
+    expect(row[0]).toContain('--root="{WORKTREE_PATH}" --workflow=build --fid={FID}');
+    expect(held).not.toContain("roadmap mirror");
+    expect(commandLines(publish, "roadmap mirror")).toHaveLength(1);
+  });
+
+  it("makes Gate 15 conditional on the held path", () => {
+    const text = step15();
+    expect(commandLines(text, "workflows summary")[0]).toContain("--publish={PUBLISH}");
+    const gate = text.slice(text.indexOf("### 🔒 Gate 15"));
+    expect(gate).toMatch(/- \[ \] Open-PR probe ran \(publish=true only\)/);
+    expect(gate).toMatch(/- \[ \] Summary commit pushed \(publish=true only\)/);
+    const body = text.slice(0, text.indexOf("### 🔒 Gate 15"));
+    expect(body).toMatch(/\*\*If\*\* `\{PUBLISH\}` = true[^\n]*\n[\s\S]*prs probe/);
+  });
+
+  it("runs only the close gate on the held path", () => {
+    const { gate } = paths();
+    const closeAt = gate.indexOf("--step=build-close-workflow");
+    const prAt = gate.indexOf("--step=build-create-pr");
+    expect(closeAt).toBeGreaterThanOrEqual(0);
+    expect(prAt).toBeGreaterThan(closeAt);
+    expect(gate.slice(closeAt, prAt)).toMatch(/`\{PUBLISH\}` = true only/);
+    expect(gate).toMatch(/`\{PUBLISH\}` = false[^\n]*`build-close-workflow` gate only/);
+  });
+});
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index ff5d178e8..e3f177242 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -249,9 +249,13 @@ _No tracker connected, skip step._
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
    "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
-   "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null
+   "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
-   Hold `file` as `{STATUS}`, `run` as `{RUN}`.
+   Hold `file` as `{STATUS}`, `run` as `{RUN}`. Resolve this run's ending (runs again on every resume):
+   ```bash
+   "{BKIT}" status route --workflow=build --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" || exit 2
+   ```
+   Hold `publish` as `{PUBLISH}`, `publishSource` as `{PUBLISH_SOURCE}`. **If** `{PUBLISH_SOURCE}` = `coerced` → emit: Warning: publish=false needs a local run — this run publishes.
 4. Write the input file — session prompt, issue text, plan (when present):
    ```bash
    "{BKIT}" workflows input --workflow=build --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
@@ -761,10 +765,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 1. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
-   "{BKIT}" workflows summary --workflow=build --file="{STATUS}"
+   "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
+2. Finish; **If** `{PUBLISH}` = true → then probe for a pre-existing open PR on `{BRANCH}` before the push:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
    ```
@@ -775,7 +779,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **If** exit 0 → **Failure Path** with `feat/{FID} already has open PR #{number} to dev — build re-run/resume cannot push into it. Resume via /bkit-debug or close the stale PR.`
    - **If** exit 80 → open PR on `{BRANCH}` via `list_pull_requests` (base `dev`) → found → **Failure Path**; **Else** → sub-step 3.
    - **Else** → sub-step 3.
-3. Push with exactly one command:
+3. **If** `{PUBLISH}` = true → push with exactly one command:
    ```bash
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
@@ -789,8 +793,8 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Failing summary displayed
-- [ ] Open-PR probe ran
-- [ ] Summary commit pushed
+- [ ] Open-PR probe ran (publish=true only)
+- [ ] Summary commit pushed (publish=true only)
 
 ---
 
@@ -798,6 +802,22 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
 
+**Held close** — **If** `{PUBLISH}` = false → run this fence, then sub-steps 11-12 and Gate 16; sub-steps 1-10 do not run:
+
+Append the roadmap row in the worktree only, close the run (`ending: held`, `publish: false`, telemetry, report, artifact links), commit it, release the lock; nothing is pushed:
+
+```bash
+"{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=build --fid={FID} >/dev/null || exit 1
+"{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow held" --ending=held --publish=false --record-step --number=16 --post --title="Built locally, not published" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="Built locally, not published. /bkit-ship {REF} pushes {BRANCH}, opens the PR and lands it." || exit 1
+"{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+```
+
+`REF` empty → `{FID}`. Hold `commentFile` as `{CLOSE_COMMENT_FILE}` and `tracker` as `{CLOSE_TRACKER}`; `{FINAL_RETURN}` = `finalReturn`.
+
+
+
+**Publish close** — **If** `{PUBLISH}` = true:
+
 1. Probe for pre-existing open PR on `{BRANCH}` before PR create:
    ```bash
    "{BKIT}" prs probe --base=dev
@@ -865,11 +885,20 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ### 🔒 Gate 16 — Close Workflow & Create PR
 
+Both paths:
+
 ```bash
 "{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
+```
+
+`{PUBLISH}` = true only:
+
+```bash
 "{BKIT}" steps gate --workflow=build --step=build-create-pr --file="{STATUS}" --artifact={PR_URL}
 ```
 
+`{PUBLISH}` = false → the `build-close-workflow` gate only; the held close commits and pushes nothing, so only these lines apply: `steps gate`, close committed, lock released, final return, issue update attempted, artifact link list posted. `{PUBLISH}` = true → every line applies.
+
 - [ ] Mechanical checks passed (`steps gate`)
 
 
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 587fa89da..cc4393846 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -328,9 +328,13 @@ description: "Build Feature — Autonomous implementation"
    cd "{WORKTREE_PATH}" && mkdir -p "{OUTBOX}" || exit 2
    "{BKIT}" workflows start --workflow=build --fid={FID} --month={YYYYMM} --lock-held --token={LOCK_TOKEN} || exit 1
    "{BKIT}" runtime row --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null || exit 2
-   "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl" >/dev/null
+   "{BKIT}" runtime assert --workflow=build --file="{LOG_DIR}/status.jsonl"
    ```
-   Hold `file` as `{STATUS}`, `run` as `{RUN}`.
+   Hold `file` as `{STATUS}`, `run` as `{RUN}`. Resolve this run's ending (runs again on every resume):
+   ```bash
+   "{BKIT}" status route --workflow=build --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" || exit 2
+   ```
+   Hold `publish` as `{PUBLISH}`, `publishSource` as `{PUBLISH_SOURCE}`. **If** `{PUBLISH_SOURCE}` = `coerced` → emit: Warning: publish=false needs a local run — this run publishes.
 4. Write the input file — session prompt, issue text, plan (when present):
    <!-- bkit:tracker true start -->
    **If** `ISSUE_ID` empty → drop `--description-file` and `--comments-file`.
@@ -843,10 +847,10 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 1. Write `build-summary.md` from this run's status rows and the plan's tasks:
    ```bash
-   "{BKIT}" workflows summary --workflow=build --file="{STATUS}"
+   "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-2. Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
+2. Finish; **If** `{PUBLISH}` = true → then probe for a pre-existing open PR on `{BRANCH}` before the push:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
    ```
@@ -857,7 +861,7 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    - **If** exit 0 → **Failure Path** with `feat/{FID} already has open PR #{number} to dev — build re-run/resume cannot push into it. Resume via /bkit-debug or close the stale PR.`
    - **If** exit 80 → open PR on `{BRANCH}` via `list_pull_requests` (base `dev`) → found → **Failure Path**; **Else** → sub-step 3.
    - **Else** → sub-step 3.
-3. Push with exactly one command:
+3. **If** `{PUBLISH}` = true → push with exactly one command:
    ```bash
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
@@ -871,8 +875,8 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 - [ ] `workflows summary` printed a verdict
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Failing summary displayed
-- [ ] Open-PR probe ran
-- [ ] Summary commit pushed
+- [ ] Open-PR probe ran (publish=true only)
+- [ ] Summary commit pushed (publish=true only)
 
 ---
 
@@ -880,6 +884,36 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
 
+**Held close** — **If** `{PUBLISH}` = false → run this fence, then sub-steps 11-12 and Gate 16; sub-steps 1-10 do not run:
+
+Append the roadmap row in the worktree only, close the run (`ending: held`, `publish: false`, telemetry, report, artifact links), commit it, release the lock; nothing is pushed:
+
+```bash
+"{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=build --fid={FID} >/dev/null || exit 1
+"{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow held" --ending=held --publish=false --record-step --number=16 --post --title="Built locally, not published" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="Built locally, not published. /bkit-ship {REF} pushes {BRANCH}, opens the PR and lands it." || exit 1
+"{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+```
+
+`REF` empty → `{FID}`. Hold `commentFile` as `{CLOSE_COMMENT_FILE}` and `tracker` as `{CLOSE_TRACKER}`; `{FINAL_RETURN}` = `finalReturn`.
+
+<!-- bkit:tracker true start -->
+
+**Skip if** `ISSUE_ID` empty. Set the issue `In review`:
+
+```bash
+"{BKIT}" issues labels --write --board=review --issue={ISSUE_ID} --owner-repo={OWNER_REPO}
+```
+
+**If** `tracker.done` = false **or** `boardWrite.done` = false → apply the printed `labels` / `trackerState` / `board` via the tracker MCP (**Labels** fallback).
+<!-- bkit:tracker true end -->
+
+<!-- bkit:tracker true start -->
+
+**Skip if** `ISSUE_ID` empty. The close posted the built locally, not published comment; **If** `{CLOSE_TRACKER}`.done = false → post the content of `{CLOSE_COMMENT_FILE}` via the tracker MCP (**Comments** fallback).
+<!-- bkit:tracker true end -->
+
+**Publish close** — **If** `{PUBLISH}` = true:
+
 1. Probe for pre-existing open PR on `{BRANCH}` before PR create:
    ```bash
    "{BKIT}" prs probe --base=dev
@@ -979,11 +1013,20 @@ Runs once, after the last group; challenge fix groups pass through here on the w
 
 ### 🔒 Gate 16 — Close Workflow & Create PR
 
+Both paths:
+
 ```bash
 "{BKIT}" steps gate --workflow=build --step=build-close-workflow --file="{STATUS}" || exit 1
+```
+
+`{PUBLISH}` = true only:
+
+```bash
 "{BKIT}" steps gate --workflow=build --step=build-create-pr --file="{STATUS}" --artifact={PR_URL}
 ```
 
+`{PUBLISH}` = false → the `build-close-workflow` gate only; the held close commits and pushes nothing, so only these lines apply: `steps gate`, close committed, lock released, final return, issue update attempted, artifact link list posted. `{PUBLISH}` = true → every line applies.
+
 - [ ] Mechanical checks passed (`steps gate`)
 
 <!-- bkit:tracker true start -->
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 2bfd8520c..abc6d1bf4 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -7180,6 +7180,7 @@ Emit long-branch advisory `[bkit-build] feature branch is {BEHIND_DEV} commits b
 Long-branch advisory emitted
 Blocker check attempted
 Enter worktree, open run, record runtime:
+Hold `publish` as `{PUBLISH}`, `publishSource` as `{PUBLISH_SOURCE}`. **If** `{PUBLISH_SOURCE}` = `coerced` → emit: Warning: publish=false needs a local run — this run publishes.
 Input file written (`workflows input`)
 Merge `origin/dev` when feature branch `docs/` is behind (conflicts: ledgers union, other `docs/` prefer `dev`):
 Check the plan is in task-block form, within the group caps:
@@ -7273,10 +7274,14 @@ Tests executed
 Exhausted test loop routed
 Finish → re-run Step 12:
 Write `build-summary.md` from this run's status rows and the plan's tasks:
-Finish, then probe for a pre-existing open PR on `{BRANCH}` before the push:
+Finish; **If** `{PUBLISH}` = true → then probe for a pre-existing open PR on `{BRANCH}` before the push:
 **If** exit 80 → open PR on `{BRANCH}` via `list_pull_requests` (base `dev`) → found → **Failure Path**; **Else** → sub-step 3.
 **Else** → sub-step 3.
-[workflow-pushes] Push with exactly one command:
+[workflow-pushes] **If** `{PUBLISH}` = true → push with exactly one command:
+Open-PR probe ran (publish=true only)
+**Held close** — **If** `{PUBLISH}` = false → run this fence, then sub-steps 11-12 and Gate 16; sub-steps 1-10 do not run:
+`REF` empty → `{FID}`. Hold `commentFile` as `{CLOSE_COMMENT_FILE}` and `tracker` as `{CLOSE_TRACKER}`; `{FINAL_RETURN}` = `finalReturn`.
+**Skip if** `ISSUE_ID` empty. The close posted the built locally, not published comment; **If** `{CLOSE_TRACKER}`.done = false → post the content of `{CLOSE_COMMENT_FILE}` via the tracker MCP (**Comments** fallback).
 Open-PR probe ran
 Probe for pre-existing open PR on `{BRANCH}` before PR create:
 **If** exit 80 → open PR on `{BRANCH}` via `list_pull_requests` (base `dev`) → found → **Failure Path**; **Else** → sub-step 2.
@@ -7294,6 +7299,7 @@ Re-read issue labels post-push:
 Auto-label presence re-read before close-workflow commit
 Lock released
 PR created
+`{PUBLISH}` = false → the `build-close-workflow` gate only; the held close commits and pushes nothing, so only these lines apply: `steps gate`, close committed, lock released, final return, issue update attempted, artifact link list posted. `{PUBLISH}` = true → every line applies.
 Hold `verdict` as `{VERIFY_VERDICT}`. **If** `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` does not exist → `GATE_VERDICT` = SKIPPED. **Else**:
 Verify round read back on resume
 Round limit read (`counters max --point=build.challenge`) before sizing
