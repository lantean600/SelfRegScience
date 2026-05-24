/** Editorial Luxe v2 — single source for contrast tests & CTDP defaults */

export const LIGHT_TOKENS = {
  surface: "#f0ebe0",
  panel: "#faf8f3",
  ink: "#1a1814",
  inkMuted: "#5a554c",
  accent: "#2e5d5a",
  accentFg: "#ffffff",
  editorialAccent: "#9e3d2a",
  signal: "#b85c38",
  signalFg: "#ffffff",
  figureBg: "#faf8f3",
} as const;

export const DARK_TOKENS = {
  surface: "#121110",
  panel: "#1c1b17",
  ink: "#ece7da",
  inkMuted: "#a39e92",
  accent: "#7fb2a8",
  accentFg: "#121110",
  editorialAccent: "#d4715a",
  signal: "#e08a63",
  signalFg: "#121110",
  figureBg: "#161513",
} as const;

export const CTDP_NODE_DEFAULTS = {
  initial: "#5c6b7a",
  executing: "#1f6f6b",
  success: "#4a7c59",
  failed: "#a34f3d",
  edge: "#6b6358",
} as const;

export const CONTRAST_PAIRS = [
  { name: "light ink/surface", fg: LIGHT_TOKENS.ink, bg: LIGHT_TOKENS.surface, min: 4.5 },
  { name: "light ink-muted/panel", fg: LIGHT_TOKENS.inkMuted, bg: LIGHT_TOKENS.panel, min: 4.5 },
  { name: "light accent-fg/accent", fg: LIGHT_TOKENS.accentFg, bg: LIGHT_TOKENS.accent, min: 4.5 },
  { name: "dark ink/surface", fg: DARK_TOKENS.ink, bg: DARK_TOKENS.surface, min: 4.5 },
  { name: "dark ink-muted/panel", fg: DARK_TOKENS.inkMuted, bg: DARK_TOKENS.panel, min: 4.5 },
  { name: "dark accent-fg/accent", fg: DARK_TOKENS.accentFg, bg: DARK_TOKENS.accent, min: 4.5 },
] as const;
