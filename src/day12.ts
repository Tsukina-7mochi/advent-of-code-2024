import { TextLineStream } from "@std/streams/text-line-stream";
import { asyncIteratorToArray } from "./util.ts";

const input = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream())
  .pipeThrough(
    new TransformStream<string, string[]>({
      transform(line, controller) {
        controller.enqueue([...line.trim()]);
      },
    }),
  );

const map = await asyncIteratorToArray(input);
const mapWidth = map[0]?.length ?? 0;
const mapHeight = map.length;

const regions = function* <T>(map: T[][]): Generator<[T, boolean[][]]> {
  const mapWidth = map[0].length;
  const mapHeight = map.length;
  const visited = map.map((row) => row.map(() => false));

  const searchRegion = function* (
    x: number,
    y: number,
    value: T,
  ): Generator<{ x: number; y: number }> {
    if (x < 0 || x >= mapWidth) return;
    if (y < 0 || y >= mapHeight) return;
    if (map[y][x] !== value) return;
    if (visited[y][x]) return;

    visited[y][x] = true;

    yield { x, y };
    yield* searchRegion(x - 1, y, value);
    yield* searchRegion(x + 1, y, value);
    yield* searchRegion(x, y - 1, value);
    yield* searchRegion(x, y + 1, value);
  };

  for (let y = 0; y < mapWidth; y++) {
    for (let x = 0; x < mapHeight; x++) {
      if (visited[y][x]) continue;

      const mask = map.map((row) => row.map(() => false));
      for (const point of searchRegion(x, y, map[y][x])) {
        mask[point.y][point.x] = true;
      }
      yield [map[y][x], mask];
    }
  }
};

const calcArea = function (mask: boolean[][]): number {
  const reduceRow = (mask: boolean[]) =>
    mask.reduce((sum, v) => sum + (v ? 1 : 0), 0);
  return mask.reduce((sum, row) => sum + reduceRow(row), 0);
};

const calcPerimiter = function (mask: boolean[][]): number {
  const width = mask[0].length;
  const height = mask.length;

  const newMask = [
    Array.from({ length: mask[0].length + 2 }, () => false),
    ...mask.map((row) => [false, ...row, false]),
    Array.from({ length: mask[0].length + 2 }, () => false),
  ];

  let perimeters = 0;
  for (let y = 1; y < width + 1; y++) {
    for (let x = 1; x < height + 1; x++) {
      if (!newMask[y][x]) continue;
      if (!newMask[y][x - 1]) perimeters += 1;
      if (!newMask[y][x + 1]) perimeters += 1;
      if (!newMask[y - 1][x]) perimeters += 1;
      if (!newMask[y + 1][x]) perimeters += 1;
    }
  }

  return perimeters;
};

const calcSides = function (mask: boolean[][]): number {
  const width = mask[0].length;
  const height = mask.length;

  const newMask = [
    Array.from({ length: mask[0].length + 2 }, () => false),
    ...mask.map((row) => [false, ...row, false]),
    Array.from({ length: mask[0].length + 2 }, () => false),
  ];

  let sides = 0;
  for (let y = 1; y < width + 1; y++) {
    for (let x = 1; x < height + 1; x++) {
      if (!newMask[y][x]) continue;
      // count if only when the cell is the top/center of each side
      if (
        !newMask[y][x - 1] && !(newMask[y - 1][x] && !newMask[y - 1][x - 1])
      ) sides += 1;
      if (
        !newMask[y][x + 1] && !(newMask[y - 1][x] && !newMask[y - 1][x + 1])
      ) sides += 1;
      if (
        !newMask[y - 1][x] && !(newMask[y][x - 1] && !newMask[y - 1][x - 1])
      ) sides += 1;
      if (
        !newMask[y + 1][x] && !(newMask[y][x - 1] && !newMask[y + 1][x - 1])
      ) sides += 1;
    }
  }

  return sides;
};

let sumPrice = 0;
for (const [plantType, mask] of regions(map)) {
  const area = calcArea(mask);
  // const perimeter = calcPerimiter(mask);
  // console.log(plantType, area, perimeter, area * perimeter);
  // sumPrice += area * perimeter;

  const sides = calcSides(mask);
  console.log(plantType, area, sides, area * sides);
  sumPrice += area * sides;

  // const maskStr = mask.map(
  //   (row) => row.map((v) => v ? "#" : ".").join(""),
  // ).join("\n");
  // console.log(maskStr);
}

console.log("Sum of prices:", sumPrice);
