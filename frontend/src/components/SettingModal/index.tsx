import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import TimerSettings from "./TimerSettings";
import Sound from "./Sound";
import ThemeSwitch from "./ThemeSwitch";
import CloseIcon from "@mui/icons-material/Close";

export default function SettingModal({
  isOpen,
  handleClose,
}: {
  isOpen: boolean;
  handleClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onClose={handleClose} scroll="paper" fullWidth>
      <DialogTitle>
        <Typography variant="button">Setting</Typography>
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
        <Stack
          direction="column"
          divider={<Divider orientation="horizontal" flexItem />}
          spacing={2}
        >
          <TimerSettings />
          <Sound />
          <ThemeSwitch />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
