import "./GameHeader.scss";

const ARROW_SIZE = 24;
const STROKE_WIDTH = 5;
const SHAFT_START_X = 4 + (STROKE_WIDTH / 2) * 0.5;
const ARROW_COLOR = "black";

interface HeaderProps {
  onBackClicked: () => void;
  gameTitle: string;
}

function GameHeader({ onBackClicked, gameTitle }: HeaderProps) {
  return (
    <div className="game-header">
      <button
        className="back-button"
        onClick={onBackClicked}
        aria-label="Go back"
      >
        <svg
          width={ARROW_SIZE}
          height={ARROW_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 5L4 12L10 19"
            stroke={ARROW_COLOR}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <path
            d={`M${SHAFT_START_X} 12H20`}
            stroke={ARROW_COLOR}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="square"
          />
        </svg>
      </button>
      <p className="game-title">{gameTitle}</p>
    </div>
  );
}

export default GameHeader;
