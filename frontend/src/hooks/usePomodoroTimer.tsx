import { useState, useEffect, useContext } from "react";
import { StartPomo, UpdatePomoSecondsLeft } from "../../wailsjs/go/backend/App";
import { addSeconds, formatISO } from "date-fns";
import { useSnackbarWithAction } from "./useSnackbarWithAction";
import { useTimer } from "react-timer-hook";
import { TimerLabel } from "../data/TimerLabel";
import { AppContext } from "../context/AppContext";
import { calculateTimeAndLabel } from "../util/Utils";
import { HistoryData } from "../data/HistoryData";
import { backend } from "../../wailsjs/go/models";

function usePomodoroTimer(
  initDateTime: Date,
  historyData: HistoryData,
  setHistoryData: React.Dispatch<React.SetStateAction<HistoryData>>,
  playAudio: () => void,
  resetTimer: () => void
) {
  const { appState } = useContext(AppContext)!;
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<number>(-1);
  const handleClickWithAction = useSnackbarWithAction();

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
    let sessionId = -1;
    StartPomo({
      seconds_left: historyData.currentSelectedTimer * 60,
      stage: historyData.currentLabel,
      timestamp: formatISO(new Date()),
      total_seconds: historyData.currentSelectedTimer * 60,
    })
      .then((id) => (sessionId = id))
      .catch((err) => handleClickWithAction("'Start' saving failed!"))
      .finally(() => {
        setIsStarted(true);
        start();
        setSessionId(sessionId);
      });
  };

  const pauseTimer = () => {
    UpdatePomoSecondsLeft({
      id: sessionId,
      seconds_left: totalSeconds,
    })
      .catch((err) => handleClickWithAction("Pause saving failed!"))
      .finally(() => pause());
  };

  const restartTimer = async (
    timing: number,
    label: string,
    autoStart?: boolean
  ) => {
    const reloadTime = addSeconds(new Date(), timing * 60);
    let sessionId = -1;
    try {
      const response = await StartPomo({
        seconds_left: timing * 60,
        stage: label,
        timestamp: formatISO(new Date()),
        total_seconds: timing * 60,
      });
      sessionId = response;
    } catch (err) {
      handleClickWithAction("'Start' saving failed!");
    }
    restart(reloadTime, autoStart);
    setSessionId(sessionId);
  };

  const resumeTimer = () => {
    resume();
  };

  const skipTimer = () => {
    onExpire(totalSeconds);
  };

  const onExpire = (secondsLeft: number = 0) => {
    UpdatePomoSecondsLeft({
      id: sessionId,
      seconds_left: secondsLeft,
    }).catch((err) => handleClickWithAction("Updating session failed!"));
    playAudio();
    const nextRound = historyData.currentRound + 1;
    if (nextRound > appState.rounds * 2) {
      return resetTimer();
    }
    const { time, label } = calculateTimeAndLabel(nextRound, appState);
    setHistoryData((prevValue) => ({
      currentRound: nextRound,
      alreadyFocused:
        nextRound % 2 === 0
          ? prevValue.alreadyFocused
          : prevValue.alreadyFocused + 1,
      currentSelectedTimer: time,
      currentLabel: label,
    }));
    restartTimer(time, label);
  };

  useEffect(() => {
    if (!isStarted) {
      const updatedTiming = getNewTimingFromAppState(
        historyData.currentLabel,
        appState
      );
      const reloadTime = new Date();
      reloadTime.setSeconds(reloadTime.getSeconds() + updatedTiming * 60);
      setHistoryData((prevValue) => ({
        ...prevValue,
        currentSelectedTimer: updatedTiming,
      }));
      restart(reloadTime, false);
    }
  }, [appState.focusTime, appState.shortBreakTime, appState.longBreakTime]);

  return {
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
  };
}

export default usePomodoroTimer;

const getNewTimingFromAppState = (
  currentLabel: TimerLabel,
  appState: backend.AppState
): number => {
  switch (currentLabel) {
    case TimerLabel.FOCUS_TIME:
      return appState.focusTime;
    case TimerLabel.SHORT_BREAK:
      return appState.shortBreakTime;
    case TimerLabel.LONG_BREAK:
      return appState.longBreakTime;
    default:
      return 25;
  }
};
