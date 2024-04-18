export default function Digit({ value }: { value: number }) {
  const leftDigit = value >= 10 ? value.toString()[0] : "0";
  const rightDigit = value >= 10 ? value.toString()[1] : value.toString();
  return (
    <>
      {leftDigit}
      {rightDigit}
    </>
  );
}
