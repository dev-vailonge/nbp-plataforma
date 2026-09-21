/**
 * NBP Design System — tokens canónicos.
 * Fonte visual: legacy/*V2.html + nbp-portal.html
 * Uso em CSS: classes Tailwind `nbp-*` (ver globals.css @theme).
 */

export const color = {
  bg: "#111110",
  sup: "#1A1A18",
  sup2: "#201F1D",
  fill: "#2A2926",
  rail: "#161615",
  bd: "#302F2C",
  bd2: "#45443F",
  tx: "#EDEBE4",
  tx2: "#A5A39B",
  tx3: "#77756E",
  salvia: "#C6CABE",
  cream: "#FDFFEF",
  ink: "#181818",
  violet: "#A79FEA",
  violetSoft: "#C0BAF2",
  violetDeep: "#22203F",
  violetBd: "#4A4470",
  success: "#5FC7A4",
  warn: "#E0AC5E",
  warnDeep: "#33260F",
  down: "#C9A39A",
  info: "#8FBEEA",
  infoDeep: "#16293D",
  word: "#7FB6EE",
  pdf: "#E88585",
} as const;

export const radius = {
  sm: "7px",
  md: "10px",
  lg: "12px",
  xl: "14px",
  "2xl": "16px",
  "3xl": "18px",
  pill: "999px",
} as const;

export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  10: "40px",
  12: "48px",
} as const;

export const type = {
  /** Page H1 (topbar V2) */
  title: { size: "1.4rem", weight: 600, tracking: "0" },
  /** Home greet */
  greet: { size: "clamp(1.5rem, 2.4vw, 2rem)", weight: 500, tracking: "-0.01em" },
  /** Section H2 */
  section: { size: "1.15rem", weight: 600, tracking: "0" },
  /** Panel title */
  panel: { size: "1.05rem", weight: 600, tracking: "0" },
  /** Body */
  body: { size: "0.92rem", weight: 400, tracking: "0" },
  /** Muted supporting */
  muted: { size: "0.82rem", weight: 400, tracking: "0" },
  /** Uppercase kicker / section label */
  kicker: { size: "0.68rem", weight: 500, tracking: "0.14em" },
  /** Mono / counts */
  mono: { size: "0.78rem", weight: 500, tracking: "0" },
} as const;

export const shadow = {
  mark: "0 0 24px rgba(198,200,186,0.16)",
  creamBtn: "0 8px 24px rgba(253,255,239,0.14)",
  focus: "0 0 0 3px rgba(198,202,190,0.12)",
} as const;

export const layout = {
  shellMax: "1180px",
  sidebarW: "200px",
  contentPad: "24px",
  shellOuterPad: "22px",
} as const;

export const motion = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
  journey: "1200ms",
  ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
} as const;

/** Semantic surfaces for cards / panels */
export const surface = {
  page: color.bg,
  shell: color.sup,
  card: color.sup,
  elev: color.sup2,
  rail: color.rail,
  fill: color.fill,
} as const;

export const nbpDs = {
  color,
  radius,
  space,
  type,
  shadow,
  layout,
  motion,
  surface,
} as const;

export type NbpColor = keyof typeof color;
export type NbpRadius = keyof typeof radius;
