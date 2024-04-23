import { AppState } from "../context/AppContext";
import { CalendarUnit } from "../data/CalendarUnit";
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

export const getWeekLabels = (): string[] => {
  return Array.from(Array(7).keys()).map((idx) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + idx + 1);
    return d.toISOString().split("T")[0];
  });
};

export const addDays = (date: Date, days: number): Date => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonth = (date: Date, amount: number): Date => {
  return new Date(date.setMonth(date.getMonth() + amount));
};

export const addYear = (date: Date, amount: number): Date => {
  return new Date(date.setFullYear(date.getFullYear() + amount));
};

export const getLabelFromDate = (unit: CalendarUnit, date: Date) => {
  if (!date) {
    return "This Week";
  }

  switch (unit) {
    case CalendarUnit.WEEK:
      return `${date.toLocaleString("default", {
        day: "2-digit",
      })}-${date.toLocaleString("default", { month: "short" })}`;
    case CalendarUnit.MONTH:
      return `${date.toLocaleString("default", {
        month: "long",
      })}-${date.getFullYear()}`;
    case CalendarUnit.YEAR:
      return String(date.getFullYear());
    default:
      throw new Error("Invalid CalendarUnit");
  }
};
