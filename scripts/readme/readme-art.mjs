// Renders the root README images (hero, features grid, pipeline, fences, context map, CI, fence details, audit map, token use, re-reading, engine and agents, models and effort), light + dark,
// plus the repo's social preview card, into .github/assets/ as both .svg and .png. Edit the copy
// below, then: node scripts/readme/readme-art.mjs
// Text is not auto-wrapped: keep tile lines short and eyeball the output at ~880px.
import {
  writeFileSync,
  mkdirSync,
  existsSync,
  mkdtempSync,
  rmSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const OUT = resolve(
  process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".github", "assets"),
);
mkdirSync(OUT, { recursive: true });

// PNGs are rasterised with headless Chrome/Chromium, so the script needs no extra dependency.
// Override the binary with CHROME_BIN (or PUPPETEER_EXECUTABLE_PATH) if auto-detection misses it.
// Without a browser the SVGs still render and the PNG step is skipped with a warning.
const BROWSER_CANDIDATES = [
  process.env.CHROME_BIN,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "google-chrome",
  "chromium",
].filter(Boolean);

function findBrowser() {
  for (const c of BROWSER_CANDIDATES) {
    if (c.includes("/") || c.includes("\\")) {
      if (existsSync(c)) return c;
    } else if (
      spawnSync(process.platform === "win32" ? "where" : "which", [c], { stdio: "ignore" })
        .status === 0
    ) {
      return c;
    }
  }
  return null;
}

// The svg() helper writes width/height on the root element, so read the intrinsic size back off the
// markup and screenshot the SVG at exactly that viewport.
const dims = (s) => [Number(s.match(/\bwidth="(\d+)"/)[1]), Number(s.match(/\bheight="(\d+)"/)[1])];

function toPng(browser, svgPath, pngPath, width, height) {
  // A private profile per run: Chrome's default user-data-dir is single-instance, so back-to-back
  // headless invocations otherwise collide and exit non-zero without writing the screenshot.
  const profile = mkdtempSync(join(tmpdir(), "bkit-readme-png-"));
  const base = [
    "--hide-scrollbars",
    "--disable-gpu",
    "--no-sandbox",
    `--user-data-dir=${profile}`,
    "--force-device-scale-factor=1",
    `--window-size=${width},${height}`,
    `--screenshot=${pngPath}`,
    pathToFileURL(svgPath).href,
  ];
  try {
    // `--headless=new` on modern Chrome; fall back to the legacy flag for older builds. Chrome
    // occasionally fails to exit (e.g. under heavy load), so cap each attempt: the screenshot is
    // already on disk by then, and the timeout keeps the script from hanging on a stuck browser.
    for (const mode of ["--headless=new", "--headless"]) {
      rmSync(pngPath, { force: true });
      spawnSync(browser, [mode, ...base], {
        stdio: "ignore",
        timeout: 30000,
        killSignal: "SIGKILL",
      });
      if (existsSync(pngPath)) return;
    }
    throw new Error(`headless render failed: ${pngPath}`);
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";
const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const THEMES = {
  light: {
    bg: "#ffffff",
    surface: "#f6f8fa",
    border: "#d0d7de",
    text: "#1f2328",
    muted: "#59636e",
    design: "#8250df",
    plan: "#0969da",
    build: "#1a7f37",
    debug: "#cf222e",
    ship: "#0a7b83",
    gate: "#bf8700",
    gateInk: "#ffffff",
    ok: "#1a7f37",
    lime: "#7a9a0e",
  },
  dark: {
    bg: "#0d1117",
    surface: "#151b23",
    border: "#3d444d",
    text: "#f0f6fc",
    muted: "#9198a1",
    design: "#ab7df8",
    plan: "#4493f8",
    build: "#3fb950",
    debug: "#f85149",
    ship: "#39c5cf",
    gate: "#d29922",
    gateInk: "#0d1117",
    ok: "#3fb950",
    lime: "#a8c93a",
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const text = (
  x,
  y,
  s,
  { size = 16, weight = 400, fill, anchor = "start", font = SANS, ls = 0 } = {},
) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ""}>${esc(s)}</text>`;
const dots = (x, y, n, fill, r = 8, step = 22) =>
  Array.from(
    { length: n },
    (_, i) => `<circle cx="${x + i * step}" cy="${y}" r="${r}" fill="${fill}"/>`,
  ).join("");
const gateIcon = (cx, cy, t, r = 19) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.gate}"/>` +
  `<circle cx="${cx}" cy="${cy - 5}" r="${r * 0.24}" fill="${t.gateInk}"/>` +
  `<path d="M${cx - r * 0.42} ${cy + r * 0.5} a${r * 0.42} ${r * 0.38} 0 0 1 ${r * 0.84} 0 z" fill="${t.gateInk}"/>`;
const svg = (w, h, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">\n${body}\n</svg>\n`;
// bkit footer under every README image but the hero (the hero is the wordmark): a divider, then
// the licence on the left and the bkit signature on the right. `top` is the bottom edge of the
// image's last content; the same FOOT gap sits above the divider, between the divider and the
// footer, and below the footer, so every image ends alike. The footer row is 20 tall: the
// wordmark's top is 16 above the baseline, the URL's descenders 4 below. The signature is laid out
// left to right from a fixed start, so a wider fallback font can't push the wordmark into the dots.
const FOOT = 28;
const footH = (top) => top + 3 * FOOT + 20;
const footer = (t, W, top, inset = 60, rule = inset) => {
  const ry = top + FOOT,
    y = ry + FOOT + 16,
    x = W - inset - 304;
  return (
    `<line x1="${rule}" y1="${ry}" x2="${W - rule}" y2="${ry}" stroke="${t.border}"/>` +
    ["design", "plan", "build", "debug", "ship"]
      .map((p, i) => `<circle cx="${x + i * 14}" cy="${y - 7}" r="5" fill="${t[p]}"/>`)
      .join("") +
    text(inset, y, "Free and open source  ·  MIT license", { size: 15, fill: t.muted }) +
    text(x + 72, y + 1, "bkit", { size: 24, weight: 800, fill: t.text, ls: -0.6 }) +
    text(W - inset, y, "github.com/cbartens/bkit", { size: 15, fill: t.muted, anchor: "end" })
  );
};

// ---------- Hero ----------
function hero(t) {
  const W = 1200,
    H = 340;
  const phases = ["design", "plan", "build", "debug", "ship"];
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.surface}" stroke="${t.border}"/>`;
  b += phases.map((p, i) => `<circle cx="${72 + i * 22}" cy="84" r="7" fill="${t[p]}"/>`).join("");
  b += text(64, 178, "bkit", { size: 96, weight: 800, fill: t.text, ls: -3 });
  b += text(66, 236, "From vibe coding to production code.", {
    size: 34,
    weight: 700,
    fill: t.text,
  });
  b += text(66, 277, "A senior engineering team's process, ready-made.", {
    size: 21,
    fill: t.muted,
  });
  b += text(66, 306, "Run by AI agents. Battle-tested over >1,000 commits.", {
    size: 21,
    fill: t.muted,
  });

  // Terminal card
  const cx = 780,
    cy = 56,
    cw = 380,
    ch = 232;
  b += `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="12" fill="${t.bg}" stroke="${t.border}"/>`;
  b += ["#ff5f57", "#febc2e", "#28c840"]
    .map((c, i) => `<circle cx="${cx + 22 + i * 18}" cy="${cy + 22}" r="6" fill="${c}"/>`)
    .join("");
  b += text(cx + cw / 2, cy + 27, "my-app", {
    size: 14,
    fill: t.muted,
    anchor: "middle",
    font: MONO,
  });
  b += `<line x1="${cx}" y1="${cy + 44}" x2="${cx + cw}" y2="${cy + 44}" stroke="${t.border}"/>`;
  const rows = [
    ["/bkit-design", "design", [3, 2], "approved"],
    ["/bkit-plan", "plan", [3, 2], "approved"],
    ["/bkit-build", "build", [2, 2], "tests pass"],
    ["/bkit-debug", "debug", [2, 2], "fixed"],
    ["/bkit-ship", "ship", [1, 2], "merged"],
  ];
  rows.forEach(([cmd, p, [a, z], status], i) => {
    const y = cy + 76 + i * 36;
    b += text(cx + 22, y, cmd, { size: 17, fill: t[p], font: MONO, weight: 600 });
    b += dots(cx + 170, y - 6, a, t[p], 6, 16);
    b += dots(cx + 170 + a * 16 + 10, y - 6, z, t[p], 6, 16);
    b += text(cx + cw - 22, y, `✓ ${status}`, { size: 15, fill: t.ok, anchor: "end", weight: 600 });
  });
  return svg(
    W,
    H,
    b,
    "bkit — from vibe coding to production code. A senior engineering team's process, ready-made, run by AI agents and battle-tested over more than 1,000 commits.",
  );
}

// ---------- Social preview ----------
// GitHub repo Settings → Social preview takes PNG/JPG only. `bkit-social.png` is emitted by the
// headless-browser rasterisation at the end of this script; upload it there by hand.
function social(t) {
  const W = 1280,
    H = 640,
    L = 96;
  const phases = ["design", "plan", "build", "debug", "ship"];
  let b = `<rect width="${W}" height="${H}" fill="${t.bg}"/>`;
  b += phases
    .map((p, i) => `<circle cx="${L + 9 + i * 28}" cy="118" r="9" fill="${t[p]}"/>`)
    .join("");
  b += text(L - 6, 250, "bkit", { size: 140, weight: 800, fill: t.text, ls: -4 });
  b += text(L, 330, "From vibe coding to", { size: 46, weight: 700, fill: t.text });
  b += text(L, 386, "production code.", { size: 46, weight: 700, fill: t.text });
  b += text(L, 446, "A senior engineering team's process,", { size: 26, fill: t.muted });
  b += text(L, 482, "ready-made and battle-tested.", { size: 26, fill: t.muted });

  // Terminal card
  const cx = 704,
    cy = 110,
    cw = 480,
    ch = 372;
  b += `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="16" fill="${t.surface}" stroke="${t.border}"/>`;
  b += ["#ff5f57", "#febc2e", "#28c840"]
    .map((c, i) => `<circle cx="${cx + 28 + i * 22}" cy="${cy + 28}" r="7" fill="${c}"/>`)
    .join("");
  b += text(cx + cw / 2, cy + 34, "my-app", {
    size: 17,
    fill: t.muted,
    anchor: "middle",
    font: MONO,
  });
  b += `<line x1="${cx}" y1="${cy + 56}" x2="${cx + cw}" y2="${cy + 56}" stroke="${t.border}"/>`;
  const rows = [
    ["/bkit-design", "design", [3, 2], "approved"],
    ["/bkit-plan", "plan", [3, 2], "approved"],
    ["/bkit-build", "build", [2, 2], "tests pass"],
    ["/bkit-debug", "debug", [2, 2], "fixed"],
    ["/bkit-ship", "ship", [1, 2], "merged"],
  ];
  rows.forEach(([cmd, p, [a, z], status], i) => {
    const y = cy + 108 + i * 62;
    b += text(cx + 28, y, cmd, { size: 22, fill: t[p], font: MONO, weight: 600 });
    b += dots(cx + 222, y - 7, a, t[p], 7, 20);
    b += dots(cx + 222 + a * 20 + 12, y - 7, z, t[p], 7, 20);
    b += text(cx + cw - 28, y, `✓ ${status}`, { size: 19, fill: t.ok, anchor: "end", weight: 600 });
  });

  // Hosts band
  b += text(L, 572, "Works with", { size: 21, fill: t.muted, weight: 600 });
  let hx = L + 124;
  for (const h of ["Claude Code", "Cursor", "Codex", "Antigravity", "opencode"]) {
    const w = h.length * 11.4 + 34;
    b += `<rect x="${hx}" y="546" width="${w}" height="40" rx="20" fill="${t.surface}" stroke="${t.border}"/>`;
    b += text(hx + w / 2, 573, h, { size: 19, fill: t.text, anchor: "middle", weight: 600 });
    hx += w + 12;
  }
  return svg(
    W,
    H,
    b,
    "bkit — from vibe coding to production code. A senior engineering team's process, ready-made and battle-tested. Works with Claude Code, Cursor, Codex, Antigravity and opencode.",
  );
}

// ---------- Fences (why it works) ----------
const mix = (a, b, k) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return (
    "#" +
    x
      .map((v, i) =>
        Math.round(v + (y[i] - v) * k)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
};
function fences(t) {
  const W = 1200,
    H = 1060,
    X0 = 60,
    X1 = 1060,
    CY = 440;
  // Funnel half-height eases from 165 at the left to 40 at the right.
  const half = (x) => {
    const u = Math.min(1, Math.max(0, (x - X0) / (X1 - X0)));
    return 165 - 125 * u * u * (3 - 2 * u);
  };
  const edge = (x, side) => CY + side * half(x);
  const trace = (a, b, side) =>
    Array.from({ length: 61 }, (_, i) => {
      const x = a + ((b - a) * i) / 60;
      return `${i ? "L" : "M"}${x.toFixed(1)},${edge(x, side).toFixed(1)}`;
    }).join(" ");
  // Five phases: design, plan, build, debug, ship
  const cols = [X0, 276, 492, 708, 924, 1140];
  const fence = t.design,
    split = cols[2]; // reviewers only to the left, reviewers + automated checks to the right
  const agentCol = (x) =>
    x < cols[1]
      ? mix(t.gate, t.lime, Math.max(0, (x - X0) / (cols[1] - X0)))
      : x < split
        ? mix(t.lime, t.build, (x - cols[1]) / (split - cols[1]))
        : t.build;

  let b = `<defs><linearGradient id="fz" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${t.gate}" stop-opacity="0.1"/><stop offset="1" stop-color="${t.ok}" stop-opacity="0.14"/></linearGradient>`;
  b += `<marker id="fa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${t.debug}"/></marker></defs>`;
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(1031) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;

  b += text(X0, 64, "WHY IT WORKS", { size: 14, weight: 700, fill: t.plan, ls: 2.4 });
  b += text(X0 - 2, 128, "You don't steer AI.", { size: 56, weight: 800, fill: t.text, ls: -1.5 });
  b += text(X0 - 2, 190, "You build fences.", { size: 56, weight: 800, fill: t.muted, ls: -1.5 });
  b += text(
    X0,
    234,
    "Tell an AI what you want and you might get it. Put reviewers and hard checks around it, and anything off target is sent back.",
    { size: 19, fill: t.muted },
  );

  // Column guides, phase by phase
  cols.slice(1).forEach((x) => {
    b += `<line x1="${x}" y1="262" x2="${x}" y2="640" stroke="${t.border}" stroke-dasharray="4 6"/>`;
  });

  // Funnel body and fence
  b += `<path d="${trace(X0, X1, -1)} L${X1},${edge(X1, 1)} ${trace(X1, X0, 1).replace(/^M/, "L")} Z" fill="url(#fz)"/>`;
  for (const side of [-1, 1]) {
    b += `<path d="${trace(X0, split, side)}" fill="none" stroke="${fence}" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>`;
    b += `<path d="${trace(split, X1, side)}" fill="none" stroke="${fence}" stroke-width="6" stroke-linecap="round"/>`;
    for (let x = X0 + 6; x < X1; x += 18) {
      const y = edge(x, side);
      b += `<line x1="${x}" y1="${y + side * 4}" x2="${x + 3}" y2="${y + side * 12}" stroke="${fence}" stroke-width="1.5" opacity="0.6"/>`;
    }
  }
  b += text(0, 0, "THE FENCE", { size: 15, weight: 800, fill: fence, ls: 3 }).replace(
    "<text ",
    `<text transform="translate(540 ${edge(540, 1) + 34}) rotate(-10)" `,
  );

  // Bounces: off target, sent back, retried
  const bounces = [
    [560, -1],
    [770, 1],
    [960, -1],
  ];
  const taken = bounces.flatMap(([x, side]) => [
    [x, edge(x, side) - side * 30],
    [x + 40, edge(x + 40, side) - side * 30],
  ]);
  // Agents: scattered and pointing every way on the left, lined up on the right
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 30; i++) {
    const x = X0 + 40 + (i / 29) * (X1 - X0 - 90) + (rnd() - 0.5) * 30;
    const spread = half(x) - 22;
    let y = null;
    for (let tries = 0; tries < 20 && y === null; tries++) {
      const cand = CY + (rnd() * 2 - 1) * spread;
      if (taken.every(([tx, ty]) => Math.hypot(tx - x, ty - cand) > 40)) y = cand;
    }
    if (y === null) continue; // no clear spot: leave this agent out rather than overlap
    taken.push([x, y]);
    const order = Math.min(1, (x - X0) / (X1 - X0 - 120));
    const ang = (rnd() * 2 - 1) * Math.PI * 0.75 * (1 - order) ** 1.5 + (CY - y) * 0.004 * order;
    const c = agentCol(x);
    b += `<line x1="${(x - Math.cos(ang) * 30).toFixed(1)}" y1="${(y - Math.sin(ang) * 30).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.55"/>`;
    b += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${c}"/>`;
  }
  for (const [x, side] of bounces) {
    const hit = edge(x + 22, side) - side * 3;
    const y0 = edge(x, side) - side * 30;
    b += `<path d="M${x + 6},${y0 + side * -4} L${x + 22},${hit} L${x + 40},${edge(x + 40, side) - side * 30}" fill="none" stroke="${t.debug}" stroke-width="3" marker-end="url(#fa)"/>`;
    b += `<circle cx="${x}" cy="${y0}" r="9" fill="${t.debug}"/>`;
  }
  // Output
  b += `<line x1="${X1 + 12}" y1="${CY}" x2="${X1 + 64}" y2="${CY}" stroke="${t.ok}" stroke-width="3" stroke-linecap="round"/>`;
  b += `<circle cx="${X1 + 12}" cy="${CY}" r="11" fill="${t.ok}"/>`;
  b += text(1140, edge(980, -1) - 36, "Production-grade code", {
    size: 20,
    weight: 800,
    fill: t.ok,
    anchor: "end",
  });

  // Sign-off points, and where tests decide between debug and ship
  [cols[1], cols[2], cols[4]].forEach((x) => (b += gateIcon(x, 640, t, 16)));
  b += text(cols[3], 646, "tests fail", { size: 14, fill: t.debug, anchor: "middle", weight: 600 });
  b += text(cols[4] - 24, 646, "tests pass", { size: 14, fill: t.ok, anchor: "end", weight: 600 });

  // What fences each phase
  const phases = [
    {
      name: "Design",
      agents: [
        "3 rival designs",
        "Is it buildable?",
        "Will it run reliably?",
        "Probe code for unknowns",
      ],
      checks: [],
    },
    {
      name: "Plan",
      agents: [
        "Is the scope tight?",
        "Tasks in the right order?",
        "What could this break?",
        "Is every task testable?",
      ],
      checks: [],
    },
    {
      name: "Build",
      agents: ["Hunt bugs and edge cases", "Hunt security holes", "Was all of the plan built?"],
      checks: ["Typecheck · lint", "Formatting · prose", "Test lanes in CI"],
    },
    {
      name: "Debug",
      agents: ["Find the root cause", "Fix exactly that", "Remember the fix"],
      checks: ["Failed tests re-run", "Done only when green"],
    },
    {
      name: "Ship",
      agents: ["Resolve merge conflicts", "Nothing quietly dropped", "Docs brought up to date"],
      checks: ["Re-tested on latest code", "Every planned test ran"],
    },
  ];
  phases.forEach((p, i) => {
    const cx = (cols[i] + cols[i + 1]) / 2;
    b += text(cx, 702, p.name.toUpperCase(), {
      size: 26,
      weight: 800,
      fill: t.text,
      anchor: "middle",
      ls: 1.5,
    });
    b += text(cx, 736, "AGENTS", {
      size: 12,
      weight: 700,
      fill: fence,
      anchor: "middle",
      ls: 1.6,
    });
    p.agents.forEach(
      (s, k) => (b += text(cx, 762 + k * 24, s, { size: 16, fill: t.text, anchor: "middle" })),
    );
    b += text(cx, 872, "AUTOMATED CHECKS", {
      size: 12,
      weight: 700,
      fill: fence,
      anchor: "middle",
      ls: 1.6,
    });
    if (!p.checks.length)
      b += text(cx, 898, "No code to run yet", { size: 16, fill: t.muted, anchor: "middle" });
    p.checks.forEach((s, k) => {
      const [label, fill] = Array.isArray(s) ? s : [s, t.text];
      b += text(cx, 898 + k * 24, label, {
        size: 16,
        fill,
        anchor: "middle",
        weight: fill === t.text ? 400 : 600,
      });
    });
  });

  // Legend
  b += `<line x1="${X0}" y1="984" x2="${W - X0}" y2="984" stroke="${t.border}"/>`;
  let lx = X0;
  const item = (glyph, w, label) => {
    b += glyph(lx);
    b += text(lx + w, 1024, label, { size: 15, fill: t.muted });
    lx += w + label.length * 7.6 + 30;
  };
  item((x) => `<circle cx="${x + 8}" cy="1019" r="8" fill="${t.build}"/>`, 24, "AI agent");
  item(
    (x) => `<circle cx="${x + 8}" cy="1019" r="8" fill="${t.debug}"/>`,
    24,
    "Off target: sent back and retried",
  );
  item(
    (x) =>
      `<line x1="${x}" y1="1019" x2="${x + 30}" y2="1019" stroke="${fence}" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>`,
    40,
    "Reviewers only",
  );
  item(
    (x) =>
      `<line x1="${x}" y1="1019" x2="${x + 30}" y2="1019" stroke="${fence}" stroke-width="6" stroke-linecap="round"/>`,
    40,
    "Reviewers + CI template checks",
  );
  item((x) => gateIcon(x + 12, 1019, t, 12), 30, "Waits for your sign-off");

  return svg(
    W,
    footH(1031),
    b + footer(t, W, 1031),
    "You don't steer AI, you build fences. AI agents start out scattered at design and are funnelled through plan, build, debug and ship into production-grade code. At design and plan, reviewer agents fence the work in; from build onwards, automated checks from the CI template (typecheck, lint, formatting, prose, tests) join them. Work that goes off target is sent back and retried, a failed test goes to debug, which finds the root cause, fixes it and re-runs the tests until they pass, and bkit waits for your sign-off after design, after plan and before merge.",
  );
}

// ---------- Pipeline ----------
function pipeline(t) {
  const W = 1200,
    H = 690;
  let b = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${t.muted}"/></marker></defs>`;
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(672) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
  const line = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.muted}" stroke-width="2" marker-end="url(#ah)"/>`;
  // One dot per agent: groups add up to each phase's agent count in .bkit/core/workflows/.
  const cards = [
    {
      p: "design",
      cmd: "/bkit-design",
      title: "Design",
      g: [
        [3, "rival designs"],
        [3, "critique + probe code"],
        [3, "merge, refine, organise"],
      ],
      out: "→ design to approve",
    },
    {
      p: "plan",
      cmd: "/bkit-plan",
      title: "Plan",
      g: [
        [2, "critique the plan"],
        [1, "check the scope"],
        [2, "write + merge"],
      ],
      out: "→ plan to approve",
    },
    {
      p: "build",
      cmd: "/bkit-build",
      title: "Build",
      g: [
        [2, "check plan, add skills"],
        [3, "write + verify vs plan"],
        [2, "hunt bugs + security"],
      ],
      out: "→ tested pull request",
    },
    {
      p: "ship",
      cmd: "/bkit-ship",
      title: "Ship",
      g: [
        [1, "resolve conflicts"],
        [1, "check nothing's missing"],
        [1, "update docs"],
      ],
      out: "→ merged to dev",
    },
  ];
  const X = [40, 336, 632, 928],
    CW = 236,
    CY = 40,
    CH = 342;
  cards.forEach((c, i) => {
    const x = X[i],
      col = t[c.p];
    b += `<rect x="${x}" y="${CY}" width="${CW}" height="${CH}" rx="14" fill="${t.surface}" stroke="${t.border}"/>`;
    b += `<rect x="${x}" y="${CY}" width="${CW}" height="6" rx="3" fill="${col}"/>`;
    b += text(x + 24, CY + 44, c.cmd, { size: 17, fill: col, font: MONO, weight: 600 });
    b += text(x + 24, CY + 82, c.title, { size: 28, weight: 700, fill: t.text });
    b += `<line x1="${x + 24}" y1="${CY + 102}" x2="${x + CW - 24}" y2="${CY + 102}" stroke="${t.border}"/>`;
    c.g.forEach(([n, label], k) => {
      const gy = CY + 128 + k * 60;
      b += dots(x + 32, gy, n, col);
      b += text(x + 24, gy + 30, label, { size: 18, fill: t.text });
    });
    b += text(x + 24, CY + CH - 22, c.out, { size: 17, weight: 700, fill: col });
  });
  const ay = CY + 145;
  // Design -> Plan, Plan -> Build, Build -> Ship: gated
  [0, 1, 2].forEach((i) => {
    const x1 = X[i] + CW + 2,
      x2 = X[i + 1] - 4;
    b += line(x1, ay, x2, ay) + gateIcon((x1 + x2) / 2, ay, t);
  });
  b += text((X[2] + CW + X[3]) / 2, ay - 44, "tests", {
    size: 14,
    fill: t.muted,
    anchor: "middle",
  });
  b += text((X[2] + CW + X[3]) / 2, ay - 28, "pass", { size: 14, fill: t.muted, anchor: "middle" });

  // Debug side rail under Build
  const dx = X[2],
    dy = 450,
    dh = 150,
    dcol = t.debug;
  b += line(dx + 88, CY + CH + 4, dx + 88, dy - 4);
  b += line(dx + 148, dy - 4, dx + 148, CY + CH + 4);
  b += text(dx + 78, 415, "tests fail", { size: 15, fill: t.muted, anchor: "end" });
  b += text(dx + 158, 415, "fixed, re-test", { size: 15, fill: t.muted });
  b += `<rect x="${dx}" y="${dy}" width="${CW}" height="${dh}" rx="14" fill="${t.surface}" stroke="${t.border}"/>`;
  b += `<rect x="${dx}" y="${dy}" width="${CW}" height="6" rx="3" fill="${dcol}"/>`;
  b += text(dx + 24, dy + 40, "/bkit-debug", { size: 17, fill: dcol, font: MONO, weight: 600 });
  b += text(dx + 24, dy + 74, "Debug", { size: 26, weight: 700, fill: t.text });
  b += dots(dx + 32, dy + 100, 5, dcol);
  b += text(dx + 24, dy + 132, "find cause, fix, remember", { size: 17, fill: t.text });

  // Ship -> merged to dev; production stays with you
  const sx = X[3] + CW / 2;
  b += line(sx, CY + CH + 4, sx, 486);
  b += `<rect x="${sx - 100}" y="490" width="200" height="48" rx="24" fill="${t.surface}" stroke="${t.ok}" stroke-width="2"/>`;
  b += text(sx, 521, "✓ Merged to dev", { size: 20, weight: 700, fill: t.ok, anchor: "middle" });
  b += text(sx, 568, "Production stays your call", { size: 15, fill: t.muted, anchor: "middle" });

  // Legend
  const lx = 48;
  b +=
    gateIcon(lx + 12, 464, t, 14) +
    text(lx + 40, 470, "Stops and waits for your sign-off", { size: 18, fill: t.text });
  b +=
    dots(lx + 4, 510, 3, t.muted, 6, 16) +
    text(lx + 64, 516, "Each dot is a separate AI agent", { size: 18, fill: t.text });
  b +=
    dots(lx + 4, 556, 2, t.muted, 6, 16) +
    text(lx + 64, 562, "Reviewers never see each other's verdicts", { size: 18, fill: t.text });

  // Hosts band
  b += `<line x1="40" y1="620" x2="${W - 40}" y2="620" stroke="${t.border}"/>`;
  b += text(48, 661, "Runs on", { size: 17, fill: t.muted, weight: 600 });
  let hx = 128;
  for (const h of ["Claude Code", "Cursor", "Codex", "Antigravity", "opencode"]) {
    const w = h.length * 9.6 + 28;
    b += `<rect x="${hx}" y="638" width="${w}" height="34" rx="17" fill="${t.surface}" stroke="${t.border}"/>`;
    b += text(hx + w / 2, 661, h, { size: 16, fill: t.text, anchor: "middle", weight: 600 });
    hx += w + 10;
  }
  b += text(W - 48, 661, "Switch mid-feature — progress is saved in your repo", {
    size: 17,
    fill: t.muted,
    anchor: "end",
  });
  return svg(
    W,
    footH(672),
    b + footer(t, W, 672, 48, 40),
    "The bkit pipeline: design, plan, build and ship, with debug fixing failed tests. Each dot is one of 30 AI agents: 9 in design, 5 in plan, 8 in build, 5 in debug and 3 in ship. It waits for your sign-off after design, after plan and before merge, merges into dev, and leaves production to you. Runs on Claude Code, Cursor, Codex, Antigravity and opencode.",
  );
}

// ---------- CI pipeline (bkit-ci.yml with every building block switched on, and where workflows use it) ----------
// Lane ids are the bkit-tests-* jobs in .bkit/templates/.github/workflows/bkit-ci.yml.
function ci(t) {
  const W = 1200,
    H = 720;
  let b = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${t.muted}"/></marker></defs>`;
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(H - 30) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
  b += text(48, 60, "bkit-ci.yml", { size: 24, weight: 700, fill: t.text, font: MONO });
  b += text(48, 92, "From quick checks to live-site tests, ending in one green tick", {
    size: 18,
    fill: t.muted,
  });
  const tick = (cx, cy, r = 9) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.ok}"/>` +
    `<path d="M${cx - r * 0.45} ${cy} l${r * 0.3} ${r * 0.32} l${r * 0.6} -${r * 0.62}" fill="none" stroke="${t.bg}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cols = [
    { head: "Plan the run", lanes: [["What to test", "scope"]] },
    {
      head: "Check and build",
      lanes: [
        ["Quick checks", "static"],
        ["Unit tests", "unit"],
        ["Integration", "integration"],
        ["Web app", "build-web"],
        ["iOS app", "build-ios"],
        ["Android app", "build-android"],
        ["Database", "migration"],
      ],
    },
    {
      head: "Set the stage",
      lanes: [
        ["Preview deploy", "deploy"],
        ["Reset test data", "reset"],
      ],
    },
    {
      head: "Test like a user",
      lanes: [
        ["Web", "e2e-web"],
        ["iOS", "e2e-ios"],
        ["Android", "e2e-android"],
        ["Live site", "live-web"],
      ],
    },
    { head: "Tidy up", lanes: [["Clean up", "cleanup"]] },
  ];
  const X0 = 48,
    CW = 160,
    GAP = 28,
    Y0 = 150,
    PH = 44,
    STEP = 52;
  cols.forEach((c, i) => {
    const x = X0 + i * (CW + GAP);
    b += text(x, 132, c.head, { size: 16, weight: 700, fill: t.text });
    c.lanes.forEach(([label, id], k) => {
      const y = Y0 + k * STEP;
      b += `<rect x="${x}" y="${y}" width="${CW}" height="${PH}" rx="9" fill="${t.surface}" stroke="${t.border}"/>`;
      b += tick(x + 20, y + PH / 2);
      b += text(x + 38, y + 19, label, { size: 14, weight: 600, fill: t.text });
      b += text(x + 38, y + 36, id, { size: 12, fill: t.muted, font: MONO });
    });
    const ax = x + CW + 3,
      ay = Y0 + PH / 2;
    b += `<line x1="${ax}" y1="${ay}" x2="${ax + GAP - 8}" y2="${ay}" stroke="${t.muted}" stroke-width="2" marker-end="url(#ah)"/>`;
  });

  // Capstone: the single required check, needs every lane
  const fx = X0 + cols.length * (CW + GAP),
    fw = W - 48 - fx;
  b += text(fx, 132, "One green tick", { size: 16, weight: 700, fill: t.text });
  b += `<rect x="${fx}" y="${Y0}" width="${fw}" height="${PH}" rx="9" fill="${t.surface}" stroke="${t.ok}" stroke-width="2"/>`;
  b += tick(fx + 20, Y0 + PH / 2);
  b += text(fx + 38, Y0 + 19, "All lanes passed", { size: 14, weight: 600, fill: t.text });
  b += text(fx + 38, Y0 + 36, "check", { size: 12, fill: t.muted, font: MONO });
  [
    "Fails if a lane",
    "failed, was skipped",
    "or ran zero tests.",
    "",
    "The only check",
    "merging needs.",
  ].forEach((s, k) => {
    b += text(fx + 4, Y0 + PH + 28 + k * 20, s, { size: 14, fill: t.muted });
  });

  // Where each bkit workflow uses CI, in its phase colour
  const BY = 540;
  const bracket = (x1, x2, phase, cmd, lines) => {
    const col = t[phase];
    b += `<path d="M${x1} ${BY - 10} V${BY} H${x2} V${BY - 10}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round"/>`;
    b += text(x1, BY + 30, cmd, { size: 15, weight: 600, fill: col, font: MONO });
    lines.forEach((s, k) => {
      b += text(x1, BY + 52 + k * 20, s, { size: 14, fill: t.text });
    });
  };
  const colX = (i) => X0 + i * (CW + GAP);
  bracket(colX(0), colX(0) + CW, "build", "/bkit-build", [
    "starts it by opening",
    "the pull request",
  ]);
  bracket(colX(1), colX(4) + CW, "debug", "/bkit-debug", [
    "reads the logs of any lane that fails, finds the cause, fixes it and runs CI again",
  ]);
  bracket(fx, fx + fw, "ship", "/bkit-ship", ["merges only when", "this is green"]);

  b += `<line x1="40" y1="${H - 74}" x2="${W - 40}" y2="${H - 74}" stroke="${t.border}"/>`;
  b += text(
    W / 2,
    H - 34,
    "Runs only what a change affects  ·  Every action pinned to an exact commit  ·  In cloud mode, the result starts ship or debug by itself",
    { size: 16, fill: t.muted, anchor: "middle" },
  );
  return svg(
    W,
    footH(H - 30),
    b + footer(t, W, H - 30, 48, 40),
    "bkit's CI pipeline, flowing left to right: plan the run (work out what to test); check and build (quick checks, unit tests, integration tests, web, iOS and Android builds, database migrations); set the stage (preview deploy, reset test data); test like a user (web, iOS and Android end-to-end tests, and a live-site check); tidy up. Every lane feeds one final check, the only one merging needs, which fails if any lane failed, was skipped or ran zero tests. /bkit-build starts CI by opening the pull request, /bkit-debug reads the logs of any lane that fails and fixes it, and /bkit-ship merges only when the final check is green. In cloud mode, the result starts ship or debug by itself.",
  );
}

// ---------- Fence details (how each workflow meets the checks; follows on from fences) ----------
// Fences, nearest first: agent hooks (.claude/hooks/bkit-gateguard.cjs, advisory), .husky/pre-commit,
// .husky/pre-push, then the bkit-tests-* lanes in .bkit/templates/.github/workflows/bkit-ci.yml.
function fenceDetails(t) {
  const W = 1200,
    H = 1205;
  const arrow = (id, col) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`;
  let b = `<defs>${arrow("wr", t.debug)}${arrow("wg", t.ok)}${arrow("wp", t.plan)}${arrow("wm", t.muted)}<filter id="lbg" x="-0.03" y="-0.12" width="1.06" height="1.24"><feFlood flood-color="${t.surface}"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(H - 30) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;

  b += text(60, 64, "AGENTS AND CI", { size: 14, weight: 700, fill: t.plan, ls: 2.4 });
  b += text(58, 124, "Every change hits the same fences.", {
    size: 50,
    weight: 800,
    fill: t.text,
    ls: -1.4,
  });
  b += text(58, 180, "They never argue, and they grow.", {
    size: 50,
    weight: 800,
    fill: t.muted,
    ls: -1.4,
  });
  b += text(
    60,
    226,
    "Every workflow hits the same checks, reads what is sent back, and adds to them as features land.",
    { size: 18, fill: t.muted },
  );

  // Lanes
  const CT = 260,
    CB = 885,
    PX = 340;
  b += `<rect x="40" y="${CT}" width="${W - 80}" height="${CB - CT}" rx="14" fill="${t.surface}" stroke="${t.border}"/>`;

  // Markers: every agent, then the workflows
  const rows = [
    [
      "muted",
      "All agents",
      415,
      ["Every agent in every workflow,", "around every edit, step and commit"],
    ],
    [
      "plan",
      "/bkit-plan",
      535,
      ["Marks where each new test goes:", "unit, integration or end-to-end"],
    ],
    [
      "build",
      "/bkit-build",
      625,
      ["Writes each test first, sees it fail,", "then hits every fence"],
    ],
    [
      "debug",
      "/bkit-debug",
      715,
      ["Reads what came back: failed lane", "logs, diff since the last green run"],
    ],
    [
      "ship",
      "/bkit-ship",
      805,
      ["Merges only on the green tick,", "re-checked on the merge commit"],
    ],
  ];
  rows.forEach(([p, cmd, y, lines]) => {
    const isCmd = cmd.startsWith("/");
    b += text(60, y - 14, cmd, {
      size: 17,
      weight: isCmd ? 600 : 700,
      fill: isCmd ? t[p] : t.text,
      font: isCmd ? MONO : SANS,
    });
    lines.forEach((s, k) => (b += text(60, y + 8 + k * 20, s, { size: 14, fill: t.text })));
    const half = isCmd ? 30 : 60;
    b += `<rect x="${PX}" y="${y - half}" width="10" height="${half * 2}" rx="5" fill="${t[p]}"/>`;
  });

  // Fences, nearest (cheapest) first; CI is the thickest. No tool names: the tools behind
  // code search and the hooks are swappable templates.
  const LT = 345,
    LB = 865;
  const layers = [
    [620, "Code search", "every lookup", 2, "2 6"],
    [716, "Agent hooks", "every edit", 3, "6 7"],
    [812, "Step gates", "every step", 4],
    [908, "pre-commit", "every commit", 5],
    [1004, "pre-push", "every push", 10],
    [1100, "CI", "every push/pull", 18],
  ];
  const face = {};
  layers.forEach(([x, name, when, w, dash]) => {
    b += `<line x1="${x}" y1="${LT}" x2="${x}" y2="${LB}" stroke="${t.muted}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ""} stroke-linecap="round"/>`;
    b += text(x, 304, name, { size: 14, weight: 700, fill: t.text, anchor: "middle" });
    b += text(x, 324, when, { size: 13, fill: t.muted, anchor: "middle" });
    face[name] = x - w / 2 - 9;
  });

  // One line per workflow: out to the fence that answers, back to the agent
  const label = (y, s, col) =>
    `<text x="${PX + 48}" y="${y}" font-family="${SANS}" font-size="13" font-weight="600" fill="${col}" text-anchor="start" filter="url(#lbg)">${esc(s)}</text>`;
  const rally = (y, to, col, mk, s) => {
    const x = face[to];
    b += `<line x1="${x}" y1="${y}" x2="${PX + 20}" y2="${y}" stroke="${col}" stroke-width="2.5" marker-end="url(#${mk})"/>`;
    b += `<circle cx="${x}" cy="${y}" r="8" fill="${col}"/>`;
    if (s) b += label(y - 8, s, col);
  };
  // Every agent: looks up the code, is nudged on each edit, formatted on each commit
  rally(370, "Code search", t.muted, "wm", "callers found");
  rally(400, "Agent hooks", t.muted, "wm", "edits nudged");
  rally(430, "Step gates", t.muted, "wm", "steps checked by scripts, not prompts");
  rally(460, "pre-commit", t.muted, "wm", "code formatted");
  // Plan only sends: it decides the tests this feature adds to the fences
  b += `<line x1="${PX + 20}" y1="535" x2="${face.CI - 6}" y2="535" stroke="${t.plan}" stroke-width="2.5" stroke-dasharray="8 6" marker-end="url(#wp)"/>`;
  b += label(527, "decides the tests this feature adds", t.plan);
  rally(625, "pre-push", t.debug, "wr", "red: sent back before it leaves your laptop");
  rally(715, "CI", t.debug, "wr", "red: logs provide context to help debug");
  // Ship: a green change passes through CI rather than coming back
  b += `<line x1="${PX + 20}" y1="805" x2="${W - 63}" y2="805" stroke="${t.ok}" stroke-width="2.5" marker-end="url(#wg)"/>`;
  b += label(797, "green: passes CI, ship merges", t.ok);

  // The fences, nearest first
  b += text(60, 937, "THE FENCES, NEAREST FIRST", {
    size: 14,
    weight: 700,
    fill: t.plan,
    ls: 2.4,
  });
  const cards = [
    [
      "Code search",
      "every lookup",
      [
        "Shows every definition",
        "and caller before a",
        "change, not just lines",
        "with matching words",
      ],
    ],
    [
      "Agent hooks",
      "every edit",
      [
        "Nudge the agent to read",
        "a file before changing it",
        "and fix code, not",
        "loosen checks",
      ],
    ],
    [
      "Step gates",
      "every step",
      [
        "Scripts, not prompts. A",
        "step missing its verdict",
        "or files can't finish,",
        "whatever the agent says",
      ],
    ],
    [
      "pre-commit",
      "every commit",
      [
        "Formats only the files",
        "being committed, so it",
        "takes seconds. Your own",
        "quick checks go here too",
      ],
    ],
    [
      "pre-push",
      "every push",
      [
        "Types, unit tests, prose,",
        "new junk code, bkit drift.",
        "Blocks a push that",
        "would switch CI off",
      ],
    ],
    [
      "CI",
      "every push/pull",
      [
        "Integration, end-to-end,",
        "live site. One check fails",
        "if a lane failed, was",
        "skipped or ran no tests",
      ],
    ],
  ];
  cards.forEach(([name, when, lines], i) => {
    const x = 60 + i * 182;
    b += text(x, 973, name, { size: 16, weight: 700, fill: t.text });
    b += text(x, 993, when, { size: 13, fill: t.muted });
    lines.forEach((s, k) => (b += text(x, 1021 + k * 20, s, { size: 14, fill: t.text })));
  });

  b += `<line x1="40" y1="${H - 74}" x2="${W - 40}" y2="${H - 74}" stroke="${t.border}"/>`;
  b += text(
    W / 2,
    H - 34,
    "Hooks, agents and CI run the same commands  ·  In cloud mode, CI's answer starts debug or ship by itself",
    { size: 16, fill: t.muted, anchor: "middle" },
  );
  return svg(
    W,
    footH(H - 30),
    b + footer(t, W, H - 30, 60, 40),
    "Every change hits the same fences. They never argue, and they grow. On the left, the agents. Every agent in every workflow looks up every definition and caller with code search before a change, is nudged by the agent hooks on every edit, has every workflow step checked by the step gates, and has its code formatted by the pre-commit hook on every commit. /bkit-plan decides the tests each feature adds to the fences (unit, integration or end-to-end). /bkit-build writes each test first, sees it fail, then hits every fence; the pre-push hook sends problems back before they leave your laptop. When a CI lane goes red, its logs give /bkit-debug the context to fix it. When CI is green, the change passes through and /bkit-ship merges it, re-checked on the merge commit. On the right, the fences, nearest and lightest first: code search on every lookup, agent hooks on every edit, step gates on every step, the pre-commit hook on every commit, the pre-push hook on every push, and CI, the strongest, on every push and pull request. The step gates are scripts, not prompts: a step missing its verdict or files can't finish, whatever the agent says. The pre-commit hook formats only the files being committed, so it takes seconds, and your own quick checks can go there too. CI runs integration, end-to-end and live-site tests, and one check fails if any lane failed, was skipped or ran no tests. Hooks, agents and CI run the same commands, and in cloud mode CI's answer starts debug or ship by itself.",
  );
}

// ---------- Audit map (what two audit templates found in one adopting app) ----------
// One chip per .bkit/core/docs/templates/bkit-audit-*.md; a template with no label here fails the render.
const AUDIT_LABELS = {
  accessibility: "Accessibility",
  adoption: "Adoption",
  agents: "Agents",
  "aio-seo": "AI search & SEO",
  analytics: "Analytics",
  annotations: "Annotations",
  "app-performance": "App performance",
  "app-store": "App Store",
  architecture: "Architecture",
  "ci-performance": "CI performance",
  config: "Config",
  cost: "Cost",
  coverage: "Coverage",
  database: "Database",
  "dead-code": "Dead code",
  deferrals: "Deferrals",
  dependencies: "Dependencies",
  documentation: "Documentation",
  duplication: "Duplication",
  failures: "Failures",
  flakes: "Flaky tests",
  gates: "Gates",
  issues: "Issues",
  llm: "LLM",
  logs: "Logs",
  models: "Models",
  privacy: "Privacy",
  prompts: "Prompts",
  "red-team": "Red team",
  reliability: "Reliability",
  repo: "Repo",
  security: "Security",
  slop: "Slop",
  testing: "Testing",
  usability: "Usability",
};
function auditSlugs() {
  const dir = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    ".bkit",
    "core",
    "docs",
    "templates",
  );
  const slugs = readdirSync(dir)
    .filter((f) => /^bkit-audit-.+\.md$/.test(f))
    .map((f) => f.slice("bkit-audit-".length, -".md".length))
    .sort();
  const missing = slugs.filter((s) => !AUDIT_LABELS[s]);
  if (missing.length) throw new Error(`no chip label for audit template(s): ${missing.join(", ")}`);
  return slugs;
}

function audits(t) {
  const W = 1200;
  // Rough text widths for sizing cards and chips (no font metrics in an SVG string).
  const tw = (s, size, bold) => s.length * size * (bold ? 0.55 : 0.5);
  // Seeded, so re-running the script redraws the same wiring.
  let seed = 7;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const pick = (a) => a[Math.floor(rand() * a.length)];

  let b = "";
  b += text(60, 64, "WHAT BKIT'S AUDIT TEMPLATES FOUND", {
    size: 14,
    weight: 700,
    fill: t.plan,
    ls: 2.4,
  });
  b += text(58, 124, "The tests were green.", { size: 50, weight: 800, fill: t.text, ls: -1.4 });
  b += text(58, 180, "The bugs were still there.", {
    size: 50,
    weight: 800,
    fill: t.muted,
    ls: -1.4,
  });
  b += text(
    60,
    226,
    "An app that adopted bkit, mapped. Every red circle was found by one of bkit's audit templates.",
    { size: 18, fill: t.muted },
  );
  b += text(60, 252, "Bigger circle, bigger problem.", { size: 18, fill: t.muted });

  // Key, top right beside the heading
  const PH = 13,
    KX = 850;
  b += `<circle cx="${KX + 6}" cy="112" r="5" fill="none" stroke="${t.debug}" stroke-width="2"/>`;
  b += `<circle cx="${KX + 30}" cy="112" r="10" fill="${t.debug}" fill-opacity="0.13" stroke="${t.debug}" stroke-width="2"/>`;
  b += text(KX + 50, 118, "Problem found, sized by how big", { size: 16, fill: t.text });
  b += `<rect x="${KX}" y="${152 - PH / 2}" width="40" height="${PH}" rx="${PH / 2}" fill="${t.bg}" stroke="${t.border}"/>`;
  b += text(KX + 50, 158, "The app's code, simplified", { size: 16, fill: t.text });

  // The app's code: one column per layer, one pill per module
  const column = (x, w, top, n, step, first) => {
    const pills = [];
    for (let i = 0; i < n; i++) {
      const pw = w - 22 - Math.round(rand() * 34);
      pills.push({ x: x + (w - pw) / 2, y: first + i * step, w: pw });
    }
    return pills;
  };
  const box = (x, y, w, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${t.surface}" stroke="${t.border}"/>`;
  const heading = (x, y, s, size = 13) =>
    text(x, y, s, {
      size,
      weight: 700,
      fill: size < 13 ? t.muted : t.text,
      anchor: "middle",
      ls: size < 13 ? 1.8 : 2.4,
    });

  b += heading(151, 344, "SCREENS");
  b += box(90, 360, 122, 432) + heading(151, 380, "WEB", 11);
  b += box(90, 862, 122, 150) + heading(151, 882, "PHONE", 11);
  b += heading(451, 336, "API") + box(390, 352, 122, 645);
  b += heading(758, 300, "SERVICES") + box(689, 316, 139, 716);
  b += heading(1058, 420, "OUTSIDE SERVICES") + box(997, 436, 123, 480);

  const web = column(90, 122, 360, 13, 30, 398);
  const phone = column(90, 122, 862, 4, 28, 898);
  const api = column(390, 122, 352, 20, 30, 372);
  const services = column(689, 139, 316, 23, 30, 336);
  const outside = column(997, 123, 436, 11, 42, 460);

  // Calls between modules, left to right
  const wire = (from, to, n) => {
    for (let i = 0; i < n; i++) {
      const a = pick(from),
        z = pick(to);
      const x1 = a.x + a.w,
        y1 = a.y + PH / 2,
        x2 = z.x,
        y2 = z.y + PH / 2,
        dx = (x2 - x1) / 2;
      b += `<path d="M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}" fill="none" stroke="${t.muted}" stroke-opacity="0.3" stroke-width="0.9"/>`;
    }
  };
  wire(web, api, 26);
  wire(phone, api, 8);
  wire(web, services, 8);
  wire(api, services, 50);
  wire(api, outside, 6);
  wire(services, outside, 28);
  for (const p of [...web, ...phone, ...api, ...services, ...outside])
    b += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${PH}" rx="${PH / 2}" fill="${t.bg}" stroke="${t.border}"/>`;

  // Findings: circle on the code it was found in, card to its right
  const findings = [
    [
      151,
      576,
      80,
      "TESTING AUDIT",
      "Tests that could never fail",
      ["About 100 read the code as text", "instead of running it"],
    ],
    [
      451,
      462,
      37,
      "TESTING AUDIT",
      "A security hole",
      ["A sign-in link could send", "people to another website"],
    ],
    [
      758,
      576,
      72,
      "DUPLICATION AUDIT",
      "One rule, written 8 times",
      ["The copies drifted: some billed", "accounts users had left"],
    ],
    [
      604,
      716,
      54,
      "TESTING AUDIT",
      "No test made a request fail",
      ["A failed save could still", "show “Saved”"],
    ],
    [
      151,
      756,
      23,
      "TESTING AUDIT",
      "A fix in dead code",
      ["The live screen next to it", "stayed broken"],
    ],
    [
      451,
      852,
      44,
      "DUPLICATION AUDIT",
      "One database read, 4 copies",
      ["Word for word, and one", "inside the API itself"],
    ],
    [
      151,
      948,
      44,
      "TESTING AUDIT",
      "Phone tests that weren’t",
      ["23 of 33 actually ran as web pages"],
    ],
  ];
  for (const [cx, cy, r] of findings)
    b +=
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.debug}" fill-opacity="0.13" stroke="${t.debug}" stroke-width="2"/>` +
      `<circle cx="${cx}" cy="${cy}" r="5" fill="${t.debug}"/>`;
  for (const [cx, cy, r, audit, title, lines] of findings) {
    const w =
      Math.max(
        tw(audit, 11, true) + audit.length * 1.6,
        tw(title, 16, true),
        ...lines.map((s) => tw(s, 13, false)),
      ) + 28;
    const h = 60 + lines.length * 18;
    const x = cx + r + 10,
      y = Math.round(cy - h / 2);
    b += `<rect x="${x}" y="${y}" width="${Math.round(w)}" height="${h}" rx="8" fill="${t.bg}" stroke="${t.border}"/>`;
    b += text(x + 14, y + 22, audit, { size: 11, weight: 700, fill: t.design, ls: 1.6 });
    b += text(x + 14, y + 44, title, { size: 16, weight: 700, fill: t.debug });
    lines.forEach((s, k) => (b += text(x + 14, y + 64 + k * 18, s, { size: 13, fill: t.text })));
  }

  // Every audit template bkit ships; the two behind this map filled in
  const used = new Set(["testing", "duplication"]);
  const slugs = auditSlugs();
  b += `<line x1="40" y1="1060" x2="${W - 40}" y2="1060" stroke="${t.border}"/>`;
  b += text(60, 1100, `THIS MAP: ${used.size} OF THE ${slugs.length} AUDIT TEMPLATES BKIT SHIPS`, {
    size: 14,
    weight: 700,
    fill: t.design,
    ls: 2.4,
  });
  let cx = 60,
    cy = 1118;
  for (const slug of slugs) {
    const label = AUDIT_LABELS[slug],
      on = used.has(slug);
    const w = Math.round(tw(label, 14, on) + 28);
    if (cx + w > W - 40) {
      cx = 60;
      cy += 40;
    }
    b += `<rect x="${cx}" y="${cy}" width="${w}" height="30" rx="15" fill="${on ? t.design : t.bg}" stroke="${on ? t.design : t.border}"/>`;
    b += text(cx + w / 2, cy + 20, label, {
      size: 14,
      weight: on ? 700 : 400,
      fill: on ? t.gateInk : t.muted,
      anchor: "middle",
    });
    cx += w + 10;
  }

  const top = cy + 30,
    H = footH(top);
  b += footer(t, W, top, 60, 40);

  return svg(
    W,
    H,
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>` +
      b,
    `The tests were green. The bugs were still there. A map of an app that adopted bkit, in four columns: screens (web and phone), API, services and outside services, with thin lines for the calls between them. Red circles mark what bkit's audit templates found, bigger for bigger problems. Testing audit: tests that could never fail, about 100 of which read the code as text instead of running it; a security hole, where a sign-in link could send people to another website; no test made a request fail, so a failed save could still show “Saved”; a fix in dead code, while the live screen next to it stayed broken; phone tests that weren't, with 23 of 33 actually running as web pages. Duplication audit: one rule written 8 times, whose copies drifted so some billed accounts users had left; one database read in 4 copies, word for word, one inside the API itself. This map used 2 of the ${slugs.length} audit templates bkit ships: ${slugs.map((s) => AUDIT_LABELS[s]).join(", ")}.`,
  );
}

// ---------- Context map (what each phase reads and writes) ----------
// r = reads, w = writes, rw = both; one entry per phase: design, plan, build, debug, ship.
// Sources: .bkit/core/.agents/docs.md phase matrix, Read / Create lines in .bkit/core/workflows/.
function context(t) {
  const W = 1200,
    X0 = 60,
    C0 = 700,
    CS = 104,
    RH = 46;
  const phases = ["design", "plan", "build", "debug", "ship"];
  const groups = [
    {
      title: "IN YOUR REPO",
      note: "plain files, versioned with your code",
      rows: [
        [
          "Project docs",
          "architecture, tech stack, data schema, security, testing, deployments, monitoring",
          ["r", "r", "r", "r", "rw"],
        ],
        [
          "Lessons learned",
          "docs/knowledge.jsonl — symptom, root cause, fix",
          ["r", "r", "rw", "rw", "rw"],
        ],
        [
          "Decisions and why",
          "docs/decisions.jsonl — what was chosen, what was ruled out",
          ["rw", "rw", "r", "rw", "rw"],
        ],
        [
          "Postponed work",
          "docs/deferrals.jsonl — resurfaced before every merge",
          ["rw", "rw", "rw", "rw", "rw"],
        ],
        [
          "Known bugs",
          "docs/failures.jsonl — found along the way, never dropped",
          ["rw", "rw", "rw", "rw", "rw"],
        ],
        ["Designs and plans", "docs/plans/ — what you approved", ["w", "rw", "r", "r", "r"]],
        ["Audit reports", "docs/audits/ — findings from >30 audits", ["", "r", "", "", ""]],
        ["Code map", "Serena symbol lookup, docs/capabilities.md", ["r", "r", "r", "r", "r"]],
        [
          "Run state and stats",
          "status.jsonl, stats.jsonl — resume anywhere, numbers on every run",
          ["rw", "rw", "rw", "rw", "rw"],
        ],
        [
          "Skills",
          ".agents/skills/ — added for the feature, removed after",
          ["", "", "rw", "", "w"],
        ],
      ],
    },
    {
      title: "OUTSIDE YOUR REPO",
      note: "fetched fresh, at the step that needs it",
      rows: [
        [
          "Issue tracker",
          "GitHub Issues, Linear or Jira — progress, status, links",
          ["rw", "rw", "rw", "rw", "rw"],
        ],
        ["Related issues", "your backlog, searched by meaning", ["r", "r", "", "r", ""]],
        ["Web search", "feasibility, vendor quirks, known issues", ["r", "", "", "r", ""]],
        [
          "CI runs and test reports",
          "failed logs, diff since last green, Playwright, Maestro",
          ["", "", "", "r", "r"],
        ],
        [
          "Runtime platforms",
          "Sentry, Vercel, Supabase, Stripe, Cloud Run, Inngest, Resend, Expo",
          ["", "", "", "r", ""],
        ],
        ["Pull request", "opened, fixed and merged by bkit", ["", "", "w", "w", "rw"]],
      ],
    },
  ];
  const nRows = groups.reduce((n, g) => n + g.rows.length, 0);
  const top = 300;
  const H = top + groups.length * 56 + nRows * RH + 120;
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(H - 49) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
  b += text(X0, 64, "WHAT IT KNOWS", { size: 14, weight: 700, fill: t.plan, ls: 2.4 });
  b += text(X0 - 2, 128, "Right context, right step.", {
    size: 56,
    weight: 800,
    fill: t.text,
    ls: -1.5,
  });
  b += text(X0 - 2, 190, "Written back as it learns.", {
    size: 56,
    weight: 800,
    fill: t.muted,
    ls: -1.5,
  });
  b += text(
    X0,
    234,
    "Each step reads what it needs from your repo and your platforms, and writes back what it learned.",
    { size: 19, fill: t.muted },
  );
  const cx = (i) => C0 + i * CS;
  phases.forEach((p, i) => {
    b += text(cx(i), top - 18, p.toUpperCase(), {
      size: 15,
      weight: 800,
      fill: t[p],
      anchor: "middle",
      ls: 1.4,
    });
  });
  const mark = (x, y, m, col) => {
    if (!m) return `<circle cx="${x}" cy="${y}" r="2" fill="${t.border}"/>`;
    if (m === "r")
      return `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${col}" stroke-width="2.5"/>`;
    if (m === "w") return `<circle cx="${x}" cy="${y}" r="9" fill="${col}"/>`;
    return (
      `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${col}" stroke-width="2.5"/>` +
      `<circle cx="${x}" cy="${y}" r="5" fill="${col}"/>`
    );
  };
  let y = top;
  groups.forEach((g) => {
    b += `<line x1="${X0}" y1="${y}" x2="${W - X0}" y2="${y}" stroke="${t.border}"/>`;
    b += text(X0, y + 34, g.title, { size: 14, weight: 800, fill: t.text, ls: 2 });
    b += text(X0 + g.title.length * 11 + 18, y + 34, g.note, { size: 15, fill: t.muted });
    y += 56;
    g.rows.forEach(([name, detail, marks], k) => {
      if (k % 2 === 0)
        b += `<rect x="${X0 - 12}" y="${y}" width="${W - 2 * X0 + 24}" height="${RH}" rx="8" fill="${t.surface}"/>`;
      b += text(X0, y + 20, name, { size: 17, weight: 700, fill: t.text });
      b += text(X0, y + 38, detail, { size: 13, fill: t.muted });
      marks.forEach((m, i) => (b += mark(cx(i), y + RH / 2, m, t[phases[i]])));
      y += RH;
    });
  });

  // Legend
  y += 40;
  b += `<line x1="${X0}" y1="${y - 16}" x2="${W - X0}" y2="${y - 16}" stroke="${t.border}"/>`;
  let lx = X0;
  for (const [m, label] of [
    ["r", "Reads"],
    ["w", "Writes"],
    ["rw", "Reads and writes"],
  ]) {
    b += mark(lx + 10, y + 20, m, t.muted);
    b += text(lx + 30, y + 26, label, { size: 15, fill: t.muted });
    lx += 30 + label.length * 7.6 + 36;
  }
  b += text(W - X0, y + 26, "Nothing lives only in a chat window", {
    size: 15,
    fill: t.muted,
    anchor: "end",
  });
  return svg(
    W,
    footH(H - 49),
    b + footer(t, W, H - 49),
    "What it knows: right context, right step, written back as it learns. In your repo, bkit reads project docs at every step and updates them at ship; reads and writes lessons, decisions, postponed work and known bugs; writes designs and plans that later steps read; reads audit reports at plan and a code map at every step; keeps run state and stats at every step; adds skills at build and removes them at ship. Outside your repo, it reads and updates the GitHub, Linear or Jira issue at every step, searches related issues at design, plan and debug, searches the web at design and debug, reads CI runs and test reports at debug and ship, reads runtime platforms such as Sentry, Vercel, Supabase and Stripe at debug, and opens, fixes and merges the pull request.",
  );
}

// ---------- Token use (why compression saves so little) ----------
// Source: tests/compression/bkit-caveman-headroom-compression-proxy-comparison.md (T3, T4, T5, T7).
// The two greys are the part no compressor can touch; each segment is labelled, so they need no hue.
function tokens(t) {
  const W = 1200,
    X0 = 60,
    BW = W - 2 * X0,
    BY = 340,
    BH = 56;
  const dark = t.bg === THEMES.dark.bg;
  const seg = [
    [69.3, dark ? "#484f58" : "#afb8c1"],
    [3.8, dark ? "#9198a1" : "#59636e"],
    [24.9, t.plan],
    [2.0, dark ? "#bb8009" : t.gate],
  ];
  const pros = [
    ["Saves 1–3% of the bill", ["on typical bkit work"]],
    ["Big cuts on huge logs", ["up to 95% on one 1.2 MB git log"]],
    ["Prompt cache stays intact", ["so nothing else gets more expensive"]],
  ];
  const cons = [
    [
      "Wrong answers.",
      [
        "An agent answered a question wrongly from a compressed log",
        "and never fetched the original.",
      ],
    ],
    [
      "Broken code.",
      [
        "Headroom turned “=> void” into “void”. RTK strips indentation and cuts lines",
        "at 80 characters, so edits that quote those lines fail.",
      ],
    ],
    [
      "Hidden content.",
      [
        "Cut text comes back only if the agent spots the marker and asks for it,",
        "and asking costs tokens, which eats into the saving.",
      ],
    ],
    [
      "Silent failures.",
      [
        "A missing dependency or an ignored setting turns compression off with no warning.",
        "Seen with caveman and Headroom; RTK's hook is built to do the same.",
      ],
    ],
    [
      "A proxy sees all your model traffic.",
      ["A supply-chain and security risk. The caveman release we tested", "was one day old."],
    ],
    [
      "Clashes with bkit's own setup.",
      [
        "A tool added to every agent (caveman), a second permission check beside",
        "bkit's gates (RTK), edits to your global settings.",
      ],
    ],
  ];
  const STEP = 86,
    top = 690;
  const H = top + cons.length * STEP - 20;
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(H) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
  b += text(X0, 64, "TOKEN USE", { size: 14, weight: 700, fill: t.plan, ls: 2.4 });
  b += text(X0 - 2, 128, "Compression saves 1–3%.", {
    size: 56,
    weight: 800,
    fill: t.text,
    ls: -1.5,
  });
  b += text(X0 - 2, 190, "The risks cost more.", {
    size: 56,
    weight: 800,
    fill: t.muted,
    ls: -1.5,
  });
  b += text(
    X0,
    234,
    "Where Claude Code's cost goes across 456 real bkit transcripts. The whole bar is the bill.",
    { size: 19, fill: t.muted },
  );
  b += text(X0, 292, "69%  Re-reading everything else", { size: 20, weight: 700, fill: t.text });
  b += text(X0, 318, "system prompt, rules, tool list and the conversation, on every request", {
    size: 15,
    fill: t.muted,
  });
  b += text(W - X0, 292, "27%  Big tool output", {
    size: 20,
    weight: 700,
    fill: t.text,
    anchor: "end",
  });
  b += text(W - X0, 318, "the only part a compressor can touch", {
    size: 15,
    fill: t.muted,
    anchor: "end",
  });
  // 2px surface gap between segments; the clip rounds only the bar's outer ends.
  let x = X0;
  const mid = [];
  b += `<clipPath id="tokens-bar"><rect x="${X0}" y="${BY}" width="${BW}" height="${BH}" rx="8"/></clipPath><g clip-path="url(#tokens-bar)">`;
  seg.forEach(([pct, fill], i) => {
    const w = (BW * pct) / 100,
      l = x + (i ? 1 : 0),
      r = x + w - (i < seg.length - 1 ? 1 : 0);
    b += `<rect x="${l.toFixed(1)}" y="${BY}" width="${(r - l).toFixed(1)}" height="${BH}" fill="${fill}"/>`;
    mid.push(x + w / 2);
    x += w;
  });
  b += "</g>";
  const tick = (cx, len) =>
    `<line x1="${cx.toFixed(1)}" y1="${BY + BH + 2}" x2="${cx.toFixed(1)}" y2="${BY + BH + len}" stroke="${t.muted}"/>`;
  b += tick(mid[1], 26);
  b += `<text x="${(mid[1] + 8).toFixed(1)}" y="${BY + BH + 24}" font-family="${SANS}" font-size="16" fill="${t.muted}"><tspan font-weight="700" fill="${t.text}">4%</tspan>  The model's own writing</text>`;
  b += tick(mid[3], 64);
  b += `<text x="${(mid[3] - 8).toFixed(1)}" y="${BY + BH + 62}" font-family="${SANS}" font-size="17" fill="${t.text}" text-anchor="end"><tspan font-weight="800">1–3%</tspan>  What the tools actually remove</text>`;
  b += text(
    X0,
    BY + BH + 108,
    "The tools that remove more get there by cutting code and logs the agent needs word for word.",
    { size: 15, fill: t.muted },
  );

  // Is it worth it? Gains on the left, costs on the right; each header carries an icon and a label.
  const PY = 580,
    LX = X0,
    RX = 470;
  b += `<line x1="${X0}" y1="${PY - 50}" x2="${W - X0}" y2="${PY - 50}" stroke="${t.border}"/>`;
  b += text(X0, PY, "Is it worth it? A modest saving, real risks.", {
    size: 28,
    weight: 800,
    fill: t.text,
    ls: -0.5,
  });
  const head = (hx, glyph, fill, label) =>
    `<circle cx="${hx + 11}" cy="${PY + 45}" r="11" fill="${fill}"/>` +
    text(hx + 11, PY + 51, glyph, { size: 16, weight: 800, fill: t.gateInk, anchor: "middle" }) +
    text(hx + 32, PY + 51, label, { size: 18, weight: 700, fill: t.text });
  b += head(LX, "+", t.ok, "What you gain");
  b += head(RX, "!", t.debug, "What it costs you");
  const list = (lx, items) =>
    items
      .map(
        ([lead, rest], i) =>
          text(lx, top + i * STEP, lead, { size: 17, weight: 700, fill: t.text }) +
          rest
            .map((line, j) =>
              text(lx, top + i * STEP + 24 + j * 22, line, { size: 15, fill: t.muted }),
            )
            .join(""),
      )
      .join("");
  b += list(LX, pros) + list(RX, cons);
  return svg(
    W,
    footH(H),
    b + footer(t, W, H),
    "Compression saves 1 to 3 percent; the risks cost more. Where Claude Code's cost goes across 456 real bkit transcripts: 69 percent is the model re-reading the system prompt, rules, tool list and conversation on every request; 4 percent is the model's own writing; 27 percent is big tool output, the only part a compressor can touch; the tools remove 1 to 3 percent of the bill. What you gain: 1 to 3 percent of the bill saved, big cuts on huge logs, prompt cache intact. What it costs you: wrong answers from compressed logs, broken code when lines are rewritten or cut, hidden content that costs tokens to fetch back, silent failures that turn compression off, a proxy that sees all your model traffic, and clashes with bkit's own setup.",
  );
}

// ---------- Token use (what bkit does instead: stop the re-reading) ----------
// Every printed figure is published third-party work; bkit's own numbers join once measured.
// Bar: shares of input tokens across 13.5M GitHub Copilot agent sessions, June 2026 (Liu et al., "Agentic
// Coding in the Wild", arxiv.org/abs/2608.00101): history 48%, tool results 28%, system prompt 14%, repository
// instructions and other 10%; median input:output over 275:1. Compression on Claude Code, total billed cost:
// RTK -2.7%, Headroom +48.4% (Weinberger & Hozez, "Token Reduction Is Not Cost Reduction", arxiv.org/abs/2607.12161).
// Read:written ~100:1 (Manus, manus.im/en/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus);
// 18 models all decline with length (Chroma, research.trychroma.com/context-rot); 11 of 13 below half
// their short-context score at 32k (NoLiMa, ICML 2025, arxiv.org/abs/2502.05167); sub-agents return 1-2k tokens
// (anthropic.com/engineering/effective-context-engineering-for-ai-agents). Band: HumanLayer's 40-60% of a
// 200k window and Huntley's ~170k usable (humanlayer.dev/blog/advanced-context-engineering). Claude Code compacts
// native-1M models at about 967K by default (code.claude.com/docs/en/model-config). No JetBrains observation-masking
// figure: bkit can't hide old tool output on any host (docs/decisions.jsonl 663-observation-masking-not-possible).
// The curve is an illustration, unlabelled on the turn axis: both lines replay the per-turn context growth
// of one bkit-build-plan-execute agent (#650, Claude Code subagent transcript, usage deduped by message id).
// "Today" compacts only near REREAD_FULL (a repo without bkit's autoCompactWindow); bkit hands over to a
// fresh agent whenever the next turn would pass REREAD_CAP.
const REREAD_CURVE = `
17,22,34,43,65,88,92,93,95,99,108,115,122,127,129,134,137,142,144,152,155,159,163,167,169,170,173,179,185,188,192,196,199,205,208,210,219,232,233,236,
236,238,239,243,245,249,251,252,253,253,256,264,32,34,49,53,64,68,72,73,76,80,83,84,88,92,97,100,103,108,110,116,118,122,135,140,148,157,159,159,
172,177,181,190,199,199,201,205,212,213,214,221,222,227,230,231,233,236,237,239,242,243,244,249,250,252,253,265,28,35,43,46,51,62,66,69,75,78,80,84,
87,90,92,97,99,103,107,118,120,129,133,136,141,146,153,155,158,161,163,165,167,169,171,175,177,181,188,190,191,193,196,199,201,203,203,204,210,216,219,227,
231,234,237,241,244,245,250,253,254,255,256,258,259,265,30,37,37,38,41,42,44,44,45,45,48,53,54,56,57,68,78,82,83,88,94,98,100,107,111,115,
119,121,128,135,137,143,144,151,153,155,157,158,163,164,167,168,168,169,171,173,175,177,178,179,181,185,187,190,194,196,197,198,201,202,204,205,208,209,210,213,
215,217,218,219,221,223,225,226,227,228,230,232,239,239,245,248,249,250,250,251,256,259,259,260,262,265,266,31,33,45,51,55,58,60,62,64,65,70,73,75,
76,77,78,80,81,84,86,87,87,90,92,93,96,102,109,112,113,115,116,117,120,122,125,126,127,129,130,131,135,137,141,143,144,145,146,147,149,150,152,155,
158,159,160,162,164,164,166,167,168,170,173,174,175,177,177,180,180,181,182,184,185,188,189,190,191,193,199,200,200,202,205,208,209,211,213,215,216,217,219,220,
224,225,228,230,231,232,233,234,235,237,237,239,239,240,241,242,242,243,244,245,245,246,246,247,248,250,250,251,252,253,253,254,255,256,257,258,258,259,260,260
`
  .split(",")
  .map(Number);
const REREAD_CAP = 160,
  REREAD_START = 22,
  REREAD_FULL = 1000,
  REREAD_AFTER = 30,
  REREAD_BAND = [80, 170];
// Replays the growth: start at `start`, and when the next turn would pass `cap`, drop to `reset`.
function rereadRun(start, cap, reset) {
  let cur = start;
  const line = [cur];
  for (let i = 1; i < REREAD_CURVE.length; i++) {
    const grow = Math.max(0, REREAD_CURVE[i] - REREAD_CURVE[i - 1]);
    cur = cur + grow > cap ? reset : cur + grow;
    line.push(cur);
  }
  return line;
}
function reread(t) {
  const W = 1200,
    X0 = 60,
    BW = W - 2 * X0,
    BY = 340,
    BH = 56;
  const dark = t.bg === THEMES.dark.bg;
  const grey = dark ? "#484f58" : "#afb8c1";
  const now = rereadRun(17, REREAD_FULL, REREAD_AFTER),
    line = rereadRun(REREAD_START, REREAD_CAP, REREAD_START);

  let b = "";
  b += text(X0, 64, "TOKEN USE", { size: 14, weight: 700, fill: t.plan, ls: 2.4 });
  b += text(X0 - 2, 128, "Compression shrinks the output.", {
    size: 56,
    weight: 800,
    fill: t.muted,
    ls: -1.5,
  });
  b += text(X0 - 2, 190, "bkit stops the re-reading.", {
    size: 56,
    weight: 800,
    fill: t.text,
    ls: -1.5,
  });
  b += text(
    X0,
    234,
    "What a coding agent reads on each request, across 13.5M GitHub Copilot sessions.",
    { size: 19, fill: t.muted },
  );
  b += text(X0, 292, "72%: re-reading, on every request", { size: 20, weight: 700, fill: t.text });
  b += text(
    X0,
    318,
    "the conversation so far, the system prompt and instructions: what bkit cuts",
    {
      size: 15,
      fill: t.muted,
    },
  );
  b += text(W - X0, 292, "28%: tool output", {
    size: 20,
    weight: 700,
    fill: t.text,
    anchor: "end",
  });
  b += text(W - X0, 318, "all a compressor can touch", { size: 15, fill: t.muted, anchor: "end" });
  // Shares of input tokens (Liu et al., GitHub Copilot).
  const seg = [
    [48, t.plan, "Conversation so far 48%", t.gateInk],
    [14, t.plan, "System 14%", t.gateInk],
    [10, t.plan, "Other 10%", t.gateInk],
    [28, grey, "Tool output 28%", t.text],
  ];
  let x = X0;
  b += `<clipPath id="reread-bar"><rect x="${X0}" y="${BY}" width="${BW}" height="${BH}" rx="8"/></clipPath><g clip-path="url(#reread-bar)">`;
  const labels = [];
  seg.forEach(([pct, fill, label, ink], i) => {
    const w = (BW * pct) / 100,
      l = x + (i ? 1.5 : 0),
      r = x + w - (i < seg.length - 1 ? 1.5 : 0);
    b += `<rect x="${l.toFixed(1)}" y="${BY}" width="${(r - l).toFixed(1)}" height="${BH}" fill="${fill}"/>`;
    labels.push(text(l + 14, BY + 34, label, { size: 15, weight: 700, fill: ink }));
    x += w;
  });
  b += "</g>" + labels.join("");
  const tx = X0 + BW - 1;
  b += `<line x1="${tx}" y1="${BY + BH + 2}" x2="${tx}" y2="${BY + BH + 26}" stroke="${t.muted}"/>`;
  b += `<text x="${tx - 8}" y="${BY + BH + 24}" font-family="${SANS}" font-size="16" fill="${t.muted}" text-anchor="end">Best published compression result on Claude Code: <tspan font-weight="800" fill="${t.text}">2.7%</tspan> off the whole bill. Another tool added 48%.</text>`;
  b += text(
    X0,
    BY + BH + 60,
    "The model's own writing: about 1 token for every 100–275 it reads, too thin to show.",
    { size: 16, fill: t.muted },
  );
  b += text(
    X0,
    BY + BH + 86,
    "Sources: Liu et al., GitHub Copilot at production scale (2026); Weinberger & Hozez, 2,848 Claude Code runs (2026); Manus (2025).",
    { size: 14, fill: t.muted },
  );

  // The mechanism: an agent's cost is the area under its context line.
  const PY = 570;
  b += `<line x1="${X0}" y1="${PY - 50}" x2="${W - X0}" y2="${PY - 50}" stroke="${t.border}"/>`;
  b += text(X0, PY, "An agent's cost is the area under its context line.", {
    size: 28,
    weight: 800,
    fill: t.text,
    ls: -0.5,
  });
  b += text(
    X0,
    PY + 34,
    "Each request re-sends the whole conversation. A token costs the same at 900k as at 9k, but a turn at 900k sends 100× as many.",
    { size: 17, fill: t.muted },
  );
  const CX0 = X0 + 56,
    CX1 = W - X0,
    CY0 = PY + 80,
    CY1 = PY + 400,
    YMAX = 1050;
  const n = REREAD_CURVE.length;
  const px = (i) => CX0 + ((CX1 - CX0) * i) / (n - 1);
  const py = (k) => CY1 - ((CY1 - CY0) * k) / YMAX;
  [0, 250, 500, 750, 1000].forEach((k) => {
    b += `<line x1="${CX0}" y1="${py(k)}" x2="${CX1}" y2="${py(k)}" stroke="${t.border}"/>`;
    b += text(CX0 - 10, py(k) + 5, k ? (k < 1000 ? `${k}k` : "1M") : "0", {
      size: 14,
      fill: t.muted,
      anchor: "end",
    });
  });
  b += text(CX1, CY1 + 26, "turns →", { size: 14, fill: t.muted, anchor: "end" });
  b += text(CX0 - 10, CY0 - 14, "context, tokens", { size: 14, fill: t.muted });
  b += text(CX0, CY1 + 26, "Illustration: the same work, drawn both ways.", {
    size: 14,
    fill: t.muted,
  });
  const area = (vals) =>
    `M${px(0)} ${CY1} ` +
    vals.map((v, i) => `L${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ") +
    ` L${px(n - 1)} ${CY1} Z`;
  const path = (vals) =>
    vals.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  const [bandLo, bandHi] = REREAD_BAND;
  b += `<rect x="${CX0}" y="${py(bandHi).toFixed(1)}" width="${CX1 - CX0}" height="${(py(bandLo) - py(bandHi)).toFixed(1)}" fill="${t.plan}" fill-opacity="0.14"/>`;
  b += `<path d="${area(now)}" fill="${grey}" fill-opacity="0.45"/>`;
  b += `<path d="${path(now)}" fill="none" stroke="${t.muted}" stroke-width="1.5"/>`;
  b += `<path d="${area(line)}" fill="${t.plan}" fill-opacity="0.45"/>`;
  b += `<path d="${path(line)}" fill="none" stroke="${t.plan}" stroke-width="2"/>`;
  now.forEach((v, i) => {
    if (i && v < now[i - 1] - 100)
      b += `<circle cx="${px(i - 1).toFixed(1)}" cy="${py(now[i - 1]).toFixed(1)}" r="5" fill="${t.muted}"/>`;
  });
  const legend = [
    [grey, 1, "Today: one agent until about 967k, where Claude Code summarises it (●)"],
    [t.plan, 0.25, `Handover band, ${bandLo}–${bandHi}k: where practitioners say to start fresh`],
  ];
  legend.forEach(([fill, op, s], i) => {
    const ly = CY0 + 16 + i * 28;
    b += `<rect x="${CX0 + 20}" y="${ly - 12}" width="14" height="14" rx="3" fill="${fill}" fill-opacity="${op}"/>`;
    b += text(CX0 + 44, ly, s, { size: 15, fill: t.text });
  });

  // Published findings, one figure each.
  const SY = CY1 + 84;
  b += text(X0, SY, "What published work finds", { size: 17, weight: 700, fill: t.text });
  const facts = [
    [
      "11 of 13",
      "models score under half their",
      "short-context result by 32k tokens",
      "NoLiMa, ICML 2025",
    ],
    [
      "40–60%",
      "is as full as a context should get",
      "before you start a fresh one",
      "HumanLayer, 2025",
    ],
    [
      "1–2k tokens",
      "is what a sub-agent hands back",
      "from tens of thousands it read",
      "Anthropic, 2025",
    ],
  ];
  const FW = BW / 3;
  facts.forEach(([big, l1, l2, src], i) => {
    const fx = X0 + i * FW;
    b += text(fx, SY + 52, big, { size: 40, weight: 800, fill: t.plan, ls: -1 });
    b += text(fx, SY + 80, l1, { size: 15, fill: t.text });
    b += text(fx, SY + 100, l2, { size: 15, fill: t.text });
    b += text(fx, SY + 122, src, { size: 13, fill: t.muted });
  });
  b += text(
    X0,
    SY + 160,
    "All 18 models Chroma tested (2025) got worse as their context grew. 967k: Claude Code's default compaction point on 1M models.",
    { size: 14, fill: t.muted },
  );
  b += text(
    X0,
    SY + 180,
    "Measure your own runs: bkit records the tokens each agent read in .bkit/stats.jsonl, and bkit stats writes a report to .bkit/stats.md.",
    { size: 14, fill: t.muted },
  );

  // How bkit gets there is the engine image, in the README's "Code keeps every run on track".
  const H = SY + 192;
  return svg(
    W,
    footH(H),
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(H) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>` +
      b +
      footer(t, W, H),
    `Compression shrinks the output; bkit stops the re-reading. What a coding agent reads on each request, across 13.5 million GitHub Copilot sessions: 72 percent is re-reading on every request, the conversation so far at 48 percent, the system prompt at 14 percent and instructions and other context at 10 percent, which is what bkit cuts; 28 percent is tool output, all a compressor can touch. The best published compression result on Claude Code took 2.7 percent off the whole bill, and another tool added 48 percent. The model's own writing is about 1 token for every 100 to 275 it reads. Sources: Liu et al., GitHub Copilot at production scale, 2026; Weinberger and Hozez, 2,848 Claude Code runs, 2026; Manus, 2025. An agent's cost is the area under its context line: each request re-sends the whole conversation, and a token costs the same at 900 thousand as at 9 thousand, but a turn at 900 thousand sends 100 times as many. In an illustration of the same work drawn both ways, today one agent runs until about 967 thousand tokens, where Claude Code summarises it and drops detail; bkit hands over to a fresh agent with a short brief in the ${REREAD_BAND[0]} to ${REREAD_BAND[1]} thousand band, where practitioners say to start fresh. What published work finds: 11 of 13 models score under half their short-context result by 32 thousand tokens (NoLiMa, ICML 2025); a context should get no more than 40 to 60 percent full before you start a fresh one (HumanLayer, 2025); a sub-agent hands back 1 to 2 thousand tokens from tens of thousands it read (Anthropic, 2025); all 18 models Chroma tested got worse as their context grew. Measure your own runs: bkit records the tokens each agent read in .bkit/stats.jsonl, and bkit stats writes a report of your runs to .bkit/stats.md.`,
  );
}

// ---------- Engine and agents ----------
// One /bkit-build run in three rows: fresh agents on top, the bkit commands that brief them and
// check their work in the middle, the repo files the commands read and write at the bottom. Each
// command's line restates its summary in .bkit/core/engine/commands/workflow/.
const ENGINE_COMMANDS = [
  ["context brief", "cuts each group's part", "out of the plan"],
  ["tests red", "proves each new test fails", "before its code exists"],
  ["steps gate", "stops a step missing", "its verdict or files"],
  ["counters route", "counts fix rounds,", "stops at the limit"],
  ["status resume", "where a stopped run", "picks up, on any tool"],
  ["ledgers append", "writes lessons and", "decisions as checked rows"],
  ["workflows summary", "writes the run's verdict,", "reasons and next command"],
];

function engine(t) {
  const W = 1200,
    X0 = 60,
    LX = 250,
    LW = W - X0 - LX;
  const arrow = (x, y1, y2, stroke) => {
    const d = y2 > y1 ? 1 : -1;
    return (
      `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - d * 7}" stroke="${stroke}" stroke-width="2"/>` +
      `<path d="M${x - 6} ${y2 - d * 9} L${x} ${y2} L${x + 6} ${y2 - d * 9} Z" fill="${stroke}"/>`
    );
  };
  let b = "";
  b += text(X0, 64, "THE ENGINE", { size: 14, weight: 700, fill: t.plan, ls: 2.4 });
  b += text(X0 - 2, 128, "Code keeps the run on track.", {
    size: 56,
    weight: 800,
    fill: t.muted,
    ls: -1.5,
  });
  b += text(X0 - 2, 190, "Agents make the calls.", {
    size: 56,
    weight: 800,
    fill: t.text,
    ls: -1.5,
  });
  b += text(
    X0,
    234,
    "One /bkit-build run. Anything with one right answer is a bkit command; the models get only the judgement.",
    { size: 19, fill: t.muted },
  );
  const laneLabel = (y, title, l1, l2, color) => {
    b += text(X0, y, title, { size: 14, weight: 700, fill: color, ls: 2.4 });
    b += text(X0, y + 26, l1, { size: 15, fill: t.text });
    if (l2) b += text(X0, y + 46, l2, { size: 15, fill: t.muted });
  };

  // Agents: each starts on its brief and hands over before the cap.
  const AY = 296,
    AH = 156,
    AW = 196,
    AG = (LW - 4 * AW) / 3;
  laneLabel(AY + 30, "AGENTS", "models, each one fresh", "the judgement calls", t.build);
  const agents = [
    ["Builds group 1", "tasks 1–3", 0.55],
    ["Builds group 2", "tasks 4–6", 0.7],
    ["Builds group 3", "tasks 7–9", 0.45],
    ["Reviews the diff", "bugs and security", 0.35],
  ];
  agents.forEach(([title, sub, used], i) => {
    const x = LX + i * (AW + AG),
      gx = x + 18,
      gy = AY + 76,
      gw = AW - 36;
    b += `<rect x="${x}" y="${AY}" width="${AW}" height="${AH}" rx="12" fill="${t.bg}" stroke="${t.build}" stroke-width="1.5"/>`;
    b += text(gx, AY + 32, title, { size: 17, weight: 700, fill: t.text });
    b += text(gx, AY + 54, sub, { size: 14, fill: t.muted });
    b += `<rect x="${gx}" y="${gy}" width="${gw}" height="14" rx="4" fill="${t.surface}" stroke="${t.border}"/>`;
    b += `<rect x="${gx}" y="${gy}" width="${(gw * used).toFixed(1)}" height="14" rx="4" fill="${t.build}" fill-opacity="0.35"/>`;
    b += `<rect x="${gx}" y="${gy}" width="10" height="14" rx="3" fill="${t.build}"/>`;
    b += text(gx, gy + 32, "starts on a brief of a few KB", { size: 13, fill: t.muted });
    b += text(gx, gy + 50, `hands over before ${REREAD_CAP}k`, { size: 13, fill: t.muted });
  });
  const EY = AY + AH + 64;
  agents.forEach((_, i) => {
    const x = LX + i * (AW + AG) + AW / 2;
    b += arrow(x - 24, EY - 4, AY + AH + 4, t.plan);
    b += arrow(x + 24, AY + AH + 4, EY - 4, t.build);
  });
  b += text(LX + AW / 2 - 34, AY + AH + 38, "brief", {
    size: 13,
    weight: 700,
    fill: t.plan,
    anchor: "end",
  });
  b += text(LX + AW / 2 + 34, AY + AH + 38, "log, verdict", {
    size: 13,
    weight: 700,
    fill: t.build,
  });

  // Engine: the commands, four on the first row, three on the second.
  const EH = 196;
  laneLabel(EY + 30, "ENGINE", "bkit commands, plain code", "same answer every time", t.plan);
  b += `<rect x="${LX}" y="${EY}" width="${LW}" height="${EH}" rx="12" fill="${t.surface}" stroke="${t.plan}" stroke-width="1.5"/>`;
  const CW = (LW - 40) / 4;
  ENGINE_COMMANDS.forEach(([cmd, l1, l2], k) => {
    const cx = LX + 20 + (k % 4) * CW,
      cy = EY + 40 + Math.floor(k / 4) * 84;
    b += text(cx, cy, cmd, { size: 15, weight: 700, fill: t.plan, font: MONO });
    b += text(cx, cy + 22, l1, { size: 14, fill: t.text });
    b += text(cx, cy + 40, l2, { size: 14, fill: t.text });
  });
  b += text(LX + LW - 20, EY + EH - 22, "TypeScript, covered by 5,800+ tests", {
    size: 13,
    fill: t.muted,
    anchor: "end",
  });
  const RY = EY + EH + 64;
  [0.25, 0.5, 0.75].forEach((f) => {
    const x = LX + LW * f;
    b += arrow(x - 10, EY + EH + 4, RY - 4, t.muted);
    b += arrow(x + 10, RY - 4, EY + EH + 4, t.muted);
  });

  // Repo: the files the commands read and write.
  const RH = 64,
    FG = 14;
  laneLabel(RY + 22, "YOUR REPO", "plain files", "", t.muted);
  const files = ["the whole plan", "run state", "step logs", "4 ledgers", "run stats"];
  const FW = (LW - FG * (files.length - 1)) / files.length;
  files.forEach((f, i) => {
    const x = LX + i * (FW + FG);
    b += `<rect x="${x}" y="${RY}" width="${FW}" height="${RH}" rx="10" fill="${t.bg}" stroke="${t.border}"/>`;
    b += text(x + FW / 2, RY + 39, f, { size: 15, weight: 600, fill: t.text, anchor: "middle" });
  });
  b += text(
    LX,
    RY + RH + 30,
    "Build agents never get the whole plan: the engine reads it and hands each one only its part.",
    { size: 15, fill: t.muted },
  );

  // What the split gets you.
  const GY = RY + RH + 116;
  b += `<line x1="${X0}" y1="${GY - 50}" x2="${W - X0}" y2="${GY - 50}" stroke="${t.border}"/>`;
  b += text(X0, GY, "What the split gets you", { size: 28, weight: 800, fill: t.text, ls: -0.5 });
  const ways = [
    [
      "Steps that can't be faked.",
      ["A step missing its verdict or files", "can't finish, whatever the agent says."],
    ],
    [
      "The same answer every time.",
      ["Code answers alike on every tool:", "Claude Code, Cursor, Codex and more."],
    ],
    [
      "Fewer tokens, as a bonus.",
      ["No model turn spent on bookkeeping,", "and no agent carries a long history."],
    ],
  ];
  const WW = (W - 2 * X0 - 2 * 32) / 3;
  ways.forEach(([lead, rest], i) => {
    const cx = X0 + i * (WW + 32),
      cy = GY + 56;
    b += `<circle cx="${cx + 11}" cy="${cy - 6}" r="11" fill="${t.plan}"/>`;
    b += text(cx + 11, cy, String(i + 1), {
      size: 14,
      weight: 800,
      fill: t.gateInk,
      anchor: "middle",
    });
    b += text(cx + 32, cy, lead, { size: 18, weight: 700, fill: t.text });
    rest.forEach((s, j) => {
      b += text(cx + 32, cy + 26 + j * 22, s, { size: 15, fill: t.muted });
    });
  });
  const H = GY + 56 + 48 + 12;
  return svg(
    W,
    footH(H),
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(H) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>` +
      b +
      footer(t, W, H),
    `Code keeps the run on track; agents make the calls. One /bkit-build run in three rows. Agents: models, each one fresh, making the judgement calls. Three each build one group of tasks and one reviews the diff for bugs and security; each starts on a brief of a few KB and hands over before ${REREAD_CAP} thousand tokens, takes its brief from the engine and hands back a log and a verdict. Engine: bkit commands, plain code with the same answer every time, covered by 5,800+ tests. ${ENGINE_COMMANDS.map(([cmd, l1, l2]) => `${cmd}: ${l1} ${l2}`).join("; ")}. Your repo: the plain files the engine reads and writes: the whole plan, run state, step logs, 4 ledgers and run stats. Build agents never get the whole plan: the engine reads it and hands each one only its part. What the split gets you: steps that can't be faked, because a step missing its verdict or files can't finish, whatever the agent says; the same answer every time, on every tool; and, as a bonus, fewer tokens, because no model turn is spent on bookkeeping and no agent carries a long history.`,
  );
}

// ---------- What's in the box ----------
function features(t) {
  const W = 1000;
  const rows = [
    {
      name: "Design",
      key: "design",
      cmd: "/bkit-design",
      tiles: [
        ["Three rival designs", "Three agents propose,", "two critique — one design"],
        ["Probe code first", "Throwaway code settles", "the risky unknowns"],
        ["Reads your history", "Related issues and past", "decisions read first"],
        ["Built to run", "Failure modes and", "monitoring reviewed"],
      ],
    },
    {
      name: "Plan",
      key: "plan",
      cmd: "/bkit-plan",
      tiles: [
        ["One review round", "Plan, regressions and", "scope checked in parallel"],
        ["Self-contained tasks", "Each names the code it", "touches and its test"],
        ["Learns from the past", "Past bugs and postponed", "work go to reviewers"],
        [">30 audits", "Findings feed straight", "into the plan"],
      ],
    },
    {
      name: "Build",
      key: "build",
      cmd: "/bkit-build",
      tiles: [
        ["Test first, verified", "Each test fails before", "its code, then passes"],
        ["Hunts bugs + holes", "Edge cases, auth holes,", "broken error paths"],
        ["Plan still current?", "Re-checked against", "today's code first"],
        ["Skills on demand", "Installed for the feature,", "removed when it ships"],
      ],
    },
    {
      name: "Debug",
      key: "debug",
      cmd: "/bkit-debug",
      tiles: [
        ["Outside evidence", "CI logs, Sentry, Vercel,", "Supabase, Stripe, web"],
        ["Root cause first", "Diagnoses before it", "changes anything"],
        ["Hard-bug mode", "Instruments runtime-only", "bugs, then cleans up"],
        ["Knows when to stop", "Writes a clear handover", "instead of guessing"],
      ],
    },
    {
      name: "Ship",
      key: "ship",
      cmd: "/bkit-ship",
      tiles: [
        ["Honest CI", "Every planned test lane", "ran, or no merge"],
        ["Nothing dropped", "Silent TODOs, skipped", "tests block the merge"],
        ["Docs + memory", "Docs refreshed, lessons", "saved for next time"],
        ["Never touches main", "Merges to dev; production", "stays your call"],
      ],
    },
    {
      name: "Every phase",
      key: "gate",
      cmd: "",
      tiles: [
        ["Any AI tool", "Claude Code, Cursor, Codex,", "Antigravity or opencode"],
        ["Best model per job", "Each agent pinned to the", "right model, on every tool"],
        ["Independent review", "Reviewers never see", "each other's verdicts"],
        ["Laptop to cloud", "Start at your desk, carry", "on from your phone or CI"],
      ],
    },
  ];
  const M = 24,
    G = 12,
    TW = (W - 2 * M - 3 * G) / 4,
    TH = 112,
    RH = 150;
  const H = M + (rows.length - 1) * RH + 26 + TH; // bottom of the last row of cards
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(H) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
  rows.forEach(({ name, key, cmd, tiles }, r) => {
    const ry = M + r * RH;
    const col = t[key];
    b += text(M + 4, ry + 14, name.toUpperCase(), { size: 13, weight: 700, fill: col, ls: 1.4 });
    b += text(M + 4 + name.length * 9.5 + 16, ry + 14, cmd, {
      size: 13,
      weight: 600,
      fill: t.muted,
      font: MONO,
    });
    tiles.forEach(([title, l1, l2], i) => {
      const x = M + i * (TW + G),
        y = ry + 26;
      b += `<rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="12" fill="${t.surface}" stroke="${t.border}"/>`;
      b += `<circle cx="${x + 22}" cy="${y + 30}" r="6" fill="${col}"/>`;
      b += text(x + 36, y + 36, title, { size: 17, weight: 700, fill: t.text });
      b += text(x + 20, y + 68, l1, { size: 15, fill: t.muted });
      b += text(x + 20, y + 90, l2, { size: 15, fill: t.muted });
    });
  });
  return svg(
    W,
    footH(H),
    b + footer(t, W, H, M),
    "What ships with bkit, one coloured row per phase. Design: three rival designs, probe code for the risky unknowns, reads your history, reviewed for failure modes. Plan: one review round, self-contained tasks, learns from past bugs and postponed work, more than 30 audits. Build: test first and verified, hunts bugs and security holes, checks the plan is still current, skills on demand. Debug: outside evidence from CI and your platforms, root cause first, hard-bug mode, knows when to stop. Ship: honest CI, nothing quietly dropped, docs and memory, never touches main. Every phase: any AI tool, best model per job, independent review, laptop to cloud.",
  );
}

// ---------- Models and effort ----------
// Claude model x effort matrix for every bkit agent and orchestrator. Pins, efforts and counts come
// from the § Models and § Orchestrators tables in .bkit/core/.bkit/prompts.md, the Fable pin from
// its "Fable, by hand" row; no prices or dates, so the image stays true until the pins move.
const EFFORTS = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["xhigh", "Extra"],
  ["max", "Max"],
];
const FAMILIES = {
  fable: { role: "by hand, never pinned", empty: {} },
  opus: { role: "judgement", empty: { low: "use Haiku", xhigh: "unmeasured", max: "never" } },
  sonnet: { role: "execution", empty: { low: "use Haiku", xhigh: "use Opus", max: "use Opus" } },
  haiku: { role: "summaries", empty: {} },
};
const FABLE_USES = {
  high: ["Refine an idea", "before /bkit-design"],
  xhigh: ["A bug /bkit-debug", "is stuck on"],
};

function modelMatrix() {
  const src = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      ".bkit",
      "core",
      ".bkit",
      "prompts.md",
    ),
    "utf8",
  );
  const slice = (from, to) => src.slice(src.indexOf(from), src.indexOf(to, src.indexOf(from)));
  const rows = (s, first) =>
    s
      .split("\n")
      .filter((l) => l.startsWith(`| \`${first}`))
      .map((l) =>
        l
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim().replace(/^`|`$/g, "")),
      );
  const family = (pin) => {
    const f = pin.match(/^claude-([a-z]+)-/)?.[1];
    if (!FAMILIES[f]) throw new Error(`no matrix row for Claude model ${pin}`);
    return f;
  };
  const cells = {};
  const cell = (pin, effort) => {
    if (!EFFORTS.some(([e]) => e === effort))
      throw new Error(`no matrix column for effort ${effort}`);
    const k = `${family(pin)}:${effort}`;
    return (cells[k] ??= { agents: [], orchestrators: [] });
  };
  const pins = {};
  for (const [name, pin, , , , , , , , effort] of rows(
    slice("\n## Models", "\n### Live model-ID verification"),
    "bkit-",
  )) {
    pins[family(pin)] = pin;
    cell(pin, effort).agents.push(
      name.match(/^bkit-(design|plan|build|debug|ship)-/)?.[1] ?? "other",
    );
  }
  const launch = {};
  for (const [cmd, pin] of rows(slice("\n### Orchestrators", "\n## Design Phase"), "/")) {
    pins[family(pin)] = pin;
    cell(pin, "medium").orchestrators.push(`/bkit-${cmd.slice(1)}`);
    (launch[pin] ??= []).push(`/bkit-${cmd.slice(1)}`);
  }
  const fable = src.match(/Fable, by hand \| `claude --model (claude-fable-[\w-]+)`/)?.[1];
  if (!fable) throw new Error("no `Fable, by hand` row in § Orchestrators");
  pins.fable = fable;
  const total = Object.values(cells).reduce((n, c) => n + c.agents.length, 0);
  return { cells, pins, launch, total };
}

function models(t) {
  const { cells, pins, launch, total } = modelMatrix();
  const orchestrators = Object.values(launch).flat().length;
  const W = 1200,
    X0 = 60,
    LW = 200,
    CW = (W - 2 * X0 - LW) / EFFORTS.length,
    HY = 264,
    RY = 336,
    RH = 128;
  const name = (pin) =>
    pin
      .replace(/^claude-/, "")
      .replace(
        /^([a-z]+)-(\d+)-(\d+)$/,
        (_, f, a, b) => `${f[0].toUpperCase()}${f.slice(1)} ${a}.${b}`,
      );
  const col = (p) => (p === "other" ? t.muted : t[p]);
  const order = Object.keys(FAMILIES).filter((f) => pins[f]);
  const top = RY + order.length * RH + 62,
    PH = 150,
    H = top + PH;
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${footH(H) - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
  b += text(X0, 64, "CLAUDE CODE  ·  MODEL AND EFFORT", {
    size: 14,
    weight: 700,
    fill: t.plan,
    ls: 2.4,
  });
  b += text(X0 - 2, 128, "Change the model,", { size: 56, weight: 800, fill: t.text, ls: -1.5 });
  b += text(X0 - 2, 190, "not the effort.", { size: 56, weight: 800, fill: t.muted, ls: -1.5 });
  b += text(
    X0,
    234,
    `The Claude model and effort behind each of bkit's ${total} agents and ${orchestrators} orchestrators.`,
    { size: 18, fill: t.muted },
  );

  // Column heads: slider label over API value; Medium carries the 5.5 default tag.
  EFFORTS.forEach(([api, label], i) => {
    const x = X0 + LW + i * CW + 14;
    b += text(x, HY + 30, label, { size: 20, weight: 700, fill: t.text });
    b += text(x, HY + 52, api, { size: 14, fill: t.muted, font: MONO });
    if (api === "medium")
      b +=
        `<rect x="${x + 82}" y="${HY + 13}" width="68" height="20" rx="4" fill="${t.plan}"/>` +
        text(x + 116, HY + 28, "DEFAULT", {
          size: 11,
          weight: 700,
          fill: t.bg,
          anchor: "middle",
          ls: 1,
        });
  });
  b += `<line x1="${X0}" y1="${RY - 6}" x2="${W - X0}" y2="${RY - 6}" stroke="${t.text}" stroke-width="1.5"/>`;

  order.forEach((f, r) => {
    const y = RY + r * RH;
    b += text(X0, y + 42, name(pins[f]), { size: 24, weight: 700, fill: t.text });
    b += text(X0, y + 66, pins[f], { size: 13, fill: t.muted, font: MONO });
    b += text(X0, y + 90, FAMILIES[f].role, { size: 15, fill: t.muted });
    EFFORTS.forEach(([api], i) => {
      const x = X0 + LW + i * CW,
        c = cells[`${f}:${api}`],
        uses = f === "fable" && FABLE_USES[api];
      if (!c && !uses) {
        const note = FAMILIES[f].empty[api];
        if (note) b += text(x + 14, y + 42, note, { size: 14, fill: t.muted });
        return;
      }
      b += `<rect x="${x + 4}" y="${y + 8}" width="${CW - 8}" height="${RH - 16}" rx="10" fill="${t.surface}" stroke="${t.border}"/>`;
      let ly = y + 36;
      if (uses) {
        b += text(x + 16, ly, "You, by hand:", { size: 13, weight: 700, fill: t.design });
        uses.forEach(
          (u, k) => (b += text(x + 16, ly + 22 + k * 20, u, { size: 14, fill: t.text })),
        );
        return;
      }
      for (const o of c.orchestrators) {
        b += text(x + 16, ly, o, { size: 13, weight: 600, fill: t[o.slice(6)], font: MONO });
        ly += 16;
      }
      if (c.agents.length) {
        if (c.orchestrators.length) ly += 4;
        const n = c.agents.length;
        b += text(x + 16, ly, `${n} agent${n === 1 ? "" : "s"}`, {
          size: 14,
          weight: 700,
          fill: t.text,
        });
        const sorted = ["design", "plan", "build", "debug", "ship", "other"].flatMap((p) =>
          c.agents.filter((a) => a === p),
        );
        sorted.forEach((p, k) => {
          const cx = x + 21 + (k % 11) * 13,
            cy = ly + 16 + Math.floor(k / 11) * 13;
          b += `<circle cx="${cx}" cy="${cy}" r="5" fill="${col(p)}"/>`;
        });
      }
    });
    b += `<line x1="${X0}" y1="${y + RH}" x2="${W - X0}" y2="${y + RH}" stroke="${t.border}"/>`;
  });

  // Dot legend: one dot per agent, coloured by the phase that runs it.
  let lx = X0;
  const ly = RY + order.length * RH + 30;
  b += text(lx, ly, "One dot per agent:", { size: 14, fill: t.muted });
  lx += 136;
  for (const [p, label, w] of [
    ["design", "design", 46],
    ["plan", "plan", 30],
    ["build", "build", 36],
    ["debug", "debug", 42],
    ["ship", "ship", 30],
    ["other", "audits + upkeep", 104],
  ]) {
    b += `<circle cx="${lx + 5}" cy="${ly - 5}" r="5" fill="${col(p)}"/>`;
    b += text(lx + 16, ly, label, { size: 14, fill: t.muted });
    lx += 16 + w + 22;
  }

  const panels = [
    [
      "Pick the model at launch",
      Object.entries(launch).flatMap(([pin, cmds]) => [
        [`claude --model ${pin}`, MONO, t.text],
        [`→ ${cmds.join("  ")}`, MONO, t.muted],
      ]),
    ],
    [
      "Leave the effort alone",
      [
        ["Medium is the default on the 5.5 models.", SANS, t.text],
        ["Every agent sets its own effort, whatever", SANS, t.text],
        ["your session runs. Never set", SANS, t.text],
        ["CLAUDE_CODE_EFFORT_LEVEL", MONO, t.debug],
      ],
    ],
    [
      "Past High, move up a model",
      [
        ["Extra costs more than the next model up", SANS, t.text],
        ["at High, and that model is stronger.", SANS, t.text],
        ["Max: one hard problem, never routine.", SANS, t.text],
        ["Ultracode: a setting, not a level.", SANS, t.text],
      ],
    ],
  ];
  const PW = (W - 2 * X0 - 2 * 24) / 3;
  panels.forEach(([title, lines], i) => {
    const x = X0 + i * (PW + 24);
    b += `<line x1="${x}" y1="${top}" x2="${x + PW}" y2="${top}" stroke="${t.text}" stroke-width="1.5"/>`;
    b += text(x, top + 32, title, { size: 19, weight: 700, fill: t.text });
    lines.forEach(([s, font, fill], k) => {
      b += text(x, top + 62 + k * 23, s, { size: font === MONO ? 14 : 15, fill, font });
    });
  });

  const cellsAlt = order
    .flatMap((f) =>
      EFFORTS.map(([api, label]) => {
        const c = cells[`${f}:${api}`];
        if (!c) return null;
        const who = [...c.orchestrators, c.agents.length ? `${c.agents.length} agents` : ""].filter(
          Boolean,
        );
        return `${name(pins[f])} at ${label}: ${who.join(", ")}`;
      }),
    )
    .filter(Boolean)
    .join("; ");
  return svg(
    W,
    footH(H),
    b + footer(t, W, H),
    `Change the model, not the effort. The Claude model and effort behind each of bkit's ${total} agents and ${orchestrators} orchestrators. ${cellsAlt}. ${name(pins.fable)} is never pinned: use it by hand to refine an idea before /bkit-design, and at Extra for a bug /bkit-debug is stuck on. Pick the model at launch: ${Object.entries(
      launch,
    )
      .map(([pin, cmds]) => `${pin} for ${cmds.join(", ")}`)
      .join(
        "; ",
      )}. Leave the effort alone: medium is the default on the 5.5 models, every agent sets its own, and never set CLAUDE_CODE_EFFORT_LEVEL. Past High, move up a model: Extra costs more than the next model up at High. Max is for one hard problem, never routine; ultracode is a setting, not a level.`,
  );
}

// Write every image as SVG, then rasterise the same markup to a matching PNG, so the two never
// drift apart.
const browser = findBrowser();
if (!browser)
  console.error(
    "[bkit] no Chrome/Chromium found — wrote SVGs only. Set CHROME_BIN to a browser to emit PNGs.",
  );

const images = [];
for (const [name, t] of Object.entries(THEMES)) {
  images.push([`bkit-hero-${name}`, hero(t)]);
  images.push([`bkit-pipeline-${name}`, pipeline(t)]);
  images.push([`bkit-features-${name}`, features(t)]);
  images.push([`bkit-fences-${name}`, fences(t)]);
  images.push([`bkit-context-${name}`, context(t)]);
  images.push([`bkit-ci-${name}`, ci(t)]);
  images.push([`bkit-fences-details-${name}`, fenceDetails(t)]);
  images.push([`bkit-audits-${name}`, audits(t)]);
  images.push([`bkit-tokens-${name}`, tokens(t)]);
  images.push([`bkit-reread-${name}`, reread(t)]);
  images.push([`bkit-engine-${name}`, engine(t)]);
  images.push([`bkit-models-${name}`, models(t)]);
}
// One social image: link previews have no light/dark switch, and dark reads on both.
images.push(["bkit-social", social(THEMES.dark)]);

for (const [name, markup] of images) {
  const svgPath = join(OUT, `${name}.svg`);
  writeFileSync(svgPath, markup);
  if (!browser) continue;
  const [w, h] = dims(markup);
  toPng(browser, svgPath, join(OUT, `${name}.png`), w, h);
}
console.log(browser ? "ok (svg + png)" : "ok (svg only)");
