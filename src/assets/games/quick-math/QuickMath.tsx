import "./QuickMath.scss";

import { useState, useEffect, useRef } from "react";
import NumberCanvas from "./NumberCanvas";

interface Problem {
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

const generateProblems = (total: number = 20) => {
	const problems: Problem[] = [];
	for (let i = 0; i < total; i++) {
		const op = getRandomOperation();
		let n1: number;
		let n2: number;

		if (op === "+") {
			// Addition: sum between 0-99
			n1 = Math.floor(Math.random() * 100);
			n2 = Math.floor(Math.random() * (100 - n1));
		} else if (op === "-") {
			// Subtraction: difference between 0-99 (n1 >= n2)
			n1 = Math.floor(Math.random() * 100);
			n2 = Math.floor(Math.random() * (n1 + 1));
		} else if (op === "*") {
			// Multiplication: product between 0-81 (both 0-9)
			n1 = Math.floor(Math.random() * 10);
			n2 = Math.floor(Math.random() * 10);
		} else {
			// Division: whole number result between 0-99
			n2 = Math.floor(Math.random() * 10) + 1; // divisor: 1-10
			n1 = n2 * Math.floor(Math.random() * 10); // n1 is divisible by n2
		}

		problems.push({ num1: n1, num2: n2, operation: op });
	}
	return problems;
};

const DEFAULT_SET_LIST = 20;

const getDisplayOperation = (op: string) => {
	switch (op) {
		case "*":
			return "×";
		case "/":
			return "÷";
		default:
			return op;
	}
};

interface QuickMath {
	numProblems?: number;
}

const Checkmark = () => (
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

const Cross = () => (
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

function QuickMath({ numProblems }: QuickMath) {
	const numProblemsValue = numProblems ?? DEFAULT_SET_LIST;
	const [problemList] = useState<Problem[]>(() =>
		generateProblems(numProblemsValue),
	);
	const [results, setResults] = useState<
		("correct" | "incorrect" | "unanswered")[]
	>(() => Array(numProblemsValue).fill("unanswered"));
	const [submissions, setSubmissions] = useState<(number | undefined)[]>(() =>
		Array(numProblemsValue).fill(undefined),
	);
	const [index, setIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	const calculateAnswer = (problem: Problem): number => {
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

	useEffect(() => {
		if (containerRef.current) {
			const currentElement = containerRef.current.children[
				index
			] as HTMLElement;
			if (currentElement) {
				const containerHeight = containerRef.current.clientHeight;
				const elementOffsetTop = currentElement.offsetTop;
				const elementHeight = currentElement.clientHeight;
				const offsetNeeded =
					elementOffsetTop + elementHeight / 2 - containerHeight / 2;
				const translateValue = -offsetNeeded;
				containerRef.current.style.transform = `translateY(${translateValue}px)`;
			}
		}
	}, [index]);

	const onSubmit = (num: number) => {
		const correctAnswer = calculateAnswer(problemList[index]);
		const isCorrect = num === correctAnswer;

		const newResults = [...results];
		newResults[index] = isCorrect ? "correct" : "incorrect";
		setResults(newResults);

		const newSubmissions = [...submissions];
		newSubmissions[index] = num;
		setSubmissions(newSubmissions);

		setIndex(Math.min(problemList.length - 1, index + 1));
	};

	return (
		<>
			<div className="problem-set" ref={containerRef}>
				{problemList.map((problem, i) => (
					<div className={`problem ${i === index ? "current" : ""}`} key={i}>
						<p>{problem.num1}</p>
						<p>{getDisplayOperation(problem.operation)}</p>
						<p>{problem.num2}</p>
						{submissions[i] !== undefined && (
							<div
								className="problem-answer"
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5em",
								}}
							>
								<p style={{ margin: 0 }}>= {submissions[i]}</p>
								{(results[i] === "correct" || results[i] === "incorrect") && (
									<div className="problem-result">
										{results[i] === "correct" && <Checkmark />}
										{results[i] === "incorrect" && <Cross />}
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>
			<NumberCanvas onSubmit={onSubmit} />
		</>
	);
}

export default QuickMath;
