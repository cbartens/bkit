// The registry's own shape. Completeness, the provider tie-back and the anti-widening
// gate are asserted where the registry is consumed (install/cloud-env.test.ts).

import { describe, expect, it } from "vitest";

import {
  BKIT_EGRESS_SOURCES,
  MULTI_LABEL_SUFFIXES,
  MULTI_TENANT_APEXES,
  OPENCODE_PROVIDER_DEFAULTS,
} from "./egress";

const HOSTNAME = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

describe("shared/egress", () => {
  it("every host and base is a bare lowercase hostname: no scheme, path, port or wildcard", () => {
    for (const row of BKIT_EGRESS_SOURCES) {
      for (const name of [...row.hosts, ...row.bases]) expect(name, row.id).toMatch(HOSTNAME);
    }
  });

  it("no row lists a host or a base twice", () => {
    for (const row of BKIT_EGRESS_SOURCES) {
      expect(new Set(row.hosts).size, row.id).toBe(row.hosts.length);
      expect(new Set(row.bases).size, row.id).toBe(row.bases.length);
    }
  });

  it("the public-suffix and shared-tenant lists are lowercase and unique", () => {
    for (const list of [MULTI_LABEL_SUFFIXES, MULTI_TENANT_APEXES]) {
      expect(new Set(list).size).toBe(list.length);
      for (const name of list) expect(name).toBe(name.toLowerCase());
    }
  });

  it("the engine's tracker clients reach their APIs: GitHub REST / GraphQL, Linear GraphQL, Jira MCP", () => {
    const hosts = BKIT_EGRESS_SOURCES.flatMap((row) => row.hosts);
    for (const host of ["api.github.com", "api.linear.app", "mcp.atlassian.com"])
      expect(hosts).toContain(host);
  });

  it("every provider default names its env var in its key placeholder", () => {
    for (const [id, p] of Object.entries(OPENCODE_PROVIDER_DEFAULTS)) {
      expect(p.envVar, id).toMatch(/^BKIT_[A-Z0-9_]+_API_KEY$/);
      expect(p.apiPlaceholder, id).toBe(`{env:${p.envVar}}`);
    }
  });
});
