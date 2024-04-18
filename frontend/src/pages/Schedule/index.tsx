import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import Button from "@mui/material/Button";
import { AppContext } from "../../context/AppContext";
import { TimerLabel } from "../../data/TimerLabel";
import Digit from "../../components/Digit";

export default function ScheduleScreen() {
  const { appState, incrementTime, resetTime } = useContext(AppContext)!;

  const handleChange = (field: string, newValue: number | number[]) => {
    console.log("HandleChange", field, newValue);
    if (typeof newValue === "number") {
      incrementTime(field, newValue);
    }
  };

  return (
    <Stack spacing={5} justifyContent="space-between" sx={{ p: 4 }}>
      <Box>
        <Typography id="non-linear-slider" gutterBottom>
          {TimerLabel.FOCUS_TIME}: <Digit value={appState.focusTime} />:
          <Digit value={0} />
        </Typography>
        <Slider
          value={appState.focusTime}
          defaultValue={appState.focusTime}
          getAriaValueText={() => String(appState.focusTime)}
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={90}
          color="error"
          onChange={(
            event: Event,
            value: number | number[],
            activeThumb: number
          ) => handleChange("focusTime", value)}
          aria-labelledby="non-linear-slider"
        />
      </Box>
      <Box>
        <Typography id="non-linear-slider" gutterBottom>
          {TimerLabel.SHORT_BREAK}: <Digit value={appState.shortBreakTime} />:
          <Digit value={0} />
        </Typography>
        <Slider
          value={appState.shortBreakTime}
          defaultValue={appState.shortBreakTime}
          getAriaValueText={() => String(appState.shortBreakTime)}
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={90}
          color="warning"
          onChange={(
            event: Event,
            value: number | number[],
            activeThumb: number
          ) => handleChange("shortBreakTime", value)}
          aria-labelledby="non-linear-slider"
        />
      </Box>
      <Box>
        <Typography id="non-linear-slider" gutterBottom>
          {TimerLabel.LONG_BREAK}: <Digit value={appState.longBreakTime} />:
          <Digit value={0} />
        </Typography>
        <Slider
          value={appState.longBreakTime}
          defaultValue={appState.longBreakTime}
          getAriaValueText={() => String(appState.longBreakTime)}
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={90}
          color="secondary"
          onChange={(
            event: Event,
            value: number | number[],
            activeThumb: number
          ) => handleChange("longBreakTime", value)}
          aria-labelledby="non-linear-slider"
        />
      </Box>
      <Box>
        <Typography id="non-linear-slider" gutterBottom>
          ROUNDS: {appState.rounds}
        </Typography>
        <Slider
          value={appState.rounds}
          defaultValue={appState.rounds}
          getAriaValueText={() => String(appState.rounds)}
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={10}
          color="success"
          onChange={(
            event: Event,
            value: number | number[],
            activeThumb: number
          ) => handleChange("rounds", value)}
          aria-labelledby="non-linear-slider"
        />
      </Box>
      <Box>
        <Button variant="text" onClick={resetTime}>
          Reset
        </Button>
      </Box>
    </Stack>
  );
}
