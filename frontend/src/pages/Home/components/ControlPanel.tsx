import { Box, IconButton, Slider, Stack } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { memo, useContext, useState } from "react";
import "../style.css";
import { AppContext } from "../../../context/AppContext";
import { Operation } from "../../../data/Operation";
import { AddActivity } from "../../../util/Utils";

interface ControlPanelProps {
  sessionId: number;
  started: boolean;
  isRunning: boolean;
  volume: number;
  startTimer: () => void;
  resume: () => void;
  pause: () => void;
  onSkip: () => void;
  audio: HTMLAudioElement | undefined;
}

const ControlPanel = memo(
  ({
    sessionId,
    started,
    isRunning,
    volume,
    startTimer,
    resume,
    pause,
    onSkip,
    audio,
  }: ControlPanelProps) => {
    const [isAudioSliderVisible, setAudioSliderVisible] =
      useState<boolean>(false);
    const { updateVolume } = useContext(AppContext)!;

    const handleToggleVolume = () => {
      updateVolume(volume === 0 ? 100 : 0);
    };

    const handleMouseEnter = () => {
      setAudioSliderVisible(true);
    };

    const handleMouseLeave = () => {
      setAudioSliderVisible(false);
    };

    const onPause = () => {
      AddActivity(sessionId, Operation.PAUSE, pause);
    };

    const onResume = () => {
      AddActivity(sessionId, Operation.PAUSE, resume);
    };

    const handleUpdateVolume = (value: number) => {
      if (audio) {
        audio.volume = value / 100;
      }

      updateVolume(value);
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
                handleUpdateVolume(newValue as number)
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
            onClick={() => (!started ? startTimer() : onResume())}
          >
            <PlayCircleIcon sx={{ fontSize: 48 }} />
          </IconButton>
        ) : (
          <IconButton aria-label="pause" onClick={onPause}>
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
