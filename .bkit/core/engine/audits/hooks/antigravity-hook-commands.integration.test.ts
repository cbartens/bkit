// audits/hooks/antigravity-hook-commands.integration.test.ts — the shell commands in the
// INSTALLED `.agents/plugins/bkit/hooks.json` find and run their scripts from both places
// Antigravity may start them: the plugin folder (`.agents/plugins/bkit/`) and the workspace root.
//
// Every command ends in `|| true`, so its exit code is always 0 and proves nothing. Only the
// output does: the hook answers with a JSON `{ decision }` on stdout, and a command that
// failed to find its script prints nothing. A control case with the scripts deleted pins that.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { requireTsx } from "../../../../../vitest.tsx-bin";

const CLI = path.resolve(".bkit/core/engine/cli.ts");

const PLUGIN_REL = ".agents/plugins/bkit";
const HOOKS = ["gateguard", "guardrails", "readguard"] as const;
type HookName = (typeof HOOKS)[number];

let consumer: string;
let control: string;
let commands: Record<HookName, string>;

let counter = 0;
function newConversation(): string {
  counter += 1;
  return `ag-cmd-${process.pid}-${counter}-${Math.random().toString(36).slice(2)}`;
}

function commandFor(name: HookName): string {
  const hooksJson = JSON.parse(
    fs.readFileSync(path.join(consumer, PLUGIN_REL, "hooks.json"), "utf-8"),
  ) as { hooks: { PreToolUse: { hooks: { command: string }[] }[] } };
  const matches = hooksJson.hooks.PreToolUse.flatMap((g) => g.hooks)
    .map((h) => h.command)
    .filter((c) => c.includes(`bkit-${name}.cjs`));
  expect(matches, `exactly one ${name} command in the installed hooks.json`).toHaveLength(1);
  return matches[0];
}

beforeAll(() => {
  consumer = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ag-cmd-"));
  fs.mkdirSync(path.join(consumer, ".git"), { recursive: true });
  fs.writeFileSync(
    path.join(consumer, "package.json"),
    JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
    "utf-8",
  );
  const install = spawnSync(requireTsx(), [CLI, "install", "--antigravity", "--tracker=github"], {
    cwd: consumer,
    encoding: "utf-8",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
    timeout: 90_000,
  });
  expect(install.status, install.stderr).toBe(0);

  commands = {
    gateguard: commandFor("gateguard"),
    guardrails: commandFor("guardrails"),
    readguard: commandFor("readguard"),
  };

  // Same install with every hook script deleted: the commands must print nothing there.
  control = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ag-cmd-control-"));
  fs.cpSync(path.join(consumer, ".agents"), path.join(control, ".agents"), { recursive: true });
  fs.rmSync(path.join(control, PLUGIN_REL, "hooks"), { recursive: true, force: true });
}, 120_000);

afterAll(() => {
  for (const dir of [consumer, control]) {
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** Run an installed command through `sh -c` the way the host does, and parse its stdout. */
function runCommand(
  command: string,
  cwd: string,
  toolCall: object,
  conversationId: string,
): { status: number | null; stdout: string; json: { decision?: string; reason?: string } | null } {
  const res = spawnSync("sh", ["-c", command], {
    cwd,
    input: JSON.stringify({ conversationId, toolCall, workspacePaths: [consumer] }),
    encoding: "utf-8",
    env: {
      ...process.env,
      BKIT_GATEGUARD: undefined,
      BKIT_READGUARD: undefined,
      BKIT_GUARDRAILS: undefined,
    },
  });
  const stdout = res.stdout.trim();
  return { status: res.status, stdout, json: stdout ? JSON.parse(stdout) : null };
}

const newFileCall = () => ({
  name: "write_to_file",
  args: {
    TargetFile: path.join(consumer, "src", `brand-new-${++counter}.ts`),
    toolAction: "Editing file",
    toolSummary: "Create",
  },
});
const deniedShellCall = () => ({
  name: "run_command",
  args: { CommandLine: "rm -rf /", Cwd: consumer, toolAction: "Run" },
});
const viewCall = (file: string) => ({
  name: "view_file",
  args: { AbsolutePath: file, StartLine: 1, EndLine: 10, toolAction: "Viewing file lines" },
});

describe("installed Antigravity hook commands", () => {
  for (const where of ["plugin folder", "workspace root"] as const) {
    describe(`started from the ${where}`, () => {
      const cwd = () => (where === "plugin folder" ? path.join(consumer, PLUGIN_REL) : consumer);

      it("gateguard: a create of a new file gets the one-time advisory deny", () => {
        const r = runCommand(commands.gateguard, cwd(), newFileCall(), newConversation());
        expect(r.status).toBe(0);
        expect(r.json?.decision).toBe("deny");
        expect(r.json?.reason).toContain("[bkit GateGuard]");
      });

      it("guardrails: an always-denied shell command is denied", () => {
        const r = runCommand(commands.guardrails, cwd(), deniedShellCall(), newConversation());
        expect(r.status).toBe(0);
        expect(r.json?.decision).toBe("deny");
        expect(r.json?.reason).toContain("Blocked by bkit Antigravity guardrails");
      });

      it("readguard: the first read is allowed and the identical repeat is denied", () => {
        const file = path.join(consumer, "package.json");
        const conversation = newConversation();
        const first = runCommand(commands.readguard, cwd(), viewCall(file), conversation);
        expect(first.json).toEqual({ decision: "allow" });
        const repeat = runCommand(commands.readguard, cwd(), viewCall(file), conversation);
        expect(repeat.json?.decision).toBe("deny");
        expect(repeat.json?.reason).toContain("repeat the same call to proceed");
      });
    });
  }

  describe("control: hook scripts missing", () => {
    for (const where of ["plugin folder", "workspace root"] as const) {
      it(`prints nothing from the ${where}, though the exit code is still 0`, () => {
        const cwd = where === "plugin folder" ? path.join(control, PLUGIN_REL) : control;
        const calls: [HookName, object][] = [
          ["gateguard", newFileCall()],
          ["guardrails", deniedShellCall()],
          ["readguard", viewCall(path.join(consumer, "package.json"))],
        ];
        for (const [name, toolCall] of calls) {
          const r = runCommand(commands[name], cwd, toolCall, newConversation());
          expect(r.status, name).toBe(0);
          expect(r.stdout, name).toBe("");
        }
      });
    }
  });
});
