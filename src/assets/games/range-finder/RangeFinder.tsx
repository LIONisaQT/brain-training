import { useCallback, useState } from "react";
import "./RangeFinder.scss";
import {
  getDisplayOperation,
  type Problem,
} from "../quick-math/quick-math-utils";
import { generateRFProblems, isSolutionCorrect } from "./range-finder-utils";
import Correct from "../../elements/Feedback/Correct";
import Incorrect from "../../elements/Feedback/Incorrect";
import type { Feedback } from "../../elements/Feedback/Feedback";
import EndGameModal from "../../elements/EndGameModal/EndGameModal";

const MAX_ROUNDS = 10;

interface RangeFinder {
  gameEnd: () => void;
}

function RangeFinder({ gameEnd }: RangeFinder) {
  const [round, setRound] = useState(0);
  const [equations, setEquations] = useState<Problem[]>(() =>
    generateRFProblems(),
  );
  const [feedback, setFeedback] = useState<Feedback>({
    shouldPlay: false,
    isCorrect: false,
    position: { x: 0, y: 0 },
  });
  const [numCorrect, setNumCorrect] = useState(0);

  const beginRound = useCallback(() => {
    setEquations(generateRFProblems());
  }, []);

  const submitSolution = (answer: string) => {
    const isCorrect = isSolutionCorrect(equations, answer);
    setNumCorrect((n) => (isCorrect ? n + 1 : n));

    setFeedback({
      shouldPlay: true,
      isCorrect,
      position: {
        x: "50%",
        y: "30%",
      },
    });
  };

  const feedbackFinished = () => {
    setFeedback({
      shouldPlay: false,
      isCorrect: false,
      position: { x: 0, y: 0 },
    });

    setRound((r) => r + 1);
    beginRound();
  };

  const resetGame = () => {
    setRound(0);
    setEquations(generateRFProblems());
    setNumCorrect(0);
  };

  return (
    <>
      <div className="range-finder">
        <section className="problems">
          <div className="problem">
            <p>{equations[0].num1}</p>
            <p>{getDisplayOperation(equations[0].operation)}</p>
            <p>{equations[0].num2}</p>
          </div>
          <p className="equals">?</p>
          <div className="problem">
            <p>{equations[1].num1}</p>
            <p>{getDisplayOperation(equations[1].operation)}</p>
            <p>{equations[1].num2}</p>
          </div>
        </section>
        <section className="options">
          <button className="range-button" onClick={() => submitSolution("<")}>
            Less than
          </button>
          <button className="range-button" onClick={() => submitSolution("=")}>
            Equal to
          </button>
          <button className="range-button" onClick={() => submitSolution(">")}>
            Greater than
          </button>
        </section>
      </div>
      <Correct
        shouldPlay={feedback.shouldPlay && feedback.isCorrect}
        position={feedback.position}
        onComplete={() => feedbackFinished()}
      />
      <Incorrect
        shouldPlay={feedback.shouldPlay && !feedback.isCorrect}
        position={feedback.position}
        onComplete={() => feedbackFinished()}
      />
      {round === MAX_ROUNDS && (
        <EndGameModal
          stats={[
            {
              statName: "Correct",
              statValue: `${numCorrect}/${round}`,
            },
          ]}
          hasReview={false}
          resetGame={resetGame}
          gameEnd={gameEnd}
        />
      )}
    </>
  );
}

export default RangeFinder;
