// audits/repo/dogfood-noop.test.ts — the repo's own `.bkit/scripts` are byte-identical to their
// templates as install renders them.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getPkgRoot } from "../../shared/package-roots";
import { applyTokens } from "../../install/placeholders";

describe("dogfood-noop", () => {
  // ---------------------------------------------------------------------------
  // Dogfood byte-identity — `.bkit/scripts`
  // ---------------------------------------------------------------------------
  //
  // `.bkit/scripts` is excluded from the npm `files` list — consumers receive
  // scripts from `.bkit/templates/.bkit/scripts/`; the root copy is the dogfood
  // mirror, so every shipped script must equal its template as install renders it.

  describe("dogfood byte-identity — .bkit/scripts", () => {
    const pkgRoot = getPkgRoot();
    const shipped = fs.readdirSync(path.join(pkgRoot, ".bkit/templates/.bkit/scripts")).sort();

    it("ships at least one script", () => {
      expect(shipped.length).toBeGreaterThan(0);
    });

    it.each(shipped)("%s: root copy === rendered template copy", (name) => {
      const root = path.join(pkgRoot, ".bkit/scripts", name);
      const tmpl = path.join(pkgRoot, ".bkit/templates/.bkit/scripts", name);
      expect(fs.existsSync(root)).toBe(true);
      const tokens = { DEFAULT_BRANCH: "", PROJECT_NAME: "", REPO_SLUG: "" };
      expect(fs.readFileSync(root, "utf-8")).toBe(
        applyTokens(fs.readFileSync(tmpl, "utf-8"), tokens),
      );
    });
  });
});
