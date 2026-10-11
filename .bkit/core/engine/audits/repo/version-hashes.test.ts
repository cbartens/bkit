// audits/repo/version-hashes.test.ts — `.bkit/version` canonicalHashes records only the files
// bkit owns. A path under `.bkit/templates/` is copy-and-own: install and upgrade never write
// it, so it must never carry an ownership hash.
//
// #489 moved graphify and Serena to the template set. `mergeCanonicalHashes` prunes only entries
// whose path is absent, so the pre-#489 hashes for `scripts/graphify/**` and
// `scripts/serena/bkit-serena-mcp.sh` survived (the adopted copies stayed on disk). This pins
// the boundary bkit check cannot see: check compares rendered writes, not the hash map, so a
// stale template hash is invisible to it and to upgrade.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { readBkitVersion } from "../../install/version-file";
import { getPkgRoot, getTemplatesRoot, templateRelPath } from "../../shared/package-roots";

describe("canonicalHashes records no template-set path", () => {
  it(".bkit/version carries no hash for a file under .bkit/templates/", () => {
    const pkgRoot = getPkgRoot();
    const version = readBkitVersion(path.join(pkgRoot, ".bkit", "version"));
    expect(version, ".bkit/version present").not.toBeNull();

    const templatesRoot = getTemplatesRoot();
    const recorded = Object.keys(version!.canonicalHashes).filter((rel) =>
      fs.existsSync(path.join(templatesRoot, templateRelPath(rel))),
    );

    expect(recorded, "template paths carry no canonical hash").toEqual([]);
  });
});
