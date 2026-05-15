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
		const n1 = Math.floor(Math.random() * 99);
		const n2 = Math.floor(Math.random() * 99);
		const op = getRandomOperation();
		problems.push({ num1: n1, num2: n2, operation: op });
	}
	return problems;
};

const DEFAULT_SET_LIST = 20;

interface QuickMath {
	numProblems?: number;
}

function QuickMath({ numProblems }: QuickMath) {
	const [problemList] = useState<Problem[]>(() =>
		generateProblems(numProblems ?? DEFAULT_SET_LIST),
	);
	const [index, setIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

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
		console.log(num);
		setIndex(Math.min(problemList.length - 1, index + 1));
	};

	return (
		<>
			<div className="problem-set" ref={containerRef}>
				{problemList.map((problem, i) => (
					<div className={`problem ${i === index ? "current" : ""}`} key={i}>
						<p>{problem.num1}</p>
						<p>{problem.operation}</p>
						<p>{problem.num2}</p>
					</div>
				))}
			</div>
			<NumberCanvas onSubmit={onSubmit} />
		</>
	);
}

export default QuickMath;
