import { getDigit } from "../../util/Utils";

export default function Digit({ value }: { value: number }) {
  const { leftDigit, rightDigit } = getDigit(value);
  return (
    <>
      {leftDigit}
      {rightDigit}
    </>
  );
}
