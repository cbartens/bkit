// audits/templates/context-fetch-contexts.test.ts — the context table in `.agents/context.md` and
// its template lists exactly the contexts the runner accepts.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { CONTEXT_FETCH_CONTEXTS } from "../../checks/before/context-fetch";

// ---------------------------------------------------------------------------
// context-fetch-contexts
// ---------------------------------------------------------------------------
/**
 * context-fetch-contexts — the consumer-facing context table in
 * `.agents/context.md` (and its template) lists exactly the contexts the runner and
 * the `bkit check` advisories accept (`CONTEXT_FETCH_CONTEXTS`).
 */
describe("context-fetch-contexts", () => {
  const REPO_ROOT = path.resolve(__dirname, "../../../../..");
  const CONFIG_MD = path.join(REPO_ROOT, ".agents/context.md");
  const CONFIG_TEMPLATE = path.join(REPO_ROOT, ".bkit/templates/.agents/context.md");

  describe("context-fetch context vocabulary", () => {
    it("the consumer-facing table lists exactly CONTEXT_FETCH_CONTEXTS", () => {
      for (const file of [CONFIG_MD, CONFIG_TEMPLATE]) {
        const rows = [...fs.readFileSync(file, "utf-8").matchAll(/^\| `(\w+)`[^|]*\| `context-/gm)]
          .map((m) => m[1]!)
          .sort();
        expect(rows, `context table drift in ${path.relative(REPO_ROOT, file)}`).toEqual(
          [...CONTEXT_FETCH_CONTEXTS].sort(),
        );
      }
    });
  });
});
