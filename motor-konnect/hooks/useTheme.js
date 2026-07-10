// src/hooks/useTheme.js
//
// FIXED: this now reads your ACTUAL ThemeContext from
// src/providers/ThemeProvider.jsx instead of creating a second,
// unrelated Context (which is what caused
// "useTheme must be used within a <ThemeProvider>" — the app is wrapped
// in your real provider, but the old version of this file was checking
// a different Context object entirely, so it always saw null).
//
// Your real ThemeContext provides { theme, isDark, toggleTheme } — this
// hook just re-exposes that as-is. No shape changes, so every existing
// `const { theme } = useTheme()` call across your components keeps
// working exactly as before.

import { useContext } from "react";
import { ThemeContext } from "../src/providers/ThemeProvider";

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
