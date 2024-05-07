import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { CalendarUnit } from "../../../../data/CalendarUnit";

interface UnitSelectorProps {
  unit: string;
  handleCalendarUnitChange: (event: SelectChangeEvent) => void;
}

export default function UnitSelector({
  unit,
  handleCalendarUnitChange,
}: UnitSelectorProps) {
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="calendar-unit-select-label">Calendar Unit</InputLabel>
        <Select
          labelId="calendar-unit-select-label"
          id="calendar-unit-select"
          value={unit}
          label="Calendar Unit"
          onChange={handleCalendarUnitChange}
        >
          <MenuItem value={CalendarUnit.WEEK}>{CalendarUnit.WEEK}</MenuItem>
          <MenuItem value={CalendarUnit.MONTH}>{CalendarUnit.MONTH}</MenuItem>
          <MenuItem value={CalendarUnit.YEAR}>{CalendarUnit.YEAR}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
