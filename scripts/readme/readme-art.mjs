// Renders the root README images (hero, features grid, pipeline, fences, context map), light + dark,
// plus the repo's social preview card, into .github/assets/. Edit the copy below, then: node scripts/readme/readme-art.mjs
// Text is not auto-wrapped: keep tile lines short and eyeball the output at ~880px.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT =
  process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".github", "assets");
mkdirSync(OUT, { recursive: true });

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
// GitHub repo Settings → Social preview takes PNG/JPG only. To export:
// "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
//   --window-size=1280,640 --hide-scrollbars --screenshot=.github/assets/bkit-social.png .github/assets/bkit-social.svg
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
  for (const h of ["Claude Code", "Cursor", "Codex", "opencode"]) {
    const w = h.length * 11.4 + 34;
    b += `<rect x="${hx}" y="546" width="${w}" height="40" rx="20" fill="${t.surface}" stroke="${t.border}"/>`;
    b += text(hx + w / 2, 573, h, { size: 19, fill: t.text, anchor: "middle", weight: 600 });
    hx += w + 12;
  }
  return svg(
    W,
    H,
    b,
    "bkit — from vibe coding to production code. A senior engineering team's process, ready-made and battle-tested. Works with Claude Code, Cursor, Codex and opencode.",
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
  for (const h of ["Claude Code", "Cursor", "Codex", "opencode"]) {
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
    "The bkit pipeline: design, plan, build and ship, with debug fixing failed tests. Each dot is one of 40 AI agents: 10 in design, 10 in plan, 11 in build, 5 in debug and 4 in ship. It waits for your sign-off after design, after plan and before merge, merges into dev, and leaves production to you. Runs on Claude Code, Cursor, Codex and opencode.",
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
        ["Writes + verifies", "A task is ticked only", "when it really exists"],
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
        ["Any AI tool", "Claude Code, Cursor, Codex", "or opencode — switch freely"],
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
    "What ships with bkit, one coloured row per phase. Design: three rival designs, probe code for the risky unknowns, reads your history, reviewed for failure modes. Plan: five reviewers, big work split up, learns from past bugs and postponed work, more than 30 audits. Build: writes and verifies, hunts bugs and security holes, checks the plan is still current, skills on demand. Debug: outside evidence from CI and your platforms, root cause first, hard-bug mode, knows when to stop. Ship: honest CI, nothing quietly dropped, docs and memory, never touches main. Every phase: any AI tool, best model per job, independent review, laptop to cloud.",
  );
}

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(join(OUT, `bkit-hero-${name}.svg`), hero(t));
  writeFileSync(join(OUT, `bkit-pipeline-${name}.svg`), pipeline(t));
  writeFileSync(join(OUT, `bkit-features-${name}.svg`), features(t));
  writeFileSync(join(OUT, `bkit-fences-${name}.svg`), fences(t));
  writeFileSync(join(OUT, `bkit-context-${name}.svg`), context(t));
}
// One image: link previews have no light/dark switch, and dark reads on both.
writeFileSync(join(OUT, "bkit-social.svg"), social(THEMES.dark));
console.log("ok");
