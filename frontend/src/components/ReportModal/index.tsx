import {
  Box,
  BoxProps,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  PaperProps,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useEffect, useState } from "react";
import { GetPomos } from "../../../wailsjs/go/backend/App";
import { model } from "../../../wailsjs/go/models";
import Digit from "../Digit";
import { TimerLabel } from "../../data/TimerLabel";

export default function ReportModal({
  isOpen,
  handleClose,
}: {
  isOpen: boolean;
  handleClose: () => void;
}) {
  const [age, setAge] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  const [timeFocussed, setTimeFocussed] = useState({
    minutes: 0,
    hours: 0,
  });
  const [dayStreak, setDayStreak] = useState<number>(0);
  const [daysAccessed, setDaysAccessed] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    GetPomos(TimerLabel.FOCUS_TIME)
      .then((response) => {
        console.log("Pomos ", response);
        let secondsFocussed = 0;
        let streak = 0;
        const totalDays = response.filter(
          (pomo: model.SessionDbRow, i: number, self: model.SessionDbRow[]) =>
            self.findIndex(
              (d: model.SessionDbRow) =>
                new Date(d.timestamp).setUTCHours(0, 0, 0, 0) ===
                new Date(pomo.timestamp).setUTCHours(0, 0, 0, 0)
            ) === i
        ).length;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        response.reverse().forEach((pomo: model.SessionDbRow) => {
          secondsFocussed += pomo.total_seconds - pomo.seconds_left;
          const pomoTimestamp = new Date(pomo.timestamp);
          pomoTimestamp.setUTCHours(0, 0, 0, 0);
          if (today.getTime() - pomoTimestamp.getTime() === streak * 86400000) {
            streak++;
          }
        });
        setTimeFocussed({
          minutes: Math.floor((secondsFocussed % 3600) / 60),
          hours: Math.floor(secondsFocussed / 3600),
        });
        setDayStreak(streak);
        setDaysAccessed(totalDays);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={handleClose} scroll="paper" fullWidth>
      <DialogTitle>
        <Typography variant="button">Report</Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Grid container spacing={1} rowSpacing={1}>
          <Grid item xs={6}>
            <StyledPaper elevation={3}>
              <BoxAsHeader>
                <CalendarMonthIcon />
                <Typography variant="h6">{daysAccessed}</Typography>
              </BoxAsHeader>
              <Typography variant="overline" component="p">
                Days Accessed
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={6}>
            <StyledPaper elevation={3}>
              <BoxAsHeader>
                <LocalFireDepartmentIcon />
                <Typography variant="h6">{dayStreak}</Typography>
              </BoxAsHeader>
              <Typography variant="overline" component="p">
                Day Streak
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper elevation={3}>
              <BoxAsHeader>
                <ScheduleIcon />
                <Typography variant="h6">
                  <Digit value={timeFocussed.hours} />:
                  <Digit value={timeFocussed.minutes} />
                </Typography>
              </BoxAsHeader>
              <Typography variant="overline" component="p">
                Hour Focused
              </Typography>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} marginTop={2}>
            <Box>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Age</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={age}
                  label="Age"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>

        <Stack
          direction="column"
          divider={<Divider orientation="horizontal" flexItem />}
          spacing={2}
        ></Stack>
      </DialogContent>
    </Dialog>
  );
}

const StyledPaper = styled(Paper)<PaperProps>(({ theme }) => ({
  height: 72,
  padding: 8,
  backgroundColor:
    theme.palette.mode === "light" ? "#f2f2f2" : theme.palette.background.paper,
  "> p": {
    textAlign: "right",
  },
}));

const BoxAsHeader = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  "> svg": {
    alignSelf: "center",
  },
}));
