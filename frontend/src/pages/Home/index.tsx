import { useContext, useState } from "react";
import { Box, Stack } from "@mui/material";
import { AppContext } from "../../context/AppContext";
import CircularWithValueLabel from "../../components/CircularWithLabel";
import ControlPanel from "./components/ControlPanel";
import { TimerLabel } from "../../data/TimerLabel";
import RoundCounter from "./components/RoundCounter";
import { addSeconds } from "date-fns";
import useAudio from "../../hooks/useAudio";
import { HistoryData } from "../../data/HistoryData";
import usePomodoroTimer from "../../hooks/usePomodoroTimer";

export default function HomeScreen() {
  const { appState } = useContext(AppContext)!;
  const { audio, playAudio } = useAudio();

  const [historyData, setHistoryData] = useState<HistoryData>({
    currentRound: 1,
    alreadyFocused: 1,
    currentSelectedTimer: appState.focusTime,
    currentLabel: TimerLabel.FOCUS_TIME,
  });

  const initDateTime = addSeconds(
    new Date(),
    historyData.currentSelectedTimer * 60
  );

  const resetTimer = () => {
    pauseTimer();
    //updateTime(appState.focusTime, TimerLabel.FOCUS_TIME, false, 1, 1);
    //TODO add reset timer
    setHistoryData({
      currentRound: 1,
      alreadyFocused: 1,
      currentSelectedTimer: appState.focusTime,
      currentLabel: TimerLabel.FOCUS_TIME,
    });
    restartTimer(appState.focusTime, TimerLabel.FOCUS_TIME, false);
  };

  const {
    totalSeconds,
    minutes,
    seconds,
    isStarted,
    isRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    restartTimer,
    skipTimer,
  } = usePomodoroTimer(
    initDateTime,
    historyData,
    setHistoryData,
    playAudio,
    resetTimer
  );

  return (
    <Stack spacing={2} height={"100%"} justifyContent="space-evenly">
      <Box>
        <CircularWithValueLabel
          value={totalSeconds}
          max={historyData.currentSelectedTimer * 60}
          label={historyData.currentLabel}
          minutes={minutes}
          seconds={seconds}
        />

        <ControlPanel
          started={isStarted}
          isRunning={isRunning}
          volume={appState.volume}
          audio={audio?.element}
          startTimer={startTimer}
          resume={resumeTimer}
          pause={pauseTimer}
          onSkip={skipTimer}
        />
      </Box>
      <RoundCounter
        alreadyFocused={historyData.alreadyFocused}
        totalRounds={appState.rounds}
        resetTimer={resetTimer}
      />
    </Stack>
  );
}
