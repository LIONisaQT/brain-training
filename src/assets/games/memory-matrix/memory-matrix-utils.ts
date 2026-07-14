export type ActiveCell = {
  row: number;
  col: number;
};

export const getRandomActiveCells = (
  gridWidth: number,
  gridHeight: number,
  activeCount: number,
): ActiveCell[] => {
  const positions: ActiveCell[] = [];

  for (let row = 0; row < gridHeight; row += 1) {
    for (let col = 0; col < gridWidth; col += 1) {
      positions.push({ row, col });
    }
  }

  for (let index = positions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [positions[index], positions[swapIndex]] = [
      positions[swapIndex],
      positions[index],
    ];
  }

  return positions.slice(0, Math.min(activeCount, positions.length));
};
