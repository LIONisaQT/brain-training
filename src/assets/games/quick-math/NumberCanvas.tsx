import "./NumberCanvas.scss";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as tf from "@tensorflow/tfjs";

const CANVAS_WIDTH = 150;
const CANVAS_HEIGHT = 225;
const MODEL_URL = "/mnist_model/model.json";

type CanvasSlot = "tens" | "units";

interface NumberCanvas {
	canvasWidth?: number;
	canvasHeight?: number;
	/** Called with the interpreted number when the user presses Submit. */
	onSubmit?: (value: number) => void;
}

function NumberCanvas({
	canvasWidth = CANVAS_WIDTH,
	canvasHeight = CANVAS_HEIGHT,
	onSubmit,
}: NumberCanvas) {
	const tensCanvasRef = useRef<HTMLCanvasElement>(null);
	const unitsCanvasRef = useRef<HTMLCanvasElement>(null);
	const isDrawing = useRef<boolean>(false);
	const lastPos = useRef<{ x: number; y: number } | null>(null);
	const activeCanvas = useRef<CanvasSlot>("tens");

	const [model, setModel] = useState<tf.LayersModel | null>(null);
	const [modelStatus, setModelStatus] = useState<string>("Loading model...");

	// Load model
	useEffect(() => {
		(async () => {
			try {
				const m = await tf.loadLayersModel(MODEL_URL);
				setModel(m);
				setModelStatus("Model ready");
			} catch (e) {
				const message = e instanceof Error ? e.message : String(e);
				setModelStatus("Model failed to load: " + message);
				console.error(e);
			}
		})();
	}, []);

	// Initialize a canvas to black with white stroke settings
	const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 16;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
	}, []);

	useEffect(() => {
		if (tensCanvasRef.current) initCanvas(tensCanvasRef.current);
		if (unitsCanvasRef.current) initCanvas(unitsCanvasRef.current);
	}, [canvasWidth, canvasHeight, initCanvas]);

	const getRefForSlot = useCallback(
		(slot: CanvasSlot) => (slot === "tens" ? tensCanvasRef : unitsCanvasRef),
		[],
	);

	const getPos = useCallback(
		(
			e:
				| React.MouseEvent<HTMLCanvasElement>
				| React.TouchEvent<HTMLCanvasElement>,
			canvas: HTMLCanvasElement,
		): { x: number; y: number } => {
			const rect = canvas.getBoundingClientRect();
			const scaleX = canvas.width / rect.width;
			const scaleY = canvas.height / rect.height;
			const touch = "touches" in e ? e.touches[0] : null;
			const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
			const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
			return {
				x: (clientX - rect.left) * scaleX,
				y: (clientY - rect.top) * scaleY,
			};
		},
		[],
	);

	const stopDrawing = useCallback(() => {
		isDrawing.current = false;
		lastPos.current = null;
	}, []);

	const tensStartDrawing = useMemo(
		() =>
			(
				e:
					| React.MouseEvent<HTMLCanvasElement>
					| React.TouchEvent<HTMLCanvasElement>,
			) => {
				e.preventDefault();
				activeCanvas.current = "tens";
				isDrawing.current = true;
				const canvas = getRefForSlot("tens").current;
				if (!canvas) return;
				lastPos.current = getPos(e, canvas);
			},
		[getRefForSlot, getPos],
	);

	const unitsStartDrawing = useMemo(
		() =>
			(
				e:
					| React.MouseEvent<HTMLCanvasElement>
					| React.TouchEvent<HTMLCanvasElement>,
			) => {
				e.preventDefault();
				activeCanvas.current = "units";
				isDrawing.current = true;
				const canvas = getRefForSlot("units").current;
				if (!canvas) return;
				lastPos.current = getPos(e, canvas);
			},
		[getRefForSlot, getPos],
	);

	const tensDraw = useMemo(
		() =>
			(
				e:
					| React.MouseEvent<HTMLCanvasElement>
					| React.TouchEvent<HTMLCanvasElement>,
			) => {
				e.preventDefault();
				if (!isDrawing.current || activeCanvas.current !== "tens") return;
				const canvas = getRefForSlot("tens").current;
				if (!canvas) return;
				const ctx = canvas.getContext("2d");
				if (!ctx) return;
				const pos = getPos(e, canvas);
				ctx.beginPath();
				ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
				ctx.lineTo(pos.x, pos.y);
				ctx.stroke();
				lastPos.current = pos;
			},
		[getRefForSlot, getPos],
	);

	const unitsDraw = useMemo(
		() =>
			(
				e:
					| React.MouseEvent<HTMLCanvasElement>
					| React.TouchEvent<HTMLCanvasElement>,
			) => {
				e.preventDefault();
				if (!isDrawing.current || activeCanvas.current !== "units") return;
				const canvas = getRefForSlot("units").current;
				if (!canvas) return;
				const ctx = canvas.getContext("2d");
				if (!ctx) return;
				const pos = getPos(e, canvas);
				ctx.beginPath();
				ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
				ctx.lineTo(pos.x, pos.y);
				ctx.stroke();
				lastPos.current = pos;
			},
		[getRefForSlot, getPos],
	);

	const clearSingleCanvas = useCallback(
		(canvas: HTMLCanvasElement | null) => {
			if (!canvas) return;
			initCanvas(canvas);
		},
		[initCanvas],
	);

	const clearAll = useCallback(() => {
		clearSingleCanvas(tensCanvasRef.current);
		clearSingleCanvas(unitsCanvasRef.current);
	}, [clearSingleCanvas]);

	/**
	 * Returns the predicted digit (0-9) for a canvas, or null if the canvas
	 * appears blank (no drawn pixels detected).
	 */
	const predictFromCanvas = useCallback(
		async (canvas: HTMLCanvasElement): Promise<number | null> => {
			const offscreen = document.createElement("canvas");
			offscreen.width = 28;
			offscreen.height = 28;
			const offCtx = offscreen.getContext("2d");
			if (!offCtx) throw new Error("Could not get offscreen context");

			// Find bounding box of drawn pixels
			const srcCtx = canvas.getContext("2d")!;
			const { width, height } = canvas;
			const imageData = srcCtx.getImageData(0, 0, width, height);
			const data = imageData.data;

			let minX = width,
				minY = height,
				maxX = 0,
				maxY = 0;
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const alpha = data[(y * width + x) * 4]; // red channel (white on black)
					if (alpha > 10) {
						if (x < minX) minX = x;
						if (x > maxX) maxX = x;
						if (y < minY) minY = y;
						if (y > maxY) maxY = y;
					}
				}
			}

			// Canvas is blank
			if (maxX < minX) return null;

			// Add padding (20% of the larger dimension)
			const pad = Math.max(maxX - minX, maxY - minY) * 0.2;
			const cropX = Math.max(0, minX - pad);
			const cropY = Math.max(0, minY - pad);
			const cropW = Math.min(width, maxX + pad) - cropX;
			const cropH = Math.min(height, maxY + pad) - cropY;

			// Draw cropped+padded digit centered into 28x28
			offCtx.fillStyle = "black";
			offCtx.fillRect(0, 0, 28, 28);
			offCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, 28, 28);

			const scaled = offCtx.getImageData(0, 0, 28, 28);

			const input = tf.tidy(() => {
				const raw = Float32Array.from(scaled.data)
					.filter((_, i) => i % 4 === 0)
					.map((v) => v / 255);
				return tf.tensor(raw, [1, 28, 28, 1]);
			});

			const predictionTensor = model!.predict(input) as tf.Tensor;
			const probabilities = await predictionTensor.data();
			const digit = Array.from(probabilities).indexOf(
				Math.max(...Array.from(probabilities)),
			);

			input.dispose();
			predictionTensor.dispose();
			return digit;
		},
		[model],
	);

	const interpretCanvas = useCallback(async () => {
		if (!model) {
			console.log("Model not loaded yet");
			return;
		}

		const [tensDigit, unitsDigit] = await Promise.all([
			predictFromCanvas(tensCanvasRef.current!),
			predictFromCanvas(unitsCanvasRef.current!),
		]);

		let result: number;

		if (tensDigit === null && unitsDigit === null) {
			// Both blank → 0
			result = 0;
		} else if (tensDigit === null) {
			// Only units drawn → treat as single digit
			result = unitsDigit!;
		} else if (unitsDigit === null) {
			// Only tens drawn → treat as single digit
			result = tensDigit;
		} else {
			// Both drawn → concatenate
			result = tensDigit * 10 + unitsDigit;
		}

		console.log(
			`Tens: ${tensDigit ?? "blank"}, Units: ${unitsDigit ?? "blank"} → ${result}`,
		);

		onSubmit?.(result);
		clearAll();
	}, [model, predictFromCanvas, onSubmit, clearAll]);

	return (
		<div className="number-canvas">
			<p>{modelStatus}</p>
			<div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
				<div>
					<canvas
						className="canvas"
						ref={tensCanvasRef}
						width={canvasWidth}
						height={canvasHeight}
						onMouseDown={tensStartDrawing}
						onMouseMove={tensDraw}
						onMouseUp={stopDrawing}
						onMouseLeave={stopDrawing}
						onTouchStart={tensStartDrawing}
						onTouchMove={tensDraw}
						onTouchEnd={stopDrawing}
					/>
				</div>
				<div>
					<canvas
						className="canvas"
						ref={unitsCanvasRef}
						width={canvasWidth}
						height={canvasHeight}
						onMouseDown={unitsStartDrawing}
						onMouseMove={unitsDraw}
						onMouseUp={stopDrawing}
						onMouseLeave={stopDrawing}
						onTouchStart={unitsStartDrawing}
						onTouchMove={unitsDraw}
						onTouchEnd={stopDrawing}
					/>
				</div>
			</div>
			<br />
			<button onClick={clearAll}>Clear</button>
			<button onClick={interpretCanvas}>Submit</button>
		</div>
	);
}

export default NumberCanvas;
