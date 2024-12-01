const day = Deno.args[0].padStart(2, "0");
const command = new Deno.Command("/bin/bash", {
  args: ["-c", `cat input/day${day}.txt | deno run src/day${day}.ts`],
});
const process = command.spawn();
await process.status;
