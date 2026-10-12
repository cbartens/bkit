// Probe: dual-load guard — one file serves a classic <script src> off file:// AND
// `require` under `node --test`.
// Guard shape from the design: export when `module` exists, attach a global otherwise.
"use strict";

function evaluate(position) {
  var phases = ["design", "plan", "build", "debug", "ship"];
  return {
    phase: phases[Math.max(0, Math.min(phases.length - 1, position))],
    counters: { attempts: position },
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { evaluate };
} else {
  globalThis.__BKIT_EXPLAINER__ = { evaluate };
}
