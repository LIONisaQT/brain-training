import "./QuickMath.scss";

import { useState, useEffect, useRef } from "react";
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

function QuickMath({ numProblems }: QuickMath) {
  const numProblemsValue = numProblems ?? DEFAULT_SET_LIST;
  const [problemList] = useState<Problem[]>(() =>
    generateProblems(numProblemsValue),
  );
  const [results, setResults] = useState<
    ("correct" | "incorrect" | "unanswered")[]
  >(() => Array(numProblemsValue).fill("unanswered"));
  const [submissions, setSubmissions] = useState<(number | undefined)[]>(() =>
    Array(numProblemsValue).fill(undefined),
  );
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isCompleteRef = useRef(false);

  const isQuizComplete = results.every((result) => result !== "unanswered");

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.overflowY = isQuizComplete ? "auto" : "hidden";
      isCompleteRef.current = isQuizComplete;

      // Scroll to top after making the container scrollable
      if (isQuizComplete) {
        // Wait a bit longer to ensure all rendering is done
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

    // Read bottom UI height and top padding
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

    // Visible region: from top of viewport to just above the fixed canvas
    const visibleTop = 0;
    const visibleBottom = window.innerHeight - bottomUI;
    const availableHeight = visibleBottom - visibleTop;

    // Target: center the element within the visible region, but respect top padding aesthetics
    // Ideal center is at topPad + (availableHeight - topPad) / 2
    const idealCenterY = topPad + (availableHeight - topPad) / 2;

    // If element fits, center it at idealCenterY; otherwise, fit it within bounds
    let targetViewportY;
    if (elHeight <= availableHeight) {
      targetViewportY = idealCenterY - elHeight / 2;
      // Clamp to ensure element stays within visible bounds
      targetViewportY = Math.max(
        topPad,
        Math.min(targetViewportY, visibleBottom - elHeight),
      );
    } else {
      // Element too tall: show from top
      targetViewportY = topPad;
    }

    // Compute the scroll position needed to place element at targetViewportY
    const elementDocPosition = container.scrollTop + elRect.top;
    const targetScrollTop = elementDocPosition - targetViewportY;

    const finalScroll = Math.min(maxScroll, Math.max(0, targetScrollTop));
    container.scrollTo({ top: finalScroll, behavior: "smooth" });
  }, [index, results]);

  const onSubmit = (num: number) => {
    const correctAnswer = calculateAnswer(problemList[index]);
    const isCorrect = num === correctAnswer;

    const newResults = [...results];
    newResults[index] = isCorrect ? "correct" : "incorrect";
    setResults(newResults);

    const newSubmissions = [...submissions];
    newSubmissions[index] = num;
    setSubmissions(newSubmissions);

    setIndex(index + 1);
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
