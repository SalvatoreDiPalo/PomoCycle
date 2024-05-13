import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useEffect, useState } from "react";
import { GetDaysReport } from "../../../wailsjs/go/backend/App";
import TimeChart from "./TimeChart";
import StatusCard from "./StatusCard";
import { getDoubleDigit } from "../../util/Utils";

export default function ReportModal({
  isOpen,
  handleClose,
}: {
  isOpen: boolean;
  handleClose: () => void;
}) {
  const [timeFocussed, setTimeFocussed] = useState("00:00");
  const [dayStreak, setDayStreak] = useState<number>(0);
  const [daysAccessed, setDaysAccessed] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const response = await GetDaysReport();
        console.log("Pomos ", response);

        const minutes = Math.floor((response.secondsFocussed % 3600) / 60);
        const hours = Math.floor(response.secondsFocussed / 3600);
        setTimeFocussed(getDoubleDigit(hours, minutes));
        setDayStreak(response.daysStreak);
        setDaysAccessed(response.daysAccessed);
      } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
      }
    };

    fetchData();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={handleClose} scroll="paper" fullWidth>
      <DialogTitle>Report</DialogTitle>
      <IconButton
        title="Close"
        aria-label="close"
        onClick={handleClose}
        size="large"
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
            <StatusCard
              Icon={CalendarMonthIcon}
              label="Days Accessed"
              value={daysAccessed}
            />
          </Grid>
          <Grid item xs={6}>
            <StatusCard
              Icon={LocalFireDepartmentIcon}
              label="Day Streak"
              value={dayStreak}
            />
          </Grid>
          <Grid item xs={12}>
            <StatusCard
              Icon={ScheduleIcon}
              label="Hours Focused"
              value={timeFocussed}
            />
          </Grid>
          <TimeChart isOpen={isOpen} />
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
