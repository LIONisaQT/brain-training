export interface Problem {
  num1: number;
  num2: number;
  operation: string;
}

const getRandomOperation = () => {
  const rng = Math.random();
  if (rng < 0.25) {
    return "+";
  } else if (rng < 0.5) {
    return "-";
  } else if (rng < 0.75) {
    return "*";
  } else {
    return "/";
  }
};

export const getDisplayOperation = (op: string) => {
  switch (op) {
    case "*":
      return "×";
    case "/":
      return "÷";
    default:
      return op;
  }
};

export const generateProblems = (total: number = 20) => {
  const problems: Problem[] = [];
  for (let i = 0; i < total; i++) {
    const op = getRandomOperation();
    let n1: number;
    let n2: number;

    if (op === "+") {
      // Addition: sum between 0-99, no adding 0 or 1
      // Bias toward carrying: pick numbers where ones digits sum >= 10
      const useCarry = Math.random() < 0.7;
      if (useCarry) {
        // Pick ones digits that force a carry (sum >= 10)
        const ones1 = Math.floor(Math.random() * 8) + 2; // 2-9
        const ones2 =
          Math.floor(Math.random() * (9 - (10 - ones1) + 1)) + (10 - ones1); // ensures ones1+ones2 >= 10
        const tens1 = Math.floor(Math.random() * 9); // 0-8, leaving room for carry
        const tens2 = Math.floor(Math.random() * (9 - tens1)); // ensures total sum <= 99
        n1 = tens1 * 10 + ones1;
        n2 = tens2 * 10 + ones2;
      } else {
        // No carry, but still no 0 or 1 operands
        do {
          n1 = Math.floor(Math.random() * 98) + 2; // 2-99
          n2 = Math.floor(Math.random() * (100 - n1));
        } while (n2 < 2);
      }
    } else if (op === "-") {
      // Subtraction: no subtracting 0 or 1
      // Bias toward borrowing: ones digit of n1 < ones digit of n2
      const useBorrow = Math.random() < 0.7;
      if (useBorrow) {
        // Pick ones digits that force a borrow (ones1 < ones2)
        const ones2 = Math.floor(Math.random() * 8) + 2; // 2-9
        const ones1 = Math.floor(Math.random() * (ones2 - 1)); // 0 to ones2-1, forces borrow
        const tens1 = Math.floor(Math.random() * 9) + 1; // 1-9, n1 must have a tens digit to borrow from
        const maxTens2 = tens1 - 1; // ensures n1 > n2 after borrow
        const tens2 = maxTens2 > 0 ? Math.floor(Math.random() * maxTens2) : 0;
        n1 = tens1 * 10 + ones1;
        n2 = tens2 * 10 + ones2;
      } else {
        // No borrow, but still no 0 or 1 subtracted
        do {
          n1 = Math.floor(Math.random() * 98) + 2; // 2-99
          n2 = Math.floor(Math.random() * (n1 + 1));
        } while (n2 < 2);
      }
    } else if (op === "*") {
      // Multiplication: no 0 or 1 operands, so both factors are 2-9
      n1 = Math.floor(Math.random() * 8) + 2; // 2-9
      n2 = Math.floor(Math.random() * 8) + 2; // 2-9
    } else {
      // Division: no 0 dividend or 1 divisor, so divisor is 2-10
      n2 = Math.floor(Math.random() * 9) + 2; // 2-10
      n1 = n2 * (Math.floor(Math.random() * 9) + 1); // quotient 1-9, so n1 is never 0
    }

    problems.push({ num1: n1, num2: n2, operation: op });
  }
  return problems;
};

export const calculateAnswer = (problem: Problem): number => {
  const { num1, num2, operation } = problem;
  switch (operation) {
    case "+":
      return num1 + num2;
    case "-":
      return num1 - num2;
    case "*":
      return num1 * num2;
    case "/":
      return num1 / num2;
    default:
      return 0;
  }
};
