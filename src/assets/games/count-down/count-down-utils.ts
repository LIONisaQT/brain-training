export interface CountdownConfig {
  startingNumber: number;
  subtractor: number;
  rounds: number;
}

const MIN_START = 50;
const MAX_START = 99;
const VALID_SUBTRACTORS = [4, 6, 7, 8, 9] as const;

const getRandomIntInclusive = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const getCountdownConfig = (rounds: number): CountdownConfig => {
  const validSubtractors = VALID_SUBTRACTORS.filter(
    (subtractor) => rounds * subtractor <= MAX_START,
  );

  if (validSubtractors.length === 0) {
    throw new Error(
      `Unable to generate countdown config for ${rounds} rounds with valid start/subtractor ranges.`,
    );
  }

  const subtractor =
    validSubtractors[Math.floor(Math.random() * validSubtractors.length)];
  const minStartingNumber = Math.max(MIN_START, rounds * subtractor);
  const startingNumber = getRandomIntInclusive(minStartingNumber, MAX_START);

  return {
    startingNumber,
    subtractor,
    rounds,
  };
};
