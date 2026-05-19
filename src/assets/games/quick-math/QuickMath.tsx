import "./QuickMath.scss";

import { useState, useEffect, useRef, useCallback } from "react";
import NumberCanvas from "./NumberCanvas";
import {
  type Problem,
  calculateAnswer,
  generateProblems,
  getDisplayOperation,
} from "./quick-math-utils";
import { Checkmark, Cross } from "../../../utils/svgs";

const DEFAULT_SET_LIST = 20;

interface QuickMath {
  numProblems?: number;
}

interface GameState {
  problemList: Problem[];
  results: ("correct" | "incorrect" | "unanswered")[];
  submissions: (number | undefined)[];
  index: number;
}

function initializeGame(numProblems: number): GameState {
  return {
    problemList: generateProblems(numProblems),
    results: Array(numProblems).fill("unanswered"),
    submissions: Array(numProblems).fill(undefined),
    index: 0,
  };
}

function QuickMath({ numProblems }: QuickMath) {
  const numProblemsValue = numProblems ?? DEFAULT_SET_LIST;

  const [gameState, setGameState] = useState<GameState>(() =>
    initializeGame(numProblemsValue),
  );

  const { problemList, results, submissions, index } = gameState;

  const containerRef = useRef<HTMLDivElement>(null);
  const isCompleteRef = useRef(false);

  const isQuizComplete = results.every((result) => result !== "unanswered");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetGame = useCallback(() => {
    isCompleteRef.current = false;
    setGameState(initializeGame(numProblemsValue));
  }, [numProblemsValue]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.overflowY = isQuizComplete ? "auto" : "hidden";
      isCompleteRef.current = isQuizComplete;

      if (isQuizComplete) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = 0;
          }
        }, 200);
      }
    }
  }, [isQuizComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isCompleteRef.current) return;

    const currentElement = container.children[index] as HTMLElement | undefined;
    if (!currentElement) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const bottomVar = rootStyles.getPropertyValue(
      "--quickmath-bottom-ui-height",
    );
    const bottomUI = bottomVar ? parseFloat(bottomVar) : 0;

    const cs = getComputedStyle(container);
    const topPad = parseFloat(cs.paddingTop || "0px");

    const elRect = currentElement.getBoundingClientRect();
    const elHeight = elRect.height;
    const maxScroll = container.scrollHeight - container.clientHeight;

    const visibleTop = 0;
    const visibleBottom = window.innerHeight - bottomUI;
    const availableHeight = visibleBottom - visibleTop;

    const idealCenterY = topPad + (availableHeight - topPad) / 2;

    let targetViewportY;
    if (elHeight <= availableHeight) {
      targetViewportY = idealCenterY - elHeight / 2;
      targetViewportY = Math.max(
        topPad,
        Math.min(targetViewportY, visibleBottom - elHeight),
      );
    } else {
      targetViewportY = topPad;
    }

    const elementDocPosition = container.scrollTop + elRect.top;
    const targetScrollTop = elementDocPosition - targetViewportY;

    const finalScroll = Math.min(maxScroll, Math.max(0, targetScrollTop));
    container.scrollTo({ top: finalScroll, behavior: "smooth" });
  }, [index, results]);

  const onSubmit = (num: number) => {
    const correctAnswer = calculateAnswer(problemList[index]);
    const isCorrect = num === correctAnswer;

    setGameState((prev) => ({
      ...prev,
      results: prev.results.map((r, i) =>
        i === index ? (isCorrect ? "correct" : "incorrect") : r,
      ),
      submissions: prev.submissions.map((s, i) => (i === index ? num : s)),
      index: prev.index + 1,
    }));
  };

  return (
    <>
      <div
        className={`problem-set ${isQuizComplete ? "complete" : ""}`}
        ref={containerRef}
      >
        {problemList.map((problem, i) => (
          <div className={`problem ${i === index ? "current" : ""}`} key={i}>
            <p>{problem.num1}</p>
            <p>{getDisplayOperation(problem.operation)}</p>
            <p>{problem.num2}</p>
            {submissions[i] !== undefined && (
              <div className="problem-answer">
                <p>=&nbsp;{submissions[i]}</p>
                {(results[i] === "correct" || results[i] === "incorrect") && (
                  <div className="problem-result">
                    {results[i] === "correct" && <Checkmark />}
                    {results[i] === "incorrect" && <Cross />}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <NumberCanvas onSubmit={onSubmit} isComplete={isQuizComplete} />
    </>
  );
}

export default QuickMath;
