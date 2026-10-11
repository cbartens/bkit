// shared/log-prefix.test.ts — Unit tests for the install-side log prefix shared by
// every verb's messages.

import { afterEach, describe, expect, it } from "vitest";
import { LOG_PREFIX, setLogPrefix } from "./log-prefix";

describe("shared/log-prefix", () => {
  afterEach(() => setLogPrefix("[bkit-install]"));

  it("defaults to the install prefix", () => {
    expect(LOG_PREFIX).toBe("[bkit-install]");
  });

  it("setLogPrefix updates the exported prefix", () => {
    setLogPrefix("[bkit-check]");
    expect(LOG_PREFIX).toBe("[bkit-check]");
  });
});
