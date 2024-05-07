import { Grid, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import {
  GetPomoMonthReport,
  GetPomoWeekReport,
  GetPomoYearReport,
} from "../../../../wailsjs/go/backend/App";
import { TimerLabel } from "../../../data/TimerLabel";
import { BarChart } from "@mui/x-charts/BarChart";
import { AxisConfig, BarSeriesType } from "@mui/x-charts";
import { MakeOptional } from "@mui/x-charts/models/helpers";
import {
  getChartBarByActivity,
  getLabelFromDate,
  getLabelsByCalendarUnit,
} from "../../../util/Utils";
import { CalendarUnit } from "../../../data/CalendarUnit";
import { store } from "../../../../wailsjs/go/models";
import { addDays, addMonths, addYears } from "date-fns";
import { formatISO, parseISO, getWeek, getMonth, parse } from "date-fns";
import TimeSelector from "./TimeSelector";
import UnitSelector from "./UnitSelector";

export default function TimeChart({ isOpen }: { isOpen: boolean }) {
  const [calendarUnit, setCalendarUnit] = useState<string>(CalendarUnit.WEEK);

  const [chosenPeriod, setChosenPeriod] = useState({
    date: new Date(),
    label: getLabelFromDate(CalendarUnit.WEEK),
  });

  const handleCalendarUnitChange = (event: SelectChangeEvent) => {
    setCalendarUnit(event.target.value as string);
    setChosenPeriod({
      date: new Date(),
      label: getLabelFromDate(event.target.value as CalendarUnit),
    });
  };

  const [chartSeries, setChartSeries] = useState<
    MakeOptional<BarSeriesType, "type">[]
  >([]);

  const [axisConfig, setAxisConfig] = useState<
    MakeOptional<AxisConfig, "id">[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const labels = getLabelsByCalendarUnit(
        calendarUnit as CalendarUnit,
        chosenPeriod.date
      );
      let objects: MakeOptional<BarSeriesType, "type">[] =
        getChartBarByActivity();
      let reportPromise: Promise<PomoReport[]>;

      const formattedDate = formatISO(chosenPeriod.date);
      switch (calendarUnit as CalendarUnit) {
        case CalendarUnit.WEEK:
          reportPromise = GetPomoWeekReport(formattedDate);
          break;
        case CalendarUnit.MONTH:
          reportPromise = GetPomoMonthReport(formattedDate);
          break;
        case CalendarUnit.YEAR:
          reportPromise = GetPomoYearReport(formattedDate);
          break;
        default:
          reportPromise = Promise.reject(new Error("Invalid calendar unit"));
      }

      try {
        let response = await reportPromise;

        if (!response || response.length % 3 !== 0) {
          response = [];
        }

        const responseLookup: ResponseByDate = {};

        for (let item of response) {
          let date;
          switch (calendarUnit as CalendarUnit) {
            case CalendarUnit.WEEK:
              date = item.timestamp.split("T")[0];
              break;
            case CalendarUnit.MONTH:
              date = item.week!;
              break;
            case CalendarUnit.YEAR:
              date = item.month!;
              break;
          }

          if (!responseLookup[date]) {
            responseLookup[date] = {};
          }
          responseLookup[date][item.stage] = item;
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

          let focusTime =
            responseLookup[date] && responseLookup[date][TimerLabel.FOCUS_TIME];
          let longTime =
            responseLookup[date] && responseLookup[date][TimerLabel.LONG_BREAK];
          let shortTime =
            responseLookup[date] &&
            responseLookup[date][TimerLabel.SHORT_BREAK];

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
        setAxisConfig([{ scaleType: "band", data: labels }]);
        setChartSeries(objects);
      }
    };

    fetchData();
  }, [isOpen, chosenPeriod.date]);

  const changePeriod = (amount: number) => {
    let currentDate = new Date(chosenPeriod.date);

    switch (calendarUnit) {
      case CalendarUnit.WEEK:
        currentDate = addDays(currentDate, 7 * amount);
        break;
      case CalendarUnit.MONTH:
        currentDate = addMonths(currentDate, amount);
        break;
      case CalendarUnit.YEAR:
        currentDate = addYears(currentDate, amount);
        break;
      default:
        throw new Error("Invalid CalendarUnit");
    }
    setChosenPeriod({
      label: getLabelFromDate(calendarUnit, currentDate),
      date: currentDate,
    });
  };

  return (
    <>
      <Grid item xs={12} marginTop={2}>
        <UnitSelector
          unit={calendarUnit}
          handleCalendarUnitChange={handleCalendarUnitChange}
        />
      </Grid>
      <Grid item xs={12} marginTop={2}>
        <TimeSelector label={chosenPeriod.label} changePeriod={changePeriod} />
      </Grid>
      <Grid item xs={12} marginTop={2}>
        <BarChart
          slotProps={{
            legend: { hidden: true },
            popper: {
              placement: "auto",
            },
          }}
          xAxis={axisConfig}
          series={chartSeries}
          width={300}
          height={300}
        />
      </Grid>
    </>
  );
}

interface ResponseByDate {
  [date: string]: {
    [label: string]: store.SessionDbRow;
  };
}

interface PomoReport extends store.SessionDbRow {
  week?: number;
  month?: number;
}
