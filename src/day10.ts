import { TextLineStream } from "@std/streams";

const input = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream())
  .pipeThrough(
    new TransformStream<string, number[]>({
      transform(line, controller) {
        controller.enqueue(line.trim().split("").map((v) => parseInt(v)));
      },
    }),
  );

const map: number[][] = [];
for await (const row of input) {
  map.push(row);
}
const mapHeight = map.length;
const mapWidth = map?.[0].length ?? 0;

const calcTailheadScore = function (x: number, y: number): number {
  const visited = new Set<string>();
  const search = function (x: number, y: number, value: number): number {
    if (x < 0 || x >= mapWidth) return 0;
    if (y < 0 || y >= mapHeight) return 0;
    if (map[y][x] !== value) return 0;

    // uncomment below 3 lines for part 1
    // const key = `${x},${y}`;
    // if (visited.has(key)) return 0;
    // visited.add(key);

    if (value === 9) return 1;

    let score = 0;
    score += search(x - 1, y, value + 1);
    score += search(x + 1, y, value + 1);
    score += search(x, y - 1, value + 1);
    score += search(x, y + 1, value + 1);

    return score;
  };
  return search(x, y, 0);
};

let sumScore = 0;
for (let y = 0; y < mapHeight; y++) {
  for (let x = 0; x < mapWidth; x++) {
    if (map[y][x] !== 0) continue;
    const score = calcTailheadScore(x, y);
    sumScore += score;
    // console.log(x, y, score);
  }
}

console.log(`Sum of tailhead scores:`, sumScore);
