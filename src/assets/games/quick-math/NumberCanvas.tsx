import "./NumberCanvas.scss";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as tf from "@tensorflow/tfjs";
import {
  loadMnistModel,
  predictFromCanvas,
  interpretDigits,
} from "../../../utils/mnistInference";

const CANVAS_WIDTH = 280;
const CANVAS_HEIGHT = 280;

type CanvasSlot = "tens" | "units";

interface QuickMathProps {
  canvasWidth?: number;
  canvasHeight?: number;
  /** Called with the interpreted number when the user presses Submit. */
  onSubmit?: (value: number) => void;
  /** Whether the quiz is complete. */
  isComplete?: boolean;
}

function NumberCanvas({
  canvasWidth = CANVAS_WIDTH,
  canvasHeight = CANVAS_HEIGHT,
  onSubmit,
  isComplete = false,
}: QuickMathProps) {
  // expose bottom UI height to the page so QuickMath can account for it
  useEffect(() => {
    const el = document.querySelector(".number-canvas") as HTMLElement | null;
    const setVar = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // add a little extra padding for safety
      const total = Math.ceil(rect.height + 24);
      document.documentElement.style.setProperty(
        "--quickmath-bottom-ui-height",
        `${total}px`,
      );
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    if (el) ro.observe(el);
    window.addEventListener("resize", setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);
  // Visible canvases (gray background, black stroke)
  const tensCanvasRef = useRef<HTMLCanvasElement>(null);
  const unitsCanvasRef = useRef<HTMLCanvasElement>(null);

  // Hidden mirror canvases (black background, white stroke) fed to the model
  const tensMirrorRef = useRef<HTMLCanvasElement>(null);
  const unitsMirrorRef = useRef<HTMLCanvasElement>(null);

  const isDrawing = useRef<boolean>(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const activeCanvas = useRef<CanvasSlot>("tens");

  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [modelStatus, setModelStatus] = useState<string>("Loading model...");

  // Load model
  useEffect(() => {
    loadMnistModel()
      .then((m) => {
        setModel(m);
        setModelStatus("Model ready");
      })
      .catch((e) => {
        const message = e instanceof Error ? e.message : String(e);
        setModelStatus("Model failed to load: " + message);
        console.error(e);
      });
  }, []);

  // Initialize the visible canvas (gray bg, black stroke)
  const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "lightgray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Initialize the mirror canvas (black bg, white stroke) for MNIST inference
  const initMirrorCanvas = useCallback((canvas: HTMLCanvasElement) => {
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
    if (tensMirrorRef.current) initMirrorCanvas(tensMirrorRef.current);
    if (unitsMirrorRef.current) initMirrorCanvas(unitsMirrorRef.current);
  }, [canvasWidth, canvasHeight, initCanvas, initMirrorCanvas]);

  const getRefsForSlot = useCallback(
    (slot: CanvasSlot) =>
      slot === "tens"
        ? { visible: tensCanvasRef, mirror: tensMirrorRef }
        : { visible: unitsCanvasRef, mirror: unitsMirrorRef },
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

  const drawStroke = useCallback(
    (
      slot: CanvasSlot,
      from: { x: number; y: number },
      to: { x: number; y: number },
    ) => {
      const { visible, mirror } = getRefsForSlot(slot);
      for (const ref of [visible, mirror]) {
        const ctx = ref.current?.getContext("2d");
        if (!ctx) continue;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    },
    [getRefsForSlot],
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
        const canvas = tensCanvasRef.current;
        if (!canvas) return;
        lastPos.current = getPos(e, canvas);
      },
    [getPos],
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
        const canvas = unitsCanvasRef.current;
        if (!canvas) return;
        lastPos.current = getPos(e, canvas);
      },
    [getPos],
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
        const canvas = tensCanvasRef.current;
        if (!canvas) return;
        const pos = getPos(e, canvas);
        drawStroke("tens", lastPos.current!, pos);
        lastPos.current = pos;
      },
    [getPos, drawStroke],
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
        const canvas = unitsCanvasRef.current;
        if (!canvas) return;
        const pos = getPos(e, canvas);
        drawStroke("units", lastPos.current!, pos);
        lastPos.current = pos;
      },
    [getPos, drawStroke],
  );

  const clearAll = useCallback(() => {
    if (tensCanvasRef.current) initCanvas(tensCanvasRef.current);
    if (unitsCanvasRef.current) initCanvas(unitsCanvasRef.current);
    if (tensMirrorRef.current) initMirrorCanvas(tensMirrorRef.current);
    if (unitsMirrorRef.current) initMirrorCanvas(unitsMirrorRef.current);
  }, [initCanvas, initMirrorCanvas]);

  const handleSubmit = useCallback(async () => {
    if (!model) {
      console.log("Model not loaded yet");
      return;
    }

    const [tensDigit, unitsDigit] = await Promise.all([
      predictFromCanvas(tensMirrorRef.current!, model),
      predictFromCanvas(unitsMirrorRef.current!, model),
    ]);

    const result = interpretDigits(tensDigit, unitsDigit);

    console.log(
      `Tens: ${tensDigit ?? "blank"}, Units: ${unitsDigit ?? "blank"} → ${result}`,
    );

    onSubmit?.(result);
    clearAll();
  }, [model, onSubmit, clearAll]);

  return (
    <div className={`number-canvas ${isComplete ? "complete" : ""}`}>
      <p>{modelStatus}</p>
      {/* Hidden mirror canvases — not rendered visually, used for inference */}
      <div className="hidden-canvas">
        <canvas ref={tensMirrorRef} width={canvasWidth} height={canvasHeight} />
        <canvas
          ref={unitsMirrorRef}
          width={canvasWidth}
          height={canvasHeight}
        />
      </div>
      <div className="canvas-container">
        <div>
          <p>Tens</p>
          <canvas
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
          <p>Units</p>
          <canvas
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
      <div className="button-container">
        <button className="canvas-button" onClick={clearAll}>
          Clear
        </button>
        <button className="canvas-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default NumberCanvas;
