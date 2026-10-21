import { palette as p, radius, spacing, shadow } from "./palette";

export default {
  dark: false,
  colors: {
    primary: p.navy800,
    primaryDark: p.navy900,
    primaryLight: p.navy100,
    primarySoft: p.navy50,
    onPrimary: p.white,

    background: p.slate50,
    surface: p.white,
    card: p.white,
    inputBackground: p.slate100,

    text: p.ink,
    textSecondary: p.slate500,
    textMuted: p.slate400,
    icon: p.slate700,

    border: p.slate200,
    divider: p.slate100,

    danger: p.red,
    error: p.red,
    dangerSoft: p.redTint,
    success: p.green,
    successSoft: p.greenTint,
    warning: p.gold,
    warningSoft: p.goldTint,
  },
  radius,
  spacing,
  shadow,
};
