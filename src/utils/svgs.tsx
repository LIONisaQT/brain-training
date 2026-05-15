export const Checkmark = () => (
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

export const Cross = () => (
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
