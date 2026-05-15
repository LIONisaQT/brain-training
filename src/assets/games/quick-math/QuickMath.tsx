import "./QuickMath.scss";

import { useState, useEffect, useRef } from "react";
import NumberCanvas from "./NumberCanvas";

interface Problem {
  num1: number;
  num2: number;
  operation: string;
}

const getRandomOperation = () => {
  const rng = Math.random();
  if (rng < 0.25) {
    return "+";
  } else if (rng < 0.5) {
    return "-";
  } else if (rng < 0.75) {
    return "*";
  } else {
    return "/";
  }
};

const generateProblems = (total: number = 20) => {
  const problems: Problem[] = [];
  for (let i = 0; i < total; i++) {
    const op = getRandomOperation();
    let n1: number;
    let n2: number;

    if (op === "+") {
      // Addition: sum between 0-99
      n1 = Math.floor(Math.random() * 100);
      n2 = Math.floor(Math.random() * (100 - n1));
    } else if (op === "-") {
      // Subtraction: difference between 0-99 (n1 >= n2)
      n1 = Math.floor(Math.random() * 100);
      n2 = Math.floor(Math.random() * (n1 + 1));
    } else if (op === "*") {
      // Multiplication: product between 0-81 (both 0-9)
      n1 = Math.floor(Math.random() * 10);
      n2 = Math.floor(Math.random() * 10);
    } else {
      // Division: whole number result between 0-99
      n2 = Math.floor(Math.random() * 10) + 1; // divisor: 1-10
      n1 = n2 * Math.floor(Math.random() * 10); // n1 is divisible by n2
    }

    problems.push({ num1: n1, num2: n2, operation: op });
  }
  return problems;
};

const DEFAULT_SET_LIST = 20;

const getDisplayOperation = (op: string) => {
  switch (op) {
    case "*":
      return "×";
    case "/":
      return "÷";
    default:
      return op;
  }
};

interface QuickMath {
  numProblems?: number;
}

const Checkmark = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="result-checkmark"
    style={{
      color: "green",
      marginLeft: "0.5em",
      verticalAlign: "baseline",
      display: "inline-block",
      width: "1em",
      height: "1em",
    }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Cross = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="result-cross"
    style={{
      color: "red",
      marginLeft: "0.5em",
      verticalAlign: "baseline",
      display: "inline-block",
      width: "1em",
      height: "1em",
    }}
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

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

  const calculateAnswer = (problem: Problem): number => {
    const { num1, num2, operation } = problem;
    switch (operation) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "*":
        return num1 * num2;
      case "/":
        return num1 / num2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const isQuizComplete = results.every((result) => result !== "unanswered");
    if (containerRef.current) {
      containerRef.current.style.overflowY = isQuizComplete ? "auto" : "hidden";
    }
  }, [results]);

  useEffect(() => {
    const isQuizComplete = results.every((result) => result !== "unanswered");
    if (isQuizComplete && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [results]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
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
  }, [index]);

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

  const isQuizComplete = results.every((result) => result !== "unanswered");

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
              <div
                className="problem-answer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5em",
                }}
              >
                <p style={{ margin: 0 }}>= {submissions[i]}</p>
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
