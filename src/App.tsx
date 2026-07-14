import { useState, Suspense, lazy } from "react";
import "./App.scss";
import GameHeader from "./assets/elements/GameHeader/GameHeader";

const QuickMath = lazy(() => import("./assets/games/quick-math/QuickMath"));
const CountDown = lazy(() => import("./assets/games/count-down/CountDown"));
const HighTouch = lazy(() => import("./assets/games/high-touch/HighTouch"));
const MathRecall = lazy(() => import("./assets/games/math-recall/MathRecall"));
const HiddenMath = lazy(() => import("./assets/games/hidden-math/HiddenMath"));
const MemoryMatrix = lazy(
  () => import("./assets/games/memory-matrix/MemoryMatrix"),
);
const RangeFinder = lazy(
  () => import("./assets/games/range-finder/RangeFinder"),
);

export type GameId =
  | "quick-math"
  | "subtract"
  | "math-recall"
  | "touch-highest"
  | "hidden-math"
  | "memory-matrix"
  | "range-finder";

interface Game {
  name: string;
  description?: string;
}

const gameList: Record<GameId, Game> = {
  "quick-math": {
    name: "Rapid Math",
    description:
      "Race through a fast-paced series of arithmetic challenges before the clock runs out.",
  },
  subtract: {
    name: "Countdown Rush",
    description:
      "Keep subtracting the target number as quickly and accurately as possible.",
  },
  "math-recall": {
    name: "Memory Math",
    description:
      "Solve each problem fast, but keep the previous answer in mind to stay on track.",
  },
  "touch-highest": {
    name: "Peak Finder",
    description:
      "Spot the highest number in a whirlwind of values before time slips away.",
  },
  "hidden-math": {
    name: "Flash Math",
    description:
      "Catch quick glimpses of math problems and solve them before they disappear.",
  },
  "memory-matrix": {
    name: "Memory Matrix",
    description: "Memorize and recall active panels.",
  },
  "range-finder": {
    name: "Equality Check",
    description: "Quickly tell if an equation is equal to another.",
  },
};

function App() {
  const [currentGame, setCurrentGame] = useState<GameId | null>(null);

  const renderGame = () => {
    switch (currentGame) {
      case "quick-math":
        return <QuickMath gameEnd={() => setCurrentGame(null)} />;
      case "subtract":
        return <CountDown gameEnd={() => setCurrentGame(null)} />;
      case "touch-highest":
        return <HighTouch gameEnd={() => setCurrentGame(null)} />;
      case "math-recall":
        return <MathRecall gameEnd={() => setCurrentGame(null)} />;
      case "hidden-math":
        return <HiddenMath gameEnd={() => setCurrentGame(null)} />;
      case "memory-matrix":
        return <MemoryMatrix gameEnd={() => setCurrentGame(null)} />;
      case "range-finder":
        return <RangeFinder gameEnd={() => setCurrentGame(null)} />;
      default:
        return null;
    }
  };

  return (
    <>
      {!currentGame ? (
        <div className="main-menu">
          <section className="welcome">
            <h1>BTRS</h1>
          </section>
          <section className="menu">
            <div className="game-list">
              <div className="grid">
                <button
                  className="grid__item"
                  onClick={() => setCurrentGame("quick-math")}
                >
                  <p className="game-title">{gameList["quick-math"].name}</p>
                </button>
                <button
                  className="grid__item"
                  onClick={() => setCurrentGame("subtract")}
                >
                  <p className="game-title">{gameList["subtract"].name}</p>
                </button>
                <button
                  className="grid__item"
                  onClick={() => setCurrentGame("math-recall")}
                >
                  <p className="game-title">{gameList["math-recall"].name}</p>
                </button>
                <button
                  className="grid__item"
                  onClick={() => setCurrentGame("touch-highest")}
                >
                  <p className="game-title">{gameList["touch-highest"].name}</p>
                </button>
                <button
                  className="grid__item"
                  onClick={() => setCurrentGame("hidden-math")}
                >
                  <p className="game-title">{gameList["hidden-math"].name}</p>
                </button>
                <button
                  className="grid__item"
                  onClick={() => setCurrentGame("memory-matrix")}
                >
                  <p className="game-title">{gameList["memory-matrix"].name}</p>
                </button>
                <button
                  className="grid__item"
                  onClick={() => setCurrentGame("range-finder")}
                >
                  <p className="game-title">{gameList["range-finder"].name}</p>
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <Suspense fallback={<div>Loading game...</div>}>
          <GameHeader
            onBackClicked={() => setCurrentGame(null)}
            gameTitle={gameList[currentGame].name}
          />
          {renderGame()}
        </Suspense>
      )}
    </>
  );
}

export default App;
