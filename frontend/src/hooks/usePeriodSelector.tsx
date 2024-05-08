import { useCallback, useState } from "react";
import { CalendarUnit } from "../data/CalendarUnit";
import { getLabelFromDate } from "../util/Utils";
import { addDays, addMonths, addYears } from "date-fns";

export const usePeriodSelector = (
  initialDate: Date,
  calendarUnit: CalendarUnit
) => {
  const [chosenPeriod, setChosenPeriod] = useState({
    date: initialDate,
    label: getLabelFromDate(CalendarUnit.WEEK),
  });

  const changePeriod = useCallback(
    (amount: number) => {
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
    },
    [calendarUnit, chosenPeriod.date]
  );

  const resetPeriod = (unit: CalendarUnit) => {
    const newDate = new Date();
    setChosenPeriod({
      label: getLabelFromDate(unit, newDate),
      date: newDate,
    });
  };

  return { chosenPeriod, changePeriod, resetPeriod };
};
