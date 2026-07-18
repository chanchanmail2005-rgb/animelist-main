// Theme tokens derived from /app/design_guidelines.json
export const colors = {
  background: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceElevated: "#F3F4F6",
  surfaceHigh: "#E5E7EB",
  border: "#E5E7EB",
  primary: "#FF2E63",
  primaryMuted: "#FFE4EC",
  secondary: "#18181B",
  text: {
    primary: "#111827",
    secondary: "#4B5563",
    muted: "#9CA3AF",
  },
  status: {
    Ongoing: "#00FF66",
    Complete: "#00BBFF",
    Hiatus: "#FFC300",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 9999,
} as const;

export const typography = {
  h1: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.5 },
  h3: { fontSize: 18, fontWeight: "700" as const, letterSpacing: 0 },
  body: { fontSize: 14, fontWeight: "500" as const, letterSpacing: 0.2 },
  caption: {
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
};

export type AnimeStatus = "Ongoing" | "Complete" | "Hiatus";
export type EntryType = "anime" | "donghua";

export const STATUS_OPTIONS: AnimeStatus[] = ["Ongoing", "Complete", "Hiatus"];
