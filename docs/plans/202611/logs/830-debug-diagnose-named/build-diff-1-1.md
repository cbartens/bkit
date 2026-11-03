diff --git a/.bkit/cli.md b/.bkit/cli.md
index 8ea6d16c5..4e978721b 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -80,6 +80,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
+| `parse` | workflow | **`--prompt-file`** | Read an explicitly named or existing branch from the session prompt. |
 | `sync` | workflow | `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 3, and Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise. |
@@ -286,6 +287,7 @@ CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
+| `locate` | workflow | **`--prompt-file`** `--issue-text-file` **`--branch`** **`--repo`** `--file` **`--selection-out`** `--evidence-file` | Select and validate the red CI run for the adopted debug branch before local discovery: exit 0 selects red CI, 1 selects local discovery, 2 rejects arguments, 8 rejects ambiguous references, 80 requests read fallback, and 82 requires owner action for unavailable or mismatched evidence. |
 | `wait` | by hand | `--pr` `--head` `--branch` `--until` `--budget-s` `--interval-s` `--once` `--dispatch-if-absent` | Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed. |
 | `dispatch` | workflow | `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. |
 | `gate` | workflow | `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 657b2f4b8..5ca18eb06 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -80,6 +80,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
+| `parse` | workflow | **`--prompt-file`** | Read an explicitly named or existing branch from the session prompt. |
 | `sync` | workflow | `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 3, and Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise. |
@@ -286,6 +287,7 @@ CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
+| `locate` | workflow | **`--prompt-file`** `--issue-text-file` **`--branch`** **`--repo`** `--file` **`--selection-out`** `--evidence-file` | Select and validate the red CI run for the adopted debug branch before local discovery: exit 0 selects red CI, 1 selects local discovery, 2 rejects arguments, 8 rejects ambiguous references, 80 requests read fallback, and 82 requires owner action for unavailable or mismatched evidence. |
 | `wait` | by hand | `--pr` `--head` `--branch` `--until` `--budget-s` `--interval-s` `--once` `--dispatch-if-absent` | Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed. |
 | `dispatch` | workflow | `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. |
 | `gate` | workflow | `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index b90501fe0..c1628d47f 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -140,6 +140,58 @@ const inRebase = (dir: string) =>
   fs.existsSync(path.join(dir, ".git/rebase-merge")) ||
   fs.existsSync(path.join(dir, ".git/rebase-apply"));
 
+describe("bkit branches parse", () => {
+  it("parses explicit and existing branch tokens without consuming URLs", async () => {
+    const cwd = makeRepo("parse");
+    git(cwd, "branch", "fix/ci");
+    git(cwd, "update-ref", "refs/remotes/origin/fix/ci", sha(cwd));
+    const prompt = path.join(cwd, "prompt.md");
+    write(
+      cwd,
+      "prompt.md",
+      "bkit-debug branch=fix/ci https://github.com/example/repo/actions/runs/123",
+    );
+    const explicit = await run(cwd, ["parse", `--prompt-file=${prompt}`]);
+    expect(explicit.code).toBe(0);
+    expect(explicit.json).toMatchObject({ branch: "fix/ci" });
+    write(
+      cwd,
+      "prompt.md",
+      "bkit-debug fix/ci https://github.com/example/repo/pull/4 docs/testing.md",
+    );
+    const token = await run(cwd, ["parse", `--prompt-file=${prompt}`]);
+    expect(token.code).toBe(0);
+    expect(token.json).toMatchObject({ branch: "fix/ci" });
+    write(
+      cwd,
+      "prompt.md",
+      "bkit-debug https://github.com/example/repo/actions/runs/123 docs/testing.md",
+    );
+    const noBranch = await run(cwd, ["parse", `--prompt-file=${prompt}`]);
+    expect(noBranch.code).toBe(0);
+    expect(noBranch.json).toMatchObject({ branch: null });
+    git(cwd, "update-ref", "refs/remotes/origin/fix/remote", sha(cwd));
+    write(cwd, "prompt.md", "bkit-debug fix/remote");
+    const remoteOnly = await run(cwd, ["parse", `--prompt-file=${prompt}`]);
+    expect(remoteOnly.code).toBe(0);
+    expect(remoteOnly.json).toMatchObject({ branch: "fix/remote" });
+  });
+
+  it("rejects missing explicit and ambiguous existing branch selections", async () => {
+    const cwd = makeRepo("parse-refusals");
+    git(cwd, "branch", "fix/one");
+    git(cwd, "branch", "fix/two");
+    const prompt = path.join(cwd, "prompt.md");
+    write(cwd, "prompt.md", "bkit-debug branch=fix/missing");
+    expect((await run(cwd, ["parse", `--prompt-file=${prompt}`])).code).toBe(3);
+    write(cwd, "prompt.md", "bkit-debug fix/one fix/two");
+    expect((await run(cwd, ["parse", `--prompt-file=${prompt}`])).code).toBe(8);
+    write(cwd, "prompt.md", "bkit-debug branch=fix/one branch=fix/two");
+    expect((await run(cwd, ["parse", `--prompt-file=${prompt}`])).code).toBe(8);
+    expect(git(cwd, "branch", "--show-current").out).toBe("main");
+  });
+});
+
 /** A bare `origin` with `dev`, and a clone of it on `dev`. */
 function withOrigin(name: string): { origin: string; clone: string } {
   const origin = tmp(`${name}-origin`);
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index ed86f8917..a5553832a 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -2698,6 +2698,59 @@ export const branchesCommand: CommandSpec = {
   noun: "branches",
   summary: "Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.",
   verbs: {
+    parse: {
+      summary: "Read an explicitly named or existing branch from the session prompt.",
+      use: "workflow",
+      flags: [{ name: "prompt-file", type: "string", required: true, help: "session prompt" }],
+      output: {
+        branch: "one existing branch, or null",
+        via: "explicit | token | null",
+        where: "local | remote | both | null",
+      },
+      exitCodes: {
+        3: "an explicit branch is invalid or absent",
+        8: "multiple branches were named",
+      },
+      run: (ctx) => {
+        const prompt = fs.readFileSync(path.resolve(ctx.cwd, String(ctx.flags.promptFile)), "utf8");
+        const candidates = new Map<string, { via: string; where: string }>();
+        for (const token of prompt.split(/\s+/)) {
+          const explicit = token.startsWith("branch=");
+          const branch = explicit ? token.slice("branch=".length) : token;
+          if (!explicit && (!branch.includes("/") || /^[a-z][a-z0-9+.-]*:\/\//i.test(branch)))
+            continue;
+          const valid = runGit(ctx.cwd, ["check-ref-format", "--branch", branch]).ok;
+          const local =
+            valid &&
+            runGit(ctx.cwd, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`]).ok;
+          const remote =
+            valid &&
+            runGit(ctx.cwd, ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${branch}`])
+              .ok;
+          if (!local && !remote) {
+            if (explicit)
+              throw new CommandError(3, `branch ${branch} is invalid or does not exist`);
+            continue;
+          }
+          candidates.set(branch, {
+            via: explicit ? "explicit" : "token",
+            where: local && remote ? "both" : local ? "local" : "remote",
+          });
+        }
+        if (candidates.size > 1)
+          throw new CommandError(
+            8,
+            `multiple branch selections: ${[...candidates.keys()].join(", ")}`,
+          );
+        const selected = [...candidates.entries()][0];
+        ctx.emit(
+          selected
+            ? { branch: selected[0], ...selected[1] }
+            : { branch: null, via: null, where: null },
+        );
+        return EXIT.OK;
+      },
+    },
     sync: {
       summary: `Fetch ${UPSTREAM}; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in.`,
       use: "workflow",
diff --git a/.bkit/core/engine/commands/workflow/runs.test.ts b/.bkit/core/engine/commands/workflow/runs.test.ts
index 846ef7c6c..0c78a28fe 100644
--- a/.bkit/core/engine/commands/workflow/runs.test.ts
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -92,6 +92,429 @@ const stub = (args: string[], vars: Record<string, string> = {}) => {
 const RUNS_URL = (sha: string) =>
   `/repos/example/example/actions/workflows/bkit-ci.yml/runs?head_sha=${sha}`;
 
+type LocateRun = {
+  id: number;
+  run_attempt: number;
+  workflow_id: number;
+  path: string;
+  head_branch: string;
+  head_sha: string;
+  head_repository: { full_name: string };
+  repository: { full_name: string };
+  status: string;
+  conclusion: string;
+  html_url: string;
+  created_at: string;
+  updated_at: string;
+};
+type LocateData = {
+  runs: LocateRun[];
+  jobs: Array<{ id: number; name: string; status: string; conclusion: string }>;
+  pr: { head: { ref: string; sha: string; repo: { full_name: string } } };
+  error?: boolean;
+  malformed?: boolean;
+  failPage?: boolean;
+};
+
+/** Unit boundary: real temporary git repository and a fixture-only GitHub executable. */
+function locateFixture() {
+  const cwd = tmp("bkit-locate-");
+  gitIn(cwd, "init", "-q", "-b", "fix/ci");
+  gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "before");
+  const ancestor = gitIn(cwd, "rev-parse", "HEAD");
+  gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "current");
+  const head = gitIn(cwd, "rev-parse", "HEAD");
+  gitIn(cwd, "remote", "add", "origin", "https://github.com/example/example.git");
+  fs.mkdirSync(path.join(cwd, ".github/workflows"), { recursive: true });
+  fs.writeFileSync(path.join(cwd, ".github/workflows/consumer-ci.yml"), "name: CI\n");
+  fs.writeFileSync(
+    path.join(cwd, "package.json"),
+    JSON.stringify({
+      bkit: { testing: { ciWorkflow: "consumer-ci.yml" } },
+    }),
+  );
+  const prompt = path.join(cwd, "prompt.md");
+  const issue = path.join(cwd, "issue.md");
+  const file = path.join(cwd, "status.jsonl");
+  const selection = path.join(cwd, "selection.json");
+  fs.writeFileSync(prompt, "bkit-debug #1\n");
+  fs.writeFileSync(issue, "No run supplied.\n");
+  fs.writeFileSync(
+    file,
+    JSON.stringify({ type: "workflow-started", workflow: "debug", at: "2026-11-01T00:00:00Z" }) +
+      "\n",
+  );
+  const run: LocateRun = {
+    id: 101,
+    run_attempt: 2,
+    workflow_id: 456,
+    path: ".github/workflows/consumer-ci.yml",
+    head_branch: "fix/ci",
+    head_sha: head,
+    head_repository: { full_name: "example/example" },
+    repository: { full_name: "example/example" },
+    status: "completed",
+    conclusion: "failure",
+    html_url: "https://github.com/example/example/actions/runs/101",
+    created_at: "2026-11-01T00:00:00Z",
+    updated_at: "2026-11-01T00:01:00Z",
+  };
+  const data: LocateData = {
+    runs: [run],
+    jobs: [
+      { id: 1, name: "bkit-tests-integration", status: "completed", conclusion: "failure" },
+      { id: 2, name: "bkit-tests-check", status: "completed", conclusion: "failure" },
+    ],
+    pr: { head: { ref: "fix/ci", sha: head, repo: { full_name: "example/example" } } },
+  };
+  const bin = path.join(cwd, "bin");
+  fs.mkdirSync(bin);
+  const dataFile = path.join(bin, "data.json");
+  const callsFile = path.join(bin, "calls.jsonl");
+  fs.writeFileSync(callsFile, "");
+  fs.writeFileSync(
+    path.join(bin, "gh"),
+    `#!${process.execPath}
+const fs = require("node:fs");
+const path = require("node:path");
+const dir = __dirname;
+const args = process.argv.slice(2);
+fs.appendFileSync(path.join(dir, "calls.jsonl"), JSON.stringify(args) + "\\n");
+const data = JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8"));
+if (data.error) { process.stderr.write("HTTP 403 unavailable fixture\\n"); process.exit(4); }
+if (data.malformed) { process.stdout.write("{"); process.exit(0); }
+const emit = value => process.stdout.write(JSON.stringify(value));
+const endpoint = args.find(value => value.startsWith("/repos/")) || "";
+if (args[0] === "api" && /\\/pulls\\/\\d+/.test(endpoint)) { emit(data.pr); process.exit(0); }
+if (args[0] === "pr" && args[1] === "view") {
+  emit({headRefName: data.pr.head.ref, headRefOid: data.pr.head.sha,
+    headRepository: {name: "example", nameWithOwner: data.pr.head.repo.full_name},
+    headRepositoryOwner: {login: data.pr.head.repo.full_name.split("/")[0]}});
+  process.exit(0);
+}
+if (args[0] !== "api") { process.stderr.write("unhandled fixture call"); process.exit(1); }
+if (/\\/jobs(?:\\?|$)/.test(endpoint)) {
+  const match = endpoint.match(/\\/attempts\\/(\\d+)/);
+  if (!match || Number(match[1]) !== 2) { process.stderr.write("attempt must be pinned"); process.exit(1); }
+  const page = Number(new URL("https://fixture.invalid" + endpoint).searchParams.get("page") ||
+    (args.find(value => /^page=/.test(value)) || "page=1").split("=")[1]);
+  if (data.failPage && (page > 1 || args.includes("--paginate"))) { process.stderr.write("page unavailable"); process.exit(1); }
+  const pages = [];
+  for (let offset = 0; offset < data.jobs.length; offset += 100) pages.push({total_count: data.jobs.length, jobs: data.jobs.slice(offset, offset + 100)});
+  if (!pages.length) pages.push({total_count: 0, jobs: []});
+  if (args.includes("--paginate")) {
+    if (args.includes("--slurp")) emit(pages);
+    else process.stdout.write(pages.map(value => JSON.stringify(value)).join("\\n"));
+  } else emit(pages[page - 1] || {total_count: data.jobs.length, jobs: []});
+  process.exit(0);
+}
+if (/\\/actions\\/workflows\\/[^/]+\\/runs/.test(endpoint)) {
+  const query = new URL("https://fixture.invalid" + endpoint).searchParams;
+  const runs = data.runs.filter(run => (!query.get("head_sha") || run.head_sha === query.get("head_sha")) &&
+    (!query.get("branch") || run.head_branch === query.get("branch")) &&
+    (endpoint.includes("consumer-ci.yml") || endpoint.includes("456")) &&
+    (run.workflow_id === 456 || run.path === ".github/workflows/consumer-ci.yml"));
+  emit({total_count: runs.length, workflow_runs: runs}); process.exit(0);
+}
+if (/\\/actions\\/runs\\/\\d+/.test(endpoint)) {
+  const id = Number(endpoint.match(/\\/runs\\/(\\d+)/)[1]);
+  const run = data.runs.find(value => value.id === id);
+  if (!run) process.exit(1);
+  const attempt = endpoint.match(/\\/attempts\\/(\\d+)(?:\\?|$)/);
+  emit(attempt ? {...run, run_attempt: Number(attempt[1])} : run); process.exit(0);
+}
+if (/\\/actions\\/runs/.test(endpoint)) {
+  emit({total_count: data.runs.length, workflow_runs: data.runs}); process.exit(0);
+}
+process.stderr.write("unhandled fixture endpoint " + endpoint); process.exit(1);
+`,
+    { mode: 0o755 },
+  );
+  env({ PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}` });
+  const save = () => fs.writeFileSync(dataFile, JSON.stringify(data));
+  save();
+  return {
+    cwd,
+    prompt,
+    issue,
+    file,
+    selection,
+    head,
+    ancestor,
+    data,
+    save,
+    locate: (...extra: string[]) => {
+      save();
+      return cli(cwd, [
+        "locate",
+        `--prompt-file=${prompt}`,
+        `--issue-text-file=${issue}`,
+        "--branch=fix/ci",
+        "--repo=example/example",
+        `--file=${file}`,
+        `--selection-out=${selection}`,
+        ...extra,
+      ]);
+    },
+    calls: () =>
+      fs
+        .readFileSync(callsFile, "utf-8")
+        .trim()
+        .split("\n")
+        .filter(Boolean)
+        .map((line) => JSON.parse(line) as string[]),
+    selected: () => JSON.parse(fs.readFileSync(selection, "utf-8")),
+    saved: (runId = "101") => {
+      const ciSelection = {
+        mode: "ci",
+        provider: "github",
+        repo: "example/example",
+        runId,
+        runAttempt: 2,
+        runUrl: `https://github.com/example/example/actions/runs/${runId}/attempts/2`,
+        workflowId: "456",
+        workflowPath: ".github/workflows/consumer-ci.yml",
+        headBranch: "fix/ci",
+        headSha: head,
+        conclusion: "failure",
+        redTiers: ["integration"],
+        via: "prompt-run",
+      };
+      fs.appendFileSync(
+        file,
+        JSON.stringify({
+          type: "workflow-meta",
+          workflow: "debug",
+          at: "2026-11-01T00:00:01Z",
+          ciSelection,
+          ciGeneration: 1,
+        }) + "\n",
+      );
+    },
+  };
+}
+
+describe("bkit runs locate", () => {
+  it("locates CI evidence using prompt saved issue and local precedence", async () => {
+    const f = locateFixture();
+    f.data.runs.push({ ...f.data.runs[0]!, id: 102 });
+    fs.writeFileSync(f.issue, "https://github.com/example/example/actions/runs/102\n");
+    f.saved("102");
+    fs.writeFileSync(
+      f.prompt,
+      "bkit-debug https://github.com/example/example/actions/runs/101 https://github.com/example/example/pull/7\n",
+    );
+    const before = fs.readFileSync(f.file, "utf-8");
+    const prompt = await f.locate();
+    expect(prompt.code).toBe(0);
+    expect(prompt.json).toMatchObject({ runId: "101", via: "prompt-run" });
+    expect(f.selected()).toMatchObject({
+      mode: "ci",
+      runId: "101",
+      runAttempt: 2,
+      redTiers: ["integration"],
+    });
+    expect(fs.readFileSync(f.file, "utf-8")).toBe(before);
+    fs.writeFileSync(f.prompt, "bkit-debug #1\n");
+    expect((await f.locate()).json).toMatchObject({ runId: "102" });
+    fs.writeFileSync(
+      f.prompt,
+      "bkit-debug [local] https://github.com/other/repo/actions/runs/999\n",
+    );
+    expect((await f.locate()).code).toBe(1);
+    expect(f.selected()).toMatchObject({ mode: "local", reason: "explicit-local" });
+    const issue = locateFixture();
+    fs.writeFileSync(issue.issue, "https://github.com/example/example/actions/runs/101\n");
+    expect((await issue.locate()).json).toMatchObject({ runId: "101", via: "issue-run" });
+    fs.writeFileSync(
+      issue.issue,
+      "###### bkit:generated generated-id\nhttps://github.com/other/repo/actions/runs/999\n",
+    );
+    expect((await issue.locate()).code).toBe(0);
+    expect(issue.selected()).toMatchObject({ runId: "101" });
+  });
+
+  it("rejects ambiguous cross-repository and malformed attempt references", async () => {
+    const f = locateFixture();
+    fs.writeFileSync(
+      f.prompt,
+      "https://github.com/example/example/actions/runs/101 https://github.com/example/example/actions/runs/102",
+    );
+    expect((await f.locate()).code).toBe(8);
+    fs.writeFileSync(f.prompt, "https://github.com/other/repo/actions/runs/101");
+    expect((await f.locate()).code).toBe(82);
+    fs.writeFileSync(f.prompt, "https://github.com/example/example/actions/runs/101/attempts/0");
+    expect((await f.locate()).code).toBe(2);
+    fs.writeFileSync(f.prompt, "https://github.com/example/example/actions/runs/101/attempts/nope");
+    expect((await f.locate()).code).toBe(2);
+    expect(fs.existsSync(f.selection)).toBe(false);
+    expect(f.calls()).toEqual([]);
+  });
+
+  it("filters branch and PR discovery by configured workflow and exact head", async () => {
+    const f = locateFixture();
+    f.data.runs.push({
+      ...f.data.runs[0]!,
+      id: 202,
+      workflow_id: 999,
+      path: ".github/workflows/unrelated.yml",
+      conclusion: "success",
+      updated_at: "2026-11-02T00:00:00Z",
+    });
+    expect((await f.locate()).code).toBe(0);
+    expect(f.selected()).toMatchObject({ runId: "101", workflowId: "456" });
+    const branchCalls = f
+      .calls()
+      .map((call) => call.join(" "))
+      .join("\n");
+    expect(branchCalls).toMatch(/actions\/workflows\/(?:consumer-ci\.yml|456)\/runs/);
+    expect(decodeURIComponent(branchCalls)).toContain("branch=fix/ci");
+    fs.writeFileSync(f.prompt, "https://github.com/example/example/pull/7");
+    const pr = await f.locate();
+    expect(pr.code).toBe(0);
+    expect(pr.json).toMatchObject({ runId: "101", via: "prompt-pr", headSha: f.head });
+    expect(
+      f
+        .calls()
+        .map((call) => call.join(" "))
+        .join("\n"),
+    ).toContain(`head_sha=${f.head}`);
+  });
+
+  it("freezes explicit workflow run attempt and all failed job pages", async () => {
+    const f = locateFixture();
+    f.data.runs[0]!.workflow_id = 777;
+    f.data.runs[0]!.run_attempt = 3;
+    f.data.runs[0]!.path = ".github/workflows/other-ci.yml";
+    f.data.jobs = Array.from({ length: 100 }, (_, index) => ({
+      id: index + 1,
+      name: `success-${index}`,
+      status: "completed",
+      conclusion: "success",
+    }));
+    f.data.jobs.push(
+      { id: 101, name: "bkit-tests-integration", status: "completed", conclusion: "failure" },
+      { id: 102, name: "unknown-deploy", status: "completed", conclusion: "failure" },
+    );
+    fs.writeFileSync(f.prompt, "https://github.com/example/example/actions/runs/101/attempts/2");
+    const result = await f.locate();
+    expect(result.code).toBe(0);
+    expect(result.json).toMatchObject({
+      runId: "101",
+      runAttempt: 2,
+      workflowId: "777",
+      workflowPath: ".github/workflows/other-ci.yml",
+      tiers: [],
+    });
+    expect(JSON.stringify(result.json.failedJobs)).toContain("bkit-tests-integration");
+    expect(JSON.stringify(result.json.failedJobs)).toContain("unknown-deploy");
+    expect(f.selected()).toMatchObject({ runAttempt: 2, redTiers: [], workflowId: "777" });
+    const calls = f.calls().filter((call) => call.join(" ").includes("/jobs"));
+    expect(calls.length).toBeGreaterThan(0);
+    expect(calls.every((call) => call.join(" ").includes("/attempts/2/jobs"))).toBe(true);
+  });
+
+  it("validates branch fork ancestor divergent and unavailable ancestry evidence", async () => {
+    const f = locateFixture();
+    fs.writeFileSync(f.prompt, "https://github.com/example/example/actions/runs/101");
+    const current = await f.locate();
+    expect(current.code).toBe(0);
+    expect(current.json.headRelation).toBe("current");
+    f.data.runs[0]!.head_sha = f.ancestor;
+    const historical = await f.locate();
+    expect(historical.code).toBe(0);
+    expect(historical.json.headRelation).toBe("ancestor");
+    f.data.runs[0]!.head_branch = "fix/other";
+    expect((await f.locate()).code).toBe(82);
+    f.data.runs[0]!.head_branch = "fix/ci";
+    f.data.runs[0]!.head_repository = { full_name: "fork/example" };
+    expect((await f.locate()).code).toBe(82);
+    f.data.runs[0]!.head_repository = { full_name: "example/example" };
+    gitIn(f.cwd, "switch", "-q", "-c", "fix/divergent", f.ancestor);
+    gitIn(f.cwd, "commit", "-q", "--allow-empty", "-m", "divergent");
+    const divergent = gitIn(f.cwd, "rev-parse", "HEAD");
+    gitIn(f.cwd, "switch", "-q", "fix/ci");
+    f.data.runs[0]!.head_sha = divergent;
+    const rejected = await f.locate();
+    expect(rejected.code).toBe(82);
+    expect(`${rejected.err} ${rejected.out}`).toMatch(/diverg/i);
+    f.data.runs[0]!.head_sha = "f".repeat(40);
+    const unavailable = await f.locate();
+    expect(unavailable.code).toBe(82);
+    expect(`${unavailable.err} ${unavailable.out}`).toMatch(/unknown|unavailable|missing|ancestr/i);
+  });
+
+  it("distinguishes proven automatic no-red from explicit non-red and unavailable lookup", async () => {
+    const f = locateFixture();
+    f.data.runs[0]!.conclusion = "success";
+    expect((await f.locate()).code).toBe(1);
+    expect(f.selected()).toMatchObject({ mode: "local" });
+    fs.writeFileSync(f.prompt, "https://github.com/example/example/actions/runs/101");
+    expect((await f.locate()).code).toBe(82);
+    f.data.runs[0]!.conclusion = "timed_out";
+    expect((await f.locate()).code).toBe(0);
+    f.data.runs[0]!.conclusion = "startup_failure";
+    expect((await f.locate()).code).toBe(0);
+    fs.writeFileSync(f.prompt, "bkit-debug #1");
+    f.data.error = true;
+    expect((await f.locate()).code).toBe(80);
+    f.data.error = false;
+    f.data.malformed = true;
+    expect((await f.locate()).code).not.toBe(1);
+    f.data.malformed = false;
+    f.data.runs[0]!.conclusion = "failure";
+    f.data.jobs = Array.from({ length: 101 }, (_, index) => ({
+      id: index + 1,
+      name: "bkit-tests-unit",
+      status: "completed",
+      conclusion: "failure",
+    }));
+    f.data.failPage = true;
+    const partial = await f.locate();
+    expect(partial.code).not.toBe(0);
+    expect(partial.code).not.toBe(1);
+    const absent = locateFixture();
+    absent.data.runs = [];
+    expect((await absent.locate()).code).toBe(1);
+    expect(absent.selected()).toMatchObject({ mode: "local" });
+  });
+
+  it("validates normalized fallback evidence against the requested identity", async () => {
+    const f = locateFixture();
+    fs.writeFileSync(f.prompt, "https://github.com/example/example/actions/runs/101/attempts/2");
+    const evidence = path.join(f.cwd, "evidence.json");
+    const response = {
+      request: {
+        repo: "example/example",
+        branch: "fix/ci",
+        kind: "run",
+        runId: "101",
+        runAttempt: 2,
+      },
+      run: f.data.runs[0],
+      jobs: f.data.jobs,
+      complete: true,
+    };
+    fs.writeFileSync(evidence, JSON.stringify(response));
+    f.data.error = true;
+    const accepted = await f.locate(`--evidence-file=${evidence}`);
+    expect(accepted.code).toBe(0);
+    expect(f.selected()).toMatchObject({ runId: "101", runAttempt: 2, headSha: f.head });
+    fs.writeFileSync(
+      evidence,
+      JSON.stringify({ ...response, request: { ...response.request, runId: "999" } }),
+    );
+    expect((await f.locate(`--evidence-file=${evidence}`)).code).not.toBe(0);
+    fs.writeFileSync(evidence, JSON.stringify({ ...response, complete: false }));
+    expect((await f.locate(`--evidence-file=${evidence}`)).code).not.toBe(0);
+    fs.writeFileSync(
+      evidence,
+      JSON.stringify({ ...response, run: { ...response.run, workflow_id: null } }),
+    );
+    expect((await f.locate(`--evidence-file=${evidence}`)).code).not.toBe(0);
+  });
+});
+
 describe("fixture gh stub", () => {
   it("runs?head_sha=green-capstone returns the captured workflow_runs list", () => {
     const r = stub(["api", RUNS_URL("green-capstone")]);
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index e057c6392..a2f75b81b 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -23,7 +23,14 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 
-import { statusTimestamp } from "../../ledgers/status.js";
+import {
+  CI_TIERS,
+  lastRun,
+  statusTimestamp,
+  validateCiSelection,
+  type CiSelection,
+  type CiTier,
+} from "../../ledgers/status.js";
 import {
   bodySkipToken,
   commitMessage,
@@ -35,6 +42,7 @@ import {
   parseJson,
   runGh,
   runGit,
+  runTool,
   SKIP_CI_TOKEN,
   type CommandSpec,
   type FlagSpec,
@@ -59,7 +67,7 @@ import {
 } from "./prs.js";
 import { resolveOwnerRepo, splitSlug } from "./repo.js";
 import { restateOutcome } from "./run-facts.js";
-import { extraField, str } from "./status.js";
+import { extraField, readRuns, str } from "./status.js";
 import { writeStepRow } from "./steps.js";
 import { attempt, issueRef, readLabels, trackerTarget } from "./tracker.js";
 
@@ -105,6 +113,391 @@ export function ciDeclared(root: string): { declared: boolean; ciWorkflow: strin
   return { declared: fs.existsSync(path.join(root, rel)), ciWorkflow, path: rel };
 }
 
+type CiReference = { kind: "run" | "pr"; repo: string; id: string; attempt?: number };
+
+/** Only the winning reference kind is actionable; a run takes precedence over a PR. */
+export function parseCiReference(input: string): CiReference | undefined {
+  const references: CiReference[] = [];
+  const urls = [...input.matchAll(/https:\/\/github\.com\/[^\s<>"`]+/g)].map((match) =>
+    match[0].replace(/[),.;\]]+$/, ""),
+  );
+  const parsed = urls.flatMap((url) => {
+    const ref =
+      /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(actions\/runs|pull)\/([^/?#]*)([^?#]*)/.exec(url);
+    return ref ? [{ url, ref }] : [];
+  });
+  const winning = parsed.some(({ ref }) => ref[2] === "actions/runs") ? "actions/runs" : "pull";
+  for (const { url, ref } of parsed.filter(({ ref }) => ref[2] === winning)) {
+    const id = ref[3]!;
+    const suffix = ref[4]!;
+    const kind = ref[2] === "pull" ? "pr" : "run";
+    if (!/^[1-9][0-9]*$/.test(id))
+      throw new CommandError(EXIT.USAGE, `invalid ${kind} id in ${url}`);
+    let attempt: number | undefined;
+    if (kind === "run" && suffix !== "" && suffix !== "/") {
+      const pinned = /^\/attempts\/([1-9][0-9]*)\/?$/.exec(suffix);
+      if (!pinned || !Number.isSafeInteger(Number(pinned[1])))
+        throw new CommandError(EXIT.USAGE, `invalid run attempt in ${url}`);
+      attempt = Number(pinned[1]);
+    } else if (kind === "pr" && suffix !== "" && suffix !== "/") continue;
+    references.push({ kind, repo: ref[1]!, id, ...(attempt === undefined ? {} : { attempt }) });
+  }
+  const kind = references.some((ref) => ref.kind === "run") ? "run" : "pr";
+  const winners = [
+    ...new Map(
+      references.filter((ref) => ref.kind === kind).map((ref) => [JSON.stringify(ref), ref]),
+    ).values(),
+  ];
+  if (winners.length > 1)
+    throw new CommandError(8, `multiple ${kind} references were supplied; name one`);
+  return winners[0];
+}
+
+function selectionHeadRelation(
+  cwd: string,
+  selection: Extract<CiSelection, { mode: "ci" }>,
+  repo: string,
+  branch: string,
+): "current" | "ancestor" {
+  if (selection.repo.toLowerCase() !== repo.toLowerCase() || selection.headBranch !== branch) {
+    throw new CommandError(
+      82,
+      `selected evidence belongs to ${selection.repo} branch ${selection.headBranch}; adopted ${repo} branch ${branch}. Supply branch=${selection.headBranch} in its checkout`,
+    );
+  }
+  const head = git(cwd, ["rev-parse", "--verify", `refs/heads/${branch}^{commit}`]);
+  if (head === selection.headSha) return "current";
+  if (head === null || !runGit(cwd, ["cat-file", "-e", `${selection.headSha}^{commit}`]).ok) {
+    throw new CommandError(
+      82,
+      `selected commit ${selection.headSha} or branch ${branch} is unavailable; ancestry is unknown`,
+    );
+  }
+  const relation = runTool("git", ["merge-base", "--is-ancestor", selection.headSha, head], cwd);
+  if (relation.status === 0) return "ancestor";
+  throw new CommandError(
+    82,
+    relation.status === 1
+      ? `selected commit ${selection.headSha} is divergent from ${branch}`
+      : `ancestry of ${selection.headSha} is unknown: ${relation.stderr}`,
+  );
+}
+
+function locateCi(ctx: RunContext): number {
+  const f = ctx.flags;
+  const repo = String(f.repo);
+  const branch = String(f.branch);
+  if (
+    !/^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repo) ||
+    !runGit(ctx.cwd, ["check-ref-format", "--branch", branch]).ok
+  ) {
+    throw new CommandError(
+      EXIT.USAGE,
+      "--repo and --branch must name a repository and a valid branch",
+    );
+  }
+  const readInput = (flag: string) =>
+    f[flag] === undefined ? "" : fs.readFileSync(path.resolve(ctx.cwd, String(f[flag])), "utf8");
+  const prompt = readInput("promptFile");
+  const selectionFile = path.resolve(ctx.cwd, String(f.selectionOut));
+  const finish = (selection: CiSelection, failedJobs: Record<string, unknown>[] = []) => {
+    if (!validateCiSelection(selection))
+      throw new CommandError(82, "selected evidence has malformed or missing identity fields");
+    const headRelation =
+      selection.mode === "ci" ? selectionHeadRelation(ctx.cwd, selection, repo, branch) : null;
+    if (headRelation === "ancestor")
+      ctx.log(
+        `selected run ${selection.mode === "ci" ? selection.runId : ""} is historical ancestor evidence; inspect intervening changes before fixing`,
+      );
+    fs.mkdirSync(path.dirname(selectionFile), { recursive: true });
+    fs.writeFileSync(selectionFile, `${JSON.stringify(selection, null, 2)}\n`);
+    ctx.emit({
+      selection: selection.mode,
+      runId: selection.mode === "ci" ? selection.runId : null,
+      runUrl: selection.mode === "ci" ? selection.runUrl : null,
+      runAttempt: selection.mode === "ci" ? selection.runAttempt : null,
+      workflowId: selection.mode === "ci" ? selection.workflowId : null,
+      workflowPath: selection.mode === "ci" ? selection.workflowPath : null,
+      headSha: selection.mode === "ci" ? selection.headSha : null,
+      headRelation,
+      failedJobs,
+      tiers: selection.mode === "ci" ? selection.redTiers : [],
+      via: selection.mode === "ci" ? selection.via : null,
+      reason: selection.mode === "local" ? selection.reason : null,
+      selectionFile,
+    });
+    return selection.mode === "ci" ? EXIT.OK : 1;
+  };
+  if (/\[local\]/i.test(prompt)) return finish({ mode: "local", reason: "explicit-local" });
+  let reference = parseCiReference(prompt);
+  let via = reference ? `prompt-${reference.kind}` : "branch";
+  let saved: CiSelection | undefined;
+  if (!reference && f.file !== undefined && fs.existsSync(path.resolve(ctx.cwd, String(f.file)))) {
+    const active = lastRun(readRuns(path.resolve(ctx.cwd, String(f.file))), "debug");
+    if (active?.status === "IN_PROGRESS" && active.ciSelection !== undefined) {
+      if (!validateCiSelection(active.ciSelection))
+        throw new CommandError(82, "active saved CI selection is invalid");
+      saved = active.ciSelection;
+      if (saved.mode === "local") return finish(saved);
+      reference = { kind: "run", repo: saved.repo, id: saved.runId, attempt: saved.runAttempt };
+      via = saved.via;
+    }
+  }
+  if (!reference) {
+    const issue = readInput("issueTextFile");
+    // issues text already removes generated comments; refuse a raw generated payload too.
+    reference = parseCiReference(/^######\s+bkit:generated/m.test(issue) ? "" : issue);
+    if (reference) via = `issue-${reference.kind}`;
+  }
+  if (reference && reference.repo.toLowerCase() !== repo.toLowerCase())
+    throw new CommandError(
+      82,
+      `reference repository ${reference.repo} does not match adopted repository ${repo}`,
+    );
+  const declared = ciDeclared(checkoutRoot(ctx.cwd));
+  if (!reference && !declared.declared)
+    return finish({ mode: "local", reason: "no-configured-ci" });
+  const api = (endpoint: string, extra: string[] = []) => {
+    const response = runGh(ctx.cwd, ["api", endpoint, ...extra]);
+    if (!response.ok)
+      throw new CommandError(
+        /HTTP 404/.test(response.stderr) ? 82 : EXIT.USE_MCP,
+        `CI evidence unavailable: ${response.stderr || GH_MISSING}`,
+      );
+    const parsed = jsonOrUndefined(response.stdout);
+    if (parsed === undefined) throw new CommandError(82, "CI evidence response is malformed");
+    return parsed;
+  };
+  const validateRun = (candidate: Record<string, unknown>) => {
+    const base = {
+      mode: "ci",
+      provider: "github",
+      repo,
+      runId: String(candidate.id),
+      runAttempt: Number(candidate.run_attempt),
+      runUrl: `https://github.com/${repo}/actions/runs/${candidate.id}/attempts/${candidate.run_attempt}`,
+      workflowId: String(candidate.workflow_id ?? ""),
+      workflowPath: text(candidate.path),
+      headBranch: text(candidate.head_branch),
+      headSha: text(candidate.head_sha),
+      conclusion: "failure",
+      redTiers: [],
+      via,
+    };
+    if (
+      !validateCiSelection(base) ||
+      text(obj(candidate.repository).full_name).toLowerCase() !== repo.toLowerCase() ||
+      text(obj(candidate.head_repository).full_name).toLowerCase() !== repo.toLowerCase()
+    )
+      throw new CommandError(
+        82,
+        "run identity, repository or fork metadata is incomplete or mismatched",
+      );
+    if (candidate.head_branch !== branch)
+      throw new CommandError(
+        82,
+        `run branch ${text(candidate.head_branch)} differs from adopted branch ${branch}; supply branch=${text(candidate.head_branch)} in its checkout`,
+      );
+    if (reference?.kind !== "run" && candidate.path !== declared.path)
+      throw new CommandError(82, "discovered run does not belong to the configured workflow");
+  };
+  let run: Record<string, unknown>;
+  let jobs: Record<string, unknown>[];
+  const requested: Record<string, unknown> = { repo, branch, kind: reference?.kind ?? "branch" };
+  if (reference?.kind === "run") {
+    requested.runId = reference.id;
+    if (reference.attempt !== undefined) requested.runAttempt = reference.attempt;
+  } else if (reference?.kind === "pr") requested.pr = reference.id;
+  else requested.workflow = declared.ciWorkflow;
+  if (f.evidenceFile !== undefined) {
+    const envelope = obj(jsonOrUndefined(readInput("evidenceFile")));
+    const request = obj(envelope.request);
+    if (
+      envelope.complete !== true ||
+      !Object.entries(requested).every(([key, value]) => request[key] === value)
+    )
+      throw new CommandError(82, "fallback evidence is incomplete or its request identity differs");
+    if (
+      envelope.noRed === true &&
+      !reference &&
+      typeof request.headSha === "string" &&
+      request.headSha === git(ctx.cwd, ["rev-parse", "HEAD"])
+    )
+      return finish({ mode: "local", reason: "automatic-no-red" });
+    run = obj(envelope.run);
+    if (reference?.kind === "pr") {
+      const head = obj(obj(envelope.pr).head);
+      if (
+        head.ref !== branch ||
+        head.sha !== run.head_sha ||
+        text(obj(head.repo).full_name).toLowerCase() !== repo.toLowerCase()
+      )
+        throw new CommandError(82, "fallback PR head is missing or differs from the selected run");
+    }
+    if (!Array.isArray(envelope.jobs) || envelope.jobs.some((job) => obj(job).id === undefined))
+      throw new CommandError(82, "fallback jobs are incomplete");
+    jobs = envelope.jobs.map(obj);
+  } else {
+    let expectedHead: string | undefined;
+    if (reference?.kind === "pr") {
+      const pr = obj(api(`/repos/${repo}/pulls/${reference.id}`));
+      const head = obj(pr.head);
+      if (
+        text(obj(head.repo).full_name).toLowerCase() !== repo.toLowerCase() ||
+        head.ref !== branch ||
+        !/^[0-9a-f]{40,64}$/.test(text(head.sha))
+      )
+        throw new CommandError(
+          82,
+          `PR head does not match adopted ${repo} branch ${branch}; inspect its branch and fork repository`,
+        );
+      expectedHead = text(head.sha);
+    }
+    if (reference?.kind === "run") {
+      run = obj(
+        api(
+          `/repos/${repo}/actions/runs/${reference.id}${reference.attempt === undefined ? "" : `/attempts/${reference.attempt}`}`,
+        ),
+      );
+    } else {
+      const response = obj(
+        api(
+          `/repos/${repo}/actions/workflows/${queryValue(declared.ciWorkflow)}/runs?branch=${queryValue(branch)}&status=completed&per_page=100${expectedHead ? `&head_sha=${expectedHead}` : ""}`,
+        ),
+      );
+      if (!Array.isArray(response.workflow_runs) || !Number.isSafeInteger(response.total_count))
+        throw new CommandError(82, "workflow lookup returned an incomplete response");
+      const candidates = response.workflow_runs
+        .map(obj)
+        .filter((candidate) => candidate.status === "completed");
+      run =
+        candidates.sort(
+          (a, b) =>
+            text(b.created_at).localeCompare(text(a.created_at)) || Number(b.id) - Number(a.id),
+        )[0] ?? {};
+      if (Object.keys(run).length === 0) {
+        if (Number(response.total_count) > 0)
+          throw new CommandError(
+            82,
+            "workflow lookup returned no completed records despite a nonempty result",
+          );
+        if (reference)
+          throw new CommandError(
+            82,
+            "named PR has no completed red run; choose [local] to discover locally",
+          );
+        return finish({ mode: "local", reason: "automatic-no-red" });
+      }
+      if (expectedHead && run.head_sha !== expectedHead)
+        throw new CommandError(82, "PR lookup returned a run from another head");
+    }
+    validateRun(run);
+    if (
+      run.status !== "completed" ||
+      !["failure", "timed_out", "startup_failure"].includes(text(run.conclusion))
+    ) {
+      if (reference)
+        throw new CommandError(
+          82,
+          `named evidence is ${text(run.status)}/${text(run.conclusion)}; choose [local] to discover locally`,
+        );
+      if (
+        run.status !== "completed" ||
+        !["success", "cancelled", "skipped", "neutral", "action_required", "stale"].includes(
+          text(run.conclusion),
+        )
+      )
+        throw new CommandError(82, "workflow run has an invalid state");
+      return finish({ mode: "local", reason: "automatic-no-red" });
+    }
+    const attempt = reference?.attempt ?? Number(run.run_attempt);
+    if (!Number.isSafeInteger(attempt) || attempt <= 0 || !/^[1-9][0-9]*$/.test(String(run.id)))
+      throw new CommandError(82, "run identity or attempt is missing");
+    const pages = api(
+      `/repos/${repo}/actions/runs/${run.id}/attempts/${attempt}/jobs?per_page=100`,
+      ["--paginate", "--slurp"],
+    );
+    if (!Array.isArray(pages) || pages.length === 0)
+      throw new CommandError(82, "job pagination returned no complete pages");
+    const total = obj(pages[0]).total_count;
+    if (
+      !Number.isSafeInteger(total) ||
+      Number(total) < 0 ||
+      pages.some((page) => !Array.isArray(obj(page).jobs) || obj(page).total_count !== total)
+    )
+      throw new CommandError(82, "job pagination returned incomplete pages");
+    jobs = pages.flatMap((page) => arr(obj(page).jobs).map(obj));
+    if (
+      jobs.length !== total ||
+      new Set(jobs.map((job) => job.id)).size !== total ||
+      jobs.some(
+        (job) =>
+          !Number.isSafeInteger(job.id) ||
+          typeof job.name !== "string" ||
+          typeof job.conclusion !== "string",
+      )
+    )
+      throw new CommandError(82, "job pagination did not return every job");
+  }
+  const attempt = reference?.attempt ?? Number(run.run_attempt);
+  validateRun(run);
+  if (
+    jobs.some(
+      (job) =>
+        !Number.isSafeInteger(job.id) ||
+        typeof job.name !== "string" ||
+        job.name.length === 0 ||
+        typeof job.conclusion !== "string",
+    ) ||
+    new Set(jobs.map((job) => job.id)).size !== jobs.length
+  )
+    throw new CommandError(82, "job identities or conclusions are incomplete");
+  if (reference?.kind === "run" && String(run.id) !== reference.id)
+    throw new CommandError(82, "selected run differs from the requested run");
+  if (
+    Number(run.run_attempt) !== attempt ||
+    run.status !== "completed" ||
+    text(obj(run.repository).full_name).toLowerCase() !== repo.toLowerCase() ||
+    text(obj(run.head_repository).full_name).toLowerCase() !== repo.toLowerCase()
+  )
+    throw new CommandError(82, "run attempt, repository or fork identity does not match");
+  const failedJobs = jobs.filter((job) =>
+    ["failure", "timed_out", "startup_failure"].includes(text(job.conclusion)),
+  );
+  const mapped = failedJobs
+    .filter((job) => job.name !== "bkit-tests-check")
+    .map(
+      (job) =>
+        /^bkit-tests-(static|unit|integration|e2e|live|migration)$/.exec(text(job.name))?.[1],
+    );
+  const tiers: CiTier[] = mapped.some((tier) => tier === undefined)
+    ? []
+    : CI_TIERS.filter((tier) => mapped.includes(tier));
+  const selection: CiSelection = {
+    mode: "ci",
+    provider: "github",
+    repo,
+    runId: String(run.id),
+    runAttempt: attempt,
+    runUrl: `https://github.com/${repo}/actions/runs/${run.id}/attempts/${attempt}`,
+    workflowId: String(run.workflow_id ?? ""),
+    workflowPath: text(run.path),
+    headBranch: text(run.head_branch),
+    headSha: text(run.head_sha),
+    conclusion: text(run.conclusion) as Extract<CiSelection, { mode: "ci" }>["conclusion"],
+    redTiers: tiers,
+    via,
+  };
+  if (
+    saved?.mode === "ci" &&
+    (saved.workflowId !== selection.workflowId ||
+      saved.headSha !== selection.headSha ||
+      saved.workflowPath !== selection.workflowPath)
+  )
+    throw new CommandError(82, "saved evidence identity differs from the returned run");
+  return finish(selection, failedJobs);
+}
+
 /** Skip-token scan of a landed commit's body (see `bodySkipToken`). */
 export function scanBody(cwd: string, sha: string): "clean" | "skip-token-found" | "error" {
   const token = bodySkipToken(cwd, sha);
@@ -2046,6 +2439,59 @@ export const runsCommand: CommandSpec = {
   summary:
     "CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on one; auto's start context.",
   verbs: {
+    locate: {
+      summary:
+        "Select and validate the red CI run for the adopted debug branch before local discovery: exit 0 selects red CI, 1 selects local discovery, 2 rejects arguments, 8 rejects ambiguous references, 80 requests read fallback, and 82 requires owner action for unavailable or mismatched evidence.",
+      use: "workflow",
+      flags: [
+        {
+          name: "prompt-file",
+          type: "string",
+          required: true,
+          help: "session prompt; [local] overrides all CI references",
+        },
+        {
+          name: "issue-text-file",
+          type: "string",
+          help: "current issue description and human comments from issues text",
+        },
+        { name: "branch", type: "string", required: true, help: "adopted existing branch" },
+        { name: "repo", type: "string", required: true, help: "owner/repository" },
+        {
+          name: "file",
+          type: "string",
+          help: "active debug status log; saved selection takes precedence over issue discovery",
+        },
+        {
+          name: "selection-out",
+          type: "string",
+          required: true,
+          help: "write the validated candidate selection; does not update active metadata",
+        },
+        {
+          name: "evidence-file",
+          type: "string",
+          help: "normalized fallback JSON: exact request identity, run, complete jobs, complete:true; automatic no-red also identifies workflow and inspected head",
+        },
+      ],
+      output: {
+        selection: "ci | local",
+        runId: "selected run ID, or null",
+        runUrl: "selected attempt URL, or null",
+        runAttempt: "frozen attempt, or null",
+        workflowId: "selected workflow ID, or null",
+        workflowPath: "selected workflow path, or null",
+        headSha: "selected commit, or null",
+        headRelation: "current | ancestor | null; divergent or unknown evidence exits 82",
+        failedJobs: "complete failed-job list",
+        tiers: "known failed tiers; empty when any failed job is unknown",
+        via: "prompt-run | prompt-pr | issue-run | issue-pr | branch, or null",
+        reason: "local selection reason, or null",
+        selectionFile: "validated candidate JSON path",
+      },
+      exitCodes: { 8: "ambiguous winning references" },
+      run: locateCi,
+    },
     wait: {
       summary:
         "Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed.",
diff --git a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
index c11f8ebe0..c7a19d409 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.integration.test.ts
@@ -101,7 +101,8 @@ beforeAll(() => {
   git(template, "init", "-q", "--bare", "-b", "dev", t.origin);
   git(template, "clone", "-q", t.origin, t.seed);
   fs.writeFileSync(path.join(t.seed, "a.txt"), "base\n");
-  git(t.seed, "add", "a.txt");
+  fs.writeFileSync(path.join(t.seed, "package.json"), '{"private":true}\n');
+  git(t.seed, "add", "a.txt", "package.json");
   git(t.seed, "commit", "-q", "-m", "init");
   git(t.seed, "push", "-q", "origin", "HEAD:dev");
   git(template, "clone", "-q", t.origin, t.repo);
diff --git a/.bkit/core/engine/commands/workflow/worktrees.test.ts b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 2390dd8fd..5dfcfe77b 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.test.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -69,7 +69,7 @@ describe("bkit worktrees setup — usage", () => {
     [["--workflow=build", "--fid=../x", `--month=${MONTH}`], "is not a feature id"],
     [["--workflow=build", "--fid=a/b", `--month=${MONTH}`], "is not a feature id"],
     [["--workflow=build", `--fid=${FID}`, "--month=2026-10"], "YYYYMM"],
-    [["--workflow=build", `--fid=${FID}`, `--month=${MONTH}`, "--branch=x"], "ship only"],
+    [["--workflow=build", `--fid=${FID}`, `--month=${MONTH}`, "--branch=x"], "ship or debug only"],
     [
       ["--workflow=ship", `--fid=${FID}`, `--month=${MONTH}`, "--branch=a..b"],
       "not a valid branch",
@@ -175,6 +175,37 @@ describe("bkit worktrees setup — adopt in place", () => {
 });
 
 describe("bkit worktrees setup — debug", () => {
+  it("adopts a requested debug branch without mutating conflicting worktrees", async () => {
+    const cwd = repo("dev");
+    git(cwd, "branch", "fix/ci");
+    const adopted = await setup(cwd, "debug", "--branch=fix/ci", "--worktrees");
+    expect(adopted.code).toBe(0);
+    expect(adopted.json).toMatchObject({
+      branch: "fix/ci",
+      worktreePath: worktreeDir(cwd, FID),
+    });
+    expect(git(worktreeDir(cwd, FID), "branch", "--show-current")).toBe("fix/ci");
+    expect(git(cwd, "branch", "--show-current")).toBe("dev");
+
+    const conflictRoot = repo("dev");
+    git(conflictRoot, "branch", "fix/ci");
+    const conflict = linked(conflictRoot);
+    const sentinel = path.join(conflict, "owner-work.txt");
+    fs.writeFileSync(sentinel, "keep my uncommitted work\n");
+    const before = git(conflict, "rev-parse", "HEAD");
+    const refused = await setup(conflictRoot, "debug", "--branch=fix/ci", "--worktrees");
+    expect(refused.code).toBe(7);
+    expect(refused.err).toContain("fix/ci");
+    expect(git(conflict, "branch", "--show-current")).toBe(`feat/${FID}`);
+    expect(git(conflict, "rev-parse", "HEAD")).toBe(before);
+    expect(fs.readFileSync(sentinel, "utf-8")).toBe("keep my uncommitted work\n");
+    expect(git(conflictRoot, "branch", "--show-current")).toBe("dev");
+
+    const missingRoot = repo("dev");
+    expect((await setup(missingRoot, "debug", "--branch=fix/missing", "--worktrees")).code).toBe(7);
+    expect(git(missingRoot, "branch", "--list", "fix/missing")).toBe("");
+  });
+
   it("may debug in place on dev", async () => {
     const r = await setup(repo("dev"), "debug");
     expect(r.code).toBe(0);
diff --git a/.bkit/core/engine/commands/workflow/worktrees.ts b/.bkit/core/engine/commands/workflow/worktrees.ts
index aa380e13b..32dd35771 100644
--- a/.bkit/core/engine/commands/workflow/worktrees.ts
+++ b/.bkit/core/engine/commands/workflow/worktrees.ts
@@ -776,7 +776,7 @@ export const worktreesCommand: CommandSpec = {
         {
           name: "branch",
           type: "string",
-          help: "ship only: the branch the session prompt names (default: feat/{fid} when it exists, else the session branch)",
+          help: "ship or debug: an existing branch the session prompt names; debug refuses a conflicting checkout",
         },
         {
           name: "issue",
@@ -842,8 +842,8 @@ export const worktreesCommand: CommandSpec = {
         const month = String(f.month);
         if (!/^[0-9]{6}$/.test(month)) throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
         const named = f.branch === undefined ? undefined : String(f.branch);
-        if (named !== undefined && workflow !== "ship") {
-          throw new CommandError(EXIT.USAGE, "--branch is ship only");
+        if (named !== undefined && workflow !== "ship" && workflow !== "debug") {
+          throw new CommandError(EXIT.USAGE, "--branch is ship or debug only");
         }
         if (f.issue !== undefined && workflow !== "ship") {
           throw new CommandError(EXIT.USAGE, "--issue is ship only");
@@ -861,8 +861,13 @@ export const worktreesCommand: CommandSpec = {
             "detached HEAD — check out a branch before debugging",
           );
         }
-        const target = workflow === "ship" ? shipBranch(root, fid, named, session) : `feat/${fid}`;
-        if (isSharedBranch(target)) {
+        const target =
+          workflow === "ship"
+            ? shipBranch(root, fid, named, session)
+            : workflow === "debug" && named
+              ? named
+              : `feat/${fid}`;
+        if (isSharedBranch(target) && !(workflow === "debug" && target === DEV)) {
           throw new CommandError(
             EXIT_REFUSED,
             workflow === "ship"
@@ -870,6 +875,17 @@ export const worktreesCommand: CommandSpec = {
               : `refusing to ship ${target} as a feature branch`,
           );
         }
+        if (
+          workflow === "debug" &&
+          named &&
+          !hasLocal(root, target) &&
+          !runGit(root, ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${target}`]).ok
+        ) {
+          throw new CommandError(
+            EXIT_REFUSED,
+            `${target} does not exist — debug adopts an existing branch`,
+          );
+        }
 
         // Ship mints only when the session is not already on the branch it ships:
         // that branch cannot be checked out in two places.
@@ -899,6 +915,16 @@ export const worktreesCommand: CommandSpec = {
                 `${wtDir} is not a registered git worktree`,
               );
             }
+            if (
+              workflow === "debug" &&
+              named &&
+              git(wtDir, ["branch", "--show-current"]) !== target
+            ) {
+              throw new CommandError(
+                EXIT_REFUSED,
+                `${wtDir} is on another branch; requested ${target} — leave its work intact and use the matching checkout`,
+              );
+            }
             mode = "resumed";
           } else if (workflow !== "debug" || session !== target) {
             // Debug adopts an existing feat/{fid}; it never mints a branch of its own.
@@ -911,6 +937,12 @@ export const worktreesCommand: CommandSpec = {
         const marker = ownershipMarker(root, fid);
 
         if (mode === "adopted") {
+          if (workflow === "debug" && named && git(root, ["branch", "--show-current"]) !== target) {
+            throw new CommandError(
+              EXIT_REFUSED,
+              `adopt mode: checkout does not hold requested ${target}; use its existing checkout or enable worktrees`,
+            );
+          }
           if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
             const sw = runGit(root, ["switch", target]);
             if (!sw.ok) {
@@ -1032,7 +1064,8 @@ export const worktreesCommand: CommandSpec = {
           : { copied: [], copyMissing: [] };
         const bkitEnv = done ? linkBkitEnv(root, wt, fid, ctx.log) : null;
         const direnvAllowed = done && allowDirenv(root, wt, ctx.log);
-        const wantInstall = done && config.worktreeInstall;
+        const wantInstall =
+          done && config.worktreeInstall && fs.existsSync(path.join(wt, "package.json"));
         const installStatus = wantInstall ? install(wt, ctx.log) : 0;
 
         const baseRef = worktreeBase(wt, workflow);
diff --git a/.bkit/core/engine/ledgers/status.test.ts b/.bkit/core/engine/ledgers/status.test.ts
index 752a4d3de..5445c6097 100644
--- a/.bkit/core/engine/ledgers/status.test.ts
+++ b/.bkit/core/engine/ledgers/status.test.ts
@@ -13,9 +13,60 @@ import {
   appendLine,
   fold,
   recordAction,
+  validateCiSelection,
+  ciSelectionIdentity,
 } from "./status";
 import { readStatusEvents } from "../commands/workflow/status";
 
+describe("CI evidence selection contract", () => {
+  it("validates atomic CI and local selections with stable evidence identities", () => {
+    const selection = {
+      mode: "ci" as const,
+      provider: "github" as const,
+      repo: "example/example",
+      runId: "123",
+      runAttempt: 2,
+      runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
+      workflowId: "456",
+      workflowPath: ".github/workflows/consumer-ci.yml",
+      headBranch: "fix/ci",
+      headSha: "a".repeat(40),
+      conclusion: "failure" as const,
+      redTiers: ["integration" as const],
+      via: "prompt-run",
+    };
+    expect(validateCiSelection(selection)).toBe(true);
+    expect(validateCiSelection({ mode: "local", reason: "explicit-local" })).toBe(true);
+    expect(validateCiSelection({ ...selection, headSha: "not-a-commit" })).toBe(false);
+    expect(validateCiSelection({ ...selection, runAttempt: 0 })).toBe(false);
+    expect(validateCiSelection({ ...selection, runAttempt: 1.5 })).toBe(false);
+    expect(validateCiSelection({ ...selection, runId: "../123" })).toBe(false);
+    expect(validateCiSelection({ ...selection, repo: "../example" })).toBe(false);
+    expect(validateCiSelection({ ...selection, workflowId: "" })).toBe(false);
+    expect(validateCiSelection({ ...selection, workflowPath: "../../ci.yml" })).toBe(false);
+    expect(validateCiSelection({ ...selection, headBranch: "" })).toBe(false);
+    expect(validateCiSelection({ ...selection, headBranch: "fix/../ci" })).toBe(false);
+    expect(
+      validateCiSelection({
+        ...selection,
+        runUrl: "https://github.com/other/repo/actions/runs/123/attempts/2",
+      }),
+    ).toBe(false);
+    expect(validateCiSelection({ ...selection, redTiers: ["unknown"] })).toBe(false);
+    expect(validateCiSelection({ ...selection, conclusion: "success" })).toBe(false);
+    expect(validateCiSelection({ ...selection, provider: "other" })).toBe(false);
+    expect(validateCiSelection({ mode: "local", reason: "" })).toBe(false);
+    const identity = ciSelectionIdentity(selection);
+    expect(identity).toBe(ciSelectionIdentity({ ...selection, via: "issue-run" }));
+    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, repo: "other/example" }));
+    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, workflowId: "457" }));
+    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, runId: "124" }));
+    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, runAttempt: 3 }));
+    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, headSha: "b".repeat(40) }));
+    expect(identity).not.toBe(ciSelectionIdentity({ mode: "local", reason: "explicit-local" }));
+  });
+});
+
 describe("fold — event log → run array", () => {
   it("folds a single run, step-done appends to the open run", () => {
     const events: StatusEvent[] = [
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 8d7a4aed0..62bf78065 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -21,6 +21,83 @@ import * as path from "node:path";
 
 import { parseJson } from "../shared/json.js";
 
+export const CI_TIERS = ["static", "unit", "integration", "e2e", "live", "migration"] as const;
+export type CiTier = (typeof CI_TIERS)[number];
+export type CiSelection =
+  | { mode: "local"; reason: string }
+  | {
+      mode: "ci";
+      provider: "github";
+      repo: string;
+      runId: string;
+      runAttempt: number;
+      runUrl: string;
+      workflowId: string;
+      workflowPath: string;
+      headBranch: string;
+      headSha: string;
+      conclusion: "failure" | "timed_out" | "startup_failure";
+      redTiers: CiTier[];
+      via: string;
+    };
+
+/** Validate the whole saved selection before any reader treats it as evidence. */
+export function validateCiSelection(value: unknown): value is CiSelection {
+  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
+  const v = value as Record<string, unknown>;
+  if (v.mode === "local") return typeof v.reason === "string" && v.reason.trim().length > 0;
+  const stringField = (key: string) => (typeof v[key] === "string" ? v[key] : "");
+  const repo = stringField("repo");
+  const runId = stringField("runId");
+  const branch = stringField("headBranch");
+  return (
+    v.mode === "ci" &&
+    v.provider === "github" &&
+    /^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repo) &&
+    /^[1-9][0-9]*$/.test(runId) &&
+    Number.isSafeInteger(v.runAttempt) &&
+    Number(v.runAttempt) > 0 &&
+    stringField("runUrl") ===
+      `https://github.com/${repo}/actions/runs/${runId}/attempts/${v.runAttempt}` &&
+    /^[1-9][0-9]*$/.test(stringField("workflowId")) &&
+    /^\.github\/workflows\/[^/]+\.ya?ml$/.test(stringField("workflowPath")) &&
+    !stringField("workflowPath").includes("..") &&
+    branch.length > 0 &&
+    !branch.startsWith("-") &&
+    !branch.startsWith("/") &&
+    !branch.endsWith("/") &&
+    !/[\s~^:?*\[\\\u0000-\u001f\u007f]/.test(branch) &&
+    !branch.includes("..") &&
+    !branch.includes("//") &&
+    !branch.includes("@{") &&
+    !branch.endsWith(".") &&
+    branch.split("/").every((part) => !part.startsWith(".") && !part.endsWith(".lock")) &&
+    /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(stringField("headSha")) &&
+    ["failure", "timed_out", "startup_failure"].includes(stringField("conclusion")) &&
+    Array.isArray(v.redTiers) &&
+    v.redTiers.every((tier) => CI_TIERS.some((known) => known === tier)) &&
+    typeof v.via === "string" &&
+    v.via.trim().length > 0
+  );
+}
+
+/** Transport and wording changes preserve the identity of the evidence. */
+export function ciSelectionIdentity(selection: CiSelection): string {
+  return JSON.stringify(
+    selection.mode === "local"
+      ? ["local"]
+      : [
+          selection.provider,
+          selection.repo.toLowerCase(),
+          selection.workflowId,
+          selection.workflowPath,
+          selection.runId,
+          selection.runAttempt,
+          selection.headSha,
+        ],
+  );
+}
+
 export type Step = {
   step: string;
   status: "DONE" | "FAILED";
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index e1134d7c1..07015889b 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -31,3 +31,4 @@
 {"schema":3,"ts":1793609381497,"kind":"friction","key":"826-spike-relative-import-rework","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-spike"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"The bkit-design-spike subagent (model gpt-6.1-sol) initially hit ERR_MODULE_NOT_FOUND in its disposable GitHub metadata probe because its relative import was incorrect. It corrected the import and reran the read-only probe successfully. The orchestrator records this observation; subagents are not permitted friction writers.","status":"CLOSED"}
 {"schema":3,"ts":1793609789094,"kind":"friction","key":"826-design-friction-writer-repair","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-worktree-setup"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"Adding the spike model exposed the separate writer constraint: subagents cannot author friction rows. The orchestrator corrected by to its own workflow and step, retained the spike agent name and model in the description, and successfully appended the row.","status":"CLOSED"}
 {"schema":3,"ts":1793609789095,"kind":"friction","key":"826-design-update-header-spacing","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-apply-review"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"The design-update agent corrected a missing blank line after the generated verdict header, then reran its header check successfully. The workflow finish gate returned PASS.","status":"CLOSED"}
+{"schema":3,"ts":1793613755746,"kind":"friction","key":"build-sandbox-session-network","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-install-skills"},"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"Build setup and skill discovery needed sandbox escalation","description":"The initial repo info call could not write FETCH_HEAD or its session directory under .git. Skill registry searches returned ENOTFOUND under restricted networking. Approved escalated calls succeeded, and the workflow continued.","remediation":"Use the host permission mechanism for authorized Git metadata writes and required registry access.","source":"orchestrator","status":"CLOSED"}
diff --git a/.bkit/version b/.bkit/version
index 60da96959..218138f6a 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
-    ".bkit/cli.md": "fbcf361fb9f1496b5844c91ac7afa9cff78c67ad2dff7d06f1ccecce0affb77c",
+    ".bkit/cli.md": "b16e5a2b6cd6ed6feecbb41eba95e32b8ec40b98c69c3ee4f821a844c596f299",
     ".claude/agents/bkit-build-plan-tests.md": "eda75f0bbc0c1ddc3e69a2cdaef8c3b00a8fff7153b968eb7db24ae5dd98b58f",
     ".cursor/agents/bkit-build-plan-tests.md": "50a613fa58a0c00db0c3f79f5e908c955515234b5ec0676c1348a3bfe188b37a",
     ".opencode/agents/bkit-build-plan-tests.md": "9e654f6a332ec5659059158a0dee0853e487a4bd55f9063c86e82aa5791a03ee",
diff --git a/README.md b/README.md
index da886380e..06500f7c0 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from 1ee86de1afcac81cd38743ca656729880562e4f0 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 996a4f533..ce4bc24bb 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -2234,6 +2234,52 @@ export const branchesCommand = {
     noun: "branches",
     summary: "Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.",
     verbs: {
+        parse: {
+            summary: "Read an explicitly named or existing branch from the session prompt.",
+            use: "workflow",
+            flags: [{ name: "prompt-file", type: "string", required: true, help: "session prompt" }],
+            output: {
+                branch: "one existing branch, or null",
+                via: "explicit | token | null",
+                where: "local | remote | both | null",
+            },
+            exitCodes: {
+                3: "an explicit branch is invalid or absent",
+                8: "multiple branches were named",
+            },
+            run: (ctx) => {
+                const prompt = fs.readFileSync(path.resolve(ctx.cwd, String(ctx.flags.promptFile)), "utf8");
+                const candidates = new Map();
+                for (const token of prompt.split(/\s+/)) {
+                    const explicit = token.startsWith("branch=");
+                    const branch = explicit ? token.slice("branch=".length) : token;
+                    if (!explicit && (!branch.includes("/") || /^[a-z][a-z0-9+.-]*:\/\//i.test(branch)))
+                        continue;
+                    const valid = runGit(ctx.cwd, ["check-ref-format", "--branch", branch]).ok;
+                    const local = valid &&
+                        runGit(ctx.cwd, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`]).ok;
+                    const remote = valid &&
+                        runGit(ctx.cwd, ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${branch}`])
+                            .ok;
+                    if (!local && !remote) {
+                        if (explicit)
+                            throw new CommandError(3, `branch ${branch} is invalid or does not exist`);
+                        continue;
+                    }
+                    candidates.set(branch, {
+                        via: explicit ? "explicit" : "token",
+                        where: local && remote ? "both" : local ? "local" : "remote",
+                    });
+                }
+                if (candidates.size > 1)
+                    throw new CommandError(8, `multiple branch selections: ${[...candidates.keys()].join(", ")}`);
+                const selected = [...candidates.entries()][0];
+                ctx.emit(selected
+                    ? { branch: selected[0], ...selected[1] }
+                    : { branch: null, via: null, where: null });
+                return EXIT.OK;
+            },
+        },
         sync: {
             summary: `Fetch ${UPSTREAM}; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in.`,
             use: "workflow",
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index 7804590b1..79d89cbe1 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -21,8 +21,8 @@
 // name and not "any check".
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { statusTimestamp } from "../../ledgers/status.js";
-import { bodySkipToken, commitMessage, CommandError, DEV, EXIT, git, isSharedBranch, parseJson, runGh, runGit, SKIP_CI_TOKEN, } from "../lib.js";
+import { CI_TIERS, lastRun, statusTimestamp, validateCiSelection, } from "../../ledgers/status.js";
+import { bodySkipToken, commitMessage, CommandError, DEV, EXIT, git, isSharedBranch, parseJson, runGh, runGit, runTool, SKIP_CI_TOKEN, } from "../lib.js";
 import { ciGeneratedSteps, readBkitConfig } from "../../shared/settings.js";
 import { TIMEOUTS } from "../../shared/timeouts.js";
 import { FID_PATTERNS, fromBranch, fromMarker, issueIdOf, readIssueTracker } from "./fids.js";
@@ -32,7 +32,7 @@ import { activeRecord, checkOnlyBookkeeping, retriggerCommit } from "./ledgers.j
 import { closeTransportRow, crossCheckFile, devRequiresChecks, prRepoSlug, probePr, } from "./prs.js";
 import { resolveOwnerRepo, splitSlug } from "./repo.js";
 import { restateOutcome } from "./run-facts.js";
-import { extraField, str } from "./status.js";
+import { extraField, readRuns, str } from "./status.js";
 import { writeStepRow } from "./steps.js";
 import { attempt, issueRef, readLabels, trackerTarget } from "./tracker.js";
 const GH_MISSING = "gh is not on PATH — use the mapped GitHub MCP tool instead";
@@ -62,6 +62,297 @@ export function ciDeclared(root) {
     const rel = path.join(".github", "workflows", ciWorkflow);
     return { declared: fs.existsSync(path.join(root, rel)), ciWorkflow, path: rel };
 }
+/** Only the winning reference kind is actionable; a run takes precedence over a PR. */
+export function parseCiReference(input) {
+    const references = [];
+    const urls = [...input.matchAll(/https:\/\/github\.com\/[^\s<>"`]+/g)].map((match) => match[0].replace(/[),.;\]]+$/, ""));
+    const parsed = urls.flatMap((url) => {
+        const ref = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(actions\/runs|pull)\/([^/?#]*)([^?#]*)/.exec(url);
+        return ref ? [{ url, ref }] : [];
+    });
+    const winning = parsed.some(({ ref }) => ref[2] === "actions/runs") ? "actions/runs" : "pull";
+    for (const { url, ref } of parsed.filter(({ ref }) => ref[2] === winning)) {
+        const id = ref[3];
+        const suffix = ref[4];
+        const kind = ref[2] === "pull" ? "pr" : "run";
+        if (!/^[1-9][0-9]*$/.test(id))
+            throw new CommandError(EXIT.USAGE, `invalid ${kind} id in ${url}`);
+        let attempt;
+        if (kind === "run" && suffix !== "" && suffix !== "/") {
+            const pinned = /^\/attempts\/([1-9][0-9]*)\/?$/.exec(suffix);
+            if (!pinned || !Number.isSafeInteger(Number(pinned[1])))
+                throw new CommandError(EXIT.USAGE, `invalid run attempt in ${url}`);
+            attempt = Number(pinned[1]);
+        }
+        else if (kind === "pr" && suffix !== "" && suffix !== "/")
+            continue;
+        references.push({ kind, repo: ref[1], id, ...(attempt === undefined ? {} : { attempt }) });
+    }
+    const kind = references.some((ref) => ref.kind === "run") ? "run" : "pr";
+    const winners = [
+        ...new Map(references.filter((ref) => ref.kind === kind).map((ref) => [JSON.stringify(ref), ref])).values(),
+    ];
+    if (winners.length > 1)
+        throw new CommandError(8, `multiple ${kind} references were supplied; name one`);
+    return winners[0];
+}
+function selectionHeadRelation(cwd, selection, repo, branch) {
+    if (selection.repo.toLowerCase() !== repo.toLowerCase() || selection.headBranch !== branch) {
+        throw new CommandError(82, `selected evidence belongs to ${selection.repo} branch ${selection.headBranch}; adopted ${repo} branch ${branch}. Supply branch=${selection.headBranch} in its checkout`);
+    }
+    const head = git(cwd, ["rev-parse", "--verify", `refs/heads/${branch}^{commit}`]);
+    if (head === selection.headSha)
+        return "current";
+    if (head === null || !runGit(cwd, ["cat-file", "-e", `${selection.headSha}^{commit}`]).ok) {
+        throw new CommandError(82, `selected commit ${selection.headSha} or branch ${branch} is unavailable; ancestry is unknown`);
+    }
+    const relation = runTool("git", ["merge-base", "--is-ancestor", selection.headSha, head], cwd);
+    if (relation.status === 0)
+        return "ancestor";
+    throw new CommandError(82, relation.status === 1
+        ? `selected commit ${selection.headSha} is divergent from ${branch}`
+        : `ancestry of ${selection.headSha} is unknown: ${relation.stderr}`);
+}
+function locateCi(ctx) {
+    const f = ctx.flags;
+    const repo = String(f.repo);
+    const branch = String(f.branch);
+    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repo) ||
+        !runGit(ctx.cwd, ["check-ref-format", "--branch", branch]).ok) {
+        throw new CommandError(EXIT.USAGE, "--repo and --branch must name a repository and a valid branch");
+    }
+    const readInput = (flag) => f[flag] === undefined ? "" : fs.readFileSync(path.resolve(ctx.cwd, String(f[flag])), "utf8");
+    const prompt = readInput("promptFile");
+    const selectionFile = path.resolve(ctx.cwd, String(f.selectionOut));
+    const finish = (selection, failedJobs = []) => {
+        if (!validateCiSelection(selection))
+            throw new CommandError(82, "selected evidence has malformed or missing identity fields");
+        const headRelation = selection.mode === "ci" ? selectionHeadRelation(ctx.cwd, selection, repo, branch) : null;
+        if (headRelation === "ancestor")
+            ctx.log(`selected run ${selection.mode === "ci" ? selection.runId : ""} is historical ancestor evidence; inspect intervening changes before fixing`);
+        fs.mkdirSync(path.dirname(selectionFile), { recursive: true });
+        fs.writeFileSync(selectionFile, `${JSON.stringify(selection, null, 2)}\n`);
+        ctx.emit({
+            selection: selection.mode,
+            runId: selection.mode === "ci" ? selection.runId : null,
+            runUrl: selection.mode === "ci" ? selection.runUrl : null,
+            runAttempt: selection.mode === "ci" ? selection.runAttempt : null,
+            workflowId: selection.mode === "ci" ? selection.workflowId : null,
+            workflowPath: selection.mode === "ci" ? selection.workflowPath : null,
+            headSha: selection.mode === "ci" ? selection.headSha : null,
+            headRelation,
+            failedJobs,
+            tiers: selection.mode === "ci" ? selection.redTiers : [],
+            via: selection.mode === "ci" ? selection.via : null,
+            reason: selection.mode === "local" ? selection.reason : null,
+            selectionFile,
+        });
+        return selection.mode === "ci" ? EXIT.OK : 1;
+    };
+    if (/\[local\]/i.test(prompt))
+        return finish({ mode: "local", reason: "explicit-local" });
+    let reference = parseCiReference(prompt);
+    let via = reference ? `prompt-${reference.kind}` : "branch";
+    let saved;
+    if (!reference && f.file !== undefined && fs.existsSync(path.resolve(ctx.cwd, String(f.file)))) {
+        const active = lastRun(readRuns(path.resolve(ctx.cwd, String(f.file))), "debug");
+        if (active?.status === "IN_PROGRESS" && active.ciSelection !== undefined) {
+            if (!validateCiSelection(active.ciSelection))
+                throw new CommandError(82, "active saved CI selection is invalid");
+            saved = active.ciSelection;
+            if (saved.mode === "local")
+                return finish(saved);
+            reference = { kind: "run", repo: saved.repo, id: saved.runId, attempt: saved.runAttempt };
+            via = saved.via;
+        }
+    }
+    if (!reference) {
+        const issue = readInput("issueTextFile");
+        // issues text already removes generated comments; refuse a raw generated payload too.
+        reference = parseCiReference(/^######\s+bkit:generated/m.test(issue) ? "" : issue);
+        if (reference)
+            via = `issue-${reference.kind}`;
+    }
+    if (reference && reference.repo.toLowerCase() !== repo.toLowerCase())
+        throw new CommandError(82, `reference repository ${reference.repo} does not match adopted repository ${repo}`);
+    const declared = ciDeclared(checkoutRoot(ctx.cwd));
+    if (!reference && !declared.declared)
+        return finish({ mode: "local", reason: "no-configured-ci" });
+    const api = (endpoint, extra = []) => {
+        const response = runGh(ctx.cwd, ["api", endpoint, ...extra]);
+        if (!response.ok)
+            throw new CommandError(/HTTP 404/.test(response.stderr) ? 82 : EXIT.USE_MCP, `CI evidence unavailable: ${response.stderr || GH_MISSING}`);
+        const parsed = jsonOrUndefined(response.stdout);
+        if (parsed === undefined)
+            throw new CommandError(82, "CI evidence response is malformed");
+        return parsed;
+    };
+    const validateRun = (candidate) => {
+        const base = {
+            mode: "ci",
+            provider: "github",
+            repo,
+            runId: String(candidate.id),
+            runAttempt: Number(candidate.run_attempt),
+            runUrl: `https://github.com/${repo}/actions/runs/${candidate.id}/attempts/${candidate.run_attempt}`,
+            workflowId: String(candidate.workflow_id ?? ""),
+            workflowPath: text(candidate.path),
+            headBranch: text(candidate.head_branch),
+            headSha: text(candidate.head_sha),
+            conclusion: "failure",
+            redTiers: [],
+            via,
+        };
+        if (!validateCiSelection(base) ||
+            text(obj(candidate.repository).full_name).toLowerCase() !== repo.toLowerCase() ||
+            text(obj(candidate.head_repository).full_name).toLowerCase() !== repo.toLowerCase())
+            throw new CommandError(82, "run identity, repository or fork metadata is incomplete or mismatched");
+        if (candidate.head_branch !== branch)
+            throw new CommandError(82, `run branch ${text(candidate.head_branch)} differs from adopted branch ${branch}; supply branch=${text(candidate.head_branch)} in its checkout`);
+        if (reference?.kind !== "run" && candidate.path !== declared.path)
+            throw new CommandError(82, "discovered run does not belong to the configured workflow");
+    };
+    let run;
+    let jobs;
+    const requested = { repo, branch, kind: reference?.kind ?? "branch" };
+    if (reference?.kind === "run") {
+        requested.runId = reference.id;
+        if (reference.attempt !== undefined)
+            requested.runAttempt = reference.attempt;
+    }
+    else if (reference?.kind === "pr")
+        requested.pr = reference.id;
+    else
+        requested.workflow = declared.ciWorkflow;
+    if (f.evidenceFile !== undefined) {
+        const envelope = obj(jsonOrUndefined(readInput("evidenceFile")));
+        const request = obj(envelope.request);
+        if (envelope.complete !== true ||
+            !Object.entries(requested).every(([key, value]) => request[key] === value))
+            throw new CommandError(82, "fallback evidence is incomplete or its request identity differs");
+        if (envelope.noRed === true &&
+            !reference &&
+            typeof request.headSha === "string" &&
+            request.headSha === git(ctx.cwd, ["rev-parse", "HEAD"]))
+            return finish({ mode: "local", reason: "automatic-no-red" });
+        run = obj(envelope.run);
+        if (reference?.kind === "pr") {
+            const head = obj(obj(envelope.pr).head);
+            if (head.ref !== branch ||
+                head.sha !== run.head_sha ||
+                text(obj(head.repo).full_name).toLowerCase() !== repo.toLowerCase())
+                throw new CommandError(82, "fallback PR head is missing or differs from the selected run");
+        }
+        if (!Array.isArray(envelope.jobs) || envelope.jobs.some((job) => obj(job).id === undefined))
+            throw new CommandError(82, "fallback jobs are incomplete");
+        jobs = envelope.jobs.map(obj);
+    }
+    else {
+        let expectedHead;
+        if (reference?.kind === "pr") {
+            const pr = obj(api(`/repos/${repo}/pulls/${reference.id}`));
+            const head = obj(pr.head);
+            if (text(obj(head.repo).full_name).toLowerCase() !== repo.toLowerCase() ||
+                head.ref !== branch ||
+                !/^[0-9a-f]{40,64}$/.test(text(head.sha)))
+                throw new CommandError(82, `PR head does not match adopted ${repo} branch ${branch}; inspect its branch and fork repository`);
+            expectedHead = text(head.sha);
+        }
+        if (reference?.kind === "run") {
+            run = obj(api(`/repos/${repo}/actions/runs/${reference.id}${reference.attempt === undefined ? "" : `/attempts/${reference.attempt}`}`));
+        }
+        else {
+            const response = obj(api(`/repos/${repo}/actions/workflows/${queryValue(declared.ciWorkflow)}/runs?branch=${queryValue(branch)}&status=completed&per_page=100${expectedHead ? `&head_sha=${expectedHead}` : ""}`));
+            if (!Array.isArray(response.workflow_runs) || !Number.isSafeInteger(response.total_count))
+                throw new CommandError(82, "workflow lookup returned an incomplete response");
+            const candidates = response.workflow_runs
+                .map(obj)
+                .filter((candidate) => candidate.status === "completed");
+            run =
+                candidates.sort((a, b) => text(b.created_at).localeCompare(text(a.created_at)) || Number(b.id) - Number(a.id))[0] ?? {};
+            if (Object.keys(run).length === 0) {
+                if (Number(response.total_count) > 0)
+                    throw new CommandError(82, "workflow lookup returned no completed records despite a nonempty result");
+                if (reference)
+                    throw new CommandError(82, "named PR has no completed red run; choose [local] to discover locally");
+                return finish({ mode: "local", reason: "automatic-no-red" });
+            }
+            if (expectedHead && run.head_sha !== expectedHead)
+                throw new CommandError(82, "PR lookup returned a run from another head");
+        }
+        validateRun(run);
+        if (run.status !== "completed" ||
+            !["failure", "timed_out", "startup_failure"].includes(text(run.conclusion))) {
+            if (reference)
+                throw new CommandError(82, `named evidence is ${text(run.status)}/${text(run.conclusion)}; choose [local] to discover locally`);
+            if (run.status !== "completed" ||
+                !["success", "cancelled", "skipped", "neutral", "action_required", "stale"].includes(text(run.conclusion)))
+                throw new CommandError(82, "workflow run has an invalid state");
+            return finish({ mode: "local", reason: "automatic-no-red" });
+        }
+        const attempt = reference?.attempt ?? Number(run.run_attempt);
+        if (!Number.isSafeInteger(attempt) || attempt <= 0 || !/^[1-9][0-9]*$/.test(String(run.id)))
+            throw new CommandError(82, "run identity or attempt is missing");
+        const pages = api(`/repos/${repo}/actions/runs/${run.id}/attempts/${attempt}/jobs?per_page=100`, ["--paginate", "--slurp"]);
+        if (!Array.isArray(pages) || pages.length === 0)
+            throw new CommandError(82, "job pagination returned no complete pages");
+        const total = obj(pages[0]).total_count;
+        if (!Number.isSafeInteger(total) ||
+            Number(total) < 0 ||
+            pages.some((page) => !Array.isArray(obj(page).jobs) || obj(page).total_count !== total))
+            throw new CommandError(82, "job pagination returned incomplete pages");
+        jobs = pages.flatMap((page) => arr(obj(page).jobs).map(obj));
+        if (jobs.length !== total ||
+            new Set(jobs.map((job) => job.id)).size !== total ||
+            jobs.some((job) => !Number.isSafeInteger(job.id) ||
+                typeof job.name !== "string" ||
+                typeof job.conclusion !== "string"))
+            throw new CommandError(82, "job pagination did not return every job");
+    }
+    const attempt = reference?.attempt ?? Number(run.run_attempt);
+    validateRun(run);
+    if (jobs.some((job) => !Number.isSafeInteger(job.id) ||
+        typeof job.name !== "string" ||
+        job.name.length === 0 ||
+        typeof job.conclusion !== "string") ||
+        new Set(jobs.map((job) => job.id)).size !== jobs.length)
+        throw new CommandError(82, "job identities or conclusions are incomplete");
+    if (reference?.kind === "run" && String(run.id) !== reference.id)
+        throw new CommandError(82, "selected run differs from the requested run");
+    if (Number(run.run_attempt) !== attempt ||
+        run.status !== "completed" ||
+        text(obj(run.repository).full_name).toLowerCase() !== repo.toLowerCase() ||
+        text(obj(run.head_repository).full_name).toLowerCase() !== repo.toLowerCase())
+        throw new CommandError(82, "run attempt, repository or fork identity does not match");
+    const failedJobs = jobs.filter((job) => ["failure", "timed_out", "startup_failure"].includes(text(job.conclusion)));
+    const mapped = failedJobs
+        .filter((job) => job.name !== "bkit-tests-check")
+        .map((job) => /^bkit-tests-(static|unit|integration|e2e|live|migration)$/.exec(text(job.name))?.[1]);
+    const tiers = mapped.some((tier) => tier === undefined)
+        ? []
+        : CI_TIERS.filter((tier) => mapped.includes(tier));
+    const selection = {
+        mode: "ci",
+        provider: "github",
+        repo,
+        runId: String(run.id),
+        runAttempt: attempt,
+        runUrl: `https://github.com/${repo}/actions/runs/${run.id}/attempts/${attempt}`,
+        workflowId: String(run.workflow_id ?? ""),
+        workflowPath: text(run.path),
+        headBranch: text(run.head_branch),
+        headSha: text(run.head_sha),
+        conclusion: text(run.conclusion),
+        redTiers: tiers,
+        via,
+    };
+    if (saved?.mode === "ci" &&
+        (saved.workflowId !== selection.workflowId ||
+            saved.headSha !== selection.headSha ||
+            saved.workflowPath !== selection.workflowPath))
+        throw new CommandError(82, "saved evidence identity differs from the returned run");
+    return finish(selection, failedJobs);
+}
 /** Skip-token scan of a landed commit's body (see `bodySkipToken`). */
 export function scanBody(cwd, sha) {
     const token = bodySkipToken(cwd, sha);
@@ -1591,6 +1882,58 @@ export const runsCommand = {
     noun: "runs",
     summary: "CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on one; auto's start context.",
     verbs: {
+        locate: {
+            summary: "Select and validate the red CI run for the adopted debug branch before local discovery: exit 0 selects red CI, 1 selects local discovery, 2 rejects arguments, 8 rejects ambiguous references, 80 requests read fallback, and 82 requires owner action for unavailable or mismatched evidence.",
+            use: "workflow",
+            flags: [
+                {
+                    name: "prompt-file",
+                    type: "string",
+                    required: true,
+                    help: "session prompt; [local] overrides all CI references",
+                },
+                {
+                    name: "issue-text-file",
+                    type: "string",
+                    help: "current issue description and human comments from issues text",
+                },
+                { name: "branch", type: "string", required: true, help: "adopted existing branch" },
+                { name: "repo", type: "string", required: true, help: "owner/repository" },
+                {
+                    name: "file",
+                    type: "string",
+                    help: "active debug status log; saved selection takes precedence over issue discovery",
+                },
+                {
+                    name: "selection-out",
+                    type: "string",
+                    required: true,
+                    help: "write the validated candidate selection; does not update active metadata",
+                },
+                {
+                    name: "evidence-file",
+                    type: "string",
+                    help: "normalized fallback JSON: exact request identity, run, complete jobs, complete:true; automatic no-red also identifies workflow and inspected head",
+                },
+            ],
+            output: {
+                selection: "ci | local",
+                runId: "selected run ID, or null",
+                runUrl: "selected attempt URL, or null",
+                runAttempt: "frozen attempt, or null",
+                workflowId: "selected workflow ID, or null",
+                workflowPath: "selected workflow path, or null",
+                headSha: "selected commit, or null",
+                headRelation: "current | ancestor | null; divergent or unknown evidence exits 82",
+                failedJobs: "complete failed-job list",
+                tiers: "known failed tiers; empty when any failed job is unknown",
+                via: "prompt-run | prompt-pr | issue-run | issue-pr | branch, or null",
+                reason: "local selection reason, or null",
+                selectionFile: "validated candidate JSON path",
+            },
+            exitCodes: { 8: "ambiguous winning references" },
+            run: locateCi,
+        },
         wait: {
             summary: "Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed.",
             use: "by-hand",
diff --git a/dist/commands/workflow/worktrees.js b/dist/commands/workflow/worktrees.js
index 5fa5d871e..5ea56290e 100644
--- a/dist/commands/workflow/worktrees.js
+++ b/dist/commands/workflow/worktrees.js
@@ -645,7 +645,7 @@ export const worktreesCommand = {
                 {
                     name: "branch",
                     type: "string",
-                    help: "ship only: the branch the session prompt names (default: feat/{fid} when it exists, else the session branch)",
+                    help: "ship or debug: an existing branch the session prompt names; debug refuses a conflicting checkout",
                 },
                 {
                     name: "issue",
@@ -698,8 +698,8 @@ export const worktreesCommand = {
                 if (!/^[0-9]{6}$/.test(month))
                     throw new CommandError(EXIT.USAGE, "--month must be YYYYMM");
                 const named = f.branch === undefined ? undefined : String(f.branch);
-                if (named !== undefined && workflow !== "ship") {
-                    throw new CommandError(EXIT.USAGE, "--branch is ship only");
+                if (named !== undefined && workflow !== "ship" && workflow !== "debug") {
+                    throw new CommandError(EXIT.USAGE, "--branch is ship or debug only");
                 }
                 if (f.issue !== undefined && workflow !== "ship") {
                     throw new CommandError(EXIT.USAGE, "--issue is ship only");
@@ -713,12 +713,22 @@ export const worktreesCommand = {
                 if (workflow === "debug" && session === "") {
                     throw new CommandError(EXIT_REFUSED, "detached HEAD — check out a branch before debugging");
                 }
-                const target = workflow === "ship" ? shipBranch(root, fid, named, session) : `feat/${fid}`;
-                if (isSharedBranch(target)) {
+                const target = workflow === "ship"
+                    ? shipBranch(root, fid, named, session)
+                    : workflow === "debug" && named
+                        ? named
+                        : `feat/${fid}`;
+                if (isSharedBranch(target) && !(workflow === "debug" && target === DEV)) {
                     throw new CommandError(EXIT_REFUSED, workflow === "ship"
                         ? `refusing to ship ${target}: /bkit-ship ships a feature branch into ${DEV} only; it never opens a PR from ${DEV} into ${MAIN} or merges into ${MAIN}, releases stay manual. Name the feature branch to ship.`
                         : `refusing to ship ${target} as a feature branch`);
                 }
+                if (workflow === "debug" &&
+                    named &&
+                    !hasLocal(root, target) &&
+                    !runGit(root, ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${target}`]).ok) {
+                    throw new CommandError(EXIT_REFUSED, `${target} does not exist — debug adopts an existing branch`);
+                }
                 // Ship mints only when the session is not already on the branch it ships:
                 // that branch cannot be checked out in two places.
                 if (f.worktrees === true && f.detect === true)
@@ -744,6 +754,11 @@ export const worktreesCommand = {
                         if (real(git(wtDir, ["rev-parse", "--show-toplevel"]) ?? "") !== real(wtDir)) {
                             throw new CommandError(EXIT_NOT_A_WORKTREE, `${wtDir} is not a registered git worktree`);
                         }
+                        if (workflow === "debug" &&
+                            named &&
+                            git(wtDir, ["branch", "--show-current"]) !== target) {
+                            throw new CommandError(EXIT_REFUSED, `${wtDir} is on another branch; requested ${target} — leave its work intact and use the matching checkout`);
+                        }
                         mode = "resumed";
                     }
                     else if (workflow !== "debug" || session !== target) {
@@ -756,6 +771,9 @@ export const worktreesCommand = {
                 const logDir = logDirOf(wt, month, fid);
                 const marker = ownershipMarker(root, fid);
                 if (mode === "adopted") {
+                    if (workflow === "debug" && named && git(root, ["branch", "--show-current"]) !== target) {
+                        throw new CommandError(EXIT_REFUSED, `adopt mode: checkout does not hold requested ${target}; use its existing checkout or enable worktrees`);
+                    }
                     if (workflow === "ship" && git(root, ["branch", "--show-current"]) !== target) {
                         const sw = runGit(root, ["switch", target]);
                         if (!sw.ok) {
@@ -855,7 +873,7 @@ export const worktreesCommand = {
                     : { copied: [], copyMissing: [] };
                 const bkitEnv = done ? linkBkitEnv(root, wt, fid, ctx.log) : null;
                 const direnvAllowed = done && allowDirenv(root, wt, ctx.log);
-                const wantInstall = done && config.worktreeInstall;
+                const wantInstall = done && config.worktreeInstall && fs.existsSync(path.join(wt, "package.json"));
                 const installStatus = wantInstall ? install(wt, ctx.log) : 0;
                 const baseRef = worktreeBase(wt, workflow);
                 const branch = git(wt, ["branch", "--show-current"]) ?? "";
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index 5a704c772..2e7f17be7 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -18,6 +18,60 @@ import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { parseJson } from "../shared/json.js";
+export const CI_TIERS = ["static", "unit", "integration", "e2e", "live", "migration"];
+/** Validate the whole saved selection before any reader treats it as evidence. */
+export function validateCiSelection(value) {
+    if (value === null || typeof value !== "object" || Array.isArray(value))
+        return false;
+    const v = value;
+    if (v.mode === "local")
+        return typeof v.reason === "string" && v.reason.trim().length > 0;
+    const stringField = (key) => (typeof v[key] === "string" ? v[key] : "");
+    const repo = stringField("repo");
+    const runId = stringField("runId");
+    const branch = stringField("headBranch");
+    return (v.mode === "ci" &&
+        v.provider === "github" &&
+        /^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repo) &&
+        /^[1-9][0-9]*$/.test(runId) &&
+        Number.isSafeInteger(v.runAttempt) &&
+        Number(v.runAttempt) > 0 &&
+        stringField("runUrl") ===
+            `https://github.com/${repo}/actions/runs/${runId}/attempts/${v.runAttempt}` &&
+        /^[1-9][0-9]*$/.test(stringField("workflowId")) &&
+        /^\.github\/workflows\/[^/]+\.ya?ml$/.test(stringField("workflowPath")) &&
+        !stringField("workflowPath").includes("..") &&
+        branch.length > 0 &&
+        !branch.startsWith("-") &&
+        !branch.startsWith("/") &&
+        !branch.endsWith("/") &&
+        !/[\s~^:?*\[\\\u0000-\u001f\u007f]/.test(branch) &&
+        !branch.includes("..") &&
+        !branch.includes("//") &&
+        !branch.includes("@{") &&
+        !branch.endsWith(".") &&
+        branch.split("/").every((part) => !part.startsWith(".") && !part.endsWith(".lock")) &&
+        /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(stringField("headSha")) &&
+        ["failure", "timed_out", "startup_failure"].includes(stringField("conclusion")) &&
+        Array.isArray(v.redTiers) &&
+        v.redTiers.every((tier) => CI_TIERS.some((known) => known === tier)) &&
+        typeof v.via === "string" &&
+        v.via.trim().length > 0);
+}
+/** Transport and wording changes preserve the identity of the evidence. */
+export function ciSelectionIdentity(selection) {
+    return JSON.stringify(selection.mode === "local"
+        ? ["local"]
+        : [
+            selection.provider,
+            selection.repo.toLowerCase(),
+            selection.workflowId,
+            selection.workflowPath,
+            selection.runId,
+            selection.runAttempt,
+            selection.headSha,
+        ]);
+}
 // Identity for de-dup under union merge. `step-done` is unique per
 // (workflow, step, parentSha, at); workflow-level events per (type, workflow, at).
 function identity(e) {
diff --git a/docs/capabilities.md b/docs/capabilities.md
index df6dbcde9..424f9033f 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `6af3da0ad`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `1ee86de1a`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from 1ee86de1afcac81cd38743ca656729880562e4f0 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from 1ee86de1afcac81cd38743ca656729880562e4f0 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index 17a156e23..9c7121885 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -119,3 +119,8 @@
 {"schema":3,"ts":1793580704225,"firstTs":1787778000000,"updates":6,"kind":"failure","key":"block-locality-audit-quote-mask-pairs-comment-apostrophe-across-lines","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-failures","model":"claude-opus-5-5"},"references":["docs/audits/202610/testing.md","testing-13","5f5a097cc9e4e6dd44cf46ad74457064a2a798c5"],"category":"tooling","summary":"maskNonExpansions quote mask is not comment-aware (re-observed by the testing audit)","severity":"LOW","description":".bkit/core/engine/audits/workflows/block-locality-audit.test.ts:161 maskNonExpansions still runs a quote-mask regex (:182) with no awareness of # comments, so an apostrophe in a comment pairs with a later quote and blanks real assignments. Still open at 5f5a097c.","remediation":"Make the mask comment-aware, or strip # comment spans before the quote-mask regex.","status":"OPEN"}
 {"schema":3,"ts":1793580704226,"firstTs":1792632974729,"updates":2,"kind":"failure","key":"plan-update-stub-keeps-prior-verdict-header","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-failures","model":"claude-opus-5-5"},"references":["651",".bkit/core/prompts/bkit-plan-update.md",".bkit/core/prompts/bkit-design-update.md",".bkit/core/engine/commands/workflow/steps.ts","docs/plans/202610/logs/651-sops-env-backup/plan-v3-checked.md"],"category":"agentic","severity":"LOW","status":"OPEN","summary":"bkit-plan-update seeds plan-v3-checked.md with the prior verdict header still in the body","description":".bkit/core/prompts/bkit-plan-update.md:78 runs `bkit steps stub` without `--strip-header`. The same prompt serves plan-apply-review (v1 has no header, so nothing leaks) and plan-apply-scope (v2 carries its own `Verdict:` + `<!-- verdict:end -->` header). On the apply-scope pass the stub writes the new PENDING header on top of the full v2 text, so v3 holds two headers: the stale `Verdict: CONCERNS` line and a second verdict:end marker sit below the real header and flow into the canonical plan via `workflows promote` (which copies headers as-is). Hit on 651-sops-env-backup: stub emitted `stripped:false`; the stale header was removed by hand with Edit. bkit-design-update.md:57 has the same stub call shape.","rootCause":"The stub call in bkit-plan-update.md (and bkit-design-update.md) omits `--strip-header`, which bkit-design-organise.md:55 passes; `steps stub` keeps the prior header by default (.bkit/core/engine/commands/workflow/steps.ts:1770-1773).","remediation":"Pass `--strip-header` in the stub command of .bkit/core/prompts/bkit-plan-update.md (and bkit-design-update.md if its prior versions carry headers); stripHeader is a no-op guard needed only when the prior file has a verdict:end line, so check that it leaves a header-less v1 intact before switching; update .bkit/prompts.md in the same change and run bkit install for mirrors."}
 {"schema":3,"ts":1793581080719,"firstTs":1792238860082,"updates":3,"kind":"failure","key":"audit-dead-code-readme-pngs-unread","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["docs/audits/202610/dead-code.md","dead-code-6","docs/audits/202611/failures.md","failures-9","816"],"category":"docs","summary":"Themed README PNGs are wanted: social media cannot use the SVG twins","severity":"MEDIUM","description":"Refuted by the owner on #816 (closed not planned): the .github/assets/bkit-*-{dark,light}.png files that scripts/readme/readme-art.mjs:2615-2621 writes beside each .svg are kept because social media cannot use SVG. They are not dead output.","status":"CLOSED"}
+{"schema":3,"ts":1793615638845,"firstTs":1791961279983,"updates":4,"kind":"failure","key":"runs-test-ci-refuses-not-open-pr-timeout-under-full-suite","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["814","docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-1-log.md"],"category":"testing","severity":"LOW","summary":"The existing CI context refusal test times out under concurrent audits and passes in isolation","description":"The group-1 changed-file check timed out at 5201ms in runs.test.ts: CI refuses a PR that is not open (7) and a head with no CI run (8). Another worktree was running audits concurrently. The unchanged file and ci-scripts.test.ts passed together, 207 tests in 29.07 seconds. The complete changed check remained FAIL on this and four other timeouts.","rootCause":"Concurrent host load exceeded the existing test budget; this recurrence had no assertion failure.","status":"TRIAGED"}
+{"schema":3,"ts":1793615638846,"firstTs":1793001499429,"updates":3,"kind":"failure","key":"ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["814","docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-1-log.md"],"category":"testing","severity":"LOW","summary":"The shipped resolve-push-base standalone audit times out under concurrent audits and passes in isolation","description":"The group-1 changed-file check timed out at 30000ms in ci-scripts.test.ts: ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own. Another worktree was running audits concurrently. The unchanged file and runs.test.ts passed together, 207 tests in 29.07 seconds. The complete changed check remained FAIL on this and four other timeouts.","rootCause":"Concurrent host load exceeded the existing test budget; this recurrence had no assertion failure.","status":"TRIAGED"}
+{"schema":3,"ts":1793615638847,"firstTs":1793615638847,"updates":1,"kind":"failure","key":"runs-revalidate-pr-head-auth-timeout-under-audits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-1-log.md"],"category":"testing","severity":"LOW","summary":"The existing revalidate PR-head/auth test times out under concurrent audits and passes in isolation","description":"The group-1 changed-file check timed out at 5201ms in runs.test.ts: exits 1 when the PR head cannot be read, 80 when gh needs auth. Another worktree was running audits concurrently. The unchanged file and ci-scripts.test.ts passed together, 207 tests in 29.07 seconds.","rootCause":"Concurrent host load exceeded the existing test budget; there was no assertion failure.","status":"OPEN"}
+{"schema":3,"ts":1793615638848,"firstTs":1793615638848,"updates":1,"kind":"failure","key":"runs-context-label-read-timeout-under-audits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-1-log.md"],"category":"testing","severity":"LOW","summary":"The existing CI-context label-read test times out under concurrent audits and passes in isolation","description":"The group-1 changed-file check timed out at 5201ms in runs.test.ts: prints ref (#N on GitHub) and the labels the engine reads; a failed read is null. Another worktree was running audits concurrently. The unchanged file and ci-scripts.test.ts passed together, 207 tests in 29.07 seconds.","rootCause":"Concurrent host load exceeded the existing test budget; there was no assertion failure.","status":"OPEN"}
+{"schema":3,"ts":1793615638849,"firstTs":1793615638849,"updates":1,"kind":"failure","key":"runs-context-issue-less-timeout-under-audits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-1-log.md"],"category":"testing","severity":"LOW","summary":"The existing issue-less CI-context refusal test times out under concurrent audits and passes in isolation","description":"The group-1 changed-file check timed out at 5201ms in runs.test.ts: runs context refuses an issue-less marker and branch naming the missing issue. Another worktree was running audits concurrently. The unchanged file and ci-scripts.test.ts passed together, 207 tests in 29.07 seconds.","rootCause":"Concurrent host load exceeded the existing test budget; there was no assertion failure.","status":"OPEN"}
