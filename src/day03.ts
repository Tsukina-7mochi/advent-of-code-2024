const stdin = Deno.stdin.readable.pipeThrough(new TextDecoderStream());
let input = "";
for await (const chunk of stdin) {
  input += chunk;
}

const ranges: [number, number][] = [];

let index = 0;
while (true) {
  const nextDont = input.indexOf("don't()", index);
  if (nextDont === -1) {
    ranges.push([index, input.length]);
    break;
  }

  ranges.push([index, nextDont]);

  index = input.indexOf("do()", nextDont);
  if (index === -1) break;
}

let sum = 0;
for (const mul of input.matchAll(/mul\(([0-9]{1,3}),([0-9]{1,3})\)/g)) {
  if (ranges.some(([start, end]) => mul.index >= start && mul.index < end)) {
    sum += parseInt(mul[1]) * parseInt(mul[2]);
  }
}

console.log(sum);
