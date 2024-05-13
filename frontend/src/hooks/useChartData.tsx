import { useEffect, useState } from "react";
import { CalendarUnit } from "../data/CalendarUnit";
import {
  getChartBarByActivity,
  getLabelsByCalendarUnit,
  getTooltipLabelFromDate,
} from "../util/Utils";
import { MakeOptional } from "@mui/x-charts/models/helpers";
import { AxisConfig, BarSeriesType } from "@mui/x-charts";
import { formatISO, getMonth, getWeek, parse, parseISO } from "date-fns";
import {
  GetPomoMonthReport,
  GetPomoWeekReport,
  GetPomoYearReport,
} from "../../wailsjs/go/backend/App";
import { TimerLabel } from "../data/TimerLabel";
import { store } from "../../wailsjs/go/models";

export const useChartData = (
  calendarUnit: CalendarUnit,
  chosenPeriodDate: Date,
  isOpen: boolean
) => {
  const [chartSeries, setChartSeries] = useState<
    MakeOptional<BarSeriesType, "type">[]
  >([]);
  const [axisConfig, setAxisConfig] = useState<
    MakeOptional<AxisConfig, "id">[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const labels = getLabelsByCalendarUnit(calendarUnit, chosenPeriodDate);
      let objects: MakeOptional<BarSeriesType, "type">[] =
        getChartBarByActivity();
      let reportPromise: Promise<store.ResponseByDate> = getReportPromise(
        calendarUnit,
        chosenPeriodDate
      );

      try {
        let response = await reportPromise;
        console.log("Response", response);
        if (!response) {
          response = {} as store.ResponseByDate;
        }

        for (let label of labels) {
          let index = labels.indexOf(label);
          let date;
          switch (calendarUnit) {
            case CalendarUnit.MONTH:
              const parsedWeekDate = parseISO(label);
              date = getWeek(parsedWeekDate);
              break;
            case CalendarUnit.YEAR:
              const parsedMonthDate = parse(label, "MMMM yyyy", new Date());
              date = getMonth(parsedMonthDate) + 1;
              break;
            case CalendarUnit.WEEK:
            default:
              date = label;
              break;
          }

          //TODO fix dates
          const innerWrapper = response.item[date];
          let focusTime =
            innerWrapper && innerWrapper.innerWrapper[TimerLabel.FOCUS_TIME];
          let longTime =
            innerWrapper && innerWrapper.innerWrapper[TimerLabel.LONG_BREAK];
          let shortTime =
            innerWrapper && innerWrapper.innerWrapper[TimerLabel.SHORT_BREAK];

          objects[0].data![index] = focusTime
            ? (focusTime.total_seconds - focusTime.seconds_left) / 3600
            : 0;
          objects[1].data![index] = longTime
            ? (longTime.total_seconds - longTime.seconds_left) / 3600
            : 0;
          objects[2].data![index] = shortTime
            ? (shortTime.total_seconds - shortTime.seconds_left) / 3600
            : 0;
        }
      } catch (error) {
        console.error(error);
      } finally {
        setAxisConfig([
          {
            scaleType: "band",
            data: labels,
            valueFormatter: (date: Date) =>
              getTooltipLabelFromDate(calendarUnit, date),
          },
        ]);
        console.log("Objects", objects);
        setChartSeries(objects);
      }
    };

    fetchData();
  }, [calendarUnit, chosenPeriodDate, isOpen]);

  return { chartSeries, axisConfig };
};

const getReportPromise = (
  calendarUnit: CalendarUnit,
  chosenPeriodDate: Date
): Promise<store.ResponseByDate> => {
  const formattedDate = formatISO(chosenPeriodDate);
  switch (calendarUnit) {
    case CalendarUnit.WEEK:
      return GetPomoWeekReport(formattedDate);
    case CalendarUnit.MONTH:
      return GetPomoMonthReport(formattedDate);
    case CalendarUnit.YEAR:
      return GetPomoYearReport(formattedDate);
    default:
      throw new Error("Invalid calendar unit");
  }
};
