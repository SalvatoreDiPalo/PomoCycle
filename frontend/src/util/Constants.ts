import { AlarmSound } from "../data/AlarmSound";
import doubleBell from "../assets/double-bell.mp3";
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
  [AlarmSound.SINGLE_BELL]: {
    audio: doubleBell,
    volumeProps: {
      duration: 2000,
      easing: swing,
      interval: 50,
    },
  },
  [AlarmSound.BEEP]: {
    audio: doubleBell,
    volumeProps: {
      duration: 2000,
      easing: swing,
      interval: 50,
    },
  },
};
