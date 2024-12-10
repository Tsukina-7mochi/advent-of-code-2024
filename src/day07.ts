import { TextLineStream } from "@std/streams";

type Test = {
  target: number;
  numbers: number[];
  operators: ("+" | "*" | "||")[];
};

function* permutation<T>(values: readonly T[], length: number) {
  const indices = Array.from({ length }, () => 0);

  while (true) {
    yield indices.map((v) => values[v]);

    for (let i = length - 1; i >= 0; i--) {
      indices[i] += 1;
      if (indices[i] === values.length) {
        indices[i] = 0;
        if (i === 0) return;
      } else {
        break;
      }
    }
  }
}

const operatorSet = ["+", "*", "||"] as const;
const tests = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream())
  .pipeThrough(
    new TransformStream<string, Test>({
      transform(line_, controller) {
        const line = line_.trim();
        const splitter = line.indexOf(":");
        const target = parseInt(line.slice(0, splitter));
        const numbers = line.slice(splitter + 2).split(/\s+/).map((v) =>
          parseInt(v)
        );

        for (const operators of permutation(operatorSet, numbers.length - 1)) {
          let result = numbers[0];
          for (let i = 1; i < numbers.length; i++) {
            if (operators[i - 1] === "+") {
              result = result + numbers[i];
            } else if (operators[i - 1] === "*") {
              result = result * numbers[i];
            } else if (operators[i - 1] === "||") {
              result = parseInt(`${result}${numbers[i]}`);
            }
          }

          if (result === target) {
            controller.enqueue({ target, numbers, operators });
            return;
          }
        }
      },
    }),
  );

let sum = 0;
for await (const test of tests) {
  // console.log(test);
  sum += test.target;
}
console.log(sum);
