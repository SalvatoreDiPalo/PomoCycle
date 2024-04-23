import {
  Box,
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
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useState } from "react";

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
            <Paper className="report-box" elevation={3}>
              <Box className="report-box-header">
                <CalendarMonthIcon />
                <Typography variant="overline">1</Typography>
              </Box>
              <Typography variant="overline" component="p">
                Days Accessed
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className="report-box" elevation={3}>
              <Box className="report-box-header">
                <LocalFireDepartmentIcon />
                <Typography variant="overline">1</Typography>
              </Box>
              <Typography variant="overline" component="p">
                Day Streak
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className="report-box" elevation={3}>
              <Box className="report-box-header">
                <ScheduleIcon />
                <Typography variant="overline">1</Typography>
              </Box>
              <Typography variant="overline" component="p">
                Hour Focused
              </Typography>
            </Paper>
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
