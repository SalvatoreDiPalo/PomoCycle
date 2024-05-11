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

/**
 * Format the label to show in the weekly/monthly/yearly date selector.
 * Weekly: 06 May - 12 May
 * Monthly: May-2024
 * Annual: 2024
 * @param unit Calendar unit chosen: Weekly, monthly or yearly
 * @param date date to format
 * @returns Date formatted using the chosen period or error in case of invalid unit
 */
export const getLabelFromDate = (
  unit: CalendarUnit,
  date: Date = new Date()
): string => {
  switch (unit) {
    case CalendarUnit.WEEK:
      const firstDayOfWeek = format(startOfISOWeek(date), "dd MMM");
      const lastDayOfWeek = format(lastDayOfISOWeek(date), "dd MMM");
      return `${firstDayOfWeek} - ${lastDayOfWeek}`;
    case CalendarUnit.MONTH:
      return `${format(date, "MMMM")}-${getYear(date)}`;
    case CalendarUnit.YEAR:
      return String(getYear(date));
    default:
      throw new Error("Invalid CalendarUnit");
  }
};

/**
 * Format the date label to show in the tooltip on the weekly/monthly/yearly chart.
 * Weekly: 06 May 2024
 * Monthly: 06 May - 12 May
 * Annual: May-2024
 * @param unit Calendar unit chosen: Weekly, monthly or yearly
 * @param date date to format
 * @returns Date formatted using the chosen period or error in case of invalid unit
 */
export const getTooltipLabelFromDate = (
  unit: CalendarUnit,
  date: Date = new Date()
): string => {
  switch (unit) {
    case CalendarUnit.WEEK:
      return format(date, "dd MMMM yyyy");
    case CalendarUnit.MONTH:
      const firstDayOfWeek = format(startOfISOWeek(date), "dd MMM");
      const lastDayOfWeek = format(lastDayOfISOWeek(date), "dd MMM");
      return `${firstDayOfWeek} - ${lastDayOfWeek}`;
    case CalendarUnit.YEAR:
      return `${format(date, "MMM")}-${getYear(date)}`;
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
    onSuccess();
  } catch (err) {
    console.error("Error while adding activity", err);
  }
};

/**
 * Returns a default object based on 3 elements per column for the "series" field of the chart
 */
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

/**
 * Returns the dates in string format based on the range of the chosen period.
 * Weekly: ["2024-05-06", "2024-05-07", "2024-05-08", "2024-05-09", "2024-05-10", "2024-05-11" , "2024-05-12"]
 * Monthly: ["2024-04-29", "2024-05-06", "2024-05-13", "2024-05-20", "2024-05-27"]
 * Annual: ["January 2024", "February 2024", "March 2024", "April 2024", "May 2024", "June 2024", "July 2024", "August 2024", "September 2024", "October 2024", "November 2024", "December 2024"]
 * @param unit Calendar unit chosen: Weekly, monthly or yearly
 * @param date starting date
 * @returns array of string dates formatted using the chosen period or error in case of invalid unit
 */
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

/**
 * Write a two-digit number value regardless of the value
 * @param value Number value to format
 * @returns Number value formatted as two digits
 */
export const getDigit = (value: number) => {
  const stringValue = value.toString().padStart(2, "0");
  const leftDigit = stringValue[0];
  const rightDigit = stringValue[1];

  return { leftDigit, rightDigit };
};

/**
 * Returns the numeric value formatted on two digits of both parameters, concatenating them with the ":" character forming a timer-like
 * @param hours Number value to format
 * @param minutes Number value to format
 * @returns Value formatted as a timer-like
 */
export const getDoubleDigit = (hours: number, minutes: number): string => {
  const minutesDigits = getDigit(minutes);
  const hoursDigits = getDigit(hours);
  return `${hoursDigits.leftDigit}${hoursDigits.rightDigit}:${minutesDigits.leftDigit}${minutesDigits.rightDigit}`;
};

export function swing(p: number) {
  return 0.5 - Math.cos(p * Math.PI) / 2;
}

const getBarTime = (value: number): string => {
  const minutes = Math.floor(((value * 3600) % 3600) / 60);
  const minutesDigits = getDigit(minutes);
  const hours = Math.floor((value * 3600) / 3600);
  const hoursDigits = getDigit(hours);
  return `${hoursDigits.leftDigit}${hoursDigits.rightDigit}:${minutesDigits.leftDigit}${minutesDigits.rightDigit}`;
};

/**
 * Returns the dates in a string formatted based on the Year period
 * ["January 2024", "February 2024", "March 2024", "April 2024", "May 2024", "June 2024", "July 2024", "August 2024", "September 2024", "October 2024", "November 2024", "December 2024"]
 * @param date starting date
 * @returns array of string dates formatted using the period Year
 */
const getYearLabels = (date: Date): string[] => {
  const firstDayOfYear = startOfYear(date);
  const lastDayYear = lastDayOfYear(date);
  return eachMonthOfInterval({
    start: firstDayOfYear,
    end: lastDayYear,
  }).map((interval) => format(interval, "MMMM yyyy"));
};

/**
 * Returns the dates in a string formatted based on the Month period
 * ["2024-04-29", "2024-05-06", "2024-05-13", "2024-05-20", "2024-05-27"]
 * @param date starting date
 * @returns array of string dates formatted using the period Month
 */
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

/**
 * Returns the dates in a string formatted based on the Week period
 * ["2024-05-06", "2024-05-07", "2024-05-08", "2024-05-09", "2024-05-10", "2024-05-11" , "2024-05-12"]
 * @param date starting date
 * @returns array of string dates formatted using the period Week
 */
const getWeekLabels = (date: Date): string[] => {
  const firstDayOfWeek = startOfISOWeek(date);
  const lastDayOfWeek = lastDayOfISOWeek(date);
  return eachDayOfInterval({
    start: firstDayOfWeek,
    end: lastDayOfWeek,
  }).map((interval) => formatISO(interval, { representation: "date" }));
};
