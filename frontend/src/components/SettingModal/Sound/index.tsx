import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import { AlarmSound } from "../../../data/AlarmSound";
import { AppContext } from "../../../context/AppContext";

export default function Sound() {
  const { appState, changeAlarmSound } = useContext(AppContext)!;

  const handleChange = (event: SelectChangeEvent) => {
    changeAlarmSound(event.target.value as AlarmSound);
  };
  return (
    <Box>
      <Typography variant="h5" gutterBottom align="left">
        Sound
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <InputLabel
          id="sound-select-label"
          sx={{ alignItems: "center", display: "flex" }}
        >
          Alarm Sound:
        </InputLabel>
        <FormControl>
          <Select
            labelId="sound-select-label"
            id="sound-select"
            value={appState.alarmSound}
            onChange={handleChange}
          >
            {Object.values(AlarmSound).map((alarm) => (
              <MenuItem key={alarm} value={alarm}>
                {alarm}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
