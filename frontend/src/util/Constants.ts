import { AlarmSound } from "../data/AlarmSound";
import doubleBell from "../assets/double-bell.mp3";
import upgrade from "../assets/upgrade.mp3";
import selection from "../assets/selection.mp3";
import { swing } from "./Utils";
import { AudioPaths } from "../data/audio/AudioPaths";

export const TIMEOUT: number = 1500;

export const audioPaths: AudioPaths = {
  [AlarmSound.DOUBLE_BELL]: {
    audio: doubleBell,
    volumeProps: {
      duration: 2000,
      easing: swing,
      interval: 50,
    },
  },
  [AlarmSound.UPGRADE]: {
    audio: upgrade,
    volumeProps: {
      duration: 2000,
      easing: swing,
      interval: 50,
    },
  },
  [AlarmSound.SELECTION]: {
    audio: selection,
    volumeProps: {
      duration: 2000,
      easing: swing,
      interval: 50,
    },
  },
};
