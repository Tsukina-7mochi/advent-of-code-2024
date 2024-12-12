import { reduceAsyncIterator } from "./util.ts";

const inputStream = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream());
const input = await reduceAsyncIterator(inputStream, (sum, v) => sum + v, "");

type File = { id: number | null; size: number };

const disk: File[] = [...input.trim()].map((v, i) => {
  if (i % 2 === 0) {
    return { id: i / 2, size: parseInt(v) };
  } else {
    return { id: null, size: parseInt(v) };
  }
});

const diskContents = function (disk: File[]): (number | null)[] {
  return disk.flatMap((f) => Array.from({ length: f.size }, () => f.id));
};

const diskCheckSum = function (disk: File[]): number {
  return diskContents(disk).reduce<number>(
    (sum, v, i) => sum + (v ?? 0) * i,
    0,
  );
};

const collapseDiskContents = function (disk: File[]): void {
  while (true) {
    let updated = false;
    for (let i = 0; i < disk.length; i++) {
      if (disk[i].size === 0) {
        disk.splice(i, 1);
        updated = true;
        break;
      }
      if (disk[i].id === disk[i + 1]?.id) {
        disk.splice(i, 2, {
          id: disk[i].id,
          size: disk[i].size + disk[i + 1].size,
        });
        updated = true;
        break;
      }
    }

    if (!updated) break;
  }
};

const compactDisk = function (disk: File[]): void {
  const maxId = disk.findLast((f) => f.id !== null)?.id ?? -1;
  for (let id = maxId; id >= 0; id--) {
    collapseDiskContents(disk);

    const fileIndex = disk.findIndex((f) => f.id === id);
    const file = disk[fileIndex];

    const blankIndex = disk.findIndex((v) =>
      v.id === null && v.size >= file.size
    );
    if (blankIndex === -1 || blankIndex >= fileIndex) continue;
    const blank = disk[blankIndex];

    disk.splice(
      fileIndex,
      1,
      { id: null, size: file.size },
    );
    disk.splice(
      blankIndex,
      1,
      { ...file },
      { id: null, size: blank.size - file.size },
    );
  }
};

compactDisk(disk);
// console.log(diskContents(disk).map((v) => v === null ? "." : `${v}`).join(""));
console.log("Disk checksum:", diskCheckSum(disk));
