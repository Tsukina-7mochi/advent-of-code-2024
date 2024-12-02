import { TextLineStream } from "@std/streams";

const reportToLevelsStream = new TransformStream<string, number[]>({
  transform(chunk, controller) {
    const levels = chunk.trim().split(/\s+/).map((v) => parseInt(v));
    controller.enqueue(levels);
  },
});

const isSafeReport = function (report: number[]) {
  const monoInc = report
    .map((v, i, arr) => i === 0 || arr[i - 1] < v)
    .every((v) => v);
  const monoDec = report
    .map((v, i, arr) => i === 0 || arr[i - 1] > v)
    .every((v) => v);
  const maxDiff = report
    .map((v, i, arr) => i === 0 ? 0 : Math.abs(v - arr[i - 1]))
    .reduce((max, val) => Math.max(max, val));
  return (monoInc || monoDec) && maxDiff <= 3;
};

class FilterReportSTream extends TransformStream<number[], number[]> {
  constructor(damp: boolean) {
    super({
      transform(report, controller) {
        if (isSafeReport(report)) {
          controller.enqueue(report);
          return;
        }

        if (!damp) return;

        for (let i = 0; i < report.length; i++) {
          const partialReport = report.toSpliced(i, 1);
          if (isSafeReport(partialReport)) {
            controller.enqueue(report);
            break;
          }
        }
      },
    });
  }
}

const filterReportStream = new TransformStream<number[], number[]>({});

const safeReports = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream())
  .pipeThrough(reportToLevelsStream)
  .pipeThrough(new FilterReportSTream(true));

let count = 0;
for await (const report of safeReports) {
  console.log(report);
  count += 1;
}
console.log("Safe report number:", count);
