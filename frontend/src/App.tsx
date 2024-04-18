import { useMemo, useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CssBaseline,
  Paper,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import ScheduleScreen from "./pages/Schedule";
import HomeScreen from "./pages/Home";
import SettingsScreen from "./pages/Settings";

export default function App() {
  const [value, setValue] = useState(0);

  const Item = useMemo(() => {
    switch (value) {
      case 0:
        return <HomeScreen />;
      case 3:
        return <SettingsScreen />;
      case 2:
      case 1:
      default:
        return <ScheduleScreen />;
    }
  }, [value]);

  return (
    <Box sx={{ pb: 7, height: "100%" }}>
      <CssBaseline />
      {Item}
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          {/*<BottomNavigationAction label="Settings" icon={<SettingsIcon />} />*/}
          <BottomNavigationAction label="Schedule" icon={<ScheduleIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
