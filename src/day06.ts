import { TextLineStream } from "@std/streams";

const mapStream = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream())
  .pipeThrough(
    new TransformStream<string, string[]>({
      transform(line, controller) {
        controller.enqueue(line.split(""));
      },
    }),
  );

const map: string[][] = [];
for await (const v of mapStream) {
  map.push(v);
}

let startX = -1;
let startY = -1;
findStart: for (let y = 0; y < map.length; y++) {
  for (let x = 0; x < map[0].length; x++) {
    if (map[y][x] === "^") {
      startX = x;
      startY = y;
      break findStart;
    }
  }
}

console.log(`Start: ${startX}, ${startY}`);

class Guard {
  x: number;
  y: number;
  direction: number;

  get key() {
    return `${this.x},${this.y},${this.direction}`;
  }
  get posKey() {
    return `${this.x},${this.y}`;
  }

  constructor(x: number, y: number, direction: number) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  forward() {
    this.x += [0, 1, 0, -1][this.direction];
    this.y += [-1, 0, 1, 0][this.direction];
  }

  backward() {
    this.x -= [0, 1, 0, -1][this.direction];
    this.y -= [-1, 0, 1, 0][this.direction];
  }

  turn() {
    this.direction = (this.direction + 1) % 4;
  }
}

const getNumVisited = function () {
  let guard = new Guard(startX, startY, 0);
  let visited = new Set<string>();
  let states = new Set<string>();

  while (true) {
    visited.add(guard.posKey);
    states.add(guard.key);
    guard.forward();

    if (guard.x < 0 || guard.x >= map[0].length) break;
    if (guard.y < 0 || guard.y >= map.length) break;

    if (map[guard.y][guard.x] !== "#") {
      if (states.has(guard.key)) throw Error("infinity loop");
    } else {
      guard.backward();
      guard.turn();
    }
  }

  return visited.size;
};

console.log("visited:", getNumVisited());

let possibleLoopCount = 0;
for (let y = 0; y < map.length; y++) {
  for (let x = 0; x < map[0].length; x++) {
    if (map[y][x] !== ".") continue;

    map[y][x] = "#";
    try {
      getNumVisited();
    } catch {
      possibleLoopCount += 1;
    }
    map[y][x] = ".";
  }
}

console.log("possible loops:", possibleLoopCount);
