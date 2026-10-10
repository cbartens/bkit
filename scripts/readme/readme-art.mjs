// Renders the root README images (hero, features grid, pipeline), light + dark,
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
  b += text(66, 277, "A senior engineering team's process.", { size: 21, fill: t.muted });
  b += text(66, 306, "Run by AI agents. Signed off by you.", { size: 21, fill: t.muted });

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
    ["/bkit-ship", "ship", [1, 2], "live"],
  ];
  rows.forEach(([cmd, p, [a, z], status], i) => {
    const y = cy + 82 + i * 42;
    b += text(cx + 22, y, cmd, { size: 17, fill: t[p], font: MONO, weight: 600 });
    b += dots(cx + 170, y - 6, a, t[p], 6, 16);
    b += dots(cx + 170 + a * 16 + 10, y - 6, z, t[p], 6, 16);
    b += text(cx + cw - 22, y, `✓ ${status}`, { size: 15, fill: t.ok, anchor: "end", weight: 600 });
  });
  return svg(
    W,
    H,
    b,
    "bkit — from vibe coding to production code. A senior engineering team's process, run by AI agents, signed off by you.",
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
  b += text(L, 446, "A senior engineering team's process.", { size: 26, fill: t.muted });
  b += text(L, 482, "Run by AI agents. Signed off by you.", { size: 26, fill: t.muted });

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
    ["/bkit-ship", "ship", [1, 2], "live"],
  ];
  rows.forEach(([cmd, p, [a, z], status], i) => {
    const y = cy + 118 + i * 70;
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
    "bkit — from vibe coding to production code. A senior engineering team's process, run by AI agents, signed off by you. Works with Claude Code, Cursor, Codex and opencode.",
  );
}

// ---------- Pipeline ----------
function pipeline(t) {
  const W = 1200,
    H = 650;
  let b = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${t.muted}"/></marker></defs>`;
  b += `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
  const line = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.muted}" stroke-width="2" marker-end="url(#ah)"/>`;
  const cards = [
    {
      p: "design",
      cmd: "/bkit-design",
      title: "Design",
      g: [
        [3, "3 propose designs"],
        [2, "2 critique them"],
      ],
      out: "→ design to approve",
    },
    {
      p: "plan",
      cmd: "/bkit-plan",
      title: "Plan",
      g: [
        [3, "3 critique the plan"],
        [2, "2 check the scope"],
      ],
      out: "→ plan to approve",
    },
    {
      p: "build",
      cmd: "/bkit-build",
      title: "Build",
      g: [
        [2, "write, then verify"],
        [2, "hunt bugs + security"],
      ],
      out: "→ tested pull request",
    },
    {
      p: "ship",
      cmd: "/bkit-ship",
      title: "Ship",
      g: [
        [1, "check nothing's missing"],
        [2, "update docs + summary"],
      ],
      out: "→ ready to go live",
    },
  ];
  const X = [40, 336, 632, 928],
    CW = 236,
    CY = 40,
    CH = 290;
  cards.forEach((c, i) => {
    const x = X[i],
      col = t[c.p];
    b += `<rect x="${x}" y="${CY}" width="${CW}" height="${CH}" rx="14" fill="${t.surface}" stroke="${t.border}"/>`;
    b += `<rect x="${x}" y="${CY}" width="${CW}" height="6" rx="3" fill="${col}"/>`;
    b += text(x + 24, CY + 44, c.cmd, { size: 17, fill: col, font: MONO, weight: 600 });
    b += text(x + 24, CY + 82, c.title, { size: 28, weight: 700, fill: t.text });
    b += `<line x1="${x + 24}" y1="${CY + 102}" x2="${x + CW - 24}" y2="${CY + 102}" stroke="${t.border}"/>`;
    c.g.forEach(([n, label], k) => {
      const gy = CY + 134 + k * 66;
      if (c.p === "build" && k === 0) {
        b += dots(x + 32, gy, 1, col);
        b += text(x + 54, gy + 6, "⇄", { size: 18, fill: col, anchor: "middle", weight: 700 });
        b += dots(x + 76, gy, 1, col);
      } else b += dots(x + 32, gy, n, col);
      b += text(x + 24, gy + 32, label, { size: 18, fill: t.text });
    });
    b += text(x + 24, CY + CH - 22, c.out, { size: 17, weight: 700, fill: col });
  });
  const ay = CY + 145;
  // Design -> Plan, Plan -> Build: gated
  [0, 1].forEach((i) => {
    const x1 = X[i] + CW + 2,
      x2 = X[i + 1] - 4;
    b += line(x1, ay, x2, ay) + gateIcon((x1 + x2) / 2, ay, t);
  });
  // Build -> Ship: tests pass
  b += line(X[2] + CW + 2, ay, X[3] - 4, ay);
  b += text((X[2] + CW + X[3]) / 2, ay - 26, "tests", {
    size: 14,
    fill: t.muted,
    anchor: "middle",
  });
  b += text((X[2] + CW + X[3]) / 2, ay - 10, "pass", { size: 14, fill: t.muted, anchor: "middle" });

  // Debug side rail under Build
  const dx = X[2],
    dy = 410,
    dh = 150,
    dcol = t.debug;
  b += line(dx + 88, CY + CH + 4, dx + 88, dy - 4);
  b += line(dx + 148, dy - 4, dx + 148, CY + CH + 4);
  b += text(dx + 78, 375, "tests fail", { size: 15, fill: t.muted, anchor: "end" });
  b += text(dx + 158, 375, "fixed, re-test", { size: 15, fill: t.muted });
  b += `<rect x="${dx}" y="${dy}" width="${CW}" height="${dh}" rx="14" fill="${t.surface}" stroke="${t.border}"/>`;
  b += `<rect x="${dx}" y="${dy}" width="${CW}" height="6" rx="3" fill="${dcol}"/>`;
  b += text(dx + 24, dy + 40, "/bkit-debug", { size: 17, fill: dcol, font: MONO, weight: 600 });
  b += text(dx + 24, dy + 74, "Debug", { size: 26, weight: 700, fill: t.text });
  b += dots(dx + 32, dy + 100, 1, dcol);
  b += text(dx + 54, dy + 106, "→", { size: 18, fill: dcol, anchor: "middle", weight: 700 });
  b += dots(dx + 76, dy + 100, 1, dcol);
  b += text(dx + 24, dy + 132, "find cause, fix, remember", { size: 17, fill: t.text });

  // Ship -> your OK -> live
  const sx = X[3] + CW / 2;
  b += line(sx, CY + CH + 4, sx, 446);
  b += gateIcon(sx, 380, t);
  b += `<rect x="${sx - 90}" y="450" width="180" height="48" rx="24" fill="${t.surface}" stroke="${t.ok}" stroke-width="2"/>`;
  b += text(sx, 481, "✓ Live", { size: 20, weight: 700, fill: t.ok, anchor: "middle" });

  // Legend
  const lx = 48;
  b +=
    gateIcon(lx + 12, 424, t, 14) +
    text(lx + 40, 430, "Stops and waits for your sign-off", { size: 18, fill: t.text });
  b +=
    dots(lx + 4, 470, 3, t.muted, 6, 16) +
    text(lx + 64, 476, "Each dot is a separate AI agent", { size: 18, fill: t.text });
  b +=
    dots(lx + 4, 516, 2, t.muted, 6, 16) +
    text(lx + 64, 522, "Reviewers never see each other's verdicts", { size: 18, fill: t.text });

  // Hosts band
  b += `<line x1="40" y1="580" x2="${W - 40}" y2="580" stroke="${t.border}"/>`;
  b += text(48, 621, "Runs on", { size: 17, fill: t.muted, weight: 600 });
  let hx = 128;
  for (const h of ["Claude Code", "Cursor", "Codex", "opencode"]) {
    const w = h.length * 9.6 + 28;
    b += `<rect x="${hx}" y="598" width="${w}" height="34" rx="17" fill="${t.surface}" stroke="${t.border}"/>`;
    b += text(hx + w / 2, 621, h, { size: 16, fill: t.text, anchor: "middle", weight: 600 });
    hx += w + 10;
  }
  b += text(W - 48, 621, "Switch mid-feature — progress is saved in your repo", {
    size: 17,
    fill: t.muted,
    anchor: "end",
  });
  return svg(
    W,
    H,
    b,
    "The bkit pipeline: design, plan, build, ship, with debug fixing failed tests. Parallel AI agents at every step; it stops for your sign-off after design, after plan, and before going live. Runs on Claude Code, Cursor, Codex and opencode.",
  );
}

// ---------- What's in the box ----------
function features(t) {
  const W = 1000;
  const rows = [
    [
      "Does the work",
      "design",
      [
        ["A workflow per job", "Design, plan, build, debug", "and ship — a command each"],
        ["Independent review", "Agents check work they", "didn't write themselves"],
        ["Self-fixing builds", "Reads the error, fixes it,", "re-tests, remembers the fix"],
        ["34 audits", "Security, privacy, cost,", "accessibility and more"],
      ],
    ],
    [
      "Keeps you in control",
      "gate",
      [
        ["Your sign-off", "Approve design and plan;", "nothing ships without you"],
        ["Guardrails", "Risky commands blocked;", "reviewers can read, not edit"],
        ["Honest CI", "Parallel test lanes; green", "means every test ran"],
        ["Quality checks", "Same checks on commit,", "on push and in CI"],
      ],
    ],
    [
      "Fits how you work",
      "plan",
      [
        ["Any AI tool", "Claude Code, Cursor, Codex", "or opencode — switch freely"],
        ["Laptop to cloud", "Start at your desk, carry", "on from your phone or CI"],
        ["Parallel features", "Each runs in its own", "copy of the repo"],
        ["Skills on demand", "Installed for the feature,", "removed when it ships"],
      ],
    ],
    [
      "Built-in know-how",
      "build",
      [
        ["Docs + memory", "Docs kept up to date, plus", "lessons agents read first"],
        ["Best model per job", "Each agent pinned to the", "right model, on every tool"],
        ["Work stats", "Every run measured against", "your last five"],
        ["Templates to adopt", "Secrets sync, Serena,", "graphify, Renovate"],
      ],
    ],
  ];
  const M = 24,
    G = 12,
    TW = (W - 2 * M - 3 * G) / 4,
    TH = 112,
    RH = 150;
  const H = M + rows.length * RH - 12 + M - 14;
  let b = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="${t.bg}" stroke="${t.border}"/>`;
  rows.forEach(([label, key, tiles], r) => {
    const ry = M + r * RH;
    const col = t[key];
    b += text(M + 4, ry + 14, label.toUpperCase(), { size: 13, weight: 700, fill: col, ls: 1.4 });
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
    "What ships with bkit: ready-made workflows, independent review, self-fixing builds, 34 audits, human sign-off, guardrails, honest CI, quality checks, any AI tool, laptop to cloud, parallel features, skills on demand, docs and memory kept current, best model per job, work stats, templates to adopt.",
  );
}

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(join(OUT, `bkit-hero-${name}.svg`), hero(t));
  writeFileSync(join(OUT, `bkit-pipeline-${name}.svg`), pipeline(t));
  writeFileSync(join(OUT, `bkit-features-${name}.svg`), features(t));
}
// One image: link previews have no light/dark switch, and dark reads on both.
writeFileSync(join(OUT, "bkit-social.svg"), social(THEMES.dark));
console.log("ok");
