import { reduceAsyncIterator, Vec2 } from "./util.ts";

const stdin = Deno.stdin.readable.pipeThrough(new TextDecoderStream());
const input = await reduceAsyncIterator(stdin, (sum, v) => sum + v, "");
const inputSplit = input.split("\n\n");
const mapInput = inputSplit[0].trim()
  .replace(/#/g, "##")
  .replace(/O/g, "[]")
  .replace(/\./g, "..")
  .replace(/@/g, "@.");
const movesInput = inputSplit[1].replace(/\s/g, "");

type Direction = "<" | ">" | "^" | "v";
class Warehouse {
  private robot: Vec2;
  private walls: boolean[][];
  private boxes: Vec2[];

  private constructor(
    robot: Vec2,
    walls: boolean[][],
    boxes: Vec2[],
  ) {
    this.robot = robot;
    this.walls = walls;
    this.boxes = boxes;
  }

  static parse(mapInput: string): Warehouse {
    const map = mapInput.split("\n")
      .map((line) => [...line]);
    const walls = map.map((row) => row.map((v) => v === "#"));

    let robot = { x: 0, y: 0 };
    const boxes = [];
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === "[") {
          boxes.push({ x, y });
        } else if (map[y][x] === "@") {
          robot = { x, y };
        }
      }
    }

    return new Warehouse(robot, walls, boxes);
  }

  pushBox(x: number, y: number, dx: number, dy: number): boolean {
    const boxIndex = this.boxes.findIndex((box) => {
      return (box.x === x && box.y === y) || (box.x === x - 1 && box.y === y);
    });
    if (boxIndex === -1) return true;

    const boxIndicesToPush = new Set<number>();
    const queue = [boxIndex];
    while (queue.length > 0) {
      const boxIndex = queue.pop()!;
      if (boxIndicesToPush.has(boxIndex)) continue;

      const box = this.boxes[boxIndex];
      const x = box.x + dx;
      const y = box.y + dy;

      if (this.walls[y][x] || this.walls[y][x + 1]) {
        return false;
      }

      boxIndicesToPush.add(boxIndex);
      for (let i = 0; i < this.boxes.length; i++) {
        const box = this.boxes[i];
        if (box.y === y && Math.abs(box.x - x) <= 1) {
          queue.push(i);
        }
      }
    }

    for (const boxIndex of boxIndicesToPush) {
      this.boxes[boxIndex].x += dx;
      this.boxes[boxIndex].y += dy;
    }

    return true;
  }

  step(direction: Direction) {
    const dx = direction === "<" ? -1 : direction === ">" ? 1 : 0;
    const dy = direction === "^" ? -1 : direction === "v" ? 1 : 0;
    if (this.walls[this.robot.y + dy][this.robot.x + dx]) return;
    if (this.pushBox(this.robot.x + dx, this.robot.y + dy, dx, dy)) {
      this.robot.x += dx;
      this.robot.y += dy;
    }
  }

  mapString(): string {
    const map: string[][] = this.walls
      .map((row) => row.map((v) => v ? "#" : "."));

    map[this.robot.y][this.robot.x] = "@";
    for (const box of this.boxes) {
      map[box.y][box.x] = "[";
      map[box.y][box.x + 1] = "]";
    }

    return map.map((row) => row.join("")).join("\n");
  }

  sumBoxCoords(): number {
    return this.boxes.map((box) => box.x + box.y * 100).reduce((sum, v) =>
      sum + v
    );
  }
}

const warehouse = Warehouse.parse(mapInput);
console.log(warehouse.mapString());
console.log();

for (const move of movesInput) {
  console.log("Move:", move);
  warehouse.step(move as Direction);
  console.log(warehouse.mapString());
  console.log();
}

console.log(warehouse.sumBoxCoords());
