// audits/hooks/readguard-parity.integration.test.ts — one ReadGuard behaviour table, every host.
//
// bkit generates the five ReadGuard hooks at install from one shared engine
// (`.bkit/core/hooks/readguard-engine.js`), plus the shared CJS payload adapter
// (`readguard-payload.js`) for Claude, Cursor, Codex and Antigravity, and they reach the
// model by different routes: Claude / Codex / Antigravity write
// `hookSpecificOutput.additionalContext`, Cursor writes `additional_context` with
// `permission: "allow"`, opencode appends the note to the tool result after the read.
//
// Every row runs against every host's GENERATED hook (the template as install renders it)
// through an adapter that normalises the delivery mechanism away. A behaviour that cannot
// hold on some host is stated here as an explicit exception.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

import { readTemplate } from "../../render/parts";

const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-rg-parity-"));
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-rg-work-"));
afterAll(() => {
  fs.rmSync(GENERATED, { recursive: true, force: true });
  fs.rmSync(WORK, { recursive: true, force: true });
});
const [CLAUDE_HOOK, CURSOR_HOOK, OPENCODE_PLUGIN, CODEX_HOOK, ANTIGRAVITY_HOOK] = [
  [".claude/hooks/bkit-readguard.cjs", "claude.cjs"],
  [".cursor/hooks/bkit-readguard.cjs", "cursor.cjs"],
  // `.mjs`: the plugin is an ES module, and the temp dir has no package.json saying so.
  [".opencode/plugin/bkit-readguard.js", "opencode.mjs"],
  [".codex/hooks/bkit-readguard.cjs", "codex.cjs"],
  [".agents/plugins/bkit/hooks/bkit-readguard.cjs", "antigravity.cjs"],
].map(([rel, name]) => {
  const out = path.join(GENERATED, name);
  fs.writeFileSync(out, readTemplate(path.resolve(".bkit/core", rel)));
  return out;
});

type Host = "claude" | "cursor" | "opencode" | "codex" | "antigravity";
const HOSTS: Host[] = ["claude", "cursor", "opencode", "codex", "antigravity"];

let counter = 0;
function newSession(): string {
  counter += 1;
  // Random component: logs are keyed by session id and persist in the OS temp dir for 24h.
  return `rg-parity-${process.pid}-${counter}-${Math.random().toString(36).slice(2)}`;
}

/** A fresh 100-line file, so no row inherits another's read log entry. */
function newFile(lines = 100): string {
  counter += 1;
  const file = path.join(WORK, `file-${counter}.ts`);
  fs.writeFileSync(
    file,
    Array.from({ length: lines }, (_, i) => `line ${i + 1}`).join("\n") + "\n",
  );
  return file;
}

// ---------------------------------------------------------------------------
// Host adapters
// ---------------------------------------------------------------------------

interface Call {
  session: string;
  /** A read-tool call of lines start..end, or a shell command. */
  read?: { file: string; start: number; end: number };
  shell?: string;
  agentId?: string;
  env?: Record<string, string | undefined>;
}

/** Codex has no read tool: a read-tool row becomes the equivalent `sed -n` command. */
function asShell(c: Call): string {
  if (c.shell !== undefined) return c.shell;
  const r = c.read!;
  return `sed -n '${r.start},${r.end}p' ${r.file}`;
}

function spawnHook(hook: string, payload: object, env?: Record<string, string | undefined>) {
  const res = spawnSync("node", [hook], {
    input: JSON.stringify(payload),
    encoding: "utf-8",
    env: { ...process.env, BKIT_READGUARD: undefined, ...env },
  });
  return res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
}

function claudeShaped(out: { hookSpecificOutput?: { additionalContext?: string } }): string {
  return String(out.hookSpecificOutput?.additionalContext ?? "");
}

function runClaude(c: Call): string {
  const payload = c.read
    ? {
        tool_name: "Read",
        tool_input: {
          file_path: c.read.file,
          offset: c.read.start,
          limit: c.read.end - c.read.start + 1,
        },
      }
    : { tool_name: "Bash", tool_input: { command: c.shell } };
  return claudeShaped(
    spawnHook(
      CLAUDE_HOOK,
      {
        ...payload,
        session_id: c.session,
        cwd: WORK,
        hook_event_name: "PreToolUse",
        agent_id: c.agentId,
      },
      c.env,
    ),
  );
}

function runCursor(c: Call): string {
  const payload = c.read
    ? {
        tool_name: "Read",
        tool_input: {
          file_path: c.read.file,
          offset: c.read.start,
          limit: c.read.end - c.read.start + 1,
        },
      }
    : { tool_name: "Shell", tool_input: { command: c.shell, working_directory: WORK } };
  const out = spawnHook(
    CURSOR_HOOK,
    {
      ...payload,
      conversation_id: c.session,
      hook_event_name: "preToolUse",
      workspace_roots: [WORK],
      cursor_version: "3.17.8",
    },
    c.env,
  );
  expect(out.permission).toBe("allow");
  return String(out.additional_context ?? "");
}

function runCodex(c: Call): string {
  return claudeShaped(
    spawnHook(
      CODEX_HOOK,
      {
        tool_name: "Bash",
        tool_input: { command: ["bash", "-lc", asShell(c)] },
        session_id: c.session,
        cwd: WORK,
        hook_event_name: "PreToolUse",
      },
      c.env,
    ),
  );
}

/** Antigravity's live-verified envelope; its reply is `{ decision, reason }`. */
function antigravityPayload(c: Call): object {
  const toolCall = c.read
    ? {
        name: "view_file",
        args: {
          AbsolutePath: c.read.file,
          StartLine: c.read.start,
          EndLine: c.read.end,
          toolAction: "Viewing file lines",
        },
      }
    : { name: "run_command", args: { CommandLine: c.shell, Cwd: WORK, toolAction: "Running" } };
  return { conversationId: c.session, toolCall, workspacePaths: [WORK] };
}

/** Only a deny's reason reaches the model, so the note arrives as a one-time deny. */
function runAntigravity(c: Call): string {
  const out = spawnHook(ANTIGRAVITY_HOOK, antigravityPayload(c), c.env);
  expect(["allow", "deny"]).toContain(out.decision);
  return out.decision === "deny" ? String(out.reason ?? "") : "";
}

async function withEnv<T>(
  env: Record<string, string | undefined>,
  fn: () => Promise<T>,
): Promise<T> {
  const saved: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries({ BKIT_READGUARD: undefined, ...env })) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return await fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

async function loadOpencode() {
  return (await import(pathToFileURL(OPENCODE_PLUGIN).href)).default;
}

/** Drives the plugin as OpenCode 2.0 does: setup(ctx), then execute.after with a result. */
async function runOpencode(c: Call): Promise<string> {
  return withEnv(c.env ?? {}, async () => {
    const plugin = await loadOpencode();
    const hooks: Record<string, (event: object) => Promise<void>> = {};
    await plugin.setup({
      tool: {
        hook: async (name: string, cb: (event: object) => Promise<void>) => {
          hooks[name] = cb;
        },
      },
    });
    const input = c.read
      ? { path: c.read.file, offset: c.read.start, limit: c.read.end - c.read.start + 1 }
      : { command: c.shell, workdir: WORK };
    const result: { content: { type: string; text: string }[] } = { content: [] };
    await hooks["execute.after"]({
      tool: c.read ? "read" : "shell",
      sessionID: c.session,
      id: "rg-parity-call",
      input,
      status: "completed",
      result,
    });
    return result.content.map((part) => part.text).join("");
  });
}

async function run(host: Host, c: Call): Promise<string> {
  if (host === "claude") return runClaude(c);
  if (host === "cursor") return runCursor(c);
  if (host === "codex") return runCodex(c);
  if (host === "antigravity") return runAntigravity(c);
  return runOpencode(c);
}

/** Sends the host its compaction signal and returns the hook's JSON response ({} when it has none). */
async function sendCompactSignal(host: Host, session: string): Promise<unknown> {
  if (host === "claude" || host === "codex") {
    const hook = host === "claude" ? CLAUDE_HOOK : CODEX_HOOK;
    return spawnHook(hook, { hook_event_name: "PreCompact", session_id: session, trigger: "auto" });
  }
  if (host === "cursor") {
    return spawnHook(CURSOR_HOOK, {
      hook_event_name: "preCompact",
      conversation_id: session,
      trigger: "auto",
    });
  }
  if (host === "opencode") {
    // OpenCode 1.x: server() returns the event hook.
    const hooks = await (await loadOpencode()).server();
    await hooks.event({ event: { type: "session.compacted", properties: { sessionID: session } } });
    return {};
  }
  throw new Error(`${host} has no compaction signal`);
}

/** Tells the host the conversation was summarised. */
async function compact(host: Host, session: string): Promise<void> {
  expect(await sendCompactSignal(host, session)).toEqual({});
}

// ---------------------------------------------------------------------------
// The behaviour table — every row asserted on every host
// ---------------------------------------------------------------------------

describe("readguard behaviour parity — repeat reads", () => {
  for (const host of HOSTS) {
    describe(host, () => {
      it("a first read is silent", async () => {
        const file = newFile();
        expect(await run(host, { session: newSession(), read: { file, start: 1, end: 40 } })).toBe(
          "",
        );
      });

      it("the same range again, file unchanged, gets the note naming file and lines", async () => {
        const session = newSession();
        const file = newFile();
        await run(host, { session, read: { file, start: 10, end: 40 } });
        const note = await run(host, { session, read: { file, start: 10, end: 40 } });
        expect(note).toContain("[bkit ReadGuard]");
        expect(note).toContain(`${path.basename(file)}\` lines 10-40`);
        expect(note).toContain(
          "If that output is no longer in your context (summarised, or read by another agent), re-read the lines.",
        );
      });

      it("a range inside earlier reads gets the note", async () => {
        const session = newSession();
        const file = newFile();
        await run(host, { session, read: { file, start: 1, end: 30 } });
        await run(host, { session, read: { file, start: 31, end: 60 } });
        expect(await run(host, { session, read: { file, start: 20, end: 50 } })).toContain(
          "lines 20-50",
        );
      });

      it("a range reaching past earlier reads is silent", async () => {
        const session = newSession();
        const file = newFile();
        await run(host, { session, read: { file, start: 1, end: 30 } });
        expect(await run(host, { session, read: { file, start: 20, end: 60 } })).toBe("");
      });

      it("a changed file is silent and starts a fresh log", async () => {
        const session = newSession();
        const file = newFile();
        await run(host, { session, read: { file, start: 1, end: 30 } });
        fs.appendFileSync(file, "line 101\n");
        expect(await run(host, { session, read: { file, start: 1, end: 30 } })).toBe("");
        expect(await run(host, { session, read: { file, start: 1, end: 30 } })).toContain(
          "lines 1-30",
        );
      });

      it("another session is silent", async () => {
        const file = newFile();
        await run(host, { session: newSession(), read: { file, start: 1, end: 30 } });
        expect(await run(host, { session: newSession(), read: { file, start: 1, end: 30 } })).toBe(
          "",
        );
      });

      it("BKIT_READGUARD=off is a total no-op", async () => {
        const session = newSession();
        const file = newFile();
        const env = { BKIT_READGUARD: "off" };
        await run(host, { session, read: { file, start: 1, end: 30 }, env });
        expect(await run(host, { session, read: { file, start: 1, end: 30 }, env })).toBe("");
      });
    });
  }
});

describe("readguard behaviour parity — shell reads", () => {
  // Each row: a first command, then a second one that repeats lines it already read.
  const cases: {
    name: string;
    first: (f: string) => string;
    second: (f: string) => string;
    lines: string;
  }[] = [
    {
      name: "cat then sed",
      first: (f) => `cat ${f}`,
      second: (f) => `sed -n '5,9p' ${f}`,
      lines: "5-9",
    },
    {
      name: "sed then head",
      first: (f) => `sed -n "1,50p" ${f}`,
      second: (f) => `head -n 20 ${f}`,
      lines: "1-20",
    },
    {
      name: "head -N twice",
      first: (f) => `head -30 ${f}`,
      second: (f) => `head -30 ${f}`,
      lines: "1-30",
    },
    {
      name: "tail twice",
      first: (f) => `tail -n 10 ${f}`,
      second: (f) => `tail -n 5 ${f}`,
      lines: "96-100",
    },
    {
      name: "sed to end then cat",
      first: (f) => `sed -n '1,$p' ${f}`,
      second: (f) => `cat ${f}`,
      lines: "1-100",
    },
  ];
  for (const host of HOSTS) {
    for (const c of cases) {
      it(`${host}: ${c.name} is a repeat read`, async () => {
        const session = newSession();
        const file = newFile();
        expect(await run(host, { session, shell: c.first(file) })).toBe("");
        expect(await run(host, { session, shell: c.second(file) })).toContain(`lines ${c.lines}`);
      });
    }

    it(`${host}: a relative path resolves against the working directory`, async () => {
      const session = newSession();
      const file = newFile();
      await run(host, { session, shell: `cat ${path.basename(file)}` });
      expect(await run(host, { session, read: { file, start: 1, end: 10 } })).toContain(
        "lines 1-10",
      );
    });

    for (const [why, cmd] of [
      ["a pipe", (f: string) => `cat ${f} | head -n 5`],
      ["a list", (f: string) => `cat ${f}; echo done`],
      ["a glob", (f: string) => `cat ${path.dirname(f)}/*.ts`],
      ["a substitution", (f: string) => `cat $(echo ${f})`],
      ["another program", (f: string) => `grep -n line ${f}`],
    ] as const) {
      it(`${host}: a command with ${why} is not tracked`, async () => {
        const session = newSession();
        const file = newFile();
        expect(await run(host, { session, shell: cmd(file) })).toBe("");
        expect(await run(host, { session, shell: cmd(file) })).toBe("");
      });
    }
  }
});

describe("readguard behaviour parity — compaction", () => {
  for (const host of ["claude", "cursor", "codex", "opencode"] as const) {
    it(`${host}: a summary forgets the session's reads`, async () => {
      const session = newSession();
      const file = newFile();
      await run(host, { session, read: { file, start: 1, end: 30 } });
      await compact(host, session);
      expect(await run(host, { session, read: { file, start: 1, end: 30 } })).toBe("");
    });
  }
});

// ---------------------------------------------------------------------------
// State folders — per user, and fail-open when they cannot be written
// ---------------------------------------------------------------------------

const UID = process.getuid!();

/** A private temp root (the hook's TMPDIR) whose folders `unwritable` exist read-only. */
function stateRoot(...unwritable: string[]): string {
  const root = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
  for (const name of unwritable) fs.mkdirSync(path.join(root, name), { mode: 0o555 });
  return root;
}

describe("readguard behaviour parity — state folders", () => {
  for (const host of HOSTS) {
    it(`${host}: read logs live in a per-user folder`, async () => {
      const tmp = stateRoot();
      const file = newFile();
      await run(host, {
        session: newSession(),
        read: { file, start: 1, end: 10 },
        env: { TMPDIR: tmp },
      });
      expect(fs.readdirSync(tmp)).toContain(`bkit-readguard-${UID}`);
    });

    it(`${host}: another user's shared folder does not cost the repeat-read note`, async () => {
      // On a shared Linux /tmp the first user to create the plain-named folder owns it.
      const env = { TMPDIR: stateRoot("bkit-readguard", "bkit-antigravity-retry") };
      const session = newSession();
      const file = newFile();
      await run(host, { session, read: { file, start: 1, end: 30 }, env });
      expect(await run(host, { session, read: { file, start: 1, end: 30 }, env })).toContain(
        "lines 1-30",
      );
    });
  }

  it("opencode: an unwritable state folder keeps the read log in-process", async () => {
    // opencode is one long-lived process, so its memory stands in for the log file.
    const env = { TMPDIR: stateRoot("bkit-readguard", `bkit-readguard-${UID}`) };
    const session = newSession();
    const file = newFile();
    await run("opencode", { session, read: { file, start: 1, end: 30 }, env });
    expect(await run("opencode", { session, read: { file, start: 1, end: 30 }, env })).toContain(
      "lines 1-30",
    );
  });

  it("opencode: a summary forgets the in-process read log too", async () => {
    const env = { TMPDIR: stateRoot("bkit-readguard", `bkit-readguard-${UID}`) };
    const session = newSession();
    const file = newFile();
    await run("opencode", { session, read: { file, start: 1, end: 30 }, env });
    await compact("opencode", session);
    expect(await run("opencode", { session, read: { file, start: 1, end: 30 }, env })).toBe("");
  });
});

describe("readguard parity — documented deviations", () => {
  it("only Claude separates a subagent sharing its parent's session id", async () => {
    const session = newSession();
    const file = newFile();
    await run("claude", { session, read: { file, start: 1, end: 30 } });
    expect(
      await run("claude", { session, agentId: "sub-1", read: { file, start: 1, end: 30 } }),
    ).toBe("");
    expect(
      await run("claude", { session, agentId: "sub-1", read: { file, start: 1, end: 30 } }),
    ).toContain("lines 1-30");
  });

  it("every host except Antigravity registers ReadGuard on its compaction signal", () => {
    const shared = (rel: string) => fs.readFileSync(path.resolve(".bkit/shared", rel), "utf-8");
    const claude = JSON.parse(shared(".claude/settings.json")).hooks;
    expect(JSON.stringify(claude.PreCompact)).toContain("bkit-readguard.cjs");
    expect(JSON.stringify(claude.PreToolUse)).toContain('"matcher":"Read|Bash"');
    const cursor = JSON.parse(shared(".cursor/hooks.json")).hooks;
    expect(JSON.stringify(cursor.preCompact)).toContain("bkit-readguard.cjs");
    expect(JSON.stringify(cursor.preToolUse)).toContain('"matcher":"Read|Shell"');
    const codex = JSON.parse(shared(".codex/hooks.json")).hooks;
    expect(JSON.stringify(codex.PreCompact)).toContain("bkit-readguard.cjs");
    const antigravity = JSON.parse(shared(".agents/plugins/bkit/hooks.json")).hooks;
    expect(Object.keys(antigravity)).toEqual(["PreToolUse"]);
    expect(JSON.stringify(antigravity.PreToolUse)).toContain('"matcher":"view_file|run_command"');
    expect(JSON.parse(shared(".opencode/opencode.json")).plugin).toContain(
      "./plugin/bkit-readguard.js",
    );
  });

  it("Antigravity denies a repeat read once with the note; the identical retry passes", () => {
    const session = newSession();
    const file = newFile();
    const read: Call = { session, read: { file, start: 1, end: 10 } };
    expect(spawnHook(ANTIGRAVITY_HOOK, antigravityPayload(read))).toEqual({ decision: "allow" });
    const repeat = spawnHook(ANTIGRAVITY_HOOK, antigravityPayload(read));
    expect(repeat.decision).toBe("deny");
    expect(repeat.reason).toContain("lines 1-10");
    expect(repeat.reason).toContain("Repeat the same call to proceed.");
    expect(spawnHook(ANTIGRAVITY_HOOK, antigravityPayload(read))).toEqual({ decision: "allow" });
  });

  it("OpenCode reads the whole file when neither offset nor limit is given", async () => {
    const session = newSession();
    const file = newFile();
    await run("opencode", { session, shell: `sed -n '90,100p' ${file}` });
    const plugin = await loadOpencode();
    const hooks = await plugin.server();
    const output = { output: "", args: { filePath: file } };
    await hooks["tool.execute.after"]({ tool: "read", sessionID: session, callID: "v1" }, output);
    expect(output.output).toBe("");
    await hooks["tool.execute.after"]({ tool: "read", sessionID: session, callID: "v1" }, output);
    expect(output.output).toContain("lines 1-100");
  });

  it("CJS hooks fail open on malformed stdin", () => {
    for (const hook of [CLAUDE_HOOK, CODEX_HOOK]) {
      const res = spawnSync("node", [hook], { input: "{not json", encoding: "utf-8" });
      expect(res.status).toBe(0);
      expect(res.stdout).toBe("");
    }
    const cursor = spawnSync("node", [CURSOR_HOOK], { input: "{not json", encoding: "utf-8" });
    expect(cursor.status).toBe(0);
    expect(JSON.parse(cursor.stdout)).toEqual({ permission: "allow" });
    const ag = spawnSync("node", [ANTIGRAVITY_HOOK], { input: "{not json", encoding: "utf-8" });
    expect(ag.status).toBe(0);
    expect(JSON.parse(ag.stdout)).toEqual({ decision: "allow" });
  });
});

describe("readguard structural parity", () => {
  const files: Record<Host, string> = {
    claude: CLAUDE_HOOK,
    cursor: CURSOR_HOOK,
    opencode: OPENCODE_PLUGIN,
    codex: CODEX_HOOK,
    antigravity: ANTIGRAVITY_HOOK,
  };
  function block(file: string): string {
    const src = fs.readFileSync(file, "utf-8");
    return src.slice(src.indexOf("// bkit:start"), src.indexOf("// bkit:end"));
  }

  for (const host of HOSTS) {
    it(`${host}: carries slash-comment markers with start before end`, () => {
      const src = fs.readFileSync(files[host], "utf-8");
      expect(src.indexOf("// bkit:start")).toBeGreaterThan(-1);
      expect(src.indexOf("// bkit:end")).toBeGreaterThan(src.indexOf("// bkit:start"));
    });

    it(`${host}: the managed block never emits or reads stdin`, () => {
      const b = block(files[host]);
      expect(b).not.toContain("process.stdout.write");
      expect(b).not.toContain("process.stderr.write");
      expect(b).not.toContain("readFileSync(0");
    });

    it(`${host}: read logs live in the OS temp dir, never in the consumer repo`, () => {
      expect(block(files[host])).toContain("os.tmpdir()");
    });

    it(`${host}: the generated block carries the shared engine verbatim`, () => {
      const engine = fs.readFileSync(path.resolve(".bkit/core/hooks/readguard-engine.js"), "utf-8");
      expect(block(files[host])).toContain(engine.trim());
    });
  }

  it("the claude, cursor and codex blocks are byte-identical", () => {
    const claude = block(CLAUDE_HOOK);
    for (const hook of [CURSOR_HOOK, CODEX_HOOK]) expect(block(hook)).toBe(claude);
  });

  it("the antigravity block adds only the Antigravity contract to the shared parts", () => {
    const b = block(ANTIGRAVITY_HOOK);
    for (const part of ["readguard-payload.js", "antigravity-hook.js"]) {
      const text = fs.readFileSync(path.resolve(".bkit/core/hooks", part), "utf-8");
      expect(b).toContain(text.trim());
    }
  });
});
