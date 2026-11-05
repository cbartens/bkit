/** Opt-in live evidence. Mutations require explicit disposable target arguments. */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  gh,
  linearGql,
  JiraSession,
  JIRA_MCP_URL,
  postComment,
  recentComments,
  postCommentOnce,
  stampMarker,
  trackerTarget,
  markerHashOf,
} from "../../../../../../.bkit/core/engine/commands/workflow/tracker.ts";
import type {
  TrackerTarget,
  CommentEvidence,
} from "../../../../../../.bkit/core/engine/commands/workflow/tracker.ts";

const args = new Set(process.argv.slice(2));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const rows = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.map(object) : [];
const record = (stage: string, value: unknown) =>
  console.log(JSON.stringify({ version: 1, stage, value }));
const reason = (error: unknown) =>
  error instanceof Error
    ? { name: error.name, message: error.message.slice(0, 600) }
    : { name: "unknown" };

/** Discovery only: use the same endpoint, bearer credential and MCP protocol as JiraSession. */
async function jiraSchemas() {
  const headers: Record<string, string> = {
    authorization: `Bearer ${process.env.BKIT_JIRA_API_KEY ?? ""}`,
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
  };
  async function rpc(body: object) {
    const response = await fetch(JIRA_MCP_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Rovo discovery HTTP ${response.status}`);
    const session = response.headers.get("mcp-session-id");
    if (session) headers["mcp-session-id"] = session;
    const text = await response.text();
    const payloads = response.headers.get("content-type")?.includes("event-stream")
      ? text
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
      : [text];
    for (const payload of payloads) {
      if (!payload) continue;
      const parsed = JSON.parse(payload);
      if (parsed.id !== undefined) return parsed;
    }
    return null;
  }
  await rpc({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "bkit-contract-probe", version: "1" },
    },
  });
  await rpc({ jsonrpc: "2.0", method: "notifications/initialized" });
  const schemas = await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const relevant =
    schemas?.result?.tools?.filter((tool: { name: string }) =>
      /Jira|Atlassian|^execute/.test(tool.name),
    ) ?? [];
  record("jira-schemas", { digest: hash(JSON.stringify(relevant)), tools: relevant });
}

async function discover() {
  for (const name of ["BKIT_GH_TOKEN", "BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"])
    record("credential", { name, present: Boolean(process.env[name]) });
  try {
    const teams = await linearGql("query { teams(first: 10) { nodes { id key name } } }", {});
    record("linear-scope", teams);
    const schema = await linearGql(
      'query { create: __type(name:"CommentCreateInput") { name inputFields { name type { kind name ofType { name kind } } } } update: __type(name:"CommentUpdateInput") { name inputFields { name type { kind name ofType { name kind } } } } }',
      {},
    );
    record("linear-schema", schema);
  } catch (error) {
    record("linear-unavailable", reason(error));
  }
  try {
    await jiraSchemas();
  } catch (error) {
    record("jira-schema-unavailable", reason(error));
  }
  try {
    record("jira-resources", await JiraSession.open().call("getAccessibleAtlassianResources", {}));
  } catch (error) {
    record("jira-unavailable", reason(error));
  }
}

const option = (name: string) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
async function runContract() {
  const provider = option("provider"),
    issue = option("issue");
  if (
    !args.has("--disposable-confirm") ||
    !issue ||
    !["github", "linear", "jira"].includes(provider ?? "")
  )
    throw new Error("Explicit disposable confirmation, provider and issue required");
  const base = trackerTarget(process.cwd(), { issue: "837" });
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-live-contract-")));
  assert.equal(spawnSync("git", ["init", "-b", "dev"], { cwd: root }).status, 0);
  const target = {
    ...base,
    tracker: provider,
    issue,
    cwd: root,
    jiraSite: option("site") ?? null,
  } as TrackerTarget;
  let title: unknown;
  if (provider === "github")
    title = gh(target, ["api", `repos/${target.ownerRepo}/issues/${issue}`, "--jq", ".title"]);
  if (provider === "linear")
    title = await linearGql("query($id:String!){issue(id:$id){title}}", { id: issue });
  if (provider === "jira")
    title = await JiraSession.open().call("getJiraIssue", {
      cloudId: target.jiraSite,
      issueIdOrKey: issue,
      fields: ["summary"],
    });
  assert.match(JSON.stringify(title), /Disposable workflow comment contract probe/i);
  const prefix = `${provider}-${Date.now()}`;
  record("target", { provider, issue, root, titleValidated: true, evidenceVersion: 1 });
  const body = (text: string) => stampMarker(`###### bkit:generated\n${prefix}: ${text}\n`);
  const log = (text: string) => record("diagnostic", { provider, text });
  async function check(label: string, fn: () => Promise<unknown>) {
    try {
      const evidence = await fn();
      record(label, { provider, pass: true, evidence });
      return evidence;
    } catch (error) {
      record(label, { provider, pass: false, ...reason(error) });
      process.exitCode = 1;
      return undefined;
    }
  }
  if (args.has("--counts-only")) {
    const created = await postComment(target, body("capacity probe seed"));
    assert.ok(created.evidence, "counting requires verified disposable comment identity");
    const identity = created.evidence;
    const limit = provider === "github" ? 65536 : provider === "linear" ? 100000 : 32767;
    const sized = (size: number, unit: "utf16" | "scalars" | "utf8", emoji: boolean) => {
      const initial = body("capacity\n");
      const left =
        size -
        (unit === "utf16"
          ? initial.length
          : unit === "utf8"
            ? Buffer.byteLength(initial)
            : Array.from(initial).length);
      const width = unit === "utf16" ? 2 : unit === "utf8" ? 4 : 1;
      const padding = emoji
        ? "😀".repeat(Math.floor(left / width)) + "a".repeat(left % width)
        : "a".repeat(left);
      return stampMarker(initial + padding);
    };
    const samples: Array<readonly [string, number, "utf16" | "scalars" | "utf8", boolean]> =
      args.has("--final-counts")
        ? provider === "github"
          ? [
              ["emoji-262144-utf8", 262144, "utf8", true],
              ["emoji-262145-utf8", 262145, "utf8", true],
            ]
          : provider === "jira"
            ? [
                ["ascii-32769", 32769, "utf16", false],
                ["ascii-32770", 32770, "utf16", false],
                ["ascii-32771", 32771, "utf16", false],
                ["ascii-32772", 32772, "utf16", false],
                ["ascii-32773", 32773, "utf16", false],
                ["ascii-32774", 32774, "utf16", false],
                ["emoji-32770-utf16", 32770, "utf16", true],
                ["emoji-32771-utf16", 32771, "utf16", true],
              ]
            : []
        : args.has("--extra-counts")
          ? provider === "github"
            ? [
                ["ascii-262144", 262144, "utf16", false],
                ["ascii-262145", 262145, "utf16", false],
                ["emoji-262144-scalars", 262144, "scalars", true],
                ["emoji-262145-scalars", 262145, "scalars", true],
              ]
            : provider === "jira"
              ? [
                  ["ascii-32775", 32775, "utf16", false],
                  ["ascii-32776", 32776, "utf16", false],
                  ["ascii-32777", 32777, "utf16", false],
                  ["emoji-32775-utf16", 32775, "utf16", true],
                  ["emoji-32777-utf16", 32777, "utf16", true],
                ]
              : []
          : [
              ["ascii-at-limit", limit, "utf16", false],
              ["ascii-over-limit", limit + 1, "utf16", false],
              ["emoji-utf16-limit", limit, "utf16", true],
              ["emoji-scalar-limit", limit, "scalars", true],
              ["emoji-scalar-over-limit", limit + 1, "scalars", true],
            ];
    for (const [label, size, unit, emoji] of samples) {
      const content = sized(size, unit, emoji);
      try {
        if (provider === "jira")
          await JiraSession.open().call("addOrEditJiraIssueComment", {
            cloudId: target.jiraSite,
            issueIdOrKey: issue,
            commentId: identity.id,
            commentBody: content,
            contentFormat: "markdown",
            responseContentFormat: "markdown",
          });
        else await postComment(target, content, { commentId: identity.id, evidence: identity });
        const observed = (await recentComments(target, 1)).at(-1);
        record("counting", {
          provider,
          label,
          accepted: true,
          requestedUtf16: content.length,
          requestedScalars: Array.from(content).length,
          utf8Bytes: Buffer.byteLength(content),
          returnedUtf16: observed?.body.length,
          markerPreserved: markerHashOf(observed?.body ?? "") === markerHashOf(content),
          url: created.url,
        });
      } catch (error) {
        record("counting", {
          provider,
          label,
          accepted: false,
          requestedUtf16: content.length,
          requestedScalars: Array.from(content).length,
          utf8Bytes: Buffer.byteLength(content),
          ...reason(error),
        });
      }
    }
    await postComment(target, body("capacity probe complete; synthetic boundary payload cleared"), {
      commentId: identity.id,
      evidence: identity,
    });
    return;
  }
  if (args.has("--lost-only")) {
    const modeFile = path.join(root, "fault.json");
    const transportFile = path.join(root, "transport.cjs");
    const state = () => JSON.parse(fs.readFileSync(modeFile, "utf8"));
    const set = (values: object) =>
      fs.writeFileSync(
        modeFile,
        JSON.stringify({
          loseWrites: 0,
          failWrites: 0,
          blockAfterDrop: false,
          dropped: false,
          calls: [],
          ...values,
        }),
      );
    set({});
    const originalFetch = globalThis.fetch,
      originalPath = process.env.PATH,
      originalSelector = process.env.BKIT_FAKE_TOOL_SCRIPT;
    if (provider === "github") {
      const actual = spawnSync("which", ["gh"], { encoding: "utf8" }).stdout.trim();
      assert.ok(path.isAbsolute(actual));
      fs.writeFileSync(
        transportFile,
        String.raw`
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const file=process.argv[2],real=process.argv[3],args=process.argv.slice(4);
const state=JSON.parse(fs.readFileSync(file,'utf8'));
const write=args.includes('PATCH')||args.includes('POST');
const read=args[1]==='graphql';
state.calls.push({write,read});
if((write&&state.failWrites>0)||(read&&state.dropped&&state.blockAfterDrop)) { if(write)state.failWrites--;fs.writeFileSync(file,JSON.stringify(state));process.stderr.write('temporary network error injected by disposable probe');process.exit(1); }
const input=args.includes('--input')?fs.readFileSync(0):undefined;
const result=spawnSync(real,args,{input,encoding:'utf8',env:process.env,maxBuffer:16000000,timeout:25000});
if(write&&result.status===0&&state.loseWrites>0){state.loseWrites--;state.dropped=true;fs.writeFileSync(file,JSON.stringify(state));process.stderr.write('temporary network error after acknowledged write discarded by probe');process.exit(1);}
fs.writeFileSync(file,JSON.stringify(state));process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');process.exit(result.status??1);
`,
      );
      const toolBody = path.join(root, "gh-body.sh");
      fs.writeFileSync(
        toolBody,
        `#!/bin/sh\nexec '${process.execPath}' '${transportFile}' '${modeFile}' '${actual}' "$@"\n`,
      );
      fs.mkdirSync(path.join(root, "bin"));
      fs.symlinkSync(path.resolve("tests/fixtures/gh/bin/gh"), path.join(root, "bin/gh"));
      process.env.PATH = `${root}/bin:${originalPath ?? ""}`;
      process.env.BKIT_FAKE_TOOL_SCRIPT = toolBody;
    } else {
      globalThis.fetch = async (input, init) => {
        const payload = object(JSON.parse(String(init?.body ?? "{}")));
        const params = object(payload.params);
        const write =
          provider === "linear"
            ? /comment(?:Create|Update)/.test(String(payload.query))
            : params.name === "addOrEditJiraIssueComment";
        const read =
          provider === "linear"
            ? /comments\(/.test(String(payload.query))
            : params.name === "listJiraIssueComments";
        const current = state();
        current.calls.push({ write, read });
        if (
          (write && current.failWrites > 0) ||
          (read && current.dropped && current.blockAfterDrop)
        ) {
          if (write) current.failWrites--;
          fs.writeFileSync(modeFile, JSON.stringify(current));
          throw new Error("Disposable probe injected transport failure");
        }
        fs.writeFileSync(modeFile, JSON.stringify(current));
        const response = await originalFetch(input, init);
        if (write && response.ok && current.loseWrites > 0) {
          await response.clone().text();
          current.loseWrites--;
          current.dropped = true;
          fs.writeFileSync(modeFile, JSON.stringify(current));
          throw new Error("Disposable probe discarded acknowledged write response");
        }
        return response;
      };
    }
    const publication = { invocation: hash(`${prefix}-lost`), workflow: "build" };
    let sequence = 0;
    const publish = (text: string) =>
      postCommentOnce(target, body(text), {
        publication,
        key: `build/1/step/${++sequence}/comment`,
        purpose: "routine",
        log,
      });
    try {
      const seed = object(await publish("lost-response seed"));
      assert.equal(seed.done, true);
      set({ loseWrites: 1 });
      const recognized = object(await publish("accepted append response discarded; recognizable"));
      assert.equal(recognized.done, true);
      assert.equal(recognized.url, seed.url);
      const recognizedCalls = state();
      assert.equal(recognizedCalls.loseWrites, 0);
      record("lost-response-recognized", {
        provider,
        pass: true,
        url: recognized.url,
        calls: recognizedCalls.calls,
      });
      set({ loseWrites: 1, blockAfterDrop: true });
      const fallback = object(
        await publish("accepted append response discarded; reconciliation unavailable"),
      );
      assert.equal(fallback.done, true);
      assert.notEqual(fallback.url, recognized.url);
      const fallbackCalls = state();
      assert.ok(fallbackCalls.dropped);
      set({});
      const comments = await recentComments(target, 20);
      const copies = comments.filter((comment) =>
        comment.body.includes("accepted append response discarded; reconciliation unavailable"),
      );
      assert.ok(
        copies.length >= 2,
        "uncertain accepted append plus standalone fallback may duplicate the report",
      );
      record("lost-response-new-fallback", {
        provider,
        pass: true,
        url: fallback.url,
        observedCopies: copies.length,
        calls: fallbackCalls.calls,
      });
      set({ failWrites: 3 });
      const failed = object(await publish("all comment writes unavailable"));
      assert.equal(failed.done, false);
      const exhausted = state();
      assert.ok(exhausted.calls.filter((call: { write: boolean }) => call.write).length <= 3);
      const friction = fs
        .readFileSync(path.join(root, ".bkit/friction.jsonl"), "utf8")
        .trim()
        .split("\n")
        .map((line) => object(JSON.parse(line)));
      assert.ok(friction.some((row) => row.kind === "friction" && row.category === "tool-failure"));
      set({});
      const continued = object(await publish("substantive continuation after exhausted delivery"));
      assert.equal(continued.done, true);
      record("lost-response-exhausted-continued", {
        provider,
        pass: true,
        failed,
        continued,
        calls: exhausted.calls,
        realFriction: true,
      });
    } catch (error) {
      record("lost-response-unavailable", { provider, pass: false, ...reason(error) });
      process.exitCode = 1;
    } finally {
      globalThis.fetch = originalFetch;
      process.env.PATH = originalPath;
      if (originalSelector === undefined) delete process.env.BKIT_FAKE_TOOL_SCRIPT;
      else process.env.BKIT_FAKE_TOOL_SCRIPT = originalSelector;
    }
    return;
  }
  let identity: CommentEvidence | undefined;
  await check("create-edit-read-marker", async () => {
    const created = await postComment(target, body("identity first 😀"));
    assert.ok(created.evidence?.authorId, "create returned verified author identity");
    identity = created.evidence;
    const first = (await recentComments(target, 3)).find(
      (item) => item.evidence?.id === identity?.id,
    );
    assert.equal(first?.evidence?.fingerprint, identity.fingerprint);
    assert.equal(markerHashOf(first!.body), markerHashOf(body("identity first 😀")));
    const edited = await postComment(target, body("identity edit 😀"), {
      commentId: identity.id,
      evidence: identity,
    });
    const read1 = (await recentComments(target, 3)).find(
      (item) => item.evidence?.id === identity?.id,
    );
    const read2 = (await recentComments(target, 3)).find(
      (item) => item.evidence?.id === identity?.id,
    );
    assert.ok(edited.evidence, "edit returned verified evidence");
    assert.deepEqual(read1?.evidence, read2?.evidence);
    assert.equal(read1?.evidence?.fingerprint, edited.evidence.fingerprint);
    assert.equal(read1?.evidence?.authorId, identity.authorId);
    assert.equal(read1?.evidence?.createdAt, identity.createdAt);
    assert.equal(markerHashOf(read1!.body), markerHashOf(body("identity edit 😀")));
    identity = edited.evidence;
    return {
      url: created.url,
      id: identity.id,
      authorId: identity.authorId,
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt,
      representation: identity.representation,
      fingerprint: identity.fingerprint,
      markerPreserved: true,
    };
  });
  await check("creation-order-pagination", async () => {
    const second = await postComment(target, body("newer created"));
    assert.ok(second.evidence);
    if (identity)
      await postComment(target, body("older externally edited after newer create"), {
        commentId: identity.id,
        evidence: identity,
      });
    assert.equal((await recentComments(target, 1)).at(-1)?.evidence?.id, second.evidence.id);
    if (provider === "github") {
      const query =
        "query($o:String!,$r:String!,$n:Int!,$before:String){repository(owner:$o,name:$r){issue(number:$n){comments(last:1,before:$before){nodes{databaseId createdAt}pageInfo{hasPreviousPage startCursor}}}}}";
      const [owner, repo] = target.ownerRepo.split("/");
      const read = (cursor?: string) =>
        JSON.parse(
          gh(target, [
            "api",
            "graphql",
            "-f",
            `query=${query}`,
            "-F",
            `o=${owner}`,
            "-F",
            `r=${repo}`,
            "-F",
            `n=${issue}`,
            ...(cursor ? ["-f", `before=${cursor}`] : []),
          ]),
        ).data.repository.issue.comments;
      const page1 = read();
      assert.equal(String(page1.nodes[0].databaseId), second.evidence.id);
      assert.ok(page1.pageInfo.hasPreviousPage);
      const page2 = read(page1.pageInfo.startCursor);
      assert.notEqual(page1.nodes[0].databaseId, page2.nodes[0].databaseId);
      return { pageSize: 1, distinctPages: true, newestCreatedUnchangedByOlderEdit: true };
    }
    if (provider === "linear") {
      const query =
        "query($id:String!,$after:String){issue(id:$id){comments(first:1,after:$after){nodes{id createdAt}pageInfo{hasNextPage endCursor}}}}";
      const first = await linearGql(query, { id: issue, after: null });
      const page1 = object(object(first.issue).comments);
      const info = object(page1.pageInfo);
      assert.ok(info.hasNextPage);
      const next = await linearGql(query, { id: issue, after: info.endCursor });
      assert.notEqual(
        rows(page1.nodes)[0]?.id,
        rows(object(object(next.issue).comments).nodes)[0]?.id,
      );
      return { pageSize: 1, distinctPages: true, newestCreatedUnchangedByOlderEdit: true };
    }
    const session = JiraSession.open();
    const page1 = object(
      await session.call("listJiraIssueComments", {
        cloudId: target.jiraSite,
        issueIdOrKey: issue,
        startAt: 0,
        maxResults: 1,
        orderBy: "-created",
        responseContentFormat: "markdown",
        view: "evidence",
      }),
    );
    const page2 = object(
      await session.call("listJiraIssueComments", {
        cloudId: target.jiraSite,
        issueIdOrKey: issue,
        startAt: 1,
        maxResults: 1,
        orderBy: "-created",
        responseContentFormat: "markdown",
        view: "evidence",
      }),
    );
    assert.notEqual(
      rows(object(page1.data).comments)[0]?.id,
      rows(object(page2.data).comments)[0]?.id,
    );
    return { pageSize: 1, distinctPages: true, newestCreatedUnchangedByOlderEdit: true };
  });
  await check("routine-append-external-edit-terminal", async () => {
    const publication = { invocation: hash(`${prefix}-routine`), workflow: "build" };
    let number = 0;
    const publish = async (text: string, purpose = "routine") =>
      object(
        await postCommentOnce(target, body(text), {
          publication,
          key: `build/1/step/${++number}/comment`,
          purpose,
          log,
        }),
      );
    const first = await publish("routine one");
    const second = await publish("routine two");
    assert.equal(first.done, true);
    assert.equal(second.done, true);
    assert.equal(first.url, second.url);
    const saved = (await recentComments(target, 1)).at(-1)!;
    assert.ok(saved.evidence);
    await postComment(target, body("external edit synthetic"), {
      commentId: saved.evidence.id,
      evidence: saved.evidence,
    });
    const third = await publish("after external edit");
    assert.equal(third.done, true);
    assert.notEqual(third.url, second.url);
    const terminal = await publish("terminal standalone", "terminal");
    assert.equal(terminal.done, true);
    assert.notEqual(terminal.url, third.url);
    return {
      progressUrl: first.url,
      afterExternalEditUrl: third.url,
      terminalUrl: terminal.url,
      cacheFiles: fs.readdirSync(path.join(root, ".git/bkit-outbox/progress")),
    };
  });
  record("continuation", {
    provider,
    continued: true,
    remaining: ["encoded-counting", "lost-response"],
  });
}
if (args.has("--schemas-jira")) await jiraSchemas();
else if (args.has("--run")) await runContract();
else if (args.has("--create-disposable")) {
  const team = option("team"),
    site = option("site"),
    project = option("project");
  if (!team || !site || !project) throw new Error("Explicit --team, --site and --project required");
  try {
    record(
      "linear-disposable",
      await linearGql(
        "mutation($input: IssueCreateInput!) { issueCreate(input:$input) { success issue { id identifier url title } } }",
        {
          input: {
            teamId: team,
            title: "Disposable workflow comment contract probe",
            description:
              "Owner-authorized temporary integration checks. Contains only generated synthetic comments; archive after recording acceptance evidence.",
          },
        },
      ),
    );
  } catch (error) {
    record("linear-create-unavailable", reason(error));
  }
  try {
    record(
      "jira-disposable",
      await JiraSession.open().call("createJiraIssue", {
        cloudId: site,
        projectKey: project,
        summary: "Disposable workflow comment contract probe",
        issueType: "Task",
        description:
          "Owner-authorized temporary integration checks. Contains only generated synthetic comments; close after recording acceptance evidence.",
      }),
    );
  } catch (error) {
    record("jira-create-unavailable", reason(error));
  }
} else if (args.has("--scope-jira")) {
  const site = process.argv.find((arg) => arg.startsWith("--site="))?.slice(7);
  if (!site) throw new Error("Explicit --site required");
  try {
    record(
      "jira-project-scope",
      await JiraSession.open().call("searchJiraIssuesUsingJql", {
        cloudId: site,
        jql: "updated >= -365d ORDER BY updated DESC",
        maxResults: 2,
        fields: ["project", "issuetype"],
        responseContentFormat: "markdown",
      }),
    );
  } catch (error) {
    record("jira-project-unavailable", reason(error));
  }
} else if (args.has("--discover")) await discover();
else
  throw new Error("Refusing live mutations: use --discover or an explicit disposable target mode");
