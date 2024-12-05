import { TextLineStream } from "@std/streams";

type Rule = [number, number];

const stdinLines = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream());

const rules: Rule[] = [];
const updates: number[][] = [];

let readingRules = true;
for await (const line_ of stdinLines) {
  const line = line_.trim();
  if (line === "") {
    readingRules = false;
    continue;
  }

  if (readingRules) {
    const split = line.split("|").map((v) => parseInt(v));
    rules.push([split[0], split[1]]);
  } else {
    const split = line.split(",").map((v) => parseInt(v));
    updates.push(split);
  }
}

const satisfyAllRules = function (update: number[]): boolean {
  for (const rule of rules) {
    const index1 = update.indexOf(rule[0]);
    const index2 = update.indexOf(rule[1]);
    if (index1 === -1 || index2 === -1) continue;
    if (index1 >= index2) return false;
  }
  return true;
};

const validUpdates = updates.filter(satisfyAllRules);
const validSum = validUpdates
  .map((arr) => arr[Math.floor(arr.length / 2)])
  .reduce((sum, val) => sum + val);

console.log("valid:", validSum);

const invalidUpdates = updates.filter((update) => !satisfyAllRules(update));
const cmpTable: Record<number, Record<number, number>> = {};
for (const rule of rules) {
  if (!cmpTable[rule[0]]) cmpTable[rule[0]] = {};
  if (!cmpTable[rule[1]]) cmpTable[rule[1]] = {};
  cmpTable[rule[0]][rule[1]] = -1;
  cmpTable[rule[1]][rule[0]] = 1;
}

const sortUpdate = function (updates: number[]) {
  return updates.toSorted((a, b) => {
    return cmpTable[a]?.[b] ?? 0;
  });
};

const invalidSum = invalidUpdates
  .map(sortUpdate)
  .map((arr) => arr[Math.floor(arr.length / 2)])
  .reduce((sum, val) => sum + val);

console.log("invalid:", invalidSum);
