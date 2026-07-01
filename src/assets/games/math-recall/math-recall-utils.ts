/**
 * Generates a list of options, out of which the user selects the correct one.
 * The options generated will all be unique and within a range that includes
 * the answer. For example, if the answer is 75 and the amount is 4, then
 * possible options could be, but limited to: [72, 73, 74, 75],
 * [75, 76, 77, 78], or [74, 75, 76, 78]. The list will then return randomized.
 * @param answer The correct answer to be selected.
 * @param amount The amount of options the user from select from, randomized.
 */
export const generateOptions = (answer: number, amount: number) => {
  if (amount <= 0) return [];
  if (amount === 1) return [answer];

  const minStart = Math.max(0, answer - amount + 1);
  const maxStart = answer;
  const start =
    Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart;

  const options = Array.from({ length: amount }, (_, index) => start + index);

  if (!options.includes(answer)) {
    const answerIndex = options.findIndex((value) => value >= answer);
    const replacementIndex =
      answerIndex >= 0 ? answerIndex : options.length - 1;
    options[replacementIndex] = answer;
  }

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
};
