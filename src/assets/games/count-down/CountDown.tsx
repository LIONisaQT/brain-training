import "./CountDown.scss";
import NumberCanvas from "../quick-math/NumberCanvas";
import { getCountdownConfig } from "./count-down-utils";
import { formatTime } from "../../../utils/useStopwatch";
import { useResponseTimer } from "../../../utils/useResponseTimer";
import { useCallback, useEffect, useRef, useState } from "react";
import EndGameModal from "../../elements/EndGameModal/EndGameModal";

const COVER_DELAY_MS = 500;
const MAX_INCORRECT_ATTEMPTS = 3;
const ROUNDS = 10;

interface CountDown {
  gameEnd: () => void;
}

function CountDown({ gameEnd }: CountDown) {
  const [config, setConfig] = useState(() => getCountdownConfig(ROUNDS));
  const { startingNumber, subtractor, rounds } = config;
  const [numbers, setNumbers] = useState<number[]>([startingNumber]);
  const [isCovered, setIsCovered] = useState(false);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const coverTimerRef = useRef<number | null>(null);
  const {
    start: startResponseTimer,
    stop: stopResponseTimer,
    reset: resetResponseTimer,
    isRunning: isResponseTimerRunning,
    totalTime,
    averageTime,
  } = useResponseTimer();

  const currentValue = numbers[numbers.length - 1];
  const isQuizComplete = numbers.length - 1 >= rounds;

  const clearCoverTimer = () => {
    if (coverTimerRef.current !== null) {
      window.clearTimeout(coverTimerRef.current);
      coverTimerRef.current = null;
    }
  };

  const resetGame = () => {
    clearCoverTimer();
    resetResponseTimer();

    const nextConfig = getCountdownConfig(ROUNDS);
    setConfig(nextConfig);
    setNumbers([nextConfig.startingNumber]);
    setIncorrectCount(0);
    setIsCovered(false);
  };

  const scheduleCover = useCallback(() => {
    clearCoverTimer();
    coverTimerRef.current = window.setTimeout(() => {
      setIsCovered(true);
      coverTimerRef.current = null;
    }, COVER_DELAY_MS);
  }, []);

  useEffect(() => {
    return () => clearCoverTimer();
  }, []);

  const onSubmit = (num: number) => {
    const isCorrect = currentValue - subtractor === num;
    if (isCorrect) {
      if (isResponseTimerRunning) {
        stopResponseTimer();
      }

      setNumbers((prev) => [...prev, num]);
      setIncorrectCount(0);
      setIsCovered(false);

      if (numbers.length < rounds) {
        startResponseTimer();
        scheduleCover();
      }
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
      {isQuizComplete && (
        <EndGameModal
          stats={[
            { statName: "Total time", statValue: formatTime(totalTime) },
            { statName: "Average time", statValue: formatTime(averageTime) },
          ]}
          hasReview={false}
          resetGame={resetGame}
          gameEnd={gameEnd}
        />
      )}
    </>
  );
}

export default CountDown;
