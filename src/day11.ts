let input = "";
for await (
  const chunk of Deno.stdin.readable.pipeThrough(new TextDecoderStream())
) {
  input += chunk;
}

const alterStones = function (stones: number[]): number[] {
  return stones.flatMap((stone) => {
    const stoneString = stone.toString();
    if (stone === 0) {
      return [1];
    } else if (stoneString.length % 2 === 0) {
      return [
        parseInt(stoneString.slice(0, stoneString.length / 2)),
        parseInt(stoneString.slice(stoneString.length / 2)),
      ];
    } else {
      return [stone * 2024];
    }
  });
};

const cachedNumStonesAfterBlink = new Map<string, number>();
const numStonesAfterBlink = function (
  stones: number[],
  blinks: number,
): number {
  if (blinks === 0) return stones.length;
  const cacheKey = `${stones.join(",")}:${blinks}`;
  const cacheValue = cachedNumStonesAfterBlink.get(cacheKey);
  if (cacheValue !== undefined) {
    return cacheValue;
  }

  const newStones = alterStones(stones);
  // execute for each stone to utilize cache
  // const numStones = numStonesAfterBlink(newStones, blinks - 1);
  const numStones = newStones.reduce(
    (sum, stone) => sum + numStonesAfterBlink([stone], blinks - 1),
    0,
  );
  cachedNumStonesAfterBlink.set(cacheKey, numStones);
  return numStones;
};

// const numBlinks = 25;
const numBlinks = 75;
const stones = input.trim().split(/\s+/).map((v) => parseInt(v));
console.log("Number of stones:", numStonesAfterBlink(stones, numBlinks));
// console.log("Number of caches:", cachedNumStonesAfterBlink.size);
