// audits/templates/settings-ask-rules.test.ts — the shipped Claude settings carry no content-scoped
// curl/wget ask rule.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// A content-scoped `ask` rule such as `Bash(curl:*)` forces a prompt in every permission
// mode, and a cloud session cannot answer one, so every `context=web` context-fetch block
// would stall on it.
describe("shipped settings carry no curl/wget ask rule", () => {
  const pkgRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "..",
    "..",
  );

  for (const rel of [".claude/settings.json", ".bkit/shared/.claude/settings.json"]) {
    it(`${rel} has no curl/wget ask row`, () => {
      const doc = JSON.parse(fs.readFileSync(path.join(pkgRoot, rel), "utf-8")) as {
        permissions: { ask: string[] };
      };
      expect(doc.permissions.ask).not.toContain("Bash(curl:*)");
      expect(doc.permissions.ask).not.toContain("Bash(wget:*)");
      expect(doc.permissions.ask).toContain("Bash(sudo:*)");
      expect(doc.permissions.ask).toContain("Read(./.bkit/.env)");
    });
  }
});
