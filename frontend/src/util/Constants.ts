import { AlarmSound } from "../data/AlarmSound";
import doubleBell from "../assets/double-bell.mp3";

export const TIMEOUT: number = 1500;

type AudioPaths = {
  [key in AlarmSound]: string;
};

export const audioPaths: AudioPaths = {
  [AlarmSound.DOUBLE_BELL]: doubleBell,
  [AlarmSound.SINGLE_BELL]: doubleBell,
  [AlarmSound.BEEP]: doubleBell,
};
