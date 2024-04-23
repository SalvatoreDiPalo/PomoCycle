import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useEffect, useState } from "react";
import { GetPomoWeekReport } from "../../../../wailsjs/go/backend/App";
import { TimerLabel } from "../../../data/TimerLabel";
import { BarChart } from "@mui/x-charts/BarChart";
import { AxisConfig, BarSeriesType } from "@mui/x-charts";
import { MakeOptional } from "@mui/x-charts/models/helpers";
import {
  addDays,
  addMonth,
  addYear,
  getLabelFromDate,
  getWeekLabels,
} from "../../../util/Utils";
import { CalendarUnit } from "../../../data/CalendarUnit";

export default function TimeChart({ isOpen }: { isOpen: boolean }) {
  const [calendarUnit, setCalendarUnit] = useState<string>(CalendarUnit.WEEK);

  const [chosenPeriod, setChosenPeriod] = useState({
    date: new Date(),
    label: "This Week",
  });

  const handleCalendarUnitChange = (event: SelectChangeEvent) => {
    setCalendarUnit(event.target.value as string);
    setChosenPeriod({
      date: new Date(),
      label: getLabelFromDate(event.target.value as CalendarUnit, new Date()),
    });
  };

  const [weekData, setWeekData] = useState<
    MakeOptional<BarSeriesType, "type">[]
  >([]);

  const [axisConfig, setAxisConfig] = useState<
    MakeOptional<AxisConfig, "id">[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;
    GetPomoWeekReport(new Date().toISOString())
      .then((response) => {
        if (response.length % 3 !== 0) return;
        let objects: MakeOptional<BarSeriesType, "type">[] = [
          {
            data: [],
            label: TimerLabel.FOCUS_TIME,
          },
          {
            data: [],
            label: TimerLabel.LONG_BREAK,
          },
          {
            data: [],
            label: TimerLabel.SHORT_BREAK,
          },
        ];
        for (let i = 0; i < response.length; i += 3) {
          let focusTime = response[i];
          let longTime = response[i + 1];
          let shortTime = response[i + 2];
          objects[0].data!.push(
            (focusTime.total_seconds - focusTime.seconds_left) / 3600
          );
          objects[1].data!.push(
            (longTime.total_seconds - longTime.seconds_left) / 3600
          );
          objects[2].data!.push(
            (shortTime.total_seconds - shortTime.seconds_left) / 3600
          );
        }
        setAxisConfig((prevValue) => [
          ...prevValue,
          {
            scaleType: "band",
            data: getWeekLabels(),
          },
        ]);
        setWeekData(objects);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isOpen]);

  const changePeriod = (amount: number) => {
    let currentDate = chosenPeriod.date;

    switch (calendarUnit) {
      case CalendarUnit.WEEK:
        currentDate = addDays(currentDate, 7 * amount);
        break;
      case CalendarUnit.MONTH:
        currentDate = addMonth(currentDate, amount);
        break;
      case CalendarUnit.YEAR:
        currentDate = addYear(currentDate, amount);
        break;
      default:
        throw new Error("Invalid CalendarUnit");
    }

    setChosenPeriod({
      label: getLabelFromDate(calendarUnit, currentDate),
      date: currentDate,
    });
  };

  const previousPeriod = () => {
    changePeriod(-1);
  };

  const addPeriod = () => {
    changePeriod(1);
  };

  return (
    <>
      <Grid item xs={12} marginTop={2}>
        <Box>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Calendar Unit</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={calendarUnit}
              label="Calendar Unit"
              onChange={handleCalendarUnitChange}
            >
              <MenuItem value={CalendarUnit.WEEK}>{CalendarUnit.WEEK}</MenuItem>
              <MenuItem value={CalendarUnit.MONTH}>
                {CalendarUnit.MONTH}
              </MenuItem>
              <MenuItem value={CalendarUnit.YEAR}>{CalendarUnit.YEAR}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Grid>
      <Grid item xs={12} marginTop={2}>
        <ButtonGroup variant="contained" aria-label="Basic button group">
          <Button onClick={previousPeriod}>
            <ArrowLeftIcon />
          </Button>
          <Button disabled>{chosenPeriod.label}</Button>
          <Button onClick={addPeriod}>
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={12} marginTop={2}>
        <BarChart
          xAxis={axisConfig}
          series={weekData}
          width={300}
          height={300}
        />
      </Grid>
    </>
  );
}
