import { Button, ButtonGroup } from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

interface TimeSelectorProps {
  label: string;
  changePeriod: (amout: number) => void;
}

export default function TimeSelector({
  label,
  changePeriod,
}: TimeSelectorProps) {
  const previousPeriod = () => {
    changePeriod(-1);
  };

  const addPeriod = () => {
    changePeriod(1);
  };

  return (
    <ButtonGroup variant="contained" aria-label="Previous Button">
      <Button title="Reduce date" onClick={previousPeriod}>
        <ArrowLeftIcon />
      </Button>
      <Button disabled>{label}</Button>
      <Button
        title="Increase date"
        onClick={addPeriod}
        aria-label="Next Button"
      >
        <ArrowRightIcon />
      </Button>
    </ButtonGroup>
  );
}
