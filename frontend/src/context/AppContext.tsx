import { ThemeProvider, createTheme } from "@mui/material";
import React, { ReactNode, createContext, useEffect, useState } from "react";

export interface AppState {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  rounds: number;
  volume: number;
  theme: "light" | "dark";
}

interface AppContextProps {
  appState: AppState;
  incrementTime: (field: string, value: number) => void;
  resetTime: () => void;
  updateVolume: (value: number) => void;
  updateTheme: () => void;
}

export const AppContext = createContext<AppContextProps | null>(null);

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    ...DEFAULT_DATA,
    // Initialize other state properties here
  });

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: appState.theme,
        },
      }),
    [appState.theme]
  );

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

  const updateTheme = () => {
    setAppState((prevState) => ({
      ...prevState,
      theme: prevState.theme === "light" ? "dark" : "light",
    }));
  };

  return (
    <AppContext.Provider
      value={{ appState, incrementTime, resetTime, updateVolume, updateTheme }}
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
  theme: "light",
};
