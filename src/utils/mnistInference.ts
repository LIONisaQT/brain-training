import * as tf from "@tensorflow/tfjs";

export const MODEL_URL = "/mnist_model/model.json";

export async function loadMnistModel(): Promise<tf.LayersModel> {
  return tf.loadLayersModel(MODEL_URL);
}

/**
 * Crops and centers the drawn content of a canvas, scales it to 28x28,
 * and runs MNIST inference. Returns the predicted digit (0–9), or null
 * if the canvas appears blank.
 */
export async function predictFromCanvas(
  canvas: HTMLCanvasElement,
  model: tf.LayersModel,
): Promise<number | null> {
  const offscreen = document.createElement("canvas");
  offscreen.width = 28;
  offscreen.height = 28;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) throw new Error("Could not get offscreen context");

  // Find bounding box of drawn pixels
  const srcCtx = canvas.getContext("2d");
  if (!srcCtx) throw new Error("Could not get source canvas context");
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

  // Draw cropped digit centered into 28x28
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

  const predictionTensor = model.predict(input) as tf.Tensor;
  const probabilities = await predictionTensor.data();
  const digit = Array.from(probabilities).indexOf(
    Math.max(...Array.from(probabilities)),
  );

  input.dispose();
  predictionTensor.dispose();

  return digit;
}

/**
 * Combines tens and units digit predictions into a final number.
 *
 * - Both null  → 0
 * - One null   → the other digit as-is
 * - Both set   → concatenated (e.g. tens=3, units=7 → 37)
 */
export function interpretDigits(
  tensDigit: number | null,
  unitsDigit: number | null,
): number {
  if (tensDigit === null && unitsDigit === null) return 0;
  if (tensDigit === null) return unitsDigit!;
  if (unitsDigit === null) return tensDigit;
  return tensDigit * 10 + unitsDigit;
}
