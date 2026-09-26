// Obrázky profilu organizace IndigoStudioCZ: banner (tmavý a světlý) a avatar.
// Zdrojem pravdy je tenhle skript — SVG v brand/ a PNG v profile/ jsou jeho výstup.
// Spuštění: node brand/build.mjs (potřebuje rsvg-convert, na macOS brew install librsvg).
// Barvy, logo a malůvky jsou převzaté z webu indigostudio.cz (favicon.svg, index.html, doodles.js).

import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const out = (path) => fileURLToPath(new URL(path, import.meta.url));

const W = 1280;
const H = 360;
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// Tokeny webu pro tmavý a světlý režim; k = paleta malůvek (--c1 … --c5).
// Záře za logem jen v tmavém: na světlém pozadí dělá jemný přechod viditelné kruhy (banding).
const THEMES = {
  dark: {
    bg: "#0d0e13", border: "#ffffff", borderOpacity: 0.08,
    fg: "#ededf1", muted: "#a3a4ae", faint: "#6f707b", accent: "#8b8ef8",
    glow: 0.16, doodles: 0.3,
    k: ["#818cf8", "#f472b6", "#2dd4bf", "#fbbf24", "#4ade80"],
  },
  light: {
    bg: "#f6f6f8", border: "#101220", borderOpacity: 0.09,
    fg: "#14151b", muted: "#555766", faint: "#8b8c98", accent: "#4f46e5",
    glow: 0, doodles: 0.24,
    k: ["#6366f1", "#db2777", "#0d9488", "#d97706", "#16a34a"],
  },
};

// Motivy malůvek jako na webu: [šířka, výška viewBoxu, tahy]; k="n" = barva z palety, t = tlustý token
const MOTIFS = {
  code: [220, 150, `
    <rect k="3" x="10" y="10" width="200" height="130" rx="8"/>
    <path k="2" t d="M30 34h26"/><path k="1" t d="M64 34h46"/>
    <path k="4" t d="M44 50h24"/><path k="3" t d="M76 50h58"/>
    <path k="1" t d="M58 66h48"/><path k="2" t d="M114 66h16"/>
    <path k="5" t d="M58 82h70"/>
    <path k="4" t d="M44 98h20"/><path k="1" t d="M72 98h64"/>
    <path k="2" t d="M30 114h14"/><path k="1" d="M144 106v16"/>`],
  git: [200, 140, `
    <circle k="1" cx="24" cy="110" r="6"/><path k="1" d="M30 110h44"/>
    <circle k="1" cx="80" cy="110" r="6"/><path k="3" d="M84 105c12-22 16-55 34-55"/>
    <circle k="3" cx="124" cy="50" r="6"/><path k="1" d="M86 110h82"/>
    <path k="3" d="M130 50h18"/><circle k="3" cx="154" cy="50" r="6"/>
    <path k="3" d="M159 54c10 20 15 40 15 50"/><circle k="5" cx="174" cy="110" r="6"/>
    <path k="4" d="M160 88h24l8 8-8 8h-24z"/><path k="2" d="M40 30h40M40 42h26"/>`],
  mock: [220, 160, `
    <rect k="1" x="10" y="10" width="200" height="140" rx="8"/><path k="1" d="M10 32h200"/>
    <circle k="2" cx="23" cy="21" r="3"/><circle k="4" cx="33" cy="21" r="3"/><circle k="5" cx="43" cy="21" r="3"/>
    <path k="1" d="M24 48h84M24 62h58"/><rect k="2" x="24" y="76" width="44" height="14" rx="7"/>
    <rect k="3" x="128" y="44" width="68" height="50" rx="4"/>
    <path k="3" d="M128 94l24-22 14 12 12-8 18 18"/><circle k="4" cx="180" cy="58" r="5"/>
    <rect k="1" x="24" y="106" width="52" height="32" rx="4"/>
    <rect k="3" x="84" y="106" width="52" height="32" rx="4"/>
    <rect k="4" x="144" y="106" width="52" height="32" rx="4"/>
    <path k="2" d="M60 84l14 30 4-12 12-4z"/>`],
  phone: [120, 200, `
    <rect k="3" x="14" y="10" width="92" height="180" rx="14"/><path k="3" d="M48 22h24"/>
    <rect k="1" x="26" y="36" width="68" height="42" rx="5"/><path k="1" d="M26 92h68M26 104h46"/>
    <circle k="4" cx="32" cy="124" r="5"/><path k="4" d="M44 124h48"/>
    <circle k="2" cx="32" cy="144" r="5"/><path k="2" d="M44 144h40"/>
    <rect k="5" x="26" y="162" width="68" height="16" rx="8"/>`],
  flow: [240, 140, `
    <circle k="5" cx="20" cy="70" r="10"/><path k="1" d="M30 70h28M52 65l6 5-6 5"/>
    <rect k="1" x="58" y="52" width="52" height="36" rx="6"/><path k="1" d="M68 66h32M68 75h22"/>
    <path k="1" d="M110 70h14"/><path k="4" d="M148 46l24 24-24 24-24-24z"/>
    <path k="3" d="M148 46V22h32M174 17l6 5-6 5"/><path k="2" d="M148 94v24h32M174 113l6 5-6 5"/>
    <rect k="3" x="180" y="8" width="50" height="28" rx="6"/>
    <rect k="2" x="180" y="104" width="50" height="28" rx="6"/>
    <path k="3" d="M194 22l6 6 14-12"/><path k="2" d="M198 112l14 12M212 112l-14 12"/>`],
  uml: [220, 170, `
    <rect k="1" x="14" y="14" width="84" height="64" rx="3"/><path k="1" d="M14 32h84M14 56h84"/>
    <path k="1" d="M22 23h40M22 42h52M22 49h36M22 66h46"/>
    <rect k="3" x="140" y="18" width="66" height="44" rx="3"/><path k="3" d="M140 34h66M148 26h32M148 46h44"/>
    <path k="4" d="M98 40h42"/><path k="4" d="M132 35l8 5-8 5"/>
    <rect k="2" x="112" y="100" width="94" height="56" rx="3"/>
    <path k="2" d="M112 118h94M120 109h44M120 130h60M120 140h40"/>
    <path k="4" d="M56 88v40h56"/><path k="4" d="M48 90l8-12 8 12z"/>`],
  mail: [200, 150, `
    <rect k="2" x="20" y="44" width="130" height="88" rx="6"/><path k="2" d="M22 50l63 46 63-46"/>
    <path k="2" d="M24 128l44-38M146 128l-44-38"/>
    <circle k="4" cx="148" cy="46" r="11"/><path k="4" d="M146 42l3-2v12"/>
    <path k="1" d="M20 30c30-26 70-26 104-10"/><path k="1" d="M136 22l54-14-20 44-10-16z"/>
    <path k="1" d="M160 36l30-28"/>`],
  kanban: [220, 150, `
    <rect k="1" x="10" y="10" width="62" height="130" rx="6"/>
    <rect k="4" x="79" y="10" width="62" height="130" rx="6"/>
    <rect k="5" x="148" y="10" width="62" height="130" rx="6"/>
    <path k="1" d="M20 24h30M89 24h36M158 24h26"/>
    <rect k="2" x="18" y="36" width="46" height="22" rx="3"/><rect k="3" x="18" y="64" width="46" height="22" rx="3"/>
    <rect k="1" x="87" y="36" width="46" height="22" rx="3"/><rect k="2" x="156" y="36" width="46" height="22" rx="3"/>
    <rect k="4" x="156" y="64" width="46" height="22" rx="3"/><rect k="3" x="156" y="92" width="46" height="22" rx="3"/>
    <path k="2" d="M40 96c10 30 70 34 88-4M121 90l7 2 1 8"/>`],
  desktop: [200, 160, `
    <rect k="1" x="20" y="10" width="160" height="104" rx="8"/><path k="1" d="M20 96h160"/>
    <path k="1" d="M88 114l-6 24h36l-6-24M66 142h68"/><rect k="3" x="34" y="24" width="30" height="60" rx="3"/>
    <path k="4" t d="M78 32h74"/><path k="2" t d="M78 48h54"/><path k="5" t d="M78 64h64"/>
    <circle k="4" cx="100" cy="105" r="2"/>`],
};

// Rozvržení malůvek v pravé části banneru: [motiv, střed x, střed y, šířka, natočení°]
const LAYOUT = [
  ["code", 800, 62, 150, -4],
  ["git", 985, 80, 170, 3],
  ["flow", 1178, 58, 175, -5],
  ["phone", 880, 212, 72, 6],
  ["uml", 1062, 208, 142, -3],
  ["mail", 1238, 202, 100, 7],
  ["mock", 778, 330, 152, 3],
  ["kanban", 972, 334, 142, -4],
  ["desktop", 1162, 328, 132, 4],
];

function doodle([name, cx, cy, w, rot], k) {
  const [vw, vh, body] = MOTIFS[name];
  const h = (w * vh) / vw;
  const strokes = body
    .replace(/ t /g, ' stroke-width="5" ')
    .replace(/k="(\d)"/g, (_, n) => `stroke="${k[n - 1]}"`);
  return `<g transform="rotate(${rot} ${cx} ${cy})"><svg x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}">${strokes}</svg></g>`;
}

// Logo studia je text „Indigo Studio s. r. o." jako v hlavičce webu a na og.png — žádná ikona.
// (Indigová „i" z favicon.svg je jen ikona záložky, ne logo.)

function banner(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <clipPath id="card"><rect width="${W}" height="${H}" rx="24"/></clipPath>
    <radialGradient id="glow" cx="220" cy="150" r="460" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#6366f1" stop-opacity="${t.glow}"/>
      <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
    <!-- malůvky se ztrácí směrem k textu vlevo -->
    <linearGradient id="fade" x1="620" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="fade-mask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  </defs>

  <g clip-path="url(#card)">
    <rect width="${W}" height="${H}" fill="${t.bg}"/>
    ${t.glow ? `<rect width="${W}" height="${H}" fill="url(#glow)"/>` : ""}
    <g mask="url(#fade-mask)">
      <g opacity="${t.doodles}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${LAYOUT.map((d) => doodle(d, t.k)).join("\n        ")}
      </g>
    </g>
  </g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="23.5" fill="none" stroke="${t.border}" stroke-opacity="${t.borderOpacity}"/>

  <text x="96" y="142" font-family="${FONT}" font-size="70" font-weight="700" letter-spacing="-1.5" fill="${t.fg}">Indigo<tspan dx="19" fill="${t.accent}">Studio</tspan><tspan dx="17" font-size="51" font-weight="500" letter-spacing="-1" fill="${t.faint}">s. r. o.</tspan></text>

  <text x="96" y="238" font-family="${FONT}" font-size="32" fill="${t.muted}"><tspan fill="${t.fg}" font-weight="600">Custom software:</tspan> from internal tools</text>
  <text x="96" y="280" font-family="${FONT}" font-size="32" fill="${t.muted}">to public products</text>
</svg>
`;
}

// Avatar organizace: logo pod sebou na tmavém pozadí webu, zaoblení rohů dodá GitHub sám
function avatar(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${t.bg}"/>
  <g font-family="${FONT}" font-weight="700" letter-spacing="-6">
    <text x="178" y="386" font-size="230" fill="${t.fg}">Indigo</text>
    <text x="178" y="632" font-size="230" fill="${t.accent}">Studio</text>
    <text x="184" y="800" font-size="150" font-weight="500" letter-spacing="-3" fill="${t.faint}">s. r. o.</text>
  </g>
</svg>
`;
}

function render(svgPath, pngPath, args) {
  execFileSync("rsvg-convert", [...args, "-o", pngPath, svgPath]);
  console.log(`${pngPath}`);
}

for (const [name, theme] of Object.entries(THEMES)) {
  const svg = out(`banner-${name}.svg`);
  writeFileSync(svg, banner(theme));
  // 2× kvůli ostrosti na Retina displejích
  render(svg, out(`../profile/banner-${name}.png`), ["-z", "2"]);
}

writeFileSync(out("avatar.svg"), avatar(THEMES.dark));
render(out("avatar.svg"), out("avatar.png"), ["-w", "1024", "-h", "1024"]);
