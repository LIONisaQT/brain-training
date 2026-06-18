import "./CountDown.scss";
import NumberCanvas from "../quick-math/NumberCanvas";
import { getCountdownConfig } from "./count-down-utils";
import { useEffect, useRef, useState } from "react";

const COVER_DELAY_MS = 500;
const MAX_INCORRECT_ATTEMPTS = 3;
const ROUNDS = 10;

function CountDown() {
  const [{ startingNumber, subtractor, rounds }] = useState(() =>
    getCountdownConfig(ROUNDS),
  );
  const [numbers, setNumbers] = useState<number[]>([startingNumber]);
  const [isCovered, setIsCovered] = useState(false);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const coverTimerRef = useRef<number | null>(null);

  const currentValue = numbers[numbers.length - 1];
  const isQuizComplete = numbers.length - 1 >= rounds;

  const clearCoverTimer = () => {
    if (coverTimerRef.current !== null) {
      window.clearTimeout(coverTimerRef.current);
      coverTimerRef.current = null;
    }
  };

  const scheduleCover = () => {
    clearCoverTimer();
    coverTimerRef.current = window.setTimeout(() => {
      setIsCovered(true);
      coverTimerRef.current = null;
    }, COVER_DELAY_MS);
  };

  const onSubmit = (num: number) => {
    const isCorrect = currentValue - subtractor === num;
    if (isCorrect) {
      setNumbers((prev) => [...prev, num]);
      setIncorrectCount(0);
      setIsCovered(false);
      scheduleCover();
      return;
    }

    setIncorrectCount((count) => {
      const nextCount = count + 1;
      if (nextCount >= MAX_INCORRECT_ATTEMPTS) {
        clearCoverTimer();
        setIsCovered(false);
      }
      return nextCount;
    });
  };

  useEffect(() => {
    return () => {
      clearCoverTimer();
    };
  }, []);

  return (
    <>
      <section className="prompt">
        <p>Keep subtracting the number {subtractor}.</p>
        {numbers.length > 1 && (
          <p>
            {Math.min(incorrectCount, MAX_INCORRECT_ATTEMPTS)}/
            {MAX_INCORRECT_ATTEMPTS} incorrect until reveal.
          </p>
        )}
      </section>
      <section className="numbers">
        <div
          className="numbers-list"
          style={{
            transform: `translateY(calc(-${numbers.length - 1} * var(--countdown-item-height)))`,
          }}
        >
          {numbers.map((value, index) => (
            <p key={`${value}-${index}`} className="number-item">
              {value}
            </p>
          ))}
        </div>
        <div className={`number-cover${isCovered ? " visible" : ""}`} />
      </section>
      <NumberCanvas onSubmit={onSubmit} isComplete={isQuizComplete} />
    </>
  );
}

export default CountDown;
