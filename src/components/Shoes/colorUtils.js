const COLOR_HEX = {
  white: "#FFFFFF",
  black: "#000000",
  red: "#DC2626",
  blue: "#2563EB",
  navy: "#1E3A5F",
  green: "#16A34A",
  grey: "#6B7280",
  gray: "#6B7280",
  brown: "#78350F",
  beige: "#D4C4A8",
  pink: "#EC4899",
  orange: "#EA580C",
  yellow: "#EAB308",
  purple: "#9333EA",
  gold: "#CA8A04",
  silver: "#9CA3AF",
  cream: "#FFFDD0",
  tan: "#D2B48C",
  maroon: "#800000",
  burgundy: "#800020",
  charcoal: "#36454F",
  ivory: "#FFFFF0",
  "off white": "#FAF9F6",
  "off-white": "#FAF9F6",
  olive: "#556B2F",
  teal: "#0D9488",
  coral: "#FF7F50",
  khaki: "#C3B091",
  multicolor: "#9CA3AF",
};

export const colorNameToHex = (name) => {
  const key = name?.trim().toLowerCase() || "";
  if (!key) return "";
  if (COLOR_HEX[key]) return COLOR_HEX[key];

  const firstWord = key.split(/[\s/-]+/)[0];
  if (COLOR_HEX[firstWord]) return COLOR_HEX[firstWord];

  if (key.includes("white")) return COLOR_HEX.white;
  if (key.includes("black")) return COLOR_HEX.black;
  if (key.includes("red")) return COLOR_HEX.red;
  if (key.includes("blue")) return COLOR_HEX.blue;
  if (key.includes("green")) return COLOR_HEX.green;

  return "";
};

export const previewSku = ({ brandName, productName, color, size }) => {
  const part = (value, max = 8) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, max)
      .toUpperCase() || "ITEM";

  return [part(brandName, 6), part(productName, 10), part(color, 5), part(size, 4)]
    .filter(Boolean)
    .join("-");
};
