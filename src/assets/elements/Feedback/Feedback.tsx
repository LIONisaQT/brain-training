import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./Feedback.scss";

export interface Position {
  x: number | string;
  y: number | string;
}

export interface Feedback {
  shouldPlay: boolean;
  isCorrect: boolean;
  position: Position;
}

interface FeedbackProps {
  shouldPlay: boolean;
  position: Position;
  onComplete: () => void;
  fillColor: string;
  iconStroke?: string;
  pathD: string;
}

interface FeedbackStyle extends CSSProperties {
  "--fill-color"?: string;
  "--icon-stroke"?: string;
}

const IN_MS = 150;
const DRAW_MS = 220;
const POST_DRAW_MS = 80;
const OUT_MS = 150;

export default function Feedback({
  shouldPlay,
  position,
  onComplete,
  fillColor,
  iconStroke = "#fff",
  pathD,
}: FeedbackProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    if (shouldPlay) {
      timeouts.current.forEach((t) => window.clearTimeout(t));
      timeouts.current = [];

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      setPhase("in");

      const t1 = window.setTimeout(
        () => setPhase("out"),
        IN_MS + DRAW_MS + POST_DRAW_MS,
      );
      const t2 = window.setTimeout(
        () => {
          setVisible(false);
          setPhase("idle");
          onComplete();
        },
        IN_MS + DRAW_MS + POST_DRAW_MS + OUT_MS,
      );

      timeouts.current.push(t1, t2);
    }

    return () => {
      timeouts.current.forEach((t) => window.clearTimeout(t));
      timeouts.current = [];
    };
  }, [shouldPlay, onComplete]);

  if (!visible) return null;

  const wrapperStyle: FeedbackStyle = {
    left: position.x,
    top: position.y,
    "--fill-color": fillColor,
    "--icon-stroke": iconStroke,
  };

  return (
    <div className={`feedback ${phase}`} style={wrapperStyle} aria-hidden>
      <div className="check" role="img" aria-label="feedback">
        <svg
          viewBox="0 0 52 52"
          className="check-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className="fill" cx="26" cy="26" r="24" />
          <path className="icon" d={pathD} />
        </svg>
      </div>
    </div>
  );
}
