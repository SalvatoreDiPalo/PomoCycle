import { useContext, useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { useTimer } from "react-timer-hook";
import { AppContext } from "../../context/AppContext";
import CircularWithValueLabel from "../../components/CircularWithLabel";
import ControlPanel from "./components/ControlPanel";
import { TimerLabel } from "../../data/TimerLabel";
import RoundCounter from "./components/RoundCounter";
import ringer from "../../assets/66951_634166-lq.mp3";
import {
  StartPomo,
  AddActivityFromPomo,
  UpdatePomoSecondsLeft,
} from "../../../wailsjs/go/main/App";
import { Operation } from "../../data/Operation";

const TIMEOUT: number = 1500;

const handleActivity = async (
  sessionId: number,
  operation: number,
  onSuccess: () => void
) => {
  try {
    const activityId = await AddActivityFromPomo({
      operation,
      session_id: sessionId,
      timestamp: new Date().getTime(),
    });
    console.log("Activity id", activityId);
    onSuccess();
  } catch (err) {
    console.error("Error while adding activity", err);
  }
};

export default function HomeScreen() {
  const { appState, updateVolume } = useContext(AppContext)!;
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [historyData, setHistoryData] = useState({
    sessionId: 0,
    isStarted: false,
    currentRound: 1,
    currentFocussedTime: 1,
    currentSelectedTimer: appState.focusTime,
    currentLabel: TimerLabel.FOCUS_TIME,
  });

  useEffect(() => {
    const audioElement = new Audio(ringer);
    audioElement.volume = appState.volume / 100;
    setAudio(audioElement);
  }, []);

  const initDateTime = new Date();
  initDateTime.setSeconds(
    initDateTime.getSeconds() + historyData.currentSelectedTimer * 60
  );

  const onExpire = () => {
    handleActivity(historyData.sessionId, Operation.FINISH, () => {});
    UpdatePomoSecondsLeft({
      id: historyData.sessionId,
      seconds_left: totalSeconds,
    }).catch((err) => console.error("Error while updating session", err));
    audio?.play();
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

  const onPause = () => {
    handleActivity(historyData.sessionId, Operation.PAUSE, pause);
  };

  const onResume = () => {
    handleActivity(historyData.sessionId, Operation.PAUSE, resume);
  };

  const handleUpdateVolume = (value: number) => {
    audio!.volume = value / 100;
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
    //TODO add enum for stages
    StartPomo({
      seconds_left: historyData.currentSelectedTimer * 60,
      stage: historyData.currentLabel,
      timestamp: new Date().getTime(),
      total_seconds: historyData.currentSelectedTimer * 60,
    })
      .then((sessionId) => {
        setHistoryData((prevState) => ({
          ...prevState,
          isStarted: true,
          sessionId,
        }));
      })
      .finally(() => start());
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

      StartPomo({
        seconds_left: time * 60,
        stage: label,
        timestamp: new Date().getTime(),
        total_seconds: time * 60,
      })
        .then((sessionId) => {
          setHistoryData({
            sessionId,
            isStarted,
            currentRound,
            currentFocussedTime,
            currentSelectedTimer: time,
            currentLabel: label,
          });
        })
        .finally(() => restart(reloadTime, isStarted));
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
          resume={onResume}
          pause={onPause}
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
