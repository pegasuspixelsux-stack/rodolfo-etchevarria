// Resolves a car's swatch fill color primarily from its color name (so the
// swatch always matches what's displayed even if a stored hex is missing or
// out of sync), falling back to the stored hex, then a neutral gray.
const NAMED_COLOR_PATTERNS: { pattern: RegExp; hex: string }[] = [
  { pattern: /black|onyx|obsidian|ebony|jet\b/i, hex: "#161616" },
  { pattern: /white|pearl|ivory|frost/i, hex: "#f2f1ec" },
  { pattern: /silver|platinum/i, hex: "#c7c9cc" },
  { pattern: /gr[ae]y/i, hex: "#6b6e73" },
  { pattern: /blue|azure|sapphire|navy|cobalt/i, hex: "#2c5fd1" },
  { pattern: /red|crimson|scarlet|maroon|wine/i, hex: "#a11d24" },
  { pattern: /green|emerald|olive|jade/i, hex: "#2f6b3a" },
  { pattern: /yellow|amber/i, hex: "#e6b800" },
  { pattern: /gold/i, hex: "#c9a227" },
  { pattern: /orange|copper|rust|arancio/i, hex: "#d5541c" },
  { pattern: /brown|bronze|tan|beige|sand|champagne/i, hex: "#8a6a4a" },
  { pattern: /purple|violet|plum/i, hex: "#6a3d9a" },
  { pattern: /pink|rose|magenta/i, hex: "#d1548a" },
];

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const FALLBACK_HEX = "#8a8a8a";

export function resolveCarSwatchColor(colorName: string, colorHex?: string): string {
  const nameMatch = NAMED_COLOR_PATTERNS.find(({ pattern }) => pattern.test(colorName));
  if (nameMatch) return nameMatch.hex;

  const trimmedHex = colorHex?.trim();
  if (trimmedHex && HEX_PATTERN.test(trimmedHex)) return trimmedHex;

  return FALLBACK_HEX;
}
