import React, { ReactNode, createContext, useEffect, useState } from "react";
import { AlarmSound } from "../data/AlarmSound";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import {
  WindowSetDarkTheme,
  WindowSetLightTheme,
} from "../../wailsjs/runtime/runtime";
import { GetConfig, SetConfig } from "../../wailsjs/go/backend/ConfigStore";
import { backend } from "../../wailsjs/go/models";
import { PaletteMode } from "@mui/material";

interface AppContextProps {
  appState: backend.AppState;
  incrementTime: (field: string, value: number) => void;
  resetTime: () => void;
  updateVolume: (value: number) => void;
  updateTheme: () => void;
  changeAlarmSound: (sound: AlarmSound) => void;
}

export const AppContext = createContext<AppContextProps | null>(null);

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appState, setAppState] = useState<backend.AppState>({
    ...DEFAULT_DATA,
    // Initialize other state properties here
  });

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: appState.theme as PaletteMode,
        },
      }),
    [appState.theme]
  );

  useEffect(() => {
    const fetchConfigs = async () => {
      const dataValue: backend.AppState = await GetConfig(appState);
      if (dataValue) {
        setAppState(dataValue);
      } else {
        console.error("Error reading config file");
      }
      localStorage.setItem("appState", JSON.stringify(dataValue));
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const updateConfigs = async () => {
      await SetConfig(appState);
    };
    localStorage.setItem("appState", JSON.stringify(appState));
    updateConfigs();
    updateWindowsTheme(appState);
  }, [appState, isLoading]);

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
    setAppState((prevValue) => ({
      ...prevValue,
      ...DEFAULT_TIMER,
    }));
  };

  const updateTheme = () => {
    setAppState((prevState) => ({
      ...prevState,
      theme: prevState.theme === "light" ? "dark" : "light",
    }));
  };

  const changeAlarmSound = (sound: AlarmSound) => {
    setAppState((prevState) => ({
      ...prevState,
      alarmSound: sound,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        incrementTime,
        resetTime,
        updateVolume,
        updateTheme,
        changeAlarmSound,
      }}
    >
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppContext.Provider>
  );
};
export default AppProvider;

const DEFAULT_TIMER = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  rounds: 4,
};

const DEFAULT_DATA: backend.AppState = {
  ...DEFAULT_TIMER,
  volume: 100,
  theme: "light",
  alarmSound: AlarmSound.DOUBLE_BELL,
};

function updateWindowsTheme(appState: backend.AppState) {
  if (appState.theme === "light") {
    WindowSetLightTheme();
  } else {
    WindowSetDarkTheme();
  }
}
