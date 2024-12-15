import { reduceAsyncIterator } from "./util.ts";

type Machine = {
  aX: number;
  aY: number;
  bX: number;
  bY: number;
  prizeX: number;
  prizeY: number;
};

const entryPattern =
  /Button A: X\+(\d+), Y\+(\d+)\nButton B: X\+(\d+), Y\+(\d+)\nPrize: X=(\d+), Y=(\d+)/;

const stdin = Deno.stdin.readable.pipeThrough(new TextDecoderStream());
const input = await reduceAsyncIterator(stdin, (sum, v) => sum + v, "");
const entries = input.trim().split("\n\n");
const machines = entries.map((entry): Machine => {
  const match = entry.match(entryPattern);
  if (match === null) throw Error(`Failed to parse ${entry}`);
  return {
    aX: parseInt(match[1]),
    aY: parseInt(match[2]),
    bX: parseInt(match[3]),
    bY: parseInt(match[4]),
    prizeX: parseInt(match[5]),
    prizeY: parseInt(match[6]),
  };
});

const movesToPrive = function (machine: Machine): [number, number] | null {
  const det = machine.aX * machine.bY - machine.aY * machine.bX;
  if (det === 0) {
    console.log("no ans");
    return null;
  }
  const coef = [
    [machine.bY, -machine.bX],
    [-machine.aY, machine.aX],
  ];
  const b = [machine.prizeX, machine.prizeY];
  const result: [number, number] = [
    (coef[0][0] * b[0] + coef[0][1] * b[1]) / det,
    (coef[1][0] * b[0] + coef[1][1] * b[1]) / det,
  ];
  if (Number.isInteger(result[0]) && Number.isInteger(result[1])) {
    return result;
  }
  return null;
};

const costs = machines
  .map(movesToPrive)
  .filter((v) => v !== null)
  .filter(([a, b]) => a + b <= 100)
  .map(([a, b]) => a * 3 + b);
console.log(costs);
const result = costs.reduce((sum, v) => sum + v);

console.log(machines);
console.log(result);
