import { AppState } from "../context/AppContext";
import { CalendarUnit } from "../data/CalendarUnit";
import { TimerLabel } from "../data/TimerLabel";
import {
  startOfISOWeek,
  startOfMonth,
  startOfYear,
  lastDayOfISOWeek,
  lastDayOfMonth,
  lastDayOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  formatISO,
  format,
  getYear,
} from "date-fns";
import { AddActivityFromPomo } from "../../wailsjs/go/backend/App";
import { LogDebug, LogError } from "../../wailsjs/runtime/runtime";
import { MakeOptional } from "@mui/x-charts/models/helpers";
import { BarSeriesType } from "@mui/x-charts";

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

export const getLabelFromDate = (
  unit: CalendarUnit,
  date: Date = new Date()
) => {
  switch (unit) {
    case CalendarUnit.WEEK:
      const firstDayOfWeek = formatISO(startOfISOWeek(date), {
        representation: "date",
      });
      const lastDayOfWeek = formatISO(lastDayOfISOWeek(date), {
        representation: "date",
      });
      return `${firstDayOfWeek} <|> ${lastDayOfWeek}`;
    case CalendarUnit.MONTH:
      return `${format(date, "MMMM")}-${getYear(date)}`;
    case CalendarUnit.YEAR:
      return String(getYear(date));
    default:
      throw new Error("Invalid CalendarUnit");
  }
};

export const AddActivity = async (
  sessionId: number,
  operation: number,
  onSuccess: () => void
) => {
  try {
    const activityId = await AddActivityFromPomo({
      operation,
      session_id: sessionId,
      timestamp: formatISO(new Date()),
    });
    console.log("Activity id", activityId);
    LogDebug("Added activity");
    onSuccess();
  } catch (err) {
    console.error("Error while adding activity", err);
    LogError("Error while adding activity");
  }
};

export const getChartBarByActivity = (): MakeOptional<
  BarSeriesType,
  "type"
>[] => {
  return [
    {
      data: [],
      label: TimerLabel.FOCUS_TIME,
      valueFormatter: (value: number | null) => getBarTime(value ?? 0),
    },
    {
      data: [],
      label: TimerLabel.LONG_BREAK,
      valueFormatter: (value: number | null) => getBarTime(value ?? 0),
    },
    {
      data: [],
      label: TimerLabel.SHORT_BREAK,
      valueFormatter: (value: number | null) => getBarTime(value ?? 0),
    },
  ];
};

export const getLabelsByCalendarUnit = (
  unit: CalendarUnit,
  date: Date
): string[] => {
  switch (unit) {
    case CalendarUnit.WEEK:
      return getWeekLabels(date);
    case CalendarUnit.MONTH:
      return getMonthLabels(date);
    case CalendarUnit.YEAR:
      return getYearLabels(date);
    default:
      throw new Error("Invalid CalendarUnit");
  }
};

export const getDigit = (value: number) => {
  const stringValue = value.toString().padStart(2, "0");
  const leftDigit = stringValue[0];
  const rightDigit = stringValue[1];

  return { leftDigit, rightDigit };
};

export const getDoubleDigit = (hours: number, minutes: number) => {
  const minutesDigits = getDigit(minutes);
  const hoursDigits = getDigit(hours);
  return `${hoursDigits.leftDigit}${hoursDigits.rightDigit}:${minutesDigits.leftDigit}${minutesDigits.rightDigit}`;
};

const getBarTime = (value: number) => {
  const minutes = Math.floor(((value * 3600) % 3600) / 60);
  const minutesDigits = getDigit(minutes);
  const hours = Math.floor((value * 3600) / 3600);
  const hoursDigits = getDigit(hours);
  return `${hoursDigits.leftDigit}${hoursDigits.rightDigit}:${minutesDigits.leftDigit}${minutesDigits.rightDigit}`;
};

const getYearLabels = (date: Date): string[] => {
  const firstDayOfYear = startOfYear(date);
  const lastDayYear = lastDayOfYear(date);
  return eachMonthOfInterval({
    start: firstDayOfYear,
    end: lastDayYear,
  }).map((interval) => format(interval, "MMMM yyyy"));
};

const getMonthLabels = (date: Date): string[] => {
  const firstDayOfMonth = startOfMonth(date);
  const lastDayMonth = lastDayOfMonth(date);
  return eachWeekOfInterval(
    {
      start: firstDayOfMonth,
      end: lastDayMonth,
    },
    { weekStartsOn: 1 }
  ).map((interval) => formatISO(interval, { representation: "date" }));
};

const getWeekLabels = (date: Date): string[] => {
  const firstDayOfWeek = startOfISOWeek(date);
  const lastDayOfWeek = lastDayOfISOWeek(date);
  return eachDayOfInterval({
    start: firstDayOfWeek,
    end: lastDayOfWeek,
  }).map((interval) => formatISO(interval, { representation: "date" }));
};
