import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface RoundCounterProps {
  alreadyFocused: number;
  totalRounds: number;
  resetTimer: () => void;
}

export default function RoundCounter({
  alreadyFocused,
  totalRounds,
  resetTimer,
}: RoundCounterProps) {
  return (
    <Box>
      <Typography variant="h6">
        {alreadyFocused}/{totalRounds}
      </Typography>
      <Button title="Restart timer" variant="text" onClick={resetTimer}>
        Restart
      </Button>
    </Box>
  );
}
