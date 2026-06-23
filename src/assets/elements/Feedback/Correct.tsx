import React, { useEffect, useRef, useState } from "react";
import "./Correct.scss";

interface Position {
  x: number;
  y: number;
}

interface CorrectProps {
  shouldPlay: boolean;
  position: Position;
  onComplete: () => void;
}

const IN_MS = 150;
const HOLD_MS = 250;
const OUT_MS = 150;

function Correct({ shouldPlay, position, onComplete }: CorrectProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    // start animation when triggered
    if (shouldPlay) {
      // clear any existing
      timeouts.current.forEach((t) => window.clearTimeout(t));
      timeouts.current = [];

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      setPhase("in");

      const t1 = window.setTimeout(() => setPhase("out"), IN_MS + HOLD_MS);
      const t2 = window.setTimeout(
        () => {
          setVisible(false);
          setPhase("idle");
          onComplete();
        },
        IN_MS + HOLD_MS + OUT_MS,
      );

      timeouts.current.push(t1, t2);
    }

    return () => {
      timeouts.current.forEach((t) => window.clearTimeout(t));
      timeouts.current = [];
    };
  }, [shouldPlay, onComplete]);

  if (!visible) return null;

  const style: React.CSSProperties = {
    left: position.x,
    top: position.y,
  };

  return (
    <div className={`feedback ${phase}`} style={style} aria-hidden>
      <div className="check" role="img" aria-label="correct">
        <svg
          viewBox="0 0 52 52"
          className="check-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="circle"
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="#28a745"
            strokeWidth="3"
          />
          <path
            className="checkmark"
            fill="none"
            stroke="#28a745"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 27l7 7 16-16"
          />
        </svg>
      </div>
    </div>
  );
}

export default Correct;
