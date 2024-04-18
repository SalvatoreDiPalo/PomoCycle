import { Box, IconButton, Slider, Stack } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { memo, useState } from "react";
import "../style.css";

interface ControlPanelProps {
  started: boolean;
  isRunning: boolean;
  volume: number;
  startTimer: () => void;
  resume: () => void;
  pause: () => void;
  onSkip: () => void;
  updateVolume: (value: number) => void;
}

const ControlPanel = memo(
  ({
    started,
    isRunning,
    volume,
    startTimer,
    resume,
    pause,
    onSkip,
    updateVolume,
  }: ControlPanelProps) => {
    const [isAudioSliderVisible, setAudioSliderVisible] =
      useState<boolean>(false);

    const handleToggleVolume = () => {
      updateVolume(volume === 0 ? 100 : 0);
    };

    const handleMouseEnter = () => {
      setAudioSliderVisible(true);
    };

    const handleMouseLeave = () => {
      setAudioSliderVisible(false);
    };

    return (
      <Stack direction="row" alignItems="center" justifyContent="center">
        <Box
          sx={{ height: 100, alignContent: "space-around" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <IconButton
            aria-label="skip-next"
            onClick={handleToggleVolume}
            size="small"
          >
            {volume > 0 ? (
              <VolumeUpIcon sx={{ fontSize: 32 }} />
            ) : (
              <VolumeOffIcon sx={{ fontSize: 32 }} />
            )}
          </IconButton>
          {isAudioSliderVisible && (
            <Slider
              className="slider"
              aria-label="Volume"
              value={volume}
              onChange={(event: Event, newValue: number | number[]) =>
                updateVolume(newValue as number)
              }
              max={100}
              min={0}
              orientation="vertical"
            />
          )}
        </Box>
        {!isRunning ? (
          <IconButton
            aria-label="play"
            onClick={() => (!started ? startTimer() : resume())}
          >
            <PlayCircleIcon sx={{ fontSize: 48 }} />
          </IconButton>
        ) : (
          <IconButton aria-label="pause" onClick={pause}>
            <PauseCircleIcon sx={{ fontSize: 48 }} />
          </IconButton>
        )}
        <IconButton aria-label="skip-next" onClick={onSkip} size="small">
          <SkipNextIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Stack>
    );
  }
);

export default ControlPanel;
