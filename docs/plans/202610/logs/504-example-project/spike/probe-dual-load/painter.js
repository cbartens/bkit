// Probe: classic <script src> (NOT type="module") so the page works off file://.
"use strict";
function run() {
  var out = document.getElementById("out");
  out.textContent = JSON.stringify(window.__BKIT_EXPLAINER__.evaluate(2));
}
window.addEventListener("DOMContentLoaded", run);
