import { ThemeProvider, createTheme } from "@mui/material";
import React, { ReactNode, createContext, useEffect, useState } from "react";

export interface AppState {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  rounds: number;
  volume: number;
}

interface AppContextProps {
  appState: AppState;
  incrementTime: (field: string, value: number) => void;
  resetTime: () => void;
  updateVolume: (value: number) => void;
  colorMode: ThemeColorMode;
}

interface ThemeColorMode {
  toggleColorMode: () => void;
}

export const AppContext = createContext<AppContextProps | null>(null);

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = React.useState<"light" | "dark">("light");

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const [appState, setAppState] = useState<AppState>({
    ...DEFAULT_DATA,
    // Initialize other state properties here
  });

  useEffect(() => {
    const storedState = localStorage.getItem("appState");
    if (storedState) {
      setAppState(JSON.parse(storedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("appState", JSON.stringify(appState));
  }, [appState]);

  const incrementTime = (field: string, value: number) => {
    setAppState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const updateVolume = (value: number) => {
    setAppState((prevState) => ({
      ...prevState,
      volume: value,
    }));
  };

  const resetTime = () => {
    setAppState(DEFAULT_DATA);
  };

  return (
    <AppContext.Provider
      value={{ appState, incrementTime, resetTime, updateVolume, colorMode }}
    >
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppContext.Provider>
  );
};
export default AppProvider;

const DEFAULT_DATA: AppState = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  rounds: 4,
  volume: 100,
};
