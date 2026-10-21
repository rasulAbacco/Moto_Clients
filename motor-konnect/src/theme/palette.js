// src/theme/palette.js
//
// Motor Konnect — single source of truth for colour.
// A restrained, classic palette: one brand colour (deep navy), a neutral
// grey scale, and muted semantic colours used ONLY for status (error, SOS,
// success, rating). Please don't add new brand colours — reuse these.

export const palette = {
  // Brand
  navy900: "#14243B",
  navy800: "#1E3A5F", // primary
  navy600: "#3A5A80",
  navy100: "#E6ECF3", // primary tint (chips, selected rows, icon bg)
  navy50: "#F1F4F8",

  // Neutrals
  ink: "#1A1D23", // headings / primary text
  slate700: "#374151",
  slate500: "#6B7280", // secondary text
  slate400: "#8A919C", // muted text, placeholders
  slate300: "#C9CED6",
  slate200: "#E3E6EB", // borders, dividers
  slate100: "#EEF0F3",
  slate50: "#F6F7F9", // app background
  white: "#FFFFFF",
  black: "#000000",

  // Semantic (status only)
  red: "#B3261E", // SOS, errors, destructive
  redTint: "#F8E7E6",
  green: "#2E7D5B", // success, "open now"
  greenTint: "#E7F2EC",
  gold: "#B8862B", // ratings, offers
  goldTint: "#F7F0E1",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const shadow = {
  // Soft, classic elevation. Works the same on iOS (shadow*) and Android (elevation).
  card: {
    shadowColor: "#14243B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: "#14243B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
};

export default palette;
