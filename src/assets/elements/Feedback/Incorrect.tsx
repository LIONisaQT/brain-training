import Feedback, { type Position } from "./Feedback";

interface Props {
  shouldPlay: boolean;
  position: Position;
  onComplete: () => void;
}

// Red filled circle with white X
const X_PATH = "M16 16 L36 36 M36 16 L16 36";
const RED = "#dc3545";

function Incorrect({ shouldPlay, position, onComplete }: Props) {
  return (
    <Feedback
      shouldPlay={shouldPlay}
      position={position}
      onComplete={onComplete}
      fillColor={RED}
      iconStroke="#fff"
      pathD={X_PATH}
    />
  );
}

export default Incorrect;
