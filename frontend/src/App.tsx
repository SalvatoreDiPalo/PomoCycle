import { AppBar, Box, CssBaseline, IconButton, Toolbar } from "@mui/material";
import HomeScreen from "./pages/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";
import SettingModal from "./components/SettingModal";
import ReportModal from "./components/ReportModal";

export default function App() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  return (
    <Box sx={{ pb: 2, height: "100%" }}>
      <CssBaseline />
      <HomeScreen />
      <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={() => setReportModalOpen(true)}>
            <BarChartIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setSettingsModalOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SettingModal
        isOpen={settingsModalOpen}
        handleClose={() => setSettingsModalOpen(false)}
      />
      <ReportModal
        isOpen={reportModalOpen}
        handleClose={() => setReportModalOpen(false)}
      />
    </Box>
  );
}
