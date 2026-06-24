import { useCallback, useEffect, useState } from "react";
import "./HighTouch.scss";
import {
  generateNumbers,
  buildPositionedNumbers,
  type PositionedNumber,
} from "./high-touch-utils";
import Correct from "../../elements/Feedback/Correct";
import Incorrect from "../../elements/Feedback/Incorrect";
import EndGameModal from "../../elements/EndGameModal/EndGameModal";
import type { Feedback } from "../../elements/Feedback/Feedback";

const MAX_ROUNDS = 8;

interface HighTouch {
  gameEnd: () => void;
}

function HighTouch({ gameEnd }: HighTouch) {
  const [numbers, setNums] = useState<PositionedNumber[]>([]);
  const [round, setRound] = useState(1);
  const [highest, setHighest] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>({
    shouldPlay: false,
    isCorrect: false,
    position: { x: 0, y: 0 },
  });

  const getNewNumbers = () => {
    const newTotal = Math.floor(Math.random() * 2 + 9);
    const newMin = Math.floor(Math.random() * 2);
    const newMax = Math.floor(Math.random() * 4 + 15);
    const generatedNumbers = generateNumbers(newTotal, newMin, newMax);
    setHighest(generatedNumbers[0]);
    setNums(buildPositionedNumbers(generatedNumbers));
  };

  const resetGame = useCallback(() => {
    getNewNumbers();
    setRound(1);
    setFeedback({
      shouldPlay: false,
      isCorrect: false,
      position: { x: 0, y: 0 },
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetGame();
  }, [resetGame]);

  const numClicked = (num: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + window.scrollX;
    const y = rect.top + rect.height / 2 + window.scrollY;

    setFeedback({
      shouldPlay: true,
      isCorrect: num === highest,
      position: { x, y },
    });
  };

  const feedbackFinished = (wasCorrect: boolean) => {
    setFeedback({
      shouldPlay: false,
      isCorrect: false,
      position: { x: 0, y: 0 },
    });

    if (wasCorrect) {
      getNewNumbers();
      setRound(round + 1);
    }
  };

  return (
    <>
      <div className="high-touch">
        <section className="prompt">
          <p>Touch the highest number.</p>
        </section>
        <section className="number-field">
          {numbers.map(({ id, value, style }) => (
            <button
              key={id}
              style={style}
              onClick={(e) => numClicked(value, e)}
            >
              {value}
            </button>
          ))}
        </section>
      </div>
      <Correct
        shouldPlay={feedback.shouldPlay && feedback.isCorrect}
        position={feedback.position}
        onComplete={() => feedbackFinished(true)}
      />
      <Incorrect
        shouldPlay={feedback.shouldPlay && !feedback.isCorrect}
        position={feedback.position}
        onComplete={() => feedbackFinished(false)}
      />
      {round === MAX_ROUNDS && (
        <EndGameModal
          stats={[]}
          hasReview={false}
          resetGame={resetGame}
          gameEnd={gameEnd}
        />
      )}
    </>
  );
}

export default HighTouch;
