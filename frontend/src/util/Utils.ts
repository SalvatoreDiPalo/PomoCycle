import { AppState } from "../context/AppContext";
import { TimerLabel } from "../data/TimerLabel";

export const calculateTimeAndLabel = (
  currentRound: number,
  appState: AppState
): {
  time: number;
  label: TimerLabel;
} => {
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

  return { time, label };
};
