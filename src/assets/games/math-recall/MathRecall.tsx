import "./MathRecall.scss";
import { useCallback, useEffect, useState } from "react";
import {
  calculateAnswer,
  generateProblems,
  getDisplayOperation,
  type Problem,
} from "../quick-math/quick-math-utils";
import NumberCanvas from "../quick-math/NumberCanvas";
import { type Feedback } from "../../elements/Feedback/Feedback";
import Correct from "../../elements/Feedback/Correct";
import Incorrect from "../../elements/Feedback/Incorrect";
import { generateOptions } from "./math-recall-utils";
import EndGameModal from "../../elements/EndGameModal/EndGameModal";

const MAX_ROUNDS = 2;

interface MathRecall {
  gameEnd: () => void;
}

function MathRecall({ gameEnd }: MathRecall) {
  const [isMathMode, setMathMode] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [lastSolution, setLastSolution] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>({
    shouldPlay: false,
    isCorrect: false,
    position: { x: 0, y: 0 },
  });

  const resetGame = useCallback(() => {
    setMathMode(true);
    setProblem(generateProblems(1)[0]);
    setLastSolution(null);
    setRound(0);
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

  const onSubmit = (num: number) => {
    if (!problem) return;

    const correctAnswer = isMathMode ? calculateAnswer(problem) : lastSolution;
    const isCorrect = num === correctAnswer;
    if (isCorrect) {
      setLastSolution(correctAnswer);
    }

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

    if (!isMathMode) {
      setProblem(generateProblems(1)[0]);
      setMathMode(true);
    } else {
      const shouldRecall = Math.random() > 0.66;
      if (!shouldRecall) {
        setProblem(generateProblems(1)[0]);
      }
      setMathMode(!shouldRecall);
    }

    setRound(round + 1);
  };

  return (
    <>
      <MathMode isVisible={isMathMode} problem={problem} />
      <RecallMode
        isVisible={!isMathMode}
        answer={lastSolution}
        onClick={onSubmit}
      />
      <NumberCanvas onSubmit={onSubmit} isComplete={!isMathMode} />
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

export default MathRecall;

interface MathProps {
  isVisible: boolean;
  problem: Problem | null;
}

function MathMode({ isVisible, problem }: MathProps) {
  return (
    <div className={`math-mode ${isVisible ? "visible" : "hidden"}`}>
      {problem && (
        <div className="problem">
          <p>{problem.num1}</p>
          <p>{getDisplayOperation(problem.operation)}</p>
          <p>{problem.num2}</p>
          <p>{"= ?"}</p>
        </div>
      )}
    </div>
  );
}

interface RecallProps {
  isVisible: boolean;
  answer: number | null;
  optionAmount?: number;
  onClick: (num: number) => void;
}

function RecallMode({
  isVisible,
  answer,
  optionAmount = 4,
  onClick,
}: RecallProps) {
  const createOptions = () => {
    if (!answer) return;

    const options = generateOptions(answer, optionAmount);
    return (
      <div className="options">
        {options.map((option) => (
          <button
            className="option"
            key={option}
            onClick={() => onClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`recall-mode ${isVisible ? "visible" : "hidden"}`}>
      <p className="prompt">What was the last answer?</p>
      {createOptions()}
    </div>
  );
}
