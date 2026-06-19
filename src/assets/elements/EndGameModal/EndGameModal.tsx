import "./EndGameModal.scss";

interface EndGameModal {
  modalTitle?: string;
  stats: StatLine[];
  hasReview: boolean;
  reviewGame?: () => void;
  resetGame: () => void;
  gameEnd: () => void;
}

function EndGameModal({
  modalTitle = "Quiz Complete",
  stats,
  hasReview,
  reviewGame,
  resetGame,
  gameEnd,
}: EndGameModal) {
  return (
    <div className="modal-element">
      <div className="modal-bg"></div>
      <div className="modal">
        <section className="modal-content">
          <h1 className="modal-title">{modalTitle}</h1>
          <section className="modal-body">
            {stats.map((stat) => (
              <StatLine
                key={stat.statName}
                statName={stat.statName}
                statValue={stat.statValue}
              />
            ))}
          </section>
        </section>
        <section className="modal-button-container">
          <div className="button-row">
            {hasReview && (
              <button className="modal-button" onClick={reviewGame}>
                Review
              </button>
            )}
            <button className="modal-button" onClick={resetGame}>
              Restart
            </button>
          </div>
          <div className="button-row">
            <button className="modal-button" onClick={gameEnd}>
              Main Menu
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default EndGameModal;

export interface StatLine {
  statName: string;
  statValue: string;
}

function StatLine({ statName, statValue }: StatLine) {
  return (
    <div className="modal-body-line">
      <p>{statName}</p>
      <p>{statValue}</p>
    </div>
  );
}
