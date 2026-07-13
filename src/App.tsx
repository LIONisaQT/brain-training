import { useState, Suspense, lazy } from "react";
import "./App.scss";
import GameHeader from "./assets/elements/GameHeader/GameHeader";

const QuickMath = lazy(() => import("./assets/games/quick-math/QuickMath"));
const CountDown = lazy(() => import("./assets/games/count-down/CountDown"));
const HighTouch = lazy(() => import("./assets/games/high-touch/HighTouch"));
const MathRecall = lazy(() => import("./assets/games/math-recall/MathRecall"));
const HiddenMath = lazy(() => import("./assets/games/hidden-math/HiddenMath"));

export type GameId =
  | "quick-math"
  | "subtract"
  | "math-recall"
  | "touch-highest"
  | "hidden-math";

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
                  className="grid__item grid__item--1"
                  onClick={() => setCurrentGame("quick-math")}
                >
                  <p className="game-title">{gameList["quick-math"].name}</p>
                </button>
                <button
                  className="grid__item grid__item--2"
                  onClick={() => setCurrentGame("subtract")}
                >
                  <p className="game-title">{gameList["subtract"].name}</p>
                </button>
                <button
                  className="grid__item grid__item--3"
                  onClick={() => setCurrentGame("math-recall")}
                >
                  <p className="game-title">{gameList["math-recall"].name}</p>
                </button>
                <button
                  className="grid__item grid__item--4"
                  onClick={() => setCurrentGame("touch-highest")}
                >
                  <p className="game-title">{gameList["touch-highest"].name}</p>
                </button>
                <button
                  className="grid__item grid__item--5"
                  onClick={() => setCurrentGame("hidden-math")}
                >
                  <p className="game-title">{gameList["hidden-math"].name}</p>
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
