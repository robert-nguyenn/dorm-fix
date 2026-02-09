import React, { createContext, useContext, useMemo, useState } from "react";

const THEMES = {
  light: {
    mode: "light",
    background: "#F5F7FB",
    surface: "#FFFFFF",
    surfaceAlt: "#F6FAFF",
    text: "#0F172A",
    textSoft: "#5B6B86",
    textMuted: "#7C8AA5",
    border: "#E7ECF5",
    accent: "#0EA5A4",
    accentStrong: "#0B1220",
    heroGradient: ["#0B1220", "#0F766E"],
    headerGradient: ["#FFFFFF", "#F6FAFF", "#EEF6FF"],
  },
  dark: {
    mode: "dark",
    background: "#0B0F18",
    surface: "#121826",
    surfaceAlt: "#182033",
    text: "#E2E8F0",
    textSoft: "#94A3B8",
    textMuted: "#7C8AA5",
    border: "#1E293B",
    accent: "#2DD4BF",
    accentStrong: "#7DD3FC",
    heroGradient: ["#0B1220", "#134E4A"],
    headerGradient: ["#0B0F18", "#0F172A", "#0B1220"],
  },
};

const ThemeContext = createContext({
  mode: "light",
  theme: THEMES.light,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = useMemo(() => {
    const theme = THEMES[mode] || THEMES.light;
    return { mode, theme, toggleTheme };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { THEMES };
