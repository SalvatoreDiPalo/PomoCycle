import { useContext, useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { useTimer } from "react-timer-hook";
import { AppContext } from "../../context/AppContext";
import CircularWithValueLabel from "../../components/CircularWithLabel";
import ControlPanel from "./components/ControlPanel";
import { TimerLabel } from "../../data/TimerLabel";
import RoundCounter from "./components/RoundCounter";
import {
  StartPomo,
  UpdatePomoSecondsLeft,
} from "../../../wailsjs/go/backend/App";
import { Operation } from "../../data/Operation";
import { TIMEOUT, audioPaths } from "../../util/Constants";
import { AddActivity, calculateTimeAndLabel } from "../../util/Utils";
import { addSeconds, formatISO } from "date-fns";
import { useSnackbarWithAction } from "../../hooks/useSnackbarWithAction";

export default function HomeScreen() {
  const { appState } = useContext(AppContext)!;
  const handleClickWithAction = useSnackbarWithAction();
  const [historyData, setHistoryData] = useState({
    sessionId: 0,
    isStarted: false,
    currentRound: 1,
    currentFocussedTime: 1,
    currentSelectedTimer: appState.focusTime,
    currentLabel: TimerLabel.FOCUS_TIME,
  });

  const [audio, setAudio] = useState<HTMLAudioElement>();
  useEffect(() => {
    const audio = new Audio(audioPaths[appState.alarmSound]);
    audio.volume = appState.volume / 100;
    setAudio(audio);
  }, [appState]);

  const initDateTime = addSeconds(
    new Date(),
    historyData.currentSelectedTimer * 60
  );

  const onExpire = () => {
    AddActivity(historyData.sessionId, Operation.FINISH, () =>
      UpdatePomoSecondsLeft({
        id: historyData.sessionId,
        seconds_left: totalSeconds,
      }).catch((err) => handleClickWithAction("Updating session failed!"))
    );
    if (audio) {
      audio.currentTime = 0;
    }
    audio?.play();
    const nextRound = historyData.currentRound + 1;
    if (nextRound > appState.rounds * 2) {
      return resetTimer();
    }
    const { time, label } = calculateTimeAndLabel(nextRound, appState);
    updateTime(
      time,
      label,
      true,
      nextRound,
      nextRound % 2 === 0
        ? historyData.currentFocussedTime
        : historyData.currentFocussedTime + 1
    );
  };

  const onSkip = () => {
    pause();
    onExpire();
  };

  const onPause = () => {
    UpdatePomoSecondsLeft({
      id: historyData.sessionId,
      seconds_left: totalSeconds,
    })
      .catch((err) => handleClickWithAction("Pause saving failed!"))
      .finally(() => pause());
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
    StartPomo({
      seconds_left: historyData.currentSelectedTimer * 60,
      stage: historyData.currentLabel,
      timestamp: formatISO(new Date()),
      total_seconds: historyData.currentSelectedTimer * 60,
    })
      .then((sessionId) => {
        setHistoryData((prevState) => ({
          ...prevState,
          isStarted: true,
          sessionId,
        }));
      })
      .catch((err) => handleClickWithAction("'Start' saving failed!"))
      .finally(() => start());
  };

  const updateTime = (
    time: number,
    label: TimerLabel,
    isStarted: boolean,
    nextRound: number,
    currentFocussedTime: number
  ) => {
    setTimeout(() => {
      const reloadTime = new Date();
      reloadTime.setSeconds(reloadTime.getSeconds() + time * 60);

      StartPomo({
        seconds_left: time * 60,
        stage: label,
        timestamp: formatISO(new Date()),
        total_seconds: time * 60,
      })
        .then((sessionId) => {
          //TODO add dissolve audio
          audio?.pause();
          setHistoryData({
            sessionId,
            isStarted,
            currentRound: nextRound,
            currentFocussedTime,
            currentSelectedTimer: time,
            currentLabel: label,
          });
        })
        .catch((err) => handleClickWithAction("'Start' saving failed!"))
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
          sessionId={historyData.sessionId}
          started={historyData.isStarted}
          isRunning={isRunning}
          volume={appState.volume}
          audio={audio}
          startTimer={startTimer}
          resume={resume}
          pause={onPause}
          onSkip={onSkip}
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
