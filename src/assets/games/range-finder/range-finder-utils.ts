import {
  calculateAnswer,
  generateProblems,
  type Problem,
} from "../quick-math/quick-math-utils";

const shouldEquationEqual = () => Math.random() < 0.33;

const generateEqualProblems = (): Problem[] => {
  const target = Math.floor(Math.random() * 80) + 8;
  const minOperand = 2;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const firstNum1 =
      Math.floor(Math.random() * (target - (minOperand * 2 - 1))) + minOperand;
    const firstNum2 = target - firstNum1;

    if (firstNum2 < minOperand) {
      continue;
    }

    const secondNum1 =
      Math.floor(Math.random() * (target - (minOperand * 2 - 1))) + minOperand;
    const secondNum2 = target - secondNum1;

    if (
      secondNum2 < minOperand ||
      (firstNum1 === secondNum1 && firstNum2 === secondNum2) ||
      [firstNum1, firstNum2].includes(secondNum1) ||
      [firstNum1, firstNum2].includes(secondNum2)
    ) {
      continue;
    }

    return [
      { num1: firstNum1, num2: firstNum2, operation: "+" },
      { num1: secondNum1, num2: secondNum2, operation: "+" },
    ];
  }

  return [
    { num1: 2, num2: target - 2, operation: "+" },
    { num1: 3, num2: target - 3, operation: "+" },
  ];
};

export const generateRFProblems = () => {
  const shouldEq = shouldEquationEqual();

  if (shouldEq) return generateEqualProblems();

  return generateProblems(2);
};

export const isSolutionCorrect = (
  [p1, p2]: Problem[],
  answer: string,
): boolean => {
  const s1 = calculateAnswer(p1);
  const s2 = calculateAnswer(p2);

  switch (answer) {
    case "<":
      return s1 < s2;
    case "=":
      return s1 === s2;
    case ">":
      return s1 > s2;
  }

  return false;
};
