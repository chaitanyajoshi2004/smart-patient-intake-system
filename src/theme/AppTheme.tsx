import { createContext, useContext, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

interface ThemeModeContextValue {
  mode: "light" | "dark";
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">(() => (
    localStorage.getItem("spi_theme") === "dark" ? "dark" : "light"
  ));

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: "#2563eb" },
      secondary: { main: "#0891b2" },
      success: { main: "#16a34a" },
      warning: { main: "#d97706" },
      error: { main: "#dc2626" },
      background: {
        default: mode === "dark" ? "#0b1120" : "#f6f8fb",
        paper: mode === "dark" ? "#111827" : "#ffffff",
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 700 } } },
      MuiCard: { styleOverrides: { root: { boxShadow: "0 1px 3px rgba(15,23,42,.08)" } } },
    },
  }), [mode]);

  const contextValue = useMemo(() => ({
    mode,
    toggleMode: () => setMode(current => {
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem("spi_theme", next);
      return next;
    }),
  }), [mode]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error("useThemeMode must be used inside AppThemeProvider");
  return context;
}
