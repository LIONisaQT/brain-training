import { useCallback, useEffect, useRef, useState } from "react";
import "./HiddenMath.scss";
import {
  calculateAnswer,
  generateProblems,
  getDisplayOperation,
  type Problem,
} from "../quick-math/quick-math-utils";
import EndGameModal from "../../elements/EndGameModal/EndGameModal";
import NumberCanvas from "../quick-math/NumberCanvas";
import type { Feedback } from "../../elements/Feedback/Feedback";
import Correct from "../../elements/Feedback/Correct";
import Incorrect from "../../elements/Feedback/Incorrect";

const MAX_ROUNDS = 10;

interface HiddenMath {
  gameEnd: () => void;
}

function HiddenMath({ gameEnd }: HiddenMath) {
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [currentStr, setCurrentStr] = useState("");
  const [isRecalling, setIsRecalling] = useState(false);
  const revealTimeoutRef = useRef<number | null>(null);
  const isRecallingRef = useRef(false);
  const [feedback, setFeedback] = useState<Feedback>({
    shouldPlay: false,
    isCorrect: false,
    position: { x: 0, y: 0 },
  });

  const clearRevealTimeout = useCallback(() => {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    const nextProblem = generateProblems(1)[0];

    clearRevealTimeout();
    isRecallingRef.current = false;
    setIsRecalling(false);
    setRound(0);
    setProblem(nextProblem);
    setCurrentStr("");
    setFeedback({
      shouldPlay: false,
      isCorrect: false,
      position: { x: 0, y: 0 },
    });
  }, [clearRevealTimeout]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetGame();
  }, [resetGame]);

  const showProblem = useCallback(
    (msGap = 500) => {
      if (!problem || isRecallingRef.current) {
        return;
      }

      clearRevealTimeout();

      const revealParts = [
        ".",
        "..",
        "...",
        problem.num1.toString(),
        getDisplayOperation(problem.operation),
        problem.num2.toString(),
        "?",
      ];

      let index = 0;
      setIsRecalling(true);
      isRecallingRef.current = true;
      setCurrentStr(revealParts[index]);

      const revealNext = () => {
        index += 1;

        if (index < revealParts.length) {
          setCurrentStr(revealParts[index]);
          revealTimeoutRef.current = window.setTimeout(revealNext, msGap);
          return;
        }

        setCurrentStr(revealParts[revealParts.length - 1]);
        setIsRecalling(false);
        isRecallingRef.current = false;
        revealTimeoutRef.current = null;
      };

      revealTimeoutRef.current = window.setTimeout(revealNext, msGap);
    },
    [clearRevealTimeout, problem],
  );

  useEffect(() => {
    if (problem) {
      showProblem();
    }

    return () => {
      clearRevealTimeout();
    };
  }, [clearRevealTimeout, problem, showProblem]);

  const onSubmit = (num: number) => {
    if (!problem) return;

    const correctAnswer = calculateAnswer(problem);
    const isCorrect = num === correctAnswer;

    setFeedback({
      shouldPlay: true,
      isCorrect,
      position: { x: "50%", y: "25%" },
    });
  };

  const feedbackFinished = (wasCorrect: boolean) => {
    setFeedback({
      shouldPlay: false,
      isCorrect: false,
      position: { x: 0, y: 0 },
    });

    if (!wasCorrect) return;

    setProblem(generateProblems(1)[0]);
    setRound(round + 1);
  };

  return (
    <>
      {problem && (
        <>
          <div className="problem" aria-busy={isRecalling}>
            <p className="string">{currentStr}</p>
            <button
              className="recall"
              onClick={() => showProblem()}
              disabled={isRecalling}
            >
              Recall
            </button>
          </div>
          <NumberCanvas onSubmit={onSubmit} />
        </>
      )}
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

export default HiddenMath;
