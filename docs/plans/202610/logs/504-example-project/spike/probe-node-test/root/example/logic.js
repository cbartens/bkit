// Dual-load guard: export under CommonJS require, attach a global for a classic <script src>.
(function () {
  function litBoxes(position) {
    return ["design", "plan", "build"].slice(0, position);
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { litBoxes };
  } else {
    this.__PROBE_LOGIC__ = { litBoxes };
  }
})();
