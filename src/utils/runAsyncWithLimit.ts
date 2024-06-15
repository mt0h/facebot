import wait from "@italodeandra/next/utils/wait";

export async function runAsyncWithLimit(
  asyncFunctions: (() => Promise<void>)[],
  limit: number
) {
  let running = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let responses: any[] = [];
  while (asyncFunctions.length) {
    if (running < limit) {
      running++;
      asyncFunctions
        .splice(0, 1)[0]()
        .then((res) => {
          responses.push(res);
          running--;
        })
        .catch(console.error);
    } else {
      await wait("100ms");
    }
  }
  while (running > 0) {
    await wait("100ms");
  }
  return responses;
}
