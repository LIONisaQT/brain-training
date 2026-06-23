import { useCallback, useEffect, useState } from "react";
import "./HighTouch.scss";
import {
  generateNumbers,
  buildPositionedNumbers,
  type PositionedNumber,
} from "./high-touch-utils";

function HighTouch() {
  const [numbers, setNums] = useState<PositionedNumber[]>([]);
  const [round, setRound] = useState(1);
  const [highest, setHighest] = useState(0);

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

  const numClicked = (num: number) => {
    if (num !== highest) return;

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
            <button key={id} style={style} onClick={() => numClicked(value)}>
              {value}
            </button>
          ))}
        </section>
      </div>
    </>
  );
}

export default HighTouch;
