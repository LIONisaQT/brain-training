export interface CountdownConfig {
  startingNumber: number;
  subtractor: number;
  rounds: number;
}

const MIN_START = 50;
const MAX_START = 99;
const MIN_SUBTRACTOR = 4;
const MAX_SUBTRACTOR = 9;

const getRandomIntInclusive = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const getCountdownConfig = (rounds: number): CountdownConfig => {
  const validSubtractors = Array.from(
    { length: MAX_SUBTRACTOR - MIN_SUBTRACTOR + 1 },
    (_, index) => MIN_SUBTRACTOR + index,
  ).filter((subtractor) => rounds * subtractor <= MAX_START);

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
