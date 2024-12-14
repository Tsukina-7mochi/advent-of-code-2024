import { TextLineStream } from "@std/streams";
import { asyncIteratorToArray } from "./util.ts";

const roomWidth = 101;
const roomHeight = 103;

type Vec2 = { x: number; y: number };
class Robot {
  position: Vec2;
  velocity: Vec2;

  constructor(px: number, py: number, vx: number, vy: number) {
    this.position = { x: px, y: py };
    this.velocity = { x: vx, y: vy };
  }

  walked(): Robot {
    return new Robot(
      (this.position.x + this.velocity.x + roomWidth) % roomWidth,
      (this.position.y + this.velocity.y + roomHeight) % roomHeight,
      this.velocity.x,
      this.velocity.y,
    );
  }
}

const robotsMap = function (robots: Robot[]): string {
  const board = Array.from({ length: roomHeight }, () => {
    return Array.from({ length: roomWidth }, () => 0);
  });
  for (const robot of robots) {
    board[robot.position.y][robot.position.x] += 1;
  }
  return board
    .map((row) => row.map((v) => v === 0 ? "." : v).join(""))
    .join("\n");
};

const calcSafetyScore = function (robots: Robot[]): number {
  let sum1 = 0;
  let sum2 = 0;
  let sum3 = 0;
  let sum4 = 0;
  for (const robot of robots) {
    if (robot.position.x < (roomWidth - 1) / 2) {
      if (robot.position.y < (roomHeight - 1) / 2) {
        sum1 += 1;
      } else if (robot.position.y > (roomHeight - 1) / 2) {
        sum2 += 1;
      }
    } else if (robot.position.x > (roomWidth - 1) / 2) {
      if (robot.position.y < (roomHeight - 1) / 2) {
        sum3 += 1;
      } else if (robot.position.y > (roomHeight - 1) / 2) {
        sum4 += 1;
      }
    }
  }
  return sum1 * sum2 * sum3 * sum4;
};

const linePattern = /p=([+-]?\d+),([+-]?\d+) v=([+-]?\d+),([+-]?\d+)/;
const input = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream());
let robots = (await asyncIteratorToArray(input))
  .map((line): Robot => {
    const match = line.match(linePattern);
    if (!match) throw (`Failed to parse line: ${line}`);
    return new Robot(
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      parseInt(match[4]),
    );
  });

for (let i = 0; i < 100; i++) {
  robots = robots.map((r) => r.walked());
}

console.log(robots);
console.log(robotsMap(robots));
console.log(calcSafetyScore(robots));
