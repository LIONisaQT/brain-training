export type PositionedNumber = {
  id: string;
  value: number;
  style: React.CSSProperties;
};

const MIN_FONT_SIZE_REM = 1.8;
const MAX_FONT_SIZE_REM = 4.2;
const FIELD_PADDING_PERCENT = 5;

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const rectsOverlap = (
  a: { left: number; top: number; width: number; height: number },
  b: { left: number; top: number; width: number; height: number },
) =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height;

export const buildPositionedNumbers = (
  numbers: number[],
): PositionedNumber[] => {
  const placedRects: Array<{
    left: number;
    top: number;
    width: number;
    height: number;
  }> = [];

  return numbers.map((value, index) => {
    const fontSize = randomBetween(MIN_FONT_SIZE_REM, MAX_FONT_SIZE_REM);
    const width = Math.max(8, fontSize * 4.5);
    const height = Math.max(8, fontSize * 2.5);
    const maxLeft = 100 - width - FIELD_PADDING_PERCENT;
    const maxTop = 100 - height - FIELD_PADDING_PERCENT;
    let left = FIELD_PADDING_PERCENT;
    let top = FIELD_PADDING_PERCENT;
    let attempts = 0;

    while (attempts < 200) {
      left = randomBetween(
        FIELD_PADDING_PERCENT,
        Math.max(FIELD_PADDING_PERCENT, maxLeft),
      );
      top = randomBetween(
        FIELD_PADDING_PERCENT,
        Math.max(FIELD_PADDING_PERCENT, maxTop),
      );
      const rect = { left, top, width, height };
      if (!placedRects.some((existing) => rectsOverlap(existing, rect))) {
        placedRects.push(rect);
        break;
      }
      attempts += 1;
    }

    if (attempts >= 200) {
      const gridX = (index % 5) * 18 + FIELD_PADDING_PERCENT;
      const gridY = Math.floor(index / 5) * 18 + FIELD_PADDING_PERCENT;
      left = Math.min(maxLeft, gridX);
      top = Math.min(maxTop, gridY);
      placedRects.push({ left, top, width, height });
    }

    const zIndex = value;

    return {
      id: `${value}-${index}`,
      value,
      style: {
        left: `${left}%`,
        top: `${top}%`,
        fontSize: `${fontSize}rem`,
        zIndex,
      },
    };
  });
};

export const generateNumbers = (
  total: number = 10,
  lowest: number = 0,
  highest: number = 20,
): number[] => {
  if (total <= 0) return [];

  const min = Math.ceil(lowest);
  const max = Math.floor(highest);
  if (min > max) return [];

  const highestValue = max;
  const lowerRange = highestValue - min;

  const result: number[] = [highestValue];
  while (result.length < total && lowerRange > 0) {
    const randomLower = min + Math.floor(Math.random() * lowerRange);
    result.push(randomLower);
  }

  return result;
};
