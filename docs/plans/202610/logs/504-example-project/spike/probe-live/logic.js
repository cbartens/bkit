"use strict";
function evaluate(position) {
  var data =
    typeof module !== "undefined" && module.exports
      ? require("./data.js")
      : globalThis.__BKIT_EXPLAINER_DATA__;
  var phase = data.phases[Math.max(0, Math.min(data.phases.length - 1, position))];
  return { phase: phase.id, counters: { position: position } };
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { evaluate: evaluate };
} else {
  globalThis.__BKIT_EXPLAINER__ = { evaluate: evaluate };
}
