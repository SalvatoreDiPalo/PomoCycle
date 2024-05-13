import { TimerLabel } from "./TimerLabel";

export interface HistoryData {
  currentRound: number;
  alreadyFocused: number;
  currentSelectedTimer: number;
  currentLabel: TimerLabel;
}
