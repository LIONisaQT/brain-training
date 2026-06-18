import { useState, Suspense, lazy } from "react";
import "./App.scss";
import CountDown from "./assets/games/count-down/CountDown";

const QuickMath = lazy(() => import("./assets/games/quick-math/QuickMath"));

export type GameId =
  | "quick-math"
  | "subtract"
  | "prev-image"
  | "touch-highest"
  | "box-count"
  | "color-match";

interface Game {
  name: string;
}

const gameList: Record<GameId, Game> = {
  "quick-math": {
    name: "Quick Math",
  },
  subtract: {
    name: "Count Down",
  },
  "prev-image": {
    name: "Image Recall",
  },
  "touch-highest": {
    name: "High Touch",
  },
  "box-count": {
    name: "Boxing",
  },
  "color-match": {
    name: "Color Match",
  },
};

function App() {
  const [currentGame, setCurrentGame] = useState<GameId | null>(null);

  const renderGame = () => {
    switch (currentGame) {
      case "quick-math":
        return <QuickMath gameEnd={() => setCurrentGame(null)} />;
      case "subtract":
        return <CountDown />;
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
                <button className="grid__item grid__item--3">
                  <p className="game-title">{gameList["prev-image"].name}</p>
                </button>
                <button className="grid__item grid__item--4">
                  <p className="game-title">{gameList["touch-highest"].name}</p>
                </button>
                <button className="grid__item grid__item--5">
                  <p className="game-title">{gameList["box-count"].name}</p>
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <Suspense fallback={<div>Loading game...</div>}>
          {renderGame()}
        </Suspense>
      )}
    </>
  );
}

export default App;
