import type { CSSProperties } from "react";
export const WALL_PATTERNS = [
  "solid",
  "snowflakes",
  "candy-cane",
  "stars",
  "trees",
  "ornaments",
  "plaid",
  "aurora",
  "stripes",
  "polka",
  "holly",
  "night-sky",
] as const;
export type WallPattern = (typeof WALL_PATTERNS)[number];
export type WallLike = {
  pattern: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};
export const DEFAULT_WALLS: Array<
  WallLike & { name: string }
> = [
  {
    name: "Midnight Workshop",
    pattern: "night-sky",
    primaryColor: "#07040a",
    secondaryColor: "#3dff8a",
    accentColor: "#c4122f",
  },
  {
    name: "Candy Cane Lane",
    pattern: "candy-cane",
    primaryColor: "#7a1020",
    secondaryColor: "#f8f4ef",
    accentColor: "#3dff8a",
  },
  {
    name: "Aurora Glow",
    pattern: "aurora",
    primaryColor: "#05080f",
    secondaryColor: "#22c55e",
    accentColor: "#e11d48",
  },
  {
    name: "Golden Stars",
    pattern: "stars",
    primaryColor: "#12080c",
    secondaryColor: "#f0c75e",
    accentColor: "#3dff8a",
  },
  {
    name: "Evergreen Plaid",
    pattern: "plaid",
    primaryColor: "#082015",
    secondaryColor: "#14532d",
    accentColor: "#c4122f",
  },
  {
    name: "Snow Globe",
    pattern: "snowflakes",
    primaryColor: "#0b1220",
    secondaryColor: "#e2e8f0",
    accentColor: "#38bdf8",
  },
  {
    name: "Holly Berries",
    pattern: "holly",
    primaryColor: "#0a1f14",
    secondaryColor: "#15803d",
    accentColor: "#e11d48",
  },
  {
    name: "Ornament Wall",
    pattern: "ornaments",
    primaryColor: "#14060a",
    secondaryColor: "#c4122f",
    accentColor: "#f0c75e",
  },
  {
    name: "Forest Trees",
    pattern: "trees",
    primaryColor: "#07140e",
    secondaryColor: "#166534",
    accentColor: "#f0c75e",
  },
  {
    name: "Peppermint Polka",
    pattern: "polka",
    primaryColor: "#1a080c",
    secondaryColor: "#fb7185",
    accentColor: "#86efac",
  },
];
export function wallStyle(wall: WallLike): CSSProperties {
  const a = wall.primaryColor;
  const b = wall.secondaryColor;
  const c = wall.accentColor;
  switch (wall.pattern) {
    case "candy-cane":
      return {
        backgroundColor: a,
        backgroundImage: `repeating-linear-gradient(135deg, ${a} 0 18px, ${b} 18px 36px)`,
      };
    case "stripes":
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${a} 0 28px, ${b} 28px 56px)`,
      };
    case "plaid":
      return {
        backgroundColor: a,
        backgroundImage: `repeating-linear-gradient(90deg, ${b}22 0 12px, transparent 12px 28px), repeating-linear-gradient(0deg, ${c}33 0 12px, transparent 12px 28px)`,
      };
    case "polka":
      return {
        backgroundColor: a,
        backgroundImage: `radial-gradient(${b} 7px, transparent 8px), radial-gradient(${c} 5px, transparent 6px)`,
        backgroundPosition: "0 0, 22px 18px",
        backgroundSize: "44px 36px",
      };
    case "snowflakes":
      return {
        backgroundColor: a,
        backgroundImage: `radial-gradient(circle at 10% 20%, ${b}cc 1.5px, transparent 2px), radial-gradient(circle at 70% 40%, ${b}99 1px, transparent 2px), radial-gradient(circle at 40% 80%, ${c}aa 1.5px, transparent 2px)`,
        backgroundSize: "120px 120px, 80px 80px, 140px 140px",
      };
    case "stars":
      return {
        backgroundColor: a,
        backgroundImage: `radial-gradient(circle at 20% 30%, ${b} 1.4px, transparent 2px), radial-gradient(circle at 80% 70%, ${c} 1px, transparent 2px), radial-gradient(circle at 50% 10%, ${b} 1px, transparent 2px)`,
        backgroundSize: "90px 90px",
      };
    case "aurora":
      return {
        backgroundImage: `linear-gradient(180deg, ${a}, #050505 55%), radial-gradient(ellipse at 20% 0%, ${b}66, transparent 55%), radial-gradient(ellipse at 80% 10%, ${c}55, transparent 50%)`,
      };
    case "night-sky":
      return {
        backgroundColor: a,
        backgroundImage: `radial-gradient(ellipse at 50% -10%, ${b}33, transparent 50%), radial-gradient(circle at 15% 25%, ${c} 1px, transparent 2px), radial-gradient(circle at 75% 40%, ${b} 1px, transparent 2px)`,
      };
    case "trees":
      return {
        backgroundColor: a,
        backgroundImage: `linear-gradient(135deg, ${b}33 25%, transparent 25%), linear-gradient(225deg, ${b}33 25%, transparent 25%)`,
        backgroundSize: "48px 48px",
      };
    case "ornaments":
      return {
        backgroundColor: a,
        backgroundImage: `radial-gradient(circle at 25% 25%, ${b} 10px, transparent 11px), radial-gradient(circle at 75% 60%, ${c} 8px, transparent 9px)`,
        backgroundSize: "90px 90px",
      };
    case "holly":
      return {
        backgroundColor: a,
        backgroundImage: `radial-gradient(circle at 30% 30%, ${c} 4px, transparent 5px), radial-gradient(circle at 70% 70%, ${b}55 18px, transparent 19px)`,
        backgroundSize: "70px 70px",
      };
    default:
      return { backgroundColor: a };
  }
}
export const BUBBLE_COLORS = [
  { name: "Crimson", value: "#c4122f" },
  { name: "Evergreen", value: "#15803d" },
  { name: "Gold", value: "#f0c75e" },
  { name: "Mint", value: "#3dff8a" },
  { name: "Ice", value: "#7dd3fc" },
  { name: "Berry", value: "#fb7185" },
  { name: "Grape", value: "#c084fc" },
  { name: "Snow", value: "#f8fafc" },
];
export const BUBBLE_SHAPES = [
  "round",
  "cloud",
  "ornament",
  "present",
  "star",
  "scallop",
] as const;
export type BubbleShape = (typeof BUBBLE_SHAPES)[number];
