import { useEffect, useMemo, useRef, useState } from "react";
import "./MemoryMatrix.scss";
import { getRandomActiveCells } from "./memory-matrix-utils";
import { type Feedback } from "../../elements/Feedback/Feedback";
import Correct from "../../elements/Feedback/Correct";

function MemoryMatrix() {
  const [round, setRound] = useState(0);
  const [width, setWidth] = useState(5);
  const [height] = useState(4);
  const [numActive] = useState(3);
  const [numSelected, setNumSelected] = useState(0);
  const [phase, setPhase] = useState<"reveal" | "play">("reveal");
  const [cellStates, setCellStates] = useState<
    Record<string, "correct" | "incorrect">
  >({});
  const completedRoundRef = useRef<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({
    shouldPlay: false,
    isCorrect: false,
    position: { x: 0, y: 0 },
  });

  const activeCells = useMemo(
    () => getRandomActiveCells(width, height, numActive),
    [width, height, numActive],
  );

  const isRevealing = phase === "reveal";

  useEffect(() => {
    if (phase !== "reveal") {
      return;
    }

    const timer = window.setTimeout(() => {
      completedRoundRef.current = null;
      setPhase("play");
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [phase, round]);

  const onCellClicked = (row: number, col: number) => {
    if (isRevealing) {
      return;
    }

    const active = activeCells.some(
      (cell) => cell.row === row && cell.col === col,
    );

    const key = `${row}-${col}`;

    if (!active) {
      setCellStates((current) => ({ ...current, [key]: "incorrect" }));
      return;
    }

    setCellStates((current) => ({ ...current, [key]: "correct" }));

    const nextSelected = numSelected + 1;

    if (nextSelected === numActive) {
      if (completedRoundRef.current === round) {
        return;
      }

      setFeedback({
        shouldPlay: true,
        isCorrect: true,
        position: { x: "50%", y: "25%" },
      });
    } else {
      setNumSelected(nextSelected);
    }
  };

  const feedbackFinished = () => {
    setFeedback({
      shouldPlay: false,
      isCorrect: false,
      position: { x: 0, y: 0 },
    });

    completedRoundRef.current = round;
    setCellStates({});
    setNumSelected(0);
    setRound(round + 1);
    setWidth((currentWidth) => currentWidth + 1);
    setPhase("reveal");
  };

  const isCellActive = (row: number, col: number) =>
    activeCells.some((cell) => cell.row === row && cell.col === col);

  return (
    <>
      <p className="instructions">
        {isRevealing
          ? "Remember the colored panels."
          : "Select the panels you remember."}
      </p>
      <p>
        Round {round + 1} • Found {numSelected}/{numActive}
      </p>
      <div className="grid">
        {Array.from({ length: height }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {Array.from({ length: width }).map((_, colIndex) => {
              const active = isCellActive(rowIndex, colIndex);

              const key = `${rowIndex}-${colIndex}`;
              const cellState = cellStates[key];

              return (
                <button
                  key={key}
                  className={`grid-item ${active && isRevealing ? "active" : ""} ${cellState ?? ""}`.trim()}
                  onClick={() => onCellClicked(rowIndex, colIndex)}
                  disabled={isRevealing}
                ></button>
              );
            })}
          </div>
        ))}
      </div>
      <Correct
        shouldPlay={feedback.shouldPlay && feedback.isCorrect}
        position={feedback.position}
        onComplete={() => feedbackFinished()}
      />
    </>
  );
}

export default MemoryMatrix;
