import { AlarmSound } from "../AlarmSound";
import { AudioProps } from "./AudioProps";

export type AudioPaths = {
  [key in AlarmSound]: AudioProps;
};
