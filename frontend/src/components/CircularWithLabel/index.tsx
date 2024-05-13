import Box from "@mui/material/Box";
import CircularProgress, {
  circularProgressClasses,
} from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Digit from "../Digit";
import { memo, useCallback } from "react";
import { TimerLabel } from "../../data/TimerLabel";
import { Theme } from "@mui/material";

interface CircularWithValueLabelProps {
  max: number;
  value: number;
  minutes: number;
  seconds: number;
  label: string;
}

const normalise = (value: number, max: number) => ((max - value) / max) * 100;

const getColorByLabel = (theme: Theme, label: string): string => {
  switch (label) {
    case TimerLabel.FOCUS_TIME:
      return theme.palette.error.main;
    case TimerLabel.SHORT_BREAK:
      return theme.palette.warning.main;
    case TimerLabel.LONG_BREAK:
    default:
      return theme.palette.secondary.main;
  }
};

// Inspired by the former Facebook spinners.
const CircularWithValueLabel = memo(
  ({ max, value, minutes, seconds, label }: CircularWithValueLabelProps) => {
    const progress = normalise(value, max);
    const color = useCallback(
      (theme: Theme) => getColorByLabel(theme, label),
      [label]
    );
    return (
      <Box sx={{ position: "relative" }}>
        <CircularProgress
          variant="determinate"
          sx={{
            color: (theme) =>
              theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
          }}
          size={240}
          thickness={4}
          value={100}
        />
        <CircularProgress
          variant="determinate"
          sx={{
            color: (theme) => color(theme),
            animationDuration: "550ms",
            position: "absolute",
            left: 0,
            right: 0,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
            [`& .${circularProgressClasses.circle}`]: {
              strokeLinecap: "round",
            },
          }}
          size={240}
          thickness={4}
          value={progress}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3">
            <Digit value={minutes} />:<Digit value={seconds} />
          </Typography>
          <Typography variant="overline">{label}</Typography>
        </Box>
      </Box>
    );
  }
);

export default CircularWithValueLabel;
