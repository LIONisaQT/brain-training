import { useCallback, useEffect, useState } from "react";
import "./HighTouch.scss";
import {
  generateNumbers,
  buildPositionedNumbers,
  type PositionedNumber,
} from "./high-touch-utils";
import Correct, { type Position } from "../../elements/Feedback/Correct";

function HighTouch() {
  const [numbers, setNums] = useState<PositionedNumber[]>([]);
  const [round, setRound] = useState(1);
  const [highest, setHighest] = useState(0);
  const [playFeedback, shouldPlayFeedback] = useState(false);
  const [feedbackPos, setFeedbackPos] = useState<Position>({ x: 0, y: 0 });

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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetGame();
  }, [resetGame]);

  const numClicked = (num: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (num !== highest) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + window.scrollX;
    const y = rect.top + rect.height / 2 + window.scrollY;
    setFeedbackPos({ x, y });

    onCorrect();
  };

  const onCorrect = () => {
    shouldPlayFeedback(true);
  };

  const feedbackFinished = () => {
    shouldPlayFeedback(false);
    getNewNumbers();
    setRound(round + 1);
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
        shouldPlay={playFeedback}
        position={feedbackPos}
        onComplete={feedbackFinished}
      />
    </>
  );
}

export default HighTouch;
