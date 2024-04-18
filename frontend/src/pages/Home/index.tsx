import { useContext, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTimer } from "react-timer-hook";
import { AppContext } from "../../context/AppContext";
import CircularWithValueLabel from "../../components/CircularWithLabel";
import ControlPanel from "./components/ControlPanel";
import { TimerLabel } from "../../data/TimerLabel";
import RoundCounter from "./components/RoundCounter";
import ringer from "../../assets/66951_634166-lq.mp3";

const TIMEOUT: number = 1500;

export default function HomeScreen() {
  const { appState, updateVolume } = useContext(AppContext)!;
  const [historyData, setHistoryData] = useState({
    isStarted: false,
    currentRound: 1,
    currentFocussedTime: 1,
    currentSelectedTimer: appState.focusTime,
    currentLabel: TimerLabel.FOCUS_TIME,
  });

  const audio = new Audio(ringer);
  audio.volume = appState.volume / 100;

  const initDateTime = new Date();
  initDateTime.setSeconds(
    initDateTime.getSeconds() + historyData.currentSelectedTimer * 60
  );

  const onExpire = () => {
    audio.play();
    const currentRound = historyData.currentRound + 1;
    if (currentRound > appState.rounds * 2) {
      return resetTimer();
    }
    const isEvenRound = currentRound % 2 === 0;

    let time = appState.focusTime;
    let label = TimerLabel.FOCUS_TIME;

    if (currentRound === appState.rounds * 2) {
      time = appState.longBreakTime;
      label = TimerLabel.LONG_BREAK;
    } else if (isEvenRound) {
      time = appState.shortBreakTime;
      label = TimerLabel.SHORT_BREAK;
    }
    updateTime(
      time,
      label,
      true,
      currentRound,
      isEvenRound
        ? historyData.currentFocussedTime
        : historyData.currentFocussedTime + 1
    );
  };

  const onSkip = () => {
    pause();
    onExpire();
  };

  const handleUpdateVolume = (value: number) => {
    audio.volume = value / 100;
    updateVolume(value);
  };

  const resetTimer = () => {
    pause();
    updateTime(appState.focusTime, TimerLabel.FOCUS_TIME, false, 1, 1);
  };

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp: initDateTime,
    onExpire: () => onExpire(),
    autoStart: false,
  });

  const startTimer = () => {
    setHistoryData((prevState) => ({
      ...prevState,
      isStarted: true,
    }));
    start();
  };

  const updateTime = (
    time: number,
    label: TimerLabel,
    isStarted: boolean,
    currentRound: number,
    currentFocussedTime: number
  ) => {
    setTimeout(() => {
      const reloadTime = new Date();
      reloadTime.setSeconds(reloadTime.getSeconds() + time * 60);
      setHistoryData({
        isStarted,
        currentRound,
        currentFocussedTime,
        currentSelectedTimer: time,
        currentLabel: label,
      });
      restart(reloadTime, isStarted);
    }, TIMEOUT);
  };

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
          started={historyData.isStarted}
          isRunning={isRunning}
          volume={appState.volume}
          startTimer={startTimer}
          resume={resume}
          pause={pause}
          onSkip={onSkip}
          updateVolume={handleUpdateVolume}
        />
      </Box>
      <RoundCounter
        currentFocussedTime={historyData.currentFocussedTime}
        totalRounds={appState.rounds}
        resetTimer={resetTimer}
      />
    </Stack>
  );
}
