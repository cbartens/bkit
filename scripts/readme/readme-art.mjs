// Renders the root README images (hero, features grid, pipeline, fences, context map, CI, fence details, audit map), light + dark,
// plus the repo's social preview card, into .github/assets/ as both .svg and .png. Edit the copy
// below, then: node scripts/readme/readme-art.mjs
// Text is not auto-wrapped: keep tile lines short and eyeball the output at ~880px.
import { writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
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
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;

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
    H,
    b,
    "You don't steer AI, you build fences. AI agents start out scattered at design and are funnelled through plan, build, debug and ship into production-grade code. At design and plan, reviewer agents fence the work in; from build onwards, automated checks from the CI template (typecheck, lint, formatting, prose, tests) join them. Work that goes off target is sent back and retried, a failed test goes to debug, which finds the root cause, fixes it and re-runs the tests until they pass, and bkit waits for your sign-off after design, after plan and before merge.",
  );
}

// ---------- Pipeline ----------
function pipeline(t) {
  const W = 1200,
    H = 690;
  let b = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${t.muted}"/></marker></defs>`;
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
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
        [4, "merge, refine, sum up"],
      ],
      out: "→ design to approve",
    },
    {
      p: "plan",
      cmd: "/bkit-plan",
      title: "Plan",
      g: [
        [3, "critique the plan"],
        [2, "check the scope"],
        [5, "write, merge, size up"],
      ],
      out: "→ plan to approve",
    },
    {
      p: "build",
      cmd: "/bkit-build",
      title: "Build",
      g: [
        [4, "write + verify vs plan"],
        [2, "hunt bugs + security"],
        [5, "merge, fix, add tests"],
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
        [2, "update docs + summary"],
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
    H,
    b,
    "The bkit pipeline: design, plan, build and ship, with debug fixing failed tests. Each dot is one of 40 AI agents: 10 in design, 10 in plan, 11 in build, 5 in debug and 4 in ship. It waits for your sign-off after design, after plan and before merge, merges into dev, and leaves production to you. Runs on Claude Code, Cursor, Codex, Antigravity and opencode.",
  );
}

// ---------- CI pipeline (bkit-ci.yml with every building block switched on, and where workflows use it) ----------
// Lane ids are the bkit-tests-* jobs in .bkit/templates/.github/workflows/bkit-ci.yml.
function ci(t) {
  const W = 1200,
    H = 720;
  let b = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${t.muted}"/></marker></defs>`;
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
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
    H,
    b,
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
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;

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
    H,
    b,
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

  // The app's code: one column per layer, one pill per module
  const PH = 13;
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

  // Key and signature
  const LY = cy + 30 + 32,
    FY = LY + 46;
  const H = FY + 32;
  b += `<line x1="40" y1="${LY}" x2="${W - 40}" y2="${LY}" stroke="${t.border}"/>`;
  b += `<circle cx="66" cy="${FY - 6}" r="5" fill="none" stroke="${t.debug}" stroke-width="2"/>`;
  b += `<circle cx="90" cy="${FY - 6}" r="10" fill="${t.debug}" fill-opacity="0.13" stroke="${t.debug}" stroke-width="2"/>`;
  b += text(110, FY, "Problem found, sized by how big", { size: 16, fill: t.text });
  b += `<rect x="400" y="${FY - 12}" width="34" height="${PH}" rx="${PH / 2}" fill="${t.bg}" stroke="${t.border}"/>`;
  b += text(446, FY, "The app's code, simplified", { size: 16, fill: t.text });
  // Signature laid out left to right from a fixed start, so a wider fallback font can't push the
  // wordmark into the dots.
  const SX = 836;
  ["design", "plan", "build", "debug", "ship"].forEach(
    (p, i) => (b += `<circle cx="${SX + i * 14}" cy="${FY - 7}" r="5" fill="${t[p]}"/>`),
  );
  b += text(SX + 72, FY + 1, "bkit", { size: 24, weight: 800, fill: t.text, ls: -0.6 });
  b += text(W - 60, FY, "github.com/cbartens/bkit", { size: 15, fill: t.muted, anchor: "end" });

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
          "GitHub Issues or Linear — progress, status, links",
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
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
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
    H,
    b,
    "What it knows: right context, right step, written back as it learns. In your repo, bkit reads project docs at every step and updates them at ship; reads and writes lessons, decisions, postponed work and known bugs; writes designs and plans that later steps read; reads audit reports at plan and a code map at every step; keeps run state and stats at every step; adds skills at build and removes them at ship. Outside your repo, it reads and updates the GitHub or Linear issue at every step, searches related issues at design, plan and debug, searches the web at design and debug, reads CI runs and test reports at debug and ship, reads runtime platforms such as Sentry, Vercel, Supabase and Stripe at debug, and opens, fixes and merges the pull request.",
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
        ["Five reviewers", "Scope, order, regressions", "and testability checked"],
        ["Big work split", "Oversized plans become", "buildable sub-plans"],
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
  const H = M + rows.length * RH - 12 + M - 14;
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
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
    H,
    b,
    "What ships with bkit, one coloured row per phase. Design: three rival designs, probe code for the risky unknowns, reads your history, reviewed for failure modes. Plan: five reviewers, big work split up, learns from past bugs and postponed work, more than 30 audits. Build: test first and verified, hunts bugs and security holes, checks the plan is still current, skills on demand. Debug: outside evidence from CI and your platforms, root cause first, hard-bug mode, knows when to stop. Ship: honest CI, nothing quietly dropped, docs and memory, never touches main. Every phase: any AI tool, best model per job, independent review, laptop to cloud.",
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
