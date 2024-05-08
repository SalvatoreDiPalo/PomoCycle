import { Grid, SelectChangeEvent } from "@mui/material";
import { useCallback, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { CalendarUnit } from "../../../data/CalendarUnit";
import TimeSelector from "./TimeSelector";
import UnitSelector from "./UnitSelector";
import { usePeriodSelector } from "../../../hooks/usePeriodSelector";
import { useChartData } from "../../../hooks/useChartData";

export default function TimeChart({ isOpen }: { isOpen: boolean }) {
  const [calendarUnit, setCalendarUnit] = useState<CalendarUnit>(
    CalendarUnit.WEEK
  );

  const { chosenPeriod, changePeriod, resetPeriod } = usePeriodSelector(
    new Date(),
    calendarUnit
  );
  const { chartSeries, axisConfig } = useChartData(
    calendarUnit,
    chosenPeriod.date,
    isOpen
  );

  const handleCalendarUnitChange = useCallback((event: SelectChangeEvent) => {
    setCalendarUnit(event.target.value as CalendarUnit);
    resetPeriod(event.target.value as CalendarUnit);
  }, []);

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
