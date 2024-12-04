const stdin = Deno.stdin.readable.pipeThrough(new TextDecoderStream());
let input = "";
for await (const chunk of stdin) {
  input += chunk;
}

const toCharCodes = function (str: string): number[] {
  return Array.from({ length: str.length }, (_, i) => str.charCodeAt(i));
};

const board = input
  .trim()
  .split("\n")
  .map(toCharCodes);

const xmas = toCharCodes("XMAS");
const _ = Symbol("empty");
// const patterns = [
//   [[0, 1, 2, 3]],
//   [[3, 2, 1, 0]],
//   [[0], [1], [2], [3]],
//   [[3], [2], [1], [0]],
//   [[0, _, _, _], [_, 1, _, _], [_, _, 2, _], [_, _, _, 3]],
//   [[_, _, _, 0], [_, _, 1, _], [_, 2, _, _], [3, _, _, _]],
//   [[3, _, _, _], [_, 2, _, _], [_, _, 1, _], [_, _, _, 0]],
//   [[_, _, _, 3], [_, _, 2, _], [_, 1, _, _], [0, _, _, _]],
// ];
const patterns = [
  [[1, _, 1], [_, 2, _], [3, _, 3]],
  [[1, _, 3], [_, 2, _], [1, _, 3]],
  [[3, _, 1], [_, 2, _], [3, _, 1]],
  [[3, _, 3], [_, 2, _], [1, _, 1]],
];

let sum = 0;
for (const pattern of patterns) {
  for (let y = 0; y < board.length - pattern.length + 1; y++) {
    for (let x = 0; x < board[0].length - pattern[0].length + 1; x++) {
      let match = true;

      pattern_loop: for (let j = 0; j < pattern.length; j++) {
        for (let i = 0; i < pattern[0].length; i++) {
          if (pattern[j][i] === _) continue;
          if (xmas[pattern[j][i] as number] !== board[y + j][x + i]) {
            match = false;
            break pattern_loop;
          }
        }
      }

      if (match) {
        // console.log(pattern, x, y);
        sum += 1;
      }
    }
  }
}

console.log(sum);
