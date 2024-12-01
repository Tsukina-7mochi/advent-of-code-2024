import { TextLineStream } from "@std/streams";

const stream = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream())
  .pipeThrough(
    new TransformStream<string, [number, number]>({
      transform(chunk, controller) {
        const split = chunk.trim().split(/\s+/);
        controller.enqueue([parseInt(split[0]), parseInt(split[1])]);
      },
    }),
  );

const ids1: number[] = [];
const ids2: number[] = [];
for await (const [id1, id2] of stream) {
  ids1.push(id1);
  ids2.push(id2);
}
ids1.sort();
ids2.sort();

if (ids1.length !== ids2.length) {
  throw new Error("Input lengths do not match");
}

let sumDistance = 0;
for (let i = 0; i < ids1.length; i++) {
  sumDistance += Math.abs(ids1[i] - ids2[i]);
}

console.log("Sum of distance:", sumDistance);

let similarity = 0;
let index1 = 0;
let index2 = 0;
while (true) {
  if (ids1[index1] === ids2[index2]) {
    similarity += ids1[index1];
    index2 += 1;
  } else if (ids1[index1] < ids2[index2]) {
    index1 += 1;
  } else if (ids1[index1] > ids2[index2]) {
    index2 += 1;
  }

  if (index1 >= ids1.length || index2 >= ids2.length) {
    break;
  }
}

console.log("Similarity:", similarity);
