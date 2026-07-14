import { useEffect, useMemo, useState } from "react";
import "./MemoryMatrix.scss";
import { getRandomActiveCells } from "./memory-matrix-utils";
import { type Feedback } from "../../elements/Feedback/Feedback";
import Correct from "../../elements/Feedback/Correct";
import EndGameModal from "../../elements/EndGameModal/EndGameModal";
import Incorrect from "../../elements/Feedback/Incorrect";

const MAX_ROUNDS = 8;
const REVEAL_TIME = 2500;
const MAX_ERRORS = 3;
const MIN_WIDTH = 5;
const MIN_HEIGHT = 4;
const MIN_ACTIVE = 3;

interface MemoryMatrix {
  gameEnd: () => void;
}

function MemoryMatrix({ gameEnd }: MemoryMatrix) {
  const [round, setRound] = useState(0);
  const [width, setWidth] = useState(MIN_WIDTH);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [numActive, setActive] = useState(MIN_ACTIVE);
  const [numSelected, setNumSelected] = useState(0);
  const [numErrors, setNumErrors] = useState(0);
  const [phase, setPhase] = useState<"reveal" | "play">("reveal");
  const [cellStates, setCellStates] = useState<
    Record<string, "correct" | "incorrect">
  >({});
  const [difficultyChange, setDifficultyChange] = useState<
    "width" | "height" | "active"
  >("active");
  const [feedback, setFeedback] = useState<Feedback>({
    shouldPlay: false,
    isCorrect: false,
    position: { x: 0, y: 0 },
  });

  const resetGame = () => {
    setRound(0);
    setWidth(MIN_WIDTH);
    setHeight(MIN_HEIGHT);
    setActive(MIN_ACTIVE);
    setNumSelected(0);
    setNumErrors(0);
    setPhase("reveal");
    setCellStates({});
    setDifficultyChange("active");
  };

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
      setPhase("play");
    }, REVEAL_TIME);

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
      const totalErrors = numErrors + 1;
      setNumErrors(totalErrors);

      if (totalErrors >= MAX_ERRORS) {
        setFeedback({
          shouldPlay: true,
          isCorrect: false,
          position: { x: "50%", y: "25%" },
        });
      }

      return;
    }

    setCellStates((current) => ({ ...current, [key]: "correct" }));

    const nextSelected = numSelected + 1;

    if (nextSelected === numActive) {
      setFeedback({
        shouldPlay: true,
        isCorrect: true,
        position: { x: "50%", y: "25%" },
      });
    } else {
      setNumSelected(nextSelected);
    }
  };

  const feedbackFinished = (wasCorrect: boolean) => {
    setFeedback({
      shouldPlay: false,
      isCorrect: false,
      position: { x: 0, y: 0 },
    });

    setDifficulty(wasCorrect);
    setCellStates({});
    setNumSelected(0);
    setNumErrors(0);
    setRound((r) => r + 1);
    setPhase("reveal");
  };

  /**
   * Difficulty order:
   * Active (+2) -> width (+1) -> height (+1)
   */
  const setDifficulty = (wasCorrect: boolean) => {
    if (wasCorrect) {
      switch (difficultyChange) {
        case "active":
          setActive((active) => active + 2);
          setDifficultyChange("width");
          break;
        case "width":
          setWidth((width) => width + 1);
          setDifficultyChange("height");
          break;
        case "height":
          setHeight((height) => height + 1);
          setDifficultyChange("active");
          break;
      }
    } else {
      switch (difficultyChange) {
        case "active":
          setHeight((height) => Math.max(MIN_HEIGHT, height - 1));
          setDifficultyChange("height");
          break;
        case "width":
          setActive((active) => Math.max(MIN_ACTIVE, active - 2));
          setDifficultyChange("active");
          break;
        case "height":
          setWidth((width) => Math.max(MIN_WIDTH, width - 1));
          setDifficultyChange("width");
          break;
      }
    }
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
      <div className="mm-grid">
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
                  disabled={
                    isRevealing ||
                    cellState === "correct" ||
                    cellState === "incorrect"
                  }
                ></button>
              );
            })}
          </div>
        ))}
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
          stats={[
            {
              statName: "Final width",
              statValue: width.toString(),
            },
            {
              statName: "Final height",
              statValue: height.toString(),
            },
            {
              statName: "Final active",
              statValue: numActive.toString(),
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

export default MemoryMatrix;
