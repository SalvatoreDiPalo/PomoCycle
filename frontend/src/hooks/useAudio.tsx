import { useContext, useEffect, useState } from "react";
import { audioPaths } from "../util/Constants";
import { AppContext } from "../context/AppContext";
import { AdjustVolumeProps } from "../data/audio/AdjustVolumeProps";
import { useSnackbarWithAction } from "./useSnackbarWithAction";
import { AlarmSound } from "../data/AlarmSound";

function useAudio() {
  const [audio, setAudio] = useState<AudioState>();
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const { appState } = useContext(AppContext)!;
  const handleClickWithAction = useSnackbarWithAction();

  useEffect(() => {
    const sound = appState.alarmSound as AlarmSound;
    const path = audioPaths[sound];
    const audioObject = new Audio(path.audio);
    audioObject.volume = appState.volume / 100;
    audioObject.load();
    setAudio({
      element: audioObject,
      path: path.volumeProps,
    });
  }, [appState.alarmSound, appState.volume]);

  const playAudio = () => {
    if (!audio || appState.volume === 0) {
      return;
    }
    audio.element.currentTime = 0;
    audio.element.volume = appState.volume / 100;

    if (isFadingOut) {
      return;
    }

    var playPromise = audio.element.play();
    if (playPromise !== undefined) {
      playPromise
        .then((_) => {
          setIsFadingOut(true);
          adjustVolume(audio.element, 0, audio.path).then(() => {
            setIsFadingOut(false);
          });
        })
        .catch((error) => handleClickWithAction("Error playing audio"));
    }
  };

  return { audio, playAudio };
}

export default useAudio;

interface AudioState {
  element: HTMLAudioElement;
  path: AdjustVolumeProps;
}

async function adjustVolume(
  element: HTMLMediaElement,
  newVolume: number,
  adjustVolumeProps: AdjustVolumeProps
): Promise<void> {
  const originalVolume = element.volume;
  const delta = newVolume - originalVolume;

  if (
    !delta ||
    !adjustVolumeProps.duration ||
    !adjustVolumeProps.easing ||
    !adjustVolumeProps.interval
  ) {
    element.volume = newVolume;
    return Promise.resolve();
  }

  const ticks = Math.floor(
    adjustVolumeProps.duration / adjustVolumeProps.interval
  );
  let tick = 1;

  return new Promise((resolve) => {
    const timer = setInterval(() => {
      element.volume =
        originalVolume + adjustVolumeProps.easing(tick / ticks) * delta;

      if (++tick === ticks + 1) {
        clearInterval(timer);
        resolve();
      }
    }, adjustVolumeProps.interval);
  });
}
