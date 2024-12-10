import { TextLineStream } from "@std/streams";

const stdinLines = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream());

const map: string[][] = [];
for await (const line of stdinLines) {
  map.push(line.split(""));
}
const mapRows = map.length;
const mapCols = map[0].length;

type Antenna = { x: number; y: number; freq: string };
const antennas: Antenna[] = [];
for (let y = 0; y < mapRows; y++) {
  for (let x = 0; x < mapCols; x++) {
    if (map[y][x] !== ".") {
      antennas.push({ x, y, freq: map[y][x] });
    }
  }
}

type Antinode = { x: number; y: number };
const antinodesOf = function* (antennas: Antenna[]): Generator<Antinode> {
  for (let i = 0; i < antennas.length; i++) {
    for (let j = i + 1; j < antennas.length; j++) {
      const diffX = antennas[i].x - antennas[j].x;
      const diffY = antennas[i].y - antennas[j].y;

      let dist = 0;
      while (true) {
        const x = antennas[i].x + dist * diffX;
        const y = antennas[i].y + dist * diffY;

        if (x < 0 || x >= mapCols) break;
        if (y < 0 || y >= mapRows) break;
        yield { x, y };

        dist += 1;
      }

      dist = 0;
      while (true) {
        const x = antennas[j].x - dist * diffX;
        const y = antennas[j].y - dist * diffY;

        if (x < 0 || x >= mapCols) break;
        if (y < 0 || y >= mapRows) break;
        yield { x, y };

        dist += 1;
      }
    }
  }
};

const freqs = Array.from(new Set(antennas.map((antenna) => antenna.freq)));
const antinodesMap = new Map<string, Antinode>();
for (const freq of freqs) {
  for (const antinode of antinodesOf(antennas.filter((a) => a.freq == freq))) {
    antinodesMap.set(`${antinode.x}.${antinode.y}`, antinode);
  }
}
const antinodes = Array.from(antinodesMap.values());

const mapRender = structuredClone(map);
for (const antinode of antinodes) {
  if (mapRender[antinode.y][antinode.x] === ".") {
    mapRender[antinode.y][antinode.x] = "#";
  }
}

console.log(mapRender.map((v) => v.join("")).join("\n"));
console.log(`${antinodes.length} antinodes`);
