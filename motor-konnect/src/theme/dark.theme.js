import { palette as p, radius, spacing, shadow } from "./palette";

// Dark variant of the same palette (the app currently runs in light mode;
// this stays consistent in case dark mode is switched on later).
export default {
  dark: true,
  colors: {
    primary: "#8FA9C9",
    primaryDark: "#B8C9DD",
    primaryLight: "#22324A",
    primarySoft: "#1A2433",
    onPrimary: p.navy900,

    background: "#101318",
    surface: "#181C23",
    card: "#181C23",
    inputBackground: "#20252D",

    text: "#ECEEF1",
    textSecondary: "#A3AAB5",
    textMuted: "#7B8390",
    icon: "#C9CED6",

    border: "#2A3039",
    divider: "#20252D",

    danger: "#E5736B",
    error: "#E5736B",
    dangerSoft: "#3A1E1C",
    success: "#6DB892",
    successSoft: "#1C3328",
    warning: "#D9AE5E",
    warningSoft: "#3A2F1A",
  },
  radius,
  spacing,
  shadow,
};
