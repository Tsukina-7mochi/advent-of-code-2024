const inputStream = Deno.stdin.readable
  .pipeThrough(new TextDecoderStream());

let input = "";
for await (const chunk of inputStream) {
  input += chunk;
}

type Disk = (number | null)[];

let disk: Disk = [];
let isBlank = false;
let fileId = 0;
for (const v of input.trim()) {
  if (isBlank) {
    disk = disk.concat(Array.from({ length: parseInt(v) }, () => null));
  } else {
    disk = disk.concat(Array.from({ length: parseInt(v) }, () => fileId));
    fileId += 1;
  }
  isBlank = !isBlank;
}

const compactDisk = function (disk: Disk): Disk {
  const newDisk = disk.concat();

  for (let i = disk.length - 1; i >= 0; i--) {
    if (newDisk[i] === null) continue;

    const firstBlank = newDisk.indexOf(null);
    if (firstBlank >= i) break;
    newDisk[firstBlank] = newDisk[i];
    newDisk[i] = null;
  }

  return newDisk;
};

const calcChecksum = function (disk: Disk): number {
  return disk.reduce<number>((sum, v, i) => sum + (v ?? 0) * i, 0);
};

const compactedDisk = compactDisk(disk);
console.log(calcChecksum(compactedDisk));
